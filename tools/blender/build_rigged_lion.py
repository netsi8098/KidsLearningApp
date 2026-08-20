"""Build the first genuine Blender-authored Kids Learning Fun lion.

Run with:
  blender --background --factory-startup --python tools/blender/build_rigged_lion.py

The script creates an editable .blend, a rendered identity/rig preview, and the
runtime GLB. It is intentionally reproducible so visual modeling can improve
without breaking the app's bone, clip, and morph contract.
"""

from __future__ import annotations

import json
import math
import os
from pathlib import Path

import bpy
from mathutils import Vector


ROOT = Path(__file__).resolve().parents[2]
CONTRACT = json.loads((ROOT / "src/data/lionRigContract.json").read_text())
BLEND_PATH = ROOT / "art/blender/lion.blend"
GLB_PATH = ROOT / "public/assets/lion/rigged/lion.glb"
PREVIEW_PATH = ROOT / "docs/assets/lion-rig-preview.png"
WAVE_PREVIEW_PATH = ROOT / "docs/assets/lion-rig-wave-preview.png"

for path in (BLEND_PATH, GLB_PATH, PREVIEW_PATH, WAVE_PREVIEW_PATH):
    path.parent.mkdir(parents=True, exist_ok=True)


def clear_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for datablocks in (bpy.data.meshes, bpy.data.curves, bpy.data.materials, bpy.data.cameras, bpy.data.lights):
        for block in list(datablocks):
            if block.users == 0:
                datablocks.remove(block)


def material(name, color, roughness=0.55, metallic=0.0):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, 1.0)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (*color, 1.0)
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Specular IOR Level"].default_value = 0.38
    return mat


def finish_mesh(obj, scale, mat, rotation=(0, 0, 0)):
    obj.scale = scale
    obj.rotation_euler = rotation
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.data.materials.append(mat)
    for poly in obj.data.polygons:
        poly.use_smooth = True
    obj.select_set(False)
    return obj


def sphere(name, location, scale, mat, segments=32, rings=20, rotation=(0, 0, 0)):
    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=segments,
        ring_count=rings,
        location=location,
    )
    obj = bpy.context.object
    obj.name = name
    return finish_mesh(obj, scale, mat, rotation)


def cylinder_between(name, start, end, radius, mat, vertices=24):
    start_v = Vector(start)
    end_v = Vector(end)
    direction = end_v - start_v
    midpoint = (start_v + end_v) * 0.5
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=direction.length, location=midpoint)
    obj = bpy.context.object
    obj.name = name
    obj.rotation_mode = "QUATERNION"
    obj.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(direction.normalized())
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.data.materials.append(mat)
    for poly in obj.data.polygons:
        poly.use_smooth = True
    obj.select_set(False)
    return obj


def capsule(name, start, end, radius, mat, end_scale=1.0):
    parts = [cylinder_between(f"{name}_shaft", start, end, radius, mat)]
    parts.append(sphere(f"{name}_joint_a", start, (radius, radius, radius), mat, 24, 16))
    parts.append(sphere(f"{name}_joint_b", end, (radius * end_scale,) * 3, mat, 24, 16))
    return parts


def add_shape_key(obj, name, transform):
    if obj.data.shape_keys is None:
        obj.shape_key_add(name="Basis")
    key = obj.shape_key_add(name=name)
    for index, point in enumerate(key.data):
        point.co = transform(obj.data.vertices[index].co.copy())
    return key


