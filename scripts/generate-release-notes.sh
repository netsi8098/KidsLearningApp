#!/usr/bin/env bash
# ============================================================
# generate-release-notes.sh
# ============================================================
# Generates simplified, parent-facing release notes from git
# history. Filters out technical/internal changes and presents
# user-visible improvements in friendly language.
#
# Usage:
#   ./scripts/generate-release-notes.sh <from-tag> <to-tag>
#   ./scripts/generate-release-notes.sh v1.2.0 v1.3.0
#   ./scripts/generate-release-notes.sh v1.2.0 HEAD
#
# Output: Markdown-formatted release notes suitable for:
#   - App store release notes
#   - Parent-facing changelog in the app
#   - Email newsletters
#   - Social media announcements
#
# Only includes commits prefixed with:
#   feat:     -> "New Features" (user-visible features)
#   content:  -> "New Content" (new learning content)
#   fix:      -> "Improvements" (user-facing bug fixes)
#   perf:     -> "Improvements" (performance improvements)
#   a11y:     -> "Accessibility" (accessibility improvements)
#
# Excludes (technical/internal):
#   chore:, docs:, test:, refactor:, ci:, build:, style:
# ============================================================

set -euo pipefail

# ── Color helpers ────────────────────────────────────────────

if [ -t 1 ]; then
  BOLD='\033[1m'
  DIM='\033[2m'
  RESET='\033[0m'
else
  BOLD=''
  DIM=''
  RESET=''
fi

# ── Argument validation ─────────────────────────────────────

