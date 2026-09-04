"""
review_render.py — the look-at-it step, made repeatable.

WHY THIS EXISTS
Across a long session on this asset, the expensive mistakes were not missing
tools. They were judging geometry from numbers and being wrong:

  * the ear was "too high" on a comparison of a per-band MAX against a
    band-CENTRE, and two corrections were built and reverted before the metric
    itself turned out to be the fault;
  * the mane's hard-edged read was blamed on the outer hood twice — once on a
    step function in `polar_radius`, once on terracing in `fit_to_measured` —
    and was actually the inner aperture shell, which was never a circle;
  * that was only found on a FRONT-LIT isolated render, because the earlier
    isolated render lit the mane from 40 degrees azimuth and left its front in
    shadow. Several passes were spent judging an unlit surface.

So the fix is not interactive editing — the build scripts are deliberately the
source of truth here, and hand-poking a mesh produces changes nobody can
reproduce. The fix is that looking at it properly must be ONE COMMAND, with
the lighting and the angles already correct, so it happens every pass instead
of being improvised each time.

WHAT IT GUARANTEES
  * KEY LIGHT FROM THE CAMERA SIDE. Every sheet is lit from roughly the
    viewing direction plus a side fill. A surface in shadow cannot be judged.
  * ISOLATED SHEETS. The mane alone and the face alone, because a defect on
    one part is invisible when the others are occluding it.
  * FIXED ANGLES AND FRAMING, so two runs are comparable.
  * EXPRESSIONS AND POSES, since a rig that looks right at rest can still be
    wrong the moment a morph or a bone moves.

Run (via `npm run lion:review`, or directly):
  blender --background art/blender/lion_assembled.blend --factory-startup \
    --python tools/blender/review_render.py

Outputs:
  docs/assets/lion-review/*.png
"""

import math
import os
import sys

import bpy
from mathutils import Vector

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(REPO, "docs", "assets", "lion-review")

RES = int(os.environ.get("LION_REVIEW_RES", "560"))


def engine():
    names = bpy.context.scene.render.bl_rna.properties["engine"].enum_items.keys()
    return "BLENDER_EEVEE_NEXT" if "BLENDER_EEVEE_NEXT" in names else "BLENDER_EEVEE"


def setup():
    sc = bpy.context.scene
    sc.render.engine = engine()
    sc.render.resolution_x = sc.render.resolution_y = RES
    sc.render.film_transparent = False
    sc.render.image_settings.file_format = "PNG"

    world = bpy.data.worlds.new("review")
    sc.world = world
    world.use_nodes = True
    # A mid grey, not black. On black the silhouette is all you can see, and
    # silhouette is the one thing already measured to four decimal places.
    world.node_tree.nodes["Background"].inputs[0].default_value = (0.26, 0.28, 0.32, 1.0)

    cam_data = bpy.data.cameras.new("review_cam")
    cam = bpy.data.objects.new("review_cam", cam_data)
    sc.collection.objects.link(cam)
    sc.camera = cam
    return cam


def raking_lights(azimuth_deg):
    """A low, near-tangential key. The only way to judge SURFACE detail.

    The front-lit rig below exists because a surface in shadow cannot be
    judged, and it has now hidden two consecutive surface passes:

      * the cavity + curvature bake shifted the isolated mane's mean luminance
        by 5 of 255 here and reads plainly in the browser;
      * the mane's normal map changed this sheet by EXACTLY NOTHING — identical
        local contrast to three decimal places — while being verifiably wired,
        1024x1024, with live pixel data.

    The second one is not a coincidence, it is Lambert. Front lighting puts the
    light along the view axis, and cos(theta) is flattest at theta = 0, so a
    perturbed normal barely changes its own shading. A normal map is invisible
    under a head-on key by construction.

    So the detail shots get a key raked round to 78 degrees off the view axis
    and dropped to 12 degrees of elevation, which is what makes relief throw a
    shadow across itself. Front-lit for form and silhouette; raked for surface.
    """
    for o in [o for o in bpy.data.objects if o.type == "LIGHT"]:
        bpy.data.objects.remove(o, do_unlink=True)
    key = bpy.data.objects.new("rake", bpy.data.lights.new("rake", type="SUN"))
    bpy.context.scene.collection.objects.link(key)
    key.data.energy = 3.9
    key.rotation_euler = (math.radians(78), 0.0, math.radians(azimuth_deg + 74))
    fill = bpy.data.objects.new("rakefill", bpy.data.lights.new("rakefill", type="SUN"))
    bpy.context.scene.collection.objects.link(fill)
    fill.data.energy = 0.55
    fill.rotation_euler = (math.radians(30), 0.0, math.radians(azimuth_deg - 120))


