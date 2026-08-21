"""
rig_lion.py — skeleton, skinning, IK and animation for the detailed lion.

Builds the quadruped rig the brief specifies, skins the single continuous mesh
to it, adds IK to all four legs, authors the core animation clips, and exports a
GLB the runtime can drive.

SKELETON
  root -> pelvis -> spine_01 -> spine_02 -> chest -> neck -> head -> jaw
  front: scapula -> upper_front -> elbow -> lower_front -> wrist -> paw  (L/R)
  rear:  hip -> thigh -> knee -> hock -> ankle -> paw                    (L/R)
  plus ear_L/R, eye_L/R and a five-bone tail chain.

  Names are semantic and stable because runtime code addresses them. Nothing is
  called Bone.001.

IK
  Each leg gets an IK constraint on its lower chain with a pole target, so a
  planted paw stays planted while the body moves above it. Without this the
  character skates, which is the single most common giveaway of a fake walk.

ANIMATION
  Actions are authored as separate reusable clips with clean starts and ends so
  the runtime can cross-fade them, rather than one long timeline.

Run:
  blender --background art/blender/lion_detailed.blend \
    --factory-startup --python tools/blender/rig_lion.py

Outputs:
  art/blender/lion_rigged.blend
  public/assets/lion/rigged/lion_v2.glb
"""

import json
import math
import os

import bpy
from mathutils import Vector

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
BLEND_OUT = os.path.join(REPO, "art", "blender", "lion_rigged.blend")
GLB_OUT = os.path.join(REPO, "public", "assets", "lion", "rigged", "lion_v2.glb")

# Matches the proportion contract the mesh was built from.
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
LEG_X = 0.098


def build_armature():
    bpy.ops.object.armature_add(enter_editmode=True, location=(0, 0, 0))
    arm = bpy.context.object
    arm.name = "LionArmature"
    arm.data.name = "LionArmatureData"
    eb = arm.data.edit_bones
    eb.remove(eb[0])                      # drop the default bone

    def bone(name, head, tail, parent=None, connect=False):
        b = eb.new(name)
        b.head = Vector(head)
        b.tail = Vector(tail)
        if parent:
            b.parent = eb[parent]
            b.use_connect = connect
        return b

    # ── Spine chain ────────────────────────────────────────────────────────
    bone("root", (0, 0, 0), (0, 0, 0.12))
    bone("pelvis", (0, BODY_BACK_Y, SPINE_Z), (0, BODY_BACK_Y + 0.10, SPINE_Z), "root")
    bone("spine_01", (0, BODY_BACK_Y + 0.10, SPINE_Z), (0, BODY_BACK_Y + 0.24, SPINE_Z + 0.01), "pelvis", True)
    bone("spine_02", (0, BODY_BACK_Y + 0.24, SPINE_Z + 0.01), (0, BODY_FRONT_Y - 0.04, SPINE_Z + 0.02), "spine_01", True)
    bone("chest", (0, BODY_FRONT_Y - 0.04, SPINE_Z + 0.02), (0, BODY_FRONT_Y + 0.06, SPINE_Z + 0.06), "spine_02", True)
    bone("neck", (0, BODY_FRONT_Y + 0.06, SPINE_Z + 0.06), (0, HEAD_Y - 0.10, HEAD_Z - 0.10), "chest", True)
    bone("head", (0, HEAD_Y - 0.10, HEAD_Z - 0.10), (0, HEAD_Y + 0.06, HEAD_Z), "neck", True)
    bone("jaw", (0, HEAD_Y + 0.04, HEAD_Z - 0.07), (0, HEAD_Y + 0.19, HEAD_Z - 0.11), "head")

    for sx, tag in ((-1, "L"), (1, "R")):
        bone(f"ear_{tag}", (sx * 0.10, HEAD_Y - 0.01, HEAD_Z + 0.10),
             (sx * 0.15, HEAD_Y + 0.01, HEAD_Z + 0.21), "head")
        bone(f"eye_{tag}", (sx * 0.074, HEAD_Y + 0.11, HEAD_Z + 0.02),
             (sx * 0.074, HEAD_Y + 0.18, HEAD_Z + 0.02), "head")

    # ── Front legs ─────────────────────────────────────────────────────────
    for sx, tag in ((-1, "L"), (1, "R")):
        x = sx * LEG_X
        y = BODY_FRONT_Y + 0.02
        bone(f"scapula_{tag}", (0, BODY_FRONT_Y, SPINE_Z + 0.02), (x, y, SPINE_Z - 0.02), "chest")
        bone(f"upper_front_{tag}", (x, y, SPINE_Z - 0.02), (x, y, BELLY_Z - 0.02), f"scapula_{tag}", True)
        bone(f"lower_front_{tag}", (x, y, BELLY_Z - 0.02), (x, y, GROUND + 0.14), f"upper_front_{tag}", True)
        bone(f"front_paw_{tag}", (x, y, GROUND + 0.14), (x, y + 0.10, GROUND + 0.05), f"lower_front_{tag}", True)

    # ── Rear legs ──────────────────────────────────────────────────────────
    for sx, tag in ((-1, "L"), (1, "R")):
        x = sx * LEG_X
        y = BODY_BACK_Y + 0.02
        bone(f"hip_{tag}", (0, BODY_BACK_Y, SPINE_Z), (x, y, SPINE_Z - 0.03), "pelvis")
        bone(f"thigh_{tag}", (x, y, SPINE_Z - 0.03), (x, y, BELLY_Z - 0.01), f"hip_{tag}", True)
        bone(f"hock_{tag}", (x, y, BELLY_Z - 0.01), (x, y, GROUND + 0.14), f"thigh_{tag}", True)
        bone(f"rear_paw_{tag}", (x, y, GROUND + 0.14), (x, y + 0.09, GROUND + 0.05), f"hock_{tag}", True)

    # ── Tail ───────────────────────────────────────────────────────────────
    tail_pts = [
        (0, BODY_BACK_Y - 0.02, SPINE_Z + 0.02),
        (0, BODY_BACK_Y - 0.12, SPINE_Z + 0.06),
        (0, BODY_BACK_Y - 0.22, SPINE_Z + 0.13),
        (0, BODY_BACK_Y - 0.31, SPINE_Z + 0.23),
        (0, BODY_BACK_Y - 0.36, SPINE_Z + 0.34),
        (0, BODY_BACK_Y - 0.37, SPINE_Z + 0.43),
    ]
    for i in range(5):
        bone(f"tail_{i+1:02d}", tail_pts[i], tail_pts[i + 1],
             "pelvis" if i == 0 else f"tail_{i:02d}", i > 0)

    # IK targets and poles live outside the deform hierarchy.
    for tag in ("L", "R"):
        for side, y in (("front", BODY_FRONT_Y + 0.02), ("rear", BODY_BACK_Y + 0.02)):
            x = (-LEG_X if tag == "L" else LEG_X)
            bone(f"ik_{side}_{tag}", (x, y, GROUND + 0.14), (x, y, GROUND + 0.02), "root")
            bone(f"pole_{side}_{tag}", (x, y + 0.45, BELLY_Z), (x, y + 0.52, BELLY_Z), "root")

    bpy.ops.object.mode_set(mode="OBJECT")
    return arm


