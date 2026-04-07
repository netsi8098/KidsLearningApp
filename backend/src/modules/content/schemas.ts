import { z } from 'zod';

// ── Shared Enums ──────────────────────────────────────────

export const contentTypeEnum = z.enum([
  'alphabet', 'number', 'color', 'shape', 'animal', 'bodypart',
  'lesson', 'story', 'video', 'game', 'audio', 'cooking',
  'movement', 'homeactivity', 'explorer', 'lifeskill', 'coloring',
  'emotion', 'quiz', 'collection', 'playlist',
]);

export const contentStatusEnum = z.enum([
  'draft', 'review', 'approved', 'scheduled', 'published', 'archived',
]);

export const accessTierEnum = z.enum(['free', 'premium']);

export const ageGroupEnum = z.enum([
  'age_2_3', 'age_3_4', 'age_4_5', 'age_5_6', 'all',
]);

export const difficultyEnum = z.enum(['easy', 'medium', 'hard']);

export const energyLevelEnum = z.enum(['calm', 'moderate', 'active']);

// ── List / Filter Schema ──────────────────────────────────

export const listContentSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sortBy: z.enum(['createdAt', 'updatedAt', 'title', 'publishedAt', 'version']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    type: contentTypeEnum.optional(),
    status: contentStatusEnum.optional(),
    ageGroup: ageGroupEnum.optional(),
    accessTier: accessTierEnum.optional(),
    difficulty: difficultyEnum.optional(),
    energyLevel: energyLevelEnum.optional(),
    search: z.string().optional(),
    authorId: z.string().uuid().optional(),
  }),
});

export type ListContentQuery = z.infer<typeof listContentSchema>['query'];

// ── Get Single Content ────────────────────────────────────

export const getContentSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

// ── Create Content ────────────────────────────────────────

export const createContentSchema = z.object({
  body: z.object({
    slug: z.string()
      .min(1)
      .max(200)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens'),
    type: contentTypeEnum,
    title: z.string().min(1).max(300),
    emoji: z.string().max(10).default(''),
    description: z.string().max(2000).default(''),
    body: z.record(z.unknown()).default({}),
    accessTier: accessTierEnum.default('free'),
    ageGroup: ageGroupEnum.default('all'),
    difficulty: difficultyEnum.optional(),
    energyLevel: energyLevelEnum.optional(),
    durationMinutes: z.number().int().min(0).max(180).optional(),
    route: z.string().max(500).optional(),
    scheduledAt: z.string().datetime().optional(),
    mood: z.string().max(50).optional(),
    bedtimeFriendly: z.boolean().default(false),
    language: z.string().max(10).default('en'),
    skills: z.array(z.object({
      skillId: z.string().uuid(),
      relevance: z.number().min(0).max(1).default(1.0),
    })).optional(),
  }),
});

export type CreateContentInput = z.infer<typeof createContentSchema>['body'];

// ── Update Content ────────────────────────────────────────

export const updateContentSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    slug: z.string()
      .min(1)
      .max(200)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens')
      .optional(),
    title: z.string().min(1).max(300).optional(),
    emoji: z.string().max(10).optional(),
    description: z.string().max(2000).optional(),
    body: z.record(z.unknown()).optional(),
    status: contentStatusEnum.optional(),
    accessTier: accessTierEnum.optional(),
    ageGroup: ageGroupEnum.optional(),
    difficulty: difficultyEnum.nullable().optional(),
    energyLevel: energyLevelEnum.nullable().optional(),
    durationMinutes: z.number().int().min(0).max(180).nullable().optional(),
    route: z.string().max(500).nullable().optional(),
    scheduledAt: z.string().datetime().nullable().optional(),
    mood: z.string().max(50).nullable().optional(),
    bedtimeFriendly: z.boolean().optional(),
    language: z.string().max(10).optional(),
    skills: z.array(z.object({
      skillId: z.string().uuid(),
      relevance: z.number().min(0).max(1).default(1.0),
    })).optional(),
  }).refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field must be provided for update' }
  ),
});

export type UpdateContentInput = z.infer<typeof updateContentSchema>['body'];

// ── Delete Content ────────────────────────────────────────

export const deleteContentSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

// ── Tags ──────────────────────────────────────────────────

export const addTagsSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    tagIds: z.array(z.string().uuid()).min(1).max(20),
  }),
});

export const removeTagSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
    tagId: z.string().uuid(),
  }),
});

// ── History ───────────────────────────────────────────────

export const historySchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
  }),
});

// ── Duplicate ─────────────────────────────────────────────

export const duplicateContentSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    newSlug: z.string()
      .min(1)
      .max(200)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens')
      .optional(),
    newTitle: z.string().min(1).max(300).optional(),
  }).optional().default({}),
});

export type DuplicateContentInput = z.infer<typeof duplicateContentSchema>['body'];

// ── Skills ──────────────────────────────────────────────

export const addSkillsSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    skills: z.array(z.object({
      skillId: z.string().uuid(),
      relevance: z.number().min(0).max(1).default(1.0),
    })).min(1).max(20),
  }),
});

export const removeSkillSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
    skillId: z.string().uuid(),
  }),
});

export const listSkillsSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

// ── Lifecycle ──────────────────────────────────────────

export const updateLifecycleSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    freshnessScore: z.number().min(0).max(1).optional(),
    evergreenScore: z.number().min(0).max(1).optional(),
    seasonalRelevance: z.record(z.unknown()).optional(),
    needsRefresh: z.boolean().optional(),
    nextReviewDate: z.string().datetime().nullable().optional(),
  }).refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one lifecycle field must be provided' }
  ),
});

export type UpdateLifecycleInput = z.infer<typeof updateLifecycleSchema>['body'];

export const refreshQueueSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

export const lifecycleStatsSchema = z.object({});

// ── Pipeline Events ────────────────────────────────────

export const pipelineEventsSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const recordPipelineEventSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    stage: z.enum(['draft', 'review', 'approval', 'publish', 'translation', 'asset', 'voice']),
    action: z.enum(['entered', 'exited']),
  }),
});

// ── Policy Checks ──────────────────────────────────────

export const checkPoliciesSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const policyResultsSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});
