// ── Response Shape Contract Tests ──────────────────────────
// Verify that API response shapes are backward-compatible.
// These tests define the expected "contract" that frontend
// clients depend on. If a shape changes, these tests catch it.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import {
  createTestApp,
  adminHeaders,
  editorHeaders,
  viewerHeaders,
} from '../helpers/supertest.helper.js';

// ── Mock all services ────────────────────────────────────────

vi.mock('../../src/modules/content/service.js', () => ({
  listContent: vi.fn(),
  getContent: vi.fn(),
  createContent: vi.fn(),
  updateContent: vi.fn(),
  archiveContent: vi.fn(),
  addTags: vi.fn(),
  removeTag: vi.fn(),
  getContentHistory: vi.fn(),
  duplicateContent: vi.fn(),
  listContentSkills: vi.fn(),
  addSkills: vi.fn(),
  removeSkill: vi.fn(),
  getRefreshQueue: vi.fn(),
  getLifecycleStats: vi.fn(),
  updateLifecycle: vi.fn(),
  markRefreshed: vi.fn(),
  getPipelineEvents: vi.fn(),
  recordPipelineEvent: vi.fn(),
  checkPolicies: vi.fn(),
  getPolicyResults: vi.fn(),
}));

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

vi.mock('../../src/modules/feature-flags/service.js', () => ({
  listFlags: vi.fn(),
  getFlag: vi.fn(),
  createFlag: vi.fn(),
  updateFlag: vi.fn(),
  deleteFlag: vi.fn(),
  killFlag: vi.fn(),
  evaluateBatch: vi.fn(),
  evaluateSingle: vi.fn(),
}));

vi.mock('../../src/modules/analytics/service.js', () => ({
  recordEvent: vi.fn(),
  getContentAnalytics: vi.fn(),
  getDashboard: vi.fn(),
  getTopContent: vi.fn(),
  getEngagement: vi.fn(),
  aggregateAnalytics: vi.fn(),
  exportCSV: vi.fn(),
  getSLADashboard: vi.fn(),
  getSLAPipelineFunnel: vi.fn(),
  getSLABottlenecks: vi.fn(),
  getSLAAging: vi.fn(),
}));

vi.mock('../../src/lib/queue.js', () => ({
  analyticsQueue: { add: vi.fn() },
}));

import * as contentService from '../../src/modules/content/service.js';
import * as subscriptionService from '../../src/modules/subscription/service.js';
import * as flagsService from '../../src/modules/feature-flags/service.js';
import * as analyticsService from '../../src/modules/analytics/service.js';

import contentRouter from '../../src/modules/content/router.js';
import { router as subscriptionRouter } from '../../src/modules/subscription/router.js';
import { router as flagsRouter } from '../../src/modules/feature-flags/router.js';
import analyticsRouter from '../../src/modules/analytics/router.js';

const app = createTestApp(
  { path: '/api/content', router: contentRouter },
  { path: '/api/subscriptions', router: subscriptionRouter },
  { path: '/api/feature-flags', router: flagsRouter },
  { path: '/api/analytics', router: analyticsRouter },
);

// ── Test data ────────────────────────────────────────────────

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';
const HOUSEHOLD_UUID = '660e8400-e29b-41d4-a716-446655440001';

const FULL_CONTENT_ITEM = {
  id: VALID_UUID,
  title: 'Learn Colors',
  slug: 'learn-colors',
  type: 'color',
  status: 'published',
  ageGroup: 'age_3_4',
  difficulty: 'easy',
  accessTier: 'free',
  emoji: '',
  description: 'Learn about colors',
  body: {},
  durationMinutes: 10,
  route: '/colors',
  language: 'en',
  bedtimeFriendly: false,
  version: 1,
  publishedAt: '2024-01-15T00:00:00.000Z',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-15T00:00:00.000Z',
};

