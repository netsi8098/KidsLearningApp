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

/**
 * Remove every texture reference from a GLB's JSON chunk, in place.
 *
 * This test measures GEOMETRY and the SKELETON — where the eye bone points
 * once the gaze is composed onto it — and has no interest in materials. It
 * cannot afford them either: the moment the lion started shipping a normal map,
 * `parseAsync` stopped resolving under jsdom and `beforeAll` timed out at ten
 * seconds, silently SKIPPING all fifteen assertions. jsdom cannot decode an
 * embedded PNG, so the image promise never settles, and a skipped test file
 * looks a lot like a passing one in a summary line.
 *
 * Stripping the references rather than raising the timeout, because waiting
 * longer for something that will never resolve is not a fix, and a test that
 * quietly depends on the material stack is a test that breaks again the next
 * time the material stack changes.
 */
function stripTextures(ab: ArrayBuffer): ArrayBuffer {
  const dv = new DataView(ab);
  const jsonLen = dv.getUint32(12, true);
  const jsonBytes = new Uint8Array(ab, 20, jsonLen);
  const json = JSON.parse(new TextDecoder().decode(jsonBytes));
  delete json.images;
  delete json.textures;
  delete json.samplers;
  for (const m of json.materials ?? []) {
    delete m.normalTexture;
    delete m.occlusionTexture;
    delete m.emissiveTexture;
    if (m.pbrMetallicRoughness) {
      delete m.pbrMetallicRoughness.baseColorTexture;
      delete m.pbrMetallicRoughness.metallicRoughnessTexture;
    }
  }
  /* Re-encode, padded to 4 bytes with spaces as the glTF spec requires, and
     kept the SAME LENGTH OR SHORTER so the binary chunk's offsets stay valid —
     only keys are removed, so it always is. */
  let out = new TextEncoder().encode(JSON.stringify(json));
  const pad = (4 - (out.length % 4)) % 4;
  if (pad) {
    const padded = new Uint8Array(out.length + pad);
    padded.set(out);
    padded.fill(0x20, out.length);
    out = padded;
  }
  const tail = new Uint8Array(ab, 20 + jsonLen);
  const total = 20 + out.length + tail.length;
  const res = new ArrayBuffer(total);
  const u8 = new Uint8Array(res);
  u8.set(new Uint8Array(ab, 0, 20));
  u8.set(out, 20);
  u8.set(tail, 20 + out.length);
  const rv = new DataView(res);
  rv.setUint32(8, total, true);      // total GLB length
  rv.setUint32(12, out.length, true); // JSON chunk length
  return res;
}

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
  const gltf = await loader.parseAsync(stripTextures(ab), '');
  scene = gltf.scene;
}, 30000);

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

/** A brain told where its eyes are, the way the runtime tells it. */
function brainAt(x: number, z: number, yaw: number) {
  const rig = rigAt(x, z, yaw);
  const brain = new LionBrain({ cx: 0, cz: 0, r: 4 });
  brain.x = x;
  brain.z = z;
  brain.yaw = yaw;
  const mid = new THREE.Vector3()
    .setFromMatrixPosition(rig.eyes[0].bone.matrixWorld)
    .add(new THREE.Vector3().setFromMatrixPosition(rig.eyes[1].bone.matrixWorld))
    .multiplyScalar(0.5);
  brain.setEyeHeight(mid.y - GROUND_Y);
  brain.setGroundY(GROUND_Y);
  brain.setEyeOffset(mid.clone().sub(rig.group.position)
    .dot(new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw))));
  return brain;
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

  const MARKERS = [
    ['TitleZone', { x: 0, y: -0.30, z: 2.05 }, false],
    ['CardShelfZone', { x: 0, y: -0.32, z: 4.60 }, true],
    ['CardShelfZoneHero', { x: 0, y: 0.40, z: 1.55 }, false],
    ['LionGreeting', { x: 0, y: 0.44, z: 0.55 }, false],
    ['TitleZoneHero', { x: 0, y: 2.58, z: 0.30 }, false],
  ] as const;

  /* THE SCENE'S OWN MARKERS, at the spawn, as one table — because the numbers
     are the argument.

     `build_home_environment.py` calls MARK_TitleZone and MARK_CardShelfZone
     "DOM zones: not rendered, but they keep the 3D composition honest about
     where React will place the title and the card row", and the hero pair are
     "title in the sky above the lion, cards on the near slope". Their heights
     are SCREEN COMPOSITION, not places anything physically is: the title zone
     sits 0.30 below the island top, the card shelf 0.30 above the WATER, and
     the hero title 2.12 m up in the air. `MARK_LionGreeting` is a floor
     position to walk to.

     Feeding all of them to the gaze as world points is what put the lion in a
     dead-eyed stare: TitleZoneHero needs 88 degrees of pitch and 180 of yaw,
     so the rig pinned everything at full deflection and held it. `canLook`
     prunes them on GEOMETRY rather than by name, so re-framing the island can
     bring one back into play without an edit here.

     |                   | pitch | in range | within the 0.85 comfort margin |
     |-------------------|-------|----------|--------------------------------|
     | TitleZone         | -43.6 | yes, 99% | no                             |
     | CardShelfZone     | -21.1 | yes      | YES — the storyboard's beat    |
     | CardShelfZoneHero | -37.5 | yes, 85% | no                             |
     | LionGreeting      | -77.4 | no       | no                             |
     | TitleZoneHero     | +87.6 | no       | no                             |

     Which leaves the card shelf as the one ambient target, and that is the
     right answer rather than a shortfall: it is the only one of the five that
     is both a place in the world and a place the lion can look without
     cranking its neck to the stop. */
  it.each(MARKERS)('MARK_%s: ambient = %o -> %s', (_name, t, ambient) => {
    const brain = brainAt(0, -0.42, 0);
    expect(brain.canLook(t)).toBe(ambient);
    if (ambient) {
      // Picked, so it had better actually land.
      expect(aim(t).errDeg).toBeLessThan(AIM_TOL);
    }
  });

  /* Rejection has two different causes and they are worth keeping apart: a
     target the rig physically cannot reach, and one it can only reach at full
     crank. Asserting both stops the table above from going quietly vacuous. */
  it.each([
    ['TitleZone', { x: 0, y: -0.30, z: 2.05 }, true],
    ['CardShelfZoneHero', { x: 0, y: 0.40, z: 1.55 }, true],
    ['LionGreeting', { x: 0, y: 0.44, z: 0.55 }, false],
    ['TitleZoneHero', { x: 0, y: 2.58, z: 0.30 }, false],
  ] as const)('MARK_%s is in range at full crank: %o', (_name, t, inRange) => {
    const brain = brainAt(0, -0.42, 0);
    expect(brain.canLook(t, 1.0)).toBe(inRange);
    // And when it IS in range, the aim lands — the clamp is what costs, not
    // the arithmetic.
    if (inRange) expect(aim(t).errDeg).toBeLessThan(AIM_TOL);
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
