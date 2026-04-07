import { z } from 'zod';

// ── Shared Enums ──────────────────────────────────────────

export const subscriptionPlanEnum = z.enum([
  'free', 'trial', 'premium_monthly', 'premium_annual',
  'family_monthly', 'family_annual', 'promo',
]);

export const subStatusEnum = z.enum([
  'active', 'trialing', 'past_due', 'cancelled', 'expired', 'paused',
]);

export const invoiceStatusEnum = z.enum([
  'draft', 'open', 'paid', 'void_status', 'uncollectible',
]);

export const discountTypeEnum = z.enum(['percent', 'fixed']);

// ── List Subscriptions (admin, paginated) ────────────────

export const listSubscriptionsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sortBy: z.enum(['createdAt', 'updatedAt', 'currentPeriodEnd']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    status: subStatusEnum.optional(),
    plan: subscriptionPlanEnum.optional(),
    householdId: z.string().uuid().optional(),
  }),
});

export type ListSubscriptionsQuery = z.infer<typeof listSubscriptionsSchema>['query'];

// ── Get Subscription ─────────────────────────────────────

export const getSubscriptionSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

// ── Create Subscription (admin) ──────────────────────────

export const createSubscriptionSchema = z.object({
  body: z.object({
    householdId: z.string().uuid(),
    plan: subscriptionPlanEnum,
    status: subStatusEnum.default('active'),
    currentPeriodStart: z.string().datetime().optional(),
    currentPeriodEnd: z.string().datetime(),
    trialEndsAt: z.string().datetime().optional(),
    externalId: z.string().max(500).optional(),
    provider: z.string().max(100).default('manual'),
    metadata: z.record(z.unknown()).default({}),
  }),
});

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>['body'];

// ── Update Subscription ──────────────────────────────────

export const updateSubscriptionSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    plan: subscriptionPlanEnum.optional(),
    status: subStatusEnum.optional(),
    currentPeriodStart: z.string().datetime().optional(),
    currentPeriodEnd: z.string().datetime().optional(),
    trialEndsAt: z.string().datetime().nullable().optional(),
    cancelledAt: z.string().datetime().nullable().optional(),
    pausedAt: z.string().datetime().nullable().optional(),
    externalId: z.string().max(500).nullable().optional(),
    provider: z.string().max(100).optional(),
    metadata: z.record(z.unknown()).optional(),
  }).refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field must be provided for update' }
  ),
});

export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionSchema>['body'];

// ── Checkout (parent-facing) ─────────────────────────────

export const checkoutSchema = z.object({
  body: z.object({
    householdId: z.string().uuid(),
    plan: subscriptionPlanEnum,
    paymentMethodId: z.string().uuid().optional(),
    promoCode: z.string().max(100).optional(),
  }),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>['body'];

// ── Cancel / Pause / Resume ──────────────────────────────

export const cancelSubscriptionSchema = z.object({
  body: z.object({
    subscriptionId: z.string().uuid(),
    reason: z.string().max(1000).optional(),
    immediate: z.boolean().default(false),
  }),
});

export type CancelSubscriptionInput = z.infer<typeof cancelSubscriptionSchema>['body'];

export const pauseSubscriptionSchema = z.object({
  body: z.object({
    subscriptionId: z.string().uuid(),
    resumeAt: z.string().datetime().optional(),
  }),
});

export type PauseSubscriptionInput = z.infer<typeof pauseSubscriptionSchema>['body'];

export const resumeSubscriptionSchema = z.object({
  body: z.object({
    subscriptionId: z.string().uuid(),
  }),
});

export type ResumeSubscriptionInput = z.infer<typeof resumeSubscriptionSchema>['body'];

// ── Webhook ──────────────────────────────────────────────

export const webhookSchema = z.object({
  body: z.object({
    event: z.string().min(1),
    provider: z.string().min(1),
    externalId: z.string().min(1),
    payload: z.record(z.unknown()).default({}),
  }),
});

export type WebhookInput = z.infer<typeof webhookSchema>['body'];

// ── Entitlements ─────────────────────────────────────────

export const listEntitlementsSchema = z.object({
  params: z.object({
    householdId: z.string().uuid(),
  }),
});

// ── Promo Codes ──────────────────────────────────────────

export const redeemPromoSchema = z.object({
  body: z.object({
    code: z.string().min(1).max(100),
    householdId: z.string().uuid(),
  }),
});

export type RedeemPromoInput = z.infer<typeof redeemPromoSchema>['body'];

export const listPromosSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sortBy: z.enum(['createdAt', 'validFrom', 'validUntil', 'timesRedeemed']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
});

export type ListPromosQuery = z.infer<typeof listPromosSchema>['query'];

export const createPromoSchema = z.object({
  body: z.object({
    code: z.string().min(1).max(100)
      .regex(/^[A-Z0-9_-]+$/, 'Code must be uppercase alphanumeric with hyphens/underscores'),
    description: z.string().max(500).optional(),
    discountType: discountTypeEnum,
    discountValue: z.number().int().min(1),
    maxRedemptions: z.number().int().min(1).optional(),
    validFrom: z.string().datetime(),
    validUntil: z.string().datetime().optional(),
    planFilter: z.array(subscriptionPlanEnum).optional(),
  }),
});

export type CreatePromoInput = z.infer<typeof createPromoSchema>['body'];
