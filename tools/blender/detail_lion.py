"""
detail_lion.py — facial and body detail on the retopologised blockout.

Adds the features that make the character read as the approved mascot rather
than a shape: eyes, pupils, brows, nose, mouth with teeth and tongue, inner
ears, claws, and the cream/gold/auburn colour blocking from the turnaround.

WHY THESE ARE SEPARATE OBJECTS
The brief calls for separate geometry for eyeballs, teeth and tongue, and it is
right: eyes must rotate independently of the head for look-at, and teeth and
tongue sit inside a mouth cavity that opens. Merging them into the body would
make both impossible. They are parented to the body and will be weighted to the
head and jaw bones during rigging.

COLOUR BLOCKING
The body is one mesh, so the gold coat, auburn mane and cream muzzle/chest/paws
are assigned per-FACE by spatial region rather than by splitting the mesh. That
keeps a single skinned surface — splitting it would reintroduce the seams the
whole retopology pass was meant to remove.

Run:
  blender --background art/blender/lion_retopo.blend \
    --factory-startup --python tools/blender/detail_lion.py

Outputs:
  art/blender/lion_detailed.blend
  docs/assets/lion-detailed/{front,side,rear,three-quarter}.png
"""

import math
import os

import bpy
from mathutils import Vector

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
BLEND_OUT = os.path.join(REPO, "art", "blender", "lion_detailed.blend")
PREVIEW_DIR = os.path.join(REPO, "docs", "assets", "lion-detailed")

# Must match build_lion_silhouette.py — the features are placed against the same
# proportion contract the body was built from.
# Proportions come from the SHARED contract. They used to be copied into each
# stage and drifted out of sync the moment the silhouette was re-tuned.
import sys as _sys, os as _os
_sys.path.insert(0, _os.path.dirname(_os.path.abspath(__file__)))
from lion_contract import (  # noqa: E402
    TOTAL_H, GROUND, BELLY_Z, SPINE_Z, SHOULDER_Z, HEAD_Z, MANE_TOP, LEG_LEN,
    BODY_FRONT_Y, BODY_BACK_Y, HEAD_Y, MANE_Y, MANE_Z,
    R_HEAD, R_MANE, R_MUZZLE, R_NECK, R_CHEST, R_WAIST, R_HIP,
    R_LEG_TOP, R_LEG_MID, R_PAW, R_TAIL, R_TUFT,
)

# Palette sampled from the approved turnaround.
PALETTE = {
    "coat":   (0.957, 0.706, 0.259),   # golden body
    "mane":   (0.545, 0.271, 0.145),   # deep auburn
    "cream":  (0.980, 0.925, 0.792),   # muzzle, chest, belly, paws
    "nose":   (0.353, 0.196, 0.141),   # dark brown
    "eyewhite": (0.996, 0.992, 0.984),
    "iris":   (0.302, 0.157, 0.086),
    "pupil":  (0.086, 0.063, 0.055),
    "brow":   (0.400, 0.204, 0.114),
    "pink":   (0.949, 0.639, 0.643),   # inner ear, tongue
    "tooth":  (1.000, 0.996, 0.976),
    "claw":   (0.960, 0.930, 0.860),   # pale ivory
    "pad":    (0.612, 0.400, 0.404),   # dusty paw pad
}

# One colour attribute drives the whole character. See paint_coat().
COLOR_ATTR = "Col"


