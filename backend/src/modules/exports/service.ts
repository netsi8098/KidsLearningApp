import { prisma } from '../../lib/prisma.js';
import { NotFoundError, ValidationError } from '../../lib/errors.js';
import { logAudit } from '../../lib/audit.js';
import { paginate, type PaginationParams, type PaginatedResult } from '../../types/index.js';
import { Prisma } from '@prisma/client';
import type { ExportJob } from '@prisma/client';
import type { ExportType, ExportFormat, ExportStatus } from './schemas.js';

// ── Types ─────────────────────────────────────────────────

export interface DataDictionaryEntry {
  type: string;
  description: string;
  fields: string[];
}

// ── Data Dictionary ───────────────────────────────────────

const DATA_DICTIONARY: DataDictionaryEntry[] = [
  {
    type: 'households',
    description: 'Household accounts and settings',
    fields: ['id', 'name', 'email', 'plan', 'locale', 'timezone', 'createdAt', 'updatedAt'],
  },
  {
    type: 'profiles',
    description: 'Child profiles within households',
    fields: ['id', 'householdId', 'name', 'avatarUrl', 'ageGroup', 'createdAt', 'updatedAt'],
  },
  {
    type: 'catalog',
    description: 'Content catalog items',
    fields: ['id', 'title', 'slug', 'type', 'status', 'ageGroup', 'difficulty', 'accessTier', 'emoji', 'createdAt', 'publishedAt'],
  },
  {
    type: 'events',
    description: 'User interaction events',
    fields: ['id', 'profileId', 'contentId', 'eventType', 'metadata', 'createdAt'],
  },
  {
    type: 'subscriptions',
    description: 'Subscription records',
    fields: ['id', 'householdId', 'plan', 'status', 'startDate', 'endDate', 'cancelledAt', 'createdAt'],
  },
  {
    type: 'releases',
    description: 'Content release schedules',
    fields: ['id', 'name', 'status', 'scheduledAt', 'publishedAt', 'contentCount', 'createdBy', 'createdAt'],
  },
  {
    type: 'experiments',
    description: 'A/B experiment configurations and results',
    fields: ['id', 'name', 'description', 'status', 'startDate', 'endDate', 'variantCount', 'createdBy', 'createdAt'],
  },
  {
    type: 'analytics',
    description: 'Aggregated content analytics',
    fields: ['id', 'contentId', 'period', 'periodKey', 'views', 'completions', 'avgTimeMs', 'stars', 'favorites', 'shares'],
  },
];

// ── Export Job CRUD ───────────────────────────────────────

export async function listExportJobs(
  filters: { type?: ExportType; status?: ExportStatus },
  pagination: PaginationParams
): Promise<PaginatedResult<ExportJob>> {
  const where: Prisma.ExportJobWhereInput = {};

  if (filters.type) {
    where.type = filters.type;
  }
  if (filters.status) {
    where.status = filters.status;
  }

  const [items, total] = await Promise.all([
    prisma.exportJob.findMany({
      where,
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
      orderBy: pagination.sortBy
        ? { [pagination.sortBy]: pagination.sortOrder || 'desc' }
        : { createdAt: 'desc' },
    }),
    prisma.exportJob.count({ where }),
  ]);

  return paginate(items, total, pagination);
}

export async function createExportJob(
  data: { type: ExportType; filters?: Record<string, unknown>; format: ExportFormat },
  requestedBy: string
): Promise<ExportJob> {
  const exportJob = await prisma.exportJob.create({
    data: {
      type: data.type,
      filters: (data.filters ?? {}) as Prisma.InputJsonValue,
      format: data.format,
      status: 'pending',
      requestedBy,
    },
  });

  await logAudit({
    action: 'create',
    entity: 'ExportJob',
    entityId: exportJob.id,
    changes: { type: data.type, format: data.format, filters: data.filters },
    userId: requestedBy,
  });

  return exportJob;
}

export async function getExportJob(id: string): Promise<ExportJob> {
  const exportJob = await prisma.exportJob.findUnique({ where: { id } });

  if (!exportJob) {
    throw new NotFoundError('ExportJob', id);
  }

  return exportJob;
}

export async function getExportDownloadUrl(id: string): Promise<string> {
  const exportJob = await prisma.exportJob.findUnique({ where: { id } });

  if (!exportJob) {
    throw new NotFoundError('ExportJob', id);
  }

  if (exportJob.status !== 'completed') {
    throw new ValidationError(
      `Export job is not ready for download. Current status: ${exportJob.status}`
    );
  }

  if (!exportJob.fileUrl) {
    throw new NotFoundError('Export file not available for this job');
  }

  return exportJob.fileUrl;
}

export async function cancelExportJob(
  id: string,
  cancelledBy: string
): Promise<ExportJob> {
  const exportJob = await prisma.exportJob.findUnique({ where: { id } });

  if (!exportJob) {
    throw new NotFoundError('ExportJob', id);
  }

  if (exportJob.status !== 'pending') {
    throw new ValidationError(
      `Can only cancel pending export jobs. Current status: ${exportJob.status}`
    );
  }

  const updated = await prisma.exportJob.update({
    where: { id },
    data: { status: 'failed' },
  });

  await logAudit({
    action: 'cancel',
    entity: 'ExportJob',
    entityId: id,
    changes: { previousStatus: 'pending', newStatus: 'failed' },
    userId: cancelledBy,
  });

  return updated;
}

export function getDataDictionary(): DataDictionaryEntry[] {
  return DATA_DICTIONARY;
}
