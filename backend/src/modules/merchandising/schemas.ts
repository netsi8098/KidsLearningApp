import { z } from 'zod';

// ── Enums ─────────────────────────────────────────────────

const assetTypeEnum = z.enum(['screenshot', 'banner', 'hero', 'campaign']);
const assetStatusEnum = z.enum(['draft', 'review', 'approved', 'active', 'expired']);
const platformEnum = z.enum(['ios', 'android', 'web', 'all']);

// ── List Merchandising Assets ─────────────────────────────

export const listAssetsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sortBy: z.enum(['createdAt', 'updatedAt', 'title']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    type: assetTypeEnum.optional(),
    status: assetStatusEnum.optional(),
    campaign: z.string().optional(),
    platform: platformEnum.optional(),
  }),
});

// ── Get Asset ─────────────────────────────────────────────

export const getAssetSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

// ── Create Asset ──────────────────────────────────────────

export const createAssetSchema = z.object({
  body: z.object({
    type: assetTypeEnum,
    title: z.string().min(1).max(255),
    filename: z.string().min(1).max(500),
    storageKey: z.string().min(1).max(1000),
    locale: z.string().min(2).max(10).default('en'),
    platform: platformEnum,
    aspectRatio: z.string().max(20).optional(),
    campaign: z.string().max(255).optional(),
    releaseId: z.string().optional(),
    collectionId: z.string().optional(),
    metadata: z.record(z.unknown()).optional(),
  }),
});

// ── Update Asset ──────────────────────────────────────────

export const updateAssetSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    type: assetTypeEnum.optional(),
    title: z.string().min(1).max(255).optional(),
    filename: z.string().min(1).max(500).optional(),
    locale: z.string().min(2).max(10).optional(),
    platform: platformEnum.optional(),
    aspectRatio: z.string().max(20).nullable().optional(),
    campaign: z.string().max(255).nullable().optional(),
    releaseId: z.string().nullable().optional(),
    collectionId: z.string().nullable().optional(),
    expiresAt: z.string().datetime().nullable().optional(),
    metadata: z.record(z.unknown()).optional(),
  }).refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field must be provided for update' }
  ),
});

// ── Delete Asset ──────────────────────────────────────────

export const deleteAssetSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

// ── Approve Asset ─────────────────────────────────────────

export const approveAssetSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

// ── Campaign Name Param ───────────────────────────────────

export const campaignNameSchema = z.object({
  params: z.object({
    name: z.string().min(1),
  }),
});

// ── Inferred Types ────────────────────────────────────────

export type ListAssetsQuery = z.infer<typeof listAssetsSchema>['query'];
export type CreateAssetInput = z.infer<typeof createAssetSchema>['body'];
export type UpdateAssetInput = z.infer<typeof updateAssetSchema>['body'];
