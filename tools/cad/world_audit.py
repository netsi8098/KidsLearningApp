"""
world_audit.py — is the world the right SIZE, and is any of it ALIVE?

WHY THIS EXISTS

The lion has a silhouette QA, a deformation battery, an IK gate and a review
sheet. The world it stands in had none of that, and it shows: the first honest
look at the two of them together produced "the relative size between the lion,
the trees and the flowers doesn't look good", which is exactly the kind of
judgement that should have been a number long before it was an opinion.

Measured on the shipped environment, against the lion's 1.30 m:

    trees      0.11 - 1.82 m     0.08 - 1.40 x lion
    reeds      1.31 - 2.10 m     1.00 - 1.62 x lion
    grass      0.20 - 1.03 m     0.15 - 0.79 x lion
    flowers    0.08 - 0.18 m     0.06 - 0.14 x lion

The hierarchy is not merely off, it is INVERTED. The reeds are taller than the
tallest tree relative to what a reed should be, the grass reaches the lion's
shoulder, and the tallest thing the lion can walk up to is 1.4 times its own
height. Nothing in the frame establishes scale, which is why the lion reads as
a toy in a diorama rather than a character in a place.

WHERE THE TARGETS COME FROM, and where they do not

They are NOT measured off the approved reference art, and saying so matters.
`lion-sky-river-closeup.webp` and `lion-treehouse-closeup.webp` are close-ups —
the lion fills the frame and the world behind it is bokeh. There is no image in
this repo that shows a tree and the lion at a known scale together, so a number
claiming to be measured off one would be invented with a citation attached.

Instead each target below is a RELATIONSHIP with a stated reason, and the reason
is the thing to argue with:

  * A tree the character can stand under needs its canopy clear of the
    character's head by a comfortable margin, and its trunk readable as a
    trunk. That puts a mid tree at 3-5 x character height. At 1.4 x, the lion
    cannot walk under its own scenery.
  * Ground cover reads as ground cover below roughly a quarter of character
    height. Above that it reads as undergrowth the character should be pushing
    through, and the walk cycle does not.
  * A flower is a point of colour, not a bush: an eighth to a third of
    character height keeps it visible from the production camera without
    competing with the character.
  * Reeds are ground cover at the water's edge. Taller than the character they
    become a hedge, and they hide the thing the camera is pointed at.

Run:
  python3 tools/cad/world_audit.py <objects.json>

The JSON is written by `tools/blender/dump_world.py`, so this file stays free of
`bpy` and runs in the same python as every other tool in `tools/cad`.
"""
import json
import os
import re
import sys

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# The one number everything else is relative to. `HomeWorld3D` scales the lion
# to this at runtime, so it is the world's unit of measure whether the world
# acknowledges it or not.
LION_H = 1.30

# category -> (name pattern, min x lion, max x lion, how to judge, why)
#
# HOW TO JUDGE IS PART OF THE TARGET, and getting it wrong is the mistake this
# project has made more than any other. A landmark's read comes from its
# BIGGEST member: one 1.8 m tree among two hundred 0.1 m blossom balls is what
# the eye measures the character against, and a mean over the blossoms hides it
# entirely. A scatter's read comes from its TYPICAL member: 114 flowers whose
# tallest is barely in range and whose median is half that is a field of specks
# that passes on its extremum.
#
# The first version of this file judged everything on the max, and flowers came
# back "ok" at a median of 0.06 x. That is the same extremum-versus-sample
# error that cost two reverted ear fixes on the lion, reintroduced in the tool
# built to prevent it.
TARGETS = [
    ("tree_tall", r"(?:BankTree|FarTree).*Trunk|TreeTall", 4.0, 7.0, "max",
     "the far bank's skyline; reads as distance, never walked under"),
    ("tree_mid", r"(?:IslandTree|Tree)(?!.*Blossom).*Trunk", 3.0, 5.0, "max",
     "the character stands under it, so the canopy must clear its head"),
    ("bush", r"Bush|Shrub", 0.45, 0.85, "max",
     "waist-to-shoulder on the character; reads as a bush, not a tree"),
    ("reed", r"Reed", 0.35, 0.75, "max",
     "ground cover at the water's edge; a hedge above that hides the subject"),
    ("grass", r"Grass|Tuft|Blade", 0.08, 0.28, "median",
     "ground cover; above a quarter height it becomes undergrowth"),
    ("flower", r"Flower|Petal|Bloom", 0.12, 0.34, "median",
     "a point of colour that must not compete with the character"),
    ("stone_small", r"Pebble|SmallRock", 0.04, 0.20, "median",
     "scatter detail; scale is read from these as much as from the trees"),
]

