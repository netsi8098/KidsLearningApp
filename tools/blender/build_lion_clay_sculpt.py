"""Build the first continuous lion clay sculpt from the approved turnaround.

This replaces the rejected primitive modeling direction. The coat-colored body,
head, neck, limbs, and paws are fused through voxel remeshing so the character
can be evaluated as one anatomical volume. It is still an offline approval
asset: no armature, animation, GLB export, or React integration is performed.

Run with:
  blender --background --factory-startup --python tools/blender/build_lion_clay_sculpt.py
"""

from __future__ import annotations

import math
from pathlib import Path

import bpy
from mathutils import Vector


ROOT = Path(__file__).resolve().parents[2]
BLEND_PATH = ROOT / "art/blender/lion_clay_sculpt_v1.blend"
PREVIEW_DIR = ROOT / "docs/assets/lion-clay-sculpt-v1"
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


def material(name, color, roughness=0.58):
    result = bpy.data.materials.new(name)
    result.diffuse_color = (*color, 1.0)
    result.use_nodes = True
    shader = result.node_tree.nodes.get("Principled BSDF")
    shader.inputs["Base Color"].default_value = (*color, 1.0)
    shader.inputs["Roughness"].default_value = roughness
    return result


def smooth(obj):
    if obj.type == "MESH":
        for polygon in obj.data.polygons:
            polygon.use_smooth = True
    return obj


def ellipsoid(name, location, scale, mat, rotation=(0.0, 0.0, 0.0), deform=None):
    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=48,
        ring_count=32,
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
    obj.data.materials.append(mat)
    return smooth(obj)


def rounded_limb(name, start, end, start_radius, end_radius, mat):
    start_vec = Vector(start)
    end_vec = Vector(end)
    direction = end_vec - start_vec
    midpoint = (start_vec + end_vec) * 0.5
    average_radius = (start_radius + end_radius) * 0.5
    bpy.ops.mesh.primitive_cone_add(
        vertices=40,
        radius1=end_radius,
        radius2=start_radius,
        depth=direction.length,
        location=midpoint,
    )
    obj = bpy.context.object
    obj.name = name
    obj.rotation_mode = "QUATERNION"
    obj.rotation_quaternion = Vector((0.0, 0.0, 1.0)).rotation_difference(direction.normalized())
    obj.data.materials.append(mat)
    return smooth(obj)


def pear_head(coordinate):
    z = coordinate.z / 0.67
    cheek = 0.12 * math.exp(-((z + 0.12) / 0.42) ** 2)
    crown = 0.05 * max(z, 0.0)
    jaw = 0.12 * max(-z - 0.26, 0.0)
    coordinate.x *= 1.0 + cheek - crown - jaw
    coordinate.y *= 0.94 + 0.06 * max(0.0, -z)
    return coordinate


def soft_paw(coordinate):
    # Flatten the sole and keep a rounded upper mass without the previous shoe
    # silhouette. The voxel union blends the rear of the paw into the ankle.
    if coordinate.z < -0.08:
        coordinate.z = -0.08 + (coordinate.z + 0.08) * 0.25
    coordinate.x *= 1.0 - 0.06 * max(coordinate.z, 0.0)
    return coordinate


def join_and_voxel_remesh(objects, name, voxel_size=0.032):
    bpy.ops.object.select_all(action="DESELECT")
    for obj in objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]
    bpy.ops.object.join()
    result = bpy.context.object
    result.name = name
    result.data.remesh_voxel_size = voxel_size
    result.data.remesh_voxel_adaptivity = 0.0
    bpy.ops.object.voxel_remesh()
    smooth(result)

    modifier = result.modifiers.new("Clay Surface Relax", type="SMOOTH")
    modifier.factor = 0.32
    modifier.iterations = 3
    bpy.context.view_layer.objects.active = result
    bpy.ops.object.modifier_apply(modifier=modifier.name)
    return result


def make_curve(name, points, bevel_depth, mat, resolution=8):
    curve_data = bpy.data.curves.new(name, type="CURVE")
    curve_data.dimensions = "3D"
    curve_data.resolution_u = resolution
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
    curve_data.materials.append(mat)
    return obj


