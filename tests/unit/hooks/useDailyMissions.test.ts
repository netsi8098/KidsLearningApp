import { renderHook, act } from '@testing-library/react';
import { useDailyMissions } from '../../../src/hooks/useDailyMissions';

const mocks = vi.hoisted(() => ({
  mockPlayerId: 1 as number | undefined,
  mockMissions: [] as any[],
  mockDbDailyMissionsWhere: vi.fn(),
  mockDbDailyMissionsBulkAdd: vi.fn(),
  mockDbDailyMissionsUpdate: vi.fn(),
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
  useLiveQuery: () => mocks.mockMissions,
}));

vi.mock('../../../src/db/database', () => ({
  db: {
    dailyMissions: {
      where: mocks.mockDbDailyMissionsWhere.mockReturnValue({
        between: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue([]),
          count: vi.fn().mockResolvedValue(0),
        }),
        equals: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(undefined),
        }),
      }),
      bulkAdd: mocks.mockDbDailyMissionsBulkAdd,
      update: mocks.mockDbDailyMissionsUpdate,
    },
  },
}));

vi.mock('../../../src/data/missionTemplates', () => ({
  missionTemplates: [
    { id: 'watch-video', type: 'watch-video', emoji: 'movie', descriptionTemplate: '{name}, watch a video!', route: '/videos', category: 'listen', ageGroups: ['2-3', '4-5', '6-8'] },
    { id: 'do-alphabet', type: 'do-alphabet', emoji: 'abc', descriptionTemplate: '{name}, practice letters!', route: '/abc', category: 'learn', ageGroups: ['2-3', '4-5', '6-8'] },
    { id: 'dance-2min', type: 'dance-2min', emoji: 'dance', descriptionTemplate: '{name}, dance!', route: '/movement', category: 'play', ageGroups: ['2-3', '4-5', '6-8'] },
    { id: 'listen-story', type: 'listen-story', emoji: 'book', descriptionTemplate: '{name}, listen!', route: '/stories', category: 'listen', ageGroups: ['2-3', '4-5', '6-8'] },
    { id: 'draw-picture', type: 'draw-picture', emoji: 'art', descriptionTemplate: '{name}, draw!', route: '/coloring', category: 'create', ageGroups: ['2-3', '4-5', '6-8'] },
    { id: 'emotion-checkin', type: 'emotion-checkin', emoji: 'heart', descriptionTemplate: '{name}, how are you?', route: '/emotions', category: 'wellbeing', ageGroups: ['2-3', '4-5', '6-8'] },
  ],
}));

