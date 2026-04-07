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
    setBedtimeMode: vi.fn(),
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

// Mock useMoodCheckIn hook (used by EmotionsPage)
vi.mock('../../../src/hooks/useMoodCheckIn', () => ({
  useMoodCheckIn: () => ({
    recentMoods: [],
    todayMood: undefined,
    checkIn: vi.fn(),
  }),
}));

// Mock useLifeSkills hook (used by EmotionsPage)
vi.mock('../../../src/hooks/useLifeSkills', () => ({
  useLifeSkills: () => ({
    completedSkills: [],
    isSkillCompleted: vi.fn(() => false),
    markSkillCompleted: vi.fn(),
    getCompletedCount: vi.fn(() => 0),
  }),
}));

// Mock useBedtimeMode hook (used by BedtimePage)
vi.mock('../../../src/hooks/useBedtimeMode', () => ({
  useBedtimeMode: () => ({
    isBedtime: false,
    toggleBedtime: vi.fn(),
  }),
}));

// Mock useBedtimeSession hook (used by BedtimePage)
vi.mock('../../../src/hooks/useBedtimeSession', () => ({
  useBedtimeSession: () => ({
    tonightSession: undefined,
    startSession: vi.fn(),
    addActivity: vi.fn(),
    endSession: vi.fn(),
  }),
}));

// Mock useAssessment hook (used by AssessmentPage)
vi.mock('../../../src/hooks/useAssessment', () => ({
  useAssessment: () => ({
    isActive: false,
    currentQuestion: undefined,
    currentIndex: 0,
    totalQuestions: 24,
    answerQuestion: vi.fn(),
    startAssessment: vi.fn(),
    getResults: vi.fn(() => []),
    saveResults: vi.fn(),
    isComplete: false,
  }),
}));

// Mock useExplorer hook (used by ExplorerPage)
vi.mock('../../../src/hooks/useExplorer', () => ({
  useExplorer: () => ({
    allProgress: [],
    readFact: vi.fn(),
    completeQuiz: vi.fn(),
    isTopicCompleted: vi.fn(() => false),
    getTopicProgress: vi.fn(() => undefined),
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

// ── Import pages directly ────────────────────────────────────────────

import EmotionsPage from '../../../src/pages/EmotionsPage';
import BedtimePage from '../../../src/pages/BedtimePage';
import AssessmentPage from '../../../src/pages/AssessmentPage';
import ExplorerPage from '../../../src/pages/ExplorerPage';

// ── Smoke tests ──────────────────────────────────────────────────────

describe('EmotionsPage', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <EmotionsPage />
      </MemoryRouter>
    );
    expect(document.body).toBeTruthy();
  });
});

describe('BedtimePage', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <BedtimePage />
      </MemoryRouter>
    );
    expect(document.body).toBeTruthy();
  });
});

describe('AssessmentPage', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <AssessmentPage />
      </MemoryRouter>
    );
    expect(document.body).toBeTruthy();
  });
});

describe('ExplorerPage', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <ExplorerPage />
      </MemoryRouter>
    );
    expect(document.body).toBeTruthy();
  });
});
