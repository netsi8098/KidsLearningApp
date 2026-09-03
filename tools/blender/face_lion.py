"""
face_lion.py — GATE 15. The face, built from the measurement.

WHY THIS IS A SEPARATE SCRIPT AND SEPARATE GEOMETRY
The cage is a DEFORMATION cage: ~1,000 verts, a loop wherever something bends,
and nothing else. Eyes do not bend — they are rigid stacked forms that rotate
whole, and a mane is already handled this way for the same reason. Modelling an
eyeball into the cage would add density the deformation battery cannot use and
put a pole where an eyelid has to slide.

So the face parts are their own objects, placed against the cage's real surface.
The cage supplies the eyelid and brow LOOPS (see `FACE_SOCKETS` in cage_lion);
this supplies the forms those loops frame.

WHAT IS MEASURED AND WHAT IS NOT
Every position, radius and colour here comes from `face_model.json`. Nothing is
picked by eye — including the palette, because Blender ships numpy but not PIL
and the alternative is exactly how the proxy ended up with an eye white that
reads grey against a warm coat.

The measurement also found something a builder would not have guessed: **the
pupil is not centred in the eye.** Measured on the right eye, the pupil sits
0.0116 H inboard and 0.0113 H below the almond's centre, and the sclera's white
crescent sits up and out from both. That offset IS the expression — it is what
makes the look gentle rather than a stare — so the parts are placed at their
OWN measured coordinates rather than concentrically around one centre.

TWO TRAPS ALREADY PAID FOR, INHERITED FROM `detail_lion.py`
1. Hand-written feature coordinates drift the moment the surface moves. The
   proxy's eye whites ended up ~2 cm inside the head with only the pupils
   showing. Placement is ray-cast off the surface that exists now.
2. Concentric SPHERES cannot nest safely — the child stays inside only while
   offset + child radius < parent radius, and the proxy's iris did not, so it
   punched through and rendered as a floating bead. These are flat discs
   stacked along one axis, which cannot fail that way.

AND ONE THIS SCRIPT RESOLVES
The measured brow at x ±0.1031 is where the cage could not put a brow SOCKET —
that surface is the ear's attachment patch, so the socket slid 0.028 inboard.
A brow OBJECT has no topology contract, so it goes at the measured position.
The loop that moves it and the form that reads as it are allowed to differ, and
this is where that is written down.

Run:
  blender --background art/blender/lion_cage.blend --factory-startup \
    --python tools/blender/face_lion.py

Outputs:
  art/blender/lion_face.blend
  public/assets/lion/cage/lion_face.glb
  docs/assets/lion-face/{front,three-quarter,side,eye-closeup}.png
"""

import json
import math
import os
import sys

import bpy
from mathutils import Matrix, Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
# `cage_lion` is import-safe: module level is constants only, `main()` is
# guarded. Importing it rather than restating the socket depths means a decal
# cannot end up at the bottom of a socket whose depth was retuned elsewhere.
from cage_lion import FACE_SOCKETS  # noqa: E402

SOCKET_DEPTH = {name: depth for name, _insets, depth, _r, _m in FACE_SOCKETS}

# Clearance in front of a socket's rim. One number, and it is a look decision
# rather than a measurement: an eye sitting flush in its socket reads dead, and
# one standing far out reads bug-eyed.
RIM_CLEARANCE = 0.0025

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
VIEWS = os.path.join(REPO, "art", "blender", "references", "turnaround-views")
FACE_JSON = os.path.join(VIEWS, "face_model.json")
BLEND_OUT = os.path.join(REPO, "art", "blender", "lion_face.blend")
GLB_OUT = os.path.join(REPO, "public", "assets", "lion", "cage", "lion_face.glb")
PREVIEW_DIR = os.path.join(REPO, "docs", "assets", "lion-face")

COLOR_ATTR = "Col"

