"""
rig_cage_lion.py — production armature, authored skinning, four-leg IK.

Three things happen here, in the order they have to happen:

1. The deform skeleton from `lion_skeleton.skeleton()` is built.
2. The cage is skinned by LOOKING UP ring ownership rather than diffusing heat
   through the mesh. See `lion_skeleton` for why.
3. IK is added to all four legs, with pole targets and rotation limits, and then
   the thing the brief actually cares about is measured: **a planted paw must
   stay planted while the torso moves.** That is not "IK exists" — it is a
   number, and it is reported.

The planted-paw proof matters because every locomotion problem downstream is a
consequence of it. If a paw slides while the body shifts, no walk cycle will look
weighted no matter how the clip is authored.

Run:
  blender --background art/blender/lion_cage.blend \
    --factory-startup --python tools/blender/rig_cage_lion.py

Outputs:
  art/blender/lion_rigged_cage.blend
  public/assets/lion/cage/lion_cage_rigged.glb
  docs/assets/lion-rig/{pose}.png
"""

import math
import os
import sys

import bpy
from mathutils import Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lion_contract import HEAD_Z  # noqa: E402
from lion_skeleton import JAW_RINGS, skeleton, skin_map  # noqa: E402

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
BLEND_OUT = os.path.join(REPO, "art", "blender", "lion_rigged_cage.blend")
GLB_OUT = os.path.join(REPO, "public", "assets", "lion", "cage", "lion_cage_rigged.glb")
PREVIEW_DIR = os.path.join(REPO, "docs", "assets", "lion-rig")

# (label, ik_on_bone, chain_len, pole_offset, pole_name)
#
# Chain length is counted from the constrained bone UP the hierarchy, and the
# first attempt got it wrong: 3 on a front leg covers paw, wrist and forearm and
# stops at the elbow, so the solver had no way to answer a body that moved at the
# shoulder. A front chain must reach the upper limb (4) and a rear chain the
# thigh (5). The scapula and pelvis are deliberately OUTSIDE the chain — they
# belong to the torso, and letting IK drive them means the body chases the feet.
LEGS = [
    ("FL", "paw_FL", 4, Vector((0.0, -0.62, 0.0)), "pole_FL"),
    ("FR", "paw_FR", 4, Vector((0.0, -0.62, 0.0)), "pole_FR"),
    ("RL", "paw_RL", 5, Vector((0.0, -0.62, 0.0)), "pole_RL"),
    ("RR", "paw_RR", 5, Vector((0.0, -0.62, 0.0)), "pole_RR"),
]


def build_armature():
    arm_data = bpy.data.armatures.new("LionRig")
    arm = bpy.data.objects.new("LionRig", arm_data)
    bpy.context.scene.collection.objects.link(arm)
    bpy.context.view_layer.objects.active = arm
    bpy.ops.object.mode_set(mode="EDIT")

    made = {}
    for name, parent, head, tail in skeleton():
        b = arm_data.edit_bones.new(name)
        b.head, b.tail = Vector(head), Vector(tail)
        made[name] = b
        if parent:
            b.parent = made[parent]
            b.use_connect = False

    # IK targets and poles live in the rig but must NOT deform anything. Leaving
    # them deformable once drove a long dark spike through the chest, because
    # automatic weighting happily assigned mesh to a control bone floating in
    # mid-air.
    for label, ik_bone, _chain, pole_off, pole_name in LEGS:
        src = made[ik_bone]
        t = arm_data.edit_bones.new(f"ik_{label}")
        t.head = src.tail.copy()
        t.tail = src.tail + Vector((0.0, 0.0, 0.075))
        t.parent = made["root"]
        t.use_deform = False

        p = arm_data.edit_bones.new(pole_name)
        p.head = src.head + pole_off
        p.tail = p.head + Vector((0.0, 0.0, 0.06))
        p.parent = made["root"]
        p.use_deform = False

    bpy.ops.object.mode_set(mode="OBJECT")
    for b in arm_data.bones:
        if b.name.startswith(("ik_", "pole_")) or b.name == "root":
            b.use_deform = False
    deform = [b.name for b in arm_data.bones if b.use_deform]
    print(f"[rig] {len(arm_data.bones)} bones, {len(deform)} deforming")
    return arm


