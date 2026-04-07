// ── Reward Configuration ────────────────────────────────
// Centralized reward rules, anti-exploit, extended badges.

import type { ContentType, RewardRule, ExtendedBadge } from './types';

// ── Reward Rules Per Content Type ───────────────────────

export const rewardRules: Record<ContentType, RewardRule> = {
  alphabet: { contentType: 'alphabet', starsPerCompletion: 1, firstCompletionBonus: 1, collectionBonus: 3, streakMultiplier: 1.5 },
  number: { contentType: 'number', starsPerCompletion: 1, firstCompletionBonus: 1, collectionBonus: 3, streakMultiplier: 1.5 },
  color: { contentType: 'color', starsPerCompletion: 1, firstCompletionBonus: 1, collectionBonus: 3, streakMultiplier: 1.5 },
  shape: { contentType: 'shape', starsPerCompletion: 1, firstCompletionBonus: 1, collectionBonus: 3, streakMultiplier: 1.5 },
  animal: { contentType: 'animal', starsPerCompletion: 1, firstCompletionBonus: 1, collectionBonus: 3, streakMultiplier: 1.5 },
  bodypart: { contentType: 'bodypart', starsPerCompletion: 1, firstCompletionBonus: 1, collectionBonus: 2, streakMultiplier: 1.5 },
  lesson: { contentType: 'lesson', starsPerCompletion: 3, firstCompletionBonus: 2, collectionBonus: 5, streakMultiplier: 2.0 },
  story: { contentType: 'story', starsPerCompletion: 2, firstCompletionBonus: 1, collectionBonus: 3, streakMultiplier: 1.5 },
  video: { contentType: 'video', starsPerCompletion: 1, firstCompletionBonus: 1, collectionBonus: 2, streakMultiplier: 1.0 },
  game: { contentType: 'game', starsPerCompletion: 2, firstCompletionBonus: 2, collectionBonus: 3, streakMultiplier: 2.0 },
  audio: { contentType: 'audio', starsPerCompletion: 1, firstCompletionBonus: 1, collectionBonus: 2, streakMultiplier: 1.0 },
  cooking: { contentType: 'cooking', starsPerCompletion: 3, firstCompletionBonus: 2, collectionBonus: 5, streakMultiplier: 1.5 },
  movement: { contentType: 'movement', starsPerCompletion: 2, firstCompletionBonus: 1, collectionBonus: 3, streakMultiplier: 1.5 },
  homeactivity: { contentType: 'homeactivity', starsPerCompletion: 3, firstCompletionBonus: 2, collectionBonus: 5, streakMultiplier: 1.5 },
  explorer: { contentType: 'explorer', starsPerCompletion: 2, firstCompletionBonus: 2, collectionBonus: 3, streakMultiplier: 2.0 },
  lifeskill: { contentType: 'lifeskill', starsPerCompletion: 2, firstCompletionBonus: 2, collectionBonus: 3, streakMultiplier: 1.5 },
  coloring: { contentType: 'coloring', starsPerCompletion: 2, firstCompletionBonus: 1, collectionBonus: 3, streakMultiplier: 1.0 },
  emotion: { contentType: 'emotion', starsPerCompletion: 1, firstCompletionBonus: 1, collectionBonus: 2, streakMultiplier: 1.0 },
  quiz: { contentType: 'quiz', starsPerCompletion: 2, firstCompletionBonus: 3, collectionBonus: 5, streakMultiplier: 2.0 },
};

// ── Anti-Exploit Settings ───────────────────────────────

/** Minimum seconds between star awards for the same content ID */
export const COOLDOWN_SECONDS = 30;

/** Maximum stars a player can earn in one day */
export const DAILY_STAR_CAP = 50;

// ── Extended Badge Definitions ──────────────────────────
// 13 existing badges + 12 new ones for collections, skills, playlists

