import { useLiveQuery } from 'dexie-react-hooks';
import { db, type DailyGoalRecord } from '../db/database';
import { getTodayKey, dailyGoals } from '../data/dailyGoalsConfig';

async function getTodayGoals(playerId: number): Promise<DailyGoalRecord> {
  const todayKey = getTodayKey();
  const existing = await db.dailyGoals
    .where('[playerId+date]')
    .equals([playerId, todayKey])
    .first();

  if (existing) return existing;

  const id = await db.dailyGoals.add({
    playerId,
    date: todayKey,
    lessonsCompleted: 0,
    gamesPlayed: 0,
    storiesRead: 0,
    videosWatched: 0,
    totalMinutes: 0,
  });

  return {
    id,
    playerId,
    date: todayKey,
    lessonsCompleted: 0,
    gamesPlayed: 0,
    storiesRead: 0,
    videosWatched: 0,
    totalMinutes: 0,
  };
}

async function incrementGoal(
  playerId: number,
  field: 'lessonsCompleted' | 'gamesPlayed' | 'storiesRead' | 'videosWatched'
): Promise<void> {
  const record = await getTodayGoals(playerId);
  await db.dailyGoals.update(record.id!, {
    [field]: (record[field] as number) + 1,
  });
}

async function addMinutes(playerId: number, minutes: number): Promise<void> {
  const record = await getTodayGoals(playerId);
  await db.dailyGoals.update(record.id!, {
    totalMinutes: record.totalMinutes + minutes,
  });
}

function isAllGoalsMet(record: DailyGoalRecord): boolean {
  // Use targets from dailyGoalsConfig to stay in sync with the UI rings
  const targets: Record<string, number> = {};
  dailyGoals.forEach((g) => (targets[g.key] = g.target));
  return (
    record.lessonsCompleted >= (targets['lessons'] ?? 2) &&
    record.gamesPlayed >= (targets['games'] ?? 3) &&
    record.storiesRead >= (targets['stories'] ?? 1) &&
    record.videosWatched >= (targets['videos'] ?? 2)
  );
}

export function useDailyGoals(playerId: number | undefined) {
  const todayKey = getTodayKey();

  const todayGoals = useLiveQuery(
    async () => {
      if (!playerId) return null;
      return getTodayGoals(playerId);
    },
    [playerId, todayKey],
    null
  );

  return {
    todayGoals,
    incrementGoal,
    addMinutes,
    isAllGoalsMet,
  };
}
