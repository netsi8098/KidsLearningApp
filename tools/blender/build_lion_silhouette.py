"""
build_lion_silhouette.py — Priority A: silhouette and proportion study.

The existing lion.blend is 96 separate meshes each rigidly parented to one bone.
That is a part-assembly, not a character: it cannot deform, cannot be weight
painted, and is the 3D equivalent of the image-stacking the brief forbids.

This builds a SINGLE CONTINUOUS MESH instead, using a vertex skeleton driven by
the Skin modifier:

    vertex chain  ->  Skin (per-vertex radii)  ->  Subdivision  ->  one quad mesh

Why this technique for a stylised quadruped:
  - the output is one watertight, continuous surface — genuinely skinnable
  - topology follows the limb chains, so deformation loops land where joints are
  - proportions are edited as RADII on a skeleton, which is exactly the level of
    control a silhouette pass needs — no detail to hide behind
  - it is reproducible, so proportion review notes turn into parameter edits
    rather than manual re-sculpting

This pass is deliberately UNTEXTURED and UNRIGGED. Its only job is silhouette
and proportion, judged from four views. Detail, topology cleanup, skeleton and
skinning come after the silhouette is approved.

IDENTITY LOCK (art/blender/references/README.md, from the video close-ups):
  low quadruped stance, four readable weight-bearing paws, oversized rounded
  head, large front paws, short muzzle, broad layered mane with a raised top
  tuft, compact chest and belly, short legs with soft joints, tail from the
  pelvis with a rounded tuft.

Run:
  blender --background --factory-startup \
    --python tools/blender/build_lion_silhouette.py

Outputs:
  art/blender/lion_silhouette.blend
  docs/assets/lion-silhouette/{front,side,rear,three-quarter}.png
"""

import math
import os

import bpy
from mathutils import Vector

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
BLEND_OUT = os.path.join(REPO, "art", "blender", "lion_silhouette.blend")
PREVIEW_DIR = os.path.join(REPO, "docs", "assets", "lion-silhouette")

# ── Proportion contract (metres) ────────────────────────────────────────────
# Total height is 1.10m to match the world scale contract the runtime enforces.
# Every other figure is expressed against that so the study can be re-tuned by
# editing ONE number set rather than by moving geometry.
TOTAL_H = 1.10
GROUND = 0.0

# Proportions read from the approved four-view turnaround
# (docs/assets/lion-reference/turnaround.png). Measured against total height:
#   legs ~30%, belly line ~33%, back ~57%, mane mass 25%-100%, body longer than
#   it is tall once the tail is included.
LEG_LEN = 0.33
BELLY_Z = 0.41          # underside of the barrel
SPINE_Z = 0.54          # centre line of the body
SHOULDER_Z = 0.62       # withers
HEAD_Z = 0.80           # head centre
MANE_TOP = 1.10         # crown of the mane == total height

# The turnaround shows a LONGER body than review 4 had. Halving the barrel to
# escape the dachshund read went too far the other way and produced a stubby
# cube; the reference silhouette is closer to square, with the tail adding
# length beyond that.
BODY_FRONT_Y = 0.22     # chest, sitting behind the mane mass
BODY_BACK_Y = -0.32     # pelvis
HEAD_Y = 0.40           # head is well forward, not perched over the chest

# Radii. (x, z) per skin vertex.
R_HEAD = 0.190
R_MANE = 0.245
R_MUZZLE = 0.130
R_NECK = 0.120
R_CHEST = 0.184
R_WAIST = 0.162
R_HIP = 0.182
R_LEG_TOP = 0.098
R_LEG_MID = 0.082
R_PAW = 0.084
R_TAIL = 0.040
R_TUFT = 0.098


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.unit_settings.system = "METRIC"
    sc.unit_settings.length_unit = "METERS"


def material(name, rgb, roughness=0.62):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    b = mat.node_tree.nodes.get("Principled BSDF")
    b.inputs["Base Color"].default_value = (*rgb, 1.0)
    b.inputs["Roughness"].default_value = roughness
    return mat


