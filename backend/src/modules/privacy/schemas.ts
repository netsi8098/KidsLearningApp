import { z } from 'zod';

// ── Enums / Constants ─────────────────────────────────────

export const consentTypeEnum = z.enum([
  'privacy_policy',
  'data_collection',
  'marketing',
  'analytics',
]);

export type ConsentTypeValue = z.infer<typeof consentTypeEnum>;

export const requestTypeEnum = z.enum(['export', 'deletion']);

export type RequestTypeValue = z.infer<typeof requestTypeEnum>;

export const requestStatusEnum = z.enum([
  'pending',
  'processing',
  'completed',
  'failed',
]);

export type RequestStatusValue = z.infer<typeof requestStatusEnum>;

// ── GET /consents/:parentId — list consent records ────────

export const listConsentsSchema = z.object({
  params: z.object({
    parentId: z.string().uuid(),
  }),
});

export type ListConsentsParams = z.infer<typeof listConsentsSchema>['params'];

// ── POST /consents — record consent ──────────────────────

export const recordConsentSchema = z.object({
  body: z.object({
    parentId: z.string().uuid(),
    consentType: consentTypeEnum,
    granted: z.boolean(),
    version: z.string().min(1).max(50),
    ipAddress: z.string().max(100).optional(),
  }),
});

export type RecordConsentInput = z.infer<typeof recordConsentSchema>['body'];

// ── POST /consents/revoke — revoke consent ───────────────

export const revokeConsentSchema = z.object({
  body: z.object({
    parentId: z.string().uuid(),
    consentType: consentTypeEnum,
  }),
});

export type RevokeConsentInput = z.infer<typeof revokeConsentSchema>['body'];

// ── GET /requests — list data requests (admin, paginated) ─

export const listDataRequestsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    status: requestStatusEnum.optional(),
    type: requestTypeEnum.optional(),
  }),
});

export type ListDataRequestsQuery = z.infer<typeof listDataRequestsSchema>['query'];

// ── POST /requests/export — request data export ──────────

export const createExportRequestSchema = z.object({
  body: z.object({
    parentId: z.string().uuid(),
    householdId: z.string().uuid(),
  }),
});

export type CreateExportRequestInput = z.infer<typeof createExportRequestSchema>['body'];

// ── POST /requests/deletion — request data deletion ──────

export const createDeletionRequestSchema = z.object({
  body: z.object({
    parentId: z.string().uuid(),
    householdId: z.string().uuid(),
  }),
});

export type CreateDeletionRequestInput = z.infer<typeof createDeletionRequestSchema>['body'];

// ── PATCH /requests/:id — process request (admin) ────────

export const processRequestSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    status: requestStatusEnum,
    fileUrl: z.string().url().optional(),
  }),
});

export type ProcessRequestParams = z.infer<typeof processRequestSchema>['params'];
export type ProcessRequestInput = z.infer<typeof processRequestSchema>['body'];

// ── GET /requests/:id/download — download export file ────

export const downloadRequestSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export type DownloadRequestParams = z.infer<typeof downloadRequestSchema>['params'];
