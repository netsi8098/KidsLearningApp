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
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';
import { LionBrain, type LionClip } from './lionBrain';

const ENV_URL = '/assets/worlds/river-garden/home_environment.glb';
/* Rigged lion: one continuous skinned quad mesh plus separate eye, tooth and
   claw geometry, 41 joints, ten authored clips. */
const LION_URL = '/assets/lion/rigged/lion_v2.glb';

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

  // Real clip lengths, so a "play Wave then carry on" task ends when the wave
  // actually ends rather than after a number someone typed.
  useEffect(() => {
    const d: Partial<Record<LionClip, number>> = {};
    animations.forEach((a) => { d[a.name as LionClip] = a.duration; });
    brain.setDurations(d);
  }, [animations, brain]);

  useEffect(() => {
    if (!spawn || !group.current) return;
    const raw = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    raw.getSize(size);

    const scale = size.y > 0 ? LION_TARGET_HEIGHT / size.y : 1;
    model.scale.setScalar(scale);
    model.updateMatrixWorld(true);

    const scaled = new THREE.Box3().setFromObject(model);
    const scaledSize = new THREE.Vector3();
    scaled.getSize(scaledSize);

    // Seat the FEET on the marker rather than assuming the asset origin is at
    // ground level — that assumption is what makes characters hover or sink.
    footOffset.current = -scaled.min.y;

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
    brain.x = spawn.x;
    brain.z = spawn.z;
    brain.setHome(spawn.x, spawn.z);
    group.current.position.set(spawn.x, spawn.y + footOffset.current, spawn.z);
    /* Report the FLOOR GAP itself, not a pass/fail against an arbitrary 2cm.
       The gap varies legitimately with the asset — the cage's paw soles sit 8mm
       above its own origin — and the seating code below compensates for it
       exactly, so a boolean here was reporting "not grounded" about a character
       that was correctly on the ground. */
    onMeasured(scaledSize.y, Math.abs(scaled.min.y) < 0.05, names, scaled.min.y);
  }, [model, spawn, onMeasured, names, brain, lionUrl]);

  /* Cross-fade between clips rather than cutting, so the character never snaps.
     Wave, Jump and Celebrate are one-shots: looping them makes the lion twitch
     forever instead of performing once and returning to rest. */
  useEffect(() => {
    const next = actions[activeClip];
    if (!next) return;
    const once = activeClip === 'Wave' || activeClip === 'Jump' || activeClip === 'Nod';
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
  const ray = useMemo(() => new THREE.Raycaster(), []);
  const down = useMemo(() => new THREE.Vector3(0, -1, 0), []);
  const from = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, dt) => {
    if (!group.current) return;
    brain.step(dt);
    const clip = (clipOverride as LionClip | null) ?? brain.clip;
    if (clip !== activeClip && actions[clip]) setActiveClip(clip);

    let y = group.current.position.y;
    if (ground) {
      from.set(brain.x, 6, brain.z);
      ray.set(from, down);
      const hit = ray.intersectObject(ground, true)[0];
      if (hit) y = hit.point.y + footOffset.current;
    }
    group.current.position.set(brain.x, y, brain.z);
    /* Modelled facing +Y, which after the glTF Y-up conversion points straight
       away from the production camera. Math.PI is that correction; the brain's
       yaw is added on top of it. */
    group.current.rotation.y = Math.PI + brain.yaw;
    mixer.update(0);
  });

  return (
    <group ref={group}>
      <primitive object={model} />
    </group>
  );
}

/* ── Camera adopted from the GLB ─────────────────────────────────────────── */

function AdoptedCamera({ source, target, dolly = 1 }: {
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
}) {
  const { camera, size } = useThree();

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
  }, [source, camera, size, target, dolly]);

  return null;
}

/** Reports real renderer counters, which are the only honest perf numbers. */
function PerfProbe({ onSample }: { onSample: (calls: number, tris: number) => void }) {
  const { gl } = useThree();
  const frame = useRef(0);
  useFrame(() => {
    frame.current += 1;
    if (frame.current === 30) {
      onSample(gl.info.render.calls, gl.info.render.triangles);
    }
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
function LookPass({ focusZ }: { focusZ: number }) {
  return (
    <EffectComposer multisampling={4} enableNormalPass>
      <N8AO
        aoRadius={0.55}
        distanceFalloff={0.9}
        intensity={2.4}
        color="#3a3350"
        halfRes
      />
      <DepthOfField
        focusDistance={focusZ}
        focalLength={0.06}
        bokehScale={2.6}
        height={520}
      />
      <Bloom luminanceThreshold={0.86} luminanceSmoothing={0.28} intensity={0.42} mipmapBlur />
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

  const handleLionMeasured = useMemo(() => (height: number, grounded: boolean, clips: string[], floorGap: number) => {
    stats.current = { ...stats.current, lionHeight: height, lionGrounded: grounded, lionClips: clips, lionFloorGap: floorGap };
    onStats?.(stats.current as WorldStats);
  }, [onStats]);

  /* The walkable area comes from the MARK_WalkLeft / MARK_WalkRight anchors the
     environment was authored with, so re-tuning the island in Blender moves the
     lion's range automatically instead of silently leaving it walking off the
     edge or pacing a strip in the middle. */
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
          {showLion && (
            <Lion
              spawn={markers.MARK_LionSpawn ?? null}
              bounds={walkBounds}
              ground={envScene}
              clipOverride={lionClip}
              wander={wander}
              stageRadius={stageRadius}
              brainRef={brainRef}
              lionUrl={lionUrl}
              onMeasured={handleLionMeasured}
            />
          )}
          <Preload all />
        </Suspense>
        {effects && <LookPass focusZ={0.62} />}
        <AdoptedCamera source={glbCamera} target={markers.MARK_CameraTarget ?? null} dolly={cameraDolly} />
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
