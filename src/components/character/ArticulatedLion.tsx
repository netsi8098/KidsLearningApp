import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { generateSimpleLipSync, getMouthShapeAtTime, type MouthShape } from '../../mascot/lipSync';
import { useMotionPreset } from '../../motion/useMotionPreset';
import type { LionPose } from '../GeneratedLion';

interface ArticulatedLionProps {
  src: string;
  pose: LionPose;
  size: number;
  lookAt?: number;
  speechText?: string;
  speechKey?: number;
  mouthKey?: number;
  onSpeechComplete?: () => void;
  className?: string;
}

const W = 1223;
const H = 1286;
const GREETING_MS = 5000;
const SPEECH_START_MS = 900;
const SPEECH_MS = 1800;

type BoneName =
  | 'root' | 'torso' | 'neck' | 'head' | 'jaw' | 'eyeL' | 'eyeR' | 'browL' | 'browR'
  | 'earL' | 'earR' | 'maneL' | 'maneTop' | 'maneR'
  | 'armUpper' | 'armLower' | 'wavePaw'
  | 'hipL' | 'kneeL' | 'ankleL' | 'pawL'
  | 'hipR' | 'kneeR' | 'ankleR' | 'pawR'
  | 'tail0' | 'tail1' | 'tail2' | 'tailTuft';

interface SpringValue { value: number; velocity: number }

interface LionRig {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.OrthographicCamera;
  mesh: THREE.SkinnedMesh;
  geometry: THREE.PlaneGeometry;
  material: THREE.MeshBasicMaterial;
  texture: THREE.Texture;
  bones: Record<BoneName, THREE.Bone>;
  springs: Record<string, SpringValue>;
  bodyMotion: { torsoX: number; torsoRotation: number };
  frame: number | null;
  lastTime: number;
  disconnect?: () => void;
}

const px = (x: number) => x - W / 2;
const py = (y: number) => H / 2 - y;
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const ellipse = (x: number, y: number, cx: number, cy: number, rx: number, ry: number) =>
  ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;

function softField(x: number, y: number, cx: number, cy: number, rx: number, ry: number, strength = 1) {
  const distance = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2;
  if (distance >= 1) return 0;
  return (1 - distance) ** 2 * strength;
}

function springStep(spring: SpringValue, target: number, dt: number, stiffness = 95, damping = 15) {
  const steps = Math.max(1, Math.ceil(dt * 120));
  const fixedDt = dt / steps;
  for (let step = 0; step < steps; step += 1) {
    const acceleration = (target - spring.value) * stiffness - spring.velocity * damping;
    spring.velocity += acceleration * fixedDt;
    spring.value += spring.velocity * fixedDt;
  }
  return spring.value;
}

function pulse(time: number, at: number, width: number) {
  const distance = Math.abs(time - at);
  if (distance >= width) return 0;
  return Math.sin((1 - distance / width) * Math.PI / 2) ** 5;
}

function smoothRange(time: number, start: number, end: number) {
  if (end <= start) return time >= end ? 1 : 0;
  const value = clamp((time - start) / (end - start), 0, 1);
  return value * value * (3 - 2 * value);
}

function envelope(time: number, attackStart: number, attackEnd: number, releaseStart: number, releaseEnd: number) {
  return smoothRange(time, attackStart, attackEnd) * (1 - smoothRange(time, releaseStart, releaseEnd));
}

function makeBone(name: BoneName, x: number, y: number, parent: THREE.Bone | null, parentX = W / 2, parentY = H / 2) {
  const bone = new THREE.Bone();
  bone.name = name;
  bone.position.set(x - parentX, parentY - y, 0);
  parent?.add(bone);
  return bone;
}

