"""lion_contract — the single source of truth for the lion's proportions.

Every stage of the pipeline (silhouette, retopology, detail, rig) places things
against these numbers. They used to be COPIED into each script, and the copies
silently drifted: after the proportion pass moved the belly from 0.41 to 0.21,
detail_lion.py was still probing for a head at z = 0.80 and painting a belly
strip at z = 0.41 — coordinates that no longer existed on the mesh. Nothing
errors when that happens; features simply land in the wrong place and the
failure only shows up in a render, which is the most expensive place to find it.

Importing beats duplicating. Any stage that needs a proportion imports it here.

MEASURED off art/blender/references/turnaround-approved/lion-four-view.png.
Front view spans y 15..500 (H = 485px); side view spans y 20..510 (H = 490px).
Read against total height:

    mane crown ........ 1.00 H       the mane is 77% of the whole figure
    mane bottom ....... 0.22 H
    back line ......... 0.43 H
    belly line ........ 0.19 H
    paw tops .......... 0.09 H
    head centre ....... 0.67 H
    mane width ........ 0.68 H       the mane, not the body, is the widest part
    head width ........ 0.42 H
    body length ....... 0.57 H
"""

TOTAL_H = 1.10
GROUND = 0.0

BELLY_Z = 0.21          # underside of the barrel   (0.19 H)
SPINE_Z = 0.375         # centre line of the body
SHOULDER_Z = 0.445      # withers
HEAD_Z = 0.735          # head centre               (0.67 H)
MANE_TOP = 1.10         # crown of the mane == total height
LEG_LEN = BELLY_Z       # ground to belly

BODY_FRONT_Y = 0.21     # chest, sitting behind the mane mass
BODY_BACK_Y = -0.37     # pelvis
HEAD_Y = 0.44           # head is well forward, not perched over the chest

# The mane is a HOOD: a mass behind and above the skull, with slender side lobes
# framing the cheeks and an opening the face projects through.
MANE_Y = HEAD_Y - 0.260
MANE_Z = HEAD_Z - 0.030

# Radii. (x, z) per skin vertex where the Skin modifier is used.
R_HEAD = 0.225          # 0.42 H across
R_MANE = 0.300
R_MUZZLE = 0.118
R_NECK = 0.118
R_CHEST = 0.162         # back at 0.47 H, belly at 0.19 H
R_WAIST = 0.148
R_HIP = 0.170
R_LEG_TOP = 0.092
R_LEG_MID = 0.083
R_PAW = 0.086
R_TAIL = 0.048
R_TUFT = 0.105
