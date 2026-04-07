import { z } from 'zod';

// ── List Deep Links ──────────────────────────────────────

export const listDeepLinksSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sortBy: z.enum(['createdAt', 'clicks', 'shortCode']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    targetType: z.string().optional(),
    campaign: z.string().optional(),
  }),
});

export type ListDeepLinksQuery = z.infer<typeof listDeepLinksSchema>['query'];

// ── Create Deep Link ─────────────────────────────────────

export const createDeepLinkSchema = z.object({
  body: z.object({
    targetType: z.string().min(1).max(100),
    targetId: z.string().max(200).optional(),
    targetPath: z.string().max(500).optional(),
    campaign: z.string().max(200).optional(),
    expiresAt: z.coerce.date().optional(),
    metadata: z.record(z.unknown()).optional().default({}),
  }),
});

export type CreateDeepLinkInput = z.infer<typeof createDeepLinkSchema>['body'];

// ── Resolve Deep Link ────────────────────────────────────

export const resolveDeepLinkSchema = z.object({
  params: z.object({
    shortCode: z.string().min(1).max(20),
  }),
});

// ── Get Deep Link ────────────────────────────────────────

export const getDeepLinkSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

// ── Update Deep Link ─────────────────────────────────────

export const updateDeepLinkSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    targetType: z.string().min(1).max(100).optional(),
    targetId: z.string().max(200).nullable().optional(),
    targetPath: z.string().max(500).nullable().optional(),
    campaign: z.string().max(200).nullable().optional(),
    expiresAt: z.coerce.date().nullable().optional(),
    metadata: z.record(z.unknown()).optional(),
  }).refine(
    (data) =>
      data.targetType !== undefined ||
      data.targetId !== undefined ||
      data.targetPath !== undefined ||
      data.campaign !== undefined ||
      data.expiresAt !== undefined ||
      data.metadata !== undefined,
    { message: 'At least one field must be provided for update' }
  ),
});

export type UpdateDeepLinkInput = z.infer<typeof updateDeepLinkSchema>['body'];

// ── Delete Deep Link ─────────────────────────────────────

export const deleteDeepLinkSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});
