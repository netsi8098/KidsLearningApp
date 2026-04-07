import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { validate } from '../../lib/validate.js';
import {
  runQASchema,
  getQAResultsSchema,
  batchQASchema,
  dashboardSchema,
} from './schemas.js';
import * as qaService from './service.js';

const router = Router();

// All QA routes require authentication
router.use(authenticate);

// ── GET /api/qa/checks ────────────────────────────────────
// List available QA checks
router.get(
  '/checks',
  (_req: Request, res: Response) => {
    const checks = qaService.listAvailableChecks();
    res.json(checks);
  }
);

// ── GET /api/qa/dashboard ─────────────────────────────────
// QA dashboard stats (pass rates, common failures)
router.get(
  '/dashboard',
  validate(dashboardSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = (req as unknown as Record<string, unknown>).validatedQuery as {
        from?: string;
        to?: string;
        contentType?: string;
      } | undefined;
      const stats = await qaService.getDashboardStats(query);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }
);

// ── POST /api/qa/run/:contentId ───────────────────────────
// Run all QA checks on a content item
router.post(
  '/run/:contentId',
  requireRole('editor', 'reviewer', 'admin'),
  validate(runQASchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await qaService.runAllChecks(req.params.contentId as string);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// ── GET /api/qa/results/:contentId ────────────────────────
// Get QA results for content
router.get(
  '/results/:contentId',
  validate(getQAResultsSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = (req as unknown as Record<string, unknown>).validatedQuery as {
        severity?: string;
        passed?: boolean;
      } | undefined;
      const results = await qaService.getQAResults(req.params.contentId as string, query);
      res.json(results);
    } catch (error) {
      next(error);
    }
  }
);

// ── POST /api/qa/batch ────────────────────────────────────
// Run QA on multiple content items (queued)
router.post(
  '/batch',
  requireRole('editor', 'reviewer', 'admin'),
  validate(batchQASchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await qaService.batchRunQA(req.body.contentIds);
      res.status(202).json(result);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
