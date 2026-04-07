# Environment Topology & Architecture

> Kids Learning Fun Platform -- Infrastructure, Environments, and Deployment Reference

**Last updated:** 2026-03-26
**Maintainer:** Platform Engineering

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Environment Definitions](#2-environment-definitions)
3. [Service Deployment Map](#3-service-deployment-map)
4. [Domain & Subdomain Routing](#4-domain--subdomain-routing)
5. [Naming Conventions](#5-naming-conventions)
6. [Deployment Dependency Map](#6-deployment-dependency-map)
7. [Environment Parity Matrix](#7-environment-parity-matrix)
8. [Architecture Diagram](#8-architecture-diagram)
9. [Release Flow](#9-release-flow)
10. [Configuration Reference](#10-configuration-reference)
11. [Operational Runbook Notes](#11-operational-runbook-notes)

---

## 1. Architecture Overview

The Kids Learning Fun platform is composed of five service layers:

| Layer | Technology | Role |
|-------|-----------|------|
| **Frontend PWA** | React 19, Vite 6, Tailwind CSS v4, Dexie.js (IndexedDB), Workbox PWA | Child-facing learning app, installable offline |
| **Admin Dashboard** | React 19, Vite 6, Tailwind CSS v4, Recharts | Content management, analytics, editorial workflows |
| **Backend API** | Express 4, TypeScript, Prisma ORM, Zod validation | REST API with 40 modules (~178 endpoints) |
| **Workers** | BullMQ (7 queues) via Redis | Async processing: media, AI, releases, QA, localization, analytics, offline packs |
| **Data Stores** | PostgreSQL (30+ tables), Redis, S3-compatible object storage | Persistence, caching, queues, file storage |

### Service Inventory

```
kidslearningapp/              Frontend PWA (port 5173)
kidslearningapp/admin/        Admin Dashboard (port 5174, proxies /api -> :4000)
kidslearningapp/backend/      Backend API (port 4000)
kidslearningapp/backend/      Workers (same codebase, BullMQ processors)
```

### BullMQ Queue Registry

| Queue Name | Purpose |
|-----------|---------|
| `media-processing` | Image resizing (sharp), variant generation, format conversion |
| `ai-generation` | AI content briefs, story drafts, illustration prompts |
| `content-release` | Scheduled publish/unpublish/archive/feature actions |
| `localization` | Translation pipeline, locale file generation |
| `offline-packs` | Bundle content + assets for offline download |
| `analytics-aggregate` | Roll up daily/weekly/monthly content analytics |
| `content-qa` | Automated quality checks (40 check types) |

---

## 2. Environment Definitions

### 2.1 Local

| Attribute | Value |
|-----------|-------|
| **Purpose** | Individual developer workstation; full-stack development with hot reload |
| **Data strategy** | Seed data via `prisma/seed.ts`; throwaway, reset at will |
| **Access** | Developer only (localhost) |
| **Deployment trigger** | Manual (`npm run dev` in each service) |
| **URL pattern** | `http://localhost:5173` (PWA), `http://localhost:5174` (Admin), `http://localhost:4000` (API) |
| **Infrastructure tier** | Docker Compose for Postgres + Redis; Vite dev servers; tsx watch for API |
| **Workers** | Not running by default; opt-in via `npm run workers` |
| **Storage** | Local filesystem (`./uploads/`) |
| **Database** | PostgreSQL in Docker container, single instance, no replicas |
| **Redis** | Docker container, no persistence, no cluster |

**Setup:**
```bash
# Start infrastructure
docker compose up -d postgres redis

# Start services (separate terminals or use a process manager)
cd backend && npm run dev          # API on :4000
cd admin && npm run dev            # Admin on :5174
npm run dev                        # PWA on :5173
```

### 2.2 Dev

| Attribute | Value |
|-----------|-------|
| **Purpose** | Shared development environment for integration testing; always reflects the latest `develop` branch |
| **Data strategy** | Ephemeral; may be wiped and re-seeded at any time; auto-seeded on deploy |
| **Access** | All developers, QA team |
| **Deployment trigger** | Auto-deploy on push/merge to `develop` branch |
| **URL pattern** | `app.dev.kidslearning.fun`, `admin.dev.kidslearning.fun`, `api.dev.kidslearning.fun` |
| **Infrastructure tier** | Managed Postgres (RDS or equivalent, single instance), Managed Redis (ElastiCache, single node), S3 bucket (`kids-learning-dev-assets`) |
| **Workers** | 1 container, all 7 queues |
| **API** | 1 container |

### 2.3 Preview

| Attribute | Value |
|-----------|-------|
| **Purpose** | Per-pull-request ephemeral environments for isolated feature review |
| **Data strategy** | Fixture data loaded on creation; shares dev database with prefixed schemas or isolated schema per PR |
| **Access** | PR author, reviewers, QA |
| **Deployment trigger** | Auto-created when a PR is opened; auto-destroyed when the PR is merged or closed |
| **URL pattern** | `app-pr-{number}.preview.kidslearning.fun`, `api-pr-{number}.preview.kidslearning.fun` |
| **Infrastructure tier** | Shared dev Postgres (isolated schema), shared dev Redis (queue prefix per PR), S3 dev bucket |
| **Workers** | Not running (async jobs are not tested in preview; stubs return immediate results) |
| **API** | 1 container, ephemeral |
| **Lifetime** | Destroyed automatically when PR is closed/merged; max age 7 days |

### 2.4 Staging

| Attribute | Value |
|-----------|-------|
| **Purpose** | Pre-production mirror; final validation before production release |
| **Data strategy** | Production-like; populated with anonymized production snapshot or curated dataset; never wiped without notice |
| **Access** | Developers, QA, product managers, stakeholders |
| **Deployment trigger** | Auto-deploy from `release/*` branches; manual promotion also supported |
| **URL pattern** | `app.staging.kidslearning.fun`, `admin.staging.kidslearning.fun`, `api.staging.kidslearning.fun` |
| **Infrastructure tier** | Managed Postgres (RDS, single instance with read replica), Managed Redis (ElastiCache, single node with persistence), S3 staging bucket |
| **Workers** | 1 container, all 7 queues |
| **API** | 2 containers behind load balancer |

### 2.5 Production

| Attribute | Value |
|-----------|-------|
| **Purpose** | Live environment serving real users; maximum reliability and performance |
| **Data strategy** | Real user data; daily automated backups with 30-day retention; point-in-time recovery enabled |
| **Access** | All users (public); operator access via VPN + IAM roles |
| **Deployment trigger** | Tag-based deployment from `main` branch (e.g., `v1.2.3`); requires approval gate |
| **URL pattern** | `app.kidslearning.fun`, `admin.kidslearning.fun`, `api.kidslearning.fun`, `media.kidslearning.fun` |
| **Infrastructure tier** | Managed Postgres (RDS, Multi-AZ, read replicas), Managed Redis (ElastiCache cluster mode), CloudFront CDN, S3 production bucket |
| **Workers** | 2 containers (auto-scaling to 4) |
| **API** | 3 containers (auto-scaling to 6) |

---

## 3. Service Deployment Map

| Service | Local | Dev | Preview | Staging | Production |
|---------|-------|-----|---------|---------|------------|
| **Frontend PWA** | Vite dev server `:5173` | Static on CDN | Static on CDN | Static on CDN | CloudFront CDN |
| **Admin Dashboard** | Vite dev server `:5174` | Static on CDN | Static on CDN | Static on CDN | CloudFront CDN |
| **Backend API** | `tsx watch` `:4000` | 1 container | 1 container (ephemeral) | 2 containers (ALB) | 3 containers (ALB, auto-scale to 6) |
| **Workers** | Not running (opt-in) | 1 container | Not running | 1 container | 2 containers (auto-scale to 4) |
| **PostgreSQL** | Docker container `:5432` | Managed (RDS/equiv) | Shared dev DB (schema isolation) | Managed (RDS, 1 replica) | Managed (RDS, Multi-AZ, 2 replicas) |
| **Redis** | Docker container `:6379` | Managed (ElastiCache) | Shared dev Redis (prefixed) | Managed (ElastiCache) | Managed (ElastiCache, cluster) |
| **Object Storage** | Local `./uploads/` | S3 `kids-learning-dev-assets` | S3 `kids-learning-dev-assets` (prefixed) | S3 `kids-learning-staging-assets` | S3 `kids-learning-prod-assets` |
| **CDN** | None | CloudFront (dev distro) | CloudFront (dev distro) | CloudFront (staging distro) | CloudFront (prod distro) |
| **SSL/TLS** | None (HTTP) | ACM managed cert | ACM wildcard cert | ACM managed cert | ACM managed cert |
| **Logging** | Console (stdout) | CloudWatch | CloudWatch | CloudWatch | CloudWatch + alerts |
| **Monitoring** | None | Basic health checks | None | Full APM, no alerts | Full APM + PagerDuty alerts |

### Container Resources

| Service | Dev | Staging | Production |
|---------|-----|---------|------------|
| API | 0.5 vCPU, 512 MB | 1 vCPU, 1 GB | 2 vCPU, 2 GB |
| Workers | 0.5 vCPU, 512 MB | 0.5 vCPU, 1 GB | 1 vCPU, 2 GB |

### Database Sizing

| Attribute | Dev | Staging | Production |
|-----------|-----|---------|------------|
| Instance class | db.t3.micro | db.t3.small | db.r6g.large |
| Storage | 20 GB gp3 | 50 GB gp3 | 100 GB gp3 (auto-scale) |
| Max connections | 50 | 100 | 200 |
| Backup retention | 1 day | 7 days | 30 days |
| Multi-AZ | No | No | Yes |
| Read replicas | 0 | 1 | 2 |

---

## 4. Domain & Subdomain Routing

### Production
```
app.kidslearning.fun              --> CloudFront --> S3 (Frontend PWA)
admin.kidslearning.fun            --> CloudFront --> S3 (Admin Dashboard)
api.kidslearning.fun              --> ALB --> API containers (port 4000)
media.kidslearning.fun            --> CloudFront --> S3 (kids-learning-prod-assets)
```

### Staging
```
app.staging.kidslearning.fun      --> CloudFront --> S3 (Frontend PWA, staging build)
admin.staging.kidslearning.fun    --> CloudFront --> S3 (Admin Dashboard, staging build)
api.staging.kidslearning.fun      --> ALB --> API containers (port 4000)
media.staging.kidslearning.fun    --> CloudFront --> S3 (kids-learning-staging-assets)
```

### Dev
```
app.dev.kidslearning.fun          --> CloudFront --> S3 (Frontend PWA, dev build)
admin.dev.kidslearning.fun        --> CloudFront --> S3 (Admin Dashboard, dev build)
api.dev.kidslearning.fun          --> ALB --> API container (port 4000)
media.dev.kidslearning.fun        --> CloudFront --> S3 (kids-learning-dev-assets)
```

### Preview (per PR)
```
app-pr-{number}.preview.kidslearning.fun     --> CloudFront --> S3 (ephemeral build)
api-pr-{number}.preview.kidslearning.fun     --> Ephemeral container (port 4000)
```
- Admin dashboard is not deployed for preview environments (use dev admin instead)
- Workers are not deployed for preview environments

### DNS Configuration
```
Zone: kidslearning.fun

# Production
app.kidslearning.fun.          CNAME  d1234abcdef.cloudfront.net.
admin.kidslearning.fun.        CNAME  d5678ghijkl.cloudfront.net.
api.kidslearning.fun.          ALIAS  api-prod-alb-123456.us-east-1.elb.amazonaws.com.
media.kidslearning.fun.        CNAME  d9012mnopqr.cloudfront.net.

# Staging (wildcard or explicit)
*.staging.kidslearning.fun.    CNAME  <staging-cloudfront-or-alb>

# Dev
*.dev.kidslearning.fun.        CNAME  <dev-cloudfront-or-alb>

# Preview (wildcard)
*.preview.kidslearning.fun.    CNAME  <preview-cloudfront-or-alb>
```

### SSL/TLS Certificates
| Domain Pattern | Provider | Type |
|---------------|----------|------|
| `kidslearning.fun`, `*.kidslearning.fun` | AWS ACM | Wildcard |
| `*.staging.kidslearning.fun` | AWS ACM | Wildcard |
| `*.dev.kidslearning.fun` | AWS ACM | Wildcard |
| `*.preview.kidslearning.fun` | AWS ACM | Wildcard |

---

## 5. Naming Conventions

### 5.1 Environments
```
local       Developer laptop (never deployed)
dev         Shared development server
preview     Per-PR ephemeral environment
staging     Pre-production mirror
production  Live environment
```

Always use the full name in configuration and code. Never abbreviate (`prod`, `stg`).

### 5.2 Branch Naming
```
main                 Production-ready code (protected, requires PR)
develop              Integration branch, auto-deploys to dev
feature/{ticket}-{desc}    New features          (e.g., feature/KL-142-singalong-player)
fix/{ticket}-{desc}        Bug fixes             (e.g., fix/KL-201-redis-timeout)
release/v{semver}          Release candidates     (e.g., release/v1.3.0)
hotfix/v{semver}           Production hotfixes    (e.g., hotfix/v1.2.1)
content/{YYYY-MM-DD}       Content-only drops     (e.g., content/2026-04-01)
```

### 5.3 Release & Version Naming
```
Application releases:  v{major}.{minor}.{patch}     e.g., v1.3.0, v1.3.1
Content drops:         content-{YYYY-MM-DD}          e.g., content-2026-04-01
Database migrations:   {timestamp}_{description}     e.g., 20260326_add_routine_templates
```

**Semver Rules:**
- **Major** -- Breaking API changes, major UX redesign, data migration required
- **Minor** -- New features, new content types, new API endpoints
- **Patch** -- Bug fixes, performance improvements, content updates

### 5.4 Docker Image Tags
```
Format:  {service}-{env}-{git-sha-short}
Examples:
  api-production-a1b2c3d
  api-staging-e4f5g6h
  api-dev-i7j8k9l
  workers-production-a1b2c3d
```

For `latest` convenience tags (non-production only):
```
  api-dev-latest
  api-staging-latest
```

### 5.5 Configuration Keys (Environment Variables)

All configuration uses `SCREAMING_SNAKE_CASE`, prefixed by scope:

| Prefix | Scope | Examples |
|--------|-------|---------|
| `DB_` | Database | `DATABASE_URL`, `DB_POOL_SIZE`, `DB_SSL_ENABLED` |
| `REDIS_` | Redis | `REDIS_URL`, `REDIS_CLUSTER_MODE`, `REDIS_PREFIX` |
| `JWT_` | Authentication | `JWT_SECRET`, `JWT_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN` |
| `S3_` | Object storage | `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY`, `S3_SECRET_KEY` |
| `CORS_` | CORS | `CORS_ORIGIN` |
| `STORAGE_` | Storage provider | `STORAGE_PROVIDER`, `STORAGE_LOCAL_PATH` |
| `QUEUE_` | BullMQ | `QUEUE_PREFIX`, `QUEUE_CONCURRENCY` |
| `AI_` | AI services | `AI_PROVIDER`, `AI_API_KEY`, `AI_MODEL` |
| `CDN_` | CDN | `CDN_BASE_URL`, `CDN_DISTRIBUTION_ID` |
| `APP_` | Application | `APP_ENV`, `APP_VERSION`, `APP_LOG_LEVEL` |
| `SMTP_` | Email | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` |

### 5.6 S3 Bucket Naming
```
kids-learning-dev-assets
kids-learning-staging-assets
kids-learning-prod-assets
```

Object key structure:
```
{prefix}/{uuid}.{ext}
Examples:
  media/550e8400-e29b-41d4-a716-446655440000.png
  media/550e8400-e29b-41d4-a716-446655440000/thumbnail.webp
  offline-packs/alphabet-basics-v2.zip
  exports/analytics-2026-03.csv
```

### 5.7 Infrastructure Resource Naming
```
Format: kids-learning-{env}-{resource}
Examples:
  kids-learning-production-rds
  kids-learning-staging-redis
  kids-learning-dev-alb
  kids-learning-production-ecs-cluster
```

---

## 6. Deployment Dependency Map

### 6.1 Deployment Order

Services must be deployed in the following order. Each step must complete (health check passes) before the next begins.

```
Step 1: Database Migration
   prisma migrate deploy
   Must complete successfully before any application code runs.

Step 2: Backend API
   Depends on: Database migration (Step 1)
   Health check: GET /health returns { status: "ok" }
   Wait for all instances to report healthy.

Step 3: Workers
   Depends on: Backend API healthy (Step 2), same DB schema
   Health check: Process starts and connects to Redis.
   Workers must run the same code version as the API.

Step 4: Frontend PWA
   Depends on: Backend API available (Step 2)
   Deploy: Upload build artifacts to S3, invalidate CloudFront cache.
   No health check needed (static files).

Step 5: Admin Dashboard
   Depends on: Backend API available (Step 2)
   Deploy: Upload build artifacts to S3, invalidate CloudFront cache.
   No health check needed (static files).
```

### 6.2 Dependency Graph (Mermaid)

```mermaid
graph TD
    subgraph "Deployment Pipeline"
        M[1. Database Migration<br/>prisma migrate deploy] --> API[2. Backend API<br/>Express containers]
        API --> W[3. Workers<br/>BullMQ processors]
        API --> PWA[4. Frontend PWA<br/>S3 + CloudFront]
        API --> ADMIN[5. Admin Dashboard<br/>S3 + CloudFront]
    end

    subgraph "Runtime Dependencies"
        API --> PG[(PostgreSQL)]
        API --> RD[(Redis)]
        API --> S3[(S3 Storage)]
        W --> RD
        W --> PG
        W --> S3
        PWA -.->|API calls| API
        ADMIN -.->|API calls| API
    end

    subgraph "External"
        CF[CloudFront CDN] --> PWA
        CF --> ADMIN
        CF --> S3
        ALB[Application Load Balancer] --> API
        U((Users)) --> CF
        U --> ALB
    end

    style M fill:#FFE66D,stroke:#333,color:#333
    style API fill:#4ECDC4,stroke:#333,color:#333
    style W fill:#A78BFA,stroke:#333,color:#333
    style PWA fill:#FF6B6B,stroke:#333,color:#fff
    style ADMIN fill:#FF8C42,stroke:#333,color:#fff
    style PG fill:#336791,stroke:#333,color:#fff
    style RD fill:#DC382D,stroke:#333,color:#fff
    style S3 fill:#569A31,stroke:#333,color:#fff
```

### 6.3 Rollback Order

Rollback proceeds in **reverse** order:

```
1. Admin Dashboard   -- Revert S3 to previous build, invalidate CDN
2. Frontend PWA      -- Revert S3 to previous build, invalidate CDN
3. Workers           -- Deploy previous container image
4. Backend API       -- Deploy previous container image
5. Database          -- Run down migration (if safe) or apply compensating migration
```

> **Warning:** Database rollbacks (down migrations) are inherently risky. Prefer forward-only migrations. If a migration must be reverted, create a new migration that undoes the changes rather than running `migrate reset`.

---

## 7. Environment Parity Matrix

### 7.1 Database

| Attribute | Local | Dev | Preview | Staging | Production |
|-----------|-------|-----|---------|---------|------------|
| Provider | Docker Postgres 16 | Managed (RDS) | Shared dev (schema prefix) | Managed (RDS) | Managed (RDS) |
| Connection pooling | None | PgBouncer (20) | Shared (5) | PgBouncer (50) | PgBouncer (100) |
| Read replicas | 0 | 0 | 0 | 1 | 2 |
| Backup schedule | None | Daily, 1-day retention | None | Daily, 7-day retention | Continuous, 30-day retention, PITR |
| SSL | Disabled | Required | Required | Required | Required |
| Max connections | Unlimited | 50 | 10 (shared) | 100 | 200 |
| Extensions | All available | Controlled | Inherited from dev | Controlled | Controlled |

### 7.2 Redis

| Attribute | Local | Dev | Preview | Staging | Production |
|-----------|-------|-----|---------|---------|------------|
| Provider | Docker Redis 7 | Managed (ElastiCache) | Shared dev (prefixed) | Managed (ElastiCache) | Managed (ElastiCache) |
| Persistence | None | None | None | AOF enabled | AOF enabled |
| Cluster mode | No | No | No | No | Yes |
| Memory | 64 MB | 256 MB | Shared | 512 MB | 2 GB |
| Queue prefix | None | `dev:` | `pr-{num}:` | `staging:` | `prod:` |
| Eviction policy | noeviction | allkeys-lru | allkeys-lru | allkeys-lru | noeviction |

### 7.3 Backend API

| Attribute | Local | Dev | Preview | Staging | Production |
|-----------|-------|-----|---------|---------|------------|
| Instance count | 1 (tsx watch) | 1 container | 1 container | 2 containers | 3 containers (auto-scale 3-6) |
| Rate limiting | 200 req/min | 200 req/min | 200 req/min | 200 req/min | 200 req/min per IP |
| Logging level | `query, warn, error` | `warn, error` | `warn, error` | `warn, error` | `error` only |
| Prisma logging | Full query log | Warn + error | Warn + error | Warn + error | Error only |
| CORS origin | `localhost:5173` | `*.dev.kidslearning.fun` | `*.preview.kidslearning.fun` | `*.staging.kidslearning.fun` | `*.kidslearning.fun` |
| Body size limit | 10 MB | 10 MB | 10 MB | 10 MB | 10 MB |
| Health check | `/health` | `/health` (30s interval) | `/health` (60s interval) | `/health` (15s interval) | `/health` (10s interval) |

### 7.4 Workers

| Attribute | Local | Dev | Preview | Staging | Production |
|-----------|-------|-----|---------|---------|------------|
| Running | No (opt-in) | Yes (1 container) | No | Yes (1 container) | Yes (2 containers, auto-scale) |
| Concurrency per queue | 1 | 1 | N/A | 2 | 5 |
| Queue prefix | None | `dev:` | N/A | `staging:` | `prod:` |
| Retry policy | 3 retries, exp backoff | 3 retries, exp backoff | N/A | 3 retries, exp backoff | 5 retries, exp backoff |
| Dead letter queue | No | No | N/A | Yes | Yes |
| Job timeout | 60s | 60s | N/A | 120s | 300s |

### 7.5 Feature Flags

| Flag Category | Local | Dev | Preview | Staging | Production |
|---------------|-------|-----|---------|---------|------------|
| Experimental features | All ON | All ON | All ON | Selective | OFF by default |
| Beta features | All ON | All ON | All ON | All ON | Targeted rollout |
| Kill switches | All OFF | All OFF | All OFF | All OFF | All OFF |
| A/B experiments | Disabled | Enabled (100% A) | Disabled | Enabled (split) | Enabled (split) |

Feature flags are stored in the `FeatureFlag` table and evaluated by the backend. The `targeting` JSON field supports rules based on: `environment`, `ageGroup`, `plan`, `householdId`, `profileId`, and `percentage` (for gradual rollouts).

### 7.6 Secrets Management

| Attribute | Local | Dev | Preview | Staging | Production |
|-----------|-------|-----|---------|---------|------------|
| Storage | `.env` file (gitignored) | AWS SSM Parameter Store | Inherited from dev | AWS Secrets Manager | AWS Secrets Manager |
| Rotation policy | Manual | Manual | N/A | Quarterly | Monthly (auto-rotate where possible) |
| Access method | File on disk | SSM at deploy time | Env vars from dev SSM | Injected at container start | Injected at container start |
| JWT secret | Dev-only value | Shared dev secret | Same as dev | Unique staging secret | Unique production secret |
| DB credentials | `postgres/postgres` | IAM auth or SSM | Scoped dev credentials | IAM auth | IAM auth + SSL |

### 7.7 Monitoring & Observability

| Attribute | Local | Dev | Preview | Staging | Production |
|-----------|-------|-----|---------|---------|------------|
| Log level | DEBUG | INFO | WARN | INFO | WARN |
| Log destination | Console (stdout) | CloudWatch Logs | CloudWatch Logs | CloudWatch Logs | CloudWatch Logs |
| Structured logging | No | Yes (JSON) | Yes (JSON) | Yes (JSON) | Yes (JSON) |
| Metrics collection | None | Basic (CPU, memory) | None | Full (custom + infra) | Full (custom + infra) |
| APM / Tracing | None | None | None | X-Ray enabled | X-Ray enabled |
| Error tracking | Console | CloudWatch alarms | None | CloudWatch + Slack | CloudWatch + PagerDuty |
| Uptime monitoring | None | None | None | Health check (5 min) | Health check (1 min) + synthetic |
| Dashboard | None | Basic CloudWatch | None | Full CloudWatch | Full CloudWatch + Grafana |
| Log retention | Session | 7 days | 1 day | 30 days | 90 days |
| Alerting | None | Slack (non-urgent) | None | Slack (all) | PagerDuty (critical) + Slack (all) |

---

## 8. Architecture Diagram

### 8.1 Production Architecture (ASCII)

```
                                    INTERNET
                                       |
                          +------------+------------+
                          |                         |
                    +-----+------+           +------+-----+
                    | CloudFront |           | CloudFront |
                    | CDN (PWA)  |           | CDN (Admin)|
                    +-----+------+           +------+-----+
                          |                         |
                    +-----+------+           +------+-----+
                    | S3 Bucket  |           | S3 Bucket  |
                    | (PWA dist) |           | (Admin dist|
                    +------------+           +------------+

                                    INTERNET
                                       |
                              +--------+--------+
                              |   Route 53 DNS  |
                              +--------+--------+
                                       |
                            +----------+-----------+
                            |  Application Load    |
                            |  Balancer (ALB)      |
                            |  api.kidslearning.fun|
                            +----------+-----------+
                                       |
                    +------------------+------------------+
                    |                  |                  |
              +-----+----+     +------+-----+     +-----+----+
              |  API #1  |     |  API #2    |     |  API #3  |
              | Express  |     |  Express   |     | Express  |
              | :4000    |     |  :4000     |     | :4000    |
              +-----+----+     +------+-----+     +-----+----+
                    |                  |                  |
                    +--------+---------+--------+--------+
                             |                  |
                    +--------+--------+ +-------+--------+
                    |   PostgreSQL    | |     Redis      |
                    |   (RDS Multi-AZ)| | (ElastiCache   |
                    |                 | |  Cluster)      |
                    |  Primary + 2    | |                |
                    |  Read Replicas  | +-------+--------+
                    +--------+--------+         |
                             |           +------+-------+
                             |           |              |
                             |     +-----+----+  +-----+----+
                             |     | Worker #1|  | Worker #2|
                             |     | BullMQ   |  | BullMQ   |
                             |     +-----+----+  +-----+----+
                             |           |              |
                             +-----------+--------------+
                                         |
                                  +------+------+
                                  |  S3 Bucket  |
                                  |  (Assets)   |
                                  +------+------+
                                         |
                                  +------+------+
                                  | CloudFront  |
                                  | CDN (Media) |
                                  +-------------+
```

### 8.2 Detailed Component Interaction (ASCII)

```
+------------------------------------------------------------------+
|                           USERS                                   |
+------+---------------------------+--------------------------------+
       |                           |
       v                           v
+------+--------+          +-------+--------+
| Child Device  |          | Admin Browser  |
| (PWA, offline)|          | (Dashboard)    |
+------+--------+          +-------+--------+
       |                           |
       | HTTPS                     | HTTPS
       v                           v
+------+--------+          +-------+--------+
| CloudFront    |          | CloudFront     |
| app.kids...   |          | admin.kids...  |
+------+--------+          +-------+--------+
       |                           |
       | API calls                 | /api/* proxy
       v                           v
+------+---------------------------+--------+
|         Application Load Balancer         |
|         api.kidslearning.fun              |
+------+------------------------------------+
       |
       v
+------+------------------------------------+
|         Backend API (Express 4)           |
|                                           |
|  40 Modules, ~178 Endpoints              |
|                                           |
|  /api/auth          /api/content          |
|  /api/curriculum    /api/releases         |
|  /api/qa            /api/briefs           |
|  /api/story-pipeline /api/illustrations   |
|  /api/prompts       /api/voice            |
|  /api/localization  /api/media            |
|  /api/offline-packs /api/search           |
|  /api/experiments   /api/analytics        |
|  /api/reviews       /api/dedup            |
|  /api/governance    /api/audit            |
|  /api/permissions   /api/households       |
|  /api/system        /api/maintenance      |
|  /api/subscriptions /api/feature-flags    |
|  /api/sync          /api/deep-links       |
|  /api/parent-tips   /api/help             |
|  /api/privacy       /api/messages         |
|  /api/journeys      /api/caregivers       |
|  /api/routines      /api/recommendations  |
|  /api/merchandising /api/performance      |
|  /api/errors        /api/exports          |
|                                           |
+---+----------+----------+-----------------+
    |          |          |
    v          v          v
+---+---+ +---+---+ +----+----+
|Postgres| | Redis | |   S3    |
| (RDS)  | |(Cache)| |(Assets) |
+---+---+ +---+---+ +---------+
    |          |
    |    +-----+------+
    |    |  BullMQ    |
    |    |  Workers   |
    |    +-----+------+
    |          |
    |    +-----+----------------------------------------+
    |    |  7 Queues:                                    |
    |    |  media-processing   | ai-generation           |
    |    |  content-release    | localization             |
    |    |  offline-packs      | analytics-aggregate      |
    |    |  content-qa         |                          |
    |    +--------------------------------------------------+
    |          |
    +----------+  (Workers read/write to Postgres and S3)
```

### 8.3 Network Topology (ASCII)

```
+---------------------------------------------------------------+
|                         VPC (10.0.0.0/16)                     |
|                                                               |
|  +---------------------------+  +---------------------------+ |
|  | Public Subnet A           |  | Public Subnet B           | |
|  | 10.0.1.0/24               |  | 10.0.2.0/24               | |
|  |                           |  |                           | |
|  |  +---+  Application       |  |  +---+  NAT Gateway B    | |
|  |  |ALB|  Load Balancer     |  |  |NAT|                   | |
|  |  +---+                    |  |  +---+                   | |
|  +---------------------------+  +---------------------------+ |
|                                                               |
|  +---------------------------+  +---------------------------+ |
|  | Private Subnet A          |  | Private Subnet B          | |
|  | 10.0.10.0/24              |  | 10.0.20.0/24              | |
|  |                           |  |                           | |
|  |  +-----+  +-----+        |  |  +-----+  +-----+        | |
|  |  |API 1|  |API 2|        |  |  |API 3|  |Wkr 1|        | |
|  |  +-----+  +-----+        |  |  +-----+  +-----+        | |
|  |                           |  |                           | |
|  |  +-----+                  |  |  +-----+                  | |
|  |  |Wkr 2|                 |  |  |      |                 | |
|  |  +-----+                  |  |  +------+                 | |
|  +---------------------------+  +---------------------------+ |
|                                                               |
|  +---------------------------+  +---------------------------+ |
|  | Data Subnet A             |  | Data Subnet B             | |
|  | 10.0.100.0/24             |  | 10.0.200.0/24             | |
|  |                           |  |                           | |
|  |  +--------+               |  |  +--------+               | |
|  |  |RDS     |  Primary      |  |  |RDS     |  Standby     | |
|  |  |Postgres|               |  |  |Postgres|  (Multi-AZ)  | |
|  |  +--------+               |  |  +--------+               | |
|  |                           |  |                           | |
|  |  +--------+               |  |  +--------+               | |
|  |  |ElastiC.|  Redis Node 1 |  |  |ElastiC.|  Redis Node 2| |
|  |  +--------+               |  |  +--------+               | |
|  +---------------------------+  +---------------------------+ |
+---------------------------------------------------------------+
```

---

## 9. Release Flow

### 9.1 Standard Release Path

```
Developer Workstation (local)
    |
    | git push feature/KL-xxx-description
    v
+---+---+
| GitHub|  PR opened
+---+---+
    |
    | CI runs: lint + typecheck + unit tests + build
    | Preview environment auto-created
    v
+---+---+
|Preview|  app-pr-{num}.preview.kidslearning.fun
+---+---+
    |
    | Code review + QA review on preview
    | PR approved
    v
+---+---+
|Merge  |  PR merged into develop
+---+---+
    |
    | Auto-deploy to dev
    | Preview env destroyed
    v
+---+---+
|  Dev  |  app.dev.kidslearning.fun
+---+---+
    |
    | Integration testing
    | When ready for release: create release/v1.x.x branch
    v
+---+---+
|Release|  Branch: release/v1.x.x
|Branch |  Auto-deploy to staging
+---+---+
    |
    v
+---+----+
|Staging |  app.staging.kidslearning.fun
+---+----+
    |
    | Final QA, stakeholder approval
    | Performance testing, smoke tests
    v
+---+---+
|Approve|  Manual approval gate
+---+---+
    |
    | Merge release branch to main
    | Create git tag v1.x.x
    v
+---+--------+
|Production  |  app.kidslearning.fun
+---+--------+
    |
    | Post-deploy verification
    | Merge main back to develop
    v
  DONE
```

### 9.2 Hotfix Path

```
Production issue detected
    |
    | Branch from main: hotfix/v1.x.y
    v
+---+---+
|Hotfix |  Fix applied, tests pass
|Branch |
+---+---+
    |
    | Deploy to staging for quick validation
    v
+---+----+
|Staging |  Smoke tests only
+---+----+
    |
    | Emergency approval
    v
+---+--------+
|Production  |  Tag v1.x.y, deploy
+---+--------+
    |
    | Merge hotfix to both main AND develop
    v
  DONE
```

### 9.3 Content-Only Release Path

```
Content changes (no code changes)
    |
    | Branch: content/2026-04-01
    v
+---+---+
|Content|  Content created/updated in admin dashboard
|Branch |  Backend content pipeline: brief -> draft -> review -> QA -> approve
+---+---+
    |
    | All content passes QA checks (40 automated checks)
    | Editorial review approved
    v
+---+----+
|Staging |  Content verified in staging
+---+----+
    |
    | Content release scheduled via release queue
    v
+---+--------+
|Production  |  Content published via content-release worker
+---+--------+
```

### 9.4 Release Checklist

```
Pre-release:
  [ ] All CI checks pass (lint, typecheck, unit tests, integration tests)
  [ ] E2E tests pass (child mobile, child tablet, parent mobile, parent desktop, admin)
  [ ] Database migration tested on staging with production-like data
  [ ] Performance benchmarks within acceptable range
  [ ] Feature flags configured for gradual rollout if needed
  [ ] Rollback plan documented

Deploy:
  [ ] Database migration applied
  [ ] API health check passes
  [ ] Workers processing jobs
  [ ] Frontend builds deployed to CDN
  [ ] CDN cache invalidated
  [ ] Smoke tests pass

Post-deploy:
  [ ] Monitor error rates for 30 minutes
  [ ] Check key metrics (response times, error rates, queue depths)
  [ ] Verify new features work end-to-end
  [ ] Confirm PWA update propagates (service worker)
  [ ] Update release notes
```

### 9.5 Release Flow (Mermaid)

```mermaid
graph LR
    subgraph "Development"
        F[Feature Branch] -->|PR| P[Preview Env]
        P -->|Merge| D[develop branch]
        D -->|Auto-deploy| DE[Dev Env]
    end

    subgraph "Release"
        DE -->|Cut release| R[release/vX.Y.Z]
        R -->|Auto-deploy| S[Staging Env]
        S -->|Approval| T[Tag vX.Y.Z]
    end

    subgraph "Production"
        T -->|Deploy| PR[Production]
        PR -->|Merge back| D
    end

    subgraph "Hotfix"
        PR -->|Branch| HF[hotfix/vX.Y.Z]
        HF -->|Quick staging| S
        HF -->|Emergency deploy| PR
        HF -->|Merge| D
    end

    style F fill:#FFE66D,stroke:#333,color:#333
    style P fill:#A78BFA,stroke:#333,color:#fff
    style DE fill:#4ECDC4,stroke:#333,color:#333
    style S fill:#FF8C42,stroke:#333,color:#fff
    style PR fill:#FF6B6B,stroke:#333,color:#fff
```

---

## 10. Configuration Reference

### 10.1 Required Environment Variables by Service

#### Backend API

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/kidslearning?schema=public

# Redis
REDIS_URL=redis://host:6379

# Auth
JWT_SECRET=<secret>
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Storage
STORAGE_PROVIDER=local|s3
STORAGE_LOCAL_PATH=./uploads          # only when STORAGE_PROVIDER=local
S3_BUCKET=kids-learning-{env}-assets  # only when STORAGE_PROVIDER=s3
S3_REGION=us-east-1
S3_ACCESS_KEY=<key>
S3_SECRET_KEY=<key>

# CORS
CORS_ORIGIN=http://localhost:5173     # comma-separated for multiple origins

# Application
NODE_ENV=development|production
PORT=4000
APP_LOG_LEVEL=debug|info|warn|error
```

#### Frontend PWA (Build-time)

```bash
VITE_API_URL=http://localhost:4000    # or https://api.kidslearning.fun
VITE_CDN_URL=                         # https://media.kidslearning.fun in prod
VITE_APP_ENV=local|dev|preview|staging|production
```

#### Admin Dashboard (Build-time)

```bash
VITE_API_URL=http://localhost:4000    # or https://api.kidslearning.fun
VITE_APP_ENV=local|dev|preview|staging|production
```

### 10.2 Environment-Specific Config Values

| Variable | Local | Dev | Staging | Production |
|----------|-------|-----|---------|------------|
| `NODE_ENV` | `development` | `development` | `production` | `production` |
| `APP_LOG_LEVEL` | `debug` | `info` | `info` | `warn` |
| `STORAGE_PROVIDER` | `local` | `s3` | `s3` | `s3` |
| `CORS_ORIGIN` | `http://localhost:5173` | `https://*.dev.kidslearning.fun` | `https://*.staging.kidslearning.fun` | `https://*.kidslearning.fun` |
| `DB_POOL_SIZE` | `5` | `20` | `50` | `100` |
| `QUEUE_PREFIX` | (none) | `dev:` | `staging:` | `prod:` |
| `QUEUE_CONCURRENCY` | `1` | `1` | `2` | `5` |

---

## 11. Operational Runbook Notes

### 11.1 Common Operations

#### Scale API containers (production)
```bash
# Scale from 3 to 5 containers
aws ecs update-service \
  --cluster kids-learning-production-ecs-cluster \
  --service kids-learning-production-api \
  --desired-count 5
```

#### Run database migration
```bash
cd backend
npx prisma migrate deploy
```

#### Clear Redis cache
```bash
redis-cli -h <host> FLUSHDB   # dev only, NEVER in production
# Production: use selective key deletion
redis-cli -h <host> KEYS "prod:cache:*" | xargs redis-cli -h <host> DEL
```

#### Invalidate CDN cache
```bash
aws cloudfront create-invalidation \
  --distribution-id <dist-id> \
  --paths "/*"
```

#### Check queue depth
```bash
redis-cli -h <host> LLEN "prod:media-processing:wait"
redis-cli -h <host> LLEN "prod:ai-generation:wait"
redis-cli -h <host> LLEN "prod:content-release:wait"
```

### 11.2 Troubleshooting

| Symptom | Likely Cause | Investigation |
|---------|-------------|---------------|
| API 503 errors | Containers unhealthy | Check ECS tasks, ALB target health |
| Slow API responses | DB connection pool exhausted | Check `DB_POOL_SIZE`, RDS connections, slow queries |
| Queue jobs stuck | Redis connection lost | Check ElastiCache status, worker logs |
| PWA not updating | Service worker cache | Force CDN invalidation, check SW version |
| Admin can't load | API unreachable | Check CORS config, API health, network ACLs |
| Migration fails | Schema conflict | Check `prisma migrate status`, resolve drift |

### 11.3 Disaster Recovery

| Component | RPO | RTO | Strategy |
|-----------|-----|-----|----------|
| PostgreSQL | 5 minutes | 30 minutes | Multi-AZ failover + point-in-time recovery |
| Redis | Last AOF sync | 10 minutes | ElastiCache automatic failover |
| S3 | 0 (durable) | 0 | Cross-region replication (optional) |
| API | N/A | 5 minutes | Auto-scaling, multi-AZ containers |
| Frontend | N/A | 5 minutes | S3 + CloudFront (multi-region by default) |

### 11.4 Incident Severity Levels

| Level | Definition | Response Time | Example |
|-------|-----------|---------------|---------|
| **P1 - Critical** | Complete service outage, data loss risk | 15 minutes | Database down, all APIs returning 500 |
| **P2 - Major** | Significant feature broken, workaround exists | 1 hour | Payment processing failing, content not loading |
| **P3 - Minor** | Non-critical feature degraded | 4 hours | Analytics queue backed up, image variants slow |
| **P4 - Low** | Cosmetic issue, no functional impact | Next business day | Logging noise, non-critical metric gaps |

---

## Appendix A: Prisma Schema Summary

The backend database consists of **55+ models** organized into these domains:

| Domain | Models | Description |
|--------|--------|-------------|
| Auth | User, Role | Admin/editor/reviewer/viewer authentication |
| Content | Content, ContentType, ContentStatus, AccessTier, AgeGroup | Core CMS with 20 content types, 6 statuses |
| Tags | Tag, ContentTag | Multi-dimensional tagging (age, skill, mood, theme) |
| Assets | Asset, AssetVariant | Media files with variant generation (thumbnail, webp, 2x) |
| Curriculum | Curriculum, CurriculumUnit, CurriculumItem | Structured learning paths |
| Collections | Collection, CollectionItem | Curated content groups |
| Releases | Release, ReleaseAction, ReleaseStatus | Scheduled publish/unpublish workflow |
| QA | QAResult | 40 automated quality checks |
| Reviews | Review, ReviewComment, ReviewStatus | Editorial review workflow |
| AI | Brief, BriefStatus | AI content generation pipeline |
| Stories | StoryStep | Multi-step story creation pipeline |
| Illustrations | IllustrationJob | AI illustration generation |
| Prompts | Prompt, PromptUsage | Prompt registry with usage tracking |
| Voice | VoiceJob | Voice-over pipeline |
| Localization | Translation | Multi-locale content translation |
| Dedup | SimilarContent | Content similarity detection |
| Experiments | Experiment, ExperimentVariant, ExperimentResult | A/B testing |
| Analytics | ContentAnalytics | Aggregated content performance metrics |
| Offline | OfflinePack, OfflinePackItem | Downloadable content bundles |
| Governance | LicensedRight | Content licensing and rights management |
| Audit | AuditLog | Immutable action log |
| Permissions | Permission | RBAC permission matrix |
| Skills | Skill, ContentSkill | Skill tagging (cognitive, motor, social, etc.) |
| Household | Household, ParentAccount, ChildProfile, CaregiverInvite, ProfilePreference, ParentalSettings | Family account management |
| Subscription | Subscription, Invoice, PaymentMethod, Entitlement, PromoCode | Billing and entitlements |
| Feature Flags | FeatureFlag, FeatureFlagOverride | Gradual rollout and targeting |
| Sync | SyncCheckpoint, SyncEvent | Cross-device state synchronization |
| Deep Links | DeepLink | Short links with click tracking |
| Parent Tips | ParentTip | Parenting advice content |
| Help | HelpArticle, SupportTicket | Help center and support |
| Privacy | ConsentRecord, DataRequest | COPPA/GDPR compliance |
| Messages | Message, MessagePreference | Parent notifications and preferences |
| Journeys | Journey, JourneyStep, JourneyEnrollment | Lifecycle messaging automation |
| Caregiver | CaregiverAccess | Multi-caregiver permissions |
| Routines | Routine | Family routine templates and schedules |
| Recommendation | RecommendationConfig | Algorithm tuning parameters |
| Merchandising | MerchandisingAsset | App store assets and marketing materials |
| Performance | PerformanceMetric, PerformanceBaseline | Client-side performance monitoring |
| Errors | ErrorReport, ErrorGroup | Error tracking and triage |
| Exports | ExportJob | Data export and reporting |
| Content Ops | ContentPipelineEvent | SLA tracking for content pipeline |
| Policy | ContentPolicy, PolicyResult | Automated content policy enforcement |

---

## Appendix B: API Route Map

All routes are prefixed with `/api/`. The backend exposes 40 module routers:

```
/api/auth              Authentication (login, register, refresh, logout)
/api/content           Content CRUD, filtering, publishing
/api/curriculum        Curriculum management (units, items, ordering)
/api/releases          Release scheduling and execution
/api/qa                QA check runs and results
/api/briefs            AI brief creation and generation
/api/story-pipeline    Story step management
/api/illustrations     Illustration job management
/api/prompts           Prompt registry and usage logs
/api/voice             Voice-over job management
/api/localization      Translation management
/api/media             File upload, asset management, variant generation
/api/offline-packs     Offline pack management and building
/api/search            Full-text and filtered content search
/api/experiments       A/B experiment management
/api/analytics         Content analytics queries and aggregation
/api/reviews           Editorial review workflows
/api/dedup             Similarity detection and deduplication
/api/governance        License and rights management
/api/audit             Audit log queries
/api/permissions       RBAC permission management
/api/households        Family account management (parents, children, profiles)
/api/system            System health, version, diagnostics
/api/maintenance       Maintenance mode, cleanup tasks
/api/subscriptions     Subscription and billing management
/api/feature-flags     Feature flag CRUD and evaluation
/api/sync              Cross-device sync (checkpoints, events, push/pull)
/api/deep-links        Short link creation and resolution
/api/parent-tips       Parenting tips content
/api/help              Help articles and support tickets
/api/privacy           Consent records and data requests (COPPA/GDPR)
/api/messages          Parent notifications and preferences
/api/journeys          Lifecycle messaging journeys
/api/caregivers        Caregiver invitation and access management
/api/routines          Family routine templates and schedules
/api/recommendations   Recommendation algorithm config
/api/merchandising     Marketing and app store asset management
/api/performance       Client performance metric ingestion and baselines
/api/errors            Error report ingestion and group triage
/api/exports           Data export job management
```

Health check (not behind `/api/`):
```
GET /health            Returns { status: "ok", timestamp: "..." }
```

---

## Appendix C: Local Development Quick Start

```bash
# 1. Clone and install
git clone <repo-url> && cd KidsLearningApp
npm install
cd admin && npm install && cd ..
cd backend && npm install && cd ..

# 2. Start infrastructure
docker compose up -d postgres redis

# 3. Initialize database
cd backend
cp .env.example .env          # Edit DATABASE_URL and REDIS_URL
npx prisma migrate dev        # Apply migrations
npx prisma db seed            # Load seed data
cd ..

# 4. Start services (3 terminals)
# Terminal 1 - Backend API
cd backend && npm run dev

# Terminal 2 - Admin Dashboard
cd admin && npm run dev

# Terminal 3 - Frontend PWA
npm run dev

# 5. Open in browser
# PWA:    http://localhost:5173
# Admin:  http://localhost:5174
# API:    http://localhost:4000/health
# Prisma: cd backend && npx prisma studio  (GUI at :5555)
```

---

*This document describes the target architecture. Some components (Docker Compose, CI/CD pipelines, IaC templates) are planned but not yet implemented. See the project roadmap for infrastructure milestones.*
