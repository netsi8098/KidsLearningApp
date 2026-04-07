import { z } from 'zod';

// ── Enums ─────────────────────────────────────────────────

const queueEnum = z.enum([
  'media', 'ai', 'release', 'search', 'analytics', 'maintenance', 'notification',
]);

// ── Health Check ──────────────────────────────────────────

export const healthCheckSchema = z.object({});

// ── Queue Stats ───────────────────────────────────────────

export const queueStatsSchema = z.object({
  query: z.object({
    queue: queueEnum.optional(),
  }),
});

// ── Job Detail ────────────────────────────────────────────

export const jobDetailSchema = z.object({
  params: z.object({
    queue: z.string().min(1),
    jobId: z.string().min(1),
  }),
});

// ── Retry Job ─────────────────────────────────────────────

export const retryJobSchema = z.object({
  params: z.object({
    queue: z.string().min(1),
    jobId: z.string().min(1),
  }),
});

// ── Cancel Job ────────────────────────────────────────────

export const cancelJobSchema = z.object({
  params: z.object({
    queue: z.string().min(1),
    jobId: z.string().min(1),
  }),
});

// ── System Info ───────────────────────────────────────────

export const systemInfoSchema = z.object({});

// ── DB Stats ──────────────────────────────────────────────

export const dbStatsSchema = z.object({});

// ── Clear Cache ───────────────────────────────────────────

export const clearCacheSchema = z.object({
  body: z.object({
    pattern: z.string().optional().default('*'),
  }),
});

// ── Inferred Types ────────────────────────────────────────

export type QueueStatsQuery = z.infer<typeof queueStatsSchema>['query'];
export type JobDetailParams = z.infer<typeof jobDetailSchema>['params'];
export type RetryJobParams = z.infer<typeof retryJobSchema>['params'];
export type CancelJobParams = z.infer<typeof cancelJobSchema>['params'];
export type ClearCacheInput = z.infer<typeof clearCacheSchema>['body'];
