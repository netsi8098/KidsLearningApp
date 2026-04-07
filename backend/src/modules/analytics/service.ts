import { prisma } from '../../lib/prisma.js';
import { NotFoundError } from '../../lib/errors.js';
import { analyticsQueue } from '../../lib/queue.js';
import type { Prisma, ContentType } from '@prisma/client';

// ── Types ─────────────────────────────────────────────────

export type MetricField = 'views' | 'completions' | 'avgTimeMs' | 'stars' | 'favorites' | 'shares';
export type EventMetric = 'view' | 'completion' | 'star' | 'favorite' | 'share';
export type Period = 'daily' | 'weekly' | 'monthly';

export interface TimeSeriesPoint {
  periodKey: string;
  views: number;
  completions: number;
  avgTimeMs: number;
  stars: number;
  favorites: number;
  shares: number;
}

export interface DashboardData {
  totalViews: number;
  totalCompletions: number;
  uniqueContentViewed: number;
  topByViews: { contentId: string; title: string; type: ContentType; views: number }[];
  topByCompletions: { contentId: string; title: string; type: ContentType; completions: number }[];
  dailyTrend: TimeSeriesPoint[];
}

export interface TopContentItem {
  contentId: string;
  title: string;
  type: ContentType;
  emoji: string;
  metricValue: number;
}

export interface EngagementData {
  byType: {
    type: ContentType;
    avgTimeMs: number;
    completionRate: number;
    totalViews: number;
    totalCompletions: number;
  }[];
}

// ── Helpers ───────────────────────────────────────────────

function getDailyPeriodKey(date: Date = new Date()): string {
  return date.toISOString().split('T')[0]; // 2026-03-26
}

function getWeeklyPeriodKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const jan1 = new Date(year, 0, 1);
  const dayOfYear = Math.floor((date.getTime() - jan1.getTime()) / 86400000) + 1;
  const weekNumber = Math.ceil((dayOfYear + jan1.getDay()) / 7);
  return `${year}-W${String(weekNumber).padStart(2, '0')}`; // 2026-W13
}

function getMonthlyPeriodKey(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // 2026-03
}

function getPeriodKey(period: Period, date: Date = new Date()): string {
  switch (period) {
    case 'daily': return getDailyPeriodKey(date);
    case 'weekly': return getWeeklyPeriodKey(date);
    case 'monthly': return getMonthlyPeriodKey(date);
  }
}

function mapEventMetricToField(metric: EventMetric): MetricField {
  switch (metric) {
    case 'view': return 'views';
    case 'completion': return 'completions';
    case 'star': return 'stars';
    case 'favorite': return 'favorites';
    case 'share': return 'shares';
  }
}

// ── Analytics Service ─────────────────────────────────────

export async function recordEvent(
  contentId: string,
  metric: EventMetric,
  value: number = 1,
  timeMs?: number
): Promise<void> {
  // Verify content exists
  const content = await prisma.content.findUnique({ where: { id: contentId }, select: { id: true } });
  if (!content) {
    throw new NotFoundError('Content', contentId);
  }

  const now = new Date();
  const field = mapEventMetricToField(metric);
  const periodKey = getDailyPeriodKey(now);

  // Build the increment data
  const incrementData: Record<string, number> = {};
  incrementData[field] = value;
  if (timeMs && field === 'views') {
    incrementData.avgTimeMs = timeMs;
  }

  // Upsert the analytics record for the daily period
  await prisma.contentAnalytics.upsert({
    where: {
      contentId_period_periodKey: {
        contentId,
        period: 'daily',
        periodKey,
      },
    },
    create: {
      contentId,
      period: 'daily',
      periodKey,
      [field]: value,
      ...(timeMs && field === 'views' ? { avgTimeMs: timeMs } : {}),
    },
    update: {
      [field]: { increment: value },
      ...(timeMs && field === 'views' ? { avgTimeMs: timeMs } : {}),
    },
  });
}

