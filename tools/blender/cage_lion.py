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

import json
import math
import os
import sys

import bmesh
import bpy
from mathutils import Vector
from mathutils.bvhtree import BVHTree

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


# DOCUMENTED RIG ADJUSTMENT #4 — the head was 0.131 H too high.
#
# `face_centre_front` in the measured reference model puts the face centre at
# h = 0.604. The cage was building its head around the contract's HEAD_Z = 0.735.
#
# Two independent measurements agree that 0.604 is right. The mane band runs
# 0.190 to 0.981, centre 0.586 — so in the reference the face sits at the MIDDLE
# of the mane's disc, which is how a lion's mane actually reads, and is why the
# reference's forward-most side-view mass is at z 0.515-0.605 rather than at the
# model's z 0.78. And the mane's own inner aperture was ALREADY built at
# fc["h"] = 0.604 in mane_foundation, so the hood's hole and the head it was meant
# to frame sat 0.131 apart. That mismatch is the real reason the face kept reading
# as swallowed by the mane, and its inner rim as a hard edge.
#
# With the head at 0.604 the nose lands at y 0.674, which is exactly where the
# reference's side-view front boundary is clipped by the canvas — an independent
# check that came out right without being fitted to.
#
# HEAD_Z itself is NOT changed: the contract is shared with the technical donor,
# which must not move. Same reasoning as the spine positions in lion_skeleton.
HEAD_CAGE_Z = 0.604

# ── the face, measured ──────────────────────────────────────────────────────
#
# GATE 15. Until 2026-09-03 the five facial socket targets were hand-picked
# literals, and three of them were wrong in a way nothing reported:
#
#     eye    76 mm BEHIND the surface it is meant to be a socket in
#     brow   48 mm too narrow and 76 mm too low
#     mouth  41 mm behind
#
# (millimetres on the shipped 1.30 m character). They survived because
# `socket()` searches a 52 mm sphere and then falls back to `nearest_face()`,
# which always succeeds — so an off-surface target builds a socket SOMEWHERE
# instead of erroring. The eye's 50 mm error fitted inside the 52 mm sphere
# with 2 mm to spare. That fallback now warns, and `build()` refuses to
# continue if any socket used it.
#
# x and z come from `face_model.json` (tools/cad/measure_face.py). y cannot:
# a front elevation has no depth. So y is ray-cast off the tube AT BUILD TIME,
# which means the target is on the surface by construction and cannot drift
# when a ring moves.
#
# Everything else here — how many concentric loops, how deep, how wide a patch
# — is a DEFORMATION decision, not a reference measurement, and is named as
# such. An eyelid needs two loops because a blink slides loops over an eyeball
# and one loop has nothing to slide.
FACE_JSON = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "art", "blender", "references", "turnaround-views", "face_model.json")

# (feature, insets, depth, radius, mirrored)
#
# depth > 0 pushes the patch IN along its own normal (a socket).
# depth < 0 pushes it OUT (the nose pad is a raised pad, not a dent).
# RADIUS IS NOT A FREE PARAMETER, and the old values were calibrated against
# the wrong thing. `radius` is a sphere around the target, so it only selects a
# sensible patch when the target is ON the surface. With the mouth target 41 mm
# behind the skin, 0.052 grazed the muzzle and caught 6 faces; put on the
# surface, the same 0.052 catches 21 — a mouth a third of the face wide — and
# the nose pad's 0.062 catches 15 that overlap it. Insetting overlapping regions
# produced 12 sliver faces where the cage had had none.
#
# Sized against the measurement instead: the mouth line measures 0.1325 wide
# and the nose pad 0.1511, and a radius near half the feature's half-width
# lands 4-8 faces, which is what two concentric insets can subdivide without
# collapsing an edge.
FACE_SOCKETS = [
    # Two loops: a blink needs one to slide and one to hold the rim.
    ("eye",      (0.016, 0.011), 0.013, 0.052, True),
    # One loop. Enough for BrowUp_L/R to have something to move without adding
    # density the rest of the forehead cannot use.
    ("brow",     (0.014,),       0.000, 0.044, True),
    # Raised, not recessed — the pad reads as a form in the reference, so depth
    # is negative and pushes it out along its own normal.
    ("nose_pad", (0.018, 0.012), -0.009, 0.038, False),
    # Two loops, then `open_cavity`: a jaw cannot open a dent.
    ("mouth",    (0.015, 0.010), 0.010, 0.038, False),
]

# NOSTRILS ARE MEASURED BUT NOT BUILT, deliberately.
#
# `face_model.json` puts them at x ±0.0410, h 0.5710, inside the nose pad's own
# span, and `face_placement.py` confirms normal.y +0.997 — dead-on the muzzle
# front. So the numbers are there when a detail pass wants them.
#
# They are not cage geometry. This cage carries loops WHERE SOMETHING MOVES:
# that is the rule that decided how many rings an elbow gets and why the mouth
# is a cavity rather than a dent. A nostril has no shape key and no bone; it
# never deforms. Insetting one at this density subdivides faces the nose pad
# has already subdivided, which is precisely where 8 of the 12 slivers were.
# Nostrils belong in the texture and normal map, like the whiskers.

