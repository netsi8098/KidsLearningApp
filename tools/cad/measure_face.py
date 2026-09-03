"""
measure_face.py — GATE 15. Where the face actually is, measured not guessed.

WHY THIS EXISTS
Every other measurement in this pipeline reads a SILHOUETTE. A silhouette
cannot see a face: eyes, brows, nose pad, nostrils and mouth are interior
features that never touch the outline, so `measure_reference.py` and
`silhouette_qa.py` are structurally blind to all of them. That is why
`docs/mascot-checkpoint.md` could report weighted IoU 0.878 while section F
still says "no face" — the number was never measuring one.

The artwork does distinguish the features, by colour, so they are measured the
same way the mane/body split was: cluster in HSV, label connected components,
then select by GEOMETRY rather than by assumed position. Position is what we are
trying to learn; using it as a filter would only return the guess.

FRAME
Identical H units to `reference_model.json`, so a number here can be compared
with `HEAD_CAGE_Z = 0.604` directly:

    h   = (ground - y) / height_px        height above ground, 1.0 = subject height
    x_H = (x - centre_col) / height_px    lateral offset from the midline

The scale factor `normalise()` applies in measure_reference.py cancels in both
ratios, so measuring on the raw quadrant is exact and skips a resample.

MEASURED CLUSTERS (front view, 122,867 subject pixels)

    pupil    v < 0.15                      near-black, 2 blobs, 21x22 px
    sclera   s < 0.22  v > 0.84            the white crescent, 2 blobs
    iris     h 20-45  s > 0.55  v 0.30-0.72
    feature  h < 32  s > 0.60  v 0.20-0.48 brows, nose pad, mouth line, mane

The last cluster is shared with the mane — the brows and the mane are painted
the same auburn — so those components are separated by the FACE APERTURE, the
gold region the mane encircles, not by a hue window that cannot tell them apart.

Run:
  python3 tools/cad/measure_face.py

Outputs:
  art/blender/references/turnaround-views/face_model.json
  art/blender/references/turnaround-views/face-features.png   (labelled overlay)
"""

import json
import math
import os
from collections import deque

import numpy as np
from PIL import Image

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
VIEWS = os.path.join(REPO, "art", "blender", "references", "turnaround-views")
OUT_JSON = os.path.join(VIEWS, "face_model.json")
OUT_PNG = os.path.join(VIEWS, "face-features.png")


def components(mask, min_area=40):
    """4-connected labelling. Blender ships numpy but not scipy, and this file
    runs outside Blender anyway; a deque flood fill is 40 lines and has no
    dependency to install."""
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
                yy, xx = y + dy, x + dx
                if (0 <= yy < mask.shape[0] and 0 <= xx < mask.shape[1]
                        and mask[yy, xx] and not seen[yy, xx]):
                    seen[yy, xx] = True
                    q.append((yy, xx))
        if len(pix) >= min_area:
            out.append(np.array(pix))
    return sorted(out, key=len, reverse=True)


class Frame:
    """The H-unit frame of one view."""

    def __init__(self, mask):
        ys, xs = np.nonzero(mask)
        self.top, self.ground = int(ys.min()), int(ys.max())
        self.left, self.right = int(xs.min()), int(xs.max())
        self.height_px = self.ground - self.top
        self.centre_col = (self.left + self.right) / 2.0

        # The MASK bbox midline is not the face's axis. Measured: the two pupils
        # sit at cols 244.6 and 330.6, whose midpoint is 287.6, while the mask
        # bbox gives 282.0 — 5.6 px, or 0.0116 H, off. The mane is wider on one
        # side (the documented 18% front/rear mane disagreement shows up here
        # too), so a bbox centre is the mane's axis, not the head's. `set_axis`
        # replaces it once the face has told us where its own midline is.
        self.axis_col = self.centre_col
        self.axis_from = "mask bbox"

    def set_axis(self, col, source):
        self.axis_col = float(col)
        self.axis_from = source

    def h(self, y):
        return (self.ground - y) / self.height_px

    def x(self, x):
        return (x - self.axis_col) / self.height_px

    def span(self, px):
        return px / self.height_px


