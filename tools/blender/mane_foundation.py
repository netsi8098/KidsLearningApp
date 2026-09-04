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
import statistics
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

# THE SILHOUETTE FRAME, and a MEASURED NEGATIVE RESULT about correcting it here.
#
# THIS IS RESOLVED — see the re-frame in `silhouette_render.fit` and
# `mane_mask_band` above. It is kept because three corrections were built for it
# and all three measured worse, and the reason they did is the useful part.
#
# `silhouette_render.fit` used to scale the model so its height was exactly
# 1 H before rendering. The reference norms fill h 0.0000 to 1.0000 and the
# assembled model was 0.9770 tall, so the render mapped model z to graded h as
# h = (z - 0.0040) * 1.0235 and widths by the same factor. Every builder reads
# measured h values and uses them directly as model z, so that normalisation put
# every feature 2.35% high in the frame the QA graded in — and the shortfall it
# was normalising away came from ONE place: this file targeting the mane's
# height at `LM["mane_band"]`, the >=10px-filtered band, instead of the mane's
# real span. The scale is now 1 and the height target is the real span.
#
# Where the measured profile is FLAT that costs nothing, which is why the front
# bands from h 0.65 to 0.90 all sit within 0.019 of the reference. The crown is
# where it bites: the reference's mane half-width falls from 0.221 at h 0.89 to
# 0.067 at h 0.99, so stretching that profile 2.35% upward leaves the model
# systematically ~0.018 too wide from h 0.89 to 0.97. The band table reports it
# as `0.95-1.00  +0.056  <-- width`, and it is the crown reading blunt.
#
# CORRECTING THE LOOKUP ALONE MADE IT WORSE. Building at
# `ref_at(sil_h(z)) / S` is right in isolation — the arithmetic checks — and
# three variants were measured:
#
#     variant                    crown band   front IoU   weighted IoU
#     as shipped (no convert)       +0.056      0.9431       0.8897
#     convert in build_hood only    +0.023      0.9378       0.8877
#     convert in both               -0.060      0.9325       0.8868
#
# Every variant lowers the headline metric, and converting in `build_hood` alone
# sets the build fighting the fit — the per-band factor goes to 1.645 undoing it.
# The reason is that the rest of the mane's construction is expressed in the
# UNCONVERTED frame: the ring heights come from `prof_side` as z, the placement
# and height from `mane_band` as z, and the global fit from the bbox. Converting
# only the width pairs corrected widths with uncorrected heights.
#
# Doing it properly meant re-framing so model z IS h, which is what happened:
# the height target here became the mane's real span and the harness stopped
# normalising. The self-reference that made it look impossible — changing the
# height changes the scale — dissolved once the height was simply CORRECT. The
# numbers above are kept because they are what a local correction costs when the
# frame underneath it is wrong.


NSEG = 24          # ring segments; the hood is a broad form and wants resolution
NRING = 30         # stations along the mane's depth


def mane_mask_band():
    """The mane's FULL h extent, measured off the mane masks themselves.

    `LM["mane_band"]` is `measure_reference.band()`, which keeps only the rows
    where the mane is at least 10 px wide. That is a deliberate noise filter and
    the right thing for finding where the mane substantially IS — the face-centre
    calculation uses it for exactly that. It is the wrong thing for the mane's
    HEIGHT, because it discards the reference mane's tapered tip and base:

        source                            h range          span
        LM["mane_band"] (>=10px rows)     0.1900-0.9810   0.7910
        views.front.mane_width (all rows) 0.1790-0.9940   0.8150
        front-mane-norm.png mask          0.1788-0.9942   0.8154
        side-mane-norm.png mask           0.1808-0.9962   0.8154

    The per-row table, the front mask and the side mask agree independently, and
    all three disagree with the landmark by 0.024. The table is used here rather
    than the masks because it is already in `reference_model.json` and Blender
    does not ship PIL. A mane built to 0.7910 puts the assembled model's crown
    at z 0.9810 with its soles at 0.0040 — 0.9770 tall where the reference is
    1.0000 — and `silhouette_render` used to absorb that by scaling the whole
    model up 2.35%, which is the wrong-frame error documented there and in the
    negative-result block below.

    So the height target comes from the masks. The two views are averaged
    because they measure the same thing and differ only by antialiasing.
    """
    d = MODEL["views"]["front"]["mane_width"]
    ks = sorted(float(k) for k in d)
    if not ks:
        raise SystemExit("[mane] no mane_width rows to measure the band from")
    return ks[0], ks[-1]


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
# A global multiplier on every lock's amplitude, so the depth can be swept
# against a measurement instead of argued about. See LOCK DEPTH below.
LOCK_AMP = float(os.environ.get("LION_LOCK_AMP", "1.0"))
# ...and on the count and the azimuth sigma, which turn out to be the levers
# the amplitude is not. See LOCK DEPTH below.
LOCK_COUNT = float(os.environ.get("LION_LOCK_COUNT", "1.0"))
LOCK_ASIG = float(os.environ.get("LION_LOCK_ASIG", "1.0"))


