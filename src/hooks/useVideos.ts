import { useLiveQuery } from 'dexie-react-hooks';
import { db, type VideoFavorite, type WatchHistory } from '../db/database';
import type { VideoItem } from '../data/videoConfig';

export function useVideos(playerId: number | undefined) {
  const favorites = useLiveQuery(
    () => (playerId ? db.videoFavorites.where('playerId').equals(playerId).toArray() : []),
    [playerId],
    [] as VideoFavorite[]
  );

  const history = useLiveQuery(
    async () => {
      if (!playerId) return [];
      const items = await db.watchHistory
        .where('playerId')
        .equals(playerId)
        .toArray();
      return items.sort((a, b) => b.watchedAt.getTime() - a.watchedAt.getTime());
    },
    [playerId],
    [] as WatchHistory[]
  );

  const favoriteIds = new Set(favorites.map((f) => f.videoId));

  async function toggleFavorite(videoId: string) {
    if (!playerId) return;
    const existing = await db.videoFavorites
      .where('[playerId+videoId]')
      .equals([playerId, videoId])
      .first();
    if (existing) {
      await db.videoFavorites.delete(existing.id!);
    } else {
      await db.videoFavorites.add({ playerId, videoId, addedAt: new Date() });
    }
  }

  async function addToHistory(video: VideoItem) {
    if (!playerId) return;
    await db.watchHistory.add({
      playerId,
      videoId: video.id,
      videoTitle: video.title,
      videoChannel: video.channel,
      videoThumbnail: video.thumbnail,
      watchedAt: new Date(),
    });
  }

  // Get recent history (last 20, deduplicated by videoId keeping most recent)
  function getRecentHistory() {
    const seen = new Set<string>();
    const deduped: WatchHistory[] = [];
    for (const item of history) {
      if (!seen.has(item.videoId)) {
        seen.add(item.videoId);
        deduped.push(item);
      }
      if (deduped.length >= 20) break;
    }
    return deduped;
  }

  return {
    favorites,
    favoriteIds,
    history,
    toggleFavorite,
    addToHistory,
    getRecentHistory,
  };
}
