import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--enable-unsafe-swiftshader','--use-gl=angle'] });

// 1. Desktop hero
let c = await b.newContext({ viewport:{width:1280,height:900}, serviceWorkers:'block' });
await c.addInitScript(() => localStorage.setItem('klf-homepage-theme','river-garden-3d'));
let p = await c.newPage();
await p.goto('http://localhost:4173/', { waitUntil:'networkidle' });
await p.waitForTimeout(6000);
await p.screenshot({ path:'/tmp/v_desktop.png' });
console.log('desktop canvas:', await p.locator('canvas').count());
console.log('desktop New Player clickable:', await p.getByText('New Player').isVisible());
await c.close();

// 2. Mobile
c = await b.newContext({ viewport:{width:390,height:844}, deviceScaleFactor:2, isMobile:true, hasTouch:true, serviceWorkers:'block' });
await c.addInitScript(() => localStorage.setItem('klf-homepage-theme','river-garden-3d'));
p = await c.newPage();
await p.goto('http://localhost:4173/', { waitUntil:'networkidle' });
await p.waitForTimeout(6000);
await p.screenshot({ path:'/tmp/v_mobile.png' });
const hScroll = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
console.log('mobile horizontal scroll:', hScroll);
await c.close();

// 3. Fallback when WebGL is unavailable
c = await b.newContext({ viewport:{width:1280,height:900}, serviceWorkers:'block' });
await c.addInitScript(() => {
  localStorage.setItem('klf-homepage-theme','river-garden-3d');
  const orig = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (t, ...a) {
    if (String(t).startsWith('webgl')) return null;
    return orig.call(this, t, ...a);
  };
});
p = await c.newPage();
const errs = [];
p.on('pageerror', e => errs.push(e.message));
await p.goto('http://localhost:4173/', { waitUntil:'networkidle' });
await p.waitForTimeout(3500);
await p.screenshot({ path:'/tmp/v_fallback.png' });
console.log('fallback canvas count:', await p.locator('canvas').count());
console.log('fallback shows title:', await p.getByText('Kids Learning Fun').first().isVisible().catch(()=>false));
console.log('fallback errors:', errs.length ? errs.slice(0,3) : 'none');
await b.close();
