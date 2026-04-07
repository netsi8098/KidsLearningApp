import { prisma } from '../../lib/prisma.js';
import { NotFoundError, ValidationError, ConflictError } from '../../lib/errors.js';
import type { ReviewStatus, Prisma } from '@prisma/client';

// ── Types ─────────────────────────────────────────────────

export interface CreateReviewInput {
  contentId: string;
  reviewerId: string;
  summary?: string;
}

export interface ReviewStatsResult {
  totalReviews: number;
  avgTurnaroundHours: number | null;
  approvalRate: number;
  statusBreakdown: Record<string, number>;
  perReviewer: Array<{
    reviewerId: string;
    reviewerName: string;
    total: number;
    approved: number;
    rejected: number;
    changesRequested: number;
    avgTurnaroundHours: number | null;
  }>;
}

// ── Select Constants ──────────────────────────────────────

const REVIEW_INCLUDE = {
  content: {
    select: { id: true, title: true, slug: true, type: true, status: true },
  },
  reviewer: {
    select: { id: true, name: true, email: true },
  },
  comments: {
    include: {
      author: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: 'asc' as const },
  },
} satisfies Prisma.ReviewInclude;

const REVIEW_LIST_INCLUDE = {
  content: {
    select: { id: true, title: true, slug: true, type: true, status: true },
  },
  reviewer: {
    select: { id: true, name: true, email: true },
  },
  _count: { select: { comments: true } },
} satisfies Prisma.ReviewInclude;

// ── List Reviews ──────────────────────────────────────────

export async function listReviews(params: {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  status?: ReviewStatus;
  reviewerId?: string;
  contentId?: string;
}) {
  const { page, limit, sortBy, sortOrder, status, reviewerId, contentId } = params;

  const where: Prisma.ReviewWhereInput = {};
  if (status) where.status = status;
  if (reviewerId) where.reviewerId = reviewerId;
  if (contentId) where.contentId = contentId;

  const [data, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: REVIEW_LIST_INCLUDE,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.review.count({ where }),
  ]);

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ── Get Review by ID ──────────────────────────────────────

export async function getReviewById(id: string) {
  const review = await prisma.review.findUnique({
    where: { id },
    include: REVIEW_INCLUDE,
  });

  if (!review) {
    throw new NotFoundError('Review', id);
  }

  return review;
}

// ── Create Review ─────────────────────────────────────────

export async function createReview(input: CreateReviewInput) {
  const { contentId, reviewerId, summary } = input;

  // Verify content exists
  const content = await prisma.content.findUnique({ where: { id: contentId } });
  if (!content) {
    throw new NotFoundError('Content', contentId);
  }

  // Verify reviewer exists
  const reviewer = await prisma.user.findUnique({ where: { id: reviewerId } });
  if (!reviewer) {
    throw new NotFoundError('User', reviewerId);
  }

  // Check for existing active review by same reviewer on same content
  const existing = await prisma.review.findFirst({
    where: {
      contentId,
      reviewerId,
      status: { in: ['pending', 'in_progress'] },
    },
  });
  if (existing) {
    throw new ConflictError('An active review already exists for this content by the same reviewer');
  }

  // Transition content to review status if it is in draft
  const review = await prisma.$transaction(async (tx) => {
    if (content.status === 'draft') {
      await tx.content.update({
        where: { id: contentId },
        data: { status: 'review' },
      });
    }

    return tx.review.create({
      data: {
        contentId,
        reviewerId,
        summary: summary ?? null,
        status: 'pending',
      },
      include: REVIEW_INCLUDE,
    });
  });

  return review;
}

// ── Approve Review ────────────────────────────────────────

export async function approveReview(id: string, summary?: string) {
  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) {
    throw new NotFoundError('Review', id);
  }

  if (review.status === 'approved') {
    throw new ValidationError('Review is already approved');
  }

  if (review.status === 'rejected') {
    throw new ValidationError('Cannot approve a rejected review');
  }

  const updated = await prisma.$transaction(async (tx) => {
    const updatedReview = await tx.review.update({
      where: { id },
      data: {
        status: 'approved',
        summary: summary ?? review.summary,
      },
      include: REVIEW_INCLUDE,
    });

    // Transition content status to approved
    await tx.content.update({
      where: { id: review.contentId },
      data: { status: 'approved' },
    });

    return updatedReview;
  });

  return updated;
}

