/**
 * HomeWorld3D — the River Garden world running in the browser.
 *
 * Architecture per the 3D brief: Blender owns the WORLD, React owns the UI.
 * This component is only the world — a full-bleed R3F canvas that loads the
 * exported environment GLB, adopts the camera authored in Blender, and stands
 * the lion on the MARK_LionSpawn node. Player cards, title, parent pill and
 * speech stay as DOM above it.
 *
 * The whole point of this pass is that the browser is the production truth.
 * Blender agreeing with itself proves nothing, so the marker positions, camera
 * framing and scale are all read back OUT of the loaded asset rather than being
 * re-declared here as constants.
 */
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, useAnimations, Preload } from '@react-three/drei';
import { EffectComposer, Bloom, DepthOfField, N8AO, Vignette } from '@react-three/postprocessing';
import type { DepthOfFieldEffect } from 'postprocessing';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';
import { LionBrain, NECK_SHARE, type LionClip } from './lionBrain';
import WorldLife from './WorldLife';

const ENV_URL = '/assets/worlds/river-garden/home_environment.glb';
/* Rigged lion: one continuous skinned quad mesh plus separate eye, tooth and
   claw geometry, 41 joints, ten authored clips. */
const LION_URL = '/assets/lion/cage/lion.glb';

/* The bone-local axis that pitches a bone in this rig. Measured, not assumed:
   +10 degrees about local X moves the gaze +10 degrees of world pitch and zero
   yaw on `eye_L`, `neck_01` and `head` alike. */
const BONE_PITCH_AXIS = new THREE.Vector3(1, 0, 0);

/* Clips that play ONCE and hold their last pose, rather than looping.
   Every transition and performance clip belongs here: a looping WalkStart
   would restart the gait forever and a looping JumpTakeoff would leave the
   lion pogoing. Only Idle, Walk and the proxy's ambient clips repeat. */
const ONE_SHOT = new Set<LionClip>([
  'Wave', 'Jump', 'Nod', 'Celebrate',
  'WalkStart', 'WalkStop', 'TurnLeft', 'TurnRight',
  'JumpAnticipation', 'JumpTakeoff', 'JumpAirborne',
  'JumpLand', 'JumpRecovery',
]);

/**
 * Total lion height in metres, matching the world scale contract in
 * tools/blender/build_home_environment.py (0.85m at the shoulder, plus head and
 * mane above it). The lion GLB was authored in its own space and arrives about
 * 3.5m tall — four times oversized — so it is normalised here from its measured
 * bounding box rather than by a hard-coded multiplier, which keeps working if
 * the lion asset is re-exported at a different size.
 *
 * Raised from 1.10 for the hero composition. In the approved reference frame
 * the lion is roughly 40% of the frame height and the island reads as a small
 * dome beneath it; at 1.10m with the establishing camera it was nearer 15% and
 * the character disappeared into the landscape. Scale and camera distance were
 * tuned TOGETHER — see cameraDolly — rather than inflating the character alone.
 */
const LION_TARGET_HEIGHT = 1.30;

/** Anchors authored in Blender and read back from the GLB. */
export interface WorldMarkers {
  [name: string]: THREE.Vector3;
}

export interface WorldStats {
  triangles: number;
  drawCalls: number;
  materials: number;
  markers: WorldMarkers;
  cameraPos: THREE.Vector3 | null;
  cameraFov: number | null;
  lionHeight: number | null;
  lionGrounded: boolean | null;
  lionClips?: string[];
  /* Signed distance from the ground marker to the asset's lowest bind-pose
     vertex, in model units after scaling. Negative means the character sinks.
     It was already being written here and read by the HUD; only the type was
     missing, so `tsc` had three errors on a stat that worked at runtime. */
  lionFloorGap?: number;
  /* The clip the BRAIN chose, as opposed to the debug override. Without this
     the HUD could only ever report "auto (brain)", so a sequence like
     WalkStart -> Walk -> WalkStop was unobservable and the wiring could not be
     verified from outside. */
  lionBrainClip?: LionClip;
  /* Where the eyes are aimed, in degrees of eye yaw/pitch plus the world point.
     Surfaced for the same reason as `lionBrainClip`: a gaze that is scheduled
     rather than commanded is otherwise unobservable from outside. */
  /* Eye yaw, head-assist yaw, and the total the gaze actually WANTED — so the
     HUD can show whether the pair between them reaches the target or is still
     short. Reporting only the clamped eye angle is what hid the problem the
     assist exists to fix. */
  /* `aimErr` is measured off the eye bone's world matrix, not computed from
     the request — see the AIM ERROR block in `Lion`. It is the only figure
     here that can disagree with what the runtime intended. */
  lionGaze?: { yaw: number; pitch: number; head: number; want: number; aimErr: number; at: string };
  /* The bridge, if this world has one. `has` false means the environment
     shipped no MARK_BridgeNear/Far pair, which is what an islanded world looks
     like — not an error. */
  lionBridge?: { has: boolean; progress: number; crossed: boolean; x: number; z: number };
  /* How far the camera has tracked from its authored position, in metres.
     0 while the lion is home — the deadzone — and the only figure that says
     whether the follow is actually wired rather than merely written. */
  cameraTrack?: number;
}

/* ── Environment ─────────────────────────────────────────────────────────── */

function Environment({ onReady }: { onReady: (data: {
  markers: WorldMarkers; camera: THREE.PerspectiveCamera | null; triangles: number;
  drawCalls: number; materials: number;
}) => void }) {
  const { scene, cameras } = useGLTF(ENV_URL);

  const prepared = useMemo(() => {
    const markers: WorldMarkers = {};
    const materialSet = new Set<THREE.Material>();
    let triangles = 0;
    let drawCalls = 0;

    /* Remove any lights that travelled inside the GLB. Blender's exporter emits
       KHR_lights_punctual, and a Blender area light's watts convert to a
       three.js intensity far outside the runtime's budget: the scene rendered
       pure white and was completely unresponsive to the lights defined in this
       component, because these were the ones actually doing the work. Lighting
       is owned by <Lighting /> so shadow cost stays controlled. */
    const strayLights: THREE.Object3D[] = [];
    scene.traverse((obj) => {
      if ((obj as THREE.Light).isLight) strayLights.push(obj);
    });
    strayLights.forEach((l) => l.removeFromParent());

    scene.updateMatrixWorld(true);
    scene.traverse((obj) => {
      if (obj.name.startsWith('MARK_')) {
        markers[obj.name] = obj.getWorldPosition(new THREE.Vector3());
      }
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh) {
        drawCalls += 1;
        /* Only compact geometry casts. Enabling castShadow on everything put
           the 30m distant hills and the 34m river plane into the shadow map,
           and they occluded the sun for the ENTIRE stage — the whole island
           rendered as a uniform grey slab bounded by the shadow frustum.
           Background masses receive shadow but must never cast it. */
        mesh.geometry?.computeBoundingSphere();
        const r = mesh.geometry?.boundingSphere?.radius ?? 0;
        mesh.castShadow = r > 0 && r < 4.0;
        mesh.receiveShadow = true;
        const geo = mesh.geometry;
        if (geo?.index) triangles += geo.index.count / 3;
        else if (geo?.attributes?.position) triangles += geo.attributes.position.count / 3;
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((m) => m && materialSet.add(m));
      }
    });

    const cam = (cameras?.[0] as THREE.PerspectiveCamera) ?? null;
    return { markers, camera: cam, scene, triangles: Math.round(triangles), drawCalls, materials: materialSet.size };
  }, [scene, cameras]);

  useEffect(() => { onReady(prepared); }, [prepared, onReady]);

  return <primitive object={scene} />;
}

