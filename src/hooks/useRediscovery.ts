// ── Rediscovery Hook ────────────────────────────────────
// Surface recently played, favorites, and continuation points.

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { getContentItem } from '../registry/contentRegistry';
import type { ContentItem } from '../registry/types';

export function useRediscovery(playerId: number | undefined) {
  // Recent content history (last 7 days)
  const history = useLiveQuery(
    () => {
      if (!playerId) return [];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return db.contentHistory
        .where('playerId')
        .equals(playerId)
        .filter((h) => h.interactedAt >= weekAgo)
        .reverse()
        .sortBy('interactedAt');
    },
    [playerId],
    []
  );

  // Universal favorites
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

  // Resolve history to ContentItems (deduplicated, most recent first)
  const recentlyPlayed: ContentItem[] = (() => {
    const seen = new Set<string>();
    const items: ContentItem[] = [];
    for (const h of history) {
      if (seen.has(h.contentId)) continue;
      seen.add(h.contentId);
      const item = getContentItem(h.contentId);
      if (item) items.push(item);
    }
    return items.slice(0, 10);
  })();

  // Items played this week
  const playedThisWeek = recentlyPlayed;

  // Favorites resolved to ContentItems
  const favorites: ContentItem[] = favRecords
    .map((f) => getContentItem(f.contentId))
    .filter((item): item is ContentItem => item !== undefined);

  // "Play Again" — items completed more than once
  const playAgain: ContentItem[] = (() => {
    const countMap = new Map<string, number>();
    for (const h of history) {
      countMap.set(h.contentId, (countMap.get(h.contentId) ?? 0) + 1);
    }
    return [...countMap.entries()]
      .filter(([, count]) => count >= 2)
      .map(([id]) => getContentItem(id))
      .filter((item): item is ContentItem => item !== undefined)
      .slice(0, 6);
  })();

  // Continue where left off — incomplete items
  const continueWhereLeftOff: ContentItem[] = (() => {
    const incomplete = history.filter((h) => h.completed === false);
    const seen = new Set<string>();
    const items: ContentItem[] = [];
    for (const h of incomplete) {
      if (seen.has(h.contentId)) continue;
      seen.add(h.contentId);
      const item = getContentItem(h.contentId);
      if (item) items.push(item);
    }
    return items.slice(0, 4);
  })();

  // Favorite content IDs for quick lookup
  const favoriteIds = new Set(favRecords.map((f) => f.contentId));

  async function toggleUniversalFavorite(contentId: string) {
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

  async function logContentInteraction(
    contentId: string,
    completed = false,
    durationSeconds?: number
  ) {
    if (!playerId) return;
    await db.contentHistory.add({
      playerId,
      contentId,
      interactedAt: new Date(),
      completed,
      durationSeconds,
    });
  }

  return {
    recentlyPlayed,
    playedThisWeek,
    favorites,
    playAgain,
    continueWhereLeftOff,
    favoriteIds,
    toggleUniversalFavorite,
    logContentInteraction,
  };
}
