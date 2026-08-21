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
SIL = os.path.join(REPO, "art", "blender", "references", "silhouette-qa")
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
    for view in ("front", "side", "rear"):
        ref = load(os.path.join(VIEWS, f"{view}-norm.png"))
        mod = load(os.path.join(SIL, f"model-{view}.png"))
        if ref.shape != mod.shape:
            raise SystemExit(f"{view}: shape mismatch {ref.shape} vs {mod.shape}")
        inter, union = (ref & mod).sum(), (ref | mod).sum()
        miss, extra = (ref & ~mod).sum(), (mod & ~ref).sum()
        report[view] = {
            "iou": round(float(inter / union), 4),
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
        overlays[view].save(os.path.join(SIL, f"overlay-{view}.png"))

    sheet = Image.new("RGB", (700 * 3, 700), (10, 10, 12))
    for i, view in enumerate(("front", "side", "rear")):
        sheet.paste(overlays[view], (i * 700, 0))
    sheet.save(os.path.join(SIL, "overlay-sheet.png"))

    with open(os.path.join(SIL, "silhouette_report.json"), "w") as fh:
        json.dump(report, fh, indent=2)

    print("===SILHOUETTE_QA===")
    for view, r in report.items():
        print(f"{view:6} IoU={r['iou']:.4f}  missing={r['missing_pct']:5.2f}%  "
              f"extra={r['extra_pct']:5.2f}%")
    print(f"MEAN_IOU={np.mean([r['iou'] for r in report.values()]):.4f}")
    print("\nworst bands (largest disagreement, by height):")
    for view, r in report.items():
        worst = sorted(r["bands"], key=lambda b: b["iou"])[:3]
        for b in worst:
            print(f"  {view:6} h {b['band_h'][0]:.1f}-{b['band_h'][1]:.1f}  "
                  f"IoU={b['iou']:.3f} missing={b['missing']:6d} extra={b['extra']:6d}")
    print("===SILHOUETTE_QA_END===")


if __name__ == "__main__":
    sys.exit(main())
