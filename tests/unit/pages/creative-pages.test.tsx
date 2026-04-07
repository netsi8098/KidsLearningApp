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

// Mock useArtwork hook (used by ColoringPage)
vi.mock('../../../src/hooks/useArtwork', () => ({
  useArtwork: () => ({
    artworks: [],
    saveArtwork: vi.fn(),
    deleteArtwork: vi.fn(),
  }),
}));

// Mock useCooking hook (used by CookingPage)
vi.mock('../../../src/hooks/useCooking', () => ({
  useCooking: () => ({
    allProgress: [],
    startRecipe: vi.fn(),
    advanceStep: vi.fn(),
    completeRecipe: vi.fn(),
    toggleFavorite: vi.fn(),
    isFavorite: vi.fn(() => false),
    getRecipeProgress: vi.fn(() => undefined),
  }),
}));

// Mock useMovement hook (used by MovementPage)
vi.mock('../../../src/hooks/useMovement', () => ({
  useMovement: () => ({
    allProgress: [],
    markCompleted: vi.fn(),
    isCompleted: vi.fn(() => false),
    toggleFavorite: vi.fn(),
    isFavorite: vi.fn(() => false),
    getActivityProgress: vi.fn(() => undefined),
  }),
}));

// Mock useHomeActivities hook (used by HomeActivitiesPage)
vi.mock('../../../src/hooks/useHomeActivities', () => ({
  useHomeActivities: () => ({
    allProgress: [],
    markCompleted: vi.fn(),
    toggleFavorite: vi.fn(),
    isCompleted: vi.fn(() => false),
    isFavorite: vi.fn(() => false),
    getRandomActivity: vi.fn(() => undefined),
  }),
}));

// Mock useScrapbook hook (used by ScrapbookPage)
vi.mock('../../../src/hooks/useScrapbook', () => ({
  useScrapbook: () => ({
    entries: [],
    addEntry: vi.fn(),
    deleteEntry: vi.fn(),
  }),
}));

// Mock useMilestones hook (used by ScrapbookPage)
vi.mock('../../../src/hooks/useMilestones', () => ({
  useMilestones: () => ({
    earnedMilestones: [],
    newMilestones: [],
    awardMilestone: vi.fn(),
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

import ColoringPage from '../../../src/pages/ColoringPage';
import CookingPage from '../../../src/pages/CookingPage';
import MovementPage from '../../../src/pages/MovementPage';
import PrintablesPage from '../../../src/pages/PrintablesPage';
import HomeActivitiesPage from '../../../src/pages/HomeActivitiesPage';
import ScrapbookPage from '../../../src/pages/ScrapbookPage';

// ── Smoke tests ──────────────────────────────────────────────────────

describe('ColoringPage', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <ColoringPage />
      </MemoryRouter>
    );
    expect(document.body).toBeTruthy();
  });
});

describe('CookingPage', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <CookingPage />
      </MemoryRouter>
    );
    expect(document.body).toBeTruthy();
  });
});

describe('MovementPage', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <MovementPage />
      </MemoryRouter>
    );
    expect(document.body).toBeTruthy();
  });
});

describe('PrintablesPage', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <PrintablesPage />
      </MemoryRouter>
    );
    expect(document.body).toBeTruthy();
  });
});

describe('HomeActivitiesPage', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <HomeActivitiesPage />
      </MemoryRouter>
    );
    expect(document.body).toBeTruthy();
  });
});

describe('ScrapbookPage', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <ScrapbookPage />
      </MemoryRouter>
    );
    expect(document.body).toBeTruthy();
  });
});