# ── authored skinning ───────────────────────────────────────────────────────
def skin(cage, arm):
    """Write weights from the ring map, then normalise.

    Every existing vertex group on the cage is a RING label written by
    cage_lion.py. They are read, translated through the skin map into bone
    weights, and then removed — the ring labels are scaffolding, and shipping
    them would put 95 meaningless groups in the GLB.
    """
    mesh = cage.data
    ring_members = {}
    for vg in cage.vertex_groups:
        ring_members[vg.name] = []
    for v in mesh.vertices:
        for g in v.groups:
            name = cage.vertex_groups[g.group].name
            ring_members[name].append(v.index)

    smap = skin_map()
    unmapped = sorted(set(ring_members) - set(smap))
    if unmapped:
        print(f"[rig] WARNING unmapped rings: {', '.join(unmapped)}")

    # vertex index -> {bone: weight}
    acc = {}

    def add(vi, bone, w):
        if w <= 0.0:
            return
        acc.setdefault(vi, {})
        acc[vi][bone] = acc[vi].get(bone, 0.0) + w

    for ring, verts in ring_members.items():
        table = smap.get(ring)
        if not table:
            continue
        for vi in verts:
            for bone, w in table.items():
                add(vi, bone, w)

    # Vertices created by the facial inset rings belong to no ring group.
    # Inherit from the nearest vertex that does — a small, local, and honest
    # fallback rather than leaving them unweighted (which pins them to the
    # origin and tears the face open).
    known = list(acc)
    if known:
        known_co = [(vi, mesh.vertices[vi].co) for vi in known]
        orphans = [v.index for v in mesh.vertices if v.index not in acc]
        for vi in orphans:
            co = mesh.vertices[vi].co
            nearest = min(known_co, key=lambda kc: (kc[1] - co).length_squared)[0]
            acc[vi] = dict(acc[nearest])
        if orphans:
            print(f"[rig] {len(orphans)} inset vertices inherited weights from neighbours")

    # ── jaw, applied POSITIONALLY ───────────────────────────────────────────
    #
    # Deliberately not ring-based. A cross-sectional ring at the muzzle contains
    # both the upper lip and the chin, so the jaw split has to come from height
    # — but doing it per-ring left the mouth socket's inset vertices out of the
    # rule entirely. They fell through to nearest-neighbour inheritance, which is
    # not continuous, and opening the jaw tore the mouth into flaps.
    #
    # A single positional field covers every vertex in the muzzle regardless of
    # which ring or inset it came from, so the weight is smooth across all of
    # them by construction.
    cavity = set()
    cav_group = cage.vertex_groups.get("face:mouth_cavity")
    if cav_group:
        for v in mesh.vertices:
            if any(g.group == cav_group.index for g in v.groups):
                cavity.add(v.index)

    jaw_line = HEAD_Z - 0.052
    for v in mesh.vertices:
        if v.index in cavity:
            continue        # explicitly weighted; the field would fight it
        co = v.co
        # How far forward into the muzzle: 0 at the cheek, 1 past the nose.
        fwd = (co.y - 0.542) / (0.628 - 0.542)
        fwd = min(1.0, max(0.0, fwd))
        fwd = fwd * fwd * (3.0 - 2.0 * fwd)
        if fwd <= 0.0:
            continue
        # How far BELOW the jaw line: 0 at the line, 1 at the chin.
        down = (jaw_line - co.z) / 0.078
        down = min(1.0, max(0.0, down))
        down = down * down * (3.0 - 2.0 * down)
        # Lateral taper toward the mouth CORNER.
        #
        # Without this the field was uniform across the muzzle's width, so the
        # faces at the corners straddled the vertical ramp: their upper vertices
        # had almost no jaw weight and their lower ones had plenty, and a 34
        # degree jaw rotation sheared them to 7% of rest area. The pinch metric
        # located them at x = +/-0.06, z = 0.682 — precisely on the ramp.
        #
        # It is also what a real face does. The commissure barely moves; the jaw
        # carries the chin.
        lat = 1.0 - min(1.0, max(0.0, (abs(co.x) - 0.040) / 0.048))
        lat = lat * lat * (3.0 - 2.0 * lat)
        jw = 0.80 * fwd * down * lat
        if jw <= 0.001:
            continue
        table = acc.get(v.index)
        if not table:
            continue
        scale = 1.0 - jw
        for bone in list(table):
            if bone != "jaw":
                table[bone] *= scale
        table["jaw"] = table.get("jaw", 0.0) + jw

    # Replace ring groups with bone groups.
    for vg in list(cage.vertex_groups):
        cage.vertex_groups.remove(vg)

    bone_names = {b.name for b in arm.data.bones if b.use_deform}
    groups = {}
    for vi, table in acc.items():
        total = sum(w for b, w in table.items() if b in bone_names)
        if total <= 0.0:
            continue
        for bone, w in table.items():
            if bone not in bone_names:
                continue
            g = groups.get(bone) or cage.vertex_groups.new(name=bone)
            groups[bone] = g
            g.add([vi], w / total, "REPLACE")

    mod = cage.modifiers.new("Armature", "ARMATURE")
    mod.object = arm
    cage.parent = None
    print(f"[rig] authored weights across {len(groups)} bone groups")

    # glTF allows four influences per vertex; enforce it here so what is tested
    # is what ships.
    bpy.ops.object.select_all(action="DESELECT")
    cage.select_set(True)
    bpy.context.view_layer.objects.active = cage
    bpy.ops.object.vertex_group_limit_total(limit=4)
    bpy.ops.object.vertex_group_normalize_all(lock_active=False)
    # One gentle pass to remove ring-to-ring stepping WITHOUT crossing the seams
    # the map was written to respect.
    bpy.ops.object.mode_set(mode="WEIGHT_PAINT")
    bpy.ops.object.vertex_group_smooth(group_select_mode="ALL", factor=0.22, repeat=1)
    bpy.ops.object.mode_set(mode="OBJECT")
    bpy.ops.object.vertex_group_normalize_all(lock_active=False)


