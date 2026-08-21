# Asset roles — technical donor vs production mascot

Two lions exist on purpose. Confusing them is the main risk in this phase.

## TECHNICAL DONOR — `art/blender/lion_anim_cage.blend`

Tag `lion_current_backup`. Runtime asset
`public/assets/lion/cage/lion_cage_anim.glb`.

**Its job is to preserve solved systems, not to look right.** Frozen and not to
be discarded until the production mascot has inherited all of it:

| Solved system | Where |
|---|---|
| skeleton hierarchy, bone naming, rest-pose strategy | `tools/blender/lion_skeleton.py` |
| authored ring→bone skin map | same file |
| four-leg IK, pole controls, hinge limits | `tools/blender/rig_cage_lion.py` |
| planted-foot harness, reach headroom | same file |
| walk phase model, stride, duty factor | `tools/blender/anim_cage_lion.py` |
| deformation battery + metrics | `tools/blender/deform_qa_lion.py` |
| AnimationMixer architecture, state names, controller | `src/components/homepage/world3d/` |
| GLB export rules, validators, runtime loading, QA | `scripts/`, `tools/blender/` |

Measured baseline the production mascot must not regress, and where the mascot
now stands against it (2026-08-21):

| Metric | Donor baseline | Mascot | |
| --- | --- | --- | --- |
| Battery FAIL | 0 | **0** | held |
| Battery PASS / WARN | 5 / 7 | **6 / 6** | improved |
| Pinched faces | 0 | 4 | regressed |
| Worst area ratio | 0.267 | 0.165 | regressed |
| Flipped faces | 24 | **16** | improved |
| Slivers | 2 | **0** | improved |
| Planted paw, animation amplitude | 0.052 mm | 0.105 mm | regressed |
| Walk support slide, worst | 0.46 mm | **0.166 mm** | improved |
| Walk vertical paw movement | 0.15 mm | 0.32 mm | regressed |
| IK residual, all four paws | 0.00 mm | **0.00 mm** | held |
| Feet planted every frame | 3 | **3** | held |
| Reach headroom front / rear | 20.0 / 40.9 mm | **22.1 / 42.1 mm** | improved |

Read honestly: the mascot beats the donor on locomotion accuracy, rig headroom and
mesh cleanliness, and trails it on deformation *degree* at extreme poses. Nothing
fails. The remaining pinch count and the REVIEW verdict from `rig_overlay_check`
both trace to one documented cause — the 12% rear-limb trim taken to stop a
midline collision.

**THE CONTRACT IS DELIBERATELY NO LONGER SHARED.** Reference measurement put the
face centre at h 0.604 and the spine below `SPINE_Z`. Those constants remain
correct for the DONOR, which reads them, so `cage_lion.py` carries a local
`HEAD_CAGE_Z = 0.604` and `lion_skeleton.py` writes spine positions literally.
Editing `lion_contract.py` to "fix" this would silently reshape the fallback.
Revisit only at donor retirement, and see the handoff for the proposed
`*_DONOR` / `*_MASCOT` split.

## PRODUCTION MASCOT — reference-driven

**Its job is identity.** Correct silhouette, approved anatomy, sculpted forms,
final mane, face, paws, chest, haunch, surface.

Success gate, unchanged: in flat clay with no texture and neutral lighting it must
already read as the approved mascot from front, side, rear and three-quarter.

## CadQuery is now a measurement jig

Its useful purpose is complete. It stays for measured cross-sections,
width/height and length relationships, reference-plane alignment, silhouette QA
and repeatable measurement. **No further investment** — no CAD detail, no face
topology, no mane, no joint loops, no skinning, no morphs. Those are Blender's
job. It is not a project dependency and must never reach the web bundle.

## Approach recommendation

The brief's step 7 assumes the sculpt and the animation surface are separate
meshes, with a retopology pass between them. There is a cheaper route that
satisfies every constraint, and it is worth stating before the work starts.

The donor's cage is **already** an authored cross-section surface: 959 quads,
watertight, no pole in a bending joint, 0 pinched faces across twelve extreme
poses. What is wrong with it is not its topology — it is the **dimensions** of
its rings, which came from a typed proportion contract rather than from the
approved turnaround.

So: drive the same ring stations from the **measured** reference profiles, and add
the secondary forms as additional stations and named displacements inside the same
topology. That gives identity without touching the thing that already works, and
because the ring NAMES are unchanged the authored skin map, the joint contract and
the walk transfer by construction rather than by retargeting.

If identity cannot be reached inside that topology, the fallback is exactly the
brief's route: sculpt freely, then retopologise against it. That will be reported
honestly rather than assumed.
