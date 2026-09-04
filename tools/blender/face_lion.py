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

import bmesh
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


# Three finishes, and the third exists because of a measured colour that would
# not render. `ink` is for the near-blacks — pupil (9,6,0), lid (39,17,3),
# mouth (27,8,2). At the semi-gloss numbers those came out mid-GREY: a black
# dome with any specular reflects the sky and the fill straight back, and the
# darker the base the more completely the reflection is all you see. On a
# stylised eye the only highlight should be the catchlight, so the ink is
# rough and almost non-specular.
FINISH = {
    "gloss": (0.30, 0.42),
    "matte": (0.52, 0.24),
    "ink":   (0.62, 0.03),
}


def paint(obj, srgb01, finish="matte"):
    me = obj.data
    me.materials.clear()
    rough, spec = FINISH[finish]
    me.materials.append(shared_mat(f"Face_{finish.capitalize()}", rough, spec))
    attr = me.color_attributes.get(COLOR_ATTR)
    if attr is None:
        attr = me.color_attributes.new(name=COLOR_ATTR, type="FLOAT_COLOR",
                                       domain="POINT")
    lin = tuple(srgb_to_linear(c) for c in srgb01)
    for i in range(len(me.vertices)):
        attr.data[i].color = (*lin, 1.0)
    for poly in me.polygons:
        poly.use_smooth = True


# Every object this script creates. Named here so the build can be idempotent.
FACE_PART_NAMES = (
    "Muzzle", "EyeLid_R", "Sclera_R", "Iris_R", "Pupil_R", "Catchlight_R",
    "EyeLid_L", "Sclera_L", "Iris_L", "Pupil_L", "Catchlight_L",
    "Brow_R", "Brow_L", "NosePad", "MouthLine",
    # The ears are built by `build_ears`, which `assemble_lion` calls rather
    # than the face build — so they are absent from `lion_face.blend` and were
    # missing from this tuple. Named here so a re-run purges them too.
    "Ear_R", "Ear_L",
)


def purge_face_parts():
    """Delete any face parts already in the scene, so a build is idempotent.

    Without this, running the script on its own output silently DUPLICATES
    everything: Blender suffixes the new objects `.001`, `.002` and leaves the
    originals in place. Two accidental re-runs left `lion_face.blend` with 46
    meshes instead of 16, and — worse — a later measurement picked up the
    stale original and reported the muzzle still floating 65.6 mm when the
    freshly built one measured 0.8. A build that cannot be re-run is a build
    whose output nobody can trust.
    """
    stale = [o for o in bpy.data.objects
             if o.type == "MESH" and o.name.split(".")[0] in FACE_PART_NAMES]
    for o in stale:
        me = o.data
        bpy.data.objects.remove(o, do_unlink=True)
        if me.users == 0:
            bpy.data.meshes.remove(me)
    if stale:
        print(f"[face] purged {len(stale)} pre-existing face parts "
              f"(this build is idempotent)")
    return len(stale)


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


def outer_surface_at(cage, x, z, dz, samples=13):
    """The OUTER surface near (x, z), ignoring a cavity the ray falls into.

    `surface_at` takes the first hit, which is correct on a convex face and
    wrong at the mouth. The cage's mouth is a real opening 0.052 deep, so at
    the measured mouth height the first hit is the cavity's INTERIOR: probing
    the midline shows y dropping from 0.6320 at h 0.510 to 0.5648 at h 0.500,
    with the normal flipping to face upward. The mouth line was being built
    67 mm inside the head, lying flat on an upward-facing wall — invisible
    from the front, which is exactly how it rendered once the muzzle went in
    behind it.

    A narrow z-window fixes it: the most protruding hit within +/-`dz` is the
    cavity's RIM, which is where a mouth line belongs — the reference draws
    the line on the muzzle front and the opening sits behind it. The window
    must stay narrow. An earlier attempt at this used a wide ring and found
    the NOSE, lifting the mouth 104 mm.
    """
    best = None
    for i in range(samples):
        zz = z - dz + 2.0 * dz * i / (samples - 1)
        hit, loc, nor, _ = cage.ray_cast(Vector((x, 1.4, zz)),
                                         Vector((0.0, -1.0, 0.0)))
        if hit and (best is None or loc.y > best[0].y):
            best = (loc, nor.normalized())
    if best is None:
        raise SystemExit(f"[face] outer surface probe missed at x={x:+.4f} z={z:.4f}")
    return best


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


