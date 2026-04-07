// ── Validation Schema Contract Tests ──────────────────────
// Tests all Zod schemas directly, verifying that valid payloads
// pass and invalid payloads fail with correct error details.
// These tests do not spin up Express; they exercise the schemas
// in isolation for fast, focused contract verification.

import { describe, it, expect } from 'vitest';

// ── Content Schemas ──────────────────────────────────────────
import {
  listContentSchema,
  getContentSchema,
  createContentSchema,
  updateContentSchema,
  deleteContentSchema,
  addTagsSchema,
  historySchema,
  duplicateContentSchema,
  addSkillsSchema,
  updateLifecycleSchema,
  recordPipelineEventSchema,
  contentTypeEnum,
  contentStatusEnum,
  accessTierEnum,
  ageGroupEnum,
  difficultyEnum,
  energyLevelEnum,
} from '../../src/modules/content/schemas.js';

// ── Subscription Schemas ─────────────────────────────────────
import {
  checkoutSchema,
  cancelSubscriptionSchema,
  webhookSchema,
  listEntitlementsSchema,
  redeemPromoSchema,
  createPromoSchema,
  listSubscriptionsSchema,
  subscriptionPlanEnum,
  subStatusEnum,
  discountTypeEnum,
} from '../../src/modules/subscription/schemas.js';

// ── Sync Schemas ─────────────────────────────────────────────
import {
  pushChangesSchema,
  pullChangesSchema,
  syncStatusSchema,
  resolveConflictSchema,
  resetCheckpointSchema,
} from '../../src/modules/sync/schemas.js';

// ── Analytics Schemas ────────────────────────────────────────
import {
  recordEventSchema,
  contentAnalyticsSchema,
  dashboardSchema,
  topContentSchema,
} from '../../src/modules/analytics/schemas.js';

// ── Feature Flags Schemas ────────────────────────────────────
import {
  listFlagsSchema,
  createFlagSchema,
  updateFlagSchema,
  evaluateBatchSchema,
  evaluateSingleSchema,
} from '../../src/modules/feature-flags/schemas.js';

// ── Helper ───────────────────────────────────────────────────

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';

function expectSuccess(schema: { safeParse: (v: unknown) => { success: boolean } }, data: unknown) {
  const result = schema.safeParse(data);
  expect(result.success).toBe(true);
}

function expectFailure(
  schema: { safeParse: (v: unknown) => { success: boolean; error?: { issues: Array<{ path: Array<string | number>; message: string }> } } },
  data: unknown,
  pathPrefix?: string
) {
  const result = schema.safeParse(data);
  expect(result.success).toBe(false);
  if (pathPrefix && !result.success && result.error) {
    const hasMatchingPath = result.error.issues.some(
      (issue) => issue.path.join('.').startsWith(pathPrefix)
    );
    expect(hasMatchingPath).toBe(true);
  }
}

// ══════════════════════════════════════════════════════════════
// ── CONTENT SCHEMAS ──────────────────────────────────────────
// ══════════════════════════════════════════════════════════════

