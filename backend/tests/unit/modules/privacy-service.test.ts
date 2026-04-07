import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockPrisma, resetPrismaMocks } from '../../helpers/prisma.mock';

// ── Mock dependencies ────────────────────────────────────────
vi.mock('../../../src/lib/prisma', () => ({ prisma: mockPrisma }));

import {
  listConsents,
  recordConsent,
  revokeConsent,
  createExportRequest,
  createDeletionRequest,
  processRequest,
  getDownloadUrl,
} from '../../../src/modules/privacy/service';
import { NotFoundError, ValidationError } from '../../../src/lib/errors';

// ── Helpers ──────────────────────────────────────────────────

function fakeConsent(overrides: Record<string, unknown> = {}) {
  return {
    id: 'consent-1',
    parentId: 'parent-1',
    consentType: 'analytics',
    granted: true,
    version: '1.0',
    ipAddress: '127.0.0.1',
    grantedAt: new Date('2024-01-01'),
    revokedAt: null,
    ...overrides,
  };
}

function fakeParent(overrides: Record<string, unknown> = {}) {
  return {
    id: 'parent-1',
    email: 'parent@test.com',
    name: 'Test Parent',
    ...overrides,
  };
}

function fakeDataRequest(overrides: Record<string, unknown> = {}) {
  return {
    id: 'req-1',
    parentId: 'parent-1',
    householdId: 'hh-1',
    type: 'export',
    status: 'pending',
    fileUrl: null,
    requestedAt: new Date('2024-01-01'),
    completedAt: null,
    ...overrides,
  };
}

// ── Tests ────────────────────────────────────────────────────

