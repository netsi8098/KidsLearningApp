"""
nap_qa.py — is the body's surface texture the REFERENCE's kind of texture?

WHY HIGH-FREQUENCY ENERGY WAS THE WRONG TARGET

The surface-detail pass measured its own success as high-frequency energy and
took it from 1.97 to 3.86. That number went the right way while the render went
the wrong way: the shipped body reads as hexagonal scales — golf-ball dimples —
and it is plainly visible in the running app.

Energy cannot see the difference, because the defect is not how MUCH texture
there is, it is that the texture is PERIODIC. `_tiling_nap` builds its height
field as white noise through a radial band-pass centred on one wavelength, and
band-passed noise packs its blobs at the preferred spacing — which is a
hexagonal cellular pattern. Its own docstring calls the nap "ISOTROPIC AND
SCALE-FREE"; a band-pass imposes a scale by construction.

WHAT THIS MEASURES

On a patch of plain gold coat, auto-located as the densest gold window so the
choice is not an author's:

  * `sd` — the amplitude of the surface texture, after subtracting a blur to
    remove the shading gradient. How much texture.
  * `bump` — the prominence in decibels of the largest INTERIOR maximum in the
    radial power spectrum, and the radius it sits at. A texture with a preferred
    cell size has one; scale-free noise does not, because its radial spectrum
    falls monotonically. This is the discriminator, and three obvious
    alternatives were tried and are not:

      - High-frequency ENERGY cannot see periodicity at all. The detail pass
        drove it 1.97 -> 3.86 while shipping the dimples.
      - 2D peak-over-mean is actively misleading: on the generators themselves
        the band-pass that CAUSED the hexagons scores 29.2 and a scale-free
        power law scores 106 to 417, because a power law concentrates power in
        the lowest bins and that is concentration too.
      - Excess over a best-fit power law is fooled by the high-frequency
        ROLLOFF. Fitting one line across a hard cutoff returns a slope of -7 to
        -8.8 and then calls the whole pre-cutoff region a 24 dB excess, for
        every candidate equally.

    Measured on the generators, this metric separates them cleanly:

        band-pass (shipped)   bump 28.53 dB at r=32
        power law beta 0.8    bump  5.38 dB at r=13
        power law beta 1.2    bump  2.38 dB at r= 5

Both are compared against the same measurement on the reference artwork, which
is the only definition of right available.

Run:
  python3 tools/cad/nap_qa.py [model_render.png ...]
"""
import os
import sys

import numpy as np
from PIL import Image

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
REF = os.path.join(REPO, "art", "blender", "references", "turnaround-views", "front.png")
DEFAULT = [os.path.join(REPO, "docs", "assets", "lion-review", n)
           for n in ("01-body-front.png", "03-body-side.png")]
PATCH = int(os.environ.get("LION_NAP_PATCH", "72"))
# The blur that separates surface texture from the body's shading gradient. A
# patch this size across a rounded flank carries tens of grey levels of shading,
# which is not texture and would swamp it.
BLUR = int(os.environ.get("LION_NAP_BLUR", "9"))
NAP_MAP = os.path.join(REPO, "art", "blender", "textures", "lion_body_nap.png")
# The band-pass that shipped the dimples measures 28.5 dB. A scale-free field
# measures 1.4-2.4 depending on its slope, and the residual there is the noise
# floor of a radial average over a handful of low-r bins, not a cell size. 6 dB
# sits an order of magnitude clear of the defect and well above the floor.
MAP_BUMP_MAX = float(os.environ.get("LION_NAP_BUMP_MAX", "6.0"))


def gold_window(im, size):
    """The densest window of plain gold coat. Chosen by the image, not by hand."""
    a = np.asarray(im.convert("RGB")).astype(int)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    m = (r > 195) & (g > 130) & (g < 225) & (b < 130)
    best = None
    h, w = m.shape
    for y in range(0, max(1, h - size), 8):
        for x in range(0, max(1, w - size), 8):
            f = m[y:y + size, x:x + size].mean()
            if best is None or f > best[0]:
                best = (f, x, y)
    return best


