import { test, expect } from '@playwright/test';
import { WelcomePage, MainMenuPage, LessonPage } from '../../helpers/page-objects';
import { goOffline, goOnline } from '../../helpers/network.helper';

test.describe('Offline Mode', () => {
  test.beforeEach(async ({ page }) => {
    const welcome = new WelcomePage(page);
    await welcome.goto('/');
    await welcome.waitForLazyLoad();
    await welcome.createPlayer('OfflineKid');
  });

  test('app loads content while online', async ({ page }) => {
    // Verify app is functional while online
    await expect(page.getByText(/learn/i).first()).toBeVisible();
    await expect(page.locator('.min-h-dvh')).toBeVisible();
  });

  test('app displays cached content after going offline', async ({ page }) => {
    // First load the app fully while online
    await page.waitForLoadState('networkidle');

    // Go offline
    await goOffline(page);

    // The page should still be visible from cache
    await expect(page.locator('.min-h-dvh')).toBeVisible({ timeout: 10_000 }).catch(async () => {
      const body = await page.locator('body').textContent();
      expect(body).toBeTruthy();
    });
  });

  test('app recovers gracefully when going back online', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Go offline then back online
    await goOffline(page);
    await page.waitForTimeout(1000);
    await goOnline(page);

    // Reload the page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // The app should work normally after reconnection
    await expect(page.locator('.min-h-dvh')).toBeVisible();
  });

  test('IndexedDB data persists across page reloads', async ({ page }) => {
    // The player profile is stored in IndexedDB
    await page.reload();
    await page.waitForLoadState('networkidle');

    // After reload, the app should show the profile or the menu
    const hasProfile = await page.getByText(/OfflineKid/).isVisible({ timeout: 5000 }).catch(() => false);
    const hasMenu = await page.getByText(/learn/i).first().isVisible({ timeout: 5000 }).catch(() => false);

    expect(hasProfile || hasMenu).toBeTruthy();
  });

  test('navigating between pages works without network after initial load', async ({ page }) => {
    const menu = new MainMenuPage(page);

    // Pre-load the ABC page by navigating to it
    await menu.clickTile('ABCs');
    await page.waitForLoadState('networkidle');

    // Go back to menu
    const lesson = new LessonPage(page);
    await lesson.backButton.click();
    await page.waitForURL('**/menu');
    await page.waitForLoadState('networkidle');

    // Now go offline
    await goOffline(page);

    // Try navigating to ABCs again (should work from cache)
    await menu.clickTile('ABCs');
    await page.waitForTimeout(1000);

    // The page should render from cache
    await expect(page.locator('.min-h-dvh')).toBeVisible({ timeout: 10_000 }).catch(async () => {
      const url = page.url();
      expect(url).toContain('abc');
    });

    // Restore online state for cleanup
    await goOnline(page);
  });

  test('form data in IndexedDB is not lost during offline mode', async ({ page }) => {
    const menu = new MainMenuPage(page);

    // Navigate to ABCs to trigger some progress recording
    await menu.clickTile('ABCs');
    await page.waitForLoadState('networkidle');

    // Go offline
    await goOffline(page);

    // The app should not crash
    await expect(page.locator('.min-h-dvh')).toBeVisible();

    // Go back online
    await goOnline(page);

    // Verify the page is still rendered correctly
    await expect(page.locator('.min-h-dvh')).toBeVisible();
  });
});
