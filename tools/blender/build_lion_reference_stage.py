"""Build an offline Blender review stage for the approved lion identity.

The file overlays the current proportion blockout on four consistent reference
views. It is a modeling aid only: it exports no GLB and is not connected to the
React application.

Run with:
  blender --background --factory-startup --python tools/blender/build_lion_reference_stage.py
"""

from __future__ import annotations

import math
from pathlib import Path

import bpy
from mathutils import Vector


ROOT = Path(__file__).resolve().parents[2]
SOURCE_BLEND = ROOT / "art/blender/lion_proportion_study.blend"
OUTPUT_BLEND = ROOT / "art/blender/lion_reference_stage.blend"
REFERENCE_DIR = ROOT / "art/blender/references/turnaround"

REFERENCE_FILES = {
    "Front": REFERENCE_DIR / "front.png",
    "Side": REFERENCE_DIR / "side.png",
    "Rear": REFERENCE_DIR / "rear.png",
    "ThreeQuarter": REFERENCE_DIR / "three-quarter.png",
}

EXCLUDED_SOURCE_OBJECTS = {
    "GroundPlane",
    "KeyLight",
    "FillLight",
    "RimLight",
    "ProportionReviewCamera",
}


def clear_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)


def get_or_create_collection(name):
    collection = bpy.data.collections.get(name)
    if collection is None:
        collection = bpy.data.collections.new(name)
        bpy.context.scene.collection.children.link(collection)
    return collection


def append_blockout():
    if not SOURCE_BLEND.exists():
        raise FileNotFoundError(
            f"Missing {SOURCE_BLEND}. Run build_lion_proportion_study.py first."
        )

    with bpy.data.libraries.load(str(SOURCE_BLEND), link=False) as (source, target):
        target.objects = [
            name
            for name in source.objects
            if name not in EXCLUDED_SOURCE_OBJECTS
        ]

    collection = get_or_create_collection("Blockout_v2_REFERENCE_ONLY")
    for obj in target.objects:
        if obj is None:
            continue
        collection.objects.link(obj)
        obj["production_status"] = "unapproved_proportion_study"


def look_at(obj, point):
    direction = Vector(point) - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def add_camera(name, location, target, image_path, orthographic=True):
    bpy.ops.object.camera_add(location=location)
    camera = bpy.context.object
    camera.name = f"REF_{name}"
    look_at(camera, target)
    camera.data.lens = 58
    if orthographic:
        camera.data.type = "ORTHO"
        camera.data.ortho_scale = 3.65

    image = bpy.data.images.load(str(image_path), check_existing=True)
    background = camera.data.background_images.new()
    background.image = image
    background.alpha = 0.62
    background.display_depth = "BACK"
    background.frame_method = "FIT"
    camera.data.show_background_images = True
    camera["reference_source"] = str(image_path.relative_to(ROOT))
    return camera


def make_guide_material():
    material = bpy.data.materials.new("Reference Guide")
    material.diffuse_color = (0.1, 0.65, 1.0, 1.0)
    return material


def add_line(name, start, end, material, collection):
    curve_data = bpy.data.curves.new(name, type="CURVE")
    curve_data.dimensions = "3D"
    curve_data.bevel_depth = 0.008
    curve_data.bevel_resolution = 2
    spline = curve_data.splines.new("POLY")
    spline.points.add(1)
    spline.points[0].co = (*start, 1.0)
    spline.points[1].co = (*end, 1.0)
    curve_data.materials.append(material)
    obj = bpy.data.objects.new(name, curve_data)
    collection.objects.link(obj)
    obj.hide_render = True
    return obj


def add_measurement_guides():
    collection = get_or_create_collection("Reference_Measurement_Guides")
    material = make_guide_material()

    # Current target envelope from the reference plates. These guides are review
    # checkpoints, not final production measurements.
    for name, height in (
        ("Ground", 0.0),
        ("PawTop", 0.32),
        ("Shoulder", 1.42),
        ("EyeLine", 2.18),
        ("ManeTop", 3.02),
    ):
        add_line(
            f"GUIDE_{name}",
            (-1.8, -2.35, height),
            (1.8, -2.35, height),
            material,
            collection,
        )

    add_line(
        "GUIDE_Centerline",
        (0.0, -2.35, 0.0),
        (0.0, -2.35, 3.3),
        material,
        collection,
    )


def setup_scene():
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = 768
    scene.render.resolution_y = 512
    scene.render.resolution_percentage = 100
    scene.view_settings.look = "AgX - Medium High Contrast"

    world = scene.world
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = (
        0.055,
        0.065,
        0.085,
        1.0,
    )
    world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.35

    cameras = {
        "Front": add_camera(
            "Front",
            (0.0, -10.0, 1.55),
            (0.0, 0.0, 1.55),
            REFERENCE_FILES["Front"],
        ),
        "Side": add_camera(
            "Side",
            (10.0, 0.0, 1.55),
            (0.0, 0.0, 1.55),
            REFERENCE_FILES["Side"],
        ),
        "Rear": add_camera(
            "Rear",
            (0.0, 10.0, 1.55),
            (0.0, 0.0, 1.55),
            REFERENCE_FILES["Rear"],
        ),
        "ThreeQuarter": add_camera(
            "ThreeQuarter",
            (7.0, -7.0, 2.65),
            (0.0, 0.0, 1.45),
            REFERENCE_FILES["ThreeQuarter"],
            orthographic=False,
        ),
    }
    scene.camera = cameras["ThreeQuarter"]
    scene["review_instruction"] = (
        "Match the video close-ups first; use this generated turnaround only "
        "for hidden orthographic anatomy. Do not rig or export yet."
    )


for path in REFERENCE_FILES.values():
    if not path.exists():
        raise FileNotFoundError(f"Missing reference plate: {path}")

clear_scene()
append_blockout()
add_measurement_guides()
setup_scene()
bpy.ops.wm.save_as_mainfile(filepath=str(OUTPUT_BLEND))
print(f"Saved lion reference stage: {OUTPUT_BLEND}")