describe('PrivacyService', () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  // ── listConsents ─────────────────────────────────────────

  describe('listConsents', () => {
    it('should return all consent records for a parent', async () => {
      const consents = [fakeConsent(), fakeConsent({ id: 'consent-2', consentType: 'marketing' })];
      mockPrisma.parentAccount.findUnique.mockResolvedValue(fakeParent());
      mockPrisma.consentRecord.findMany.mockResolvedValue(consents);

      const result = await listConsents('parent-1');

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should throw NotFoundError when parent does not exist', async () => {
      mockPrisma.parentAccount.findUnique.mockResolvedValue(null);

      await expect(listConsents('missing')).rejects.toThrow(NotFoundError);
    });

    it('should return empty data when no consents exist', async () => {
      mockPrisma.parentAccount.findUnique.mockResolvedValue(fakeParent());
      mockPrisma.consentRecord.findMany.mockResolvedValue([]);

      const result = await listConsents('parent-1');

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  // ── recordConsent ────────────────────────────────────────

  describe('recordConsent', () => {
    it('should create a new consent record when none exists', async () => {
      mockPrisma.parentAccount.findUnique.mockResolvedValue(fakeParent());
      mockPrisma.consentRecord.findFirst.mockResolvedValue(null);
      mockPrisma.consentRecord.create.mockResolvedValue(fakeConsent());

      const result = await recordConsent({
        parentId: 'parent-1',
        consentType: 'analytics',
        granted: true,
        version: '1.0',
        ipAddress: '127.0.0.1',
      });

      expect(result.consentType).toBe('analytics');
      expect(mockPrisma.consentRecord.create).toHaveBeenCalled();
    });

    it('should upsert (update) when consent record already exists', async () => {
      const existingConsent = fakeConsent({ id: 'consent-1' });
      mockPrisma.parentAccount.findUnique.mockResolvedValue(fakeParent());
      mockPrisma.consentRecord.findFirst.mockResolvedValue(existingConsent);
      mockPrisma.consentRecord.update.mockResolvedValue(
        fakeConsent({ granted: false })
      );

      const result = await recordConsent({
        parentId: 'parent-1',
        consentType: 'analytics',
        granted: false,
        version: '2.0',
      });

      expect(mockPrisma.consentRecord.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'consent-1' },
          data: expect.objectContaining({
            granted: false,
            version: '2.0',
            revokedAt: null,
          }),
        })
      );
    });

    it('should throw NotFoundError when parent does not exist', async () => {
      mockPrisma.parentAccount.findUnique.mockResolvedValue(null);

      await expect(
        recordConsent({
          parentId: 'missing',
          consentType: 'analytics',
          granted: true,
          version: '1.0',
        })
      ).rejects.toThrow(NotFoundError);
    });
  });

  // ── revokeConsent ────────────────────────────────────────

  describe('revokeConsent', () => {
    it('should set revokedAt and granted=false', async () => {
      mockPrisma.consentRecord.findFirst.mockResolvedValue(fakeConsent());
      mockPrisma.consentRecord.update.mockResolvedValue(
        fakeConsent({ granted: false, revokedAt: new Date() })
      );

      const result = await revokeConsent({
        parentId: 'parent-1',
        consentType: 'analytics',
      });

      expect(mockPrisma.consentRecord.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            granted: false,
            revokedAt: expect.any(Date),
          }),
        })
      );
    });

    it('should throw NotFoundError when no active consent exists', async () => {
      mockPrisma.consentRecord.findFirst.mockResolvedValue(null);

      await expect(
        revokeConsent({ parentId: 'parent-1', consentType: 'analytics' })
      ).rejects.toThrow(NotFoundError);
    });

    it('should only find consents that have not been revoked yet', async () => {
      mockPrisma.consentRecord.findFirst.mockResolvedValue(null);

      try {
        await revokeConsent({ parentId: 'parent-1', consentType: 'analytics' });
      } catch {
        // expected
      }

      expect(mockPrisma.consentRecord.findFirst).toHaveBeenCalledWith({
        where: {
          parentId: 'parent-1',
          consentType: 'analytics',
          revokedAt: null,
        },
      });
    });
  });

  // ── createExportRequest ──────────────────────────────────

  describe('createExportRequest', () => {
    it('should create an export data request', async () => {
      mockPrisma.parentAccount.findUnique.mockResolvedValue(fakeParent());
      mockPrisma.dataRequest.findFirst.mockResolvedValue(null);
      mockPrisma.dataRequest.create.mockResolvedValue(fakeDataRequest());

      const result = await createExportRequest({
        parentId: 'parent-1',
        householdId: 'hh-1',
      });

      expect(result.type).toBe('export');
      expect(result.status).toBe('pending');
    });

    it('should throw ValidationError when duplicate pending export request exists', async () => {
      mockPrisma.parentAccount.findUnique.mockResolvedValue(fakeParent());
      mockPrisma.dataRequest.findFirst.mockResolvedValue(fakeDataRequest());

      await expect(
        createExportRequest({ parentId: 'parent-1', householdId: 'hh-1' })
      ).rejects.toThrow(ValidationError);
    });

    it('should throw NotFoundError when parent does not exist', async () => {
      mockPrisma.parentAccount.findUnique.mockResolvedValue(null);

      await expect(
        createExportRequest({ parentId: 'missing', householdId: 'hh-1' })
      ).rejects.toThrow(NotFoundError);
    });
  });

  // ── createDeletionRequest ────────────────────────────────

  describe('createDeletionRequest', () => {
    it('should create a deletion data request', async () => {
      mockPrisma.parentAccount.findUnique.mockResolvedValue(fakeParent());
      mockPrisma.dataRequest.findFirst.mockResolvedValue(null);
      mockPrisma.dataRequest.create.mockResolvedValue(
        fakeDataRequest({ type: 'deletion' })
      );

      const result = await createDeletionRequest({
        parentId: 'parent-1',
        householdId: 'hh-1',
      });

      expect(result.type).toBe('deletion');
    });

    it('should throw ValidationError when duplicate pending deletion request exists', async () => {
      mockPrisma.parentAccount.findUnique.mockResolvedValue(fakeParent());
      mockPrisma.dataRequest.findFirst.mockResolvedValue(
        fakeDataRequest({ type: 'deletion' })
      );

      await expect(
        createDeletionRequest({ parentId: 'parent-1', householdId: 'hh-1' })
      ).rejects.toThrow(ValidationError);
    });

    it('should throw NotFoundError when parent does not exist', async () => {
      mockPrisma.parentAccount.findUnique.mockResolvedValue(null);

      await expect(
        createDeletionRequest({ parentId: 'missing', householdId: 'hh-1' })
      ).rejects.toThrow(NotFoundError);
    });
  });

  // ── processRequest ───────────────────────────────────────

  describe('processRequest', () => {
    it('should update status to completed with completedAt', async () => {
      mockPrisma.dataRequest.findUnique.mockResolvedValue(fakeDataRequest());
      mockPrisma.dataRequest.update.mockResolvedValue(
        fakeDataRequest({ status: 'completed', completedAt: new Date() })
      );

      const result = await processRequest('req-1', {
        status: 'completed',
        fileUrl: 'https://storage.example.com/export.zip',
      });

      expect(mockPrisma.dataRequest.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'completed',
            completedAt: expect.any(Date),
            fileUrl: 'https://storage.example.com/export.zip',
          }),
        })
      );
    });

    it('should update status without completedAt for non-completed status', async () => {
      mockPrisma.dataRequest.findUnique.mockResolvedValue(fakeDataRequest());
      mockPrisma.dataRequest.update.mockResolvedValue(
        fakeDataRequest({ status: 'processing' })
      );

      await processRequest('req-1', { status: 'processing' });

      const updateCall = mockPrisma.dataRequest.update.mock.calls[0][0];
      expect(updateCall.data.status).toBe('processing');
      expect(updateCall.data.completedAt).toBeUndefined();
    });

    it('should throw NotFoundError when request does not exist', async () => {
      mockPrisma.dataRequest.findUnique.mockResolvedValue(null);

      await expect(
        processRequest('missing', { status: 'completed' })
      ).rejects.toThrow(NotFoundError);
    });
  });

  // ── getDownloadUrl ───────────────────────────────────────

  describe('getDownloadUrl', () => {
    it('should return fileUrl for completed export request', async () => {
      mockPrisma.dataRequest.findUnique.mockResolvedValue(
        fakeDataRequest({
          type: 'export',
          status: 'completed',
          fileUrl: 'https://cdn.example.com/export.zip',
        })
      );

      const result = await getDownloadUrl('req-1');

      expect(result.fileUrl).toBe('https://cdn.example.com/export.zip');
    });

    it('should throw NotFoundError when request does not exist', async () => {
      mockPrisma.dataRequest.findUnique.mockResolvedValue(null);

      await expect(getDownloadUrl('missing')).rejects.toThrow(NotFoundError);
    });

    it('should throw ValidationError for deletion request type', async () => {
      mockPrisma.dataRequest.findUnique.mockResolvedValue(
        fakeDataRequest({ type: 'deletion', status: 'completed', fileUrl: null })
      );

      await expect(getDownloadUrl('req-1')).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when export is not yet completed', async () => {
      mockPrisma.dataRequest.findUnique.mockResolvedValue(
        fakeDataRequest({ type: 'export', status: 'pending', fileUrl: null })
      );

      await expect(getDownloadUrl('req-1')).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when export has no fileUrl', async () => {
      mockPrisma.dataRequest.findUnique.mockResolvedValue(
        fakeDataRequest({ type: 'export', status: 'completed', fileUrl: null })
      );

      await expect(getDownloadUrl('req-1')).rejects.toThrow(ValidationError);
    });
  });
});
