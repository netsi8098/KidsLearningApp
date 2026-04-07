import { Router } from 'express';
import { validate } from '../../lib/validate.js';
import { authenticate, requireRole } from '../../middleware/auth.js';
import * as flagsService from './service.js';
import {
  listFlagsSchema,
  getFlagSchema,
  createFlagSchema,
  updateFlagSchema,
  deleteFlagSchema,
  killFlagSchema,
  evaluateBatchSchema,
  evaluateSingleSchema,
} from './schemas.js';

export const router = Router();

// ── GET /api/feature-flags — list all flags (admin) ──────

router.get(
  '/',
  authenticate,
  requireRole('admin'),
  validate(listFlagsSchema),
  async (req, res) => {
    const query = (req as any).validatedQuery ?? req.query;
    const { page, limit, sortBy, sortOrder, enabled } = query;

    const results = await flagsService.listFlags(
      { enabled },
      { page, limit, sortBy, sortOrder }
    );

    res.json(results);
  }
);

// ── GET /api/feature-flags/evaluate/:key — evaluate single flag ──

router.get(
  '/evaluate/:key',
  validate(evaluateSingleSchema),
  async (req, res) => {
    const { key } = req.params;
    const query = (req as any).validatedQuery ?? req.query;

    const result = await flagsService.evaluateSingle(key as string, query);
    res.json({ data: result });
  }
);

// ── GET /api/feature-flags/:key — get flag by key ────────

router.get(
  '/:key',
  authenticate,
  validate(getFlagSchema),
  async (req, res) => {
    const { key } = req.params;
    const flag = await flagsService.getFlag(key as string);
    res.json({ data: flag });
  }
);

// ── POST /api/feature-flags/evaluate — batch evaluate ────

router.post(
  '/evaluate',
  validate(evaluateBatchSchema),
  async (req, res) => {
    const { keys, context } = req.body;
    const results = await flagsService.evaluateBatch(keys, context);
    res.json({ data: results });
  }
);

// ── POST /api/feature-flags — create flag (admin) ────────

router.post(
  '/',
  authenticate,
  requireRole('admin'),
  validate(createFlagSchema),
  async (req, res) => {
    const flag = await flagsService.createFlag(req.body, req.user!.userId);
    res.status(201).json({ data: flag });
  }
);

// ── POST /api/feature-flags/:key/kill — emergency kill ───

router.post(
  '/:key/kill',
  authenticate,
  requireRole('admin'),
  validate(killFlagSchema),
  async (req, res) => {
    const { key } = req.params;
    const flag = await flagsService.killFlag(key as string, req.user!.userId);
    res.json({ data: flag });
  }
);

// ── PATCH /api/feature-flags/:key — update flag (admin) ──

router.patch(
  '/:key',
  authenticate,
  requireRole('admin'),
  validate(updateFlagSchema),
  async (req, res) => {
    const { key } = req.params;
    const flag = await flagsService.updateFlag(key as string, req.body, req.user!.userId);
    res.json({ data: flag });
  }
);

// ── DELETE /api/feature-flags/:key — soft-delete (admin) ─

router.delete(
  '/:key',
  authenticate,
  requireRole('admin'),
  validate(deleteFlagSchema),
  async (req, res) => {
    const { key } = req.params;
    const result = await flagsService.deleteFlag(key as string, req.user!.userId);
    res.json(result);
  }
);

export default router;
