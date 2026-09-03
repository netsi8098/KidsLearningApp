# Blender and Real-Time 3D Current-State Audit

Date: 2026-08-20

## Verdict

The real-time 3D pipeline is proven, but the production homepage world and
production mascot are not complete. The repository now contains a genuine
Blender-authored, volumetric, skinned GLB with four semantic leg chains,
animation clips, and facial morph targets. It is not a PNG plane.

The current lion is still a technical prototype. It uses many overlapping
primitive meshes, mostly rigid one-bone weights, no IK control rig, and
upright proportions that do not yet match the approved quadruped mascot. In
the live local homepage it also floats above a painted hill because there is
no shared 3D ground or environment yet.

Do not discard the working contract, export script, runtime controller, or
fallback boundary. Do not call the current model production art.

## 1. Blender Files

- `art/blender/lion.blend`: current editable lion source.
- `art/blender/lion.blend1`: Blender backup of that source.
- `tools/blender/build_rigged_lion.py`: reproducible model, rig, animation,
  preview, and GLB build script.
- `public/assets/lion/rigged/lion.glb`: exported runtime asset.
- `docs/assets/lion-rig-preview.png`: neutral preview.
- `docs/assets/lion-rig-wave-preview.png`: wave preview.

Missing from the requested professional source structure:

- `lion_master.blend` as a clearly named authoritative character file.
- `home_environment.blend`.
- `home_scene.blend`.
- environment export, validation, and preview scripts.
- a reference board and extracted motion-reference frames.

## 2. Modeled Work

The lion has a modeled body, belly, head, layered mane, top tuft, ears, eye
whites, irises, pupils, eye highlights, brows, muzzle, nose, cheeks, chin,
mouth, four multi-part legs and paws, a segmented tail, and tail tuft.

The model is assembled from 95 mesh objects, primarily UV spheres and capsule
parts. This is useful for proving articulation and export, but it is not a
clean sculpted and retopologized production character.

## 3. Real Mesh

Yes. The current lion is genuine 3D volume with geometry, materials, depth,
skin data, and an armature. It is not the old textured plane and does not use
sprite or pose swapping in the GLB path.

## 4. Polygon Count

Blender source, excluding the preview ground:

- 95 mesh objects.
- 31,580 source vertices.
- 33,188 source polygons.
- 62,780 triangulated faces.

Exported GLB:

- 95 meshes and 95 primitives.
- 37,239 exported vertices after glTF vertex splitting.
- 62,780 triangles.
- approximately 2.57 MB.

The triangle count is workable for a desktop prototype but high for a mascot
built almost entirely from primitives, especially before adding the 3D world.
A production retopology and mobile performance budget are still needed.

## 5. Armature

Yes. `LionArmature` contains 45 deformation bones.

## 6. Skinning

Yes, technically. All 95 visible mesh objects have an Armature modifier and
export through one glTF skin. Most objects are rigidly weighted 100 percent to
one bone. Only the body currently uses blended pelvis, spine, and chest
weights.

This proves the runtime skinning path, but it is not production weight
painting. Shoulder, hip, elbow, knee, wrist, ankle, jaw, mane, and tail
deformation still need artist-authored topology and weight QA.

## 7. Bone Hierarchy

Core chain:

`root -> pelvis -> spine_01 -> chest -> neck -> head -> jaw`

Head children:

- `eye_L`, `eye_R`
- `ear_L`, `ear_R`
- `mane_L`, `mane_top`, `mane_R`

Front left:

`chest -> front_shoulder_L -> front_upper_L -> front_elbow_L -> front_lower_L -> front_wrist_L -> front_paw_L`

Front right mirrors the left chain with `_R` names.

Rear left:

`pelvis -> rear_hip_L -> rear_thigh_L -> rear_knee_L -> rear_hock_L -> rear_lower_L -> rear_ankle_L -> rear_paw_L`

Rear right mirrors the left chain with `_R` names.

Tail:

`pelvis -> tail_01 -> tail_02 -> tail_03 -> tail_04 -> tail_tuft`

## 8. Four-Leg Articulation

