import { renderHook, act } from '@testing-library/react';
import { useFavorites, useUniversalFavorites } from '../../../src/hooks/useFavorites';

const mocks = vi.hoisted(() => {
  const mockDbTableAdd = vi.fn();
  const mockDbTableUpdate = vi.fn();
  const mockDbTableWhere = vi.fn();

  const createMockTable = () => ({
    where: vi.fn(() => ({
      equals: vi.fn(() => ({
        toArray: vi.fn(() => Promise.resolve([])),
        filter: vi.fn(() => ({
          toArray: vi.fn(() => Promise.resolve([])),
        })),
        first: vi.fn(() => Promise.resolve(undefined)),
      })),
    })),
    add: mockDbTableAdd,
    update: mockDbTableUpdate,
  });

  return {
    mockPlayerId: 1 as number | undefined,
    mockFavorites: [] as any[],
    mockUniversalFavorites: [] as any[],
    mockDbTableWhere,
    mockDbTableAdd,
    mockDbTableUpdate,
    mockDbUniversalFavoritesWhere: vi.fn(),
    mockDbUniversalFavoritesAdd: vi.fn(),
    mockDbUniversalFavoritesDelete: vi.fn(),
    createMockTable,
  };
});

vi.mock('../../../src/context/AppContext', () => ({
  useApp: () => ({
    currentPlayer: mocks.mockPlayerId ? { id: mocks.mockPlayerId } : null,
    showStarBurst: vi.fn(),
    showCelebration: vi.fn(),
    showBadgeToast: vi.fn(),
  }),
}));

let useLiveQueryCallCount = 0;
vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: () => {
    const idx = useLiveQueryCallCount++;
    // For useFavorites, there's 1 useLiveQuery call
    // For useUniversalFavorites, there's 1 useLiveQuery call
    if (idx % 2 === 0) return mocks.mockFavorites;
    return mocks.mockUniversalFavorites;
  },
}));

vi.mock('../../../src/db/database', () => ({
  db: {
    cookingProgress: mocks.createMockTable(),
    audioProgress: mocks.createMockTable(),
    movementProgress: mocks.createMockTable(),
    homeActivityProgress: mocks.createMockTable(),
    universalFavorites: {
      where: mocks.mockDbUniversalFavoritesWhere.mockReturnValue({
        equals: vi.fn(() => ({
          toArray: vi.fn(() => Promise.resolve(mocks.mockUniversalFavorites)),
          first: vi.fn(() => Promise.resolve(undefined)),
        })),
      }),
      add: mocks.mockDbUniversalFavoritesAdd,
      delete: mocks.mockDbUniversalFavoritesDelete,
    },
  },
}));

