import { useState, useCallback, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { useApp } from '../context/AppContext';
import {
  syncNow,
  startAutoSync,
  stopAutoSync,
  getSyncStatus as getServiceStatus,
  onSyncStatusChange,
  type SyncStatus as ServiceSyncStatus,
} from '../services/syncService';
import { isBackendOnline, onBackendStatusChange } from '../services/apiService';

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error';

export interface SyncState {
  syncStatus: SyncStatus;
  lastSyncedAt: Date | null;
  triggerSync: () => Promise<void>;
  conflicts: number;
  pendingCount: number;
  backendOnline: boolean;
}

function mapStatus(s: ServiceSyncStatus): SyncStatus {
  if (s === 'idle') return 'synced';
  return s;
}

export function useSync(): SyncState {
  const { currentPlayer } = useApp();
  const playerId = currentPlayer?.id;
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(mapStatus(getServiceStatus()));
  const [backendOnline, setBackendOnline] = useState(isBackendOnline());

  // Subscribe to sync service status
  useEffect(() => {
    onSyncStatusChange((s) => setSyncStatus(mapStatus(s)));
    onBackendStatusChange(setBackendOnline);
    startAutoSync();
    return () => stopAutoSync();
  }, []);

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
    if (!navigator.onLine) {
      setSyncStatus('offline');
      return;
    }
    await syncNow();
  }, []);

  return {
    syncStatus,
    lastSyncedAt,
    triggerSync,
    conflicts,
    pendingCount,
    backendOnline,
  };
}
