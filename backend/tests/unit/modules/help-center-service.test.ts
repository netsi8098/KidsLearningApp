import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockPrisma, resetPrismaMocks } from '../../helpers/prisma.mock';

// ── Mock dependencies ────────────────────────────────────────
vi.mock('../../../src/lib/prisma', () => ({ prisma: mockPrisma }));
vi.mock('../../../src/lib/audit', () => ({ logAudit: vi.fn() }));

import {
  listArticles,
  getArticleBySlug,
  createArticle,
  updateArticle,
  deleteArticle,
  submitArticleFeedback,
  listTickets,
  getTicket,
  createTicket,
  updateTicket,
} from '../../../src/modules/help-center/service';
import { NotFoundError, ConflictError } from '../../../src/lib/errors';

// ── Helpers ──────────────────────────────────────────────────

function fakeArticle(overrides: Record<string, unknown> = {}) {
  return {
    id: 'article-1',
    title: 'How to Set Up Parental Controls',
    slug: 'parental-controls-setup',
    body: 'Follow these steps to set up parental controls...',
    category: 'getting_started',
    searchKeywords: ['parental', 'controls', 'setup'],
    relatedFeature: 'parental_settings',
    orderIndex: 0,
    published: true,
    helpfulYes: 10,
    helpfulNo: 2,
    deletedAt: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

function fakeTicket(overrides: Record<string, unknown> = {}) {
  return {
    id: 'ticket-1',
    parentEmail: 'parent@test.com',
    subject: 'Cannot access premium content',
    body: 'I subscribed but still cannot access premium content.',
    category: 'billing',
    householdId: 'hh-1',
    status: 'open',
    priority: 'normal',
    assignee: null,
    resolvedAt: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

// ── Tests ────────────────────────────────────────────────────

describe('HelpCenterService', () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  // ══════════════════════════════════════════════════════════
  //  HELP ARTICLES
  // ══════════════════════════════════════════════════════════

  // ── listArticles ──────────────────────────────────────────

  describe('listArticles', () => {
    it('should return paginated articles', async () => {
      const articles = [fakeArticle(), fakeArticle({ id: 'article-2' })];
      mockPrisma.helpArticle.findMany.mockResolvedValue(articles);
      mockPrisma.helpArticle.count.mockResolvedValue(2);

      const result = await listArticles({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.totalPages).toBe(1);
    });

    it('should apply category filter', async () => {
      mockPrisma.helpArticle.findMany.mockResolvedValue([]);
      mockPrisma.helpArticle.count.mockResolvedValue(0);

      await listArticles({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        category: 'getting_started',
      });

      const call = mockPrisma.helpArticle.findMany.mock.calls[0][0];
      expect(call.where.category).toBe('getting_started');
    });

    it('should apply published filter', async () => {
      mockPrisma.helpArticle.findMany.mockResolvedValue([]);
      mockPrisma.helpArticle.count.mockResolvedValue(0);

      await listArticles({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        published: true,
      });

      const call = mockPrisma.helpArticle.findMany.mock.calls[0][0];
      expect(call.where.published).toBe(true);
    });

    it('should apply search filter with OR conditions', async () => {
      mockPrisma.helpArticle.findMany.mockResolvedValue([]);
      mockPrisma.helpArticle.count.mockResolvedValue(0);

      await listArticles({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        search: 'parental',
      });

      const call = mockPrisma.helpArticle.findMany.mock.calls[0][0];
      expect(call.where.OR).toBeDefined();
      expect(call.where.OR).toHaveLength(4);
    });

    it('should exclude soft-deleted articles', async () => {
      mockPrisma.helpArticle.findMany.mockResolvedValue([]);
      mockPrisma.helpArticle.count.mockResolvedValue(0);

      await listArticles({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      const call = mockPrisma.helpArticle.findMany.mock.calls[0][0];
      expect(call.where.deletedAt).toBeNull();
    });

    it('should calculate totalPages correctly', async () => {
      mockPrisma.helpArticle.findMany.mockResolvedValue([fakeArticle()]);
      mockPrisma.helpArticle.count.mockResolvedValue(25);

      const result = await listArticles({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      expect(result.totalPages).toBe(3);
    });

    it('should compute skip from page and limit', async () => {
      mockPrisma.helpArticle.findMany.mockResolvedValue([]);
      mockPrisma.helpArticle.count.mockResolvedValue(0);

      await listArticles({
        page: 3,
        limit: 5,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      const call = mockPrisma.helpArticle.findMany.mock.calls[0][0];
      expect(call.skip).toBe(10); // (3-1) * 5
      expect(call.take).toBe(5);
    });
  });

  // ── getArticleBySlug ──────────────────────────────────────

  describe('getArticleBySlug', () => {
    it('should return article when found and not deleted', async () => {
      mockPrisma.helpArticle.findUnique.mockResolvedValue(fakeArticle());

      const result = await getArticleBySlug('parental-controls-setup');

      expect(result.slug).toBe('parental-controls-setup');
      expect(mockPrisma.helpArticle.findUnique).toHaveBeenCalledWith({
        where: { slug: 'parental-controls-setup' },
      });
    });

    it('should throw NotFoundError when article does not exist', async () => {
      mockPrisma.helpArticle.findUnique.mockResolvedValue(null);

      await expect(getArticleBySlug('nonexistent')).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError when article is soft-deleted', async () => {
      mockPrisma.helpArticle.findUnique.mockResolvedValue(
        fakeArticle({ deletedAt: new Date() })
      );

      await expect(
        getArticleBySlug('parental-controls-setup')
      ).rejects.toThrow(NotFoundError);
    });
  });

  // ── createArticle ──────────────────────────────────────────

  describe('createArticle', () => {
    it('should create an article with valid data', async () => {
      mockPrisma.helpArticle.findUnique.mockResolvedValue(null); // slug available
      mockPrisma.helpArticle.create.mockResolvedValue(fakeArticle());

      const result = await createArticle(
        {
          title: 'How to Set Up Parental Controls',
          slug: 'parental-controls-setup',
          body: 'Follow these steps...',
          category: 'getting_started',
        },
        'admin-1'
      );

      expect(result.title).toBe('How to Set Up Parental Controls');
      expect(mockPrisma.helpArticle.create).toHaveBeenCalled();
    });

    it('should throw ConflictError when slug already exists', async () => {
      mockPrisma.helpArticle.findUnique.mockResolvedValue(fakeArticle());

      await expect(
        createArticle(
          {
            title: 'Duplicate',
            slug: 'parental-controls-setup',
            body: 'Body',
            category: 'getting_started',
          },
          'admin-1'
        )
      ).rejects.toThrow(ConflictError);
    });

    it('should default searchKeywords to empty array', async () => {
      mockPrisma.helpArticle.findUnique.mockResolvedValue(null);
      mockPrisma.helpArticle.create.mockResolvedValue(fakeArticle());

      await createArticle(
        {
          title: 'Test Article',
          slug: 'test-article',
          body: 'Body',
          category: 'faq',
        },
        'admin-1'
      );

      const createCall = mockPrisma.helpArticle.create.mock.calls[0][0];
      expect(createCall.data.searchKeywords).toEqual([]);
    });

    it('should default published to false', async () => {
      mockPrisma.helpArticle.findUnique.mockResolvedValue(null);
      mockPrisma.helpArticle.create.mockResolvedValue(fakeArticle({ published: false }));

      await createArticle(
        {
          title: 'Draft Article',
          slug: 'draft-article',
          body: 'Body',
          category: 'faq',
        },
        'admin-1'
      );

      const createCall = mockPrisma.helpArticle.create.mock.calls[0][0];
      expect(createCall.data.published).toBe(false);
    });

    it('should default orderIndex to 0', async () => {
      mockPrisma.helpArticle.findUnique.mockResolvedValue(null);
      mockPrisma.helpArticle.create.mockResolvedValue(fakeArticle());

      await createArticle(
        {
          title: 'Test',
          slug: 'test',
          body: 'Body',
          category: 'faq',
        },
        'admin-1'
      );

      const createCall = mockPrisma.helpArticle.create.mock.calls[0][0];
      expect(createCall.data.orderIndex).toBe(0);
    });
  });

  // ── updateArticle ──────────────────────────────────────────

  describe('updateArticle', () => {
    it('should update article fields', async () => {
      mockPrisma.helpArticle.findUnique.mockResolvedValue(fakeArticle());
      mockPrisma.helpArticle.update.mockResolvedValue(
        fakeArticle({ title: 'Updated Title' })
      );

      const result = await updateArticle(
        'article-1',
        { title: 'Updated Title' },
        'admin-1'
      );

      expect(result.title).toBe('Updated Title');
    });

    it('should throw NotFoundError when article does not exist', async () => {
      mockPrisma.helpArticle.findUnique.mockResolvedValue(null);

      await expect(
        updateArticle('missing', { title: 'Test' }, 'admin-1')
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError when article is soft-deleted', async () => {
      mockPrisma.helpArticle.findUnique.mockResolvedValue(
        fakeArticle({ deletedAt: new Date() })
      );

      await expect(
        updateArticle('article-1', { title: 'Test' }, 'admin-1')
      ).rejects.toThrow(NotFoundError);
    });

    it('should check slug uniqueness when slug is changing', async () => {
      mockPrisma.helpArticle.findUnique
        .mockResolvedValueOnce(fakeArticle()) // existing article
        .mockResolvedValueOnce(fakeArticle({ id: 'other', slug: 'taken' })); // slug taken

      await expect(
        updateArticle('article-1', { slug: 'taken' }, 'admin-1')
      ).rejects.toThrow(ConflictError);
    });

    it('should allow same slug when not changing', async () => {
      mockPrisma.helpArticle.findUnique.mockResolvedValue(fakeArticle());
      mockPrisma.helpArticle.update.mockResolvedValue(fakeArticle());

      await expect(
        updateArticle('article-1', { slug: 'parental-controls-setup' }, 'admin-1')
      ).resolves.toBeDefined();
    });

    it('should only include defined fields in the update', async () => {
      mockPrisma.helpArticle.findUnique.mockResolvedValue(fakeArticle());
      mockPrisma.helpArticle.update.mockResolvedValue(fakeArticle());

      await updateArticle('article-1', { title: 'New Title' }, 'admin-1');

      const updateCall = mockPrisma.helpArticle.update.mock.calls[0][0];
      expect(updateCall.data.title).toBe('New Title');
      expect(updateCall.data.body).toBeUndefined();
      expect(updateCall.data.category).toBeUndefined();
    });
  });

  // ── deleteArticle ──────────────────────────────────────────

  describe('deleteArticle', () => {
    it('should soft-delete by setting deletedAt', async () => {
      mockPrisma.helpArticle.findUnique.mockResolvedValue(fakeArticle());
      mockPrisma.helpArticle.update.mockResolvedValue({
        id: 'article-1',
        slug: 'parental-controls-setup',
        deletedAt: new Date(),
      });

      const result = await deleteArticle('article-1', 'admin-1');

      expect(result.deletedAt).toBeInstanceOf(Date);
      expect(mockPrisma.helpArticle.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'article-1' },
          data: { deletedAt: expect.any(Date) },
        })
      );
    });

    it('should throw NotFoundError when article does not exist', async () => {
      mockPrisma.helpArticle.findUnique.mockResolvedValue(null);

      await expect(deleteArticle('missing', 'admin-1')).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError when article is already soft-deleted', async () => {
      mockPrisma.helpArticle.findUnique.mockResolvedValue(
        fakeArticle({ deletedAt: new Date() })
      );

      await expect(deleteArticle('article-1', 'admin-1')).rejects.toThrow(NotFoundError);
    });
  });

  // ── submitArticleFeedback ──────────────────────────────────

  describe('submitArticleFeedback', () => {
    it('should increment helpfulYes when helpful is true', async () => {
      mockPrisma.helpArticle.findUnique.mockResolvedValue(fakeArticle());
      mockPrisma.helpArticle.update.mockResolvedValue(
        fakeArticle({ helpfulYes: 11 })
      );

      const result = await submitArticleFeedback('article-1', true);

      expect(mockPrisma.helpArticle.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'article-1' },
          data: { helpfulYes: { increment: 1 } },
        })
      );
    });

    it('should increment helpfulNo when helpful is false', async () => {
      mockPrisma.helpArticle.findUnique.mockResolvedValue(fakeArticle());
      mockPrisma.helpArticle.update.mockResolvedValue(
        fakeArticle({ helpfulNo: 3 })
      );

      await submitArticleFeedback('article-1', false);

      expect(mockPrisma.helpArticle.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'article-1' },
          data: { helpfulNo: { increment: 1 } },
        })
      );
    });

    it('should throw NotFoundError when article does not exist', async () => {
      mockPrisma.helpArticle.findUnique.mockResolvedValue(null);

      await expect(
        submitArticleFeedback('missing', true)
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError when article is soft-deleted', async () => {
      mockPrisma.helpArticle.findUnique.mockResolvedValue(
        fakeArticle({ deletedAt: new Date() })
      );

      await expect(
        submitArticleFeedback('article-1', true)
      ).rejects.toThrow(NotFoundError);
    });
  });

  // ══════════════════════════════════════════════════════════
  //  SUPPORT TICKETS
  // ══════════════════════════════════════════════════════════

  // ── listTickets ──────────────────────────────────────────

  describe('listTickets', () => {
    it('should return paginated tickets', async () => {
      const tickets = [fakeTicket(), fakeTicket({ id: 'ticket-2' })];
      mockPrisma.supportTicket.findMany.mockResolvedValue(tickets);
      mockPrisma.supportTicket.count.mockResolvedValue(2);

      const result = await listTickets({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should apply status filter', async () => {
      mockPrisma.supportTicket.findMany.mockResolvedValue([]);
      mockPrisma.supportTicket.count.mockResolvedValue(0);

      await listTickets({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        status: 'open',
      });

      const call = mockPrisma.supportTicket.findMany.mock.calls[0][0];
      expect(call.where.status).toBe('open');
    });

    it('should apply priority filter', async () => {
      mockPrisma.supportTicket.findMany.mockResolvedValue([]);
      mockPrisma.supportTicket.count.mockResolvedValue(0);

      await listTickets({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        priority: 'urgent',
      });

      const call = mockPrisma.supportTicket.findMany.mock.calls[0][0];
      expect(call.where.priority).toBe('urgent');
    });

    it('should apply both status and priority filters', async () => {
      mockPrisma.supportTicket.findMany.mockResolvedValue([]);
      mockPrisma.supportTicket.count.mockResolvedValue(0);

      await listTickets({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        status: 'in_progress',
        priority: 'high',
      });

      const call = mockPrisma.supportTicket.findMany.mock.calls[0][0];
      expect(call.where.status).toBe('in_progress');
      expect(call.where.priority).toBe('high');
    });
  });

  // ── getTicket ──────────────────────────────────────────────

  describe('getTicket', () => {
    it('should return ticket when found', async () => {
      mockPrisma.supportTicket.findUnique.mockResolvedValue(fakeTicket());

      const result = await getTicket('ticket-1');

      expect(result.id).toBe('ticket-1');
      expect(result.subject).toBe('Cannot access premium content');
    });

    it('should throw NotFoundError when ticket does not exist', async () => {
      mockPrisma.supportTicket.findUnique.mockResolvedValue(null);

      await expect(getTicket('missing')).rejects.toThrow(NotFoundError);
    });
  });

  // ── createTicket ──────────────────────────────────────────

  describe('createTicket', () => {
    it('should create a ticket with default status and priority', async () => {
      mockPrisma.supportTicket.create.mockResolvedValue(fakeTicket());

      const result = await createTicket({
        parentEmail: 'parent@test.com',
        subject: 'Cannot access premium content',
        body: 'I subscribed but still cannot access.',
        category: 'billing',
      });

      expect(result.id).toBe('ticket-1');
      const createCall = mockPrisma.supportTicket.create.mock.calls[0][0];
      expect(createCall.data.status).toBe('open');
      expect(createCall.data.priority).toBe('normal');
    });

    it('should set householdId to null when not provided', async () => {
      mockPrisma.supportTicket.create.mockResolvedValue(
        fakeTicket({ householdId: null })
      );

      await createTicket({
        parentEmail: 'parent@test.com',
        subject: 'Test',
        body: 'Body',
        category: 'general',
      });

      const createCall = mockPrisma.supportTicket.create.mock.calls[0][0];
      expect(createCall.data.householdId).toBeNull();
    });

    it('should set householdId when provided', async () => {
      mockPrisma.supportTicket.create.mockResolvedValue(fakeTicket());

      await createTicket({
        parentEmail: 'parent@test.com',
        subject: 'Test',
        body: 'Body',
        category: 'general',
        householdId: 'hh-1',
      });

      const createCall = mockPrisma.supportTicket.create.mock.calls[0][0];
      expect(createCall.data.householdId).toBe('hh-1');
    });
  });

  // ── updateTicket ──────────────────────────────────────────

  describe('updateTicket', () => {
    it('should update ticket status', async () => {
      mockPrisma.supportTicket.findUnique.mockResolvedValue(fakeTicket());
      mockPrisma.supportTicket.update.mockResolvedValue(
        fakeTicket({ status: 'in_progress' })
      );

      const result = await updateTicket(
        'ticket-1',
        { status: 'in_progress' },
        'admin-1'
      );

      expect(result.status).toBe('in_progress');
    });

    it('should throw NotFoundError when ticket does not exist', async () => {
      mockPrisma.supportTicket.findUnique.mockResolvedValue(null);

      await expect(
        updateTicket('missing', { status: 'closed' }, 'admin-1')
      ).rejects.toThrow(NotFoundError);
    });

    it('should set resolvedAt when status changes to resolved', async () => {
      mockPrisma.supportTicket.findUnique.mockResolvedValue(
        fakeTicket({ resolvedAt: null })
      );
      mockPrisma.supportTicket.update.mockResolvedValue(
        fakeTicket({ status: 'resolved', resolvedAt: new Date() })
      );

      await updateTicket('ticket-1', { status: 'resolved' }, 'admin-1');

      const updateCall = mockPrisma.supportTicket.update.mock.calls[0][0];
      expect(updateCall.data.status).toBe('resolved');
      expect(updateCall.data.resolvedAt).toBeInstanceOf(Date);
    });

    it('should set resolvedAt when status changes to closed', async () => {
      mockPrisma.supportTicket.findUnique.mockResolvedValue(
        fakeTicket({ resolvedAt: null })
      );
      mockPrisma.supportTicket.update.mockResolvedValue(
        fakeTicket({ status: 'closed' })
      );

      await updateTicket('ticket-1', { status: 'closed' }, 'admin-1');

      const updateCall = mockPrisma.supportTicket.update.mock.calls[0][0];
      expect(updateCall.data.resolvedAt).toBeInstanceOf(Date);
    });

    it('should clear resolvedAt when re-opening a ticket', async () => {
      mockPrisma.supportTicket.findUnique.mockResolvedValue(
        fakeTicket({ status: 'resolved', resolvedAt: new Date() })
      );
      mockPrisma.supportTicket.update.mockResolvedValue(
        fakeTicket({ status: 'open', resolvedAt: null })
      );

      await updateTicket('ticket-1', { status: 'open' }, 'admin-1');

      const updateCall = mockPrisma.supportTicket.update.mock.calls[0][0];
      expect(updateCall.data.resolvedAt).toBeNull();
    });

    it('should clear resolvedAt when moving to in_progress', async () => {
      mockPrisma.supportTicket.findUnique.mockResolvedValue(
        fakeTicket({ status: 'resolved', resolvedAt: new Date() })
      );
      mockPrisma.supportTicket.update.mockResolvedValue(
        fakeTicket({ status: 'in_progress' })
      );

      await updateTicket('ticket-1', { status: 'in_progress' }, 'admin-1');

      const updateCall = mockPrisma.supportTicket.update.mock.calls[0][0];
      expect(updateCall.data.resolvedAt).toBeNull();
    });

    it('should clear resolvedAt when moving to waiting', async () => {
      mockPrisma.supportTicket.findUnique.mockResolvedValue(
        fakeTicket({ status: 'resolved', resolvedAt: new Date() })
      );
      mockPrisma.supportTicket.update.mockResolvedValue(
        fakeTicket({ status: 'waiting' })
      );

      await updateTicket('ticket-1', { status: 'waiting' }, 'admin-1');

      const updateCall = mockPrisma.supportTicket.update.mock.calls[0][0];
      expect(updateCall.data.resolvedAt).toBeNull();
    });

    it('should update priority', async () => {
      mockPrisma.supportTicket.findUnique.mockResolvedValue(fakeTicket());
      mockPrisma.supportTicket.update.mockResolvedValue(
        fakeTicket({ priority: 'urgent' })
      );

      await updateTicket('ticket-1', { priority: 'urgent' }, 'admin-1');

      const updateCall = mockPrisma.supportTicket.update.mock.calls[0][0];
      expect(updateCall.data.priority).toBe('urgent');
    });

    it('should update assignee', async () => {
      mockPrisma.supportTicket.findUnique.mockResolvedValue(fakeTicket());
      mockPrisma.supportTicket.update.mockResolvedValue(
        fakeTicket({ assignee: 'agent-1' })
      );

      await updateTicket('ticket-1', { assignee: 'agent-1' }, 'admin-1');

      const updateCall = mockPrisma.supportTicket.update.mock.calls[0][0];
      expect(updateCall.data.assignee).toBe('agent-1');
    });

    it('should not set resolvedAt when already resolved and staying resolved', async () => {
      const existingResolvedAt = new Date('2024-03-01');
      mockPrisma.supportTicket.findUnique.mockResolvedValue(
        fakeTicket({ status: 'resolved', resolvedAt: existingResolvedAt })
      );
      mockPrisma.supportTicket.update.mockResolvedValue(fakeTicket());

      await updateTicket('ticket-1', { status: 'resolved' }, 'admin-1');

      const updateCall = mockPrisma.supportTicket.update.mock.calls[0][0];
      // resolvedAt should not be overwritten since it already exists
      expect(updateCall.data.resolvedAt).toBeUndefined();
    });
  });
});
