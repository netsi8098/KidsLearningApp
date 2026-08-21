"""
lion_skeleton — the production deform hierarchy, and the authored skin map.

TWO THINGS LIVE HERE, DELIBERATELY TOGETHER

`skeleton()` is the bone table. `RING_WEIGHTS` says which bone owns which ring
of the cage. They belong in one file because they are one decision: a skeleton is
only meaningful alongside a statement of what it deforms, and keeping them apart
is how the two drift out of step.

WHY AUTHORED WEIGHTS AND NOT HEAT MAPS

Blender's automatic weighting infers ownership from proximity. That works on open
forms and fails wherever two bones pass close to one another — the armpit, the
inner thigh, the jaw — because proximity cannot distinguish "near the scapula"
from "belongs to the scapula". The deformation battery showed exactly that: the
only remaining volume loss was in the armpit and inner thigh.

The cage does not have to guess. It was built from named rings, and it records
them as vertex groups, so ownership can be LOOKED UP:

    "frontR:elbow_lo"  ->  upper_front 0.25, forearm 0.75

Joints blend across three rings rather than switching at one, which is what stops
an elbow creasing. `JAW_RINGS` adds the one thing a cross-sectional ring cannot
express on its own: the lower half of a muzzle ring follows the jaw while the
upper half stays with the skull.
"""

import sys as _sys
import os as _os

_sys.path.insert(0, _os.path.dirname(_os.path.abspath(__file__)))
from lion_contract import HEAD_Z, SPINE_Z  # noqa: E402


def skeleton():
    """(name, parent, head, tail) for the production deform skeleton.

    Named exactly as the brief specifies, so runtime code can reason about it.
    `root` is a transform handle and is excluded from deformation by the rig.
    """
    B = []

    B.append(("root", None, (0.0, -0.10, 0.010), (0.0, -0.10, 0.110)))
    B.append(("pelvis", "root", (0.0, -0.336, SPINE_Z + 0.000), (0.0, -0.216, SPINE_Z - 0.006)))
    B.append(("spine_01", "pelvis", (0.0, -0.216, SPINE_Z - 0.006), (0.0, -0.076, SPINE_Z - 0.004)))
    B.append(("spine_02", "spine_01", (0.0, -0.076, SPINE_Z - 0.004), (0.0, 0.072, SPINE_Z + 0.004)))
    B.append(("chest", "spine_02", (0.0, 0.072, SPINE_Z + 0.004), (0.0, 0.244, SPINE_Z + 0.052)))
    B.append(("neck_01", "chest", (0.0, 0.244, SPINE_Z + 0.052), (0.0, 0.372, SPINE_Z + 0.272)))
    B.append(("head", "neck_01", (0.0, 0.372, SPINE_Z + 0.272), (0.0, 0.494, HEAD_Z + 0.004)))
    # Hinged at the BACK of the muzzle so opening swings the chin down instead of
    # scaling the whole snout forward.
    B.append(("jaw", "head", (0.0, 0.520, HEAD_Z - 0.060), (0.0, 0.640, HEAD_Z - 0.090)))

    for sx, sd in ((-1, "L"), (1, "R")):
        # Head kept just under the SURFACE, not buried in the barrel — with it
        # inside the chest, heat weighting handed this bone a share of the rib
        # cage and lifting one paw inverted a third of the mesh.
        B.append((f"scapula_F{sd}", "chest",
                  (sx * 0.098, 0.232, 0.352), (sx * 0.104, 0.222, 0.300)))
        # Follows the cage's PRE-BENT elbow: shoulder 0.224 -> elbow 0.190 ->
        # wrist 0.216. Binding a limb straight leaves IK unable to extend, and
        # the bend depth is what sets the reach headroom the rig reports.
        B.append((f"upper_front_F{sd}", f"scapula_F{sd}",
                  (sx * 0.104, 0.224, 0.300), (sx * 0.110, 0.176, 0.160)))
        B.append((f"forearm_F{sd}", f"upper_front_F{sd}",
                  (sx * 0.110, 0.176, 0.160), (sx * 0.110, 0.216, 0.064)))
        B.append((f"wrist_F{sd}", f"forearm_F{sd}",
                  (sx * 0.110, 0.216, 0.064), (sx * 0.112, 0.222, 0.046)))
        B.append((f"paw_F{sd}", f"wrist_F{sd}",
                  (sx * 0.112, 0.222, 0.046), (sx * 0.112, 0.238, 0.008)))

        B.append((f"thigh_R{sd}", "pelvis",
                  (sx * 0.102, -0.292, 0.298), (sx * 0.108, -0.236, 0.164)))
        B.append((f"shin_R{sd}", f"thigh_R{sd}",
                  (sx * 0.108, -0.236, 0.164), (sx * 0.108, -0.290, 0.078)))
        B.append((f"hock_R{sd}", f"shin_R{sd}",
                  (sx * 0.108, -0.290, 0.078), (sx * 0.110, -0.256, 0.044)))
        B.append((f"ankle_R{sd}", f"hock_R{sd}",
                  (sx * 0.110, -0.256, 0.044), (sx * 0.112, -0.244, 0.028)))
        B.append((f"paw_R{sd}", f"ankle_R{sd}",
                  (sx * 0.112, -0.244, 0.028), (sx * 0.112, -0.238, 0.008)))

        # REQUIRED RIG ADJUSTMENT, documented rather than worked around.
        #
        # The ears were shortened and widened to match the reference (they were
        # the tallest thing on the model — 4,157 extra silhouette pixels in the
        # top front band). The ear bone ran to HEAD_Z + 0.238, which the corrected
        # geometry no longer reaches, and its head sat 0.6mm under the skin. Both
        # ends move: the tip follows the new ear, and the root moves inward so the
        # bone is enclosed rather than lying on the surface.
        B.append((f"ear_{sd}", "head",
                  (sx * 0.132, 0.474, HEAD_Z + 0.126), (sx * 0.178, 0.468, HEAD_Z + 0.202)))

    tail = [(0.0, -0.424, SPINE_Z + 0.060), (0.0, -0.470, SPINE_Z + 0.088),
            (0.0, -0.512, SPINE_Z + 0.106), (0.0, -0.566, SPINE_Z + 0.118),
            (0.0, -0.622, SPINE_Z + 0.120), (0.0, -0.678, SPINE_Z + 0.108),
            (0.0, -0.726, SPINE_Z + 0.086)]
    for i in range(len(tail) - 1):
        B.append((f"tail_{i + 1:02d}", "pelvis" if i == 0 else f"tail_{i:02d}",
                  tail[i], tail[i + 1]))
    return B


