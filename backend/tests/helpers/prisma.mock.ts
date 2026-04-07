// ── Comprehensive Prisma Mock ──────────────────────────────
// Provides a fully-mocked PrismaClient with all models and their
// standard CRUD methods as vi.fn() stubs. Use resetPrismaMocks()
// in beforeEach/afterEach to start each test with a clean slate.

import { vi } from 'vitest';

// ── Helper: create a mock model delegate with all standard methods ──

function createModelMock() {
  return {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    createMany: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
    count: vi.fn(),
    groupBy: vi.fn(),
    upsert: vi.fn(),
  };
}

// ── All Prisma models ──────────────────────────────────────

export const mockPrisma = {
  // Core content & auth
  content: createModelMock(),
  user: createModelMock(),
  tag: createModelMock(),
  contentTag: createModelMock(),
  skill: createModelMock(),
  contentSkill: createModelMock(),
  collection: createModelMock(),
  collectionItem: createModelMock(),

  // Assets
  asset: createModelMock(),
  assetVariant: createModelMock(),

  // Curriculum
  curriculum: createModelMock(),
  curriculumUnit: createModelMock(),
  curriculumItem: createModelMock(),

  // Releases & QA
  release: createModelMock(),
  qaResult: createModelMock(),

  // Reviews
  review: createModelMock(),
  reviewComment: createModelMock(),

  // AI Brief
  brief: createModelMock(),

  // Story / Illustration / Voice pipelines
  storyStep: createModelMock(),
  illustrationJob: createModelMock(),
  voiceJob: createModelMock(),

  // Prompts
  prompt: createModelMock(),
  promptUsage: createModelMock(),

  // Localization & Dedup
  translation: createModelMock(),
  similarContent: createModelMock(),

  // Experiments
  experiment: createModelMock(),
  experimentVariant: createModelMock(),
  experimentResult: createModelMock(),

  // Analytics
  contentAnalytics: createModelMock(),

  // Offline packs
  offlinePack: createModelMock(),
  offlinePackItem: createModelMock(),

  // Licensed content governance
  licensedRight: createModelMock(),

  // v7 systems
  auditLog: createModelMock(),
  permission: createModelMock(),
  household: createModelMock(),
  parentAccount: createModelMock(),
  childProfile: createModelMock(),
  caregiverInvite: createModelMock(),
  profilePreference: createModelMock(),
  parentalSettings: createModelMock(),

  // v8 Subscription & Entitlement (Feature 1)
  subscription: createModelMock(),
  invoice: createModelMock(),
  paymentMethod: createModelMock(),
  entitlement: createModelMock(),
  promoCode: createModelMock(),

  // Feature Flags (Feature 4)
  featureFlag: createModelMock(),
  featureFlagOverride: createModelMock(),

  // Cross-Device Sync (Feature 3)
  syncCheckpoint: createModelMock(),
  syncEvent: createModelMock(),

  // Deep Linking (Feature 15)
  deepLink: createModelMock(),

  // Parent Tips (Feature 5)
  parentTip: createModelMock(),

  // Help Center (Feature 6)
  helpArticle: createModelMock(),
  supportTicket: createModelMock(),

  // Privacy & Consent (Feature 7)
  consentRecord: createModelMock(),
  dataRequest: createModelMock(),

  // Parent Communication (Feature 11)
  message: createModelMock(),
  messagePreference: createModelMock(),

  // Lifecycle Messaging (Feature 16)
  journey: createModelMock(),
  journeyStep: createModelMock(),
  journeyEnrollment: createModelMock(),

  // Caregiver Collaboration (Feature 14)
  caregiverAccess: createModelMock(),

  // Family Routines (Feature 20)
  routine: createModelMock(),

  // Recommendation Tuning (Feature 8)
  recommendationConfig: createModelMock(),

  // Merchandising (Feature 10)
  merchandisingAsset: createModelMock(),

  // Performance (Feature 12)
  performanceMetric: createModelMock(),
  performanceBaseline: createModelMock(),

  // Error Triage (Feature 13)
  errorReport: createModelMock(),
  errorGroup: createModelMock(),

  // Reporting/BI (Feature 17)
  exportJob: createModelMock(),

  // Content Ops SLA (Feature 18)
  contentPipelineEvent: createModelMock(),

  // Content Policy (Feature 19)
  contentPolicy: createModelMock(),
  policyResult: createModelMock(),

  // ── Prisma Client methods ───────────────────────────────

  $transaction: vi.fn((cb: (tx: typeof mockPrisma) => unknown) => {
    // If the argument is a callback, execute it with mockPrisma as the client.
    // If it is an array of promises (batch transaction), resolve them all.
    if (typeof cb === 'function') {
      return cb(mockPrisma);
    }
    return Promise.all(cb as Promise<unknown>[]);
  }),
  $connect: vi.fn(),
  $disconnect: vi.fn(),
  $executeRaw: vi.fn(),
  $executeRawUnsafe: vi.fn(),
  $queryRaw: vi.fn(),
  $queryRawUnsafe: vi.fn(),
};

// Type alias for convenience
export type MockPrisma = typeof mockPrisma;

// ── Reset all mocks ────────────────────────────────────────

function resetModelMock(model: ReturnType<typeof createModelMock>) {
  model.findMany.mockReset();
  model.findFirst.mockReset();
  model.findUnique.mockReset();
  model.create.mockReset();
  model.createMany.mockReset();
  model.update.mockReset();
  model.updateMany.mockReset();
  model.delete.mockReset();
  model.deleteMany.mockReset();
  model.count.mockReset();
  model.groupBy.mockReset();
  model.upsert.mockReset();
}

export function resetPrismaMocks(): void {
  // Reset every model delegate
  const modelKeys = Object.keys(mockPrisma).filter(
    (k) => !k.startsWith('$')
  ) as (keyof typeof mockPrisma)[];

  for (const key of modelKeys) {
    const value = mockPrisma[key];
    if (value && typeof value === 'object' && 'findMany' in value) {
      resetModelMock(value as ReturnType<typeof createModelMock>);
    }
  }

  // Reset client-level methods
  mockPrisma.$transaction.mockReset();
  mockPrisma.$transaction.mockImplementation(
    (cb: ((tx: typeof mockPrisma) => unknown) | Promise<unknown>[]) => {
      if (typeof cb === 'function') {
        return cb(mockPrisma);
      }
      return Promise.all(cb as Promise<unknown>[]);
    }
  );
  mockPrisma.$connect.mockReset();
  mockPrisma.$disconnect.mockReset();
  mockPrisma.$executeRaw.mockReset();
  mockPrisma.$executeRawUnsafe.mockReset();
  mockPrisma.$queryRaw.mockReset();
  mockPrisma.$queryRawUnsafe.mockReset();
}
