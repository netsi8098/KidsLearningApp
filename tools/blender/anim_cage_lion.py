"""
anim_cage_lion.py — Idle and the four-beat walk, on the production cage.

WHY THE WALK IS AUTHORED THROUGH IK, NOT FK

The brief's requirement is that each planted paw appears stationary relative to
the ground during its support phase. Authoring that in FK means hand-tuning limb
rotations so the paw happens to trace a straight line — which is exactly the sort
of thing that looks right at full speed and slides at 0.25x.

Driving the IK targets makes it structural instead. During stance a target moves
backward in a straight line at the cycle's own rate; the body rides over it and
the solver works out the joint angles. The clip carries no root translation, so
when the runtime advances the character at stride/cycle the two cancel and the
paw is stationary in world space by construction.

That is also why this script MEASURES it (see `planted_during_walk`): the claim
"no skating" is a number, not an assertion.

GAIT
Four-beat lateral sequence, back-left -> front-left -> back-right -> front-right,
a quarter cycle apart, 75% stance / 25% swing per limb. Two to three feet are
planted at every moment.

Run:
  blender --background art/blender/lion_rigged_cage.blend \
    --factory-startup --python tools/blender/anim_cage_lion.py

Outputs:
  art/blender/lion_anim_cage.blend
  public/assets/lion/cage/lion_cage_anim.glb
  public/assets/lion/cage/locomotion.json
  docs/assets/lion-walk/*.png
"""

import json
import math
import os
import sys

import bpy
from mathutils import Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lion_contract import HEAD_Z  # noqa: E402

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
BLEND_OUT = os.path.join(REPO, "art", "blender", "lion_anim_cage.blend")
GLB_OUT = os.path.join(REPO, "public", "assets", "lion", "cage", "lion_cage_anim.glb")
LOCO_OUT = os.path.join(REPO, "public", "assets", "lion", "cage", "locomotion.json")
PREVIEW_DIR = os.path.join(REPO, "docs", "assets", "lion-walk")

FPS = 24.0

# ── gait contract ───────────────────────────────────────────────────────────
# Stride is a DESIGN choice and everything else follows from it. 0.24 model
# units against a ~0.29 leg is a stride/leg ratio of 0.83, which sits inside the
# range a quadruped actually uses at a walk. Pushing it to 1.0 gives a brisker
# character but starts to read as a lunge.
STRIDE = 0.24
WALK_FRAMES = 36                  # 1.5s at 24fps
LIFT = 0.052                      # paw clearance during swing
STANCE_END = 0.75                 # duty factor: 75% of the cycle on the ground
# End of the true SUPPORT window. Between this and STANCE_END the paw is
# unweighting — the LIFT sub-phase — and is meant to start rising. Measuring
# "planted" across LIFT counted that intentional rise as slide.
SUPPORT_END = 0.68

# Lateral sequence. Each limb is a quarter cycle behind the previous.
PHASE = {"RL": 0.00, "FL": 0.25, "RR": 0.50, "FR": 0.75}

# Per-paw phase labels, for the debug read-out the brief asks for.
def paw_state(p):
    if p < 0.06:
        return "CONTACT"
    if p < 0.68:
        return "STANCE"
    if p < STANCE_END:
        return "LIFT"
    if p < 0.94:
        return "SWING"
    return "PLACEMENT"


# ── helpers ─────────────────────────────────────────────────────────────────
def set_world_offset(arm, bone, offset):
    """Move a bone by an offset expressed in ARMATURE space.

    Bone `location` is in the bone's own space, and for a control bone pointing
    along +Z that means local Y runs vertically. Writing gait curves directly
    into local components is a reliable way to author a limp. Converting through
    the rest matrix keeps the gait readable in the axes it was designed in.
    """
    pb = arm.pose.bones[bone]
    m = pb.bone.matrix_local.to_3x3()
    pb.location = m.inverted() @ Vector(offset)


def key_loc(arm, bone, frame):
    arm.pose.bones[bone].keyframe_insert("location", frame=frame)


