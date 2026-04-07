# Observability Guide

This document covers the structured logging, metrics collection, request tracing, and dashboard specifications for the Kids Learning App backend.

## Table of Contents

1. [Structured Logging](#structured-logging)
2. [Metrics Catalog](#metrics-catalog)
3. [Request Tracing](#request-tracing)
4. [Dashboard Specifications](#dashboard-specifications)
5. [Log Correlation](#log-correlation)
6. [Environment & Version Tagging](#environment--version-tagging)
7. [Runbooks](#runbooks)

---

## Structured Logging

### Logger Configuration

The backend uses **pino** for structured JSON logging. Every log line includes base fields for service identification and tracing.

**File**: `backend/src/lib/logger.ts`

**Base fields on every log line:**

| Field | Example | Description |
|-------|---------|-------------|
| `level` | `30` | Numeric log level (10=trace, 20=debug, 30=info, 40=warn, 50=error, 60=fatal) |
| `time` | `"2026-03-26T10:00:00.000Z"` | ISO 8601 timestamp |
| `service` | `"kids-learning-api"` | Service identifier |
| `env` | `"production"` | Deployment environment |
| `version` | `"1.2.3"` | Application version (from APP_VERSION) |

### Log Levels

| Level | When to Use | Examples |
|-------|-------------|---------|
| `error` | Something failed that should not have | Unhandled exceptions, 5xx responses, database connection failures |
| `warn` | Something unexpected but recoverable | Client errors (4xx), slow requests (>1s), deprecation warnings |
| `info` | Normal operational events | Request completed, server started, job completed |
| `debug` | Detailed diagnostic information | Configuration loaded, query details, cache operations |

### Logging Conventions

**DO:**
- Log structured data as the first argument, message as the second:
  ```ts
  logger.info({ userId, action: 'login' }, 'User authenticated');
  ```
- Include `requestId` in all logs within a request context
- Include `jobId` and `queue` in all worker logs
- Use child loggers for module-specific context:
  ```ts
  const log = createChildLogger({ module: 'media-processing' });
  ```

**DO NOT:**
- Log sensitive data (passwords, tokens, PII). The redact config handles auth headers, but be careful with custom fields.
- Use `console.log` anywhere in the codebase. Always use the structured logger.
- Log full request/response bodies (too verbose, potential PII leak). Log specific fields instead.

### Request Logger

**File**: `backend/src/middleware/requestLogger.ts`

Every HTTP request is automatically logged with:

| Field | Description |
|-------|-------------|
| `requestId` | UUID for request tracing (from `x-request-id` header or auto-generated) |
| `method` | HTTP method |
| `path` | URL path |
| `statusCode` | Response status code |
| `duration` | Response time in milliseconds |
| `userAgent` | Client user agent string |
| `ip` | Client IP address |
| `userId` | Authenticated user ID (if available) |

**Excluded paths** (not logged to reduce noise): `/health`, `/ready`, `/metrics`

### Redacted Fields

The following field patterns are automatically redacted from all log output:

- `req.headers.authorization`
- `req.headers.cookie`
- `*.password`
- `*.secret`
- `*.token`
- `*.apiKey`
- `*.accessKey`
- `*.secretKey`

---

## Metrics Catalog

### Overview

Metrics are collected in-memory via `backend/src/lib/metrics.ts` and exposed in two formats:
- **Prometheus text format**: `GET /metrics` (for Prometheus scraping)
- **JSON**: `GET /metrics/json` (for custom dashboards and debugging)

### HTTP Metrics

| Metric | Type | Labels | Description |
|--------|------|--------|-------------|
| `http_requests_total` | counter | `method`, `path`, `status` | Total HTTP requests by method, path, and status code |
| `http_request_duration_ms` | histogram | `method`, `path`, `status` | Request latency distribution in milliseconds |

**Path normalization**: Dynamic path segments (UUIDs, numeric IDs) are replaced with `:id` to prevent high-cardinality labels. Example: `/api/content/550e8400-...` becomes `/api/content/:id`.

### Queue Metrics

| Metric | Type | Labels | Description |
|--------|------|--------|-------------|
| `queue_jobs_enqueued_total` | counter | `queue` | Total jobs added to each queue |
| `queue_jobs_completed_total` | counter | `queue` | Total jobs completed successfully |
| `queue_jobs_failed_total` | counter | `queue` | Total jobs that failed |
| `queue_depth` | gauge | `queue` | Current number of waiting jobs |

**Queue names**: `media-processing`, `ai-generation`, `content-release`, `localization`, `offline-packs`, `analytics-aggregate`, `content-qa`

### Database Metrics

| Metric | Type | Labels | Description |
|--------|------|--------|-------------|
| `db_operation_duration_ms` | histogram | `operation` | Database query latency in milliseconds |

### Cache Metrics

| Metric | Type | Labels | Description |
|--------|------|--------|-------------|
| `cache_hits_total` | counter | (none) | Total cache hits |
| `cache_misses_total` | counter | (none) | Total cache misses |

### Sync Metrics

| Metric | Type | Labels | Description |
|--------|------|--------|-------------|
| `sync_errors_total` | counter | `type` | Sync failures by error type |

### Application Metrics

| Metric | Type | Labels | Description |
|--------|------|--------|-------------|
| `active_connections` | gauge | (none) | Current active WebSocket/SSE connections |
| `media_processing_duration_ms` | histogram | `operation` | Media processing job duration |
| `auth_events_total` | counter | `event` | Authentication events (login, logout, token_refresh, failed_login) |

### Histogram Percentiles

All histogram metrics export the following percentiles:
- **p50** (median)
- **p90**
- **p95**
- **p99**

Plus `_count` (total observations) and `_sum` (sum of all observations).

---

## Request Tracing

### How It Works

Every request gets a unique `x-request-id` that follows the request through the entire system:

1. **Incoming request**: The `requestLogger` middleware checks for an existing `x-request-id` header (forwarded from a gateway or upstream service). If absent, it generates a new UUID.
2. **Request object**: The ID is attached as `req.requestId` for use in route handlers.
3. **Response header**: The ID is echoed back as `x-request-id` in the response so clients can reference it.
4. **Log correlation**: Every log line within the request includes the `requestId` field.

### Using Request ID in Handlers

```ts
router.post('/content', async (req, res) => {
  logger.info({ requestId: req.requestId, contentId }, 'Creating content');
  // ... handler logic ...
});
```

### Cross-Service Tracing

When calling other services, forward the request ID:

```ts
const response = await fetch('https://other-service/api', {
  headers: { 'x-request-id': req.requestId },
});
```

### Searching Logs by Request ID

To find all logs for a specific request:

```bash
# CloudWatch Insights
fields @timestamp, @message
| filter requestId = "550e8400-e29b-41d4-a716-446655440000"
| sort @timestamp asc

# Local development (pipe to jq)
cat logs.json | jq 'select(.requestId == "550e8400-...")'
```

---

## Dashboard Specifications

### API Dashboard

**Purpose**: Real-time and historical view of API performance.

| Panel | Metric | Visualization |
|-------|--------|---------------|
| Request Rate | `http_requests_total` (rate) | Line chart, by method |
| Error Rate | `http_requests_total{status=~"5.."}` / total | Percentage gauge |
| Latency (p50/p95/p99) | `http_request_duration_ms` | Multi-line chart |
| Status Code Distribution | `http_requests_total` by status | Stacked bar |
| Slowest Endpoints | `http_request_duration_ms` by path (p95) | Table, descending |
| Active Tasks | ECS running task count | Gauge |
| CPU / Memory | ECS task CPU and memory utilization | Line charts |

### Queue Dashboard

**Purpose**: Monitor BullMQ job processing across all 7 queues.

| Panel | Metric | Visualization |
|-------|--------|---------------|
| Queue Depth | `queue_depth` per queue | Bar chart (color-coded) |
| Job Throughput | `queue_jobs_completed_total` (rate) | Line chart per queue |
| Failure Rate | `queue_jobs_failed_total` (rate) | Line chart per queue |
| Processing Latency | Job completion time distribution | Histogram |
| Backlog Trend | `queue_depth` over time | Line chart |

### Error Dashboard

**Purpose**: Investigate and triage errors.

| Panel | Metric/Source | Visualization |
|-------|--------------|---------------|
| Error Rate Timeline | `http_requests_total{status=~"5.."}` | Line chart |
| Top Error Paths | `http_requests_total{status=~"[45].."}` by path | Table |
| Error Logs | CloudWatch logs with level >= error | Log stream |
| Unhandled Exceptions | Logs matching "Unhandled error" | Log count + stream |
| Sync Errors | `sync_errors_total` by type | Pie chart |

### Infrastructure Dashboard

**Purpose**: AWS resource health and capacity.

| Panel | Source | Visualization |
|-------|--------|---------------|
| RDS CPU | CloudWatch AWS/RDS CPUUtilization | Line chart |
| RDS Connections | CloudWatch AWS/RDS DatabaseConnections | Line chart |
| Redis Memory | CloudWatch AWS/ElastiCache DatabaseMemoryUsagePercentage | Gauge |
| Redis Connections | CloudWatch AWS/ElastiCache CurrConnections | Line chart |
| S3 Bucket Size | CloudWatch AWS/S3 BucketSizeBytes | Area chart |
| ALB Request Count | CloudWatch AWS/ApplicationELB RequestCount | Line chart |

---

## Log Correlation

### Correlation Fields

Logs across different parts of the system are correlated using these fields:

| Context | Correlation Field | Example |
|---------|-------------------|---------|
| HTTP request | `requestId` | `"550e8400-e29b-41d4-..."` |
| Queue job | `jobId`, `queue` | `"123"`, `"media-processing"` |
| User session | `userId` | `"user_abc123"` |
| Content operation | `contentId` | `"content_xyz789"` |
| Deploy | `version` | `"1.2.3"` |

### Log Aggregation Pipeline

```
Application (pino JSON) --> CloudWatch Logs --> CloudWatch Insights
                                           --> (optional) Elasticsearch/OpenSearch
                                           --> (optional) Datadog Log Forwarding
```

---

## Environment & Version Tagging

Every log line and metric is tagged with:

| Tag | Source | Purpose |
|-----|--------|---------|
| `service` | Hardcoded (`kids-learning-api`) | Distinguish between API and worker logs |
| `env` | `NODE_ENV` environment variable | Filter by environment |
| `version` | `APP_VERSION` environment variable (set during deploy) | Correlate issues with specific releases |

### Version Deployment Tracking

When a new version is deployed:

1. The `APP_VERSION` environment variable is set to the Git tag or commit SHA
2. All logs and metrics include the version tag
3. Dashboards can overlay deployment markers on charts
4. Errors can be correlated with specific releases for rollback decisions

---

## Runbooks

### Finding the Cause of a 5xx Spike

1. Open the **Error Dashboard** and note the time window
2. Look at the **Top Error Paths** panel to identify which endpoint(s) are failing
3. Click through to **Error Logs** and filter by the affected path
4. Copy the `requestId` from an error log line
5. Search all logs for that `requestId` to see the full request lifecycle
6. Check the `version` tag to see if the issue correlates with a recent deploy

### Investigating a Slow Request

1. Open the **API Dashboard** and look at the **Latency** panel
2. Identify the time window and affected paths from **Slowest Endpoints**
3. Search logs for: `duration > 1000 AND path = "/api/content"`
4. Check `db_operation_duration_ms` to see if the database is slow
5. Check the **Infrastructure Dashboard** for RDS CPU or connection spikes

### Debugging a Queue Backlog

1. Open the **Queue Dashboard** and identify which queue has elevated depth
2. Check `queue_jobs_failed_total` for the affected queue
3. Search worker logs: `queue = "media-processing" AND level >= 40`
4. Check if the worker ECS service has the expected number of running tasks
5. If workers are healthy, consider scaling up `worker_desired_count`
