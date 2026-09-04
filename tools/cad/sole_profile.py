"""
sole_profile.py — the paw sole, row by row, as separate runs.

WHY A SEPARATE TOOL

`band_spans.py` reports the OUTER extent of a whole band, and in a side view the
lowest band's outer extent runs from the rear paw's heel to the front paw's toe.
That single number cannot say whether a paw is short, whether it is misplaced, or
whether the two paws have drifted apart — and three passes on this asset argued
about the paws from exactly that number.

    side band     ref_w   mod_w      dw
    0.05-0.10     1.071   1.010   -0.062
    0.00-0.05     0.788   0.754   -0.035

Those deltas are the sum of four independent things. What is actually wanted for a
sole is the fore-aft length of EACH paw at EACH height, because a flat sole and a
rounded one differ in exactly that: a flat sole holds its full length down to the
last row, and a rounded one narrows toward the ground.

So this splits each row into its separate horizontal RUNS — in a side view the
rear paw and the front paw are two of them — and prints their length and position
against the reference, from the ground up.

READ IT LIKE THIS

A FLAT sole holds its length as z falls:

    z 0.030   front 0.253
    z 0.020   front 0.253
    z 0.010   front 0.251

A ROUNDED sole loses length at the bottom, which is the defect this measures:

    z 0.030   front 0.256
    z 0.020   front 0.241
    z 0.010   front 0.180

Run:
  python3 tools/cad/sole_profile.py [name] [part] [view]
  python3 tools/cad/sole_profile.py mascot subject side
"""
import os
import sys

import numpy as np
from PIL import Image

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
VIEWS = os.path.join(REPO, "art", "blender", "references", "turnaround-views")
NAME = sys.argv[1] if len(sys.argv) > 1 else "mascot"
PART = sys.argv[2] if len(sys.argv) > 2 else "subject"
VIEW = sys.argv[3] if len(sys.argv) > 3 else "side"
SIL = os.path.join(REPO, "art", "blender", "references", f"silhouette-{NAME}")

# Same conventions as band_spans and silhouette_qa, so the numbers compose.
HPX, GROUND_ROW = 520, 620
# Rows to report, in units of H above the ground. Dense low down, because that is
# where a rounded cap differs from a flat one, and the interesting range is the
# bottom 6% of a 1.0-tall character.
ROWS = [0.004, 0.008, 0.012, 0.016, 0.020, 0.028, 0.036, 0.048, 0.060, 0.080]
# Runs shorter than this are noise — an antialiased edge or a stray pixel — not a
# paw. 0.02 H is 10 px at this resolution.
MIN_RUN = 0.02


def load(p):
    return np.asarray(Image.open(p).convert("L")) > 96


def runs(row, min_px):
    """Contiguous filled spans in one boolean row, as (lo, hi) inclusive."""
    out = []
    lo = None
    for i, f in enumerate(row):
        if f and lo is None:
            lo = i
        elif not f and lo is not None:
            if i - lo >= min_px:
                out.append((lo, i - 1))
            lo = None
    if lo is not None and len(row) - lo >= min_px:
        out.append((lo, len(row) - 1))
    return out


def px(v):
    return v / HPX


def describe(mask, z):
    """The runs on the row at height `z`, thickened by one row either side.

    Three rows rather than one because a single scanline through an
    antialiased edge can drop out entirely, and a missing row reads as a
    missing paw.
    """
    r = int(round(GROUND_ROW - z * HPX))
    band = mask[max(0, r - 1):r + 2]
    if not band.size:
        return []
    return runs(band.any(axis=0), int(MIN_RUN * HPX))


def main():
    ref_p = os.path.join(VIEWS, f"{VIEW}-{'norm' if PART == 'subject' else PART}.png")
    if not os.path.exists(ref_p):
        ref_p = os.path.join(VIEWS, f"{VIEW}-norm.png")
    mod_p = os.path.join(SIL, f"model-{VIEW}.png")
    for p in (ref_p, mod_p):
        if not os.path.exists(p):
            sys.exit(f"[sole] missing {p}")
    ref, mod = load(ref_p), load(mod_p)

    print(f"=== {VIEW.upper()} sole profile ===  (units of H; runs >= {MIN_RUN} H)")
    print("   z      reference runs (len)            model runs (len)")
    worst = 0.0
    worst_z = None
    for z in ROWS:
        rr, mr = describe(ref, z), describe(mod, z)
        rs = "  ".join(f"{px(a):.3f}-{px(b):.3f}({px(b - a):.3f})" for a, b in rr)
        ms = "  ".join(f"{px(a):.3f}-{px(b):.3f}({px(b - a):.3f})" for a, b in mr)
        print(f"  {z:.3f}  {rs:32s}  {ms}")
        # The comparable figure is the TOTAL contact length across the runs: the
        # count can differ between reference and model when two paws merge into
        # one run at a height, and comparing run-by-run then lines up the wrong
        # pair and reports a fictional error.
        rl = sum(px(b - a) for a, b in rr)
        ml = sum(px(b - a) for a, b in mr)
        if abs(ml - rl) > abs(worst):
            worst, worst_z = ml - rl, z

    print("")
    print("  total contact length per row (sum of runs):")
    for z in ROWS:
        rl = sum(px(b - a) for a, b in describe(ref, z))
        ml = sum(px(b - a) for a, b in describe(mod, z))
        bar = "#" * int(abs(ml - rl) * 200)
        print(f"  {z:.3f}   ref {rl:.3f}   mod {ml:.3f}   {ml - rl:+.3f}  {bar}")

    print("")
    print("===SOLE_PROFILE===")
    print(f"VIEW={VIEW}")
    print(f"WORST_DELTA={worst:+.4f}")
    print(f"WORST_Z={worst_z}")
    # The headline: how much length the model loses between a row clear of the
    # ground and the lowest row. A flat sole loses almost nothing.
    for tag, mask in (("REF", ref), ("MOD", mod)):
        hi = sum(px(b - a) for a, b in describe(mask, 0.036))
        lo = sum(px(b - a) for a, b in describe(mask, 0.004))
        print(f"{tag}_TAPER={hi - lo:+.4f}   (0.036 -> 0.004: {hi:.3f} -> {lo:.3f})")
    print("===SOLE_PROFILE_END===")


if __name__ == "__main__":
    main()
