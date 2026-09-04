"""
crease_qa_lion.py — is the surface SMOOTH where it is meant to be?

WHY THE EXISTING GATES DO NOT COVER THIS

The cage integrity report checks slivers, non-manifold edges, boundary edges
and quad ratio. The deformation battery checks pinched and flipped faces and
the worst area ratio. Every one of those passes on the shipped asset, and the
rear leg still renders as a crushed paper bag — hard creases and flat facets
where a leg should be a smooth tube.

That is not a contradiction. Those gates ask whether the mesh is VALID. A
creased surface is perfectly valid: no degenerate faces, no inverted normals,
no holes, every quad convex. It is just not smooth. Nothing in this pipeline
was measuring smoothness, so a visibly broken limb sat behind a wall of green
checks for as long as the asset has existed.

WHAT IT MEASURES

The dihedral angle across every interior edge — the angle between the two
faces sharing it — grouped by region. On a subdivided surface that should be a
few degrees almost everywhere; a crease is a run of edges at tens of degrees.

Measured on the shipped cage, which is how the thresholds below were set:

    region         edges  median     p99     max   >25 deg
    front leg       6620    8.56   48.87  175.37     3.41%
    rear leg        8038    7.89   71.86  178.26     6.10%
    body            8996    5.54   43.01  175.30     2.52%
    head/neck       9986    5.33   46.63  142.46     3.09%

The MEDIAN is not the signal — the rear leg's is lower than the front leg's.
The signal is the tail of the distribution: a p99 of 71.9 degrees against the
body's 43.0, and 6.10% of edges over 25 degrees against the body's 2.52%. A
crease is rare by definition, so an average cannot see it. That is the same
extremum-versus-average trap this project has hit on the ears, on the mane's
locks and on the world's scale — recorded here so the next reader does not
reach for a mean.

THE CAUSE, for the rear leg specifically

Its station chain reverses direction twice: the stifle points FORWARD, the
shin runs BACK, the hock runs BACK, then the hock's lower station turns FORWARD
again to form the heel. A lofted tube through a sharp reversal has to fold, and
`cage_lion.py` already records the same failure on the ear — "a re-entrant
lofted taper self-intersects" — which is why the ears left the cage entirely.

Run (via `npm run lion:review`, or directly):
  blender --background art/blender/lion_assembled.blend --factory-startup \
    --python tools/blender/crease_qa_lion.py
"""

import math
import os
import sys

import bpy

# Per-region ceilings, set from the measurement above with a little headroom.
# The body is the reference for what this asset's surface should look like:
# it is the largest region, it has no reversals in it, and it reads correctly.
P99_MAX = float(os.environ.get("LION_CREASE_P99", "56.0"))
OVER25_MAX = float(os.environ.get("LION_CREASE_FRAC", "4.5"))


# The paw sole is DELIBERATELY creased and cannot be judged as a smooth tube.
# `cage_lion.py` builds it as a stack of level rings with a `paw_rim` ring and a
# `SOLE_CREASE` loop, so the rim is a designed fold: measured, the front rim
# runs to 51.3 degrees and the rear to 59.2, with medians of 5.97 and 1.63 —
# almost every edge flat, a thin band of rim at sixty degrees. Grading that on
# the fraction over 25 degrees reports 11-13% forever and means nothing. It is
# gated on the MAX instead, high enough to pass the rim the design asks for and
# low enough to catch one that has become a fold.
SOLE_MAX = float(os.environ.get("LION_CREASE_SOLE_MAX", "65.0"))


