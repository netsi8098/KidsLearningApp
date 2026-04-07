import { z } from 'zod';
import { paginationSchema, idParamSchema } from '../../lib/validate.js';

// ── Enums ─────────────────────────────────────────────────

export const illustrationStyleEnum = z.enum([
  'flat-vector', 'watercolor', 'cartoon', 'storybook', 'minimal',
]);

const jobStatusEnum = z.enum([
  'pending', 'generating', 'review', 'approved', 'rejected',
]);

// ── List Illustrations ────────────────────────────────────

export const listIllustrationsSchema = z.object({
  query: paginationSchema.shape.query.extend({
    status: jobStatusEnum.optional(),
    style: illustrationStyleEnum.optional(),
    contentId: z.string().uuid().optional(),
  }),
});

// ── Get Illustration ──────────────────────────────────────

export const getIllustrationSchema = idParamSchema;

// ── Create Illustration ───────────────────────────────────

export const createIllustrationSchema = z.object({
  body: z.object({
    contentId: z.string().uuid(),
    prompt: z.string().min(1).max(2000),
    style: illustrationStyleEnum.default('flat-vector'),
    metadata: z.object({
      sceneNumber: z.number().int().positive().optional(),
      sceneDescription: z.string().max(1000).optional(),
      characters: z.array(z.string().max(200)).optional(),
      mood: z.string().max(100).optional(),
      colorPalette: z.array(z.string().max(50)).optional(),
      dimensions: z.object({
        width: z.number().int().positive(),
        height: z.number().int().positive(),
      }).optional(),
    }).optional().default({}),
  }),
});

// ── Generate Illustration ─────────────────────────────────

export const generateIllustrationSchema = idParamSchema;

// ── Update Illustration ───────────────────────────────────

export const updateIllustrationSchema = z.object({
  params: idParamSchema.shape.params,
  body: z.object({
    status: z.enum(['approved', 'rejected']).optional(),
    prompt: z.string().min(1).max(2000).optional(),
    style: illustrationStyleEnum.optional(),
    metadata: z.record(z.unknown()).optional(),
    feedback: z.string().max(2000).optional(),
  }).refine(obj => Object.keys(obj).length > 0, {
    message: 'At least one field must be provided for update',
  }),
});

// ── Regenerate Illustration ───────────────────────────────

export const regenerateIllustrationSchema = z.object({
  params: idParamSchema.shape.params,
  body: z.object({
    promptModification: z.string().max(2000).optional(),
    style: illustrationStyleEnum.optional(),
    feedback: z.string().max(2000).optional(),
  }).optional().default({}),
});

// ── Type Exports ──────────────────────────────────────────

export type ListIllustrationsInput = z.infer<typeof listIllustrationsSchema>;
export type CreateIllustrationInput = z.infer<typeof createIllustrationSchema>;
export type UpdateIllustrationInput = z.infer<typeof updateIllustrationSchema>;
export type RegenerateIllustrationInput = z.infer<typeof regenerateIllustrationSchema>;
