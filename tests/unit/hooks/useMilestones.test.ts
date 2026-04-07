import { renderHook, act } from '@testing-library/react';
import { useMilestones } from '../../../src/hooks/useMilestones';

const mocks = vi.hoisted(() => ({
  mockPlayerId: 1 as number | undefined,
  mockProgressRecords: [] as any[],
  mockProfile: undefined as any,
  mockStoryProgressRecords: [] as any[],
  mockArtworkRecords: [] as any[],
  mockMovementRecords: [] as any[],
  mockLifeSkillsRecords: [] as any[],
  mockExplorerRecords: [] as any[],
  mockScrapbookEntries: [] as any[],
  mockDbScrapbookEntriesAdd: vi.fn(),
}));

vi.mock('../../../src/context/AppContext', () => ({
  useApp: () => ({
    currentPlayer: mocks.mockPlayerId ? { id: mocks.mockPlayerId } : null,
    showStarBurst: vi.fn(),
    showCelebration: vi.fn(),
    showBadgeToast: vi.fn(),
  }),
}));

let useLiveQueryCallIndex = 0;
vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: () => {
    const idx = useLiveQueryCallIndex++;
    // useMilestones calls useLiveQuery 8 times in order:
    // 0: progressRecords, 1: profile, 2: storyProgressRecords, 3: artworkRecords,
    // 4: movementRecords, 5: lifeSkillsRecords, 6: explorerRecords, 7: scrapbookEntries
    switch (idx % 8) {
      case 0: return mocks.mockProgressRecords;
      case 1: return mocks.mockProfile;
      case 2: return mocks.mockStoryProgressRecords;
      case 3: return mocks.mockArtworkRecords;
      case 4: return mocks.mockMovementRecords;
      case 5: return mocks.mockLifeSkillsRecords;
      case 6: return mocks.mockExplorerRecords;
      case 7: return mocks.mockScrapbookEntries;
      default: return [];
    }
  },
}));

vi.mock('../../../src/db/database', () => ({
  db: {
    progress: {
      where: vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue([]),
        }),
      }),
    },
    profiles: {
      get: vi.fn().mockResolvedValue(undefined),
    },
    storyProgress: {
      where: vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue([]),
        }),
      }),
    },
    artworks: {
      where: vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue([]),
        }),
      }),
    },
    movementProgress: {
      where: vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue([]),
        }),
      }),
    },
    lifeSkillsProgress: {
      where: vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue([]),
        }),
      }),
    },
    explorerProgress: {
      where: vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue([]),
        }),
      }),
    },
    scrapbookEntries: {
      where: vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue([]),
        }),
      }),
      add: mocks.mockDbScrapbookEntriesAdd,
    },
  },
}));

vi.mock('../../../src/data/milestoneData', () => ({
  milestones: [
    { id: 'first-10', title: 'First 10 Activities', emoji: 'star', description: 'Complete 10 activities', checkFn: 'checkFirst10' },
    { id: 'first-week', title: 'One Week Streak', emoji: 'fire', description: '7 day streak', checkFn: 'checkFirstWeek' },
    { id: 'alphabet-starter', title: 'Alphabet Explorer', emoji: 'abc', description: '10 letters', checkFn: 'checkAlphabetStarter' },
    { id: 'all-colors', title: 'Color Master', emoji: 'art', description: '10 colors', checkFn: 'checkAllColors' },
    { id: 'number-whiz', title: 'Number Whiz', emoji: 'numbers', description: '10 numbers', checkFn: 'checkNumberWhiz' },
    { id: 'shape-expert', title: 'Shape Expert', emoji: 'diamond', description: '8 shapes', checkFn: 'checkShapeExpert' },
    { id: 'dance-star', title: 'Dance Star', emoji: 'dance', description: '5 movement activities', checkFn: 'checkDanceStar' },
    { id: 'first-drawing', title: 'First Masterpiece', emoji: 'frame', description: 'First artwork', checkFn: 'checkFirstDrawing' },
    { id: 'story-lover', title: 'Story Lover', emoji: 'book', description: '5 stories', checkFn: 'checkStoryLover' },
    { id: 'quiz-champion', title: 'Quiz Champion', emoji: 'trophy', description: '100% on a quiz', checkFn: 'checkQuizChampion' },
    { id: 'explorer', title: 'World Explorer', emoji: 'globe', description: '3 explorer topics', checkFn: 'checkExplorer' },
    { id: 'social-butterfly', title: 'Kind Heart', emoji: 'heart', description: '5 life skills', checkFn: 'checkSocialButterfly' },
  ],
}));