# Disc flatness (scale along the normal), as a fraction of the disc's smaller
# in-plane radius. A cartoon eye is a decal with just enough dome to catch a
# highlight, not a ball.
#
# 0.16 was the first value and it bulged: because the stack has to clear each
# dome in turn, a dome factor multiplies through four parts, and the eye stood
# 0.0175 proud — 26.9 mm on the shipped 1.30 m character, which reads as a
# frog rather than a lion. 0.07 gives 11.5 mm, enough for the specular to
# travel across the eye as the head turns without the eye leaving the socket.
FLAT = 0.07


def srgb_to_linear(c):
    """Blender's vertex colours are LINEAR; the measurement is sRGB.

    Skipping this is not subtle — mid-tones come out roughly 25% too bright,
    which on an amber iris reads as yellow.
    """
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def shared_mat(name, roughness, specular):
    m = bpy.data.materials.get(name)
    if m:
        return m
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    b.inputs["Roughness"].default_value = roughness
    if "Specular IOR Level" in b.inputs:
        b.inputs["Specular IOR Level"].default_value = specular
    vc = nt.nodes.new("ShaderNodeVertexColor")
    vc.layer_name = COLOR_ATTR
    vc.location = (-320, 200)
    nt.links.new(vc.outputs["Color"], b.inputs["Base Color"])
    return m


def paint(obj, srgb01, gloss):
    me = obj.data
    me.materials.clear()
    # 0.12 roughness made the pupil a mirror — a black chrome dome that
    # reflected the key light as a bright band across the whole iris. An eye
    # wants ONE small highlight, which is what the catchlight is for, so the
    # surface itself is only semi-gloss.
    me.materials.append(shared_mat("Face_Gloss" if gloss else "Face_Matte",
                                   0.30 if gloss else 0.52,
                                   0.42 if gloss else 0.24))
    attr = me.color_attributes.get(COLOR_ATTR)
    if attr is None:
        attr = me.color_attributes.new(name=COLOR_ATTR, type="FLOAT_COLOR",
                                       domain="POINT")
    lin = tuple(srgb_to_linear(c) for c in srgb01)
    for i in range(len(me.vertices)):
        attr.data[i].color = (*lin, 1.0)
    for poly in me.polygons:
        poly.use_smooth = True


def cage_object():
    for name in ("LionCage", "Lion", "LionBody"):
        ob = bpy.data.objects.get(name)
        if ob and ob.type == "MESH":
            return ob
    meshes = [o for o in bpy.data.objects if o.type == "MESH"]
    if not meshes:
        raise SystemExit("[face] no mesh in the scene — open lion_cage.blend")
    return max(meshes, key=lambda o: len(o.data.vertices))


def surface_at(cage, x, z, y_start=1.4):
    """Outer surface point and normal at (x, z), cast from in front of the nose."""
    hit, loc, nor, _ = cage.ray_cast(Vector((x, y_start, z)),
                                     Vector((0.0, -1.0, 0.0)))
    if not hit:
        raise SystemExit(f"[face] surface probe missed at x={x:+.4f} z={z:.4f}")
    return loc, nor.normalized()


def lift_for(feature):
    """How far to raise a decal off the socket floor it was cast onto.

    A socket is a recess, so a ray down its axis lands on the FLOOR. Once
    `cage_lion` began recalculating normals before insetting, the sockets
    became genuine dents instead of accidental bumps and every decal sank into
    one — the sclera showed as a slit in the inner corner and the face read as
    squinting.

    The first fix probed a ring around the feature for the most protruding
    nearby surface. It overreached badly: at a radius wide enough to clear the
    eye socket the ring also sampled the muzzle, so the "rim" for the mouth
    came back as the NOSE and lifted it 0.0678 — 104 mm on the shipped
    character. A neighbourhood maximum on a face this crowded finds a different
    feature, not a rim.

    So the depth is taken from the socket table itself. A socket pushed IN by
    `d` has its floor `d` below the rim, so lifting by `d` restores the rim and
    the clearance puts the form just proud of it. A negative depth is a raised
    pad, already at or above the rim, so it gets clearance only.
    """
    d = SOCKET_DEPTH.get(feature, 0.0)
    return max(d, 0.0) + RIM_CLEARANCE


