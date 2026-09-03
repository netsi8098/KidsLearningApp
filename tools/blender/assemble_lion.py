"""
assemble_lion.py — one shippable GLB: cage + rig + clips + face + morphs.

WHY THIS EXISTS
Until now the pipeline produced two disjoint assets. `lion_cage_anim.glb` had
the armature, the authored weights and the Idle/Walk clips but a blank face.
`lion_face_shapes.glb` had the face and all 16 morph targets but no armature,
so `validate-lion-glb.mjs` failed it on 45 bones and 13 clips. Neither file was
the character, and the runtime needs one object it can both pose and emote.

THE ORDER WAS THE PROBLEM, NOT THE MERGE
The first instinct is to merge the two blends — append the face objects and
copy the cage's shape keys across by vertex index. That works only while the
two cages have identical vertex order, which is true today and is exactly the
kind of coupling that breaks silently later.

The cheaper and more robust fix is to reorder the pipeline. `face_lion` and
`face_shapes` both operate on "whichever cage is in the scene", so pointing
them at the RIGGED blend instead of the bare one composes by construction:

    cage_lion -> rig_cage_lion -> anim_cage_lion -> assemble_lion
                                                    |- face_lion build fns
                                                    |- face_shapes.build_morphs
                                                    |- skin the decals
                                                    '- export ONE glb

Nothing is copied between files, so nothing can drift between them.

SKINNING THE FACE: RIGID, AND TO THE RIGHT BONE
The decals are rigid forms. Every vertex of a decal is weighted 1.0 to a single
bone — no blending, because blending is for surfaces that bend and none of
these do. The upper face rides `head`; anything below the mouth line rides
`jaw`, so an open jaw carries the chin and the lower muzzle with it instead of
sliding the cream patch off the face.

The split is measured, not assumed: the mouth line's own height decides it.

Run:
  blender --background art/blender/lion_anim_cage.blend --factory-startup \
    --python tools/blender/assemble_lion.py

Outputs:
  art/blender/lion_assembled.blend
  public/assets/lion/cage/lion.glb        <- the one asset
"""

import json
import os
import sys

import bpy

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import face_lion  # noqa: E402
import face_shapes  # noqa: E402

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
VIEWS = os.path.join(REPO, "art", "blender", "references", "turnaround-views")
FACE_JSON = os.path.join(VIEWS, "face_model.json")
CONTRACT = os.path.join(REPO, "src", "data", "lionRigContract.json")
MANE_BLEND = os.path.join(REPO, "art", "blender", "lion_mane_foundation.blend")
BLEND_OUT = os.path.join(REPO, "art", "blender", "lion_assembled.blend")
GLB_OUT = os.path.join(REPO, "public", "assets", "lion", "cage", "lion.glb")


def find_armature():
    arms = [o for o in bpy.data.objects if o.type == "ARMATURE"]
    if not arms:
        raise SystemExit(
            "[assemble] no armature in the scene — open lion_anim_cage.blend, "
            "not lion_cage.blend")
    return max(arms, key=lambda a: len(a.data.bones))


def skin_rigid(o, arm, bone_name):
    """Weight every vertex of `o` to one bone at 1.0, and bind it.

    Rigid on purpose. A decal is a solid form that rotates whole; smooth
    weights across two bones would shear a pupil in half the moment the jaw
    moved. `export_def_bones` in the rig already guarantees no control bone
    reaches the skin, so the only names available here are deform bones.
    """
    if bone_name not in arm.data.bones:
        raise SystemExit(f"[assemble] no bone '{bone_name}' to skin {o.name} to")
    for vg in list(o.vertex_groups):
        o.vertex_groups.remove(vg)
    vg = o.vertex_groups.new(name=bone_name)
    vg.add(range(len(o.data.vertices)), 1.0, "REPLACE")

    # Parent to the armature WITHOUT the automatic weights operator: it would
    # heat-diffuse over the whole skeleton and undo the group just written.
    o.parent = arm
    o.matrix_parent_inverse = arm.matrix_world.inverted()
    mod = next((m for m in o.modifiers if m.type == "ARMATURE"), None)
    if mod is None:
        mod = o.modifiers.new(name="Armature", type="ARMATURE")
    mod.object = arm
    mod.use_vertex_groups = True
    return bone_name


