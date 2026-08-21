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