def create_armature():
    data = bpy.data.armatures.new("LionArmature")
    arm = bpy.data.objects.new("LionArmature", data)
    bpy.context.collection.objects.link(arm)
    arm.show_in_front = True
    bpy.context.view_layer.objects.active = arm
    arm.select_set(True)
    bpy.ops.object.mode_set(mode="EDIT")

    positions = {
        "root": ((0, 0, 0.02), (0, 0, 0.22)),
        "pelvis": ((0, 0, 1.12), (0, 0, 1.36)),
        "spine_01": ((0, 0, 1.34), (0, 0, 1.60)),
        "chest": ((0, -0.01, 1.58), (0, -0.02, 1.88)),
        "neck": ((0, -0.02, 1.86), (0, -0.03, 2.10)),
        "head": ((0, -0.03, 2.08), (0, -0.04, 2.48)),
        "jaw": ((0, -0.31, 2.24), (0, -0.45, 2.12)),
        "eye_L": ((0.24, -0.42, 2.48), (0.24, -0.54, 2.48)),
        "eye_R": ((-0.24, -0.42, 2.48), (-0.24, -0.54, 2.48)),
        "ear_L": ((0.50, -0.01, 2.72), (0.63, -0.02, 2.83)),
        "ear_R": ((-0.50, -0.01, 2.72), (-0.63, -0.02, 2.83)),
        "mane_L": ((0.40, 0.04, 2.46), (0.65, 0.03, 2.36)),
        "mane_top": ((0, 0.03, 2.75), (0, 0.03, 3.02)),
        "mane_R": ((-0.40, 0.04, 2.46), (-0.65, 0.03, 2.36)),
        "front_shoulder_L": ((0.38, -0.08, 1.78), (0.39, -0.11, 1.55)),
        "front_upper_L": ((0.39, -0.11, 1.55), (0.40, -0.15, 1.18)),
        "front_elbow_L": ((0.40, -0.15, 1.18), (0.40, -0.17, 0.98)),
        "front_lower_L": ((0.40, -0.17, 0.98), (0.41, -0.18, 0.55)),
        "front_wrist_L": ((0.41, -0.18, 0.55), (0.41, -0.20, 0.30)),
        "front_paw_L": ((0.41, -0.20, 0.30), (0.41, -0.40, 0.13)),
        "front_shoulder_R": ((-0.38, -0.08, 1.78), (-0.39, -0.11, 1.55)),
        "front_upper_R": ((-0.39, -0.11, 1.55), (-0.40, -0.15, 1.18)),
        "front_elbow_R": ((-0.40, -0.15, 1.18), (-0.40, -0.17, 0.98)),
        "front_lower_R": ((-0.40, -0.17, 0.98), (-0.41, -0.18, 0.55)),
        "front_wrist_R": ((-0.41, -0.18, 0.55), (-0.41, -0.20, 0.30)),
        "front_paw_R": ((-0.41, -0.20, 0.30), (-0.41, -0.40, 0.13)),
        "rear_hip_L": ((0.29, 0.13, 1.24), (0.30, 0.14, 1.04)),
        "rear_thigh_L": ((0.30, 0.14, 1.04), (0.31, 0.16, 0.78)),
        "rear_knee_L": ((0.31, 0.16, 0.78), (0.32, 0.17, 0.61)),
        "rear_hock_L": ((0.32, 0.17, 0.61), (0.33, 0.18, 0.44)),
        "rear_lower_L": ((0.33, 0.18, 0.44), (0.34, 0.17, 0.29)),
        "rear_ankle_L": ((0.34, 0.17, 0.29), (0.34, 0.02, 0.15)),
        "rear_paw_L": ((0.34, 0.02, 0.15), (0.34, -0.25, 0.10)),
        "rear_hip_R": ((-0.29, 0.13, 1.24), (-0.30, 0.14, 1.04)),
        "rear_thigh_R": ((-0.30, 0.14, 1.04), (-0.31, 0.16, 0.78)),
        "rear_knee_R": ((-0.31, 0.16, 0.78), (-0.32, 0.17, 0.61)),
        "rear_hock_R": ((-0.32, 0.17, 0.61), (-0.33, 0.18, 0.44)),
        "rear_lower_R": ((-0.33, 0.18, 0.44), (-0.34, 0.17, 0.29)),
        "rear_ankle_R": ((-0.34, 0.17, 0.29), (-0.34, 0.02, 0.15)),
        "rear_paw_R": ((-0.34, 0.02, 0.15), (-0.34, -0.25, 0.10)),
        "tail_01": ((-0.28, 0.22, 1.23), (-0.58, 0.24, 1.14)),
        "tail_02": ((-0.58, 0.24, 1.14), (-0.82, 0.23, 1.32)),
        "tail_03": ((-0.82, 0.23, 1.32), (-0.92, 0.20, 1.58)),
        "tail_04": ((-0.92, 0.20, 1.58), (-0.84, 0.17, 1.82)),
        "tail_tuft": ((-0.84, 0.17, 1.82), (-0.72, 0.15, 2.04)),
    }

    bones = {}
    for spec in CONTRACT["bones"]:
        name = spec["name"]
        head, tail = positions[name]
        bone = data.edit_bones.new(name)
        bone.head = head
        bone.tail = tail
        bone.use_deform = True
        bones[name] = bone
    for spec in CONTRACT["bones"]:
        if spec["parent"]:
            bones[spec["name"]].parent = bones[spec["parent"]]
    bpy.ops.object.mode_set(mode="OBJECT")
    arm.select_set(False)
    return arm


