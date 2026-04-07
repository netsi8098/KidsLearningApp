import pino from 'pino';

// ── Structured JSON Logger ───────────────────────────────────────────────────
// Uses pino for high-performance structured logging.
// - Development: pretty-printed colored output via pino-pretty
// - Production: JSON lines for ingestion by log aggregators (ELK, Datadog, etc.)
// - Sensitive fields are automatically redacted from log output
// ─────────────────────────────────────────────────────────────────────────────

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',

  // Pretty-print in development for human-readable output
  transport:
    process.env.NODE_ENV === 'development'
      ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:HH:MM:ss.l' } }
      : undefined,

  // Base fields attached to every log line
  base: {
    service: 'kids-learning-api',
    env: process.env.NODE_ENV,
    version: process.env.APP_VERSION || 'unknown',
  },

  // Redact sensitive fields so they never appear in logs
  redact: [
    'req.headers.authorization',
    'req.headers.cookie',
    '*.password',
    '*.secret',
    '*.token',
    '*.apiKey',
    '*.accessKey',
    '*.secretKey',
  ],

  serializers: pino.stdSerializers,

  // Custom timestamp format (ISO 8601)
  timestamp: pino.stdTimeFunctions.isoTime,
});

/**
 * Create a child logger with additional context bound to every log line.
 * Useful for per-request or per-module logging:
 *
 * ```ts
 * const log = createChildLogger({ module: 'media-processing', jobId: '123' });
 * log.info('Processing started');
 * ```
 */
export function createChildLogger(bindings: Record<string, unknown>) {
  return logger.child(bindings);
}

export { logger };
export default logger;