Four independent semantic leg chains exist and are exported. Each front leg
has shoulder, upper limb, elbow, lower limb, wrist, and paw bones. Each rear
leg has hip, thigh, knee, hock, lower limb, ankle, and paw bones.

This satisfies the hierarchy requirement, not the final locomotion quality.
The current capsules overlap at joints, the body reads too upright, and the
walk has not passed a professional paw-contact and weight-transfer review.

## 9. IK

No. The Blender file contains zero pose-bone constraints and zero IK
constraints. There are no pole targets, paw controls, ground-contact targets,
or control/deformation rig separation. Current clips are direct FK keyframes.

## 10. Actions

Thirteen named Actions exist and export:

- `Idle`
- `WalkStart`
- `Walk`
- `WalkStop`
- `TurnLeft`
- `TurnRight`
- `Wave`
- `JumpAnticipation`
- `JumpTakeoff`
- `JumpAirborne`
- `JumpLand`
- `JumpRecovery`
- `Celebrate`

They prove clip loading, sequencing, and crossfading. They are script-authored
prototype motion, not yet animation-film-quality performances.

## 11. Shape Keys

Sixteen required morph targets exist and export:

- independent `blink_L` and `blink_R`
- `eyes_wide`, `eyes_narrow`
- `smile`
- `mouth_wide`, `mouth_narrow`, `mouth_round`
- `viseme_MBP`, `viseme_FV`, `viseme_OU`
- independent brow up/down for left and right
- `cheeks_up`

The runtime also rotates the jaw bone during speech. The shapes need visual
cleanup and real speech-timing validation, but the required data path exists.

## 12. Environment Work

No Blender environment exists yet. The current homepage worlds are React,
CSS, SVG, Framer Motion, and illustrated bitmap plates. Existing world assets
include Sunny Meadow, River Garden, Sky Islands, and Treehouse backplates and
stages.

There is no real 3D ground, production camera, walkable zone, 3D lighting,
environment GLB, title marker, speech marker, card zone, or combined Blender
composition scene.

## 13. React Three Fiber Work

Installed runtime packages:

- `three` 0.185.1
- `@react-three/fiber` 9.7.0
- `@react-three/drei` 10.7.8

Implemented components:

- `RiggedLionCanvas`: lazy transparent R3F Canvas, camera, lights, reduced
  motion, and loading boundary.
- `RiggedLionCharacter`: `useGLTF`, skeleton clone, `useAnimations`, mixer
  crossfades, clip sequences, world travel, gaze, blink, jaw, and morph speech.
- `RiggedLionBoundary`: preserves the established fallback if WebGL or asset
  loading fails.
- `lionRigContract`: validates bones, parents, clips, morph targets, and
  SkinnedMesh presence in the browser.
- `scripts/validate-lion-glb.mjs`: validates the exported GLB offline.

The semantic runtime API already exposes `returnToIdle`, `walkTo`, `lookAt`,
`wave`, `speak`, `jump`, and `celebrate` so app pages do not manipulate bones.

## 14. Architecture Already Satisfied

- Existing React application is preserved.
- Dynamic UI remains accessible DOM, not baked Blender geometry.
- Lion is a reusable asset separate from future environment assets.
- A real R3F/Drei/Three GLB loading and animation path exists.
- A machine-readable asset contract exists.
- The 3D feature is lazy-loaded and feature-gated.
- Reduced motion and runtime failure fallback exist.
- Thirteen clips and sixteen facial morphs pass offline validation.
- Production build passes and the R3F runtime remains a separate chunk.

## 15. Missing Work

Character production:

- approved mascot likeness and quadruped proportions
- sculpting, production topology, UVs, and optimized materials
- continuous deformation-ready mesh instead of 95 primitive parts
- professional weight painting
- IK/FK control rig, paw targets, and pole targets
- believable gait, paw roll, body support, turns, jump contact, and recovery
- refined facial shapes, speech timing, mane overlap, and tail dynamics
- mobile triangle, draw-call, texture, and memory budgets

World production:

- reference board and selected reference frames
- Blender environment blockout and authoritative source files
- real ground, walk zone, camera, lights, scale, and responsive framing
- environment GLB and separate export/validation pipeline
- named title, speech, player-card, and lion spawn anchors
- a full-screen R3F world Canvas behind the preserved DOM UI
- browser-visible debug mode for bones, contacts, state, speed, and bounds
- Khronos glTF Validator and cross-viewer verification

