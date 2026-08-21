import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--enable-unsafe-swiftshader','--use-gl=angle'] });
const c = await b.newContext({ viewport:{width:1100,height:700}, serviceWorkers:'block' });
const p = await c.newPage();
await p.goto('http://localhost:4173/world3d', { waitUntil:'networkidle' });
await p.waitForTimeout(5000);
await p.getByRole('button', { name:'Hide HUD' }).click();
await p.getByRole('button', { name:'Walk', exact:true }).click();
for (let i=0;i<6;i++){ await p.waitForTimeout(330); await p.screenshot({ path:`/tmp/w_${i}.png` }); }
await b.close();
