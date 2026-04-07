# CI/CD Pipeline Architecture

This document covers the complete CI/CD pipeline setup for the Kids Learning Fun monorepo.

## Pipeline Overview

```
Push / PR
    |
    v
+-------------------+
| Detect Changes    |  (dorny/paths-filter)
+-------------------+
    |
    v
+-------------------+
| Install & Cache   |  (npm ci, actions/cache)
+-------------------+
    |
    +----+----+----+----+
    |    |    |    |    |
    v    v    v    v    v
 Lint  BE   FE  Admin Build
 +TC  Tests Tests Tests Verify
    |    |    |    |    |
    +----+----+----+----+
              |
              v
      +--------------+
      | E2E Smoke    |  (main branch or label only)
      +--------------+
              |
              v
      +--------------+
      | CI Status    |  (final gate)
      +--------------+
```

## Workflow Files

| File | Trigger | Purpose |
|------|---------|---------|
| `test.yml` | Push to main/develop, PR to main | Original test suite (kept for backward compat) |
| `ci.yml` | Push to main/develop, PR to main/develop | Primary CI with change detection |
| `deploy.yml` | Version tags (`v*`), manual dispatch | Build images, deploy to environments |
| `preview.yml` | PR open/sync/close | Ephemeral preview environments |
| `migration-check.yml` | PR touching `backend/prisma/**` | Database migration safety analysis |
| `security.yml` | Push, PR, weekly schedule | Dependency audit, secrets, licenses |

## Change Detection Strategy