def box_blur(p, k):
    pad = np.pad(p, k, mode="reflect")
    out = np.zeros_like(p)
    for dy in range(-k, k + 1):
        for dx in range(-k, k + 1):
            out += pad[k + dy:k + dy + p.shape[0], k + dx:k + dx + p.shape[1]]
    return out / (2 * k + 1) ** 2


def radial(img):
    """Radial power spectrum of a patch, DC neighbourhood removed."""
    a = img - img.mean()
    n = min(a.shape)
    a = a[:n, :n]
    w = np.hanning(n)[:, None] * np.hanning(n)[None, :]
    F = np.abs(np.fft.fftshift(np.fft.fft2(a * w))) ** 2
    c = n // 2
    F[c - 2:c + 3, c - 2:c + 3] = 0.0
    yy, xx = np.mgrid[0:n, 0:n]
    rr = np.hypot(yy - c, xx - c).astype(int)
    ks = np.arange(3, max(4, c - 2))
    prof = np.array([F[rr == k].mean() for k in ks])
    # Smoothed over 5 bins so one noisy bin is not a "cell size".
    prof = np.convolve(prof, np.ones(5) / 5.0, mode="same")
    return ks, prof


def bump(img):
    """Prominence (dB) and radius of the largest interior maximum."""
    ks, p = radial(img)
    best, at, run_min = 0.0, 0, p[0]
    for i in range(1, len(p) - 1):
        run_min = min(run_min, p[i])
        if p[i] > p[i - 1] and p[i] >= p[i + 1]:
            d = 10.0 * np.log10(max(p[i], 1e-30) / max(run_min, 1e-30))
            if d > best:
                best, at = float(d), int(ks[i])
    return best, at


def measure(path, size=PATCH):
    im = Image.open(path)
    f, x, y = gold_window(im, size)
    p = np.asarray(im.convert("L").crop((x, y, x + size, y + size))).astype(float)
    res = p - box_blur(p, BLUR)
    b, at = bump(res)
    return {"gold": f, "at": (x, y), "sd": float(res.std()),
            "bump": b, "bump_r": at}


def measure_map(path):
    """The nap map itself — where the defect lives and there is no shading."""
    if not os.path.exists(path):
        return None
    a = np.asarray(Image.open(path).convert("L")).astype(float)
    b, at = bump(a)
    return {"sd": float(a.std()), "bump": b, "bump_r": at, "res": a.shape[0]}


MANE_VIEWS = [os.path.join(REPO, "docs", "assets", "lion-review", n)
              for n in ("07-mane-front.png", "09-mane-side.png",
                        "08-mane-threequarter.png")]
