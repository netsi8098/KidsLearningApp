"""
loft_lion_volume.py — a reference-driven volume, lofted with CadQuery.

STATUS: FROZEN — MEASUREMENT JIG ONLY

This script has completed its purpose. It stays for measured cross-sections,
width/height and length relationships, reference-plane alignment and repeatable
measurement. Do NOT extend it toward character modelling: no CAD detail, no face
topology, no mane, no joint loops, no skinning, no morph targets. Those belong in
Blender. See docs/asset-roles.md.

WHAT THIS IS, AND WHAT IT IS NOT

It is a precise solid lofted through cross-sections whose dimensions are READ OFF
the approved turnaround, exported as a mesh to serve as a sculpting and
retopology reference in Blender.

It is NOT the production asset, and it deliberately does not try to be. CadQuery
is an OpenCascade CAD kernel: its native output is BREP/STEP, and it has no
concept of subdivision surfaces, edge-loop topology, skeletal skinning or morph
targets. The production character stays a polygonal Blender mesh exporting glTF.
This fills exactly the role the brief assigned to image-to-3D reconstruction —
"learn the volume here, make it animate in Blender" — with the advantage that a
loft through measured sections cannot invent a back side or fuse the legs.

WHERE THE NUMBERS COME FROM

`profiles.json`, produced by measuring the normalised orthographic views:

  * the SIDE view gives, per fore-aft station, the back line and the belly line;
  * the FRONT and REAR views give width against height.

One thing no orthographic view provides is WIDTH ALONG LENGTH — a front view is a
projection over the whole body, so it reports the widest point at each height and
not the width at each station. That profile is therefore interpolated between
measured anchors, and the anchors are named below so it is clear which figures
are measured and which are inferred.

Run:
  /tmp/cqenv/bin/python tools/cad/loft_lion_volume.py

Outputs:
  art/cad/lion_volume.step        (CAD interchange, for reference only)
  art/cad/lion_volume.stl         (the mesh Blender imports)
  art/cad/lion_volume_report.json
"""

import json
import os
import sys

import cadquery as cq
from cadquery import Plane, Workplane

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
VIEWS = os.path.join(REPO, "art", "blender", "references", "turnaround-views")
OUT_DIR = os.path.join(REPO, "art", "cad")

H = 1.0                      # total height, normalised
SEG = 48                     # ellipse segments in the exported tessellation


def load_profiles():
    with open(os.path.join(VIEWS, "profiles.json")) as fh:
        return json.load(fh)


def side_at(cols, u):
    """Measured back line and lower line at fore-aft fraction u."""
    c = min(cols, key=lambda c: abs(c["u"] - u))
    return c["top"], c["run_bottom"]


# Width along length. INFERRED, anchored to measured values:
#   mane      -> front view widest, 0.713 H
#   rump      -> rear view at rump height, 0.410 H
#   barrel    -> front view at h=0.30 minus the leg columns
#
# THE FRONT AND REAR VIEWS DISAGREE about mane width, and both cannot be
# satisfied. After normalising for the source artwork's 11.8% height mismatch,
# the front view puts the mane at 0.713 H across and the rear at 0.588 H — an 18%
# discrepancy in the same dimension of the same object. That is an artefact of a
# drawn turnaround, not a property of the character. The FRONT view wins: it is
# the hero angle, the largest drawing, and the one a child sees. The rear view is
# expected to show a permanent blue (model-too-wide) halo in the silhouette QA
# and that halo is not a defect to chase.
# The turnaround cannot supply the rest, and pretending otherwise would be the
# same error as the hand-typed contract this replaces.
WIDTH_ANCHORS = [
    (0.015, 0.085),   # nose
    (0.060, 0.190),   # muzzle
    (0.115, 0.330),   # cheek / face plate
    (0.190, 0.713),   # mane widest  [MEASURED]
    (0.290, 0.640),   # mane rear
    (0.380, 0.430),   # shoulder
    (0.470, 0.372),   # rib cage
    (0.580, 0.352),   # waist
    (0.700, 0.396),   # haunch
    (0.780, 0.410),   # rump        [MEASURED]
    (0.850, 0.185),   # tail root
    (0.930, 0.088),   # tail
    (0.975, 0.140),   # tuft — overlay showed the reference tuft larger
    (1.000, 0.120),   # tuft tip
]


