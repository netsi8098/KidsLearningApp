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

/* river-garden-3d renders a WebGL canvas rather than DOM art, so it needs the
   longer settle used below — the GLBs must finish loading before any check that
   looks at layout can mean anything. */
const WORLDS = ['sunny-meadow', 'river-garden', 'river-garden-3d', 'treehouse', 'sky-islands'];
const WEBGL_WORLDS = new Set(['river-garden-3d']);

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

/**
 * Do the player cards cover the mascot? The hero must stay readable.
 *
 * The mascot is identified by what it actually is — the rigged R3F canvas, the
 * lion art, or the PremiumLion SVG fallback — not by "largest SVG on the page".
 * That earlier heuristic matched the decorative shelf plate, which sits exactly
 * under the card row, and reported 25% occlusion on a hero nothing was touching.
 */
async function mascotUnobstructed(page: Page): Promise<{ ok: boolean; detail: string }> {
  return page.evaluate(() => {
    const mascot =
      (document.querySelector('canvas') as HTMLElement | null) ??
      (document.querySelector('img[src*="/assets/lion/"]') as HTMLElement | null) ??
      (document.querySelector('[data-mascot]') as HTMLElement | null) ??
      (Array.from(document.querySelectorAll('svg')).find(
        (s) => s.getAttribute('viewBox') === '0 0 240 240',
      ) as unknown as HTMLElement | null);

    if (!mascot) return { ok: false, detail: 'mascot not found (no canvas, lion art or fallback SVG)' };

    const m = mascot.getBoundingClientRect();
    if (m.width < 40 || m.height < 40) {
      return { ok: false, detail: `mascot rendered too small: ${Math.round(m.width)}x${Math.round(m.height)}` };
    }

    /* Only interactive cards count as occluders. Decorative plates do not — and
       neither does the mascot's own wrapper: the lion is itself a button ("Hear
       the lion ask who's playing today"), so counting it made the hero look 100%
       covered by itself. */
    const cards = Array.from(document.querySelectorAll('button')).filter((b) => {
      const r = b.getBoundingClientRect();
      if (r.width <= 90 || r.height <= 90) return false;
      return !b.contains(mascot) && !mascot.contains(b);
    });

    const mascotArea = m.width * m.height;
    for (const c of cards) {
      const r = c.getBoundingClientRect();
      const overlap =
        Math.max(0, Math.min(m.right, r.right) - Math.max(m.left, r.left)) *
        Math.max(0, Math.min(m.bottom, r.bottom) - Math.max(m.top, r.top));
      if (mascotArea > 0 && overlap / mascotArea > 0.22) {
        return { ok: false, detail: `card covers ${Math.round((overlap / mascotArea) * 100)}% of mascot` };
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
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    /* A failed fetch to an OFF-SITE host is environment, not a defect in the
       page: this app probes an optional backend and TTS server over a
       Cloudflare tunnel whose URL is ephemeral, so it is usually unreachable
       during QA. Counting that as "runtime error" made the 3D world fail purely
       because it settles slowly enough for the timeout to land inside the
       observation window — a real regression would have been indistinguishable
       from a dead tunnel. Same-origin failures are still real and still fail. */
    const url = m.location()?.url ?? '';
    const offsite = url !== '' && !url.startsWith(BASE_URL);
    if (offsite && /Failed to load resource|ERR_NAME_NOT_RESOLVED|ERR_CONNECTION/.test(m.text())) return;
    errors.push(m.text());
  });

  try {
    await page.goto(BASE_URL + '/', { waitUntil: 'networkidle' });
    await seedProfiles(page, ['Alex', 'Maya']);
    await page.waitForTimeout(1800);

    if (WEBGL_WORLDS.has(world)) {
      // The 3D world lazy-loads three.js and two GLBs. Checking layout before
      // they land measures a blank canvas and reports a false pass.
      await page.waitForSelector('canvas', { timeout: 20_000 }).catch(() => {});
      await page.waitForTimeout(4500);
      const live = await page.evaluate(() => {
        const c = document.querySelector('canvas') as HTMLCanvasElement | null;
        if (!c) return { present: false, drawn: false };
        // A canvas that exists but never painted is the failure mode that a
        // "canvas is present" check would happily wave through.
        return { present: true, drawn: c.width > 0 && c.height > 0 };
      });
      record(scope, '3D canvas present', live.present);
      record(scope, '3D canvas has a drawing buffer', live.drawn);
    }

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

    /* 4b. No source artefacts rendered as page text. A JSX comment written
       `/* *\/` instead of `{/* *\/}` renders its whole body as visible copy,
       and stray characters leak the same way (an `Explore` nav item once shipped
       a bare "N"). Screenshots pass this happily, so assert on it. */
    const strayText = await page.evaluate(() => {
      const body = (document.body.innerText || '');
      const artefacts = [
        { re: /\/\*|\*\//, what: 'comment delimiter' },
        { re: /\bundefined\b|\bNaN\b|\[object Object\]/, what: 'unrendered value' },
        { re: /className=|=>\s|\bconst\b\s+\w+\s*=/, what: 'source code' },
      ];
      for (const a of artefacts) {
        const m = body.match(a.re);
        if (m) {
          const i = Math.max(0, body.indexOf(m[0]) - 30);
          return { ok: false, detail: `${a.what}: "${body.slice(i, i + 90).replace(/\s+/g, ' ')}"` };
        }
      }
      return { ok: true, detail: 'no source artefacts in rendered text' };
    });
    record(scope, 'no stray source text', strayText.ok, strayText.detail);

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
  /* SwiftShader gives headless a real WebGL context. Without it the rigged-lion
   canvas cannot initialise and every scope fails on WebGL errors, masking real
   defects behind an environment limitation. */
  const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader'] });

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
