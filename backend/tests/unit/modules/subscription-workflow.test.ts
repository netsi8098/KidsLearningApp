import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockPrisma, resetPrismaMocks } from '../../helpers/prisma.mock';

// ── Mock dependencies ────────────────────────────────────────
vi.mock('../../../src/lib/prisma', () => ({ prisma: mockPrisma }));
vi.mock('../../../src/lib/audit', () => ({ logAudit: vi.fn() }));

import {
  updateSubscription,
  cancelSubscription,
  pauseSubscription,
  resumeSubscription,
  createSubscription,
} from '../../../src/modules/subscription/service';
import { logAudit } from '../../../src/lib/audit';
import { ValidationError, NotFoundError } from '../../../src/lib/errors';

// ── Helpers ──────────────────────────────────────────────────

function fakeSubscription(overrides: Record<string, unknown> = {}) {
  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  return {
    id: 'sub-1',
    householdId: 'household-1',
    plan: 'premium_monthly',
    status: 'active',
    currentPeriodStart: now,
    currentPeriodEnd: periodEnd,
    trialEndsAt: null,
    cancelledAt: null,
    pausedAt: null,
    externalId: null,
    provider: 'stripe',
    metadata: {},
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

const fakeSubscriptionWithIncludes = (overrides: Record<string, unknown> = {}) => ({
  ...fakeSubscription(overrides),
  household: { id: 'household-1', name: 'Test Family', plan: 'premium_monthly' },
  invoices: [],
});

// ── Subscription Workflow State Machine Tests ────────────────

describe('Subscription Workflow State Machine', () => {
  beforeEach(() => {
    resetPrismaMocks();
    vi.mocked(logAudit).mockReset();
  });

  // ── Valid Status Transitions ──────────────────────────────

  describe('Valid status transitions', () => {
    const validTransitions: Array<{
      from: string;
      to: string;
      description: string;
    }> = [
      { from: 'active', to: 'past_due', description: 'active -> past_due (payment failed)' },
      { from: 'active', to: 'cancelled', description: 'active -> cancelled (user cancels)' },
      { from: 'active', to: 'paused', description: 'active -> paused (user pauses)' },
      { from: 'trialing', to: 'active', description: 'trialing -> active (trial converts)' },
      { from: 'trialing', to: 'cancelled', description: 'trialing -> cancelled (user cancels during trial)' },
      { from: 'trialing', to: 'expired', description: 'trialing -> expired (trial expires)' },
      { from: 'past_due', to: 'active', description: 'past_due -> active (payment recovered)' },
      { from: 'past_due', to: 'cancelled', description: 'past_due -> cancelled (give up on payment)' },
      { from: 'past_due', to: 'expired', description: 'past_due -> expired (past due expires)' },
      { from: 'paused', to: 'active', description: 'paused -> active (resume subscription)' },
      { from: 'paused', to: 'cancelled', description: 'paused -> cancelled (cancel while paused)' },
      { from: 'cancelled', to: 'active', description: 'cancelled -> active (resubscribe)' },
      { from: 'expired', to: 'active', description: 'expired -> active (resubscribe)' },
    ];

    for (const { from, to, description } of validTransitions) {
      it(`should allow: ${description}`, async () => {
        const existing = fakeSubscription({ status: from });
        mockPrisma.subscription.findUnique.mockResolvedValue(existing);
        mockPrisma.subscription.update.mockResolvedValue(
          fakeSubscriptionWithIncludes({ status: to })
        );
        mockPrisma.entitlement.upsert.mockResolvedValue({});
        mockPrisma.entitlement.updateMany.mockResolvedValue({ count: 0 });

        const result = await updateSubscription('sub-1', { status: to }, 'admin-1');

        expect(result.status).toBe(to);
      });
    }
  });

  // ── Invalid Status Transitions ────────────────────────────

  describe('Invalid status transitions', () => {
    const invalidTransitions: Array<{
      from: string;
      to: string;
      description: string;
    }> = [
      { from: 'active', to: 'trialing', description: 'active -> trialing (cannot go back to trial)' },
      { from: 'active', to: 'expired', description: 'active -> expired (must go through past_due)' },
      { from: 'trialing', to: 'past_due', description: 'trialing -> past_due (invalid for trial)' },
      { from: 'trialing', to: 'paused', description: 'trialing -> paused (cannot pause a trial)' },
      { from: 'past_due', to: 'trialing', description: 'past_due -> trialing (cannot go back to trial)' },
      { from: 'past_due', to: 'paused', description: 'past_due -> paused (must resolve payment first)' },
      { from: 'cancelled', to: 'trialing', description: 'cancelled -> trialing (no new trial)' },
      { from: 'cancelled', to: 'paused', description: 'cancelled -> paused (must reactivate first)' },
      { from: 'cancelled', to: 'past_due', description: 'cancelled -> past_due (invalid)' },
      { from: 'cancelled', to: 'expired', description: 'cancelled -> expired (invalid)' },
      { from: 'expired', to: 'trialing', description: 'expired -> trialing (no new trial)' },
      { from: 'expired', to: 'paused', description: 'expired -> paused (invalid)' },
      { from: 'expired', to: 'past_due', description: 'expired -> past_due (invalid)' },
      { from: 'expired', to: 'cancelled', description: 'expired -> cancelled (invalid)' },
      { from: 'paused', to: 'trialing', description: 'paused -> trialing (invalid)' },
      { from: 'paused', to: 'past_due', description: 'paused -> past_due (invalid)' },
      { from: 'paused', to: 'expired', description: 'paused -> expired (invalid)' },
    ];

    for (const { from, to, description } of invalidTransitions) {
      it(`should reject: ${description}`, async () => {
        const existing = fakeSubscription({ status: from });
        mockPrisma.subscription.findUnique.mockResolvedValue(existing);

        await expect(
          updateSubscription('sub-1', { status: to }, 'admin-1')
        ).rejects.toThrow(ValidationError);
      });

      it(`should include clear message when rejecting: ${description}`, async () => {
        const existing = fakeSubscription({ status: from });
        mockPrisma.subscription.findUnique.mockResolvedValue(existing);

        try {
          await updateSubscription('sub-1', { status: to }, 'admin-1');
          expect.unreachable('Expected ValidationError to be thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
          const message = (error as ValidationError).message;
          expect(message).toContain(from);
          expect(message).toContain(to);
          expect(message).toContain('Invalid status transition');
        }
      });
    }
  });

  // ── Pause/Resume Lifecycle ───────────────────────────────────

  describe('Pause subscription', () => {
    it('should transition active subscription to paused', async () => {
      const existing = fakeSubscription({ status: 'active' });
      mockPrisma.subscription.findUnique.mockResolvedValue(existing);
      mockPrisma.subscription.update.mockResolvedValue(
        fakeSubscriptionWithIncludes({ status: 'paused', pausedAt: new Date() })
      );

      const result = await pauseSubscription(
        { subscriptionId: 'sub-1' },
        'user-1'
      );

      expect(result.status).toBe('paused');
    });

    it('should reject pausing a cancelled subscription', async () => {
      const existing = fakeSubscription({ status: 'cancelled' });
      mockPrisma.subscription.findUnique.mockResolvedValue(existing);

      await expect(
        pauseSubscription({ subscriptionId: 'sub-1' }, 'user-1')
      ).rejects.toThrow(ValidationError);
    });

    it('should reject pausing an already paused subscription', async () => {
      const existing = fakeSubscription({ status: 'paused' });
      mockPrisma.subscription.findUnique.mockResolvedValue(existing);

      await expect(
        pauseSubscription({ subscriptionId: 'sub-1' }, 'user-1')
      ).rejects.toThrow(ValidationError);
    });

    it('should throw NotFoundError for non-existent subscription', async () => {
      mockPrisma.subscription.findUnique.mockResolvedValue(null);

      await expect(
        pauseSubscription({ subscriptionId: 'missing' }, 'user-1')
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('Resume subscription', () => {
    it('should transition paused subscription to active', async () => {
      const existing = fakeSubscription({ status: 'paused' });
      mockPrisma.subscription.findUnique.mockResolvedValue(existing);
      mockPrisma.subscription.update.mockResolvedValue(
        fakeSubscriptionWithIncludes({ status: 'active', pausedAt: null })
      );
      mockPrisma.entitlement.upsert.mockResolvedValue({});
      mockPrisma.entitlement.updateMany.mockResolvedValue({ count: 0 });

      const result = await resumeSubscription(
        { subscriptionId: 'sub-1' },
        'user-1'
      );

      expect(result.status).toBe('active');
    });

    it('should allow resuming a cancelled subscription (resubscribe)', async () => {
      const existing = fakeSubscription({ status: 'cancelled' });
      mockPrisma.subscription.findUnique.mockResolvedValue(existing);
      mockPrisma.subscription.update.mockResolvedValue(
        fakeSubscriptionWithIncludes({ status: 'active' })
      );
      mockPrisma.entitlement.upsert.mockResolvedValue({});
      mockPrisma.entitlement.updateMany.mockResolvedValue({ count: 0 });

      const result = await resumeSubscription(
        { subscriptionId: 'sub-1' },
        'user-1'
      );

      expect(result.status).toBe('active');
    });

    it('should allow resuming an expired subscription (resubscribe)', async () => {
      const existing = fakeSubscription({ status: 'expired' });
      mockPrisma.subscription.findUnique.mockResolvedValue(existing);
      mockPrisma.subscription.update.mockResolvedValue(
        fakeSubscriptionWithIncludes({ status: 'active' })
      );
      mockPrisma.entitlement.upsert.mockResolvedValue({});
      mockPrisma.entitlement.updateMany.mockResolvedValue({ count: 0 });

      const result = await resumeSubscription(
        { subscriptionId: 'sub-1' },
        'user-1'
      );

      expect(result.status).toBe('active');
    });

    it('should extend the period from now on resume', async () => {
      const existing = fakeSubscription({ status: 'paused', plan: 'premium_monthly' });
      mockPrisma.subscription.findUnique.mockResolvedValue(existing);
      mockPrisma.subscription.update.mockResolvedValue(
        fakeSubscriptionWithIncludes({ status: 'active' })
      );
      mockPrisma.entitlement.upsert.mockResolvedValue({});
      mockPrisma.entitlement.updateMany.mockResolvedValue({ count: 0 });

      await resumeSubscription({ subscriptionId: 'sub-1' }, 'user-1');

      const updateCall = mockPrisma.subscription.update.mock.calls[0][0];
      expect(updateCall.data.currentPeriodStart).toBeInstanceOf(Date);
      expect(updateCall.data.currentPeriodEnd).toBeInstanceOf(Date);
      expect(updateCall.data.pausedAt).toBeNull();
    });

    it('should re-sync entitlements on resume', async () => {
      const existing = fakeSubscription({ status: 'paused', plan: 'premium_monthly' });
      mockPrisma.subscription.findUnique.mockResolvedValue(existing);
      mockPrisma.subscription.update.mockResolvedValue(
        fakeSubscriptionWithIncludes({ status: 'active' })
      );
      mockPrisma.entitlement.upsert.mockResolvedValue({});
      mockPrisma.entitlement.updateMany.mockResolvedValue({ count: 0 });

      await resumeSubscription({ subscriptionId: 'sub-1' }, 'user-1');

      // syncEntitlements should have upserted entitlements for the plan
      expect(mockPrisma.entitlement.upsert).toHaveBeenCalled();
    });
  });

  // ── Cancel Subscription ──────────────────────────────────────

  describe('Cancel subscription', () => {
    it('should cancel an active subscription', async () => {
      const existing = fakeSubscription({ status: 'active' });
      mockPrisma.subscription.findUnique.mockResolvedValue(existing);
      mockPrisma.subscription.update.mockResolvedValue(
        fakeSubscriptionWithIncludes({ status: 'cancelled' })
      );

      const result = await cancelSubscription(
        { subscriptionId: 'sub-1', immediate: false },
        'user-1'
      );

      expect(result.status).toBe('cancelled');
    });

    it('should reject cancelling an already cancelled subscription', async () => {
      const existing = fakeSubscription({ status: 'cancelled' });
      mockPrisma.subscription.findUnique.mockResolvedValue(existing);

      await expect(
        cancelSubscription({ subscriptionId: 'sub-1', immediate: false }, 'user-1')
      ).rejects.toThrow(ValidationError);
    });

    it('should reject cancelling an expired subscription', async () => {
      const existing = fakeSubscription({ status: 'expired' });
      mockPrisma.subscription.findUnique.mockResolvedValue(existing);

      await expect(
        cancelSubscription({ subscriptionId: 'sub-1', immediate: false }, 'user-1')
      ).rejects.toThrow(ValidationError);
    });

    it('should downgrade entitlements to free on immediate cancellation', async () => {
      const existing = fakeSubscription({ status: 'active' });
      mockPrisma.subscription.findUnique.mockResolvedValue(existing);
      mockPrisma.subscription.update.mockResolvedValue(
        fakeSubscriptionWithIncludes({ status: 'cancelled' })
      );
      mockPrisma.entitlement.upsert.mockResolvedValue({});
      mockPrisma.entitlement.updateMany.mockResolvedValue({ count: 0 });
      mockPrisma.household.update.mockResolvedValue({});

      await cancelSubscription(
        { subscriptionId: 'sub-1', immediate: true },
        'user-1'
      );

      // syncEntitlements called with 'free' plan
      expect(mockPrisma.entitlement.upsert).toHaveBeenCalled();
      expect(mockPrisma.household.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { plan: 'free' },
        })
      );
    });

    it('should create audit log on cancellation', async () => {
      const existing = fakeSubscription({ status: 'active' });
      mockPrisma.subscription.findUnique.mockResolvedValue(existing);
      mockPrisma.subscription.update.mockResolvedValue(
        fakeSubscriptionWithIncludes({ status: 'cancelled' })
      );

      await cancelSubscription(
        { subscriptionId: 'sub-1', reason: 'Too expensive', immediate: false },
        'user-1'
      );

      expect(logAudit).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'cancel',
          entity: 'Subscription',
          entityId: 'sub-1',
          userId: 'user-1',
          changes: expect.objectContaining({ reason: 'Too expensive' }),
        })
      );
    });
  });

  // ── Entitlement Sync ─────────────────────────────────────────

  describe('Entitlement sync', () => {
    it('should sync premium entitlements on subscription creation', async () => {
      mockPrisma.household.findUnique.mockResolvedValue({
        id: 'household-1',
        name: 'Test Family',
      });
      mockPrisma.subscription.create.mockResolvedValue(
        fakeSubscriptionWithIncludes({ plan: 'premium_monthly', status: 'active' })
      );
      mockPrisma.entitlement.upsert.mockResolvedValue({});
      mockPrisma.entitlement.updateMany.mockResolvedValue({ count: 0 });

      await createSubscription(
        {
          householdId: 'household-1',
          plan: 'premium_monthly',
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        'admin-1'
      );

      // Premium monthly features: basic_content, premium_content, offline_packs, ad_free
      expect(mockPrisma.entitlement.upsert).toHaveBeenCalledTimes(4);

      // Check that premium features are granted
      const upsertCalls = mockPrisma.entitlement.upsert.mock.calls.map(
        (call: any[]) => call[0].create.feature
      );
      expect(upsertCalls).toContain('basic_content');
      expect(upsertCalls).toContain('premium_content');
      expect(upsertCalls).toContain('offline_packs');
      expect(upsertCalls).toContain('ad_free');
    });

    it('should sync family entitlements including family_profiles', async () => {
      mockPrisma.household.findUnique.mockResolvedValue({
        id: 'household-1',
        name: 'Test Family',
      });
      mockPrisma.subscription.create.mockResolvedValue(
        fakeSubscriptionWithIncludes({ plan: 'family_monthly', status: 'active' })
      );
      mockPrisma.entitlement.upsert.mockResolvedValue({});
      mockPrisma.entitlement.updateMany.mockResolvedValue({ count: 0 });

      await createSubscription(
        {
          householdId: 'household-1',
          plan: 'family_monthly',
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        'admin-1'
      );

      // Family monthly: basic_content, premium_content, offline_packs, ad_free, family_profiles
      expect(mockPrisma.entitlement.upsert).toHaveBeenCalledTimes(5);

      const upsertCalls = mockPrisma.entitlement.upsert.mock.calls.map(
        (call: any[]) => call[0].create.feature
      );
      expect(upsertCalls).toContain('family_profiles');
    });

    it('should grant limited features for trial plan', async () => {
      mockPrisma.household.findUnique.mockResolvedValue({
        id: 'household-1',
        name: 'Test Family',
      });
      mockPrisma.subscription.create.mockResolvedValue(
        fakeSubscriptionWithIncludes({ plan: 'trial', status: 'active' })
      );
      mockPrisma.entitlement.upsert.mockResolvedValue({});
      mockPrisma.entitlement.updateMany.mockResolvedValue({ count: 0 });

      await createSubscription(
        {
          householdId: 'household-1',
          plan: 'trial',
          currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        },
        'admin-1'
      );

      // Trial features: basic_content, premium_content, offline_packs
      expect(mockPrisma.entitlement.upsert).toHaveBeenCalledTimes(3);

      const upsertCalls = mockPrisma.entitlement.upsert.mock.calls.map(
        (call: any[]) => call[0].create.feature
      );
      expect(upsertCalls).toContain('basic_content');
      expect(upsertCalls).toContain('premium_content');
      expect(upsertCalls).toContain('offline_packs');
      // Trial should NOT include ad_free or family_profiles
      expect(upsertCalls).not.toContain('ad_free');
      expect(upsertCalls).not.toContain('family_profiles');
    });

    it('should grant only basic_content for free plan', async () => {
      mockPrisma.household.findUnique.mockResolvedValue({
        id: 'household-1',
        name: 'Test Family',
      });
      mockPrisma.subscription.create.mockResolvedValue(
        fakeSubscriptionWithIncludes({ plan: 'free', status: 'active' })
      );
      mockPrisma.entitlement.upsert.mockResolvedValue({});
      mockPrisma.entitlement.updateMany.mockResolvedValue({ count: 0 });

      await createSubscription(
        {
          householdId: 'household-1',
          plan: 'free',
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        },
        'admin-1'
      );

      // Free: basic_content only
      expect(mockPrisma.entitlement.upsert).toHaveBeenCalledTimes(1);
      const feature = mockPrisma.entitlement.upsert.mock.calls[0][0].create.feature;
      expect(feature).toBe('basic_content');
    });

    it('should revoke premium features on cancellation', async () => {
      const existing = fakeSubscription({ status: 'active', plan: 'premium_monthly' });
      mockPrisma.subscription.findUnique.mockResolvedValue(existing);
      mockPrisma.subscription.update.mockResolvedValue(
        fakeSubscriptionWithIncludes({ status: 'cancelled' })
      );
      mockPrisma.entitlement.upsert.mockResolvedValue({});
      mockPrisma.entitlement.updateMany.mockResolvedValue({ count: 0 });
      mockPrisma.household.update.mockResolvedValue({});

      await cancelSubscription(
        { subscriptionId: 'sub-1', immediate: true },
        'user-1'
      );

      // syncEntitlements revokes non-free entitlements
      expect(mockPrisma.entitlement.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            householdId: 'household-1',
            feature: { notIn: ['basic_content'] },
            source: { startsWith: 'subscription:' },
          }),
          data: { granted: false },
        })
      );
    });

    it('should upgrade entitlements on plan change from free to premium', async () => {
      const existing = fakeSubscription({ status: 'active', plan: 'free' });
      mockPrisma.subscription.findUnique.mockResolvedValue(existing);
      mockPrisma.subscription.update.mockResolvedValue(
        fakeSubscriptionWithIncludes({ status: 'active', plan: 'premium_monthly' })
      );
      mockPrisma.entitlement.upsert.mockResolvedValue({});
      mockPrisma.entitlement.updateMany.mockResolvedValue({ count: 0 });

      await updateSubscription(
        'sub-1',
        { plan: 'premium_monthly' },
        'admin-1'
      );

      // Upsert should be called for all premium features
      expect(mockPrisma.entitlement.upsert).toHaveBeenCalledTimes(4);
    });

    it('should downgrade entitlements on plan change to cancelled status', async () => {
      const existing = fakeSubscription({ status: 'active', plan: 'premium_monthly' });
      mockPrisma.subscription.findUnique.mockResolvedValue(existing);
      mockPrisma.subscription.update.mockResolvedValue(
        fakeSubscriptionWithIncludes({ status: 'cancelled' })
      );
      mockPrisma.entitlement.upsert.mockResolvedValue({});
      mockPrisma.entitlement.updateMany.mockResolvedValue({ count: 0 });

      await updateSubscription(
        'sub-1',
        { status: 'cancelled' },
        'admin-1'
      );

      // Should sync to free plan (basic_content only)
      const upsertCalls = mockPrisma.entitlement.upsert.mock.calls.map(
        (call: any[]) => call[0].create.feature
      );
      expect(upsertCalls).toEqual(['basic_content']);
    });
  });
});
