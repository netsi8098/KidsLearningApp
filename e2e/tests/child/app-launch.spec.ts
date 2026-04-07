import { test, expect } from '@playwright/test';
import { WelcomePage, MainMenuPage } from '../../helpers/page-objects';

test.describe('App Launch', () => {
  test('loads the welcome page successfully', async ({ page }) => {
    const welcome = new WelcomePage(page);
    await welcome.goto('/');
    await welcome.waitForLazyLoad();

    await expect(welcome.title).toBeVisible();
    await expect(welcome.subtitle).toBeVisible();
  });

  test('shows the "New Player" button on first visit', async ({ page }) => {
    const welcome = new WelcomePage(page);
    await welcome.goto('/');
    await welcome.waitForLazyLoad();

    await expect(welcome.createPlayerButton).toBeVisible();
  });

  test('creates a new player and reaches the main menu', async ({ page }) => {
    const welcome = new WelcomePage(page);
    await welcome.goto('/');
    await welcome.waitForLazyLoad();

    await welcome.createPlayer('E2EKid');
    await expect(page).toHaveURL(/\/menu/);
  });
});

test.describe('Main Menu - Tabs and Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Create a player first so we can access the main menu
    const welcome = new WelcomePage(page);
    await welcome.goto('/');
    await welcome.waitForLazyLoad();
    await welcome.createPlayer('TabTestKid');
  });

  test('all 6 main tabs are visible', async ({ page }) => {
    const menu = new MainMenuPage(page);

    await expect(menu.learnTab).toBeVisible();
    await expect(menu.playTab).toBeVisible();
    await expect(menu.createTab).toBeVisible();
    await expect(menu.listenTab).toBeVisible();
    await expect(menu.wellbeingTab).toBeVisible();
    await expect(menu.exploreTab).toBeVisible();
  });

  test('Learn tab is active by default and shows learning tiles', async ({ page }) => {
    // The Learn tab should be active by default, showing ABCs, Numbers, etc.
    await expect(page.getByRole('button', { name: /ABCs/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Numbers/i })).toBeVisible();
  });

  test('switching to Play tab shows game tiles', async ({ page }) => {
    const menu = new MainMenuPage(page);
    await menu.playTab.click();

    // Scope to tile grid to avoid matching quest board items
    const tileGrid = page.locator('.grid.grid-cols-2');
    await expect(tileGrid.getByRole('button', { name: /Quiz/i })).toBeVisible();
    await expect(tileGrid.getByRole('button', { name: /Matching/i })).toBeVisible();
    await expect(tileGrid.getByRole('button', { name: /Games/i })).toBeVisible();
  });

  test('switching to Create tab shows creative tiles', async ({ page }) => {
    const menu = new MainMenuPage(page);
    await menu.createTab.click();

    await expect(page.getByRole('button', { name: /Coloring/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Printables/i })).toBeVisible();
  });

  test('switching to Listen tab shows media tiles', async ({ page }) => {
    const menu = new MainMenuPage(page);
    await menu.listenTab.click();

    await expect(page.getByRole('button', { name: /Videos/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Stories/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Audio/i })).toBeVisible();
  });

  test('switching to Wellbeing tab shows wellbeing tiles', async ({ page }) => {
    const menu = new MainMenuPage(page);
    await menu.wellbeingTab.click();

    // Scope to tile grid to avoid matching quest board items
    const tileGrid = page.locator('.grid.grid-cols-2');
    await expect(tileGrid.getByRole('button', { name: /Emotions/i })).toBeVisible();
    await expect(tileGrid.getByRole('button', { name: /Bedtime/i })).toBeVisible();
  });

  test('switching to Explore tab shows explore tiles', async ({ page }) => {
    const menu = new MainMenuPage(page);
    await menu.exploreTab.click();

    // Scope to tile grid to avoid matching quest board items
    const tileGrid = page.locator('.grid.grid-cols-2');
    await expect(tileGrid.getByRole('button', { name: /Home Fun/i })).toBeVisible();
    await expect(tileGrid.getByRole('button', { name: /Discover/i })).toBeVisible();
  });

  test('daily missions section is visible', async ({ page }) => {
    const menu = new MainMenuPage(page);
    await expect(menu.missionsSection).toBeVisible();
  });

  test('progress section is visible', async ({ page }) => {
    const menu = new MainMenuPage(page);
    await expect(menu.progressSection).toBeVisible();
  });

  test('bottom buttons (Rewards, Scrapbook, Settings, Parents) are visible', async ({ page }) => {
    const menu = new MainMenuPage(page);

    await expect(menu.rewardsButton).toBeVisible();
    await expect(menu.scrapbookButton).toBeVisible();
    await expect(menu.settingsButton).toBeVisible();
    await expect(menu.parentsButton).toBeVisible();
  });

  test('navigating to a page and back works without blank screens', async ({ page }) => {
    const menu = new MainMenuPage(page);

    // Navigate to ABCs
    await menu.clickTile('ABCs');
    await expect(page).toHaveURL(/\/abc/);
    await expect(page.getByText('ABCs')).toBeVisible();

    // Navigate back to menu
    await page.locator('button').filter({ hasText: /◀/ }).click();
    await expect(page).toHaveURL(/\/menu/);

    // Verify the menu rendered properly (no blank screen)
    await expect(menu.learnTab).toBeVisible();
  });

  test('page transitions render content without blank flashes', async ({ page }) => {
    // Navigate to a lesson page and back to verify no blank screen on return
    const menu = new MainMenuPage(page);

    await menu.clickTile('ABCs');
    await expect(page).toHaveURL(/\/abc/);
    await expect(page.locator('.min-h-dvh')).toBeVisible();

    // Navigate back
    await page.locator('button').filter({ hasText: /◀/ }).click();
    await expect(page).toHaveURL(/\/menu/);

    // Menu should render fully (no blank flash)
    await expect(menu.learnTab).toBeVisible();
    await expect(page.locator('.min-h-dvh')).toBeVisible();
  });
});
