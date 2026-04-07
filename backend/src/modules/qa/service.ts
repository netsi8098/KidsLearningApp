import { prisma } from '../../lib/prisma.js';
import { qaQueue } from '../../lib/queue.js';
import { NotFoundError } from '../../lib/errors.js';
import type { QACheckResult } from './schemas.js';

// ── Types ─────────────────────────────────────────────────

interface ContentForQA {
  id: string;
  title: string;
  description: string | null;
  emoji: string | null;
  type: string;
  ageGroup: string | null;
  duration: number | null;
  accessTier: string | null;
  difficulty: string | null;
  route: string | null;
  status: string;
  tags: ContentTag[];
  translations: ContentTranslation[];
  assets: ContentAsset[];
}

interface ContentTag {
  tag: { name: string };
}

interface ContentTranslation {
  locale: string;
  field: string;
}

interface ContentAsset {
  id: string;
  mimeType: string;
}

// ── Content Types That Require Duration ───────────────────

const TIMED_CONTENT_TYPES = new Set(['lesson', 'story', 'video', 'audio']);

// ── Content Types That Require Assets (Visual) ────────────

const VISUAL_CONTENT_TYPES = new Set([
  'coloring', 'illustration', 'video', 'animal', 'bodypart',
  'color', 'shape', 'alphabet', 'number',
]);

// ── Educational Content Types ─────────────────────────────

const EDUCATIONAL_CONTENT_TYPES = new Set([
  'lesson', 'quiz', 'alphabet', 'number', 'color', 'shape',
  'animal', 'bodypart', 'emotion', 'lifeskill',
]);

// ── Valid Age Groups ──────────────────────────────────────

const VALID_AGE_GROUPS = new Set(['2-3', '3-4', '4-5', '5-6', 'all']);

// ── Valid Route Format ────────────────────────────────────

const ROUTE_PATTERN = /^\/[a-z0-9][a-z0-9\-/]*$/;

// ── Individual Check Functions ────────────────────────────

function checkTitleLength(content: ContentForQA): QACheckResult {
  const titleLen = content.title.length;
  const passed = titleLen >= 3 && titleLen <= 80;

  return {
    checkName: 'title_length',
    category: 'content',
    passed,
    severity: 'error',
    message: passed
      ? `Title length (${titleLen}) is within valid range (3-80).`
      : `Title length (${titleLen}) is outside valid range (3-80).`,
    autoFix: false,
  };
}

function checkDescriptionExists(content: ContentForQA): QACheckResult {
  const passed = !!content.description && content.description.trim().length > 0;

  return {
    checkName: 'description_exists',
    category: 'content',
    passed,
    severity: 'error',
    message: passed
      ? 'Description is present.'
      : 'Description is missing or empty.',
    autoFix: false,
  };
}

function checkEmojiExists(content: ContentForQA): QACheckResult {
  const passed = !!content.emoji && content.emoji.trim().length > 0;

  return {
    checkName: 'emoji_exists',
    category: 'metadata',
    passed,
    severity: 'warning',
    message: passed
      ? 'Emoji is set.'
      : 'Emoji field is empty. Consider adding an emoji for visual appeal.',
    autoFix: false,
  };
}

function checkAgeGroup(content: ContentForQA): QACheckResult {
  const passed = !!content.ageGroup && VALID_AGE_GROUPS.has(content.ageGroup);

  return {
    checkName: 'age_group',
    category: 'metadata',
    passed,
    severity: 'error',
    message: passed
      ? `Age group "${content.ageGroup}" is valid.`
      : `Age group "${content.ageGroup ?? 'not set'}" is invalid. Must be one of: ${[...VALID_AGE_GROUPS].join(', ')}.`,
    autoFix: false,
  };
}

function checkDurationSet(content: ContentForQA): QACheckResult {
  const isTimed = TIMED_CONTENT_TYPES.has(content.type);

  if (!isTimed) {
    return {
      checkName: 'duration_set',
      category: 'metadata',
      passed: true,
      severity: 'info',
      message: `Content type "${content.type}" does not require a duration.`,
      autoFix: false,
    };
  }

  const passed = content.duration !== null && content.duration > 0;

  return {
    checkName: 'duration_set',
    category: 'metadata',
    passed,
    severity: 'error',
    message: passed
      ? `Duration is set to ${content.duration} seconds.`
      : `Duration is not set for timed content type "${content.type}".`,
    autoFix: false,
  };
}

function checkAccessTier(content: ContentForQA): QACheckResult {
  const validTiers = ['free', 'premium'];
  const passed = !!content.accessTier && validTiers.includes(content.accessTier);

  return {
    checkName: 'access_tier',
    category: 'metadata',
    passed,
    severity: 'warning',
    message: passed
      ? `Access tier is set to "${content.accessTier}".`
      : `Access tier "${content.accessTier ?? 'not set'}" is invalid. Must be "free" or "premium".`,
    autoFix: true,
  };
}

