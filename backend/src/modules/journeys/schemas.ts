import { z } from 'zod';

// ── Enums ─────────────────────────────────────────────────

const triggerTypeEnum = z.enum([
  'signup',
  'trial_start',
  'first_activity',
  'trial_ending',
  'inactivity',
  'seasonal',
]);

const enrollmentStatusEnum = z.enum(['active', 'completed', 'cancelled', 'paused']);

// ── List Journeys ─────────────────────────────────────────

export const listJourneysSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sortBy: z.enum(['name', 'createdAt', 'updatedAt']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    triggerType: triggerTypeEnum.optional(),
    enabled: z.coerce.boolean().optional(),
  }),
});

// ── Get Journey ───────────────────────────────────────────

export const getJourneySchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

// ── Create Journey ────────────────────────────────────────

export const createJourneySchema = z.object({
  body: z.object({
    name: z.string().min(1).max(200),
    description: z.string().max(2000).optional(),
    triggerType: triggerTypeEnum,
    enabled: z.boolean().optional(),
    cooldownHours: z.number().int().min(0).optional(),
  }),
});

// ── Update Journey ────────────────────────────────────────

export const updateJourneySchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().max(2000).optional(),
    triggerType: triggerTypeEnum.optional(),
    enabled: z.boolean().optional(),
    cooldownHours: z.number().int().min(0).optional(),
  }).refine(obj => Object.keys(obj).length > 0, {
    message: 'At least one field must be provided for update',
  }),
});

// ── Add Step ──────────────────────────────────────────────

export const addStepSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    orderIndex: z.number().int().min(0),
    delayHours: z.number().int().min(0).optional(),
    messageTemplate: z.record(z.unknown()),
    conditions: z.record(z.unknown()).optional(),
  }),
});

// ── List Enrollments ──────────────────────────────────────

export const listEnrollmentsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sortBy: z.enum(['enrolledAt', 'lastStepAt', 'completedAt']).default('enrolledAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    journeyId: z.string().optional(),
    status: enrollmentStatusEnum.optional(),
  }),
});

// ── Enroll Household ──────────────────────────────────────

export const enrollHouseholdSchema = z.object({
  body: z.object({
    journeyId: z.string().min(1),
    householdId: z.string().min(1),
    profileId: z.string().min(1).optional(),
  }),
});

// ── Preview Journey ───────────────────────────────────────

export const previewJourneySchema = z.object({
  body: z.object({
    journeyId: z.string().min(1),
    householdId: z.string().min(1),
  }),
});

// ── Inferred Types ────────────────────────────────────────

export type ListJourneysQuery = z.infer<typeof listJourneysSchema>['query'];
export type CreateJourneyInput = z.infer<typeof createJourneySchema>['body'];
export type UpdateJourneyInput = z.infer<typeof updateJourneySchema>['body'];
export type AddStepInput = z.infer<typeof addStepSchema>['body'];
export type ListEnrollmentsQuery = z.infer<typeof listEnrollmentsSchema>['query'];
export type EnrollHouseholdInput = z.infer<typeof enrollHouseholdSchema>['body'];
export type PreviewJourneyInput = z.infer<typeof previewJourneySchema>['body'];