// ── Request Changes ───────────────────────────────────────

export async function requestChanges(id: string, summary: string) {
  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) {
    throw new NotFoundError('Review', id);
  }

  if (review.status === 'approved') {
    throw new ValidationError('Cannot request changes on an approved review');
  }

  if (review.status === 'rejected') {
    throw new ValidationError('Cannot request changes on a rejected review');
  }

  const updated = await prisma.review.update({
    where: { id },
    data: {
      status: 'changes_requested',
      summary,
    },
    include: REVIEW_INCLUDE,
  });

  // Content stays in 'review' status
  return updated;
}

// ── Reject Review ─────────────────────────────────────────

export async function rejectReview(id: string, summary: string) {
  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) {
    throw new NotFoundError('Review', id);
  }

  if (review.status === 'approved') {
    throw new ValidationError('Cannot reject an approved review');
  }

  const updated = await prisma.$transaction(async (tx) => {
    const updatedReview = await tx.review.update({
      where: { id },
      data: {
        status: 'rejected',
        summary,
      },
      include: REVIEW_INCLUDE,
    });

    // Content reverts to draft
    await tx.content.update({
      where: { id: review.contentId },
      data: { status: 'draft' },
    });

    return updatedReview;
  });

  return updated;
}

// ── Add Comment ───────────────────────────────────────────

export async function addComment(
  reviewId: string,
  authorId: string,
  body: string,
  field?: string
) {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) {
    throw new NotFoundError('Review', reviewId);
  }

  // If review is pending, transition to in_progress on first comment
  const shouldTransition = review.status === 'pending';

  const comment = await prisma.$transaction(async (tx) => {
    if (shouldTransition) {
      await tx.review.update({
        where: { id: reviewId },
        data: { status: 'in_progress' },
      });
    }

    return tx.reviewComment.create({
      data: {
        reviewId,
        authorId,
        body,
        field: field ?? null,
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    });
  });

  return comment;
}

// ── Resolve Comment ───────────────────────────────────────

export async function resolveComment(commentId: string, resolved: boolean) {
  const comment = await prisma.reviewComment.findUnique({
    where: { id: commentId },
    include: { review: true },
  });
  if (!comment) {
    throw new NotFoundError('ReviewComment', commentId);
  }

  const updated = await prisma.reviewComment.update({
    where: { id: commentId },
    data: { resolved },
    include: {
      author: { select: { id: true, name: true, email: true } },
    },
  });

  // Auto-transition check: if all comments resolved and review is approved,
  // content is eligible for release (we just return the comment;
  // the eligibility check can be queried separately)
  if (resolved) {
    await checkAutoTransition(comment.reviewId);
  }

  return updated;
}

// ── Auto-Transition Logic ─────────────────────────────────

async function checkAutoTransition(reviewId: string) {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: { comments: true },
  });
  if (!review) return;

  // If approved and all comments resolved, content is eligible for release
  if (review.status === 'approved') {
    const unresolvedCount = review.comments.filter((c) => !c.resolved).length;
    if (unresolvedCount === 0) {
      // Content stays 'approved' -- this signals it is release-eligible
      // A release module can check for approved content with all comments resolved
      await prisma.content.update({
        where: { id: review.contentId },
        data: { status: 'approved' },
      });
    }
  }
}

// ── Review Queue ──────────────────────────────────────────

export async function getReviewQueue(
  reviewerId: string,
  page: number,
  limit: number
) {
  const where: Prisma.ReviewWhereInput = {
    reviewerId,
    status: { in: ['pending', 'in_progress'] },
  };

  const [data, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: REVIEW_LIST_INCLUDE,
      orderBy: [
        { status: 'asc' }, // pending first
        { createdAt: 'asc' }, // oldest first
      ],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.review.count({ where }),
  ]);

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ── Review Stats ──────────────────────────────────────────

