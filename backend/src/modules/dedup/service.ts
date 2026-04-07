import { createHash } from 'crypto';
import { prisma } from '../../lib/prisma.js';
import { NotFoundError, ValidationError } from '../../lib/errors.js';
import type { Prisma } from '@prisma/client';

// ── Types ─────────────────────────────────────────────────

interface ContentForComparison {
  id: string;
  title: string;
  body: Prisma.JsonValue;
  tags: string[];
}

export interface ComparisonResult {
  contentIdA: string;
  contentIdB: string;
  titleSimilarity: number;
  tagOverlap: number;
  contentHashMatch: number;
  combinedScore: number;
}

export interface ClusterResult {
  clusterId: number;
  items: Array<{
    id: string;
    title: string;
    slug: string;
    type: string;
  }>;
  avgSimilarity: number;
}

export interface DedupStats {
  totalPairs: number;
  avgScore: number;
  maxScore: number;
  minScore: number;
  scoreDistribution: {
    high: number;   // > 0.8
    medium: number;  // 0.5 - 0.8
    low: number;    // < 0.5
  };
}

// ── Levenshtein Distance ──────────────────────────────────

function levenshteinDistance(a: string, b: string): number {
  const la = a.length;
  const lb = b.length;

  if (la === 0) return lb;
  if (lb === 0) return la;

  // Use two-row optimization for memory efficiency
  let prev = new Array<number>(lb + 1);
  let curr = new Array<number>(lb + 1);

  for (let j = 0; j <= lb; j++) {
    prev[j] = j;
  }

  for (let i = 1; i <= la; i++) {
    curr[0] = i;
    for (let j = 1; j <= lb; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        prev[j] + 1,       // deletion
        curr[j - 1] + 1,   // insertion
        prev[j - 1] + cost  // substitution
      );
    }
    [prev, curr] = [curr, prev];
  }

  return prev[lb];
}

// ── Similarity Methods ────────────────────────────────────

function titleSimilarity(a: string, b: string): number {
  const normA = a.toLowerCase().trim();
  const normB = b.toLowerCase().trim();

  if (normA === normB) return 1;
  if (normA.length === 0 && normB.length === 0) return 1;
  if (normA.length === 0 || normB.length === 0) return 0;

  const maxLen = Math.max(normA.length, normB.length);
  const distance = levenshteinDistance(normA, normB);

  return 1 - distance / maxLen;
}

function tagOverlap(tagsA: string[], tagsB: string[]): number {
  if (tagsA.length === 0 && tagsB.length === 0) return 0;

  const setA = new Set(tagsA);
  const setB = new Set(tagsB);

  const intersection = new Set([...setA].filter((t) => setB.has(t)));
  const union = new Set([...setA, ...setB]);

  if (union.size === 0) return 0;

  // Jaccard similarity
  return intersection.size / union.size;
}

function contentHash(bodyA: Prisma.JsonValue, bodyB: Prisma.JsonValue): number {
  const hashA = createHash('sha256')
    .update(JSON.stringify(bodyA))
    .digest('hex');
  const hashB = createHash('sha256')
    .update(JSON.stringify(bodyB))
    .digest('hex');

  return hashA === hashB ? 1 : 0;
}

function combinedScore(title: number, tags: number, hash: number): number {
  return Math.round((0.4 * title + 0.3 * tags + 0.3 * hash) * 10000) / 10000;
}

// ── Fetch Content for Comparison ──────────────────────────

async function fetchContentForComparison(contentId?: string): Promise<ContentForComparison[]> {
  const where: Prisma.ContentWhereInput = contentId ? { id: contentId } : {};

  const items = await prisma.content.findMany({
    where,
    select: {
      id: true,
      title: true,
      body: true,
      tags: {
        select: { tag: { select: { name: true } } },
      },
    },
  });

  return items.map((item) => ({
    id: item.id,
    title: item.title,
    body: item.body,
    tags: item.tags.map((t) => t.tag.name),
  }));
}

// ── Scan for Similarity ───────────────────────────────────

