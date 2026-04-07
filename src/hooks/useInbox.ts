import { useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type InboxMessage } from '../db/database';
import { useApp } from '../context/AppContext';

export function useInbox() {
  const { currentPlayer } = useApp();
  const playerId = currentPlayer?.id;

  const messages = useLiveQuery(
    () =>
      playerId
        ? db.inboxMessages
            .where('playerId')
            .equals(playerId)
            .reverse()
            .sortBy('createdAt')
        : [],
    [playerId],
    [] as InboxMessage[]
  );

  const unreadCount = messages.filter((m) => !m.read).length;

  const markRead = useCallback(
    async (messageId: number) => {
      await db.inboxMessages.update(messageId, { read: true });
    },
    []
  );

  const markAllRead = useCallback(async () => {
    if (!playerId) return;
    const unread = await db.inboxMessages
      .where('playerId')
      .equals(playerId)
      .filter((m) => !m.read)
      .toArray();
    await Promise.all(
      unread.map((m) => db.inboxMessages.update(m.id!, { read: true }))
    );
  }, [playerId]);

  return { messages, unreadCount, markRead, markAllRead };
}