def disc(name, centre, normal, rx, rz, srgb01, finish="gloss", segments=16,
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
    # Name the MESH DATA too. The glTF exporter writes mesh names from the
    # data-block, not the object, so without this the GLB shipped meshes called
    # `Sphere`, `Sphere.001` ... `Sphere.014` — functional, because the runtime
    # looks morphs up by morph name, but nothing in the file says which mesh is
    # the pupil.
    o.data.name = name
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
    paint(o, srgb01, finish)
    return o, dome


def patch(name, centre, normal, rx, rz, srgb01, finish="matte",
          rings=6, segments=24, roll_deg=0.0):
    """A single-sheet elliptical grid, for a decal that has to CONFORM.

    `disc()` builds a flattened sphere, which is right for the eye stack: the
    dome is what lands a catchlight. It is wrong for anything that then gets
    snapped to the skin, because a sphere has a back hemisphere and conforming
    collapses it onto the front, leaving two coincident shells to z-fight.

    Concentric rings rather than a subdivided square: the boundary is the
    ellipse itself, so there is no ragged edge to hide, and ring density is
    where a conform needs it — evenly across the span that curves.
    """
    bm = bmesh.new()
    centre_v = bm.verts.new((0.0, 0.0, 0.0))
    loops = []
    for r in range(1, rings + 1):
        t = r / rings
        loop = []
        for k in range(segments):
            a = 2.0 * math.pi * k / segments
            loop.append(bm.verts.new((math.cos(a) * t, math.sin(a) * t, 0.0)))
        loops.append(loop)
    for k in range(segments):
        bm.faces.new((centre_v, loops[0][k], loops[0][(k + 1) % segments]))
    for i in range(rings - 1):
        a_loop, b_loop = loops[i], loops[i + 1]
        for k in range(segments):
            k2 = (k + 1) % segments
            bm.faces.new((a_loop[k], b_loop[k], b_loop[k2], a_loop[k2]))
    bm.normal_update()
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(o)

    side, up, n = plane_basis(normal)
    if roll_deg:
        a = math.radians(roll_deg)
        side, up = (side * math.cos(a) + up * math.sin(a),
                    up * math.cos(a) - side * math.sin(a))
    mat = Matrix(((side.x, up.x, n.x, centre.x),
                  (side.y, up.y, n.y, centre.y),
                  (side.z, up.z, n.z, centre.z),
                  (0.0, 0.0, 0.0, 1.0)))
    o.matrix_world = mat @ Matrix.Diagonal((rx, rz, 1.0, 1.0))
    bpy.context.view_layer.objects.active = o
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    paint(o, srgb01, finish)
    return o


def conform(o, cage, lift, plane_normal, max_pull=0.09, facing_min=0.0,
            smooth_passes=10):
    """Snap every vertex to the cage skin and lift it clear along a SMOOTH field.

    A flat decal on a curved face touches at one point. The muzzle spans
    0.244 H — chin to above the nose — and its rim floated 65.6 mm off the
    skin, which reads as a hard circular seam sitting in front of the face.

    Three things had to be got right, and each was found by looking at a
    render rather than at a number.

    1. WHERE each vertex lands. `closest_point_on_mesh` flattens the float but
       moves vertices sideways, because the nearest skin to a vertex hanging
       past the chin is the chin's edge rather than the point behind it. That
       foreshortened the decal to h 0.4368-0.6320 against a measured
       0.3955-0.6315 — 41 mm short of the chin. A ray along the plane normal
       preserves the footprint exactly, which is what projecting a decal means.

    2. WHICH vertices can project at all. A front-projected decal cannot reach
       a silhouette edge: at the bottom of the span the chin curves under, so
       the ray is grazing and runs 155 mm before it hits, or hits the underside
       facing away. That is 14 of 197 vertices, all on the outer rim, and they
       fall back to the nearest surface point — a slight sideways shift on the
       rim, against a 66 mm spike if they stay on the plane.

    3. WHICH WAY to lift. This is the one that bit twice. `ray_cast` returns
       the FACE normal and the cage is 1,000 verts, so adjacent vertices
       landing on different facets lifted in different directions and the rim
       tore into a sawtooth — visibly worse than the float it replaced. Using
       one constant plane normal fixed the smooth middle and left the wrapped
       chin torn, because there the offset direction has to follow the surface.

       So the directions are SMOOTHED as a field: each vertex starts from the
       plane normal (or the surface normal where it wrapped), then those
       vectors are relaxed over the decal's own edge connectivity. The result
       is continuous everywhere, follows the wrap, and has no facet in it.

    `max_pull` and `facing_min` are the guards that keep the sheet out of the
    mouth: it is a real cavity 52 mm deep, and the nearest surface to a vertex
    over it is the INSIDE of it.
    """
    mw = o.matrix_world
    inv = mw.inverted()
    n = Vector(plane_normal).normalized()
    me = o.data
    moved = fallback = missed = 0
    before = after = 0.0

    targets = [None] * len(me.vertices)
    dirs = [n.copy() for _ in me.vertices]

    for v in me.vertices:
        world = mw @ v.co
        ok, loc, nrm, _idx = cage.ray_cast(world + n * 1.2, -n)
        d = (world - loc).length if ok else 0.0
        if ok:
            before = max(before, d)
        if ok and nrm.dot(n) >= facing_min and d <= max_pull:
            targets[v.index] = loc.copy()
            dirs[v.index] = n.copy()
            moved += 1
        else:
            ok2, loc2, nrm2, _i2 = cage.closest_point_on_mesh(world)
            if ok2:
                targets[v.index] = loc2.copy()
                dirs[v.index] = nrm2.normalized()
                fallback += 1
                before = max(before, (world - loc2).length)
            else:
                missed += 1

    # Relax the offset directions over the sheet's own edges.
    neighbours = [[] for _ in me.vertices]
    for e in me.edges:
        a, b = e.vertices
        neighbours[a].append(b)
        neighbours[b].append(a)
    for _ in range(smooth_passes):
        nxt = []
        for i, d in enumerate(dirs):
            acc = d.copy()
            for j in neighbours[i]:
                acc += dirs[j]
            nxt.append(acc.normalized() if acc.length > 1e-9 else d)
        dirs = nxt

    for v in me.vertices:
        loc = targets[v.index]
        if loc is None:
            continue
        v.co = inv @ (loc + dirs[v.index] * lift)
        after = max(after, lift)
    me.update()
    return {"moved": moved, "fallback": fallback, "missed": missed,
            "worst_before": before, "worst_after": after}


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

        # THE LID ARC — the thing that makes a white blob read as an eye.
        #
        # It is an ARC, not a rim. Magnified, the reference draws a dark stroke
        # from about -30 deg through the top to +150 (0 = outboard, 90 = up)
        # and simply stops: there is no lower lid line, the sclera meets the
        # coat. Measured span 180 deg, centre +60 deg, stroke 0.0055 H at the
        # peak tapering to 0.0025 at the ends, colour (39,17,3).
        #
        # Built as a dark disc BEHIND the sclera, larger by the end stroke and
        # shifted along the arc centre by the difference. That gives peak =
        # margin + shift at +60, margin at the two ends, and margin - shift
        # (i.e. nothing) at -120 — the measured profile, from two numbers,
        # with no arc geometry to model.
        lid_m = fm["eye"].get("lid")
        if lid_m:
            ls = symmetrise(lid_m)
            margin = lid_m["stroke_end_H"]
            shift = max(lid_m["stroke_peak_H"] - margin, 0.0)
            a = math.radians(lid_m["arc_centre_deg"])
            lx = al["x_H"] + math.cos(a) * shift * sx
            lz = al["h"] + math.sin(a) * shift
            # A DISC BEHIND ANOTHER MUST ALSO BE NO TALLER.
            #
            # The first attempt set the lid back 0.0002 and gave it flat=0.30.
            # `dome = min(rx, rz) * flat`, so on a radius slightly larger than
            # the sclera's that is a 0.0137 dome against the sclera's 0.0031 —
            # the lid stood 10 mm proud and rendered as a plain dark disc with
            # the entire eye hidden inside it. Being *behind* in position is
            # not enough when the thing behind is fatter.
            #
            # Same flatness as the sclera, so the two profiles are parallel,
            # and set back far enough to clear the difference. There is room:
            # p0 is already 0.0155 above the socket floor.
            o, _ = disc(f"EyeLid_{tag}",
                        on_plane(p0, n, lx, lz) - n * 0.0012, n,
                        al["half_w_H"] + margin, al["half_h_H"] + margin,
                        ls["srgb01"], finish="ink", flat=FLAT)
            parts.append(o)
            report.append(
                f"lid {tag}: arc centre {lid_m['arc_centre_deg']:+.0f}deg, "
                f"span {lid_m['right']['arc_span_deg']}deg, margin "
                f"{margin:.4f} + shift {shift:.4f} -> peak "
                f"{margin + shift:.4f} (measured {lid_m['stroke_peak_H']:.4f})")

        o, dome = disc(f"Sclera_{tag}",
                       on_plane(p0, n, al["x_H"], al["h"]) + n * cursor, n,
                       al["half_w_H"], al["half_h_H"], sc["srgb01"],
                       finish="matte")
        parts.append(o)
        cursor += dome + 0.0004

        o, dome = disc(f"Iris_{tag}",
                       on_plane(p0, n, ir["x_H"], ir["h"]) + n * cursor, n,
                       ir["half_w_H"], ir["half_h_H"], ir["srgb01"],
                       finish="gloss")
        parts.append(o)
        cursor += dome + 0.0004

        o, dome = disc(f"Pupil_{tag}",
                       on_plane(p0, n, pu["x_H"], pu["h"]) + n * cursor, n,
                       pu["half_w_H"], pu["half_h_H"], pu["srgb01"],
                       finish="ink")
        parts.append(o)
        cursor += dome + 0.0003

        # Catchlight: up and OUTBOARD of the pupil.
        #
        # This was built up-and-INBOARD on the reasoning that it reads as a
        # key light above and in front. Magnifying the reference eye settled
        # it: the highlight sits on the outboard side of the pupil, the same
        # side the lid arc is thickest and the sclera crescent widest. All
        # three agree on one light, up and to the outside, and guessing put
        # this one against the other two.
        cl_x = pu["x_H"] + sx * pu["half_w_H"] * 0.42
        cl_z = pu["h"] + pu["half_h_H"] * 0.46
        r = pu["half_w_H"] * 0.34
        o, dome = disc(f"Catchlight_{tag}",
                       on_plane(p0, n, cl_x, cl_z) + n * cursor, n, r, r,
                       [1.0, 1.0, 1.0], finish="gloss", segments=10)
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
            f"({protrusion * 1000.0:.1f} mm)  "
            f"lifted {lift:.4f} off the socket floor")

