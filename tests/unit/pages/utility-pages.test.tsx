import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';

// ── Mock ALL hooks and contexts at module level ──────────────────────

vi.mock('../../../src/context/AppContext', () => ({
  useApp: () => ({
    currentPlayer: { id: 1, name: 'Test', age: 4, avatar: '🦁', avatarEmoji: '🦁', color: '#FF6B6B', totalStars: 10 },
    setCurrentPlayer: vi.fn(),
    showStarBurst: vi.fn(),
    showCelebration: vi.fn(),
    showBadgeToast: vi.fn(),
    bedtimeMode: false,
    setBedtimeMode: vi.fn(),
    soundEnabled: true,
    setSoundEnabled: vi.fn(),
    speechEnabled: true,
    setSpeechEnabled: vi.fn(),
    activeCharacter: 'leo',
    setActiveCharacter: vi.fn(),
    timeMode: 'learning',
    setTimeMode: vi.fn(),
  }),
}));

vi.mock('../../../src/context/AccessibilityContext', () => ({
  useAccessibility: () => ({
    reducedMotion: false,
    largerText: false,
    highContrast: false,
    toggleReducedMotion: vi.fn(),
    toggleLargerText: vi.fn(),
    toggleHighContrast: vi.fn(),
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
          filter: vi.fn(() => ({
            toArray: vi.fn(() => Promise.resolve([])),
            reverse: vi.fn(() => ({ sortBy: vi.fn(() => Promise.resolve([])) })),
          })),
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

// Mock useProfiles hook (used by WelcomePage, OnboardingPage)
vi.mock('../../../src/hooks/useProfile', () => ({
  useProfiles: () => ({
    profiles: [],
    createProfile: vi.fn(() => Promise.resolve({ id: 1, name: 'Test', avatarEmoji: '🦁', totalStars: 0, streakDays: 0 })),
    deleteProfile: vi.fn(),
    updateProfile: vi.fn(),
    addStars: vi.fn(),
  }),
}));

// Mock useProgress hook (used by MainMenu, RewardsPage)
vi.mock('../../../src/hooks/useProgress', () => ({
  useProgress: () => ({
    recordActivity: vi.fn(),
    progress: [],
    starRecords: [],
    getProgressForCategory: vi.fn(() => []),
    getItemsLearnedCount: vi.fn(() => 0),
    getTotalCorrect: vi.fn(() => 0),
  }),
}));

// Mock useDailyMissions hook (used by MainMenu)
vi.mock('../../../src/hooks/useDailyMissions', () => ({
  useDailyMissions: () => ({
    missions: [],
    completeMission: vi.fn(),
    refreshMissions: vi.fn(),
    isLoading: false,
    allComplete: false,
  }),
}));

// Mock useCharacter hook (used by MainMenu)
vi.mock('../../../src/hooks/useCharacter', () => ({
  useCharacter: () => ({
    character: {
      id: 'leo',
      name: 'Leo',
      emoji: '🦁',
      color: '#FF8C42',
      greetings: ['Hello!'],
      encouragements: ['Great job!'],
      celebrations: ['Amazing!'],
    },
    getContextMessage: vi.fn(() => 'Hello, friend!'),
  }),
}));

// Mock useSeasonalContent hook (used by MainMenu)
vi.mock('../../../src/hooks/useSeasonalContent', () => ({
  useSeasonalContent: () => ({
    activeTheme: {
      id: 'default',
      name: 'Default',
      emoji: '📚',
      color: '#4ECDC4',
      bannerMessage: 'Keep learning!',
      featuredContentIds: [],
      specialActivities: [],
    },
    bannerMessage: 'Keep learning!',
    seasonEmoji: '📚',
    seasonColor: '#4ECDC4',
  }),
}));

// Mock useNudges hook (used by MainMenu)
vi.mock('../../../src/hooks/useNudges', () => ({
  useNudges: () => ({
    nudges: [],
    dismissNudge: vi.fn(),
  }),
}));

// Mock useRecommendations hook (used by DiscoveryPage)
vi.mock('../../../src/hooks/useRecommendations', () => ({
  useRecommendations: () => ({
    recommendations: [],
    isLoading: false,
  }),
}));

// Mock useBadges hook (used by RewardsPage)
vi.mock('../../../src/hooks/useBadges', () => ({
  useBadges: () => ({
    earnedBadges: [],
    earnedBadgeIds: new Set(),
    checkAndAwardBadges: vi.fn(),
    checkAndAwardExtendedBadges: vi.fn(),
    badgeData: [],
    extendedBadges: [],
    getBadgeProgressList: vi.fn(() => []),
    getNextBadge: vi.fn(() => null),
    getDaysOfLearning: vi.fn(() => 0),
    totalStars: 0,
  }),
}));

// Mock useRediscovery hook (used by RewardsPage)
vi.mock('../../../src/hooks/useRediscovery', () => ({
  useRediscovery: () => ({
    recentlyPlayed: [],
    continueWhereLeftOff: [],
    playAgain: [],
    favorites: [],
    favoriteIds: new Set(),
    toggleUniversalFavorite: vi.fn(),
    logContentInteraction: vi.fn(),
  }),
}));

// Mock useRoutines hook (used by RoutinePlannerPage)
vi.mock('../../../src/hooks/useRoutines', () => ({
  useRoutines: () => ({
    routines: [],
    createRoutine: vi.fn(),
    updateRoutine: vi.fn(),
    deleteRoutine: vi.fn(),
    templates: [],
    createFromTemplate: vi.fn(),
  }),
}));

// Mock registry modules used by various pages
vi.mock('../../../src/registry/collectionsConfig', () => ({
  collections: [],
}));

vi.mock('../../../src/registry/playlistsConfig', () => ({
  playlists: [],
}));

vi.mock('../../../src/registry/releaseConfig', () => ({
  getContentByBadge: vi.fn(() => []),
}));

vi.mock('../../../src/registry/contentRegistry', () => ({
  resolveContentIds: vi.fn(() => []),
  contentRegistry: [],
  getContentItem: vi.fn(() => undefined),
}));

vi.mock('../../../src/registry/rewardConfig', () => ({
  extendedBadges: [],
}));

// ── Import pages directly ────────────────────────────────────────────

import WelcomePage from '../../../src/pages/WelcomePage';
import OnboardingPage from '../../../src/pages/OnboardingPage';
import MainMenu from '../../../src/pages/MainMenu';
import DiscoveryPage from '../../../src/pages/DiscoveryPage';
import RewardsPage from '../../../src/pages/RewardsPage';
import RoutinePlannerPage from '../../../src/pages/RoutinePlannerPage';
import CollectionsPage from '../../../src/pages/CollectionsPage';

// ── Smoke tests ──────────────────────────────────────────────────────

describe('WelcomePage', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <WelcomePage />
      </MemoryRouter>
    );
    expect(document.body).toBeTruthy();
  });
});

describe('OnboardingPage', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <OnboardingPage />
      </MemoryRouter>
    );
    expect(document.body).toBeTruthy();
  });
});

describe('MainMenu', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <MainMenu />
      </MemoryRouter>
    );
    expect(document.body).toBeTruthy();
  });
});

describe('DiscoveryPage', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <DiscoveryPage />
      </MemoryRouter>
    );
    expect(document.body).toBeTruthy();
  });
});

describe('RewardsPage', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <RewardsPage />
      </MemoryRouter>
    );
    expect(document.body).toBeTruthy();
  });
});

describe('RoutinePlannerPage', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <RoutinePlannerPage />
      </MemoryRouter>
    );
    expect(document.body).toBeTruthy();
  });
});

describe('CollectionsPage', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <CollectionsPage />
      </MemoryRouter>
    );
    expect(document.body).toBeTruthy();
  });
});
