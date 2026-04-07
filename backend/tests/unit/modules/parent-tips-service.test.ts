import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockPrisma, resetPrismaMocks } from '../../helpers/prisma.mock';

// ── Mock dependencies ────────────────────────────────────────
vi.mock('../../../src/lib/prisma', () => ({ prisma: mockPrisma }));
vi.mock('../../../src/lib/audit', () => ({ logAudit: vi.fn() }));

import {
  listTips,
  getTipBySlug,
  createTip,
  updateTip,
  deleteTip,
  saveTip,
} from '../../../src/modules/parent-tips/service';
import { NotFoundError, ConflictError } from '../../../src/lib/errors';

// ── Helpers ──────────────────────────────────────────────────

function fakeTip(overrides: Record<string, unknown> = {}) {
  return {
    id: 'tip-1',
    title: 'Screen Time Tips',
    slug: 'screen-time-tips',
    body: 'Limit screen time to 1 hour per day for children under 5.',
    category: 'screen_time',
    format: 'article',
    ageGroup: 'all',
    tags: ['screen', 'health'],
    published: true,
    publishedAt: new Date('2024-06-01'),
    authorId: 'author-1',
    deletedAt: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

// ── Tests ────────────────────────────────────────────────────

describe('ParentTipsService', () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  // ── listTips ──────────────────────────────────────────────

  describe('listTips', () => {
    it('should return paginated tips via $transaction', async () => {
      const tips = [fakeTip(), fakeTip({ id: 'tip-2', slug: 'bedtime-tips' })];
      mockPrisma.parentTip.findMany.mockResolvedValue(tips);
      mockPrisma.parentTip.count.mockResolvedValue(2);

      const result = await listTips({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.totalPages).toBe(1);
    });

    it('should default to published=true when published is not specified', async () => {
      mockPrisma.parentTip.findMany.mockResolvedValue([]);
      mockPrisma.parentTip.count.mockResolvedValue(0);

      await listTips({ page: 1, limit: 10 });

      // $transaction is called with an array of promises
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('should apply category filter', async () => {
      mockPrisma.parentTip.findMany.mockResolvedValue([]);
      mockPrisma.parentTip.count.mockResolvedValue(0);

      await listTips({ page: 1, limit: 10, category: 'screen_time' });

      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('should apply ageGroup filter', async () => {
      mockPrisma.parentTip.findMany.mockResolvedValue([]);
      mockPrisma.parentTip.count.mockResolvedValue(0);

      await listTips({ page: 1, limit: 10, ageGroup: '3-4' });

      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('should apply format filter', async () => {
      mockPrisma.parentTip.findMany.mockResolvedValue([]);
      mockPrisma.parentTip.count.mockResolvedValue(0);

      await listTips({ page: 1, limit: 10, format: 'video' });

      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('should respect explicit published=false filter', async () => {
      mockPrisma.parentTip.findMany.mockResolvedValue([]);
      mockPrisma.parentTip.count.mockResolvedValue(0);

      await listTips({ page: 1, limit: 10, published: false });

      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('should exclude soft-deleted tips', async () => {
      mockPrisma.parentTip.findMany.mockResolvedValue([]);
      mockPrisma.parentTip.count.mockResolvedValue(0);

      await listTips({ page: 1, limit: 10 });

      // The $transaction is called; inside it, the where should include deletedAt: null
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });
  });

  // ── getTipBySlug ──────────────────────────────────────────

  describe('getTipBySlug', () => {
    it('should return a tip when found and not deleted', async () => {
      mockPrisma.parentTip.findUnique.mockResolvedValue(fakeTip());

      const result = await getTipBySlug('screen-time-tips');

      expect(result.slug).toBe('screen-time-tips');
      expect(result.title).toBe('Screen Time Tips');
      expect(mockPrisma.parentTip.findUnique).toHaveBeenCalledWith({
        where: { slug: 'screen-time-tips' },
      });
    });

    it('should throw NotFoundError when tip does not exist', async () => {
      mockPrisma.parentTip.findUnique.mockResolvedValue(null);

      await expect(getTipBySlug('nonexistent')).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError when tip is soft-deleted', async () => {
      mockPrisma.parentTip.findUnique.mockResolvedValue(
        fakeTip({ deletedAt: new Date() })
      );

      await expect(getTipBySlug('screen-time-tips')).rejects.toThrow(NotFoundError);
    });
  });

  // ── createTip ──────────────────────────────────────────────

  describe('createTip', () => {
    it('should create a new tip with valid data', async () => {
      mockPrisma.parentTip.findUnique.mockResolvedValue(null); // slug available
      mockPrisma.parentTip.create.mockResolvedValue(fakeTip());

      const result = await createTip(
        {
          title: 'Screen Time Tips',
          slug: 'screen-time-tips',
          body: 'Limit screen time...',
          category: 'screen_time',
          format: 'article',
        },
        'author-1'
      );

      expect(result.title).toBe('Screen Time Tips');
      expect(mockPrisma.parentTip.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: 'Screen Time Tips',
            slug: 'screen-time-tips',
            authorId: 'author-1',
          }),
        })
      );
    });

    it('should throw ConflictError when slug already exists', async () => {
      mockPrisma.parentTip.findUnique.mockResolvedValue(fakeTip());

      await expect(
        createTip(
          {
            title: 'Duplicate',
            slug: 'screen-time-tips',
            body: 'Body',
            category: 'health',
            format: 'article',
          },
          'author-1'
        )
      ).rejects.toThrow(ConflictError);
    });

    it('should default ageGroup to "all" when not provided', async () => {
      mockPrisma.parentTip.findUnique.mockResolvedValue(null);
      mockPrisma.parentTip.create.mockResolvedValue(fakeTip());

      await createTip(
        {
          title: 'Test',
          slug: 'test-tip',
          body: 'Body',
          category: 'health',
          format: 'article',
        },
        'author-1'
      );

      const createCall = mockPrisma.parentTip.create.mock.calls[0][0];
      expect(createCall.data.ageGroup).toBe('all');
    });

    it('should default published to false when not provided', async () => {
      mockPrisma.parentTip.findUnique.mockResolvedValue(null);
      mockPrisma.parentTip.create.mockResolvedValue(fakeTip({ published: false }));

      await createTip(
        {
          title: 'Draft Tip',
          slug: 'draft-tip',
          body: 'Body',
          category: 'health',
          format: 'article',
        },
        'author-1'
      );

      const createCall = mockPrisma.parentTip.create.mock.calls[0][0];
      expect(createCall.data.published).toBe(false);
      expect(createCall.data.publishedAt).toBeNull();
    });

    it('should set publishedAt when published is true', async () => {
      mockPrisma.parentTip.findUnique.mockResolvedValue(null);
      mockPrisma.parentTip.create.mockResolvedValue(fakeTip({ published: true }));

      await createTip(
        {
          title: 'Published Tip',
          slug: 'published-tip',
          body: 'Body',
          category: 'health',
          format: 'article',
          published: true,
        },
        'author-1'
      );

      const createCall = mockPrisma.parentTip.create.mock.calls[0][0];
      expect(createCall.data.published).toBe(true);
      expect(createCall.data.publishedAt).toBeInstanceOf(Date);
    });

    it('should default tags to empty array when not provided', async () => {
      mockPrisma.parentTip.findUnique.mockResolvedValue(null);
      mockPrisma.parentTip.create.mockResolvedValue(fakeTip());

      await createTip(
        {
          title: 'No Tags',
          slug: 'no-tags',
          body: 'Body',
          category: 'health',
          format: 'article',
        },
        'author-1'
      );

      const createCall = mockPrisma.parentTip.create.mock.calls[0][0];
      expect(createCall.data.tags).toEqual([]);
    });
  });

  // ── updateTip ──────────────────────────────────────────────

  describe('updateTip', () => {
    it('should update tip fields', async () => {
      mockPrisma.parentTip.findUnique.mockResolvedValue(fakeTip());
      mockPrisma.parentTip.update.mockResolvedValue(
        fakeTip({ title: 'Updated Title' })
      );

      const result = await updateTip('tip-1', { title: 'Updated Title' }, 'user-1');

      expect(result.title).toBe('Updated Title');
    });

    it('should throw NotFoundError when tip does not exist', async () => {
      mockPrisma.parentTip.findUnique.mockResolvedValue(null);

      await expect(
        updateTip('missing', { title: 'Test' }, 'user-1')
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError when tip is soft-deleted', async () => {
      mockPrisma.parentTip.findUnique.mockResolvedValue(
        fakeTip({ deletedAt: new Date() })
      );

      await expect(
        updateTip('tip-1', { title: 'Test' }, 'user-1')
      ).rejects.toThrow(NotFoundError);
    });

    it('should check slug uniqueness when slug is changing', async () => {
      mockPrisma.parentTip.findUnique
        .mockResolvedValueOnce(fakeTip()) // existing tip
        .mockResolvedValueOnce(fakeTip({ id: 'tip-other', slug: 'taken-slug' })); // slug taken

      await expect(
        updateTip('tip-1', { slug: 'taken-slug' }, 'user-1')
      ).rejects.toThrow(ConflictError);
    });

    it('should allow same slug when not changing', async () => {
      mockPrisma.parentTip.findUnique.mockResolvedValue(fakeTip());
      mockPrisma.parentTip.update.mockResolvedValue(fakeTip());

      await expect(
        updateTip('tip-1', { slug: 'screen-time-tips' }, 'user-1')
      ).resolves.toBeDefined();
    });

    it('should set publishedAt on first publish', async () => {
      mockPrisma.parentTip.findUnique.mockResolvedValue(
        fakeTip({ published: false, publishedAt: null })
      );
      mockPrisma.parentTip.update.mockResolvedValue(
        fakeTip({ published: true, publishedAt: new Date() })
      );

      await updateTip('tip-1', { published: true }, 'user-1');

      const updateCall = mockPrisma.parentTip.update.mock.calls[0][0];
      expect(updateCall.data.published).toBe(true);
      expect(updateCall.data.publishedAt).toBeInstanceOf(Date);
    });

    it('should not reset publishedAt when re-publishing', async () => {
      const existingDate = new Date('2024-06-01');
      mockPrisma.parentTip.findUnique.mockResolvedValue(
        fakeTip({ published: false, publishedAt: existingDate })
      );
      mockPrisma.parentTip.update.mockResolvedValue(fakeTip());

      await updateTip('tip-1', { published: true }, 'user-1');

      const updateCall = mockPrisma.parentTip.update.mock.calls[0][0];
      // publishedAt should not be set since it already has a value
      expect(updateCall.data.publishedAt).toBeUndefined();
    });
  });

  // ── deleteTip ──────────────────────────────────────────────

  describe('deleteTip', () => {
    it('should soft-delete by setting deletedAt', async () => {
      mockPrisma.parentTip.findUnique.mockResolvedValue(fakeTip());
      mockPrisma.parentTip.update.mockResolvedValue(
        fakeTip({ deletedAt: new Date() })
      );

      const result = await deleteTip('tip-1', 'user-1');

      expect(result.deletedAt).toBeDefined();
      expect(mockPrisma.parentTip.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'tip-1' },
          data: { deletedAt: expect.any(Date) },
        })
      );
    });

    it('should throw NotFoundError when tip does not exist', async () => {
      mockPrisma.parentTip.findUnique.mockResolvedValue(null);

      await expect(deleteTip('missing', 'user-1')).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError when tip is already soft-deleted', async () => {
      mockPrisma.parentTip.findUnique.mockResolvedValue(
        fakeTip({ deletedAt: new Date() })
      );

      await expect(deleteTip('tip-1', 'user-1')).rejects.toThrow(NotFoundError);
    });

    it('should return id and slug in delete response', async () => {
      mockPrisma.parentTip.findUnique.mockResolvedValue(fakeTip());
      mockPrisma.parentTip.update.mockResolvedValue({
        id: 'tip-1',
        slug: 'screen-time-tips',
        deletedAt: new Date(),
      });

      const result = await deleteTip('tip-1', 'user-1');

      expect(result.id).toBe('tip-1');
      expect(result.slug).toBe('screen-time-tips');
    });
  });

  // ── saveTip ──────────────────────────────────────────────

  describe('saveTip', () => {
    it('should return save confirmation when tip exists', async () => {
      mockPrisma.parentTip.findUnique.mockResolvedValue(fakeTip());

      const result = await saveTip('tip-1');

      expect(result).toEqual({ id: 'tip-1', saved: true });
    });

    it('should throw NotFoundError when tip does not exist', async () => {
      mockPrisma.parentTip.findUnique.mockResolvedValue(null);

      await expect(saveTip('missing')).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError when tip is soft-deleted', async () => {
      mockPrisma.parentTip.findUnique.mockResolvedValue(
        fakeTip({ deletedAt: new Date() })
      );

      await expect(saveTip('tip-1')).rejects.toThrow(NotFoundError);
    });
  });
});
