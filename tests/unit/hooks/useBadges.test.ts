import { renderHook, act } from '@testing-library/react';
import { useBadges } from '../../../src/hooks/useBadges';

const mocks = vi.hoisted(() => ({
  mockPlayerId: 1 as number | undefined,
  mockEarnedBadges: [] as any[],
  mockProfile: { id: 1, totalStars: 0 } as any,
  mockProgressData: [] as any[],
  mockStarRecords: [] as any[],
  mockShowCelebration: vi.fn(),
  mockShowBadgeToast: vi.fn(),
  mockShowStarBurst: vi.fn(),
  mockPlayCelebration: vi.fn(),
  mockGetItemsLearnedCount: vi.fn().mockReturnValue(0),
  mockGetTotalCorrect: vi.fn().mockReturnValue(0),
  mockCheckExtendedBadges: vi.fn().mockResolvedValue([]),
  mockDbBadgesWhere: vi.fn(),
  mockDbBadgesAdd: vi.fn(),
}));

vi.mock('../../../src/context/AppContext', () => ({
  useApp: () => ({
    currentPlayer: mocks.mockPlayerId ? { id: mocks.mockPlayerId } : null,
    showStarBurst: mocks.mockShowStarBurst,
    showCelebration: mocks.mockShowCelebration,
    showBadgeToast: mocks.mockShowBadgeToast,
  }),
}));

vi.mock('../../../src/hooks/useProgress', () => ({
  useProgress: () => ({
    progress: mocks.mockProgressData,
    starRecords: mocks.mockStarRecords,
    getItemsLearnedCount: mocks.mockGetItemsLearnedCount,
    getTotalCorrect: mocks.mockGetTotalCorrect,
    recordActivity: vi.fn(),
  }),
}));

vi.mock('../../../src/hooks/useAudio', () => ({
  useAudio: () => ({
    playCelebration: mocks.mockPlayCelebration,
    playCorrect: vi.fn(),
    playTryAgain: vi.fn(),
    playClick: vi.fn(),
    playStar: vi.fn(),
    speak: vi.fn(),
  }),
}));

let useLiveQueryCallIndex = 0;
vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: () => {
    const idx = useLiveQueryCallIndex++;
    // useBadges calls useLiveQuery twice: earnedBadges, then profile
    if (idx % 2 === 0) return mocks.mockEarnedBadges;
    return mocks.mockProfile;
  },
}));

vi.mock('../../../src/db/database', () => ({
  db: {
    badges: {
      where: mocks.mockDbBadgesWhere.mockReturnValue({
        equals: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue([]),
          first: vi.fn().mockResolvedValue(undefined),
        }),
      }),
      add: mocks.mockDbBadgesAdd,
    },
    profiles: {
      get: vi.fn().mockResolvedValue(mocks.mockProfile),
    },
  },
}));

vi.mock('../../../src/data/badgeData', () => ({
  badgeData: [
    { id: 'first-star', name: 'First Star', emoji: 'star', description: 'Earn your first star', category: 'general', threshold: 1 },
    { id: 'star-collector', name: 'Star Collector', emoji: 'sparkles', description: 'Earn 10 stars', category: 'general', threshold: 10 },
    { id: 'abc-starter', name: 'ABC Starter', emoji: 'book', description: 'Learn 5 letters', category: 'abc', threshold: 5 },
    { id: 'quiz-champ', name: 'Quiz Champ', emoji: 'trophy', description: '10 quiz correct', category: 'quiz', threshold: 10 },
  ],
}));

vi.mock('../../../src/registry/rewardConfig', () => ({
  extendedBadges: [
    { id: 'ext-badge-1', name: 'Explorer Badge', emoji: 'globe', description: 'Extended badge' },
  ],
}));

vi.mock('../../../src/engines/rewardEngine', () => ({
  checkExtendedBadges: mocks.mockCheckExtendedBadges,
}));

