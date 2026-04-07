import { Router, Request, Response } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { validate } from '../../lib/validate.js';
import {
  listVoiceJobsSchema,
  getVoiceJobSchema,
  createVoiceJobSchema,
  renderVoiceJobSchema,
  updateVoiceJobSchema,
  previewVoiceSchema,
} from './schemas.js';
import type { ListVoiceJobsQuery, CreateVoiceJobBody, UpdateVoiceJobBody, PreviewVoiceBody } from './schemas.js';
import * as voiceService from './service.js';

const router = Router();

// ── GET /api/voice/profiles ─────────────────────────────────
// List available voice profiles (must be before /:id routes)
router.get(
  '/profiles',
  authenticate,
  async (_req: Request, res: Response) => {
    const profiles = voiceService.getVoiceProfiles();
    res.json({ data: profiles });
  }
);

// ── POST /api/voice/preview ─────────────────────────────────
// Preview TTS with short text sample
router.post(
  '/preview',
  authenticate,
  validate(previewVoiceSchema),
  async (req: Request, res: Response) => {
    const body = req.body as PreviewVoiceBody;
    const result = voiceService.previewVoice(body);
    res.json({ data: result });
  }
);

// ── GET /api/voice ──────────────────────────────────────────
// List voice jobs with filters
router.get(
  '/',
  authenticate,
  validate(listVoiceJobsSchema),
  async (req: Request, res: Response) => {
    const query = (req as unknown as Record<string, unknown>).validatedQuery as ListVoiceJobsQuery;
    const result = await voiceService.listVoiceJobs(query);
    res.json(result);
  }
);

// ── GET /api/voice/:id ──────────────────────────────────────
// Get voice job detail
router.get(
  '/:id',
  authenticate,
  validate(getVoiceJobSchema),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const job = await voiceService.getVoiceJob(id as string);
    res.json({ data: job });
  }
);

// ── POST /api/voice ─────────────────────────────────────────
// Create voice job for content
router.post(
  '/',
  authenticate,
  requireRole('admin', 'editor'),
  validate(createVoiceJobSchema),
  async (req: Request, res: Response) => {
    const body = req.body as CreateVoiceJobBody;
    const job = await voiceService.createVoiceJob(body);
    res.status(201).json({ data: job });
  }
);

// ── POST /api/voice/:id/render ──────────────────────────────
// Trigger audio rendering (queued)
router.post(
  '/:id/render',
  authenticate,
  requireRole('admin', 'editor'),
  validate(renderVoiceJobSchema),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const job = await voiceService.renderVoice(id as string);
    res.json({ data: job, message: 'Voice rendering queued' });
  }
);

// ── PATCH /api/voice/:id ────────────────────────────────────
// Update job (approve/reject/edit)
router.patch(
  '/:id',
  authenticate,
  requireRole('admin', 'editor', 'reviewer'),
  validate(updateVoiceJobSchema),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const body = req.body as UpdateVoiceJobBody;
    const job = await voiceService.updateVoiceJob(id as string, body);
    res.json({ data: job });
  }
);

export default router;
