import { z } from 'zod';

// ── List Jobs ─────────────────────────────────────────────

export const listJobsSchema = z.object({
  query: z.object({
    status: z
      .enum(['idle', 'running', 'completed', 'failed'])
      .optional(),
  }),
});

export type ListJobsQuery = z.infer<typeof listJobsSchema>['query'];

// ── Run Job ───────────────────────────────────────────────

export const runJobSchema = z.object({
  params: z.object({
    jobId: z.string().min(1),
  }),
  body: z.object({
    dryRun: z.boolean().default(true),
    params: z.record(z.unknown()).optional(),
  }),
});

export type RunJobParams = z.infer<typeof runJobSchema>['params'];
export type RunJobBody = z.infer<typeof runJobSchema>['body'];

// ── Job History ───────────────────────────────────────────

export const jobHistorySchema = z.object({
  params: z.object({
    jobId: z.string().min(1),
  }),
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

export type JobHistoryParams = z.infer<typeof jobHistorySchema>['params'];
export type JobHistoryQuery = z.infer<typeof jobHistorySchema>['query'];

// ── Job Detail ────────────────────────────────────────────

export const jobDetailSchema = z.object({
  params: z.object({
    jobId: z.string().min(1),
  }),
});

export type JobDetailParams = z.infer<typeof jobDetailSchema>['params'];
