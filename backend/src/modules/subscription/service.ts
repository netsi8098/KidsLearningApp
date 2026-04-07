import { Prisma, SubStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { NotFoundError, ConflictError, ValidationError } from '../../lib/errors.js';
import { logAudit } from '../../lib/audit.js';
import type { PaginatedResult } from '../../types/index.js';
import type {
  ListSubscriptionsQuery,
  CreateSubscriptionInput,
  UpdateSubscriptionInput,
  CheckoutInput,
  CancelSubscriptionInput,
  PauseSubscriptionInput,
  ResumeSubscriptionInput,
  WebhookInput,
  RedeemPromoInput,
  ListPromosQuery,
  CreatePromoInput,
} from './schemas.js';

// ── Includes ─────────────────────────────────────────────

const SUBSCRIPTION_INCLUDE = {
  household: { select: { id: true, name: true, plan: true } },
  invoices: { orderBy: { createdAt: 'desc' as const }, take: 5 },
} as const;

// ── Status Transition Map ────────────────────────────────

const VALID_TRANSITIONS: Record<SubStatus, SubStatus[]> = {
  active: ['past_due', 'cancelled', 'paused'],
  trialing: ['active', 'cancelled', 'expired'],
  past_due: ['active', 'cancelled', 'expired'],
  cancelled: ['active'], // resubscribe
  expired: ['active'], // resubscribe
  paused: ['active', 'cancelled'],
};

function validateStatusTransition(current: SubStatus, next: SubStatus): void {
  const allowed = VALID_TRANSITIONS[current];
  if (!allowed || !allowed.includes(next)) {
    throw new ValidationError(
      `Invalid status transition: '${current}' -> '${next}'. Allowed transitions from '${current}': ${allowed?.join(', ') || 'none'}`
    );
  }
}

// ── Plan → Entitlement Features Map ──────────────────────

const PLAN_FEATURES: Record<string, string[]> = {
  free: ['basic_content'],
  trial: ['basic_content', 'premium_content', 'offline_packs'],
  premium_monthly: ['basic_content', 'premium_content', 'offline_packs', 'ad_free'],
  premium_annual: ['basic_content', 'premium_content', 'offline_packs', 'ad_free'],
  family_monthly: ['basic_content', 'premium_content', 'offline_packs', 'ad_free', 'family_profiles'],
  family_annual: ['basic_content', 'premium_content', 'offline_packs', 'ad_free', 'family_profiles'],
  promo: ['basic_content', 'premium_content'],
};

// ── Sync Entitlements ────────────────────────────────────

async function syncEntitlements(
  householdId: string,
  plan: string,
  expiresAt: Date | null
): Promise<void> {
  const features = PLAN_FEATURES[plan] ?? PLAN_FEATURES.free;

  // Upsert each entitlement
  for (const feature of features) {
    await prisma.entitlement.upsert({
      where: { householdId_feature: { householdId, feature } },
      update: {
        granted: true,
        source: `subscription:${plan}`,
        expiresAt,
      },
      create: {
        householdId,
        feature,
        granted: true,
        source: `subscription:${plan}`,
        expiresAt,
      },
    });
  }

  // Revoke entitlements not in the current plan
  await prisma.entitlement.updateMany({
    where: {
      householdId,
      feature: { notIn: features },
      source: { startsWith: 'subscription:' },
    },
    data: { granted: false },
  });
}

// ── List Subscriptions ───────────────────────────────────

export async function listSubscriptions(
  query: ListSubscriptionsQuery
): Promise<PaginatedResult<Record<string, unknown>>> {
  const { page, limit, sortBy, sortOrder, status, plan, householdId } = query;

  const where: Prisma.SubscriptionWhereInput = {};
  if (status) where.status = status;
  if (plan) where.plan = plan;
  if (householdId) where.householdId = householdId;

  const [data, total] = await Promise.all([
    prisma.subscription.findMany({
      where,
      include: SUBSCRIPTION_INCLUDE,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.subscription.count({ where }),
  ]);

  return {
    data: data as unknown as Record<string, unknown>[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ── Get Subscription ─────────────────────────────────────

export async function getSubscription(id: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { id },
    include: {
      ...SUBSCRIPTION_INCLUDE,
      invoices: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!subscription) {
    throw new NotFoundError('Subscription', id);
  }

  return subscription;
}

// ── Create Subscription (admin) ──────────────────────────

export async function createSubscription(input: CreateSubscriptionInput, userId: string) {
  // Verify household exists
  const household = await prisma.household.findUnique({
    where: { id: input.householdId },
  });
  if (!household) {
    throw new NotFoundError('Household', input.householdId);
  }

  const subscription = await prisma.subscription.create({
    data: {
      householdId: input.householdId,
      plan: input.plan,
      status: input.status ?? 'active',
      currentPeriodStart: input.currentPeriodStart
        ? new Date(input.currentPeriodStart)
        : new Date(),
      currentPeriodEnd: new Date(input.currentPeriodEnd),
      trialEndsAt: input.trialEndsAt ? new Date(input.trialEndsAt) : null,
      externalId: input.externalId ?? null,
      provider: input.provider ?? 'manual',
      metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
    },
    include: SUBSCRIPTION_INCLUDE,
  });

  // Sync entitlements based on plan
  await syncEntitlements(
    input.householdId,
    input.plan,
    new Date(input.currentPeriodEnd)
  );

  await logAudit({
    action: 'create',
    entity: 'Subscription',
    entityId: subscription.id,
    userId,
    changes: input as unknown as Record<string, unknown>,
  });

  return subscription;
}

// ── Update Subscription ──────────────────────────────────

export async function updateSubscription(id: string, input: UpdateSubscriptionInput, userId?: string) {
  const existing = await prisma.subscription.findUnique({ where: { id } });
  if (!existing) {
    throw new NotFoundError('Subscription', id);
  }

  // Validate status transition if status is changing
  if (input.status && input.status !== existing.status) {
    validateStatusTransition(existing.status, input.status as SubStatus);
  }

  const updateData: Prisma.SubscriptionUpdateInput = {};

  if (input.plan !== undefined) updateData.plan = input.plan;
  if (input.status !== undefined) updateData.status = input.status;
  if (input.currentPeriodStart !== undefined) {
    updateData.currentPeriodStart = new Date(input.currentPeriodStart);
  }
  if (input.currentPeriodEnd !== undefined) {
    updateData.currentPeriodEnd = new Date(input.currentPeriodEnd);
  }
  if (input.trialEndsAt !== undefined) {
    updateData.trialEndsAt = input.trialEndsAt ? new Date(input.trialEndsAt) : null;
  }
  if (input.cancelledAt !== undefined) {
    updateData.cancelledAt = input.cancelledAt ? new Date(input.cancelledAt) : null;
  }
  if (input.pausedAt !== undefined) {
    updateData.pausedAt = input.pausedAt ? new Date(input.pausedAt) : null;
  }
  if (input.externalId !== undefined) updateData.externalId = input.externalId;
  if (input.provider !== undefined) updateData.provider = input.provider;
  if (input.metadata !== undefined) updateData.metadata = input.metadata as Prisma.InputJsonValue;

  const subscription = await prisma.subscription.update({
    where: { id },
    data: updateData,
    include: SUBSCRIPTION_INCLUDE,
  });

  // Re-sync entitlements if plan or status changed
  const effectivePlan = input.plan ?? existing.plan;
  const effectiveStatus = input.status ?? existing.status;
  if (effectiveStatus === 'active' || effectiveStatus === 'trialing') {
    const periodEnd = input.currentPeriodEnd
      ? new Date(input.currentPeriodEnd)
      : existing.currentPeriodEnd;
    await syncEntitlements(existing.householdId, effectivePlan, periodEnd);
  } else if (effectiveStatus === 'cancelled' || effectiveStatus === 'expired') {
    // Downgrade to free
    await syncEntitlements(existing.householdId, 'free', null);
  }

  await logAudit({
    action: 'update',
    entity: 'Subscription',
    entityId: id,
    userId,
    changes: input as unknown as Record<string, unknown>,
  });

  return subscription;
}

// ── Checkout (parent-facing) ─────────────────────────────

export async function checkout(input: CheckoutInput) {
  // Verify household exists
  const household = await prisma.household.findUnique({
    where: { id: input.householdId },
  });
  if (!household) {
    throw new NotFoundError('Household', input.householdId);
  }

  // Check for existing active subscription
  const existing = await prisma.subscription.findFirst({
    where: {
      householdId: input.householdId,
      status: { in: ['active', 'trialing'] },
    },
  });
  if (existing) {
    throw new ConflictError('Household already has an active subscription');
  }

  // Handle promo code if provided
  let promoDiscount = 0;
  if (input.promoCode) {
    const promo = await prisma.promoCode.findUnique({
      where: { code: input.promoCode },
    });
    if (!promo) {
      throw new NotFoundError('PromoCode', input.promoCode);
    }
    if (promo.validFrom > new Date()) {
      throw new ValidationError('Promo code is not yet valid');
    }
    if (promo.validUntil && promo.validUntil < new Date()) {
      throw new ValidationError('Promo code has expired');
    }
    if (promo.maxRedemptions && promo.timesRedeemed >= promo.maxRedemptions) {
      throw new ValidationError('Promo code has reached maximum redemptions');
    }
    if (promo.planFilter) {
      const allowedPlans = promo.planFilter as string[];
      if (Array.isArray(allowedPlans) && !allowedPlans.includes(input.plan)) {
        throw new ValidationError('Promo code is not valid for this plan');
      }
    }
    promoDiscount = promo.discountValue;
  }

  // Determine period based on plan
  const now = new Date();
  const periodEnd = new Date(now);
  const isAnnual = input.plan.includes('annual');
  const isTrial = input.plan === 'trial';

  if (isTrial) {
    periodEnd.setDate(periodEnd.getDate() + 14); // 14-day trial
  } else if (isAnnual) {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);
  } else {
    periodEnd.setMonth(periodEnd.getMonth() + 1);
  }

  const subscription = await prisma.subscription.create({
    data: {
      householdId: input.householdId,
      plan: input.plan,
      status: isTrial ? 'trialing' : 'active',
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      trialEndsAt: isTrial ? periodEnd : null,
      provider: 'stripe', // default payment provider
      metadata: {
        promoCode: input.promoCode ?? null,
        promoDiscount,
        paymentMethodId: input.paymentMethodId ?? null,
      },
    },
    include: SUBSCRIPTION_INCLUDE,
  });

  // Sync entitlements
  await syncEntitlements(input.householdId, input.plan, periodEnd);

  // Increment promo usage if used
  if (input.promoCode) {
    await prisma.promoCode.update({
      where: { code: input.promoCode },
      data: { timesRedeemed: { increment: 1 } },
    });
  }

  // Update household plan
  await prisma.household.update({
    where: { id: input.householdId },
    data: { plan: input.plan },
  });

  await logAudit({
    action: 'checkout',
    entity: 'Subscription',
    entityId: subscription.id,
    changes: { plan: input.plan, householdId: input.householdId },
  });

  return subscription;
}

// ── Cancel Subscription ──────────────────────────────────

export async function cancelSubscription(input: CancelSubscriptionInput, userId?: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { id: input.subscriptionId },
  });
  if (!subscription) {
    throw new NotFoundError('Subscription', input.subscriptionId);
  }

  if (subscription.status === 'cancelled' || subscription.status === 'expired') {
    throw new ValidationError(`Subscription is already ${subscription.status}`);
  }

  const now = new Date();
  const updateData: Prisma.SubscriptionUpdateInput = {
    cancelledAt: now,
    metadata: {
      ...(subscription.metadata as Record<string, unknown>),
      cancelReason: input.reason ?? null,
    } as Prisma.InputJsonValue,
  };

  if (input.immediate) {
    // Cancel immediately
    updateData.status = 'cancelled';
    updateData.currentPeriodEnd = now;
  } else {
    // Cancel at end of period
    updateData.status = 'cancelled';
  }

  const updated = await prisma.subscription.update({
    where: { id: input.subscriptionId },
    data: updateData,
    include: SUBSCRIPTION_INCLUDE,
  });

  // If immediate, downgrade entitlements now
  if (input.immediate) {
    await syncEntitlements(subscription.householdId, 'free', null);
    await prisma.household.update({
      where: { id: subscription.householdId },
      data: { plan: 'free' },
    });
  }

  await logAudit({
    action: 'cancel',
    entity: 'Subscription',
    entityId: input.subscriptionId,
    userId,
    changes: { reason: input.reason, immediate: input.immediate },
  });

  return updated;
}

// ── Pause Subscription ───────────────────────────────────

export async function pauseSubscription(input: PauseSubscriptionInput, userId?: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { id: input.subscriptionId },
  });
  if (!subscription) {
    throw new NotFoundError('Subscription', input.subscriptionId);
  }

  validateStatusTransition(subscription.status, 'paused' as SubStatus);

  const updated = await prisma.subscription.update({
    where: { id: input.subscriptionId },
    data: {
      status: 'paused',
      pausedAt: new Date(),
      metadata: {
        ...(subscription.metadata as Record<string, unknown>),
        resumeAt: input.resumeAt ?? null,
      } as Prisma.InputJsonValue,
    },
    include: SUBSCRIPTION_INCLUDE,
  });

  await logAudit({
    action: 'pause',
    entity: 'Subscription',
    entityId: input.subscriptionId,
    userId,
    changes: { resumeAt: input.resumeAt },
  });

  return updated;
}

// ── Resume Subscription ──────────────────────────────────

export async function resumeSubscription(input: ResumeSubscriptionInput, userId?: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { id: input.subscriptionId },
  });
  if (!subscription) {
    throw new NotFoundError('Subscription', input.subscriptionId);
  }

  validateStatusTransition(subscription.status, 'active' as SubStatus);

  // Extend period from now
  const now = new Date();
  const periodEnd = new Date(now);
  const isAnnual = subscription.plan.includes('annual');
  if (isAnnual) {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);
  } else {
    periodEnd.setMonth(periodEnd.getMonth() + 1);
  }

  const updated = await prisma.subscription.update({
    where: { id: input.subscriptionId },
    data: {
      status: 'active',
      pausedAt: null,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
    },
    include: SUBSCRIPTION_INCLUDE,
  });

  // Re-sync entitlements
  await syncEntitlements(subscription.householdId, subscription.plan, periodEnd);

  await logAudit({
    action: 'resume',
    entity: 'Subscription',
    entityId: input.subscriptionId,
    userId,
  });

  return updated;
}

