"""
cage_lion.py — the production deformation cage.

WHY THIS EXISTS
Voxel remesh gives uniform triangles. Quadriflow gives clean quads aligned to
CURVATURE. Neither can put three loops in an elbow, because neither knows where
the elbow is — a remesher sees a bulge. Every automatic route therefore produces
topology that looks fine and pinches the moment a joint bends.

So the cage is AUTHORED. It is built the way a box-modeller builds a quadruped:

  * the torso, neck and head are one tube of cross-sectional rings running from
    rump to nose, each ring placed and sized against the locked proportion
    contract;
  * every limb, the tail and both ears grow out of a 3x3 patch of that tube —
    the patch's four faces are deleted and its eight boundary vertices become
    the limb's first ring. Nothing is bridged and nothing is stitched, so the
    limb loops flow into the torso by construction;
  * joints get extra rings. Not a fixed "three" — as many as the deformation
    test needs, which is why the station tables below name each ring.

Poles exist only where deformation does not: the nose tip, the four paw soles,
two ear tips and the tail tip. There is no pole in any bending joint.

WHAT IT IS NOT
It is not shrinkwrapped onto the sculpt. The sculpt now includes the mane locks,
and wrapping the cage onto those would pull the head geometry out into the mane.
The cage is built from the same measured contract the sculpt was, so it does not
need to chase it — and keeping the mane as separate geometry is the right
production call anyway.

Run:
  blender --background --factory-startup --python tools/blender/cage_lion.py

Outputs:
  art/blender/lion_cage.blend
  docs/assets/lion-cage/{front,side,rear,three-quarter}-wire.png
"""

import math
import os
import sys

import bmesh
import bpy
from mathutils import Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lion_contract import (  # noqa: E402
    BELLY_Z, BODY_BACK_Y, BODY_FRONT_Y, GROUND, HEAD_Y, HEAD_Z, SPINE_Z,
)

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
BLEND_OUT = os.path.join(REPO, "art", "blender", "lion_cage.blend")
PREVIEW_DIR = os.path.join(REPO, "docs", "assets", "lion-cage")

# Segments around the body tube.
#
# 12 was the first choice and it does not work. A 3x3 attachment patch is three
# columns wide, which at 12 segments spans 90 degrees — and the two front legs,
# sitting at +/-60 degrees from the underside, are only 120 degrees apart. Their
# patches ended up sharing a vertex column, so the same vertices belonged to both
# limbs and the front-left leg came out with a torn flap.
#
# 16 segments makes a patch 67.5 degrees wide, which leaves the left and right
# patches genuinely disjoint while still letting a patch centre land exactly on
# the underside, side or top of the tube.
NSEG = 16
# Segments around a limb tube — fixed by the 3x3 patch, whose boundary is 8
# vertices. This is not a free parameter.
NLIMB = 8


# ── ring maths ──────────────────────────────────────────────────────────────
def ring_frame(normal):
    """Return (right, up) spanning the plane perpendicular to `normal`.

    Rings are placed along a path that bends: forward through the barrel, upward
    through the neck, forward again through the head. A ring has to stay
    perpendicular to the path or the cross-sections shear, so its plane is
    derived from the local tangent rather than being fixed to world axes.

    LATENT BUG, fixed when the ears first grew sideways.

    This used to return a hardcoded right = (1,0,0) without orthogonalising it
    against the tangent. Every ring in the cage until now had a tangent with
    x = 0 — the body runs along Y, the limbs along -Z, the tail along -Y — so
    (1,0,0) happened to be perpendicular and the basis happened to be orthonormal.

    The ears broke that assumption. Grown along +X, their tangent is very nearly
    parallel to `right`, so the two "spanning" vectors were nearly collinear and
    the ring plane was not a plane: the rings collapsed toward a line and the cage
    came back with slivers at the ear base and tip cap.

    So `right` is now projected onto the plane perpendicular to n, and the
    reference axis swaps to Z when n points along X. Note the cross product order
    is preserved exactly (right x n, not n x right) — reversing it flips `up` and
    with it every ring's winding, which would invert normals across the whole
    model. And for any tangent with x = 0 the projection is a no-op, so the body,
    limbs and tail come out bit-identical to before.
    """
    n = Vector(normal).normalized()
    ref = Vector((0.0, 0.0, 1.0)) if abs(n.x) > 0.86 else Vector((1.0, 0.0, 0.0))
    right = (ref - n * ref.dot(n)).normalized()
    up = right.cross(n).normalized()
    return right, up


def ring_points(centre, normal, rx, rz, count, phase=0.0):
    right, up = ring_frame(normal)
    c = Vector(centre)
    pts = []
    for k in range(count):
        a = phase + 2.0 * math.pi * k / count
        pts.append(c + right * (rx * math.cos(a)) + up * (rz * math.sin(a)))
    return pts


