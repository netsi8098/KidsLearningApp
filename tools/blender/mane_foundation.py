"""
mane_foundation.py — the mane as a measured teardrop hood.

LEVEL 1 of the three-level plan, and the level that decides identity. The brief
is explicit that the foundation must read correctly with no individual locks at
all, so this builds no locks: one coherent hood whose every dimension is read out
of the reference.

WHY A HOOD AND NOT A BALL
Three earlier attempts accumulated spheres and produced a scalloped ball. The
mane is not a mass near the head — it is a hood with an opening the face projects
through, and its cross-sections are measurable:

    front view  ->  mane WIDTH against height        (widest 0.708 H at h=0.62)
    side view   ->  mane TOP and BOTTOM against depth (u 0.08 .. 0.49)
    rear view   ->  mane width from behind           (18% narrower; documented)

So the hood is a ring tube along the fore-aft axis, each ring sized from those
profiles. Nothing here is typed by hand except the LEVEL 2 clump placements,
which are named.

The face is NOT cut out. The muzzle projects 0.106 H beyond the mane's front edge
(measured), so with the mane as separate geometry the head simply emerges through
the front cap and occludes the interior. A boolean would only add a seam.

Run:
  blender --background --factory-startup --python tools/blender/mane_foundation.py

Outputs:
  art/blender/lion_mane_foundation.blend
  docs/assets/mane/{front,side,rear,three-quarter}.png
"""

import json
import math
import os
import sys

import bmesh
import bpy
from mathutils import Vector

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
VIEWS = os.path.join(REPO, "art", "blender", "references", "turnaround-views")
BLEND_OUT = os.path.join(REPO, "art", "blender", "lion_mane_foundation.blend")
PREVIEW = os.path.join(REPO, "docs", "assets", "mane")

MODEL = json.load(open(os.path.join(VIEWS, "reference_model.json")))
LM = MODEL["landmarks"]
SIDE_LEN = LM["side_length_H"]

NSEG = 24          # ring segments; the hood is a broad form and wants resolution
NRING = 30         # stations along the mane's depth


def nearest(d, key):
    """Nearest-key lookup into a measured profile."""
    kf = float(key)
    best = min(d, key=lambda k: abs(float(k) - kf))
    return d[best]


def mane_width_at_h(h, view="front"):
    prof = MODEL["views"][view]["mane_width"]
    return nearest(prof, f"{h:.3f}")["half_w"] * 2.0


def mane_depth_at_u(u):
    """Full vertical extent of the mane at fore-aft u.

    `lowest`, not `first_bottom`. A column through the mane can hit the hood,
    then a gap where the face interrupts it, then the chest ruff below — so the
    bottom of the FIRST run describes only the upper mass. Using it made the hood
    0.478 H tall against a measured band of 0.791 H, and the chest framing simply
    was not there.
    """
    prof = MODEL["views"]["side"]["mane_depth"]
    e = nearest(prof, f"{u:.4f}")
    return e["top"], e["lowest"]


# ── LEVEL 2: the major sculpted clumps ──────────────────────────────────────
# Named, deliberately few, and placed to break the hood into the large forms the
# reference actually shows. Not a blanket of locks: each one has a job.
#   (name, azimuth deg, elevation deg, strength, radius)
# Azimuth 0 = forward, 90 = right, 180 = back. Strength is a fraction of the
# local hood radius.
# LEVEL 2 clumps, in the mane's OWN coordinates.
#   (name, azimuth deg, s_centre, amplitude, azimuth sigma deg, s sigma)
# Azimuth 0 = +X (the character's right in front view), 90 = up, 270 = down.
# `s` runs 0 at the face rim to 1 at the back of the hood. Amplitude is a
# fraction of the local (outer - aperture) radius.
#
# Placing clumps in this frame rather than as 3D directions is what finally made
# them read: the fan's parameterisation already follows the mane's flow, so a
# bump here becomes a lock rather than a dent in a tube.
CLUMPS = [
    ("crown",      90.0, 0.30, 0.17, 30.0, 0.42),
    ("quiff",      90.0, 0.07, 0.21, 24.0, 0.26),
    ("upper_R",    50.0, 0.28, 0.14, 26.0, 0.42),
    ("upper_L",   130.0, 0.28, 0.14, 26.0, 0.42),
    ("cheek_R",     8.0, 0.30, 0.15, 26.0, 0.42),
    ("cheek_L",   172.0, 0.30, 0.15, 26.0, 0.42),
    ("lower_R",   -40.0, 0.32, 0.14, 28.0, 0.42),
    ("lower_L",   220.0, 0.32, 0.14, 28.0, 0.42),
    ("chest",     270.0, 0.34, 0.17, 32.0, 0.46),
    ("rear_R",     40.0, 0.72, 0.10, 32.0, 0.34),
    ("rear_L",    140.0, 0.72, 0.10, 32.0, 0.34),
]


