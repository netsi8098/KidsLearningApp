import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockPrisma, resetPrismaMocks } from '../../helpers/prisma.mock';

// ── Mock dependencies ────────────────────────────────────────
const { mockEvaluateFlag } = vi.hoisted(() => ({
  mockEvaluateFlag: vi.fn(),
}));

vi.mock('../../../src/lib/prisma', () => ({ prisma: mockPrisma }));
vi.mock('../../../src/lib/audit', () => ({ logAudit: vi.fn() }));
vi.mock('../../../src/lib/featureFlags', () => ({
  evaluateFlag: mockEvaluateFlag,
}));

import {
  listFlags,
  getFlag,
  createFlag,
  updateFlag,
  deleteFlag,
  killFlag,
  evaluateBatch,
  evaluateSingle,
} from '../../../src/modules/feature-flags/service';
import { NotFoundError, ConflictError } from '../../../src/lib/errors';

// ── Helpers ──────────────────────────────────────────────────

function fakeFlag(overrides: Record<string, unknown> = {}) {
  return {
    id: 'flag-1',
    key: 'enable_new_ui',
    name: 'Enable New UI',
    description: 'Enables the new UI redesign',
    enabled: true,
    targeting: {},
    defaultValue: false,
    createdBy: 'admin-1',
    updatedBy: null,
    deletedAt: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    overrides: [],
    ...overrides,
  };
}

// ── Tests ────────────────────────────────────────────────────

