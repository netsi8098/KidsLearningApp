# Production Rigged Lion Pipeline

> Current-state update, 2026-08-20: Blender 5.2 LTS is now installed and a
> genuine prototype lion GLB has been built. The original flattened-asset audit
> below records the reason this work began, but it no longer describes the
> current repository. See `docs/blender-current-state-audit.md` for the exact
> Blender, mesh, polygon, armature, skinning, clip, morph, environment, and R3F
> audit. The current GLB proves the pipeline; it is not approved production art.

## Decision

The approved lion must be rebuilt as one modeled, skinned quadruped in Blender,
exported as GLB, and played at runtime through Three.js, React Three Fiber, and
Drei. The current `ArticulatedLion` remains a temporary compatibility fallback.
It must not receive more production locomotion investment.

This work does not redesign the mascot. Modeling must match the approved face,
mane, proportions, colors, paws, and personality in the existing reference art.

## Current Asset Audit (A-H)

| Check | Current answer | Production implication |
|---|---|---|
| A. What is the source asset? | Four flattened PNG poses in `public/assets/lion/`. No Blender, FBX, glTF, or GLB source exists. | There is no riggable source model in the repository. |
| B. Is it a real 3D character mesh? | No. `ArticulatedLion` deforms a subdivided plane textured with a PNG. | It cannot turn, reveal hidden surfaces, or deform like a quadruped body. |
| C. Is it skinned? | Technically the plane is a `THREE.SkinnedMesh`; the lion anatomy is not a modeled skinned volume. | This is a useful prototype, not a production character. |
| D. Does it have a skeleton? | The fallback generates a 29-bone 2.5D control rig in code. | Bones can bend the plane, but cannot create missing anatomy or rear depth. |
| E. Are there four independent leg chains? | No. The fallback has two planted leg chains plus a waving arm. | Genuine quadruped walk, three-leg weight support, paw contact, and turning are impossible. |
| F. Are authored animation clips present? | No imported clips. Motion is procedural code over the flat rig. | Blender must author named locomotion and performance clips. |
| G. Are authored facial shapes present? | No asset-authored shape keys. The fallback generates seven plane morphs. | Blender must provide eyelid, eye, brow, cheek, smile, mouth, and viseme morphs. |
| H. What is the minimum production asset change? | Model the approved lion, retopologize it, create an armature, weight the mesh, author clips and facial shape keys, and export one validated GLB. | This is the minimum honest path. A new image, video, or CSS pass will not solve it. |

## Blender Authoring Contract

Blender 5.2 LTS is installed and the repository now contains an editable
prototype at `art/blender/lion.blend`. The production authoring contract below
still applies because that prototype has not yet passed likeness, topology,
weight-painting, IK, locomotion, or ground-contact acceptance.

### Mesh

- One consistent lion identity with production topology around shoulders, hips,
  elbows, knees, hocks, wrists, ankles, jaw, eyelids, ears, tail base, and mane.
- Separate materials are allowed, but all visible body meshes must be skinned to
  the same armature.
- Neutral pose must keep all four paws on ground plane `Y = 0`.
- Forward direction is `+Z`; up is `+Y` after glTF export.
- Apply object transforms before skinning. Avoid negative scale.
- Keep the web GLB at or below 10 MB after texture and geometry compression.

### Armature

The exact required hierarchy is machine-readable in
`src/data/lionRigContract.json`. It includes:

- root, pelvis, spine, chest, neck, head, and jaw
- independent eyes and ears
- three mane follow-through controls
- six-joint left and right front-leg chains
- seven-joint left and right rear-leg chains, including hocks
- four tail segments plus an independently weighted tuft

Use Blender IK constraints for authoring planted paws, pole targets for stable
joint direction, and FK controls for expressive arcs. Bake deformation-bone
animation into the exported clips. Do not export control widgets.

### Required clips