def lights(azimuth_deg):
    """Key from the camera's side, fill from the other. Rebuilt per shot.

    This is the whole point of the file. A fixed light rig means half the
    angles are backlit, and a backlit surface hides exactly the kind of
    shallow relief — lock definition, a socket rim, a decal seam — that this
    asset keeps getting wrong.
    """
    for o in [o for o in bpy.data.objects if o.type == "LIGHT"]:
        bpy.data.objects.remove(o, do_unlink=True)
    key = bpy.data.objects.new("key", bpy.data.lights.new("key", type="SUN"))
    bpy.context.scene.collection.objects.link(key)
    key.data.energy = 3.4
    key.rotation_euler = (math.radians(56), 0.0, math.radians(azimuth_deg + 16))

    fill = bpy.data.objects.new("fill", bpy.data.lights.new("fill", type="SUN"))
    bpy.context.scene.collection.objects.link(fill)
    fill.data.energy = 1.5
    fill.rotation_euler = (math.radians(38), 0.0, math.radians(azimuth_deg - 74))


def meshes():
    return [o for o in bpy.data.objects if o.type == "MESH"]


def armature():
    arms = [o for o in bpy.data.objects if o.type == "ARMATURE"]
    return max(arms, key=lambda a: len(a.data.bones)) if arms else None


def show_only(names):
    """Isolate a subset. `None` shows everything."""
    for o in meshes():
        o.hide_render = bool(names) and o.name not in names


def bounds(names=None):
    pts = []
    for o in meshes():
        if names and o.name not in names:
            continue
        pts += [o.matrix_world @ v.co for v in o.data.vertices]
    if not pts:
        return Vector((0, 0, 0)), 1.0
    lo = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
    hi = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
    return (lo + hi) / 2.0, max((hi - lo).x, (hi - lo).y, (hi - lo).z)


def shoot(cam, tag, target, dist, azimuth, elevation=8.0, lens=52.0, rake=False):
    raking_lights(azimuth) if rake else lights(azimuth)
    a, e = math.radians(azimuth), math.radians(elevation)
    cam.data.lens = lens
    cam.location = (target.x + math.sin(a) * math.cos(e) * dist,
                    target.y - math.cos(a) * math.cos(e) * dist,
                    target.z + math.sin(e) * dist)
    cam.rotation_euler = (target - Vector(cam.location)).to_track_quat("-Z", "Y").to_euler()
    bpy.context.scene.render.filepath = os.path.join(OUT, f"{tag}.png")
    bpy.ops.render.render(write_still=True)
    print(f"[review] {tag}.png")


def set_morph(name, value):
    hit = 0
    for o in meshes():
        keys = o.data.shape_keys
        if not keys:
            continue
        kb = keys.key_blocks.get(name)
        if kb:
            kb.value = value
            hit += 1
    return hit


def clear_morphs():
    for o in meshes():
        if o.data.shape_keys:
            for kb in o.data.shape_keys.key_blocks:
                if kb.name != "Basis":
                    kb.value = 0.0


def pose(arm, bone, rot_deg):
    pb = arm.pose.bones.get(bone)
    if not pb:
        return False
    pb.rotation_mode = "XYZ"
    pb.rotation_euler = [math.radians(a) for a in rot_deg]
    return True


def clear_pose(arm):
    for pb in arm.pose.bones:
        pb.rotation_mode = "XYZ"
        pb.rotation_euler = (0.0, 0.0, 0.0)


