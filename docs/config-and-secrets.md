# Configuration & Secrets Management

This document describes how environment variables, configuration, and secrets
are managed across the Kids Learning App stack (backend, frontend PWA, admin
panel).

---

## Architecture Overview

```
                     COMPILE TIME                  RUNTIME
                  +-----------------+         +------------------+
  Frontend PWA    | .env.* files    |  Vite   | import.meta.env  |
  (src/)          | VITE_* prefix   | ------> | (baked into JS)  |
                  +-----------------+         +------------------+

  Admin Panel     | .env.* files    |  Vite   | import.meta.env  |
  (admin/)        | VITE_* prefix   | ------> | (baked into JS)  |
                  +-----------------+         +------------------+

                     STARTUP TIME                  RUNTIME
                  +-----------------+         +------------------+
  Backend         | .env / env vars |  dotenv | getConfig()      |
  (backend/)      | Zod validation  | ------> | (frozen object)  |
                  +-----------------+         +------------------+
```

### Variable classification

| Category     | Visibility       | Examples                          | Where defined            |
| ------------ | ---------------- | --------------------------------- | ------------------------ |
| **Public**   | Client bundle    | `VITE_APP_NAME`, `VITE_API_URL`   | Root `.env.*`, `admin/.env.*` |
| **Private**  | Server only      | `PORT`, `LOG_LEVEL`, `NODE_ENV`   | `backend/.env.*`         |
| **Secret**   | Server only      | `JWT_SECRET`, `DATABASE_URL`      | `backend/.env` (gitignored), cloud secrets manager |
| **Build**    | CI/CD only       | `VITE_APP_VERSION`, `VITE_SENTRY_DSN` | CI pipeline env      |

---

## Backend Configuration

### How it works

1. `dotenv/config` is imported at the top of `backend/src/index.ts`, loading
   `backend/.env` into `process.env`.
2. `validateConfig()` (from `backend/src/config/index.ts`) is called once at
   startup.  It reads every env var, validates with Zod, and returns a frozen
   `Config` object.
3. All subsequent code uses `getConfig()` to access typed, validated config.
4. If validation fails, the process exits immediately with clear error
   messages so bad deploys surface at startup rather than at runtime.

### Config module location

```
backend/src/config/
  index.ts      -- schema, validateConfig(), getConfig(), env helpers
  secrets.ts    -- getRedactedConfig(), isSecret(), getJwtSecrets()
```

### Environment variable reference (backend)

| Env Var                    | Config Key             | Type                      | Default                  | Required | Secret | Description                                |
| -------------------------- | ---------------------- | ------------------------- | ------------------------ | -------- | ------ | ------------------------------------------ |
| `PORT`                     | `port`                 | `number` (1-65535)        | `4000`                   | No       | No     | HTTP listen port                           |
| `NODE_ENV`                 | `nodeEnv`              | `enum`                    | `development`            | No       | No     | Runtime environment                        |
| `CORS_ORIGIN`              | `corsOrigin`           | `string`                  | `http://localhost:5173`  | No       | No     | Allowed CORS origin                        |
| `DATABASE_URL`             | `databaseUrl`          | `string`                  | --                       | **Yes**  | **Yes**| PostgreSQL connection string               |
| `REDIS_URL`                | `redisUrl`             | `string`                  | `redis://localhost:6379` | No       | **Yes**| Redis connection string                    |
| `JWT_SECRET`               | `jwtSecret`            | `string` (min 16 chars)   | --                       | **Yes**  | **Yes**| JWT signing key                            |
| `JWT_EXPIRES_IN`           | `jwtExpiresIn`         | `string`                  | `7d`                     | No       | No     | Token lifetime (e.g. `7d`, `24h`)          |
| `JWT_SECRET_PREVIOUS`      | *(via getJwtSecrets)*  | `string`                  | --                       | No       | **Yes**| Previous JWT key during rotation           |
| `STORAGE_PROVIDER`         | `storageProvider`      | `"local" \| "s3"`        | `local`                  | No       | No     | Storage backend                            |
| `STORAGE_LOCAL_PATH`       | `storageLocalPath`     | `string`                  | `./uploads`              | No       | No     | Local upload directory                     |
| `STORAGE_S3_BUCKET`        | `storageS3Bucket`      | `string`                  | --                       | If S3    | No     | S3 bucket name                             |
| `STORAGE_S3_REGION`        | `storageS3Region`      | `string`                  | --                       | If S3    | No     | S3 region                                  |
| `STORAGE_S3_ACCESS_KEY`    | `storageS3AccessKey`   | `string`                  | --                       | If S3    | **Yes**| S3 access key                              |
| `STORAGE_S3_SECRET_KEY`    | `storageS3SecretKey`   | `string`                  | --                       | If S3    | **Yes**| S3 secret key                              |
| `STORAGE_S3_ENDPOINT`      | `storageS3Endpoint`    | `string`                  | --                       | No       | No     | Custom S3 endpoint (MinIO, DO Spaces)      |
| `SHARP_CONCURRENCY`        | `sharpConcurrency`     | `number` (1-8)            | `2`                      | No       | No     | Sharp image processing threads             |
| `MAX_UPLOAD_SIZE_MB`       | `maxUploadSizeMb`      | `number` (1-500)          | `50`                     | No       | No     | Max upload file size in MB                 |
| `OPENAI_API_KEY`           | `openaiApiKey`         | `string`                  | --                       | No       | **Yes**| OpenAI API key                             |
| `ANTHROPIC_API_KEY`        | `anthropicApiKey`      | `string`                  | --                       | No       | **Yes**| Anthropic API key                          |
| `WORKER_MEDIA_CONCURRENCY` | `workerMediaConcurrency`| `number`                 | `2`                      | No       | No     | Media job worker concurrency               |
| `WORKER_AI_CONCURRENCY`    | `workerAiConcurrency`  | `number`                  | `1`                      | No       | No     | AI job worker concurrency                  |
| `RATE_LIMIT_WINDOW_MS`     | `rateLimitWindowMs`    | `number`                  | `60000`                  | No       | No     | Rate limit time window (ms)                |
| `RATE_LIMIT_MAX`           | `rateLimitMax`         | `number`                  | `200`                    | No       | No     | Max requests per rate limit window          |
| `ENABLE_MAINTENANCE_MODE`  | `enableMaintenanceMode`| `boolean`                 | `false`                  | No       | No     | Return 503 for all API routes              |
| `LOG_LEVEL`                | `logLevel`             | `enum`                    | `info`                   | No       | No     | Minimum log level                          |
| `LOG_FORMAT`               | `logFormat`            | `enum`                    | `pretty`                 | No       | No     | `pretty` for dev, `json` for production    |

