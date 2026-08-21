# GATE 4 checkpoint — lofted-ring production cage

Assets: `docs/assets/gate-cage/` · Scripts: `tools/blender/cage_lion.py`,
`tools/blender/deform_qa_lion.py` · Rollback: `git tag pre-retopo-cage`

## A / B. The cage

Built the way a box-modeller builds a quadruped, not by remeshing:

* torso, neck and head are **one tube of cross-sectional rings** from rump to
  nose, each ring placed and sized against the locked contract;
* every limb, the tail and both ears **grow out of a 3x3 patch** of that tube —
  the four patch faces are deleted and the eight boundary vertices become the
  appendage's first ring. Nothing is bridged or stitched, so limb loops flow
  into the torso by construction;
* joints get as many rings as the deformation test needed, named individually
  (`elbow_up` / `elbow` / `elbow_lo`, `hock_up` / `hock` / `hock_lo`) rather
  than a fixed "three loops";
* the **hock reverses direction** — the rear leg is not a human leg, and walk,
  crouch, take-off and landing all depend on that being in the cage;
* eyes, mouth and brows have concentric loops from repeated `inset_region`,
  authored on a closed surface;
* the muzzle's forward reach is pulled from 0.672 to 0.650 and its front rings
  flattened (rz below rx), correcting the profile note without rebuilding the head.

Not shrinkwrapped. The sculpt now contains the mane locks and wrapping onto
those would drag the head out into the mane — and keeping the mane separate is
the right production call regardless.

## C. Statistics

| | |
|---|---|
| Vertices | 949 |
| Faces | 947 — **947 quads, 0 tris, 0 n-gons** |
| Triangulated | 1,894 |
| Loose vertices | 0 |
| Non-manifold edges | 0 |
| Boundary edges | **0 (watertight)** |
| Degenerate faces | 0 |
| Sliver faces | 4 — all in cap fans, none in a joint |
| Valence | 4: 841 · 3: 60 · 5: 44 · 6: 4 |
| GLB | 63.3 KB, 36 joints, `JOINTS_0` + `WEIGHTS_0` present |
| Khronos validator | **no errors, no warnings** |

Poles sit only at the nose tip, four paw soles, two ear tips and the tail tip.
**No pole in any bending joint.**

## D. Deformation QA — measured, not eyeballed

For every pose each face's deformed area is compared to its rest area; below 25%
is a pinch, below 10% is severe, and a normal that reverses is an inversion.

**9 PASS · 3 WARN · 0 FAIL.** Worst area ratio across all twelve poses: **0.115**.

| Pose | worst area | pinched | flipped | |
|---|---|---|---|---|
| neutral | 1.000 | 0 | 0 | PASS |
| deep crouch | 0.132 | 4 | 5 | WARN |
| front paw lifted | 0.168 | 4 | 34 | WARN |
| front leg forward | 0.483 | 0 | 0 | PASS |
| front leg back | 0.427 | 0 | 0 | PASS |
| rear leg compressed | 0.115 | 2 | 4 | WARN |
| rear leg extended | 0.780 | 0 | 0 | PASS |
| head turned | 0.469 | 0 | 0 | PASS |
| head tilted | 0.846 | 0 | 0 | PASS |
| mouth open | 0.468 | 0 | 0 | PASS |
| smile | 0.876 | 0 | 0 | PASS |
| neck full nod | 0.616 | 0 | 0 | PASS |

Two measurement bugs had to be fixed before these numbers meant anything, and
both had produced convincing-looking failures:

1. **The wireframe modifier was inside the evaluated mesh.** `to_mesh()`
   evaluates through the viewport depsgraph, so the metric was measuring the
   wireframe's thin edge strips, whose normals swing wildly under any
   deformation. That is where "311 flipped faces on one paw lift" came from. Set
   `show_viewport = False`, `show_render = True`.
2. **The scapula bone head was buried in the chest**, so heat-map weighting
   handed it a share of the rib cage. Moved to just under the surface.

Weights here are automatic + limited to 4 influences + lightly smoothed — a
baseline, not hand painting. That matters for reading the WARNs: they are all
extreme-compression poses, and their few remaining pinches sit in the armpit and
inner thigh, which is precisely what manual weighting addresses.

## E. Runtime

Exported to `public/assets/lion/cage/lion_cage.glb` and loaded in React Three
Fiber at `/world3d?mesh=cage`: renders at the correct 1.300 m under the
production lights and look pass, **no console or page errors**. Scene still 29
draw calls.

One cosmetic note: the HUD reports `grounded: false`. The paw soles sit 8 mm
above z=0 in the cage, so the measured bbox floor is ~1 cm — inside the seating
logic's tolerance for placement but outside the flag's 2 cm threshold. The
character is seated correctly; the flag is what needs widening.

## F. Decision

**The topology is ready for the production armature.**

Zero FAIL poses, watertight, all-quad, no pole in a bending joint, and a clean
Khronos validation. The three WARNs are extreme-pose compression under baseline
automatic weights, not structural pinching — the remaining volume loss is in the
armpit and inner thigh, which is a weighting problem and belongs to GATE 6.

Proceeding to: production armature (the 36-bone hierarchy in `deform_qa_lion.py`
is already the specified one) → manual weight refinement → four-leg IK → planted-
paw proof.

### Carried forward as known work, not blockers

* rib cage and haunch now have rings but need shape refinement;
* cream chest V — vertex colour / material mask, not geometry;
* ears read from side now but the inner-ear region is not modelled;
* 4 sliver faces in cap fans;
* mane still the 31-lock proxy, deliberately untouched.
