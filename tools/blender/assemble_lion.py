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
BODY_JSON = os.path.join(VIEWS, "body_model.json")
CONTRACT = os.path.join(REPO, "src", "data", "lionRigContract.json")
MANE_BLEND = os.path.join(REPO, "art", "blender", "lion_mane_foundation.blend")
BLEND_OUT = os.path.join(REPO, "art", "blender", "lion_assembled.blend")
GLB_OUT = os.path.join(REPO, "public", "assets", "lion", "cage", "lion.glb")

# Catmull-Clark level for the shipped surface. 1 -> 3,990 verts, 2 -> 15,954.
# The cost is not the geometry, it is that every morph target stores a delta
# per vertex: at L2 that is 15,954 x 16 x 12 bytes ~ 3.1 MB of deltas alone.
SUBDIV_LEVELS = int(os.environ.get("LION_SUBDIV", "2"))


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


def join_by_material(cage, parts, keep_separate=("LionMane",)):
    """Collapse meshes that share a material into one, for draw calls.

    The browser HUD reported 78 draw calls against the 29 the production lock
    records, because 17 meshes are 17 draw calls. But there are only THREE
    materials — colour lives in a per-vertex FLOAT_COLOR attribute and the
    materials differ only in roughness and specular — so same-material meshes
    can be merged with no visual change at all. Vertex colours travel with the
    geometry; vertex groups and shape keys merge by name, which is exactly the
    semantics wanted (a joined mesh's `blink_L` is the union of its members').

    THE MANE STAYS OUT, and the reason is file size rather than looks. glTF
    stores morph deltas densely, so joining the mane's 38,016 verts into a
    group carrying 16 morph targets would write 38,016 x 16 x 12 bytes ~ 7 MB
    of almost entirely zeros. It has no shape keys of its own and one mesh is
    one draw call, so leaving it separate costs a single call and saves the
    lot.
    """
    groups = {}
    for o in [cage] + parts:
        if o.name in keep_separate:
            continue
        mat = o.data.materials[0].name if o.data.materials else "(none)"
        groups.setdefault(mat, []).append(o)

    out = []
    for mat, objs in sorted(groups.items()):
        if len(objs) == 1:
            out.append(objs[0])
            print(f"[assemble] {mat}: 1 mesh, nothing to join")
            continue
        # Biggest mesh is the active one, so the result inherits the cage's
        # name and transform rather than a decal's.
        objs.sort(key=lambda o: len(o.data.vertices), reverse=True)
        before = sum(len(o.data.vertices) for o in objs)
        names = [o.name for o in objs]
        bpy.ops.object.select_all(action="DESELECT")
        for o in objs:
            o.select_set(True)
        bpy.context.view_layer.objects.active = objs[0]
        bpy.ops.object.join()
        res = bpy.context.view_layer.objects.active
        # Name it for what it now is. `join` keeps the active object's name, so
        # the gloss group shipped as "Iris_R" and the ink group as "EyeLid_R" —
        # node names a reviewer and the runtime both read, describing one
        # member of five. The cage keeps its own name; it is still the cage.
        if res.name != "LionCage":
            res.name = f"LionFace_{mat.split('_')[-1]}"
            res.data.name = res.name
        keys = ([k.name for k in res.data.shape_keys.key_blocks if k.name != "Basis"]
                if res.data.shape_keys else [])
        print(f"[assemble] {mat}: joined {len(objs)} -> '{res.name}' "
              f"({before} verts, {len(keys)} morphs, {len(res.vertex_groups)} groups)")
        print(f"[assemble]     from {names}")
        out.append(res)
    return out