Current live-local visual blockers:

- the lion floats above the painted hill
- the 3D prototype does not match the approved mascot identity closely enough
- the current Canvas contains only the lion, not a shared 3D world

## 16. Smallest Safe Next Step

Build `home_environment.blend` at blockout quality and export a basic
`home_environment.glb` containing only:

1. one real ground surface with a measured lion contact point
2. a bounded walkable area
3. one production camera composition
4. basic key and fill lighting
5. named empty markers for lion spawn, speech bubble, title, and player-card
   visual zones

Then add one full-screen `Home3DWorld` R3F Canvas behind the existing DOM UI
and load the current lion as a pipeline proxy on that real ground. Do not add
flowers, houses, or final materials until desktop, tablet, and phone prove the
scale and composition.

Only after this blockout milestone passes should character art and animation
be upgraded inside the preserved rig/export/runtime architecture.

## Verification Performed

- `npm run lion:validate`: PASS, 45 bones, 13 clips, 16 morph targets.
- focused rig contract tests: PASS, 2 of 2.
- `npm run build`: PASS.
- live local GLB load: PASS.
- authored Wave action after scene-root validator fix: PASS.
- production character likeness and ground contact: FAIL, intentionally open.


---

## Re-audit — 2026-08-21

### Scene files, in pipeline order

| `.blend` | Produced by | Contains |
|---|---|---|
| `lion_silhouette.blend` | `build_lion_silhouette.py` | proxy blockout: skin-modifier body + 31 curve-lock mane |
| `lion_retopo.blend` | `retopo_lion.py` | Quadriflow pass on the proxy |
| `lion_detailed.blend` | `detail_lion.py` | proxy + face/paw features + vertex-colour coat |
| `lion_rigged.blend` | `rig_lion.py` | proxy rigged, 41 bones, 10 clips |
| `lion_cage.blend` | `cage_lion.py` | **production cage**, 1,003 quads, 102 ring groups |
| `lion_cage_qa.blend` | `deform_qa_lion.py` | cage + QA armature |
| `lion_rigged_cage.blend` | `rig_cage_lion.py` | **production rig**, authored weights, 4 IK chains |
| `home_environment.blend` | `build_home_environment.py` | world, 85k tris, 29 materials, 10 markers |

Superseded and kept only as history: `lion.blend`,
`lion_clay_sculpt_v1.blend`, `lion_proportion_study*.blend`,
`lion_reference_stage.blend`.

`lion 2.blend` was removed on 2026-09-03. It was a macOS duplicate of an
intermediate `lion.blend` save — 771,926 bytes against that file's 807,868,
so an older snapshot of the same proxy rather than a distinct asset — and no
script or document read it. It is still in history at `e36610f` if it is ever
wanted back.

### Shared contracts — read these before touching any stage

| Module | Owns |
|---|---|
| `lion_contract.py` | every proportion, measured off the approved turnaround |
| `lion_skeleton.py` | bone table **and** the authored ring→bone skin map |

These exist because the constants were previously **copied** into three scripts
and drifted: after the belly moved 0.41 → 0.21, `detail_lion.py` was still
probing for a head at z = 0.80. Nothing errors when that happens — features
simply land nowhere and it only shows up in a render.

### Validators

| Check | Runs |
|---|---|
| `validate_home_environment.py` | 57 scene assertions |
| `scripts/validate-environment-glb.mjs` | 22 GLB assertions, dependency-free |
| `cage_lion.py :: integrity()` | loose verts, non-manifold, boundary, degenerate, slivers, valence — **with coordinates** |
| `deform_qa_lion.py` | 12-pose battery: per-face area ratio + bone-relative normal inversion |
| `rig_cage_lion.py` | reach headroom + planted-paw drift at two amplitude bands |
| `gltf-transform validate` | Khronos spec |
| `assert_production_clean()` in both rig scripts | refuses to export development geometry |

### Traps this pipeline has already hit

Recorded so they are not rediscovered:

