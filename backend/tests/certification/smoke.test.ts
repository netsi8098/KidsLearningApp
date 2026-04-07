// ── Smoke Test Suite ──────────────────────────────────────────
// Quick-check that all modules load without import errors.
// This catches broken imports, missing exports, and syntax issues
// before deeper tests run.
//
// Run with: vitest run tests/certification/smoke.test.ts

import { describe, it, expect, vi } from 'vitest';

// ── Mock Prisma before any module imports ─────────────────────
// All modules import prisma at the top level, so we must mock it
// before dynamic imports resolve.

vi.mock('../../src/lib/prisma.js', () => ({
  prisma: new Proxy(
    {},
    {
      get: (_target, prop) => {
        if (typeof prop === 'string' && prop.startsWith('$')) {
          return vi.fn();
        }
        // Return a model-like object for any property access
        return new Proxy(
          {},
          {
            get: () => vi.fn().mockResolvedValue(null),
          }
        );
      },
    }
  ),
}));

vi.mock('../../src/lib/audit.js', () => ({
  logAudit: vi.fn().mockResolvedValue(undefined),
  getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
}));

vi.mock('../../src/lib/queue.js', () => ({
  addJob: vi.fn().mockResolvedValue(undefined),
  createQueue: vi.fn().mockReturnValue({ add: vi.fn() }),
}));

vi.mock('../../src/lib/storage.js', () => ({
  uploadFile: vi.fn().mockResolvedValue('https://example.com/file.jpg'),
  deleteFile: vi.fn().mockResolvedValue(undefined),
  getSignedUrl: vi.fn().mockResolvedValue('https://example.com/signed'),
}));

vi.mock('../../src/lib/policyEngine.js', () => ({
  evaluateContentPolicies: vi.fn().mockResolvedValue([]),
}));

// ── Router Module Imports ──────────────────────────────────────

