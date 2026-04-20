/**
 * useDailyBonus — awards a bonus star once per calendar day when the app is opened.
 * Stores the last bonus date in localStorage per player.
 */
import { useState, useEffect, useCallback } from 'react';
import { db } from '../db/database';

const STORAGE_PREFIX = 'klf-daily-bonus-';

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function useDailyBonus(playerId: number | undefined) {
  const [showBonus, setShowBonus] = useState(false);
  const [bonusAwarded, setBonusAwarded] = useState(false);

  useEffect(() => {
    if (!playerId) return;

    const key = STORAGE_PREFIX + playerId;
    const lastBonus = localStorage.getItem(key);
    const today = todayStr();

    if (lastBonus !== today) {
      // Award daily bonus
      (async () => {
        try {
          const profile = await db.profiles.get(playerId);
          if (profile) {
            await db.profiles.update(playerId, {
              totalStars: (profile.totalStars ?? 0) + 1,
            });
            await db.stars.add({
              playerId,
              category: 'daily-bonus',
              starsEarned: 1,
              reason: 'Daily bonus for opening the app',
              earnedAt: new Date(),
            });
            localStorage.setItem(key, today);
            setBonusAwarded(true);
            setShowBonus(true);
          }
        } catch (err) {
          console.error('[DailyBonus] Error:', err);
        }
      })();
    }
  }, [playerId]);

  const dismissBonus = useCallback(() => {
    setShowBonus(false);
  }, []);

  return { showBonus, bonusAwarded, dismissBonus };
}