/* ── Lion ────────────────────────────────────────────────────────────────── */

function Lion({
  spawn,
  bounds,
  ground,
  clipOverride,
  wander,
  stageRadius,
  brainRef,
  lionUrl,
  onMeasured,
  onBrainClip,
  onGaze,
  onBridge,
  interestMarkers,
}: {
  spawn: THREE.Vector3 | null;
  bounds: { cx: number; cz: number; r: number } | null;
  ground: THREE.Object3D | null;
  clipOverride: string | null;
  wander: boolean;
  stageRadius: number;
  brainRef?: React.MutableRefObject<LionBrain | null>;
  lionUrl: string;
  onMeasured: (height: number, grounded: boolean, clips: string[], floorGap: number) => void;
  onBrainClip: (clip: LionClip) => void;
  onGaze: (g: { yaw: number; pitch: number; head: number; want: number; aimErr: number; at: string }) => void;
  onBridge: (b: { has: boolean; progress: number; crossed: boolean; x: number; z: number }) => void;
  interestMarkers: WorldMarkers;
}) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(lionUrl);

  /* SkeletonUtils.clone is required for skinned meshes — a plain clone copies
     the meshes but leaves them bound to the ORIGINAL skeleton, so the copy
     either does not deform or deforms in lockstep with every other instance. */
  const model = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { actions, names, mixer } = useAnimations(animations, model);

  const brain = useMemo(
    () => new LionBrain(bounds ?? { cx: 0, cz: 0, r: 1.2 }),
    [bounds],
  );
  const [activeClip, setActiveClip] = useState<LionClip>('Idle');
  const footOffset = useRef(0);

  useEffect(() => { if (brainRef) brainRef.current = brain; }, [brain, brainRef]);
  useEffect(() => { brain.wander = wander; }, [brain, wander]);
  useEffect(() => { brain.stageRadius = stageRadius; }, [brain, stageRadius]);

  /* WHERE THE LION LOOKS COMES FROM THE ENVIRONMENT, not from constants here.
     MARK_CardShelfZone is where the player cards sit and MARK_TitleZone the
     title, both authored in Blender and read back out of the GLB — so
     re-authoring the island moves the lion's attention with it, which is the
     same argument the walkable bounds already make.

     Card shelf first: `greet` glances at `interest[0]`, and the storyboard's
     opening beat is the eyes going to the cards. */
  useEffect(() => {
    const wanted = ['MARK_CardShelfZoneHero', 'MARK_CardShelfZone',
                    'MARK_TitleZoneHero', 'MARK_TitleZone'];
    const pts = wanted
      .map((n) => interestMarkers[n])
      .filter((p): p is THREE.Vector3 => Boolean(p))
      .map((p) => ({ x: p.x, y: p.y, z: p.z }));
    brain.setInterest(pts);
  }, [brain, interestMarkers]);

  /* THE BRIDGE, from the environment's own two markers.
     `MARK_BridgeNear` sits INSIDE the island's walk circle on purpose — see
     `build_bridge` in the environment script. The walkable region is the
     island circle UNION this corridor, and a corridor that began where the
     planks do would leave a ring belonging to neither, with the lion clamped
     to the rim staring at a bridge it could not reach.
     Absent markers simply leave the lion islanded, which is what every world
     without a bridge should do. */
  useEffect(() => {
    const near = interestMarkers.MARK_BridgeNear;
    const far = interestMarkers.MARK_BridgeFar;
    if (near && far) brain.setBridge({ x: near.x, z: near.z }, { x: far.x, z: far.z });
    else brain.clearBridge();
  }, [brain, interestMarkers]);

  // Real clip lengths, so a "play Wave then carry on" task ends when the wave
  // actually ends rather than after a number someone typed.
  useEffect(() => {
    const d: Partial<Record<LionClip, number>> = {};
    animations.forEach((a) => { d[a.name as LionClip] = a.duration; });
    brain.setDurations(d);
  }, [animations, brain]);

  /* Bind-pose footprint of the asset, measured from geometry rather than from
     the posed hierarchy.
     `Box3.setFromObject` walks the live scene graph, so once a clip is playing
     it describes the CURRENT pose. This effect can re-run after the mixer has
     started, and when it did the measured floor sat 444mm below the origin
     instead of 11mm — the character was then seated against a number that
     described a mid-stride pose and sank into the island. What is wanted here is
     the asset's rest footprint, which is a property of the geometry and cannot
     depend on what frame it happens to be on. */
  /* ...and for the same reason it cannot come from `computeBoundingBox()`.
     three.js expands a geometry's bounding box to cover every MORPH TARGET
     extreme, so the box describes the union of all poses the morphs can reach
     rather than the neutral one. That is the same class of error as measuring
     a posed hierarchy, and it appeared the moment the character gained a face:
     the mouth morphs displace geometry ~0.0206 below the paws, which dropped
     the measured floor to -0.0171 and, after the 1.3299 scale, seated the
     character 22.8mm INTO the island. The faceless cage measured +5.4mm.

     So the box is built from the position attribute alone. Local geometry
     space, as before — every mesh in these assets carries an identity
     transform, and the export asserts it. */
  const bindBox = useMemo(() => {
    const box = new THREE.Box3();
    const v = new THREE.Vector3();
    model.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh || !m.geometry) return;
      const pos = m.geometry.attributes.position as THREE.BufferAttribute | undefined;
      if (!pos) return;
      for (let i = 0; i < pos.count; i += 1) {
        v.fromBufferAttribute(pos, i);
        box.expandByPoint(v);
      }
    });
    return box;
  }, [model]);

  useEffect(() => {
    if (!spawn || !group.current || bindBox.isEmpty()) return;
    const size = new THREE.Vector3();
    bindBox.getSize(size);

    const scale = size.y > 0 ? LION_TARGET_HEIGHT / size.y : 1;
    model.scale.setScalar(scale);
    model.updateMatrixWorld(true);

    const scaledMinY = bindBox.min.y * scale;
    const scaledSizeY = size.y * scale;

    // Seat the FEET on the marker rather than assuming the asset origin is at
    // ground level — that assumption is what makes characters hover or sink.
    footOffset.current = -scaledMinY;
    brain.setHome(spawn.x, spawn.z);

    /* SEAT THE LION ONCE, and only once.
       This effect measures the asset, and measuring is idempotent — but it also
       used to move the character to the spawn, and that is not. Its dependency
       list includes `names` from drei's `useAnimations`, which is not
       reference-stable, so the effect re-runs on EVERY render of this
       component. Every re-render therefore teleported the lion home.
       It went unnoticed while the only thing that re-rendered mid-walk was a
       gaze report keyed on the target, which changes every few seconds. Adding
       a bridge-progress report keyed on whole percent made it fire while the
       lion was walking, and the crossing became: step onto the deck, reach
       2.08 m, snap back to the spawn, repeat. Exactly the sawtooth the HUD
       showed.
       The measurement below still re-runs freely. The position does not. */
    if (!seated.current) {
      seated.current = true;
      brain.x = spawn.x;
      brain.z = spawn.z;
      group.current.position.set(spawn.x, spawn.y + footOffset.current, spawn.z);
    }

    /* Match translation to the clip rather than to a constant. The rig script
       measures the walk stride off the authored action and writes it beside the
       GLB; multiplying by the scale just applied gives the world stride, and
       stride / cycle is the only speed at which a planted paw does not slide. */
    const locoUrl = lionUrl.replace(/[^/]+\.glb$/, 'locomotion.json');
    fetch(locoUrl)
      .then((r) => (r.ok ? r.json() : null))
      .then((loco) => {
        if (loco?.strideModelUnits && loco?.cycleSeconds) {
          brain.setLocomotion(loco.strideModelUnits * scale, loco.cycleSeconds);
        }
      })
      .catch(() => { /* fallback speed already set */ });

    /* WHERE THE EYES ARE, measured off the asset rather than assumed.
       The brain needs both numbers to aim a gaze at a world point, and both
       were previously wrong in ways only the aim error could see: the height
       was a hand-written 0.85 subtracted from a world y — two different frames
       — and the forward offset did not exist at all, so a quadruped whose eyes
       sit 0.77 m ahead of its hips aimed from its hips and came out 4.9
       degrees wide of a card 4.5 m away.

       Taken from the MIDPOINT of the two eyes, so the lateral offset cancels
       instead of biasing every gaze toward the left one. */
    const eyeL = model.getObjectByName('eye_L');
    const eyeR = model.getObjectByName('eye_R');
    if (eyeL && eyeR) {
      group.current.updateMatrixWorld(true);
      const mid = new THREE.Vector3()
        .setFromMatrixPosition(eyeL.matrixWorld)
        .add(new THREE.Vector3().setFromMatrixPosition(eyeR.matrixWorld))
        .multiplyScalar(0.5);
      brain.setEyeHeight(mid.y - spawn.y);
      const rel = mid.clone().sub(group.current.position);
      brain.setEyeOffset(rel.dot(new THREE.Vector3(Math.sin(brain.yaw), 0, Math.cos(brain.yaw))));
    }

    onMeasured(scaledSizeY, Math.abs(scaledMinY) < 0.05, names, scaledMinY);
  }, [model, spawn, onMeasured, names, brain, lionUrl, bindBox]);

  /* Cross-fade between clips rather than cutting, so the character never snaps.
     Wave, Jump and Celebrate are one-shots: looping them makes the lion twitch
     forever instead of performing once and returning to rest. */
  useEffect(() => {
    const next = actions[activeClip];
    if (!next) return;
    const once = ONE_SHOT.has(activeClip);
    next.reset();
    next.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat, once ? 1 : Infinity);
    next.clampWhenFinished = once;
    next.fadeIn(0.35).play();
    return () => { next.fadeOut(0.35); };
  }, [actions, activeClip]);

  useEffect(() => {
    model.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      m.castShadow = true;
      m.receiveShadow = true;
      /* The reference character is not smooth yellow plastic — it reads as felt
         or short plush, and that difference is a SHEEN layer, not a texture. A
         fabric sheen adds a soft retroreflective rim at grazing angles, which is
         exactly the velvety edge the reference has and the single cheapest thing
         that stops a stylised character looking injection-moulded.

         MeshPhysicalMaterial costs more per pixel than Standard, so it is
         applied only to the two character materials — never to the 29 in the
         environment. The wet parts (eyes, nose, teeth, tongue) keep a hard
         specular instead: sheen on an eyeball would kill the catchlight. */
      const mats = (Array.isArray(m.material) ? m.material : [m.material]) as THREE.MeshStandardMaterial[];
      m.material = mats.map((src) => {
        if (!src) return src;
        const gloss = /gloss/i.test(src.name);
        const next = new THREE.MeshPhysicalMaterial({
          color: src.color,
          vertexColors: src.vertexColors,
          roughness: gloss ? 0.16 : 0.86,
          metalness: 0,
          sheen: gloss ? 0 : 0.9,
          sheenRoughness: 0.55,
          sheenColor: new THREE.Color('#ffd9a8'),
          clearcoat: gloss ? 0.85 : 0,
          clearcoatRoughness: 0.08,
          flatShading: false,
        });
        next.name = src.name;
        return next;
      }) as unknown as THREE.Material;
      if (Array.isArray(m.material) && (m.material as THREE.Material[]).length === 1) {
        m.material = (m.material as THREE.Material[])[0];
      }
      /* Skinned geometry keeps the BIND-POSE bounds, which are wrong once bones
         move. Three.js then fits the shadow camera to a bogus volume and the
         whole ground renders as one grey slab of shadow. Recompute the bounds
         and take these meshes out of frustum culling — the character is always
         on screen anyway. */
      const sk = o as THREE.SkinnedMesh;
      if (sk.isSkinnedMesh) {
        sk.frustumCulled = false;
        sk.geometry.computeBoundingBox();
        sk.geometry.computeBoundingSphere();
      }
    });
  }, [model]);

  /* Ground following. The island is a squashed dome, so walking on a fixed Y
     would sink the lion at the centre and float it at the rim. One downward ray
     per frame against the environment is cheap and, unlike an analytic dome
     formula copied from the build script, cannot drift out of sync with the
     asset that actually shipped. */
  /* MANE FOLLOW-THROUGH AT RUNTIME.
     The clips bake a lag from their own head curves, but the head is also
     driven live — `turnTo`, `lookAt`, navigation yaw — and a baked curve
     cannot know about any of that. So a delayed copy of the body yaw is kept
     here and the difference is composed onto the mane bones.
     Same definition as the bake: the mane holds the body's PREVIOUS heading,
     so it cannot overshoot and there is no spring constant to tune. */
  const maneBones = useMemo(() => (
    ['mane_top', 'mane_L', 'mane_R']
      .map((n) => model.getObjectByName(n))
      .filter((o): o is THREE.Object3D => Boolean(o))
  ), [model]);
  /* Resolved once. `getObjectByName` walks the graph, and doing that per frame
     for five bones is a needless traversal of a 16,000-vertex hierarchy. An
     empty array means the loaded asset lacks them — the proxy has no eye or
     mane bones — and the corresponding block simply does not run. */
  /* The REST rotation is captured alongside the bone, and that is not a
     nicety — the eye bones' rest quaternion is NOT identity. Authored pointing
     +Y out of the skull, they sit at -42.6 degrees about local X relative to
     `head` in the exported GLB. The first version of this block lerped
     `rotation.x` from that rest value toward the wanted pitch, which drove the
     rest tilt out of the bone and swung both eyes 42.6 degrees on the first
     frame the gaze ran. A bone whose rest transform is not identity has to be
     driven RELATIVE to that transform: `rest * delta`, never `absolute`.

     Captured here, at resolve time, because the memo runs on the freshly cloned
     scene before the frame loop has written anything. Reading it later would
     capture whatever the last frame left behind. */
  const eyes = useMemo(() => (
    ['eye_L', 'eye_R']
      .map((n) => model.getObjectByName(n))
      .filter((o): o is THREE.Object3D => Boolean(o))
      .map((bone) => ({ bone, rest: bone.quaternion.clone() }))
  ), [model]);
  const neckBones = useMemo(() => (
    ['neck_01', 'head']
      .map((n) => model.getObjectByName(n))
      .filter((o): o is THREE.Object3D => Boolean(o))
  ), [model]);
  const eyeAim = useRef({ yaw: 0, pitch: 0 });
  const eyeFwd = useMemo(() => new THREE.Vector3(), []);
  const eyeWorld = useMemo(() => new THREE.Vector3(), []);
  const eyeMid = useMemo(() => new THREE.Vector3(), []);
  const eyeWant = useMemo(() => new THREE.Vector3(), []);
  const eyeQ = useMemo(() => new THREE.Quaternion(), []);
  const eyeE = useMemo(() => new THREE.Euler(), []);
  const headAssist = useRef({ yaw: 0, pitch: 0 });
  const assistQ = useMemo(() => new THREE.Quaternion(), []);
  const assistWorldQ = useMemo(() => new THREE.Quaternion(), []);
  const assistAxis = useMemo(() => new THREE.Vector3(), []);
  const maneYaw = useRef(0);
  const maneQ = useMemo(() => new THREE.Quaternion(), []);
  const maneAxis = useMemo(() => new THREE.Vector3(0, 0, 1), []);

  const reportedClip = useRef<LionClip>('Idle');
  const reportedGaze = useRef<string>('');
  const gazeReport = useRef(0);
  const reportedBridge = useRef<string>('');
  /* Whether the lion has been placed at its spawn. See the measure effect. */
  const seated = useRef(false);
  const ray = useMemo(() => new THREE.Raycaster(), []);
  const down = useMemo(() => new THREE.Vector3(0, -1, 0), []);
  const from = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, dt) => {
    if (!group.current) return;
    brain.step(dt);
    const clip = (clipOverride as LionClip | null) ?? brain.clip;
    if (clip !== activeClip && actions[clip]) setActiveClip(clip);
    if (brain.clip !== reportedClip.current) {
      reportedClip.current = brain.clip;
      onBrainClip(brain.clip);
    }
    const at = brain.gazeAt;
    let y = group.current.position.y;
    if (ground) {
      from.set(brain.x, 6, brain.z);
      ray.set(from, down);
      const hit = ray.intersectObject(ground, true)[0];
      if (hit) y = hit.point.y + footOffset.current;
    }
    group.current.position.set(brain.x, y, brain.z);
    /* The ground the lion is actually standing on, every frame, because the
       raycast above can move it on sloping terrain. The brain pitches its gaze
       against `groundY + eyeHeight`. */
    brain.setGroundY(y - footOffset.current);
    /* Modelled facing +Y, which after the glTF Y-up conversion points straight
       away from the production camera. Math.PI is that correction; the brain's
       yaw is added on top of it. */
    group.current.rotation.y = Math.PI + brain.yaw;

    const split = brain.gazeSplit;

    /* EYES, BEFORE the mixer. No clip keys `eye_L`/`eye_R`, so writing them
       here does not fight it — and `mixer.update` is what pushes the skeleton
       into the skin, so it has to happen first.

       Lerped rather than snapped: eyes move fast but not instantly, and a hard
       cut reads as a texture swap rather than a glance. */
    if (eyes.length) {
      /* Smoothed in the ANGLE, not by reading the bone back. The bone now
         carries its rest rotation composed with the aim, so reading its
         quaternion would smooth toward a value that includes the rest tilt. */
      const k = 1 - Math.exp(-dt * 14);
      eyeAim.current.yaw += (split.eyes.yaw - eyeAim.current.yaw) * k;
      eyeAim.current.pitch += (split.eyes.pitch - eyeAim.current.pitch) * k;
      /* MEASURED off the shipped GLB, not reasoned about: rotating `eye_L`
         by +10 degrees about its local X moves the gaze +10 degrees of world
         pitch and 0 of yaw, and +10 about local Z moves it +10 of yaw and 0
         of pitch. Both are exactly 1:1 because the eye bone's rest forward is
         the world +Z the character faces. The pitch term used to carry a
         minus sign, which pointed the eyes as far the WRONG way as the target
         was off — 11.7 degrees of aim error on a 5.3 degree request. */
      eyeE.set(eyeAim.current.pitch, 0, eyeAim.current.yaw);
      eyeQ.setFromEuler(eyeE);
      for (let i = 0; i < eyes.length; i += 1) {
        eyes[i].bone.quaternion.copy(eyes[i].rest).multiply(eyeQ);
      }
    }

    mixer.update(0);

    /* AFTER the mixer, and that is the whole difference from the gaze block.
       The eye bones are keyed by no clip, so writing them before `update` is
       safe. The mane bones ARE keyed — Idle and Walk both drive them — so a
       write before `update` would simply be overwritten. Composing onto the
       quaternion afterwards adds the runtime lag to the baked one instead of
       fighting it, and `multiply` rather than `set` is what makes it additive. */
    /* HEAD-TURN ASSIST, after the mixer and for the mane's reason, not the
       eyes': `neck_01` and `head` ARE keyed by Idle and Walk, so a write before
       `update` would be overwritten. Composing afterwards ADDS the assist to
       whatever the clip is doing, which is what lets the lion breathe and look
       at the cards at once.

       Smoothed harder than the eyes. A head is heavy; an instant turn reads as
       a glitch where a quick eye flick reads as attention. */
    if (neckBones.length) {
      const hk = 1 - Math.exp(-dt * 6.0);
      const wantYaw = split.neck.yaw + split.head.yaw;
      const wantPitch = split.neck.pitch + split.head.pitch;
      headAssist.current.yaw += (wantYaw - headAssist.current.yaw) * hk;
      headAssist.current.pitch += (wantPitch - headAssist.current.pitch) * hk;
      /* The bone matrices are stale the instant the mixer writes new local
         rotations, and the yaw axis below is read out of them. */
      group.current.updateMatrixWorld(true);
      for (let i = 0; i < neckBones.length; i += 1) {
        const share = i === 0 ? NECK_SHARE : 1 - NECK_SHARE;
        const bone = neckBones[i];
        /* YAW ABOUT WORLD UP, not about the bone's own Z.
           `neck_01` and `head` run up and forward out of the chest — 55 and 43
           degrees above horizontal — so their local Z is nowhere near
           vertical, and turning about it is part yaw and part roll. Measured
           on the GLB: 30 degrees about `head`'s local Z buys only 21.7 degrees
           of gaze yaw and costs 3.8 degrees of unasked-for pitch, so the
           assist quietly delivered three quarters of what it promised and the
           eyes stayed short of the target. Expressing world up in the bone's
           own frame makes it 1:1 with no pitch coupling.

           The equivalent local-Z magnitudes stay inside the deformation
           battery's validated `05-head-turn` pose (neck 32 / head 38): a full
           30 degree assist is 13.7 and 16.3 degrees about world up, or 16.9
           and 22.2 about local Z. */
        bone.getWorldQuaternion(assistWorldQ).invert();
        assistAxis.set(0, 1, 0).applyQuaternion(assistWorldQ).normalize();
        assistQ.setFromAxisAngle(assistAxis, headAssist.current.yaw * share);
        bone.quaternion.multiply(assistQ);
        /* Pitch about the bone's own X, which measures 1:1 with no yaw
           coupling on all three of `eye_L`, `neck_01` and `head`. */
        assistQ.setFromAxisAngle(BONE_PITCH_AXIS, headAssist.current.pitch * share);
        bone.quaternion.multiply(assistQ);
      }
    }

    if (maneBones.length) {
      const k = 1 - Math.exp(-dt * 5.5);
      /* The mane trails the HEAD, not the body — so the assist is part of what
         it lags behind, or a look at the cards would swing the skull and leave
         the mane hanging behind it unmoved. */
      const headYaw = brain.yaw + headAssist.current.yaw;
      maneYaw.current += (headYaw - maneYaw.current) * k;
      const lag = maneYaw.current - headYaw;
      if (Math.abs(lag) > 1e-4) {
        for (let i = 0; i < maneBones.length; i += 1) {
          // The crown takes less than the side lobes: it is anchored at the
          // skull's top and has less free mass hanging off it.
          maneQ.setFromAxisAngle(maneAxis, lag * (i === 0 ? 0.5 : 1.0));
          maneBones[i].quaternion.multiply(maneQ);
        }
      }
    }

    /* ── AIM ERROR ──────────────────────────────────────────────────────────
       Reported LAST, from the bone's own world matrix, because every other
       number here is something this code decided rather than something the
       skeleton did.

       That distinction is not academic. The eye bones' rest rotation is a
       -42.6 degree tilt about local X, and the first version of the block
       above drove `rotation.x` toward an ABSOLUTE pitch — which erased that
       rest tilt and threw both eyes 42.6 degrees off on the first frame the
       gaze ran. Every angle the HUD printed stayed correct throughout, because
       the HUD was printing the request. This line prints the RESULT: the angle
       between the eye bone's world forward and the direction from that eye to
       the thing it is meant to be looking at.

       ~1 degree of it is honest parallax — the brain aims from the body origin
       and this measures from the left eye, 95 mm off-centre. Anything much
       larger is a bug in the driving code, and anything close to the clamp
       overshoot means the rig has simply run out of range. */
    let aimErr = 0;
    if (eyes.length && at) {
      group.current.updateMatrixWorld(true);
      const bone = eyes[0].bone;
      /* From the MIDPOINT of the two eyes. Measuring from one of them puts a
         constant lateral parallax into every reading, which is exactly the
         kind of steady offset that gets mistaken for a bug in the aim. Both
         eyes carry the same rest rotation and take the same delta, so their
         forwards are parallel and either one gives the direction. */
      bone.getWorldPosition(eyeWorld);
      if (eyes.length > 1) {
        eyes[1].bone.getWorldPosition(eyeMid);
        eyeWorld.add(eyeMid).multiplyScalar(0.5);
      }
      // A bone's own +Y runs along it, which is how it was authored and how
      // `review_render.py` poses it.
      eyeFwd.set(0, 1, 0).transformDirection(bone.matrixWorld);
      eyeWant.set(at.x, at.y, at.z).sub(eyeWorld).normalize();
      aimErr = (eyeFwd.angleTo(eyeWant) * 180) / Math.PI;
    }

    /* Keyed on the aim as well as the target, so the report follows the eyes
       through their lerp instead of printing the first frame of a 0.2 s move —
       and THROTTLED, which is not optional. `onGaze` sets React state on the
       page above; keying it on a value that jitters with the Idle head bob
       fired a setState every frame and the whole scene stopped arriving. The
       HUD only needs to be readable, so four updates a second is plenty. */
    /* THE BRIDGE, reported on a coarse key for the same reason the gaze is:
       `onBridge` sets React state on the page above, and a progress figure
       that changes every frame while the lion walks would fire a setState per
       frame. Whole percent is all the HUD can show anyway. */
    const bkey = `${brain.hasBridge}|${Math.round(brain.bridgeProgress * 100)}|${brain.hasCrossed}`;
    if (bkey !== reportedBridge.current) {
      reportedBridge.current = bkey;
      onBridge({
        has: brain.hasBridge,
        progress: brain.bridgeProgress,
        crossed: brain.hasCrossed,
        // The POSITION, because progress alone cannot say whether the lion is
        // walking the deck or being dragged off it, and the first crossing in
        // the browser did exactly the latter.
        x: brain.x,
        z: brain.z,
      });
    }

    gazeReport.current -= dt;
    const atKey = at ? `${at.x.toFixed(2)},${at.z.toFixed(2)}` : 'ahead';
    const key = `${atKey}|${aimErr.toFixed(0)}`;
    if (key !== reportedGaze.current && gazeReport.current <= 0) {
      gazeReport.current = 0.25;
      reportedGaze.current = key;
      const sp = brain.gazeSplit;
      const deg = (r: number) => (r * 180) / Math.PI;
      onGaze({
        yaw: deg(sp.eyes.yaw),
        pitch: deg(sp.eyes.pitch),
        head: deg(sp.neck.yaw + sp.head.yaw),
        want: deg(brain.gazeWantYaw),
        aimErr,
        at: atKey,
      });
    }
  });

  return (
    <group ref={group}>
      <primitive object={model} />
    </group>
  );
}

