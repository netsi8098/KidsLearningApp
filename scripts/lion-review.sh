#!/usr/bin/env bash
#
# lion-review.sh — one command: rebuild, measure, look at it.
#
# WHY
# Every pass on this asset improvised the same loop by hand: run some subset of
# the Blender scripts, grep some numbers out, render something to look at, and
# hope the subset was the right one. That went wrong in three distinct ways
# across one session:
#
#   * a stage was SKIPPED. The ears were reverted in cage_lion.py but
#     rig_cage_lion and anim_cage_lion were not re-run, so the assembled GLB
#     still carried the old cage and the measurements described a model that no
#     longer existed.
#   * a script was run on its OWN OUTPUT. face_lion.py on lion_face.blend
#     duplicated all 15 face parts, and a later probe measured the stale
#     original — reporting a 65.6 mm float that the fresh build had already
#     fixed.
#   * the renders were IMPROVISED, so the lighting was wrong. Several passes
#     judged the mane's front while it was in shadow.
#
# The pipeline order is the thing worth encoding. It is not obvious and it is
# not forgiving:
#
#     cage_lion  ->  rig_cage_lion  ->  anim_cage_lion  ->  assemble_lion
#          \                                                    ^
#           `--> mane_foundation (imports lion_cage.blend) -----'
#
# mane_foundation reads the CAGE, and assemble reads both the animated rig and
# the mane, so a cage change invalidates everything downstream.
#
# USAGE
#   npm run lion:review              measure + render from the current blends
#   npm run lion:review -- --rebuild rebuild the whole chain first (slow)
#   npm run lion:review -- --sheet   also stitch a contact sheet (needs PIL)
#
set -uo pipefail

cd "$(dirname "$0")/.."
BLENDER="${BLENDER:-blender}"
BG=(--background --factory-startup)
REBUILD=0
SHEET=0
for arg in "$@"; do
  case "$arg" in
    --rebuild) REBUILD=1 ;;
    --sheet) SHEET=1 ;;
    *) echo "unknown option: $arg" >&2; exit 2 ;;
  esac
done

fail=0
step() { printf '\n\033[1m── %s\033[0m\n' "$1"; }
# Keep going on failure rather than aborting: a broken stage should not hide
# the measurements of the stages that did work, which is most of the value.
note_fail() { echo "  !! FAILED: $1"; fail=1; }

if [ "$REBUILD" = "1" ]; then
  step "1/6  cage  (cage_lion.py)"
  "$BLENDER" "${BG[@]}" --python tools/blender/cage_lion.py 2>&1 \
    | grep -E "^VERTS=|QUAD_RATIO|SLIVER_FACES=|BOUNDARY_EDGES=|NON_MANIFOLD_EDGES=|WARNING" \
    || note_fail cage_lion

  step "2/6  deformation battery  (deform_qa_lion.py)"
  "$BLENDER" "${BG[@]}" art/blender/lion_cage.blend --python tools/blender/deform_qa_lion.py 2>&1 \
    | grep -E "WORST_AREA_RATIO|TOTAL_PINCHED|TOTAL_FLIPPED" || note_fail deform_qa

  step "3/6  rig  (rig_cage_lion.py)"
  "$BLENDER" "${BG[@]}" art/blender/lion_cage.blend --python tools/blender/rig_cage_lion.py 2>&1 \
    | grep -E "BONES_TOTAL|BONES_DEFORM|REACH_HEADROOM|PLANTED_PAW_WORST|WARNING unmapped" \
    || note_fail rig_cage_lion

  step "4/6  clips  (anim_cage_lion.py)"
  "$BLENDER" "${BG[@]}" art/blender/lion_rigged_cage.blend --python tools/blender/anim_cage_lion.py 2>&1 \
    | grep -E "^ACTIONS=|SUPPORT_SLIDE|STRIDE=|within 3 mm residual|exceed the IK gate" \
    || note_fail anim_cage_lion

  step "5/6  mane  (mane_foundation.py — reads the cage, so it must follow it)"
  "$BLENDER" "${BG[@]}" --python tools/blender/mane_foundation.py 2>&1 \
    | grep -E "welded|after subdiv|MANE_WIDTH|MANE_HEIGHT|MANE_DEPTH" || note_fail mane_foundation

  step "6/6  assemble  (assemble_lion.py)"
  LION_SUBDIV="${LION_SUBDIV:-2}" "$BLENDER" "${BG[@]}" art/blender/lion_anim_cage.blend \
    --python tools/blender/assemble_lion.py 2>&1 \
    | grep -E "subdivided|region |^KB=|^MESHES=|^ACTIONS=|neutral check|PROBLEM" \
    || note_fail assemble_lion
else
  echo "(measuring the existing blends — pass --rebuild to rebuild the chain first)"
fi

step "silhouette — render the model through the locked reference cameras"
"$BLENDER" "${BG[@]}" art/blender/lion_assembled.blend \
  --python tools/blender/silhouette_render.py -- mascot \
  "LionCage,LionMane,LionFace_Gloss,LionFace_Ink" 2>&1 | grep -E "\[sil\] fit" \
  || note_fail silhouette_render

step "silhouette IoU  (vs the approved turnaround)"
# REAR_CEILING is in the grep on purpose. The rear view sits at the ceiling its
# own reference imposes, and three passes recorded its "16.9% extra material" as
# an outstanding defect before that was measured. Printing the ceiling next to
# the IoU every run is what stops a fourth.
python3 tools/cad/silhouette_qa.py mascot subject 2>&1 \
  | grep -E "^front|^side|^rear|^three|MEAN_IOU|WEIGHTED_IOU|CLIPPED|registration|REAR_CEILING|self-consistency|mirrored rear" \
  || note_fail silhouette_qa

step "band spans — WHICH WAY each band disagrees, front and side"
for v in front side; do
  echo "  --- $v"
  python3 tools/cad/band_spans.py mascot subject "$v" 2>&1 | sed -n '2,10p'
done

step "contracts"
node scripts/validate-lion-glb.mjs public/assets/lion/cage/lion.glb 2>&1 | tail -5 || note_fail cage_contract
node scripts/validate-lion-glb.mjs 2>&1 | tail -3 || note_fail proxy_contract

step "review sheets — FRONT-LIT and isolated (tools/blender/review_render.py)"
"$BLENDER" "${BG[@]}" art/blender/lion_assembled.blend \
  --python tools/blender/review_render.py 2>&1 \
  | grep -E "^\[review\]|^SHEETS=|^MESHES=|^BONES=" || note_fail review_render

if [ "$SHEET" = "1" ]; then
  step "contact sheet"
  python3 scripts/lion-contact-sheet.py || note_fail contact_sheet
fi

printf '\n\033[1m── done\033[0m\n'
echo "  sheets: docs/assets/lion-review/"
if [ "$fail" != "0" ]; then
  echo "  one or more stages FAILED — see the !! lines above"
  exit 1
fi
echo "  all stages completed"
