import { z } from 'zod';

// ── Enums ─────────────────────────────────────────────────

const releaseActionEnum = z.enum(['publish', 'unpublish', 'archive', 'feature', 'unfeature']);
const releaseStatusEnum = z.enum(['pending', 'scheduled', 'executed', 'cancelled', 'failed']);

// ── Create Release ────────────────────────────────────────

export const createReleaseSchema = z.object({
  body: z.object({
    contentId: z.string().min(1),
    action: releaseActionEnum,
    scheduledAt: z.string().datetime().optional(),
    notes: z.string().max(2000).optional(),
  }),
});

// ── Update Release ────────────────────────────────────────

export const updateReleaseSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    status: z.enum(['cancelled']).optional(),
    scheduledAt: z.string().datetime().optional(),
    notes: z.string().max(2000).optional(),
  }),
});

// ── List Releases ─────────────────────────────────────────

export const listReleasesSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sortBy: z.enum(['createdAt', 'scheduledAt', 'executedAt']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    status: releaseStatusEnum.optional(),
    action: releaseActionEnum.optional(),
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
  }),
});

// ── Get Release ───────────────────────────────────────────

export const getReleaseSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

// ── Execute Release ───────────────────────────────────────

export const executeReleaseSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

// ── Calendar View ─────────────────────────────────────────

export const calendarSchema = z.object({
  query: z.object({
    from: z.string().datetime(),
    to: z.string().datetime(),
  }),
});

// ── Batch Create ──────────────────────────────────────────

export const batchCreateSchema = z.object({
  body: z.object({
    releases: z.array(
      z.object({
        contentId: z.string().min(1),
        action: releaseActionEnum,
        scheduledAt: z.string().datetime().optional(),
        notes: z.string().max(2000).optional(),
      })
    ).min(1).max(50),
  }),
});

// ── Inferred Types ────────────────────────────────────────

export type CreateReleaseInput = z.infer<typeof createReleaseSchema>['body'];
export type UpdateReleaseInput = z.infer<typeof updateReleaseSchema>['body'];
export type ListReleasesQuery = z.infer<typeof listReleasesSchema>['query'];
export type CalendarQuery = z.infer<typeof calendarSchema>['query'];
export type BatchCreateInput = z.infer<typeof batchCreateSchema>['body'];
