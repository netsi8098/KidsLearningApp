import { prisma } from '../../lib/prisma.js';
import { NotFoundError } from '../../lib/errors.js';
import { pushChanges, pullChanges, resolveConflict } from '../../lib/syncEngine.js';
import type { SyncChange, PushResult } from '../../lib/syncEngine.js';

// ── Types ─────────────────────────────────────────────────

export interface SyncStatusItem {
  entityType: string;
  serverVersion: string;
  lastSyncedAt: Date;
}

// ── Push Changes ──────────────────────────────────────────

export async function push(
  profileId: string,
  changes: SyncChange[]
): Promise<PushResult> {
  return pushChanges(profileId, changes);
}

// ── Pull Changes ──────────────────────────────────────────

export async function pull(
  profileId: string,
  entityType: string,
  sinceVersion?: string
) {
  const version = sinceVersion ? BigInt(sinceVersion) : undefined;
  return pullChanges(profileId, entityType, version);
}

// ── Sync Status ───────────────────────────────────────────

export async function getStatus(profileId: string): Promise<SyncStatusItem[]> {
  const checkpoints = await prisma.syncCheckpoint.findMany({
    where: { profileId },
    orderBy: { entityType: 'asc' },
    select: {
      entityType: true,
      serverVersion: true,
      lastSyncedAt: true,
    },
  });

  return checkpoints.map((cp) => ({
    entityType: cp.entityType,
    serverVersion: cp.serverVersion.toString(),
    lastSyncedAt: cp.lastSyncedAt,
  }));
}

// ── Resolve Conflict ──────────────────────────────────────

export async function resolve(
  profileId: string,
  entityType: string,
  entityId: string,
  resolution: 'client' | 'server',
  clientPayload?: Record<string, unknown>
) {
  return resolveConflict(profileId, entityType, entityId, resolution, clientPayload);
}

// ── Reset Checkpoint (Admin) ──────────────────────────────

export async function resetCheckpoint(profileId: string): Promise<{ deleted: number }> {
  // Verify at least one checkpoint exists for this profile
  const existing = await prisma.syncCheckpoint.findMany({
    where: { profileId },
    select: { id: true },
  });

  if (existing.length === 0) {
    throw new NotFoundError('SyncCheckpoint', profileId);
  }

  const result = await prisma.syncCheckpoint.deleteMany({
    where: { profileId },
  });

  return { deleted: result.count };
}
