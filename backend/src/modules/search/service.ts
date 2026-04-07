import { prisma } from '../../lib/prisma.js';
import { NotFoundError } from '../../lib/errors.js';
import { paginate, type PaginationParams, type PaginatedResult } from '../../types/index.js';
import type { Prisma, Content, ContentType, AgeGroup, Difficulty, EnergyLevel, ContentStatus } from '@prisma/client';

// ── Types ─────────────────────────────────────────────────

export interface SearchFilters {
  type?: ContentType;
  ageGroup?: AgeGroup;
  tags?: string[];
  difficulty?: Difficulty;
  energyLevel?: EnergyLevel;
  status?: ContentStatus;
}

export interface SearchResult {
  id: string;
  slug: string;
  type: ContentType;
  title: string;
  emoji: string;
  description: string;
  ageGroup: AgeGroup;
  difficulty: Difficulty | null;
  status: ContentStatus;
  publishedAt: Date | null;
  snippet: string;
  score: number;
  tags: { id: string; name: string; dimension: string }[];
}

export interface SuggestResult {
  id: string;
  title: string;
  type: ContentType;
  emoji: string;
}

export interface FacetCounts {
  type: Record<string, number>;
  ageGroup: Record<string, number>;
  difficulty: Record<string, number>;
  status: Record<string, number>;
}

// ── Helpers ───────────────────────────────────────────────

function buildWhereClause(query: string | undefined, filters: SearchFilters): Prisma.ContentWhereInput {
  const conditions: Prisma.ContentWhereInput[] = [];

  if (query) {
    conditions.push({
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    });
  }

  if (filters.type) {
    conditions.push({ type: filters.type });
  }
  if (filters.ageGroup) {
    conditions.push({ ageGroup: filters.ageGroup });
  }
  if (filters.difficulty) {
    conditions.push({ difficulty: filters.difficulty });
  }
  if (filters.energyLevel) {
    conditions.push({ energyLevel: filters.energyLevel });
  }
  if (filters.status) {
    conditions.push({ status: filters.status });
  }
  if (filters.tags && filters.tags.length > 0) {
    conditions.push({
      tags: {
        some: {
          tagId: { in: filters.tags },
        },
      },
    });
  }

  return conditions.length > 0 ? { AND: conditions } : {};
}

function generateSnippet(text: string, query: string, maxLength = 200): string {
  if (!text || !query) return text?.substring(0, maxLength) || '';

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const idx = lowerText.indexOf(lowerQuery);

  if (idx === -1) {
    return text.substring(0, maxLength) + (text.length > maxLength ? '...' : '');
  }

  const start = Math.max(0, idx - 60);
  const end = Math.min(text.length, idx + query.length + 60);
  let snippet = '';

  if (start > 0) snippet += '...';
  snippet += text.substring(start, end);
  if (end < text.length) snippet += '...';

  return snippet;
}

function calculateScore(content: { title: string; description: string }, query: string): number {
  const lowerQuery = query.toLowerCase();
  const lowerTitle = content.title.toLowerCase();
  const lowerDesc = content.description.toLowerCase();

  let score = 0;

  // Exact title match
  if (lowerTitle === lowerQuery) {
    score += 100;
  }
  // Title starts with query
  else if (lowerTitle.startsWith(lowerQuery)) {
    score += 75;
  }
  // Title contains query
  else if (lowerTitle.includes(lowerQuery)) {
    score += 50;
  }

  // Description contains query
  if (lowerDesc.includes(lowerQuery)) {
    score += 25;
  }

  return score;
}

// ── Content select for search results ─────────────────────

const SEARCH_RESULT_SELECT = {
  id: true,
  slug: true,
  type: true,
  title: true,
  emoji: true,
  description: true,
  ageGroup: true,
  difficulty: true,
  status: true,
  publishedAt: true,
  tags: {
    include: {
      tag: {
        select: { id: true, name: true, dimension: true },
      },
    },
  },
} as const;

// ── Search Service ────────────────────────────────────────

