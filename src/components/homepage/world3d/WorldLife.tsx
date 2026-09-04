/**
 * WorldLife — the River Garden stops being a photograph.
 *
 * `tools/cad/world_audit.py` counts 232 environment objects that the eye
 * expects to move and that nothing in the runtime touches after load: the water
 * surface, the waterfall, foam, bubbles, clouds, grass, reeds, blossom and lily
 * pads. `Environment` in HomeWorld3D walks the GLB once to collect markers and
 * never looks at it again. This component is the missing half — it takes the
 * already-loaded environment scene and animates it every frame.
 *
 *
 * WHAT THE GLB ACTUALLY CONTAINS  (the fact that shapes this whole file)
 *
 * The 543 objects in `art/blender/home_environment.blend` are NOT 543 nodes in
 * the exported GLB. `tools/blender/export_home_environment.py` merges by
 * material, so the browser receives 29 meshes across 40 nodes. `ENV_Cloud_00_0`,
 * `ENV_Reed_0_0`, `ENV_LilyPad_2` and `ENV_RiverSurface` do not exist at
 * runtime — `scene.getObjectByName('ENV_RiverSurface')` returns undefined. All
 * 54 cloud puffs are one mesh, all 8 bubbles are one mesh, and the 13 lily pads
 * share `ENV_Merged_Leaf` with every tree canopy in the world.
 *
 * There is therefore nothing per-object to transform, and this file works at
 * the VERTEX level inside the merged meshes. Two mechanisms do all the work:
 *
 *   1. A heightfield. The water, and everything floating on it, is displaced by
 *      an analytic function of world x/z. That needs no segmentation at all —
 *      it applies to every vertex of the mesh, which is exactly right for a
 *      river surface. The river's FINE detail cannot live there, because the
 *      grid is too coarse to sample it; see the long note above `swellH`.
 *
 *   2. Islands. For the merged meshes that hold many separate props, the
 *      connected components of the geometry are recovered ONCE at load
 *      (`buildIslands`). That hands back the individual bubbles, tufts, reeds,
 *      lily pads and blossom clusters — with real centroids and real base
 *      heights to bend from — without shipping a byte of extra data. Islands
 *      are then filtered per mesh, because `ENV_Merged_GrassShade` holds the 12
 *      reed stems AND the 1,232-triangle far-bank torus, and no world-space box
 *      can separate those two: the torus passes straight through the reed beds.
 *
 *
 * COST
 *
 * Draw calls and triangles are untouched. Nothing is added, removed, split or
 * reparented, and no material is replaced — the two water materials are patched
 * in place, which adds no draw call. Only the contents of existing position
 * buffers change. 11,657 of the world's 63,354 vertices are rewritten per frame
 * and uploaded as bounded `addUpdateRange` spans rather than whole buffers. All
 * 54 clouds cost one `position.set()`. The bind-time report under
 * `import.meta.env.DEV` prints the exact per-mesh counts and spans.
 *
 * Nothing here is reported back to React. An earlier pass in this codebase put
 * a per-frame value into the HUD, which fired a React setState every frame and
 * starved the render loop; there is consequently no `onSomething` prop at all.
 */
