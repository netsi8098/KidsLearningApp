import { prisma } from '../../lib/prisma.js';
import { NotFoundError } from '../../lib/errors.js';
import type { Prisma } from '@prisma/client';

// ── Types ─────────────────────────────────────────────────

export type MetricType = 'startup' | 'navigation' | 'media_load' | 'animation' | 'offline_pack_load';
export type GroupBy = 'hour' | 'day' | 'week';

export interface MetricInput {
  metricType: MetricType;
  value: number;
  deviceInfo: Record<string, unknown>;
  browser?: string;
  locale?: string;
  networkType?: string;
  profileId?: string;
  sessionId?: string;
  appVersion?: string;
}

export interface AggregationBucket {
  period: string;
  metricType: string;
  p50: number;
  p75: number;
  p95: number;
  count: number;
}

export interface Regression {
  metricType: string;
  currentP95: number;
  baselineP95: number;
  threshold: number;
  exceededBy: number;
}

// ── Helpers ───────────────────────────────────────────────

function getDateTruncExpression(groupBy: GroupBy): string {
  switch (groupBy) {
    case 'hour': return `date_trunc('hour', "createdAt")`;
    case 'day': return `date_trunc('day', "createdAt")`;
    case 'week': return `date_trunc('week', "createdAt")`;
  }
}

function computePercentile(sortedValues: number[], percentile: number): number {
  if (sortedValues.length === 0) return 0;
  const index = Math.ceil((percentile / 100) * sortedValues.length) - 1;
  return sortedValues[Math.max(0, index)];
}

// ── Ingest Metrics ───────────────────────────────────────

export async function ingestMetrics(metrics: MetricInput[]): Promise<{ ingested: number }> {
  const records = metrics.map((m) => ({
    metricType: m.metricType,
    value: m.value,
    deviceInfo: m.deviceInfo as Prisma.InputJsonValue,
    browser: m.browser,
    locale: m.locale,
    networkType: m.networkType,
    profileId: m.profileId,
    sessionId: m.sessionId,
    appVersion: m.appVersion,
  }));

  const result = await prisma.performanceMetric.createMany({ data: records });

  return { ingested: result.count };
}

// ── Aggregated Metrics ───────────────────────────────────

export async function getAggregatedMetrics(
  metricType?: MetricType,
  from?: string,
  to?: string,
  groupBy: GroupBy = 'day'
): Promise<AggregationBucket[]> {
  // Build WHERE conditions
  const conditions: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 1;

  if (metricType) {
    conditions.push(`"metricType" = $${paramIndex}`);
    params.push(metricType);
    paramIndex++;
  }
  if (from) {
    conditions.push(`"createdAt" >= $${paramIndex}::timestamptz`);
    params.push(from);
    paramIndex++;
  }
  if (to) {
    conditions.push(`"createdAt" <= $${paramIndex}::timestamptz`);
    params.push(to);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const truncExpr = getDateTruncExpression(groupBy);

  // Use raw SQL for percentile calculations
  const rows = await prisma.$queryRawUnsafe<{
    period: Date;
    metricType: string;
    p50: number;
    p75: number;
    p95: number;
    count: bigint;
  }[]>(
    `SELECT
      ${truncExpr} AS period,
      "metricType",
      PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY value) AS p50,
      PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY value) AS p75,
      PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY value) AS p95,
      COUNT(*)::bigint AS count
    FROM "PerformanceMetric"
    ${whereClause}
    GROUP BY period, "metricType"
    ORDER BY period ASC, "metricType" ASC`,
    ...params
  );

  return rows.map((row) => ({
    period: row.period instanceof Date ? row.period.toISOString() : String(row.period),
    metricType: row.metricType,
    p50: Number(row.p50),
    p75: Number(row.p75),
    p95: Number(row.p95),
    count: Number(row.count),
  }));
}

// ── Metrics by Type (raw records) ────────────────────────

export async function getMetricsByType(
  type: MetricType,
  from?: string,
  to?: string,
  limit: number = 100
): Promise<unknown[]> {
  const where: Prisma.PerformanceMetricWhereInput = { metricType: type };

  if (from || to) {
    where.createdAt = {};
    if (from) (where.createdAt as Prisma.DateTimeFilter).gte = new Date(from);
    if (to) (where.createdAt as Prisma.DateTimeFilter).lte = new Date(to);
  }

  const records = await prisma.performanceMetric.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return records;
}

// ── List Baselines ───────────────────────────────────────

export async function listBaselines() {
  return prisma.performanceBaseline.findMany({
    orderBy: { metricType: 'asc' },
  });
}

// ── Update Baseline ──────────────────────────────────────

export async function updateBaseline(
  type: MetricType,
  data: { p50: number; p75: number; p95: number; threshold: number }
) {
  const baseline = await prisma.performanceBaseline.upsert({
    where: { metricType: type },
    create: {
      metricType: type,
      p50: data.p50,
      p75: data.p75,
      p95: data.p95,
      threshold: data.threshold,
    },
    update: {
      p50: data.p50,
      p75: data.p75,
      p95: data.p95,
      threshold: data.threshold,
    },
  });

  return baseline;
}

// ── Detect Regressions ───────────────────────────────────

export async function detectRegressions(): Promise<Regression[]> {
  // Get all baselines
  const baselines = await prisma.performanceBaseline.findMany();
  if (baselines.length === 0) return [];

  // Compare recent metrics (last 24 hours) against baselines
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const regressions: Regression[] = [];

  for (const baseline of baselines) {
    // Fetch recent values for this metric type, sorted ascending for percentile calc
    const recentMetrics = await prisma.performanceMetric.findMany({
      where: {
        metricType: baseline.metricType,
        createdAt: { gte: since },
      },
      orderBy: { value: 'asc' },
      select: { value: true },
    });

    if (recentMetrics.length === 0) continue;

    const sortedValues = recentMetrics.map((m) => m.value);
    const currentP95 = computePercentile(sortedValues, 95);

    if (currentP95 > baseline.threshold) {
      regressions.push({
        metricType: baseline.metricType,
        currentP95,
        baselineP95: baseline.p95,
        threshold: baseline.threshold,
        exceededBy: Math.round((currentP95 - baseline.threshold) * 100) / 100,
      });
    }
  }

  return regressions;
}
