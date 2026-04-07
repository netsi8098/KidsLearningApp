// ── Subscription & Entitlement Fixtures ────────────────────
// Deterministic test data for Subscription, Entitlement, and
// PromoCode models matching the Prisma schema.

// ── Fixed reference dates ──────────────────────────────────

const FIXED_CREATED = new Date('2026-01-01T00:00:00.000Z');
const FIXED_UPDATED = new Date('2026-01-15T00:00:00.000Z');
const PERIOD_START = new Date('2026-03-01T00:00:00.000Z');
const PERIOD_END_MONTHLY = new Date('2026-04-01T00:00:00.000Z');
const PERIOD_END_ANNUAL = new Date('2027-03-01T00:00:00.000Z');
const TRIAL_END = new Date('2026-03-15T00:00:00.000Z');
const TRIAL_EXPIRED = new Date('2026-02-01T00:00:00.000Z');
const CANCELLED_AT = new Date('2026-02-20T00:00:00.000Z');
const PAUSED_AT = new Date('2026-02-25T00:00:00.000Z');
const PROMO_VALID_FROM = new Date('2026-01-01T00:00:00.000Z');
const PROMO_VALID_UNTIL = new Date('2026-12-31T23:59:59.000Z');

// ── Subscription fixture type ──────────────────────────────

