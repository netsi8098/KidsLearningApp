"""
deform_qa_lion.py — prove the cage deforms before trusting it with a rig.

The brief is explicit that "weight painting will fix it later" is not an answer,
because topology problems and weighting problems are different failures. So this
runs the extreme-pose battery against the cage and MEASURES the result.

The measurement is the point. Judging pinching from a render is how the last
several passes were spent, and it is unreliable — a crease reads differently
depending on the light. Instead, for every pose:

  * every face's deformed area is compared to its REST area;
  * a face that collapses below a quarter of its rest area is a pinch;
  * a face whose normal flips relative to rest is an inversion.

Both are counted and located. A pose either passes with numbers or it does not.

The armature built here is the production hierarchy from the brief, so if the
cage passes, this same skeleton carries forward — the QA rig and the real rig
are not two different things.

Run:
  blender --background art/blender/lion_cage.blend \
    --factory-startup --python tools/blender/deform_qa_lion.py

Outputs:
  art/blender/lion_cage_qa.blend
  docs/assets/lion-deform/{pose}.png
"""

import math
import os
import sys

import bpy
from mathutils import Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lion_contract import HEAD_Z, SPINE_Z  # noqa: E402

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
BLEND_OUT = os.path.join(REPO, "art", "blender", "lion_cage_qa.blend")
PREVIEW_DIR = os.path.join(REPO, "docs", "assets", "lion-deform")

PINCH = 0.25          # face area below this fraction of rest counts as a pinch
SEVERE = 0.10


# ── production skeleton ─────────────────────────────────────────────────────
# (name, parent, head, tail). Named exactly as the brief specifies so the
# runtime can reason about it, and so the deform skeleton is separable from any
# animator control widgets added later.
def skeleton():
    B = []

    B.append(("root", None, (0.0, -0.10, 0.010), (0.0, -0.10, 0.110)))
    B.append(("pelvis", "root", (0.0, -0.336, SPINE_Z + 0.000), (0.0, -0.216, SPINE_Z - 0.006)))
    B.append(("spine_01", "pelvis", (0.0, -0.216, SPINE_Z - 0.006), (0.0, -0.076, SPINE_Z - 0.004)))
    B.append(("spine_02", "spine_01", (0.0, -0.076, SPINE_Z - 0.004), (0.0, 0.072, SPINE_Z + 0.004)))
    B.append(("chest", "spine_02", (0.0, 0.072, SPINE_Z + 0.004), (0.0, 0.244, SPINE_Z + 0.052)))
    B.append(("neck_01", "chest", (0.0, 0.244, SPINE_Z + 0.052), (0.0, 0.372, SPINE_Z + 0.272)))
    B.append(("head", "neck_01", (0.0, 0.372, SPINE_Z + 0.272), (0.0, 0.494, HEAD_Z + 0.004)))
    # Jaw hinges at the back of the muzzle so opening it swings the chin down
    # instead of scaling the whole muzzle.
    B.append(("jaw", "head", (0.0, 0.520, HEAD_Z - 0.060), (0.0, 0.640, HEAD_Z - 0.090)))

    for sx, sd in ((-1, "L"), (1, "R")):
        # Head kept just under the SURFACE, not buried in the barrel. With it at
        # x=0.086 inside the chest, heat-map weighting handed this bone a large
        # share of the rib cage and lifting the paw inverted a third of the mesh.
        B.append((f"scapula_F{sd}", "chest",
                  (sx * 0.098, 0.232, 0.352), (sx * 0.104, 0.222, 0.300)))
        B.append((f"upper_front_F{sd}", f"scapula_F{sd}",
                  (sx * 0.104, 0.222, 0.300), (sx * 0.110, 0.208, 0.160)))
        B.append((f"forearm_F{sd}", f"upper_front_F{sd}",
                  (sx * 0.110, 0.208, 0.160), (sx * 0.110, 0.214, 0.064)))
        B.append((f"wrist_F{sd}", f"forearm_F{sd}",
                  (sx * 0.110, 0.214, 0.064), (sx * 0.112, 0.222, 0.046)))
        B.append((f"paw_F{sd}", f"wrist_F{sd}",
                  (sx * 0.112, 0.222, 0.046), (sx * 0.112, 0.238, 0.008)))

        B.append((f"thigh_R{sd}", "pelvis",
                  (sx * 0.102, -0.292, 0.298), (sx * 0.108, -0.248, 0.164)))
        B.append((f"shin_R{sd}", f"thigh_R{sd}",
                  (sx * 0.108, -0.248, 0.164), (sx * 0.108, -0.278, 0.078)))
        B.append((f"hock_R{sd}", f"shin_R{sd}",
                  (sx * 0.108, -0.278, 0.078), (sx * 0.110, -0.256, 0.044)))
        B.append((f"ankle_R{sd}", f"hock_R{sd}",
                  (sx * 0.110, -0.256, 0.044), (sx * 0.112, -0.244, 0.028)))
        B.append((f"paw_R{sd}", f"ankle_R{sd}",
                  (sx * 0.112, -0.244, 0.028), (sx * 0.112, -0.238, 0.008)))

        B.append((f"ear_{sd}", "head",
                  (sx * 0.148, 0.474, HEAD_Z + 0.148), (sx * 0.178, 0.468, HEAD_Z + 0.238)))

    tail = [(0.0, -0.424, SPINE_Z + 0.060), (0.0, -0.470, SPINE_Z + 0.088),
            (0.0, -0.512, SPINE_Z + 0.106), (0.0, -0.566, SPINE_Z + 0.118),
            (0.0, -0.622, SPINE_Z + 0.120), (0.0, -0.678, SPINE_Z + 0.108),
            (0.0, -0.726, SPINE_Z + 0.086)]
    for i in range(len(tail) - 1):
        B.append((f"tail_{i + 1:02d}", "pelvis" if i == 0 else f"tail_{i:02d}",
                  tail[i], tail[i + 1]))
    return B


