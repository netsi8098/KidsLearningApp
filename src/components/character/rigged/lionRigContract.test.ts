import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { inspectLionRig, LION_RIG_CONTRACT } from './lionRigContract';

function makeValidRig() {
  const scene = new THREE.Group();
  const bones = new Map<string, THREE.Bone>();

  LION_RIG_CONTRACT.bones.forEach(({ name }) => {
    const bone = new THREE.Bone();
    bone.name = name;
    bones.set(name, bone);
  });
  LION_RIG_CONTRACT.bones.forEach(({ name, parent }) => {
    const bone = bones.get(name)!;
    if (parent) bones.get(parent)!.add(bone);
    else scene.add(bone);
  });

  const mesh = new THREE.SkinnedMesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial());
  mesh.name = 'lion_body';
  mesh.morphTargetDictionary = Object.fromEntries(
    LION_RIG_CONTRACT.morphTargets.map((name, index) => [name, index]),
  );
  mesh.morphTargetInfluences = LION_RIG_CONTRACT.morphTargets.map(() => 0);
  scene.add(mesh);

  const clips = LION_RIG_CONTRACT.clips.map((name) => new THREE.AnimationClip(name, 1, []));
  return { scene, clips };
}

describe('lion rig contract', () => {
  it('rejects an empty scene with actionable missing requirements', () => {
    const report = inspectLionRig(new THREE.Group(), []);
    expect(report.valid).toBe(false);
    expect(report.skinnedMeshCount).toBe(0);
    expect(report.missingBones).toHaveLength(LION_RIG_CONTRACT.bones.length);
    expect(report.missingClips).toEqual(LION_RIG_CONTRACT.clips);
    expect(report.missingMorphTargets).toEqual(LION_RIG_CONTRACT.morphTargets);
  });

  it('accepts a skinned hierarchy with the required clips and facial morphs', () => {
    const { scene, clips } = makeValidRig();
    expect(inspectLionRig(scene, clips)).toMatchObject({
      valid: true,
      skinnedMeshCount: 1,
      missingBones: [],
      wrongBoneParents: [],
      missingClips: [],
      missingMorphTargets: [],
      problems: [],
    });
  });
});
