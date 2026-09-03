"""
face_placement.py — GATE 15. Put the measured face onto the built surface.

WHY THIS EXISTS
`tools/cad/measure_face.py` measures the face from the FRONT view, so it knows
each feature's x and its height h. It cannot know depth: y never appears in a
front elevation. The current cage supplies y as four hand-picked literals.

Two of them are wrong, and wrong in a way nothing reported. `socket()` looks for
faces within a 52 mm sphere of its target and falls back to `nearest_face()`
when it finds none — a fallback that always succeeds, so an off-surface target
produces a socket somewhere rather than an error. The build log is the only
tell: a target on the surface reports 2 or 6 centre faces, and the two brow
targets report 1 each.

So depth is MEASURED here instead: for each feature, ray-cast inward at the
measured (x, h) and take the head surface's own y. A socket target then sits on
the surface by construction and `faces_near` cannot miss it.

WHAT IT DOES NOT DO
It does not build the face. It reports the placement the builder should use,
and how far the current literals are from it. Geometry comes next.

Run:
  blender --background art/blender/lion_cage.blend --factory-startup \
    --python tools/blender/face_placement.py

Outputs:
  art/blender/references/turnaround-views/face_placement.json
"""

import json
import os
import sys

import bpy
from mathutils import Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
VIEWS = os.path.join(REPO, "art", "blender", "references", "turnaround-views")
FACE_JSON = os.path.join(VIEWS, "face_model.json")
OUT_JSON = os.path.join(VIEWS, "face_placement.json")

# What the cage currently uses, so the report can state the delta rather than
# leaving a reader to diff two files by hand. (x, y, z) in cage units, with the
# z offsets resolved against HEAD_CAGE_Z = 0.604.
HEAD_CAGE_Z = 0.604
CURRENT = {
    "eye":   (0.095, 0.578, HEAD_CAGE_Z + 0.048),
    "brow":  (0.072, 0.552, HEAD_CAGE_Z + 0.108),
    "mouth": (0.000, 0.610, HEAD_CAGE_Z - 0.112),
}


def head_object():
    for name in ("LionCage", "Lion", "LionBody"):
        ob = bpy.data.objects.get(name)
        if ob and ob.type == "MESH":
            return ob
    meshes = [o for o in bpy.data.objects if o.type == "MESH"]
    if not meshes:
        raise SystemExit("[face] no mesh in the scene")
    return max(meshes, key=lambda o: len(o.data.vertices))


def surface_y(ob, x, z, y_start=1.4):
    """The head's front surface y at (x, z), by ray-cast.

    Cast from well in front of the nose straight back. The FIRST hit is the
    outer surface, which is the one a socket belongs on. Returns None when the
    ray misses entirely — which is itself a finding, not something to paper
    over with a guess.
    """
    origin = Vector((x, y_start, z))
    direction = Vector((0.0, -1.0, 0.0))
    hit, loc, normal, _ = ob.ray_cast(origin, direction)
    if not hit:
        return None, None
    return loc.y, normal


def main():
    if not os.path.exists(FACE_JSON):
        raise SystemExit(f"[face] {FACE_JSON} missing — run tools/cad/measure_face.py")
    fm = json.load(open(FACE_JSON))

    ob = head_object()
    ob.data.calc_loop_triangles()

    # Measured (x, h) per feature. Signed x is taken from the pair; midline
    # features carry x = 0 by measurement (nose -0.0031, mouth -0.0040, both
    # inside a third of a pixel of the axis).
    wanted = []
    eye = fm["eye"]["pupil"]
    wanted.append(("eye", abs(eye["x_H_abs"]), eye["h"]))
    if fm.get("brow"):
        wanted.append(("brow", abs(fm["brow"]["x_H_abs"]), fm["brow"]["h"]))
    if fm.get("nose_pad"):
        wanted.append(("nose_pad", 0.0, fm["nose_pad"]["h"]))
    if fm.get("nostril"):
        wanted.append(("nostril", abs(fm["nostril"]["x_H_abs"]), fm["nostril"]["h"]))
    if fm.get("mouth_line"):
        wanted.append(("mouth", 0.0, fm["mouth_line"]["h"]))

    out = {"head_object": ob.name, "head_cage_z": HEAD_CAGE_Z, "features": {}}

    print("===FACE_PLACEMENT===")
    print(f"MESH {ob.name}  verts={len(ob.data.vertices)}")
    print("")
    print("feature      measured x      h      surface y   normal.y   "
          "current (x, y, z)            dx      dy      dz")
    for name, x, z in wanted:
        y, normal = surface_y(ob, x, z)
        rec = {"x": round(x, 5), "h": round(z, 5)}
        if y is None:
            rec["surface_y"] = None
            rec["note"] = "ray missed the head at this (x, h)"
            out["features"][name] = rec
            print(f"{name:12s} {x:+.4f}  {z:.4f}   RAY MISSED")
            continue
        rec["surface_y"] = round(y, 5)
        rec["normal_y"] = round(normal.y, 4)
        cur = CURRENT.get(name)
        line = (f"{name:12s} {x:+.4f}  {z:.4f}   {y:+.4f}     "
                f"{normal.y:+.3f}    ")
        if cur:
            dx, dy, dz = x - cur[0], y - cur[1], z - cur[2]
            rec["current"] = [round(v, 5) for v in cur]
            rec["delta"] = [round(dx, 5), round(dy, 5), round(dz, 5)]
            # x1000: model units are metres, matching every other metric in
            # this pipeline. An earlier version used 1300/0.847 to express
            # "mm on the shipped 1.30 m character" and inflated everything by
            # 1.535x, making these deltas incomparable with the rig's own
            # millimetres.
            rec["delta_mm"] = [round(v * 1000.0, 1) for v in (dx, dy, dz)]
            line += (f"({cur[0]:+.3f}, {cur[1]:+.3f}, {cur[2]:+.3f})    "
                     f"{dx:+.4f} {dy:+.4f} {dz:+.4f}")
        else:
            line += "— no current socket —"
        print(line)
        out["features"][name] = rec

    print("")
    # Restate the placement facts in model millimetres.
    for name in ("eye", "brow", "mouth"):
        rec = out["features"].get(name)
        if not rec or "delta_mm" not in rec:
            continue
        dx, dy, dz = rec["delta_mm"]
        worst = max(abs(dx), abs(dy), abs(dz))
        verdict = "OK" if worst < 8 else ("MOVE" if worst < 40 else "MOVE — LARGE")
        print(f"{name:8s} worst axis {worst:6.1f} mm  ->  {verdict}")
    print("===FACE_PLACEMENT_END===")

    with open(OUT_JSON, "w") as fh:
        json.dump(out, fh, indent=2)
    print(f"[face] wrote {OUT_JSON}")


if __name__ == "__main__":
    main()
