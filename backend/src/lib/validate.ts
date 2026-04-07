import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { ValidationError } from './errors.js';

// ── Request Validation Middleware ───────────────────────────

export function validate<T extends z.ZodType>(schema: T) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    if (!result.success) {
      const details: Record<string, string[]> = {};
      for (const issue of result.error.issues) {
        const key = issue.path.join('.');
        if (!details[key]) details[key] = [];
        details[key].push(issue.message);
      }
      throw new ValidationError('Validation failed', details);
    }
    // Merge validated data back onto request
    const data = result.data as { body?: unknown; query?: unknown; params?: unknown };
    if (data.body) req.body = data.body;
    if (data.query) (req as unknown as Record<string, unknown>).validatedQuery = data.query;
    if (data.params) (req as unknown as Record<string, unknown>).validatedParams = data.params;
    next();
  };
}

// ── Common Zod Schemas ─────────────────────────────────────

export const paginationSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
});

export const idParamSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const slugParamSchema = z.object({
  params: z.object({
    slug: z.string().min(1),
  }),
});
