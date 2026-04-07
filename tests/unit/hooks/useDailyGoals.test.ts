import { renderHook } from '@testing-library/react';
import { useDailyGoals } from '../../../src/hooks/useDailyGoals';

const mocks = vi.hoisted(() => ({
  mockPlayerId: 1 as number | undefined,
  mockTodayGoals: null as any,
  mockDbDailyGoalsWhere: vi.fn(),
  mockDbDailyGoalsAdd: vi.fn(),
  mockDbDailyGoalsUpdate: vi.fn(),
}));

vi.mock('../../../src/context/AppContext', () => ({
  useApp: () => ({
    currentPlayer: mocks.mockPlayerId ? { id: mocks.mockPlayerId } : null,
    showStarBurst: vi.fn(),
    showCelebration: vi.fn(),
    showBadgeToast: vi.fn(),
  }),
}));

vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: () => mocks.mockTodayGoals,
}));

vi.mock('../../../src/db/database', () => ({
  db: {
    dailyGoals: {
      where: mocks.mockDbDailyGoalsWhere.mockReturnValue({
        equals: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(undefined),
        }),
      }),
      add: mocks.mockDbDailyGoalsAdd,
      update: mocks.mockDbDailyGoalsUpdate,
    },
  },
}));

vi.mock('../../../src/data/dailyGoalsConfig', () => ({
  getTodayKey: () => '2026-03-26',
  dailyGoals: [
    { key: 'lessons', label: 'Lessons', emoji: '', target: 2, color: '' },
    { key: 'games', label: 'Games', emoji: '', target: 3, color: '' },
    { key: 'stories', label: 'Stories', emoji: '', target: 1, color: '' },
    { key: 'videos', label: 'Videos', emoji: '', target: 2, color: '' },
  ],
}));

