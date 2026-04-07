# API Reference

Base URL: `http://localhost:4000/api`

All authenticated endpoints require `Authorization: Bearer <token>` header.
Role abbreviations: **A** = admin, **E** = editor, **R** = reviewer, **V** = viewer.

---

## Auth (`/api/auth`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| POST | `/auth/register` | No | -- | Register new user |
| POST | `/auth/login` | No | -- | Login, returns JWT |
| GET | `/auth/me` | Yes | Any | Get current user profile |
| PATCH | `/auth/users/:id/role` | Yes | A | Update user role |

---

## Content (`/api/content`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/content` | No | -- | List content with pagination and filters |
| GET | `/content/:id` | No | -- | Get content by ID |
| POST | `/content` | Yes | A, E | Create content |
| PATCH | `/content/:id` | Yes | A, E | Update content |
| DELETE | `/content/:id` | Yes | A | Soft-delete (archive) content |
| POST | `/content/:id/tags` | Yes | A, E | Add tags to content |
| DELETE | `/content/:id/tags/:tagId` | Yes | A, E | Remove tag from content |
| GET | `/content/:id/history` | No | -- | Get content version/audit history |
| POST | `/content/:id/duplicate` | Yes | A, E | Duplicate content item |
| GET | `/content/:id/skills` | No | -- | List skills for content |
| POST | `/content/:id/skills` | Yes | A, E | Add skills to content |
| DELETE | `/content/:id/skills/:skillId` | Yes | A, E | Remove skill from content |

---

## Curriculum (`/api/curriculum`)

All routes require authentication.

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/curriculum` | Yes | Any | List curricula with filters |
| GET | `/curriculum/:id` | Yes | Any | Get curriculum with units and items |
| POST | `/curriculum` | Yes | A, E | Create curriculum |
| PATCH | `/curriculum/:id` | Yes | A, E | Update curriculum |
| POST | `/curriculum/:id/units` | Yes | A, E | Add unit to curriculum |
| PATCH | `/curriculum/:id/units/:unitId` | Yes | A, E | Update unit |
| DELETE | `/curriculum/:id/units/:unitId` | Yes | A, E | Delete unit |
| POST | `/curriculum/:id/units/:unitId/items` | Yes | A, E | Add content item to unit |
| DELETE | `/curriculum/:id/units/:unitId/items/:itemId` | Yes | A, E | Remove item from unit |
| POST | `/curriculum/:id/compile` | Yes | A, E | Compile/validate curriculum |
| POST | `/curriculum/:id/publish` | Yes | A, E | Publish curriculum |

---

## Releases (`/api/releases`)

All routes require authentication.

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/releases` | Yes | Any | List releases with filters |
| GET | `/releases/calendar` | Yes | Any | Get releases for calendar view (date range) |
| GET | `/releases/:id` | Yes | Any | Get release details |
| POST | `/releases` | Yes | A, E | Create release (schedule or immediate) |
| PATCH | `/releases/:id` | Yes | A, E | Update release (cancel, reschedule) |
| POST | `/releases/:id/execute` | Yes | A, E | Manually execute a release |
| POST | `/releases/batch` | Yes | A, E | Batch create releases for multiple content |

---

## QA (`/api/qa`)

All routes require authentication.

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/qa/checks` | Yes | Any | List available QA checks |
| GET | `/qa/dashboard` | Yes | Any | QA dashboard stats |
| POST | `/qa/run/:contentId` | Yes | A, E, R | Run all QA checks on content |
| GET | `/qa/results/:contentId` | Yes | Any | Get QA results for content |
| POST | `/qa/batch` | Yes | A, E, R | Batch run QA on multiple content (queued) |

---

## Reviews (`/api/reviews`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/reviews` | Yes | Any | List reviews with filters |
| GET | `/reviews/queue` | Yes | Any | Get personal review queue |
| GET | `/reviews/stats` | Yes | Any | Review statistics |
| GET | `/reviews/:id` | Yes | Any | Get review detail |
| POST | `/reviews` | Yes | A, E, R | Create review |
| PATCH | `/reviews/:id` | Yes | A, E, R | Update review (approve, request changes, reject) |
| POST | `/reviews/:id/comments` | Yes | Any | Add comment to review |
| PATCH | `/reviews/:id/comments/:commentId` | Yes | Any | Resolve/unresolve comment |
| POST | `/reviews/:id/assign` | Yes | A, E | Assign reviewer |