// ── Webhook Handler ──────────────────────────────────────

export async function handleWebhook(input: WebhookInput) {
  const { event, provider, externalId, payload } = input;

  // Find subscription by external ID
  const subscription = await prisma.subscription.findFirst({
    where: { externalId, provider },
  });

  if (!subscription) {
    // Log but don't error - webhooks may arrive before subscription is created
    console.warn(`[Webhook] No subscription found for externalId=${externalId} provider=${provider}`);
    return { received: true, processed: false, reason: 'subscription_not_found' };
  }

  switch (event) {
    case 'payment.succeeded': {
      const amount = (payload.amount as number) ?? 0;
      const currency = (payload.currency as string) ?? 'usd';

      // Create invoice
      await prisma.invoice.create({
        data: {
          subscriptionId: subscription.id,
          amount,
          currency,
          status: 'paid',
          periodStart: subscription.currentPeriodStart,
          periodEnd: subscription.currentPeriodEnd,
          paidAt: new Date(),
          externalId: (payload.invoiceId as string) ?? null,
          lineItems: (payload.lineItems as Prisma.JsonValue) ?? [],
        },
      });

      // If past_due, reactivate
      if (subscription.status === 'past_due') {
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: 'active' },
        });
        await syncEntitlements(
          subscription.householdId,
          subscription.plan,
          subscription.currentPeriodEnd
        );
      }
      break;
    }

    case 'payment.failed': {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'past_due' },
      });
      break;
    }

    case 'subscription.renewed': {
      const newPeriodEnd = payload.currentPeriodEnd
        ? new Date(payload.currentPeriodEnd as string)
        : (() => {
            const end = new Date(subscription.currentPeriodEnd);
            const isAnnual = subscription.plan.includes('annual');
            if (isAnnual) {
              end.setFullYear(end.getFullYear() + 1);
            } else {
              end.setMonth(end.getMonth() + 1);
            }
            return end;
          })();

      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'active',
          currentPeriodStart: subscription.currentPeriodEnd,
          currentPeriodEnd: newPeriodEnd,
        },
      });

      await syncEntitlements(subscription.householdId, subscription.plan, newPeriodEnd);
      break;
    }

    case 'subscription.cancelled': {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'cancelled',
          cancelledAt: new Date(),
        },
      });
      await syncEntitlements(subscription.householdId, 'free', null);
      await prisma.household.update({
        where: { id: subscription.householdId },
        data: { plan: 'free' },
      });
      break;
    }

    case 'subscription.expired': {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'expired' },
      });
      await syncEntitlements(subscription.householdId, 'free', null);
      await prisma.household.update({
        where: { id: subscription.householdId },
        data: { plan: 'free' },
      });
      break;
    }

    default:
      return { received: true, processed: false, reason: `unhandled_event: ${event}` };
  }

  await logAudit({
    action: `webhook:${event}`,
    entity: 'Subscription',
    entityId: subscription.id,
    changes: { event, provider, externalId, payload },
  });

  return { received: true, processed: true, subscriptionId: subscription.id };
}