describe('useFavorites', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useLiveQueryCallCount = 0;
    mocks.mockPlayerId = 1;
    mocks.mockFavorites = [];
    mocks.mockUniversalFavorites = [];
  });

  it('returns empty favorites when no data exists', () => {
    const { result } = renderHook(() => useFavorites(1, 'cookingProgress'));
    expect(result.current.favorites).toEqual([]);
  });

  it('returns favorites with correct data', () => {
    mocks.mockFavorites = [
      { id: 1, playerId: 1, recipeId: 'recipe-1', favorite: true },
      { id: 2, playerId: 1, recipeId: 'recipe-2', favorite: true },
    ];
    const { result } = renderHook(() => useFavorites(1, 'cookingProgress'));
    expect(result.current.favorites).toHaveLength(2);
  });

  it('returns empty favorites when playerId is undefined', () => {
    mocks.mockPlayerId = undefined;
    mocks.mockFavorites = [];
    const { result } = renderHook(() => useFavorites(undefined, 'cookingProgress'));
    expect(result.current.favorites).toEqual([]);
  });

  it('isFavorite returns true for favorited items', () => {
    mocks.mockFavorites = [
      { id: 1, playerId: 1, recipeId: 'recipe-1', favorite: true },
    ];
    const { result } = renderHook(() => useFavorites(1, 'cookingProgress'));
    expect(result.current.isFavorite('recipe-1')).toBe(true);
    expect(result.current.isFavorite('recipe-999')).toBe(false);
  });

  it('toggleFavorite does nothing when playerId is undefined', async () => {
    mocks.mockPlayerId = undefined;
    const { result } = renderHook(() => useFavorites(undefined, 'cookingProgress'));
    await act(async () => {
      await result.current.toggleFavorite('recipe-1');
    });
    expect(mocks.mockDbTableAdd).not.toHaveBeenCalled();
    expect(mocks.mockDbTableUpdate).not.toHaveBeenCalled();
  });

  it('toggleFavorite creates new record when none exists for cookingProgress', async () => {
    const { db } = await import('../../../src/db/database');
    const mockTable = db.cookingProgress as any;
    mockTable.where.mockReturnValue({
      equals: vi.fn().mockReturnValue({
        first: vi.fn().mockResolvedValue(undefined),
        filter: vi.fn().mockReturnValue({ toArray: vi.fn().mockResolvedValue([]) }),
        toArray: vi.fn().mockResolvedValue([]),
      }),
    });
    mocks.mockDbTableAdd.mockResolvedValue(1);

    const { result } = renderHook(() => useFavorites(1, 'cookingProgress'));
    await act(async () => {
      await result.current.toggleFavorite('recipe-1');
    });

    expect(mocks.mockDbTableAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        playerId: 1,
        recipeId: 'recipe-1',
        completed: false,
        favorite: true,
        stepsCompleted: 0,
        totalSteps: 0,
      })
    );
  });

  it('toggleFavorite creates new record with correct fields for audioProgress', async () => {
    const { db } = await import('../../../src/db/database');
    const mockTable = db.audioProgress as any;
    mockTable.where.mockReturnValue({
      equals: vi.fn().mockReturnValue({
        first: vi.fn().mockResolvedValue(undefined),
        filter: vi.fn().mockReturnValue({ toArray: vi.fn().mockResolvedValue([]) }),
        toArray: vi.fn().mockResolvedValue([]),
      }),
    });
    mocks.mockDbTableAdd.mockResolvedValue(1);

    const { result } = renderHook(() => useFavorites(1, 'audioProgress'));
    await act(async () => {
      await result.current.toggleFavorite('episode-1');
    });

    expect(mocks.mockDbTableAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        playerId: 1,
        episodeId: 'episode-1',
        completed: false,
        favorite: true,
        currentTime: 0,
        duration: 0,
      })
    );
  });

  it('toggleFavorite creates new record with correct fields for movementProgress', async () => {
    const { db } = await import('../../../src/db/database');
    const mockTable = db.movementProgress as any;
    mockTable.where.mockReturnValue({
      equals: vi.fn().mockReturnValue({
        first: vi.fn().mockResolvedValue(undefined),
        filter: vi.fn().mockReturnValue({ toArray: vi.fn().mockResolvedValue([]) }),
        toArray: vi.fn().mockResolvedValue([]),
      }),
    });
    mocks.mockDbTableAdd.mockResolvedValue(1);

    const { result } = renderHook(() => useFavorites(1, 'movementProgress'));
    await act(async () => {
      await result.current.toggleFavorite('activity-1');
    });

    expect(mocks.mockDbTableAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        playerId: 1,
        activityId: 'activity-1',
        completed: false,
        favorite: true,
        timesCompleted: 0,
      })
    );
  });

  it('toggleFavorite toggles existing record favorite flag', async () => {
    const existingRecord = { id: 5, playerId: 1, recipeId: 'recipe-1', favorite: true };
    const { db } = await import('../../../src/db/database');
    const mockTable = db.cookingProgress as any;
    mockTable.where.mockReturnValue({
      equals: vi.fn().mockReturnValue({
        first: vi.fn().mockResolvedValue(existingRecord),
        filter: vi.fn().mockReturnValue({ toArray: vi.fn().mockResolvedValue([existingRecord]) }),
        toArray: vi.fn().mockResolvedValue([existingRecord]),
      }),
    });
    mocks.mockDbTableUpdate.mockResolvedValue(1);

    const { result } = renderHook(() => useFavorites(1, 'cookingProgress'));
    await act(async () => {
      await result.current.toggleFavorite('recipe-1');
    });

    expect(mocks.mockDbTableUpdate).toHaveBeenCalledWith(5, { favorite: false });
  });

  it('isFavorite uses correct id field per table type', () => {
    mocks.mockFavorites = [
      { id: 1, playerId: 1, activityId: 'activity-1', favorite: true },
    ];
    const { result } = renderHook(() => useFavorites(1, 'movementProgress'));
    expect(result.current.isFavorite('activity-1')).toBe(true);
  });
});

