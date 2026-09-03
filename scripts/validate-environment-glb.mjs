/**
 * validate-environment-glb.mjs — verify the exported world, not the .blend.
 *
 * Blender's viewport is not the deliverable. This parses the GLB itself and
 * asserts the contract the runtime depends on: the marker nodes exist, the
 * approved camera survived, and the asset stays inside its budgets.
 *
 * Deliberately dependency-free — it reads the GLB container and JSON chunk
 * directly, matching the approach already used by validate-lion-glb.mjs.
 *
 * Usage:
 *   node scripts/validate-environment-glb.mjs
 *   node scripts/validate-environment-glb.mjs path/to/other.glb
 */
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const assetPath = resolve(
  root,
  process.argv[2] || 'public/assets/worlds/river-garden/home_environment.glb',
);

const REQUIRED_MARKERS = [
  'MARK_LionSpawn', 'MARK_LionGreeting', 'MARK_WalkLeft', 'MARK_WalkRight',
  'MARK_SpeechAnchor', 'MARK_CameraTarget', 'MARK_TitleZone', 'MARK_CardShelfZone',
];
const REQUIRED_CAMERA = 'CAM_Home_Main';

// Budgets for the SHIPPED asset. These are stricter than the Blender-side
// numbers because the browser pays for draw calls and bytes, not for objects.
const MAX_MB = 3.5;
const MAX_TRIS = 95_000;
const MAX_MATERIALS = 32;
/** Each primitive is a draw call. This is the number that actually costs FPS. */
const MAX_PRIMITIVES = 700;

const failures = [];
const passes = [];
const notes = [];
const ok = (cond, msg, detail = '') =>
  cond ? passes.push(msg) : failures.push(`${msg}${detail ? ` — ${detail}` : ''}`);

let bytes;
try {
  bytes = await readFile(assetPath);
} catch {
  console.error(`\nEnvironment GLB validation failed: asset not found at ${assetPath}`);
  console.error('  Run: npm run env:export');
  process.exit(1);
}

// ── Container ───────────────────────────────────────────────────────────────
ok(bytes.length > 20 && bytes.readUInt32LE(0) === 0x46546c67, 'file is a binary glTF (GLB)');
ok(bytes.readUInt32LE(4) === 2, 'GLB container version is 2', `found ${bytes.readUInt32LE(4)}`);

let json = null;
let binLength = 0;
let offset = 12;
while (offset + 8 <= bytes.length) {
  const length = bytes.readUInt32LE(offset);
  const type = bytes.readUInt32LE(offset + 4);
  const start = offset + 8;
  if (type === 0x4e4f534a) json = JSON.parse(bytes.subarray(start, start + length).toString('utf8'));
  if (type === 0x004e4942) binLength = length;
  offset = start + length + ((4 - (length % 4)) % 4);
}
ok(json !== null, 'GLB contains a JSON chunk');
if (!json) {
  console.error('cannot continue without the JSON chunk');
  process.exit(1);
}

// ── Contract ────────────────────────────────────────────────────────────────
const nodeNames = new Set((json.nodes || []).map((n) => n.name).filter(Boolean));
for (const marker of REQUIRED_MARKERS) {
  ok(nodeNames.has(marker), `marker node survived export: ${marker}`);
}

const cameraNode = (json.nodes || []).find((n) => n.name === REQUIRED_CAMERA);
ok(Boolean(cameraNode), `camera node survived export: ${REQUIRED_CAMERA}`);
ok(Array.isArray(json.cameras) && json.cameras.length > 0, 'GLB declares at least one camera');
if (json.cameras?.length) {
  const persp = json.cameras.find((c) => c.type === 'perspective');
  ok(Boolean(persp), 'camera is perspective (matches the approved 40mm framing)');
  if (persp) {
    // 40mm on a 36mm sensor ≈ 2*atan(18/40) ≈ 0.8455 rad vertical-ish; Blender
    // exports yfov derived from the sensor fit, so allow a generous window and
    // simply assert it is a plausible mid lens rather than wide or telephoto.
    const yfov = persp.perspective?.yfov ?? 0;
    ok(yfov > 0.35 && yfov < 0.95, 'camera yfov is a mid lens', `yfov=${yfov.toFixed(3)}`);
  }
}

// ── Budgets ─────────────────────────────────────────────────────────────────
const mb = bytes.length / 1048576;
ok(mb <= MAX_MB, `GLB size within budget (${mb.toFixed(2)}MB <= ${MAX_MB}MB)`);

const materialCount = (json.materials || []).length;
ok(materialCount <= MAX_MATERIALS, `material budget (${materialCount} <= ${MAX_MATERIALS})`);

// Primitives are the real draw-call count.
let primitives = 0;
for (const mesh of json.meshes || []) primitives += (mesh.primitives || []).length;
ok(primitives <= MAX_PRIMITIVES, `draw-call budget (${primitives} primitives <= ${MAX_PRIMITIVES})`);

// Triangles, counted from indexed accessors.
let tris = 0;
for (const mesh of json.meshes || []) {
  for (const prim of mesh.primitives || []) {
    if (prim.indices == null) continue;
    const acc = json.accessors?.[prim.indices];
    if (acc?.count) tris += acc.count / 3;
  }
}
ok(tris <= MAX_TRIS, `triangle budget (${Math.round(tris)} <= ${MAX_TRIS})`);

// ── Integrity ───────────────────────────────────────────────────────────────
const externalImages = (json.images || []).filter((i) => i.uri && !i.uri.startsWith('data:'));
ok(externalImages.length === 0, 'no external texture references (GLB is self-contained)',
  externalImages.map((i) => i.uri).join(', '));
ok(binLength > 0, 'GLB contains a binary chunk');

const badMaterials = (json.materials || []).filter(
  (m) => !m.pbrMetallicRoughness && !m.extensions,
);
ok(badMaterials.length === 0, 'every material exports as glTF PBR',
  badMaterials.map((m) => m.name).join(', '));

// ── Informational ───────────────────────────────────────────────────────────
notes.push(`nodes: ${(json.nodes || []).length}`);
notes.push(`meshes: ${(json.meshes || []).length}`);
notes.push(`primitives (draw calls): ${primitives}`);
notes.push(`triangles: ${Math.round(tris)}`);
notes.push(`materials: ${materialCount}`);
notes.push(`images: ${(json.images || []).length}`);
notes.push(`size: ${mb.toFixed(2)}MB (bin ${(binLength / 1048576).toFixed(2)}MB)`);

console.log('\n===ENV_GLB_VALIDATE===');
for (const p of passes) console.log(`  ok   ${p}`);
for (const f of failures) console.log(`  FAIL ${f}`);
console.log('  ---');
for (const n of notes) console.log(`  info ${n}`);
console.log(`RESULT: ${passes.length} passed, ${failures.length} failed`);
console.log('===ENV_GLB_VALIDATE_END===');

if (failures.length) process.exit(1);