export async function getContentAnalytics(
  contentId: string,
  period: Period = 'daily',
  from?: string,
  to?: string
): Promise<TimeSeriesPoint[]> {
  // Verify content exists
  const content = await prisma.content.findUnique({ where: { id: contentId }, select: { id: true } });
  if (!content) {
    throw new NotFoundError('Content', contentId);
  }

  const where: Prisma.ContentAnalyticsWhereInput = {
    contentId,
    period,
  };

  if (from || to) {
    where.periodKey = {};
    if (from) (where.periodKey as Prisma.StringFilter).gte = from;
    if (to) (where.periodKey as Prisma.StringFilter).lte = to;
  }

  const records = await prisma.contentAnalytics.findMany({
    where,
    orderBy: { periodKey: 'asc' },
    select: {
      periodKey: true,
      views: true,
      completions: true,
      avgTimeMs: true,
      stars: true,
      favorites: true,
      shares: true,
    },
  });

  return records;
}

export async function getDashboard(
  dateRange?: { from?: string; to?: string },
  period: Period = 'daily'
): Promise<DashboardData> {
  const where: Prisma.ContentAnalyticsWhereInput = { period };
  if (dateRange?.from || dateRange?.to) {
    where.periodKey = {};
    if (dateRange.from) (where.periodKey as Prisma.StringFilter).gte = dateRange.from;
    if (dateRange.to) (where.periodKey as Prisma.StringFilter).lte = dateRange.to;
  }

  // Aggregate totals
  const totals = await prisma.contentAnalytics.aggregate({
    where,
    _sum: {
      views: true,
      completions: true,
    },
  });

  // Count unique content viewed
  const uniqueContent = await prisma.contentAnalytics.groupBy({
    by: ['contentId'],
    where: {
      ...where,
      views: { gt: 0 },
    },
  });

  // Top 10 by views
  const topByViewsRaw = await prisma.contentAnalytics.groupBy({
    by: ['contentId'],
    where,
    _sum: { views: true },
    orderBy: { _sum: { views: 'desc' } },
    take: 10,
  });

  // Top 10 by completions
  const topByCompletionsRaw = await prisma.contentAnalytics.groupBy({
    by: ['contentId'],
    where,
    _sum: { completions: true },
    orderBy: { _sum: { completions: 'desc' } },
    take: 10,
  });

  // Fetch content details for top items
  const allTopIds = [
    ...topByViewsRaw.map((r) => r.contentId),
    ...topByCompletionsRaw.map((r) => r.contentId),
  ];
  const uniqueTopIds = [...new Set(allTopIds)];

  const contentDetails = await prisma.content.findMany({
    where: { id: { in: uniqueTopIds } },
    select: { id: true, title: true, type: true },
  });
  const contentMap = new Map(contentDetails.map((c) => [c.id, c]));

  const topByViews = topByViewsRaw.map((r) => {
    const c = contentMap.get(r.contentId);
    return {
      contentId: r.contentId,
      title: c?.title || 'Unknown',
      type: (c?.type || 'lesson') as ContentType,
      views: r._sum.views || 0,
    };
  });

  const topByCompletions = topByCompletionsRaw.map((r) => {
    const c = contentMap.get(r.contentId);
    return {
      contentId: r.contentId,
      title: c?.title || 'Unknown',
      type: (c?.type || 'lesson') as ContentType,
      completions: r._sum.completions || 0,
    };
  });

  // Daily trend (last 30 days if no range)
  const trendWhere: Prisma.ContentAnalyticsWhereInput = { period: 'daily' };
  if (dateRange?.from || dateRange?.to) {
    trendWhere.periodKey = {};
    if (dateRange.from) (trendWhere.periodKey as Prisma.StringFilter).gte = dateRange.from;
    if (dateRange.to) (trendWhere.periodKey as Prisma.StringFilter).lte = dateRange.to;
  } else {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    trendWhere.periodKey = { gte: getDailyPeriodKey(thirtyDaysAgo) };
  }

  const trendRaw = await prisma.contentAnalytics.groupBy({
    by: ['periodKey'],
    where: trendWhere,
    _sum: {
      views: true,
      completions: true,
      avgTimeMs: true,
      stars: true,
      favorites: true,
      shares: true,
    },
    orderBy: { periodKey: 'asc' },
  });

  const dailyTrend: TimeSeriesPoint[] = trendRaw.map((row) => ({
    periodKey: row.periodKey,
    views: row._sum.views || 0,
    completions: row._sum.completions || 0,
    avgTimeMs: row._sum.avgTimeMs || 0,
    stars: row._sum.stars || 0,
    favorites: row._sum.favorites || 0,
    shares: row._sum.shares || 0,
  }));

  return {
    totalViews: totals._sum.views || 0,
    totalCompletions: totals._sum.completions || 0,
    uniqueContentViewed: uniqueContent.length,
    topByViews,
    topByCompletions,
    dailyTrend,
  };
}

