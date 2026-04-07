# Detailed Setup Guide

## 1. Clone and Install

```bash
cd ~/Desktop/KidsLearningApp/backend
npm install
```

This installs all dependencies including Prisma CLI (devDependency) and generates the Prisma client.

## 2. Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# ── Database ──────────────────────────────────────────────
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/kids_learning_dev"

# ── Auth ──────────────────────────────────────────────────
JWT_SECRET="your-dev-secret-change-in-production"
JWT_EXPIRES_IN="7d"

# ── Server ────────────────────────────────────────────────
PORT=4000
NODE_ENV=development
CORS_ORIGIN="http://localhost:5173"

# ── Redis (optional, for BullMQ queues) ──────────────────
REDIS_URL="redis://localhost:6379"

# ── Storage ───────────────────────────────────────────────
STORAGE_PROVIDER="local"           # "local" or "s3"
STORAGE_LOCAL_PATH="./uploads"

# ── S3 (when STORAGE_PROVIDER=s3) ────────────────────────
# AWS_ACCESS_KEY_ID=""
# AWS_SECRET_ACCESS_KEY=""
# AWS_REGION=""
# S3_BUCKET=""
```

### Required Variables

| Variable | Required | Default | Notes |
|----------|----------|---------|-------|
| `DATABASE_URL` | Yes | -- | PostgreSQL connection string |
| `JWT_SECRET` | Yes | `"dev-secret"` | Use a strong secret in production |
| `PORT` | No | `4000` | Server port |
| `NODE_ENV` | No | `"development"` | Affects logging verbosity |
| `CORS_ORIGIN` | No | `"http://localhost:5173"` | Frontend URL |
| `REDIS_URL` | No | `"redis://localhost:6379"` | Queues won't work without Redis |
| `STORAGE_PROVIDER` | No | `"local"` | File storage backend |
| `STORAGE_LOCAL_PATH` | No | `"./uploads"` | Local storage directory |

## 3. Database Setup

### Create the PostgreSQL Database

```bash
# Using psql
createdb kids_learning_dev

# Or via psql prompt
psql -c "CREATE DATABASE kids_learning_dev;"
```

### Run Migrations

```bash
# Apply all migrations and generate Prisma client
npx prisma migrate dev
```

This creates all 30 tables, indexes, and enums in your database.

### Seed Development Data

```bash
npm run db:seed
```

Seeds sample users, content, tags, collections, and other test data.

### Useful Database Commands

```bash
# Open Prisma Studio (database GUI)
npm run db:studio

# Push schema changes without creating a migration (prototyping only)
npm run db:push

# Regenerate Prisma client after schema changes
npm run db:generate

# Reset database (drops all data, re-runs migrations + seed)
npx prisma migrate reset
```

## 4. Redis Setup (Optional)

Redis is needed for BullMQ background job queues. Without it, queue-dependent features (AI generation, media processing, analytics aggregation) won't work, but the rest of the API functions normally.

```bash
# macOS with Homebrew
brew install redis
brew services start redis

# Or with Docker
docker run -d --name redis -p 6379:6379 redis:7-alpine

# Verify
redis-cli ping
# => PONG
```

## 5. Start the Dev Server

```bash
npm run dev
```

This uses `tsx watch` for auto-reload on file changes. Output:

```
Kids Learning Backend running on port 4000
   Environment: development
   Health: http://localhost:4000/health
```

In development mode, Prisma logs all SQL queries to the console.

## 6. Verify Everything Works

```bash
# Health check
curl http://localhost:4000/health
# => { "status": "ok", "timestamp": "2026-03-26T..." }

# Register a test user
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
# => { "token": "eyJhbG...", "user": {...} }

# Use the token
curl http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer <token>"
```

## 7. Other Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `npm run dev` | `tsx watch src/index.ts` | Dev server with auto-reload |
| `npm run build` | `tsc` | TypeScript compile |
| `npm start` | `node dist/index.js` | Production start |
| `npm run lint` | `eslint src/` | Lint source code |
| `npm run typecheck` | `tsc --noEmit` | Type check without emitting |

## Common Issues

### "Can't reach database server"
- Ensure PostgreSQL is running: `pg_isready`
- Check `DATABASE_URL` in `.env` matches your local setup
- Default PostgreSQL port is 5432

### "Prisma Client not generated"
- Run `npx prisma generate` after installing dependencies
- This happens automatically with `prisma migrate dev`

### HMR Dexie crash (frontend)
- If the frontend's IndexedDB crashes during hot reload, close the browser tab and reopen

### Redis connection refused
- Queued features (AI, media processing) require Redis
- The API itself works without Redis -- only background jobs fail
