#!/bin/bash
# ============================================================
# Kids Learning Fun -- Deployment Orchestration Script
# ============================================================
# Usage:
#   ./scripts/deploy.sh <environment> [service] [flags]
#
# Environments:
#   dev         - Development (direct deploy, no gates)
#   staging     - Staging (canary API, blue-green frontend)
#   production  - Production (full progressive deployment)
#
# Services:
#   all         - Deploy all services in correct order (default)
#   frontend    - Frontend PWA only
#   admin       - Admin dashboard only
#   api         - Backend API only
#   worker      - BullMQ workers only
#   migrate     - Database migration only
#
# Flags:
#   --skip-tests    Skip pre-deploy test suite
#   --skip-build    Skip Docker build (use existing images)
#   --force         Skip confirmation prompts
#   --dry-run       Show what would be done without executing
#
# Examples:
#   ./scripts/deploy.sh staging all
#   ./scripts/deploy.sh production api
#   ./scripts/deploy.sh production frontend --skip-tests
#   ./scripts/deploy.sh staging migrate --dry-run
# ============================================================

set -euo pipefail

# ── Configuration ────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Docker registry (override with DOCKER_REGISTRY env var)
REGISTRY="${DOCKER_REGISTRY:-ghcr.io/kidslearningfun}"

# Image names
API_IMAGE="${REGISTRY}/api"
WORKER_IMAGE="${REGISTRY}/worker"
FRONTEND_IMAGE="${REGISTRY}/frontend"
ADMIN_IMAGE="${REGISTRY}/admin"

# Git SHA for tagging
GIT_SHA="$(git -C "$PROJECT_ROOT" rev-parse --short HEAD 2>/dev/null || echo 'unknown')"
GIT_BRANCH="$(git -C "$PROJECT_ROOT" rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'unknown')"
DEPLOY_TIMESTAMP="$(date -u +%Y%m%d%H%M%S)"
IMAGE_TAG="${GIT_SHA}-${DEPLOY_TIMESTAMP}"

# Canary settings
CANARY_PHASES=(5 25 50 100)
CANARY_WAIT_SECONDS=900  # 15 minutes between phases

# Health check settings
HEALTH_CHECK_RETRIES=10
HEALTH_CHECK_INTERVAL=5  # seconds

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ── Parse Arguments ──────────────────────────────────────────

ENVIRONMENT="${1:-}"
SERVICE="${2:-all}"
SKIP_TESTS=false
SKIP_BUILD=false
FORCE=false
DRY_RUN=false

shift 2 2>/dev/null || true

for arg in "$@"; do
  case $arg in
    --skip-tests) SKIP_TESTS=true ;;
    --skip-build) SKIP_BUILD=true ;;
    --force)      FORCE=true ;;
    --dry-run)    DRY_RUN=true ;;
    *)            echo "Unknown flag: $arg"; exit 1 ;;
  esac
done

# ── Helper Functions ─────────────────────────────────────────

log_info()    { echo -e "${BLUE}[INFO]${NC}  $*"; }
log_success() { echo -e "${GREEN}[OK]${NC}    $*"; }
log_warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
log_error()   { echo -e "${RED}[ERROR]${NC} $*"; }
log_step()    { echo -e "\n${GREEN}=== $* ===${NC}\n"; }

run_cmd() {
  if [ "$DRY_RUN" = true ]; then
    log_info "[DRY RUN] $*"
    return 0
  fi
  "$@"
}

confirm() {
  if [ "$FORCE" = true ] || [ "$DRY_RUN" = true ]; then
    return 0
  fi
  local message="$1"
  echo -e "${YELLOW}$message${NC}"
  read -r -p "Continue? (y/N) " response
  case "$response" in
    [yY][eE][sS]|[yY]) return 0 ;;
    *) log_warn "Aborted by user."; exit 1 ;;
  esac
}

# ── Validation ───────────────────────────────────────────────

validate_environment() {
  case "$ENVIRONMENT" in
    dev|staging|production) ;;
    *)
      log_error "Invalid environment: '$ENVIRONMENT'"
      echo "  Valid environments: dev, staging, production"
      exit 1
      ;;
  esac
}

validate_service() {
  case "$SERVICE" in
    all|frontend|admin|api|worker|migrate) ;;
    *)
      log_error "Invalid service: '$SERVICE'"
      echo "  Valid services: all, frontend, admin, api, worker, migrate"
      exit 1
      ;;
  esac
}

