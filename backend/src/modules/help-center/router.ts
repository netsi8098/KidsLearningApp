import { Router } from 'express';
import { validate } from '../../lib/validate.js';
import { authenticate, requireRole } from '../../middleware/auth.js';
import * as helpService from './service.js';
import {
  listArticlesSchema,
  getArticleBySlugSchema,
  createArticleSchema,
  updateArticleSchema,
  deleteArticleSchema,
  articleFeedbackSchema,
  listTicketsSchema,
  getTicketSchema,
  createTicketSchema,
  updateTicketSchema,
} from './schemas.js';

const router = Router();

// ══════════════════════════════════════════════════════════
//  ARTICLES
// ══════════════════════════════════════════════════════════

// ── GET /api/help/articles ────────────────────────────────
// List articles with pagination and filters. Public.

router.get('/articles', validate(listArticlesSchema), async (req, res) => {
  const query = (req as any).validatedQuery ?? req.query;
  const result = await helpService.listArticles({
    page: query.page ?? 1,
    limit: query.limit ?? 20,
    sortBy: query.sortBy ?? 'orderIndex',
    sortOrder: query.sortOrder ?? 'asc',
    category: query.category,
    published: query.published,
    search: query.search,
  });
  res.json(result);
});

// ── GET /api/help/articles/:slug ──────────────────────────
// Get article detail by slug. Public.

router.get('/articles/:slug', validate(getArticleBySlugSchema), async (req, res) => {
  const article = await helpService.getArticleBySlug(req.params.slug as string);
  res.json(article);
});

// ── POST /api/help/articles ───────────────────────────────
// Create article. Admin only.

router.post(
  '/articles',
  authenticate,
  requireRole('admin'),
  validate(createArticleSchema),
  async (req, res) => {
    const article = await helpService.createArticle(req.body, req.user!.userId);
    res.status(201).json(article);
  }
);

// ── PATCH /api/help/articles/:id ──────────────────────────
// Update article. Admin only.

router.patch(
  '/articles/:id',
  authenticate,
  requireRole('admin'),
  validate(updateArticleSchema),
  async (req, res) => {
    const article = await helpService.updateArticle(req.params.id as string, req.body, req.user!.userId);
    res.json(article);
  }
);

// ── DELETE /api/help/articles/:id ─────────────────────────
// Soft-delete article. Admin only.

router.delete(
  '/articles/:id',
  authenticate,
  requireRole('admin'),
  validate(deleteArticleSchema),
  async (req, res) => {
    const result = await helpService.deleteArticle(req.params.id as string, req.user!.userId);
    res.json(result);
  }
);

// ── POST /api/help/articles/:id/feedback ──────────────────
// Submit helpful yes/no feedback. Public.

router.post('/articles/:id/feedback', validate(articleFeedbackSchema), async (req, res) => {
  const result = await helpService.submitArticleFeedback(req.params.id as string, req.body.helpful);
  res.json(result);
});

// ══════════════════════════════════════════════════════════
//  TICKETS
// ══════════════════════════════════════════════════════════

// ── GET /api/help/tickets ─────────────────────────────────
// List tickets. Admin only, paginated, filterable.

router.get(
  '/tickets',
  authenticate,
  requireRole('admin'),
  validate(listTicketsSchema),
  async (req, res) => {
    const query = (req as any).validatedQuery ?? req.query;
    const result = await helpService.listTickets({
      page: query.page ?? 1,
      limit: query.limit ?? 20,
      sortBy: query.sortBy ?? 'createdAt',
      sortOrder: query.sortOrder ?? 'desc',
      status: query.status,
      priority: query.priority,
    });
    res.json(result);
  }
);

// ── GET /api/help/tickets/:id ─────────────────────────────
// Get ticket detail. Admin only.

router.get(
  '/tickets/:id',
  authenticate,
  requireRole('admin'),
  validate(getTicketSchema),
  async (req, res) => {
    const ticket = await helpService.getTicket(req.params.id as string);
    res.json(ticket);
  }
);

// ── POST /api/help/tickets ────────────────────────────────
// Create ticket. Public.

router.post('/tickets', validate(createTicketSchema), async (req, res) => {
  const ticket = await helpService.createTicket(req.body);
  res.status(201).json(ticket);
});

// ── PATCH /api/help/tickets/:id ───────────────────────────
// Update ticket status/assignee. Admin only.

router.patch(
  '/tickets/:id',
  authenticate,
  requireRole('admin'),
  validate(updateTicketSchema),
  async (req, res) => {
    const ticket = await helpService.updateTicket(req.params.id as string, req.body, req.user!.userId);
    res.json(ticket);
  }
);

export default router;