describe('Content Schemas', () => {

  // ── Enums ─────────────────────────────────────────────────

  describe('Content Enums', () => {
    it('contentTypeEnum accepts all valid types', () => {
      const validTypes = [
        'alphabet', 'number', 'color', 'shape', 'animal', 'bodypart',
        'lesson', 'story', 'video', 'game', 'audio', 'cooking',
        'movement', 'homeactivity', 'explorer', 'lifeskill', 'coloring',
        'emotion', 'quiz', 'collection', 'playlist',
      ];
      for (const type of validTypes) {
        expect(contentTypeEnum.safeParse(type).success).toBe(true);
      }
    });

    it('contentTypeEnum rejects invalid types', () => {
      expect(contentTypeEnum.safeParse('invalid').success).toBe(false);
      expect(contentTypeEnum.safeParse('').success).toBe(false);
      expect(contentTypeEnum.safeParse(123).success).toBe(false);
    });

    it('contentStatusEnum accepts all valid statuses', () => {
      const validStatuses = ['draft', 'review', 'approved', 'scheduled', 'published', 'archived'];
      for (const status of validStatuses) {
        expect(contentStatusEnum.safeParse(status).success).toBe(true);
      }
    });

    it('contentStatusEnum rejects invalid statuses', () => {
      expect(contentStatusEnum.safeParse('pending').success).toBe(false);
    });

    it('accessTierEnum accepts free and premium', () => {
      expect(accessTierEnum.safeParse('free').success).toBe(true);
      expect(accessTierEnum.safeParse('premium').success).toBe(true);
      expect(accessTierEnum.safeParse('enterprise').success).toBe(false);
    });

    it('ageGroupEnum accepts all valid groups', () => {
      const validGroups = ['age_2_3', 'age_3_4', 'age_4_5', 'age_5_6', 'all'];
      for (const group of validGroups) {
        expect(ageGroupEnum.safeParse(group).success).toBe(true);
      }
    });

    it('difficultyEnum accepts easy, medium, hard', () => {
      expect(difficultyEnum.safeParse('easy').success).toBe(true);
      expect(difficultyEnum.safeParse('medium').success).toBe(true);
      expect(difficultyEnum.safeParse('hard').success).toBe(true);
      expect(difficultyEnum.safeParse('extreme').success).toBe(false);
    });

    it('energyLevelEnum accepts calm, moderate, active', () => {
      expect(energyLevelEnum.safeParse('calm').success).toBe(true);
      expect(energyLevelEnum.safeParse('moderate').success).toBe(true);
      expect(energyLevelEnum.safeParse('active').success).toBe(true);
      expect(energyLevelEnum.safeParse('hyperactive').success).toBe(false);
    });
  });

  // ── listContentSchema ─────────────────────────────────────

  describe('listContentSchema', () => {
    it('accepts valid query with defaults', () => {
      expectSuccess(listContentSchema, { query: {} });
    });

    it('accepts all filter parameters', () => {
      expectSuccess(listContentSchema, {
        query: {
          page: '2',
          limit: '10',
          sortBy: 'title',
          sortOrder: 'asc',
          type: 'story',
          status: 'published',
          ageGroup: 'age_3_4',
          accessTier: 'free',
          difficulty: 'easy',
          energyLevel: 'calm',
          search: 'alphabet',
          authorId: VALID_UUID,
        },
      });
    });

    it('rejects page less than 1', () => {
      expectFailure(listContentSchema, { query: { page: '0' } }, 'query.page');
    });

    it('rejects limit greater than 100', () => {
      expectFailure(listContentSchema, { query: { limit: '101' } }, 'query.limit');
    });

    it('rejects invalid sortBy', () => {
      expectFailure(listContentSchema, { query: { sortBy: 'invalid' } }, 'query.sortBy');
    });

    it('coerces string numbers to integers', () => {
      const result = listContentSchema.safeParse({ query: { page: '3', limit: '15' } });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.query.page).toBe(3);
        expect(result.data.query.limit).toBe(15);
      }
    });
  });

  // ── getContentSchema ──────────────────────────────────────

  describe('getContentSchema', () => {
    it('accepts valid UUID param', () => {
      expectSuccess(getContentSchema, { params: { id: VALID_UUID } });
    });

    it('rejects non-UUID id', () => {
      expectFailure(getContentSchema, { params: { id: 'bad-id' } }, 'params.id');
    });
  });

  // ── createContentSchema ───────────────────────────────────

  describe('createContentSchema', () => {
    const validBody = {
      title: 'Test Content',
      slug: 'test-content',
      type: 'lesson',
    };

    it('accepts minimal valid payload with defaults applied', () => {
      const result = createContentSchema.safeParse({ body: validBody });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.body.emoji).toBe('');
        expect(result.data.body.description).toBe('');
        expect(result.data.body.accessTier).toBe('free');
        expect(result.data.body.ageGroup).toBe('all');
        expect(result.data.body.bedtimeFriendly).toBe(false);
        expect(result.data.body.language).toBe('en');
      }
    });

    it('accepts full payload with all optional fields', () => {
      expectSuccess(createContentSchema, {
        body: {
          ...validBody,
          emoji: '1',
          description: 'A test lesson',
          body: { content: 'data' },
          accessTier: 'premium',
          ageGroup: 'age_4_5',
          difficulty: 'medium',
          energyLevel: 'moderate',
          durationMinutes: 30,
          route: '/lessons/test',
          scheduledAt: '2024-06-01T00:00:00.000Z',
          mood: 'happy',
          bedtimeFriendly: true,
          language: 'en',
          skills: [{ skillId: VALID_UUID, relevance: 0.8 }],
        },
      });
    });

    it('rejects missing title', () => {
      expectFailure(createContentSchema, { body: { slug: 'test', type: 'lesson' } }, 'body.title');
    });

    it('rejects missing slug', () => {
      expectFailure(createContentSchema, { body: { title: 'Test', type: 'lesson' } }, 'body.slug');
    });

    it('rejects missing type', () => {
      expectFailure(createContentSchema, { body: { title: 'Test', slug: 'test' } }, 'body.type');
    });

    it('rejects invalid slug format', () => {
      expectFailure(createContentSchema, {
        body: { ...validBody, slug: 'Has Spaces' },
      }, 'body.slug');
    });

    it('rejects title exceeding max length', () => {
      expectFailure(createContentSchema, {
        body: { ...validBody, title: 'x'.repeat(301) },
      }, 'body.title');
    });

    it('rejects durationMinutes greater than 180', () => {
      expectFailure(createContentSchema, {
        body: { ...validBody, durationMinutes: 200 },
      }, 'body.durationMinutes');
    });

    it('rejects skill relevance outside 0-1 range', () => {
      expectFailure(createContentSchema, {
        body: { ...validBody, skills: [{ skillId: VALID_UUID, relevance: 1.5 }] },
      }, 'body.skills');
    });
  });

  // ── updateContentSchema ───────────────────────────────────

  describe('updateContentSchema', () => {
    it('accepts valid update with one field', () => {
      expectSuccess(updateContentSchema, {
        params: { id: VALID_UUID },
        body: { title: 'Updated Title' },
      });
    });

    it('rejects empty body (refinement: at least one field)', () => {
      expectFailure(updateContentSchema, {
        params: { id: VALID_UUID },
        body: {},
      });
    });

    it('accepts nullable fields set to null', () => {
      expectSuccess(updateContentSchema, {
        params: { id: VALID_UUID },
        body: { difficulty: null, energyLevel: null },
      });
    });

    it('rejects non-UUID id', () => {
      expectFailure(updateContentSchema, {
        params: { id: 'bad' },
        body: { title: 'Updated' },
      }, 'params.id');
    });
  });

  // ── deleteContentSchema ───────────────────────────────────

  describe('deleteContentSchema', () => {
    it('accepts valid UUID', () => {
      expectSuccess(deleteContentSchema, { params: { id: VALID_UUID } });
    });

    it('rejects non-UUID', () => {
      expectFailure(deleteContentSchema, { params: { id: 'bad' } });
    });
  });

  // ── addTagsSchema ─────────────────────────────────────────

  describe('addTagsSchema', () => {
    it('accepts valid tagIds array', () => {
      expectSuccess(addTagsSchema, {
        params: { id: VALID_UUID },
        body: { tagIds: [VALID_UUID] },
      });
    });

    it('rejects empty tagIds array (min 1)', () => {
      expectFailure(addTagsSchema, {
        params: { id: VALID_UUID },
        body: { tagIds: [] },
      }, 'body.tagIds');
    });

    it('rejects more than 20 tagIds', () => {
      const tooMany = Array.from({ length: 21 }, () => VALID_UUID);
      expectFailure(addTagsSchema, {
        params: { id: VALID_UUID },
        body: { tagIds: tooMany },
      }, 'body.tagIds');
    });

    it('rejects non-UUID tagIds', () => {
      expectFailure(addTagsSchema, {
        params: { id: VALID_UUID },
        body: { tagIds: ['not-uuid'] },
      });
    });
  });

  // ── historySchema ─────────────────────────────────────────

  describe('historySchema', () => {
    it('accepts valid params with query defaults', () => {
      const result = historySchema.safeParse({
        params: { id: VALID_UUID },
        query: {},
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.query.page).toBe(1);
        expect(result.data.query.limit).toBe(10);
      }
    });

    it('rejects limit greater than 50', () => {
      expectFailure(historySchema, {
        params: { id: VALID_UUID },
        query: { limit: '51' },
      }, 'query.limit');
    });
  });

  // ── duplicateContentSchema ────────────────────────────────

  describe('duplicateContentSchema', () => {
    it('accepts empty body (defaults to {})', () => {
      const result = duplicateContentSchema.safeParse({
        params: { id: VALID_UUID },
      });
      expect(result.success).toBe(true);
    });

    it('accepts optional newSlug and newTitle', () => {
      expectSuccess(duplicateContentSchema, {
        params: { id: VALID_UUID },
        body: { newSlug: 'new-slug', newTitle: 'New Title' },
      });
    });
  });

  // ── addSkillsSchema ───────────────────────────────────────

  describe('addSkillsSchema', () => {
    it('accepts valid skills array', () => {
      expectSuccess(addSkillsSchema, {
        params: { id: VALID_UUID },
        body: { skills: [{ skillId: VALID_UUID, relevance: 0.8 }] },
      });
    });

    it('applies default relevance of 1.0', () => {
      const result = addSkillsSchema.safeParse({
        params: { id: VALID_UUID },
        body: { skills: [{ skillId: VALID_UUID }] },
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.body.skills[0].relevance).toBe(1.0);
      }
    });

    it('rejects empty skills array', () => {
      expectFailure(addSkillsSchema, {
        params: { id: VALID_UUID },
        body: { skills: [] },
      });
    });
  });

  // ── updateLifecycleSchema ─────────────────────────────────

  describe('updateLifecycleSchema', () => {
    it('accepts valid lifecycle update', () => {
      expectSuccess(updateLifecycleSchema, {
        params: { id: VALID_UUID },
        body: { freshnessScore: 0.9, needsRefresh: false },
      });
    });

    it('rejects empty body', () => {
      expectFailure(updateLifecycleSchema, {
        params: { id: VALID_UUID },
        body: {},
      });
    });

    it('rejects freshnessScore outside 0-1 range', () => {
      expectFailure(updateLifecycleSchema, {
        params: { id: VALID_UUID },
        body: { freshnessScore: 1.5 },
      });
    });
  });

  // ── recordPipelineEventSchema ─────────────────────────────

  describe('recordPipelineEventSchema', () => {
    it('accepts valid stage and action', () => {
      expectSuccess(recordPipelineEventSchema, {
        params: { id: VALID_UUID },
        body: { stage: 'draft', action: 'entered' },
      });
    });

    it('validates all stage enum values', () => {
      const stages = ['draft', 'review', 'approval', 'publish', 'translation', 'asset', 'voice'];
      for (const stage of stages) {
        expectSuccess(recordPipelineEventSchema, {
          params: { id: VALID_UUID },
          body: { stage, action: 'entered' },
        });
      }
    });

    it('validates all action enum values', () => {
      for (const action of ['entered', 'exited']) {
        expectSuccess(recordPipelineEventSchema, {
          params: { id: VALID_UUID },
          body: { stage: 'draft', action },
        });
      }
    });

    it('rejects invalid stage', () => {
      expectFailure(recordPipelineEventSchema, {
        params: { id: VALID_UUID },
        body: { stage: 'invalid', action: 'entered' },
      }, 'body.stage');
    });

    it('rejects invalid action', () => {
      expectFailure(recordPipelineEventSchema, {
        params: { id: VALID_UUID },
        body: { stage: 'draft', action: 'skipped' },
      }, 'body.action');
    });
  });
});

