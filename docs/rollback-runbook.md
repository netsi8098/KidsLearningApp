# Kids Learning Fun -- Rollback & Disaster Recovery Runbook

> Version 1.0 | Last updated: 2026-03-26
> Audience: On-call engineers, DevOps, incident responders

This runbook provides step-by-step instructions for rolling back each component
of the Kids Learning platform and recovering from common failure scenarios.

---

## Table of Contents

1. [Recovery Time Objectives](#recovery-time-objectives)
2. [Decision Tree](#decision-tree)
3. [Frontend Rollback](#frontend-rollback)
4. [API Rollback](#api-rollback)
5. [Worker Rollback](#worker-rollback)
6. [Database Migration Rollback](#database-migration-rollback)
7. [Admin Dashboard Rollback](#admin-dashboard-rollback)
8. [Media Asset Recovery](#media-asset-recovery)
9. [Queue Backlog Recovery](#queue-backlog-recovery)
10. [Redis Failure Recovery](#redis-failure-recovery)
11. [Full-Stack Rollback](#full-stack-rollback)
12. [Post-Incident Checklist](#post-incident-checklist)

---

## Recovery Time Objectives

| Component | RTO (Recovery Time) | RPO (Data Loss Tolerance) | Priority |
|-----------|-------------------|--------------------------|----------|
| Frontend PWA | < 5 minutes | 0 (static assets) | P1 |
| Backend API | < 10 minutes | 0 (stateless) | P1 |
| BullMQ Workers | < 10 minutes | Jobs retry (0 loss) | P2 |
| Database | < 30 minutes | < 1 minute (WAL replay) | P1 |
| Admin Dashboard | < 15 minutes | 0 (static assets) | P3 |
| Media Assets (S3) | < 30 minutes | 0 (S3 versioning) | P2 |
| Redis | < 15 minutes | < 5 minutes (AOF) | P2 |

---

## Decision Tree

Use this flowchart to determine the correct rollback procedure.

```
START: Production issue detected
  |
  v
What is broken?
  |
  +-- Frontend (blank page, JS errors, PWA broken)
  |     |
  |     v
  |   Is it a CDN/cache issue?
  |     +-- YES --> Invalidate CDN cache (5 min fix)
  |     +-- NO  --> [Frontend Rollback] (Section 3)
  |
  +-- API (500 errors, timeouts, health check failing)
  |     |
  |     v
  |   Is the database healthy?
  |     +-- NO  --> [Database Recovery] (Section 7) first,
  |     |           then [API Rollback] if still needed
  |     +-- YES --> [API Rollback] (Section 4)
  |
  +-- Workers (jobs failing, backlog growing)
  |     |
  |     v
  |   Is Redis healthy?
  |     +-- NO  --> [Redis Recovery] (Section 10) first
  |     +-- YES --> Is it a code bug or resource issue?
  |           +-- Code bug    --> [Worker Rollback] (Section 5)
  |           +-- Resources   --> Scale up, don't rollback
  |
  +-- Database (connection errors, slow queries, data issues)
  |     |
  |     v
  |   Was a migration just applied?
  |     +-- YES --> [Migration Rollback] (Section 6)
  |     +-- NO  --> Check connection pool, disk space, replication
  |
  +-- Everything broken
        |
        v
        [Full-Stack Rollback] (Section 11)
```

---

## Frontend Rollback

**When to use**: The frontend PWA is broken, showing blank pages, JS errors, or
service worker issues after a deployment.

**Estimated time**: < 5 minutes

### Option A: CDN Origin Switch (Blue-Green Rollback)

If using blue-green deployment with CDN:

```bash
# 1. Identify the previous origin prefix
#    Check deployment log for the last known-good origin
PREVIOUS_ORIGIN="s3://kidslearn-frontend/blue"  # or whatever was active before

# 2. Switch CDN origin back to the previous version
#    CloudFront example:
aws cloudfront update-distribution \
  --id $DISTRIBUTION_ID \
  --origin-domain-name "$PREVIOUS_ORIGIN"

# 3. Invalidate CDN cache for non-hashed files
aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/index.html" "/sw.js" "/registerSW.js" "/manifest.webmanifest"

# 4. Wait for invalidation to propagate (usually < 60s)
aws cloudfront wait invalidation-completed \
  --distribution-id $DISTRIBUTION_ID \
  --id $INVALIDATION_ID

# 5. Verify the old version is serving
curl -s https://kidslearningfun.app/ | head -5
```

### Option B: Docker Compose Rollback

If using Docker Compose (staging or simple production):

```bash
# 1. Find the previous image tag
docker images kidslearn-frontend --format "{{.Tag}}" | head -5
# Example output:
#   abc1234-20260326120000   (current, broken)
#   def5678-20260325100000   (previous, known good)

PREVIOUS_TAG="def5678-20260325100000"

# 2. Update docker-compose to use the previous tag
# (or use the tag directly)
docker compose up -d --no-deps \
  -e FRONTEND_IMAGE_TAG=$PREVIOUS_TAG \
  frontend

# 3. Verify health
curl -sf http://localhost/health
```

### Option C: Service Worker Emergency Fix

If users have a cached broken SW that prevents the app from loading:

```bash
# The nuclear option: deploy a minimal sw.js that clears caches and
# forces reload. This is a temporary measure.

# 1. Create a minimal recovery service worker:
cat > /tmp/sw-recovery.js << 'SWEOF'
// Emergency recovery SW: clears all caches and unregisters itself
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', async (event) => {
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(names.map(name => caches.delete(name)))
    ).then(() => self.clients.claim())
     .then(() => self.clients.matchAll())
     .then(clients => clients.forEach(c => c.navigate(c.url)))
  );
});
SWEOF

# 2. Deploy this sw.js to the CDN/origin
aws s3 cp /tmp/sw-recovery.js s3://kidslearn-frontend/active/sw.js \
  --cache-control "no-store"

# 3. Invalidate CDN cache for sw.js
aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/sw.js"

# 4. Once users' browsers fetch the new sw.js, their caches will
#    be cleared and they'll get the latest version from the server.

# 5. IMPORTANT: Deploy the correct sw.js as soon as the real fix is ready.
```

### Verification After Frontend Rollback

- [ ] `curl -s https://kidslearningfun.app/` returns HTML with `<div id="root">`
- [ ] `curl -s https://kidslearningfun.app/manifest.webmanifest` returns valid JSON
- [ ] `curl -s https://kidslearningfun.app/sw.js` returns JavaScript
- [ ] Open the app in a browser -- main menu loads without errors
- [ ] Check browser DevTools > Console for errors
- [ ] Check browser DevTools > Application > Service Workers for status
- [ ] Test offline mode (airplane mode) -- cached version still works

---

## API Rollback

**When to use**: The API is returning 5xx errors, health checks are failing,
or latency is unacceptable after a deployment.

**Estimated time**: < 10 minutes

### Step 1: Identify the Previous Version

```bash
# List recent deployments / image tags
docker images kidslearn-api --format "table {{.Tag}}\t{{.CreatedAt}}" | head -10

# Or check deployment logs
git log --oneline -10  # Find the last known-good commit
```

### Step 2: Route Traffic Away from Bad Version

```bash
# If using canary deployment, route 100% to old instances:
# (Orchestrator-specific command)
echo "ROUTE_ALL_TRAFFIC: to=previous_version"

# If using Docker Compose:
docker compose stop api
```

### Step 3: Deploy Previous Version

```bash
PREVIOUS_TAG="def5678-20260325100000"

# Docker Compose:
docker compose up -d --no-deps api
# The compose file should reference the previous tag, or:
docker run -d \
  --name kidslearn-api \
  --env-file /path/to/.env.production \
  -p 4000:4000 \
  "kidslearn-api:$PREVIOUS_TAG"
```

### Step 4: Verify

```bash
# Health check
curl -sf http://localhost:4000/health
# Expected: {"status":"ok","timestamp":"..."}

# Check a few key endpoints
curl -sf http://localhost:4000/api/content?limit=1 | jq .
curl -sf http://localhost:4000/api/system/status | jq .

# Check error logs
docker logs kidslearn-api --tail 50 --since 5m
```

### Verification After API Rollback

- [ ] `/health` returns 200 with `{"status":"ok"}`
- [ ] Error rate returned to baseline (< 1%)
- [ ] p95 latency returned to baseline (< 500ms)
- [ ] Frontend can load data (test in browser)
- [ ] Admin dashboard can authenticate and list content
- [ ] No new error patterns in logs

---

## Worker Rollback

**When to use**: Workers are failing jobs at a high rate, crashing repeatedly,
or causing queue backlogs to grow uncontrollably.

**Estimated time**: < 10 minutes

### Step 1: Stop Failing Workers

```bash
# Graceful shutdown (allows active jobs to complete)
docker kill --signal=SIGTERM kidslearn-worker

# Wait up to 30s for graceful shutdown
sleep 30

# Force stop if still running
docker stop kidslearn-worker 2>/dev/null || true
```

### Step 2: Deploy Previous Worker Version

```bash
PREVIOUS_TAG="def5678-20260325100000"

# Deploy previous version
docker compose up -d --no-deps worker
# Or with explicit tag:
docker run -d \
  --name kidslearn-worker \
  --env-file /path/to/.env.production \
  "kidslearn-worker:$PREVIOUS_TAG"
```

### Step 3: Verify Queue Recovery

```bash
# Check worker is processing jobs (watch logs)
docker logs -f kidslearn-worker --since 1m

# Check queue depths are decreasing
# (Requires access to Redis or a queue dashboard)
docker exec kidslearn-redis redis-cli LLEN "bull:media-processing:wait"
docker exec kidslearn-redis redis-cli LLEN "bull:ai-generation:wait"
docker exec kidslearn-redis redis-cli LLEN "bull:content-release:wait"
docker exec kidslearn-redis redis-cli LLEN "bull:localization:wait"
docker exec kidslearn-redis redis-cli LLEN "bull:offline-packs:wait"
docker exec kidslearn-redis redis-cli LLEN "bull:analytics-aggregate:wait"
docker exec kidslearn-redis redis-cli LLEN "bull:content-qa:wait"
```

### Step 4: Handle Failed Jobs

```bash
# Count failed jobs per queue
for queue in media-processing ai-generation content-release localization offline-packs analytics-aggregate content-qa; do
  count=$(docker exec kidslearn-redis redis-cli LLEN "bull:$queue:failed" 2>/dev/null || echo "?")
  echo "$queue: $count failed"
done

# To retry all failed jobs in a queue (after root cause is fixed):
# Use BullMQ's built-in retry mechanism via the admin dashboard
# or a script that calls queue.retryJobs('failed')
```

### Verification After Worker Rollback

- [ ] Worker process is running (`docker ps | grep worker`)
- [ ] Worker logs show successful job processing
- [ ] Queue backlogs are stable or decreasing
- [ ] Failed job count has stopped increasing
- [ ] No new crash/restart events

---

## Database Migration Rollback

**When to use**: A recently applied database migration is causing errors. This is
the most delicate rollback because data may have been modified.

**Estimated time**: < 30 minutes

### Important: Expand vs Contract Phase

| Phase | Rollback Risk | Approach |
|-------|--------------|----------|
| **Expand** (add columns/tables) | LOW | New columns are nullable/defaulted; old code ignores them. Usually no rollback needed -- just fix forward. |
| **Contract** (drop columns/tables) | HIGH | Data may be lost. This is why we wait 7-14 days before contract phase. |

### Expand Phase Rollback (Usually Unnecessary)

Expand-phase migrations add nullable columns or new tables. Old code continues to
work because it ignores the new schema elements. In most cases, there is nothing
to roll back -- just fix the code and redeploy.

If the migration itself failed partway through:

```bash
# 1. Check migration status
cd backend
npx prisma migrate status

# 2. If a migration is marked as "failed", resolve it:
npx prisma migrate resolve --rolled-back $MIGRATION_NAME

# 3. Fix the migration file and try again
npx prisma migrate deploy
```

### Contract Phase Rollback (Emergency Only)

If a contract-phase migration dropped a column or table that is still needed:

```bash
# 1. STOP ALL DEPLOYMENTS IMMEDIATELY
# 2. Check if the data is recoverable

# Option A: If using PostgreSQL point-in-time recovery (PITR)
# Restore to a point before the migration was applied
pg_restore --target-time="2026-03-26 10:00:00" ...

# Option B: If the dropped column had a backup table
# (Best practice: always copy data before dropping)
psql -c "ALTER TABLE content ADD COLUMN old_field TEXT;"
psql -c "UPDATE content SET old_field = backup_content.old_field
         FROM backup_content WHERE content.id = backup_content.id;"

# Option C: Restore from the most recent backup
pg_restore -d kids_learning /backups/kids_learning_20260326_0000.dump
```

### Prisma-Specific Migration Commands

```bash
# View migration history
npx prisma migrate status

# Mark a failed migration as rolled back (does NOT undo schema changes)
npx prisma migrate resolve --rolled-back <migration-name>

# Mark a migration as applied (if you manually fixed the schema)
npx prisma migrate resolve --applied <migration-name>

# Regenerate Prisma client after schema changes
npx prisma generate

# Reset database completely (DEVELOPMENT ONLY -- destroys all data)
npx prisma migrate reset
```

### Verification After Migration Rollback

- [ ] `npx prisma migrate status` shows no pending/failed migrations
- [ ] API can connect to database and serve requests
- [ ] Workers can read/write to all required tables
- [ ] No "column does not exist" or "relation does not exist" errors in logs
- [ ] Run smoke tests: `npm run test:smoke` (backend)

---

## Admin Dashboard Rollback

**When to use**: The admin dashboard is broken after deployment. Lower priority
than frontend or API because it only affects internal users.

**Estimated time**: < 15 minutes

Procedure is identical to [Frontend Rollback](#frontend-rollback) but targeting
the admin service:

```bash
# Docker Compose:
PREVIOUS_TAG="def5678-20260325100000"
docker compose up -d --no-deps admin

# CDN (if separate from frontend):
# Switch admin CDN origin to previous prefix
# Invalidate: /index.html
```

### Verification

- [ ] Admin login page loads
- [ ] Authentication works (can sign in)
- [ ] Content listing page shows data
- [ ] No console errors in browser DevTools

---

## Media Asset Recovery

**When to use**: Media files (images, audio, videos) are missing, corrupted,
or accidentally deleted from S3.

**Estimated time**: < 30 minutes

### S3 Versioning Recovery

If S3 versioning is enabled (it should be for production):

```bash
# List versions of a specific file
aws s3api list-object-versions \
  --bucket kidslearn-media-prod \
  --prefix "content/images/abc-123.webp"

# Restore a previous version (copy it back as the latest)
aws s3api copy-object \
  --bucket kidslearn-media-prod \
  --copy-source "kidslearn-media-prod/content/images/abc-123.webp?versionId=OLD_VERSION_ID" \
  --key "content/images/abc-123.webp"
```

### Bulk Restore from S3 Versioning

```bash
# Restore all deleted objects in a prefix (undelete)
aws s3api list-object-versions \
  --bucket kidslearn-media-prod \
  --prefix "content/images/" \
  --query "DeleteMarkers[?IsLatest==\`true\`].[Key,VersionId]" \
  --output text | while read key version_id; do
    aws s3api delete-object \
      --bucket kidslearn-media-prod \
      --key "$key" \
      --version-id "$version_id"
    echo "Restored: $key"
done
```

### Restore from Backup

If S3 versioning is not available:

```bash
# Restore from cross-region replication bucket
aws s3 sync \
  s3://kidslearn-media-backup/ \
  s3://kidslearn-media-prod/ \
  --source-region us-west-2

# Or restore from Glacier/Deep Archive
aws s3api restore-object \
  --bucket kidslearn-media-archive \
  --key "content/images/abc-123.webp" \
  --restore-request '{"Days":7,"GlacierJobParameters":{"Tier":"Expedited"}}'
# Expedited retrieval: 1-5 minutes
# Standard retrieval: 3-5 hours
```

---

## Queue Backlog Recovery

**When to use**: Queues have accumulated a large backlog due to worker downtime,
a bug that caused jobs to fail, or a spike in job creation.

**Estimated time**: 15 minutes to start recovery; full drain depends on backlog size

### Assess the Situation

```bash
# Check backlog depth for all queues
for queue in media-processing ai-generation content-release localization offline-packs analytics-aggregate content-qa; do
  waiting=$(docker exec kidslearn-redis redis-cli LLEN "bull:$queue:wait" 2>/dev/null || echo "?")
  active=$(docker exec kidslearn-redis redis-cli LLEN "bull:$queue:active" 2>/dev/null || echo "?")
  failed=$(docker exec kidslearn-redis redis-cli LLEN "bull:$queue:failed" 2>/dev/null || echo "?")
  echo "$queue: waiting=$waiting active=$active failed=$failed"
done
```

### Option A: Scale Up Workers

If the jobs are valid and just need processing capacity:

```bash
# Scale to more worker instances
docker compose up -d --scale worker=4

# Or increase concurrency per worker
docker compose up -d worker \
  -e WORKER_MEDIA_CONCURRENCY=4 \
  -e WORKER_AI_CONCURRENCY=2
```

### Option B: Drain and Replay

If jobs need to be reprocessed after a bug fix:

```typescript
// Script to retry all failed jobs in a queue
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL);

async function retryFailedJobs(queueName: string) {
  const queue = new Queue(queueName, { connection });
  const failed = await queue.getFailed(0, -1);

  console.log(`Retrying ${failed.length} failed jobs in ${queueName}`);

  for (const job of failed) {
    await job.retry();
  }

  console.log('All failed jobs re-queued for retry');
  await queue.close();
}

retryFailedJobs('media-processing');
```

### Option C: Purge and Re-enqueue

If the backlog contains stale or invalid jobs:

```bash
# CAUTION: This removes all waiting jobs from the queue.
# Only do this if you can re-enqueue them from the source.

# Drain a specific queue
docker exec kidslearn-redis redis-cli DEL "bull:media-processing:wait"

# Then re-enqueue from the API (if applicable)
# The API may need to re-scan content and create new jobs
```

### Option D: Prioritize Critical Queues

If some queues are more important than others:

```bash
# Deploy specialized workers for the critical queue
docker run -d \
  --name kidslearn-worker-media \
  --env WORKER_QUEUES=media-processing \
  --env WORKER_MEDIA_CONCURRENCY=4 \
  kidslearn-worker:latest

# Let the general-purpose worker handle the rest
```

---

## Redis Failure Recovery

**When to use**: Redis is unreachable, has lost data, or is experiencing
high memory usage.

**Estimated time**: < 15 minutes

### Redis Unreachable

```bash
# 1. Check Redis container status
docker ps --filter "name=kidslearn-redis"
docker logs kidslearn-redis --tail 50

# 2. Restart Redis
docker compose restart redis

# 3. Wait for Redis to be healthy
docker compose exec redis redis-cli ping
# Expected: PONG

# 4. Verify workers reconnected
docker logs kidslearn-worker --tail 20 --since 1m
# Look for: "Redis connection established" or similar

# 5. Verify API can reach Redis
curl -sf http://localhost:4000/health | jq .
```

### Redis Data Loss

If Redis data is lost (e.g., container restart without persistence):

```
Impact:
  - All queued jobs are lost (waiting, delayed, active)
  - Job history (completed, failed) is lost
  - No session data impact (sessions are JWT-based)
  - No cache impact (Redis is not used as primary cache for user data)

Recovery:
  1. Redis restarts with empty state
  2. Workers reconnect automatically (IORedis retry)
  3. Jobs that were in-progress will not be retried (they're gone)
  4. New jobs from API will be enqueued normally
  5. For critical lost jobs: check the source (API audit log) and re-enqueue
```

### Redis High Memory

```bash
# Check memory usage
docker exec kidslearn-redis redis-cli INFO memory | grep used_memory_human

# Check which keys are consuming the most space
docker exec kidslearn-redis redis-cli --bigkeys

# Clear completed job history (safe to remove)
for queue in media-processing ai-generation content-release localization offline-packs analytics-aggregate content-qa; do
  docker exec kidslearn-redis redis-cli DEL "bull:$queue:completed"
  echo "Cleared completed jobs for $queue"
done
```

### Redis Persistence Check

```bash
# Verify AOF is enabled
docker exec kidslearn-redis redis-cli CONFIG GET appendonly
# Should return: "yes"

# Check last successful save
docker exec kidslearn-redis redis-cli LASTSAVE

# Force a background save
docker exec kidslearn-redis redis-cli BGSAVE
```

---

## Full-Stack Rollback

**When to use**: Multiple components are broken simultaneously, or the root cause
is unclear and you need to restore the entire platform to a known-good state.

**Estimated time**: 30-60 minutes

### Step-by-Step Full Rollback

```bash
# Identify the last known-good deployment
# Check deployment log, git history, or image tags
GOOD_TAG="def5678-20260325100000"

echo "=== FULL ROLLBACK TO TAG: $GOOD_TAG ==="

# Step 1: Stop all traffic (if you have a maintenance page)
# Optional: enable maintenance mode at CDN/load balancer level

# Step 2: Roll back API
echo "Rolling back API..."
docker compose stop api
docker compose up -d --no-deps api
# (Use the previous tag in your compose config or override)

# Step 3: Roll back Workers
echo "Rolling back workers..."
docker kill --signal=SIGTERM kidslearn-worker 2>/dev/null || true
sleep 30
docker compose up -d --no-deps worker

# Step 4: Roll back Frontend
echo "Rolling back frontend..."
docker compose up -d --no-deps frontend
# CDN: switch origin to previous version, invalidate cache

# Step 5: Roll back Admin
echo "Rolling back admin..."
docker compose up -d --no-deps admin

# Step 6: Roll back database (only if migration was the cause)
# WARNING: This may cause data loss. Only do this if necessary.
# See [Database Migration Rollback] section.

# Step 7: Verify all services
echo "Verifying services..."
curl -sf http://localhost:4000/health && echo "API: OK" || echo "API: FAILED"
curl -sf http://localhost:5173/ >/dev/null && echo "Frontend: OK" || echo "Frontend: FAILED"
curl -sf http://localhost:5174/ >/dev/null && echo "Admin: OK" || echo "Admin: FAILED"
docker ps --filter "name=kidslearn-worker" --format "{{.Status}}" | grep -q "healthy" && echo "Worker: OK" || echo "Worker: CHECK"

# Step 8: Disable maintenance mode (if enabled)

echo "=== FULL ROLLBACK COMPLETE ==="
```

---

## Post-Incident Checklist

After any rollback or recovery, complete this checklist:

### Immediate (within 1 hour)

- [ ] All services are healthy (health checks passing)
- [ ] Error rates returned to baseline
- [ ] Users can load and use the app
- [ ] Queue backlogs are stable or decreasing
- [ ] No new error patterns in logs
- [ ] On-call team notified of the incident and resolution

### Short-Term (within 24 hours)

- [ ] Incident report drafted (timeline, impact, root cause, resolution)
- [ ] Root cause identified and documented
- [ ] Fix developed and tested in staging
- [ ] Deployment plan for the fix reviewed
- [ ] Monitoring/alerting gaps identified and filed as tickets

### Long-Term (within 1 week)

- [ ] Post-mortem meeting held with the team
- [ ] Action items assigned and tracked
- [ ] Monitoring improvements deployed
- [ ] Runbook updated with any new procedures learned
- [ ] Recovery procedure tested (if a new failure mode was discovered)

### Incident Report Template

```
## Incident Report: [Title]

**Date**: YYYY-MM-DD
**Duration**: HH:MM - HH:MM (X minutes)
**Severity**: P1/P2/P3
**Impact**: [What users experienced]

### Timeline
- HH:MM - [Event]
- HH:MM - [Event]
- HH:MM - [Resolved]

### Root Cause
[What caused the incident]

### Resolution
[What was done to fix it]

### Action Items
- [ ] [Action 1] - Owner: [Name] - Due: [Date]
- [ ] [Action 2] - Owner: [Name] - Due: [Date]

### Lessons Learned
- [What we learned]
- [What we would do differently]
```
