import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { validate } from '../../lib/validate.js';
import {
  reportErrorSchema,
  listErrorGroupsSchema,
  getErrorGroupSchema,
  updateErrorGroupSchema,
  listOccurrencesSchema,
  errorStatsSchema,
  evaluateQualityGatesSchema,
} from './schemas.js';
import * as errorsService from './service.js';

const router = Router();

// ── POST /api/errors/report — report error from frontend (public) ──

router.post(
  '/report',
  validate(reportErrorSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await errorsService.reportError(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
);

// ── GET /api/errors/groups — list error groups (admin) ──────────────

router.get(
  '/groups',
  authenticate,
  requireRole('admin'),
  validate(listErrorGroupsSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = (req as unknown as Record<string, unknown>).validatedQuery as Parameters<typeof errorsService.listErrorGroups>[0];
      const result = await errorsService.listErrorGroups(query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// ── GET /api/errors/stats — error stats (admin) ────────────────────

router.get(
  '/stats',
  authenticate,
  requireRole('admin'),
  validate(errorStatsSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = (req as unknown as Record<string, unknown>).validatedQuery as Parameters<typeof errorsService.getErrorStats>[0];
      const result = await errorsService.getErrorStats(query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// ── GET /api/errors/quality-gates — quality gate status (admin) ────

router.get(
  '/quality-gates',
  authenticate,
  requireRole('admin'),
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await errorsService.getQualityGateStatus();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// ── POST /api/errors/quality-gates/evaluate — evaluate quality gates (admin) ──

router.post(
  '/quality-gates/evaluate',
  authenticate,
  requireRole('admin'),
  validate(evaluateQualityGatesSchema),
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await errorsService.evaluateQualityGates();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// ── GET /api/errors/groups/:id — group detail (admin) ──────────────

router.get(
  '/groups/:id',
  authenticate,
  requireRole('admin'),
  validate(getErrorGroupSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await errorsService.getErrorGroup(req.params.id as string);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// ── PATCH /api/errors/groups/:id — update group status/assignee (admin) ──

router.patch(
  '/groups/:id',
  authenticate,
  requireRole('admin'),
  validate(updateErrorGroupSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await errorsService.updateErrorGroup(req.params.id as string, req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// ── GET /api/errors/groups/:id/occurrences — list occurrences (admin) ──

router.get(
  '/groups/:id/occurrences',
  authenticate,
  requireRole('admin'),
  validate(listOccurrencesSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = (req as unknown as Record<string, unknown>).validatedQuery as Parameters<typeof errorsService.listOccurrences>[1];
      const result = await errorsService.listOccurrences(req.params.id as string, query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