validate_prerequisites() {
  local missing=()

  command -v docker >/dev/null 2>&1 || missing+=("docker")
  command -v git    >/dev/null 2>&1 || missing+=("git")

  if [ ${#missing[@]} -gt 0 ]; then
    log_error "Missing required tools: ${missing[*]}"
    exit 1
  fi

  # Verify we're in the project root
  if [ ! -f "$PROJECT_ROOT/package.json" ]; then
    log_error "Cannot find project root. Run from the KidsLearningApp directory."
    exit 1
  fi

  # Verify git working directory is clean (for production)
  if [ "$ENVIRONMENT" = "production" ]; then
    if [ -n "$(git -C "$PROJECT_ROOT" status --porcelain 2>/dev/null)" ]; then
      log_warn "Git working directory has uncommitted changes."
      confirm "Deploying production with uncommitted changes is not recommended."
    fi
  fi
}

# ── Health Checks ────────────────────────────────────────────

check_api_health() {
  local url="$1"
  local retries="${2:-$HEALTH_CHECK_RETRIES}"

  for i in $(seq 1 "$retries"); do
    if curl -sf --max-time 5 "$url/health" >/dev/null 2>&1; then
      log_success "API health check passed: $url"
      return 0
    fi
    log_info "Health check attempt $i/$retries..."
    sleep "$HEALTH_CHECK_INTERVAL"
  done

  log_error "API health check FAILED after $retries attempts: $url"
  return 1
}

check_frontend_health() {
  local url="$1"
  local retries="${2:-$HEALTH_CHECK_RETRIES}"

  for i in $(seq 1 "$retries"); do
    local status
    status=$(curl -sf --max-time 5 -o /dev/null -w "%{http_code}" "$url/" 2>/dev/null || echo "000")
    if [ "$status" = "200" ]; then
      log_success "Frontend health check passed: $url"
      return 0
    fi
    log_info "Frontend health check attempt $i/$retries (status: $status)..."
    sleep "$HEALTH_CHECK_INTERVAL"
  done

  log_error "Frontend health check FAILED after $retries attempts: $url"
  return 1
}

check_worker_health() {
  local container="$1"
  local retries="${2:-$HEALTH_CHECK_RETRIES}"

  for i in $(seq 1 "$retries"); do
    if docker inspect --format='{{.State.Health.Status}}' "$container" 2>/dev/null | grep -q "healthy"; then
      log_success "Worker health check passed: $container"
      return 0
    fi
    log_info "Worker health check attempt $i/$retries..."
    sleep "$HEALTH_CHECK_INTERVAL"
  done

  log_error "Worker health check FAILED: $container"
  return 1
}

# ── Build Functions ──────────────────────────────────────────

build_api() {
  log_step "Building API image"
  run_cmd docker build \
    -t "$API_IMAGE:$IMAGE_TAG" \
    -t "$API_IMAGE:latest" \
    -f "$PROJECT_ROOT/backend/Dockerfile" \
    "$PROJECT_ROOT/backend"
  log_success "API image built: $API_IMAGE:$IMAGE_TAG"
}

build_worker() {
  log_step "Building Worker image"
  run_cmd docker build \
    -t "$WORKER_IMAGE:$IMAGE_TAG" \
    -t "$WORKER_IMAGE:latest" \
    -f "$PROJECT_ROOT/backend/Dockerfile.worker" \
    "$PROJECT_ROOT/backend"
  log_success "Worker image built: $WORKER_IMAGE:$IMAGE_TAG"
}

build_frontend() {
  log_step "Building Frontend image"
  run_cmd docker build \
    -t "$FRONTEND_IMAGE:$IMAGE_TAG" \
    -t "$FRONTEND_IMAGE:latest" \
    -f "$PROJECT_ROOT/Dockerfile" \
    "$PROJECT_ROOT"
  log_success "Frontend image built: $FRONTEND_IMAGE:$IMAGE_TAG"
}

build_admin() {
  log_step "Building Admin image"
  run_cmd docker build \
    -t "$ADMIN_IMAGE:$IMAGE_TAG" \
    -t "$ADMIN_IMAGE:latest" \
    -f "$PROJECT_ROOT/admin/Dockerfile" \
    "$PROJECT_ROOT/admin"
  log_success "Admin image built: $ADMIN_IMAGE:$IMAGE_TAG"
}

# ── Push Functions ───────────────────────────────────────────

push_image() {
  local image="$1"
  log_info "Pushing $image:$IMAGE_TAG"
  run_cmd docker push "$image:$IMAGE_TAG"
  run_cmd docker push "$image:latest"
  log_success "Pushed $image:$IMAGE_TAG"
}

# ── Test Functions ───────────────────────────────────────────

run_tests() {
  if [ "$SKIP_TESTS" = true ]; then
    log_warn "Skipping tests (--skip-tests flag)"
    return 0
  fi

  log_step "Running test suite"

  log_info "Running frontend tests..."
  run_cmd npm --prefix "$PROJECT_ROOT" run test

  log_info "Running backend tests..."
  run_cmd npm --prefix "$PROJECT_ROOT/backend" run test

  log_info "Running admin tests..."
  run_cmd npm --prefix "$PROJECT_ROOT/admin" run test

  log_success "All tests passed"
}

# ── Migration Function ───────────────────────────────────────

run_migration() {
  log_step "Running database migration"

  log_info "Checking migration status..."
  run_cmd docker compose -f "$PROJECT_ROOT/docker-compose.yml" \
    run --rm migrate npx prisma migrate status

  confirm "Apply pending migrations to $ENVIRONMENT?"

  run_cmd docker compose -f "$PROJECT_ROOT/docker-compose.yml" \
    --profile setup up migrate --abort-on-container-exit

  log_success "Database migration complete"
}

# ── Deploy Functions ─────────────────────────────────────────

deploy_api_dev() {
  log_step "Deploying API to dev"
  run_cmd docker compose -f "$PROJECT_ROOT/docker-compose.yml" \
    -f "$PROJECT_ROOT/docker-compose.override.yml" \
    up -d --build api
  check_api_health "http://localhost:4000"
}

deploy_api_staging() {
  log_step "Deploying API to staging (canary)"

  # For staging, use a simplified canary: deploy and verify
  push_image "$API_IMAGE"
  log_info "Deploying canary instance..."
  # In a real orchestrator, this would create a canary deployment.
  # For Docker Compose staging, we do a rolling update:
  run_cmd docker compose -f "$PROJECT_ROOT/docker-compose.yml" \
    up -d --no-deps api
  check_api_health "http://localhost:4000"
  log_success "API deployed to staging"
}

deploy_api_production() {
  log_step "Deploying API to production (canary)"

  push_image "$API_IMAGE"

  for phase in "${CANARY_PHASES[@]}"; do
    log_info "Canary phase: ${phase}% traffic to new version"

    if [ "$phase" -eq "${CANARY_PHASES[0]}" ]; then
      log_info "Deploying canary instance with tag $IMAGE_TAG..."
      # Placeholder: In production, this would use the orchestrator's
      # canary deployment API (e.g., ECS, Kubernetes, Nomad)
      run_cmd echo "DEPLOY_CANARY: image=$API_IMAGE:$IMAGE_TAG weight=$phase%"
    else
      log_info "Increasing traffic to ${phase}%..."
      run_cmd echo "UPDATE_CANARY: weight=$phase%"
    fi

    # Health check
    if ! check_api_health "http://localhost:4000" 5; then
      log_error "Health check failed during canary phase ${phase}%. HALTING."
      log_warn "Rolling back to previous version..."
      run_cmd echo "ROLLBACK_CANARY: restore previous version"
      exit 1
    fi

    if [ "$phase" -lt 100 ]; then
      log_info "Waiting ${CANARY_WAIT_SECONDS}s before next phase..."
      if [ "$DRY_RUN" = false ]; then
        sleep "$CANARY_WAIT_SECONDS"
      fi
    fi
  done

  log_success "API fully deployed to production"
}

deploy_worker_rolling() {
  log_step "Deploying workers (rolling)"

  push_image "$WORKER_IMAGE"

  # Get list of worker instances
  # In production, query the orchestrator. For Docker Compose:
  local worker_containers
  worker_containers=$(docker ps --filter "name=kidslearn-worker" --format "{{.Names}}" 2>/dev/null || echo "kidslearn-worker")

  for container in $worker_containers; do
    log_info "Draining worker: $container"

    # Send SIGTERM for graceful shutdown
    run_cmd docker kill --signal=SIGTERM "$container" 2>/dev/null || true

    # Wait for graceful shutdown (up to 45s)
    log_info "Waiting for graceful shutdown..."
    if [ "$DRY_RUN" = false ]; then
      local waited=0
      while docker ps --filter "name=$container" --format "{{.Names}}" | grep -q "$container" 2>/dev/null; do
        if [ $waited -ge 45 ]; then
          log_warn "Shutdown timeout. Force-stopping..."
          docker stop "$container" 2>/dev/null || true
          break
        fi
        sleep 5
        waited=$((waited + 5))
      done
    fi

    log_info "Starting new worker with image $WORKER_IMAGE:$IMAGE_TAG..."
    run_cmd docker compose -f "$PROJECT_ROOT/docker-compose.yml" \
      up -d --no-deps worker

    # Verify new worker is healthy
    sleep 10
    check_worker_health "kidslearn-worker" 6

    log_info "Worker $container updated successfully"
    log_info "Waiting 120s before next worker..."
    if [ "$DRY_RUN" = false ] && [ "$ENVIRONMENT" = "production" ]; then
      sleep 120
    fi
  done

  log_success "All workers updated"
}

deploy_frontend_blue_green() {
  local service_name="${1:-frontend}"
  local image="${2:-$FRONTEND_IMAGE}"
  local health_url="${3:-http://localhost:5173}"

  log_step "Deploying $service_name (blue-green)"

  push_image "$image"

  # Build new version
  log_info "Building new $service_name version..."

  # In production with CDN:
  # 1. Upload new dist/ to inactive origin prefix
  # 2. Verify inactive origin
  # 3. Switch CDN origin
  # 4. Invalidate CDN cache for non-hashed files
  #
  # For Docker Compose deployment:
  run_cmd docker compose -f "$PROJECT_ROOT/docker-compose.yml" \
    up -d --no-deps "$service_name"

  # Verify the new version is serving
  check_frontend_health "$health_url"

  # Invalidate CDN cache (if applicable)
  if [ "$ENVIRONMENT" = "production" ]; then
    log_info "Invalidating CDN cache for non-hashed files..."
    run_cmd echo "CDN_INVALIDATE: /index.html /sw.js /registerSW.js /manifest.webmanifest"
  fi

  log_success "$service_name deployed via blue-green"
}

# ── Main Deployment Orchestration ────────────────────────────

deploy_all() {
  log_step "Full deployment: $ENVIRONMENT"
  log_info "Git SHA: $GIT_SHA | Branch: $GIT_BRANCH | Tag: $IMAGE_TAG"

  confirm "Deploy ALL services to $ENVIRONMENT?"

  # Step 1: Run tests
  run_tests

  # Step 2: Build images (if not skipped)
  if [ "$SKIP_BUILD" = false ]; then
    build_api
    build_worker
    build_frontend
    build_admin
  fi

  # Step 3: Database migration
  log_info "Checking for pending migrations..."
  run_migration

  # Step 4: Deploy API
  case "$ENVIRONMENT" in
    dev)        deploy_api_dev ;;
    staging)    deploy_api_staging ;;
    production) deploy_api_production ;;
  esac

  # Step 5: Deploy Workers
  deploy_worker_rolling

  # Step 6: Deploy Frontend
  deploy_frontend_blue_green "frontend" "$FRONTEND_IMAGE" "http://localhost:5173"

  # Step 7: Deploy Admin
  deploy_frontend_blue_green "admin" "$ADMIN_IMAGE" "http://localhost:5174"

  log_step "Deployment complete!"
  log_info "Environment: $ENVIRONMENT"
  log_info "Image tag:   $IMAGE_TAG"
  log_info "Git SHA:     $GIT_SHA"
  log_info "Timestamp:   $(date -u +%Y-%m-%dT%H:%M:%SZ)"
}