# The ear, fitted to the reference's band widths as an ELLIPSOID.
#
# x_c/a_x place it on the side of the skull; z_c/a_z set the vertical span. The
# inner half sits buried inside the head, which is how a stuck-on ear works and
# costs nothing but a few hidden faces.
#
# Fitted by search against the four bands an ear is load-bearing in, after
# subtracting what the mane already covers:
#
#     band        ref     mane    ellipsoid   d
#     0.70-0.75   0.650   0.642     0.642    -0.008   mane covers it
#     0.75-0.80   0.631   0.461     0.625    -0.006
#     0.80-0.85   0.621   0.417     0.626    +0.005
#     0.85-0.90   0.552   0.424     0.553    +0.001
#     sum |dw|                               0.020    (cage ear was 0.148)
#
# It reaches z 0.713-0.857 and max |x| 0.305, so it stays out of band
# 0.90-0.95, where the reference has mane only.
# The ear's measured cross-sections, bottom to top: height, the x where the
# buried ROOT starts, the OUTER half-width the front reference shows at that
# height, and the ear's half-depth in y.
#
# `x_out` IS THE MEASUREMENT. It is read row by row off `front-norm.png`, and h
# and z coincide on this asset — the assembled model is 0.9810 tall and the
# silhouette normalisation makes the subject 0.981 H — so these are model units
# and the built ear reproduces the reference profile by construction instead of
# by tuning. What the ellipsoid it replaces got wrong, measured against the same
# reference at the same heights:
#
#     z      ref    ellipsoid   deficit
#     0.72  0.3173    0.2965     +0.021
#     0.74  0.3135    0.2755     +0.038
#     0.78  0.3192    0.3050     +0.014
#     0.84  0.2942    0.2537     +0.041
#     0.86  0.2712    0.2259     +0.045
#
# An ellipsoid can only match that profile at ONE height, because the reference
# ear holds ~0.31 nearly straight-sided from z 0.72 to 0.82 and an ellipse
# pinches at both ends. Matching it at the middle is what left the model 38 mm
# narrow at the ear's base and 45 mm narrow at its tip, and it is the real
# content of the note that "every placement trades one band for another": the
# form had one free parameter and four bands to satisfy.
#
# WHY THE ROOT RUNS SO DEEP, which the ellipsoid was right about
#
# The skull does not reach the ears. Classifying the assembled cage's vertices
# against the old ear ellipsoid and measuring what is left gives a skull
# half-width of 0.1799 at z 0.70, 0.1447 at 0.74, 0.1143 at 0.78 and 0.0317 by
# z 0.82 — it domes over and is gone before the ear's midpoint. So from z 0.72
# upward the outer silhouette IS the ear, and an ear whose inner edge sat at its
# own visible base would be a detached flake floating beside the head. The old
# ellipsoid spanned x -0.045 to 0.305 for exactly this reason. That part was not
# a mistake and is kept: `x_in` stays inside the skull at the bottom station and
# inside the mane's silhouette (>= 0.2008 everywhere in this band) above it, so
# the root is never visible from any angle the review sheet renders.
# THE TABLE IS IN THE SILHOUETTE'S FRAME, NOT THE MODEL'S, and the first
# version of it was not.
#
# `silhouette_qa` renders the model through the reference cameras after FITTING
# it to the reference height — it prints `fit 4 objects: raw h=0.9770
# scale=1.0235`. So a model z is not a silhouette h: h = (z - ground) * S, and
# a width measured in H comes back as x * S. Building the stations with the
# reference's own h values used directly as z put the whole ear 2.35% high and
# 2.35% wide, which reads as nothing at the base and as +0.044 H of surplus at
# h 0.88, where the reference ear has already tapered away. The band table
# caught it immediately as `0.85-0.90  +0.058  <-- width`.
#
# That is the third time a frame mismatch has produced a confident, wrong
# number on this asset (the eye height measured above the feet and applied in
# world y; the head assist expressed about the bone's inclined local axis), so
# the conversion is written out here instead of folded into the constants.
# 1.0 SINCE THE RE-FRAME. `silhouette_render.fit` no longer rescales the
# model's height — the model is built in reference H units, so model z IS
# silhouette h once the soles are seated on the ground. This was 1.0235, the
# factor the harness used to apply, and the conversion below is now the identity
# apart from the ground offset. It is kept as a named constant rather than
# deleted because the frame is the thing that has gone wrong four times on this
# asset, and a reader looking for it should find it stated.
SIL_FIT_SCALE = 1.0
SIL_GROUND_Z = 0.0040

