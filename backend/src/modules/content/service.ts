import { Prisma, ContentStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { NotFoundError, ConflictError, ValidationError } from '../../lib/errors.js';
import { logAudit } from '../../lib/audit.js';
import type { PaginatedResult } from '../../types/index.js';
import { evaluateContentPolicies } from '../../lib/policyEngine.js';
import type {
  ListContentQuery,
  CreateContentInput,
  UpdateContentInput,
  DuplicateContentInput,
  UpdateLifecycleInput,
} from './schemas.js';

// ── Types ─────────────────────────────────────────────────

const CONTENT_INCLUDE = {
  author: { select: { id: true, email: true, name: true, role: true } },
  tags: { include: { tag: true } },
  skills: { include: { skill: true } },
} as const;

const CONTENT_LIST_SELECT = {
  id: true,
  slug: true,
  type: true,
  title: true,
  emoji: true,
  description: true,
  status: true,
  accessTier: true,
  ageGroup: true,
  difficulty: true,
  energyLevel: true,
  durationMinutes: true,
  route: true,
  authorId: true,
  publishedAt: true,
  scheduledAt: true,
  createdAt: true,
  updatedAt: true,
  version: true,
  featured: true,
  mood: true,
  bedtimeFriendly: true,
  language: true,
  author: { select: { id: true, name: true } },
  tags: { include: { tag: true } },
  skills: { include: { skill: true } },
} as const;

// ── Status Transition Map ─────────────────────────────────
// Defines which status transitions are allowed.

const VALID_TRANSITIONS: Record<ContentStatus, ContentStatus[]> = {
  draft: ['review', 'archived'],
  review: ['draft', 'approved', 'archived'],
  approved: ['scheduled', 'published', 'draft', 'archived'],
  scheduled: ['approved', 'published', 'archived'],
  published: ['archived', 'draft'],
  archived: ['draft'],
};

function validateStatusTransition(current: ContentStatus, next: ContentStatus): void {
  const allowed = VALID_TRANSITIONS[current];
  if (!allowed || !allowed.includes(next)) {
    throw new ValidationError(
      `Invalid status transition: '${current}' -> '${next}'. Allowed transitions from '${current}': ${allowed?.join(', ') || 'none'}`
    );
  }
}

// ── List Content ──────────────────────────────────────────

export async function listContent(
  query: ListContentQuery
): Promise<PaginatedResult<Record<string, unknown>>> {
  const {
    page,
    limit,
    sortBy,
    sortOrder,
    type,
    status,
    ageGroup,
    accessTier,
    difficulty,
    energyLevel,
    search,
    authorId,
  } = query;

  const where: Prisma.ContentWhereInput = {};

  if (type) where.type = type;
  if (status) where.status = status;
  if (ageGroup) where.ageGroup = ageGroup;
  if (accessTier) where.accessTier = accessTier;
  if (difficulty) where.difficulty = difficulty;
  if (energyLevel) where.energyLevel = energyLevel;
  if (authorId) where.authorId = authorId;

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { slug: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.content.findMany({
      where,
      select: CONTENT_LIST_SELECT,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.content.count({ where }),
  ]);

  return {
    data: data as unknown as Record<string, unknown>[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ── Get Single Content ────────────────────────────────────

export async function getContent(id: string) {
  const content = await prisma.content.findUnique({
    where: { id },
    include: CONTENT_INCLUDE,
  });

  if (!content) {
    throw new NotFoundError('Content', id);
  }

  return content;
}

// ── Create Content ────────────────────────────────────────

export async function createContent(input: CreateContentInput, authorId: string) {
  // Check slug uniqueness
  const existingSlug = await prisma.content.findUnique({
    where: { slug: input.slug },
  });
  if (existingSlug) {
    throw new ConflictError(`Content with slug '${input.slug}' already exists`);
  }

  const { skills, ...rest } = input;

  const content = await prisma.content.create({
    data: {
      slug: rest.slug,
      type: rest.type,
      title: rest.title,
      emoji: rest.emoji ?? '',
      description: rest.description ?? '',
      body: (rest.body ?? {}) as Prisma.InputJsonValue,
      accessTier: rest.accessTier ?? 'free',
      ageGroup: rest.ageGroup ?? 'all',
      difficulty: rest.difficulty ?? null,
      energyLevel: rest.energyLevel ?? null,
      durationMinutes: rest.durationMinutes ?? null,
      route: rest.route ?? null,
      scheduledAt: rest.scheduledAt ? new Date(rest.scheduledAt) : null,
      mood: rest.mood ?? null,
      bedtimeFriendly: rest.bedtimeFriendly ?? false,
      language: rest.language ?? 'en',
      authorId,
      ...(skills?.length ? {
        skills: {
          createMany: {
            data: skills.map((s) => ({ skillId: s.skillId, relevance: s.relevance })),
            skipDuplicates: true,
          },
        },
      } : {}),
    },
    include: CONTENT_INCLUDE,
  });

  await logAudit({
    action: 'create',
    entity: 'Content',
    entityId: content.id,
    userId: authorId,
  });

  return content;
}

// ── Update Content ────────────────────────────────────────

export async function updateContent(id: string, input: UpdateContentInput) {
  // Fetch existing content
  const existing = await prisma.content.findUnique({ where: { id } });
  if (!existing) {
    throw new NotFoundError('Content', id);
  }

  // Validate status transition if status is changing
  if (input.status && input.status !== existing.status) {
    validateStatusTransition(existing.status, input.status as ContentStatus);
  }

  // Check slug uniqueness if slug is changing
  if (input.slug && input.slug !== existing.slug) {
    const slugExists = await prisma.content.findUnique({
      where: { slug: input.slug },
    });
    if (slugExists) {
      throw new ConflictError(`Content with slug '${input.slug}' already exists`);
    }
  }

  // Build update data, incrementing version on each update
  const updateData: Prisma.ContentUpdateInput = {
    version: { increment: 1 },
  };

  if (input.slug !== undefined) updateData.slug = input.slug;
  if (input.title !== undefined) updateData.title = input.title;
  if (input.emoji !== undefined) updateData.emoji = input.emoji;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.body !== undefined) updateData.body = input.body as Prisma.InputJsonValue;
  if (input.accessTier !== undefined) updateData.accessTier = input.accessTier;
  if (input.ageGroup !== undefined) updateData.ageGroup = input.ageGroup;
  if (input.difficulty !== undefined) updateData.difficulty = input.difficulty;
  if (input.energyLevel !== undefined) updateData.energyLevel = input.energyLevel;
  if (input.durationMinutes !== undefined) updateData.durationMinutes = input.durationMinutes;
  if (input.route !== undefined) updateData.route = input.route;
  if (input.mood !== undefined) updateData.mood = input.mood;
  if (input.bedtimeFriendly !== undefined) updateData.bedtimeFriendly = input.bedtimeFriendly;
  if (input.language !== undefined) updateData.language = input.language;

  if (input.scheduledAt !== undefined) {
    updateData.scheduledAt = input.scheduledAt ? new Date(input.scheduledAt) : null;
  }

  // Handle status-specific side effects
  if (input.status) {
    updateData.status = input.status;

    if (input.status === 'published' && !existing.publishedAt) {
      updateData.publishedAt = new Date();
    }

    // Snapshot content on publish
    if (input.status === 'published') {
      const snapshot = await prisma.content.findUnique({
        where: { id },
        include: { tags: { include: { tag: true } }, skills: { include: { skill: true } } },
      });
      updateData.publishedSnapshot = (snapshot ? JSON.parse(JSON.stringify(snapshot)) : {}) as Prisma.InputJsonValue;
    }

    if (input.status === 'archived') {
      updateData.archivedAt = new Date();
    }
  }

  // Handle skills update if provided
  if (input.skills) {
    await prisma.contentSkill.deleteMany({ where: { contentId: id } });
    if (input.skills.length > 0) {
      await prisma.contentSkill.createMany({
        data: input.skills.map((s) => ({ contentId: id, skillId: s.skillId, relevance: s.relevance })),
        skipDuplicates: true,
      });
    }
  }

  const content = await prisma.content.update({
    where: { id },
    data: updateData,
    include: CONTENT_INCLUDE,
  });

  await logAudit({
    action: 'update',
    entity: 'Content',
    entityId: id,
    changes: input as Record<string, unknown>,
  });

  return content;
}

// ── Delete (Archive) Content ──────────────────────────────

export async function archiveContent(id: string) {
  const existing = await prisma.content.findUnique({ where: { id } });
  if (!existing) {
    throw new NotFoundError('Content', id);
  }

  // Soft delete: move to archived status
  const content = await prisma.content.update({
    where: { id },
    data: {
      status: 'archived',
      version: { increment: 1 },
    },
    select: { id: true, slug: true, status: true },
  });

  return content;
}

// ── Add Tags ──────────────────────────────────────────────

export async function addTags(contentId: string, tagIds: string[]) {
  // Verify content exists
  const content = await prisma.content.findUnique({ where: { id: contentId } });
  if (!content) {
    throw new NotFoundError('Content', contentId);
  }

  // Verify all tags exist
  const tags = await prisma.tag.findMany({
    where: { id: { in: tagIds } },
  });
  if (tags.length !== tagIds.length) {
    const foundIds = new Set(tags.map((t) => t.id));
    const missingIds = tagIds.filter((id) => !foundIds.has(id));
    throw new NotFoundError('Tag', missingIds.join(', '));
  }

  // Use createMany with skipDuplicates to be idempotent
  await prisma.contentTag.createMany({
    data: tagIds.map((tagId) => ({ contentId, tagId })),
    skipDuplicates: true,
  });

  // Return updated content with tags
  return prisma.content.findUnique({
    where: { id: contentId },
    include: { tags: { include: { tag: true } } },
  });
}

// ── Remove Tag ────────────────────────────────────────────

export async function removeTag(contentId: string, tagId: string) {
  const content = await prisma.content.findUnique({ where: { id: contentId } });
  if (!content) {
    throw new NotFoundError('Content', contentId);
  }

  // Check if the content-tag relationship exists
  const contentTag = await prisma.contentTag.findUnique({
    where: { contentId_tagId: { contentId, tagId } },
  });
  if (!contentTag) {
    throw new NotFoundError('ContentTag', `${contentId}/${tagId}`);
  }

  await prisma.contentTag.delete({
    where: { contentId_tagId: { contentId, tagId } },
  });

  return { contentId, tagId, removed: true };
}

// ── Version History ───────────────────────────────────────
// Since we use an incrementing version counter (not a history table),
// we track version snapshots via QAResults and Reviews as proxy.
// This returns the content's current version info plus related audit trail.

export async function getContentHistory(
  contentId: string,
  page: number,
  limit: number
) {
  const content = await prisma.content.findUnique({
    where: { id: contentId },
    select: { id: true, slug: true, title: true, version: true, createdAt: true, updatedAt: true },
  });

  if (!content) {
    throw new NotFoundError('Content', contentId);
  }

  // Gather audit trail from reviews and releases
  const [reviews, releases, totalReviews, totalReleases] = await Promise.all([
    prisma.review.findMany({
      where: { contentId },
      select: {
        id: true,
        status: true,
        summary: true,
        createdAt: true,
        reviewer: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.release.findMany({
      where: { contentId },
      select: {
        id: true,
        action: true,
        status: true,
        notes: true,
        executedAt: true,
        createdAt: true,
        creator: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.review.count({ where: { contentId } }),
    prisma.release.count({ where: { contentId } }),
  ]);

  // Merge and sort by date
  const events = [
    ...reviews.map((r) => ({
      eventType: 'review' as const,
      id: r.id,
      status: r.status,
      summary: r.summary,
      actor: r.reviewer,
      createdAt: r.createdAt,
    })),
    ...releases.map((r) => ({
      eventType: 'release' as const,
      id: r.id,
      action: r.action,
      status: r.status,
      notes: r.notes,
      executedAt: r.executedAt,
      actor: r.creator,
      createdAt: r.createdAt,
    })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const total = totalReviews + totalReleases;

  return {
    content: {
      id: content.id,
      slug: content.slug,
      title: content.title,
      currentVersion: content.version,
      createdAt: content.createdAt,
      updatedAt: content.updatedAt,
    },
    events,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ── Duplicate Content ─────────────────────────────────────

export async function duplicateContent(
  id: string,
  input: DuplicateContentInput,
  authorId: string
) {
  const original = await prisma.content.findUnique({
    where: { id },
    include: { tags: true },
  });

  if (!original) {
    throw new NotFoundError('Content', id);
  }

  // Generate new slug
  const baseSlug = input.newSlug || `${original.slug}-copy`;
  let newSlug = baseSlug;
  let counter = 1;

  // Ensure slug uniqueness by appending counter if needed
  while (await prisma.content.findUnique({ where: { slug: newSlug } })) {
    newSlug = `${baseSlug}-${counter}`;
    counter++;
    if (counter > 100) {
      throw new ConflictError('Unable to generate unique slug after 100 attempts');
    }
  }

  const newTitle = input.newTitle || `${original.title} (Copy)`;

  // Create the duplicate
  const duplicate = await prisma.content.create({
    data: {
      slug: newSlug,
      type: original.type,
      title: newTitle,
      emoji: original.emoji,
      description: original.description,
      body: original.body ?? {},
      status: 'draft', // Always start as draft
      accessTier: original.accessTier,
      ageGroup: original.ageGroup,
      difficulty: original.difficulty,
      energyLevel: original.energyLevel,
      durationMinutes: original.durationMinutes,
      route: original.route,
      authorId,
      // Copy tags
      tags: {
        createMany: {
          data: original.tags.map((t) => ({ tagId: t.tagId })),
          skipDuplicates: true,
        },
      },
    },
    include: CONTENT_INCLUDE,
  });

  return duplicate;
}

// ── Skill Management ─────────────────────────────────────

export async function addSkills(contentId: string, skills: Array<{ skillId: string; relevance: number }>) {
  const content = await prisma.content.findUnique({ where: { id: contentId } });
  if (!content) throw new NotFoundError('Content', contentId);

  const skillRecords = await prisma.skill.findMany({
    where: { id: { in: skills.map((s) => s.skillId) } },
  });
  if (skillRecords.length !== skills.length) {
    const foundIds = new Set(skillRecords.map((s) => s.id));
    const missing = skills.filter((s) => !foundIds.has(s.skillId)).map((s) => s.skillId);
    throw new NotFoundError('Skill', missing.join(', '));
  }

  await prisma.contentSkill.createMany({
    data: skills.map((s) => ({ contentId, skillId: s.skillId, relevance: s.relevance })),
    skipDuplicates: true,
  });

  return prisma.content.findUnique({
    where: { id: contentId },
    include: { skills: { include: { skill: true } } },
  });
}

export async function removeSkill(contentId: string, skillId: string) {
  const content = await prisma.content.findUnique({ where: { id: contentId } });
  if (!content) throw new NotFoundError('Content', contentId);

  const contentSkill = await prisma.contentSkill.findUnique({
    where: { contentId_skillId: { contentId, skillId } },
  });
  if (!contentSkill) throw new NotFoundError('ContentSkill', `${contentId}/${skillId}`);

  await prisma.contentSkill.delete({
    where: { contentId_skillId: { contentId, skillId } },
  });

  return { contentId, skillId, removed: true };
}

export async function listContentSkills(contentId: string) {
  const content = await prisma.content.findUnique({ where: { id: contentId } });
  if (!content) throw new NotFoundError('Content', contentId);

  return prisma.contentSkill.findMany({
    where: { contentId },
    include: { skill: true },
  });
}

// ── Check for Duplicate Slugs ─────────────────────────────

// ── Lifecycle Management ─────────────────────────────────

export async function updateLifecycle(id: string, input: UpdateLifecycleInput) {
  const existing = await prisma.content.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('Content', id);

  const data: Prisma.ContentUpdateInput = {};
  if (input.freshnessScore !== undefined) data.freshnessScore = input.freshnessScore;
  if (input.evergreenScore !== undefined) data.evergreenScore = input.evergreenScore;
  if (input.seasonalRelevance !== undefined) data.seasonalRelevance = input.seasonalRelevance as Prisma.InputJsonValue;
  if (input.needsRefresh !== undefined) data.needsRefresh = input.needsRefresh;
  if (input.nextReviewDate !== undefined) {
    data.nextReviewDate = input.nextReviewDate ? new Date(input.nextReviewDate) : null;
  }

  return prisma.content.update({
    where: { id },
    data,
    select: {
      id: true, slug: true, title: true,
      freshnessScore: true, evergreenScore: true, seasonalRelevance: true,
      needsRefresh: true, lastRefreshDate: true, nextReviewDate: true,
    },
  });
}

export async function getRefreshQueue(page: number, limit: number) {
  const where: Prisma.ContentWhereInput = {
    OR: [
      { needsRefresh: true },
      { nextReviewDate: { lte: new Date() } },
      { freshnessScore: { lt: 0.3 } },
    ],
  };

  const [data, total] = await Promise.all([
    prisma.content.findMany({
      where,
      select: {
        id: true, slug: true, title: true, type: true, status: true,
        freshnessScore: true, evergreenScore: true, needsRefresh: true,
        lastRefreshDate: true, nextReviewDate: true, updatedAt: true,
      },
      orderBy: [{ needsRefresh: 'desc' }, { freshnessScore: 'asc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.content.count({ where }),
  ]);

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getLifecycleStats() {
  const [totalContent, needsRefresh, lowFreshness, evergreen, upcoming] = await Promise.all([
    prisma.content.count({ where: { status: 'published' } }),
    prisma.content.count({ where: { needsRefresh: true } }),
    prisma.content.count({ where: { freshnessScore: { lt: 0.3 }, status: 'published' } }),
    prisma.content.count({ where: { evergreenScore: { gt: 0.8 }, status: 'published' } }),
    prisma.content.count({
      where: {
        nextReviewDate: { lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
        status: 'published',
      },
    }),
  ]);

  return { totalContent, needsRefresh, lowFreshness, evergreen, upcomingReviews: upcoming };
}

export async function markRefreshed(id: string) {
  const existing = await prisma.content.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('Content', id);

  return prisma.content.update({
    where: { id },
    data: {
      needsRefresh: false,
      lastRefreshDate: new Date(),
      freshnessScore: 1.0,
    },
    select: { id: true, slug: true, needsRefresh: true, lastRefreshDate: true, freshnessScore: true },
  });
}

// ── Pipeline Events ─────────────────────────────────────

export async function getPipelineEvents(contentId: string) {
  const content = await prisma.content.findUnique({ where: { id: contentId } });
  if (!content) throw new NotFoundError('Content', contentId);

  return prisma.contentPipelineEvent.findMany({
    where: { contentId },
    orderBy: { timestamp: 'asc' },
  });
}

export async function recordPipelineEvent(contentId: string, stage: string, action: string, userId?: string) {
  const content = await prisma.content.findUnique({ where: { id: contentId } });
  if (!content) throw new NotFoundError('Content', contentId);

  return prisma.contentPipelineEvent.create({
    data: { contentId, stage, action, userId },
  });
}

// ── Policy Checks ───────────────────────────────────────

export async function checkPolicies(contentId: string) {
  const content = await prisma.content.findUnique({ where: { id: contentId } });
  if (!content) throw new NotFoundError('Content', contentId);

  return evaluateContentPolicies(contentId);
}

export async function getPolicyResults(contentId: string) {
  const content = await prisma.content.findUnique({ where: { id: contentId } });
  if (!content) throw new NotFoundError('Content', contentId);

  return prisma.policyResult.findMany({
    where: { contentId },
    include: { policy: { select: { name: true, category: true, severity: true } } },
    orderBy: { checkedAt: 'desc' },
  });
}

export async function checkSlugAvailability(slug: string): Promise<boolean> {
  const existing = await prisma.content.findUnique({
    where: { slug },
    select: { id: true },
  });
  return !existing;
}

// ── Bulk Status Update ────────────────────────────────────

export async function bulkUpdateStatus(
  ids: string[],
  newStatus: ContentStatus
) {
  // Fetch all contents to validate transitions
  const contents = await prisma.content.findMany({
    where: { id: { in: ids } },
    select: { id: true, status: true },
  });

  if (contents.length !== ids.length) {
    const foundIds = new Set(contents.map((c) => c.id));
    const missingIds = ids.filter((id) => !foundIds.has(id));
    throw new NotFoundError('Content', missingIds.join(', '));
  }

  // Validate all transitions
  for (const content of contents) {
    validateStatusTransition(content.status, newStatus);
  }

  // Perform bulk update
  const updateData: Prisma.ContentUpdateManyMutationInput = {
    status: newStatus,
    version: { increment: 1 },
  };

  if (newStatus === 'published') {
    updateData.publishedAt = new Date();
  }

  const result = await prisma.content.updateMany({
    where: { id: { in: ids } },
    data: updateData,
  });

  return { updated: result.count };
}