const FULL_SUBSCRIPTION = {
  id: VALID_UUID,
  householdId: HOUSEHOLD_UUID,
  plan: 'premium_monthly',
  status: 'active',
  currentPeriodStart: '2024-01-01T00:00:00.000Z',
  currentPeriodEnd: '2024-02-01T00:00:00.000Z',
  trialEndsAt: null,
  cancelledAt: null,
  pausedAt: null,
  externalId: 'sub_ext_123',
  provider: 'stripe',
  metadata: {},
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

// ── Tests ────────────────────────────────────────────────────

describe('Response Shape Contracts', () => {
  beforeEach(() => {
    // Content
    vi.mocked(contentService.listContent).mockResolvedValue({
      data: [FULL_CONTENT_ITEM],
      total: 1,
      page: 1,
      pageSize: 20,
    } as never);
    vi.mocked(contentService.getContent).mockResolvedValue(FULL_CONTENT_ITEM as never);

    // Subscription
    vi.mocked(subscriptionService.listSubscriptions).mockResolvedValue({
      data: [FULL_SUBSCRIPTION],
      total: 1,
      page: 1,
      pageSize: 20,
    } as never);
    vi.mocked(subscriptionService.getSubscription).mockResolvedValue(FULL_SUBSCRIPTION as never);
    vi.mocked(subscriptionService.listEntitlements).mockResolvedValue([
      {
        id: VALID_UUID,
        householdId: HOUSEHOLD_UUID,
        feature: 'premium_content',
        enabled: true,
        expiresAt: '2024-02-01T00:00:00.000Z',
      },
    ] as never);

    // Feature flags
    vi.mocked(flagsService.evaluateSingle).mockResolvedValue({
      key: 'new-home-screen',
      value: true,
    } as never);
    vi.mocked(flagsService.evaluateBatch).mockResolvedValue([
      { key: 'new-home-screen', value: true },
      { key: 'dark-mode', value: false },
    ] as never);

    // Analytics
    vi.mocked(analyticsService.getDashboard).mockResolvedValue({
      totalViews: 1234,
      totalCompletions: 567,
      avgTimeMs: 45000,
      topContent: [],
      recentActivity: [],
    } as never);
  });

  // ── Content List Response ─────────────────────────────────

  describe('Content List Response', () => {
    it('conforms to { data: ContentItem[], total: number, page: number, pageSize: number }', async () => {
      const res = await request(app).get('/api/content');

      expect(res.status).toBe(200);

      // Top-level pagination envelope
      expect(res.body).toEqual(expect.objectContaining({
        data: expect.any(Array),
        total: expect.any(Number),
        page: expect.any(Number),
        pageSize: expect.any(Number),
      }));

      // Each item has required fields
      const item = res.body.data[0];
      expect(item).toEqual(expect.objectContaining({
        id: expect.any(String),
        title: expect.any(String),
        slug: expect.any(String),
        type: expect.any(String),
        status: expect.any(String),
        ageGroup: expect.any(String),
      }));
    });
  });

  // ── Content Detail Response ───────────────────────────────

  describe('Content Detail Response', () => {
    it('includes all required fields', async () => {
      const res = await request(app).get(`/api/content/${VALID_UUID}`);

      expect(res.status).toBe(200);

      const requiredFields = [
        'id', 'title', 'slug', 'type', 'status',
        'ageGroup', 'difficulty', 'createdAt', 'updatedAt',
      ];

      for (const field of requiredFields) {
        expect(res.body).toHaveProperty(field);
      }
    });

    it('has correct types for all required fields', async () => {
      const res = await request(app).get(`/api/content/${VALID_UUID}`);

      expect(typeof res.body.id).toBe('string');
      expect(typeof res.body.title).toBe('string');
      expect(typeof res.body.slug).toBe('string');
      expect(typeof res.body.type).toBe('string');
      expect(typeof res.body.status).toBe('string');
      expect(typeof res.body.ageGroup).toBe('string');
      expect(typeof res.body.createdAt).toBe('string');
      expect(typeof res.body.updatedAt).toBe('string');
    });
  });

  // ── Error Response ────────────────────────────────────────

  describe('Error Response', () => {
    it('validation errors conform to { error: { code, message, details? } }', async () => {
      const res = await request(app).get('/api/content/not-a-uuid');

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toHaveProperty('code');
      expect(res.body.error).toHaveProperty('message');
      expect(typeof res.body.error.code).toBe('string');
      expect(typeof res.body.error.message).toBe('string');
    });

    it('validation error includes details object', async () => {
      const res = await request(app).get('/api/content/not-a-uuid');

      expect(res.body.error).toHaveProperty('details');
      expect(typeof res.body.error.details).toBe('object');
    });

    it('auth errors conform to { error: { code, message } }', async () => {
      const res = await request(app)
        .get('/api/analytics/dashboard');

      expect(res.status).toBe(401);
      expect(res.body.error).toEqual(expect.objectContaining({
        code: expect.any(String),
        message: expect.any(String),
      }));
    });

    it('forbidden errors conform to { error: { code, message } }', async () => {
      const res = await request(app)
        .get('/api/subscriptions')
        .set(viewerHeaders());

      expect(res.status).toBe(403);
      expect(res.body.error).toEqual(expect.objectContaining({
        code: 'FORBIDDEN',
        message: expect.any(String),
      }));
    });
  });

  // ── Paginated Response (Generic) ──────────────────────────

  describe('Paginated Response Contract', () => {
    it('content list follows pagination contract', async () => {
      const res = await request(app).get('/api/content');

      expect(res.body.data).toBeInstanceOf(Array);
      expect(Number.isInteger(res.body.total)).toBe(true);
      expect(Number.isInteger(res.body.page)).toBe(true);
      expect(Number.isInteger(res.body.pageSize)).toBe(true);
      expect(res.body.total).toBeGreaterThanOrEqual(0);
      expect(res.body.page).toBeGreaterThanOrEqual(1);
      expect(res.body.pageSize).toBeGreaterThanOrEqual(1);
    });

    it('subscription list follows pagination contract', async () => {
      const res = await request(app)
        .get('/api/subscriptions')
        .set(adminHeaders());

      expect(res.body.data).toBeInstanceOf(Array);
      expect(Number.isInteger(res.body.total)).toBe(true);
      expect(Number.isInteger(res.body.page)).toBe(true);
      expect(Number.isInteger(res.body.pageSize)).toBe(true);
    });
  });

  // ── Subscription Response ─────────────────────────────────

  describe('Subscription Response', () => {
    it('subscription detail includes required fields', async () => {
      const res = await request(app)
        .get(`/api/subscriptions/${VALID_UUID}`)
        .set(viewerHeaders());

      expect(res.status).toBe(200);

      const requiredFields = [
        'id', 'householdId', 'plan', 'status',
        'currentPeriodStart', 'currentPeriodEnd',
        'provider', 'createdAt', 'updatedAt',
      ];

      for (const field of requiredFields) {
        expect(res.body).toHaveProperty(field);
      }
    });

    it('entitlements response is an array', async () => {
      const res = await request(app)
        .get(`/api/subscriptions/entitlements/${HOUSEHOLD_UUID}`)
        .set(viewerHeaders());

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);

      if (res.body.length > 0) {
        const entitlement = res.body[0];
        expect(entitlement).toHaveProperty('feature');
        expect(entitlement).toHaveProperty('enabled');
      }
    });
  });

  // ── Analytics Dashboard Response ──────────────────────────

  describe('Analytics Dashboard Response', () => {
    it('returns { data } wrapper with dashboard metrics', async () => {
      const res = await request(app)
        .get('/api/analytics/dashboard')
        .set(viewerHeaders());

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(typeof res.body.data).toBe('object');
    });
  });

  // ── Feature Flag Evaluation Response ──────────────────────

  describe('Feature Flag Evaluation Response', () => {
    it('single evaluation returns { data: { key, value } }', async () => {
      const res = await request(app)
        .get('/api/feature-flags/evaluate/new-home-screen');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('key');
      expect(res.body.data).toHaveProperty('value');
      expect(typeof res.body.data.key).toBe('string');
    });

    it('batch evaluation returns { data: Array<{ key, value }> }', async () => {
      const res = await request(app)
        .post('/api/feature-flags/evaluate')
        .set('Content-Type', 'application/json')
        .send({
          keys: ['new-home-screen', 'dark-mode'],
          context: {},
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);

      for (const evaluation of res.body.data) {
        expect(evaluation).toHaveProperty('key');
        expect(evaluation).toHaveProperty('value');
        expect(typeof evaluation.key).toBe('string');
      }
    });
  });
});
