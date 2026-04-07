import { renderHook, act } from '@testing-library/react';
import { useRediscovery } from '../../../src/hooks/useRediscovery';

const mocks = vi.hoisted(() => ({
  mockPlayerId: 1 as number | undefined,
  mockHistory: [] as {
    playerId: number;
    contentId: string;
    interactedAt: Date;
    completed?: boolean;
    durationSeconds?: number;
  }[],
  mockFavRecords: [] as { id?: number; playerId: number; contentId: string; addedAt: Date }[],
  mockContentItems: new Map<string, { id: string; type: string; sourceId: string; title: string; emoji: string; route: string }>(),
  mockUniversalFavoritesFirst: vi.fn(),
  mockUniversalFavoritesDelete: vi.fn(),
  mockUniversalFavoritesAdd: vi.fn(),
  mockContentHistoryAdd: vi.fn(),
  // Track useLiveQuery call order
  useLiveQueryCallIndex: 0,
}));

vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: () => {
    const index = mocks.useLiveQueryCallIndex++;
    if (index % 2 === 0) return mocks.mockHistory;
    return mocks.mockFavRecords;
  },
}));

vi.mock('../../../src/registry/contentRegistry', () => ({
  getContentItem: (id: string) => mocks.mockContentItems.get(id),
}));

vi.mock('../../../src/db/database', () => ({
  db: {
    contentHistory: {
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          filter: vi.fn(() => ({
            reverse: vi.fn(() => ({
              sortBy: vi.fn(() => Promise.resolve(mocks.mockHistory)),
            })),
          })),
        })),
      })),
      add: mocks.mockContentHistoryAdd,
    },
    universalFavorites: {
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          toArray: vi.fn(() => Promise.resolve(mocks.mockFavRecords)),
          first: mocks.mockUniversalFavoritesFirst,
        })),
      })),
      delete: mocks.mockUniversalFavoritesDelete,
      add: mocks.mockUniversalFavoritesAdd,
    },
  },
}));

