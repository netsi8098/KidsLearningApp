import { test, expect } from '@playwright/test';
import { WelcomePage, MainMenuPage, ParentGate, ParentDashboardPage } from '../../helpers/page-objects';

test.describe('Parent Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    const welcome = new WelcomePage(page);
    await welcome.goto('/');
    await welcome.waitForLazyLoad();
    await welcome.createPlayer('DashKid');
  });

  test('navigating to parent dashboard shows the parent gate', async ({ page }) => {
    const menu = new MainMenuPage(page);
    await menu.parentsButton.click();

    await expect(page).toHaveURL(/\/parent-dashboard/);
    await expect(page.getByText('Parent Dashboard')).toBeVisible();
    await expect(page.getByPlaceholder(/answer/i)).toBeVisible();
  });

  test('parent gate shows a math addition problem', async ({ page }) => {
    await page.goto('/parent-dashboard');
    await page.waitForLoadState('networkidle');

    // Should show "X + Y = ?" format
    const questionText = await page.locator('p.text-3xl').textContent();
    expect(questionText).toMatch(/\d+\s*\+\s*\d+\s*=\s*\?/);
  });

  test('wrong answer in parent gate shows error and clears input', async ({ page }) => {
    await page.goto('/parent-dashboard');
    await page.waitForLoadState('networkidle');

    // Enter a wrong answer
    await page.getByPlaceholder(/answer/i).fill('999');
    await page.getByRole('button', { name: /check/i }).click();

    // Error message should appear
    await expect(page.getByText(/not right|try again/i)).toBeVisible();
  });

  test('correct answer in parent gate unlocks the dashboard', async ({ page }) => {
    await page.goto('/parent-dashboard');
    await page.waitForLoadState('networkidle');

    const gate = new ParentGate(page);
    await gate.solve();

    // Dashboard content should now be visible
    const dashboard = new ParentDashboardPage(page);
    await expect(page.getByText(/Progress$/)).toBeVisible();
  });

  test('parent gate back button returns to menu', async ({ page }) => {
    await page.goto('/parent-dashboard');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: /back/i }).click();
    await expect(page).toHaveURL(/\/menu/);
  });

  test('dashboard shows overview cards after unlocking', async ({ page }) => {
    await page.goto('/parent-dashboard');
    await page.waitForLoadState('networkidle');

    const gate = new ParentGate(page);
    await gate.solve();

    // Overview cards: Total Stars, Streak Days, Days of Learning, Total Activities
    await expect(page.getByText('Total Stars')).toBeVisible();
    await expect(page.getByText('Streak Days')).toBeVisible();
    await expect(page.getByText('Days of Learning')).toBeVisible();
    await expect(page.getByText('Total Activities')).toBeVisible();
  });

  test('dashboard shows quick links for Inbox and Routines', async ({ page }) => {
    await page.goto('/parent-dashboard');
    await page.waitForLoadState('networkidle');

    const gate = new ParentGate(page);
    await gate.solve();

    const dashboard = new ParentDashboardPage(page);
    await expect(dashboard.inboxButton).toBeVisible();
    await expect(dashboard.routinesButton).toBeVisible();
  });

  test('dashboard shows weekly activity chart', async ({ page }) => {
    await page.goto('/parent-dashboard');
    await page.waitForLoadState('networkidle');

    const gate = new ParentGate(page);
    await gate.solve();

    const dashboard = new ParentDashboardPage(page);
    await expect(dashboard.weeklyActivitySection).toBeVisible();
  });

  test('dashboard shows category progress section', async ({ page }) => {
    await page.goto('/parent-dashboard');
    await page.waitForLoadState('networkidle');

    const gate = new ParentGate(page);
    await gate.solve();

    const dashboard = new ParentDashboardPage(page);
    await expect(dashboard.categoryProgressSection).toBeVisible();
  });

  test('dashboard shows weekly recap link', async ({ page }) => {
    await page.goto('/parent-dashboard');
    await page.waitForLoadState('networkidle');

    const gate = new ParentGate(page);
    await gate.solve();

    const dashboard = new ParentDashboardPage(page);
    await expect(dashboard.weeklyRecapButton).toBeVisible();
  });

  test('clicking Inbox quick link navigates to inbox page', async ({ page }) => {
    await page.goto('/parent-dashboard');
    await page.waitForLoadState('networkidle');

    const gate = new ParentGate(page);
    await gate.solve();

    const dashboard = new ParentDashboardPage(page);
    await dashboard.inboxButton.click();

    await expect(page).toHaveURL(/\/inbox/);
  });

  test('clicking Routines quick link navigates to routines page', async ({ page }) => {
    await page.goto('/parent-dashboard');
    await page.waitForLoadState('networkidle');

    const gate = new ParentGate(page);
    await gate.solve();

    const dashboard = new ParentDashboardPage(page);
    await dashboard.routinesButton.click();

    await expect(page).toHaveURL(/\/routines/);
  });

  test('dashboard back button returns to main menu', async ({ page }) => {
    await page.goto('/parent-dashboard');
    await page.waitForLoadState('networkidle');

    const gate = new ParentGate(page);
    await gate.solve();

    // Click the back nav button
    await page.locator('button').filter({ hasText: /◀/ }).click();
    await expect(page).toHaveURL(/\/menu/);
  });

  test('dashboard footer text is displayed', async ({ page }) => {
    await page.goto('/parent-dashboard');
    await page.waitForLoadState('networkidle');

    const gate = new ParentGate(page);
    await gate.solve();

    await expect(page.getByText(/data updates in real time/i)).toBeVisible();
  });
});
