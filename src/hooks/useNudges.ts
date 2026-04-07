// ── Nudges Hook ─────────────────────────────────────────

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { nudgeRules } from '../registry/nudgeConfig';
import type { NudgeRule } from '../registry/types';

export interface ActiveNudge extends NudgeRule {
  dismissed: boolean;
}

export function useNudges(playerId: number | undefined) {
  const profile = useLiveQuery(
    () => (playerId ? db.profiles.get(playerId) : undefined),
    [playerId]
  );

  const dismissedNudges = useLiveQuery(
    () =>
      playerId
        ? db.nudgeState.where('playerId').equals(playerId).toArray()
        : [],
    [playerId],
    []
  );

  const recentHistory = useLiveQuery(
    () => {
      if (!playerId) return [];
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      return db.contentHistory
        .where('playerId')
        .equals(playerId)
        .filter((h) => h.interactedAt >= threeDaysAgo)
        .toArray();
    },
    [playerId],
    []
  );

  const dismissedIds = new Set(dismissedNudges.map((n) => n.nudgeId));

  // Evaluate conditions
  const activeNudges: ActiveNudge[] = [];

  if (profile && playerId) {
    const daysSincePlay = profile.lastPlayedAt
      ? Math.floor((Date.now() - new Date(profile.lastPlayedAt).getTime()) / (24 * 60 * 60 * 1000))
      : 999;

    for (const rule of nudgeRules) {
      let active = false;

      switch (rule.condition) {
        case 'inactive-3-days':
          active = daysSincePlay >= 3;
          break;
        case 'streak-at-risk':
          active = profile.streakDays > 0 && daysSincePlay >= 1;
          break;
        case 'new-content-available':
          active = true; // Always true when there's new content
          break;
        case 'incomplete-collection':
          active = recentHistory.length > 5; // Show after some usage
          break;
        case 'skill-gap':
          active = recentHistory.length > 10;
          break;
        case 'weekly-recap-ready': {
          const dayOfWeek = new Date().getDay();
          active = dayOfWeek === 0; // Sunday
          break;
        }
      }

      if (active) {
        activeNudges.push({
          ...rule,
          dismissed: dismissedIds.has(rule.id),
        });
      }
    }
  }

  // Sort by priority, filter dismissed
  const visibleNudges = activeNudges
    .filter((n) => !n.dismissed)
    .sort((a, b) => b.priority - a.priority);

  async function dismissNudge(nudgeId: string) {
    if (!playerId) return;
    await db.nudgeState.add({
      playerId,
      nudgeId,
      dismissedAt: new Date(),
    });
  }

  return { nudges: visibleNudges, dismissNudge };
}
