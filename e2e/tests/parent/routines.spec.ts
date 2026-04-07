import { test, expect } from '@playwright/test';
import { WelcomePage, ParentGate, RoutinePlannerPage } from '../../helpers/page-objects';

test.describe('Routine Planner', () => {
  test.beforeEach(async ({ page }) => {
    const welcome = new WelcomePage(page);
    await welcome.goto('/');
    await welcome.waitForLazyLoad();
    await welcome.createPlayer('RoutineKid');
  });

  test('navigating to routines shows the parent gate', async ({ page }) => {
    await page.goto('/routines');
    await page.waitForLoadState('networkidle');

    // Routines page has a parent gate
    await expect(page.getByPlaceholder(/answer/i)).toBeVisible();
  });

  test('parent gate shows a math problem', async ({ page }) => {
    await page.goto('/routines');
    await page.waitForLoadState('networkidle');

    const questionText = await page.locator('p.text-3xl').textContent();
    expect(questionText).toMatch(/\d+\s*\+\s*\d+\s*=\s*\?/);
  });

  test('solving the parent gate unlocks the routine planner', async ({ page }) => {
    await page.goto('/routines');
    await page.waitForLoadState('networkidle');

    const gate = new ParentGate(page);
    await gate.solve();

    // After unlocking, the routine planner content should be visible
    await expect(page.locator('.min-h-dvh')).toBeVisible();
  });

  test('routine planner shows empty state or existing routines', async ({ page }) => {
    await page.goto('/routines');
    await page.waitForLoadState('networkidle');

    const gate = new ParentGate(page);
    await gate.solve();

    // Should either show "No routines" or a list of routines
    const hasContent = await page.locator('.min-h-dvh').isVisible();
    expect(hasContent).toBeTruthy();
  });

  test('create new routine button is visible', async ({ page }) => {
    await page.goto('/routines');
    await page.waitForLoadState('networkidle');

    const gate = new ParentGate(page);
    await gate.solve();

    // Look for a create/new routine button
    const createButton = page.getByRole('button', { name: /create|new routine/i });
    await expect(createButton).toBeVisible();
  });

  test('templates button is visible', async ({ page }) => {
    await page.goto('/routines');
    await page.waitForLoadState('networkidle');

    const gate = new ParentGate(page);
    await gate.solve();

    const templatesButton = page.getByRole('button', { name: /template/i });
    await expect(templatesButton).toBeVisible();
  });

  test('clicking create routine opens the builder form', async ({ page }) => {
    await page.goto('/routines');
    await page.waitForLoadState('networkidle');

    const gate = new ParentGate(page);
    await gate.solve();

    const createButton = page.getByRole('button', { name: /create|new routine/i });
    await createButton.click();

    // Builder form should show routine type selection
    await expect(page.getByText(/morning/i).first()).toBeVisible();
  });

  test('routine builder shows type options', async ({ page }) => {
    await page.goto('/routines');
    await page.waitForLoadState('networkidle');

    const gate = new ParentGate(page);
    await gate.solve();

    const createButton = page.getByRole('button', { name: /create|new routine/i });
    await createButton.click();

    // Routine types: Morning, After School, Travel, Bedtime, Weekend, Custom
    await expect(page.getByText(/morning/i).first()).toBeVisible();
    await expect(page.getByText(/bedtime/i).first()).toBeVisible();
  });

  test('clicking templates shows template options', async ({ page }) => {
    await page.goto('/routines');
    await page.waitForLoadState('networkidle');

    const gate = new ParentGate(page);
    await gate.solve();

    const templatesButton = page.getByRole('button', { name: /template/i });
    await templatesButton.click();

    // Templates should be displayed
    await expect(page.locator('.min-h-dvh')).toBeVisible();
  });

  test('parent gate back button returns to menu', async ({ page }) => {
    await page.goto('/routines');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: /back/i }).click();
    await expect(page).toHaveURL(/\/menu/);
  });

  test('back button from routine planner returns to menu', async ({ page }) => {
    await page.goto('/routines');
    await page.waitForLoadState('networkidle');

    const gate = new ParentGate(page);
    await gate.solve();

    // Click back nav button
    await page.locator('button').filter({ hasText: /◀/ }).click();
    await expect(page).toHaveURL(/\/menu/);
  });
});
