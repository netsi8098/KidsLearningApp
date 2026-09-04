---
name: world-asset
description: Change the 3D home world (island, trees, grass, flowers, water, sky, clouds, bridge) in art/blender/home_environment.blend. Use when editing tools/blender/build_home_environment.py, adding or resizing scenery, fixing the scale relationship between the character and the world, or when a change needs to be measured and looked at rather than guessed. Covers the build order, the scale gate, and the traps this pipeline has already fallen into.
---

# Changing the 3D home world

The world is **built by script**, not hand-modelled. `art/blender/home_environment.blend`
is an output; editing it in the GUI produces a change nobody can reproduce and
the next `--rebuild` deletes it. The source of truth is
`tools/blender/build_home_environment.py`.

## The loop

```bash
npm run world:review -- --rebuild --sheet
```

17 seconds. Do this after every change and **look at the renders**. Drop
`--rebuild` to re-measure the existing blend without rebuilding.

## Pipeline order

```
build_home_environment.py  ->  home_environment.blend  ->  export_home_environment.py
                                        |                            |
                                        |                            v
                                        |                   public/assets/worlds/
                                        |                     river-garden/*.glb
                                        v
             validate / dump_world / world_audit / world_render
```

The runtime reads the **GLB**, so a change that is not exported has not
shipped. `world:review --rebuild` does both.

## The scale gate is the point

`tools/cad/world_audit.py` fails the run when a category's height falls outside
its documented target **relative to the lion's 1.30 m**. That number is not
negotiable — `HomeWorld3D` scales the character to it — so it is the world's
unit of measure.

Landmarks (trees, bushes, reeds) are judged on their **tallest** member;
scatter (grass, flowers, pebbles) on its **median**. Those are different
questions and conflating them is how a field of 114 flowers passed on one
outlier being barely in range.

Every target carries its reason in the source. **Argue with the reason, not the
number.** If a target is wrong, change it in `TARGETS` and say why in the same
commit.

## Judge it with the character in the frame

`world_render.py` puts a featureless grey box at the lion's true 1.30 m on
`MARK_LionSpawn` and shoots the production camera twice — with and without it.
Scale is a relationship; a render of an empty landscape cannot show one. The
question "can the lion walk under that tree" went unanswered long enough to
ship a 1.82 m tree, and one look at `01-home-main-scale.png` answers it.

`04-eye-level.png` shoots from the character's eye line, which is the only
angle that shows whether the world reads from where the lion is rather than
from where the camera happens to sit.

## Traps this pipeline has already fallen into

* **The markers are a contract.** `MARK_LionSpawn`, `MARK_WalkLeft/Right`,
  `MARK_CardShelfZone*`, `MARK_TitleZone*`, `MARK_SpeechAnchor`,
  `MARK_CameraTarget` are read **by name** by `HomeWorld3D`. Renaming or
  removing one breaks the runtime silently.
  `validate_home_environment.py` is the gate; it runs in `world:review`.
* **The DOM zone markers are not gaze targets.** `MARK_TitleZone` sits below
  the island top and `MARK_CardShelfZone` above the *water*; the hero pair are
  screen-composition anchors, one of them 2.12 m up in the air. Their heights
  describe where React puts a card row, not where anything is. `LionBrain.canLook`
  prunes them geometrically — do not "fix" them to be lookable.
* **The environment is currently STATIC.** Nothing in the runtime touches an
  environment object after load. If a change is meant to make something move,
  the geometry change is half the work and the other half is in the runtime.
* **`island_surface_z(x, y)` is the ground.** Anything that stands on the
  island must be placed with it, not at a constant z, or it floats or sinks.

## Adding a category

1. Build it in its own `build_*` function, linked into the right collection
   (`ENV_Ground`, `ENV_Water`, `ENV_Foliage`, `ENV_Props`, `ENV_Sky`).
2. Name it `ENV_<Thing>_<n>` — the audit and the runtime both match on names.
3. Add a row to `TARGETS` in `world_audit.py` with its target range, whether it
   is judged on max or median, and **why**.
4. Run the loop. Look at the sheet.
