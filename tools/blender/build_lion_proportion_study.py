"""Create an offline proportion study for the approved quadruped lion.

This is a silhouette and identity checkpoint, not the production mesh. It does
not export a GLB and is intentionally disconnected from the React application.

Run with:
  blender --background --factory-startup --python tools/blender/build_lion_proportion_study.py
"""

from __future__ import annotations

import math
from pathlib import Path

import bpy
from mathutils import Vector


ROOT = Path(__file__).resolve().parents[2]
BLEND_PATH = ROOT / "art/blender/lion_proportion_study.blend"
PREVIEW_DIR = ROOT / "docs/assets/lion-proportion-study"
PREVIEW_DIR.mkdir(parents=True, exist_ok=True)
BLEND_PATH.parent.mkdir(parents=True, exist_ok=True)


def clear_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for collection in (
        bpy.data.meshes,
        bpy.data.curves,
        bpy.data.materials,
        bpy.data.cameras,
        bpy.data.lights,
    ):
        for block in list(collection):
            if block.users == 0:
                collection.remove(block)


def make_material(name, color, roughness=0.62):
    material = bpy.data.materials.new(name)
    material.diffuse_color = (*color, 1.0)
    material.use_nodes = True
    shader = material.node_tree.nodes.get("Principled BSDF")
    shader.inputs["Base Color"].default_value = (*color, 1.0)
    shader.inputs["Roughness"].default_value = roughness
    return material


def smooth_object(obj):
    for polygon in obj.data.polygons:
        polygon.use_smooth = True
    return obj


def ellipsoid(
    name,
    location,
    scale,
    material,
    rotation=(0.0, 0.0, 0.0),
    segments=40,
    rings=28,
    deform=None,
):
    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=segments,
        ring_count=rings,
        location=location,
        rotation=rotation,
    )
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if deform:
        for vertex in obj.data.vertices:
            vertex.co = deform(vertex.co.copy())
    obj.data.materials.append(material)
    smooth_object(obj)
    return obj


def cylinder_between(name, start, end, radius, material):
    start_vector = Vector(start)
    end_vector = Vector(end)
    direction = end_vector - start_vector
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=32,
        radius=radius,
        depth=direction.length,
        location=(start_vector + end_vector) * 0.5,
    )
    obj = bpy.context.object
    obj.name = name
    obj.rotation_mode = "QUATERNION"
    obj.rotation_quaternion = Vector((0.0, 0.0, 1.0)).rotation_difference(direction.normalized())
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.data.materials.append(material)
    smooth_object(obj)
    return obj


def make_curve(name, points, bevel_depth, material):
    curve_data = bpy.data.curves.new(name, type="CURVE")
    curve_data.dimensions = "3D"
    curve_data.resolution_u = 8
    curve_data.bevel_resolution = 5
    curve_data.bevel_depth = bevel_depth
    spline = curve_data.splines.new("BEZIER")
    spline.bezier_points.add(len(points) - 1)
    for point, coordinate in zip(spline.bezier_points, points):
        point.co = coordinate
        point.handle_left_type = "AUTO"
        point.handle_right_type = "AUTO"
    obj = bpy.data.objects.new(name, curve_data)
    bpy.context.collection.objects.link(obj)
    curve_data.materials.append(material)
    return obj


def pear_face(coordinate):
    normalized_z = coordinate.z / 0.70
    cheek_bulge = 0.10 * math.exp(-((normalized_z + 0.18) / 0.42) ** 2)
    crown_taper = 0.07 * max(0.0, normalized_z)
    jaw_taper = 0.15 * max(0.0, -normalized_z - 0.30)
    coordinate.x *= 1.0 + cheek_bulge - crown_taper - jaw_taper
    if coordinate.y < 0.0:
        coordinate.y *= 0.94
    return coordinate


def mane_clump(coordinate):
    normalized_z = max(-1.0, min(1.0, coordinate.z / 0.45))
    taper = 0.72 + 0.28 * (1.0 - max(0.0, normalized_z))
    coordinate.x *= taper
    coordinate.y *= 0.90 + 0.10 * taper
    return coordinate