# The source image, set once by main(). blob() is reached through pair() and
# midline() as well as directly, so threading the array through every call site
# would add a parameter to three signatures to carry one constant.
_RGB = None


def blob(frame, pix, rgb=None):
    """A component reduced to the numbers a builder needs.

    `rgb` adds the region's MEAN colour. Blender ships numpy but not PIL, so
    the face build cannot sample the artwork itself — and the alternative is a
    palette picked by eye, which is how the proxy ended up with an eye white
    that reads grey against a warm coat. The median is used rather than the
    mean for value, because anti-aliased rims drag a mean toward whatever the
    feature sits on.
    """
    ys, xs = pix[:, 0], pix[:, 1]
    out = {
        "area_px": int(len(pix)),
        "x_H": round(frame.x(float(xs.mean())), 5),
        "h": round(frame.h(float(ys.mean())), 5),
        "half_w_H": round(frame.span((xs.max() - xs.min() + 1) / 2.0), 5),
        "half_h_H": round(frame.span((ys.max() - ys.min() + 1) / 2.0), 5),
        "h_top": round(frame.h(int(ys.min())), 5),
        "h_bot": round(frame.h(int(ys.max())), 5),
        "x_in_H": round(frame.x(int(xs.min())), 5),
        "x_out_H": round(frame.x(int(xs.max())), 5),
    }
    rgb = _RGB if rgb is None else rgb
    if rgb is not None:
        px = rgb[ys, xs].astype(np.float32)
        out["rgb"] = [int(v) for v in np.median(px, axis=0)]
        out["srgb01"] = [round(float(v) / 255.0, 4) for v in np.median(px, axis=0)]
    return out


def pair(frame, comps, dh=0.06, size_tol=0.45):
    """Select the mirrored pair from a component list.

    Deliberately does NOT test position against a midline. The midline is one of
    the things being measured, so using it as a filter would only hand back the
    assumption. A pair qualifies on properties that need no axis: the centroids
    sit within `dh` of each other in height, and the two areas and widths agree
    within `size_tol`. Two features that match in row and size across a figure
    are a left/right pair; a cheek shadow of the right colour has no partner
    and drops out on its own.
    """
    cands = []
    for i in range(len(comps)):
        for j in range(i + 1, len(comps)):
            a, b = blob(frame, comps[i]), blob(frame, comps[j])
            if abs(a["h"] - b["h"]) > dh:
                continue
            if a["x_H"] == b["x_H"]:
                continue
            for lo, hi in ((a["area_px"], b["area_px"]),
                           (a["half_w_H"], b["half_w_H"])):
                if min(lo, hi) <= 0 or abs(lo - hi) / max(lo, hi) > size_tol:
                    break
            else:
                cands.append((a["area_px"] + b["area_px"], a, b))
    if not cands:
        return None
    _, a, b = max(cands, key=lambda t: t[0])
    left, right = (a, b) if a["x_H"] < b["x_H"] else (b, a)
    return {"left": left, "right": right,
            "x_H_abs": round((abs(left["x_H"]) + abs(right["x_H"])) / 2, 5),
            "h": round((left["h"] + right["h"]) / 2, 5),
            "midpoint_x_H": round((left["x_H"] + right["x_H"]) / 2, 5),
            "asymmetry_H": round(abs(abs(left["x_H"]) - abs(right["x_H"])), 5)}


def midline(frame, comps, h_lo, h_hi, max_x=0.05):
    """The largest component whose centroid sits on the midline in a height band.

    The nose pad, mouth line and muzzle patch are all single midline features.
    A band plus a midline test is enough to name them without assuming a row.
    """
    best = None
    for pix in comps:
        b = blob(frame, pix)
        if abs(b["x_H"]) > max_x:
            continue
        if not (h_lo <= b["h"] <= h_hi):
            continue
        if best is None or b["area_px"] > best["area_px"]:
            best = b
    return best


