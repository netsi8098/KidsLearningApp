"""
face_shapes.py — GATE 15/16. The 16 contract morph targets.

WHAT IS MEASURED HERE AND WHAT IS NOT — READ THIS FIRST
Every other number in this pipeline is measured off the turnaround. These
mostly are not, and pretending otherwise would be the worst kind of drift.

The reference is ONE NEUTRAL POSE. It can say where an eye is, how wide, what
colour — and it says nothing whatever about how far a brow travels when it
raises, because there is no raised brow in it. Expression AMPLITUDE is a
performance choice.

So every amplitude below is anchored to a measured DIMENSION and states its
fraction, e.g. "brow_up travels 20% of the measured 0.1054 H brow-to-eye gap".
That makes each one reviewable and scale-correct, which is the most that can
honestly be claimed. Where a number is pure preference it says so.

WHERE EACH MORPH LIVES, AND WHY BLINK IS NOT A SKIN DEFORMATION
The runtime's `setMorph` traverses the whole scene and sets a morph on any mesh
carrying that name (`RiggedLionCharacter.tsx`), so a morph can live on the
object it belongs to rather than all 16 being crammed onto the cage.

That matters most for the blink. The eye stack stands **8.3 mm proud of the
skin** — it is a rigid decal stack in front of the surface, by the design in
`face_lion.py`. A skin-based eyelid would have to travel that entire distance
before it began to cover anything, on a socket that resolves to **2 centre
faces**. So the blink flattens the EYE STACK, the way stylised
characters do it: the lid arc is the largest and darkest disc in the stack, so
a closed eye collapses to the lid's own dark line, which is what a closed eye
looks like in this art style.

The cage's eye socket loops are not wasted by that. They exist so the skin
AROUND the eye can move without pinching, which is what `eyes_narrow` and
`cheeks_up` use them for.

SHAPE KEYS ARE LOCAL, DISPLACEMENTS ARE WORLD
Each eye part is a separate object with its own origin and its own rotated
frame, so flattening each about its own local axis would collapse every disc in
place instead of collapsing the stack toward one line. Every morph here is
therefore authored as a WORLD-space function and converted back through the
object's matrix.

Run:
  blender --background art/blender/lion_face.blend --factory-startup \
    --python tools/blender/face_shapes.py

Outputs:
  art/blender/lion_face_shapes.blend
  public/assets/lion/cage/lion_face_shapes.glb
  docs/assets/lion-shapes/<morph>.png   (one render per morph at full value)
"""

import json
import math
import os
import sys

import bpy
from mathutils import Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
VIEWS = os.path.join(REPO, "art", "blender", "references", "turnaround-views")
FACE_JSON = os.path.join(VIEWS, "face_model.json")
CONTRACT = os.path.join(REPO, "src", "data", "lionRigContract.json")
BLEND_OUT = os.path.join(REPO, "art", "blender", "lion_face_shapes.blend")
GLB_OUT = os.path.join(REPO, "public", "assets", "lion", "cage",
                       "lion_face_shapes.glb")
PREVIEW_DIR = os.path.join(REPO, "docs", "assets", "lion-shapes")

# Model units are METRES, so millimetres are x1000. That is what every other
# metric in this pipeline reports — `rig_cage_lion` prints reach headroom as
# `v * 1000`, `anim_cage_lion` prints support slide the same way — and a figure
# here has to be comparable with those.
#
# An earlier version of this used 1300/0.847 to give "mm on the shipped 1.30 m
# character", which inflated every number by 1.535x and made it incomparable
# with the 22.1 mm reach headroom and 0.166 mm support slide it sits beside.
# The runtime does scale the asset up by that factor; that belongs in a note,
# not in the units.
SCALE_MM = 1000.0