def on_plane(p0, n, x, z):
    """The point with the given x and z that lies on the plane (p0, n).

    Each eye part is placed at its OWN measured x and z, but they must be
    COPLANAR or a disc in front will shear off the curved surface and clip. So
    the sclera's tangent plane is the eye's plane, and everything else is
    projected onto it — measured coordinates preserved exactly, coplanarity
    guaranteed.
    """
    if abs(n.y) < 1e-6:
        raise SystemExit("[face] eye plane is edge-on to the view axis")
    y = p0.y - (n.x * (x - p0.x) + n.z * (z - p0.z)) / n.y
    return Vector((x, y, z))


def plane_basis(normal):
    """An explicit in-plane frame: (side, up, normal).

    `rotation_difference` from +Z to the normal was the first approach and it
    is wrong for anything non-circular: it produces the shortest-arc rotation,
    whose ROLL about the normal is arbitrary. So `rx` and `rz` were being
    applied along two axes that pointed somewhere unpredictable in the plane —
    an ellipse at a random angle, and a brow tilt measured in degrees about an
    axis nobody had defined.

    Projecting world +Z into the plane fixes the roll: `up` is up, `side` is
    horizontal, and a rotation about the normal then means what it says.
    """
    n = Vector(normal).normalized()
    world_up = Vector((0.0, 0.0, 1.0))
    if abs(n.dot(world_up)) > 0.97:
        world_up = Vector((0.0, 1.0, 0.0))
    up = (world_up - n * world_up.dot(n)).normalized()
    side = up.cross(n).normalized()
    return side, up, n


def disc(name, centre, normal, rx, rz, srgb01, gloss=True, segments=16,
         roll_deg=0.0, flat=None):
    """An elliptical, flattened dome lying on a surface, facing along `normal`.

    Built as a scaled sphere rather than a flat circle so the form has a slight
    dome — a flat circle reads as a sticker under a rim light, and the eye is
    the one place on this character a highlight has to land.

    `roll_deg` rotates the ellipse in its own plane, positive counter-clockwise
    about the outward normal. Returns the object and its dome height, because
    the caller has to stack the next part clear of it.
    """
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=segments // 2,
                                         radius=1.0, location=(0, 0, 0))
    o = bpy.context.object
    o.name = name
    side, up, n = plane_basis(normal)
    if roll_deg:
        a = math.radians(roll_deg)
        side, up = (side * math.cos(a) + up * math.sin(a),
                    up * math.cos(a) - side * math.sin(a))
    flat = FLAT if flat is None else flat
    dome = min(rx, rz) * flat
    mat = Matrix(((side.x, up.x, n.x, centre.x),
                  (side.y, up.y, n.y, centre.y),
                  (side.z, up.z, n.z, centre.z),
                  (0.0, 0.0, 0.0, 1.0)))
    o.matrix_world = mat @ Matrix.Diagonal((rx, rz, dome, 1.0))
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    paint(o, srgb01, gloss)
    return o, dome


def symmetrise(part):
    """Average a left/right pair's SIZES, and mirror its position.

    The artwork is symmetric: the pupil pair measures an asymmetry of exactly
    0.0000 H. So where the two sides disagree it is segmentation noise, not
    character — the figure is lit from one side, which pushes the shaded eye's
    amber under the iris threshold and its lit sclera over the white one. Left
    over right, unaveraged, that came out as an iris radius of 0.0456 against
    0.0321, a 42% difference, and one eye visibly larger.

    Positions are taken from the side with the LARGER area (the better-exposed
    read) and mirrored, so a mean cannot shift a feature off the measured axis.
    """
    left, right = part["left"], part["right"]
    src = right if right["area_px"] >= left["area_px"] else left
    return {
        "half_w_H": (left["half_w_H"] + right["half_w_H"]) / 2.0,
        "half_h_H": (left["half_h_H"] + right["half_h_H"]) / 2.0,
        "x_H_abs": abs(src["x_H"]),
        "h": src["h"],
        "srgb01": src["srgb01"],
        "rgb": src["rgb"],
        "from_side": "right" if src is right else "left",
    }