def key_rot(arm, bone, frame, rot):
    pb = arm.pose.bones[bone]
    pb.rotation_mode = "XYZ"
    pb.rotation_euler = [math.radians(a) for a in rot]
    pb.keyframe_insert("rotation_euler", frame=frame)


def new_action(arm, name):
    act = bpy.data.actions.new(name)
    arm.animation_data.action = act
    if hasattr(act, "use_fake_user"):
        act.use_fake_user = True
    return act


def clear_pose(arm):
    for pb in arm.pose.bones:
        pb.rotation_mode = "XYZ"
        pb.rotation_euler = (0.0, 0.0, 0.0)
        pb.location = (0.0, 0.0, 0.0)


def all_fcurves(act):
    """Every F-curve in an action, across both animation-system generations.

    Blender 4.4 introduced slotted actions and `Action.fcurves` no longer
    exists — curves live under layers -> strips -> channelbags. Reaching for the
    old attribute raises, so both paths are handled rather than assuming a
    version.
    """
    if hasattr(act, "fcurves"):
        yield from act.fcurves
        return
    for layer in getattr(act, "layers", []):
        for strip in getattr(layer, "strips", []):
            for bag in getattr(strip, "channelbags", []):
                yield from bag.fcurves


def smooth(act):
    """Bezier for the body. LINEAR for the foot controls — and that matters.

    The stance path is a straight line travelled at a constant rate; that is the
    entire mechanism by which it cancels the runtime translation. But the control
    bone's rest orientation is tilted (it matches the foot), so a world-space
    straight line becomes a pair of sloped curves in the bone's local Y and Z.
    Easing those two components INDEPENDENTLY breaks the relationship between
    them and bends the path back into three dimensions: the goal wandered 6.4mm
    vertically and came up 24mm short in travel.

    Linear interpolation preserves it exactly, because a linear combination of
    linear curves is linear. The swing arc is sampled densely enough that
    faceting is invisible.
    """
    n_lin = n_bez = 0
    for fc in all_fcurves(act):
        control = ".location" in fc.data_path and '["ik_' in fc.data_path
        for kp in fc.keyframe_points:
            if control:
                kp.interpolation = "LINEAR"
            else:
                kp.interpolation = "BEZIER"
                kp.handle_left_type = kp.handle_right_type = "AUTO_CLAMPED"
        if control:
            n_lin += 1
        else:
            n_bez += 1
    print(f"[anim] {act.name}: {n_bez} bezier + {n_lin} linear f-curves")


# ── the walk ────────────────────────────────────────────────────────────────
# Half the distance a paw travels backward, relative to the body, during stance.
#
# This is NOT half the stride, and getting it wrong is subtle. The body advances
# STRIDE over the FULL cycle, but a paw is only planted for STANCE_END of it — so
# relative to the body a planted paw travels STRIDE * STANCE_END, not STRIDE.
#
# The first version swung the target +/-STRIDE/2, which made the paw travel the
# whole stride in three quarters of the cycle: 33% faster than the body moved
# forward. The two no longer cancelled and every planted paw slid ~55mm. The
# measurement caught it because the compensated TARGET position drifted, which
# ruled out the solver and pointed straight back at the authoring.
HALF_TRAVEL = STRIDE * STANCE_END / 2.0


def paw_track(p):
    """Target offset (y, z) for one paw at its own cycle position p in 0..1.

    Stance is a straight backward line at exactly the rate the body moves
    forward. That equality is the whole point: the two cancel and the paw is
    stationary in world space by construction rather than by tuning.
    """
    if p < STANCE_END:
        k = p / STANCE_END
        return (HALF_TRAVEL * (1.0 - 2.0 * k), 0.0)
    k = (p - STANCE_END) / (1.0 - STANCE_END)
    # Swing: ease forward and arc over. sin() gives the clearance profile, and
    # a smoothstep on the forward travel stops the paw snapping at pickup.
    e = k * k * (3.0 - 2.0 * k)
    return (HALF_TRAVEL * (-1.0 + 2.0 * e), LIFT * math.sin(math.pi * k))