def region(co):
    """Which part of the animal an edge midpoint belongs to.

    SIX LEG REGIONS, NOT TWO, AND THE OLD TWO WERE HIDING THE REAL DEFECT.

    This used to return "front leg" and "rear leg" for everything below z 0.30,
    which put three unrelated things in one bucket: the limb's own lofted chain,
    the transition where the limb grows out of the body tube, and the paw's
    deliberately creased sole rim. Splitting them, measured on the cage this
    change shipped:

        sub-region           edges  median     p99      max     >25
        front limb chain      4542    8.68   27.58    68.53   1.37%
        front sole rim         550    5.97   50.67    51.27  11.27%
        front upper attach    1528    9.00  137.50   175.37   6.68%
        rear limb chain       4930    8.36   35.14   116.72   2.47%
        rear sole rim          384    1.63   59.10    59.15  12.50%
        rear upper attach     2720    6.80  114.69   178.26   8.16%

    BOTH limb chains pass. BOTH attaches fail, and the front one is the worse of
    the two at a p99 of 137.5 degrees — while the old "front leg" region
    reported 48.87 and passed, because 4,542 clean chain edges diluted 1,528 bad
    ones. That is the same extremum-versus-average trap this file's own header
    warns about, occurring inside the gate that warns about it.

    It also misdirects. "rear leg" sent a rebuild to the limb's station table,
    where 55% of the region's creased edges were above the knee — in the haunch
    and the groove where the tail leaves the rump, which `cage_lion.py`'s tail
    table already diagnoses and prices: "the real fix is a ring in the attach
    transition, which costs 8 cage vertices and 128 after L2".

    Still crude on purpose: box tests in the cage's own space, because a
    per-vertex-group classification would be exact and would also depend on the
    rig, and this gate has to keep working when the rig changes. z 0.19 is the
    split because the limb chains top out at the knee, z 0.159.
    """
    x, y, z = co
    if abs(x) > 0.05 and z < 0.30:
        side = None
        if y < -0.15:
            side = "rear"
        elif y > 0.10:
            side = "front"
        if side:
            if z < 0.010:
                return f"{side} sole rim"
            if z >= 0.19:
                return f"{side} upper attach"
            return f"{side} limb chain"
    if z > 0.45:
        return "head/neck"
    return "body"


def main():
    obj = bpy.data.objects.get("LionCage")
    if obj is None:
        sys.exit("[crease] no LionCage in the scene")
    me = obj.data

    edge_faces = {}
    for p in me.polygons:
        for ek in p.edge_keys:
            edge_faces.setdefault(ek, []).append(p.index)

    buckets = {}
    for ek, fs in edge_faces.items():
        if len(fs) != 2:
            continue
        n1 = me.polygons[fs[0]].normal
        n2 = me.polygons[fs[1]].normal
        if n1.length < 1e-9 or n2.length < 1e-9:
            continue
        mid = (me.vertices[ek[0]].co + me.vertices[ek[1]].co) / 2.0
        buckets.setdefault(region(mid), []).append(math.degrees(n1.angle(n2)))

    print("")
    print("SURFACE CREASE (dihedral angle across interior edges, by region)")
    print(f"  {'region':18s} {'edges':>7s} {'median':>7s} {'p99':>7s} "
          f"{'max':>8s} {'>25 deg':>9s}")
    bad = []
    rows = {}
    for r in ("front limb chain", "rear limb chain", "front upper attach",
              "rear upper attach", "front sole rim", "rear sole rim",
              "body", "head/neck"):
        a = sorted(buckets.get(r, []))
        if not a:
            continue
        n = len(a)
        p99 = a[int(n * 0.99)]
        frac = 100.0 * sum(1 for v in a if v > 25.0) / n
        rows[r] = (p99, frac)
        flag = ""
        if r.endswith("sole rim"):
            # A designed rim. Gated on the max only — see SOLE_MAX.
            if a[-1] > SOLE_MAX:
                flag = "  <-- CREASED (rim past its designed angle)"
                bad.append(r)
        elif p99 > P99_MAX or frac > OVER25_MAX:
            flag = "  <-- CREASED"
            bad.append(r)
        print(f"  {r:18s} {n:7d} {a[n // 2]:7.2f} {p99:7.2f} {a[-1]:8.2f} "
              f"{frac:8.2f}%{flag}")

    print("")
    print("===CREASE_QA===")
    for r, (p99, frac) in rows.items():
        print(f"{r.replace(' ', '_').upper()}_P99={p99:.2f} "
              f"{r.replace(' ', '_').upper()}_OVER25={frac:.2f}")
    print(f"CREASED_REGIONS={len(bad)}  {bad}")
    print("===CREASE_QA_END===")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
