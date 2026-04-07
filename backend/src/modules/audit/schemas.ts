import { z } from 'zod';

// ── List Audit Logs ──────────────────────────────────────

export const listAuditLogsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    entity: z.string().optional(),
    action: z.string().optional(),
    userId: z.string().uuid().optional(),
    entityId: z.string().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
});

export type ListAuditLogsQuery = z.infer<typeof listAuditLogsSchema>['query'];

// ── Get Single Audit Log ─────────────────────────────────

export const getAuditLogSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export type GetAuditLogParams = z.infer<typeof getAuditLogSchema>['params'];

// ── Entity Trail ─────────────────────────────────────────

export const entityTrailSchema = z.object({
  params: z.object({
    entity: z.string(),
    entityId: z.string(),
  }),
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(50),
  }),
});

export type EntityTrailParams = z.infer<typeof entityTrailSchema>['params'];
export type EntityTrailQuery = z.infer<typeof entityTrailSchema>['query'];
