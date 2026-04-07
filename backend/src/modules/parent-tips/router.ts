import { Router, Request, Response } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { validate } from '../../lib/validate.js';
import {
  listTipsSchema,
  getTipBySlugSchema,
  createTipSchema,
  updateTipSchema,
  deleteTipSchema,
  saveTipSchema,
} from './schemas.js';
import * as tipService from './service.js';

const router = Router();

// ── GET /api/parent-tips — List tips with pagination and filters ──
// Public: no auth required for reading published tips.

router.get(
  '/',
  validate(listTipsSchema),
  async (req: Request, res: Response) => {
    const query = (req as unknown as Record<string, unknown>).validatedQuery as {
      page: number;
      limit: number;
      sortBy?: string;
      sortOrder: 'asc' | 'desc';
      category?: string;
      ageGroup?: string;
      format?: string;
      published?: boolean;
    };

    const result = await tipService.listTips({
      page: query.page,
      limit: query.limit,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      category: query.category,
      ageGroup: query.ageGroup,
      format: query.format,
      published: query.published,
    });

    res.json(result);
  }
);

// ── GET /api/parent-tips/:slug — Get tip detail by slug ───
// Public: no auth required.

router.get(
  '/:slug',
  validate(getTipBySlugSchema),
  async (req: Request, res: Response) => {
    const tip = await tipService.getTipBySlug(req.params.slug as string);
    res.json(tip);
  }
);

// ── POST /api/parent-tips — Create tip (admin/editor) ─────

router.post(
  '/',
  authenticate,
  requireRole('admin', 'editor'),
  validate(createTipSchema),
  async (req: Request, res: Response) => {
    const tip = await tipService.createTip(req.body, req.user!.userId);
    res.status(201).json(tip);
  }
);

// ── PATCH /api/parent-tips/:id — Update tip (admin/editor) ─

router.patch(
  '/:id',
  authenticate,
  requireRole('admin', 'editor'),
  validate(updateTipSchema),
  async (req: Request, res: Response) => {
    const tip = await tipService.updateTip(req.params.id as string, req.body, req.user!.userId);
    res.json(tip);
  }
);

// ── DELETE /api/parent-tips/:id — Soft-delete (admin only) ─

router.delete(
  '/:id',
  authenticate,
  requireRole('admin'),
  validate(deleteTipSchema),
  async (req: Request, res: Response) => {
    const result = await tipService.deleteTip(req.params.id as string, req.user!.userId);
    res.json(result);
  }
);

// ── POST /api/parent-tips/:id/save — Save/unsave tip ──────
// No auth for now — returns success for future use.

router.post(
  '/:id/save',
  validate(saveTipSchema),
  async (req: Request, res: Response) => {
    const result = await tipService.saveTip(req.params.id as string);
    res.json(result);
  }
);

export default router;
