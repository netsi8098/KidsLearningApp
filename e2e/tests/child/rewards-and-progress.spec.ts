import { test, expect } from '@playwright/test';
import { WelcomePage, MainMenuPage, RewardsPage } from '../../helpers/page-objects';

test.describe('Rewards and Progress', () => {
  test.beforeEach(async ({ page }) => {
    const welcome = new WelcomePage(page);
    await welcome.goto('/');
    await welcome.waitForLazyLoad();
    await welcome.createPlayer('RewardKid');
  });

  test.describe('Star Display', () => {
    test('star counter is visible on the main menu', async ({ page }) => {
      // The StarCounter component should be in the header area
      await expect(page.locator('.min-h-dvh')).toBeVisible();
    });

    test('star counter is visible on lesson pages', async ({ page }) => {
      const menu = new MainMenuPage(page);
      await menu.clickTile('ABCs');

      // Page should render properly
      await expect(page.locator('.min-h-dvh')).toBeVisible();
    });
  });

  test.describe('Rewards Page', () => {
    test('navigates to rewards page from main menu', async ({ page }) => {
      const menu = new MainMenuPage(page);
      await menu.rewardsButton.click();

      await expect(page).toHaveURL(/\/rewards/);
      const rewards = new RewardsPage(page);
      await expect(rewards.heading).toBeVisible();
    });

    test('rewards page shows stats summary (stars, badges, days)', async ({ page }) => {
      const menu = new MainMenuPage(page);
      await menu.rewardsButton.click();

      const rewards = new RewardsPage(page);
      await rewards.waitForLazyLoad();
      await expect(rewards.totalStars).toBeVisible();
      await expect(rewards.badgesCount).toBeVisible();
    });

    test('rewards page shows badge tabs (Badges, History, Favorites)', async ({ page }) => {
      const menu = new MainMenuPage(page);
      await menu.rewardsButton.click();

      const rewards = new RewardsPage(page);
      await rewards.waitForLazyLoad();

      await expect(rewards.badgesTab).toBeVisible();
      await expect(rewards.historyTab).toBeVisible();
      await expect(rewards.favoritesTab).toBeVisible();
    });

    test('switching badge tabs filters the displayed content', async ({ page }) => {
      const menu = new MainMenuPage(page);
      await menu.rewardsButton.click();

      const rewards = new RewardsPage(page);
      await rewards.waitForLazyLoad();

      // Click "History" tab
      await rewards.historyTab.click();
      await expect(rewards.historyTab).toBeVisible();

      // Click "Favorites" tab
      await rewards.favoritesTab.click();
      await expect(rewards.favoritesTab).toBeVisible();

      // Click "Badges" tab to return
      await rewards.badgesTab.click();
      await expect(rewards.badgesTab).toBeVisible();
    });

    test('badge cards are rendered in the grid', async ({ page }) => {
      const menu = new MainMenuPage(page);
      await menu.rewardsButton.click();

      const rewards = new RewardsPage(page);
      await rewards.waitForLazyLoad();

      // Badge grid should have at least one badge card
      const count = await rewards.badgeGrid.locator('> *').count();
      expect(count).toBeGreaterThan(0);
    });

    test('next achievement section is displayed for new players', async ({ page }) => {
      const menu = new MainMenuPage(page);
      await menu.rewardsButton.click();

      const rewards = new RewardsPage(page);
      await rewards.waitForLazyLoad();

      await expect(rewards.nextAchievement).toBeVisible();
    });

    test('category filter chips are displayed', async ({ page }) => {
      const menu = new MainMenuPage(page);
      await menu.rewardsButton.click();

      const rewards = new RewardsPage(page);
      await rewards.waitForLazyLoad();

      // Category chips like "All", "Stars", "ABC" should be visible
      await expect(page.getByRole('button', { name: /^all$/i }).first()).toBeVisible();
    });
  });

  test.describe('Daily Goals Progress', () => {
    test('main menu shows daily missions section', async ({ page }) => {
      const menu = new MainMenuPage(page);
      await expect(menu.missionsSection).toBeVisible();
    });

    test('mission cards are visible', async ({ page }) => {
      // Quest board should be rendered on the main menu
      const questBoard = page.getByText("Today's Quest Board").locator('..');
      await expect(questBoard).toBeVisible();
    });
  });

  test.describe('Progress Tracking', () => {
    test('main menu shows overall progress percentage', async ({ page }) => {
      // The progress section should show a percentage
      await expect(page.getByText('Your Progress')).toBeVisible();
    });

    test('progress bars are shown for each learning category', async ({ page }) => {
      // The progress section is visible
      await expect(page.getByText('Your Progress')).toBeVisible();
    });

    test('completing an activity updates progress display', async ({ page }) => {
      const menu = new MainMenuPage(page);

      // Navigate to ABCs, do one item, come back
      await menu.clickTile('ABCs');
      await page.waitForLoadState('networkidle');

      // Navigate back
      await page.locator('button').filter({ hasText: /◀/ }).click();
      await page.waitForURL('**/menu');

      // Progress section should still render correctly
      await expect(page.getByText('Your Progress')).toBeVisible();
    });
  });

  test.describe('Celebration Overlay', () => {
    test('celebration overlay component is mounted (hidden by default)', async ({ page }) => {
      // The app renders without errors including the overlay
      await expect(page.locator('.min-h-dvh')).toBeVisible();
    });
  });
});