def paint_regions(cage, arm, bm):
    """Repaint measured coat regions onto the cage's own vertices.

    NOT DECALS. A face decal is a separate mesh because an eye is a distinct
    object; a coat region is the same skin in a different colour. Since the
    cage is subdivided to 15,954 verts, painting its vertices gives a clean
    enough boundary, costs no extra draw call, and cannot float off the surface
    — which is the failure mode the muzzle needed three passes to fix.

    Regions are selected by BONE GROUP where the rig already knows the part,
    intersected with the measured height where the reference sets an extent.
    A paw is `paw_FL`; how far up the sock goes is a measurement.

    Only three of the five regions asked for are built, because only three are
    in the approved turnaround. See `tools/cad/measure_body.py` for the
    numbers; the short version is that the cheeks measure MORE yellow than the
    forehead where a blush would be redder, and the chest below the mane is a
    desaturated gold at saturation 0.57 rather than the muzzle's cream at 0.38.
    """
    me = cage.data
    attr = me.color_attributes.get(face_lion.COLOR_ATTR)
    if attr is None:
        print("[assemble] no colour attribute on the cage — regions skipped")
        return
    gi = {g.name: g.index for g in cage.vertex_groups}

    def in_group(v, names, min_w=0.5):
        for g in v.groups:
            if g.weight >= min_w and any(gi.get(n) == g.group for n in names):
                return True
        return False

    def apply(name, srgb, pick):
        lin = tuple(face_lion.srgb_to_linear(c) for c in srgb)
        n = 0
        for v in me.vertices:
            if pick(v):
                attr.data[v.index].color = (*lin, 1.0)
                n += 1
        print(f"[assemble]   region {name:11s} {n:5d} verts  srgb={[round(c*255) for c in srgb]}")
        return n

    total = 0
    paw = bm.get("paw")
    if paw:
        # Bone group AND the measured ceiling: the paw bone owns the whole
        # foot, and the reference says the cream stops at h 0.0849.
        total += apply("paw", paw["srgb01"], lambda v: (
            in_group(v, ("paw_FL", "paw_FR", "paw_RL", "paw_RR"), 0.35)
            and v.co.z <= paw["h_top"]))

    # The inner ear is NOT painted here any more. The ears left the cage when
    # they became their own meshes, so `ear_L`/`ear_R` own no cage vertices and
    # this selected 0 of them — which read like a failure rather than a move.
    # `face_lion.build_ears` applies the same measured colour by the same
    # forward-facing-normal test, on the geometry that now carries it.
    ear = None
    if ear:
        # The INNER surface only — the ear's outer back stays coat-coloured.
        # A forward-facing normal is what distinguishes them, and it is the
        # same test the reference view implies: the inner ear is what the
        # front view can see.
        total += apply("inner_ear", ear["srgb01"], lambda v: (
            in_group(v, ("ear_L", "ear_R"), 0.35) and v.normal.y > 0.15))

    tuft = bm.get("tail_tuft")
    if tuft:
        total += apply("tail_tuft", tuft["srgb01"], lambda v: (
            in_group(v, ("tail_05", "tail_06"), 0.35)))

    me.update()
    print(f"[assemble] {total} cage verts repainted from body_model.json "
          f"(inner ear now lives on the ear meshes) "
          f"(cheek blush and cream chest bib are NOT in the reference — "
          f"see measure_body.py)")


