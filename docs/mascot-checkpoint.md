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

Still to do before rig transfer: re-run `rig_cage_lion.py` and
`anim_cage_lion.py` on the corrected cage, then the full deformation battery and
the walk, comparing against the donor's baseline (0 pinched faces, 0.267 worst
area ratio, 0.46 mm support slide, 0.052 mm planted paw).

## F. Verdict — **NOT YET READY FOR FINAL RETOPOLOGY**

Weighted IoU 0.590 → 0.822 is real progress and the front view is close. But the
success criterion is that flat clay reads unmistakably as the approved mascot from
all four views, and it does not yet.

Remaining visual defects, in priority order:

1. **Side view is the weakest at 0.739**, with 17.2% still missing. The mane reads
   as a bonnet with a hard vertical front lip rather than a teardrop sweeping up
   over the crown and back.
2. **The mane's inner rim is a visible hard edge** where it should tuck into the
   face.
3. **The tail is too thin and sits too high** — blue in the side overlay along its
   whole length.
4. **No face.** The head is still a smooth skull: no eye sockets, no brow plane,
   no cheek transition, no mouth. That is Gate 15 and is deliberately not started,
   but it is a large part of why this does not yet read as *the* mascot.
5. Rear view carries 16.8% extra, most of it the documented 18% front/rear
   mane-width disagreement in the source artwork.
