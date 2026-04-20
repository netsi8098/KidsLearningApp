/**
 * App Configuration — centralized environment-based config.
 * All service URLs and feature flags read from here.
 * Values come from VITE_ environment variables at build time.
 */

export const config = {
  // API URLs — fall back to localhost for dev, empty string disables
  apiUrl: import.meta.env.VITE_API_URL || '',
  ttsUrl: import.meta.env.VITE_TTS_URL || '',
  ollamaUrl: import.meta.env.VITE_OLLAMA_URL || '',

  // App metadata
  appName: import.meta.env.VITE_APP_NAME || 'Kids Learning Fun',
  appVersion: import.meta.env.VITE_APP_VERSION || '0.0.0',

  // Feature flags
  analyticsEnabled: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  debugEnabled: import.meta.env.VITE_ENABLE_DEBUG === 'true',

  // Error reporting
  sentryDsn: import.meta.env.VITE_SENTRY_DSN || '',

  // Computed
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const;

/**
 * Get API base URLs as arrays for fallback discovery.
 * In production, only the configured URL is used.
 * In development, localhost is tried first, then any tunnel URL.
 */
export function getApiUrls(): string[] {
  const urls: string[] = [];
  if (config.apiUrl) urls.push(config.apiUrl);
  if (config.isDev) {
    if (!urls.includes('http://localhost:4000')) urls.push('http://localhost:4000');
  }
  return urls.filter(Boolean);
}

export function getTtsUrls(): string[] {
  const urls: string[] = [];
  if (config.ttsUrl) urls.push(config.ttsUrl);
  if (config.isDev) {
    if (!urls.includes('http://localhost:5555')) urls.push('http://localhost:5555');
  }
  return urls.filter(Boolean);
}

export function getOllamaUrls(): string[] {
  const urls: string[] = [];
  if (config.ollamaUrl) urls.push(config.ollamaUrl);
  if (config.isDev) {
    if (!urls.includes('http://localhost:11434')) urls.push('http://localhost:11434');
  }
  return urls.filter(Boolean);
}