def build_eyes(cage, fm, parts, report):
    e = fm["eye"]
    al_s = symmetrise(e["almond"])
    ir_s = symmetrise(e["iris"])
    pu_s = symmetrise(e["pupil"])
    sc_s = symmetrise(e["sclera"])
    report.append(
        f"symmetrised from the {al_s['from_side']} eye: "
        f"almond {al_s['half_w_H'] * 2:.4f}x{al_s['half_h_H'] * 2:.4f}, "
        f"iris r{ir_s['half_w_H']:.4f} (sides measured "
        f"{e['iris']['left']['half_w_H']:.4f}/"
        f"{e['iris']['right']['half_w_H']:.4f}), "
        f"pupil r{pu_s['half_w_H']:.4f}")

    for side, sx in (("right", +1), ("left", -1)):
        tag = "R" if sx > 0 else "L"

        def mirrored(s):
            return {"x_H": sx * s["x_H_abs"], "h": s["h"],
                    "half_w_H": s["half_w_H"], "half_h_H": s["half_h_H"],
                    "srgb01": s["srgb01"]}

        al, ir, pu, sc = (mirrored(al_s), mirrored(ir_s),
                          mirrored(pu_s), mirrored(sc_s))

        # The eye's plane is the surface at the ALMOND centre — the opening the
        # lid loops frame — not at the pupil, which sits off-centre inside it.
        # Its LEVEL comes from the socket rim, not the socket floor, so the
        # eyeball sits in the socket the way an eyeball does.
        p0, n = surface_at(cage, al["x_H"], al["h"])
        lift = lift_for("eye")
        p0 = p0 + n * lift

        # THE STACK IS DERIVED FROM THE DOMES, NOT PICKED.
        #
        # Fixed offsets (0.0000 / 0.0035 / 0.0060 / 0.0080) put the pupil only
        # 0.0025 in front of an iris whose own dome stood 0.0062 proud, so the
        # iris pushed THROUGH the pupil and it rendered as a crescent clinging
        # to the iris rim. This is the same nesting failure `detail_lion.py`
        # documented for concentric spheres, in a new guise: it is not the
        # radii that have to nest, it is offset against DOME HEIGHT.
        #
        # Each part is now placed clear of the dome in front of it, plus a
        # small margin. Total protrusion is reported so it cannot creep.
        cursor = 0.0
        o, dome = disc(f"Sclera_{tag}",
                       on_plane(p0, n, al["x_H"], al["h"]) + n * cursor, n,
                       al["half_w_H"], al["half_h_H"], sc["srgb01"])
        parts.append(o)
        cursor += dome + 0.0004

        o, dome = disc(f"Iris_{tag}",
                       on_plane(p0, n, ir["x_H"], ir["h"]) + n * cursor, n,
                       ir["half_w_H"], ir["half_h_H"], ir["srgb01"])
        parts.append(o)
        cursor += dome + 0.0004

        o, dome = disc(f"Pupil_{tag}",
                       on_plane(p0, n, pu["x_H"], pu["h"]) + n * cursor, n,
                       pu["half_w_H"], pu["half_h_H"], pu["srgb01"])
        parts.append(o)
        cursor += dome + 0.0003

        # Catchlight: up and INBOARD of the pupil. Placed relative to the
        # measured pupil rather than at its own measurement — it is a specular
        # highlight in the artwork, so its position is a lighting choice, and
        # this is the one thing on the face that is a choice. Up-and-inboard
        # reads as a light above and in front, which is the world's key light.
        cl_x = pu["x_H"] - sx * pu["half_w_H"] * 0.42
        cl_z = pu["h"] + pu["half_h_H"] * 0.46
        r = pu["half_w_H"] * 0.34
        o, dome = disc(f"Catchlight_{tag}",
                       on_plane(p0, n, cl_x, cl_z) + n * cursor, n, r, r,
                       [1.0, 1.0, 1.0], segments=10)
        parts.append(o)
        protrusion = cursor + dome

        report.append(
            f"eye {tag}: plane at ({p0.x:+.4f},{p0.y:+.4f},{p0.z:+.4f}) "
            f"n=({n.x:+.2f},{n.y:+.2f},{n.z:+.2f})  "
            f"sclera {al['half_w_H'] * 2:.4f}x{al['half_h_H'] * 2:.4f}  "
            f"iris r{ir['half_w_H']:.4f}  pupil r{pu['half_w_H']:.4f}  "
            f"pupil offset inboard {abs(al['x_H']) - abs(pu['x_H']):+.4f} "
            f"below {al['h'] - pu['h']:+.4f}  "
            f"stack protrusion {protrusion:.4f} "
            f"({protrusion * 1300 / 0.847:.1f} mm at 1.30 m)  "
            f"lifted {lift:.4f} off the socket floor")