// ══════════════════════════════════════════════════════════════
// ── SUBSCRIPTION SCHEMAS ─────────────────────────────────────
// ══════════════════════════════════════════════════════════════

describe('Subscription Schemas', () => {

  describe('Subscription Enums', () => {
    it('subscriptionPlanEnum accepts all valid plans', () => {
      const plans = ['free', 'trial', 'premium_monthly', 'premium_annual', 'family_monthly', 'family_annual', 'promo'];
      for (const plan of plans) {
        expect(subscriptionPlanEnum.safeParse(plan).success).toBe(true);
      }
      expect(subscriptionPlanEnum.safeParse('enterprise').success).toBe(false);
    });

    it('subStatusEnum accepts all valid statuses', () => {
      const statuses = ['active', 'trialing', 'past_due', 'cancelled', 'expired', 'paused'];
      for (const status of statuses) {
        expect(subStatusEnum.safeParse(status).success).toBe(true);
      }
    });

    it('discountTypeEnum accepts percent and fixed', () => {
      expect(discountTypeEnum.safeParse('percent').success).toBe(true);
      expect(discountTypeEnum.safeParse('fixed').success).toBe(true);
      expect(discountTypeEnum.safeParse('bogo').success).toBe(false);
    });
  });

  describe('checkoutSchema', () => {
    it('accepts valid checkout payload', () => {
      expectSuccess(checkoutSchema, {
        body: { householdId: VALID_UUID, plan: 'premium_monthly' },
      });
    });

    it('rejects missing householdId', () => {
      expectFailure(checkoutSchema, {
        body: { plan: 'premium_monthly' },
      }, 'body.householdId');
    });

    it('rejects missing plan', () => {
      expectFailure(checkoutSchema, {
        body: { householdId: VALID_UUID },
      }, 'body.plan');
    });

    it('accepts optional promoCode', () => {
      expectSuccess(checkoutSchema, {
        body: { householdId: VALID_UUID, plan: 'premium_monthly', promoCode: 'SAVE20' },
      });
    });
  });

  describe('cancelSubscriptionSchema', () => {
    it('accepts valid cancel payload', () => {
      expectSuccess(cancelSubscriptionSchema, {
        body: { subscriptionId: VALID_UUID },
      });
    });

    it('applies default immediate: false', () => {
      const result = cancelSubscriptionSchema.safeParse({
        body: { subscriptionId: VALID_UUID },
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.body.immediate).toBe(false);
      }
    });

    it('rejects missing subscriptionId', () => {
      expectFailure(cancelSubscriptionSchema, { body: {} }, 'body.subscriptionId');
    });
  });

  describe('webhookSchema', () => {
    it('accepts valid webhook payload', () => {
      expectSuccess(webhookSchema, {
        body: {
          event: 'payment.success',
          provider: 'stripe',
          externalId: 'sub_123',
          payload: { amount: 999 },
        },
      });
    });

    it('applies default empty payload', () => {
      const result = webhookSchema.safeParse({
        body: { event: 'evt', provider: 'test', externalId: 'id1' },
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.body.payload).toEqual({});
      }
    });

    it('rejects empty event string', () => {
      expectFailure(webhookSchema, {
        body: { event: '', provider: 'stripe', externalId: 'id1' },
      }, 'body.event');
    });
  });

  describe('listEntitlementsSchema', () => {
    it('accepts valid householdId', () => {
      expectSuccess(listEntitlementsSchema, {
        params: { householdId: VALID_UUID },
      });
    });

    it('rejects non-UUID householdId', () => {
      expectFailure(listEntitlementsSchema, {
        params: { householdId: 'bad' },
      });
    });
  });

  describe('redeemPromoSchema', () => {
    it('accepts valid code and householdId', () => {
      expectSuccess(redeemPromoSchema, {
        body: { code: 'WELCOME', householdId: VALID_UUID },
      });
    });

    it('rejects empty code', () => {
      expectFailure(redeemPromoSchema, {
        body: { code: '', householdId: VALID_UUID },
      }, 'body.code');
    });
  });

  describe('createPromoSchema', () => {
    const validPromo = {
      code: 'SUMMER2024',
      discountType: 'percent',
      discountValue: 20,
      validFrom: '2024-06-01T00:00:00.000Z',
    };

    it('accepts valid promo creation', () => {
      expectSuccess(createPromoSchema, { body: validPromo });
    });

    it('rejects lowercase code', () => {
      expectFailure(createPromoSchema, {
        body: { ...validPromo, code: 'summer' },
      }, 'body.code');
    });

    it('rejects code with spaces', () => {
      expectFailure(createPromoSchema, {
        body: { ...validPromo, code: 'HAS SPACE' },
      });
    });

    it('rejects discountValue less than 1', () => {
      expectFailure(createPromoSchema, {
        body: { ...validPromo, discountValue: 0 },
      }, 'body.discountValue');
    });

    it('rejects missing validFrom', () => {
      expectFailure(createPromoSchema, {
        body: { code: 'TEST', discountType: 'percent', discountValue: 10 },
      }, 'body.validFrom');
    });

    it('accepts optional planFilter', () => {
      expectSuccess(createPromoSchema, {
        body: { ...validPromo, planFilter: ['premium_monthly', 'premium_annual'] },
      });
    });
  });

  describe('listSubscriptionsSchema', () => {
    it('applies default pagination values', () => {
      const result = listSubscriptionsSchema.safeParse({ query: {} });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.query.page).toBe(1);
        expect(result.data.query.limit).toBe(20);
        expect(result.data.query.sortBy).toBe('createdAt');
        expect(result.data.query.sortOrder).toBe('desc');
      }
    });
  });
});