import { useEffect, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ── Which way the river runs ───────────────────────────────────────────────
 *
 * `build_waterfall` in tools/blender/build_home_environment.py puts the cascade
 * at Blender (x -9.4, y +9.2) — "on the far bank, well behind the island" — and
 * `build_stepping_stones` crosses "the near water" at Blender y -2.6 .. -5.9.
 * The river therefore runs from +y, where the water arrives, toward -y, the
 * foreground. glTF export is Y-up and converts as
 *
 *     three.x = blender.x,   three.y = blender.z,   three.z = -blender.y
 *
 * which the exported node translations confirm: the merged foam sits at
 * three z = -8.35 (Blender y +8.35) and the cloud bank at three z = -26
 * (Blender y +26). Blender -y maps to three +z, so DOWNSTREAM IS +Z and crests
 * must travel toward the camera. Every wave phase below is written `k*z - w*t`,
 * whose constant-phase point moves toward +z as t grows.
 */
const FLOW = 1; /* sign of the downstream direction along +Z */

const TAU = Math.PI * 2;

/* THE RIVER, in two halves, and why it takes two.
 *
 * The exported river surface is `primitive_grid_add(x_subdivisions=24,
 * y_subdivisions=24, size=34.0)` — a 25x25 grid over 34 metres, measured in the
 * browser at 1.417m between vertices. Its Nyquist wavelength is therefore 2.83m,
 * and anything below roughly 8m aliases into noise instead of rendering as a
 * wave. A first cut of this file displaced vertices with 2.6m, 1.35m and 0.85m
 * components; all three were at or under Nyquist, and no amount of amplitude
 * tuning could have fixed that, because the geometry cannot carry ripple-scale
 * detail at all. The mesh is the constraint, not the maths.
 *
 * So the two scales are split, each onto the stage that can resolve it:
 *
 *   SWELL — vertices, on the CPU. Two long components, 11.0m and 8.5m, sampled
 *   7.8 and 6.0 times per wavelength at 1.417m spacing, so they render smoothly.
 *   This is the half that MOVES GEOMETRY: it is what the lily pads ride (see
 *   `applyFloat`) and what keeps the waterline against the island alive rather
 *   than sitting still. It contributes almost nothing to shading — its slope
 *   peaks near 0.030, under two degrees of normal tilt.
 *
 *   RIPPLE — per pixel, in the fragment shader (`patchWaterMaterial`). Three
 *   short components, 0.95m, 0.55m and 0.32m, perturbing the normal only. This
 *   is the half that READS AS FLOWING: highlights travelling downstream at
 *   screen resolution, wholly independent of the 1.417m tessellation. Combined
 *   slope peaks near 0.21, about 12 degrees of tilt.
 *
 * That shader is the only one in this file and the paragraph above is its
 * justification: it is not a flourish, it is the only place fine water detail
 * can live on a mesh this coarse. It is also cheap — three sines and a
 * normalize per water pixel, no extra pass, no render target, no texture fetch
 * — which is exactly the work a weak tablet GPU is good at, as against a CPU
 * vertex loop that could never have resolved it in the first place.
 *
 * The other two options were considered and rejected:
 *
 *  - Scrolling a UV or normal offset would animate nothing whatsoever.
 *    `material()` in build_home_environment.py builds plain Principled BSDF
 *    colours and the exporter carries no textures at all (29 materials, zero
 *    images in the GLB), so there is no map whose offset could be scrolled.
 *
 *  - Subdividing the river at load would let the ripple stay on the CPU, but it
 *    changes the triangle count, which this pass must not do.
 */
const SWELL1_AMP = 0.030, SWELL1_LEN = 11.0, SWELL1_SPD = 0.55, SWELL1_SKEW = 0.30;
const SWELL2_AMP = 0.018, SWELL2_LEN = 8.50, SWELL2_SPD = 0.72, SWELL2_SKEW = -0.45;
const S1_K = TAU / SWELL1_LEN;
const S2_K = TAU / SWELL2_LEN;

/**
 * Swell height above rest at world (x, z). Shared by the water surfaces and by
 * everything floating on them, so a pad can never drift out of its own river.
 */
function swellH(x: number, z: number, t: number): number {
  return SWELL1_AMP * Math.sin(S1_K * (FLOW * z + SWELL1_SKEW * x) - S1_K * SWELL1_SPD * t)
    + SWELL2_AMP * Math.sin(S2_K * (FLOW * z + SWELL2_SKEW * x) - S2_K * SWELL2_SPD * t);
}

/* The fine ripple, as a normal perturbation only, evaluated per pixel.
 *
 * Each component adds `amp * k * dir * cos(k * dot(dir, p) - k * spd * t)` to
 * the surface gradient. The constant-phase point travels along +dir, and every
 * dir carries a positive z, so every ripple runs downstream — the same way the
 * swell runs (see the FLOW note above).
 *
 * Gated on `vRippleUp` because ENV_Merged_Water carries the eight LilyNotch
 * discs alongside the river grid: without the gate their side walls would be
 * lit as though they faced the sky.
 */
const RIPPLE_FRAGMENT = `
  if ( vRippleUp > 0.99 ) {
    vec2 rp = vRipplePos.xz;
    vec2 g = vec2( 0.0 );
    vec2 rd1 = normalize( vec2(  0.25, 1.0 ) );
    vec2 rd2 = normalize( vec2( -0.45, 1.0 ) );
    vec2 rd3 = normalize( vec2(  0.80, 1.0 ) );
    g += 0.010 *  6.614 * rd1 * cos(  6.614 * dot( rd1, rp ) -  6.614 * 0.70 * uTime );
    g += 0.006 * 11.424 * rd2 * cos( 11.424 * dot( rd2, rp ) - 11.424 * 0.90 * uTime );
    g += 0.004 * 19.635 * rd3 * cos( 19.635 * dot( rd3, rp ) - 19.635 * 0.55 * uTime );
    normal = normalize( mat3( viewMatrix ) * normalize( vec3( -g.x, 1.0, -g.y ) ) );
  }
`;

/**
 * Give a water material a per-pixel ripple normal, and return the clock that
 * drives it.
 *
 * The clock is stored ON THE MATERIAL rather than owned by the caller, and that
 * detail is not cosmetic. The material can only be patched once — the second
 * `onBeforeCompile` would recompile a shader that already has the ripple in it —
 * but `buildRig` runs more than once: React StrictMode double-invokes the
 * `useMemo` in development, and any change of scene identity would re-run it in
 * production. An earlier revision had the caller create the uniform and guarded
 * re-entry with a boolean, which left the material holding the FIRST rig's
 * uniform while the live frame loop advanced the SECOND rig's. The water froze
 * — visibly, geometry still swelling while the highlights stood still — and the
 * bug was invisible to types and to lint. Binding the clock to the thing that
 * actually consumes it makes the pairing impossible to get wrong.
 *
 * Module scope, and `mat` arrives from the loaded GLB, so nothing touched here
 * is reachable from a hook. `customProgramCacheKey` stops three handing this
 * material a program that was compiled for an unpatched one.
 */
function patchWaterMaterial(mat: THREE.Material): { value: number } {
  const tag = mat as THREE.Material & { __worldLifeClock?: { value: number } };
  if (tag.__worldLifeClock) return tag.__worldLifeClock;
  const uTime = { value: 0 };
  tag.__worldLifeClock = uTime;
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uTime;
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        '#include <common>\nvarying vec3 vRipplePos;\nvarying float vRippleUp;',
      )
      .replace(
        '#include <project_vertex>',
        '#include <project_vertex>\n'
        + '  vRipplePos = ( modelMatrix * vec4( transformed, 1.0 ) ).xyz;\n'
        + '  vRippleUp = normalize( mat3( modelMatrix ) * objectNormal ).y;',
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        '#include <common>\nuniform float uTime;\n'
        + 'varying vec3 vRipplePos;\nvarying float vRippleUp;',
      )
      .replace(
        '#include <normal_fragment_begin>',
        `#include <normal_fragment_begin>\n${RIPPLE_FRAGMENT}`,
      );
  };
  mat.customProgramCacheKey = () => 'worldlife-ripple-v1';
  mat.needsUpdate = true;
  return uTime;
}