def _srgb_to_linear(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


# The palette was sampled from the approved turnaround, so it is sRGB. Blender
# Base Color inputs and FLOAT_COLOR attributes are LINEAR, and glTF COLOR_0 is
# linear as well — feeding sRGB numbers straight through displayed every colour
# lighter and flatter than authored: the gold coat came out pale butter and the
# auburn mane came out tan. Converting once, here, fixes it everywhere
# downstream including the exported GLB.
PALETTE = {k: tuple(_srgb_to_linear(c) for c in v) for k, v in PALETTE.items()}


FUR_ROUGH = 0.66
GLOSS_ROUGH = 0.17


def sstep(e0, e1, x):
    """Smooth 0→1 ramp. Every region boundary uses one of these.

    The previous pass tested regions with hard booleans and wrote the result to
    poly.material_index. On an 8,500-face quad mesh that makes every colour
    boundary follow polygon edges, which is why the muzzle met the coat in a
    visible sawtooth. A ramp plus vertex colours gives a soft airbrushed edge
    for free.
    """
    t = (x - e0) / (e1 - e0) if e1 != e0 else (1.0 if x >= e1 else 0.0)
    t = min(1.0, max(0.0, t))
    return t * t * (3.0 - 2.0 * t)


def mix(a, b, t):
    return tuple(a[i] + (b[i] - a[i]) * t for i in range(3))


def shared_mat(name, roughness, spec=0.35):
    """One vertex-coloured material shared by everything that uses it.

    Colour lives in the mesh, not the material, so the whole character needs
    exactly two materials — matte fur and glossy wet bits (eyes, nose, teeth,
    tongue). At export these two collapse to two draw calls for the entire lion
    instead of one per feature object.
    """
    if name in bpy.data.materials:
        return bpy.data.materials[name]
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes.get("Principled BSDF")
    b.inputs["Roughness"].default_value = roughness
    if "Specular IOR Level" in b.inputs:
        b.inputs["Specular IOR Level"].default_value = spec
    vc = nt.nodes.new("ShaderNodeVertexColor")
    vc.layer_name = COLOR_ATTR
    vc.location = (-320, 200)
    nt.links.new(vc.outputs["Color"], b.inputs["Base Color"])
    return m


def paint_uniform(obj, rgb, gloss=False):
    """Give an object a single flat vertex colour on the shared material."""
    me = obj.data
    me.materials.clear()
    me.materials.append(shared_mat("Lion_Gloss" if gloss else "Lion_Fur",
                                   GLOSS_ROUGH if gloss else FUR_ROUGH,
                                   0.62 if gloss else 0.32))
    attr = me.color_attributes.get(COLOR_ATTR)
    if attr is None:
        attr = me.color_attributes.new(name=COLOR_ATTR, type="FLOAT_COLOR", domain="POINT")
    for i in range(len(me.vertices)):
        attr.data[i].color = (*rgb, 1.0)
    for poly in me.polygons:
        poly.use_smooth = True


def ball(name, loc, radius, rgb, scale=(1, 1, 1), rot=(0, 0, 0), gloss=False):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=18, ring_count=12,
                                         radius=radius, location=loc)
    o = bpy.context.object
    o.name = name
    o.scale = scale
    o.rotation_euler = rot
    paint_uniform(o, rgb, gloss)
    return o


# ── surface probing ─────────────────────────────────────────────────────────
def surface(body, origin, direction):
    """Ray-cast the body from the inside and return (point, normal).

    Features used to be placed at hand-written coordinates copied from the
    blockout. Retopology and the shrinkwrap recovery then moved the surface, and
    nothing re-checked: the eye whites ended up ~2cm INSIDE the head with only
    the pupils protruding, which is exactly what the first close-up showed.
    Probing the real surface means placement survives any later silhouette
    change instead of silently drifting again.
    """
    d = Vector(direction).normalized()
    ok, loc, nor, _ = body.ray_cast(Vector(origin), d)
    if not ok:
        raise SystemExit(f"surface probe missed: origin={tuple(origin)} dir={tuple(d)}")
    return loc, nor.normalized()


def basis(normal):
    """Return (normal, up-ish tangent, side tangent) for surface-local placement."""
    n = Vector(normal).normalized()
    up = Vector((0.0, 0.0, 1.0))
    if abs(n.dot(up)) > 0.97:
        up = Vector((0.0, 1.0, 0.0))
    tang = (up - n * up.dot(n)).normalized()
    side = n.cross(tang).normalized()
    return n, tang, side


def disc(name, centre, normal, radius, rgb, thickness=0.30, gloss=False):
    """A squashed sphere lying flat on a surface, facing along `normal`.

    Cartoon eyes are a STACK of these. The old build nested concentric spheres,
    which only works while offset + child_radius < parent_radius — and it did
    not: the iris sat 0.030 forward with radius 0.031 inside a 0.049 eyeball, so
    it punched straight through and rendered as a separate floating bead. Flat
    discs stacked along one axis cannot fail that way.
    """
    o = ball(name, centre, radius, rgb, scale=(1, 1, thickness), gloss=gloss)
    o.rotation_euler = Vector((0, 0, 1)).rotation_difference(Vector(normal)).to_euler()
    return o


# ── coat colouring ──────────────────────────────────────────────────────────
def ear_surface_points(body):
    """Where the ear bumps actually are, probed from the mesh.

    paint_coat needs these to keep the ears gold inside an auburn mane. They
    were previously a hard-coded pair of coordinates that duplicated what
    build_ears() probes for anyway — so a change to head size moved the ears but
    not the mask, and the ears would have come out mane-coloured.
    """
    head_c = Vector((0.0, HEAD_Y, HEAD_Z))
    pts = []
    for sx in (-1, 1):
        surf, _ = surface(body, head_c, Vector((sx * 0.80, 0.16, 1.0)))
        pts.append(Vector(surf))
    return pts