describe('Smoke Test Suite', () => {
  describe('Router Modules', () => {
    const routerModules = [
      { name: 'content', path: '../../src/modules/content/router.js' },
      { name: 'auth', path: '../../src/modules/auth/router.js' },
      { name: 'subscription', path: '../../src/modules/subscription/router.js' },
      { name: 'sync', path: '../../src/modules/sync/router.js' },
      { name: 'recommendation', path: '../../src/modules/recommendation/router.js' },
      { name: 'privacy', path: '../../src/modules/privacy/router.js' },
      { name: 'feature-flags', path: '../../src/modules/feature-flags/router.js' },
      { name: 'curriculum', path: '../../src/modules/curriculum/router.js' },
      { name: 'search', path: '../../src/modules/search/router.js' },
      { name: 'release', path: '../../src/modules/release/router.js' },
      { name: 'qa', path: '../../src/modules/qa/router.js' },
      { name: 'review', path: '../../src/modules/review/router.js' },
      { name: 'household', path: '../../src/modules/household/router.js' },
      { name: 'permissions', path: '../../src/modules/permissions/router.js' },
      { name: 'caregiver', path: '../../src/modules/caregiver/router.js' },
      { name: 'help-center', path: '../../src/modules/help-center/router.js' },
      { name: 'parent-tips', path: '../../src/modules/parent-tips/router.js' },
      { name: 'deep-links', path: '../../src/modules/deep-links/router.js' },
      { name: 'messages', path: '../../src/modules/messages/router.js' },
      { name: 'offline-packs', path: '../../src/modules/offline-packs/router.js' },
      { name: 'experiments', path: '../../src/modules/experiments/router.js' },
      { name: 'exports', path: '../../src/modules/exports/router.js' },
      { name: 'system', path: '../../src/modules/system/router.js' },
      { name: 'routines', path: '../../src/modules/routines/router.js' },
    ];

    for (const mod of routerModules) {
      it(`should import ${mod.name} router without errors`, async () => {
        const module = await import(mod.path);
        const router = module.default;

        expect(router).toBeDefined();
        // Express routers have a 'stack' property containing route layers
        expect(router.stack).toBeDefined();
        expect(Array.isArray(router.stack)).toBe(true);
      });
    }
  });

  // ── Service Module Imports ──────────────────────────────────

  describe('Service Modules', () => {
    const serviceModules = [
      { name: 'content', path: '../../src/modules/content/service.js' },
      { name: 'subscription', path: '../../src/modules/subscription/service.js' },
      { name: 'sync', path: '../../src/modules/sync/service.js' },
      { name: 'recommendation', path: '../../src/modules/recommendation/service.js' },
      { name: 'privacy', path: '../../src/modules/privacy/service.js' },
      { name: 'feature-flags', path: '../../src/modules/feature-flags/service.js' },
      { name: 'curriculum', path: '../../src/modules/curriculum/service.js' },
      { name: 'search', path: '../../src/modules/search/service.js' },
      { name: 'release', path: '../../src/modules/release/service.js' },
      { name: 'qa', path: '../../src/modules/qa/service.js' },
      { name: 'household', path: '../../src/modules/household/service.js' },
      { name: 'permissions', path: '../../src/modules/permissions/service.js' },
      { name: 'caregiver', path: '../../src/modules/caregiver/service.js' },
      { name: 'help-center', path: '../../src/modules/help-center/service.js' },
      { name: 'parent-tips', path: '../../src/modules/parent-tips/service.js' },
      { name: 'deep-links', path: '../../src/modules/deep-links/service.js' },
      { name: 'messages', path: '../../src/modules/messages/service.js' },
      { name: 'offline-packs', path: '../../src/modules/offline-packs/service.js' },
      { name: 'experiments', path: '../../src/modules/experiments/service.js' },
      { name: 'exports', path: '../../src/modules/exports/service.js' },
      { name: 'system', path: '../../src/modules/system/service.js' },
      { name: 'routines', path: '../../src/modules/routines/service.js' },
    ];

    for (const mod of serviceModules) {
      it(`should import ${mod.name} service without errors`, async () => {
        const module = await import(mod.path);

        expect(module).toBeDefined();
        // Services should export at least one function
        const exportedFunctions = Object.values(module).filter(
          (exp) => typeof exp === 'function'
        );
        expect(exportedFunctions.length).toBeGreaterThan(0);
      });
    }
  });

  // ── Schema Module Imports ──────────────────────────────────

  describe('Schema Modules', () => {
    const schemaModules = [
      { name: 'content', path: '../../src/modules/content/schemas.js' },
      { name: 'subscription', path: '../../src/modules/subscription/schemas.js' },
      { name: 'recommendation', path: '../../src/modules/recommendation/schemas.js' },
      { name: 'privacy', path: '../../src/modules/privacy/schemas.js' },
      { name: 'feature-flags', path: '../../src/modules/feature-flags/schemas.js' },
      { name: 'curriculum', path: '../../src/modules/curriculum/schemas.js' },
      { name: 'search', path: '../../src/modules/search/schemas.js' },
      { name: 'release', path: '../../src/modules/release/schemas.js' },
      { name: 'qa', path: '../../src/modules/qa/schemas.js' },
      { name: 'permissions', path: '../../src/modules/permissions/schemas.js' },
      { name: 'caregiver', path: '../../src/modules/caregiver/schemas.js' },
      { name: 'help-center', path: '../../src/modules/help-center/schemas.js' },
      { name: 'parent-tips', path: '../../src/modules/parent-tips/schemas.js' },
      { name: 'deep-links', path: '../../src/modules/deep-links/schemas.js' },
      { name: 'messages', path: '../../src/modules/messages/schemas.js' },
      { name: 'offline-packs', path: '../../src/modules/offline-packs/schemas.js' },
      { name: 'experiments', path: '../../src/modules/experiments/schemas.js' },
      { name: 'exports', path: '../../src/modules/exports/schemas.js' },
      { name: 'system', path: '../../src/modules/system/schemas.js' },
      { name: 'routines', path: '../../src/modules/routines/schemas.js' },
    ];

    for (const mod of schemaModules) {
      it(`should import ${mod.name} schemas without errors`, async () => {
        const module = await import(mod.path);

        expect(module).toBeDefined();
        // Schema modules should export Zod schemas (objects with .parse or .safeParse)
        const exportedSchemas = Object.values(module).filter(
          (exp) => exp && typeof exp === 'object' && 'safeParse' in (exp as object)
        );
        expect(exportedSchemas.length).toBeGreaterThan(0);
      });
    }
  });

  // ── Library Module Imports ──────────────────────────────────

  describe('Library Modules', () => {
    const libModules = [
      { name: 'errors', path: '../../src/lib/errors.js' },
      { name: 'validate', path: '../../src/lib/validate.js' },
      { name: 'featureFlags', path: '../../src/lib/featureFlags.js' },
      { name: 'syncEngine', path: '../../src/lib/syncEngine.js' },
      { name: 'audit', path: '../../src/lib/audit.js' },
      { name: 'softDelete', path: '../../src/lib/softDelete.js' },
      { name: 'entitlement', path: '../../src/lib/entitlement.js' },
    ];

    for (const mod of libModules) {
      it(`should import ${mod.name} library without errors`, async () => {
        const module = await import(mod.path);

        expect(module).toBeDefined();
        // Libraries should export at least one named export
        const exportCount = Object.keys(module).length;
        expect(exportCount).toBeGreaterThan(0);
      });
    }
  });

  // ── Middleware Imports ──────────────────────────────────────

  describe('Middleware', () => {
    it('should import auth middleware without errors', async () => {
      const module = await import('../../src/middleware/auth.js');

      expect(module.authenticate).toBeDefined();
      expect(typeof module.authenticate).toBe('function');
      expect(module.requireRole).toBeDefined();
      expect(typeof module.requireRole).toBe('function');
      expect(module.signToken).toBeDefined();
      expect(typeof module.signToken).toBe('function');
    });

    it('should import errorHandler middleware without errors', async () => {
      const module = await import('../../src/middleware/errorHandler.js');

      expect(module.errorHandler).toBeDefined();
      expect(typeof module.errorHandler).toBe('function');
      // Express error handlers have arity 4 (err, req, res, next)
      expect(module.errorHandler.length).toBe(4);
    });
  });

  // ── Error Classes ──────────────────────────────────────────

  describe('Error Classes', () => {
    it('should instantiate all error types correctly', async () => {
      const errors = await import('../../src/lib/errors.js');

      const appErr = new errors.AppError(500, 'test');
      expect(appErr.statusCode).toBe(500);
      expect(appErr.message).toBe('test');

      const notFound = new errors.NotFoundError('Content', 'abc');
      expect(notFound.statusCode).toBe(404);
      expect(notFound.code).toBe('NOT_FOUND');

      const validation = new errors.ValidationError('bad input', { field: ['Required'] });
      expect(validation.statusCode).toBe(400);
      expect(validation.code).toBe('VALIDATION_ERROR');
      expect(validation.details).toEqual({ field: ['Required'] });

      const unauthorized = new errors.UnauthorizedError();
      expect(unauthorized.statusCode).toBe(401);
      expect(unauthorized.code).toBe('UNAUTHORIZED');

      const forbidden = new errors.ForbiddenError();
      expect(forbidden.statusCode).toBe(403);
      expect(forbidden.code).toBe('FORBIDDEN');

      const conflict = new errors.ConflictError('duplicate');
      expect(conflict.statusCode).toBe(409);
      expect(conflict.code).toBe('CONFLICT');

      const rateLimit = new errors.RateLimitError();
      expect(rateLimit.statusCode).toBe(429);
      expect(rateLimit.code).toBe('RATE_LIMIT');
    });

    it('should extend Error prototype chain correctly', async () => {
      const { AppError, NotFoundError, ValidationError, UnauthorizedError, ForbiddenError, ConflictError } =
        await import('../../src/lib/errors.js');

      expect(new NotFoundError('X')).toBeInstanceOf(AppError);
      expect(new NotFoundError('X')).toBeInstanceOf(Error);
      expect(new ValidationError('X')).toBeInstanceOf(AppError);
      expect(new UnauthorizedError()).toBeInstanceOf(AppError);
      expect(new ForbiddenError()).toBeInstanceOf(AppError);
      expect(new ConflictError('X')).toBeInstanceOf(AppError);
    });
  });

  // ── Types Module ────────────────────────────────────────────

  describe('Shared Types', () => {
    it('should export paginate utility correctly', async () => {
      const { paginate } = await import('../../src/types/index.js');

      expect(typeof paginate).toBe('function');

      const result = paginate(['a', 'b'], 10, { page: 1, limit: 2 });

      expect(result).toEqual({
        data: ['a', 'b'],
        total: 10,
        page: 1,
        limit: 2,
        totalPages: 5,
      });
    });
  });
});
