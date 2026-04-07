import { Request, Response, NextFunction } from 'express';
import { recordApiLatency, metrics } from '../lib/metrics.js';

// ── Metrics Middleware ───────────────────────────────────────────────────────
// Automatically records HTTP request metrics for every API call:
// - Request count by method, path, and status code
// - Latency histogram for percentile calculations
// - Exposes /metrics endpoint for Prometheus scraping
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Normalize URL paths to prevent high-cardinality metric labels.
 * Replaces UUIDs, numeric IDs, and other dynamic segments with placeholders.
 *
 * Example: /api/content/550e8400-e29b-41d4-a716-446655440000 -> /api/content/:id
 */
function normalizePath(path: string): string {
  return path
    // UUID pattern
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, ':id')
    // Numeric IDs
    .replace(/\/\d+/g, '/:id')
    // CUID or nanoid-style IDs (long alphanumeric strings)
    .replace(/\/[a-z0-9]{20,}/gi, '/:id');
}

/** Paths to exclude from metrics collection */
const EXCLUDED_PATHS = new Set(['/health', '/ready', '/metrics', '/favicon.ico']);

/**
 * Express middleware that records request metrics automatically.
 * Mount before route handlers to capture all API traffic.
 */
export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  // Skip metrics for infrastructure endpoints
  if (EXCLUDED_PATHS.has(req.path)) {
    return next();
  }

  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const normalizedPath = normalizePath(req.path);
    recordApiLatency(req.method, normalizedPath, res.statusCode, duration);
  });

  next();
}

/**
 * Express route handler that exposes metrics in Prometheus text format.
 * Mount at GET /metrics:
 *
 * ```ts
 * app.get('/metrics', metricsEndpoint);
 * ```
 */
export function metricsEndpoint(_req: Request, res: Response) {
  res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
  res.send(metrics.toPrometheus());
}

/**
 * Express route handler that exposes metrics as JSON.
 * Useful for custom dashboards or debugging.
 * Mount at GET /metrics/json:
 *
 * ```ts
 * app.get('/metrics/json', metricsJsonEndpoint);
 * ```
 */
export function metricsJsonEndpoint(_req: Request, res: Response) {
  res.json(metrics.toJSON());
}
