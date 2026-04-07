import { z } from 'zod';
import { paginationSchema, idParamSchema } from '../../lib/validate.js';

// ── Enums ─────────────────────────────────────────────────

const contentTypeEnum = z.enum([
  'alphabet', 'number', 'color', 'shape', 'animal', 'bodypart',
  'lesson', 'story', 'video', 'game', 'audio', 'cooking',
  'movement', 'homeactivity', 'explorer', 'lifeskill', 'coloring',
  'emotion', 'quiz', 'collection', 'playlist',
]);

const ageGroupEnum = z.enum(['age_2_3', 'age_3_4', 'age_4_5', 'age_5_6', 'all']);

const briefStatusEnum = z.enum(['draft', 'generating', 'generated', 'accepted', 'rejected']);

// ── List Briefs ───────────────────────────────────────────

export const listBriefsSchema = z.object({
  query: paginationSchema.shape.query.extend({
    status: briefStatusEnum.optional(),
    type: contentTypeEnum.optional(),
    ageGroup: ageGroupEnum.optional(),
  }),
});

// ── Get Brief by ID ───────────────────────────────────────

export const getBriefSchema = idParamSchema;

// ── Create Brief ──────────────────────────────────────────

export const createBriefSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200),
    type: contentTypeEnum,
    ageGroup: ageGroupEnum,
    description: z.string().min(1).max(2000),
    objectives: z.array(z.string().min(1).max(500)).min(1).max(10),
    constraints: z.object({
      maxWords: z.number().int().positive().optional(),
      tone: z.string().max(100).optional(),
      avoidTopics: z.array(z.string().max(200)).optional(),
      requiredElements: z.array(z.string().max(200)).optional(),
      readingLevel: z.string().max(50).optional(),
    }).optional().default({}),
  }),
});

// ── Update Brief ──────────────────────────────────────────

export const updateBriefSchema = z.object({
  params: idParamSchema.shape.params,
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    type: contentTypeEnum.optional(),
    ageGroup: ageGroupEnum.optional(),
    description: z.string().min(1).max(2000).optional(),
    objectives: z.array(z.string().min(1).max(500)).min(1).max(10).optional(),
    constraints: z.object({
      maxWords: z.number().int().positive().optional(),
      tone: z.string().max(100).optional(),
      avoidTopics: z.array(z.string().max(200)).optional(),
      requiredElements: z.array(z.string().max(200)).optional(),
      readingLevel: z.string().max(50).optional(),
    }).optional(),
  }).refine(obj => Object.keys(obj).length > 0, {
    message: 'At least one field must be provided for update',
  }),
});

// ── Generate / Accept / Reject ────────────────────────────

export const generateBriefSchema = idParamSchema;

export const acceptBriefSchema = z.object({
  params: idParamSchema.shape.params,
  body: z.object({
    slug: z.string().min(1).max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: 'Slug must be lowercase alphanumeric with hyphens',
    }),
    tagIds: z.array(z.string().uuid()).optional().default([]),
  }),
});

export const rejectBriefSchema = z.object({
  params: idParamSchema.shape.params,
  body: z.object({
    reason: z.string().min(1).max(1000).optional(),
    regenerate: z.boolean().optional().default(false),
  }).optional().default({}),
});

// ── Type Exports ──────────────────────────────────────────

export type ListBriefsInput = z.infer<typeof listBriefsSchema>;
export type CreateBriefInput = z.infer<typeof createBriefSchema>;
export type UpdateBriefInput = z.infer<typeof updateBriefSchema>;
export type AcceptBriefInput = z.infer<typeof acceptBriefSchema>;
export type RejectBriefInput = z.infer<typeof rejectBriefSchema>;
