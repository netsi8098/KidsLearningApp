import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--enable-unsafe-swiftshader','--use-gl=angle'] });
const c = await b.newContext({ viewport:{width:1280,height:900}, serviceWorkers:'block' });
await c.addInitScript(() => localStorage.setItem('klf-homepage-theme','river-garden-3d'));
const p = await c.newPage();
await p.goto('http://localhost:4173/', { waitUntil:'networkidle' });
await p.waitForTimeout(5000);
for (let i=0;i<4;i++){ await p.screenshot({path:`/tmp/hp_${i}.png`}); await p.waitForTimeout(5500); }
await b.close();