def build_armature():
    arm_data = bpy.data.armatures.new("LionRig")
    arm = bpy.data.objects.new("LionRig", arm_data)
    bpy.context.scene.collection.objects.link(arm)
    bpy.context.view_layer.objects.active = arm
    bpy.ops.object.mode_set(mode="EDIT")

    created = {}
    for name, parent, head, tail in skeleton():
        b = arm_data.edit_bones.new(name)
        b.head = Vector(head)
        b.tail = Vector(tail)
        created[name] = b
        if parent:
            b.parent = created[parent]
            b.use_connect = False
    bpy.ops.object.mode_set(mode="OBJECT")
    print(f"[qa] armature: {len(created)} bones")
    return arm


def bind(cage, arm):
    """Automatic weights as a STARTING POINT, then cleaned.

    Raw heat-map weights are not a baseline you can judge topology against: they
    hand distant bones a share of every vertex, so a pose failure cannot be
    attributed to the cage or to the weighting. `root` is excluded from
    deformation entirely — it sits inside the belly purely as a transform handle,
    and letting it deform meant the abdomen followed the character controller.

    The clean-up is deliberately generic (limit influences, drop near-zero
    weights, smooth islands). It is not hand painting — that is GATE 6 — but it
    is enough that a remaining failure is attributable.
    """
    for b in arm.data.bones:
        if b.name == "root":
            b.use_deform = False

    bpy.ops.object.select_all(action="DESELECT")
    cage.select_set(True)
    arm.select_set(True)
    bpy.context.view_layer.objects.active = arm
    bpy.ops.object.parent_set(type="ARMATURE_AUTO")

    bpy.ops.object.select_all(action="DESELECT")
    cage.select_set(True)
    bpy.context.view_layer.objects.active = cage
    # Four influences per vertex is the glTF limit anyway, so enforcing it here
    # also means what is tested is what ships.
    bpy.ops.object.vertex_group_limit_total(limit=4)
    bpy.ops.object.vertex_group_clean(group_select_mode="ALL", limit=0.004)
    # vertex_group_smooth only polls in weight-paint or edit mode.
    bpy.ops.object.mode_set(mode="WEIGHT_PAINT")
    bpy.ops.object.vertex_group_smooth(group_select_mode="ALL", factor=0.30, repeat=1)
    bpy.ops.object.mode_set(mode="OBJECT")
    bpy.ops.object.vertex_group_normalize_all(lock_active=False)
    groups = [g.name for g in cage.vertex_groups]
    print(f"[qa] weights: {len(groups)} groups, limited to 4 influences, smoothed")


# ── measurement ─────────────────────────────────────────────────────────────
def face_stats(obj):
    """Per-face (area, normal, centre) of the EVALUATED (deformed) mesh."""
    deps = bpy.context.evaluated_depsgraph_get()
    ev = obj.evaluated_get(deps)
    me = ev.to_mesh()
    out = [(p.area, Vector(p.normal).copy(), Vector(p.center).copy()) for p in me.polygons]
    ev.to_mesh_clear()
    return out


