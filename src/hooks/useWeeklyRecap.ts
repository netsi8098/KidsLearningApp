// ── Weekly Recap Hook ───────────────────────────────────

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';

export interface WeeklyRecapData {
  weekKey: string;
  totalActivities: number;
  starsEarned: number;
  topSkills: string[];
  gamesPlayed: number;
  storiesCompleted: number;
  favoriteType: string;
  streakDays: number;
  generatedAt: Date;
}

function getWeekKey(date = new Date()): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  d.setDate(d.getDate() - day); // Start of week (Sunday)
  return d.toISOString().slice(0, 10);
}

export function useWeeklyRecap(playerId: number | undefined) {
  // Past recaps
  const recaps = useLiveQuery(
    () =>
      playerId
        ? db.weeklyRecaps
            .where('playerId')
            .equals(playerId)
            .reverse()
            .sortBy('generatedAt')
        : [],
    [playerId],
    []
  );

  /** Generate recap for the current week */
  async function generateCurrentWeekRecap(): Promise<WeeklyRecapData | null> {
    if (!playerId) return null;

    const weekKey = getWeekKey();
    const weekStart = new Date(weekKey);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    // Check if already generated this week
    const existing = await db.weeklyRecaps
      .where('[playerId+weekKey]')
      .equals([playerId, weekKey])
      .first();
    if (existing) return existing as WeeklyRecapData;

    // Gather data
    const history = await db.contentHistory
      .where('playerId')
      .equals(playerId)
      .filter((h) => h.interactedAt >= weekStart && h.interactedAt < weekEnd)
      .toArray();

    const stars = await db.stars
      .where('playerId')
      .equals(playerId)
      .filter((s) => s.earnedAt >= weekStart && s.earnedAt < weekEnd)
      .toArray();

    const games = await db.gameScores
      .where('playerId')
      .equals(playerId)
      .filter((g) => g.playedAt >= weekStart && g.playedAt < weekEnd)
      .count();

    const stories = await db.storyProgress
      .where('playerId')
      .equals(playerId)
      .filter((s) => s.completed && s.lastReadAt >= weekStart && s.lastReadAt < weekEnd)
      .count();

    const profile = await db.profiles.get(playerId);

    // Count types
    const typeCounts: Record<string, number> = {};
    for (const h of history) {
      const type = h.contentId.split(':')[0];
      typeCounts[type] = (typeCounts[type] ?? 0) + 1;
    }

    const topSkills = Object.entries(typeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([type]) => type);

    const favoriteType = topSkills[0] ?? 'learning';

    const recapData: WeeklyRecapData = {
      weekKey,
      totalActivities: history.length,
      starsEarned: stars.reduce((sum, s) => sum + s.starsEarned, 0),
      topSkills,
      gamesPlayed: games,
      storiesCompleted: stories,
      favoriteType,
      streakDays: profile?.streakDays ?? 0,
      generatedAt: new Date(),
    };

    // Save to DB
    await db.weeklyRecaps.add({
      playerId,
      ...recapData,
    });

    return recapData;
  }

  return {
    recaps,
    currentWeekKey: getWeekKey(),
    generateCurrentWeekRecap,
  };
}