/* ── Camera adopted from the GLB ─────────────────────────────────────────── */

function AdoptedCamera({ source, target, dolly = 1, follow, home, deadzone = 1.55, onTrack }: {
  source: THREE.PerspectiveCamera | null;
  target: THREE.Vector3 | null;
  /**
   * Fraction of the authored camera distance to keep. 1 is exactly what Blender
   * framed. The homepage uses a smaller value so the mascot reads as a hero
   * rather than a figure in a landscape — it moves the camera ALONG the authored
   * view axis, so the approved angle and lens are preserved and only the
   * distance changes.
   */
  dolly?: number;
  /** The brain, whose `x`/`z` are the lion's ground position. Null = no track. */
  follow?: React.RefObject<{ x: number; z: number } | null>;
  /** Where the lion belongs. Inside `deadzone` of this, the camera does not move. */
  home?: THREE.Vector3 | null;
  /**
   * How far the lion may stray before the camera starts tracking, in metres.
   *
   * 1.55 is just outside the island's walk radius of 1.35, and that is the
   * whole design: ordinary wandering can never move the camera, so the approved
   * hero framing is preserved BY CONSTRUCTION rather than by a flag someone has
   * to remember to clear.
   */
  deadzone?: number;
  /** Reports how far the camera has tracked, so the follow is observable. */
  onTrack?: (metres: number) => void;
}) {
  const { camera, size } = useThree();
  /* The authored, dollied position — the framing the reference approved. Kept
     so the track is an OFFSET from it and the rest state is exactly what it
     was before this component learned to follow anything. */
  const base = useMemo(() => new THREE.Vector3(), []);
  const offset = useRef({ x: 0, z: 0 });
  const reportedTrack = useRef(-1);
  const ready = useRef(false);

  useEffect(() => {
    if (!source) return;
    const cam = camera as THREE.PerspectiveCamera;
    source.updateMatrixWorld(true);
    // Copy the authored transform. The framing was approved in Blender against
    // the reference; re-deriving it here by eye would throw that away.
    cam.position.setFromMatrixPosition(source.matrixWorld);
    cam.quaternion.setFromRotationMatrix(source.matrixWorld);
    if (target && dolly !== 1) cam.position.lerpVectors(target, cam.position, dolly);
    cam.fov = source.fov;
    cam.near = 0.05;
    cam.far = 300;
    cam.aspect = size.width / size.height;
    cam.updateProjectionMatrix();
    base.copy(cam.position);
    ready.current = true;
  }, [source, camera, size, target, dolly, base]);

  /**
   * TRACK, don't orbit.
   *
   * The camera follows by TRANSLATING and keeps the authored orientation and
   * lens untouched. Rotating it to look at the lion would re-aim a view that
   * was approved against the reference turnaround, and dollying out to keep
   * the lion in shot would shrink the character over the length of the
   * crossing. A pure translation keeps the lion the same size at the same
   * place on screen and slides the world past it, which is what watching
   * something cross a bridge in profile should look like.
   *
   * Driven by DISPLACEMENT FROM HOME rather than by the bridge, so it knows
   * nothing about crossings: it follows the lion out, follows it back, and
   * would follow it into any future world without another line of code. The
   * deadzone is what keeps it still while the lion mills about at home.
   */
  useFrame((_, dt) => {
    if (!ready.current || !follow?.current || !home) return;
    const at = follow.current;
    const dx = at.x - home.x;
    const dz = at.z - home.z;
    const d = Math.hypot(dx, dz);
    // Only the part of the excursion that leaves the deadzone.
    const beyond = Math.max(0, d - deadzone);
    const wantX = d > 1e-6 ? (dx / d) * beyond : 0;
    const wantZ = d > 1e-6 ? (dz / d) * beyond : 0;
    /* Smoothed hard — 1.8 is about a second to close the gap. A camera that
       snaps to the character reads as the character being dragged, and one
       that lags a long way behind reads as a broken follow; this is slow
       enough that the lion leads the shot and fast enough that it never
       leaves it. Frame-rate independent, so a 30 Hz tablet and a 120 Hz
       laptop settle at the same speed. */
    const k = 1 - Math.exp(-Math.min(dt, 0.1) * 1.8);
    offset.current.x += (wantX - offset.current.x) * k;
    offset.current.z += (wantZ - offset.current.z) * k;
    camera.position.set(
      base.x + offset.current.x,
      base.y,
      base.z + offset.current.z,
    );
    /* Reported on a whole-centimetre key, for the same reason every other
       report in this file is throttled: `onTrack` sets React state. */
    const moved = Math.hypot(offset.current.x, offset.current.z);
    const key = Math.round(moved * 100);
    if (key !== reportedTrack.current) {
      reportedTrack.current = key;
      onTrack?.(moved);
    }
  });

  return null;
}