# Ring groups a facial socket must not consume — the ear's OWN rings.
#
# `earR:attach` is deliberately NOT in this list, and the distinction is the
# whole point. `attach` is the eight boundary vertices left behind when the
# ear's 3x3 patch was opened, so it is part of the BODY TUBE: those verts sit
# on the `head_mid` ring, which circles the entire head. Keeping out any face
# that touches an `earR:*` vert therefore keeps out the upper head all the way
# across the midline — measured at z 0.7618, every sample from x 0.000 to
# 0.130 shares a vert with an attach ring. The first version of this list did
# exactly that and the brow could not be placed anywhere at all.
#
# What must not be consumed is the ear proper: root, mid, upper, tip. Insetting
# a face that belongs to those would break the loop flow that makes the ear
# deform with the skull instead of tearing from it.
FACE_KEEP_OUT = ("earR:root", "earR:mid", "earR:upper", "earR:tip",
                 "earL:root", "earL:mid", "earL:upper", "earL:tip")


# Filled by `build()` with the target each facial socket actually resolved to,
# after the ray-cast supplied y and after any keep-out slide. Downstream
# consumers (the close-up cameras, and later the shape-key pass) read this
# instead of re-deriving or re-hardcoding a position that can move.
FACE_TARGETS = {}


def face_measurement():
    """Measured (x, z) per facial feature, in cage units.

    Midline features carry x = 0 by measurement, not by assumption: the nose
    pad lands at -0.0031 of the axis the pupil pair defines and the mouth line
    at -0.0040, both inside a third of a pixel. Rounding them to the midline is
    a statement that the character is symmetric, which it is; the measurement
    is what proves it rather than what assumes it.
    """
    fm = json.load(open(FACE_JSON))
    # THE EYE SOCKET BELONGS ON THE ALMOND, NOT THE PUPIL.
    #
    # It was placed at the pupil, which is 0.0136 inboard and 0.0113 below the
    # almond's centre — the pupil is deliberately off-centre inside the
    # opening, so a loop centred on it is not centred on the eye. The socket
    # exists for `Blink_L/R` to slide loops over the eyeball, and what a lid
    # slides across is the OPENING. `face_lion.py` already builds the eye
    # forms on the almond centre; this makes the loop agree with them.
    al = fm["eye"]["almond"]
    almond_x = (abs(al["left"]["x_H"]) + abs(al["right"]["x_H"])) / 2.0
    almond_h = (al["left"]["h"] + al["right"]["h"]) / 2.0
    out = {
        "eye": (almond_x, almond_h),
        "mouth": (0.0, fm["mouth_line"]["h"]),
        "nose_pad": (0.0, fm["nose_pad"]["h"]),
    }
    if fm.get("brow"):
        out["brow"] = (abs(fm["brow"]["x_H_abs"]), fm["brow"]["h"])
    if fm.get("nostril"):
        out["nostril"] = (abs(fm["nostril"]["x_H_abs"]), fm["nostril"]["h"])
    return out


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
    ("neck_base",  (0.000,  0.296, 0.438), (0, 0.72, 1), 0.126, 0.130),
    ("neck_02",    (0.000,  0.334, 0.470), (0, 0.55, 1), 0.116, 0.120),
    ("neck_01",    (0.000,  0.372, 0.496), (0, 0.85, 1), 0.116, 0.120),
    ("head_base",  (0.000,  0.412, HEAD_CAGE_Z - 0.086), (0, 1, 0.62), 0.170, 0.168),
    ("head_back",  (0.000,  0.442, HEAD_CAGE_Z - 0.010), (0, 1, 0.16), 0.206, 0.202),
    ("head_mid",   (0.000,  0.494, HEAD_CAGE_Z + 0.004), (0, 1, 0), 0.212, 0.204),
    ("brow",       (0.000,  0.548, HEAD_CAGE_Z - 0.004), (0, 1, -0.06), 0.194, 0.188),
    # Cheek mass connecting eye -> muzzle -> lower face -> mane.
    ("cheek",      (0.000,  0.588, HEAD_CAGE_Z - 0.024), (0, 1, -0.12), 0.172, 0.160),
    # Muzzle shortened again. Measured projection beyond the mane is 0.106 H;
    # the front ring moves from 0.650 to 0.632 and the rings flatten further
    # (rz below rx), so it reads broader and softer rather than longer.
    ("muzzle_02",  (0.000,  0.612, HEAD_CAGE_Z - 0.048), (0, 1, -0.16), 0.128, 0.104),
    ("muzzle_01",  (0.000,  0.628, HEAD_CAGE_Z - 0.058), (0, 1, -0.10), 0.102, 0.080),
    ("nose",       (0.000,  0.632, HEAD_CAGE_Z - 0.060), (0, 1, 0), 0.042, 0.034),
]

BODY_INDEX = {name: i for i, (name, *_rest) in enumerate(BODY)}