def paint_coat(body, ear_centres):
    """Gold coat, auburn mane and cream underside as smooth vertex colours."""
    me = body.data
    me.materials.clear()
    me.materials.append(shared_mat("Lion_Fur", FUR_ROUGH, 0.32))
    attr = me.color_attributes.get(COLOR_ATTR)
    if attr is None:
        attr = me.color_attributes.new(name=COLOR_ATTR, type="FLOAT_COLOR", domain="POINT")

    head_centre = Vector((0.0, HEAD_Y, HEAD_Z))
    coat, mane, cream = PALETTE["coat"], PALETTE["mane"], PALETTE["cream"]

    for i, v in enumerate(me.vertices):
        c = v.co

        # Mane: the auburn ruff is a SHELL around the head, so "distance from a
        # mane centre" can never resolve it — every mane vertex sits at roughly
        # that same distance, so the ramp caught them all mid-slope and the ruff
        # rendered as washed-out tan instead of auburn. What actually separates
        # mane from face is being OUTSIDE the head sphere, bounded above the
        # shoulder line and in front of the back, with the face plate and the
        # ear bumps masked out.
        d_head = (Vector(c) - head_centre).length
        # The face mask needs a LATERAL bound as well as height and depth. With
        # only y and z it also matched the mane at the SIDES of the head, which
        # share the face's y and z — so the ruff came out gold everywhere except
        # a rim at the back. Measured: face plate |x| < 0.16, mane sides > 0.20.
        face = (sstep(HEAD_Y - 0.01, HEAD_Y + 0.055, c.y)
                * sstep(HEAD_Z - 0.235, HEAD_Z - 0.150, c.z)
                * (1.0 - sstep(0.145, 0.215, abs(c.x))))
        d_ear = min((Vector(c) - e).length for e in ear_centres)
        ear = 1.0 - sstep(0.040, 0.068, d_ear)

        # The mane is TWO regions, and one test cannot describe both. The hood
        # is everything above a plane slanted through the withers — that keeps
        # the crown and the back of the head auburn while the mid-back stays
        # gold, which a plain "behind the chest" gate could not do (the mane's
        # rearmost point and the middle of the back sit at the same depth, so
        # only height separates them). The chest ruff is the opposite: forward
        # and LOW, well under that plane. Taking the union paints both.
        hood = sstep(0.56, 0.68, c.z + 0.5 * c.y)
        ruff = (sstep(0.16, 0.26, c.y)
                * (1.0 - sstep(0.45, 0.58, c.z))
                * sstep(BELLY_Z + 0.02, BELLY_Z + 0.12, c.z))
        w_mane = (sstep(0.224, 0.264, d_head)
                  * max(hood, ruff)
                  * (1.0 - face) * (1.0 - ear))

        # Cream: muzzle plate, chest, a narrow belly strip, and the paw socks.
        w_muzzle = (sstep(HEAD_Y + 0.085, HEAD_Y + 0.135, c.y)
                    * sstep(HEAD_Z - 0.190, HEAD_Z - 0.140, c.z)
                    * (1.0 - sstep(HEAD_Z - 0.010, HEAD_Z + 0.045, c.z)))
        w_belly = (sstep(BELLY_Z - 0.075, BELLY_Z - 0.040, c.z)
                   * (1.0 - sstep(BELLY_Z + 0.020, BELLY_Z + 0.060, c.z))
                   * (1.0 - sstep(0.055, 0.100, abs(c.x)))
                   * sstep(BODY_BACK_Y + 0.03, BODY_BACK_Y + 0.09, c.y)
                   * (1.0 - sstep(BODY_FRONT_Y - 0.04, BODY_FRONT_Y + 0.01, c.y)))
        w_chest = (sstep(BODY_FRONT_Y - 0.05, BODY_FRONT_Y + 0.01, c.y)
                   * (1.0 - sstep(0.070, 0.115, abs(c.x)))
                   * sstep(BELLY_Z - 0.06, BELLY_Z - 0.01, c.z)
                   * (1.0 - sstep(SPINE_Z - 0.07, SPINE_Z - 0.02, c.z)))
        w_paws = 1.0 - sstep(GROUND + 0.070, GROUND + 0.125, c.z)
        w_cream = min(1.0, max(w_muzzle, w_belly, w_chest, w_paws))

        rgb = mix(coat, mane, w_mane)
        rgb = mix(rgb, cream, w_cream)

        # A gentle vertical gradient. Without any baked occlusion the underside
        # of a flat-lit cartoon reads as pure silhouette; darkening it slightly
        # gives the volumes somewhere to sit.
        shade = 0.88 + 0.12 * sstep(GROUND - 0.05, SPINE_Z + 0.30, c.z)
        attr.data[i].color = (rgb[0] * shade, rgb[1] * shade, rgb[2] * shade, 1.0)

    for poly in me.polygons:
        poly.use_smooth = True


