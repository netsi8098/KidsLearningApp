# Developer Onboarding

Welcome to the Kids Learning Backend. This guide gets you from zero to running in 10 minutes.

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | 20+ | LTS recommended |
| PostgreSQL | 15+ | Local or Docker |
| Redis | 7+ | Optional -- queues degrade gracefully without it |
| npm/pnpm | Latest | |

## Quick Start

```bash
# 1. Clone and install
cd ~/Desktop/KidsLearningApp/backend
npm install

# 2. Create .env from template (see setup.md for all vars)
cp .env.example .env
# Edit DATABASE_URL to point to your local PostgreSQL

# 3. Set up database
npx prisma migrate dev
npm run db:seed

# 4. Start dev server
npm run dev
# Server starts on http://localhost:4000

# 5. Verify
curl http://localhost:4000/health
# => { "status": "ok", "timestamp": "..." }
```

## Project Structure

```
backend/
  prisma/
    schema.prisma       # 30 models, single source of truth
    seed.ts             # Development seed data
    migrations/         # Prisma migration history
  src/
    index.ts            # Express app setup, route mounting
    middleware/
      auth.ts           # JWT authenticate + requireRole
      errorHandler.ts   # Centralized error handler
    lib/
      prisma.ts         # Prisma client singleton + soft-delete middleware
      queue.ts          # BullMQ queue/worker factories (7 queues)
      errors.ts         # AppError class hierarchy
      validate.ts       # Zod validation middleware
      audit.ts          # Audit log helper
      softDelete.ts     # Prisma soft-delete middleware
      storage.ts        # File storage provider (local / S3 stub)
    modules/
      auth/             # Authentication (register, login, JWT)
      content/          # Core content CMS
      curriculum/       # Structured learning paths
      release/          # Scheduled content actions
      qa/               # Automated quality checks
      review/           # Content review workflow
      brief/            # AI content briefs
      story-pipeline/   # Multi-step story creation
      illustration/     # AI illustration jobs
      prompts/          # Prompt template registry
      voice/            # TTS voice pipeline
      localization/     # Translation management
      media/            # File upload and processing
      offline-packs/    # Downloadable content bundles
      search/           # Full-text search + suggestions
      experiments/      # A/B testing
      analytics/        # Content analytics + dashboards
      dedup/            # Duplicate detection
      governance/       # Licensed content governance
      audit/            # Audit log viewer
      permissions/      # RBAC permission management
      household/        # Family/child management
      system/           # Health, queues, cache admin
      maintenance/      # Maintenance job runner
```

## Key Patterns

Each module follows the same structure:

```
modules/example/
  schemas.ts    # Zod schemas for request validation
  service.ts    # Business logic (Prisma queries, etc.)
  router.ts     # Express routes
```

### Auth Flow
1. Register/login returns a JWT token
2. Add `Authorization: Bearer <token>` to requests
3. `authenticate` middleware validates the token
4. `requireRole('admin', 'editor')` checks role

### Validation
Every endpoint uses Zod schemas validated by `validate()` middleware. Invalid requests return a 400 with field-level error details.

### Error Handling
Throw `AppError` subclasses (NotFoundError, ValidationError, etc.) anywhere in service code. The centralized `errorHandler` catches them and returns consistent JSON responses.

### Soft Delete
13 models use `deletedAt` for soft deletion. The Prisma middleware handles this transparently -- you write normal `delete()` calls and they become soft deletes.

### Background Jobs
Long-running tasks (AI generation, media processing, analytics aggregation) go through BullMQ queues backed by Redis. Seven predefined queues are available in `src/lib/queue.ts`.

## Next Steps

- [Detailed Setup Guide](./setup.md) -- env vars, database, Redis
- [Architecture Guide](./architecture.md) -- deeper technical details
- [API Reference](../api/README.md) -- all endpoints
- [Schema Overview](../schema/README.md) -- database models
