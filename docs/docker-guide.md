# Docker Guide - Kids Learning App

This guide covers containerization for the entire Kids Learning App platform: frontend PWA, admin dashboard, backend API, and BullMQ workers.

## Architecture Overview

| Service       | Container        | Port  | Description                        |
|---------------|------------------|-------|------------------------------------|
| `postgres`    | PostgreSQL 16    | 5432  | Primary database                   |
| `redis`       | Redis 7          | 6379  | Cache + BullMQ queue broker        |
| `api`         | Node 20 Alpine   | 4000  | Express API server                 |
| `worker`      | Node 20 Alpine   | -     | BullMQ workers (7 queues)          |
| `frontend`    | Nginx Alpine     | 5173  | Frontend PWA (dev) / 80 (prod)     |
| `admin`       | Nginx Alpine     | 5174  | Admin dashboard (dev) / 80 (prod)  |

## Quick Start

### Option A: Infrastructure Only (Recommended for Development)

Run PostgreSQL and Redis in Docker, but run the apps natively for faster iteration:

```bash
# Start infrastructure
docker compose up postgres redis

# In separate terminals, run apps natively
cd backend && npm run dev           # API on :4000
cd backend && npm run dev:worker    # Workers
npm run dev                         # Frontend on :5173
cd admin && npm run dev             # Admin on :5174
```

This gives you the best developer experience: native hot reload with Docker-managed databases.

### Option B: Full Docker Stack

Run everything in Docker containers:

```bash
# Start core services (API, workers, Postgres, Redis)
docker compose up

# Include frontend and admin dashboard too
docker compose --profile frontend up

# First time? Run migrations and seed data
docker compose --profile setup up migrate
```

### Option C: Production-like Build

Build and run optimized production images:

```bash
# Build all images
docker compose -f docker-compose.yml build

# Build individual services
docker build -t kidslearn-api ./backend
docker build -t kidslearn-worker -f ./backend/Dockerfile.worker ./backend
docker build -t kidslearn-frontend .
docker build -t kidslearn-admin ./admin
```

## Database Management

### Run Migrations

```bash
# Via Docker
docker compose --profile setup run --rm migrate

# Or manually
docker compose exec api npx prisma migrate deploy
```

### Seed Database

```bash
docker compose exec api npx prisma db seed
```

### Open Prisma Studio

```bash
# Prisma Studio needs to run natively (browser-based)
cd backend && DATABASE_URL=postgresql://postgres:postgres@localhost:5432/kids_learning npx prisma studio
```

### Reset Database

```bash
docker compose down -v  # Removes volumes (all data!)
docker compose up postgres redis
docker compose --profile setup run --rm migrate
```

## Service Details

### Backend API (`backend/Dockerfile`)

Multi-stage build:
1. **deps** - Installs production `node_modules` + generates Prisma client
2. **build** - Installs all deps + compiles TypeScript
3. **production** - Clean Alpine image with only compiled JS + production deps

Key features:
- Non-root user (`appuser:appgroup`)
- Health check at `/health`
- Uploads directory at `/app/uploads`

### Workers (`backend/Dockerfile.worker`)

Same build pipeline as the API with a different entrypoint (`dist/worker.js` instead of `dist/index.js`).

The 7 BullMQ queues:
- `media-processing` - Image/video processing (concurrency: 2)
- `ai-generation` - Story/illustration AI tasks (concurrency: 1)
- `content-release` - Scheduled publishing (concurrency: 1)
- `localization` - Translation jobs (concurrency: 2)
- `offline-packs` - Offline bundle generation (concurrency: 1)
- `analytics-aggregate` - Event roll-ups (concurrency: 1)
- `content-qa` - Automated quality checks (concurrency: 1)

Concurrency is configurable via environment variables: `WORKER_MEDIA_CONCURRENCY`, `WORKER_AI_CONCURRENCY`.

### Frontend PWA (`Dockerfile` at root)

Multi-stage build:
1. **build** - `npm ci` + `npm run build` produces optimized Vite output in `dist/`
2. **production** - Nginx Alpine serves the SPA

Nginx features:
- SPA fallback (`try_files` to `index.html`)
- Aggressive caching for `/assets/` (Vite hashes filenames)
- No caching for service worker (`sw.js`, `registerSW.js`)
- Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- Gzip compression
- Health check at `/health`

### Admin Dashboard (`admin/Dockerfile`)

Same pattern as frontend. Nginx config includes an API proxy (`/api/` -> `api:4000`) so the admin dashboard can talk to the backend without CORS in production.

## Environment Variables

### API & Worker

