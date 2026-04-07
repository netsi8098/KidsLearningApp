import { z } from 'zod';

// ── Enums ─────────────────────────────────────────────────

const metricTypeEnum = z.enum([
  'startup', 'navigation', 'media_load', 'animation', 'offline_pack_load',
]);

const groupByEnum = z.enum(['hour', 'day', 'week']);

// ── Ingest Metric Batch ──────────────────────────────────

export const ingestSchema = z.object({
  body: z.object({
    metrics: z.array(z.object({
      metricType: metricTypeEnum,
      value: z.number().min(0),
      deviceInfo: z.record(z.unknown()),
      browser: z.string().optional(),
      locale: z.string().optional(),
      networkType: z.string().optional(),
      profileId: z.string().optional(),
      sessionId: z.string().optional(),
      appVersion: z.string().optional(),
    })).min(1).max(100),
  }),
});

// ── Aggregated Metrics ───────────────────────────────────

export const aggregatedMetricsSchema = z.object({
  query: z.object({
    metricType: metricTypeEnum.optional(),
    from: z.string().optional(),
    to: z.string().optional(),
    groupBy: groupByEnum.default('day'),
  }),
});

// ── Metrics by Type ──────────────────────────────────────

export const metricsByTypeSchema = z.object({
  params: z.object({
    type: metricTypeEnum,
  }),
  query: z.object({
    from: z.string().optional(),
    to: z.string().optional(),
    limit: z.coerce.number().int().min(1).max(1000).default(100),
  }),
});

// ── List Baselines ───────────────────────────────────────

export const listBaselinesSchema = z.object({});

// ── Update Baseline ──────────────────────────────────────

export const updateBaselineSchema = z.object({
  params: z.object({
    type: metricTypeEnum,
  }),
  body: z.object({
    p50: z.number().min(0),
    p75: z.number().min(0),
    p95: z.number().min(0),
    threshold: z.number().min(0),
  }),
});

// ── Detect Regressions ───────────────────────────────────

export const detectRegressionsSchema = z.object({});

// ── Inferred Types ────────────────────────────────────────

export type IngestInput = z.infer<typeof ingestSchema>['body'];
export type AggregatedMetricsQuery = z.infer<typeof aggregatedMetricsSchema>['query'];
export type MetricsByTypeParams = z.infer<typeof metricsByTypeSchema>['params'];
export type MetricsByTypeQuery = z.infer<typeof metricsByTypeSchema>['query'];
export type UpdateBaselineParams = z.infer<typeof updateBaselineSchema>['params'];
export type UpdateBaselineInput = z.infer<typeof updateBaselineSchema>['body'];