// ══════════════════════════════════════════════════════════════
// ── SYNC SCHEMAS ─────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════

describe('Sync Schemas', () => {
  const validChange = {
    entityType: 'progress',
    entityId: 'prog-001',
    action: 'update',
    payload: { completed: true },
    clientTimestamp: '2024-01-01T00:00:00.000Z',
  };

  describe('pushChangesSchema', () => {
    it('accepts valid push payload', () => {
      expectSuccess(pushChangesSchema, {
        body: { profileId: 'profile-1', changes: [validChange] },
      });
    });

    it('rejects empty changes array', () => {
      expectFailure(pushChangesSchema, {
        body: { profileId: 'profile-1', changes: [] },
      }, 'body.changes');
    });

    it('rejects changes exceeding max (500)', () => {
      const tooMany = Array.from({ length: 501 }, () => validChange);
      expectFailure(pushChangesSchema, {
        body: { profileId: 'profile-1', changes: tooMany },
      }, 'body.changes');
    });

    it('rejects change with invalid action enum', () => {
      expectFailure(pushChangesSchema, {
        body: {
          profileId: 'profile-1',
          changes: [{ ...validChange, action: 'merge' }],
        },
      });
    });

    it('validates all action enum values', () => {
      for (const action of ['create', 'update', 'delete']) {
        expectSuccess(pushChangesSchema, {
          body: { profileId: 'p1', changes: [{ ...validChange, action }] },
        });
      }
    });
  });

  describe('pullChangesSchema', () => {
    it('accepts valid pull payload', () => {
      expectSuccess(pullChangesSchema, {
        body: { profileId: 'profile-1', entityType: 'progress' },
      });
    });

    it('accepts optional sinceVersion', () => {
      expectSuccess(pullChangesSchema, {
        body: { profileId: 'p1', entityType: 'progress', sinceVersion: '42' },
      });
    });

    it('rejects empty profileId', () => {
      expectFailure(pullChangesSchema, {
        body: { profileId: '', entityType: 'progress' },
      }, 'body.profileId');
    });

    it('rejects empty entityType', () => {
      expectFailure(pullChangesSchema, {
        body: { profileId: 'p1', entityType: '' },
      }, 'body.entityType');
    });
  });

  describe('syncStatusSchema', () => {
    it('accepts valid profileId', () => {
      expectSuccess(syncStatusSchema, { params: { profileId: 'profile-1' } });
    });

    it('rejects empty profileId', () => {
      expectFailure(syncStatusSchema, { params: { profileId: '' } });
    });
  });

  describe('resolveConflictSchema', () => {
    it('accepts client resolution', () => {
      expectSuccess(resolveConflictSchema, {
        body: {
          profileId: 'p1',
          entityType: 'progress',
          entityId: 'e1',
          resolution: 'client',
        },
      });
    });

    it('accepts server resolution', () => {
      expectSuccess(resolveConflictSchema, {
        body: {
          profileId: 'p1',
          entityType: 'progress',
          entityId: 'e1',
          resolution: 'server',
        },
      });
    });

    it('rejects invalid resolution value', () => {
      expectFailure(resolveConflictSchema, {
        body: {
          profileId: 'p1',
          entityType: 'progress',
          entityId: 'e1',
          resolution: 'merge',
        },
      }, 'body.resolution');
    });

    it('accepts optional clientPayload', () => {
      expectSuccess(resolveConflictSchema, {
        body: {
          profileId: 'p1',
          entityType: 'progress',
          entityId: 'e1',
          resolution: 'client',
          clientPayload: { key: 'value' },
        },
      });
    });
  });

  describe('resetCheckpointSchema', () => {
    it('accepts valid profileId', () => {
      expectSuccess(resetCheckpointSchema, { params: { profileId: 'profile-1' } });
    });

    it('rejects empty profileId', () => {
      expectFailure(resetCheckpointSchema, { params: { profileId: '' } });
    });
  });
});

