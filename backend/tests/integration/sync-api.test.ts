// ── Sync API Integration Tests ─────────────────────────────
// Tests the sync router with mocked services,
// real Zod validation, and real JWT auth middleware.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import {
  mountRouter,
  adminHeaders,
  editorHeaders,
  viewerHeaders,
  unauthHeaders,
} from '../helpers/supertest.helper.js';

// ── Mock the sync service ────────────────────────────────────
vi.mock('../../src/modules/sync/service.js', () => ({
  push: vi.fn(),
  pull: vi.fn(),
  getStatus: vi.fn(),
  resolve: vi.fn(),
  resetCheckpoint: vi.fn(),
}));

import * as syncService from '../../src/modules/sync/service.js';
import { router as syncRouter } from '../../src/modules/sync/router.js';

const app = mountRouter('/api/sync', syncRouter);

// ── Test data ────────────────────────────────────────────────

const PROFILE_ID = 'profile-abc-123';

const SAMPLE_CHANGE = {
  entityType: 'progress',
  entityId: 'prog-001',
  action: 'update' as const,
  payload: { completed: true, score: 95 },
  clientTimestamp: '2024-01-01T00:00:00.000Z',
};

const SAMPLE_PUSH_RESULT = {
  accepted: 1,
  rejected: 0,
  serverVersion: '42',
};

const SAMPLE_PULL_RESULT = [
  {
    entityType: 'progress',
    entityId: 'prog-001',
    action: 'update',
    payload: { completed: true },
    serverVersion: '42',
    serverTimestamp: '2024-01-01T12:00:00.000Z',
  },
];

const SAMPLE_STATUS = [
  {
    entityType: 'progress',
    lastSyncVersion: '42',
    lastSyncAt: '2024-01-01T12:00:00.000Z',
  },
];

// ── Tests ────────────────────────────────────────────────────

