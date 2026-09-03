import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--enable-unsafe-swiftshader','--use-gl=angle'] });
const c = await b.newContext({ viewport:{width:1280,height:900}, serviceWorkers:'block' });
await c.addInitScript(() => localStorage.setItem('klf-homepage-theme','river-garden-3d'));
const p = await c.newPage();
const errs=[];
p.on('pageerror', e => errs.push('PAGEERROR: '+e.message));
p.on('console', m => { if (m.type()==='error') errs.push('CONSOLE: '+m.text().slice(0,160)); });
await p.goto('http://localhost:4173/', { waitUntil:'networkidle' });
await p.waitForTimeout(6000);
await p.screenshot({ path:'/tmp/home3d.png' });
// interaction: does the DOM UI still work over the 3D world?
const cards = await p.locator('button').count();
console.log('buttons on page:', cards);
console.log('canvas present:', await p.locator('canvas').count());
await p.waitForTimeout(3500);
await p.screenshot({ path:'/tmp/home3d_b.png' });
console.log(errs.length ? errs.slice(0,6).join('\n') : 'no page errors');
await b.close();