# ── amplitude table ─────────────────────────────────────────────────────────
#
# Each entry is (fraction, measured dimension it is a fraction OF). The
# fractions are the performance choice; the dimensions are measured, so the
# result is scale-correct and a reviewer can argue with one number instead of
# reverse-engineering a coordinate.
AMPLITUDE = {
    # A blink must close, so this is near-total by definition rather than by
    # preference: 6% of the eye's own height leaves a line, not a gap.
    "blink": (0.06, "eye height"),
    # Cartoon wide-eye. 14% is a choice.
    "eyes_wide": (1.14, "eye size"),
    "eyes_narrow": (0.68, "eye height"),
    # 20% of the measured brow-to-eye gap (0.1054 H) up; half that down,
    # because the gap below a brow is smaller than the space above it.
    "brow_up": (0.20, "brow-to-eye gap"),
    "brow_down": (0.10, "brow-to-eye gap"),
    # Smile raises the mouth's ENDS by 18% of the mouth's half-width.
    "smile": (0.18, "mouth half-width"),
    "mouth_wide": (1.25, "mouth width"),
    "mouth_narrow": (0.72, "mouth width"),
    "mouth_round_w": (0.70, "mouth width"),
    "mouth_round_h": (1.50, "mouth height"),
    "viseme_MBP": (0.15, "mouth height"),
    "viseme_FV_h": (0.45, "mouth height"),
    "viseme_FV_w": (1.06, "mouth width"),
    "viseme_OU_w": (0.58, "mouth width"),
    "viseme_OU_h": (1.60, "mouth height"),
    # Cheeks rise by 10% of the muzzle's half-height.
    "cheeks_up": (0.10, "muzzle half-height"),
}


def obj(name):
    return bpy.data.objects.get(name)


def cage_object():
    for name in ("LionCage", "Lion", "LionBody"):
        o = bpy.data.objects.get(name)
        if o and o.type == "MESH":
            return o
    meshes = [o for o in bpy.data.objects if o.type == "MESH"]
    if not meshes:
        raise SystemExit("[shapes] no mesh in the scene")
    return max(meshes, key=lambda o: len(o.data.vertices))


def plane_up(o):
    """The object's in-plane 'up' axis in world space.

    `face_lion.disc` builds every decal with local Y as the in-plane vertical,
    so the object's own matrix already carries the right axis — no need to
    re-derive it from a surface normal and risk disagreeing with the build.
    """
    return (o.matrix_world.to_3x3() @ Vector((0.0, 1.0, 0.0))).normalized()


def plane_side(o):
    return (o.matrix_world.to_3x3() @ Vector((1.0, 0.0, 0.0))).normalized()


def add_world_morph(o, name, fn):
    """Add a shape key whose displacement is authored in WORLD space.

    Returns the largest displacement in model units, so the caller can report
    it and so a morph that silently does nothing is impossible to miss.
    """
    me = o.data
    if me.shape_keys is None:
        o.shape_key_add(name="Basis", from_mix=False)
    key = o.shape_key_add(name=name, from_mix=False)

    # `shape_key_add` RETURNS A KEY AT value = 1.0, not 0.0.
    #
    # Verified directly: adding Basis then two keys to a cube leaves
    # [('Basis', 1.0), ('k1', 1.0), ('k2', 1.0)]. So every morph was live the
    # instant it was authored, and all 16 were stacked on top of each other by
    # the end of the build — the "NEUTRAL" preview rendered a lion with its
    # eyes shut and its mouth crushed, and each per-morph preview showed
    # whatever had not been zeroed yet. Nothing in the geometry was wrong; the
    # sheet was measuring the wrong scene.
    #
    # It would also have exported that way. Only the explicit zeroing inside
    # `render_morphs` left the saved file at rest, which is luck, not design.
    key.value = 0.0
    mw = o.matrix_world
    inv = mw.inverted()
    worst = 0.0
    for i, kp in enumerate(key.data):
        world = mw @ me.vertices[i].co
        moved = fn(world)
        kp.co = inv @ moved
        worst = max(worst, (moved - world).length)
    return worst


def scale_about(origin, axis, factor):
    """Scale along one world axis about a point."""
    o = Vector(origin)
    a = Vector(axis).normalized()

    def fn(p):
        d = (p - o).dot(a)
        return p + a * (d * (factor - 1.0))
    return fn


def translate(vec):
    v = Vector(vec)
    return lambda p: p + v


def compose(*fns):
    def fn(p):
        for f in fns:
            p = f(p)
        return p
    return fn


