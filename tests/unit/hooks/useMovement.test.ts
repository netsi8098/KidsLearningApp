import { renderHook, act } from '@testing-library/react';
import { useMovement } from '../../../src/hooks/useMovement';

const mocks = vi.hoisted(() => ({
  mockPlayerId: 1 as number | undefined,
  mockProgress: [] as {
    id?: number;
    playerId: number;
    activityId: string;
    completed: boolean;
    favorite: boolean;
    timesCompleted: number;
    lastPlayedAt: Date;
  }[],
  mockMovementProgressAdd: vi.fn(),
  mockMovementProgressUpdate: vi.fn(),
  mockMovementProgressFirst: vi.fn(),
  mockStarsAdd: vi.fn(),
  mockAddStars: vi.fn(),
  mockShowStarBurst: vi.fn(),
  mockShowCelebration: vi.fn(),
}));

vi.mock('../../../src/context/AppContext', () => ({
  useApp: () => ({
    currentPlayer: mocks.mockPlayerId ? { id: mocks.mockPlayerId } : null,
    showStarBurst: mocks.mockShowStarBurst,
    showCelebration: mocks.mockShowCelebration,
  }),
}));

vi.mock('../../../src/hooks/useProfile', () => ({
  useProfiles: () => ({
    addStars: mocks.mockAddStars,
  }),
}));

vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: () => mocks.mockProgress,
}));

vi.mock('../../../src/db/database', () => ({
  db: {
    movementProgress: {
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          toArray: vi.fn(() => Promise.resolve(mocks.mockProgress)),
          first: mocks.mockMovementProgressFirst,
        })),
      })),
      add: mocks.mockMovementProgressAdd,
      update: mocks.mockMovementProgressUpdate,
    },
    stars: {
      add: mocks.mockStarsAdd,
    },
  },
}));