def teardrop_clump(name, location, length, width, depth, rotation_y, mat):
    rings = 15
    radial_segments = 20
    vertices = []
    faces = []

    for ring in range(rings):
        t = ring / (rings - 1)
        z = (t - 0.5) * length
        radius = max(0.015, math.sin(math.pi * t) ** 0.68)
        # A slightly fuller root and sharper outward tip makes the mane read as
        # swept hair rather than a necklace of eggs.
        directional = 0.80 + 0.20 * (1.0 - t)
        for segment in range(radial_segments):
            angle = math.tau * segment / radial_segments
            vertices.append(
                (
                    math.cos(angle) * width * radius * directional,
                    math.sin(angle) * depth * radius,
                    z,
                )
            )

    for ring in range(rings - 1):
        for segment in range(radial_segments):
            current = ring * radial_segments + segment
            next_segment = ring * radial_segments + (segment + 1) % radial_segments
            upper = (ring + 1) * radial_segments + segment
            upper_next = (ring + 1) * radial_segments + (segment + 1) % radial_segments
            faces.append((current, next_segment, upper_next, upper))

    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    obj.location = location
    obj.rotation_euler[1] = rotation_y
    obj.data.materials.append(mat)
    return smooth(obj)


def build_continuous_body(coat):
    pieces = []

    def add(*args, **kwargs):
        obj = ellipsoid(*args, **kwargs)
        pieces.append(obj)
        return obj

    # One compact horizontal body with an intentionally deep chest and a soft
    # rise into the rump, matching the side-view identity guide.
    add("TorsoCore", (0.0, 0.15, 1.18), (0.58, 0.78, 0.52), coat)
    add("ChestMass", (0.0, -0.43, 1.30), (0.62, 0.58, 0.65), coat)
    add("RumpMass", (0.0, 0.66, 1.22), (0.57, 0.56, 0.55), coat)
    add("NeckMass", (0.0, -0.78, 1.68), (0.48, 0.42, 0.56), coat)
    add("HeadMass", (0.0, -1.16, 2.15), (0.68, 0.56, 0.67), coat, deform=pear_head)
    add("CheekMass_L", (0.24, -1.53, 2.03), (0.35, 0.20, 0.30), coat)
    add("CheekMass_R", (-0.24, -1.53, 2.03), (0.35, 0.20, 0.30), coat)

    # Front legs: shoulder mass flows into tapered forearm and a compact paw.
    for side, x in (("L", 0.38), ("R", -0.38)):
        shoulder = (x, -0.48, 1.36)
        elbow = (x, -0.53, 0.80)
        wrist = (x, -0.57, 0.31)
        paw = (x, -0.66, 0.17)
        add(f"FrontShoulder_{side}", shoulder, (0.28, 0.31, 0.36), coat)
        pieces.append(rounded_limb(f"FrontUpper_{side}", shoulder, elbow, 0.20, 0.17, coat))
        add(f"FrontElbow_{side}", elbow, (0.19, 0.20, 0.20), coat)
        pieces.append(rounded_limb(f"FrontLower_{side}", elbow, wrist, 0.16, 0.125, coat))
        add(f"FrontPaw_{side}", paw, (0.29, 0.29, 0.18), coat, deform=soft_paw)
        for toe, offset in enumerate((-0.105, 0.0, 0.105)):
            add(
                f"FrontToe_{side}_{toe}",
                (x + offset, -0.88, 0.18),
                (0.105, 0.10, 0.085),
                coat,
            )

    # Rear legs: broad thigh, forward knee, rear hock, then compact paw.
    for side, x in (("L", 0.39), ("R", -0.39)):
        hip = (x, 0.58, 1.25)
        knee = (x, 0.38, 0.80)
        hock = (x, 0.67, 0.39)
        paw = (x, 0.50, 0.17)
        add(f"RearHip_{side}", hip, (0.33, 0.39, 0.37), coat)
        pieces.append(rounded_limb(f"RearThigh_{side}", hip, knee, 0.25, 0.20, coat))
        add(f"RearKnee_{side}", knee, (0.22, 0.24, 0.23), coat)
        pieces.append(rounded_limb(f"RearHock_{side}", knee, hock, 0.17, 0.13, coat))
        pieces.append(rounded_limb(f"RearAnkle_{side}", hock, paw, 0.13, 0.12, coat))
        add(f"RearPaw_{side}", paw, (0.27, 0.28, 0.18), coat, deform=soft_paw)
        for toe, offset in enumerate((-0.095, 0.0, 0.095)):
            add(
                f"RearToe_{side}_{toe}",
                (x + offset, 0.28, 0.18),
                (0.095, 0.09, 0.08),
                coat,
            )

    body = join_and_voxel_remesh(pieces, "LionContinuousBody", voxel_size=0.028)
    body["approval_status"] = "offline_clay_v1"
    return body


