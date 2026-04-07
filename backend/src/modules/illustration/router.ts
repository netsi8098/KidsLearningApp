import { Router, Request, Response } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { validate } from '../../lib/validate.js';
import {
  listIllustrationsSchema,
  getIllustrationSchema,
  createIllustrationSchema,
  generateIllustrationSchema,
  updateIllustrationSchema,
  regenerateIllustrationSchema,
} from './schemas.js';
import * as illustrationService from './service.js';

const router = Router();

// ── GET /api/illustrations/styles — List available styles ──

router.get(
  '/styles',
  authenticate,
  async (_req: Request, res: Response) => {
    const styles = illustrationService.getAvailableStyles();
    res.json(styles);
  }
);

// ── GET /api/illustrations — List illustration jobs ───────

router.get(
  '/',
  authenticate,
  validate(listIllustrationsSchema),
  async (req: Request, res: Response) => {
    const query = (req as unknown as Record<string, unknown>).validatedQuery as {
      page: number;
      limit: number;
      sortBy?: string;
      sortOrder: 'asc' | 'desc';
      status?: string;
      style?: string;
      contentId?: string;
    };

    const result = await illustrationService.listIllustrations({
      page: query.page,
      limit: query.limit,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      status: query.status,
      style: query.style,
      contentId: query.contentId,
    });

    res.json(result);
  }
);

// ── GET /api/illustrations/:id — Get job detail ───────────

router.get(
  '/:id',
  authenticate,
  validate(getIllustrationSchema),
  async (req: Request, res: Response) => {
    const job = await illustrationService.getIllustrationById(req.params.id as string);
    res.json(job);
  }
);

// ── POST /api/illustrations — Create illustration job ─────

router.post(
  '/',
  authenticate,
  requireRole('admin', 'editor'),
  validate(createIllustrationSchema),
  async (req: Request, res: Response) => {
    const job = await illustrationService.createIllustration(req.body);
    res.status(201).json(job);
  }
);

// ── POST /api/illustrations/:id/generate — Trigger generation ──

router.post(
  '/:id/generate',
  authenticate,
  requireRole('admin', 'editor'),
  validate(generateIllustrationSchema),
  async (req: Request, res: Response) => {
    const job = await illustrationService.generateIllustration(req.params.id as string);
    res.json({ message: 'Illustration generation queued', job });
  }
);

// ── PATCH /api/illustrations/:id — Update (approve/reject) ──

router.patch(
  '/:id',
  authenticate,
  requireRole('admin', 'editor', 'reviewer'),
  validate(updateIllustrationSchema),
  async (req: Request, res: Response) => {
    const { status, feedback, ...updateData } = req.body;

    // Handle approve/reject through dedicated methods for proper side effects
    if (status === 'approved') {
      const job = await illustrationService.approveIllustration(req.params.id as string);
      res.json(job);
      return;
    }

    if (status === 'rejected') {
      const job = await illustrationService.rejectIllustration(req.params.id as string, feedback);
      res.json(job);
      return;
    }

    // Generic update for other fields (prompt, style, metadata)
    const job = await illustrationService.getIllustrationById(req.params.id as string);

    // Direct field update for non-status changes
    const prisma = (await import('../../lib/prisma.js')).prisma;
    const updated = await prisma.illustrationJob.update({
      where: { id: req.params.id as string },
      data: updateData,
      include: {
        content: { select: { id: true, title: true, slug: true, type: true } },
      },
    });

    res.json(updated);
  }
);

// ── POST /api/illustrations/:id/regenerate — Regenerate ───

router.post(
  '/:id/regenerate',
  authenticate,
  requireRole('admin', 'editor'),
  validate(regenerateIllustrationSchema),
  async (req: Request, res: Response) => {
    const job = await illustrationService.regenerateIllustration(
      req.params.id as string,
      req.body || {}
    );
    res.json({ message: 'Illustration regeneration queued', job });
  }
);

export default router;