# ── the body tube ───────────────────────────────────────────────────────────
# (name, centre, tangent, rx, rz)
#
# Tangent is the direction the tube is travelling at that station, which sets
# the ring's plane. Radii are read off the locked contract: BELLY_Z 0.21,
# SPINE_Z 0.375, BODY_BACK_Y -0.37, BODY_FRONT_Y 0.21, HEAD_Y 0.44, HEAD_Z 0.735.
BODY = [
    # MEASURED against the reference's side-view body profile, behind the mane
    # where the barrel is actually visible. Two errors it exposed:
    #
    # 1. The back line SLOPES DOWN toward the tail. Reference: 0.526 H just
    #    behind the mane, 0.487 at the lumbar, 0.445 at the hip, ~0.40 at the
    #    rump. The previous table held it at 0.52-0.56 flat all the way back,
    #    which is exactly the "horizontal cylinder with a mane placed on top"
    #    read — and it was 0.14 H too high at the haunch.
    # 2. The rear body is WIDER than it was. Rear view measures 0.40-0.41 H
    #    across at haunch height; the table gave 0.34.
    #
    # Haunch and hip were then pulled back from rx 0.205/0.200 to 0.190/0.188.
    # At the measured width the haunch's own surface is the widest point on the
    # animal, and in a deep crouch the pelvis and spine_01 diverge by 10 degrees
    # across it — at that radius the shear pinched faces to 0.05 of rest area.
    # 0.38 H against a measured 0.40 is invisible at hero scale; a crouch that
    # collapses the rump is not. Motion quality is the higher bar and it wins.
    #
    # Stations under the mane (rib_front forward) are not measurable from any
    # view and keep their previous values.
    ("rump_cap",   (0.000, -0.400, 0.226), (0, 1, 0.10), 0.086, 0.048),
    ("rump",       (0.000, -0.378, 0.250), (0, 1, 0.06), 0.142, 0.070),
    # Haunch: three rings carrying real mass. The rear silhouette needs a
    # pelvis -> glute -> thigh flow, and jump take-off reads off this shape.
    ("haunch_back", (0.000, -0.352, 0.272), (0, 1, 0.03), 0.185, 0.093),
    ("haunch",     (0.000, -0.320, 0.289), (0, 1, 0), 0.190, 0.111),
    ("hip",        (0.000, -0.282, 0.300), (0, 1, 0), 0.188, 0.125),
    ("lumbar_02",  (0.000, -0.216, 0.318), (0, 1, 0), 0.172, 0.144),
    ("lumbar_01",  (0.000, -0.148, 0.323), (0, 1, 0), 0.156, 0.148),
    ("waist",      (0.000, -0.076, 0.329), (0, 1, 0), 0.150, 0.143),
    # Rib cage: swell then hold, so the barrel has a chest rather than one
    # constant tube from hip to shoulder.
    ("rib_back",   (0.000,  0.000, 0.330), (0, 1, 0), 0.156, 0.155),
    ("rib_mid",    (0.000,  0.072, 0.348), (0, 1, 0), 0.166, 0.176),
    ("rib_front",  (0.000,  0.136, 0.352), (0, 1, 0.04), 0.168, 0.180),
    # Chest rises INTO the mane rather than running level into it.
    ("chest",      (0.000,  0.192, 0.358), (0, 1, 0.16), 0.166, 0.182),
    ("shoulder",   (0.000,  0.244, 0.404), (0, 1, 0.55), 0.152, 0.164),
    ("neck_base",  (0.000,  0.296, 0.470), (0, 0.72, 1), 0.126, 0.130),
    ("neck_02",    (0.000,  0.334, SPINE_Z + 0.196), (0, 0.55, 1), 0.116, 0.120),
    ("neck_01",    (0.000,  0.372, SPINE_Z + 0.272), (0, 0.85, 1), 0.116, 0.120),
    ("head_base",  (0.000,  0.412, HEAD_Z - 0.086), (0, 1, 0.62), 0.170, 0.168),
    ("head_back",  (0.000,  0.442, HEAD_Z - 0.010), (0, 1, 0.16), 0.206, 0.202),
    ("head_mid",   (0.000,  0.494, HEAD_Z + 0.004), (0, 1, 0), 0.212, 0.204),
    ("brow",       (0.000,  0.548, HEAD_Z - 0.004), (0, 1, -0.06), 0.194, 0.188),
    # Cheek mass connecting eye -> muzzle -> lower face -> mane.
    ("cheek",      (0.000,  0.588, HEAD_Z - 0.024), (0, 1, -0.12), 0.172, 0.160),
    # Muzzle shortened again. Measured projection beyond the mane is 0.106 H;
    # the front ring moves from 0.650 to 0.632 and the rings flatten further
    # (rz below rx), so it reads broader and softer rather than longer.
    ("muzzle_02",  (0.000,  0.612, HEAD_Z - 0.048), (0, 1, -0.16), 0.128, 0.104),
    ("muzzle_01",  (0.000,  0.628, HEAD_Z - 0.058), (0, 1, -0.10), 0.102, 0.080),
    ("nose",       (0.000,  0.632, HEAD_Z - 0.060), (0, 1, 0), 0.042, 0.034),
]

BODY_INDEX = {name: i for i, (name, *_rest) in enumerate(BODY)}