def dominant_bones(cage, arm):
    """The bone that owns each face, by summed vertex weight.

    Needed to judge inversion honestly. Comparing a deformed face normal to its
    REST normal in world space flags every face on a limb that swings more than
    90 degrees — the underside of a forearm rotating 100 degrees genuinely does
    point the other way, and that is rotation, not inversion. The only
    meaningful question is whether the face flipped RELATIVE TO THE BONE
    carrying it, so each face needs to know its bone.
    """
    bone_of_group = {}
    names = {b.name for b in arm.data.bones}
    for vg in cage.vertex_groups:
        if vg.name in names:
            bone_of_group[vg.index] = vg.name

    weights = []
    for v in cage.data.vertices:
        w = {}
        for g in v.groups:
            b = bone_of_group.get(g.group)
            if b:
                w[b] = w.get(b, 0.0) + g.weight
        weights.append(w)

    out = []
    for poly in cage.data.polygons:
        tally = {}
        for vi in poly.vertices:
            for b, w in weights[vi].items():
                tally[b] = tally.get(b, 0.0) + w
        out.append(max(tally, key=tally.get) if tally else None)
    return out


def bone_deltas(arm):
    """Rest-to-pose transform per bone, for un-rotating a face normal."""
    out = {}
    for pb in arm.pose.bones:
        try:
            out[pb.name] = (pb.matrix @ pb.bone.matrix_local.inverted()).to_3x3()
        except ValueError:
            pass
    return out


def compare(rest, now, label, face_bone=None, deltas=None):
    pinched, flipped, worst, worst_i = 0, 0, 1.0, -1
    hot = []
    for i, ((ra, rn, _rc), (na, nn, nc)) in enumerate(zip(rest, now)):
        if ra <= 1e-9:
            continue
        ratio = na / ra
        if ratio < worst:
            worst, worst_i = ratio, i
        if ratio < PINCH:
            pinched += 1
            hot.append((ratio, nc))
        if rn.length > 1e-6 and nn.length > 1e-6:
            expected = rn.normalized()
            if face_bone and deltas:
                b = face_bone[i] if i < len(face_bone) else None
                m = deltas.get(b) if b else None
                if m:
                    rotated = m @ rn
                    if rotated.length > 1e-6:
                        expected = rotated.normalized()
            if expected.dot(nn.normalized()) < -0.2:
                flipped += 1
    severe = sum(1 for (ra, *_r), (na, *_n) in zip(rest, now) if ra > 1e-9 and na / ra < SEVERE)
    verdict = "PASS" if (pinched == 0 and flipped == 0) else ("FAIL" if severe else "WARN")
    print(f"[qa] {label:22} worst_area={worst:.3f} pinched={pinched} "
          f"severe={severe} flipped={flipped}  {verdict}")
    # Locate the collapses. Three attempts at the mouth were spent guessing
    # which faces were pinching from a render; a coordinate ends that.
    for ratio, c in sorted(hot)[:4]:
        print(f"[qa]     pinch {ratio:.3f} at ({c.x:.3f}, {c.y:.3f}, {c.z:.3f})")
    return {"label": label, "worst": worst, "pinched": pinched,
            "severe": severe, "flipped": flipped, "verdict": verdict,
            "worst_face": worst_i}


def set_pose(arm, poses):
    for pb in arm.pose.bones:
        pb.rotation_mode = "XYZ"
        pb.rotation_euler = (0.0, 0.0, 0.0)
        pb.location = (0.0, 0.0, 0.0)
    for name, rot in poses.items():
        pb = arm.pose.bones.get(name)
        if pb is None:
            raise SystemExit(f"[qa] no bone {name!r}")
        pb.rotation_mode = "XYZ"
        pb.rotation_euler = [math.radians(a) for a in rot]
    bpy.context.view_layer.update()


