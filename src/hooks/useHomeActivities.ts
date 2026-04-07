import { useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type HomeActivityProgress } from '../db/database';
import { homeActivities } from '../data/homeActivitiesData';
import { useApp } from '../context/AppContext';
import { useProfiles } from './useProfile';

export function useHomeActivities(playerId: number | undefined) {
  const { showStarBurst, showCelebration } = useApp();
  const { addStars } = useProfiles();

  const allProgress = useLiveQuery(
    () =>
      playerId
        ? db.homeActivityProgress.where('playerId').equals(playerId).toArray()
        : [],
    [playerId],
    [] as HomeActivityProgress[]
  );

  const markCompleted = useCallback(
    async (activityId: string) => {
      if (!playerId) return;

      const existing = await db.homeActivityProgress
        .where('[playerId+activityId]')
        .equals([playerId, activityId])
        .first();

      if (existing) {
        if (!existing.completed) {
          await db.homeActivityProgress.update(existing.id!, {
            completed: true,
            completedAt: new Date(),
          });

          await db.stars.add({
            playerId,
            category: 'home-activities',
            starsEarned: 1,
            reason: `Completed home activity: ${activityId}`,
            earnedAt: new Date(),
          });
          await addStars(playerId, 1);
          showStarBurst();
          showCelebration();
        }
      } else {
        await db.homeActivityProgress.add({
          playerId,
          activityId,
          completed: true,
          favorite: false,
          completedAt: new Date(),
        });

        await db.stars.add({
          playerId,
          category: 'home-activities',
          starsEarned: 1,
          reason: `Completed home activity: ${activityId}`,
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

      const existing = await db.homeActivityProgress
        .where('[playerId+activityId]')
        .equals([playerId, activityId])
        .first();

      if (existing) {
        await db.homeActivityProgress.update(existing.id!, {
          favorite: !existing.favorite,
        });
      } else {
        await db.homeActivityProgress.add({
          playerId,
          activityId,
          completed: false,
          favorite: true,
        });
      }
    },
    [playerId]
  );

  const isCompleted = useCallback(
    (activityId: string): boolean => {
      return allProgress.some((p) => p.activityId === activityId && p.completed);
    },
    [allProgress]
  );

  const isFavorite = useCallback(
    (activityId: string): boolean => {
      return allProgress.some((p) => p.activityId === activityId && p.favorite);
    },
    [allProgress]
  );

  const getRandomActivity = useCallback(() => {
    const completedIds = new Set(
      allProgress.filter((p) => p.completed).map((p) => p.activityId)
    );
    const uncompleted = homeActivities.filter((a) => !completedIds.has(a.id));

    if (uncompleted.length === 0) {
      // All completed - return a random one from all activities
      return homeActivities[Math.floor(Math.random() * homeActivities.length)];
    }

    return uncompleted[Math.floor(Math.random() * uncompleted.length)];
  }, [allProgress]);

  return {
    allProgress,
    markCompleted,
    toggleFavorite,
    isCompleted,
    isFavorite,
    getRandomActivity,
  };
}
