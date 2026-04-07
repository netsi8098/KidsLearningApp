import { Prisma, type AgeGroup } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { NotFoundError, ConflictError } from '../../lib/errors.js';
import { logAudit } from '../../lib/audit.js';
import { paginate } from '../../types/index.js';
import type { PaginationParams } from '../../types/index.js';
import type { CreateTipInput, UpdateTipInput } from './schemas.js';

// ── List Tips ─────────────────────────────────────────────

export async function listTips(
  params: PaginationParams & {
    category?: string;
    ageGroup?: string;
    format?: string;
    published?: boolean;
  }
) {
  const where: Prisma.ParentTipWhereInput = {
    deletedAt: null,
  };

  if (params.category) where.category = params.category;
  if (params.ageGroup) where.ageGroup = params.ageGroup as AgeGroup;
  if (params.format) where.format = params.format;

  if (params.published !== undefined) {
    where.published = params.published;
  } else {
    // Public listing defaults to published tips only
    where.published = true;
  }

  const skip = (params.page - 1) * params.limit;
  const orderBy: Prisma.ParentTipOrderByWithRelationInput = {
    [params.sortBy || 'createdAt']: params.sortOrder || 'desc',
  };

  const [tips, total] = await prisma.$transaction([
    prisma.parentTip.findMany({
      where,
      skip,
      take: params.limit,
      orderBy,
    }),
    prisma.parentTip.count({ where }),
  ]);

  return paginate(tips, total, params);
}

// ── Get Tip by Slug ───────────────────────────────────────

export async function getTipBySlug(slug: string) {
  const tip = await prisma.parentTip.findUnique({
    where: { slug },
  });

  if (!tip || tip.deletedAt) {
    throw new NotFoundError('ParentTip');
  }

  return tip;
}

// ── Create Tip ────────────────────────────────────────────

export async function createTip(input: CreateTipInput, authorId: string) {
  // Check slug uniqueness
  const existingSlug = await prisma.parentTip.findUnique({
    where: { slug: input.slug },
  });
  if (existingSlug) {
    throw new ConflictError(`Parent tip with slug '${input.slug}' already exists`);
  }

  const tip = await prisma.parentTip.create({
    data: {
      title: input.title,
      slug: input.slug,
      body: input.body,
      category: input.category,
      format: input.format,
      ageGroup: input.ageGroup ?? 'all',
      tags: input.tags ?? [],
      published: input.published ?? false,
      publishedAt: input.published ? new Date() : null,
      authorId,
    },
  });

  await logAudit({
    action: 'create',
    entity: 'ParentTip',
    entityId: tip.id,
    userId: authorId,
  });

  return tip;
}

// ── Update Tip ────────────────────────────────────────────

export async function updateTip(id: string, input: UpdateTipInput, userId?: string) {
  const existing = await prisma.parentTip.findUnique({ where: { id } });
  if (!existing || existing.deletedAt) {
    throw new NotFoundError('ParentTip', id);
  }

  // Check slug uniqueness if slug is changing
  if (input.slug && input.slug !== existing.slug) {
    const slugExists = await prisma.parentTip.findUnique({
      where: { slug: input.slug },
    });
    if (slugExists) {
      throw new ConflictError(`Parent tip with slug '${input.slug}' already exists`);
    }
  }

  const updateData: Prisma.ParentTipUpdateInput = {};

  if (input.title !== undefined) updateData.title = input.title;
  if (input.slug !== undefined) updateData.slug = input.slug;
  if (input.body !== undefined) updateData.body = input.body;
  if (input.category !== undefined) updateData.category = input.category;
  if (input.format !== undefined) updateData.format = input.format;
  if (input.ageGroup !== undefined) updateData.ageGroup = input.ageGroup;
  if (input.tags !== undefined) updateData.tags = input.tags;

  if (input.published !== undefined) {
    updateData.published = input.published;
    // Set publishedAt when first published
    if (input.published && !existing.publishedAt) {
      updateData.publishedAt = new Date();
    }
  }

  const tip = await prisma.parentTip.update({
    where: { id },
    data: updateData,
  });

  await logAudit({
    action: 'update',
    entity: 'ParentTip',
    entityId: id,
    changes: input as unknown as Record<string, unknown>,
    userId,
  });

  return tip;
}

// ── Soft-Delete Tip ───────────────────────────────────────

export async function deleteTip(id: string, userId?: string) {
  const existing = await prisma.parentTip.findUnique({ where: { id } });
  if (!existing || existing.deletedAt) {
    throw new NotFoundError('ParentTip', id);
  }

  const tip = await prisma.parentTip.update({
    where: { id },
    data: { deletedAt: new Date() },
    select: { id: true, slug: true, deletedAt: true },
  });

  await logAudit({
    action: 'delete',
    entity: 'ParentTip',
    entityId: id,
    userId,
  });

  return tip;
}

// ── Save/Unsave Tip (stub for future use) ─────────────────

export async function saveTip(id: string) {
  const existing = await prisma.parentTip.findUnique({ where: { id } });
  if (!existing || existing.deletedAt) {
    throw new NotFoundError('ParentTip', id);
  }

  return { id, saved: true };
}
