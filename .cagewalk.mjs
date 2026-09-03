import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--enable-unsafe-swiftshader','--use-gl=angle'] });
const c = await b.newContext({ viewport:{width:1100,height:700}, serviceWorkers:'block' });
const p = await c.newPage();
const errs=[]; p.on('pageerror', e=>errs.push(e.message));
p.on('console', m=>{ if(m.type()==='error' && !/ERR_NAME_NOT_RESOLVED/.test(m.text())) errs.push('C: '+m.text().slice(0,180)); });
await p.goto('http://localhost:4173/world3d?mesh=cage', { waitUntil:'networkidle' });
await p.waitForTimeout(7000);
const hud = await p.locator('[data-testid="world3d-hud"]').innerText().catch(()=>'(none)');
console.log(hud.split('\n').filter(l=>/height|floor|clips|draw|triangles/.test(l)).join('\n'));
const loco = await p.evaluate(()=>fetch('/assets/lion/cage/locomotion.json').then(r=>r.json()).catch(()=>null));
console.log('cage locomotion:', loco && `stride ${loco.strideModelUnits} cycle ${loco.cycleSeconds} slide ${loco.measuredSupportSlideMm}mm`);
await p.getByRole('button', { name:'Hide HUD' }).click();
await p.getByRole('button', { name:'Walk', exact:true }).click();
for (let i=0;i<6;i++){ await p.waitForTimeout(250); await p.screenshot({ path:`/tmp/cw_${i}.png` }); }
console.log('errors:', errs.length?errs.slice(0,3).join(' | '):'none');
await b.close();