// ══════════════════════════════════════════════════════════════
// ── ANALYTICS SCHEMAS ────────────────────────────────────────
// ══════════════════════════════════════════════════════════════

describe('Analytics Schemas', () => {
  describe('recordEventSchema', () => {
    it('accepts valid event', () => {
      expectSuccess(recordEventSchema, {
        body: { contentId: 'content-1', metric: 'view', value: 1 },
      });
    });

    it('applies default value of 1', () => {
      const result = recordEventSchema.safeParse({
        body: { contentId: 'content-1', metric: 'view' },
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.body.value).toBe(1);
      }
    });

    it('validates metric enum values', () => {
      const validMetrics = ['view', 'completion', 'star', 'favorite', 'share'];
      for (const metric of validMetrics) {
        expectSuccess(recordEventSchema, {
          body: { contentId: 'c1', metric },
        });
      }
    });

    it('rejects invalid metric', () => {
      expectFailure(recordEventSchema, {
        body: { contentId: 'c1', metric: 'click' },
      }, 'body.metric');
    });

    it('accepts optional timeMs', () => {
      expectSuccess(recordEventSchema, {
        body: { contentId: 'c1', metric: 'view', timeMs: 5000 },
      });
    });
  });

  describe('contentAnalyticsSchema', () => {
    it('accepts valid params and query', () => {
      expectSuccess(contentAnalyticsSchema, {
        params: { contentId: 'content-1' },
        query: { period: 'daily' },
      });
    });

    it('applies default period', () => {
      const result = contentAnalyticsSchema.safeParse({
        params: { contentId: 'c1' },
        query: {},
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.query.period).toBe('daily');
      }
    });
  });

  describe('dashboardSchema', () => {
    it('accepts empty query with defaults', () => {
      const result = dashboardSchema.safeParse({ query: {} });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.query.period).toBe('daily');
      }
    });

    it('accepts from and to date filters', () => {
      expectSuccess(dashboardSchema, {
        query: { from: '2024-01-01', to: '2024-01-31', period: 'weekly' },
      });
    });
  });

  describe('topContentSchema', () => {
    it('applies defaults for metric, limit, period', () => {
      const result = topContentSchema.safeParse({ query: {} });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.query.metric).toBe('views');
        expect(result.data.query.limit).toBe(10);
        expect(result.data.query.period).toBe('daily');
      }
    });

    it('rejects limit greater than 100', () => {
      expectFailure(topContentSchema, { query: { limit: '101' } }, 'query.limit');
    });
  });
});

