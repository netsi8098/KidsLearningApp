import { z } from 'zod';

// ── List Packs ──────────────────────────────────────────────

export const listPacksSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    published: z.coerce.boolean().optional(),
    ageGroup: z.enum(['age_2_3', 'age_3_4', 'age_4_5', 'age_5_6', 'all']).optional(),
    sortBy: z.enum(['createdAt', 'updatedAt', 'title', 'sizeEstimateMB']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
});

export type ListPacksQuery = z.infer<typeof listPacksSchema>['query'];

// ── Get Pack ────────────────────────────────────────────────

export const getPackSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

// ── Create Pack ─────────────────────────────────────────────

export const createPackSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200),
    slug: z.string().min(1).max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: 'Slug must be lowercase alphanumeric with hyphens only',
    }),
    emoji: z.string().max(10).default(''),
    description: z.string().max(2000).optional(),
    ageGroup: z.enum(['age_2_3', 'age_3_4', 'age_4_5', 'age_5_6', 'all']).default('all'),
  }),
});

export type CreatePackBody = z.infer<typeof createPackSchema>['body'];

// ── Update Pack ─────────────────────────────────────────────

export const updatePackSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    emoji: z.string().max(10).optional(),
    description: z.string().max(2000).nullable().optional(),
    ageGroup: z.enum(['age_2_3', 'age_3_4', 'age_4_5', 'age_5_6', 'all']).optional(),
  }).refine(
    (data) =>
      data.title !== undefined ||
      data.emoji !== undefined ||
      data.description !== undefined ||
      data.ageGroup !== undefined,
    { message: 'At least one field must be provided for update' }
  ),
});

export type UpdatePackBody = z.infer<typeof updatePackSchema>['body'];

// ── Add Item to Pack ────────────────────────────────────────

export const addPackItemSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    contentId: z.string().uuid(),
    includeAssets: z.boolean().default(true),
  }),
});

export type AddPackItemBody = z.infer<typeof addPackItemSchema>['body'];

// ── Remove Item from Pack ───────────────────────────────────

export const removePackItemSchema = z.object({
  params: z.object({
    id: z.string().min(1),
    itemId: z.string().min(1),
  }),
});

// ── Build Pack ──────────────────────────────────────────────

export const buildPackSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

// ── Publish Pack ────────────────────────────────────────────

export const publishPackSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

// ── Get Pack Manifest ───────────────────────────────────────

export const getPackManifestSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});