def build_mane(mane_dark, mane_light):
    ellipsoid("ManeHood", (0.0, -0.91, 2.13), (0.91, 0.39, 0.91), mane_dark)

    # Outer layer defines the broad rounded silhouette; inner layer gives the
    # swept dimensional overlap visible in the approved guide.
    for index in range(14):
        angle = math.tau * index / 14
        radius = 0.69 + 0.025 * math.sin(index * 1.7)
        location = (
            math.sin(angle) * radius,
            -1.15 + 0.025 * math.cos(index),
            2.13 + math.cos(angle) * radius,
        )
        teardrop_clump(
            f"ManeOuter_{index:02d}",
            location,
            0.68 + 0.06 * math.cos(index * 1.3),
            0.24,
            0.17,
            angle,
            mane_light if index in (0, 1, 13) else mane_dark,
        )

    for index in range(10):
        angle = math.tau * index / 10 + 0.14
        radius = 0.52
        location = (
            math.sin(angle) * radius,
            -1.27,
            2.13 + math.cos(angle) * radius,
        )
        teardrop_clump(
            f"ManeInner_{index:02d}",
            location,
            0.51,
            0.20,
            0.13,
            angle,
            mane_light if index in (0, 1, 9) else mane_dark,
        )

    # Central top tuft and lower chest point are explicit identity landmarks.
    for index, (x, angle, length) in enumerate(((-0.19, -0.28, 0.55), (0.0, 0.0, 0.64), (0.19, 0.28, 0.55))):
        teardrop_clump(
            f"ManeTop_{index}",
            (x, -1.25, 2.80 + (0.06 if index == 1 else 0.0)),
            length,
            0.21,
            0.14,
            angle,
            mane_light,
        )
    teardrop_clump("ManeChestPoint", (0.0, -1.35, 1.52), 0.60, 0.28, 0.14, math.pi, mane_dark)


def build_face(face_gold, cream, dark, iris, white, pink):
    for side, x in (("L", 0.57), ("R", -0.57)):
        ellipsoid(f"Ear_{side}", (x, -1.31, 2.55), (0.25, 0.13, 0.25), face_gold)
        ellipsoid(f"EarInset_{side}", (x, -1.43, 2.55), (0.135, 0.026, 0.145), pink)

    for side, x in (("L", 0.225), ("R", -0.225)):
        ellipsoid(f"EyeWhite_{side}", (x, -1.735, 2.24), (0.145, 0.036, 0.18), white)
        ellipsoid(f"Iris_{side}", (x, -1.770, 2.22), (0.079, 0.011, 0.102), iris)
        ellipsoid(f"Pupil_{side}", (x, -1.782, 2.22), (0.044, 0.007, 0.064), dark)
        ellipsoid(f"EyeHighlight_{side}", (x + 0.022, -1.790, 2.27), (0.015, 0.005, 0.021), white)
        # Golden upper eyelid removes the surprised ping-pong-eye appearance.
        ellipsoid(f"UpperLid_{side}", (x, -1.766, 2.35), (0.16, 0.020, 0.080), face_gold)

    make_curve("Brow_L", [(0.08, -1.73, 2.46), (0.22, -1.77, 2.51), (0.36, -1.73, 2.47)], 0.027, dark)
    make_curve("Brow_R", [(-0.08, -1.73, 2.46), (-0.22, -1.77, 2.51), (-0.36, -1.73, 2.47)], 0.027, dark)

    ellipsoid("MuzzleBridge", (0.0, -1.70, 2.01), (0.36, 0.11, 0.23), cream)
    ellipsoid("Muzzle_L", (0.16, -1.79, 1.96), (0.245, 0.065, 0.175), cream)
    ellipsoid("Muzzle_R", (-0.16, -1.79, 1.96), (0.245, 0.065, 0.175), cream)
    ellipsoid("Chin", (0.0, -1.73, 1.76), (0.25, 0.055, 0.13), cream)
    ellipsoid("Nose", (0.0, -1.87, 2.07), (0.14, 0.040, 0.095), dark)
    ellipsoid("MouthOpening", (0.0, -1.82, 1.84), (0.19, 0.026, 0.092), dark)
    ellipsoid("Tongue", (0.0, -1.846, 1.80), (0.088, 0.013, 0.036), pink)


