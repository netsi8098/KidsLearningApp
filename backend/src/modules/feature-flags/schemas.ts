import { z } from 'zod';

// ── List Flags ───────────────────────────────────────────

export const listFlagsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sortBy: z.enum(['key', 'name', 'createdAt', 'updatedAt']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    enabled: z.coerce.boolean().optional(),
  }),
});

// ── Get Flag ─────────────────────────────────────────────

export const getFlagSchema = z.object({
  params: z.object({
    key: z.string().min(1),
  }),
});

// ── Create Flag ──────────────────────────────────────────

export const createFlagSchema = z.object({
  body: z.object({
    key: z.string().min(1).max(100).regex(/^[a-z0-9_.-]+$/, {
      message: 'Key must be lowercase alphanumeric with dots, hyphens, or underscores',
    }),
    name: z.string().min(1).max(200),
    description: z.string().max(2000).optional(),
    enabled: z.boolean().default(false),
    targeting: z.record(z.unknown()).optional().default({}),
    defaultValue: z.unknown().optional().default(false),
  }),
});

// ── Update Flag ──────────────────────────────────────────

export const updateFlagSchema = z.object({
  params: z.object({
    key: z.string().min(1),
  }),
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().max(2000).optional(),
    enabled: z.boolean().optional(),
    targeting: z.record(z.unknown()).optional(),
    defaultValue: z.unknown().optional(),
  }).refine(obj => Object.keys(obj).length > 0, {
    message: 'At least one field must be provided for update',
  }),
});

// ── Delete Flag ──────────────────────────────────────────

export const deleteFlagSchema = z.object({
  params: z.object({
    key: z.string().min(1),
  }),
});

// ── Kill Switch ──────────────────────────────────────────

export const killFlagSchema = z.object({
  params: z.object({
    key: z.string().min(1),
  }),
});

// ── Evaluate Batch ───────────────────────────────────────

export const evaluateBatchSchema = z.object({
  body: z.object({
    keys: z.array(z.string().min(1)).min(1).max(100),
    context: z.object({
      environment: z.string().optional(),
      appVersion: z.string().optional(),
      locale: z.string().optional(),
      ageBand: z.string().optional(),
      premiumOnly: z.boolean().optional(),
      householdId: z.string().optional(),
      profileId: z.string().optional(),
    }).optional().default({}),
  }),
});

// ── Evaluate Single ──────────────────────────────────────

export const evaluateSingleSchema = z.object({
  params: z.object({
    key: z.string().min(1),
  }),
  query: z.object({
    environment: z.string().optional(),
    appVersion: z.string().optional(),
    locale: z.string().optional(),
    ageBand: z.string().optional(),
    premiumOnly: z.coerce.boolean().optional(),
    householdId: z.string().optional(),
    profileId: z.string().optional(),
  }).optional().default({}),
});

// ── Inferred Types ───────────────────────────────────────

export type ListFlagsQuery = z.infer<typeof listFlagsSchema>['query'];
export type CreateFlagInput = z.infer<typeof createFlagSchema>['body'];
export type UpdateFlagInput = z.infer<typeof updateFlagSchema>['body'];
export type EvaluateBatchInput = z.infer<typeof evaluateBatchSchema>['body'];
export type EvaluateSingleQuery = z.infer<typeof evaluateSingleSchema>['query'];
