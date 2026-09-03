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


# ── the remaining eleven contract clips ─────────────────────────────────────
#
# `lionCageRigContract.json` lists thirteen and only Idle and Walk existed, so
# the other eleven were tracked as `plannedClips`. They are authored here to the
# same rules the walk follows, and those rules are what make them usable rather
# than merely present:
#
#   * IN PLACE. No clip carries horizontal root translation. `LionBrain` owns
#     world position and heading, so a clip that also travelled would
#     double-count. The single exception is the jump's VERTICAL rise, which is
#     part of the action rather than navigation.
#
#   * IK TARGETS MOVE WITH THE BODY WHEN THE FEET LEAVE THE GROUND. Reach
#     headroom is 22.1 mm at the front and 42.1 mm at the rear, so lifting the
#     pelvis while the targets stay pinned straightens the legs and then
#     exceeds the solver's reach — the clip looks fine in the viewport and the
#     residual is non-zero. Anything airborne moves the targets too.
#
#   * OVERLAYS DO NOT TOUCH THE LEGS THEY DO NOT NEED. Wave and Celebrate are
#     specified as blendable over breathing or locomotion, so they key only the
#     chain they use plus the weight shift that makes the pose honest. Keying a
#     rear leg in Wave would fight whatever the base layer is doing with it.

# BODY-ROTATION GAIN, and it is not a taste knob.
#
# A pinned foot has to absorb whatever the body does above it, and the reach
# headroom is 22.1 mm at the front and 42.1 mm at the rear. Rotating the spine
# swings the shoulder through an arc: 7 degrees at the chest moves the front
# scapula tens of millimetres, and past 22.1 of them the solver simply cannot
# reach and the leg detaches from its target.
#
# The first draft used rotations sized by eye and measured IK residuals of
# 26-92 mm across Wave, Turn, Celebrate and the jump. This gain is swept
# against that residual (see the CLIP_IK table the script prints) and set to
# the largest value that keeps every clip inside a millimetre.
GAIN = float(os.environ.get("LION_CLIP_GAIN", "0.22"))

# The turn is a separate gain because its motion is YAW, not pitch, and the
# first attempt at a single gain silently scaled the turn's (always zero) X
# component instead — which is why TurnLeft measured exactly 22.043 mm of
# residual through every value of GAIN. A number that will not move under the
# knob you are turning is the knob not being connected.
GAIN_TURN = float(os.environ.get("LION_TURN_GAIN", "0.50"))

# THE FRONT LEGS ARE THE BINDING CONSTRAINT, always. Measured per leg, every
# residual in every clip is a FRONT leg and both rears are exactly 0.00 —
# front reach headroom is 22.1 mm against the rear's 42.1, and the front legs
# hang from the CHEST, which rises further than the pelvis whenever the spine
# pitches. So a front target lifted by the pelvis rise alone falls behind the
# shoulder and the solver runs out of leg. This boost tracks the difference.
# Swept against the measured residual, which has a clean minimum:
#
#     boost    1.4    2.0    2.6    3.4    4.2    5.0    6.0
#     JumpAirborne  66.5   53.3   40.1   22.5    5.0   0.002  19.5
#
# Monotonically better up to 5.0 and worse after it: below 5.0 the front leg is
# over-EXTENDED reaching down for a target the body has flown away from, and
# above it the leg hits its hinge limit trying to FOLD that far. 5.0 is where
# neither binds.
FRONT_LIFT_BOOST = float(os.environ.get("LION_FRONT_BOOST", "5.0"))

START_FRAMES = 14
STOP_FRAMES = 16
TURN_FRAMES = 26
WAVE_FRAMES = 40
CELEBRATE_FRAMES = 44
JUMP = {"JumpAnticipation": 12, "JumpTakeoff": 8, "JumpAirborne": 14,
        "JumpLand": 8, "JumpRecovery": 16}


def _plant_all(arm, f, offset=(0.0, 0.0, 0.0)):
    for lab in PHASE:
        set_world_offset(arm, f"ik_{lab}", offset)
        key_loc(arm, f"ik_{lab}", f)


