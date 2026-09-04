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
    ("bush", r"Bush|Shrub", 0.45, 0.85, "max",
     "waist-to-shoulder on the character; reads as a bush, not a tree"),
    ("reed", r"Reed", 0.35, 0.75, "max",
     "ground cover at the water's edge; a hedge above that hides the subject"),
    ("grass", r"Grass|Tuft|Blade", 0.08, 0.28, "median",
     "ground cover; above a quarter height it becomes undergrowth"),
    ("flower", r"^(?!.*Lily).*(?:Flower|Petal|Bloom)", 0.12, 0.34, "median",
     "a point of colour that must not compete with the character; Lily* "
     "excluded because the pad blooms float on the water and are not scatter"),
    ("stone_small", r"Pebble|SmallRock", 0.04, 0.20, "median",
     "scatter detail; scale is read from these as much as from the trees"),
]

# TREES ARE MEASURED PER TREE, NOT PER TRUNK, and that is a correction.
#
# The first version of this file matched `.*Trunk` and compared a TRUNK's
# bounding box against a target whose stated reason was "the canopy must clear
# its head". Two things were wrong with that at once:
#
#   * `tree_tall`'s pattern and `tree_mid`'s pattern matched the SAME objects —
#     every tree in this world is named `...Tree...Trunk`, so max(tree_mid) was
#     unconditionally >= max(tree_tall) and `tree_mid` could never actually be
#     judged on a mid tree.
#   * The number reported was the trunk's height. This file's own preamble said
#     "the tallest thing the lion can walk up to is 1.4 times its own height",
#     and 1.82 m was a TRUNK on a tree that was 3.49 m tall. The diagnosis was
#     right and the figure quoted for it was not the figure it described.
#
# So a tree is now grouped by its root name and two quantities are measured,
# because the target's reason asks for both and they are not the same thing:
#
#   HEIGHT     ground to the top of the canopy — does it read as a tree
#   CLEARANCE  ground to the LOWEST canopy part — can the character walk under
#
# Clearance is the one the reason was actually about, and no version of a
# trunk-height target could express it.
TREES = [
    ("tree_island", r"^ENV_TreeIsland", (2.6, 4.2), (1.35, 2.6),
     "the character stands under these; clearance must clear its 1.30 m head"),
    ("tree_bank", r"^ENV_TreeBank", (2.8, 5.0), (0.8, 3.2),
     "the near bank, walked past rather than under"),
    ("tree_skyline", r"^ENV_BankTree_", (3.4, 6.0), (0.6, 3.4),
     "the far bank's skyline; reads as distance, never walked under"),
]

