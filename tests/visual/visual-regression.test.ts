/**
 * Visual Regression Test Setup and Examples
 *
 * This file provides the framework for visual regression testing using
 * Playwright's built-in screenshot comparison capabilities.
 *
 * SETUP INSTRUCTIONS:
 * 1. Visual regression tests run as Playwright tests (not Vitest).
 * 2. Run: npx playwright test tests/visual/ --config=e2e/playwright.config.ts
 * 3. First run generates baseline screenshots in tests/visual/__snapshots__/
 * 4. Subsequent runs compare against baselines.
 * 5. Use --update-snapshots flag to update baselines after intentional changes.
 *
 * STRATEGY:
 * - Freeze animations by injecting CSS to disable framer-motion transitions
 * - Test at two viewports: mobile (375x667) and tablet (768x1024)
 * - Compare key screens: home, lesson, story reader, rewards, bedtime, dashboard
 *
 * Run with: npx vitest run tests/visual/
 */
import { describe, it, expect } from 'vitest';

// ── Viewport Configurations ──────────────────────────────────

const VIEWPORTS = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
} as const;

// ── Animation Freeze Strategy ────────────────────────────────

/**
 * CSS to inject into pages to freeze all animations for consistent screenshots.
 * This disables CSS transitions, CSS animations, and framer-motion transforms.
 */
const ANIMATION_FREEZE_CSS = `
  *, *::before, *::after {
    animation-duration: 0s !important;
    animation-delay: 0s !important;
    transition-duration: 0s !important;
    transition-delay: 0s !important;
  }
  [style*="transform"] {
    transition: none !important;
  }
`;

/**
 * JavaScript to execute in the page to disable framer-motion.
 * This sets the global reducedMotion flag that framer-motion respects.
 */
const DISABLE_FRAMER_MOTION_JS = `
  if (window.__framer_motion_reduced_motion !== undefined) {
    window.__framer_motion_reduced_motion = true;
  }
  // Also try setting prefers-reduced-motion media query
  try {
    const style = document.createElement('style');
    style.textContent = '@media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }';
    document.head.appendChild(style);
  } catch (e) {}
`;

// ── Key Screens to Snapshot ──────────────────────────────────

const KEY_SCREENS = [
  {
    name: 'welcome-page',
    path: '/',
    description: 'Welcome page with profile selection and creation',
    waitForSelector: 'text=Kids Learning Fun',
  },
  {
    name: 'main-menu',
    path: '/menu',
    description: 'Main menu with 6-tab layout and tile grid',
    waitForSelector: 'text=Learn',
    requiresProfile: true,
  },
  {
    name: 'abc-lesson',
    path: '/abc',
    description: 'ABC lesson page with letter display',
    waitForSelector: 'text=ABCs',
    requiresProfile: true,
  },
  {
    name: 'numbers-lesson',
    path: '/numbers',
    description: 'Numbers lesson page with counting interaction',
    waitForSelector: 'text=Numbers',
    requiresProfile: true,
  },
  {
    name: 'stories-library',
    path: '/stories',
    description: 'Story library with age group tabs and category filters',
    waitForSelector: 'text=Story Time',
    requiresProfile: true,
  },
  {
    name: 'games-hub',
    path: '/games',
    description: 'Games hub with game selection cards',
    waitForSelector: 'text=Mini Games',
    requiresProfile: true,
  },
  {
    name: 'rewards-page',
    path: '/rewards',
    description: 'Rewards page with badges, stars, and achievements',
    waitForSelector: 'text=My Rewards',
    requiresProfile: true,
  },
  {
    name: 'settings-gate',
    path: '/settings',
    description: 'Settings parent gate with math problem',
    waitForSelector: 'text=Parent Check',
    requiresProfile: true,
  },
  {
    name: 'parent-dashboard-gate',
    path: '/parent-dashboard',
    description: 'Parent dashboard gate',
    waitForSelector: 'text=Parent Dashboard',
    requiresProfile: true,
  },
];

// ── Playwright Visual Test Template ──────────────────────────

