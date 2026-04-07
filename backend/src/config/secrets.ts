import { getConfig, type Config } from './index.js';

// ---------------------------------------------------------------------------
// Secret management utilities
// ---------------------------------------------------------------------------
// Secrets are config values that must NEVER appear in logs, error messages,
// health endpoints, or client-facing responses.  This module centralises the
// list of secret keys and provides helpers for safe logging and secret
// rotation.
// ---------------------------------------------------------------------------

/** Config keys whose values are considered secrets. */
const SECRET_KEYS = new Set<keyof Config>([
  'jwtSecret',
  'databaseUrl',
  'redisUrl',
  'storageS3AccessKey',
  'storageS3SecretKey',
  'openaiApiKey',
  'anthropicApiKey',
]);

/**
 * Return the full config object with secret values replaced by a redacted
 * preview.  Safe to log, return in health endpoints, etc.
 *
 * Example output for a secret: `"sk-p...REDACTED"`
 */
export function getRedactedConfig(): Record<string, unknown> {
  const config = getConfig();
  const redacted: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(config)) {
    if (SECRET_KEYS.has(key as keyof Config) && typeof value === 'string' && value.length > 0) {
      // Show up to 4 characters then redact
      const preview = value.length > 4 ? value.substring(0, 4) : value.substring(0, 1);
      redacted[key] = `${preview}...REDACTED`;
    } else {
      redacted[key] = value;
    }
  }

  return redacted;
}

/**
 * Check whether a config key is classified as a secret.
 */
export function isSecret(key: string): boolean {
  return SECRET_KEYS.has(key as keyof Config);
}

// ---------------------------------------------------------------------------
// Secret rotation support
// ---------------------------------------------------------------------------
// During a JWT secret rotation you need both the current and previous secret
// so that tokens signed with the old key remain valid for a grace period.
//
// Set `JWT_SECRET_PREVIOUS` alongside the new `JWT_SECRET` and both will be
// returned here.  Your auth middleware should try verification with each
// secret in order.
// ---------------------------------------------------------------------------

/**
 * Return an ordered list of JWT secrets.  The first element is always the
 * *current* secret (used for signing new tokens).  If `JWT_SECRET_PREVIOUS`
 * is set, it is appended so that tokens signed with the old secret can still
 * be verified during a rotation window.
 */
export function getJwtSecrets(): string[] {
  const config = getConfig();
  const secrets = [config.jwtSecret];

  const previous = process.env.JWT_SECRET_PREVIOUS;
  if (previous && previous.length > 0) {
    secrets.push(previous);
  }

  return secrets;
}
