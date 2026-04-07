import { renderHook, act } from '@testing-library/react';
import { useNudges } from '../../../src/hooks/useNudges';

const mocks = vi.hoisted(() => ({
  mockPlayerId: 1 as number | undefined,
  mockProfile: {
    streakDays: 3,
    lastPlayedAt: new Date(),
  } as { streakDays: number; lastPlayedAt: Date | null } | undefined,
  mockDismissedNudges: [] as { playerId: number; nudgeId: string; dismissedAt: Date }[],
  mockRecentHistory: [] as { playerId: number; contentId: string; interactedAt: Date }[],
  mockNudgeStateAdd: vi.fn(),
  // Track which useLiveQuery call we're on
  useLiveQueryCallIndex: 0,
}));

vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: () => {
    const index = mocks.useLiveQueryCallIndex++;
    if (index % 3 === 0) return mocks.mockProfile;
    if (index % 3 === 1) return mocks.mockDismissedNudges;
    return mocks.mockRecentHistory;
  },
}));

vi.mock('../../../src/registry/nudgeConfig', () => ({
  nudgeRules: [
    {
      id: 'inactive-3-days',
      emoji: '🌟',
      condition: 'inactive-3-days',
      message: 'We miss you!',
      actionRoute: '/menu',
      actionLabel: 'Jump back in',
      priority: 90,
    },
    {
      id: 'streak-at-risk',
      emoji: '🔥',
      condition: 'streak-at-risk',
      message: 'Keep your streak!',
      actionRoute: '/menu',
      actionLabel: 'Keep it going',
      priority: 85,
    },
    {
      id: 'new-content',
      emoji: '✨',
      condition: 'new-content-available',
      message: 'New activities!',
      actionRoute: '/discover',
      actionLabel: "See what's new",
      priority: 70,
    },
    {
      id: 'incomplete-collection',
      emoji: '📦',
      condition: 'incomplete-collection',
      message: 'Finish your collection!',
      actionRoute: '/collections',
      actionLabel: 'Continue collection',
      priority: 75,
    },
    {
      id: 'skill-gap',
      emoji: '🧠',
      condition: 'skill-gap',
      message: 'Try something new!',
      actionRoute: '/discover',
      actionLabel: 'Explore new skills',
      priority: 60,
    },
    {
      id: 'weekly-recap-ready',
      emoji: '📊',
      condition: 'weekly-recap-ready',
      message: 'Weekly recap ready!',
      actionRoute: '/weekly-recap',
      actionLabel: 'View recap',
      priority: 50,
    },
  ],
}));

vi.mock('../../../src/db/database', () => ({
  db: {
    profiles: {
      get: vi.fn(() => Promise.resolve(mocks.mockProfile)),
    },
    nudgeState: {
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          toArray: vi.fn(() => Promise.resolve(mocks.mockDismissedNudges)),
        })),
      })),
      add: mocks.mockNudgeStateAdd,
    },
    contentHistory: {
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          filter: vi.fn(() => ({
            toArray: vi.fn(() => Promise.resolve(mocks.mockRecentHistory)),
          })),
        })),
      })),
    },
  },
}));

