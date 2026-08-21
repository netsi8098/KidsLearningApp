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

---

# GATES 5–7 — production armature, authored skinning, four-leg IK

## Authored skinning, not heat maps

Automatic weighting infers ownership from proximity, and proximity cannot
distinguish "near the scapula" from "belongs to the scapula". That is why the
auto-weight baseline lost volume in exactly the armpit and inner thigh.

The cage does not have to guess. It is built from named rings and now records
them as vertex groups, so ownership is **looked up**:

    "frontR:elbow_lo"  ->  upper_front 0.24, forearm 0.76

Joints blend across three rings rather than switching at one. Two things a
cross-section cannot express are handled positionally instead:

* **Jaw** — a muzzle ring contains both the upper lip and the chin, so the split
  comes from height, with a lateral taper toward the mouth corner.
* **Mouth cavity** — explicitly weighted to the jaw, because the inside of a
  mouth rotates with it.

The 95 ring groups are consumed and removed; the shipped GLB carries 35 bone
groups and nothing else.

## The mouth had to become a real opening

A jaw cannot open a dent. The socket was a recessed patch, and rotating the jaw
under it could only crease the surface — the battery measured the mouth
collapsing to **6.8%** of rest area and was right to. Extruding the socket
centre inward makes the rim into lips, the extrusion walls into the inside of
the mouth, and the pushed-back cap keeps the surface watertight.

Result: **0.068 → 0.515.**

## Deformation battery, final

**7 PASS · 5 WARN · 0 FAIL · 0 pinched faces across all twelve poses.**

| | auto-weight baseline | authored |
|---|---|---|
| FAIL poses | 4 → 0 | 0 |
| Pinched faces | 10 | **0** |
| Worst area ratio | 0.115 | **0.267** |
| Real inversions | — | 18 |

The inversion metric had to be corrected too. Comparing a deformed normal to its
rest normal *in world space* flags every face on a limb that swings past 90
degrees — the underside of a forearm rotating 100 degrees genuinely does point
the other way, and that is rotation, not inversion. Each face now finds its
dominant bone and is judged against its rest normal **rotated by that bone**.
The count fell from 54 spurious to 18 real.

## Planted-paw proof

The first version of this test moved `root` and reported drift exactly equal to
the translation. That was the test's fault: the IK targets are parented to
`root` — correctly, because `root` carries the whole character when it walks
somewhere — so nothing had been asked to stay still. A planted foot is defined
relative to the world while the **body** moves, so the body is moved by the
pelvis.

**Reach headroom** is a rig characteristic and is now measured and reported: a
chain can only reach the sum of its segment lengths, so the surplus over the
straight-line hip-to-paw distance is all the extension available.

| | front | rear |
|---|---|---|
| Reach headroom | 20.0 mm | 40.9 mm |

The front legs were originally bound **dead straight**, giving 11 mm of headroom,
and the test then asked for a 50 mm body rise and blamed the IK. Both limbs are
now bound pre-bent — the elbow points back, the stifle forward, the hock back.

| | worst paw drift |
|---|---|
| Extreme amplitudes (75–90 mm body moves) | 28.0 mm |
| **Animation amplitudes (8 mm bob, 12 mm rock, 18 mm advance)** | **2.86 mm** |

Rear paws hold to 0.03–0.22 mm at animation amplitudes. Extreme-amplitude drift
is dominated by the reach limit above, which is documented rather than hidden —
the walk and jump clips must stay inside it.

## Rig, runtime, and separation of concerns

44 bones authored, **35 deforming**. The eight IK targets and pole targets are
excluded from the skin by `export_def_bones`, so no control widget reaches the
production asset: **0 control bones in the skin**. Mid-limb joints carry hinge
limits and locked Y/Z so IK cannot solve an elbow sideways.

`lion_cage_rigged.glb` — 961 verts, 1,918 tris, 35 joints, **63.5 KB**, Khronos
validator clean, loads at `/world3d?mesh=cage` with no errors. App regression:
121/121 homepage QA.

Also fixed: the HUD's `grounded` boolean tested a legitimately varying
measurement against an arbitrary 2 cm and reported "not grounded" for a correctly
seated character. It now reports the floor gap in millimetres (−11.5 mm for the
cage) and notes when the seating code has compensated.

## Verdict

**Cage, skeleton, skinning and IK are proven. Ready for locomotion.**

Next on the critical path: idle → four-beat walk with per-paw state
visualisation at 0.25× → stop/turn/navigation → three-leg wave → jump.

### Known, carried forward
* deep-crouch and mouth-open retain 6 real inversions each at extreme angles
* 4 sliver faces in cap fans
* mane still the 31-lock proxy, untouched by design
* rib/haunch shape refinement, cream chest V, inner-ear region