---

## Briefs (`/api/briefs`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/briefs` | Yes | Any | List briefs with filters |
| GET | `/briefs/:id` | Yes | Any | Get brief detail |
| POST | `/briefs` | Yes | A, E | Create brief |
| PATCH | `/briefs/:id` | Yes | A, E | Update brief |
| POST | `/briefs/:id/generate` | Yes | A, E | Trigger AI content generation |
| POST | `/briefs/:id/accept` | Yes | A, E | Accept generated content (creates Content) |
| POST | `/briefs/:id/reject` | Yes | A, E | Reject generated content |

---

## Story Pipeline (`/api/story-pipeline`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/story-pipeline/active` | Yes | Any | List active pipelines with stage counts |
| GET | `/story-pipeline/:contentId/steps` | Yes | Any | Get all steps for a story |
| POST | `/story-pipeline/:contentId/start` | Yes | A, E | Start story pipeline |
| PATCH | `/story-pipeline/:contentId/steps/:stepId` | Yes | A, E, R | Update step data/status |
| POST | `/story-pipeline/:contentId/steps/:stepId/advance` | Yes | A, E | Advance to next step |
| POST | `/story-pipeline/:contentId/generate-outline` | Yes | A, E | AI-generate story outline |
| POST | `/story-pipeline/:contentId/generate-draft` | Yes | A, E | AI-generate story draft |

---

## Illustrations (`/api/illustrations`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/illustrations/styles` | Yes | Any | List available illustration styles |
| GET | `/illustrations` | Yes | Any | List illustration jobs |
| GET | `/illustrations/:id` | Yes | Any | Get job detail |
| POST | `/illustrations` | Yes | A, E | Create illustration job |
| POST | `/illustrations/:id/generate` | Yes | A, E | Trigger generation (queued) |
| PATCH | `/illustrations/:id` | Yes | A, E, R | Update job (approve/reject/edit) |
| POST | `/illustrations/:id/regenerate` | Yes | A, E | Regenerate illustration |

---

## Prompts (`/api/prompts`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/prompts` | Yes | Any | List prompts with filters |
| GET | `/prompts/:id` | Yes | Any | Get prompt with usage stats |
| POST | `/prompts` | Yes | A, E | Create prompt template |
| PATCH | `/prompts/:id` | Yes | A, E | Update prompt (creates new version) |
| POST | `/prompts/:id/render` | Yes | Any | Render prompt with variables |
| GET | `/prompts/:id/usage` | Yes | Any | Get usage history and stats |
| POST | `/prompts/:id/test` | Yes | A, E | Test render with sample variables |

---

## Voice (`/api/voice`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/voice/profiles` | Yes | Any | List available voice profiles |
| POST | `/voice/preview` | Yes | Any | Preview TTS with short text |
| GET | `/voice` | Yes | Any | List voice jobs |
| GET | `/voice/:id` | Yes | Any | Get voice job detail |
| POST | `/voice` | Yes | A, E | Create voice job |
| POST | `/voice/:id/render` | Yes | A, E | Trigger audio rendering (queued) |
| PATCH | `/voice/:id` | Yes | A, E, R | Update job (approve/reject/edit) |

---

## Localization (`/api/localization`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/localization/locales` | Yes | Any | List supported locales with stats |
| GET | `/localization/status` | Yes | Any | Translation coverage dashboard |
| GET | `/localization/missing` | Yes | Any | List content missing translations |
| POST | `/localization/batch` | Yes | A, E | Batch create translations |
| POST | `/localization/export/:locale` | Yes | Any | Export translations for locale as JSON |
| GET | `/localization/content/:contentId` | Yes | Any | Get all translations for content |
| POST | `/localization/content/:contentId` | Yes | A, E | Add/update translation |
| PATCH | `/localization/:id` | Yes | A, E, R | Update translation status |

