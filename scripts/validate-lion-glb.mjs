import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const projectRoot = resolve(import.meta.dirname, '..');
const contractPath = resolve(projectRoot, 'src/data/lionRigContract.json');
const contract = JSON.parse(await readFile(contractPath, 'utf8'));
const assetPath = resolve(projectRoot, process.argv[2] || `public${contract.assetPath}`);

function fail(message, details = []) {
  console.error(`\nLion GLB validation failed: ${message}`);
  details.forEach((detail) => console.error(`  - ${detail}`));
  process.exitCode = 1;
}

let bytes;
try {
  bytes = await readFile(assetPath);
} catch {
  fail(`asset not found at ${assetPath}`, [
    'Export the approved Blender lion to this exact path.',
    'Do not enable VITE_RIGGED_LION_ENABLED until this command passes.',
  ]);
  process.exit();
}

if (bytes.length < 20 || bytes.readUInt32LE(0) !== 0x46546c67) {
  fail('file is not a valid binary glTF (GLB).');
  process.exit();
}
if (bytes.readUInt32LE(4) !== 2) {
  fail(`unsupported GLB version ${bytes.readUInt32LE(4)}; version 2 is required.`);
  process.exit();
}

let json;
let offset = 12;
while (offset + 8 <= bytes.length) {
  const length = bytes.readUInt32LE(offset);
  const type = bytes.readUInt32LE(offset + 4);
  const start = offset + 8;
  const end = start + length;
  if (end > bytes.length) {
    fail('GLB contains a truncated chunk.');
    process.exit();
  }
  if (type === 0x4e4f534a) {
    json = JSON.parse(bytes.subarray(start, end).toString('utf8').replace(/\0+$/g, '').trim());
    break;
  }
  offset = end;
}

if (!json) {
  fail('GLB has no JSON chunk.');
  process.exit();
}

const nodes = json.nodes || [];
const names = new Map(nodes.map((node, index) => [node.name, index]).filter(([name]) => Boolean(name)));
const parents = new Map();
nodes.forEach((node, parentIndex) => {
  (node.children || []).forEach((childIndex) => parents.set(childIndex, parentIndex));
});

const missingBones = contract.bones.filter(({ name }) => !names.has(name)).map(({ name }) => name);
const wrongParents = contract.bones.flatMap(({ name, parent }) => {
  const index = names.get(name);
  if (index === undefined) return [];
  const parentIndex = parents.get(index);
  const actual = parentIndex === undefined ? null : nodes[parentIndex]?.name || null;
  return actual === parent ? [] : [`${name}: expected ${parent ?? 'scene root'}, received ${actual ?? 'scene root'}`];
});

const animationNames = new Set((json.animations || []).map((animation) => animation.name));
const missingClips = contract.clips.filter((name) => !animationNames.has(name));
const morphNames = new Set();
(json.meshes || []).forEach((mesh) => {
  (mesh.extras?.targetNames || []).forEach((name) => morphNames.add(name));
});
const missingMorphTargets = contract.morphTargets.filter((name) => !morphNames.has(name));
const skinnedPrimitives = (json.meshes || []).flatMap((mesh) => mesh.primitives || []).filter((primitive) => (
  primitive.attributes?.JOINTS_0 !== undefined && primitive.attributes?.WEIGHTS_0 !== undefined
));

if (!(json.skins || []).length) fail('GLB has no skin.');
if (!skinnedPrimitives.length) fail('GLB has no primitive with JOINTS_0 and WEIGHTS_0 attributes.');
if (missingBones.length) fail(`${missingBones.length} required bones are missing.`, missingBones);
if (wrongParents.length) fail(`${wrongParents.length} bones have incorrect parents.`, wrongParents);
if (missingClips.length) fail(`${missingClips.length} required clips are missing.`, missingClips);
if (missingMorphTargets.length) fail(`${missingMorphTargets.length} required facial morphs are missing.`, missingMorphTargets);

if (!process.exitCode) {
  console.log(`Lion GLB contract passed: ${assetPath}`);
  console.log(`${contract.bones.length} bones, ${contract.clips.length} clips, ${contract.morphTargets.length} morph targets.`);
}