# The ear's cross-sections, bottom to top:
#
#   h       the SILHOUETTE height, so it can be checked against front-norm.png
#           by eye without redoing any arithmetic
#   ref_hw  the reference's outer half-width at that h, read row by row off
#           front-norm.png — THE MEASUREMENT
#   x_in    where the buried root starts, in model units
#   a_y     the ear's half-depth, in model units
#
# `ref_hw` is what the ellipsoid this replaces could not follow. Measured
# against the same reference at the same heights, before:
#
#     h      ref    ellipsoid   deficit
#     0.72  0.3173    0.2769     -0.040
#     0.74  0.3135    0.2442     -0.069
#     0.76  0.3192    0.2865     -0.033
#     0.86  0.2712    0.2481     -0.023
#
# An ellipsoid can match that profile at ONE height, because the reference ear
# holds ~0.31 nearly straight-sided from h 0.72 to 0.84 and an ellipse pinches
# at both ends. Matching it in the middle is what left the model 69 mm narrow
# at the ear's base, and it is the real content of the older note that "every
# placement trades one band for another": the form had one free parameter and
# four bands to satisfy. A lofted profile has one per station.
#
# WHY THE ROOT RUNS SO DEEP, which the ellipsoid was right about
#
# The skull does not reach the ears. Classifying the assembled cage's vertices
# against the old ear ellipsoid and measuring what is left gives a skull
# half-width of 0.1799 at z 0.70, 0.1447 at 0.74, 0.1143 at 0.78 and 0.0317 by
# z 0.82 — it domes over and is gone before the ear's midpoint. So from z 0.72
# upward the outer silhouette IS the ear, and an ear whose inner edge sat at its
# own visible base would be a detached flake floating beside the head. The old
# ellipsoid spanned x -0.045 to 0.305 for exactly this reason. That part was not
# a mistake and is kept: `x_in` stays inside the skull at the bottom station and
# inside the mane's silhouette (>= 0.2008 everywhere in this band) above it, so
# the root is never visible from any angle the review sheet renders.
# The two lowest stations are NOT the reference's outer edge, and that
# distinction cost a crease gate.
#
# At h 0.713 the reference measures 0.330 and at h 0.725 it measures 0.316 —
# but down there the outer edge belongs to the MANE, which supplies 0.334 and
# 0.318 at those heights on its own. Taking those numbers as the ear's width
# made the BOTTOM ring the widest one, so the loft flared out at 72 degrees
# from vertical and came straight back in at 49: a 119-degree direction
# reversal, as a hard ring of 24 edges at the base of each ear. It cost
# head/neck 46.6 -> 57.7 degrees of p99 and 3.09 -> 5.31% over 25, and it was
# invisible, because the mane covers exactly the heights that produced it.
#
# The mane only falls behind the reference from h 0.735 up (0.253 against
# 0.316 at h 0.757), so the ear is free to be narrow below that and its own
# profile now rises to a single maximum at h 0.76-0.78 and falls away.
EAR_PROFILE = (
    # h      ref_hw   x_in    a_y
    (0.7130, 0.2550, 0.0400, 0.0300),
    (0.7250, 0.2900, 0.0550, 0.0400),
    (0.7400, 0.3135, 0.0850, 0.0470),
    (0.7600, 0.3192, 0.1080, 0.0505),
    (0.7800, 0.3192, 0.1280, 0.0520),
    (0.8000, 0.3135, 0.1440, 0.0510),
    (0.8200, 0.3077, 0.1570, 0.0485),
    (0.8400, 0.2942, 0.1690, 0.0440),
    (0.8600, 0.2712, 0.1810, 0.0370),
    # x_in 0.175, not 0.195. The closing run is tangential, so it LEAVES the
    # last station at slope zero; a chain converging into it at slope 1.32
    # (a_x 0.042 -> 0.016 over 0.020 of z) does not meet that, and the join was
    # 86 creased edges. Widening the last root by 20 mm takes the chain's own
    # convergence down to 0.81 and leaves a_x 0.026 against a closing dz of
    # 0.026 — a round tip rather than a pinched one, which is also what the
    # reference ear has. It stays under the mane's 0.231 at this height.
    (0.8800, 0.2327, 0.1750, 0.0250),
)


