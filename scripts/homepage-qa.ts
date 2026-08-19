/**
 * Homepage world QA harness.
 *
 * Checks every world at every breakpoint for both *composition* and
 * *function*, because a homepage can look right and still be broken:
 * a card shelf that covers the mascot, a Parent button that no longer opens
 * the gate, or a world switch that silently fails all pass a screenshot test.
 *
 * Defaults to the LOCAL production build. Point it at a deployed URL only when
 * you have confirmed that deployment is current — auditing a stale deploy is
 * how already-fixed issues get re-reported.
 *
 * Usage:
 *   npm run build && npx vite preview --port 4173
 *   npx tsx scripts/homepage-qa.ts
 *   npx tsx scripts/homepage-qa.ts --url https://example.com   # explicit target
 *
 * Exits non-zero if any check fails, so it can gate a release.
 */
import { chromium, type Page, type Browser } from 'playwright';
import { mkdirSync } from 'fs';

const urlArg = process.argv.indexOf('--url');
const BASE_URL = urlArg > -1 ? process.argv[urlArg + 1] : 'http://localhost:4173';
const SHOT_DIR = 'screenshots/homepage-qa';

const VIEWPORTS = [
  { name: 'phone', width: 390, height: 844 },
  { name: 'tablet', width: 820, height: 1180 },
  { name: 'desktop', width: 1440, height: 900 },
];

const WORLDS = ['sunny-meadow', 'river-garden', 'treehouse', 'sky-islands'];

interface Result {
  scope: string;
  check: string;
  pass: boolean;
  detail: string;
}

const results: Result[] = [];
const record = (scope: string, check: string, pass: boolean, detail = '') =>
  results.push({ scope, check, pass, detail });

