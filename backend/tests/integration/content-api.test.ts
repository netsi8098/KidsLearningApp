// ── Content API Integration Tests ──────────────────────────
// Tests the content router handlers with mocked services,
// real Zod validation, and real JWT auth middleware.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import {
  mountRouter,
  adminHeaders,
  editorHeaders,
  viewerHeaders,
  unauthHeaders,
  createExpiredToken,
} from '../helpers/supertest.helper.js';

// ── Mock the content service ─────────────────────────────────
vi.mock('../../src/modules/content/service.js', () => ({
  listContent: vi.fn(),
  getContent: vi.fn(),
  createContent: vi.fn(),
  updateContent: vi.fn(),
  archiveContent: vi.fn(),
  addTags: vi.fn(),
  removeTag: vi.fn(),
  getContentHistory: vi.fn(),
  duplicateContent: vi.fn(),
  listContentSkills: vi.fn(),
  addSkills: vi.fn(),
  removeSkill: vi.fn(),
  getRefreshQueue: vi.fn(),
  getLifecycleStats: vi.fn(),
  updateLifecycle: vi.fn(),
  markRefreshed: vi.fn(),
  getPipelineEvents: vi.fn(),
  recordPipelineEvent: vi.fn(),
  checkPolicies: vi.fn(),
  getPolicyResults: vi.fn(),
}));

import * as contentService from '../../src/modules/content/service.js';
import contentRouter from '../../src/modules/content/router.js';

const app = mountRouter('/api/content', contentRouter);

// ── Test data ────────────────────────────────────────────────

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';
const VALID_UUID_2 = '660e8400-e29b-41d4-a716-446655440001';

