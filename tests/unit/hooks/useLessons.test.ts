import { renderHook, act } from '@testing-library/react';
import { useLessons } from '../../../src/hooks/useLessons';

const mocks = vi.hoisted(() => ({
  mockPlayerId: 1 as number | undefined,
  mockProgress: [] as {
    id?: number;
    playerId: number;
    lessonId: string;
    completed: boolean;
    score: number;
    attempts: number;
    stepsCompleted: number;
    totalSteps: number;
    startedAt: Date;
    completedAt?: Date;
  }[],
  mockLessonProgressWhere: vi.fn(),
  mockLessonProgressAdd: vi.fn(),
  mockLessonProgressUpdate: vi.fn(),
  mockStarsAdd: vi.fn(),
  mockAddStars: vi.fn(),
  mockShowStarBurst: vi.fn(),
  mockShowCelebration: vi.fn(),
  mockGetLessonsByAge: vi.fn(),
  mockGetLessonById: vi.fn(),
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
    lessonProgress: {
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          toArray: vi.fn(() => Promise.resolve(mocks.mockProgress)),
          first: vi.fn(() => {
            // Return the first matching record from mockProgress
            const args = mocks.mockLessonProgressWhere.mock.calls;
            return Promise.resolve(mocks.mockProgress[0] || undefined);
          }),
        })),
      })),
      add: mocks.mockLessonProgressAdd,
      update: mocks.mockLessonProgressUpdate,
    },
    stars: {
      add: mocks.mockStarsAdd,
    },
  },
}));

vi.mock('../../../src/data/lessonsData', () => ({
  getLessonsByAge: (...args: unknown[]) => mocks.mockGetLessonsByAge(...args),
  getLessonById: (...args: unknown[]) => mocks.mockGetLessonById(...args),
}));

const makeMockLesson = (overrides = {}) => ({
  id: 'l-2-abc-1',
  title: 'Meet Letter A',
  emoji: 'A',
  topic: 'alphabet',
  ageGroup: '2-3' as const,
  description: 'Learn letter A',
  steps: [
    { type: 'intro', title: 'Hello', content: 'Intro content' },
    { type: 'quiz', title: 'Quiz', content: 'Quiz content', question: 'Q?', options: ['A', 'B'], correctAnswer: 'A' },
  ],
  order: 1,
  ...overrides,
});

