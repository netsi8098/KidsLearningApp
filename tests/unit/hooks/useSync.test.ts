import { renderHook, act } from '@testing-library/react';
import { useSync } from '../../../src/hooks/useSync';

const mocks = vi.hoisted(() => ({
  mockPlayerId: 1 as number | undefined,
  mockQueueItems: [] as {
    id?: number;
    playerId: number;
    status: string;
    syncedAt?: Date;
    action: string;
    payload: string;
    createdAt: Date;
  }[],
  mockSyncQueueUpdate: vi.fn(),
  mockSyncQueueFilterToArray: vi.fn(),
}));

vi.mock('../../../src/context/AppContext', () => ({
  useApp: () => ({
    currentPlayer: mocks.mockPlayerId ? { id: mocks.mockPlayerId } : null,
  }),
}));

vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: () => mocks.mockQueueItems,
}));

vi.mock('../../../src/db/database', () => ({
  db: {
    syncQueue: {
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          toArray: vi.fn(() => Promise.resolve(mocks.mockQueueItems)),
          filter: vi.fn(() => ({
            toArray: mocks.mockSyncQueueFilterToArray,
          })),
        })),
      })),
      update: mocks.mockSyncQueueUpdate,
    },
  },
}));

describe('useSync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mockPlayerId = 1;
    mocks.mockQueueItems = [];
    mocks.mockSyncQueueFilterToArray.mockResolvedValue([]);

    // Reset navigator.onLine to true
    Object.defineProperty(navigator, 'onLine', {
      value: true,
      writable: true,
      configurable: true,
    });
  });

  describe('syncStatus', () => {
    it('defaults to synced status', () => {
      const { result } = renderHook(() => useSync());
      expect(result.current.syncStatus).toBe('synced');
    });

    it('reports offline when navigator.onLine is false', async () => {
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useSync());

      await act(async () => {
        await result.current.triggerSync();
      });

      expect(result.current.syncStatus).toBe('offline');
    });

    it('reports error when sync fails', async () => {
      mocks.mockSyncQueueFilterToArray.mockRejectedValue(new Error('DB error'));

      const { result } = renderHook(() => useSync());

      await act(async () => {
        await result.current.triggerSync();
      });

      expect(result.current.syncStatus).toBe('error');
    });
  });

  describe('triggerSync', () => {
    it('returns early when no playerId', async () => {
      mocks.mockPlayerId = undefined;
      const { result } = renderHook(() => useSync());

      await act(async () => {
        await result.current.triggerSync();
      });

      // Should still be synced (initial state), no DB calls
      expect(result.current.syncStatus).toBe('synced');
      expect(mocks.mockSyncQueueUpdate).not.toHaveBeenCalled();
    });

    it('processes pending items by updating status to synced', async () => {
      const pendingItems = [
        { id: 1, playerId: 1, status: 'pending', action: 'create', payload: '{}', createdAt: new Date() },
        { id: 2, playerId: 1, status: 'pending', action: 'update', payload: '{}', createdAt: new Date() },
      ];
      mocks.mockSyncQueueFilterToArray.mockResolvedValue(pendingItems);

      const { result } = renderHook(() => useSync());

      await act(async () => {
        await result.current.triggerSync();
      });

      expect(mocks.mockSyncQueueUpdate).toHaveBeenCalledTimes(2);
      expect(mocks.mockSyncQueueUpdate).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ status: 'synced' })
      );
      expect(mocks.mockSyncQueueUpdate).toHaveBeenCalledWith(
        2,
        expect.objectContaining({ status: 'synced' })
      );
      expect(result.current.syncStatus).toBe('synced');
    });

    it('sets syncedAt timestamp when processing items', async () => {
      const pendingItems = [
        { id: 1, playerId: 1, status: 'pending', action: 'create', payload: '{}', createdAt: new Date() },
      ];
      mocks.mockSyncQueueFilterToArray.mockResolvedValue(pendingItems);

      const { result } = renderHook(() => useSync());

      await act(async () => {
        await result.current.triggerSync();
      });

      expect(mocks.mockSyncQueueUpdate).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          status: 'synced',
          syncedAt: expect.any(Date),
        })
      );
    });

    it('handles empty pending queue gracefully', async () => {
      mocks.mockSyncQueueFilterToArray.mockResolvedValue([]);

      const { result } = renderHook(() => useSync());

      await act(async () => {
        await result.current.triggerSync();
      });

      expect(mocks.mockSyncQueueUpdate).not.toHaveBeenCalled();
      expect(result.current.syncStatus).toBe('synced');
    });
  });

  describe('pendingCount', () => {
    it('reflects number of pending items in queue', () => {
      mocks.mockQueueItems = [
        { id: 1, playerId: 1, status: 'pending', action: 'create', payload: '{}', createdAt: new Date() },
        { id: 2, playerId: 1, status: 'pending', action: 'update', payload: '{}', createdAt: new Date() },
        { id: 3, playerId: 1, status: 'synced', action: 'create', payload: '{}', createdAt: new Date(), syncedAt: new Date() },
      ];

      const { result } = renderHook(() => useSync());
      expect(result.current.pendingCount).toBe(2);
    });

    it('returns 0 when no pending items', () => {
      mocks.mockQueueItems = [
        { id: 1, playerId: 1, status: 'synced', action: 'create', payload: '{}', createdAt: new Date(), syncedAt: new Date() },
      ];

      const { result } = renderHook(() => useSync());
      expect(result.current.pendingCount).toBe(0);
    });

    it('returns 0 when queue is empty', () => {
      mocks.mockQueueItems = [];
      const { result } = renderHook(() => useSync());
      expect(result.current.pendingCount).toBe(0);
    });
  });

  describe('conflicts', () => {
    it('counts items with error status', () => {
      mocks.mockQueueItems = [
        { id: 1, playerId: 1, status: 'error', action: 'create', payload: '{}', createdAt: new Date() },
        { id: 2, playerId: 1, status: 'pending', action: 'update', payload: '{}', createdAt: new Date() },
        { id: 3, playerId: 1, status: 'error', action: 'delete', payload: '{}', createdAt: new Date() },
      ];

      const { result } = renderHook(() => useSync());
      expect(result.current.conflicts).toBe(2);
    });

    it('returns 0 when no error items', () => {
      mocks.mockQueueItems = [
        { id: 1, playerId: 1, status: 'synced', action: 'create', payload: '{}', createdAt: new Date(), syncedAt: new Date() },
      ];

      const { result } = renderHook(() => useSync());
      expect(result.current.conflicts).toBe(0);
    });
  });

  describe('lastSyncedAt', () => {
    it('returns null when no synced items', () => {
      mocks.mockQueueItems = [
        { id: 1, playerId: 1, status: 'pending', action: 'create', payload: '{}', createdAt: new Date() },
      ];

      const { result } = renderHook(() => useSync());
      expect(result.current.lastSyncedAt).toBeNull();
    });

    it('returns the most recent syncedAt date', () => {
      const olderDate = new Date('2025-01-01');
      const newerDate = new Date('2025-06-15');

      mocks.mockQueueItems = [
        { id: 1, playerId: 1, status: 'synced', action: 'create', payload: '{}', createdAt: new Date(), syncedAt: olderDate },
        { id: 2, playerId: 1, status: 'synced', action: 'update', payload: '{}', createdAt: new Date(), syncedAt: newerDate },
      ];

      const { result } = renderHook(() => useSync());
      expect(result.current.lastSyncedAt).toEqual(newerDate);
    });

    it('ignores items without syncedAt', () => {
      const syncDate = new Date('2025-03-01');
      mocks.mockQueueItems = [
        { id: 1, playerId: 1, status: 'pending', action: 'create', payload: '{}', createdAt: new Date() },
        { id: 2, playerId: 1, status: 'synced', action: 'update', payload: '{}', createdAt: new Date(), syncedAt: syncDate },
      ];

      const { result } = renderHook(() => useSync());
      expect(result.current.lastSyncedAt).toEqual(syncDate);
    });
  });
});