---

## Media (`/api/media`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| POST | `/media/upload` | Yes | A, E | Upload file (multipart, max 10MB) |
| GET | `/media` | Yes | Any | List assets with filters |
| GET | `/media/:id` | Yes | Any | Get asset metadata |
| GET | `/media/:id/url` | Yes | Any | Get signed URL for download |
| DELETE | `/media/:id` | Yes | A, E | Delete asset and variants |
| POST | `/media/:id/process` | Yes | A, E | Trigger image processing (resize, optimize) |
| PATCH | `/media/:id` | Yes | A, E | Update metadata (alt text, etc.) |

---

## Offline Packs (`/api/offline-packs`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/offline-packs` | Yes | Any | List packs |
| GET | `/offline-packs/:id` | Yes | Any | Get pack with items |
| POST | `/offline-packs` | Yes | A, E | Create pack |
| PATCH | `/offline-packs/:id` | Yes | A, E | Update pack |
| POST | `/offline-packs/:id/items` | Yes | A, E | Add content to pack |
| DELETE | `/offline-packs/:id/items/:itemId` | Yes | A, E | Remove item from pack |
| POST | `/offline-packs/:id/build` | Yes | A, E | Trigger pack build (queued) |
| POST | `/offline-packs/:id/publish` | Yes | A | Publish pack |
| GET | `/offline-packs/:id/manifest` | Yes | Any | Get pack manifest for download |

---

## Search (`/api/search`)

All routes require authentication.

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/search` | Yes | Any | Full-text search across content |
| GET | `/search/suggest` | Yes | Any | Autocomplete suggestions |
| GET | `/search/facets` | Yes | Any | Facet counts (type, age, difficulty) |
| GET | `/search/related/:contentId` | Yes | Any | Related content |
| GET | `/search/trending` | Yes | Any | Trending content by period |
| GET | `/search/recent` | Yes | Any | Recently published content |

---

## Experiments (`/api/experiments`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/experiments` | Yes | Any | List experiments |
| GET | `/experiments/:id` | Yes | Any | Get experiment detail |
| POST | `/experiments` | Yes | A, E | Create experiment |
| PATCH | `/experiments/:id` | Yes | A, E | Update experiment |
| POST | `/experiments/:id/start` | Yes | A, E | Start experiment |
| POST | `/experiments/:id/stop` | Yes | A, E | Stop experiment |
| POST | `/experiments/:id/variants` | Yes | A, E | Add variant |
| PATCH | `/experiments/:id/variants/:variantId` | Yes | A, E | Update variant weight |
| POST | `/experiments/:id/record` | Yes | Any | Record result metric |
| GET | `/experiments/:id/results` | Yes | Any | Get experiment results |
| POST | `/experiments/:id/assign` | Yes | Any | Assign variant to user |

---

## Analytics (`/api/analytics`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| POST | `/analytics/event` | Yes | Any | Record analytics event |
| GET | `/analytics/content/:contentId` | Yes | Any | Get content analytics |
| GET | `/analytics/dashboard` | Yes | Any | Aggregate dashboard metrics |
| GET | `/analytics/top` | Yes | Any | Top content by metric |
| GET | `/analytics/engagement` | Yes | Any | Engagement metrics |
| POST | `/analytics/aggregate` | Yes | A | Trigger aggregation job |
| GET | `/analytics/export` | Yes | A, E | Export analytics as CSV |

---

## Dedup (`/api/dedup`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| POST | `/dedup/scan` | Yes | A, E | Scan content for similar items |
| GET | `/dedup/similar/:contentId` | Yes | Any | Get similar content |
| POST | `/dedup/compare` | Yes | Any | Compare two content items |
| GET | `/dedup/clusters` | Yes | Any | Get similarity clusters |
| POST | `/dedup/resolve` | Yes | A, E | Resolve duplicate pair (merge/ignore/archive) |
| GET | `/dedup/stats` | Yes | Any | Dedup statistics |