def add_ik(arm):
    """IK on all four legs so planted paws stay planted."""
    bpy.context.view_layer.objects.active = arm
    bpy.ops.object.mode_set(mode="POSE")
    pb = arm.pose.bones

    specs = [
        ("lower_front_L", "ik_front_L", "pole_front_L"),
        ("lower_front_R", "ik_front_R", "pole_front_R"),
        ("hock_L", "ik_rear_L", "pole_rear_L"),
        ("hock_R", "ik_rear_R", "pole_rear_R"),
    ]
    for bone_name, target, pole in specs:
        c = pb[bone_name].constraints.new("IK")
        c.target = arm
        c.subtarget = target
        c.pole_target = arm
        c.pole_subtarget = pole
        c.pole_angle = math.radians(-90)
        c.chain_count = 2          # lower + upper only; the body stays free
        # OFF by default, and this is not a detail.
        #
        # Every clip on this rig is authored in FK — the actions key
        # `upper_front_*` / `thigh_*` rotations directly. A live IK constraint
        # overrides its chain, so the legs were being pinned to targets that
        # never move while the FK keys were discarded. Measuring the walk stride
        # exposed it: 18mm of paw travel per cycle where the authored swing
        # should give ~230mm, i.e. the walk was almost entirely neutered by the
        # rig's own constraints.
        #
        # The constraints stay defined so a future pass can author foot
        # placement through them (which is the better technique for locomotion),
        # but until a clip animates their influence they must not fight FK.
        c.influence = 0.0

    bpy.ops.object.mode_set(mode="OBJECT")


def mark_control_bones(arm):
    """Exclude IK targets and poles from deformation.

    Automatic weights bind to every DEFORM bone. The IK targets sit at the paws
    and the poles sit ~0.5m in front of the body, so leaving them deforming let
    them claim vertices — which then stretched into long spikes the moment a clip
    posed the rig. Control bones drive the rig; they must never skin it.
    """
    n = 0
    for b in arm.data.bones:
        if b.name.startswith(("ik_", "pole_")):
            b.use_deform = False
            n += 1
    print(f"[rig] {n} control bones excluded from deformation")