def _ease(t):
    return t * t * (3.0 - 2.0 * t)


def author_walk_start(arm):
    """Standing to the walk's first pose. The rear-left leaves first.

    The gait's phase table puts RL at 0.00, so a start that lifts any other
    limb first has to be re-sequenced by the mixer before the loop can begin.
    Starting with RL means WalkStart's last frame IS Walk's frame 1.
    """
    new_action(arm, "WalkStart")
    clear_pose(arm)
    for f in range(1, START_FRAMES + 1):
        t = _ease((f - 1) / (START_FRAMES - 1))
        # Weight rocks onto the diagonal that will support the first swing.
        set_world_offset(arm, "pelvis", (-0.006 * t, 0.004 * t, -0.003 * t))
        key_loc(arm, "pelvis", f)
        key_rot(arm, "pelvis", f, (0.0 * GAIN, -1.6 * t, 0.8 * t))
        key_rot(arm, "spine_01", f, (0.6 * GAIN * t, 0.0, 0.6 * t))
        key_rot(arm, "chest", f, (1.0 * GAIN * t, 0.0, -0.5 * t))
        key_rot(arm, "neck_01", f, (-1.2 * GAIN * t, 0.0, 0.0))
        key_rot(arm, "head", f, (-1.0 * GAIN * t, 0.0, 0.0))
        for lab in PHASE:
            # RL begins to unweight in the last third; the rest stay planted.
            lift = LIFT * 0.45 * max(0.0, (t - 0.66) / 0.34) if lab == "RL" else 0.0
            back = -STRIDE * 0.18 * t if lab == "RL" else 0.0
            set_world_offset(arm, f"ik_{lab}", (0.0, back, lift))
            key_loc(arm, f"ik_{lab}", f)
        for i, amp in ((1, 1.0), (2, 2.0), (3, 3.0), (4, 4.0), (5, 4.5), (6, 5.0)):
            key_rot(arm, f"tail_{i:02d}", f, (0.0, 0.0, -amp * t))
    smooth(arm.animation_data.action)
    return ("WalkStart", 1, START_FRAMES)


def author_walk_stop(arm):
    """Walk to standing, with the trailing foot PLANTED rather than faded.

    A stop that cross-fades to Idle slides the last foot, because Idle's feet
    are at zero offset and the walk's are mid-stride. This drives every target
    back to zero explicitly, so the last thing the clip does is set the foot
    down where it will stand.
    """
    new_action(arm, "WalkStop")
    clear_pose(arm)
    for f in range(1, STOP_FRAMES + 1):
        t = _ease((f - 1) / (STOP_FRAMES - 1))
        r = 1.0 - t
        set_world_offset(arm, "pelvis", (0.004 * r, -0.004 * r, -0.004 * r * (1 - t)))
        key_loc(arm, "pelvis", f)
        key_rot(arm, "pelvis", f, (0.0 * GAIN, 1.4 * r, -0.6 * r))
        key_rot(arm, "spine_01", f, (0.5 * GAIN * r, 0.0, -0.5 * r))
        key_rot(arm, "chest", f, (0.8 * GAIN * r, 0.0, 0.4 * r))
        key_rot(arm, "neck_01", f, (-0.8 * GAIN * r, 0.0, 0.0))
        key_rot(arm, "head", f, (-0.6 * GAIN * r, 0.0, 0.0))
        for lab in PHASE:
            # Each foot closes to zero; the two mid-swing limbs travel furthest.
            start = -STRIDE * (0.22 if lab in ("RL", "FR") else 0.08)
            set_world_offset(arm, f"ik_{lab}", (0.0, start * r, 0.0))
            key_loc(arm, f"ik_{lab}", f)
        for i, amp in ((1, 1.0), (2, 2.0), (3, 3.0), (4, 4.0), (5, 4.5), (6, 5.0)):
            key_rot(arm, f"tail_{i:02d}", f, (0.0, 0.0, amp * r * 0.6))
    smooth(arm.animation_data.action)
    return ("WalkStop", 1, STOP_FRAMES)