def falloff_move(centre, radius, move):
    """Move verts near `centre`, fading smoothly to nothing at `radius`.

    Used for the CAGE, which has no vertex group for a facial feature — the
    sockets record no ring names. A smooth radial weight is what a sculpted
    shape key does by hand, and it keeps the surrounding surface still so the
    battery's poses are unaffected.
    """
    c = Vector(centre)
    m = Vector(move)

    def fn(p):
        d = (p - c).length
        if d >= radius:
            return p
        w = 0.5 * (1.0 + math.cos(math.pi * d / radius))   # raised cosine
        return p + m * w
    return fn


def falloff_scale(centre, radius, axis, factor):
    c = Vector(centre)
    a = Vector(axis).normalized()

    def fn(p):
        d = (p - c).length
        if d >= radius:
            return p
        w = 0.5 * (1.0 + math.cos(math.pi * d / radius))
        along = (p - c).dot(a)
        return p + a * (along * (factor - 1.0) * w)
    return fn


def report_decal_float(cage, contract):
    """How far each decal sits off the skin, at rest and at every morph's full value.

    This exists because a render made the brow look as though `brow_up` was
    lifting it off the head, and the obvious response — shrink the amplitude —
    would have masked the real cause. Measured, the brow floats up to 15.3 mm
    at REST (median 4.6) because it is a flat ellipse on a curving forehead;
    `brow_up` at full value adds 2.2 mm and `brow_down` 7.1. The morphs are
    not the problem, so their amplitudes stay and the flat-decal build is what
    needs fixing.

    Printing it here means the next person does not have to rediscover that
    with a one-off probe, and a morph that genuinely peels a decal off the face
    shows up as a large delta instead of a puzzling render.
    """
    from mathutils.bvhtree import BVHTree
    dg = bpy.context.evaluated_depsgraph_get()
    bvh = BVHTree.FromObject(cage, dg)

    def worst_gap(o, coords):
        mw = o.matrix_world
        gap = 0.0
        for c in coords:
            _loc, _n, _i, d = bvh.find_nearest(mw @ c)
            if d is not None:
                gap = max(gap, d)
        return gap

    print("")
    print("DECAL FLOAT (worst vertex distance to the cage surface, mm)")
    print("  NB the eye stack is SUPPOSED to stand proud — it is lifted 15.5 mm")
    print("  off the socket floor by design, so its ~20 mm is the socket, not a")
    print("  defect. The MUZZLE is now a conformed sheet and reads 4.0 mm, which")
    print("  is its deliberate clearance. The BROWS are still flat ellipses on a")
    print("  curving forehead, and there the number is the artefact.")
    print(f"{'decal':14s} {'rest':>7s}   morphs at full value")
    for o in sorted((o for o in bpy.data.objects
                     if o.type == "MESH" and o is not cage
                     and o.data.shape_keys), key=lambda m: m.name):
        rest = worst_gap(o, [v.co for v in o.data.vertices])
        deltas = []
        for kb in o.data.shape_keys.key_blocks:
            if kb.name == "Basis":
                continue
            g = worst_gap(o, [p.co for p in kb.data])
            deltas.append(f"{kb.name} {(g - rest) * 1000:+.1f}")
        print(f"{o.name:14s} {rest * 1000:7.1f}   {'  '.join(deltas)}")