if [ $# -lt 2 ]; then
  echo "Usage: $0 <from-tag> <to-tag>" >&2
  echo "" >&2
  echo "Generates parent-facing release notes (filters out technical changes)." >&2
  echo "" >&2
  echo "Examples:" >&2
  echo "  $0 v1.2.0 v1.3.0" >&2
  echo "  $0 v1.2.0 HEAD" >&2
  echo "" >&2
  echo "Available tags:" >&2
  git tag --sort=-creatordate | head -10 >&2
  exit 1
fi

FROM_REF="$1"
TO_REF="$2"

# Validate refs
if ! git rev-parse --verify "$FROM_REF" > /dev/null 2>&1; then
  echo "Error: ref '$FROM_REF' does not exist" >&2
  exit 1
fi

if ! git rev-parse --verify "$TO_REF" > /dev/null 2>&1; then
  echo "Error: ref '$TO_REF' does not exist" >&2
  exit 1
fi

# ── Determine version ───────────────────────────────────────

if [ "$TO_REF" = "HEAD" ]; then
  VERSION="Next Update"
  RELEASE_DATE=$(date +%B\ %d,\ %Y)  # e.g., "March 26, 2026"
else
  VERSION="${TO_REF#v}"
  TAG_DATE=$(git log -1 --format=%ai "$TO_REF" 2>/dev/null | cut -d' ' -f1)
  if [ -n "$TAG_DATE" ]; then
    # Convert YYYY-MM-DD to "Month DD, YYYY"
    if command -v gdate > /dev/null 2>&1; then
      RELEASE_DATE=$(gdate -d "$TAG_DATE" +"%B %d, %Y")
    elif date --version > /dev/null 2>&1; then
      RELEASE_DATE=$(date -d "$TAG_DATE" +"%B %d, %Y")
    else
      # macOS date
      RELEASE_DATE=$(date -j -f "%Y-%m-%d" "$TAG_DATE" +"%B %d, %Y" 2>/dev/null || echo "$TAG_DATE")
    fi
  else
    RELEASE_DATE=$(date +"%B %d, %Y")
  fi
fi

# ── Collect commits ──────────────────────────────────────────

COMMITS=$(git log "$FROM_REF".."$TO_REF" --pretty=format:"%s" --no-merges 2>/dev/null || true)

if [ -z "$COMMITS" ]; then
  echo "No commits found between $FROM_REF and $TO_REF" >&2
  exit 0
fi

# ── Categorize user-facing changes ──────────────────────────

TMPDIR=$(mktemp -d)
trap 'rm -rf "$TMPDIR"' EXIT

touch "$TMPDIR/features"
touch "$TMPDIR/content"
touch "$TMPDIR/improvements"
touch "$TMPDIR/accessibility"

TOTAL=0
INCLUDED=0

while IFS= read -r subject; do
  TOTAL=$((TOTAL + 1))

  # Extract the message without the conventional commit prefix
  # and clean it up for parent-friendly display

  if echo "$subject" | grep -qE '^feat(\(.+\))?!?:'; then
    MSG=$(echo "$subject" | sed -E 's/^feat(\(.+\))?!?:\s*//')
    # Capitalize first letter
    MSG="$(echo "${MSG:0:1}" | tr '[:lower:]' '[:upper:]')${MSG:1}"
    echo "- $MSG" >> "$TMPDIR/features"
    INCLUDED=$((INCLUDED + 1))

  elif echo "$subject" | grep -qE '^content(\(.+\))?!?:'; then
    MSG=$(echo "$subject" | sed -E 's/^content(\(.+\))?!?:\s*//')
    MSG="$(echo "${MSG:0:1}" | tr '[:lower:]' '[:upper:]')${MSG:1}"
    echo "- $MSG" >> "$TMPDIR/content"
    INCLUDED=$((INCLUDED + 1))

  elif echo "$subject" | grep -qE '^fix(\(.+\))?!?:'; then
    MSG=$(echo "$subject" | sed -E 's/^fix(\(.+\))?!?:\s*//')
    MSG="$(echo "${MSG:0:1}" | tr '[:lower:]' '[:upper:]')${MSG:1}"
    # Reframe bug fixes as improvements for parents
    echo "- $MSG" >> "$TMPDIR/improvements"
    INCLUDED=$((INCLUDED + 1))

  elif echo "$subject" | grep -qE '^perf(\(.+\))?!?:'; then
    MSG=$(echo "$subject" | sed -E 's/^perf(\(.+\))?!?:\s*//')
    MSG="$(echo "${MSG:0:1}" | tr '[:lower:]' '[:upper:]')${MSG:1}"
    echo "- $MSG" >> "$TMPDIR/improvements"
    INCLUDED=$((INCLUDED + 1))

  elif echo "$subject" | grep -qE '^a11y(\(.+\))?!?:'; then
    MSG=$(echo "$subject" | sed -E 's/^a11y(\(.+\))?!?:\s*//')
    MSG="$(echo "${MSG:0:1}" | tr '[:lower:]' '[:upper:]')${MSG:1}"
    echo "- $MSG" >> "$TMPDIR/accessibility"
    INCLUDED=$((INCLUDED + 1))
  fi
  # All other prefixes (chore, docs, test, refactor, ci, build, style) are excluded

done <<< "$COMMITS"

# ── Check if there are any user-facing changes ──────────────

HAS_CONTENT=false
for file in "$TMPDIR/features" "$TMPDIR/content" "$TMPDIR/improvements" "$TMPDIR/accessibility"; do
  if [ -s "$file" ]; then
    HAS_CONTENT=true
    break
  fi
done

if [ "$HAS_CONTENT" = false ]; then
  echo -e "${DIM}No user-facing changes found between $FROM_REF and $TO_REF${RESET}" >&2
  echo -e "${DIM}($TOTAL commits were all internal/technical changes)${RESET}" >&2
  echo ""
  echo "# What's New in Kids Learning Fun v$VERSION"
  echo ""
  echo "*$RELEASE_DATE*"
  echo ""
  echo "This update includes behind-the-scenes improvements to make the app faster and more reliable."
  echo ""
  exit 0
fi

# ── Generate parent-facing release notes ────────────────────

echo "# What's New in Kids Learning Fun v$VERSION"
echo ""
echo "*$RELEASE_DATE*"
echo ""

# New Features
if [ -s "$TMPDIR/features" ]; then
  FEAT_COUNT=$(wc -l < "$TMPDIR/features" | tr -d ' ')
  echo "## New Features"
  echo ""
  cat "$TMPDIR/features"
  echo ""
fi

# New Content
if [ -s "$TMPDIR/content" ]; then
  CONTENT_COUNT=$(wc -l < "$TMPDIR/content" | tr -d ' ')
  echo "## New Content"
  echo ""
  cat "$TMPDIR/content"
  echo ""
fi

# Improvements (bug fixes + performance)
if [ -s "$TMPDIR/improvements" ]; then
  IMP_COUNT=$(wc -l < "$TMPDIR/improvements" | tr -d ' ')
  echo "## Improvements"
  echo ""
  cat "$TMPDIR/improvements"
  echo ""
fi

# Accessibility
if [ -s "$TMPDIR/accessibility" ]; then
  A11Y_COUNT=$(wc -l < "$TMPDIR/accessibility" | tr -d ' ')
  echo "## Accessibility"
  echo ""
  cat "$TMPDIR/accessibility"
  echo ""
fi

# ── Footer ───────────────────────────────────────────────────

echo "---"
echo ""
echo "Thank you for using Kids Learning Fun! We are always working to make learning more enjoyable for your child."
echo ""
echo "Have feedback? We would love to hear from you in the app settings under \"Send Feedback\"."
echo ""

# ── Summary to stderr ────────────────────────────────────────

echo -e "${DIM}---${RESET}" >&2
echo -e "${DIM}Release notes generated for v$VERSION${RESET}" >&2
echo -e "${DIM}Total commits: $TOTAL | User-facing: $INCLUDED | Filtered: $((TOTAL - INCLUDED))${RESET}" >&2
