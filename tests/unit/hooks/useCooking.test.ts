import { renderHook, act } from '@testing-library/react';
import { useCooking } from '../../../src/hooks/useCooking';

const mocks = vi.hoisted(() => ({
  mockPlayerId: 1 as number | undefined,
  mockProgress: [] as {
    id?: number;
    playerId: number;
    recipeId: string;
    completed: boolean;
    stepsCompleted: number;
    totalSteps: number;
    favorite: boolean;
    lastCookedAt: Date;
  }[],
  mockCookingProgressAdd: vi.fn(),
  mockCookingProgressUpdate: vi.fn(),
  mockCookingProgressFirst: vi.fn(),
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
    cookingProgress: {
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          toArray: vi.fn(() => Promise.resolve(mocks.mockProgress)),
          first: mocks.mockCookingProgressFirst,
        })),
      })),
      add: mocks.mockCookingProgressAdd,
      update: mocks.mockCookingProgressUpdate,
    },
    stars: {
      add: mocks.mockStarsAdd,
    },
  },
}));

describe('useCooking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mockPlayerId = 1;
    mocks.mockProgress = [];
    mocks.mockCookingProgressFirst.mockResolvedValue(undefined);
    mocks.mockCookingProgressAdd.mockResolvedValue(1);
  });

  describe('allProgress', () => {
    it('returns empty array when no progress exists', () => {
      const { result } = renderHook(() => useCooking(1));
      expect(result.current.allProgress).toEqual([]);
    });

    it('returns progress records from live query', () => {
      mocks.mockProgress = [
        { id: 1, playerId: 1, recipeId: 'recipe-1', completed: true, stepsCompleted: 5, totalSteps: 5, favorite: false, lastCookedAt: new Date() },
      ];
      const { result } = renderHook(() => useCooking(1));
      expect(result.current.allProgress).toHaveLength(1);
    });
  });

  describe('startRecipe', () => {
    it('does nothing when no player is set', async () => {
      const { result } = renderHook(() => useCooking(undefined));

      await act(async () => {
        await result.current.startRecipe('recipe-1', 5);
      });

      expect(mocks.mockCookingProgressAdd).not.toHaveBeenCalled();
    });

    it('creates new progress record for fresh recipe', async () => {
      mocks.mockCookingProgressFirst.mockResolvedValue(undefined);
      const { result } = renderHook(() => useCooking(1));

      await act(async () => {
        await result.current.startRecipe('recipe-1', 5);
      });

      expect(mocks.mockCookingProgressAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          playerId: 1,
          recipeId: 'recipe-1',
          completed: false,
          stepsCompleted: 0,
          totalSteps: 5,
          favorite: false,
          lastCookedAt: expect.any(Date),
        })
      );
    });

    it('resets existing record for a re-run', async () => {
      mocks.mockCookingProgressFirst.mockResolvedValue({
        id: 5,
        playerId: 1,
        recipeId: 'recipe-1',
        completed: true,
        stepsCompleted: 5,
        totalSteps: 5,
        favorite: false,
        lastCookedAt: new Date(),
      });

      const { result } = renderHook(() => useCooking(1));

      await act(async () => {
        await result.current.startRecipe('recipe-1', 5);
      });

      expect(mocks.mockCookingProgressUpdate).toHaveBeenCalledWith(5, expect.objectContaining({
        completed: false,
        stepsCompleted: 0,
        totalSteps: 5,
        lastCookedAt: expect.any(Date),
      }));
    });
  });

  describe('advanceStep', () => {
    it('does nothing when no player is set', async () => {
      const { result } = renderHook(() => useCooking(undefined));

      await act(async () => {
        await result.current.advanceStep('recipe-1');
      });

      expect(mocks.mockCookingProgressUpdate).not.toHaveBeenCalled();
    });

    it('increments stepsCompleted on existing record', async () => {
      mocks.mockCookingProgressFirst.mockResolvedValue({
        id: 5,
        playerId: 1,
        recipeId: 'recipe-1',
        completed: false,
        stepsCompleted: 2,
        totalSteps: 5,
        favorite: false,
        lastCookedAt: new Date(),
      });

      const { result } = renderHook(() => useCooking(1));

      await act(async () => {
        await result.current.advanceStep('recipe-1');
      });

      expect(mocks.mockCookingProgressUpdate).toHaveBeenCalledWith(5, expect.objectContaining({
        stepsCompleted: 3,
        lastCookedAt: expect.any(Date),
      }));
    });

    it('does nothing when no existing record found', async () => {
      mocks.mockCookingProgressFirst.mockResolvedValue(undefined);
      const { result } = renderHook(() => useCooking(1));

      await act(async () => {
        await result.current.advanceStep('recipe-1');
      });

      expect(mocks.mockCookingProgressUpdate).not.toHaveBeenCalled();
    });
  });

  describe('completeRecipe', () => {
    it('does nothing when no player is set', async () => {
      const { result } = renderHook(() => useCooking(undefined));

      await act(async () => {
        await result.current.completeRecipe('recipe-1');
      });

      expect(mocks.mockCookingProgressUpdate).not.toHaveBeenCalled();
      expect(mocks.mockStarsAdd).not.toHaveBeenCalled();
    });

    it('marks recipe completed and awards 2 stars on first completion', async () => {
      mocks.mockCookingProgressFirst.mockResolvedValue({
        id: 5,
        playerId: 1,
        recipeId: 'recipe-1',
        completed: false,
        stepsCompleted: 4,
        totalSteps: 5,
        favorite: false,
        lastCookedAt: new Date(),
      });

      const { result } = renderHook(() => useCooking(1));

      await act(async () => {
        await result.current.completeRecipe('recipe-1');
      });

      expect(mocks.mockCookingProgressUpdate).toHaveBeenCalledWith(5, expect.objectContaining({
        completed: true,
        stepsCompleted: 5,
      }));
      expect(mocks.mockStarsAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          playerId: 1,
          category: 'cooking',
          starsEarned: 2,
        })
      );
      expect(mocks.mockAddStars).toHaveBeenCalledWith(1, 2);
      expect(mocks.mockShowStarBurst).toHaveBeenCalled();
      expect(mocks.mockShowCelebration).toHaveBeenCalled();
    });

    it('does not award stars on repeat completion', async () => {
      mocks.mockCookingProgressFirst.mockResolvedValue({
        id: 5,
        playerId: 1,
        recipeId: 'recipe-1',
        completed: true,
        stepsCompleted: 5,
        totalSteps: 5,
        favorite: false,
        lastCookedAt: new Date(),
      });

      const { result } = renderHook(() => useCooking(1));

      await act(async () => {
        await result.current.completeRecipe('recipe-1');
      });

      expect(mocks.mockCookingProgressUpdate).toHaveBeenCalled();
      expect(mocks.mockStarsAdd).not.toHaveBeenCalled();
      expect(mocks.mockShowStarBurst).not.toHaveBeenCalled();
    });

    it('does nothing when no existing record found', async () => {
      mocks.mockCookingProgressFirst.mockResolvedValue(undefined);
      const { result } = renderHook(() => useCooking(1));

      await act(async () => {
        await result.current.completeRecipe('recipe-1');
      });

      expect(mocks.mockCookingProgressUpdate).not.toHaveBeenCalled();
      expect(mocks.mockStarsAdd).not.toHaveBeenCalled();
    });
  });

  describe('getProgress', () => {
    it('returns undefined when no record exists', () => {
      const { result } = renderHook(() => useCooking(1));
      expect(result.current.getProgress('recipe-1')).toBeUndefined();
    });

    it('returns matching progress record', () => {
      mocks.mockProgress = [
        { id: 1, playerId: 1, recipeId: 'recipe-1', completed: false, stepsCompleted: 2, totalSteps: 5, favorite: false, lastCookedAt: new Date() },
      ];
      const { result } = renderHook(() => useCooking(1));
      const progress = result.current.getProgress('recipe-1');
      expect(progress).toBeDefined();
      expect(progress!.recipeId).toBe('recipe-1');
      expect(progress!.stepsCompleted).toBe(2);
    });
  });

  describe('toggleFavorite', () => {
    it('does nothing when no player is set', async () => {
      const { result } = renderHook(() => useCooking(undefined));

      await act(async () => {
        await result.current.toggleFavorite('recipe-1');
      });

      expect(mocks.mockCookingProgressAdd).not.toHaveBeenCalled();
      expect(mocks.mockCookingProgressUpdate).not.toHaveBeenCalled();
    });

    it('creates new record with favorite=true when no record exists', async () => {
      mocks.mockCookingProgressFirst.mockResolvedValue(undefined);
      const { result } = renderHook(() => useCooking(1));

      await act(async () => {
        await result.current.toggleFavorite('recipe-1');
      });

      expect(mocks.mockCookingProgressAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          playerId: 1,
          recipeId: 'recipe-1',
          completed: false,
          stepsCompleted: 0,
          totalSteps: 0,
          favorite: true,
        })
      );
    });

    it('toggles favorite on existing record', async () => {
      mocks.mockCookingProgressFirst.mockResolvedValue({
        id: 5,
        playerId: 1,
        recipeId: 'recipe-1',
        completed: false,
        stepsCompleted: 0,
        totalSteps: 5,
        favorite: false,
        lastCookedAt: new Date(),
      });

      const { result } = renderHook(() => useCooking(1));

      await act(async () => {
        await result.current.toggleFavorite('recipe-1');
      });

      expect(mocks.mockCookingProgressUpdate).toHaveBeenCalledWith(5, { favorite: true });
    });
  });

  describe('isFavorite', () => {
    it('returns false when no record exists', () => {
      const { result } = renderHook(() => useCooking(1));
      expect(result.current.isFavorite('recipe-1')).toBe(false);
    });

    it('returns true when recipe is favorited', () => {
      mocks.mockProgress = [
        { id: 1, playerId: 1, recipeId: 'recipe-1', completed: false, stepsCompleted: 0, totalSteps: 5, favorite: true, lastCookedAt: new Date() },
      ];
      const { result } = renderHook(() => useCooking(1));
      expect(result.current.isFavorite('recipe-1')).toBe(true);
    });

    it('returns false when recipe is not favorited', () => {
      mocks.mockProgress = [
        { id: 1, playerId: 1, recipeId: 'recipe-1', completed: true, stepsCompleted: 5, totalSteps: 5, favorite: false, lastCookedAt: new Date() },
      ];
      const { result } = renderHook(() => useCooking(1));
      expect(result.current.isFavorite('recipe-1')).toBe(false);
    });
  });
});
