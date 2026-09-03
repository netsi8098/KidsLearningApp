"""
export_home_environment.py — GLB export for the River Garden world.

The exported asset is the deliverable, not the .blend. Anything that only works
inside Blender is not finished, so this script prepares the scene for glTF
rather than trusting that EEVEE and the browser agree.

Run:
  blender --background art/blender/home_environment.blend \
    --factory-startup --python tools/blender/export_home_environment.py

Output:
  public/assets/worlds/river-garden/home_environment.glb

WHAT THIS DOES BEFORE EXPORTING
  - applies object scale, so runtime placement maths is honest. The validator
    had been reporting ~197 objects carrying non-uniform scale; that survives
    glTF but makes every coordinate the runtime reads misleading.
  - keeps the MARKERS empties: they become named glTF nodes, which is how the
    runtime finds MARK_LionSpawn instead of hard-coding a position.
  - keeps CAM_Home_Main so the approved framing travels with the asset.

LIGHTING NOTE
  Lights are deliberately NOT exported. Blender emits KHR_lights_punctual, and a
  Blender area light's watts convert to a three.js intensity far outside the
  runtime budget — the browser rendered pure white and ignored the app's own
  lights, because the DCC lights were the ones doing the work. Lighting belongs
  to the runtime, where shadow cost can be controlled.

COORDINATE NOTE
  glTF is Y-up; Blender is Z-up. The exporter converts, so a marker authored at
  Blender (x, y, z) arrives as glTF (x, z, -y). Runtime code must read the node
  transform rather than re-deriving positions from the Blender numbers.
"""

import os
import sys

import bpy

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(REPO, "public", "assets", "worlds", "river-garden", "home_environment.glb")


def apply_scales():
    """Apply object scale on every mesh so exported transforms are clean."""
    bpy.ops.object.select_all(action="DESELECT")
    meshes = [o for o in bpy.data.objects if o.type == "MESH"]
    for o in meshes:
        o.select_set(True)
    if meshes:
        bpy.context.view_layer.objects.active = meshes[0]
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    bpy.ops.object.select_all(action="DESELECT")
    return len(meshes)


def main():
    # Optimise before exporting: join by material (draw calls) and bake AO into
    # vertex colours (look development). Both run on the in-memory scene so the
    # .blend stays editable with named individual objects — only the export
    # artifact is optimised.
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    import optimize_and_bake
    optimize_and_bake.main()

    applied = apply_scales()
    os.makedirs(os.path.dirname(OUT), exist_ok=True)

    bpy.ops.export_scene.gltf(
        filepath=OUT,
        export_format="GLB",
        use_selection=False,
        use_visible=True,
        export_apply=True,           # evaluate modifiers
        export_cameras=True,         # approved framing travels with the asset
        export_lights=False,         # runtime owns lighting; see note below
        export_extras=True,          # custom props survive for runtime metadata
        export_yup=True,
        export_texcoords=True,
        export_normals=True,
        export_vertex_color="MATERIAL",   # carries the baked AO as COLOR_0
        export_materials="EXPORT",
        export_animations=False,     # the environment is static; the lion animates
    )

    size = os.path.getsize(OUT)
    meshes = [o for o in bpy.data.objects if o.type == "MESH"]
    tris = 0
    for o in meshes:
        o.data.calc_loop_triangles()
        tris += len(o.data.loop_triangles)

    print("\n===ENV_EXPORT===")
    print(f"GLB={OUT}")
    print(f"BYTES={size}")
    print(f"MB={size / 1048576:.2f}")
    print(f"SCALES_APPLIED={applied}")
    print(f"MESH_OBJECTS={len(meshes)}")
    print(f"TRIS={tris}")
    print(f"MATERIALS={len(bpy.data.materials)}")
    print(f"MARKERS={sorted(o.name for o in bpy.data.objects if o.type == 'EMPTY')}")
    print("===ENV_EXPORT_END===")


if __name__ == "__main__":
    main()
