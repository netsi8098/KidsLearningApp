#!/usr/bin/env bash
# ============================================================
# Kids Learning Fun - Local Change Detection Script
#
# Detects which packages changed vs the main branch.
# Useful for running targeted tests locally instead of
# running the entire test suite.
#
# Usage:
#   ./scripts/detect-changes.sh              # Detect changes vs main
#   ./scripts/detect-changes.sh develop      # Detect changes vs develop
#   ./scripts/detect-changes.sh --run-tests  # Detect and run affected tests
#   ./scripts/detect-changes.sh --json       # Output as JSON
# ============================================================

set -euo pipefail

# ── Configuration ────────────────────────────────────────────

# Base branch to compare against (default: main)
BASE_BRANCH="${1:-main}"
RUN_TESTS=false
JSON_OUTPUT=false

# Parse flags
for arg in "$@"; do
  case "$arg" in
    --run-tests) RUN_TESTS=true ;;
    --json)      JSON_OUTPUT=true ;;
    --help|-h)
      echo "Usage: $0 [base-branch] [--run-tests] [--json] [--help]"
      echo ""
      echo "Options:"
      echo "  base-branch    Branch to compare against (default: main)"
      echo "  --run-tests    Run tests for changed packages"
      echo "  --json         Output results as JSON"
      echo "  --help         Show this help"
      echo ""
      echo "Examples:"
      echo "  $0                    # Compare against main"
      echo "  $0 develop            # Compare against develop"
      echo "  $0 --run-tests        # Detect changes and run tests"
      echo "  $0 develop --json     # JSON output, compare against develop"
      exit 0
      ;;
  esac
done

# Remove flags from BASE_BRANCH if it starts with --
if [[ "$BASE_BRANCH" == --* ]]; then
  BASE_BRANCH="main"
fi

# ── Colors ───────────────────────────────────────────────────

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# ── Ensure we are in the repo root ───────────────────────────

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || echo "")"
if [ -z "$REPO_ROOT" ]; then
  echo -e "${RED}Error: Not in a git repository${NC}"
  exit 1
fi
cd "$REPO_ROOT"

# ── Get changed files ────────────────────────────────────────

# Try to get diff against the base branch
if git rev-parse --verify "origin/$BASE_BRANCH" >/dev/null 2>&1; then
  MERGE_BASE=$(git merge-base "origin/$BASE_BRANCH" HEAD 2>/dev/null || echo "")
elif git rev-parse --verify "$BASE_BRANCH" >/dev/null 2>&1; then
  MERGE_BASE=$(git merge-base "$BASE_BRANCH" HEAD 2>/dev/null || echo "")
else
  echo -e "${YELLOW}Warning: Branch '$BASE_BRANCH' not found. Comparing against HEAD~1${NC}"
  MERGE_BASE=$(git rev-parse HEAD~1 2>/dev/null || echo "")
fi

if [ -z "$MERGE_BASE" ]; then
  echo -e "${RED}Error: Could not determine merge base${NC}"
  exit 1
fi

CHANGED_FILES=$(git diff --name-only "$MERGE_BASE" HEAD 2>/dev/null || echo "")

# Also include uncommitted changes
UNCOMMITTED=$(git diff --name-only HEAD 2>/dev/null || echo "")
UNTRACKED=$(git ls-files --others --exclude-standard 2>/dev/null || echo "")

ALL_CHANGED=$(echo -e "$CHANGED_FILES\n$UNCOMMITTED\n$UNTRACKED" | sort -u | grep -v '^$' || echo "")

if [ -z "$ALL_CHANGED" ]; then
  if [ "$JSON_OUTPUT" = true ]; then
    echo '{"frontend":false,"backend":false,"admin":false,"e2e":false,"prisma":false,"infra":false,"changes":[]}'
  else
    echo -e "${GREEN}No changes detected vs $BASE_BRANCH${NC}"
  fi
  exit 0
fi

# ── Classify changes by package ──────────────────────────────

FRONTEND=false
BACKEND=false
ADMIN=false
E2E=false
PRISMA=false
INFRA=false

FRONTEND_FILES=()
BACKEND_FILES=()
ADMIN_FILES=()
E2E_FILES=()
OTHER_FILES=()