def build_skeleton_mesh():
    """Vertex skeleton for the Skin modifier.

    Only PRIMARY forms, per the brief: body mass, ribcage, pelvis, neck, head,
    muzzle, four limbs, paws, tail. No eyes, ears, teeth or mane lobes yet —
    those are secondary and would hide silhouette problems.
    """
    v = []          # (x, y, z)
    e = []          # (i, j)
    radii = []      # (rx, rz) per vertex

    def add(pos, r):
        v.append(Vector(pos))
        radii.append(r)
        return len(v) - 1

    # ── Spine: pelvis -> waist -> chest -> neck -> head -> muzzle ───────────
    pelvis = add((0.0, BODY_BACK_Y, SPINE_Z), (R_HIP, R_HIP))
    waist = add((0.0, BODY_BACK_Y + 0.16, SPINE_Z + 0.01), (R_WAIST, R_WAIST))
    chest = add((0.0, BODY_FRONT_Y, SPINE_Z + 0.03), (R_CHEST, R_CHEST))
    neck = add((0.0, BODY_FRONT_Y + 0.07, SHOULDER_Z + 0.08), (R_NECK, R_NECK))
    # The head is NOT built on this chain. Four review passes showed the Skin
    # modifier blending skull, muzzle and mane into one smooth lozenge — it
    # merges adjacent volumes by design, which is precisely wrong for the three
    # features that carry this character's identity. The head is built as
    # separate masses below and unified by a voxel remesh.
    head = add((0.0, HEAD_Y - 0.06, HEAD_Z - 0.06), (R_NECK * 1.15, R_NECK * 1.15))
    e += [(pelvis, waist), (waist, chest), (chest, neck), (neck, head)]

    # ── Legs ───────────────────────────────────────────────────────────────
    def leg(x, y, front):
        # Straight vertical columns. Review 4 splayed the paws outward from the
        # hip, which read as a newborn foal; the turnaround shows the legs
        # dropping plumb from the body with the paws directly beneath.
        hip_z = SHOULDER_Z if front else SPINE_Z + 0.03
        top = add((x, y, hip_z - 0.07), (R_LEG_TOP, R_LEG_TOP))
        mid = add((x, y, BELLY_Z - 0.05), (R_LEG_MID, R_LEG_MID))
        paw = add((x, y, GROUND + 0.048), (R_PAW, R_PAW))
        e.append((chest if front else pelvis, top))
        e.append((top, mid))
        e.append((mid, paw))

    leg(-0.098, BODY_FRONT_Y + 0.02, True)
    leg(0.098, BODY_FRONT_Y + 0.02, True)
    leg(-0.098, BODY_BACK_Y + 0.02, False)
    leg(0.098, BODY_BACK_Y + 0.02, False)

    # ── Tail ───────────────────────────────────────────────────────────────
    # Long, light and tapering, lifted at the tip. Review 7 was closer but still
    # read heavy; the shaft is thinner now and the tuft carries the weight.
    t1 = add((0.0, BODY_BACK_Y - 0.09, SPINE_Z + 0.04), (R_TAIL, R_TAIL))
    t2 = add((0.0, BODY_BACK_Y - 0.21, SPINE_Z + 0.10), (R_TAIL * 0.92, R_TAIL * 0.92))
    t3 = add((0.0, BODY_BACK_Y - 0.32, SPINE_Z + 0.20), (R_TAIL * 0.86, R_TAIL * 0.86))
    t4 = add((0.0, BODY_BACK_Y - 0.37, SPINE_Z + 0.31), (R_TAIL * 0.80, R_TAIL * 0.80))
    tuft = add((0.0, BODY_BACK_Y - 0.38, SPINE_Z + 0.40), (R_TUFT, R_TUFT))
    e += [(pelvis, t1), (t1, t2), (t2, t3), (t3, t4), (t4, tuft)]

    mesh = bpy.data.meshes.new("LionBody")
    mesh.from_pydata([tuple(p) for p in v], e, [])
    mesh.update()

    obj = bpy.data.objects.new("LionBody", mesh)
    bpy.context.scene.collection.objects.link(obj)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)

    # Skin modifier turns the chain into a continuous surface.
    skin = obj.modifiers.new("Skin", "SKIN")
    skin.use_smooth_shade = True
    skin.branch_smoothing = 0.62      # review 2 left a hard crease at the neck

    layer = mesh.skin_vertices[0].data
    for i, (rx, rz) in enumerate(radii):
        layer[i].radius = (rx, rz)
    layer[pelvis].use_root = True

    # Subdivision rounds the blockout into the soft stylised forms the identity
    # lock calls for. Two levels is enough to judge silhouette.
    sub = obj.modifiers.new("Subdivision", "SUBSURF")
    sub.levels = 2
    sub.render_levels = 2

    obj.data.materials.append(material("LionCoat", (0.925, 0.647, 0.259)))
    return obj


