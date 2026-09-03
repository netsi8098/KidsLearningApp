import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--enable-unsafe-swiftshader','--use-gl=angle'] });
const c = await b.newContext({ viewport:{width:1100,height:700}, serviceWorkers:'block' });
const p = await c.newPage();
const errs=[]; p.on('pageerror', e=>errs.push(e.message));
await p.goto('http://localhost:4173/world3d', { waitUntil:'networkidle' });
await p.waitForTimeout(5500);
const loco = await p.evaluate(() => fetch('/assets/lion/rigged/locomotion.json').then(r=>r.json()).catch(()=>null));
console.log('locomotion.json served:', JSON.stringify(loco && {stride:loco.strideModelUnits, cycle:loco.cycleSeconds}));
await p.getByRole('button', { name:'Hide HUD' }).click();
await p.getByRole('button', { name:'Walk left' }).click();
for (const t of [0,1,2,3]) { await p.waitForTimeout(900); await p.screenshot({ path:`/tmp/lw_${t}.png` }); }
console.log('errors:', errs.length ? errs.slice(0,2).join(' | ') : 'none');
await b.close();