function createSkeleton() {
  const root = makeBone('root', W / 2, H / 2, null);
  const torso = makeBone('torso', 650, 850, root);
  const neck = makeBone('neck', 650, 745, torso, 650, 850);
  const head = makeBone('head', 650, 690, neck, 650, 745);
  const bones = {
    root,
    torso,
    neck,
    head,
    jaw: makeBone('jaw', 665, 515, head, 650, 690),
    eyeL: makeBone('eyeL', 555, 378, head, 650, 690),
    eyeR: makeBone('eyeR', 765, 341, head, 650, 690),
    browL: makeBone('browL', 545, 278, head, 650, 690),
    browR: makeBone('browR', 755, 242, head, 650, 690),
    earL: makeBone('earL', 420, 265, head, 650, 690),
    earR: makeBone('earR', 875, 220, head, 650, 690),
    maneL: makeBone('maneL', 380, 470, head, 650, 690),
    maneTop: makeBone('maneTop', 650, 215, head, 650, 690),
    maneR: makeBone('maneR', 900, 450, head, 650, 690),
    armUpper: makeBone('armUpper', 875, 735, torso, 650, 850),
    armLower: new THREE.Bone(),
    wavePaw: new THREE.Bone(),
    hipL: makeBone('hipL', 520, 860, torso, 650, 850),
    kneeL: new THREE.Bone(), ankleL: new THREE.Bone(), pawL: new THREE.Bone(),
    hipR: makeBone('hipR', 760, 850, torso, 650, 850),
    kneeR: new THREE.Bone(), ankleR: new THREE.Bone(), pawR: new THREE.Bone(),
    tail0: makeBone('tail0', 435, 905, torso, 650, 850),
    tail1: new THREE.Bone(), tail2: new THREE.Bone(), tailTuft: new THREE.Bone(),
  } as Record<BoneName, THREE.Bone>;

  bones.armLower.name = 'armLower';
  bones.armLower.position.set(px(1035) - px(875), py(610) - py(735), 0);
  bones.armUpper.add(bones.armLower);
  bones.wavePaw.name = 'wavePaw';
  bones.wavePaw.position.set(px(1110) - px(1035), py(515) - py(610), 0);
  bones.armLower.add(bones.wavePaw);

  const setLeg = (side: 'L' | 'R', hipX: number, hipY: number, kneeX: number, kneeY: number, ankleX: number, ankleY: number, pawX: number, pawY: number) => {
    const hip = bones[`hip${side}`];
    const knee = bones[`knee${side}`];
    const ankle = bones[`ankle${side}`];
    const paw = bones[`paw${side}`];
    knee.name = `knee${side}`;
    knee.position.set(px(kneeX) - px(hipX), py(kneeY) - py(hipY), 0);
    hip.add(knee);
    ankle.name = `ankle${side}`;
    ankle.position.set(px(ankleX) - px(kneeX), py(ankleY) - py(kneeY), 0);
    knee.add(ankle);
    paw.name = `paw${side}`;
    paw.position.set(px(pawX) - px(ankleX), py(pawY) - py(ankleY), 0);
    ankle.add(paw);
  };
  setLeg('L', 520, 860, 505, 1030, 500, 1160, 510, 1190);
  setLeg('R', 760, 850, 770, 1020, 775, 1150, 790, 1182);

  bones.tail1.name = 'tail1';
  bones.tail1.position.set(px(325) - px(435), py(920) - py(905), 0);
  bones.tail0.add(bones.tail1);
  bones.tail2.name = 'tail2';
  bones.tail2.position.set(px(255) - px(325), py(845) - py(920), 0);
  bones.tail1.add(bones.tail2);
  bones.tailTuft.name = 'tailTuft';
  bones.tailTuft.position.set(px(205) - px(255), py(760) - py(845), 0);
  bones.tail2.add(bones.tailTuft);
  return bones;
}

function normalizeWeights(entries: { index: number; weight: number }[]) {
  const top = entries.sort((a, b) => b.weight - a.weight).slice(0, 4);
  const total = top.reduce((sum, entry) => sum + entry.weight, 0) || 1;
  while (top.length < 4) top.push({ index: 0, weight: 0 });
  return { indices: top.map((entry) => entry.index), weights: top.map((entry) => entry.weight / total) };
}

function skinForPoint(x: number, y: number, boneIndex: Record<BoneName, number>) {
  const entries: { index: number; weight: number }[] = [];
  const addWeight = (name: BoneName, weight = 1) => entries.push({ index: boneIndex[name], weight });
  const addField = (name: BoneName, cx: number, cy: number, rx: number, ry: number, strength = 1) => {
    const weight = softField(x, y, cx, cy, rx, ry, strength);
    if (weight > 0.001) addWeight(name, weight);
  };

  // Each anatomical region is influenced by an overlapping chain. This mimics
  // hand-painted weights and avoids rigid seams at elbows, knees, neck and tail.
  if (x < 485 && y > 620 && y < 1070) {
    addField('tail0', 430, 900, 145, 210, 1.2);
    addField('tail1', 330, 880, 145, 205, 1.15);
    addField('tail2', 250, 800, 125, 185, 1.1);
    addField('tailTuft', 205, 755, 155, 140, 1.35);
    addField('torso', 485, 875, 135, 180, 0.16);
  } else if ((x > 805 && y > 555 && y < 930) || (x > 940 && y > 390 && y < 720)) {
    addField('armUpper', 885, 745, 180, 235, 1.25);
    addField('armLower', 1020, 625, 175, 205, 1.2);
    addField('wavePaw', 1105, 515, 165, 165, 1.45);
    addField('torso', 805, 805, 170, 210, 0.18);
  } else if (x < 650 && y > 745) {
    addField('hipL', 520, 860, 195, 205, 1.05);
    addField('kneeL', 505, 1015, 175, 190, 1.18);
    addField('ankleL', 500, 1140, 155, 150, 1.15);
    addField('pawL', 510, 1190, 205, 125, 1.35);
    addField('torso', 570, 805, 210, 170, 0.22);
  } else if (x >= 620 && x < 985 && y > 735) {
    addField('hipR', 760, 850, 205, 210, 1.05);
    addField('kneeR', 770, 1005, 180, 190, 1.18);
    addField('ankleR', 775, 1135, 160, 155, 1.15);
    addField('pawR', 790, 1182, 210, 125, 1.35);
    addField('torso', 700, 800, 220, 175, 0.22);
  } else if (ellipse(x, y, 650, 420, 455, 440)) {
    addWeight('head', 0.34);
    addField('neck', 650, 700, 255, 155, 0.5);
    addField('earL', 420, 250, 145, 130, 1.55);
    addField('earR', 875, 205, 145, 130, 1.55);
    addField('eyeL', 555, 378, 115, 120, 1.7);
    addField('eyeR', 765, 342, 115, 120, 1.7);
    addField('browL', 545, 278, 145, 75, 1.35);
    addField('browR', 755, 242, 145, 75, 1.35);
    addField('jaw', 665, 550, 210, 165, 1.25);
    addField('maneL', 380, 470, 245, 300, 0.95);
    addField('maneTop', 650, 210, 285, 190, 1.05);
    addField('maneR', 900, 450, 245, 300, 0.95);
  } else if (x > 420 && x < 880 && y > 620 && y < 875) {
    addField('head', 650, 650, 285, 205, 0.55);
    addField('neck', 650, 730, 260, 175, 1.15);
    addField('torso', 650, 825, 300, 205, 0.72);
  } else {
    addWeight('torso');
  }
  if (entries.length === 0) addWeight('torso');
  return normalizeWeights(entries);
}

