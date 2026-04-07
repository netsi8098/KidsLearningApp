import { prisma } from '../../lib/prisma.js';
import { NotFoundError } from '../../lib/errors.js';
import type { Content, ChildProfile, RecommendationConfig, AgeGroup } from '@prisma/client';

// ── Types ─────────────────────────────────────────────────

interface ScoringWeights {
  freshness_weight: number;
  repeat_penalty: number;
  bedtime_bias: number;
  skill_boost: number;
  age_match_weight: number;
}

interface ScoreBreakdown {
  ageMatchScore: number;
  skillMatchScore: number;
  freshnessScore: number;
  bedtimeBiasScore: number;
  repeatPenaltyScore: number;
  totalScore: number;
}

export interface ScoredContent {
  contentId: string;
  title: string;
  type: string;
  ageGroup: string;
  score: number;
  breakdown: ScoreBreakdown;
}

export interface ExplainResult {
  contentId: string;
  profileId: string;
  contentTitle: string;
  profileName: string;
  breakdown: ScoreBreakdown;
  factors: {
    label: string;
    detail: string;
    impact: number;
  }[];
}

export interface ContentDiagnostics {
  content: {
    id: string;
    title: string;
    type: string;
    ageGroup: string;
    status: string;
    bedtimeFriendly: boolean;
    freshnessScore: number | null;
    evergreenScore: number | null;
    publishedAt: Date | null;
    createdAt: Date;
  };
  skills: { skillId: string; skillName: string; category: string; relevance: number }[];
  tags: { tagId: string; tagName: string; dimension: string }[];
  analytics: {
    period: string;
    periodKey: string;
    views: number;
    completions: number;
    avgTimeMs: number;
    stars: number;
    favorites: number;
  }[];
  freshness: {
    daysSincePublished: number | null;
    needsRefresh: boolean;
    lastRefreshDate: Date | null;
    nextReviewDate: Date | null;
  };
}

// ── Default Weights ───────────────────────────────────────

const DEFAULT_WEIGHTS: ScoringWeights = {
  freshness_weight: 0.15,
  repeat_penalty: 0.2,
  bedtime_bias: 0.25,
  skill_boost: 0.3,
  age_match_weight: 0.4,
};

// ── Config CRUD ───────────────────────────────────────────

export async function listConfigs(): Promise<RecommendationConfig[]> {
  return prisma.recommendationConfig.findMany({
    orderBy: { key: 'asc' },
  });
}

export async function updateConfig(
  key: string,
  value: unknown,
  description: string | undefined,
  updatedBy: string
): Promise<RecommendationConfig> {
  const config = await prisma.recommendationConfig.upsert({
    where: { key },
    update: {
      value: value as any,
      ...(description !== undefined && { description }),
      updatedBy,
    },
    create: {
      key,
      value: value as any,
      description: description ?? null,
      updatedBy,
    },
  });

  return config;
}

// ── Weight Resolution ─────────────────────────────────────

async function resolveWeights(overrides?: Record<string, number>): Promise<ScoringWeights> {
  const configs = await prisma.recommendationConfig.findMany();

  const weights: ScoringWeights = { ...DEFAULT_WEIGHTS };

  for (const config of configs) {
    const key = config.key as keyof ScoringWeights;
    if (key in weights && typeof config.value === 'number') {
      weights[key] = config.value as number;
    }
  }

  // Apply overrides on top
  if (overrides) {
    for (const [key, value] of Object.entries(overrides)) {
      if (key in weights) {
        weights[key as keyof ScoringWeights] = value;
      }
    }
  }

  return weights;
}

// ── Age Match Scoring ─────────────────────────────────────

const AGE_GROUP_ORDER: AgeGroup[] = ['age_2_3', 'age_3_4', 'age_4_5', 'age_5_6', 'all'];

function scoreAgeMatch(contentAgeGroup: AgeGroup, profileAgeGroup: AgeGroup): number {
  // "all" content matches any profile perfectly
  if (contentAgeGroup === 'all') return 1.0;

  // Exact match
  if (contentAgeGroup === profileAgeGroup) return 1.0;

  // "all" profile matches any content
  if (profileAgeGroup === 'all') return 0.8;

  // Adjacent age groups get partial credit
  const contentIdx = AGE_GROUP_ORDER.indexOf(contentAgeGroup);
  const profileIdx = AGE_GROUP_ORDER.indexOf(profileAgeGroup);
  const distance = Math.abs(contentIdx - profileIdx);

  if (distance === 1) return 0.5;
  if (distance === 2) return 0.2;
  return 0.0;
}

// ── Freshness Scoring ─────────────────────────────────────

