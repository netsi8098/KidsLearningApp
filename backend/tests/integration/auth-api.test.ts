// ── Auth API Integration Tests ─────────────────────────────
// Tests the auth router handlers with mocked services,
// real Zod validation, and real JWT auth middleware.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import {
  mountRouter,
  adminHeaders,
  viewerHeaders,
  unauthHeaders,
  createTestToken,
  createExpiredToken,
  createInvalidToken,
} from '../helpers/supertest.helper.js';

// ── Mock the auth service ────────────────────────────────────
vi.mock('../../src/modules/auth/service.js', () => ({
  register: vi.fn(),
  login: vi.fn(),
  getProfile: vi.fn(),
  updateRole: vi.fn(),
  findUserById: vi.fn(),
  findUserByEmail: vi.fn(),
  generateToken: vi.fn(),
}));

import * as authService from '../../src/modules/auth/service.js';
import authRouter from '../../src/modules/auth/router.js';

const app = mountRouter('/api/auth', authRouter);

// ── Test data ────────────────────────────────────────────────

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';

const SAMPLE_USER = {
  id: VALID_UUID,
  email: 'test@kidslearning.test',
  name: 'Test User',
  role: 'viewer' as const,
};

const SAMPLE_AUTH_RESULT = {
  user: SAMPLE_USER,
  token: 'mock-jwt-token',
};

const SAMPLE_PROFILE = {
  ...SAMPLE_USER,
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
};

// ── Tests ────────────────────────────────────────────────────

describe('Auth API', () => {
  beforeEach(() => {
    vi.mocked(authService.register).mockResolvedValue(SAMPLE_AUTH_RESULT as never);
    vi.mocked(authService.login).mockResolvedValue(SAMPLE_AUTH_RESULT as never);
    vi.mocked(authService.getProfile).mockResolvedValue(SAMPLE_PROFILE as never);
    vi.mocked(authService.updateRole).mockResolvedValue({
      ...SAMPLE_USER,
      role: 'editor',
    } as never);
  });

  // ── POST /register ────────────────────────────────────────

  describe('POST /api/auth/register', () => {
    const validPayload = {
      email: 'new@kidslearning.test',
      password: 'securepass123',
      name: 'New User',
    };

    it('creates a user and returns 201 with user + token', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send(validPayload);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user).toHaveProperty('email');
      expect(res.body.user).toHaveProperty('name');
      expect(res.body.user).toHaveProperty('role');
    });

    it('rejects missing email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send({ password: 'securepass123', name: 'Test' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects invalid email format', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send({ email: 'not-an-email', password: 'securepass123', name: 'Test' });

      expect(res.status).toBe(400);
    });

    it('rejects password shorter than 8 characters', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send({ email: 'valid@test.com', password: 'short', name: 'Test' });

      expect(res.status).toBe(400);
    });

    it('rejects missing name', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send({ email: 'valid@test.com', password: 'securepass123' });

      expect(res.status).toBe(400);
    });

    it('rejects empty name', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send({ email: 'valid@test.com', password: 'securepass123', name: '' });

      expect(res.status).toBe(400);
    });

    it('handles service conflict error (duplicate email)', async () => {
      const { ConflictError } = await import('../../src/lib/errors.js');
      vi.mocked(authService.register).mockRejectedValue(
        new ConflictError('Email already registered')
      );

      const res = await request(app)
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send(validPayload);

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('CONFLICT');
    });
  });

  // ── POST /login ───────────────────────────────────────────

  describe('POST /api/auth/login', () => {
    const validCredentials = {
      email: 'test@kidslearning.test',
      password: 'securepass123',
    };

    it('returns token with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send(validCredentials);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('token');
      expect(typeof res.body.token).toBe('string');
    });

    it('returns 401 with invalid credentials', async () => {
      const { UnauthorizedError } = await import('../../src/lib/errors.js');
      vi.mocked(authService.login).mockRejectedValue(
        new UnauthorizedError('Invalid credentials')
      );

      const res = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send({ email: 'test@test.com', password: 'wrongpassword' });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('rejects missing email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send({ password: 'somepassword' });

      expect(res.status).toBe(400);
    });

    it('rejects missing password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send({ email: 'test@test.com' });

      expect(res.status).toBe(400);
    });

    it('rejects empty password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send({ email: 'test@test.com', password: '' });

      expect(res.status).toBe(400);
    });
  });

  // ── GET /me ───────────────────────────────────────────────

  describe('GET /api/auth/me', () => {
    it('returns user profile with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set(viewerHeaders());

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('email');
      expect(res.body).toHaveProperty('name');
      expect(res.body).toHaveProperty('role');
      expect(res.body).toHaveProperty('createdAt');
    });

    it('returns 401 without token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set(unauthHeaders());

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('returns 401 with expired token', async () => {
      const expiredToken = createExpiredToken();
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(res.status).toBe(401);
    });

    it('returns 401 with invalid token signature', async () => {
      const invalidToken = createInvalidToken();
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${invalidToken}`);

      expect(res.status).toBe(401);
    });

    it('returns 401 with malformed authorization header', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'InvalidFormat token123');

      expect(res.status).toBe(401);
    });

    it('returns 401 with missing Bearer prefix', async () => {
      const token = createTestToken();
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', token);

      expect(res.status).toBe(401);
    });
  });

  // ── PATCH /users/:id/role ─────────────────────────────────

  describe('PATCH /api/auth/users/:id/role', () => {
    it('requires admin role', async () => {
      const res = await request(app)
        .patch(`/api/auth/users/${VALID_UUID}/role`)
        .set(viewerHeaders())
        .send({ role: 'editor' });

      expect(res.status).toBe(403);
    });

    it('updates role with admin auth', async () => {
      const res = await request(app)
        .patch(`/api/auth/users/${VALID_UUID}/role`)
        .set(adminHeaders())
        .send({ role: 'editor' });

      expect(res.status).toBe(200);
      expect(authService.updateRole).toHaveBeenCalledWith(VALID_UUID, 'editor');
    });

    it('rejects invalid role value', async () => {
      const res = await request(app)
        .patch(`/api/auth/users/${VALID_UUID}/role`)
        .set(adminHeaders())
        .send({ role: 'superadmin' });

      expect(res.status).toBe(400);
    });

    it('rejects non-UUID user id', async () => {
      const res = await request(app)
        .patch('/api/auth/users/not-a-uuid/role')
        .set(adminHeaders())
        .send({ role: 'editor' });

      expect(res.status).toBe(400);
    });

    it('handles user not found error', async () => {
      const { NotFoundError } = await import('../../src/lib/errors.js');
      vi.mocked(authService.updateRole).mockRejectedValue(
        new NotFoundError('User', VALID_UUID)
      );

      const res = await request(app)
        .patch(`/api/auth/users/${VALID_UUID}/role`)
        .set(adminHeaders())
        .send({ role: 'editor' });

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });
});
