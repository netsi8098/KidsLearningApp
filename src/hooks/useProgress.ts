import { useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import type { Category } from '../models/types';
import { useApp } from '../context/AppContext';
import { useProfiles } from './useProfile';

export function useProgress(playerId: number | undefined) {
  const { showStarBurst } = useApp();
  const { addStars } = useProfiles();
  const awardedRef = useRef<Set<string>>(new Set());

  const progress = useLiveQuery(
    () => (playerId ? db.progress.where('playerId').equals(playerId).toArray() : []),
    [playerId],
    []
  );

  const starRecords = useLiveQuery(
    () => (playerId ? db.stars.where('playerId').equals(playerId).toArray() : []),
    [playerId],
    []
  );

  async function recordActivity(category: Category, itemKey: string, correct: boolean) {
    if (!playerId) return;

    const existing = await db.progress
      .where('[playerId+category+itemKey]')
      .equals([playerId, category, itemKey])
      .first();

    if (existing) {
      await db.progress.update(existing.id!, {
        timesCompleted: existing.timesCompleted + (correct ? 1 : 0),
        correctAnswers: existing.correctAnswers + (correct ? 1 : 0),
        totalAttempts: existing.totalAttempts + 1,
        lastPracticedAt: new Date(),
      });
    } else {
      await db.progress.add({
        playerId,
        category,
        itemKey,
        timesCompleted: correct ? 1 : 0,
        correctAnswers: correct ? 1 : 0,
        totalAttempts: 1,
        lastPracticedAt: new Date(),
      });
    }

    // Log to content history for rediscovery/recommendations
    const contentId = `${category}:${itemKey}`;
    await db.contentHistory.add({
      playerId,
      contentId,
      interactedAt: new Date(),
      completed: correct,
    });

    // Only award star on first visit per session to prevent infinite stars
    const sessionKey = `${category}-${itemKey}`;
    if (correct && !awardedRef.current.has(sessionKey)) {
      awardedRef.current.add(sessionKey);
      await db.stars.add({
        playerId,
        category,
        starsEarned: 1,
        reason: `Learned ${itemKey} in ${category}`,
        earnedAt: new Date(),
      });
      await addStars(playerId, 1);
      showStarBurst();
    }
  }

  function getItemsLearnedCount(category: Category): number {
    return progress.filter((p) => p.category === category && p.timesCompleted > 0).length;
  }

  function getTotalCorrect(category: Category): number {
    return progress
      .filter((p) => p.category === category)
      .reduce((sum, p) => sum + p.correctAnswers, 0);
  }

  return { progress, starRecords, recordActivity, getItemsLearnedCount, getTotalCorrect };
}