export async function scanForSimilarity(
  contentId?: string,
  threshold: number = 0.5
): Promise<{ pairsFound: number; pairsStored: number }> {
  let targetItems: ContentForComparison[];
  let compareItems: ContentForComparison[];

  if (contentId) {
    // Compare specific item against all others
    targetItems = await fetchContentForComparison(contentId);
    if (targetItems.length === 0) {
      throw new NotFoundError('Content', contentId);
    }
    compareItems = await fetchContentForComparison();
    compareItems = compareItems.filter((c) => c.id !== contentId);
  } else {
    // Full pairwise scan
    targetItems = await fetchContentForComparison();
    compareItems = targetItems;
  }

  let pairsFound = 0;
  let pairsStored = 0;

  const upserts: Array<{
    contentAId: string;
    contentBId: string;
    score: number;
    method: string;
  }> = [];

  for (const target of targetItems) {
    for (const compare of compareItems) {
      // Avoid self-comparison and duplicate pairs
      if (target.id >= compare.id) continue;

      const ts = titleSimilarity(target.title, compare.title);
      const to = tagOverlap(target.tags, compare.tags);
      const ch = contentHash(target.body, compare.body);
      const score = combinedScore(ts, to, ch);

      if (score >= threshold) {
        pairsFound++;

        // Determine primary method
        let method = 'combined';
        if (ch === 1) method = 'content-hash';
        else if (ts >= 0.8) method = 'title-similarity';
        else if (to >= 0.6) method = 'tag-overlap';

        upserts.push({
          contentAId: target.id,
          contentBId: compare.id,
          score,
          method,
        });
      }
    }
  }

  // Batch upsert results
  for (const pair of upserts) {
    await prisma.similarContent.upsert({
      where: {
        contentAId_contentBId: {
          contentAId: pair.contentAId,
          contentBId: pair.contentBId,
        },
      },
      update: {
        score: pair.score,
        method: pair.method,
      },
      create: pair,
    });
    pairsStored++;
  }

  return { pairsFound, pairsStored };
}

// ── Compare Two ───────────────────────────────────────────

export async function compareTwo(
  contentIdA: string,
  contentIdB: string
): Promise<ComparisonResult> {
  const [itemsA, itemsB] = await Promise.all([
    fetchContentForComparison(contentIdA),
    fetchContentForComparison(contentIdB),
  ]);

  if (itemsA.length === 0) throw new NotFoundError('Content', contentIdA);
  if (itemsB.length === 0) throw new NotFoundError('Content', contentIdB);

  const a = itemsA[0];
  const b = itemsB[0];

  const ts = titleSimilarity(a.title, b.title);
  const to = tagOverlap(a.tags, b.tags);
  const ch = contentHash(a.body, b.body);
  const score = combinedScore(ts, to, ch);

  return {
    contentIdA,
    contentIdB,
    titleSimilarity: Math.round(ts * 10000) / 10000,
    tagOverlap: Math.round(to * 10000) / 10000,
    contentHashMatch: ch,
    combinedScore: score,
  };
}

// ── Get Similar Content ───────────────────────────────────

