import { prisma } from '../../lib/prisma.js';
import { NotFoundError, ConflictError } from '../../lib/errors.js';
import { paginate, type PaginationParams, type PaginatedResult } from '../../types/index.js';
import { logAudit } from '../../lib/audit.js';
import { evaluateFlag, type FlagContext } from '../../lib/featureFlags.js';
import { Prisma } from '@prisma/client';
import type { FeatureFlag } from '@prisma/client';

// ── Types ─────────────────────────────────────────────────

export interface FeatureFlagWithOverrides extends FeatureFlag {
  overrides: {
    id: string;
    entityType: string;
    entityId: string;
    value: unknown;
    createdAt: Date;
  }[];
}

// ── List Flags ────────────────────────────────────────────

export async function listFlags(
  filters: { enabled?: boolean },
  pagination: PaginationParams
): Promise<PaginatedResult<FeatureFlagWithOverrides>> {
  const where: Prisma.FeatureFlagWhereInput = {};
  if (filters.enabled !== undefined) {
    where.enabled = filters.enabled;
  }

  const [items, total] = await Promise.all([
    prisma.featureFlag.findMany({
      where,
      include: { overrides: true },
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
      orderBy: pagination.sortBy
        ? { [pagination.sortBy]: pagination.sortOrder || 'desc' }
        : { createdAt: 'desc' },
    }),
    prisma.featureFlag.count({ where }),
  ]);

  return paginate(items as FeatureFlagWithOverrides[], total, pagination);
}

// ── Get Flag ──────────────────────────────────────────────

export async function getFlag(key: string): Promise<FeatureFlagWithOverrides> {
  const flag = await prisma.featureFlag.findUnique({
    where: { key },
    include: { overrides: true },
  });

  if (!flag) {
    throw new NotFoundError('FeatureFlag', key);
  }

  return flag as FeatureFlagWithOverrides;
}

// ── Create Flag ───────────────────────────────────────────

export async function createFlag(
  data: {
    key: string;
    name: string;
    description?: string;
    enabled?: boolean;
    targeting?: Record<string, unknown>;
    defaultValue?: unknown;
  },
  createdBy: string
): Promise<FeatureFlag> {
  // Check for key uniqueness
  const existing = await prisma.featureFlag.findUnique({ where: { key: data.key } });
  if (existing) {
    throw new ConflictError(`Feature flag with key '${data.key}' already exists`);
  }

  const flag = await prisma.featureFlag.create({
    data: {
      key: data.key,
      name: data.name,
      description: data.description || null,
      enabled: data.enabled ?? false,
      targeting: (data.targeting ?? {}) as Prisma.InputJsonValue,
      defaultValue: (data.defaultValue ?? false) as Prisma.InputJsonValue,
      createdBy,
    },
  });

  await logAudit({
    action: 'feature_flag.create',
    entity: 'FeatureFlag',
    entityId: flag.id,
    changes: { key: data.key, name: data.name, enabled: flag.enabled },
    userId: createdBy,
  });

  return flag;
}

// ── Update Flag ───────────────────────────────────────────

export async function updateFlag(
  key: string,
  data: {
    name?: string;
    description?: string;
    enabled?: boolean;
    targeting?: Record<string, unknown>;
    defaultValue?: unknown;
  },
  updatedBy: string
): Promise<FeatureFlag> {
  const flag = await prisma.featureFlag.findUnique({ where: { key } });
  if (!flag) {
    throw new NotFoundError('FeatureFlag', key);
  }

  const updateData: Prisma.FeatureFlagUpdateInput = { updatedBy };

  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.enabled !== undefined) updateData.enabled = data.enabled;
  if (data.targeting !== undefined) updateData.targeting = data.targeting as Prisma.InputJsonValue;
  if (data.defaultValue !== undefined) updateData.defaultValue = (data.defaultValue ?? undefined) as Prisma.InputJsonValue;

  const updated = await prisma.featureFlag.update({
    where: { key },
    data: updateData,
  });

  await logAudit({
    action: 'feature_flag.update',
    entity: 'FeatureFlag',
    entityId: flag.id,
    changes: data,
    userId: updatedBy,
  });

  return updated;
}

// ── Delete Flag (Soft Delete) ─────────────────────────────

export async function deleteFlag(
  key: string,
  deletedBy: string
): Promise<{ deleted: true; key: string }> {
  const flag = await prisma.featureFlag.findUnique({ where: { key } });
  if (!flag) {
    throw new NotFoundError('FeatureFlag', key);
  }

  await prisma.featureFlag.update({
    where: { key },
    data: { deletedAt: new Date(), enabled: false },
  });

  await logAudit({
    action: 'feature_flag.delete',
    entity: 'FeatureFlag',
    entityId: flag.id,
    changes: { key },
    userId: deletedBy,
  });

  return { deleted: true, key };
}

// ── Kill Switch ───────────────────────────────────────────

export async function killFlag(
  key: string,
  killedBy: string
): Promise<FeatureFlag> {
  const flag = await prisma.featureFlag.findUnique({ where: { key } });
  if (!flag) {
    throw new NotFoundError('FeatureFlag', key);
  }

  const updated = await prisma.featureFlag.update({
    where: { key },
    data: { enabled: false, updatedBy: killedBy },
  });

  await logAudit({
    action: 'feature_flag.kill',
    entity: 'FeatureFlag',
    entityId: flag.id,
    changes: { enabled: false, previousEnabled: flag.enabled },
    userId: killedBy,
  });

  return updated;
}

// ── Evaluate Batch ────────────────────────────────────────

export async function evaluateBatch(
  keys: string[],
  context: FlagContext
): Promise<Record<string, unknown>> {
  const results: Record<string, unknown> = {};

  await Promise.all(
    keys.map(async (key) => {
      results[key] = await evaluateFlag(key, context);
    })
  );

  return results;
}

// ── Evaluate Single ───────────────────────────────────────

export async function evaluateSingle(
  key: string,
  context: FlagContext
): Promise<{ key: string; value: unknown }> {
  const value = await evaluateFlag(key, context);
  return { key, value };
}
