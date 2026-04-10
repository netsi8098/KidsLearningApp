/**
 * API Service — offline-first HTTP client for the Kids Learning backend.
 *
 * Auto-detects backend availability on the local network (localhost:4000).
 * All calls are optional — the app works fully offline with IndexedDB.
 * When the backend is reachable, data syncs automatically.
 */

const BACKEND_URLS = [
  'http://localhost:4000',
  'http://127.0.0.1:4000',
  'https://nitrogen-ray-flooring-ind.trycloudflare.com',
];

const STORAGE_KEY_TOKEN = 'klf-auth-token';
const STORAGE_KEY_URL = 'klf-backend-url';
const HEALTH_CHECK_INTERVAL = 30_000; // 30 seconds

let _baseUrl: string | null = null;
let _online = false;
let _lastHealthCheck = 0;
let _token: string | null = null;
let _onStatusChange: ((online: boolean) => void) | null = null;

// Load persisted state
if (typeof window !== 'undefined') {
  _token = localStorage.getItem(STORAGE_KEY_TOKEN);
  _baseUrl = localStorage.getItem(STORAGE_KEY_URL);
}

/** Register a callback for online/offline status changes */
export function onBackendStatusChange(cb: (online: boolean) => void) {
  _onStatusChange = cb;
}

/** Check if backend is currently reachable */
export function isBackendOnline(): boolean {
  return _online;
}

/** Get the detected backend URL */
export function getBackendUrl(): string | null {
  return _baseUrl;
}

/** Force a fresh health check */
export async function checkBackend(): Promise<boolean> {
  const now = Date.now();
  if (_online && now - _lastHealthCheck < HEALTH_CHECK_INTERVAL) {
    return true;
  }

  // Try the last known URL first
  const urls = _baseUrl ? [_baseUrl, ...BACKEND_URLS.filter(u => u !== _baseUrl)] : BACKEND_URLS;

  for (const url of urls) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`${url}/health`, { signal: controller.signal });
      clearTimeout(timeout);

      if (res.ok) {
        const wasOffline = !_online;
        _baseUrl = url;
        _online = true;
        _lastHealthCheck = now;
        localStorage.setItem(STORAGE_KEY_URL, url);
        if (wasOffline) _onStatusChange?.(true);
        return true;
      }
    } catch {
      // Try next URL
    }
  }

  const wasOnline = _online;
  _online = false;
  _lastHealthCheck = now;
  if (wasOnline) _onStatusChange?.(false);
  return false;
}

/** Store JWT token */
export function setAuthToken(token: string | null) {
  _token = token;
  if (token) {
    localStorage.setItem(STORAGE_KEY_TOKEN, token);
  } else {
    localStorage.removeItem(STORAGE_KEY_TOKEN);
  }
}

/** Get current JWT token */
export function getAuthToken(): string | null {
  return _token;
}

/** Check if we have a stored auth token */
export function isAuthenticated(): boolean {
  return !!_token;
}

// ── HTTP helpers ──────────────────────────────────────────────────────

interface ApiResponse<T = unknown> {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<ApiResponse<T>> {
  if (!_online || !_baseUrl) {
    return { ok: false, status: 0, error: 'Backend offline' };
  }

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (_token) {
      headers['Authorization'] = `Bearer ${_token}`;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(`${_baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const data = res.headers.get('content-type')?.includes('json')
      ? await res.json()
      : undefined;

    if (res.status === 401) {
      // Token expired — clear it
      setAuthToken(null);
    }

    return { ok: res.ok, status: res.status, data: data as T, error: res.ok ? undefined : (data as any)?.message };
  } catch (err) {
    // Network error — mark offline
    const wasOnline = _online;
    _online = false;
    if (wasOnline) _onStatusChange?.(false);
    return { ok: false, status: 0, error: 'Network error' };
  }
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
};

// ── Auth helpers ──────────────────────────────────────────────────────

interface AuthResponse {
  token: string;
  user: { id: string; email: string; name: string; role: string };
}

/** Auto-register a device account (creates a household + parent automatically) */
export async function autoRegister(deviceName: string): Promise<boolean> {
  if (_token) return true; // Already authenticated

  const deviceId = getOrCreateDeviceId();
  const email = `device-${deviceId}@kidslearn.local`;
  const password = `device-${deviceId}-auto`;

  // Try login first (already registered)
  const loginRes = await api.post<AuthResponse>('/api/auth/login', { email, password });
  if (loginRes.ok && loginRes.data?.token) {
    setAuthToken(loginRes.data.token);
    return true;
  }

  // Register new account
  const regRes = await api.post<AuthResponse>('/api/auth/register', {
    email,
    password,
    name: deviceName || 'My Device',
  });

  if (regRes.ok && regRes.data?.token) {
    setAuthToken(regRes.data.token);
    return true;
  }

  return false;
}

/** Get or create a persistent device ID */
function getOrCreateDeviceId(): string {
  const key = 'klf-device-id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}
