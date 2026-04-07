import { useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type ExplorerProgress } from '../db/database';
import { useApp } from '../context/AppContext';
import { useProfiles } from './useProfile';
import { explorerTopics } from '../data/worldExplorerData';

export function useExplorer(playerId: number | undefined) {
  const { showStarBurst, showCelebration } = useApp();
  const { addStars } = useProfiles();

  const allProgress = useLiveQuery(
    () =>
      playerId
        ? db.explorerProgress.where('playerId').equals(playerId).toArray()
        : [],
    [playerId],
    [] as ExplorerProgress[]
  );

  const readFact = useCallback(
    async (topicId: string, factIndex: number) => {
      if (!playerId) return;

      const topic = explorerTopics.find((t) => t.id === topicId);
      if (!topic) return;

      const existing = await db.explorerProgress
        .where('[playerId+topicId]')
        .equals([playerId, topicId])
        .first();

      const newFactsRead = Math.max(factIndex + 1, existing?.factsRead ?? 0);

      if (existing) {
        await db.explorerProgress.update(existing.id!, {
          factsRead: newFactsRead,
          lastExploredAt: new Date(),
        });
      } else {
        await db.explorerProgress.add({
          playerId,
          topicId,
          factsRead: newFactsRead,
          totalFacts: topic.facts.length,
          completed: false,
          lastExploredAt: new Date(),
        });
      }
    },
    [playerId]
  );

  const completeQuiz = useCallback(
    async (topicId: string, score: number) => {
      if (!playerId) return;

      const topic = explorerTopics.find((t) => t.id === topicId);
      if (!topic) return;

      const existing = await db.explorerProgress
        .where('[playerId+topicId]')
        .equals([playerId, topicId])
        .first();

      const wasAlreadyCompleted = existing?.completed;

      if (existing) {
        await db.explorerProgress.update(existing.id!, {
          quizScore: score,
          completed: true,
          lastExploredAt: new Date(),
        });
      } else {
        await db.explorerProgress.add({
          playerId,
          topicId,
          factsRead: topic.facts.length,
          totalFacts: topic.facts.length,
          quizScore: score,
          completed: true,
          lastExploredAt: new Date(),
        });
      }

      // Award star on first completion
      if (!wasAlreadyCompleted) {
        await db.stars.add({
          playerId,
          category: 'explorer',
          starsEarned: 1,
          reason: `Completed explorer topic: ${topic.title}`,
          earnedAt: new Date(),
        });
        await addStars(playerId, 1);
        showStarBurst();
        showCelebration();
      }
    },
    [playerId, addStars, showStarBurst, showCelebration]
  );

  const isTopicCompleted = useCallback(
    (topicId: string): boolean => {
      return allProgress.some((p) => p.topicId === topicId && p.completed);
    },
    [allProgress]
  );

  const getTopicProgress = useCallback(
    (topicId: string): ExplorerProgress | undefined => {
      return allProgress.find((p) => p.topicId === topicId);
    },
    [allProgress]
  );

  return {
    allProgress,
    readFact,
    completeQuiz,
    isTopicCompleted,
    getTopicProgress,
  };
}
