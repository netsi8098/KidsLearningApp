import { z } from 'zod';

// ── Enums ─────────────────────────────────────────────────

const metricEnum = z.enum(['views', 'completions', 'avgTimeMs', 'stars', 'favorites', 'shares']);
const periodEnum = z.enum(['daily', 'weekly', 'monthly']);

const contentTypeEnum = z.enum([
  'alphabet', 'number', 'color', 'shape', 'animal', 'bodypart',
  'lesson', 'story', 'video', 'game', 'audio', 'cooking',
  'movement', 'homeactivity', 'explorer', 'lifeskill', 'coloring',
  'emotion', 'quiz', 'collection', 'playlist',
]);

// ── Record Event ──────────────────────────────────────────

export const recordEventSchema = z.object({
  body: z.object({
    contentId: z.string().min(1),
    metric: z.enum(['view', 'completion', 'star', 'favorite', 'share']),
    value: z.number().int().min(0).default(1),
    timeMs: z.number().int().min(0).optional(),
  }),
});

// ── Content Analytics ─────────────────────────────────────

export const contentAnalyticsSchema = z.object({
  params: z.object({
    contentId: z.string().min(1),
  }),
  query: z.object({
    period: periodEnum.default('daily'),
    from: z.string().optional(),
    to: z.string().optional(),
  }),
});

// ── Dashboard ─────────────────────────────────────────────

export const dashboardSchema = z.object({
  query: z.object({
    from: z.string().optional(),
    to: z.string().optional(),
    period: periodEnum.default('daily'),
  }),
});

// ── Top Content ───────────────────────────────────────────

export const topContentSchema = z.object({
  query: z.object({
    metric: metricEnum.default('views'),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    period: periodEnum.default('daily'),
    from: z.string().optional(),
    to: z.string().optional(),
  }),
});

// ── Engagement ────────────────────────────────────────────

export const engagementSchema = z.object({
  query: z.object({
    period: periodEnum.default('daily'),
    from: z.string().optional(),
    to: z.string().optional(),
  }),
});

// ── Aggregate (Admin) ─────────────────────────────────────

export const aggregateSchema = z.object({
  body: z.object({
    period: periodEnum.optional(),
  }).optional().default({}),
});

// ── Export CSV ─────────────────────────────────────────────

export const exportSchema = z.object({
  query: z.object({
    from: z.string().optional(),
    to: z.string().optional(),
    period: periodEnum.default('daily'),
    contentType: contentTypeEnum.optional(),
    metric: metricEnum.optional(),
  }),
});

// ── SLA Dashboard ────────────────────────────────────────

export const slaDashboardSchema = z.object({
  query: z.object({
    from: z.string().optional(),
    to: z.string().optional(),
  }),
});

export const slaPipelineFunnelSchema = z.object({
  query: z.object({
    from: z.string().optional(),
    to: z.string().optional(),
  }),
});

export const slaBottlenecksSchema = z.object({
  query: z.object({
    limit: z.coerce.number().int().min(1).max(50).default(10),
  }),
});

export const slaAgingSchema = z.object({
  query: z.object({
    stage: z.enum(['draft', 'review', 'approval', 'publish', 'translation', 'asset', 'voice']).optional(),
    daysThreshold: z.coerce.number().int().min(1).default(7),
  }),
});

// ── Inferred Types ────────────────────────────────────────

export type RecordEventInput = z.infer<typeof recordEventSchema>['body'];
export type ContentAnalyticsParams = z.infer<typeof contentAnalyticsSchema>['params'];
export type ContentAnalyticsQuery = z.infer<typeof contentAnalyticsSchema>['query'];
export type DashboardQuery = z.infer<typeof dashboardSchema>['query'];
export type TopContentQuery = z.infer<typeof topContentSchema>['query'];
export type EngagementQuery = z.infer<typeof engagementSchema>['query'];
export type AggregateInput = z.infer<typeof aggregateSchema>['body'];
export type ExportQuery = z.infer<typeof exportSchema>['query'];
export type SLADashboardQuery = z.infer<typeof slaDashboardSchema>['query'];
export type SLAPipelineFunnelQuery = z.infer<typeof slaPipelineFunnelSchema>['query'];
export type SLABottlenecksQuery = z.infer<typeof slaBottlenecksSchema>['query'];
export type SLAAgingQuery = z.infer<typeof slaAgingSchema>['query'];
