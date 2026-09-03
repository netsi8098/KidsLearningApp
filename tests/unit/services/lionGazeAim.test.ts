/**
 * Does the eye bone actually POINT at the thing?
 *
 * Every other gaze number is something the runtime decided. `lionBrainGaze`
 * proves the eye/head split is divided correctly, and it would pass just as
 * happily if the angles were written onto the wrong axis, in the wrong frame,
 * or on top of a rest rotation they had erased. That is not hypothetical — it
 * is what happened: the eye bones' rest rotation is a -42.6 degree tilt about
 * local X, the first driving code lerped `rotation.x` toward an ABSOLUTE
 * pitch, and both eyes swung 42.6 degrees off on the first frame the gaze ran
 * while the HUD kept printing the requested angle and looking correct.
 *
 * So this test loads the SHIPPED GLB, applies the same composition the runtime
 * applies, and measures the angle between the eye bone's world forward and the
 * direction from that eye to the target. It is the one assertion in the suite
 * that can disagree with what the code intended.
 *
 * The rig is left at REST here — no mixer, no clip — which is the same
 * condition `review_render.py` poses for its gaze sheet. A clip that animates
 * `head` moves the eyes with it and is a separate concern.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { beforeAll, describe, expect, it } from 'vitest';
import { GAZE_LIMIT, HEAD_ASSIST_YAW, LionBrain, NECK_SHARE } from '../../../src/components/homepage/world3d/lionBrain';

const GLB = resolve(__dirname, '../../../public/assets/lion/cage/lion.glb');
const DEG = 180 / Math.PI;
/** Same as the runtime's, so the scale and the eye height match the app. */
const LION_TARGET_HEIGHT = 1.3;
/** The lion stands on the island, not at the origin — MARK_LionSpawn's y. */
const GROUND_Y = 0.45;
/**
 * How wide of the target the aim is allowed to land, in degrees.
 *
 * Measured, not picked. A gaze inside the eyes' own range lands EXACTLY on the
 * target (under a thousandth of a degree), and so does one on a lion that has
 * turned. The residual appears only when the head assist is recruited: the
 * bearing is computed from where the eyes are before the assist runs, and the
 * assist then swings them a few centimetres round the neck, which moves the
 * target's bearing by ~1.4 degrees at 4.5 m. Closing that loop would need a
 * second solve per frame for a error smaller than the eye's own highlight.
 *
 * It is still a tight enough bound to catch what actually went wrong here: an
 * inverted pitch sign read 11.7 degrees, and yawing the head about its own
 * inclined Z instead of world up read 8.6.
 */
const AIM_TOL = 1.5;

let scene: THREE.Object3D;

beforeAll(async () => {
  const buf = readFileSync(GLB);
  const loader = new GLTFLoader();
  /* Copied into a fresh ArrayBuffer rather than handed the Buffer's own.
     Under jsdom, `readFileSync`'s Buffer carries an ArrayBuffer from Node's
     realm, GLTFLoader's `data instanceof ArrayBuffer` sees jsdom's
     constructor and fails, and the GLB is then misread as JSON — reported as
     the thoroughly misleading "Unsupported asset. glTF versions >=2.0 are
     supported". Allocating here makes the constructor match. */
  const ab = new ArrayBuffer(buf.byteLength);
  new Uint8Array(ab).set(buf);
  const gltf = await loader.parseAsync(ab, '');
  scene = gltf.scene;
});

/**
 * The runtime's own arrangement: a group holding the scaled model, rotated by
 * PI because the character is modelled facing +Y and the glTF Y-up conversion
 * turns that away from the camera.
 */
function rigAt(x: number, z: number, yaw: number) {
  const model = scene.clone(true);
  const box = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  box.getSize(size);
  const scale = LION_TARGET_HEIGHT / size.y;
  model.scale.setScalar(scale);
  model.updateMatrixWorld(true);

  const group = new THREE.Group();
  group.add(model);
  group.position.set(x, GROUND_Y - box.min.y * scale, z);
  group.rotation.y = Math.PI + yaw;
  group.updateMatrixWorld(true);

  const eyes = ['eye_L', 'eye_R'].map((n) => {
    const bone = model.getObjectByName(n);
    if (!bone) throw new Error(`${n} missing from the GLB`);
    return { bone, rest: bone.quaternion.clone() };
  });
  const neck = ['neck_01', 'head'].map((n) => {
    const bone = model.getObjectByName(n);
    if (!bone) throw new Error(`${n} missing from the GLB`);
    return bone;
  });
  return { group, model, scale, minY: box.min.y * scale, eyes, neck };
}