def append_mane():
    """Bring `LionMane` in from the mane blend.

    THE ONE PLACE THIS FILE COPIES BETWEEN BLENDS, and it is safe where the
    shape-key transfer would not have been: appending geometry carries no
    assumption about vertex ORDER matching anything. A shape key does, which
    is why the cage's morphs are rebuilt here rather than copied.

    The mane has to come from a file because `mane_foundation.py` is a heavy
    separate build that imports the cage itself. It also means the mane must be
    REBUILT after any cage change — it is fitted to the skull it framed.

    Returns None if the mane blend is absent, so the assembly still produces a
    valid (maneless) character rather than failing outright; the caller says so
    loudly.
    """
    if not os.path.exists(MANE_BLEND):
        return None
    before = set(bpy.data.objects)
    try:
        bpy.ops.wm.append(filepath=os.path.join(MANE_BLEND, "Object", "LionMane"),
                          directory=os.path.join(MANE_BLEND, "Object"),
                          filename="LionMane")
    except RuntimeError as exc:
        print(f"[assemble] mane append failed: {exc}")
        return None
    new = [o for o in bpy.data.objects if o not in before]
    mane = next((o for o in new if o.type == "MESH"), None)
    for o in new:
        if o is not mane:
            bpy.data.objects.remove(o, do_unlink=True)
    return mane


def skin_by_height(o, arm, split_h, band):
    """Weight per VERTEX across the jaw line, blending over a measured band.

    Rigid whole-object weighting cannot express the two decals that STRADDLE
    the jaw line. The muzzle spans h 0.3955-0.6315 — chin to above the nose —
    so weighting it entirely to `head` leaves the chin behind when the jaw
    opens, and entirely to `jaw` drags the whole cream mass down over the nose.
    The mouth line is worse: its centre sits EXACTLY at the split, so a
    `centre_z < split_h` test decided it on floating-point noise, and it landed
    on `head` while the build log said `jaw`.

    So these two are weighted the way the cage itself is: the upper lip rides
    the skull, the lower lip rides the jaw, blended across a band. The band is
    the mouth's own measured half-height, not a chosen number.
    """
    for vg in list(o.vertex_groups):
        o.vertex_groups.remove(vg)
    g_head = o.vertex_groups.new(name="head")
    g_jaw = o.vertex_groups.new(name="jaw")
    lo, hi = split_h - band, split_h + band
    for v in o.data.vertices:
        z = (o.matrix_world @ v.co).z
        if z >= hi:
            w_jaw = 0.0
        elif z <= lo:
            w_jaw = 1.0
        else:
            w_jaw = (hi - z) / (hi - lo)
        g_jaw.add([v.index], w_jaw, "REPLACE")
        g_head.add([v.index], 1.0 - w_jaw, "REPLACE")
    o.parent = arm
    o.matrix_parent_inverse = arm.matrix_world.inverted()
    mod = next((m for m in o.modifiers if m.type == "ARMATURE"), None)
    if mod is None:
        mod = o.modifiers.new(name="Armature", type="ARMATURE")
    mod.object = arm
    mod.use_vertex_groups = True


