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
    print("===NAP_QA===")
    if m:
        print(f"MAP_BUMP_DB={m['bump']:.2f} MAP_BUMP_R={m['bump_r']} "
              f"MAP_SD={m['sd']:.2f}")
    print(f"REF_SD={ref['sd']:.2f} REF_BUMP_DB={ref['bump']:.2f}")
    if rows:
        print(f"WORST_RENDER_BUMP_DB={max(r['bump'] for r in rows):.2f}")
        print(f"WORST_RENDER_SD={max(r['sd'] for r in rows):.2f}")
    bad = bool(m and m["bump"] > MAP_BUMP_MAX)
    print(f"NAP_PERIODIC={'1' if bad else '0'}")
    print("===NAP_QA_END===")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
