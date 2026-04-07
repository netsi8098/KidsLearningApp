import { z } from 'zod';
import { validate, paginationSchema, idParamSchema, slugParamSchema } from '../../../src/lib/validate';
import { ValidationError } from '../../../src/lib/errors';
import type { Request, Response, NextFunction } from 'express';

function createMockReq(overrides: {
  body?: unknown;
  query?: Record<string, unknown>;
  params?: Record<string, string>;
}): Request {
  return {
    body: overrides.body ?? {},
    query: overrides.query ?? {},
    params: overrides.params ?? {},
  } as unknown as Request;
}

const mockRes = {} as Response;

describe('validate middleware', () => {
  it('should call next when body validation passes', () => {
    const schema = z.object({
      body: z.object({
        name: z.string().min(1),
        age: z.number().int().positive(),
      }),
    });

    const middleware = validate(schema);
    const next = vi.fn() as unknown as NextFunction;
    const req = createMockReq({ body: { name: 'Alice', age: 5 } });

    middleware(req, mockRes, next);

    expect(next).toHaveBeenCalled();
    expect(req.body).toEqual({ name: 'Alice', age: 5 });
  });

  it('should call next when query validation passes', () => {
    const schema = z.object({
      query: z.object({
        search: z.string().optional(),
        limit: z.coerce.number().default(10),
      }),
    });

    const middleware = validate(schema);
    const next = vi.fn() as unknown as NextFunction;
    const req = createMockReq({ query: { search: 'abc', limit: '20' } });

    middleware(req, mockRes, next);

    expect(next).toHaveBeenCalled();
    expect((req as unknown as Record<string, unknown>).validatedQuery).toEqual({
      search: 'abc',
      limit: 20,
    });
  });

  it('should call next when params validation passes', () => {
    const schema = z.object({
      params: z.object({
        id: z.string().uuid(),
      }),
    });

    const middleware = validate(schema);
    const next = vi.fn() as unknown as NextFunction;
    const req = createMockReq({ params: { id: '550e8400-e29b-41d4-a716-446655440000' } });

    middleware(req, mockRes, next);

    expect(next).toHaveBeenCalled();
    expect((req as unknown as Record<string, unknown>).validatedParams).toEqual({
      id: '550e8400-e29b-41d4-a716-446655440000',
    });
  });

  it('should throw ValidationError when body is invalid', () => {
    const schema = z.object({
      body: z.object({
        name: z.string().min(1),
        email: z.string().email(),
      }),
    });

    const middleware = validate(schema);
    const next = vi.fn() as unknown as NextFunction;
    const req = createMockReq({ body: { name: '', email: 'not-an-email' } });

    expect(() => middleware(req, mockRes, next)).toThrow(ValidationError);
    expect(next).not.toHaveBeenCalled();
  });

  it('should include field-level details in ValidationError', () => {
    const schema = z.object({
      body: z.object({
        name: z.string().min(3),
        age: z.number().int().min(1),
      }),
    });

    const middleware = validate(schema);
    const next = vi.fn() as unknown as NextFunction;
    const req = createMockReq({ body: { name: 'ab', age: -1 } });

    try {
      middleware(req, mockRes, next);
      // Should not reach here
      expect(true).toBe(false);
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
      const validationErr = err as ValidationError;
      expect(validationErr.message).toBe('Validation failed');
      expect(validationErr.details).toBeDefined();
      // The details should have keys for the failing fields
      expect(Object.keys(validationErr.details!).length).toBeGreaterThan(0);
    }
  });

  it('should merge validated body back onto req.body', () => {
    const schema = z.object({
      body: z.object({
        count: z.coerce.number().default(5),
      }),
    });

    const middleware = validate(schema);
    const next = vi.fn() as unknown as NextFunction;
    const req = createMockReq({ body: {} });

    middleware(req, mockRes, next);

    expect(req.body).toEqual({ count: 5 });
  });

  it('should throw ValidationError with correct details path', () => {
    const schema = z.object({
      body: z.object({
        nested: z.object({
          value: z.number(),
        }),
      }),
    });

    const middleware = validate(schema);
    const next = vi.fn() as unknown as NextFunction;
    const req = createMockReq({ body: { nested: { value: 'not-a-number' } } });

    try {
      middleware(req, mockRes, next);
      expect(true).toBe(false);
    } catch (err) {
      const validationErr = err as ValidationError;
      expect(validationErr.details).toBeDefined();
      // Path should be dotted: "body.nested.value"
      const keys = Object.keys(validationErr.details!);
      expect(keys.some((k) => k.includes('body.nested.value'))).toBe(true);
    }
  });

  it('should handle combined body and params validation', () => {
    const schema = z.object({
      params: z.object({
        id: z.string().min(1),
      }),
      body: z.object({
        name: z.string().min(1),
      }),
    });

    const middleware = validate(schema);
    const next = vi.fn() as unknown as NextFunction;
    const req = createMockReq({
      params: { id: 'item-123' },
      body: { name: 'Test Item' },
    });

    middleware(req, mockRes, next);

    expect(next).toHaveBeenCalled();
    expect(req.body).toEqual({ name: 'Test Item' });
    expect((req as unknown as Record<string, unknown>).validatedParams).toEqual({ id: 'item-123' });
  });
});

