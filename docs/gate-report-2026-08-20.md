# Approval gate — runtime cleanup, hero composition, lion silhouette

Assets: `docs/assets/gate-2026-08-20/`

## A. Production debug artifacts removed

**What they actually were.** Not debug lines or rig helpers. Two separate causes:

1. **A 12m studio floor plane shipping inside the character GLB.** The rig export
   selected the whole scene; the plane had also picked up an armature modifier
   during parent-with-automatic-weights, so it survived a later "skinned meshes
   only" filter. At runtime it scaled up with the lion and put the entire island
   inside its shadow — the grey slab.
2. **`Sit` and `Sleep` collapsing the mesh.** Both fold the hips past 55°, and
   under Blender automatic weights the barrel folds into a lump with the tail
   protruding — the grey wedge crossing the island.

**Fixes.** Studio geometry is now deleted before rigging, and
`assert_production_clean()` runs on the *actual export selection*: it rejects any
object that is not an allowed `Lion_*` mesh, whose name contains a development
token (`floor`, `helper`, `debug`, `temp`, `marker`, …), or that exceeds a 3m
character budget. It refuses the export rather than warning.

`Sit` and `Sleep` are out of the autonomous rotation. They remain authored and
reachable from `/world3d`, and return to production after GATE 6–7.

## B. Hero composition

Lion raised 1.10m → 1.30m and the camera dollied along its **authored view axis**
(angle and lens preserved, distance only): 0.53 desktop / 0.48 tablet / 0.44
phone, keyed off `min(width, height × 1.25)` so tall portrait viewports do not
get the closest setting. `MARK_LionSpawn` moved 0.42m back so the card row clears
the character. Screens: `composition-{desktop-wide,laptop,tablet-landscape,tablet-portrait}.png`.

Player cards are **not** anchored to a 3D marker. Anchoring them to
`MARK_CardShelfZone` put them mid-island over the chest and paws; they now sit at
the bottom of the viewport as in the reference. The speech bubble and title *are*
projected from `MARK_SpeechAnchor` and `MARK_TitleZoneHero` every frame.

## C/D/E. Lion vs approved turnaround

`lion-turnaround-vs-approved.png` — approved left, current right, same four views.

Proportions were re-derived by **measuring** the approved sheet rather than by
recall, and now live in one shared module (`tools/blender/lion_contract.py`)
imported by every stage. They had been copied into three scripts and had drifted:
after the belly moved 0.41 → 0.21, `detail_lion.py` was still probing for a head
at z = 0.80.

| | approved | before | now |
|---|---|---|---|
| legs (share of height) | 0.19 H | 0.36 H | 0.19 H |
| mane crown | 1.00 H | 1.00 H | 1.00 H |
| mane width | 0.68 H | 0.61 H | 0.67 H |
| head width | 0.42 H | 0.35 H | 0.41 H |
| body length | 0.57 H | 0.49 H | 0.55 H |

Also fixed: the mane is now a **hood with an opening sized to the face** (three
attempts — a large mass near the head simply merges over the face in the voxel
remesh); ears reduced from lobes that split the auburn frame to small tabs; mane
colour is now the union of a hood region and a chest-ruff region, so the ruff is
auburn and the mid-back stays gold; tail arcs back with a real tuft instead of
standing as a vertical spike.

## F. Is the mesh ready for retopology?

**No.** It is materially closer and the pipeline is sound, but these are visible
in the comparison and would be baked in:

1. **Mane macro shape** is a scalloped ball, not the reference teardrop with a
   forward quiff and layered clumps. Additive spheres plus voxel remesh have
   reached their ceiling here — this needs actual sculpting.
2. **Side view reads long and low.** The mane sits *on* a horizontal barrel; the
   reference chest rises into the mane.
3. **No cream chest V.**
4. **Rump has no haunch definition** — a smooth dome in rear view.
5. **Muzzle projects slightly too far** in profile.
6. **Ears do not read from side view.**

Recommended next step before GATE 4: one sculpt pass on the mane and chest in
Blender's sculpt mode over the current blockout, rather than further sphere
placement.

## Verified on localhost

- homepage QA 121/121 (5 worlds × 3 viewports, incl. the 3D world)
- route QA 41/41
- environment GLB validator 22/22
- lion GLB: 2 meshes, 2 materials, 41 joints, 10 clips, largest part 1.57m, 2.01MB
- no-WebGL fallback renders the painted world *with* the mascot

## Not done / blocked

- GATE 4 onward (retopology, UVs, skeleton, skinning, IK, morph targets, visemes)
- World look development (GATE 18–19)
- Production deploy: `git push` still blocked by the permission classifier
