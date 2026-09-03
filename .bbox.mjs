import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--enable-unsafe-swiftshader','--use-gl=angle'] });
for (const mesh of ['cage','']) {
  const c = await b.newContext({ viewport:{width:900,height:600}, serviceWorkers:'block' });
  const p = await c.newPage();
  p.on('console', m => { if (m.text().startsWith('[BBOX]')) console.log(mesh||'proxy', '::', m.text()); });
  await p.goto(`http://localhost:4173/world3d${mesh?'?mesh='+mesh:''}`, { waitUntil:'networkidle' });
  await p.waitForTimeout(6000);
  await c.close();
}
await b.close();
