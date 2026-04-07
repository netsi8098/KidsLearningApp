import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockPrisma, resetPrismaMocks } from '../../helpers/prisma.mock';

// ── Mock dependencies ────────────────────────────────────────
vi.mock('../../../src/lib/prisma', () => ({ prisma: mockPrisma }));

import {
  ingestMetrics,
  getAggregatedMetrics,
  getMetricsByType,
  listBaselines,
  updateBaseline,
  detectRegressions,
} from '../../../src/modules/performance/service';

// ── Helpers ──────────────────────────────────────────────────

function fakeMetricRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: 'metric-1',
    metricType: 'startup',
    value: 1200,
    deviceInfo: { platform: 'ios', model: 'iPhone 15' },
    browser: 'Safari',
    locale: 'en',
    networkType: 'wifi',
    profileId: 'profile-1',
    sessionId: 'session-1',
    appVersion: '2.1.0',
    createdAt: new Date('2024-01-15'),
    ...overrides,
  };
}

function fakeBaseline(overrides: Record<string, unknown> = {}) {
  return {
    id: 'baseline-1',
    metricType: 'startup',
    p50: 800,
    p75: 1200,
    p95: 2000,
    threshold: 2500,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

// ── Tests ────────────────────────────────────────────────────

describe('PerformanceService', () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  // ── ingestMetrics ──────────────────────────────────────────

  describe('ingestMetrics', () => {
    it('should create metrics via createMany and return ingested count', async () => {
      mockPrisma.performanceMetric.createMany.mockResolvedValue({ count: 3 });

      const result = await ingestMetrics([
        { metricType: 'startup', value: 1200, deviceInfo: { platform: 'ios' } },
        { metricType: 'navigation', value: 300, deviceInfo: { platform: 'android' } },
        { metricType: 'media_load', value: 800, deviceInfo: { platform: 'web' } },
      ]);

      expect(result).toEqual({ ingested: 3 });
      expect(mockPrisma.performanceMetric.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({ metricType: 'startup', value: 1200 }),
          expect.objectContaining({ metricType: 'navigation', value: 300 }),
          expect.objectContaining({ metricType: 'media_load', value: 800 }),
        ]),
      });
    });

    it('should handle empty metrics array', async () => {
      mockPrisma.performanceMetric.createMany.mockResolvedValue({ count: 0 });

      const result = await ingestMetrics([]);

      expect(result).toEqual({ ingested: 0 });
    });

    it('should pass optional fields through to createMany', async () => {
      mockPrisma.performanceMetric.createMany.mockResolvedValue({ count: 1 });

      await ingestMetrics([
        {
          metricType: 'startup',
          value: 1500,
          deviceInfo: { platform: 'ios' },
          browser: 'Safari',
          locale: 'en',
          networkType: 'wifi',
          profileId: 'profile-1',
          sessionId: 'session-abc',
          appVersion: '2.1.0',
        },
      ]);

      const createCall = mockPrisma.performanceMetric.createMany.mock.calls[0][0];
      expect(createCall.data[0].browser).toBe('Safari');
      expect(createCall.data[0].locale).toBe('en');
      expect(createCall.data[0].networkType).toBe('wifi');
      expect(createCall.data[0].profileId).toBe('profile-1');
      expect(createCall.data[0].sessionId).toBe('session-abc');
      expect(createCall.data[0].appVersion).toBe('2.1.0');
    });

    it('should handle undefined optional fields', async () => {
      mockPrisma.performanceMetric.createMany.mockResolvedValue({ count: 1 });

      await ingestMetrics([
        { metricType: 'startup', value: 1000, deviceInfo: { platform: 'web' } },
      ]);

      const createCall = mockPrisma.performanceMetric.createMany.mock.calls[0][0];
      expect(createCall.data[0].browser).toBeUndefined();
      expect(createCall.data[0].locale).toBeUndefined();
      expect(createCall.data[0].profileId).toBeUndefined();
    });
  });

  // ── getAggregatedMetrics ──────────────────────────────────

  describe('getAggregatedMetrics', () => {
    it('should execute raw SQL query and return aggregation buckets', async () => {
      mockPrisma.$queryRawUnsafe.mockResolvedValue([
        {
          period: new Date('2024-01-15'),
          metricType: 'startup',
          p50: 800,
          p75: 1200,
          p95: 2000,
          count: BigInt(100),
        },
      ]);

      const result = await getAggregatedMetrics('startup', '2024-01-01', '2024-01-31', 'day');

      expect(result).toHaveLength(1);
      expect(result[0].metricType).toBe('startup');
      expect(result[0].p50).toBe(800);
      expect(result[0].p75).toBe(1200);
      expect(result[0].p95).toBe(2000);
      expect(result[0].count).toBe(100);
    });

    it('should convert BigInt count to Number', async () => {
      mockPrisma.$queryRawUnsafe.mockResolvedValue([
        {
          period: new Date('2024-01-15'),
          metricType: 'navigation',
          p50: 200,
          p75: 350,
          p95: 500,
          count: BigInt(50),
        },
      ]);

      const result = await getAggregatedMetrics();

      expect(typeof result[0].count).toBe('number');
      expect(result[0].count).toBe(50);
    });

    it('should return empty array when no data exists', async () => {
      mockPrisma.$queryRawUnsafe.mockResolvedValue([]);

      const result = await getAggregatedMetrics();

      expect(result).toEqual([]);
    });

    it('should convert Date period to ISO string', async () => {
      const date = new Date('2024-03-01T00:00:00Z');
      mockPrisma.$queryRawUnsafe.mockResolvedValue([
        {
          period: date,
          metricType: 'startup',
          p50: 100,
          p75: 200,
          p95: 300,
          count: BigInt(10),
        },
      ]);

      const result = await getAggregatedMetrics();

      expect(result[0].period).toBe(date.toISOString());
    });

    it('should pass metricType filter when provided', async () => {
      mockPrisma.$queryRawUnsafe.mockResolvedValue([]);

      await getAggregatedMetrics('startup');

      const sql = mockPrisma.$queryRawUnsafe.mock.calls[0][0];
      expect(sql).toContain('"metricType"');
      expect(mockPrisma.$queryRawUnsafe.mock.calls[0][1]).toBe('startup');
    });

    it('should handle groupBy parameter for different periods', async () => {
      mockPrisma.$queryRawUnsafe.mockResolvedValue([]);

      await getAggregatedMetrics(undefined, undefined, undefined, 'hour');

      const sql = mockPrisma.$queryRawUnsafe.mock.calls[0][0];
      expect(sql).toContain("date_trunc('hour'");
    });

    it('should default to day grouping', async () => {
      mockPrisma.$queryRawUnsafe.mockResolvedValue([]);

      await getAggregatedMetrics();

      const sql = mockPrisma.$queryRawUnsafe.mock.calls[0][0];
      expect(sql).toContain("date_trunc('day'");
    });
  });

  // ── getMetricsByType ──────────────────────────────────────

  describe('getMetricsByType', () => {
    it('should return raw metrics filtered by type', async () => {
      const metrics = [fakeMetricRecord(), fakeMetricRecord({ id: 'metric-2' })];
      mockPrisma.performanceMetric.findMany.mockResolvedValue(metrics);

      const result = await getMetricsByType('startup');

      expect(result).toHaveLength(2);
      expect(mockPrisma.performanceMetric.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { metricType: 'startup' },
          orderBy: { createdAt: 'desc' },
          take: 100,
        })
      );
    });

    it('should apply date range filter', async () => {
      mockPrisma.performanceMetric.findMany.mockResolvedValue([]);

      await getMetricsByType('startup', '2024-01-01', '2024-01-31');

      const call = mockPrisma.performanceMetric.findMany.mock.calls[0][0];
      expect(call.where.metricType).toBe('startup');
      expect(call.where.createdAt).toBeDefined();
    });

    it('should apply custom limit', async () => {
      mockPrisma.performanceMetric.findMany.mockResolvedValue([]);

      await getMetricsByType('navigation', undefined, undefined, 50);

      const call = mockPrisma.performanceMetric.findMany.mock.calls[0][0];
      expect(call.take).toBe(50);
    });

    it('should default limit to 100', async () => {
      mockPrisma.performanceMetric.findMany.mockResolvedValue([]);

      await getMetricsByType('startup');

      const call = mockPrisma.performanceMetric.findMany.mock.calls[0][0];
      expect(call.take).toBe(100);
    });

    it('should apply from-only date filter', async () => {
      mockPrisma.performanceMetric.findMany.mockResolvedValue([]);

      await getMetricsByType('startup', '2024-01-01');

      const call = mockPrisma.performanceMetric.findMany.mock.calls[0][0];
      expect(call.where.createdAt.gte).toEqual(new Date('2024-01-01'));
    });
  });

  // ── listBaselines ──────────────────────────────────────────

  describe('listBaselines', () => {
    it('should return all baselines ordered by metricType', async () => {
      const baselines = [
        fakeBaseline(),
        fakeBaseline({ id: 'baseline-2', metricType: 'navigation' }),
      ];
      mockPrisma.performanceBaseline.findMany.mockResolvedValue(baselines);

      const result = await listBaselines();

      expect(result).toHaveLength(2);
      expect(mockPrisma.performanceBaseline.findMany).toHaveBeenCalledWith({
        orderBy: { metricType: 'asc' },
      });
    });

    it('should return empty array when no baselines exist', async () => {
      mockPrisma.performanceBaseline.findMany.mockResolvedValue([]);

      const result = await listBaselines();

      expect(result).toEqual([]);
    });
  });

  // ── updateBaseline ──────────────────────────────────────────

  describe('updateBaseline', () => {
    it('should upsert a baseline for a metric type', async () => {
      mockPrisma.performanceBaseline.upsert.mockResolvedValue(fakeBaseline());

      const result = await updateBaseline('startup', {
        p50: 800,
        p75: 1200,
        p95: 2000,
        threshold: 2500,
      });

      expect(result.metricType).toBe('startup');
      expect(mockPrisma.performanceBaseline.upsert).toHaveBeenCalledWith({
        where: { metricType: 'startup' },
        create: {
          metricType: 'startup',
          p50: 800,
          p75: 1200,
          p95: 2000,
          threshold: 2500,
        },
        update: {
          p50: 800,
          p75: 1200,
          p95: 2000,
          threshold: 2500,
        },
      });
    });

    it('should create baseline if it does not exist', async () => {
      mockPrisma.performanceBaseline.upsert.mockResolvedValue(
        fakeBaseline({ metricType: 'media_load' })
      );

      const result = await updateBaseline('media_load', {
        p50: 500,
        p75: 800,
        p95: 1500,
        threshold: 2000,
      });

      expect(result.metricType).toBe('media_load');
    });
  });

  // ── detectRegressions ──────────────────────────────────────

  describe('detectRegressions', () => {
    it('should return empty array when no baselines exist', async () => {
      mockPrisma.performanceBaseline.findMany.mockResolvedValue([]);

      const result = await detectRegressions();

      expect(result).toEqual([]);
    });

    it('should detect regression when p95 exceeds threshold', async () => {
      mockPrisma.performanceBaseline.findMany.mockResolvedValue([
        fakeBaseline({ metricType: 'startup', p95: 2000, threshold: 2500 }),
      ]);

      // Recent metrics with high values (sorted ascending for percentile calc)
      const recentMetrics = [
        { value: 1000 },
        { value: 1500 },
        { value: 2000 },
        { value: 2500 },
        { value: 3000 },
        { value: 3500 },
        { value: 4000 },
        { value: 4500 },
        { value: 5000 },
        { value: 5500 },
      ];
      mockPrisma.performanceMetric.findMany.mockResolvedValue(recentMetrics);

      const result = await detectRegressions();

      expect(result).toHaveLength(1);
      expect(result[0].metricType).toBe('startup');
      expect(result[0].currentP95).toBeGreaterThan(2500);
      expect(result[0].baselineP95).toBe(2000);
      expect(result[0].threshold).toBe(2500);
      expect(result[0].exceededBy).toBeGreaterThan(0);
    });

    it('should not detect regression when p95 is within threshold', async () => {
      mockPrisma.performanceBaseline.findMany.mockResolvedValue([
        fakeBaseline({ metricType: 'startup', p95: 2000, threshold: 2500 }),
      ]);

      // Recent metrics with low values (all under threshold)
      const recentMetrics = [
        { value: 500 },
        { value: 600 },
        { value: 700 },
        { value: 800 },
        { value: 900 },
        { value: 1000 },
        { value: 1100 },
        { value: 1200 },
        { value: 1300 },
        { value: 1500 },
      ];
      mockPrisma.performanceMetric.findMany.mockResolvedValue(recentMetrics);

      const result = await detectRegressions();

      expect(result).toEqual([]);
    });

    it('should skip metric types with no recent data', async () => {
      mockPrisma.performanceBaseline.findMany.mockResolvedValue([
        fakeBaseline({ metricType: 'startup' }),
        fakeBaseline({ metricType: 'navigation' }),
      ]);

      // No recent metrics for any type
      mockPrisma.performanceMetric.findMany.mockResolvedValue([]);

      const result = await detectRegressions();

      expect(result).toEqual([]);
    });

    it('should detect regressions across multiple metric types', async () => {
      mockPrisma.performanceBaseline.findMany.mockResolvedValue([
        fakeBaseline({ metricType: 'startup', p95: 2000, threshold: 2500 }),
        fakeBaseline({ metricType: 'navigation', p95: 300, threshold: 500 }),
      ]);

      mockPrisma.performanceMetric.findMany
        .mockResolvedValueOnce([
          { value: 3000 }, { value: 3500 }, { value: 4000 },
        ]) // startup: p95 = 4000 > 2500 threshold
        .mockResolvedValueOnce([
          { value: 100 }, { value: 200 }, { value: 300 },
        ]); // navigation: p95 = 300 <= 500 threshold

      const result = await detectRegressions();

      expect(result).toHaveLength(1);
      expect(result[0].metricType).toBe('startup');
    });

    it('should round exceededBy to 2 decimal places', async () => {
      mockPrisma.performanceBaseline.findMany.mockResolvedValue([
        fakeBaseline({ metricType: 'startup', p95: 2000, threshold: 2500 }),
      ]);

      mockPrisma.performanceMetric.findMany.mockResolvedValue([
        { value: 2600.123 },
      ]);

      const result = await detectRegressions();

      expect(result).toHaveLength(1);
      // exceededBy should be rounded
      const exceededByStr = result[0].exceededBy.toString();
      const decimalPart = exceededByStr.split('.')[1];
      if (decimalPart) {
        expect(decimalPart.length).toBeLessThanOrEqual(2);
      }
    });

    it('should query recent metrics from last 24 hours', async () => {
      mockPrisma.performanceBaseline.findMany.mockResolvedValue([
        fakeBaseline({ metricType: 'startup' }),
      ]);
      mockPrisma.performanceMetric.findMany.mockResolvedValue([]);

      await detectRegressions();

      const call = mockPrisma.performanceMetric.findMany.mock.calls[0][0];
      expect(call.where.metricType).toBe('startup');
      expect(call.where.createdAt.gte).toBeInstanceOf(Date);
      expect(call.orderBy).toEqual({ value: 'asc' });
    });
  });
});
