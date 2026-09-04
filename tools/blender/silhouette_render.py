"""
silhouette_render.py — render any mesh from the locked reference cameras.

Reusable QA harness. Takes a blend, an object (or objects), and an output folder,
and renders flat white-on-black masks from the four reference viewpoints using the
alignment contract in reference_model.json. The result drops straight into
tools/cad/silhouette_qa.py.

The mesh is auto-fitted to the reference frame first: scaled so its height is H
and translated so its lowest point sits on the ground. Comparing silhouettes only
means anything if both are in the same frame, and different assets arrive at
different scales.

Usage:
  blender --background <file.blend> --factory-startup \
    --python tools/blender/silhouette_render.py -- <OutName> <objects,comma,sep>
"""
import json, math, os, sys
import bpy
from mathutils import Vector

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
VIEWS = os.path.join(REPO, "art", "blender", "references", "turnaround-views")
MODEL = json.load(open(os.path.join(VIEWS, "reference_model.json")))
CANVAS, HPX, GROUND_ROW = MODEL["canvas"], MODEL["h_px"], MODEL["ground_row"]
SPAN = CANVAS / HPX
CZ = (GROUND_ROW - CANVAS / 2) / HPX

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
OUT_NAME = argv[0] if argv else "model"
WANT = [n for n in (argv[1].split(",") if len(argv) > 1 else []) if n]
OUT = os.path.join(REPO, "art", "blender", "references", f"silhouette-{OUT_NAME}")

# Camera distance for a PERSPECTIVE render, in camera-ring units. 0 (the
# default) keeps the orthographic camera the whole QA history was measured with,
# bit-identical. See the block in `main` for why this exists.
PERSP = float(os.environ.get("LION_SIL_PERSP", "0"))

# Front is read from +Y; the side is read from -X so image-right runs along -Y and
# the nose lands on the LEFT, matching the reference. Three-quarter mirrors the
# reference sheet's own 3/4 angle.
def _tq(deg):
    """3/4 camera at `deg` from straight-on, at radius 3.0."""
    a = math.radians(deg)
    return ((-3.0 * math.sin(a), 3.0 * math.cos(a), CZ),
            (math.radians(90), 0.0, math.radians(180 + deg)))


CAMS = {
    "front": ((0.0, 3.0, CZ), (math.radians(90), 0.0, math.radians(180))),
    "rear": ((0.0, -3.0, CZ), (math.radians(90), 0.0, 0.0)),
    "side": ((-3.0, 0.0, CZ), (math.radians(90), 0.0, math.radians(-90))),
    # Azimuth is overridable so it can be SWEPT, via LION_TQ_DEG. The default
    # STAYS at the documented 47 degrees.
    #
    # The 3/4 view has been the weakest of the four throughout, with a
    # systematic width deficit across body bands (-0.204 and -0.181 at
    # h 0.25-0.35) — which is what a camera-angle error looks like rather than
    # a geometry error, since "the reference sheet's own 3/4 angle" was an
    # assumption nobody had tested. Swept:
    #
    #     azimuth   35     40     45     47     50     55     60
    #     3/4 IoU  0.7556 0.7816 0.8012 0.8049 0.8078 0.8047 0.7944
    #
    # It peaks at 50 and 47 is 0.0029 off it — 0.0007 weighted. So the camera
    # is very nearly right and the deficit IS geometry. Hypothesis tested and
    # rejected, which is worth more than the 0.0007.
    #
    # The default is NOT moved to 50. Choosing a QA camera because it flatters
    # the model is metric-gaming; 47 is the documented intent and the sweep is
    # here for the next person who suspects the camera.
    "three-quarter": _tq(float(os.environ.get("LION_TQ_DEG", "47.0"))),
}


def targets():
    objs = [o for o in bpy.data.objects if o.type == "MESH"]
    if WANT:
        objs = [o for o in objs if o.name in WANT]
    if not objs:
        raise SystemExit(f"no mesh objects matched {WANT}")
    return objs


def fit(objs):
    """Scale to H and seat on the ground, about the group's own bounds."""
    mn = Vector((1e9, 1e9, 1e9)); mx = -mn
    for o in objs:
        o.hide_render = False
        for c in o.bound_box:
            p = o.matrix_world @ Vector(c)
            mn = Vector(min(mn[i], p[i]) for i in range(3))
            mx = Vector(max(mx[i], p[i]) for i in range(3))
    h = mx.z - mn.z
    k = 1.0 / h if h > 1e-6 else 1.0
    holder = bpy.data.objects.new("FitHolder", None)
    bpy.context.scene.collection.objects.link(holder)
    # PARENT THE ROOTS, NOT THE OBJECTS. `if o.parent is None` scaled ONE of
    # the four.
    #
    # The assembler parents `LionMane`, `LionFace_Gloss` and `LionFace_Ink` to
    # `LionRig`; only `LionCage` has no parent. So this loop re-parented the
    # cage and silently skipped the other three, while the line below printed
    # "fit 4 objects". The cage was then scaled by 1.0235 and the mane was not:
    # every silhouette this harness has ever rendered showed a lion whose body
    # was 2.35% larger than its own mane, against a reference where they match.
    #
    # It is visible in the output if you look for it. The reference norms fill
    # rows 100-620 exactly — h 1.0000 to 0.0000 — and the model rendered rows
    # 109-620, h 0.9827: the bottom is the scaled cage's feet landing correctly
    # on the ground, and the top is the UNSCALED mane's crown, 9 px short. That
    # 1.7% is a systematic "the mane is too small" bias in every band table,
    # and it is most of the -0.046 and -0.062 at side h 0.90-1.00 that nearly
    # sent a crown-depth rebuild after a harness bug.
    #
    # Walking to the root also brings the armature along, so the mesh and the
    # rig it is deformed by are scaled together and the deformation stays
    # consistent.
    roots = []
    for o in objs:
        r = o
        while r.parent is not None:
            r = r.parent
        if r not in roots:
            roots.append(r)
    for r in roots:
        r.parent = holder
        r.matrix_parent_inverse = holder.matrix_world.inverted()
    holder.scale = (k, k, k)
    ctr = (mn + mx) / 2
    holder.location = (-ctr.x * k, -ctr.y * k, -mn.z * k)
    bpy.context.view_layer.update()
    print(f"[sil] fit {len(objs)} objects via {len(roots)} root(s) "
          f"({', '.join(r.name for r in roots)}): raw h={h:.4f} scale={k:.4f}")
    return holder


