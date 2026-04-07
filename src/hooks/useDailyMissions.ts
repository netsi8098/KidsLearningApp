import { useCallback, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type DailyMission } from '../db/database';
import { missionTemplates, type MissionTemplate } from '../data/missionTemplates';

function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Simple deterministic hash to pick missions reproducibly per player per day */
function hashSeed(playerId: number, dateStr: string): number {
  let hash = playerId * 31;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash * 37 + dateStr.charCodeAt(i)) & 0x7fffffff;
  }
  return hash;
}

/** Pick N unique indices from templates using a seed */
function pickMissions(
  seed: number,
  templates: MissionTemplate[],
  count: number
): MissionTemplate[] {
  const available = [...templates];
  const picked: MissionTemplate[] = [];
  let s = seed;

  for (let i = 0; i < count && available.length > 0; i++) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const idx = s % available.length;
    picked.push(available[idx]);
    available.splice(idx, 1);
  }

  return picked;
}

/** Determine how many missions based on seed (3-5) */
function getMissionCount(seed: number): number {
  return 3 + (seed % 3); // 3, 4, or 5
}

export function useDailyMissions(playerId: number | undefined) {
  const todayKey = getTodayKey();

  const missions = useLiveQuery(
    async () => {
      if (!playerId) return [];
      return db.dailyMissions
        .where('[playerId+date+missionId]')
        .between(
          [playerId, todayKey, ''],
          [playerId, todayKey, '\uffff']
        )
        .toArray();
    },
    [playerId, todayKey],
    [] as DailyMission[]
  );

  // Auto-generate missions for today if none exist
  const generateMissions = useCallback(async () => {
    if (!playerId) return;

    // Check if missions already exist for today
    const existing = await db.dailyMissions
      .where('[playerId+date+missionId]')
      .between(
        [playerId, todayKey, ''],
        [playerId, todayKey, '\uffff']
      )
      .count();

    if (existing > 0) return;

    const seed = hashSeed(playerId, todayKey);
    const count = getMissionCount(seed);
    const selected = pickMissions(seed, missionTemplates, count);

    const records: DailyMission[] = selected.map((template) => ({
      playerId,
      date: todayKey,
      missionId: template.id,
      completed: false,
    }));

    await db.dailyMissions.bulkAdd(records);
  }, [playerId, todayKey]);

  // Generate on mount / player change
  useEffect(() => {
    generateMissions();
  }, [generateMissions]);

  const completeMission = useCallback(
    async (missionId: string) => {
      if (!playerId) return;

      const record = await db.dailyMissions
        .where('[playerId+date+missionId]')
        .equals([playerId, todayKey, missionId])
        .first();

      if (record?.id && !record.completed) {
        await db.dailyMissions.update(record.id, {
          completed: true,
          completedAt: new Date(),
        });
      }
    },
    [playerId, todayKey]
  );

  const allComplete =
    missions.length > 0 && missions.every((m) => m.completed);

  // Enrich missions with template data
  const enrichedMissions = missions.map((m) => {
    const template = missionTemplates.find((t) => t.id === m.missionId);
    return {
      ...m,
      emoji: template?.emoji ?? '\u{2753}',
      description: template?.descriptionTemplate ?? 'Complete a mission!',
      route: template?.route ?? '/menu',
      category: template?.category ?? 'learn',
    };
  });

  return {
    missions: enrichedMissions,
    completeMission,
    allComplete,
    generateMissions,
  };
}