describe('useNudges', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mockPlayerId = 1;
    mocks.mockProfile = {
      streakDays: 3,
      lastPlayedAt: new Date(),
    };
    mocks.mockDismissedNudges = [];
    mocks.mockRecentHistory = [];
    mocks.useLiveQueryCallIndex = 0;
  });

  describe('nudges with no player', () => {
    it('returns empty nudges when playerId is undefined', () => {
      mocks.mockPlayerId = undefined;
      mocks.mockProfile = undefined;

      const { result } = renderHook(() => useNudges(undefined));
      expect(result.current.nudges).toEqual([]);
    });
  });

  describe('nudges with active profile', () => {
    it('always includes new-content-available nudge', () => {
      const { result } = renderHook(() => useNudges(mocks.mockPlayerId));
      const newContent = result.current.nudges.find((n) => n.id === 'new-content');
      expect(newContent).toBeDefined();
    });

    it('includes inactive-3-days nudge when player inactive for 3+ days', () => {
      mocks.mockProfile = {
        streakDays: 3,
        lastPlayedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
      };

      const { result } = renderHook(() => useNudges(mocks.mockPlayerId));
      const inactive = result.current.nudges.find((n) => n.id === 'inactive-3-days');
      expect(inactive).toBeDefined();
    });

    it('excludes inactive-3-days nudge when player active recently', () => {
      mocks.mockProfile = {
        streakDays: 3,
        lastPlayedAt: new Date(), // just played
      };

      const { result } = renderHook(() => useNudges(mocks.mockPlayerId));
      const inactive = result.current.nudges.find((n) => n.id === 'inactive-3-days');
      expect(inactive).toBeUndefined();
    });

    it('includes streak-at-risk when streak > 0 and 1+ days since play', () => {
      mocks.mockProfile = {
        streakDays: 5,
        lastPlayedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      };

      const { result } = renderHook(() => useNudges(mocks.mockPlayerId));
      const streakRisk = result.current.nudges.find((n) => n.id === 'streak-at-risk');
      expect(streakRisk).toBeDefined();
    });

    it('excludes streak-at-risk when streakDays is 0', () => {
      mocks.mockProfile = {
        streakDays: 0,
        lastPlayedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      };

      const { result } = renderHook(() => useNudges(mocks.mockPlayerId));
      const streakRisk = result.current.nudges.find((n) => n.id === 'streak-at-risk');
      expect(streakRisk).toBeUndefined();
    });

    it('includes incomplete-collection when recentHistory > 5', () => {
      mocks.mockRecentHistory = Array.from({ length: 6 }, (_, i) => ({
        playerId: 1,
        contentId: `lesson:${i}`,
        interactedAt: new Date(),
      }));

      const { result } = renderHook(() => useNudges(mocks.mockPlayerId));
      const incomplete = result.current.nudges.find((n) => n.id === 'incomplete-collection');
      expect(incomplete).toBeDefined();
    });

    it('excludes incomplete-collection when recentHistory <= 5', () => {
      mocks.mockRecentHistory = Array.from({ length: 3 }, (_, i) => ({
        playerId: 1,
        contentId: `lesson:${i}`,
        interactedAt: new Date(),
      }));

      const { result } = renderHook(() => useNudges(mocks.mockPlayerId));
      const incomplete = result.current.nudges.find((n) => n.id === 'incomplete-collection');
      expect(incomplete).toBeUndefined();
    });

    it('includes skill-gap when recentHistory > 10', () => {
      mocks.mockRecentHistory = Array.from({ length: 11 }, (_, i) => ({
        playerId: 1,
        contentId: `lesson:${i}`,
        interactedAt: new Date(),
      }));

      const { result } = renderHook(() => useNudges(mocks.mockPlayerId));
      const skillGap = result.current.nudges.find((n) => n.id === 'skill-gap');
      expect(skillGap).toBeDefined();
    });
  });

  describe('dismissed nudges', () => {
    it('filters out dismissed nudges from visible list', () => {
      mocks.mockDismissedNudges = [
        { playerId: 1, nudgeId: 'new-content', dismissedAt: new Date() },
      ];

      const { result } = renderHook(() => useNudges(mocks.mockPlayerId));
      const newContent = result.current.nudges.find((n) => n.id === 'new-content');
      expect(newContent).toBeUndefined();
    });
  });

  describe('sorting', () => {
    it('sorts nudges by priority descending', () => {
      mocks.mockProfile = {
        streakDays: 5,
        lastPlayedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      };

      const { result } = renderHook(() => useNudges(mocks.mockPlayerId));

      for (let i = 1; i < result.current.nudges.length; i++) {
        expect(result.current.nudges[i - 1].priority).toBeGreaterThanOrEqual(
          result.current.nudges[i].priority
        );
      }
    });
  });

  describe('dismissNudge', () => {
    it('adds nudge to dismissed state in DB', async () => {
      const { result } = renderHook(() => useNudges(mocks.mockPlayerId));

      await act(async () => {
        await result.current.dismissNudge('new-content');
      });

      expect(mocks.mockNudgeStateAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          playerId: 1,
          nudgeId: 'new-content',
          dismissedAt: expect.any(Date),
        })
      );
    });

    it('does nothing when no player is set', async () => {
      const { result } = renderHook(() => useNudges(undefined));

      await act(async () => {
        await result.current.dismissNudge('new-content');
      });

      expect(mocks.mockNudgeStateAdd).not.toHaveBeenCalled();
    });
  });
});