def lock_ring(count, amp, asig, ssig, station, phase=0.0, az_from=-90.0,
              az_to=270.0):
    """`count` locks evenly spaced in azimuth, each long in station."""
    out = []
    count = max(3, int(round(count * LOCK_COUNT)))
    span = az_to - az_from
    for i in range(count):
        az = az_from + span * ((i + 0.5) / count) + phase
        out.append((f"lock_{station:.2f}_{i}", az, station, amp * LOCK_AMP,
                    asig * LOCK_ASIG, ssig))
    return out


# WHERE THE ROWS SIT IS THE WHOLE POINT, and the first three were in the wrong
# place. The widest ring is at u = 0.2017 out of a span u0 = 0.0787 .. u1 =
# 0.4936, which is station t = 0.296 — so the surface that FACES THE CAMERA at
# the hero angle is only t in [0, 0.296], the front 30% of the
# parameterisation. Everything behind t = 0.30 is on the back of the hood.
#
# The three original rows sat at t = 0.30, 0.58 and 0.80, and integrating each
# row's Gaussian over the front band gives 33.7%, 12.5% and 1.1% of its mass.
# Nearly all the lock relief was on surface the front view never sees, which is
# exactly the reported symptom: locks legible in three-quarter and side, and a
# smooth mass from the front.
#
# So three FRONT rows are added inside the visible band, with tighter station
# sigmas so their mass stays there, and higher counts because that is the
# surface a child actually looks at. The reference's locks start beside the face
# and sweep outward to the rim, which is what a narrow-azimuth ridge over
# t 0.05 -> 0.24 draws, because `taper` takes the radius from 0.55 to 1.0
# across that band — the ridge sweeps radially outward in the front view by
# construction.
FRONT_LOCKS = (lock_ring(24, 0.185, 5.5, 0.10, 0.06)
               + lock_ring(22, 0.165, 6.0, 0.11, 0.15, phase=7.0)
               + lock_ring(20, 0.140, 6.5, 0.12, 0.25, phase=-5.0))

# Three more on the back and flank, layered. The phase offset stops a row
# sitting exactly on its neighbour and doubling its amplitude.
BACK_LOCKS = (lock_ring(22, 0.130, 6.0, 0.26, 0.42)
              + lock_ring(18, 0.110, 7.0, 0.24, 0.62, phase=9.0)
              + lock_ring(14, 0.090, 8.0, 0.22, 0.82, phase=-6.0))

LOCKS = FRONT_LOCKS + BACK_LOCKS

