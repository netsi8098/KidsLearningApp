import { renderHook, act } from '@testing-library/react';
import { useVideos } from '../../../src/hooks/useVideos';

const mocks = vi.hoisted(() => ({
  mockPlayerId: 1 as number | undefined,
  mockFavorites: [] as {
    id?: number;
    playerId: number;
    videoId: string;
    addedAt: Date;
  }[],
  mockHistory: [] as {
    id?: number;
    playerId: number;
    videoId: string;
    videoTitle: string;
    videoChannel: string;
    videoThumbnail: string;
    watchedAt: Date;
  }[],
  mockVideoFavoritesAdd: vi.fn(),
  mockVideoFavoritesDelete: vi.fn(),
  mockVideoFavoritesFirst: vi.fn(),
  mockWatchHistoryAdd: vi.fn(),
}));

vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: (fn: () => unknown, deps: unknown[], defaultValue: unknown) => {
    // Return favorites for the first call, history for the second
    if (defaultValue && Array.isArray(defaultValue)) {
      // Differentiate based on mock data
    }
    return defaultValue;
  },
}));

// We override useLiveQuery to return alternating data by using a counter
let liveQueryCallCount = 0;

vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: () => {
    liveQueryCallCount++;
    // Odd calls return favorites, even calls return history
    if (liveQueryCallCount % 2 === 1) return mocks.mockFavorites;
    return mocks.mockHistory;
  },
}));

vi.mock('../../../src/db/database', () => ({
  db: {
    videoFavorites: {
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          toArray: vi.fn(() => Promise.resolve(mocks.mockFavorites)),
          first: mocks.mockVideoFavoritesFirst,
        })),
      })),
      add: mocks.mockVideoFavoritesAdd,
      delete: mocks.mockVideoFavoritesDelete,
    },
    watchHistory: {
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          toArray: vi.fn(() => Promise.resolve(mocks.mockHistory)),
        })),
      })),
      add: mocks.mockWatchHistoryAdd,
    },
  },
}));

const makeMockVideo = (overrides = {}) => ({
  id: 'vid-1',
  title: 'ABC Song',
  channel: 'Kids Channel',
  thumbnail: 'https://img.youtube.com/vi/vid-1/mqdefault.jpg',
  duration: '3:42',
  category: 'learning' as const,
  ...overrides,
});

