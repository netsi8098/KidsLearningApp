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
# LEVEL 2, rebuilt: LOCKS, not lumps.
#
# The table below is the macro lobe set and it is right — crown, quiff, cheeks,
# chest. What was wrong is the KERNEL it is evaluated through. Every entry was
# broad in BOTH axes (azimuth sigma 26-32 deg, station sigma 0.42 out of a
# station range of 1.0), so each one was an isotropic Gaussian blob. Eleven
# round blobs on a hood do not read as a mane; they read as a lumpy rock, which
# is what the isolated render showed.
#
# A lock has direction. It is NARROW across the flow and LONG along it, and on
# this parameterisation the flow runs with the depth station — a lock starts near
# the face and sweeps back over the mane. So locks are generated with a small
# azimuth sigma and a large station sigma, spaced around the azimuth, and the
# named lobes stay as low-frequency mass underneath them.
#
# Amplitudes stay modest because `fit_to_measured` normalises the envelope
# afterwards: relief decides silhouette, measurement decides extent.
def lock_ring(count, amp, asig, ssig, station, phase=0.0, az_from=-90.0,
              az_to=270.0):
    """`count` locks evenly spaced in azimuth, each long in station."""
    out = []
    span = az_to - az_from
    for i in range(count):
        az = az_from + span * ((i + 0.5) / count) + phase
        out.append((f"lock_{station:.2f}_{i}", az, station, amp, asig, ssig))
    return out


# Three overlapping rows so locks read as layered rather than combed once. The
# phase offset stops row 2 sitting exactly on row 1 and doubling its amplitude.
LOCKS = (lock_ring(22, 0.170, 6.0, 0.30, 0.30)
         + lock_ring(18, 0.140, 7.0, 0.26, 0.58, phase=9.0)
         + lock_ring(14, 0.110, 8.0, 0.22, 0.80, phase=-6.0))

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
] + LOCKS


def polar_radius(smooth_deg=22.5):
    """Measured mane radius against azimuth: mirror-averaged, smoothed, interpolated.

    *** UNUSED. Kept for the measurement, not called by the build. ***

    Worth being blunt about: I improved this function believing it shaped every
    cross-section, and it changed the render not at all — because nothing calls
    it. `build_hood` shapes its rings from `front_half_w`, a different profile.
    The faults below were real faults in this code and the notes are worth
    keeping if it is ever wired in, but fixing them fixed nothing, and a reader
    should not think otherwise.

    Two faults, and they compounded.

    Nearest-neighbour lookup. The table is sampled every 5 degrees, so `at()`
    returned a STEP FUNCTION: every ring of the hood was a 72-sided polygon
    whose radius jumped between facets instead of curving. Subdivision cannot
    remove that — the hard corners are in the geometry, which is exactly why
    38,016 verts of 100% quads with every face smooth-shaded still rendered
    with visible planar creases.

    And the raw signal is NOISY, so those steps were large. Measured, adjacent
    5-degree samples disagree by up to 22%:

        20 deg 0.2955 -> 25 deg 0.2385     -19%
        65 deg 0.3239 -> 70 deg 0.3664     +13%
       130 deg 0.3712 -> 135 deg 0.3120    -16%
       150 deg 0.2843 -> 155 deg 0.3482    +22%

    None of that is mane shape. It is the reference's own lock shading and the
    places where the auburn mask is ambiguous against the ear and the shadow
    under the jaw. `measured_front_half_w` already smooths the front width
    profile with a 5% window for exactly this reason; the polar radius never
    got the same treatment, and it is the profile that sets every cross-section.

    So: circular moving average over +/-`smooth_deg`, then linear interpolation
    between samples. The crown lobe and the cheek waist are far wider than the
    window and survive; 5-degree spikes do not. Locks belong to LEVEL 2, where
    they are placed deliberately and named, not inherited from segmentation
    noise.
    """
    raw = {float(k) % 360.0: float(v) for k, v in LM["mane_polar_front"].items()}
    keys = sorted(raw)
    step = 360.0 / len(keys)

    # Mirror-average first: the drawing is not symmetric — 45 deg reads 0.261 H
    # against 0.338 H at its mirror — but the character must be.
    def sample(a):
        return raw[min(keys, key=lambda k: min(abs(k - a % 360.0),
                                               360.0 - abs(k - a % 360.0)))]

    mirrored = [0.5 * (sample(k) + sample(180.0 - k)) for k in keys]

    # Circular moving average. Circular because azimuth wraps: a window at
    # 355 deg has to reach past 0, and clamping there would flatten the chest
    # lobe that straddles 270.
    half = max(1, int(round(smooth_deg / step)))
    n = len(mirrored)
    smoothed = []
    for i in range(n):
        acc = 0.0
        for j in range(i - half, i + half + 1):
            acc += mirrored[j % n]
        smoothed.append(acc / (2 * half + 1))

    def at(a):
        a %= 360.0
        f = a / step
        i0 = int(math.floor(f)) % n
        i1 = (i0 + 1) % n
        k = f - math.floor(f)
        return smoothed[i0] + (smoothed[i1] - smoothed[i0]) * k

    return at


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