describe('useUniversalFavorites', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useLiveQueryCallCount = 0;
    mocks.mockPlayerId = 1;
    mocks.mockFavorites = [];
    mocks.mockUniversalFavorites = [];
  });

  it('returns empty favorites when no data exists', () => {
    // useUniversalFavorites uses the second call in our mock
    useLiveQueryCallCount = 1;
    mocks.mockUniversalFavorites = [];
    const { result } = renderHook(() => useUniversalFavorites(1));
    expect(result.current.favorites).toEqual([]);
  });

  it('returns favorites when data exists', () => {
    useLiveQueryCallCount = 1;
    mocks.mockUniversalFavorites = [
      { id: 1, playerId: 1, contentId: 'abc:A', addedAt: new Date() },
    ];
    const { result } = renderHook(() => useUniversalFavorites(1));
    expect(result.current.favorites).toHaveLength(1);
  });

  it('isFavorite checks contentId correctly', () => {
    useLiveQueryCallCount = 1;
    mocks.mockUniversalFavorites = [
      { id: 1, playerId: 1, contentId: 'abc:A', addedAt: new Date() },
      { id: 2, playerId: 1, contentId: 'number:1', addedAt: new Date() },
    ];
    const { result } = renderHook(() => useUniversalFavorites(1));
    expect(result.current.isFavorite('abc:A')).toBe(true);
    expect(result.current.isFavorite('number:1')).toBe(true);
    expect(result.current.isFavorite('xyz:missing')).toBe(false);
  });

  it('toggleFavorite does nothing when playerId is undefined', async () => {
    mocks.mockPlayerId = undefined;
    useLiveQueryCallCount = 1;
    const { result } = renderHook(() => useUniversalFavorites(undefined));
    await act(async () => {
      await result.current.toggleFavorite('abc:A');
    });
    expect(mocks.mockDbUniversalFavoritesAdd).not.toHaveBeenCalled();
    expect(mocks.mockDbUniversalFavoritesDelete).not.toHaveBeenCalled();
  });

  it('toggleFavorite adds new favorite when not existing', async () => {
    mocks.mockDbUniversalFavoritesWhere.mockReturnValue({
      equals: vi.fn().mockReturnValue({
        first: vi.fn().mockResolvedValue(undefined),
        toArray: vi.fn().mockResolvedValue([]),
      }),
    });
    mocks.mockDbUniversalFavoritesAdd.mockResolvedValue(1);

    useLiveQueryCallCount = 1;
    const { result } = renderHook(() => useUniversalFavorites(1));
    await act(async () => {
      await result.current.toggleFavorite('abc:A');
    });

    expect(mocks.mockDbUniversalFavoritesAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        playerId: 1,
        contentId: 'abc:A',
      })
    );
  });

  it('toggleFavorite deletes existing favorite', async () => {
    const existingFav = { id: 42, playerId: 1, contentId: 'abc:A', addedAt: new Date() };
    mocks.mockDbUniversalFavoritesWhere.mockReturnValue({
      equals: vi.fn().mockReturnValue({
        first: vi.fn().mockResolvedValue(existingFav),
        toArray: vi.fn().mockResolvedValue([existingFav]),
      }),
    });
    mocks.mockDbUniversalFavoritesDelete.mockResolvedValue(undefined);

    useLiveQueryCallCount = 1;
    const { result } = renderHook(() => useUniversalFavorites(1));
    await act(async () => {
      await result.current.toggleFavorite('abc:A');
    });

    expect(mocks.mockDbUniversalFavoritesDelete).toHaveBeenCalledWith(42);
  });
});