export async function getTopContent(
  metric: MetricField = 'views',
  limit: number = 10,
  period: Period = 'daily',
  from?: string,
  to?: string
): Promise<TopContentItem[]> {
  const where: Prisma.ContentAnalyticsWhereInput = { period };
  if (from || to) {
    where.periodKey = {};
    if (from) (where.periodKey as Prisma.StringFilter).gte = from;
    if (to) (where.periodKey as Prisma.StringFilter).lte = to;
  }

  const grouped = await prisma.contentAnalytics.groupBy({
    by: ['contentId'],
    where,
    _sum: { [metric]: true } as any,
    orderBy: { _sum: { [metric]: 'desc' } as any },
    take: limit,
  });

  if (grouped.length === 0) return [];

  const contentIds = grouped.map((g) => g.contentId);
  const contents = await prisma.content.findMany({
    where: { id: { in: contentIds } },
    select: { id: true, title: true, type: true, emoji: true },
  });
  const contentMap = new Map(contents.map((c) => [c.id, c]));

  return grouped.map((g) => {
    const c = contentMap.get(g.contentId);
    const sumObj = g._sum as Record<string, number | null>;
    return {
      contentId: g.contentId,
      title: c?.title || 'Unknown',
      type: (c?.type || 'lesson') as ContentType,
      emoji: c?.emoji || '',
      metricValue: sumObj[metric] || 0,
    };
  });
}

export async function getEngagement(
  period: Period = 'daily',
  from?: string,
  to?: string
): Promise<EngagementData> {
  const where: Prisma.ContentAnalyticsWhereInput = { period };
  if (from || to) {
    where.periodKey = {};
    if (from) (where.periodKey as Prisma.StringFilter).gte = from;
    if (to) (where.periodKey as Prisma.StringFilter).lte = to;
  }

  // Get all analytics records with content type info
  const records = await prisma.contentAnalytics.findMany({
    where,
    select: {
      views: true,
      completions: true,
      avgTimeMs: true,
      content: {
        select: { type: true },
      },
    },
  });

  // Aggregate by content type
  const typeMap = new Map<ContentType, { totalViews: number; totalCompletions: number; totalTimeMs: number; count: number }>();

  for (const record of records) {
    const type = record.content.type;
    const existing = typeMap.get(type) || { totalViews: 0, totalCompletions: 0, totalTimeMs: 0, count: 0 };
    existing.totalViews += record.views;
    existing.totalCompletions += record.completions;
    existing.totalTimeMs += record.avgTimeMs;
    existing.count += 1;
    typeMap.set(type, existing);
  }

  const byType = Array.from(typeMap.entries()).map(([type, data]) => ({
    type,
    avgTimeMs: data.count > 0 ? Math.round(data.totalTimeMs / data.count) : 0,
    completionRate: data.totalViews > 0 ? Math.round((data.totalCompletions / data.totalViews) * 10000) / 100 : 0,
    totalViews: data.totalViews,
    totalCompletions: data.totalCompletions,
  }));

  byType.sort((a, b) => b.totalViews - a.totalViews);

  return { byType };
}

