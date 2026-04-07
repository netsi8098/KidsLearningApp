import { z } from 'zod';
import { paginationSchema, idParamSchema } from '../../lib/validate.js';

// ── Enums ─────────────────────────────────────────────────

const routineTypeEnum = z.enum([
  'morning', 'after_school', 'travel', 'bedtime', 'weekend', 'custom',
]);

// ── Routine Item ──────────────────────────────────────────

const routineItemSchema = z.object({
  title: z.string().min(1).max(200),
  emoji: z.string().max(10).optional(),
  durationMinutes: z.number().int().min(1).max(120).optional(),
  contentId: z.string().optional(),
  order: z.number().int().min(0),
});

// ── List Routines ─────────────────────────────────────────

export const listRoutinesSchema = z.object({
  query: paginationSchema.shape.query.extend({
    householdId: z.string().min(1),
    type: routineTypeEnum.optional(),
    profileId: z.string().optional(),
  }),
});

// ── Get Routine by ID ─────────────────────────────────────

export const getRoutineSchema = idParamSchema;

// ── Create Routine ────────────────────────────────────────

export const createRoutineSchema = z.object({
  body: z.object({
    householdId: z.string().min(1),
    profileId: z.string().optional(),
    name: z.string().min(1).max(200),
    type: routineTypeEnum,
    items: z.array(routineItemSchema).min(1),
    scheduleDays: z.array(z.string()).optional().default([]),
    scheduledTime: z.string().max(10).optional(),
    estimatedMinutes: z.number().int().positive().optional(),
  }),
});

// ── Update Routine ────────────────────────────────────────

export const updateRoutineSchema = z.object({
  params: idParamSchema.shape.params,
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    type: routineTypeEnum.optional(),
    items: z.array(routineItemSchema).min(1).optional(),
    profileId: z.string().nullable().optional(),
    scheduleDays: z.array(z.string()).optional(),
    scheduledTime: z.string().max(10).nullable().optional(),
    estimatedMinutes: z.number().int().positive().nullable().optional(),
  }).refine(obj => Object.keys(obj).length > 0, {
    message: 'At least one field must be provided for update',
  }),
});

// ── Delete Routine ────────────────────────────────────────

export const deleteRoutineSchema = idParamSchema;

// ── Duplicate Routine ─────────────────────────────────────

export const duplicateRoutineSchema = idParamSchema;

// ── List Templates ────────────────────────────────────────

export const listTemplatesSchema = z.object({
  query: z.object({
    type: routineTypeEnum.optional(),
  }).optional().default({}),
});

// ── Create From Template ──────────────────────────────────

export const createFromTemplateSchema = z.object({
  body: z.object({
    templateId: z.string().min(1),
    householdId: z.string().min(1),
    profileId: z.string().optional(),
  }),
});

// ── Type Exports ──────────────────────────────────────────

export type ListRoutinesInput = z.infer<typeof listRoutinesSchema>;
export type CreateRoutineInput = z.infer<typeof createRoutineSchema>;
export type UpdateRoutineInput = z.infer<typeof updateRoutineSchema>;
export type CreateFromTemplateInput = z.infer<typeof createFromTemplateSchema>;
