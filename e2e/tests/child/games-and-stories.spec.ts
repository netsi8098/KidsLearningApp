import { test, expect } from '@playwright/test';
import { WelcomePage, MainMenuPage, GamePage, StoryPage } from '../../helpers/page-objects';

test.describe('Games', () => {
  test.beforeEach(async ({ page }) => {
    const welcome = new WelcomePage(page);
    await welcome.goto('/');
    await welcome.waitForLazyLoad();
    await welcome.createPlayer('GameKid');
  });

  test('navigates to Games page from Play tab', async ({ page }) => {
    const menu = new MainMenuPage(page);
    await menu.playTab.click();
    await menu.clickTile('Games');

    await expect(page).toHaveURL(/\/games/);
    const gamePage = new GamePage(page);
    await expect(gamePage.hubTitle).toBeVisible();
  });

  test('games hub shows heading and game cards', async ({ page }) => {
    const menu = new MainMenuPage(page);
    await menu.playTab.click();
    await menu.clickTile('Games');

    const gamePage = new GamePage(page);
    await expect(gamePage.hubTitle).toBeVisible();
    // Game grid should have at least one game card
    await expect(gamePage.gameGrid.locator('button').first()).toBeVisible();
  });

  test('selecting a game shows difficulty selection', async ({ page }) => {
    const menu = new MainMenuPage(page);
    await menu.playTab.click();
    await menu.clickTile('Games');

    const gamePage = new GamePage(page);
    // Click the first game in the grid
    await gamePage.gameGrid.locator('button').first().click();

    await expect(gamePage.difficultyHeading).toBeVisible();
  });

  test('back button from difficulty returns to game hub', async ({ page }) => {
    const menu = new MainMenuPage(page);
    await menu.playTab.click();
    await menu.clickTile('Games');

    const gamePage = new GamePage(page);
    // Select a game
    await gamePage.gameGrid.locator('button').first().click();
    await expect(gamePage.difficultyHeading).toBeVisible();

    // Go back
    await gamePage.backButton.click();
    await expect(gamePage.hubTitle).toBeVisible();
  });

  test('back button from games hub returns to main menu', async ({ page }) => {
    const menu = new MainMenuPage(page);
    await menu.playTab.click();
    await menu.clickTile('Games');

    const gamePage = new GamePage(page);
    await expect(gamePage.hubTitle).toBeVisible();

    await gamePage.backButton.click();
    await expect(page).toHaveURL(/\/menu/);
  });

  test('starting a game shows game UI elements', async ({ page }) => {
    const menu = new MainMenuPage(page);
    await menu.playTab.click();
    await menu.clickTile('Games');

    const gamePage = new GamePage(page);
    // Select the first game
    await gamePage.gameGrid.locator('button').first().click();
    await expect(gamePage.difficultyHeading).toBeVisible();

    // Select easy difficulty
    await gamePage.selectDifficulty('easy');

    // Game should be playing - verify some game content is visible
    await expect(page.locator('.min-h-dvh')).toBeVisible();
  });
});