# ── limb / appendage station tables ─────────────────────────────────────────
# Each entry: (name, centre, tangent, radius). Ring 0 is always the patch
# boundary on the body, so these start at ring 1.
# How hard to crease the sole rim, 0 (round) to 1 (a boundary curve).
#
# EFFECTIVELY BINARY at the shipped subdivision level. Blender spends a crease
# over the available levels, so at L2 a crease of 0.6 and one of 1.0 produce
# renders that are identical to the pixel — measured, not assumed. The knob
# stays because the level is itself a parameter.
#
# What it buys, at the final ring geometry, is not silhouette: creased and
# uncreased differ by 0.0002 of weighted IoU. It is the GROUND-CONTACT PATCH.
# Uncreased, the flat part of the pad is 0.181 long on the front paw; creased
# it is 0.252, the full length of the ring. A planted paw reading as planted is
# the whole reason this asset has big feet.
SOLE_CREASE = float(os.environ.get("LION_SOLE_CREASE", "1.0"))


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
        ("paw_top",  (sx * 0.130, 0.252, 0.052), (0, 0.20, -1), 0.100, 0.126),
        ("paw_mid",  (sx * 0.132, 0.268, 0.028), (0, 0.15, -1), 0.112, 0.130),
        # THE SOLE RING IS HORIZONTAL AND LOW, and both halves matter.
        #
        # A ring is a section in the plane perpendicular to its tangent, so a
        # tangent of (0, 0.05, -1) tilts the sole by 2.9 degrees — which does
        # not sound like much until it is measured on the built cage: the
        # sole's eight vertices spanned z 0.0037 to 0.0164, a 12.7 mm wedge
        # with the toe edge high and the heel low. The shipped paw then touched
        # the ground on a 31 mm patch at the heel and sloped up from there,
        # which is the "rounded sole" the silhouette had been reporting for
        # three passes as a length deficit at the lowest rows.
        #
        # Creasing the rim (see `crease_loop`) stops Catmull-Clark rounding the
        # cap away, but a creased tilted ring is a flat RAMP. The tangent has
        # to be straight down for the pad to be a pad.
        #
        # And the height had to come down with it. The old station sat at
        # z 0.010 and only reached the ground because the uncreased cap
        # bulged below its own ring plane; a creased pad sits exactly where the
        # ring is, so 0.010 would have floated the whole foot 10 mm. 0.004 puts
        # the pad on the floor while staying above it — the clip gate rejects
        # anything below z 0 — and the reference's sole is full length from its
        # lowest measurable row upward.
        ("paw_rim",  (sx * 0.132, 0.270, 0.012), (0, 0, -1), 0.116, 0.136),
        ("paw_sole", (sx * 0.132, 0.270, 0.004), (0, 0, -1), 0.110, 0.128),
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
        # ELLIPTICAL FROM THE HOCK DOWN. The rear foot is a metatarsus: long,
        # low and level. The reference measures 0.256 of fore-aft length at
        # z 0.060 and 0.206 at 0.080, where circular rings of radius 0.072 and
        # 0.076 can only give 0.144 and 0.152 — half the length missing, which
        # is why a correctly sized pad underneath read as a saucer on the end of
        # a stick instead of as a foot.
        ("hock_lo",  (sx * 0.128, -0.276, 0.061), (0, 0.32, -1), 0.072, 0.114),
        ("ankle",    (sx * 0.130, -0.266, 0.047), (0, 0.10, -1), 0.080, 0.144),
        # Same rebuild. The reference rear paw spans -0.102 to -0.373 — centred
        # almost exactly where the old one was, but 5x longer, reaching back into
        # a heel and forward into toes. So the chain drops past the ankle to form
        # the heel by radius at the turn, then runs forward along +Y.
        # The reference rear paw spans -0.102 to -0.373.
        #
        # ALL FOUR RINGS LEVEL, and that replaces a fold. The old chain climbed
        # from the ankle at z 0.043 to a paw_top at 0.052 and then dropped to
        # the sole, which put a crease across the foot and left the heel missing
        # above the pad: measured, the rear foot was 0.158 long at z 0.028
        # against the reference's 0.275, while the pad below it was full length.
        # A stack of level rings is a foot. A pad hung off a fold is a plate,
        # and that is exactly how it rendered.
        ("paw_top",  (sx * 0.132, -0.248, 0.036), (0, 0, -1), 0.106, 0.143),
        ("paw_mid",  (sx * 0.132, -0.244, 0.024), (0, 0, -1), 0.112, 0.136),
        ("paw_rim",  (sx * 0.132, -0.240, 0.014), (0, 0, -1), 0.116, 0.136),
        ("paw_sole", (sx * 0.132, -0.238, 0.004), (0, 0, -1), 0.110, 0.129),
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
        # THIRD ear pass, forced by the head drop. The ears were offset FROM the
        # head, so lowering the head 0.131 carried them out of the very band they
        # existed to fill — front h 0.7-0.9 went to 6,826 missing pixels against 2
        # extra, and front IoU fell 0.937 -> 0.911.
        #
        # The reference wants them at ABSOLUTE h 0.74-0.86, which is on the upper
        # head and consistent with everything else: face centre 0.604, head radius
        # ~0.21, so the head top is 0.81. The offsets relative to HEAD_CAGE_Z are
        # therefore LARGER than before, not smaller. The patch also returns to 45
        # degrees, which is only safe now that ring_frame is orthonormal.
        # THIRD note: TWO ATTEMPTED CORRECTIONS, BOTH REVERTED.
        #
        # The stations below are the ORIGINAL ones. I changed them twice and
        # made it worse twice, and the record is more useful than the diff.
        #
        # Attempt 1 dropped them 0.048 and pushed out 12%, on a conclusion that
        # the ears sat too high. That conclusion came from comparing a per-band
        # MAX model width against a band-CENTRE reference width, which are not
        # comparable quantities. Attempt 2 made them taller instead, taking the
        # vertical span from radius.
        #
        # Measured max-against-max, which is what `band_spans` does, summing
        # absolute error across the four bands an ear touches:
        #
        #     front band   reference   ORIGINAL   dropped   taller
        #     0.85-0.90      0.552      -0.006    -0.140    +0.088
        #     0.80-0.85      0.621      -0.058    -0.006    +0.038
        #     0.75-0.80      0.631      -0.069    +0.000    +0.019
        #     0.70-0.75      0.650      +0.015    -0.025    -0.063
        #     sum |dw|                   0.148     0.171     0.208
        #     weighted IoU               0.8519    0.8495    0.8499
        #
        # The original is the best of the three on both metrics. The reference's
        # ears contribute width across h 0.70-0.90, about 0.20 H, and these
        # stations span 0.056 H — so an ear this short CANNOT satisfy four
        # bands, and every placement trades one for another. The residual
        # -0.058 and -0.069 at h 0.75-0.85 is that shortfall, and it is smaller
        # than anything either attempt introduced.
        #
        # Fixing it properly means a taller ear that does not fold at its
        # attachment: attempt 2 put the root at z 0.750, below the patch at
        # 0.821, and the cage came back with 2 slivers — the same fault the
        # second note above records at 6. That needs the PATCH moved down the
        # side of the head, not just the stations, and it is a separate change.
        ("root",  (sx * 0.196, 0.478, HEAD_CAGE_Z + 0.158), (sx * 1.00, -0.09, 0.45), 0.054),
        ("mid",   (sx * 0.226, 0.472, HEAD_CAGE_Z + 0.180), (sx * 1.00, -0.09, 0.36), 0.056),
        ("upper", (sx * 0.254, 0.466, HEAD_CAGE_Z + 0.200), (sx * 1.00, -0.09, 0.26), 0.048),
        ("tip",   (sx * 0.272, 0.460, HEAD_CAGE_Z + 0.214), (sx * 1.00, -0.09, 0.18), 0.026),
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
# body height too high. The reference tail leaves the rump, DIPS behind it, and
# then rises into a distinct oval tuft. Re-measured at rest, column by column,
# the tuft is centred at mask y -0.61, z 0.158 with half-extents 0.065 fore-aft
# and 0.083 vertical — an upright oval, taller than it is long.
#
# The old tail also had no tuft at all, which for a lion is not a detail. It is
# the feature that makes the back half read as a lion rather than a cub-shaped
# animal, and it is the only silhouette event behind the haunch.
#
# Construction: a thinning shaft that turns downward, then rings that swing to
# travel BACKWARD so the tuft's bulge lands in the x-z plane. That matters —
# a ring's radius spans the two axes perpendicular to its direction, so a tuft
# built on a downward-travelling shaft would have bulged fore-aft and sideways
# instead of standing up the way the reference draws it. Those backward-running
# rings are also what lets the tuft be ELLIPTICAL in the way it needs to be:
# with the tangent along -Y, `ring_frame` hands r_right the X axis and r_up the
# Z axis, so height and width become independent parameters.
TAIL = [
    # THE REFERENCE SHEET DISAGREES WITH ITSELF ABOUT THE TAIL, twice, and this
    # table fits the SIDE view. Both disagreements are measured, not asserted:
    #
    #   * the tuft's HEIGHT. The tail sits on the midline, so an orthographic
    #     view cannot change its z — and the reference's side view puts the tuft
    #     at z 0.075-0.242 while its own 3/4 view puts it at z 0.19-0.345. That
    #     is 0.11 H of disagreement about one object's height. The gradient was
    #     worked out before choosing: at the graded weights a 1 px lift is worth
    #     -1.9e-4 to the side and +1.8e-4 to the 3/4, so the two views very
    #     nearly cancel and the tie goes to the view that is 0.30 rather than
    #     0.25. Lifting it was then tried anyway and measured worse (below).
    #
    #   * the tail's EXISTENCE below z 0.13. The reference's front view has a
    #     clean 0.042 H crotch gap at z 0.07-0.12 with nothing in it, and its own
    #     side view has 0.010 H^2 of tail in exactly those rows. Putting the tail
    #     where the side view wants it therefore costs the front view 638 px —
    #     front IoU 0.9287 -> 0.9272 — and buys the side view 7300 px of
    #     symmetric difference. That trade is +0.0108 weighted against -0.0005.
    #
    # This is the same class of defect as REAR_CEILING: the turnaround is a
    # rendered study, not four consistent projections of one form. Chasing the
    # 3/4 tuft or the empty crotch gap can only be done by unbuilding the side.
    #
    # THIRD PASS, from the reference's tail as a SEPARATE RUN rather than from
    # the outline's rearmost point. In the side view the tail is a distinct
    # horizontal run from the body at every height between z 0.09 and 0.28, and
    # a distinct VERTICAL run in every column behind y -0.45, so the shaft's
    # route and the tuft's mass can each be measured directly instead of being
    # inferred from where the union happens to end.
    #
    #   the shaft, by row (centre of the tail's own run, and its half-width)
    #     z 0.275   y -0.368  h 0.031      z 0.200   y -0.401  h 0.030
    #     z 0.250   y -0.377  h 0.029      z 0.175   y -0.415  h 0.030
    #     z 0.225   y -0.388  h 0.030      z 0.150   y -0.436  h 0.034
    #
    #   the shaft, by column (centre of the tail's own run, and its half-height)
    #     y -0.450  z 0.138  h 0.032       y -0.519  z 0.110  h 0.022
    #     y -0.473  z 0.121  h 0.023       y -0.542  z 0.111  h 0.023
    #     y -0.496  z 0.111  h 0.023
    #
    #   the tuft, by column
    #     y -0.554  z 0.092..0.192         y -0.623  z 0.075..0.242
    #     y -0.577  z 0.088..0.221         y -0.646  z 0.079..0.242
    #     y -0.600  z 0.075..0.235         y -0.669  z 0.090..0.225 (clipped)
    #
    # THE SHAFT DIPS AND THE TUFT RISES OFF IT. That is the shape the previous
    # table missed. The reference's shaft descends steeply behind the rump to a
    # LOW point — centre z 0.110 at y -0.50, its underside at z 0.088 — and runs
    # nearly level from there, while the tuft's mass sits 0.046 ABOVE that
    # centreline: its underside is only 0.035 below the shaft's centre and its
    # crown is 0.127 above it. The old table ran the shaft straight down to a
    # tuft at z 0.15-0.19 and so put geometry through the wedge of empty canvas
    # the reference leaves between its shaft and its tuft — 2420 extra pixels —
    # while leaving the low sweep at z 0.09-0.15 empty at 1279 missing.
    #
    # THE UPPER SHAFT IS NOT A SILHOUETTE EVENT AT ALL. Above z 0.24 the model's
    # own rump cap already reaches y -0.411 in mask units, which is behind the
    # rearmost pixel the reference has anywhere in those rows (-0.406). So the
    # only thing the shaft can do up there is stay inside the rump and stop
    # poking past it, which is worth 1337 extra pixels. The radii above z 0.20
    # are set from that, not from the reference's shaft thickness — the
    # reference's shaft is THICKER than the model's there and the extra
    # thickness would be invisible material that costs IoU.
    #
    # THE TAIL'S MASS STEERS THE WHOLE SILHOUETTE'S REGISTRATION, so none of the
    # numbers above can be converted with a fixed offset. `silhouette_render.fit`
    # recentres the model on its own bounding box and `silhouette_qa` then rolls
    # it to match the reference's centroid, and the tail is the rearmost thing on
    # the animal: moving the tuft 0.02 back moved the side view's registration
    # from -1 px to -5 px, which shifts the ENTIRE body outline. So the loop here
    # is measure the built model, take the delta, convert the DELTA, rebuild:
    #     dy_cage = 0.977 * dy_mask     dz_cage = 0.977 * dz_mask
    # An absolute conversion is only good for the run it was measured on; at the
    # values that shipped it is y_cage = 0.977 * y_mask + 0.0004.
    #
    # A ring's silhouette half-extent comes back at 0.757 of r_cage * 1.0235 —
    # measured on the built tuft and on the built shaft, which agree to three
    # figures. That is the octagon's cubic-B-spline factor (0.902 for 8 control
    # points) times the along-path averaging, and it is NOT 0.902: two levels of
    # Catmull-Clark on rings this coarse have not converged to the limit surface.
    # So r_cage = r_mask / 0.775. Reading 0.902 off the crease_loop note and
    # sizing a ring from it comes out 15% small.
    # KNOWN ARTIFACT, AND TWO REMEDIES THAT MEASURED WORSE. These two rings are
    # small circles sitting INSIDE the attachment loop — the 3x3 patch spans
    # rump -> haunch_back -> haunch, so its boundary runs from (-0.378, 0.320)
    # up to (-0.320, 0.400) and its centroid is at about (-0.350, 0.362), above
    # and forward of root_02. The tail then has to turn back down through that
    # loop, and Catmull-Clark answers by funnelling the rump's top surface into
    # a groove on the midline: measured by ray-casting straight down, the top of
    # the model at (x 0, y -0.384) is z 0.182 while 0.04 to the side it is 0.326.
    #
    # It is NOT new — the same probe on the previous table gives 0.238 against
    # 0.325, an 0.087 groove against this table's 0.144 — and it is confined to
    # a strip about 0.04 wide that no silhouette view sees (the side view takes
    # the max over x, and off the midline the surface is untouched). Both
    # attempts to close it made a gate worse:
    #
    #   r 0.026 -> 0.032/0.031, to fatten the neck: TOTAL_PINCHED 0 -> 3 and
    #   WORST_AREA_RATIO 0.252 -> 0.174, and the groove did not move.
    #
    #   y -0.368 -> -0.386, so the tail leaves off the rump's REAR instead of
    #   through its top: SLIVER_FACES 0 -> 10, side IoU 0.9029 -> 0.8998, and
    #   the groove did not move either.
    #
    # The real fix is a ring in the attach transition, which costs 8 cage
    # vertices and 128 after L2 — a budget decision, not a tail-table one.
    ("root_02", (0.0, -0.368, 0.320), (0, -0.30, -1.00), 0.026),
    ("root_01", (0.0, -0.374, 0.268), (0, -0.30, -1.00), 0.026),
    ("tail_03", (0.0, -0.385, 0.204), (0, -0.50, -1.00), 0.034),
    ("tail_04", (0.0, -0.420, 0.145), (0, -0.95, -1.00), 0.034),
    # The low point. This ring is nearly perpendicular to Y, so its r spends
    # itself on Z rather than fore-aft. Built and measured: the shaft's underside
    # comes out at z 0.088 against the reference's 0.088, and its crown at 0.135
    # against 0.133, over the whole run from y -0.45 to -0.52.
    ("tail_05", (0.0, -0.487, 0.103), (0, -1.00, -0.20), 0.030),
    # THE TUFT IS A BULB AND IT NEEDS ITS OWN RING SPACING, NOT ONE FAT RING.
    #
    # A ring is a section perpendicular to its tangent, so the tuft's height has
    # to come from r_up and its width from r_right — the previous table used
    # CIRCULAR rings, which meant the only way to buy 0.167 H of height was to
    # buy the same in width, and the ring that tried peaked at r 0.086 and still
    # measured 0.121 H tall because a single peak between two much smaller
    # neighbours is averaged away: 0.086 came back as 0.060 (a factor of 0.69,
    # against 0.87 for a ring whose neighbours match it).
    #
    # So: four rings at a sustained radius, spaced 0.028-0.032 apart, elliptical
    # at r_up/r_right = 1.94 so the crown reaches z 0.235 without the tuft
    # becoming a beach ball. tuft_01 stays SHAFT-SIZED — the reference's ball has
    # a hard leading edge at y -0.545 where its half-height is still 0.023, and a
    # fat ring there would hang above and below material the reference does not
    # have. The leading edge is the one place the model is still visibly softer
    # than the reference: 0.021 H too tall at y -0.531 and 0.042 at y -0.542,
    # which is what four rings can do to a tangent discontinuity.
    #
    # TWO CORRECTIONS THAT MEASURED WORSE, so nobody builds them again.
    #
    # Narrowing the tuft in X to keep it out of the front view's crotch gap
    # (r_right 0.050 -> 0.042 with the shaft to match): SLIVER_FACES went 0 -> 3,
    # two faces flipped, and the front view did not improve at all — 0.83% extra
    # against 0.81%. The gap is 0.042 H wide and offset +0.012 from the midline,
    # so a tail centred on x = 0 would have to be under 0.020 H WIDE to clear it.
    # It cannot be narrowed out of that gap, only out of proportion.
    #
    # Lifting the whole tuft 0.010 to split the difference with the 3/4 view:
    # 3/4 +0.0021 and rear -0.0024 and side -0.0026, weighted 0.8794 -> 0.8780.
    # The side view's placement is the one to fit; see the note above the table.
    #
    # tuft_05 lands at mask y -0.684, past the canvas edge at -0.673, because
    # the reference's tuft is CLIPPED there and "reach the edge" is the only
    # target a clipped band can set (see silhouette_qa's clipping warning). Its
    # cap is NOT creased: a tapering tip is the one place Catmull-Clark's inward
    # pull is wanted, which is the opposite of the paw soles (see crease_loop).
    ("tuft_01", (0.0, -0.540, 0.118), (0, -1.00,  0.35), 0.030, 0.034),
    ("tuft_02", (0.0, -0.575, 0.141), (0, -1.00,  0.40), 0.046, 0.084),
    ("tuft_03", (0.0, -0.602, 0.153), (0, -1.00,  0.15), 0.050, 0.097),
    ("tuft_04", (0.0, -0.630, 0.155), (0, -1.00,  0.00), 0.048, 0.092),
    ("tuft_05", (0.0, -0.662, 0.150), (0, -1.00, -0.10), 0.038, 0.072),
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
        # Sockets that could not find faces within their radius and had to fall
        # back to `nearest_face`. Empty is the only acceptable value; `build()`
        # checks it. See the FACE_SOCKETS comment for what this hid for a month.
        self.socket_fallbacks = []

    # -- surface queries ----------------------------------------------------
    def surface_y(self, x, z, y_start=1.4):
        """The tube's outer y at (x, z), by ray-cast.

        A front elevation measures x and height and nothing else, so depth for
        a facial feature has to come from the geometry. Casting backward from
        in front of the nose and taking the FIRST hit gives the outer surface,
        which is the one a socket belongs on. Returns None on a miss, which is
        a finding rather than something to replace with a guess.
        """
        bvh = BVHTree.FromBMesh(self.bm)
        loc, _, _, _ = bvh.ray_cast(Vector((x, y_start, z)), Vector((0.0, -1.0, 0.0)))
        return None if loc is None else loc.y

    def keep_out_verts(self, prefixes):
        """Verts belonging to ring groups a socket must not consume."""
        out = set()
        for name, verts in self.rings:
            if any(name.startswith(p) for p in prefixes):
                out.update(verts)
        return out

    def slide_inboard(self, x, z, radius, side, avoid, step=0.004, limit=0.060):
        """Walk a target inboard until it clears the keep-out region.

        The measured brow sits at x ±0.1031, h 0.7618, and at that point the
        surface is ENTIRELY the ear's 3x3 attachment patch — the nearest
        non-ear face is 0.035 away, so this is a total collision, not a
        marginal one. One of the two has to move.

        The ear does not: its attachment is what makes its loops flow into the
        skull by construction, and the ear measures correct in the silhouette
        pass. The brow is a shape-key anchor with no motion contract, so the
        brow yields — inboard, at the measured HEIGHT, which is the part
        BrowUp_L/R actually needs. What it costs in width is returned so the
        build states it rather than absorbing it.
        """
        moved = 0.0
        while moved <= limit:
            xx = x - math.copysign(moved, x)
            y = self.surface_y(xx, z)
            if y is not None and self.faces_near((xx, y, z), radius, side, avoid):
                return xx, y, moved
            moved += step
        return None, None, None

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

    def crease_loop(self, verts, value=1.0):
        """Sharpen the edges running around a closed ring.

        WHY THE SOLE NEEDS THIS

        The paw's three rings are horizontal and the right size — measured on
        the cage, the front sole spans 0.256 against the reference's 0.253 —
        and then Catmull-Clark throws most of it away. A capped ring is a
        corner in every direction at once, so the limit surface pulls it hard
        inward and upward, and the shipped sole measured 0.152 where the cage
        said 0.256. The silhouette recorded that as the model being short at
        the lowest rows and full length just above them: a ROUNDED sole against
        the reference's flat one, worth 0.098 H of contact length.

        Three passes read that delta off the band table and reached for the
        ring radii, which were never the problem. The cap profile was.

        A crease of 1.0 on the rim makes the ring behave as a boundary curve
        instead of a corner, so it converges to the cubic B-spline through the
        control polygon — 0.902 of the polygon radius for an octagon, against
        roughly 0.59 uncreased — and the cap's interior, all of which sits in
        one plane, stays planar. Which is what a foot pad is.

        Sharpening the rim is also right for its own sake: a real paw pad has a
        defined edge where it meets the ground, and it is the only silhouette
        event below the belly.
        """
        layer = (self.bm.edges.layers.float.get("crease_edge")
                 or self.bm.edges.layers.float.new("crease_edge"))
        n = 0
        for k, v in enumerate(verts):
            w = verts[(k + 1) % len(verts)]
            e = self.bm.edges.get((v, w))
            if e is not None:
                e[layer] = value
                n += 1
        return n

    def crease_ring(self, name, value=1.0):
        """Crease the ring recorded under `name` by `grow`."""
        for gname, verts in self.rings:
            if gname == name:
                return self.crease_loop([v for v in verts if v.is_valid], value)
        print(f"[cage] WARNING crease_ring: no ring named {name}")
        return 0

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

    def faces_near(self, target, radius, side=None, avoid=None):
        t = Vector(target)
        out = []
        for f in self.bm.faces:
            c = f.calc_center_median()
            if side and c.x * side <= 0.015:
                continue
            if avoid and any(v in avoid for v in f.verts):
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

    def socket(self, target, insets, depth, side=None, radius=0.052,
               avoid=None, label=""):
        """Concentric deformation loops around a facial feature.

        `inset_region` creates a rim of new faces and leaves the ORIGINAL faces
        as the shrunken centre, so insetting the same face repeatedly builds
        concentric rings outward from it. An eyelid needs at least two: a blink
        slides loops over the eyeball, and one ring has nothing to slide.

        `depth` then pushes the centre in along its own normal, which is what
        makes it a socket rather than a circle drawn on a cheek. Negative depth
        pushes OUT, which is how the nose pad is a pad rather than a dent.

        THE FALLBACK IS NOT A CONVENIENCE. `nearest_face()` always succeeds, so
        for as long as it was silent an off-surface target produced a socket
        somewhere and the only trace was a "-> 1 centre faces" line in a build
        log nobody diffs. Three of the five facial targets were wrong that way.
        It now records itself, and `build()` refuses to finish with a non-empty
        `socket_fallbacks`.
        """
        region = self.faces_near(target, radius, side, avoid)
        if not region:
            pred = None
            if side:
                pred = lambda fc: fc.calc_center_median().x * side > 0.015  # noqa: E731
            f = self.nearest_face(target, pred)
            if f is None:
                print(f"[cage] WARNING no face near {target}")
                return None
            region = [f]
            miss = (f.calc_center_median() - Vector(target)).length
            self.socket_fallbacks.append((label or "unnamed", tuple(target), miss))
            print(f"[cage] *** FALLBACK *** socket '{label or 'unnamed'}' found no "
                  f"face within {radius:.3f} of {tuple(round(v, 4) for v in target)}; "
                  f"nearest is {miss:.4f} away. The target is not on the surface.")

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
    #   right ear  centre seg  2 =  45 deg (upper side, right) columns  1, 2, 3
    #   left  ear  centre seg  6 = 135 deg (upper side, left)  columns  5, 6, 7
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

    # FLAT SOLES. See `crease_loop` for why the rim rather than the radii: the
    # paw rings measure right on the cage and Catmull-Clark rounds them away,
    # and the tail's tapering tip cap is the one place that rounding is wanted.
    for limb in ("frontR", "frontL", "rearR", "rearL"):
        n = cage.crease_ring(f"{limb}:paw_sole", SOLE_CREASE)
        if n != 8:
            print(f"[cage] WARNING {limb} sole crease hit {n} edges, expected 8")

    # THE EARS ARE NO LONGER CAGE GEOMETRY. See `ear()` below for the full
    # reasoning and the five attempts it took to get here. In short: the
    # reference's ear is widest LOW and tapers upward, a lofted ring appendage
    # cannot make that shape without a re-entrant surface, and a re-entrant
    # surface self-intersects the moment the skull bends — measured at 16
    # pinched faces and a worst area ratio of 0.035 against 0 and 0.261.
    #
    # An ear does not deform. It follows the skull, and `ear_L` / `ear_R` bones
    # already exist. So the ears are built in `face_lion.build_ears()` as their
    # own meshes and rigid-skinned to those bones, exactly as the mane and the
    # 15 face parts are. The head_mid ring is left INTACT — not opened and
    # capped, simply not opened — so the deformation cage loses the two
    # appendages it was pinching on and gains nothing to go wrong.
    #
    # `lion_skeleton`'s EAR_WEIGHTS entries become no-ops: the skin map is
    # applied by iterating the rings that EXIST on the mesh, so entries with no
    # ring are skipped silently. Verified, not assumed.

    # Caps FIRST. The mouth socket sits within 0.036 of the nose ring, so with
    # the muzzle still open its inset ran along an open boundary and shredded the
    # 16-vertex loop the front cap needed — the integrity report found 12 unfilled
    # boundary edges right at the nose.
    cage.cap_rear()
    cage.cap_front()

    # NORMALS BEFORE NORMALS ARE USED.
    #
    # `socket()` pushes its centre along the summed face normal and
    # `open_cavity()` extrudes along it, but until now the only
    # `recalc_face_normals` in this file was in `finish()` — so both were
    # reading whatever winding the extrude/inset chain happened to leave.
    # It survived while the mouth target was off-surface and the fallback
    # handed back a single face; with a real two-face region on the lower
    # muzzle the summed normal came out inverted and `open_cavity` extruded
    # OUTWARD, producing a gold spike protruding under the chin and splitting
    # the mouth line in two. The surface is closed at this point (both caps are
    # in), so this is exactly where the winding can be made consistent.
    bmesh.ops.recalc_face_normals(cage.bm, faces=list(cage.bm.faces))

    # Facial deformation loops, authored on a CLOSED surface, from the measured
    # face. x and z are read; y is ray-cast off the surface that now exists.
    measured = face_measurement()
    keep_out = cage.keep_out_verts(FACE_KEEP_OUT)
    mouth = None
    print("[cage] face sockets, measured x/z with ray-cast depth:")
    for name, insets, depth, radius, mirrored in FACE_SOCKETS:
        if name not in measured:
            print(f"[cage] WARNING no measurement for '{name}' — skipped")
            continue
        mx, mz = measured[name]
        sides = ((+1, +mx), (-1, -mx)) if mirrored else ((None, mx),)
        for side, x in sides:
            y = cage.surface_y(x, mz)
            if y is None:
                raise SystemExit(
                    f"[cage] '{name}' at x={x:+.4f} z={mz:.4f} does not hit the "
                    f"tube. The measurement and the cage disagree about where "
                    f"the head is; that is a real conflict, not a tolerance.")
            avoid = keep_out if name == "brow" else None
            note = "ray-cast"
            if avoid:
                x2, y2, moved = cage.slide_inboard(x, mz, radius, side, avoid)
                if x2 is None:
                    raise SystemExit(
                        f"[cage] '{name}' could not clear {FACE_KEEP_OUT} within "
                        f"0.060 of x={x:+.4f}. The ear patch and the measured "
                        f"brow cannot both be where they are.")
                if moved > 1e-9:
                    note = (f"ray-cast, slid {moved:.3f} inboard off the ear "
                            f"patch (measured x was {x:+.4f})")
                x, y = x2, y2
            target = (x, y, mz)
            # Record one target per feature for the close-up cameras. For a
            # mirrored pair the +x side is enough; both are built.
            if side is None or side > 0:
                FACE_TARGETS[name] = target
            print(f"[cage]   {name:9s} x={x:+.4f} z={mz:.4f} "
                  f"y={y:+.4f} ({note})")
            region = cage.socket(target, insets, depth, side=side, radius=radius,
                                 avoid=avoid, label=name)
            if name == "mouth":
                mouth = region
    if mouth is None:
        raise SystemExit("[cage] the mouth socket did not build — no cavity to open")
    cage.open_cavity(mouth, 0.052)

    if cage.socket_fallbacks:
        for label, target, miss in cage.socket_fallbacks:
            print(f"[cage] FALLBACK {label} at "
                  f"{tuple(round(v, 4) for v in target)} missed by {miss:.4f}")
        raise SystemExit(
            f"[cage] {len(cage.socket_fallbacks)} facial socket(s) fell back to "
            f"nearest_face. A socket target must be ON the surface — fix the "
            f"measurement or the radius, do not accept a silent placement.")



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
    # The facial close-ups aim at the socket target the build actually resolved,
    # not at a literal. The previous eye target (0.075, 0.585, 0.624) was 0.032
    # below and 0.032 behind where the eye is, so the one render that exists to
    # let the eye loops be judged was pointing at blank cheek. Reading
    # FACE_TARGETS also means a slid brow is followed by its own camera.
    closeups = {
        "shoulder": (0.120, 0.215, 0.300, 235),
        "elbow": (0.120, 0.205, 0.160, 240),
        "hip": (0.115, -0.290, 0.295, 300),
        "hock": (0.115, -0.275, 0.080, 300),
        "tail_root": (0.0, -0.462, 0.346, 340),
        "tail_tuft": (0.0, -0.598, 0.180, 320),
    }
    # Yaw per facial feature: the angle that shows that feature's loops. A
    # midline feature wants a near-frontal view; a paired one wants to be seen
    # off-axis or its own rim hides it.
    FACE_YAW = {"eye": 210, "brow": 205, "nose_pad": 200, "mouth": 195}
    for name, (tx, ty, tz) in FACE_TARGETS.items():
        closeups[name] = (tx, ty, tz, FACE_YAW.get(name, 200))
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
