import { describe, it, expect, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import { authenticate, requireRole, signToken } from '../../../src/middleware/auth';
import type { Role, AuthPayload } from '../../../src/middleware/auth';
import { UnauthorizedError, ForbiddenError } from '../../../src/lib/errors';

// ── Helpers ──────────────────────────────────────────────────

const JWT_SECRET = 'test-secret-key-for-testing';

function createMockRequest(overrides: Partial<Request> = {}): Request {
  return {
    headers: {},
    user: undefined,
    ...overrides,
  } as unknown as Request;
}

function createMockResponse(): Response {
  return {} as unknown as Response;
}

function createMockNext(): NextFunction {
  return vi.fn() as unknown as NextFunction;
}

function createToken(payload: AuthPayload, options?: jwt.SignOptions): string {
  return jwt.sign(payload, JWT_SECRET, options);
}

function createUserPayload(role: Role, overrides: Partial<AuthPayload> = {}): AuthPayload {
  return {
    userId: `user-${role}`,
    email: `${role}@test.com`,
    role,
    ...overrides,
  };
}

// ── Tests ────────────────────────────────────────────────────

describe('Authentication and Authorization', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // ── authenticate middleware ──────────────────────────────

  describe('authenticate middleware', () => {
    it('should throw UnauthorizedError when no Authorization header is present', () => {
      const req = createMockRequest({ headers: {} });
      const res = createMockResponse();
      const next = createMockNext();

      expect(() => authenticate(req, res, next)).toThrow(UnauthorizedError);
      expect(next).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedError when Authorization header is empty', () => {
      const req = createMockRequest({ headers: { authorization: '' } });
      const res = createMockResponse();
      const next = createMockNext();

      expect(() => authenticate(req, res, next)).toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError when Authorization header has wrong scheme', () => {
      const req = createMockRequest({
        headers: { authorization: 'Basic some-credentials' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      expect(() => authenticate(req, res, next)).toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError when token is invalid', () => {
      const req = createMockRequest({
        headers: { authorization: 'Bearer invalid-token-garbage' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      expect(() => authenticate(req, res, next)).toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError when token is expired', () => {
      const expiredToken = createToken(
        createUserPayload('admin'),
        { expiresIn: '0s' }
      );
      // Wait a moment to ensure expiry
      const req = createMockRequest({
        headers: { authorization: `Bearer ${expiredToken}` },
      });
      const res = createMockResponse();
      const next = createMockNext();

      expect(() => authenticate(req, res, next)).toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError when token is signed with wrong secret', () => {
      const token = jwt.sign(
        createUserPayload('admin'),
        'wrong-secret-key',
        { expiresIn: '7d' }
      );
      const req = createMockRequest({
        headers: { authorization: `Bearer ${token}` },
      });
      const res = createMockResponse();
      const next = createMockNext();

      expect(() => authenticate(req, res, next)).toThrow(UnauthorizedError);
    });

    it('should set req.user and call next() when token is valid', () => {
      const payload = createUserPayload('editor');
      const token = createToken(payload, { expiresIn: '7d' });
      const req = createMockRequest({
        headers: { authorization: `Bearer ${token}` },
      });
      const res = createMockResponse();
      const next = createMockNext();

      authenticate(req, res, next);

      expect(req.user).toBeDefined();
      expect(req.user!.userId).toBe(payload.userId);
      expect(req.user!.email).toBe(payload.email);
      expect(req.user!.role).toBe('editor');
      expect(next).toHaveBeenCalled();
    });

    it('should set req.user with correct role from token', () => {
      const roles: Role[] = ['admin', 'editor', 'reviewer', 'viewer'];

      for (const role of roles) {
        const payload = createUserPayload(role);
        const token = createToken(payload, { expiresIn: '7d' });
        const req = createMockRequest({
          headers: { authorization: `Bearer ${token}` },
        });
        const res = createMockResponse();
        const next = createMockNext();

        authenticate(req, res, next);

        expect(req.user!.role).toBe(role);
      }
    });

    it('should include error message about missing/invalid authorization', () => {
      const req = createMockRequest({ headers: {} });
      const res = createMockResponse();
      const next = createMockNext();

      try {
        authenticate(req, res, next);
        expect.unreachable('Expected UnauthorizedError');
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedError);
        expect((error as UnauthorizedError).message).toContain('authorization');
      }
    });
  });

  // ── requireRole middleware ───────────────────────────────

  describe('requireRole middleware', () => {
    it('should throw UnauthorizedError when req.user is not set', () => {
      const middleware = requireRole('admin');
      const req = createMockRequest();
      const res = createMockResponse();
      const next = createMockNext();

      expect(() => middleware(req, res, next)).toThrow(UnauthorizedError);
    });

    it('should throw ForbiddenError when user role does not match required role', () => {
      const middleware = requireRole('admin');
      const req = createMockRequest();
      req.user = createUserPayload('viewer');
      const res = createMockResponse();
      const next = createMockNext();

      expect(() => middleware(req, res, next)).toThrow(ForbiddenError);
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next() when user role matches required role', () => {
      const middleware = requireRole('admin');
      const req = createMockRequest();
      req.user = createUserPayload('admin');
      const res = createMockResponse();
      const next = createMockNext();

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should handle multiple allowed roles', () => {
      const middleware = requireRole('admin', 'editor');

      // Admin should pass
      const adminReq = createMockRequest();
      adminReq.user = createUserPayload('admin');
      const adminNext = createMockNext();
      middleware(adminReq, createMockResponse(), adminNext);
      expect(adminNext).toHaveBeenCalled();

      // Editor should pass
      const editorReq = createMockRequest();
      editorReq.user = createUserPayload('editor');
      const editorNext = createMockNext();
      middleware(editorReq, createMockResponse(), editorNext);
      expect(editorNext).toHaveBeenCalled();

      // Viewer should fail
      const viewerReq = createMockRequest();
      viewerReq.user = createUserPayload('viewer');
      const viewerNext = createMockNext();
      expect(() =>
        middleware(viewerReq, createMockResponse(), viewerNext)
      ).toThrow(ForbiddenError);
    });

    it('should include required roles in ForbiddenError message', () => {
      const middleware = requireRole('admin', 'editor');
      const req = createMockRequest();
      req.user = createUserPayload('viewer');
      const res = createMockResponse();
      const next = createMockNext();

      try {
        middleware(req, res, next);
        expect.unreachable('Expected ForbiddenError');
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenError);
        const message = (error as ForbiddenError).message;
        expect(message).toContain('admin');
        expect(message).toContain('editor');
      }
    });

    it('should return 403 status code for ForbiddenError', () => {
      const middleware = requireRole('admin');
      const req = createMockRequest();
      req.user = createUserPayload('viewer');
      const res = createMockResponse();
      const next = createMockNext();

      try {
        middleware(req, res, next);
      } catch (error) {
        expect((error as ForbiddenError).statusCode).toBe(403);
      }
    });

    it('should return 401 status code for UnauthorizedError', () => {
      const middleware = requireRole('admin');
      const req = createMockRequest(); // no user set
      const res = createMockResponse();
      const next = createMockNext();

      try {
        middleware(req, res, next);
      } catch (error) {
        expect((error as UnauthorizedError).statusCode).toBe(401);
      }
    });
  });

  // ── signToken utility ────────────────────────────────────

  describe('signToken', () => {
    it('should produce a valid JWT that can be verified', () => {
      const payload = createUserPayload('admin');
      const token = signToken(payload);

      const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;

      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe('admin');
    });

    it('should produce tokens that authenticate middleware accepts', () => {
      const payload = createUserPayload('editor');
      const token = signToken(payload);
      const req = createMockRequest({
        headers: { authorization: `Bearer ${token}` },
      });
      const res = createMockResponse();
      const next = createMockNext();

      authenticate(req, res, next);

      expect(req.user).toBeDefined();
      expect(req.user!.role).toBe('editor');
      expect(next).toHaveBeenCalled();
    });
  });

  // ── Role-Based Access Control ────────────────────────────

  describe('Role-based access control per role', () => {
    describe('Admin role', () => {
      const adminUser = createUserPayload('admin');

      it('should pass requireRole("admin")', () => {
        const middleware = requireRole('admin');
        const req = createMockRequest();
        req.user = adminUser;
        const next = createMockNext();

        middleware(req, createMockResponse(), next);
        expect(next).toHaveBeenCalled();
      });

      it('should pass requireRole("admin", "editor")', () => {
        const middleware = requireRole('admin', 'editor');
        const req = createMockRequest();
        req.user = adminUser;
        const next = createMockNext();

        middleware(req, createMockResponse(), next);
        expect(next).toHaveBeenCalled();
      });

      it('should pass requireRole("admin", "editor", "reviewer")', () => {
        const middleware = requireRole('admin', 'editor', 'reviewer');
        const req = createMockRequest();
        req.user = adminUser;
        const next = createMockNext();

        middleware(req, createMockResponse(), next);
        expect(next).toHaveBeenCalled();
      });
    });

    describe('Editor role', () => {
      const editorUser = createUserPayload('editor');

      it('should pass requireRole("admin", "editor")', () => {
        const middleware = requireRole('admin', 'editor');
        const req = createMockRequest();
        req.user = editorUser;
        const next = createMockNext();

        middleware(req, createMockResponse(), next);
        expect(next).toHaveBeenCalled();
      });

      it('should fail requireRole("admin")', () => {
        const middleware = requireRole('admin');
        const req = createMockRequest();
        req.user = editorUser;

        expect(() =>
          middleware(req, createMockResponse(), createMockNext())
        ).toThrow(ForbiddenError);
      });

      it('should pass requireRole("admin", "editor", "reviewer")', () => {
        const middleware = requireRole('admin', 'editor', 'reviewer');
        const req = createMockRequest();
        req.user = editorUser;
        const next = createMockNext();

        middleware(req, createMockResponse(), next);
        expect(next).toHaveBeenCalled();
      });
    });

    describe('Reviewer role', () => {
      const reviewerUser = createUserPayload('reviewer');

      it('should pass requireRole("admin", "editor", "reviewer")', () => {
        const middleware = requireRole('admin', 'editor', 'reviewer');
        const req = createMockRequest();
        req.user = reviewerUser;
        const next = createMockNext();

        middleware(req, createMockResponse(), next);
        expect(next).toHaveBeenCalled();
      });

      it('should fail requireRole("admin")', () => {
        const middleware = requireRole('admin');
        const req = createMockRequest();
        req.user = reviewerUser;

        expect(() =>
          middleware(req, createMockResponse(), createMockNext())
        ).toThrow(ForbiddenError);
      });

      it('should fail requireRole("admin", "editor")', () => {
        const middleware = requireRole('admin', 'editor');
        const req = createMockRequest();
        req.user = reviewerUser;

        expect(() =>
          middleware(req, createMockResponse(), createMockNext())
        ).toThrow(ForbiddenError);
      });
    });

    describe('Viewer role', () => {
      const viewerUser = createUserPayload('viewer');

      it('should fail requireRole("admin")', () => {
        const middleware = requireRole('admin');
        const req = createMockRequest();
        req.user = viewerUser;

        expect(() =>
          middleware(req, createMockResponse(), createMockNext())
        ).toThrow(ForbiddenError);
      });

      it('should fail requireRole("admin", "editor")', () => {
        const middleware = requireRole('admin', 'editor');
        const req = createMockRequest();
        req.user = viewerUser;

        expect(() =>
          middleware(req, createMockResponse(), createMockNext())
        ).toThrow(ForbiddenError);
      });

      it('should fail requireRole("admin", "editor", "reviewer")', () => {
        const middleware = requireRole('admin', 'editor', 'reviewer');
        const req = createMockRequest();
        req.user = viewerUser;

        expect(() =>
          middleware(req, createMockResponse(), createMockNext())
        ).toThrow(ForbiddenError);
      });
    });
  });

  // ── Endpoint-Level Access for Each Role ──────────────────

  describe('Endpoint access simulation per role', () => {
    // These tests simulate the middleware chains found in the routers

    const roles: Role[] = ['admin', 'editor', 'reviewer', 'viewer'];

    // Content endpoints
    describe('Content endpoints', () => {
      it('Admin CAN create content (requireRole admin, editor)', () => {
        const middleware = requireRole('admin', 'editor');
        const req = createMockRequest();
        req.user = createUserPayload('admin');
        const next = createMockNext();

        middleware(req, createMockResponse(), next);
        expect(next).toHaveBeenCalled();
      });

      it('Editor CAN create content (requireRole admin, editor)', () => {
        const middleware = requireRole('admin', 'editor');
        const req = createMockRequest();
        req.user = createUserPayload('editor');
        const next = createMockNext();

        middleware(req, createMockResponse(), next);
        expect(next).toHaveBeenCalled();
      });

      it('Reviewer CANNOT create content (requireRole admin, editor)', () => {
        const middleware = requireRole('admin', 'editor');
        const req = createMockRequest();
        req.user = createUserPayload('reviewer');

        expect(() =>
          middleware(req, createMockResponse(), createMockNext())
        ).toThrow(ForbiddenError);
      });

      it('Viewer CANNOT create content (requireRole admin, editor)', () => {
        const middleware = requireRole('admin', 'editor');
        const req = createMockRequest();
        req.user = createUserPayload('viewer');

        expect(() =>
          middleware(req, createMockResponse(), createMockNext())
        ).toThrow(ForbiddenError);
      });

      it('Only admin CAN delete content (requireRole admin)', () => {
        const middleware = requireRole('admin');

        for (const role of roles) {
          const req = createMockRequest();
          req.user = createUserPayload(role);

          if (role === 'admin') {
            const next = createMockNext();
            middleware(req, createMockResponse(), next);
            expect(next).toHaveBeenCalled();
          } else {
            expect(() =>
              middleware(req, createMockResponse(), createMockNext())
            ).toThrow(ForbiddenError);
          }
        }
      });
    });

    // Subscription endpoints
    describe('Subscription endpoints', () => {
      it('Only admin CAN manage subscriptions', () => {
        const middleware = requireRole('admin');

        for (const role of roles) {
          const req = createMockRequest();
          req.user = createUserPayload(role);

          if (role === 'admin') {
            const next = createMockNext();
            middleware(req, createMockResponse(), next);
            expect(next).toHaveBeenCalled();
          } else {
            expect(() =>
              middleware(req, createMockResponse(), createMockNext())
            ).toThrow(ForbiddenError);
          }
        }
      });
    });

    // Feature flag endpoints
    describe('Feature flag endpoints', () => {
      it('Only admin CAN kill feature flags', () => {
        const middleware = requireRole('admin');

        for (const role of roles) {
          const req = createMockRequest();
          req.user = createUserPayload(role);

          if (role === 'admin') {
            const next = createMockNext();
            middleware(req, createMockResponse(), next);
            expect(next).toHaveBeenCalled();
          } else {
            expect(() =>
              middleware(req, createMockResponse(), createMockNext())
            ).toThrow(ForbiddenError);
          }
        }
      });
    });

    // Sync endpoints
    describe('Sync endpoints', () => {
      it('Only admin CAN reset sync checkpoints', () => {
        const middleware = requireRole('admin');

        for (const role of roles) {
          const req = createMockRequest();
          req.user = createUserPayload(role);

          if (role === 'admin') {
            const next = createMockNext();
            middleware(req, createMockResponse(), next);
            expect(next).toHaveBeenCalled();
          } else {
            expect(() =>
              middleware(req, createMockResponse(), createMockNext())
            ).toThrow(ForbiddenError);
          }
        }
      });
    });

    // Review endpoints
    describe('Review endpoints', () => {
      it('Admin, editor, reviewer CAN create reviews', () => {
        const middleware = requireRole('admin', 'editor', 'reviewer');

        for (const role of roles) {
          const req = createMockRequest();
          req.user = createUserPayload(role);

          if (role === 'viewer') {
            expect(() =>
              middleware(req, createMockResponse(), createMockNext())
            ).toThrow(ForbiddenError);
          } else {
            const next = createMockNext();
            middleware(req, createMockResponse(), next);
            expect(next).toHaveBeenCalled();
          }
        }
      });

      it('Only admin and editor CAN assign reviewers', () => {
        const middleware = requireRole('admin', 'editor');

        for (const role of roles) {
          const req = createMockRequest();
          req.user = createUserPayload(role);

          if (role === 'admin' || role === 'editor') {
            const next = createMockNext();
            middleware(req, createMockResponse(), next);
            expect(next).toHaveBeenCalled();
          } else {
            expect(() =>
              middleware(req, createMockResponse(), createMockNext())
            ).toThrow(ForbiddenError);
          }
        }
      });
    });

    // Release endpoints
    describe('Release endpoints', () => {
      it('Editor and admin CAN create releases', () => {
        const middleware = requireRole('editor', 'admin');

        for (const role of roles) {
          const req = createMockRequest();
          req.user = createUserPayload(role);

          if (role === 'admin' || role === 'editor') {
            const next = createMockNext();
            middleware(req, createMockResponse(), next);
            expect(next).toHaveBeenCalled();
          } else {
            expect(() =>
              middleware(req, createMockResponse(), createMockNext())
            ).toThrow(ForbiddenError);
          }
        }
      });
    });

    // Privacy endpoints
    describe('Privacy endpoints', () => {
      it('Only admin CAN process data requests', () => {
        const middleware = requireRole('admin');

        for (const role of roles) {
          const req = createMockRequest();
          req.user = createUserPayload(role);

          if (role === 'admin') {
            const next = createMockNext();
            middleware(req, createMockResponse(), next);
            expect(next).toHaveBeenCalled();
          } else {
            expect(() =>
              middleware(req, createMockResponse(), createMockNext())
            ).toThrow(ForbiddenError);
          }
        }
      });
    });
  });
});
