import { useMemo } from 'react';
import { getActiveTheme, type SeasonalTheme } from '../data/seasonalData';

interface UseSeasonalContentReturn {
  activeTheme: SeasonalTheme;
  bannerMessage: string;
  seasonEmoji: string;
  seasonColor: string;
}

export function useSeasonalContent(): UseSeasonalContentReturn {
  const activeTheme = useMemo(() => getActiveTheme(), []);

  return {
    activeTheme,
    bannerMessage: activeTheme.bannerMessage,
    seasonEmoji: activeTheme.emoji,
    seasonColor: activeTheme.color,
  };
}
