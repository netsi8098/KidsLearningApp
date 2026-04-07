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

// Mock useProfiles hook (used by SettingsPage)
vi.mock('../../../src/hooks/useProfile', () => ({
  useProfiles: () => ({
    profiles: [],
    createProfile: vi.fn(),
    deleteProfile: vi.fn(),
    updateProfile: vi.fn(),
    addStars: vi.fn(),
  }),
}));

// Mock useOfflinePacks hook (used by SettingsPage)
vi.mock('../../../src/hooks/useOfflinePacks', () => ({
  useOfflinePacks: () => ({
    packStates: new Map(),
    downloadPack: vi.fn(),
    deletePack: vi.fn(),
  }),
}));

// Mock useSubscription hook (used by BillingPage)
vi.mock('../../../src/hooks/useSubscription', () => ({
  useSubscription: () => ({
    plan: 'free',
    status: 'active',
    trialDaysLeft: 0,
    isPremium: false,
    isTrialing: false,
    subscription: undefined,
  }),
}));

// Mock useParentTips hook (used by ParentTipsPage)
vi.mock('../../../src/hooks/useParentTips', () => ({
  useParentTips: () => ({
    tips: [],
    filteredTips: [],
    savedTipIds: new Set(),
    toggleSaved: vi.fn(),
    filterByCategory: vi.fn(),
    activeCategory: 'all',
  }),
}));

// Mock useHelpArticles hook (used by HelpCenterPage)
vi.mock('../../../src/hooks/useHelpArticles', () => ({
  useHelpArticles: () => ({
    articles: [],
    filteredArticles: [],
    searchQuery: '',
    setSearchQuery: vi.fn(),
    activeCategory: null,
    setActiveCategory: vi.fn(),
    getArticlesByCategory: vi.fn(() => []),
    submitFeedback: vi.fn(),
  }),
}));

// Mock usePrivacy hook (used by PrivacySettingsPage)
vi.mock('../../../src/hooks/usePrivacy', () => ({
  usePrivacy: () => ({
    consents: [],
    updateConsent: vi.fn(),
    requestExport: vi.fn(),
    requestDeletion: vi.fn(),
    pendingRequests: [],
  }),
}));

// Mock useInbox hook (used by InboxPage)
vi.mock('../../../src/hooks/useInbox', () => ({
  useInbox: () => ({
    messages: [],
    unreadCount: 0,
    markRead: vi.fn(),
    markAllRead: vi.fn(),
  }),
}));

// Mock useDeepLink hook (used by InboxPage)
vi.mock('../../../src/hooks/useDeepLink', () => ({
  useDeepLink: () => ({
    resolveDeepLink: vi.fn(() => '/menu'),
  }),
}));

// ── Import pages directly ────────────────────────────────────────────

import ParentDashboard from '../../../src/pages/ParentDashboard';
import SettingsPage from '../../../src/pages/SettingsPage';
import BillingPage from '../../../src/pages/BillingPage';
import ParentTipsPage from '../../../src/pages/ParentTipsPage';
import HelpCenterPage from '../../../src/pages/HelpCenterPage';
import PrivacySettingsPage from '../../../src/pages/PrivacySettingsPage';
import InboxPage from '../../../src/pages/InboxPage';

// ── Smoke tests ──────────────────────────────────────────────────────

describe('ParentDashboardPage', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <ParentDashboard />
      </MemoryRouter>
    );
    expect(document.body).toBeTruthy();
  });
});

describe('SettingsPage', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    );
    expect(document.body).toBeTruthy();
  });
});

describe('BillingPage', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <BillingPage />
      </MemoryRouter>
    );
    expect(document.body).toBeTruthy();
  });
});

describe('ParentTipsPage', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <ParentTipsPage />
      </MemoryRouter>
    );
    expect(document.body).toBeTruthy();
  });
});

describe('HelpCenterPage', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <HelpCenterPage />
      </MemoryRouter>
    );
    expect(document.body).toBeTruthy();
  });
});

describe('PrivacySettingsPage', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <PrivacySettingsPage />
      </MemoryRouter>
    );
    expect(document.body).toBeTruthy();
  });
});

describe('InboxPage', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <InboxPage />
      </MemoryRouter>
    );
    expect(document.body).toBeTruthy();
  });
});
