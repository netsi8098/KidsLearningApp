import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { badgeData } from '../data/badgeData';
import { useProgress } from './useProgress';
import { useApp } from '../context/AppContext';
import { useAudio } from './useAudio';
import type { BadgeDefinition } from '../models/types';
import { extendedBadges } from '../registry/rewardConfig';
import { checkExtendedBadges } from '../engines/rewardEngine';

export interface BadgeProgress {
  badge: BadgeDefinition;
  current: number;
  total: number;
  earned: boolean;
  /** A human-readable hint like "7/10 letters learned" */
  hint: string;
  /** 0..1 ratio of progress */
  ratio: number;
}

const categoryLabels: Record<string, string> = {
  general: 'stars earned',
  abc: 'letters learned',
  numbers: 'numbers learned',
  colors: 'colors learned',
  shapes: 'shapes learned',
  animals: 'animals learned',
  quiz: 'quiz answers correct',
};

export function useBadges(playerId: number | undefined) {
  const { showCelebration, showBadgeToast } = useApp();
  const { getItemsLearnedCount, getTotalCorrect, starRecords } = useProgress(playerId);
  const { playCelebration } = useAudio();

  const earnedBadges = useLiveQuery(
    () => (playerId ? db.badges.where('playerId').equals(playerId).toArray() : []),
    [playerId],
    []
  );

  const profile = useLiveQuery(
    () => (playerId ? db.profiles.get(playerId) : undefined),
    [playerId]
  );

  const earnedBadgeIds = new Set(earnedBadges.map((b) => b.badgeId));

  /** Get the current progress count for a badge's category */
  function getBadgeCurrentCount(badge: BadgeDefinition): number {
    if (badge.category === 'general') {
      return profile?.totalStars ?? 0;
    } else if (badge.category === 'quiz') {
      return getTotalCorrect('quiz');
    } else {
      return getItemsLearnedCount(badge.category);
    }
  }

  /** Build progress info for every badge */
  function getBadgeProgressList(): BadgeProgress[] {
    return badgeData.map((badge) => {
      const current = getBadgeCurrentCount(badge);
      const total = badge.threshold;
      const earned = earnedBadgeIds.has(badge.id);
      const clamped = Math.min(current, total);
      const label = categoryLabels[badge.category] ?? 'completed';
      const hint = earned ? 'Earned!' : `${clamped}/${total} ${label}`;
      const ratio = total > 0 ? clamped / total : 0;
      return { badge, current: clamped, total, earned, hint, ratio };
    });
  }

  /** Find the locked badge closest to being earned (highest ratio < 1) */
  function getNextBadge(): BadgeProgress | null {
    const progressList = getBadgeProgressList();
    const locked = progressList.filter((bp) => !bp.earned);
    if (locked.length === 0) return null;
    // Sort by ratio descending, pick the closest to completion
    locked.sort((a, b) => b.ratio - a.ratio);
    return locked[0];
  }

  /** Count unique days the user has earned stars (for "days of learning") */
  function getDaysOfLearning(): number {
    const uniqueDays = new Set(
      starRecords.map((r) => new Date(r.earnedAt).toISOString().slice(0, 10))
    );
    return uniqueDays.size;
  }

  async function checkAndAwardBadges(totalStars: number) {
    if (!playerId) return;

    for (const badge of badgeData) {
      if (earnedBadgeIds.has(badge.id)) continue;

      let earned = false;

      if (badge.category === 'general') {
        earned = totalStars >= badge.threshold;
      } else if (badge.category === 'quiz') {
        earned = getTotalCorrect('quiz') >= badge.threshold;
      } else {
        earned = getItemsLearnedCount(badge.category) >= badge.threshold;
      }

      if (earned) {
        const exists = await db.badges
          .where('[playerId+badgeId]')
          .equals([playerId, badge.id])
          .first();
        if (!exists) {
          await db.badges.add({ playerId, badgeId: badge.id, earnedAt: new Date() });
          showCelebration();
          playCelebration();
          showBadgeToast(badge.emoji, badge.name);
        }
      }
    }
  }

  /** Check extended badges (v6) and award any newly earned */
  async function checkAndAwardExtendedBadges() {
    if (!playerId) return;
    const newIds = await checkExtendedBadges(playerId);
    for (const badgeId of newIds) {
      const exists = await db.badges
        .where('[playerId+badgeId]')
        .equals([playerId, badgeId])
        .first();
      if (!exists) {
        await db.badges.add({ playerId, badgeId, earnedAt: new Date() });
        const badge = extendedBadges.find((b) => b.id === badgeId);
        if (badge) {
          showCelebration();
          playCelebration();
          showBadgeToast(badge.emoji, badge.name);
        }
      }
    }
  }

  return {
    earnedBadges,
    earnedBadgeIds,
    checkAndAwardBadges,
    checkAndAwardExtendedBadges,
    badgeData,
    extendedBadges,
    getBadgeProgressList,
    getNextBadge,
    getDaysOfLearning,
    totalStars: profile?.totalStars ?? 0,
  };
}