def add_leg(prefix, x, y, front, coat, cream):
    if front:
        shoulder = (x, y, 1.39)
        elbow = (x, y - 0.035, 0.84)
        wrist = (x, y - 0.015, 0.31)
        paw_center = (x, y - 0.10, 0.15)
        upper_radius, lower_radius = 0.19, 0.145
        ellipsoid(f"{prefix}_shoulder", shoulder, (0.27, 0.29, 0.34), coat)
    else:
        hip = (x, y, 1.24)
        knee = (x, y - 0.13, 0.82)
        hock = (x, y + 0.08, 0.39)
        paw_center = (x, y - 0.08, 0.15)
        ellipsoid(f"{prefix}_hip", hip, (0.31, 0.36, 0.34), coat)
        cylinder_between(f"{prefix}_thigh", hip, knee, 0.23, coat)
        ellipsoid(f"{prefix}_knee", knee, (0.23, 0.24, 0.24), coat)
        cylinder_between(f"{prefix}_hock", knee, hock, 0.155, coat)
        cylinder_between(f"{prefix}_lower", hock, paw_center, 0.135, coat)
        ellipsoid(f"{prefix}_paw", paw_center, (0.27, 0.26, 0.17), coat)
        for toe_index, offset in enumerate((-0.085, 0.0, 0.085)):
            ellipsoid(
                f"{prefix}_toe_{toe_index}",
                (x + offset, paw_center[1] - 0.225, 0.18),
                (0.050, 0.028, 0.035),
                cream,
                segments=20,
                rings=12,
            )
        return

    cylinder_between(f"{prefix}_upper", shoulder, elbow, upper_radius, coat)
    ellipsoid(f"{prefix}_elbow", elbow, (0.19, 0.20, 0.20), coat)
    cylinder_between(f"{prefix}_lower", elbow, wrist, lower_radius, coat)
    ellipsoid(f"{prefix}_paw", paw_center, (0.29, 0.27, 0.18), coat)
    for toe_index, offset in enumerate((-0.09, 0.0, 0.09)):
        ellipsoid(
            f"{prefix}_toe_{toe_index}",
            (x + offset, paw_center[1] - 0.235, 0.19),
            (0.052, 0.030, 0.038),
            cream,
            segments=20,
            rings=12,
        )