# ── the battery ─────────────────────────────────────────────────────────────
def poses():
    """The twelve tests from the brief, as bone rotations in degrees.

    Angles are DELTAS from the rest pose, so they had to be re-based when the
    cage gained pre-bent elbows and knees (needed to give IK extension
    headroom). The elbow now starts ~14 degrees bent and the stifle ~16, so the
    original deltas produced a fold well past anything the character can reach —
    the leg passed through itself and the metric correctly reported inverted
    faces. These values reproduce the same ABSOLUTE extreme as before, not a
    softer test.
    """
    both_front = ("upper_front_FL", "upper_front_FR")
    both_rear = ("thigh_RL", "thigh_RR")

    def deep_crouch():
        p = {"pelvis": (-16, 0, 0), "spine_01": (-6, 0, 0), "chest": (10, 0, 0)}
        for b in both_rear:
            p[b] = (48, 0, 0)
        for b in ("shin_RL", "shin_RR"):
            p[b] = (-50, 0, 0)
        for b in ("hock_RL", "hock_RR"):
            p[b] = (40, 0, 0)
        for b in both_front:
            p[b] = (34, 0, 0)
        for b in ("forearm_FL", "forearm_FR"):
            p[b] = (-40, 0, 0)
        return p

    return [
        ("01-neutral", {}, "side"),
        ("02-deep-crouch", deep_crouch(), "side"),
        ("03-front-paw-lifted", {"scapula_FR": (-18, 0, 0), "upper_front_FR": (-56, 0, -10),
                                 "forearm_FR": (-44, 0, 0), "wrist_FR": (-20, 0, 0),
                                 "chest": (0, 0, -6), "pelvis": (0, 0, -3)}, "three-quarter"),
        ("04-front-leg-forward", {"scapula_FR": (-22, 0, 0), "upper_front_FR": (-46, 0, 0),
                                  "forearm_FR": (14, 0, 0)}, "side"),
        ("05-front-leg-back", {"scapula_FR": (16, 0, 0), "upper_front_FR": (42, 0, 0),
                               "forearm_FR": (-18, 0, 0)}, "side"),
        ("06-rear-leg-compressed", {"thigh_RR": (52, 0, 0), "shin_RR": (-56, 0, 0),
                                    "hock_RR": (44, 0, 0), "ankle_RR": (-14, 0, 0)}, "side"),
        ("07-rear-leg-extended", {"thigh_RR": (-34, 0, 0), "shin_RR": (18, 0, 0),
                                  "hock_RR": (-22, 0, 0)}, "side"),
        ("08-head-turned", {"neck_01": (0, 0, 34), "head": (0, 0, 40),
                            "ear_L": (0, 0, 14), "ear_R": (0, 0, 14)}, "three-quarter"),
        ("09-head-tilted", {"neck_01": (0, 24, 0), "head": (0, 26, 0)}, "front"),
        ("10-mouth-open", {"jaw": (34, 0, 0)}, "face"),
        ("11-smile", {"jaw": (8, 0, 0), "head": (-3, 0, 0)}, "face"),
        ("12-neck-full-nod", {"neck_01": (-26, 0, 0), "head": (-30, 0, 0)}, "side"),
    ]


# ── render ──────────────────────────────────────────────────────────────────
VIEWS = {
    "front": (180, 0.10, 2.9, (0.0, 0.02, 0.52)),
    "side": (90, 0.10, 2.9, (0.0, 0.02, 0.52)),
    "three-quarter": (142, 0.20, 2.9, (0.0, 0.02, 0.52)),
    "face": (180, 0.02, 0.90, (0.0, 0.50, HEAD_Z - 0.01)),
}