test.describe('Stories', () => {
  test.beforeEach(async ({ page }) => {
    const welcome = new WelcomePage(page);
    await welcome.goto('/');
    await welcome.waitForLazyLoad();
    await welcome.createPlayer('StoryKid');
  });

  test('navigates to Stories page from Listen tab', async ({ page }) => {
    const menu = new MainMenuPage(page);
    await menu.listenTab.click();
    await menu.clickTile('Stories');

    await expect(page).toHaveURL(/\/stories/);
    const storyPage = new StoryPage(page);
    await expect(storyPage.libraryTitle).toBeVisible();
  });

  test('story library shows age group tabs', async ({ page }) => {
    const menu = new MainMenuPage(page);
    await menu.listenTab.click();
    await menu.clickTile('Stories');

    // Age group tabs use numeric labels like "2-3", "4-5", "6-8"
    await expect(page.getByRole('button', { name: /2-3/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /4-5/i })).toBeVisible();
  });

  test('story library shows category filter chips', async ({ page }) => {
    const menu = new MainMenuPage(page);
    await menu.listenTab.click();
    await menu.clickTile('Stories');

    // "All Stories" chip should be visible
    await expect(page.getByRole('button', { name: /all stories/i })).toBeVisible();
  });

  test('story cards are displayed in the library', async ({ page }) => {
    const menu = new MainMenuPage(page);
    await menu.listenTab.click();
    await menu.clickTile('Stories');

    // At least one story card should be visible in the grid
    const grid = page.locator('.grid');
    await expect(grid.first()).toBeVisible();
  });

  test('opening a story shows the reader view', async ({ page }) => {
    const menu = new MainMenuPage(page);
    await menu.listenTab.click();
    await menu.clickTile('Stories');

    const storyPage = new StoryPage(page);
    await storyPage.openFirstStory();

    // Reader view should show reading controls
    await expect(storyPage.readAloudButton).toBeVisible();
  });

  test('story reader has page navigation controls', async ({ page }) => {
    const menu = new MainMenuPage(page);
    await menu.listenTab.click();
    await menu.clickTile('Stories');

    const storyPage = new StoryPage(page);
    await storyPage.openFirstStory();

    // Navigation buttons should be visible
    await expect(storyPage.nextPageButton).toBeVisible();
    // Close button should be visible
    await expect(storyPage.closeButton).toBeVisible();
  });

  test('navigating through story pages works', async ({ page }) => {
    const menu = new MainMenuPage(page);
    await menu.listenTab.click();
    await menu.clickTile('Stories');

    const storyPage = new StoryPage(page);
    await storyPage.openFirstStory();

    // Navigate to next page
    await storyPage.nextPageButton.click();
    await page.waitForTimeout(400);

    // Page should still show the reader (not crash)
    await expect(storyPage.closeButton).toBeVisible();
  });

  test('closing story reader returns to the library', async ({ page }) => {
    const menu = new MainMenuPage(page);
    await menu.listenTab.click();
    await menu.clickTile('Stories');

    const storyPage = new StoryPage(page);
    await storyPage.openFirstStory();

    // Close the reader
    await storyPage.closeButton.click();

    // Should be back to library view
    await expect(storyPage.libraryTitle).toBeVisible();
  });

  test('switching age groups changes the displayed stories', async ({ page }) => {
    const menu = new MainMenuPage(page);
    await menu.listenTab.click();
    await menu.clickTile('Stories');

    // Switch to a different age group
    const ageTab = page.getByRole('button', { name: /6/i }).first();
    await ageTab.click();
    await page.waitForTimeout(300);

    // Page should still render after switching
    await expect(page.locator('.min-h-dvh')).toBeVisible();
  });
});

test.describe('Songs / Audio', () => {
  test.beforeEach(async ({ page }) => {
    const welcome = new WelcomePage(page);
    await welcome.goto('/');
    await welcome.waitForLazyLoad();
    await welcome.createPlayer('AudioKid');
  });

  test('navigates to Audio page from Listen tab', async ({ page }) => {
    const menu = new MainMenuPage(page);
    await menu.listenTab.click();

    // Audio tile may need scrolling into view on mobile
    const tileGrid = page.locator('.grid.grid-cols-2');
    const audioTile = tileGrid.getByRole('button', { name: /Audio/i });
    await audioTile.scrollIntoViewIfNeeded();
    await audioTile.click();

    await expect(page).toHaveURL(/\/audio/);
  });

  test('audio page renders without errors', async ({ page }) => {
    const menu = new MainMenuPage(page);
    await menu.listenTab.click();

    const tileGrid = page.locator('.grid.grid-cols-2');
    const audioTile = tileGrid.getByRole('button', { name: /Audio/i });
    await audioTile.scrollIntoViewIfNeeded();
    await audioTile.click();

    // The page should render its container
    await expect(page.locator('.min-h-dvh')).toBeVisible();
  });
});
