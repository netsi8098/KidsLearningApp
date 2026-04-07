import { z } from 'zod';
import { paginationSchema, idParamSchema, slugParamSchema } from '../../lib/validate.js';

// ── Enums ─────────────────────────────────────────────────

export const tipCategoryEnum = z.enum([
  'expert_tips', 'routines', 'play_ideas', 'bedtime', 'education', 'product_updates',
]);

export const tipFormatEnum = z.enum([
  'article', 'quick_tip', 'checklist', 'guide', 'faq',
]);

export const ageGroupEnum = z.enum([
  'age_2_3', 'age_3_4', 'age_4_5', 'age_5_6', 'all',
]);

// ── List Tips (paginated, filterable) ─────────────────────

export const listTipsSchema = z.object({
  query: paginationSchema.shape.query.extend({
    category: tipCategoryEnum.optional(),
    ageGroup: ageGroupEnum.optional(),
    format: tipFormatEnum.optional(),
    published: z.coerce.boolean().optional(),
  }),
});

export type ListTipsQuery = z.infer<typeof listTipsSchema>['query'];

// ── Get Tip by Slug ───────────────────────────────────────

export const getTipBySlugSchema = slugParamSchema;

// ── Create Tip ────────────────────────────────────────────

export const createTipSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(300),
    slug: z.string()
      .min(1)
      .max(200)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens'),
    body: z.string().min(1).max(50000),
    category: tipCategoryEnum,
    format: tipFormatEnum,
    ageGroup: ageGroupEnum.default('all'),
    tags: z.array(z.string()).max(20).default([]),
    published: z.boolean().default(false),
  }),
});

export type CreateTipInput = z.infer<typeof createTipSchema>['body'];

// ── Update Tip ────────────────────────────────────────────

export const updateTipSchema = z.object({
  params: idParamSchema.shape.params,
  body: z.object({
    title: z.string().min(1).max(300).optional(),
    slug: z.string()
      .min(1)
      .max(200)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens')
      .optional(),
    body: z.string().min(1).max(50000).optional(),
    category: tipCategoryEnum.optional(),
    format: tipFormatEnum.optional(),
    ageGroup: ageGroupEnum.optional(),
    tags: z.array(z.string()).max(20).optional(),
    published: z.boolean().optional(),
  }).refine(obj => Object.keys(obj).length > 0, {
    message: 'At least one field must be provided for update',
  }),
});

export type UpdateTipInput = z.infer<typeof updateTipSchema>['body'];

// ── Delete Tip ────────────────────────────────────────────

export const deleteTipSchema = idParamSchema;

// ── Save/Unsave Tip ───────────────────────────────────────

export const saveTipSchema = idParamSchema;

// ── Type Exports ──────────────────────────────────────────

export type ListTipsInput = z.infer<typeof listTipsSchema>;
export type CreateTipSchemaInput = z.infer<typeof createTipSchema>;
export type UpdateTipSchemaInput = z.infer<typeof updateTipSchema>;
