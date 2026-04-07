import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { NotFoundError, ConflictError } from '../../lib/errors.js';
import { logAudit } from '../../lib/audit.js';
import { paginate } from '../../types/index.js';
import type { PaginatedResult } from '../../types/index.js';
import type {
  ListAssetsQuery,
  CreateAssetInput,
  UpdateAssetInput,
} from './schemas.js';

// ── List Merchandising Assets ─────────────────────────────

export async function listAssets(
  query: ListAssetsQuery
): Promise<PaginatedResult<unknown>> {
  const { page, limit, sortBy, sortOrder, type, status, campaign, platform } = query;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (type) where.type = type;
  if (status) where.status = status;
  if (campaign) where.campaign = campaign;
  if (platform) where.platform = platform;

  const [data, total] = await Promise.all([
    prisma.merchandisingAsset.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.merchandisingAsset.count({ where }),
  ]);

  return paginate(data, total, { page, limit, sortBy, sortOrder });
}

// ── Get Asset By ID ───────────────────────────────────────

export async function getAsset(id: string) {
  const asset = await prisma.merchandisingAsset.findUnique({
    where: { id },
  });

  if (!asset) {
    throw new NotFoundError('MerchandisingAsset', id);
  }

  return asset;
}

// ── Create Asset ──────────────────────────────────────────

export async function createAsset(data: CreateAssetInput, userId?: string) {
  const asset = await prisma.merchandisingAsset.create({
    data: {
      type: data.type,
      title: data.title,
      filename: data.filename,
      storageKey: data.storageKey,
      locale: data.locale ?? 'en',
      platform: data.platform,
      aspectRatio: data.aspectRatio ?? null,
      campaign: data.campaign ?? null,
      releaseId: data.releaseId ?? null,
      collectionId: data.collectionId ?? null,
      metadata: (data.metadata ?? {}) as Prisma.InputJsonValue,
      createdBy: userId ?? null,
    },
  });

  await logAudit({
    action: 'merchandising.create',
    entity: 'MerchandisingAsset',
    entityId: asset.id,
    changes: { type: data.type, title: data.title, platform: data.platform },
    userId,
  });

  return asset;
}

// ── Update Asset ──────────────────────────────────────────

export async function updateAsset(id: string, data: UpdateAssetInput, userId?: string) {
  const existing = await prisma.merchandisingAsset.findUnique({ where: { id } });

  if (!existing) {
    throw new NotFoundError('MerchandisingAsset', id);
  }

  const updateData: Record<string, unknown> = {};

  if (data.type !== undefined) updateData.type = data.type;
  if (data.title !== undefined) updateData.title = data.title;
  if (data.filename !== undefined) updateData.filename = data.filename;
  if (data.locale !== undefined) updateData.locale = data.locale;
  if (data.platform !== undefined) updateData.platform = data.platform;
  if (data.aspectRatio !== undefined) updateData.aspectRatio = data.aspectRatio;
  if (data.campaign !== undefined) updateData.campaign = data.campaign;
  if (data.releaseId !== undefined) updateData.releaseId = data.releaseId;
  if (data.collectionId !== undefined) updateData.collectionId = data.collectionId;
  if (data.expiresAt !== undefined) updateData.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
  if (data.metadata !== undefined) {
    updateData.metadata = {
      ...(existing.metadata as Record<string, unknown>),
      ...data.metadata,
    };
  }

  const asset = await prisma.merchandisingAsset.update({
    where: { id },
    data: updateData,
  });

  await logAudit({
    action: 'merchandising.update',
    entity: 'MerchandisingAsset',
    entityId: id,
    changes: updateData,
    userId,
  });

  return asset;
}

// ── Soft-Delete Asset ─────────────────────────────────────

export async function deleteAsset(id: string, userId?: string): Promise<void> {
  const existing = await prisma.merchandisingAsset.findUnique({ where: { id } });

  if (!existing) {
    throw new NotFoundError('MerchandisingAsset', id);
  }

  // Soft-delete middleware converts delete to update with deletedAt
  await prisma.merchandisingAsset.delete({ where: { id } });

  await logAudit({
    action: 'merchandising.delete',
    entity: 'MerchandisingAsset',
    entityId: id,
    userId,
  });
}

// ── Approve Asset ─────────────────────────────────────────

export async function approveAsset(id: string, userId?: string) {
  const existing = await prisma.merchandisingAsset.findUnique({ where: { id } });

  if (!existing) {
    throw new NotFoundError('MerchandisingAsset', id);
  }

  if (existing.status === 'approved') {
    throw new ConflictError('Asset is already approved.');
  }

  const asset = await prisma.merchandisingAsset.update({
    where: { id },
    data: { status: 'approved' },
  });

  await logAudit({
    action: 'merchandising.approve',
    entity: 'MerchandisingAsset',
    entityId: id,
    changes: { status: 'approved', previousStatus: existing.status },
    userId,
  });

  return asset;
}

// ── List Campaigns ────────────────────────────────────────

export async function listCampaigns(): Promise<{ campaign: string; count: number }[]> {
  const results = await prisma.merchandisingAsset.groupBy({
    by: ['campaign'],
    _count: { id: true },
    where: { campaign: { not: null } },
    orderBy: { _count: { id: 'desc' } },
  });

  return results.map((r) => ({
    campaign: r.campaign!,
    count: r._count.id,
  }));
}

// ── Get Campaign Assets ───────────────────────────────────

export async function getCampaignAssets(name: string) {
  const assets = await prisma.merchandisingAsset.findMany({
    where: { campaign: name },
    orderBy: { createdAt: 'desc' },
  });

  return assets;
}