def main():
    rgb = np.asarray(Image.open(os.path.join(VIEWS, "front.png")).convert("RGB"))
    subj = np.asarray(Image.open(os.path.join(VIEWS, "front-mask.png"))) > 127
    hsv = np.asarray(Image.fromarray(rgb).convert("HSV")).astype(np.float32) / 255.0
    hue, sat, val = hsv[..., 0] * 360.0, hsv[..., 1], hsv[..., 2]

    global _RGB
    _RGB = rgb

    frame = Frame(subj)

    # ---- eyes, and the face's own midline -------------------------------
    # Pupils first, because they are the most reliable pair in the image — a
    # near-black blob has nothing else in a gold-and-auburn figure to be
    # confused with — and their midpoint IS the head's axis of symmetry.
    pupils = pair(frame, components(subj & (val < 0.15), 120))
    if pupils is None:
        raise SystemExit("[face] pupil pair not found — thresholds moved")
    frame.set_axis(pupils["midpoint_x_H"] * frame.height_px + frame.axis_col,
                   "pupil-pair midpoint")
    pupils = pair(frame, components(subj & (val < 0.15), 120))

    sclera = pair(frame, components(subj & (sat < 0.22) & (val > 0.84), 120))
    if sclera is None:
        raise SystemExit("[face] sclera pair not found — thresholds moved")

    # The eye ALMOND is the union of sclera, iris and pupil, flood-filled from
    # the pupil over everything that is not face gold. Measuring the sclera
    # alone under-reports it: the white is a crescent, the iris covers most of
    # the opening, and it is the almond the eyelid loops have to enclose.
    eye_stuff = subj & ~((hue >= 28) & (hue <= 50) & (sat > 0.35) & (val > 0.60))
    almonds = []
    for side in ("left", "right"):
        px_seed = pupils[side]
        cx = px_seed["x_H"] * frame.height_px + frame.axis_col
        cy = frame.ground - px_seed["h"] * frame.height_px
        seed = (int(round(cy)), int(round(cx)))
        if not eye_stuff[seed]:
            raise SystemExit(f"[face] {side} eye seed is not in the non-gold mask")
        found = None
        for pix in components(eye_stuff, 120):
            if np.any((pix[:, 0] == seed[0]) & (pix[:, 1] == seed[1])):
                found = pix
                break
        if found is None:
            raise SystemExit(f"[face] {side} eye almond did not flood")
        almonds.append(blob(frame, found))
    eye_almond = {"left": almonds[0] if almonds[0]["x_H"] < almonds[1]["x_H"] else almonds[1],
                  "right": almonds[1] if almonds[0]["x_H"] < almonds[1]["x_H"] else almonds[0]}

    # THE IRIS DISC IS THE AMBER RING PLUS THE PUPIL IT SITS UNDER.
    #
    # This eye is a big-pupil cartoon eye: classifying the almond row by row
    # shows a ~22 px black pupil with only ~4 px of amber on each side of it,
    # and white filling the rest of the opening, up and outboard. So the amber
    # is a RING, and the disc a builder needs is the ring plus its hole — the
    # iris is under the pupil, not beside it.
    #
    # The first version measured "the largest component in the almond that is
    # neither black nor white" and got 0.0456 on one side against 0.0321 on the
    # other. It was picking up the dark lid line and part of the sclera edge on
    # the lit side. Flooding outward from the pupil over amber-or-dark, with the
    # window as the bound, cannot do that.
    amber = ((hue >= 15) & (hue <= 45) & (sat > 0.55)
             & (val >= 0.30) & (val <= 0.80))
    iris = {}
    for side in ("left", "right"):
        b = eye_almond[side]
        x0 = int(round(b["x_in_H"] * frame.height_px + frame.axis_col))
        x1 = int(round(b["x_out_H"] * frame.height_px + frame.axis_col))
        y0 = int(round(frame.ground - b["h_top"] * frame.height_px))
        y1 = int(round(frame.ground - b["h_bot"] * frame.height_px))
        win = np.zeros(subj.shape, bool)
        win[max(y0, 0):y1 + 1, max(x0, 0):x1 + 1] = True
        disc = win & subj & (amber | (val < 0.15))
        pu = pupils[side]
        seed = (int(round(frame.ground - pu["h"] * frame.height_px)),
                int(round(pu["x_H"] * frame.height_px + frame.axis_col)))
        found = None
        for pix in components(disc, 80):
            if np.any((pix[:, 0] == seed[0]) & (pix[:, 1] == seed[1])):
                found = pix
                break
        if found is not None:
            iris[side] = blob(frame, found)
    if len(iris) == 2:
        iris["x_H_abs"] = round((abs(iris["left"]["x_H"])
                                 + abs(iris["right"]["x_H"])) / 2, 5)
        iris["h"] = round((iris["left"]["h"] + iris["right"]["h"]) / 2, 5)
        # The amber ring's own colour, sampled OUTSIDE the pupil — the union's
        # median would come back near-black, since the pupil is most of it.
        for side in ("left", "right"):
            b = eye_almond[side]
            x0 = int(round(b["x_in_H"] * frame.height_px + frame.axis_col))
            x1 = int(round(b["x_out_H"] * frame.height_px + frame.axis_col))
            y0 = int(round(frame.ground - b["h_top"] * frame.height_px))
            y1 = int(round(frame.ground - b["h_bot"] * frame.height_px))
            win = np.zeros(subj.shape, bool)
            win[max(y0, 0):y1 + 1, max(x0, 0):x1 + 1] = True
            ring = np.nonzero(win & amber & (val >= 0.15))
            if len(ring[0]):
                px = rgb[ring].astype(np.float32)
                med = np.median(px, axis=0)
                iris[side]["rgb"] = [int(v) for v in med]
                iris[side]["srgb01"] = [round(float(v) / 255.0, 4) for v in med]

    # ---- face aperture --------------------------------------------------
    # The gold region the mane encircles. Everything facial lives inside it,
    # and it is what separates a brow from the mane it is painted to match.
    gold = subj & (hue >= 28) & (hue <= 52) & (val > 0.55)
    gold_comps = components(gold, 400)
    # The face is the gold component containing the midpoint between the pupils.
    mid = (int(round(frame.ground - pupils["h"] * frame.height_px)),
           int(round(frame.axis_col)))
    aperture = None
    for pix in gold_comps:
        if np.any((pix[:, 0] == mid[0]) & (pix[:, 1] == mid[1])):
            aperture = pix
            break
    if aperture is None:
        aperture = gold_comps[0]
    ap = blob(frame, aperture)
    ap_mask = np.zeros(subj.shape, bool)
    ap_mask[aperture[:, 0], aperture[:, 1]] = True

    # FILL THE HOLES. The aperture is the GOLD region, and every facial feature
    # is a non-gold hole punched in it — so the raw gold mask has a cavity
    # exactly where each feature sits. Testing a feature's centroid against it
    # rejected the nose pad, whose centroid lands in the middle of its own
    # 35 px hole. The face area is the gold region WITH its holes filled.
    outside = ~ap_mask
    reached = np.zeros(subj.shape, bool)
    q = deque()
    for y in range(subj.shape[0]):
        for x in (0, subj.shape[1] - 1):
            if outside[y, x] and not reached[y, x]:
                reached[y, x] = True
                q.append((y, x))
    for x in range(subj.shape[1]):
        for y in (0, subj.shape[0] - 1):
            if outside[y, x] and not reached[y, x]:
                reached[y, x] = True
                q.append((y, x))
    while q:
        y, x = q.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            yy, xx = y + dy, x + dx
            if (0 <= yy < subj.shape[0] and 0 <= xx < subj.shape[1]
                    and outside[yy, xx] and not reached[yy, xx]):
                reached[yy, xx] = True
                q.append((yy, xx))
    ap_filled = ap_mask | (outside & ~reached)

    # Dilate so a feature sitting ON the aperture rim still registers as inside.
    grown = ap_filled.copy()
    for _ in range(6):
        g = grown.copy()
        g[1:, :] |= grown[:-1, :]
        g[:-1, :] |= grown[1:, :]
        g[:, 1:] |= grown[:, :-1]
        g[:, :-1] |= grown[:, 1:]
        grown = g

    def in_face(pix):
        """Is this component's CENTROID inside the aperture?

        The first version ANDed the aperture into the segmentation mask, which
        silently clipped every feature that touches the rim. The nose pad
        reached the aperture edge on one side only, lost those pixels, and
        reported its centroid 0.0258 H off the midline — a fabricated 12 px
        asymmetry on a feature that measures -0.0030 H when left whole. Select
        components by membership; measure them on all their pixels.
        """
        cy = int(round(pix[:, 0].mean()))
        cx = int(round(pix[:, 1].mean()))
        return bool(grown[cy, cx])

    # ---- brows, nose, nostrils, mouth ----------------------------------
    feature = subj & (hue < 34) & (sat > 0.55) & (val > 0.18) & (val < 0.52)
    fcomps = [p for p in components(feature, 90) if in_face(p)]

    brow_comps = [p for p in fcomps if blob(frame, p)["h"] > pupils["h"] + 0.015]
    brows = pair(frame, brow_comps)
    # BROW SLOPE, measured. The first build tilted the brow 14 degrees by eye
    # and picked the sign wrong, which is the difference between a friendly
    # mascot and a cross one. The principal axis of the component gives both
    # magnitude and sign with nothing to guess: positive means the brow rises
    # toward the midline.
    if brows:
        for side in ("left", "right"):
            b = brows[side]
            for pix in brow_comps:
                cand = blob(frame, pix)
                if abs(cand["x_H"] - b["x_H"]) < 1e-9 and abs(cand["h"] - b["h"]) < 1e-9:
                    ys = pix[:, 0].astype(np.float64)
                    xs = pix[:, 1].astype(np.float64)
                    xs -= xs.mean()
                    ys -= ys.mean()
                    cov = np.cov(np.vstack([xs, ys]))
                    vals, vecs = np.linalg.eigh(cov)
                    vx, vy = vecs[:, int(np.argmax(vals))]
                    # Rows grow downward, so negate vy to get a z-up slope.
                    ang = math.degrees(math.atan2(-vy, vx))
                    if ang > 90:
                        ang -= 180
                    elif ang < -90:
                        ang += 180
                    inboard = -1.0 if b["x_H"] > 0 else 1.0
                    b["slope_deg"] = round(ang, 2)
                    b["rise_toward_midline_deg"] = round(ang * inboard, 2)
                    break

    # The nose pad is the largest midline feature BELOW the eyes. Anchored to
    # the pupils rather than to a height band picked by eye, so it survives a
    # reference re-export at a different crop.
    nose = midline(frame, [p for p in fcomps
                           if blob(frame, p)["h"] < pupils["h"] - 0.02],
                   ap["h_bot"], pupils["h"], max_x=0.04)
    if nose is None:
        raise SystemExit("[face] nose pad not found below the eyes")

    dark = [p for p in components(subj & (val < 0.22), 30) if in_face(p)]

    # Nostrils: small dark blobs WITHIN the nose pad's own height span.
    nostrils = pair(frame, [p for p in dark
                            if nose["h_bot"] <= blob(frame, p)["h"] <= nose["h_top"]
                            and blob(frame, p)["area_px"] < 200])

    # The mouth line is the widest dark midline component BELOW the nose pad —
    # anchored to the nose, because on the midline the pad and the mouth run
    # together in value (v 0.24 -> 0.07) and only the pad's measured bottom
    # separates them.
    mouth = midline(frame, [p for p in dark
                            if blob(frame, p)["h"] < nose["h_bot"] + 0.008],
                    ap["h_bot"], nose["h_bot"] + 0.008, max_x=0.05)

    # The pale muzzle patch is CREAM: low saturation, high value. The first
    # filter looked for s 0.35-0.62 / v 0.55-0.78, which is mid-tone GOLD, and
    # returned the chest bib at h 0.411 — a feature 0.14 H below the mouth.
    # Measured down the midline the cream reads s 0.33-0.37, v 0.97-0.98.
    cream = [p for p in components(subj & (sat < 0.45) & (val > 0.90), 200)
             if in_face(p)]
    muzzle = midline(frame, [p for p in cream
                             if blob(frame, p)["h_top"] <= nose["h"]],
                     ap["h_bot"], nose["h"], max_x=0.06)

    model = {
        "frame": {"view": "front", "source": "front.png",
                  "top": frame.top, "ground": frame.ground,
                  "left": frame.left, "right": frame.right,
                  "height_px": frame.height_px,
                  "bbox_centre_col": round(frame.centre_col, 1),
                  "axis_col": round(frame.axis_col, 1),
                  "axis_from": frame.axis_from,
                  "axis_offset_H": round(
                      (frame.axis_col - frame.centre_col) / frame.height_px, 5),
                  "units": "h = height above ground / subject height; "
                           "x_H = lateral offset / subject height"},
        "face_aperture": ap,
        "eye": {"pupil": pupils, "sclera": sclera, "almond": eye_almond,
                "iris": iris or None},
        "brow": brows,
        "nose_pad": nose,
        "nostril": nostrils,
        "mouth_line": mouth,
        "muzzle_patch": muzzle,
    }

    # Derived numbers a builder wants without recomputing them.
    d = {}
    if pupils:
        d["eye_separation_H"] = round(abs(pupils["right"]["x_H"] - pupils["left"]["x_H"]), 5)
        d["eye_h"] = pupils["h"]
    if pupils and nose:
        d["eye_to_nose_H"] = round(pupils["h"] - nose["h"], 5)
    if nose and mouth:
        d["nose_to_mouth_H"] = round(nose["h"] - mouth["h"], 5)
    if brows:
        d["brow_above_eye_H"] = round(brows["h"] - pupils["h"], 5)
    # The pupil is NOT centred in the almond, and that is the expression. It
    # sits inboard and low, which is what makes the look gentle rather than a
    # stare. An eye built with the pupil centred loses the character even with
    # every radius correct.
    for side in ("left", "right"):
        al, pu = eye_almond[side], pupils[side]
        d[f"pupil_offset_{side}"] = {
            "inboard_H": round(abs(al["x_H"]) - abs(pu["x_H"]), 5),
            "below_H": round(al["h"] - pu["h"], 5)}
    d["almond_centre_x_H_abs"] = round(
        (abs(eye_almond["left"]["x_H"]) + abs(eye_almond["right"]["x_H"])) / 2, 5)
    d["almond_centre_h"] = round(
        (eye_almond["left"]["h"] + eye_almond["right"]["h"]) / 2, 5)
    if len(iris) > 2:
        d["iris_r_H"] = round((iris["left"]["half_w_H"]
                               + iris["right"]["half_w_H"]) / 2, 5)
    d["pupil_r_H"] = round((pupils["left"]["half_w_H"]
                            + pupils["right"]["half_w_H"]) / 2, 5)

    a = eye_almond["left"]
    d["eye_almond_w_H"] = round(a["half_w_H"] * 2, 5)
    d["eye_almond_h_H"] = round(a["half_h_H"] * 2, 5)
    d["eye_aspect"] = round(a["half_w_H"] / a["half_h_H"], 4)
    d["face_centre_h"] = round((pupils["h"] + (nose["h"] if nose else pupils["h"])) / 2, 5)
    model["derived"] = d

    with open(OUT_JSON, "w") as fh:
        json.dump(model, fh, indent=2)

    # ---- labelled overlay ----------------------------------------------
    # Every measured feature drawn as its own box. This is the check that
    # catches a mis-selected component, which a printed number cannot: the
    # chest bib and the muzzle patch are both "a cream blob on the midline"
    # and only a box on the picture shows which one was taken.
    over = rgb.copy()

    def box(b, colour, thickness=1):
        x0 = int(round((b["x_in_H"]) * frame.height_px + frame.axis_col))
        x1 = int(round((b["x_out_H"]) * frame.height_px + frame.axis_col))
        y0 = int(round(frame.ground - b["h_top"] * frame.height_px))
        y1 = int(round(frame.ground - b["h_bot"] * frame.height_px))
        x0, x1 = max(x0, 0), min(x1, over.shape[1] - 1)
        y0, y1 = max(y0, 0), min(y1, over.shape[0] - 1)
        for t in range(thickness):
            if y0 + t <= y1:
                over[y0 + t, x0:x1 + 1] = colour
            if y1 - t >= y0:
                over[y1 - t, x0:x1 + 1] = colour
            if x0 + t <= x1:
                over[y0:y1 + 1, x0 + t] = colour
            if x1 - t >= x0:
                over[y0:y1 + 1, x1 - t] = colour

    LIME, MAGENTA, AMBER = (60, 255, 60), (255, 0, 255), (255, 190, 0)
    RED, CYAN, WHITE = (255, 40, 40), (0, 225, 255), (255, 255, 255)
    for side in ("left", "right"):
        box(eye_almond[side], LIME)
        box(pupils[side], MAGENTA)
        box(sclera[side], WHITE)
        if brows:
            box(brows[side], AMBER)
        if nostrils:
            box(nostrils[side], RED)
    box(nose, RED)
    if mouth:
        box(mouth, CYAN)
    if muzzle:
        box(muzzle, (255, 255, 120))
    # The measured axis, so an off-midline number is visible as such.
    axis = int(round(frame.axis_col))
    over[:, axis] = np.where(np.arange(over.shape[0])[:, None] % 8 < 4,
                             np.array([0, 120, 255]), over[:, axis])
    Image.fromarray(over).save(OUT_PNG)

    print("===FACE_MODEL===")
    print(f"FRAME height_px={frame.height_px} ground={frame.ground} "
          f"axis_col={frame.axis_col:.1f} ({frame.axis_from}), "
          f"bbox_centre={frame.centre_col:.1f}")
    print(f"APERTURE x={ap['x_H']:+.4f} h={ap['h']:.4f} "
          f"h {ap['h_bot']:.4f}-{ap['h_top']:.4f} halfw={ap['half_w_H']:.4f}")
    print(f"PUPIL    x=±{pupils['x_H_abs']:.4f} h={pupils['h']:.4f} "
          f"asym={pupils['asymmetry_H']:.4f}")
    print(f"ALMOND   w={d['eye_almond_w_H']:.4f} h={d['eye_almond_h_H']:.4f} "
          f"aspect={d['eye_aspect']:.3f}")
    print(f"SCLERA   x=±{sclera['x_H_abs']:.4f} h={sclera['h']:.4f}")
    if len(iris) > 2:
        print(f"IRIS     x=±{iris['x_H_abs']:.4f} h={iris['h']:.4f} "
              f"r={d['iris_r_H']:.4f}")
    print(f"PUPIL_R  {d['pupil_r_H']:.4f}   almond centre "
          f"x=±{d['almond_centre_x_H_abs']:.4f} h={d['almond_centre_h']:.4f}")
    print(f"PUPIL_OFF inboard {d['pupil_offset_right']['inboard_H']:+.4f}  "
          f"below {d['pupil_offset_right']['below_H']:+.4f}  (right eye)")
    if brows:
        print(f"BROW     x=±{brows['x_H_abs']:.4f} h={brows['h']:.4f} "
              f"above_eye={d['brow_above_eye_H']:+.4f} "
              f"rise_toward_midline="
              f"{brows['right'].get('rise_toward_midline_deg', 0):+.1f}deg "
              f"(L {brows['left'].get('rise_toward_midline_deg', 0):+.1f})")
    else:
        print("BROW     NOT FOUND")
    if nose:
        print(f"NOSE     x={nose['x_H']:+.4f} h={nose['h']:.4f} "
              f"w={nose['half_w_H'] * 2:.4f} h_ext={nose['half_h_H'] * 2:.4f}")
    if nostrils:
        print(f"NOSTRIL  x=±{nostrils['x_H_abs']:.4f} h={nostrils['h']:.4f}")
    else:
        print("NOSTRIL  NOT FOUND")
    if mouth:
        print(f"MOUTH    x={mouth['x_H']:+.4f} h={mouth['h']:.4f} "
              f"w={mouth['half_w_H'] * 2:.4f}")
    if muzzle:
        print(f"MUZZLE   x={muzzle['x_H']:+.4f} h={muzzle['h']:.4f} "
              f"w={muzzle['half_w_H'] * 2:.4f} h {muzzle['h_bot']:.4f}-{muzzle['h_top']:.4f}")
    print(f"EYE_SEP  {d['eye_separation_H']:.4f}")
    print(f"FACE_CENTRE_H {d['face_centre_h']:.4f}  "
          f"(reference_model face_centre_front = 0.604)")
    print("===FACE_MODEL_END===")
    print(f"[face] wrote {OUT_JSON}")
    print(f"[face] wrote {OUT_PNG}")


if __name__ == "__main__":
    main()
