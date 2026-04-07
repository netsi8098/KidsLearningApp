import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';

// ── Mock ALL hooks and contexts at module level ──────────────────────

vi.mock('../../../src/context/AppContext', () => ({
  useApp: () => ({
    currentPlayer: { id: 1, name: 'Test', age: 4, avatar: '🦁', avatarEmoji: '🦁', color: '#FF6B6B', totalStars: 10 },
    showStarBurst: vi.fn(),
    showCelebration: vi.fn(),
    showBadgeToast: vi.fn(),
    bedtimeMode: false,
    soundEnabled: true,
    speechEnabled: true,
    activeCharacter: 'leo',
    timeMode: 'learning',
    setTimeMode: vi.fn(),
  }),
}));

vi.mock('../../../src/context/AccessibilityContext', () => ({
  useAccessibility: () => ({
    reducedMotion: false,
    largerText: false,
    highContrast: false,
  }),
}));

vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: () => [],
}));

vi.mock('../../../src/db/database', () => ({
  db: new Proxy({}, {
    get: () => ({
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          toArray: vi.fn(() => Promise.resolve([])),
          first: vi.fn(() => Promise.resolve(undefined)),
          count: vi.fn(() => Promise.resolve(0)),
          filter: vi.fn(() => ({ toArray: vi.fn(() => Promise.resolve([])) })),
          last: vi.fn(() => Promise.resolve(undefined)),
          reverse: vi.fn(() => ({ sortBy: vi.fn(() => Promise.resolve([])) })),
          sortBy: vi.fn(() => Promise.resolve([])),
        })),
      })),
      add: vi.fn(() => Promise.resolve(1)),
      update: vi.fn(),
      delete: vi.fn(),
      get: vi.fn(() => Promise.resolve(undefined)),
      toArray: vi.fn(() => Promise.resolve([])),
      count: vi.fn(() => Promise.resolve(0)),
    }),
  }),
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: (_target: any, prop: string) => {
      return ({ initial, animate, exit, transition, whileHover, whileTap, whileInView, variants, layout, layoutId, onAnimationComplete, drag, dragConstraints, dragElastic, ...rest }: any) => {
        const Tag = prop as any;
        return <Tag {...rest} />;
      };
    },
  }),
  AnimatePresence: ({ children }: any) => <>{children}</>,
  useAnimation: () => ({ start: vi.fn() }),
  useInView: () => true,
  useMotionValue: () => ({ set: vi.fn(), get: () => 0 }),
  useTransform: () => ({ set: vi.fn(), get: () => 0 }),
  useSpring: () => ({ set: vi.fn(), get: () => 0 }),
}));

// Mock useAudio hook
vi.mock('../../../src/hooks/useAudio', () => ({
  useAudio: () => ({
    playSound: vi.fn(),
    playCelebration: vi.fn(),
    playCorrect: vi.fn(),
    playWrong: vi.fn(),
    playTryAgain: vi.fn(),
    playClick: vi.fn(),
    speak: vi.fn(),
  }),
}));

// Mock useProgress hook
vi.mock('../../../src/hooks/useProgress', () => ({
  useProgress: () => ({
    recordActivity: vi.fn(),
    progress: [],
    starRecords: [],
    getProgressForCategory: vi.fn(() => []),
  }),
}));

// Mock useBadges hook
vi.mock('../../../src/hooks/useBadges', () => ({
  useBadges: () => ({
    checkAndAwardBadges: vi.fn(),
    earnedBadges: [],
    allBadgeProgress: [],
  }),
}));

// Mock useVideos hook
vi.mock('../../../src/hooks/useVideos', () => ({
  useVideos: () => ({
    favoriteIds: new Set(),
    toggleFavorite: vi.fn(),
    addToHistory: vi.fn(),
    getRecentHistory: vi.fn(() => []),
  }),
}));

// Mock useMediaQueue hook
vi.mock('../../../src/hooks/useMediaQueue', () => ({
  useMediaQueue: () => ({
    queue: [],
    addToQueue: vi.fn(),
    removeFromQueue: vi.fn(),
    clearQueue: vi.fn(),
    reorderQueue: vi.fn(),
  }),
}));

// Mock useAudioPlayer hook
vi.mock('../../../src/hooks/useAudioPlayer', () => ({
  useAudioPlayer: () => ({
    isPlaying: false,
    currentEpisode: null,
    playEpisode: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    playbackSpeed: 1,
    setSpeed: vi.fn(),
    sleepTimerMinutes: null,
    setSleepTimer: vi.fn(),
    markComplete: vi.fn(),
  }),
}));

// Mock useLessons hook
vi.mock('../../../src/hooks/useLessons', () => ({
  useLessons: () => ({
    allProgress: [],
    getProgressForLesson: vi.fn(() => undefined),
    isLessonUnlocked: vi.fn(() => true),
    completeStep: vi.fn(),
    completeLesson: vi.fn(),
    getLessonsProgress: vi.fn(() => ({})),
  }),
}));

// Mock useSwipe hook
vi.mock('../../../src/hooks/useSwipe', () => ({
  useSwipe: () => ({
    onTouchStart: vi.fn(),
    onTouchEnd: vi.fn(),
  }),
}));

// ── Import pages directly ────────────────────────────────────────────

import StoriesPage from '../../../src/pages/StoriesPage';
import GamesPage from '../../../src/pages/GamesPage';
import VideosPage from '../../../src/pages/VideosPage';
import AudioPage from '../../../src/pages/AudioPage';
import LessonsPage from '../../../src/pages/LessonsPage';
import QuizPage from '../../../src/pages/QuizPage';

// ── Smoke tests ──────────────────────────────────────────────────────

describe('StoriesPage', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <StoriesPage />
      </MemoryRouter>
    );
    expect(document.body).toBeTruthy();
  });
});

describe('GamesPage', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <GamesPage />
      </MemoryRouter>
    );
    expect(document.body).toBeTruthy();
  });
});

describe('VideosPage', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <VideosPage />
      </MemoryRouter>
    );
    expect(document.body).toBeTruthy();
  });
});

describe('AudioPage', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <AudioPage />
      </MemoryRouter>
    );
    expect(document.body).toBeTruthy();
  });
});

describe('LessonsPage', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <LessonsPage />
      </MemoryRouter>
    );
    expect(document.body).toBeTruthy();
  });
});

describe('QuizPage', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <QuizPage />
      </MemoryRouter>
    );
    expect(document.body).toBeTruthy();
  });
});
