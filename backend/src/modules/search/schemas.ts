import { z } from 'zod';

// ── Enums ─────────────────────────────────────────────────

const contentTypeEnum = z.enum([
  'alphabet', 'number', 'color', 'shape', 'animal', 'bodypart',
  'lesson', 'story', 'video', 'game', 'audio', 'cooking',
  'movement', 'homeactivity', 'explorer', 'lifeskill', 'coloring',
  'emotion', 'quiz', 'collection', 'playlist',
]);

const ageGroupEnum = z.enum(['age_2_3', 'age_3_4', 'age_4_5', 'age_5_6', 'all']);
const difficultyEnum = z.enum(['easy', 'medium', 'hard']);
const energyLevelEnum = z.enum(['calm', 'moderate', 'active']);
const contentStatusEnum = z.enum(['draft', 'review', 'approved', 'scheduled', 'published', 'archived']);

// ── Search ────────────────────────────────────────────────

export const searchSchema = z.object({
  query: z.object({
    q: z.string().min(1).max(200),
    type: contentTypeEnum.optional(),
    ageGroup: ageGroupEnum.optional(),
    tags: z.string().optional(), // comma-separated tag IDs
    difficulty: difficultyEnum.optional(),
    energyLevel: energyLevelEnum.optional(),
    status: contentStatusEnum.optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sortBy: z.enum(['relevance', 'title', 'publishedAt', 'createdAt']).default('relevance'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
});

// ── Suggest (Autocomplete) ────────────────────────────────

export const suggestSchema = z.object({
  query: z.object({
    q: z.string().min(1).max(200),
    limit: z.coerce.number().int().min(1).max(20).default(5),
  }),
});

// ── Facets ────────────────────────────────────────────────

export const facetsSchema = z.object({
  query: z.object({
    q: z.string().optional(),
    type: contentTypeEnum.optional(),
    ageGroup: ageGroupEnum.optional(),
    difficulty: difficultyEnum.optional(),
    status: contentStatusEnum.optional(),
  }),
});

// ── Related Content ───────────────────────────────────────

export const relatedSchema = z.object({
  params: z.object({
    contentId: z.string().min(1),
  }),
  query: z.object({
    limit: z.coerce.number().int().min(1).max(50).default(10),
  }),
});

// ── Trending ──────────────────────────────────────────────

export const trendingSchema = z.object({
  query: z.object({
    days: z.coerce.number().int().min(1).max(90).default(7),
    limit: z.coerce.number().int().min(1).max(50).default(10),
  }),
});

// ── Recent ────────────────────────────────────────────────

export const recentSchema = z.object({
  query: z.object({
    limit: z.coerce.number().int().min(1).max(50).default(10),
  }),
});

// ── Inferred Types ────────────────────────────────────────

export type SearchQuery = z.infer<typeof searchSchema>['query'];
export type SuggestQuery = z.infer<typeof suggestSchema>['query'];
export type FacetsQuery = z.infer<typeof facetsSchema>['query'];
export type RelatedParams = z.infer<typeof relatedSchema>['params'];
export type RelatedQuery = z.infer<typeof relatedSchema>['query'];
export type TrendingQuery = z.infer<typeof trendingSchema>['query'];
export type RecentQuery = z.infer<typeof recentSchema>['query'];