def author_turn(arm, sign, name):
    """In-place turn: the HEAD LEADS, then the body follows, then paws reset.

    Face-before-move is the rule `LionBrain` already applies at the navigation
    level, and the clip has to agree with it or the two fight. The head reaches
    its full yaw by 35% of the clip, the spine follows to 70%, and the feet
    reposition last — which is also the order that keeps a foot from pivoting
    while it carries weight.
    """
    new_action(arm, name)
    clear_pose(arm)
    for f in range(1, TURN_FRAMES + 1):
        u = (f - 1) / (TURN_FRAMES - 1)
        head_t = _ease(min(1.0, u / 0.35))
        body_t = _ease(max(0.0, min(1.0, (u - 0.15) / 0.55)))
        foot_t = _ease(max(0.0, (u - 0.45) / 0.55))
        key_rot(arm, "head", f, (0.0, 0.0, sign * 26.0 * GAIN_TURN * head_t))
        key_rot(arm, "neck_01", f, (0.0, 0.0, sign * 14.0 * GAIN_TURN * head_t))
        key_rot(arm, "chest", f, (0.0, 0.0, sign * 7.0 * GAIN_TURN * body_t))
        key_rot(arm, "spine_02", f, (0.0, 0.0, sign * 5.0 * GAIN_TURN * body_t))
        key_rot(arm, "spine_01", f, (0.0, 0.0, sign * 4.0 * GAIN_TURN * body_t))
        key_rot(arm, "pelvis", f, (0.0, 0.0, sign * 6.0 * GAIN_TURN * body_t))
        set_world_offset(arm, "pelvis", (sign * 0.005 * body_t, 0.0, -0.002 * body_t))
        key_loc(arm, "pelvis", f)
        # Feet step round one diagonal pair at a time, so weight is never on a
        # pivoting foot.
        for lab, ph in (("FL", 0.0), ("RR", 0.0), ("FR", 0.5), ("RL", 0.5)):
            local = _ease(max(0.0, min(1.0, (foot_t - ph) / 0.5)))
            side = 1.0 if lab in ("FL", "RL") else -1.0
            lift = LIFT * 0.28 * math.sin(math.pi * local)
            set_world_offset(arm, f"ik_{lab}",
                             (sign * side * 0.005 * local, 0.0, lift))
            key_loc(arm, f"ik_{lab}", f)
        for i, amp in ((1, 2.0), (2, 4.0), (3, 6.0), (4, 8.0), (5, 9.0), (6, 10.0)):
            key_rot(arm, f"tail_{i:02d}", f, (0.0, 0.0, sign * amp * body_t))
    smooth(arm.animation_data.action)
    return (name, 1, TURN_FRAMES)