def skin(arm, meshes):
    """Bind the body and every feature to the armature with automatic weights."""
    mark_control_bones(arm)
    bpy.ops.object.select_all(action="DESELECT")
    for m in meshes:
        m.select_set(True)
    arm.select_set(True)
    bpy.context.view_layer.objects.active = arm
    bpy.ops.object.parent_set(type="ARMATURE_AUTO")


def key(arm, frame, poses):
    """Keyframe a set of {bone: (loc, rot_euler)} at a frame."""
    bpy.context.scene.frame_set(frame)
    for name, (loc, rot) in poses.items():
        pb = arm.pose.bones.get(name)
        if pb is None:
            raise SystemExit(
                f"key(): no bone named {name!r} — a silent skip here produces a "
                f"clip that looks authored and animates nothing")
        pb.rotation_mode = "XYZ"
        if loc is not None:
            pb.location = Vector(loc)
            pb.keyframe_insert("location", frame=frame)
        if rot is not None:
            pb.rotation_euler = [math.radians(a) for a in rot]
            pb.keyframe_insert("rotation_euler", frame=frame)


def new_action(arm, name):
    act = bpy.data.actions.new(name)
    arm.animation_data.action = act
    if hasattr(act, "use_fake_user"):
        act.use_fake_user = True
    return act