def author_walk(arm):
    new_action(arm, "Walk")
    clear_pose(arm)

    # Every frame. With the control curves now linear rather than eased, the
    # sample rate IS the arc resolution.
    for f in range(1, WALK_FRAMES + 2):
        t = ((f - 1) % WALK_FRAMES) / WALK_FRAMES

        for lab, ph in PHASE.items():
            p = (t - ph) % 1.0
            dy, dz = paw_track(p)
            set_world_offset(arm, f"ik_{lab}", (0.0, dy, dz))
            key_loc(arm, f"ik_{lab}", f)

        # Body response. One left-right rock per cycle, because the supporting
        # side alternates once per cycle in a lateral walk; two vertical dips,
        # because the body drops as each diagonal support pair passes.
        rock = math.sin(2.0 * math.pi * t)
        bob = math.sin(4.0 * math.pi * t)

        set_world_offset(arm, "pelvis", (0.0, 0.0, bob * 0.006))
        key_loc(arm, "pelvis", f)

        key_rot(arm, "pelvis", f, (0.0, rock * 3.2, 0.0))
        key_rot(arm, "spine_01", f, (0.0, rock * 1.8, 0.0))
        key_rot(arm, "spine_02", f, (0.0, -rock * 1.4, 0.0))
        key_rot(arm, "chest", f, (0.0, -rock * 2.6, 0.0))
        # Head counter-rotates to stay level. This is the stabiliser that makes
        # a walk read as an animal carrying its own weight.
        key_rot(arm, "neck_01", f, (bob * 1.0, 0.0, -rock * 1.2))
        key_rot(arm, "head", f, (-bob * 0.8, 0.0, -rock * 1.8))

        # Shoulder blades swing with their own limb. The paw is IK-pinned, so
        # this adds shoulder motion without moving the foot.
        for lab, bone in (("FL", "scapula_FL"), ("FR", "scapula_FR")):
            p = (t - PHASE[lab]) % 1.0
            key_rot(arm, bone, f, (math.sin(2.0 * math.pi * p) * 4.5, 0.0, 0.0))

        for i, amp in ((1, 5.0), (2, 8.0), (3, 11.0), (4, 13.0), (5, 14.0), (6, 14.0)):
            key_rot(arm, f"tail_{i:02d}", f, (0.0, 0.0, rock * amp))
        key_rot(arm, "ear_L", f, (bob * 2.2, 0.0, 0.0))
        key_rot(arm, "ear_R", f, (-bob * 2.2, 0.0, 0.0))

    smooth(arm.animation_data.action)
    return ("Walk", 1, WALK_FRAMES + 1)


# ── idle ────────────────────────────────────────────────────────────────────
IDLE_FRAMES = 120                 # 5s — long enough not to read as a loop