function checkDifficulty(content: ContentForQA): QACheckResult {
  const isEducational = EDUCATIONAL_CONTENT_TYPES.has(content.type);

  if (!isEducational) {
    return {
      checkName: 'difficulty',
      category: 'metadata',
      passed: true,
      severity: 'info',
      message: `Content type "${content.type}" does not require difficulty.`,
      autoFix: false,
    };
  }

  const validDifficulties = ['easy', 'medium', 'hard'];
  const passed = !!content.difficulty && validDifficulties.includes(content.difficulty);

  return {
    checkName: 'difficulty',
    category: 'metadata',
    passed,
    severity: 'warning',
    message: passed
      ? `Difficulty is set to "${content.difficulty}".`
      : `Difficulty is not set for educational content type "${content.type}".`,
    autoFix: false,
  };
}

function checkAssets(content: ContentForQA): QACheckResult {
  const isVisual = VISUAL_CONTENT_TYPES.has(content.type);

  if (!isVisual) {
    return {
      checkName: 'assets',
      category: 'assets',
      passed: true,
      severity: 'info',
      message: `Content type "${content.type}" does not require visual assets.`,
      autoFix: false,
    };
  }

  const passed = content.assets.length > 0;

  return {
    checkName: 'assets',
    category: 'assets',
    passed,
    severity: 'error',
    message: passed
      ? `Content has ${content.assets.length} asset(s).`
      : `No assets found for visual content type "${content.type}". At least one asset is required.`,
    autoFix: false,
  };
}

function checkTags(content: ContentForQA): QACheckResult {
  const tagCount = content.tags.length;
  const passed = tagCount >= 2;

  return {
    checkName: 'tags',
    category: 'seo',
    passed,
    severity: 'warning',
    message: passed
      ? `Content has ${tagCount} tag(s).`
      : `Content has ${tagCount} tag(s). At least 2 tags are recommended for discoverability.`,
    autoFix: false,
  };
}

function checkTranslations(content: ContentForQA): QACheckResult {
  const hasEnglish = content.translations.some((t) => t.locale === 'en');

  return {
    checkName: 'translations',
    category: 'content',
    passed: hasEnglish,
    severity: 'error',
    message: hasEnglish
      ? `English translation exists. Total translations: ${content.translations.length}.`
      : 'English (en) translation is missing. At least an English translation is required.',
    autoFix: false,
  };
}

function checkRoute(content: ContentForQA): QACheckResult {
  if (!content.route) {
    return {
      checkName: 'route',
      category: 'metadata',
      passed: false,
      severity: 'warning',
      message: 'Route field is not set.',
      autoFix: true,
    };
  }

  const passed = ROUTE_PATTERN.test(content.route);

  return {
    checkName: 'route',
    category: 'metadata',
    passed,
    severity: 'warning',
    message: passed
      ? `Route "${content.route}" is a valid path format.`
      : `Route "${content.route}" is not a valid path format. Must start with "/" and contain only lowercase letters, numbers, and hyphens.`,
    autoFix: true,
  };
}

// ── Similarity Check ──────────────────────────────────────

async function checkSimilarContent(content: ContentForQA): Promise<QACheckResult> {
  // Find other content with the same type and age group
  const similar = await prisma.content.findMany({
    where: {
      id: { not: content.id },
      type: content.type as any,
      ageGroup: content.ageGroup as any,
    },
    select: { id: true, title: true },
  });

  // Simple similarity score based on title overlap
  let mostSimilarTitle = '';
  let highestScore = 0;

  for (const other of similar) {
    const score = computeTitleSimilarity(content.title, other.title);
    if (score > highestScore) {
      highestScore = score;
      mostSimilarTitle = other.title;
    }
  }

  const passed = highestScore <= 0.9;

  return {
    checkName: 'similar_content',
    category: 'quality',
    passed,
    severity: 'warning',
    message: passed
      ? highestScore > 0.5
        ? `Most similar content: "${mostSimilarTitle}" (score: ${highestScore.toFixed(2)}). Below threshold.`
        : 'No highly similar content found.'
      : `Very similar to "${mostSimilarTitle}" (score: ${highestScore.toFixed(2)}). Consider differentiating or merging.`,
    autoFix: false,
  };
}

// ── Similarity Computation (Jaccard on character bigrams) ──