`Idle`, `WalkStart`, `Walk`, `WalkStop`, `TurnLeft`, `TurnRight`, `Wave`,
`JumpAnticipation`, `JumpTakeoff`, `JumpAirborne`, `JumpLand`, `JumpRecovery`, and
`Celebrate`.

- Locomotion clips should be in-place; the semantic runtime supplies world travel.
- `Walk` must be a clean loop with diagonal quadruped gait, visible weight transfer,
  paw plant/roll/lift, head stabilization, tail inertia, and mane overlap.
- `Wave` and `Celebrate` must be authored as upper-body-compatible overlays so the
  mixer can blend them over breathing or locomotion.
- Jump clips must preserve anticipation, takeoff, airborne tuck, landing contact,
  compression, and recovery as distinct blendable phases.

### Facial shape keys

Required names are also in the JSON contract: independent blinks, eye wide/narrow,
smile, wide/narrow/round mouth, MBP/FV/OU visemes, independent brow up/down, and
cheek raise. Jaw rotation and morph targets should cooperate rather than duplicate
the same deformation.

### Export

Export one binary glTF 2.0 file to:

`public/assets/lion/rigged/lion.glb`

Enable meshes, materials, skinning, animations, and shape keys. Export only
deformation bones, sample animations, and verify clip names after export. Use
Draco or Meshopt-compatible geometry compression only after visual comparison shows
no deformation damage.

Run:

```bash
npm run lion:validate
```

The command fails on missing skin weights, bones, parents, clips, or morph names.
Only after it passes should `.env.development` set:

```bash
VITE_RIGGED_LION_ENABLED=true
```

## Runtime Architecture

- `GeneratedLion` preserves the existing caller API and feature-gates the GLB path.
- `RiggedLionCanvas` creates a transparent, lazy-loaded R3F canvas.
- `RiggedLionCharacter` clones the skeleton, uses Drei `useGLTF` and
  `useAnimations`, crossfades base clips, blends additive overlays, drives gaze,
  blinking, jaw/visemes, and supports semantic commands.
- `RiggedLionBoundary` catches load/runtime failures and restores the current lion.
- `inspectLionRig` repeats the asset contract in-browser before playback.
- Reduced motion freezes the rig in a readable neutral frame.

Semantic commands are `returnToIdle`, `walkTo`, `lookAt`, `wave`, `speak`, `jump`,
and `celebrate`. App pages should call intent-level commands, never bone names.

## Proof-of-Concept Acceptance

One persistent GLB lion must perform this sequence without an image swap or video:

1. living idle with breathing, gaze, blink, ear, mane, and tail layers
2. walk start, four-leg walk, and planted stop
3. transfer weight onto three planted legs
4. wave through shoulder, elbow, wrist, and paw while the body remains alive
5. crouch, take off, tuck, land with four-paw contact, compress, and recover
6. tail and mane follow through after landing
7. blend back to idle without a visible pop

Test at phone, tablet, and desktop sizes with frame timing, ground contact, speech
sync, loading failure, and reduced motion. Do not ship if the mascot identity drifts
from the approved reference.

## Primary References

- Blender Armatures: https://docs.blender.org/manual/en/latest/animation/armatures/index.html
- Blender Armature Modifier and vertex weights: https://docs.blender.org/manual/en/latest/modeling/modifiers/deform/armature.html
- Blender Shape Keys: https://docs.blender.org/manual/en/latest/animation/shape_keys/introduction.html
- Blender glTF 2.0 exporter: https://docs.blender.org/manual/en/latest/addons/scene_gltf2.html
- React Three Fiber Canvas: https://r3f.docs.pmnd.rs/api/canvas
- Drei `useGLTF`: https://drei.docs.pmnd.rs/loaders/gltf-use-gltf
- Drei `useAnimations`: https://drei.docs.pmnd.rs/abstractions/use-animations
- Three.js `AnimationMixer`: https://threejs.org/docs/#api/en/animation/AnimationMixer