describe('useDailyGoals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mockPlayerId = 1;
    mocks.mockTodayGoals = null;
  });

  it('returns null todayGoals by default', () => {
    const { result } = renderHook(() => useDailyGoals(1));
    expect(result.current.todayGoals).toBeNull();
  });

  it('returns todayGoals when data exists', () => {
    mocks.mockTodayGoals = {
      id: 1,
      playerId: 1,
      date: '2026-03-26',
      lessonsCompleted: 1,
      gamesPlayed: 2,
      storiesRead: 0,
      videosWatched: 1,
      totalMinutes: 15,
    };
    const { result } = renderHook(() => useDailyGoals(1));
    expect(result.current.todayGoals).toEqual(expect.objectContaining({
      playerId: 1,
      lessonsCompleted: 1,
    }));
  });

  it('returns null todayGoals when playerId is undefined', () => {
    mocks.mockPlayerId = undefined;
    const { result } = renderHook(() => useDailyGoals(undefined));
    expect(result.current.todayGoals).toBeNull();
  });

  it('exposes incrementGoal function', () => {
    const { result } = renderHook(() => useDailyGoals(1));
    expect(typeof result.current.incrementGoal).toBe('function');
  });

  it('exposes addMinutes function', () => {
    const { result } = renderHook(() => useDailyGoals(1));
    expect(typeof result.current.addMinutes).toBe('function');
  });

  it('exposes isAllGoalsMet function', () => {
    const { result } = renderHook(() => useDailyGoals(1));
    expect(typeof result.current.isAllGoalsMet).toBe('function');
  });

  it('isAllGoalsMet returns false when goals are not met', () => {
    const { result } = renderHook(() => useDailyGoals(1));
    const record = {
      id: 1,
      playerId: 1,
      date: '2026-03-26',
      lessonsCompleted: 1,
      gamesPlayed: 2,
      storiesRead: 0,
      videosWatched: 1,
      totalMinutes: 10,
    };
    expect(result.current.isAllGoalsMet(record)).toBe(false);
  });

  it('isAllGoalsMet returns true when all goals are met', () => {
    const { result } = renderHook(() => useDailyGoals(1));
    const record = {
      id: 1,
      playerId: 1,
      date: '2026-03-26',
      lessonsCompleted: 2,
      gamesPlayed: 3,
      storiesRead: 1,
      videosWatched: 2,
      totalMinutes: 30,
    };
    expect(result.current.isAllGoalsMet(record)).toBe(true);
  });

  it('isAllGoalsMet returns true when goals exceed targets', () => {
    const { result } = renderHook(() => useDailyGoals(1));
    const record = {
      id: 1,
      playerId: 1,
      date: '2026-03-26',
      lessonsCompleted: 10,
      gamesPlayed: 10,
      storiesRead: 10,
      videosWatched: 10,
      totalMinutes: 100,
    };
    expect(result.current.isAllGoalsMet(record)).toBe(true);
  });

  it('isAllGoalsMet returns false when only some goals are met', () => {
    const { result } = renderHook(() => useDailyGoals(1));
    const record = {
      id: 1,
      playerId: 1,
      date: '2026-03-26',
      lessonsCompleted: 5,
      gamesPlayed: 5,
      storiesRead: 0, // Not met (target is 1)
      videosWatched: 5,
      totalMinutes: 20,
    };
    expect(result.current.isAllGoalsMet(record)).toBe(false);
  });

  it('isAllGoalsMet returns false when all categories are zero', () => {
    const { result } = renderHook(() => useDailyGoals(1));
    const record = {
      id: 1,
      playerId: 1,
      date: '2026-03-26',
      lessonsCompleted: 0,
      gamesPlayed: 0,
      storiesRead: 0,
      videosWatched: 0,
      totalMinutes: 0,
    };
    expect(result.current.isAllGoalsMet(record)).toBe(false);
  });

  it('incrementGoal calls db to create and update goals', async () => {
    mocks.mockDbDailyGoalsWhere.mockReturnValue({
      equals: vi.fn().mockReturnValue({
        first: vi.fn().mockResolvedValue({
          id: 1,
          playerId: 1,
          date: '2026-03-26',
          lessonsCompleted: 0,
          gamesPlayed: 0,
          storiesRead: 0,
          videosWatched: 0,
          totalMinutes: 0,
        }),
      }),
    });
    mocks.mockDbDailyGoalsUpdate.mockResolvedValue(1);

    const { result } = renderHook(() => useDailyGoals(1));
    await result.current.incrementGoal(1, 'lessonsCompleted');

    expect(mocks.mockDbDailyGoalsUpdate).toHaveBeenCalledWith(1, { lessonsCompleted: 1 });
  });

  it('addMinutes calls db to update totalMinutes', async () => {
    mocks.mockDbDailyGoalsWhere.mockReturnValue({
      equals: vi.fn().mockReturnValue({
        first: vi.fn().mockResolvedValue({
          id: 1,
          playerId: 1,
          date: '2026-03-26',
          lessonsCompleted: 0,
          gamesPlayed: 0,
          storiesRead: 0,
          videosWatched: 0,
          totalMinutes: 5,
        }),
      }),
    });
    mocks.mockDbDailyGoalsUpdate.mockResolvedValue(1);

    const { result } = renderHook(() => useDailyGoals(1));
    await result.current.addMinutes(1, 10);

    expect(mocks.mockDbDailyGoalsUpdate).toHaveBeenCalledWith(1, { totalMinutes: 15 });
  });

  it('getTodayGoals creates new record when none exists', async () => {
    mocks.mockDbDailyGoalsWhere.mockReturnValue({
      equals: vi.fn().mockReturnValue({
        first: vi.fn().mockResolvedValue(undefined),
      }),
    });
    mocks.mockDbDailyGoalsAdd.mockResolvedValue(99);

    const { result } = renderHook(() => useDailyGoals(1));
    // incrementGoal internally calls getTodayGoals
    await result.current.incrementGoal(1, 'gamesPlayed');

    expect(mocks.mockDbDailyGoalsAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        playerId: 1,
        date: '2026-03-26',
        lessonsCompleted: 0,
        gamesPlayed: 0,
        storiesRead: 0,
        videosWatched: 0,
        totalMinutes: 0,
      })
    );
  });
});
