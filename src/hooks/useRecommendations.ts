import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { lessonsData } from '../data/lessonsData';
import { storiesData } from '../data/storiesData';
import { curatedVideos } from '../data/videoConfig';

export interface Recommendation {
  type: 'lesson' | 'story' | 'video' | 'activity';
  id: string;
  title: string;
  emoji: string;
  route: string;
  score: number;
}

/**
 * Recommend content across lessons, stories, and videos using a simple
 * scoring algorithm that weighs category affinity, age match, novelty,
 * and recent activity.
 */
export function useRecommendations(playerId: number | undefined) {
  const profile = useLiveQuery(
    () => (playerId ? db.profiles.get(playerId) : undefined),
    [playerId],
  );

  const progress = useLiveQuery(
    () =>
      playerId
        ? db.progress.where('playerId').equals(playerId).toArray()
        : [],
    [playerId],
    [],
  );

  const lessonProgress = useLiveQuery(
    () =>
      playerId
        ? db.lessonProgress.where('playerId').equals(playerId).toArray()
        : [],
    [playerId],
    [],
  );

  const storyProgress = useLiveQuery(
    () =>
      playerId
        ? db.storyProgress.where('playerId').equals(playerId).toArray()
        : [],
    [playerId],
    [],
  );

  const audioProgress = useLiveQuery(
    () =>
      playerId
        ? db.audioProgress.where('playerId').equals(playerId).toArray()
        : [],
    [playerId],
    [],
  );

  const gameScores = useLiveQuery(
    () =>
      playerId
        ? db.gameScores.where('playerId').equals(playerId).toArray()
        : [],
    [playerId],
    [],
  );

  // ── Build category affinity map (how many interactions per category) ──
  const categoryEngagement: Record<string, number> = {};

  for (const p of progress) {
    categoryEngagement[p.category] =
      (categoryEngagement[p.category] ?? 0) + p.timesCompleted;
  }
  for (const lp of lessonProgress) {
    const lesson = lessonsData.find((l) => l.id === lp.lessonId);
    if (lesson) {
      categoryEngagement[lesson.topic] =
        (categoryEngagement[lesson.topic] ?? 0) + (lp.completed ? 1 : 0.5);
    }
  }
  for (const sp of storyProgress) {
    const story = storiesData.find((s) => s.id === sp.storyId);
    if (story) {
      categoryEngagement[story.category] =
        (categoryEngagement[story.category] ?? 0) + (sp.completed ? 1 : 0.5);
    }
  }
  for (const gs of gameScores) {
    categoryEngagement[gs.gameId] =
      (categoryEngagement[gs.gameId] ?? 0) + 1;
  }

  // Normalize engagement to 0-1 range
  const maxEngagement = Math.max(1, ...Object.values(categoryEngagement));

  // ── Build recent activity set (categories interacted with in last 7 days) ──
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentCategories = new Set<string>();

  for (const p of progress) {
    if (p.lastPracticedAt && p.lastPracticedAt.getTime() > sevenDaysAgo) {
      recentCategories.add(p.category);
    }
  }
  for (const lp of lessonProgress) {
    const ts = lp.completedAt ?? lp.startedAt;
    if (ts && ts.getTime() > sevenDaysAgo) {
      const lesson = lessonsData.find((l) => l.id === lp.lessonId);
      if (lesson) recentCategories.add(lesson.topic);
    }
  }
  for (const sp of storyProgress) {
    if (sp.lastReadAt && sp.lastReadAt.getTime() > sevenDaysAgo) {
      const story = storiesData.find((s) => s.id === sp.storyId);
      if (story) recentCategories.add(story.category);
    }
  }

  // ── Completed sets ──
  const completedLessons = new Set(
    lessonProgress.filter((lp) => lp.completed).map((lp) => lp.lessonId),
  );
  const completedStories = new Set(
    storyProgress.filter((sp) => sp.completed).map((sp) => sp.storyId),
  );

  const playerAgeGroup = profile?.ageGroup ?? '2-3';

  // ── Score each content item ──
  const recommendations: Recommendation[] = [];

  // Lessons
  for (const lesson of lessonsData) {
    const categoryAffinity =
      (categoryEngagement[lesson.topic] ?? 0) / maxEngagement;
    const ageMatch = lesson.ageGroup === playerAgeGroup ? 1 : 0;
    const novelty = completedLessons.has(lesson.id) ? 0 : 1;
    const recentActivity = recentCategories.has(lesson.topic) ? 1 : 0;

    const score =
      categoryAffinity * 3 +
      ageMatch * 5 +
      novelty * 2 +
      recentActivity * 1;

    recommendations.push({
      type: 'lesson',
      id: lesson.id,
      title: lesson.title,
      emoji: lesson.emoji,
      route: '/lessons',
      score,
    });
  }

  // Stories
  for (const story of storiesData) {
    const categoryAffinity =
      (categoryEngagement[story.category] ?? 0) / maxEngagement;
    const ageMatch = story.ageGroup === playerAgeGroup ? 1 : 0;
    const novelty = completedStories.has(story.id) ? 0 : 1;
    const recentActivity = recentCategories.has(story.category) ? 1 : 0;

    const score =
      categoryAffinity * 3 +
      ageMatch * 5 +
      novelty * 2 +
      recentActivity * 1;

    recommendations.push({
      type: 'story',
      id: story.id,
      title: story.title,
      emoji: story.emoji,
      route: '/stories',
      score,
    });
  }

  // Videos (no ageGroup on VideoItem, so we give partial age score based on category)
  const videoAgeHints: Record<string, string[]> = {
    'nursery-rhymes': ['2-3', '4-5'],
    bedtime: ['2-3', '4-5'],
    alphabet: ['2-3', '4-5'],
    numbers: ['2-3', '4-5', '6-8'],
    'colors-shapes': ['2-3', '4-5'],
    learning: ['4-5', '6-8'],
    animals: ['2-3', '4-5', '6-8'],
  };

  // Audio episodes listened to
  const listenedEpisodes = new Set(
    audioProgress.filter((ap) => ap.completed).map((ap) => ap.episodeId),
  );

  for (const video of curatedVideos) {
    const categoryAffinity =
      (categoryEngagement[video.category] ?? 0) / maxEngagement;
    const ageHint = videoAgeHints[video.category] ?? [];
    const ageMatch = ageHint.includes(playerAgeGroup) ? 1 : 0.3;
    // Videos are not tracked in completedLessons/completedStories,
    // so novelty is always 1 unless the player has watched it (we
    // don't have a direct "completed" flag, but give 1 for simplicity)
    const novelty = 1;
    const recentActivity = recentCategories.has(video.category) ? 1 : 0;

    const score =
      categoryAffinity * 3 +
      ageMatch * 5 +
      novelty * 2 +
      recentActivity * 1;

    // Derive emoji from category
    const categoryEmojis: Record<string, string> = {
      learning: '📖',
      'nursery-rhymes': '🎵',
      alphabet: '🔤',
      numbers: '🔢',
      'colors-shapes': '🎨',
      animals: '🐾',
      bedtime: '🌙',
    };

    recommendations.push({
      type: 'video',
      id: video.id,
      title: video.title,
      emoji: categoryEmojis[video.category] ?? '🎬',
      route: '/videos',
      score,
    });
  }

  // Sort by score descending, take top 10
  recommendations.sort((a, b) => b.score - a.score);
  const top = recommendations.slice(0, 10);

  return { recommendations: top };
}