# The mane's grain must be DIRECTIONAL. Measured as the elongation of the
# rendered grain — the square root of the ratio of the major to minor
# eigenvalue of its power spectrum's second-moment matrix, which is
# direction-agnostic, so it does not care which way the locks run in a
# particular view. The reference artwork measures 2.24. The sweep that set the
# shipped field:
#
#     field                                front  side   3/4   mean
#     axis stretch Z=0.22 (the old one)     1.43  1.04  1.46   1.31
#     axis stretch Z=0.02                   1.83  1.16  1.72   1.57
#     x-z fan 5.0/1.0, detail 26, oct 6     1.58  1.60  1.84   1.67
#     x-z fan 5.0/0.4, detail 26, oct 6     1.72  1.80  1.79   1.77
#     3D fan from the face plane            1.40  1.24  1.68   1.44
#     x-z fan 5.0/0.4, detail 11, oct 3     2.61  1.23  2.31   2.05
#     ... at bump 8 (SHIPPED)               2.59  1.64  2.17   2.13
#
# 1.60 sits clear of the old field's 1.31 and well below the shipped 2.13.
MANE_ELONG_MIN = float(os.environ.get("LION_MANE_ELONG_MIN", "1.60"))
# The mane's LOCK band: shading variation at features 3% to 11% of subject
# height, which is a lock rather than a hair. Separate from the elongation
# above because they came apart — the grain can be perfectly directional while
# the large lock ribbons the reference has are simply absent, which is what
# GATE 23 shipped.
#
# REPORTED, NOT GATED, and that is deliberate. Measured over 7-12 patches per
# view, the reference scores 19.46 and the mane 7.54 before `lock_shade` and
# 8.52 after — a 13% separation, against a spread of 5% from the patch size
# alone (7.77 at 0.20 of subject height, 8.52 at 0.22, 8.07 at 0.24). A limit
# that caught the 7.54 would sit inside that spread and fail good builds, so
# there is no honest threshold here yet. The visual difference between those
# two builds is large and obvious; this number sees an eighth of it, which is a
# statement about the metric and not about the mane. It is printed because the
# GAP to the reference — 8.52 against 19.46, still only 44% — is the real
# finding and the next person should see it.
LOCK_BAND = (0.030, 0.110)
# The lock patch has to hold several lock periods (a lock is 3-11% of subject
# height) AND fit into the mane several times over, or the median is taken over
# one window and is a lottery again. 0.22 of subject height holds two to seven
# periods and fits repeatedly; 0.34 fitted once on three of the four images.
LOCK_PATCH = float(os.environ.get("LION_LOCK_PATCH", "0.22"))
LOCK_MIN_BROWN = float(os.environ.get("LION_LOCK_MIN_BROWN", "0.60"))


def lock_band(path):
    """Shading variation in the lock band, as a standard deviation."""
    im = Image.open(path)
    a = np.asarray(im.convert("RGB")).astype(int)
    corners = [tuple(a[0, 0]), tuple(a[0, -1]), tuple(a[-1, 0]), tuple(a[-1, -1])]
    bg = np.array(max(set(corners), key=corners.count))
    ys, _ = np.nonzero(np.abs(a - bg).sum(axis=2) > 40)
    hpx = (ys.max() - ys.min()) if ys.size else a.shape[0]
    size = max(32, int(hpx * 0.34))
    f, x, y = brown_window(im, size)
    p = np.asarray(im.convert("L").crop((x, y, x + size, y + size))).astype(float)
    k1 = max(1, int(hpx * LOCK_BAND[0] / 2))
    k2 = max(2, int(hpx * LOCK_BAND[1] / 2))
    band = box_blur(p, k1) - box_blur(p, k2)
    return {"brown": f, "sd": float(band.std()), "k": (k1, k2)}


