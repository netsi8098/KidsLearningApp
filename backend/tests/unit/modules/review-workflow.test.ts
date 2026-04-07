import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockPrisma, resetPrismaMocks } from '../../helpers/prisma.mock';

// ── Mock dependencies ────────────────────────────────────────
vi.mock('../../../src/lib/prisma', () => ({ prisma: mockPrisma }));

import {
  createReview,
  approveReview,
  requestChanges,
  rejectReview,
  addComment,
  assignReviewer,
} from '../../../src/modules/review/service';
import {
  NotFoundError,
  ValidationError,
  ConflictError,
} from '../../../src/lib/errors';

// ── Helpers ──────────────────────────────────────────────────

function fakeReview(overrides: Record<string, unknown> = {}) {
  return {
    id: 'review-1',
    contentId: 'content-1',
    reviewerId: 'reviewer-1',
    status: 'pending',
    summary: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

function fakeReviewWithIncludes(overrides: Record<string, unknown> = {}) {
  return {
    ...fakeReview(overrides),
    content: {
      id: 'content-1',
      title: 'Test Content',
      slug: 'test-content',
      type: 'lesson',
      status: 'review',
    },
    reviewer: {
      id: 'reviewer-1',
      name: 'Reviewer',
      email: 'reviewer@test.com',
    },
    comments: [],
  };
}

function fakeContent(overrides: Record<string, unknown> = {}) {
  return {
    id: 'content-1',
    slug: 'test-content',
    type: 'lesson',
    title: 'Test Content',
    status: 'draft',
    ...overrides,
  };
}

// ── Review Workflow State Machine Tests ───────────────────────

describe('Review Workflow State Machine', () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  // ── Create Review (pending) ──────────────────────────────

  describe('Create review (initial state: pending)', () => {
    it('should create a review with status pending', async () => {
      mockPrisma.content.findUnique.mockResolvedValue(fakeContent());
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'reviewer-1',
        name: 'Reviewer',
        email: 'reviewer@test.com',
      });
      mockPrisma.review.findFirst.mockResolvedValue(null);
      mockPrisma.content.update.mockResolvedValue(fakeContent({ status: 'review' }));
      mockPrisma.review.create.mockResolvedValue(fakeReviewWithIncludes());

      const result = await createReview({
        contentId: 'content-1',
        reviewerId: 'reviewer-1',
      });

      expect(result.status).toBe('pending');
    });

    it('should transition content from draft to review on create', async () => {
      mockPrisma.content.findUnique.mockResolvedValue(fakeContent({ status: 'draft' }));
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'reviewer-1',
        name: 'Reviewer',
      });
      mockPrisma.review.findFirst.mockResolvedValue(null);
      mockPrisma.content.update.mockResolvedValue(fakeContent({ status: 'review' }));
      mockPrisma.review.create.mockResolvedValue(fakeReviewWithIncludes());

      await createReview({
        contentId: 'content-1',
        reviewerId: 'reviewer-1',
      });

      expect(mockPrisma.content.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'content-1' },
          data: { status: 'review' },
        })
      );
    });

    it('should reject creating a duplicate active review', async () => {
      mockPrisma.content.findUnique.mockResolvedValue(fakeContent());
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'reviewer-1',
        name: 'Reviewer',
      });
      mockPrisma.review.findFirst.mockResolvedValue(fakeReview());

      await expect(
        createReview({
          contentId: 'content-1',
          reviewerId: 'reviewer-1',
        })
      ).rejects.toThrow(ConflictError);
    });

    it('should throw NotFoundError if content does not exist', async () => {
      mockPrisma.content.findUnique.mockResolvedValue(null);

      await expect(
        createReview({
          contentId: 'missing',
          reviewerId: 'reviewer-1',
        })
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError if reviewer does not exist', async () => {
      mockPrisma.content.findUnique.mockResolvedValue(fakeContent());
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        createReview({
          contentId: 'content-1',
          reviewerId: 'missing',
        })
      ).rejects.toThrow(NotFoundError);
    });
  });

  // ── pending -> in_progress ──────────────────────────────

  describe('pending -> in_progress (via addComment)', () => {
    it('should transition review from pending to in_progress on first comment', async () => {
      mockPrisma.review.findUnique.mockResolvedValue(fakeReview({ status: 'pending' }));
      mockPrisma.review.update.mockResolvedValue(
        fakeReview({ status: 'in_progress' })
      );
      mockPrisma.reviewComment.create.mockResolvedValue({
        id: 'comment-1',
        reviewId: 'review-1',
        authorId: 'reviewer-1',
        body: 'Starting review...',
        field: null,
        resolved: false,
        author: { id: 'reviewer-1', name: 'Reviewer', email: 'r@test.com' },
      });

      const comment = await addComment('review-1', 'reviewer-1', 'Starting review...');

      expect(comment).toBeDefined();
      expect(mockPrisma.review.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'review-1' },
          data: { status: 'in_progress' },
        })
      );
    });

    it('should NOT re-transition if review is already in_progress', async () => {
      mockPrisma.review.findUnique.mockResolvedValue(fakeReview({ status: 'in_progress' }));
      mockPrisma.reviewComment.create.mockResolvedValue({
        id: 'comment-2',
        reviewId: 'review-1',
        authorId: 'reviewer-1',
        body: 'Another comment',
        field: null,
        resolved: false,
        author: { id: 'reviewer-1', name: 'Reviewer', email: 'r@test.com' },
      });

      await addComment('review-1', 'reviewer-1', 'Another comment');

      // review.update should NOT be called to change status
      expect(mockPrisma.review.update).not.toHaveBeenCalled();
    });
  });

  // ── in_progress -> approved ─────────────────────────────

  describe('in_progress -> approved', () => {
    it('should approve a review in pending status', async () => {
      mockPrisma.review.findUnique.mockResolvedValue(fakeReview({ status: 'pending' }));
      mockPrisma.review.update.mockResolvedValue(
        fakeReviewWithIncludes({ status: 'approved' })
      );
      mockPrisma.content.update.mockResolvedValue(fakeContent({ status: 'approved' }));

      const result = await approveReview('review-1', 'Looks good!');

      expect(result.status).toBe('approved');
    });

    it('should approve a review in in_progress status', async () => {
      mockPrisma.review.findUnique.mockResolvedValue(fakeReview({ status: 'in_progress' }));
      mockPrisma.review.update.mockResolvedValue(
        fakeReviewWithIncludes({ status: 'approved' })
      );
      mockPrisma.content.update.mockResolvedValue(fakeContent({ status: 'approved' }));

      const result = await approveReview('review-1', 'All good!');

      expect(result.status).toBe('approved');
    });

    it('should transition content to approved when review is approved', async () => {
      mockPrisma.review.findUnique.mockResolvedValue(fakeReview({ status: 'in_progress' }));
      mockPrisma.review.update.mockResolvedValue(
        fakeReviewWithIncludes({ status: 'approved' })
      );
      mockPrisma.content.update.mockResolvedValue(fakeContent({ status: 'approved' }));

      await approveReview('review-1');

      expect(mockPrisma.content.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'content-1' },
          data: { status: 'approved' },
        })
      );
    });

    it('should reject approving an already approved review', async () => {
      mockPrisma.review.findUnique.mockResolvedValue(fakeReview({ status: 'approved' }));

      await expect(approveReview('review-1')).rejects.toThrow(ValidationError);
    });

    it('should reject approving a rejected review', async () => {
      mockPrisma.review.findUnique.mockResolvedValue(fakeReview({ status: 'rejected' }));

      await expect(approveReview('review-1')).rejects.toThrow(ValidationError);
    });
  });

  // ── in_progress -> changes_requested ────────────────────

  describe('in_progress -> changes_requested', () => {
    it('should request changes on a pending review', async () => {
      mockPrisma.review.findUnique.mockResolvedValue(fakeReview({ status: 'pending' }));
      mockPrisma.review.update.mockResolvedValue(
        fakeReviewWithIncludes({ status: 'changes_requested' })
      );

      const result = await requestChanges('review-1', 'Please fix the intro');

      expect(result.status).toBe('changes_requested');
    });

    it('should request changes on an in_progress review', async () => {
      mockPrisma.review.findUnique.mockResolvedValue(fakeReview({ status: 'in_progress' }));
      mockPrisma.review.update.mockResolvedValue(
        fakeReviewWithIncludes({ status: 'changes_requested' })
      );

      const result = await requestChanges('review-1', 'Needs rework');

      expect(result.status).toBe('changes_requested');
    });

    it('should set summary when requesting changes', async () => {
      mockPrisma.review.findUnique.mockResolvedValue(fakeReview({ status: 'in_progress' }));
      mockPrisma.review.update.mockResolvedValue(
        fakeReviewWithIncludes({ status: 'changes_requested', summary: 'Fix typos' })
      );

      await requestChanges('review-1', 'Fix typos');

      expect(mockPrisma.review.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'changes_requested',
            summary: 'Fix typos',
          }),
        })
      );
    });

    it('should reject requesting changes on an approved review', async () => {
      mockPrisma.review.findUnique.mockResolvedValue(fakeReview({ status: 'approved' }));

      await expect(
        requestChanges('review-1', 'Too late')
      ).rejects.toThrow(ValidationError);
    });

    it('should reject requesting changes on a rejected review', async () => {
      mockPrisma.review.findUnique.mockResolvedValue(fakeReview({ status: 'rejected' }));

      await expect(
        requestChanges('review-1', 'Already rejected')
      ).rejects.toThrow(ValidationError);
    });
  });

  // ── in_progress -> rejected ─────────────────────────────

  describe('in_progress -> rejected', () => {
    it('should reject a review in pending status', async () => {
      mockPrisma.review.findUnique.mockResolvedValue(fakeReview({ status: 'pending' }));
      mockPrisma.review.update.mockResolvedValue(
        fakeReviewWithIncludes({ status: 'rejected' })
      );
      mockPrisma.content.update.mockResolvedValue(fakeContent({ status: 'draft' }));

      const result = await rejectReview('review-1', 'Does not meet standards');

      expect(result.status).toBe('rejected');
    });

    it('should reject a review in in_progress status', async () => {
      mockPrisma.review.findUnique.mockResolvedValue(fakeReview({ status: 'in_progress' }));
      mockPrisma.review.update.mockResolvedValue(
        fakeReviewWithIncludes({ status: 'rejected' })
      );
      mockPrisma.content.update.mockResolvedValue(fakeContent({ status: 'draft' }));

      const result = await rejectReview('review-1', 'Poor quality');

      expect(result.status).toBe('rejected');
    });

    it('should revert content to draft when review is rejected', async () => {
      mockPrisma.review.findUnique.mockResolvedValue(fakeReview({ status: 'in_progress' }));
      mockPrisma.review.update.mockResolvedValue(
        fakeReviewWithIncludes({ status: 'rejected' })
      );
      mockPrisma.content.update.mockResolvedValue(fakeContent({ status: 'draft' }));

      await rejectReview('review-1', 'Rejected');

      expect(mockPrisma.content.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'content-1' },
          data: { status: 'draft' },
        })
      );
    });

    it('should reject rejecting an already approved review', async () => {
      mockPrisma.review.findUnique.mockResolvedValue(fakeReview({ status: 'approved' }));

      await expect(
        rejectReview('review-1', 'Changed my mind')
      ).rejects.toThrow(ValidationError);
    });
  });

  // ── changes_requested -> in_progress (resubmit) ─────────

  describe('changes_requested -> in_progress (resubmit via comment)', () => {
    it('should NOT auto-transition from changes_requested on comment (only pending does)', async () => {
      // The addComment function only transitions pending -> in_progress
      // changes_requested stays as-is until explicitly approved/rejected
      mockPrisma.review.findUnique.mockResolvedValue(
        fakeReview({ status: 'changes_requested' })
      );
      mockPrisma.reviewComment.create.mockResolvedValue({
        id: 'comment-3',
        reviewId: 'review-1',
        authorId: 'reviewer-1',
        body: 'Fixed the issues',
        field: null,
        resolved: false,
        author: { id: 'reviewer-1', name: 'Reviewer', email: 'r@test.com' },
      });

      await addComment('review-1', 'reviewer-1', 'Fixed the issues');

      // Status transition is only for pending -> in_progress
      expect(mockPrisma.review.update).not.toHaveBeenCalled();
    });
  });

  // ── Assign Reviewer ──────────────────────────────────────────

  describe('Assign reviewer', () => {
    it('should allow reassigning a pending review', async () => {
      mockPrisma.review.findUnique.mockResolvedValue(fakeReview({ status: 'pending' }));
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'reviewer-2',
        name: 'New Reviewer',
      });
      mockPrisma.review.update.mockResolvedValue(
        fakeReviewWithIncludes({ reviewerId: 'reviewer-2' })
      );

      const result = await assignReviewer('review-1', 'reviewer-2');

      expect(result).toBeDefined();
    });

    it('should allow reassigning an in_progress review', async () => {
      mockPrisma.review.findUnique.mockResolvedValue(fakeReview({ status: 'in_progress' }));
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'reviewer-2',
        name: 'New Reviewer',
      });
      mockPrisma.review.update.mockResolvedValue(
        fakeReviewWithIncludes({ reviewerId: 'reviewer-2' })
      );

      const result = await assignReviewer('review-1', 'reviewer-2');

      expect(result).toBeDefined();
    });

    it('should reject reassigning a finalized (approved) review', async () => {
      mockPrisma.review.findUnique.mockResolvedValue(fakeReview({ status: 'approved' }));
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'reviewer-2',
        name: 'New Reviewer',
      });

      await expect(
        assignReviewer('review-1', 'reviewer-2')
      ).rejects.toThrow(ValidationError);
    });

    it('should reject reassigning a finalized (rejected) review', async () => {
      mockPrisma.review.findUnique.mockResolvedValue(fakeReview({ status: 'rejected' }));
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'reviewer-2',
        name: 'New Reviewer',
      });

      await expect(
        assignReviewer('review-1', 'reviewer-2')
      ).rejects.toThrow(ValidationError);
    });

    it('should throw NotFoundError for non-existent review', async () => {
      mockPrisma.review.findUnique.mockResolvedValue(null);

      await expect(
        assignReviewer('missing', 'reviewer-2')
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError for non-existent reviewer', async () => {
      mockPrisma.review.findUnique.mockResolvedValue(fakeReview({ status: 'pending' }));
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        assignReviewer('review-1', 'missing')
      ).rejects.toThrow(NotFoundError);
    });
  });

  // ── Not Found Cases ──────────────────────────────────────────

  describe('Not found handling', () => {
    it('should throw NotFoundError when approving non-existent review', async () => {
      mockPrisma.review.findUnique.mockResolvedValue(null);

      await expect(approveReview('missing')).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError when requesting changes on non-existent review', async () => {
      mockPrisma.review.findUnique.mockResolvedValue(null);

      await expect(requestChanges('missing', 'Fix it')).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError when rejecting non-existent review', async () => {
      mockPrisma.review.findUnique.mockResolvedValue(null);

      await expect(rejectReview('missing', 'Bad')).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError when adding comment to non-existent review', async () => {
      mockPrisma.review.findUnique.mockResolvedValue(null);

      await expect(
        addComment('missing', 'user-1', 'Comment')
      ).rejects.toThrow(NotFoundError);
    });
  });
});