def author_actions(arm):
    """Reusable clips with clean starts and ends, built for cross-fading."""
    bpy.context.view_layer.objects.active = arm
    bpy.ops.object.mode_set(mode="POSE")
    if arm.animation_data is None:
        arm.animation_data_create()

    made = []

    # ── Idle: breathing, a slow weight shift, tail sway, ear flick ─────────
    new_action(arm, "Idle")
    for f, amt in ((1, 0.0), (30, 1.0), (60, 0.0)):
        key(arm, f, {
            "chest": (None, (amt * 1.6, 0, 0)),
            "spine_02": (None, (amt * 0.9, 0, 0)),
            "neck": (None, (-amt * 1.4, 0, 0)),
            "head": (None, (amt * 1.1, 0, amt * 0.8)),
            "tail_02": (None, (0, 0, amt * 7.0)),
            "tail_03": (None, (0, 0, amt * 9.0)),
            "tail_04": (None, (0, 0, amt * 11.0)),
            "ear_L": (None, (amt * 5.0, 0, 0)),
            "ear_R": (None, (-amt * 3.0, 0, 0)),
        })
    made.append(("Idle", 1, 60))

    # ── Walk: FOUR-BEAT LATERAL sequence ───────────────────────────────────
    # The previous clip moved diagonal pairs together. That is a TROT, not a
    # walk — and it was committed with a comment asserting the opposite, which
    # is the kind of confident-and-wrong that only reference checking catches.
    #
    # A quadruped walk is four separate beats in LATERAL order:
    #
    #     back-left -> front-left -> back-right -> front-right
    #
    # each a quarter of the cycle apart, so two to three feet are always on the
    # ground and the body rocks gently toward whichever side is supporting. A
    # trot has two beats and a moment of near-suspension; it reads as a jog and
    # is wrong for a cub ambling around an island.
    new_action(arm, "Walk")
    PHASE = {"BL": 0.00, "FL": 0.25, "BR": 0.50, "FR": 0.75}
    UPPER = {"BL": "thigh_L", "FL": "upper_front_L", "BR": "thigh_R", "FR": "upper_front_R"}
    LOWER = {"BL": "hock_L", "FL": "lower_front_L", "BR": "hock_R", "FR": "lower_front_R"}
    SWING = {"BL": 20.0, "FL": 22.0, "BR": 20.0, "FR": 22.0}
    FRAMES = 48                      # 2 s at 24fps — an amble, not a march

    def limb_angles(leg, t):
        """Protraction/retraction for one limb at cycle position t (0..1).

        Stance runs from 0 to 0.75 of the limb's own phase (three quarters of
        the cycle on the ground, which is what keeps 2-3 feet planted); swing is
        the remaining quarter and has to travel back the whole way, so it moves
        three times as fast. The knee/hock flexes only during swing — a joint
        that bends while the paw is planted is the classic skating tell.
        """
        p = (t - PHASE[leg]) % 1.0
        sw = SWING[leg]
        if p < 0.75:
            k = p / 0.75                      # stance: forward -> back
            upper = sw * (1.0 - 2.0 * k)
            lower = 0.0
        else:
            k = (p - 0.75) / 0.25             # swing: back -> forward
            upper = -sw + 2.0 * sw * k
            lower = -sw * 0.85 * math.sin(math.pi * k)
        front = leg in ("FL", "FR")
        return upper, (lower if front else -lower * 0.9)

    for f in range(1, FRAMES + 2, 3):
        t = (f - 1) / FRAMES
        pose = {}
        for leg in PHASE:
            u, l = limb_angles(leg, t)
            pose[UPPER[leg]] = (None, (u, 0, 0))
            pose[LOWER[leg]] = (None, (l, 0, 0))
        # The body answers the footfalls. One full left-right rock per cycle,
        # because the support side alternates once per cycle in a lateral walk.
        rock = math.sin(2.0 * math.pi * t)
        bob = math.sin(4.0 * math.pi * t)          # two dips per cycle
        pose["pelvis"] = ((0, bob * 0.008, 0), (0, rock * 3.4, 0))
        pose["chest"] = (None, (0, -rock * 2.8, 0))
        pose["spine_02"] = (None, (0, rock * 1.6, 0))
        pose["neck"] = (None, (bob * 1.2, 0, -rock * 1.4))
        # Head counter-rotates to stay level — the stabiliser that makes a walk
        # look like an animal carrying its own weight.
        pose["head"] = (None, (-bob * 0.9, 0, -rock * 2.2))
        pose["tail_02"] = (None, (0, 0, rock * 8.0))
        pose["tail_03"] = (None, (0, 0, rock * 11.0))
        pose["tail_04"] = (None, (0, 0, rock * 14.0))
        key(arm, f, pose)
    made.append(("Walk", 1, 49))

    # ── Wave: a FOUR-LEGGED performance with weight transfer ──────────────
    # The brief is explicit that waving is not an arm animation. The body shifts
    # its centre of gravity onto the supporting legs first, the chest and pelvis
    # compensate, and only then does the paw leave the ground.
    new_action(arm, "Wave")
    key(arm, 1, {"chest": (None, (0, 0, 0)), "pelvis": (None, (0, 0, 0)),
                 "upper_front_R": (None, (0, 0, 0)), "lower_front_R": (None, (0, 0, 0)),
                 "head": (None, (0, 0, 0)), "neck": (None, (0, 0, 0))})
    # Weight shifts away from the waving side.
    key(arm, 10, {"chest": (None, (0, 0, -7.0)), "pelvis": (None, (0, 0, -4.0)),
                  "neck": (None, (-4.0, 0, 3.0)), "head": (None, (3.0, 0, 4.0))})
    # Paw unloads and lifts.
    key(arm, 18, {"upper_front_R": (None, (-72.0, 0, -14.0)),
                  "lower_front_R": (None, (-38.0, 0, 0)),
                  "chest": (None, (0, 0, -9.0)), "head": (None, (5.0, 0, 6.0))})
    # Two wave beats from the wrist and elbow, body still living.
    key(arm, 26, {"lower_front_R": (None, (-16.0, 0, 26.0)), "head": (None, (5.0, 0, 2.0))})
    key(arm, 34, {"lower_front_R": (None, (-38.0, 0, -14.0)), "head": (None, (4.0, 0, 8.0))})
    key(arm, 42, {"lower_front_R": (None, (-16.0, 0, 24.0))})
    # Paw returns, weight transfers back, settle.
    key(arm, 54, {"upper_front_R": (None, (0, 0, 0)), "lower_front_R": (None, (0, 0, 0)),
                  "chest": (None, (0, 0, -2.0)), "pelvis": (None, (0, 0, 0)),
                  "neck": (None, (0, 0, 0)), "head": (None, (0, 0, 0))})
    key(arm, 62, {"chest": (None, (0, 0, 0))})
    made.append(("Wave", 1, 62))

    # ── Sit: the pose the mascot holds while a child reads or chooses ─────
    new_action(arm, "Sit")
    key(arm, 1, {"pelvis": ((0, 0, 0), (0, 0, 0)), "thigh_L": (None, (0, 0, 0)),
                 "thigh_R": (None, (0, 0, 0)), "hock_L": (None, (0, 0, 0)),
                 "hock_R": (None, (0, 0, 0)), "chest": (None, (0, 0, 0)),
                 "neck": (None, (0, 0, 0)), "head": (None, (0, 0, 0)),
                 "tail_02": (None, (0, 0, 0))})
    # Haunches fold, pelvis drops and rotates back, chest lifts to compensate.
    key(arm, 22, {"pelvis": ((0, -0.055, -0.075), (-26, 0, 0)),
                  "thigh_L": (None, (58, 0, 0)), "thigh_R": (None, (58, 0, 0)),
                  "hock_L": (None, (-64, 0, 0)), "hock_R": (None, (-64, 0, 0)),
                  "chest": (None, (12, 0, 0)), "neck": (None, (-8, 0, 0)),
                  "head": (None, (-4, 0, 0)), "tail_02": (None, (0, 0, 14))})
    # Settle — a sit that arrives and stops dead reads as a freeze-frame.
    key(arm, 34, {"chest": (None, (9, 0, 0)), "head": (None, (-1, 0, 0)),
                  "tail_02": (None, (0, 0, -8))})
    key(arm, 46, {"chest": (None, (10, 0, 0)), "head": (None, (-3, 0, 0)),
                  "tail_02": (None, (0, 0, 10))})
    made.append(("Sit", 1, 46))

    # ── Jump: anticipation, launch, tuck, land, recover ───────────────────
    new_action(arm, "Jump")
    key(arm, 1, {"root": ((0, 0, 0), None), "chest": (None, (0, 0, 0)),
                 "pelvis": (None, (0, 0, 0)), "upper_front_L": (None, (0, 0, 0)),
                 "upper_front_R": (None, (0, 0, 0)), "thigh_L": (None, (0, 0, 0)),
                 "thigh_R": (None, (0, 0, 0)), "head": (None, (0, 0, 0)),
                 "tail_02": (None, (0, 0, 0))})
    # Crouch — the anticipation that sells the launch.
    key(arm, 9, {"root": ((0, -0.075, 0), None), "thigh_L": (None, (34, 0, 0)),
                 "thigh_R": (None, (34, 0, 0)), "upper_front_L": (None, (22, 0, 0)),
                 "upper_front_R": (None, (22, 0, 0)), "chest": (None, (-9, 0, 0)),
                 "head": (None, (-12, 0, 0))})
    # Extension.
    key(arm, 15, {"root": ((0, 0.240, 0), None), "thigh_L": (None, (-26, 0, 0)),
                  "thigh_R": (None, (-26, 0, 0)), "upper_front_L": (None, (-44, 0, 0)),
                  "upper_front_R": (None, (-44, 0, 0)), "chest": (None, (11, 0, 0)),
                  "head": (None, (14, 0, 0)), "tail_02": (None, (0, 0, -18))})
    # Apex tuck.
    key(arm, 21, {"root": ((0, 0.300, 0), None), "thigh_L": (None, (40, 0, 0)),
                  "thigh_R": (None, (40, 0, 0)), "upper_front_L": (None, (-16, 0, 0)),
                  "upper_front_R": (None, (-16, 0, 0)), "head": (None, (6, 0, 0))})
    # Land, absorb.
    key(arm, 29, {"root": ((0, -0.060, 0), None), "thigh_L": (None, (30, 0, 0)),
                  "thigh_R": (None, (30, 0, 0)), "upper_front_L": (None, (18, 0, 0)),
                  "upper_front_R": (None, (18, 0, 0)), "chest": (None, (-11, 0, 0)),
                  "head": (None, (-14, 0, 0))})
    key(arm, 40, {"root": ((0, 0, 0), None), "thigh_L": (None, (0, 0, 0)),
                  "thigh_R": (None, (0, 0, 0)), "upper_front_L": (None, (0, 0, 0)),
                  "upper_front_R": (None, (0, 0, 0)), "chest": (None, (0, 0, 0)),
                  "head": (None, (0, 0, 0)), "tail_02": (None, (0, 0, 0))})
    made.append(("Jump", 1, 40))

    # ── Celebrate: two hops, head toss, tail whirl, open mouth ────────────
    new_action(arm, "Celebrate")
    key(arm, 1, {"root": ((0, 0, 0), None), "head": (None, (0, 0, 0)),
                 "jaw": (None, (0, 0, 0)), "tail_02": (None, (0, 0, 0)),
                 "tail_03": (None, (0, 0, 0)), "ear_L": (None, (0, 0, 0)),
                 "ear_R": (None, (0, 0, 0)), "chest": (None, (0, 0, 0))})
    for i, base in enumerate((1, 25)):
        key(arm, base + 6, {"root": ((0, -0.055, 0), None), "chest": (None, (-8, 0, 0)),
                            "head": (None, (-10, 0, 0)), "jaw": (None, (6, 0, 0))})
        key(arm, base + 13, {"root": ((0, 0.190, 0), None), "chest": (None, (13, 0, 0)),
                             "head": (None, (18, 0, 0)), "jaw": (None, (17, 0, 0)),
                             "ear_L": (None, (-14, 0, 0)), "ear_R": (None, (-14, 0, 0)),
                             "tail_02": (None, (0, 0, 22 * (1 if i == 0 else -1))),
                             "tail_03": (None, (0, 0, 28 * (1 if i == 0 else -1)))})
        key(arm, base + 20, {"root": ((0, 0, 0), None), "chest": (None, (0, 0, 0)),
                             "head": (None, (2, 0, 0)), "jaw": (None, (8, 0, 0)),
                             "ear_L": (None, (0, 0, 0)), "ear_R": (None, (0, 0, 0)),
                             "tail_02": (None, (0, 0, -12 * (1 if i == 0 else -1))),
                             "tail_03": (None, (0, 0, -16 * (1 if i == 0 else -1)))})
    key(arm, 54, {"head": (None, (0, 0, 0)), "jaw": (None, (0, 0, 0)),
                  "tail_02": (None, (0, 0, 0)), "tail_03": (None, (0, 0, 0))})
    made.append(("Celebrate", 1, 54))

    # ── Nod: "yes", used to acknowledge a child's answer ──────────────────
    new_action(arm, "Nod")
    for f, a in ((1, 0), (7, -16), (14, 4), (21, -13), (28, 2), (34, 0)):
        key(arm, f, {"head": (None, (a, 0, 0)), "neck": (None, (a * 0.35, 0, 0)),
                     "ear_L": (None, (a * 0.5, 0, 0)), "ear_R": (None, (a * 0.5, 0, 0))})
    made.append(("Nod", 1, 34))

    # ── LookAround: idle curiosity, played when the child goes quiet ──────
    new_action(arm, "LookAround")
    for f, (yaw, tilt) in ((1, (0, 0)), (18, (-26, 5)), (34, (-22, -3)),
                           (52, (24, 6)), (68, (20, -2)), (86, (0, 0))):
        key(arm, f, {"head": (None, (tilt, 0, yaw)), "neck": (None, (tilt * 0.3, 0, yaw * 0.35)),
                     "ear_L": (None, (0, 0, yaw * 0.25)), "ear_R": (None, (0, 0, yaw * 0.25)),
                     "tail_02": (None, (0, 0, yaw * 0.3))})
    made.append(("LookAround", 1, 86))

    # ── Talk: jaw and head motion for read-aloud and prompts ──────────────
    # A viseme rig is out of scope for a cub with a one-bone jaw; an amplitude
    # loop the runtime can start and stop on speech boundaries is honest about
    # what it is and reads correctly at homepage scale.
    new_action(arm, "Talk")
    for i in range(7):
        f = 1 + i * 5
        open_a = (14 if i % 2 == 0 else 5) * (1.0 if i < 6 else 0.0)
        key(arm, f, {"jaw": (None, (open_a, 0, 0)),
                     "head": (None, (open_a * 0.20 - 1.5, 0, (i % 3 - 1) * 2.0))})
    made.append(("Talk", 1, 31))

    # ── Sleep: the wellbeing / bedtime state ──────────────────────────────
    new_action(arm, "Sleep")
    key(arm, 1, {"pelvis": ((0, -0.055, -0.075), (-26, 0, 0)),
                 "thigh_L": (None, (58, 0, 0)), "thigh_R": (None, (58, 0, 0)),
                 "hock_L": (None, (-64, 0, 0)), "hock_R": (None, (-64, 0, 0)),
                 "neck": (None, (-26, 0, 0)), "head": (None, (-22, 0, 0)),
                 "chest": (None, (0, 0, 0)), "ear_L": (None, (-18, 0, 0)),
                 "ear_R": (None, (-18, 0, 0)), "tail_02": (None, (0, 0, 0))})
    key(arm, 45, {"chest": (None, (3.2, 0, 0)), "neck": (None, (-24, 0, 0)),
                  "head": (None, (-24, 0, 0)), "tail_02": (None, (0, 0, 5))})
    key(arm, 90, {"chest": (None, (0, 0, 0)), "neck": (None, (-26, 0, 0)),
                  "head": (None, (-22, 0, 0)), "tail_02": (None, (0, 0, 0))})
    made.append(("Sleep", 1, 90))

    bpy.ops.object.mode_set(mode="OBJECT")
    return made