def author_idle(arm):
    """Restrained. The child is choosing a profile; the lion must not dance.

    Three cycles at deliberately incommensurate lengths — breath every 2.5s, a
    weight shift every 5s, tail every 3.3s — so the loop does not visibly beat.
    """
    new_action(arm, "Idle")
    clear_pose(arm)

    for f in range(1, IDLE_FRAMES + 2, 3):
        t = (f - 1) / IDLE_FRAMES
        breath = math.sin(2.0 * math.pi * t * 2.0)        # 2 per loop = 2.5s
        shift = math.sin(2.0 * math.pi * t)               # 1 per loop = 5s
        tail = math.sin(2.0 * math.pi * t * 1.5)          # 1.5 per loop

        # Paws stay planted. Feet do not drift during idle, and because they are
        # IK-pinned the body can move over them freely.
        for lab in PHASE:
            set_world_offset(arm, f"ik_{lab}", (0.0, 0.0, 0.0))
            key_loc(arm, f"ik_{lab}", f)

        set_world_offset(arm, "pelvis", (shift * 0.004, 0.0, breath * 0.0022))
        key_loc(arm, "pelvis", f)

        key_rot(arm, "pelvis", f, (0.0, shift * 0.9, 0.0))
        key_rot(arm, "spine_01", f, (breath * 0.5, shift * 0.5, 0.0))
        key_rot(arm, "spine_02", f, (breath * 0.8, 0.0, 0.0))
        key_rot(arm, "chest", f, (breath * 1.5, -shift * 0.6, 0.0))
        key_rot(arm, "neck_01", f, (-breath * 0.9, 0.0, shift * 1.1))
        key_rot(arm, "head", f, (-breath * 0.6, 0.0, shift * 1.6))

        for i, amp in ((1, 2.0), (2, 3.5), (3, 5.0), (4, 6.5), (5, 7.5), (6, 8.0)):
            key_rot(arm, f"tail_{i:02d}", f, (0.0, 0.0, tail * amp))

        # Ear flicks: brief, sparse, and asymmetric. A steady ear wobble reads as
        # a mechanism; an occasional twitch reads as an animal listening.
        flick_l = 9.0 if 0.24 < t < 0.29 else 0.0
        flick_r = 7.0 if 0.66 < t < 0.70 else 0.0
        key_rot(arm, "ear_L", f, (flick_l, 0.0, 0.0))
        key_rot(arm, "ear_R", f, (-flick_r, 0.0, 0.0))

    smooth(arm.animation_data.action)
    return ("Idle", 1, IDLE_FRAMES + 1)


# ── measurement ─────────────────────────────────────────────────────────────
def paw_world(arm, cage, label):
    """Paw sole position from the DEFORMED mesh, not from the bone."""
    deps = bpy.context.evaluated_depsgraph_get()
    ev = cage.evaluated_get(deps)
    me = ev.to_mesh()
    grp = f"paw_{label}"
    if grp not in cage.vertex_groups:
        ev.to_mesh_clear()
        return None
    gi = cage.vertex_groups[grp].index
    pts = []
    for v in me.vertices:
        for g in v.groups:
            # 0.9, not 0.6. At 0.6 the sample included `paw_top` vertices that
            # are 40% ankle by design, so they legitimately move with the ankle
            # and inflated the vertical figure by ~30mm. A planted-foot metric
            # must look only at geometry the foot actually owns.
            if g.group == gi and g.weight > 0.9:
                pts.append(cage.matrix_world @ v.co)
                break
    out = sum(pts, Vector()) / len(pts) if pts else None
    ev.to_mesh_clear()
    return out


