"""
band_spans.py — turn a silhouette overlay into correction numbers.

`silhouette_qa.py` says HOW MUCH a band disagrees. It does not say WHICH WAY, and
reading that off a red/blue overlay by eye is exactly the guesswork this pipeline
exists to avoid. A band can carry 10,000 missing pixels because the shape is too
narrow, because it is too short, or because it sits in the wrong place, and those
three call for opposite corrections.

So for each height band this reports, in units of H:

  span      the outer extent (left edge, right edge, width) of each mask
  gap       the largest interior hole along the row — the crotch gap in a front
            view, the belly clearance between fore and hind legs in a side view
  centroid  where the material actually sits, which catches a form that is the
            right size in the wrong place

Every figure is printed for reference and model side by side with the delta, so a
correction can be typed straight into the cage tables in millimetres rather than
inferred from a colour.

Run:
  python3 tools/cad/band_spans.py mascot subject [view]
"""
import os
import sys

import numpy as np
from PIL import Image

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
VIEWS = os.path.join(REPO, "art", "blender", "references", "turnaround-views")
NAME = sys.argv[1] if len(sys.argv) > 1 else "mascot"
PART = sys.argv[2] if len(sys.argv) > 2 else "subject"
ONLY = sys.argv[3] if len(sys.argv) > 3 else None
SIL = os.path.join(REPO, "art", "blender", "references", f"silhouette-{NAME}")
HPX, GROUND_ROW = 520, 620
BANDS = 20


def load(p):
    return np.asarray(Image.open(p).convert("L")) > 96


def row_stats(mask_rows):
    """Outer span, largest interior gap and centroid for a stack of rows."""
    cols = np.where(mask_rows.any(axis=0))[0]
    if not len(cols):
        return None
    lo, hi = cols.min(), cols.max()
    # Largest interior run of empty columns inside the span. Measured on the
    # column union rather than per row: a single ragged row must not report a
    # hole the form does not have.
    filled = mask_rows.any(axis=0)[lo:hi + 1]
    gap = best = 0
    for f in filled:
        gap = 0 if f else gap + 1
        best = max(best, gap)
    cx = float(np.argwhere(mask_rows)[:, 1].mean())
    return lo, hi, best, cx


def px(v):
    return v / HPX


def main():
    views = ["front", "side", "rear", "three-quarter"]
    if ONLY:
        views = [ONLY]
    for view in views:
        ref_p = os.path.join(VIEWS, f"{view}-{'norm' if PART == 'subject' else PART}.png")
        if not os.path.exists(ref_p):
            ref_p = os.path.join(VIEWS, f"{view}-norm.png")
        mod_p = os.path.join(SIL, f"model-{view}.png")
        if not (os.path.exists(ref_p) and os.path.exists(mod_p)):
            continue
        ref, mod = load(ref_p), load(mod_p)
        print(f"\n=== {view.upper()} ===  (units of H; +delta = model larger)")
        print("  band      ref_w  mod_w   dw   | ref_gap mod_gap  | ref_cx mod_cx   dcx")
        for i in range(BANDS):
            z1 = 1.0 - i / BANDS
            z0 = 1.0 - (i + 1) / BANDS
            r0 = int(GROUND_ROW - z1 * HPX)
            r1 = int(GROUND_ROW - z0 * HPX)
            if r1 <= r0:
                continue
            rs, ms = row_stats(ref[r0:r1]), row_stats(mod[r0:r1])
            if rs is None and ms is None:
                continue
            if rs is None or ms is None:
                who = "ref only" if ms is None else "model only"
                print(f"  {z0:.2f}-{z1:.2f}   {who}")
                continue
            rw, mw = px(rs[1] - rs[0]), px(ms[1] - ms[0])
            flag = ""
            if abs(rw - mw) > 0.030:
                flag = "  <-- width"
            if abs(px(rs[2]) - px(ms[2])) > 0.030:
                flag += "  <-- gap"
            if abs(px(rs[3] - ms[3])) > 0.025:
                flag += "  <-- placed"
            print(f"  {z0:.2f}-{z1:.2f}   {rw:.3f}  {mw:.3f} {mw - rw:+.3f}  | "
                  f"  {px(rs[2]):.3f}   {px(ms[2]):.3f}  | "
                  f" {px(rs[3]):.3f}  {px(ms[3]):.3f} {px(ms[3] - rs[3]):+.3f}{flag}")


if __name__ == "__main__":
    main()