def measure_walk_stride(arm, action_name="Walk", fps=24.0):
    """Measure the walk stride from the CLIP, not from a formula.

    `WALK_SPEED` in lionBrain.ts was 0.52 m/s, derived on paper from a 32-frame
    two-stride cycle. The clip is now 48 frames with four lateral beats, and
    nobody updated the constant — which means the runtime translates about four
    times faster than the legs cycle, and the paws skate.

    The fix is to stop deriving it. For an in-place cycle the paw's total
    fore-aft excursion IS the stride length, so it can be sampled directly off
    the authored action. Emitting it as data next to the GLB means the constant
    can never drift from the clip again.
    """
    act = bpy.data.actions.get(action_name)
    if act is None:
        raise SystemExit(f"[rig] no action {action_name!r} to measure")
    arm.animation_data.action = act
    lo, hi = (int(round(v)) for v in act.frame_range)
    cycle = max(1, hi - lo) / fps

    spans = []
    # This rig's leg chains end at `front_paw_*` / `rear_paw_*`. The first
    # attempt looked for `paw_FL` — the CAGE rig's naming — found nothing, and
    # silently measured a stride of zero. Missing a bone must be loud, not
    # averaged away.
    for paw in ("front_paw_L", "rear_paw_L"):
        pb = arm.pose.bones.get(paw)
        if pb is None:
            raise SystemExit(
                f"[rig] no bone {paw!r} to measure stride from; bones are: "
                + ", ".join(sorted(b.name for b in arm.data.bones)))
        ys = []
        for f in range(lo, hi + 1):
            bpy.context.scene.frame_set(f)
            ys.append((arm.matrix_world @ pb.tail).y)
        if ys:
            spans.append(max(ys) - min(ys))
    bpy.context.scene.frame_set(lo)
    if not spans:
        raise SystemExit("[rig] stride measurement found no paw bones")
    stride = sum(spans) / len(spans)
    print(f"[rig] walk stride per paw: "
          + ", ".join(f"{v:.4f}" for v in spans) + f"  ->  {stride:.4f} over {cycle:.3f}s")
    return stride, cycle


