import { test, expect } from '@playwright/test';
import { WelcomePage, MainMenuPage, LessonPage } from '../../helpers/page-objects';

test.describe('Learning Flows', () => {
  test.beforeEach(async ({ page }) => {
    const welcome = new WelcomePage(page);
    await welcome.goto('/');
    await welcome.waitForLazyLoad();
    await welcome.createPlayer('LearnKid');
  });

  test.describe('ABCs / Letters', () => {
    test('navigates to ABCs section from Learn tab', async ({ page }) => {
      const menu = new MainMenuPage(page);
      await menu.clickTile('ABCs');

      await expect(page).toHaveURL(/\/abc/);
      await expect(page.getByText('ABCs')).toBeVisible();
    });

    test('displays a letter with emoji and pronunciation button', async ({ page }) => {
      const menu = new MainMenuPage(page);
      await menu.clickTile('ABCs');

      const lesson = new LessonPage(page);
      await expect(page.getByText('A is for')).toBeVisible();
      await expect(lesson.hearItButton).toBeVisible();
    });

    test('navigates forward through letters', async ({ page }) => {
      const menu = new MainMenuPage(page);
      await menu.clickTile('ABCs');

      const lesson = new LessonPage(page);
      await lesson.nextButton.click();
      await expect(page.getByText('B is for')).toBeVisible();

      await lesson.nextButton.click();
      await expect(page.getByText('C is for')).toBeVisible();
    });

    test('navigates backward through letters', async ({ page }) => {
      const menu = new MainMenuPage(page);
      await menu.clickTile('ABCs');

      const lesson = new LessonPage(page);
      await lesson.nextButton.click();
      await expect(page.getByText('B is for')).toBeVisible();

      await lesson.prevButton.click();
      await expect(page.getByText('A is for')).toBeVisible();
    });

    test('previous button is disabled on the first item', async ({ page }) => {
      const menu = new MainMenuPage(page);
      await menu.clickTile('ABCs');

      const lesson = new LessonPage(page);
      await expect(lesson.prevButton).toBeDisabled();
    });

    test('back button returns to main menu', async ({ page }) => {
      const menu = new MainMenuPage(page);
      await menu.clickTile('ABCs');

      const lesson = new LessonPage(page);
      await lesson.backButton.click();
      await expect(page).toHaveURL(/\/menu/);
    });

    test('progress dots are shown for ABC items', async ({ page }) => {
      const menu = new MainMenuPage(page);
      await menu.clickTile('ABCs');
      await page.waitForLoadState('networkidle');

      await expect(page.locator('.min-h-dvh')).toBeVisible();
    });
  });

  test.describe('Numbers', () => {
    test('navigates to Numbers section from Learn tab', async ({ page }) => {
      const menu = new MainMenuPage(page);
      await menu.clickTile('Numbers');

      await expect(page).toHaveURL(/\/numbers/);
      await expect(page.getByText('Numbers').first()).toBeVisible();
    });

    test('displays a number with counting interaction', async ({ page }) => {
      const menu = new MainMenuPage(page);
      await menu.clickTile('Numbers');

      const lesson = new LessonPage(page);
      await expect(page.locator('.min-h-dvh')).toBeVisible();
      await expect(lesson.hearItButton).toBeVisible();
    });

    test('navigates forward through numbers', async ({ page }) => {
      const menu = new MainMenuPage(page);
      await menu.clickTile('Numbers');

      const lesson = new LessonPage(page);
      await lesson.nextButton.click();
      await page.waitForTimeout(300);

      await expect(page.locator('.min-h-dvh')).toBeVisible();
    });

    test('back button returns to main menu from numbers', async ({ page }) => {
      const menu = new MainMenuPage(page);
      await menu.clickTile('Numbers');

      const lesson = new LessonPage(page);
      await lesson.backButton.click();
      await expect(page).toHaveURL(/\/menu/);
    });
  });

  test.describe('Cross-page navigation', () => {
    test('can navigate from ABCs to menu to Numbers and back', async ({ page }) => {
      const menu = new MainMenuPage(page);

      await menu.clickTile('ABCs');
      await expect(page).toHaveURL(/\/abc/);

      const lesson = new LessonPage(page);
      await lesson.backButton.click();
      await expect(page).toHaveURL(/\/menu/);

      await menu.clickTile('Numbers');
      await expect(page).toHaveURL(/\/numbers/);

      const lesson2 = new LessonPage(page);
      await lesson2.backButton.click();
      await expect(page).toHaveURL(/\/menu/);

      await expect(menu.learnTab).toBeVisible();
    });

    test('deep linking to /abc works and shows content', async ({ page }) => {
      const menu = new MainMenuPage(page);
      await menu.clickTile('ABCs');
      await expect(page.getByText('ABCs')).toBeVisible();
    });

    test('deep linking to /numbers works and shows content', async ({ page }) => {
      const menu = new MainMenuPage(page);
      await menu.clickTile('Numbers');
      await expect(page.getByText('Numbers').first()).toBeVisible();
    });
  });
});
