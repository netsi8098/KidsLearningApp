"""
retopo_lion.py — Priority B: animation-ready topology.

The blockout is a voxel remesh: ~64,000 uniform triangles with no edge flow.
That is fine for judging silhouette and useless for rigging — deformation needs
loops that run AROUND joints so a bend compresses evenly instead of collapsing.

This runs Quadriflow, Blender's field-aligned quad remesher, over the locked
blockout to produce quad topology at a runtime-sensible density.

WHAT THIS IS, HONESTLY
  Quadriflow aligns edge flow to surface curvature. On a character that gives
  loops that broadly follow the forms — around the muzzle, the limbs, the neck —
  because those are the curvature features. It is a genuine improvement over
  voxel triangles and it is riggable.

  It is NOT hand retopology. A human retopologist places loops with knowledge of
  where the JOINTS are, not merely where the curvature is, and adds density
  exactly at the jaw, eyelids and elbows. Quadriflow cannot know a hock from a
  bulge. Where it under-serves a joint, that is corrected afterwards rather than
  pretended away.

  The report at the end measures quad ratio, poly count and silhouette deviation
  so the result is judged on numbers, not vibes.

Run:
  blender --background art/blender/lion_silhouette.blend \
    --factory-startup --python tools/blender/retopo_lion.py

Outputs:
  art/blender/lion_retopo.blend
  docs/assets/lion-retopo/{front,side,rear,three-quarter,wireframe}.png
"""

import math
import os

import bpy
from mathutils import Vector

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
BLEND_OUT = os.path.join(REPO, "art", "blender", "lion_retopo.blend")
PREVIEW_DIR = os.path.join(REPO, "docs", "assets", "lion-retopo")

# A stylised hero character for the web. Dense enough to deform smoothly at the
# jaw and limbs, light enough that the whole scene stays inside budget once the
# environment's 85k is accounted for.
#
# Raised from 7000 after the first run DROPPED THE TAIL: quad edge length was
# longer than the tail was thick, so the shaft vanished and left the tuft as a
# floating island. Thin features must clear the remesher's sampling resolution.
TARGET_FACES = 8500


def measure(obj, label):
    deps = bpy.context.evaluated_depsgraph_get()
    ev = obj.evaluated_get(deps)
    me = ev.to_mesh()
    me.calc_loop_triangles()
    pts = [obj.matrix_world @ v.co for v in me.vertices]
    data = {
        "verts": len(me.vertices),
        "faces": len(me.polygons),
        "tris": len(me.loop_triangles),
        "quads": sum(1 for p in me.polygons if len(p.vertices) == 4),
        "ngons": sum(1 for p in me.polygons if len(p.vertices) > 4),
        "height": max(p.z for p in pts) - min(p.z for p in pts),
        "length": max(p.y for p in pts) - min(p.y for p in pts),
        "width": max(p.x for p in pts) - min(p.x for p in pts),
    }
    ev.to_mesh_clear()
    print(f"[{label}] verts={data['verts']} faces={data['faces']} tris={data['tris']} "
          f"quads={data['quads']} ngons={data['ngons']} "
          f"h={data['height']:.3f} l={data['length']:.3f} w={data['width']:.3f}")
    return data


def retopologize(obj):
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj

    bpy.ops.object.quadriflow_remesh(
        target_faces=TARGET_FACES,
        use_preserve_sharp=False,      # a stylised cub has no hard edges
        use_preserve_boundary=False,
        use_mesh_symmetry=True,        # the character is symmetric; enforce it
        smooth_normals=True,
        mode="FACES",
    )
    return bpy.context.view_layer.objects.active


def restore_silhouette(retopo, source):
    """Pull the retopo mesh back onto the blockout surface.

    Quadriflow approximates, so corners and small forms (ears, nose, paw fronts)
    drift inward slightly. A shrinkwrap onto the original recovers the silhouette
    that was just approved — losing it during a topology step would quietly undo
    the whole proportion pass.
    """
    sw = retopo.modifiers.new("SilhouetteRecover", "SHRINKWRAP")
    sw.target = source
    sw.wrap_method = "NEAREST_SURFACEPOINT"
    sw.offset = 0.0
    bpy.ops.object.select_all(action="DESELECT")
    retopo.select_set(True)
    bpy.context.view_layer.objects.active = retopo
    bpy.ops.object.modifier_apply(modifier=sw.name)

    # Very light relaxation to remove shrinkwrap chatter without eating form.
    sm = retopo.modifiers.new("Relax", "SMOOTH")
    sm.factor = 0.22
    sm.iterations = 2
    bpy.ops.object.modifier_apply(modifier=sm.name)


