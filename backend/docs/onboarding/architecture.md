# Architecture Guide

## Overview

The backend is a **monolithic Express.js API** with 24 feature modules. Each module is self-contained with its own schemas, service layer, and routes.

```
Request --> Global Middleware --> Route --> Validation --> Auth --> Service --> Prisma --> PostgreSQL
                                                                    |
                                                              BullMQ Queue --> Redis --> Worker
```

## Module Structure

Every module follows the same three-file pattern:

```
modules/<name>/
  schemas.ts    # Zod schemas defining request shape
  service.ts    # Business logic, Prisma queries
  router.ts     # Express router, wires middleware + service
```

### schemas.ts
Defines Zod schemas for each endpoint's params, query, and body. These schemas serve as both validation and TypeScript type source.

```typescript
// Example: content/schemas.ts
export const createContentSchema = z.object({
  body: z.object({
    slug: z.string().min(1),
    type: z.nativeEnum(ContentType),
    title: z.string().min(1).max(200),
    // ...
  }),
});
```

### service.ts
Pure business logic. No Express types (Request/Response) -- receives plain objects, returns plain objects. Makes it testable independent of HTTP.

```typescript
// Example: content/service.ts
export async function createContent(data: CreateContentBody, authorId: string) {
  return prisma.content.create({ data: { ...data, authorId } });
}
```

### router.ts
Wires Express routes to validation middleware and service functions. Handles HTTP concerns (status codes, response formatting).

## Middleware Chain

Requests flow through middleware in this order:

### 1. Global Middleware (applied to all routes)

| Middleware | Purpose |
|-----------|---------|
| `helmet()` | Security headers (CSP, HSTS, etc.) |
| `cors()` | CORS with configurable origin |
| `express.json({ limit: '10mb' })` | JSON body parsing |
| `express.urlencoded()` | Form data parsing |
| `rateLimit()` | 200 req/min per IP |

### 2. Route-Level Middleware (per endpoint)

| Middleware | Purpose |
|-----------|---------|
| `validate(schema)` | Zod schema validation for params/query/body |
| `authenticate` | JWT verification, sets `req.user` |
| `requireRole(...roles)` | Role-based access control |

### 3. Error Handler (last)

`errorHandler` catches all thrown errors. `AppError` subclasses produce structured JSON responses. Unhandled errors return 500 with redacted messages in production.

## Authentication

JWT-based. The `authenticate` middleware:
1. Extracts token from `Authorization: Bearer <token>` header
2. Verifies with `jsonwebtoken` using `JWT_SECRET`
3. Sets `req.user = { userId, email, role }` on the request

Token payload (AuthPayload):
```typescript
interface AuthPayload {
  userId: string;
  email: string;
  role: 'admin' | 'editor' | 'reviewer' | 'viewer';
}
```

Tokens expire after 7 days by default (`JWT_EXPIRES_IN`).

## Role Hierarchy

| Role | Can Do |
|------|--------|
| **admin** | Everything. Manage users, permissions, households, system |
| **editor** | Create/update content, manage briefs, releases, AI pipelines |
| **reviewer** | Review content, approve/reject, add comments |
| **viewer** | Read-only access to published content |

Note: `ParentAccount` (household domain) is a separate auth system from CMS `User`.

## Prisma Patterns

### Client Singleton

`src/lib/prisma.ts` creates a single PrismaClient instance, reused across hot reloads in development via `globalThis` caching.

```typescript
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ ... });
```

### Soft-Delete Middleware

Applied globally via `prisma.$use()`. Affects 13 models that have `deletedAt`:

- **Reads** (`findMany`, `findFirst`, `count`): Auto-adds `deletedAt: null` filter unless `deletedAt` is explicitly queried
- **Deletes** (`delete`, `deleteMany`): Converted to `update { deletedAt: new Date() }`

To query deleted records, explicitly pass `{ where: { deletedAt: { not: null } } }`.

