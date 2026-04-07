// ── Subscription API Integration Tests ─────────────────────
// Tests the subscription router with mocked services,
// real Zod validation, and real JWT auth middleware.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import {
  mountRouter,
  adminHeaders,
  editorHeaders,
  viewerHeaders,
  unauthHeaders,
} from '../helpers/supertest.helper.js';

// ── Mock the subscription service ────────────────────────────
vi.mock('../../src/modules/subscription/service.js', () => ({
  listSubscriptions: vi.fn(),
  getSubscription: vi.fn(),
  createSubscription: vi.fn(),
  updateSubscription: vi.fn(),
  checkout: vi.fn(),
  cancelSubscription: vi.fn(),
  pauseSubscription: vi.fn(),
  resumeSubscription: vi.fn(),
  handleWebhook: vi.fn(),
  listEntitlements: vi.fn(),
  redeemPromo: vi.fn(),
  listPromos: vi.fn(),
  createPromo: vi.fn(),
}));

import * as subscriptionService from '../../src/modules/subscription/service.js';
import { router as subscriptionRouter } from '../../src/modules/subscription/router.js';

const app = mountRouter('/api/subscriptions', subscriptionRouter);

// ── Test data ────────────────────────────────────────────────

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';
const HOUSEHOLD_UUID = '660e8400-e29b-41d4-a716-446655440001';