export async function aggregateAnalytics(): Promise<{ weekly: number; monthly: number }> {
  // Get all daily records that need aggregation
  const dailyRecords = await prisma.contentAnalytics.findMany({
    where: { period: 'daily' },
    select: {
      contentId: true,
      periodKey: true,
      views: true,
      completions: true,
      avgTimeMs: true,
      stars: true,
      favorites: true,
      shares: true,
    },
  });

  // Group by weekly and monthly keys
  const weeklyAgg = new Map<string, { contentId: string; periodKey: string; views: number; completions: number; avgTimeMs: number; stars: number; favorites: number; shares: number; count: number }>();
  const monthlyAgg = new Map<string, { contentId: string; periodKey: string; views: number; completions: number; avgTimeMs: number; stars: number; favorites: number; shares: number; count: number }>();

  for (const record of dailyRecords) {
    const date = new Date(record.periodKey + 'T00:00:00Z');
    const weeklyKey = getWeeklyPeriodKey(date);
    const monthlyKey = getMonthlyPeriodKey(date);

    // Weekly aggregation
    const wKey = `${record.contentId}:${weeklyKey}`;
    const wExisting = weeklyAgg.get(wKey) || { contentId: record.contentId, periodKey: weeklyKey, views: 0, completions: 0, avgTimeMs: 0, stars: 0, favorites: 0, shares: 0, count: 0 };
    wExisting.views += record.views;
    wExisting.completions += record.completions;
    wExisting.avgTimeMs += record.avgTimeMs;
    wExisting.stars += record.stars;
    wExisting.favorites += record.favorites;
    wExisting.shares += record.shares;
    wExisting.count += 1;
    weeklyAgg.set(wKey, wExisting);

    // Monthly aggregation
    const mKey = `${record.contentId}:${monthlyKey}`;
    const mExisting = monthlyAgg.get(mKey) || { contentId: record.contentId, periodKey: monthlyKey, views: 0, completions: 0, avgTimeMs: 0, stars: 0, favorites: 0, shares: 0, count: 0 };
    mExisting.views += record.views;
    mExisting.completions += record.completions;
    mExisting.avgTimeMs += record.avgTimeMs;
    mExisting.stars += record.stars;
    mExisting.favorites += record.favorites;
    mExisting.shares += record.shares;
    mExisting.count += 1;
    monthlyAgg.set(mKey, mExisting);
  }

  // Upsert weekly aggregations
  let weeklyCount = 0;
  for (const [, data] of weeklyAgg) {
    const avgTime = data.count > 0 ? Math.round(data.avgTimeMs / data.count) : 0;
    await prisma.contentAnalytics.upsert({
      where: {
        contentId_period_periodKey: {
          contentId: data.contentId,
          period: 'weekly',
          periodKey: data.periodKey,
        },
      },
      create: {
        contentId: data.contentId,
        period: 'weekly',
        periodKey: data.periodKey,
        views: data.views,
        completions: data.completions,
        avgTimeMs: avgTime,
        stars: data.stars,
        favorites: data.favorites,
        shares: data.shares,
      },
      update: {
        views: data.views,
        completions: data.completions,
        avgTimeMs: avgTime,
        stars: data.stars,
        favorites: data.favorites,
        shares: data.shares,
      },
    });
    weeklyCount++;
  }

  // Upsert monthly aggregations
  let monthlyCount = 0;
  for (const [, data] of monthlyAgg) {
    const avgTime = data.count > 0 ? Math.round(data.avgTimeMs / data.count) : 0;
    await prisma.contentAnalytics.upsert({
      where: {
        contentId_period_periodKey: {
          contentId: data.contentId,
          period: 'monthly',
          periodKey: data.periodKey,
        },
      },
      create: {
        contentId: data.contentId,
        period: 'monthly',
        periodKey: data.periodKey,
        views: data.views,
        completions: data.completions,
        avgTimeMs: avgTime,
        stars: data.stars,
        favorites: data.favorites,
        shares: data.shares,
      },
      update: {
        views: data.views,
        completions: data.completions,
        avgTimeMs: avgTime,
        stars: data.stars,
        favorites: data.favorites,
        shares: data.shares,
      },
    });
    monthlyCount++;
  }

  return { weekly: weeklyCount, monthly: monthlyCount };
}

