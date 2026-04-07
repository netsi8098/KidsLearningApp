import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { validate } from '../../lib/validate.js';
import {
  listAssetsSchema,
  getAssetSchema,
  createAssetSchema,
  updateAssetSchema,
  deleteAssetSchema,
  approveAssetSchema,
  campaignNameSchema,
} from './schemas.js';
import type { ListAssetsQuery, CreateAssetInput, UpdateAssetInput } from './schemas.js';
import * as merchandisingService from './service.js';

const router = Router();

// All merchandising routes require authentication + admin role
router.use(authenticate);
router.use(requireRole('admin'));

// ── GET /api/merchandising/campaigns ──────────────────────
// List unique campaigns with asset counts
// NOTE: must be before /:id to avoid matching "campaigns" as an id
router.get(
  '/campaigns',
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const campaigns = await merchandisingService.listCampaigns();
      res.json({ data: campaigns });
    } catch (error) {
      next(error);
    }
  }
);

// ── GET /api/merchandising/campaigns/:name ────────────────
// Get all assets for a campaign
router.get(
  '/campaigns/:name',
  validate(campaignNameSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const assets = await merchandisingService.getCampaignAssets(req.params.name as string);
      res.json({ data: assets });
    } catch (error) {
      next(error);
    }
  }
);

// ── GET /api/merchandising ────────────────────────────────
// List merchandising assets with filters
router.get(
  '/',
  validate(listAssetsSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = (req as unknown as Record<string, unknown>).validatedQuery as ListAssetsQuery;
      const result = await merchandisingService.listAssets(query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// ── GET /api/merchandising/:id ────────────────────────────
// Get asset detail
router.get(
  '/:id',
  validate(getAssetSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const asset = await merchandisingService.getAsset(req.params.id as string);
      res.json({ data: asset });
    } catch (error) {
      next(error);
    }
  }
);

// ── POST /api/merchandising ──────────────────────────────
// Create merchandising asset
router.post(
  '/',
  validate(createAssetSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = req.body as CreateAssetInput;
      const asset = await merchandisingService.createAsset(body, req.user!.userId);
      res.status(201).json({ data: asset });
    } catch (error) {
      next(error);
    }
  }
);

// ── PATCH /api/merchandising/:id ──────────────────────────
// Update asset metadata/status
router.patch(
  '/:id',
  validate(updateAssetSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = req.body as UpdateAssetInput;
      const asset = await merchandisingService.updateAsset(req.params.id as string, body, req.user!.userId);
      res.json({ data: asset });
    } catch (error) {
      next(error);
    }
  }
);

// ── DELETE /api/merchandising/:id ─────────────────────────
// Soft-delete asset
router.delete(
  '/:id',
  validate(deleteAssetSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await merchandisingService.deleteAsset(req.params.id as string, req.user!.userId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

// ── POST /api/merchandising/:id/approve ───────────────────
// Approve asset (sets status="approved")
router.post(
  '/:id/approve',
  validate(approveAssetSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const asset = await merchandisingService.approveAsset(req.params.id as string, req.user!.userId);
      res.json({ data: asset });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