const SAMPLE_SUBSCRIPTION = {
  id: VALID_UUID,
  householdId: HOUSEHOLD_UUID,
  plan: 'premium_monthly',
  status: 'active',
  currentPeriodStart: '2024-01-01T00:00:00.000Z',
  currentPeriodEnd: '2024-02-01T00:00:00.000Z',
  provider: 'manual',
  metadata: {},
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const PAGINATED_RESPONSE = {
  data: [SAMPLE_SUBSCRIPTION],
  total: 1,
  page: 1,
  pageSize: 20,
};

const SAMPLE_ENTITLEMENT = {
  id: VALID_UUID,
  householdId: HOUSEHOLD_UUID,
  feature: 'premium_content',
  enabled: true,
  expiresAt: '2024-02-01T00:00:00.000Z',
};

// ── Tests ────────────────────────────────────────────────────

describe('Subscription API', () => {
  beforeEach(() => {
    vi.mocked(subscriptionService.listSubscriptions).mockResolvedValue(PAGINATED_RESPONSE as never);
    vi.mocked(subscriptionService.getSubscription).mockResolvedValue(SAMPLE_SUBSCRIPTION as never);
    vi.mocked(subscriptionService.createSubscription).mockResolvedValue(SAMPLE_SUBSCRIPTION as never);
    vi.mocked(subscriptionService.updateSubscription).mockResolvedValue(SAMPLE_SUBSCRIPTION as never);
    vi.mocked(subscriptionService.checkout).mockResolvedValue(SAMPLE_SUBSCRIPTION as never);
    vi.mocked(subscriptionService.cancelSubscription).mockResolvedValue(SAMPLE_SUBSCRIPTION as never);
    vi.mocked(subscriptionService.pauseSubscription).mockResolvedValue(SAMPLE_SUBSCRIPTION as never);
    vi.mocked(subscriptionService.resumeSubscription).mockResolvedValue(SAMPLE_SUBSCRIPTION as never);
    vi.mocked(subscriptionService.handleWebhook).mockResolvedValue({ received: true } as never);
    vi.mocked(subscriptionService.listEntitlements).mockResolvedValue([SAMPLE_ENTITLEMENT] as never);
    vi.mocked(subscriptionService.redeemPromo).mockResolvedValue({ success: true } as never);
    vi.mocked(subscriptionService.listPromos).mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      pageSize: 20,
    } as never);
    vi.mocked(subscriptionService.createPromo).mockResolvedValue({} as never);
  });

  // ── GET / ─────────────────────────────────────────────────

  describe('GET /api/subscriptions', () => {
    it('requires admin role', async () => {
      const res = await request(app)
        .get('/api/subscriptions')
        .set(editorHeaders());

      expect(res.status).toBe(403);
    });

    it('requires authentication', async () => {
      const res = await request(app)
        .get('/api/subscriptions')
        .set(unauthHeaders());

      expect(res.status).toBe(401);
    });

    it('returns paginated list for admin', async () => {
      const res = await request(app)
        .get('/api/subscriptions')
        .set(adminHeaders());

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('page');
      expect(res.body).toHaveProperty('pageSize');
    });

    it('accepts valid query filters', async () => {
      const res = await request(app)
        .get('/api/subscriptions')
        .set(adminHeaders())
        .query({ status: 'active', plan: 'premium_monthly' });

      expect(res.status).toBe(200);
    });

    it('rejects invalid status filter', async () => {
      const res = await request(app)
        .get('/api/subscriptions')
        .set(adminHeaders())
        .query({ status: 'invalid_status' });

      expect(res.status).toBe(400);
    });
  });

  // ── POST /checkout ────────────────────────────────────────

  describe('POST /api/subscriptions/checkout', () => {
    it('validates householdId and plan', async () => {
      const res = await request(app)
        .post('/api/subscriptions/checkout')
        .set('Content-Type', 'application/json')
        .send({
          householdId: HOUSEHOLD_UUID,
          plan: 'premium_monthly',
        });

      expect(res.status).toBe(201);
      expect(subscriptionService.checkout).toHaveBeenCalledWith(
        expect.objectContaining({
          householdId: HOUSEHOLD_UUID,
          plan: 'premium_monthly',
        })
      );
    });

    it('rejects missing householdId', async () => {
      const res = await request(app)
        .post('/api/subscriptions/checkout')
        .set('Content-Type', 'application/json')
        .send({ plan: 'premium_monthly' });

      expect(res.status).toBe(400);
    });

    it('rejects missing plan', async () => {
      const res = await request(app)
        .post('/api/subscriptions/checkout')
        .set('Content-Type', 'application/json')
        .send({ householdId: HOUSEHOLD_UUID });

      expect(res.status).toBe(400);
    });

    it('rejects invalid plan', async () => {
      const res = await request(app)
        .post('/api/subscriptions/checkout')
        .set('Content-Type', 'application/json')
        .send({ householdId: HOUSEHOLD_UUID, plan: 'invalid_plan' });

      expect(res.status).toBe(400);
    });

    it('rejects non-UUID householdId', async () => {
      const res = await request(app)
        .post('/api/subscriptions/checkout')
        .set('Content-Type', 'application/json')
        .send({ householdId: 'bad-id', plan: 'premium_monthly' });

      expect(res.status).toBe(400);
    });

    it('does not require auth (parent-facing)', async () => {
      const res = await request(app)
        .post('/api/subscriptions/checkout')
        .set('Content-Type', 'application/json')
        .send({ householdId: HOUSEHOLD_UUID, plan: 'premium_monthly' });

      expect(res.status).toBe(201);
    });
  });

  // ── POST /cancel ──────────────────────────────────────────

  describe('POST /api/subscriptions/cancel', () => {
    it('validates subscriptionId', async () => {
      const res = await request(app)
        .post('/api/subscriptions/cancel')
        .set(viewerHeaders())
        .send({ subscriptionId: VALID_UUID });

      expect(res.status).toBe(200);
    });

    it('rejects missing subscriptionId', async () => {
      const res = await request(app)
        .post('/api/subscriptions/cancel')
        .set(viewerHeaders())
        .send({});

      expect(res.status).toBe(400);
    });

    it('rejects non-UUID subscriptionId', async () => {
      const res = await request(app)
        .post('/api/subscriptions/cancel')
        .set(viewerHeaders())
        .send({ subscriptionId: 'not-a-uuid' });

      expect(res.status).toBe(400);
    });

    it('requires authentication', async () => {
      const res = await request(app)
        .post('/api/subscriptions/cancel')
        .set(unauthHeaders())
        .send({ subscriptionId: VALID_UUID });

      expect(res.status).toBe(401);
    });

    it('accepts optional reason and immediate fields', async () => {
      const res = await request(app)
        .post('/api/subscriptions/cancel')
        .set(viewerHeaders())
        .send({
          subscriptionId: VALID_UUID,
          reason: 'Too expensive',
          immediate: true,
        });

      expect(res.status).toBe(200);
    });
  });

  // ── POST /webhook ─────────────────────────────────────────

  describe('POST /api/subscriptions/webhook', () => {
    it('accepts event payloads without auth', async () => {
      const res = await request(app)
        .post('/api/subscriptions/webhook')
        .set('Content-Type', 'application/json')
        .send({
          event: 'payment.success',
          provider: 'stripe',
          externalId: 'sub_123abc',
          payload: { amount: 999 },
        });

      expect(res.status).toBe(200);
      expect(subscriptionService.handleWebhook).toHaveBeenCalled();
    });

    it('rejects missing event field', async () => {
      const res = await request(app)
        .post('/api/subscriptions/webhook')
        .set('Content-Type', 'application/json')
        .send({ provider: 'stripe', externalId: 'sub_123' });

      expect(res.status).toBe(400);
    });

    it('rejects missing provider field', async () => {
      const res = await request(app)
        .post('/api/subscriptions/webhook')
        .set('Content-Type', 'application/json')
        .send({ event: 'payment.success', externalId: 'sub_123' });

      expect(res.status).toBe(400);
    });

    it('rejects missing externalId field', async () => {
      const res = await request(app)
        .post('/api/subscriptions/webhook')
        .set('Content-Type', 'application/json')
        .send({ event: 'payment.success', provider: 'stripe' });

      expect(res.status).toBe(400);
    });
  });

  // ── GET /entitlements/:householdId ────────────────────────

  describe('GET /api/subscriptions/entitlements/:householdId', () => {
    it('returns entitlement array for valid householdId', async () => {
      const res = await request(app)
        .get(`/api/subscriptions/entitlements/${HOUSEHOLD_UUID}`)
        .set(viewerHeaders());

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('requires authentication', async () => {
      const res = await request(app)
        .get(`/api/subscriptions/entitlements/${HOUSEHOLD_UUID}`)
        .set(unauthHeaders());

      expect(res.status).toBe(401);
    });

    it('rejects non-UUID householdId', async () => {
      const res = await request(app)
        .get('/api/subscriptions/entitlements/not-a-uuid')
        .set(viewerHeaders());

      expect(res.status).toBe(400);
    });
  });

  // ── POST /promo/redeem ────────────────────────────────────

  describe('POST /api/subscriptions/promo/redeem', () => {
    it('validates code and householdId', async () => {
      const res = await request(app)
        .post('/api/subscriptions/promo/redeem')
        .set(viewerHeaders())
        .send({ code: 'WELCOME2024', householdId: HOUSEHOLD_UUID });

      expect(res.status).toBe(200);
      expect(subscriptionService.redeemPromo).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'WELCOME2024',
          householdId: HOUSEHOLD_UUID,
        })
      );
    });

    it('rejects missing code', async () => {
      const res = await request(app)
        .post('/api/subscriptions/promo/redeem')
        .set(viewerHeaders())
        .send({ householdId: HOUSEHOLD_UUID });

      expect(res.status).toBe(400);
    });

    it('rejects missing householdId', async () => {
      const res = await request(app)
        .post('/api/subscriptions/promo/redeem')
        .set(viewerHeaders())
        .send({ code: 'WELCOME2024' });

      expect(res.status).toBe(400);
    });

    it('rejects empty code', async () => {
      const res = await request(app)
        .post('/api/subscriptions/promo/redeem')
        .set(viewerHeaders())
        .send({ code: '', householdId: HOUSEHOLD_UUID });

      expect(res.status).toBe(400);
    });

    it('requires authentication', async () => {
      const res = await request(app)
        .post('/api/subscriptions/promo/redeem')
        .set(unauthHeaders())
        .send({ code: 'WELCOME2024', householdId: HOUSEHOLD_UUID });

      expect(res.status).toBe(401);
    });
  });

  // ── GET /promo ────────────────────────────────────────────

  describe('GET /api/subscriptions/promo', () => {
    it('requires admin role', async () => {
      const res = await request(app)
        .get('/api/subscriptions/promo')
        .set(editorHeaders());

      expect(res.status).toBe(403);
    });

    it('requires authentication', async () => {
      const res = await request(app)
        .get('/api/subscriptions/promo')
        .set(unauthHeaders());

      expect(res.status).toBe(401);
    });

    it('returns paginated promo list for admin', async () => {
      const res = await request(app)
        .get('/api/subscriptions/promo')
        .set(adminHeaders());

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('total');
    });
  });

  // ── POST /promo (create) ──────────────────────────────────

  describe('POST /api/subscriptions/promo', () => {
    const validPromo = {
      code: 'SUMMER2024',
      discountType: 'percent',
      discountValue: 20,
      validFrom: '2024-06-01T00:00:00.000Z',
    };

    it('requires admin role', async () => {
      const res = await request(app)
        .post('/api/subscriptions/promo')
        .set(editorHeaders())
        .send(validPromo);

      expect(res.status).toBe(403);
    });

    it('creates promo with admin role', async () => {
      const res = await request(app)
        .post('/api/subscriptions/promo')
        .set(adminHeaders())
        .send(validPromo);

      expect(res.status).toBe(201);
    });

    it('rejects invalid code format (lowercase)', async () => {
      const res = await request(app)
        .post('/api/subscriptions/promo')
        .set(adminHeaders())
        .send({ ...validPromo, code: 'lowercase' });

      expect(res.status).toBe(400);
    });

    it('rejects missing discountType', async () => {
      const res = await request(app)
        .post('/api/subscriptions/promo')
        .set(adminHeaders())
        .send({ code: 'PROMO1', discountValue: 10, validFrom: '2024-01-01T00:00:00.000Z' });

      expect(res.status).toBe(400);
    });
  });

  // ── POST /pause ───────────────────────────────────────────

  describe('POST /api/subscriptions/pause', () => {
    it('requires authentication', async () => {
      const res = await request(app)
        .post('/api/subscriptions/pause')
        .set(unauthHeaders())
        .send({ subscriptionId: VALID_UUID });

      expect(res.status).toBe(401);
    });

    it('pauses subscription with valid data', async () => {
      const res = await request(app)
        .post('/api/subscriptions/pause')
        .set(viewerHeaders())
        .send({ subscriptionId: VALID_UUID });

      expect(res.status).toBe(200);
    });

    it('rejects missing subscriptionId', async () => {
      const res = await request(app)
        .post('/api/subscriptions/pause')
        .set(viewerHeaders())
        .send({});

      expect(res.status).toBe(400);
    });
  });

  // ── POST /resume ──────────────────────────────────────────

  describe('POST /api/subscriptions/resume', () => {
    it('resumes subscription with valid data', async () => {
      const res = await request(app)
        .post('/api/subscriptions/resume')
        .set(viewerHeaders())
        .send({ subscriptionId: VALID_UUID });

      expect(res.status).toBe(200);
    });

    it('rejects missing subscriptionId', async () => {
      const res = await request(app)
        .post('/api/subscriptions/resume')
        .set(viewerHeaders())
        .send({});

      expect(res.status).toBe(400);
    });
  });
});