describe('paginationSchema', () => {
  it('should accept valid pagination params', () => {
    const result = paginationSchema.safeParse({
      query: { page: '2', limit: '50', sortBy: 'createdAt', sortOrder: 'asc' },
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.query.page).toBe(2);
      expect(result.data.query.limit).toBe(50);
      expect(result.data.query.sortBy).toBe('createdAt');
      expect(result.data.query.sortOrder).toBe('asc');
    }
  });

  it('should use defaults when no values provided', () => {
    const result = paginationSchema.safeParse({
      query: {},
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.query.page).toBe(1);
      expect(result.data.query.limit).toBe(20);
      expect(result.data.query.sortOrder).toBe('desc');
      expect(result.data.query.sortBy).toBeUndefined();
    }
  });

  it('should reject page less than 1', () => {
    const result = paginationSchema.safeParse({
      query: { page: '0' },
    });

    expect(result.success).toBe(false);
  });

  it('should reject limit greater than 100', () => {
    const result = paginationSchema.safeParse({
      query: { limit: '101' },
    });

    expect(result.success).toBe(false);
  });

  it('should reject limit less than 1', () => {
    const result = paginationSchema.safeParse({
      query: { limit: '0' },
    });

    expect(result.success).toBe(false);
  });

  it('should reject invalid sortOrder', () => {
    const result = paginationSchema.safeParse({
      query: { sortOrder: 'random' },
    });

    expect(result.success).toBe(false);
  });

  it('should coerce string numbers to integers', () => {
    const result = paginationSchema.safeParse({
      query: { page: '3', limit: '25' },
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.query.page).toBe(3);
      expect(result.data.query.limit).toBe(25);
    }
  });
});

describe('idParamSchema', () => {
  it('should accept valid id param', () => {
    const result = idParamSchema.safeParse({
      params: { id: 'abc-123' },
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.params.id).toBe('abc-123');
    }
  });

  it('should reject empty id param', () => {
    const result = idParamSchema.safeParse({
      params: { id: '' },
    });

    expect(result.success).toBe(false);
  });

  it('should reject missing id param', () => {
    const result = idParamSchema.safeParse({
      params: {},
    });

    expect(result.success).toBe(false);
  });
});

describe('slugParamSchema', () => {
  it('should accept valid slug param', () => {
    const result = slugParamSchema.safeParse({
      params: { slug: 'my-content-slug' },
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.params.slug).toBe('my-content-slug');
    }
  });

  it('should reject empty slug param', () => {
    const result = slugParamSchema.safeParse({
      params: { slug: '' },
    });

    expect(result.success).toBe(false);
  });

  it('should reject missing slug param', () => {
    const result = slugParamSchema.safeParse({
      params: {},
    });

    expect(result.success).toBe(false);
  });
});
