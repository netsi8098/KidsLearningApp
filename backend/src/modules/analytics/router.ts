import { Router } from 'express';
import { validate } from '../../lib/validate.js';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { analyticsQueue } from '../../lib/queue.js';
import * as analyticsService from './service.js';
import {
  recordEventSchema,
  contentAnalyticsSchema,
  dashboardSchema,
  topContentSchema,
  engagementSchema,
  aggregateSchema,
  exportSchema,
  slaDashboardSchema,
  slaPipelineFunnelSchema,
  slaBottlenecksSchema,
  slaAgingSchema,
} from './schemas.js';

const router = Router();

// ── POST /api/analytics/event — record an analytics event ──

router.post('/event', authenticate, validate(recordEventSchema), async (req, res) => {
  const { contentId, metric, value, timeMs } = req.body;
  await analyticsService.recordEvent(contentId, metric, value, timeMs);
  res.status(201).json({ success: true });
});

// ── GET /api/analytics/content/:contentId — content analytics

router.get('/content/:contentId', authenticate, validate(contentAnalyticsSchema), async (req, res) => {
  const { contentId } = req.params;
  const query = (req as any).validatedQuery ?? req.query;
  const { period, from, to } = query;

  const data = await analyticsService.getContentAnalytics(contentId as string, period, from, to);
  res.json({ data });
});

// ── GET /api/analytics/dashboard — aggregate dashboard ─────

router.get('/dashboard', authenticate, validate(dashboardSchema), async (req, res) => {
  const query = (req as any).validatedQuery ?? req.query;
  const { from, to, period } = query;

  const dateRange = (from || to) ? { from, to } : undefined;
  const data = await analyticsService.getDashboard(dateRange, period);
  res.json({ data });
});

// ── GET /api/analytics/top — top content by metric ─────────

router.get('/top', authenticate, validate(topContentSchema), async (req, res) => {
  const query = (req as any).validatedQuery ?? req.query;
  const { metric, limit, period, from, to } = query;

  const data = await analyticsService.getTopContent(metric, limit, period, from, to);
  res.json({ data });
});

// ── GET /api/analytics/engagement — engagement metrics ─────

router.get('/engagement', authenticate, validate(engagementSchema), async (req, res) => {
  const query = (req as any).validatedQuery ?? req.query;
  const { period, from, to } = query;

  const data = await analyticsService.getEngagement(period, from, to);
  res.json({ data });
});

// ── POST /api/analytics/aggregate — trigger aggregation job ─

router.post(
  '/aggregate',
  authenticate,
  requireRole('admin'),
  validate(aggregateSchema),
  async (req, res) => {
    // Queue the aggregation job for background processing
    await analyticsQueue.add('aggregate', { triggeredAt: new Date().toISOString() });

    // Also run inline for immediate feedback
    const result = await analyticsService.aggregateAnalytics();
    res.json({
      success: true,
      message: 'Aggregation completed',
      aggregated: result,
    });
  }
);

// ── GET /api/analytics/export — export analytics as CSV ────

router.get('/export', authenticate, requireRole('admin', 'editor'), validate(exportSchema), async (req, res) => {
  const query = (req as any).validatedQuery ?? req.query;
  const { from, to, period, contentType, metric } = query;

  const csv = await analyticsService.exportCSV({ from, to, period, contentType, metric });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="analytics-${period}-${new Date().toISOString().split('T')[0]}.csv"`);
  res.send(csv);
});

// ── SLA Dashboard Endpoints ──────────────────────────────

// GET /api/analytics/sla — SLA dashboard overview
router.get('/sla', authenticate, requireRole('admin', 'editor'), validate(slaDashboardSchema), async (req, res) => {
  const query = (req as any).validatedQuery ?? req.query;
  const data = await analyticsService.getSLADashboard(query.from, query.to);
  res.json({ data });
});

// GET /api/analytics/sla/funnel — pipeline funnel
router.get('/sla/funnel', authenticate, requireRole('admin', 'editor'), validate(slaPipelineFunnelSchema), async (req, res) => {
  const query = (req as any).validatedQuery ?? req.query;
  const data = await analyticsService.getSLAPipelineFunnel(query.from, query.to);
  res.json({ data });
});

// GET /api/analytics/sla/bottlenecks — stuck content items
router.get('/sla/bottlenecks', authenticate, requireRole('admin', 'editor'), validate(slaBottlenecksSchema), async (req, res) => {
  const query = (req as any).validatedQuery ?? req.query;
  const data = await analyticsService.getSLABottlenecks(query.limit ?? 10);
  res.json({ data });
});

// GET /api/analytics/sla/aging — aging content by stage
router.get('/sla/aging', authenticate, requireRole('admin', 'editor'), validate(slaAgingSchema), async (req, res) => {
  const query = (req as any).validatedQuery ?? req.query;
  const data = await analyticsService.getSLAAging(query.stage, query.daysThreshold ?? 7);
  res.json({ data });
});

export default router;
