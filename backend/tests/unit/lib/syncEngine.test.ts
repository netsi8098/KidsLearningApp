import { pushChanges, pullChanges, resolveConflict } from '../../../src/lib/syncEngine';
import type { SyncChange } from '../../../src/lib/syncEngine';

vi.mock('../../../src/lib/prisma', () => ({
  prisma: {
    syncEvent: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
    },
    syncCheckpoint: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
  },
}));

import { prisma } from '../../../src/lib/prisma';

const mockSyncEventFindFirst = prisma.syncEvent.findFirst as ReturnType<typeof vi.fn>;
const mockSyncEventFindMany = prisma.syncEvent.findMany as ReturnType<typeof vi.fn>;
const mockSyncEventCreate = prisma.syncEvent.create as ReturnType<typeof vi.fn>;
const mockCheckpointFindUnique = prisma.syncCheckpoint.findUnique as ReturnType<typeof vi.fn>;
const mockCheckpointUpsert = prisma.syncCheckpoint.upsert as ReturnType<typeof vi.fn>;

describe('pushChanges', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should accept changes when no prior sync events exist', async () => {
    const changes: SyncChange[] = [
      {
        entityType: 'progress',
        entityId: 'prog-1',
        action: 'create',
        payload: { score: 100 },
        clientTimestamp: new Date('2026-03-01T12:00:00Z').toISOString(),
      },
    ];

    // No existing event for this entity
    mockSyncEventFindFirst
      .mockResolvedValueOnce(null) // conflict check
      .mockResolvedValueOnce({ version: BigInt(1) }); // after create - latest version

    mockSyncEventCreate.mockResolvedValue({ version: BigInt(1) });
    mockCheckpointUpsert.mockResolvedValue({});

    const result = await pushChanges('profile-1', changes);

    expect(result.accepted).toBe(1);
    expect(result.conflicts).toHaveLength(0);
    expect(mockSyncEventCreate).toHaveBeenCalledTimes(1);
    expect(mockSyncEventCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        profileId: 'profile-1',
        entityType: 'progress',
        entityId: 'prog-1',
        action: 'create',
        payload: { score: 100 },
      }),
    });
  });

  it('should detect a conflict when server has a newer version', async () => {
    const changes: SyncChange[] = [
      {
        entityType: 'progress',
        entityId: 'prog-1',
        action: 'update',
        payload: { score: 50 },
        clientTimestamp: new Date('2026-03-01T10:00:00Z').toISOString(),
      },
    ];

    // Server has a newer event (serverTimestamp > clientTimestamp)
    mockSyncEventFindFirst.mockResolvedValueOnce({
      profileId: 'profile-1',
      entityType: 'progress',
      entityId: 'prog-1',
      version: BigInt(5),
      serverTimestamp: new Date('2026-03-01T11:00:00Z'), // 1 hour after client
      payload: { score: 75 },
    });

    const result = await pushChanges('profile-1', changes);

    expect(result.accepted).toBe(0);
    expect(result.conflicts).toHaveLength(1);
    expect(result.conflicts[0]).toEqual({
      entityType: 'progress',
      entityId: 'prog-1',
      clientVersion: { score: 50 },
      serverVersion: { score: 75 },
      serverTimestamp: new Date('2026-03-01T11:00:00Z'),
    });
    expect(mockSyncEventCreate).not.toHaveBeenCalled();
  });

  it('should accept change when client timestamp is newer than server', async () => {
    const changes: SyncChange[] = [
      {
        entityType: 'progress',
        entityId: 'prog-1',
        action: 'update',
        payload: { score: 200 },
        clientTimestamp: new Date('2026-03-01T15:00:00Z').toISOString(),
      },
    ];

    // Server event is older than client
    mockSyncEventFindFirst
      .mockResolvedValueOnce({
        profileId: 'profile-1',
        entityType: 'progress',
        entityId: 'prog-1',
        version: BigInt(3),
        serverTimestamp: new Date('2026-03-01T10:00:00Z'),
        payload: { score: 100 },
      })
      .mockResolvedValueOnce({ version: BigInt(4) }); // latest version after create

    mockSyncEventCreate.mockResolvedValue({ version: BigInt(4) });
    mockCheckpointUpsert.mockResolvedValue({});

    const result = await pushChanges('profile-1', changes);

    expect(result.accepted).toBe(1);
    expect(result.conflicts).toHaveLength(0);
  });

  it('should handle multiple changes with mixed conflicts and accepts', async () => {
    const changes: SyncChange[] = [
      {
        entityType: 'progress',
        entityId: 'prog-1',
        action: 'update',
        payload: { score: 50 },
        clientTimestamp: new Date('2026-03-01T08:00:00Z').toISOString(), // old
      },
      {
        entityType: 'settings',
        entityId: 'set-1',
        action: 'create',
        payload: { volume: 80 },
        clientTimestamp: new Date('2026-03-01T12:00:00Z').toISOString(), // new
      },
    ];

    // First change: conflict (server newer)
    mockSyncEventFindFirst
      .mockResolvedValueOnce({
        serverTimestamp: new Date('2026-03-01T09:00:00Z'),
        payload: { score: 999 },
      })
      // Second change: no existing event
      .mockResolvedValueOnce(null)
      // Second change: after create, latest version
      .mockResolvedValueOnce({ version: BigInt(1) });

    mockSyncEventCreate.mockResolvedValue({ version: BigInt(1) });
    mockCheckpointUpsert.mockResolvedValue({});

    const result = await pushChanges('profile-1', changes);

    expect(result.accepted).toBe(1);
    expect(result.conflicts).toHaveLength(1);
    expect(result.conflicts[0].entityId).toBe('prog-1');
  });

  it('should handle empty changes array gracefully', async () => {
    const result = await pushChanges('profile-1', []);

    expect(result.accepted).toBe(0);
    expect(result.conflicts).toHaveLength(0);
    expect(mockSyncEventFindFirst).not.toHaveBeenCalled();
    expect(mockSyncEventCreate).not.toHaveBeenCalled();
  });

  it('should upsert the checkpoint after accepting a change', async () => {
    const changes: SyncChange[] = [
      {
        entityType: 'progress',
        entityId: 'prog-1',
        action: 'create',
        payload: { data: 'test' },
        clientTimestamp: new Date().toISOString(),
      },
    ];

    mockSyncEventFindFirst
      .mockResolvedValueOnce(null) // no existing
      .mockResolvedValueOnce({ version: BigInt(10) }); // latest version

    mockSyncEventCreate.mockResolvedValue({});
    mockCheckpointUpsert.mockResolvedValue({});

    await pushChanges('profile-1', changes);

    expect(mockCheckpointUpsert).toHaveBeenCalledWith({
      where: {
        profileId_entityType: { profileId: 'profile-1', entityType: 'progress' },
      },
      update: expect.objectContaining({
        serverVersion: BigInt(10),
      }),
      create: expect.objectContaining({
        profileId: 'profile-1',
        entityType: 'progress',
        serverVersion: BigInt(10),
      }),
    });
  });
});

