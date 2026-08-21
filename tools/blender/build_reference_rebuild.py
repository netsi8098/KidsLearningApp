"""
build_reference_rebuild.py — the reference-driven modelling scene.

Assembles `lion_reference_rebuild.blend`:

  * the three normalised orthographic views as LOCKED image empties, aligned
    mathematically rather than by eye — one ground plane, one height, one scale;
  * the CadQuery-lofted volume imported as a sculpting/retopology reference;
  * three orthographic cameras that frame each view exactly, so a render can be
    compared to its reference pixel for pixel.

ALIGNMENT CONTRACT
The normalised masks are 700x700 with the ground on row 620 and H = 520px. So
1px = 1/520 H, the image is 700/520 = 1.3462 H across, and its centre row maps to
Z = (620 - 350)/520 = 0.5192. Every empty and every camera is derived from those
four numbers, so nothing can drift out of register.

The turnaround was measured as NOT orthographically consistent — front, side and
rear disagreed by 11.8% in height and 26px in ground line. The normalised masks
already correct for that; the raw quadrants must not be used directly.

Run:
  blender --background --factory-startup \
    --python tools/blender/build_reference_rebuild.py
"""

import json
import math
import os
import sys

import bpy
from mathutils import Vector

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
VIEWS = os.path.join(REPO, "art", "blender", "references", "turnaround-views")
STL = os.path.join(REPO, "art", "cad", "lion_volume.stl")
BLEND_OUT = os.path.join(REPO, "art", "blender", "lion_reference_rebuild.blend")
SIL_DIR = os.path.join(REPO, "art", "blender", "references", "silhouette-qa")

CANVAS, HPX, GROUND_ROW = 700, 520, 620
PLANE_SPAN = CANVAS / HPX                       # 1.3462 H across
PLANE_CZ = (GROUND_ROW - CANVAS / 2) / HPX      # 0.5192 H
OFFSET = 1.25                                   # how far behind the model


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def import_volume():
    for op in ("stl_import", "wm.stl_import"):
        pass
    if hasattr(bpy.ops.wm, "stl_import"):
        bpy.ops.wm.stl_import(filepath=STL)
    else:
        bpy.ops.import_mesh.stl(filepath=STL)
    obj = bpy.context.selected_objects[0]
    obj.name = "LionVolume_CAD"
    me = obj.data
    # The loft is a tessellation, so it arrives faceted and with whatever winding
    # OCC produced. Recalculating and shading smooth makes it readable as a
    # volume; it is a reference, not a deformation mesh.
    for p in me.polygons:
        p.use_smooth = True
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.mesh.normals_make_consistent(inside=False)
    bpy.ops.object.mode_set(mode="OBJECT")

    mat = bpy.data.materials.new("ClayRef")
    mat.use_nodes = True
    b = mat.node_tree.nodes.get("Principled BSDF")
    b.inputs["Base Color"].default_value = (0.74, 0.72, 0.68, 1.0)
    b.inputs["Roughness"].default_value = 0.62
    me.materials.append(mat)

    pts = [v.co for v in me.vertices]
    print(f"[ref] volume: {len(me.vertices)} verts, "
          f"h={max(p.z for p in pts) - min(p.z for p in pts):.4f} "
          f"l={max(p.y for p in pts) - min(p.y for p in pts):.4f} "
          f"w={max(p.x for p in pts) - min(p.x for p in pts):.4f}")
    return obj


