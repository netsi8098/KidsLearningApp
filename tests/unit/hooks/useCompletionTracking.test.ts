import { renderHook, act } from '@testing-library/react';
import { useCompletionTracking } from '../../../src/hooks/useCompletionTracking';

const mocks = vi.hoisted(() => {
  const mockDbTableWhere = vi.fn();
  const mockDbTableAdd = vi.fn();
  const mockDbTableUpdate = vi.fn();
  const mockDbStarsAdd = vi.fn();

  const createMockTable = () => ({
    where: mockDbTableWhere.mockReturnValue({
      equals: vi.fn().mockReturnValue({
        first: vi.fn().mockResolvedValue(undefined),
      }),
    }),
    add: mockDbTableAdd,
    update: mockDbTableUpdate,
  });

  return {
    mockPlayerId: 1 as number | undefined,
    mockShowStarBurst: vi.fn(),
    mockShowCelebration: vi.fn(),
    mockShowBadgeToast: vi.fn(),
    mockAddStars: vi.fn(),
    mockDbTableWhere,
    mockDbTableAdd,
    mockDbTableUpdate,
    mockDbStarsAdd,
    createMockTable,
  };
});

vi.mock('../../../src/context/AppContext', () => ({
  useApp: () => ({
    currentPlayer: mocks.mockPlayerId ? { id: mocks.mockPlayerId } : null,
    showStarBurst: mocks.mockShowStarBurst,
    showCelebration: mocks.mockShowCelebration,
    showBadgeToast: mocks.mockShowBadgeToast,
  }),
}));

vi.mock('../../../src/hooks/useProfile', () => ({
  useProfiles: () => ({
    addStars: mocks.mockAddStars,
  }),
}));

vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: () => [],
}));

vi.mock('../../../src/db/database', () => ({
  db: {
    cookingProgress: mocks.createMockTable(),
    audioProgress: mocks.createMockTable(),
    movementProgress: mocks.createMockTable(),
    homeActivityProgress: mocks.createMockTable(),
    lifeSkillsProgress: mocks.createMockTable(),
    explorerProgress: mocks.createMockTable(),
    stars: {
      add: mocks.mockDbStarsAdd,
    },
  },
}));

