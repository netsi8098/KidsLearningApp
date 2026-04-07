import { renderHook, act } from '@testing-library/react';
import { useExplorer } from '../../../src/hooks/useExplorer';

const mocks = vi.hoisted(() => ({
  mockPlayerId: 1 as number | undefined,
  mockProgress: [] as {
    id?: number;
    playerId: number;
    topicId: string;
    factsRead: number;
    totalFacts: number;
    quizScore?: number;
    completed: boolean;
    lastExploredAt: Date;
  }[],
  mockExplorerProgressAdd: vi.fn(),
  mockExplorerProgressUpdate: vi.fn(),
  mockExplorerProgressFirst: vi.fn(),
  mockStarsAdd: vi.fn(),
  mockAddStars: vi.fn(),
  mockShowStarBurst: vi.fn(),
  mockShowCelebration: vi.fn(),
  mockExplorerTopics: [
    {
      id: 'animals-world-1',
      title: 'World Animals',
      emoji: 'Lion',
      category: 'animals-world',
      ageGroup: '4-5',
      facts: [
        { text: 'Lions live in Africa', emoji: 'Lion' },
        { text: 'Elephants are big', emoji: 'Elephant' },
        { text: 'Giraffes are tall', emoji: 'Giraffe' },
      ],
      quizQuestions: [
        { question: 'Where do lions live?', options: ['Africa', 'Asia'], correct: 'Africa' },
      ],
      relatedTopicIds: ['ocean-1'],
    },
    {
      id: 'space-1',
      title: 'Outer Space',
      emoji: 'Rocket',
      category: 'space',
      ageGroup: '6-8',
      facts: [
        { text: 'The sun is a star', emoji: 'Sun' },
        { text: 'Mars is red', emoji: 'Mars' },
      ],
      quizQuestions: [],
      relatedTopicIds: [],
    },
  ],
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
    explorerProgress: {
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          toArray: vi.fn(() => Promise.resolve(mocks.mockProgress)),
          first: mocks.mockExplorerProgressFirst,
        })),
      })),
      add: mocks.mockExplorerProgressAdd,
      update: mocks.mockExplorerProgressUpdate,
    },
    stars: {
      add: mocks.mockStarsAdd,
    },
  },
}));

vi.mock('../../../src/data/worldExplorerData', () => ({
  explorerTopics: mocks.mockExplorerTopics,
}));