def polar_radius():
    """Measured mane radius against azimuth, mirror-averaged.

    The drawing is not symmetric — 45 deg reads 0.261 H against 0.338 H at its
    mirror — but the character must be.
    """
    raw = {float(k): v for k, v in LM["mane_polar_front"].items()}
    keys = sorted(raw)

    def at(a):
        a %= 360.0
        return raw[min(keys, key=lambda k: min(abs(k - a), 360 - abs(k - a)))]

    return lambda a: 0.5 * (at(a) + at(180.0 - a))


def widest_depth_u():
    """Which fore-aft station carries the most mane, from the side view.

    Needed because no single view says where along its depth the mane is widest,
    and guessing put the widest ring 45% of the way back — which turned the fan
    into a megaphone flaring away from the head. The side view's tallest mane
    column is the honest proxy for where the mass sits.
    """
    prof = MODEL["views"]["side"]["mane_depth"]
    best_u, best_h = 0.2, 0.0
    for k, e in prof.items():
        span = e["top"] - e["lowest"]
        if span > best_h:
            best_h, best_u = span, float(k)
    return best_u, best_h


def build_hood(naz=40, nring=26):
    """Two-view construction: the side view sets height, the front sets width.

    Three sweeps failed because each guessed a parameterisation and then checked
    it — a tube that enclosed the head, a collar, a megaphone. The brief names the
    actual requirement: "the mesh should be designed so that matching the front
    view does not destroy the side view." So constrain BOTH at once.

    For every ring at depth u the vertical extent comes straight from the side
    view's mane column. Then, for each vertex on that ring, its own HEIGHT is
    looked up in the front view's mane width profile, and that is the width it is
    allowed. Both projections are therefore correct by construction rather than
    by iteration.

    The front portion is an annulus: at the face's depth the mane exists only
    outside the face, which is what makes it a hood with an opening instead of a
    shell over the head.
    """
    prof_side = MODEL["views"]["side"]["mane_depth"]
    u0 = LM["mane_span_side"]["front_u"]
    u1 = LM["mane_span_side"]["rear_u"]
    u_wide, _ = widest_depth_u()
    r_out = polar_radius()
    fc = LM["face_centre_front"]
    face_r = LM["body_widest_front"]["width"] * 0.53

    def front_half_w(h):
        return nearest(MODEL["views"]["front"]["mane_width"], f"{h:.3f}")["half_w"]

    def taper(u):
        """How much of the front-view width this depth is allowed."""
        if u <= u_wide:
            k = (u - u0) / max(1e-6, u_wide - u0)
            k = k * k * (3.0 - 2.0 * k)
            return 0.55 + 0.45 * k
        k = (u - u_wide) / max(1e-6, u1 - u_wide)
        k = k * k * (3.0 - 2.0 * k)
        return 1.0 - 0.55 * k

    clumps = [(math.radians(az), sc, amp, math.radians(asig), ssig)
              for _n, az, sc, amp, asig, ssig in CLUMPS]

    def clump_gain(a, t):
        g = 0.0
        for ac, sc, amp, asig, ssig in clumps:
            da = (a - ac + math.pi) % (2.0 * math.pi) - math.pi
            ds = t - sc
            g += amp * math.exp(-(da * da) / (2.0 * asig * asig)) \
                     * math.exp(-(ds * ds) / (2.0 * ssig * ssig))
        return g

    bm = bmesh.new()
    outer, inner = [], []
    for i in range(nring + 1):
        t = i / nring
        u = u0 + (u1 - u0) * t
        e = nearest(prof_side, f"{u:.4f}")
        top, bot = e["top"], e["lowest"]
        cz, rz = (top + bot) / 2.0, max(0.02, (top - bot) / 2.0)
        y = (0.5 - u) * SIDE_LEN
        tp = taper(u)
        # Aperture fades out behind the face.
        ap = max(0.0, 1.0 - t / 0.42)
        ap = ap * ap * (3.0 - 2.0 * ap)

        o_row, i_row = [], []
        for k in range(naz):
            a = 2.0 * math.pi * k / naz
            z = cz + rz * math.sin(a)
            allowed = front_half_w(max(0.0, z)) * tp * (1.0 + clump_gain(a, t))
            x = allowed * math.cos(a)
            o_row.append(bm.verts.new((x, y, z)))
            fr = face_r * ap
            i_row.append(bm.verts.new((fr * math.cos(a) * 0.98, y,
                                       fc["h"] + fr * math.sin(a) * 1.04)))
        outer.append(o_row)
        inner.append(i_row)

    for r in range(nring):
        A, B = outer[r], outer[r + 1]
        C, D = inner[r], inner[r + 1]
        for k in range(naz):
            m = (k + 1) % naz
            bm.faces.new((A[k], A[m], B[m], B[k]))
            bm.faces.new((C[k], D[k], D[m], C[m]))

    # Front rim joins the two shells; the back closes outer to inner.
    for pair, flip in ((0, False), (nring, True)):
        A, B = outer[pair], inner[pair]
        for k in range(naz):
            m = (k + 1) % naz
            if flip:
                bm.faces.new((A[k], B[k], B[m], A[m]))
            else:
                bm.faces.new((A[m], B[m], B[k], A[k]))

    bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
    me = bpy.data.meshes.new("LionMane")
    bm.to_mesh(me)
    bm.free()
    for p in me.polygons:
        p.use_smooth = True
    obj = bpy.data.objects.new("LionMane", me)
    bpy.context.scene.collection.objects.link(obj)
    print(f"[mane] two-view hood: {len(me.vertices)} verts, {len(me.polygons)} faces, "
          f"u {u0:.2f}..{u1:.2f}, widest at u={u_wide:.2f}, "
          f"face r={face_r:.3f} H, {len(CLUMPS)} clumps")
    return obj