describe('useCompletionTracking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mockPlayerId = 1;
  });

  it('returns markCompleted function', () => {
    const { result } = renderHook(() => useCompletionTracking(1, 'cookingProgress'));
    expect(typeof result.current.markCompleted).toBe('function');
  });

  it('markCompleted does nothing when playerId is undefined', async () => {
    mocks.mockPlayerId = undefined;
    const { result } = renderHook(() => useCompletionTracking(undefined, 'cookingProgress'));
    await act(async () => {
      await result.current.markCompleted('recipe-1');
    });
    expect(mocks.mockDbTableAdd).not.toHaveBeenCalled();
    expect(mocks.mockDbTableUpdate).not.toHaveBeenCalled();
    expect(mocks.mockDbStarsAdd).not.toHaveBeenCalled();
  });

  it('markCompleted creates new record when no existing found', async () => {
    mocks.mockDbTableWhere.mockReturnValue({
      equals: vi.fn().mockReturnValue({
        first: vi.fn().mockResolvedValue(undefined),
      }),
    });
    mocks.mockDbTableAdd.mockResolvedValue(1);
    mocks.mockDbStarsAdd.mockResolvedValue(1);
    mocks.mockAddStars.mockResolvedValue(undefined);

    const { result } = renderHook(() => useCompletionTracking(1, 'cookingProgress'));
    await act(async () => {
      await result.current.markCompleted('recipe-1');
    });

    expect(mocks.mockDbTableAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        playerId: 1,
        recipeId: 'recipe-1',
        completed: true,
      })
    );
  });

  it('markCompleted uses correct id field for each table type', async () => {
    mocks.mockDbTableWhere.mockReturnValue({
      equals: vi.fn().mockReturnValue({
        first: vi.fn().mockResolvedValue(undefined),
      }),
    });
    mocks.mockDbTableAdd.mockResolvedValue(1);
    mocks.mockDbStarsAdd.mockResolvedValue(1);
    mocks.mockAddStars.mockResolvedValue(undefined);

    // Test audioProgress uses episodeId
    const { result: audioResult } = renderHook(() => useCompletionTracking(1, 'audioProgress'));
    await act(async () => {
      await audioResult.current.markCompleted('ep-1');
    });
    expect(mocks.mockDbTableAdd).toHaveBeenCalledWith(
      expect.objectContaining({ episodeId: 'ep-1' })
    );

    vi.clearAllMocks();
    mocks.mockDbTableWhere.mockReturnValue({
      equals: vi.fn().mockReturnValue({
        first: vi.fn().mockResolvedValue(undefined),
      }),
    });
    mocks.mockDbTableAdd.mockResolvedValue(1);
    mocks.mockDbStarsAdd.mockResolvedValue(1);
    mocks.mockAddStars.mockResolvedValue(undefined);

    // Test movementProgress uses activityId
    const { result: movementResult } = renderHook(() => useCompletionTracking(1, 'movementProgress'));
    await act(async () => {
      await movementResult.current.markCompleted('act-1');
    });
    expect(mocks.mockDbTableAdd).toHaveBeenCalledWith(
      expect.objectContaining({ activityId: 'act-1' })
    );
  });

  it('markCompleted uses skillId for lifeSkillsProgress', async () => {
    mocks.mockDbTableWhere.mockReturnValue({
      equals: vi.fn().mockReturnValue({
        first: vi.fn().mockResolvedValue(undefined),
      }),
    });
    mocks.mockDbTableAdd.mockResolvedValue(1);
    mocks.mockDbStarsAdd.mockResolvedValue(1);
    mocks.mockAddStars.mockResolvedValue(undefined);

    const { result } = renderHook(() => useCompletionTracking(1, 'lifeSkillsProgress'));
    await act(async () => {
      await result.current.markCompleted('skill-1');
    });
    expect(mocks.mockDbTableAdd).toHaveBeenCalledWith(
      expect.objectContaining({ skillId: 'skill-1' })
    );
  });

  it('markCompleted uses topicId for explorerProgress', async () => {
    mocks.mockDbTableWhere.mockReturnValue({
      equals: vi.fn().mockReturnValue({
        first: vi.fn().mockResolvedValue(undefined),
      }),
    });
    mocks.mockDbTableAdd.mockResolvedValue(1);
    mocks.mockDbStarsAdd.mockResolvedValue(1);
    mocks.mockAddStars.mockResolvedValue(undefined);

    const { result } = renderHook(() => useCompletionTracking(1, 'explorerProgress'));
    await act(async () => {
      await result.current.markCompleted('topic-1');
    });
    expect(mocks.mockDbTableAdd).toHaveBeenCalledWith(
      expect.objectContaining({ topicId: 'topic-1' })
    );
  });

  it('markCompleted updates existing uncompleted record', async () => {
    const existingRecord = { id: 10, playerId: 1, recipeId: 'recipe-1', completed: false };
    mocks.mockDbTableWhere.mockReturnValue({
      equals: vi.fn().mockReturnValue({
        first: vi.fn().mockResolvedValue(existingRecord),
      }),
    });
    mocks.mockDbTableUpdate.mockResolvedValue(1);
    mocks.mockDbStarsAdd.mockResolvedValue(1);
    mocks.mockAddStars.mockResolvedValue(undefined);

    const { result } = renderHook(() => useCompletionTracking(1, 'cookingProgress'));
    await act(async () => {
      await result.current.markCompleted('recipe-1');
    });

    expect(mocks.mockDbTableUpdate).toHaveBeenCalledWith(10, expect.objectContaining({
      completed: true,
    }));
  });

  it('markCompleted skips already completed record', async () => {
    const existingRecord = { id: 10, playerId: 1, recipeId: 'recipe-1', completed: true };
    mocks.mockDbTableWhere.mockReturnValue({
      equals: vi.fn().mockReturnValue({
        first: vi.fn().mockResolvedValue(existingRecord),
      }),
    });

    const { result } = renderHook(() => useCompletionTracking(1, 'cookingProgress'));
    await act(async () => {
      await result.current.markCompleted('recipe-1');
    });

    expect(mocks.mockDbTableUpdate).not.toHaveBeenCalled();
    expect(mocks.mockDbStarsAdd).not.toHaveBeenCalled();
  });

  it('markCompleted awards default 1 star and calls showStarBurst', async () => {
    mocks.mockDbTableWhere.mockReturnValue({
      equals: vi.fn().mockReturnValue({
        first: vi.fn().mockResolvedValue(undefined),
      }),
    });
    mocks.mockDbTableAdd.mockResolvedValue(1);
    mocks.mockDbStarsAdd.mockResolvedValue(1);
    mocks.mockAddStars.mockResolvedValue(undefined);

    const { result } = renderHook(() => useCompletionTracking(1, 'cookingProgress'));
    await act(async () => {
      await result.current.markCompleted('recipe-1');
    });

    expect(mocks.mockDbStarsAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        playerId: 1,
        starsEarned: 1,
        reason: 'Completed recipe-1',
      })
    );
    expect(mocks.mockAddStars).toHaveBeenCalledWith(1, 1);
    expect(mocks.mockShowStarBurst).toHaveBeenCalled();
  });

  it('markCompleted awards custom star amount', async () => {
    mocks.mockDbTableWhere.mockReturnValue({
      equals: vi.fn().mockReturnValue({
        first: vi.fn().mockResolvedValue(undefined),
      }),
    });
    mocks.mockDbTableAdd.mockResolvedValue(1);
    mocks.mockDbStarsAdd.mockResolvedValue(1);
    mocks.mockAddStars.mockResolvedValue(undefined);

    const { result } = renderHook(() => useCompletionTracking(1, 'cookingProgress'));
    await act(async () => {
      await result.current.markCompleted('recipe-1', 3);
    });

    expect(mocks.mockDbStarsAdd).toHaveBeenCalledWith(
      expect.objectContaining({ starsEarned: 3 })
    );
    expect(mocks.mockAddStars).toHaveBeenCalledWith(1, 3);
  });

  it('markCompleted does not award stars when starsToAward is 0', async () => {
    mocks.mockDbTableWhere.mockReturnValue({
      equals: vi.fn().mockReturnValue({
        first: vi.fn().mockResolvedValue(undefined),
      }),
    });
    mocks.mockDbTableAdd.mockResolvedValue(1);

    const { result } = renderHook(() => useCompletionTracking(1, 'cookingProgress'));
    await act(async () => {
      await result.current.markCompleted('recipe-1', 0);
    });

    expect(mocks.mockDbStarsAdd).not.toHaveBeenCalled();
    expect(mocks.mockAddStars).not.toHaveBeenCalled();
    expect(mocks.mockShowStarBurst).not.toHaveBeenCalled();
  });

  it('markCompleted always shows celebration regardless of star amount', async () => {
    mocks.mockDbTableWhere.mockReturnValue({
      equals: vi.fn().mockReturnValue({
        first: vi.fn().mockResolvedValue(undefined),
      }),
    });
    mocks.mockDbTableAdd.mockResolvedValue(1);

    const { result } = renderHook(() => useCompletionTracking(1, 'cookingProgress'));
    await act(async () => {
      await result.current.markCompleted('recipe-1', 0);
    });

    expect(mocks.mockShowCelebration).toHaveBeenCalled();
  });

  it('markCompleted records star with correct category matching table name', async () => {
    mocks.mockDbTableWhere.mockReturnValue({
      equals: vi.fn().mockReturnValue({
        first: vi.fn().mockResolvedValue(undefined),
      }),
    });
    mocks.mockDbTableAdd.mockResolvedValue(1);
    mocks.mockDbStarsAdd.mockResolvedValue(1);
    mocks.mockAddStars.mockResolvedValue(undefined);

    const { result } = renderHook(() => useCompletionTracking(1, 'explorerProgress'));
    await act(async () => {
      await result.current.markCompleted('topic-1', 2);
    });

    expect(mocks.mockDbStarsAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        category: 'explorerProgress',
      })
    );
  });
});
