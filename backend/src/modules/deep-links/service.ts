import { randomBytes } from 'crypto';
import { prisma } from '../../lib/prisma.js';
import { NotFoundError, ValidationError, ConflictError } from '../../lib/errors.js';
import { logAudit } from '../../lib/audit.js';
import { paginate, type PaginatedResult, type PaginationParams } from '../../types/index.js';
import { Prisma } from '@prisma/client';
import type { DeepLink } from '@prisma/client';
import type { CreateDeepLinkInput, UpdateDeepLinkInput, ListDeepLinksQuery } from './schemas.js';

// ── Helpers ──────────────────────────────────────────────

function generateShortCode(): string {
  // 8-character alphanumeric code from random bytes
  return randomBytes(6)
    .toString('base64url')
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 8);
}

// ── List Deep Links ──────────────────────────────────────

export async function listDeepLinks(
  query: ListDeepLinksQuery
): Promise<PaginatedResult<DeepLink>> {
  const { page, limit, sortBy, sortOrder, targetType, campaign } = query;

  const where: Prisma.DeepLinkWhereInput = {};
  if (targetType) where.targetType = targetType;
  if (campaign) where.campaign = campaign;

  const [data, total] = await Promise.all([
    prisma.deepLink.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.deepLink.count({ where }),
  ]);

  return paginate(data, total, { page, limit, sortBy, sortOrder });
}

// ── Create Deep Link ─────────────────────────────────────

export async function createDeepLink(
  input: CreateDeepLinkInput,
  createdBy: string
): Promise<DeepLink> {
  // Generate a unique shortCode with retry
  let shortCode = generateShortCode();
  let attempts = 0;

  while (attempts < 5) {
    const existing = await prisma.deepLink.findUnique({
      where: { shortCode },
      select: { id: true },
    });

    if (!existing) break;

    shortCode = generateShortCode();
    attempts++;
  }

  if (attempts >= 5) {
    throw new ConflictError('Failed to generate a unique short code. Please try again.');
  }

  const deepLink = await prisma.deepLink.create({
    data: {
      shortCode,
      targetType: input.targetType,
      targetId: input.targetId ?? null,
      targetPath: input.targetPath ?? null,
      campaign: input.campaign ?? null,
      expiresAt: input.expiresAt ?? null,
      metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
      createdBy,
    },
  });

  await logAudit({
    action: 'create',
    entity: 'DeepLink',
    entityId: deepLink.id,
    userId: createdBy,
    changes: { shortCode, targetType: input.targetType, campaign: input.campaign },
  });

  return deepLink;
}

// ── Resolve Deep Link ────────────────────────────────────

export async function resolveDeepLink(
  shortCode: string
): Promise<{ targetType: string; targetId: string | null; targetPath: string | null }> {
  const deepLink = await prisma.deepLink.findUnique({
    where: { shortCode },
  });

  if (!deepLink) {
    throw new NotFoundError('DeepLink', shortCode);
  }

  // Check expiration
  if (deepLink.expiresAt && deepLink.expiresAt < new Date()) {
    throw new ValidationError('This deep link has expired');
  }

  // Increment clicks (fire-and-forget, don't block response)
  prisma.deepLink.update({
    where: { id: deepLink.id },
    data: { clicks: { increment: 1 } },
  }).catch(() => {
    // Non-critical: don't fail the resolve if click tracking fails
    console.error(`[DeepLink] Failed to increment clicks for ${shortCode}`);
  });

  return {
    targetType: deepLink.targetType,
    targetId: deepLink.targetId,
    targetPath: deepLink.targetPath,
  };
}

// ── Get Deep Link Detail ─────────────────────────────────

export async function getDeepLink(id: string): Promise<DeepLink> {
  const deepLink = await prisma.deepLink.findUnique({
    where: { id },
  });

  if (!deepLink) {
    throw new NotFoundError('DeepLink', id);
  }

  return deepLink;
}

// ── Update Deep Link ─────────────────────────────────────

export async function updateDeepLink(
  id: string,
  input: UpdateDeepLinkInput,
  userId: string
): Promise<DeepLink> {
  const existing = await prisma.deepLink.findUnique({ where: { id } });

  if (!existing) {
    throw new NotFoundError('DeepLink', id);
  }

  const updateData: Prisma.DeepLinkUpdateInput = {};
  if (input.targetType !== undefined) updateData.targetType = input.targetType;
  if (input.targetId !== undefined) updateData.targetId = input.targetId;
  if (input.targetPath !== undefined) updateData.targetPath = input.targetPath;
  if (input.campaign !== undefined) updateData.campaign = input.campaign;
  if (input.expiresAt !== undefined) updateData.expiresAt = input.expiresAt;
  if (input.metadata !== undefined) updateData.metadata = input.metadata as Prisma.InputJsonValue;

  const deepLink = await prisma.deepLink.update({
    where: { id },
    data: updateData,
  });

  await logAudit({
    action: 'update',
    entity: 'DeepLink',
    entityId: id,
    userId,
    changes: input as Record<string, unknown>,
  });

  return deepLink;
}

// ── Delete Deep Link ─────────────────────────────────────

export async function deleteDeepLink(id: string, userId: string): Promise<void> {
  const existing = await prisma.deepLink.findUnique({
    where: { id },
    select: { id: true, shortCode: true },
  });

  if (!existing) {
    throw new NotFoundError('DeepLink', id);
  }

  await prisma.deepLink.delete({ where: { id } });

  await logAudit({
    action: 'delete',
    entity: 'DeepLink',
    entityId: id,
    userId,
    changes: { shortCode: existing.shortCode },
  });
}
