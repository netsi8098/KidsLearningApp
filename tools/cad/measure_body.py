"""
measure_body.py — the coat's colour regions, off the approved turnaround.

WHY SEPARATE FROM measure_face.py
`measure_face` measures inside the mane's aperture, in the front view, and
everything it finds is a facial feature placed as its own small object. These
regions are different in both respects: they are on the BODY, and three of the
four are not visible in the front view at all — the tail tuft only reads from
the side and the rear, and the paws are clipped by the front view's crop.

They are also built differently. A face decal is a separate mesh because an eye
is a distinct object; a coat region is just a different colour on the same
skin, so these are painted onto the cage's vertices. Since the cage is now
subdivided to 15,954 verts that gives a clean enough boundary, costs no extra
draw call, and cannot float off the surface the way a decal can.

WHAT THE APPROVED REFERENCE ACTUALLY CONTAINS
Two of the five regions that were asked for are NOT in it, and inventing them
would be worse than leaving them out:

  * NO CHEEK BLUSH. Measured on the cheeks: hue 36.7-39.5 deg, saturation
    0.58-0.71, against a forehead of hue 36.7 / saturation 0.75. So the cheeks
    are slightly LESS saturated and slightly MORE yellow. A blush moves hue
    DOWN toward red (0-20 deg) and adds saturation; this moves the other way.
    What is there is a broad highlight, not a blush.

  * ALMOST NO CHEST BIB. The mane covers the chest to h 0.20 in this
    turnaround, and below it the midline reads (207,156,89) at saturation 0.57
    — a desaturated gold, not the muzzle's cream (247,209,154 at 0.38). Only a
    small patch at h 0.17-0.21 crosses the cream threshold at all. So the bib
    is recorded at its measured extent and its measured colour, which is a pale
    gold tip rather than the cream V of a hero render.

Run:
  python3 tools/cad/measure_body.py

Outputs:
  art/blender/references/turnaround-views/body_model.json
"""

import json
import os
from collections import deque

import numpy as np
from PIL import Image

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
VIEWS = os.path.join(REPO, "art", "blender", "references", "turnaround-views")
OUT = os.path.join(VIEWS, "body_model.json")


def components(mask, min_area):
    seen = np.zeros(mask.shape, bool)
    out = []
    ys, xs = np.nonzero(mask)
    for y0, x0 in zip(ys, xs):
        if seen[y0, x0]:
            continue
        q = deque([(y0, x0)])
        seen[y0, x0] = True
        pix = []
        while q:
            y, x = q.popleft()
            pix.append((y, x))
            for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                a, b = y + dy, x + dx
                if (0 <= a < mask.shape[0] and 0 <= b < mask.shape[1]
                        and mask[a, b] and not seen[a, b]):
                    seen[a, b] = True
                    q.append((a, b))
        if len(pix) >= min_area:
            out.append(np.array(pix))
    return sorted(out, key=len, reverse=True)


def srgb01(rgb):
    return [round(c / 255.0, 5) for c in rgb]


class View:
    def __init__(self, name):
        self.name = name
        self.rgb = np.asarray(Image.open(os.path.join(VIEWS, f"{name}.png")).convert("RGB"))
        self.subj = np.asarray(Image.open(os.path.join(VIEWS, f"{name}-mask.png"))) > 127
        hsv = np.asarray(Image.fromarray(self.rgb).convert("HSV")).astype(np.float32) / 255.0
        self.h, self.s, self.v = hsv[..., 0] * 360.0, hsv[..., 1], hsv[..., 2]
        ys, xs = np.nonzero(self.subj)
        self.top, self.ground = int(ys.min()), int(ys.max())
        self.left, self.right = int(xs.min()), int(xs.max())
        self.hp = self.ground - self.top

    def band(self, pix):
        ys, xs = pix[:, 0], pix[:, 1]
        med = np.median(self.rgb[ys, xs].astype(np.float32), axis=0)
        rgb = [int(round(c)) for c in med]
        return {
            "area_px": int(len(pix)),
            "h_bot": round((self.ground - ys.max()) / self.hp, 5),
            "h_top": round((self.ground - ys.min()) / self.hp, 5),
            "h": round((self.ground - ys.mean()) / self.hp, 5),
            "u_lo": round((xs.min() - self.left) / self.hp, 5),
            "u_hi": round((xs.max() - self.left) / self.hp, 5),
            "rgb": rgb,
            "srgb01": srgb01(rgb),
        }


