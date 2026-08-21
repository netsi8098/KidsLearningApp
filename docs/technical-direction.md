# Technical direction — every point of the brief, with the technique chosen

Written after a research pass, because three rounds of iterating *inside* the
wrong technique produced diminishing returns. Sources at the end.

Status key: **DONE** · **PART** (working, below standard) · **PLAN** (technique
chosen, not built) · **BLOCKED**

---

## What the research changed

Five findings. Each one invalidated something I had been doing.

### 1. Stylised hair is built from LOCKS, not volumes

> "Stylized or cartoon characters, like those in Pixar or anime, often feature 3D
> hair as solid shapes or large curve strips instead of individual strands,
> resembling big locks or chunks."

I had spent three passes placing spheres. A sphere has no direction, and
direction is the entire point of a mane — it is what makes hair read as hair.
The mane is now 31 Bezier locks with a flattened bevel profile and a per-point
radius taper, rooted *inside* the mane mass and sweeping outward along an
azimuth/elevation with a tip curl. **DONE** — and it took two attempts inside
the new technique too: the first rooted them shallow with a sharp taper and
produced a sea urchin. Locks are surface *relief* on a solid mass, not the mass.

### 2. A quadruped walk is a FOUR-BEAT LATERAL sequence

> "During the walk, each hind foot alternates, replacing the front foot on the
> same side… the animal always has two to three points of contact."
> Order: **BL → FL → BR → FR**, a quarter-cycle apart. Diagonal pairs are a *trot*.

My Walk clip moved diagonal pairs — a trot — and carried a code comment
asserting that was correct quadruped motion. Rewritten as four beats 25% apart,
75% stance / 25% swing per limb, knee flexing only during swing, with the body
rocking once per cycle toward the supporting side and the head counter-rotating
to stay level. **DONE**

### 3. The plush look is a SHEEN layer

> Sheen represents cloth and fabric in `MeshPhysicalMaterial`; `sheen`,
> `sheenColor`, `sheenRoughness`.

The reference character is felt, not injection-moulded plastic. No amount of
geometry fixes that — it is a material property. The two character materials are
now `MeshPhysicalMaterial` with `sheen: 0.9`, a warm `sheenColor`, and high base
roughness; the wet parts (eyes, nose, teeth, tongue) get `clearcoat` instead,
because sheen on an eyeball kills the catchlight. Applied to the character only —
never to the 29 environment materials. **DONE**

### 4. Ambient occlusion is what makes things sit on the ground

A directional shadow gives no contact darkening in creases. Everything was
floating. `N8AO` chosen over classic SSAO for temporal stability — flickering AO
on a children's homepage is worse than none. Plus a shallow depth of field
(the reference is unmistakably a frame shot through a lens) and bloom at a high
threshold only. **DONE**, gated on `hardwareConcurrency >= 6 && width >= 700`.

### 5. Topology must be authored around joints, not remeshed

> "Circular loops around joints — elbow and knee need at least three tight loops.
> Draw circular loops around the eyes and mouth first… poles placed in a
> high-deformation area cause pinching."

Quadriflow aligns to *curvature*. It cannot know a hock from a bulge, so it
cannot put three loops in an elbow. **PLAN** — see GATE 4.

---

## Gate-by-gate

### GATE 1 — Runtime cleanup · DONE
Studio floor deleted pre-rig; `assert_production_clean()` refuses any export
containing a non-`Lion_*` mesh, a development token in a name, or anything over
3m. `Sit`/`Sleep` out of the autonomous rotation until GATE 7.
Debug visualisation behind a flag: **PLAN** (`?debug=1`, see GATE 25).

### GATE 2 — Hero composition · DONE
Lion 1.30m; camera dollied along its authored axis (angle and lens preserved);
0.53/0.48/0.44 keyed off `min(width, height × 1.25)`; spawn moved 0.42m back so
cards clear the paws; verified at 1920×1080, 1440×900, 1180×820, 820×1180.
Title does not overlap the lion. Headroom for jumping and ground for walking are
reserved by the `stageRadius` bound, not by eye.

