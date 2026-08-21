"""
silhouette_qa.py — compare model silhouettes against the reference views.

The proportion dashboard reports scalars: height, width, length. Those can all be
right while the shape is wrong. A silhouette comparison catches what scalars
cannot — a muzzle that is too long, a mane too wide, legs too thick — because it
asks whether the outline itself agrees, pixel by pixel.

Reported per view:
  IoU              intersection over union of the two masks
  missing          reference pixels the model does not cover  (model too small)
  extra            model pixels outside the reference         (model too large)
  row profile      where along the height the two disagree most

The numbers are a guide, not the goal. A high IoU with the wrong character is
still the wrong character, and the visual overlay stays authoritative.
"""
import json
import os
import sys

import numpy as np
from PIL import Image

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
VIEWS = os.path.join(REPO, "art", "blender", "references", "turnaround-views")
# Which render folder to grade. Defaults to the CAD volume; pass a name to grade
# any asset rendered by tools/blender/silhouette_render.py.
NAME = sys.argv[1] if len(sys.argv) > 1 else "qa"
# Which reference mask to grade against.
#   subject -> the whole silhouette, body + mane
#   body    -> the measured gold/cream region only
# Grading a body-only render against the full silhouette reports the missing mane
# as a body defect, which is not a useful signal.
PART = sys.argv[2] if len(sys.argv) > 2 else "subject"
SIL = os.path.join(REPO, "art", "blender", "references",
                   "silhouette-qa" if NAME == "qa" else f"silhouette-{NAME}")
HPX, GROUND_ROW = 520, 620


def load(path):
    a = np.asarray(Image.open(path).convert("L"))
    return a > 96


def band_profile(ref, mod, bands=10):
    """Disagreement by height band, so an error can be located."""
    out = []
    for i in range(bands):
        z0 = 1.0 - (i + 1) / bands
        z1 = 1.0 - i / bands
        r0 = int(GROUND_ROW - z1 * HPX)
        r1 = int(GROUND_ROW - z0 * HPX)
        r, m = ref[r0:r1], mod[r0:r1]
        u = (r | m).sum()
        if u == 0:
            continue
        out.append({
            "band_h": [round(z0, 2), round(z1, 2)],
            "iou": round(float((r & m).sum() / u), 4),
            "missing": int((r & ~m).sum()),
            "extra": int((m & ~r).sum()),
        })
    return out


def main():
    report, overlays = {}, {}
    views = [v for v in ("front", "side", "rear", "three-quarter")
             if os.path.exists(os.path.join(SIL, f"model-{v}.png"))]
    for view in views:
        rname = f"{view}-norm.png" if PART == "subject" else f"{view}-{PART}-norm.png"
        ref = load(os.path.join(VIEWS, rname))
        mod = load(os.path.join(SIL, f"model-{view}.png"))
        if ref.shape != mod.shape:
            raise SystemExit(f"{view}: shape mismatch {ref.shape} vs {mod.shape}")

        # HORIZONTAL REGISTRATION, by centroid, before grading.
        #
        # An unregistered silhouette comparison measures two things at once: shape
        # AND where the drawing happens to sit in its canvas. The reference
        # turnaround was already measured as not orthographically consistent (the
        # four views disagreed by 11.8% in height and 26px in ground line), so
        # some fore-aft offset between views is a property of the artwork, not of
        # the model. The three-quarter view carries the worst of it — a 12px
        # offset, against 6px or less for front, side and rear — which was quietly
        # costing about 0.019 IoU and reading as a shape defect.
        #
        # Registration is by CENTROID, not by best-fit search. Searching for the
        # offset that maximises IoU would be tuning the metric to flatter the
        # model; a centroid is an objective landmark that cannot be steered. The
        # raw figure is reported alongside so nothing is hidden, and the applied
        # offset is printed — a large offset is itself a signal worth seeing.
        raw_iou = float((ref & mod).sum() / max(1, (ref | mod).sum()))
        dx = int(round(np.argwhere(ref)[:, 1].mean() - np.argwhere(mod)[:, 1].mean()))
        if dx:
            mod = np.roll(mod, dx, axis=1)
            if dx > 0:
                mod[:, :dx] = False
            else:
                mod[:, dx:] = False
        inter, union = (ref & mod).sum(), (ref | mod).sum()
        miss, extra = (ref & ~mod).sum(), (mod & ~ref).sum()
        report[view] = {
            "iou": round(float(inter / union), 4),
            "iou_unregistered": round(raw_iou, 4),
            "registration_px": dx,
            "missing_pct": round(100.0 * miss / ref.sum(), 2),
            "extra_pct": round(100.0 * extra / ref.sum(), 2),
            "ref_px": int(ref.sum()), "model_px": int(mod.sum()),
            "bands": band_profile(ref, mod),
        }
        rgb = np.zeros((*ref.shape, 3), np.uint8)
        rgb[..., 0] = np.where(ref & ~mod, 235, 0)      # red   = missing
        rgb[..., 1] = np.where(ref & mod, 210, 0)       # green = agreement
        rgb[..., 2] = np.where(mod & ~ref, 235, 0)      # blue  = extra
        overlays[view] = Image.fromarray(rgb)
        overlays[view].save(os.path.join(SIL, f"overlay-{PART}-{view}.png"))

    sheet = Image.new("RGB", (700 * len(views), 700), (10, 10, 12))
    for i, view in enumerate(views):
        sheet.paste(overlays[view], (i * 700, 0))
    sheet.save(os.path.join(SIL, f"overlay-{PART}-sheet.png"))

    with open(os.path.join(SIL, f"silhouette_report_{PART}.json"), "w") as fh:
        json.dump(report, fh, indent=2)

    print(f"===SILHOUETTE_QA=== [{NAME} vs {PART}]")
    for view, r in report.items():
        print(f"{view:6} IoU={r['iou']:.4f}  missing={r['missing_pct']:5.2f}%  "
              f"extra={r['extra_pct']:5.2f}%")
    # Authority order from the brief: front hero, then side, then 3/4, with the
    # rear allowed tolerance for the documented 18% mane-width disagreement.
    WEIGHT = {"front": 0.35, "side": 0.30, "three-quarter": 0.25, "rear": 0.10}
    tw = sum(WEIGHT[v] for v in report)
    print("registration (centroid, px): " + "  ".join(
        f"{v}={report[v]['registration_px']:+d}" for v in report))
    print("unregistered IoU:           " + "  ".join(
        f"{v}={report[v]['iou_unregistered']:.4f}" for v in report))
    weighted = sum(report[v]["iou"] * WEIGHT[v] for v in report) / tw
    print(f"MEAN_IOU={np.mean([r['iou'] for r in report.values()]):.4f}")
    print(f"WEIGHTED_IOU={weighted:.4f}   (front .35 side .30 3/4 .25 rear .10)")
    print("\nworst bands (largest disagreement, by height):")
    for view, r in report.items():
        worst = sorted(r["bands"], key=lambda b: b["iou"])[:3]
        for b in worst:
            print(f"  {view:6} h {b['band_h'][0]:.1f}-{b['band_h'][1]:.1f}  "
                  f"IoU={b['iou']:.3f} missing={b['missing']:6d} extra={b['extra']:6d}")
    print("===SILHOUETTE_QA_END===")


if __name__ == "__main__":
    sys.exit(main())