describe('pullChanges', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return events since the last checkpoint', async () => {
    mockCheckpointFindUnique.mockResolvedValue({
      profileId: 'profile-1',
      entityType: 'progress',
      serverVersion: BigInt(5),
    });

    mockSyncEventFindMany.mockResolvedValue([
      {
        entityType: 'progress',
        entityId: 'prog-6',
        action: 'create',
        payload: { score: 10 },
        version: BigInt(6),
        serverTimestamp: new Date('2026-03-01T12:00:00Z'),
      },
      {
        entityType: 'progress',
        entityId: 'prog-7',
        action: 'update',
        payload: { score: 20 },
        version: BigInt(7),
        serverTimestamp: new Date('2026-03-01T13:00:00Z'),
      },
    ]);

    const result = await pullChanges('profile-1', 'progress');

    expect(result.events).toHaveLength(2);
    expect(result.checkpoint).toBe('7');
    expect(result.hasMore).toBe(false);
    expect(result.events[0]).toEqual({
      entityType: 'progress',
      entityId: 'prog-6',
      action: 'create',
      payload: { score: 10 },
      version: '6',
      serverTimestamp: new Date('2026-03-01T12:00:00Z'),
    });
  });

  it('should use sinceVersion when provided instead of checkpoint', async () => {
    mockCheckpointFindUnique.mockResolvedValue(null);
    mockSyncEventFindMany.mockResolvedValue([]);

    await pullChanges('profile-1', 'progress', BigInt(42));

    expect(mockSyncEventFindMany).toHaveBeenCalledWith({
      where: {
        profileId: 'profile-1',
        entityType: 'progress',
        version: { gt: BigInt(42) },
      },
      orderBy: { version: 'asc' },
      take: 100,
    });
  });

  it('should default to version 0 when no checkpoint and no sinceVersion', async () => {
    mockCheckpointFindUnique.mockResolvedValue(null);
    mockSyncEventFindMany.mockResolvedValue([]);

    const result = await pullChanges('profile-1', 'progress');

    expect(mockSyncEventFindMany).toHaveBeenCalledWith({
      where: {
        profileId: 'profile-1',
        entityType: 'progress',
        version: { gt: BigInt(0) },
      },
      orderBy: { version: 'asc' },
      take: 100,
    });
    expect(result.checkpoint).toBe('0');
    expect(result.hasMore).toBe(false);
  });

  it('should set hasMore to true when 100 events are returned', async () => {
    mockCheckpointFindUnique.mockResolvedValue(null);

    const events = Array.from({ length: 100 }, (_, i) => ({
      entityType: 'progress',
      entityId: `prog-${i}`,
      action: 'create',
      payload: {},
      version: BigInt(i + 1),
      serverTimestamp: new Date(),
    }));
    mockSyncEventFindMany.mockResolvedValue(events);

    const result = await pullChanges('profile-1', 'progress');

    expect(result.hasMore).toBe(true);
    expect(result.checkpoint).toBe('100');
  });

  it('should return empty events with fromVersion checkpoint when no events exist', async () => {
    mockCheckpointFindUnique.mockResolvedValue({
      serverVersion: BigInt(10),
    });
    mockSyncEventFindMany.mockResolvedValue([]);

    const result = await pullChanges('profile-1', 'progress');

    expect(result.events).toHaveLength(0);
    expect(result.checkpoint).toBe('10');
    expect(result.hasMore).toBe(false);
  });
});

