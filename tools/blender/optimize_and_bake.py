"""
optimize_and_bake.py — export preparation: draw-call reduction + baked AO.

Two production problems solved in one pass, because they share a prerequisite.

DRAW CALLS
  The world exports as 543 separate meshes, which is 543 draw calls. That is the
  number that actually costs frames on a tablet — far more than the triangle
  count. Objects are joined by material, taking the scene to roughly one draw
  call per material.

  Joining happens HERE, not in the .blend. The source file stays editable with
  named individual objects; only the export artifact is optimised.

LOOK DEVELOPMENT
  Untextured Principled surfaces read as smooth clay because nothing darkens
  where forms meet. Ambient occlusion is baked to VERTEX COLOURS rather than
  textures:

    - glTF multiplies COLOR_0 into base colour automatically, and three.js sets
      material.vertexColors when it is present, so it works with no runtime code
    - it costs zero texture memory and no extra HTTP requests
    - it survives mesh joining, unlike per-object UV layouts
    - for soft rounded stylised forms, contact darkening is most of what a
      texture pass would buy anyway

  A macro tonal gradient is multiplied in at the same time so large surfaces stop
  reading as one flat colour.

Run (as part of export):
  blender --background art/blender/home_environment.blend \
    --factory-startup --python tools/blender/optimize_and_bake.py
"""

import math
import os
import sys

import bpy
from mathutils import Vector

AO_SAMPLES = 24          # enough for soft contact shading; this is not a render
AO_DISTANCE = 2.20       # metres — how far a surface "feels" its neighbours
AO_FLOOR = 0.30          # never fully black; children's art keeps its shadows open


def join_by_material():
    """Join mesh objects that share a material into one object each."""
    bpy.ops.object.select_all(action="DESELECT")

    groups = {}
    for obj in [o for o in bpy.data.objects if o.type == "MESH"]:
        if not obj.data.materials:
            continue
        key = obj.data.materials[0].name
        groups.setdefault(key, []).append(obj)

    before = len([o for o in bpy.data.objects if o.type == "MESH"])
    merged = 0

    for mat_name, objs in groups.items():
        if len(objs) < 2:
            merged += 1
            continue
        bpy.ops.object.select_all(action="DESELECT")
        for o in objs:
            o.select_set(True)
        bpy.context.view_layer.objects.active = objs[0]
        bpy.ops.object.join()
        joined = bpy.context.view_layer.objects.active
        joined.name = f"ENV_Merged_{mat_name.replace('ENV_', '')}"
        merged += 1

    bpy.ops.object.select_all(action="DESELECT")
    after = len([o for o in bpy.data.objects if o.type == "MESH"])
    print(f"[optimize] joined {before} meshes -> {after} ({merged} material groups)")
    return before, after


def ensure_color_attribute(obj):
    """Every mesh needs a COLOR_0 attribute for glTF to carry the bake."""
    mesh = obj.data
    if not mesh.color_attributes:
        mesh.color_attributes.new(name="AO", type="BYTE_COLOR", domain="CORNER")
    # glTF exports the ACTIVE colour attribute
    mesh.color_attributes.active_color_index = 0
    return mesh.color_attributes[0]


def bake_ao_vertex_colors():
    """Bake ambient occlusion into vertex colours using Cycles."""
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.samples = AO_SAMPLES
    scene.cycles.use_denoising = False
    scene.cycles.device = "CPU"
    scene.render.bake.target = "VERTEX_COLORS"
    scene.render.bake.use_pass_direct = False
    scene.render.bake.use_pass_indirect = False
    if hasattr(scene.world, "light_settings"):
        scene.world.light_settings.distance = AO_DISTANCE

    meshes = [o for o in bpy.data.objects if o.type == "MESH"]
    for obj in meshes:
        ensure_color_attribute(obj)

    bpy.ops.object.select_all(action="DESELECT")
    for obj in meshes:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = meshes[0]

    try:
        bpy.ops.object.bake(type="AO")
        print(f"[bake] AO baked to vertex colours on {len(meshes)} meshes")
        return True
    except Exception as exc:                      # noqa: BLE001 - report and continue
        print(f"[bake] AO bake FAILED: {exc}")
        return False