// ── SLA Dashboard ───────────────────────────────────────

const PIPELINE_STAGES = ['draft', 'review', 'approval', 'publish', 'translation', 'asset', 'voice'];

export async function getSLADashboard(from?: string, to?: string) {
  const where: Prisma.ContentPipelineEventWhereInput = {};
  if (from || to) {
    where.timestamp = {};
    if (from) where.timestamp.gte = new Date(from);
    if (to) where.timestamp.lte = new Date(to);
  }

  const events = await prisma.contentPipelineEvent.findMany({
    where,
    orderBy: { timestamp: 'asc' },
  });

  // Calculate avg time per stage
  const stageTimes = new Map<string, number[]>();
  const contentStageEntries = new Map<string, Date>();

  for (const event of events) {
    const key = `${event.contentId}:${event.stage}`;
    if (event.action === 'entered') {
      contentStageEntries.set(key, event.timestamp);
    } else if (event.action === 'exited') {
      const entry = contentStageEntries.get(key);
      if (entry) {
        const duration = event.timestamp.getTime() - entry.getTime();
        const times = stageTimes.get(event.stage) || [];
        times.push(duration);
        stageTimes.set(event.stage, times);
        contentStageEntries.delete(key);
      }
    }
  }

  const stageMetrics = PIPELINE_STAGES.map((stage) => {
    const times = stageTimes.get(stage) || [];
    const sorted = [...times].sort((a, b) => a - b);
    return {
      stage,
      count: times.length,
      avgHours: times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length / 3600000 * 10) / 10 : 0,
      p50Hours: sorted.length > 0 ? Math.round(sorted[Math.floor(sorted.length * 0.5)] / 3600000 * 10) / 10 : 0,
      p95Hours: sorted.length > 0 ? Math.round(sorted[Math.floor(sorted.length * 0.95)] / 3600000 * 10) / 10 : 0,
    };
  });

  // Count content currently in each stage (entered but not exited)
  const inProgress = new Map<string, Set<string>>();
  for (const [key] of contentStageEntries) {
    const [contentId, stage] = key.split(':');
    const set = inProgress.get(stage) || new Set();
    set.add(contentId);
    inProgress.set(stage, set);
  }

  const currentQueue = PIPELINE_STAGES.map((stage) => ({
    stage,
    count: inProgress.get(stage)?.size || 0,
  }));

  return { stageMetrics, currentQueue, totalEvents: events.length };
}

export async function getSLAPipelineFunnel(from?: string, to?: string) {
  const where: Prisma.ContentPipelineEventWhereInput = { action: 'entered' };
  if (from || to) {
    where.timestamp = {};
    if (from) where.timestamp.gte = new Date(from);
    if (to) where.timestamp.lte = new Date(to);
  }

  const counts = await Promise.all(
    PIPELINE_STAGES.map(async (stage) => {
      const count = await prisma.contentPipelineEvent.count({
        where: { ...where, stage },
      });
      return { stage, entered: count };
    })
  );

  return { funnel: counts };
}

