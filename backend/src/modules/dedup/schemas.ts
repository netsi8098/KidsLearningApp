import { z } from 'zod';

// ── Scan for Duplicates ──────────────────────────────────

export const scanSchema = z.object({
  body: z.object({
    contentId: z.string().uuid().optional(),
    threshold: z.number().min(0).max(1).default(0.5),
  }).optional().default({}),
});

export type ScanInput = z.infer<typeof scanSchema>['body'];

// ── Get Similar Content ──────────────────────────────────

export const getSimilarSchema = z.object({
  params: z.object({
    contentId: z.string().uuid(),
  }),
  query: z.object({
    threshold: z.coerce.number().min(0).max(1).default(0.3),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

export type GetSimilarQuery = z.infer<typeof getSimilarSchema>['query'];

// ── Compare Two Items ────────────────────────────────────

export const compareSchema = z.object({
  body: z.object({
    contentIdA: z.string().uuid(),
    contentIdB: z.string().uuid(),
  }).refine(
    (data) => data.contentIdA !== data.contentIdB,
    { message: 'Cannot compare content with itself', path: ['contentIdB'] }
  ),
});

export type CompareInput = z.infer<typeof compareSchema>['body'];

// ── Get Clusters ─────────────────────────────────────────

export const getClustersSchema = z.object({
  query: z.object({
    threshold: z.coerce.number().min(0).max(1).default(0.6),
  }),
});

export type GetClustersQuery = z.infer<typeof getClustersSchema>['query'];

// ── Resolve Pair ─────────────────────────────────────────

export const resolveSchema = z.object({
  body: z.object({
    contentIdA: z.string().uuid(),
    contentIdB: z.string().uuid(),
    action: z.enum(['dismiss', 'merge']),
    keepId: z.string().uuid().optional(),
  }).refine(
    (data) => {
      if (data.action === 'merge' && !data.keepId) {
        return false;
      }
      return true;
    },
    { message: 'keepId is required when action is merge', path: ['keepId'] }
  ).refine(
    (data) => {
      if (data.action === 'merge' && data.keepId) {
        return data.keepId === data.contentIdA || data.keepId === data.contentIdB;
      }
      return true;
    },
    { message: 'keepId must be one of the two content IDs', path: ['keepId'] }
  ),
});

export type ResolveInput = z.infer<typeof resolveSchema>['body'];

// ── Dedup Stats ──────────────────────────────────────────

export const dedupStatsSchema = z.object({
  query: z.object({}).optional(),
});
