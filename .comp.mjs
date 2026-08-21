import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--enable-unsafe-swiftshader','--use-gl=angle'] });
const sizes = { 'desktop-wide':[1920,1080], 'laptop':[1440,900], 'tablet-landscape':[1180,820], 'tablet-portrait':[820,1180] };
for (const [name,[w,h]] of Object.entries(sizes)) {
  const c = await b.newContext({ viewport:{width:w,height:h}, serviceWorkers:'block' });
  await c.addInitScript(() => localStorage.setItem('klf-homepage-theme','river-garden-3d'));
  const p = await c.newPage();
  await p.goto('http://localhost:4173/', { waitUntil:'networkidle' });
  await p.waitForTimeout(6000);
  await p.screenshot({ path:`/tmp/comp_${name}.png` });
  await c.close();
  console.log(name, 'captured');
}
await b.close();