### GATE 3 — Lion silhouette · PART
Proportions measured off the approved sheet and unified into
`tools/blender/lion_contract.py` (they had been copied into three scripts and
drifted). Legs 0.36 H → 0.19 H; mane width 0.61 → 0.67 H; head width 0.35 → 0.41 H.

| Sub-point | Technique | Status |
|---|---|---|
| 2A head/face | measured contract; face plate pushed through the mane opening; muzzle forward-reach held while the skull grew, so it tucks rather than projects | PART — muzzle still slightly long in profile |
| 2B mane | curve locks in four layers (crown/quiff, side frame, chest ruff, rear) on a solid base mass | PART — locks read, but cover only the rim; need a second denser layer over the whole surface |
| 2C body | chest/waist/hip radii differentiated on the skin chain | PART — no rib or haunch definition yet; reads long and low in profile |
| 2D legs | joint vertex with a larger radius than the shaft below it, so retopo and rig have an elbow/knee to work with | PART — regions suggested, not modelled as scapula→upper→elbow→lower→wrist→paw |
| 2E paws | separate broad flattened volumes, three toe lobes, claws, cream | DONE |
| 2F tail | attachment → taper → arc → distinct tuft volume (the Skin modifier tapers a chain end to a point, so the tuft must be its own mass) | DONE |
| 2G ears | small tabs forward of the mane plane; `ear_L`/`ear_R` bones exist for independent rotation | PART — do not read from side view |

Missing: cream chest V; rump haunch.

### GATE 4 — Retopology · **DONE**
Quadriflow gives 100% quads and 0.07% silhouette deviation, but no authored
loops. Chosen technique: **build the base cage as lofted quad rings** —
generate explicit rings along each limb (with three tight rings at each elbow,
knee, wrist, hock) and concentric rings around eye and mouth, then shrinkwrap
that cage onto the sculpt. Topology becomes correct *by construction* rather than
by remesher luck, which is the only way to author loops from a script.
QA: the extreme-pose battery from the brief (mouth open, smile, head turn, neck
tilt, shoulder forward, elbow full bend, wrist bend, hip flexion, knee
compression, crouch) rendered before the rig is trusted.

### GATE 5 — UV / material · PLAN
Two materials today (matte fur, gloss wet) with colour in vertex attributes,
which is why the whole character is 2 draw calls. Adding: one UV set and one
hero texture atlas for the lion carrying baked AO + curvature + a subtle fur
normal. Environment stays on shared vertex-colour materials. Every region the
brief lists is already separable — they are vertex-colour regions, not materials.

### GATE 6 — Skeleton · **DONE**
41 bones exist with IK on four legs, but the naming does not match the brief.
Rebuild to the specified hierarchy: `root → pelvis → spine_01 → spine_02 →
chest → neck → head → jaw`, four chains `scapula_FL → upper_FL → elbow_FL →
lower_FL → wrist_FL → paw_FL` (and rear `hip → thigh → knee → hock → ankle →
paw`), `tail_01..05 → tail_tuft`, `ear_L/R`, eye bones, mane-follow bones.
Semantic names matter because the runtime reasons about them.

### GATE 7 — Skinning · **DONE** (authored, not hand-painted)
Automatic weights are why `Sit` collapses. Needs inspection and manual
correction at shoulder, armpit, elbow, hip, knee, belly, neck, tail base.

### GATE 8–9 — IK and rig proof · **DONE**
IK exists on four legs with pole targets and control bones excluded from
deformation. The planted-paw-under-body-shift test is not yet run, and it is the
fundamental one.

### GATE 10–14 — Idle, walk, turn, wave, jump · PART
Ten clips authored. Walk now correct (finding 2). Wave already performs the
weight transfer the brief demands. Jump has anticipation → takeoff → air → land →
recovery and drives `root` translation *and* leg extension, not root alone.
Turning is procedural yaw with a face-before-move rule; dedicated turn clips with
head lead and paw reposition are **PLAN**.
Walk speed is a written parameter (`WALK_SPEED = 0.52` in `lionBrain.ts`) derived
from stride × cycle, not eyeballed — but it needs re-deriving now the gait
changed from 32 frames/2 strides to 48 frames/4 beats.