# ── features ────────────────────────────────────────────────────────────────
def build_eyes(body, parts):
    head_c = Vector((0.0, HEAD_Y, HEAD_Z))
    for sx in (-1, 1):
        tag = "L" if sx < 0 else "R"
        surf, nor = surface(body, head_c, Vector((sx * 0.46, 1.0, 0.17)))
        n, tang, side = basis(nor)
        inward = side * (1.0 if side.x * sx < 0 else -1.0)
        base = surf + n * 0.004
        print(f"[detail] eye {tag} at {tuple(round(x,3) for x in base)}")

        parts.append(disc(f"EyeWhite_{tag}", base, n, 0.052, PALETTE["eyewhite"], 0.34, gloss=True))
        parts.append(disc(f"Iris_{tag}", base + n * 0.011, n, 0.034, PALETTE["iris"], 0.26, gloss=True))
        parts.append(disc(f"Pupil_{tag}", base + n * 0.016, n, 0.018, PALETTE["pupil"], 0.24, gloss=True))
        parts.append(disc(f"Catchlight_{tag}", base + n * 0.020 + tang * 0.015 + inward * 0.010,
                          n, 0.010, (1.0, 1.0, 1.0), 0.30, gloss=True))
        # Upper lid — a coat-coloured crescent resting on the eye. This is what
        # gives a stylised eye an expression line instead of a staring bead.
        bsurf, bnor = surface(body, head_c, Vector((sx * 0.42, 1.0, 0.66)))
        bn, btang, bside = basis(bnor)
        outward = bside * (1.0 if bside.x * sx > 0 else -1.0)
        # inner → middle → outer, arching up in the middle: alert and friendly.
        for i, (u, t, r) in enumerate(((-0.018, -0.001, 0.012),
                                       (0.000, 0.005, 0.014),
                                       (0.018, 0.002, 0.012))):
            parts.append(disc(f"Brow_{tag}{i}", bsurf + bn * 0.004 + outward * u + btang * t,
                              bn, r, PALETTE["brow"], 0.40))


def build_nose_and_mouth(body, parts):
    head_c = Vector((0.0, HEAD_Y, HEAD_Z))

    surf, nor = surface(body, head_c, Vector((0.0, 1.0, -0.09)))
    n, tang, side = basis(nor)
    print(f"[detail] nose at {tuple(round(x,3) for x in surf)}")

    # Muzzle pad the nose sits on — broad, soft, slightly proud of the face.
    pad = ball("MuzzlePad", surf - n * 0.012, 0.047, PALETTE["cream"], (1.28, 1.0, 0.44))
    pad.rotation_euler = Vector((0, 0, 1)).rotation_difference(n).to_euler()
    parts.append(pad)

    nose_c = surf + n * 0.013
    nose = ball("Nose_Main", nose_c, 0.030, PALETTE["nose"], (1.55, 1.0, 0.52), gloss=True)
    nose.rotation_euler = Vector((0, 0, 1)).rotation_difference(n).to_euler()
    parts.append(nose)
    for sx in (-1, 1):
        parts.append(disc(f"Nostril_{'L' if sx < 0 else 'R'}",
                          nose_c + n * 0.016 + side * (sx * 0.017) - tang * 0.005,
                          n, 0.0055, (0.09, 0.05, 0.05), 0.55, gloss=True))
    # Philtrum: three shrinking discs stepping down from the nose.
    for i, (dy, r) in enumerate(((0.020, 0.007), (0.032, 0.006), (0.043, 0.005))):
        parts.append(disc(f"Philtrum_{i}", nose_c + n * 0.006 - tang * dy, n, r,
                          PALETTE["nose"], 0.5))

    msurf, mnor = surface(body, head_c, Vector((0.0, 1.0, -0.40)))
    mn, mtang, mside = basis(mnor)
    print(f"[detail] mouth at {tuple(round(x,3) for x in msurf)}")

    # An open, dark cavity so the teeth and tongue have something to read against.
    parts.append(disc("MouthCavity", msurf + mn * 0.002, mn, 0.042, (0.20, 0.09, 0.10), 0.34))
    # Spaced beads read as a necklace. Overlapping them (spacing < radius)
    # merges the row into one band with scalloped edges — which is what a row
    # of small teeth actually looks like at this scale.
    for i in range(7):
        u = (i - 3) * 0.0090
        parts.append(disc(f"Tooth_{i}", msurf + mn * 0.010 + mside * u + mtang * 0.023,
                          mn, 0.010, PALETTE["tooth"], 0.34, gloss=True))
    for sx in (-1, 1):
        parts.append(disc(f"Fang_{'L' if sx < 0 else 'R'}",
                          msurf + mn * 0.011 + mside * (sx * 0.021) + mtang * 0.014,
                          mn, 0.010, PALETTE["tooth"], 0.44, gloss=True))
    parts.append(disc("Tongue", msurf + mn * 0.009 - mtang * 0.017, mn, 0.028,
                      PALETTE["pink"], 0.50, gloss=True))
    # Whisker dots, high on the muzzle pad and small. An earlier version also
    # drew "smile lines" as beads out from the mouth corners; at this scale they
    # read as scattered debris on the cheeks, not as lines.
    for sx in (-1, 1):
        for i, (u, t) in enumerate(((0.030, 0.016), (0.040, 0.006), (0.032, -0.004))):
            parts.append(disc(f"Whisker_{'L' if sx < 0 else 'R'}{i}",
                              surf + n * 0.006 + side * (sx * u) + tang * t,
                              n, 0.004, PALETTE["nose"], 0.5))