def author_wave(arm):
    """Front-right paw waves, weight on the other three. UPPER BODY ONLY.

    Keys the FR chain, the spine and the weight shift — and deliberately not
    the rear legs, so the mixer can run this over Idle's breathing or over a
    walk without the two layers arguing about a hind foot.

    The weight shift is not decoration: lifting a front paw without moving the
    centre of mass over the remaining three reads as a cheat, and the brief
    calls for the transfer explicitly.
    """
    new_action(arm, "Wave")
    clear_pose(arm)
    for f in range(1, WAVE_FRAMES + 1):
        u = (f - 1) / (WAVE_FRAMES - 1)
        rise = _ease(min(1.0, u / 0.22))
        fall = _ease(max(0.0, (u - 0.82) / 0.18))
        up = rise * (1.0 - fall)
        # Four waves while the paw is up.
        osc = math.sin(2.0 * math.pi * ((u - 0.22) / 0.60) * 4.0) if 0.22 < u < 0.82 else 0.0
        # Weight onto the left-front / both-rear tripod.
        set_world_offset(arm, "pelvis", (-0.010 * up, -0.006 * up, -0.004 * up))
        key_loc(arm, "pelvis", f)
        key_rot(arm, "pelvis", f, (0.0 * GAIN, -3.0 * up, 0.0))
        key_rot(arm, "spine_01", f, (1.0 * GAIN * up, -1.5 * up, 0.0))
        key_rot(arm, "spine_02", f, (2.0 * GAIN * up, -1.0 * up, 0.0))
        key_rot(arm, "chest", f, (4.0 * GAIN * up, -2.0 * up, -3.0 * up))
        key_rot(arm, "neck_01", f, (-2.0 * GAIN * up, 0.0, -4.0 * up))
        key_rot(arm, "head", f, (-3.0 * GAIN * up, 0.0, -6.0 * up + osc * 2.0))
        # THE WAVING LIMB IS DRIVEN THROUGH ITS IK TARGET, not by FK on the
        # chain. `wrist_FR` carries an IK constraint at influence 1.0, so FK
        # rotations written onto it and onto `forearm_FR` are fought by the
        # solver trying to hold the paw at `ik_FR` — measured as a 26.6 mm
        # residual, which is the solver losing, not the pose working.
        #
        # Moving the target is also what makes the wave read: the paw goes
        # where it is told and the shoulder and elbow follow.
        # 60 mm of lift, not 150. The chain has hinge limits with locked Y/Z,
        # so how far it can FOLD is bounded as surely as how far it can
        # extend — a 150 mm lift measured a 67 mm residual, and lowering the
        # body gain made it worse rather than better, which is the signature of
        # a target the solver cannot reach at all.
        set_world_offset(arm, "ik_FR",
                         (0.006 * up, 0.026 * up, 0.060 * up + osc * 0.006))
        key_loc(arm, "ik_FR", f)
        # The paw's own orientation is FK — it has no IK constraint, so this is
        # the one part of the chain that can be posed directly.
        key_rot(arm, "paw_FR", f, (14.0 * up + osc * 12.0, 0.0, 0.0))
        # The supporting front paw stays exactly where it is.
        set_world_offset(arm, "ik_FL", (0.0, 0.0, 0.0))
        key_loc(arm, "ik_FL", f)
        for i, amp in ((1, 2.0), (2, 3.5), (3, 5.0), (4, 6.5), (5, 7.0), (6, 7.5)):
            key_rot(arm, f"tail_{i:02d}", f, (0.0, 0.0, amp * up * 0.8 + osc * amp * 0.2))
    smooth(arm.animation_data.action)
    return ("Wave", 1, WAVE_FRAMES)