function scoreFreshness(publishedAt: Date | null, freshnessScore: number | null): number {
  // Use the stored freshness score if available
  if (freshnessScore !== null) {
    return Math.max(0, Math.min(1, freshnessScore));
  }

  // Otherwise calculate from publish date
  if (!publishedAt) return 0.5; // Neutral for unpublished

  const daysSince = (Date.now() - publishedAt.getTime()) / (1000 * 60 * 60 * 24);

  // Recent content (< 7 days) gets full freshness
  if (daysSince < 7) return 1.0;
  // Within a month gets decent freshness
  if (daysSince < 30) return 0.8;
  // Within 3 months
  if (daysSince < 90) return 0.5;
  // Older content
  return 0.3;
}

// ── Bedtime Scoring ───────────────────────────────────────

function scoreBedtime(bedtimeFriendly: boolean, profileBedtimeMode: boolean): number {
  if (!profileBedtimeMode) return 0; // No bias when not in bedtime mode
  return bedtimeFriendly ? 1.0 : -0.5; // Penalize non-bedtime content during bedtime
}

// ── Repeat Penalty ────────────────────────────────────────

function scoreRepeatPenalty(recentViews: number): number {
  if (recentViews === 0) return 0; // No penalty
  if (recentViews === 1) return -0.3;
  if (recentViews === 2) return -0.6;
  return -1.0; // Heavy penalty for content viewed 3+ times recently
}

// ── Skill Match Scoring ───────────────────────────────────

function scoreSkillMatch(
  contentSkills: { skillId: string; relevance: number }[],
  _profileAgeGroup: AgeGroup
): number {
  if (contentSkills.length === 0) return 0.5; // Neutral if no skills tagged

  // Boost content that covers more skills with higher relevance
  const avgRelevance = contentSkills.reduce((sum, s) => sum + s.relevance, 0) / contentSkills.length;
  const diversityBonus = Math.min(contentSkills.length / 5, 1.0) * 0.2;

  return Math.min(1.0, avgRelevance + diversityBonus);
}

// ── Full Scoring ──────────────────────────────────────────

function scoreContent(
  content: Content & { skills: { skillId: string; relevance: number }[] },
  profile: ChildProfile,
  weights: ScoringWeights,
  recentViewCounts: Map<string, number>
): ScoreBreakdown {
  const ageMatchScore = scoreAgeMatch(content.ageGroup, profile.ageGroup) * weights.age_match_weight;
  const skillMatchScore = scoreSkillMatch(content.skills, profile.ageGroup) * weights.skill_boost;
  const freshnessScore = scoreFreshness(content.publishedAt, content.freshnessScore) * weights.freshness_weight;
  const bedtimeBiasScore = scoreBedtime(content.bedtimeFriendly, profile.bedtimeMode) * weights.bedtime_bias;
  const repeatPenaltyScore = scoreRepeatPenalty(recentViewCounts.get(content.id) ?? 0) * weights.repeat_penalty;

  const totalScore = ageMatchScore + skillMatchScore + freshnessScore + bedtimeBiasScore + repeatPenaltyScore;

  return {
    ageMatchScore: round(ageMatchScore),
    skillMatchScore: round(skillMatchScore),
    freshnessScore: round(freshnessScore),
    bedtimeBiasScore: round(bedtimeBiasScore),
    repeatPenaltyScore: round(repeatPenaltyScore),
    totalScore: round(totalScore),
  };
}

function round(n: number): number {
  return Math.round(n * 10000) / 10000;
}

// ── Preview Recommendations ───────────────────────────────

export async function previewRecommendations(
  profileId: string,
  overrides?: Record<string, number>
): Promise<ScoredContent[]> {
  const profile = await prisma.childProfile.findUnique({ where: { id: profileId } });
  if (!profile) {
    throw new NotFoundError('ChildProfile', profileId);
  }

  const weights = await resolveWeights(overrides);

  // Fetch published content with skills
  const contents = await prisma.content.findMany({
    where: {
      status: 'published',
      deletedAt: null,
    },
    include: {
      skills: {
        select: { skillId: true, relevance: true },
      },
    },
  });

  // Fetch recent analytics to determine repeat views
  const recentPeriodKey = getRecentPeriodKey();
  const analytics = await prisma.contentAnalytics.findMany({
    where: {
      periodKey: recentPeriodKey,
      period: 'weekly',
    },
    select: { contentId: true, views: true },
  });

  const recentViewCounts = new Map<string, number>();
  for (const a of analytics) {
    recentViewCounts.set(a.contentId, a.views);
  }

  // Score all content
  const scored: ScoredContent[] = contents.map((content) => {
    const breakdown = scoreContent(content, profile, weights, recentViewCounts);
    return {
      contentId: content.id,
      title: content.title,
      type: content.type,
      ageGroup: content.ageGroup,
      score: breakdown.totalScore,
      breakdown,
    };
  });

  // Sort by score descending and take top 20
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 20);
}

// ── Explain Recommendation ────────────────────────────────