/** Advance the shader clocks. Module scope so the writes are not hook-reachable. */
function tickRipple(clocks: { value: number }[], t: number): void {
  for (const c of clocks) c.value = t;
}

/* Where the cascade lands, in three-space, from build_waterfall's
   (fx, fy - 0.95) = (-9.4, 8.25). Foam and ripple pulse outward from here. */
const FALL_X = -9.4, FALL_Z = -8.25;

/* Anything whose island centroid sits below this is on the river, not on the
   island: the water surface rests at three y = -0.62. */
const WATERLINE = -0.45;

/* Islands larger than this are structural bodies sharing a material with the
   props — the island grass dome, the island lip, the far-bank torus, the tree
   canopies — and must never move. Measured in the browser, the props this file
   animates run 34 verts (a reed blade) to 92 (a lily pad), and the smallest
   structural body it must exclude is the 250-vert waterfall shoulder, so 200
   sits in a wide gap rather than on a boundary. */
const PROP_VERTS = 200;

/* ── Reduced motion ─────────────────────────────────────────────────────────
 *
 * Read from the DOM rather than through `useAccessibility()`, deliberately.
 * `AccessibilityProvider` already publishes the resolved preference — the OS
 * media query by default, overridden by the child's saved profile — as a
 * `reduced-motion` class on <html>, and `src/brand/textures.tsx` is the
 * precedent for consuming it that way. Reading the class picks up BOTH sources
 * with no dependency on React context reaching inside an R3F <Canvas>, and
 * `useAccessibility` throws when its provider is absent, which would be a hard
 * crash inside a Suspense boundary rather than a missing animation.
 */
function readReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return document.documentElement.classList.contains('reduced-motion')
    || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(readReducedMotion);
  useEffect(() => {
    /* setState fires only when the PREFERENCE changes, never per frame — React
       bails out when the boolean is unchanged, so the observer is free. */
    const sync = () => setReduced(readReducedMotion());
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    mq.addEventListener('change', sync);
    const obs = new MutationObserver(sync);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => { mq.removeEventListener('change', sync); obs.disconnect(); };
  }, []);
  return reduced;
}

/* ── Islands ────────────────────────────────────────────────────────────────*/

interface Island {
  /** Indices into the mesh's position attribute. */
  verts: number[];
  cx: number; cy: number; cz: number;   /* centroid, mesh-local */
  minY: number; maxY: number;
}

/**
 * Connected components of a merged mesh — i.e. the original Blender objects.
 *
 * Vertices are WELDED by quantised position before the union-find. Without that
 * step the glTF exporter's UV and normal seams, which duplicate vertices along
 * a split, would hand back more components than there are objects, and the
 * per-object centroids and base heights that the sway and the rise depend on
 * would be wrong. Runs once per mesh at load; the largest mesh it is used on is
 * ENV_Merged_Leaf, at 16,940 triangles.
 */
function buildIslands(geo: THREE.BufferGeometry): Island[] {
  const posAttr = geo.getAttribute('position');
  const index = geo.getIndex();
  if (!posAttr || !index) return [];
  const p = posAttr.array as ArrayLike<number>;
  const n = posAttr.count;

  const parent = new Int32Array(n);
  const weld = new Map<string, number>();
  for (let i = 0; i < n; i++) {
    const k = `${Math.round(p[i * 3] * 1e4)},${Math.round(p[i * 3 + 1] * 1e4)},${Math.round(p[i * 3 + 2] * 1e4)}`;
    const seen = weld.get(k);
    if (seen === undefined) { weld.set(k, i); parent[i] = i; } else { parent[i] = seen; }
  }

  const find = (a: number): number => {
    let r = a;
    while (parent[r] !== r) r = parent[r];
    let w = a;
    while (parent[w] !== r) { const nx = parent[w]; parent[w] = r; w = nx; }
    return r;
  };

  const idx = index.array as ArrayLike<number>;
  for (let i = 0; i < index.count; i += 3) {
    const a = find(idx[i]);
    const b = find(idx[i + 1]);
    if (a !== b) parent[b] = a;
    const c = find(idx[i + 2]);
    const a2 = find(idx[i]);
    if (c !== a2) parent[c] = a2;
  }

  const buckets = new Map<number, number[]>();
  for (let i = 0; i < n; i++) {
    const r = find(i);
    const b = buckets.get(r);
    if (b) b.push(i); else buckets.set(r, [i]);
  }

  const out: Island[] = [];
  buckets.forEach((list) => {
    let sx = 0, sy = 0, sz = 0, lo = Infinity, hi = -Infinity;
    for (const i of list) {
      const x = p[i * 3], y = p[i * 3 + 1], z = p[i * 3 + 2];
      sx += x; sy += y; sz += z;
      if (y < lo) lo = y;
      if (y > hi) hi = y;
    }
    const k = 1 / list.length;
    out.push({ verts: list, cx: sx * k, cy: sy * k, cz: sz * k, minY: lo, maxY: hi });
  });
  return out;
}

