import { Router } from 'express';
import { validate } from '../../lib/validate.js';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { logAudit, getClientIp } from '../../lib/audit.js';
import * as recommendationService from './service.js';
import {
  listConfigsSchema,
  updateConfigSchema,
  previewRecommendationsSchema,
  explainRecommendationSchema,
  simulateRecommendationsSchema,
  contentDiagnosticsSchema,
} from './schemas.js';

const router = Router();

// ── GET /api/recommendations/config — list recommendation configs ──

router.get(
  '/config',
  authenticate,
  requireRole('admin'),
  validate(listConfigsSchema),
  async (_req, res) => {
    const configs = await recommendationService.listConfigs();
    res.json({ data: configs });
  }
);

// ── PUT /api/recommendations/config/:key — update config value ─────

router.put(
  '/config/:key',
  authenticate,
  requireRole('admin'),
  validate(updateConfigSchema),
  async (req, res) => {
    const { key } = req.params;
    const { value, description } = req.body;

    const config = await recommendationService.updateConfig(
      key as string,
      value,
      description,
      req.user!.userId
    );

    await logAudit({
      action: 'recommendation_config.update',
      entity: 'RecommendationConfig',
      entityId: config.id,
      changes: { key, value, description },
      userId: req.user!.userId,
      ipAddress: getClientIp(req),
    });

    res.json({ data: config });
  }
);

// ── GET /api/recommendations/preview/:profileId — preview recommendations ──

router.get(
  '/preview/:profileId',
  authenticate,
  requireRole('admin'),
  validate(previewRecommendationsSchema),
  async (req, res) => {
    const { profileId } = req.params;
    const results = await recommendationService.previewRecommendations(profileId as string);
    res.json({ data: results });
  }
);

// ── GET /api/recommendations/explain/:contentId/:profileId — explain scoring ──

router.get(
  '/explain/:contentId/:profileId',
  authenticate,
  requireRole('admin'),
  validate(explainRecommendationSchema),
  async (req, res) => {
    const { contentId, profileId } = req.params;
    const result = await recommendationService.explainRecommendation(contentId as string, profileId as string);
    res.json({ data: result });
  }
);

// ── POST /api/recommendations/simulate — simulate with modified weights ──

router.post(
  '/simulate',
  authenticate,
  requireRole('admin'),
  validate(simulateRecommendationsSchema),
  async (req, res) => {
    const { profileId, overrides } = req.body;
    const result = await recommendationService.simulateRecommendations(profileId, overrides);
    res.json({ data: result });
  }
);

// ── GET /api/recommendations/diagnostics/:contentId — content diagnostics ──

router.get(
  '/diagnostics/:contentId',
  authenticate,
  requireRole('admin'),
  validate(contentDiagnosticsSchema),
  async (req, res) => {
    const { contentId } = req.params;
    const diagnostics = await recommendationService.getContentDiagnostics(contentId as string);
    res.json({ data: diagnostics });
  }
);

export default router;
