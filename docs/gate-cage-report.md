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

## Reference-driven detail pass — 2026-08-21

Weighted silhouette IoU **0.817 → 0.846** (registered; 0.839 unregistered), with
the proven motion system intact. Every correction below came from a measurement,
and two of them reversed a diagnosis made from the overlay by eye.

### What the measurements changed

A new tool, `tools/cad/band_spans.py`, reports per height band the outer span, the
largest interior gap and the centroid for reference and model side by side.
`silhouette_qa.py` says how much a band disagrees; it does not say which way, and
a band can be 10,000 pixels wrong because it is too narrow, too short, or in the
wrong place. Those call for opposite corrections.

| Correction | Evidence | Result |
| --- | --- | --- |
| Tail rebuilt with a tuft | side band 0.50-0.55 was +0.563 H too wide, 0.15-0.20 was -0.473 H short — the same error twice | side IoU 0.735 → 0.781 |
| Ears moved to the side of the head | segmented mane vs full silhouette diverge 1.69x at h 0.82; the difference is non-mane-coloured, i.e. ears | front IoU 0.888 → 0.916 |
| Mane fitted per height band | one global x-scale could not undo subdivision's uneven shrink | mane profile now flares 0.248 → 0.713 as the reference does |
| Rump pulled forward, rear rings respaced | reference y_rear is -0.319 at z 0.40 where the model reached -0.492 | rear IoU 0.799 → 0.835 |
| Centroid registration in the QA | 3/4 view carried a 12px canvas offset against ≤6px elsewhere | 3/4 0.812 → 0.830 |

### Two diagnoses the measurements overturned

**The top-band overshoot was the ears, not the mane crown.** Measuring per object
settled it: in band 0.95-1.00, `LionCage` reached 0.442 H and `LionMane` only
0.293 H against a reference 0.248 H. The "blue lumps on the crown" in the front
overlay were ear tips pushing through the mane. An earlier pass had lowered the
ears for exactly this reason, which was right — but it bought height by hiding
them inside the mane, and cost 0.10-0.17 H in the band below.

**The 0.75-0.90 deficit was the mane, then the ears again.** The overlay showed
solid red discs at ear height and the obvious reading was "ears too small". The
band data disagreed: the reference flares smoothly while the model plateaued, so
it looked like a mane-profile fault. Then the two reference measurements settled
it properly — the colour-segmented mane and the full silhouette agree everywhere
except h 0.74-0.86, where they diverge by up to 1.69x. Material outside the mane
that is not mane-coloured is the ears. Both organs were wrong, in opposite
directions, and only separating the two measurements showed which was which.

### A latent bug the ears exposed

`ring_frame()` returned a hardcoded `right = (1,0,0)` without orthogonalising it
against the tangent. Every ring in the cage until now had a tangent with x = 0 —
body along Y, limbs along -Z, tail along -Y — so it happened to be perpendicular
and the basis happened to be orthonormal. Ears grown along +X made `right` nearly
parallel to the normal, so the ring plane was not a plane and the rings collapsed
toward a line: 8 slivers at the ear base and tip cap. Now projected properly, with
the cross-product order preserved exactly (reversing it would flip every ring's
winding and invert normals model-wide). For any tangent with x = 0 the projection
is a no-op, so body, limbs and tail are bit-identical.

### Motion, re-proven on the corrected mesh

The tail chain, both ear bones and the rear body rings all moved, so the rig was
rebuilt and the full battery re-run.

| Metric | Donor | Before this pass | After | |
| --- | --- | --- | --- | --- |
| Battery FAIL | 0 | 0 | **0** | held |
| Pinched faces | 0 | 4 | **2** | improved |
| Worst area ratio | 0.267 | 0.128 | 0.128 | — |
| Walk support slide | 0.46 mm | 0.62 mm | **0.64 mm** | held |
| Walk vertical | 0.15 mm | 0.17 mm | **0.14 mm** | improved |
| IK residual, all four | 0.00 mm | 0.00 mm | **0.00 mm** | held |
| Planted paw, animation | 0.052 mm | 0.069 mm | 0.070 mm | held |
| Reach headroom | 20.0/40.9 | 20.0/40.9 | 20.0/40.9 | held |
| Feet planted per frame | 3 | 3 | **3** | held |