export async function search(
  query: string,
  filters: SearchFilters,
  pagination: PaginationParams & { sortBy?: string; sortOrder?: 'asc' | 'desc' }
): Promise<PaginatedResult<SearchResult>> {
  const where = buildWhereClause(query, filters);

  const [items, total] = await Promise.all([
    prisma.content.findMany({
      where,
      select: SEARCH_RESULT_SELECT,
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
      orderBy: pagination.sortBy === 'title'
        ? { title: pagination.sortOrder || 'asc' }
        : pagination.sortBy === 'publishedAt'
          ? { publishedAt: pagination.sortOrder || 'desc' }
          : pagination.sortBy === 'createdAt'
            ? { createdAt: pagination.sortOrder || 'desc' }
            : { createdAt: 'desc' },
    }),
    prisma.content.count({ where }),
  ]);

  // Score and map results
  let results: SearchResult[] = items.map((item) => ({
    id: item.id,
    slug: item.slug,
    type: item.type,
    title: item.title,
    emoji: item.emoji,
    description: item.description,
    ageGroup: item.ageGroup,
    difficulty: item.difficulty,
    status: item.status,
    publishedAt: item.publishedAt,
    snippet: generateSnippet(item.description, query),
    score: calculateScore(item, query),
    tags: item.tags.map((ct) => ct.tag),
  }));

  // Sort by relevance score if sortBy is relevance
  if (!pagination.sortBy || pagination.sortBy === 'relevance') {
    results.sort((a, b) => b.score - a.score);
  }

  return paginate(results, total, pagination);
}

export async function suggest(
  query: string,
  limit: number = 5
): Promise<SuggestResult[]> {
  const items = await prisma.content.findMany({
    where: {
      title: { contains: query, mode: 'insensitive' },
    },
    select: {
      id: true,
      title: true,
      type: true,
      emoji: true,
    },
    take: limit,
    orderBy: { title: 'asc' },
  });

  // Sort so exact prefix matches come first
  const lowerQuery = query.toLowerCase();
  items.sort((a, b) => {
    const aStartsWith = a.title.toLowerCase().startsWith(lowerQuery) ? 0 : 1;
    const bStartsWith = b.title.toLowerCase().startsWith(lowerQuery) ? 0 : 1;
    return aStartsWith - bStartsWith;
  });

  return items;
}

export async function getFacets(filters: Partial<SearchFilters> & { q?: string }): Promise<FacetCounts> {
  const baseWhere = buildWhereClause(filters.q, {
    type: filters.type,
    ageGroup: filters.ageGroup,
    difficulty: filters.difficulty,
    status: filters.status,
  });

  // Run all facet counts in parallel
  const [typeCounts, ageGroupCounts, difficultyCounts, statusCounts] = await Promise.all([
    prisma.content.groupBy({
      by: ['type'],
      where: baseWhere,
      _count: { id: true },
    }),
    prisma.content.groupBy({
      by: ['ageGroup'],
      where: baseWhere,
      _count: { id: true },
    }),
    prisma.content.groupBy({
      by: ['difficulty'],
      where: { ...baseWhere, difficulty: { not: null } },
      _count: { id: true },
    }),
    prisma.content.groupBy({
      by: ['status'],
      where: baseWhere,
      _count: { id: true },
    }),
  ]);

  const facets: FacetCounts = {
    type: {},
    ageGroup: {},
    difficulty: {},
    status: {},
  };

  for (const row of typeCounts) {
    facets.type[row.type] = row._count.id;
  }
  for (const row of ageGroupCounts) {
    facets.ageGroup[row.ageGroup] = row._count.id;
  }
  for (const row of difficultyCounts) {
    if (row.difficulty) {
      facets.difficulty[row.difficulty] = row._count.id;
    }
  }
  for (const row of statusCounts) {
    facets.status[row.status] = row._count.id;
  }

  return facets;
}