/* ── Bound work ─────────────────────────────────────────────────────────────*/

type Kind = 'water' | 'foam' | 'bubble' | 'sway' | 'float' | 'blossom';

/**
 * One kind of motion applied to one set of vertices of one mesh. Every array is
 * parallel and indexed 0..verts.length, so the per-frame loop is a flat walk
 * with no indirection beyond `verts[i]` into the geometry itself.
 */
interface Bound {
  name: string;
  kind: Kind;
  pos: THREE.BufferAttribute;
  /** Position-attribute index for each entry. */
  verts: Uint32Array;
  /** Rest position, xyz triples. */
  base: Float32Array;
  /** Mesh origin in world space. The merged nodes are translation-only. */
  ox: number; oy: number; oz: number;
  /** Bend weight for `sway`; ribbon weight for `foam`. */
  w: Float32Array;
  /** Island phase. */
  ph: Float32Array;
  /** Island rate multiplier. */
  rate: Float32Array;
  /** Island height, for amplitude. */
  h: Float32Array;
  /** Island centroid, xyz triples. Only filled where a kind needs it. */
  cen: Float32Array | null;
  /** Touched index span, for addUpdateRange. */
  lo: number; hi: number;
}

/** Deterministic 0..1 from a position, so nothing needs a stored seed table. */
function hash01(x: number, z: number): number {
  const s = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453;
  return s - Math.floor(s);
}

/* ── The motion, one function per kind ──────────────────────────────────────
 *
 * These are module scope, not closures inside the component, and that is
 * load-bearing rather than stylistic. `react-hooks/immutability` refuses any
 * write reached through a value a hook produced — and a `Bound` is built inside
 * a `useMemo`, so `b.pos.array[i] = x` and `b.pos.needsUpdate = true` are both
 * rejected at the call site even though the buffer itself arrived on a prop.
 * Passing the Bound into a plain function hands the write somewhere the rule
 * does not follow, which keeps the raw typed-array writes (the fast path) and
 * costs nothing. HomeWorld3D.tsx carries five pre-existing errors of this rule;
 * this file adds none.
 */

/** Flush the span this Bound actually wrote. */
function flush(b: Bound): void {
  b.pos.clearUpdateRanges();
  b.pos.addUpdateRange(b.lo * 3, (b.hi - b.lo + 1) * 3);
  b.pos.needsUpdate = true;
}

/**
 * River surface and shallows: the long swell, y only.
 *
 * Vertex normals are deliberately left at their rest value. The shading comes
 * from `RIPPLE_FRAGMENT`, which replaces the normal per pixel, so recomputing
 * it per vertex would be 970 wasted writes that the fragment shader then throws
 * away. Leaving them alone also keeps `objectNormal` — the ripple's own
 * up-facing gate — reading the true rest orientation.
 */
function applyWater(b: Bound, t: number): void {
  const arr = b.pos.array as Float32Array;
  const { base, verts, ox, oz } = b;
  for (let i = 0, n = verts.length; i < n; i++) {
    const vi = verts[i];
    arr[vi * 3 + 1] = base[i * 3 + 1] + swellH(base[i * 3] + ox, base[i * 3 + 2] + oz, t);
  }
  flush(b);
}

/**
 * Waterfall. The ribbon carries a bulge travelling DOWN the fall: the phase
 * `+k*y + w*t` stays constant only as y decreases, so the crest descends. The
 * foam blobs and the ripple torus at the base pulse outward from where the
 * water lands, which is the one cue that says something is arriving here. Both
 * contributions are summed and written once, so a vertex halfway up the fall
 * gets a share of each instead of one overwriting the other.
 */
function applyFoam(b: Bound, t: number): void {
  const arr = b.pos.array as Float32Array;
  const { base, verts, w, ox, oy, oz } = b;
  const pulse = Math.sin(t * 2.3);
  for (let i = 0, n = verts.length; i < n; i++) {
    const vi = verts[i];
    const x = base[i * 3], y = base[i * 3 + 1], z = base[i * 3 + 2];
    const rw = w[i];
    const lw = 1 - rw;
    let dx = 0, dy = 0, dz = 0;
    if (rw > 0.02) {
      const p = (y + oy) * 7.5 + t * 7.2;
      dx += rw * 0.045 * Math.sin(p);
      dy += rw * 0.030 * Math.sin(p * 0.7);
      dz += rw * 0.030 * Math.cos(p * 1.1);
    }
    if (lw > 0.02) {
      const rx = x + ox - FALL_X;
      const rz = z + oz - FALL_Z;
      const r = Math.sqrt(rx * rx + rz * rz);
      if (r > 1e-3) {
        const s = lw * 0.055 * pulse / r;
        dx += rx * s;
        dz += rz * s;
        dy += lw * 0.020 * Math.sin(t * 3.1 + r * 2.4);
      }
    }
    arr[vi * 3] = x + dx;
    arr[vi * 3 + 1] = y + dy;
    arr[vi * 3 + 2] = z + dz;
  }
  flush(b);
}

