import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';

type FavoriteTable = 'cookingProgress' | 'audioProgress' | 'movementProgress' | 'homeActivityProgress';

const idFieldMap: Record<FavoriteTable, string> = {
  cookingProgress: 'recipeId',
  audioProgress: 'episodeId',
  movementProgress: 'activityId',
  homeActivityProgress: 'activityId',
};

export function useFavorites(playerId: number | undefined, table: FavoriteTable) {
  const idField = idFieldMap[table];

  const favorites = useLiveQuery(
    () => {
      if (!playerId) return [];
      return (db[table] as any)
        .where('playerId')
        .equals(playerId)
        .filter((r: any) => r.favorite === true)
        .toArray();
    },
    [playerId, table],
    []
  );

  const favoriteIds = new Set(favorites.map((f: any) => f[idField]));

  async function toggleFavorite(contentId: string) {
    if (!playerId) return;
    const compoundKey = `[playerId+${idField}]`;
    const existing = await (db[table] as any)
      .where(compoundKey)
      .equals([playerId, contentId])
      .first();

    if (existing) {
      await (db[table] as any).update(existing.id, { favorite: !existing.favorite });
    } else {
      const record: any = {
        playerId,
        [idField]: contentId,
        completed: false,
        favorite: true,
      };
      if (table === 'cookingProgress') {
        record.stepsCompleted = 0;
        record.totalSteps = 0;
        record.lastCookedAt = new Date();
      } else if (table === 'audioProgress') {
        record.currentTime = 0;
        record.duration = 0;
        record.lastListenedAt = new Date();
      } else if (table === 'movementProgress') {
        record.timesCompleted = 0;
        record.lastPlayedAt = new Date();
      } else if (table === 'homeActivityProgress') {
        record.completedAt = undefined;
      }
      await (db[table] as any).add(record);
    }
  }

  function isFavorite(contentId: string): boolean {
    return favoriteIds.has(contentId);
  }

  return { favorites, toggleFavorite, isFavorite };
}

/**
 * Universal favorites hook using the new universalFavorites table.
 * Works with any content ID from the registry.
 */
export function useUniversalFavorites(playerId: number | undefined) {
  const favRecords = useLiveQuery(
    () => {
      if (!playerId) return [];
      return db.universalFavorites
        .where('playerId')
        .equals(playerId)
        .toArray();
    },
    [playerId],
    []
  );

  const favoriteIds = new Set(favRecords.map((f) => f.contentId));

  async function toggleFavorite(contentId: string) {
    if (!playerId) return;
    const existing = await db.universalFavorites
      .where('[playerId+contentId]')
      .equals([playerId, contentId])
      .first();
    if (existing) {
      await db.universalFavorites.delete(existing.id!);
    } else {
      await db.universalFavorites.add({
        playerId,
        contentId,
        addedAt: new Date(),
      });
    }
  }

  function isFavorite(contentId: string): boolean {
    return favoriteIds.has(contentId);
  }

  return { favorites: favRecords, favoriteIds, toggleFavorite, isFavorite };
}