---

# GATES 10–11 — Idle and the four-beat walk, on the cage

## Authored through IK, not FK

The requirement is that a planted paw appears stationary relative to the ground
during support. In FK that means hand-tuning limb rotations until the paw happens
to trace a straight line — the kind of thing that looks right at full speed and
slides at 0.25×.

Driving the IK targets makes it structural. During stance a target travels
backward in a straight line at exactly the rate the body advances; the clip
carries no root translation, so when the runtime moves the character at
stride ÷ cycle the two cancel and the paw is stationary **by construction**.

## Gait

| | |
|---|---|
| Sequence | lateral: RL → FL → RR → FR, a quarter cycle apart |
| Cycle | 36 frames @ 24 fps = 1.5 s |
| Duty factor | 0.75 stance / 0.25 swing per limb |
| Support window | 0.68 (the last 7% of stance is LIFT — unweighting) |
| Stride | 0.24 model units → ~0.32 m/s at the 1.30 m runtime scale |
| Feet planted | **3 at every sampled frame** |

`docs/assets/gate-walk/walk-states.png` shows twelve frames with each paw's
phase — `CONTACT / STANCE / LIFT / SWING / PLACEMENT` — and the planted count.

## Planted-paw, measured

| | worst |
|---|---|
| Support slide | **0.46 mm** |
| Support vertical | **0.15 mm** |
| IK residual, all four legs | **0.00 mm** |

Getting there took five separate fixes, and only one of them was the animation:

1. **Pin the ankle, not the paw.** Constraining the paw pins its tail but leaves
   the bone free to rotate about that point, so the *sole* tilts — and the sole
   is what touches the ground. The IK now sits on the wrist/ankle and the foot
   takes its orientation from the control. Planted-paw drift at animation
   amplitudes: 2.86 mm → 0.257 mm.
2. **Make the control an exact copy of the foot's rest transform.** A world-space
   Copy Rotation snaps the foot to the control's orientation, so a control
   pointing along +Y forced a foot that rests pointing down-and-forward flat.
3. **Widen the rear joint limits.** With the hock clamped at −6° the rear chain
   could not open far enough to follow its control: IK residual 21 mm, and the
   planted rear paws rose by exactly that. The front chain, unclamped, tracked to
   0.00 mm. A limit that stops a joint inverting is useful; one that stops it
   reaching its own target is a bug with an explanation.
4. **The gait arithmetic was wrong.** The body advances the stride over the FULL
   cycle, but a paw is only planted for 0.75 of it — so relative to the body a
   planted paw travels `stride × dutyFactor`, not `stride`. Swinging the target
   ±stride/2 made the paw travel 33% faster than the body moved forward and every
   planted paw slid ~55 mm. Caught because the compensated **target** position
   drifted, which ruled out the solver and pointed back at the authoring.
5. **Linear interpolation on the foot controls.** The control's rest orientation
   is tilted, so a world-space straight line becomes two sloped curves in the
   bone's local Y and Z. Easing those independently breaks the relationship
   between them and bends the path back into three dimensions — the goal wandered
   6.4 mm vertically and came up 24 mm short. Body curves stay Bezier; control
   curves are linear, because a linear combination of linear curves is linear.

## Idle

5 s loop with three deliberately incommensurate cycles — breath every 2.5 s, a
weight shift every 5 s, tail every 3.3 s — so the loop does not visibly beat.
Restrained on purpose: the child is choosing a profile. Ear flicks are brief,
sparse and asymmetric; a steady ear wobble reads as a mechanism.

Blink and eye saccades are **absent** — they need facial shape keys, which do not
exist yet.

## Runtime

`lion_cage_anim.glb` — 189.2 KB, 35 joints, **0 control bones in the skin**,
`Idle` and `Walk` each 105 baked channels. glTF has no IK, so baking is what
turns the solved chain into per-bone transforms; verified that `thigh_RL`,
`shin_RL`, `hock_RL`, `upper_front_FL` and `forearm_FL` all carry curves.
Khronos validator clean. Loads at `/world3d?mesh=cage`, no errors, still 29 draw
calls.

Also fixed: the runtime measured the character's footprint with
`Box3.setFromObject`, which walks the live scene graph and therefore describes
the **current pose**. Once a clip was playing, a re-run of that effect measured a
mid-stride pose and reported the floor 444 mm below the origin — the character
was seated against that and sank into the island. The footprint is now taken from
geometry bind-pose bounds, which cannot depend on the frame.

## Verdict

Idle and the four-beat walk are proven on the production cage. Next:
stop/turn/navigation with head lead, then the three-leg-supported wave, then jump.