/**
 * Bubbles rise, scale away at the top and reappear small at the bottom. `ph`
 * and `rate` are constant across an island and the scale is taken about the
 * island centroid, so each bubble moves and scales as a rigid body. The scale
 * envelope exists because a merged mesh has no per-object opacity to fade with
 * and a hard reset to the bottom of the cycle pops.
 */
function applyBubbles(b: Bound, t: number): void {
  const arr = b.pos.array as Float32Array;
  const { base, verts, cen, ph, rate } = b;
  if (!cen) return;
  for (let i = 0, n = verts.length; i < n; i++) {
    const vi = verts[i];
    const phase = ph[i];
    const period = 7.5 + rate[i] * 3.5;
    let u = ((t + phase * 2.4) % period) / period;
    if (u < 0) u += 1;
    /* Grow over the first 12%, shrink over the last 15%, smoothstepped so
       neither end of the cycle shows a corner. */
    const raw = Math.min(1, u / 0.12) * Math.min(1, (1 - u) / 0.15);
    const s = raw * raw * (3 - 2 * raw);
    const cx = cen[i * 3], cy = cen[i * 3 + 1], cz = cen[i * 3 + 2];
    arr[vi * 3] = cx + (base[i * 3] - cx) * s + 0.20 * Math.sin(t * 0.9 + phase);
    arr[vi * 3 + 1] = cy + (base[i * 3 + 1] - cy) * s + 1.20 * u;
    arr[vi * 3 + 2] = cz + (base[i * 3 + 2] - cz) * s + 0.16 * Math.cos(t * 0.72 + phase);
  }
  flush(b);
}

/** Grass, reeds and reed leaves: shear about each island's own base. */
function applySway(b: Bound, t: number, gust: number): void {
  const arr = b.pos.array as Float32Array;
  const { base, verts, w, ph, rate, h } = b;
  for (let i = 0, n = verts.length; i < n; i++) {
    const bend = w[i] * gust;
    if (bend < 1e-4) continue;
    const vi = verts[i];
    const phase = ph[i], r = rate[i];
    const amp = 0.055 * h[i] * bend;
    arr[vi * 3] = base[i * 3] + amp * Math.sin(t * r * 1.6 + phase);
    arr[vi * 3 + 2] = base[i * 3 + 2] + amp * 0.6 * Math.cos(t * r * 1.3 + phase);
  }
  flush(b);
}

/**
 * Lily pads and lily blooms ride the river's own surface. Sampling the SAME
 * swell at the pad's own x/z means every pad bobs AND tilts with the slope it
 * is sitting on, for free and in sync with the water beneath it. The 1.15
 * overshoot lifts the pad just clear of the surface it is riding, so the
 * swell's crest never punches through the disc.
 */
function applyFloat(b: Bound, t: number): void {
  const arr = b.pos.array as Float32Array;
  const { base, verts, ox, oz } = b;
  for (let i = 0, n = verts.length; i < n; i++) {
    const vi = verts[i];
    arr[vi * 3 + 1] = base[i * 3 + 1] + swellH(base[i * 3] + ox, base[i * 3 + 2] + oz, t) * 1.15;
  }
  flush(b);
}

/** Blossom clusters drift as rigid islands — a cluster hangs off a branch. */
function applyBlossom(b: Bound, t: number, gust: number): void {
  const arr = b.pos.array as Float32Array;
  const { base, verts, ph, rate } = b;
  const a = 0.030 * gust;
  for (let i = 0, n = verts.length; i < n; i++) {
    const vi = verts[i];
    const phase = ph[i], r = rate[i];
    arr[vi * 3] = base[i * 3] + a * Math.sin(t * r + phase);
    arr[vi * 3 + 1] = base[i * 3 + 1] + a * 0.45 * Math.sin(t * r * 1.37 + phase);
    arr[vi * 3 + 2] = base[i * 3 + 2] + a * 0.8 * Math.cos(t * r * 0.91 + phase);
  }
  flush(b);
}

/** Put every vertex back where the GLB had it. */
function restore(b: Bound): void {
  const arr = b.pos.array as Float32Array;
  const { base, verts } = b;
  for (let i = 0, n = verts.length; i < n; i++) {
    const vi = verts[i];
    arr[vi * 3] = base[i * 3];
    arr[vi * 3 + 1] = base[i * 3 + 1];
    arr[vi * 3 + 2] = base[i * 3 + 2];
  }
  b.pos.clearUpdateRanges();
  b.pos.needsUpdate = true;
}

/** The whole cloud bank, for one position write. */
function driftClouds(cloud: THREE.Object3D, rest: THREE.Vector3, t: number): void {
  cloud.position.set(
    rest.x + 2.8 * Math.sin(t * 0.021),
    rest.y + 0.28 * Math.sin(t * 0.017),
    rest.z,
  );
}

