import { Router, Request, Response } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { validate } from '../../lib/validate.js';
import {
  listBriefsSchema,
  getBriefSchema,
  createBriefSchema,
  updateBriefSchema,
  generateBriefSchema,
  acceptBriefSchema,
  rejectBriefSchema,
} from './schemas.js';
import * as briefService from './service.js';

const router = Router();

// ── GET /api/briefs — List briefs with pagination and filters ──

router.get(
  '/',
  authenticate,
  validate(listBriefsSchema),
  async (req: Request, res: Response) => {
    const query = (req as unknown as Record<string, unknown>).validatedQuery as {
      page: number;
      limit: number;
      sortBy?: string;
      sortOrder: 'asc' | 'desc';
      status?: string;
      type?: string;
      ageGroup?: string;
    };

    const result = await briefService.listBriefs({
      page: query.page,
      limit: query.limit,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      status: query.status as Parameters<typeof briefService.listBriefs>[0]['status'],
      type: query.type as Parameters<typeof briefService.listBriefs>[0]['type'],
      ageGroup: query.ageGroup as Parameters<typeof briefService.listBriefs>[0]['ageGroup'],
    });

    res.json(result);
  }
);

// ── GET /api/briefs/:id — Get brief detail ────────────────

router.get(
  '/:id',
  authenticate,
  validate(getBriefSchema),
  async (req: Request, res: Response) => {
    const brief = await briefService.getBriefById(req.params.id as string);
    res.json(brief);
  }
);

// ── POST /api/briefs — Create brief (editor+) ────────────

router.post(
  '/',
  authenticate,
  requireRole('admin', 'editor'),
  validate(createBriefSchema),
  async (req: Request, res: Response) => {
    const brief = await briefService.createBrief({
      ...req.body,
      createdBy: req.user!.userId,
    });

    res.status(201).json(brief);
  }
);

// ── PATCH /api/briefs/:id — Update brief ──────────────────

router.patch(
  '/:id',
  authenticate,
  requireRole('admin', 'editor'),
  validate(updateBriefSchema),
  async (req: Request, res: Response) => {
    const brief = await briefService.updateBrief(req.params.id as string, req.body);
    res.json(brief);
  }
);

// ── POST /api/briefs/:id/generate — Trigger AI generation ─

router.post(
  '/:id/generate',
  authenticate,
  requireRole('admin', 'editor'),
  validate(generateBriefSchema),
  async (req: Request, res: Response) => {
    const brief = await briefService.generateBrief(req.params.id as string);
    res.json({ message: 'Brief generation queued', brief });
  }
);

// ── POST /api/briefs/:id/accept — Accept generated content ─

router.post(
  '/:id/accept',
  authenticate,
  requireRole('admin', 'editor'),
  validate(acceptBriefSchema),
  async (req: Request, res: Response) => {
    const result = await briefService.acceptBrief(req.params.id as string, req.body);
    res.status(201).json(result);
  }
);

// ── POST /api/briefs/:id/reject — Reject and optionally regenerate ─

router.post(
  '/:id/reject',
  authenticate,
  requireRole('admin', 'editor'),
  validate(rejectBriefSchema),
  async (req: Request, res: Response) => {
    const brief = await briefService.rejectBrief(req.params.id as string, req.body || {});
    res.json({ message: 'Brief rejected', brief });
  }
);

export default router;