def build_brows(cage, fm, parts, report):
    """The brow marks, at the MEASURED position the socket could not reach.

    The cage's brow socket slid 0.028 H inboard to stay off the ear's
    attachment patch. That constrains the deformation loop, not the form: a
    separate object can sit where the reference puts it. Arched by tilting the
    disc about the view axis — the reference brow is a wedge that rises toward
    the midline, which is what stops a mascot reading as cross.
    """
    br = fm.get("brow")
    if not br:
        report.append("brow: NOT MEASURED — skipped")
        return
    bs = symmetrise(br)
    for side, sx in (("right", +1), ("left", -1)):
        tag = "R" if sx > 0 else "L"
        b = {"x_H": sx * bs["x_H_abs"], "h": bs["h"],
             "half_w_H": bs["half_w_H"], "half_h_H": bs["half_h_H"],
             "srgb01": bs["srgb01"]}
        p0, n = surface_at(cage, b["x_H"], b["h"])
        p0 = p0 + n * lift_for("brow")
        # SLOPE IS MEASURED, and the first attempt had the sign wrong.
        #
        # It tilted the brow 14 degrees "by eye" in the direction that drops
        # the inboard end, which is the universal cross/angry brow. The
        # principal axis of the reference component says the brow RISES toward
        # the midline by 20.9 degrees on the right and 19.4 on the left. That
        # sign is the whole difference between a friendly mascot and a scowl,
        # and it is not something to guess at.
        rise = br[side].get("rise_toward_midline_deg")
        if rise is None:
            raise SystemExit("[face] brow slope not measured — rerun measure_face.py")
        # `roll_deg` is CCW about the outward normal. On the +x side, lifting
        # the inboard (-x) end is a CCW roll; mirrored on the other side.
        o, _ = disc(f"Brow_{tag}", p0, n, b["half_w_H"], b["half_h_H"] * 0.52,
                    b["srgb01"], gloss=False, segments=14,
                    roll_deg=rise * sx, flat=0.55)
        parts.append(o)
        report.append(f"brow {tag}: at x={b['x_H']:+.4f} h={b['h']:.4f} "
                      f"w={b['half_w_H'] * 2:.4f} rise_toward_midline="
                      f"{rise:+.1f}deg (measured position, not the slid socket)")