deploy_single_service() {
  log_step "Deploying $SERVICE to $ENVIRONMENT"
  log_info "Git SHA: $GIT_SHA | Branch: $GIT_BRANCH | Tag: $IMAGE_TAG"

  confirm "Deploy $SERVICE to $ENVIRONMENT?"

  # Run tests unless skipped
  run_tests

  case "$SERVICE" in
    migrate)
      run_migration
      ;;
    api)
      if [ "$SKIP_BUILD" = false ]; then build_api; fi
      case "$ENVIRONMENT" in
        dev)        deploy_api_dev ;;
        staging)    deploy_api_staging ;;
        production) deploy_api_production ;;
      esac
      ;;
    worker)
      if [ "$SKIP_BUILD" = false ]; then build_worker; fi
      deploy_worker_rolling
      ;;
    frontend)
      if [ "$SKIP_BUILD" = false ]; then build_frontend; fi
      deploy_frontend_blue_green "frontend" "$FRONTEND_IMAGE" "http://localhost:5173"
      ;;
    admin)
      if [ "$SKIP_BUILD" = false ]; then build_admin; fi
      deploy_frontend_blue_green "admin" "$ADMIN_IMAGE" "http://localhost:5174"
      ;;
  esac

  log_step "$SERVICE deployment complete"
}

# ── Entry Point ──────────────────────────────────────────────

main() {
  echo ""
  echo "============================================"
  echo "  Kids Learning Fun -- Deploy"
  echo "============================================"
  echo ""

  # Validate inputs
  if [ -z "$ENVIRONMENT" ]; then
    log_error "Usage: $0 <environment> [service] [flags]"
    echo ""
    echo "  Environments: dev, staging, production"
    echo "  Services:     all, frontend, admin, api, worker, migrate"
    echo "  Flags:        --skip-tests, --skip-build, --force, --dry-run"
    echo ""
    exit 1
  fi

  validate_environment
  validate_service
  validate_prerequisites

  log_info "Environment: $ENVIRONMENT"
  log_info "Service:     $SERVICE"
  log_info "Image tag:   $IMAGE_TAG"
  log_info "Dry run:     $DRY_RUN"
  echo ""

  if [ "$SERVICE" = "all" ]; then
    deploy_all
  else
    deploy_single_service
  fi
}

main