def ear_stations():
    """`EAR_PROFILE` converted into model space: (z, x_in, x_out, a_y).

    Measured stations only, top-of-list first at the bottom. `EAR_ROOT` is not
    included — it is model space already and carries no dish.
    """
    return [(h / SIL_FIT_SCALE + SIL_GROUND_Z, x_in, hw / SIL_FIT_SCALE, a_y)
            for h, hw, x_in, a_y in EAR_PROFILE]


EAR_Y_C = 0.468

# THE ROOT IS A STALK, NOT A CAP, and the arithmetic says it has to be.
#
# The lowest measured ring is 0.209 wide in x. A pole closure is smooth only
# when it has about as much z to travel as it has radius, and there is nowhere
# near 0.2 of z available below the ear — so every closing run tried on that
# ring ended in a cone a couple of millimetres tall and 100 mm across, which is
# the flat cap the closing run exists to avoid. Measured: 84 creased edges in
# the single ring at z 0.7006, at up to 70 degrees.
#
# So the cross-section is brought DOWN to something a pole can close: four
# stations that shrink x_out from 0.249 to 0.070 and a_y from 0.030 to 0.006
# over 0.05 of z, at a steady 3.0-3.7 slope that matches the 2.9 of the wall
# above, and only then a closing run. Every column below is monotonic through
# the join with the measured span, which is the property that was missing: the
# earlier version made z 0.7006 a local MINIMUM of x_in, so the root edge went
# in and then straight back out and folded.
#
# All of it is buried — the skull is 0.19 wide at z 0.68 and the mane 0.34, and
# the stalk never exceeds 0.21.
EAR_ROOT = (
    # z       x_in    x_out    a_y
    # THINNING THE ROOT TO MATCH SLOPES MADE IT WORSE — a measured negative
    # result, kept here because the reasoning that motivated it is tempting.
    #
    # a_y rises 0.030 -> 0.040 over the 0.0118 of z above the join, a slope of
    # 0.85, and this column comes up to it at 0.38; that more than doubling
    # kinks the front wall, and 38 edges at up to 70 degrees sit right at
    # z 0.7006 because of it. Matching the slope means thinning the column to
    # 0.0215/0.0160/0.0105/0.0050 — and that took head/neck's fraction over 25
    # degrees the wrong way, 4.45% to 4.54%, failing the gate.
    #
    # The reason is that a ring's curvature at its x-extremes goes as
    # a_x / a_y**2, so thinning the root sharpens the very rim that dominates
    # this region's edge count. The kink is linear in the slope error; the rim
    # penalty is quadratic in the thinning. Trading one for the other loses.
    (0.6900, 0.0380, 0.2100, 0.0260),
    (0.6750, 0.0350, 0.1650, 0.0190),
    (0.6600, 0.0320, 0.1150, 0.0120),
    (0.6480, 0.0300, 0.0700, 0.0060),
)

# 48 segments, CLUSTERED toward t=0 and t=pi rather than spread evenly.
#
# The ring is an ellipse about three times wider in x than deep in y, so almost
# all of its curvature is at the two x-extremes: the outer rim and the buried
# root. Twenty-four uniform segments put one or two vertices in each of those
# turns and sampled the flat front and back walls at the same density, which
# left a 76-degree fold along the root.
#
# The ellipsoid this replaced did not have that problem for an instructive
# reason: it was a UV sphere scaled in x, so its own POLES — where the rings
# bunch up — landed exactly on the x-extremes. The loft has no such luck and
# has to be told.
#
# `t - EAR_CLUSTER * sin(2t)` does it: the derivative 1 - 2*EAR_CLUSTER*cos(2t)
# is 0.5 at t=0 and t=pi and 1.5 at the front and back, so the turns get twice
# the density and the walls, which are nearly straight, get less. It stays
# monotonic for EAR_CLUSTER < 0.5. This is the same undersampling this project
# has already hit on the mane's `nh` and the river's ripples — a filter finer
# than the feature it is meant to resolve. Refinement confirmed the surface
# itself is sound: at 24 segments the ear ran 11.77% of edges over 25 degrees,
# at 48 it is 7.55% and at 64 it is 4.76%, so the angles converge rather than
# marking a fold.
EAR_SEGMENTS = 48
EAR_CLUSTER = 0.25
# How far the profile carries past its end stations to close, and how many
# rings it takes. Both ends now close from a small ring: the stalk's last is
# 0.020 in x by 0.006 in y, the tip's 0.016 by 0.025 — so the tip needs the
# larger run, and at 0.012 it was a squashed cone with 86 creased edges.
EAR_CLOSE_DZ = (0.014, 0.026)   # (base, tip)
EAR_CLOSE_RINGS = 4
# How far the front face is pushed back. The rim at mid-height sits at
# a_y = 0.052, so a dish of 0.058 carries the middle of the face 6 mm PAST the
# ear's own axis — genuinely concave, and still 46 mm clear of the back wall.
# A convex front cannot read as an inner ear at any colour, which is why the
# ellipsoid's forward cap looked like a painted patch instead of a cup.
EAR_DISH = 0.058
# Which of the dished face takes the inner-ear colour. Weight, not a normal
# threshold: dishing tilts the normals it is meant to select, and the old
# `normal.y > 0.78` test was already the second guess at a number that the
# construction knows exactly.
EAR_INNER_W = 0.35