def rigid_bind(obj, arm, bone_name):
    group = obj.vertex_groups.new(name=bone_name)
    group.add(list(range(len(obj.data.vertices))), 1.0, "REPLACE")
    modifier = obj.modifiers.new(name="LionArmature", type="ARMATURE")
    modifier.object = arm
    obj.parent = arm
    obj.matrix_parent_inverse = arm.matrix_world.inverted()


def gradient_bind_body(obj, arm):
    names = ("pelvis", "spine_01", "chest")
    groups = {name: obj.vertex_groups.new(name=name) for name in names}
    for vertex in obj.data.vertices:
        world_z = (obj.matrix_world @ vertex.co).z
        chest = max(0.0, min(1.0, (world_z - 1.42) / 0.42))
        pelvis = max(0.0, min(1.0, (1.48 - world_z) / 0.42))
        spine = max(0.0, 1.0 - chest - pelvis)
        total = max(0.001, pelvis + spine + chest)
        for name, value in (("pelvis", pelvis), ("spine_01", spine), ("chest", chest)):
            if value > 0:
                groups[name].add([vertex.index], value / total, "REPLACE")
    modifier = obj.modifiers.new(name="LionArmature", type="ARMATURE")
    modifier.object = arm
    obj.parent = arm
    obj.matrix_parent_inverse = arm.matrix_world.inverted()


