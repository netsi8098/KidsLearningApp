import { renderHook, act } from '@testing-library/react';
import { useProgress } from '../../../src/hooks/useProgress';

const mocks = vi.hoisted(() => ({
  mockPlayerId: 1 as number | undefined,
  mockProgressData: [] as any[],
  mockStarRecords: [] as any[],
  mockShowStarBurst: vi.fn(),
  mockShowCelebration: vi.fn(),
  mockShowBadgeToast: vi.fn(),
  mockAddStars: vi.fn(),
  mockDbProgressWhere: vi.fn(),
  mockDbProgressAdd: vi.fn(),
  mockDbProgressUpdate: vi.fn(),
  mockDbStarsAdd: vi.fn(),
  mockDbContentHistoryAdd: vi.fn(),
}));

vi.mock('../../../src/context/AppContext', () => ({
  useApp: () => ({
    currentPlayer: mocks.mockPlayerId ? { id: mocks.mockPlayerId } : null,
    showStarBurst: mocks.mockShowStarBurst,
    showCelebration: mocks.mockShowCelebration,
    showBadgeToast: mocks.mockShowBadgeToast,
    soundEnabled: true,
    speechEnabled: false,
  }),
}));

vi.mock('../../../src/hooks/useProfile', () => ({
  useProfiles: () => ({
    addStars: mocks.mockAddStars,
  }),
}));

vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: (fn: any, deps: any, defaultVal: any) => {
    // First useLiveQuery call returns progress, second returns starRecords
    if (deps && deps[0] === mocks.mockPlayerId) {
      // Distinguish by checking the default value shape
      if (defaultVal === undefined) return defaultVal;
      // Both have default [] but are called in order
    }
    return defaultVal;
  },
}));

// Override useLiveQuery more precisely
let useLiveQueryCallIndex = 0;
vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: () => {
    const idx = useLiveQueryCallIndex++;
    if (idx % 2 === 0) return mocks.mockProgressData;
    return mocks.mockStarRecords;
  },
}));

vi.mock('../../../src/db/database', () => ({
  db: {
    progress: {
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          toArray: vi.fn(() => Promise.resolve(mocks.mockProgressData)),
          first: vi.fn(() => Promise.resolve(undefined)),
        })),
      })),
      add: mocks.mockDbProgressAdd,
      update: mocks.mockDbProgressUpdate,
    },
    stars: {
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          toArray: vi.fn(() => Promise.resolve(mocks.mockStarRecords)),
        })),
      })),
      add: mocks.mockDbStarsAdd,
    },
    contentHistory: {
      add: mocks.mockDbContentHistoryAdd,
    },
  },
}));

