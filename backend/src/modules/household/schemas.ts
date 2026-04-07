import { z } from 'zod';

// ── Shared Enums ──────────────────────────────────────────

export const ageGroupEnum = z.enum([
  'age_2_3', 'age_3_4', 'age_4_5', 'age_5_6', 'all',
]);

export const parentRoleEnum = z.enum(['primary', 'caregiver']);

// ── List Households ───────────────────────────────────────

export const listHouseholdsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().optional(),
    plan: z.string().optional(),
  }),
});

export type ListHouseholdsQuery = z.infer<typeof listHouseholdsSchema>['query'];

// ── Get Household ─────────────────────────────────────────

export const getHouseholdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

// ── Create Household ──────────────────────────────────────

export const createHouseholdSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(100),
    timezone: z.string().default('UTC'),
    locale: z.string().default('en'),
    plan: z.string().default('free'),
  }),
});

export type CreateHouseholdInput = z.infer<typeof createHouseholdSchema>['body'];

// ── Update Household ──────────────────────────────────────

export const updateHouseholdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    timezone: z.string().optional(),
    locale: z.string().optional(),
    plan: z.string().optional(),
  }).refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field must be provided for update' }
  ),
});

export type UpdateHouseholdInput = z.infer<typeof updateHouseholdSchema>['body'];

// ── Create Parent ─────────────────────────────────────────

export const createParentSchema = z.object({
  params: z.object({
    householdId: z.string().uuid(),
  }),
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().min(1, 'Name is required').max(100),
    role: parentRoleEnum.default('primary'),
  }),
});

export type CreateParentInput = z.infer<typeof createParentSchema>['body'];

// ── Update Parent ─────────────────────────────────────────

export const updateParentSchema = z.object({
  params: z.object({
    householdId: z.string().uuid(),
    parentId: z.string().uuid(),
  }),
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    role: parentRoleEnum.optional(),
  }).refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field must be provided for update' }
  ),
});

export type UpdateParentInput = z.infer<typeof updateParentSchema>['body'];

// ── Create Child ──────────────────────────────────────────

export const createChildSchema = z.object({
  params: z.object({
    householdId: z.string().uuid(),
  }),
  body: z.object({
    name: z.string().min(1, 'Name is required').max(50),
    avatarEmoji: z.string().default(''),
    ageGroup: ageGroupEnum.default('age_2_3'),
    interests: z.array(z.string()).optional(),
    bedtimeMode: z.boolean().optional(),
    reducedMotion: z.boolean().optional(),
    largerText: z.boolean().optional(),
    highContrast: z.boolean().optional(),
    soundEnabled: z.boolean().default(true),
    musicEnabled: z.boolean().default(true),
  }),
});

export type CreateChildInput = z.infer<typeof createChildSchema>['body'];

// ── Update Child ──────────────────────────────────────────

export const updateChildSchema = z.object({
  params: z.object({
    householdId: z.string().uuid(),
    childId: z.string().uuid(),
  }),
  body: z.object({
    name: z.string().min(1).max(50).optional(),
    avatarEmoji: z.string().optional(),
    ageGroup: ageGroupEnum.optional(),
    interests: z.array(z.string()).optional(),
    bedtimeMode: z.boolean().optional(),
    reducedMotion: z.boolean().optional(),
    largerText: z.boolean().optional(),
    highContrast: z.boolean().optional(),
    soundEnabled: z.boolean().optional(),
    musicEnabled: z.boolean().optional(),
  }).refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field must be provided for update' }
  ),
});

export type UpdateChildInput = z.infer<typeof updateChildSchema>['body'];

// ── Create Invite ─────────────────────────────────────────

export const createInviteSchema = z.object({
  params: z.object({
    householdId: z.string().uuid(),
  }),
  body: z.object({
    email: z.string().email(),
  }),
});

export type CreateInviteInput = z.infer<typeof createInviteSchema>['body'];

// ── Accept Invite ─────────────────────────────────────────

export const acceptInviteSchema = z.object({
  body: z.object({
    token: z.string(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().min(1, 'Name is required').max(100),
  }),
});

export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>['body'];

// ── Search Households ─────────────────────────────────────

export const searchHouseholdsSchema = z.object({
  query: z.object({
    q: z.string().min(1, 'Search query is required'),
  }),
});

export type SearchHouseholdsQuery = z.infer<typeof searchHouseholdsSchema>['query'];

// ── Sync Child Profile ────────────────────────────────────

export const syncProfileSchema = z.object({
  params: z.object({
    householdId: z.string().uuid(),
    childId: z.string().uuid(),
  }),
  body: z.object({
    totalStars: z.number().int().min(0).optional(),
    streakDays: z.number().int().min(0).optional(),
    interests: z.array(z.string()).optional(),
  }).refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field must be provided for sync' }
  ),
});

export type SyncProfileInput = z.infer<typeof syncProfileSchema>['body'];

// ── Household Support View ────────────────────────────────

export const householdSupportSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});
