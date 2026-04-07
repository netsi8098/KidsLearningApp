import { Router, Request, Response } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { validate } from '../../lib/validate.js';
import {
  getContentTranslationsSchema,
  createTranslationSchema,
  translationStatusSchema,
  missingTranslationsSchema,
  batchCreateTranslationsSchema,
  updateTranslationSchema,
  exportLocaleSchema,
} from './schemas.js';
import type {
  CreateTranslationBody,
  UpdateTranslationBody,
  BatchTranslationItem,
  MissingTranslationsQuery,
  SupportedLocale,
} from './schemas.js';
import * as localizationService from './service.js';

const router = Router();

// ── GET /api/localization/locales ────────────────────────────
// List supported locales with completion stats
router.get(
  '/locales',
  authenticate,
  async (_req: Request, res: Response) => {
    const locales = await localizationService.listLocalesWithStats();
    res.json({ data: locales });
  }
);

// ── GET /api/localization/status ─────────────────────────────
// Translation coverage dashboard (% per locale)
router.get(
  '/status',
  authenticate,
  validate(translationStatusSchema),
  async (req: Request, res: Response) => {
    const query = (req as unknown as Record<string, unknown>).validatedQuery as {
      ageGroup?: string;
      contentType?: string;
    } | undefined;
    const coverage = await localizationService.getTranslationCoverage(query);
    res.json({ data: coverage });
  }
);

// ── GET /api/localization/missing ────────────────────────────
// List content missing translations for a locale
router.get(
  '/missing',
  authenticate,
  validate(missingTranslationsSchema),
  async (req: Request, res: Response) => {
    const query = (req as unknown as Record<string, unknown>).validatedQuery as MissingTranslationsQuery;
    const result = await localizationService.getMissingTranslations(query);
    res.json(result);
  }
);

// ── POST /api/localization/batch ─────────────────────────────
// Batch create translations
router.post(
  '/batch',
  authenticate,
  requireRole('admin', 'editor'),
  validate(batchCreateTranslationsSchema),
  async (req: Request, res: Response) => {
    const { translations } = req.body as { translations: BatchTranslationItem[] };
    const result = await localizationService.batchCreateTranslations(translations);
    res.status(201).json({ data: result });
  }
);

// ── POST /api/localization/export/:locale ────────────────────
// Export all translations for a locale as JSON
router.post(
  '/export/:locale',
  authenticate,
  validate(exportLocaleSchema),
  async (req: Request, res: Response) => {
    const { locale } = req.params as { locale: SupportedLocale };
    const query = (req as unknown as Record<string, unknown>).validatedQuery as {
      status?: string;
      contentType?: string;
    } | undefined;
    const exported = await localizationService.exportLocale(locale, query);
    res.json({ data: exported });
  }
);

// ── GET /api/localization/content/:contentId ─────────────────
// Get all translations for content
router.get(
  '/content/:contentId',
  authenticate,
  validate(getContentTranslationsSchema),
  async (req: Request, res: Response) => {
    const { contentId } = req.params;
    const query = (req as unknown as Record<string, unknown>).validatedQuery as {
      locale?: string;
      field?: string;
      status?: string;
    } | undefined;
    const translations = await localizationService.getContentTranslations(contentId as string, query);
    res.json({ data: translations });
  }
);

// ── POST /api/localization/content/:contentId ────────────────
// Add/update translation
router.post(
  '/content/:contentId',
  authenticate,
  requireRole('admin', 'editor'),
  validate(createTranslationSchema),
  async (req: Request, res: Response) => {
    const { contentId } = req.params;
    const body = req.body as CreateTranslationBody;
    const translation = await localizationService.createTranslation(contentId as string, body);
    res.status(201).json({ data: translation });
  }
);

// ── PATCH /api/localization/:id ──────────────────────────────
// Update translation status (draft -> translated -> reviewed -> published)
router.patch(
  '/:id',
  authenticate,
  requireRole('admin', 'editor', 'reviewer'),
  validate(updateTranslationSchema),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const body = req.body as UpdateTranslationBody;
    const translation = await localizationService.updateTranslation(id as string, body);
    res.json({ data: translation });
  }
);

export default router;