function makeMorphs(geometry: THREE.PlaneGeometry) {
  const position = geometry.attributes.position as THREE.BufferAttribute;
  const base = position.array as Float32Array;
  const blinkL = new Float32Array(base);
  const blinkR = new Float32Array(base);
  const jawOpen = new Float32Array(base);
  const mouthWide = new Float32Array(base);
  const browUp = new Float32Array(base);
  const cheekLift = new Float32Array(base);
  const pawCurl = new Float32Array(base);
  for (let i = 0; i < position.count; i += 1) {
    const o = i * 3;
    const x = base[o] + W / 2;
    const y = H / 2 - base[o + 1];
    if (ellipse(x, y, 555, 378, 92, 94)) blinkL[o + 1] = py(378) + (base[o + 1] - py(378)) * 0.12;
    if (ellipse(x, y, 765, 342, 92, 94)) blinkR[o + 1] = py(342) + (base[o + 1] - py(342)) * 0.12;
    if (ellipse(x, y, 665, 550, 178, 132)) {
      const falloff = clamp(1 - Math.hypot((x - 665) / 178, (y - 550) / 132), 0, 1);
      jawOpen[o + 1] -= 64 * falloff;
      mouthWide[o] += Math.sign(x - 665) * 36 * falloff;
    }
    if (ellipse(x, y, 545, 278, 120, 58) || ellipse(x, y, 755, 242, 120, 58)) browUp[o + 1] += 20;
    for (const [cx, cy] of [[510, 500], [825, 465]]) {
      if (!ellipse(x, y, cx, cy, 98, 72)) continue;
      const falloff = clamp(1 - Math.hypot((x - cx) / 98, (y - cy) / 72), 0, 1);
      cheekLift[o] += Math.sign(x - 665) * 12 * falloff;
      cheekLift[o + 1] += 18 * falloff;
    }
    if (ellipse(x, y, 1110, 520, 145, 145)) {
      const falloff = clamp(1 - Math.hypot((x - 1110) / 145, (y - 520) / 145), 0, 1);
      pawCurl[o] -= 18 * falloff;
      pawCurl[o + 1] -= 12 * falloff;
    }
  }
  geometry.morphAttributes.position = [
    new THREE.Float32BufferAttribute(blinkL, 3),
    new THREE.Float32BufferAttribute(blinkR, 3),
    new THREE.Float32BufferAttribute(jawOpen, 3),
    new THREE.Float32BufferAttribute(mouthWide, 3),
    new THREE.Float32BufferAttribute(browUp, 3),
    new THREE.Float32BufferAttribute(cheekLift, 3),
    new THREE.Float32BufferAttribute(pawCurl, 3),
  ];
}