def apply_clumps(obj):
    """Push the surface out along named directions to form the major clumps.

    Radial displacement about the hood's own centre, not added primitives. A
    clump has to be part of the same surface or it reads as a lump stuck on —
    which is what every sphere-accumulation attempt produced.
    """
    me = obj.data
    me.calc_loop_triangles()
    u0 = LM["mane_span_side"]["front_u"]
    u1 = LM["mane_span_side"]["rear_u"]
    y_front = (0.5 - u0) * SIDE_LEN
    y_rear = (0.5 - u1) * SIDE_LEN
    centre = Vector((0.0, (y_front + y_rear) / 2.0,
                     (LM["mane_band"]["low"] + LM["mane_band"]["high"]) / 2.0))
    # Displace along the VERTEX NORMAL, not radially from one centre. A radial
    # push from a single point flattens against the hood's own curvature and the
    # relief disappeared entirely once the result was normalised back to size.
    normals = {v.index: Vector(v.normal) for v in me.vertices}

    dirs = []
    for name, az, el, strength, radius in CLUMPS:
        a, e = math.radians(az), math.radians(el)
        d = Vector((math.sin(a) * math.cos(e), math.cos(a) * math.cos(e), math.sin(e)))
        dirs.append((name, d.normalized(), strength, radius))

    moved = 0
    for v in me.vertices:
        r = v.co - centre
        if r.length < 1e-6:
            continue
        rn = r.normalized()
        total = 0.0
        for _name, d, strength, radius in dirs:
            c = rn.dot(d)
            if c <= 0.0:
                continue
            # Angular falloff: cos raised so each clump stays local.
            f = c ** (1.0 / max(0.08, radius))
            total += strength * f
        if total > 0.0:
            nrm = normals.get(v.index, rn)
            if nrm.length < 1e-6:
                nrm = rn
            v.co = v.co + nrm.normalized() * min(total, 0.42) * 0.16
            moved += 1
    print(f"[mane] {len(CLUMPS)} clumps applied to {moved} verts")