export async function getRelated(
  contentId: string,
  limit: number = 10
): Promise<SearchResult[]> {
  // Fetch the source content with its tags
  const source = await prisma.content.findUnique({
    where: { id: contentId },
    select: {
      id: true,
      type: true,
      ageGroup: true,
      tags: { select: { tagId: true } },
    },
  });

  if (!source) {
    throw new NotFoundError('Content', contentId);
  }

  const sourceTagIds = source.tags.map((t) => t.tagId);

  if (sourceTagIds.length === 0) {
    // Fallback: return content of the same type and age group
    const fallback = await prisma.content.findMany({
      where: {
        id: { not: contentId },
        type: source.type,
        ageGroup: source.ageGroup,
        status: 'published',
      },
      select: SEARCH_RESULT_SELECT,
      take: limit,
      orderBy: { publishedAt: 'desc' },
    });

    return fallback.map((item) => ({
      id: item.id,
      slug: item.slug,
      type: item.type,
      title: item.title,
      emoji: item.emoji,
      description: item.description,
      ageGroup: item.ageGroup,
      difficulty: item.difficulty,
      status: item.status,
      publishedAt: item.publishedAt,
      snippet: item.description.substring(0, 200),
      score: 0,
      tags: item.tags.map((ct) => ct.tag),
    }));
  }

  // Find content sharing the most tags, preferring same age group
  const candidates = await prisma.content.findMany({
    where: {
      id: { not: contentId },
      status: 'published',
      tags: {
        some: {
          tagId: { in: sourceTagIds },
        },
      },
    },
    select: {
      ...SEARCH_RESULT_SELECT,
      tags: {
        include: {
          tag: {
            select: { id: true, name: true, dimension: true },
          },
        },
      },
    },
  });

  // Score candidates by tag overlap and age group match
  const scored = candidates.map((item) => {
    const itemTagIds = new Set(item.tags.map((t) => t.tagId));
    let tagOverlap = 0;
    for (const tagId of sourceTagIds) {
      if (itemTagIds.has(tagId)) tagOverlap++;
    }
    const ageBonus = item.ageGroup === source.ageGroup ? 2 : 0;
    const typeBonus = item.type === source.type ? 1 : 0;
    const score = tagOverlap + ageBonus + typeBonus;

    return {
      id: item.id,
      slug: item.slug,
      type: item.type,
      title: item.title,
      emoji: item.emoji,
      description: item.description,
      ageGroup: item.ageGroup,
      difficulty: item.difficulty,
      status: item.status,
      publishedAt: item.publishedAt,
      snippet: item.description.substring(0, 200),
      score,
      tags: item.tags.map((ct) => ct.tag),
    };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}

export async function getTrending(
  days: number = 7,
  limit: number = 10
): Promise<SearchResult[]> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  // Format date range for daily period keys (YYYY-MM-DD)
  const periodKeys: string[] = [];
  for (let d = 0; d < days; d++) {
    const date = new Date();
    date.setDate(date.getDate() - d);
    periodKeys.push(date.toISOString().split('T')[0]);
  }

  // Get top content by aggregated views in period
  const analytics = await prisma.contentAnalytics.groupBy({
    by: ['contentId'],
    where: {
      period: 'daily',
      periodKey: { in: periodKeys },
    },
    _sum: { views: true },
    orderBy: { _sum: { views: 'desc' } },
    take: limit,
  });

  if (analytics.length === 0) {
    return [];
  }

  const contentIds = analytics.map((a) => a.contentId);
  const viewsMap = new Map(analytics.map((a) => [a.contentId, a._sum.views || 0]));

  const items = await prisma.content.findMany({
    where: { id: { in: contentIds } },
    select: SEARCH_RESULT_SELECT,
  });

  // Map and sort by views
  const results: SearchResult[] = items.map((item) => ({
    id: item.id,
    slug: item.slug,
    type: item.type,
    title: item.title,
    emoji: item.emoji,
    description: item.description,
    ageGroup: item.ageGroup,
    difficulty: item.difficulty,
    status: item.status,
    publishedAt: item.publishedAt,
    snippet: item.description.substring(0, 200),
    score: viewsMap.get(item.id) || 0,
    tags: item.tags.map((ct) => ct.tag),
  }));

  results.sort((a, b) => b.score - a.score);
  return results;
}

export async function getRecent(limit: number = 10): Promise<SearchResult[]> {
  const items = await prisma.content.findMany({
    where: {
      status: 'published',
      publishedAt: { not: null },
    },
    select: SEARCH_RESULT_SELECT,
    orderBy: { publishedAt: 'desc' },
    take: limit,
  });

  return items.map((item) => ({
    id: item.id,
    slug: item.slug,
    type: item.type,
    title: item.title,
    emoji: item.emoji,
    description: item.description,
    ageGroup: item.ageGroup,
    difficulty: item.difficulty,
    status: item.status,
    publishedAt: item.publishedAt,
    snippet: item.description.substring(0, 200),
    score: 0,
    tags: item.tags.map((ct) => ct.tag),
  }));
}