def brown_patches(im, size, want=9, min_frac=0.75):
    """Several windows of mane-brown, not one.

    ONE WINDOW IS A LOTTERY, and it was measured as such: the same build scored
    a mean lock sd of 8.54 and 7.31 on two runs whose only difference was the
    step the window search walked in (8 px against 6). A gate that swings 15%
    on that is not measuring the asset.

    So the metric is the MEDIAN over up to `want` non-overlapping windows that
    are at least `min_frac` brown, walked on a coarse grid. Where the mane is
    large enough to hold several, the median is stable; where it is not, this
    falls back to the densest single window and says so by returning fewer.
    """
    a = np.asarray(im.convert("RGB")).astype(int)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    m = (r > 90) & (r < 200) & (g > 40) & (g < 130) & (b < 90) & ((r - b) > 45)
    h, w = m.shape
    step = max(8, size // 2)
    cands = []
    for y in range(0, max(1, h - size), step):
        for x in range(0, max(1, w - size), step):
            cands.append((m[y:y + size, x:x + size].mean(), x, y))
    cands.sort(reverse=True)
    keep = [c for c in cands if c[0] >= min_frac][:want] or cands[:1]
    grey = np.asarray(im.convert("L")).astype(float)
    return [(f, grey[y:y + size, x:x + size]) for f, x, y in keep]


def subject_px(im):
    a = np.asarray(im.convert("RGB")).astype(int)
    corners = [tuple(a[0, 0]), tuple(a[0, -1]), tuple(a[-1, 0]), tuple(a[-1, -1])]
    bg = np.array(max(set(corners), key=corners.count))
    ys, _ = np.nonzero(np.abs(a - bg).sum(axis=2) > 40)
    return (ys.max() - ys.min()) if ys.size else a.shape[0]


def elongation(path, size=96):
    """How directional the grain is, as a median over several patches."""
    im = Image.open(path)
    hpx = subject_px(im)
    es, ls, sds = [], [], []
    pats = brown_patches(im, size)
    for _f, p in pats:
        res = p - box_blur(p, max(2, size // 10))
        w = np.hanning(size)[:, None] * np.hanning(size)[None, :]
        F = np.abs(np.fft.fftshift(np.fft.fft2(res * w))) ** 2
        c = size // 2
        F[c - 1:c + 2, c - 1:c + 2] = 0.0
        yy, xx = np.mgrid[0:size, 0:size]
        fy, fx = (yy - c).astype(float), (xx - c).astype(float)
        tot = F.sum() or 1.0
        ls.append(size / max((F * np.hypot(fy, fx)).sum() / tot, 1e-9) / hpx)
        sxx = (F * fx * fx).sum() / tot
        syy = (F * fy * fy).sum() / tot
        sxy = (F * fx * fy).sum() / tot
        tr, det = sxx + syy, sxx * syy - sxy * sxy
        root = np.sqrt(max(tr * tr / 4.0 - det, 0.0))
        es.append(float(np.sqrt((tr / 2.0 + root) / max(tr / 2.0 - root, 1e-12))))
        sds.append(float(res.std()))
    return {"n": len(pats), "feature_H": float(np.median(ls)),
            "elong": float(np.median(es)), "sd": float(np.median(sds))}


def lock_band(path):
    """Shading variation in the lock band, as a median over several patches."""
    im = Image.open(path)
    hpx = subject_px(im)
    size = max(32, int(hpx * LOCK_PATCH))
    k1 = max(1, int(hpx * LOCK_BAND[0] / 2))
    k2 = max(2, int(hpx * LOCK_BAND[1] / 2))
    pats = brown_patches(im, size, want=12, min_frac=LOCK_MIN_BROWN)
    sds = [float((box_blur(p, k1) - box_blur(p, k2)).std()) for _f, p in pats]
    return {"n": len(pats), "sd": float(np.median(sds)), "k": (k1, k2)}


def main():
    paths = sys.argv[1:] or DEFAULT
    print("  THE MAP ITSELF (no shading, no projection — the gated number)")
    m = measure_map(NAP_MAP)
    if m is None:
        print(f"    {NAP_MAP} missing — run the assemble stage first")
    else:
        print(f"    lion_body_nap.png  {m['res']}px  sd {m['sd']:.2f}  "
              f"bump {m['bump']:.2f} dB at r={m['bump_r']} "
              f"(limit {MAP_BUMP_MAX:.1f} dB)"
              f"{'  <-- PERIODIC' if m['bump'] > MAP_BUMP_MAX else ''}")
    print("")
    print("  RENDERED COAT vs the reference artwork")
    ref = measure(REF)
    print(f"  {'image':26s} {'gold':>6s} {'sd':>8s} {'bump':>9s} {'at r':>6s}")
    print(f"  {'REFERENCE ' + os.path.basename(REF):26s} "
          f"{ref['gold'] * 100:5.0f}% {ref['sd']:8.2f} "
          f"{ref['bump']:7.2f}dB {ref['bump_r']:6d}")
    rows = []
    for p in paths:
        if not os.path.exists(p):
            print(f"  {os.path.basename(p):26s}  missing")
            continue
        r = measure(p)
        rows.append(r)
        print(f"  {os.path.basename(p):26s} {r['gold'] * 100:5.0f}% "
              f"{r['sd']:8.2f} {r['bump']:7.2f}dB {r['bump_r']:6d}"
              f"   sd x{r['sd'] / (ref['sd'] or 1):.2f}"
              f"  bump {r['bump'] - ref['bump']:+.2f}dB vs ref")
    print("")
    print("  MANE GRAIN — is it DIRECTIONAL (see MANE_ELONG_MIN)")
    mref = elongation(REF)
    print(f"  {'REFERENCE ' + os.path.basename(REF):26s} "
          f"feature {mref['feature_H'] * 100:5.2f}%H  elong {mref['elong']:5.2f}"
          f"  sd {mref['sd']:6.2f}  ({mref['n']} patches)")
    mrows = []
    for mp in MANE_VIEWS:
        if not os.path.exists(mp):
            continue
        e = elongation(mp)
        mrows.append(e)
        print(f"  {os.path.basename(mp):26s} "
              f"feature {e['feature_H'] * 100:5.2f}%H  elong {e['elong']:5.2f}"
              f"  sd {e['sd']:6.2f}  ({e['n']} patches)")
    mane_mean = sum(r["elong"] for r in mrows) / len(mrows) if mrows else 0.0
    if mrows:
        print(f"  mean elongation {mane_mean:.2f} against the reference's "
              f"{mref['elong']:.2f} (limit {MANE_ELONG_MIN:.2f})"
              f"{'   <-- NOT DIRECTIONAL' if mane_mean < MANE_ELONG_MIN else ''}")
    print("")
    print("  MANE LOCKS — how much of the reference's lock structure is there")
    lref = lock_band(REF)
    print(f"  {'REFERENCE ' + os.path.basename(REF):26s} lock sd {lref['sd']:6.2f}"
          f"  ({lref['n']} patches)")
    lrows = []
    for mp in MANE_VIEWS:
        if not os.path.exists(mp):
            continue
        lb = lock_band(mp)
        lrows.append(lb)
        print(f"  {os.path.basename(mp):26s} lock sd {lb['sd']:6.2f}"
              f"  ({lb['n']} patches)")
    lock_mean = sum(r["sd"] for r in lrows) / len(lrows) if lrows else 0.0
    if lrows:
        print(f"  mean lock sd {lock_mean:.2f} against the reference's "
              f"{lref['sd']:.2f} — "
              f"{100.0 * lock_mean / (lref['sd'] or 1):.0f}% of it. "
              f"REPORTED, NOT GATED: see the note on LOCK_BAND.")
    print("")
    print("===NAP_QA===")
    if m:
        print(f"MAP_BUMP_DB={m['bump']:.2f} MAP_BUMP_R={m['bump_r']} "
              f"MAP_SD={m['sd']:.2f}")
    print(f"REF_SD={ref['sd']:.2f} REF_BUMP_DB={ref['bump']:.2f}")
    if rows:
        print(f"WORST_RENDER_BUMP_DB={max(r['bump'] for r in rows):.2f}")
        print(f"WORST_RENDER_SD={max(r['sd'] for r in rows):.2f}")
    if mrows:
        print(f"MANE_ELONG_MEAN={mane_mean:.2f} MANE_ELONG_MIN_VIEW="
              f"{min(r['elong'] for r in mrows):.2f} REF_MANE_ELONG={mref['elong']:.2f}")
    bad = bool(m and m["bump"] > MAP_BUMP_MAX)
    if lrows:
        print(f"MANE_LOCK_SD_MEAN={lock_mean:.2f} REF_LOCK_SD={lref['sd']:.2f}")
    if mrows and mane_mean < MANE_ELONG_MIN:
        bad = True
    print(f"NAP_PERIODIC={'1' if bad else '0'}")
    print("===NAP_QA_END===")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
