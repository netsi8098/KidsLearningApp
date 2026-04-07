import { z } from 'zod';

// ---------------------------------------------------------------------------
// Schema for ALL backend configuration
// ---------------------------------------------------------------------------
// Every environment variable the backend uses is defined here with its type,
// constraints, and default value.  This is the SINGLE SOURCE OF TRUTH.
// ---------------------------------------------------------------------------

const configSchema = z.object({
  // ── Server ────────────────────────────────────────────────────────────────
  port: z.coerce.number().int().min(1).max(65535).default(4000),
  nodeEnv: z
    .enum(['development', 'test', 'staging', 'production'])
    .default('development'),
  corsOrigin: z.string().default('http://localhost:5173'),

  // ── Database ──────────────────────────────────────────────────────────────
  databaseUrl: z.string().min(1, 'DATABASE_URL is required'),

  // ── Redis ─────────────────────────────────────────────────────────────────
  redisUrl: z.string().default('redis://localhost:6379'),

  // ── Auth ──────────────────────────────────────────────────────────────────
  jwtSecret: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  jwtExpiresIn: z.string().default('7d'),

  // ── Storage ───────────────────────────────────────────────────────────────
  storageProvider: z.enum(['local', 's3']).default('local'),
  storageLocalPath: z.string().default('./uploads'),
  storageS3Bucket: z.string().optional(),
  storageS3Region: z.string().optional(),
  storageS3AccessKey: z.string().optional(),
  storageS3SecretKey: z.string().optional(),
  storageS3Endpoint: z.string().optional(),

  // ── Media Processing ──────────────────────────────────────────────────────
  sharpConcurrency: z.coerce.number().int().min(1).max(8).default(2),
  maxUploadSizeMb: z.coerce.number().int().min(1).max(500).default(50),

  // ── AI Services ───────────────────────────────────────────────────────────
  openaiApiKey: z.string().optional(),
  anthropicApiKey: z.string().optional(),

  // ── Worker Settings ───────────────────────────────────────────────────────
  workerMediaConcurrency: z.coerce.number().int().min(1).default(2),
  workerAiConcurrency: z.coerce.number().int().min(1).default(1),

  // ── Rate Limiting ─────────────────────────────────────────────────────────
  rateLimitWindowMs: z.coerce.number().int().default(60_000),
  rateLimitMax: z.coerce.number().int().default(200),

  // ── Feature Flags ─────────────────────────────────────────────────────────
  enableMaintenanceMode: z.coerce.boolean().default(false),

  // ── Logging ───────────────────────────────────────────────────────────────
  logLevel: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  logFormat: z.enum(['json', 'pretty']).default('pretty'),
});

export type Config = z.infer<typeof configSchema>;

// ---------------------------------------------------------------------------
// Map environment variable names (SCREAMING_SNAKE) to config keys (camelCase)
// ---------------------------------------------------------------------------

function loadConfigFromEnv(): Record<string, unknown> {
  return {
    port: process.env.PORT,
    nodeEnv: process.env.NODE_ENV,
    corsOrigin: process.env.CORS_ORIGIN,
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN,
    storageProvider: process.env.STORAGE_PROVIDER,
    storageLocalPath: process.env.STORAGE_LOCAL_PATH,
    storageS3Bucket: process.env.STORAGE_S3_BUCKET,
    storageS3Region: process.env.STORAGE_S3_REGION,
    storageS3AccessKey: process.env.STORAGE_S3_ACCESS_KEY,
    storageS3SecretKey: process.env.STORAGE_S3_SECRET_KEY,
    storageS3Endpoint: process.env.STORAGE_S3_ENDPOINT,
    sharpConcurrency: process.env.SHARP_CONCURRENCY,
    maxUploadSizeMb: process.env.MAX_UPLOAD_SIZE_MB,
    openaiApiKey: process.env.OPENAI_API_KEY,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    workerMediaConcurrency: process.env.WORKER_MEDIA_CONCURRENCY,
    workerAiConcurrency: process.env.WORKER_AI_CONCURRENCY,
    rateLimitWindowMs: process.env.RATE_LIMIT_WINDOW_MS,
    rateLimitMax: process.env.RATE_LIMIT_MAX,
    enableMaintenanceMode: process.env.ENABLE_MAINTENANCE_MODE,
    logLevel: process.env.LOG_LEVEL,
    logFormat: process.env.LOG_FORMAT,
  };
}

// ---------------------------------------------------------------------------
// Singleton config instance
// ---------------------------------------------------------------------------

let _config: Config | null = null;

/**
 * Validate and freeze the configuration.  Call this ONCE at startup (before
 * the HTTP server starts).  If any value is invalid the process exits with a
 * clear error message so bad deploys surface immediately.
 */
export function validateConfig(): Config {
  const raw = loadConfigFromEnv();
  const result = configSchema.safeParse(raw);

  if (!result.success) {
    const errors = result.error.issues.map(
      (issue) => `  - ${issue.path.join('.')}: ${issue.message}`
    );
    console.error('\n========================================');
    console.error(' CONFIGURATION VALIDATION FAILED');
    console.error('========================================');
    errors.forEach((e) => console.error(e));
    console.error('========================================\n');
    process.exit(1);
  }

  const config = result.data;

  // ── Cross-field validation ──────────────────────────────────────────────

  // S3 storage requires bucket and region
  if (config.storageProvider === 's3') {
    const missing: string[] = [];
    if (!config.storageS3Bucket) missing.push('STORAGE_S3_BUCKET');
    if (!config.storageS3Region) missing.push('STORAGE_S3_REGION');
    if (missing.length > 0) {
      console.error(
        `\nFATAL: S3 storage provider selected but missing required vars: ${missing.join(', ')}`
      );
      process.exit(1);
    }
  }

  // ── Production safety checks ────────────────────────────────────────────

  if (config.nodeEnv === 'production') {
    if (config.jwtSecret === 'change-me-in-production') {
      console.error('FATAL: JWT_SECRET must be changed from the default in production');
      process.exit(1);
    }
    if (config.jwtSecret.length < 32) {
      console.error('FATAL: JWT_SECRET should be at least 32 characters in production');
      process.exit(1);
    }
    if (config.logFormat !== 'json') {
      console.warn(
        'WARNING: LOG_FORMAT should be "json" in production for structured logging'
      );
    }
  }

  _config = Object.freeze(config) as Config;
  return _config;
}

/**
 * Return the validated config.  Throws if `validateConfig()` has not been
 * called yet -- this prevents silent use of uninitialised configuration.
 */
export function getConfig(): Config {
  if (!_config) {
    throw new Error(
      'Config not initialised. Call validateConfig() at startup before accessing config.'
    );
  }
  return _config;
}

// ---------------------------------------------------------------------------
// Convenience environment helpers
// ---------------------------------------------------------------------------

export const isDev = (): boolean => getConfig().nodeEnv === 'development';
export const isTest = (): boolean => getConfig().nodeEnv === 'test';
export const isStaging = (): boolean => getConfig().nodeEnv === 'staging';
export const isProd = (): boolean => getConfig().nodeEnv === 'production';
