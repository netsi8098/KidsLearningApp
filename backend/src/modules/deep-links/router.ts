import { Router, Request, Response } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { validate } from '../../lib/validate.js';
import {
  listDeepLinksSchema,
  createDeepLinkSchema,
  resolveDeepLinkSchema,
  getDeepLinkSchema,
  updateDeepLinkSchema,
  deleteDeepLinkSchema,
} from './schemas.js';
import type { ListDeepLinksQuery } from './schemas.js';
import * as deepLinksService from './service.js';

export const router = Router();

// ── GET /api/deep-links — list deep links (admin) ────────

router.get(
  '/',
  authenticate,
  requireRole('admin'),
  validate(listDeepLinksSchema),
  async (req: Request, res: Response) => {
    const query = (req as unknown as Record<string, unknown>).validatedQuery as ListDeepLinksQuery;
    const result = await deepLinksService.listDeepLinks(query);
    res.json(result);
  }
);

// ── POST /api/deep-links — create deep link (admin) ──────

router.post(
  '/',
  authenticate,
  requireRole('admin'),
  validate(createDeepLinkSchema),
  async (req: Request, res: Response) => {
    const deepLink = await deepLinksService.createDeepLink(req.body, req.user!.userId);
    res.status(201).json({ data: deepLink });
  }
);

// ── GET /api/deep-links/resolve/:shortCode — resolve (public) ──

router.get(
  '/resolve/:shortCode',
  validate(resolveDeepLinkSchema),
  async (req: Request, res: Response) => {
    const { shortCode } = req.params;
    const result = await deepLinksService.resolveDeepLink(shortCode as string);
    res.json({ data: result });
  }
);

// ── GET /api/deep-links/:id — deep link detail (admin) ───

router.get(
  '/:id',
  authenticate,
  requireRole('admin'),
  validate(getDeepLinkSchema),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const deepLink = await deepLinksService.getDeepLink(id as string);
    res.json({ data: deepLink });
  }
);

// ── PATCH /api/deep-links/:id — update deep link (admin) ─

router.patch(
  '/:id',
  authenticate,
  requireRole('admin'),
  validate(updateDeepLinkSchema),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const deepLink = await deepLinksService.updateDeepLink(id as string, req.body, req.user!.userId);
    res.json({ data: deepLink });
  }
);

// ── DELETE /api/deep-links/:id — delete deep link (admin) ─

router.delete(
  '/:id',
  authenticate,
  requireRole('admin'),
  validate(deleteDeepLinkSchema),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    await deepLinksService.deleteDeepLink(id as string, req.user!.userId);
    res.status(204).send();
  }
);

export default router;
