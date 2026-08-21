"""
measure_reference.py — turn the approved turnaround into numbers Blender can use.

The silhouette masks constrain the OUTER shape. They cannot separate the skull
from the mane, and the skull is what the body cage has to match — the mane is
separate geometry. The artwork does distinguish them, by colour, so the boundary
is measured rather than inferred.

Cluster centres come from the image's own histogram, not from assumed hue ranges.
Measured on the front view (122,867 subject pixels):

    mane    hue 17.5-30 deg   sat ~0.85   value 0.33-0.60   (auburn, dark)
    body    hue 30.0-40 deg   sat ~0.70   value 0.69-0.98   (gold and cream)

Value is the clean separator; hue confirms it.

Outputs `reference_model.json`, which Blender loads with the standard library
alone — Blender ships numpy but not PIL, so all image work happens here.

Run:
  python3 tools/cad/measure_reference.py
"""

import json
import os
import sys
from collections import deque

import numpy as np
from PIL import Image

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(REPO, "art", "blender", "references",
                   "turnaround-approved", "lion-four-view.png")
OUT_DIR = os.path.join(REPO, "art", "blender", "references", "turnaround-views")

QUADS = {"front": (0, 0), "side": (1, 0), "rear": (0, 1), "three-quarter": (1, 1)}
CANVAS, HPX, GROUND_ROW = 700, 520, 620

MANE_HUE_MAX = 30.0 / 360.0
MANE_VAL_MAX = 0.65


def subject_and_parts(a):
    """Subject mask, plus its mane and body sub-masks."""
    hsv = np.asarray(Image.fromarray(a).convert("HSV")).astype(np.float32) / 255.0
    h, s, v = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    corners = np.concatenate([v[:14, :14].ravel(), v[:14, -14:].ravel(), v[-14:, :14].ravel()])
    bgv = float(np.median(corners))
    subj = (s > 0.17) | (v > bgv + 0.055)
    subj = largest_component(subj)
    mane = subj & (h < MANE_HUE_MAX) & (v < MANE_VAL_MAX)
    # Largest component only. Anti-aliased edges, the shadowed undersides of the
    # paws and the tail tuft are all dark-and-warm, so a raw colour mask reported
    # the mane as spanning the entire figure (h 0.00-0.99, u 0.00-1.00) and made
    # the derived muzzle projection come out as exactly zero.
    if mane.any():
        mane = largest_component(mane)
    body = subj & ~mane
    return subj, mane, body


def largest_component(m):
    lab = np.zeros(m.shape, np.int32)
    best, best_n, cur = 0, 0, 0
    for sy in range(0, m.shape[0], 2):
        for sx in range(0, m.shape[1], 2):
            if not m[sy, sx] or lab[sy, sx]:
                continue
            cur += 1
            q = deque([(sy, sx)])
            lab[sy, sx] = cur
            n = 0
            while q:
                y, x = q.popleft()
                n += 1
                for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    yy, xx = y + dy, x + dx
                    if 0 <= yy < m.shape[0] and 0 <= xx < m.shape[1] \
                            and m[yy, xx] and not lab[yy, xx]:
                        lab[yy, xx] = cur
                        q.append((yy, xx))
            if n > best_n:
                best_n, best = n, cur
    return lab == best


def normalise(masks, ref):
    """Rescale a view's masks so ground = GROUND_ROW and height = HPX.

    Front, side and rear disagree by 11.8% in height and 26px in ground line in
    the source artwork — they were drawn, not rendered from one camera. Every
    view is put into one frame before any measurement is used.
    """
    ys, xs = np.nonzero(ref)
    top, bot = int(ys.min()), int(ys.max())
    scale = HPX / (bot - top)
    out = {}
    for key, m in masks.items():
        src = Image.fromarray((m * 255).astype(np.uint8))
        src = src.resize((int(round(src.width * scale)), int(round(src.height * scale))),
                         Image.LANCZOS)
        sm = np.asarray(src) > 110
        out[key] = sm
    rys, rxs = np.nonzero(out["subject"])
    dy = GROUND_ROW - int(rys.max())
    dx = CANVAS // 2 - int((rxs.min() + rxs.max()) // 2)
    fixed = {}
    for key, sm in out.items():
        canvas = np.zeros((CANVAS, CANVAS), bool)
        ys2, xs2 = np.nonzero(sm)
        yy, xx = ys2 + dy, xs2 + dx
        ok = (yy >= 0) & (yy < CANVAS) & (xx >= 0) & (xx < CANVAS)
        canvas[yy[ok], xx[ok]] = True
        fixed[key] = canvas
    return fixed


