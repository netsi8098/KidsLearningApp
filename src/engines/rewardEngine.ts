// ── Reward Engine ───────────────────────────────────────
// Centralized star calculation with anti-exploit protection.

import type { ContentType } from '../registry/types';
import { contentById } from '../registry/contentRegistry';
import { rewardRules, COOLDOWN_SECONDS, DAILY_STAR_CAP, extendedBadges } from '../registry/rewardConfig';
import { db } from '../db/database';

export interface RewardResult {
  stars: number;
  bonusStars: number;
  reason: string;
}

interface RewardContext {
  playerId: number;
  isFirstCompletion: boolean;
  streakDays: number;
  isCollectionItem: boolean;
}

/** Calculate reward for completing a content item */
export function calculateReward(
  contentId: string,
  context: RewardContext
): RewardResult {
  const item = contentById.get(contentId);
  if (!item) return { stars: 0, bonusStars: 0, reason: 'Unknown content' };

  const rule = rewardRules[item.type];
  if (!rule) return { stars: 1, bonusStars: 0, reason: 'Default reward' };

  let stars = rule.starsPerCompletion;
  let bonusStars = 0;
  const reasons: string[] = [];

  // First completion bonus
  if (context.isFirstCompletion) {
    bonusStars += rule.firstCompletionBonus;
    reasons.push('first time');
  }

  // Collection bonus
  if (context.isCollectionItem) {
    bonusStars += rule.collectionBonus;
    reasons.push('collection');
  }

  // Streak multiplier (applies to base stars only)
  if (context.streakDays >= 3) {
    const multiplied = Math.floor(stars * rule.streakMultiplier);
    const streakBonus = multiplied - stars;
    if (streakBonus > 0) {
      bonusStars += streakBonus;
      reasons.push(`${context.streakDays}-day streak`);
    }
  }

  const reason = reasons.length > 0
    ? `${stars + bonusStars} stars (${reasons.join(', ')})`
    : `${stars} stars`;

  return { stars, bonusStars, reason };
}

/** Check cooldown — returns true if reward is allowed */
export async function checkCooldown(
  playerId: number,
  contentId: string
): Promise<boolean> {
  const cutoff = new Date(Date.now() - COOLDOWN_SECONDS * 1000);
  const recent = await db.contentHistory
    .where('[playerId+contentId]')
    .equals([playerId, contentId])
    .filter((h) => h.interactedAt > cutoff)
    .count();
  return recent === 0;
}

/** Check daily cap — returns remaining stars allowed today */
export async function getRemainingDailyCap(playerId: number): Promise<number> {
  const today = new Date().toISOString().slice(0, 10);
  const todayStart = new Date(today);
  const stars = await db.stars
    .where('playerId')
    .equals(playerId)
    .filter((s) => s.earnedAt >= todayStart)
    .toArray();
  const todayTotal = stars.reduce((sum, s) => sum + s.starsEarned, 0);
  return Math.max(0, DAILY_STAR_CAP - todayTotal);
}

/** Check all extended badges for a player */
export async function checkExtendedBadges(playerId: number): Promise<string[]> {
  const newlyEarned: string[] = [];
  const existing = await db.badges.where('playerId').equals(playerId).toArray();
  const earnedIds = new Set(existing.map((b) => b.badgeId));

  const profile = await db.profiles.get(playerId);
  if (!profile) return [];

  for (const badge of extendedBadges) {
    if (earnedIds.has(badge.id)) continue;

    let current = 0;

    switch (badge.category) {
      case 'general':
        current = profile.totalStars;
        break;
      case 'abc':
        current = await db.progress
          .where('playerId').equals(playerId)
          .filter((p) => p.category === 'abc' && p.timesCompleted > 0)
          .count();
        break;
      case 'numbers':
        current = await db.progress
          .where('playerId').equals(playerId)
          .filter((p) => p.category === 'numbers' && p.timesCompleted > 0)
          .count();
        break;
      case 'colors':
        current = await db.progress
          .where('playerId').equals(playerId)
          .filter((p) => p.category === 'colors' && p.timesCompleted > 0)
          .count();
        break;
      case 'shapes':
        current = await db.progress
          .where('playerId').equals(playerId)
          .filter((p) => p.category === 'shapes' && p.timesCompleted > 0)
          .count();
        break;
      case 'animals':
        current = await db.progress
          .where('playerId').equals(playerId)
          .filter((p) => p.category === 'animals' && p.timesCompleted > 0)
          .count();
        break;
      case 'quiz':
        current = await db.progress
          .where('playerId').equals(playerId)
          .filter((p) => p.category === 'quiz')
          .toArray()
          .then((arr) => arr.reduce((sum, p) => sum + p.correctAnswers, 0));
        break;
      case 'streak':
        current = profile.streakDays;
        break;
      case 'collections': {
        const completed = await db.collectionProgress
          .where('playerId').equals(playerId)
          .filter((c) => !!c.completedAt)
          .count();
        current = completed;
        break;
      }
      case 'playlists': {
        const completed = await db.playlistProgress
          .where('playerId').equals(playerId)
          .filter((p) => !!p.completedAt)
          .count();
        current = completed;
        break;
      }
      case 'skills': {
        const history = await db.contentHistory
          .where('playerId').equals(playerId)
          .toArray();
        const uniqueTypes = new Set(history.map((h) => {
          const parts = h.contentId.split(':');
          return parts[0];
        }));
        current = uniqueTypes.size;
        break;
      }
      case 'skill-areas': {
        const history = await db.contentHistory
          .where('playerId').equals(playerId)
          .toArray();
        const types = new Set(history.map((h) => h.contentId.split(':')[0]));
        // Map content types to skill areas
        const areas = new Set<string>();
        for (const t of types) {
          if (['alphabet', 'lesson'].includes(t)) areas.add('literacy');
          if (['number', 'shape'].includes(t)) areas.add('math');
          if (['animal', 'explorer', 'bodypart'].includes(t)) areas.add('science');
          if (['emotion', 'lifeskill'].includes(t)) areas.add('social');
          if (['movement'].includes(t)) areas.add('physical');
          if (['coloring', 'color', 'cooking'].includes(t)) areas.add('creativity');
        }
        current = areas.size;
        break;
      }
      case 'variety': {
        const history = await db.contentHistory
          .where('playerId').equals(playerId)
          .toArray();
        const types = new Set(history.map((h) => h.contentId.split(':')[0]));
        current = types.size;
        break;
      }
      case 'stories': {
        const completed = await db.storyProgress
          .where('playerId').equals(playerId)
          .filter((s) => s.completed)
          .count();
        current = completed;
        break;
      }
      case 'artworks': {
        current = await db.artworks.where('playerId').equals(playerId).count();
        break;
      }
      default:
        continue;
    }

    if (current >= badge.threshold) {
      newlyEarned.push(badge.id);
    }
  }

  return newlyEarned;
}
