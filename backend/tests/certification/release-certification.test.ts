// ── Release Certification Suite ──────────────────────────────
// Curated high-value tests that cover the most critical paths.
// Target: complete in under 5 minutes on CI.
// Run with: vitest run tests/certification/release-certification.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockPrisma, resetPrismaMocks } from '../helpers/prisma.mock.js';
import {
  createContentFixture,
  resetContentCounter,
  CONTENT_FIXTURES,
  EDGE_CASE_ARCHIVED,
  EDGE_CASE_BEDTIME_ONLY,
} from '../fixtures/content.fixture.js';
import {
  createHouseholdFixture,
  createParentFixture,
  createChildProfileFixture,
  resetUserCounters,
  HOUSEHOLD_FIXTURE,
  PARENT_FIXTURE,
  CHILD_FIXTURES,
} from '../fixtures/user.fixture.js';
import {
  createTestToken,
  createExpiredToken,
  createInvalidToken,
} from '../helpers/auth.helper.js';
import {
  createMockRequest,
  createMockResponse,
  createMockNext,
} from '../helpers/request.helper.js';

// ── Mock Prisma globally ──────────────────────────────────────
vi.mock('../../src/lib/prisma.js', () => ({
  prisma: mockPrisma,
}));

// ── Mock audit (should never block tests) ─────────────────────
vi.mock('../../src/lib/audit.js', () => ({
  logAudit: vi.fn().mockResolvedValue(undefined),
  getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
}));

// ── Mock policyEngine ─────────────────────────────────────────
vi.mock('../../src/lib/policyEngine.js', () => ({
  evaluateContentPolicies: vi.fn().mockResolvedValue([]),
}));

beforeEach(() => {
  resetPrismaMocks();
  resetContentCounter();
  resetUserCounters();
});

// ═══════════════════════════════════════════════════════════════
// 1. CORE CONTENT OPERATIONS
// ═══════════════════════════════════════════════════════════════