def measured_front_half_w():
    """The reference front half-width against height, smoothed, as a lookup.

    Shared by the hood construction and the fitting stage. It used to be a local
    closure inside build_hood, which meant the fit stage had no idea what shape it
    was fitting TO and could only match a single scalar.
    """
    raw = MODEL["views"]["front"]["mane_width"]
    hs = sorted(float(k) for k in raw)
    vals = [raw[f"{h:.3f}"]["half_w"] for h in hs]
    win = max(3, int(0.05 * len(hs)))
    sm = []
    for i in range(len(vals)):
        a, b = max(0, i - win // 2), min(len(vals), i + win // 2 + 1)
        sm.append(sum(vals[a:b]) / (b - a))
    table = list(zip(hs, sm))

    def at(h):
        if h <= table[0][0]:
            return table[0][1]
        if h >= table[-1][0]:
            return table[-1][1]
        for (h0, v0), (h1, v1) in zip(table, table[1:]):
            if h0 <= h <= h1:
                k = (h - h0) / max(1e-9, h1 - h0)
                return v0 + (v1 - v0) * k
        return table[-1][1]
    return at


def build_hood(nh=56, nring=30):
    """
    RESOLUTION NOTE (2026-09-03). nh was 22, which gives 44 samples around the
    closed outline — one every 8.2 degrees. Locks with an azimuth sigma of 7.5
    degrees therefore spanned barely one sample and were invisible: raising the
    clump count from 11 to 65 changed the render not at all, because the mesh
    could not carry them. Nyquist, on a mane.
    nh=56 gives 112 samples, ~3.2 degrees apart, so a lock spans 4-5 samples
    and reads. Base cost 3,420 verts against 2,376.
    """
    """Two-view construction, with rings shaped BY the front silhouette.

    The previous version placed each ring as an ellipse and then looked up the
    allowed width at each vertex's height — but it still multiplied by cos(angle),
    so the only vertices that ever reached the measured width were the two on the
    ring's own centre line. An ellipse has one horizontal semi-axis; it cannot
    reproduce a width PROFILE. And the reference mane has a very distinct one:

        h 0.62   0.708 H   <- widest
        h 0.66   0.688
        h 0.74   0.437     <- sharp waist
        h 0.86   0.412
        h 0.94   0.206
        h 0.98   0.037     <- narrow crown tip

    That waist and the crown lobe above it are most of the character, and an
    ellipse averages them away — which is why the crown never appeared.

    So each ring is parameterised by HEIGHT instead of by angle: walk up the +x
    side taking the measured half-width at every height, then back down the -x
    side. The ring becomes the front silhouette at that depth, and the union over
    depth reproduces the front view by construction.
    """
    prof_side = MODEL["views"]["side"]["mane_depth"]
    u0 = LM["mane_span_side"]["front_u"]
    u1 = LM["mane_span_side"]["rear_u"]
    u_wide, _ = widest_depth_u()
    fc = LM["face_centre_front"]
    face_r = LM["body_widest_front"]["width"] * 0.53

    # Smoothed width profile.
    #
    # The raw per-scanline measurement carries the drawing's own noise: individual
    # painted locks, anti-aliasing, and rows where the silhouette breaks into up
    # to five runs. Sampling it directly put all of that into the surface as
    # ripples. LEVEL 1 is the macro form, so it takes a profile smoothed over
    # 0.05 H; the deliberate relief is LEVEL 2's job and is added on top.
    raw = MODEL["views"]["front"]["mane_width"]
    hs = sorted(float(k) for k in raw)
    vals = [raw[f"{h:.3f}"]["half_w"] for h in hs]
    win = max(3, int(0.05 * len(hs)))
    smooth_vals = []
    for i in range(len(vals)):
        a, b = max(0, i - win // 2), min(len(vals), i + win // 2 + 1)
        smooth_vals.append(sum(vals[a:b]) / (b - a))
    table = list(zip(hs, smooth_vals))

    def front_half_w(h):
        if h <= table[0][0]:
            return table[0][1]
        if h >= table[-1][0]:
            return table[-1][1]
        for (h0, v0), (h1, v1) in zip(table, table[1:]):
            if h0 <= h <= h1:
                k = (h - h0) / max(1e-9, h1 - h0)
                return v0 + (v1 - v0) * k
        return table[-1][1]

    def taper(u):
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
        # Same treatment for the side profile: average a small neighbourhood of
        # columns so a single ragged lock in the drawing does not become a dent.
        us_all = sorted(float(k) for k in prof_side)
        near = sorted(us_all, key=lambda k: abs(k - u))[:7]
        hi = sum(prof_side[f"{k:.4f}"]["top"] for k in near) / len(near)
        lo = sum(prof_side[f"{k:.4f}"]["lowest"] for k in near) / len(near)
        if hi - lo < 0.03:                      # the tapered ends
            hi, lo = (hi + lo) / 2 + 0.015, (hi + lo) / 2 - 0.015
        cz = (hi + lo) / 2.0
        y = (0.5 - u) * SIDE_LEN
        tp = taper(u)

        # Azimuth runs -90 (bottom) to +90 (top) up the +x side, then on to +270
        # coming back down the -x side, so the clump table's angles still mean
        # what they say.
        samples = []
        for j in range(nh + 1):
            k = j / nh
            samples.append((+1, lo + (hi - lo) * k, math.radians(-90.0 + 180.0 * k)))
        for j in range(nh - 1, 0, -1):
            k = j / nh
            samples.append((-1, lo + (hi - lo) * k, math.radians(90.0 + 180.0 * (1.0 - k))))

        o_row, i_row = [], []
        for sign, z, a in samples:
            w = front_half_w(max(0.0, z)) * tp * (1.0 + clump_gain(a, t))
            o_row.append(bm.verts.new((sign * max(w, 0.004), y, z)))
            ap = max(0.0, 1.0 - t / 0.42)
            ap = ap * ap * (3.0 - 2.0 * ap)
            fr = face_r * ap
            # Inner shell follows the face as a circle, in the same order.
            ia = math.atan2(z - cz, sign * 1.0)
            i_row.append(bm.verts.new((sign * fr * abs(math.cos(ia)) * 0.98, y,
                                       fc["h"] + fr * math.sin(ia) * 1.04)))
        outer.append(o_row)
        inner.append(i_row)

    n = len(outer[0])
    for r in range(nring):
        A, B = outer[r], outer[r + 1]
        C, D = inner[r], inner[r + 1]
        for k in range(n):
            m = (k + 1) % n
            bm.faces.new((A[k], A[m], B[m], B[k]))
            bm.faces.new((C[k], D[k], D[m], C[m]))

    for pair, flip in ((0, False), (nring, True)):
        A, B = outer[pair], inner[pair]
        for k in range(n):
            m = (k + 1) % n
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
    print(f"[mane] silhouette-ring hood: {len(me.vertices)} verts, "
          f"{len(me.polygons)} faces, {n} per ring x {nring+1} rings, "
          f"widest at u={u_wide:.2f}, {len(CLUMPS)} clumps")
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

    ONE GLOBAL X-SCALE WAS NOT ENOUGH, and the band measurement is what exposed it.

    Fitting x by bounding box sets the WIDEST band exactly and lets every other
    band inherit the same factor. That would be fine if subdivision shrank the
    form uniformly — it does not. Subdivision pulls hardest where curvature is
    highest, so the narrow upper mane lost far more than the broad middle, and a
    single scale chosen from the middle cannot give it back:

        front band     reference w    model w     delta
        0.85-0.90        0.552        0.463      -0.089
        0.80-0.85        0.621        0.452      -0.169
        0.75-0.80        0.631        0.514      -0.117
        0.70-0.75        0.650        0.664      +0.014   <- the band that set k.x

    The model plateaued at ~0.45 from 0.80 to 0.95 and then jumped to 0.66, where
    the reference flares smoothly all the way (0.248 -> 0.427 -> 0.552 -> 0.621 ->
    0.650 -> 0.713). That plateau read as a bonnet with a hard lip, and it is why
    the front overlay showed solid red at ear height — which was very nearly
    misdiagnosed as an ear defect.

    So x is now fitted PER HEIGHT BAND against the measured profile. Relief inside
    a band is preserved (every vertex in it scales by the same factor, so clump
    variation survives); only the band's overall extent is corrected. The
    correction is smoothed across neighbouring bands so the profile cannot step.
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
    # Per-band x correction against the measured profile.
    # The target is the COLOUR-SEGMENTED mane profile, deliberately, not the full
    # silhouette mask the QA grades against. Above h 0.70 the two differ by up to
    # 1.69x, and that difference is the ears — non-mane-coloured material outside
    # the mane outline. Fitting the mane to the full mask would inflate it to
    # cover the ears' width and produce a bonnet with no ears in it.
    ref_at = measured_front_half_w()
    zs = [v.co.z for v in me.vertices]
    z0, z1 = min(zs), max(zs)
    NB = 32
    band_of = lambda z: min(NB - 1, max(0, int((z - z0) / max(1e-9, z1 - z0) * NB)))
    cur = [0.0] * NB
    for v in me.vertices:
        b = band_of(v.co.z)
        cur[b] = max(cur[b], abs(v.co.x))
    want_w, fac = [0.0] * NB, [1.0] * NB
    for b in range(NB):
        zc = z0 + (b + 0.5) / NB * (z1 - z0)
        want_w[b] = ref_at(zc)
        if cur[b] > 1e-5 and want_w[b] > 1e-5:
            # Clamped. An unbounded ratio lets one stray vertex in a nearly-empty
            # band throw a spike into the surface.
            fac[b] = min(2.10, max(0.55, want_w[b] / cur[b]))
    sm = [sum(fac[max(0, b - 2):min(NB, b + 3)]) / len(fac[max(0, b - 2):min(NB, b + 3)])
          for b in range(NB)]

    # INTERPOLATE THE FACTOR, do not index it.
    #
    # This line used to read `v.co.x *= sm[band_of(v.co.z)]`, which is
    # piecewise-CONSTANT: every vertex in a band took the band's factor exactly,
    # so x jumped at all 32 band boundaries. Smoothing `sm` across neighbours
    # does not help — the docstring above claimed "the correction is smoothed
    # across neighbouring bands so the profile cannot step", and it stepped 32
    # times, because it is the APPLICATION that has to be continuous, not the
    # table.
    #
    # Measured, the factors run 0.630 to 1.001, so the worst boundary was a
    # several-percent discontinuity in width. That is the horizontal terracing
    # visible down the mane's flank in every side render, and — with the
    # nearest-neighbour polar radius fixed in `polar_radius` — the other half of
    # why 38,016 smooth-shaded quads still read as a hard-edged slab.
    #
    # Linear interpolation between band CENTRES, clamped at the ends.
    def factor_at(z):
        f = (z - z0) / max(1e-9, z1 - z0) * NB - 0.5
        if f <= 0.0:
            return sm[0]
        if f >= NB - 1:
            return sm[NB - 1]
        i = int(math.floor(f))
        return sm[i] + (sm[i + 1] - sm[i]) * (f - i)

    for v in me.vertices:
        v.co.x *= factor_at(v.co.z)
    worst = max(range(NB), key=lambda b: abs(sm[b] - 1.0))
    print(f"[mane] fitted: scale {tuple(round(c, 3) for c in k)} -> "
          f"w={want.x:.4f} d={want.y:.4f} h={want.z:.4f}")
    print(f"[mane] per-band x correction over {NB} bands: "
          f"min {min(sm):.3f} max {max(sm):.3f}, largest at "
          f"h={z0 + (worst + 0.5) / NB * (z1 - z0):.3f}")


def weld(obj, dist=1e-4):
    """Merge coincident vertices BEFORE subdividing. This is the slab.

    Measured on the shipped mane: **9,824 of 38,016 vertices coincident (26%)
    and 9,292 of 38,016 faces at zero area (24%)**, with 8,522 of the 8,670
    edges sharper than 60 degrees sitting on the midline, and the worst at a
    full 180 — surfaces folded flat back on themselves.

    The hood's rings converge at the crown and the front, and the construction
    left a fan of duplicated vertices there instead of a pole. Subdividing that
    multiplied it: Catmull-Clark on a zero-area quad produces four zero-area
    quads. A zero-area face has NO DEFINED NORMAL, so a quarter of the mesh was
    shading off garbage — which is why 38,016 verts of 100% quads with every
    face smooth-shaded still rendered as a hard-edged plate, and why neither
    smoothing the polar profile nor interpolating the band factors moved it.

    Welding before the subdivision turns the fan into a genuine pole, and the
    subdivision then has clean topology to work with.
    """
    before_v, before_f = len(obj.data.vertices), len(obj.data.polygons)
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    bmesh.ops.remove_doubles(bm, verts=bm.verts[:], dist=dist)
    # Drop anything still degenerate after the weld — a collapsed quad becomes
    # a duplicate-vertex face, which the welder leaves behind as a wire.
    bmesh.ops.dissolve_degenerate(bm, dist=dist, edges=bm.edges[:])
    bm.normal_update()
    bm.to_mesh(obj.data)
    bm.free()
    obj.data.update()
    zero = sum(1 for p in obj.data.polygons if p.area < 1e-9)
    print(f"[mane] welded: {before_v} -> {len(obj.data.vertices)} verts, "
          f"{before_f} -> {len(obj.data.polygons)} faces, "
          f"{zero} zero-area faces remain")


def smooth_and_subdivide(obj):
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    # L1, not L2. With the base ring raised to 112 samples the cage is already
    # 4,850 welded verts, so L2 gave 78,277 — and Catmull-Clark at that level
    # smooths the very lock relief the level-2 pass exists to create. L1 keeps
    # the locks legible at ~19k, which is also cheaper than the 38,016 this
    # mane shipped with before any of these fixes.
    sub = obj.modifiers.new("Subdiv", "SUBSURF")
    sub.levels = sub.render_levels = 1
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
    donor = os.path.join(REPO, "art", "blender", "lion_cage.blend")
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
    weld(mane)
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
