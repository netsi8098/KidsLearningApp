import { Router } from 'express';
import { validate } from '../../lib/validate.js';
import { authenticate, requireRole } from '../../middleware/auth.js';
import * as dedupService from './service.js';
import {
  scanSchema,
  getSimilarSchema,
  compareSchema,
  getClustersSchema,
  resolveSchema,
  dedupStatsSchema,
} from './schemas.js';

const router = Router();

// ── POST /api/dedup/scan ──────────────────────────────────

router.post(
  '/scan',
  authenticate,
  requireRole('admin', 'editor'),
  validate(scanSchema),
  async (req, res) => {
    const { contentId, threshold } = req.body;
    const result = await dedupService.scanForSimilarity(contentId, threshold);
    res.json(result);
  }
);

// ── GET /api/dedup/similar/:contentId ─────────────────────

router.get(
  '/similar/:contentId',
  authenticate,
  validate(getSimilarSchema),
  async (req, res) => {
    const query = (req as unknown as Record<string, unknown>).validatedQuery as {
      threshold: number;
      page: number;
      limit: number;
    };

    const result = await dedupService.getSimilar(
      req.params.contentId as string,
      query.threshold,
      query.page,
      query.limit
    );
    res.json(result);
  }
);

// ── POST /api/dedup/compare ───────────────────────────────

router.post(
  '/compare',
  authenticate,
  validate(compareSchema),
  async (req, res) => {
    const { contentIdA, contentIdB } = req.body;
    const result = await dedupService.compareTwo(contentIdA, contentIdB);
    res.json(result);
  }
);

// ── GET /api/dedup/clusters ───────────────────────────────

router.get(
  '/clusters',
  authenticate,
  validate(getClustersSchema),
  async (req, res) => {
    const query = (req as unknown as Record<string, unknown>).validatedQuery as {
      threshold: number;
    };

    const clusters = await dedupService.getClusters(query.threshold);
    res.json({ clusters, total: clusters.length });
  }
);

// ── POST /api/dedup/resolve ───────────────────────────────

router.post(
  '/resolve',
  authenticate,
  requireRole('admin', 'editor'),
  validate(resolveSchema),
  async (req, res) => {
    const { contentIdA, contentIdB, action, keepId } = req.body;
    const result = await dedupService.resolvePair(
      contentIdA,
      contentIdB,
      action,
      keepId
    );
    res.json(result);
  }
);

// ── GET /api/dedup/stats ──────────────────────────────────

router.get(
  '/stats',
  authenticate,
  validate(dedupStatsSchema),
  async (_req, res) => {
    const stats = await dedupService.getStats();
    res.json(stats);
  }
);

export default router;