Models covered: Content, Asset, Collection, Curriculum, Tag, OfflinePack, Experiment, Prompt, Brief, LicensedRight, Household, ParentAccount, ChildProfile.

### Audit Logging

The `logAudit()` helper in `src/lib/audit.ts` writes to the AuditLog table. It:
- Is fire-and-forget (errors are caught and logged, never thrown)
- Records action, entity, entityId, changes (JSON diff), userId, IP address
- Is called explicitly in route handlers that need audit trails (primarily household operations)

## Queue System

Background jobs use **BullMQ** with **Redis**.

### Predefined Queues

| Queue Name | Purpose |
|-----------|---------|
| `media-processing` | Image resize, optimize, thumbnail generation |
| `ai-generation` | AI content/illustration/voice generation |
| `content-release` | Scheduled publish/unpublish execution |
| `localization` | Translation batch operations |
| `offline-packs` | Pack building and bundling |
| `analytics-aggregate` | Analytics rollup jobs |
| `content-qa` | Batch QA check execution |

### Queue/Worker Factory

```typescript
// Creating a queue
const myQueue = createQueue('queue-name');

// Creating a worker
createWorker('queue-name', async (job) => {
  // Process job.data
}, { concurrency: 2 });
```

Queues are created in `src/lib/queue.ts` and used by service modules.

## Validation

The `validate()` middleware:
1. Takes a Zod schema that defines `{ body?, query?, params? }`
2. Parses the request against it
3. On failure: throws `ValidationError` with per-field details
4. On success: merges validated (and coerced) data back onto the request

This means types are guaranteed correct in service code. Zod coercion handles query string numbers (`z.coerce.number()`).

Common reusable schemas in `src/lib/validate.ts`:
- `paginationSchema` -- page, limit, sortBy, sortOrder
- `idParamSchema` -- params.id string
- `slugParamSchema` -- params.slug string

## File Storage

`src/lib/storage.ts` provides a storage abstraction:

| Provider | Config | Notes |
|----------|--------|-------|
| `local` | `STORAGE_LOCAL_PATH` | Files saved to disk, served via Express static |
| `s3` | AWS env vars | Stub implementation -- needs AWS SDK wiring |

The `StorageProvider` interface: `upload`, `download`, `delete`, `getSignedUrl`, `exists`.

Media uploads go through multer (memory storage) then the storage provider.

## Error Classes

Defined in `src/lib/errors.ts`:

| Class | Status | Code |
|-------|--------|------|
| `AppError` | Any | Custom |
| `NotFoundError` | 404 | `NOT_FOUND` |
| `ValidationError` | 400 | `VALIDATION_ERROR` |
| `UnauthorizedError` | 401 | `UNAUTHORIZED` |
| `ForbiddenError` | 403 | `FORBIDDEN` |
| `ConflictError` | 409 | `CONFLICT` |
| `RateLimitError` | 429 | `RATE_LIMIT` |

Throw these anywhere in service code and they are caught by the error handler.

## Key Design Decisions

### Why Monolith?
Single deployable unit is simpler to develop, deploy, and debug for a team building an educational app. The module structure keeps concerns separated and allows extracting microservices later if needed.

### Why Zod Over Prisma Types for Validation?
Prisma types represent database shape. Zod schemas represent API contracts, which can differ (e.g., coerced query params, subset of fields, computed defaults). Keeping them separate avoids leaking database internals to the API layer.

### Why Soft Delete?
Content in an educational app should never be permanently lost by accident. Soft delete allows recovery and provides an audit trail. The middleware makes it transparent to application code.

### Why BullMQ?
AI generation, media processing, and analytics aggregation are long-running tasks that shouldn't block HTTP responses. BullMQ provides reliable job processing, retries, and monitoring through the system admin endpoints.

### Two Auth Systems
CMS users (`User` model) and household users (`ParentAccount`) are separate. CMS users manage content; parents use the app. They have different security requirements, role models, and lifecycles.