def setup_render(cage):
    sc = bpy.context.scene
    sc.render.engine = "BLENDER_EEVEE"
    sc.render.resolution_x = 620
    sc.render.resolution_y = 620
    sc.view_settings.view_transform = "Standard"
    os.makedirs(PREVIEW_DIR, exist_ok=True)

    w = bpy.data.worlds.new("QAWorld")
    w.use_nodes = True
    w.node_tree.nodes["Background"].inputs[0].default_value = (0.09, 0.10, 0.12, 1)
    sc.world = w

    surf = bpy.data.materials.new("QASurf")
    surf.use_nodes = True
    b = surf.node_tree.nodes.get("Principled BSDF")
    b.inputs["Base Color"].default_value = (0.66, 0.63, 0.58, 1)
    b.inputs["Roughness"].default_value = 0.68
    cage.data.materials.clear()
    cage.data.materials.append(surf)

    wire = bpy.data.materials.new("QAWire")
    wire.use_nodes = True
    wb = wire.node_tree.nodes.get("Principled BSDF")
    wb.inputs["Base Color"].default_value = (0.03, 0.03, 0.04, 1)
    cage.data.materials.append(wire)
    wf = cage.modifiers.new("Wire", "WIREFRAME")
    wf.thickness = 0.0026
    wf.use_replace = False
    wf.material_offset = 1
    # CRITICAL: off in the viewport, on in renders.
    #
    # `to_mesh()` evaluates through the VIEWPORT depsgraph, so with this modifier
    # enabled there the measurement was reading the wireframe's thin edge strips
    # rather than the cage. Their normals swing wildly under any deformation,
    # which is where "311 flipped faces" came from — a third of the mesh
    # supposedly inverting when lifting one paw. The metric was measuring the
    # wrong geometry entirely.
    wf.show_viewport = False
    wf.show_render = True

    for name, loc, energy in (("K", (2.3, -2.1, 2.5), 240), ("F", (-2.7, -1.3, 1.3), 85),
                              ("R", (-0.4, 2.9, 2.1), 110)):
        d = bpy.data.lights.new(name, "AREA")
        d.energy = energy
        d.size = 6.0
        o = bpy.data.objects.new(name, d)
        o.location = loc
        o.rotation_euler = (Vector((0, 0, 0.5)) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
        sc.collection.objects.link(o)

    cd = bpy.data.cameras.new("QACam")
    cam = bpy.data.objects.new("QACam", cd)
    sc.collection.objects.link(cam)
    sc.camera = cam
    return cam


def shoot(cam, view, path):
    yaw, elev, dist, target = VIEWS[view]
    cam.data.lens = 92.0 if view == "face" else 62.0
    t = Vector(target)
    a = math.radians(yaw)
    cam.location = (t.x + math.sin(a) * dist, t.y - math.cos(a) * dist, t.z + dist * elev)
    cam.rotation_euler = (t - Vector(cam.location)).to_track_quat("-Z", "Y").to_euler()
    bpy.context.scene.render.filepath = path
    bpy.ops.render.render(write_still=True)


def main():
    cage = bpy.data.objects.get("LionCage")
    if cage is None:
        raise SystemExit("LionCage not found — run cage_lion.py first")

    # Re-usable against an ALREADY RIGGED file. Running the battery on the
    # production rig is the only way to tell whether authored weights actually
    # improved on the automatic baseline — rebuilding and re-binding here would
    # throw away the thing being measured.
    arm = bpy.data.objects.get("LionRig")
    if arm and any(vg.name in {b.name for b in arm.data.bones} for vg in cage.vertex_groups):
        print(f"[qa] using existing rig: {len(arm.data.bones)} bones, "
              f"{len(cage.vertex_groups)} weighted groups")
    else:
        arm = build_armature()
        bind(cage, arm)

    bpy.context.view_layer.objects.active = arm
    bpy.ops.object.mode_set(mode="POSE")

    # The battery poses bones DIRECTLY. Live IK constraints would drag those
    # bones back toward their targets and the measurement would describe the
    # solver rather than the skinning.
    muted = 0
    for pb in arm.pose.bones:
        for c in pb.constraints:
            if c.type == "IK":
                c.mute = True
                muted += 1
    if muted:
        print(f"[qa] muted {muted} IK constraints for direct-pose testing")

    cam = setup_render(cage)

    set_pose(arm, {})
    rest = face_stats(cage)
    face_bone = dominant_bones(cage, arm)

    results = []
    for name, pose, view in poses():
        set_pose(arm, pose)
        results.append(compare(rest, face_stats(cage), name, face_bone, bone_deltas(arm)))
        shoot(cam, view, os.path.join(PREVIEW_DIR, f"{name}.png"))

    set_pose(arm, {})
    bpy.ops.object.mode_set(mode="OBJECT")
    bpy.ops.wm.save_as_mainfile(filepath=BLEND_OUT)

    fails = [r for r in results if r["verdict"] == "FAIL"]
    warns = [r for r in results if r["verdict"] == "WARN"]
    print("\n===DEFORM_QA===")
    print(f"POSES={len(results)} PASS={len(results) - len(fails) - len(warns)} "
          f"WARN={len(warns)} FAIL={len(fails)}")
    print(f"WORST_AREA_RATIO={min(r['worst'] for r in results):.3f}")
    print(f"TOTAL_PINCHED={sum(r['pinched'] for r in results)}")
    print(f"TOTAL_FLIPPED={sum(r['flipped'] for r in results)}")
    for r in fails + warns:
        print(f"NEEDS_WORK={r['label']} worst={r['worst']:.3f} "
              f"pinched={r['pinched']} severe={r['severe']} flipped={r['flipped']}")
    print("===DEFORM_QA_END===")


if __name__ == "__main__":
    main()
