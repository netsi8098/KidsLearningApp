# Production mascot — visual checkpoint

Donor untouched at tag `lion_current_backup`. Runtime, skeleton naming, skin map,
IK, walk and QA all preserved.

## B. Reference comparison — the headline number

Weighted IoU (front .35 · side .30 · 3/4 .25 · rear .10):

| stage | front | side | 3/4 | rear | **weighted** |
|---|---|---|---|---|---|
| donor cage, no mane | 0.600 | 0.518 | 0.618 | 0.700 | **0.590** |
| + mane foundation | 0.811 | 0.703 | 0.782 | 0.781 | 0.768 |
| + smoothed profiles | 0.853 | 0.697 | 0.802 | 0.783 | 0.786 |
| + body back-line & haunch | 0.855 | 0.723 | 0.797 | 0.786 | 0.794 |
| **+ legs, paws, ears** | **0.892** | **0.739** | **0.827** | **0.814** | **0.822** |

Mane envelope matches the measurement exactly: width 0.7077 H, depth 0.5577 H,
height 0.7910 H — all +0.0%.

## C. Character corrections, each from a measurement

**Mane macro shape.** Four attempts. A capped tube enclosed the head (a cap is a
surface — the face does not project through it). A tube with an aperture became a
lampshade collar. A radial fan became a megaphone, because I had guessed where
along its depth a mane is widest. The fourth works: rings shaped **by the front
silhouette** rather than as ellipses, because the reference mane has a width
profile an ellipse averages away —

    h 0.62  0.708 H  <- widest      h 0.86  0.412
    h 0.66  0.688                   h 0.94  0.206
    h 0.74  0.437  <- sharp waist   h 0.98  0.037  <- crown tip

That waist and the crown lobe above it are most of the character. Level 2 clumps
are placed in the mane's own azimuth/flow frame, where the parameterisation
already follows the flow, so a bump becomes a lock instead of a dent.

**Chest rise and back line.** The reference's back line *slopes down* — 0.526 H
just behind the mane, 0.487 at the lumbar, 0.445 at the hip. The cage held
0.52–0.56 flat all the way back and was **0.14 H too high at the haunch**. That
was precisely the "horizontal cylinder with a mane placed on top" read. Chest and
shoulder now rise into the mane (0.402 / 0.438 against 0.395 / 0.427).

**Haunch.** Rear view measures 0.40–0.41 H across at haunch height; the cage gave
0.34. Three rings now carry the pelvis → glute → thigh flow.

**Muzzle.** Front ring pulled from 0.650 to 0.632 and flattened further (rz below
rx), so it reads broader and softer rather than longer. Measured projection beyond
the mane is 0.106 H.

**Legs and paws — the largest single error.** Front-view solid width across the
leg band measured 0.37–0.45 H against the model's 0.25–0.33: the shafts were ~40%
too thin and the paws ~30% too small, and it accounted for 11,581 missing pixels
in one side-view band alone. Corrected throughout, paws broadened with a
flattened sole.

**Ears.** They were the tallest thing on the model — 4,157 extra silhouette pixels
in the top front band, 4,493 at the rear — where the reference tops them just
under the mane crown. Lowered and widened, which also makes them read from the
side.

## D. Rig-overlay check — **PASS**

72 joint points ray-cast in six directions against the new surface:

* **64 contained**, **0 escaped**
* 8 at the surface **by design** — `root` is a transform handle under the belly,
  and a terminal bone's tail *is* the surface (a paw's tail is the sole, the
  jaw's is the chin, the tail's is the tip)
* tightest contained clearance 6.0 mm

### One required rig adjustment, documented not worked around

The ear bone ran to `HEAD_Z + 0.238`, which the corrected ear geometry no longer
reaches, and its head sat **0.6 mm** under the skin. Both ends moved: tip to
`+0.202` to follow the new ear, root inward to `x = 0.132` so the bone is enclosed
rather than lying on the surface. No other joint moved, and none was moved to suit
a sculpt bulge.

## E. Production-retopo plan

**The surface IS the production topology.** This is a deliberate departure from
the brief's step 7, and it is worth stating plainly.

The brief assumed sculpt-then-retopologise. But the donor's cage was already an
authored cross-section surface — 100% quads, watertight, no pole in any bending
joint, 0 pinched faces across twelve extreme poses. Measurement showed its
*dimensions* were the identity problem, not its topology. So the ring stations
were corrected in place and the ring **names** left unchanged, which means:

* the authored ring→bone skin map in `lion_skeleton.py` still applies verbatim;
* the joint contract holds (verified above);
* the walk, IK and metrics transfer without retargeting.

Current: 961 verts, 959 faces, 100% quads, watertight, 0 loose, 0 non-manifold,
**0 slivers** (down from 4). The mane is separate geometry, as it should be.

If the remaining defects below cannot be resolved in this topology, the fallback
is the brief's original route — sculpt freely, then retopologise against it. That
will be reported, not assumed.

### Rig and walk on the corrected cage — measured, not assumed

STEP 9 and STEP 10 have now been run on the corrected cage. Every figure is
measured, against the donor baseline the brief set as the bar.

