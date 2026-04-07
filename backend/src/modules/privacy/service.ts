import { prisma } from '../../lib/prisma.js';
import { NotFoundError, ValidationError } from '../../lib/errors.js';
import { paginate, type PaginatedResult } from '../../types/index.js';
import type {
  RecordConsentInput,
  RevokeConsentInput,
  ListDataRequestsQuery,
  CreateExportRequestInput,
  CreateDeletionRequestInput,
  ProcessRequestInput,
} from './schemas.js';

// ── List Consent Records ──────────────────────────────────

export async function listConsents(parentId: string) {
  const parent = await prisma.parentAccount.findUnique({ where: { id: parentId } });
  if (!parent) {
    throw new NotFoundError('ParentAccount', parentId);
  }

  const consents = await prisma.consentRecord.findMany({
    where: { parentId },
    orderBy: { grantedAt: 'desc' },
  });

  return { data: consents, total: consents.length };
}

// ── Record Consent ────────────────────────────────────────

export async function recordConsent(input: RecordConsentInput) {
  const parent = await prisma.parentAccount.findUnique({ where: { id: input.parentId } });
  if (!parent) {
    throw new NotFoundError('ParentAccount', input.parentId);
  }

  // Upsert: if a consent record already exists for this parent + type, update it
  const existing = await prisma.consentRecord.findFirst({
    where: {
      parentId: input.parentId,
      consentType: input.consentType,
    },
  });

  if (existing) {
    const updated = await prisma.consentRecord.update({
      where: { id: existing.id },
      data: {
        granted: input.granted,
        version: input.version,
        ipAddress: input.ipAddress ?? null,
        grantedAt: new Date(),
        revokedAt: null,
      },
    });
    return updated;
  }

  const consent = await prisma.consentRecord.create({
    data: {
      parentId: input.parentId,
      consentType: input.consentType,
      granted: input.granted,
      version: input.version,
      ipAddress: input.ipAddress ?? null,
      grantedAt: new Date(),
    },
  });

  return consent;
}

// ── Revoke Consent ────────────────────────────────────────

export async function revokeConsent(input: RevokeConsentInput) {
  const consent = await prisma.consentRecord.findFirst({
    where: {
      parentId: input.parentId,
      consentType: input.consentType,
      revokedAt: null,
    },
  });

  if (!consent) {
    throw new NotFoundError(
      'ConsentRecord',
      `parentId=${input.parentId}, consentType=${input.consentType}`
    );
  }

  const revoked = await prisma.consentRecord.update({
    where: { id: consent.id },
    data: {
      granted: false,
      revokedAt: new Date(),
    },
  });

  return revoked;
}

// ── List Data Requests (admin, paginated) ─────────────────

export async function listDataRequests(
  query: ListDataRequestsQuery
): Promise<PaginatedResult<Record<string, unknown>>> {
  const { page, limit, status, type } = query;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (type) where.type = type;

  const [data, total] = await Promise.all([
    prisma.dataRequest.findMany({
      where,
      orderBy: { requestedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.dataRequest.count({ where }),
  ]);

  return paginate(data as unknown as Record<string, unknown>[], total, { page, limit });
}

// ── Create Export Request ─────────────────────────────────

export async function createExportRequest(input: CreateExportRequestInput) {
  const parent = await prisma.parentAccount.findUnique({ where: { id: input.parentId } });
  if (!parent) {
    throw new NotFoundError('ParentAccount', input.parentId);
  }

  // Prevent duplicate pending export requests
  const existing = await prisma.dataRequest.findFirst({
    where: {
      parentId: input.parentId,
      householdId: input.householdId,
      type: 'export',
      status: 'pending',
    },
  });

  if (existing) {
    throw new ValidationError('A pending export request already exists for this parent and household');
  }

  const request = await prisma.dataRequest.create({
    data: {
      parentId: input.parentId,
      householdId: input.householdId,
      type: 'export',
      status: 'pending',
      requestedAt: new Date(),
    },
  });

  return request;
}

// ── Create Deletion Request ───────────────────────────────

export async function createDeletionRequest(input: CreateDeletionRequestInput) {
  const parent = await prisma.parentAccount.findUnique({ where: { id: input.parentId } });
  if (!parent) {
    throw new NotFoundError('ParentAccount', input.parentId);
  }

  // Prevent duplicate pending deletion requests
  const existing = await prisma.dataRequest.findFirst({
    where: {
      parentId: input.parentId,
      householdId: input.householdId,
      type: 'deletion',
      status: 'pending',
    },
  });

  if (existing) {
    throw new ValidationError('A pending deletion request already exists for this parent and household');
  }

  const request = await prisma.dataRequest.create({
    data: {
      parentId: input.parentId,
      householdId: input.householdId,
      type: 'deletion',
      status: 'pending',
      requestedAt: new Date(),
    },
  });

  return request;
}

// ── Process Request (admin) ───────────────────────────────

export async function processRequest(id: string, input: ProcessRequestInput) {
  const request = await prisma.dataRequest.findUnique({ where: { id } });
  if (!request) {
    throw new NotFoundError('DataRequest', id);
  }

  const data: Record<string, unknown> = {
    status: input.status,
  };

  if (input.fileUrl !== undefined) {
    data.fileUrl = input.fileUrl;
  }

  if (input.status === 'completed') {
    data.completedAt = new Date();
  }

  const updated = await prisma.dataRequest.update({
    where: { id },
    data,
  });

  return updated;
}

// ── Download Export File ──────────────────────────────────

export async function getDownloadUrl(id: string) {
  const request = await prisma.dataRequest.findUnique({ where: { id } });
  if (!request) {
    throw new NotFoundError('DataRequest', id);
  }

  if (request.type !== 'export') {
    throw new ValidationError('Only export requests have downloadable files');
  }

  if (request.status !== 'completed' || !request.fileUrl) {
    throw new ValidationError('Export file is not yet available');
  }

  return { fileUrl: request.fileUrl };
}
