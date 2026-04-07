import { Router } from 'express';
import { validate } from '../../lib/validate.js';
import { authenticate, requireRole } from '../../middleware/auth.js';
import * as subscriptionService from './service.js';
import {
  listSubscriptionsSchema,
  getSubscriptionSchema,
  createSubscriptionSchema,
  updateSubscriptionSchema,
  checkoutSchema,
  cancelSubscriptionSchema,
  pauseSubscriptionSchema,
  resumeSubscriptionSchema,
  webhookSchema,
  listEntitlementsSchema,
  redeemPromoSchema,
  listPromosSchema,
  createPromoSchema,
} from './schemas.js';

export const router = Router();

// ── GET /api/subscriptions ───────────────────────────────
// List subscriptions with pagination and filters. Admin only.

router.get(
  '/',
  authenticate,
  requireRole('admin'),
  validate(listSubscriptionsSchema),
  async (req, res) => {
    const query = (req as unknown as Record<string, unknown>).validatedQuery as
      typeof listSubscriptionsSchema extends { _output: { query: infer Q } } ? Q : Record<string, unknown>;

    const result = await subscriptionService.listSubscriptions({
      page: (query as Record<string, unknown>).page as number ?? 1,
      limit: (query as Record<string, unknown>).limit as number ?? 20,
      sortBy: (query as Record<string, unknown>).sortBy as string ?? 'createdAt',
      sortOrder: (query as Record<string, unknown>).sortOrder as 'asc' | 'desc' ?? 'desc',
      status: (query as Record<string, unknown>).status as string | undefined,
      plan: (query as Record<string, unknown>).plan as string | undefined,
      householdId: (query as Record<string, unknown>).householdId as string | undefined,
    } as Parameters<typeof subscriptionService.listSubscriptions>[0]);

    res.json(result);
  }
);

// ── POST /api/subscriptions ──────────────────────────────
// Create new subscription. Admin only.

router.post(
  '/',
  authenticate,
  requireRole('admin'),
  validate(createSubscriptionSchema),
  async (req, res) => {
    const subscription = await subscriptionService.createSubscription(
      req.body,
      req.user!.userId
    );
    res.status(201).json(subscription);
  }
);

// ── POST /api/subscriptions/checkout ─────────────────────
// Initiate a subscription. Parent-facing, no auth required.

router.post(
  '/checkout',
  validate(checkoutSchema),
  async (req, res) => {
    const subscription = await subscriptionService.checkout(req.body);
    res.status(201).json(subscription);
  }
);

// ── POST /api/subscriptions/cancel ───────────────────────
// Cancel an active subscription.

router.post(
  '/cancel',
  authenticate,
  validate(cancelSubscriptionSchema),
  async (req, res) => {
    const subscription = await subscriptionService.cancelSubscription(
      req.body,
      req.user!.userId
    );
    res.json(subscription);
  }
);

// ── POST /api/subscriptions/pause ────────────────────────
// Pause an active subscription.

router.post(
  '/pause',
  authenticate,
  validate(pauseSubscriptionSchema),
  async (req, res) => {
    const subscription = await subscriptionService.pauseSubscription(
      req.body,
      req.user!.userId
    );
    res.json(subscription);
  }
);

// ── POST /api/subscriptions/resume ───────────────────────
// Resume a paused subscription.

router.post(
  '/resume',
  authenticate,
  validate(resumeSubscriptionSchema),
  async (req, res) => {
    const subscription = await subscriptionService.resumeSubscription(
      req.body,
      req.user!.userId
    );
    res.json(subscription);
  }
);

// ── POST /api/subscriptions/webhook ──────────────────────
// Payment provider webhook. No auth required.

router.post(
  '/webhook',
  validate(webhookSchema),
  async (req, res) => {
    const result = await subscriptionService.handleWebhook(req.body);
    res.json(result);
  }
);

// ── GET /api/subscriptions/entitlements/:householdId ─────
// List entitlements for a household.

router.get(
  '/entitlements/:householdId',
  authenticate,
  validate(listEntitlementsSchema),
  async (req, res) => {
    const entitlements = await subscriptionService.listEntitlements(
      req.params.householdId as string
    );
    res.json(entitlements);
  }
);

// ── POST /api/subscriptions/promo/redeem ─────────────────
// Redeem a promo code.

router.post(
  '/promo/redeem',
  authenticate,
  validate(redeemPromoSchema),
  async (req, res) => {
    const result = await subscriptionService.redeemPromo(req.body);
    res.json(result);
  }
);

// ── GET /api/subscriptions/promo ─────────────────────────
// List promo codes. Admin only.

router.get(
  '/promo',
  authenticate,
  requireRole('admin'),
  validate(listPromosSchema),
  async (req, res) => {
    const query = (req as unknown as Record<string, unknown>).validatedQuery as
      typeof listPromosSchema extends { _output: { query: infer Q } } ? Q : Record<string, unknown>;

    const result = await subscriptionService.listPromos({
      page: (query as Record<string, unknown>).page as number ?? 1,
      limit: (query as Record<string, unknown>).limit as number ?? 20,
      sortBy: (query as Record<string, unknown>).sortBy as string ?? 'createdAt',
      sortOrder: (query as Record<string, unknown>).sortOrder as 'asc' | 'desc' ?? 'desc',
    } as Parameters<typeof subscriptionService.listPromos>[0]);

    res.json(result);
  }
);

// ── POST /api/subscriptions/promo ────────────────────────
// Create a promo code. Admin only.

router.post(
  '/promo',
  authenticate,
  requireRole('admin'),
  validate(createPromoSchema),
  async (req, res) => {
    const promo = await subscriptionService.createPromo(
      req.body,
      req.user!.userId
    );
    res.status(201).json(promo);
  }
);

// ── GET /api/subscriptions/:id ───────────────────────────
// Get a single subscription by ID. Must come after static paths.

router.get(
  '/:id',
  authenticate,
  validate(getSubscriptionSchema),
  async (req, res) => {
    const subscription = await subscriptionService.getSubscription(req.params.id as string);
    res.json(subscription);
  }
);

// ── PATCH /api/subscriptions/:id ─────────────────────────
// Update subscription status or details.

router.patch(
  '/:id',
  authenticate,
  validate(updateSubscriptionSchema),
  async (req, res) => {
    const subscription = await subscriptionService.updateSubscription(
      req.params.id as string,
      req.body,
      req.user!.userId
    );
    res.json(subscription);
  }
);

export default router;
