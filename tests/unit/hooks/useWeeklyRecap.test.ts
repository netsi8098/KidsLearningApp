import { renderHook, act } from '@testing-library/react';
import { useWeeklyRecap } from '../../../src/hooks/useWeeklyRecap';

const mocks = vi.hoisted(() => ({
  mockPlayerId: 1 as number | undefined,
  mockRecaps: [] as unknown[],
  mockExistingRecap: undefined as unknown,
  mockContentHistory: [] as { playerId: number; contentId: string; interactedAt: Date }[],
  mockStars: [] as { playerId: number; starsEarned: number; earnedAt: Date }[],
  mockGamesCount: 0,
  mockStoriesCount: 0,
  mockProfile: { streakDays: 5 } as { streakDays: number } | undefined,
  mockWeeklyRecapsAdd: vi.fn(),
}));

vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: () => mocks.mockRecaps,
}));

vi.mock('../../../src/db/database', () => ({
  db: {
    weeklyRecaps: {
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          reverse: vi.fn(() => ({
            sortBy: vi.fn(() => Promise.resolve(mocks.mockRecaps)),
          })),
          first: vi.fn(() => Promise.resolve(mocks.mockExistingRecap)),
        })),
      })),
      add: mocks.mockWeeklyRecapsAdd,
    },
    contentHistory: {
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          filter: vi.fn(() => ({
            toArray: vi.fn(() => Promise.resolve(mocks.mockContentHistory)),
          })),
        })),
      })),
    },
    stars: {
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          filter: vi.fn(() => ({
            toArray: vi.fn(() => Promise.resolve(mocks.mockStars)),
          })),
        })),
      })),
    },
    gameScores: {
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          filter: vi.fn(() => ({
            count: vi.fn(() => Promise.resolve(mocks.mockGamesCount)),
          })),
        })),
      })),
    },
    storyProgress: {
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          filter: vi.fn(() => ({
            count: vi.fn(() => Promise.resolve(mocks.mockStoriesCount)),
          })),
        })),
      })),
    },
    profiles: {
      get: vi.fn(() => Promise.resolve(mocks.mockProfile)),
    },
  },
}));