def main():
    os.makedirs(OUT, exist_ok=True)
    cam = setup()
    arm = armature()
    if arm and arm.animation_data:
        # Rest pose. A review sheet shot on whatever frame the file was saved on
        # is not comparable with the previous one.
        arm.animation_data.action = None
    if arm:
        clear_pose(arm)
    clear_morphs()

    all_names = [o.name for o in meshes()]
    mane = [n for n in all_names if "mane" in n.lower()]
    face = [n for n in all_names if n.startswith("LionFace") or "Ear_" in n]

    # ---- whole character -------------------------------------------------
    show_only(None)
    centre, size = bounds()
    d = size * 2.1
    for tag, az in (("01-body-front", 180), ("02-body-threequarter", 145),
                    ("03-body-side", 90), ("04-body-rear", 0)):
        shoot(cam, tag, centre, d, az)

    # ---- head, which is where the identity lives -------------------------
    #
    # THE TARGET IS DERIVED, NOT GUESSED. The first version placed it at
    # `centre.y * 0.4, centre.z + size * 0.30`, which landed inside the mane —
    # every head shot and the whole expression strip rendered the back of the
    # hood, and a sheet you cannot read is worse than no sheet.
    #
    # `LionFace_Gloss` carries the irises, catchlights and nose pad, so its
    # bounds ARE the face, by construction. Falling back to a fraction of the
    # body only when that mesh is absent.
    gloss = [n for n in all_names if n.endswith("Gloss")]
    if gloss:
        head_c, head_s = bounds(gloss)
        head_d = max(head_s * 4.2, 0.34)
    else:
        head_c = Vector((0.0, centre.y, centre.z + size * 0.30))
        head_d = size * 0.85
    for tag, az in (("05-head-front", 180), ("06-head-threequarter", 148)):
        shoot(cam, tag, head_c, head_d, az, elevation=5.0, lens=58.0)

    # ---- isolated mane ---------------------------------------------------
    # The sheet that finally found the aperture shell. Front-lit and alone.
    if mane:
        show_only(mane)
        mc, ms = bounds(mane)
        for tag, az in (("07-mane-front", 180), ("08-mane-threequarter", 142),
                        ("09-mane-side", 90), ("10-mane-top", 180)):
            shoot(cam, tag, mc, ms * 1.9, az,
                  elevation=58.0 if tag.endswith("top") else 8.0)
        show_only(None)

    # ---- isolated face parts --------------------------------------------
    if face:
        show_only(face)
        fc, fs = bounds(face)
        shoot(cam, "11-face-parts-alone", fc, fs * 2.2, 180, elevation=4.0, lens=58.0)
        show_only(None)

    # ---- expressions and poses ------------------------------------------
    # A rig that reads at rest can still break the moment something moves, and
    # every morph and bone here has broken at least once.
    strip = [
        ("12-smile", [("morph", "smile", 1.0)]),
        ("13-blink-L", [("morph", "blink_L", 1.0)]),
        ("14-mouth-round", [("morph", "mouth_round", 1.0)]),
        ("15-cheeks-up", [("morph", "cheeks_up", 1.0)]),
        ("16-jaw-open", [("bone", "jaw", (-28, 0, 0))]),
        ("17-gaze-left", [("bone", "eye_L", (0, 0, 24)), ("bone", "eye_R", (0, 0, 24))]),
        ("18-head-turn", [("bone", "head", (0, 0, 30))]),
    ]
    for tag, ops in strip:
        clear_morphs()
        if arm:
            clear_pose(arm)
        applied = True
        for kind, name, val in ops:
            ok = set_morph(name, val) if kind == "morph" else (arm and pose(arm, name, val))
            if not ok:
                applied = False
        if not applied:
            print(f"[review] SKIP {tag} — target missing from this asset")
            continue
        shoot(cam, tag, head_c, head_d, 178, elevation=5.0, lens=58.0)

    clear_morphs()
    if arm:
        clear_pose(arm)

    # ---- surface detail, RAKED ------------------------------------------
    # See `raking_lights`. These are the only shots on the sheet that can show
    # a normal map or a baked cavity at all.
    for tag, names, az in (("19-detail-mane-raked", mane, 178),
                           ("20-detail-head-raked", None, 172)):
        show_only(names)
        c, sz = (bounds(names) if names else (head_c, head_d / 4.2))
        d = sz * 1.9 if names else head_d
        shoot(cam, tag, c, d, az, elevation=6.0, lens=58.0, rake=True)
        show_only(None)

    files = sorted(f for f in os.listdir(OUT) if f.endswith(".png"))
    print("")
    print("===LION_REVIEW===")
    print(f"DIR={OUT}")
    print(f"SHEETS={len(files)}")
    print(f"MESHES={len(all_names)}  {all_names}")
    print(f"BONES={len(arm.data.bones) if arm else 0}")
    print("===LION_REVIEW_END===")


if __name__ == "__main__":
    main()
