import { Prisma } from '@prisma/client';
import { prisma } from './prisma.js';

export interface SyncChange {
  entityType: string;
  entityId: string;
  action: 'create' | 'update' | 'delete';
  payload: Record<string, unknown>;
  clientTimestamp: string;
}

export interface SyncConflict {
  entityType: string;
  entityId: string;
  clientVersion: Record<string, unknown>;
  serverVersion: Record<string, unknown>;
  serverTimestamp: Date;
}

export interface PushResult {
  accepted: number;
  conflicts: SyncConflict[];
}

/**
 * Push local changes to the server, detecting conflicts.
 * Uses last-write-wins with client-awareness for conflict resolution.
 */
export async function pushChanges(profileId: string, changes: SyncChange[]): Promise<PushResult> {
  const conflicts: SyncConflict[] = [];
  let accepted = 0;

  for (const change of changes) {
    // Check for conflicts: if server has a newer version of this entity
    const existing = await prisma.syncEvent.findFirst({
      where: {
        profileId,
        entityType: change.entityType,
        entityId: change.entityId,
      },
      orderBy: { version: 'desc' },
    });

    if (existing) {
      const clientTime = new Date(change.clientTimestamp);
      if (existing.serverTimestamp > clientTime) {
        conflicts.push({
          entityType: change.entityType,
          entityId: change.entityId,
          clientVersion: change.payload,
          serverVersion: existing.payload as Record<string, unknown>,
          serverTimestamp: existing.serverTimestamp,
        });
        continue;
      }
    }

    // Accept the change
    await prisma.syncEvent.create({
      data: {
        profileId,
        entityType: change.entityType,
        entityId: change.entityId,
        action: change.action,
        payload: change.payload as Prisma.InputJsonValue,
        clientTimestamp: new Date(change.clientTimestamp),
      },
    });

    // Update checkpoint
    const latestEvent = await prisma.syncEvent.findFirst({
      where: { profileId, entityType: change.entityType },
      orderBy: { version: 'desc' },
    });

    if (latestEvent) {
      await prisma.syncCheckpoint.upsert({
        where: {
          profileId_entityType: { profileId, entityType: change.entityType },
        },
        update: {
          serverVersion: latestEvent.version,
          lastSyncedAt: new Date(),
        },
        create: {
          profileId,
          entityType: change.entityType,
          serverVersion: latestEvent.version,
          lastSyncedAt: new Date(),
        },
      });
    }

    accepted++;
  }

  return { accepted, conflicts };
}

/**
 * Pull server changes since the last checkpoint for a profile.
 */
export async function pullChanges(profileId: string, entityType: string, sinceVersion?: bigint) {
  const checkpoint = await prisma.syncCheckpoint.findUnique({
    where: { profileId_entityType: { profileId, entityType } },
  });

  const fromVersion = sinceVersion ?? checkpoint?.serverVersion ?? BigInt(0);

  const events = await prisma.syncEvent.findMany({
    where: {
      profileId,
      entityType,
      version: { gt: fromVersion },
    },
    orderBy: { version: 'asc' },
    take: 100,
  });

  const latestVersion = events.length > 0 ? events[events.length - 1].version : fromVersion;

  return {
    events: events.map((e) => ({
      entityType: e.entityType,
      entityId: e.entityId,
      action: e.action,
      payload: e.payload,
      version: e.version.toString(),
      serverTimestamp: e.serverTimestamp,
    })),
    checkpoint: latestVersion.toString(),
    hasMore: events.length === 100,
  };
}

/**
 * Resolve a conflict by choosing client or server version.
 */
export async function resolveConflict(
  profileId: string,
  entityType: string,
  entityId: string,
  resolution: 'client' | 'server',
  clientPayload?: Record<string, unknown>
) {
  if (resolution === 'client' && clientPayload) {
    await prisma.syncEvent.create({
      data: {
        profileId,
        entityType,
        entityId,
        action: 'update',
        payload: clientPayload as Prisma.InputJsonValue,
        clientTimestamp: new Date(),
      },
    });
  }
  // If resolution is 'server', no action needed — server version stands
  return { resolved: true };
}