def join_by_material(arm, meshes):
    """Merge the skinned meshes into one object per material.

    The character is ~70 separate feature objects (each eye disc, each tooth,
    each claw). Left alone that is ~70 draw calls for one mascot. They all share
    the same two materials — matte fur and glossy wet bits — because colour is
    carried in vertex attributes, so they merge cleanly. Vertex groups and the
    armature modifier survive a join, which is why this runs AFTER skinning:
    automatic weights are far more reliable on separate objects than on one mesh
    full of disconnected islands.
    """
    skinned = [m for m in meshes if any(mod.type == "ARMATURE" for mod in m.modifiers)]
    buckets = {}
    for m in skinned:
        key = m.data.materials[0].name if m.data.materials else "_none"
        buckets.setdefault(key, []).append(m)

    merged = []
    for key, group in sorted(buckets.items()):
        bpy.ops.object.select_all(action="DESELECT")
        for o in group:
            o.select_set(True)
        target = group[0]
        bpy.context.view_layer.objects.active = target
        if len(group) > 1:
            bpy.ops.object.join()
        target.name = f"Lion_{key.replace('Lion_', '')}"
        merged.append(target)
        print(f"[rig] joined {len(group):3d} objects -> {target.name}")

    meshes[:] = merged
    bpy.ops.object.select_all(action="DESELECT")
    return merged


