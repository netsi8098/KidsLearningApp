import { useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type CookingProgress } from '../db/database';
import { useApp } from '../context/AppContext';
import { useProfiles } from './useProfile';

export function useCooking(playerId: number | undefined) {
  const { showStarBurst, showCelebration } = useApp();
  const { addStars } = useProfiles();

  const allProgress = useLiveQuery(
    () =>
      playerId
        ? db.cookingProgress.where('playerId').equals(playerId).toArray()
        : [],
    [playerId],
    [] as CookingProgress[]
  );

  const startRecipe = useCallback(
    async (recipeId: string, totalSteps: number) => {
      if (!playerId) return;

      const existing = await db.cookingProgress
        .where('[playerId+recipeId]')
        .equals([playerId, recipeId])
        .first();

      if (existing) {
        // Reset for a new run
        await db.cookingProgress.update(existing.id!, {
          completed: false,
          stepsCompleted: 0,
          totalSteps,
          lastCookedAt: new Date(),
        });
      } else {
        await db.cookingProgress.add({
          playerId,
          recipeId,
          completed: false,
          stepsCompleted: 0,
          totalSteps,
          favorite: false,
          lastCookedAt: new Date(),
        });
      }
    },
    [playerId]
  );

  const advanceStep = useCallback(
    async (recipeId: string) => {
      if (!playerId) return;

      const existing = await db.cookingProgress
        .where('[playerId+recipeId]')
        .equals([playerId, recipeId])
        .first();

      if (existing) {
        await db.cookingProgress.update(existing.id!, {
          stepsCompleted: existing.stepsCompleted + 1,
          lastCookedAt: new Date(),
        });
      }
    },
    [playerId]
  );

  const completeRecipe = useCallback(
    async (recipeId: string) => {
      if (!playerId) return;

      const existing = await db.cookingProgress
        .where('[playerId+recipeId]')
        .equals([playerId, recipeId])
        .first();

      if (existing) {
        const isFirstCompletion = !existing.completed;
        await db.cookingProgress.update(existing.id!, {
          completed: true,
          stepsCompleted: existing.totalSteps,
          lastCookedAt: new Date(),
        });

        if (isFirstCompletion) {
          await db.stars.add({
            playerId,
            category: 'cooking',
            starsEarned: 2,
            reason: `Completed recipe: ${recipeId}`,
            earnedAt: new Date(),
          });
          await addStars(playerId, 2);
          showStarBurst();
          showCelebration();
        }
      }
    },
    [playerId, addStars, showStarBurst, showCelebration]
  );

  const getProgress = useCallback(
    (recipeId: string): CookingProgress | undefined => {
      return allProgress.find((p) => p.recipeId === recipeId);
    },
    [allProgress]
  );

  const toggleFavorite = useCallback(
    async (recipeId: string) => {
      if (!playerId) return;

      const existing = await db.cookingProgress
        .where('[playerId+recipeId]')
        .equals([playerId, recipeId])
        .first();

      if (existing) {
        await db.cookingProgress.update(existing.id!, {
          favorite: !existing.favorite,
        });
      } else {
        await db.cookingProgress.add({
          playerId,
          recipeId,
          completed: false,
          stepsCompleted: 0,
          totalSteps: 0,
          favorite: true,
          lastCookedAt: new Date(),
        });
      }
    },
    [playerId]
  );

  const isFavorite = useCallback(
    (recipeId: string): boolean => {
      return allProgress.some((p) => p.recipeId === recipeId && p.favorite);
    },
    [allProgress]
  );

  return {
    allProgress,
    startRecipe,
    advanceStep,
    completeRecipe,
    getProgress,
    toggleFavorite,
    isFavorite,
  };
}