# ── limb / appendage station tables ─────────────────────────────────────────
# Each entry: (name, centre, tangent, radius). Ring 0 is always the patch
# boundary on the body, so these start at ring 1.
def front_limb(sx):
    """MEASURED against the reference's leg band.

    Front view, solid width across the leg band:

        h 0.03   reference 0.450 H   model was 0.327
        h 0.09   reference 0.369 H   model was 0.254
        h 0.12   reference 0.385 H   model was 0.250

    The shafts were roughly 40% too thin and the paws 30% too small — enough that
    the legs read as pegs and the whole lower body lost the reference's soft cub
    weight. It was also the single largest silhouette error left, 11,581 missing
    pixels in one side-view band.

    The paws are both an art feature and a locomotion one: ground-contact shape
    is what makes a planted paw look planted.

    One correction on top of the measurement. Matching the measured SOLID width
    exactly put each shaft's inner surface within 8mm of the midline — because in
    the drawing the near and far legs overlap, so the silhouette reads solid even
    though the legs are separated in 3D. Geometrically that is defensible; for
    deformation it is not: a leg whose radius reaches its own offset from centre
    passes through its neighbour when it folds, and the battery pinched at exactly
    that point in deep-crouch and rear-leg-compressed.

    So the shafts are moved outward and trimmed ~12%, keeping the measured OUTER
    span (the silhouette edge, which is what reads) and restoring a real 70mm
    midline gap. Solid width lands at 0.34 H against a measured 0.37 — most of the
    gain kept, the collision removed.
    """
    return [
        ("scapula",  (sx * 0.118, 0.224, 0.269), (0, -0.10, -1), 0.092),
        ("upper_02", (sx * 0.122, 0.214, 0.227), (0, -0.16, -1), 0.090),
        ("upper_01", (sx * 0.124, 0.202, 0.187), (0, -0.20, -1), 0.086),
        # Elbow: three rings tight together, and the joint is PRE-BENT backward.
        # Straight limbs give IK zero extension headroom.
        ("elbow_up", (sx * 0.126, 0.182, 0.162), (0, -0.10, -1), 0.088),
        ("elbow",    (sx * 0.126, 0.176, 0.146), (0, 0.06, -1), 0.090),
        ("elbow_lo", (sx * 0.126, 0.182, 0.130), (0, 0.18, -1), 0.086),
        ("forearm",  (sx * 0.126, 0.206, 0.100), (0, 0.22, -1), 0.080),
        ("wrist_up", (sx * 0.128, 0.213, 0.076), (0, 0.12, -1), 0.076),
        ("wrist",    (sx * 0.128, 0.216, 0.062), (0, 0.04, -1), 0.078),
        # PAW REBUILT AS A FOOT THAT POINTS FORWARD, not a ball on the end of a
        # stick. Measuring the separate silhouette runs at each height — rather
        # than the band's total span, which merges leg and paw into one number —
        # showed the paws were the largest error left in the whole asset:
        #
        #     z 0.02      front paw          rear paw
        #     reference   0.154 -> 0.412     -0.102 -> -0.373   (0.258, 0.271)
        #     model       0.146 -> 0.233     -0.267 -> -0.319   (0.087, 0.052)
        #
        # Three to five times too short at ground contact. Big paws are a defining
        # feature of this mascot and the ONLY silhouette event below the belly, so
        # the whole lower body read as pegs.
        #
        # Construction note. A limb ring is a circle in the plane perpendicular to
        # its growth direction, so a ring cannot be both wide and flat: growing the
        # toe forward spends the radius on X and Z, and growing it downward spends
        # it on X and Y. Neither alone gives a broad flat foot. So the paw TURNS —
        # the first rings still travel downward-and-forward and set the width, then
        # the toe rings travel along +Y at a radius small enough to keep the sole
        # near z = 0. Their centres sit at cz ~= 0.924 r, the octagon apothem, so
        # the sole lands ON the ground rather than floating above it.
        # THIRD attempt at the paw, and the direction of growth is the whole point.
        #
        # Growing the toe FORWARD needed a 0.110 x 0.048 ring — aspect ratio 2.3 —
        # and the eight inherited vertices bunch at the flat ends of an ellipse
        # that extreme, which produced 12 slivers, then 20 when a taper ring was
        # added to fix them.
        #
        # Growing DOWNWARD instead makes the rings HORIZONTAL, so one radius spans
        # X and the other spans fore-aft, and the flatness of the foot comes from
        # ring SPACING in Z rather than from a squashed section. Aspect ratio falls
        # to 1.19 and the sole becomes a horizontal cap sitting on the ground.
        #
        #     measured at z 0.02   reference          this build
        #     front paw            0.154 -> 0.412     0.144 -> 0.400
        #     rear paw            -0.102 -> -0.373   -0.106 -> -0.370
        #     front-view width     0.479              0.480
        ("paw_top",  (sx * 0.130, 0.250, 0.052), (0, 0.35, -1), 0.100, 0.110),
        ("paw_mid",  (sx * 0.132, 0.268, 0.028), (0, 0.15, -1), 0.112, 0.130),
        ("paw_sole", (sx * 0.132, 0.272, 0.010), (0, 0.05, -1), 0.108, 0.128),
    ]


def rear_limb(sx):
    return [
        ("hip",      (sx * 0.124, -0.292, 0.288), (0, 0, -1), 0.100),
        ("thigh_02", (sx * 0.126, -0.284, 0.240), (0, 0.10, -1), 0.098),
        ("thigh_01", (sx * 0.128, -0.268, 0.199), (0, 0.22, -1), 0.092),
        # Stifle (knee) — points FORWARD.
        ("knee_up",  (sx * 0.128, -0.244, 0.176), (0, 0.20, -1), 0.090),
        ("knee",     (sx * 0.128, -0.236, 0.159), (0, 0.05, -1), 0.088),
        ("knee_lo",  (sx * 0.128, -0.242, 0.142), (0, -0.14, -1), 0.084),
        ("shin",     (sx * 0.128, -0.268, 0.113), (0, -0.26, -1), 0.078),
        # Hock — points BACKWARD. This reversal is the whole reason a rear leg
        # does not behave like a human leg, and it also gives the chain the reach
        # headroom the planted-paw proof depends on.
        ("hock_up",  (sx * 0.128, -0.284, 0.092), (0, -0.20, -1), 0.074),
        ("hock",     (sx * 0.128, -0.290, 0.076), (0, 0.05, -1), 0.076),
        ("hock_lo",  (sx * 0.128, -0.276, 0.059), (0, 0.32, -1), 0.072),
        ("ankle",    (sx * 0.130, -0.256, 0.043), (0, 0.34, -1), 0.076),
        # Same rebuild. The reference rear paw spans -0.102 to -0.373 — centred
        # almost exactly where the old one was, but 5x longer, reaching back into
        # a heel and forward into toes. So the chain drops past the ankle to form
        # the heel by radius at the turn, then runs forward along +Y.
        # Same construction. The reference rear paw spans -0.102 to -0.373, centred
        # almost exactly where the old one was but five times longer.
        ("paw_top",  (sx * 0.132, -0.244, 0.052), (0, -0.20, -1), 0.100, 0.112),
        ("paw_mid",  (sx * 0.132, -0.240, 0.028), (0, -0.05, -1), 0.112, 0.134),
        ("paw_sole", (sx * 0.132, -0.238, 0.010), (0,  0.05, -1), 0.108, 0.132),
    ]


