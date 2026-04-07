// ── Supertest Test Helper ──────────────────────────────────
// Provides a reusable Express app factory for integration tests.
// Mounts routers with the same error handler used in production
// so that status codes and error response shapes are realistic.
//
// Includes an async error catch-all so that rejected promises in
// route handlers are forwarded to the error handler, matching the
// behaviour of Express 5 / express-async-errors.

import express, { type Router, type Request, type Response, type NextFunction } from 'express';
import { errorHandler } from '../../src/middleware/errorHandler.js';

/**
 * Wraps an Express router so that async errors in route handlers
 * are caught and forwarded to next(). Express 4 does not do this
 * automatically for async handlers.
 */
function wrapAsyncRouter(router: Router): Router {
  const wrappedRouter = express.Router();

  // Walk the router stack and wrap any async handlers
  for (const layer of (router as unknown as { stack: Array<{ route?: { stack: Array<{ handle: Function; method?: string }> }; handle: Function; name?: string; regexp?: RegExp; path?: string; keys?: Array<{ name: string }> }> }).stack) {
    if (layer.route) {
      // This is a route layer — wrap each handler in the route stack
      for (const routeLayer of layer.route.stack) {
        const original = routeLayer.handle;
        if (original.length <= 3) {
          routeLayer.handle = (req: Request, res: Response, next: NextFunction) => {
            const result = original(req, res, next);
            if (result && typeof result.catch === 'function') {
              result.catch(next);
            }
          };
        }
      }
    }
  }

  return router;
}

/**
 * Creates a minimal Express app with JSON parsing and
 * the production error handler. Mount routers via mountRouter()
 * or pass them directly to createTestApp().
 *
 * All async route handlers are wrapped so their rejected promises
 * are forwarded to the error handler (Express 4 compatibility).
 */
export function createTestApp(...mounts: Array<{ path: string; router: Router }>) {
  const app = express();
  app.use(express.json());

  for (const { path, router } of mounts) {
    app.use(path, wrapAsyncRouter(router));
  }

  // Must be registered AFTER routes for Express to recognise
  // it as an error-handling middleware (4-arg signature).
  app.use(errorHandler);

  return app;
}

/**
 * Convenience wrapper: creates an app and mounts a single router.
 */
export function mountRouter(path: string, router: Router) {
  return createTestApp({ path, router });
}

// Re-export auth helpers so integration tests can import from one place.
export {
  createTestToken,
  createExpiredToken,
  createInvalidToken,
  adminHeaders,
  editorHeaders,
  reviewerHeaders,
  viewerHeaders,
  unauthHeaders,
  ROLE_PAYLOADS,
} from './auth.helper.js';