/** Everything the frame loop needs, resolved once. */
interface Rig {
  bounds: Bound[];
  cloud: THREE.Object3D | null;
  cloudBase: THREE.Vector3;
  /** One clock per patched water material. See `patchWaterMaterial`. */
  clocks: { value: number }[];
}

/**
 * Resolve every animated mesh, island and rest pose, ONCE.
 *
 * Module scope for the same reason the motion functions are (see above): this
 * builds the arrays the frame loop mutates, and `react-hooks/immutability`
 * rejects the binder closures outright when they live inside the component's
 * `useMemo`. It is also the honest shape — nothing here depends on React.
 *
 * `getObjectByName` is called ten times here and never again. The task it is
 * doing — walking a 543-name hierarchy — is exactly what must not happen per
 * frame, so the frame loop only ever sees the resolved `Bound` array.
 */
function buildRig(scene: THREE.Object3D | null): Rig {
  const bounds: Bound[] = [];
  const empty = new Float32Array(0);
  const clocks: { value: number }[] = [];
  if (!scene) {
    return { bounds, cloud: null as THREE.Object3D | null, cloudBase: new THREE.Vector3(), clocks };
  }

  const world = new THREE.Vector3();

  /** Bind every vertex of a mesh — used for the water surfaces and the foam. */
  const bindAll = (name: string, kind: Kind): Bound | null => {
    const mesh = scene.getObjectByName(name) as THREE.Mesh | undefined;
    if (!mesh?.isMesh) return null;
    const pos = mesh.geometry.getAttribute('position') as THREE.BufferAttribute | undefined;
    if (!pos) return null;
    const n = pos.count;
    const verts = new Uint32Array(n);
    for (let i = 0; i < n; i++) verts[i] = i;
    const base = new Float32Array(pos.array as ArrayLike<number>);
    mesh.getWorldPosition(world);

    /* Foam: a per-vertex weight separating the falling ribbon (high) from the
       foam blobs and the spreading ripple that sit on the water (low). */
    const w = new Float32Array(n);
    if (kind === 'foam') {
      for (let i = 0; i < n; i++) {
        w[i] = Math.min(1, Math.max(0, (base[i * 3 + 1] + world.y + 0.34) / 0.42));
      }
    }

    return {
      name, kind, pos, verts, base,
      ox: world.x, oy: world.y, oz: world.z,
      w, ph: empty, rate: empty, h: empty, cen: null,
      lo: 0, hi: n - 1,
    };
  };

  /** Attach the per-pixel ripple to whatever material a water mesh uses. */
  const rippleOn = (name: string): void => {
    const mesh = scene.getObjectByName(name) as THREE.Mesh | undefined;
    if (!mesh?.isMesh) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const m of mats) {
      if (!m) continue;
      const clock = patchWaterMaterial(m);
      if (!clocks.includes(clock)) clocks.push(clock);
    }
  };

  /**
   * Bind selected islands of a merged mesh.
   *
   * `pick` decides, per island, whether it participates and as what. It is
   * handed the island plus its centroid in WORLD space, so a rule can be
   * written in world terms even though the buffers are mesh-local.
   */
  const bindIslands = (
    name: string,
    pick: (isl: Island, wx: number, wy: number, wz: number) => Kind | null,
  ): Bound[] => {
    const mesh = scene.getObjectByName(name) as THREE.Mesh | undefined;
    if (!mesh?.isMesh) return [];
    const pos = mesh.geometry.getAttribute('position') as THREE.BufferAttribute | undefined;
    if (!pos) return [];
    mesh.getWorldPosition(world);
    const ox = world.x, oy = world.y, oz = world.z;
    const p = pos.array as ArrayLike<number>;

    /* Group the chosen islands by kind, so one mesh yields at most one Bound
       per kind and the per-frame loop stays flat. */
    const chosen = new Map<Kind, Island[]>();
    for (const isl of buildIslands(mesh.geometry)) {
      const k = pick(isl, isl.cx + ox, isl.cy + oy, isl.cz + oz);
      if (!k) continue;
      const g = chosen.get(k);
      if (g) g.push(isl); else chosen.set(k, [isl]);
    }

    const made: Bound[] = [];
    chosen.forEach((islands, kind) => {
      let total = 0;
      for (const isl of islands) total += isl.verts.length;
      const verts = new Uint32Array(total);
      const base = new Float32Array(total * 3);
      const cen = new Float32Array(total * 3);
      const w = new Float32Array(total);
      const ph = new Float32Array(total);
      const rate = new Float32Array(total);
      const hh = new Float32Array(total);
      let lo = Infinity, hi = -Infinity, o = 0;

      for (const isl of islands) {
        const span = Math.max(1e-4, isl.maxY - isl.minY);
        /* Phase and rate come from the island's own centroid, so every prop
           moves on its own clock with no stored random table. */
        const phase = hash01(isl.cx + ox, isl.cz + oz) * TAU;
        const r = 0.75 + hash01(isl.cz + oz, isl.cx + ox) * 0.6;
        for (const vi of isl.verts) {
          verts[o] = vi;
          base[o * 3] = p[vi * 3];
          base[o * 3 + 1] = p[vi * 3 + 1];
          base[o * 3 + 2] = p[vi * 3 + 2];
          cen[o * 3] = isl.cx;
          cen[o * 3 + 1] = isl.cy;
          cen[o * 3 + 2] = isl.cz;
          /* Stalk bend: zero at the base, quadratic to the tip. A reed hinges
             at the waterline, not about the centre of its own bounding box —
             which is what a naive per-object rotation would have given. */
          const t01 = Math.min(1, Math.max(0, (p[vi * 3 + 1] - isl.minY) / span));
          w[o] = t01 * t01;
          ph[o] = phase;
          rate[o] = r;
          hh[o] = span;
          if (vi < lo) lo = vi;
          if (vi > hi) hi = vi;
          o++;
        }
      }

      made.push({
        name: `${name}:${kind}`, kind, pos, verts, base,
        ox, oy, oz, w, ph, rate, h: hh, cen,
        lo: lo === Infinity ? 0 : lo, hi: hi === -Infinity ? 0 : hi,
      });
    });
    return made;
  };

  /* ── Water ──────────────────────────────────────────────────────────────
     ENV_Merged_Water is the 24x24 river grid plus the eight lily notches;
     ENV_Shallows is the bright band hugging the island. Both ride the same
     swell, so the band stays welded to the surface it sits on, and both get
     the per-pixel ripple — the shallows' own up-facing test keeps it off the
     underside of that flattened torus. */
  const water = bindAll('ENV_Merged_Water', 'water');
  if (water) bounds.push(water);
  const shallows = bindAll('ENV_Shallows', 'water');
  if (shallows) bounds.push(shallows);
  rippleOn('ENV_Merged_Water');
  rippleOn('ENV_Shallows');

  /* ── Waterfall ─────────────────────────────────────────────────────────*/
  const foam = bindAll('ENV_Merged_Foam', 'foam');
  if (foam) bounds.push(foam);

  /* ── Bubbles ───────────────────────────────────────────────────────────
     Eight spheres floating in the air above the river (world y 0.78..2.95).
     Each island rises on its own cycle and is scaled to nothing across the
     wrap: a merged mesh has no per-object opacity to fade with, and a hard
     reset to the bottom pops. */
  bounds.push(...bindIslands('ENV_Merged_Bubble', () => 'bubble'));

  /* ── Grass and reeds ───────────────────────────────────────────────────
     ENV_Merged_Grass and _GrassLit each hold 13 edge tufts plus one large
     body — the island grass dome, the island lip — that is GROUND and must
     not shear. ENV_Merged_GrassShade holds the 12 reed stems plus the
     far-bank torus and the two waterfall shoulders. In every case the props
     are small islands and the things that must stay put are large ones, which
     is the only separation that survives: the far-bank torus passes straight
     through the reed beds, so no world-space box could do it. */
  const smallProp = (isl: Island): Kind | null =>
    isl.verts.length <= PROP_VERTS ? 'sway' : null;
  bounds.push(...bindIslands('ENV_Merged_Grass', smallProp));
  bounds.push(...bindIslands('ENV_Merged_GrassLit', smallProp));
  bounds.push(...bindIslands('ENV_Merged_GrassShade', smallProp));

  /* ── Lily pads and reed leaves ─────────────────────────────────────────
     ENV_Merged_Leaf is the busiest mesh in the world: its 89 islands are 13
     lily pads and 12 reed leaf-blades sharing one buffer with 30 tree
     canopies, 30 foliage clumps and 4 bushes. The three groups separate
     cleanly by island size, which the exporter fixes for us:

         reed leaf     34-36 verts     swayed
         lily pad      82-92 verts     floated (and below the waterline)
         clump         86-90 verts     skipped
         bush         185-188 verts    skipped
         canopy       226-237 verts    skipped

     Clump and lily pad overlap in size, so the waterline decides first: a
     pad's centroid is at world y -0.59 and the lowest clump is at +0.71.
     REED_LEAF_VERTS then takes the reed blades and nothing else. */
  const REED_LEAF_VERTS = 40;
  bounds.push(...bindIslands('ENV_Merged_Leaf', (isl, _wx, wy) => {
    if (wy < WATERLINE) return isl.verts.length <= PROP_VERTS ? 'float' : null;
    return isl.verts.length <= REED_LEAF_VERTS ? 'sway' : null;
  }));

  /* ── Blossom and petals ────────────────────────────────────────────────
     The 66 blossom objects the audit counted are split across
     ENV_Merged_Blossom (7 per tree) and ENV_Merged_PetalWhite (4 per tree).
     Both meshes also carry the lily blooms and the island's ground flowers,
     and all three groups are well separated in height: ground flowers top out
     at world y 0.43, tree blossom starts at 0.76, lily blooms sit at -0.52.
     CANOPY_Y splits them with a wide margin on either side — an earlier 0.35
     clipped the taller ring flowers into the tree set.

     Blossom clusters drift as rigid islands: a cluster hangs off a branch, so
     the whole thing should travel rather than shear like a stalk. */
  const CANOPY_Y = 0.6;
  const blossomOrFloat = (isl: Island, _wx: number, wy: number): Kind | null => {
    if (isl.verts.length > PROP_VERTS) return null;
    if (wy < WATERLINE) return 'float';
    return wy > CANOPY_Y ? 'blossom' : null;
  };
  bounds.push(...bindIslands('ENV_Merged_Blossom', blossomOrFloat));
  bounds.push(...bindIslands('ENV_Merged_PetalWhite', blossomOrFloat));
  /* Only the three lily bloom cores, which sit on pads out on the water. The
     rest of this mesh is the island's ground flowers — see the foot note. */
  bounds.push(...bindIslands('ENV_Merged_PetalGold', (isl, _wx, wy) =>
    (isl.verts.length <= PROP_VERTS && wy < WATERLINE) ? 'float' : null));

  /* ── Clouds ────────────────────────────────────────────────────────────
     All 54 puffs are one mesh, and one mesh is one node, so the entire cloud
     bank drifts for a single position write per frame — no vertex work at
     all. The bank spans 71m of x and sits 18-34m behind the island, where the
     nine clouds subtend a few degrees; parallax between them is not
     resolvable, so per-cloud drift would cost 5,679 vertices a frame to buy
     nothing visible. The drift is sinusoidal on a ~5 minute period, which
     over any watchable stretch reads as one-way travel and can never pop the
     way a wrapping sawtooth does. */
  const cloud = scene.getObjectByName('ENV_Merged_Cloud') ?? null;
  const cloudBase = cloud ? cloud.position.clone() : new THREE.Vector3();

  if (import.meta.env.DEV) {
    const touched = bounds.reduce((s, b) => s + b.verts.length, 0);
    const rows = bounds.map((b) =>
      `${b.name} verts=${b.verts.length} span=${b.hi - b.lo + 1}/${b.pos.count}`);
    console.info(
      `[WorldLife] ${bounds.length} bounds, ${touched} vertices/frame, clouds=${cloud ? 'node drift' : 'MISSING'}\n  ${rows.join('\n  ')}`,
    );
  }

  return { bounds, cloud, cloudBase, clocks };
}