### Frontend env var reference

| Env Var                | Default                   | Description                        |
| ---------------------- | ------------------------- | ---------------------------------- |
| `VITE_API_URL`         | `http://localhost:4000`   | Backend API base URL               |
| `VITE_APP_NAME`        | `Kids Learning Fun`       | App display name                   |
| `VITE_APP_VERSION`     | `0.0.0-dev`               | App version (set by CI)            |
| `VITE_ENABLE_ANALYTICS`| `false`                   | Enable analytics collection        |
| `VITE_ENABLE_DEBUG`    | `false`                   | Enable debug overlays              |
| `VITE_SENTRY_DSN`      | *(empty)*                 | Sentry error reporting DSN         |

### Admin env var reference

Same variables as the frontend, but scoped to the admin panel at `admin/.env.*`.
The `VITE_APP_NAME` default is `Kids Learning Admin`.

---

## File layout

```
KidsLearningApp/
  .env.example          # Frontend -- template (committed)
  .env.development      # Frontend -- dev defaults (committed)
  .env                  # Frontend -- local overrides (gitignored)
  .env.local            # Frontend -- local overrides (gitignored)
  admin/
    .env.example        # Admin -- template (committed)
    .env.development    # Admin -- dev defaults (committed)
    .env                # Admin -- local overrides (gitignored)
  backend/
    .env.example        # Backend -- template (committed)
    .env.development    # Backend -- dev defaults (committed)
    .env.test           # Backend -- test defaults (committed)
    .env                # Backend -- local overrides (gitignored)
    .env.production     # Backend -- production (gitignored, deploy only)
    .env.staging        # Backend -- staging (gitignored, deploy only)
```

**Rules:**
- `.env.example` -- Template. Always committed. Contains no real secrets.
- `.env.development` and `.env.test` -- Safe defaults. Always committed.
- `.env`, `.env.local`, `.env.production`, `.env.staging` -- **Never committed.**

---

## How to add a new config variable

Follow these steps whenever you add a new environment variable to the backend:

### Step 1: Add to Zod schema

Edit `backend/src/config/index.ts` and add the field to `configSchema`:

```typescript
const configSchema = z.object({
  // ... existing fields ...

  // My new setting
  myNewSetting: z.string().default('default-value'),
});
```

### Step 2: Add env var mapping

In the `loadConfigFromEnv()` function, add the mapping:

```typescript
function loadConfigFromEnv(): Record<string, unknown> {
  return {
    // ... existing mappings ...
    myNewSetting: process.env.MY_NEW_SETTING,
  };
}
```

### Step 3: If it is a secret, register it

If the value is sensitive, add its config key to `SECRET_KEYS` in
`backend/src/config/secrets.ts`:

```typescript
const SECRET_KEYS = new Set<keyof Config>([
  // ... existing keys ...
  'myNewSetting',
]);
```

### Step 4: Update `.env.example`

Add the variable with a descriptive comment to `backend/.env.example`.

### Step 5: Update `.env.development` / `.env.test` if applicable

If the variable needs a value for local dev or tests, add it.