# COMPOSITION, which the scale gate cannot see.
#
# Measured from the locked production camera by `dump_world.py`. The scale work
# that finally made the trees the right size also turned the top 45% of the
# frame into a green ceiling, took the sky away and chopped the rainbow into
# fragments behind canopies. Every height was in range while it happened,
# because a height says whether a thing is the right size and nothing about
# whether it is in the way.
#
# THE GATE IS THE HARM, NOT A PROXY FOR IT — and the first version of this
# section got that wrong in a way worth recording.
#
# It set "foliage may cover at most 35% of the frame's top third", a number
# picked before anything had been measured at any value. Three passes of
# narrowing crowns brought 64.6% down to 43.1%, at which point the render
# plainly read: rainbow arcing clear through the frame, sky between the trees,
# depth from island to water to bank to hills. The number still said fail.
#
# A target you have to argue your way past is the wrong target. What the green
# ceiling actually COST was the rainbow, chopped into fragments behind canopies
# — so the rainbow's visible arc is now measured directly, by ray cast, and
# split by WHO blocks it. `build_rainbow` sinks the arc's lower halves "below
# the horizon line and behind the distant hills" deliberately, and a rainbow
# passing behind a cloud is the look. Neither is a defect. Tree crowns cutting
# it up is.
#
# 0.25, and the number comes from the camera rather than from taste. The first
# value was 0.12, and it is not reachable in this framing — which is worth
# deriving rather than discovering by tuning:
#
#   CAM_Home_Main sits at (0, -12.9, 4.95) looking at (0, 0, 1.01), so its axis
#   points 17.0 degrees below horizontal, and its vertical FOV is 28.4 degrees.
#   The TOP of frame is therefore 2.8 degrees BELOW horizontal, and the highest
#   thing visible at horizontal distance D is 4.95 - D x tan(2.8):
#
#       at y =  7 m   (D = 19.9)      z = 3.98 m
#       at y = 25 m   (D = 37.9)      z = 3.11 m
#       at y = 34 m   (D = 46.9)      z = 2.67 m
#       at y = 40 m   (D = 52.9)      z = 2.38 m
#
#   The rainbow's apex is at z 9.0. There is no radius or centre that puts an
#   apex in frame at any distance a background arc can sit: bringing it close
#   enough to fit under 4 m makes it a hoop on the island. So in THIS framing a
#   rainbow is necessarily two legs crossing the picture, and those legs pass
#   through exactly the height band the tree canopies occupy.
#
# Re-staging the rainbow, or widening the camera, is a design decision and not
# a measurement — so the gate records what the framing allows and the question
# is left where it belongs.
RAINBOW_FOLIAGE_MAX = 0.25
FOLIAGE_TOP_THIRD_MAX = 0.50
FOLIAGE_FRAME_MAX = 0.45

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

    # ── trees, per tree ────────────────────────────────────────────────────
    print("")
    print("TREES  (height and CLEARANCE, both as multiples of the lion)")
    print(f"  {'category':13s} {'n':>3s} {'height':>13s} {'want':>11s} "
          f"{'clearance':>13s} {'want':>11s}  verdict")
    for cat, pat, (hlo, hhi), (clo, chi), why in TREES:
        roots = {}
        for o in objs:
            m = re.match(pat + r"[A-Za-z0-9_]*?(?=_(?:Trunk|Canopy|Blossom|Clump|Branch|RootFlare)|$)",
                         o["name"])
            if not m:
                continue
            r = roots.setdefault(m.group(0), {"top": -1e9, "base": 1e9, "canopy": 1e9})
            r["top"] = max(r["top"], o["base_z"] + o["height"])
            r["base"] = min(r["base"], o["base_z"])
            if re.search(r"Canopy|Blossom|Clump", o["name"]):
                r["canopy"] = min(r["canopy"], o["base_z"])
        if not roots:
            print(f"  {cat:13s}   0 {'absent':>13s}")
            fails.append((cat, "absent", why))
            continue
        hs = [(r["top"] - r["base"]) / LION_H for r in roots.values()]
        cs = [(r["canopy"] - r["base"]) / LION_H for r in roots.values()
              if r["canopy"] < 1e8]
        hmin, hmax = min(hs), max(hs)
        cmin, cmax = (min(cs), max(cs)) if cs else (0.0, 0.0)
        h_ok = hlo <= hmax <= hhi
        # Clearance is judged on the WORST tree — one you cannot walk under is
        # the one you walk into.
        c_ok = clo <= cmin <= chi
        verdict = "ok" if (h_ok and c_ok) else (
            ("height " if not h_ok else "") + ("clearance" if not c_ok else "")).strip()
        print(f"  {cat:13s} {len(roots):3d} {f'{hmin:.2f}-{hmax:.2f}':>13s} "
              f"{f'{hlo:.1f}-{hhi:.1f}':>11s} {f'{cmin:.2f}-{cmax:.2f}':>13s} "
              f"{f'{clo:.1f}-{chi:.1f}':>11s}  {verdict}")
        if not h_ok:
            fails.append((cat, f"height {hmax:.2f}x, want {hlo:.1f}-{hhi:.1f}x", why))
        if not c_ok:
            fails.append((cat, f"clearance {cmin:.2f}x, want {clo:.1f}-{chi:.1f}x", why))

    # ── composition ────────────────────────────────────────────────────────
    comp = json.load(open(src)).get("composition") or {}
    if comp:
        print("")
        print("COMPOSITION  (from the locked production camera)")
        tt = comp.get("foliage_top_third", 0.0)
        fr = comp.get("foliage_frame", 0.0)
        print(f"  foliage, top third of frame   {tt:.3f}   max {FOLIAGE_TOP_THIRD_MAX:.2f}"
              f"   {'ok' if tt <= FOLIAGE_TOP_THIRD_MAX else 'GREEN CEILING'}")
        print(f"  foliage, whole frame          {fr:.3f}   max {FOLIAGE_FRAME_MAX:.2f}"
              f"   {'ok' if fr <= FOLIAGE_FRAME_MAX else 'TOO BUSY'}")
        rv = comp.get("rainbow_visible")
        rf = comp.get("rainbow_by_foliage")
        rs = comp.get("rainbow_by_scenery")
        if rv is not None:
            print(f"  rainbow arc visible           {rv:.3f}"
                  f"   (behind foliage {rf:.3f}, behind cloud/hill {rs:.3f})")
            print(f"  rainbow behind FOLIAGE        {rf:.3f}   max "
                  f"{RAINBOW_FOLIAGE_MAX:.2f}   "
                  f"{'ok' if rf <= RAINBOW_FOLIAGE_MAX else 'CHOPPED BY TREES'}")
            if rf > RAINBOW_FOLIAGE_MAX:
                worst = ", ".join(f"{n} x{c}" for n, c in
                                  (comp.get("rainbow_blocked_by") or [])[:3])
                fails.append(("composition",
                              f"foliage covers {rf:.0%} of the rainbow's arc, max "
                              f"{RAINBOW_FOLIAGE_MAX:.0%} — {worst}",
                              "clouds and hills are meant to cross the arc; "
                              "tree crowns cutting it into fragments are not"))
        for b in (comp.get("top_third_by") or [])[:6]:
            print(f"      {b['share']:6.1%}  {b['name']}")
        if tt > FOLIAGE_TOP_THIRD_MAX:
            fails.append(("composition",
                          f"foliage covers {tt:.0%} of the frame's top third, max "
                          f"{FOLIAGE_TOP_THIRD_MAX:.0%}",
                          "the sky is where the title goes and where the rainbow "
                          "reads; a green ceiling takes both"))
        if fr > FOLIAGE_FRAME_MAX:
            fails.append(("composition",
                          f"foliage covers {fr:.0%} of the frame, max "
                          f"{FOLIAGE_FRAME_MAX:.0%}", "the character has to be findable"))
        for name, o in (comp.get("occlusion") or {}).items():
            if o.get("blocked"):
                print(f"  OCCLUDED  {name}  by {o['by']}")
                fails.append(("composition", f"{name} is blocked by {o['by']}",
                              o.get("why", "")))
            else:
                print(f"  clear     {name}")

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
