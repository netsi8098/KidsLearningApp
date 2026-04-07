import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { NotFoundError } from '../../lib/errors.js';
import type { PaginatedResult } from '../../types/index.js';
import type { ListAuditLogsQuery } from './schemas.js';

// ── List Audit Logs ──────────────────────────────────────

export async function listAuditLogs(
  query: ListAuditLogsQuery
): Promise<PaginatedResult<Record<string, unknown>>> {
  const {
    page,
    limit,
    entity,
    action,
    userId,
    entityId,
    startDate,
    endDate,
  } = query;

  const where: Prisma.AuditLogWhereInput = {};

  if (entity) where.entity = entity;
  if (action) where.action = action;
  if (userId) where.userId = userId;
  if (entityId) where.entityId = entityId;

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) (where.createdAt as Prisma.DateTimeFilter).gte = new Date(startDate);
    if (endDate) (where.createdAt as Prisma.DateTimeFilter).lte = new Date(endDate);
  }

  const [data, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    data: data as unknown as Record<string, unknown>[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ── Get Single Audit Log ─────────────────────────────────

export async function getAuditLog(id: string) {
  const log = await prisma.auditLog.findUnique({
    where: { id },
  });

  if (!log) {
    throw new NotFoundError('AuditLog', id);
  }

  return log;
}

// ── Entity Trail ─────────────────────────────────────────

export async function getEntityTrail(
  entity: string,
  entityId: string,
  page: number,
  limit: number
): Promise<PaginatedResult<Record<string, unknown>>> {
  const where: Prisma.AuditLogWhereInput = {
    entity,
    entityId,
  };

  const [data, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    data: data as unknown as Record<string, unknown>[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