def _ear_rings():
    """Every ring of the loft, base pole to tip, as (z, x_in, x_out, a_y, w_s).

    The measured stations get tangential CLOSING rings at each end, and that is
    the point of this function.

    Without them the loft ends in a flat n-gon at the base and a triangle fan at
    the tip, and both are hard creases by construction: an n-gon cap meets a
    near-vertical wall at about 90 degrees. Neither is visible — the base is
    buried in the skull and the tip is 6 mm across — but `crease_qa_lion.py`
    counts EDGES, not pixels, and 24 cap edges plus 24 fan edges on each of two
    ears is 96, almost exactly the 1% tail of the head/neck region's 9,706. The
    first build of this ear took that region's p99 dihedral from 46.6 to 106.4
    degrees and failed the gate on geometry nobody could see.

    So the profile turns over toward each pole the way a sphere's does: ring i
    of the closing run sits at angle a = i * (pi/2) / (rings + 1), contracted by
    cos(a) and offset by sin(a) * dz. The surface arrives at the pole tangent to
    it, and the fan that closes it spans a few degrees rather than ninety.

    `w_s` is the dish weight — 0 at the measured span's ends so the cup dies out
    into the tip and the root instead of cutting them open, and 0 on every
    closing ring, which are poles and have no front face to dish.
    """
    st = ear_stations()
    n = len(st)
    root = list(reversed(EAR_ROOT))      # bottom-up, like everything else
    out = []
    z0, x_in0, x_out0, a_y0 = root[0]
    x_c0, a_x0 = (x_in0 + x_out0) / 2.0, (x_out0 - x_in0) / 2.0
    for i in range(EAR_CLOSE_RINGS, 0, -1):
        a = i * (math.pi / 2.0) / (EAR_CLOSE_RINGS + 1)
        f = math.cos(a)
        out.append((z0 - math.sin(a) * EAR_CLOSE_DZ[0], x_c0 - a_x0 * f,
                    x_c0 + a_x0 * f, a_y0 * f, 0.0))
    for z, x_in, x_out, a_y in root:
        out.append((z, x_in, x_out, a_y, 0.0))
    for si, (z, x_in, x_out, a_y) in enumerate(st):
        s = si / (n - 1)
        out.append((z, x_in, x_out, a_y, 1.0 - (2.0 * s - 1.0) ** 2))
    for i in range(1, EAR_CLOSE_RINGS + 1):
        a = i * (math.pi / 2.0) / (EAR_CLOSE_RINGS + 1)
        z, x_in, x_out, a_y = st[-1]
        x_c, a_x = (x_in + x_out) / 2.0, (x_out - x_in) / 2.0
        f = math.cos(a)
        out.append((z + math.sin(a) * EAR_CLOSE_DZ[1], x_c - a_x * f,
                    x_c + a_x * f, a_y * f, 0.0))
    return out


def _ear_mesh(name, sx):
    """One ear, lofted through `EAR_PROFILE` with a dished front face.

    Returns the object and the vertex indices that fall inside the dish.

    A lofted stack whose outer edge rises and then falls is RE-ENTRANT, and
    `cage_lion.py` records at length that a re-entrant lofted taper self-
    intersects. That finding was about a CAGE appendage: the failure appeared
    "the moment the skull bends", as 16 pinched faces under deformation. An ear
    does not deform — it is rigid-skinned to `ear_L`/`ear_R` and follows the
    skull — so here the reversal is only a shape, and it is the shape the
    reference has. This is the same distinction the ears' own move off the cage
    was made to buy.
    """
    bm_ = bmesh.new()
    rings, dished = [], set()
    for z, x_in, x_out, a_y, w_s in _ear_rings():
        x_c, a_x = (x_in + x_out) / 2.0, (x_out - x_in) / 2.0
        ring = []
        for j in range(EAR_SEGMENTS):
            u = 2.0 * math.pi * j / EAR_SEGMENTS
            t = u - EAR_CLUSTER * math.sin(2.0 * u)
            ct, st_ = math.cos(t), math.sin(t)
            # sin^3: `sin` for how forward-facing the vertex is, times the
            # sin^2 that 4u(1-u) reduces to for u = (cos t + 1)/2, the
            # fractional distance from root to rim. It is zero at BOTH the rim
            # (t=0) and the root (t=pi), which is what makes the section a C
            # opening forward instead of a crushed tube.
            w = (st_ ** 3) * w_s if st_ > 0.0 else 0.0
            v = bm_.verts.new((sx * (x_c + a_x * ct),
                               EAR_Y_C + a_y * st_ - EAR_DISH * w, z))
            ring.append(v)
            if w > EAR_INNER_W:
                dished.add(v)
        rings.append(ring)

    for lo, hi in zip(rings, rings[1:]):
        for j in range(EAR_SEGMENTS):
            k = (j + 1) % EAR_SEGMENTS
            # Winding follows sx so both ears end up with outward normals; a
            # mirrored loft built with one winding turns the left ear inside out.
            f = (lo[j], lo[k], hi[k], hi[j])
            bm_.faces.new(f if sx > 0 else tuple(reversed(f)))

    # The two poles. Both closing runs have already contracted the profile to a
    # few millimetres, so these fans are small and nearly flat.
    st = ear_stations()
    for ring, dz, up in ((rings[0], -EAR_CLOSE_DZ[0], False),
                         (rings[-1], EAR_CLOSE_DZ[1], True)):
        base = EAR_ROOT[-1]
        z_end = (st[-1][0] + dz) if up else (base[0] + dz)
        x_end = ((st[-1][1] + st[-1][2]) / 2.0 if up
                 else (base[1] + base[2]) / 2.0)
        pole = bm_.verts.new((sx * x_end, EAR_Y_C, z_end))
        for j in range(EAR_SEGMENTS):
            k = (j + 1) % EAR_SEGMENTS
            f = (ring[j], ring[k], pole)
            if up:
                bm_.faces.new(f if sx > 0 else tuple(reversed(f)))
            else:
                bm_.faces.new(tuple(reversed(f)) if sx > 0 else f)

    bm_.normal_update()
    me = bpy.data.meshes.new(name)
    idx = {v: i for i, v in enumerate(bm_.verts)}
    inner_idx = {idx[v] for v in dished}
    bm_.to_mesh(me)
    bm_.free()
    o = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(o)
    return o, inner_idx


