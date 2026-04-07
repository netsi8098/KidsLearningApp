import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockPrisma, resetPrismaMocks } from '../../helpers/prisma.mock';

// ── Mock dependencies ────────────────────────────────────────
vi.mock('../../../src/lib/prisma', () => ({ prisma: mockPrisma }));

import {
  reportError,
  listErrorGroups,
  getErrorGroup,
  updateErrorGroup,
  evaluateQualityGates,
  listOccurrences,
} from '../../../src/modules/errors/service';
import { NotFoundError } from '../../../src/lib/errors';

// ── Helpers ──────────────────────────────────────────────────

function fakeErrorGroup(overrides: Record<string, unknown> = {}) {
  return {
    id: 'group-1',
    fingerprint: 'abc123def456',
    category: 'runtime',
    message: 'TypeError: Cannot read property of undefined',
    firstSeen: new Date('2024-01-01'),
    lastSeen: new Date('2024-01-15'),
    count: 5,
    status: 'new',
    assignee: null,
    resolvedAt: null,
    ...overrides,
  };
}

function fakeErrorReport(overrides: Record<string, unknown> = {}) {
  return {
    id: 'report-1',
    groupId: 'group-1',
    category: 'runtime',
    message: 'TypeError: Cannot read property of undefined',
    stack: 'Error at line 42',
    metadata: {},
    deviceInfo: 'iPhone 15',
    appVersion: '2.1.0',
    releaseId: null,
    profileId: 'profile-1',
    createdAt: new Date('2024-01-15'),
    ...overrides,
  };
}

// ── Tests ────────────────────────────────────────────────────

