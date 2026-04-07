// ── Barrel Export: All Test Fixtures ────────────────────────
// Import from 'tests/fixtures' to get all fixture factories,
// predefined datasets, and edge-case objects in one place.

// ── Content ────────────────────────────────────────────────
export {
  createContentFixture,
  createManyContentFixtures,
  resetContentCounter,
  CONTENT_FIXTURES,
  EDGE_CASE_LONG_TITLE,
  EDGE_CASE_MISSING_THUMBNAIL,
  EDGE_CASE_BEDTIME_ONLY,
  EDGE_CASE_PREMIUM_ONLY,
  EDGE_CASE_ARCHIVED,
  EDGE_CASE_DUPLICATE_TAGS,
} from './content.fixture.js';
export type { ContentFixture } from './content.fixture.js';

// ── Users & Household ──────────────────────────────────────
export {
  createUserFixture,
  createHouseholdFixture,
  createParentFixture,
  createChildProfileFixture,
  resetUserCounters,
  ROLE_FIXTURES,
  HOUSEHOLD_FIXTURE,
  PARENT_FIXTURE,
  CAREGIVER_FIXTURE,
  CHILD_FIXTURES,
} from './user.fixture.js';
export type {
  UserFixture,
  HouseholdFixture,
  ParentFixture,
  ChildProfileFixture,
} from './user.fixture.js';

// ── Subscriptions & Entitlements ───────────────────────────
export {
  createSubscriptionFixture,
  createEntitlementFixture,
  createPromoCodeFixture,
  resetSubscriptionCounters,
  SUBSCRIPTION_FIXTURES,
  ENTITLEMENT_FIXTURES,
  PROMO_CODE_FIXTURES,
} from './subscription.fixture.js';
export type {
  SubscriptionFixture,
  EntitlementFixture,
  PromoCodeFixture,
} from './subscription.fixture.js';

// ── Workflow (State Machine) ───────────────────────────────
export {
  VALID_TRANSITIONS,
  createReviewFixture,
  createReleaseFixture,
  resetWorkflowCounters,
  WORKFLOW_SCENARIOS,
  REVIEW_FIXTURES,
  RELEASE_FIXTURES,
} from './workflow.fixture.js';
export type {
  ContentStatus,
  ReviewFixture,
  ReleaseFixture,
  WorkflowScenario,
} from './workflow.fixture.js';
