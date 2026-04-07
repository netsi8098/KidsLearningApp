import { Router } from 'express';
import { validate } from '../../lib/validate.js';
import { authenticate, requireRole } from '../../middleware/auth.js';
import * as systemService from './service.js';
import {
  healthCheckSchema,
  queueStatsSchema,
  jobDetailSchema,
  retryJobSchema,
  cancelJobSchema,
  systemInfoSchema,
  dbStatsSchema,
  clearCacheSchema,
} from './schemas.js';

const router = Router();

// ── GET /api/system/health — health check (public) ────────

router.get('/health', validate(healthCheckSchema), async (_req, res) => {
  const data = await systemService.getHealthCheck();
  res.json({ data });
});

// ── GET /api/system/info — system info (admin) ────────────

router.get('/info', authenticate, requireRole('admin'), validate(systemInfoSchema), async (_req, res) => {
  const data = await systemService.getSystemInfo();
  res.json({ data });
});

// ── GET /api/system/db-stats — database statistics (admin)

router.get('/db-stats', authenticate, requireRole('admin'), validate(dbStatsSchema), async (_req, res) => {
  const data = await systemService.getDbStats();
  res.json({ data });
});

// ── GET /api/system/queues — queue stats (admin) ──────────

router.get('/queues', authenticate, requireRole('admin'), validate(queueStatsSchema), async (req, res) => {
  const query = (req as any).validatedQuery ?? req.query;
  const data = await systemService.getQueueStats(query.queue);
  res.json({ data });
});

// ── GET /api/system/queues/:queue/jobs/:jobId — job detail (admin)

router.get(
  '/queues/:queue/jobs/:jobId',
  authenticate,
  requireRole('admin'),
  validate(jobDetailSchema),
  async (req, res) => {
    const params = (req as any).validatedParams ?? req.params;
    const data = await systemService.getJobDetail(params.queue, params.jobId);
    res.json({ data });
  }
);

// ── POST /api/system/queues/:queue/jobs/:jobId/retry — retry job (admin)

router.post(
  '/queues/:queue/jobs/:jobId/retry',
  authenticate,
  requireRole('admin'),
  validate(retryJobSchema),
  async (req, res) => {
    const params = (req as any).validatedParams ?? req.params;
    const data = await systemService.retryJob(params.queue, params.jobId);
    res.json({ data });
  }
);

// ── POST /api/system/queues/:queue/jobs/:jobId/cancel — cancel job (admin)

router.post(
  '/queues/:queue/jobs/:jobId/cancel',
  authenticate,
  requireRole('admin'),
  validate(cancelJobSchema),
  async (req, res) => {
    const params = (req as any).validatedParams ?? req.params;
    const data = await systemService.cancelJob(params.queue, params.jobId);
    res.json({ data });
  }
);

// ── POST /api/system/cache/clear — clear cache (admin) ────

router.post('/cache/clear', authenticate, requireRole('admin'), validate(clearCacheSchema), async (req, res) => {
  const { pattern } = req.body;
  const data = await systemService.clearCache(pattern);
  res.json({ data });
});

export default router;