# (name, image, location, rotation) — derived, never eyeballed.
def reference_planes():
    specs = [
        # Front view sits BEHIND the model so it is read from +Y.
        ("REF_front", "front-norm.png", (0.0, -OFFSET, PLANE_CZ),
         (math.radians(90), 0.0, 0.0)),
        # Rear view sits in FRONT of the model, read from -Y.
        ("REF_rear", "rear-norm.png", (0.0, OFFSET, PLANE_CZ),
         (math.radians(90), 0.0, math.radians(180))),
        # Side view on +X, read from -X.
        #
        # Handedness matters and the first attempt got it backwards. A camera at
        # +X looking -X has its image-right along +Y, so the nose landed on the
        # right while the reference has it on the LEFT — the silhouette IoU came
        # out at 0.248 with equal missing and extra in every band, which is the
        # signature of a mirror rather than a shape error. Viewing from -X puts
        # image-right along -Y and the nose on the left, matching the reference.
        # The model is symmetric, so which flank is shown is immaterial.
        ("REF_side", "side-norm.png", (OFFSET, 0.0, PLANE_CZ),
         (math.radians(90), 0.0, math.radians(90))),
    ]
    made = []
    for name, fn, loc, rot in specs:
        path = os.path.join(VIEWS, fn)
        img = bpy.data.images.load(path)
        bpy.ops.object.empty_add(type="IMAGE", location=loc, rotation=rot)
        e = bpy.context.object
        e.name = name
        e.data = img
        e.empty_display_size = PLANE_SPAN
        e.empty_image_side = "DOUBLE_SIDED"
        e.empty_image_depth = "DEFAULT"
        e.use_empty_image_alpha = True
        e.color[3] = 0.55
        # LOCKED. An alignment that can be nudged is an alignment that will be.
        e.lock_location = (True, True, True)
        e.lock_rotation = (True, True, True)
        e.lock_scale = (True, True, True)
        e.hide_render = True
        made.append(e)
        print(f"[ref] {name} at {tuple(round(v, 4) for v in loc)} span {PLANE_SPAN:.4f}")
    return made


def ortho_cameras():
    """One orthographic camera per view, framing exactly the reference canvas."""
    specs = [
        ("CAM_front", (0.0, 3.0, PLANE_CZ), (math.radians(90), 0.0, math.radians(180))),
        ("CAM_rear", (0.0, -3.0, PLANE_CZ), (math.radians(90), 0.0, 0.0)),
        ("CAM_side", (-3.0, 0.0, PLANE_CZ), (math.radians(90), 0.0, math.radians(-90))),
    ]
    made = {}
    for name, loc, rot in specs:
        cd = bpy.data.cameras.new(name)
        cd.type = "ORTHO"
        cd.ortho_scale = PLANE_SPAN
        cam = bpy.data.objects.new(name, cd)
        cam.location = loc
        cam.rotation_euler = rot
        cam.lock_location = (True, True, True)
        cam.lock_rotation = (True, True, True)
        bpy.context.scene.collection.objects.link(cam)
        made[name] = cam
    return made


def render_silhouettes(obj, cams):
    """Render the volume as a flat white mask on black, per view.

    Emission and no lights: a silhouette comparison must not be affected by
    shading, and a lit render would put the model's own shadow into the mask.
    """
    os.makedirs(SIL_DIR, exist_ok=True)
    sc = bpy.context.scene
    sc.render.engine = "BLENDER_EEVEE"
    sc.render.resolution_x = sc.render.resolution_y = CANVAS
    sc.render.film_transparent = False
    sc.view_settings.view_transform = "Standard"

    w = bpy.data.worlds.new("Black")
    w.use_nodes = True
    w.node_tree.nodes["Background"].inputs[0].default_value = (0, 0, 0, 1)
    w.node_tree.nodes["Background"].inputs[1].default_value = 0.0
    sc.world = w

    flat = bpy.data.materials.new("FlatWhite")
    flat.use_nodes = True
    nt = flat.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    em = nt.nodes.new("ShaderNodeEmission")
    em.inputs[0].default_value = (1, 1, 1, 1)
    em.inputs[1].default_value = 1.0
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    nt.links.new(em.outputs[0], out.inputs[0])

    keep = list(obj.data.materials)
    obj.data.materials.clear()
    obj.data.materials.append(flat)

    for view, cam in (("front", "CAM_front"), ("side", "CAM_side"), ("rear", "CAM_rear")):
        sc.camera = cams[cam]
        sc.render.filepath = os.path.join(SIL_DIR, f"model-{view}.png")
        bpy.ops.render.render(write_still=True)

    obj.data.materials.clear()
    for m in keep:
        obj.data.materials.append(m)


def main():
    reset()
    obj = import_volume()
    reference_planes()
    cams = ortho_cameras()
    render_silhouettes(obj, cams)

    os.makedirs(os.path.dirname(BLEND_OUT), exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=BLEND_OUT)

    print("\n===REFERENCE_REBUILD===")
    print(f"BLEND={BLEND_OUT}")
    print(f"PLANE_SPAN={PLANE_SPAN:.4f} PLANE_CZ={PLANE_CZ:.4f}")
    print(f"CANVAS={CANVAS} H_PX={HPX} GROUND_ROW={GROUND_ROW}")
    print(f"SILHOUETTES={SIL_DIR}")
    print("===REFERENCE_REBUILD_END===")


if __name__ == "__main__":
    main()