export const extendedBadges: ExtendedBadge[] = [
  // ── Original 13 badges ──
  { id: 'first-star', name: 'First Star', emoji: '🌟', description: 'Earn your first star!', category: 'general', threshold: 1 },
  { id: 'star-collector', name: 'Star Collector', emoji: '✨', description: 'Earn 10 stars!', category: 'general', threshold: 10 },
  { id: 'super-star', name: 'Super Star', emoji: '💫', description: 'Earn 50 stars!', category: 'general', threshold: 50 },
  { id: 'mega-star', name: 'Mega Star', emoji: '🌠', description: 'Earn 100 stars!', category: 'general', threshold: 100 },
  { id: 'abc-starter', name: 'ABC Starter', emoji: '📖', description: 'Learn 5 letters!', category: 'abc', threshold: 5 },
  { id: 'abc-master', name: 'ABC Master', emoji: '🎓', description: 'Learn all 26 letters!', category: 'abc', threshold: 26 },
  { id: 'number-starter', name: 'Number Starter', emoji: '🔢', description: 'Learn 5 numbers!', category: 'numbers', threshold: 5 },
  { id: 'number-master', name: 'Number Master', emoji: '🧮', description: 'Learn all 20 numbers!', category: 'numbers', threshold: 20 },
  { id: 'color-starter', name: 'Color Starter', emoji: '🎨', description: 'Learn 5 colors!', category: 'colors', threshold: 5 },
  { id: 'color-master', name: 'Color Master', emoji: '🌈', description: 'Learn all 10 colors!', category: 'colors', threshold: 10 },
  { id: 'shape-master', name: 'Shape Master', emoji: '📐', description: 'Learn all 8 shapes!', category: 'shapes', threshold: 8 },
  { id: 'animal-lover', name: 'Animal Lover', emoji: '🐾', description: 'Learn 6 animals!', category: 'animals', threshold: 6 },
  { id: 'quiz-champ', name: 'Quiz Champ', emoji: '🏆', description: 'Answer 10 quiz questions correctly!', category: 'quiz', threshold: 10 },

  // ── v6 New Badges ──

  // Collection badges
  { id: 'first-collection', name: 'Collector', emoji: '📦', description: 'Complete your first collection!', category: 'collections', threshold: 1 },
  { id: 'collection-master', name: 'Collection Master', emoji: '🗃', description: 'Complete 3 collections!', category: 'collections', threshold: 3 },

  // Skill badges
  { id: 'skill-explorer', name: 'Skill Explorer', emoji: '🧭', description: 'Practice 5 different skills!', category: 'skills', threshold: 5 },
  { id: 'well-rounded', name: 'Well Rounded', emoji: '🎯', description: 'Practice all 6 skill areas!', category: 'skill-areas', threshold: 6 },

  // Playlist badges
  { id: 'playlist-finisher', name: 'Playlist Pro', emoji: '🎶', description: 'Finish a playlist!', category: 'playlists', threshold: 1 },

  // Streak badges
  { id: 'streak-3', name: '3-Day Streak', emoji: '🔥', description: 'Play 3 days in a row!', category: 'streak', threshold: 3 },
  { id: 'streak-7', name: 'Week Warrior', emoji: '⚡', description: 'Play 7 days in a row!', category: 'streak', threshold: 7 },
  { id: 'streak-30', name: 'Monthly Marvel', emoji: '🏅', description: 'Play 30 days in a row!', category: 'streak', threshold: 30 },

  // Activity variety
  { id: 'try-everything', name: 'Try Everything', emoji: '🎪', description: 'Try 10 different activity types!', category: 'variety', threshold: 10 },
  { id: 'bookworm', name: 'Bookworm', emoji: '📚', description: 'Read 5 stories!', category: 'stories', threshold: 5 },
  { id: 'super-star-200', name: 'Superstar', emoji: '💎', description: 'Earn 200 stars!', category: 'general', threshold: 200 },
  { id: 'creative-genius', name: 'Creative Genius', emoji: '🖌', description: 'Create 10 artworks!', category: 'artworks', threshold: 10 },
];

/** Get a reward rule by content type */
export function getRewardRule(contentType: ContentType): RewardRule {
  return rewardRules[contentType];
}

/** Get an extended badge by ID */
export function getExtendedBadge(badgeId: string): ExtendedBadge | undefined {
  return extendedBadges.find((b) => b.id === badgeId);
}
