import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockPrisma, resetPrismaMocks } from '../../helpers/prisma.mock';

// ── Mock dependencies ────────────────────────────────────────
vi.mock('../../../src/lib/prisma', () => ({ prisma: mockPrisma }));

import {
  listMessages,
  getMessage,
  markRead,
  markAllRead,
  getPreferences,
  updatePreferences,
  sendMessage,
  sendBulk,
} from '../../../src/modules/messages/service';
import { NotFoundError } from '../../../src/lib/errors';

// ── Helpers ──────────────────────────────────────────────────

function fakeMessage(overrides: Record<string, unknown> = {}) {
  return {
    id: 'msg-1',
    householdId: 'hh-1',
    profileId: null,
    type: 'system',
    title: 'Welcome to Kids Learning Fun!',
    body: 'We are glad to have you here.',
    actionUrl: null,
    actionLabel: null,
    read: false,
    readAt: null,
    expiresAt: null,
    metadata: {},
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

function fakePreference(overrides: Record<string, unknown> = {}) {
  return {
    id: 'pref-1',
    parentId: 'parent-1',
    channel: 'push',
    messageType: 'weekly_recap',
    enabled: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

// ── Tests ────────────────────────────────────────────────────

describe('MessagesService', () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  // ── listMessages ──────────────────────────────────────────

  describe('listMessages', () => {
    it('should return paginated messages for a household', async () => {
      const messages = [fakeMessage(), fakeMessage({ id: 'msg-2' })];
      mockPrisma.message.findMany.mockResolvedValue(messages);
      mockPrisma.message.count.mockResolvedValue(2);

      const result = await listMessages({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        householdId: 'hh-1',
      });

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.totalPages).toBe(1);
    });

    it('should filter by householdId', async () => {
      mockPrisma.message.findMany.mockResolvedValue([]);
      mockPrisma.message.count.mockResolvedValue(0);

      await listMessages({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        householdId: 'hh-1',
      });

      const call = mockPrisma.message.findMany.mock.calls[0][0];
      expect(call.where.householdId).toBe('hh-1');
    });

    it('should filter by read status', async () => {
      mockPrisma.message.findMany.mockResolvedValue([]);
      mockPrisma.message.count.mockResolvedValue(0);

      await listMessages({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        householdId: 'hh-1',
        read: 'true',
      });

      const call = mockPrisma.message.findMany.mock.calls[0][0];
      expect(call.where.read).toBe(true);
    });

    it('should filter unread messages', async () => {
      mockPrisma.message.findMany.mockResolvedValue([]);
      mockPrisma.message.count.mockResolvedValue(0);

      await listMessages({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        householdId: 'hh-1',
        read: 'false',
      });

      const call = mockPrisma.message.findMany.mock.calls[0][0];
      expect(call.where.read).toBe(false);
    });

    it('should filter by type', async () => {
      mockPrisma.message.findMany.mockResolvedValue([]);
      mockPrisma.message.count.mockResolvedValue(0);

      await listMessages({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        householdId: 'hh-1',
        type: 'weekly_recap',
      });

      const call = mockPrisma.message.findMany.mock.calls[0][0];
      expect(call.where.type).toBe('weekly_recap');
    });

    it('should compute skip from page and limit', async () => {
      mockPrisma.message.findMany.mockResolvedValue([]);
      mockPrisma.message.count.mockResolvedValue(0);

      await listMessages({
        page: 3,
        limit: 5,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        householdId: 'hh-1',
      });

      const call = mockPrisma.message.findMany.mock.calls[0][0];
      expect(call.skip).toBe(10); // (3-1) * 5
      expect(call.take).toBe(5);
    });

    it('should calculate totalPages correctly', async () => {
      mockPrisma.message.findMany.mockResolvedValue([fakeMessage()]);
      mockPrisma.message.count.mockResolvedValue(22);

      const result = await listMessages({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        householdId: 'hh-1',
      });

      expect(result.totalPages).toBe(3);
    });
  });

  // ── getMessage ──────────────────────────────────────────────

  describe('getMessage', () => {
    it('should return message when found', async () => {
      mockPrisma.message.findUnique.mockResolvedValue(fakeMessage());

      const result = await getMessage('msg-1');

      expect(result.id).toBe('msg-1');
      expect(result.title).toBe('Welcome to Kids Learning Fun!');
    });

    it('should throw NotFoundError when message does not exist', async () => {
      mockPrisma.message.findUnique.mockResolvedValue(null);

      await expect(getMessage('missing')).rejects.toThrow(NotFoundError);
    });
  });

  // ── markRead ──────────────────────────────────────────────

  describe('markRead', () => {
    it('should mark a message as read with a timestamp', async () => {
      mockPrisma.message.findUnique.mockResolvedValue(fakeMessage());
      mockPrisma.message.update.mockResolvedValue(
        fakeMessage({ read: true, readAt: new Date() })
      );

      const result = await markRead('msg-1');

      expect(result.read).toBe(true);
      expect(result.readAt).toBeInstanceOf(Date);
      expect(mockPrisma.message.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'msg-1' },
          data: {
            read: true,
            readAt: expect.any(Date),
          },
        })
      );
    });

    it('should throw NotFoundError when message does not exist', async () => {
      mockPrisma.message.findUnique.mockResolvedValue(null);

      await expect(markRead('missing')).rejects.toThrow(NotFoundError);
    });
  });

  // ── markAllRead ──────────────────────────────────────────

  describe('markAllRead', () => {
    it('should mark all unread messages as read for a household', async () => {
      mockPrisma.message.updateMany.mockResolvedValue({ count: 5 });

      const result = await markAllRead({ householdId: 'hh-1' });

      expect(result).toEqual({ updated: 5 });
      expect(mockPrisma.message.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            householdId: 'hh-1',
            read: false,
          },
          data: {
            read: true,
            readAt: expect.any(Date),
          },
        })
      );
    });

    it('should return 0 when no unread messages exist', async () => {
      mockPrisma.message.updateMany.mockResolvedValue({ count: 0 });

      const result = await markAllRead({ householdId: 'hh-1' });

      expect(result).toEqual({ updated: 0 });
    });
  });

  // ── getPreferences ──────────────────────────────────────────

  describe('getPreferences', () => {
    it('should return preferences for a parent', async () => {
      const prefs = [
        fakePreference(),
        fakePreference({ id: 'pref-2', channel: 'email', messageType: 'tips' }),
      ];
      mockPrisma.messagePreference.findMany.mockResolvedValue(prefs);

      const result = await getPreferences({ parentId: 'parent-1' });

      expect(result).toHaveLength(2);
      expect(mockPrisma.messagePreference.findMany).toHaveBeenCalledWith({
        where: { parentId: 'parent-1' },
        orderBy: [{ channel: 'asc' }, { messageType: 'asc' }],
      });
    });

    it('should return empty array when no preferences exist', async () => {
      mockPrisma.messagePreference.findMany.mockResolvedValue([]);

      const result = await getPreferences({ parentId: 'parent-1' });

      expect(result).toEqual([]);
    });
  });

  // ── updatePreferences ──────────────────────────────────────

  describe('updatePreferences', () => {
    it('should upsert preferences via $transaction', async () => {
      const upsertResult = [fakePreference({ enabled: false })];
      mockPrisma.messagePreference.upsert.mockResolvedValue(fakePreference());

      const result = await updatePreferences({
        parentId: 'parent-1',
        preferences: [
          { channel: 'push', messageType: 'weekly_recap', enabled: false },
        ],
      });

      // $transaction is called with an array of promises
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('should handle multiple preferences at once', async () => {
      mockPrisma.messagePreference.upsert.mockResolvedValue(fakePreference());

      await updatePreferences({
        parentId: 'parent-1',
        preferences: [
          { channel: 'push', messageType: 'weekly_recap', enabled: true },
          { channel: 'email', messageType: 'tips', enabled: false },
          { channel: 'push', messageType: 'system', enabled: true },
        ],
      });

      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });
  });

  // ── sendMessage ──────────────────────────────────────────

  describe('sendMessage', () => {
    it('should create a message with required fields', async () => {
      mockPrisma.message.create.mockResolvedValue(fakeMessage());

      const result = await sendMessage({
        householdId: 'hh-1',
        type: 'system',
        title: 'Welcome!',
        body: 'Welcome to the app.',
      });

      expect(result.id).toBe('msg-1');
      expect(mockPrisma.message.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            householdId: 'hh-1',
            type: 'system',
            title: 'Welcome!',
            body: 'Welcome to the app.',
          }),
        })
      );
    });

    it('should set optional fields to null when not provided', async () => {
      mockPrisma.message.create.mockResolvedValue(fakeMessage());

      await sendMessage({
        householdId: 'hh-1',
        type: 'system',
        title: 'Test',
        body: 'Body',
      });

      const createCall = mockPrisma.message.create.mock.calls[0][0];
      expect(createCall.data.profileId).toBeNull();
      expect(createCall.data.actionUrl).toBeNull();
      expect(createCall.data.actionLabel).toBeNull();
      expect(createCall.data.expiresAt).toBeNull();
    });

    it('should set optional fields when provided', async () => {
      mockPrisma.message.create.mockResolvedValue(fakeMessage());

      await sendMessage({
        householdId: 'hh-1',
        profileId: 'profile-1',
        type: 'achievement',
        title: 'Badge Earned!',
        body: 'You earned the Star Reader badge.',
        actionUrl: '/badges/star-reader',
        actionLabel: 'View Badge',
        expiresAt: '2025-01-01T00:00:00Z',
        metadata: { badgeId: 'star-reader' },
      });

      const createCall = mockPrisma.message.create.mock.calls[0][0];
      expect(createCall.data.profileId).toBe('profile-1');
      expect(createCall.data.actionUrl).toBe('/badges/star-reader');
      expect(createCall.data.actionLabel).toBe('View Badge');
      expect(createCall.data.expiresAt).toBeInstanceOf(Date);
      expect(createCall.data.metadata).toEqual({ badgeId: 'star-reader' });
    });
  });

  // ── sendBulk ──────────────────────────────────────────────

  describe('sendBulk', () => {
    it('should create messages for multiple households', async () => {
      mockPrisma.message.createMany.mockResolvedValue({ count: 3 });

      const result = await sendBulk({
        householdIds: ['hh-1', 'hh-2', 'hh-3'],
        type: 'announcement',
        title: 'New Feature!',
        body: 'Check out the new creative tools.',
      });

      expect(result).toEqual({ created: 3 });
      expect(mockPrisma.message.createMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.arrayContaining([
            expect.objectContaining({ householdId: 'hh-1', type: 'announcement' }),
            expect.objectContaining({ householdId: 'hh-2' }),
            expect.objectContaining({ householdId: 'hh-3' }),
          ]),
        })
      );
    });

    it('should return created count of 0 for empty householdIds', async () => {
      mockPrisma.message.createMany.mockResolvedValue({ count: 0 });

      const result = await sendBulk({
        householdIds: [],
        type: 'system',
        title: 'Test',
        body: 'Body',
      });

      expect(result).toEqual({ created: 0 });
    });

    it('should set optional actionUrl and actionLabel', async () => {
      mockPrisma.message.createMany.mockResolvedValue({ count: 2 });

      await sendBulk({
        householdIds: ['hh-1', 'hh-2'],
        type: 'promo',
        title: 'Special Offer',
        body: 'Upgrade today!',
        actionUrl: '/upgrade',
        actionLabel: 'Upgrade Now',
      });

      const createCall = mockPrisma.message.createMany.mock.calls[0][0];
      expect(createCall.data[0].actionUrl).toBe('/upgrade');
      expect(createCall.data[0].actionLabel).toBe('Upgrade Now');
    });

    it('should set actionUrl and actionLabel to null when not provided', async () => {
      mockPrisma.message.createMany.mockResolvedValue({ count: 1 });

      await sendBulk({
        householdIds: ['hh-1'],
        type: 'system',
        title: 'Test',
        body: 'Body',
      });

      const createCall = mockPrisma.message.createMany.mock.calls[0][0];
      expect(createCall.data[0].actionUrl).toBeNull();
      expect(createCall.data[0].actionLabel).toBeNull();
    });
  });
});
