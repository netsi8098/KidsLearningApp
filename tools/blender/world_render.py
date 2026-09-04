"""
world_render.py — the look-at-the-world step, made repeatable.

WHY IT IS SEPARATE FROM THE BUILDER

`build_home_environment.py` already renders three previews, and that is the
problem: the renders only happen when the world is rebuilt. Judging a change
therefore means a full rebuild, and measuring the existing blend means having no
picture of it. Every other asset in this repo learned the same lesson — the
lion's `review_render.py` is separate from `cage_lion.py` for exactly this
reason — so the world gets the same split.

It also adds the shot the previews were missing: the world WITH THE CHARACTER IN
IT, at the character's true 1.30 m. Scale is a relationship, and three renders
of an empty landscape cannot show one. A grey box of the right height is enough
to answer "can the lion walk under that tree", which is the question that went
unanswered long enough to ship a 1.82 m tree.

Run (via `npm run world:review`, or directly):
  blender --background art/blender/home_environment.blend --factory-startup \
    --python tools/blender/world_render.py
"""
import math
import os

import bpy
from mathutils import Vector

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(REPO, "docs", "assets", "home-environment")

RES_X = int(os.environ.get("WORLD_RES_X", "1280"))
RES_Y = int(os.environ.get("WORLD_RES_Y", "800"))

# The character's shipped height. `HomeWorld3D` scales the GLB to this, so it is
# the only number in the world that is not negotiable.
LION_H = 1.30


def engine():
    names = bpy.context.scene.render.bl_rna.properties["engine"].enum_items.keys()
    return "BLENDER_EEVEE_NEXT" if "BLENDER_EEVEE_NEXT" in names else "BLENDER_EEVEE"


def scale_proxy():
    """A plain box at the character's height, standing on MARK_LionSpawn.

    Deliberately featureless and deliberately grey. This is a ruler, not a
    stand-in for the lion: giving it a shape invites judging the lion's design
    from it, and giving it the lion's colours makes the render look finished
    when it is a measurement.
    """
    spawn = bpy.data.objects.get("MARK_LionSpawn")
    at = spawn.matrix_world.translation if spawn else Vector((0.0, 0.0, 0.0))
    me = bpy.data.meshes.new("REVIEW_ScaleProxy")
    bm_v = [
        (-0.22, -0.42, 0.0), (0.22, -0.42, 0.0), (0.22, 0.42, 0.0), (-0.22, 0.42, 0.0),
        (-0.22, -0.42, LION_H), (0.22, -0.42, LION_H), (0.22, 0.42, LION_H),
        (-0.22, 0.42, LION_H),
    ]
    faces = [(0, 1, 2, 3), (4, 7, 6, 5), (0, 4, 5, 1),
             (1, 5, 6, 2), (2, 6, 7, 3), (3, 7, 4, 0)]
    me.from_pydata([Vector(v) + at for v in bm_v], [], faces)
    me.update()
    mat = bpy.data.materials.new("REVIEW_ProxyGrey")
    mat.diffuse_color = (0.30, 0.30, 0.32, 1.0)
    mat.roughness = 0.9
    me.materials.append(mat)
    obj = bpy.data.objects.new("REVIEW_ScaleProxy", me)
    bpy.context.scene.collection.objects.link(obj)
    return obj


def main():
    os.makedirs(OUT, exist_ok=True)
    sc = bpy.context.scene
    sc.render.engine = engine()
    sc.render.resolution_x, sc.render.resolution_y = RES_X, RES_Y
    sc.render.film_transparent = False
    sc.render.image_settings.file_format = "PNG"

    cam = bpy.data.objects.get("CAM_Home_Main")
    if cam is None:
        cam = bpy.data.objects.new("CAM_Review", bpy.data.cameras.new("CAM_Review"))
        sc.collection.objects.link(cam)
    sc.camera = cam
    home_loc, home_rot = cam.location.copy(), cam.rotation_euler.copy()

    proxy = scale_proxy()

    shots = [
        # The locked production framing, twice: without the ruler for judging
        # the art, and with it for judging the scale. Same camera both times so
        # the pair can be flipped between.
        ("00-home-main", home_loc, home_rot, False),
        ("01-home-main-scale", home_loc, home_rot, True),
        ("02-side", Vector((13.0, -7.0, 4.6)),
         (math.radians(76), 0.0, math.radians(58)), True),
        ("03-high", Vector((0.0, -8.0, 8.2)), (math.radians(56), 0.0, 0.0), True),
        # Down at the character's eye line, which is the only angle that shows
        # whether the world reads from where the lion is rather than from where
        # the camera happens to sit.
        ("04-eye-level", Vector((0.0, 4.6, 0.45 + 0.85)),
         (math.radians(88), 0.0, math.radians(180)), True),
    ]

    for tag, loc, rot, with_proxy in shots:
        proxy.hide_render = not with_proxy
        cam.location = loc
        cam.rotation_euler = rot
        sc.render.filepath = os.path.join(OUT, f"{tag}.png")
        bpy.ops.render.render(write_still=True)
        print(f"[world] {tag}.png")

    cam.location, cam.rotation_euler = home_loc, home_rot
    bpy.data.objects.remove(proxy, do_unlink=True)
    print(f"SHOTS={len(shots)}")


if __name__ == "__main__":
    main()