function buildRig(canvas: HTMLCanvasElement, texture: THREE.Texture): LionRig {
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-W / 2, W / 2, H / 2, -H / 2, -100, 100);
  camera.position.z = 10;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  const geometry = new THREE.PlaneGeometry(W, H, 64, 68);
  makeMorphs(geometry);
  const bones = createSkeleton();
  const boneList = Object.values(bones);
  const boneIndex = Object.fromEntries(boneList.map((bone, index) => [bone.name, index])) as Record<BoneName, number>;
  const positions = geometry.attributes.position as THREE.BufferAttribute;
  const skinIndices: number[] = [];
  const skinWeights: number[] = [];
  for (let i = 0; i < positions.count; i += 1) {
    const skin = skinForPoint(positions.getX(i) + W / 2, H / 2 - positions.getY(i), boneIndex);
    skinIndices.push(...skin.indices);
    skinWeights.push(...skin.weights);
  }
  geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndices, 4));
  geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeights, 4));
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, alphaTest: 0.012, side: THREE.DoubleSide });
  const mesh = new THREE.SkinnedMesh(geometry, material);
  mesh.frustumCulled = false;
  mesh.add(bones.root);
  mesh.bind(new THREE.Skeleton(boneList));
  scene.add(mesh);
  const springs: Record<string, SpringValue> = {};
  for (const key of ['tail0', 'tail1', 'tail2', 'tailTuft', 'earL', 'earR', 'maneL', 'maneTop', 'maneR', 'neck', 'head', 'eyeX', 'eyeY', 'armUpper', 'armLower', 'wavePaw', 'jawOpen', 'mouthWidth']) springs[key] = { value: 0, velocity: 0 };
  return {
    renderer,
    scene,
    camera,
    mesh,
    geometry,
    material,
    texture,
    bones,
    springs,
    bodyMotion: { torsoX: px(650), torsoRotation: 0 },
    frame: null,
    lastTime: performance.now(),
  };
}

function mixAngle(current: number, target: number, mix: number) {
  const delta = Math.atan2(Math.sin(target - current), Math.cos(target - current));
  return current + delta * clamp(mix, 0, 1);
}

function solveLeg(rig: LionRig, side: 'L' | 'R', target: THREE.Vector2, bendDirection: number, mix = 1, softness = 24) {
  const hip = rig.bones[`hip${side}`];
  const knee = rig.bones[`knee${side}`];
  const ankle = rig.bones[`ankle${side}`];
  const paw = rig.bones[`paw${side}`];
  rig.scene.updateMatrixWorld(true);
  const hipWorld = hip.getWorldPosition(new THREE.Vector3());
  const dx = target.x - hipWorld.x;
  const dy = target.y - hipWorld.y;
  const l1 = 171;
  const l2 = 131;
  const maximumReach = l1 + l2 - 2;
  const rawDistance = Math.hypot(dx, dy);
  const softStart = maximumReach - softness;
  const softenedDistance = rawDistance > softStart
    ? softStart + softness * (1 - Math.exp(-(rawDistance - softStart) / softness))
    : rawDistance;
  const distance = clamp(softenedDistance, 45, maximumReach);
  const alpha = Math.acos(clamp((l1 * l1 + distance * distance - l2 * l2) / (2 * l1 * distance), -1, 1));
  const beta = Math.acos(clamp((l1 * l1 + l2 * l2 - distance * distance) / (2 * l1 * l2), -1, 1));
  const hipTarget = Math.atan2(dy, dx) + Math.PI / 2 - bendDirection * alpha;
  const kneeTarget = bendDirection * (Math.PI - beta);
  const ankleTarget = -(hipTarget + kneeTarget) * 0.88;
  const pawTarget = -(hipTarget + kneeTarget + ankleTarget);
  hip.rotation.z = mixAngle(hip.rotation.z, clamp(hipTarget, -0.72, 0.72), mix);
  knee.rotation.z = mixAngle(knee.rotation.z, clamp(kneeTarget, -1.5, 1.5), mix);
  ankle.rotation.z = mixAngle(ankle.rotation.z, clamp(ankleTarget, -0.62, 0.62), mix);
  paw.rotation.z = mixAngle(paw.rotation.z, clamp(pawTarget, -0.3, 0.3), mix);
}

function solveWaveArm(rig: LionRig, targetX: number, targetY: number, wristTarget: number, dt: number, mix = 1) {
  const upperX = px(1035) - px(875);
  const upperY = py(610) - py(735);
  const lowerX = px(1110) - px(1035);
  const lowerY = py(515) - py(610);
  const upperLength = Math.hypot(upperX, upperY);
  const lowerLength = Math.hypot(lowerX, lowerY);
  const upperBindAngle = Math.atan2(upperY, upperX);
  const lowerBindAngle = Math.atan2(lowerY, lowerX);
  const distance = clamp(Math.hypot(targetX, targetY), Math.abs(upperLength - lowerLength) + 4, upperLength + lowerLength - 4);
  const elbowAngle = Math.acos(clamp(
    (distance * distance - upperLength * upperLength - lowerLength * lowerLength) / (2 * upperLength * lowerLength),
    -1,
    1,
  ));
  const shoulderAngle = Math.atan2(targetY, targetX) - Math.atan2(
    lowerLength * Math.sin(elbowAngle),
    upperLength + lowerLength * Math.cos(elbowAngle),
  );
  const upperTarget = shoulderAngle - upperBindAngle;
  const lowerTarget = elbowAngle - (lowerBindAngle - upperBindAngle);
  const mixedUpper = mixAngle(rig.bones.armUpper.rotation.z, clamp(upperTarget, -0.24, 0.3), mix);
  const mixedLower = mixAngle(rig.bones.armLower.rotation.z, clamp(lowerTarget, -0.28, 0.42), mix);
  rig.bones.armUpper.rotation.z = springStep(rig.springs.armUpper, mixedUpper, dt, 145, 24);
  rig.bones.armLower.rotation.z = springStep(rig.springs.armLower, mixedLower, dt, 135, 22);
  rig.bones.wavePaw.rotation.z = clamp(springStep(rig.springs.wavePaw, wristTarget, dt, 118, 17), -0.45, 0.45);
}