def build_model(arm):
    gold = material("Lion Gold", (0.78, 0.20, 0.012), 0.46)
    light_gold = material("Lion Face Gold", (0.92, 0.34, 0.018), 0.50)
    cream = material("Warm Cream", (0.92, 0.57, 0.22), 0.60)
    mane = material("Warm Auburn Mane", (0.105, 0.012, 0.0025), 0.52)
    mane_high = material("Mane Highlights", (0.28, 0.038, 0.004), 0.48)
    brown = material("Nose and Pads", (0.075, 0.008, 0.003), 0.42)
    pink = material("Ear and Tongue", (0.85, 0.09, 0.11), 0.52)
    blush = material("Cheek Blush", (0.92, 0.16, 0.10), 0.58)
    white = material("Eye White", (0.98, 0.98, 0.95), 0.3)
    iris = material("Warm Brown Iris", (0.34, 0.09, 0.02), 0.28)
    black = material("Pupil and Mouth", (0.012, 0.008, 0.006), 0.3)
    model = []

    body = sphere("Body", (0, 0, 1.34), (0.54, 0.43, 0.70), gold, 40, 28)
    gradient_bind_body(body, arm)
    model.append(body)
    belly = sphere("Belly", (0, -0.38, 1.34), (0.34, 0.09, 0.46), cream, 32, 20)
    rigid_bind(belly, arm, "chest")
    model.append(belly)

    head = sphere("Head", (0, -0.05, 2.43), (0.82, 0.62, 0.72), light_gold, 48, 32)
    add_shape_key(head, "cheeks_up", lambda co: Vector((co.x * 1.02, co.y - (0.018 if co.z < -0.05 else 0), co.z + (0.025 if co.z < 0 else 0))))
    rigid_bind(head, arm, "head")
    model.append(head)

    # Layered petal mane, matching the approved warm, rounded silhouette.
    for i in range(18):
        angle = (i / 18) * math.tau
        x = math.cos(angle) * 0.76
        z = 2.43 + math.sin(angle) * 0.74
        scale = (0.28, 0.24, 0.42 if math.sin(angle) < -0.25 else 0.37)
        petal = sphere(
            f"ManePetal_{i:02d}",
            (x, 0.12, z),
            scale,
            mane_high if i in (3, 4, 5) else mane,
            24,
            16,
            rotation=(0, angle * 0.08, -angle + math.pi / 2),
        )
        bone = "mane_L" if x > 0.20 else "mane_R" if x < -0.20 else "mane_top"
        rigid_bind(petal, arm, bone)
        model.append(petal)
    # Top hair tuft.
    for i, (x, rot, size) in enumerate(((-0.18, -0.34, 0.30), (0, 0, 0.38), (0.18, 0.34, 0.30))):
        tuft = sphere(f"ManeTop_{i}", (x, -0.01, 3.07 + (0.05 if i == 1 else 0)), (0.20, 0.20, size * 1.15), mane_high, 24, 16, rotation=(0, 0, rot))
        rigid_bind(tuft, arm, "mane_top")
        model.append(tuft)

    # Ears with inset centers.
    for side, x in (("L", 0.62), ("R", -0.62)):
        outer = sphere(f"EarOuter_{side}", (x, -0.06, 2.79), (0.28, 0.18, 0.30), gold, 28, 18)
        inner = sphere(f"EarInner_{side}", (x, -0.225, 2.79), (0.16, 0.045, 0.18), pink, 24, 16)
        rigid_bind(outer, arm, f"ear_{side}")
        rigid_bind(inner, arm, f"ear_{side}")
        model += [outer, inner]

    # Eyes, irises, pupils and highlights. Shape keys live on the whites.
    for side, x in (("L", 0.25), ("R", -0.25)):
        eye = sphere(f"EyeWhite_{side}", (x, -0.765, 2.56), (0.205, 0.085, 0.245), white, 32, 20)
        add_shape_key(eye, f"blink_{side}", lambda co: Vector((co.x, co.y, co.z * 0.08)))
        add_shape_key(eye, "eyes_wide", lambda co: Vector((co.x * 1.02, co.y, co.z * 1.16)))
        add_shape_key(eye, "eyes_narrow", lambda co: Vector((co.x, co.y, co.z * 0.62)))
        rigid_bind(eye, arm, f"eye_{side}")
        iris_obj = sphere(f"Iris_{side}", (x, -0.846, 2.535), (0.098, 0.020, 0.132), iris, 24, 16)
        pupil = sphere(f"Pupil_{side}", (x, -0.870, 2.535), (0.056, 0.012, 0.082), black, 20, 12)
        shine = sphere(f"EyeShine_{side}", (x + 0.025, -0.886, 2.590), (0.020, 0.007, 0.026), white, 16, 10)
        for obj in (iris_obj, pupil, shine):
            rigid_bind(obj, arm, f"eye_{side}")
        model += [eye, iris_obj, pupil, shine]

    # Brows are independently shape-keyed and head-weighted.
    for side, x in (("L", 0.25), ("R", -0.25)):
        brow = sphere(
            f"Brow_{side}",
            (x, -0.785, 2.86),
            (0.17, 0.025, 0.038),
            brown,
            20,
            12,
            rotation=(0, -0.10 if side == "L" else 0.10, 0),
        )
        add_shape_key(brow, f"brow_up_{side}", lambda co: Vector((co.x, co.y, co.z + 0.07)))
        add_shape_key(brow, f"brow_down_{side}", lambda co: Vector((co.x, co.y, co.z - 0.055)))
        rigid_bind(brow, arm, "head")
        model.append(brow)

    muzzle_l = sphere("Muzzle_L", (0.18, -0.72, 2.29), (0.30, 0.105, 0.22), cream, 32, 20)
    muzzle_r = sphere("Muzzle_R", (-0.18, -0.72, 2.29), (0.30, 0.105, 0.22), cream, 32, 20)
    nose = sphere("Nose", (0, -0.845, 2.40), (0.15, 0.055, 0.105), brown, 28, 18)
    for obj in (muzzle_l, muzzle_r, nose):
        rigid_bind(obj, arm, "head")
    model += [muzzle_l, muzzle_r, nose]
    for side, x in (("L", 0.43), ("R", -0.43)):
        cheek = sphere(f"Cheek_{side}", (x, -0.704, 2.25), (0.075, 0.016, 0.045), blush, 20, 12)
        rigid_bind(cheek, arm, "head")
        model.append(cheek)

    chin = sphere("Chin", (0, -0.67, 2.08), (0.31, 0.075, 0.20), cream, 30, 18)
    rigid_bind(chin, arm, "jaw")
    model.append(chin)
    mouth = sphere("MouthMorph", (0, -0.806, 2.075), (0.30, 0.048, 0.205), black, 32, 20)
    add_shape_key(mouth, "smile", lambda co: Vector((co.x * 1.18, co.y, co.z + 0.035 * (1 - abs(co.x) / 0.25))))
    add_shape_key(mouth, "mouth_wide", lambda co: Vector((co.x * 1.30, co.y, co.z * 1.05)))
    add_shape_key(mouth, "mouth_narrow", lambda co: Vector((co.x * 0.68, co.y, co.z * 1.15)))
    add_shape_key(mouth, "mouth_round", lambda co: Vector((co.x * 0.72, co.y, co.z * 1.35)))
    add_shape_key(mouth, "viseme_MBP", lambda co: Vector((co.x, co.y, co.z * 0.10)))
    add_shape_key(mouth, "viseme_FV", lambda co: Vector((co.x * 1.08, co.y, co.z * 0.38)))
    add_shape_key(mouth, "viseme_OU", lambda co: Vector((co.x * 0.55, co.y, co.z * 1.48)))
    rigid_bind(mouth, arm, "jaw")
    tongue = sphere("Tongue", (0, -0.858, 1.995), (0.145, 0.018, 0.060), pink, 24, 14)
    rigid_bind(tongue, arm, "jaw")
    model += [mouth, tongue]
    # Four fully named limb chains. Overlapping capsules create soft cartoon joints.
    limbs = [
        ("front_upper_L", (0.39, -0.11, 1.55), (0.40, -0.15, 1.18), 0.17),
        ("front_lower_L", (0.40, -0.17, 0.98), (0.41, -0.18, 0.55), 0.15),
        ("front_upper_R", (-0.39, -0.11, 1.55), (-0.40, -0.15, 1.18), 0.17),
        ("front_lower_R", (-0.40, -0.17, 0.98), (-0.41, -0.18, 0.55), 0.15),
        ("rear_thigh_L", (0.30, 0.14, 1.04), (0.31, 0.16, 0.78), 0.20),
        ("rear_lower_L", (0.32, 0.17, 0.61), (0.34, 0.17, 0.29), 0.17),
        ("rear_thigh_R", (-0.30, 0.14, 1.04), (-0.31, 0.16, 0.78), 0.20),
        ("rear_lower_R", (-0.32, 0.17, 0.61), (-0.34, 0.17, 0.29), 0.17),
    ]
    for bone, start, end, radius in limbs:
        for part in capsule(bone, start, end, radius, gold):
            rigid_bind(part, arm, bone)
            model.append(part)

    for prefix, x in (("front", 0.41), ("front_R", -0.41), ("rear", 0.34), ("rear_R", -0.34)):
        bone = {"front": "front_paw_L", "front_R": "front_paw_R", "rear": "rear_paw_L", "rear_R": "rear_paw_R"}[prefix]
        paw = sphere(f"Paw_{prefix}", (x, -0.28 if "front" in prefix else -0.10, 0.17), (0.25, 0.31, 0.16), cream, 30, 18)
        rigid_bind(paw, arm, bone)
        model.append(paw)
        for toe in (-0.11, 0, 0.11):
            toe_obj = sphere(f"Toe_{prefix}_{toe:+.2f}", (x + toe, -0.50 if "front" in prefix else -0.30, 0.14), (0.09, 0.12, 0.09), cream, 20, 12)
            rigid_bind(toe_obj, arm, bone)
            model.append(toe_obj)

    # Tail chain with a separately weighted tuft for follow-through.
    tail_points = [(-0.28, 0.22, 1.23), (-0.58, 0.24, 1.14), (-0.82, 0.23, 1.32), (-0.92, 0.20, 1.58), (-0.84, 0.17, 1.82)]
    for index in range(4):
        bone = f"tail_{index + 1:02d}"
        segment = cylinder_between(f"TailSegment_{index + 1}", tail_points[index], tail_points[index + 1], 0.075 - index * 0.008, gold, 20)
        rigid_bind(segment, arm, bone)
        model.append(segment)
        joint = sphere(f"TailJoint_{index + 1}", tail_points[index + 1], (0.085 - index * 0.008,) * 3, gold, 20, 12)
        rigid_bind(joint, arm, bone)
        model.append(joint)
    tail_tuft = sphere("TailTuft", (-0.73, 0.15, 1.96), (0.17, 0.14, 0.28), mane, 28, 18, rotation=(0, 0, -0.5))
    rigid_bind(tail_tuft, arm, "tail_tuft")
    model.append(tail_tuft)

    return model