describe('FeatureFlagsService', () => {
  beforeEach(() => {
    resetPrismaMocks();
    mockEvaluateFlag.mockReset();
  });

  // ── listFlags ────────────────────────────────────────────

  describe('listFlags', () => {
    it('should return paginated flags with overrides', async () => {
      const flags = [fakeFlag(), fakeFlag({ id: 'flag-2', key: 'dark_mode' })];
      mockPrisma.featureFlag.findMany.mockResolvedValue(flags);
      mockPrisma.featureFlag.count.mockResolvedValue(2);

      const result = await listFlags({}, { page: 1, limit: 10 });

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.totalPages).toBe(1);
    });

    it('should filter by enabled status', async () => {
      mockPrisma.featureFlag.findMany.mockResolvedValue([]);
      mockPrisma.featureFlag.count.mockResolvedValue(0);

      await listFlags({ enabled: true }, { page: 1, limit: 10 });

      const call = mockPrisma.featureFlag.findMany.mock.calls[0][0];
      expect(call.where.enabled).toBe(true);
    });

    it('should not set enabled filter when undefined', async () => {
      mockPrisma.featureFlag.findMany.mockResolvedValue([]);
      mockPrisma.featureFlag.count.mockResolvedValue(0);

      await listFlags({}, { page: 1, limit: 10 });

      const call = mockPrisma.featureFlag.findMany.mock.calls[0][0];
      expect(call.where.enabled).toBeUndefined();
    });

    it('should apply pagination skip and take', async () => {
      mockPrisma.featureFlag.findMany.mockResolvedValue([]);
      mockPrisma.featureFlag.count.mockResolvedValue(50);

      const result = await listFlags({}, { page: 3, limit: 10 });

      const call = mockPrisma.featureFlag.findMany.mock.calls[0][0];
      expect(call.skip).toBe(20); // (3-1) * 10
      expect(call.take).toBe(10);
      expect(result.totalPages).toBe(5);
    });

    it('should apply sort order from pagination params', async () => {
      mockPrisma.featureFlag.findMany.mockResolvedValue([]);
      mockPrisma.featureFlag.count.mockResolvedValue(0);

      await listFlags({}, { page: 1, limit: 10, sortBy: 'key', sortOrder: 'asc' });

      const call = mockPrisma.featureFlag.findMany.mock.calls[0][0];
      expect(call.orderBy).toEqual({ key: 'asc' });
    });
  });

  // ── getFlag ──────────────────────────────────────────────

  describe('getFlag', () => {
    it('should return flag by key with overrides', async () => {
      const flag = fakeFlag({
        overrides: [
          { id: 'ov-1', entityType: 'household', entityId: 'hh-1', value: true, createdAt: new Date() },
        ],
      });
      mockPrisma.featureFlag.findUnique.mockResolvedValue(flag);

      const result = await getFlag('enable_new_ui');

      expect(result.key).toBe('enable_new_ui');
      expect(result.overrides).toHaveLength(1);
      expect(mockPrisma.featureFlag.findUnique).toHaveBeenCalledWith({
        where: { key: 'enable_new_ui' },
        include: { overrides: true },
      });
    });

    it('should throw NotFoundError when flag does not exist', async () => {
      mockPrisma.featureFlag.findUnique.mockResolvedValue(null);

      await expect(getFlag('nonexistent')).rejects.toThrow(NotFoundError);
    });
  });

  // ── createFlag ───────────────────────────────────────────

  describe('createFlag', () => {
    it('should create a new flag', async () => {
      mockPrisma.featureFlag.findUnique.mockResolvedValue(null); // key not taken
      mockPrisma.featureFlag.create.mockResolvedValue(fakeFlag());

      const result = await createFlag(
        { key: 'enable_new_ui', name: 'Enable New UI' },
        'admin-1'
      );

      expect(result.key).toBe('enable_new_ui');
      expect(mockPrisma.featureFlag.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            key: 'enable_new_ui',
            name: 'Enable New UI',
            createdBy: 'admin-1',
          }),
        })
      );
    });

    it('should throw ConflictError when key already exists', async () => {
      mockPrisma.featureFlag.findUnique.mockResolvedValue(fakeFlag());

      await expect(
        createFlag({ key: 'enable_new_ui', name: 'Dup' }, 'admin-1')
      ).rejects.toThrow(ConflictError);
    });

    it('should default enabled to false', async () => {
      mockPrisma.featureFlag.findUnique.mockResolvedValue(null);
      mockPrisma.featureFlag.create.mockResolvedValue(
        fakeFlag({ enabled: false })
      );

      await createFlag(
        { key: 'new_flag', name: 'New Flag' },
        'admin-1'
      );

      const createCall = mockPrisma.featureFlag.create.mock.calls[0][0];
      expect(createCall.data.enabled).toBe(false);
    });

    it('should set targeting and defaultValue defaults', async () => {
      mockPrisma.featureFlag.findUnique.mockResolvedValue(null);
      mockPrisma.featureFlag.create.mockResolvedValue(fakeFlag());

      await createFlag(
        { key: 'minimal_flag', name: 'Minimal' },
        'admin-1'
      );

      const createCall = mockPrisma.featureFlag.create.mock.calls[0][0];
      expect(createCall.data.targeting).toEqual({});
      expect(createCall.data.defaultValue).toBe(false);
    });
  });

  // ── updateFlag ───────────────────────────────────────────

  describe('updateFlag', () => {
    it('should update flag fields', async () => {
      mockPrisma.featureFlag.findUnique.mockResolvedValue(fakeFlag());
      mockPrisma.featureFlag.update.mockResolvedValue(
        fakeFlag({ name: 'Updated UI', enabled: false })
      );

      const result = await updateFlag(
        'enable_new_ui',
        { name: 'Updated UI', enabled: false },
        'admin-2'
      );

      expect(result.name).toBe('Updated UI');
      const updateCall = mockPrisma.featureFlag.update.mock.calls[0][0];
      expect(updateCall.data.updatedBy).toBe('admin-2');
    });

    it('should throw NotFoundError when flag does not exist', async () => {
      mockPrisma.featureFlag.findUnique.mockResolvedValue(null);

      await expect(
        updateFlag('nonexistent', { name: 'Test' }, 'admin-1')
      ).rejects.toThrow(NotFoundError);
    });

    it('should only include defined fields in the update', async () => {
      mockPrisma.featureFlag.findUnique.mockResolvedValue(fakeFlag());
      mockPrisma.featureFlag.update.mockResolvedValue(fakeFlag());

      await updateFlag('enable_new_ui', { description: 'New desc' }, 'admin-1');

      const updateCall = mockPrisma.featureFlag.update.mock.calls[0][0];
      expect(updateCall.data.description).toBe('New desc');
      expect(updateCall.data.name).toBeUndefined();
      expect(updateCall.data.enabled).toBeUndefined();
    });
  });

  // ── deleteFlag ───────────────────────────────────────────

  describe('deleteFlag', () => {
    it('should soft-delete by setting deletedAt and disabling', async () => {
      mockPrisma.featureFlag.findUnique.mockResolvedValue(fakeFlag());
      mockPrisma.featureFlag.update.mockResolvedValue(
        fakeFlag({ deletedAt: new Date(), enabled: false })
      );

      const result = await deleteFlag('enable_new_ui', 'admin-1');

      expect(result).toEqual({ deleted: true, key: 'enable_new_ui' });
      expect(mockPrisma.featureFlag.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { key: 'enable_new_ui' },
          data: expect.objectContaining({
            deletedAt: expect.any(Date),
            enabled: false,
          }),
        })
      );
    });

    it('should throw NotFoundError when flag does not exist', async () => {
      mockPrisma.featureFlag.findUnique.mockResolvedValue(null);

      await expect(deleteFlag('nonexistent', 'admin-1')).rejects.toThrow(
        NotFoundError
      );
    });

    it('should not call update when flag does not exist', async () => {
      mockPrisma.featureFlag.findUnique.mockResolvedValue(null);

      await expect(deleteFlag('nonexistent', 'admin-1')).rejects.toThrow();
      expect(mockPrisma.featureFlag.update).not.toHaveBeenCalled();
    });
  });

  // ── killFlag ─────────────────────────────────────────────

  describe('killFlag', () => {
    it('should disable flag immediately', async () => {
      mockPrisma.featureFlag.findUnique.mockResolvedValue(
        fakeFlag({ enabled: true })
      );
      mockPrisma.featureFlag.update.mockResolvedValue(
        fakeFlag({ enabled: false })
      );

      const result = await killFlag('enable_new_ui', 'admin-1');

      expect(result.enabled).toBe(false);
      expect(mockPrisma.featureFlag.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { key: 'enable_new_ui' },
          data: { enabled: false, updatedBy: 'admin-1' },
        })
      );
    });

    it('should throw NotFoundError when flag does not exist', async () => {
      mockPrisma.featureFlag.findUnique.mockResolvedValue(null);

      await expect(killFlag('nonexistent', 'admin-1')).rejects.toThrow(
        NotFoundError
      );
    });

    it('should work even if flag is already disabled', async () => {
      mockPrisma.featureFlag.findUnique.mockResolvedValue(
        fakeFlag({ enabled: false })
      );
      mockPrisma.featureFlag.update.mockResolvedValue(
        fakeFlag({ enabled: false })
      );

      const result = await killFlag('enable_new_ui', 'admin-1');

      expect(result.enabled).toBe(false);
    });
  });

  // ── evaluateBatch ────────────────────────────────────────

  describe('evaluateBatch', () => {
    it('should evaluate multiple flags and return results map', async () => {
      mockEvaluateFlag
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce('variant-a');

      const result = await evaluateBatch(
        ['flag_a', 'flag_b', 'flag_c'],
        { environment: 'production' }
      );

      expect(result).toEqual({
        flag_a: true,
        flag_b: false,
        flag_c: 'variant-a',
      });
      expect(mockEvaluateFlag).toHaveBeenCalledTimes(3);
    });

    it('should return empty object for empty keys array', async () => {
      const result = await evaluateBatch([], {});

      expect(result).toEqual({});
      expect(mockEvaluateFlag).not.toHaveBeenCalled();
    });

    it('should pass context to evaluateFlag', async () => {
      mockEvaluateFlag.mockResolvedValue(true);

      const context = {
        environment: 'staging',
        householdId: 'hh-1',
        locale: 'en',
      };

      await evaluateBatch(['flag_a'], context);

      expect(mockEvaluateFlag).toHaveBeenCalledWith('flag_a', context);
    });
  });

  // ── evaluateSingle ───────────────────────────────────────

  describe('evaluateSingle', () => {
    it('should evaluate one flag and return key-value pair', async () => {
      mockEvaluateFlag.mockResolvedValue(true);

      const result = await evaluateSingle('enable_new_ui', {
        environment: 'production',
      });

      expect(result).toEqual({ key: 'enable_new_ui', value: true });
    });

    it('should return false value when flag is disabled', async () => {
      mockEvaluateFlag.mockResolvedValue(false);

      const result = await evaluateSingle('disabled_flag', {});

      expect(result.value).toBe(false);
    });

    it('should pass context to evaluateFlag', async () => {
      mockEvaluateFlag.mockResolvedValue('custom-value');

      const context = {
        profileId: 'profile-1',
        premiumOnly: true,
      };

      await evaluateSingle('premium_flag', context);

      expect(mockEvaluateFlag).toHaveBeenCalledWith('premium_flag', context);
    });

    it('should handle non-boolean flag values', async () => {
      mockEvaluateFlag.mockResolvedValue({ variant: 'B', color: '#ff0000' });

      const result = await evaluateSingle('experiment_flag', {});

      expect(result.value).toEqual({ variant: 'B', color: '#ff0000' });
    });
  });
});