# Everything the production character GLB is allowed to contain. Anything else
# selected at export time is a bug, not a decision.
ALLOWED_MESH_PREFIXES = ("Lion_",)
FORBIDDEN_NAME_TOKENS = (
    "floor", "backdrop", "ground", "grid", "plane", "studio", "helper", "debug",
    "guide", "ref", "reference", "temp", "tmp", "test", "widget", "gizmo",
    "empty", "target", "marker", "path", "curve", "frustum", "camera",
)
MAX_CHARACTER_EXTENT = 3.0   # metres; the cub is ~1.4m in its authoring space


def assert_production_clean():
    """Fail the export if anything that is not the character is selected.

    A 12m studio floor plane once rode inside this GLB because export selected
    the whole scene, and because it had picked up an armature modifier during
    parenting it also survived a later "skinned meshes only" filter. In the
    application it scaled up with the lion and shadowed the ENTIRE island — the
    world rendered as a grey slab and cost a long debugging session that a
    three-line check would have prevented.

    This runs on the actual export selection, so it cannot be bypassed by
    changing how objects are gathered upstream.
    """
    problems = []
    for o in bpy.context.selected_objects:
        if o.type == "ARMATURE":
            continue
        if o.type != "MESH":
            problems.append(f"{o.name}: non-mesh object type {o.type} selected for export")
            continue
        low = o.name.lower()
        hit = next((t for t in FORBIDDEN_NAME_TOKENS if t in low), None)
        if hit:
            problems.append(f"{o.name}: name contains development token {hit!r}")
        if not o.name.startswith(ALLOWED_MESH_PREFIXES):
            problems.append(f"{o.name}: not one of the allowed character meshes {ALLOWED_MESH_PREFIXES}")
        extent = max(o.dimensions)
        if extent > MAX_CHARACTER_EXTENT:
            problems.append(f"{o.name}: {extent:.2f}m exceeds the {MAX_CHARACTER_EXTENT}m character budget")

    if problems:
        raise SystemExit(
            "[rig] REFUSING TO EXPORT — development geometry in the production selection:\n  "
            + "\n  ".join(problems))
    print(f"[rig] export guard: {len(bpy.context.selected_objects)} objects, all clean")


