"""
build_lion_silhouette.py — Priority A: silhouette and proportion study.

The existing lion.blend is 96 separate meshes each rigidly parented to one bone.
That is a part-assembly, not a character: it cannot deform, cannot be weight
painted, and is the 3D equivalent of the image-stacking the brief forbids.

This builds a SINGLE CONTINUOUS MESH instead, using a vertex skeleton driven by
the Skin modifier:

    vertex chain  ->  Skin (per-vertex radii)  ->  Subdivision  ->  one quad mesh

Why this technique for a stylised quadruped:
  - the output is one watertight, continuous surface — genuinely skinnable
  - topology follows the limb chains, so deformation loops land where joints are
  - proportions are edited as RADII on a skeleton, which is exactly the level of
    control a silhouette pass needs — no detail to hide behind
  - it is reproducible, so proportion review notes turn into parameter edits
    rather than manual re-sculpting

This pass is deliberately UNTEXTURED and UNRIGGED. Its only job is silhouette
and proportion, judged from four views. Detail, topology cleanup, skeleton and
skinning come after the silhouette is approved.

IDENTITY LOCK (art/blender/references/README.md, from the video close-ups):
  low quadruped stance, four readable weight-bearing paws, oversized rounded
  head, large front paws, short muzzle, broad layered mane with a raised top
  tuft, compact chest and belly, short legs with soft joints, tail from the
  pelvis with a rounded tuft.

Run:
  blender --background --factory-startup \
    --python tools/blender/build_lion_silhouette.py

Outputs:
  art/blender/lion_silhouette.blend
  docs/assets/lion-silhouette/{front,side,rear,three-quarter}.png
"""

import math
import os

import bpy
from mathutils import Vector

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
BLEND_OUT = os.path.join(REPO, "art", "blender", "lion_silhouette.blend")
PREVIEW_DIR = os.path.join(REPO, "docs", "assets", "lion-silhouette")

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


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.unit_settings.system = "METRIC"
    sc.unit_settings.length_unit = "METERS"


def material(name, rgb, roughness=0.62):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    b = mat.node_tree.nodes.get("Principled BSDF")
    b.inputs["Base Color"].default_value = (*rgb, 1.0)
    b.inputs["Roughness"].default_value = roughness
    return mat