export async function getSimilar(
  contentId: string,
  threshold: number,
  page: number,
  limit: number
) {
  // Verify content exists
  const content = await prisma.content.findUnique({ where: { id: contentId } });
  if (!content) {
    throw new NotFoundError('Content', contentId);
  }

  const where: Prisma.SimilarContentWhereInput = {
    OR: [
      { contentAId: contentId },
      { contentBId: contentId },
    ],
    score: { gte: threshold },
  };

  const [data, total] = await Promise.all([
    prisma.similarContent.findMany({
      where,
      include: {
        contentA: { select: { id: true, title: true, slug: true, type: true, status: true } },
        contentB: { select: { id: true, title: true, slug: true, type: true, status: true } },
      },
      orderBy: { score: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.similarContent.count({ where }),
  ]);

  // Normalize: return the "other" content item relative to the queried contentId
  const normalized = data.map((pair) => {
    const otherContent =
      pair.contentAId === contentId ? pair.contentB : pair.contentA;
    return {
      id: pair.id,
      similarContent: otherContent,
      score: pair.score,
      method: pair.method,
    };
  });

  return {
    data: normalized,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ── Get Clusters (Union-Find) ─────────────────────────────

export async function getClusters(threshold: number): Promise<ClusterResult[]> {
  const pairs = await prisma.similarContent.findMany({
    where: { score: { gte: threshold } },
    include: {
      contentA: { select: { id: true, title: true, slug: true, type: true } },
      contentB: { select: { id: true, title: true, slug: true, type: true } },
    },
  });

  if (pairs.length === 0) return [];

  // Union-Find implementation
  const parent = new Map<string, string>();
  const rank = new Map<string, number>();

  function find(x: string): string {
    if (!parent.has(x)) {
      parent.set(x, x);
      rank.set(x, 0);
    }
    if (parent.get(x) !== x) {
      parent.set(x, find(parent.get(x)!));
    }
    return parent.get(x)!;
  }

  function union(a: string, b: string): void {
    const rootA = find(a);
    const rootB = find(b);
    if (rootA === rootB) return;

    const rankA = rank.get(rootA) || 0;
    const rankB = rank.get(rootB) || 0;

    if (rankA < rankB) {
      parent.set(rootA, rootB);
    } else if (rankA > rankB) {
      parent.set(rootB, rootA);
    } else {
      parent.set(rootB, rootA);
      rank.set(rootA, rankA + 1);
    }
  }

  // Build content info map
  const contentInfo = new Map<string, { id: string; title: string; slug: string; type: string }>();

  for (const pair of pairs) {
    contentInfo.set(pair.contentA.id, pair.contentA);
    contentInfo.set(pair.contentB.id, pair.contentB);
    union(pair.contentAId, pair.contentBId);
  }

  // Group by cluster root
  const clusters = new Map<string, string[]>();
  for (const id of contentInfo.keys()) {
    const root = find(id);
    if (!clusters.has(root)) {
      clusters.set(root, []);
    }
    clusters.get(root)!.push(id);
  }

  // Calculate avg similarity within each cluster
  const result: ClusterResult[] = [];
  let clusterId = 0;

  for (const [, members] of clusters) {
    if (members.length < 2) continue;

    const memberSet = new Set(members);
    const clusterPairs = pairs.filter(
      (p) => memberSet.has(p.contentAId) && memberSet.has(p.contentBId)
    );
    const avgSim =
      clusterPairs.length > 0
        ? clusterPairs.reduce((sum, p) => sum + p.score, 0) / clusterPairs.length
        : 0;

    result.push({
      clusterId: clusterId++,
      items: members.map((id) => contentInfo.get(id)!),
      avgSimilarity: Math.round(avgSim * 10000) / 10000,
    });
  }

  // Sort by cluster size descending
  result.sort((a, b) => b.items.length - a.items.length);

  return result;
}

// ── Resolve Pair ──────────────────────────────────────────

export async function resolvePair(
  contentIdA: string,
  contentIdB: string,
  action: 'dismiss' | 'merge',
  keepId?: string
) {
  // Normalize order for lookup
  const [normA, normB] =
    contentIdA < contentIdB
      ? [contentIdA, contentIdB]
      : [contentIdB, contentIdA];

  const existing = await prisma.similarContent.findUnique({
    where: {
      contentAId_contentBId: {
        contentAId: normA,
        contentBId: normB,
      },
    },
  });

  if (!existing) {
    throw new NotFoundError('SimilarContent pair', `${normA} <-> ${normB}`);
  }

  if (action === 'dismiss') {
    // Delete the similarity record
    await prisma.similarContent.delete({
      where: { id: existing.id },
    });

    return { action: 'dismissed', contentIdA: normA, contentIdB: normB };
  }

  // Merge: archive the non-kept item, delete similarity record
  if (!keepId) {
    throw new ValidationError('keepId is required for merge action');
  }

  const archiveId = keepId === normA ? normB : normA;

  await prisma.$transaction(async (tx) => {
    // Archive the content being merged away
    await tx.content.update({
      where: { id: archiveId },
      data: { status: 'archived' },
    });

    // Remove all similarity records involving the archived item
    await tx.similarContent.deleteMany({
      where: {
        OR: [
          { contentAId: archiveId },
          { contentBId: archiveId },
        ],
      },
    });
  });

  return {
    action: 'merged',
    keptId: keepId,
    archivedId: archiveId,
  };
}

// ── Get Stats ─────────────────────────────────────────────

export async function getStats(): Promise<DedupStats> {
  const aggregate = await prisma.similarContent.aggregate({
    _count: { id: true },
    _avg: { score: true },
    _max: { score: true },
    _min: { score: true },
  });

  const totalPairs = aggregate._count.id;

  if (totalPairs === 0) {
    return {
      totalPairs: 0,
      avgScore: 0,
      maxScore: 0,
      minScore: 0,
      scoreDistribution: { high: 0, medium: 0, low: 0 },
    };
  }

  // Score distribution
  const [highCount, mediumCount, lowCount] = await Promise.all([
    prisma.similarContent.count({ where: { score: { gt: 0.8 } } }),
    prisma.similarContent.count({ where: { score: { gte: 0.5, lte: 0.8 } } }),
    prisma.similarContent.count({ where: { score: { lt: 0.5 } } }),
  ]);

  return {
    totalPairs,
    avgScore: Math.round((aggregate._avg.score ?? 0) * 10000) / 10000,
    maxScore: aggregate._max.score ?? 0,
    minScore: aggregate._min.score ?? 0,
    scoreDistribution: {
      high: highCount,
      medium: mediumCount,
      low: lowCount,
    },
  };
}