/** Seed profiles through the real onboarding flow — no DB back doors. */
async function seedProfiles(page: Page, names: string[]) {
  for (const name of names) {
    const create = page
      .getByRole('button', { name: /create player|add player|new player|get started/i })
      .first();
    if (!(await create.isVisible({ timeout: 4000 }).catch(() => false))) return;
    await create.click();
    await page.getByPlaceholder(/enter name/i).fill(name);
    await page.getByRole('button', { name: /^next$/i }).click();
    await page.getByRole('button', { name: /^skip$/i }).click();
    await page.getByRole('button', { name: /^skip$/i }).click();
    await page.waitForURL('**/menu', { timeout: 9000 }).catch(() => {});
    await page.goto(BASE_URL + '/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
  }
}

/** Do the player cards cover the mascot? The hero must stay readable. */
async function mascotUnobstructed(page: Page): Promise<{ ok: boolean; detail: string }> {
  return page.evaluate(() => {
    const lion = document.querySelector('svg[viewBox="0 0 240 240"], [class*="LionMascot"]')
      || Array.from(document.querySelectorAll('svg')).find((s) => s.clientHeight > 90);
    if (!lion) return { ok: false, detail: 'mascot not found in DOM' };
    const m = lion.getBoundingClientRect();
    const cards = Array.from(document.querySelectorAll('button')).filter((b) => {
      const r = b.getBoundingClientRect();
      return r.width > 90 && r.height > 90;
    });
    for (const c of cards) {
      const r = c.getBoundingClientRect();
      const overlapX = Math.max(0, Math.min(m.right, r.right) - Math.max(m.left, r.left));
      const overlapY = Math.max(0, Math.min(m.bottom, r.bottom) - Math.max(m.top, r.top));
      const area = overlapX * overlapY;
      const mascotArea = m.width * m.height;
      if (mascotArea > 0 && area / mascotArea > 0.22) {
        return { ok: false, detail: `card covers ${Math.round((area / mascotArea) * 100)}% of mascot` };
      }
    }
    return { ok: true, detail: `mascot ${Math.round(m.width)}x${Math.round(m.height)} clear` };
  });
}

async function auditWorld(browser: Browser, world: string, vp: typeof VIEWPORTS[number]) {
  const scope = `${world}/${vp.name}`;
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  await ctx.addInitScript((w) => {
    try { localStorage.setItem('klf-homepage-theme', w as string); } catch { /* private mode */ }
  }, world);
  const page = await ctx.newPage();
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

  try {
    await page.goto(BASE_URL + '/', { waitUntil: 'networkidle' });
    await seedProfiles(page, ['Alex', 'Maya']);
    await page.waitForTimeout(1800);

    // 1. Runtime health
    record(scope, 'no runtime errors', errors.length === 0, errors.slice(0, 2).join(' | '));

    // 2. No horizontal overflow
    const overflow = await page.evaluate(() => {
      const d = document.documentElement;
      return { sw: d.scrollWidth, cw: d.clientWidth };
    });
    record(scope, 'no horizontal overflow', overflow.sw <= overflow.cw + 1,
      `scrollW=${overflow.sw} clientW=${overflow.cw}`);

    // 3. Title is present and integrated (not an empty text node)
    const titleText = await page.evaluate(() =>
      (document.querySelector('h1')?.textContent || '').replace(/\s+/g, ''));
    record(scope, 'world title rendered', titleText.includes('KidsLearningFun'), `h1="${titleText}"`);

    // 4. Mascot present and unobstructed by the card shelf
    const mascot = await mascotUnobstructed(page);
    record(scope, 'mascot unobstructed', mascot.ok, mascot.detail);

    // 5. Card shelf populated
    const cardCount = await page.getByRole('button', { name: /play as/i }).count();
    record(scope, 'player cards on shelf', cardCount >= 1, `${cardCount} player card(s)`);

    // 6. New Player affordance present
    const newPlayer = await page.getByRole('button', { name: /create a new player/i }).count();
    record(scope, 'new player card present', newPlayer === 1, `${newPlayer} found`);

    await page.screenshot({ path: `${SHOT_DIR}/${world}-${vp.name}.png` });

    // 7. Parent gate opens (functional, desktop only to keep the run quick)
    if (vp.name === 'desktop') {
      await page.getByRole('button', { name: /^parent$/i }).click().catch(() => {});
      await page.waitForTimeout(900);
      const gateOpen = await page.evaluate(() =>
        /parent|sign in|email/i.test(document.body.innerText) &&
        !!document.querySelector('[role="dialog"], .fixed'));
      record(scope, 'parent gate opens', gateOpen, gateOpen ? 'modal shown' : 'no modal detected');
      await page.keyboard.press('Escape').catch(() => {});
      await page.waitForTimeout(400);

      // 8. Selecting a player enters the app
      await page.goto(BASE_URL + '/', { waitUntil: 'networkidle' });
      await page.waitForTimeout(1200);
      await page.getByRole('button', { name: /play as/i }).first().click().catch(() => {});
      const entered = await page.waitForURL('**/menu', { timeout: 9000 }).then(() => true).catch(() => false);
      record(scope, 'player selection enters app', entered, entered ? '→ /menu' : 'did not reach /menu');
    }
  } catch (err) {
    record(scope, 'audit completed', false, (err as Error).message);
  } finally {
    await ctx.close();
  }
}

(async () => {
  mkdirSync(SHOT_DIR, { recursive: true });
  console.log(`Homepage QA against ${BASE_URL}\n`);
  const browser = await chromium.launch();

  for (const world of WORLDS) {
    for (const vp of VIEWPORTS) {
      await auditWorld(browser, world, vp);
    }
  }
  await browser.close();

  const failed = results.filter((r) => !r.pass);
  const byScope = new Map<string, Result[]>();
  for (const r of results) {
    if (!byScope.has(r.scope)) byScope.set(r.scope, []);
    byScope.get(r.scope)!.push(r);
  }
  for (const [scope, rs] of byScope) {
    const bad = rs.filter((r) => !r.pass);
    console.log(`${bad.length === 0 ? 'PASS' : 'FAIL'}  ${scope}`);
    for (const r of bad) console.log(`        ✗ ${r.check} — ${r.detail}`);
  }

  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  console.log(`screenshots → ${SHOT_DIR}/`);
  if (failed.length) process.exit(1);
})();