The pinch count improving from 4 to 2 was not a weight change. Pulling the rump
forward left the rear rings bunched at 0.030/0.030/0.022 apart where they had been
0.050/0.038/0.028, and tighter rings make smaller faces, which the area-ratio
metric reads as a pinch. Respacing `haunch` forward to -0.320 restored the
spacing and took the count 6 → 2 — closer to the donor than before this pass
started. Reverting `haunch_back` had been tried first and was not the cause: same
6 pinches, and slivers went 2 → 4.

`rig_overlay_check` reports REVIEW rather than PASS. All 13 flagged joints are
rear-leg or pelvis, none elsewhere — a single coherent cause, the documented 12%
rear-limb trim that stopped the midline collision. Clearances are 0.9-5.9 mm and
every joint is contained; `tail_06`'s tip was pulled back inside the tuft, which
removed the one flag that was not part of that group.

Runtime: 190.9 KB GLB, 989 verts / 1,974 tris / 35 joints, Khronos clean, zero
control bones in the skin, both clips present, floor gap -11.5 mm, 29 draw calls,
121/121 homepage checks green.

### What the overlay still shows, measured

1. **Back line too high toward the rear** — a blue band from mid-back to the rump.
2. **Mane missing mass below the chin** — red at the mane's lower front; the
   reference has a beard/ruff the model does not.
3. **Legs and paws still short of the reference** — red under the belly and around
   every paw.
4. **Tuft slightly high and forward** of the reference's.
5. **No face.** Still Gate 15, still deliberately not started, and still a large
   part of why this does not yet read as *the* mascot.

### Proportion correction — the barrel rode too high

Measuring the reference side view's TOP and BOTTOM edge at each fore-aft station,
rather than only its outline, found the largest remaining error and it was not a
shape error at all:

| y | ref back | model back | ref belly | model belly |
| --- | --- | --- | --- | --- |
| 0.00 | 0.485 | 0.542 | 0.175 | 0.225 |
| -0.05 | 0.473 | 0.525 | 0.190 | 0.221 |
| -0.10 | 0.471 | 0.512 | 0.171 | 0.217 |

Both edges wrong by the same amount in the same direction means the barrel is the
right size in the wrong place: it sat ~0.045 H too high on legs correspondingly
~20% too long. The reference is a chunkier, shorter-legged cub than the model was,
and that single fact was producing the blue band along the back AND the red band
under the belly — two defects that looked unrelated on the overlay.

Torso ring centres and rz were reset from the measured top/bottom pairs, both limb
shafts compressed to keep the paws on the ground, and the spine, scapula and limb
bones moved with them. The spine positions are now written out literally instead of
derived from `SPINE_Z`, because `SPINE_Z` lives in the contract that the technical
donor also reads — changing it would silently reshape the proven fallback.

| Metric | Donor | Before | After | |
| --- | --- | --- | --- | --- |
| Side IoU | — | 0.781 | **0.801** | first time above 0.80 |
| Weighted IoU | — | 0.846 | **0.849** | improved |
| Battery FAIL | 0 | 0 | **0** | held |
| Worst area ratio | 0.267 | 0.128 | **0.165** | improved |
| Pinched faces | 0 | 2 | **6** | regressed |
| Reach headroom FL/FR | 20.0 mm | 20.0 mm | **22.1 mm** | improved |
| Reach headroom RL/RR | 40.9 mm | 40.9 mm | **42.1 mm** | improved |
| Planted paw, animation | 0.052 mm | 0.070 mm | **0.062 mm** | improved |
| Walk support slide | 0.46 mm | 0.64 mm | 0.64 mm | held |
| IK residual | 0.00 mm | 0.00 mm | **0.00 mm** | held |

Read honestly, this trade went the right way on severity and the wrong way on
count. The WORST pinch improved from 0.128 to 0.165 of rest area — closer to the
donor's 0.267 than at any point in this rebuild — while the NUMBER of mildly
flagged faces rose from 2 to 6. Reach headroom and planted-paw accuracy both
improved, because shorter, more-bent limbs give the IK chain more room to extend.
Nothing fails, and the walk is unchanged at 0.64 mm with zero IK residual.

