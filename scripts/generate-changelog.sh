#!/usr/bin/env bash
# ============================================================
# generate-changelog.sh
# ============================================================
# Generates a CHANGELOG entry from git history between two tags.
# Parses conventional commit messages and groups them by category.
#
# Usage:
#   ./scripts/generate-changelog.sh <from-tag> <to-tag>
#   ./scripts/generate-changelog.sh v1.2.0 v1.3.0
#   ./scripts/generate-changelog.sh v1.2.0 HEAD
#
# Commit message format (conventional commits):
#   feat: add phonics mini-game
#   fix: correct scoring in math quiz
#   content: add 20 new nursery rhymes
#   perf: optimize image loading pipeline
#   docs: update API documentation
#   chore: upgrade dependencies
#   refactor: simplify auth middleware
#   test: add integration tests for sync
#   security: patch XSS vulnerability
#   a11y: improve screen reader support
#
# If no conventional prefix is found, the commit is placed in "Other".
#
# Output: Markdown-formatted changelog entry to stdout.
# Append to CHANGELOG.md: ./scripts/generate-changelog.sh v1.2.0 v1.3.0 >> CHANGELOG.md
# ============================================================

set -euo pipefail

# ── Color helpers (for terminal output, stripped from redirected output) ──

if [ -t 1 ]; then
  BOLD='\033[1m'
  DIM='\033[2m'
  RESET='\033[0m'
else
  BOLD=''
  DIM=''
  RESET=''
fi

# ── Argument validation ──────────────────────────────────────

