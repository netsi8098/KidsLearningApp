import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--enable-unsafe-swiftshader','--use-gl=angle'] });
const c = await b.newContext({ viewport:{width:1280,height:900}, serviceWorkers:'block' });
await c.addInitScript(() => localStorage.setItem('klf-homepage-theme','river-garden-3d'));
const p = await c.newPage();
await p.goto('http://localhost:4173/', { waitUntil:'networkidle' });
await p.waitForTimeout(6000);
const boxes = await p.evaluate(() => {
  const out = {};
  document.querySelectorAll('[style*="left:"][style*="top:"]').forEach((el, i) => {
    const r = el.getBoundingClientRect();
    out['slot'+i] = { style: el.getAttribute('style'), top: Math.round(r.top), h: Math.round(r.height), text: (el.textContent||'').slice(0,40) };
  });
  return out;
});
console.log(JSON.stringify(boxes, null, 1).slice(0, 1800));
await b.close();
