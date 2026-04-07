import { useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type ScrapbookEntry } from '../db/database';

export function useScrapbook(playerId: number | undefined) {
  const entries = useLiveQuery(
    () =>
      playerId
        ? db.scrapbookEntries
            .where('playerId')
            .equals(playerId)
            .reverse()
            .sortBy('createdAt')
        : [],
    [playerId],
    [] as ScrapbookEntry[]
  );

  const addEntry = useCallback(
    async (
      entryType: ScrapbookEntry['entryType'],
      title: string,
      emoji: string,
      description?: string,
      imageUrl?: string
    ) => {
      if (!playerId) return;

      await db.scrapbookEntries.add({
        playerId,
        entryType,
        title,
        emoji,
        description,
        imageUrl,
        createdAt: new Date(),
      });
    },
    [playerId]
  );

  const getEntriesByType = useCallback(
    (type: ScrapbookEntry['entryType']): ScrapbookEntry[] => {
      return entries.filter((e) => e.entryType === type);
    },
    [entries]
  );

  return {
    entries,
    addEntry,
    getEntriesByType,
  };
}