/**
 * Reports real renderer counters, which are the only honest perf numbers.
 *
 * Sampled repeatedly until they SETTLE, not once at frame 30. One sample is a
 * race against the asset load, and on a cold cache the lion's 4.3 MB has not
 * arrived by frame 30 — so the HUD read 29 draw calls and 85,000 triangles for
 * a scene that actually costs 51 and 251,160, while the lion was plainly
 * visible on screen. A perf number that depends on whether the browser had the
 * GLB cached is worse than no perf number, because it looks authoritative.
 *
 * Every 20 frames, report only on change, and stop once three consecutive
 * samples agree. That converges in about a second and then costs nothing.
 */
function PerfProbe({ onSample }: { onSample: (calls: number, tris: number) => void }) {
  const { gl } = useThree();
  const frame = useRef(0);
  const last = useRef({ calls: -1, tris: -1, stable: 0 });
  useFrame(() => {
    if (last.current.stable >= 3) return;
    frame.current += 1;
    if (frame.current % 20 !== 0) return;
    const { calls, triangles: tris } = gl.info.render;
    if (calls === last.current.calls && tris === last.current.tris) {
      last.current.stable += 1;
      return;
    }
    last.current = { calls, tris, stable: 0 };
    onSample(calls, tris);
  });
  return null;
}

