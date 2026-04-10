/**
 * Sync Service — offline-first data synchronization.
 *
 * Flow:
 * 1. All writes go to IndexedDB first (instant, works offline)
 * 2. Each write also queues a sync entry in the syncQueue table
 * 3. Periodically (or on demand), queued changes are pushed to the backend
 * 4. On sync, we also pull any server-side changes
 * 5. Conflicts resolve with "last-write-wins" (client timestamp)
 *
 * The app works 100% without the backend. Sync is a bonus.
 */

import { db } from '../db/database';
import type { SyncQueueEntry, PlayerProfile } from '../db/database';
import { api, checkBackend, isBackendOnline, isAuthenticated, autoRegister } from './apiService';

export type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline';
export type EntityType = 'profile' | 'progress' | 'badge' | 'star' | 'gameScore' | 'storyProgress' | 'lessonProgress' | 'audioProgress';

let _syncStatus: SyncStatus = 'idle';
let _onSyncStatusChange: ((status: SyncStatus) => void) | null = null;
let _syncInterval: ReturnType<typeof setInterval> | null = null;

/** Register a callback for sync status changes */
export function onSyncStatusChange(cb: (status: SyncStatus) => void) {
  _onSyncStatusChange = cb;
}

/** Get current sync status */
export function getSyncStatus(): SyncStatus {
  return _syncStatus;
}

function setStatus(status: SyncStatus) {
  _syncStatus = status;
  _onSyncStatusChange?.(status);
}

// ── Queue Changes ───────────────────────────────────────────────────

/** Queue a change for sync. Call this after every IndexedDB write. */
export async function queueChange(
  playerId: number,
  entityType: EntityType,
  entityId: string,
  action: 'create' | 'update' | 'delete',
  payload: Record<string, unknown>,
): Promise<void> {
  try {
    await db.syncQueue.add({
      playerId,
      action: `${action}:${entityType}:${entityId}`,
      payload: JSON.stringify({ entityType, entityId, action, data: payload }),
      status: 'pending',
      createdAt: new Date(),
    });
  } catch {
    // Queue failure shouldn't break the app
  }
}

/** Convenience: queue a profile change */
export async function queueProfileSync(profile: PlayerProfile) {
  if (!profile.id) return;
  await queueChange(profile.id, 'profile', String(profile.id), 'update', {
    name: profile.name,
    avatarEmoji: profile.avatarEmoji,
    totalStars: profile.totalStars,
    streakDays: profile.streakDays,
    ageGroup: profile.ageGroup,
    interests: profile.interests,
    bedtimeMode: profile.bedtimeMode,
  });
}

/** Convenience: queue a progress change */
export async function queueProgressSync(
  playerId: number,
  entityType: EntityType,
  entityId: string,
  data: Record<string, unknown>,
) {
  await queueChange(playerId, entityType, entityId, 'update', data);
}

// ── Push / Pull ─────────────────────────────────────────────────────

/** Push all pending changes to the backend */
async function pushChanges(): Promise<number> {
  const pending = await db.syncQueue
    .where('status')
    .equals('pending')
    .limit(100)
    .toArray();

  if (pending.length === 0) return 0;

  // Group by player
  const byPlayer = new Map<number, SyncQueueEntry[]>();
  for (const entry of pending) {
    const list = byPlayer.get(entry.playerId) ?? [];
    list.push(entry);
    byPlayer.set(entry.playerId, list);
  }

  let pushed = 0;

  for (const [playerId, entries] of byPlayer) {
    const changes = entries.map(e => {
      const parsed = JSON.parse(e.payload);
      return {
        entityType: parsed.entityType,
        entityId: parsed.entityId,
        action: parsed.action,
        payload: parsed.data,
        clientTimestamp: e.createdAt.toISOString(),
      };
    });

    const res = await api.post('/api/sync/push', {
      profileId: String(playerId),
      changes,
    });

    if (res.ok) {
      // Mark as synced
      const ids = entries.map(e => e.id!).filter(Boolean);
      await db.syncQueue.where('id').anyOf(ids).modify({ status: 'synced', syncedAt: new Date() });
      pushed += entries.length;
    } else {
      // Mark as error (will retry next cycle)
      const ids = entries.map(e => e.id!).filter(Boolean);
      await db.syncQueue.where('id').anyOf(ids).modify({ status: 'error' });
    }
  }

  return pushed;
}

/** Pull changes from the backend for a profile */
async function pullChanges(playerId: number): Promise<number> {
  const res = await api.post<{ changes: Array<{ entityType: string; entityId: string; payload: Record<string, unknown> }> }>(
    '/api/sync/pull',
    { profileId: String(playerId), entityType: 'profile' },
  );

  if (!res.ok || !res.data?.changes) return 0;

  let applied = 0;

  for (const change of res.data.changes) {
    try {
      if (change.entityType === 'profile') {
        const existing = await db.profiles.get(playerId);
        if (existing) {
          // Merge server data (only update fields that are newer)
          await db.profiles.update(playerId, {
            totalStars: Math.max(existing.totalStars, (change.payload.totalStars as number) ?? 0),
            streakDays: Math.max(existing.streakDays, (change.payload.streakDays as number) ?? 0),
          });
          applied++;
        }
      }
    } catch {
      // Skip failed applies
    }
  }

  return applied;
}

// ── Full Sync Cycle ─────────────────────────────────────────────────

/** Run a full sync cycle: check backend → auth → push → pull */
export async function syncNow(): Promise<{ pushed: number; pulled: number }> {
  if (_syncStatus === 'syncing') return { pushed: 0, pulled: 0 };

  setStatus('syncing');

  try {
    // 1. Check if backend is reachable
    const online = await checkBackend();
    if (!online) {
      setStatus('offline');
      return { pushed: 0, pulled: 0 };
    }

    // 2. Auto-authenticate if needed
    if (!isAuthenticated()) {
      const authed = await autoRegister('Kids Learning App');
      if (!authed) {
        setStatus('error');
        return { pushed: 0, pulled: 0 };
      }
    }

    // 3. Push queued changes
    const pushed = await pushChanges();

    // 4. Pull for each local profile
    let pulled = 0;
    const profiles = await db.profiles.toArray();
    for (const profile of profiles) {
      if (profile.id) {
        pulled += await pullChanges(profile.id);
      }
    }

    // 5. Clean up old synced entries (older than 7 days)
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    await db.syncQueue.where('status').equals('synced').and(e => e.createdAt < cutoff).delete();

    setStatus('idle');
    return { pushed, pulled };
  } catch {
    setStatus('error');
    return { pushed: 0, pulled: 0 };
  }
}

/** Get count of pending sync entries */
export async function getPendingCount(): Promise<number> {
  return db.syncQueue.where('status').equals('pending').count();
}

// ── Auto Sync ───────────────────────────────────────────────────────

const SYNC_INTERVAL = 60_000; // 1 minute

/** Start periodic background sync */
export function startAutoSync() {
  if (_syncInterval) return;

  // Initial sync after 5 seconds (let app load first)
  setTimeout(() => syncNow(), 5000);

  // Then sync every minute
  _syncInterval = setInterval(() => {
    if (document.visibilityState === 'visible') {
      syncNow();
    }
  }, SYNC_INTERVAL);

  // Sync when coming back online
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => syncNow());
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') syncNow();
    });
  }
}

/** Stop periodic sync */
export function stopAutoSync() {
  if (_syncInterval) {
    clearInterval(_syncInterval);
    _syncInterval = null;
  }
}
