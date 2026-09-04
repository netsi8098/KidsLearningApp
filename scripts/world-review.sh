#!/usr/bin/env bash
#
# world-review.sh — one command: rebuild the world, measure it, look at it.
#
# WHY
# The lion earned a review loop the hard way. Across one long session the
# expensive mistakes on it were never missing tools; they were judging geometry
# from numbers and being wrong, and the fix was `npm run lion:review` — the
# lighting and the angles already correct, so looking at it properly happens
# every pass instead of being improvised.
#
# The world it stands in had none of that. No scale gate, no measured targets,
# no repeatable render. The result is a scene whose tallest tree is 1.4 times
# the character's height and whose reeds are taller than the character, which
# nobody could have told you because nobody had measured it.
#
# WHAT IT GUARANTEES
#   * SCALE IS A GATE. `world_audit.py` fails the run when a category's height
#     is outside its documented target relative to the lion's 1.30 m. Landmarks
#     are judged on their tallest member and scatter on its median, because
#     those are different questions.
#   * THE SAME THREE ANGLES EVERY TIME — the locked production camera plus a
#     side and a high diagnostic, so two runs are comparable.
#   * THE CONTRACT IS CHECKED. `validate_home_environment.py` asserts the
#     markers the runtime reads by name still exist.
#
# USAGE
#   npm run world:review                measure and render from the current blend
#   npm run world:review -- --rebuild   rebuild the world first
#   npm run world:review -- --sheet     also stitch a contact sheet (needs PIL)
#
set -uo pipefail

cd "$(dirname "$0")/.."
BLENDER="${BLENDER:-blender}"
BG=(--background --factory-startup)
BLEND=art/blender/home_environment.blend
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
note_fail() { echo "  !! FAILED: $1"; fail=1; }

if [ "$REBUILD" = "1" ]; then
  step "1/4  build  (build_home_environment.py)"
  # --no-render because this script owns the rendering, and letting the builder
  # do its own previews too doubles the slowest stage for no extra information.
  "$BLENDER" "${BG[@]}" --python tools/blender/build_home_environment.py -- --no-render 2>&1 \
    | grep -E "^MESH_OBJECTS=|^TRIS=|^MATERIALS=|^CAMERA=|WARNING" || note_fail build_home_environment

  step "2/4  export  (export_home_environment.py)"
  "$BLENDER" "${BG[@]}" "$BLEND" --python tools/blender/export_home_environment.py 2>&1 \
    | grep -E "GLB=|KB=|^MESHES=|WARNING" || note_fail export_home_environment
else
  echo "(measuring the existing blend — pass --rebuild to rebuild it first)"
fi

step "contract — the markers the runtime reads by NAME"
"$BLENDER" "${BG[@]}" "$BLEND" --python tools/blender/validate_home_environment.py 2>&1 \
  | grep -E "OK|MISSING|FAIL|WARNING|===" || note_fail validate_home_environment

step "measure — dump the world's facts"
"$BLENDER" "${BG[@]}" "$BLEND" --python tools/blender/dump_world.py 2>&1 \
  | grep -E "^JSON=|^OBJECTS=" || note_fail dump_world

step "SCALE GATE — every height against the lion's 1.30 m"
python3 tools/cad/world_audit.py || note_fail world_audit

step "renders — the production camera plus two diagnostics"
"$BLENDER" "${BG[@]}" "$BLEND" --python tools/blender/world_render.py 2>&1 \
  | grep -E "^\[world\]|^SHOTS=" || note_fail world_render

if [ "$SHEET" = "1" ]; then
  step "contact sheet"
  python3 scripts/world-contact-sheet.py || note_fail contact_sheet
fi

printf '\n\033[1m── done\033[0m\n'
echo "  renders: docs/assets/home-environment/"
if [ "$fail" != "0" ]; then
  echo "  one or more stages FAILED — see the !! lines above"
  exit 1
fi
echo "  all stages completed"