export async function getReviewStats(dateRange?: {
  from?: string;
  to?: string;
}): Promise<ReviewStatsResult> {
  const where: Prisma.ReviewWhereInput = {};

  if (dateRange?.from || dateRange?.to) {
    where.createdAt = {};
    if (dateRange.from) where.createdAt.gte = new Date(dateRange.from);
    if (dateRange.to) where.createdAt.lte = new Date(dateRange.to);
  }

  // Get all reviews in range
  const reviews = await prisma.review.findMany({
    where,
    include: {
      reviewer: { select: { id: true, name: true } },
    },
  });

  const totalReviews = reviews.length;

  // Calculate status breakdown
  const statusBreakdown: Record<string, number> = {};
  for (const r of reviews) {
    statusBreakdown[r.status] = (statusBreakdown[r.status] || 0) + 1;
  }

  // Approval rate
  const completedReviews = reviews.filter((r) =>
    ['approved', 'rejected', 'changes_requested'].includes(r.status)
  );
  const approvedCount = reviews.filter((r) => r.status === 'approved').length;
  const approvalRate =
    completedReviews.length > 0 ? approvedCount / completedReviews.length : 0;

  // Average turnaround: time from createdAt to updatedAt for completed reviews
  const turnaroundMs = completedReviews
    .map((r) => r.updatedAt.getTime() - r.createdAt.getTime())
    .filter((ms) => ms > 0);
  const avgTurnaroundHours =
    turnaroundMs.length > 0
      ? turnaroundMs.reduce((a, b) => a + b, 0) / turnaroundMs.length / (1000 * 60 * 60)
      : null;

  // Per-reviewer breakdown
  const reviewerMap = new Map<
    string,
    {
      reviewerName: string;
      total: number;
      approved: number;
      rejected: number;
      changesRequested: number;
      turnaroundMs: number[];
    }
  >();

  for (const r of reviews) {
    let entry = reviewerMap.get(r.reviewerId);
    if (!entry) {
      entry = {
        reviewerName: r.reviewer.name,
        total: 0,
        approved: 0,
        rejected: 0,
        changesRequested: 0,
        turnaroundMs: [],
      };
      reviewerMap.set(r.reviewerId, entry);
    }
    entry.total++;
    if (r.status === 'approved') entry.approved++;
    if (r.status === 'rejected') entry.rejected++;
    if (r.status === 'changes_requested') entry.changesRequested++;
    if (['approved', 'rejected', 'changes_requested'].includes(r.status)) {
      const ms = r.updatedAt.getTime() - r.createdAt.getTime();
      if (ms > 0) entry.turnaroundMs.push(ms);
    }
  }

  const perReviewer = Array.from(reviewerMap.entries()).map(
    ([reviewerId, entry]) => ({
      reviewerId,
      reviewerName: entry.reviewerName,
      total: entry.total,
      approved: entry.approved,
      rejected: entry.rejected,
      changesRequested: entry.changesRequested,
      avgTurnaroundHours:
        entry.turnaroundMs.length > 0
          ? entry.turnaroundMs.reduce((a, b) => a + b, 0) /
            entry.turnaroundMs.length /
            (1000 * 60 * 60)
          : null,
    })
  );

  return {
    totalReviews,
    avgTurnaroundHours:
      avgTurnaroundHours !== null ? Math.round(avgTurnaroundHours * 100) / 100 : null,
    approvalRate: Math.round(approvalRate * 10000) / 10000, // 4 decimal places
    statusBreakdown,
    perReviewer,
  };
}

// ── Assign Reviewer ───────────────────────────────────────

export async function assignReviewer(reviewId: string, reviewerId: string) {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) {
    throw new NotFoundError('Review', reviewId);
  }

  // Verify reviewer exists
  const reviewer = await prisma.user.findUnique({ where: { id: reviewerId } });
  if (!reviewer) {
    throw new NotFoundError('User', reviewerId);
  }

  if (['approved', 'rejected'].includes(review.status)) {
    throw new ValidationError('Cannot reassign a review that is already finalized');
  }

  const updated = await prisma.review.update({
    where: { id: reviewId },
    data: { reviewerId },
    include: REVIEW_INCLUDE,
  });

  return updated;
}