# ── authored skin map ───────────────────────────────────────────────────────
# ring group -> {bone: weight}. Weights are normalised per vertex afterwards, so
# these are proportions rather than absolutes.
#
# `{SD}` is substituted with L/R and `{sd}` with the matching limb suffix.
BODY_WEIGHTS = {
    "rump_cap":    {"pelvis": 1.0},
    "rump":        {"pelvis": 1.0},
    "haunch_back": {"pelvis": 1.0},
    "haunch":      {"pelvis": 1.0},
    "hip":         {"pelvis": 0.70, "spine_01": 0.30},
    "lumbar_02":   {"pelvis": 0.30, "spine_01": 0.70},
    "lumbar_01":   {"spine_01": 1.0},
    "waist":       {"spine_01": 0.50, "spine_02": 0.50},
    "rib_back":    {"spine_02": 1.0},
    "rib_mid":     {"spine_02": 0.60, "chest": 0.40},
    "rib_front":   {"chest": 1.0},
    "chest":       {"chest": 1.0},
    "shoulder":    {"chest": 0.70, "neck_01": 0.30},
    "neck_base":   {"chest": 0.28, "neck_01": 0.72},
    "neck_02":     {"neck_01": 1.0},
    "neck_01":     {"neck_01": 0.60, "head": 0.40},
    "head_base":   {"neck_01": 0.18, "head": 0.82},
    "head_back":   {"head": 1.0},
    "head_mid":    {"head": 1.0},
    "brow":        {"head": 1.0},
    "cheek":       {"head": 1.0},
    "muzzle_02":   {"head": 1.0},
    "muzzle_01":   {"head": 1.0},
    "nose":        {"head": 1.0},
}

# Rings whose LOWER half follows the jaw. A cross-section cannot express this on
# its own — the ring at the muzzle contains both the upper lip and the chin — so
# the split is applied by height within the ring at bind time.
JAW_RINGS = {
    "cheek": 0.30,
    "muzzle_02": 0.62,
    "muzzle_01": 0.80,
    "nose": 0.55,
}

