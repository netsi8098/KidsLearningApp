// ── Express Request/Response Mock Helpers ──────────────────
// Lightweight mocks for unit-testing Express handlers and
// middleware without spinning up a real HTTP server.

import { vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import type { AuthPayload } from '../../src/middleware/auth.js';

// ── Mock Request ───────────────────────────────────────────

export interface MockRequestOverrides {
  body?: Record<string, unknown>;
  params?: Record<string, string>;
  query?: Record<string, string | string[]>;
  headers?: Record<string, string | string[] | undefined>;
  user?: AuthPayload;
  ip?: string;
  method?: string;
  path?: string;
  originalUrl?: string;
  cookies?: Record<string, string>;
  file?: unknown;
  files?: unknown[];
}

/**
 * Creates a mock Express Request object.
 * All properties can be overridden. Includes sensible defaults
 * for the fields most commonly accessed in handlers.
 */
export function createMockRequest(
  overrides: MockRequestOverrides = {}
): Request {
  const req = {
    body: overrides.body ?? {},
    params: overrides.params ?? {},
    query: overrides.query ?? {},
    headers: overrides.headers ?? {},
    user: overrides.user,
    ip: overrides.ip ?? '127.0.0.1',
    method: overrides.method ?? 'GET',
    path: overrides.path ?? '/',
    originalUrl: overrides.originalUrl ?? '/',
    cookies: overrides.cookies ?? {},
    file: overrides.file,
    files: overrides.files,
    get: vi.fn((name: string) => {
      const key = name.toLowerCase();
      const headers = overrides.headers ?? {};
      return headers[key] as string | undefined;
    }),
    header: vi.fn((name: string) => {
      const key = name.toLowerCase();
      const headers = overrides.headers ?? {};
      return headers[key] as string | undefined;
    }),
  } as unknown as Request;

  return req;
}

// ── Mock Response ──────────────────────────────────────────

export interface MockResponse extends Response {
  _statusCode: number;
  _json: unknown;
  _body: unknown;
  _headers: Record<string, string>;
}

/**
 * Creates a mock Express Response object.
 * All methods (status, json, send, setHeader, etc.) are chainable
 * vi.fn() stubs. Internal state is captured in _statusCode, _json,
 * _body, and _headers for easy assertion.
 */
export function createMockResponse(): MockResponse {
  const res = {
    _statusCode: 200,
    _json: undefined as unknown,
    _body: undefined as unknown,
    _headers: {} as Record<string, string>,
  } as MockResponse;

  res.status = vi.fn((code: number) => {
    res._statusCode = code;
    return res;
  }) as unknown as Response['status'];

  res.json = vi.fn((data: unknown) => {
    res._json = data;
    return res;
  }) as unknown as Response['json'];

  res.send = vi.fn((body: unknown) => {
    res._body = body;
    return res;
  }) as unknown as Response['send'];

  res.sendStatus = vi.fn((code: number) => {
    res._statusCode = code;
    return res;
  }) as unknown as Response['sendStatus'];

  res.setHeader = vi.fn((name: string, value: string) => {
    res._headers[name.toLowerCase()] = value;
    return res;
  }) as unknown as Response['setHeader'];

  res.header = vi.fn((name: string, value?: string) => {
    if (value !== undefined) {
      res._headers[name.toLowerCase()] = value;
    }
    return res;
  }) as unknown as Response['header'];

  res.set = vi.fn((name: string, value?: string) => {
    if (value !== undefined) {
      res._headers[name.toLowerCase()] = value;
    }
    return res;
  }) as unknown as Response['set'];

  res.type = vi.fn((type: string) => {
    res._headers['content-type'] = type;
    return res;
  }) as unknown as Response['type'];

  res.end = vi.fn(() => res) as unknown as Response['end'];

  res.redirect = vi.fn() as unknown as Response['redirect'];

  res.cookie = vi.fn(() => res) as unknown as Response['cookie'];

  res.clearCookie = vi.fn(() => res) as unknown as Response['clearCookie'];

  res.download = vi.fn() as unknown as Response['download'];

  return res;
}

// ── Mock Next Function ─────────────────────────────────────

/**
 * Creates a mock Express next() function.
 * Access `.mock.calls[0][0]` to inspect the error passed to next, if any.
 */
export function createMockNext(): NextFunction {
  return vi.fn() as unknown as NextFunction;
}