### Step 6: Update this documentation

Add a row to the environment variable reference table above.

### Step 7: Use it

```typescript
import { getConfig } from '../config/index.js';

const config = getConfig();
console.log(config.myNewSetting);
```

---

## Secret rotation procedures

### JWT secret rotation

JWT secret rotation uses a **dual-read** pattern so that tokens signed with
the previous secret remain valid during the rotation window.

1. Generate a new secret:
   ```bash
   openssl rand -base64 48
   ```

2. Set the rotation variables:
   ```bash
   # In your deployment environment:
   JWT_SECRET_PREVIOUS="<current-jwt-secret>"
   JWT_SECRET="<new-jwt-secret>"
   ```

3. Deploy.  The auth middleware should call `getJwtSecrets()` from
   `config/secrets.ts` and attempt verification with each secret in order.

4. Wait for the previous token lifetime to elapse (default: 7 days).

5. Remove `JWT_SECRET_PREVIOUS` and redeploy.

### Database URL rotation

1. Create the new database user/password.
2. Update `DATABASE_URL` and deploy.
3. Revoke the old credentials after confirming connectivity.

### API key rotation (OpenAI / Anthropic)

1. Generate a new key in the provider dashboard.
2. Update the env var and deploy.
3. Revoke the old key in the provider dashboard.

---

## Frontend env var safety

Vite only exposes variables prefixed with `VITE_` to the client bundle.
Non-prefixed variables in the frontend `.env` files are ignored by Vite and
never shipped to the browser.

**Important:**
- NEVER put secrets in `VITE_*` variables.  Everything prefixed with `VITE_`
  is embedded in the JavaScript bundle and visible to anyone who inspects the
  page source.
- API keys for third-party services should be kept on the backend and proxied
  through your API.
- `VITE_SENTRY_DSN` is intentionally public (Sentry DSNs are designed to be
  client-side).

---

## Local development setup

### Quick start

```bash
# 1. Start infrastructure
docker compose up -d postgres redis

# 2. Backend
cd backend
cp .env.example .env          # or rely on .env.development defaults
npm install
npm run db:push
npm run dev

# 3. Frontend
cd ..
npm install
npm run dev

# 4. Admin
cd admin
npm install
npm run dev
```

The `.env.development` files contain safe defaults that work with the standard
Docker Compose services.  You only need a `.env` file if you want to override
specific values.

### Loading order (Vite)

Vite loads env files in this order (later files override earlier):

1. `.env`
2. `.env.local`
3. `.env.[mode]` (e.g. `.env.development`)
4. `.env.[mode].local`

### Loading order (backend)

`dotenv/config` loads `backend/.env`.  To use environment-specific files, set
the appropriate vars before starting:

```bash
# Development (uses .env.development values)
NODE_ENV=development npm run dev

# Test
NODE_ENV=test npm run test
```

---

## Migration from raw `process.env`

The existing codebase accesses `process.env` directly in several files.  These
will continue to work because `dotenv/config` still populates `process.env`.
However, new code should always use `getConfig()`:

```typescript
// OLD (still works, but deprecated)
const port = parseInt(process.env.PORT || '4000', 10);

// NEW (preferred)
import { getConfig } from '../config/index.js';
const { port } = getConfig();
```

Files that currently read `process.env` directly:

| File                                   | Variables used                              |
| -------------------------------------- | ------------------------------------------- |
| `backend/src/index.ts`                 | PORT, CORS_ORIGIN, STORAGE_PROVIDER, STORAGE_LOCAL_PATH, NODE_ENV |
| `backend/src/middleware/auth.ts`        | JWT_SECRET, JWT_EXPIRES_IN                  |
| `backend/src/middleware/errorHandler.ts`| NODE_ENV                                    |
| `backend/src/lib/prisma.ts`            | NODE_ENV                                    |
| `backend/src/lib/storage.ts`           | STORAGE_PROVIDER, STORAGE_LOCAL_PATH        |
| `backend/src/lib/queue.ts`             | REDIS_URL                                   |
| `backend/src/modules/system/service.ts`| NODE_ENV                                    |
| `backend/src/modules/governance/service.ts` | TARGET_MARKETS                         |

These can be migrated incrementally.  There is no urgency since both patterns
read from the same underlying `process.env` values.

---

## Production deployment checklist

- [ ] `DATABASE_URL` points to production database with SSL
- [ ] `JWT_SECRET` is a strong random string (min 32 characters)
- [ ] `NODE_ENV=production`
- [ ] `LOG_FORMAT=json` for structured logging
- [ ] `CORS_ORIGIN` set to production frontend URL
- [ ] S3 configured if `STORAGE_PROVIDER=s3`
- [ ] API keys set for AI services if needed
- [ ] `ENABLE_MAINTENANCE_MODE=false`
- [ ] Secrets are injected via cloud secrets manager, not `.env` files
- [ ] `.env` and `.env.production` are NOT in version control