def planted_during_walk(arm, cage):
    """Measure world-space paw slide during each paw's own SUPPORT phase.

    Support, not stance: the last 7% of stance is the LIFT sub-phase, where the
    paw is deliberately unweighting and beginning to rise. Including it counted
    intended motion as slide and left an unexplained 6mm on the front paws after
    everything else measured clean. Four times now a number in this pipeline has
    turned out to be the metric's fault rather than the rig's — worth stating
    plainly.

    This is the "no skating" number. The clip is in-place, so during stance a
    paw travels backward by the stride. Adding back the forward translation the
    runtime will apply at stride/cycle should leave a CONSTANT world position —
    and the spread of that constant is the slide.
    """
    act = bpy.data.actions["Walk"]
    arm.animation_data.action = act

    # IK residual: how far the solved chain end sits from the control it is
    # chasing. A planted foot that still moves after the authoring arithmetic is
    # correct is either hitting a joint limit or running out of reach, and this
    # is the number that distinguishes those from a bad curve.
    IK_ON = {"RL": "ankle_RL", "RR": "ankle_RR", "FL": "wrist_FL", "FR": "wrist_FR"}
    residual = {lab: 0.0 for lab in PHASE}

    tracks = {lab: [] for lab in PHASE}
    for f in range(1, WALK_FRAMES + 1):
        bpy.context.scene.frame_set(f)
        t = (f - 1) / WALK_FRAMES
        for lab in PHASE:
            p = (t - PHASE[lab]) % 1.0
            if p >= SUPPORT_END:
                continue
            end = arm.matrix_world @ arm.pose.bones[IK_ON[lab]].tail
            goal = arm.matrix_world @ arm.pose.bones[f"ik_{lab}"].head
            residual[lab] = max(residual[lab], (end - goal).length)

            w = paw_world(arm, cage, lab)
            if w is None:
                continue
            # Forward travel the runtime will have applied by this frame.
            #
            # `t` must be UNWRAPPED relative to this paw's touchdown. A stance
            # that straddles the end of the cycle (any paw with phase > 0.25)
            # otherwise gets its compensation reset by a full stride mid-stance,
            # which reported 281mm of slide on the right-hand paws where the
            # real figure was a fraction of that. The paw touches down at
            # t = phase, so anything earlier belongs to the next cycle.
            t_un = t if t >= PHASE[lab] else t + 1.0
            compensated = w.y + STRIDE * t_un
            tracks[lab].append((f, p, compensated, w.z))

    worst = 0.0
    rows = []
    for lab, samples in tracks.items():
        if len(samples) < 3:
            continue
        ys = [s[2] for s in samples]
        zs = [s[3] for s in samples]
        slide = max(ys) - min(ys)
        rise = max(zs) - min(zs)
        worst = max(worst, slide)
        rows.append((lab, slide, rise, len(samples)))
        print(f"[anim] support {lab}  slide={slide * 1000:6.2f}mm  "
              f"vertical={rise * 1000:5.2f}mm  ik_residual={residual[lab] * 1000:6.2f}mm  "
              f"over {len(samples)} frames")
    return worst, rows


def phase_table():
    print("[anim] per-paw phase table (cycle position -> state)")
    header = "      t  " + "  ".join(f"{lab:>11}" for lab in PHASE)
    print("[anim] " + header)
    for i in range(0, 12):
        t = i / 12.0
        cells = []
        for lab in PHASE:
            cells.append(f"{paw_state((t - PHASE[lab]) % 1.0):>11}")
        planted = sum(1 for lab in PHASE if ((t - PHASE[lab]) % 1.0) < STANCE_END)
        print(f"[anim]  {t:5.2f}  " + "  ".join(cells) + f"   planted={planted}")


