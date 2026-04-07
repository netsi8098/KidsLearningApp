import { z } from 'zod';

// ── Enums ─────────────────────────────────────────────────

const syncActionEnum = z.enum(['create', 'update', 'delete']);
const resolutionEnum = z.enum(['client', 'server']);

// ── Change Item ───────────────────────────────────────────

const changeSchema = z.object({
  entityType: z.string().min(1),
  entityId: z.string().min(1),
  action: syncActionEnum,
  payload: z.record(z.unknown()),
  clientTimestamp: z.string().min(1),
});

// ── POST /push — push local changes to server ────────────

export const pushChangesSchema = z.object({
  body: z.object({
    profileId: z.string().min(1),
    changes: z.array(changeSchema).min(1).max(500),
  }),
});

// ── POST /pull — pull server changes since checkpoint ────

export const pullChangesSchema = z.object({
  body: z.object({
    profileId: z.string().min(1),
    entityType: z.string().min(1),
    sinceVersion: z.string().optional(),
  }),
});

// ── GET /status/:profileId — sync status per entity type ─

export const syncStatusSchema = z.object({
  params: z.object({
    profileId: z.string().min(1),
  }),
});

// ── POST /resolve — resolve a sync conflict ──────────────

export const resolveConflictSchema = z.object({
  body: z.object({
    profileId: z.string().min(1),
    entityType: z.string().min(1),
    entityId: z.string().min(1),
    resolution: resolutionEnum,
    clientPayload: z.record(z.unknown()).optional(),
  }),
});

// ── POST /reset/:profileId — reset sync checkpoint (admin) ─

export const resetCheckpointSchema = z.object({
  params: z.object({
    profileId: z.string().min(1),
  }),
});

// ── Inferred Types ────────────────────────────────────────

export type PushChangesInput = z.infer<typeof pushChangesSchema>['body'];
export type PullChangesInput = z.infer<typeof pullChangesSchema>['body'];
export type SyncStatusParams = z.infer<typeof syncStatusSchema>['params'];
export type ResolveConflictInput = z.infer<typeof resolveConflictSchema>['body'];
export type ResetCheckpointParams = z.infer<typeof resetCheckpointSchema>['params'];
