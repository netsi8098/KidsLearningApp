import { z } from 'zod';

// ── List Configs ─────────────────────────────────────────

export const listConfigsSchema = z.object({});

// ── Update Config ────────────────────────────────────────

export const updateConfigSchema = z.object({
  params: z.object({
    key: z.string().min(1),
  }),
  body: z.object({
    value: z.unknown(),
    description: z.string().max(500).optional(),
  }),
});

// ── Preview Recommendations ──────────────────────────────

export const previewRecommendationsSchema = z.object({
  params: z.object({
    profileId: z.string().min(1),
  }),
});

// ── Explain Recommendation ───────────────────────────────

export const explainRecommendationSchema = z.object({
  params: z.object({
    contentId: z.string().min(1),
    profileId: z.string().min(1),
  }),
});

// ── Simulate Recommendations ─────────────────────────────

export const simulateRecommendationsSchema = z.object({
  body: z.object({
    profileId: z.string().min(1),
    overrides: z.record(z.string(), z.number()),
  }),
});

// ── Content Diagnostics ──────────────────────────────────

export const contentDiagnosticsSchema = z.object({
  params: z.object({
    contentId: z.string().min(1),
  }),
});

// ── Inferred Types ───────────────────────────────────────

export type UpdateConfigInput = z.infer<typeof updateConfigSchema>['body'];
export type SimulateInput = z.infer<typeof simulateRecommendationsSchema>['body'];
