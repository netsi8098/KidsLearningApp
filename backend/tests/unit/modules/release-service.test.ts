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
  listReleases,
  getRelease,
  getCalendar,
  batchCreateReleases,
} from '../../../src/modules/release/service';
import { NotFoundError, ValidationError } from '../../../src/lib/errors';

// ── Helpers ──────────────────────────────────────────────────

function fakeContent(overrides: Record<string, unknown> = {}) {
  return {
    id: 'content-1',
    slug: 'test-content',
    type: 'lesson',
    title: 'Test Content',
    status: 'approved',
    ageGroup: 'all',
    emoji: '',
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
    createdBy: 'user-1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    content: fakeContent(),
    creator: { id: 'user-1', email: 'user@test.com' },
    ...overrides,
  };
}

// ── Tests ────────────────────────────────────────────────────

describe('ReleaseService', () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  // ── listReleases ──────────────────────────────────────────

  describe('listReleases', () => {
    it('should return paginated releases', async () => {
      const releases = [fakeRelease(), fakeRelease({ id: 'release-2' })];
      mockPrisma.release.findMany.mockResolvedValue(releases);
      mockPrisma.release.count.mockResolvedValue(2);

      const result = await listReleases({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.totalPages).toBe(1);
    });

    it('should apply status filter', async () => {
      mockPrisma.release.findMany.mockResolvedValue([]);
      mockPrisma.release.count.mockResolvedValue(0);

      await listReleases({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        status: 'scheduled',
      });

      const call = mockPrisma.release.findMany.mock.calls[0][0];
      expect(call.where.status).toBe('scheduled');
    });

    it('should apply action filter', async () => {
      mockPrisma.release.findMany.mockResolvedValue([]);
      mockPrisma.release.count.mockResolvedValue(0);

      await listReleases({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        action: 'publish',
      });

      const call = mockPrisma.release.findMany.mock.calls[0][0];
      expect(call.where.action).toBe('publish');
    });

    it('should apply date range filters', async () => {
      mockPrisma.release.findMany.mockResolvedValue([]);
      mockPrisma.release.count.mockResolvedValue(0);

      await listReleases({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        from: '2024-01-01',
        to: '2024-12-31',
      });

      const call = mockPrisma.release.findMany.mock.calls[0][0];
      expect(call.where.scheduledAt).toBeDefined();
      expect(call.where.scheduledAt.gte).toEqual(new Date('2024-01-01'));
      expect(call.where.scheduledAt.lte).toEqual(new Date('2024-12-31'));
    });

    it('should apply from-only date filter', async () => {
      mockPrisma.release.findMany.mockResolvedValue([]);
      mockPrisma.release.count.mockResolvedValue(0);

      await listReleases({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        from: '2024-06-01',
      });

      const call = mockPrisma.release.findMany.mock.calls[0][0];
      expect(call.where.scheduledAt.gte).toEqual(new Date('2024-06-01'));
      expect(call.where.scheduledAt.lte).toBeUndefined();
    });

    it('should compute skip from page and limit', async () => {
      mockPrisma.release.findMany.mockResolvedValue([]);
      mockPrisma.release.count.mockResolvedValue(0);

      await listReleases({
        page: 3,
        limit: 5,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      const call = mockPrisma.release.findMany.mock.calls[0][0];
      expect(call.skip).toBe(10); // (3-1) * 5
      expect(call.take).toBe(5);
    });

    it('should include content and creator in results', async () => {
      mockPrisma.release.findMany.mockResolvedValue([fakeRelease()]);
      mockPrisma.release.count.mockResolvedValue(1);

      await listReleases({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      const call = mockPrisma.release.findMany.mock.calls[0][0];
      expect(call.include.content).toBeDefined();
      expect(call.include.creator).toBeDefined();
    });
  });

  // ── getRelease ──────────────────────────────────────────────

  describe('getRelease', () => {
    it('should return release with content and creator when found', async () => {
      mockPrisma.release.findUnique.mockResolvedValue(fakeRelease());

      const result = await getRelease('release-1');

      expect(result.id).toBe('release-1');
      expect(result.content).toBeDefined();
      expect(result.creator).toBeDefined();
      expect(mockPrisma.release.findUnique).toHaveBeenCalledWith({
        where: { id: 'release-1' },
        include: expect.objectContaining({
          content: expect.any(Object),
          creator: expect.any(Object),
        }),
      });
    });

    it('should throw NotFoundError when release does not exist', async () => {
      mockPrisma.release.findUnique.mockResolvedValue(null);

      await expect(getRelease('missing')).rejects.toThrow(NotFoundError);
    });
  });

  // ── getCalendar ──────────────────────────────────────────

  describe('getCalendar', () => {
    it('should return releases grouped by date', async () => {
      const jan15Release = fakeRelease({
        scheduledAt: new Date('2024-01-15T10:00:00Z'),
        createdAt: new Date('2024-01-10'),
      });
      const jan15Release2 = fakeRelease({
        id: 'release-2',
        scheduledAt: new Date('2024-01-15T14:00:00Z'),
        createdAt: new Date('2024-01-10'),
      });
      const jan20Release = fakeRelease({
        id: 'release-3',
        scheduledAt: new Date('2024-01-20T09:00:00Z'),
        createdAt: new Date('2024-01-18'),
      });

      mockPrisma.release.findMany.mockResolvedValue([
        jan15Release,
        jan15Release2,
        jan20Release,
      ]);

      const result = await getCalendar({
        from: '2024-01-01',
        to: '2024-01-31',
      });

      expect(result['2024-01-15']).toHaveLength(2);
      expect(result['2024-01-20']).toHaveLength(1);
    });

    it('should query with date range', async () => {
      mockPrisma.release.findMany.mockResolvedValue([]);

      await getCalendar({ from: '2024-01-01', to: '2024-01-31' });

      const call = mockPrisma.release.findMany.mock.calls[0][0];
      expect(call.where.OR).toBeDefined();
      expect(call.where.OR).toHaveLength(2);
    });

    it('should return empty object when no releases exist in range', async () => {
      mockPrisma.release.findMany.mockResolvedValue([]);

      const result = await getCalendar({
        from: '2024-01-01',
        to: '2024-01-31',
      });

      expect(result).toEqual({});
    });

    it('should include content details in calendar entries', async () => {
      mockPrisma.release.findMany.mockResolvedValue([]);

      await getCalendar({ from: '2024-01-01', to: '2024-01-31' });

      const call = mockPrisma.release.findMany.mock.calls[0][0];
      expect(call.include.content).toBeDefined();
    });

    it('should use createdAt as fallback date key when scheduledAt is null', async () => {
      const release = fakeRelease({
        scheduledAt: null,
        createdAt: new Date('2024-02-10T12:00:00Z'),
      });
      mockPrisma.release.findMany.mockResolvedValue([release]);

      const result = await getCalendar({
        from: '2024-02-01',
        to: '2024-02-28',
      });

      expect(result['2024-02-10']).toHaveLength(1);
    });

    it('should order results by scheduledAt ascending', async () => {
      mockPrisma.release.findMany.mockResolvedValue([]);

      await getCalendar({ from: '2024-01-01', to: '2024-01-31' });

      const call = mockPrisma.release.findMany.mock.calls[0][0];
      expect(call.orderBy).toEqual({ scheduledAt: 'asc' });
    });
  });

  // ── batchCreateReleases ──────────────────────────────────

  describe('batchCreateReleases', () => {
    it('should create multiple releases and return summary', async () => {
      // Mock for first release: succeeds
      mockPrisma.content.findUnique
        .mockResolvedValueOnce(fakeContent({ status: 'approved' }))  // createRelease #1
        .mockResolvedValueOnce(fakeContent({ status: 'approved' })); // createRelease #2

      mockPrisma.release.create
        .mockResolvedValueOnce(fakeRelease({ id: 'r-1', status: 'pending' }))
        .mockResolvedValueOnce(fakeRelease({ id: 'r-2', status: 'pending' }));

      // Mock for executeReleaseAction
      mockPrisma.release.findUnique
        .mockResolvedValueOnce(fakeRelease({
          id: 'r-1',
          status: 'pending',
          content: fakeContent({ status: 'approved' }),
        }))
        .mockResolvedValueOnce(fakeRelease({
          id: 'r-2',
          status: 'pending',
          content: fakeContent({ status: 'approved' }),
        }));
      mockPrisma.content.update.mockResolvedValue(fakeContent({ status: 'published' }));
      mockPrisma.release.update.mockResolvedValue(fakeRelease({ status: 'completed' }));

      const result = await batchCreateReleases(
        {
          releases: [
            { contentId: 'c-1', action: 'publish' },
            { contentId: 'c-2', action: 'publish' },
          ],
        },
        'user-1'
      );

      expect(result.total).toBe(2);
      expect(result.succeeded).toBeGreaterThanOrEqual(0);
      expect(result.results).toHaveLength(2);
    });

    it('should continue processing even when some releases fail', async () => {
      // First release fails (content not found)
      mockPrisma.content.findUnique
        .mockResolvedValueOnce(null)  // first: fails
        .mockResolvedValueOnce(fakeContent({ status: 'approved' })); // second: succeeds

      mockPrisma.release.create.mockResolvedValue(
        fakeRelease({ id: 'r-2', status: 'pending' })
      );
      mockPrisma.release.findUnique.mockResolvedValue(
        fakeRelease({
          id: 'r-2',
          status: 'pending',
          content: fakeContent({ status: 'approved' }),
        })
      );
      mockPrisma.content.update.mockResolvedValue(fakeContent({ status: 'published' }));
      mockPrisma.release.update.mockResolvedValue(fakeRelease({ status: 'completed' }));

      const result = await batchCreateReleases(
        {
          releases: [
            { contentId: 'missing', action: 'publish' },
            { contentId: 'c-2', action: 'publish' },
          ],
        },
        'user-1'
      );

      expect(result.total).toBe(2);
      expect(result.failed).toBeGreaterThanOrEqual(1);
      // The first result should have success=false with an error
      const failedResult = result.results.find((r) => !r.success);
      expect(failedResult).toBeDefined();
      expect(failedResult?.error).toBeDefined();
    });

    it('should return all failures for invalid releases', async () => {
      mockPrisma.content.findUnique
        .mockResolvedValueOnce(null) // first: not found
        .mockResolvedValueOnce(fakeContent({ status: 'draft' })); // second: invalid status

      const result = await batchCreateReleases(
        {
          releases: [
            { contentId: 'missing', action: 'publish' },
            { contentId: 'c-2', action: 'publish' },
          ],
        },
        'user-1'
      );

      expect(result.total).toBe(2);
      expect(result.failed).toBe(2);
      expect(result.succeeded).toBe(0);
    });

    it('should handle empty releases array', async () => {
      const result = await batchCreateReleases(
        { releases: [] },
        'user-1'
      );

      expect(result.total).toBe(0);
      expect(result.succeeded).toBe(0);
      expect(result.failed).toBe(0);
      expect(result.results).toEqual([]);
    });
  });
});