def build_ears(body, parts):
    head_c = Vector((0.0, HEAD_Y, HEAD_Z))
    for sx in (-1, 1):
        tag = "L" if sx < 0 else "R"
        surf, nor = surface(body, head_c, Vector((sx * 0.80, 0.16, 1.0)))
        n, tang, side = basis(nor)
        print(f"[detail] ear {tag} at {tuple(round(x,3) for x in surf)}")
        parts.append(disc(f"EarInner_{tag}", surf + n * 0.004, n, 0.036, PALETTE["pink"], 0.34))
        parts.append(disc(f"EarInnerDeep_{tag}", surf + n * 0.007, n, 0.021,
                          mix(PALETTE["pink"], (0.35, 0.18, 0.20), 0.45), 0.36))


def paw_anchors(body):
    """Locate the four paws from the mesh rather than assuming coordinates."""
    pts = [v.co for v in body.data.vertices]
    zmin = min(p.z for p in pts)
    foot = [p for p in pts if p.z < zmin + 0.085]
    groups = {}
    for p in foot:
        groups.setdefault((p.x < 0, p.y > (BODY_FRONT_Y + BODY_BACK_Y) * 0.5), []).append(p)
    out = []
    for (left, front), g in sorted(groups.items()):
        out.append((left, front,
                    sum(p.x for p in g) / len(g),
                    max(p.y for p in g),
                    min(p.z for p in g)))
    return out


def build_paws(body, parts):
    anchors = paw_anchors(body)
    if len(anchors) != 4:
        raise SystemExit(f"expected 4 paws, found {len(anchors)}")
    for left, front, cx, fy, cz in anchors:
        tag = f"{'F' if front else 'B'}{'L' if left else 'R'}"
        print(f"[detail] paw {tag} x={cx:.3f} toe_y={fy:.3f} z={cz:.3f}")
        # Three toe lobes across the front of the paw, then a claw off each.
        for i, dx in enumerate((-0.026, 0.0, 0.026)):
            parts.append(ball(f"Toe_{tag}{i}", (cx + dx, fy - 0.024, cz + 0.030),
                              0.019, PALETTE["cream"], (0.90, 1.05, 0.85)))
            parts.append(ball(f"Claw_{tag}{i}", (cx + dx, fy - 0.006, cz + 0.019),
                              0.010, PALETTE["claw"], (0.70, 1.35, 0.70)))
        parts.append(ball(f"Pad_{tag}", (cx, fy - 0.048, cz + 0.008),
                          0.030, PALETTE["pad"], (1.0, 1.1, 0.26)))