def assert_neutral_is_neutral():
    """With every morph at 0, the evaluated mesh must equal the base mesh.

    This is the check that catches a stuck shape key, and it is cheap. Without
    it a `value = 1.0` default silently baked all 16 morphs into the rest pose
    and the only symptom was a preview sheet nobody could read.
    """
    dg = bpy.context.evaluated_depsgraph_get()
    worst_name, worst = None, 0.0
    for o in bpy.data.objects:
        if o.type != "MESH" or not o.data.shape_keys:
            continue
        for kb in o.data.shape_keys.key_blocks:
            if kb.name != "Basis" and kb.value != 0.0:
                raise SystemExit(
                    f"[shapes] {o.name}.{kb.name} is at {kb.value}, not 0 — "
                    f"the rest pose is not neutral")
        ev = o.evaluated_get(dg)
        me = ev.to_mesh()
        base = o.data.vertices
        if len(me.vertices) == len(base):
            for i in range(len(base)):
                d = (me.vertices[i].co - base[i].co).length
                if d > worst:
                    worst_name, worst = f"{o.name}[{i}]", d
        ev.to_mesh_clear()
    # TOLERANCE 1e-5, not 1e-6.
    #
    # 1e-6 sat on the float-noise floor and produced a FALSE FAILURE: with the
    # cage subdivided to 15,954 verts the evaluated-versus-base comparison
    # accumulates slightly more error, and the check aborted the whole build
    # reporting "a morph is stuck on" over a deviation of 0.000001 model units
    # — one micron on a 1.30 m character, on a mesh whose morphs were all
    # verifiably at 0. At 3,990 verts the same build measured 7.3e-07 and
    # passed, so the threshold was deciding on mesh density rather than on
    # anything about the morphs.
    #
    # 1e-5 is 0.015 mm at runtime scale: still some three orders of magnitude
    # below anything visible, and clear of the noise. A genuinely stuck morph
    # displaces millimetres, not microns — the failure this guards against was
    # all 16 keys defaulting to 1.0, which is centimetres.
    if worst > 1e-5:
        raise SystemExit(
            f"[shapes] rest pose differs from base by {worst:.6f} at "
            f"{worst_name} — a morph is stuck on")
    print(f"[shapes] neutral check: rest pose == base "
          f"(worst deviation {worst:.2e}, tolerance 1e-05)")


def render_morphs(cage, contract):
    """One render per morph at full value, plus a neutral, on one contact sheet.

    A displacement in millimetres says a morph MOVED something. It cannot say
    the movement reads as the expression it is named after, and on a face that
    is the only question worth asking. Every one of these is a performance
    choice, so every one needs a picture.
    """
    os.makedirs(PREVIEW_DIR, exist_ok=True)
    sc = bpy.context.scene
    engines = sc.render.bl_rna.properties["engine"].enum_items.keys()
    sc.render.engine = ("BLENDER_EEVEE_NEXT" if "BLENDER_EEVEE_NEXT" in engines
                        else "BLENDER_EEVEE")
    sc.render.resolution_x = sc.render.resolution_y = 420
    sc.render.film_transparent = False

    meshes = [o for o in bpy.data.objects
              if o.type == "MESH" and o.data.shape_keys]

    def set_all(name, value):
        for o in meshes:
            kb = o.data.shape_keys.key_blocks.get(name)
            if kb:
                kb.value = value

    # Frame the head from the front. The morphs are all facial; a body-framed
    # render would make a 12 mm change invisible.
    fm = json.load(open(FACE_JSON))
    target = Vector((0.0, 0.62, fm["derived"]["face_centre_h"]))
    cam = sc.camera
    if cam is None:
        cd = bpy.data.cameras.new("ShapeCam")
        cam = bpy.data.objects.new("ShapeCam", cd)
        sc.collection.objects.link(cam)
        sc.camera = cam
    cam.data.lens = 62.0
    dist = 0.62
    cam.location = (0.0, target.y + dist, target.z + dist * 0.05)
    cam.rotation_euler = (target - Vector(cam.location)) \
        .to_track_quat("-Z", "Y").to_euler()

    shots = []
    for name in ["NEUTRAL"] + list(contract):
        if name != "NEUTRAL":
            set_all(name, 1.0)
        path = os.path.join(PREVIEW_DIR, f"{name}.png")
        sc.render.filepath = path
        bpy.ops.render.render(write_still=True)
        if name != "NEUTRAL":
            set_all(name, 0.0)
        shots.append((name, path))
    print(f"[shapes] rendered {len(shots)} morph previews into {PREVIEW_DIR}")
    return shots