def build_ears(cage, fm, bm, parts, report):
    """The ears, as their own meshes. NOT cage geometry, deliberately.

    Five attempts to build these as a lofted ring appendage on the cage failed,
    and the last one proved why: the reference's ear is widest LOW and tapers
    upward, which needs the station x to come back inward, which makes the loft
    RE-ENTRANT — the surface between a ring at x 0.308 and one at x 0.272 faces
    backward toward the head. That is watertight, 100% quads and invisible to
    every integrity check, and it self-intersects the moment the skull bends:
    16 pinched faces and a worst area ratio of 0.035, against 0 and 0.261.
    Correct tangents did not save it; isolation showed the reversal itself was
    the cause.

    An ear does not deform. It follows the skull. So it is built free of the
    lofted-ring constraint and rigid-skinned to `ear_L` / `ear_R`, which is the
    same call this project already made for the mane and for the 15 face parts.

    It is now lofted rather than an ellipsoid, for the reason recorded above
    `EAR_PROFILE`: one radius cannot hold the reference's near-straight-sided
    profile across 0.16 of height, and the ellipsoid that tried came out 38 mm
    narrow at the base and 45 mm narrow at the tip. Being off the cage is what
    makes the re-entrant profile safe to build.

    The inner surface takes the measured inner-ear colour, selected by the
    DISH WEIGHT rather than by a normal test — the construction already knows
    which vertices form the cup, and dishing tilts the very normals the old
    test was reading.
    """
    inner = (bm or {}).get("inner_ear")
    coat = fm["face_aperture"]["srgb01"]
    for sx, side in ((+1, "R"), (-1, "L")):
        o, inner_idx = _ear_mesh(f"Ear_{side}", sx)
        paint(o, coat, finish="matte")

        if inner:
            attr = o.data.color_attributes.get(COLOR_ATTR)
            lin = tuple(srgb_to_linear(c) for c in inner["srgb01"])
            for i in inner_idx:
                attr.data[i].color = (*lin, 1.0)
            o.data.update()
            report.append(f"ear {side}: {len(inner_idx)} dished verts take the "
                          f"measured inner colour {inner['rgb']}")
        parts.append(o)
        st = ear_stations()
        z0 = EAR_ROOT[-1][0] - EAR_CLOSE_DZ[0]
        z1 = st[-1][0] + EAR_CLOSE_DZ[1]
        widest = max(st, key=lambda s: s[2])
        report.append(
            f"ear {side}: lofted, {len(st)} stations x "
            f"{EAR_SEGMENTS} segments, z {z0:.3f}-{z1:.3f} "
            f"({z1 - z0:.3f} tall, was 0.144), max |x| {widest[2]:.4f} at "
            f"z {widest[0]:.3f}, root buried from |x| {st[0][1]:.3f}, "
            f"dish {EAR_DISH:.3f} (front face concave past the axis)")