def build_skeleton_mesh():
    """Vertex skeleton for the Skin modifier.

    Only PRIMARY forms, per the brief: body mass, ribcage, pelvis, neck, head,
    muzzle, four limbs, paws, tail. No eyes, ears, teeth or mane lobes yet —
    those are secondary and would hide silhouette problems.
    """
    v = []          # (x, y, z)
    e = []          # (i, j)
    radii = []      # (rx, rz) per vertex

    def add(pos, r):
        v.append(Vector(pos))
        radii.append(r)
        return len(v) - 1

    # ── Spine: pelvis -> waist -> chest -> neck -> head -> muzzle ───────────
    pelvis = add((0.0, BODY_BACK_Y, SPINE_Z), (R_HIP, R_HIP))
    waist = add((0.0, BODY_BACK_Y + 0.16, SPINE_Z + 0.01), (R_WAIST, R_WAIST))
    chest = add((0.0, BODY_FRONT_Y, SPINE_Z + 0.03), (R_CHEST, R_CHEST))
    neck = add((0.0, BODY_FRONT_Y + 0.07, SHOULDER_Z + 0.08), (R_NECK, R_NECK))
    # The head is NOT built on this chain. Four review passes showed the Skin
    # modifier blending skull, muzzle and mane into one smooth lozenge — it
    # merges adjacent volumes by design, which is precisely wrong for the three
    # features that carry this character's identity. The head is built as
    # separate masses below and unified by a voxel remesh.
    head = add((0.0, HEAD_Y - 0.06, HEAD_Z - 0.06), (R_NECK * 1.15, R_NECK * 1.15))
    e += [(pelvis, waist), (waist, chest), (chest, neck), (neck, head)]

    # ── Legs ───────────────────────────────────────────────────────────────
    def leg(x, y, front):
        # Plumb columns, per the turnaround — but with a JOINT vertex carrying a
        # slightly larger radius than the shaft below it. A featureless cylinder
        # gives retopology and rigging nowhere to put an elbow or a knee, and
        # the brief is explicit that the stylised character can hide anatomy
        # while the rig cannot.
        hip_z = SHOULDER_Z if front else SPINE_Z + 0.02
        top = add((x, y, hip_z - 0.045), (R_LEG_TOP, R_LEG_TOP))
        joint_z = GROUND + (BELLY_Z - GROUND) * 0.56
        mid = add((x, y, joint_z), (R_LEG_MID * 1.14, R_LEG_MID * 1.14))
        paw = add((x, y, GROUND + 0.042), (R_PAW, R_PAW))
        e.append((chest if front else pelvis, top))
        e.append((top, mid))
        e.append((mid, paw))

    leg(-0.098, BODY_FRONT_Y + 0.02, True)
    leg(0.098, BODY_FRONT_Y + 0.02, True)
    leg(-0.098, BODY_BACK_Y + 0.02, False)
    leg(0.098, BODY_BACK_Y + 0.02, False)

    # ── Tail ───────────────────────────────────────────────────────────────
    # Long, light and tapering, lifted at the tip. Review 7 was closer but still
    # read heavy; the shaft is thinner now and the tuft carries the weight.
    # The previous curve rose to SPINE_Z + 0.40, nearly vertical. In the app it
    # read as a thin spike standing above the lion — from the hero camera it was
    # the most prominent thing on the island. The reference tail leaves the rump
    # low, arcs BACKWARD with a gentle lift, and ends in a heavy tuft.
    t1 = add((0.0, BODY_BACK_Y - 0.05, SPINE_Z + 0.075), (R_TAIL, R_TAIL))
    t2 = add((0.0, BODY_BACK_Y - 0.15, SPINE_Z + 0.150), (R_TAIL * 0.92, R_TAIL * 0.92))
    t3 = add((0.0, BODY_BACK_Y - 0.24, SPINE_Z + 0.205), (R_TAIL * 0.86, R_TAIL * 0.86))
    t4 = add((0.0, BODY_BACK_Y - 0.31, SPINE_Z + 0.235), (R_TAIL * 0.80, R_TAIL * 0.80))
    tuft = add((0.0, BODY_BACK_Y - 0.365, SPINE_Z + 0.240), (R_TUFT, R_TUFT))
    e += [(pelvis, t1), (t1, t2), (t2, t3), (t3, t4), (t4, tuft)]

    mesh = bpy.data.meshes.new("LionBody")
    mesh.from_pydata([tuple(p) for p in v], e, [])
    mesh.update()

    obj = bpy.data.objects.new("LionBody", mesh)
    bpy.context.scene.collection.objects.link(obj)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)

    # Skin modifier turns the chain into a continuous surface.
    skin = obj.modifiers.new("Skin", "SKIN")
    skin.use_smooth_shade = True
    skin.branch_smoothing = 0.62      # review 2 left a hard crease at the neck

    layer = mesh.skin_vertices[0].data
    for i, (rx, rz) in enumerate(radii):
        layer[i].radius = (rx, rz)
    layer[pelvis].use_root = True

    # Subdivision rounds the blockout into the soft stylised forms the identity
    # lock calls for. Two levels is enough to judge silhouette.
    sub = obj.modifiers.new("Subdivision", "SUBSURF")
    sub.levels = 2
    sub.render_levels = 2

    obj.data.materials.append(material("LionCoat", (0.925, 0.647, 0.259)))
    return obj


