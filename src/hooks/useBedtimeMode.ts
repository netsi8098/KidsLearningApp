import { useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { db } from '../db/database';

export function useBedtimeMode() {
  const { bedtimeMode, setBedtimeMode, currentPlayer } = useApp();

  const toggleBedtime = useCallback(async () => {
    const next = !bedtimeMode;
    setBedtimeMode(next);

    if (currentPlayer?.id) {
      await db.profiles.update(currentPlayer.id, { bedtimeMode: next });
    }
  }, [bedtimeMode, setBedtimeMode, currentPlayer]);

  return { isBedtime: bedtimeMode, toggleBedtime };
}