export interface SubscriptionFixture {
  id: string;
  householdId: string;
  plan: string;
  status: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  trialEndsAt: Date | null;
  cancelledAt: Date | null;
  pausedAt: Date | null;
  externalId: string | null;
  provider: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// ── Entitlement fixture type ───────────────────────────────

export interface EntitlementFixture {
  id: string;
  householdId: string;
  feature: string;
  granted: boolean;
  source: string;
  expiresAt: Date | null;
  createdAt: Date;
}

// ── PromoCode fixture type ─────────────────────────────────

export interface PromoCodeFixture {
  id: string;
  code: string;
  description: string | null;
  discountType: string;
  discountValue: number;
  maxRedemptions: number | null;
  timesRedeemed: number;
  validFrom: Date;
  validUntil: Date | null;
  planFilter: string[] | null;
  createdBy: string | null;
  createdAt: Date;
}

// ── Counters ───────────────────────────────────────────────

let subCounter = 0;
let entitlementCounter = 0;
let promoCounter = 0;

// ── Factories ──────────────────────────────────────────────

export function createSubscriptionFixture(
  overrides: Partial<SubscriptionFixture> = {}
): SubscriptionFixture {
  subCounter++;
  const idx = String(subCounter).padStart(3, '0');

  return {
    id: `sub-${idx}`,
    householdId: `household-${idx}`,
    plan: 'free',
    status: 'active',
    currentPeriodStart: PERIOD_START,
    currentPeriodEnd: PERIOD_END_MONTHLY,
    trialEndsAt: null,
    cancelledAt: null,
    pausedAt: null,
    externalId: null,
    provider: 'manual',
    metadata: {},
    createdAt: FIXED_CREATED,
    updatedAt: FIXED_UPDATED,
    ...overrides,
  };
}

export function createEntitlementFixture(
  overrides: Partial<EntitlementFixture> = {}
): EntitlementFixture {
  entitlementCounter++;
  const idx = String(entitlementCounter).padStart(3, '0');

  return {
    id: `entitlement-${idx}`,
    householdId: `household-${idx}`,
    feature: 'premium_content',
    granted: true,
    source: 'subscription',
    expiresAt: null,
    createdAt: FIXED_CREATED,
    ...overrides,
  };
}

export function createPromoCodeFixture(
  overrides: Partial<PromoCodeFixture> = {}
): PromoCodeFixture {
  promoCounter++;
  const idx = String(promoCounter).padStart(3, '0');

  return {
    id: `promo-${idx}`,
    code: `PROMO${idx}`,
    description: `Test promo code ${idx}`,
    discountType: 'percentage',
    discountValue: 20,
    maxRedemptions: 100,
    timesRedeemed: 0,
    validFrom: PROMO_VALID_FROM,
    validUntil: PROMO_VALID_UNTIL,
    planFilter: null,
    createdBy: 'user-admin-001',
    createdAt: FIXED_CREATED,
    ...overrides,
  };
}

// ── Reset counters ─────────────────────────────────────────

export function resetSubscriptionCounters(): void {
  subCounter = 0;
  entitlementCounter = 0;
  promoCounter = 0;
}

// ── Predefined subscription scenarios ──────────────────────

export const SUBSCRIPTION_FIXTURES: Record<string, SubscriptionFixture> = {
  /** Free tier -- default for new households */
  free: {
    id: 'sub-free-001',
    householdId: 'household-001',
    plan: 'free',
    status: 'active',
    currentPeriodStart: PERIOD_START,
    currentPeriodEnd: PERIOD_END_MONTHLY,
    trialEndsAt: null,
    cancelledAt: null,
    pausedAt: null,
    externalId: null,
    provider: 'manual',
    metadata: {},
    createdAt: FIXED_CREATED,
    updatedAt: FIXED_UPDATED,
  },

  /** Active trial period */
  trial_active: {
    id: 'sub-trial-active-001',
    householdId: 'household-002',
    plan: 'trial',
    status: 'trialing',
    currentPeriodStart: PERIOD_START,
    currentPeriodEnd: TRIAL_END,
    trialEndsAt: TRIAL_END,
    cancelledAt: null,
    pausedAt: null,
    externalId: 'stripe_sub_trial_001',
    provider: 'stripe',
    metadata: { trialSource: 'onboarding' },
    createdAt: FIXED_CREATED,
    updatedAt: FIXED_UPDATED,
  },

  /** Expired trial */
  trial_expired: {
    id: 'sub-trial-expired-001',
    householdId: 'household-003',
    plan: 'trial',
    status: 'expired',
    currentPeriodStart: new Date('2026-01-01T00:00:00.000Z'),
    currentPeriodEnd: TRIAL_EXPIRED,
    trialEndsAt: TRIAL_EXPIRED,
    cancelledAt: null,
    pausedAt: null,
    externalId: 'stripe_sub_trial_expired_001',
    provider: 'stripe',
    metadata: {},
    createdAt: FIXED_CREATED,
    updatedAt: FIXED_UPDATED,
  },

  /** Active premium monthly */
  premium_monthly_active: {
    id: 'sub-premium-monthly-001',
    householdId: 'household-004',
    plan: 'premium_monthly',
    status: 'active',
    currentPeriodStart: PERIOD_START,
    currentPeriodEnd: PERIOD_END_MONTHLY,
    trialEndsAt: null,
    cancelledAt: null,
    pausedAt: null,
    externalId: 'stripe_sub_pm_001',
    provider: 'stripe',
    metadata: {},
    createdAt: FIXED_CREATED,
    updatedAt: FIXED_UPDATED,
  },

  /** Cancelled premium annual (still active until period end) */
  premium_annual_cancelled: {
    id: 'sub-premium-annual-cancel-001',
    householdId: 'household-005',
    plan: 'premium_annual',
    status: 'cancelled',
    currentPeriodStart: PERIOD_START,
    currentPeriodEnd: PERIOD_END_ANNUAL,
    trialEndsAt: null,
    cancelledAt: CANCELLED_AT,
    pausedAt: null,
    externalId: 'stripe_sub_pa_cancel_001',
    provider: 'stripe',
    metadata: { cancellationReason: 'too_expensive' },
    createdAt: FIXED_CREATED,
    updatedAt: FIXED_UPDATED,
  },

  /** Paused subscription */
  paused: {
    id: 'sub-paused-001',
    householdId: 'household-006',
    plan: 'premium_monthly',
    status: 'paused',
    currentPeriodStart: PERIOD_START,
    currentPeriodEnd: PERIOD_END_MONTHLY,
    trialEndsAt: null,
    cancelledAt: null,
    pausedAt: PAUSED_AT,
    externalId: 'stripe_sub_paused_001',
    provider: 'stripe',
    metadata: { pauseReason: 'vacation' },
    createdAt: FIXED_CREATED,
    updatedAt: FIXED_UPDATED,
  },
};

// ── Predefined entitlements ────────────────────────────────

export const ENTITLEMENT_FIXTURES: Record<string, EntitlementFixture> = {
  premium_content: {
    id: 'entitlement-premium-001',
    householdId: 'household-004',
    feature: 'premium_content',
    granted: true,
    source: 'subscription',
    expiresAt: PERIOD_END_MONTHLY,
    createdAt: FIXED_CREATED,
  },
  offline_packs: {
    id: 'entitlement-offline-001',
    householdId: 'household-004',
    feature: 'offline_packs',
    granted: true,
    source: 'subscription',
    expiresAt: PERIOD_END_MONTHLY,
    createdAt: FIXED_CREATED,
  },
  no_ads: {
    id: 'entitlement-noads-001',
    householdId: 'household-004',
    feature: 'no_ads',
    granted: true,
    source: 'subscription',
    expiresAt: PERIOD_END_MONTHLY,
    createdAt: FIXED_CREATED,
  },
  promo_entitlement: {
    id: 'entitlement-promo-001',
    householdId: 'household-001',
    feature: 'premium_content',
    granted: true,
    source: 'promo:SUMMER2026',
    expiresAt: new Date('2026-06-30T23:59:59.000Z'),
    createdAt: FIXED_CREATED,
  },
  revoked: {
    id: 'entitlement-revoked-001',
    householdId: 'household-003',
    feature: 'premium_content',
    granted: false,
    source: 'subscription',
    expiresAt: null,
    createdAt: FIXED_CREATED,
  },
};

// ── Predefined promo codes ─────────────────────────────────

export const PROMO_CODE_FIXTURES: Record<string, PromoCodeFixture> = {
  percentage: {
    id: 'promo-pct-001',
    code: 'SUMMER2026',
    description: '20% off summer promotion',
    discountType: 'percentage',
    discountValue: 20,
    maxRedemptions: 1000,
    timesRedeemed: 42,
    validFrom: PROMO_VALID_FROM,
    validUntil: PROMO_VALID_UNTIL,
    planFilter: ['premium_monthly', 'premium_annual'],
    createdBy: 'user-admin-001',
    createdAt: FIXED_CREATED,
  },
  flat: {
    id: 'promo-flat-001',
    code: 'FLAT5OFF',
    description: '$5 off flat discount',
    discountType: 'flat',
    discountValue: 500, // in cents
    maxRedemptions: 500,
    timesRedeemed: 0,
    validFrom: PROMO_VALID_FROM,
    validUntil: PROMO_VALID_UNTIL,
    planFilter: null,
    createdBy: 'user-admin-001',
    createdAt: FIXED_CREATED,
  },
  free_trial: {
    id: 'promo-trial-001',
    code: 'FREETRIAL30',
    description: '30-day free trial extension',
    discountType: 'trial_extension',
    discountValue: 30, // days
    maxRedemptions: null, // unlimited
    timesRedeemed: 150,
    validFrom: PROMO_VALID_FROM,
    validUntil: null, // no expiry
    planFilter: ['trial'],
    createdBy: 'user-admin-001',
    createdAt: FIXED_CREATED,
  },
  expired: {
    id: 'promo-expired-001',
    code: 'EXPIRED2025',
    description: 'Already expired promo',
    discountType: 'percentage',
    discountValue: 50,
    maxRedemptions: 10,
    timesRedeemed: 10,
    validFrom: new Date('2025-01-01T00:00:00.000Z'),
    validUntil: new Date('2025-12-31T23:59:59.000Z'),
    planFilter: null,
    createdBy: 'user-admin-001',
    createdAt: new Date('2025-01-01T00:00:00.000Z'),
  },
};