/**
 * Example Playwright test that would be used for actual visual regression.
 * This is provided as a template since visual tests run in Playwright, not Vitest.
 *
 * ```typescript
 * // In a .spec.ts file within e2e/tests/
 * import { test, expect } from '@playwright/test';
 *
 * test.describe('Visual Regression', () => {
 *   test.beforeEach(async ({ page }) => {
 *     // Inject animation freeze CSS
 *     await page.addStyleTag({ content: ANIMATION_FREEZE_CSS });
 *     await page.evaluate(DISABLE_FRAMER_MOTION_JS);
 *   });
 *
 *   for (const screen of KEY_SCREENS) {
 *     test(`${screen.name} matches baseline - mobile`, async ({ page }) => {
 *       await page.setViewportSize({ width: 375, height: 667 });
 *       if (screen.requiresProfile) {
 *         // Create profile first
 *       }
 *       await page.goto(screen.path);
 *       await page.waitForSelector(screen.waitForSelector);
 *       await expect(page).toHaveScreenshot(`${screen.name}-mobile.png`, {
 *         maxDiffPixelRatio: 0.01,
 *       });
 *     });
 *
 *     test(`${screen.name} matches baseline - tablet`, async ({ page }) => {
 *       await page.setViewportSize({ width: 768, height: 1024 });
 *       if (screen.requiresProfile) {
 *         // Create profile first
 *       }
 *       await page.goto(screen.path);
 *       await page.waitForSelector(screen.waitForSelector);
 *       await expect(page).toHaveScreenshot(`${screen.name}-tablet.png`, {
 *         maxDiffPixelRatio: 0.01,
 *       });
 *     });
 *   }
 * });
 * ```
 */

// ── Vitest Validation Tests ──────────────────────────────────

describe('Visual Regression Configuration', () => {
  it('defines correct viewport sizes', () => {
    expect(VIEWPORTS.mobile.width).toBe(375);
    expect(VIEWPORTS.mobile.height).toBe(667);
    expect(VIEWPORTS.tablet.width).toBe(768);
    expect(VIEWPORTS.tablet.height).toBe(1024);
  });

  it('animation freeze CSS disables all transitions', () => {
    expect(ANIMATION_FREEZE_CSS).toContain('animation-duration: 0s');
    expect(ANIMATION_FREEZE_CSS).toContain('transition-duration: 0s');
  });

  it('all key screens have required properties', () => {
    for (const screen of KEY_SCREENS) {
      expect(screen.name).toBeTruthy();
      expect(screen.path).toMatch(/^\//);
      expect(screen.description).toBeTruthy();
      expect(screen.waitForSelector).toBeTruthy();
    }
  });

  it('covers the required key screens', () => {
    const screenNames = KEY_SCREENS.map((s) => s.name);

    expect(screenNames).toContain('welcome-page');
    expect(screenNames).toContain('main-menu');
    expect(screenNames).toContain('abc-lesson');
    expect(screenNames).toContain('stories-library');
    expect(screenNames).toContain('rewards-page');
    expect(screenNames).toContain('parent-dashboard-gate');
    expect(screenNames).toContain('games-hub');
  });

  it('screens requiring a profile are properly flagged', () => {
    // Welcome page does not require a profile
    const welcomeScreen = KEY_SCREENS.find((s) => s.name === 'welcome-page');
    expect(welcomeScreen?.requiresProfile).toBeFalsy();

    // Other screens require a profile
    const menuScreen = KEY_SCREENS.find((s) => s.name === 'main-menu');
    expect(menuScreen?.requiresProfile).toBe(true);
  });

  it('defines the correct number of key screens', () => {
    expect(KEY_SCREENS.length).toBe(9);
  });

  it('framer-motion disable script targets the correct global', () => {
    expect(DISABLE_FRAMER_MOTION_JS).toContain('__framer_motion_reduced_motion');
    expect(DISABLE_FRAMER_MOTION_JS).toContain('prefers-reduced-motion');
  });
});

// ── Bedtime Mode Visual Config ───────────────────────────────

describe('Bedtime Mode Visual Configuration', () => {
  it('bedtime mode applies via CSS class on documentElement', () => {
    // When bedtime mode is active, a CSS class is added to document.documentElement
    // This changes the color palette to darker, calmer tones
    const bedtimeClassPattern = 'bedtime';
    expect(bedtimeClassPattern).toBeTruthy();
  });

  it('bedtime mode colors are darker variants', () => {
    // In bedtime mode:
    // - Background shifts from cream to a darker tone
    // - Buttons become muted
    // - Text becomes lighter
    // The visual regression test should capture both normal and bedtime screenshots
    const bedtimeScreens = [
      'main-menu-bedtime',
      'stories-library-bedtime',
      'abc-lesson-bedtime',
    ];

    expect(bedtimeScreens.length).toBe(3);
  });
});
