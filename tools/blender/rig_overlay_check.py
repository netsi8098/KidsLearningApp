"""
rig_overlay_check.py — does the new surface still envelop the proven skeleton?

The body was corrected by up to 0.14 H at the haunch. That is a big move, and the
brief is explicit: joint centres are constraints, and if the approved shape proves
a joint is wrong the required rig change must be DOCUMENTED rather than silently
worked around by distorting the surface.

So every joint is tested for containment inside the mesh, by ray-casting outward
in six directions and requiring the mesh to be hit on all of them. A joint that
escapes is reported with the distance and direction.

Run:
  blender --background art/blender/lion_cage.blend --factory-startup \
    --python tools/blender/rig_overlay_check.py
"""
import math, os, sys
import bpy
from mathutils import Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lion_skeleton import skeleton  # noqa: E402

DIRS = [Vector(d) for d in ((1,0,0), (-1,0,0), (0,1,0), (0,-1,0), (0,0,1), (0,0,-1))]


def inside(obj, p, reach=1.0):
    """Contained if the mesh is hit in every axis direction."""
    hits, dists = 0, []
    for d in DIRS:
        ok, loc, _n, _i = obj.ray_cast(p, d, distance=reach)
        if ok:
            hits += 1
            dists.append((loc - p).length)
    return hits == 6, hits, (min(dists) if dists else 0.0)


def main():
    obj = bpy.data.objects.get("LionCage")
    if obj is None:
        raise SystemExit("LionCage not found")

    # A terminal bone's TAIL is meant to sit at the surface — a paw's tail is the
    # sole, an ear's is the tip, the jaw's is the chin. Testing those for
    # containment reports the rig working as designed as a defect, so they are
    # graded separately from joints that must be enclosed.
    bones = skeleton()
    has_child = {b[1] for b in bones if b[1]}
    rows, escaped, tips = [], [], []
    for name, parent, head, tail in bones:
        if name.startswith(("ik_", "pole_")):
            continue
        terminal = name not in has_child
        for label, p in (("head", Vector(head)), ("tail", Vector(tail))):
            ok, hits, clear = inside(obj, p)
            rows.append((name, label, ok, hits, clear))
            if ok:
                continue
            entry = (name, label, hits, tuple(round(c, 3) for c in p))
            if name == "root" or (terminal and label == "tail"):
                tips.append(entry)
            else:
                escaped.append(entry)

    print("\n===RIG_OVERLAY===")
    print(f"JOINT_POINTS_TESTED={len(rows)}")
    print(f"CONTAINED={sum(1 for r in rows if r[2])}")
    print(f"ESCAPED={len(escaped)}")
    # `root` sits under the belly as a transform handle and is expected outside.
    print(f"AT_SURFACE_BY_DESIGN={len(tips)}")
    for name, label, hits, p in tips:
        print(f"  {name}.{label} at {p} hit {hits}/6 — expected")
    for name, label, hits, p in escaped:
        print(f"  {name}.{label} at {p} hit {hits}/6 — NEEDS ATTENTION")
    real = escaped
    # Joints sitting on the skin deform badly even when technically inside.
    MIN_CLEAR = 0.006
    thin = [r for r in rows if r[2] and r[4] < MIN_CLEAR]
    if thin:
        print(f"TOO_CLOSE_TO_SURFACE={len(thin)}  (< {MIN_CLEAR * 1000:.0f} mm)")
        for name, label, _ok, _h, clear in thin:
            print(f"  {name}.{label}  {clear * 1000:.1f} mm — move inward")
    tight = sorted((r for r in rows if r[2]), key=lambda r: r[4])[:6]
    print("tightest contained joints (min clearance to the surface):")
    for name, label, _ok, _h, clear in tight:
        print(f"  {name}.{label}  {clear * 1000:5.1f} mm")
    print(f"VERDICT={'PASS' if not real and not thin else 'REVIEW'}")
    print("===RIG_OVERLAY_END===")


main()
