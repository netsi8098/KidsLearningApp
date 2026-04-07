import { z } from 'zod';

// ── Enums ─────────────────────────────────────────────────

const exportTypeEnum = z.enum([
  'households', 'profiles', 'catalog', 'events',
  'subscriptions', 'releases', 'experiments', 'analytics',
]);

const exportFormatEnum = z.enum(['csv', 'json']);

const exportStatusEnum = z.enum(['pending', 'processing', 'completed', 'failed']);

// ── List Export Jobs ──────────────────────────────────────

export const listExportJobsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sortBy: z.enum(['createdAt', 'type', 'status']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    type: exportTypeEnum.optional(),
    status: exportStatusEnum.optional(),
  }),
});

// ── Create Export Job ─────────────────────────────────────

export const createExportJobSchema = z.object({
  body: z.object({
    type: exportTypeEnum,
    filters: z.record(z.unknown()).optional().default({}),
    format: exportFormatEnum,
  }),
});

// ── Get Export Job ────────────────────────────────────────

export const getExportJobSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

// ── Download Export File ─────────────────────────────────

export const downloadExportSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

// ── Cancel Export Job ─────────────────────────────────────

export const cancelExportJobSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

// ── Inferred Types ────────────────────────────────────────

export type ListExportJobsQuery = z.infer<typeof listExportJobsSchema>['query'];
export type CreateExportJobInput = z.infer<typeof createExportJobSchema>['body'];
export type ExportType = z.infer<typeof exportTypeEnum>;
export type ExportFormat = z.infer<typeof exportFormatEnum>;
export type ExportStatus = z.infer<typeof exportStatusEnum>;