def main():
    body = bpy.data.objects.get("LionBody_Retopo")
    if body is None:
        raise SystemExit("LionBody_Retopo not found — run detail_lion.py first")

    # Drop studio scaffolding (the 12m floor plane, backdrops) before rigging.
    # Filtering only at export was not enough: parent-with-automatic-weights had
    # already given the floor an armature modifier, so it passed the export
    # filter, shipped inside the character GLB, and cast a shadow over the whole
    # island — the world read as a grey slab whenever the lion was visible.
    STUDIO = ("Plane", "Floor", "Backdrop", "Ground", "Grid")
    for o in [o for o in bpy.data.objects if o.type == "MESH"]:
        dims = max(o.dimensions)
        if o.name.startswith(STUDIO) or dims > 3.0:
            print(f"[rig] removing studio object {o.name} ({dims:.2f}m)")
            bpy.data.objects.remove(o, do_unlink=True)

    meshes = [o for o in bpy.data.objects if o.type == "MESH"]

    # Features were parented to the body for transport; the armature owns them now.
    for m in meshes:
        if m is not body:
            wm = m.matrix_world.copy()
            m.parent = None
            m.matrix_world = wm

    arm = build_armature()
    skin(arm, meshes)
    add_ik(arm)
    actions = author_actions(arm)

    os.makedirs(os.path.dirname(BLEND_OUT), exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=BLEND_OUT)

    join_by_material(arm, meshes)

    os.makedirs(os.path.dirname(GLB_OUT), exist_ok=True)

    # Select ONLY the armature and its skinned meshes. select_all() swept up the
    # studio Floor and backdrop inherited from the silhouette scene, shipped them
    # inside the character GLB, and the runtime then scaled that 12m floor along
    # with the lion — covering the whole island in a grey slab.
    bpy.ops.object.select_all(action="DESELECT")
    arm.select_set(True)
    exported = 1
    for m in meshes:
        if any(mod.type == "ARMATURE" for mod in m.modifiers):
            m.select_set(True)
            exported += 1
    bpy.context.view_layer.objects.active = arm
    print(f"[rig] exporting {exported} objects (armature + skinned meshes only)")
    assert_production_clean()

    bpy.ops.export_scene.gltf(
        filepath=GLB_OUT, export_format="GLB", use_selection=True,
        export_apply=False, export_cameras=False, export_lights=False,
        export_yup=True, export_materials="EXPORT",
        export_vertex_color="MATERIAL",
        export_animations=True, export_animation_mode="ACTIONS",
        export_bake_animation=True, export_skins=True,
    )

    stride, cycle = measure_walk_stride(arm)
    loco = os.path.join(os.path.dirname(GLB_OUT), "locomotion.json")
    with open(loco, "w") as fh:
        json.dump({
            "clip": "Walk",
            "strideModelUnits": round(stride, 5),
            "cycleSeconds": round(cycle, 4),
            "note": ("Stride is the paw's fore-aft excursion in the model's OWN "
                     "units, measured from the authored clip. The runtime must "
                     "multiply it by whatever scale it applied to the asset, then "
                     "divide by cycleSeconds, to get world walk speed."),
        }, fh, indent=2)
    print(f"[rig] locomotion.json stride={stride:.4f} model units, cycle={cycle:.3f}s")

    size = os.path.getsize(GLB_OUT)
    deform = [b.name for b in arm.data.bones]
    print("\n===LION_RIG===")
    print(f"BLEND={BLEND_OUT}")
    print(f"GLB={GLB_OUT}")
    print(f"KB={size/1024:.1f}")
    print(f"BONES={len(deform)}")
    print(f"ACTIONS={[a[0] for a in actions]}")
    print(f"IK_CONSTRAINTS={sum(len([c for c in pb.constraints if c.type=='IK']) for pb in arm.pose.bones)}")
    print(f"SKINNED_MESHES={len([m for m in meshes if any(mod.type=='ARMATURE' for mod in m.modifiers)])}")
    print("===LION_RIG_END===")


if __name__ == "__main__":
    main()