describe('useMilestones', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useLiveQueryCallIndex = 0;
    mocks.mockPlayerId = 1;
    mocks.mockProgressRecords = [];
    mocks.mockProfile = undefined;
    mocks.mockStoryProgressRecords = [];
    mocks.mockArtworkRecords = [];
    mocks.mockMovementRecords = [];
    mocks.mockLifeSkillsRecords = [];
    mocks.mockExplorerRecords = [];
    mocks.mockScrapbookEntries = [];
  });

  it('returns empty earnedMilestones and newMilestones by default', () => {
    const { result } = renderHook(() => useMilestones(1));
    expect(result.current.earnedMilestones).toEqual([]);
    expect(result.current.newMilestones).toEqual([]);
  });

  it('detects checkFirst10 when progress records >= 10', () => {
    mocks.mockProgressRecords = Array.from({ length: 12 }, (_, i) => ({
      id: i + 1,
      playerId: 1,
      category: 'abc',
      itemKey: `item-${i}`,
      timesCompleted: 1,
      correctAnswers: 1,
      totalAttempts: 1,
    }));
    const { result } = renderHook(() => useMilestones(1));
    const firstTen = result.current.newMilestones.find((m) => m.id === 'first-10');
    expect(firstTen).toBeDefined();
  });

  it('detects checkFirstWeek when streakDays >= 7', () => {
    mocks.mockProfile = { id: 1, streakDays: 7 };
    const { result } = renderHook(() => useMilestones(1));
    const firstWeek = result.current.newMilestones.find((m) => m.id === 'first-week');
    expect(firstWeek).toBeDefined();
  });

  it('does not detect checkFirstWeek when streakDays < 7', () => {
    mocks.mockProfile = { id: 1, streakDays: 3 };
    const { result } = renderHook(() => useMilestones(1));
    const firstWeek = result.current.newMilestones.find((m) => m.id === 'first-week');
    expect(firstWeek).toBeUndefined();
  });

  it('detects checkAlphabetStarter when 10+ abc items completed', () => {
    mocks.mockProgressRecords = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      playerId: 1,
      category: 'abc',
      itemKey: String.fromCharCode(65 + i),
      timesCompleted: 1,
      correctAnswers: 1,
      totalAttempts: 1,
    }));
    const { result } = renderHook(() => useMilestones(1));
    expect(result.current.newMilestones.find((m) => m.id === 'alphabet-starter')).toBeDefined();
  });

  it('detects checkDanceStar when 5+ movements completed', () => {
    mocks.mockMovementRecords = Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      playerId: 1,
      activityId: `dance-${i}`,
      completed: true,
    }));
    const { result } = renderHook(() => useMilestones(1));
    expect(result.current.newMilestones.find((m) => m.id === 'dance-star')).toBeDefined();
  });

  it('detects checkFirstDrawing when artworks exist', () => {
    mocks.mockArtworkRecords = [
      { id: 1, playerId: 1, title: 'My Art', dataUrl: 'data:image/png;base64,abc' },
    ];
    const { result } = renderHook(() => useMilestones(1));
    expect(result.current.newMilestones.find((m) => m.id === 'first-drawing')).toBeDefined();
  });

  it('detects checkStoryLover when 5+ stories completed', () => {
    mocks.mockStoryProgressRecords = Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      playerId: 1,
      storyId: `story-${i}`,
      completed: true,
    }));
    const { result } = renderHook(() => useMilestones(1));
    expect(result.current.newMilestones.find((m) => m.id === 'story-lover')).toBeDefined();
  });

  it('detects checkQuizChampion when any quiz has 100% accuracy', () => {
    mocks.mockProgressRecords = [
      { id: 1, playerId: 1, category: 'quiz', itemKey: 'q1', timesCompleted: 1, correctAnswers: 5, totalAttempts: 5 },
    ];
    const { result } = renderHook(() => useMilestones(1));
    expect(result.current.newMilestones.find((m) => m.id === 'quiz-champion')).toBeDefined();
  });

  it('does not detect checkQuizChampion when no quiz has 100% accuracy', () => {
    mocks.mockProgressRecords = [
      { id: 1, playerId: 1, category: 'quiz', itemKey: 'q1', timesCompleted: 1, correctAnswers: 4, totalAttempts: 5 },
    ];
    const { result } = renderHook(() => useMilestones(1));
    expect(result.current.newMilestones.find((m) => m.id === 'quiz-champion')).toBeUndefined();
  });

  it('detects checkExplorer when 3+ explorer topics completed', () => {
    mocks.mockExplorerRecords = Array.from({ length: 3 }, (_, i) => ({
      id: i + 1,
      playerId: 1,
      topicId: `topic-${i}`,
      completed: true,
    }));
    const { result } = renderHook(() => useMilestones(1));
    expect(result.current.newMilestones.find((m) => m.id === 'explorer')).toBeDefined();
  });

  it('detects checkSocialButterfly when 5+ life skills completed', () => {
    mocks.mockLifeSkillsRecords = Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      playerId: 1,
      skillId: `skill-${i}`,
      completed: true,
    }));
    const { result } = renderHook(() => useMilestones(1));
    expect(result.current.newMilestones.find((m) => m.id === 'social-butterfly')).toBeDefined();
  });

  it('excludes already-earned milestones from newMilestones', () => {
    mocks.mockProgressRecords = Array.from({ length: 12 }, (_, i) => ({
      id: i + 1,
      playerId: 1,
      category: 'abc',
      itemKey: `item-${i}`,
      timesCompleted: 1,
      correctAnswers: 1,
      totalAttempts: 1,
    }));
    // first-10 already earned (in scrapbook)
    mocks.mockScrapbookEntries = [
      { id: 1, playerId: 1, entryType: 'milestone', title: 'First 10 Activities', emoji: 'star', createdAt: new Date() },
    ];
    const { result } = renderHook(() => useMilestones(1));
    expect(result.current.newMilestones.find((m) => m.id === 'first-10')).toBeUndefined();
    expect(result.current.earnedMilestones.find((m) => m.id === 'first-10')).toBeDefined();
  });

  it('earnedMilestones reflects scrapbook entries', () => {
    mocks.mockScrapbookEntries = [
      { id: 1, playerId: 1, entryType: 'milestone', title: 'First 10 Activities', emoji: 'star', createdAt: new Date() },
      { id: 2, playerId: 1, entryType: 'milestone', title: 'One Week Streak', emoji: 'fire', createdAt: new Date() },
      { id: 3, playerId: 1, entryType: 'artwork', title: 'My Art', emoji: 'frame', createdAt: new Date() }, // not a milestone
    ];
    const { result } = renderHook(() => useMilestones(1));
    expect(result.current.earnedMilestones).toHaveLength(2);
  });

  it('awardMilestone does nothing when playerId is undefined', async () => {
    mocks.mockPlayerId = undefined;
    const { result } = renderHook(() => useMilestones(undefined));
    await act(async () => {
      await result.current.awardMilestone('first-10');
    });
    expect(mocks.mockDbScrapbookEntriesAdd).not.toHaveBeenCalled();
  });

  it('awardMilestone does nothing for unknown milestone id', async () => {
    const { result } = renderHook(() => useMilestones(1));
    await act(async () => {
      await result.current.awardMilestone('nonexistent-id');
    });
    expect(mocks.mockDbScrapbookEntriesAdd).not.toHaveBeenCalled();
  });

  it('awardMilestone saves milestone to scrapbook', async () => {
    mocks.mockDbScrapbookEntriesAdd.mockResolvedValue(1);
    const { result } = renderHook(() => useMilestones(1));
    await act(async () => {
      await result.current.awardMilestone('first-10');
    });

    expect(mocks.mockDbScrapbookEntriesAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        playerId: 1,
        entryType: 'milestone',
        title: 'First 10 Activities',
        emoji: 'star',
        description: 'Complete 10 activities',
      })
    );
  });

  it('awardMilestone skips already-earned milestone', async () => {
    mocks.mockScrapbookEntries = [
      { id: 1, playerId: 1, entryType: 'milestone', title: 'First 10 Activities', emoji: 'star', createdAt: new Date() },
    ];
    const { result } = renderHook(() => useMilestones(1));
    await act(async () => {
      await result.current.awardMilestone('first-10');
    });

    expect(mocks.mockDbScrapbookEntriesAdd).not.toHaveBeenCalled();
  });
});
