import { Router } from 'express';
import { validate } from '../../lib/validate.js';
import { authenticate, requireRole } from '../../middleware/auth.js';
import * as contentService from './service.js';
import {
  listContentSchema,
  getContentSchema,
  createContentSchema,
  updateContentSchema,
  deleteContentSchema,
  addTagsSchema,
  removeTagSchema,
  historySchema,
  duplicateContentSchema,
  addSkillsSchema,
  removeSkillSchema,
  listSkillsSchema,
  updateLifecycleSchema,
  refreshQueueSchema,
  lifecycleStatsSchema,
  pipelineEventsSchema,
  recordPipelineEventSchema,
  checkPoliciesSchema,
  policyResultsSchema,
} from './schemas.js';

const router = Router();

// ── GET /api/content ──────────────────────────────────────
// List content with pagination and filters.
// Public: viewers can see published content; authenticated users
// with editor+ roles can see all statuses.

router.get('/', validate(listContentSchema), async (req, res) => {
  const query = (req as unknown as Record<string, unknown>).validatedQuery as
    typeof listContentSchema extends { _output: { query: infer Q } } ? Q : Record<string, unknown>;

  // Use validated query merged with defaults from the schema
  const result = await contentService.listContent({
    page: (query as Record<string, unknown>).page as number ?? 1,
    limit: (query as Record<string, unknown>).limit as number ?? 20,
    sortBy: (query as Record<string, unknown>).sortBy as string ?? 'createdAt',
    sortOrder: (query as Record<string, unknown>).sortOrder as 'asc' | 'desc' ?? 'desc',
    type: (query as Record<string, unknown>).type as string | undefined,
    status: (query as Record<string, unknown>).status as string | undefined,
    ageGroup: (query as Record<string, unknown>).ageGroup as string | undefined,
    accessTier: (query as Record<string, unknown>).accessTier as string | undefined,
    difficulty: (query as Record<string, unknown>).difficulty as string | undefined,
    energyLevel: (query as Record<string, unknown>).energyLevel as string | undefined,
    search: (query as Record<string, unknown>).search as string | undefined,
    authorId: (query as Record<string, unknown>).authorId as string | undefined,
  } as Parameters<typeof contentService.listContent>[0]);

  res.json(result);
});

// ── GET /api/content/:id ──────────────────────────────────
// Get a single content item by ID.

router.get('/:id', validate(getContentSchema), async (req, res) => {
  const content = await contentService.getContent(req.params.id as string);
  res.json(content);
});

// ── POST /api/content ─────────────────────────────────────
// Create new content. Requires editor or admin role.

router.post(
  '/',
  authenticate,
  requireRole('admin', 'editor'),
  validate(createContentSchema),
  async (req, res) => {
    const content = await contentService.createContent(req.body, req.user!.userId);
    res.status(201).json(content);
  }
);

// ── PATCH /api/content/:id ────────────────────────────────
// Update content. Requires editor or admin role.

router.patch(
  '/:id',
  authenticate,
  requireRole('admin', 'editor'),
  validate(updateContentSchema),
  async (req, res) => {
    const content = await contentService.updateContent(req.params.id as string, req.body);
    res.json(content);
  }
);

// ── DELETE /api/content/:id ───────────────────────────────
// Soft-delete (archive) content. Requires admin role.

router.delete(
  '/:id',
  authenticate,
  requireRole('admin'),
  validate(deleteContentSchema),
  async (req, res) => {
    const result = await contentService.archiveContent(req.params.id as string);
    res.json(result);
  }
);

// ── POST /api/content/:id/tags ────────────────────────────
// Add tags to a content item. Requires editor or admin role.

router.post(
  '/:id/tags',
  authenticate,
  requireRole('admin', 'editor'),
  validate(addTagsSchema),
  async (req, res) => {
    const content = await contentService.addTags(req.params.id as string, req.body.tagIds);
    res.json(content);
  }
);

// ── DELETE /api/content/:id/tags/:tagId ───────────────────
// Remove a tag from a content item. Requires editor or admin role.

router.delete(
  '/:id/tags/:tagId',
  authenticate,
  requireRole('admin', 'editor'),
  validate(removeTagSchema),
  async (req, res) => {
    const result = await contentService.removeTag(req.params.id as string, req.params.tagId as string);
    res.json(result);
  }
);

// ── GET /api/content/:id/history ──────────────────────────
// Get version history / audit trail for a content item.

router.get('/:id/history', validate(historySchema), async (req, res) => {
  const query = (req as unknown as Record<string, unknown>).validatedQuery as
    { page?: number; limit?: number } | undefined;

  const result = await contentService.getContentHistory(
    req.params.id as string,
    query?.page ?? 1,
    query?.limit ?? 10
  );
  res.json(result);
});