# Runtime liveliness. Every one of these is a thing the eye expects to move in a
# world with a river in it, and the shipped scene animates NONE of them: the
# environment GLB is loaded once and never touched by a frame callback again.
LIFE = [
    ("water surface", r"Water|River|Shallows"),
    ("waterfall", r"Fall"),
    ("foam / ripple", r"Ripple|Foam"),
    ("bubbles", r"Bubble"),
    ("clouds", r"Cloud"),
    ("grass / reeds", r"Grass|Tuft|Reed"),
    ("blossom / petals", r"Blossom|Petal"),
    ("lily pads", r"Lily"),
]


def median(xs):
    xs = sorted(xs)
    n = len(xs)
    return xs[n // 2] if n % 2 else (xs[n // 2 - 1] + xs[n // 2]) / 2.0


def main():
    src = sys.argv[1] if len(sys.argv) > 1 else os.path.join(
        REPO, "art", "blender", "world_objects.json")
    if not os.path.exists(src):
        sys.exit(f"[world] {src} missing — run tools/blender/dump_world.py first")
    objs = json.load(open(src))["objects"]

    print("===WORLD_AUDIT===")
    print(f"LION_H={LION_H:.2f}  OBJECTS={len(objs)}")
    print("")
    print("SCALE HIERARCHY  (heights as a multiple of the lion)")
    print(f"  {'category':12s} {'n':>4s} {'range':>13s} {'median':>7s} "
          f"{'judged':>7s} {'target':>13s}  verdict")

    fails = []
    for cat, pat, lo, hi, how, why in TARGETS:
        hits = [o for o in objs if re.search(pat, o["name"], re.I)]
        if not hits:
            print(f"  {cat:12s}    0 {'absent':>13s} {'':>7s} {how:>7s} "
                  f"{f'{lo:.2f}-{hi:.2f}':>13s}  MISSING")
            fails.append((cat, "absent", why))
            continue
        r = [o["height"] / LION_H for o in hits]
        rmin, rmax, rmed = min(r), max(r), median(r)
        got = rmax if how == "max" else rmed
        ok = lo <= got <= hi
        verdict = "ok" if ok else ("TOO SMALL" if got < lo else "TOO BIG")
        print(f"  {cat:12s} {len(hits):4d} {f'{rmin:.2f}-{rmax:.2f}':>13s} "
              f"{rmed:7.2f} {how:>7s} {f'{lo:.2f}-{hi:.2f}':>13s}  {verdict}")
        if not ok:
            fails.append((cat, f"{how} {got:.2f}x, want {lo:.2f}-{hi:.2f}x", why))

    print("")
    print("LIFE  (does anything move? the runtime animates the environment not at all)")
    for label, pat in LIFE:
        hits = [o for o in objs if re.search(pat, o["name"], re.I)]
        print(f"  {label:18s} {len(hits):4d} objects   {'static' if hits else 'absent'}")

    print("")
    if fails:
        print(f"SCALE_FAILS={len(fails)}")
        for cat, what, why in fails:
            print(f"  {cat}: {what}")
            print(f"      why the target is what it is: {why}")
    else:
        print("SCALE_FAILS=0")
    print("===WORLD_AUDIT_END===")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