// ── Entitlements ─────────────────────────────────────────

export async function listEntitlements(householdId: string) {
  // Verify household exists
  const household = await prisma.household.findUnique({
    where: { id: householdId },
  });
  if (!household) {
    throw new NotFoundError('Household', householdId);
  }

  return prisma.entitlement.findMany({
    where: { householdId },
    orderBy: { feature: 'asc' },
  });
}

// ── Promo Code: Redeem ───────────────────────────────────

export async function redeemPromo(input: RedeemPromoInput) {
  const promo = await prisma.promoCode.findUnique({
    where: { code: input.code },
  });
  if (!promo) {
    throw new NotFoundError('PromoCode', input.code);
  }

  // Validate promo
  const now = new Date();
  if (promo.validFrom > now) {
    throw new ValidationError('Promo code is not yet valid');
  }
  if (promo.validUntil && promo.validUntil < now) {
    throw new ValidationError('Promo code has expired');
  }
  if (promo.maxRedemptions && promo.timesRedeemed >= promo.maxRedemptions) {
    throw new ValidationError('Promo code has reached maximum redemptions');
  }

  // Verify household
  const household = await prisma.household.findUnique({
    where: { id: input.householdId },
  });
  if (!household) {
    throw new NotFoundError('Household', input.householdId);
  }

  // Increment redemption count
  await prisma.promoCode.update({
    where: { code: input.code },
    data: { timesRedeemed: { increment: 1 } },
  });

  await logAudit({
    action: 'redeem_promo',
    entity: 'PromoCode',
    entityId: promo.id,
    changes: { code: input.code, householdId: input.householdId },
  });

  return {
    promoId: promo.id,
    code: promo.code,
    discountType: promo.discountType,
    discountValue: promo.discountValue,
    applied: true,
  };
}