describe('ErrorsService', () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  // ── reportError ──────────────────────────────────────────

  describe('reportError', () => {
    it('should create fingerprint from category:message hash', async () => {
      mockPrisma.errorGroup.upsert.mockResolvedValue(
        fakeErrorGroup({ count: 1 })
      );
      mockPrisma.errorReport.create.mockResolvedValue(fakeErrorReport());

      const result = await reportError({
        category: 'runtime',
        message: 'Test error',
        stack: 'stack trace',
        deviceInfo: 'iPhone',
        appVersion: '1.0',
      });

      expect(result.fingerprint).toBeDefined();
      expect(typeof result.fingerprint).toBe('string');
      expect(result.fingerprint.length).toBe(16);
    });

    it('should upsert ErrorGroup creating a new group on first occurrence', async () => {
      mockPrisma.errorGroup.upsert.mockResolvedValue(
        fakeErrorGroup({ count: 1 })
      );
      mockPrisma.errorReport.create.mockResolvedValue(fakeErrorReport());

      const result = await reportError({
        category: 'runtime',
        message: 'New error',
        stack: 'stack',
        deviceInfo: 'Android',
        appVersion: '1.0',
      });

      expect(result.isNewGroup).toBe(true);
      expect(result.groupId).toBe('group-1');

      // Verify upsert was called with create and update
      const upsertCall = mockPrisma.errorGroup.upsert.mock.calls[0][0];
      expect(upsertCall.create.status).toBe('new');
      expect(upsertCall.create.count).toBe(1);
      expect(upsertCall.update.count).toEqual({ increment: 1 });
    });

    it('should increment count on existing error group', async () => {
      mockPrisma.errorGroup.upsert.mockResolvedValue(
        fakeErrorGroup({ count: 10 })
      );
      mockPrisma.errorReport.create.mockResolvedValue(fakeErrorReport());

      const result = await reportError({
        category: 'runtime',
        message: 'Existing error',
        stack: 'stack',
        deviceInfo: 'iPad',
        appVersion: '1.0',
      });

      expect(result.isNewGroup).toBe(false); // count !== 1
    });

    it('should create an error report linked to the group', async () => {
      mockPrisma.errorGroup.upsert.mockResolvedValue(
        fakeErrorGroup({ count: 1 })
      );
      mockPrisma.errorReport.create.mockResolvedValue(fakeErrorReport());

      await reportError({
        category: 'runtime',
        message: 'Test',
        stack: 'stack trace here',
        deviceInfo: 'Chrome',
        appVersion: '2.0',
        metadata: { url: '/test' },
        profileId: 'profile-1',
      });

      expect(mockPrisma.errorReport.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            groupId: 'group-1',
            category: 'runtime',
            message: 'Test',
            stack: 'stack trace here',
            deviceInfo: 'Chrome',
            appVersion: '2.0',
            metadata: { url: '/test' },
            profileId: 'profile-1',
          }),
        })
      );
    });

    it('should produce same fingerprint for same category:message', async () => {
      mockPrisma.errorGroup.upsert.mockResolvedValue(fakeErrorGroup());
      mockPrisma.errorReport.create.mockResolvedValue(fakeErrorReport());

      const result1 = await reportError({
        category: 'runtime',
        message: 'Same error',
        stack: 'stack1',
        deviceInfo: 'device1',
        appVersion: '1.0',
      });

      const result2 = await reportError({
        category: 'runtime',
        message: 'Same error',
        stack: 'stack2',
        deviceInfo: 'device2',
        appVersion: '2.0',
      });

      expect(result1.fingerprint).toBe(result2.fingerprint);
    });

    it('should produce different fingerprints for different messages', async () => {
      mockPrisma.errorGroup.upsert.mockResolvedValue(fakeErrorGroup());
      mockPrisma.errorReport.create.mockResolvedValue(fakeErrorReport());

      const result1 = await reportError({
        category: 'runtime',
        message: 'Error A',
        stack: 'stack',
        deviceInfo: 'device',
        appVersion: '1.0',
      });

      const result2 = await reportError({
        category: 'runtime',
        message: 'Error B',
        stack: 'stack',
        deviceInfo: 'device',
        appVersion: '1.0',
      });

      expect(result1.fingerprint).not.toBe(result2.fingerprint);
    });
  });

  // ── evaluateQualityGates ─────────────────────────────────

  describe('evaluateQualityGates', () => {
    it('should return pass for all 4 gates when counts are below thresholds', async () => {
      mockPrisma.errorReport.count.mockResolvedValue(0);
      mockPrisma.errorGroup.count.mockResolvedValue(0);

      const result = await evaluateQualityGates();

      expect(result.gates).toHaveLength(4);
      expect(result.gates.every((g: any) => g.passing)).toBe(true);
      expect(result.evaluatedAt).toBeDefined();
    });

    it('should return fail for new_errors_per_hour when exceeding threshold', async () => {
      mockPrisma.errorReport.count
        .mockResolvedValueOnce(100) // new errors last hour: > 50
        .mockResolvedValueOnce(0);  // errors last minute
      mockPrisma.errorGroup.count
        .mockResolvedValueOnce(0)   // release blocking
        .mockResolvedValueOnce(0);  // unique groups 24h

      const result = await evaluateQualityGates();

      const newErrorsGate = result.gates.find(
        (g: any) => g.name === 'new_errors_per_hour'
      );
      expect(newErrorsGate?.passing).toBe(false);
      expect(newErrorsGate?.current).toBe(100);
      expect(newErrorsGate?.threshold).toBe(50);
    });

    it('should return fail for release_blocking_groups when count > 0', async () => {
      mockPrisma.errorReport.count.mockResolvedValue(0);
      mockPrisma.errorGroup.count
        .mockResolvedValueOnce(1)  // release blocking groups > 0
        .mockResolvedValueOnce(0); // unique groups 24h

      const result = await evaluateQualityGates();

      const blockingGate = result.gates.find(
        (g: any) => g.name === 'release_blocking_groups'
      );
      expect(blockingGate?.passing).toBe(false);
    });

    it('should return fail for error_rate_per_minute when exceeding threshold', async () => {
      mockPrisma.errorReport.count
        .mockResolvedValueOnce(0)   // new errors last hour
        .mockResolvedValueOnce(15); // errors last minute: > 10
      mockPrisma.errorGroup.count.mockResolvedValue(0);

      const result = await evaluateQualityGates();

      const rateGate = result.gates.find(
        (g: any) => g.name === 'error_rate_per_minute'
      );
      expect(rateGate?.passing).toBe(false);
      expect(rateGate?.current).toBe(15);
    });

    it('should return fail for unique_error_groups_24h when exceeding threshold', async () => {
      mockPrisma.errorReport.count.mockResolvedValue(0);
      mockPrisma.errorGroup.count
        .mockResolvedValueOnce(0)   // release blocking
        .mockResolvedValueOnce(150); // unique groups 24h: > 100

      const result = await evaluateQualityGates();

      const uniqueGate = result.gates.find(
        (g: any) => g.name === 'unique_error_groups_24h'
      );
      expect(uniqueGate?.passing).toBe(false);
      expect(uniqueGate?.current).toBe(150);
    });

    it('should include evaluatedAt timestamp', async () => {
      mockPrisma.errorReport.count.mockResolvedValue(0);
      mockPrisma.errorGroup.count.mockResolvedValue(0);

      const result = await evaluateQualityGates();

      expect(result.evaluatedAt).toBeDefined();
      // Should be a valid ISO string
      expect(new Date(result.evaluatedAt).toISOString()).toBe(result.evaluatedAt);
    });
  });

  // ── listErrorGroups ──────────────────────────────────────

  describe('listErrorGroups', () => {
    it('should return paginated error groups', async () => {
      const groups = [fakeErrorGroup(), fakeErrorGroup({ id: 'group-2' })];
      mockPrisma.errorGroup.findMany.mockResolvedValue(groups);
      mockPrisma.errorGroup.count.mockResolvedValue(2);

      const result = await listErrorGroups({
        page: 1,
        limit: 10,
        sortBy: 'lastSeen',
        sortOrder: 'desc',
      });

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should apply status filter', async () => {
      mockPrisma.errorGroup.findMany.mockResolvedValue([]);
      mockPrisma.errorGroup.count.mockResolvedValue(0);

      await listErrorGroups({
        page: 1,
        limit: 10,
        sortBy: 'lastSeen',
        sortOrder: 'desc',
        status: 'new',
      });

      const call = mockPrisma.errorGroup.findMany.mock.calls[0][0];
      expect(call.where.status).toBe('new');
    });

    it('should apply category filter', async () => {
      mockPrisma.errorGroup.findMany.mockResolvedValue([]);
      mockPrisma.errorGroup.count.mockResolvedValue(0);

      await listErrorGroups({
        page: 1,
        limit: 10,
        sortBy: 'lastSeen',
        sortOrder: 'desc',
        category: 'network',
      });

      const call = mockPrisma.errorGroup.findMany.mock.calls[0][0];
      expect(call.where.category).toBe('network');
    });

    it('should apply both status and category filters', async () => {
      mockPrisma.errorGroup.findMany.mockResolvedValue([]);
      mockPrisma.errorGroup.count.mockResolvedValue(0);

      await listErrorGroups({
        page: 1,
        limit: 10,
        sortBy: 'count',
        sortOrder: 'desc',
        status: 'resolved',
        category: 'runtime',
      });

      const call = mockPrisma.errorGroup.findMany.mock.calls[0][0];
      expect(call.where.status).toBe('resolved');
      expect(call.where.category).toBe('runtime');
    });
  });

  // ── getErrorGroup ────────────────────────────────────────

  describe('getErrorGroup', () => {
    it('should return error group with recent occurrences', async () => {
      mockPrisma.errorGroup.findUnique.mockResolvedValue(fakeErrorGroup());
      mockPrisma.errorReport.findMany.mockResolvedValue([
        fakeErrorReport(),
        fakeErrorReport({ id: 'report-2' }),
      ]);

      const result = await getErrorGroup('group-1');

      expect(result.id).toBe('group-1');
      expect(result.recentOccurrences).toHaveLength(2);
    });

    it('should throw NotFoundError when group does not exist', async () => {
      mockPrisma.errorGroup.findUnique.mockResolvedValue(null);

      await expect(getErrorGroup('missing')).rejects.toThrow(NotFoundError);
    });
  });

  // ── updateErrorGroup ─────────────────────────────────────

  describe('updateErrorGroup', () => {
    it('should set resolvedAt when status changes to resolved', async () => {
      mockPrisma.errorGroup.findUnique.mockResolvedValue(
        fakeErrorGroup({ status: 'new' })
      );
      mockPrisma.errorGroup.update.mockResolvedValue(
        fakeErrorGroup({ status: 'resolved', resolvedAt: new Date() })
      );

      const result = await updateErrorGroup('group-1', { status: 'resolved' });

      const updateCall = mockPrisma.errorGroup.update.mock.calls[0][0];
      expect(updateCall.data.status).toBe('resolved');
      expect(updateCall.data.resolvedAt).toBeInstanceOf(Date);
    });

    it('should clear resolvedAt when reopening a resolved group', async () => {
      mockPrisma.errorGroup.findUnique.mockResolvedValue(
        fakeErrorGroup({ status: 'resolved', resolvedAt: new Date() })
      );
      mockPrisma.errorGroup.update.mockResolvedValue(
        fakeErrorGroup({ status: 'new', resolvedAt: null })
      );

      await updateErrorGroup('group-1', { status: 'new' });

      const updateCall = mockPrisma.errorGroup.update.mock.calls[0][0];
      expect(updateCall.data.resolvedAt).toBeNull();
    });

    it('should throw NotFoundError when group does not exist', async () => {
      mockPrisma.errorGroup.findUnique.mockResolvedValue(null);

      await expect(
        updateErrorGroup('missing', { status: 'resolved' })
      ).rejects.toThrow(NotFoundError);
    });

    it('should update assignee', async () => {
      mockPrisma.errorGroup.findUnique.mockResolvedValue(fakeErrorGroup());
      mockPrisma.errorGroup.update.mockResolvedValue(
        fakeErrorGroup({ assignee: 'dev-1' })
      );

      await updateErrorGroup('group-1', { assignee: 'dev-1' });

      const updateCall = mockPrisma.errorGroup.update.mock.calls[0][0];
      expect(updateCall.data.assignee).toBe('dev-1');
    });

    it('should not set resolvedAt when status is not resolved', async () => {
      mockPrisma.errorGroup.findUnique.mockResolvedValue(
        fakeErrorGroup({ status: 'new' })
      );
      mockPrisma.errorGroup.update.mockResolvedValue(
        fakeErrorGroup({ status: 'investigating' })
      );

      await updateErrorGroup('group-1', { status: 'investigating' });

      const updateCall = mockPrisma.errorGroup.update.mock.calls[0][0];
      expect(updateCall.data.resolvedAt).toBeUndefined();
    });
  });

  // ── listOccurrences ──────────────────────────────────────

  describe('listOccurrences', () => {
    it('should return paginated occurrences for a group', async () => {
      mockPrisma.errorGroup.findUnique.mockResolvedValue(fakeErrorGroup());
      mockPrisma.errorReport.findMany.mockResolvedValue([fakeErrorReport()]);
      mockPrisma.errorReport.count.mockResolvedValue(1);

      const result = await listOccurrences('group-1', { page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should throw NotFoundError when group does not exist', async () => {
      mockPrisma.errorGroup.findUnique.mockResolvedValue(null);

      await expect(
        listOccurrences('missing', { page: 1, limit: 10 })
      ).rejects.toThrow(NotFoundError);
    });
  });
});