// ══════════════════════════════════════════════════════════════
// ── FEATURE FLAGS SCHEMAS ────────────────────────────────────
// ══════════════════════════════════════════════════════════════

describe('Feature Flags Schemas', () => {
  describe('listFlagsSchema', () => {
    it('applies defaults', () => {
      const result = listFlagsSchema.safeParse({ query: {} });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.query.page).toBe(1);
        expect(result.data.query.limit).toBe(20);
        expect(result.data.query.sortBy).toBe('createdAt');
        expect(result.data.query.sortOrder).toBe('desc');
      }
    });

    it('accepts enabled filter', () => {
      expectSuccess(listFlagsSchema, { query: { enabled: 'true' } });
    });
  });

  describe('createFlagSchema', () => {
    const validFlag = {
      key: 'new.feature-flag_1',
      name: 'New Feature Flag',
    };

    it('accepts valid flag with defaults', () => {
      const result = createFlagSchema.safeParse({ body: validFlag });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.body.enabled).toBe(false);
        expect(result.data.body.targeting).toEqual({});
        expect(result.data.body.defaultValue).toBe(false);
      }
    });

    it('rejects key with uppercase letters', () => {
      expectFailure(createFlagSchema, {
        body: { ...validFlag, key: 'Invalid-Key' },
      }, 'body.key');
    });

    it('rejects key with spaces', () => {
      expectFailure(createFlagSchema, {
        body: { ...validFlag, key: 'has space' },
      });
    });

    it('accepts key with dots, hyphens, underscores', () => {
      expectSuccess(createFlagSchema, {
        body: { ...validFlag, key: 'feature.sub-feature_v2' },
      });
    });
  });

  describe('updateFlagSchema', () => {
    it('accepts valid update', () => {
      expectSuccess(updateFlagSchema, {
        params: { key: 'my-flag' },
        body: { enabled: true },
      });
    });

    it('rejects empty body', () => {
      expectFailure(updateFlagSchema, {
        params: { key: 'my-flag' },
        body: {},
      });
    });
  });

  describe('evaluateBatchSchema', () => {
    it('accepts valid batch evaluation', () => {
      expectSuccess(evaluateBatchSchema, {
        body: {
          keys: ['flag-1', 'flag-2'],
          context: { environment: 'production' },
        },
      });
    });

    it('rejects empty keys array', () => {
      expectFailure(evaluateBatchSchema, {
        body: { keys: [] },
      }, 'body.keys');
    });

    it('rejects more than 100 keys', () => {
      const tooMany = Array.from({ length: 101 }, (_, i) => `flag-${i}`);
      expectFailure(evaluateBatchSchema, {
        body: { keys: tooMany },
      }, 'body.keys');
    });

    it('applies default empty context', () => {
      const result = evaluateBatchSchema.safeParse({
        body: { keys: ['flag-1'] },
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.body.context).toEqual({});
      }
    });
  });

  describe('evaluateSingleSchema', () => {
    it('accepts valid key param', () => {
      expectSuccess(evaluateSingleSchema, {
        params: { key: 'my-flag' },
        query: {},
      });
    });

    it('accepts context query parameters', () => {
      expectSuccess(evaluateSingleSchema, {
        params: { key: 'my-flag' },
        query: {
          environment: 'staging',
          appVersion: '2.1.0',
          locale: 'en-US',
          ageBand: 'age_3_4',
          premiumOnly: 'true',
        },
      });
    });

    it('rejects empty key', () => {
      expectFailure(evaluateSingleSchema, {
        params: { key: '' },
      });
    });
  });
});