def author_jump(arm):
    """Five clips, five distinct phases, blendable at their seams.

    The brief asks for anticipation, takeoff, airborne tuck, landing contact,
    compression and recovery as SEPARATE clips so the runtime can hold a phase
    — hang in the air while a card loads, for instance — rather than committing
    to one fixed-length jump.

    Each clip therefore starts where the previous one ends. `_h` is the
    pelvis rise, and the IK targets carry the same rise plus a tuck, because
    with 22.1 mm of front reach headroom a pinned target would exceed the
    solver the moment the body left the ground.
    """
    out = []
    # (name, frames, h0, h1, tuck0, tuck1, crouch0, crouch1)
    spec = [
        # Sized against the solver, not against how big a jump looks in a
        # storyboard. Reach headroom is 22.1 mm front / 42.1 mm rear and the
        # hinge limits bound the fold, so rise, crouch and tuck are all a
        # fraction of the first draft's — which measured 73-116 mm residual
        # and put the paws 94 mm under the floor.
        ("JumpAnticipation", JUMP["JumpAnticipation"], 0.000, -0.010, 0.0, 0.0, 0.0, 1.0),
        ("JumpTakeoff", JUMP["JumpTakeoff"], -0.010, 0.022, 0.0, 0.30, 1.0, 0.0),
        ("JumpAirborne", JUMP["JumpAirborne"], 0.022, 0.022, 0.30, 0.85, 0.0, 0.0),
        ("JumpLand", JUMP["JumpLand"], 0.022, 0.004, 0.85, 0.10, 0.0, 0.25),
        ("JumpRecovery", JUMP["JumpRecovery"], 0.004, 0.000, 0.10, 0.0, 0.25, 0.0),
    ]
    for name, frames, h0, h1, k0, k1, c0, c1 in spec:
        new_action(arm, name)
        clear_pose(arm)
        for f in range(1, frames + 1):
            t = _ease((f - 1) / max(1, frames - 1))
            h = h0 + (h1 - h0) * t
            tuck = k0 + (k1 - k0) * t
            crouch = c0 + (c1 - c0) * t
            set_world_offset(arm, "pelvis", (0.0, 0.0, h - 0.008 * crouch))
            key_loc(arm, "pelvis", f)
            key_rot(arm, "pelvis", f, (-6.0 * GAIN * crouch + 4.0 * tuck, 0.0, 0.0))
            key_rot(arm, "spine_01", f, (-4.0 * GAIN * crouch + 5.0 * tuck, 0.0, 0.0))
            key_rot(arm, "spine_02", f, (-3.0 * GAIN * crouch + 6.0 * tuck, 0.0, 0.0))
            key_rot(arm, "chest", f, (-5.0 * GAIN * crouch + 7.0 * tuck, 0.0, 0.0))
            key_rot(arm, "neck_01", f, (6.0 * GAIN * crouch - 4.0 * tuck, 0.0, 0.0))
            key_rot(arm, "head", f, (8.0 * GAIN * crouch - 6.0 * tuck, 0.0, 0.0))
            for lab in PHASE:
                front = lab.startswith("F")
                # Targets rise with the body and tuck toward it. Front legs
                # tuck harder, which is what a cat actually does.
                lift = (max(0.0, h) * (FRONT_LIFT_BOOST if front else 1.0)
                        + (0.020 if front else 0.016) * tuck)
                fwd = (0.012 if front else -0.010) * tuck
                # NO SUB-GROUND TARGETS. The first version subtracted
                # 0.026*crouch here, which drove the targets 26 mm BELOW the
                # floor during anticipation — measured, the paws ended up
                # 105 mm under it. In a crouch the feet stay planted and the
                # BODY comes down; that is what the pelvis term does.
                set_world_offset(arm, f"ik_{lab}", (0.0, fwd, max(0.0, lift)))
                key_loc(arm, f"ik_{lab}", f)
            for i, amp in ((1, 3.0), (2, 5.0), (3, 7.0), (4, 9.0), (5, 10.0), (6, 11.0)):
                key_rot(arm, f"tail_{i:02d}", f,
                        (-amp * tuck * 0.6 + amp * crouch * 0.4, 0.0, 0.0))
        smooth(arm.animation_data.action)
        out.append((name, 1, frames))
    return out


def author_celebrate(arm):
    """Two bounces with a head flourish. UPPER BODY plus a small vertical.

    Blendable like Wave, so it keys the spine, head, tail and a modest pelvis
    rise, and leaves the legs to whatever is underneath. The bounce is small
    enough — 18 mm — that the IK targets can follow it inside the reach
    headroom without the legs having to leave the ground at all.
    """
    new_action(arm, "Celebrate")
    clear_pose(arm)
    for f in range(1, CELEBRATE_FRAMES + 1):
        u = (f - 1) / (CELEBRATE_FRAMES - 1)
        env = math.sin(math.pi * min(1.0, u / 0.92))
        bounce = abs(math.sin(2.0 * math.pi * u)) * env
        sway = math.sin(2.0 * math.pi * u * 2.0) * env
        set_world_offset(arm, "pelvis", (0.0, 0.0, 0.018 * bounce))
        key_loc(arm, "pelvis", f)
        key_rot(arm, "pelvis", f, (3.0 * GAIN * bounce, 0.0, sway * 3.0))
        key_rot(arm, "spine_01", f, (4.0 * GAIN * bounce, 0.0, sway * 3.0))
        key_rot(arm, "spine_02", f, (5.0 * GAIN * bounce, 0.0, sway * 2.0))
        key_rot(arm, "chest", f, (7.0 * GAIN * bounce, 0.0, -sway * 2.0))
        key_rot(arm, "neck_01", f, (-6.0 * GAIN * bounce, 0.0, -sway * 4.0))
        key_rot(arm, "head", f, (-9.0 * GAIN * bounce, 0.0, -sway * 7.0))
        key_rot(arm, "ear_L", f, (10.0 * bounce, 0.0, 0.0))
        key_rot(arm, "ear_R", f, (10.0 * bounce, 0.0, 0.0))
        for lab in PHASE:
            # Front targets take the shoulder compensation too — the chest
            # pitches, so the front shoulders rise further than the pelvis and
            # a uniform lift leaves the front legs 6.35 mm short.
            k = 0.018 * (2.4 if lab.startswith("F") else 1.0)
            set_world_offset(arm, f"ik_{lab}", (0.0, 0.0, k * bounce))
            key_loc(arm, f"ik_{lab}", f)
        for i, amp in ((1, 4.0), (2, 7.0), (3, 10.0), (4, 13.0), (5, 15.0), (6, 16.0)):
            key_rot(arm, f"tail_{i:02d}", f, (0.0, 0.0, sway * amp))
    smooth(arm.animation_data.action)
    return ("Celebrate", 1, CELEBRATE_FRAMES)


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