### GATE 15–16 — Face and speech · PART
Eyes are real nested geometry: sclera, iris, pupil, catchlight, built as stacked
flat discs because concentric spheres cannot nest safely (offset + radius must
stay inside the parent, and it did not — the iris punched through). Mouth has a
dark cavity, a seven-tooth band, canines and a tongue.
**PLAN**: shape keys. `Blink_L/R/Both`, `Squint`, `EyesWide`, `BrowUp_L/R`,
`BrowDown`, `Smile`, `SmileWide`, `CheekRaise`, `JawOpen`, `MouthWide`,
`MouthNarrow`, `MouthRound`, and visemes `REST MBP FV AA E I O U L`. Blender
shape keys export to glTF morph targets automatically; three.js drives them via
`morphTargetInfluences`. Eye look-at via eye bones, allowing controlled
convergence rather than identical rotations.

### GATE 17 — Runtime state machine · PART
`LionBrain` owns behaviour with no scene or React access, which is what makes it
testable. Semantic API present: `walkTo` `wave` `celebrate` `nod` `jump` `sit`
`sleep` `talk` `greet` `idle`.
**PLAN**: `lookAt` / `notice` / `turnTo` / `speak` / `stop`; the semantic state
enum (`LOADING IDLE NOTICE LOOKING TURNING WALKING STOPPING WAVING SPEAKING
JUMP_* LANDING CELEBRATING`); and **animation layers** so speech, blink, eye
direction, paw motion, tail and breathing run *concurrently* — the brief is
explicit that serialising them is wrong, and today a clip switch is exclusive.

### GATE 18–19 — World look development · PLAN
- **Grass**: broad colour gradients + baked AO already in vertex colours; add
  selective instanced tufts at island edges and around rocks. `InstancedMesh`,
  clump-on-a-quad rather than per-blade geometry.
- **Trees**: currently clustered spheres. Move to sculpted canopy masses with
  baked normals; improve trunk taper and root flare.
- **Water**: depth-difference shader — shoreline / mid / deep-fog colour bands
  from the depth texture, scrolling normals, soft highlights. Stylised, not ocean
  simulation.
- **Island / far background / clouds / rainbow**: atmospheric perspective is
  partly in (warm/cool hue split, receding hills) — needs contrast and saturation
  falloff by distance, larger coherent cloud masses, and the rainbow pulled back
  in opacity so it frames rather than competes.
- **Lighting**: soft warm key, gentle fill, sky ambient — in place. AO now gives
  the ground contact. The remaining task is art-directing it against the
  reference rather than tuning by feel.

### GATE 20 — Optimisation · PART
29 draw calls, 85k triangles, 2 materials on the character. `@gltf-transform/cli`
now installed for the asset pipeline: `meshopt` for geometry and morph targets,
`ktx2` for textures once GATE 5 adds any. Khronos glTF Validator to be added to
the export step — **PLAN**. Adaptive DPR and the effects gate are in.

### GATE 21 — Final polish · PLAN, deliberately last

### GATE 25 — Debug panel · PLAN
`?debug=1`: trigger every clip, show current state, active clips and blend
weights, world and target coordinates, optional skeleton/IK/paw-contact overlay,
and time scale 1.0 / 0.5 / 0.25 for inspecting paw slide, planting, weight
transfer and cross-fades. Never in production mode.

### Root motion — DECISION RECORDED
**In-place animation + runtime world translation.** The clips carry no root
translation for locomotion; `LionBrain` owns position and heading. Chosen because
navigation targets stay exactly predictable and the same clip serves any path.
The cost is that stride and speed must be kept in sync by hand — so
`WALK_SPEED` is a written, derived constant, and re-deriving it is now an
explicit follow-up. `Jump` is the one exception and is marked as such: it moves
`root` vertically *and* extends the legs, because a jump that translates the root
without the legs generating it is the exact failure the brief calls out.