def lock_profile():
    """The cross-section every mane lock is swept along.

    A flattened lens rather than a circle. Round locks read as ropes or as a
    bundle of sausages; the approved mane is made of flat, broad clumps, and the
    cross-section is where that difference is decided.
    """
    bpy.ops.curve.primitive_bezier_circle_add(radius=0.095, enter_editmode=False)
    prof = bpy.context.object
    prof.name = "ManeLockProfile"
    prof.scale = (1.0, 0.56, 1.0)
    prof.hide_render = True
    prof.hide_viewport = True
    return prof


def mane_lock(name, root_c, az_deg, el_deg, length, bend, thick, profile):
    """One tapered lock, rooted inside the skull and sweeping outward.

    `az`/`el` aim it (az 0 = forward, 90 = right, 180 = back). `bend` curls the
    tip in (y, z) so a lock can flick forward like the quiff or droop like the
    side frame. The radius taper is what gives it a point — a constant radius
    would produce a tube, and a mane of tubes is the ball problem again with
    extra steps.
    """
    az, el = math.radians(az_deg), math.radians(el_deg)
    d = Vector((math.sin(az) * math.cos(el), math.cos(az) * math.cos(el), math.sin(el)))
    b = Vector((0.0, bend[0], bend[1]))

    # Rooted BELOW the head surface so the lock and the skull share volume and
    # the remesh welds them instead of leaving a lip.
    # Rooted DEEP — most of each lock is buried in the mane mass and only its
    # outer third stands proud. The first attempt rooted them at 0.135 with a
    # 0.13 tip taper and they read as a sea urchin: sharp spines radiating into
    # open air. Locks are surface RELIEF on a solid mane, not the mane itself.
    r0 = 0.205
    pts = [
        (root_c + d * r0,                                   0.86 * thick),
        (root_c + d * (r0 + length * 0.36) + b * 0.20,       1.06 * thick),
        (root_c + d * (r0 + length * 0.74) + b * 0.68,       0.86 * thick),
        (root_c + d * (r0 + length)        + b * 1.35,       0.44 * thick),
    ]

    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "3D"
    cu.resolution_u = 5
    cu.bevel_mode = "OBJECT"
    cu.bevel_object = profile
    cu.use_fill_caps = True

    sp = cu.splines.new("BEZIER")
    sp.bezier_points.add(len(pts) - 1)
    for i, (co, rad) in enumerate(pts):
        bp = sp.bezier_points[i]
        bp.co = co
        bp.handle_left_type = "AUTO"
        bp.handle_right_type = "AUTO"
        bp.radius = rad

    obj = bpy.data.objects.new(name, cu)
    bpy.context.scene.collection.objects.link(obj)

    # unify() joins meshes, so the swept curve has to become one.
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.convert(target="MESH")
    return bpy.context.view_layer.objects.active


