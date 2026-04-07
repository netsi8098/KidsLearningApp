import { useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type MovementProgress } from '../db/database';
import { useApp } from '../context/AppContext';
import { useProfiles } from './useProfile';

export function useMovement(playerId: number | undefined) {
  const { showStarBurst, showCelebration } = useApp();
  const { addStars } = useProfiles();

  const allProgress = useLiveQuery(
    () =>
      playerId
        ? db.movementProgress.where('playerId').equals(playerId).toArray()
        : [],
    [playerId],
    [] as MovementProgress[]
  );

  const markCompleted = useCallback(
    async (activityId: string) => {
      if (!playerId) return;

      const existing = await db.movementProgress
        .where('[playerId+activityId]')
        .equals([playerId, activityId])
        .first();

      if (existing) {
        const isFirstCompletion = !existing.completed;
        await db.movementProgress.update(existing.id!, {
          completed: true,
          timesCompleted: existing.timesCompleted + 1,
          lastPlayedAt: new Date(),
        });

        if (isFirstCompletion) {
          await db.stars.add({
            playerId,
            category: 'movement',
            starsEarned: 1,
            reason: `Completed movement activity: ${activityId}`,
            earnedAt: new Date(),
          });
          await addStars(playerId, 1);
          showStarBurst();
          showCelebration();
        }
      } else {
        await db.movementProgress.add({
          playerId,
          activityId,
          completed: true,
          favorite: false,
          timesCompleted: 1,
          lastPlayedAt: new Date(),
        });

        // First completion -- award 1 star
        await db.stars.add({
          playerId,
          category: 'movement',
          starsEarned: 1,
          reason: `Completed movement activity: ${activityId}`,
          earnedAt: new Date(),
        });
        await addStars(playerId, 1);
        showStarBurst();
        showCelebration();
      }
    },
    [playerId, addStars, showStarBurst, showCelebration]
  );

  const toggleFavorite = useCallback(
    async (activityId: string) => {
      if (!playerId) return;

      const existing = await db.movementProgress
        .where('[playerId+activityId]')
        .equals([playerId, activityId])
        .first();

      if (existing) {
        await db.movementProgress.update(existing.id!, {
          favorite: !existing.favorite,
        });
      } else {
        await db.movementProgress.add({
          playerId,
          activityId,
          completed: false,
          favorite: true,
          timesCompleted: 0,
          lastPlayedAt: new Date(),
        });
      }
    },
    [playerId]
  );

  const getTimesCompleted = useCallback(
    (activityId: string): number => {
      const record = allProgress.find((p) => p.activityId === activityId);
      return record?.timesCompleted ?? 0;
    },
    [allProgress]
  );

  const isFavorite = useCallback(
    (activityId: string): boolean => {
      return allProgress.some((p) => p.activityId === activityId && p.favorite);
    },
    [allProgress]
  );

  const isCompleted = useCallback(
    (activityId: string): boolean => {
      return allProgress.some((p) => p.activityId === activityId && p.completed);
    },
    [allProgress]
  );

  return {
    allProgress,
    markCompleted,
    toggleFavorite,
    getTimesCompleted,
    isFavorite,
    isCompleted,
  };
}