describe('resolveConflict', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a new sync event when resolution is client', async () => {
    mockSyncEventCreate.mockResolvedValue({});

    const clientPayload = { score: 999, name: 'updated' };
    const result = await resolveConflict(
      'profile-1',
      'progress',
      'prog-1',
      'client',
      clientPayload
    );

    expect(result).toEqual({ resolved: true });
    expect(mockSyncEventCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        profileId: 'profile-1',
        entityType: 'progress',
        entityId: 'prog-1',
        action: 'update',
        payload: clientPayload,
      }),
    });
  });

  it('should not create a sync event when resolution is server', async () => {
    const result = await resolveConflict('profile-1', 'progress', 'prog-1', 'server');

    expect(result).toEqual({ resolved: true });
    expect(mockSyncEventCreate).not.toHaveBeenCalled();
  });

  it('should not create a sync event when resolution is client but no payload provided', async () => {
    const result = await resolveConflict('profile-1', 'progress', 'prog-1', 'client');

    expect(result).toEqual({ resolved: true });
    expect(mockSyncEventCreate).not.toHaveBeenCalled();
  });

  it('should set action to update for client resolution', async () => {
    mockSyncEventCreate.mockResolvedValue({});

    await resolveConflict('profile-1', 'settings', 'set-1', 'client', { theme: 'dark' });

    expect(mockSyncEventCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: 'update',
        entityType: 'settings',
        entityId: 'set-1',
      }),
    });
  });

  it('should include a clientTimestamp in the created event', async () => {
    mockSyncEventCreate.mockResolvedValue({});

    const before = new Date();
    await resolveConflict('profile-1', 'progress', 'prog-1', 'client', { value: 1 });
    const after = new Date();

    const createCall = mockSyncEventCreate.mock.calls[0][0];
    const timestamp = createCall.data.clientTimestamp as Date;

    expect(timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
  });
});