def main():
    fm = json.load(open(FACE_JSON))
    contract = json.load(open(CONTRACT))["morphTargets"]

    arm = find_armature()
    cage = face_lion.cage_object()

    actions = sorted(a.name for a in bpy.data.actions)

    # REST POSE FOR THE WHOLE FACE BUILD.
    #
    # Two things break without this, and both were live on the first run.
    #
    # `Object.ray_cast` uses EVALUATED geometry, so with the armature in pose
    # position at whatever frame the file was saved on, every face part was
    # placed against a deformed cage. It showed as asymmetry the bare cage does
    # not have: the eye planes came out at z 0.6715 and 0.6620 with normals
    # (+0.22,+0.95,+0.23) and (+0.41,+0.83,-0.38), where on the rest cage both
    # sides agree to 0.0007.
    #
    # And `assert_neutral_is_neutral` compares the evaluated mesh with the base
    # mesh. On a skinned mesh the armature is part of that evaluation, so the
    # check can never pass in pose position no matter what the morphs do — it
    # was failing on the deformation, not on a stuck key.
    #
    # Rest position makes the armature an identity transform, which restores
    # both. It goes back to POSE before the export so the clips ship.
    arm.data.pose_position = "REST"
    bpy.context.view_layer.update()
    print(f"[assemble] armature '{arm.name}': {len(arm.data.bones)} bones "
          f"(REST pose for the face build)")
    print(f"[assemble] actions in file: {actions}")
    print(f"[assemble] cage '{cage.name}': {len(cage.data.vertices)} verts, "
          f"{len(cage.vertex_groups)} vertex groups")

    # ---- 0. the coat -----------------------------------------------------
    # `face_lion.main()` paints the cage; the build_* functions do not, so
    # calling them directly left the assembled character WHITE. It showed
    # immediately in a pose render: a colourless body with a painted face on
    # it. The gold is the face aperture's own measured median, the same value
    # `face_lion` uses.
    if cage.data.materials:
        cage.data.materials.clear()
    face_lion.paint(cage, fm["face_aperture"]["srgb01"], finish="matte")
    print(f"[assemble] coat painted {fm['face_aperture']['rgb']} (measured)")

    # ---- 1. the face forms, built onto the rigged cage -----------------
    parts, report = [], []
    face_lion.build_muzzle(cage, fm, parts, report)
    face_lion.build_eyes(cage, fm, parts, report)
    face_lion.build_brows(cage, fm, parts, report)
    face_lion.build_nose_and_mouth(cage, fm, parts, report)
    for line in report:
        print(f"[assemble] {line}")
    print(f"[assemble] built {len(parts)} face parts")

    # ---- 2. skin them ---------------------------------------------------
    # The mouth line's measured height is the head/jaw boundary. A part whose
    # centre sits below it belongs to the jaw.
    split_h = fm["mouth_line"]["h"]
    jaw_bone = "jaw" if "jaw" in arm.data.bones else None
    head_bone = "head" if "head" in arm.data.bones else None
    if head_bone is None:
        raise SystemExit(
            f"[assemble] no 'head' bone; available: "
            f"{sorted(b.name for b in arm.data.bones)[:20]}")
    # The two decals that straddle the jaw line are named, not derived from a
    # threshold: deriving is what put the mouth line on the wrong bone.
    STRADDLES = {"Muzzle", "MouthLine"}
    band = fm["mouth_line"]["half_h_H"]
    print(f"[assemble] head/jaw split at the measured mouth line h={split_h:.4f}, "
          f"blend band ±{band:.4f} (the mouth's measured half-height)")
    if jaw_bone is None:
        raise SystemExit("[assemble] no 'jaw' bone — the lower face cannot be skinned")
    for o in parts:
        centre_z = o.matrix_world.translation.z
        if o.name in STRADDLES:
            skin_by_height(o, arm, split_h, band)
            print(f"[assemble]   {o.name:14s} z={centre_z:.4f} -> head/jaw blend")
        else:
            skin_rigid(o, arm, head_bone)
            print(f"[assemble]   {o.name:14s} z={centre_z:.4f} -> {head_bone}")

    # ---- 2b. the mane -------------------------------------------------
    # A mane is a mass behind and above the skull and it moves with the skull,
    # so it is rigid to `head`. The contract asks for mane_L/mane_top/mane_R
    # follow-through bones; the cage rig has none, so mane overlap is not
    # animatable yet and this is a static mane on a moving head. Said plainly
    # rather than left for someone to discover in the viewer.
    mane = append_mane()
    if mane is None:
        print("[assemble] WARNING no mane appended — the character will ship "
              "without one. Run tools/blender/mane_foundation.py first.")
    else:
        skin_rigid(mane, arm, head_bone)
        # Appended from its own blend the mane arrives with no material, and
        # the first assembly shipped a WHITE mane framing a gold face. Its
        # measured median is (117,55,9) — the auburn `measure_reference`
        # already isolates as the mane cluster.
        mane_rgb = fm.get("mane")
        if mane_rgb:
            mane.data.materials.clear()
            face_lion.paint(mane, mane_rgb["srgb01"], finish="matte")
            print(f"[assemble]   mane painted {mane_rgb['rgb']} (measured)")
        else:
            print("[assemble]   WARNING mane colour not measured — mane is unpainted")
        parts.append(mane)
        print(f"[assemble]   {mane.name:14s} {len(mane.data.vertices)} verts "
              f"-> {head_bone} (rigid; no mane follow-through bones exist)")

    # ---- 3. the morphs, on the rigged cage and the skinned decals -------
    face_shapes.build_morphs(cage, fm, contract)
    face_shapes.assert_neutral_is_neutral()
    face_shapes.report_decal_float(cage, contract)

    # Back to pose position: the clips are the point of shipping one file.
    arm.data.pose_position = "POSE"
    bpy.context.view_layer.update()
    print("[assemble] armature restored to POSE position")

    # ---- 4. verify before exporting ------------------------------------
    problems = []
    for o in [cage] + parts:
        if not any(m.type == "ARMATURE" for m in o.modifiers):
            problems.append(f"{o.name} has no armature modifier")
        if o.parent is not arm and o is not cage:
            problems.append(f"{o.name} is not parented to the armature")
        # Every vertex must be weighted, or it will collapse to the origin
        # when the armature deforms — the classic "exploded mesh" failure.
        weighted = set()
        for v in o.data.vertices:
            if any(g.weight > 0.0 for g in v.groups):
                weighted.add(v.index)
        if len(weighted) != len(o.data.vertices):
            problems.append(
                f"{o.name}: {len(o.data.vertices) - len(weighted)} of "
                f"{len(o.data.vertices)} verts carry no weight")
    if problems:
        for p in problems:
            print(f"[assemble] PROBLEM {p}")
        raise SystemExit(f"[assemble] {len(problems)} skinning problems")

    bpy.ops.wm.save_as_mainfile(filepath=BLEND_OUT)

    # ---- 5. one export --------------------------------------------------
    os.makedirs(os.path.dirname(GLB_OUT), exist_ok=True)
    bpy.ops.object.select_all(action="DESELECT")
    for o in [arm, cage] + parts:
        o.select_set(True)
    bpy.context.view_layer.objects.active = arm
    bpy.ops.export_scene.gltf(
        filepath=GLB_OUT, export_format="GLB", use_selection=True,
        export_apply=False, export_morph=True, export_skins=True,
        export_animations=True, export_normals=True,
        export_materials="EXPORT", export_def_bones=True)

    kb = os.path.getsize(GLB_OUT) / 1024.0
    print("")
    print("===LION_ASSEMBLED===")
    print(f"BLEND={BLEND_OUT}")
    print(f"GLB={GLB_OUT}")
    print(f"KB={kb:.1f}")
    print(f"BONES={len(arm.data.bones)}")
    print(f"ACTIONS={actions}")
    print(f"FACE_PARTS={len(parts)}")
    print(f"CAGE_VERTS={len(cage.data.vertices)}")
    print(f"FACE_VERTS={sum(len(p.data.vertices) for p in parts)}")
    print("===LION_ASSEMBLED_END===")


if __name__ == "__main__":
    main()