def width_at(u):
    a = WIDTH_ANCHORS
    if u <= a[0][0]:
        return a[0][1]
    if u >= a[-1][0]:
        return a[-1][1]
    for (u0, w0), (u1, w1) in zip(a, a[1:]):
        if u0 <= u <= u1:
            t = (u - u0) / (u1 - u0)
            t = t * t * (3.0 - 2.0 * t)          # smoothstep, so no facets
            return w0 + (w1 - w0) * t
    return a[-1][1]


def body_stations(prof, n=96):
    """Cross-sections along the spine, nose (+Y) to tail tip (-Y).

    96 stations, not 34. The back line peaks in a narrow window at the mane
    crown, and coarse stations straddled it — the lofted height came out 0.862 H
    against a measured 1.000 H, a 14% error introduced purely by sampling. When
    the reference has a sharp feature, the sampling rate has to resolve it.
    """
    cols = prof["side"]
    length = prof["side_length_H"]
    out = []
    for i in range(n + 1):
        u = i / n
        top, low = side_at(cols, u)
        # The side view's lower line is the belly where the legs leave a gap and
        # the leg silhouette where they do not. Clamp it so the barrel never
        # reaches below a plausible belly, or the loft swallows the legs.
        low = max(low, 0.175)
        cz = (top + low) / 2.0
        rz = max(0.012, (top - low) / 2.0)
        rx = max(0.012, width_at(u) / 2.0)
        # Y: nose forward. u = 0 is the nose end of the side view.
        y = (0.5 - u) * length
        out.append((y, cz, rx, rz, u))
    return out


def ellipse_wire(y, cz, rx, rz):
    plane = Plane(origin=(0.0, y, cz), xDir=(1, 0, 0), normal=(0, 1, 0))
    return Workplane(plane).ellipse(rx, rz).wire().val()


# (label, x, y, top_z, bottom_z, r_top, r_mid, r_paw)
#
# Corrected from the silhouette overlay, which showed a solid red band under the
# whole body — reference the model did not cover. The legs stopped 0.020 above
# the ground and the paws were too narrow, so the character floated and its feet
# read as pegs. Legs now reach z = 0 and the paws are broader than the shafts,
# which is both an art note from the reference and a locomotion requirement:
# ground-contact shape is what makes a planted paw look planted.
LEGS = [
    ("FL", -0.118, 0.300, 0.310, 0.000, 0.072, 0.058, 0.102),
    ("FR", 0.118, 0.300, 0.310, 0.000, 0.072, 0.058, 0.102),
    ("RL", -0.112, -0.300, 0.310, 0.000, 0.084, 0.060, 0.096),
    ("RR", 0.112, -0.300, 0.310, 0.000, 0.084, 0.060, 0.096),
]


def leg_solid(x, y, top_z, bot_z, r_top, r_mid, r_paw):
    """A leg lofted along Z, widening again into the paw.

    The paw is part of the same loft rather than a separate ball: the reference
    shows a continuous soft transition from shaft to paw, and a union of two
    primitives produces a seam there instead.
    """
    span = top_z - bot_z
    sections = [
        (top_z, r_top),
        (top_z - span * 0.35, r_mid * 1.04),
        (top_z - span * 0.62, r_mid),
        (bot_z + span * 0.20, r_mid * 1.10),
        (bot_z + span * 0.08, r_paw),
        (bot_z, r_paw * 0.94),
    ]
    wires = []
    for z, r in sections:
        plane = Plane(origin=(x, y, z), xDir=(1, 0, 0), normal=(0, 0, 1))
        wires.append(Workplane(plane).circle(r).wire().val())
    return cq.Solid.makeLoft(wires, ruled=False)


