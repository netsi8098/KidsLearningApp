import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { logger } from '../lib/logger.js';

// ── Request Logger Middleware ─────────────────────────────────────────────────
// Logs every HTTP request with structured data including:
// - Unique request ID (x-request-id) for distributed tracing
// - Method, path, status code, duration
// - User context (when authenticated)
// - Automatic severity escalation for errors and slow requests
// ─────────────────────────────────────────────────────────────────────────────

// Extend Express Request to include requestId
declare global {
  namespace Express {
    interface Request {
      requestId: string;
    }
  }
}

/** Paths to exclude from logging (e.g. health checks, readiness probes) */
const SILENT_PATHS = new Set(['/health', '/ready', '/metrics']);

/** Threshold in ms above which requests are logged as warnings */
const SLOW_REQUEST_THRESHOLD_MS = 1000;

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  // Propagate or generate a unique request ID for tracing
  const requestId = (req.headers['x-request-id'] as string) || randomUUID();
  const startTime = Date.now();

  // Attach to request object for downstream handlers
  req.requestId = requestId;

  // Echo the request ID back in the response for client-side correlation
  res.setHeader('x-request-id', requestId);

  // Skip noisy health check logs
  if (SILENT_PATHS.has(req.path)) {
    return next();
  }

  // Log when the response finishes (not when it starts)
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logData = {
      requestId,
      method: req.method,
      path: req.path,
      query: Object.keys(req.query).length > 0 ? req.query : undefined,
      statusCode: res.statusCode,
      duration,
      contentLength: res.getHeader('content-length'),
      userAgent: req.headers['user-agent'],
      ip: req.ip,
      userId: (req as Record<string, any>).user?.id,
    };

    if (res.statusCode >= 500) {
      logger.error(logData, 'Request failed');
    } else if (res.statusCode >= 400) {
      logger.warn(logData, 'Client error');
    } else if (duration > SLOW_REQUEST_THRESHOLD_MS) {
      logger.warn(logData, 'Slow request');
    } else {
      logger.info(logData, 'Request completed');
    }
  });

  next();
}