while IFS= read -r file; do
  case "$file" in
    src/*|public/*|index.html|vite.config.ts|tsconfig*.json|package.json|package-lock.json)
      FRONTEND=true
      FRONTEND_FILES+=("$file")
      ;;
    backend/prisma/*)
      BACKEND=true
      PRISMA=true
      BACKEND_FILES+=("$file")
      ;;
    backend/*)
      BACKEND=true
      BACKEND_FILES+=("$file")
      ;;
    admin/*)
      ADMIN=true
      ADMIN_FILES+=("$file")
      ;;
    e2e/*)
      E2E=true
      E2E_FILES+=("$file")
      ;;
    docker-compose*|*Dockerfile*|nginx.conf|.github/workflows/*)
      INFRA=true
      OTHER_FILES+=("$file")
      ;;
    *)
      OTHER_FILES+=("$file")
      ;;
  esac
done <<< "$ALL_CHANGED"

# ── Output results ───────────────────────────────────────────

if [ "$JSON_OUTPUT" = true ]; then
  # JSON output mode
  CHANGES_JSON=$(echo "$ALL_CHANGED" | python3 -c "
import sys, json
lines = [l.strip() for l in sys.stdin if l.strip()]
print(json.dumps(lines))
" 2>/dev/null || echo "[]")

  cat <<EOF
{
  "frontend": $FRONTEND,
  "backend": $BACKEND,
  "admin": $ADMIN,
  "e2e": $E2E,
  "prisma": $PRISMA,
  "infra": $INFRA,
  "base_branch": "$BASE_BRANCH",
  "merge_base": "$MERGE_BASE",
  "total_files": $(echo "$ALL_CHANGED" | wc -l | tr -d ' '),
  "changes": $CHANGES_JSON
}
EOF
  exit 0
fi

# Human-readable output
echo ""
echo -e "${BOLD}========================================${NC}"
echo -e "${BOLD} Change Detection Report${NC}"
echo -e "${BOLD}========================================${NC}"
echo -e "${CYAN}Base:${NC} $BASE_BRANCH ($MERGE_BASE)"
echo -e "${CYAN}Total changed files:${NC} $(echo "$ALL_CHANGED" | wc -l | tr -d ' ')"
echo ""

# Package summary
echo -e "${BOLD}Package Status:${NC}"
if [ "$FRONTEND" = true ]; then
  echo -e "  ${GREEN}[CHANGED]${NC} frontend  (${#FRONTEND_FILES[@]} files)"
else
  echo -e "  ${BLUE}[  OK  ]${NC} frontend"
fi

if [ "$BACKEND" = true ]; then
  echo -e "  ${GREEN}[CHANGED]${NC} backend   (${#BACKEND_FILES[@]} files)"
else
  echo -e "  ${BLUE}[  OK  ]${NC} backend"
fi

if [ "$ADMIN" = true ]; then
  echo -e "  ${GREEN}[CHANGED]${NC} admin     (${#ADMIN_FILES[@]} files)"
else
  echo -e "  ${BLUE}[  OK  ]${NC} admin"
fi

if [ "$E2E" = true ]; then
  echo -e "  ${GREEN}[CHANGED]${NC} e2e       (${#E2E_FILES[@]} files)"
else
  echo -e "  ${BLUE}[  OK  ]${NC} e2e"
fi

if [ "$PRISMA" = true ]; then
  echo -e "  ${YELLOW}[SCHEMA]${NC} prisma migrations"
fi

if [ "$INFRA" = true ]; then
  echo -e "  ${YELLOW}[INFRA ]${NC} infrastructure"
fi

echo ""

# Suggested commands
echo -e "${BOLD}Suggested Commands:${NC}"
if [ "$FRONTEND" = true ]; then
  echo -e "  ${CYAN}npm run test${NC}                    # Frontend tests"
  echo -e "  ${CYAN}npx tsc --noEmit${NC}                # Frontend typecheck"
fi
if [ "$BACKEND" = true ]; then
  echo -e "  ${CYAN}cd backend && npm run test:unit${NC}  # Backend unit tests"
  echo -e "  ${CYAN}cd backend && npm run typecheck${NC}  # Backend typecheck"
fi
if [ "$ADMIN" = true ]; then
  echo -e "  ${CYAN}cd admin && npm run test${NC}         # Admin tests"
  echo -e "  ${CYAN}cd admin && npm run typecheck${NC}    # Admin typecheck"
fi
if [ "$PRISMA" = true ]; then
  echo -e "  ${YELLOW}cd backend && npx prisma validate${NC} # Validate schema"
  echo -e "  ${YELLOW}cd backend && npx prisma migrate dev${NC} # Run migrations"
fi
echo ""

# ── Run tests if requested ───────────────────────────────────

if [ "$RUN_TESTS" = true ]; then
  echo -e "${BOLD}========================================${NC}"
  echo -e "${BOLD} Running Tests for Changed Packages${NC}"
  echo -e "${BOLD}========================================${NC}"
  echo ""

  EXIT_CODE=0

  if [ "$FRONTEND" = true ]; then
    echo -e "${CYAN}>>> Frontend typecheck${NC}"
    npx tsc --noEmit || EXIT_CODE=1
    echo ""

    echo -e "${CYAN}>>> Frontend tests${NC}"
    npm run test || EXIT_CODE=1
    echo ""
  fi

  if [ "$BACKEND" = true ]; then
    echo -e "${CYAN}>>> Backend typecheck${NC}"
    (cd backend && npx tsc --noEmit) || EXIT_CODE=1
    echo ""

    echo -e "${CYAN}>>> Backend unit tests${NC}"
    (cd backend && npm run test:unit) || EXIT_CODE=1
    echo ""

    echo -e "${CYAN}>>> Backend integration tests${NC}"
    (cd backend && npm run test:integration) || EXIT_CODE=1
    echo ""
  fi

  if [ "$ADMIN" = true ]; then
    echo -e "${CYAN}>>> Admin typecheck${NC}"
    (cd admin && npx tsc --noEmit) || EXIT_CODE=1
    echo ""

    echo -e "${CYAN}>>> Admin tests${NC}"
    (cd admin && npm run test) || EXIT_CODE=1
    echo ""
  fi

  if [ "$PRISMA" = true ]; then
    echo -e "${YELLOW}>>> Prisma schema validation${NC}"
    (cd backend && npx prisma validate) || EXIT_CODE=1
    echo ""
  fi

  echo ""
  if [ "$EXIT_CODE" -eq 0 ]; then
    echo -e "${GREEN}All tests passed!${NC}"
  else
    echo -e "${RED}Some tests failed. See output above.${NC}"
  fi

  exit $EXIT_CODE
fi
