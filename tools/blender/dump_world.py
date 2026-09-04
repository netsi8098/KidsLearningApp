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

import bpy
from mathutils import Vector

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(REPO, "art", "blender", "world_objects.json")


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
    cam = bpy.context.scene.camera
    data = {
        "objects": objs,
        "markers": markers,
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
    print("===WORLD_DUMP_END===")


if __name__ == "__main__":
    main()