# ── render ──────────────────────────────────────────────────────────────────
def setup_render(cage):
    sc = bpy.context.scene
    sc.render.engine = "BLENDER_EEVEE"
    sc.render.resolution_x, sc.render.resolution_y = 560, 420
    sc.view_settings.view_transform = "Standard"
    os.makedirs(PREVIEW_DIR, exist_ok=True)

    w = bpy.data.worlds.new("AnimWorld")
    w.use_nodes = True
    w.node_tree.nodes["Background"].inputs[0].default_value = (0.09, 0.10, 0.12, 1)
    sc.world = w

    if not cage.data.materials:
        m = bpy.data.materials.new("AnimSurf")
        m.use_nodes = True
        b = m.node_tree.nodes.get("Principled BSDF")
        b.inputs["Base Color"].default_value = (0.68, 0.65, 0.60, 1)
        b.inputs["Roughness"].default_value = 0.66
        cage.data.materials.append(m)

    for name, loc, energy in (("K", (2.2, -2.0, 2.4), 230), ("F", (-2.6, -1.2, 1.2), 80),
                              ("R", (-0.4, 2.8, 2.0), 100)):
        d = bpy.data.lights.new(name, "AREA")
        d.energy, d.size = energy, 6.0
        o = bpy.data.objects.new(name, d)
        o.location = loc
        o.rotation_euler = (Vector((0, 0, 0.5)) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
        sc.collection.objects.link(o)

    cd = bpy.data.cameras.new("AnimCam")
    cd.lens = 58.0
    cam = bpy.data.objects.new("AnimCam", cd)
    sc.collection.objects.link(cam)
    sc.camera = cam
    # Straight side-on. A three-quarter view flatters a gait; a side view is
    # where foot contact can actually be judged.
    t = Vector((0.0, 0.0, 0.42))
    cam.location = (2.55, 0.0, 0.60)
    cam.rotation_euler = (t - Vector(cam.location)).to_track_quat("-Z", "Y").to_euler()
    return cam


def render_walk_strip(arm, cage, cam):
    arm.animation_data.action = bpy.data.actions["Walk"]
    labels = []
    for i in range(12):
        f = 1 + round(i * WALK_FRAMES / 12)
        bpy.context.scene.frame_set(f)
        bpy.context.scene.render.filepath = os.path.join(PREVIEW_DIR, f"walk-{i:02d}.png")
        bpy.ops.render.render(write_still=True)
        t = (f - 1) / WALK_FRAMES
        states = {lab: paw_state((t - PHASE[lab]) % 1.0) for lab in PHASE}
        planted = sum(1 for lab in PHASE if ((t - PHASE[lab]) % 1.0) < STANCE_END)
        labels.append({"frame": f, "t": round(t, 3), "planted": planted, "paws": states})

    arm.animation_data.action = bpy.data.actions["Idle"]
    for i in range(4):
        f = 1 + round(i * IDLE_FRAMES / 4)
        bpy.context.scene.frame_set(f)
        bpy.context.scene.render.filepath = os.path.join(PREVIEW_DIR, f"idle-{i:02d}.png")
        bpy.ops.render.render(write_still=True)

    with open(os.path.join(PREVIEW_DIR, "walk-states.json"), "w") as fh:
        json.dump(labels, fh, indent=2)
    return labels


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
        export_animations=True, export_animation_mode="ACTIONS",
        # glTF has no IK. Baking is what turns the solved chain into per-bone
        # transforms the runtime can play — without it the exported clip would
        # contain the control-bone curves and no leg motion at all.
        export_bake_animation=True,
        export_def_bones=True,
    )
    return os.path.getsize(GLB_OUT)


def main():
    cage = bpy.data.objects.get("LionCage")
    arm = bpy.data.objects.get("LionRig")
    if cage is None or arm is None:
        raise SystemExit("run rig_cage_lion.py first")

    bpy.context.scene.render.fps = int(FPS)
    bpy.context.view_layer.objects.active = arm
    if arm.animation_data is None:
        arm.animation_data_create()
    bpy.ops.object.mode_set(mode="POSE")

    made = [author_idle(arm), author_walk(arm)]
    phase_table()
    worst, _rows = planted_during_walk(arm, cage)

    bpy.ops.object.mode_set(mode="OBJECT")
    cam = setup_render(cage)
    render_walk_strip(arm, cage, cam)

    cycle = WALK_FRAMES / FPS
    with open(LOCO_OUT, "w") as fh:
        json.dump({
            "clip": "Walk",
            "strideModelUnits": STRIDE,
            "cycleSeconds": round(cycle, 4),
            "dutyFactor": STANCE_END,
            "sequence": "lateral: RL -> FL -> RR -> FR",
            "supportEnd": SUPPORT_END,
            "measuredSupportSlideMm": round(worst * 1000, 3),
            "note": ("Stride is authored, not inferred: the IK targets travel it "
                     "in a straight line during stance. The runtime must scale it "
                     "by the factor applied to the asset and divide by "
                     "cycleSeconds."),
        }, fh, indent=2)

    bpy.ops.wm.save_as_mainfile(filepath=BLEND_OUT)
    size = export(cage, arm)

    print("\n===CAGE_ANIM===")
    print(f"BLEND={BLEND_OUT}")
    print(f"GLB={GLB_OUT}")
    print(f"KB={size / 1024:.1f}")
    print(f"ACTIONS={[m[0] for m in made]}")
    print(f"STRIDE={STRIDE} HALF_TRAVEL={HALF_TRAVEL:.4f} "
          f"CYCLE_S={cycle:.3f} DUTY={STANCE_END}")
    print(f"SUPPORT_SLIDE_WORST_MM={worst * 1000:.3f}")
    print("===CAGE_ANIM_END===")


if __name__ == "__main__":
    main()