The CI pipeline uses [dorny/paths-filter](https://github.com/dorny/paths-filter) to detect which packages were modified and only runs relevant jobs. This significantly reduces CI time for focused changes.

### Package Filters

| Package | Trigger Paths |
|---------|---------------|
| `frontend` | `src/**`, `public/**`, `package.json`, `package-lock.json`, `vite.config.ts`, `tsconfig*.json`, `index.html`, `eslint.config.js` |
| `backend` | `backend/**` |
| `admin` | `admin/**` |
| `e2e` | `e2e/**`, `.github/workflows/**` |
| `infra` | `docker-compose*.yml`, `**/Dockerfile*`, `nginx.conf`, `.github/workflows/**` |
| `prisma` | `backend/prisma/**` |

### Behavior on Main Branch

All jobs run on pushes to `main` regardless of change detection. This ensures the full suite passes before production deployments.

### Local Change Detection

Use the local script to replicate CI change detection:

```bash
# Detect changes vs main
./scripts/detect-changes.sh

# Detect changes vs develop
./scripts/detect-changes.sh develop

# Detect and automatically run affected tests
./scripts/detect-changes.sh --run-tests

# JSON output (for scripting)
./scripts/detect-changes.sh --json
```

## Cache Strategy

The pipeline caches `node_modules` for each package independently using content-addressable keys based on lockfile hashes.

| Cache | Key Pattern | Path |
|-------|-------------|------|
| Root | `root-deps-{os}-{hash(package-lock.json)}` | `node_modules/` |
| Backend | `backend-deps-{os}-{hash(backend/package-lock.json)}` | `backend/node_modules/` |
| Admin | `admin-deps-{os}-{hash(admin/package-lock.json)}` | `admin/node_modules/` |

### Cache Flow

1. The `install` job runs first and populates all caches
2. Subsequent jobs restore caches (no `npm ci` needed if cache hits)
3. Each job has a fallback `npm ci` in case of cache miss
4. Restore keys with prefix matching allow partial cache hits when lockfiles change

### Docker Build Cache

Deploy workflows use GitHub Actions cache for Docker layer caching:

```yaml
cache-from: type=gha
cache-to: type=gha,mode=max
```

## Required Checks and Branch Protection

### Recommended Branch Protection Rules for `main`

1. **Required status checks:**
   - `CI Status` (from ci.yml)
   - `Security Status` (from security.yml)

2. **Additional settings:**
   - Require branches to be up to date
   - Require PR reviews (1 reviewer minimum)
   - Dismiss stale PR approvals on new commits
   - Require conversation resolution

### How the Status Gate Works

The `ci-status` job in `ci.yml` runs with `if: always()` and evaluates all upstream jobs:

- **Lint & Typecheck**: Must pass (always runs)
- **Build Verification**: Must pass (always runs)
- **Backend/Frontend/Admin Tests**: Must pass when they run; `skipped` status is acceptable (means the package was not changed)
- **Migration Check**: Must pass when it runs (only runs when Prisma files change)

This design means:
- A frontend-only PR skips backend tests without failing
- A Prisma change triggers both backend tests and migration safety
- Pushes to main run everything

## Adding New Checks

### Adding a New Test Suite

1. Add the job to `ci.yml` with appropriate `if` condition:
   ```yaml
   new-tests:
     name: My New Tests
     needs: [install, changes]
     if: needs.changes.outputs.my-package == 'true' || github.ref == 'refs/heads/main'
     runs-on: ubuntu-latest
     timeout-minutes: 10
     steps:
       - uses: actions/checkout@v4
       - # restore cache, run tests...
   ```

2. Add the job to the `ci-status` job's `needs` list

3. Add a check in the status evaluation script

4. If new paths are needed, add a filter to the `changes` job

### Adding a New Package

1. Add path filters in the `changes` job
2. Add cache entries in the `install` job
3. Add test/build jobs with the package's `if` condition
4. Update `ci-status` to include the new jobs
5. Update `scripts/detect-changes.sh` with the new package paths

## Failure Handling and Debugging

### Reading CI Logs

1. Go to the **Actions** tab in GitHub
2. Click the failed workflow run
3. Expand the failed job and step
4. Look for lines prefixed with `::error::` or `::warning::`

### Common Failures

| Failure | Cause | Fix |
|---------|-------|-----|
| Cache miss + install fail | npm registry issue | Re-run the job |
| Typecheck fails | New TS errors | Fix the type errors locally |
| Bundle size exceeded | JS chunk > 200KB gzip | Code-split the large chunk |
| Migration safety: danger | DROP TABLE/COLUMN in migration | Add `migration-approved` label after review |
| Secret scan fail | Pattern match in code | Move secrets to GitHub Secrets, or mark as false positive |
| Lockfile out of sync | `package.json` changed without `npm install` | Run `npm install` and commit the lockfile |

### Reproducing CI Failures Locally

```bash
# 1. Detect what would run in CI
./scripts/detect-changes.sh

# 2. Run the same checks locally
# Typecheck (all packages)
npx tsc --noEmit
cd backend && npx tsc --noEmit && cd ..
cd admin && npx tsc --noEmit && cd ..

# Tests (targeted)
npm run test                            # Frontend
cd backend && npm run test:unit && cd .. # Backend unit
cd backend && npm run test:integration && cd .. # Backend integration
cd admin && npm run test && cd ..       # Admin

# Build
npm run build                           # Frontend
cd backend && npm run build && cd ..    # Backend
cd admin && npm run build && cd ..      # Admin

# Full CI simulation
./scripts/detect-changes.sh --run-tests
```

### Debugging Cache Issues

If you suspect stale caches are causing issues:

1. Change the cache key pattern (e.g., bump a version suffix)
2. Or delete caches via GitHub Actions UI: Settings > Actions > Caches

## Monorepo Task Targeting

### CI Matrix

| Change in... | Runs typecheck | Runs tests | Runs build | Runs migration check |
|-------------|:-:|:-:|:-:|:-:|
| `src/**` (frontend) | Frontend | Frontend | Frontend | - |
| `backend/**` | Backend | Backend (unit + integration + cert) | Backend | - |
| `backend/prisma/**` | Backend | Backend | Backend | Yes |
| `admin/**` | Admin | Admin | Admin | - |
| `e2e/**` | - | - | - | - |
| Main branch push | All | All | All | If prisma changed |

### Environment Variables

All CI jobs use these environment variables:

| Variable | Value | Purpose |
|----------|-------|---------|
| `NODE_ENV` | `test` | Signals test mode to all packages |
| `JWT_SECRET` | `ci-test-secret-key-for-testing` | Backend JWT signing (test only) |
| `DATABASE_URL` | `postgresql://test:test@localhost:5432/test_db` | Backend database (test only) |
| `REDIS_URL` | `redis://localhost:6379/1` | Backend Redis (test only) |
| `CORS_ORIGIN` | `http://localhost:5173` | Backend CORS config |

### Deployment Environments

| Environment | Trigger | URL |
|-------------|---------|-----|
| `dev` | Manual dispatch | `https://dev.kidslearningfun.app` |
| `staging` | Tags with `-rc`/`-beta` suffix, or manual | `https://staging.kidslearningfun.app` |
| `production` | Release tags (`v1.0.0`), or manual | `https://kidslearningfun.app` |

### Concurrency Groups

Each workflow uses a concurrency group to prevent conflicting runs:

| Workflow | Group | Cancel in-progress |
|----------|-------|:--:|
| CI | `ci-{ref}` | Yes |
| Deploy | `deploy-{environment}` | No |
| Preview | `preview-{pr-number}` | Yes |
| Security | `security-{ref}` | Yes |

Deploy workflows do NOT cancel in-progress runs to prevent partial deployments.