def build_tail(body, parts):
    """Cap the tail with a mane-coloured tuft.

    Quadriflow dropped the tail shaft outright on the first retopo run — it was
    thinner than the remesher's sampling resolution — and even at 8,500 faces the
    sculpted tuft survives only as a slight swelling, so from the side the tail
    reads as a bare rod. An explicit tuft placed from the MEASURED tip is both
    cheaper and more reliable than trying to keep a thin sculpted one alive
    through a remesh.
    """
    tip = max((v.co for v in body.data.vertices), key=lambda c: c.z - c.y * 1.2)
    print(f"[detail] tail tip at {tuple(round(x, 3) for x in tip)}")
    parts.append(ball("TailTuft", (tip.x, tip.y - 0.006, tip.z + 0.014),
                      0.050, PALETTE["mane"], (0.86, 0.86, 1.20)))


def build_features(body):
    parts = []
    build_eyes(body, parts)
    build_nose_and_mouth(body, parts)
    build_ears(body, parts)
    build_paws(body, parts)
    build_tail(body, parts)
    return parts


def tone_down_studio():
    """The silhouette studio was lit for one pale material. With the real
    palette those levels bleach the auburn mane to tan."""
    for o in bpy.data.objects:
        if o.type == "LIGHT":
            o.data.energy *= 0.42
    w = bpy.context.scene.world
    if w and w.use_nodes:
        bg = w.node_tree.nodes.get("Background")
        if bg:
            bg.inputs[1].default_value = 0.35


def render_views():
    sc = bpy.context.scene
    sc.render.engine = "BLENDER_EEVEE_NEXT" if "BLENDER_EEVEE_NEXT" in {
        i.identifier for i in bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items
    } else "BLENDER_EEVEE"
    sc.render.resolution_x = 900
    sc.render.resolution_y = 900
    sc.view_settings.view_transform = "Standard"
    os.makedirs(PREVIEW_DIR, exist_ok=True)

    cam = bpy.data.objects.get("StudyCam")
    if cam is None:
        cd = bpy.data.cameras.new("StudyCam")
        cd.lens = 55.0
        cam = bpy.data.objects.new("StudyCam", cd)
        sc.collection.objects.link(cam)
    sc.camera = cam

    target = Vector((0.0, 0.02, 0.62))
    dist = 2.15
    views = {
        "front": (math.radians(180), 0.14),
        "side": (math.radians(90), 0.14),
        "rear": (math.radians(0), 0.14),
        "three-quarter": (math.radians(214), 0.22),
        "face": (math.radians(180), 0.06),
    }
    for name, (yaw, elev) in views.items():
        d = 1.15 if name == "face" else dist
        t = Vector((0.0, HEAD_Y - 0.05, HEAD_Z)) if name == "face" else target
        cam.location = (t.x + math.sin(yaw) * d, t.y - math.cos(yaw) * d, t.z + d * elev)
        cam.rotation_euler = (t - cam.location).to_track_quat("-Z", "Y").to_euler()
        sc.render.filepath = os.path.join(PREVIEW_DIR, f"{name}.png")
        bpy.ops.render.render(write_still=True)


def main():
    body = bpy.data.objects.get("LionBody_Retopo")
    if body is None:
        raise SystemExit("LionBody_Retopo not found — run retopo_lion.py first")

    # Drop the hidden blockout reference; its job is done.
    ref = bpy.data.objects.get("LionBlockout_Reference")
    if ref:
        bpy.data.objects.remove(ref, do_unlink=True)

    paint_coat(body, ear_surface_points(body))
    parts = build_features(body)
    tone_down_studio()

    # Parent features to the body so they travel together until rigging.
    for p in parts:
        p.parent = body
        p.matrix_parent_inverse = body.matrix_world.inverted()

    os.makedirs(os.path.dirname(BLEND_OUT), exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=BLEND_OUT)
    render_views()
    bpy.ops.wm.save_as_mainfile(filepath=BLEND_OUT)

    body.data.calc_loop_triangles()
    feat_tris = 0
    for p in parts:
        p.data.calc_loop_triangles()
        feat_tris += len(p.data.loop_triangles)

    print("\n===LION_DETAIL===")
    print(f"BLEND={BLEND_OUT}")
    print(f"BODY_TRIS={len(body.data.loop_triangles)}")
    print(f"FEATURE_OBJECTS={len(parts)}")
    print(f"FEATURE_TRIS={feat_tris}")
    print(f"TOTAL_TRIS={len(body.data.loop_triangles) + feat_tris}")
    print(f"MATERIALS={len(bpy.data.materials)}")
    print("===LION_DETAIL_END===")


if __name__ == "__main__":
    main()
