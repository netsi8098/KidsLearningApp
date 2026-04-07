// ── Workflow Fixtures ──────────────────────────────────────
// Test data for content status state machine transitions,
// reviews, and releases. Supports testing valid/invalid
// workflow paths through the content lifecycle.

// ── Fixed reference dates ──────────────────────────────────

const FIXED_CREATED = new Date('2026-01-10T08:00:00.000Z');
const FIXED_UPDATED = new Date('2026-01-20T12:00:00.000Z');
const FIXED_SCHEDULED = new Date('2026-03-01T08:00:00.000Z');
const FIXED_EXECUTED = new Date('2026-03-01T08:01:00.000Z');

// ── Content status types ───────────────────────────────────

export type ContentStatus = 'draft' | 'review' | 'approved' | 'scheduled' | 'published' | 'archived';

// ── Valid transition map ───────────────────────────────────
// Defines which status transitions are allowed in the content
// lifecycle. This is the authoritative map for state machine tests.

export const VALID_TRANSITIONS: Record<ContentStatus, ContentStatus[]> = {
  draft: ['review'],
  review: ['approved', 'draft'], // can approve or return to draft
  approved: ['scheduled', 'published', 'draft'], // can schedule, publish, or revert
  scheduled: ['published', 'approved', 'draft'], // can publish early, reschedule, or revert
  published: ['archived', 'draft'], // can archive or unpublish to draft
  archived: ['draft'], // can restore to draft
};

// ── Review fixture type (matches Prisma Review model) ──────

