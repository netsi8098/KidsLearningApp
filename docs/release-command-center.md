# Release Command Center - Design Specification

> A unified admin page for monitoring deployments, managing environments, and executing release operations across all Kids Learning Fun services.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Environment Overview Dashboard](#environment-overview-dashboard)
4. [Environment Diff View](#environment-diff-view)
5. [Deployment History](#deployment-history)
6. [Operator Actions](#operator-actions)
7. [Release Readiness Panel](#release-readiness-panel)
8. [Data Sources](#data-sources)
9. [Access Control](#access-control)
10. [API Endpoints](#api-endpoints)
11. [Wireframes](#wireframes)
12. [Implementation Plan](#implementation-plan)

---

## Overview

The Release Command Center is a page within the existing admin dashboard that gives operators a single view of:

- What version is deployed to each environment
- Whether environments are healthy
- Differences between staging and production
- Deployment history with rollback links
- Guarded operator actions (deploy, maintenance, feature flags, cache)

### Design Principles

1. **Read-heavy, write-guarded**: Dashboard is primarily for observation. Actions require confirmation dialogs.
2. **Real-time where it matters**: Health status auto-refreshes. History loads on demand.
3. **Non-destructive defaults**: All actions are reversible. Destructive actions require explicit confirmation.
4. **Audit trail**: Every operator action is logged to the audit system.
5. **Kids app context**: The UI uses the admin dashboard's existing design system (not the kid-facing theme).

---

## Architecture

```
+---------------------------+
|  Admin Dashboard (React)  |
|                           |
|  /releases/command-center |
|     |                     |
|     +-- EnvironmentCards  |
|     +-- DiffView          |
|     +-- DeployHistory     |
|     +-- OperatorActions   |
|     +-- ReadinessPanel    |
+---------------------------+
           |
           | API calls
           v
+---------------------------+
|  Backend API              |
|                           |
|  GET  /api/system/health  |
|  GET  /api/system/info    |
|  GET  /api/system/queues  |
|  GET  /api/system/maintenance |
|  POST /api/system/maintenance |
|  GET  /api/feature-flags  |
|  PATCH /api/feature-flags/:key |
|  GET  /api/releases/deployments (new) |
|  POST /api/releases/deploy (new)      |
|  POST /api/releases/rollback (new)    |
|  POST /api/system/cache/invalidate (new) |
+---------------------------+
           |
           | Data from
           v
+---------------------------+
|  External Services        |
|                           |
|  GitHub API (tags, SHAs)  |
|  Container Registry       |
|  CloudWatch Metrics       |
|  PostgreSQL (migrations)  |
|  Redis (queue stats)      |
+---------------------------+
```

---

## Environment Overview Dashboard

The top section shows a card for each environment with real-time status.

### Environments

| Environment | URL | Purpose |
|---|---|---|
| Development | `dev.kidslearningfun.app` | Continuous deploy from `develop` |
| Staging | `staging.kidslearningfun.app` | Release candidate testing |
| Production | `kidslearningfun.app` | Live user traffic |

### Environment Card Layout

```
+-------------------------------------------------------+
| PRODUCTION                              [green dot] OK |
|-------------------------------------------------------|
| Version:        v1.3.0 (abc1234)                      |
| Deployed:       March 25, 2026 at 2:15 PM             |
| Deployed by:    jane@example.com (via tag v1.3.0)     |
|-------------------------------------------------------|
| Services:                                              |
|   Frontend   v1.3.0  [green]  5 min ago               |
|   API        v1.3.0  [green]  5 min ago               |
|   Workers    v1.3.0  [green]  5 min ago               |
|   Admin      v1.3.0  [green]  5 min ago               |
|-------------------------------------------------------|
| Key Metrics (last hour):                               |
|   Error rate:    0.12%                                 |
|   P99 latency:   245ms                                 |
|   Active users:  1,247                                 |
|-------------------------------------------------------|
| Feature Flags:   14 active / 3 recent changes          |
| Pending Migrations: 0                                  |
| Queue Backlog:   23 jobs (media: 20, ai: 3)           |
|-------------------------------------------------------|
| [View Logs]  [View Metrics]  [Actions v]               |
+-------------------------------------------------------+
```

### Status Indicators

| Color | Meaning | Condition |
|---|---|---|
| Green | Healthy | All health checks pass, error rate < 1% |
| Yellow | Degraded | Health checks pass, error rate 1-5% OR queue backlog > 1000 |
| Red | Unhealthy | Health check failing OR error rate > 5% OR service down |
| Gray | Unknown | Cannot reach health endpoint |

### Per-Service Health

Each service within an environment has its own health status:

| Service | Health Check | How |
|---|---|---|
| Frontend | CDN origin responds 200 | `GET /` returns 200 |
| API | Health endpoint responds | `GET /health` returns `{"status":"ok"}` |
| Workers | Processing jobs, no crash loops | Queue depth decreasing, container stable |
| Admin | CDN origin responds 200 | `GET /` returns 200 |

### Auto-Refresh

- Environment cards auto-refresh every 30 seconds
- Health status badges update via polling (not WebSocket, to keep it simple)
- Queue depths update every 60 seconds
- Error rate updates every 60 seconds

---

## Environment Diff View

Side-by-side comparison between any two environments. Default view: staging vs. production.

### Diff Categories

#### Version Diff

```
+---------------------------+---------------------------+
|        STAGING            |       PRODUCTION          |
|---------------------------|---------------------------|
| Frontend:  v1.4.0-rc.1   | Frontend:  v1.3.0         |
| API:       v1.4.0-rc.1   | API:       v1.3.0         |
| Workers:   v1.4.0-rc.1   | Workers:   v1.3.0         |
| Admin:     v1.4.0-rc.1   | Admin:     v1.3.0         |
+---------------------------+---------------------------+
```

#### Configuration Diff

Show environment-specific config differences (excluding secrets):

```
Configuration Differences:
  RATE_LIMIT_MAX:          staging=500        production=200
  LOG_LEVEL:               staging=debug      production=info
  LOG_FORMAT:              staging=pretty     production=json
  WORKER_AI_CONCURRENCY:   staging=2          production=4
```

#### Feature Flag Diff

Show flags that differ between environments:

```
Feature Flag Differences:
  new_phonics_game:        staging=enabled    production=disabled
  redesigned_dashboard:    staging=enabled    production=disabled
  beta_sync_v2:            staging=enabled    production=disabled
```

#### Schema Version Diff

```
Database Schema:
  Staging:    Migration #47 (20260325_add_phonics_table)
  Production: Migration #45 (20260315_add_collections)

  Pending migrations for production:
    #46: 20260320_add_skill_tracking
    #47: 20260325_add_phonics_table
```

#### Code Diff Summary

Link to GitHub compare view between the two deployed SHAs:

```
Code changes: 23 commits, 47 files changed
[View on GitHub: abc1234...def5678]
```

---

## Deployment History

A table showing the last 20 deployments per environment.

### Table Columns

| Column | Description |
|---|---|
| Timestamp | When the deployment started |
| Environment | dev / staging / production |
| Version | Git tag or SHA |
| Services | Which services were deployed |
| Triggered by | Username or "automated (tag push)" |
| Duration | How long the deployment took |
| Status | Success / Failed / Rolled Back |
| Actions | [View Logs] [Rollback to this] |

### Example

```
+---------------------+------------+-----------+------------------+------------------+----------+------------+-----------+
| Timestamp           | Env        | Version   | Services         | Triggered by     | Duration | Status     | Actions   |
+---------------------+------------+-----------+------------------+------------------+----------+------------+-----------+
| 2026-03-25 14:15    | production | v1.3.0    | all              | Tag push         | 4m 23s   | Success    | [Logs]    |
| 2026-03-25 10:00    | staging    | v1.3.0-rc1| all              | jane@example.com | 3m 45s   | Success    | [Logs]    |
| 2026-03-24 16:30    | production | v1.2.1    | api, worker      | Hotfix           | 2m 10s   | Success    | [Rollback]|
| 2026-03-20 14:00    | production | v1.2.0    | all              | Tag push         | 4m 15s   | Success    | [Rollback]|
| 2026-03-20 09:00    | staging    | v1.2.0-rc1| all              | bob@example.com  | 3m 50s   | Failed     | [Logs]    |
+---------------------+------------+-----------+------------------+------------------+----------+------------+-----------+
```

### Deployment Detail View

Clicking a deployment row expands to show:
- Full deployment log (timestamped steps)
- Services deployed with their image tags
- Pre-deploy health check results
- Post-deploy health check results
- Rollback link (if applicable)
- Related GitHub Actions run link

---

## Operator Actions

Guarded actions that operators can perform from the command center. All actions require confirmation and are audit-logged.

### Action: Trigger Deployment

```
+-------------------------------------------+
| Deploy to Environment                      |
|-------------------------------------------|
| Environment: [Staging v]                   |
| Version:     [v1.4.0-rc.1 v]  (dropdown)  |
| Services:    [x] Frontend                  |
|              [x] API                       |
|              [x] Workers                   |
|              [x] Admin                     |
|                                            |
| [Cancel]              [Deploy to Staging]  |
+-------------------------------------------+

Confirmation dialog:
+-------------------------------------------+
| Confirm Deployment                         |
|-------------------------------------------|
| You are about to deploy v1.4.0-rc.1       |
| to STAGING (all services).                 |
|                                            |
| This will:                                 |
|  - Build and push Docker images            |
|  - Run database migrations (if any)        |
|  - Deploy to staging environment           |
|                                            |
| Type "deploy staging" to confirm:          |
| [________________________]                 |
|                                            |
| [Cancel]              [Confirm Deploy]     |
+-------------------------------------------+
```

**Guards**:
- Production deploys require typing the environment name to confirm
- Only users with `admin` role can trigger production deploys
- Staging deploys require `admin` or `editor` role
- Deploy button disabled if CI is failing for the selected version

### Action: Enable/Disable Maintenance Mode

```
+-------------------------------------------+
| Maintenance Mode                           |
|-------------------------------------------|
| Current status: [OFF]                      |
|                                            |
| Enable maintenance mode:                   |
| Reason: [Database migration___________]    |
| Estimated end: [2026-03-26 15:00 ___]      |
|                                            |
| [Enable Maintenance Mode]                  |
+-------------------------------------------+
```

**Guards**:
- Requires `admin` role
- Confirmation dialog before enabling
- Disabling does not require confirmation

### Action: Toggle Feature Flag

```
+-------------------------------------------+
| Quick Flag Toggle                          |
|-------------------------------------------|
| Flag: [new_phonics_game      v]            |
| Current: Disabled                          |
|                                            |
| [Enable]  [Disable]  [View Details]        |
+-------------------------------------------+
```

**Guards**:
- Requires `admin` role
- Shows flag description and current targeting rules
- Confirmation dialog includes impact assessment

### Action: Invalidate Cache

```
+-------------------------------------------+
| Cache Invalidation                         |
|-------------------------------------------|
| Target: [All caches           v]           |
|         [CDN (CloudFront)     ]            |
|         [API cache (Redis)    ]            |
|         [All caches           ]            |
|                                            |
| Pattern: [*_________________]              |
|          (optional: filter by key pattern) |
|                                            |
| [Invalidate Cache]                         |
+-------------------------------------------+
```

**Guards**:
- Requires `admin` role
- CDN invalidation limited to 10 per hour (AWS limit)
- Confirmation dialog

### Action: View Logs

External link to the logging service (e.g., CloudWatch, Datadog):

```
[View API Logs]     -> https://console.aws.amazon.com/cloudwatch/...
[View Worker Logs]  -> https://console.aws.amazon.com/cloudwatch/...
[View Deploy Logs]  -> https://github.com/.../actions/runs/...
```

---

## Release Readiness Panel

A checklist panel that evaluates whether the current staging build is ready for production release.

### Readiness Checks

```
+-------------------------------------------+
| Release Readiness: v1.4.0-rc.1            |
|-------------------------------------------|
| [check] All CI checks passing              |
| [check] Staging deployed and healthy       |
| [check] Staging soak: 2h 15m (>1h req)    |
| [check] No P1/P0 alerts in staging         |
| [check] Bundle size within budget           |
| [warn]  QA sign-off: Pending               |
| [check] Release notes drafted               |
| [check] Rollback plan: Standard             |
| [check] No pending migrations               |
| [check] Feature flags configured             |
|                                            |
| Readiness: 9/10 checks passing             |
| Blocking: QA sign-off                       |
|                                            |
| [Start Go/No-Go Meeting]                   |
| [Promote to Production]  (disabled)         |
+-------------------------------------------+
```

### Check Details

| Check | Source | Auto or Manual |
|---|---|---|
| CI checks passing | GitHub API (check runs for the commit) | Auto |
| Staging deployed | Deployment history | Auto |
| Staging soak time | Time since staging deploy | Auto |
| No P1/P0 alerts | Monitoring/alerting system | Auto |
| Bundle size within budget | CI artifact (bundle size report) | Auto |
| QA sign-off | Manual checkbox (stored in release record) | Manual |
| Release notes drafted | Check if CHANGELOG.md updated | Auto (approximate) |
| Rollback plan | Default "standard" unless custom needed | Auto/Manual |
| No pending migrations | Compare schema versions | Auto |
| Feature flags configured | Compare flag state across environments | Auto |

### Promote to Production

The "Promote to Production" button is enabled only when all required checks pass. Clicking it:

1. Opens a confirmation dialog with the full checklist
2. Requires typing "promote production" to confirm
3. Creates a Git tag on the release commit
4. Triggers the deployment pipeline for production
5. Records the promotion in the deployment history

---

## Data Sources

### Real-Time Data

| Data Point | Source | Refresh Rate |
|---|---|---|
| Service health | `GET /health` per environment | 30 seconds |
| Queue depths | `GET /api/system/queues` | 60 seconds |
| Error rate | CloudWatch or application metrics | 60 seconds |
| Active users | Analytics real-time endpoint | 60 seconds |
| Maintenance status | `GET /api/system/maintenance` | 30 seconds |

### On-Demand Data

| Data Point | Source | When Loaded |
|---|---|---|
| Deployment history | Database (new `Deployment` table) | Page load + pagination |
| Feature flag list | `GET /api/feature-flags` | On diff view open |
| CI check status | GitHub API | On readiness panel open |
| Schema version | `prisma migrate status` output stored in deploy record | On diff view open |
| Code diff summary | GitHub API (compare commits) | On diff view open |

### Static Configuration

| Data Point | Source |
|---|---|
| Environment URLs | Hardcoded in admin config |
| Bundle size budget | CI workflow (200KB gzip limit) |
| Soak time requirement | 1 hour (configurable) |
| Log service URLs | Admin config per environment |

---

## Access Control

### Role Permissions

| Action | admin | editor | reviewer | viewer |
|---|---|---|---|---|
| View dashboard | Yes | Yes | Yes | Yes |
| View deployment history | Yes | Yes | Yes | Yes |
| View environment diff | Yes | Yes | Yes | No |
| Trigger staging deploy | Yes | Yes | No | No |
| Trigger production deploy | Yes | No | No | No |
| Enable maintenance mode | Yes | No | No | No |
| Toggle feature flags | Yes | No | No | No |
| Invalidate cache | Yes | No | No | No |
| Promote to production | Yes | No | No | No |
| Rollback production | Yes | No | No | No |
| QA sign-off checkbox | Yes | Yes | Yes | No |

### Audit Logging

Every operator action generates an audit log entry:

```json
{
  "action": "release.deploy",
  "entity": "Deployment",
  "entityId": "deploy-abc123",
  "changes": {
    "environment": "production",
    "version": "v1.4.0",
    "services": ["frontend", "api", "worker", "admin"]
  },
  "userId": "user-jane-123",
  "timestamp": "2026-03-26T14:15:00Z"
}
```

---

## API Endpoints

### New Endpoints Required

These endpoints need to be added to the backend to support the release command center.

#### `GET /api/releases/deployments`

List deployment history.

```
Query params:
  environment: string (optional, filter by environment)
  status: string (optional: success, failed, rolled_back)
  page: number (default: 1)
  limit: number (default: 20)

Response:
{
  "data": [
    {
      "id": "deploy-abc123",
      "environment": "production",
      "version": "v1.3.0",
      "gitSha": "abc1234def5678",
      "services": ["frontend", "api", "worker", "admin"],
      "triggeredBy": {
        "userId": "user-123",
        "email": "jane@example.com",
        "method": "tag_push"
      },
      "status": "success",
      "startedAt": "2026-03-25T14:15:00Z",
      "completedAt": "2026-03-25T14:19:23Z",
      "duration": 263,
      "healthCheckPassed": true,
      "rollbackOf": null,
      "actionsRunUrl": "https://github.com/.../actions/runs/123"
    }
  ],
  "total": 47,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

#### `POST /api/releases/deploy`

Trigger a deployment (calls GitHub Actions workflow_dispatch).

```
Body:
{
  "environment": "staging",
  "version": "v1.4.0-rc.1",
  "services": ["frontend", "api", "worker", "admin"]
}

Response:
{
  "deploymentId": "deploy-def456",
  "status": "triggered",
  "actionsRunUrl": "https://github.com/.../actions/runs/456"
}
```

#### `POST /api/releases/rollback`

Trigger a rollback to a previous deployment.

```
Body:
{
  "environment": "production",
  "targetDeploymentId": "deploy-abc123"
}

Response:
{
  "rollbackId": "deploy-ghi789",
  "status": "triggered",
  "rollingBackTo": "v1.2.0"
}
```

#### `POST /api/system/cache/invalidate`

Invalidate caches.

```
Body:
{
  "target": "all" | "cdn" | "redis",
  "pattern": "*"
}

Response:
{
  "invalidated": true,
  "target": "all",
  "pattern": "*",
  "details": {
    "cdn": { "invalidationId": "I1234", "status": "InProgress" },
    "redis": { "keysCleared": 142 }
  }
}
```

#### `GET /api/releases/readiness`

Get release readiness status for the current staging build.

```
Response:
{
  "version": "v1.4.0-rc.1",
  "environment": "staging",
  "checks": [
    { "name": "ci_passing", "status": "pass", "details": "All 7 checks passed" },
    { "name": "staging_deployed", "status": "pass", "details": "Deployed 2h 15m ago" },
    { "name": "staging_soak", "status": "pass", "details": "2h 15m (minimum: 1h)" },
    { "name": "no_p1_alerts", "status": "pass", "details": "No alerts in last 2h" },
    { "name": "bundle_size", "status": "pass", "details": "156KB gzip (budget: 200KB)" },
    { "name": "qa_signoff", "status": "pending", "details": "Awaiting QA sign-off" },
    { "name": "release_notes", "status": "pass", "details": "CHANGELOG.md updated" },
    { "name": "rollback_plan", "status": "pass", "details": "Standard rollback" },
    { "name": "pending_migrations", "status": "pass", "details": "0 pending" },
    { "name": "feature_flags", "status": "pass", "details": "All flags configured" }
  ],
  "overallStatus": "blocked",
  "blockingChecks": ["qa_signoff"],
  "readyToPromote": false
}
```

#### `POST /api/releases/readiness/signoff`

Record a manual sign-off (QA, etc.).

```
Body:
{
  "check": "qa_signoff",
  "version": "v1.4.0-rc.1",
  "approved": true,
  "notes": "Regression suite passed. 2 minor cosmetic issues logged for next cycle."
}
```

---

## Wireframes

### Main Dashboard Layout

```
+================================================================+
| Release Command Center                      [Refresh] [30s ago]|
+================================================================+
|                                                                 |
| +------------------+ +------------------+ +------------------+  |
| | DEV              | | STAGING          | | PRODUCTION       |  |
| | v1.4.0-dev.23    | | v1.4.0-rc.1      | | v1.3.0           |  |
| | [green] Healthy  | | [green] Healthy  | | [green] Healthy  |  |
| | 0 queue backlog  | | 5 queue backlog  | | 23 queue backlog |  |
| |                  | |                  | |                  |  |
| | [View Details]   | | [View Details]   | | [View Details]   |  |
| +------------------+ +------------------+ +------------------+  |
|                                                                 |
| +--------------------------------------------------------------+|
| | Environment Diff: [Staging v] vs [Production v]              ||
| |--------------------------------------------------------------||
| | Versions    | v1.4.0-rc.1         | v1.3.0                  ||
| | Config (3)  | LOG_LEVEL=debug      | LOG_LEVEL=info          ||
| | Flags (2)   | new_phonics=on       | new_phonics=off         ||
| | Schema      | Migration #47        | Migration #45           ||
| | Code        | +23 commits, 47 files [View on GitHub]         ||
| +--------------------------------------------------------------+|
|                                                                 |
| +-------------------------------+  +---------------------------+|
| | Deployment History            |  | Release Readiness         ||
| |-------------------------------|  |---------------------------||
| | Mar 25 14:15 PROD v1.3.0  OK |  | v1.4.0-rc.1              ||
| | Mar 25 10:00 STG  v1.4-rc OK |  | [x] CI passing            ||
| | Mar 24 16:30 PROD v1.2.1  OK |  | [x] Staging healthy       ||
| | Mar 20 14:00 PROD v1.2.0  OK |  | [x] Soak: 2h 15m         ||
| | Mar 20 09:00 STG  v1.2-rc FL |  | [ ] QA sign-off           ||
| |                               |  | [x] Bundle OK             ||
| | [View All Deployments]        |  |                           ||
| +-------------------------------+  | [Promote to Production]   ||
|                                    +---------------------------+|
|                                                                 |
| +--------------------------------------------------------------+|
| | Operator Actions                                  [admin]    ||
| |--------------------------------------------------------------||
| | [Deploy to Staging] [Maintenance Mode] [Toggle Flag] [Cache] ||
| +--------------------------------------------------------------+|
+================================================================+
```

### Mobile / Narrow View

On narrow screens, the environment cards stack vertically and the diff view becomes a tabbed interface instead of side-by-side.

---

## Implementation Plan

### Phase 1: Backend API (1 week)

1. Create `Deployment` database model (Prisma schema)
2. Implement deployment history endpoints (`GET /api/releases/deployments`)
3. Implement readiness check endpoint (`GET /api/releases/readiness`)
4. Implement cache invalidation endpoint (`POST /api/system/cache/invalidate`)
5. Wire up deployment trigger to GitHub Actions API
6. Add audit logging for all new operator actions
7. Unit tests for all new endpoints

### Phase 2: Admin Frontend - Dashboard (1 week)

1. Create `ReleaseCommandCenter` page component
2. Implement `EnvironmentCard` component with health polling
3. Implement `DeploymentHistory` table with pagination
4. Create admin route at `/releases/command-center`
5. Add navigation link in admin sidebar
6. Responsive layout for mobile

### Phase 3: Admin Frontend - Actions (1 week)

1. Implement `EnvironmentDiff` component
2. Implement `ReleaseReadiness` panel
3. Build operator action dialogs (deploy, maintenance, flags, cache)
4. Implement confirmation flows with type-to-confirm
5. Connect to backend API endpoints
6. Add role-based action visibility

### Phase 4: Polish & Testing (1 week)

1. Auto-refresh with configurable intervals
2. Error states and loading skeletons
3. Integration tests for operator flows
4. Documentation and team walkthrough
5. Deploy to staging for dogfooding

### Database Model

```prisma
model Deployment {
  id             String    @id @default(cuid())
  environment    String    // dev, staging, production
  version        String    // v1.3.0, sha-abc1234
  gitSha         String
  services       String[]  // ["frontend", "api", "worker", "admin"]
  triggeredById  String?
  triggeredBy    User?     @relation(fields: [triggeredById], references: [id])
  triggerMethod  String    // manual, tag_push, rollback
  status         String    // pending, running, success, failed, rolled_back
  startedAt      DateTime  @default(now())
  completedAt    DateTime?
  duration       Int?      // seconds
  healthCheck    Boolean?
  rollbackOfId   String?
  rollbackOf     Deployment? @relation("Rollback", fields: [rollbackOfId], references: [id])
  rollbacks      Deployment[] @relation("Rollback")
  actionsRunUrl  String?
  notes          String?
  metadata       Json?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  @@index([environment, createdAt(sort: Desc)])
  @@index([status])
}

model ReleaseSignoff {
  id          String   @id @default(cuid())
  version     String
  checkName   String   // qa_signoff, security_review, etc.
  approved    Boolean
  notes       String?
  signedById  String
  signedBy    User     @relation(fields: [signedById], references: [id])
  createdAt   DateTime @default(now())

  @@unique([version, checkName])
  @@index([version])
}
```
