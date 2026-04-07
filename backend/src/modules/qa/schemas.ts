import { z } from 'zod';

// ── Run QA Checks ─────────────────────────────────────────

export const runQASchema = z.object({
  params: z.object({
    contentId: z.string().min(1),
  }),
});

// ── Get QA Results ────────────────────────────────────────

export const getQAResultsSchema = z.object({
  params: z.object({
    contentId: z.string().min(1),
  }),
  query: z.object({
    severity: z.enum(['error', 'warning', 'info']).optional(),
    passed: z.coerce.boolean().optional(),
  }).optional(),
});

// ── Batch QA ──────────────────────────────────────────────

export const batchQASchema = z.object({
  body: z.object({
    contentIds: z.array(z.string().min(1)).min(1).max(100),
  }),
});

// ── Dashboard ─────────────────────────────────────────────

export const dashboardSchema = z.object({
  query: z.object({
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
    contentType: z.string().optional(),
  }).optional(),
});

// ── Check Result Type ─────────────────────────────────────

export const qaCheckResultSchema = z.object({
  checkName: z.string(),
  category: z.enum(['content', 'metadata', 'assets', 'seo', 'quality']),
  passed: z.boolean(),
  severity: z.enum(['error', 'warning', 'info']),
  message: z.string(),
  autoFix: z.boolean(),
});

// ── Inferred Types ────────────────────────────────────────

export type QACheckResult = z.infer<typeof qaCheckResultSchema>;
export type BatchQAInput = z.infer<typeof batchQASchema>['body'];