def reset_pose(arm):
    for bone in arm.pose.bones:
        bone.rotation_mode = "XYZ"
        bone.rotation_euler = (0, 0, 0)
        bone.location = (0, 0, 0)
        bone.scale = (1, 1, 1)


def key_bone(arm, name, frame, rotation=None, location=None, scale=None):
    bone = arm.pose.bones[name]
    if rotation is not None:
        bone.rotation_euler = rotation
        bone.keyframe_insert(data_path="rotation_euler", frame=frame)
    if location is not None:
        bone.location = location
        bone.keyframe_insert(data_path="location", frame=frame)
    if scale is not None:
        bone.scale = scale
        bone.keyframe_insert(data_path="scale", frame=frame)


def begin_action(arm, name, end_frame):
    reset_pose(arm)
    action = bpy.data.actions.new(name=name)
    action.use_fake_user = True
    arm.animation_data_create()
    arm.animation_data.action = action
    for bone in arm.pose.bones:
        bone.keyframe_insert(data_path="rotation_euler", frame=1)
        bone.keyframe_insert(data_path="location", frame=1)
        bone.keyframe_insert(data_path="scale", frame=1)
        bone.keyframe_insert(data_path="rotation_euler", frame=end_frame)
        bone.keyframe_insert(data_path="location", frame=end_frame)
        bone.keyframe_insert(data_path="scale", frame=end_frame)
    return action