# ── IK ──────────────────────────────────────────────────────────────────────
def add_ik(arm):
    bpy.context.view_layer.objects.active = arm
    bpy.ops.object.mode_set(mode="POSE")
    n = 0
    for label, ik_bone, chain, _off, pole_name in LEGS:
        pb = arm.pose.bones[ik_bone]
        c = pb.constraints.new("IK")
        c.target = arm
        c.subtarget = f"ik_{label}"
        c.pole_target = arm
        c.pole_subtarget = pole_name
        c.pole_angle = math.radians(-90.0 if label.startswith("F") else 90.0)
        c.chain_count = chain
        c.use_tail = True
        n += 1

    # Hinge the mid-limb joints so IK cannot solve them sideways. Without this an
    # elbow will happily invert to reach a target, which looks like a broken leg.
    for side in ("L", "R"):
        for bone, lo, hi in ((f"forearm_F{side}", -148.0, 26.0),
                             (f"shin_R{side}", -150.0, 4.0),
                             (f"hock_R{side}", -6.0, 130.0)):
            pb = arm.pose.bones.get(bone)
            if not pb:
                continue
            pb.use_ik_limit_x = True
            pb.ik_min_x = math.radians(lo)
            pb.ik_max_x = math.radians(hi)
            pb.lock_ik_y = True
            pb.lock_ik_z = True
    bpy.ops.object.mode_set(mode="OBJECT")
    print(f"[rig] {n} IK chains with pole targets and hinge limits")


# ── planted-paw proof ───────────────────────────────────────────────────────
def paw_world(arm, cage, label):
    """World position of a paw sole, read from the DEFORMED mesh.

    Reading the bone would only prove the rig moved the bone. Reading the mesh
    proves the surface the child sees stayed put.
    """
    deps = bpy.context.evaluated_depsgraph_get()
    ev = cage.evaluated_get(deps)
    me = ev.to_mesh()
    grp = f"paw_{label}"
    gi = cage.vertex_groups[grp].index if grp in cage.vertex_groups else None
    pts = []
    if gi is not None:
        for v in me.vertices:
            for g in v.groups:
                if g.group == gi and g.weight > 0.6:
                    pts.append(cage.matrix_world @ v.co)
                    break
    out = sum(pts, Vector()) / len(pts) if pts else None
    ev.to_mesh_clear()
    return out


