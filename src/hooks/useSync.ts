import { useState, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { useApp } from '../context/AppContext';

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error';

export interface SyncState {
  syncStatus: SyncStatus;
  lastSyncedAt: Date | null;
  triggerSync: () => Promise<void>;
  conflicts: number;
  pendingCount: number;
}

export function useSync(): SyncState {
  const { currentPlayer } = useApp();
  const playerId = currentPlayer?.id;
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');

  const queue = useLiveQuery(
    () => (playerId ? db.syncQueue.where('playerId').equals(playerId).toArray() : []),
    [playerId],
    []
  );

  const pendingCount = queue.filter((q) => q.status === 'pending').length;
  const conflicts = queue.filter((q) => q.status === 'error').length;

  const lastSynced = queue
    .filter((q) => q.syncedAt)
    .sort((a, b) => new Date(b.syncedAt!).getTime() - new Date(a.syncedAt!).getTime())[0];

  const lastSyncedAt = lastSynced?.syncedAt ? new Date(lastSynced.syncedAt) : null;

  const triggerSync = useCallback(async () => {
    if (!playerId) return;
    if (!navigator.onLine) {
      setSyncStatus('offline');
      return;
    }

    setSyncStatus('syncing');
    try {
      // Process pending queue items
      const pendingItems = await db.syncQueue
        .where('playerId')
        .equals(playerId)
        .filter((item) => item.status === 'pending')
        .toArray();

      for (const item of pendingItems) {
        await db.syncQueue.update(item.id!, {
          status: 'synced',
          syncedAt: new Date(),
        });
      }

      setSyncStatus('synced');
    } catch {
      setSyncStatus('error');
    }
  }, [playerId]);

  return {
    syncStatus,
    lastSyncedAt,
    triggerSync,
    conflicts,
    pendingCount,
  };
}