def build_head_masses(body):
    """Head, mane, paws and face planes as DISTINCT volumes.

    Built separately and unified by a voxel remesh — the standard sculpting
    blockout route. Unlike the Skin modifier it preserves boundaries between
    masses, so a muzzle stays a muzzle and a paw stays a paw.

    The mane is a large mass covering neck and shoulders with the face set into
    its FRONT, per the approved turnaround — not a ring around the head.
    """
    parts = []

    def ball(name, loc, radius, scale=(1.0, 1.0, 1.0)):
        bpy.ops.mesh.primitive_uv_sphere_add(segments=28, ring_count=18,
                                             radius=radius, location=loc)
        o = bpy.context.object
        o.name = name
        o.scale = scale
        parts.append(o)
        return o

    # THE critical relationship in this character: the face is set into the
    # FRONT OPENING of the mane, not buried inside it. The previous attempt put
    # the mane core only 0.155 behind the head with a near-spherical Y extent,
    # so its front hemisphere closed over the face and the front view had no
    # face at all — just a ball with ears. The core now sits well back and is
    # FLATTENED front-to-back; the side lobes, not the core, are what come
    # forward to frame the face.
    # ══ MANE: CURVE LOCKS, not spheres ═════════════════════════════════════
    # Three passes of sphere placement never got past a scalloped ball, and the
    # research says why: stylised character hair is not built from volumes at
    # all. It is built from LOCKS — tapered strips that root near the scalp and
    # sweep outward — and the shape language of the approved turnaround is
    # exactly that: a crown that flicks forward into a quiff, side masses that
    # sweep down past the cheek, a ruff that spills onto the chest.
    #
    # A sphere has no direction. A lock does, and direction is the whole point:
    # it is what makes a mane read as hair rather than as mass. Each lock here is
    # a Bezier curve with a flattened bevel profile and a per-point radius taper,
    # rooted inside the head so there is no seam, sweeping out along an azimuth
    # and elevation, with a bend that curls the tip.
    #
    # Spacing matters: adjacent locks are placed so the gaps between them are
    # wider than the 1.15cm voxel used in unify(). Closer than that and the
    # remesh fuses them back into the ball this replaces.
    mane_y, mane_z = MANE_Y, MANE_Z

    profile = lock_profile()

    # A modest inner mass so daylight never shows between the locks and the
    # skull. It is deliberately SMALLER than the lock envelope — it fills, it
    # does not define the silhouette.
    # The mane VOLUME. Sized just under the measured envelope so the locks that
    # ride on it carry the final silhouette.
    ball("ManeCore",  (0.0, mane_y, mane_z), 0.285, (1.02, 0.64, 1.18))
    ball("ManeCrown", (0.0, HEAD_Y - 0.170, HEAD_Z + 0.235), 0.172, (1.04, 0.82, 0.72))
    ball("ManeRuff",  (0.0, HEAD_Y - 0.150, HEAD_Z - 0.285), 0.190, (1.08, 0.86, 0.78))
    for sx in (-1, 1):
        ball(f"ManeSide_{'L' if sx < 0 else 'R'}",
             (sx * 0.235, HEAD_Y - 0.140, HEAD_Z + 0.025), 0.192, (0.72, 0.90, 1.14))

    root_c = Vector((0.0, HEAD_Y - 0.105, HEAD_Z - 0.015))

    #        az      el     len    bend (y, z)        thick
    LAYERS = [
        # Crown: up and back, the front pair flicking forward as the quiff.
        ("crown", [
            (   0.0,  80.0, 0.130, ( 0.060, -0.005), 1.00),
            ( -26.0,  73.0, 0.135, ( 0.050, -0.012), 1.00),
            (  26.0,  73.0, 0.135, ( 0.050, -0.012), 1.00),
            ( -54.0,  64.0, 0.130, ( 0.018, -0.030), 0.95),
            (  54.0,  64.0, 0.130, ( 0.018, -0.030), 0.95),
            ( 180.0,  74.0, 0.135, (-0.055, -0.018), 1.00),
            (-138.0,  68.0, 0.130, (-0.042, -0.030), 0.95),
            ( 138.0,  68.0, 0.130, (-0.042, -0.030), 0.95),
        ]),
        # Side frame: out and down past the cheek — the face-framing mass.
        ("side", [
            ( -60.0,  40.0, 0.140, ( 0.020, -0.055), 1.05),
            (  60.0,  40.0, 0.140, ( 0.020, -0.055), 1.05),
            ( -72.0,  18.0, 0.145, ( 0.028, -0.062), 1.05),
            (  72.0,  18.0, 0.145, ( 0.028, -0.062), 1.05),
            ( -78.0,  -6.0, 0.140, ( 0.038, -0.060), 1.00),
            (  78.0,  -6.0, 0.140, ( 0.038, -0.060), 1.00),
            ( -86.0, -28.0, 0.135, ( 0.042, -0.055), 0.95),
            (  86.0, -28.0, 0.135, ( 0.042, -0.055), 0.95),
            (-102.0,  30.0, 0.135, (-0.008, -0.060), 1.00),
            ( 102.0,  30.0, 0.135, (-0.008, -0.060), 1.00),
            (-112.0,   6.0, 0.130, (-0.020, -0.058), 0.95),
            ( 112.0,   6.0, 0.130, (-0.020, -0.058), 0.95),
        ]),
        # Ruff: down onto the chest, spaced so the cream V shows between them.
        ("ruff", [
            ( -28.0, -50.0, 0.135, ( 0.038, -0.050), 1.00),
            (  28.0, -50.0, 0.135, ( 0.038, -0.050), 1.00),
            ( -56.0, -48.0, 0.135, ( 0.030, -0.055), 1.00),
            (  56.0, -48.0, 0.135, ( 0.030, -0.055), 1.00),
            (   0.0, -62.0, 0.120, ( 0.045, -0.040), 0.90),
        ]),
        # Rear: back over the withers, tying the mane into the shoulders.
        ("rear", [
            ( 150.0,  36.0, 0.135, (-0.052, -0.048), 1.00),
            (-150.0,  36.0, 0.135, (-0.052, -0.048), 1.00),
            ( 166.0,  10.0, 0.130, (-0.058, -0.040), 0.95),
            (-166.0,  10.0, 0.130, (-0.058, -0.040), 0.95),
            ( 158.0,  56.0, 0.130, (-0.050, -0.030), 0.95),
            (-158.0,  56.0, 0.130, (-0.050, -0.030), 0.95),
        ]),
    ]

    for layer, locks in LAYERS:
        for i, (az, el, length, bend, thick) in enumerate(locks):
            parts.append(mane_lock(f"ManeLock_{layer}_{i}", root_c, az, el,
                                   length, bend, thick, profile))

    # ══ HEAD set into the FRONT of the mane ════════════════════════════════
    ball("Skull", (0.0, HEAD_Y, HEAD_Z), R_HEAD, (1.04, 0.96, 0.98))

    # Face plate: a broad flattened mass establishing the FACIAL PLANE that
    # retopology has to support. Pushed forward so it clearly emerges from the
    # hood opening rather than sitting flush inside it.
    ball("FacePlane", (0.0, HEAD_Y + 0.120, HEAD_Z + 0.005), 0.198, (1.02, 0.40, 0.98))

    # Brow ridge: the ONLY additive feature in the eye region. Eye sockets are
    # implied by the brow above and the cheek below, not modelled directly —
    # additive primitives can only ADD mass, so a sphere placed at the eye
    # bulges outward exactly where the socket should recess.
    for sx in (-1, 1):
        ball(f"Brow_{'L' if sx < 0 else 'R'}",
             (sx * 0.084, HEAD_Y + 0.156, HEAD_Z + 0.076), 0.066, (1.24, 0.56, 0.46))

    # ══ MUZZLE: compact, flatter, tucked — not a bulb ══════════════════════
    ball("Muzzle", (0.0, HEAD_Y + 0.155, HEAD_Z - 0.058), 0.108, (1.26, 0.72, 0.82))
    ball("Nose", (0.0, HEAD_Y + 0.200, HEAD_Z - 0.022), 0.044, (1.05, 0.76, 0.82))
    ball("Jaw", (0.0, HEAD_Y + 0.115, HEAD_Z - 0.122), 0.094, (1.10, 0.88, 0.60))

    for sx in (-1, 1):
        ball(f"Cheek_{'L' if sx < 0 else 'R'}",
             (sx * 0.104, HEAD_Y + 0.070, HEAD_Z - 0.056), 0.092, (0.94, 0.96, 0.90))

    # ══ EARS: forward of the mane plane so they read from every angle ══════
    for sx in (-1, 1):
        # 0.088 merged with the skull into two gold lobes the size of the mane
        # side masses, which broke the auburn frame into three pieces. The
        # reference ears are small rounded tabs.
        ball(f"Ear_{'L' if sx < 0 else 'R'}",
             (sx * 0.166, HEAD_Y - 0.005, HEAD_Z + 0.222), 0.062, (0.98, 0.56, 1.02))

    # ══ TAIL TUFT as a distinct volume ═════════════════════════════════════
    # The Skin modifier tapers toward a chain end, so the tuft radius set on the
    # last vertex kept rendering as a point and the tail read as a bare rod. A
    # separate ball survives the taper, exactly as the paws do.
    ball("TailTuft", (0.0, BODY_BACK_Y - 0.375, SPINE_Z + 0.240), 0.098, (0.92, 1.18, 1.00))

    # ══ PAWS: distinct bulbous socks, wider than the shafts ════════════════
    # Built as separate volumes so there is a clean break between leg column and
    # paw mass. Widening the skin-chain radius only swelled the shaft tip.
    for x in (-0.098, 0.098):
        for y, front in ((BODY_FRONT_Y + 0.02, True), (BODY_BACK_Y + 0.02, False)):
            tag = f"{'F' if front else 'R'}{'L' if x < 0 else 'R'}"
            ball(f"Paw_{tag}", (x, y + (0.020 if front else 0.012), GROUND + 0.054),
                 0.112, (1.10, 1.22, 0.62))

    return parts