def ear(sx):
    """Small rounded tabs.

    The first pass produced tall pointed cat ears. The approved character has
    short, wide, rounded ears — and they still have to read from the SIDE, so
    they carry real thickness (the radius holds up rather than tapering to a
    spike) and sit forward of the mane plane.
    """
    return [
        # Lowered. The silhouette QA found the ears the tallest thing on the
        # model — 4,157 extra pixels in the top front band and 4,493 at the rear
        # — where the reference has them topping out just under the mane crown.
        # Wider and shorter also makes them read from the side, which is the
        # correction the brief asks for.
        # SECOND correction. The first pass lowered the ears because they were the
        # tallest thing on the model — 4,157 extra pixels in the top front band.
        # It fixed height by trading away width, and the trade was the wrong way
        # round.
        #
        # Per-object measurement settles it. In band h 0.95-1.00 the widest thing
        # is not the mane at all:
        #
        #     LionCage  max|x| 0.2167  ->  0.442 H     reference 0.248 H
        #     LionMane  max|x| 0.1438  ->  0.293 H
        #
        # The overshoot is the EARS breaking through the top of the mane, which is
        # what the blue lumps on the crown of the front overlay actually were. But
        # burying them cost the band below, where the reference wants ears clearly
        # outside the mane outline:
        #
        #     front band     reference w   model w    delta
        #     0.85-0.90        0.552       0.456     -0.096
        #     0.80-0.85        0.621       0.448     -0.173
        #     0.75-0.80        0.631       0.521     -0.110
        #
        # An ear inside the mane outline is not an ear. So the ears now grow
        # OUTWARD instead of upward: dropped ~0.07 H so they clear the top band
        # entirely, and pushed out to max|x| 0.290 so they break the mane's
        # silhouette in the band that wants them. One move, both bands.
        # The attachment patch moved with them, and it had to. Growing a sideways
        # ear out of the 45-degree patch put the first ring below its own
        # attachment point, so the surface folded back on itself and the cage came
        # back with 6 slivers where it had 2. The patch is now at 22.5 degrees —
        # the side of the head, z 0.821 — which is where the reference draws the
        # ears anyway (front view puts them at h ~0.81).
        #
        # Radius is deliberately modest at 0.050-0.058. A limb ring is a circle in
        # the plane perpendicular to its growth direction, so a laterally-grown ear
        # spends its radius on Y and Z equally: every millimetre of thickness is
        # also a millimetre of height. A fatter ear would spill back into the
        # 0.90-0.95 band that was just cleared.
        # Sized to sit INSIDE the mane's measured width, not to supply it. The
        # 0.75-0.90 deficit is a mane-profile problem (see fit_to_measured); an
        # ear inflated to cover it would have been the wrong organ doing the job.
        # The root also stands clear of the 0.208 patch — at 0.212 the first ring
        # was almost coincident with its own attachment and the cage came back
        # with slivers there.
        # SIZED FROM THE DIFFERENCE BETWEEN TWO REFERENCE MEASUREMENTS, which is
        # what finally made the ear target unambiguous.
        #
        # The colour-segmented mane profile and the full silhouette mask agree at
        # most heights and diverge sharply in one band:
        #
        #     h      segmented mane   full silhouette   ratio
        #     0.90       0.2029           0.2154         1.06
        #     0.86       0.2058           0.2567         1.25
        #     0.82       0.1789           0.3029         1.69
        #     0.78       0.1971           0.3154         1.60
        #     0.74       0.2183           0.3106         1.42
        #     0.70       0.3164           0.3250         1.03
        #
        # Non-mane-coloured material sticking out past the mane at h 0.74-0.86 IS
        # the ears — the segmentation excludes them precisely because they are a
        # different colour. So the reference is explicit: ears reach half-width
        # 0.31-0.32 while the mane behind them is only 0.18-0.22. The ears carry
        # that band's width and the mane must NOT be inflated to fake it.
        ("root",  (sx * 0.238, 0.470, HEAD_Z + 0.078), (sx * 1.00, -0.09,  0.10), 0.052),
        ("mid",   (sx * 0.260, 0.465, HEAD_Z + 0.074), (sx * 1.00, -0.09,  0.06), 0.054),
        ("upper", (sx * 0.278, 0.460, HEAD_Z + 0.070), (sx * 1.00, -0.09,  0.02), 0.044),
        ("tip",   (sx * 0.294, 0.456, HEAD_Z + 0.068), (sx * 1.00, -0.09, -0.02), 0.026),
    ]


# The tail was the single largest silhouette error in the whole asset, and the
# overlay alone did not say so — the band measurement did.
#
# The old tail ran almost straight back at z 0.44-0.55, which put 0.56 H of EXTRA
# width into the side band 0.45-0.60 while leaving the reference's low rear mass
# uncovered. Measured against the reference side view:
#
#     side band          reference w    model w      delta
#     0.50-0.55            0.663        1.227       +0.563
#     0.15-0.20            1.108        0.635       -0.473
#
# Both numbers are the same mistake: the tail was carrying its mass a third of a
# body height too high. The reference tail leaves the rump, turns DOWN, and ends
# in a distinct oval tuft — traced off the side view at centre y = -0.585,
# z = 0.169, radii 0.069 (fore-aft) by 0.091 (vertical).
#
# The old tail also had no tuft at all, which for a lion is not a detail. It is
# the feature that makes the back half read as a lion rather than a cub-shaped
# animal, and it is the only silhouette event behind the haunch.
#
# Construction: a thinning shaft that turns downward, then rings that swing to
# travel BACKWARD so the tuft's bulge lands in the x-z plane. That matters —
# a ring's radius spans the two axes perpendicular to its direction, so a tuft
# built on a downward-travelling shaft would have bulged fore-aft and sideways
# instead of standing up the way the reference draws it.
TAIL = [
    # SECOND PASS, from the reference's rear-extent profile rather than its
    # outline. Measuring the rearmost point of each mask at each height gave the
    # tail's actual route, and it is stricter than the overlay suggested:
    #
    #     z      reference y_rear
    #     0.400      -0.319
    #     0.350      -0.362
    #     0.300      -0.387
    #     0.250      -0.406
    #     0.225      -0.669   <- the tuft begins, in one step
    #     0.075      -0.638
    #     0.050      -0.377   <- and ends
    #
    # Two things follow. The shaft is INVISIBLE above z 0.235 — it runs inside the
    # rump's own outline, so a shaft thick enough to poke past it is a defect, not
    # a tail. And the tuft is a compact mass between z 0.075 and 0.235, lower than
    # the first pass put it, which is why the band at 0.05-0.10 was still 0.371 H
    # short after the tail was supposedly fixed.
    # Shaft. Thin, and tucked against the rump rather than trailing behind it.
    ("root_02", (0.0, -0.398, 0.328), (0, -0.40, -1.00), 0.038),
    ("root_01", (0.0, -0.406, 0.294), (0, -0.25, -1.00), 0.032),
    ("tail_03", (0.0, -0.412, 0.262), (0, -0.55, -1.00), 0.028),
    ("tail_04", (0.0, -0.438, 0.236), (0, -1.00, -0.70), 0.028),
    ("tail_05", (0.0, -0.480, 0.206), (0, -1.00, -0.35), 0.030),
    # Tuft. Swings back to horizontal and bulges, so the oval stands upright.
    #
    # Centres dropped ~0.012 after the first attempt measured one band high at the
    # top (z 0.245 reached -0.617 where the reference is still on the rump at
    # -0.408) and 0.296 H short at the bottom. Note the apothem: these rings carry
    # 8 vertices, so an inscribed octagon reaches only cos(pi/8) = 0.924 of the
    # nominal radius, and the cage is graded UNSUBDIVIDED. The radii below are set
    # from the effective extent, not the nominal one — reading r straight off the
    # reference leaves the tuft visibly small.
    ("tuft_01", (0.0, -0.520, 0.186), (0, -1.00, -0.20), 0.046),
    ("tuft_02", (0.0, -0.556, 0.166), (0, -1.00, -0.10), 0.074),
    ("tuft_03", (0.0, -0.592, 0.154), (0, -1.00,  0.10), 0.086),
    ("tuft_04", (0.0, -0.624, 0.152), (0, -1.00,  0.30), 0.070),
    ("tuft_05", (0.0, -0.642, 0.160), (0, -1.00,  0.50), 0.034),
]