/**
 * Projects the Blender-authored anchors into screen space.
 *
 * This is what makes the DOM interface belong to the world instead of merely
 * covering it: the speech bubble sits where MARK_SpeechAnchor is, so it tracks
 * the lion's head as the camera or viewport changes, rather than at a CSS
 * percentage that happens to look right on one screen size.
 */
function AnchorProjector({
  markers, onAnchors,
}: {
  markers: WorldMarkers;
  onAnchors?: (a: Record<string, { x: number; y: number }>) => void;
}) {
  const { camera, size } = useThree();
  const last = useRef<string>('');
  const v = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    if (!onAnchors) return;
    const out: Record<string, { x: number; y: number }> = {};
    for (const [name, p] of Object.entries(markers)) {
      v.copy(p).project(camera);
      out[name] = { x: (v.x * 0.5 + 0.5) * 100, y: (-v.y * 0.5 + 0.5) * 100 };
    }
    // Only publish on real change — this runs every frame and each publish is a
    // React state update in the parent.
    const key = JSON.stringify(out, (_k, val) =>
      typeof val === 'number' ? Math.round(val * 10) / 10 : val);
    if (key !== last.current) { last.current = key; onAnchors(out); }
  });

  void size;
  return null;
}

/**
 * The look pass.
 *
 * Three findings from the reference, in order of how much they matter:
 *
 *  1. AMBIENT OCCLUSION does the heavy lifting. Everything in the scene was
 *     resting weakly on the ground because a directional shadow alone gives no
 *     contact darkening in creases — under a paw, where a trunk meets grass,
 *     between mane clumps. N8AO is used rather than the classic SSAO because it
 *     is temporally stable, and a flickering AO on a children's homepage is
 *     worse than none.
 *  2. A SHALLOW depth of field separates the hero from the background. The
 *     reference is unmistakably a rendered frame with a lens; a pinhole camera
 *     is what makes real-time scenes read as "a 3D model of a place".
 *  3. Gentle bloom on the brightest highlights only, plus the faintest vignette.
 *     High thresholds — bloom that catches the sky turns the whole frame milky.
 *
 * Everything here is off on low-end devices and under reduced-motion; see
 * RiverGarden3DWorld.
 */