def build_actions(arm):
    # Idle: asynchronous breath, gaze/head, ear, tail and mane follow-through.
    begin_action(arm, "Idle", 96)
    for frame, breath in ((1, 0), (24, 1), (48, 0), (72, -0.45), (96, 0)):
        key_bone(arm, "chest", frame, rotation=(0.015 * breath, 0, 0.012 * breath), scale=(1 + 0.012 * breath, 1 + 0.012 * breath, 1 + 0.025 * breath))
        key_bone(arm, "head", frame, rotation=(0, 0.018 * breath, -0.018 * breath))
    for frame, value in ((1, -0.08), (28, 0.16), (57, -0.13), (96, -0.08)):
        key_bone(arm, "tail_01", frame, rotation=(0, value, value * 0.35))
        key_bone(arm, "tail_02", frame + (0 if frame == 96 else 3), rotation=(0, value * 1.25, value * 0.5))
        key_bone(arm, "tail_03", frame + (0 if frame == 96 else 5), rotation=(0, value * 1.45, value * 0.62))
        key_bone(arm, "tail_04", frame + (0 if frame == 96 else 7), rotation=(0, value * 1.65, value * 0.75))
    key_bone(arm, "ear_L", 32, rotation=(0, -0.08, 0.08))
    key_bone(arm, "ear_L", 40, rotation=(0, 0.03, -0.03))
    key_bone(arm, "ear_R", 61, rotation=(0, 0.07, -0.06))
    key_bone(arm, "ear_R", 69, rotation=(0, -0.02, 0.02))

    begin_action(arm, "WalkStart", 18)
    key_bone(arm, "pelvis", 10, location=(0, 0, -0.05), rotation=(0.05, 0, 0))
    key_bone(arm, "chest", 18, rotation=(0.06, 0, 0))

    begin_action(arm, "Walk", 32)
    for frame, phase in ((1, 1), (9, 0), (17, -1), (25, 0), (32, 1)):
        key_bone(arm, "front_upper_L", frame, rotation=(phase * 0.32, 0, phase * 0.025))
        key_bone(arm, "front_upper_R", frame, rotation=(-phase * 0.32, 0, phase * 0.025))
        key_bone(arm, "rear_thigh_L", frame, rotation=(-phase * 0.27, 0, 0))
        key_bone(arm, "rear_thigh_R", frame, rotation=(phase * 0.27, 0, 0))
        key_bone(arm, "front_elbow_L", frame, rotation=(max(0, -phase) * 0.38, 0, 0))
        key_bone(arm, "front_elbow_R", frame, rotation=(max(0, phase) * 0.38, 0, 0))
        key_bone(arm, "rear_knee_L", frame, rotation=(max(0, phase) * -0.34, 0, 0))
        key_bone(arm, "rear_knee_R", frame, rotation=(max(0, -phase) * -0.34, 0, 0))
        key_bone(arm, "pelvis", frame, location=(0, 0, 0.025 if phase == 0 else 0), rotation=(0, phase * 0.025, phase * 0.028))
        key_bone(arm, "chest", frame, rotation=(0, -phase * 0.018, -phase * 0.020))
        key_bone(arm, "head", frame, rotation=(0, phase * 0.012, phase * 0.015))
        key_bone(arm, "tail_01", frame, rotation=(0, -phase * 0.18, -phase * 0.05))

    begin_action(arm, "WalkStop", 18)
    key_bone(arm, "pelvis", 8, location=(0, 0, -0.035), rotation=(-0.035, 0, 0))
    key_bone(arm, "chest", 8, rotation=(-0.04, 0, 0))

    for name, direction in (("TurnLeft", 1), ("TurnRight", -1)):
        begin_action(arm, name, 24)
        key_bone(arm, "pelvis", 12, rotation=(0, 0, direction * 0.11))
        key_bone(arm, "chest", 12, rotation=(0, direction * 0.12, direction * 0.08))
        key_bone(arm, "head", 12, rotation=(0, direction * 0.28, direction * 0.04))

    # Articulated shoulder -> elbow -> wrist -> paw greeting.
    begin_action(arm, "Wave", 72)
    for frame, lift, wave in ((1, 0, 0), (14, 0.65, 0), (26, 1, 1), (38, 1, -1), (50, 1, 1), (60, 0.6, 0), (72, 0, 0)):
        key_bone(arm, "front_shoulder_L", frame, rotation=(-0.18 * lift, -0.18 * lift, -0.72 * lift))
        key_bone(arm, "front_upper_L", frame, rotation=(-0.42 * lift, 0.20 * lift, -0.60 * lift))
        key_bone(arm, "front_elbow_L", frame, rotation=(0.48 * lift, 0, -0.30 * lift))
        key_bone(arm, "front_lower_L", frame, rotation=(0, 0, -0.25 * lift + wave * 0.16))
        key_bone(arm, "front_wrist_L", frame, rotation=(0, 0, wave * 0.34))
        key_bone(arm, "front_paw_L", frame, rotation=(0.10 * lift, 0, wave * 0.22))
        key_bone(arm, "chest", frame, rotation=(0, 0.07 * lift, 0.07 * lift))
        key_bone(arm, "head", frame, rotation=(0, -0.05 * lift, -0.08 * lift))
        key_bone(arm, "tail_01", frame, rotation=(0, 0.14 * lift, -0.06 * lift))

    jump_specs = {
        "JumpAnticipation": (18, -0.16, (1.10, 1.10, 0.82)),
        "JumpTakeoff": (12, 0.20, (0.94, 0.94, 1.12)),
        "JumpAirborne": (22, 0.38, (0.97, 0.97, 1.06)),
        "JumpLand": (14, -0.13, (1.12, 1.12, 0.80)),
        "JumpRecovery": (20, 0.04, (0.98, 0.98, 1.03)),
    }
    for name, (end, height, body_scale) in jump_specs.items():
        begin_action(arm, name, end)
        mid = max(2, end // 2)
        key_bone(arm, "root", mid, location=(0, 0, height))
        key_bone(arm, "pelvis", mid, location=(0, 0, height * 0.20), scale=body_scale)
        key_bone(arm, "chest", mid, rotation=(-height * 0.20, 0, 0), scale=(1, 1, body_scale[2]))
        tuck = 0.42 if height > 0 else -0.18
        for bone in ("front_elbow_L", "front_elbow_R", "rear_knee_L", "rear_knee_R"):
            key_bone(arm, bone, mid, rotation=(tuck, 0, 0))
        key_bone(arm, "tail_01", mid, rotation=(0, -height * 0.35, height * 0.25))
        key_bone(arm, "mane_top", mid, rotation=(height * 0.16, 0, 0))

    begin_action(arm, "Celebrate", 64)
    for frame, amount in ((1, 0), (16, 1), (30, -0.25), (44, 1), (64, 0)):
        key_bone(arm, "front_shoulder_L", frame, rotation=(-0.35 * abs(amount), 0, -0.85 * amount))
        key_bone(arm, "front_shoulder_R", frame, rotation=(-0.35 * abs(amount), 0, 0.85 * amount))
        key_bone(arm, "front_elbow_L", frame, rotation=(0.38 * abs(amount), 0, -0.25 * amount))
        key_bone(arm, "front_elbow_R", frame, rotation=(0.38 * abs(amount), 0, 0.25 * amount))
        key_bone(arm, "pelvis", frame, location=(0, 0, 0.08 * abs(amount)), rotation=(0, 0, 0.05 * amount))
        key_bone(arm, "head", frame, rotation=(0, 0, -0.06 * amount))
        key_bone(arm, "tail_01", frame, rotation=(0, 0.22 * amount, 0.08 * amount))

    arm.animation_data.action = bpy.data.actions.get("Idle")


def setup_preview(model, arm):
    ground_mat = material("Preview Grass", (0.22, 0.58, 0.12), 0.8)
    bpy.ops.mesh.primitive_cylinder_add(vertices=64, radius=1.55, depth=0.16, location=(0, 0, -0.09))
    ground = bpy.context.object
    ground.name = "Preview Ground"
    ground.data.materials.append(ground_mat)
    for poly in ground.data.polygons:
        poly.use_smooth = True

    bpy.ops.object.camera_add(location=(0, -8.0, 3.15))
    camera = bpy.context.object
    camera.name = "Preview Camera"
    target = Vector((0, 0, 1.45))
    camera.rotation_euler = (target - camera.location).to_track_quat("-Z", "Y").to_euler()
    camera.data.lens = 58
    bpy.context.scene.camera = camera

    bpy.ops.object.light_add(type="AREA", location=(3.2, -4.0, 5.2))
    key = bpy.context.object
    key.data.energy = 620
    key.data.shape = "DISK"
    key.data.size = 4.0
    key.rotation_euler = (Vector((0, 0, 1.6)) - key.location).to_track_quat("-Z", "Y").to_euler()
    bpy.ops.object.light_add(type="AREA", location=(-3.0, -2.0, 2.8))
    fill = bpy.context.object
    fill.data.energy = 280
    fill.data.color = (0.45, 0.65, 1.0)
    fill.data.size = 3.0
    fill.rotation_euler = (Vector((0, 0, 1.5)) - fill.location).to_track_quat("-Z", "Y").to_euler()
    bpy.ops.object.light_add(type="AREA", location=(0, 2.0, 4.5))
    rim = bpy.context.object
    rim.data.energy = 430
    rim.data.color = (1.0, 0.35, 0.08)
    rim.data.size = 2.5
    rim.rotation_euler = (Vector((0, 0, 1.8)) - rim.location).to_track_quat("-Z", "Y").to_euler()

    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = 720
    scene.render.resolution_y = 720
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.film_transparent = True
    scene.render.filepath = str(PREVIEW_PATH)
    scene.render.image_settings.color_mode = "RGBA"
    scene.world.color = (0.025, 0.05, 0.09)
    scene.view_settings.look = "AgX - Medium High Contrast"
    scene.frame_set(1)
    bpy.ops.render.render(write_still=True)
    arm.animation_data.action = bpy.data.actions.get("Wave")
    scene.frame_set(38)
    scene.render.filepath = str(WAVE_PREVIEW_PATH)
    bpy.ops.render.render(write_still=True)
    arm.animation_data.action = bpy.data.actions.get("Idle")
    scene.frame_set(1)
    return ground


def export_glb(model, arm):
    bpy.ops.object.select_all(action="DESELECT")
    arm.select_set(True)
    for obj in model:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = arm
    bpy.ops.export_scene.gltf(
        filepath=str(GLB_PATH),
        export_format="GLB",
        use_selection=True,
        export_animations=True,
        export_animation_mode="ACTIONS",
        export_skins=True,
        export_morph=True,
        export_morph_animation=True,
        export_morph_normal=False,
        export_yup=True,
        export_def_bones=True,
        export_armature_object_remove=True,
        export_leaf_bone=False,
        export_materials="EXPORT",
        export_cameras=False,
        export_lights=False,
        export_extras=True,
        export_force_sampling=True,
        export_optimize_animation_size=True,
    )


def main():
    clear_scene()
    arm = create_armature()
    model = build_model(arm)
    build_actions(arm)
    export_glb(model, arm)
    setup_preview(model, arm)
    bpy.ops.wm.save_as_mainfile(filepath=str(BLEND_PATH))
    print(f"BLEND={BLEND_PATH}")
    print(f"GLB={GLB_PATH}")
    print(f"PREVIEW={PREVIEW_PATH}")
    print(f"WAVE_PREVIEW={WAVE_PREVIEW_PATH}")


if __name__ == "__main__":
    main()