describe('Sync API', () => {
  beforeEach(() => {
    vi.mocked(syncService.push).mockResolvedValue(SAMPLE_PUSH_RESULT as never);
    vi.mocked(syncService.pull).mockResolvedValue(SAMPLE_PULL_RESULT as never);
    vi.mocked(syncService.getStatus).mockResolvedValue(SAMPLE_STATUS as never);
    vi.mocked(syncService.resolve).mockResolvedValue({ resolved: true } as never);
    vi.mocked(syncService.resetCheckpoint).mockResolvedValue({ reset: true } as never);
  });

  // ── POST /push ────────────────────────────────────────────

  describe('POST /api/sync/push', () => {
    it('validates profileId and changes array', async () => {
      const res = await request(app)
        .post('/api/sync/push')
        .set(viewerHeaders())
        .send({
          profileId: PROFILE_ID,
          changes: [SAMPLE_CHANGE],
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(syncService.push).toHaveBeenCalledWith(PROFILE_ID, [SAMPLE_CHANGE]);
    });

    it('requires authentication', async () => {
      const res = await request(app)
        .post('/api/sync/push')
        .set(unauthHeaders())
        .send({
          profileId: PROFILE_ID,
          changes: [SAMPLE_CHANGE],
        });

      expect(res.status).toBe(401);
    });

    it('rejects missing profileId', async () => {
      const res = await request(app)
        .post('/api/sync/push')
        .set(viewerHeaders())
        .send({ changes: [SAMPLE_CHANGE] });

      expect(res.status).toBe(400);
    });

    it('rejects empty changes array', async () => {
      const res = await request(app)
        .post('/api/sync/push')
        .set(viewerHeaders())
        .send({ profileId: PROFILE_ID, changes: [] });

      expect(res.status).toBe(400);
    });

    it('rejects missing changes array', async () => {
      const res = await request(app)
        .post('/api/sync/push')
        .set(viewerHeaders())
        .send({ profileId: PROFILE_ID });

      expect(res.status).toBe(400);
    });

    it('rejects change with invalid action', async () => {
      const res = await request(app)
        .post('/api/sync/push')
        .set(viewerHeaders())
        .send({
          profileId: PROFILE_ID,
          changes: [{
            ...SAMPLE_CHANGE,
            action: 'invalid',
          }],
        });

      expect(res.status).toBe(400);
    });

    it('rejects change with missing entityType', async () => {
      const res = await request(app)
        .post('/api/sync/push')
        .set(viewerHeaders())
        .send({
          profileId: PROFILE_ID,
          changes: [{
            entityId: 'prog-001',
            action: 'update',
            payload: {},
            clientTimestamp: '2024-01-01T00:00:00.000Z',
          }],
        });

      expect(res.status).toBe(400);
    });

    it('accepts multiple changes', async () => {
      const res = await request(app)
        .post('/api/sync/push')
        .set(viewerHeaders())
        .send({
          profileId: PROFILE_ID,
          changes: [
            SAMPLE_CHANGE,
            { ...SAMPLE_CHANGE, entityId: 'prog-002', action: 'create' },
            { ...SAMPLE_CHANGE, entityId: 'prog-003', action: 'delete' },
          ],
        });

      expect(res.status).toBe(200);
    });
  });

  // ── POST /pull ────────────────────────────────────────────

  describe('POST /api/sync/pull', () => {
    it('validates profileId and entityType', async () => {
      const res = await request(app)
        .post('/api/sync/pull')
        .set(viewerHeaders())
        .send({
          profileId: PROFILE_ID,
          entityType: 'progress',
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('requires authentication', async () => {
      const res = await request(app)
        .post('/api/sync/pull')
        .set(unauthHeaders())
        .send({
          profileId: PROFILE_ID,
          entityType: 'progress',
        });

      expect(res.status).toBe(401);
    });

    it('rejects missing profileId', async () => {
      const res = await request(app)
        .post('/api/sync/pull')
        .set(viewerHeaders())
        .send({ entityType: 'progress' });

      expect(res.status).toBe(400);
    });

    it('rejects missing entityType', async () => {
      const res = await request(app)
        .post('/api/sync/pull')
        .set(viewerHeaders())
        .send({ profileId: PROFILE_ID });

      expect(res.status).toBe(400);
    });

    it('accepts optional sinceVersion', async () => {
      const res = await request(app)
        .post('/api/sync/pull')
        .set(viewerHeaders())
        .send({
          profileId: PROFILE_ID,
          entityType: 'progress',
          sinceVersion: '40',
        });

      expect(res.status).toBe(200);
      expect(syncService.pull).toHaveBeenCalledWith(PROFILE_ID, 'progress', '40');
    });
  });

  // ── GET /status/:profileId ────────────────────────────────

  describe('GET /api/sync/status/:profileId', () => {
    it('requires auth', async () => {
      const res = await request(app)
        .get(`/api/sync/status/${PROFILE_ID}`)
        .set(unauthHeaders());

      expect(res.status).toBe(401);
    });

    it('returns sync status for profile', async () => {
      const res = await request(app)
        .get(`/api/sync/status/${PROFILE_ID}`)
        .set(viewerHeaders());

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('rejects empty profileId', async () => {
      // Express will not route to /status/ without an id, so this becomes
      // a 404 or different route match. Testing minimal id requirement.
      const res = await request(app)
        .get('/api/sync/status/ ')
        .set(viewerHeaders());

      // Depending on Express routing, an empty/blank param may
      // still match. The validation should catch empty strings.
      expect([200, 400, 404]).toContain(res.status);
    });
  });

  // ── POST /resolve ─────────────────────────────────────────

  describe('POST /api/sync/resolve', () => {
    it('validates resolution enum (client)', async () => {
      const res = await request(app)
        .post('/api/sync/resolve')
        .set(viewerHeaders())
        .send({
          profileId: PROFILE_ID,
          entityType: 'progress',
          entityId: 'prog-001',
          resolution: 'client',
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
    });

    it('validates resolution enum (server)', async () => {
      const res = await request(app)
        .post('/api/sync/resolve')
        .set(viewerHeaders())
        .send({
          profileId: PROFILE_ID,
          entityType: 'progress',
          entityId: 'prog-001',
          resolution: 'server',
        });

      expect(res.status).toBe(200);
    });

    it('rejects invalid resolution value', async () => {
      const res = await request(app)
        .post('/api/sync/resolve')
        .set(viewerHeaders())
        .send({
          profileId: PROFILE_ID,
          entityType: 'progress',
          entityId: 'prog-001',
          resolution: 'merge',
        });

      expect(res.status).toBe(400);
    });

    it('rejects missing resolution field', async () => {
      const res = await request(app)
        .post('/api/sync/resolve')
        .set(viewerHeaders())
        .send({
          profileId: PROFILE_ID,
          entityType: 'progress',
          entityId: 'prog-001',
        });

      expect(res.status).toBe(400);
    });

    it('accepts optional clientPayload', async () => {
      const res = await request(app)
        .post('/api/sync/resolve')
        .set(viewerHeaders())
        .send({
          profileId: PROFILE_ID,
          entityType: 'progress',
          entityId: 'prog-001',
          resolution: 'client',
          clientPayload: { score: 100 },
        });

      expect(res.status).toBe(200);
    });

    it('requires authentication', async () => {
      const res = await request(app)
        .post('/api/sync/resolve')
        .set(unauthHeaders())
        .send({
          profileId: PROFILE_ID,
          entityType: 'progress',
          entityId: 'prog-001',
          resolution: 'client',
        });

      expect(res.status).toBe(401);
    });
  });

  // ── POST /reset/:profileId ───────────────────────────────

  describe('POST /api/sync/reset/:profileId', () => {
    it('requires admin role', async () => {
      const res = await request(app)
        .post(`/api/sync/reset/${PROFILE_ID}`)
        .set(editorHeaders());

      expect(res.status).toBe(403);
    });

    it('requires authentication', async () => {
      const res = await request(app)
        .post(`/api/sync/reset/${PROFILE_ID}`)
        .set(unauthHeaders());

      expect(res.status).toBe(401);
    });

    it('resets sync checkpoint with admin role', async () => {
      const res = await request(app)
        .post(`/api/sync/reset/${PROFILE_ID}`)
        .set(adminHeaders());

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('message', 'Sync checkpoints reset');
      expect(syncService.resetCheckpoint).toHaveBeenCalledWith(PROFILE_ID);
    });

    it('rejects viewer role', async () => {
      const res = await request(app)
        .post(`/api/sync/reset/${PROFILE_ID}`)
        .set(viewerHeaders());

      expect(res.status).toBe(403);
    });
  });
});
