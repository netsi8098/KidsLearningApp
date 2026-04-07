import { z } from 'zod';
import { paginationSchema } from '../../lib/validate.js';

// ── Enums ─────────────────────────────────────────────────

const pipelineStepEnum = z.enum([
  'outline', 'draft', 'review', 'illustration', 'voiceover', 'assembly',
]);

const stepStatusEnum = z.enum([
  'pending', 'in_progress', 'completed', 'failed', 'skipped',
]);

// ── Content ID Param ──────────────────────────────────────

export const contentIdParamSchema = z.object({
  params: z.object({
    contentId: z.string().min(1),
  }),
});

// ── Content ID + Step ID Params ───────────────────────────

export const stepParamsSchema = z.object({
  params: z.object({
    contentId: z.string().min(1),
    stepId: z.string().min(1),
  }),
});

// ── Start Pipeline ────────────────────────────────────────

export const startPipelineSchema = contentIdParamSchema;

// ── Update Step ───────────────────────────────────────────

export const updateStepSchema = z.object({
  params: z.object({
    contentId: z.string().min(1),
    stepId: z.string().min(1),
  }),
  body: z.object({
    data: z.record(z.unknown()).optional(),
    status: stepStatusEnum.optional(),
  }).refine(obj => obj.data !== undefined || obj.status !== undefined, {
    message: 'At least one of "data" or "status" must be provided',
  }),
});

// ── Advance Step ──────────────────────────────────────────

export const advanceStepSchema = stepParamsSchema;

// ── Generate Outline ──────────────────────────────────────

export const generateOutlineSchema = z.object({
  params: z.object({
    contentId: z.string().min(1),
  }),
  body: z.object({
    targetAgeGroup: z.string().optional(),
    theme: z.string().max(200).optional(),
    moral: z.string().max(500).optional(),
    characterCount: z.number().int().min(1).max(10).optional(),
    sceneCount: z.number().int().min(2).max(20).optional(),
  }).optional().default({}),
});

// ── Generate Draft ────────────────────────────────────────

export const generateDraftSchema = z.object({
  params: z.object({
    contentId: z.string().min(1),
  }),
  body: z.object({
    maxWords: z.number().int().min(50).max(5000).optional(),
    tone: z.string().max(100).optional(),
    includeDialogue: z.boolean().optional().default(true),
  }).optional().default({}),
});

// ── Active Pipelines ──────────────────────────────────────

export const activePipelinesSchema = z.object({
  query: paginationSchema.shape.query.extend({
    step: pipelineStepEnum.optional(),
  }),
});

// ── Type Exports ──────────────────────────────────────────

export type UpdateStepInput = z.infer<typeof updateStepSchema>;
export type GenerateOutlineInput = z.infer<typeof generateOutlineSchema>;
export type GenerateDraftInput = z.infer<typeof generateDraftSchema>;
export type ActivePipelinesInput = z.infer<typeof activePipelinesSchema>;
