import { db } from '../db/database';
import { useApp } from '../context/AppContext';
import { useProfiles } from './useProfile';

type TrackableTable = 'cookingProgress' | 'audioProgress' | 'movementProgress' | 'homeActivityProgress' | 'lifeSkillsProgress' | 'explorerProgress';

export function useCompletionTracking(playerId: number | undefined, table: TrackableTable) {
  const { showStarBurst, showCelebration } = useApp();
  const { addStars } = useProfiles();

  async function markCompleted(contentId: string, starsToAward = 1) {
    if (!playerId) return;

    const idFieldMap: Record<TrackableTable, string> = {
      cookingProgress: 'recipeId',
      audioProgress: 'episodeId',
      movementProgress: 'activityId',
      homeActivityProgress: 'activityId',
      lifeSkillsProgress: 'skillId',
      explorerProgress: 'topicId',
    };

    const idField = idFieldMap[table];
    const compoundKey = `[playerId+${idField}]`;
    const existing = await (db[table] as any)
      .where(compoundKey)
      .equals([playerId, contentId])
      .first();

    if (existing) {
      if (existing.completed) return; // Already completed
      await (db[table] as any).update(existing.id, {
        completed: true,
        completedAt: new Date(),
      });
    } else {
      const record: any = {
        playerId,
        [idField]: contentId,
        completed: true,
        completedAt: new Date(),
      };
      await (db[table] as any).add(record);
    }

    // Award stars
    if (starsToAward > 0) {
      await db.stars.add({
        playerId,
        category: table,
        starsEarned: starsToAward,
        reason: `Completed ${contentId}`,
        earnedAt: new Date(),
      });
      await addStars(playerId, starsToAward);
      showStarBurst();
    }

    showCelebration();
  }

  return { markCompleted };
}