describe('useProgress', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useLiveQueryCallIndex = 0;
    mocks.mockPlayerId = 1;
    mocks.mockProgressData = [];
    mocks.mockStarRecords = [];
  });

  it('returns default empty arrays when rendered', () => {
    const { result } = renderHook(() => useProgress(1));
    expect(result.current.progress).toEqual([]);
    expect(result.current.starRecords).toEqual([]);
  });

  it('returns progress data when available', () => {
    mocks.mockProgressData = [
      { id: 1, playerId: 1, category: 'abc', itemKey: 'A', timesCompleted: 3, correctAnswers: 2, totalAttempts: 3, lastPracticedAt: new Date() },
    ];
    const { result } = renderHook(() => useProgress(1));
    expect(result.current.progress).toHaveLength(1);
    expect(result.current.progress[0].category).toBe('abc');
  });

  it('returns empty arrays when playerId is undefined', () => {
    mocks.mockPlayerId = undefined;
    const { result } = renderHook(() => useProgress(undefined));
    expect(result.current.progress).toEqual([]);
    expect(result.current.starRecords).toEqual([]);
  });

  it('recordActivity does nothing when playerId is undefined', async () => {
    mocks.mockPlayerId = undefined;
    const { result } = renderHook(() => useProgress(undefined));
    await act(async () => {
      await result.current.recordActivity('abc', 'A', true);
    });
    expect(mocks.mockDbProgressAdd).not.toHaveBeenCalled();
    expect(mocks.mockDbProgressUpdate).not.toHaveBeenCalled();
  });

  it('recordActivity creates new progress entry for new item', async () => {
    // Mock the where chain for recordActivity (compound key lookup returns undefined)
    const { db } = await import('../../../src/db/database');
    (db.progress.where as any).mockReturnValue({
      equals: vi.fn().mockReturnValue({
        first: vi.fn().mockResolvedValue(undefined),
        toArray: vi.fn().mockResolvedValue([]),
      }),
    });
    mocks.mockDbProgressAdd.mockResolvedValue(1);
    mocks.mockDbStarsAdd.mockResolvedValue(1);
    mocks.mockAddStars.mockResolvedValue(undefined);
    mocks.mockDbContentHistoryAdd.mockResolvedValue(1);

    const { result } = renderHook(() => useProgress(1));
    await act(async () => {
      await result.current.recordActivity('abc', 'A', true);
    });

    expect(mocks.mockDbProgressAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        playerId: 1,
        category: 'abc',
        itemKey: 'A',
        timesCompleted: 1,
        correctAnswers: 1,
        totalAttempts: 1,
      })
    );
  });

  it('recordActivity updates existing progress entry', async () => {
    const existingRecord = {
      id: 10,
      playerId: 1,
      category: 'abc',
      itemKey: 'A',
      timesCompleted: 2,
      correctAnswers: 2,
      totalAttempts: 3,
      lastPracticedAt: new Date(),
    };
    const { db } = await import('../../../src/db/database');
    (db.progress.where as any).mockReturnValue({
      equals: vi.fn().mockReturnValue({
        first: vi.fn().mockResolvedValue(existingRecord),
        toArray: vi.fn().mockResolvedValue([existingRecord]),
      }),
    });
    mocks.mockDbProgressUpdate.mockResolvedValue(1);
    mocks.mockDbContentHistoryAdd.mockResolvedValue(1);

    const { result } = renderHook(() => useProgress(1));
    await act(async () => {
      await result.current.recordActivity('abc', 'A', true);
    });

    expect(mocks.mockDbProgressUpdate).toHaveBeenCalledWith(10, expect.objectContaining({
      timesCompleted: 3,
      correctAnswers: 3,
      totalAttempts: 4,
    }));
  });

  it('recordActivity does not increment timesCompleted on incorrect answer', async () => {
    const existingRecord = {
      id: 10,
      playerId: 1,
      category: 'abc',
      itemKey: 'A',
      timesCompleted: 2,
      correctAnswers: 2,
      totalAttempts: 3,
      lastPracticedAt: new Date(),
    };
    const { db } = await import('../../../src/db/database');
    (db.progress.where as any).mockReturnValue({
      equals: vi.fn().mockReturnValue({
        first: vi.fn().mockResolvedValue(existingRecord),
        toArray: vi.fn().mockResolvedValue([existingRecord]),
      }),
    });
    mocks.mockDbProgressUpdate.mockResolvedValue(1);
    mocks.mockDbContentHistoryAdd.mockResolvedValue(1);

    const { result } = renderHook(() => useProgress(1));
    await act(async () => {
      await result.current.recordActivity('abc', 'A', false);
    });

    expect(mocks.mockDbProgressUpdate).toHaveBeenCalledWith(10, expect.objectContaining({
      timesCompleted: 2,
      correctAnswers: 2,
      totalAttempts: 4,
    }));
  });

  it('recordActivity awards star on first correct visit and shows starburst', async () => {
    const { db } = await import('../../../src/db/database');
    (db.progress.where as any).mockReturnValue({
      equals: vi.fn().mockReturnValue({
        first: vi.fn().mockResolvedValue(undefined),
        toArray: vi.fn().mockResolvedValue([]),
      }),
    });
    mocks.mockDbProgressAdd.mockResolvedValue(1);
    mocks.mockDbStarsAdd.mockResolvedValue(1);
    mocks.mockAddStars.mockResolvedValue(undefined);
    mocks.mockDbContentHistoryAdd.mockResolvedValue(1);

    const { result } = renderHook(() => useProgress(1));
    await act(async () => {
      await result.current.recordActivity('abc', 'B', true);
    });

    expect(mocks.mockDbStarsAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        playerId: 1,
        category: 'abc',
        starsEarned: 1,
      })
    );
    expect(mocks.mockAddStars).toHaveBeenCalledWith(1, 1);
    expect(mocks.mockShowStarBurst).toHaveBeenCalled();
  });

  it('recordActivity does not award star on incorrect answer', async () => {
    const { db } = await import('../../../src/db/database');
    (db.progress.where as any).mockReturnValue({
      equals: vi.fn().mockReturnValue({
        first: vi.fn().mockResolvedValue(undefined),
        toArray: vi.fn().mockResolvedValue([]),
      }),
    });
    mocks.mockDbProgressAdd.mockResolvedValue(1);
    mocks.mockDbContentHistoryAdd.mockResolvedValue(1);

    const { result } = renderHook(() => useProgress(1));
    await act(async () => {
      await result.current.recordActivity('abc', 'C', false);
    });

    expect(mocks.mockDbStarsAdd).not.toHaveBeenCalled();
    expect(mocks.mockShowStarBurst).not.toHaveBeenCalled();
  });

  it('recordActivity does not award duplicate stars for same item in session', async () => {
    const { db } = await import('../../../src/db/database');
    (db.progress.where as any).mockReturnValue({
      equals: vi.fn().mockReturnValue({
        first: vi.fn().mockResolvedValue(undefined),
        toArray: vi.fn().mockResolvedValue([]),
      }),
    });
    mocks.mockDbProgressAdd.mockResolvedValue(1);
    mocks.mockDbStarsAdd.mockResolvedValue(1);
    mocks.mockAddStars.mockResolvedValue(undefined);
    mocks.mockDbContentHistoryAdd.mockResolvedValue(1);

    const { result } = renderHook(() => useProgress(1));
    await act(async () => {
      await result.current.recordActivity('abc', 'D', true);
    });
    expect(mocks.mockDbStarsAdd).toHaveBeenCalledTimes(1);

    vi.clearAllMocks();
    // Re-mock the where chain since mocks were cleared
    (db.progress.where as any).mockReturnValue({
      equals: vi.fn().mockReturnValue({
        first: vi.fn().mockResolvedValue({ id: 1, timesCompleted: 1, correctAnswers: 1, totalAttempts: 1 }),
        toArray: vi.fn().mockResolvedValue([]),
      }),
    });
    mocks.mockDbProgressUpdate.mockResolvedValue(1);
    mocks.mockDbContentHistoryAdd.mockResolvedValue(1);

    await act(async () => {
      await result.current.recordActivity('abc', 'D', true);
    });
    // Star should NOT be awarded again for same session key
    expect(mocks.mockDbStarsAdd).not.toHaveBeenCalled();
  });

  it('recordActivity always logs to contentHistory', async () => {
    const { db } = await import('../../../src/db/database');
    (db.progress.where as any).mockReturnValue({
      equals: vi.fn().mockReturnValue({
        first: vi.fn().mockResolvedValue(undefined),
        toArray: vi.fn().mockResolvedValue([]),
      }),
    });
    mocks.mockDbProgressAdd.mockResolvedValue(1);
    mocks.mockDbContentHistoryAdd.mockResolvedValue(1);

    const { result } = renderHook(() => useProgress(1));
    await act(async () => {
      await result.current.recordActivity('colors', 'red', false);
    });

    expect(mocks.mockDbContentHistoryAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        playerId: 1,
        contentId: 'colors:red',
        completed: false,
      })
    );
  });

  it('getItemsLearnedCount returns count of completed items in category', () => {
    mocks.mockProgressData = [
      { id: 1, playerId: 1, category: 'abc', itemKey: 'A', timesCompleted: 3, correctAnswers: 3, totalAttempts: 3 },
      { id: 2, playerId: 1, category: 'abc', itemKey: 'B', timesCompleted: 1, correctAnswers: 1, totalAttempts: 2 },
      { id: 3, playerId: 1, category: 'abc', itemKey: 'C', timesCompleted: 0, correctAnswers: 0, totalAttempts: 1 },
      { id: 4, playerId: 1, category: 'numbers', itemKey: '1', timesCompleted: 2, correctAnswers: 2, totalAttempts: 2 },
    ];
    const { result } = renderHook(() => useProgress(1));
    expect(result.current.getItemsLearnedCount('abc')).toBe(2);
    expect(result.current.getItemsLearnedCount('numbers')).toBe(1);
    expect(result.current.getItemsLearnedCount('colors')).toBe(0);
  });

  it('getTotalCorrect returns sum of correctAnswers in category', () => {
    mocks.mockProgressData = [
      { id: 1, playerId: 1, category: 'quiz', itemKey: 'q1', timesCompleted: 1, correctAnswers: 5, totalAttempts: 10 },
      { id: 2, playerId: 1, category: 'quiz', itemKey: 'q2', timesCompleted: 1, correctAnswers: 3, totalAttempts: 5 },
      { id: 3, playerId: 1, category: 'abc', itemKey: 'A', timesCompleted: 1, correctAnswers: 2, totalAttempts: 2 },
    ];
    const { result } = renderHook(() => useProgress(1));
    expect(result.current.getTotalCorrect('quiz')).toBe(8);
    expect(result.current.getTotalCorrect('abc')).toBe(2);
    expect(result.current.getTotalCorrect('shapes')).toBe(0);
  });

  it('exposes starRecords when available', () => {
    mocks.mockStarRecords = [
      { id: 1, playerId: 1, category: 'abc', starsEarned: 1, reason: 'Learned A', earnedAt: new Date() },
    ];
    const { result } = renderHook(() => useProgress(1));
    expect(result.current.starRecords).toHaveLength(1);
  });
});