def build_lion():
    coat = make_material("Golden Coat", (0.94, 0.51, 0.075))
    face_gold = make_material("Face Gold", (1.0, 0.64, 0.16))
    cream = make_material("Warm Cream", (1.0, 0.79, 0.48))
    mane = make_material("Auburn Mane", (0.28, 0.052, 0.012))
    mane_highlight = make_material("Mane Highlight", (0.50, 0.13, 0.022))
    dark = make_material("Features", (0.075, 0.022, 0.012), 0.42)
    iris = make_material("Warm Iris", (0.39, 0.105, 0.025), 0.36)
    white = make_material("Eye White", (1.0, 0.985, 0.94), 0.34)
    pink = make_material("Ear Pink", (0.95, 0.29, 0.23))

    # Compact quadruped silhouette: a readable horizontal back, deep chest, and
    # rounded rump. Overlap is intentional at this checkpoint so the body reads
    # as one mass instead of three stacked toys.
    ellipsoid("Torso", (0.0, 0.14, 1.19), (0.61, 0.74, 0.56), coat)
    ellipsoid("Chest", (0.0, -0.42, 1.32), (0.64, 0.55, 0.65), coat)
    ellipsoid("Rump", (0.0, 0.61, 1.20), (0.58, 0.55, 0.55), coat)
    ellipsoid("ChestCream", (0.0, -0.91, 1.31), (0.34, 0.07, 0.40), cream)

    # Four visibly grounded legs and large soft paws.
    add_leg("FrontLeg_L", 0.39, -0.47, True, coat, cream)
    add_leg("FrontLeg_R", -0.39, -0.47, True, coat, cream)
    add_leg("RearLeg_L", 0.39, 0.57, False, coat, cream)
    add_leg("RearLeg_R", -0.39, 0.57, False, coat, cream)

    # The mane begins as a continuous hood. Swept clumps overlap that base to
    # break the silhouette without creating the previous bead necklace effect.
    ellipsoid("ManeBase", (0.0, -0.90, 2.10), (0.93, 0.40, 0.92), mane)
    ellipsoid("Head", (0.0, -1.25, 2.10), (0.70, 0.54, 0.66), face_gold, deform=pear_face)
    for index in range(12):
        angle = math.tau * index / 12
        x = math.cos(angle) * 0.79
        z = 2.08 + math.sin(angle) * 0.77
        width_variation = 0.28 + 0.035 * math.sin(index * 1.9)
        height_variation = 0.46 + 0.055 * math.cos(index * 1.7)
        petal_scale = (width_variation, 0.23, height_variation)
        ellipsoid(
            f"ManePetal_{index:02d}",
            (x, -1.00, z),
            petal_scale,
            mane_highlight if index in (3, 4) else mane,
            rotation=(0.0, 0.0, -angle + math.pi / 2),
            segments=28,
            rings=18,
            deform=mane_clump,
        )

    for index, (x, angle, height) in enumerate(((-0.21, -0.34, 0.38), (0.0, 0.0, 0.48), (0.21, 0.34, 0.38))):
        ellipsoid(
            f"TopTuft_{index}",
            (x, -1.04, 2.84 + (0.09 if index == 1 else 0.0)),
            (0.20, 0.19, height),
            mane_highlight,
            rotation=(0.0, 0.0, angle),
            segments=28,
            rings=18,
            deform=mane_clump,
        )

    # A second, darker lower layer gives the mane the swept chest silhouette
    # visible in the references without adding production-level strand detail.
    for index, (x, z, angle) in enumerate((
        (-0.43, 1.54, -0.42),
        (0.0, 1.37, 0.0),
        (0.43, 1.54, 0.42),
    )):
        ellipsoid(
            f"LowerMane_{index}",
            (x, -1.01, z),
            (0.32, 0.21, 0.44),
            mane,
            rotation=(0.0, 0.0, angle),
            segments=28,
            rings=18,
            deform=mane_clump,
        )

    for side, x in (("L", 0.58), ("R", -0.58)):
        ellipsoid(f"Ear_{side}", (x, -1.29, 2.53), (0.25, 0.14, 0.25), face_gold)
        ellipsoid(f"EarInset_{side}", (x, -1.42, 2.53), (0.135, 0.032, 0.145), pink, segments=24, rings=16)

    for side, x in (("L", 0.225), ("R", -0.225)):
        ellipsoid(f"EyeWhite_{side}", (x, -1.755, 2.21), (0.145, 0.038, 0.175), white, segments=30, rings=20)
        ellipsoid(f"Iris_{side}", (x, -1.792, 2.19), (0.078, 0.012, 0.098), iris, segments=24, rings=16)
        ellipsoid(f"Pupil_{side}", (x, -1.805, 2.19), (0.044, 0.008, 0.061), dark, segments=20, rings=12)
        ellipsoid(f"EyeShine_{side}", (x + 0.020, -1.814, 2.23), (0.014, 0.006, 0.019), white, segments=16, rings=10)

    make_curve("Brow_L", [(0.08, -1.75, 2.42), (0.22, -1.77, 2.47), (0.35, -1.74, 2.44)], 0.030, dark)
    make_curve("Brow_R", [(-0.08, -1.75, 2.42), (-0.22, -1.77, 2.47), (-0.35, -1.74, 2.44)], 0.030, dark)

    ellipsoid("MuzzleBridge", (0.0, -1.69, 1.98), (0.38, 0.12, 0.24), cream)
    ellipsoid("Muzzle_L", (0.17, -1.76, 1.93), (0.25, 0.075, 0.18), cream)
    ellipsoid("Muzzle_R", (-0.17, -1.76, 1.93), (0.25, 0.075, 0.18), cream)
    ellipsoid("Nose", (0.0, -1.86, 2.04), (0.14, 0.042, 0.095), dark, segments=28, rings=18)
    ellipsoid("Mouth", (0.0, -1.79, 1.80), (0.21, 0.032, 0.10), dark, segments=28, rings=18)
    ellipsoid("Tongue", (0.0, -1.824, 1.765), (0.095, 0.018, 0.038), pink, segments=24, rings=16)
    ellipsoid("Chin", (0.0, -1.70, 1.73), (0.25, 0.065, 0.13), cream)

    # Curved tail with a soft tuft for silhouette review.
    make_curve(
        "Tail",
        [(-0.38, 0.72, 1.31), (-0.70, 0.88, 1.34), (-0.99, 0.89, 1.55), (-1.08, 0.78, 1.75)],
        0.080,
        coat,
    )
    ellipsoid("TailTuft", (-1.08, 0.78, 1.84), (0.20, 0.17, 0.27), mane_highlight, rotation=(0.0, 0.0, -0.30), segments=28, rings=18, deform=mane_clump)


