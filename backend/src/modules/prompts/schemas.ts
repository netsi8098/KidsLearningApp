import { z } from 'zod';
import { paginationSchema, idParamSchema } from '../../lib/validate.js';

// ── Enums ─────────────────────────────────────────────────

const promptCategoryEnum = z.enum([
  'story', 'illustration', 'brief', 'voice', 'qa',
]);

// ── List Prompts ──────────────────────────────────────────

export const listPromptsSchema = z.object({
  query: paginationSchema.shape.query.extend({
    category: promptCategoryEnum.optional(),
    isActive: z.coerce.boolean().optional(),
    search: z.string().max(200).optional(),
  }),
});

// ── Get Prompt ────────────────────────────────────────────

export const getPromptSchema = idParamSchema;

// ── Create Prompt ─────────────────────────────────────────

export const createPromptSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(200).regex(/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/, {
      message: 'Name must be lowercase alphanumeric with hyphens or underscores',
    }),
    category: promptCategoryEnum,
    template: z.string().min(1).max(50000),
    variables: z.array(
      z.object({
        name: z.string().min(1).max(100),
        description: z.string().max(500).optional(),
        required: z.boolean().default(true),
        defaultValue: z.string().max(1000).optional(),
      })
    ).default([]),
    description: z.string().max(2000).optional(),
    isActive: z.boolean().default(true),
  }),
});

// ── Update Prompt (creates new version) ───────────────────

export const updatePromptSchema = z.object({
  params: idParamSchema.shape.params,
  body: z.object({
    template: z.string().min(1).max(50000).optional(),
    variables: z.array(
      z.object({
        name: z.string().min(1).max(100),
        description: z.string().max(500).optional(),
        required: z.boolean().default(true),
        defaultValue: z.string().max(1000).optional(),
      })
    ).optional(),
    description: z.string().max(2000).optional(),
    isActive: z.boolean().optional(),
    category: promptCategoryEnum.optional(),
  }).refine(obj => Object.keys(obj).length > 0, {
    message: 'At least one field must be provided for update',
  }),
});

// ── Render Prompt ─────────────────────────────────────────

export const renderPromptSchema = z.object({
  params: idParamSchema.shape.params,
  body: z.object({
    variables: z.record(z.string()),
  }),
});

// ── Usage History ─────────────────────────────────────────

export const usageSchema = z.object({
  params: idParamSchema.shape.params,
  query: paginationSchema.shape.query,
});

// ── Test Render ───────────────────────────────────────────

export const testRenderSchema = z.object({
  params: idParamSchema.shape.params,
  body: z.object({
    variables: z.record(z.string()),
  }),
});

// ── Type Exports ──────────────────────────────────────────

export type ListPromptsInput = z.infer<typeof listPromptsSchema>;
export type CreatePromptInput = z.infer<typeof createPromptSchema>;
export type UpdatePromptInput = z.infer<typeof updatePromptSchema>;
export type RenderPromptInput = z.infer<typeof renderPromptSchema>;
export type UsageInput = z.infer<typeof usageSchema>;
export type TestRenderInput = z.infer<typeof testRenderSchema>;
