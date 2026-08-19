/**
 * Route sweep — blank-page and dead-route detection.
 *
 * Written after a live /stories "blank white page" turned out to be a hard 404:
 * the SPA fallback config never reached the deploy artifact, so every deep link
 * broke while the app itself was healthy. A screenshot pass would not have
 * caught it; asserting on rendered node count and HTTP status does.
 *
 * Each route is checked for:
 *   - HTTP status (catches missing SPA rewrite on the host)
 *   - rendered node count (catches a mounted-but-blank route)
 *   - meaningful text (catches a route that renders only chrome)
 *   - runtime errors (catches a crashed lazy chunk)
 *
 * Usage:
 *   npm run build && npx vite preview --port 4173
 *   npx tsx scripts/route-qa.ts
 *   npx tsx scripts/route-qa.ts --url https://your-deploy   # verify a deploy
 */
import { chromium, type Page } from 'playwright';

const urlArg = process.argv.indexOf('--url');
const BASE_URL = urlArg > -1 ? process.argv[urlArg + 1] : 'http://localhost:4173';

/** Concrete routes only — parameterised ones need fixture ids. */
const ROUTES = [
  '/', '/menu', '/abc', '/numbers', '/colors', '/shapes', '/animals', '/bodyparts',
  '/stories', '/videos', '/audio', '/games', '/matching', '/quiz', '/coloring',
  '/scrapbook', '/rewards', '/emotions', '/bedtime', '/movement', '/cooking',
  '/routines', '/lessons', '/collections', '/discover', '/explorer', '/characters',
  '/assessment', '/printables', '/settings', '/inbox', '/queue', '/weekly-recap',
  '/home-activities', '/onboarding', '/preview',
  // parent / public surfaces
  '/parent-dashboard', '/parent-tips', '/help', '/privacy', '/billing',
];

/**
 * Node count alone is a bad blank-page signal: parent gates ("solve 11 + 12"),
 * empty queues and intro screens are *intentionally* sparse and render only a
 * dozen nodes. A route is only broken if it renders essentially nothing, throws
 * to the error boundary, or the host never served the SPA shell. Screens whose
 * whole job is a short prompt are recognised by their copy instead.
 */
const INTENTIONALLY_SPARSE = /solve this|grown-up check|queue is empty|let's see what you know|nothing here yet|no messages/i;
const ERROR_BOUNDARY = /something broke|oops!/i;

interface Row { route: string; status: number; nodes: number; text: number; errors: string[]; verdict: string }

async function onboard(page: Page) {
  await page.goto(BASE_URL + '/', { waitUntil: 'networkidle' });
  const create = page.getByRole('button', { name: /create player|get started|add player|new player/i }).first();
  if (await create.isVisible({ timeout: 4000 }).catch(() => false)) {
    await create.click();
    await page.getByPlaceholder(/enter name/i).fill('QA Kid');
    await page.getByRole('button', { name: /^next$/i }).click();
    await page.getByRole('button', { name: /^skip$/i }).click();
    await page.getByRole('button', { name: /^skip$/i }).click();
    await page.waitForURL('**/menu', { timeout: 9000 }).catch(() => {});
  }
}

(async () => {
  console.log(`Route sweep against ${BASE_URL}\n`);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await onboard(page);

  const rows: Row[] = [];
  for (const route of ROUTES) {
    const errors: string[] = [];
    const onErr = (e: Error) => errors.push(e.message);
    const onConsole = (m: { type(): string; text(): string }) => {
      if (m.type() === 'error') errors.push(m.text());
    };
    page.on('pageerror', onErr);
    page.on('console', onConsole as never);

    let status = 0;
    try {
      const resp = await page.goto(BASE_URL + route, { waitUntil: 'networkidle', timeout: 25000 });
      status = resp?.status() ?? 0;
      await page.waitForTimeout(1400);
    } catch (e) {
      errors.push((e as Error).message);
    }

    const m = await page.evaluate(() => ({
      nodes: document.querySelectorAll('#root *').length,
      text: (document.body.innerText || '').trim().length,
      copy: (document.body.innerText || '').trim().slice(0, 400),
    })).catch(() => ({ nodes: 0, text: 0, copy: '' }));

    page.off('pageerror', onErr);
    page.off('console', onConsole as never);

    const sparseByDesign = INTENTIONALLY_SPARSE.test(m.copy);
    let verdict = 'PASS';
    if (status >= 400) verdict = `FAIL http ${status}`;
    else if (ERROR_BOUNDARY.test(m.copy)) verdict = 'FAIL error boundary';
    else if (m.nodes < 5 || m.text < 10) verdict = `FAIL blank (${m.nodes} nodes, ${m.text} chars)`;
    else if (!sparseByDesign && m.nodes < 20 && m.text < 40) verdict = `FAIL thin (${m.nodes} nodes, ${m.text} chars)`;
    else if (errors.length) verdict = 'WARN runtime errors';

    rows.push({ route, status, nodes: m.nodes, text: m.text, errors, verdict });
  }

  await browser.close();

  const pad = (s: string, n: number) => s.padEnd(n);
  console.log(`${pad('ROUTE', 22)}${pad('HTTP', 6)}${pad('NODES', 7)}${pad('TEXT', 7)}VERDICT`);
  for (const r of rows) {
    console.log(`${pad(r.route, 22)}${pad(String(r.status), 6)}${pad(String(r.nodes), 7)}${pad(String(r.text), 7)}${r.verdict}`);
    if (r.verdict.startsWith('FAIL') || r.verdict.startsWith('WARN')) {
      for (const e of r.errors.slice(0, 2)) console.log(`${' '.repeat(22)}↳ ${e.slice(0, 120)}`);
    }
  }

  const failures = rows.filter((r) => r.verdict.startsWith('FAIL'));
  console.log(`\n${rows.length - failures.length}/${rows.length} routes healthy`);
  if (failures.length) {
    console.log(`failing: ${failures.map((f) => f.route).join(', ')}`);
    process.exit(1);
  }
})();
