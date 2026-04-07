import { Request, Response, NextFunction } from 'express';
import { getConfig } from '../config/index.js';

// ── Types ─────────────────────────────────────────────────

interface MaintenanceState {
  enabled: boolean;
  reason?: string;
  estimatedEnd?: string;  // ISO 8601 timestamp
  allowedPaths: string[];
  startedAt?: string;     // ISO 8601 timestamp
  startedBy?: string;
}

// ── In-Memory Maintenance State ───────────────────────────
//
// Maintenance mode can be activated via:
//   1. ENABLE_MAINTENANCE_MODE env var (checked at startup)
//   2. Runtime toggle via /api/system/maintenance endpoint
//   3. Feature flag in database (checked periodically)
//
// The in-memory state allows fast checks without DB/Redis
// round-trips on every request.

let maintenanceState: MaintenanceState = {
  enabled: false,
  allowedPaths: [
    '/health',
    '/api/system',
    '/api/system/health',
    '/api/system/maintenance',
    '/api/system/info',
    '/api/system/queues',
    '/api/auth/login',       // Allow admin login during maintenance
  ],
};

// ── State Management ──────────────────────────────────────

/**
 * Check if maintenance mode is currently active.
 * Checks both the runtime state and the config env var.
 */
export function isMaintenanceMode(): boolean {
  // Runtime toggle takes precedence
  if (maintenanceState.enabled) {
    return true;
  }

  // Fall back to env var (set at startup)
  try {
    const config = getConfig();
    return config.enableMaintenanceMode;
  } catch {
    // Config not yet initialized (during startup)
    return false;
  }
}

/**
 * Enable maintenance mode at runtime.
 */
export function enableMaintenance(options: {
  reason?: string;
  estimatedEnd?: string;
  startedBy?: string;
} = {}): MaintenanceState {
  maintenanceState = {
    ...maintenanceState,
    enabled: true,
    reason: options.reason || 'Scheduled maintenance',
    estimatedEnd: options.estimatedEnd,
    startedAt: new Date().toISOString(),
    startedBy: options.startedBy,
  };

  console.warn(
    `[MAINTENANCE] Mode ENABLED by ${options.startedBy || 'system'}. Reason: ${maintenanceState.reason}`
  );

  return { ...maintenanceState };
}

/**
 * Disable maintenance mode at runtime.
 */
export function disableMaintenance(disabledBy?: string): MaintenanceState {
  const wasEnabled = maintenanceState.enabled;
  maintenanceState = {
    ...maintenanceState,
    enabled: false,
    reason: undefined,
    estimatedEnd: undefined,
    startedAt: undefined,
    startedBy: undefined,
  };

  if (wasEnabled) {
    console.warn(
      `[MAINTENANCE] Mode DISABLED by ${disabledBy || 'system'}`
    );
  }

  return { ...maintenanceState };
}

/**
 * Get the current maintenance state (for status endpoints).
 */
export function getMaintenanceState(): MaintenanceState {
  return {
    ...maintenanceState,
    enabled: isMaintenanceMode(),
  };
}

/**
 * Get the estimated end time for the maintenance window.
 * Returns ISO 8601 string or undefined if no estimate is set.
 */
export function getMaintenanceEndTime(): string | undefined {
  return maintenanceState.estimatedEnd;
}

// ── Path Matching ─────────────────────────────────────────

/**
 * Check if a request path is allowed during maintenance mode.
 * Health checks, system endpoints, and admin auth are always allowed
 * so operators can monitor and control the system.
 */
function isPathAllowed(path: string): boolean {
  return maintenanceState.allowedPaths.some((allowed) => {
    // Exact match or prefix match (for nested routes like /api/system/*)
    return path === allowed || path.startsWith(allowed + '/');
  });
}

// ── Middleware ─────────────────────────────────────────────

/**
 * Express middleware that returns 503 for all non-essential routes
 * when maintenance mode is active.
 *
 * Must be registered BEFORE route handlers but AFTER the health
 * check endpoint to ensure /health always responds.
 *
 * Usage in index.ts:
 *   import { maintenanceMode } from './middleware/maintenanceMode.js';
 *   // After health check, before API routes:
 *   app.use(maintenanceMode);
 */
export function maintenanceMode(req: Request, res: Response, next: NextFunction): void {
  if (!isMaintenanceMode()) {
    return next();
  }

  // Allow health checks and system endpoints through
  if (isPathAllowed(req.path)) {
    return next();
  }

  // Return 503 Service Unavailable with structured error
  const retryAfter = getMaintenanceEndTime();

  // Set Retry-After header if we have an estimated end time
  if (retryAfter) {
    const retryDate = new Date(retryAfter);
    const retrySeconds = Math.max(0, Math.ceil((retryDate.getTime() - Date.now()) / 1000));
    res.set('Retry-After', String(retrySeconds));
  }

  res.status(503).json({
    error: {
      code: 'MAINTENANCE',
      message: maintenanceState.reason || 'Service is under maintenance. Please try again later.',
    },
    retryAfter: retryAfter || undefined,
    maintenance: {
      startedAt: maintenanceState.startedAt,
      estimatedEnd: retryAfter,
    },
  });
}

/**
 * Middleware for degraded mode: blocks specific non-critical endpoints
 * while keeping core functionality available.
 *
 * Usage:
 *   app.use('/api/search', degradedMode('search'));
 *   app.use('/api/recommendations', degradedMode('recommendations'));
 */
export function degradedMode(featureName: string) {
  return (_req: Request, res: Response, next: NextFunction): void => {
    // In a full implementation, this would check a feature flag like
    // `degraded.${featureName}` in the database or Redis.
    // For now, we check the env-based maintenance mode only.
    if (!isMaintenanceMode()) {
      return next();
    }

    res.status(503).json({
      error: {
        code: 'FEATURE_UNAVAILABLE',
        message: `${featureName} is temporarily unavailable. Core functionality remains accessible.`,
      },
    });
  };
}