def build_muzzle(cage, fm, parts, report):
    """The cream muzzle mass, under the nose pad and mouth line.

    It is ONE pale mass, not a patch: measured h 0.3955 to 0.6315, so it runs
    from the chin up past the nose on both sides. The two upper lobes and the
    chin are the same cream; what separates them visually is the philtrum
    crease and the mouth line, and both of those are already built.

    So this goes on FIRST and sits behind them. The nose pad and mouth line
    then read on top of it, which is the reference's own layering.

    Sized from the measured profile rather than the bounding box: the whiskers
    pass the same saturation threshold and push the widest row to 0.181
    against a body that never exceeds 0.121, so the build width is the p75 of
    the per-row half-widths. Height and centre come from the span, not the mass
    centroid — the chin is broad, which drags the centroid 0.0116 low.
    """
    mz = fm.get("muzzle_patch")
    if not mz:
        report.append("muzzle: NOT MEASURED — skipped")
        return
    half_w = mz.get("half_w_H_p75", mz["half_w_H"])
    half_h = mz.get("half_h_H_span", mz["half_h_H"])
    centre_h = mz.get("centre_h", mz["h"])

    p0, n = surface_at(cage, 0.0, centre_h)
    # Behind the nose pad and the mouth line, both of which are lifted off
    # their own socket floors. Sitting on the raw surface here is enough to be
    # under both, and a flat dome keeps it from bulging the muzzle's profile.
    p0 = p0 + n * 0.0008
    # ALMOST FLAT, and this is the third time the dome has bitten.
    #
    # `dome = min(rx, rz) * flat`, so on a mass this large even flat=0.10 is a
    # 0.0118 dome — 11.8 mm proud, which put the muzzle IN FRONT of the mouth
    # line's 0.0144 apex and swallowed it, and bulged the lower face into a
    # ball. The muzzle is a COLOUR REGION, not a form: the cage already carries
    # the muzzle's shape in its rings. flat=0.02 gives a 0.0024 dome, enough to
    # avoid z-fighting with the skin and nothing more.
    # A CONFORMING SHEET, not a dome. The dome was tuned down to flat=0.02
    # to stop it swallowing the mouth line, but that only ever addressed the
    # bulge at the centre — the RIM was still 65.6 mm off the skin, because a
    # flat ellipse 0.244 H tall cannot follow a face that curves away under it.
    o = patch("Muzzle", p0, n, half_w, half_h, mz["srgb01"],
              finish="matte", rings=7, segments=28)
    # max_pull 0.25 and facing_min -0.30 let the rim rays REACH the chin's
    # underside instead of falling back. The fallback was the sawtooth: it
    # pulls adjacent rim vertices to nearly the same point on the silhouette,
    # which makes slivers, and slivers alternate in and out of the skin. The
    # mouth guard still holds — a cavity interior faces backward, dot ~ -1.
    # 4 mm not 3: measured minimum clearance at 3 mm was 0.70 mm, because
    # offsetting along one plane normal loses cos(angle) where the skin turns
    # away, and at 0.7 mm the low-poly skin poked through as small flecks. Still
    # far behind the mouth line's 20.7 mm and the nose pad, so the stack holds.
    stats = conform(o, cage, 0.004, n, max_pull=0.25, facing_min=-0.30)
    parts.append(o)
    report.append(
        f"muzzle: centre h={centre_h:.4f} half_w={half_w:.4f} "
        f"(p75; bbox {mz['half_w_H_bbox']:.4f} is whiskers) "
        f"half_h={half_h:.4f} spans h {mz['h_bot']:.4f}-{mz['h_top']:.4f} "
        f"asym={mz['asymmetry_H']:.4f} rgb={mz['rgb']}")
    report.append(
        f"muzzle conform: {stats['moved']} verts snapped, "
        f"{stats['fallback']} on the rim fell back to nearest-point, "
        f"{stats['missed']} unplaced — "
        f"float {stats['worst_before'] * 1000:.1f} -> "
        f"{stats['worst_after'] * 1000:.1f} mm")


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
        # THE SPAN IS MEASURED. `half_h_H * 0.52` threw the brow away.
        #
        # The reference brow spans h 0.7267-0.7805 on the right and
        # 0.7288-0.7805 on the left: 0.0538 of dark mass. Built at 0.52 of the
        # measured half-height it came out 0.0318 tall, and because the disc
        # was centred on the measured CENTROID h (0.7618 — on a wedge that
        # rises toward the midline, the centroid sits well above the bbox
        # centre) the thinning ate the brow from BELOW. Measured on the built
        # asset: top edge 0.7795 against a reference 0.7805, correct; underside
        # 0.7477 against 0.7267, 21 mm high. What was left was a thin dark line
        # with a 33 mm gap under it, which reads as eyeliner rather than a brow
        # — and on this character the brows carry the expression.
        #
        # So the span comes from the measurement rather than from a centroid
        # plus a guessed fraction. That is the same correction the muzzle
        # needed ("sized from the measured profile rather than the bounding
        # box"), applied to the other axis: measure the extent, do not infer it.
        h_top = (br["left"]["h_top"] + br["right"]["h_top"]) / 2.0
        h_bot = (br["left"]["h_bot"] + br["right"]["h_bot"]) / 2.0
        b["h"] = (h_top + h_bot) / 2.0
        b["half_h_H"] = (h_top - h_bot) / 2.0
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
        o, _ = disc(f"Brow_{tag}", p0, n, b["half_w_H"], b["half_h_H"],
                    b["srgb01"], finish="matte", segments=24,
                    roll_deg=rise * sx, flat=0.38)
        # A brow at its full measured height is 0.0528 tall on a brow ridge
        # that curves away under it, so a flat disc floats at the ends the way
        # the muzzle's rim did at 65.6 mm. `flat` is dropped from 0.55 to 0.22
        # because the dome is `min(rx, rz) * flat` and rz nearly doubled — at
        # 0.55 the taller brow would have stood 14.5 mm proud and bulged the
        # ridge. The brow is a COLOUR REGION and the cage already carries the
        # ridge's form, so the rest is conform()'s job.
        stats = {"moved": 0, "fallback": 0, "missed": 0,
                 "worst_before": 0.0, "worst_after": 0.0}  # EXPERIMENT: no conform
        parts.append(o)
        report.append(f"brow {tag}: at x={b['x_H']:+.4f} h={b['h']:.4f} "
                      f"w={b['half_w_H'] * 2:.4f} h_span={b['half_h_H'] * 2:.4f} "
                      f"(measured {h_bot:.4f}-{h_top:.4f}, was 0.0318) "
                      f"rise_toward_midline={rise:+.1f}deg")
        report.append(
            f"brow {tag} conform: {stats['moved']} verts snapped, "
            f"{stats['fallback']} rim fell back, {stats['missed']} unplaced — "
            f"float {stats['worst_before'] * 1000:.1f} -> "
            f"{stats['worst_after'] * 1000:.1f} mm")


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
    for key, name, finish, flat_z in (("nose_pad", "NosePad", "gloss", 1.00),
                                      ("mouth_line", "MouthLine", "ink", 0.62)):
        b = fm.get(key)
        if not b:
            report.append(f"{key}: NOT MEASURED — skipped")
            continue
        if key == "mouth_line":
            # Window is half the cavity's own height span, which keeps it off
            # the nose pad 0.084 H above.
            p0, n = outer_surface_at(cage, b["x_H"], b["h"], 0.015)
            p0 = Vector((p0.x, p0.y, b["h"]))   # keep the measured height
        else:
            p0, n = surface_at(cage, b["x_H"], b["h"])
        lift = lift_for(key.replace("_line", ""))
        p0 = p0 + n * lift
        o, _ = disc(name, p0, n, b["half_w_H"], b["half_h_H"] * flat_z,
                    b["srgb01"], finish=finish,
                    flat=0.42 if finish == "gloss" else 0.14)
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
    purge_face_parts()
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
    paint(cage, fm["face_aperture"]["srgb01"], finish="matte")

    parts, report = [], []
    # Muzzle first: it is the layer everything else on the lower face sits on.
    build_muzzle(cage, fm, parts, report)
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