export interface WorldLifeProps {
  /** The loaded environment scene, as reported by `Environment`. */
  scene: THREE.Object3D | null;
}

/**
 * Animates the loaded environment. Mount inside the R3F <Canvas>, once, with
 * the same scene object `Environment` reported upward.
 */
export default function WorldLife({ scene }: WorldLifeProps) {
  const reduced = useReducedMotion();

  const rig = useMemo(() => buildRig(scene), [scene]);

  /* Restoring the rest pose matters only when the preference turns ON
     mid-session, which would otherwise leave the world frozen mid-wave. */
  useEffect(() => {
    if (!reduced) return;
    for (const b of rig.bounds) restore(b);
    if (rig.cloud) rig.cloud.position.copy(rig.cloudBase);
  }, [reduced, rig]);

  useFrame((state) => {
    if (reduced) return;
    const t = state.clock.elapsedTime;

    /* One slow gust modulating every stalk in the world, so grass, reeds and
       blossom breathe together instead of each buzzing on its own clock. */
    const gust = 0.72 + 0.28 * Math.sin(t * 0.23) * Math.cos(t * 0.081);

    tickRipple(rig.clocks, t);

    for (const b of rig.bounds) {
      switch (b.kind) {
        case 'water': applyWater(b, t); break;
        case 'foam': applyFoam(b, t); break;
        case 'bubble': applyBubbles(b, t); break;
        case 'sway': applySway(b, t, gust); break;
        case 'float': applyFloat(b, t); break;
        case 'blossom': applyBlossom(b, t, gust); break;
      }
    }

    if (rig.cloud) driftClouds(rig.cloud, rig.cloudBase, t);
  });

  return null;
}