// ── Promo Code: List (admin) ─────────────────────────────

export async function listPromos(
  query: ListPromosQuery
): Promise<PaginatedResult<Record<string, unknown>>> {
  const { page, limit, sortBy, sortOrder } = query;

  const [data, total] = await Promise.all([
    prisma.promoCode.findMany({
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.promoCode.count(),
  ]);

  return {
    data: data as unknown as Record<string, unknown>[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ── Promo Code: Create (admin) ───────────────────────────

export async function createPromo(input: CreatePromoInput, userId: string) {
  // Check code uniqueness
  const existing = await prisma.promoCode.findUnique({
    where: { code: input.code },
  });
  if (existing) {
    throw new ConflictError(`Promo code '${input.code}' already exists`);
  }

  const promo = await prisma.promoCode.create({
    data: {
      code: input.code,
      description: input.description ?? null,
      discountType: input.discountType,
      discountValue: input.discountValue,
      maxRedemptions: input.maxRedemptions ?? null,
      validFrom: new Date(input.validFrom),
      validUntil: input.validUntil ? new Date(input.validUntil) : null,
      planFilter: (input.planFilter ?? Prisma.JsonNull) as Prisma.InputJsonValue,
      createdBy: userId,
    },
  });

  await logAudit({
    action: 'create',
    entity: 'PromoCode',
    entityId: promo.id,
    userId,
    changes: input as unknown as Record<string, unknown>,
  });

  return promo;
}
