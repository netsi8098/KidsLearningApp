# Alerting Guide

This document defines the alert catalog, severity levels, escalation paths, and runbook procedures for the Kids Learning App.

## Table of Contents

1. [Severity Levels](#severity-levels)
2. [Escalation Paths](#escalation-paths)
3. [Alert Catalog](#alert-catalog)
4. [Notification Channels](#notification-channels)
5. [On-Call Procedures](#on-call-procedures)
6. [Runbooks](#runbooks)

---

## Severity Levels

| Level | Name | Response Time | Description | Examples |
|-------|------|---------------|-------------|---------|
| **P1** | Critical | 15 minutes | Service is down or severely degraded for users | API returning 5xx, database unreachable, total outage |
| **P2** | High | 1 hour | Significant functionality impaired but service is operational | Queue backlog growing, sync failures spike, high latency |
| **P3** | Medium | 4 hours | Non-critical issue affecting some operations | Offline pack generation failed, media processing stuck |
| **P4** | Low | Next business day | Minor issue, no user impact | Certificate approaching expiry, disk usage warning |

---

## Escalation Paths

### P1 - Critical

```
Alert fires
  --> On-call engineer notified (PagerDuty / phone call)
  --> Acknowledge within 15 minutes
  --> If not acknowledged in 15 min --> escalate to backup on-call
  --> If not resolved in 30 min --> escalate to engineering lead
  --> If not resolved in 1 hour --> escalate to VP Engineering
  --> Post-incident review within 48 hours
```

### P2 - High

```
Alert fires
  --> On-call engineer notified (Slack + PagerDuty)
  --> Acknowledge within 30 minutes
  --> If not acknowledged in 1 hour --> escalate to backup on-call
  --> If not resolved in 4 hours --> escalate to engineering lead
```

### P3 - Medium

```
Alert fires
  --> Slack notification to #ops-alerts channel
  --> Pick up during next working session
  --> Resolve within 24 hours
```

### P4 - Low

```
Alert fires
  --> Slack notification to #ops-alerts channel
  --> Create a ticket in the backlog
  --> Resolve within 1 week
```

---

## Alert Catalog

### API & Application Alerts

| Alert | Condition | Severity | Metric / Source | Dashboard |
|-------|-----------|----------|-----------------|-----------|
| **API Error Rate High** | 5xx responses > 5% of total for 5 minutes | P1 | `http_requests_total{status=~"5.."}` | API Dashboard |
| **API Latency High** | p95 latency > 2s for 5 minutes | P2 | `http_request_duration_ms` | API Dashboard |
| **API Availability Down** | Health check fails for 3 consecutive checks | P1 | ALB health check | Infrastructure Dashboard |
| **Rate Limit Saturation** | Rate limit rejections (429) > 100/min for 5 min | P3 | `http_requests_total{status="429"}` | API Dashboard |
| **Auth Failures Spike** | Failed login attempts > 100/min | P2 | `auth_events_total{event="failed_login"}` | API Dashboard |

### Queue Alerts

| Alert | Condition | Severity | Metric / Source | Dashboard |
|-------|-----------|----------|-----------------|-----------|
| **Queue Backlog Growing** | Any queue depth > 1000 for 10 minutes | P2 | `queue_depth` | Queue Dashboard |
| **Queue Job Failure Rate** | Failed jobs > 10% of completed for 15 min | P2 | `queue_jobs_failed_total` / `queue_jobs_completed_total` | Queue Dashboard |
| **Media Processing Stuck** | Active media job > 5 minutes with no completion | P3 | `media_processing_duration_ms` | Queue Dashboard |
| **Offline Pack Generation Failed** | Same offline-pack job failed 3 times | P3 | `queue_jobs_failed_total{queue="offline-packs"}` | Queue Dashboard |
| **AI Generation Timeout** | AI job active > 3 minutes | P3 | Worker logs | Queue Dashboard |

### Database Alerts

| Alert | Condition | Severity | Metric / Source | Dashboard |
|-------|-----------|----------|-----------------|-----------|
| **DB Connection Pool Exhausted** | Available connections = 0 for 1 minute | P1 | CloudWatch `DatabaseConnections` | Infrastructure Dashboard |
| **DB CPU High** | RDS CPU > 80% for 10 minutes | P2 | CloudWatch `CPUUtilization` | Infrastructure Dashboard |
| **DB Query Latency High** | p95 query time > 500ms for 5 minutes | P2 | `db_operation_duration_ms` | Infrastructure Dashboard |
| **DB Storage Low** | Free storage < 10% of provisioned | P2 | CloudWatch `FreeStorageSpace` | Infrastructure Dashboard |
| **Migration Failed** | Deploy pipeline failed at migration step | P1 | CI/CD pipeline | N/A |

### Cache & Redis Alerts

| Alert | Condition | Severity | Metric / Source | Dashboard |
|-------|-----------|----------|-----------------|-----------|
| **Redis Memory High** | Memory usage > 80% | P2 | CloudWatch `DatabaseMemoryUsagePercentage` | Infrastructure Dashboard |
| **Redis Connection Spike** | Current connections > 500 | P3 | CloudWatch `CurrConnections` | Infrastructure Dashboard |
| **Cache Hit Rate Low** | Hit rate < 50% for 15 minutes | P3 | `cache_hits_total` / (`cache_hits_total` + `cache_misses_total`) | API Dashboard |

### Sync & Data Alerts

| Alert | Condition | Severity | Metric / Source | Dashboard |
|-------|-----------|----------|-----------------|-----------|
| **Sync Failures Spike** | `sync_errors_total` > 50/min for 5 minutes | P2 | `sync_errors_total` | Error Dashboard |
| **Data Inconsistency** | Sync validation check fails | P2 | Sync service logs | Error Dashboard |

### Infrastructure Alerts

| Alert | Condition | Severity | Metric / Source | Dashboard |
|-------|-----------|----------|-----------------|-----------|
| **Certificate Expiry** | TLS certificate expires in < 14 days | P2 | ACM certificate monitoring | N/A |
| **Disk Usage High** | ECS task ephemeral storage > 85% | P2 | CloudWatch `EphemeralStorageUtilized` | Infrastructure Dashboard |
| **ECS Task Crash Loop** | Task restarts > 5 in 15 minutes | P1 | ECS task events | Infrastructure Dashboard |
| **NAT Gateway Error** | NAT Gateway packet drops > 0 | P3 | CloudWatch `PacketsDropCount` | Infrastructure Dashboard |
| **S3 Error Rate** | S3 5xx errors > 0 for 5 minutes | P3 | CloudWatch `5xxErrors` | Infrastructure Dashboard |

### Deployment Alerts

| Alert | Condition | Severity | Metric / Source | Dashboard |
|-------|-----------|----------|-----------------|-----------|
| **Deploy Failed** | ECS deployment circuit breaker triggered | P1 | ECS deployment events | N/A |
| **Post-Deploy Error Spike** | 5xx rate doubles within 10 min of deploy | P1 | `http_requests_total` + deploy marker | API Dashboard |
| **Rollback Triggered** | Automatic rollback occurred | P1 | ECS deployment events | N/A |

---

## Notification Channels

| Severity | Channel | Tool |
|----------|---------|------|
| P1 | Phone call + SMS + Slack | PagerDuty |
| P2 | Slack DM + Slack channel | PagerDuty / SNS |
| P3 | Slack channel | SNS / CloudWatch |
| P4 | Slack channel (low priority) | SNS / CloudWatch |

### Slack Channels

| Channel | Purpose |
|---------|---------|
| `#ops-alerts` | All alerts (P1-P4) |
| `#ops-critical` | P1 alerts only (noisy, always visible) |
| `#deployments` | Deploy start/finish/rollback notifications |
| `#engineering` | Post-incident summaries |

---

## On-Call Procedures

### Starting On-Call

1. Verify you have access to PagerDuty, AWS Console, and Slack
2. Review recent deployments and any open incidents
3. Test your notification settings (PagerDuty test alert)
4. Ensure you have VPN access to internal tools

### When an Alert Fires

1. **Acknowledge** the alert in PagerDuty within the severity response time
2. **Assess** the impact: Is the service down? Are users affected?
3. **Communicate** in `#ops-alerts`: "Investigating [alert name], impact: [description]"
4. **Follow the runbook** for the specific alert (see below)
5. **Resolve** the alert once the issue is confirmed fixed
6. **Document** what happened and what was done in the incident channel

### Handing Off

1. Brief the incoming on-call on any active issues
2. Share any context about recent deploys or known fragile areas
3. Transfer PagerDuty on-call schedule

---

## Runbooks

### RB-001: API Error Rate High (P1)

**Alert**: 5xx responses > 5% of total for 5 minutes

**Steps**:
1. Check the **API Dashboard** error rate panel to confirm the alert
2. Open **Error Dashboard** > Top Error Paths to identify affected endpoints
3. Check if a recent deploy correlates with the spike (look at `version` in logs)
4. If deploy-related: **initiate rollback** via ECS service update to previous task definition
5. If not deploy-related:
   a. Check **Infrastructure Dashboard** for RDS/Redis health
   b. Search error logs: `level = 50 AND time > [alert start]`
   c. Look for patterns: connection errors, timeout errors, OOM
6. If database: check connection count and query performance
7. If Redis: check memory and connection count
8. Communicate status every 15 minutes in `#ops-alerts`

**Rollback command**:
```bash
aws ecs update-service \
  --cluster kids-learning-production \
  --service kids-learning-production-api \
  --task-definition kids-learning-production-api:<previous-revision>
```

### RB-002: Queue Backlog Growing (P2)

**Alert**: Queue depth > 1000 for 10 minutes

**Steps**:
1. Check **Queue Dashboard** to identify which queue(s) are affected
2. Check worker ECS service: are all tasks running?
   ```bash
   aws ecs describe-services --cluster kids-learning-production --services kids-learning-production-worker
   ```
3. Check worker logs for errors:
   ```
   fields @timestamp, @message
   | filter @logStream like /worker/
   | filter level >= 40
   | sort @timestamp desc
   | limit 50
   ```
4. If workers are crashing: check memory limits, investigate the failing job type
5. If workers are healthy but slow: consider temporarily scaling up:
   ```bash
   aws ecs update-service --cluster kids-learning-production \
     --service kids-learning-production-worker --desired-count 4
   ```
6. If a specific job type is failing repeatedly: consider pausing that queue

### RB-003: DB Connection Pool Exhausted (P1)

**Alert**: Available database connections = 0 for 1 minute

**Steps**:
1. Check RDS connection count in **Infrastructure Dashboard**
2. Check if an API or worker task has a connection leak:
   ```
   fields @timestamp, @message
   | filter @message like /connection/i
   | sort @timestamp desc
   ```
3. **Immediate mitigation**: Restart the API service to release connections:
   ```bash
   aws ecs update-service --cluster kids-learning-production \
     --service kids-learning-production-api --force-new-deployment
   ```
4. If connections spike again immediately: the issue is in the code
   a. Check for missing `prisma.$disconnect()` or unclosed transactions
   b. Check for long-running queries holding connections
5. Consider temporarily increasing RDS max capacity via Terraform

### RB-004: Migration Failed (P1)

**Alert**: Deploy pipeline failed at migration step

**Steps**:
1. **Stop the deployment pipeline immediately** - do not continue to the deploy step
2. Check the migration logs for the specific error:
   ```bash
   npx prisma migrate deploy 2>&1  # locally, against a staging DB
   ```
3. Common issues:
   - Column already exists (migration ran partially) -> manual fix in DB
   - Foreign key constraint -> check data integrity
   - Timeout on large table alter -> consider running migration separately
4. **Never** force-apply a failed migration to production
5. If the migration can be safely re-run, fix the underlying issue and retry
6. If the migration is destructive (data loss risk), involve the engineering lead

### RB-005: Sync Failures Spike (P2)

**Alert**: `sync_errors_total` > 50/min for 5 minutes

**Steps**:
1. Check `sync_errors_total` by `type` label to categorize errors
2. Check Redis health (sync depends on Redis for state)
3. Check if a specific content type or user segment is affected
4. Common error types:
   - `conflict`: Client and server have diverged. Usually self-resolving.
   - `timeout`: Redis or DB too slow. Check infrastructure.
   - `validation`: Client sending bad data. Check client app version.
5. If Redis is the issue: check memory, connection count, and restart if needed
6. If widespread: consider temporarily disabling sync and notifying users

### RB-006: Offline Pack Generation Failed (P3)

**Alert**: Same offline-pack job failed 3 times

**Steps**:
1. Find the failed job in worker logs:
   ```
   fields @timestamp, @message
   | filter @logStream like /worker/
   | filter queue = "offline-packs"
   | filter level >= 40
   ```
2. Common failures:
   - Media file not found in S3 -> check the content's media references
   - Memory exceeded during bundling -> increase worker memory or reduce pack size
   - Sharp (image processing) error -> check the source image format
3. For retrying a job manually, use BullMQ's retry mechanism through the admin UI or API

### RB-007: Media Processing Stuck (P3)

**Alert**: Active media job > 5 minutes

**Steps**:
1. Identify the stuck job in worker logs
2. Check Sharp memory usage (image processing can OOM on very large images)
3. If the worker is unresponsive: restart the worker service
4. If the image/video is too large: the content needs to be re-uploaded at a smaller size
5. Consider setting a hard timeout on media processing jobs

### RB-008: Certificate Expiry (P2)

**Alert**: TLS certificate expires in < 14 days

**Steps**:
1. Check ACM in the AWS Console for the certificate status
2. If using ACM with auto-renewal: check DNS validation records are still in place
3. If DNS validation failed: update the CNAME record in Route 53
4. If using manual certificates: initiate renewal through the certificate provider
5. Apply the new certificate ARN via Terraform if it changed

### RB-009: Disk Usage High (P2)

**Alert**: ECS ephemeral storage > 85%

**Steps**:
1. Identify which service (API or worker) has high disk usage
2. Common causes:
   - Temp files from media processing not cleaned up
   - Log files growing (should not happen with CloudWatch logging)
   - Large file downloads cached locally
3. **Immediate mitigation**: Restart the affected service to get a fresh container
4. **Long-term fix**: Add cleanup logic for temp files after processing