def build_nose_and_mouth(cage, fm, parts, report):
    """The nose pad and mouth line as colour forms.

    Both already exist as cage geometry — the pad is a raised socket, the mouth
    a real cavity. What is missing is that they read as dark against gold, and
    the cage carries one flat colour. These are thin decals on top of the
    existing forms, so the geometry stays the deformation geometry and the
    colour stops being uniform.
    """
    # The 0.60 / 0.30 height factors here were arbitrary and they showed: the
    # nose measures 0.1511 x 0.0745, an aspect of 2.0, and multiplying its
    # half-height by 0.60 rendered it at 3.4:1 — a letterbox smear instead of
    # the rounded pad the reference draws. The measured aspect is used as-is.
    # The mouth's half-height is trimmed where the nose's is not, and the
    # reason is the surface under it. The chin RECEDES sharply below the mouth,
    # so a disc tangent at the mouth's centre runs out past the skin and its
    # lower rim showed as a pale wedge hanging under the chin in the 3/4 view.
    # The nose sits on a convex pad that curves the other way and has no such
    # problem. This is a fit to the surface, not a change to the measurement:
    # the mouth's measured WIDTH, position and colour are untouched.
    for key, name, gloss, flat_z in (("nose_pad", "NosePad", True, 1.00),
                                     ("mouth_line", "MouthLine", False, 0.62)):
        b = fm.get(key)
        if not b:
            report.append(f"{key}: NOT MEASURED — skipped")
            continue
        p0, n = surface_at(cage, b["x_H"], b["h"])
        lift = lift_for(key.replace("_line", ""))
        p0 = p0 + n * lift
        o, _ = disc(name, p0, n, b["half_w_H"], b["half_h_H"] * flat_z,
                    b["srgb01"], gloss=gloss, flat=0.42 if gloss else 0.14)
        parts.append(o)
        report.append(f"{key}: at x={b['x_H']:+.4f} h={b['h']:.4f} "
                      f"w={b['half_w_H'] * 2:.4f} rgb={b['rgb']} "
                      f"lifted {lift:.4f} off the socket floor")


def render(cage, parts):
    os.makedirs(PREVIEW_DIR, exist_ok=True)
    sc = bpy.context.scene
    # 5.2 dropped the "_NEXT" suffix; detail_lion.py guards for both because it
    # predates the rename. Reading the enum is cheaper than tracking which.
    engines = sc.render.bl_rna.properties["engine"].enum_items.keys()
    sc.render.engine = ("BLENDER_EEVEE_NEXT" if "BLENDER_EEVEE_NEXT" in engines
                        else "BLENDER_EEVEE")
    sc.render.resolution_x = sc.render.resolution_y = 760
    sc.render.film_transparent = False
    if sc.world is None:
        sc.world = bpy.data.worlds.new("FaceWorld")
    sc.world.use_nodes = True
    bg = sc.world.node_tree.nodes.get("Background")
    if bg:
        bg.inputs[0].default_value = (0.52, 0.56, 0.62, 1.0)
        bg.inputs[1].default_value = 0.35

    for ob in [o for o in bpy.data.objects if o.type in ("CAMERA", "LIGHT")]:
        bpy.data.objects.remove(ob, do_unlink=True)
    # 320 W at 1.6 m drove the measured gold (242,180,75) to clipped white, so
    # every colour these renders exist to check was unjudgeable. Key plus a
    # cool fill at sane levels keeps the coat on its measured value and still
    # gives the eye a highlight to catch.
    for name, energy, size, loc in (("Key", 55.0, 1.2, (0.85, 1.75, 1.35)),
                                    ("Fill", 14.0, 2.0, (-1.15, 1.35, 0.55))):
        lt = bpy.data.lights.new(name + "L", "AREA")
        lt.energy, lt.size = energy, size
        if name == "Fill":
            lt.color = (0.78, 0.85, 1.0)
        ob = bpy.data.objects.new(name, lt)
        ob.location = loc
        ob.rotation_euler = (Vector((0, 0.62, 0.64)) - Vector(loc)) \
            .to_track_quat("-Z", "Y").to_euler()
        sc.collection.objects.link(ob)

    cd = bpy.data.cameras.new("FaceCam")
    cam = bpy.data.objects.new("FaceCam", cd)
    sc.collection.objects.link(cam)
    sc.camera = cam

    shots = {"front": ((0.0, 0.62, 0.655), 0.95, 50.0),
             "three-quarter": ((0.0, 0.60, 0.650), 0.95, 50.0),
             "side": ((0.0, 0.58, 0.640), 0.95, 50.0),
             "eye-closeup": ((0.089, 0.62, 0.660), 0.30, 85.0)}
    yaws = {"front": 180, "three-quarter": 145, "side": 90, "eye-closeup": 172}
    for name, (t, dist, lens) in shots.items():
        cd.lens = lens
        tv = Vector(t)
        a = math.radians(yaws[name])
        cam.location = (tv.x + math.sin(a) * dist,
                        tv.y - math.cos(a) * dist,
                        tv.z + dist * 0.08)
        cam.rotation_euler = (tv - Vector(cam.location)) \
            .to_track_quat("-Z", "Y").to_euler()
        sc.render.filepath = os.path.join(PREVIEW_DIR, f"{name}.png")
        bpy.ops.render.render(write_still=True)


