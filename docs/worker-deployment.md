# Kids Learning Fun -- Worker Deployment Coordination

> Version 1.0 | Last updated: 2026-03-26

This document covers the deployment coordination strategy for the BullMQ worker
processes, including the compatibility matrix, queue contract versioning, graceful
shutdown procedures, health monitoring, and scaling considerations.

---

## Table of Contents

1. [Worker Architecture](#worker-architecture)
2. [Compatibility Matrix](#compatibility-matrix)
3. [Queue Contract Versioning](#queue-contract-versioning)
4. [Graceful Shutdown](#graceful-shutdown)
5. [Health Checks](#health-checks)
6. [Scaling Strategy](#scaling-strategy)
7. [Deployment Procedure](#deployment-procedure)
8. [Failure Modes and Recovery](#failure-modes-and-recovery)
9. [Queue-Specific Considerations](#queue-specific-considerations)

---

## Worker Architecture

The worker process (`backend/src/worker.ts`) runs 7 BullMQ workers in a single
Node.js process, each consuming from a dedicated Redis-backed queue:

```
+----------------------------------------------------------+
|  Worker Process (node dist/worker.js)                     |
|                                                           |
|  +-------------------+  +-------------------+             |
|  | media-processing  |  | ai-generation     |             |
|  | concurrency: 2    |  | concurrency: 1    |             |
|  +-------------------+  +-------------------+             |
|                                                           |
|  +-------------------+  +-------------------+             |
|  | content-release   |  | localization      |             |
|  | concurrency: 1    |  | concurrency: 2    |             |
|  +-------------------+  +-------------------+             |
|                                                           |
|  +-------------------+  +-------------------+             |
|  | offline-packs     |  | analytics-agg     |             |
|  | concurrency: 1    |  | concurrency: 1    |             |
|  +-------------------+                                    |
|                                                           |
|  +-------------------+                                    |
|  | content-qa        |                                    |
|  | concurrency: 1    |                                    |
|  +-------------------+                                    |
|                                                           |
|  Shared: IORedis connection, Prisma client                |
+-------------------+--------------------------------------+
                    |
                    v
              +-----+-----+
              |   Redis    |
              |  7 queues  |
              +-----------+
```

### Queue Inventory

| Queue Name | Purpose | Default Concurrency | Typical Job Duration |
|-----------|---------|-------------------|---------------------|
| `media-processing` | Image resize (sharp), thumbnail gen | 2 | 2-10s |
| `ai-generation` | Story gen, illustration prompts, voice | 1 | 10-60s |
| `content-release` | Scheduled publishing, version promotion | 1 | 1-5s |
| `localization` | Translation jobs, locale asset gen | 2 | 5-30s |
| `offline-packs` | Bundle generation for offline content | 1 | 30-120s |
| `analytics-aggregate` | Roll up raw events into summaries | 1 | 5-15s |
| `content-qa` | Automated quality checks on content | 1 | 3-10s |

---

## Compatibility Matrix

Components depend on each other. This matrix defines what must be deployed before
what, and what can be deployed independently.

### Version Dependency Graph

```
                   +------------------+
                   |  DB Schema v(N)  |
                   +--------+---------+
                            |
               +------------+------------+
               |                         |
        +------+------+          +-------+------+
        |  API v(N)   |          | Workers v(N) |
        +------+------+          +--------------+
               |
        +------+------+
        | Frontend v(N)|
        +------+------+
               |
        +------+------+
        | Admin v(N)   |
        +--------------+
```

### Deployment Order Matrix

| Component | Depends On | Must Deploy Before | Can Coexist With |
|-----------|-----------|-------------------|-----------------|
| DB Schema v(N) | Nothing | API v(N), Workers v(N) | All (expand-phase is additive) |
| API v(N) | DB Schema v(N) | Frontend v(N) | Workers v(N-1), Frontend v(N-1) |
| Workers v(N) | DB Schema v(N), Redis, same queue contract | Nothing | API v(N) or v(N-1) |
| Frontend v(N) | API v(N) endpoints exist | Admin v(N) (by convention) | API v(N), Workers v(N) |
| Admin v(N) | API v(N) endpoints exist | Nothing | All |

### Coexistence Rules

During a rolling deployment, old and new worker versions coexist temporarily:

```
t=0  Queue state:
     +------ Worker v1 ------+  +------ Worker v1 ------+
     | Processing job A (v1) |  | Processing job B (v1) |
     +-----------------------+  +-----------------------+

t=1  Worker v1 draining, Worker v2 starting:
     +------ Worker v1 ------+  +------ Worker v2 ------+
     | Finishing job A (v1)  |  | Ready for new jobs    |
     | No new jobs accepted  |  | Handles v1 AND v2     |
     +-----------------------+  +-----------------------+

t=2  Worker v1 stopped, Worker v2 running:
     +------ Worker v2 ------+  +------ Worker v2 ------+
     | Processing job C (v2) |  | Processing job D (v1) |
     | Full v2 logic         |  | Backward compat for   |
     |                       |  | remaining v1 payloads |
     +-----------------------+  +-----------------------+
```

---

## Queue Contract Versioning

### Job Payload Schema

Every job payload MUST include a `version` field to enable safe transitions:

```typescript
// Job payload interface
interface JobPayload {
  version: number;        // Schema version of this payload
  type: string;           // Job subtype (e.g., 'resize', 'thumbnail')
  data: Record<string, unknown>;  // Payload-specific data
  metadata: {
    enqueuedAt: string;   // ISO timestamp
    enqueuedBy: string;   // Service that created the job
    correlationId: string; // For tracing across services
  };
}
```

### Version Transition Pattern

When changing a job payload format:

```typescript
// Example: media-processing job payload evolving

// v1 payload (current)
{
  version: 1,
  type: 'resize',
  data: {
    sourceKey: 'uploads/image.jpg',
    width: 800,
    height: 600,
    format: 'webp'
  }
}

// v2 payload (new -- adds quality field, changes format to array)
{
  version: 2,
  type: 'resize',
  data: {
    sourceKey: 'uploads/image.jpg',
    width: 800,
    height: 600,
    formats: ['webp', 'avif'],   // Changed: array instead of string
    quality: 85                   // New field
  }
}
```

### Worker Dual-Version Handler

Workers MUST handle both the old and new payload versions during the transition period:

```typescript
// In the worker processor:
async function processMediaJob(job: Job<JobPayload>) {
  const { version, type, data } = job.data;

  if (type === 'resize') {
    if (version === 1) {
      // Handle v1 format
      const { sourceKey, width, height, format } = data as V1ResizeData;
      await resizeImage(sourceKey, width, height, [format], 80);
    } else if (version === 2) {
      // Handle v2 format
      const { sourceKey, width, height, formats, quality } = data as V2ResizeData;
      await resizeImage(sourceKey, width, height, formats, quality);
    } else {
      throw new Error(`Unknown payload version: ${version}`);
    }
  }
}
```

### Version Retirement Timeline

```
Day 0:  Deploy Workers v2 (handles v1 + v2 payloads)
Day 0:  Deploy API v2 (enqueues v2 payloads)
Day 1:  Monitor: all v1 jobs should be drained by now
Day 3:  Verify: no v1 payloads in queue (check with queue inspector)
Day 7:  Deploy Workers v3 (remove v1 handler code)
```

### Queue Inspector Utility

To check for remaining old-version jobs:

```typescript
import { Queue } from 'bullmq';

async function inspectQueueVersions(queueName: string) {
  const queue = new Queue(queueName, { connection });

  const waiting = await queue.getWaiting(0, -1);
  const delayed = await queue.getDelayed(0, -1);
  const active = await queue.getActive(0, -1);

  const allJobs = [...waiting, ...delayed, ...active];
  const versionCounts: Record<number, number> = {};

  for (const job of allJobs) {
    const v = job.data?.version ?? 0;
    versionCounts[v] = (versionCounts[v] || 0) + 1;
  }

  console.log(`Queue ${queueName} version distribution:`, versionCounts);
  return versionCounts;
}
```

---

## Graceful Shutdown

### Shutdown Sequence

When the worker process receives `SIGTERM` (from container orchestrator or deploy script):

```
SIGTERM received
      |
      v
1. Set isShuttingDown = true
   (Prevents re-entrant shutdown calls)
      |
      v
2. Log: "Shutting down workers gracefully..."
      |
      v
3. For each worker: worker.close()
   |
   |  What worker.close() does internally:
   |  a. Calls worker.pause() -- stops polling for new jobs
   |  b. Waits for active jobs to finish (respects lock TTL)
   |  c. Disconnects from Redis when all jobs complete
   |
   v
4. await Promise.all(workers.map(w => w.close()))
   |
   |  If all workers close within timeout:
   |  --> Log "All workers stopped cleanly"
   |  --> process.exit(0)
   |
   |  If any worker hangs (job takes too long):
   |  --> Container runtime sends SIGKILL after grace period
   |  --> Jobs that were in-progress return to queue (BullMQ auto-retry)
   |
   v
5. Process exits
```

### Current Implementation (worker.ts)

The existing `worker.ts` already implements graceful shutdown:

```typescript
let isShuttingDown = false;

async function shutdown(signal: string) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`\nReceived ${signal}. Shutting down workers gracefully...`);

  try {
    await Promise.all(workers.map((w) => w.close()));
    console.log('All workers stopped cleanly.');
    process.exit(0);
  } catch (err) {
    console.error('Error during worker shutdown:', err);
    process.exit(1);
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
```

### Recommended Enhancement: Shutdown Timeout

Add a configurable timeout to prevent indefinite hanging:

```typescript
const SHUTDOWN_TIMEOUT_MS = parseInt(process.env.WORKER_SHUTDOWN_TIMEOUT || '30000');

async function shutdown(signal: string) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`Received ${signal}. Shutting down (timeout: ${SHUTDOWN_TIMEOUT_MS}ms)...`);

  const shutdownTimer = setTimeout(() => {
    console.error('Shutdown timeout exceeded. Force-exiting.');
    console.error('In-progress jobs will be retried by BullMQ.');
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);

  try {
    await Promise.all(workers.map((w) => w.close()));
    clearTimeout(shutdownTimer);
    console.log('All workers stopped cleanly.');
    process.exit(0);
  } catch (err) {
    clearTimeout(shutdownTimer);
    console.error('Error during worker shutdown:', err);
    process.exit(1);
  }
}
```

### Container Grace Period

The Docker healthcheck and container orchestrator must align with the shutdown timeout:

```yaml
# In docker-compose.yml or ECS task definition:
worker:
  stop_grace_period: 45s  # Must be > WORKER_SHUTDOWN_TIMEOUT (30s)
```

```dockerfile
# In Dockerfile.worker:
# The STOPSIGNAL is SIGTERM by default, which is correct.
STOPSIGNAL SIGTERM
```

### What Happens to In-Progress Jobs

When a worker is force-killed (SIGKILL after grace period):

1. BullMQ detects the worker's lock expired on the job
2. The job's `attemptsMade` counter is NOT incremented (lock-based, not ack-based)
3. BullMQ moves the job back to the `waiting` state
4. Another worker picks up the job
5. The job processor SHOULD be idempotent (same input = same result, no side effects
   from partial execution)

**Idempotency requirements by queue:**

| Queue | Idempotent? | Strategy |
|-------|------------|----------|
| `media-processing` | Yes | Overwrites output file; same input = same output |
| `ai-generation` | Mostly | Use deterministic seed if possible; or accept variance |
| `content-release` | Yes | Publishing is idempotent (set status = published) |
| `localization` | Yes | Overwrites translation output |
| `offline-packs` | Yes | Rebuilds pack from scratch |
| `analytics-aggregate` | Yes | Uses upsert with date-based keys |
| `content-qa` | Yes | Re-runs checks, overwrites results |

---

## Health Checks

### Worker Process Health

Since workers do not serve HTTP by default, health is monitored via process-level
checks and optional metrics endpoints.

#### Process-Level Check (Current)

The `Dockerfile.worker` uses `pgrep`:

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD pgrep -f "node dist/worker.js" || exit 1
```

This verifies the process is alive but cannot detect logical failures.

#### Enhanced Health Check: Optional HTTP Endpoint

For deeper health visibility, the worker can expose a lightweight HTTP server:

```typescript
import http from 'node:http';

// Lightweight health server (no Express overhead)
const HEALTH_PORT = parseInt(process.env.WORKER_HEALTH_PORT || '4001');

const healthServer = http.createServer(async (req, res) => {
  if (req.url === '/health' && req.method === 'GET') {
    const health = await getWorkerHealth();
    const status = health.healthy ? 200 : 503;
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(health));
  } else {
    res.writeHead(404);
    res.end();
  }
});

healthServer.listen(HEALTH_PORT, () => {
  console.log(`Worker health endpoint on port ${HEALTH_PORT}`);
});
```

#### Health Check Response

```json
{
  "healthy": true,
  "uptime": 3600,
  "workers": {
    "media-processing": {
      "status": "running",
      "active": 1,
      "completed": 142,
      "failed": 0,
      "lastJobAt": "2026-03-26T10:30:00Z"
    },
    "ai-generation": {
      "status": "running",
      "active": 0,
      "completed": 23,
      "failed": 1,
      "lastJobAt": "2026-03-26T10:28:00Z"
    }
  },
  "redis": {
    "connected": true,
    "latencyMs": 2
  },
  "queues": {
    "media-processing": { "waiting": 3, "active": 1, "delayed": 0 },
    "ai-generation": { "waiting": 0, "active": 0, "delayed": 2 },
    "content-release": { "waiting": 0, "active": 0, "delayed": 5 },
    "localization": { "waiting": 12, "active": 2, "delayed": 0 },
    "offline-packs": { "waiting": 1, "active": 0, "delayed": 0 },
    "analytics-aggregate": { "waiting": 0, "active": 0, "delayed": 0 },
    "content-qa": { "waiting": 4, "active": 1, "delayed": 0 }
  }
}
```

#### Health Assessment Logic

```typescript
async function getWorkerHealth() {
  const isRedisConnected = connection.status === 'ready';

  // Check each queue's backlog
  const queueHealthy = await Promise.all(
    queueNames.map(async (name) => {
      const queue = new Queue(name, { connection });
      const waiting = await queue.getWaitingCount();
      const failed = await queue.getFailedCount();
      const completed = await queue.getCompletedCount();
      const failRate = completed > 0 ? failed / (completed + failed) : 0;
      return {
        name,
        waiting,
        failRate,
        backlogOk: waiting < 1000,
        failRateOk: failRate < 0.01,  // < 1%
      };
    })
  );

  const allQueuesHealthy = queueHealthy.every(q => q.backlogOk && q.failRateOk);

  return {
    healthy: isRedisConnected && allQueuesHealthy && !isShuttingDown,
    // ... detailed metrics
  };
}
```

### Health Check Thresholds

| Metric | Healthy | Warning | Unhealthy |
|--------|---------|---------|-----------|
| Redis connection | Connected | Reconnecting | Disconnected > 30s |
| Queue backlog | < 100 waiting | 100-1000 waiting | > 1000 waiting |
| Job failure rate | < 1% | 1-5% | > 5% |
| Processing rate | > 0 jobs/min (if queue non-empty) | 0 for > 2 min | 0 for > 5 min |
| Last successful job | < 5 min ago | 5-15 min ago | > 15 min ago |
| Memory usage | < 70% limit | 70-85% limit | > 85% limit |

---

## Scaling Strategy

### Horizontal Scaling

The worker process can be scaled horizontally by running multiple instances:

```yaml
# docker-compose or orchestrator:
worker:
  replicas: 3  # Each instance runs all 7 queue consumers
```

BullMQ handles job distribution automatically -- each job is processed by exactly
one worker instance (Redis-based locking).

### Selective Queue Scaling

For uneven load patterns, deploy specialized worker instances:

```
Instance A: media-processing (concurrency: 4) + offline-packs (concurrency: 2)
Instance B: ai-generation (concurrency: 2) + content-qa (concurrency: 2)
Instance C: All queues (concurrency: 1 each) -- general purpose
```

This requires environment variables to control which queues each instance handles:

```bash
# Instance A:
WORKER_QUEUES=media-processing,offline-packs
WORKER_MEDIA_CONCURRENCY=4
WORKER_OFFLINE_PACKS_CONCURRENCY=2

# Instance B:
WORKER_QUEUES=ai-generation,content-qa
WORKER_AI_CONCURRENCY=2
WORKER_CONTENT_QA_CONCURRENCY=2
```

### Auto-Scaling Signals

| Signal | Scale Up When | Scale Down When |
|--------|--------------|-----------------|
| Queue depth | Waiting > 100 for > 5 min | Waiting = 0 for > 15 min |
| Processing latency | Job wait time > 60s | Job wait time < 5s |
| CPU usage | > 70% for > 5 min | < 20% for > 15 min |
| Memory usage | > 80% container limit | < 40% container limit |

---

## Deployment Procedure

### Step-by-Step Worker Deployment

```
Pre-deploy checks:
  1. Verify new worker image builds successfully
  2. Verify new worker handles both v(N-1) and v(N) payloads
  3. Check current queue backlogs (should be manageable)
  4. Ensure at least 2 worker instances are running

Deployment (rolling, one at a time):

  For each worker instance:
    1. Send SIGTERM to the instance
    2. Wait for graceful shutdown (up to 30s)
       - Monitor: active jobs completing
       - Monitor: no new errors in logs
    3. Replace with new image
    4. Wait for new instance to become healthy:
       - Process is running
       - Redis connection established
       - First job processed successfully
    5. Verify queue backlogs are not growing
    6. Wait 2 minutes before proceeding to next instance

Post-deploy verification:
  1. All instances running new version
  2. Queue backlogs stable or decreasing
  3. Job failure rate < 1%
  4. No new error patterns in logs
  5. Processing rate matches pre-deploy baseline
```

### Deployment Script Integration

The deploy script (see `scripts/deploy.sh`) handles worker deployment:

```bash
deploy_workers() {
  local image_tag=$1
  local instances=$(get_worker_instances)

  for instance in $instances; do
    echo "Draining worker: $instance"
    send_sigterm "$instance"
    wait_for_shutdown "$instance" 30

    echo "Replacing with new image: $image_tag"
    replace_instance "$instance" "$image_tag"

    echo "Waiting for health check..."
    wait_for_healthy "$instance" 60

    echo "Worker $instance updated. Waiting 2 min before next..."
    sleep 120
  done
}
```

---

## Failure Modes and Recovery

### Redis Connection Lost

```
Failure: Redis becomes unreachable
Impact:  All workers stop processing; jobs remain in Redis
Recovery:
  1. Workers auto-reconnect when Redis is back (IORedis retry logic)
  2. All queued jobs are preserved in Redis (AOF persistence)
  3. No data loss; processing resumes automatically
  4. If Redis data is lost: jobs are lost, but producers will re-enqueue
```

### Worker Crash (OOM, Uncaught Exception)

```
Failure: Worker process crashes
Impact:  Active jobs on that instance are interrupted
Recovery:
  1. Container orchestrator restarts the process
  2. In-progress jobs' locks expire after BullMQ lock duration
  3. Jobs return to waiting state and are picked up by other workers
  4. uncaughtException handler attempts graceful shutdown first
```

### Stuck Job (Infinite Loop or Deadlock)

```
Failure: A job hangs indefinitely in a worker
Impact:  One concurrency slot is consumed; other jobs unaffected
Recovery:
  1. BullMQ lock TTL expires (default: 30s, configurable)
  2. Job is moved to "stalled" state
  3. Another worker retries the job
  4. After max retries, job moves to "failed"
  5. Set up alerting on stalled job count
```

### Poison Message (Job That Always Fails)

```
Failure: A job payload causes a crash or error every time
Impact:  Wastes retries, fills failed queue
Recovery:
  1. BullMQ retries up to maxAttempts (default: 3)
  2. After max retries, job moves to "failed" permanently
  3. Failed jobs are inspectable via BullMQ dashboard
  4. Fix the bug, then use queue.retryJobs() to reprocess
  5. Consider a dead-letter queue for chronic failures
```

---

## Queue-Specific Considerations

### media-processing

- **Resource intensive**: CPU-bound (sharp image processing)
- **Concurrency limit**: Match to available CPU cores (default: 2)
- **File access**: Needs access to S3 or local uploads directory
- **Idempotent**: Overwrites output; safe to retry

### ai-generation

- **External API calls**: May hit rate limits on AI providers
- **Long-running**: Jobs can take 60s+; set appropriate lock TTL
- **Cost**: Each job costs money (API usage); avoid unnecessary retries
- **Rate limiting**: Use BullMQ rate limiter to cap requests per minute

### content-release

- **Scheduling**: Uses BullMQ delayed jobs for future-dated publishing
- **Ordering matters**: Publish events should be sequential per content item
- **Low volume**: Typically < 50 jobs per day

### localization

- **Batch-friendly**: Multiple translations can be batched per job
- **External API**: Translation service rate limits apply
- **Partial failure**: If 1 of 10 translations fails, save the 9 that succeeded

### offline-packs

- **Large output**: Generated bundles can be 10-50MB
- **Storage**: Write to S3, not local disk
- **Long-running**: 30-120s per pack; set lock TTL accordingly
- **Low priority**: Can be deprioritized during peak hours

### analytics-aggregate

- **Time-sensitive**: Daily aggregation jobs must complete before the next day
- **Idempotent**: Uses upsert with date keys; safe to re-run
- **Low concurrency**: Sequential to avoid race conditions on aggregate rows

### content-qa

- **Triggered by content creation**: Runs automatically when content is submitted
- **Fast feedback**: Results should be available within 30s for the admin UI
- **No side effects**: Read-only analysis; purely diagnostic output
