import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { validate } from '../../lib/validate.js';
import {
  listReleasesSchema,
  getReleaseSchema,
  createReleaseSchema,
  updateReleaseSchema,
  executeReleaseSchema,
  calendarSchema,
  batchCreateSchema,
} from './schemas.js';
import * as releaseService from './service.js';

const router = Router();

// All release routes require authentication
router.use(authenticate);

// ── GET /api/releases ─────────────────────────────────────
// List releases with filters
router.get(
  '/',
  validate(listReleasesSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = (req as unknown as Record<string, unknown>).validatedQuery as Parameters<typeof releaseService.listReleases>[0];
      const result = await releaseService.listReleases(query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// ── GET /api/releases/calendar ────────────────────────────
// Get releases by date range for calendar view
// NOTE: this route must be before /:id to avoid matching "calendar" as an id
router.get(
  '/calendar',
  validate(calendarSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = (req as unknown as Record<string, unknown>).validatedQuery as Parameters<typeof releaseService.getCalendar>[0];
      const calendar = await releaseService.getCalendar(query);
      res.json(calendar);
    } catch (error) {
      next(error);
    }
  }
);

// ── GET /api/releases/:id ─────────────────────────────────
// Get release details
router.get(
  '/:id',
  validate(getReleaseSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const release = await releaseService.getRelease(req.params.id as string);
      res.json(release);
    } catch (error) {
      next(error);
    }
  }
);

// ── POST /api/releases ────────────────────────────────────
// Create release (schedule or immediate)
router.post(
  '/',
  requireRole('editor', 'admin'),
  validate(createReleaseSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const release = await releaseService.createRelease(req.body, req.user!.userId);
      res.status(201).json(release);
    } catch (error) {
      next(error);
    }
  }
);

// ── PATCH /api/releases/:id ───────────────────────────────
// Update release (cancel, reschedule)
router.patch(
  '/:id',
  requireRole('editor', 'admin'),
  validate(updateReleaseSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const release = await releaseService.updateRelease(req.params.id as string, req.body);
      res.json(release);
    } catch (error) {
      next(error);
    }
  }
);

// ── POST /api/releases/:id/execute ────────────────────────
// Manually execute a release
router.post(
  '/:id/execute',
  requireRole('editor', 'admin'),
  validate(executeReleaseSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const release = await releaseService.executeReleaseAction(req.params.id as string);
      res.json(release);
    } catch (error) {
      next(error);
    }
  }
);

// ── POST /api/releases/batch ──────────────────────────────
// Batch create releases for multiple content items
router.post(
  '/batch',
  requireRole('editor', 'admin'),
  validate(batchCreateSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await releaseService.batchCreateReleases(req.body, req.user!.userId);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
