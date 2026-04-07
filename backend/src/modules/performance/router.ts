import { Router } from 'express';
import { validate } from '../../lib/validate.js';
import { authenticate, requireRole } from '../../middleware/auth.js';
import * as performanceService from './service.js';
import {
  ingestSchema,
  aggregatedMetricsSchema,
  metricsByTypeSchema,
  listBaselinesSchema,
  updateBaselineSchema,
  detectRegressionsSchema,
} from './schemas.js';

const router = Router();

// ── POST /api/performance/ingest — ingest metric batch (public) ──

router.post('/ingest', validate(ingestSchema), async (req, res) => {
  const { metrics } = req.body;
  const result = await performanceService.ingestMetrics(metrics);
  res.status(201).json({ success: true, ...result });
});

// ── GET /api/performance/metrics — aggregated metrics (admin) ────

router.get(
  '/metrics',
  authenticate,
  requireRole('admin'),
  validate(aggregatedMetricsSchema),
  async (req, res) => {
    const query = (req as any).validatedQuery ?? req.query;
    const { metricType, from, to, groupBy } = query;

    const data = await performanceService.getAggregatedMetrics(metricType, from, to, groupBy);
    res.json({ data });
  }
);

// ── GET /api/performance/metrics/:type — raw metrics by type (admin) ──

router.get(
  '/metrics/:type',
  authenticate,
  requireRole('admin'),
  validate(metricsByTypeSchema),
  async (req, res) => {
    const params = (req as any).validatedParams ?? req.params;
    const query = (req as any).validatedQuery ?? req.query;
    const { from, to, limit } = query;

    const data = await performanceService.getMetricsByType(params.type, from, to, limit);
    res.json({ data });
  }
);

// ── GET /api/performance/baselines — list all baselines (admin) ──

router.get(
  '/baselines',
  authenticate,
  requireRole('admin'),
  validate(listBaselinesSchema),
  async (_req, res) => {
    const data = await performanceService.listBaselines();
    res.json({ data });
  }
);

// ── PUT /api/performance/baselines/:type — update baseline (admin) ──

router.put(
  '/baselines/:type',
  authenticate,
  requireRole('admin'),
  validate(updateBaselineSchema),
  async (req, res) => {
    const params = (req as any).validatedParams ?? req.params;
    const { p50, p75, p95, threshold } = req.body;

    const data = await performanceService.updateBaseline(params.type, { p50, p75, p95, threshold });
    res.json({ data });
  }
);

// ── GET /api/performance/regressions — detect regressions (admin) ──

router.get(
  '/regressions',
  authenticate,
  requireRole('admin'),
  validate(detectRegressionsSchema),
  async (_req, res) => {
    const data = await performanceService.detectRegressions();
    res.json({ data, hasRegressions: data.length > 0 });
  }
);

export default router;
