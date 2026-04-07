import { test, expect } from '@playwright/test';
import { WelcomePage, MainMenuPage, ParentGate, SettingsPage } from '../../helpers/page-objects';

test.describe('Settings Page', () => {
  test.beforeEach(async ({ page }) => {
    const welcome = new WelcomePage(page);
    await welcome.goto('/');
    await welcome.waitForLazyLoad();
    await welcome.createPlayer('SettingsKid');
  });

  test('navigating to settings shows the parent gate', async ({ page }) => {
    const menu = new MainMenuPage(page);
    await menu.settingsButton.click();

    await expect(page).toHaveURL(/\/settings/);
    await expect(page.getByText('Parent Check')).toBeVisible();
    await expect(page.getByText(/solve this to access settings/i)).toBeVisible();
  });

  test('solving parent gate unlocks settings', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    const gate = new ParentGate(page);
    await gate.solve();

    const settings = new SettingsPage(page);
    await expect(settings.heading).toBeVisible();
  });

  test('settings page shows player info section', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    const gate = new ParentGate(page);
    await gate.solve();

    await expect(page.getByText('Player')).toBeVisible();
    await expect(page.getByText('SettingsKid')).toBeVisible();
  });

  test('settings page shows edit profile section', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    const gate = new ParentGate(page);
    await gate.solve();

    await expect(page.getByText('Edit Profile')).toBeVisible();
    const settings = new SettingsPage(page);
    await expect(settings.editProfileButton).toBeVisible();
  });

  test('settings page shows sound effects toggle', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    const gate = new ParentGate(page);
    await gate.solve();

    await expect(page.getByText('Sound Effects')).toBeVisible();
  });

  test('settings page shows voice toggle', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    const gate = new ParentGate(page);
    await gate.solve();

    await expect(page.getByText(/Voice.*Text-to-Speech/i)).toBeVisible();
  });

  test('settings page shows accessibility section', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    const gate = new ParentGate(page);
    await gate.solve();

    await expect(page.getByText('Accessibility')).toBeVisible();
    await expect(page.getByText('Reduced Motion')).toBeVisible();
    await expect(page.getByText('Larger Text')).toBeVisible();
    await expect(page.getByText('High Contrast')).toBeVisible();
  });

  test('settings page shows Account & Support section with links', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    const gate = new ParentGate(page);
    await gate.solve();

    const settings = new SettingsPage(page);
    await expect(settings.accountSupportSection).toBeVisible();
    await expect(settings.billingLink).toBeVisible();
    await expect(settings.privacyLink).toBeVisible();
    await expect(settings.helpLink).toBeVisible();
  });

  test('settings shows about section', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    const gate = new ParentGate(page);
    await gate.solve();

    await expect(page.getByText('About')).toBeVisible();
    await expect(page.getByText(/Kids Learning Fun v/i)).toBeVisible();
  });

  test('settings shows danger zone section', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    const gate = new ParentGate(page);
    await gate.solve();

    await expect(page.getByText('Danger Zone')).toBeVisible();
    await expect(page.getByRole('button', { name: /delete this profile/i })).toBeVisible();
  });
});

test.describe('Billing Page', () => {
  test.beforeEach(async ({ page }) => {
    const welcome = new WelcomePage(page);
    await welcome.goto('/');
    await welcome.waitForLazyLoad();
    await welcome.createPlayer('BillingKid');
  });

  test('navigating to billing from settings works', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    const gate = new ParentGate(page);
    await gate.solve();

    const settings = new SettingsPage(page);
    await settings.billingLink.click();

    await expect(page).toHaveURL(/\/billing/);
  });

  test('billing page shows parent gate', async ({ page }) => {
    await page.goto('/billing');
    await page.waitForLoadState('networkidle');

    // Billing page also has a parent gate
    await expect(page.getByPlaceholder(/answer/i)).toBeVisible();
  });

  test('billing page loads after solving parent gate', async ({ page }) => {
    await page.goto('/billing');
    await page.waitForLoadState('networkidle');

    const gate = new ParentGate(page);
    await gate.solve();

    // The billing page content should be visible
    await expect(page.locator('.min-h-dvh')).toBeVisible();
  });
});

test.describe('Privacy Page', () => {
  test.beforeEach(async ({ page }) => {
    const welcome = new WelcomePage(page);
    await welcome.goto('/');
    await welcome.waitForLazyLoad();
    await welcome.createPlayer('PrivacyKid');
  });

  test('navigating to privacy from settings works', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    const gate = new ParentGate(page);
    await gate.solve();

    const settings = new SettingsPage(page);
    await settings.privacyLink.click();

    await expect(page).toHaveURL(/\/privacy/);
  });

  test('privacy page renders content', async ({ page }) => {
    await page.goto('/privacy');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('.min-h-dvh')).toBeVisible();
  });
});

test.describe('Help Center Page', () => {
  test.beforeEach(async ({ page }) => {
    const welcome = new WelcomePage(page);
    await welcome.goto('/');
    await welcome.waitForLazyLoad();
    await welcome.createPlayer('HelpKid');
  });

  test('navigating to help center from settings works', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    const gate = new ParentGate(page);
    await gate.solve();

    const settings = new SettingsPage(page);
    await settings.helpLink.click();

    await expect(page).toHaveURL(/\/help/);
  });

  test('help center page renders content', async ({ page }) => {
    await page.goto('/help');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('.min-h-dvh')).toBeVisible();
  });
});