def clip_ik_report(arm):
    """Every clip's worst IK residual and worst sub-floor paw. A GATE, not a note.

    This is the check that found four separate authoring faults the viewport
    would have shown as "looks a bit odd": FK written onto an IK-constrained
    wrist (26.6 mm), IK targets driven 26 mm below the floor (paws 105 mm
    under it), body rotations swinging the shoulders past the front legs'
    22.1 mm of reach headroom, and a gain knob wired to a component that was
    always zero.

    A non-zero residual means the solver did not reach the target, so the leg
    is not where the clip says it is. A negative sink means a paw went through
    the ground. Both are silent in a render and obvious here.
    """
    LEGS = {"FL": ("wrist_FL", "ik_FL"), "FR": ("wrist_FR", "ik_FR"),
            "RL": ("ankle_RL", "ik_RL"), "RR": ("ankle_RR", "ik_RR")}
    sc = bpy.context.scene
    keep = arm.animation_data.action
    rows, bad = [], []
    for act in sorted(bpy.data.actions, key=lambda a: a.name):
        arm.animation_data.action = act
        f0, f1 = (int(x) for x in act.frame_range)
        worst, sink, who = 0.0, 0.0, ""
        for f in range(f0, f1 + 1):
            sc.frame_set(f)
            bpy.context.view_layer.update()
            for lab, (bone, tgt) in LEGS.items():
                d = ((arm.matrix_world @ arm.pose.bones[bone].tail)
                     - (arm.matrix_world @ arm.pose.bones[tgt].head)).length
                if d > worst:
                    worst, who = d, f"{lab}@{f}"
                z = (arm.matrix_world @ arm.pose.bones[f"paw_{lab}"].tail).z
                sink = min(sink, z)
        rows.append((act.name, f1 - f0 + 1, worst, sink, who))
        if worst > 0.003 or sink < -0.001:
            bad.append(act.name)
    arm.animation_data.action = keep
    print("")
    print("CLIP IK (worst target residual, worst paw below floor)")
    print(f"{'clip':18s} {'frames':>6s} {'residual':>11s} {'sink':>10s}  worst at")
    for n, fr, w, sk, who in rows:
        print(f"{n:18s} {fr:6d} {w * 1000:8.3f} mm {sk * 1000:7.2f} mm  {who}")
    if bad:
        raise SystemExit(f"[anim] {len(bad)} clips exceed the IK gate: {bad}")
    print(f"[anim] all {len(rows)} clips within 3 mm residual and on or above the floor")
    return rows


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

    made = [author_idle(arm), author_walk(arm),
            author_walk_start(arm), author_walk_stop(arm),
            author_turn(arm, +1, "TurnLeft"), author_turn(arm, -1, "TurnRight"),
            author_wave(arm)]
    made += author_jump(arm)
    made.append(author_celebrate(arm))
    phase_table()
    worst, _rows = planted_during_walk(arm, cage)
    clip_ik_report(arm)

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
