import { Router, Request, Response } from 'express';
import multer from 'multer';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { validate } from '../../lib/validate.js';
import {
  uploadMediaSchema,
  getAssetSchema,
  getSignedUrlSchema,
  deleteAssetSchema,
  processAssetSchema,
  listAssetsSchema,
  updateAssetSchema,
  MAX_FILE_SIZE_BYTES,
} from './schemas.js';
import type {
  UploadMediaBody,
  UpdateAssetBody,
  ListAssetsQuery,
  ProcessAssetBody,
} from './schemas.js';
import * as mediaService from './service.js';

const router = Router();

// ── Multer Configuration ────────────────────────────────────
// Use memory storage so we get a Buffer to pass to the storage provider
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: 1,
  },
});

// ── POST /api/media/upload ──────────────────────────────────
// Upload file (multipart)
router.post(
  '/upload',
  authenticate,
  requireRole('admin', 'editor'),
  upload.single('file'),
  validate(uploadMediaSchema),
  async (req: Request, res: Response) => {
    const file = req.file;
    if (!file) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'No file provided. Use the "file" field in multipart form data.',
        },
      });
      return;
    }

    const body = req.body as UploadMediaBody;
    const asset = await mediaService.uploadAsset(
      {
        originalname: file.originalname,
        mimetype: file.mimetype,
        buffer: file.buffer,
        size: file.size,
      },
      body
    );

    res.status(201).json({ data: asset });
  }
);

// ── GET /api/media ──────────────────────────────────────────
// List assets with filters
router.get(
  '/',
  authenticate,
  validate(listAssetsSchema),
  async (req: Request, res: Response) => {
    const query = (req as unknown as Record<string, unknown>).validatedQuery as ListAssetsQuery;
    const result = await mediaService.listAssets(query);
    res.json(result);
  }
);

// ── GET /api/media/:id ──────────────────────────────────────
// Get asset metadata
router.get(
  '/:id',
  authenticate,
  validate(getAssetSchema),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const asset = await mediaService.getAsset(id as string);
    res.json({ data: asset });
  }
);

// ── GET /api/media/:id/url ──────────────────────────────────
// Get signed URL for asset
router.get(
  '/:id/url',
  authenticate,
  validate(getSignedUrlSchema),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const query = (req as unknown as Record<string, unknown>).validatedQuery as {
      expiresIn: number;
      variant?: string;
    };
    const result = await mediaService.getSignedUrl(id as string, query.expiresIn, query.variant);
    res.json({ data: result });
  }
);

// ── DELETE /api/media/:id ───────────────────────────────────
// Delete asset and variants
router.delete(
  '/:id',
  authenticate,
  requireRole('admin', 'editor'),
  validate(deleteAssetSchema),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    await mediaService.deleteAsset(id as string);
    res.status(204).send();
  }
);

// ── POST /api/media/:id/process ─────────────────────────────
// Trigger processing (resize, optimize, thumbnail)
router.post(
  '/:id/process',
  authenticate,
  requireRole('admin', 'editor'),
  validate(processAssetSchema),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const body = req.body as ProcessAssetBody;
    const result = await mediaService.processImage(id as string, body.operations);
    res.json({ data: result, message: 'Processing jobs queued' });
  }
);

// ── PATCH /api/media/:id ────────────────────────────────────
// Update metadata (alt text, etc.)
router.patch(
  '/:id',
  authenticate,
  requireRole('admin', 'editor'),
  validate(updateAssetSchema),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const body = req.body as UpdateAssetBody;
    const asset = await mediaService.updateAsset(id as string, body);
    res.json({ data: asset });
  }
);

export default router;