/**
 * The production look: ambient occlusion, depth of field, bloom, vignette.
 *
 * THE FOCUS PLANE WAS 62 CENTIMETRES FROM THE CAMERA.
 *
 * This shipped as `focusDistance={0.62}`, and in postprocessing 6.39 that
 * property is in WORLD UNITS — so the focus sat 0.62 m away while the mascot
 * stands about 13 m away. Everything in the scene was out of focus, the
 * character included. It read as a soft, dreamy look and was actually a mascot
 * whose eyes could not be seen: the production cage lion's irises washed out
 * to blank ovals here while being perfectly crisp on the proof route, which
 * has never enabled this chain.
 *
 * Two wrong turns on the way, both worth recording because both looked right.
 * The bloom took the blame first — `luminanceThreshold` 0.86 against a white
 * sclera is a plausible story, and `?nobloom` cleared it. And the fix was
 * first written against the OLD normalized-depth semantics of this property,
 * complete with a table of four-decimal-place values; that was a derivation of
 * a version of the library this project does not use.
 *
 * `focusDistance` is now driven from the LIVE camera-to-subject distance every
 * frame rather than memoized, because `AdoptedCamera` positions the camera in
 * an effect that runs after this component mounts, and the homepage dollies it
 * along the authored view axis at different screen sizes. A value computed
 * once was measured before the camera had moved and put the plane at 5 m.
 *
 * The debug flags stay: `?nofx` narrowed this to the chain, `?nodof` to the
 * pass, `?nobloom` and `?noao` are there so the next surprise costs the same.
 */