def build_head_masses(body):
    """Head, mane, paws and face planes as DISTINCT volumes.

    Built separately and unified by a voxel remesh — the standard sculpting
    blockout route. Unlike the Skin modifier it preserves boundaries between
    masses, so a muzzle stays a muzzle and a paw stays a paw.

    The mane is a large mass covering neck and shoulders with the face set into
    its FRONT, per the approved turnaround — not a ring around the head.
    """
    parts = []

    def ball(name, loc, radius, scale=(1.0, 1.0, 1.0)):
        bpy.ops.mesh.primitive_uv_sphere_add(segments=28, ring_count=18,
                                             radius=radius, location=loc)
        o = bpy.context.object
        o.name = name
        o.scale = scale
        parts.append(o)
        return o

    mane_y = HEAD_Y - 0.15
    mane_z = HEAD_Z - 0.03

    # ══ MANE: macro silhouette in large readable shape groups ══════════════
    # Not individual clumps — those produced a chain-of-balls artefact and were
    # removed. This is the broad shape LOGIC of the reference: a strong upper
    # crown, broad side masses framing the face, and a lower chest ruff.
    ball("ManeCore", (0.0, mane_y, mane_z), 0.278, (1.0, 0.84, 1.10))

    # Upper crown / quiff — the reference's most distinctive mane feature.
    ball("ManeCrown", (0.0, mane_y - 0.030, mane_z + 0.215), 0.165, (0.94, 0.80, 0.86))
    ball("ManeQuiff", (0.0, mane_y + 0.045, mane_z + 0.255), 0.105, (0.80, 0.72, 0.78))

    # Broad side masses framing the face.
    for sx in (-1, 1):
        ball(f"ManeSide_{'L' if sx < 0 else 'R'}",
             (sx * 0.158, mane_y + 0.015, mane_z - 0.015), 0.208, (0.92, 0.84, 1.08))
    # Filler masses bridging core to sides, so the frame is continuous. At the
    # earlier spacing the three volumes read as separate lumps head-on.
    for sx in (-1, 1):
        ball(f"ManeBridge_{'L' if sx < 0 else 'R'}",
             (sx * 0.108, mane_y + 0.005, mane_z + 0.120), 0.165, (0.94, 0.82, 0.98))

    # Rump: rounded hindquarter mass. The skin-chain hip alone left the rear
    # view flat, where the reference shows a clearly domed rear.
    ball("Rump", (0.0, BODY_BACK_Y - 0.020, SPINE_Z + 0.020), 0.196, (1.06, 0.94, 0.96))

    # Lower chest / neck ruff spilling forward onto the chest.
    ball("ManeRuff", (0.0, mane_y + 0.055, mane_z - 0.195), 0.205, (1.04, 0.84, 0.76))

    # ══ HEAD set into the FRONT of the mane ════════════════════════════════
    ball("Skull", (0.0, HEAD_Y + 0.030, HEAD_Z), R_HEAD, (1.04, 0.96, 0.98))

    # Face plate: a broad flattened mass establishing the FACIAL PLANE that
    # retopology has to support. Wide and shallow so it reads as a plane, not a
    # bump.
    ball("FacePlane", (0.0, HEAD_Y + 0.098, HEAD_Z + 0.005), 0.163, (1.06, 0.42, 1.00))

    # Brow ridge: the ONLY additive feature in the eye region. Eye sockets are
    # implied by the brow above and the cheek below, not modelled directly —
    # additive primitives can only ADD mass, so a sphere placed at the eye
    # bulges outward exactly where the socket should recess. An earlier version
    # did that and turned the face into a lumpy mass.
    for sx in (-1, 1):
        ball(f"Brow_{'L' if sx < 0 else 'R'}",
             (sx * 0.078, HEAD_Y + 0.138, HEAD_Z + 0.070), 0.062, (1.22, 0.56, 0.46))

    # ══ MUZZLE: compact, flatter, tucked — not a bulb ══════════════════════
    # Review 7 projected ~0.30 forward of the head centre and read as a snout
    # stuck on the front. Forward reach is cut by roughly a third, the front
    # plane is flattened (low Y scale), and the mass underneath is reduced.
    # Kept to THREE volumes: stacking more only produced competing bumps.
    ball("Muzzle", (0.0, HEAD_Y + 0.130, HEAD_Z - 0.052), 0.104, (1.24, 0.72, 0.84))
    ball("Nose", (0.0, HEAD_Y + 0.170, HEAD_Z - 0.020), 0.042, (1.05, 0.78, 0.82))
    ball("Jaw", (0.0, HEAD_Y + 0.088, HEAD_Z - 0.112), 0.090, (1.10, 0.88, 0.60))

    # Cheeks flowing back into the mane.
    for sx in (-1, 1):
        ball(f"Cheek_{'L' if sx < 0 else 'R'}",
             (sx * 0.096, HEAD_Y + 0.058, HEAD_Z - 0.052), 0.090, (0.94, 0.96, 0.90))

    # ══ EARS: larger, higher, clear of the mane contour ════════════════════
    # Review 7 nested them so deeply they were swallowed by the ruff.
    for sx in (-1, 1):
        ball(f"Ear_{'L' if sx < 0 else 'R'}",
             (sx * 0.148, HEAD_Y - 0.005, HEAD_Z + 0.192), 0.088, (0.98, 0.52, 1.02))

    # ══ PAWS: distinct bulbous socks, wider than the shafts ════════════════
    # Built as separate volumes so there is a clean break between leg column and
    # paw mass. Widening the skin-chain radius only swelled the shaft tip.
    for x in (-0.098, 0.098):
        for y, front in ((BODY_FRONT_Y + 0.02, True), (BODY_BACK_Y + 0.02, False)):
            tag = f"{'F' if front else 'R'}{'L' if x < 0 else 'R'}"
            ball(f"Paw_{tag}", (x, y + (0.018 if front else 0.010), GROUND + 0.062),
                 0.108, (1.06, 1.18, 0.72))

    return parts


