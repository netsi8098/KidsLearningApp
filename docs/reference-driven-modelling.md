# Reference-driven modelling — the turnaround as geometric authority

Added alongside the existing pipeline, not replacing it. The current lion is
preserved at tag `lion_current_backup` and as
`art/blender/lion_current_backup.blend`; nothing in the runtime, the rig, the
animation architecture or the QA tooling was touched.

## The finding that justifies the whole exercise

**The approved turnaround is not orthographically consistent.** Measured, after
isolating each subject from the card and its cast shadow:

| | front | side | rear |
|---|---|---|---|
| height | 483 px | 463 px | 426 px |
| width / height | 0.712 | 1.432 | 0.587 |

Height spread **11.8%**, ground-line spread **26 px**. It was drawn, not rendered
from one camera. Matching geometry to the views as-found would bake that
disagreement into the character, so every view is rescaled to a common ground
line and a common height first.

A second inconsistency survives normalisation: the **front and rear views
disagree about mane width by 18%** (0.713 H against 0.588 H — the same dimension
of the same object). Both cannot be satisfied. The front view wins: it is the
hero angle, the largest drawing, and the one a child sees. The rear silhouette QA
therefore shows a permanent "model too wide" halo, and that halo is *not* a
defect to chase.

## Pipeline

    turnaround.png
      -> isolate subjects (saturation mask + largest connected component)
      -> normalise to one ground line and height
      -> measure silhouette profiles
      -> CadQuery loft through measured cross-sections   [volume reference]
      -> Blender: locked reference planes + imported volume
      -> silhouette-difference QA
      -> sculpt -> retopology -> rig            [existing pipeline, unchanged]

### Isolating the subject

A flat distance-from-background mask also catches the **cast shadow**, which is
wider than the body and connects to the paws — the first pass reported a width of
1.16 H, which is impossible. The card and the shadow are both neutral greys; the
lion is saturated gold and brown and its cream is brighter than the card. Masking
on *saturated or brighter*, then taking the largest connected component per
quadrant, separates subject from both and from anything leaking across the seam.

### Measuring

Run-length analysis per scanline, not bounding boxes. That is what separates the
torso from the legs: between the legs a column has two runs with a gap, and the
bottom of the upper run is the belly.

`profiles.json` holds width-against-height for front and rear, and the back line
and lower line per fore-aft station for the side.

### Why CadQuery, and what it is not for

CadQuery is an OpenCascade kernel. Its native output is BREP/STEP and it has no
concept of subdivision surfaces, edge-loop topology, skinning or morph targets —
so it cannot produce the production asset, and the production asset remains a
polygonal Blender mesh exporting glTF.

What it is good at is lofting precise solids through cross-sections, which is
exactly the "build from cross-sections, not spheres" instruction. It fills the
role assigned to image-to-3D reconstruction — *learn the volume here, make it
animate in Blender* — with the advantage that a loft through measured sections
cannot invent a back side, fuse the legs, or bake in a pose.

**One thing no orthographic view provides is width along length.** A front view is
a projection over the whole body: it reports the widest point at each height, not
the width at each station. That profile is interpolated between named anchors,
and `WIDTH_ANCHORS` marks which figures are measured and which are inferred.

## Silhouette-difference QA

The proportion dashboard reports scalars, and scalars can all be right while the
shape is wrong. The model is rendered from orthographic cameras that frame each
reference canvas exactly, thresholded to a mask, and compared pixel by pixel.

| view | IoU | missing | extra |
|---|---|---|---|
| front | **0.907** | 4.9% | 4.8% |
| side | **0.879** | 8.9% | 3.7% |
| rear | 0.771 | 4.8% | 23.6% ← documented artwork disagreement |
| **mean** | **0.852** | | |

Proportion error against the reference: width/height **−0.1%**, length/height
**−0.1%**.

`overlay-sheet.png` colours it: green agreement, **red** reference the model does
not cover, **blue** model outside the reference. The first overlay showed a solid
red band under the whole body — the legs stopped 0.020 H above the ground and the
paws were narrower than the shafts, so the character floated and its feet read as
pegs. Correcting that moved the mean IoU 0.843 → 0.852 and the proportion error
from ±2% to ±0.1%.

The numbers are a guide, not the goal. A high IoU with the wrong character is
still the wrong character; the overlay stays authoritative.

## Alignment contract

