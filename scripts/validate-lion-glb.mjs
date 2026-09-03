import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const projectRoot = resolve(import.meta.dirname, '..');

/* TWO CHARACTERS, TWO CONTRACTS.
   `lionRigContract.json` describes the proxy; `lionCageRigContract.json` the
   production cage. The two rigs name the same anatomy differently, so only 11
   of the proxy's 45 bones ever matched the cage and the cage could not be
   validated at all. Repointing the proxy's contract would invalidate the
   character that ships in order to pass the one that does not.

   Pick with `--contract <path>`, or let the asset choose: an asset under
   `lion/cage/` is the cage. Default stays the proxy so existing callers and CI
   keep validating exactly what they validated before. */
const args = process.argv.slice(2);
const contractFlag = args.indexOf('--contract');
const explicitContract = contractFlag !== -1 ? args[contractFlag + 1] : null;
const positional = args.filter((a, i) => (
  // Guard the -1: without `--contract`, `contractFlag + 1` is 0 and this
  // filter swallowed the asset path itself, so `validate <cage.glb>` silently
  // validated the proxy and reported a pass for a file it never opened.
  !a.startsWith('--') && !(contractFlag !== -1 && i === contractFlag + 1)
));
const assetArg = positional[0] || null;

const CAGE_CONTRACT = 'src/data/lionCageRigContract.json';
const PROXY_CONTRACT = 'src/data/lionRigContract.json';
const contractRel = explicitContract
  || (assetArg && /lion[/\\]cage[/\\]/.test(assetArg) ? CAGE_CONTRACT : PROXY_CONTRACT);
const contractPath = resolve(projectRoot, contractRel);
const contract = JSON.parse(await readFile(contractPath, 'utf8'));
const assetPath = resolve(projectRoot, assetArg || `public${contract.assetPath}`);

const warnings = [];
function warn(message, details = []) {
  warnings.push([message, details]);
}

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
  let actual = parentIndex === undefined ? null : nodes[parentIndex]?.name || null;
  /* The armature object is a node too, so a bone the exporter leaves at the
     top of the skeleton parents to it rather than to the scene. Contracts
     declare that node's name and it counts as the root. */
  if (contract.armatureNode && actual === contract.armatureNode) actual = null;
  return actual === parent ? [] : [`${name}: expected ${parent ?? 'scene root'}, received ${actual ?? 'scene root'}`];
});

/* CONTROL BONES MUST BE ABSENT, and this is a real check rather than
   bookkeeping: `export_def_bones` exists because leaving IK targets and poles
   deformable once drove a long dark spike through the chest, when automatic
   weighting assigned mesh to a control bone floating in mid-air. If one
   reappears in the skin, that regression is back. */
const skinJoints = new Set(
  (json.skins || []).flatMap((skin) => (skin.joints || []).map((i) => nodes[i]?.name)),
);
const leakedControls = (contract.excludedBones || [])
  .filter(({ name }) => skinJoints.has(name))
  .map(({ name, why }) => `${name}: must never be in the skin (${why})`);

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

/* Known gaps are WARNINGS. They are tracked in the contract so they stay
   visible rather than being rediscovered, but they must not fail a build for
   work that was never claimed to be done. */
const missingPlannedBones = (contract.plannedBones || [])
  .filter(({ name }) => !names.has(name))
  .map(({ name, why }) => `${name} — ${why}`);
const missingPlannedClips = (contract.plannedClips || [])
  .filter((name) => !animationNames.has(name));

const meshCount = (json.meshes || []).length;
const overMeshes = contract.maxMeshes && meshCount > contract.maxMeshes
  ? [`${meshCount} meshes against a budget of ${contract.maxMeshes}; each is a draw call`]
  : [];
const overBytes = contract.maxBytes && bytes.length > contract.maxBytes
  ? [`${(bytes.length / 1048576).toFixed(2)} MB against a budget of ${(contract.maxBytes / 1048576).toFixed(2)} MB`]
  : [];

if (!(json.skins || []).length) fail('GLB has no skin.');
if (!skinnedPrimitives.length) fail('GLB has no primitive with JOINTS_0 and WEIGHTS_0 attributes.');
if (missingBones.length) fail(`${missingBones.length} required bones are missing.`, missingBones);
if (wrongParents.length) fail(`${wrongParents.length} bones have incorrect parents.`, wrongParents);
if (missingClips.length) fail(`${missingClips.length} required clips are missing.`, missingClips);
if (missingMorphTargets.length) fail(`${missingMorphTargets.length} required facial morphs are missing.`, missingMorphTargets);
if (leakedControls.length) fail(`${leakedControls.length} control bones leaked into the skin.`, leakedControls);
if (overMeshes.length) fail('mesh budget exceeded.', overMeshes);
if (overBytes.length) fail('size budget exceeded.', overBytes);

if (missingPlannedBones.length) warn(`${missingPlannedBones.length} planned bones not yet built`, missingPlannedBones);
if (missingPlannedClips.length) warn(`${missingPlannedClips.length} planned clips not yet authored`, missingPlannedClips);

warnings.forEach(([message, details]) => {
  console.warn(`\nNote — ${message}:`);
  details.forEach((detail) => console.warn(`  - ${detail}`));
});

if (!process.exitCode) {
  console.log(`\nLion GLB contract passed: ${assetPath}`);
  console.log(`contract: ${contractRel}${contract.describes ? ` (${contract.describes})` : ''}`);
  console.log(`${contract.bones.length} bones, ${contract.clips.length} clips, ${contract.morphTargets.length} morph targets, ${meshCount} meshes, ${(bytes.length / 1048576).toFixed(2)} MB.`);
  if ((contract.excludedBones || []).length) {
    console.log(`${contract.excludedBones.length} control bones correctly absent from the skin.`);
  }
}