def reach_headroom(arm):
    """How far the body can rise before a planted paw must be dragged.

    A limb chain can only reach the sum of its segment lengths. At rest it spans
    the straight-line hip-to-paw distance, so the SURPLUS is the extension the
    solver has available — and asking for more than that lifts the paw off the
    ground no matter how the IK is configured.

    This is a rig characteristic, not a bug, and it belongs in the report: the
    walk and jump clips have to stay inside it. The first planted-paw test asked
    for 50mm on a 292mm leg with 11mm of surplus, and then blamed the IK.
    """
    out = {}
    chains = {
        "FL": ["upper_front_FL", "forearm_FL", "wrist_FL", "paw_FL"],
        "FR": ["upper_front_FR", "forearm_FR", "wrist_FR", "paw_FR"],
        "RL": ["thigh_RL", "shin_RL", "hock_RL", "ankle_RL", "paw_RL"],
        "RR": ["thigh_RR", "shin_RR", "hock_RR", "ankle_RR", "paw_RR"],
    }
    for lab, names in chains.items():
        bones = [arm.data.bones[n] for n in names]
        total = sum((b.tail_local - b.head_local).length for b in bones)
        span = (bones[-1].tail_local - bones[0].head_local).length
        out[lab] = total - span
    txt = "  ".join(f"{k}={v * 1000:.1f}mm" for k, v in out.items())
    print(f"[rig] reach headroom {txt}")
    return out


def planted_paw_proof(arm, cage):
    """Move the body under pinned paws and measure how far the paws drift."""
    bpy.context.view_layer.objects.active = arm
    bpy.ops.object.mode_set(mode="POSE")

    def clear():
        for pb in arm.pose.bones:
            pb.rotation_mode = "XYZ"
            pb.rotation_euler = (0, 0, 0)
            pb.location = (0, 0, 0)
        bpy.context.view_layer.update()

    clear()
    base = {lab: paw_world(arm, cage, lab) for lab, *_ in LEGS}

    # Move the PELVIS, not `root`.
    #
    # The IK targets are parented to `root` — that is the correct convention,
    # because `root` carries the whole character including its foot controls when
    # the character walks somewhere. Moving `root` therefore moves the targets
    # too, and the first version of this test did exactly that: it reported paw
    # drift precisely equal to the translation and looked like a total IK
    # failure, when in fact nothing had been asked to stay still.
    #
    # A planted foot is defined relative to the WORLD while the BODY moves, so
    # the body has to be moved by a torso control. Rotations are included as well
    # as translations: a pelvis that tips is the case a walk cycle actually hits.
    tests = [
        ("body-forward", {"pelvis": (0.0, 0.070, 0.0)}, {}),
        ("body-back", {"pelvis": (0.0, -0.070, 0.0)}, {}),
        ("body-down", {"pelvis": (0.0, 0.0, -0.075)}, {}),
        ("body-up", {"pelvis": (0.0, 0.0, 0.032)}, {}),
        ("body-side", {"pelvis": (0.055, 0.0, 0.0)}, {}),
        ("crouch", {"pelvis": (0.0, 0.0, -0.090)}, {}),
        ("pelvis-tip", {}, {"pelvis": (0.0, 9.0, 0.0)}),
        ("pelvis-yaw", {}, {"pelvis": (0.0, 0.0, 8.0)}),
    ]

    # A second set at the amplitudes ANIMATION actually uses. The block above is
    # deliberately extreme — a 90mm crouch on a 292mm leg — and drift there is
    # dominated by the chain running out of reach, which is a documented rig
    # characteristic rather than a solver failure. What decides whether a walk
    # looks weighted is drift at the amplitudes the walk uses: an 8mm bob and a
    # small lateral rock. Reporting only the extreme number would understate the
    # rig; reporting only the small one would flatter it. Both are printed.
    realistic = [
        ("walk-bob-down", {"pelvis": (0.0, 0.0, -0.008)}, {}),
        ("walk-bob-up", {"pelvis": (0.0, 0.0, 0.008)}, {}),
        ("walk-rock", {"pelvis": (0.012, 0.0, 0.0)}, {}),
        ("walk-advance", {"pelvis": (0.0, 0.018, 0.0)}, {}),
        ("walk-pelvis-rot", {}, {"pelvis": (0.0, 3.4, 0.0)}),
        ("idle-breathe", {"pelvis": (0.0, 0.0, -0.004)}, {}),
    ]

    worst = 0.0
    rows = []
    for name, moves, rots in tests:
        clear()
        for bone, loc in moves.items():
            arm.pose.bones[bone].location = Vector(loc)
        for bone, rot in rots.items():
            pb = arm.pose.bones[bone]
            pb.rotation_mode = "XYZ"
            pb.rotation_euler = [math.radians(a) for a in rot]
        bpy.context.view_layer.update()
        drifts = {}
        for lab, *_ in LEGS:
            now = paw_world(arm, cage, lab)
            if base[lab] is None or now is None:
                continue
            d = (now - base[lab]).length
            drifts[lab] = d
            worst = max(worst, d)
        rows.append((name, drifts))
        txt = "  ".join(f"{k}={v * 1000:.1f}mm" for k, v in drifts.items())
        print(f"[rig] planted {name:14} {txt}")

    worst_real = 0.0
    for name, moves, rots in realistic:
        clear()
        for bone, loc in moves.items():
            arm.pose.bones[bone].location = Vector(loc)
        for bone, rot in rots.items():
            pb = arm.pose.bones[bone]
            pb.rotation_mode = "XYZ"
            pb.rotation_euler = [math.radians(a) for a in rot]
        bpy.context.view_layer.update()
        drifts = {}
        for lab, *_ in LEGS:
            now = paw_world(arm, cage, lab)
            if base[lab] is None or now is None:
                continue
            d = (now - base[lab]).length
            drifts[lab] = d
            worst_real = max(worst_real, d)
        txt = "  ".join(f"{k}={v * 1000:.2f}mm" for k, v in drifts.items())
        print(f"[rig] anim    {name:16} {txt}")

    clear()
    bpy.ops.object.mode_set(mode="OBJECT")
    return worst, worst_real, rows


