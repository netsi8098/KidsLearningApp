import { useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type MoodCheckIn } from '../db/database';

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function useMoodCheckIn(playerId: number | undefined) {
  // Live query: recent mood check-ins for this player (last 30 entries)
  const recentMoods = useLiveQuery(
    () =>
      playerId
        ? db.moodCheckIns
            .where('playerId')
            .equals(playerId)
            .reverse()
            .sortBy('checkedInAt')
            .then((entries) => entries.slice(0, 30))
        : [],
    [playerId],
    [] as MoodCheckIn[]
  );

  // Today's most recent check-in
  const todayMood = useLiveQuery(
    () => {
      if (!playerId) return undefined;
      const today = todayStr();
      return db.moodCheckIns
        .where('playerId')
        .equals(playerId)
        .reverse()
        .sortBy('checkedInAt')
        .then((entries) =>
          entries.find((e) => e.checkedInAt.toISOString().slice(0, 10) === today)
        );
    },
    [playerId],
    undefined as MoodCheckIn | undefined
  );

  const checkIn = useCallback(
    async (mood: string, note?: string) => {
      if (!playerId) return;
      await db.moodCheckIns.add({
        playerId,
        mood,
        note,
        checkedInAt: new Date(),
      });
    },
    [playerId]
  );

  const getMoodHistory = useCallback(
    async (days = 7): Promise<MoodCheckIn[]> => {
      if (!playerId) return [];
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      const all = await db.moodCheckIns
        .where('playerId')
        .equals(playerId)
        .toArray();
      return all
        .filter((e) => e.checkedInAt >= cutoff)
        .sort((a, b) => b.checkedInAt.getTime() - a.checkedInAt.getTime());
    },
    [playerId]
  );

  return { recentMoods, checkIn, todayMood };
}
