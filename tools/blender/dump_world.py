"""
dump_world.py — write the world's measurable facts to JSON.

Splits `bpy` from the judging, the same way `silhouette_render.py` splits from
`silhouette_qa.py`. Blender emits measurements; `tools/cad/world_audit.py`
decides whether they are acceptable. That separation is what lets the audit run
in a second from the same python as the rest of `tools/cad`, and what lets its
target table be argued with without opening Blender.

Run:
  blender --background art/blender/home_environment.blend --factory-startup \
    --python tools/blender/dump_world.py
"""
import json
import os
import re

import bpy
from mathutils import Vector

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(REPO, "art", "blender", "world_objects.json")


# Markers whose whole purpose is to have SKY behind them, and what they are
# for. `build_home_environment.py` authors TitleZoneHero as "title in the sky
# above the lion"; if scenery grows in front of it the React title lands on
# foliage and the composition the camera was framed for is gone.
SKY_MARKERS = {
    "MARK_TitleZoneHero": "the title, in the sky above the lion",
    "MARK_TitleZone": "the title in the wide framing",
    "MARK_LionSpawn": "the character itself — nothing may stand in front of it",
    "MARK_CardShelfZone": "the card row",
}


def composition():
    """WHAT THE CAMERA ACTUALLY SEES, which the scale gate cannot tell you.

    Heights measured against the character say whether a tree is the right
    size. They say nothing about whether it is in the way, and the first pass
    that made the trees correct also turned the top 45% of the production frame
    into a green ceiling — the sky gone, the rainbow chopped into fragments
    behind canopies, and MARK_TitleZoneHero, authored as "title in the sky
    above the lion", with no sky left above the lion.

    Two measurements, both from the locked production camera:

      * OCCLUSION, by ray cast from the camera to each marker that needs sky
        behind it. Exact, cheap, and it encodes the marker's own purpose rather
        than a pixel heuristic. A hit before the marker means something grew in
        front of it.
      * FOLIAGE COVERAGE of the frame's top third, sampled on a grid of rays.
        A number for "how much sky is left", which is the thing that was lost.
    """
    import math as _m
    sc = bpy.context.scene
    cam = bpy.data.objects.get("CAM_Home_Main") or sc.camera
    if cam is None:
        return {}
    dg = bpy.context.evaluated_depsgraph_get()
    origin = cam.matrix_world.translation.copy()

    FOLIAGE = ("Tree", "Canopy", "Blossom", "Clump", "Branch", "Bush", "Foliage")
    occluded = {}
    for name, why in SKY_MARKERS.items():
        m = bpy.data.objects.get(name)
        if m is None:
            continue
        to = m.matrix_world.translation
        d = to - origin
        dist = d.length
        if dist < 1e-6:
            continue
        hit, loc, _n, _i, obj, _mw = sc.ray_cast(dg, origin, d.normalized())
        # A hit short of the marker is something standing in front of it. The
        # 0.15 m slack keeps the ground the marker is seated on from counting.
        blocked = bool(hit) and (loc - origin).length < dist - 0.15
        occluded[name] = {
            "blocked": blocked,
            "by": obj.name if (blocked and obj) else "",
            "why": why,
        }

    # Foliage coverage of the top third, on an 18 x 24 grid of camera rays.
    # Rays rather than a render, so this needs no compositing pass and cannot
    # disagree with the geometry the rest of the file measured.
    cam_data = cam.data
    aspect = sc.render.resolution_x / max(1, sc.render.resolution_y)
    half_v = _m.atan(cam_data.sensor_height / 2.0 / cam_data.lens) if cam_data.sensor_fit == "VERTICAL" \
        else _m.atan(cam_data.sensor_width / 2.0 / cam_data.lens / aspect)
    half_h = _m.atan(_m.tan(half_v) * aspect)
    fwd = cam.matrix_world.to_quaternion() @ Vector((0.0, 0.0, -1.0))
    right = cam.matrix_world.to_quaternion() @ Vector((1.0, 0.0, 0.0))
    up = cam.matrix_world.to_quaternion() @ Vector((0.0, 1.0, 0.0))

    cover = {"top_third": 0, "top_third_n": 0, "whole": 0, "whole_n": 0}
    blame = {}
    for iy in range(24):
        # v runs 1 at the top of frame to -1 at the bottom.
        v = 1.0 - (iy + 0.5) / 24 * 2.0
        for ix in range(18):
            u = -1.0 + (ix + 0.5) / 18 * 2.0
            d = (fwd + right * (_m.tan(half_h) * u) + up * (_m.tan(half_v) * v)).normalized()
            hit, _l, _n, _i, obj, _mw = sc.ray_cast(dg, origin, d)
            leafy = bool(hit) and obj is not None and any(t in obj.name for t in FOLIAGE)
            cover["whole_n"] += 1
            cover["whole"] += 1 if leafy else 0
            if v > 1.0 - 2.0 / 3.0:      # the top third of the frame
                cover["top_third_n"] += 1
                cover["top_third"] += 1 if leafy else 0
                if leafy:
                    # WHICH TREE, by its root name. A coverage figure says the
                    # sky is gone; it does not say what to move, and guessing
                    # that from a render is the whole habit this pipeline keeps
                    # paying for.
                    root = re.sub(r"_(Trunk|Canopy|Blossom|Clump|Branch|RootFlare)"
                                  r"(_\d+)?$", "", obj.name)
                    blame[root] = blame.get(root, 0) + 1

    # THE RAINBOW'S ARC, sampled directly.
    #
    # This replaces guessing at the harm from a coverage figure. What the green
    # ceiling actually cost was the rainbow — chopped into fragments behind
    # canopies — and the rainbow is a torus at a known centre and radius, so
    # its visible fraction can be measured rather than inferred. A ray to a
    # point on the arc that hits something nearer is a point of rainbow the
    # child does not see.
    #
    # Sampled on the OUTERMOST band, which is the one that disappears first,
    # and only over the upper half of the arc, because `build_rainbow` sinks
    # the lower halves below the horizon on purpose.
    rb = [o for o in bpy.data.objects
          if o.type == "MESH" and o.name.startswith("ENV_Rainbow")]
    arc = {"visible": 0, "n": 0, "blocked_by": {}, "by_foliage": 0, "by_scenery": 0}
    if rb:
        outer = max(rb, key=lambda o: max(
            (o.matrix_world @ Vector(c)).x for c in o.bound_box))
        bb = [outer.matrix_world @ Vector(c) for c in outer.bound_box]
        c = sum(bb, Vector()) / len(bb)
        radius = (max(p.x for p in bb) - min(p.x for p in bb)) / 2.0
        for k in range(37):                       # 5-degree steps, 0..180
            a = _m.pi * k / 36.0
            pt = Vector((c.x + _m.cos(a) * radius, c.y, c.z + _m.sin(a) * radius))
            if pt.z < c.z:                        # below the arc's own centre
                continue
            d = pt - origin
            if d.length < 1e-6:
                continue
            arc["n"] += 1
            hit, loc, _n, _i, obj, _mw = sc.ray_cast(dg, origin, d.normalized())
            reach = (not hit) or (loc - origin).length >= d.length - 0.3
            if reach:
                arc["visible"] += 1
            elif obj is not None:
                key = re.sub(r"_(Trunk|Canopy|Blossom|Clump|Branch|RootFlare)"
                             r"(_\d+)?$", "", obj.name)
                arc["blocked_by"][key] = arc["blocked_by"].get(key, 0) + 1
                # WHO IS ALLOWED TO BLOCK IT MATTERS, and this is the whole
                # reason a coverage figure was the wrong gate. `build_rainbow`
                # sinks the arc's lower halves "below the horizon line and
                # behind the distant hills" on purpose, and a rainbow passing
                # behind a cloud is the look, not a defect. A rainbow chopped
                # up by tree crowns is the defect. Counted separately so the
                # gate can be about the harm rather than about pixels.
                if any(t in obj.name for t in FOLIAGE):
                    arc["by_foliage"] += 1
                else:
                    arc["by_scenery"] += 1

    return {
        "camera": cam.name,
        "occlusion": occluded,
        "rainbow_visible": round(arc["visible"] / arc["n"], 4) if arc["n"] else None,
        "rainbow_by_foliage": round(arc["by_foliage"] / arc["n"], 4) if arc["n"] else None,
        "rainbow_by_scenery": round(arc["by_scenery"] / arc["n"], 4) if arc["n"] else None,
        "rainbow_samples": arc["n"],
        "rainbow_blocked_by": sorted(arc["blocked_by"].items(), key=lambda kv: -kv[1]),
        "foliage_top_third": round(cover["top_third"] / max(1, cover["top_third_n"]), 4),
        "foliage_frame": round(cover["whole"] / max(1, cover["whole_n"]), 4),
        "top_third_by": sorted(
            ({"name": k, "share": round(v / max(1, cover["top_third_n"]), 4)}
             for k, v in blame.items()),
            key=lambda d: -d["share"]),
    }