def unify(body, parts):
    """Join everything and voxel-remesh into ONE continuous mesh."""
    # Bake the Skin/Subsurf result down first so the join is real geometry.
    bpy.context.view_layer.objects.active = body
    body.select_set(True)
    for m in list(body.modifiers):
        bpy.ops.object.modifier_apply(modifier=m.name)

    bpy.ops.object.select_all(action="DESELECT")
    body.select_set(True)
    for p in parts:
        p.select_set(True)
    bpy.context.view_layer.objects.active = body
    bpy.ops.object.join()

    merged = bpy.context.view_layer.objects.active
    merged.name = "LionBody"

    rem = merged.modifiers.new("Remesh", "REMESH")
    rem.mode = "VOXEL"
    rem.voxel_size = 0.0115          # ~1.2cm on a 0.93m character
    rem.use_smooth_shade = True
    bpy.ops.object.modifier_apply(modifier=rem.name)

    # Light smoothing to take the voxel stair-stepping off the silhouette.
    sm = merged.modifiers.new("Smooth", "SMOOTH")
    sm.factor = 0.55
    sm.iterations = 4
    bpy.ops.object.modifier_apply(modifier=sm.name)

    if not merged.data.materials:
        merged.data.materials.append(material("LionCoat", (0.925, 0.647, 0.259)))
    return merged


def build_lighting_and_cameras():
    """Neutral studio light so the SILHOUETTE is judged, not the shading."""
    key = bpy.data.lights.new("Key", type="AREA")
    key.energy = 220.0
    key.size = 3.0
    ko = bpy.data.objects.new("KeyLight", key)
    ko.location = (2.4, -2.6, 2.6)
    ko.rotation_euler = (math.radians(52), 0, math.radians(40))
    bpy.context.scene.collection.objects.link(ko)

    fill = bpy.data.lights.new("Fill", type="AREA")
    fill.energy = 90.0
    fill.size = 4.0
    fo = bpy.data.objects.new("FillLight", fill)
    fo.location = (-2.6, -2.0, 1.6)
    fo.rotation_euler = (math.radians(74), 0, math.radians(-52))
    bpy.context.scene.collection.objects.link(fo)

    rim = bpy.data.lights.new("Rim", type="AREA")
    rim.energy = 120.0
    rim.size = 2.0
    ro = bpy.data.objects.new("RimLight", rim)
    ro.location = (-1.0, 2.6, 2.0)
    ro.rotation_euler = (math.radians(108), 0, math.radians(-160))
    bpy.context.scene.collection.objects.link(ro)

    world = bpy.data.worlds.new("StudioWorld")
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs[0].default_value = (0.55, 0.60, 0.66, 1.0)
    world.node_tree.nodes["Background"].inputs[1].default_value = 0.55
    bpy.context.scene.world = world

    # No backdrop plane: with cameras orbiting the full 360 degrees it ends up
    # BETWEEN the camera and the subject on rear views and renders an empty
    # frame. The world colour provides the same neutral field from every angle.

    bpy.ops.mesh.primitive_plane_add(size=12, location=(0, 0, 0))
    fl = bpy.context.object
    fl.name = "Floor"
    fl.data.materials.append(material("Floor", (0.28, 0.30, 0.34), 0.9))