describe('useWeeklyRecap', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mockPlayerId = 1;
    mocks.mockRecaps = [];
    mocks.mockExistingRecap = undefined;
    mocks.mockContentHistory = [];
    mocks.mockStars = [];
    mocks.mockGamesCount = 0;
    mocks.mockStoriesCount = 0;
    mocks.mockProfile = { streakDays: 5 };
  });

  describe('recaps', () => {
    it('returns empty array when no recaps exist', () => {
      const { result } = renderHook(() => useWeeklyRecap(mocks.mockPlayerId));
      expect(result.current.recaps).toEqual([]);
    });

    it('returns past recaps from DB', () => {
      mocks.mockRecaps = [
        { weekKey: '2026-03-22', totalActivities: 10, starsEarned: 25 },
        { weekKey: '2026-03-15', totalActivities: 8, starsEarned: 18 },
      ];

      const { result } = renderHook(() => useWeeklyRecap(mocks.mockPlayerId));
      expect(result.current.recaps).toHaveLength(2);
    });
  });

  describe('currentWeekKey', () => {
    it('returns a valid ISO date string', () => {
      const { result } = renderHook(() => useWeeklyRecap(mocks.mockPlayerId));
      expect(result.current.currentWeekKey).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('returns a Sunday date (start of week)', () => {
      const { result } = renderHook(() => useWeeklyRecap(mocks.mockPlayerId));
      const date = new Date(result.current.currentWeekKey + 'T00:00:00');
      expect(date.getDay()).toBe(0); // Sunday
    });
  });

  describe('generateCurrentWeekRecap', () => {
    it('returns null when no playerId', async () => {
      const { result } = renderHook(() => useWeeklyRecap(undefined));

      let recap: unknown;
      await act(async () => {
        recap = await result.current.generateCurrentWeekRecap();
      });

      expect(recap).toBeNull();
      expect(mocks.mockWeeklyRecapsAdd).not.toHaveBeenCalled();
    });

    it('returns existing recap if already generated this week', async () => {
      const existingRecap = {
        weekKey: '2026-03-22',
        totalActivities: 15,
        starsEarned: 30,
        topSkills: ['lesson', 'game'],
        gamesPlayed: 5,
        storiesCompleted: 3,
        favoriteType: 'lesson',
        streakDays: 5,
        generatedAt: new Date(),
      };
      mocks.mockExistingRecap = existingRecap;

      const { result } = renderHook(() => useWeeklyRecap(mocks.mockPlayerId));

      let recap: unknown;
      await act(async () => {
        recap = await result.current.generateCurrentWeekRecap();
      });

      expect(recap).toEqual(existingRecap);
      expect(mocks.mockWeeklyRecapsAdd).not.toHaveBeenCalled();
    });

    it('generates a new recap with content history data', async () => {
      mocks.mockContentHistory = [
        { playerId: 1, contentId: 'lesson:abc', interactedAt: new Date() },
        { playerId: 1, contentId: 'lesson:123', interactedAt: new Date() },
        { playerId: 1, contentId: 'game:memory', interactedAt: new Date() },
      ];
      mocks.mockStars = [
        { playerId: 1, starsEarned: 5, earnedAt: new Date() },
        { playerId: 1, starsEarned: 3, earnedAt: new Date() },
      ];
      mocks.mockGamesCount = 2;
      mocks.mockStoriesCount = 1;

      const { result } = renderHook(() => useWeeklyRecap(mocks.mockPlayerId));

      let recap: unknown;
      await act(async () => {
        recap = await result.current.generateCurrentWeekRecap();
      });

      expect(recap).toBeDefined();
      expect(mocks.mockWeeklyRecapsAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          playerId: 1,
          totalActivities: 3,
          starsEarned: 8,
          gamesPlayed: 2,
          storiesCompleted: 1,
          streakDays: 5,
          generatedAt: expect.any(Date),
        })
      );
    });

    it('calculates topSkills from content type counts', async () => {
      mocks.mockContentHistory = [
        { playerId: 1, contentId: 'lesson:abc', interactedAt: new Date() },
        { playerId: 1, contentId: 'lesson:123', interactedAt: new Date() },
        { playerId: 1, contentId: 'lesson:colors', interactedAt: new Date() },
        { playerId: 1, contentId: 'game:memory', interactedAt: new Date() },
      ];

      const { result } = renderHook(() => useWeeklyRecap(mocks.mockPlayerId));

      let recap: { topSkills: string[]; favoriteType: string } | null = null;
      await act(async () => {
        recap = await result.current.generateCurrentWeekRecap() as typeof recap;
      });

      expect(recap).toBeDefined();
      expect(recap!.topSkills[0]).toBe('lesson');
      expect(recap!.favoriteType).toBe('lesson');
    });

    it('defaults favoriteType to learning when no history', async () => {
      mocks.mockContentHistory = [];

      const { result } = renderHook(() => useWeeklyRecap(mocks.mockPlayerId));

      let recap: { favoriteType: string } | null = null;
      await act(async () => {
        recap = await result.current.generateCurrentWeekRecap() as typeof recap;
      });

      expect(recap).toBeDefined();
      expect(recap!.favoriteType).toBe('learning');
    });

    it('uses 0 for streakDays when profile has no streakDays', async () => {
      mocks.mockProfile = undefined;

      const { result } = renderHook(() => useWeeklyRecap(mocks.mockPlayerId));

      let recap: { streakDays: number } | null = null;
      await act(async () => {
        recap = await result.current.generateCurrentWeekRecap() as typeof recap;
      });

      expect(recap).toBeDefined();
      expect(recap!.streakDays).toBe(0);
    });

    it('includes weekKey in generated recap', async () => {
      const { result } = renderHook(() => useWeeklyRecap(mocks.mockPlayerId));

      let recap: { weekKey: string } | null = null;
      await act(async () => {
        recap = await result.current.generateCurrentWeekRecap() as typeof recap;
      });

      expect(recap).toBeDefined();
      expect(recap!.weekKey).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });
});
