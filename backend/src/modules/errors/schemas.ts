import { z } from 'zod';

// ── Enums ─────────────────────────────────────────────────

const errorCategoryEnum = z.enum([
  'runtime', 'asset_load', 'sync', 'offline_pack', 'billing', 'localization',
]);

const errorGroupStatusEnum = z.enum([
  'new', 'investigating', 'release_blocking', 'resolved',
]);

// ── Report Error ──────────────────────────────────────────

export const reportErrorSchema = z.object({
  body: z.object({
    category: errorCategoryEnum,
    message: z.string().min(1).max(2000),
    stack: z.string().max(10000).optional(),
    metadata: z.record(z.unknown()).optional().default({}),
    deviceInfo: z.record(z.unknown()).optional(),
    appVersion: z.string().max(50).optional(),
    releaseId: z.string().optional(),
    profileId: z.string().optional(),
  }),
});

// ── List Error Groups ─────────────────────────────────────

export const listErrorGroupsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sortBy: z.enum(['lastSeen', 'firstSeen', 'count']).default('lastSeen'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    status: errorGroupStatusEnum.optional(),
    category: errorCategoryEnum.optional(),
  }),
});

// ── Get Error Group ───────────────────────────────────────

export const getErrorGroupSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

// ── Update Error Group ────────────────────────────────────

export const updateErrorGroupSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    status: errorGroupStatusEnum.optional(),
    assignee: z.string().max(200).optional(),
  }),
});

// ── List Occurrences ──────────────────────────────────────

export const listOccurrencesSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

// ── Error Stats ───────────────────────────────────────────

export const errorStatsSchema = z.object({
  query: z.object({
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
  }).optional(),
});

// ── Evaluate Quality Gates ────────────────────────────────

export const evaluateQualityGatesSchema = z.object({
  body: z.object({}).optional().default({}),
});

// ── Inferred Types ────────────────────────────────────────

export type ReportErrorInput = z.infer<typeof reportErrorSchema>['body'];
export type ListErrorGroupsQuery = z.infer<typeof listErrorGroupsSchema>['query'];
export type UpdateErrorGroupInput = z.infer<typeof updateErrorGroupSchema>['body'];
export type ListOccurrencesQuery = z.infer<typeof listOccurrencesSchema>['query'];
export type ErrorStatsQuery = NonNullable<z.infer<typeof errorStatsSchema>['query']>;