The remaining 6 pinches are the same ring-spacing mechanism found earlier:
compressing a shaft moves its rings closer together, smaller faces score worse on
an area ratio. Setting the belly to the middle of its measured range (0.172 rather
than the 0.160 low end) needed less compression and took the count 7 → 6 while
improving worst area 0.139 → 0.165. Further recovery belongs with the leg-volume
pass, which will re-space those rings anyway.

### Paws — the largest single error, and a capability gap in the builder

Measuring the SEPARATE silhouette runs at each height, rather than the band's
total span (which merges leg and paw into one number and hides both), found this:

| at z 0.02 | reference | model |
| --- | --- | --- |
| front paw | 0.154 → 0.412 (0.258) | 0.146 → 0.233 (**0.087**) |
| rear paw | -0.102 → -0.373 (0.271) | -0.267 → -0.319 (**0.052**) |

Three to five times too short at ground contact. Big paws are a defining feature
of this mascot and the only silhouette event below the belly, so the entire lower
body read as pegs.

Fixing it needed a change to the cage builder, not just to numbers. Limb rings
were circular-only, and a ring is a section perpendicular to its growth
direction — so one radius has to serve two axes. A toe grown forward spends it on
X and Z; a paw grown downward spends it on X and Y. Neither gives a broad FLAT
foot. `grow()` now accepts an optional 5-tuple with separate right/up radii; body
rings have always been elliptical, this gives limbs the same freedom, and every
existing 4-tuple station behaves exactly as before.

Two attempts got there. Growing the toe FORWARD needed a 0.110 x 0.048 ring —
aspect ratio 2.3 — and the eight inherited vertices bunch at the flat ends of an
ellipse that extreme: 12 slivers, then 20 when a taper ring was added to fix them.
Growing DOWNWARD makes the rings horizontal, so one radius spans X and the other
spans fore-aft, and the foot's flatness comes from ring SPACING in Z instead of a
squashed section. Aspect ratio falls to 1.19.

| | reference | this build |
| --- | --- | --- |
| front paw at z 0.02 | 0.154 → 0.412 | 0.144 → 0.400 |
| rear paw at z 0.02 | -0.102 → -0.373 | -0.106 → -0.370 |
| front-view width at z 0.02 | 0.479 | 0.480 |

**The cage is now sliver-free for the first time.** The two long-standing slivers
were the paw soles all along.

### Where the walk was broken, twice, and why

The paw geometry moved 0.13 forward, and making the paw BONE follow it was wrong
both times it was tried.

Lengthening the bone took support slide from 0.64 mm to **15.99 mm**, vertical paw
movement to 5.37 mm and the front IK residual from 0.00 to 1.22 mm. Then moving
the bone's HEAD forward so it sat inside the new paw was worse still — **1 battery
FAIL** and a **10.79 mm** front IK residual — because a bone's head must coincide
with its parent's tail, and shifting it silently disconnected the chain the IK
solver runs along.

The paw is weighted rigidly (1.0) to its bone, so the geometry travels with it
whatever the bone's length. Following the foot buys nothing. Restoring the bones
to exactly their previous positions gave the best motion result of the entire
rebuild:

| Metric | Donor | Before paws | After | |
| --- | --- | --- | --- | --- |
| Walk support slide, worst | 0.46 mm | 0.64 mm | **0.166 mm** | better than donor |
| Rear paw slide | — | 0.64 mm | **0.04 mm** | |
| IK residual, all four | 0.00 mm | 0.00 mm | **0.00 mm** | held |
| Reach headroom FL/FR | 20.0 mm | 22.1 mm | **22.1 mm** | above donor |
| Reach headroom RL/RR | 40.9 mm | 42.1 mm | **42.1 mm** | above donor |
| Planted paw, animation | 0.052 mm | 0.062 mm | 0.105 mm | slightly worse |
| Battery FAIL | 0 | 0 | **0** | held |
| Worst area ratio | 0.267 | 0.165 | **0.165** | held |
| Pinched faces | 0 | 6 | **4** | improved |
| Slivers | — | 2 | **0** | first time clean |
| Weighted IoU | — | 0.849 | **0.866** | |
| Front / side IoU | — | 0.914 / 0.801 | **0.937 / 0.838** | |

