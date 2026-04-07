import { useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type LifeSkillsProgress } from '../db/database';

export function useLifeSkills(playerId: number | undefined) {
  // Live query: all completed life skills for this player
  const completedSkills = useLiveQuery(
    () =>
      playerId
        ? db.lifeSkillsProgress.where('playerId').equals(playerId).toArray()
        : [],
    [playerId],
    [] as LifeSkillsProgress[]
  );

  const markSkillCompleted = useCallback(
    async (skillId: string, score?: number) => {
      if (!playerId) return;

      const existing = await db.lifeSkillsProgress
        .where('[playerId+skillId]')
        .equals([playerId, skillId])
        .first();

      if (existing) {
        await db.lifeSkillsProgress.update(existing.id!, {
          completed: true,
          score: score ?? existing.score,
          completedAt: new Date(),
        });
      } else {
        await db.lifeSkillsProgress.add({
          playerId,
          skillId,
          completed: true,
          score,
          completedAt: new Date(),
        });
      }
    },
    [playerId]
  );

  const isSkillCompleted = useCallback(
    (skillId: string): boolean => {
      return completedSkills.some((s) => s.skillId === skillId && s.completed);
    },
    [completedSkills]
  );

  const getCompletedCount = useCallback((): number => {
    return completedSkills.filter((s) => s.completed).length;
  }, [completedSkills]);

  return { completedSkills, markSkillCompleted, isSkillCompleted, getCompletedCount };
}