def runs(line, gap=3):
    idx = np.nonzero(line)[0]
    if not len(idx):
        return []
    out, s = [], idx[0]
    for a, b in zip(idx, idx[1:]):
        if b - a > gap:
            out.append((s, a))
            s = b
    out.append((s, idx[-1]))
    return out


def width_profile(m):
    """Half-width against height, for one mask."""
    rows = {}
    for y in range(GROUND_ROW, GROUND_ROW - HPX - 2, -1):
        rs = runs(m[y])
        if not rs:
            continue
        h = round((GROUND_ROW - y) / HPX, 3)
        outer = (min(a for a, _ in rs), max(b for _, b in rs))
        rows[f"{h:.3f}"] = {
            "half_w": round((outer[1] - outer[0]) / 2 / HPX, 5),
            "main_half_w": round(max(b - a for a, b in rs) / 2 / HPX, 5),
            "runs": len(rs),
        }
    return rows


def depth_profile(m, x_origin):
    """Top and bottom against fore-aft position, for one mask."""
    cols = {}
    ys, xs = np.nonzero(m)
    for x in range(int(xs.min()), int(xs.max()) + 1):
        rs = runs(m[:, x])
        if not rs:
            continue
        u = round((x - x_origin[0]) / (x_origin[1] - x_origin[0]), 4)
        cols[f"{u:.4f}"] = {
            "top": round((GROUND_ROW - rs[0][0]) / HPX, 5),
            "first_bottom": round((GROUND_ROW - rs[0][1]) / HPX, 5),
            "lowest": round((GROUND_ROW - rs[-1][1]) / HPX, 5),
            "runs": len(rs),
        }
    return cols


