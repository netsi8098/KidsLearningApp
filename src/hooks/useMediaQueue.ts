import { useLiveQuery } from 'dexie-react-hooks';
import { db, type MediaQueueItem } from '../db/database';

/**
 * CRUD operations for the media queue (up-next playlist).
 * Items are ordered by `position` (ascending).
 */
export function useMediaQueue(playerId: number | undefined) {
  const queue = useLiveQuery(
    () =>
      playerId
        ? db.mediaQueue
            .where('playerId')
            .equals(playerId)
            .sortBy('position')
        : [],
    [playerId],
    [] as MediaQueueItem[],
  );

  /** Add a new item to the end of the queue. */
  async function addToQueue(
    contentType: MediaQueueItem['contentType'],
    contentId: string,
    title: string,
    emoji: string,
  ): Promise<void> {
    if (!playerId) return;

    // Determine the max position currently in the queue
    const existing = await db.mediaQueue
      .where('playerId')
      .equals(playerId)
      .toArray();

    const maxPosition =
      existing.length > 0
        ? Math.max(...existing.map((item) => item.position))
        : 0;

    await db.mediaQueue.add({
      playerId,
      contentType,
      contentId,
      title,
      emoji,
      position: maxPosition + 1,
      addedAt: new Date(),
    });
  }

  /** Remove a single item from the queue by its id. */
  async function removeFromQueue(id: number): Promise<void> {
    await db.mediaQueue.delete(id);
  }

  /** Clear all queue items for the current player. */
  async function clearQueue(): Promise<void> {
    if (!playerId) return;
    await db.mediaQueue.where('playerId').equals(playerId).delete();
  }

  /** Move an item up in the queue (swap with previous item). */
  async function moveUp(id: number): Promise<void> {
    const item = queue.find((q) => q.id === id);
    if (!item) return;

    const idx = queue.indexOf(item);
    if (idx <= 0) return; // Already at top

    const prev = queue[idx - 1];
    if (!prev.id) return;

    // Swap positions
    await db.transaction('rw', db.mediaQueue, async () => {
      await db.mediaQueue.update(item.id!, { position: prev.position });
      await db.mediaQueue.update(prev.id!, { position: item.position });
    });
  }

  /** Move an item down in the queue (swap with next item). */
  async function moveDown(id: number): Promise<void> {
    const item = queue.find((q) => q.id === id);
    if (!item) return;

    const idx = queue.indexOf(item);
    if (idx >= queue.length - 1) return; // Already at bottom

    const next = queue[idx + 1];
    if (!next.id) return;

    // Swap positions
    await db.transaction('rw', db.mediaQueue, async () => {
      await db.mediaQueue.update(item.id!, { position: next.position });
      await db.mediaQueue.update(next.id!, { position: item.position });
    });
  }

  /** Get the first item in the queue (next to play). */
  function getNextItem(): MediaQueueItem | undefined {
    return queue.length > 0 ? queue[0] : undefined;
  }

  return {
    queue,
    addToQueue,
    removeFromQueue,
    clearQueue,
    moveUp,
    moveDown,
    getNextItem,
  };
}