# The rim scallop, OFF BY DEFAULT — a measured negative result.
#
# The premise was that the reference's mane has a scalloped rim of teardrop
# tips, so the outline itself is made of locks and no Gaussian on a smooth hood
# could ever produce it. The mechanism works and the premise was wrong:
#
#     reference front silhouette, runs per row (>= 0.02 H)
#       h 0.62   ONE run  0.317-1.031
#       h 0.68   ONE run  0.337-1.017
#       h 0.74   ONE run  0.365-0.987
#       h 0.80   ONE run  0.363-0.987
#       h 0.86   ONE run  0.412-0.944
#       h 0.92   ONE run  0.487-0.869
#
# The reference's mane outline is smooth at every height. Its lock tips are
# INTERIOR SHADING on a continuous boundary, and reading them as silhouette is
# a mistake this file's own history warns about in the other direction — the
# width profile's docstring calls the per-scanline variation "the drawing's own
# noise ... rows where the silhouette breaks into up to five runs", which is
# the BODY rows, not these.
#
# Switched on at amp 0.055 it cost front IoU 0.9257 -> 0.9000 and weighted
# 0.8801 -> 0.8683, because notching a boundary the reference fills removes
# material the reference has. Kept because the machinery is correct and cheap,
# and because a future reference genuinely might have a broken outline — but it
# is not this one, and the real gap is that the existing lock RELIEF does not
# read under flat vertex colour and soft light. That wants baked occlusion, not
# a new outline.
SCALLOP_COUNT = int(os.environ.get("LION_SCALLOP_COUNT", "17"))
SCALLOP_AMP = float(os.environ.get("LION_SCALLOP_AMP", "0.0"))

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

    # MEDIAN, not mean. This is why the mane's crown was too narrow.
    #
    # A mean over 0.05 H is a low-pass filter, and the crown is a STEEP EDGE:
    # the profile falls from 0.273 to 0.053 full-width between h 0.93 and 0.98.
    # Averaging across that flattens it, and since `fit_to_measured` normalises
    # the mane ONTO this profile, the build reproduced the flattened version
    # exactly — the model measured 0.152 at band 0.95-1.00 against a reference
    # mask of 0.251, and it was not a build error at all. It was matching a
    # profile that had smoothed the crown away.
    #
    # A median of the SAME window rejects the same spikes and keeps the edge:
    #
    #     filter          h0.90  h0.93  h0.95  h0.96  h0.98   ripple
    #     mean   5%       0.388  0.273  0.201  0.152  0.053   18.35e-4
    #     median 5%       0.406  0.298  0.215  0.206  0.038   18.44e-4
    #     median 2.5%     0.406  0.298  0.225  0.225  0.037   20.44e-4
    #
    # Median at 5% is free: +36% width at h 0.96 for 0.5% more ripple. The
    # narrower window gets closer to the reference and costs 11% more ripple,
    # which is the noise the smoothing exists to remove, so it is not taken.
    win = max(3, int(0.05 * len(hs)))
    sm = []
    for i in range(len(vals)):
        a, b = max(0, i - win // 2), min(len(vals), i + win // 2 + 1)
        sm.append(statistics.median(vals[a:b]))
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
    # ONE profile, shared with the fit stage. This was a duplicated copy of the
    # same smoothing, which is how the two ended up able to disagree — and the
    # median fix would have landed in only one of them.
    front_half_w = measured_front_half_w()

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
            #
            # IT WAS NOT A CIRCLE. `ia = atan2(z - cz, sign * 1.0)` passed a
            # FIXED unit as the x-extent, so with |z - cz| never above ~0.4 the
            # angle stayed inside +/-22 degrees (or 158-202 on the -x side).
            # Over that range |cos(ia)| is 0.93-1.0, so x sat at a constant
            # +/-fr while z spanned only 0.74 fr — a rectangular TUBE, which is
            # the hard slab that shows through the middle of every front render
            # and which I twice blamed on the outer hood.
            #
            # The sample already carries its own azimuth `a`, running -90 up the
            # +x side to +90 and on to +270 coming back down, so cos/sin of it
            # trace a true circle in the correct winding order. No sign term is
            # needed: cos(a) is already positive on the +x side and negative on
            # the -x side.
            i_row.append(bm.verts.new((fr * math.cos(a), y,
                                       fc["h"] + fr * math.sin(a))))
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
    band_lo, band_hi = mane_mask_band()
    want = Vector((LM["mane_widest"]["width"],
                   (u1 - u0) * SIDE_LEN,
                   band_hi - band_lo))
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
            band_lo + (v.co.z - mn.z) * k.z,
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
        # MAX ACROSS THE BAND, not the value at its centre.
        #
        # `cur[b]` is a per-band MAXIMUM of |x|, so the target has to be a
        # per-band maximum too. Sampling `ref_at` at the band CENTRE compares a
        # max against a midpoint, and on any steep gradient the max is the
        # larger of the two — so the ratio comes out below 1 and the band gets
        # SHRUNK for no reason but the metric.
        #
        # The crown is the steepest part of the profile, falling from 0.298 to
        # 0.037 half-width over h 0.93-0.99, and it is exactly where the
        # correction bottomed out at 0.681. Fixing the median filter alone did
        # not help, because this then undid it.
        lo_z = z0 + b / NB * (z1 - z0)
        hi_z = z0 + (b + 1) / NB * (z1 - z0)
        want_w[b] = max(ref_at(lo_z + (hi_z - lo_z) * t / 8.0) for t in range(9))
        if cur[b] > 1e-5 and want_w[b] > 1e-5:
            # Clamped. An unbounded ratio lets one stray vertex in a nearly-empty
            # band throw a spike into the surface.
            fac[b] = min(2.10, max(0.55, want_w[b] / cur[b]))
    # SMOOTHED OVER +/-1 BAND, NOT +/-2, and the crown is why.
    #
    # 32 bands over the mane's 0.791 of height makes a band 0.0247 tall, so a
    # +/-2 window averages the factor over 0.099 of height. Across the crown the
    # reference's half-width falls from 0.221 to 0.067, which is more change than
    # the window is wide — so the crown's own factor was averaged away with its
    # neighbours' and the fit could never reach the target there. That is the
    # same filter-wider-than-the-feature error as the mane's `nh`, the river's
    # ripples and the ear's ring sampling.
    H = int(os.environ.get("LION_MANE_FIT_SMOOTH", "1"))
    sm = [sum(fac[max(0, b - H):min(NB, b + H + 1)])
          / len(fac[max(0, b - H):min(NB, b + H + 1)]) for b in range(NB)]

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


def skull_probe(cage, levels=2):
    """A ray-castable copy of the cage at its SUBDIVIDED size.

    The donor is the control cage — 969 verts, and `import_donor_body` strips
    its modifiers — but what ships is that cage subdivided twice, and
    Catmull-Clark pulls the surface inward. Measured on the forehead at z 0.78
    the control cage's skin sits at y 0.5690 and the limit surface at y 0.5547:
    14.3 mm apart, against the 4 mm inset this file is about to ask for. Probing
    the control cage would therefore under-correct by more than the correction.

    `Object.ray_cast` reads the object's own mesh and ignores modifiers, so the
    evaluated mesh has to be realised into a temporary object to be cast at.
    """
    mod = cage.modifiers.new("SkullProbeSubsurf", "SUBSURF")
    mod.levels = mod.render_levels = levels
    dg = bpy.context.evaluated_depsgraph_get()
    me = bpy.data.meshes.new_from_object(cage.evaluated_get(dg))
    cage.modifiers.remove(mod)
    probe = bpy.data.objects.new("SkullProbe", me)
    bpy.context.scene.collection.objects.link(probe)
    probe.matrix_world = cage.matrix_world.copy()
    # NOT hide_viewport: that drops the object from the depsgraph, and
    # `ray_cast` then fails with "has no evaluated mesh data". The update is
    # needed for the same reason — a freshly linked object has not been
    # evaluated yet.
    probe.hide_render = True
    bpy.context.view_layer.update()
    print(f"[mane] skull probe: {len(me.vertices)} verts (cage L{levels})")
    return probe


def hug_head(obj, probe, inset=0.004, max_pull=0.120, face_h=None):
    """Pull the hood's INNER surface inside the skull wherever it floats outside.

    THE DARK BAND ACROSS THE FOREHEAD.

    `build_hood` builds the hood as a shell: an outer surface shaped by the
    measured front silhouette, and an inner surface that is a CIRCLE of radius
    `face_r` = 0.2446 about (0, y, 0.60415). A circle is not a head. The skull
    domes over and falls away — its surface at the midline is at y 0.5547 by
    z 0.78 and gone by z 0.81 — while the circle carries straight on to
    z 0.8487 at the front cap's own depth of y 0.5663. So over the forehead the
    mane's inner surface stands in FRONT of the skull instead of behind it, and
    the shell becomes a visor with a cavity under it. Measured on the shipped
    asset: 650 downward-facing mane faces over the forehead, the worst of them
    52.4 mm proud of the skin below it. That cavity, lit from the front and
    therefore in shadow, is the hard-edged dark band across the forehead in
    every front and three-quarter render.

    This is the THIRD defect traced to this inner shell. The other two are
    recorded in `build_hood`: a fixed unit passed as an x-extent that made it a
    rectangular tube, and the same slab "twice blamed on the outer hood".

    WHY A CLAMP AND NOT A CONFORM

    The shell only reads wrong where the inner surface is OUTSIDE the skull. Where
    it is already inside — most of the mane — it is invisible and its shape does
    not matter. So this takes the radius down to the skull's, and only down:
    `min(r, skull_r - inset)`. Everything already buried is untouched, so no
    region boundary is introduced and nothing that currently passes a gate moves.

    WHY IT RUNS AFTER THE FIT

    `fit_to_measured` is a global per-axis scale followed by a per-band x
    correction whose factors run 0.630 to 1.001. Conforming before it would be
    scaled by up to a third and land back off the skull.

    The outer surface is left alone by an inward-facing test, blended so the
    front lip — where the two surfaces meet and the normal is perpendicular to
    the radius — is not stepped. The mane's measured extents cannot move: its
    width, height and depth extremes are all on the outer shell or on the front
    cap, and this only changes x and z radially.
    """
    face_h = LM["face_centre_front"]["h"] if face_h is None else face_h
    me = obj.data
    moved = capped = 0
    worst = 0.0
    for v in me.vertices:
        p = v.co
        axis = Vector((0.0, p.y, face_h))
        d = Vector((p.x - axis.x, 0.0, p.z - axis.z))
        r = d.length
        if r < 1e-5:
            continue
        dn = d / r
        # How much this vertex faces the head rather than away from it. The lip
        # sits near 0 and keeps its place; the inner surface is near 1.
        w = (-(v.normal.x * dn.x + v.normal.z * dn.z) - 0.10) / 0.35
        w = 0.0 if w <= 0.0 else (1.0 if w >= 1.0 else w * w * (3.0 - 2.0 * w))
        # AND ONLY OVER THE CROWN, because a single radial axis is not a good
        # parametrisation of the whole mane.
        #
        # The head is roughly spherical about the face centre, so a ray from
        # there is the right probe over the forehead and crown. It is the wrong
        # probe anywhere the mane is not wrapping the skull: cast DOWNWARD from
        # the face centre it hits the chin at r 0.15, while the ruff hanging
        # below the chin legitimately sits at r 0.42 — so the first version of
        # this pass yanked the lower front of the mane up by 283 mm. Whether
        # that ruff also stands off the chest is a separate question about a
        # different part of the mane, and it is not answered by this axis.
        wz = (dn.z - 0.30) / 0.25
        wz = 0.0 if wz <= 0.0 else (1.0 if wz >= 1.0 else wz * wz * (3.0 - 2.0 * wz))
        w *= wz
        if w <= 0.0:
            continue
        hit, loc, _n, _i = probe.ray_cast(axis, dn)
        if not hit:
            continue
        limit = (loc - axis).length - inset
        if r <= limit:
            continue
        target = r + (limit - r) * w
        # A guard, not a tuning knob. The measured defect is 83 mm at its worst
        # (the front cap's inner top, r 0.2446 against a forehead at r 0.166),
        # so anything past 120 mm means the probe found something it should not
        # have and the vertex is left alone rather than flung across the model.
        if r - target > max_pull:
            capped += 1
            continue
        worst = max(worst, r - target)
        v.co = Vector((axis.x + dn.x * target, p.y, axis.z + dn.z * target))
        moved += 1
    me.update()
    print(f"[mane] hug_head: {moved} inner-surface verts pulled inside the "
          f"skull, worst correction {worst * 1000:.1f} mm (inset "
          f"{inset * 1000:.0f} mm), {capped} left alone by the "
          f"{max_pull * 1000:.0f} mm guard")
    return {"moved": moved, "worst": worst, "capped": capped}


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


def scallop_rim(obj, count=17, amp=0.052, phase=11.0, rim_pow=3.2):
    """Scallop the mane's OUTLINE, which no clump can do.

    THE STRUCTURAL LIMIT THIS EXISTS TO GET AROUND.

    Every lock in `LOCKS` is a Gaussian pushed along the vertex normal — it is
    RELIEF on a smooth hood. The approved reference's mane is not relief: its
    rim is a scalloped edge of individual teardrop tips, so the OUTLINE itself
    is made of locks. A bump on a smooth dome cannot produce a scalloped
    silhouette however large it is, which is why raising the clump count from
    11 to 65, then adding three front rows, then raising `nh` to 56 all made
    the surface better and left the outline a circle. Same class of finding as
    "a ring cannot be both wide and flat" on the paw and "one ellipse is all
    this loft will take" on the rear leg: the mechanism could not express the
    thing being asked of it.

    So this modulates the RADIUS in the front-view plane, about the mane's own
    axis, at `count` periods around the circle. The weight is the product of
    two terms:

      * `1 - |n . y|` — how much a vertex sits ON the silhouette. A vertex
        whose normal points at the camera is interior and must not move, or the
        scallop becomes a corrugation across the whole face of the hood.
      * a radial ramp raised to `rim_pow`, so the displacement is confined to
        the outer band and the inner shell around the face is untouched.

    Runs AFTER `fit_to_measured`, and that ordering is not optional: the fit is
    a per-axis normalisation to the measured width, so scalloping before it
    would be squashed straight back out.
    """
    me = obj.data
    me.calc_loop_triangles()
    lo = LM["mane_band"]["low"]
    hi = LM["mane_band"]["high"]
    cz = (lo + hi) / 2.0
    pts = [v.co for v in me.vertices]
    # The axis is the mane's own centre in x and its band centre in z; the
    # front view looks along y, so the outline lives in (x, z).
    cx = (max(p.x for p in pts) + min(p.x for p in pts)) / 2.0
    rmax = max(math.hypot(p.x - cx, p.z - cz) for p in pts) or 1.0

    moved = 0
    for v in me.vertices:
        dx = v.co.x - cx
        dz = v.co.z - cz
        r = math.hypot(dx, dz)
        if r < 1e-6:
            continue
        # On-silhouette weight: 1 where the normal is perpendicular to the view
        # axis, 0 where it faces the camera.
        n = Vector(v.normal)
        sil = 1.0 - min(1.0, abs(n.normalized().y)) if n.length > 1e-9 else 1.0
        rim = (r / rmax) ** rim_pow
        w = sil * rim
        if w < 1e-3:
            continue
        az = math.atan2(dz, dx)
        # NOTCH ONLY, never bulge. A plain cosine is zero-mean around the
        # circle but its PEAKS land on the widest point, so the measured mane
        # width grew 7.1% at amp 0.052 and 13.5% at 0.090 — the fit had just
        # been normalised to the reference and this undid it.
        # The reference's lock tips sit AT the fitted outline and the gaps
        # between them are cut inside it, so the displacement runs [-amp, 0]:
        # peaks move nothing and valleys carve in. The width is preserved by
        # construction rather than by re-fitting afterwards.
        lobe = (1.0 - math.cos(count * az + math.radians(phase))) * 0.5
        d = -amp * lobe * w
        v.co.x += (dx / r) * d
        v.co.z += (dz / r) * d
        moved += 1
    print(f"[mane] rim scalloped: {count} lobes, amp {amp:.3f}, {moved} verts moved")


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
    # After the fit: see `scallop_rim`. The fit is a per-axis normalisation and
    # would squash the scallop straight back out.
    scallop_rim(mane, count=SCALLOP_COUNT, amp=SCALLOP_AMP)
    body = import_donor_body()
    # After the fit, for the reason in `hug_head`: the fit's per-band x factors
    # reach 0.630, so anything conformed before it comes back out again.
    cage = next((o for o in body if o.name.split(".")[0] == "LionCage"), None)
    if cage is None:
        raise SystemExit("[mane] no donor LionCage to hug the head against")
    probe = skull_probe(cage)
    hug_head(mane, probe)
    bpy.data.objects.remove(probe, do_unlink=True)

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
    _blo, _bhi = mane_mask_band()
    print(f"MANE_HEIGHT={mh:.4f}  reference mask span {_bhi - _blo:.4f} "
          f"(h {_blo:.4f}-{_bhi:.4f}; the >=10px band is {LM['mane_band']['high'] - LM['mane_band']['low']:.4f})")
    print(f"MANE_DEPTH={ml:.4f}  reference "
          f"{(LM['mane_span_side']['rear_u'] - LM['mane_span_side']['front_u']) * SIDE_LEN:.4f}")
    print(f"CLUMPS={len(CLUMPS)}")
    print("===MANE_FOUNDATION_END===")


if __name__ == "__main__":
    main()