describe('useDailyMissions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mockPlayerId = 1;
    mocks.mockMissions = [];
  });

  it('returns empty missions array by default', () => {
    const { result } = renderHook(() => useDailyMissions(1));
    expect(result.current.missions).toEqual([]);
  });

  it('returns enriched missions when data exists', () => {
    mocks.mockMissions = [
      { id: 1, playerId: 1, date: '2026-03-26', missionId: 'watch-video', completed: false },
      { id: 2, playerId: 1, date: '2026-03-26', missionId: 'do-alphabet', completed: true, completedAt: new Date() },
    ];
    const { result } = renderHook(() => useDailyMissions(1));
    expect(result.current.missions).toHaveLength(2);
    // Enriched with template data
    expect(result.current.missions[0].emoji).toBe('movie');
    expect(result.current.missions[0].description).toBe('{name}, watch a video!');
    expect(result.current.missions[0].route).toBe('/videos');
    expect(result.current.missions[0].category).toBe('listen');
  });

  it('enriched missions use defaults for unknown missionId', () => {
    mocks.mockMissions = [
      { id: 1, playerId: 1, date: '2026-03-26', missionId: 'unknown-mission', completed: false },
    ];
    const { result } = renderHook(() => useDailyMissions(1));
    expect(result.current.missions[0].description).toBe('Complete a mission!');
    expect(result.current.missions[0].route).toBe('/menu');
    expect(result.current.missions[0].category).toBe('learn');
  });

  it('allComplete is false when missions is empty', () => {
    mocks.mockMissions = [];
    const { result } = renderHook(() => useDailyMissions(1));
    expect(result.current.allComplete).toBe(false);
  });

  it('allComplete is false when some missions are incomplete', () => {
    mocks.mockMissions = [
      { id: 1, playerId: 1, date: '2026-03-26', missionId: 'watch-video', completed: true },
      { id: 2, playerId: 1, date: '2026-03-26', missionId: 'do-alphabet', completed: false },
    ];
    const { result } = renderHook(() => useDailyMissions(1));
    expect(result.current.allComplete).toBe(false);
  });

  it('allComplete is true when all missions are completed', () => {
    mocks.mockMissions = [
      { id: 1, playerId: 1, date: '2026-03-26', missionId: 'watch-video', completed: true },
      { id: 2, playerId: 1, date: '2026-03-26', missionId: 'do-alphabet', completed: true },
    ];
    const { result } = renderHook(() => useDailyMissions(1));
    expect(result.current.allComplete).toBe(true);
  });

  it('completeMission does nothing when playerId is undefined', async () => {
    mocks.mockPlayerId = undefined;
    const { result } = renderHook(() => useDailyMissions(undefined));
    await act(async () => {
      await result.current.completeMission('watch-video');
    });
    expect(mocks.mockDbDailyMissionsUpdate).not.toHaveBeenCalled();
  });

  it('completeMission updates record when found and not completed', async () => {
    mocks.mockDbDailyMissionsWhere.mockReturnValue({
      between: vi.fn().mockReturnValue({
        toArray: vi.fn().mockResolvedValue([]),
        count: vi.fn().mockResolvedValue(3),
      }),
      equals: vi.fn().mockReturnValue({
        first: vi.fn().mockResolvedValue({
          id: 5,
          playerId: 1,
          date: '2026-03-26',
          missionId: 'watch-video',
          completed: false,
        }),
      }),
    });
    mocks.mockDbDailyMissionsUpdate.mockResolvedValue(1);

    const { result } = renderHook(() => useDailyMissions(1));
    await act(async () => {
      await result.current.completeMission('watch-video');
    });

    expect(mocks.mockDbDailyMissionsUpdate).toHaveBeenCalledWith(5, expect.objectContaining({
      completed: true,
    }));
  });

  it('completeMission does not update already completed mission', async () => {
    mocks.mockDbDailyMissionsWhere.mockReturnValue({
      between: vi.fn().mockReturnValue({
        toArray: vi.fn().mockResolvedValue([]),
        count: vi.fn().mockResolvedValue(3),
      }),
      equals: vi.fn().mockReturnValue({
        first: vi.fn().mockResolvedValue({
          id: 5,
          playerId: 1,
          date: '2026-03-26',
          missionId: 'watch-video',
          completed: true,
          completedAt: new Date(),
        }),
      }),
    });

    const { result } = renderHook(() => useDailyMissions(1));
    await act(async () => {
      await result.current.completeMission('watch-video');
    });

    expect(mocks.mockDbDailyMissionsUpdate).not.toHaveBeenCalled();
  });

  it('completeMission does nothing when mission record not found', async () => {
    mocks.mockDbDailyMissionsWhere.mockReturnValue({
      between: vi.fn().mockReturnValue({
        toArray: vi.fn().mockResolvedValue([]),
        count: vi.fn().mockResolvedValue(3),
      }),
      equals: vi.fn().mockReturnValue({
        first: vi.fn().mockResolvedValue(undefined),
      }),
    });

    const { result } = renderHook(() => useDailyMissions(1));
    await act(async () => {
      await result.current.completeMission('nonexistent');
    });

    expect(mocks.mockDbDailyMissionsUpdate).not.toHaveBeenCalled();
  });

  it('generateMissions skips when missions already exist for today', async () => {
    mocks.mockDbDailyMissionsWhere.mockReturnValue({
      between: vi.fn().mockReturnValue({
        toArray: vi.fn().mockResolvedValue([]),
        count: vi.fn().mockResolvedValue(3),
      }),
      equals: vi.fn().mockReturnValue({
        first: vi.fn().mockResolvedValue(undefined),
      }),
    });

    const { result } = renderHook(() => useDailyMissions(1));
    await act(async () => {
      await result.current.generateMissions();
    });

    expect(mocks.mockDbDailyMissionsBulkAdd).not.toHaveBeenCalled();
  });

  it('generateMissions creates missions when none exist', async () => {
    mocks.mockDbDailyMissionsWhere.mockReturnValue({
      between: vi.fn().mockReturnValue({
        toArray: vi.fn().mockResolvedValue([]),
        count: vi.fn().mockResolvedValue(0),
      }),
      equals: vi.fn().mockReturnValue({
        first: vi.fn().mockResolvedValue(undefined),
      }),
    });
    mocks.mockDbDailyMissionsBulkAdd.mockResolvedValue(undefined);

    const { result } = renderHook(() => useDailyMissions(1));
    await act(async () => {
      await result.current.generateMissions();
    });

    expect(mocks.mockDbDailyMissionsBulkAdd).toHaveBeenCalled();
    const addedRecords = mocks.mockDbDailyMissionsBulkAdd.mock.calls[0][0];
    expect(addedRecords.length).toBeGreaterThanOrEqual(3);
    expect(addedRecords.length).toBeLessThanOrEqual(5);
    // Each record should have required fields
    addedRecords.forEach((record: any) => {
      expect(record.playerId).toBe(1);
      expect(record.completed).toBe(false);
      expect(record.missionId).toBeDefined();
      expect(record.date).toBeDefined();
    });
  });

  it('generateMissions does nothing when playerId is undefined', async () => {
    mocks.mockPlayerId = undefined;
    const { result } = renderHook(() => useDailyMissions(undefined));
    await act(async () => {
      await result.current.generateMissions();
    });
    expect(mocks.mockDbDailyMissionsBulkAdd).not.toHaveBeenCalled();
  });

  it('exposes all expected methods and properties', () => {
    const { result } = renderHook(() => useDailyMissions(1));
    expect(Array.isArray(result.current.missions)).toBe(true);
    expect(typeof result.current.completeMission).toBe('function');
    expect(typeof result.current.allComplete).toBe('boolean');
    expect(typeof result.current.generateMissions).toBe('function');
  });
});
