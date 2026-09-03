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
    for o in objs:
        if o.parent is None:
            o.parent = holder
            o.matrix_parent_inverse = holder.matrix_world.inverted()
    holder.scale = (k, k, k)
    ctr = (mn + mx) / 2
    holder.location = (-ctr.x * k, -ctr.y * k, -mn.z * k)
    bpy.context.view_layer.update()
    print(f"[sil] fit {len(objs)} objects: raw h={h:.4f} scale={k:.4f}")
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


def main():
    os.makedirs(OUT, exist_ok=True)
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
    cd.type = "ORTHO"
    cd.ortho_scale = SPAN
    cam = bpy.data.objects.new("SilCam", cd)
    sc.collection.objects.link(cam)
    sc.camera = cam

    for view, (loc, rot) in CAMS.items():
        cam.location = loc
        cam.rotation_euler = rot
        sc.render.filepath = os.path.join(OUT, f"model-{view}.png")
        bpy.ops.render.render(write_still=True)
    print(f"[sil] wrote {OUT}")


main()
