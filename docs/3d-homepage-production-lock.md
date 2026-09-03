# 3D Homepage Production Lock

Date: 2026-08-20

## Production Decision

Pause further homepage integration. Build and approve the lion and all homepage
worlds in Blender first. Existing React functionality and the current R3F proof
of concept stay intact, but the prototype lion and unfinished environments must
not be promoted as final app assets.

The source videos are now archived as frame references under
`art/blender/references/`. They define character identity, composition, lighting,
depth, and motion quality.

## Authoritative Blender Sources To Create

```text
art/blender/
  lion_master.blend
  worlds/
    sky_islands.blend
    river_garden.blend
    treehouse_village.blend
  scenes/
    sky_islands_home.blend
    river_garden_home.blend
    treehouse_home.blend
  references/
  exports/
  previews/
  scripts/
```

The current `lion.blend` remains a pipeline prototype until the approved lion
has been rebuilt and accepted. It must not be renamed to `lion_master.blend`
prematurely.

## Build Order

### Gate 1: Lion Visual Identity

1. Establish orthographic front, side, three-quarter, and top proportion guides.
2. Sculpt the low quadruped body, head, muzzle, mane, ears, paws, and tail.
3. Approve a neutral clay turntable before retopology.
4. Retopologize for shoulder, hip, elbow, knee, hock, wrist, ankle, jaw, eyelid,
   ear, mane, and tail deformation.
5. Create UVs and PBR materials matching the approved warm palette.

No armature reuse is automatic. Preserve the existing semantic bone contract,
but adjust bone placement to the approved anatomy.

### Gate 2: Lion Rig and Performance

1. Build deformation and control rigs with four paw IK targets and pole targets.
2. Weight-paint continuous body deformation and validate all joint extremes.
3. Author facial Shape Keys and eye, eyelid, brow, jaw, ear, mane, and tail controls.
4. Author Idle, WalkStart, Walk, WalkStop, TurnLeft, TurnRight, Wave, Jump phases,
   and Celebrate.
5. Render neutral, walk, wave, jump, speech, and recovery previews before GLB.

### Gate 3: World Blockouts

Create Sky Islands, River Garden, and Treehouse as separate Blender environment
assets. For each world, approve scale and composition before detailing:

- real ground and walkable area
- lion spawn and performance zone
- title and speech-bubble anchors
- player-card visual zone
- camera framing for desktop, tablet, and phone
- key, fill, rim, and ambient lighting
- foreground, middle-ground, and background depth

### Gate 4: World Detail

Only after blockout approval add the world-specific architecture, vegetation,
water/cloud surfaces, props, particles, and secondary animation described in
`art/blender/references/README.md`.

### Gate 5: Offline Acceptance

Nothing enters the web application until Blender previews demonstrate:

- matching lion silhouette, proportions, face, colors, and personality
- no floating paws or props
- believable four-leg support and weight transfer
- scene composition matching the references at all three target aspect ratios
- readable UI-safe zones without baking player data into the 3D scene
- stable lighting, shadows, materials, and motion

### Gate 6: Runtime Integration

After visual approval:

- export lion and environments as separate GLBs
- validate with the project contract and Khronos glTF Validator
- load through one full-screen R3F Canvas
- keep Parent, player cards, New Player, focus, accessibility, and navigation in DOM
- spatially anchor the speech bubble to the lion head marker
- performance-test mobile, tablet, and desktop before enabling production

## Current Status

- Reference extraction and identity/composition analysis: complete.
- Existing real-time GLB pipeline: preserved.
- Four-view identity guide: created at
  `art/blender/references/lion-turnaround-study-v1.png`, with cropped Blender
  camera plates under `art/blender/references/turnaround/`.
- Blender review stage: created at `art/blender/lion_reference_stage.blend` with
  front, side, rear, and three-quarter camera backgrounds plus measurement guides.
- First offline lion proportion study: created at
  `art/blender/lion_proportion_study.blend`, with four review renders under
  `docs/assets/lion-proportion-study/`.
- Approved production lion: not yet approved from sculpt quality.
- Sky Islands production Blender world: not started.
- River Garden production Blender world: not started.
- Treehouse production Blender world: not started.
- New production app integration: intentionally paused.

## Immediate Next Asset Task

Create the approved lion proportion study and clay blockout in a new Blender
working file. The first review deliverable is a four-view turntable plus a
grounded three-quarter pose beside the video reference. Do not rig, texture, or
integrate this new sculpt until its silhouette and mascot identity are accepted.

## Proportion Study Review 1

The first study was inspected against the extracted lion close-ups. It correctly
moves away from the previous tall two-legged prototype by establishing a compact
body and four grounded paws. It is not approved to advance.

Open corrections:

- replace the spherical face with the softer pear-shaped forehead and cheeks
- integrate the short muzzle, cheeks, mouth corners, and chin as one facial mass
- reshape the mane from uniform petals into layered swept clumps
- shorten and widen the chest-to-rump transition further
- replace capsule intersections with continuous shoulder and hip forms
- make paws thick and rounded without reading as shoes
- improve eye spacing, eyelids, brows, nose bridge, and smile asymmetry
- lower the chest and clarify the rear hock silhouette
- preserve all four ground contacts in front and three-quarter views

Do not rig or retopologize until these silhouette and identity corrections pass.

## Proportion Study Review 3

Version 2 was preserved as `art/blender/lion_proportion_study_v2.blend` with its
renders under `docs/assets/lion-proportion-study-v2/`. Version 3 was rebuilt and
rendered after adding a continuous mane hood, fewer overlapping mane clumps, a
longer compact torso, smaller eyes and muzzle, smaller paws, and a lower tail.

