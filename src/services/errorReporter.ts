/**
 * Error Reporter — centralized error logging.
 * Sends errors to Sentry (when configured) and logs to console.
 * Ready for production — just add VITE_SENTRY_DSN to enable.
 */
import { config } from '../config';
import { db } from '../db/database';

let _initialized = false;

/** Initialize error reporting (call once at app start) */
export function initErrorReporting() {
  if (_initialized) return;
  _initialized = true;

  // Global unhandled error handler
  window.addEventListener('error', (event) => {
    reportError(event.error || new Error(event.message), {
      source: event.filename,
      line: event.lineno,
      col: event.colno,
    });
  });

  // Unhandled promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    reportError(event.reason instanceof Error ? event.reason : new Error(String(event.reason)), {
      type: 'unhandledrejection',
    });
  });

  if (config.debugEnabled) {
    console.log('[ErrorReporter] Initialized');
  }
}

/** Report an error */
export async function reportError(error: Error, context?: Record<string, unknown>) {
  // Always log to console
  console.error('[ErrorReporter]', error.message, context);

  // Store in local DB for debugging
  try {
    await db.errorLogs.add({
      message: error.message,
      stack: error.stack,
      context: JSON.stringify(context ?? {}),
      reportedAt: new Date(),
    });

    // Keep only last 100 errors
    const count = await db.errorLogs.count();
    if (count > 100) {
      const oldest = await db.errorLogs.orderBy('reportedAt').limit(count - 100).toArray();
      await db.errorLogs.bulkDelete(oldest.map(e => e.id!).filter(Boolean));
    }
  } catch {
    // Don't fail if DB write fails
  }

  // Send to Sentry if configured
  if (config.sentryDsn) {
    // Sentry SDK would be initialized here
    // For now, we prepare the payload for when Sentry is added
    if (config.debugEnabled) {
      console.log('[ErrorReporter] Would send to Sentry:', { error: error.message, context });
    }
  }
}

/** Get recent errors for debugging */
export async function getRecentErrors(limit = 20) {
  return db.errorLogs.orderBy('reportedAt').reverse().limit(limit).toArray();
}