function LookPass({ target, subjectRef }: {
  target: THREE.Vector3 | null;
  /** The brain, so the focus can follow the MASCOT rather than a fixed point. */
  subjectRef?: React.RefObject<{ x: number; z: number; eyeWorldY: number } | null>;
}) {
  const q = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const { camera } = useThree();
  const dof = useRef<DepthOfFieldEffect | null>(null);
  const subject = useMemo(
    () => (target ? target.clone() : new THREE.Vector3(0, 1, 0)),
    [target],
  );
  useFrame(() => {
    const e = dof.current;
    if (!e) return;
    /* THE MASCOT IS THE SUBJECT, so it is what the focus follows — at its eye
       line, which is the part that has to read. `MARK_CameraTarget` is only the
       fallback: it is the composition's anchor, not the character, and during a
       bridge crossing the two are metres apart. */
    const b = subjectRef?.current;
    if (b) subject.set(b.x, b.eyeWorldY, b.z);
    const d = camera.position.distanceTo(subject);
    /* Cast because postprocessing 6.39's shipped .d.ts declares
       `focusDistance` only as a CONSTRUCTOR option while the class carries a
       public getter/setter for it — verified in build/index.js. Setting it is
       the supported runtime path; the types simply lag. */
    if (d > 0.5) (e as unknown as { focusDistance: number }).focusDistance = d;
  });
  return (
    <EffectComposer multisampling={4} enableNormalPass>
      {!q.has('noao') && <N8AO
        aoRadius={0.55}
        distanceFalloff={0.9}
        intensity={2.4}
        color="#3a3350"
        halfRes
      />}
      {!q.has('nodof') && <DepthOfField
        ref={dof}
        /* The sharp band, in metres. Wide enough to hold the whole island and
           the mascot standing on it — a mascot with a soft face is not a depth
           cue, it is a bug, which is exactly how this shipped. The far bank
           sits 20 m and beyond and softens, which is the cue actually wanted. */
        /* focusRange and bokehScale in metres and pixels respectively. The
           pass shipped at `height={480}`, which renders it at 480p and
           composites back up — so even perfectly focused geometry lost
           resolution, and on a mascot whose iris is twenty pixels across that
           is the difference between an eye and a blank oval. Full resolution,
           and a gentler bokeh than the 2.6 it shipped with, which was tuned
           against a focus plane that was never on the subject. */
        focusRange={7}
        bokehScale={1.4}
        resolutionScale={1}
      />}
      {!q.has('nobloom') && <Bloom luminanceThreshold={0.86} luminanceSmoothing={0.28} intensity={0.42} mipmapBlur />}
      <Vignette offset={0.36} darkness={0.34} eskil={false} />
    </EffectComposer>
  );
}

/* ── Lighting ────────────────────────────────────────────────────────────── */

function Lighting() {
  // Matches the Blender rig in DIRECTION and hierarchy, not in numbers. Blender
  // watts and three.js intensities are unrelated units.
  //
  // The earlier whiteout was NOT this rig: Blender's own lights were travelling
  // inside the GLB as KHR_lights_punctual and overpowering everything. With
  // those stripped on load, this rig is finally in charge and can run at a
  // normal level. Under NoToneMapping the clipping ceiling still applies, so the
  // key does the shaping and the sky term stays a fill rather than a flood.
  return (
    <>
      <hemisphereLight args={['#cfe9ff', '#7fae66', 0.85] as const} />
      <directionalLight
        position={[6.5, 9.0, 5.2]}
        intensity={1.85}
        color="#fff7e6"
        castShadow
        shadow-mapSize={[2048, 2048]}
        /* Tightened to the visible stage: a wider frustum spends shadow-map
           resolution on water nobody looks at. */
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
        shadow-camera-near={0.5}
        shadow-camera-far={34}
        /* normalBias, not a negative depth bias. The river is a single large
           flat plane, and a negative bias made it shadow ITSELF across its whole
           surface — the water rendered as a grey slab with a hard rectangular
           edge at the shadow-camera boundary. */
        shadow-bias={-0.0001}
        shadow-normalBias={0.035}
      />
      <directionalLight position={[-7.0, 5.0, -6.0]} intensity={0.45} color="#dbeeff" />
    </>
  );
}

/* ── Public component ────────────────────────────────────────────────────── */