export async function explainRecommendation(
  contentId: string,
  profileId: string
): Promise<ExplainResult> {
  const [content, profile] = await Promise.all([
    prisma.content.findUnique({
      where: { id: contentId },
      include: {
        skills: { select: { skillId: true, relevance: true } },
      },
    }),
    prisma.childProfile.findUnique({ where: { id: profileId } }),
  ]);

  if (!content) {
    throw new NotFoundError('Content', contentId);
  }
  if (!profile) {
    throw new NotFoundError('ChildProfile', profileId);
  }

  const weights = await resolveWeights();

  // Get recent views for this content
  const recentPeriodKey = getRecentPeriodKey();
  const analytics = await prisma.contentAnalytics.findFirst({
    where: {
      contentId,
      period: 'weekly',
      periodKey: recentPeriodKey,
    },
    select: { views: true },
  });

  const recentViewCounts = new Map<string, number>();
  if (analytics) {
    recentViewCounts.set(contentId, analytics.views);
  }

  const breakdown = scoreContent(content, profile, weights, recentViewCounts);

  // Build human-readable factor explanations
  const factors: ExplainResult['factors'] = [
    {
      label: 'Age Match',
      detail: `Content (${content.ageGroup}) vs Profile (${profile.ageGroup})`,
      impact: breakdown.ageMatchScore,
    },
    {
      label: 'Skill Match',
      detail: `${content.skills.length} skill(s) tagged, avg relevance applied`,
      impact: breakdown.skillMatchScore,
    },
    {
      label: 'Freshness',
      detail: content.publishedAt
        ? `Published ${Math.floor((Date.now() - content.publishedAt.getTime()) / (1000 * 60 * 60 * 24))} days ago`
        : 'Not yet published',
      impact: breakdown.freshnessScore,
    },
    {
      label: 'Bedtime Bias',
      detail: profile.bedtimeMode
        ? `Bedtime mode ON, content ${content.bedtimeFriendly ? 'IS' : 'is NOT'} bedtime-friendly`
        : 'Bedtime mode OFF (no bias)',
      impact: breakdown.bedtimeBiasScore,
    },
    {
      label: 'Repeat Penalty',
      detail: analytics ? `Viewed ${analytics.views} time(s) this week` : 'Not viewed recently',
      impact: breakdown.repeatPenaltyScore,
    },
  ];

  return {
    contentId,
    profileId,
    contentTitle: content.title,
    profileName: profile.name,
    breakdown,
    factors,
  };
}

// ── Simulate Recommendations ──────────────────────────────

export async function simulateRecommendations(
  profileId: string,
  overrides: Record<string, number>
): Promise<{ defaults: ScoringWeights; applied: ScoringWeights; results: ScoredContent[] }> {
  const defaults = await resolveWeights();
  const applied = await resolveWeights(overrides);
  const results = await previewRecommendations(profileId, overrides);

  return { defaults, applied, results };
}

// ── Content Diagnostics ───────────────────────────────────

export async function getContentDiagnostics(contentId: string): Promise<ContentDiagnostics> {
  const content = await prisma.content.findUnique({
    where: { id: contentId },
    include: {
      skills: {
        include: {
          skill: { select: { id: true, name: true, category: true } },
        },
      },
      tags: {
        include: {
          tag: { select: { id: true, name: true, dimension: true } },
        },
      },
      analytics: {
        orderBy: { periodKey: 'desc' },
        take: 10,
        select: {
          period: true,
          periodKey: true,
          views: true,
          completions: true,
          avgTimeMs: true,
          stars: true,
          favorites: true,
        },
      },
    },
  });

  if (!content) {
    throw new NotFoundError('Content', contentId);
  }

  const daysSincePublished = content.publishedAt
    ? Math.floor((Date.now() - content.publishedAt.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return {
    content: {
      id: content.id,
      title: content.title,
      type: content.type,
      ageGroup: content.ageGroup,
      status: content.status,
      bedtimeFriendly: content.bedtimeFriendly,
      freshnessScore: content.freshnessScore,
      evergreenScore: content.evergreenScore,
      publishedAt: content.publishedAt,
      createdAt: content.createdAt,
    },
    skills: content.skills.map((cs) => ({
      skillId: cs.skill.id,
      skillName: cs.skill.name,
      category: cs.skill.category,
      relevance: cs.relevance,
    })),
    tags: content.tags.map((ct) => ({
      tagId: ct.tag.id,
      tagName: ct.tag.name,
      dimension: ct.tag.dimension,
    })),
    analytics: content.analytics,
    freshness: {
      daysSincePublished,
      needsRefresh: content.needsRefresh,
      lastRefreshDate: content.lastRefreshDate,
      nextReviewDate: content.nextReviewDate,
    },
  };
}

// ── Helpers ───────────────────────────────────────────────

function getRecentPeriodKey(): string {
  const now = new Date();
  // ISO week key format: YYYY-Www
  const year = now.getFullYear();
  const oneJan = new Date(year, 0, 1);
  const weekNum = Math.ceil(((now.getTime() - oneJan.getTime()) / 86400000 + oneJan.getDay() + 1) / 7);
  return `${year}-W${String(weekNum).padStart(2, '0')}`;
}