---

## Governance (`/api/governance`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/governance` | Yes | Any | List licenses |
| GET | `/governance/expiring` | Yes | Any | Get expiring licenses |
| GET | `/governance/audit` | Yes | A, E | License audit report |
| POST | `/governance/check/:contentId` | Yes | Any | Check license compliance |
| GET | `/governance/content/:contentId` | Yes | Any | Get licenses for content |
| GET | `/governance/:id` | Yes | Any | Get license detail |
| POST | `/governance` | Yes | A, E | Create license |
| PATCH | `/governance/:id` | Yes | A, E | Update license |
| DELETE | `/governance/:id` | Yes | A, E | Delete license |

---

## Audit (`/api/audit`)

All routes admin-only.

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/audit` | Yes | A | List audit logs with filters |
| GET | `/audit/entity/:entity/:entityId` | Yes | A | Get entity audit trail |
| GET | `/audit/:id` | Yes | A | Get single audit log entry |

---

## Permissions (`/api/permissions`)

All routes admin-only.

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/permissions` | Yes | A | List permissions (filter by role/resource) |
| GET | `/permissions/check` | Yes | A | Check if role has permission |
| POST | `/permissions` | Yes | A | Create permission rule |
| PATCH | `/permissions/:id` | Yes | A | Update permission |
| DELETE | `/permissions/:id` | Yes | A | Delete permission |

---

## Households (`/api/households`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/households` | Yes | A | List households with pagination |
| GET | `/households/search` | Yes | A | Search households by email/name/ID |
| GET | `/households/:id` | Yes | A | Get household with parents/children |
| POST | `/households` | Yes | A | Create household |
| PATCH | `/households/:id` | Yes | A | Update household |
| GET | `/households/:id/support` | Yes | A | Full support view |
| POST | `/households/:householdId/parents` | Yes | A | Create parent account |
| PATCH | `/households/:householdId/parents/:parentId` | Yes | A | Update parent |
| POST | `/households/:householdId/children` | Yes | A | Create child profile |
| PATCH | `/households/:householdId/children/:childId` | Yes | A | Update child |
| POST | `/households/:householdId/invites` | Yes | A | Create caregiver invite |
| POST | `/households/invites/accept` | No | -- | Accept invite (public, token-based) |
| PATCH | `/households/:householdId/children/:childId/sync` | Yes | Any | Sync child profile from frontend |

---

## System (`/api/system`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/system/health` | No | -- | Health check (public) |
| GET | `/system/info` | Yes | A | System info (versions, uptime) |
| GET | `/system/db-stats` | Yes | A | Database statistics |
| GET | `/system/queues` | Yes | A | Queue stats (optional queue filter) |
| GET | `/system/queues/:queue/jobs/:jobId` | Yes | A | Job detail |
| POST | `/system/queues/:queue/jobs/:jobId/retry` | Yes | A | Retry failed job |
| POST | `/system/queues/:queue/jobs/:jobId/cancel` | Yes | A | Cancel job |
| POST | `/system/cache/clear` | Yes | A | Clear cache (by pattern) |

---

## Maintenance (`/api/maintenance`)

All routes admin-only.

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/maintenance` | Yes | A | List maintenance jobs |
| GET | `/maintenance/:jobId` | Yes | A | Get job detail |
| POST | `/maintenance/:jobId/run` | Yes | A | Run maintenance job (supports dry run) |
| GET | `/maintenance/:jobId/history` | Yes | A | Get job run history |

---

## Health Check (Root)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | No | Root health check: `{ status: "ok", timestamp }` |

---

## Error Response Format

All errors follow this shape:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable message",
    "details": {}
  }
}
```

Error codes: `VALIDATION_ERROR` (400), `UNAUTHORIZED` (401), `FORBIDDEN` (403), `NOT_FOUND` (404), `CONFLICT` (409), `RATE_LIMIT` (429), `INTERNAL_ERROR` (500).

## Rate Limiting

Global rate limit: **200 requests per minute** per IP. Returns standard `429` with `RateLimit-*` headers.
