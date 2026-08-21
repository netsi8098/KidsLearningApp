import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--enable-unsafe-swiftshader','--use-gl=angle'] });
const c = await b.newContext({ viewport:{width:1280,height:800}, serviceWorkers:'block' });
const p = await c.newPage();
p.on('pageerror', e => console.log('PAGEERROR:', e.message));
await p.goto('http://localhost:4173/world3d', { waitUntil:'networkidle' });
await p.waitForTimeout(4500);
await p.getByRole('button', { name:'Walk left' }).click();
for (const t of [700, 1400, 2100, 3000]) {
  await p.waitForTimeout(t === 700 ? 700 : 700);
  await p.screenshot({ path:`/tmp/mv_${t}.png` });
}
await b.close();