export interface ReviewFixture {
  id: string;
  contentId: string;
  reviewerId: string;
  status: 'pending' | 'in_progress' | 'approved' | 'changes_requested' | 'rejected';
  summary: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ── Release fixture type (matches Prisma Release model) ────

export interface ReleaseFixture {
  id: string;
  contentId: string;
  action: 'publish' | 'unpublish' | 'archive' | 'feature' | 'unfeature';
  status: 'pending' | 'scheduled' | 'executing' | 'completed' | 'failed' | 'cancelled';
  scheduledAt: Date | null;
  executedAt: Date | null;
  createdBy: string;
  notes: string | null;
  createdAt: Date;
}

// ── Counters ───────────────────────────────────────────────

let reviewCounter = 0;
let releaseCounter = 0;

// ── Factories ──────────────────────────────────────────────

export function createReviewFixture(
  overrides: Partial<ReviewFixture> = {}
): ReviewFixture {
  reviewCounter++;
  const idx = String(reviewCounter).padStart(3, '0');

  return {
    id: `review-${idx}`,
    contentId: `content-${idx}`,
    reviewerId: 'user-reviewer-001',
    status: 'pending',
    summary: null,
    createdAt: FIXED_CREATED,
    updatedAt: FIXED_UPDATED,
    ...overrides,
  };
}

export function createReleaseFixture(
  overrides: Partial<ReleaseFixture> = {}
): ReleaseFixture {
  releaseCounter++;
  const idx = String(releaseCounter).padStart(3, '0');

  return {
    id: `release-${idx}`,
    contentId: `content-${idx}`,
    action: 'publish',
    status: 'pending',
    scheduledAt: null,
    executedAt: null,
    createdBy: 'user-editor-001',
    notes: null,
    createdAt: FIXED_CREATED,
    ...overrides,
  };
}

// ── Reset counters ─────────────────────────────────────────

export function resetWorkflowCounters(): void {
  reviewCounter = 0;
  releaseCounter = 0;
}

// ── Workflow test scenarios ────────────────────────────────
// Each scenario describes a status transition with whether it
// should be allowed and a human-readable description.

export interface WorkflowScenario {
  from: ContentStatus;
  to: ContentStatus;
  shouldSucceed: boolean;
  description: string;
}

export const WORKFLOW_SCENARIOS: WorkflowScenario[] = [
  // ── Valid forward transitions ────────────────────────────
  {
    from: 'draft',
    to: 'review',
    shouldSucceed: true,
    description: 'Submit draft for review',
  },
  {
    from: 'review',
    to: 'approved',
    shouldSucceed: true,
    description: 'Approve content in review',
  },
  {
    from: 'approved',
    to: 'scheduled',
    shouldSucceed: true,
    description: 'Schedule approved content',
  },
  {
    from: 'approved',
    to: 'published',
    shouldSucceed: true,
    description: 'Publish approved content immediately',
  },
  {
    from: 'scheduled',
    to: 'published',
    shouldSucceed: true,
    description: 'Publish scheduled content (trigger or early release)',
  },
  {
    from: 'published',
    to: 'archived',
    shouldSucceed: true,
    description: 'Archive published content',
  },

  // ── Valid revert transitions ─────────────────────────────
  {
    from: 'review',
    to: 'draft',
    shouldSucceed: true,
    description: 'Return reviewed content to draft (request changes)',
  },
  {
    from: 'approved',
    to: 'draft',
    shouldSucceed: true,
    description: 'Revert approved content to draft',
  },
  {
    from: 'scheduled',
    to: 'approved',
    shouldSucceed: true,
    description: 'Unschedule back to approved',
  },
  {
    from: 'scheduled',
    to: 'draft',
    shouldSucceed: true,
    description: 'Revert scheduled content all the way to draft',
  },
  {
    from: 'published',
    to: 'draft',
    shouldSucceed: true,
    description: 'Unpublish content back to draft',
  },
  {
    from: 'archived',
    to: 'draft',
    shouldSucceed: true,
    description: 'Restore archived content to draft',
  },

  // ── Invalid transitions ──────────────────────────────────
  {
    from: 'draft',
    to: 'approved',
    shouldSucceed: false,
    description: 'Cannot skip review and go directly to approved',
  },
  {
    from: 'draft',
    to: 'published',
    shouldSucceed: false,
    description: 'Cannot publish directly from draft',
  },
  {
    from: 'draft',
    to: 'scheduled',
    shouldSucceed: false,
    description: 'Cannot schedule directly from draft',
  },
  {
    from: 'draft',
    to: 'archived',
    shouldSucceed: false,
    description: 'Cannot archive directly from draft',
  },
  {
    from: 'review',
    to: 'published',
    shouldSucceed: false,
    description: 'Cannot publish directly from review',
  },
  {
    from: 'review',
    to: 'scheduled',
    shouldSucceed: false,
    description: 'Cannot schedule directly from review',
  },
  {
    from: 'review',
    to: 'archived',
    shouldSucceed: false,
    description: 'Cannot archive content in review',
  },
  {
    from: 'approved',
    to: 'review',
    shouldSucceed: false,
    description: 'Cannot send approved content back to review',
  },
  {
    from: 'approved',
    to: 'archived',
    shouldSucceed: false,
    description: 'Cannot archive approved content without publishing first',
  },
  {
    from: 'scheduled',
    to: 'review',
    shouldSucceed: false,
    description: 'Cannot send scheduled content to review',
  },
  {
    from: 'scheduled',
    to: 'archived',
    shouldSucceed: false,
    description: 'Cannot archive scheduled content directly',
  },
  {
    from: 'published',
    to: 'review',
    shouldSucceed: false,
    description: 'Cannot send published content to review',
  },
  {
    from: 'published',
    to: 'approved',
    shouldSucceed: false,
    description: 'Cannot revert published content to approved',
  },
  {
    from: 'published',
    to: 'scheduled',
    shouldSucceed: false,
    description: 'Cannot revert published content to scheduled',
  },
  {
    from: 'archived',
    to: 'review',
    shouldSucceed: false,
    description: 'Cannot send archived content to review',
  },
  {
    from: 'archived',
    to: 'approved',
    shouldSucceed: false,
    description: 'Cannot restore archived content to approved',
  },
  {
    from: 'archived',
    to: 'published',
    shouldSucceed: false,
    description: 'Cannot republish archived content directly',
  },
  {
    from: 'archived',
    to: 'scheduled',
    shouldSucceed: false,
    description: 'Cannot schedule archived content directly',
  },
];

// ── Predefined review fixtures ─────────────────────────────

export const REVIEW_FIXTURES: Record<string, ReviewFixture> = {
  pending: {
    id: 'review-pending-001',
    contentId: 'content-shape-001',
    reviewerId: 'user-reviewer-001',
    status: 'pending',
    summary: null,
    createdAt: FIXED_CREATED,
    updatedAt: FIXED_UPDATED,
  },
  in_progress: {
    id: 'review-inprogress-001',
    contentId: 'content-shape-001',
    reviewerId: 'user-reviewer-001',
    status: 'in_progress',
    summary: 'Currently reviewing shape content.',
    createdAt: FIXED_CREATED,
    updatedAt: FIXED_UPDATED,
  },
  approved: {
    id: 'review-approved-001',
    contentId: 'content-alpha-001',
    reviewerId: 'user-reviewer-001',
    status: 'approved',
    summary: 'Content meets all quality standards.',
    createdAt: FIXED_CREATED,
    updatedAt: FIXED_UPDATED,
  },
  changes_requested: {
    id: 'review-changes-001',
    contentId: 'content-game-001',
    reviewerId: 'user-reviewer-001',
    status: 'changes_requested',
    summary: 'Difficulty level needs adjustment for age group.',
    createdAt: FIXED_CREATED,
    updatedAt: FIXED_UPDATED,
  },
  rejected: {
    id: 'review-rejected-001',
    contentId: 'content-game-001',
    reviewerId: 'user-reviewer-001',
    status: 'rejected',
    summary: 'Content does not meet quality guidelines.',
    createdAt: FIXED_CREATED,
    updatedAt: FIXED_UPDATED,
  },
};

// ── Predefined release fixtures ────────────────────────────

export const RELEASE_FIXTURES: Record<string, ReleaseFixture> = {
  pending_publish: {
    id: 'release-pending-001',
    contentId: 'content-body-001',
    action: 'publish',
    status: 'pending',
    scheduledAt: null,
    executedAt: null,
    createdBy: 'user-editor-001',
    notes: 'Ready for immediate publish.',
    createdAt: FIXED_CREATED,
  },
  scheduled_publish: {
    id: 'release-scheduled-001',
    contentId: 'content-body-001',
    action: 'publish',
    status: 'scheduled',
    scheduledAt: FIXED_SCHEDULED,
    executedAt: null,
    createdBy: 'user-editor-001',
    notes: 'Scheduled for March launch.',
    createdAt: FIXED_CREATED,
  },
  completed_publish: {
    id: 'release-completed-001',
    contentId: 'content-alpha-001',
    action: 'publish',
    status: 'completed',
    scheduledAt: FIXED_SCHEDULED,
    executedAt: FIXED_EXECUTED,
    createdBy: 'user-editor-001',
    notes: 'Published successfully.',
    createdAt: FIXED_CREATED,
  },
  failed_publish: {
    id: 'release-failed-001',
    contentId: 'content-game-001',
    action: 'publish',
    status: 'failed',
    scheduledAt: FIXED_SCHEDULED,
    executedAt: FIXED_EXECUTED,
    createdBy: 'user-editor-001',
    notes: 'Failed: content validation errors.',
    createdAt: FIXED_CREATED,
  },
  archive: {
    id: 'release-archive-001',
    contentId: 'content-alpha-001',
    action: 'archive',
    status: 'completed',
    scheduledAt: null,
    executedAt: FIXED_EXECUTED,
    createdBy: 'user-admin-001',
    notes: 'Archived due to content refresh.',
    createdAt: FIXED_CREATED,
  },
  feature: {
    id: 'release-feature-001',
    contentId: 'content-animal-001',
    action: 'feature',
    status: 'completed',
    scheduledAt: null,
    executedAt: FIXED_EXECUTED,
    createdBy: 'user-admin-001',
    notes: 'Featured for spring campaign.',
    createdAt: FIXED_CREATED,
  },
  cancelled: {
    id: 'release-cancelled-001',
    contentId: 'content-game-001',
    action: 'publish',
    status: 'cancelled',
    scheduledAt: FIXED_SCHEDULED,
    executedAt: null,
    createdBy: 'user-editor-001',
    notes: 'Cancelled - needs more QA.',
    createdAt: FIXED_CREATED,
  },
};