# ── render ──────────────────────────────────────────────────────────────────
def setup_render(cage):
    sc = bpy.context.scene
    sc.render.engine = "BLENDER_EEVEE"
    sc.render.resolution_x, sc.render.resolution_y = 620, 620
    sc.view_settings.view_transform = "Standard"
    os.makedirs(PREVIEW_DIR, exist_ok=True)

    w = bpy.data.worlds.new("RigWorld")
    w.use_nodes = True
    w.node_tree.nodes["Background"].inputs[0].default_value = (0.09, 0.10, 0.12, 1)
    sc.world = w

    surf = bpy.data.materials.new("RigSurf")
    surf.use_nodes = True
    b = surf.node_tree.nodes.get("Principled BSDF")
    b.inputs["Base Color"].default_value = (0.66, 0.63, 0.58, 1)
    b.inputs["Roughness"].default_value = 0.66
    cage.data.materials.clear()
    cage.data.materials.append(surf)

    for name, loc, energy in (("K", (2.3, -2.1, 2.5), 240), ("F", (-2.7, -1.3, 1.3), 85),
                              ("R", (-0.4, 2.9, 2.1), 110)):
        d = bpy.data.lights.new(name, "AREA")
        d.energy, d.size = energy, 6.0
        o = bpy.data.objects.new(name, d)
        o.location = loc
        o.rotation_euler = (Vector((0, 0, 0.5)) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
        sc.collection.objects.link(o)

    cd = bpy.data.cameras.new("RigCam")
    cd.lens = 62.0
    cam = bpy.data.objects.new("RigCam", cd)
    sc.collection.objects.link(cam)
    sc.camera = cam
    return cam


def shoot(cam, yaw, path, dist=2.9, target=(0.0, 0.02, 0.50), lens=62.0):
    cam.data.lens = lens
    t = Vector(target)
    a = math.radians(yaw)
    cam.location = (t.x + math.sin(a) * dist, t.y - math.cos(a) * dist, t.z + dist * 0.12)
    cam.rotation_euler = (t - Vector(cam.location)).to_track_quat("-Z", "Y").to_euler()
    bpy.context.scene.render.filepath = path
    bpy.ops.render.render(write_still=True)


def rig_proof_renders(arm, cage, cam):
    """The ten rig tests from the brief."""
    bpy.context.view_layer.objects.active = arm
    bpy.ops.object.mode_set(mode="POSE")

    def clear():
        for pb in arm.pose.bones:
            pb.rotation_mode = "XYZ"
            pb.rotation_euler = (0, 0, 0)
            pb.location = (0, 0, 0)

    tests = [
        ("01-stand", {}, {}, 90),
        ("02-crouch", {}, {"pelvis": (0.0, 0.0, -0.085)}, 90),
        ("03-raise-front-left", {"scapula_FL": (-20, 0, 0), "upper_front_FL": (-62, 0, -12),
                                 "forearm_FL": (-54, 0, 0)}, {}, 200),
        ("04-raise-front-right", {"scapula_FR": (-20, 0, 0), "upper_front_FR": (-62, 0, 12),
                                  "forearm_FR": (-54, 0, 0)}, {}, 160),
        ("05-head-turn", {"neck_01": (0, 0, 32), "head": (0, 0, 38)}, {}, 145),
        ("06-spine-bend", {"spine_01": (0, 0, 18), "spine_02": (0, 0, 20), "chest": (0, 0, 14)}, {}, 240),
        ("07-tail-range", {f"tail_{i:02d}": (0, 0, 26) for i in range(1, 7)}, {}, 235),
        ("08-jaw-open", {"jaw": (34, 0, 0)}, {}, 180),
        ("09-three-leg-support", {"scapula_FR": (-16, 0, 0), "upper_front_FR": (-58, 0, 14),
                                  "forearm_FR": (-48, 0, 0), "chest": (0, 0, -7),
                                  "pelvis": (0, 0, -4)}, {}, 200),
        ("10-body-shift", {}, {"pelvis": (0.055, 0.045, -0.030)}, 90),
    ]
    for name, rots, locs, yaw in tests:
        clear()
        for bone, rot in rots.items():
            pb = arm.pose.bones.get(bone)
            if pb is None:
                raise SystemExit(f"[rig] no bone {bone!r}")
            pb.rotation_mode = "XYZ"
            pb.rotation_euler = [math.radians(a) for a in rot]
        for bone, loc in locs.items():
            arm.pose.bones[bone].location = Vector(loc)
        bpy.context.view_layer.update()
        lens = 92.0 if name == "08-jaw-open" else 62.0
        tgt = (0.0, 0.46, HEAD_Z - 0.02) if name == "08-jaw-open" else (0.0, 0.02, 0.50)
        dist = 0.95 if name == "08-jaw-open" else 2.9
        shoot(cam, yaw, os.path.join(PREVIEW_DIR, f"{name}.png"), dist, tgt, lens)

    clear()
    bpy.context.view_layer.update()
    bpy.ops.object.mode_set(mode="OBJECT")


def export(cage, arm):
    os.makedirs(os.path.dirname(GLB_OUT), exist_ok=True)
    bpy.ops.object.select_all(action="DESELECT")
    cage.select_set(True)
    arm.select_set(True)
    bpy.context.view_layer.objects.active = arm
    bpy.ops.export_scene.gltf(
        filepath=GLB_OUT, export_format="GLB", use_selection=True,
        export_apply=False, export_cameras=False, export_lights=False,
        export_yup=True, export_materials="EXPORT", export_skins=True,
        export_animations=False,
        # Deform bones only. Without this the eight IK targets and pole targets
        # ship as skin joints — they never deform anything, so every one is a
        # wasted joint matrix at runtime and a control widget leaking into the
        # production asset. The brief asks for the control rig and the deform
        # skeleton to stay separated; this is where that separation is enforced.
        export_def_bones=True,
        export_bake_animation=True,
    )
    return os.path.getsize(GLB_OUT)


def main():
    cage = bpy.data.objects.get("LionCage")
    if cage is None:
        raise SystemExit("LionCage not found — run cage_lion.py first")

    arm = build_armature()
    skin(cage, arm)
    add_ik(arm)

    head = reach_headroom(arm)
    worst, worst_real, _rows = planted_paw_proof(arm, cage)
    cam = setup_render(cage)
    rig_proof_renders(arm, cage, cam)

    bpy.ops.wm.save_as_mainfile(filepath=BLEND_OUT)
    size = export(cage, arm)

    deform = [b.name for b in arm.data.bones if b.use_deform]
    print("\n===LION_RIG_CAGE===")
    print(f"BLEND={BLEND_OUT}")
    print(f"GLB={GLB_OUT}")
    print(f"KB={size / 1024:.1f}")
    print(f"BONES_TOTAL={len(arm.data.bones)} BONES_DEFORM={len(deform)}")
    print(f"IK_CHAINS={sum(len([c for c in pb.constraints if c.type == 'IK']) for pb in arm.pose.bones)}")
    print(f"VERTEX_GROUPS={len(cage.vertex_groups)}")
    print(f"REACH_HEADROOM_MM=" + " ".join(f"{k}:{v * 1000:.1f}" for k, v in head.items()))
    print(f"PLANTED_PAW_WORST_EXTREME_MM={worst * 1000:.2f}")
    print(f"PLANTED_PAW_WORST_ANIMATION_MM={worst_real * 1000:.3f}")
    print("===LION_RIG_CAGE_END===")


if __name__ == "__main__":
    main()