export async function getSLABottlenecks(limit: number) {
  // Find content items that have been in a stage the longest
  const events = await prisma.contentPipelineEvent.findMany({
    where: { action: 'entered' },
    orderBy: { timestamp: 'asc' },
  });

  // Find entries without a matching exit
  const entryMap = new Map<string, { contentId: string; stage: string; enteredAt: Date }>();
  const exitedKeys = new Set<string>();

  const exitEvents = await prisma.contentPipelineEvent.findMany({
    where: { action: 'exited' },
  });
  for (const e of exitEvents) {
    exitedKeys.add(`${e.contentId}:${e.stage}`);
  }

  for (const event of events) {
    const key = `${event.contentId}:${event.stage}`;
    if (!exitedKeys.has(key)) {
      entryMap.set(key, { contentId: event.contentId, stage: event.stage, enteredAt: event.timestamp });
    }
  }

  const now = new Date();
  const stuck = Array.from(entryMap.values())
    .map((item) => ({
      ...item,
      stuckHours: Math.round((now.getTime() - item.enteredAt.getTime()) / 3600000 * 10) / 10,
    }))
    .sort((a, b) => b.stuckHours - a.stuckHours)
    .slice(0, limit);

  // Fetch content details
  const contentIds = [...new Set(stuck.map((s) => s.contentId))];
  const contents = await prisma.content.findMany({
    where: { id: { in: contentIds } },
    select: { id: true, title: true, slug: true, type: true },
  });
  const contentMap = new Map(contents.map((c) => [c.id, c]));

  return stuck.map((s) => ({
    ...s,
    content: contentMap.get(s.contentId) || null,
  }));
}

export async function getSLAAging(stage?: string, daysThreshold: number = 7) {
  const thresholdDate = new Date(Date.now() - daysThreshold * 24 * 60 * 60 * 1000);

  const where: Prisma.ContentPipelineEventWhereInput = {
    action: 'entered',
    timestamp: { lte: thresholdDate },
  };
  if (stage) where.stage = stage;

  const entries = await prisma.contentPipelineEvent.findMany({
    where,
    orderBy: { timestamp: 'asc' },
  });

  // Filter out entries that have a matching exit
  const exitEvents = await prisma.contentPipelineEvent.findMany({
    where: { action: 'exited', ...(stage ? { stage } : {}) },
  });
  const exitedKeys = new Set(exitEvents.map((e) => `${e.contentId}:${e.stage}`));

  const aging = entries
    .filter((e) => !exitedKeys.has(`${e.contentId}:${e.stage}`))
    .map((e) => ({
      contentId: e.contentId,
      stage: e.stage,
      enteredAt: e.timestamp,
      daysInStage: Math.round((Date.now() - e.timestamp.getTime()) / 86400000 * 10) / 10,
    }));

  return { items: aging, threshold: daysThreshold, total: aging.length };
}

export async function exportCSV(
  filters: {
    from?: string;
    to?: string;
    period?: Period;
    contentType?: ContentType;
    metric?: MetricField;
  }
): Promise<string> {
  const where: Prisma.ContentAnalyticsWhereInput = {
    period: filters.period || 'daily',
  };

  if (filters.from || filters.to) {
    where.periodKey = {};
    if (filters.from) (where.periodKey as Prisma.StringFilter).gte = filters.from;
    if (filters.to) (where.periodKey as Prisma.StringFilter).lte = filters.to;
  }

  if (filters.contentType) {
    where.content = { type: filters.contentType };
  }

  const records = await prisma.contentAnalytics.findMany({
    where,
    orderBy: [{ periodKey: 'asc' }, { contentId: 'asc' }],
    include: {
      content: {
        select: { title: true, type: true, slug: true },
      },
    },
  });

  // Build CSV
  const headers = ['Period Key', 'Content ID', 'Content Title', 'Content Type', 'Slug', 'Views', 'Completions', 'Avg Time (ms)', 'Stars', 'Favorites', 'Shares'];
  const rows = records.map((r) => [
    r.periodKey,
    r.contentId,
    `"${r.content.title.replace(/"/g, '""')}"`,
    r.content.type,
    r.content.slug,
    r.views,
    r.completions,
    r.avgTimeMs,
    r.stars,
    r.favorites,
    r.shares,
  ].join(','));

  return [headers.join(','), ...rows].join('\n');
}