describe('useBadges', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useLiveQueryCallIndex = 0;
    mocks.mockPlayerId = 1;
    mocks.mockEarnedBadges = [];
    mocks.mockProfile = { id: 1, totalStars: 0 };
    mocks.mockProgressData = [];
    mocks.mockStarRecords = [];
    mocks.mockGetItemsLearnedCount.mockReturnValue(0);
    mocks.mockGetTotalCorrect.mockReturnValue(0);
    mocks.mockCheckExtendedBadges.mockResolvedValue([]);
  });

  it('returns empty earnedBadges initially', () => {
    const { result } = renderHook(() => useBadges(1));
    expect(result.current.earnedBadges).toEqual([]);
    expect(result.current.earnedBadgeIds.size).toBe(0);
  });

  it('returns earned badges when data exists', () => {
    mocks.mockEarnedBadges = [
      { id: 1, playerId: 1, badgeId: 'first-star', earnedAt: new Date() },
    ];
    const { result } = renderHook(() => useBadges(1));
    expect(result.current.earnedBadges).toHaveLength(1);
    expect(result.current.earnedBadgeIds.has('first-star')).toBe(true);
  });

  it('exposes badgeData and extendedBadges', () => {
    const { result } = renderHook(() => useBadges(1));
    expect(result.current.badgeData).toHaveLength(4);
    expect(result.current.extendedBadges).toHaveLength(1);
  });

  it('totalStars returns profile totalStars or 0', () => {
    mocks.mockProfile = { id: 1, totalStars: 42 };
    const { result } = renderHook(() => useBadges(1));
    expect(result.current.totalStars).toBe(42);
  });

  it('totalStars returns 0 when profile is undefined', () => {
    mocks.mockProfile = undefined;
    const { result } = renderHook(() => useBadges(1));
    expect(result.current.totalStars).toBe(0);
  });

  it('getBadgeProgressList returns progress for all badges', () => {
    mocks.mockProfile = { id: 1, totalStars: 5 };
    mocks.mockGetItemsLearnedCount.mockReturnValue(3);
    mocks.mockGetTotalCorrect.mockReturnValue(7);

    const { result } = renderHook(() => useBadges(1));
    const progressList = result.current.getBadgeProgressList();

    expect(progressList).toHaveLength(4);
    // first-star (general): 5 stars, threshold 1
    expect(progressList[0].current).toBe(1); // clamped to min(5,1)
    expect(progressList[0].total).toBe(1);
    expect(progressList[0].ratio).toBe(1);
    // star-collector (general): 5 stars, threshold 10
    expect(progressList[1].current).toBe(5);
    expect(progressList[1].total).toBe(10);
    // abc-starter: getItemsLearnedCount returns 3, threshold 5
    expect(progressList[2].current).toBe(3);
    expect(progressList[2].total).toBe(5);
    // quiz-champ: getTotalCorrect returns 7, threshold 10
    expect(progressList[3].current).toBe(7);
    expect(progressList[3].total).toBe(10);
  });

  it('getBadgeProgressList marks earned badges correctly', () => {
    mocks.mockEarnedBadges = [
      { id: 1, playerId: 1, badgeId: 'first-star', earnedAt: new Date() },
    ];
    mocks.mockProfile = { id: 1, totalStars: 5 };

    const { result } = renderHook(() => useBadges(1));
    const progressList = result.current.getBadgeProgressList();
    expect(progressList[0].earned).toBe(true);
    expect(progressList[0].hint).toBe('Earned!');
    expect(progressList[1].earned).toBe(false);
  });

  it('getNextBadge returns the closest-to-completion locked badge', () => {
    mocks.mockProfile = { id: 1, totalStars: 8 };
    mocks.mockGetItemsLearnedCount.mockReturnValue(4);
    mocks.mockGetTotalCorrect.mockReturnValue(2);

    const { result } = renderHook(() => useBadges(1));
    const next = result.current.getNextBadge();
    expect(next).not.toBeNull();
    // first-star has ratio 1.0 (8/1 clamped), star-collector 0.8, abc-starter 0.8, quiz-champ 0.2
    // first-star is NOT earned so ratio=1 => it should be first
    expect(next!.badge.id).toBe('first-star');
  });

  it('getNextBadge returns null when all badges are earned', () => {
    mocks.mockEarnedBadges = [
      { id: 1, playerId: 1, badgeId: 'first-star', earnedAt: new Date() },
      { id: 2, playerId: 1, badgeId: 'star-collector', earnedAt: new Date() },
      { id: 3, playerId: 1, badgeId: 'abc-starter', earnedAt: new Date() },
      { id: 4, playerId: 1, badgeId: 'quiz-champ', earnedAt: new Date() },
    ];
    const { result } = renderHook(() => useBadges(1));
    expect(result.current.getNextBadge()).toBeNull();
  });

  it('getDaysOfLearning counts unique days from star records', () => {
    mocks.mockStarRecords = [
      { id: 1, earnedAt: new Date('2026-03-20T10:00:00') },
      { id: 2, earnedAt: new Date('2026-03-20T15:00:00') }, // same day
      { id: 3, earnedAt: new Date('2026-03-21T10:00:00') },
      { id: 4, earnedAt: new Date('2026-03-22T10:00:00') },
    ];
    const { result } = renderHook(() => useBadges(1));
    expect(result.current.getDaysOfLearning()).toBe(3);
  });

  it('getDaysOfLearning returns 0 for empty star records', () => {
    mocks.mockStarRecords = [];
    const { result } = renderHook(() => useBadges(1));
    expect(result.current.getDaysOfLearning()).toBe(0);
  });

  it('checkAndAwardBadges does nothing when playerId is undefined', async () => {
    mocks.mockPlayerId = undefined;
    const { result } = renderHook(() => useBadges(undefined));
    await act(async () => {
      await result.current.checkAndAwardBadges(10);
    });
    expect(mocks.mockDbBadgesAdd).not.toHaveBeenCalled();
  });

  it('checkAndAwardBadges awards new general badge when threshold met', async () => {
    mocks.mockDbBadgesWhere.mockReturnValue({
      equals: vi.fn().mockReturnValue({
        toArray: vi.fn().mockResolvedValue([]),
        first: vi.fn().mockResolvedValue(undefined),
      }),
    });
    mocks.mockDbBadgesAdd.mockResolvedValue(1);
    mocks.mockGetItemsLearnedCount.mockReturnValue(0);
    mocks.mockGetTotalCorrect.mockReturnValue(0);

    const { result } = renderHook(() => useBadges(1));
    await act(async () => {
      await result.current.checkAndAwardBadges(1);
    });

    expect(mocks.mockDbBadgesAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        playerId: 1,
        badgeId: 'first-star',
      })
    );
    expect(mocks.mockShowCelebration).toHaveBeenCalled();
    expect(mocks.mockPlayCelebration).toHaveBeenCalled();
    expect(mocks.mockShowBadgeToast).toHaveBeenCalledWith('star', 'First Star');
  });

  it('checkAndAwardBadges skips already-earned badges', async () => {
    mocks.mockEarnedBadges = [
      { id: 1, playerId: 1, badgeId: 'first-star', earnedAt: new Date() },
    ];
    mocks.mockDbBadgesWhere.mockReturnValue({
      equals: vi.fn().mockReturnValue({
        toArray: vi.fn().mockResolvedValue([]),
        first: vi.fn().mockResolvedValue(undefined),
      }),
    });
    mocks.mockDbBadgesAdd.mockResolvedValue(1);

    const { result } = renderHook(() => useBadges(1));
    await act(async () => {
      await result.current.checkAndAwardBadges(1);
    });

    // first-star is already earned, should not be added again
    const addCalls = mocks.mockDbBadgesAdd.mock.calls;
    const firstStarCalls = addCalls.filter((call: any) => call[0]?.badgeId === 'first-star');
    expect(firstStarCalls).toHaveLength(0);
  });

  it('checkAndAwardExtendedBadges does nothing when playerId is undefined', async () => {
    mocks.mockPlayerId = undefined;
    const { result } = renderHook(() => useBadges(undefined));
    await act(async () => {
      await result.current.checkAndAwardExtendedBadges();
    });
    expect(mocks.mockCheckExtendedBadges).not.toHaveBeenCalled();
  });

  it('checkAndAwardExtendedBadges awards new extended badges', async () => {
    mocks.mockCheckExtendedBadges.mockResolvedValue(['ext-badge-1']);
    mocks.mockDbBadgesWhere.mockReturnValue({
      equals: vi.fn().mockReturnValue({
        toArray: vi.fn().mockResolvedValue([]),
        first: vi.fn().mockResolvedValue(undefined),
      }),
    });
    mocks.mockDbBadgesAdd.mockResolvedValue(1);

    const { result } = renderHook(() => useBadges(1));
    await act(async () => {
      await result.current.checkAndAwardExtendedBadges();
    });

    expect(mocks.mockDbBadgesAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        playerId: 1,
        badgeId: 'ext-badge-1',
      })
    );
    expect(mocks.mockShowCelebration).toHaveBeenCalled();
    expect(mocks.mockPlayCelebration).toHaveBeenCalled();
  });
});