describe('useExplorer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mockPlayerId = 1;
    mocks.mockProgress = [];
    mocks.mockExplorerProgressFirst.mockResolvedValue(undefined);
    mocks.mockExplorerProgressAdd.mockResolvedValue(1);
  });

  describe('allProgress', () => {
    it('returns empty array when no progress exists', () => {
      const { result } = renderHook(() => useExplorer(1));
      expect(result.current.allProgress).toEqual([]);
    });

    it('returns progress records from live query', () => {
      mocks.mockProgress = [
        { id: 1, playerId: 1, topicId: 'animals-world-1', factsRead: 2, totalFacts: 3, completed: false, lastExploredAt: new Date() },
      ];
      const { result } = renderHook(() => useExplorer(1));
      expect(result.current.allProgress).toHaveLength(1);
    });
  });

  describe('readFact', () => {
    it('does nothing when no player is set', async () => {
      const { result } = renderHook(() => useExplorer(undefined));

      await act(async () => {
        await result.current.readFact('animals-world-1', 0);
      });

      expect(mocks.mockExplorerProgressAdd).not.toHaveBeenCalled();
      expect(mocks.mockExplorerProgressUpdate).not.toHaveBeenCalled();
    });

    it('does nothing when topic is not found', async () => {
      const { result } = renderHook(() => useExplorer(1));

      await act(async () => {
        await result.current.readFact('nonexistent-topic', 0);
      });

      expect(mocks.mockExplorerProgressAdd).not.toHaveBeenCalled();
    });

    it('creates new progress record for first fact read', async () => {
      mocks.mockExplorerProgressFirst.mockResolvedValue(undefined);
      const { result } = renderHook(() => useExplorer(1));

      await act(async () => {
        await result.current.readFact('animals-world-1', 0);
      });

      expect(mocks.mockExplorerProgressAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          playerId: 1,
          topicId: 'animals-world-1',
          factsRead: 1,
          totalFacts: 3,
          completed: false,
          lastExploredAt: expect.any(Date),
        })
      );
    });

    it('updates existing record with higher factsRead', async () => {
      mocks.mockExplorerProgressFirst.mockResolvedValue({
        id: 5,
        playerId: 1,
        topicId: 'animals-world-1',
        factsRead: 1,
        totalFacts: 3,
        completed: false,
        lastExploredAt: new Date(),
      });

      const { result } = renderHook(() => useExplorer(1));

      await act(async () => {
        await result.current.readFact('animals-world-1', 2);
      });

      expect(mocks.mockExplorerProgressUpdate).toHaveBeenCalledWith(5, expect.objectContaining({
        factsRead: 3,
        lastExploredAt: expect.any(Date),
      }));
    });

    it('does not decrease factsRead for earlier fact index', async () => {
      mocks.mockExplorerProgressFirst.mockResolvedValue({
        id: 5,
        playerId: 1,
        topicId: 'animals-world-1',
        factsRead: 3,
        totalFacts: 3,
        completed: false,
        lastExploredAt: new Date(),
      });

      const { result } = renderHook(() => useExplorer(1));

      await act(async () => {
        await result.current.readFact('animals-world-1', 0);
      });

      // factsRead should stay at 3, not decrease to 1
      expect(mocks.mockExplorerProgressUpdate).toHaveBeenCalledWith(5, expect.objectContaining({
        factsRead: 3,
      }));
    });
  });

  describe('completeQuiz', () => {
    it('does nothing when no player is set', async () => {
      const { result } = renderHook(() => useExplorer(undefined));

      await act(async () => {
        await result.current.completeQuiz('animals-world-1', 1);
      });

      expect(mocks.mockExplorerProgressAdd).not.toHaveBeenCalled();
      expect(mocks.mockStarsAdd).not.toHaveBeenCalled();
    });

    it('does nothing when topic is not found', async () => {
      const { result } = renderHook(() => useExplorer(1));

      await act(async () => {
        await result.current.completeQuiz('nonexistent-topic', 1);
      });

      expect(mocks.mockExplorerProgressAdd).not.toHaveBeenCalled();
    });

    it('creates new completed record and awards star on first completion', async () => {
      mocks.mockExplorerProgressFirst.mockResolvedValue(undefined);
      const { result } = renderHook(() => useExplorer(1));

      await act(async () => {
        await result.current.completeQuiz('animals-world-1', 1);
      });

      expect(mocks.mockExplorerProgressAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          playerId: 1,
          topicId: 'animals-world-1',
          factsRead: 3,
          totalFacts: 3,
          quizScore: 1,
          completed: true,
          lastExploredAt: expect.any(Date),
        })
      );

      expect(mocks.mockStarsAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          playerId: 1,
          category: 'explorer',
          starsEarned: 1,
          reason: 'Completed explorer topic: World Animals',
        })
      );
      expect(mocks.mockAddStars).toHaveBeenCalledWith(1, 1);
      expect(mocks.mockShowStarBurst).toHaveBeenCalled();
      expect(mocks.mockShowCelebration).toHaveBeenCalled();
    });

    it('updates existing record and awards star on first completion', async () => {
      mocks.mockExplorerProgressFirst.mockResolvedValue({
        id: 5,
        playerId: 1,
        topicId: 'animals-world-1',
        factsRead: 2,
        totalFacts: 3,
        completed: false,
        lastExploredAt: new Date(),
      });

      const { result } = renderHook(() => useExplorer(1));

      await act(async () => {
        await result.current.completeQuiz('animals-world-1', 1);
      });

      expect(mocks.mockExplorerProgressUpdate).toHaveBeenCalledWith(5, expect.objectContaining({
        quizScore: 1,
        completed: true,
      }));
      expect(mocks.mockStarsAdd).toHaveBeenCalled();
    });

    it('does not award star on repeat completion', async () => {
      mocks.mockExplorerProgressFirst.mockResolvedValue({
        id: 5,
        playerId: 1,
        topicId: 'animals-world-1',
        factsRead: 3,
        totalFacts: 3,
        quizScore: 1,
        completed: true,
        lastExploredAt: new Date(),
      });

      const { result } = renderHook(() => useExplorer(1));

      await act(async () => {
        await result.current.completeQuiz('animals-world-1', 1);
      });

      expect(mocks.mockExplorerProgressUpdate).toHaveBeenCalled();
      expect(mocks.mockStarsAdd).not.toHaveBeenCalled();
      expect(mocks.mockShowStarBurst).not.toHaveBeenCalled();
    });
  });

  describe('isTopicCompleted', () => {
    it('returns false when no record exists', () => {
      const { result } = renderHook(() => useExplorer(1));
      expect(result.current.isTopicCompleted('animals-world-1')).toBe(false);
    });

    it('returns true when topic is completed', () => {
      mocks.mockProgress = [
        { id: 1, playerId: 1, topicId: 'animals-world-1', factsRead: 3, totalFacts: 3, quizScore: 1, completed: true, lastExploredAt: new Date() },
      ];
      const { result } = renderHook(() => useExplorer(1));
      expect(result.current.isTopicCompleted('animals-world-1')).toBe(true);
    });

    it('returns false when topic is not completed', () => {
      mocks.mockProgress = [
        { id: 1, playerId: 1, topicId: 'animals-world-1', factsRead: 2, totalFacts: 3, completed: false, lastExploredAt: new Date() },
      ];
      const { result } = renderHook(() => useExplorer(1));
      expect(result.current.isTopicCompleted('animals-world-1')).toBe(false);
    });
  });

  describe('getTopicProgress', () => {
    it('returns undefined when no record exists', () => {
      const { result } = renderHook(() => useExplorer(1));
      expect(result.current.getTopicProgress('animals-world-1')).toBeUndefined();
    });

    it('returns matching progress record', () => {
      mocks.mockProgress = [
        { id: 1, playerId: 1, topicId: 'animals-world-1', factsRead: 2, totalFacts: 3, completed: false, lastExploredAt: new Date() },
        { id: 2, playerId: 1, topicId: 'space-1', factsRead: 1, totalFacts: 2, completed: false, lastExploredAt: new Date() },
      ];
      const { result } = renderHook(() => useExplorer(1));
      const progress = result.current.getTopicProgress('animals-world-1');
      expect(progress).toBeDefined();
      expect(progress!.topicId).toBe('animals-world-1');
      expect(progress!.factsRead).toBe(2);
    });

    it('returns correct topic when multiple exist', () => {
      mocks.mockProgress = [
        { id: 1, playerId: 1, topicId: 'animals-world-1', factsRead: 2, totalFacts: 3, completed: false, lastExploredAt: new Date() },
        { id: 2, playerId: 1, topicId: 'space-1', factsRead: 1, totalFacts: 2, completed: false, lastExploredAt: new Date() },
      ];
      const { result } = renderHook(() => useExplorer(1));
      const progress = result.current.getTopicProgress('space-1');
      expect(progress).toBeDefined();
      expect(progress!.topicId).toBe('space-1');
    });
  });

  describe('return shape', () => {
    it('returns all expected properties', () => {
      const { result } = renderHook(() => useExplorer(1));
      expect(result.current).toHaveProperty('allProgress');
      expect(result.current).toHaveProperty('readFact');
      expect(result.current).toHaveProperty('completeQuiz');
      expect(result.current).toHaveProperty('isTopicCompleted');
      expect(result.current).toHaveProperty('getTopicProgress');
    });

    it('returns exactly 5 properties', () => {
      const { result } = renderHook(() => useExplorer(1));
      expect(Object.keys(result.current)).toHaveLength(5);
    });
  });
});
