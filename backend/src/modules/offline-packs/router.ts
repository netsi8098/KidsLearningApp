import { Router, Request, Response } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { validate } from '../../lib/validate.js';
import {
  listPacksSchema,
  getPackSchema,
  createPackSchema,
  updatePackSchema,
  addPackItemSchema,
  removePackItemSchema,
  buildPackSchema,
  publishPackSchema,
  getPackManifestSchema,
} from './schemas.js';
import type {
  ListPacksQuery,
  CreatePackBody,
  UpdatePackBody,
  AddPackItemBody,
} from './schemas.js';
import * as offlinePacksService from './service.js';

const router = Router();

// ── GET /api/offline-packs ──────────────────────────────────
// List packs
router.get(
  '/',
  authenticate,
  validate(listPacksSchema),
  async (req: Request, res: Response) => {
    const query = (req as unknown as Record<string, unknown>).validatedQuery as ListPacksQuery;
    const result = await offlinePacksService.listPacks(query);
    res.json(result);
  }
);

// ── GET /api/offline-packs/:id ──────────────────────────────
// Get pack with items
router.get(
  '/:id',
  authenticate,
  validate(getPackSchema),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const pack = await offlinePacksService.getPack(id as string);
    res.json({ data: pack });
  }
);

// ── POST /api/offline-packs ─────────────────────────────────
// Create pack (editor+)
router.post(
  '/',
  authenticate,
  requireRole('admin', 'editor'),
  validate(createPackSchema),
  async (req: Request, res: Response) => {
    const body = req.body as CreatePackBody;
    const pack = await offlinePacksService.createPack(body);
    res.status(201).json({ data: pack });
  }
);

// ── PATCH /api/offline-packs/:id ────────────────────────────
// Update pack
router.patch(
  '/:id',
  authenticate,
  requireRole('admin', 'editor'),
  validate(updatePackSchema),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const body = req.body as UpdatePackBody;
    const pack = await offlinePacksService.updatePack(id as string, body);
    res.json({ data: pack });
  }
);

// ── POST /api/offline-packs/:id/items ───────────────────────
// Add content items to pack
router.post(
  '/:id/items',
  authenticate,
  requireRole('admin', 'editor'),
  validate(addPackItemSchema),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const body = req.body as AddPackItemBody;
    const item = await offlinePacksService.addPackItem(id as string, body);
    res.status(201).json({ data: item });
  }
);

// ── DELETE /api/offline-packs/:id/items/:itemId ─────────────
// Remove item from pack
router.delete(
  '/:id/items/:itemId',
  authenticate,
  requireRole('admin', 'editor'),
  validate(removePackItemSchema),
  async (req: Request, res: Response) => {
    const { id, itemId } = req.params;
    await offlinePacksService.removePackItem(id as string, itemId as string);
    res.status(204).send();
  }
);

// ── POST /api/offline-packs/:id/build ───────────────────────
// Trigger pack build (queued)
router.post(
  '/:id/build',
  authenticate,
  requireRole('admin', 'editor'),
  validate(buildPackSchema),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await offlinePacksService.buildPack(id as string);
    res.json({ data: result, message: 'Pack build queued' });
  }
);

// ── POST /api/offline-packs/:id/publish ─────────────────────
// Publish pack
router.post(
  '/:id/publish',
  authenticate,
  requireRole('admin'),
  validate(publishPackSchema),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const pack = await offlinePacksService.publishPack(id as string);
    res.json({ data: pack });
  }
);

// ── GET /api/offline-packs/:id/manifest ─────────────────────
// Get pack manifest for client download
router.get(
  '/:id/manifest',
  authenticate,
  validate(getPackManifestSchema),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const manifest = await offlinePacksService.generateManifest(id as string);
    res.json({ data: manifest });
  }
);

export default router;
