import { renderHook, act } from '@testing-library/react';
import { useProfiles } from '../../../src/hooks/useProfile';

const mocks = vi.hoisted(() => {
  const mockDbProfilesAdd = vi.fn();
  const mockDbProfilesUpdate = vi.fn();
  const mockDbProfilesGet = vi.fn();
  const mockDbProfilesDelete = vi.fn();
  const mockDbProfilesToArray = vi.fn();
  const mockDbTransaction = vi.fn();

  const mockWhereDeleteChain = () => ({
    where: vi.fn().mockReturnValue({
      equals: vi.fn().mockReturnValue({
        delete: vi.fn().mockResolvedValue(0),
      }),
    }),
  });

  return {
    mockProfiles: [] as any[],
    mockDbProfilesAdd,
    mockDbProfilesUpdate,
    mockDbProfilesGet,
    mockDbProfilesDelete,
    mockDbProfilesToArray,
    mockDbTransaction,
    mockWhereDeleteChain,
  };
});

vi.mock('../../../src/context/AppContext', () => ({
  useApp: () => ({
    currentPlayer: null,
    showStarBurst: vi.fn(),
    showCelebration: vi.fn(),
    showBadgeToast: vi.fn(),
  }),
}));

vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: () => mocks.mockProfiles,
}));

vi.mock('../../../src/db/database', () => ({
  db: {
    profiles: {
      toArray: mocks.mockDbProfilesToArray.mockResolvedValue([]),
      add: mocks.mockDbProfilesAdd,
      update: mocks.mockDbProfilesUpdate,
      get: mocks.mockDbProfilesGet,
      delete: mocks.mockDbProfilesDelete,
    },
    progress: mocks.mockWhereDeleteChain(),
    badges: mocks.mockWhereDeleteChain(),
    stars: mocks.mockWhereDeleteChain(),
    videoFavorites: mocks.mockWhereDeleteChain(),
    watchHistory: mocks.mockWhereDeleteChain(),
    lessonProgress: mocks.mockWhereDeleteChain(),
    storyProgress: mocks.mockWhereDeleteChain(),
    dailyGoals: mocks.mockWhereDeleteChain(),
    gameScores: mocks.mockWhereDeleteChain(),
    artworks: mocks.mockWhereDeleteChain(),
    cookingProgress: mocks.mockWhereDeleteChain(),
    audioProgress: mocks.mockWhereDeleteChain(),
    bedtimeSessions: mocks.mockWhereDeleteChain(),
    movementProgress: mocks.mockWhereDeleteChain(),
    moodCheckIns: mocks.mockWhereDeleteChain(),
    lifeSkillsProgress: mocks.mockWhereDeleteChain(),
    dailyMissions: mocks.mockWhereDeleteChain(),
    assessmentResults: mocks.mockWhereDeleteChain(),
    homeActivityProgress: mocks.mockWhereDeleteChain(),
    mediaQueue: mocks.mockWhereDeleteChain(),
    scrapbookEntries: mocks.mockWhereDeleteChain(),
    explorerProgress: mocks.mockWhereDeleteChain(),
    collectionProgress: mocks.mockWhereDeleteChain(),
    playlistProgress: mocks.mockWhereDeleteChain(),
    contentHistory: mocks.mockWhereDeleteChain(),
    universalFavorites: mocks.mockWhereDeleteChain(),
    nudgeState: mocks.mockWhereDeleteChain(),
    weeklyRecaps: mocks.mockWhereDeleteChain(),
    onboardingState: mocks.mockWhereDeleteChain(),
    transaction: mocks.mockDbTransaction.mockImplementation(
      async (_mode: string, _tables: any[], fn: () => Promise<void>) => {
        await fn();
      }
    ),
  },
}));