| Variable                   | Default                    | Description                 |
|----------------------------|----------------------------|-----------------------------|
| `DATABASE_URL`             | (required)                 | PostgreSQL connection URL   |
| `REDIS_URL`               | `redis://localhost:6379`   | Redis connection URL        |
| `NODE_ENV`                 | `development`              | Environment mode            |
| `PORT`                     | `4000`                     | API listen port             |
| `JWT_SECRET`               | (required in prod)         | JWT signing secret          |
| `CORS_ORIGIN`             | `http://localhost:5173`    | Allowed CORS origin         |
| `STORAGE_PROVIDER`        | `local`                    | `local` or `s3`            |
| `STORAGE_LOCAL_PATH`      | `./uploads`                | Local upload directory      |
| `WORKER_MEDIA_CONCURRENCY`| `2`                        | Media worker concurrency    |
| `WORKER_AI_CONCURRENCY`   | `1`                        | AI worker concurrency       |

## Optimization Notes

### Layer Caching Strategy

All Dockerfiles follow the same pattern for maximum cache reuse:

```
COPY package.json package-lock.json ./   # Changes rarely
RUN npm ci                               # Cached until package files change
COPY src ./src/                           # Changes frequently
RUN npm run build                         # Rebuilt when source changes
```

This means `npm ci` is only re-run when dependencies actually change, not on every source code edit.

### Multi-stage Builds

- **deps** stage: Only production `node_modules` (no devDependencies)
- **build** stage: Full `node_modules` for TypeScript compilation
- **production** stage: Copies only what's needed from previous stages

Result: Production images contain no TypeScript source, no devDependencies, no build tools.

### .dockerignore

Each service has its own `.dockerignore` that excludes:
- `node_modules/` (rebuilt inside the container)
- `dist/` (rebuilt inside the container)
- Tests, docs, IDE files, OS files
- Docker configuration files themselves

This keeps the build context small and prevents cache invalidation from unrelated changes.

## Troubleshooting

### "Port already in use"

```bash
# Check what's using the port
lsof -i :4000
lsof -i :5432

# Or change ports in docker-compose.yml
```

### Database connection refused

```bash
# Check if postgres is healthy
docker compose ps
docker compose logs postgres

# Verify the container is running and healthy
docker compose exec postgres pg_isready -U postgres
```

### Prisma client mismatch

If you see Prisma client version errors:

```bash
# Rebuild the API container (regenerates Prisma client)
docker compose build api
docker compose up api
```

### Workers not processing jobs

```bash
# Check worker logs
docker compose logs -f worker

# Verify Redis connection
docker compose exec redis redis-cli ping

# Check queue status
docker compose exec api npx tsx -e "
import { createQueue } from './src/lib/queue.js';
const q = createQueue('media-processing');
console.log(await q.getJobCounts());
"
```

### Slow builds

```bash
# Use BuildKit for parallel stage execution
DOCKER_BUILDKIT=1 docker compose build

# Or build a specific service
docker compose build api --no-cache
```

### Container permissions issues

The backend containers run as `appuser` (uid 1001). If you see permission errors with mounted volumes:

```bash
# Fix ownership on the host
sudo chown -R 1001:1001 ./backend/uploads
```

### Reset everything

```bash
# Nuclear option: remove all containers, volumes, and images
docker compose down -v --rmi local
docker compose up --build
```

## CI/CD Build Commands

Example build commands for CI pipelines:

```bash
# Build with specific tags
docker build -t kidslearn-api:$(git rev-parse --short HEAD) ./backend
docker build -t kidslearn-worker:$(git rev-parse --short HEAD) -f ./backend/Dockerfile.worker ./backend
docker build -t kidslearn-frontend:$(git rev-parse --short HEAD) .
docker build -t kidslearn-admin:$(git rev-parse --short HEAD) ./admin

# Push to registry
docker push registry.example.com/kidslearn-api:latest
docker push registry.example.com/kidslearn-worker:latest
docker push registry.example.com/kidslearn-frontend:latest
docker push registry.example.com/kidslearn-admin:latest
```

## Parity Notes

| Aspect           | Local (native)               | Docker (dev)                | Docker (prod)              |
|------------------|------------------------------|-----------------------------|----------------------------|
| Node version     | Whatever's installed         | 20-alpine (pinned)          | 20-alpine (pinned)         |
| Hot reload       | Native (fastest)             | Volume mounts + tsx watch   | Not available              |
| Database         | Docker or local install      | Docker (always)             | Managed service            |
| Redis            | Docker or local install      | Docker (always)             | Managed service            |
| File serving     | Vite dev server              | Vite dev server             | Nginx                      |
| Prisma client    | Generated locally            | Generated in container      | Generated at build time    |
| Environment      | `.env` file                  | `docker-compose.yml`        | Secrets management         |
