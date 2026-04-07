import { Router } from 'express';
import { validate } from '../../lib/validate.js';
import { authenticate } from '../../middleware/auth.js';
import * as searchService from './service.js';
import {
  searchSchema,
  suggestSchema,
  facetsSchema,
  relatedSchema,
  trendingSchema,
  recentSchema,
} from './schemas.js';

const router = Router();

// ── GET /api/search — full-text search across content ─────

router.get('/', authenticate, validate(searchSchema), async (req, res) => {
  const query = (req as any).validatedQuery ?? req.query;
  const { q, type, ageGroup, tags, difficulty, energyLevel, status, page, limit, sortBy, sortOrder } = query;

  const tagArray = tags ? (tags as string).split(',').map((t: string) => t.trim()).filter(Boolean) : undefined;

  const results = await searchService.search(
    q,
    { type, ageGroup, tags: tagArray, difficulty, energyLevel, status },
    { page, limit, sortBy, sortOrder }
  );

  res.json(results);
});

// ── GET /api/search/suggest — autocomplete suggestions ────

router.get('/suggest', authenticate, validate(suggestSchema), async (req, res) => {
  const query = (req as any).validatedQuery ?? req.query;
  const { q, limit } = query;

  const suggestions = await searchService.suggest(q, limit);
  res.json({ data: suggestions });
});

// ── GET /api/search/facets — facet counts ─────────────────

router.get('/facets', authenticate, validate(facetsSchema), async (req, res) => {
  const query = (req as any).validatedQuery ?? req.query;
  const { q, type, ageGroup, difficulty, status } = query;

  const facets = await searchService.getFacets({ q, type, ageGroup, difficulty, status });
  res.json({ data: facets });
});

// ── GET /api/search/related/:contentId — related content ──

router.get('/related/:contentId', authenticate, validate(relatedSchema), async (req, res) => {
  const { contentId } = req.params;
  const query = (req as any).validatedQuery ?? req.query;
  const { limit } = query;

  const related = await searchService.getRelated(contentId as string, limit);
  res.json({ data: related });
});

// ── GET /api/search/trending — trending content ───────────

router.get('/trending', authenticate, validate(trendingSchema), async (req, res) => {
  const query = (req as any).validatedQuery ?? req.query;
  const { days, limit } = query;

  const trending = await searchService.getTrending(days, limit);
  res.json({ data: trending });
});

// ── GET /api/search/recent — recently published content ───

router.get('/recent', authenticate, validate(recentSchema), async (req, res) => {
  const query = (req as any).validatedQuery ?? req.query;
  const { limit } = query;

  const recent = await searchService.getRecent(limit);
  res.json({ data: recent });
});

export default router;