interface TailMotionInput {
  seconds: number;
  elapsed: number;
  greeting: boolean;
  closingTurn: number;
  reduced: boolean;
  torsoLinearVelocity: number;
  torsoAngularVelocity: number;
  dt: number;
}

function updateTail(rig: LionRig, input: TailMotionInput) {
  const { seconds, elapsed, greeting, closingTurn, reduced, torsoLinearVelocity, torsoAngularVelocity, dt } = input;
  const anticipationTuck = greeting ? -0.075 * envelope(elapsed, 260, 620, 870, 1260) : 0;
  const happyEnvelope = greeting ? envelope(elapsed, 650, 1080, 3250, 4580) : 0;
  const idleSwish = reduced
    ? 0
    : Math.sin(seconds * 1.08) * 0.078 + Math.sin(seconds * 0.43 + 1.1) * 0.032;
  const happySwish = reduced
    ? 0
    : happyEnvelope * (
      Math.sin((elapsed - 650) * 0.00425) * 0.3
      + Math.sin((elapsed - 650) * 0.0085 + 0.8) * 0.07
    );
  const bodyImpulse = reduced
    ? 0
    : clamp(-torsoAngularVelocity * 0.0075 - torsoLinearVelocity * 0.00042, -0.085, 0.085);
  // Counterbalance the late body turn, then let each downstream segment lag.
  // This is deliberately stronger than the idle swish so the motion remains
  // readable when the mascot is rendered at phone size.
  const settleCounterSwing = reduced ? 0 : closingTurn * -0.21;

  const baseTarget = clamp(idleSwish + anticipationTuck + happySwish + bodyImpulse + settleCounterSwing, -0.4, 0.4);
  const tail0 = springStep(rig.springs.tail0, baseTarget, dt, 72, 13);
  const tail1Target = clamp(
    -tail0 * 0.48 - rig.springs.tail0.velocity * 0.019
      + happyEnvelope * Math.sin((elapsed - 650) * 0.00425 + 0.52) * 0.04
      + closingTurn * 0.085,
    -0.35,
    0.35,
  );
  const tail1 = springStep(rig.springs.tail1, tail1Target, dt, 58, 10.5);
  const tail2Target = clamp(-tail1 * 0.58 - rig.springs.tail1.velocity * 0.025 - closingTurn * 0.045, -0.32, 0.32);
  const tail2 = springStep(rig.springs.tail2, tail2Target, dt, 46, 8.5);
  const tuftTarget = clamp(-tail2 * 0.68 - rig.springs.tail2.velocity * 0.032 + closingTurn * 0.03, -0.31, 0.31);
  const tuft = springStep(rig.springs.tailTuft, tuftTarget, dt, 34, 6.8);

  rig.bones.tail0.rotation.z = clamp(tail0, -0.42, 0.42);
  rig.bones.tail1.rotation.z = clamp(tail1, -0.38, 0.38);
  rig.bones.tail2.rotation.z = clamp(tail2, -0.35, 0.35);
  rig.bones.tailTuft.rotation.z = clamp(tuft, -0.33, 0.33);
  const tuftStretch = reduced ? 0 : clamp(Math.abs(rig.springs.tailTuft.velocity) * 0.038, 0, 0.065);
  rig.bones.tailTuft.scale.set(1 + tuftStretch, 1 - tuftStretch * 0.3, 1);
}

function jawForShape(shape: MouthShape) {
  return ({ closed: 0.02, 'open-small': 0.34, 'open-wide': 0.68, smile: 0.18, oh: 0.55, ee: 0.12 })[shape];
}

/**
 * The approved lion is one texture on one dense, persistent SkinnedMesh.
 * Bones, skin weights, IK, morph targets and procedural springs deform that
 * mesh every requestAnimationFrame; no image layers or frames are swapped.
 */