describe('useMovement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mockPlayerId = 1;
    mocks.mockProgress = [];
    mocks.mockMovementProgressFirst.mockResolvedValue(undefined);
    mocks.mockMovementProgressAdd.mockResolvedValue(1);
  });

  describe('allProgress', () => {
    it('returns empty array when no progress exists', () => {
      const { result } = renderHook(() => useMovement(1));
      expect(result.current.allProgress).toEqual([]);
    });

    it('returns progress records from live query', () => {
      mocks.mockProgress = [
        { id: 1, playerId: 1, activityId: 'yoga-1', completed: true, favorite: false, timesCompleted: 3, lastPlayedAt: new Date() },
      ];
      const { result } = renderHook(() => useMovement(1));
      expect(result.current.allProgress).toHaveLength(1);
    });
  });

  describe('markCompleted', () => {
    it('does nothing when no player is set', async () => {
      const { result } = renderHook(() => useMovement(undefined));

      await act(async () => {
        await result.current.markCompleted('yoga-1');
      });

      expect(mocks.mockMovementProgressAdd).not.toHaveBeenCalled();
      expect(mocks.mockStarsAdd).not.toHaveBeenCalled();
    });

    it('creates new progress record for first completion', async () => {
      mocks.mockMovementProgressFirst.mockResolvedValue(undefined);
      const { result } = renderHook(() => useMovement(1));

      await act(async () => {
        await result.current.markCompleted('yoga-1');
      });

      expect(mocks.mockMovementProgressAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          playerId: 1,
          activityId: 'yoga-1',
          completed: true,
          favorite: false,
          timesCompleted: 1,
          lastPlayedAt: expect.any(Date),
        })
      );
    });

    it('awards 1 star on first completion (new record)', async () => {
      mocks.mockMovementProgressFirst.mockResolvedValue(undefined);
      const { result } = renderHook(() => useMovement(1));

      await act(async () => {
        await result.current.markCompleted('yoga-1');
      });

      expect(mocks.mockStarsAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          playerId: 1,
          category: 'movement',
          starsEarned: 1,
        })
      );
      expect(mocks.mockAddStars).toHaveBeenCalledWith(1, 1);
      expect(mocks.mockShowStarBurst).toHaveBeenCalled();
      expect(mocks.mockShowCelebration).toHaveBeenCalled();
    });

    it('awards star on first completion of existing record', async () => {
      mocks.mockMovementProgressFirst.mockResolvedValue({
        id: 5,
        playerId: 1,
        activityId: 'yoga-1',
        completed: false,
        favorite: false,
        timesCompleted: 0,
        lastPlayedAt: new Date(),
      });

      const { result } = renderHook(() => useMovement(1));

      await act(async () => {
        await result.current.markCompleted('yoga-1');
      });

      expect(mocks.mockMovementProgressUpdate).toHaveBeenCalledWith(5, expect.objectContaining({
        completed: true,
        timesCompleted: 1,
      }));
      expect(mocks.mockStarsAdd).toHaveBeenCalled();
      expect(mocks.mockShowStarBurst).toHaveBeenCalled();
    });

    it('does not award star on repeat completion', async () => {
      mocks.mockMovementProgressFirst.mockResolvedValue({
        id: 5,
        playerId: 1,
        activityId: 'yoga-1',
        completed: true,
        favorite: false,
        timesCompleted: 2,
        lastPlayedAt: new Date(),
      });

      const { result } = renderHook(() => useMovement(1));

      await act(async () => {
        await result.current.markCompleted('yoga-1');
      });

      expect(mocks.mockMovementProgressUpdate).toHaveBeenCalledWith(5, expect.objectContaining({
        timesCompleted: 3,
      }));
      expect(mocks.mockStarsAdd).not.toHaveBeenCalled();
      expect(mocks.mockShowStarBurst).not.toHaveBeenCalled();
    });

    it('increments timesCompleted on existing record', async () => {
      mocks.mockMovementProgressFirst.mockResolvedValue({
        id: 5,
        playerId: 1,
        activityId: 'yoga-1',
        completed: true,
        favorite: false,
        timesCompleted: 5,
        lastPlayedAt: new Date(),
      });

      const { result } = renderHook(() => useMovement(1));

      await act(async () => {
        await result.current.markCompleted('yoga-1');
      });

      expect(mocks.mockMovementProgressUpdate).toHaveBeenCalledWith(5, expect.objectContaining({
        timesCompleted: 6,
      }));
    });
  });

  describe('toggleFavorite', () => {
    it('does nothing when no player is set', async () => {
      const { result } = renderHook(() => useMovement(undefined));

      await act(async () => {
        await result.current.toggleFavorite('yoga-1');
      });

      expect(mocks.mockMovementProgressAdd).not.toHaveBeenCalled();
      expect(mocks.mockMovementProgressUpdate).not.toHaveBeenCalled();
    });

    it('creates new record with favorite=true when no record exists', async () => {
      mocks.mockMovementProgressFirst.mockResolvedValue(undefined);
      const { result } = renderHook(() => useMovement(1));

      await act(async () => {
        await result.current.toggleFavorite('yoga-1');
      });

      expect(mocks.mockMovementProgressAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          playerId: 1,
          activityId: 'yoga-1',
          completed: false,
          favorite: true,
          timesCompleted: 0,
        })
      );
    });

    it('toggles favorite to true on existing record', async () => {
      mocks.mockMovementProgressFirst.mockResolvedValue({
        id: 5,
        playerId: 1,
        activityId: 'yoga-1',
        completed: false,
        favorite: false,
        timesCompleted: 0,
        lastPlayedAt: new Date(),
      });

      const { result } = renderHook(() => useMovement(1));

      await act(async () => {
        await result.current.toggleFavorite('yoga-1');
      });

      expect(mocks.mockMovementProgressUpdate).toHaveBeenCalledWith(5, { favorite: true });
    });

    it('toggles favorite to false on existing favorited record', async () => {
      mocks.mockMovementProgressFirst.mockResolvedValue({
        id: 5,
        playerId: 1,
        activityId: 'yoga-1',
        completed: false,
        favorite: true,
        timesCompleted: 0,
        lastPlayedAt: new Date(),
      });

      const { result } = renderHook(() => useMovement(1));

      await act(async () => {
        await result.current.toggleFavorite('yoga-1');
      });

      expect(mocks.mockMovementProgressUpdate).toHaveBeenCalledWith(5, { favorite: false });
    });
  });

  describe('getTimesCompleted', () => {
    it('returns 0 when no record exists', () => {
      const { result } = renderHook(() => useMovement(1));
      expect(result.current.getTimesCompleted('yoga-1')).toBe(0);
    });

    it('returns correct count from progress', () => {
      mocks.mockProgress = [
        { id: 1, playerId: 1, activityId: 'yoga-1', completed: true, favorite: false, timesCompleted: 7, lastPlayedAt: new Date() },
      ];
      const { result } = renderHook(() => useMovement(1));
      expect(result.current.getTimesCompleted('yoga-1')).toBe(7);
    });
  });

  describe('isFavorite', () => {
    it('returns false when no record exists', () => {
      const { result } = renderHook(() => useMovement(1));
      expect(result.current.isFavorite('yoga-1')).toBe(false);
    });

    it('returns true when activity is favorited', () => {
      mocks.mockProgress = [
        { id: 1, playerId: 1, activityId: 'yoga-1', completed: false, favorite: true, timesCompleted: 0, lastPlayedAt: new Date() },
      ];
      const { result } = renderHook(() => useMovement(1));
      expect(result.current.isFavorite('yoga-1')).toBe(true);
    });

    it('returns false when activity is not favorited', () => {
      mocks.mockProgress = [
        { id: 1, playerId: 1, activityId: 'yoga-1', completed: true, favorite: false, timesCompleted: 3, lastPlayedAt: new Date() },
      ];
      const { result } = renderHook(() => useMovement(1));
      expect(result.current.isFavorite('yoga-1')).toBe(false);
    });
  });

  describe('isCompleted', () => {
    it('returns false when no record exists', () => {
      const { result } = renderHook(() => useMovement(1));
      expect(result.current.isCompleted('yoga-1')).toBe(false);
    });

    it('returns true when activity is completed', () => {
      mocks.mockProgress = [
        { id: 1, playerId: 1, activityId: 'yoga-1', completed: true, favorite: false, timesCompleted: 1, lastPlayedAt: new Date() },
      ];
      const { result } = renderHook(() => useMovement(1));
      expect(result.current.isCompleted('yoga-1')).toBe(true);
    });

    it('returns false when activity is not completed', () => {
      mocks.mockProgress = [
        { id: 1, playerId: 1, activityId: 'yoga-1', completed: false, favorite: false, timesCompleted: 0, lastPlayedAt: new Date() },
      ];
      const { result } = renderHook(() => useMovement(1));
      expect(result.current.isCompleted('yoga-1')).toBe(false);
    });
  });
});