FRONT_WEIGHTS = {
    # The armpit was the last pinch in the battery, at the attach ring. Holding
    # more of it with the CHEST and letting the scapula ring carry the transition
    # keeps the shoulder skin on the body when the limb swings up, instead of
    # shearing between two bones that diverge by 56 degrees.
    "attach":   {"chest": 0.74, "scapula_F{SD}": 0.26},
    "scapula":  {"chest": 0.26, "scapula_F{SD}": 0.74},
    "upper_02": {"scapula_F{SD}": 0.34, "upper_front_F{SD}": 0.66},
    "upper_01": {"upper_front_F{SD}": 1.0},
    # Three rings across the elbow rather than a switch at one — this is what
    # stops the joint creasing when it folds past 50 degrees.
    "elbow_up": {"upper_front_F{SD}": 0.76, "forearm_F{SD}": 0.24},
    "elbow":    {"upper_front_F{SD}": 0.50, "forearm_F{SD}": 0.50},
    "elbow_lo": {"upper_front_F{SD}": 0.24, "forearm_F{SD}": 0.76},
    "forearm":  {"forearm_F{SD}": 1.0},
    "wrist_up": {"forearm_F{SD}": 0.70, "wrist_F{SD}": 0.30},
    "wrist":    {"forearm_F{SD}": 0.28, "wrist_F{SD}": 0.72},
    "paw_top":  {"wrist_F{SD}": 0.36, "paw_F{SD}": 0.64},
    "paw_mid":  {"paw_F{SD}": 1.0},
    "paw_sole": {"paw_F{SD}": 1.0},
}

REAR_WEIGHTS = {
    "attach":   {"pelvis": 0.58, "thigh_R{SD}": 0.42},
    "hip":      {"pelvis": 0.16, "thigh_R{SD}": 0.84},
    "thigh_02": {"thigh_R{SD}": 1.0},
    "thigh_01": {"thigh_R{SD}": 1.0},
    "knee_up":  {"thigh_R{SD}": 0.74, "shin_R{SD}": 0.26},
    "knee":     {"thigh_R{SD}": 0.50, "shin_R{SD}": 0.50},
    "knee_lo":  {"thigh_R{SD}": 0.24, "shin_R{SD}": 0.76},
    "shin":     {"shin_R{SD}": 1.0},
    "hock_up":  {"shin_R{SD}": 0.72, "hock_R{SD}": 0.28},
    "hock":     {"shin_R{SD}": 0.42, "hock_R{SD}": 0.58},
    "hock_lo":  {"hock_R{SD}": 1.0},
    "ankle":    {"hock_R{SD}": 0.46, "ankle_R{SD}": 0.54},
    "paw_top":  {"ankle_R{SD}": 0.40, "paw_R{SD}": 0.60},
    "paw_sole": {"paw_R{SD}": 1.0},
}

TAIL_WEIGHTS = {
    "attach":   {"pelvis": 0.62, "tail_01": 0.38},
    "root_02":  {"pelvis": 0.22, "tail_01": 0.78},
    "root_01":  {"tail_01": 0.45, "tail_02": 0.55},
    "tail_03":  {"tail_02": 0.45, "tail_03": 0.55},
    "tail_04":  {"tail_03": 0.45, "tail_04": 0.55},
    "tail_05":  {"tail_04": 0.45, "tail_05": 0.55},
    "tail_06":  {"tail_05": 0.30, "tail_06": 0.70},
}

EAR_WEIGHTS = {
    "attach": {"head": 0.66, "ear_{SD}": 0.34},
    "root":   {"head": 0.30, "ear_{SD}": 0.70},
    "mid":    {"ear_{SD}": 1.0},
    "upper":  {"ear_{SD}": 1.0},
    "tip":    {"ear_{SD}": 1.0},
}


# Explicitly weighted regions that are not rings.
FEATURE_WEIGHTS = {
    # The inside of the mouth rotates with the jaw. A small share stays with the
    # skull so the palate does not shear away from the upper lip.
    "face:mouth_cavity": {"jaw": 0.88, "head": 0.12},
}


def skin_map():
    """Flatten every table into {ring_group_name: {bone: weight}}."""
    out = dict(FEATURE_WEIGHTS)
    for ring, w in BODY_WEIGHTS.items():
        out[f"body:{ring}"] = dict(w)
    for prefix, table, sd in (("frontL", FRONT_WEIGHTS, "L"), ("frontR", FRONT_WEIGHTS, "R"),
                              ("rearL", REAR_WEIGHTS, "L"), ("rearR", REAR_WEIGHTS, "R"),
                              ("earL", EAR_WEIGHTS, "L"), ("earR", EAR_WEIGHTS, "R")):
        for ring, w in table.items():
            out[f"{prefix}:{ring}"] = {b.replace("{SD}", sd): v for b, v in w.items()}
    for ring, w in TAIL_WEIGHTS.items():
        out[f"tail:{ring}"] = dict(w)
    return out
