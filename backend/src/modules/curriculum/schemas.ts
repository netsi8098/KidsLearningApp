import { z } from 'zod';

// ── Shared Enums ──────────────────────────────────────────

const ageGroupEnum = z.enum(['2-3', '3-4', '4-5', '5-6', 'all']);
const difficultyEnum = z.enum(['easy', 'medium', 'hard']);
const contentTypeEnum = z.enum([
  'alphabet', 'number', 'color', 'shape', 'animal', 'bodypart',
  'lesson', 'story', 'video', 'game', 'audio', 'cooking',
  'movement', 'homeactivity', 'explorer', 'lifeskill', 'coloring',
  'emotion', 'quiz', 'collection', 'playlist',
]);

// ── Curriculum Schemas ────────────────────────────────────

export const createCurriculumSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(120),
    description: z.string().min(1).max(2000),
    ageGroup: ageGroupEnum,
    difficulty: difficultyEnum.optional(),
    emoji: z.string().min(1).max(10).optional(),
    tags: z.array(z.string()).optional(),
    coverImageUrl: z.string().url().optional(),
  }),
});

export const updateCurriculumSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    title: z.string().min(3).max(120).optional(),
    description: z.string().min(1).max(2000).optional(),
    ageGroup: ageGroupEnum.optional(),
    difficulty: difficultyEnum.optional(),
    emoji: z.string().min(1).max(10).optional(),
    tags: z.array(z.string()).optional(),
    coverImageUrl: z.string().url().optional(),
  }),
});

export const listCurriculaSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sortBy: z.enum(['title', 'createdAt', 'updatedAt', 'totalDuration']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    ageGroup: ageGroupEnum.optional(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
    search: z.string().optional(),
  }),
});

export const getCurriculumSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

// ── Unit Schemas ──────────────────────────────────────────

export const createUnitSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    title: z.string().min(1).max(120),
    description: z.string().max(2000).optional(),
    emoji: z.string().min(1).max(10).optional(),
    sortOrder: z.number().int().min(0).optional(),
  }),
});

export const updateUnitSchema = z.object({
  params: z.object({
    id: z.string().min(1),
    unitId: z.string().min(1),
  }),
  body: z.object({
    title: z.string().min(1).max(120).optional(),
    description: z.string().max(2000).optional(),
    emoji: z.string().min(1).max(10).optional(),
    sortOrder: z.number().int().min(0).optional(),
  }),
});

export const deleteUnitSchema = z.object({
  params: z.object({
    id: z.string().min(1),
    unitId: z.string().min(1),
  }),
});

// ── Unit Item Schemas ─────────────────────────────────────

export const addItemSchema = z.object({
  params: z.object({
    id: z.string().min(1),
    unitId: z.string().min(1),
  }),
  body: z.object({
    contentId: z.string().min(1),
    contentType: contentTypeEnum,
    sortOrder: z.number().int().min(0).optional(),
    isRequired: z.boolean().default(true),
    unlockAfterPrevious: z.boolean().default(false),
  }),
});

export const removeItemSchema = z.object({
  params: z.object({
    id: z.string().min(1),
    unitId: z.string().min(1),
    itemId: z.string().min(1),
  }),
});

// ── Compile / Publish Schemas ─────────────────────────────

export const compileCurriculumSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const publishCurriculumSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

// ── Inferred Types ────────────────────────────────────────

export type CreateCurriculumInput = z.infer<typeof createCurriculumSchema>['body'];
export type UpdateCurriculumInput = z.infer<typeof updateCurriculumSchema>['body'];
export type ListCurriculaQuery = z.infer<typeof listCurriculaSchema>['query'];
export type CreateUnitInput = z.infer<typeof createUnitSchema>['body'];
export type UpdateUnitInput = z.infer<typeof updateUnitSchema>['body'];
export type AddItemInput = z.infer<typeof addItemSchema>['body'];