Normalised masks are 700×700, ground on row 620, H = 520 px. Therefore
1 px = 1/520 H, the canvas spans 700/520 = **1.3462 H**, and its centre row maps
to Z = **0.5192 H**. Every reference empty and every camera is derived from those
four numbers, and all of them are **locked** — an alignment that can be nudged is
an alignment that will be.

Handedness caught one error worth recording: a camera at +X looking −X has its
image-right along +Y, which put the nose on the wrong side. Side IoU came out at
0.248 with roughly equal missing and extra in **every** band — the signature of a
mirror rather than a shape error. Viewing from −X fixed it.

## Where this goes next

The volume is a reference, not the asset. Remaining, in order:

1. Sculpt secondary forms over it — brow, cheeks, muzzle transition, shoulder and
   chest flow, rib cage, haunch, paw softness, mane macro forms. Planes and
   volumes, not micro detail.
2. Mane as a hybrid: one coherent underlying mass, then selected directional
   clumps only where they change the silhouette — crown, cheek framing, lower
   mane, rear outline.
3. Face: real eyeballs set into sockets, eyelids, brow, cheek volume, compact
   muzzle, nose, jaw, mouth cavity.
4. Retopologise onto the existing authored-cage technique.
5. Transfer, don't rebuild: scale, origin, `MARK_LionSpawn`, materials,
   animation state names, controller API, export pipeline, validators, runtime
   loading, QA and debug tools all carry over unchanged.

Success criterion is unchanged and not yet met: rendered in flat clay with no
texture, it must already read as the approved mascot from front, side, rear and
three-quarter. If mane colour is needed to hide a proportion, the geometry is not
ready.

## Files

| Path | Role |
|---|---|
| `art/blender/references/turnaround-views/` | isolated views, masks, normalised masks, `profiles.json` |
| `tools/cad/loft_lion_volume.py` | CadQuery loft (run with `/tmp/cqenv/bin/python`) |
| `tools/cad/silhouette_qa.py` | IoU / missing / extra, per view and per height band |
| `tools/blender/build_reference_rebuild.py` | locked reference planes, ortho cameras, volume import |
| `art/cad/lion_volume.{stl,step}` | the lofted volume |
| `art/blender/lion_reference_rebuild.blend` | the modelling scene |
| `art/blender/references/silhouette-qa/` | model masks, overlays, `silhouette_report.json` |

CadQuery lives in an isolated venv at `/tmp/cqenv` (not a project dependency —
it is a modelling-time tool and must never reach the web bundle).

---

## Measurement result — where identity actually fails

With the mane/body colour split measured, the reference gives separate numbers
for the skull and the mane:

| | measured | current donor cage |
|---|---|---|
| face width (front, inside the mane) | 0.462 H | 0.458 H |
| mane width | 0.708 H at h=0.62 | ~0.74 H |
| mane vertical band | h 0.19 – 0.98 | ~0.22 – 1.00 |
| mane fore-aft extent (side) | u 0.08 – 0.49 | ~0.10 – 0.50 |
| muzzle projection beyond mane | 0.106 H | ~0.12 H |
| total length | 1.344 H | 1.365 H |

**The donor cage is dimensionally close.** Every gross proportion is within a few
percent. So the identity failure is not the cross-section *dimensions* — it is
the secondary **form**: a mane that reads as a scalloped ball instead of a
teardrop, a chest that does not rise into it, a flat rump, and ears that vanish
in profile.

That changes the plan for the better: the cross-section table does not need
wholesale replacement, which is also what preserves the joint contract. The work
is form, and it is exactly tasks 11–13.

### And it changes the ORDER

Graded against the full reference silhouette, the donor cage scores a weighted
IoU of **0.590** with **38% missing** — but the cage carries no mane at all, so
that number is mostly measuring an absent object.

Grading the cage body against the measured *body* mask instead gives 0.472, and
that is also misleading in the opposite direction: the reference's visible gold
face is only the part showing through the mane opening, while the cage's skull is
a whole head. The extra shows up at h 0.6–1.0 in every view.

Neither number is a fair test, and the reason is the same in both cases:
**identity cannot be measured until the mane exists.** So the mane foundation
comes before further body refinement, and body form is then tuned against a
metric that means something.

Baseline recorded for comparison: donor cage, full silhouette, weighted IoU
**0.590** (front 0.600, side 0.518, 3/4 0.618, rear 0.700).
