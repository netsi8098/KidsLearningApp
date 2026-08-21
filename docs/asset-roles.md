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

Measured baseline the production mascot must not regress:

* deformation battery **0 pinched faces**, worst area ratio **0.267**, 0 FAIL
* planted paw at animation amplitudes **0.052 mm**
* walk support slide **0.46 mm**, vertical **0.15 mm**, IK residual **0.00 mm**
* 3 feet planted at every frame
* reach headroom front **20.0 mm**, rear **40.9 mm**

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
