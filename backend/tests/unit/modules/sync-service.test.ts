import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockPrisma, resetPrismaMocks } from '../../helpers/prisma.mock';

// ── Mock dependencies ────────────────────────────────────────
const { mockPushChanges, mockPullChanges, mockResolveConflict } = vi.hoisted(() => ({
  mockPushChanges: vi.fn(),
  mockPullChanges: vi.fn(),
  mockResolveConflict: vi.fn(),
}));

vi.mock('../../../src/lib/prisma', () => ({ prisma: mockPrisma }));
vi.mock('../../../src/lib/syncEngine', () => ({
  pushChanges: mockPushChanges,
  pullChanges: mockPullChanges,
  resolveConflict: mockResolveConflict,
}));

import {
  push,
  pull,
  getStatus,
  resolve,
  resetCheckpoint,
} from '../../../src/modules/sync/service';
import { NotFoundError } from '../../../src/lib/errors';

// ── Tests ────────────────────────────────────────────────────

describe('SyncService', () => {
  beforeEach(() => {
    resetPrismaMocks();
    mockPushChanges.mockReset();
    mockPullChanges.mockReset();
    mockResolveConflict.mockReset();
  });

  // ── push ─────────────────────────────────────────────────

  describe('push', () => {
    it('should delegate to syncEngine.pushChanges', async () => {
      const changes = [
        {
          entityType: 'progress',
          entityId: 'p-1',
          action: 'update' as const,
          payload: { completed: true },
          clientTimestamp: '2024-01-01T00:00:00Z',
        },
      ];
      const expected = { accepted: 1, conflicts: [] };
      mockPushChanges.mockResolvedValue(expected);

      const result = await push('profile-1', changes);

      expect(result).toEqual(expected);
      expect(mockPushChanges).toHaveBeenCalledWith('profile-1', changes);
    });

    it('should pass conflicts through from syncEngine', async () => {
      const conflicts = [
        {
          entityType: 'progress',
          entityId: 'p-1',
          clientVersion: { completed: true },
          serverVersion: { completed: false },
          serverTimestamp: new Date(),
        },
      ];
      mockPushChanges.mockResolvedValue({ accepted: 0, conflicts });

      const result = await push('profile-1', []);

      expect(result.conflicts).toEqual(conflicts);
    });
  });

  // ── pull ─────────────────────────────────────────────────

  describe('pull', () => {
    it('should convert sinceVersion string to BigInt', async () => {
      const expected = {
        events: [],
        checkpoint: '100',
        hasMore: false,
      };
      mockPullChanges.mockResolvedValue(expected);

      const result = await pull('profile-1', 'progress', '50');

      expect(result).toEqual(expected);
      expect(mockPullChanges).toHaveBeenCalledWith(
        'profile-1',
        'progress',
        BigInt(50)
      );
    });

    it('should pass undefined when sinceVersion is not provided', async () => {
      mockPullChanges.mockResolvedValue({
        events: [],
        checkpoint: '0',
        hasMore: false,
      });

      await pull('profile-1', 'progress');

      expect(mockPullChanges).toHaveBeenCalledWith(
        'profile-1',
        'progress',
        undefined
      );
    });

    it('should handle sinceVersion of "0"', async () => {
      mockPullChanges.mockResolvedValue({
        events: [],
        checkpoint: '0',
        hasMore: false,
      });

      await pull('profile-1', 'progress', '0');

      expect(mockPullChanges).toHaveBeenCalledWith(
        'profile-1',
        'progress',
        BigInt(0)
      );
    });
  });

  // ── getStatus ────────────────────────────────────────────

  describe('getStatus', () => {
    it('should return checkpoints with string versions', async () => {
      mockPrisma.syncCheckpoint.findMany.mockResolvedValue([
        {
          entityType: 'progress',
          serverVersion: BigInt(42),
          lastSyncedAt: new Date('2024-01-15'),
        },
        {
          entityType: 'preference',
          serverVersion: BigInt(10),
          lastSyncedAt: new Date('2024-01-14'),
        },
      ]);

      const result = await getStatus('profile-1');

      expect(result).toHaveLength(2);
      expect(result[0].entityType).toBe('progress');
      expect(result[0].serverVersion).toBe('42');
      expect(result[1].serverVersion).toBe('10');
    });

    it('should return empty array when no checkpoints exist', async () => {
      mockPrisma.syncCheckpoint.findMany.mockResolvedValue([]);

      const result = await getStatus('profile-1');

      expect(result).toEqual([]);
    });

    it('should query with correct profileId and ordering', async () => {
      mockPrisma.syncCheckpoint.findMany.mockResolvedValue([]);

      await getStatus('profile-1');

      expect(mockPrisma.syncCheckpoint.findMany).toHaveBeenCalledWith({
        where: { profileId: 'profile-1' },
        orderBy: { entityType: 'asc' },
        select: {
          entityType: true,
          serverVersion: true,
          lastSyncedAt: true,
        },
      });
    });
  });

  // ── resolve ──────────────────────────────────────────────

  describe('resolve', () => {
    it('should delegate to syncEngine.resolveConflict', async () => {
      mockResolveConflict.mockResolvedValue({ resolved: true });

      const result = await resolve(
        'profile-1',
        'progress',
        'entity-1',
        'client',
        { completed: true }
      );

      expect(result).toEqual({ resolved: true });
      expect(mockResolveConflict).toHaveBeenCalledWith(
        'profile-1',
        'progress',
        'entity-1',
        'client',
        { completed: true }
      );
    });

    it('should resolve with server resolution without payload', async () => {
      mockResolveConflict.mockResolvedValue({ resolved: true });

      await resolve('profile-1', 'progress', 'entity-1', 'server');

      expect(mockResolveConflict).toHaveBeenCalledWith(
        'profile-1',
        'progress',
        'entity-1',
        'server',
        undefined
      );
    });
  });

  // ── resetCheckpoint ──────────────────────────────────────

  describe('resetCheckpoint', () => {
    it('should delete checkpoints when they exist', async () => {
      mockPrisma.syncCheckpoint.findMany.mockResolvedValue([
        { id: 'cp-1' },
        { id: 'cp-2' },
      ]);
      mockPrisma.syncCheckpoint.deleteMany.mockResolvedValue({ count: 2 });

      const result = await resetCheckpoint('profile-1');

      expect(result).toEqual({ deleted: 2 });
      expect(mockPrisma.syncCheckpoint.deleteMany).toHaveBeenCalledWith({
        where: { profileId: 'profile-1' },
      });
    });

    it('should throw NotFoundError when no checkpoints exist', async () => {
      mockPrisma.syncCheckpoint.findMany.mockResolvedValue([]);

      await expect(resetCheckpoint('profile-1')).rejects.toThrow(NotFoundError);
    });

    it('should verify checkpoints before deleting', async () => {
      mockPrisma.syncCheckpoint.findMany.mockResolvedValue([]);

      await expect(resetCheckpoint('unknown-profile')).rejects.toThrow(
        NotFoundError
      );

      // deleteMany should not have been called
      expect(mockPrisma.syncCheckpoint.deleteMany).not.toHaveBeenCalled();
    });
  });
});
