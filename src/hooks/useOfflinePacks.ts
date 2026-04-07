// ── Offline Packs Hook ──────────────────────────────────
// Service Worker Cache API integration for offline content packs.

import { useState, useCallback } from 'react';
import { offlinePacks } from '../registry/offlinePacksConfig';
import type { OfflinePack } from '../registry/types';

export type PackStatus = 'available' | 'downloading' | 'ready' | 'error';

interface PackState {
  pack: OfflinePack;
  status: PackStatus;
  progress: number;
}

export function useOfflinePacks() {
  const [packStates, setPackStates] = useState<Map<string, PackState>>(() => {
    const map = new Map<string, PackState>();
    for (const pack of offlinePacks) {
      map.set(pack.id, { pack, status: 'available', progress: 0 });
    }
    return map;
  });

  const downloadPack = useCallback(async (packId: string) => {
    const state = packStates.get(packId);
    if (!state || state.status === 'downloading' || state.status === 'ready') return;

    setPackStates((prev) => {
      const next = new Map(prev);
      next.set(packId, { ...state, status: 'downloading', progress: 0 });
      return next;
    });

    try {
      // Simulate download progress
      // In production, this would use the Cache API
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((r) => setTimeout(r, 100));
        setPackStates((prev) => {
          const next = new Map(prev);
          const current = next.get(packId);
          if (current) {
            next.set(packId, { ...current, progress: i });
          }
          return next;
        });
      }

      setPackStates((prev) => {
        const next = new Map(prev);
        next.set(packId, { ...state, status: 'ready', progress: 100 });
        return next;
      });
    } catch {
      setPackStates((prev) => {
        const next = new Map(prev);
        next.set(packId, { ...state, status: 'error', progress: 0 });
        return next;
      });
    }
  }, [packStates]);

  const removePack = useCallback(async (packId: string) => {
    const state = packStates.get(packId);
    if (!state) return;

    setPackStates((prev) => {
      const next = new Map(prev);
      next.set(packId, { ...state, status: 'available', progress: 0 });
      return next;
    });
  }, [packStates]);

  function getPackStatus(packId: string): PackStatus {
    return packStates.get(packId)?.status ?? 'available';
  }

  function getPackProgress(packId: string): number {
    return packStates.get(packId)?.progress ?? 0;
  }

  return {
    packs: offlinePacks,
    packStates,
    downloadPack,
    removePack,
    getPackStatus,
    getPackProgress,
  };
}