function computeTitleSimilarity(a: string, b: string): number {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const na = normalize(a);
  const nb = normalize(b);

  if (na === nb) return 1.0;
  if (na.length < 2 || nb.length < 2) return 0;

  const bigrams = (s: string): Set<string> => {
    const set = new Set<string>();
    for (let i = 0; i < s.length - 1; i++) {
      set.add(s.substring(i, i + 2));
    }
    return set;
  };

  const setA = bigrams(na);
  const setB = bigrams(nb);

  let intersection = 0;
  for (const bg of setA) {
    if (setB.has(bg)) intersection++;
  }

  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

// ── Run All Checks ────────────────────────────────────────

export async function runAllChecks(contentId: string) {
  const content = await prisma.content.findUnique({
    where: { id: contentId },
    include: {
      tags: {
        include: { tag: true },
      },
      translations: {
        select: { locale: true, field: true },
      },
      assets: {
        select: { id: true, mimeType: true },
      },
    },
  });

  if (!content) {
    throw new NotFoundError('Content', contentId);
  }

  const contentForQA = content as unknown as ContentForQA;

  // Run all synchronous checks
  const results: QACheckResult[] = [
    checkTitleLength(contentForQA),
    checkDescriptionExists(contentForQA),
    checkEmojiExists(contentForQA),
    checkAgeGroup(contentForQA),
    checkDurationSet(contentForQA),
    checkAccessTier(contentForQA),
    checkDifficulty(contentForQA),
    checkAssets(contentForQA),
    checkTags(contentForQA),
    checkTranslations(contentForQA),
    checkRoute(contentForQA),
  ];

  // Run async check
  const similarityResult = await checkSimilarContent(contentForQA);
  results.push(similarityResult);

  // Store results in the database — one row per check
  const now = new Date();

  // Delete previous results for this content
  await prisma.qAResult.deleteMany({ where: { contentId } });

  // Create individual check result rows
  await prisma.qAResult.createMany({
    data: results.map((r) => ({
      contentId,
      checkName: r.checkName,
      category: r.category,
      passed: r.passed,
      severity: r.severity,
      message: r.message,
      autoFix: r.autoFix,
      runAt: now,
    })),
  });

  const totalChecks = results.length;
  const passedChecks = results.filter((r) => r.passed).length;
  const failedChecks = totalChecks - passedChecks;
  const errorCount = results.filter((r) => !r.passed && r.severity === 'error').length;
  const warningCount = results.filter((r) => !r.passed && r.severity === 'warning').length;

  return {
    contentId,
    totalChecks,
    passedChecks,
    failedChecks,
    errorCount,
    warningCount,
    passRate: totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0,
    results,
    ranAt: now.toISOString(),
  };
}

// ── Get QA Results ────────────────────────────────────────

export async function getQAResults(
  contentId: string,
  filters?: { severity?: string; passed?: boolean }
) {
  const where: Record<string, unknown> = { contentId };
  if (filters?.severity) where.severity = filters.severity;
  if (filters?.passed !== undefined) where.passed = filters.passed;

  const qaRows = await prisma.qAResult.findMany({
    where,
    orderBy: { runAt: 'desc' },
  });

  if (qaRows.length === 0) {
    throw new NotFoundError('QAResult', contentId);
  }

  const results: QACheckResult[] = qaRows.map((r) => ({
    checkName: r.checkName,
    category: r.category as QACheckResult['category'],
    passed: r.passed,
    severity: r.severity as QACheckResult['severity'],
    message: r.message ?? '',
    autoFix: r.autoFix,
  }));

  const totalChecks = results.length;
  const passedChecks = results.filter((r) => r.passed).length;
  const failedChecks = totalChecks - passedChecks;
  const errorCount = results.filter((r) => !r.passed && r.severity === 'error').length;
  const warningCount = results.filter((r) => !r.passed && r.severity === 'warning').length;

  return {
    contentId,
    totalChecks,
    passedChecks,
    failedChecks,
    errorCount,
    warningCount,
    passRate: totalChecks > 0
      ? Math.round((passedChecks / totalChecks) * 100)
      : 0,
    results,
    ranAt: qaRows[0].runAt.toISOString(),
  };
}

// ── List Available Checks ─────────────────────────────────

export function listAvailableChecks() {
  return [
    {
      name: 'title_length',
      category: 'content',
      description: 'Title must be between 3-80 characters.',
      severity: 'error',
    },
    {
      name: 'description_exists',
      category: 'content',
      description: 'Description must not be empty.',
      severity: 'error',
    },
    {
      name: 'emoji_exists',
      category: 'metadata',
      description: 'Emoji field should not be empty.',
      severity: 'warning',
    },
    {
      name: 'age_group',
      category: 'metadata',
      description: 'Age group must be a valid value.',
      severity: 'error',
    },
    {
      name: 'duration_set',
      category: 'metadata',
      description: 'Duration must be set for timed content types (lesson, story, video, audio).',
      severity: 'error',
    },
    {
      name: 'access_tier',
      category: 'metadata',
      description: 'Access tier must be set to "free" or "premium".',
      severity: 'warning',
    },
    {
      name: 'difficulty',
      category: 'metadata',
      description: 'Difficulty must be set for educational content types.',
      severity: 'warning',
    },
    {
      name: 'assets',
      category: 'assets',
      description: 'At least one asset is required for visual content types.',
      severity: 'error',
    },
    {
      name: 'tags',
      category: 'seo',
      description: 'At least 2 tags should be assigned for discoverability.',
      severity: 'warning',
    },
    {
      name: 'translations',
      category: 'content',
      description: 'At least an English (en) translation must exist.',
      severity: 'error',
    },
    {
      name: 'similar_content',
      category: 'quality',
      description: 'Flags content that is too similar to existing items (>0.9 score).',
      severity: 'warning',
    },
    {
      name: 'route',
      category: 'metadata',
      description: 'Route field must be a valid path format.',
      severity: 'warning',
    },
  ];
}

// ── Batch QA ──────────────────────────────────────────────

export async function batchRunQA(contentIds: string[]) {
  // Add each content item to the QA queue
  const jobs = contentIds.map((contentId) => ({
    name: 'run-qa-checks',
    data: { contentId },
    opts: {
      jobId: `qa-${contentId}-${Date.now()}`,
      removeOnComplete: true,
      removeOnFail: false,
    },
  }));

  await qaQueue.addBulk(jobs);

  return {
    queued: contentIds.length,
    contentIds,
    message: `QA checks queued for ${contentIds.length} content item(s).`,
  };
}

// ── Dashboard Stats ───────────────────────────────────────

export async function getDashboardStats(filters?: {
  from?: string;
  to?: string;
  contentType?: string;
}) {
  const where: Record<string, unknown> = {};

  if (filters?.from || filters?.to) {
    const dateFilter: Record<string, Date> = {};
    if (filters.from) dateFilter.gte = new Date(filters.from);
    if (filters.to) dateFilter.lte = new Date(filters.to);
    where.runAt = dateFilter;
  }

  // Get all QA results (individual check rows)
  const qaRows = await prisma.qAResult.findMany({
    where,
    include: {
      content: {
        select: { id: true, title: true, type: true },
      },
    },
    orderBy: { runAt: 'desc' },
  });

  // Optionally filter by content type
  const filtered = filters?.contentType
    ? qaRows.filter((r) => r.content.type === filters.contentType)
    : qaRows;

  // Group by contentId for per-content stats
  const contentMap = new Map<string, {
    contentId: string;
    title: string;
    type: string;
    checks: typeof filtered;
  }>();

  for (const row of filtered) {
    if (!contentMap.has(row.contentId)) {
      contentMap.set(row.contentId, {
        contentId: row.contentId,
        title: row.content.title,
        type: row.content.type,
        checks: [],
      });
    }
    contentMap.get(row.contentId)!.checks.push(row);
  }

  const contentEntries = Array.from(contentMap.values());
  const totalContent = contentEntries.length;
  const totalPassing = contentEntries.filter(
    (c) => c.checks.every((r) => r.passed || r.severity !== 'error')
  ).length;
  const totalFailing = totalContent - totalPassing;

  // Aggregate common failures
  const failureCounts: Record<string, number> = {};
  for (const row of filtered) {
    if (!row.passed) {
      failureCounts[row.checkName] = (failureCounts[row.checkName] || 0) + 1;
    }
  }

  const commonFailures = Object.entries(failureCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([checkName, count]) => ({
      checkName,
      count,
      percentage: totalContent > 0 ? Math.round((count / totalContent) * 100) : 0,
    }));

  // Average pass rate
  const avgPassRate =
    totalContent > 0
      ? Math.round(
          contentEntries.reduce((sum, c) => {
            const total = c.checks.length;
            const passed = c.checks.filter((r) => r.passed).length;
            return sum + (total > 0 ? (passed / total) * 100 : 0);
          }, 0) / totalContent
        )
      : 0;

  // Content with most issues
  const worstContent = contentEntries
    .map((c) => {
      const total = c.checks.length;
      const passed = c.checks.filter((r) => r.passed).length;
      const errors = c.checks.filter((r) => !r.passed && r.severity === 'error').length;
      const warnings = c.checks.filter((r) => !r.passed && r.severity === 'warning').length;
      return {
        contentId: c.contentId,
        title: c.title,
        type: c.type,
        errorCount: errors,
        warningCount: warnings,
        passRate: total > 0 ? Math.round((passed / total) * 100) : 0,
      };
    })
    .filter((c) => c.errorCount > 0)
    .sort((a, b) => b.errorCount - a.errorCount)
    .slice(0, 10);

  return {
    totalContent,
    totalPassing,
    totalFailing,
    overallPassRate: totalContent > 0 ? Math.round((totalPassing / totalContent) * 100) : 0,
    avgCheckPassRate: avgPassRate,
    commonFailures,
    worstContent,
  };
}