def render_views(obj):
    sc = bpy.context.scene
    sc.render.engine = "BLENDER_EEVEE_NEXT" if "BLENDER_EEVEE_NEXT" in {
        i.identifier for i in bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items
    } else "BLENDER_EEVEE"
    sc.render.resolution_x = 900
    sc.render.resolution_y = 900
    sc.view_settings.view_transform = "Standard"
    os.makedirs(PREVIEW_DIR, exist_ok=True)

    cam = bpy.data.objects.get("StudyCam")
    if cam is None:
        cam_data = bpy.data.cameras.new("StudyCam")
        cam_data.lens = 55.0
        cam = bpy.data.objects.new("StudyCam", cam_data)
        sc.collection.objects.link(cam)
    sc.camera = cam

    target = Vector((0.0, 0.02, 0.60))
    dist = 2.35
    views = {
        "front": (math.radians(180), 0.16),
        "side": (math.radians(90), 0.16),
        "rear": (math.radians(0), 0.16),
        "three-quarter": (math.radians(228), 0.26),
    }
    for name, (yaw, elev) in views.items():
        cam.location = (target.x + math.sin(yaw) * dist,
                        target.y - math.cos(yaw) * dist,
                        target.z + dist * elev)
        cam.rotation_euler = (target - cam.location).to_track_quat("-Z", "Y").to_euler()
        sc.render.filepath = os.path.join(PREVIEW_DIR, f"{name}.png")
        bpy.ops.render.render(write_still=True)

    # Wireframe pass — topology has to be inspectable, not taken on trust.
    sc.render.use_freestyle = False
    wire = obj.modifiers.new("WireView", "WIREFRAME")
    wire.thickness = 0.0035
    wire.use_replace = False
    cam.location = (target.x + math.sin(math.radians(228)) * dist,
                    target.y - math.cos(math.radians(228)) * dist,
                    target.z + dist * 0.26)
    cam.rotation_euler = (target - cam.location).to_track_quat("-Z", "Y").to_euler()
    sc.render.filepath = os.path.join(PREVIEW_DIR, "wireframe.png")
    bpy.ops.render.render(write_still=True)
    obj.modifiers.remove(wire)


def main():
    src = bpy.data.objects.get("LionBody")
    if src is None:
        raise SystemExit("LionBody not found — run build_lion_silhouette.py first")

    before = measure(src, "blockout")

    # Keep an untouched copy as the shrinkwrap target and as a visual reference.
    original = src.copy()
    original.data = src.data.copy()
    original.name = "LionBlockout_Reference"
    bpy.context.scene.collection.objects.link(original)
    original.hide_render = True
    original.hide_viewport = True

    retopo = retopologize(src)
    retopo.name = "LionBody_Retopo"
    restore_silhouette(retopo, original)

    after = measure(retopo, "retopo")

    quad_ratio = after["quads"] / after["faces"] if after["faces"] else 0.0
    h_dev = abs(after["height"] - before["height"]) / before["height"]
    l_dev = abs(after["length"] - before["length"]) / before["length"]
    w_dev = abs(after["width"] - before["width"]) / before["width"]

    os.makedirs(os.path.dirname(BLEND_OUT), exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=BLEND_OUT)
    render_views(retopo)
    bpy.ops.wm.save_as_mainfile(filepath=BLEND_OUT)

    print("\n===LION_RETOPO===")
    print(f"BLEND={BLEND_OUT}")
    print(f"FACES_BEFORE={before['faces']} FACES_AFTER={after['faces']}")
    print(f"TRIS_BEFORE={before['tris']} TRIS_AFTER={after['tris']}")
    print(f"QUAD_RATIO={quad_ratio:.4f}")
    print(f"NGONS={after['ngons']}")
    print(f"SILHOUETTE_DEV_H={h_dev:.4f} L={l_dev:.4f} W={w_dev:.4f}")
    print("===LION_RETOPO_END===")


if __name__ == "__main__":
    main()