def fit_to_measured(obj):
    """Scale the clumped hood back onto the measured envelope.

    The clumps shape the surface; the reference sets its size. Applied as radial
    displacement they add up to ~30% expansion, which took the width to 0.907 H
    against a measured 0.708 — the form was right and the dimensions were not.
    Normalising afterwards keeps both: clumps decide silhouette, measurement
    decides extent.
    """
    me = obj.data
    pts = [v.co for v in me.vertices]
    mn = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
    mx = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
    have = mx - mn

    u0 = LM["mane_span_side"]["front_u"]
    u1 = LM["mane_span_side"]["rear_u"]
    want = Vector((LM["mane_widest"]["width"],
                   (u1 - u0) * SIDE_LEN,
                   LM["mane_band"]["high"] - LM["mane_band"]["low"]))
    k = Vector((want.x / have.x if have.x > 1e-6 else 1.0,
                want.y / have.y if have.y > 1e-6 else 1.0,
                want.z / have.z if have.z > 1e-6 else 1.0))
    # Target placement: mane band bottom on its measured height, fore-aft span on
    # its measured stations, centred on x.
    y_rear = (0.5 - u1) * SIDE_LEN
    for v in me.vertices:
        v.co = Vector((
            (v.co.x - (mn.x + mx.x) / 2.0) * k.x,
            y_rear + (v.co.y - mn.y) * k.y,
            LM["mane_band"]["low"] + (v.co.z - mn.z) * k.z,
        ))
    print(f"[mane] fitted: scale {tuple(round(c, 3) for c in k)} -> "
          f"w={want.x:.4f} d={want.y:.4f} h={want.z:.4f}")


def smooth_and_subdivide(obj):
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    sub = obj.modifiers.new("Subdiv", "SUBSURF")
    sub.levels = sub.render_levels = 2
    bpy.ops.object.modifier_apply(modifier=sub.name)
    sm = obj.modifiers.new("Relax", "SMOOTH")
    # Light. A relax pass strong enough to hide the ring seams also erases the
    # clump relief the whole level-2 pass exists to create.
    sm.factor = 0.16
    sm.iterations = 1
    bpy.ops.object.modifier_apply(modifier=sm.name)
    print(f"[mane] after subdiv: {len(obj.data.vertices)} verts, "
          f"{len(obj.data.polygons)} faces")


def import_donor_body():
    """Bring in the proven cage so the hood is judged against a real head."""
    donor = os.path.join(REPO, "art", "blender", "lion_anim_cage.blend")
    before = set(bpy.data.objects)
    with bpy.data.libraries.load(donor, link=False) as (src, dst):
        dst.objects = [n for n in src.objects if n in ("LionCage",)]
    # Blender pulls in dependencies, so the armature arrives with the mesh even
    # though only the mesh was requested. Filter by type rather than assuming.
    added = []
    for o in bpy.data.objects:
        if o in before:
            continue
        if o.type != "MESH":
            continue
        bpy.context.scene.collection.objects.link(o)
        # Strip the armature modifier so the body sits in its rest pose.
        for m in list(o.modifiers):
            o.modifiers.remove(m)
        o.parent = None
        added.append(o)
        print(f"[mane] donor body: {o.name}, {len(o.data.vertices)} verts")
    return added