def main():
    objs = []
    for o in bpy.data.objects:
        if o.type != "MESH":
            continue
        bb = [o.matrix_world @ Vector(c) for c in o.bound_box]
        lo = Vector((min(p.x for p in bb), min(p.y for p in bb), min(p.z for p in bb)))
        hi = Vector((max(p.x for p in bb), max(p.y for p in bb), max(p.z for p in bb)))
        o.data.calc_loop_triangles()
        objs.append({
            "name": o.name,
            "collection": o.users_collection[0].name if o.users_collection else "",
            "height": round(hi.z - lo.z, 5),
            "width": round(max(hi.x - lo.x, hi.y - lo.y), 5),
            "base_z": round(lo.z, 5),
            "centre": [round(v, 5) for v in ((lo + hi) / 2.0)],
            "tris": len(o.data.loop_triangles),
            "material": o.data.materials[0].name if o.data.materials else "",
        })

    markers = {o.name: [round(v, 5) for v in o.matrix_world.translation]
               for o in bpy.data.objects if o.type == "EMPTY"}
    compose = composition()
    cam = bpy.context.scene.camera
    data = {
        "objects": objs,
        "markers": markers,
        "composition": compose,
        "camera": ({"name": cam.name,
                    "location": [round(v, 5) for v in cam.location],
                    "lens": cam.data.lens} if cam else None),
        "materials": [m.name for m in bpy.data.materials],
        "tris": sum(o["tris"] for o in objs),
    }
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w") as f:
        json.dump(data, f, indent=1)
    print("===WORLD_DUMP===")
    print(f"JSON={OUT}")
    print(f"OBJECTS={len(objs)}  TRIS={data['tris']}  "
          f"MATERIALS={len(data['materials'])}  MARKERS={len(markers)}")
    if compose:
        print(f"FOLIAGE_TOP_THIRD={compose['foliage_top_third']:.3f}  "
              f"FOLIAGE_FRAME={compose['foliage_frame']:.3f}  "
              f"RAINBOW_VISIBLE={compose.get('rainbow_visible')} "
              f"(foliage {compose.get('rainbow_by_foliage')}, "
              f"scenery {compose.get('rainbow_by_scenery')})")
        for n, o in compose["occlusion"].items():
            if o["blocked"]:
                print(f"OCCLUDED {n} by {o['by']}")
    print("===WORLD_DUMP_END===")


if __name__ == "__main__":
    main()