def build_morphs(cage, fm, contract):
    """Author all 16 contract morphs and report them. Reusable.

    Split out of `main()` so `assemble_lion.py` can build the morphs onto the
    RIGGED cage instead of the bare one. Everything after this — the neutral
    assertion, the float report, the previews, the export — is `main()`'s
    business, because the assembler does its own.
    """
    report = []

    # ---- geometry the morphs are anchored to ---------------------------
    al = fm["eye"]["almond"]
    eye_h = (al["left"]["h"] + al["right"]["h"]) / 2.0
    eye_half_h = (al["left"]["half_h_H"] + al["right"]["half_h_H"]) / 2.0
    eye_half_w = (al["left"]["half_w_H"] + al["right"]["half_w_H"]) / 2.0
    brow_gap = fm["derived"]["brow_above_eye_H"]
    mouth = fm["mouth_line"]
    mouth_half_w = mouth["half_w_H"]
    mouth_half_h = mouth["half_h_H"]
    mz = fm["muzzle_patch"]
    muzzle_half_h = mz.get("half_h_H_span", mz["half_h_H"])
    muzzle_centre_h = mz.get("centre_h", mz["h"])

    EYE_PARTS = {"L": ["EyeLid_L", "Sclera_L", "Iris_L", "Pupil_L", "Catchlight_L"],
                 "R": ["EyeLid_R", "Sclera_R", "Iris_R", "Pupil_R", "Catchlight_R"]}
    UP = Vector((0.0, 0.0, 1.0))

    # ---- blink_L / blink_R --------------------------------------------
    # Flatten the whole stack toward the eye's own centre height, in WORLD z
    # so every disc collapses toward one line rather than each in place.
    k, _ = AMPLITUDE["blink"]
    for side in ("L", "R"):
        worst = 0.0
        for nm in EYE_PARTS[side]:
            o = obj(nm)
            if o is None:
                continue
            worst = max(worst, add_world_morph(
                o, f"blink_{side}",
                scale_about((0, 0, eye_h), UP, k)))
        report.append((f"blink_{side}", worst,
                       f"{k:.0%} of eye height on {len(EYE_PARTS[side])} parts"))

    # ---- eyes_wide / eyes_narrow --------------------------------------
    f_wide, _ = AMPLITUDE["eyes_wide"]
    f_narrow, _ = AMPLITUDE["eyes_narrow"]
    eye_x = (abs(al["left"]["x_H"]) + abs(al["right"]["x_H"])) / 2.0

    def both_eyes_falloff(factor, axis):
        """One cage morph that moves the skin at BOTH eyes.

        The first version looped the sides and called `add_world_morph(cage,
        ...)` inside the loop. Two things wrong with that: Blender appends a
        suffix to a duplicate key name, so the second call would have produced
        `eyes_wide.001` that no runtime looks up — and a stray `if side == "L"`
        meant only the LEFT eye's skin ever moved anyway. One function that
        applies both falloffs, added once.
        """
        left = falloff_scale((-eye_x, 0.62, eye_h), eye_half_w * 2.4,
                             axis, factor)
        right = falloff_scale((+eye_x, 0.62, eye_h), eye_half_w * 2.4,
                              axis, factor)

        def fn(p):
            return right(p) if p.x >= 0.0 else left(p)
        return fn

    for morph, factor in (("eyes_wide", f_wide), ("eyes_narrow", f_narrow)):
        worst = 0.0
        for side in ("L", "R"):
            for nm in EYE_PARTS[side]:
                o = obj(nm)
                if o is None:
                    continue
                fn = scale_about((0, 0, eye_h), UP, factor)
                if morph == "eyes_wide":
                    fn = compose(fn, scale_about(o.matrix_world.translation,
                                                 plane_side(o), factor))
                worst = max(worst, add_world_morph(o, morph, fn))
        # The skin around each eye moves WITH it, which is what the socket
        # loops are for. A third of the decal's amount, so the lids read as
        # sliding over the eye rather than being carried by it.
        cage_factor = 1.0 + (factor - 1.0) / 3.0
        worst = max(worst, add_world_morph(
            cage, morph, both_eyes_falloff(cage_factor, UP)))
        report.append((morph, worst,
                       f"decal x{factor}, cage skin x{cage_factor:.3f}"))

    # ---- brow_up_L/R, brow_down_L/R -----------------------------------
    f_up, _ = AMPLITUDE["brow_up"]
    f_dn, _ = AMPLITUDE["brow_down"]
    def surface_y(x, z):
        hit, loc, _, _ = cage.ray_cast(Vector((x, 1.4, z)),
                                       Vector((0.0, -1.0, 0.0)))
        return loc.y if hit else None

    # The forehead slope is averaged across the two sides before use. Measured
    # per side it came out -0.0198 on the left against -0.0267 on the right, a
    # 35% disagreement on a cage built from symmetric tables — the ray lands on
    # a face on one side and near an edge on the other. Same conclusion as
    # everywhere else in this pipeline: a left/right difference on a symmetric
    # subject is sampling noise, so it is averaged rather than preserved.
    slope = {}
    for frac_name, frac in (("up", +f_up), ("down", -f_dn)):
        dzz = brow_gap * frac
        dys = []
        for side in ("L", "R"):
            o = obj(f"Brow_{side}")
            if o is None:
                continue
            bx = o.matrix_world.translation.x
            bz = o.matrix_world.translation.z
            y0, y1 = surface_y(bx, bz), surface_y(bx, bz + dzz)
            if y0 is not None and y1 is not None:
                dys.append(y1 - y0)
        slope[frac_name] = sum(dys) / len(dys) if dys else None

    for side in ("L", "R"):
        o = obj(f"Brow_{side}")
        if o is None:
            report.append((f"brow_up_{side}", 0.0, "BROW OBJECT MISSING"))
            continue
        for morph, frac, key in ((f"brow_up_{side}", +f_up, "up"),
                                 (f"brow_down_{side}", -f_dn, "down")):
            dz = brow_gap * frac
            # A BROW SLIDES UP THE FOREHEAD, IT DOES NOT LIFT OFF IT.
            #
            # Translating straight up worked on paper and failed in the render:
            # the skull curves back above the brow, so at full value the outer
            # end of the disc left the surface and crossed the silhouette into
            # the background. The forehead's own slope is measurable — ray-cast
            # at the start and end heights and take the difference — so the
            # translation follows the skin instead of a guess about it.
            dy = slope.get(key)
            note = f"{abs(frac):.0%} of the {brow_gap:.4f} brow-to-eye gap"
            if dy is None:
                dy = 0.0
                note += ", FLAT (surface probe missed)"
            else:
                note += f", following the forehead ({dy:+.4f} in y, L/R mean)"
            worst = add_world_morph(o, morph, translate((0.0, dy, dz)))
            report.append((morph, worst, note))

    # ---- mouth shapes --------------------------------------------------
    # Each acts on the mouth-line decal AND on the cage's lip rim, so the
    # opening changes shape rather than a dark line sliding over a fixed one.
    mouth_o = obj("MouthLine")
    mouth_centre = (0.0, 0.63, mouth["h"])
    mouth_r = mouth_half_w * 1.6

    def mouth_pair(morph, decal_fn, cage_fn):
        worst = 0.0
        if mouth_o is not None:
            worst = max(worst, add_world_morph(mouth_o, morph, decal_fn))
        worst = max(worst, add_world_morph(cage, morph, cage_fn))
        return worst

    smile_f, _ = AMPLITUDE["smile"]

    def smile_world(p):
        # Raise proportionally to |x|: the ENDS lift, the centre stays. That
        # is what makes a smile a smile rather than the whole mouth moving up.
        t = min(abs(p.x) / max(mouth_half_w, 1e-6), 1.0)
        return p + Vector((0.0, 0.0, mouth_half_w * smile_f * t * t))

    worst = mouth_pair("smile", smile_world,
                       lambda p: (p + Vector((0, 0, mouth_half_w * smile_f
                                              * min(abs(p.x) / max(mouth_half_w, 1e-6), 1.0) ** 2
                                              * (0.5 * (1.0 + math.cos(math.pi * min(
                                                  (p - Vector(mouth_centre)).length / mouth_r, 1.0))))))))
    report.append(("smile", worst, f"{smile_f:.0%} of mouth half-width at the ends"))

    SIDE = Vector((1.0, 0.0, 0.0))
    for morph, fw, fh in (
            ("mouth_wide", AMPLITUDE["mouth_wide"][0], 1.0),
            ("mouth_narrow", AMPLITUDE["mouth_narrow"][0], 1.0),
            ("mouth_round", AMPLITUDE["mouth_round_w"][0],
             AMPLITUDE["mouth_round_h"][0]),
            ("viseme_MBP", 1.0, AMPLITUDE["viseme_MBP"][0]),
            ("viseme_FV", AMPLITUDE["viseme_FV_w"][0],
             AMPLITUDE["viseme_FV_h"][0]),
            ("viseme_OU", AMPLITUDE["viseme_OU_w"][0],
             AMPLITUDE["viseme_OU_h"][0])):
        decal = compose(scale_about(mouth_centre, SIDE, fw),
                        scale_about(mouth_centre, UP, fh))
        cage_fn = compose(falloff_scale(mouth_centre, mouth_r, SIDE, fw),
                          falloff_scale(mouth_centre, mouth_r, UP, fh))
        worst = mouth_pair(morph, decal, cage_fn)
        report.append((morph, worst, f"w x{fw} h x{fh}"))

    # ---- cheeks_up -----------------------------------------------------
    f_cheek, _ = AMPLITUDE["cheeks_up"]
    rise = muzzle_half_h * f_cheek
    worst = 0.0
    mz_o = obj("Muzzle")
    if mz_o is not None:
        worst = max(worst, add_world_morph(mz_o, "cheeks_up",
                                           translate((0, 0, rise))))
    worst = max(worst, add_world_morph(
        cage, "cheeks_up",
        falloff_move((0.0, 0.63, muzzle_centre_h), muzzle_half_h * 2.0,
                     (0, 0, rise))))
    report.append(("cheeks_up", worst,
                   f"{f_cheek:.0%} of the {muzzle_half_h:.4f} muzzle half-height"))

    # ---- report and validate -------------------------------------------
    print("")
    print("===FACE_SHAPES===")
    print(f"{'morph':16s} {'max displacement':>18s}   anchored to")
    built = {}
    for name, worst, why in report:
        built[name] = worst
        print(f"{name:16s} {worst:8.5f} = {worst * SCALE_MM:6.1f} mm   {why}")

    print("")
    missing = [m for m in contract if m not in built]
    dead = [m for m, w in built.items() if w < 1e-6]
    print(f"CONTRACT_MORPHS={len(contract)}")
    print(f"BUILT={len(built)}")
    print(f"MISSING={missing if missing else 'none'}")
    print(f"ZERO_DISPLACEMENT={dead if dead else 'none'}")

    meshes = [o for o in bpy.data.objects if o.type == "MESH" and o.data.shape_keys]
    print(f"MESHES_WITH_SHAPE_KEYS={len(meshes)}")
    for o in sorted(meshes, key=lambda m: m.name):
        names = [k.name for k in o.data.shape_keys.key_blocks if k.name != "Basis"]
        print(f"  {o.name:14s} {len(names):2d}  {names}")
    print("===FACE_SHAPES_END===")

    if missing:
        raise SystemExit(f"[shapes] {len(missing)} contract morphs not built: {missing}")
    if dead:
        raise SystemExit(f"[shapes] {len(dead)} morphs displace nothing: {dead}")
    return report


def main():
    fm = json.load(open(FACE_JSON))
    contract = json.load(open(CONTRACT))["morphTargets"]
    cage = cage_object()

    build_morphs(cage, fm, contract)

    assert_neutral_is_neutral()
    report_decal_float(cage, contract)

    render_morphs(cage, contract)

    bpy.ops.wm.save_as_mainfile(filepath=BLEND_OUT)

    os.makedirs(os.path.dirname(GLB_OUT), exist_ok=True)
    bpy.ops.object.select_all(action="SELECT")
    bpy.context.view_layer.objects.active = cage
    bpy.ops.export_scene.gltf(filepath=GLB_OUT, export_format="GLB",
                              use_selection=True, export_apply=False,
                              export_morph=True, export_normals=True,
                              export_materials="EXPORT")
    print(f"[shapes] GLB {GLB_OUT} ({os.path.getsize(GLB_OUT) / 1024:.1f} KB)")


if __name__ == "__main__":
    main()