Runtime: 191.8 KB GLB, 1,005 verts / 2,006 tris / 35 joints, Khronos clean, zero
control bones in the skin, both clips, floor gap -11.5 mm, 121/121 green.

### The head was 0.131 H too high — the biggest identity error of all

`face_centre_front` in the measured reference model puts the face centre at
h = 0.604. The cage was building its head around the contract's HEAD_Z = 0.735.

Three independent things agree that 0.604 is right:

1. The mane band runs 0.190 to 0.981, centre 0.586. In the reference the face sits
   at the MIDDLE of the mane's disc — which is how a lion's mane actually reads,
   and explains why the reference's forward-most side-view mass is at z 0.515-0.605
   while the model's was at z 0.78.
2. The mane's own inner aperture was ALREADY being built at `fc["h"]` = 0.604 in
   `mane_foundation`. The hood's hole and the head it was meant to frame sat 0.131
   apart. That latent mismatch is the real reason the face kept reading as
   swallowed by the mane and its inner rim as a hard edge — a defect chased twice
   before without finding the cause.
3. With the head at 0.604 the nose lands at y 0.674, which is exactly where the
   reference's side-view front boundary is clipped by the canvas. That check was
   not fitted to; it came out right on its own.

`HEAD_Z` in the contract is unchanged, for the same reason `SPINE_Z` was: the
technical donor reads it and must not move. The cage uses a local `HEAD_CAGE_Z`.

Side IoU 0.838 → **0.875**. But front fell 0.937 → 0.911, because the ears were
offset FROM the head and dropped out of the band they existed to fill — front
h 0.7-0.9 went to 6,826 missing pixels against 2 extra. The reference wants ears at
ABSOLUTE h 0.74-0.86, which is on the upper head and consistent with everything
else (face centre 0.604 + head radius ~0.21 = head top 0.81). Raising them
recovered front to 0.936, and the patch could return to 45 degrees now that
`ring_frame` is orthonormal.

One battery FAIL appeared and was fixed at the source. Pose 08-head-turned failed
at 0.097 area ratio on the lower neck: the neck weight ramp was 0.30 → 0.72 → 1.00
over three rings, which was fine when the neck spanned 0.24 of height but shears
across a third of that distance once compressed to 0.11. Widening the ramp to
0.22 → 0.54 → 0.84 → 1.00 spreads the same rotation over four rings.

### Where the mascot stands now

| Metric | Donor | Now | |
| --- | --- | --- | --- |
| Weighted IoU | — | **0.878** | from 0.590 at the start of the rebuild |
| Front IoU | — | **0.936** | |
| Side IoU | — | **0.875** | |
| Rear IoU | — | 0.825 | carries the documented 18% source-artwork disagreement |
| 3/4 IoU | — | 0.822 | |
| Battery | 0 FAIL | **0 FAIL**, 6 PASS / 6 WARN | best of the rebuild |
| Worst area ratio | 0.267 | 0.165 | |
| Pinched faces | 0 | 4 | |
| Flipped faces | 24 | **16** | better than donor |
| Slivers | — | **0** | |
| Walk support slide | 0.46 mm | **0.166 mm** | better than donor |
| IK residual, all four | 0.00 mm | **0.00 mm** | held |
| Reach headroom | 20.0 / 40.9 mm | **22.1 / 42.1 mm** | better than donor |
| Planted paw, animation | 0.052 mm | 0.105 mm | |
| Feet planted per frame | 3 | 3 | held |

`rig_overlay_check` remains REVIEW, all flagged joints rear-leg or pelvis, from the
documented rear-limb trim. Runtime: 191.6 KB GLB, Khronos clean, both clips, floor
gap -11.5 mm, 29 draw calls, 121/121 homepage checks green.