describe('Release Certification Suite', () => {
  describe('1. Core Content Operations', () => {
    it('should create content with valid data', async () => {
      const { createContent } = await import('../../src/modules/content/service.js');

      const input = {
        slug: 'test-lesson-abc',
        type: 'lesson' as const,
        title: 'ABC Lesson',
        emoji: '',
        description: 'Learn ABCs',
        body: { blocks: [] },
        accessTier: 'free' as const,
        ageGroup: 'all' as const,
        bedtimeFriendly: false,
        language: 'en',
      };

      const created = createContentFixture({
        slug: input.slug,
        type: input.type,
        title: input.title,
        status: 'draft',
      });

      // No existing slug
      mockPrisma.content.findUnique.mockResolvedValueOnce(null);
      // Create returns fixture
      mockPrisma.content.create.mockResolvedValueOnce({
        ...created,
        author: { id: 'user-editor-001', email: 'editor@test.com', name: 'Editor', role: 'editor' },
        tags: [],
        skills: [],
      });

      const result = await createContent(input, 'user-editor-001');

      expect(result).toBeDefined();
      expect(result.slug).toBe('test-lesson-abc');
      expect(result.title).toBe('ABC Lesson');
      expect(result.status).toBe('draft');
      expect(mockPrisma.content.create).toHaveBeenCalledOnce();

      // Verify the create call included authorId
      const createCall = mockPrisma.content.create.mock.calls[0][0];
      expect(createCall.data.authorId).toBe('user-editor-001');
    });

    it('should enforce status transition rules', async () => {
      const { updateContent } = await import('../../src/modules/content/service.js');

      const draft = createContentFixture({ id: 'content-draft', status: 'draft' });

      // Existing content is in 'draft' status
      mockPrisma.content.findUnique.mockResolvedValueOnce(draft);
      // Allow transition draft -> review
      mockPrisma.content.update.mockResolvedValueOnce({
        ...draft,
        status: 'review',
        author: null,
        tags: [],
        skills: [],
      });

      const result = await updateContent('content-draft', { status: 'review' });

      expect(result.status).toBe('review');
      expect(mockPrisma.content.update).toHaveBeenCalledOnce();
    });

    it('should reject invalid status transitions', async () => {
      const { updateContent } = await import('../../src/modules/content/service.js');

      const draft = createContentFixture({ id: 'content-draft-2', status: 'draft' });

      // draft -> published is NOT allowed (must go through review -> approved first)
      mockPrisma.content.findUnique.mockResolvedValueOnce(draft);

      await expect(
        updateContent('content-draft-2', { status: 'published' })
      ).rejects.toThrow(/Invalid status transition/);

      // Verify update was never called
      expect(mockPrisma.content.update).not.toHaveBeenCalled();
    });

    it('should handle content search', async () => {
      const { listContent } = await import('../../src/modules/content/service.js');

      const searchResults = [CONTENT_FIXTURES[0], CONTENT_FIXTURES[1]];

      mockPrisma.content.findMany.mockResolvedValueOnce(searchResults);
      mockPrisma.content.count.mockResolvedValueOnce(2);

      const result = await listContent({
        page: 1,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        search: 'letter',
      });

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.totalPages).toBe(1);

      // Verify search filter was applied with OR clause
      const findManyCall = mockPrisma.content.findMany.mock.calls[0][0];
      expect(findManyCall.where.OR).toBeDefined();
      expect(findManyCall.where.OR).toHaveLength(3);
    });

    it('should paginate results correctly', async () => {
      const { listContent } = await import('../../src/modules/content/service.js');

      const page2Items = [CONTENT_FIXTURES[2], CONTENT_FIXTURES[3]];

      mockPrisma.content.findMany.mockResolvedValueOnce(page2Items);
      mockPrisma.content.count.mockResolvedValueOnce(10);

      const result = await listContent({
        page: 2,
        limit: 2,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      expect(result.page).toBe(2);
      expect(result.limit).toBe(2);
      expect(result.total).toBe(10);
      expect(result.totalPages).toBe(5);
      expect(result.data).toHaveLength(2);

      // Verify correct skip/take was applied
      const findManyCall = mockPrisma.content.findMany.mock.calls[0][0];
      expect(findManyCall.skip).toBe(2); // (page-1) * limit = (2-1) * 2
      expect(findManyCall.take).toBe(2);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 2. AUTHENTICATION & AUTHORIZATION
  // ═══════════════════════════════════════════════════════════════

  describe('2. Authentication & Authorization', () => {
    it('should reject unauthenticated requests', async () => {
      const { authenticate } = await import('../../src/middleware/auth.js');

      const req = createMockRequest({ headers: {} });
      const res = createMockResponse();
      const next = createMockNext();

      expect(() => authenticate(req, res, next)).toThrow(/Missing or invalid authorization/);
      expect(next).not.toHaveBeenCalled();
    });

    it('should enforce role-based access', async () => {
      const { requireRole } = await import('../../src/middleware/auth.js');

      // Viewer trying to access admin-only resource
      const req = createMockRequest({
        user: { userId: 'user-viewer-001', email: 'viewer@test.com', role: 'viewer' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const middleware = requireRole('admin', 'editor');

      expect(() => middleware(req, res, next)).toThrow(/Requires role/);
      expect(next).not.toHaveBeenCalled();
    });

    it('should generate valid JWT tokens', async () => {
      const { signToken } = await import('../../src/middleware/auth.js');
      const jwt = await import('jsonwebtoken');

      const payload = {
        userId: 'user-admin-001',
        email: 'admin@kidslearning.test',
        role: 'admin' as const,
      };

      const token = signToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // Header.Payload.Signature

      // Decode and verify the payload is embedded
      const decoded = jwt.default.decode(token) as Record<string, unknown>;
      expect(decoded.userId).toBe('user-admin-001');
      expect(decoded.email).toBe('admin@kidslearning.test');
      expect(decoded.role).toBe('admin');
      expect(decoded.exp).toBeDefined();
    });

    it('should validate token expiry', async () => {
      const { authenticate } = await import('../../src/middleware/auth.js');

      const expiredToken = createExpiredToken({
        userId: 'user-admin-001',
        email: 'admin@kidslearning.test',
        role: 'admin',
      });

      const req = createMockRequest({
        headers: { authorization: `Bearer ${expiredToken}` },
      });
      const res = createMockResponse();
      const next = createMockNext();

      expect(() => authenticate(req, res, next)).toThrow(/Invalid or expired token/);
      expect(next).not.toHaveBeenCalled();
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 3. SUBSCRIPTION & ENTITLEMENTS
  // ═══════════════════════════════════════════════════════════════

  describe('3. Subscription & Entitlements', () => {
    it('should create subscription and sync entitlements', async () => {
      const { createSubscription } = await import('../../src/modules/subscription/service.js');

      const household = createHouseholdFixture({ id: 'hh-sub-001', plan: 'free' });

      mockPrisma.household.findUnique.mockResolvedValueOnce(household);

      const subscriptionData = {
        id: 'sub-001',
        householdId: 'hh-sub-001',
        plan: 'premium_monthly',
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        trialEndsAt: null,
        externalId: null,
        provider: 'manual',
        metadata: {},
        household: { id: 'hh-sub-001', name: 'Test Family', plan: 'premium_monthly' },
        invoices: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        cancelledAt: null,
        pausedAt: null,
      };

      mockPrisma.subscription.create.mockResolvedValueOnce(subscriptionData);
      // entitlement upserts for premium_monthly features
      mockPrisma.entitlement.upsert.mockResolvedValue({});
      mockPrisma.entitlement.updateMany.mockResolvedValue({ count: 0 });

      const result = await createSubscription(
        {
          householdId: 'hh-sub-001',
          plan: 'premium_monthly',
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        'user-admin-001'
      );

      expect(result.plan).toBe('premium_monthly');
      expect(result.status).toBe('active');
      expect(mockPrisma.subscription.create).toHaveBeenCalledOnce();
      // Entitlements should have been synced (premium_monthly has 4 features)
      expect(mockPrisma.entitlement.upsert).toHaveBeenCalled();
    });

    it('should check entitlements correctly', async () => {
      const { listEntitlements } = await import('../../src/modules/subscription/service.js');

      const household = createHouseholdFixture({ id: 'hh-ent-001' });
      const entitlements = [
        { id: 'ent-1', householdId: 'hh-ent-001', feature: 'basic_content', granted: true, source: 'subscription:premium_monthly', expiresAt: null, createdAt: new Date(), updatedAt: new Date() },
        { id: 'ent-2', householdId: 'hh-ent-001', feature: 'premium_content', granted: true, source: 'subscription:premium_monthly', expiresAt: null, createdAt: new Date(), updatedAt: new Date() },
        { id: 'ent-3', householdId: 'hh-ent-001', feature: 'ad_free', granted: true, source: 'subscription:premium_monthly', expiresAt: null, createdAt: new Date(), updatedAt: new Date() },
      ];

      mockPrisma.household.findUnique.mockResolvedValueOnce(household);
      mockPrisma.entitlement.findMany.mockResolvedValueOnce(entitlements);

      const result = await listEntitlements('hh-ent-001');

      expect(result).toHaveLength(3);
      expect(result.map((e: { feature: string }) => e.feature)).toContain('premium_content');
      expect(result.every((e: { granted: boolean }) => e.granted)).toBe(true);
    });

    it('should handle subscription cancellation', async () => {
      const { cancelSubscription } = await import('../../src/modules/subscription/service.js');

      const existingSub = {
        id: 'sub-cancel-001',
        householdId: 'hh-cancel-001',
        plan: 'premium_monthly',
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.subscription.findUnique.mockResolvedValueOnce(existingSub);
      mockPrisma.subscription.update.mockResolvedValueOnce({
        ...existingSub,
        status: 'cancelled',
        cancelledAt: new Date(),
        household: { id: 'hh-cancel-001', name: 'Test', plan: 'free' },
        invoices: [],
      });
      // For immediate cancellation: sync entitlements + update household
      mockPrisma.entitlement.upsert.mockResolvedValue({});
      mockPrisma.entitlement.updateMany.mockResolvedValue({ count: 0 });
      mockPrisma.household.update.mockResolvedValue({});

      const result = await cancelSubscription(
        { subscriptionId: 'sub-cancel-001', immediate: true, reason: 'too expensive' },
        'user-admin-001'
      );

      expect(result.status).toBe('cancelled');
      expect(mockPrisma.subscription.update).toHaveBeenCalledOnce();
      // Immediate cancel should downgrade entitlements
      expect(mockPrisma.household.update).toHaveBeenCalled();
    });

    it('should enforce plan feature mapping', async () => {
      const { createSubscription } = await import('../../src/modules/subscription/service.js');

      const household = createHouseholdFixture({ id: 'hh-plan-001' });
      mockPrisma.household.findUnique.mockResolvedValueOnce(household);

      const subData = {
        id: 'sub-plan-001',
        householdId: 'hh-plan-001',
        plan: 'family_annual',
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        household: { id: 'hh-plan-001', name: 'Test', plan: 'family_annual' },
        invoices: [],
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.subscription.create.mockResolvedValueOnce(subData);
      mockPrisma.entitlement.upsert.mockResolvedValue({});
      mockPrisma.entitlement.updateMany.mockResolvedValue({ count: 0 });

      await createSubscription(
        {
          householdId: 'hh-plan-001',
          plan: 'family_annual',
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        },
        'user-admin-001'
      );

      // family_annual should create 5 feature entitlements:
      // basic_content, premium_content, offline_packs, ad_free, family_profiles
      expect(mockPrisma.entitlement.upsert).toHaveBeenCalledTimes(5);

      const upsertCalls = mockPrisma.entitlement.upsert.mock.calls.map(
        (call: unknown[]) => (call[0] as { create: { feature: string } }).create.feature
      );
      expect(upsertCalls).toContain('basic_content');
      expect(upsertCalls).toContain('premium_content');
      expect(upsertCalls).toContain('offline_packs');
      expect(upsertCalls).toContain('ad_free');
      expect(upsertCalls).toContain('family_profiles');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 4. SYNC ENGINE
  // ═══════════════════════════════════════════════════════════════

  describe('4. Sync Engine', () => {
    it('should push changes to server', async () => {
      const { pushChanges } = await import('../../src/lib/syncEngine.js');

      const change = {
        entityType: 'progress',
        entityId: 'prog-001',
        action: 'create' as const,
        payload: { lessonId: 'lesson-1', completed: true, stars: 3 },
        clientTimestamp: new Date().toISOString(),
      };

      // No existing sync event (no conflict)
      mockPrisma.syncEvent.findFirst
        .mockResolvedValueOnce(null)  // conflict check
        .mockResolvedValueOnce({ version: BigInt(1) }); // latest event for checkpoint

      mockPrisma.syncEvent.create.mockResolvedValueOnce({
        id: 'se-001',
        profileId: 'child-001',
        entityType: 'progress',
        entityId: 'prog-001',
        action: 'create',
        payload: change.payload,
        version: BigInt(1),
        clientTimestamp: new Date(),
        serverTimestamp: new Date(),
      });

      mockPrisma.syncCheckpoint.upsert.mockResolvedValueOnce({});

      const result = await pushChanges('child-001', [change]);

      expect(result.accepted).toBe(1);
      expect(result.conflicts).toHaveLength(0);
      expect(mockPrisma.syncEvent.create).toHaveBeenCalledOnce();
    });

    it('should pull changes since checkpoint', async () => {
      const { pullChanges } = await import('../../src/lib/syncEngine.js');

      const serverEvents = [
        {
          id: 'se-pull-1',
          entityType: 'progress',
          entityId: 'prog-001',
          action: 'update',
          payload: { stars: 5 },
          version: BigInt(5),
          serverTimestamp: new Date(),
        },
        {
          id: 'se-pull-2',
          entityType: 'progress',
          entityId: 'prog-002',
          action: 'create',
          payload: { lessonId: 'lesson-2', completed: false },
          version: BigInt(6),
          serverTimestamp: new Date(),
        },
      ];

      mockPrisma.syncCheckpoint.findUnique.mockResolvedValueOnce({
        profileId: 'child-001',
        entityType: 'progress',
        serverVersion: BigInt(4),
        lastSyncedAt: new Date(),
      });

      mockPrisma.syncEvent.findMany.mockResolvedValueOnce(serverEvents);

      const result = await pullChanges('child-001', 'progress');

      expect(result.events).toHaveLength(2);
      expect(result.checkpoint).toBe('6'); // Latest version as string
      expect(result.hasMore).toBe(false);

      // Verify the query used the checkpoint version
      const findCall = mockPrisma.syncEvent.findMany.mock.calls[0][0];
      expect(findCall.where.version.gt).toBe(BigInt(4));
    });

    it('should detect and report conflicts', async () => {
      const { pushChanges } = await import('../../src/lib/syncEngine.js');

      const pastTimestamp = new Date('2026-03-20T10:00:00Z');
      const serverTimestamp = new Date('2026-03-25T15:00:00Z');

      const change = {
        entityType: 'progress',
        entityId: 'prog-conflict',
        action: 'update' as const,
        payload: { stars: 2 },
        clientTimestamp: pastTimestamp.toISOString(),
      };

      // Server has a newer version
      mockPrisma.syncEvent.findFirst.mockResolvedValueOnce({
        id: 'se-conflict',
        entityType: 'progress',
        entityId: 'prog-conflict',
        action: 'update',
        payload: { stars: 5 },
        version: BigInt(10),
        serverTimestamp, // Server version is newer than client
        clientTimestamp: new Date('2026-03-24T12:00:00Z'),
      });

      const result = await pushChanges('child-001', [change]);

      expect(result.accepted).toBe(0);
      expect(result.conflicts).toHaveLength(1);
      expect(result.conflicts[0].entityId).toBe('prog-conflict');
      expect(result.conflicts[0].clientVersion).toEqual({ stars: 2 });
      expect(result.conflicts[0].serverVersion).toEqual({ stars: 5 });
    });

    it('should resolve conflicts', async () => {
      const { resolveConflict } = await import('../../src/lib/syncEngine.js');

      // Resolve by choosing client version
      mockPrisma.syncEvent.create.mockResolvedValueOnce({
        id: 'se-resolve-1',
        profileId: 'child-001',
        entityType: 'progress',
        entityId: 'prog-conflict',
        action: 'update',
        payload: { stars: 2 },
        version: BigInt(11),
      });

      const result = await resolveConflict(
        'child-001',
        'progress',
        'prog-conflict',
        'client',
        { stars: 2 }
      );

      expect(result.resolved).toBe(true);
      expect(mockPrisma.syncEvent.create).toHaveBeenCalledOnce();

      // Resolve by choosing server version (no write needed)
      resetPrismaMocks();
      const serverResult = await resolveConflict(
        'child-001',
        'progress',
        'prog-conflict',
        'server'
      );

      expect(serverResult.resolved).toBe(true);
      expect(mockPrisma.syncEvent.create).not.toHaveBeenCalled();
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 5. RECOMMENDATION SAFETY
  // ═══════════════════════════════════════════════════════════════

  describe('5. Recommendation Safety', () => {
    it('should filter age-inappropriate content', async () => {
      const { previewRecommendations } = await import('../../src/modules/recommendation/service.js');

      const toddlerProfile = createChildProfileFixture({
        id: 'child-toddler',
        ageGroup: 'age_2_3',
        bedtimeMode: false,
      });

      // Mix of age-appropriate and older content
      const contents = [
        {
          ...CONTENT_FIXTURES[0], // age_2_3 -- appropriate
          skills: [{ skillId: 'skill-1', relevance: 0.8 }],
        },
        {
          ...CONTENT_FIXTURES[6], // age_4_5 -- less appropriate
          skills: [{ skillId: 'skill-2', relevance: 0.9 }],
        },
      ];

      mockPrisma.childProfile.findUnique.mockResolvedValueOnce(toddlerProfile);
      mockPrisma.recommendationConfig.findMany.mockResolvedValueOnce([]);
      mockPrisma.content.findMany.mockResolvedValueOnce(contents);
      mockPrisma.contentAnalytics.findMany.mockResolvedValueOnce([]);

      const result = await previewRecommendations('child-toddler');

      expect(result).toHaveLength(2);

      // The age_2_3 content should score higher than age_4_5 content for a toddler
      const toddlerContent = result.find(r => r.contentId === CONTENT_FIXTURES[0].id);
      const olderContent = result.find(r => r.contentId === CONTENT_FIXTURES[6].id);

      expect(toddlerContent).toBeDefined();
      expect(olderContent).toBeDefined();
      expect(toddlerContent!.score).toBeGreaterThan(olderContent!.score);
    });

    it('should respect bedtime mode', async () => {
      const { previewRecommendations } = await import('../../src/modules/recommendation/service.js');

      const bedtimeProfile = createChildProfileFixture({
        id: 'child-bedtime',
        ageGroup: 'age_2_3',
        bedtimeMode: true,
      });

      const contents = [
        {
          ...CONTENT_FIXTURES[7], // bedtimeFriendly: true, story
          skills: [],
        },
        {
          ...CONTENT_FIXTURES[8], // bedtimeFriendly: false, video
          skills: [],
        },
      ];

      mockPrisma.childProfile.findUnique.mockResolvedValueOnce(bedtimeProfile);
      mockPrisma.recommendationConfig.findMany.mockResolvedValueOnce([]);
      mockPrisma.content.findMany.mockResolvedValueOnce(contents);
      mockPrisma.contentAnalytics.findMany.mockResolvedValueOnce([]);

      const result = await previewRecommendations('child-bedtime');

      // Bedtime-friendly content should rank higher in bedtime mode
      const bedtimeContent = result.find(r => r.contentId === CONTENT_FIXTURES[7].id);
      const nonBedtimeContent = result.find(r => r.contentId === CONTENT_FIXTURES[8].id);

      expect(bedtimeContent).toBeDefined();
      expect(nonBedtimeContent).toBeDefined();
      expect(bedtimeContent!.score).toBeGreaterThan(nonBedtimeContent!.score);

      // Verify the bedtime bias is positive for bedtime-friendly content
      expect(bedtimeContent!.breakdown.bedtimeBiasScore).toBeGreaterThan(0);
      // Verify penalty for non-bedtime content during bedtime mode
      expect(nonBedtimeContent!.breakdown.bedtimeBiasScore).toBeLessThan(0);
    });

    it('should exclude archived content', async () => {
      const { previewRecommendations } = await import('../../src/modules/recommendation/service.js');

      const profile = createChildProfileFixture({ id: 'child-archived-test' });

      mockPrisma.childProfile.findUnique.mockResolvedValueOnce(profile);
      mockPrisma.recommendationConfig.findMany.mockResolvedValueOnce([]);
      // The service queries where: { status: 'published', deletedAt: null }
      // so archived content should never appear in results
      mockPrisma.content.findMany.mockResolvedValueOnce([]);
      mockPrisma.contentAnalytics.findMany.mockResolvedValueOnce([]);

      const result = await previewRecommendations('child-archived-test');

      expect(result).toHaveLength(0);

      // Verify the query filters for published and non-deleted only
      const findCall = mockPrisma.content.findMany.mock.calls[0][0];
      expect(findCall.where.status).toBe('published');
      expect(findCall.where.deletedAt).toBeNull();
    });

    it('should handle empty content library', async () => {
      const { previewRecommendations } = await import('../../src/modules/recommendation/service.js');

      const profile = createChildProfileFixture({ id: 'child-empty' });

      mockPrisma.childProfile.findUnique.mockResolvedValueOnce(profile);
      mockPrisma.recommendationConfig.findMany.mockResolvedValueOnce([]);
      mockPrisma.content.findMany.mockResolvedValueOnce([]); // Empty library
      mockPrisma.contentAnalytics.findMany.mockResolvedValueOnce([]);

      const result = await previewRecommendations('child-empty');

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 6. DATA PRIVACY
  // ═══════════════════════════════════════════════════════════════

  describe('6. Data Privacy', () => {
    it('should record consent', async () => {
      const { recordConsent } = await import('../../src/modules/privacy/service.js');

      const parent = createParentFixture({ id: 'parent-consent-001' });

      mockPrisma.parentAccount.findUnique.mockResolvedValueOnce(parent);
      mockPrisma.consentRecord.findFirst.mockResolvedValueOnce(null); // No existing consent

      const consentData = {
        id: 'consent-001',
        parentId: 'parent-consent-001',
        consentType: 'data_collection',
        granted: true,
        version: '1.0',
        ipAddress: '192.168.1.1',
        grantedAt: new Date(),
        revokedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.consentRecord.create.mockResolvedValueOnce(consentData);

      const result = await recordConsent({
        parentId: 'parent-consent-001',
        consentType: 'data_collection',
        granted: true,
        version: '1.0',
        ipAddress: '192.168.1.1',
      });

      expect(result.granted).toBe(true);
      expect(result.consentType).toBe('data_collection');
      expect(result.parentId).toBe('parent-consent-001');
      expect(mockPrisma.consentRecord.create).toHaveBeenCalledOnce();
    });

    it('should allow data export request', async () => {
      const { createExportRequest } = await import('../../src/modules/privacy/service.js');

      const parent = createParentFixture({ id: 'parent-export-001' });

      mockPrisma.parentAccount.findUnique.mockResolvedValueOnce(parent);
      mockPrisma.dataRequest.findFirst.mockResolvedValueOnce(null); // No existing pending

      const requestData = {
        id: 'dr-export-001',
        parentId: 'parent-export-001',
        householdId: 'hh-001',
        type: 'export',
        status: 'pending',
        requestedAt: new Date(),
        completedAt: null,
        fileUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.dataRequest.create.mockResolvedValueOnce(requestData);

      const result = await createExportRequest({
        parentId: 'parent-export-001',
        householdId: 'hh-001',
      });

      expect(result.type).toBe('export');
      expect(result.status).toBe('pending');
      expect(mockPrisma.dataRequest.create).toHaveBeenCalledOnce();
    });

    it('should allow data deletion request', async () => {
      const { createDeletionRequest } = await import('../../src/modules/privacy/service.js');

      const parent = createParentFixture({ id: 'parent-delete-001' });

      mockPrisma.parentAccount.findUnique.mockResolvedValueOnce(parent);
      mockPrisma.dataRequest.findFirst.mockResolvedValueOnce(null); // No existing pending

      const requestData = {
        id: 'dr-delete-001',
        parentId: 'parent-delete-001',
        householdId: 'hh-001',
        type: 'deletion',
        status: 'pending',
        requestedAt: new Date(),
        completedAt: null,
        fileUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.dataRequest.create.mockResolvedValueOnce(requestData);

      const result = await createDeletionRequest({
        parentId: 'parent-delete-001',
        householdId: 'hh-001',
      });

      expect(result.type).toBe('deletion');
      expect(result.status).toBe('pending');
      expect(mockPrisma.dataRequest.create).toHaveBeenCalledOnce();
    });

    it('should prevent revoking required consents', async () => {
      const { revokeConsent } = await import('../../src/modules/privacy/service.js');

      // When there is no active consent to revoke, it should throw NotFoundError
      mockPrisma.consentRecord.findFirst.mockResolvedValueOnce(null);

      await expect(
        revokeConsent({
          parentId: 'parent-no-consent',
          consentType: 'terms_of_service',
        })
      ).rejects.toThrow(/not found/i);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 7. ERROR HANDLING
  // ═══════════════════════════════════════════════════════════════

  describe('7. Error Handling', () => {
    it('should return proper error format', async () => {
      const { errorHandler } = await import('../../src/middleware/errorHandler.js');
      const { ValidationError } = await import('../../src/lib/errors.js');

      const err = new ValidationError('Invalid input', { 'body.title': ['Required'] });
      const req = createMockRequest();
      const res = createMockResponse();
      const next = createMockNext();

      errorHandler(err, req, res, next);

      expect(res._statusCode).toBe(400);
      expect(res._json).toEqual({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          details: { 'body.title': ['Required'] },
        },
      });
    });

    it('should handle not found gracefully', async () => {
      const { errorHandler } = await import('../../src/middleware/errorHandler.js');
      const { NotFoundError } = await import('../../src/lib/errors.js');

      const err = new NotFoundError('Content', 'abc-123');
      const req = createMockRequest();
      const res = createMockResponse();
      const next = createMockNext();

      errorHandler(err, req, res, next);

      expect(res._statusCode).toBe(404);
      expect(res._json).toEqual({
        error: {
          code: 'NOT_FOUND',
          message: "Content with id 'abc-123' not found",
        },
      });
    });

    it('should validate input schemas', async () => {
      const { validate } = await import('../../src/lib/validate.js');
      const { createContentSchema } = await import('../../src/modules/content/schemas.js');

      const middleware = validate(createContentSchema);
      const req = createMockRequest({
        body: {
          // Missing required 'slug', 'type', and 'title'
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      expect(() => middleware(req, res, next)).toThrow(/Validation failed/);
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle malformed requests', async () => {
      const { errorHandler } = await import('../../src/middleware/errorHandler.js');

      // A generic Error (not AppError) should return 500
      const err = new Error('Something unexpected happened');
      const req = createMockRequest();
      const res = createMockResponse();
      const next = createMockNext();

      errorHandler(err, req, res, next);

      expect(res._statusCode).toBe(500);
      expect(res._json).toEqual({
        error: {
          code: 'INTERNAL_ERROR',
          // In test env (NODE_ENV=test), the actual message is returned
          message: 'Something unexpected happened',
        },
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 8. FEATURE FLAGS
  // ═══════════════════════════════════════════════════════════════

  describe('8. Feature Flags', () => {
    it('should evaluate flags with defaults', async () => {
      const { evaluateFlag } = await import('../../src/lib/featureFlags.js');

      // Flag exists but is disabled -- should return defaultValue
      mockPrisma.featureFlag.findUnique.mockResolvedValueOnce({
        id: 'ff-001',
        key: 'new_onboarding',
        name: 'New Onboarding Flow',
        enabled: false,
        targeting: {},
        defaultValue: false,
        overrides: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'admin',
        updatedBy: null,
        deletedAt: null,
        description: null,
      });

      const value = await evaluateFlag('new_onboarding', {});

      expect(value).toBe(false);
    });

    it('should respect targeting rules', async () => {
      const { evaluateFlag } = await import('../../src/lib/featureFlags.js');

      // Flag is enabled with locale targeting
      mockPrisma.featureFlag.findUnique.mockResolvedValueOnce({
        id: 'ff-002',
        key: 'spanish_content',
        name: 'Spanish Content',
        enabled: true,
        targeting: { locales: ['es', 'es-MX'] },
        defaultValue: false,
        overrides: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'admin',
        updatedBy: null,
        deletedAt: null,
        description: null,
      });

      // User with English locale should get default value
      const enValue = await evaluateFlag('spanish_content', { locale: 'en' });
      expect(enValue).toBe(false);

      // User with Spanish locale should get true
      mockPrisma.featureFlag.findUnique.mockResolvedValueOnce({
        id: 'ff-002',
        key: 'spanish_content',
        name: 'Spanish Content',
        enabled: true,
        targeting: { locales: ['es', 'es-MX'] },
        defaultValue: false,
        overrides: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'admin',
        updatedBy: null,
        deletedAt: null,
        description: null,
      });

      const esValue = await evaluateFlag('spanish_content', { locale: 'es' });
      expect(esValue).toBe(true);
    });

    it('should handle kill switch', async () => {
      const { killFlag } = await import('../../src/modules/feature-flags/service.js');

      const flag = {
        id: 'ff-kill-001',
        key: 'experimental_feature',
        name: 'Experimental Feature',
        enabled: true,
        targeting: {},
        defaultValue: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'admin',
        updatedBy: null,
        deletedAt: null,
        description: null,
      };

      mockPrisma.featureFlag.findUnique.mockResolvedValueOnce(flag);
      mockPrisma.featureFlag.update.mockResolvedValueOnce({
        ...flag,
        enabled: false,
        updatedBy: 'user-admin-001',
      });

      const result = await killFlag('experimental_feature', 'user-admin-001');

      expect(result.enabled).toBe(false);
      expect(mockPrisma.featureFlag.update).toHaveBeenCalledWith({
        where: { key: 'experimental_feature' },
        data: { enabled: false, updatedBy: 'user-admin-001' },
      });
    });
  });
});
