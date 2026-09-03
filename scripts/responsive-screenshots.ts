/**
 * Responsive screenshot script for visual verification.
 * Takes screenshots of /menu, /coloring, and /coloring studio
 * at phone, tablet, and desktop viewports.
 *
 * Usage:
 *   npx playwright test scripts/responsive-screenshots.ts
 * Or run directly:
 *   npx tsx scripts/responsive-screenshots.ts
 *
 * Screenshots saved to: screenshots/ directory
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const BASE_URL = 'https://thankful-tree-0cf247010.2.azurestaticapps.net';

const viewports = [
  { name: 'phone', width: 390, height: 844 },
  { name: 'tablet', width: 820, height: 1180 },
  { name: 'desktop', width: 1440, height: 900 },
];

const pages = [
  { name: 'menu', path: '/menu' },
  { name: 'coloring-library', path: '/coloring' },
];

async function run() {
  mkdirSync('screenshots', { recursive: true });

  const browser = await chromium.launch({ headless: true });

  for (const vp of viewports) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();

    // First visit welcome to create a player profile
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Check if we need to create a player
    const getStartedBtn = page.locator('text=Get Started').first();
    if (await getStartedBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await getStartedBtn.click();
      await page.waitForTimeout(1000);
      // Fill in name
      const nameInput = page.locator('input[placeholder*="name" i]').first();
      if (await nameInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await nameInput.fill('Test Player');
      }
      // Try to complete profile creation
      const doneBtn = page.locator('text=Done').or(page.locator('text=Start')).first();
      if (await doneBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await doneBtn.click();
        await page.waitForTimeout(2000);
      }
    }

    // If a player card exists, click it
    const playerCard = page.locator('[class*="cursor-pointer"]').first();
    if (await playerCard.isVisible({ timeout: 2000 }).catch(() => false)) {
      await playerCard.click();
      await page.waitForTimeout(1500);
    }

    // Screenshot each page
    for (const pg of pages) {
      await page.goto(`${BASE_URL}${pg.path}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      const filename = `screenshots/${pg.name}_${vp.name}_${vp.width}x${vp.height}.png`;
      await page.screenshot({ path: filename, fullPage: false });
      console.log(`✓ ${filename}`);
    }

    // Screenshot coloring studio — open first template
    await page.goto(`${BASE_URL}/coloring`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const templateCard = page.locator('button').filter({ has: page.locator('svg') }).first();
    if (await templateCard.isVisible({ timeout: 3000 }).catch(() => false)) {
      await templateCard.click();
      await page.waitForTimeout(2000);
      const studioFilename = `screenshots/coloring-studio_${vp.name}_${vp.width}x${vp.height}.png`;
      await page.screenshot({ path: studioFilename, fullPage: false });
      console.log(`✓ ${studioFilename}`);
    }

    await context.close();
  }

  await browser.close();
  console.log('\nAll screenshots saved to screenshots/ directory');
}

run().catch(console.error);