export default function ArticulatedLion({ src, pose, size, lookAt = 0, speechText = "Who's playing today?", speechKey = 0, mouthKey = 0, onSpeechComplete, className }: ArticulatedLionProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rigRef = useRef<LionRig | null>(null);
  const poseRef = useRef(pose);
  const lookAtRef = useRef(lookAt);
  const speechKeyRef = useRef(0);
  const speechStartRef = useRef(0);
  const mouthKeyRef = useRef(0);
  const mouthStartRef = useRef(0);
  const speechTimelineRef = useRef(generateSimpleLipSync(speechText, SPEECH_MS));
  const onSpeechCompleteRef = useRef(onSpeechComplete);
  const completedSpeechRef = useRef(0);
  const [webglFailed, setWebglFailed] = useState(false);
  const { isReducedMotion } = useMotionPreset();
  const reducedRef = useRef(isReducedMotion);

  useEffect(() => {
    poseRef.current = pose;
    lookAtRef.current = lookAt;
    onSpeechCompleteRef.current = onSpeechComplete;
    reducedRef.current = isReducedMotion;
  }, [isReducedMotion, lookAt, onSpeechComplete, pose]);

  useEffect(() => { speechTimelineRef.current = generateSimpleLipSync(speechText, SPEECH_MS); }, [speechText]);
  useEffect(() => {
    if (speechKey <= 0 || speechKey === speechKeyRef.current) return;
    speechKeyRef.current = speechKey;
    speechStartRef.current = performance.now();
  }, [speechKey]);
  useEffect(() => {
    if (mouthKey <= 0 || mouthKey === mouthKeyRef.current) return;
    mouthKeyRef.current = mouthKey;
    mouthStartRef.current = performance.now();
  }, [mouthKey]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let disposed = false;
    new THREE.TextureLoader().load(src, (texture) => {
      if (disposed) { texture.dispose(); return; }
      let rig: LionRig;
      try { rig = buildRig(canvas, texture); }
      catch (error) {
        console.error('[LionRig] WebGL setup failed:', error);
        setWebglFailed(true);
        texture.dispose();
        return;
      }
      rigRef.current = rig;
      const resize = () => {
        const rect = canvas.getBoundingClientRect();
        rig.renderer.setSize(Math.max(1, rect.width), Math.max(1, rect.height), false);
      };
      resize();
      const observer = new ResizeObserver(resize);
      observer.observe(canvas);
      rig.disconnect = () => observer.disconnect();

      const animate = (now: number) => {
        if (disposed) return;
        const dt = clamp((now - rig.lastTime) / 1000, 1 / 240, 1 / 24);
        rig.lastTime = now;
        const seconds = now / 1000;
        const reduced = reducedRef.current;
        const activePose = poseRef.current;
        const elapsed = speechStartRef.current > 0 ? now - speechStartRef.current : Infinity;
        const greeting = elapsed < GREETING_MS && !reduced;
        const fallbackMouthElapsed = elapsed - SPEECH_START_MS;
        const mouthElapsed = mouthStartRef.current > 0 ? now - mouthStartRef.current : fallbackMouthElapsed;
        const speechElapsed = clamp(mouthElapsed, 0, SPEECH_MS);
        const speaking = !reduced && mouthElapsed >= 0 && mouthElapsed <= SPEECH_MS;
        const excited = activePose === 'celebrating' || activePose === 'excited' || activePose === 'success';
        const breathe = reduced ? 0 : Math.sin(seconds * 1.85) * 3.2;
        const weight = reduced ? 0 : Math.sin(seconds * 0.72) * 4.5;
        const notice = greeting ? envelope(elapsed, 0, 280, 1100, 1800) : 0;
        const lean = greeting ? envelope(elapsed, 140, 680, 3350, 4850) : 0;
        const headTilt = greeting ? envelope(elapsed, 420, 900, 3150, 4700) : 0;
        const earPerk = greeting ? envelope(elapsed, 240, 520, 3000, 4450) : 0;
        const smileBeat = greeting ? envelope(elapsed, 600, 980, 3500, 4700) : 0;
        const waveEnvelope = greeting ? envelope(elapsed, 1050, 1320, 3150, 4050) : 0;
        const wavePrep = greeting ? envelope(elapsed, 760, 1080, 1270, 1600) : 0;
        // The approved Vidu reference finishes with a planted three-quarter
        // settle: eyes lead, then head/chest follow while the raised paw lowers.
        // The source texture is front-facing, so this is a readable 2.5D turn:
        // translation, mild compression and overlapping secondary motion rather
        // than a fake full rotation that would visibly distort the face.
        const closingTurn = greeting ? envelope(elapsed, 2350, 3250, 4550, 5000) : 0;
        const wavePhase = (elapsed - 1220) * 0.0108;
        const waveCycle = waveEnvelope * Math.sin(wavePhase);
        const bodyFollow = waveEnvelope * Math.sin(wavePhase - 0.62);
        const bounce = excited ? Math.max(0, Math.sin(seconds * 5.2)) : 0;
        rig.bones.torso.position.x = px(650) + weight - notice * 8 + lean * 10 + bodyFollow * 16 + closingTurn * 24;
        rig.bones.torso.position.y = py(850) + breathe - bounce * 18 - lean * 13 - Math.abs(waveCycle) * 4;
        rig.bones.torso.rotation.z = reduced ? 0 : -lean * 0.03 + bodyFollow * 0.055 + closingTurn * 0.035;
        const torsoLinearVelocity = clamp((rig.bones.torso.position.x - rig.bodyMotion.torsoX) / dt, -120, 120);
        const torsoAngularVelocity = clamp((rig.bones.torso.rotation.z - rig.bodyMotion.torsoRotation) / dt, -2.4, 2.4);
        rig.bodyMotion.torsoX = rig.bones.torso.position.x;
        rig.bodyMotion.torsoRotation = rig.bones.torso.rotation.z;
        rig.bones.torso.scale.set(
          1 - lean * 0.008 + bounce * 0.025 + Math.abs(waveCycle) * 0.008 - closingTurn * 0.04,
          1 + breathe * 0.0015 + lean * 0.014 - bounce * 0.035 - Math.abs(waveCycle) * 0.008,
          1,
        );

        const combinedHeadTarget = reduced
          ? 0
          : greeting
            ? -notice * 0.02 + headTilt * 0.105 - bodyFollow * 0.035 + closingTurn * 0.05
            : Math.sin(seconds * 0.58) * 0.012;
        const neckTarget = combinedHeadTarget * 0.42 - rig.bones.torso.rotation.z * 0.18;
        rig.bones.neck.rotation.z = clamp(springStep(rig.springs.neck, neckTarget, dt, 88, 17), -0.11, 0.11);
        rig.bones.head.rotation.z = clamp(springStep(rig.springs.head, combinedHeadTarget * 0.68, dt, 105, 18), -0.1, 0.1);
        rig.bones.head.position.x = headTilt * 9 - bodyFollow * 6 + closingTurn * 21;
        rig.bones.head.position.y = 55 - lean * 10 + Math.abs(waveCycle) * 3;
        rig.bones.head.scale.set(1 - closingTurn * 0.065, 1 + closingTurn * 0.01, 1);
        const gaze = reduced ? 0 : clamp(lookAtRef.current, -1, 1);
        const cardLook = greeting ? envelope(elapsed, 60, 300, 720, 1150) : 0;
        const microSaccade = reduced ? 0 : Math.sin(seconds * 2.23) * 0.75 + Math.sin(seconds * 0.67) * 0.5;
        const gazeX = springStep(rig.springs.eyeX, gaze * 7 + bodyFollow * 3 + closingTurn * 12 + microSaccade, dt, 145, 22);
        const gazeY = springStep(rig.springs.eyeY, -cardLook * 15 + (speaking ? 2 : 0), dt, 145, 22);
        rig.bones.eyeL.position.set(-95 + gazeX, 312 + gazeY, 0);
        rig.bones.eyeR.position.set(115 + gazeX * 0.92, 349 + gazeY, 0);

        const perk = -0.14 * earPerk;
        rig.bones.earL.rotation.z = clamp(springStep(rig.springs.earL, perk + (reduced ? 0 : Math.sin(seconds * 1.37) * 0.014), dt, 120, 17), -0.18, 0.12);
        rig.bones.earR.rotation.z = clamp(springStep(rig.springs.earR, -perk + (reduced ? 0 : Math.sin(seconds * 1.11 + 1.7) * 0.013), dt, 120, 17), -0.12, 0.18);

        const armBindX = (px(1035) - px(875)) + (px(1110) - px(1035));
        const armBindY = (py(610) - py(735)) + (py(515) - py(610));
        rig.bones.armUpper.position.x = px(875) - px(650) + bodyFollow * 5;
        rig.bones.armUpper.position.y = py(735) - py(850) + wavePrep * 7 + Math.abs(waveCycle) * 3;
        const pawPathX = armBindX - wavePrep * 18 + waveEnvelope * 8 + waveCycle * 28 - closingTurn * 25;
        const pawPathY = armBindY - wavePrep * 12 + waveEnvelope * 8 + Math.cos(wavePhase) * waveEnvelope * 10 - closingTurn * 62;
        const wristFollow = reduced ? 0 : waveCycle * 0.56 + waveEnvelope * Math.sin(wavePhase * 2 - 0.45) * 0.08 - closingTurn * 0.22;
        solveWaveArm(rig, pawPathX, pawPathY, wristFollow, dt, reduced ? 0.96 : 1);

        updateTail(rig, {
          seconds,
          elapsed,
          greeting,
          closingTurn,
          reduced,
          torsoLinearVelocity,
          torsoAngularVelocity,
          dt,
        });
        const headVelocity = rig.springs.head.velocity + rig.springs.neck.velocity * 0.65;
        rig.bones.maneL.rotation.z = springStep(rig.springs.maneL, -headVelocity * 0.012 - bodyFollow * 0.04 - closingTurn * 0.038, dt, 48, 9.2);
        rig.bones.maneTop.rotation.z = springStep(rig.springs.maneTop, headVelocity * 0.01 + bodyFollow * 0.024 + closingTurn * 0.02, dt, 44, 8.4);
        rig.bones.maneR.rotation.z = springStep(rig.springs.maneR, -headVelocity * 0.011 - bodyFollow * 0.034 + closingTurn * 0.05, dt, 50, 9);

        const targetL = new THREE.Vector2(px(510) - bounce * 8 - bodyFollow * 4, py(1190));
        const targetR = new THREE.Vector2(px(790) + bounce * 8 + bodyFollow * 5, py(1182) + waveEnvelope * 3);
        const ikMix = reduced ? 0.96 : 0.985 + lean * 0.015;
        solveLeg(rig, 'L', targetL, -1, ikMix, 26);
        solveLeg(rig, 'R', targetR, 1, ikMix, 26);

        const blinkClock = seconds % 6.7;
        const blinkL = reduced ? 0 : Math.max(
          pulse(blinkClock, 3.92, 0.095),
          pulse(blinkClock, 4.16, 0.075),
          greeting ? pulse(elapsed, 710, 105) : 0,
          greeting ? pulse(elapsed, 3370, 125) : 0,
          greeting ? pulse(elapsed, 3600, 80) : 0,
        );
        const blinkR = reduced ? 0 : Math.max(
          pulse(blinkClock, 3.94, 0.095),
          pulse(blinkClock, 4.18, 0.075),
          greeting ? pulse(elapsed, 728, 105) : 0,
          greeting ? pulse(elapsed, 3388, 125) : 0,
          greeting ? pulse(elapsed, 3618, 80) : 0,
        );
        const mouthShape = speaking ? getMouthShapeAtTime(speechTimelineRef.current, speechElapsed) : 'smile';
        const jawTarget = reduced ? 0 : speaking ? jawForShape(mouthShape) : excited ? 0.28 : 0.05;
        const jaw = springStep(rig.springs.jawOpen, jawTarget, dt, 205, 27);
        const mouthWidthTarget = speaking && (mouthShape === 'ee' || mouthShape === 'smile') ? 0.36 : 0;
        const mouthWidth = springStep(rig.springs.mouthWidth, mouthWidthTarget, dt, 225, 30);
        rig.bones.jaw.position.y = 175 - jaw * 16;
        rig.bones.jaw.rotation.z = speaking ? (mouthShape === 'ee' ? -0.012 : mouthShape === 'oh' ? 0.01 : 0) : 0;
        const morphs = rig.mesh.morphTargetInfluences;
        if (morphs) {
          morphs[0] = blinkL;
          morphs[1] = blinkR;
          morphs[2] = jaw;
          morphs[3] = mouthWidth;
          morphs[4] = reduced ? 0 : greeting ? earPerk * 0.62 + smileBeat * 0.2 : excited ? 0.5 : 0.08;
          morphs[5] = reduced ? 0 : smileBeat * 0.56 + (speaking && mouthShape === 'smile' ? 0.18 : 0);
          morphs[6] = reduced ? 0 : waveEnvelope * (0.18 + Math.max(0, waveCycle) * 0.54 + Math.max(0, -waveCycle) * 0.24);
        }
        rig.bones.browL.rotation.z = greeting ? -0.035 * earPerk + bodyFollow * 0.008 : 0;
        rig.bones.browR.rotation.z = greeting ? 0.035 * earPerk + bodyFollow * 0.008 : 0;
        if (elapsed >= GREETING_MS && completedSpeechRef.current !== speechKeyRef.current) {
          completedSpeechRef.current = speechKeyRef.current;
          onSpeechCompleteRef.current?.();
        }
        rig.renderer.render(rig.scene, rig.camera);
        rig.frame = requestAnimationFrame(animate);
      };
      rig.frame = requestAnimationFrame(animate);
    }, undefined, (error) => {
      console.error('[LionRig] Texture failed:', error);
      if (!disposed) setWebglFailed(true);
    });

    return () => {
      disposed = true;
      const rig = rigRef.current;
      if (!rig) return;
      if (rig.frame != null) cancelAnimationFrame(rig.frame);
      rig.disconnect?.();
      rig.geometry.dispose();
      rig.material.dispose();
      rig.texture.dispose();
      rig.renderer.dispose();
      rigRef.current = null;
    };
  }, [src]);

  return (
    <div
      className={className}
      style={{ width: size, height: size, position: 'relative', contain: 'layout paint' }}
      role="img"
      aria-label={`Lion ${pose}, real-time skeletal rig`}
      data-rig="skinned-mesh"
      data-bones="29"
      data-morph-targets="7"
      data-performance-ms={GREETING_MS}
    >
      {webglFailed && <img src={src} alt={`Lion ${pose}`} className="absolute inset-0 w-full h-full object-contain" draggable={false} />}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" aria-hidden="true" style={{ display: webglFailed ? 'none' : 'block', touchAction: 'none' }} />
    </div>
  );
}
