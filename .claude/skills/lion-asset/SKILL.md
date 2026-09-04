---
name: lion-asset
description: Change the production cage lion mascot — its geometry, rig, clips, morphs, materials or the runtime that drives it. Use when editing tools/blender/cage_lion.py, mane_foundation.py, face_lion.py, lion_skeleton.py, rig_cage_lion.py, anim_cage_lion.py or assemble_lion.py, or when a change to the lion needs measuring against the approved turnaround. Covers the build order, the gates, and the measurement errors this asset has already paid for.
---

# Changing the cage lion

Everything is **built by script**. `art/blender/*.blend` and
`public/assets/lion/cage/lion.glb` are outputs. Hand-editing a blend produces a
change nobody can reproduce and the next rebuild deletes it.

## The loop

```bash
npm run lion:review -- --rebuild --sheet
```

60 seconds for the whole chain plus every gate and 18 review renders. Do this
after every change and **look at the sheet**.

## Pipeline order — not obvious, not forgiving

```
cage_lion  ->  rig_cage_lion  ->  anim_cage_lion  ->  assemble_lion
     \                                                     ^
      `--> mane_foundation (imports lion_cage.blend) ------'
```

`mane_foundation` reads the **cage** and `assemble` reads both the animated rig
and the mane, so a cage change invalidates everything downstream. Skipping a
stage once left the assembled GLB carrying an old cage while the measurements
described a model that no longer existed.

`assemble_lion` subdivides L2 **before** the face parts (they are placed by
ray-casting the skin, and Catmull-Clark pulls the surface inward) and **before**
the morphs (glTF has no subdivision, and Blender cannot both apply modifiers and
export shape keys).

## The gates, all of which run in `lion:review`

| gate | what it catches |
|---|---|
| cage integrity | slivers, non-manifold edges, boundary edges, quad ratio |
| deformation battery | pinched and flipped faces, worst area ratio, across 12 poses |
| rig report | reach headroom, planted-paw extreme |
| clip IK report | per-clip worst residual and worst paw **below the floor** |
| silhouette IoU | weighted front .35 / side .30 / 3-quarter .25 / rear .10 |
| both GLB contracts | bone, clip, morph, mesh and byte-count budgets |

A clip whose IK residual is non-zero has a leg that is not where the clip says
it is. Both are silent in a render and obvious in the report.

## Measurement errors this asset has already paid for

Read these before trusting a number.

* **Comparing an extremum against a point sample.** A per-band MAX against a
  band-CENTRE fabricated an "ears too high" diagnosis; two corrections were
  built and reverted before the metric turned out to be the fault. It also hid
  a real mane fix. If a number surprises you, check what it is a statistic OF.
* **Judging an unlit render.** An isolated mane render lit from 40 degrees
  azimuth left its front in shadow, and several passes argued about a surface
  nobody could see. `review_render.py` now lights every sheet from the camera
  side.
* **Measuring a POSED model.** `lion_assembled.blend` is saved with the Idle
  action on frame 91. `silhouette_render.py` did not clear it, so every IoU in
  the project's history was of a lion caught mid-idle. It now forces REST — as
  `review_render.py` and `face_lion.py` already did, for the same reason.
* **The rear view is FINISHED.** An orthographic front silhouette and rear
  silhouette of one object are mirror images; the reference's differ by 19% of
  area, so the reference turnaround's views are not consistent projections of
  one form. `REAR_CEILING` is printed every run — the model sits above it.
  Chasing the rear view can only cost the front view.
* **`str.replace()` without an `assert`.** Two changes were reported as landed
  and were never in the file; typecheck passed because nothing referenced the
  missing name. Every scripted edit to these files asserts its match count.

## Runtime side

`src/components/homepage/world3d/lionBrain.ts` decides behaviour;
`HomeWorld3D.tsx` drives bones. Two rules that cost real debugging:

* **Unkeyed bones are written BEFORE `mixer.update`; keyed bones are composed
  onto its result AFTER.** `eye_L/R` are keyed by no clip. `neck_01`, `head`
  and the mane bones are keyed by Idle and Walk, so a write before the mixer is
  simply overwritten — compose with `quaternion.multiply` instead.
* **A bone whose rest transform is not identity must be driven relative to it.**
  The eye bones sit at -42.6 degrees about local X; lerping toward an absolute
  pitch erased that and swung both eyes 42.6 degrees on frame one.
  `rest * delta`, with rest captured at resolve time.
* **The HUD's `aim err`** is the only gaze figure measured off a bone's world
  matrix rather than computed from the request. It is what found four separate
  bugs the request-side numbers all agreed on.
