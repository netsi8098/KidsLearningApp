import { Router } from 'express';
import { validate } from '../../lib/validate.js';
import { authenticate, requireRole } from '../../middleware/auth.js';
import * as reviewService from './service.js';
import {
  listReviewsSchema,
  getReviewSchema,
  createReviewSchema,
  updateReviewSchema,
  addCommentSchema,
  updateCommentSchema,
  reviewQueueSchema,
  reviewStatsSchema,
  assignReviewerSchema,
} from './schemas.js';

const router = Router();

// ── GET /api/reviews ──────────────────────────────────────

router.get(
  '/',
  authenticate,
  validate(listReviewsSchema),
  async (req, res) => {
    const query = (req as unknown as Record<string, unknown>).validatedQuery as {
      page: number;
      limit: number;
      sortBy: string;
      sortOrder: 'asc' | 'desc';
      status?: string;
      reviewerId?: string;
      contentId?: string;
    };

    const result = await reviewService.listReviews({
      page: query.page,
      limit: query.limit,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      status: query.status as Parameters<typeof reviewService.listReviews>[0]['status'],
      reviewerId: query.reviewerId,
      contentId: query.contentId,
    });
    res.json(result);
  }
);

// ── GET /api/reviews/queue ────────────────────────────────

router.get(
  '/queue',
  authenticate,
  validate(reviewQueueSchema),
  async (req, res) => {
    const query = (req as unknown as Record<string, unknown>).validatedQuery as {
      page: number;
      limit: number;
    };

    const result = await reviewService.getReviewQueue(
      req.user!.userId,
      query.page,
      query.limit
    );
    res.json(result);
  }
);

// ── GET /api/reviews/stats ────────────────────────────────

router.get(
  '/stats',
  authenticate,
  validate(reviewStatsSchema),
  async (req, res) => {
    const query = (req as unknown as Record<string, unknown>).validatedQuery as {
      from?: string;
      to?: string;
    };

    const result = await reviewService.getReviewStats(query);
    res.json(result);
  }
);

// ── GET /api/reviews/:id ──────────────────────────────────

router.get(
  '/:id',
  authenticate,
  validate(getReviewSchema),
  async (req, res) => {
    const review = await reviewService.getReviewById(req.params.id as string);
    res.json(review);
  }
);

// ── POST /api/reviews ─────────────────────────────────────

router.post(
  '/',
  authenticate,
  requireRole('admin', 'editor', 'reviewer'),
  validate(createReviewSchema),
  async (req, res) => {
    const { contentId, reviewerId, summary } = req.body;
    const review = await reviewService.createReview({
      contentId,
      reviewerId: reviewerId ?? req.user!.userId,
      summary,
    });
    res.status(201).json(review);
  }
);

// ── PATCH /api/reviews/:id ────────────────────────────────

router.patch(
  '/:id',
  authenticate,
  requireRole('admin', 'editor', 'reviewer'),
  validate(updateReviewSchema),
  async (req, res) => {
    const { status, summary } = req.body;

    let result;
    switch (status) {
      case 'approved':
        result = await reviewService.approveReview(req.params.id as string, summary);
        break;
      case 'changes_requested':
        result = await reviewService.requestChanges(req.params.id as string, summary!);
        break;
      case 'rejected':
        result = await reviewService.rejectReview(req.params.id as string, summary!);
        break;
    }

    res.json(result);
  }
);

// ── POST /api/reviews/:id/comments ────────────────────────

router.post(
  '/:id/comments',
  authenticate,
  validate(addCommentSchema),
  async (req, res) => {
    const comment = await reviewService.addComment(
      req.params.id as string,
      req.user!.userId,
      req.body.body,
      req.body.field
    );
    res.status(201).json(comment);
  }
);

// ── PATCH /api/reviews/:id/comments/:commentId ────────────

router.patch(
  '/:id/comments/:commentId',
  authenticate,
  validate(updateCommentSchema),
  async (req, res) => {
    const comment = await reviewService.resolveComment(
      req.params.commentId as string,
      req.body.resolved
    );
    res.json(comment);
  }
);

// ── POST /api/reviews/:id/assign ──────────────────────────

router.post(
  '/:id/assign',
  authenticate,
  requireRole('admin', 'editor'),
  validate(assignReviewerSchema),
  async (req, res) => {
    const review = await reviewService.assignReviewer(
      req.params.id as string,
      req.body.reviewerId
    );
    res.json(review);
  }
);

export default router;
