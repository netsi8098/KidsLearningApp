# Kids Learning Fun -- Deployment Strategy

> Version 1.0 | Last updated: 2026-03-26

This document defines the deployment strategy for all components of the Kids Learning
platform: Frontend PWA, Admin Dashboard, Backend API, BullMQ Workers, and database
migrations. It covers progressive rollout, health gates, automatic rollback, and
sequencing.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Deployment Environments](#deployment-environments)
3. [Progressive Deployment](#progressive-deployment)
4. [Health-Based Gates](#health-based-gates)
5. [Automatic Halt and Rollback](#automatic-halt-and-rollback)
6. [Deployment Sequencing](#deployment-sequencing)
7. [Database Migration Strategy](#database-migration-strategy)
8. [Environment Variables and Secrets](#environment-variables-and-secrets)
9. [Monitoring and Alerting](#monitoring-and-alerting)

---

## Architecture Overview

```
                                +------------------+
                                |   CDN / Edge     |
                                | (CloudFront/CF)  |
                                +--------+---------+
                                         |
                         +---------------+----------------+
                         |                                |
                  +------+-------+                +-------+------+
                  | Frontend PWA |                | Admin Dash   |
                  | (nginx:alpine)|               | (nginx:alpine)|
                  | Port 80       |               | Port 80       |
                  +------+-------+                +-------+------+
                         |                                |
                         +----------- API Gateway --------+
                                         |
                               +---------+---------+
                               |   Backend API     |
                               |   (Express 4)     |
                               |   Port 4000       |
                               +---------+---------+
                                         |
                         +---------------+----------------+
                         |               |                |
                  +------+------+  +-----+-----+  +------+------+
                  |  PostgreSQL |  |   Redis    |  |   S3 / R2   |
                  |  (Prisma)   |  |  (BullMQ)  |  | (Media)     |
                  +-------------+  +-----+-----+  +-------------+
                                         |
                               +---------+---------+
                               |  BullMQ Workers   |
                               |  7 queues         |
                               +-------------------+
```

### Component Inventory

| Component | Image | Replicas (prod) | Strategy |
|-----------|-------|-----------------|----------|
| Frontend PWA | `nginx:alpine` + Vite build | 2 (behind CDN) | Blue-green |
| Admin Dashboard | `nginx:alpine` + Vite build | 2 (behind CDN) | Blue-green |
| Backend API | `node:20-alpine` | 3+ | Canary |
| BullMQ Workers | `node:20-alpine` | 2+ | Rolling |
| PostgreSQL | `postgres:16-alpine` | 1 primary + read replica | N/A (managed) |
| Redis | `redis:7-alpine` | 1 (or managed) | N/A (managed) |

---

## Deployment Environments

| Environment | Purpose | Deploy Trigger | Approval |
|-------------|---------|----------------|----------|
| `dev` | Feature development | Push to feature branch | None |
| `staging` | Integration testing | Push to `main` | None |
| `production` | Live users | Manual promotion from staging | Required |

### Environment Parity

All environments run the same Docker images with environment-specific configuration
injected via environment variables. The only differences are:

- Database connection strings
- Redis URLs
- S3 bucket names
- JWT secrets and API keys
- Rate limiting thresholds
- Log verbosity levels
- CORS origins

---

## Progressive Deployment

### API: Canary Deployment

The API uses canary deployment to minimize blast radius for backend changes.

```
Phase 1: Canary (5% traffic)
+---------------------------------------------+
| Load Balancer                                |
|  +-------+  +-------+  +-------+  +-------+ |
|  | v1    |  | v1    |  | v1    |  | v2    | |
|  | (25%) |  | (25%) |  | (25%) |  | (5%)  | |
|  +-------+  +-------+  +-------+  +-------+ |
|                              95%       5%    |
+---------------------------------------------+

Phase 2: Expand (25% traffic)     -- after 15 min healthy
Phase 3: Expand (50% traffic)     -- after 15 min healthy
Phase 4: Full rollout (100%)      -- after 15 min healthy
Phase 5: Decommission old (0%)    -- after 30 min stable
```

**Canary procedure:**

1. Build and tag new API image: `kidslearn-api:${GIT_SHA}`
2. Deploy 1 canary instance with the new image
3. Configure load balancer to route 5% of traffic to canary
4. Monitor for 15 minutes:
   - Error rate delta vs baseline < 0.5%
   - p95 latency delta vs baseline < 100ms
   - No new error signatures in logs
5. If healthy, increase to 25% and repeat monitoring
6. Continue to 50%, then 100%
7. After 30 minutes at 100%, decommission old instances
8. If any gate fails, immediately route 100% back to old instances

### Frontend PWA: Blue-Green Deployment

The frontend uses blue-green deployment via CDN origin switching.

```
Before deploy:
  CDN --> [Blue: v1 origin bucket/prefix]     <-- ACTIVE
          [Green: empty or previous version]

During deploy:
  CDN --> [Blue: v1 origin bucket/prefix]     <-- ACTIVE
          [Green: v2 built and verified]       <-- STANDBY

After switch:
  CDN --> [Blue: v1 kept for rollback]         <-- STANDBY
          [Green: v2 origin bucket/prefix]     <-- ACTIVE
```

**Blue-green procedure:**

1. Build frontend: `npm run build` produces `dist/` with hashed assets
2. Upload `dist/` to the inactive origin (e.g., S3 prefix `frontend/green/`)
3. Run smoke tests against the inactive origin directly:
   - `index.html` loads and returns 200
   - `manifest.webmanifest` is valid JSON
   - Critical JS chunks are accessible
   - Service worker `sw.js` is present
4. Switch CDN origin to point at the new prefix
5. Invalidate CDN cache for: `/index.html`, `/sw.js`, `/manifest.webmanifest`
6. Verify live site loads correctly
7. Keep old origin for 24 hours for rollback

### Workers: Rolling Deployment

Workers use rolling deployment with job draining to prevent data loss.

```
Timeline:
  t=0    Worker-1: drain()  Worker-2: [running]  Worker-3: [running]
  t=30s  Worker-1: replace  Worker-2: [running]  Worker-3: [running]
  t=45s  Worker-1: [v2 OK]  Worker-2: drain()    Worker-3: [running]
  t=75s  Worker-1: [v2 OK]  Worker-2: replace    Worker-3: [running]
  t=90s  Worker-1: [v2 OK]  Worker-2: [v2 OK]    Worker-3: drain()
  t=120s Worker-1: [v2 OK]  Worker-2: [v2 OK]    Worker-3: [v2 OK]
```

**Rolling procedure:**

1. Select one worker instance
2. Send `SIGTERM` -- triggers graceful shutdown:
   a. Stop accepting new jobs (`worker.pause()`)
   b. Wait for active jobs to complete (30s timeout)
   c. If timeout, force-close (jobs return to queue for retry)
   d. Disconnect from Redis
   e. Exit
3. Replace with new image
4. Verify new worker is processing jobs:
   - Check logs for successful job completions
   - Verify queue backlog is not growing
5. Repeat for next worker instance
6. Never drain more than 1 worker at a time (maintain capacity)

---

## Health-Based Gates

Every deployment phase transition requires passing health gates. No exceptions.

### API Health Gates

| Check | Endpoint/Metric | Pass Criteria | Frequency |
|-------|----------------|---------------|-----------|
| Liveness | `GET /health` | Returns 200 with `{"status":"ok"}` | Every 10s |
| Readiness | `GET /health` | Response time < 500ms p95 | Every 10s |
| Error rate | Application metrics | < 1% 5xx responses | Continuous |
| Latency | Application metrics | p95 < 500ms, p99 < 1000ms | Continuous |
| Database | Prisma connection pool | Pool not exhausted, queries < 1s | Every 30s |
| Redis | IORedis connection | Connected, ping < 10ms | Every 30s |

### Worker Health Gates

| Check | Method | Pass Criteria | Frequency |
|-------|--------|---------------|-----------|
| Process alive | `pgrep -f "node dist/worker.js"` | Process exists | Every 30s |
| Redis connected | Worker logs / metrics | Connection established | Every 30s |
| Queue backlog | `Queue.getWaitingCount()` | Not growing continuously | Every 60s |
| Job failure rate | `Queue.getFailedCount()` delta | < 1% of completed | Every 60s |
| Processing rate | Jobs completed per minute | > 0 (if queue non-empty) | Every 60s |
| Last success | Timestamp of last completed job | < 5 minutes ago (if queue non-empty) | Every 60s |

### Frontend Health Gates

| Check | Method | Pass Criteria | Frequency |
|-------|--------|---------------|-----------|
| Index HTML | `GET /` via CDN | Returns 200, contains `<div id="root">` | Every 30s |
| Manifest | `GET /manifest.webmanifest` | Returns 200, valid JSON | Every 30s |
| Service worker | `GET /sw.js` | Returns 200, valid JS | Every 30s |
| Critical chunks | `GET /assets/index-*.js` | Returns 200 | Post-deploy |
| CDN cache | Response headers | `x-cache: Hit` after warmup | Post-deploy |

### Database Health Gates

| Check | Method | Pass Criteria |
|-------|--------|---------------|
| Connection pool | `SELECT 1` via Prisma | < 50ms |
| Long queries | `pg_stat_activity` | No queries > 30s |
| Migration status | `prisma migrate status` | No pending migrations |
| Replication lag | `pg_stat_replication` | < 1s lag |
| Disk space | System metrics | < 80% used |

---

## Automatic Halt and Rollback

### Halt Conditions (Canary Pause)

These conditions pause the canary progression but do NOT roll back. Manual
investigation is required before proceeding or rolling back.

| Condition | Threshold | Window | Action |
|-----------|-----------|--------|--------|
| Elevated error rate | > 2% but < 5% | 5 minutes | Pause canary, alert on-call |
| Elevated latency | p95 > 1.5x baseline | 5 minutes | Pause canary, alert on-call |
| Queue backlog growth | > 5x normal | 5 minutes | Pause worker deploy |
| Memory pressure | > 85% container limit | 2 minutes | Pause canary, investigate |

### Automatic Rollback Conditions

These conditions trigger immediate, automatic rollback with no human intervention.

| Condition | Threshold | Window | Action |
|-----------|-----------|--------|--------|
| Error rate spike | > 5% sustained | 2 minutes | Route 100% to old version |
| Latency spike | p95 > 2x baseline | 2 minutes | Route 100% to old version |
| Health check failure | Any 5xx on `/health` | 3 consecutive | Route 100% to old version |
| Crash loop | Container restart > 3 | 5 minutes | Revert to previous image |
| Queue total failure | 100% job failure rate | 1 minute | Stop new worker, revert |
| Database connection | Pool exhausted | 30 seconds | Revert API, investigate DB |

### Rollback Execution

```
                    Detect anomaly
                         |
                    +----v----+
                    | Is this |
                    | within  |--YES--> Pause canary,
                    | halt    |         alert on-call
                    | range?  |
                    +----+----+
                         | NO (exceeds rollback threshold)
                    +----v----+
                    | Auto    |
                    | Rollback|
                    +---------+
                         |
              +----------+----------+
              |          |          |
         +----v---+ +----v---+ +---v----+
         |  API:  | |Workers:| |Frontend:|
         | Route  | | Stop   | | Switch  |
         | to old | | new,   | | CDN to  |
         | image  | | start  | | old     |
         |        | | old    | | origin  |
         +--------+ +--------+ +--------+
                         |
                    Alert on-call
                    Open incident
```

---

## Deployment Sequencing

The order of deployment is critical. Components MUST be deployed in this sequence
to maintain backward compatibility.

```
Step 1: Database Migration (expand phase)
    |
    |   Only additive, backward-compatible changes:
    |   - New tables, new nullable columns, new indexes
    |   - Old code continues to work against new schema
    |
    v
Step 2: Deploy API (canary --> full)
    |
    |   New API code handles both old and new schema features.
    |   New endpoints are added but old ones remain.
    |
    v
Step 3: Deploy Workers (rolling, drain first)
    |
    |   Workers handle both v1 and v2 job payloads.
    |   Old jobs complete with old logic before replacement.
    |
    v
Step 4: Deploy Frontend PWA (blue-green CDN switch)
    |
    |   New frontend uses new API endpoints.
    |   Old cached frontends still work with new API (backward compat).
    |
    v
Step 5: Deploy Admin Dashboard (blue-green CDN switch)
    |
    |   Admin uses new API features for content management.
    |
    v
Step 6: Contract Phase Migration (after N days)
    |
    |   Remove old columns, old tables, old indexes.
    |   Only after confirming no clients use old schema.
    |   Typical wait: 7-14 days.
    |
    v
    Done.
```

### Why This Order Matters

1. **Database first**: Schema must support both old and new code simultaneously.
   Expand-phase migrations are always safe to apply because they only add.

2. **API before Frontend**: The frontend depends on API endpoints. Deploying API
   first ensures new endpoints exist before the frontend tries to call them.

3. **Workers after API**: Workers may be triggered by API requests. The API must
   be ready to enqueue jobs in the new format before workers expect them. Workers
   also handle both old and new formats during the transition.

4. **Frontend before Admin**: Parent-facing app takes priority over internal tools.
   Admin changes are lower risk and can follow.

5. **Contract phase last**: Only remove old schema elements after all components
   are confirmed on the new version and enough time has passed for cached clients
   to update.

### Sequencing Exceptions

- **Hotfix**: Skip canary phases, deploy directly to all instances. Still follow
  the component order (DB -> API -> Workers -> Frontend).
- **Infrastructure only**: Changes to nginx config, Docker base images, or
  environment variables can be deployed independently.
- **Feature flag guarded**: If a change is behind a feature flag, the deployment
  order is less critical since the flag controls activation.

---

## Database Migration Strategy

### Expand-Contract Pattern

Every schema change follows the expand-contract pattern:

```
EXPAND PHASE (deployed with Step 1):
  - Add new column (nullable or with default)
  - Add new table
  - Add new index
  - Create new view

  Old code: works fine, ignores new columns/tables
  New code: can start using new columns/tables

CONTRACT PHASE (deployed with Step 6, days later):
  - Drop old column
  - Drop old table
  - Remove old index
  - Rename column (if needed, done as add-new + migrate + drop-old)

  Precondition: all clients confirmed on new version
```

### Migration Execution

```bash
# In CI/CD pipeline, Step 1:
cd backend
npx prisma migrate deploy    # Applies pending migrations
npx prisma generate          # Regenerates Prisma client (if needed)

# Verify migration:
npx prisma migrate status    # Should show no pending
```

### Migration Safety Rules

1. Never rename a column in a single migration -- use add/copy/drop across releases
2. Never drop a column in the expand phase
3. Always add columns as nullable or with a default value
4. Test migrations against a copy of production data before deploying
5. Keep migrations small and focused -- one concern per migration file
6. Lock timeout: set `statement_timeout` to 5s for DDL to avoid long locks

---

## Environment Variables and Secrets

### Secret Management

- **Development**: `.env` files (git-ignored)
- **Staging/Production**: Injected via container orchestrator (ECS task definitions,
  Kubernetes secrets, or similar)
- **Rotation**: JWT secrets rotated quarterly; database passwords rotated monthly
- **Access**: Only the CI/CD pipeline and on-call engineers can access production secrets

### Required Variables Per Service

**API (`backend/`):**
```
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
NODE_ENV=production
PORT=4000
JWT_SECRET=<rotated secret>
CORS_ORIGIN=https://kidslearningfun.app
STORAGE_PROVIDER=s3
AWS_S3_BUCKET=kidslearn-media-prod
AWS_REGION=us-east-1
```

**Workers (`backend/`, worker entrypoint):**
```
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
NODE_ENV=production
STORAGE_PROVIDER=s3
AWS_S3_BUCKET=kidslearn-media-prod
WORKER_MEDIA_CONCURRENCY=2
WORKER_AI_CONCURRENCY=1
```

**Frontend (`dist/` served by nginx):**
```
# Build-time only (baked into JS bundle via Vite):
VITE_API_URL=https://api.kidslearningfun.app
```

---

## Monitoring and Alerting

### Key Metrics Per Component

**API:**
- Request rate (rpm)
- Error rate (5xx / total)
- p50, p95, p99 latency
- Active database connections
- Redis connection status

**Workers:**
- Jobs completed per minute
- Job failure rate
- Queue depth (waiting + delayed)
- Average job duration
- Redis memory usage

**Frontend:**
- CDN cache hit ratio
- Service worker registration rate
- Core Web Vitals (LCP, FID, CLS)
- Offline capability check
- PWA install rate

### Alert Thresholds

| Alert | Severity | Condition | Notify |
|-------|----------|-----------|--------|
| API down | P1 | Health check fails 3x | On-call + Slack |
| Error rate high | P2 | > 5% for 5 min | On-call |
| Latency degraded | P3 | p95 > 1s for 10 min | Slack |
| Queue backlog | P2 | > 1000 waiting jobs | On-call |
| Worker crash | P2 | Container restart > 3 in 10 min | On-call |
| DB connection pool | P1 | > 90% utilized | On-call + Slack |
| Disk space | P2 | > 80% on any volume | Slack |
| SSL cert expiry | P3 | < 14 days to expiry | Slack |

### Post-Deployment Verification Checklist

After every production deployment, verify:

- [ ] `/health` endpoint returns 200 on all API instances
- [ ] Frontend loads in browser, no console errors
- [ ] Admin dashboard loads and authenticates
- [ ] At least one queue processes a test job successfully
- [ ] CDN cache is warming (cache hit ratio increasing)
- [ ] No new error patterns in application logs
- [ ] Database connection pool is stable
- [ ] Redis memory is not spiking