def ensure_outward(solid, label):
    """Return a solid whose orientation is outward.

    A loft can come back inside-out, which OCC reports as a negative volume. That
    is cosmetic for a standalone mesh but NOT for booleans: fusing against an
    inverted solid behaves like an intersection, and the four legs vanished into
    the body. The fused result was still one solid with a plausible bounding box,
    so nothing looked wrong except a floor 120mm too high.
    """
    v = solid.Volume()
    if v >= 0:
        return solid
    fixed = cq.Shape.cast(solid.wrapped.Reversed())
    print(f"[cad] {label}: volume was {v:+.5f}, reversed to {fixed.Volume():+.5f}")
    return fixed


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    prof = load_profiles()

    stations = body_stations(prof)
    body = ensure_outward(
        cq.Solid.makeLoft([ellipse_wire(y, cz, rx, rz) for y, cz, rx, rz, _u in stations],
                          ruled=False), "body")
    # Fuse with the shape API directly rather than through Workplane.union.
    #
    # Workplane.union kept the stack but the result's bounding box floor stayed at
    # the BODY's belly (0.140) instead of the paws (0.020) — the four legs were
    # silently absent from what `.val()` returned. Fusing solids explicitly and
    # then checking the solid count makes a dropped union impossible to miss.
    solid = body
    made = 1
    for label, x, y, tz, bz, rt, rm, rp in LEGS:
        solid = solid.fuse(ensure_outward(leg_solid(x, y, tz, bz, rt, rm, rp), f"leg {label}"))
        made += 1
    solid = solid.clean()
    n_solids = len(solid.Solids())
    if n_solids != 1:
        print(f"[cad] WARNING fused result has {n_solids} solids, expected 1 — "
              f"a limb is not intersecting the body")
    vol = solid.Volume()
    bb = solid.BoundingBox()

    step = os.path.join(OUT_DIR, "lion_volume.step")
    stl = os.path.join(OUT_DIR, "lion_volume.stl")
    cq.exporters.export(solid, step)
    cq.exporters.export(solid, stl, tolerance=0.0022, angularTolerance=0.20)

    report = {
        "solids_unioned": made,
        "fused_solid_count": n_solids,
        "body_stations": len(stations),
        "volume": round(abs(vol), 6),
        "bbox": {"x": [round(bb.xmin, 4), round(bb.xmax, 4)],
                 "y": [round(bb.ymin, 4), round(bb.ymax, 4)],
                 "z": [round(bb.zmin, 4), round(bb.zmax, 4)]},
        "height": round(bb.zlen, 4),
        "length": round(bb.ylen, 4),
        "width": round(bb.xlen, 4),
        "stl_bytes": os.path.getsize(stl),
        "step_bytes": os.path.getsize(step),
        "role": "volume reference for Blender sculpt + retopology; NOT the production asset",
    }
    with open(os.path.join(OUT_DIR, "lion_volume_report.json"), "w") as fh:
        json.dump(report, fh, indent=2)

    print("===LION_VOLUME===")
    print(f"SOLIDS_FUSED={made} RESULT_SOLIDS={n_solids} BODY_STATIONS={len(stations)}")
    print(f"HEIGHT={bb.zlen:.4f} LENGTH={bb.ylen:.4f} WIDTH={bb.xlen:.4f}")
    wh, lh = bb.xlen / bb.zlen, bb.ylen / bb.zlen
    print(f"WIDTH_OVER_HEIGHT={wh:.4f}  reference 0.7130  err {100*(wh-0.713)/0.713:+.1f}%")
    print(f"LENGTH_OVER_HEIGHT={lh:.4f}  reference 1.3440  err {100*(lh-1.344)/1.344:+.1f}%")
    print(f"VOLUME={abs(vol):.5f}")
    print(f"STL={stl} ({os.path.getsize(stl) / 1024:.1f} KB)")
    print(f"STEP={step} ({os.path.getsize(step) / 1024:.1f} KB)")
    print("===LION_VOLUME_END===")


if __name__ == "__main__":
    sys.exit(main())
