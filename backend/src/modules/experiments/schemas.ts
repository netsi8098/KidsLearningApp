import { z } from 'zod';

// ── Enums ─────────────────────────────────────────────────

const experimentStatusEnum = z.enum(['draft', 'running', 'paused', 'completed', 'cancelled']);

// ── List Experiments ──────────────────────────────────────

export const listExperimentsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sortBy: z.enum(['name', 'createdAt', 'startDate', 'endDate']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    status: experimentStatusEnum.optional(),
  }),
});

// ── Get Experiment ────────────────────────────────────────

export const getExperimentSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

// ── Create Experiment ─────────────────────────────────────

export const createExperimentSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(200),
    description: z.string().max(2000).optional(),
  }),
});

// ── Update Experiment ─────────────────────────────────────

export const updateExperimentSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().max(2000).optional(),
  }).refine(obj => Object.keys(obj).length > 0, {
    message: 'At least one field must be provided for update',
  }),
});

// ── Start / Stop Experiment ───────────────────────────────

export const experimentIdSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

// ── Add Variant ───────────────────────────────────────────

export const addVariantSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    name: z.string().min(1).max(200),
    contentId: z.string().optional(),
    weight: z.number().min(0).max(1).default(0.5),
    config: z.record(z.unknown()).optional().default({}),
  }),
});

// ── Update Variant Weight ─────────────────────────────────

export const updateVariantSchema = z.object({
  params: z.object({
    id: z.string().min(1),
    variantId: z.string().min(1),
  }),
  body: z.object({
    weight: z.number().min(0).max(1),
  }),
});

// ── Record Result ─────────────────────────────────────────

export const recordResultSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    variantId: z.string().min(1),
    metric: z.string().min(1).max(100),
    value: z.number(),
    sampleSize: z.number().int().min(1),
  }),
});

// ── Get Results ───────────────────────────────────────────

export const getResultsSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  query: z.object({
    metric: z.string().optional(),
  }).optional().default({}),
});

// ── Assign Variant ────────────────────────────────────────

export const assignVariantSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    userId: z.string().min(1),
  }),
});

// ── Inferred Types ────────────────────────────────────────

export type ListExperimentsQuery = z.infer<typeof listExperimentsSchema>['query'];
export type CreateExperimentInput = z.infer<typeof createExperimentSchema>['body'];
export type UpdateExperimentInput = z.infer<typeof updateExperimentSchema>['body'];
export type AddVariantInput = z.infer<typeof addVariantSchema>['body'];
export type UpdateVariantInput = z.infer<typeof updateVariantSchema>['body'];
export type RecordResultInput = z.infer<typeof recordResultSchema>['body'];
export type GetResultsQuery = z.infer<typeof getResultsSchema>['query'];
export type AssignVariantInput = z.infer<typeof assignVariantSchema>['body'];