def clay_render(objs):
    sc = bpy.context.scene
    sc.render.engine = "BLENDER_EEVEE"
    sc.render.resolution_x = sc.render.resolution_y = 620
    sc.view_settings.view_transform = "Standard"
    os.makedirs(PREVIEW, exist_ok=True)

    w = bpy.data.worlds.new("ClayWorld")
    w.use_nodes = True
    w.node_tree.nodes["Background"].inputs[0].default_value = (0.44, 0.43, 0.42, 1)
    w.node_tree.nodes["Background"].inputs[1].default_value = 0.9
    sc.world = w

    clay = bpy.data.materials.new("Clay")
    clay.use_nodes = True
    b = clay.node_tree.nodes.get("Principled BSDF")
    b.inputs["Base Color"].default_value = (0.72, 0.70, 0.67, 1)
    b.inputs["Roughness"].default_value = 0.60
    for o in objs:
        o.data.materials.clear()
        o.data.materials.append(clay)

    for name, loc, energy in (("K", (2.2, -2.0, 2.3), 260), ("F", (-2.6, -1.3, 1.2), 90),
                              ("R", (-0.5, 2.7, 2.0), 120)):
        d = bpy.data.lights.new(name, "AREA")
        d.energy, d.size = energy, 6.0
        o = bpy.data.objects.new(name, d)
        o.location = loc
        o.rotation_euler = (Vector((0, 0, 0.5)) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
        sc.collection.objects.link(o)

    cd = bpy.data.cameras.new("ClayCam")
    cd.lens = 62.0
    cam = bpy.data.objects.new("ClayCam", cd)
    sc.collection.objects.link(cam)
    sc.camera = cam
    target = Vector((0.0, 0.0, 0.50))
    for view, yaw in (("front", 180), ("side", 90), ("rear", 0), ("three-quarter", 143)):
        a = math.radians(yaw)
        dist = 2.9
        cam.location = (target.x + math.sin(a) * dist, target.y - math.cos(a) * dist,
                        target.z + dist * 0.10)
        cam.rotation_euler = (target - Vector(cam.location)).to_track_quat("-Z", "Y").to_euler()
        sc.render.filepath = os.path.join(PREVIEW, f"{view}.png")
        bpy.ops.render.render(write_still=True)


def main():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    mane = build_hood()
    smooth_and_subdivide(mane)
    # Fit LAST. Catmull-Clark plus a relax pass pull a tube inward, and fitting
    # before them left the final width 17% under the measurement even though the
    # pre-modifier mesh was exact. Normalising afterwards is a per-axis scale, so
    # the clump relief is preserved in proportion.
    fit_to_measured(mane)
    body = import_donor_body()

    pts = [v.co for v in mane.data.vertices]
    mw = max(p.x for p in pts) - min(p.x for p in pts)
    mh = max(p.z for p in pts) - min(p.z for p in pts)
    ml = max(p.y for p in pts) - min(p.y for p in pts)

    clay_render([mane] + body)
    bpy.ops.wm.save_as_mainfile(filepath=BLEND_OUT)

    print("\n===MANE_FOUNDATION===")
    print(f"BLEND={BLEND_OUT}")
    print(f"VERTS={len(mane.data.vertices)} FACES={len(mane.data.polygons)}")
    print(f"MANE_WIDTH={mw:.4f}  reference {LM['mane_widest']['width']:.4f}  "
          f"err {100 * (mw - LM['mane_widest']['width']) / LM['mane_widest']['width']:+.1f}%")
    print(f"MANE_HEIGHT={mh:.4f}  reference band "
          f"{LM['mane_band']['high'] - LM['mane_band']['low']:.4f}")
    print(f"MANE_DEPTH={ml:.4f}  reference "
          f"{(LM['mane_span_side']['rear_u'] - LM['mane_span_side']['front_u']) * SIDE_LEN:.4f}")
    print(f"CLUMPS={len(CLUMPS)}")
    print("===MANE_FOUNDATION_END===")


if __name__ == "__main__":
    main()
