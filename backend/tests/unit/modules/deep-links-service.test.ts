import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockPrisma, resetPrismaMocks } from '../../helpers/prisma.mock';

// ── Mock dependencies ────────────────────────────────────────
vi.mock('../../../src/lib/prisma', () => ({ prisma: mockPrisma }));
vi.mock('../../../src/lib/audit', () => ({ logAudit: vi.fn() }));

// Mock crypto for deterministic shortCode generation
vi.mock('crypto', () => ({
  randomBytes: vi.fn(() => ({
    toString: () => 'aBcDeFgHiJkL',
    // base64url of 6 random bytes, then slice to 8 alphanumeric chars
  })),
}));

import {
  createDeepLink,
  resolveDeepLink,
  listDeepLinks,
  getDeepLink,
  updateDeepLink,
  deleteDeepLink,
} from '../../../src/modules/deep-links/service';
import { NotFoundError, ValidationError, ConflictError } from '../../../src/lib/errors';

// ── Helpers ──────────────────────────────────────────────────

function fakeDeepLink(overrides: Record<string, unknown> = {}) {
  return {
    id: 'dl-1',
    shortCode: 'aBcDeFgH',
    targetType: 'content',
    targetId: 'content-1',
    targetPath: '/lessons/abc',
    campaign: 'summer',
    clicks: 0,
    expiresAt: null,
    metadata: {},
    createdBy: 'user-1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

// ── Tests ────────────────────────────────────────────────────

describe('DeepLinksService', () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  // ── createDeepLink ───────────────────────────────────────

  describe('createDeepLink', () => {
    it('should generate an 8-char shortCode and create a deep link', async () => {
      mockPrisma.deepLink.findUnique.mockResolvedValue(null); // no collision
      mockPrisma.deepLink.create.mockResolvedValue(fakeDeepLink());

      const result = await createDeepLink(
        { targetType: 'content', targetId: 'content-1' },
        'user-1'
      );

      expect(result.shortCode).toHaveLength(8);
      expect(mockPrisma.deepLink.create).toHaveBeenCalled();
    });

    it('should retry on shortCode collision', async () => {
      // First attempt: collision; second attempt: unique
      mockPrisma.deepLink.findUnique
        .mockResolvedValueOnce({ id: 'existing' }) // collision
        .mockResolvedValueOnce(null);               // unique
      mockPrisma.deepLink.create.mockResolvedValue(fakeDeepLink());

      const result = await createDeepLink(
        { targetType: 'content' },
        'user-1'
      );

      expect(result).toBeDefined();
      // findUnique should have been called twice for collision check
      expect(mockPrisma.deepLink.findUnique).toHaveBeenCalledTimes(2);
    });

    it('should throw ConflictError after 5 collision retries', async () => {
      // All 5 attempts collide
      mockPrisma.deepLink.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(
        createDeepLink({ targetType: 'content' }, 'user-1')
      ).rejects.toThrow(ConflictError);
    });

    it('should pass optional fields to create', async () => {
      mockPrisma.deepLink.findUnique.mockResolvedValue(null);
      mockPrisma.deepLink.create.mockResolvedValue(fakeDeepLink());

      await createDeepLink(
        {
          targetType: 'content',
          targetId: 'content-1',
          targetPath: '/path',
          campaign: 'holiday',
          expiresAt: '2025-12-31T00:00:00Z' as any,
          metadata: { source: 'email' },
        },
        'user-1'
      );

      const createCall = mockPrisma.deepLink.create.mock.calls[0][0];
      expect(createCall.data.campaign).toBe('holiday');
      expect(createCall.data.metadata).toEqual({ source: 'email' });
    });
  });

  // ── resolveDeepLink ──────────────────────────────────────

  describe('resolveDeepLink', () => {
    it('should return target info and increment clicks', async () => {
      const deepLink = fakeDeepLink();
      mockPrisma.deepLink.findUnique.mockResolvedValue(deepLink);
      mockPrisma.deepLink.update.mockResolvedValue({ ...deepLink, clicks: 1 });

      const result = await resolveDeepLink('aBcDeFgH');

      expect(result.targetType).toBe('content');
      expect(result.targetId).toBe('content-1');
      expect(result.targetPath).toBe('/lessons/abc');
    });

    it('should throw NotFoundError for missing shortCode', async () => {
      mockPrisma.deepLink.findUnique.mockResolvedValue(null);

      await expect(resolveDeepLink('missing')).rejects.toThrow(NotFoundError);
    });

    it('should throw ValidationError for expired deep link', async () => {
      mockPrisma.deepLink.findUnique.mockResolvedValue(
        fakeDeepLink({ expiresAt: new Date('2020-01-01') })
      );

      await expect(resolveDeepLink('aBcDeFgH')).rejects.toThrow(ValidationError);
    });

    it('should not throw for non-expired deep link', async () => {
      mockPrisma.deepLink.findUnique.mockResolvedValue(
        fakeDeepLink({ expiresAt: new Date('2099-12-31') })
      );
      mockPrisma.deepLink.update.mockResolvedValue({});

      await expect(resolveDeepLink('aBcDeFgH')).resolves.toBeDefined();
    });

    it('should not throw for deep link with null expiresAt', async () => {
      mockPrisma.deepLink.findUnique.mockResolvedValue(
        fakeDeepLink({ expiresAt: null })
      );
      mockPrisma.deepLink.update.mockResolvedValue({});

      await expect(resolveDeepLink('aBcDeFgH')).resolves.toBeDefined();
    });
  });

  // ── listDeepLinks ────────────────────────────────────────

  describe('listDeepLinks', () => {
    it('should return paginated deep links', async () => {
      const links = [fakeDeepLink(), fakeDeepLink({ id: 'dl-2' })];
      mockPrisma.deepLink.findMany.mockResolvedValue(links);
      mockPrisma.deepLink.count.mockResolvedValue(2);

      const result = await listDeepLinks({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.totalPages).toBe(1);
    });

    it('should apply targetType filter', async () => {
      mockPrisma.deepLink.findMany.mockResolvedValue([]);
      mockPrisma.deepLink.count.mockResolvedValue(0);

      await listDeepLinks({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        targetType: 'content',
      });

      const call = mockPrisma.deepLink.findMany.mock.calls[0][0];
      expect(call.where.targetType).toBe('content');
    });

    it('should apply campaign filter', async () => {
      mockPrisma.deepLink.findMany.mockResolvedValue([]);
      mockPrisma.deepLink.count.mockResolvedValue(0);

      await listDeepLinks({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        campaign: 'summer',
      });

      const call = mockPrisma.deepLink.findMany.mock.calls[0][0];
      expect(call.where.campaign).toBe('summer');
    });

    it('should calculate pagination correctly', async () => {
      mockPrisma.deepLink.findMany.mockResolvedValue([]);
      mockPrisma.deepLink.count.mockResolvedValue(25);

      const result = await listDeepLinks({
        page: 2,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      expect(result.totalPages).toBe(3);
      const call = mockPrisma.deepLink.findMany.mock.calls[0][0];
      expect(call.skip).toBe(10);
      expect(call.take).toBe(10);
    });
  });

  // ── getDeepLink ──────────────────────────────────────────

  describe('getDeepLink', () => {
    it('should return deep link when found', async () => {
      mockPrisma.deepLink.findUnique.mockResolvedValue(fakeDeepLink());

      const result = await getDeepLink('dl-1');

      expect(result.id).toBe('dl-1');
    });

    it('should throw NotFoundError when not found', async () => {
      mockPrisma.deepLink.findUnique.mockResolvedValue(null);

      await expect(getDeepLink('missing')).rejects.toThrow(NotFoundError);
    });
  });

  // ── updateDeepLink ───────────────────────────────────────

  describe('updateDeepLink', () => {
    it('should update and return the deep link', async () => {
      mockPrisma.deepLink.findUnique.mockResolvedValue(fakeDeepLink());
      mockPrisma.deepLink.update.mockResolvedValue(
        fakeDeepLink({ campaign: 'winter' })
      );

      const result = await updateDeepLink(
        'dl-1',
        { campaign: 'winter' },
        'user-1'
      );

      expect(result.campaign).toBe('winter');
    });

    it('should throw NotFoundError when deep link does not exist', async () => {
      mockPrisma.deepLink.findUnique.mockResolvedValue(null);

      await expect(
        updateDeepLink('missing', { campaign: 'test' }, 'user-1')
      ).rejects.toThrow(NotFoundError);
    });

    it('should only include defined fields in update', async () => {
      mockPrisma.deepLink.findUnique.mockResolvedValue(fakeDeepLink());
      mockPrisma.deepLink.update.mockResolvedValue(fakeDeepLink());

      await updateDeepLink('dl-1', { targetType: 'collection' }, 'user-1');

      const updateCall = mockPrisma.deepLink.update.mock.calls[0][0];
      expect(updateCall.data.targetType).toBe('collection');
      expect(updateCall.data.campaign).toBeUndefined();
    });
  });

  // ── deleteDeepLink ───────────────────────────────────────

  describe('deleteDeepLink', () => {
    it('should delete the deep link', async () => {
      mockPrisma.deepLink.findUnique.mockResolvedValue(
        fakeDeepLink({ id: 'dl-1', shortCode: 'abcd1234' })
      );
      mockPrisma.deepLink.delete.mockResolvedValue({});

      await deleteDeepLink('dl-1', 'user-1');

      expect(mockPrisma.deepLink.delete).toHaveBeenCalledWith({
        where: { id: 'dl-1' },
      });
    });

    it('should throw NotFoundError when deep link does not exist', async () => {
      mockPrisma.deepLink.findUnique.mockResolvedValue(null);

      await expect(deleteDeepLink('missing', 'user-1')).rejects.toThrow(
        NotFoundError
      );
    });

    it('should not call delete when deep link is not found', async () => {
      mockPrisma.deepLink.findUnique.mockResolvedValue(null);

      await expect(deleteDeepLink('missing', 'user-1')).rejects.toThrow();
      expect(mockPrisma.deepLink.delete).not.toHaveBeenCalled();
    });
  });
});
