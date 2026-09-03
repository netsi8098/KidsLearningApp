import type { AnimationClip, Object3D, SkinnedMesh } from 'three';
import contractJson from '../../../data/lionRigContract.json';

interface BoneContract {
  name: string;
  parent: string | null;
}

interface LionRigContract {
  assetPath: string;
  assetVersion: number;
  forwardAxis: string;
  upAxis: string;
  groundPlane: number;
  bones: BoneContract[];
  clips: string[];
  morphTargets: string[];
}

export interface LionRigReport {
  valid: boolean;
  skinnedMeshCount: number;
  missingBones: string[];
  wrongBoneParents: Array<{ bone: string; expected: string | null; actual: string | null }>;
  missingClips: string[];
  missingMorphTargets: string[];
  problems: string[];
}

export const LION_RIG_CONTRACT = contractJson as LionRigContract;
export const RIGGED_LION_ENABLED = import.meta.env.VITE_RIGGED_LION_ENABLED === 'true';

function collectMorphTargets(root: Object3D) {
  const targets = new Set<string>();
  root.traverse((object) => {
    const mesh = object as SkinnedMesh;
    if (!mesh.isSkinnedMesh || !mesh.morphTargetDictionary) return;
    Object.keys(mesh.morphTargetDictionary).forEach((name) => targets.add(name));
  });
  return targets;
}

export function inspectLionRig(root: Object3D, animations: AnimationClip[]): LionRigReport {
  const nodes = new Map<string, Object3D>();
  let skinnedMeshCount = 0;
  root.traverse((object) => {
    if (object.name) nodes.set(object.name, object);
    if ((object as SkinnedMesh).isSkinnedMesh) skinnedMeshCount += 1;
  });

  const missingBones = LION_RIG_CONTRACT.bones
    .filter(({ name }) => !nodes.has(name))
    .map(({ name }) => name);
  const wrongBoneParents = LION_RIG_CONTRACT.bones.flatMap(({ name, parent }) => {
    const node = nodes.get(name);
    if (!node) return [];
    // GLTFLoader places every top-level glTF node under the returned scene
    // object. That wrapper can be either a Scene or Group, so compare object
    // identity instead of relying on its runtime type or exported name.
    const actual = node.parent === root ? null : node.parent?.name || null;
    return actual === parent ? [] : [{ bone: name, expected: parent, actual }];
  });
  const clipNames = new Set(animations.map(({ name }) => name));
  const missingClips = LION_RIG_CONTRACT.clips.filter((name) => !clipNames.has(name));
  const morphTargets = collectMorphTargets(root);
  const missingMorphTargets = LION_RIG_CONTRACT.morphTargets.filter((name) => !morphTargets.has(name));
  const problems = [
    ...(skinnedMeshCount > 0 ? [] : ['No SkinnedMesh exists in the GLB.']),
    ...(missingBones.length ? [`Missing ${missingBones.length} required bones.`] : []),
    ...(wrongBoneParents.length ? [`${wrongBoneParents.length} bones have incorrect parents.`] : []),
    ...(missingClips.length ? [`Missing ${missingClips.length} required animation clips.`] : []),
    ...(missingMorphTargets.length ? [`Missing ${missingMorphTargets.length} required facial morph targets.`] : []),
  ];

  return {
    valid: problems.length === 0,
    skinnedMeshCount,
    missingBones,
    wrongBoneParents,
    missingClips,
    missingMorphTargets,
    problems,
  };
}
