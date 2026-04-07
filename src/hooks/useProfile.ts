import { useLiveQuery } from 'dexie-react-hooks';
import { db, type PlayerProfile } from '../db/database';

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function useProfiles() {
  const profiles = useLiveQuery(() => db.profiles.toArray()) ?? [];

  async function createProfile(
    name: string,
    avatarEmoji: string,
    age?: number,
    ageGroup?: '2-3' | '4-5' | '6-8',
    interests?: string[],
    avatarPhoto?: string,
  ): Promise<PlayerProfile> {
    const now = new Date();
    const today = todayStr();
    const id = await db.profiles.add({
      name,
      avatarEmoji,
      avatarPhoto,
      totalStars: 0,
      streakDays: 1,
      lastStreakDate: today,
      createdAt: now,
      lastPlayedAt: now,
      age,
      ageGroup,
      interests: interests ?? [],
      learningLevel: 'beginner',
      bedtimeMode: false,
      characterPreference: '',
    });
    return {
      id,
      name,
      avatarEmoji,
      totalStars: 0,
      streakDays: 1,
      lastStreakDate: today,
      createdAt: now,
      lastPlayedAt: now,
      age,
      ageGroup,
      interests: interests ?? [],
      learningLevel: 'beginner',
      bedtimeMode: false,
      characterPreference: '',
    };
  }

  async function updateProfile(playerId: number, updates: Partial<PlayerProfile>): Promise<void> {
    await db.profiles.update(playerId, updates);
  }

  async function updateLastPlayed(playerId: number) {
    const profile = await db.profiles.get(playerId);
    if (!profile) return;

    const today = todayStr();
    const yesterday = yesterdayStr();
    let { streakDays, lastStreakDate } = profile;

    if (lastStreakDate === today) {
      // Already played today, no streak change
    } else if (lastStreakDate === yesterday) {
      streakDays += 1;
      lastStreakDate = today;
    } else {
      streakDays = 1;
      lastStreakDate = today;
    }

    await db.profiles.update(playerId, {
      lastPlayedAt: new Date(),
      streakDays,
      lastStreakDate,
    });
  }

  async function addStars(playerId: number, count: number) {
    const profile = await db.profiles.get(playerId);
    if (profile) {
      await db.profiles.update(playerId, { totalStars: profile.totalStars + count });
    }
  }

  async function getProfile(playerId: number) {
    return db.profiles.get(playerId);
  }

  async function deleteProfile(playerId: number) {
    await db.transaction('rw', [
      db.profiles, db.progress, db.badges, db.stars,
      db.videoFavorites, db.watchHistory, db.lessonProgress, db.storyProgress,
      db.dailyGoals, db.gameScores,
      db.artworks, db.cookingProgress, db.audioProgress, db.bedtimeSessions,
      db.movementProgress, db.moodCheckIns, db.lifeSkillsProgress,
      db.dailyMissions, db.assessmentResults, db.homeActivityProgress,
      db.mediaQueue, db.scrapbookEntries, db.explorerProgress,
      // v6 tables
      db.collectionProgress, db.playlistProgress, db.contentHistory,
      db.universalFavorites, db.nudgeState, db.weeklyRecaps, db.onboardingState,
    ], async () => {
      await db.profiles.delete(playerId);
      await db.progress.where('playerId').equals(playerId).delete();
      await db.badges.where('playerId').equals(playerId).delete();
      await db.stars.where('playerId').equals(playerId).delete();
      await db.videoFavorites.where('playerId').equals(playerId).delete();
      await db.watchHistory.where('playerId').equals(playerId).delete();
      await db.lessonProgress.where('playerId').equals(playerId).delete();
      await db.storyProgress.where('playerId').equals(playerId).delete();
      await db.dailyGoals.where('playerId').equals(playerId).delete();
      await db.gameScores.where('playerId').equals(playerId).delete();
      await db.artworks.where('playerId').equals(playerId).delete();
      await db.cookingProgress.where('playerId').equals(playerId).delete();
      await db.audioProgress.where('playerId').equals(playerId).delete();
      await db.bedtimeSessions.where('playerId').equals(playerId).delete();
      await db.movementProgress.where('playerId').equals(playerId).delete();
      await db.moodCheckIns.where('playerId').equals(playerId).delete();
      await db.lifeSkillsProgress.where('playerId').equals(playerId).delete();
      await db.dailyMissions.where('playerId').equals(playerId).delete();
      await db.assessmentResults.where('playerId').equals(playerId).delete();
      await db.homeActivityProgress.where('playerId').equals(playerId).delete();
      await db.mediaQueue.where('playerId').equals(playerId).delete();
      await db.scrapbookEntries.where('playerId').equals(playerId).delete();
      await db.explorerProgress.where('playerId').equals(playerId).delete();
      // v6 tables cleanup
      await db.collectionProgress.where('playerId').equals(playerId).delete();
      await db.playlistProgress.where('playerId').equals(playerId).delete();
      await db.contentHistory.where('playerId').equals(playerId).delete();
      await db.universalFavorites.where('playerId').equals(playerId).delete();
      await db.nudgeState.where('playerId').equals(playerId).delete();
      await db.weeklyRecaps.where('playerId').equals(playerId).delete();
      await db.onboardingState.where('playerId').equals(playerId).delete();
    });
  }

  return { profiles, createProfile, updateProfile, updateLastPlayed, addStars, getProfile, deleteProfile };
}
