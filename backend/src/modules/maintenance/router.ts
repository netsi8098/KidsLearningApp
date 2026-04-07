import { Router } from 'express';
import { validate } from '../../lib/validate.js';
import { authenticate, requireRole } from '../../middleware/auth.js';
import * as maintenanceService from './service.js';
import {
  listJobsSchema,
  runJobSchema,
  jobHistorySchema,
  jobDetailSchema,
} from './schemas.js';

const router = Router();

// ── GET / — list all maintenance jobs ─────────────────────

router.get(
  '/',
  authenticate,
  requireRole('admin'),
  validate(listJobsSchema),
  async (req, res) => {
    const query = (req as any).validatedQuery ?? req.query;
    const result = maintenanceService.listJobs(query.status);
    res.json({ data: result });
  }
);

// ── GET /:jobId — get job detail ──────────────────────────

router.get(
  '/:jobId',
  authenticate,
  requireRole('admin'),
  validate(jobDetailSchema),
  async (req, res) => {
    const result = maintenanceService.getJob(req.params.jobId as string);
    res.json(result);
  }
);

// ── POST /:jobId/run — run a maintenance job ─────────────

router.post(
  '/:jobId/run',
  authenticate,
  requireRole('admin'),
  validate(runJobSchema),
  async (req, res) => {
    const { dryRun, params } = req.body;
    const result = await maintenanceService.runJob(
      req.params.jobId as string,
      dryRun,
      params ?? {},
      req.user?.userId
    );
    res.json(result);
  }
);

// ── GET /:jobId/history — get run history for a job ───────

router.get(
  '/:jobId/history',
  authenticate,
  requireRole('admin'),
  validate(jobHistorySchema),
  async (req, res) => {
    const query = (req as any).validatedQuery ?? req.query;
    const result = maintenanceService.getJobHistory(
      req.params.jobId as string,
      query.page ?? 1,
      query.limit ?? 20
    );
    res.json(result);
  }
);

export default router;