describe('useRediscovery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mockPlayerId = 1;
    mocks.mockHistory = [];
    mocks.mockFavRecords = [];
    mocks.useLiveQueryCallIndex = 0;
    mocks.mockUniversalFavoritesFirst.mockResolvedValue(undefined);

    // Set up mock content items
    mocks.mockContentItems.clear();
    mocks.mockContentItems.set('lesson:abc', {
      id: 'lesson:abc', type: 'lesson', sourceId: 'abc', title: 'ABC Basics', emoji: '🔤', route: '/abc',
    });
    mocks.mockContentItems.set('story:magic', {
      id: 'story:magic', type: 'story', sourceId: 'magic', title: 'Magic Garden', emoji: '🌸', route: '/stories',
    });
    mocks.mockContentItems.set('game:memory', {
      id: 'game:memory', type: 'game', sourceId: 'memory', title: 'Memory Match', emoji: '🧠', route: '/games',
    });
    mocks.mockContentItems.set('lesson:numbers', {
      id: 'lesson:numbers', type: 'lesson', sourceId: 'numbers', title: 'Numbers Fun', emoji: '🔢', route: '/numbers',
    });
  });

  describe('recentlyPlayed', () => {
    it('returns empty array when no history', () => {
      const { result } = renderHook(() => useRediscovery(mocks.mockPlayerId));
      expect(result.current.recentlyPlayed).toEqual([]);
    });

    it('returns content items from history', () => {
      mocks.mockHistory = [
        { playerId: 1, contentId: 'lesson:abc', interactedAt: new Date(), completed: true },
        { playerId: 1, contentId: 'story:magic', interactedAt: new Date(), completed: true },
      ];

      const { result } = renderHook(() => useRediscovery(mocks.mockPlayerId));
      expect(result.current.recentlyPlayed).toHaveLength(2);
      expect(result.current.recentlyPlayed[0].id).toBe('lesson:abc');
    });

    it('deduplicates items by contentId', () => {
      mocks.mockHistory = [
        { playerId: 1, contentId: 'lesson:abc', interactedAt: new Date(), completed: true },
        { playerId: 1, contentId: 'lesson:abc', interactedAt: new Date(), completed: false },
        { playerId: 1, contentId: 'story:magic', interactedAt: new Date(), completed: true },
      ];

      const { result } = renderHook(() => useRediscovery(mocks.mockPlayerId));
      expect(result.current.recentlyPlayed).toHaveLength(2);
    });

    it('limits to 10 items', () => {
      const history = [];
      for (let i = 0; i < 15; i++) {
        const id = `item:${i}`;
        mocks.mockContentItems.set(id, {
          id, type: 'lesson', sourceId: `${i}`, title: `Item ${i}`, emoji: '📝', route: '/lessons',
        });
        history.push({ playerId: 1, contentId: id, interactedAt: new Date(), completed: true });
      }
      mocks.mockHistory = history;

      const { result } = renderHook(() => useRediscovery(mocks.mockPlayerId));
      expect(result.current.recentlyPlayed.length).toBeLessThanOrEqual(10);
    });

    it('skips items not found in content registry', () => {
      mocks.mockHistory = [
        { playerId: 1, contentId: 'lesson:abc', interactedAt: new Date(), completed: true },
        { playerId: 1, contentId: 'unknown:item', interactedAt: new Date(), completed: true },
      ];

      const { result } = renderHook(() => useRediscovery(mocks.mockPlayerId));
      expect(result.current.recentlyPlayed).toHaveLength(1);
      expect(result.current.recentlyPlayed[0].id).toBe('lesson:abc');
    });
  });

  describe('playedThisWeek', () => {
    it('returns same items as recentlyPlayed', () => {
      mocks.mockHistory = [
        { playerId: 1, contentId: 'lesson:abc', interactedAt: new Date(), completed: true },
      ];

      const { result } = renderHook(() => useRediscovery(mocks.mockPlayerId));
      expect(result.current.playedThisWeek).toEqual(result.current.recentlyPlayed);
    });
  });

  describe('favorites', () => {
    it('returns empty array when no favorites', () => {
      const { result } = renderHook(() => useRediscovery(mocks.mockPlayerId));
      expect(result.current.favorites).toEqual([]);
    });

    it('resolves favorite records to content items', () => {
      mocks.mockFavRecords = [
        { id: 1, playerId: 1, contentId: 'lesson:abc', addedAt: new Date() },
        { id: 2, playerId: 1, contentId: 'story:magic', addedAt: new Date() },
      ];

      const { result } = renderHook(() => useRediscovery(mocks.mockPlayerId));
      expect(result.current.favorites).toHaveLength(2);
      expect(result.current.favorites[0].id).toBe('lesson:abc');
      expect(result.current.favorites[1].id).toBe('story:magic');
    });

    it('filters out favorites not found in registry', () => {
      mocks.mockFavRecords = [
        { id: 1, playerId: 1, contentId: 'lesson:abc', addedAt: new Date() },
        { id: 2, playerId: 1, contentId: 'unknown:x', addedAt: new Date() },
      ];

      const { result } = renderHook(() => useRediscovery(mocks.mockPlayerId));
      expect(result.current.favorites).toHaveLength(1);
    });
  });

  describe('favoriteIds', () => {
    it('returns empty set when no favorites', () => {
      const { result } = renderHook(() => useRediscovery(mocks.mockPlayerId));
      expect(result.current.favoriteIds.size).toBe(0);
    });

    it('returns set of content IDs from favorites', () => {
      mocks.mockFavRecords = [
        { id: 1, playerId: 1, contentId: 'lesson:abc', addedAt: new Date() },
        { id: 2, playerId: 1, contentId: 'story:magic', addedAt: new Date() },
      ];

      const { result } = renderHook(() => useRediscovery(mocks.mockPlayerId));
      expect(result.current.favoriteIds.has('lesson:abc')).toBe(true);
      expect(result.current.favoriteIds.has('story:magic')).toBe(true);
      expect(result.current.favoriteIds.has('game:memory')).toBe(false);
    });
  });

  describe('playAgain', () => {
    it('returns empty array when no item has been played twice', () => {
      mocks.mockHistory = [
        { playerId: 1, contentId: 'lesson:abc', interactedAt: new Date(), completed: true },
      ];

      const { result } = renderHook(() => useRediscovery(mocks.mockPlayerId));
      expect(result.current.playAgain).toEqual([]);
    });

    it('returns items played at least twice', () => {
      mocks.mockHistory = [
        { playerId: 1, contentId: 'lesson:abc', interactedAt: new Date(), completed: true },
        { playerId: 1, contentId: 'lesson:abc', interactedAt: new Date(), completed: true },
        { playerId: 1, contentId: 'story:magic', interactedAt: new Date(), completed: true },
      ];

      const { result } = renderHook(() => useRediscovery(mocks.mockPlayerId));
      expect(result.current.playAgain).toHaveLength(1);
      expect(result.current.playAgain[0].id).toBe('lesson:abc');
    });

    it('limits to 6 items', () => {
      const history = [];
      for (let i = 0; i < 10; i++) {
        const id = `item:${i}`;
        mocks.mockContentItems.set(id, {
          id, type: 'lesson', sourceId: `${i}`, title: `Item ${i}`, emoji: '📝', route: '/lessons',
        });
        history.push(
          { playerId: 1, contentId: id, interactedAt: new Date(), completed: true },
          { playerId: 1, contentId: id, interactedAt: new Date(), completed: true },
        );
      }
      mocks.mockHistory = history;

      const { result } = renderHook(() => useRediscovery(mocks.mockPlayerId));
      expect(result.current.playAgain.length).toBeLessThanOrEqual(6);
    });
  });

  describe('continueWhereLeftOff', () => {
    it('returns empty array when all items are completed', () => {
      mocks.mockHistory = [
        { playerId: 1, contentId: 'lesson:abc', interactedAt: new Date(), completed: true },
      ];

      const { result } = renderHook(() => useRediscovery(mocks.mockPlayerId));
      expect(result.current.continueWhereLeftOff).toEqual([]);
    });

    it('returns incomplete items', () => {
      mocks.mockHistory = [
        { playerId: 1, contentId: 'lesson:abc', interactedAt: new Date(), completed: false },
        { playerId: 1, contentId: 'story:magic', interactedAt: new Date(), completed: true },
      ];

      const { result } = renderHook(() => useRediscovery(mocks.mockPlayerId));
      expect(result.current.continueWhereLeftOff).toHaveLength(1);
      expect(result.current.continueWhereLeftOff[0].id).toBe('lesson:abc');
    });

    it('limits to 4 items', () => {
      const history = [];
      for (let i = 0; i < 8; i++) {
        const id = `item:${i}`;
        mocks.mockContentItems.set(id, {
          id, type: 'lesson', sourceId: `${i}`, title: `Item ${i}`, emoji: '📝', route: '/lessons',
        });
        history.push({ playerId: 1, contentId: id, interactedAt: new Date(), completed: false });
      }
      mocks.mockHistory = history;

      const { result } = renderHook(() => useRediscovery(mocks.mockPlayerId));
      expect(result.current.continueWhereLeftOff.length).toBeLessThanOrEqual(4);
    });

    it('deduplicates incomplete items', () => {
      mocks.mockHistory = [
        { playerId: 1, contentId: 'lesson:abc', interactedAt: new Date(), completed: false },
        { playerId: 1, contentId: 'lesson:abc', interactedAt: new Date(), completed: false },
      ];

      const { result } = renderHook(() => useRediscovery(mocks.mockPlayerId));
      expect(result.current.continueWhereLeftOff).toHaveLength(1);
    });
  });

  describe('toggleUniversalFavorite', () => {
    it('adds favorite when it does not exist', async () => {
      mocks.mockUniversalFavoritesFirst.mockResolvedValue(undefined);

      const { result } = renderHook(() => useRediscovery(mocks.mockPlayerId));

      await act(async () => {
        await result.current.toggleUniversalFavorite('lesson:abc');
      });

      expect(mocks.mockUniversalFavoritesAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          playerId: 1,
          contentId: 'lesson:abc',
          addedAt: expect.any(Date),
        })
      );
    });

    it('removes favorite when it already exists', async () => {
      mocks.mockUniversalFavoritesFirst.mockResolvedValue({
        id: 42,
        playerId: 1,
        contentId: 'lesson:abc',
        addedAt: new Date(),
      });

      const { result } = renderHook(() => useRediscovery(mocks.mockPlayerId));

      await act(async () => {
        await result.current.toggleUniversalFavorite('lesson:abc');
      });

      expect(mocks.mockUniversalFavoritesDelete).toHaveBeenCalledWith(42);
      expect(mocks.mockUniversalFavoritesAdd).not.toHaveBeenCalled();
    });

    it('does nothing when no player is set', async () => {
      const { result } = renderHook(() => useRediscovery(undefined));

      await act(async () => {
        await result.current.toggleUniversalFavorite('lesson:abc');
      });

      expect(mocks.mockUniversalFavoritesAdd).not.toHaveBeenCalled();
      expect(mocks.mockUniversalFavoritesDelete).not.toHaveBeenCalled();
    });
  });

  describe('logContentInteraction', () => {
    it('adds content history record', async () => {
      const { result } = renderHook(() => useRediscovery(mocks.mockPlayerId));

      await act(async () => {
        await result.current.logContentInteraction('lesson:abc', true, 120);
      });

      expect(mocks.mockContentHistoryAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          playerId: 1,
          contentId: 'lesson:abc',
          interactedAt: expect.any(Date),
          completed: true,
          durationSeconds: 120,
        })
      );
    });

    it('defaults completed to false', async () => {
      const { result } = renderHook(() => useRediscovery(mocks.mockPlayerId));

      await act(async () => {
        await result.current.logContentInteraction('lesson:abc');
      });

      expect(mocks.mockContentHistoryAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          completed: false,
        })
      );
    });

    it('does nothing when no player is set', async () => {
      const { result } = renderHook(() => useRediscovery(undefined));

      await act(async () => {
        await result.current.logContentInteraction('lesson:abc', true);
      });

      expect(mocks.mockContentHistoryAdd).not.toHaveBeenCalled();
    });
  });
});