describe('useVideos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    liveQueryCallCount = 0;
    mocks.mockPlayerId = 1;
    mocks.mockFavorites = [];
    mocks.mockHistory = [];
    mocks.mockVideoFavoritesFirst.mockResolvedValue(undefined);
  });

  describe('favorites', () => {
    it('returns empty favorites when none exist', () => {
      const { result } = renderHook(() => useVideos(1));
      expect(result.current.favorites).toEqual([]);
    });

    it('returns favorite records from live query', () => {
      mocks.mockFavorites = [
        { id: 1, playerId: 1, videoId: 'vid-1', addedAt: new Date() },
        { id: 2, playerId: 1, videoId: 'vid-2', addedAt: new Date() },
      ];
      const { result } = renderHook(() => useVideos(1));
      expect(result.current.favorites).toHaveLength(2);
    });
  });

  describe('favoriteIds', () => {
    it('returns empty set when no favorites', () => {
      const { result } = renderHook(() => useVideos(1));
      expect(result.current.favoriteIds.size).toBe(0);
    });

    it('contains IDs of favorited videos', () => {
      mocks.mockFavorites = [
        { id: 1, playerId: 1, videoId: 'vid-1', addedAt: new Date() },
        { id: 2, playerId: 1, videoId: 'vid-3', addedAt: new Date() },
      ];
      const { result } = renderHook(() => useVideos(1));
      expect(result.current.favoriteIds.has('vid-1')).toBe(true);
      expect(result.current.favoriteIds.has('vid-3')).toBe(true);
      expect(result.current.favoriteIds.has('vid-2')).toBe(false);
    });
  });

  describe('toggleFavorite', () => {
    it('does nothing when no player is set', async () => {
      const { result } = renderHook(() => useVideos(undefined));

      await act(async () => {
        await result.current.toggleFavorite('vid-1');
      });

      expect(mocks.mockVideoFavoritesAdd).not.toHaveBeenCalled();
      expect(mocks.mockVideoFavoritesDelete).not.toHaveBeenCalled();
    });

    it('adds favorite when not already favorited', async () => {
      mocks.mockVideoFavoritesFirst.mockResolvedValue(undefined);
      const { result } = renderHook(() => useVideos(1));

      await act(async () => {
        await result.current.toggleFavorite('vid-1');
      });

      expect(mocks.mockVideoFavoritesAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          playerId: 1,
          videoId: 'vid-1',
          addedAt: expect.any(Date),
        })
      );
    });

    it('removes favorite when already favorited', async () => {
      mocks.mockVideoFavoritesFirst.mockResolvedValue({ id: 5, playerId: 1, videoId: 'vid-1', addedAt: new Date() });
      const { result } = renderHook(() => useVideos(1));

      await act(async () => {
        await result.current.toggleFavorite('vid-1');
      });

      expect(mocks.mockVideoFavoritesDelete).toHaveBeenCalledWith(5);
    });
  });

  describe('addToHistory', () => {
    it('does nothing when no player is set', async () => {
      const { result } = renderHook(() => useVideos(undefined));
      const video = makeMockVideo();

      await act(async () => {
        await result.current.addToHistory(video);
      });

      expect(mocks.mockWatchHistoryAdd).not.toHaveBeenCalled();
    });

    it('adds video to watch history', async () => {
      const { result } = renderHook(() => useVideos(1));
      const video = makeMockVideo();

      await act(async () => {
        await result.current.addToHistory(video);
      });

      expect(mocks.mockWatchHistoryAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          playerId: 1,
          videoId: 'vid-1',
          videoTitle: 'ABC Song',
          videoChannel: 'Kids Channel',
          videoThumbnail: 'https://img.youtube.com/vi/vid-1/mqdefault.jpg',
          watchedAt: expect.any(Date),
        })
      );
    });
  });

  describe('getRecentHistory', () => {
    it('returns empty array when no history', () => {
      const { result } = renderHook(() => useVideos(1));
      expect(result.current.getRecentHistory()).toEqual([]);
    });

    it('deduplicates history by videoId keeping most recent', () => {
      const older = new Date('2024-01-01');
      const newer = new Date('2024-01-02');
      mocks.mockHistory = [
        { id: 2, playerId: 1, videoId: 'vid-1', videoTitle: 'ABC Song', videoChannel: 'Ch', videoThumbnail: 'thumb', watchedAt: newer },
        { id: 1, playerId: 1, videoId: 'vid-1', videoTitle: 'ABC Song', videoChannel: 'Ch', videoThumbnail: 'thumb', watchedAt: older },
        { id: 3, playerId: 1, videoId: 'vid-2', videoTitle: 'Numbers', videoChannel: 'Ch', videoThumbnail: 'thumb', watchedAt: newer },
      ];

      const { result } = renderHook(() => useVideos(1));
      const recent = result.current.getRecentHistory();
      expect(recent).toHaveLength(2);
      expect(recent[0].videoId).toBe('vid-1');
      expect(recent[1].videoId).toBe('vid-2');
    });

    it('limits to 20 entries', () => {
      mocks.mockHistory = Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        playerId: 1,
        videoId: `vid-${i}`,
        videoTitle: `Video ${i}`,
        videoChannel: 'Ch',
        videoThumbnail: 'thumb',
        watchedAt: new Date(),
      }));

      const { result } = renderHook(() => useVideos(1));
      const recent = result.current.getRecentHistory();
      expect(recent.length).toBeLessThanOrEqual(20);
    });
  });

  describe('history', () => {
    it('returns empty array when no history', () => {
      const { result } = renderHook(() => useVideos(1));
      expect(result.current.history).toEqual([]);
    });
  });
});
