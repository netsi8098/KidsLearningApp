import { Router, Request, Response } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { validate } from '../../lib/validate.js';
import {
  listPromptsSchema,
  getPromptSchema,
  createPromptSchema,
  updatePromptSchema,
  renderPromptSchema,
  usageSchema,
  testRenderSchema,
} from './schemas.js';
import * as promptService from './service.js';

const router = Router();

// ── GET /api/prompts — List prompts with filters ──────────

router.get(
  '/',
  authenticate,
  validate(listPromptsSchema),
  async (req: Request, res: Response) => {
    const query = (req as unknown as Record<string, unknown>).validatedQuery as {
      page: number;
      limit: number;
      sortBy?: string;
      sortOrder: 'asc' | 'desc';
      category?: string;
      isActive?: boolean;
      search?: string;
    };

    const result = await promptService.listPrompts({
      page: query.page,
      limit: query.limit,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      category: query.category,
      isActive: query.isActive,
      search: query.search,
    });

    res.json(result);
  }
);

// ── GET /api/prompts/:id — Get prompt with usage stats ────

router.get(
  '/:id',
  authenticate,
  validate(getPromptSchema),
  async (req: Request, res: Response) => {
    const prompt = await promptService.getPromptById(req.params.id as string);
    res.json(prompt);
  }
);

// ── POST /api/prompts — Create prompt (admin/editor) ──────

router.post(
  '/',
  authenticate,
  requireRole('admin', 'editor'),
  validate(createPromptSchema),
  async (req: Request, res: Response) => {
    const prompt = await promptService.createPrompt(req.body);
    res.status(201).json(prompt);
  }
);

// ── PATCH /api/prompts/:id — Update prompt (new version) ──

router.patch(
  '/:id',
  authenticate,
  requireRole('admin', 'editor'),
  validate(updatePromptSchema),
  async (req: Request, res: Response) => {
    const prompt = await promptService.updatePrompt(req.params.id as string, req.body);
    res.json(prompt);
  }
);

// ── POST /api/prompts/:id/render — Render with variables ──

router.post(
  '/:id/render',
  authenticate,
  validate(renderPromptSchema),
  async (req: Request, res: Response) => {
    const result = await promptService.renderPrompt(req.params.id as string, req.body.variables);
    res.json(result);
  }
);

// ── GET /api/prompts/:id/usage — Get usage history ────────

router.get(
  '/:id/usage',
  authenticate,
  validate(usageSchema),
  async (req: Request, res: Response) => {
    const query = (req as unknown as Record<string, unknown>).validatedQuery as {
      page: number;
      limit: number;
      sortBy?: string;
      sortOrder: 'asc' | 'desc';
    };

    const [stats, history] = await Promise.all([
      promptService.getUsageStats(req.params.id as string),
      promptService.getUsageHistory(req.params.id as string, {
        page: query.page,
        limit: query.limit,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      }),
    ]);

    res.json({ stats, history });
  }
);

// ── POST /api/prompts/:id/test — Test render with sample variables ──

router.post(
  '/:id/test',
  authenticate,
  requireRole('admin', 'editor'),
  validate(testRenderSchema),
  async (req: Request, res: Response) => {
    const result = await promptService.testRender(req.params.id as string, req.body.variables);
    res.json(result);
  }
);

export default router;