// ── POST /api/content/:id/duplicate ───────────────────────
// Duplicate a content item. Requires editor or admin role.

router.post(
  '/:id/duplicate',
  authenticate,
  requireRole('admin', 'editor'),
  validate(duplicateContentSchema),
  async (req, res) => {
    const content = await contentService.duplicateContent(
      req.params.id as string,
      req.body ?? {},
      req.user!.userId
    );
    res.status(201).json(content);
  }
);

// ── GET /api/content/:id/skills ──────────────────────────
// List skills for a content item.

router.get('/:id/skills', validate(listSkillsSchema), async (req, res) => {
  const skills = await contentService.listContentSkills(req.params.id as string);
  res.json(skills);
});

// ── POST /api/content/:id/skills ─────────────────────────
// Add skills to a content item. Requires editor or admin role.

router.post(
  '/:id/skills',
  authenticate,
  requireRole('admin', 'editor'),
  validate(addSkillsSchema),
  async (req, res) => {
    const content = await contentService.addSkills(req.params.id as string, req.body.skills);
    res.json(content);
  }
);

// ── DELETE /api/content/:id/skills/:skillId ──────────────
// Remove a skill from a content item. Requires editor or admin role.

router.delete(
  '/:id/skills/:skillId',
  authenticate,
  requireRole('admin', 'editor'),
  validate(removeSkillSchema),
  async (req, res) => {
    const result = await contentService.removeSkill(req.params.id as string, req.params.skillId as string);
    res.json(result);
  }
);

// ── Lifecycle Endpoints ──────────────────────────────────

// GET /api/content/lifecycle/refresh-queue — items needing refresh
router.get(
  '/lifecycle/refresh-queue',
  authenticate,
  requireRole('admin', 'editor'),
  validate(refreshQueueSchema),
  async (req, res) => {
    const query = (req as unknown as Record<string, unknown>).validatedQuery as
      { page?: number; limit?: number } | undefined;
    const result = await contentService.getRefreshQueue(query?.page ?? 1, query?.limit ?? 20);
    res.json(result);
  }
);

// GET /api/content/lifecycle/stats — lifecycle statistics
router.get(
  '/lifecycle/stats',
  authenticate,
  requireRole('admin', 'editor'),
  validate(lifecycleStatsSchema),
  async (_req, res) => {
    const stats = await contentService.getLifecycleStats();
    res.json(stats);
  }
);

// PATCH /api/content/:id/lifecycle — update lifecycle fields
router.patch(
  '/:id/lifecycle',
  authenticate,
  requireRole('admin', 'editor'),
  validate(updateLifecycleSchema),
  async (req, res) => {
    const result = await contentService.updateLifecycle(req.params.id as string, req.body);
    res.json(result);
  }
);

// POST /api/content/:id/lifecycle/refresh — mark content as refreshed
router.post(
  '/:id/lifecycle/refresh',
  authenticate,
  requireRole('admin', 'editor'),
  async (req, res) => {
    const result = await contentService.markRefreshed(req.params.id as string);
    res.json(result);
  }
);

// ── Pipeline Event Endpoints ─────────────────────────────

// GET /api/content/:id/pipeline — pipeline event timeline
router.get(
  '/:id/pipeline',
  authenticate,
  validate(pipelineEventsSchema),
  async (req, res) => {
    const events = await contentService.getPipelineEvents(req.params.id as string);
    res.json({ data: events });
  }
);

// POST /api/content/:id/pipeline — record pipeline event
router.post(
  '/:id/pipeline',
  authenticate,
  requireRole('admin', 'editor'),
  validate(recordPipelineEventSchema),
  async (req, res) => {
    const event = await contentService.recordPipelineEvent(
      req.params.id as string,
      req.body.stage,
      req.body.action,
      req.user?.userId
    );
    res.status(201).json(event);
  }
);

// ── Policy Check Endpoints ───────────────────────────────

// POST /api/content/:id/policies/check — run all policies against content
router.post(
  '/:id/policies/check',
  authenticate,
  requireRole('admin', 'editor'),
  validate(checkPoliciesSchema),
  async (req, res) => {
    const results = await contentService.checkPolicies(req.params.id as string);
    res.json({ data: results });
  }
);

// GET /api/content/:id/policies — get stored policy results
router.get(
  '/:id/policies',
  authenticate,
  validate(policyResultsSchema),
  async (req, res) => {
    const results = await contentService.getPolicyResults(req.params.id as string);
    res.json({ data: results });
  }
);

export default router;
