/**
 * Video ID audit — finds dead/unavailable YouTube entries.
 *
 * Checks each id via YouTube's oEmbed endpoint, which is authoritative about
 * availability (a 404 there means removed/private/never-existed). Thumbnail
 * 404s alone are a weaker signal, so both are reported.
 *
 * Usage: node scripts/audit-video-ids.mjs
 * Never invents replacement ids — it only reports what is broken.
 */
import { readFileSync } from 'fs';

const files = ['src/data/videoConfig.ts', 'src/data/lessonsData.ts'];
const entries = [];

for (const file of files) {
  const src = readFileSync(file, 'utf8');
  const re = /\{[^{}]*?\bid:\s*'([A-Za-z0-9_-]{11})'[^{}]*?\}/gs;
  let m;
  while ((m = re.exec(src))) {
    const block = m[0];
    const title = /title:\s*'([^']*)'/.exec(block)?.[1] ?? '(untitled)';
    const category = /category:\s*'([^']*)'/.exec(block)?.[1] ?? '(none)';
    const channel = /channel:\s*'([^']*)'/.exec(block)?.[1] ?? '(none)';
    entries.push({ id: m[1], title, category, channel, file });
  }
}

const seen = new Map();
for (const e of entries) if (!seen.has(e.id)) seen.set(e.id, e);
const unique = [...seen.values()];

console.log(`Auditing ${unique.length} unique video ids (${entries.length} entries)\n`);

const check = async (e) => {
  const oembed = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${e.id}&format=json`;
  const thumb = `https://img.youtube.com/vi/${e.id}/mqdefault.jpg`;
  let oStatus = 0, tStatus = 0;
  try { oStatus = (await fetch(oembed)).status; } catch { oStatus = -1; }
  try { tStatus = (await fetch(thumb, { method: 'GET' })).status; } catch { tStatus = -1; }
  return { ...e, oStatus, tStatus, alive: oStatus === 200 };
};

const results = [];
for (let i = 0; i < unique.length; i += 6) {
  results.push(...await Promise.all(unique.slice(i, i + 6).map(check)));
}

const dead = results.filter((r) => !r.alive);
const alive = results.filter((r) => r.alive);

console.log(`ALIVE: ${alive.length}    DEAD: ${dead.length}\n`);
if (dead.length) {
  console.log('DEAD / UNAVAILABLE IDS');
  console.log('─'.repeat(96));
  for (const d of dead) {
    console.log(`  ${d.id}  oembed=${d.oStatus} thumb=${d.tStatus}`);
    console.log(`     title:    ${d.title}`);
    console.log(`     category: ${d.category}   channel: ${d.channel}`);
    console.log(`     file:     ${d.file}`);
  }
  console.log('\nAffected categories (rails):');
  const byCat = {};
  for (const d of dead) (byCat[d.category] ||= []).push(d.id);
  for (const [c, ids] of Object.entries(byCat)) console.log(`  ${c}: ${ids.length} dead — ${ids.join(', ')}`);
}
if (alive.length) {
  console.log('\nSTILL GOOD:');
  for (const a of alive) console.log(`  ${a.id}  ${a.title}`);
}