if [ $# -lt 2 ]; then
  echo "Usage: $0 <from-tag> <to-tag>" >&2
  echo "" >&2
  echo "Examples:" >&2
  echo "  $0 v1.2.0 v1.3.0          # Between two tags" >&2
  echo "  $0 v1.2.0 HEAD             # From tag to current HEAD" >&2
  echo "  $0 v1.2.0 release/v1.3.0   # From tag to release branch" >&2
  echo "" >&2
  echo "Available tags:" >&2
  git tag --sort=-creatordate | head -10 >&2
  exit 1
fi

FROM_REF="$1"
TO_REF="$2"

# Validate refs exist
if ! git rev-parse --verify "$FROM_REF" > /dev/null 2>&1; then
  echo "Error: ref '$FROM_REF' does not exist" >&2
  exit 1
fi

if ! git rev-parse --verify "$TO_REF" > /dev/null 2>&1; then
  echo "Error: ref '$TO_REF' does not exist" >&2
  exit 1
fi

# ── Determine version and date ───────────────────────────────

if [ "$TO_REF" = "HEAD" ]; then
  VERSION="Unreleased"
  RELEASE_DATE=$(date +%Y-%m-%d)
else
  VERSION="${TO_REF#v}"  # Strip leading 'v' if present
  # Get the date of the tag
  RELEASE_DATE=$(git log -1 --format=%ai "$TO_REF" 2>/dev/null | cut -d' ' -f1)
  if [ -z "$RELEASE_DATE" ]; then
    RELEASE_DATE=$(date +%Y-%m-%d)
  fi
fi

# ── Collect commits ──────────────────────────────────────────

# Get all commit messages between the two refs, one per line
# Format: <short-hash> <subject>
COMMITS=$(git log "$FROM_REF".."$TO_REF" --pretty=format:"%h %s" --no-merges 2>/dev/null || true)

if [ -z "$COMMITS" ]; then
  echo "No commits found between $FROM_REF and $TO_REF" >&2
  exit 0
fi

COMMIT_COUNT=$(echo "$COMMITS" | wc -l | tr -d ' ')
echo -e "${DIM}Found $COMMIT_COUNT commits between $FROM_REF and $TO_REF${RESET}" >&2

# ── Categorize commits ──────────────────────────────────────

# Temporary files for each category
TMPDIR=$(mktemp -d)
trap 'rm -rf "$TMPDIR"' EXIT

# Category files
touch "$TMPDIR/feat"
touch "$TMPDIR/fix"
touch "$TMPDIR/content"
touch "$TMPDIR/perf"
touch "$TMPDIR/security"
touch "$TMPDIR/a11y"
touch "$TMPDIR/refactor"
touch "$TMPDIR/docs"
touch "$TMPDIR/test"
touch "$TMPDIR/chore"
touch "$TMPDIR/other"
touch "$TMPDIR/breaking"

while IFS= read -r line; do
  # Extract hash and subject
  HASH=$(echo "$line" | cut -d' ' -f1)
  SUBJECT=$(echo "$line" | cut -d' ' -f2-)

  # Check for breaking change indicator
  IS_BREAKING=false
  if echo "$SUBJECT" | grep -qiE '!:|BREAKING CHANGE'; then
    IS_BREAKING=true
  fi

  # Parse conventional commit prefix
  # Matches: feat:, feat(scope):, feat!:, etc.
  if echo "$SUBJECT" | grep -qE '^feat(\(.+\))?!?:'; then
    MSG=$(echo "$SUBJECT" | sed -E 's/^feat(\(.+\))?!?:\s*//')
    echo "- $MSG ($HASH)" >> "$TMPDIR/feat"
  elif echo "$SUBJECT" | grep -qE '^fix(\(.+\))?!?:'; then
    MSG=$(echo "$SUBJECT" | sed -E 's/^fix(\(.+\))?!?:\s*//')
    echo "- $MSG ($HASH)" >> "$TMPDIR/fix"
  elif echo "$SUBJECT" | grep -qE '^content(\(.+\))?!?:'; then
    MSG=$(echo "$SUBJECT" | sed -E 's/^content(\(.+\))?!?:\s*//')
    echo "- $MSG ($HASH)" >> "$TMPDIR/content"
  elif echo "$SUBJECT" | grep -qE '^perf(\(.+\))?!?:'; then
    MSG=$(echo "$SUBJECT" | sed -E 's/^perf(\(.+\))?!?:\s*//')
    echo "- $MSG ($HASH)" >> "$TMPDIR/perf"
  elif echo "$SUBJECT" | grep -qE '^security(\(.+\))?!?:'; then
    MSG=$(echo "$SUBJECT" | sed -E 's/^security(\(.+\))?!?:\s*//')
    echo "- $MSG ($HASH)" >> "$TMPDIR/security"
  elif echo "$SUBJECT" | grep -qE '^a11y(\(.+\))?!?:'; then
    MSG=$(echo "$SUBJECT" | sed -E 's/^a11y(\(.+\))?!?:\s*//')
    echo "- $MSG ($HASH)" >> "$TMPDIR/a11y"
  elif echo "$SUBJECT" | grep -qE '^refactor(\(.+\))?!?:'; then
    MSG=$(echo "$SUBJECT" | sed -E 's/^refactor(\(.+\))?!?:\s*//')
    echo "- $MSG ($HASH)" >> "$TMPDIR/refactor"
  elif echo "$SUBJECT" | grep -qE '^docs(\(.+\))?!?:'; then
    MSG=$(echo "$SUBJECT" | sed -E 's/^docs(\(.+\))?!?:\s*//')
    echo "- $MSG ($HASH)" >> "$TMPDIR/docs"
  elif echo "$SUBJECT" | grep -qE '^test(\(.+\))?!?:'; then
    MSG=$(echo "$SUBJECT" | sed -E 's/^test(\(.+\))?!?:\s*//')
    echo "- $MSG ($HASH)" >> "$TMPDIR/test"
  elif echo "$SUBJECT" | grep -qE '^chore(\(.+\))?!?:'; then
    MSG=$(echo "$SUBJECT" | sed -E 's/^chore(\(.+\))?!?:\s*//')
    echo "- $MSG ($HASH)" >> "$TMPDIR/chore"
  elif echo "$SUBJECT" | grep -qE '^(build|ci|style)(\(.+\))?!?:'; then
    MSG=$(echo "$SUBJECT" | sed -E 's/^(build|ci|style)(\(.+\))?!?:\s*//')
    echo "- $MSG ($HASH)" >> "$TMPDIR/chore"
  else
    echo "- $SUBJECT ($HASH)" >> "$TMPDIR/other"
  fi

  # Track breaking changes separately
  if [ "$IS_BREAKING" = true ]; then
    echo "- $SUBJECT ($HASH)" >> "$TMPDIR/breaking"
  fi

done <<< "$COMMITS"

# ── Generate markdown output ────────────────────────────────

echo "## [$VERSION] - $RELEASE_DATE"
echo ""

# Breaking changes first (if any)
if [ -s "$TMPDIR/breaking" ]; then
  echo "### BREAKING CHANGES"
  echo ""
  cat "$TMPDIR/breaking"
  echo ""
fi

# Categories in display order
declare -a CATEGORIES=(
  "feat:Features"
  "content:Content Updates"
  "fix:Bug Fixes"
  "perf:Performance"
  "security:Security"
  "a11y:Accessibility"
  "refactor:Refactoring"
  "docs:Documentation"
  "test:Tests"
  "chore:Maintenance"
  "other:Other"
)

for entry in "${CATEGORIES[@]}"; do
  KEY="${entry%%:*}"
  LABEL="${entry#*:}"
  FILE="$TMPDIR/$KEY"

  if [ -s "$FILE" ]; then
    echo "### $LABEL"
    echo ""
    cat "$FILE"
    echo ""
  fi
done

# ── Summary statistics ───────────────────────────────────────

echo -e "${DIM}---${RESET}" >&2
echo -e "${DIM}Changelog generated for $VERSION ($RELEASE_DATE)${RESET}" >&2
echo -e "${DIM}Total commits: $COMMIT_COUNT${RESET}" >&2

# Count per category
for entry in "${CATEGORIES[@]}"; do
  KEY="${entry%%:*}"
  LABEL="${entry#*:}"
  FILE="$TMPDIR/$KEY"
  if [ -s "$FILE" ]; then
    COUNT=$(wc -l < "$FILE" | tr -d ' ')
    echo -e "${DIM}  $LABEL: $COUNT${RESET}" >&2
  fi
done