Version 3 is still **not approved**. It improves the broad silhouette, but the
side and three-quarter renders still reveal construction that cannot support a
production rig:

- cylindrical lower legs and visibly intersecting shoulder, knee, and hip masses
- paws still reading as footwear instead of soft weight-bearing anatomy
- a flat facial mask with insufficient eyelid, cheek, nose-bridge, and jaw planes
- mane clumps that remain too uniform and detached from one another
- abrupt chest, neck, belly, and rump transitions instead of one continuous body
- no production topology for deformation, shape keys, or weight painting

The next pass must be a continuous clay sculpt/modeling pass in Blender using the
camera overlays in `lion_reference_stage.blend`. Do not continue polishing this
with more disconnected primitives. Do not rig, retopologize, export, or integrate
until a new neutral clay turntable passes the identity and ground-contact gate.

---

## Update — 2026-08-21

### The world is live in the product

`river-garden-3d` is a registered theme in `src/data/homepageThemes.ts` and
renders through `RiverGarden3DWorld`, which implements the same `WorldProps`
contract as every painted world. Selectable from the existing ThemePicker.
**Not the default** — see the payload note below.

### Markers, and which ones the UI uses

The environment GLB carries ten authored anchors. `AnchorProjector` projects
them to screen space every frame.

| Marker | Used by |
|---|---|
| `MARK_CameraTarget` | camera dolly pivot |
| `MARK_LionSpawn` | character placement, and the brain's home mark |
| `MARK_WalkLeft` / `MARK_WalkRight` | derive the walkable radius |
| `MARK_SpeechAnchor` | speech bubble — **projected live** |
| `MARK_TitleZoneHero` | title — **projected live** |
| `MARK_TitleZone` | the original wide-framing title anchor, unused at hero distance |
| `MARK_CardShelfZone` / `…Hero` | **not used** — see below |
| `MARK_LionGreeting` | reserved |

**Player cards are deliberately not marker-anchored.** Anchoring them to
`MARK_CardShelfZone` put them mid-island directly over the character's chest and
front paws. They sit at the bottom of the viewport, as in the reference frame.

### Camera

The Blender camera is adopted wholesale — position, rotation and lens — then
dollied **along its own authored view axis**, so the approved angle and focal
length survive and only distance changes. Dolly is keyed off
`min(width, height × 1.25)`: 0.53 desktop / 0.48 tablet / 0.44 phone. Keying on
width alone put a tall tablet in portrait at the closest setting and cropped the
character.

### Look pass

Screen-space AO (temporally stable — a flickering occlusion pass on a children's
homepage is worse than none), shallow depth of field, high-threshold bloom, faint
vignette. Gated on `hardwareConcurrency >= 6 && width >= 700`.

Guard-rails, recorded and **not yet fully honoured**: AO must not compensate for
wrong paw placement; DOF must never soften the player cards; bloom must not wash
the pastel palette. Not yet profiled on real low-end hardware.

### Payload

`three` is lazy-loaded in its own chunk. The main JS bundle is unchanged at
515 KB. The 3D path costs ~3.1 MB (world) + ~2.1 MB (character) on first use,
which is why it is opt-in rather than default.

### Fallback

No WebGL, a lost context, or `prefers-reduced-motion` falls back to the painted
`RiverGardenWorld`. The world itself makes that choice, and swaps the DOM mascot
back in — deciding it in the page by theme id meant the fallback rendered with no
character at all.

Reduced motion falling all the way back is **too blunt** per the brief: the
character should stay, with wandering and jumping disabled and breathing and
blink kept. Outstanding.

## Lock status — 2026-08-21

The lock still holds: the prototype lion has not been promoted to
`lion_master.blend`, and `lion_v2.glb` remains the shipping proxy.

What has changed is that the production mascot now has a measured case for
acceptance on two of the three axes the lock requires.

**Silhouette / proportion — measured.** Weighted IoU 0.878 registered (front
0.936, side 0.875, rear 0.825, 3/4 0.822), from 0.590 at the start of the rebuild.
Mesh is 1,005 verts, 100% quads, watertight, zero slivers.

**Motion — measured, and better than the proxy it would replace** on locomotion
accuracy (walk support slide 0.166 mm against the donor's 0.46 mm), rig headroom
(22.1 / 42.1 mm against 20.0 / 40.9) and mesh cleanliness (16 flipped faces
against 24). Zero battery FAILs, 0.00 mm IK residual on all four paws.

**Face, colour and surface — not started.** This is what still blocks promotion.
The head is a smooth skull: no eye sockets, no brow plane, no cheek break, no
mouth, and no texture or material work. The lock's requirement that the rebuilt
lion match "silhouette, proportions, face, colors, and personality" is satisfied
on the first two and untouched on the last three.

Promotion criteria unchanged. Runtime spot-check at each pass: 191.6 KB GLB,
Khronos-clean, both clips present, floor gap -17.2 mm, 29 draw calls, 121/121

> Re-measured in the browser 2026-09-03: the shipping proxy `lion_v2.glb` reads
> **-17.2 mm**, not -11.5. Its own geometry has minY = -0.0146, so it has always
> sunk by this much; the -11.5 figure was stale. The assembled cage asset reads
> **+4.7 mm**. Draw calls for the assembled asset are **51** — 78 before the
> face meshes were joined per material (17 meshes -> 4). For comparison the
> shipping proxy measures 47 and the faceless cage 45 in the same scene, so the
> world floor is ~43 and the faced, maned character costs 8 draw calls against
> the proxy's 4. See the seventh- and eighth-pass entries in
> `codex-claude-handoff.md`.
homepage QA checks green.