def main():
    front, side, rear = View("front"), View("side"), View("rear")
    model = {"units": "h = height / subject height; u = lateral or fore-aft "
                      "offset from the mask's own left edge, in the same units"}

    # ---- paws -----------------------------------------------------------
    # Cream, and the lowest cream on the figure. Four components in the front
    # view: two outer (the front paws) and two inner (the rear paws showing
    # between them).
    cream_f = front.subj & (front.s < 0.55) & (front.v > 0.70)
    paws = [p for p in components(cream_f, 250)
            if (front.ground - p[:, 0].min()) / front.hp < 0.20]
    if not paws:
        raise SystemExit("[body] no paw components found")
    bands = [front.band(p) for p in paws]
    rgb = np.median(np.array([b["rgb"] for b in bands]), axis=0)
    model["paw"] = {
        "count": len(bands),
        "h_top": round(max(b["h_top"] for b in bands), 5),
        "h_bot": round(min(b["h_bot"] for b in bands), 5),
        "rgb": [int(round(c)) for c in rgb],
        "srgb01": srgb01([int(round(c)) for c in rgb]),
        "per_paw": bands,
    }

    # ---- tail tuft ------------------------------------------------------
    # Auburn, behind the body and low. In the side view the body's mane spans
    # u 0.147-0.702 and the tuft sits at u 1.263-1.428 — past the rump, which
    # is what identifies it without naming a row.
    auburn_s = side.subj & (side.h < 32) & (side.s > 0.60) & (side.v > 0.20) & (side.v < 0.62)
    comps = components(auburn_s, 300)
    if not comps:
        raise SystemExit("[body] no auburn components in the side view")
    mane = side.band(comps[0])          # by far the largest
    tuft = None
    for p in comps[1:]:
        b = side.band(p)
        if b["u_lo"] > mane["u_hi"] and b["h_top"] < 0.45:
            tuft = b
            break
    if tuft is None:
        raise SystemExit("[body] tail tuft not found behind the mane")
    model["tail_tuft"] = tuft
    model["tail_tuft"]["note"] = (
        "identified as auburn BEHIND the mane's own fore-aft span "
        f"(mane u {mane['u_lo']:.3f}-{mane['u_hi']:.3f}) and below h 0.45")

    # ---- inner ear ------------------------------------------------------
    # Warmer and darker than the coat, inside the ear, outboard of the mane's
    # aperture. NOT pink in this reference — measured (183,112,70).
    fm_path = os.path.join(VIEWS, "face_model.json")
    ear = None
    if os.path.exists(fm_path):
        fm = json.load(open(fm_path))
        ap = fm["face_aperture"]
        warm = (front.subj & ((front.h < 25) | (front.h > 350))
                & (front.s > 0.25) & (front.s < 0.68) & (front.v > 0.60))
        for p in components(warm, 120):
            ys, xs = p[:, 0], p[:, 1]
            h = (front.ground - ys.mean()) / front.hp
            x = (xs.mean() - front.frame_axis) if hasattr(front, "frame_axis") else None
            # Ear height band, and outboard of the aperture's half-width.
            x_abs = abs(xs.mean() - fm["frame"]["axis_col"]) / front.hp
            if 0.55 < h < 0.80 and x_abs > ap["half_w_H"] * 0.95:
                ear = front.band(p)
                ear["x_H_abs"] = round(x_abs, 5)
                break
    model["inner_ear"] = ear
    if ear is None:
        model["inner_ear_note"] = "not isolated; the ear reads close to the mane in hue"

    # ---- chest ----------------------------------------------------------
    # Recorded honestly: the measured colour of the chest below the mane, plus
    # whatever actually crosses the cream threshold there.
    chest_rows = [(front.ground - int(round(h * front.hp))) for h in (0.155, 0.175, 0.195)]
    samples = []
    axis = int(round(json.load(open(fm_path))["frame"]["axis_col"])) if os.path.exists(fm_path) \
        else (front.left + front.right) // 2
    for row in chest_rows:
        for dx in range(-40, 41, 8):
            col = axis + dx
            if front.subj[row, col]:
                samples.append(front.rgb[row, col].astype(np.float32))
    if samples:
        med = np.median(np.array(samples), axis=0)
        rgb = [int(round(c)) for c in med]
        model["chest"] = {
            "h_lo": 0.155, "h_hi": 0.195,
            "rgb": rgb, "srgb01": srgb01(rgb),
            "note": ("the mane covers the chest to h 0.20 in this turnaround; "
                     "this is a DESATURATED GOLD, not the muzzle's cream"),
        }

    # ---- the two that are not there -------------------------------------
    model["absent"] = {
        "cheek_blush": ("cheeks measure hue 36.7-39.5 deg / sat 0.58-0.71 against "
                        "a forehead of 36.7 / 0.75 — less saturated and MORE "
                        "yellow. A blush moves hue toward red and adds "
                        "saturation. Not built."),
        "cream_chest_bib": ("only a small patch at h 0.17-0.21 crosses the cream "
                            "threshold; the chest midline is (207,156,89) at "
                            "sat 0.57 against the muzzle's (247,209,154) at 0.38. "
                            "Recorded as `chest` at its measured colour instead."),
    }

    with open(OUT, "w") as fh:
        json.dump(model, fh, indent=2)

    print("===BODY_MODEL===")
    p = model["paw"]
    print(f"PAW        {p['count']} components, h {p['h_bot']:.4f}-{p['h_top']:.4f}, rgb={p['rgb']}")
    t = model["tail_tuft"]
    print(f"TAIL_TUFT  h {t['h_bot']:.4f}-{t['h_top']:.4f}, u {t['u_lo']:.3f}-{t['u_hi']:.3f}, rgb={t['rgb']}")
    if model["inner_ear"]:
        e = model["inner_ear"]
        print(f"INNER_EAR  h {e['h_bot']:.4f}-{e['h_top']:.4f}, x=±{e['x_H_abs']:.4f}, rgb={e['rgb']}")
    else:
        print("INNER_EAR  not isolated")
    if model.get("chest"):
        print(f"CHEST      h 0.155-0.195, rgb={model['chest']['rgb']} (desaturated gold, not cream)")
    print("ABSENT     cheek_blush, cream_chest_bib — see body_model.json")
    print("===BODY_MODEL_END===")
    print(f"[body] wrote {OUT}")


if __name__ == "__main__":
    main()