| Metric | Donor baseline | Corrected cage | Verdict |
| --- | --- | --- | --- |
| Deformation battery FAIL | 0 | **0** | held |
| Battery PASS / WARN | 5 / 7 | 5 / 7 | held |
| Pinched faces | 0 | **4** | regressed |
| Worst area ratio | 0.267 | **0.128** | regressed |
| Flipped faces | 24 | 24 | held |
| Reach headroom FL/FR | 20.0 mm | 20.0 mm | held |
| Reach headroom RL/RR | 40.9 mm | 40.9 mm | held |
| Planted paw, animation amplitude | 0.052 mm | **0.069 mm** | held |
| Walk support slide, worst | 0.46 mm | **0.62 mm** | held |
| Walk vertical paw movement | 0.15 mm | 0.17 mm | held |
| IK residual, all four paws | 0.00 mm | 0.00 mm | held |
| Feet planted, every frame | 3 | 3 | held |
| Quad ratio / boundary edges | 1.0 / 0 | 1.0 / 0 | held |

Honest reading: the motion system transferred. Support slide rose 35% in relative
terms but 0.62 mm on a 1.30 m character is 0.05% of body height — below the
threshold at which a foot reads as sliding, and the IK residual is still exactly
zero, so the solver is not fighting the pose. The four-beat lateral gait keeps
three feet down at every sampled phase.

The regression that is real is deformation *degree*: 4 pinched faces at extreme
poses where the donor had none, and a worst area ratio of 0.128 against 0.267.
Nothing fails, but the corrected cage is less forgiving at the extremes than the
donor was.

Two causes were isolated and one remains. Weight retuning on the attach rings
took the count from 16 to 13, which proved weights were not the cause. The pinch
coordinates clustered at x ≈ ±0.198 — the *midline side* of the limbs — which
identified the real cause: the reference-driven cross-sections made the legs thick
enough that their inner surfaces reached the centre line, so a folding leg passed
through its neighbour. Moving the leg stations outward and trimming the radii ~12%
cleared both FAILs and took the count to 5; trimming the haunch and hip took it to
4. The remaining 4 are the same mechanism at the widest crouch.

That was a deliberate trade, recorded in `cage_lion.py`: the haunch is now 0.38 H
against a measured 0.40 H. Two hundredths of body height is invisible at hero
scale; a crouch that collapses the rump is not. Motion quality is the higher bar
and it wins. Weighted IoU moved 0.822 → 0.817 as a result, which is the cost.

Runtime confirmed: 189.2 KB GLB, 961 verts / 1,918 tris / 35 joints, Khronos
validation clean, zero control bones in the skin, both clips (`Idle`, `Walk`)
present, floor gap −11.5 mm, 29 draw calls, and the 121-check homepage QA suite
still fully green.

## F. Verdict — **CLOSE, BUT THE FACE IS STILL MISSING**

Weighted silhouette IoU has gone 0.590 → 0.822 → **0.878** (registered; 0.869
unregistered), with front 0.936 and side 0.875, and the motion system is now
BETTER than the technical donor on three metrics rather than merely preserved.

Every correction in this pass came from a measurement, and four of them overturned
a diagnosis made by reading the overlay:

1. **The top-band overshoot was the ears, not the mane crown.** Per-object
   measurement: `LionCage` 0.442 H against `LionMane` 0.293 H in band 0.95-1.00.
2. **The 0.75-0.90 deficit was the ears again**, and only the divergence between
   the colour-segmented mane and the full silhouette (1.69x at h 0.82) could show
   it — material outside the mane that is not mane-coloured.
3. **The blue band on the back and the red band under the belly were one fault.**
   Both edges were wrong by the same amount in the same direction, so the barrel
   was the right size in the wrong place: 0.045 H too high on legs 20% too long.
4. **The head was 0.131 H too high.** `face_centre_front` = 0.604 against a
   contract HEAD_Z of 0.735. The mane's inner aperture was already being built at
   0.604, so the hood's hole and the head it framed were 0.131 apart — the actual
   cause of the face-swallowed-by-mane defect that had been chased twice.

Two latent bugs surfaced, both in the builder rather than the data. `ring_frame()`
never orthogonalised `right` against the tangent; every existing ring had tangent
x = 0 so it happened to be perpendicular, and the first sideways-growing ear
collapsed its rings toward a line. And limb rings were circular-only, which made a
broad flat paw impossible to build at all — the paws were 3-5x too short at ground
contact, the largest single error in the asset.

### What still blocks final retopology

1. **No face.** The head is a smooth skull: no eye sockets, no brow plane, no
   cheek break, no mouth. That is Gate 15, deliberately not started, and it is now
   the single largest reason this does not read as *the* mascot. Everything below
   it is minor by comparison.
2. **The mane has no chin lobe.** Its front rim is a flat wall at y 0.566 where the
   reference recedes to 0.44-0.48 around the face and then juts forward below it.
   Silhouette-neutral (the union still matches) but it is why the mane reads as a
   hood rather than a mane.
3. **Tail tuft sits slightly high**, and its true rear extent is unknowable — the
   side reference is clipped at the canvas edge there.
4. **Rear view carries 17.6% extra**, most of it the documented 18% front/rear
   mane-width disagreement in the source artwork. Front is the authority; this is
   not a defect to chase.
5. **4 pinched faces and a REVIEW rig-overlay verdict**, both traced to the
   documented 12% rear-limb trim. Recoverable with the leg-volume work, which will
   re-space those rings anyway.
