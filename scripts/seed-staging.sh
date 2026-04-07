#!/bin/bash
# ──────────────────────────────────────────────────────────
# Seed staging database with realistic data
# Usage: ./scripts/seed-staging.sh [--reset] [--edge-cases] [--help]
# ──────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Flags
RESET=false
EDGE_CASES=false
SKIP_CONFIRM=false

usage() {
  echo "Usage: $0 [OPTIONS]"
  echo ""
  echo "Seed the staging database with realistic test data."
  echo ""
  echo "Options:"
  echo "  --reset         Drop and recreate the database before seeding"
  echo "  --edge-cases    Also seed edge case scenarios after main staging data"
  echo "  --yes, -y       Skip confirmation prompts"
  echo "  --help, -h      Show this help message"
  echo ""
  echo "Examples:"
  echo "  $0                        # Seed staging data only"
  echo "  $0 --edge-cases           # Seed staging + edge cases"
  echo "  $0 --reset --edge-cases   # Reset DB, then seed everything"
  echo "  $0 --reset -y             # Reset DB without confirmation"
  echo ""
  echo "Environment:"
  echo "  DATABASE_URL must be set (via .env or environment variable)"
  echo "  NODE_ENV should be 'staging' or 'development'"
  echo ""
  echo "Test Accounts Created:"
  echo "  Admin CMS:  admin@staging.kidslearning.app / staging123"
  echo "  Editor CMS: editor@staging.kidslearning.app / staging123"
  echo "  Free parent:    free@staging.test / parent123"
  echo "  Trial parent:   trial@staging.test / parent123"
  echo "  Premium parent: premium@staging.test / parent123"
}

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --reset)
      RESET=true
      shift
      ;;
    --edge-cases)
      EDGE_CASES=true
      shift
      ;;
    --yes|-y)
      SKIP_CONFIRM=true
      shift
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      usage
      exit 1
      ;;
  esac
done

# ── Safety checks ──────────────────────────────────────────

# Check we are not accidentally running against production
if [ -f "$BACKEND_DIR/.env" ]; then
  DB_URL=$(grep -E '^DATABASE_URL=' "$BACKEND_DIR/.env" 2>/dev/null | head -1 || true)
  if echo "$DB_URL" | grep -qi 'production\|prod\.'; then
    echo -e "${RED}ABORT: DATABASE_URL appears to point to a production database!${NC}"
    echo "This script should only be run against staging or development databases."
    exit 1
  fi
fi

if [ "${NODE_ENV:-}" = "production" ]; then
  echo -e "${RED}ABORT: NODE_ENV is set to 'production'. This script is for staging only.${NC}"
  exit 1
fi

# Check tsx is available
if ! command -v npx &> /dev/null; then
  echo -e "${RED}Error: npx is not available. Please install Node.js.${NC}"
  exit 1
fi

# ── Main logic ─────────────────────────────────────────────

echo -e "${BLUE}=== Kids Learning App: Staging Database Seeder ===${NC}"
echo ""

# Show what we are about to do
echo "Actions to perform:"
if [ "$RESET" = true ]; then
  echo -e "  ${YELLOW}[1] Reset database (prisma migrate reset)${NC}"
fi
echo -e "  ${GREEN}[$([ "$RESET" = true ] && echo "2" || echo "1")] Run staging seed (seed-staging.ts)${NC}"
if [ "$EDGE_CASES" = true ]; then
  echo -e "  ${GREEN}[$([ "$RESET" = true ] && echo "3" || echo "2")] Run edge case seed (seed-edge-cases.ts)${NC}"
fi
echo ""

# Confirm
if [ "$SKIP_CONFIRM" = false ]; then
  read -p "Continue? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 0
  fi
fi

cd "$BACKEND_DIR"

# Step 1: Reset database if requested
if [ "$RESET" = true ]; then
  echo ""
  echo -e "${YELLOW}Resetting database...${NC}"
  npx prisma migrate reset --force --skip-seed
  echo -e "${GREEN}Database reset complete.${NC}"
fi

# Generate Prisma client (ensure it is up to date)
echo ""
echo -e "${BLUE}Generating Prisma client...${NC}"
npx prisma generate
echo -e "${GREEN}Prisma client generated.${NC}"

# Step 2: Run staging seed
echo ""
echo -e "${BLUE}Running staging seed...${NC}"
npx tsx prisma/seed-staging.ts
STAGING_EXIT=$?

if [ $STAGING_EXIT -ne 0 ]; then
  echo -e "${RED}Staging seed failed with exit code $STAGING_EXIT${NC}"
  exit $STAGING_EXIT
fi
echo -e "${GREEN}Staging seed complete.${NC}"

# Step 3: Run edge case seed if requested
if [ "$EDGE_CASES" = true ]; then
  echo ""
  echo -e "${BLUE}Running edge case seed...${NC}"
  npx tsx prisma/seed-edge-cases.ts
  EDGE_EXIT=$?

  if [ $EDGE_EXIT -ne 0 ]; then
    echo -e "${RED}Edge case seed failed with exit code $EDGE_EXIT${NC}"
    exit $EDGE_EXIT
  fi
  echo -e "${GREEN}Edge case seed complete.${NC}"
fi

# ── Summary ────────────────────────────────────────────────

echo ""
echo -e "${GREEN}=== Seeding Complete ===${NC}"
echo ""
echo "CMS admin accounts (password: staging123):"
echo "  admin@staging.kidslearning.app"
echo "  editor@staging.kidslearning.app"
echo "  reviewer@staging.kidslearning.app"
echo "  viewer@staging.kidslearning.app"
echo ""
echo "Parent accounts (password: parent123):"
echo "  free@staging.test      (Free plan)"
echo "  trial@staging.test     (Trial, 7 days left)"
echo "  premium@staging.test   (Premium annual)"
echo "  expired@staging.test   (Expired subscription)"
echo "  multi1@staging.test    (Family plan, 4 kids)"
echo ""

if [ "$EDGE_CASES" = true ]; then
  echo "Edge case accounts (password: parent123):"
  echo "  maxkids@edge.test     (5 child profiles)"
  echo "  expiring@edge.test    (Sub expires in ~1 hour)"
  echo "  maxstars@edge.test    (Child with 99999 stars)"
  echo ""
fi

echo "You can now start the backend with: cd backend && npm run dev"