def render_views():
    sc = bpy.context.scene
    sc.render.engine = "BLENDER_EEVEE_NEXT" if "BLENDER_EEVEE_NEXT" in {
        i.identifier for i in bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items
    } else "BLENDER_EEVEE"
    sc.render.resolution_x = 900
    sc.render.resolution_y = 900
    sc.view_settings.view_transform = "Standard"
    os.makedirs(PREVIEW_DIR, exist_ok=True)

    cam_data = bpy.data.cameras.new("StudyCam")
    cam_data.lens = 55.0          # long enough to keep proportions honest,
                                  # short enough to frame the whole animal
    cam = bpy.data.objects.new("StudyCam", cam_data)
    bpy.context.scene.collection.objects.link(cam)
    sc.camera = cam

    target = Vector((0.0, 0.02, 0.60))
    dist = 2.35
    # The lion faces +Y, so the camera must sit at +Y to see its face. Yaw 0
    # put the camera behind the animal and every "front" review was actually
    # looking at its back.
    views = {
        "front": (math.radians(180), 0.16),
        "side": (math.radians(90), 0.16),
        "rear": (math.radians(0), 0.16),
        "three-quarter": (math.radians(228), 0.26),
    }
    for name, (yaw, elev) in views.items():
        cam.location = (
            target.x + math.sin(yaw) * dist,
            target.y - math.cos(yaw) * dist,
            target.z + dist * elev,
        )
        direction = target - cam.location
        cam.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
        sc.render.filepath = os.path.join(PREVIEW_DIR, f"{name}.png")
        bpy.ops.render.render(write_still=True)


def main():
    reset()
    body = build_skeleton_mesh()
    parts = build_head_masses(body)
    obj = unify(body, parts)
    build_lighting_and_cameras()

    # Report the ACTUAL silhouette produced, not the intended numbers.
    deps = bpy.context.evaluated_depsgraph_get()
    ev = obj.evaluated_get(deps)
    me = ev.to_mesh()
    xs = [(obj.matrix_world @ v.co) for v in me.vertices]
    height = max(p.z for p in xs) - min(p.z for p in xs)
    length = max(p.y for p in xs) - min(p.y for p in xs)
    width = max(p.x for p in xs) - min(p.x for p in xs)
    tris = len(me.loop_triangles) if me.loop_triangles else 0
    me.calc_loop_triangles()
    tris = len(me.loop_triangles)
    verts = len(me.vertices)
    ev.to_mesh_clear()

    os.makedirs(os.path.dirname(BLEND_OUT), exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=BLEND_OUT)
    render_views()
    bpy.ops.wm.save_as_mainfile(filepath=BLEND_OUT)

    print("\n===LION_SILHOUETTE===")
    print(f"BLEND={BLEND_OUT}")
    print(f"MESH_OBJECTS={len([o for o in bpy.data.objects if o.type == 'MESH' and o.name == 'LionBody'])}")
    print(f"HEIGHT={height:.3f}")
    print(f"LENGTH={length:.3f}")
    print(f"WIDTH={width:.3f}")
    print(f"HEAD_FRACTION={(MANE_TOP - (HEAD_Z - R_HEAD)) / TOTAL_H:.3f}")
    print(f"VERTS={verts}")
    print(f"TRIS={tris}")
    print("===LION_SILHOUETTE_END===")


if __name__ == "__main__":
    main()