def flat_white(objs):
    m = bpy.data.materials.new("SilFlat")
    m.use_nodes = True
    nt = m.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    em = nt.nodes.new("ShaderNodeEmission")
    em.inputs[0].default_value = (1, 1, 1, 1)
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    nt.links.new(em.outputs[0], out.inputs[0])
    for o in objs:
        o.data.materials.clear()
        o.data.materials.append(m)
        for mod in list(o.modifiers):
            if mod.type == "WIREFRAME":
                o.modifiers.remove(mod)


def rest_pose():
    """Put every armature back on its REST pose before anything is measured.

    THIS WAS SILENTLY WRONG FOR THE WHOLE HISTORY OF THIS ASSET.

    `lion_assembled.blend` is saved by the assembler with the `Idle` action
    assigned, `pose_position = POSE` and the scene sitting on frame 91. Nothing
    here cleared it, so every silhouette IoU ever recorded for this model —
    including the weighted 0.86 headline and every band-span correction typed
    out of it — was measured on a lion caught mid-idle and compared against a
    reference turnaround standing still.

    It is not a small effect where it matters most. Measured on the assembled
    mesh, the rear foot is 0.289 long at z 0.028; the posed side silhouette
    reported 0.167 at the same height, because the Idle pose had moved the leg.
    A paw tuned against that number is being tuned against the pose.

    `review_render.py` already clears the action for exactly this reason ("a
    review sheet shot on whatever frame the file was saved on is not comparable
    with the previous one") and `face_lion.py` builds in REST because ray casts
    read evaluated geometry. This is the third time the same trap has been
    found in a different script, which is why it is spelled out here rather
    than fixed quietly.
    """
    n = 0
    for o in bpy.data.objects:
        if o.type != "ARMATURE":
            continue
        if o.animation_data:
            o.animation_data.action = None
        o.data.pose_position = "REST"
        for pb in o.pose.bones:
            pb.matrix_basis.identity()
        n += 1
    bpy.context.view_layer.update()
    print(f"[sil] rest pose forced on {n} armature(s)")
    return n


def main():
    os.makedirs(OUT, exist_ok=True)
    rest_pose()
    objs = targets()
    print(f"[sil] rendering: {', '.join(o.name for o in objs)}")
    for o in bpy.data.objects:
        if o.type == "MESH" and o not in objs:
            o.hide_render = True
    fit(objs)
    flat_white(objs)

    sc = bpy.context.scene
    sc.render.engine = "BLENDER_EEVEE"
    sc.render.resolution_x = sc.render.resolution_y = CANVAS
    sc.render.film_transparent = False
    sc.view_settings.view_transform = "Standard"
    w = bpy.data.worlds.new("SilBlack")
    w.use_nodes = True
    w.node_tree.nodes["Background"].inputs[0].default_value = (0, 0, 0, 1)
    w.node_tree.nodes["Background"].inputs[1].default_value = 0.0
    sc.world = w

    cd = bpy.data.cameras.new("SilCam")
    cam = bpy.data.objects.new("SilCam", cd)
    sc.collection.objects.link(cam)
    sc.camera = cam

    if PERSP > 0.0:
        # PERSPECTIVE, for measuring how much of the front/rear and 3/4
        # disagreement is projection rather than geometry.
        #
        # An orthographic front silhouette and an orthographic rear silhouette
        # of the same object are MIRROR IMAGES — necessarily, since both are the
        # same set of rays. Measured on this model they agree at IoU 0.99927.
        # The reference pair agrees at only 0.8097, with 19% fewer subject
        # pixels in its rear view than its front, so the reference turnaround is
        # a fairly close PERSPECTIVE render and the two projections cannot be
        # made to agree by changing geometry.
        #
        # Distance is in the same units as the camera ring, and the lens is
        # solved so the framing still maps SPAN to the canvas height at the
        # subject's centre — otherwise the sweep would be measuring zoom.
        cd.type = "PERSP"
        cd.sensor_fit = "VERTICAL"
        cd.sensor_height = 24.0
        cd.lens = 24.0 * PERSP / SPAN
    else:
        cd.type = "ORTHO"
        cd.ortho_scale = SPAN

    for view, (loc, rot) in CAMS.items():
        if PERSP > 0.0:
            v = Vector(loc)
            flat = Vector((v.x, v.y, 0.0))
            k = PERSP / (flat.length or 1.0)
            cam.location = (v.x * k, v.y * k, v.z)
        else:
            cam.location = loc
        cam.rotation_euler = rot
        sc.render.filepath = os.path.join(OUT, f"model-{view}.png")
        bpy.ops.render.render(write_still=True)
    print(f"[sil] wrote {OUT}"
          f"{f' (perspective, d={PERSP})' if PERSP > 0 else ' (orthographic)'}")


main()