def unify(body, parts):
    """Join everything and voxel-remesh into ONE continuous mesh."""
    # Bake the Skin/Subsurf result down first so the join is real geometry.
    bpy.context.view_layer.objects.active = body
    body.select_set(True)
    for m in list(body.modifiers):
        bpy.ops.object.modifier_apply(modifier=m.name)

    bpy.ops.object.select_all(action="DESELECT")
    body.select_set(True)
    for p in parts:
        p.select_set(True)
    bpy.context.view_layer.objects.active = body
    bpy.ops.object.join()

    merged = bpy.context.view_layer.objects.active
    merged.name = "LionBody"

    rem = merged.modifiers.new("Remesh", "REMESH")
    rem.mode = "VOXEL"
    rem.voxel_size = 0.0115          # ~1.2cm on a 0.93m character
    rem.use_smooth_shade = True
    bpy.ops.object.modifier_apply(modifier=rem.name)

    # Light smoothing to take the voxel stair-stepping off the silhouette.
    sm = merged.modifiers.new("Smooth", "SMOOTH")
    # Dropped from 0.55/4: that much smoothing rounded the mane locks back
    # toward a single mass, erasing the grooves that make them read as clumps.
    sm.factor = 0.38
    sm.iterations = 2
    bpy.ops.object.modifier_apply(modifier=sm.name)

    if not merged.data.materials:
        merged.data.materials.append(material("LionCoat", (0.925, 0.647, 0.259)))
    return merged


