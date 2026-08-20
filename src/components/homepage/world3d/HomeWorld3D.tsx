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
import { useGLTF, Preload } from '@react-three/drei';
import * as THREE from 'three';

const ENV_URL = '/assets/worlds/river-garden/home_environment.glb';
/* Retopologised blockout: one continuous quad mesh, 15.8k tris, 278KB — against
   2.4MB for the old 96-part rigid assembly. Unrigged, so it stands as a static
   proxy for scale and composition checking until the skeleton lands. */
const LION_URL = '/assets/lion/retopo/lion_retopo.glb';

/**
 * Total lion height in metres, matching the world scale contract in
 * tools/blender/build_home_environment.py (0.85m at the shoulder, plus head and
 * mane above it). The lion GLB was authored in its own space and arrives about
 * 3.5m tall — four times oversized — so it is normalised here from its measured
 * bounding box rather than by a hard-coded multiplier, which keeps working if
 * the lion asset is re-exported at a different size.
 */
const LION_TARGET_HEIGHT = 1.10;

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
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        const geo = mesh.geometry;
        if (geo?.index) triangles += geo.index.count / 3;
        else if (geo?.attributes?.position) triangles += geo.attributes.position.count / 3;
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((m) => m && materialSet.add(m));
      }
    });

    const cam = (cameras?.[0] as THREE.PerspectiveCamera) ?? null;
    return { markers, camera: cam, triangles: Math.round(triangles), drawCalls, materials: materialSet.size };
  }, [scene, cameras]);

  useEffect(() => { onReady(prepared); }, [prepared, onReady]);

  return <primitive object={scene} />;
}

/* ── Lion ────────────────────────────────────────────────────────────────── */

function Lion({
  spawn,
  onMeasured,
}: {
  spawn: THREE.Vector3 | null;
  onMeasured: (height: number, grounded: boolean) => void;
}) {
  const { scene } = useGLTF(LION_URL);
  const group = useRef<THREE.Group>(null);

  const clone = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    if (!spawn || !group.current) return;
    // Measure as loaded, normalise to the world scale contract, THEN seat the
    // feet on the marker. Order matters: scaling after positioning would move
    // the feet off the ground again.
    const raw = new THREE.Box3().setFromObject(clone);
    const rawSize = new THREE.Vector3();
    raw.getSize(rawSize);

    const scale = rawSize.y > 0 ? LION_TARGET_HEIGHT / rawSize.y : 1;
    clone.scale.setScalar(scale);
    clone.updateMatrixWorld(true);

    const scaled = new THREE.Box3().setFromObject(clone);
    const scaledSize = new THREE.Vector3();
    scaled.getSize(scaledSize);

    // Seat the feet on the marker rather than assuming the asset origin is at
    // ground level — that assumption is what makes characters hover or sink.
    group.current.position.set(spawn.x, spawn.y - scaled.min.y, spawn.z);
    onMeasured(scaledSize.y, Math.abs(scaled.min.y) < 0.01);
  }, [clone, spawn, onMeasured]);

  /* The character is modelled facing +Y in Blender, which after the glTF Y-up
     conversion points it straight away from the production camera. Turn it to
     face the viewer. */
  return (
    <group ref={group} rotation={[0, Math.PI, 0]}>
      <primitive object={clone} />
    </group>
  );
}

/* ── Camera adopted from the GLB ─────────────────────────────────────────── */

function AdoptedCamera({ source }: { source: THREE.PerspectiveCamera | null }) {
  const { camera, size } = useThree();

  useEffect(() => {
    if (!source) return;
    const cam = camera as THREE.PerspectiveCamera;
    source.updateMatrixWorld(true);
    // Copy the authored transform. The framing was approved in Blender against
    // the reference; re-deriving it here by eye would throw that away.
    cam.position.setFromMatrixPosition(source.matrixWorld);
    cam.quaternion.setFromRotationMatrix(source.matrixWorld);
    cam.fov = source.fov;
    cam.near = 0.05;
    cam.far = 300;
    cam.aspect = size.width / size.height;
    cam.updateProjectionMatrix();
  }, [source, camera, size]);

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
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
        shadow-camera-near={0.5}
        shadow-camera-far={40}
        shadow-bias={-0.0008}
      />
      <directionalLight position={[-7.0, 5.0, -6.0]} intensity={0.45} color="#dbeeff" />
    </>
  );
}

/* ── Public component ────────────────────────────────────────────────────── */

export interface HomeWorld3DProps {
  showLion?: boolean;
  onStats?: (stats: WorldStats) => void;
  className?: string;
}

export default function HomeWorld3D({ showLion = true, onStats, className }: HomeWorld3DProps) {
  const [markers, setMarkers] = useState<WorldMarkers>({});
  const [glbCamera, setGlbCamera] = useState<THREE.PerspectiveCamera | null>(null);
  const stats = useRef<Partial<WorldStats>>({});

  const handleEnvReady = useMemo(() => (data: {
    markers: WorldMarkers; camera: THREE.PerspectiveCamera | null;
    triangles: number; drawCalls: number; materials: number;
  }) => {
    setMarkers(data.markers);
    setGlbCamera(data.camera);
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

  const handleLionMeasured = useMemo(() => (height: number, grounded: boolean) => {
    stats.current = { ...stats.current, lionHeight: height, lionGrounded: grounded };
    onStats?.(stats.current as WorldStats);
  }, [onStats]);

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
            <Lion spawn={markers.MARK_LionSpawn ?? null} onMeasured={handleLionMeasured} />
          )}
          <Preload all />
        </Suspense>
        <AdoptedCamera source={glbCamera} />
        <PerfProbe onSample={(calls, tris) => {
          stats.current = { ...stats.current, drawCalls: calls, triangles: tris };
          onStats?.(stats.current as WorldStats);
        }} />
      </Canvas>
    </div>
  );
}

useGLTF.preload(ENV_URL);
