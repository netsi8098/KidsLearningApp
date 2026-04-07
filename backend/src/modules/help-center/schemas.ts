import { z } from 'zod';

// ── Shared Enums ──────────────────────────────────────────

export const articleCategoryEnum = z.enum([
  'getting_started', 'troubleshooting', 'billing', 'content', 'accessibility', 'account',
]);

export const ticketStatusEnum = z.enum([
  'open', 'in_progress', 'waiting', 'resolved', 'closed',
]);

export const ticketPriorityEnum = z.enum([
  'low', 'normal', 'high', 'urgent',
]);

// ── List Articles ─────────────────────────────────────────

export const listArticlesSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sortBy: z.enum(['createdAt', 'updatedAt', 'orderIndex', 'title']).default('orderIndex'),
    sortOrder: z.enum(['asc', 'desc']).default('asc'),
    category: articleCategoryEnum.optional(),
    published: z.coerce.boolean().optional(),
    search: z.string().optional(),
  }),
});

export type ListArticlesQuery = z.infer<typeof listArticlesSchema>['query'];

// ── Get Article by Slug ───────────────────────────────────

export const getArticleBySlugSchema = z.object({
  params: z.object({
    slug: z.string().min(1),
  }),
});

// ── Create Article ────────────────────────────────────────

export const createArticleSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(300),
    slug: z.string()
      .min(1)
      .max(200)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens'),
    body: z.string().min(1),
    category: articleCategoryEnum,
    searchKeywords: z.array(z.string()).default([]),
    relatedFeature: z.string().max(200).optional(),
    orderIndex: z.number().int().min(0).default(0),
    published: z.boolean().default(false),
  }),
});

export type CreateArticleInput = z.infer<typeof createArticleSchema>['body'];

// ── Update Article ────────────────────────────────────────

export const updateArticleSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    title: z.string().min(1).max(300).optional(),
    slug: z.string()
      .min(1)
      .max(200)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens')
      .optional(),
    body: z.string().min(1).optional(),
    category: articleCategoryEnum.optional(),
    searchKeywords: z.array(z.string()).optional(),
    relatedFeature: z.string().max(200).nullable().optional(),
    orderIndex: z.number().int().min(0).optional(),
    published: z.boolean().optional(),
  }).refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field must be provided for update' }
  ),
});

export type UpdateArticleInput = z.infer<typeof updateArticleSchema>['body'];

// ── Delete Article ────────────────────────────────────────

export const deleteArticleSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

// ── Article Feedback ──────────────────────────────────────

export const articleFeedbackSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    helpful: z.boolean(),
  }),
});

// ── List Tickets ──────────────────────────────────────────

export const listTicketsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sortBy: z.enum(['createdAt', 'updatedAt', 'priority']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    status: ticketStatusEnum.optional(),
    priority: ticketPriorityEnum.optional(),
  }),
});

export type ListTicketsQuery = z.infer<typeof listTicketsSchema>['query'];

// ── Get Ticket ────────────────────────────────────────────

export const getTicketSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

// ── Create Ticket ─────────────────────────────────────────

export const createTicketSchema = z.object({
  body: z.object({
    parentEmail: z.string().email().max(320),
    subject: z.string().min(1).max(300),
    body: z.string().min(1).max(5000),
    category: articleCategoryEnum,
    householdId: z.string().uuid().optional(),
  }),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>['body'];

// ── Update Ticket ─────────────────────────────────────────

export const updateTicketSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    status: ticketStatusEnum.optional(),
    priority: ticketPriorityEnum.optional(),
    assignee: z.string().max(300).nullable().optional(),
  }).refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field must be provided for update' }
  ),
});

export type UpdateTicketInput = z.infer<typeof updateTicketSchema>['body'];
