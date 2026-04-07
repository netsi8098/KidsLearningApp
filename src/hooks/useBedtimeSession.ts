import { useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type BedtimeSession } from '../db/database';

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function useBedtimeSession(playerId: number | undefined) {
  // Live query: tonight's session (most recent for today)
  const tonightSession = useLiveQuery(
    () => {
      if (!playerId) return undefined;
      const today = todayStr();
      return db.bedtimeSessions
        .where('[playerId+date]')
        .equals([playerId, today])
        .last();
    },
    [playerId],
    undefined as BedtimeSession | undefined
  );

  const startSession = useCallback(async () => {
    if (!playerId) return;
    const today = todayStr();

    // Check if session already exists for today
    const existing = await db.bedtimeSessions
      .where('[playerId+date]')
      .equals([playerId, today])
      .first();

    if (existing) return existing;

    const id = await db.bedtimeSessions.add({
      playerId,
      date: today,
      calmSoundPlayed: false,
      startedAt: new Date(),
    });

    return { id, playerId, date: today, calmSoundPlayed: false, startedAt: new Date() };
  }, [playerId]);

  const recordStory = useCallback(
    async (storyId: string) => {
      if (!playerId) return;
      const today = todayStr();
      const session = await db.bedtimeSessions
        .where('[playerId+date]')
        .equals([playerId, today])
        .last();

      if (session?.id) {
        await db.bedtimeSessions.update(session.id, { storyId });
      }
    },
    [playerId]
  );

  const recordBreathing = useCallback(
    async (exerciseId: string) => {
      if (!playerId) return;
      const today = todayStr();
      const session = await db.bedtimeSessions
        .where('[playerId+date]')
        .equals([playerId, today])
        .last();

      if (session?.id) {
        await db.bedtimeSessions.update(session.id, { breathingExercise: exerciseId });
      }
    },
    [playerId]
  );

  const completeSession = useCallback(async () => {
    if (!playerId) return;
    const today = todayStr();
    const session = await db.bedtimeSessions
      .where('[playerId+date]')
      .equals([playerId, today])
      .last();

    if (session?.id) {
      await db.bedtimeSessions.update(session.id, { completedAt: new Date() });
    }
  }, [playerId]);

  return { tonightSession, startSession, recordStory, recordBreathing, completeSession };
}