def main():
    im = Image.open(SRC).convert("RGB")
    W, Ht = im.size
    cw, ch = W // 2, Ht // 2
    model = {"canvas": CANVAS, "h_px": HPX, "ground_row": GROUND_ROW,
             "centre_col": CANVAS // 2, "mane_hue_max_deg": 30.0,
             "mane_val_max": MANE_VAL_MAX, "views": {}}

    for name, (qx, qy) in QUADS.items():
        q = im.crop((qx * cw, qy * ch, (qx + 1) * cw, (qy + 1) * ch))
        a = np.asarray(q)
        subj, mane, body = subject_and_parts(a)
        n = normalise({"subject": subj, "mane": mane, "body": body}, subj)
        for key, m in n.items():
            Image.fromarray((m * 255).astype(np.uint8)).save(f"{OUT_DIR}/{name}-{key}-norm.png")
        # Keep the plain silhouette name the earlier QA already uses.
        Image.fromarray((n["subject"] * 255).astype(np.uint8)).save(f"{OUT_DIR}/{name}-norm.png")

        entry = {"mane_px": int(n["mane"].sum()), "body_px": int(n["body"].sum()),
                 "subject_px": int(n["subject"].sum())}
        if name in ("front", "rear"):
            entry["subject_width"] = width_profile(n["subject"])
            entry["mane_width"] = width_profile(n["mane"])
            entry["body_width"] = width_profile(n["body"])
        if name in ("side", "three-quarter"):
            ys, xs = np.nonzero(n["subject"])
            span = (int(xs.min()), int(xs.max()))
            entry["x_span"] = span
            entry["length_H"] = round((span[1] - span[0]) / HPX, 4)
            entry["subject_depth"] = depth_profile(n["subject"], span)
            entry["mane_depth"] = depth_profile(n["mane"], span)
            entry["body_depth"] = depth_profile(n["body"], span)
        model["views"][name] = entry
        print(f"{name:14} subject={entry['subject_px']:6d}  "
              f"mane={entry['mane_px']:6d} ({100*entry['mane_px']/entry['subject_px']:4.1f}%)  "
              f"body={entry['body_px']:6d}")

    f = model["views"]["front"]
    s = model["views"]["side"]

    def peak(d, key="half_w"):
        best = max(d.items(), key=lambda kv: kv[1][key])
        return float(best[0]), best[1][key]

    lm = {}
    h, w = peak(f["subject_width"]); lm["front_widest"] = {"h": h, "width": round(2 * w, 4)}
    h, w = peak(f["mane_width"]); lm["mane_widest"] = {"h": h, "width": round(2 * w, 4)}
    h, w = peak(f["body_width"], "main_half_w")
    lm["body_widest_front"] = {"h": h, "width": round(2 * w, 4)}
    # Extents need a MINIMUM RUN, not "any pixel". A single stray pixel from
    # anti-aliasing is enough to stretch a band across the whole figure.
    MIN_RUN_H = 10.0 / HPX

    def band(d, key="half_w"):
        ks = sorted(float(k) for k in d if d[f"{float(k):.3f}"][key] * 2 >= MIN_RUN_H) \
            if all(len(k) == 5 for k in d) else \
            sorted(float(k) for k in d if d[k][key] * 2 >= MIN_RUN_H)
        return {"low": ks[0], "high": ks[-1]} if ks else {"low": 0.0, "high": 0.0}

    def span(d):
        ks = sorted(float(k) for k in d if (d[k]["top"] - d[k]["first_bottom"]) >= MIN_RUN_H)
        return {"front_u": ks[0], "rear_u": ks[-1]} if ks else {"front_u": 0.0, "rear_u": 0.0}

    lm["mane_band"] = band(f["mane_width"])
    lm["body_band_front"] = band(f["body_width"])
    lm["mane_span_side"] = span(s["mane_depth"])
    lm["body_span_side"] = span(s["body_depth"])
    mane_us = [lm["mane_span_side"]["front_u"], lm["mane_span_side"]["rear_u"]]
    body_us = [lm["body_span_side"]["front_u"], lm["body_span_side"]["rear_u"]]
    lm["muzzle_projection_H"] = round((mane_us[0] - body_us[0]) * s["length_H"], 4)
    lm["side_length_H"] = s["length_H"]
    model["landmarks"] = lm

    with open(os.path.join(OUT_DIR, "reference_model.json"), "w") as fh:
        json.dump(model, fh)

    print("\nMEASURED LANDMARKS (H = total height, ground = 0)")
    print(f"  overall widest        {lm['front_widest']['width']:.3f} H at h={lm['front_widest']['h']:.2f}")
    print(f"  MANE widest           {lm['mane_widest']['width']:.3f} H at h={lm['mane_widest']['h']:.2f}")
    print(f"  BODY widest (front)   {lm['body_widest_front']['width']:.3f} H at h={lm['body_widest_front']['h']:.2f}")
    print(f"  mane vertical band    h {lm['mane_band']['low']:.2f} .. {lm['mane_band']['high']:.2f}")
    print(f"  mane fore-aft (side)  u {lm['mane_span_side']['front_u']:.2f} .. {lm['mane_span_side']['rear_u']:.2f}")
    print(f"  body fore-aft (side)  u {lm['body_span_side']['front_u']:.2f} .. {lm['body_span_side']['rear_u']:.2f}")
    print(f"  muzzle beyond mane    {lm['muzzle_projection_H']:.3f} H")
    print(f"  side length           {lm['side_length_H']:.3f} H")
    print(f"\nwrote {OUT_DIR}/reference_model.json")


if __name__ == "__main__":
    sys.exit(main())
