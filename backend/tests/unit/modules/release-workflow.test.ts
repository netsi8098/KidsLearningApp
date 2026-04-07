import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockPrisma, resetPrismaMocks } from '../../helpers/prisma.mock';

// ── Mock dependencies ────────────────────────────────────────
vi.mock('../../../src/lib/prisma', () => ({ prisma: mockPrisma }));
vi.mock('../../../src/lib/queue', () => ({
  releaseQueue: {
    add: vi.fn(),
    getJob: vi.fn(),
  },
}));

import {
  createRelease,
  executeReleaseAction,
  updateRelease,
} from '../../../src/modules/release/service';
import { releaseQueue } from '../../../src/lib/queue';
import {
  NotFoundError,
  ValidationError,
  ConflictError,
} from '../../../src/lib/errors';

// ── Helpers ──────────────────────────────────────────────────

function fakeContent(overrides: Record<string, unknown> = {}) {
  return {
    id: 'content-1',
    slug: 'test-content',
    type: 'lesson',
    title: 'Test Content',
    status: 'approved',
    ageGroup: 'all',
    ...overrides,
  };
}

function fakeRelease(overrides: Record<string, unknown> = {}) {
  return {
    id: 'release-1',
    contentId: 'content-1',
    action: 'publish',
    status: 'pending',
    scheduledAt: null,
    executedAt: null,
    notes: null,
    createdById: 'user-1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

function fakeReleaseWithContent(overrides: Record<string, unknown> = {}) {
  const { content: contentOverride, ...releaseOverrides } = overrides;
  return {
    ...fakeRelease(releaseOverrides),
    content: contentOverride ?? fakeContent(),
  };
}

// ── Release Workflow State Machine Tests ──────────────────────

describe('Release Workflow State Machine', () => {
  beforeEach(() => {
    resetPrismaMocks();
    vi.mocked(releaseQueue.add).mockReset();
    vi.mocked(releaseQueue.getJob).mockReset();
  });

  // ── Create Release (pending or scheduled) ─────────────────

  describe('Create release (initial state)', () => {
    it('should create a release with status pending when no scheduledAt', async () => {
      mockPrisma.content.findUnique.mockResolvedValue(fakeContent({ status: 'approved' }));
      // executeReleaseAction path
      mockPrisma.release.create.mockResolvedValue(
        fakeReleaseWithContent({ status: 'pending' })
      );
      mockPrisma.release.findUnique.mockResolvedValue(
        fakeReleaseWithContent({ status: 'pending', content: fakeContent({ status: 'approved' }) })
      );
      mockPrisma.content.update.mockResolvedValue(fakeContent({ status: 'published' }));
      mockPrisma.release.update.mockResolvedValue(
        fakeReleaseWithContent({ status: 'completed' })
      );

      const result = await createRelease(
        { contentId: 'content-1', action: 'publish' },
        'user-1'
      );

      expect(result).toBeDefined();
    });

    it('should create a scheduled release when scheduledAt is provided', async () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
      mockPrisma.content.findUnique.mockResolvedValue(fakeContent({ status: 'approved' }));
      mockPrisma.release.create.mockResolvedValue(
        fakeReleaseWithContent({
          status: 'scheduled',
          scheduledAt: futureDate,
        })
      );

      const result = await createRelease(
        {
          contentId: 'content-1',
          action: 'publish',
          scheduledAt: futureDate.toISOString(),
        },
        'user-1'
      );

      expect(result.status).toBe('scheduled');
      expect(releaseQueue.add).toHaveBeenCalledWith(
        'execute-release',
        expect.objectContaining({
          releaseId: result.id,
          contentId: 'content-1',
          action: 'publish',
        }),
        expect.objectContaining({
          delay: expect.any(Number),
          jobId: expect.stringContaining('release-'),
        })
      );
    });

    it('should reject scheduling in the past', async () => {
      mockPrisma.content.findUnique.mockResolvedValue(fakeContent({ status: 'approved' }));

      const pastDate = new Date(Date.now() - 1000);

      await expect(
        createRelease(
          {
            contentId: 'content-1',
            action: 'publish',
            scheduledAt: pastDate.toISOString(),
          },
          'user-1'
        )
      ).rejects.toThrow(ValidationError);
    });

    it('should throw NotFoundError if content does not exist', async () => {
      mockPrisma.content.findUnique.mockResolvedValue(null);

      await expect(
        createRelease(
          { contentId: 'missing', action: 'publish' },
          'user-1'
        )
      ).rejects.toThrow(NotFoundError);
    });
  });

  // ── Content Status Validation for Actions ─────────────────

  describe('Content status validation for release actions', () => {
    it('should allow publish on approved content', async () => {
      mockPrisma.content.findUnique.mockResolvedValue(fakeContent({ status: 'approved' }));
      mockPrisma.release.create.mockResolvedValue(
        fakeReleaseWithContent({ status: 'pending', action: 'publish' })
      );
      mockPrisma.release.findUnique.mockResolvedValue(
        fakeReleaseWithContent({
          status: 'pending',
          action: 'publish',
          content: fakeContent({ status: 'approved' }),
        })
      );
      mockPrisma.content.update.mockResolvedValue(fakeContent({ status: 'published' }));
      mockPrisma.release.update.mockResolvedValue(
        fakeReleaseWithContent({ status: 'completed' })
      );

      await expect(
        createRelease({ contentId: 'content-1', action: 'publish' }, 'user-1')
      ).resolves.toBeDefined();
    });

    it('should allow publish on scheduled content', async () => {
      mockPrisma.content.findUnique.mockResolvedValue(fakeContent({ status: 'scheduled' }));
      mockPrisma.release.create.mockResolvedValue(
        fakeReleaseWithContent({ status: 'pending', action: 'publish' })
      );
      mockPrisma.release.findUnique.mockResolvedValue(
        fakeReleaseWithContent({
          status: 'pending',
          action: 'publish',
          content: fakeContent({ status: 'scheduled' }),
        })
      );
      mockPrisma.content.update.mockResolvedValue(fakeContent({ status: 'published' }));
      mockPrisma.release.update.mockResolvedValue(
        fakeReleaseWithContent({ status: 'completed' })
      );

      await expect(
        createRelease({ contentId: 'content-1', action: 'publish' }, 'user-1')
      ).resolves.toBeDefined();
    });

    it('should reject publish on draft content', async () => {
      mockPrisma.content.findUnique.mockResolvedValue(fakeContent({ status: 'draft' }));

      await expect(
        createRelease({ contentId: 'content-1', action: 'publish' }, 'user-1')
      ).rejects.toThrow(ValidationError);
    });

    it('should reject unpublish on draft content', async () => {
      mockPrisma.content.findUnique.mockResolvedValue(fakeContent({ status: 'draft' }));

      await expect(
        createRelease({ contentId: 'content-1', action: 'unpublish' }, 'user-1')
      ).rejects.toThrow(ValidationError);
    });

    it('should allow unpublish on published content', async () => {
      mockPrisma.content.findUnique.mockResolvedValue(fakeContent({ status: 'published' }));
      mockPrisma.release.create.mockResolvedValue(
        fakeReleaseWithContent({ action: 'unpublish' })
      );
      mockPrisma.release.findUnique.mockResolvedValue(
        fakeReleaseWithContent({
          action: 'unpublish',
          content: fakeContent({ status: 'published' }),
        })
      );
      mockPrisma.content.update.mockResolvedValue(fakeContent({ status: 'draft' }));
      mockPrisma.release.update.mockResolvedValue(
        fakeReleaseWithContent({ status: 'completed' })
      );

      await expect(
        createRelease({ contentId: 'content-1', action: 'unpublish' }, 'user-1')
      ).resolves.toBeDefined();
    });

    it('should allow archive on published content', async () => {
      mockPrisma.content.findUnique.mockResolvedValue(fakeContent({ status: 'published' }));
      mockPrisma.release.create.mockResolvedValue(
        fakeReleaseWithContent({ action: 'archive' })
      );
      mockPrisma.release.findUnique.mockResolvedValue(
        fakeReleaseWithContent({
          action: 'archive',
          content: fakeContent({ status: 'published' }),
        })
      );
      mockPrisma.content.update.mockResolvedValue(fakeContent({ status: 'archived' }));
      mockPrisma.release.update.mockResolvedValue(
        fakeReleaseWithContent({ status: 'completed' })
      );

      await expect(
        createRelease({ contentId: 'content-1', action: 'archive' }, 'user-1')
      ).resolves.toBeDefined();
    });

    it('should reject feature on draft content', async () => {
      mockPrisma.content.findUnique.mockResolvedValue(fakeContent({ status: 'draft' }));

      await expect(
        createRelease({ contentId: 'content-1', action: 'feature' }, 'user-1')
      ).rejects.toThrow(ValidationError);
    });
  });

  // ── Execute Release (pending/scheduled -> executed) ───────

  describe('Execute release', () => {
    it('should execute a pending release and mark as executed', async () => {
      mockPrisma.release.findUnique.mockResolvedValue(
        fakeReleaseWithContent({
          status: 'pending',
          action: 'publish',
          content: fakeContent({ status: 'approved' }),
        })
      );
      mockPrisma.content.update.mockResolvedValue(fakeContent({ status: 'published' }));
      mockPrisma.release.update.mockResolvedValue(
        fakeReleaseWithContent({ status: 'completed', executedAt: new Date() })
      );

      const result = await executeReleaseAction('release-1');

      expect(result.status).toBe('completed');
      expect(mockPrisma.content.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'published',
          }),
        })
      );
    });

    it('should execute a scheduled release', async () => {
      mockPrisma.release.findUnique.mockResolvedValue(
        fakeReleaseWithContent({
          status: 'scheduled',
          action: 'publish',
          content: fakeContent({ status: 'approved' }),
        })
      );
      mockPrisma.content.update.mockResolvedValue(fakeContent({ status: 'published' }));
      mockPrisma.release.update.mockResolvedValue(
        fakeReleaseWithContent({ status: 'completed' })
      );

      const result = await executeReleaseAction('release-1');

      expect(result.status).toBe('completed');
    });

    it('should reject executing an already executed release', async () => {
      mockPrisma.release.findUnique.mockResolvedValue(
        fakeReleaseWithContent({ status: 'completed' })
      );

      await expect(
        executeReleaseAction('release-1')
      ).rejects.toThrow(ConflictError);
    });

    it('should reject executing a cancelled release', async () => {
      mockPrisma.release.findUnique.mockResolvedValue(
        fakeReleaseWithContent({ status: 'cancelled' })
      );

      await expect(
        executeReleaseAction('release-1')
      ).rejects.toThrow(ConflictError);
    });

    it('should throw NotFoundError for non-existent release', async () => {
      mockPrisma.release.findUnique.mockResolvedValue(null);

      await expect(
        executeReleaseAction('missing')
      ).rejects.toThrow(NotFoundError);
    });

    it('should mark release as failed if execution throws', async () => {
      mockPrisma.release.findUnique.mockResolvedValue(
        fakeReleaseWithContent({
          status: 'pending',
          action: 'publish',
          content: fakeContent({ status: 'approved' }),
        })
      );
      mockPrisma.content.update.mockRejectedValue(new Error('Database error'));
      mockPrisma.release.update.mockResolvedValue(
        fakeReleaseWithContent({ status: 'failed', notes: 'Database error' })
      );

      await expect(
        executeReleaseAction('release-1')
      ).rejects.toThrow('Database error');

      // Should have attempted to mark as failed
      expect(mockPrisma.release.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'failed',
            notes: 'Database error',
          }),
        })
      );
    });

    it('should set publishedAt when executing a publish action', async () => {
      mockPrisma.release.findUnique.mockResolvedValue(
        fakeReleaseWithContent({
          status: 'pending',
          action: 'publish',
          content: fakeContent({ status: 'approved' }),
        })
      );
      mockPrisma.content.update.mockResolvedValue(fakeContent({ status: 'published' }));
      mockPrisma.release.update.mockResolvedValue(
        fakeReleaseWithContent({ status: 'completed' })
      );

      await executeReleaseAction('release-1');

      expect(mockPrisma.content.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'published',
            publishedAt: expect.any(Date),
          }),
        })
      );
    });

    it('should set archivedAt when executing an archive action', async () => {
      mockPrisma.release.findUnique.mockResolvedValue(
        fakeReleaseWithContent({
          status: 'pending',
          action: 'archive',
          content: fakeContent({ status: 'published' }),
        })
      );
      mockPrisma.content.update.mockResolvedValue(fakeContent({ status: 'archived' }));
      mockPrisma.release.update.mockResolvedValue(
        fakeReleaseWithContent({ status: 'completed' })
      );

      await executeReleaseAction('release-1');

      expect(mockPrisma.content.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'archived',
            archivedAt: expect.any(Date),
          }),
        })
      );
    });
  });

  // ── Cancel Release (pending/scheduled -> cancelled) ───────

  describe('Cancel release', () => {
    it('should cancel a pending release', async () => {
      mockPrisma.release.findUnique.mockResolvedValue(
        fakeRelease({ status: 'pending' })
      );
      vi.mocked(releaseQueue.getJob).mockResolvedValue(null);
      mockPrisma.release.update.mockResolvedValue(
        fakeRelease({ status: 'cancelled' })
      );

      const result = await updateRelease('release-1', { status: 'cancelled' });

      expect(result.status).toBe('cancelled');
    });

    it('should cancel a scheduled release and remove the queue job', async () => {
      mockPrisma.release.findUnique.mockResolvedValue(
        fakeRelease({ status: 'scheduled' })
      );
      const mockJob = { remove: vi.fn() };
      vi.mocked(releaseQueue.getJob).mockResolvedValue(mockJob as any);
      mockPrisma.release.update.mockResolvedValue(
        fakeRelease({ status: 'cancelled' })
      );

      await updateRelease('release-1', { status: 'cancelled' });

      expect(mockJob.remove).toHaveBeenCalled();
    });

    it('should reject cancelling an already executed release', async () => {
      mockPrisma.release.findUnique.mockResolvedValue(
        fakeRelease({ status: 'completed' })
      );

      await expect(
        updateRelease('release-1', { status: 'cancelled' })
      ).rejects.toThrow(ConflictError);
    });

    it('should reject cancelling an already cancelled release', async () => {
      mockPrisma.release.findUnique.mockResolvedValue(
        fakeRelease({ status: 'cancelled' })
      );

      await expect(
        updateRelease('release-1', { status: 'cancelled' })
      ).rejects.toThrow(ConflictError);
    });

    it('should throw NotFoundError for non-existent release', async () => {
      mockPrisma.release.findUnique.mockResolvedValue(null);

      await expect(
        updateRelease('missing', { status: 'cancelled' })
      ).rejects.toThrow(NotFoundError);
    });
  });

  // ── Reschedule Release ────────────────────────────────────

  describe('Reschedule release', () => {
    it('should reschedule a scheduled release to a new time', async () => {
      const futureDate = new Date(Date.now() + 48 * 60 * 60 * 1000);
      mockPrisma.release.findUnique.mockResolvedValue(
        fakeRelease({
          status: 'scheduled',
          scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        })
      );
      vi.mocked(releaseQueue.getJob).mockResolvedValue({ remove: vi.fn() } as any);
      mockPrisma.release.update.mockResolvedValue(
        fakeRelease({ status: 'scheduled', scheduledAt: futureDate })
      );

      const result = await updateRelease('release-1', {
        scheduledAt: futureDate.toISOString(),
      });

      expect(result.status).toBe('scheduled');
      expect(releaseQueue.add).toHaveBeenCalled();
    });

    it('should reject rescheduling to a past time', async () => {
      const pastDate = new Date(Date.now() - 1000);
      mockPrisma.release.findUnique.mockResolvedValue(
        fakeRelease({ status: 'scheduled' })
      );

      await expect(
        updateRelease('release-1', {
          scheduledAt: pastDate.toISOString(),
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should reject rescheduling an executed release', async () => {
      mockPrisma.release.findUnique.mockResolvedValue(
        fakeRelease({ status: 'completed' })
      );

      await expect(
        updateRelease('release-1', {
          scheduledAt: new Date(Date.now() + 86400000).toISOString(),
        })
      ).rejects.toThrow(ConflictError);
    });
  });

  // ── Feature / Unfeature ───────────────────────────────────

  describe('Feature and unfeature actions', () => {
    it('should set featured=true when executing a feature action', async () => {
      mockPrisma.release.findUnique.mockResolvedValue(
        fakeReleaseWithContent({
          status: 'pending',
          action: 'feature',
          content: fakeContent({ status: 'published' }),
        })
      );
      mockPrisma.content.update.mockResolvedValue(
        fakeContent({ status: 'published', featured: true })
      );
      mockPrisma.release.update.mockResolvedValue(
        fakeReleaseWithContent({ status: 'completed', action: 'feature' })
      );

      await executeReleaseAction('release-1');

      expect(mockPrisma.content.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            featured: true,
          }),
        })
      );
    });

    it('should set featured=false when executing an unfeature action', async () => {
      mockPrisma.release.findUnique.mockResolvedValue(
        fakeReleaseWithContent({
          status: 'pending',
          action: 'unfeature',
          content: fakeContent({ status: 'published' }),
        })
      );
      mockPrisma.content.update.mockResolvedValue(
        fakeContent({ status: 'published', featured: false })
      );
      mockPrisma.release.update.mockResolvedValue(
        fakeReleaseWithContent({ status: 'completed', action: 'unfeature' })
      );

      await executeReleaseAction('release-1');

      expect(mockPrisma.content.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            featured: false,
          }),
        })
      );
    });
  });
});