/** Aim the rig with the brain, exactly as `HomeWorld3D` does each frame. */
function aim(target: { x: number; y: number; z: number }, x = 0, z = -0.42, yaw = 0) {
  const rig = rigAt(x, z, yaw);
  const brain = new LionBrain({ cx: 0, cz: 0, r: 4 });
  brain.x = x;
  brain.z = z;
  brain.yaw = yaw;

  /* Where the eyes are, measured off the asset — not assumed — and from the
     MIDPOINT of the pair so the lateral offset cancels. */
  const mid = new THREE.Vector3()
    .setFromMatrixPosition(rig.eyes[0].bone.matrixWorld)
    .add(new THREE.Vector3().setFromMatrixPosition(rig.eyes[1].bone.matrixWorld))
    .multiplyScalar(0.5);
  brain.setEyeHeight(mid.y - GROUND_Y);
  brain.setGroundY(GROUND_Y);
  brain.setEyeOffset(mid.clone().sub(rig.group.position)
    .dot(new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw))));

  brain.lookAt(target.x, target.z, target.y);
  const split = brain.gazeSplit;

  // Eyes: rest * delta. Local Z is yaw, local X is pitch, both 1:1.
  const e = new THREE.Euler(split.eyes.pitch, 0, split.eyes.yaw);
  const q = new THREE.Quaternion().setFromEuler(e);
  rig.eyes.forEach((eye) => eye.bone.quaternion.copy(eye.rest).multiply(q));

  /* Head assist, composed onto what the bone already carries. Yaw goes about
     WORLD UP expressed in the bone's own frame — `neck_01` and `head` are
     inclined, so their local Z is part yaw and part roll. */
  const assistYaw = split.neck.yaw + split.head.yaw;
  const assistPitch = split.neck.pitch + split.head.pitch;
  rig.group.updateMatrixWorld(true);
  rig.neck.forEach((bone, i) => {
    const share = i === 0 ? NECK_SHARE : 1 - NECK_SHARE;
    const up = new THREE.Vector3(0, 1, 0)
      .applyQuaternion(bone.getWorldQuaternion(new THREE.Quaternion()).invert())
      .normalize();
    bone.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(up, assistYaw * share));
    bone.quaternion.multiply(new THREE.Quaternion()
      .setFromAxisAngle(new THREE.Vector3(1, 0, 0), assistPitch * share));
    rig.group.updateMatrixWorld(true);
  });

  rig.group.updateMatrixWorld(true);

  const bone = rig.eyes[0].bone;
  const eyeWorld = new THREE.Vector3()
    .setFromMatrixPosition(bone.matrixWorld)
    .add(new THREE.Vector3().setFromMatrixPosition(rig.eyes[1].bone.matrixWorld))
    .multiplyScalar(0.5);
  const fwd = new THREE.Vector3(0, 1, 0).transformDirection(bone.matrixWorld);
  const want = new THREE.Vector3(target.x, target.y, target.z).sub(eyeWorld).normalize();
  return {
    errDeg: fwd.angleTo(want) * DEG,
    split,
    eyeWorld,
    wantYaw: brain.gazeWantYaw * DEG,
  };
}

describe('lion gaze aim, measured off the shipped GLB', () => {
  it('resolves the eye bones and their rest rotation is NOT identity', () => {
    const rig = rigAt(0, 0, 0);
    expect(rig.eyes).toHaveLength(2);
    // If this ever becomes identity the rig was re-authored, and the
    // `rest * delta` composition below is no longer load-bearing — but it is
    // also no longer wrong, so the test still holds.
    const angle = 2 * Math.asin(Math.min(1, rig.eyes[0].rest.length() > 0
      ? Math.hypot(rig.eyes[0].rest.x, rig.eyes[0].rest.y, rig.eyes[0].rest.z) : 0)) * DEG;
    expect(angle).toBeGreaterThan(30);
  });

  it('points the eye at a target it can reach', () => {
    // The card shelf: straight ahead and a little below the eye line.
    const { errDeg, split } = aim({ x: 0, y: 0.4 + GROUND_Y, z: 4.6 });
    expect(Math.abs(split.eyes.yaw)).toBeLessThan(GAZE_LIMIT);
    // ~1 degree is honest parallax: the brain aims from the body origin and
    // this measures from the left eye, 95 mm off-centre.
    expect(errDeg).toBeLessThan(AIM_TOL);
  });

  it('points the eye at a target 40 degrees off, which needs the head', () => {
    const a = 40 / DEG;
    const { errDeg, split, wantYaw } = aim({
      x: Math.sin(a) * 4.5, y: 0.85 + GROUND_Y, z: Math.cos(a) * 4.5 - 0.42,
    });
    expect(Math.abs(wantYaw)).toBeGreaterThan(GAZE_LIMIT * DEG);
    expect(Math.abs(split.eyes.yaw)).toBeCloseTo(GAZE_LIMIT, 4);
    expect(errDeg).toBeLessThan(AIM_TOL);
  });

  it('is short by exactly the overshoot when the target is past the rig', () => {
    const a = 100 / DEG;
    const { errDeg, wantYaw } = aim({
      x: Math.sin(a) * 4.5, y: 0.85 + GROUND_Y, z: Math.cos(a) * 4.5 - 0.42,
    });
    const reach = (GAZE_LIMIT + HEAD_ASSIST_YAW) * DEG;
    const overshoot = Math.abs(wantYaw) - reach;
    expect(overshoot).toBeGreaterThan(0);
    // Short, but short by the amount the rig is missing rather than by more.
    expect(errDeg).toBeGreaterThan(overshoot - AIM_TOL);
    expect(errDeg).toBeLessThan(overshoot + AIM_TOL);
  });

  it('follows the body when the lion has turned', () => {
    // Same world target, lion rotated 50 degrees: the gaze is relative to the
    // body's facing, so turning the lion toward the target should REDUCE what
    // the eyes have to do, and the aim must still land.
    const t = { x: 3.0, y: 0.85 + GROUND_Y, z: 3.0 };
    const straight = aim(t, 0, -0.42, 0);
    const turned = aim(t, 0, -0.42, 40 / DEG);
    expect(Math.abs(turned.wantYaw)).toBeLessThan(Math.abs(straight.wantYaw));
    expect(turned.errDeg).toBeLessThan(AIM_TOL);
  });

  it('leaves the eyes on their rest aim when there is no target', () => {
    const rig = rigAt(0, -0.42, 0);
    rig.group.updateMatrixWorld(true);
    const bone = rig.eyes[0].bone;
    const fwd = new THREE.Vector3(0, 1, 0).transformDirection(bone.matrixWorld);
    // Modelled facing +Y, rotated by PI: the rest gaze looks down +Z.
    expect(fwd.z).toBeGreaterThan(0.9);
    expect(Math.abs(fwd.x)).toBeLessThan(0.1);
  });
});