describe('useProfiles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mockProfiles = [];
  });

  it('returns empty profiles array by default', () => {
    const { result } = renderHook(() => useProfiles());
    expect(result.current.profiles).toEqual([]);
  });

  it('returns profiles when data exists', () => {
    mocks.mockProfiles = [
      { id: 1, name: 'Alice', avatarEmoji: 'cat', totalStars: 5, streakDays: 3 },
      { id: 2, name: 'Bob', avatarEmoji: 'dog', totalStars: 10, streakDays: 1 },
    ];
    const { result } = renderHook(() => useProfiles());
    expect(result.current.profiles).toHaveLength(2);
    expect(result.current.profiles[0].name).toBe('Alice');
  });

  it('createProfile creates a new profile with defaults', async () => {
    mocks.mockDbProfilesAdd.mockResolvedValue(1);
    const { result } = renderHook(() => useProfiles());

    let profile: any;
    await act(async () => {
      profile = await result.current.createProfile('Alice', 'cat');
    });

    expect(mocks.mockDbProfilesAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Alice',
        avatarEmoji: 'cat',
        totalStars: 0,
        streakDays: 1,
        interests: [],
        learningLevel: 'beginner',
        bedtimeMode: false,
        characterPreference: '',
      })
    );
    expect(profile.name).toBe('Alice');
    expect(profile.totalStars).toBe(0);
  });

  it('createProfile accepts optional age, ageGroup, and interests', async () => {
    mocks.mockDbProfilesAdd.mockResolvedValue(2);
    const { result } = renderHook(() => useProfiles());

    let profile: any;
    await act(async () => {
      profile = await result.current.createProfile('Bob', 'dog', 5, '4-5', ['animals', 'colors']);
    });

    expect(mocks.mockDbProfilesAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Bob',
        age: 5,
        ageGroup: '4-5',
        interests: ['animals', 'colors'],
      })
    );
    expect(profile.age).toBe(5);
    expect(profile.ageGroup).toBe('4-5');
    expect(profile.interests).toEqual(['animals', 'colors']);
  });

  it('updateProfile calls db.profiles.update', async () => {
    mocks.mockDbProfilesUpdate.mockResolvedValue(1);
    const { result } = renderHook(() => useProfiles());

    await act(async () => {
      await result.current.updateProfile(1, { name: 'Alice Updated', totalStars: 20 });
    });

    expect(mocks.mockDbProfilesUpdate).toHaveBeenCalledWith(1, {
      name: 'Alice Updated',
      totalStars: 20,
    });
  });

  it('updateLastPlayed continues streak when played yesterday', async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    mocks.mockDbProfilesGet.mockResolvedValue({
      id: 1,
      name: 'Alice',
      streakDays: 3,
      lastStreakDate: yesterdayStr,
    });
    mocks.mockDbProfilesUpdate.mockResolvedValue(1);

    const { result } = renderHook(() => useProfiles());
    await act(async () => {
      await result.current.updateLastPlayed(1);
    });

    const todayStr = new Date().toISOString().slice(0, 10);
    expect(mocks.mockDbProfilesUpdate).toHaveBeenCalledWith(1, expect.objectContaining({
      streakDays: 4,
      lastStreakDate: todayStr,
    }));
  });

  it('updateLastPlayed resets streak when last played before yesterday', async () => {
    mocks.mockDbProfilesGet.mockResolvedValue({
      id: 1,
      name: 'Alice',
      streakDays: 5,
      lastStreakDate: '2026-03-20', // Several days ago
    });
    mocks.mockDbProfilesUpdate.mockResolvedValue(1);

    const { result } = renderHook(() => useProfiles());
    await act(async () => {
      await result.current.updateLastPlayed(1);
    });

    const todayStr = new Date().toISOString().slice(0, 10);
    expect(mocks.mockDbProfilesUpdate).toHaveBeenCalledWith(1, expect.objectContaining({
      streakDays: 1,
      lastStreakDate: todayStr,
    }));
  });

  it('updateLastPlayed keeps streak unchanged if already played today', async () => {
    const todayStr = new Date().toISOString().slice(0, 10);
    mocks.mockDbProfilesGet.mockResolvedValue({
      id: 1,
      name: 'Alice',
      streakDays: 3,
      lastStreakDate: todayStr,
    });
    mocks.mockDbProfilesUpdate.mockResolvedValue(1);

    const { result } = renderHook(() => useProfiles());
    await act(async () => {
      await result.current.updateLastPlayed(1);
    });

    expect(mocks.mockDbProfilesUpdate).toHaveBeenCalledWith(1, expect.objectContaining({
      streakDays: 3,
      lastStreakDate: todayStr,
    }));
  });

  it('updateLastPlayed does nothing when profile not found', async () => {
    mocks.mockDbProfilesGet.mockResolvedValue(undefined);

    const { result } = renderHook(() => useProfiles());
    await act(async () => {
      await result.current.updateLastPlayed(999);
    });

    expect(mocks.mockDbProfilesUpdate).not.toHaveBeenCalled();
  });

  it('addStars increments totalStars', async () => {
    mocks.mockDbProfilesGet.mockResolvedValue({
      id: 1,
      name: 'Alice',
      totalStars: 10,
    });
    mocks.mockDbProfilesUpdate.mockResolvedValue(1);

    const { result } = renderHook(() => useProfiles());
    await act(async () => {
      await result.current.addStars(1, 5);
    });

    expect(mocks.mockDbProfilesUpdate).toHaveBeenCalledWith(1, { totalStars: 15 });
  });

  it('addStars does nothing when profile not found', async () => {
    mocks.mockDbProfilesGet.mockResolvedValue(undefined);

    const { result } = renderHook(() => useProfiles());
    await act(async () => {
      await result.current.addStars(999, 5);
    });

    expect(mocks.mockDbProfilesUpdate).not.toHaveBeenCalled();
  });

  it('getProfile returns profile from db', async () => {
    const mockProfile = { id: 1, name: 'Alice', totalStars: 10 };
    mocks.mockDbProfilesGet.mockResolvedValue(mockProfile);

    const { result } = renderHook(() => useProfiles());
    let profile: any;
    await act(async () => {
      profile = await result.current.getProfile(1);
    });

    expect(profile).toEqual(mockProfile);
    expect(mocks.mockDbProfilesGet).toHaveBeenCalledWith(1);
  });

  it('deleteProfile removes profile and all related data in transaction', async () => {
    const { result } = renderHook(() => useProfiles());
    await act(async () => {
      await result.current.deleteProfile(1);
    });

    expect(mocks.mockDbTransaction).toHaveBeenCalled();
    // Verify the transaction callback was executed (db.profiles.delete was called inside)
    const { db } = await import('../../../src/db/database');
    expect(db.profiles.delete).toHaveBeenCalledWith(1);
  });

  it('exposes all expected methods', () => {
    const { result } = renderHook(() => useProfiles());
    expect(result.current.profiles).toBeDefined();
    expect(typeof result.current.createProfile).toBe('function');
    expect(typeof result.current.updateProfile).toBe('function');
    expect(typeof result.current.updateLastPlayed).toBe('function');
    expect(typeof result.current.addStars).toBe('function');
    expect(typeof result.current.getProfile).toBe('function');
    expect(typeof result.current.deleteProfile).toBe('function');
  });
});
