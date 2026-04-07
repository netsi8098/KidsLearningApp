import crypto from 'crypto';
import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { NotFoundError } from '../../lib/errors.js';
import { paginate } from '../../types/index.js';
import type { PaginatedResult } from '../../types/index.js';
import type {
  ReportErrorInput,
  ListErrorGroupsQuery,
  UpdateErrorGroupInput,
  ListOccurrencesQuery,
  ErrorStatsQuery,
} from './schemas.js';

// ── Fingerprinting ────────────────────────────────────────

function computeFingerprint(category: string, message: string): string {
  return crypto
    .createHash('sha256')
    .update(category + ':' + message)
    .digest('hex')
    .substring(0, 16);
}

// ── Quality Gate Thresholds ───────────────────────────────

const QUALITY_GATE_THRESHOLDS = {
  maxNewErrorsPerHour: 50,
  maxReleaseBlockingGroups: 0,
  maxErrorRatePerMinute: 10,
  maxUniqueErrorGroups24h: 100,
};

// ── Report Error ──────────────────────────────────────────

export async function reportError(data: ReportErrorInput) {
  const fingerprint = computeFingerprint(data.category, data.message);
  const now = new Date();

  // Upsert the error group
  const group = await prisma.errorGroup.upsert({
    where: { fingerprint },
    create: {
      fingerprint,
      category: data.category,
      message: data.message,
      firstSeen: now,
      lastSeen: now,
      count: 1,
      status: 'new',
    },
    update: {
      lastSeen: now,
      count: { increment: 1 },
    },
  });

  // Create the error report linked to the group
  const report = await prisma.errorReport.create({
    data: {
      groupId: group.id,
      category: data.category,
      message: data.message,
      stack: data.stack,
      metadata: (data.metadata ?? {}) as Prisma.InputJsonValue,
      deviceInfo: (data.deviceInfo ?? undefined) as Prisma.InputJsonValue | undefined,
      appVersion: data.appVersion,
      releaseId: data.releaseId,
      profileId: data.profileId,
    },
  });

  return {
    reportId: report.id,
    groupId: group.id,
    fingerprint,
    isNewGroup: group.count === 1,
  };
}

// ── List Error Groups ─────────────────────────────────────

export async function listErrorGroups(
  query: ListErrorGroupsQuery
): Promise<PaginatedResult<unknown>> {
  const { page, limit, sortBy, sortOrder, status, category } = query;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (category) where.category = category;

  const [groups, total] = await Promise.all([
    prisma.errorGroup.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.errorGroup.count({ where }),
  ]);

  return paginate(groups, total, { page, limit, sortBy, sortOrder });
}

// ── Get Error Group Detail ────────────────────────────────

