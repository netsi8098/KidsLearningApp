import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { NotFoundError, ConflictError } from '../../lib/errors.js';
import { logAudit } from '../../lib/audit.js';
import type { PaginatedResult } from '../../types/index.js';
import type {
  ListArticlesQuery,
  CreateArticleInput,
  UpdateArticleInput,
  ListTicketsQuery,
  CreateTicketInput,
  UpdateTicketInput,
} from './schemas.js';

// ══════════════════════════════════════════════════════════
//  HELP ARTICLES
// ══════════════════════════════════════════════════════════

// ── List Articles ─────────────────────────────────────────

export async function listArticles(
  query: ListArticlesQuery
): Promise<PaginatedResult<Record<string, unknown>>> {
  const { page, limit, sortBy, sortOrder, category, published, search } = query;

  const where: Prisma.HelpArticleWhereInput = {
    deletedAt: null,
  };

  if (category) where.category = category;
  if (published !== undefined) where.published = published;

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { body: { contains: search, mode: 'insensitive' } },
      { slug: { contains: search, mode: 'insensitive' } },
      { searchKeywords: { array_contains: search } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.helpArticle.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.helpArticle.count({ where }),
  ]);

  return {
    data: data as unknown as Record<string, unknown>[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ── Get Article by Slug ───────────────────────────────────

export async function getArticleBySlug(slug: string) {
  const article = await prisma.helpArticle.findUnique({
    where: { slug },
  });

  if (!article || article.deletedAt) {
    throw new NotFoundError('HelpArticle', slug);
  }

  return article;
}

// ── Create Article ────────────────────────────────────────

export async function createArticle(input: CreateArticleInput, userId: string) {
  const existingSlug = await prisma.helpArticle.findUnique({
    where: { slug: input.slug },
  });
  if (existingSlug) {
    throw new ConflictError(`Help article with slug '${input.slug}' already exists`);
  }

  const article = await prisma.helpArticle.create({
    data: {
      title: input.title,
      slug: input.slug,
      body: input.body,
      category: input.category,
      searchKeywords: input.searchKeywords ?? [],
      relatedFeature: input.relatedFeature ?? null,
      orderIndex: input.orderIndex ?? 0,
      published: input.published ?? false,
    },
  });

  await logAudit({
    action: 'create',
    entity: 'HelpArticle',
    entityId: article.id,
    userId,
  });

  return article;
}

// ── Update Article ────────────────────────────────────────

export async function updateArticle(id: string, input: UpdateArticleInput, userId: string) {
  const existing = await prisma.helpArticle.findUnique({ where: { id } });
  if (!existing || existing.deletedAt) {
    throw new NotFoundError('HelpArticle', id);
  }

  // Check slug uniqueness if slug is changing
  if (input.slug && input.slug !== existing.slug) {
    const slugExists = await prisma.helpArticle.findUnique({
      where: { slug: input.slug },
    });
    if (slugExists) {
      throw new ConflictError(`Help article with slug '${input.slug}' already exists`);
    }
  }

  const updateData: Prisma.HelpArticleUpdateInput = {};

  if (input.title !== undefined) updateData.title = input.title;
  if (input.slug !== undefined) updateData.slug = input.slug;
  if (input.body !== undefined) updateData.body = input.body;
  if (input.category !== undefined) updateData.category = input.category;
  if (input.searchKeywords !== undefined) updateData.searchKeywords = input.searchKeywords;
  if (input.relatedFeature !== undefined) updateData.relatedFeature = input.relatedFeature;
  if (input.orderIndex !== undefined) updateData.orderIndex = input.orderIndex;
  if (input.published !== undefined) updateData.published = input.published;

  const article = await prisma.helpArticle.update({
    where: { id },
    data: updateData,
  });

  await logAudit({
    action: 'update',
    entity: 'HelpArticle',
    entityId: id,
    changes: input as Record<string, unknown>,
    userId,
  });

  return article;
}

// ── Soft-Delete Article ───────────────────────────────────

export async function deleteArticle(id: string, userId: string) {
  const existing = await prisma.helpArticle.findUnique({ where: { id } });
  if (!existing || existing.deletedAt) {
    throw new NotFoundError('HelpArticle', id);
  }

  const article = await prisma.helpArticle.update({
    where: { id },
    data: { deletedAt: new Date() },
    select: { id: true, slug: true, deletedAt: true },
  });

  await logAudit({
    action: 'delete',
    entity: 'HelpArticle',
    entityId: id,
    userId,
  });

  return article;
}

// ── Article Feedback ──────────────────────────────────────

export async function submitArticleFeedback(id: string, helpful: boolean) {
  const existing = await prisma.helpArticle.findUnique({ where: { id } });
  if (!existing || existing.deletedAt) {
    throw new NotFoundError('HelpArticle', id);
  }

  const article = await prisma.helpArticle.update({
    where: { id },
    data: helpful
      ? { helpfulYes: { increment: 1 } }
      : { helpfulNo: { increment: 1 } },
    select: { id: true, helpfulYes: true, helpfulNo: true },
  });

  return article;
}

// ══════════════════════════════════════════════════════════
//  SUPPORT TICKETS
// ══════════════════════════════════════════════════════════

// ── List Tickets ──────────────────────────────────────────

export async function listTickets(
  query: ListTicketsQuery
): Promise<PaginatedResult<Record<string, unknown>>> {
  const { page, limit, sortBy, sortOrder, status, priority } = query;

  const where: Prisma.SupportTicketWhereInput = {};

  if (status) where.status = status;
  if (priority) where.priority = priority;

  const [data, total] = await Promise.all([
    prisma.supportTicket.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.supportTicket.count({ where }),
  ]);

  return {
    data: data as unknown as Record<string, unknown>[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ── Get Ticket ────────────────────────────────────────────

export async function getTicket(id: string) {
  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
  });

  if (!ticket) {
    throw new NotFoundError('SupportTicket', id);
  }

  return ticket;
}

// ── Create Ticket ─────────────────────────────────────────

export async function createTicket(input: CreateTicketInput) {
  const ticket = await prisma.supportTicket.create({
    data: {
      parentEmail: input.parentEmail,
      subject: input.subject,
      body: input.body,
      category: input.category,
      householdId: input.householdId ?? null,
      status: 'open',
      priority: 'normal',
    },
  });

  await logAudit({
    action: 'create',
    entity: 'SupportTicket',
    entityId: ticket.id,
  });

  return ticket;
}

// ── Update Ticket ─────────────────────────────────────────

export async function updateTicket(id: string, input: UpdateTicketInput, userId: string) {
  const existing = await prisma.supportTicket.findUnique({ where: { id } });
  if (!existing) {
    throw new NotFoundError('SupportTicket', id);
  }

  const updateData: Prisma.SupportTicketUpdateInput = {};

  if (input.status !== undefined) {
    updateData.status = input.status;
    // Set resolvedAt when moving to resolved or closed
    if ((input.status === 'resolved' || input.status === 'closed') && !existing.resolvedAt) {
      updateData.resolvedAt = new Date();
    }
    // Clear resolvedAt if re-opening
    if (input.status === 'open' || input.status === 'in_progress' || input.status === 'waiting') {
      updateData.resolvedAt = null;
    }
  }

  if (input.priority !== undefined) updateData.priority = input.priority;
  if (input.assignee !== undefined) updateData.assignee = input.assignee;

  const ticket = await prisma.supportTicket.update({
    where: { id },
    data: updateData,
  });

  await logAudit({
    action: 'update',
    entity: 'SupportTicket',
    entityId: id,
    changes: input as Record<string, unknown>,
    userId,
  });

  return ticket;
}