def main():
    if not os.path.exists(FACE_JSON):
        raise SystemExit(f"[face] {FACE_JSON} missing — run tools/cad/measure_face.py")
    fm = json.load(open(FACE_JSON))

    cage = cage_object()
    cage.data.calc_loop_triangles()

    # PAINT THE COAT. Not art direction — a review necessity. Against a white
    # cage every measured colour reads wrong: an amber iris looks yellow and a
    # dark nose looks orange, so the one thing these renders exist to judge
    # cannot be judged. The gold is the face aperture's own measured median,
    # which is the coat colour beside the features being placed on it.
    if cage.data.materials:
        cage.data.materials.clear()
    paint(cage, fm["face_aperture"]["srgb01"], gloss=False)

    parts, report = [], []
    build_eyes(cage, fm, parts, report)
    build_brows(cage, fm, parts, report)
    build_nose_and_mouth(cage, fm, parts, report)

    # Parent to the cage so the whole face moves as one when the head does.
    # NOT skinned: these forms are rigid and rotate whole. Binding them to the
    # head bone is the rig's job, and doing it here would duplicate the skin
    # map the cage already authors.
    for p in parts:
        p.parent = cage
        p.matrix_parent_inverse = cage.matrix_world.inverted()

    for line in report:
        print(f"[face] {line}")

    verts = sum(len(p.data.vertices) for p in parts)
    tris = sum(len(p.data.loop_triangles) for p in parts) or None
    for p in parts:
        p.data.calc_loop_triangles()
    tris = sum(len(p.data.loop_triangles) for p in parts)

    render(cage, parts)

    bpy.ops.wm.save_as_mainfile(filepath=BLEND_OUT)

    os.makedirs(os.path.dirname(GLB_OUT), exist_ok=True)
    bpy.ops.object.select_all(action="DESELECT")
    for ob in [cage] + parts:
        ob.select_set(True)
    bpy.context.view_layer.objects.active = cage
    bpy.ops.export_scene.gltf(filepath=GLB_OUT, export_format="GLB",
                              use_selection=True, export_apply=False,
                              export_normals=True, export_materials="EXPORT")

    kb = os.path.getsize(GLB_OUT) / 1024.0
    print("")
    print("===LION_FACE===")
    print(f"BLEND={BLEND_OUT}")
    print(f"GLB={GLB_OUT}")
    print(f"KB={kb:.1f}")
    print(f"FACE_PARTS={len(parts)}")
    print(f"FACE_VERTS={verts} FACE_TRIS={tris}")
    print(f"CAGE_VERTS={len(cage.data.vertices)}")
    print(f"NAMES={[p.name for p in parts]}")
    print("===LION_FACE_END===")


if __name__ == "__main__":
    main()