export interface HomeWorld3DProps {
  showLion?: boolean;
  /** Pin the lion to one clip. Leave null to let the brain decide. */
  lionClip?: string | null;
  /** Autonomous wandering around the island. */
  wander?: boolean;
  /** Receives the brain so a page can command the lion (walkTo, wave, ...). */
  brainRef?: React.MutableRefObject<LionBrain | null>;
  /** Screen-space positions (in %) of the Blender anchors, updated live. */
  onAnchors?: (anchors: Record<string, { x: number; y: number }>) => void;
  /** Fraction of the authored camera distance. See AdoptedCamera. */
  cameraDolly?: number;
  /** How much of the island the lion roams, 0..1. See LionBrain.stageRadius. */
  stageRadius?: number;
  /** Ambient occlusion, depth of field, bloom and vignette. See LookPass. */
  effects?: boolean;
  /**
   * Which character asset to load. Overridable so a review surface can stand
   * the raw production CAGE in the real world under the real lights — the only
   * honest test of a retopology pass is the runtime, not Blender.
   */
  lionUrl?: string;
  onStats?: (stats: WorldStats) => void;
  className?: string;
}

export default function HomeWorld3D({
  showLion = true, lionClip = null, wander = true, brainRef, onAnchors,
  cameraDolly = 1, stageRadius = 1, effects = false, lionUrl = LION_URL,
  onStats, className,
}: HomeWorld3DProps) {
  const [markers, setMarkers] = useState<WorldMarkers>({});
  const [glbCamera, setGlbCamera] = useState<THREE.PerspectiveCamera | null>(null);
  const [envScene, setEnvScene] = useState<THREE.Object3D | null>(null);
  const stats = useRef<Partial<WorldStats>>({});

  const handleEnvReady = useMemo(() => (data: {
    markers: WorldMarkers; camera: THREE.PerspectiveCamera | null; scene: THREE.Object3D;
    triangles: number; drawCalls: number; materials: number;
  }) => {
    setMarkers(data.markers);
    setGlbCamera(data.camera);
    setEnvScene(data.scene);
    stats.current = {
      ...stats.current,
      markers: data.markers,
      triangles: data.triangles,
      drawCalls: data.drawCalls,
      materials: data.materials,
      cameraPos: data.camera ? new THREE.Vector3().setFromMatrixPosition(data.camera.matrixWorld) : null,
      cameraFov: data.camera?.fov ?? null,
    };
    onStats?.(stats.current as WorldStats);
  }, [onStats]);

  const handleBrainClip = useMemo(() => (clip: LionClip) => {
    stats.current = { ...stats.current, lionBrainClip: clip };
    onStats?.(stats.current as WorldStats);
  }, [onStats]);

  const handleGaze = useMemo(() => (g: { yaw: number; pitch: number; head: number; want: number; aimErr: number; at: string }) => {
    stats.current = { ...stats.current, lionGaze: g };
    onStats?.(stats.current as WorldStats);
  }, [onStats]);

  const handleBridge = useMemo(() => (b: { has: boolean; progress: number; crossed: boolean; x: number; z: number }) => {
    stats.current = { ...stats.current, lionBridge: b };
    onStats?.(stats.current as WorldStats);
  }, [onStats]);

  const handleLionMeasured = useMemo(() => (height: number, grounded: boolean, clips: string[], floorGap: number) => {
    stats.current = { ...stats.current, lionHeight: height, lionGrounded: grounded, lionClips: clips, lionFloorGap: floorGap };
    onStats?.(stats.current as WorldStats);
  }, [onStats]);

  /* The walkable area comes from the MARK_WalkLeft / MARK_WalkRight anchors the
     environment was authored with, so re-tuning the island in Blender moves the
     lion's range automatically instead of silently leaving it walking off the
     edge or pacing a strip in the middle. */
  /* One ref for the brain, whether or not the caller wanted one.
     `AdoptedCamera` reads the lion's position through it to track the character
     — through the brain rather than through a second per-frame ref write,
     because assigning to a hook-provided ref trips `react-hooks/immutability`
     and this file already carries five of those. The brain publishes `x`/`z`
     as plain fields, so the camera needs nothing new. */
  const ownBrain = useRef<LionBrain | null>(null);
  const activeBrain = brainRef ?? ownBrain;

  const walkBounds = useMemo(() => {
    const l = markers.MARK_WalkLeft;
    const r = markers.MARK_WalkRight;
    const spawn = markers.MARK_LionSpawn;
    if (!l || !r) return null;
    const cx = (l.x + r.x) / 2;
    const cz = spawn ? spawn.z : (l.z + r.z) / 2;
    return { cx, cz, r: Math.max(0.4, Math.hypot(r.x - l.x, r.z - l.z) / 2) };
  }, [markers]);

  return (
    <div className={className} style={{ position: 'absolute', inset: 0 }}>
      <Canvas
        shadows
        dpr={[1, 1.75]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        /* The palette was authored under Blender's Standard view transform.
           R3F defaults to ACESFilmic, which desaturates and lifts exactly the
           way AgX did in Blender — the same fight, one renderer later. */
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.NoToneMapping;
          gl.outputColorSpace = THREE.SRGBColorSpace;
        }}
        style={{ position: 'absolute', inset: 0 }}
      >
        <color attach="background" args={['#8fd0f0']} />
        <Lighting />
        <Suspense fallback={null}>
          <Environment onReady={handleEnvReady} />
          {/* The environment GLB is a photograph until something animates it.
              See WorldLife: water, waterfall, bubbles, clouds, reeds, blossom
              and lily pads, at zero extra draw calls. */}
          <WorldLife scene={envScene} />
          {showLion && (
            <Lion
              spawn={markers.MARK_LionSpawn ?? null}
              bounds={walkBounds}
              ground={envScene}
              clipOverride={lionClip}
              wander={wander}
              stageRadius={stageRadius}
              brainRef={activeBrain}
              lionUrl={lionUrl}
              onMeasured={handleLionMeasured}
              onBrainClip={handleBrainClip}
              onGaze={handleGaze}
              onBridge={handleBridge}
              interestMarkers={markers}
            />
          )}
          <Preload all />
        </Suspense>
        {effects && <LookPass target={markers.MARK_CameraTarget ?? null} subjectRef={activeBrain} />}
        <AdoptedCamera
          source={glbCamera}
          target={markers.MARK_CameraTarget ?? null}
          dolly={cameraDolly}
          follow={activeBrain}
          home={markers.MARK_LionSpawn ?? null}
          onTrack={(m) => {
            stats.current = { ...stats.current, cameraTrack: m };
            onStats?.(stats.current as WorldStats);
          }}
        />
        <AnchorProjector markers={markers} onAnchors={onAnchors} />
        <PerfProbe onSample={(calls, tris) => {
          stats.current = { ...stats.current, drawCalls: calls, triangles: tris };
          onStats?.(stats.current as WorldStats);
        }} />
      </Canvas>
    </div>
  );
}

useGLTF.preload(ENV_URL);
