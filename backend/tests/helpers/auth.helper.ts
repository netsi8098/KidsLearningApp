// ── Auth Test Helpers ──────────────────────────────────────
// Generate real JWTs using the same test secret defined in
// vitest.setup.ts so that the authenticate middleware in
// src/middleware/auth.ts will accept them.

import jwt from 'jsonwebtoken';

// Must match the JWT_SECRET set in tests/setup/vitest.setup.ts
const TEST_JWT_SECRET = 'test-secret-key-for-testing';

export interface TestTokenPayload {
  userId: string;
  email: string;
  role: 'admin' | 'editor' | 'reviewer' | 'viewer';
}

// ── Default payloads per role ──────────────────────────────

const DEFAULT_ADMIN: TestTokenPayload = {
  userId: 'user-admin-001',
  email: 'admin@kidslearning.test',
  role: 'admin',
};

const DEFAULT_EDITOR: TestTokenPayload = {
  userId: 'user-editor-001',
  email: 'editor@kidslearning.test',
  role: 'editor',
};

const DEFAULT_REVIEWER: TestTokenPayload = {
  userId: 'user-reviewer-001',
  email: 'reviewer@kidslearning.test',
  role: 'reviewer',
};

const DEFAULT_VIEWER: TestTokenPayload = {
  userId: 'user-viewer-001',
  email: 'viewer@kidslearning.test',
  role: 'viewer',
};

// ── Token creation ─────────────────────────────────────────

/**
 * Creates a real JWT token signed with the test secret.
 * Override any payload fields for custom scenarios.
 */
export function createTestToken(
  overrides?: Partial<TestTokenPayload>
): string {
  const payload: TestTokenPayload = {
    ...DEFAULT_VIEWER,
    ...overrides,
  };

  return jwt.sign(payload, TEST_JWT_SECRET, { expiresIn: '1h' });
}

/**
 * Creates an expired JWT token for testing expiration handling.
 */
export function createExpiredToken(
  overrides?: Partial<TestTokenPayload>
): string {
  const payload: TestTokenPayload = {
    ...DEFAULT_VIEWER,
    ...overrides,
  };

  return jwt.sign(payload, TEST_JWT_SECRET, { expiresIn: '-1s' });
}

/**
 * Creates a token signed with the wrong secret for testing
 * invalid signature handling.
 */
export function createInvalidToken(
  overrides?: Partial<TestTokenPayload>
): string {
  const payload: TestTokenPayload = {
    ...DEFAULT_VIEWER,
    ...overrides,
  };

  return jwt.sign(payload, 'wrong-secret-key', { expiresIn: '1h' });
}

// ── Header builders ────────────────────────────────────────

export type TestHeaders = Record<string, string>;

/**
 * Returns HTTP headers with a valid admin JWT in the Authorization header.
 */
export function adminHeaders(
  overrides?: Partial<TestTokenPayload>
): TestHeaders {
  const token = createTestToken({ ...DEFAULT_ADMIN, ...overrides });
  return {
    authorization: `Bearer ${token}`,
    'content-type': 'application/json',
  };
}

/**
 * Returns HTTP headers with a valid editor JWT in the Authorization header.
 */
export function editorHeaders(
  overrides?: Partial<TestTokenPayload>
): TestHeaders {
  const token = createTestToken({ ...DEFAULT_EDITOR, ...overrides });
  return {
    authorization: `Bearer ${token}`,
    'content-type': 'application/json',
  };
}

/**
 * Returns HTTP headers with a valid reviewer JWT in the Authorization header.
 */
export function reviewerHeaders(
  overrides?: Partial<TestTokenPayload>
): TestHeaders {
  const token = createTestToken({ ...DEFAULT_REVIEWER, ...overrides });
  return {
    authorization: `Bearer ${token}`,
    'content-type': 'application/json',
  };
}

/**
 * Returns HTTP headers with a valid viewer JWT in the Authorization header.
 */
export function viewerHeaders(
  overrides?: Partial<TestTokenPayload>
): TestHeaders {
  const token = createTestToken({ ...DEFAULT_VIEWER, ...overrides });
  return {
    authorization: `Bearer ${token}`,
    'content-type': 'application/json',
  };
}

/**
 * Returns empty headers (no authorization). Use for testing
 * unauthenticated access.
 */
export function unauthHeaders(): TestHeaders {
  return {
    'content-type': 'application/json',
  };
}

// ── Role payloads for direct use ───────────────────────────

export const ROLE_PAYLOADS = {
  admin: DEFAULT_ADMIN,
  editor: DEFAULT_EDITOR,
  reviewer: DEFAULT_REVIEWER,
  viewer: DEFAULT_VIEWER,
} as const;