def build_chest_and_paw_detail(cream, dark):
    ellipsoid("ChestPatch", (0.0, -1.005, 1.34), (0.34, 0.045, 0.40), cream)
    for x in (-0.38, 0.38):
        for offset in (-0.075, 0.075):
            make_curve(
                f"FrontToeCrease_{x}_{offset}",
                [(x + offset, -0.946, 0.25), (x + offset * 1.08, -0.962, 0.20)],
                0.010,
                dark,
                resolution=4,
            )


def build_tail(coat, mane_light):
    make_curve(
        "Tail",
        [(0.44, 0.70, 1.31), (0.76, 0.91, 1.34), (1.04, 0.92, 1.58), (1.11, 0.80, 1.78)],
        0.080,
        coat,
    )
    teardrop_clump("TailTuft", (1.11, 0.80, 1.87), 0.44, 0.18, 0.15, 0.25, mane_light)


def look_at(obj, point):
    direction = Vector(point) - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def setup_stage():
    floor_mat = material("Warm Studio Floor", (0.53, 0.48, 0.43), 0.82)
    bpy.ops.mesh.primitive_plane_add(size=30, location=(0.0, 0.0, -0.005))
    floor = bpy.context.object
    floor.name = "GroundPlane"
    floor.data.materials.append(floor_mat)

    world = bpy.context.scene.world
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.13, 0.115, 0.10, 1.0)
    world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.55

    for name, location, energy, size in (
        ("KeyLight", (4.5, -5.2, 7.0), 1150, 5.0),
        ("FillLight", (-4.5, -2.2, 4.7), 720, 5.0),
        ("RimLight", (0.0, 4.0, 5.4), 980, 3.5),
    ):
        bpy.ops.object.light_add(type="AREA", location=location)
        light = bpy.context.object
        light.name = name
        light.data.energy = energy
        light.data.shape = "DISK"
        light.data.size = size
        look_at(light, (0.0, 0.0, 1.35))


def render_views():
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = 896
    scene.render.resolution_y = 896
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.view_settings.look = "AgX - Medium High Contrast"

    bpy.ops.object.camera_add()
    camera = bpy.context.object
    camera.name = "ClayReviewCamera"
    scene.camera = camera

    views = {
        "front": ((0.0, -8.6, 2.15), (0.0, -0.05, 1.48), 62),
        "side": ((8.2, 0.0, 2.05), (0.0, 0.0, 1.40), 62),
        "rear": ((0.0, 8.6, 2.05), (0.0, 0.02, 1.42), 62),
        "three-quarter": ((5.8, -6.7, 2.95), (0.0, -0.02, 1.43), 62),
    }
    for name, (location, target, lens) in views.items():
        camera.location = location
        camera.data.lens = lens
        look_at(camera, target)
        scene.render.filepath = str(PREVIEW_DIR / f"{name}.png")
        bpy.ops.render.render(write_still=True)


clear_scene()

coat = material("Golden Coat", (0.94, 0.48, 0.065))
face_gold = material("Face Gold", (1.0, 0.62, 0.15))
cream = material("Warm Cream", (1.0, 0.78, 0.46))
mane_dark = material("Auburn Mane", (0.22, 0.032, 0.008))
mane_light = material("Mane Highlight", (0.46, 0.10, 0.015))
dark = material("Facial Features", (0.065, 0.015, 0.008), 0.42)
iris = material("Warm Brown Iris", (0.36, 0.085, 0.018), 0.36)
white = material("Eye White", (1.0, 0.98, 0.92), 0.34)
pink = material("Ear and Tongue Pink", (0.94, 0.25, 0.20))

build_continuous_body(coat)
build_mane(mane_dark, mane_light)
build_face(face_gold, cream, dark, iris, white, pink)
build_chest_and_paw_detail(cream, dark)
build_tail(coat, mane_light)
setup_stage()

bpy.context.scene["approval_status"] = "offline_clay_sculpt_v1_not_for_runtime"
bpy.context.scene["identity_source"] = "art/blender/references/lion-turnaround-study-v1.png"
bpy.ops.wm.save_as_mainfile(filepath=str(BLEND_PATH))
render_views()
bpy.ops.wm.save_as_mainfile(filepath=str(BLEND_PATH))

print(f"Saved continuous lion clay sculpt: {BLEND_PATH}")
print(f"Saved clay review renders: {PREVIEW_DIR}")