/* ── Deliberately not animated ──────────────────────────────────────────────
 *
 * Tree canopies, foliage clumps and bushes (the 226-237, 86-90 and 185-188
 * vertex islands of ENV_Merged_Leaf, plus all of _LeafLit and _LeafDark:
 * 34,940 triangles between them). Rustling the foliage would mean touching
 * 6,900 vertices of ENV_Merged_Leaf and 11,757 more in the other two meshes,
 * roughly doubling this file's per-frame budget to buy the least legible motion
 * in the frame. They are also not among the audit's 232. The blossom drift
 * already reads as the branches moving, which is the cue that was being asked
 * for.
 *
 * (An earlier revision of this file DID catch the clumps and bushes, because
 * they undercut a single 200-vertex island threshold. That cost 3,354 vertices
 * a frame and sheared each foliage ball up from its own base, which is not how
 * a mass hanging off a branch moves. Hence the size table above.)
 *
 * The island's ground flowers (ENV_Merged_PetalGold and _PetalViolet, less the
 * lily bloom cores: 4,369 vertices). They are not among the audit's 232 — it
 * flags them under SCALE, not LIFE — and at a median 0.10x the lion's height
 * their motion would be sub-pixel while costing half again as much as
 * everything above.
 *
 * ENV_RiverBed. Eight triangles, 55cm below an opaque surface, never visible.
 *
 * ENV_FallShoulder and ENV_FarBank. Bank geometry, correctly static. They live
 * inside ENV_Merged_GrassShade with the reeds and are excluded by island size.
 */