def build_lighting_and_cameras():
    """Neutral studio light so the SILHOUETTE is judged, not the shading."""
    key = bpy.data.lights.new("Key", type="AREA")
    key.energy = 220.0
    key.size = 3.0
    ko = bpy.data.objects.new("KeyLight", key)
    ko.location = (2.4, -2.6, 2.6)
    ko.rotation_euler = (math.radians(52), 0, math.radians(40))
    bpy.context.scene.collection.objects.link(ko)

    fill = bpy.data.lights.new("Fill", type="AREA")
    fill.energy = 90.0
    fill.size = 4.0
    fo = bpy.data.objects.new("FillLight", fill)
    fo.location = (-2.6, -2.0, 1.6)
    fo.rotation_euler = (math.radians(74), 0, math.radians(-52))
    bpy.context.scene.collection.objects.link(fo)

    rim = bpy.data.lights.new("Rim", type="AREA")
    rim.energy = 120.0
    rim.size = 2.0
    ro = bpy.data.objects.new("RimLight", rim)
    ro.location = (-1.0, 2.6, 2.0)
    ro.rotation_euler = (math.radians(108), 0, math.radians(-160))
    bpy.context.scene.collection.objects.link(ro)

    world = bpy.data.worlds.new("StudioWorld")
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs[0].default_value = (0.55, 0.60, 0.66, 1.0)
    world.node_tree.nodes["Background"].inputs[1].default_value = 0.55
    bpy.context.scene.world = world

    # No backdrop plane: with cameras orbiting the full 360 degrees it ends up
    # BETWEEN the camera and the subject on rear views and renders an empty
    # frame. The world colour provides the same neutral field from every angle.

    bpy.ops.mesh.primitive_plane_add(size=12, location=(0, 0, 0))
    fl = bpy.context.object
    fl.name = "Floor"
    fl.data.materials.append(material("Floor", (0.28, 0.30, 0.34), 0.9))