export async function getErrorGroup(id: string) {
  const group = await prisma.errorGroup.findUnique({
    where: { id },
  });

  if (!group) {
    throw new NotFoundError('ErrorGroup', id);
  }

  // Fetch recent occurrences for the detail view
  const recentOccurrences = await prisma.errorReport.findMany({
    where: { groupId: id },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  return {
    ...group,
    recentOccurrences,
  };
}

// ── Update Error Group ────────────────────────────────────

export async function updateErrorGroup(id: string, data: UpdateErrorGroupInput) {
  const group = await prisma.errorGroup.findUnique({ where: { id } });

  if (!group) {
    throw new NotFoundError('ErrorGroup', id);
  }

  const updateData: Record<string, unknown> = {};
  if (data.status !== undefined) {
    updateData.status = data.status;
    if (data.status === 'resolved') {
      updateData.resolvedAt = new Date();
    } else if (group.status === 'resolved') {
      // Reopening a resolved group clears the resolvedAt
      updateData.resolvedAt = null;
    }
  }
  if (data.assignee !== undefined) {
    updateData.assignee = data.assignee;
  }

  const updated = await prisma.errorGroup.update({
    where: { id },
    data: updateData,
  });

  return updated;
}

// ── List Occurrences ──────────────────────────────────────

export async function listOccurrences(
  groupId: string,
  query: ListOccurrencesQuery
): Promise<PaginatedResult<unknown>> {
  const { page, limit } = query;
  const skip = (page - 1) * limit;

  // Verify group exists
  const group = await prisma.errorGroup.findUnique({ where: { id: groupId } });
  if (!group) {
    throw new NotFoundError('ErrorGroup', groupId);
  }

  const where = { groupId };

  const [occurrences, total] = await Promise.all([
    prisma.errorReport.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.errorReport.count({ where }),
  ]);

  return paginate(occurrences, total, { page, limit });
}

// ── Error Stats ───────────────────────────────────────────

export async function getErrorStats(filters?: ErrorStatsQuery) {
  const where: Record<string, unknown> = {};

  if (filters?.from || filters?.to) {
    const dateFilter: Record<string, Date> = {};
    if (filters.from) dateFilter.gte = new Date(filters.from);
    if (filters.to) dateFilter.lte = new Date(filters.to);
    where.createdAt = dateFilter;
  }

  // Count by category
  const byCategory = await prisma.errorReport.groupBy({
    by: ['category'],
    where,
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
  });

  // Count by appVersion
  const byAppVersion = await prisma.errorReport.groupBy({
    by: ['appVersion'],
    where: { ...where, appVersion: { not: null } },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
  });

  // Total reports in range
  const totalReports = await prisma.errorReport.count({ where });

  // Total active groups (not resolved)
  const activeGroups = await prisma.errorGroup.count({
    where: { status: { not: 'resolved' } },
  });

  return {
    totalReports,
    activeGroups,
    byCategory: byCategory.map((row) => ({
      category: row.category,
      count: row._count.id,
    })),
    byAppVersion: byAppVersion.map((row) => ({
      appVersion: row.appVersion ?? 'unknown',
      count: row._count.id,
    })),
  };
}

// ── Quality Gates ─────────────────────────────────────────

export async function getQualityGateStatus() {
  const results = await evaluateQualityGates();

  const allPassing = results.gates.every((g) => g.passing);

  return {
    status: allPassing ? 'passing' : 'failing',
    gates: results.gates,
    evaluatedAt: results.evaluatedAt,
  };
}

export async function evaluateQualityGates() {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Gate 1: New errors per hour
  const newErrorsLastHour = await prisma.errorReport.count({
    where: { createdAt: { gte: oneHourAgo } },
  });

  // Gate 2: Release-blocking groups
  const releaseBlockingGroups = await prisma.errorGroup.count({
    where: { status: 'release_blocking' },
  });

  // Gate 3: Error rate per minute
  const errorsLastMinute = await prisma.errorReport.count({
    where: { createdAt: { gte: oneMinuteAgo } },
  });

  // Gate 4: Unique error groups in last 24h
  const uniqueGroups24h = await prisma.errorGroup.count({
    where: { lastSeen: { gte: twentyFourHoursAgo } },
  });

  const gates = [
    {
      name: 'new_errors_per_hour',
      description: 'New error reports in the last hour',
      threshold: QUALITY_GATE_THRESHOLDS.maxNewErrorsPerHour,
      current: newErrorsLastHour,
      passing: newErrorsLastHour <= QUALITY_GATE_THRESHOLDS.maxNewErrorsPerHour,
    },
    {
      name: 'release_blocking_groups',
      description: 'Error groups marked as release-blocking',
      threshold: QUALITY_GATE_THRESHOLDS.maxReleaseBlockingGroups,
      current: releaseBlockingGroups,
      passing: releaseBlockingGroups <= QUALITY_GATE_THRESHOLDS.maxReleaseBlockingGroups,
    },
    {
      name: 'error_rate_per_minute',
      description: 'Error reports in the last minute',
      threshold: QUALITY_GATE_THRESHOLDS.maxErrorRatePerMinute,
      current: errorsLastMinute,
      passing: errorsLastMinute <= QUALITY_GATE_THRESHOLDS.maxErrorRatePerMinute,
    },
    {
      name: 'unique_error_groups_24h',
      description: 'Unique error groups active in last 24 hours',
      threshold: QUALITY_GATE_THRESHOLDS.maxUniqueErrorGroups24h,
      current: uniqueGroups24h,
      passing: uniqueGroups24h <= QUALITY_GATE_THRESHOLDS.maxUniqueErrorGroups24h,
    },
  ];

  return {
    gates,
    evaluatedAt: now.toISOString(),
  };
}
