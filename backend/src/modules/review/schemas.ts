import { z } from 'zod';

// ── Enums ─────────────────────────────────────────────────

export const reviewStatusEnum = z.enum([
  'pending',
  'in_progress',
  'approved',
  'changes_requested',
  'rejected',
]);

export type ReviewStatusValue = z.infer<typeof reviewStatusEnum>;

// ── List Reviews ──────────────────────────────────────────

export const listReviewsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sortBy: z.enum(['createdAt', 'updatedAt']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    status: reviewStatusEnum.optional(),
    reviewerId: z.string().uuid().optional(),
    contentId: z.string().uuid().optional(),
  }),
});

export type ListReviewsQuery = z.infer<typeof listReviewsSchema>['query'];

// ── Get Review ────────────────────────────────────────────

export const getReviewSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

// ── Create Review ─────────────────────────────────────────

export const createReviewSchema = z.object({
  body: z.object({
    contentId: z.string().uuid(),
    reviewerId: z.string().uuid().optional(),
    summary: z.string().max(5000).optional(),
  }),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>['body'];

// ── Update Review Status ──────────────────────────────────

export const updateReviewSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    status: z.enum(['approved', 'changes_requested', 'rejected']),
    summary: z.string().max(5000).optional(),
  }).refine(
    (data) => {
      if ((data.status === 'changes_requested' || data.status === 'rejected') && !data.summary) {
        return false;
      }
      return true;
    },
    { message: 'Summary is required when requesting changes or rejecting', path: ['summary'] }
  ),
});

export type UpdateReviewInput = z.infer<typeof updateReviewSchema>['body'];

// ── Add Comment ───────────────────────────────────────────

export const addCommentSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    body: z.string().min(1).max(10000),
    field: z.string().max(200).optional(),
  }),
});

export type AddCommentInput = z.infer<typeof addCommentSchema>['body'];

// ── Update Comment (resolve/unresolve) ────────────────────

export const updateCommentSchema = z.object({
  params: z.object({
    id: z.string().min(1),
    commentId: z.string().min(1),
  }),
  body: z.object({
    resolved: z.boolean(),
  }),
});

export type UpdateCommentInput = z.infer<typeof updateCommentSchema>['body'];

// ── Review Queue ──────────────────────────────────────────

export const reviewQueueSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

export type ReviewQueueQuery = z.infer<typeof reviewQueueSchema>['query'];

// ── Review Stats ──────────────────────────────────────────

export const reviewStatsSchema = z.object({
  query: z.object({
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
  }),
});

export type ReviewStatsQuery = z.infer<typeof reviewStatsSchema>['query'];

// ── Assign Reviewer ───────────────────────────────────────

export const assignReviewerSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    reviewerId: z.string().uuid(),
  }),
});

export type AssignReviewerInput = z.infer<typeof assignReviewerSchema>['body'];