def look_at(obj, point):
    direction = Vector(point) - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def setup_stage():
    floor_material = make_material("Studio Floor", (0.68, 0.72, 0.73), 0.76)
    bpy.ops.mesh.primitive_plane_add(size=30, location=(0.0, 0.0, -0.015))
    floor = bpy.context.object
    floor.name = "GroundPlane"
    floor.data.materials.append(floor_material)

    world = bpy.context.scene.world
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.055, 0.075, 0.11, 1.0)
    world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.28

    bpy.ops.object.light_add(type="AREA", location=(4.5, -5.5, 7.0))
    key = bpy.context.object
    key.name = "KeyLight"
    key.data.energy = 1050
    key.data.shape = "DISK"
    key.data.size = 5.0
    look_at(key, (0.0, 0.0, 1.25))

    bpy.ops.object.light_add(type="AREA", location=(-4.5, -2.0, 4.5))
    fill = bpy.context.object
    fill.name = "FillLight"
    fill.data.energy = 700
    fill.data.size = 5.0
    look_at(fill, (0.0, 0.0, 1.25))

    bpy.ops.object.light_add(type="AREA", location=(0.0, 4.0, 5.0))
    rim = bpy.context.object
    rim.name = "RimLight"
    rim.data.energy = 900
    rim.data.size = 3.5
    look_at(rim, (0.0, 0.0, 1.35))


def render_views():
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = 768
    scene.render.resolution_y = 768
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.film_transparent = False
    scene.render.image_settings.color_mode = "RGBA"
    scene.view_settings.look = "AgX - Medium High Contrast"

    bpy.ops.object.camera_add()
    camera = bpy.context.object
    camera.name = "ProportionReviewCamera"
    camera.data.lens = 58
    scene.camera = camera

    views = {
        "front": ((0.0, -8.0, 2.25), (0.0, 0.0, 1.45), 58),
        "side": ((7.2, 0.0, 2.05), (0.0, 0.0, 1.35), 60),
        "three-quarter": ((5.6, -6.3, 3.05), (0.0, -0.05, 1.42), 60),
        "top": ((0.0, -0.1, 9.5), (0.0, 0.0, 1.0), 64),
    }
    for name, (location, target, lens) in views.items():
        camera.location = location
        camera.data.lens = lens
        look_at(camera, target)
        scene.render.filepath = str(PREVIEW_DIR / f"{name}.png")
        bpy.ops.render.render(write_still=True)


clear_scene()
build_lion()
setup_stage()
bpy.ops.wm.save_as_mainfile(filepath=str(BLEND_PATH))
render_views()
bpy.ops.wm.save_as_mainfile(filepath=str(BLEND_PATH))
print(f"Saved proportion study: {BLEND_PATH}")
print(f"Saved previews: {PREVIEW_DIR}")
