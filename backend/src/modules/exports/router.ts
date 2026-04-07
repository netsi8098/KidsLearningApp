import { Router } from 'express';
import { validate } from '../../lib/validate.js';
import { authenticate, requireRole } from '../../middleware/auth.js';
import * as exportsService from './service.js';
import {
  listExportJobsSchema,
  createExportJobSchema,
  getExportJobSchema,
  downloadExportSchema,
  cancelExportJobSchema,
} from './schemas.js';

const router = Router();

// ── GET /api/exports/dictionary — data dictionary ─────────

router.get(
  '/dictionary',
  authenticate,
  requireRole('admin'),
  async (_req, res) => {
    const dictionary = exportsService.getDataDictionary();
    res.json({ data: dictionary });
  }
);

// ── GET /api/exports — list export jobs ───────────────────

router.get('/', authenticate, requireRole('admin'), validate(listExportJobsSchema), async (req, res) => {
  const query = (req as any).validatedQuery ?? req.query;
  const { page, limit, sortBy, sortOrder, type, status } = query;

  const results = await exportsService.listExportJobs(
    { type, status },
    { page, limit, sortBy, sortOrder }
  );

  res.json(results);
});

// ── POST /api/exports — create export job ─────────────────

router.post(
  '/',
  authenticate,
  requireRole('admin'),
  validate(createExportJobSchema),
  async (req, res) => {
    const { type, filters, format } = req.body;
    const exportJob = await exportsService.createExportJob(
      { type, filters, format },
      req.user!.userId
    );
    res.status(201).json({ data: exportJob });
  }
);

// ── GET /api/exports/:id/download — download export file ──

router.get(
  '/:id/download',
  authenticate,
  requireRole('admin'),
  validate(downloadExportSchema),
  async (req, res) => {
    const { id } = req.params;
    const fileUrl = await exportsService.getExportDownloadUrl(id as string);
    res.json({ data: { fileUrl } });
  }
);

// ── GET /api/exports/:id — export job detail ──────────────

router.get(
  '/:id',
  authenticate,
  requireRole('admin'),
  validate(getExportJobSchema),
  async (req, res) => {
    const { id } = req.params;
    const exportJob = await exportsService.getExportJob(id as string);
    res.json({ data: exportJob });
  }
);

// ── DELETE /api/exports/:id — cancel export job ───────────

router.delete(
  '/:id',
  authenticate,
  requireRole('admin'),
  validate(cancelExportJobSchema),
  async (req, res) => {
    const { id } = req.params;
    const exportJob = await exportsService.cancelExportJob(id as string, req.user!.userId);
    res.json({ data: exportJob });
  }
);

export default router;
