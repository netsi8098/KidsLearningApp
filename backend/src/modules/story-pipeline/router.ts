import { Router, Request, Response } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { validate } from '../../lib/validate.js';
import {
  contentIdParamSchema,
  stepParamsSchema,
  updateStepSchema,
  advanceStepSchema,
  generateOutlineSchema,
  generateDraftSchema,
  activePipelinesSchema,
} from './schemas.js';
import * as pipelineService from './service.js';

const router = Router();

// ── GET /api/story-pipeline/active — List all active pipelines ──

router.get(
  '/active',
  authenticate,
  validate(activePipelinesSchema),
  async (req: Request, res: Response) => {
    const query = (req as unknown as Record<string, unknown>).validatedQuery as {
      page: number;
      limit: number;
      sortBy?: string;
      sortOrder: 'asc' | 'desc';
      step?: string;
    };

    const result = await pipelineService.getActivePipelines({
      page: query.page,
      limit: query.limit,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      step: query.step,
    });

    const counts = await pipelineService.getActiveStoriesCount();

    res.json({ ...result, stageCounts: counts });
  }
);

// ── GET /api/story-pipeline/:contentId/steps — Get all steps ──

router.get(
  '/:contentId/steps',
  authenticate,
  validate(contentIdParamSchema),
  async (req: Request, res: Response) => {
    const result = await pipelineService.getSteps(req.params.contentId as string);
    res.json(result);
  }
);

// ── POST /api/story-pipeline/:contentId/start — Start pipeline ──

router.post(
  '/:contentId/start',
  authenticate,
  requireRole('admin', 'editor'),
  validate(contentIdParamSchema),
  async (req: Request, res: Response) => {
    const result = await pipelineService.startPipeline(req.params.contentId as string);
    res.status(201).json(result);
  }
);

// ── PATCH /api/story-pipeline/:contentId/steps/:stepId — Update step ──

router.patch(
  '/:contentId/steps/:stepId',
  authenticate,
  requireRole('admin', 'editor', 'reviewer'),
  validate(updateStepSchema),
  async (req: Request, res: Response) => {
    const step = await pipelineService.updateStep(
      req.params.contentId as string,
      req.params.stepId as string,
      req.body
    );
    res.json(step);
  }
);

// ── POST /api/story-pipeline/:contentId/steps/:stepId/advance — Advance ──

router.post(
  '/:contentId/steps/:stepId/advance',
  authenticate,
  requireRole('admin', 'editor'),
  validate(advanceStepSchema),
  async (req: Request, res: Response) => {
    const steps = await pipelineService.advanceStep(
      req.params.contentId as string,
      req.params.stepId as string
    );
    res.json({ message: 'Step advanced', steps });
  }
);

// ── POST /api/story-pipeline/:contentId/generate-outline — AI outline ──

router.post(
  '/:contentId/generate-outline',
  authenticate,
  requireRole('admin', 'editor'),
  validate(generateOutlineSchema),
  async (req: Request, res: Response) => {
    const result = await pipelineService.generateOutline(
      req.params.contentId as string,
      req.body || {}
    );
    res.json(result);
  }
);

// ── POST /api/story-pipeline/:contentId/generate-draft — AI draft ──

router.post(
  '/:contentId/generate-draft',
  authenticate,
  requireRole('admin', 'editor'),
  validate(generateDraftSchema),
  async (req: Request, res: Response) => {
    const result = await pipelineService.generateDraft(
      req.params.contentId as string,
      req.body || {}
    );
    res.json(result);
  }
);

export default router;