describe('useLessons', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mockPlayerId = 1;
    mocks.mockProgress = [];
    mocks.mockLessonProgressAdd.mockResolvedValue(1);
    mocks.mockGetLessonById.mockReturnValue(makeMockLesson());
    mocks.mockGetLessonsByAge.mockReturnValue([]);
  });

  describe('allProgress', () => {
    it('returns empty array when no progress exists', () => {
      const { result } = renderHook(() => useLessons(1));
      expect(result.current.allProgress).toEqual([]);
    });

    it('returns progress records from live query', () => {
      mocks.mockProgress = [
        { id: 1, playerId: 1, lessonId: 'l-2-abc-1', completed: true, score: 1, attempts: 1, stepsCompleted: 2, totalSteps: 2, startedAt: new Date() },
      ];
      const { result } = renderHook(() => useLessons(1));
      expect(result.current.allProgress).toHaveLength(1);
      expect(result.current.allProgress[0].lessonId).toBe('l-2-abc-1');
    });
  });

  describe('getProgressForLesson', () => {
    it('returns undefined when no progress for lesson', () => {
      const { result } = renderHook(() => useLessons(1));
      expect(result.current.getProgressForLesson('nonexistent')).toBeUndefined();
    });

    it('returns matching progress record', () => {
      mocks.mockProgress = [
        { id: 1, playerId: 1, lessonId: 'l-2-abc-1', completed: false, score: 0, attempts: 1, stepsCompleted: 1, totalSteps: 4, startedAt: new Date() },
      ];
      const { result } = renderHook(() => useLessons(1));
      const progress = result.current.getProgressForLesson('l-2-abc-1');
      expect(progress).toBeDefined();
      expect(progress!.lessonId).toBe('l-2-abc-1');
    });
  });

  describe('isLessonUnlocked', () => {
    it('returns true for lesson with no prerequisite', () => {
      const { result } = renderHook(() => useLessons(1));
      const lesson = makeMockLesson();
      expect(result.current.isLessonUnlocked(lesson)).toBe(true);
    });

    it('returns false when prerequisite is not completed', () => {
      const { result } = renderHook(() => useLessons(1));
      const lesson = makeMockLesson({ id: 'l-2-abc-2', prerequisiteId: 'l-2-abc-1' });
      expect(result.current.isLessonUnlocked(lesson)).toBe(false);
    });

    it('returns true when prerequisite is completed', () => {
      mocks.mockProgress = [
        { id: 1, playerId: 1, lessonId: 'l-2-abc-1', completed: true, score: 1, attempts: 1, stepsCompleted: 4, totalSteps: 4, startedAt: new Date() },
      ];
      const { result } = renderHook(() => useLessons(1));
      const lesson = makeMockLesson({ id: 'l-2-abc-2', prerequisiteId: 'l-2-abc-1' });
      expect(result.current.isLessonUnlocked(lesson)).toBe(true);
    });

    it('returns false when prerequisite exists but not completed', () => {
      mocks.mockProgress = [
        { id: 1, playerId: 1, lessonId: 'l-2-abc-1', completed: false, score: 0, attempts: 1, stepsCompleted: 1, totalSteps: 4, startedAt: new Date() },
      ];
      const { result } = renderHook(() => useLessons(1));
      const lesson = makeMockLesson({ id: 'l-2-abc-2', prerequisiteId: 'l-2-abc-1' });
      expect(result.current.isLessonUnlocked(lesson)).toBe(false);
    });
  });

  describe('startLesson', () => {
    it('throws error when no player is selected', async () => {
      const { result } = renderHook(() => useLessons(undefined));
      const lesson = makeMockLesson();

      await expect(
        act(async () => {
          await result.current.startLesson(lesson);
        })
      ).rejects.toThrow('No player selected');
    });

    it('creates new progress record for fresh lesson', async () => {
      const { result } = renderHook(() => useLessons(1));
      const lesson = makeMockLesson();

      await act(async () => {
        await result.current.startLesson(lesson);
      });

      expect(mocks.mockLessonProgressAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          playerId: 1,
          lessonId: 'l-2-abc-1',
          completed: false,
          score: 0,
          attempts: 1,
          stepsCompleted: 0,
          totalSteps: 2,
          startedAt: expect.any(Date),
        })
      );
    });
  });

  describe('completeLesson', () => {
    it('does nothing when no player is set', async () => {
      const { result } = renderHook(() => useLessons(undefined));

      await act(async () => {
        await result.current.completeLesson('l-2-abc-1', 1, 1);
      });

      expect(mocks.mockStarsAdd).not.toHaveBeenCalled();
    });

    it('awards 2 stars for perfect quiz score', async () => {
      mocks.mockProgress = [
        { id: 1, playerId: 1, lessonId: 'l-2-abc-1', completed: false, score: 0, attempts: 1, stepsCompleted: 1, totalSteps: 2, startedAt: new Date() },
      ];
      const { result } = renderHook(() => useLessons(1));

      await act(async () => {
        await result.current.completeLesson('l-2-abc-1', 3, 3);
      });

      expect(mocks.mockStarsAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          playerId: 1,
          category: 'lessons',
          starsEarned: 2,
        })
      );
      expect(mocks.mockAddStars).toHaveBeenCalledWith(1, 2);
      expect(mocks.mockShowStarBurst).toHaveBeenCalled();
      expect(mocks.mockShowCelebration).toHaveBeenCalled();
    });

    it('awards 1 star for non-perfect quiz score', async () => {
      mocks.mockProgress = [
        { id: 1, playerId: 1, lessonId: 'l-2-abc-1', completed: false, score: 0, attempts: 1, stepsCompleted: 1, totalSteps: 2, startedAt: new Date() },
      ];
      const { result } = renderHook(() => useLessons(1));

      await act(async () => {
        await result.current.completeLesson('l-2-abc-1', 2, 3);
      });

      expect(mocks.mockStarsAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          starsEarned: 1,
        })
      );
      expect(mocks.mockAddStars).toHaveBeenCalledWith(1, 1);
    });

    it('awards 1 star when no quiz questions', async () => {
      mocks.mockProgress = [
        { id: 1, playerId: 1, lessonId: 'l-2-abc-1', completed: false, score: 0, attempts: 1, stepsCompleted: 1, totalSteps: 2, startedAt: new Date() },
      ];
      const { result } = renderHook(() => useLessons(1));

      await act(async () => {
        await result.current.completeLesson('l-2-abc-1', 0, 0);
      });

      expect(mocks.mockStarsAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          starsEarned: 1,
        })
      );
    });
  });

  describe('getRecommendedLesson', () => {
    it('returns undefined when all lessons are completed', () => {
      mocks.mockGetLessonsByAge.mockReturnValue([makeMockLesson()]);
      mocks.mockProgress = [
        { id: 1, playerId: 1, lessonId: 'l-2-abc-1', completed: true, score: 1, attempts: 1, stepsCompleted: 2, totalSteps: 2, startedAt: new Date() },
      ];

      const { result } = renderHook(() => useLessons(1));
      expect(result.current.getRecommendedLesson('2-3')).toBeUndefined();
    });

    it('returns first incomplete unlocked lesson', () => {
      const lessonA = makeMockLesson();
      const lessonB = makeMockLesson({ id: 'l-2-abc-2', prerequisiteId: 'l-2-abc-1', order: 2 });
      mocks.mockGetLessonsByAge.mockReturnValue([lessonA, lessonB]);

      const { result } = renderHook(() => useLessons(1));
      const recommended = result.current.getRecommendedLesson('2-3');
      expect(recommended).toBeDefined();
      expect(recommended!.id).toBe('l-2-abc-1');
    });

    it('returns undefined when no lessons available', () => {
      mocks.mockGetLessonsByAge.mockReturnValue([]);

      const { result } = renderHook(() => useLessons(1));
      expect(result.current.getRecommendedLesson('2-3')).toBeUndefined();
    });
  });

  describe('updateStepProgress', () => {
    it('does nothing when no player is set', async () => {
      const { result } = renderHook(() => useLessons(undefined));

      await act(async () => {
        await result.current.updateStepProgress('l-2-abc-1', 2);
      });

      expect(mocks.mockLessonProgressUpdate).not.toHaveBeenCalled();
    });
  });
});