### Accessibility
`prefers-reduced-motion` currently falls all the way back to the painted world.
Per the brief that is too blunt: **PLAN** — keep the character, disable wandering
and jumping, keep breathing and blink, soften transitions.

### Blocked
`git push` refused by the permission classifier — nothing is on Azure.

---

## Sources

- [Animator Notebook — guide to quadrupeds' gaits](https://www.animatornotebook.com/learn/quadrupeds-gaits)
- [Gait analysis and biomechanics of quadruped motion](https://www.researchgate.net/publication/327681403_Gait_Analysis_and_Biomechanics_of_Quadruped_Motion_for_procedural_Animation_and_Robotic_Simulation)
- [three.js MeshPhysicalMaterial (sheen)](https://threejs.org/docs/pages/MeshPhysicalMaterial.html)
- [react-postprocessing](https://react-postprocessing.docs.pmnd.rs/introduction) · [pmndrs/postprocessing](https://github.com/pmndrs/postprocessing)
- [CGCookie — how to model hair in Blender](https://cgcookie.com/posts/how-to-model-hair-in-blender)
- [Converting hair curves and geometry nodes to mesh](https://yelzkizi.org/convert-hair-curves-geometry-nodes-to-mesh/)
- [Preparing character meshes for deformation](https://www.tripo3d.ai/blog/explore/smart-mesh-character-mesh-deformation-readiness)
- [Manual retopology, step by step](https://www.sloyd.ai/blog/manual-retopology-for-sculpted-models-step-by-step-guide)
- [glTF-Transform CLI](https://www.npmjs.com/package/@gltf-transform/cli) · [gltfpack / meshoptimizer](https://meshoptimizer.org/gltf/)
- [Codrops — stylised water with React Three Fiber](https://tympanus.net/codrops/2025/03/04/creating-stylized-water-effects-with-react-three-fiber/)
- [Codrops — fluffiest grass with three.js](https://tympanus.net/codrops/2025/02/04/how-to-make-the-fluffiest-grass-with-three-js/)
- [three.js forum — toon water with depth fog and intersection foam](https://discourse.threejs.org/t/toon-water-shader-with-depth-based-fog-and-intersection-foam/35978)
- [Blender shape keys → glTF morph targets in three.js](https://discourse.threejs.org/t/blender-to-glft-export-animation-and-morph-target/22177)


---

## Status revision — 2026-08-21

Gates 4, 6, 7, 8 and 9 are complete. See `docs/gate-cage-report.md` for every
number and `docs/rigged-lion-production.md` for the pipeline.

### Corrections to this document's own claims

**Root motion (GATE 21).** The decision stands — in-place animation plus runtime
world translation — but the document said `WALK_SPEED` was "a written, derived
constant, not eyeballed" and treated re-deriving it as a follow-up. That was too
generous. It had already silently drifted 4× out of step with the clip. The
parameter is no longer derived at all: it is **measured off the authored action**
and emitted as data beside the GLB. A locomotion constant maintained by hand is a
standing invitation to skating.

**GATE 11 Walk.** Listed as DONE on the strength of the gait research. The clip
was correct; the runtime translation matching it was not, and the rig's own IK
constraints were overriding the FK keys — measured paw travel was 18 mm per cycle
where the authored swing gives 230 mm. Both fixed. The walk still needs the
per-paw state visualisation and a 0.25× inspection before it can be called done.

**GATE 5 UV / material.** Still PLAN. No textures exist yet, which is why the
`gltf-transform` KTX2 step is installed but unused.

### Revised critical path

1. Idle — breathing, blink, saccades, ear, tail. Restrained.
2. Four-beat walk **on the production cage**, with per-paw state at 0.25×.
3. Stop / turn / navigation with head lead.
4. Three-leg-supported wave.
5. Jump — anticipation / takeoff / air / land / recovery, legs generating it.
6. Facial shape keys + visemes.
7. `?debug=1` panel and skeleton overlay.
8. Retire the proxy: skin mane, eyes and teeth to the cage.
9. Then final mane, character surface, world look-dev, optimisation.