1. **A wireframe modifier is in the evaluated mesh.** `to_mesh()` goes through
   the viewport depsgraph, so any measurement reads the wireframe strips. Set
   `show_viewport = False`, `show_render = True`.
2. **`bm.free()` invalidates every BMVert reference.** Snapshot indices first.
   Also guard with `v.is_valid` — `open_patch` deletes patch centres.
3. **`FACES_ONLY` leaves orphans.** Deleting a face region with `FACES_ONLY`
   keeps its interior verts and edges as loose geometry. Use `FACES`.
4. **`grid_fill` fails silently.** It half-filled several caps and produced
   slivers. Replaced by a deterministic all-quad cap.
5. **`vertex_group_smooth` only polls in weight-paint or edit mode.**
6. **A bone head buried inside the body** hands that bone a share of the torso
   under heat weighting.
7. **IK constraints override FK actions.** The proxy's clips are authored in FK;
   live IK pinned the legs and the walk stride measured 18 mm instead of 230 mm.
   Constraints now default to `influence = 0`.
8. **`export_def_bones=True`** or every IK/pole control ships as a skin joint.
9. **`ring_frame()` returned a non-orthonormal basis** for any tangent with a
   non-zero x component. `right` was hardcoded to `(1,0,0)` and never projected
   onto the plane perpendicular to the tangent. Every ring in the cage until the
   ears had tangent x = 0 — body along Y, limbs along -Z, tail along -Y — so it
   happened to be perpendicular and nothing showed. The first sideways-growing ear
   made `right` nearly parallel to the normal, the "ring plane" stopped being a
   plane, and the rings collapsed toward a line: 8 slivers at the ear base and tip
   cap. Fixed by projecting `right`, swapping the reference axis to Z when the
   tangent points along X, and **preserving the cross-product order** (`right × n`,
   not `n × right`) — reversing it flips `up` and inverts every ring's winding
   model-wide. A no-op for any tangent with x = 0.
10. **Limb rings were circular-only**, and that made a whole class of form
    unbuildable rather than merely awkward. A ring is a section perpendicular to
    its growth direction, so one radius serves two axes: a toe grown forward spends
    it on X and Z, a paw grown downward on X and Y. Neither gives a broad FLAT
    foot, which is why the paws sat 3-5x too short at ground contact for so long.
    `grow()` now accepts an optional 5-tuple with separate right/up radii.
    Corollary learned the hard way: pushing an ellipse to aspect ratio 2.3 bunches
    the eight inherited vertices at its flat ends and produces slivers — 12, then
    20 when a taper ring was added to "fix" them. Prefer changing the growth
    DIRECTION so flatness comes from ring spacing, which keeps the aspect near 1.2.
11. **A bone's head must coincide exactly with its parent's tail.** Moving a paw
    bone's head forward to sit inside enlarged paw geometry silently disconnected
    the chain the IK solver runs along: 1 battery FAIL and a 10.79 mm front IK
    residual. Lengthening the same bone was also wrong, taking walk support slide
    from 0.166 mm to 15.99 mm, because the planted-contact point is measured at the
    bone and a long bone swings its own tip through an arc the IK target knows
    nothing about. Paws are weighted rigidly (1.0) to their bone, so the geometry
    travels with it whatever its length — never reposition a foot bone to follow
    the mesh.
12. **Ring SPACING drives the area-ratio pinch metric**, not just weights. Twice a
    correction that moved rings closer together raised the pinch count with no
    weight change, and twice re-spacing them fixed it: pulling the rump forward
    bunched the rear rings from 0.050/0.038/0.028 apart to 0.030/0.030/0.022 and
    took the count to 6, and respacing `haunch` took it to 2. Before retuning
    weights to chase a pinch, check whether the rings behind it got crowded.
13. **A shortened chain shears more for the same rotation.** Dropping the head
    0.131 compressed the neck from 0.24 of body height to 0.11 and turned pose
    `08-head-turned` from WARN into FAIL — the weight ramp `0.30 → 0.72 → 1.00` was
    fine over the long neck and sheared across a third of the distance on the short
    one. Widened to `0.22 → 0.54 → 0.84 → 1.00`. When a chain's length changes,
    re-check its weight gradient.