const SAMPLE_CONTENT = {
  id: VALID_UUID,
  title: 'Learn the Alphabet',
  slug: 'learn-the-alphabet',
  type: 'alphabet',
  status: 'draft',
  ageGroup: 'age_3_4',
  difficulty: 'easy',
  accessTier: 'free',
  emoji: '',
  description: '',
  body: {},
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const PAGINATED_RESPONSE = {
  data: [SAMPLE_CONTENT],
  total: 1,
  page: 1,
  pageSize: 20,
};

// ── Tests ────────────────────────────────────────────────────

describe('Content API', () => {
  beforeEach(() => {
    vi.mocked(contentService.listContent).mockResolvedValue(PAGINATED_RESPONSE as never);
    vi.mocked(contentService.getContent).mockResolvedValue(SAMPLE_CONTENT as never);
    vi.mocked(contentService.createContent).mockResolvedValue(SAMPLE_CONTENT as never);
    vi.mocked(contentService.updateContent).mockResolvedValue(SAMPLE_CONTENT as never);
    vi.mocked(contentService.archiveContent).mockResolvedValue({ archived: true } as never);
    vi.mocked(contentService.addTags).mockResolvedValue(SAMPLE_CONTENT as never);
    vi.mocked(contentService.removeTag).mockResolvedValue({ removed: true } as never);
    vi.mocked(contentService.getContentHistory).mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      pageSize: 10,
    } as never);
    vi.mocked(contentService.duplicateContent).mockResolvedValue({
      ...SAMPLE_CONTENT,
      id: VALID_UUID_2,
      slug: 'learn-the-alphabet-copy',
    } as never);
    vi.mocked(contentService.listContentSkills).mockResolvedValue([] as never);
    vi.mocked(contentService.addSkills).mockResolvedValue(SAMPLE_CONTENT as never);
    vi.mocked(contentService.removeSkill).mockResolvedValue({ removed: true } as never);
    vi.mocked(contentService.getRefreshQueue).mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      pageSize: 20,
    } as never);
    vi.mocked(contentService.getLifecycleStats).mockResolvedValue({} as never);
    vi.mocked(contentService.updateLifecycle).mockResolvedValue({} as never);
    vi.mocked(contentService.markRefreshed).mockResolvedValue({} as never);
    vi.mocked(contentService.getPipelineEvents).mockResolvedValue([] as never);
    vi.mocked(contentService.recordPipelineEvent).mockResolvedValue({} as never);
    vi.mocked(contentService.checkPolicies).mockResolvedValue([] as never);
    vi.mocked(contentService.getPolicyResults).mockResolvedValue([] as never);
  });

  // ── GET / ─────────────────────────────────────────────────

  describe('GET /api/content', () => {
    it('returns paginated list with { data, total, page, pageSize }', async () => {
      const res = await request(app).get('/api/content');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('page');
      expect(res.body).toHaveProperty('pageSize');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(typeof res.body.total).toBe('number');
      expect(typeof res.body.page).toBe('number');
      expect(typeof res.body.pageSize).toBe('number');
    });

    it('accepts valid query filters', async () => {
      const res = await request(app)
        .get('/api/content')
        .query({ page: 2, limit: 10, type: 'story', status: 'published' });

      expect(res.status).toBe(200);
      expect(contentService.listContent).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2,
          limit: 10,
          type: 'story',
          status: 'published',
        })
      );
    });

    it('rejects invalid page number (0)', async () => {
      const res = await request(app)
        .get('/api/content')
        .query({ page: 0 });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('rejects invalid content type', async () => {
      const res = await request(app)
        .get('/api/content')
        .query({ type: 'nonexistent' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('rejects invalid sort order', async () => {
      const res = await request(app)
        .get('/api/content')
        .query({ sortOrder: 'random' });

      expect(res.status).toBe(400);
    });
  });

  // ── GET /:id ──────────────────────────────────────────────

  describe('GET /api/content/:id', () => {
    it('returns content object with required fields', async () => {
      const res = await request(app).get(`/api/content/${VALID_UUID}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('title');
      expect(res.body).toHaveProperty('slug');
      expect(res.body).toHaveProperty('type');
      expect(res.body).toHaveProperty('status');
      expect(res.body).toHaveProperty('ageGroup');
    });

    it('rejects non-UUID id parameter', async () => {
      const res = await request(app).get('/api/content/not-a-uuid');

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  // ── POST / ─────────────────────────────────────────────────

  describe('POST /api/content', () => {
    const validPayload = {
      title: 'New Lesson',
      slug: 'new-lesson',
      type: 'lesson',
    };

    it('requires authentication', async () => {
      const res = await request(app)
        .post('/api/content')
        .set(unauthHeaders())
        .send(validPayload);

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('requires editor or admin role', async () => {
      const res = await request(app)
        .post('/api/content')
        .set(viewerHeaders())
        .send(validPayload);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('creates content with editor role and returns 201', async () => {
      const res = await request(app)
        .post('/api/content')
        .set(editorHeaders())
        .send(validPayload);

      expect(res.status).toBe(201);
      expect(contentService.createContent).toHaveBeenCalled();
    });

    it('creates content with admin role', async () => {
      const res = await request(app)
        .post('/api/content')
        .set(adminHeaders())
        .send(validPayload);

      expect(res.status).toBe(201);
    });

    it('rejects missing title', async () => {
      const res = await request(app)
        .post('/api/content')
        .set(editorHeaders())
        .send({ slug: 'no-title', type: 'lesson' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects missing type', async () => {
      const res = await request(app)
        .post('/api/content')
        .set(editorHeaders())
        .send({ title: 'No Type', slug: 'no-type' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects missing slug', async () => {
      const res = await request(app)
        .post('/api/content')
        .set(editorHeaders())
        .send({ title: 'No Slug', type: 'lesson' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects invalid slug format (uppercase)', async () => {
      const res = await request(app)
        .post('/api/content')
        .set(editorHeaders())
        .send({ title: 'Bad Slug', slug: 'Bad-Slug', type: 'lesson' });

      expect(res.status).toBe(400);
    });

    it('rejects invalid content type', async () => {
      const res = await request(app)
        .post('/api/content')
        .set(editorHeaders())
        .send({ title: 'Bad Type', slug: 'bad-type', type: 'invalid_type' });

      expect(res.status).toBe(400);
    });

    it('rejects expired token', async () => {
      const expiredToken = createExpiredToken({ role: 'editor' });
      const res = await request(app)
        .post('/api/content')
        .set('Authorization', `Bearer ${expiredToken}`)
        .set('Content-Type', 'application/json')
        .send(validPayload);

      expect(res.status).toBe(401);
    });
  });

  // ── PATCH /:id ─────────────────────────────────────────────

  describe('PATCH /api/content/:id', () => {
    it('requires auth + editor role', async () => {
      const res = await request(app)
        .patch(`/api/content/${VALID_UUID}`)
        .set(viewerHeaders())
        .send({ title: 'Updated' });

      expect(res.status).toBe(403);
    });

    it('validates at least one field is present', async () => {
      const res = await request(app)
        .patch(`/api/content/${VALID_UUID}`)
        .set(editorHeaders())
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('updates content successfully with valid data', async () => {
      const res = await request(app)
        .patch(`/api/content/${VALID_UUID}`)
        .set(editorHeaders())
        .send({ title: 'Updated Title' });

      expect(res.status).toBe(200);
      expect(contentService.updateContent).toHaveBeenCalledWith(
        VALID_UUID,
        expect.objectContaining({ title: 'Updated Title' })
      );
    });

    it('rejects non-UUID id', async () => {
      const res = await request(app)
        .patch('/api/content/bad-id')
        .set(editorHeaders())
        .send({ title: 'Updated' });

      expect(res.status).toBe(400);
    });
  });

  // ── DELETE /:id ────────────────────────────────────────────

  describe('DELETE /api/content/:id', () => {
    it('requires admin role', async () => {
      const res = await request(app)
        .delete(`/api/content/${VALID_UUID}`)
        .set(editorHeaders());

      expect(res.status).toBe(403);
    });

    it('requires authentication', async () => {
      const res = await request(app)
        .delete(`/api/content/${VALID_UUID}`)
        .set(unauthHeaders());

      expect(res.status).toBe(401);
    });

    it('archives content with admin role', async () => {
      const res = await request(app)
        .delete(`/api/content/${VALID_UUID}`)
        .set(adminHeaders());

      expect(res.status).toBe(200);
      expect(contentService.archiveContent).toHaveBeenCalledWith(VALID_UUID);
    });
  });

  // ── POST /:id/tags ────────────────────────────────────────

  describe('POST /api/content/:id/tags', () => {
    it('validates tagIds is a non-empty array of UUIDs', async () => {
      const res = await request(app)
        .post(`/api/content/${VALID_UUID}/tags`)
        .set(editorHeaders())
        .send({ tagIds: [VALID_UUID_2] });

      expect(res.status).toBe(200);
      expect(contentService.addTags).toHaveBeenCalledWith(VALID_UUID, [VALID_UUID_2]);
    });

    it('rejects empty tagIds array', async () => {
      const res = await request(app)
        .post(`/api/content/${VALID_UUID}/tags`)
        .set(editorHeaders())
        .send({ tagIds: [] });

      expect(res.status).toBe(400);
    });

    it('rejects non-UUID tagIds', async () => {
      const res = await request(app)
        .post(`/api/content/${VALID_UUID}/tags`)
        .set(editorHeaders())
        .send({ tagIds: ['not-a-uuid'] });

      expect(res.status).toBe(400);
    });

    it('requires editor or admin role', async () => {
      const res = await request(app)
        .post(`/api/content/${VALID_UUID}/tags`)
        .set(viewerHeaders())
        .send({ tagIds: [VALID_UUID_2] });

      expect(res.status).toBe(403);
    });
  });

  // ── GET /:id/history ──────────────────────────────────────

  describe('GET /api/content/:id/history', () => {
    it('returns paginated audit entries', async () => {
      const res = await request(app).get(`/api/content/${VALID_UUID}/history`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('page');
      expect(res.body).toHaveProperty('pageSize');
    });

    it('rejects non-UUID id', async () => {
      const res = await request(app).get('/api/content/bad-id/history');

      expect(res.status).toBe(400);
    });
  });

  // ── POST /:id/duplicate ───────────────────────────────────

  describe('POST /api/content/:id/duplicate', () => {
    it('returns 201 on successful duplication', async () => {
      const res = await request(app)
        .post(`/api/content/${VALID_UUID}/duplicate`)
        .set(editorHeaders())
        .send({});

      expect(res.status).toBe(201);
      expect(contentService.duplicateContent).toHaveBeenCalled();
    });

    it('accepts optional newSlug and newTitle', async () => {
      const res = await request(app)
        .post(`/api/content/${VALID_UUID}/duplicate`)
        .set(editorHeaders())
        .send({ newSlug: 'copy-of-lesson', newTitle: 'Copy of Lesson' });

      expect(res.status).toBe(201);
    });

    it('requires editor role', async () => {
      const res = await request(app)
        .post(`/api/content/${VALID_UUID}/duplicate`)
        .set(viewerHeaders())
        .send({});

      expect(res.status).toBe(403);
    });
  });

  // ── Lifecycle Endpoints ───────────────────────────────────

  describe('Lifecycle Endpoints', () => {
    it('GET /lifecycle/refresh-queue requires editor role', async () => {
      const res = await request(app)
        .get('/api/content/lifecycle/refresh-queue')
        .set(viewerHeaders());

      expect(res.status).toBe(403);
    });

    it('GET /lifecycle/refresh-queue succeeds with editor role', async () => {
      const res = await request(app)
        .get('/api/content/lifecycle/refresh-queue')
        .set(editorHeaders());

      expect(res.status).toBe(200);
    });

    it('GET /lifecycle/stats requires editor role', async () => {
      const res = await request(app)
        .get('/api/content/lifecycle/stats')
        .set(viewerHeaders());

      expect(res.status).toBe(403);
    });

    it('GET /lifecycle/stats succeeds with editor role', async () => {
      const res = await request(app)
        .get('/api/content/lifecycle/stats')
        .set(editorHeaders());

      expect(res.status).toBe(200);
    });

    it('PATCH /:id/lifecycle requires editor role', async () => {
      const res = await request(app)
        .patch(`/api/content/${VALID_UUID}/lifecycle`)
        .set(viewerHeaders())
        .send({ freshnessScore: 0.8 });

      expect(res.status).toBe(403);
    });

    it('PATCH /:id/lifecycle validates at least one field', async () => {
      const res = await request(app)
        .patch(`/api/content/${VALID_UUID}/lifecycle`)
        .set(editorHeaders())
        .send({});

      expect(res.status).toBe(400);
    });

    it('PATCH /:id/lifecycle succeeds with valid data', async () => {
      const res = await request(app)
        .patch(`/api/content/${VALID_UUID}/lifecycle`)
        .set(editorHeaders())
        .send({ freshnessScore: 0.9, needsRefresh: false });

      expect(res.status).toBe(200);
    });

    it('POST /:id/lifecycle/refresh requires editor role', async () => {
      const res = await request(app)
        .post(`/api/content/${VALID_UUID}/lifecycle/refresh`)
        .set(viewerHeaders());

      expect(res.status).toBe(403);
    });

    it('POST /:id/lifecycle/refresh succeeds with editor role', async () => {
      const res = await request(app)
        .post(`/api/content/${VALID_UUID}/lifecycle/refresh`)
        .set(editorHeaders());

      expect(res.status).toBe(200);
    });
  });

  // ── Pipeline Endpoints ────────────────────────────────────

  describe('Pipeline Endpoints', () => {
    it('GET /:id/pipeline requires auth', async () => {
      const res = await request(app)
        .get(`/api/content/${VALID_UUID}/pipeline`)
        .set(unauthHeaders());

      expect(res.status).toBe(401);
    });

    it('GET /:id/pipeline succeeds with auth and returns { data }', async () => {
      const res = await request(app)
        .get(`/api/content/${VALID_UUID}/pipeline`)
        .set(viewerHeaders());

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('POST /:id/pipeline requires editor role', async () => {
      const res = await request(app)
        .post(`/api/content/${VALID_UUID}/pipeline`)
        .set(viewerHeaders())
        .send({ stage: 'draft', action: 'entered' });

      expect(res.status).toBe(403);
    });

    it('POST /:id/pipeline validates stage and action enums', async () => {
      const res = await request(app)
        .post(`/api/content/${VALID_UUID}/pipeline`)
        .set(editorHeaders())
        .send({ stage: 'invalid_stage', action: 'entered' });

      expect(res.status).toBe(400);
    });

    it('POST /:id/pipeline returns 201 on success', async () => {
      const res = await request(app)
        .post(`/api/content/${VALID_UUID}/pipeline`)
        .set(editorHeaders())
        .send({ stage: 'review', action: 'entered' });

      expect(res.status).toBe(201);
    });
  });

  // ── Policy Check Endpoints ────────────────────────────────

  describe('Policy Check Endpoints', () => {
    it('POST /:id/policies/check requires editor role', async () => {
      const res = await request(app)
        .post(`/api/content/${VALID_UUID}/policies/check`)
        .set(viewerHeaders());

      expect(res.status).toBe(403);
    });

    it('POST /:id/policies/check succeeds with editor role', async () => {
      const res = await request(app)
        .post(`/api/content/${VALID_UUID}/policies/check`)
        .set(editorHeaders());

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
    });

    it('GET /:id/policies requires auth', async () => {
      const res = await request(app)
        .get(`/api/content/${VALID_UUID}/policies`)
        .set(unauthHeaders());

      expect(res.status).toBe(401);
    });

    it('GET /:id/policies returns { data } with auth', async () => {
      const res = await request(app)
        .get(`/api/content/${VALID_UUID}/policies`)
        .set(viewerHeaders());

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
    });
  });
});
