import { renderHook, act } from '@testing-library/react';
import { useInbox } from '../../../src/hooks/useInbox';

const mocks = vi.hoisted(() => ({
  mockPlayerId: 1 as number | undefined,
  mockMessages: [] as {
    id?: number;
    playerId: number;
    type: string;
    title: string;
    body: string;
    read: boolean;
    createdAt: Date;
  }[],
  mockInboxUpdate: vi.fn(),
  mockInboxFilterToArray: vi.fn(),
}));

vi.mock('../../../src/context/AppContext', () => ({
  useApp: () => ({
    currentPlayer: mocks.mockPlayerId ? { id: mocks.mockPlayerId } : null,
  }),
}));

vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: () => mocks.mockMessages,
}));

vi.mock('../../../src/db/database', () => ({
  db: {
    inboxMessages: {
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          reverse: vi.fn(() => ({
            sortBy: vi.fn(() => Promise.resolve(mocks.mockMessages)),
          })),
          filter: vi.fn(() => ({
            toArray: mocks.mockInboxFilterToArray,
          })),
        })),
      })),
      update: mocks.mockInboxUpdate,
    },
  },
}));

describe('useInbox', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mockPlayerId = 1;
    mocks.mockMessages = [];
    mocks.mockInboxFilterToArray.mockResolvedValue([]);
  });

  describe('unreadCount', () => {
    it('returns 0 when no messages', () => {
      const { result } = renderHook(() => useInbox());
      expect(result.current.unreadCount).toBe(0);
    });

    it('correctly counts unread messages', () => {
      mocks.mockMessages = [
        { id: 1, playerId: 1, type: 'tip', title: 'Tip 1', body: 'Body', read: false, createdAt: new Date() },
        { id: 2, playerId: 1, type: 'tip', title: 'Tip 2', body: 'Body', read: true, createdAt: new Date() },
        { id: 3, playerId: 1, type: 'system', title: 'System', body: 'Body', read: false, createdAt: new Date() },
      ];

      const { result } = renderHook(() => useInbox());
      expect(result.current.unreadCount).toBe(2);
    });

    it('returns 0 when all messages are read', () => {
      mocks.mockMessages = [
        { id: 1, playerId: 1, type: 'tip', title: 'Tip 1', body: 'Body', read: true, createdAt: new Date() },
        { id: 2, playerId: 1, type: 'tip', title: 'Tip 2', body: 'Body', read: true, createdAt: new Date() },
      ];

      const { result } = renderHook(() => useInbox());
      expect(result.current.unreadCount).toBe(0);
    });

    it('returns total count when all messages are unread', () => {
      mocks.mockMessages = [
        { id: 1, playerId: 1, type: 'tip', title: 'Tip 1', body: 'Body', read: false, createdAt: new Date() },
        { id: 2, playerId: 1, type: 'recap', title: 'Recap', body: 'Body', read: false, createdAt: new Date() },
        { id: 3, playerId: 1, type: 'system', title: 'System', body: 'Body', read: false, createdAt: new Date() },
      ];

      const { result } = renderHook(() => useInbox());
      expect(result.current.unreadCount).toBe(3);
    });
  });

  describe('messages', () => {
    it('returns empty array when no messages', () => {
      const { result } = renderHook(() => useInbox());
      expect(result.current.messages).toEqual([]);
    });

    it('returns all messages from DB', () => {
      mocks.mockMessages = [
        { id: 1, playerId: 1, type: 'tip', title: 'Tip 1', body: 'Body', read: false, createdAt: new Date() },
        { id: 2, playerId: 1, type: 'recap', title: 'Recap', body: 'Body', read: true, createdAt: new Date() },
      ];

      const { result } = renderHook(() => useInbox());
      expect(result.current.messages).toHaveLength(2);
    });
  });

  describe('markRead', () => {
    it('updates single message to read', async () => {
      const { result } = renderHook(() => useInbox());

      await act(async () => {
        await result.current.markRead(5);
      });

      expect(mocks.mockInboxUpdate).toHaveBeenCalledWith(5, { read: true });
    });

    it('calls update with correct message ID', async () => {
      const { result } = renderHook(() => useInbox());

      await act(async () => {
        await result.current.markRead(42);
      });

      expect(mocks.mockInboxUpdate).toHaveBeenCalledWith(42, { read: true });
    });
  });

  describe('markAllRead', () => {
    it('updates all unread messages to read', async () => {
      const unreadMessages = [
        { id: 1, playerId: 1, type: 'tip', title: 'Tip 1', body: 'Body', read: false, createdAt: new Date() },
        { id: 3, playerId: 1, type: 'system', title: 'System', body: 'Body', read: false, createdAt: new Date() },
      ];
      mocks.mockInboxFilterToArray.mockResolvedValue(unreadMessages);

      const { result } = renderHook(() => useInbox());

      await act(async () => {
        await result.current.markAllRead();
      });

      expect(mocks.mockInboxUpdate).toHaveBeenCalledTimes(2);
      expect(mocks.mockInboxUpdate).toHaveBeenCalledWith(1, { read: true });
      expect(mocks.mockInboxUpdate).toHaveBeenCalledWith(3, { read: true });
    });

    it('does nothing when no player is set', async () => {
      mocks.mockPlayerId = undefined;
      const { result } = renderHook(() => useInbox());

      await act(async () => {
        await result.current.markAllRead();
      });

      expect(mocks.mockInboxUpdate).not.toHaveBeenCalled();
    });

    it('handles empty unread list gracefully', async () => {
      mocks.mockInboxFilterToArray.mockResolvedValue([]);

      const { result } = renderHook(() => useInbox());

      await act(async () => {
        await result.current.markAllRead();
      });

      expect(mocks.mockInboxUpdate).not.toHaveBeenCalled();
    });
  });
});
