import { useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import type { Artwork } from '../db/database';

const MAX_ARTWORKS = 50;

export function useArtwork(playerId: number | undefined) {
  const artworks = useLiveQuery(
    async () => {
      if (!playerId) return [];
      return db.artworks
        .where('playerId')
        .equals(playerId)
        .reverse()
        .sortBy('createdAt');
    },
    [playerId],
    [] as Artwork[]
  );

  const saveArtwork = useCallback(
    async (title: string, dataUrl: string, templateId?: string) => {
      if (!playerId) return;

      // Add the new artwork
      await db.artworks.add({
        playerId,
        title,
        dataUrl,
        templateId,
        createdAt: new Date(),
      });

      // Enforce the 50-item limit by deleting oldest
      const all = await db.artworks
        .where('playerId')
        .equals(playerId)
        .sortBy('createdAt');

      if (all.length > MAX_ARTWORKS) {
        const toDelete = all.slice(0, all.length - MAX_ARTWORKS);
        const idsToDelete = toDelete
          .map((a) => a.id)
          .filter((id): id is number => id !== undefined);
        await db.artworks.bulkDelete(idsToDelete);
      }
    },
    [playerId]
  );

  const deleteArtwork = useCallback(async (id: number) => {
    await db.artworks.delete(id);
  }, []);

  return { artworks, saveArtwork, deleteArtwork };
}