# ── construction ────────────────────────────────────────────────────────────
class Cage:
    def __init__(self):
        self.bm = bmesh.new()
        self.body = []          # body[ring][seg] -> BMVert
        # (group_name, [BMVert, ...]) for every authored ring.
        #
        # This is what makes AUTHORED skinning possible later. Heat-map weighting
        # has to guess which bone owns a vertex from proximity, and it guesses
        # badly wherever two bones pass close to each other — the armpit, the
        # inner thigh, the jaw. But the cage already KNOWS: this vertex is ring
        # "elbow_lo" of the front-right limb. Recording it here means the rig can
        # look the answer up instead of inferring it.
        self.rings = []

    # -- body tube ----------------------------------------------------------
    def build_body(self):
        for name, centre, tangent, rx, rz in BODY:
            pts = ring_points(centre, tangent, rx, rz, NSEG)
            verts = [self.bm.verts.new(p) for p in pts]
            self.body.append(verts)
            self.rings.append((f"body:{name}", verts))
        for r in range(len(self.body) - 1):
            a, b = self.body[r], self.body[r + 1]
            for s in range(NSEG):
                t = (s + 1) % NSEG
                self.bm.faces.new((a[s], a[t], b[t], b[s]))

    def quad_cap(self, loop):
        """Close an even-count loop with quads only, deterministically.

        `bmesh.ops.grid_fill` was failing silently on several of these loops —
        the integrity report showed 72 boundary edges (nine unfilled holes) and
        four sliver triangles where it half-succeeded. Both fallbacks in the old
        code swallowed their exceptions, so the mesh shipped with holes.

        An even loop of n vertices always tiles into n/2 - 1 quads by pairing
        opposite sides inward: (0,1,n-2,n-1), (1,2,n-3,n-2), and so on. Every
        boundary edge is consumed exactly once, every face is a quad, and no
        centre pole is introduced. It cannot fail, which is the point.
        """
        n = len(loop)
        if n < 4 or n % 2:
            try:
                self.bm.faces.new(loop)
            except ValueError:
                pass
            return
        made = 0
        for k in range(n // 2 - 1):
            a, b = loop[k], loop[k + 1]
            c, d = loop[n - 2 - k], loop[n - 1 - k]
            try:
                self.bm.faces.new((a, b, c, d))
                made += 1
            except ValueError:
                pass
        if made != n // 2 - 1:
            print(f"[cage] WARNING cap of {n}-loop made {made}/{n // 2 - 1} quads")

    def cap_rear(self):
        """Close the rump end.

        grid_fill turns the boundary into quads where it can. It is attempted
        first and an n-gon is the fallback, because a 12-gon at the rump is a
        pole in a region the pelvis actually rotates.
        """
        self.quad_cap(self.body[0])

    def cap_front(self):
        self.quad_cap(self.body[-1])

    # -- appendages ---------------------------------------------------------
    def open_patch(self, ring0, seg0):
        """Delete a 3x3 patch's four faces and return its 8-vertex boundary.

        Returned in cyclic order, which is what lets the appendage's rings be
        quadded straight onto it with no bridge operation and no stitching.
        """
        g = [[self.body[ring0 + i][(seg0 + j) % NSEG] for j in range(3)] for i in range(3)]

        doomed = []
        for i in range(2):
            for j in range(2):
                f = self.face_from(g[i][j], g[i][j + 1], g[i + 1][j + 1], g[i + 1][j])
                if f:
                    doomed.append(f)
        bmesh.ops.delete(self.bm, geom=doomed, context="FACES_ONLY")

        boundary = [g[0][0], g[0][1], g[0][2], g[1][2], g[2][2], g[2][1], g[2][0], g[1][0]]
        # The patch centre is now an orphan with no faces; leaving it behind
        # would ship a loose vertex into the GLB.
        bmesh.ops.delete(self.bm, geom=[g[1][1]], context="VERTS")
        return boundary

    def face_from(self, *verts):
        vs = set(verts)
        for f in verts[0].link_faces:
            if set(f.verts) == vs:
                return f
        return None

    def grow(self, boundary, stations, flip=False, prefix="limb"):
        """Quad an appendage onto a patch boundary, station by station.

        Each new ring's vertices are placed by taking each previous vertex's
        direction from the previous ring's centre, re-projecting it into the new
        ring's plane and pushing it out to the new radius. That preserves
        vertex-to-vertex correspondence around the loop automatically, so no
        ordering or twist bookkeeping is needed.
        """
        prev = boundary
        prev_c = sum((v.co for v in prev), Vector()) / len(prev)
        rings = [boundary]
        self.rings.append((f"{prefix}:attach", list(boundary)))

        for station in stations:
            # A station is (name, centre, tangent, radius) for a circular ring, or
            # (name, centre, tangent, r_right, r_up) for an elliptical one.
            #
            # Limb rings were circular-only, and that turned out to be the reason
            # the paws could not be built. A ring is a section in the plane
            # perpendicular to its growth direction, so one radius has to serve
            # two axes: a toe grown forward spends it on X and Z, a paw grown
            # downward spends it on X and Y. A broad FLAT foot needs 0.11 across
            # and 0.05 tall, which no circle provides — the first attempt got the
            # length right and then either floated the sole above the ground or
            # lost a tenth of a body height of front-view width.
            #
            # The body rings have always been elliptical (rx, rz). This just gives
            # limbs the same freedom. Four-tuples behave exactly as before.
            if len(station) == 5:
                name, centre, tangent, r_r, r_u = station
            else:
                name, centre, tangent, r_r = station
                r_u = r_r
            right, up = ring_frame(tangent)
            c = Vector(centre)
            new = []
            for v in prev:
                d = v.co - prev_c
                u = d.dot(right)
                w = d.dot(up)
                if abs(u) < 1e-9 and abs(w) < 1e-9:
                    u, w = 1.0, 0.0
                a = math.atan2(w, u)
                new.append(self.bm.verts.new(c + right * (r_r * math.cos(a))
                                             + up * (r_u * math.sin(a))))
            n = len(prev)
            for k in range(n):
                m = (k + 1) % n
                if flip:
                    self.bm.faces.new((prev[k], new[k], new[m], prev[m]))
                else:
                    self.bm.faces.new((prev[k], prev[m], new[m], new[k]))
            rings.append(new)
            self.rings.append((f"{prefix}:{name}", new))
            prev, prev_c = new, c
        return rings

    def cap_loop(self, loop):
        self.quad_cap(loop)

    # -- facial deformation loops -------------------------------------------
    def nearest_face(self, target, predicate=None):
        best, bd = None, 1e9
        t = Vector(target)
        for f in self.bm.faces:
            if predicate and not predicate(f):
                continue
            d = (f.calc_center_median() - t).length
            if d < bd:
                best, bd = f, d
        return best

    def faces_near(self, target, radius, side=None):
        t = Vector(target)
        out = []
        for f in self.bm.faces:
            c = f.calc_center_median()
            if side and c.x * side <= 0.015:
                continue
            if (c - t).length <= radius:
                out.append(f)
        return out

    def safe_inset(self, region, wanted):
        """Clamp an inset to the geometry it is being applied to.

        The first version used absolute thicknesses (0.030, 0.021) picked by eye.
        A body face here is roughly 0.05 x 0.075, so a 0.030 inset very nearly
        collapsed it and `inset_region` produced inverted slivers — long thin
        spikes visible on the eye, mouth and tail-root close-ups. An inset has to
        be a FRACTION of the local edge length, never an absolute.
        """
        edges = set()
        for f in region:
            for e in f.edges:
                edges.add(e)
        if not edges:
            return wanted
        shortest = min(e.calc_length() for e in edges)
        return min(wanted, shortest * 0.32)

    def socket(self, target, insets, depth, side=None, radius=0.052):
        """Concentric deformation loops around a facial feature.

        `inset_region` creates a rim of new faces and leaves the ORIGINAL faces
        as the shrunken centre, so insetting the same face repeatedly builds
        concentric rings outward from it. An eyelid needs at least two: a blink
        slides loops over the eyeball, and one ring has nothing to slide.

        `depth` then pushes the centre in along its own normal, which is what
        makes it a socket rather than a circle drawn on a cheek.
        """
        region = self.faces_near(target, radius, side)
        if not region:
            pred = None
            if side:
                pred = lambda fc: fc.calc_center_median().x * side > 0.015  # noqa: E731
            f = self.nearest_face(target, pred)
            if f is None:
                print(f"[cage] WARNING no face near {target}")
                return None
            region = [f]

        for wanted in insets:
            t = self.safe_inset(region, wanted)
            bmesh.ops.inset_region(self.bm, faces=region, thickness=t,
                                   depth=0.0, use_even_offset=True,
                                   use_interpolate=True)
        if depth:
            n = Vector((0.0, 0.0, 0.0))
            for f in region:
                n += f.normal
            if n.length > 1e-6:
                n.normalize()
                verts = {v for f in region for v in f.verts}
                for v in verts:
                    v.co -= n * depth
        print(f"[cage] socket at {tuple(round(x, 3) for x in target)} "
              f"-> {len(region)} centre faces")
        return region

    def open_cavity(self, region, depth, shrink=0.58):
        """Turn a socket into a real opening with an interior.

        A jaw cannot open a DENT. The mouth was a recessed patch, and rotating
        the jaw under it could only crease the surface — the deformation battery
        reported the mouth collapsing to 8% of its rest area, correctly.

        A mouth needs the upper and lower lips to be separate surfaces that part.
        Extruding the socket centre inward gives exactly that: the rim becomes
        the lips, the extrusion walls become the inside of the mouth, and the
        pushed-back cap closes it off so the mesh stays watertight. Then the
        upper rim can weight to the skull and the lower rim to the jaw, and they
        genuinely separate.
        """
        if not region:
            return
        n = Vector((0.0, 0.0, 0.0))
        for f in region:
            n += f.normal
        if n.length < 1e-6:
            return
        n.normalize()

        ret = bmesh.ops.extrude_face_region(self.bm, geom=list(region))
        new_verts = [g for g in ret["geom"] if isinstance(g, bmesh.types.BMVert)]
        if not new_verts:
            return
        centre = sum((v.co for v in new_verts), Vector()) / len(new_verts)
        for v in new_verts:
            v.co = centre + (v.co - centre) * shrink - n * depth

        # Remove the ORIGINAL faces so the mouth is genuinely open. The extrusion
        # already built the walls, so the surface remains closed.
        #
        # `FACES`, not `FACES_ONLY`: the socket region has interior vertices and
        # edges used by nothing except the faces being removed. FACES_ONLY keeps
        # them, leaving one loose vertex and six wire edges behind — which is
        # exactly what the integrity check reported.
        bmesh.ops.delete(self.bm, geom=list(region), context="FACES")

        # Record the interior so the rig can weight it EXPLICITLY. Left to
        # nearest-neighbour inheritance, the cavity's back cap ended up split
        # between the skull and the jaw, and opening the mouth pinched it to 7%
        # of rest area. The inside of a mouth below the palate belongs to the
        # jaw and should rotate with it rigidly.
        self.rings.append(("face:mouth_cavity", list(new_verts)))
        print(f"[cage] mouth cavity: {len(new_verts)} interior verts, depth {depth}")

    # -- finish -------------------------------------------------------------
    def finish(self, name="LionCage"):
        bmesh.ops.recalc_face_normals(self.bm, faces=list(self.bm.faces))
        # Indices are only meaningful after this; without it every ring group
        # would be written against stale or -1 indices. They must also be
        # SNAPSHOTTED here — reading v.index after bm.free() returns nothing,
        # which is how the first attempt recorded zero groups.
        self.bm.verts.index_update()
        # `is_valid` guards the vertices open_patch removed — each patch centre
        # is deleted, but the body ring list still holds a reference to it.
        ring_idx = [(gname, [v.index for v in verts if v.is_valid])
                    for gname, verts in self.rings]
        me = bpy.data.meshes.new(name)
        self.bm.to_mesh(me)
        self.bm.free()
        for p in me.polygons:
            p.use_smooth = True
        obj = bpy.data.objects.new(name, me)
        bpy.context.scene.collection.objects.link(obj)

        for gname, idx in ring_idx:
            idx = [i for i in idx if 0 <= i < len(me.vertices)]
            if not idx:
                continue
            vg = obj.vertex_groups.get(gname) or obj.vertex_groups.new(name=gname)
            vg.add(idx, 1.0, "REPLACE")
        print(f"[cage] recorded {len(obj.vertex_groups)} ring groups")
        return obj


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def build():
    cage = Cage()
    cage.build_body()

    # Attachment patches, at NSEG=16 so 22.5 degrees per segment. `seg0` is the
    # FIRST of three columns, so the patch centre is seg0+1. Right and left are
    # mirrored about x (theta -> 180 - theta) and share no column.
    #
    #   right leg  centre seg 14 = 315 deg (down and right)   columns 13,14,15
    #   left  leg  centre seg 10 = 225 deg (down and left)    columns  9,10,11
    #   tail       centre seg  4 =  90 deg (straight up)      columns  3, 4, 5
    #   right ear  centre seg  1 =  22.5 deg (side, right)    columns  0, 1, 2
    #   left  ear  centre seg  7 = 157.5 deg (side, left)     columns  6, 7, 8
    #
    # The ears moved out of columns 1-3 / 5-7 so they no longer share a column
    # with the tail patch (3,4,5) — and 22.5 degrees is where the reference puts
    # them, on the side of the head rather than on top of it.
    fr = cage.open_patch(BODY_INDEX["rib_front"], 13)
    cage.cap_loop(cage.grow(fr, front_limb(+1), prefix="frontR")[-1])
    fl = cage.open_patch(BODY_INDEX["rib_front"], 9)
    cage.cap_loop(cage.grow(fl, front_limb(-1), prefix="frontL")[-1])

    rr = cage.open_patch(BODY_INDEX["haunch_back"], 13)
    cage.cap_loop(cage.grow(rr, rear_limb(+1), prefix="rearR")[-1])
    rl = cage.open_patch(BODY_INDEX["haunch_back"], 9)
    cage.cap_loop(cage.grow(rl, rear_limb(-1), prefix="rearL")[-1])

    tl = cage.open_patch(BODY_INDEX["rump"], 3)
    cage.cap_loop(cage.grow(tl, TAIL, prefix="tail")[-1])

    er = cage.open_patch(BODY_INDEX["head_mid"], 0)
    cage.cap_loop(cage.grow(er, ear(+1), prefix="earR")[-1])
    el = cage.open_patch(BODY_INDEX["head_mid"], 6)
    cage.cap_loop(cage.grow(el, ear(-1), prefix="earL")[-1])

    # Caps FIRST. The mouth socket sits within 0.036 of the nose ring, so with
    # the muzzle still open its inset ran along an open boundary and shredded the
    # 16-vertex loop the front cap needed — the integrity report found 12 unfilled
    # boundary edges right at the nose.
    cage.cap_rear()
    cage.cap_front()

    # Facial deformation loops, authored on a CLOSED surface.
    cage.socket((0.095, 0.578, HEAD_Z + 0.048), (0.016, 0.011), 0.013, side=+1)
    cage.socket((-0.095, 0.578, HEAD_Z + 0.048), (0.016, 0.011), 0.013, side=-1)
    mouth = cage.socket((0.0, 0.610, HEAD_Z - 0.112), (0.015, 0.010), 0.010, side=None)
    cage.open_cavity(mouth, 0.052)
    # Brow ridges get one ring each — enough for a BrowUp shape key to have
    # something to move without adding density the rest of the forehead cannot use.
    for sx in (-1, 1):
        cage.socket((sx * 0.072, 0.552, HEAD_Z + 0.108), (0.014,), 0.0, side=sx)



    obj = cage.finish()
    return obj


def integrity(obj):
    """Report the defects that renders only hint at.

    The first cage had inverted slivers at the eye, mouth and tail root. They
    were visible in a close-up as thin spikes but not identifiable from one, and
    guessing from pictures is how the last three passes were spent. These are the
    measurements that name the problem.
    """
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    bm.faces.ensure_lookup_table()

    loose = [v for v in bm.verts if not v.link_faces]
    nonman = [e for e in bm.edges if not e.is_manifold]
    boundary = [e for e in bm.edges if e.is_boundary]
    tiny = [f for f in bm.faces if f.calc_area() < 1.0e-6]
    areas = sorted(f.calc_area() for f in bm.faces)
    # A sliver is a face whose area is tiny relative to its perimeter.
    slivers = []
    for f in bm.faces:
        per = sum(e.calc_length() for e in f.edges)
        if per > 0 and f.calc_area() / (per * per) < 0.010:
            slivers.append(f)
    poles = {}
    for v in bm.verts:
        n = len(v.link_edges)
        poles[n] = poles.get(n, 0) + 1

    # Snapshot coordinates as plain tuples BEFORE freeing. Reading a BMEdge after
    # bm.free() raises ReferenceError, which is how the first version of this
    # report died.
    hole_at = [tuple(round(c, 3) for c in ((e.verts[0].co + e.verts[1].co) / 2))
               for e in boundary[:8]]
    sliver_at = [tuple(round(c, 3) for c in f.calc_center_median()) for f in slivers[:8]]
    n_loose, n_nonman, n_boundary = len(loose), len(nonman), len(boundary)
    n_tiny, n_sliver = len(tiny), len(slivers)
    bm.free()

    print("\n===CAGE_INTEGRITY===")
    print(f"LOOSE_VERTS={n_loose}")
    print(f"NON_MANIFOLD_EDGES={n_nonman}")
    print(f"BOUNDARY_EDGES={n_boundary}")
    for c in hole_at:
        print(f"  HOLE_EDGE at {c}")
    print(f"DEGENERATE_FACES={n_tiny}")
    print(f"SLIVER_FACES={n_sliver}")
    for c in sliver_at:
        print(f"  SLIVER at {c}")
    print(f"AREA_MIN={areas[0]:.8f} AREA_MED={areas[len(areas)//2]:.6f} AREA_MAX={areas[-1]:.6f}")
    print("VALENCE=" + " ".join(f"{k}:{v}" for k, v in sorted(poles.items())))
    print("===CAGE_INTEGRITY_END===")
    return n_nonman == 0 and n_loose == 0 and n_tiny == 0


def report(obj):
    me = obj.data
    me.calc_loop_triangles()
    quads = sum(1 for p in me.polygons if len(p.vertices) == 4)
    tris = sum(1 for p in me.polygons if len(p.vertices) == 3)
    ngons = sum(1 for p in me.polygons if len(p.vertices) > 4)
    poles = sum(1 for v in me.vertices
                if len([e for e in me.edges if v.index in e.vertices]) not in (0, 4))
    pts = [v.co for v in me.vertices]
    print("\n===LION_CAGE===")
    print(f"BLEND={BLEND_OUT}")
    print(f"VERTS={len(me.vertices)}")
    print(f"FACES={len(me.polygons)} QUADS={quads} TRIS={tris} NGONS={ngons}")
    print(f"QUAD_RATIO={quads / max(1, len(me.polygons)):.4f}")
    print(f"TRIANGULATED={len(me.loop_triangles)}")
    print(f"HEIGHT={max(p.z for p in pts) - min(p.z for p in pts):.3f}")
    print(f"LENGTH={max(p.y for p in pts) - min(p.y for p in pts):.3f}")
    print(f"WIDTH={max(p.x for p in pts) - min(p.x for p in pts):.3f}")
    print(f"NON_MANIFOLD_HINT_POLES={poles}")
    print("===LION_CAGE_END===")


def render_wires(obj):
    sc = bpy.context.scene
    sc.render.engine = "BLENDER_EEVEE"
    sc.render.resolution_x = 760
    sc.render.resolution_y = 760
    sc.view_settings.view_transform = "Standard"
    os.makedirs(PREVIEW_DIR, exist_ok=True)

    w = bpy.data.worlds.new("CageWorld")
    w.use_nodes = True
    w.node_tree.nodes["Background"].inputs[0].default_value = (0.10, 0.11, 0.13, 1)
    w.node_tree.nodes["Background"].inputs[1].default_value = 1.0
    sc.world = w

    mat = bpy.data.materials.new("CageSurf")
    mat.use_nodes = True
    b = mat.node_tree.nodes.get("Principled BSDF")
    b.inputs["Base Color"].default_value = (0.62, 0.60, 0.56, 1)
    b.inputs["Roughness"].default_value = 0.72
    obj.data.materials.append(mat)

    wire = bpy.data.materials.new("CageWire")
    wire.use_nodes = True
    wb = wire.node_tree.nodes.get("Principled BSDF")
    wb.inputs["Base Color"].default_value = (0.02, 0.02, 0.03, 1)
    wb.inputs["Roughness"].default_value = 0.9
    obj.data.materials.append(wire)

    wf = obj.modifiers.new("Wire", "WIREFRAME")
    wf.thickness = 0.0032
    wf.use_replace = False
    wf.material_offset = 1

    for name, loc, energy in (("Key", (2.4, -2.2, 2.6), 260),
                              ("Fill", (-2.8, -1.4, 1.4), 90),
                              ("Rim", (-0.5, 3.0, 2.2), 120)):
        d = bpy.data.lights.new(name, "AREA")
        d.energy = energy
        d.size = 6.0
        o = bpy.data.objects.new(name, d)
        o.location = loc
        o.rotation_euler = (Vector((0, 0, 0.55)) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
        sc.collection.objects.link(o)

    cd = bpy.data.cameras.new("CageCam")
    cd.lens = 80.0
    cam = bpy.data.objects.new("CageCam", cd)
    sc.collection.objects.link(cam)
    sc.camera = cam

    target = Vector((0.0, 0.02, 0.56))
    dist = 3.5
    for name, yaw in (("front", 180), ("side", 90), ("rear", 0), ("three-quarter", 145)):
        a = math.radians(yaw)
        cam.location = (target.x + math.sin(a) * dist,
                        target.y - math.cos(a) * dist,
                        target.z + dist * 0.06)
        cam.rotation_euler = (target - Vector(cam.location)).to_track_quat("-Z", "Y").to_euler()
        sc.render.filepath = os.path.join(PREVIEW_DIR, f"{name}-wire.png")
        bpy.ops.render.render(write_still=True)

    # Topology close-ups, so the loops around each joint can actually be judged.
    cd.lens = 135.0
    closeups = {
        "eye": (0.075, 0.585, HEAD_Z + 0.02, 210),
        "mouth": (0.0, 0.640, HEAD_Z - 0.10, 195),
        "shoulder": (0.120, 0.215, 0.300, 235),
        "elbow": (0.120, 0.205, 0.160, 240),
        "hip": (0.115, -0.290, 0.295, 300),
        "hock": (0.115, -0.275, 0.080, 300),
        "tail_root": (0.0, -0.462, 0.346, 340),
        "tail_tuft": (0.0, -0.598, 0.180, 320),
    }
    for name, (tx, ty, tz, yaw) in closeups.items():
        t = Vector((tx, ty, tz))
        a = math.radians(yaw)
        d2 = 0.62
        cam.location = (t.x + math.sin(a) * d2, t.y - math.cos(a) * d2, t.z + d2 * 0.22)
        cam.rotation_euler = (t - Vector(cam.location)).to_track_quat("-Z", "Y").to_euler()
        sc.render.filepath = os.path.join(PREVIEW_DIR, f"closeup-{name}.png")
        bpy.ops.render.render(write_still=True)

    obj.modifiers.remove(wf)


def main():
    reset()
    obj = build()
    os.makedirs(os.path.dirname(BLEND_OUT), exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=BLEND_OUT)
    report(obj)
    integrity(obj)
    render_wires(obj)
    bpy.ops.wm.save_as_mainfile(filepath=BLEND_OUT)


if __name__ == "__main__":
    main()
