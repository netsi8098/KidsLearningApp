import { useCallback, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type ScrapbookEntry } from '../db/database';
import { milestones, type Milestone } from '../data/milestoneData';

export function useMilestones(playerId: number | undefined) {
  // Live queries for all relevant data
  const progressRecords = useLiveQuery(
    () =>
      playerId
        ? db.progress.where('playerId').equals(playerId).toArray()
        : [],
    [playerId],
    []
  );

  const profile = useLiveQuery(
    () => (playerId ? db.profiles.get(playerId) : undefined),
    [playerId]
  );

  const storyProgressRecords = useLiveQuery(
    () =>
      playerId
        ? db.storyProgress.where('playerId').equals(playerId).toArray()
        : [],
    [playerId],
    []
  );

  const artworkRecords = useLiveQuery(
    () =>
      playerId
        ? db.artworks.where('playerId').equals(playerId).toArray()
        : [],
    [playerId],
    []
  );

  const movementRecords = useLiveQuery(
    () =>
      playerId
        ? db.movementProgress.where('playerId').equals(playerId).toArray()
        : [],
    [playerId],
    []
  );

  const lifeSkillsRecords = useLiveQuery(
    () =>
      playerId
        ? db.lifeSkillsProgress.where('playerId').equals(playerId).toArray()
        : [],
    [playerId],
    []
  );

  const explorerRecords = useLiveQuery(
    () =>
      playerId
        ? db.explorerProgress.where('playerId').equals(playerId).toArray()
        : [],
    [playerId],
    []
  );

  const scrapbookEntries = useLiveQuery(
    () =>
      playerId
        ? db.scrapbookEntries
            .where('playerId')
            .equals(playerId)
            .toArray()
        : [],
    [playerId],
    [] as ScrapbookEntry[]
  );

  // Set of already-earned milestone IDs from scrapbook
  const earnedMilestoneIds = useMemo(() => {
    return new Set(
      scrapbookEntries
        .filter((e) => e.entryType === 'milestone')
        .map((e) => e.title)
    );
  }, [scrapbookEntries]);

  // Milestone check functions
  const checkCondition = useCallback(
    (milestone: Milestone): boolean => {
      switch (milestone.checkFn) {
        case 'checkFirst10': {
          return progressRecords.length >= 10;
        }
        case 'checkFirstWeek': {
          return (profile?.streakDays ?? 0) >= 7;
        }
        case 'checkAlphabetStarter': {
          const abcCount = progressRecords.filter(
            (p) => p.category === 'abc' && p.timesCompleted > 0
          ).length;
          return abcCount >= 10;
        }
        case 'checkAllColors': {
          const colorsCount = progressRecords.filter(
            (p) => p.category === 'colors' && p.timesCompleted > 0
          ).length;
          return colorsCount >= 10;
        }
        case 'checkNumberWhiz': {
          const numbersCount = progressRecords.filter(
            (p) => p.category === 'numbers' && p.timesCompleted > 0
          ).length;
          return numbersCount >= 10;
        }
        case 'checkShapeExpert': {
          const shapesCount = progressRecords.filter(
            (p) => p.category === 'shapes' && p.timesCompleted > 0
          ).length;
          return shapesCount >= 8;
        }
        case 'checkDanceStar': {
          const completedMovements = movementRecords.filter(
            (m) => m.completed
          ).length;
          return completedMovements >= 5;
        }
        case 'checkFirstDrawing': {
          return artworkRecords.length >= 1;
        }
        case 'checkStoryLover': {
          const completedStories = storyProgressRecords.filter(
            (s) => s.completed
          ).length;
          return completedStories >= 5;
        }
        case 'checkQuizChampion': {
          return progressRecords.some(
            (p) =>
              p.totalAttempts > 0 &&
              p.correctAnswers > 0 &&
              p.correctAnswers / p.totalAttempts === 1.0
          );
        }
        case 'checkExplorer': {
          const completedTopics = explorerRecords.filter(
            (e) => e.completed
          ).length;
          return completedTopics >= 3;
        }
        case 'checkSocialButterfly': {
          const completedSkills = lifeSkillsRecords.filter(
            (ls) => ls.completed
          ).length;
          return completedSkills >= 5;
        }
        default:
          return false;
      }
    },
    [
      progressRecords,
      profile,
      storyProgressRecords,
      artworkRecords,
      movementRecords,
      lifeSkillsRecords,
      explorerRecords,
    ]
  );

  // Get earned milestones (from scrapbook)
  const earnedMilestones = useMemo(() => {
    return milestones.filter((m) => earnedMilestoneIds.has(m.title));
  }, [earnedMilestoneIds]);

  // Check for new milestones not yet recorded
  const newMilestones = useMemo(() => {
    return milestones.filter(
      (m) => !earnedMilestoneIds.has(m.title) && checkCondition(m)
    );
  }, [earnedMilestoneIds, checkCondition]);

  // Award a milestone by saving to scrapbook
  const awardMilestone = useCallback(
    async (milestoneId: string) => {
      if (!playerId) return;

      const milestone = milestones.find((m) => m.id === milestoneId);
      if (!milestone) return;

      // Check if already earned
      const alreadyEarned = scrapbookEntries.some(
        (e) => e.entryType === 'milestone' && e.title === milestone.title
      );
      if (alreadyEarned) return;

      await db.scrapbookEntries.add({
        playerId,
        entryType: 'milestone',
        title: milestone.title,
        emoji: milestone.emoji,
        description: milestone.description,
        createdAt: new Date(),
      });
    },
    [playerId, scrapbookEntries]
  );

  return {
    earnedMilestones,
    newMilestones,
    awardMilestone,
  };
}