def lift_and_tint_vertex_colors():
    """Open up the AO and shift it toward a warm/cool split.

    Raw greyscale AO reads as dirt, and multiplying pure grey only ever makes a
    surface darker — never richer. Real shading has HUE separation: light
    surfaces skew warm, occluded ones skew cool. Doing that here costs nothing at
    runtime (it is still just COLOR_0) but is most of what separates painted
    surfaces from flat clay.

    A macro height gradient is folded in at the same time so large forms stop
    reading as one flat colour.
    """
    warm = Vector((1.045, 1.012, 0.955))   # sunlit
    cool = Vector((0.878, 0.938, 1.030))   # skylit shadow

    for obj in [o for o in bpy.data.objects if o.type == "MESH"]:
        mesh = obj.data
        if not mesh.color_attributes:
            continue
        attr = mesh.color_attributes[0]
        if attr.domain != "CORNER":
            continue

        world = obj.matrix_world
        zs = [(world @ v.co).z for v in mesh.vertices] or [0.0]
        z_min, z_max = min(zs), max(zs)
        z_span = max(z_max - z_min, 1e-4)

        for poly in mesh.polygons:
            for li in poly.loop_indices:
                vi = mesh.loops[li].vertex_index
                ao = attr.data[li].color[0]              # AO bakes greyscale

                # Lift the floor so occlusion stays open, never crushed black.
                lit = AO_FLOOR + (1.0 - AO_FLOOR) * ao

                # Hue split: exposed surfaces warm, occluded surfaces cool.
                tint = cool.lerp(warm, max(0.0, min(1.0, ao)))

                # Macro gradient: brighter toward the top of each form, which
                # reads as sky light without costing a texture.
                z = (world @ mesh.vertices[vi].co).z
                macro = 0.93 + 0.12 * ((z - z_min) / z_span)

                r = max(0.0, min(1.0, lit * tint.x * macro))
                g = max(0.0, min(1.0, lit * tint.y * macro))
                b = max(0.0, min(1.0, lit * tint.z * macro))
                attr.data[li].color = (r, g, b, 1.0)
    print("[bake] vertex colours lifted with warm/cool split and macro gradient")


def wire_vertex_colors_into_materials():
    """Multiply the colour attribute into each material's base colour.

    Needed so BLENDER previews match what the browser will do — glTF multiplies
    COLOR_0 into base colour automatically, but Blender does not unless the node
    graph says so. Without this the Blender render and the runtime disagree,
    which is precisely the class of bug this pipeline keeps hitting.
    """
    for mat in bpy.data.materials:
        if not mat.use_nodes:
            continue
        nt = mat.node_tree
        bsdf = next((n for n in nt.nodes if n.type == "BSDF_PRINCIPLED"), None)
        if not bsdf:
            continue
        if any(n.type == "VERTEX_COLOR" for n in nt.nodes):
            continue

        base = bsdf.inputs["Base Color"].default_value[:]
        col = nt.nodes.new("ShaderNodeVertexColor")
        col.layer_name = "AO"
        rgb = nt.nodes.new("ShaderNodeRGB")
        rgb.outputs[0].default_value = base
        mix = nt.nodes.new("ShaderNodeMix")
        mix.data_type = "RGBA"
        mix.blend_type = "MULTIPLY"
        mix.inputs["Factor"].default_value = 1.0

        nt.links.new(rgb.outputs[0], mix.inputs[6])     # A
        nt.links.new(col.outputs["Color"], mix.inputs[7])  # B
        nt.links.new(mix.outputs[2], bsdf.inputs["Base Color"])
    print("[bake] vertex colours wired into materials for Blender parity")


def main():
    before, after = join_by_material()
    baked = bake_ao_vertex_colors()
    if baked:
        lift_and_tint_vertex_colors()
        wire_vertex_colors_into_materials()

    meshes = [o for o in bpy.data.objects if o.type == "MESH"]
    tris = 0
    for o in meshes:
        o.data.calc_loop_triangles()
        tris += len(o.data.loop_triangles)

    print("\n===ENV_OPTIMIZE===")
    print(f"MESHES_BEFORE={before}")
    print(f"MESHES_AFTER={after}")
    print(f"AO_BAKED={baked}")
    print(f"TRIS={tris}")
    print(f"MATERIALS={len(bpy.data.materials)}")
    print("===ENV_OPTIMIZE_END===")


if __name__ == "__main__":
    main()