def subdivide(cage, levels):
    """Catmull-Clark the cage, destructively, before anything reads its surface.

    THE CAGE IS 1,000 VERTS. That is right for a deformation cage and wrong for
    a render mesh: shipped raw it reads faceted everywhere, and no amount of
    decal work fixes a body whose silhouette is visibly polygonal. The whole
    point of authoring a quad cage is that it subdivides cleanly.

    ORDER MATTERS, twice over.

    Before the face parts, because they are placed by ray-casting the skin and
    Catmull-Clark pulls the surface INWARD toward the hull — conform against
    the coarse cage and every decal floats again once it smooths.

    Before the morphs, because glTF has no subdivision, so this has to be baked
    — and Blender's exporter cannot both apply modifiers and export shape keys.
    Authoring the morphs on the already-dense mesh is what makes them coexist.
    It also means the morph deltas are 16x the dense vertex count, which is the
    real cost here and the reason the level is a parameter rather than a 2.

    Vertex groups interpolate under subdivision, so the authored ring-to-bone
    weights survive; the cage carries no shape keys at this point, which is
    what allows the modifier to be applied at all.
    """
    before_v, before_f = len(cage.data.vertices), len(cage.data.polygons)
    bpy.ops.object.select_all(action="DESELECT")
    cage.select_set(True)
    bpy.context.view_layer.objects.active = cage
    mod = cage.modifiers.new(name="Subdivision", type="SUBSURF")
    mod.levels = mod.render_levels = levels
    mod.use_limit_surface = False
    bpy.ops.object.modifier_apply(modifier=mod.name)
    print(f"[assemble] cage subdivided L{levels}: {before_v} -> "
          f"{len(cage.data.vertices)} verts, {before_f} -> "
          f"{len(cage.data.polygons)} faces, "
          f"{len(cage.vertex_groups)} vertex groups preserved")


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

    # Same idempotence guard as `face_lion.main()`: without it, running the
    # assembler on its own output duplicates all 15 parts as `.001`.
    face_lion.purge_face_parts()

    # ---- 0a. smooth the render surface -------------------------------
    subdivide(cage, SUBDIV_LEVELS)

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
    if os.path.exists(BODY_JSON):
        paint_regions(cage, arm, json.load(open(BODY_JSON)))
    else:
        print("[assemble] no body_model.json — run tools/cad/measure_body.py")

    # ---- 1. the face forms, built onto the rigged cage -----------------
    parts, report = [], []
    face_lion.build_muzzle(cage, fm, parts, report)
    face_lion.build_eyes(cage, fm, parts, report)
    face_lion.build_brows(cage, fm, parts, report)
    face_lion.build_nose_and_mouth(cage, fm, parts, report)
    body = json.load(open(BODY_JSON)) if os.path.exists(BODY_JSON) else {}
    face_lion.build_ears(cage, fm, body, parts, report)
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
    # The ears ride their own bones so the rig can perk them — GATE 15's
    # storyboard opens with exactly that beat.
    EAR_BONE = {"Ear_R": "ear_R", "Ear_L": "ear_L"}
    # The EYEBALL rides its eye bone so gaze can move it. The LID does not —
    # a lid slides OVER an eyeball, so it belongs to the skull, and `blink_L`
    # is a morph on it. Skinning the lid to the eye would carry it along with
    # the gaze and the blink would follow the pupil around the face.
    # THE SCLERA STAYS ON THE HEAD. Only the iris, pupil and catchlight ride
    # the eye bone.
    #
    # Skinning the sclera to the eye rotated the WHITE along with the gaze, so
    # the whole assembly swung as a unit and at 24 degrees the white ended up
    # on the wrong side of the socket with the iris hanging off its edge. On a
    # flat-disc eye the sclera IS the aperture — it belongs to the skull, and
    # the iris slides across it, which is also how a real eye reads.
    #
    # Travel budget: the sclera is 0.0890 half-wide and the iris radius is
    # 0.0290, so the iris centre may move 0.060 before its edge reaches the
    # white's. The bone is 0.070 long, so that is 0.070*sin(theta) < 0.060 —
    # about 59 degrees. The 24 degrees rendered uses 0.028 of the 0.060.
    EYE_BONE = {}
    for sd in ("R", "L"):
        for part in ("Iris", "Pupil", "Catchlight"):
            EYE_BONE[f"{part}_{sd}"] = f"eye_{sd}"
    band = fm["mouth_line"]["half_h_H"]
    print(f"[assemble] head/jaw split at the measured mouth line h={split_h:.4f}, "
          f"blend band ±{band:.4f} (the mouth's measured half-height)")
    if jaw_bone is None:
        raise SystemExit("[assemble] no 'jaw' bone — the lower face cannot be skinned")
    for o in parts:
        centre_z = o.matrix_world.translation.z
        if o.name in EAR_BONE:
            skin_rigid(o, arm, EAR_BONE[o.name])
            print(f"[assemble]   {o.name:14s} z={centre_z:.4f} -> {EAR_BONE[o.name]}")
        elif o.name in EYE_BONE and EYE_BONE[o.name] in arm.data.bones:
            skin_rigid(o, arm, EYE_BONE[o.name])
            print(f"[assemble]   {o.name:14s} z={centre_z:.4f} -> {EYE_BONE[o.name]}")
        elif o.name in STRADDLES:
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

    # ---- 3b. collapse to one mesh per material -------------------------
    # After the morphs, so the keys exist to be merged, and after skinning, so
    # the vertex groups do too — and STILL IN REST POSITION, because the
    # neutral re-check below is the whole point of doing it here. Run after the
    # POSE restore it failed on the armature deformation, silently, exactly the
    # trap documented at the top of this function.
    mane_obj = next((o for o in parts if o.name == "LionMane"), None)
    meshes = join_by_material(cage, parts)
    if mane_obj is not None:
        meshes.append(mane_obj)
    cage = max(meshes,
               key=lambda o: -1 if o is mane_obj else len(o.data.vertices))
    parts = [o for o in meshes if o is not cage]
    # Joining rewrites shape keys; re-assert that neutral is still neutral.
    face_shapes.assert_neutral_is_neutral()

    # Back to pose position: the clips are the point of shipping one file.
    arm.data.pose_position = "POSE"
    bpy.context.view_layer.update()
    print("[assemble] armature restored to POSE position")

    # ---- 4. verify before exporting ------------------------------------
    problems = []
    for o in meshes:
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
    for o in [arm] + meshes:
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
    print(f"MESHES={len(meshes)}  (one draw call each)")
    print(f"MESH_NAMES={[o.name for o in meshes]}")
    print(f"TOTAL_VERTS={sum(len(o.data.vertices) for o in meshes)}")
    print("===LION_ASSEMBLED_END===")


if __name__ == "__main__":
    main()
