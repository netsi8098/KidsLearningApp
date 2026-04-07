import { Router } from 'express';
import { validate } from '../../lib/validate.js';
import { authenticate, requireRole } from '../../middleware/auth.js';
import * as experimentsService from './service.js';
import {
  listExperimentsSchema,
  getExperimentSchema,
  createExperimentSchema,
  updateExperimentSchema,
  experimentIdSchema,
  addVariantSchema,
  updateVariantSchema,
  recordResultSchema,
  getResultsSchema,
  assignVariantSchema,
} from './schemas.js';

const router = Router();

// ── GET /api/experiments — list experiments ────────────────

router.get('/', authenticate, validate(listExperimentsSchema), async (req, res) => {
  const query = (req as any).validatedQuery ?? req.query;
  const { page, limit, sortBy, sortOrder, status } = query;

  const results = await experimentsService.listExperiments(
    { status },
    { page, limit, sortBy, sortOrder }
  );

  res.json(results);
});

// ── GET /api/experiments/:id — get experiment detail ───────

router.get('/:id', authenticate, validate(getExperimentSchema), async (req, res) => {
  const { id } = req.params;
  const experiment = await experimentsService.getExperiment(id as string);
  res.json({ data: experiment });
});

// ── POST /api/experiments — create experiment ──────────────

router.post(
  '/',
  authenticate,
  requireRole('admin', 'editor'),
  validate(createExperimentSchema),
  async (req, res) => {
    const { name, description } = req.body;
    const experiment = await experimentsService.createExperiment(
      { name, description },
      req.user!.userId
    );
    res.status(201).json({ data: experiment });
  }
);

// ── PATCH /api/experiments/:id — update experiment ─────────

router.patch(
  '/:id',
  authenticate,
  requireRole('admin', 'editor'),
  validate(updateExperimentSchema),
  async (req, res) => {
    const { id } = req.params;
    const experiment = await experimentsService.updateExperiment(id as string, req.body);
    res.json({ data: experiment });
  }
);

// ── POST /api/experiments/:id/start — start experiment ─────

router.post(
  '/:id/start',
  authenticate,
  requireRole('admin', 'editor'),
  validate(experimentIdSchema),
  async (req, res) => {
    const { id } = req.params;
    const experiment = await experimentsService.startExperiment(id as string);
    res.json({ data: experiment });
  }
);

// ── POST /api/experiments/:id/stop — stop experiment ───────

router.post(
  '/:id/stop',
  authenticate,
  requireRole('admin', 'editor'),
  validate(experimentIdSchema),
  async (req, res) => {
    const { id } = req.params;
    const experiment = await experimentsService.stopExperiment(id as string);
    res.json({ data: experiment });
  }
);

// ── POST /api/experiments/:id/variants — add variant ───────

router.post(
  '/:id/variants',
  authenticate,
  requireRole('admin', 'editor'),
  validate(addVariantSchema),
  async (req, res) => {
    const { id } = req.params;
    const { name, contentId, weight, config } = req.body;

    const variant = await experimentsService.addVariant(id as string, { name, contentId, weight, config });
    res.status(201).json({ data: variant });
  }
);

// ── PATCH /api/experiments/:id/variants/:variantId — update weight

router.patch(
  '/:id/variants/:variantId',
  authenticate,
  requireRole('admin', 'editor'),
  validate(updateVariantSchema),
  async (req, res) => {
    const { id, variantId } = req.params;
    const { weight } = req.body;

    const variant = await experimentsService.updateVariantWeight(id as string, variantId as string, weight);
    res.json({ data: variant });
  }
);

// ── POST /api/experiments/:id/record — record result ───────

router.post(
  '/:id/record',
  authenticate,
  validate(recordResultSchema),
  async (req, res) => {
    const { id } = req.params;
    const { variantId, metric, value, sampleSize } = req.body;

    const result = await experimentsService.recordResult(id as string, variantId, metric, value, sampleSize);
    res.status(201).json({ data: result });
  }
);

// ── GET /api/experiments/:id/results — get results ─────────

router.get(
  '/:id/results',
  authenticate,
  validate(getResultsSchema),
  async (req, res) => {
    const { id } = req.params;
    const query = (req as any).validatedQuery ?? req.query;
    const { metric } = query;

    const results = await experimentsService.getResults(id as string, metric);
    res.json({ data: results });
  }
);

// ── POST /api/experiments/:id/assign — assign variant ──────

router.post(
  '/:id/assign',
  authenticate,
  validate(assignVariantSchema),
  async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;

    const variant = await experimentsService.assignVariant(id as string, userId);
    res.json({ data: variant });
  }
);

export default router;