def render_views():
    sc = bpy.context.scene
    sc.render.engine = "BLENDER_EEVEE_NEXT" if "BLENDER_EEVEE_NEXT" in {
        i.identifier for i in bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items
    } else "BLENDER_EEVEE"
    sc.render.resolution_x = 900
    sc.render.resolution_y = 900
    sc.view_settings.view_transform = "Standard"
    os.makedirs(PREVIEW_DIR, exist_ok=True)

    cam_data = bpy.data.cameras.new("StudyCam")
    cam_data.lens = 55.0          # long enough to keep proportions honest,
                                  # short enough to frame the whole animal
    cam = bpy.data.objects.new("StudyCam", cam_data)
    bpy.context.scene.collection.objects.link(cam)
    sc.camera = cam

    target = Vector((0.0, 0.02, 0.60))
    dist = 2.35
    # The lion faces +Y, so the camera must sit at +Y to see its face. Yaw 0
    # put the camera behind the animal and every "front" review was actually
    # looking at its back.
    views = {
        "front": (math.radians(180), 0.16),
        "side": (math.radians(90), 0.16),
        "rear": (math.radians(0), 0.16),
        "three-quarter": (math.radians(228), 0.26),
    }
    for name, (yaw, elev) in views.items():
        cam.location = (
            target.x + math.sin(yaw) * dist,
            target.y - math.cos(yaw) * dist,
            target.z + dist * elev,
        )
        direction = target - cam.location
        cam.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
        sc.render.filepath = os.path.join(PREVIEW_DIR, f"{name}.png")
        bpy.ops.render.render(write_still=True)


def main():
    reset()
    body = build_skeleton_mesh()
    parts = build_head_masses(body)
    obj = unify(body, parts)
    build_lighting_and_cameras()

    # Report the ACTUAL silhouette produced, not the intended numbers.
    deps = bpy.context.evaluated_depsgraph_get()
    ev = obj.evaluated_get(deps)
    me = ev.to_mesh()
    xs = [(obj.matrix_world @ v.co) for v in me.vertices]
    height = max(p.z for p in xs) - min(p.z for p in xs)
    length = max(p.y for p in xs) - min(p.y for p in xs)
    width = max(p.x for p in xs) - min(p.x for p in xs)
    tris = len(me.loop_triangles) if me.loop_triangles else 0
    me.calc_loop_triangles()
    tris = len(me.loop_triangles)
    verts = len(me.vertices)
    ev.to_mesh_clear()

    os.makedirs(os.path.dirname(BLEND_OUT), exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=BLEND_OUT)
    render_views()
    bpy.ops.wm.save_as_mainfile(filepath=BLEND_OUT)

    print("\n===LION_SILHOUETTE===")
    print(f"BLEND={BLEND_OUT}")
    print(f"MESH_OBJECTS={len([o for o in bpy.data.objects if o.type == 'MESH' and o.name == 'LionBody'])}")
    print(f"HEIGHT={height:.3f}")
    print(f"LENGTH={length:.3f}")
    print(f"WIDTH={width:.3f}")
    print(f"HEAD_FRACTION={(MANE_TOP - (HEAD_Z - R_HEAD)) / TOTAL_H:.3f}")
    print(f"VERTS={verts}")
    print(f"TRIS={tris}")
    print("===LION_SILHOUETTE_END===")


if __name__ == "__main__":
    main()
