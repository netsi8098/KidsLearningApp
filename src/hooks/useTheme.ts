/**
 * useTheme — provides the active homepage theme for any component.
 * Reads from localStorage (will migrate to player profile later).
 */
import { useState, useEffect } from 'react';
import { getThemeById, DEFAULT_THEME_ID, type HomepageTheme } from '../data/homepageThemes';

export function useTheme(): HomepageTheme {
  const [themeId] = useState(() => {
    try {
      return localStorage.getItem('klf-homepage-theme') || DEFAULT_THEME_ID;
    } catch {
      return DEFAULT_THEME_ID;
    }
  });

  return getThemeById(themeId);
}

/** Apply theme accent as CSS custom properties on :root */
export function useThemeAccents(): void {
  const theme = useTheme();

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', theme.accentColors.primary);
    root.style.setProperty('--theme-secondary', theme.accentColors.secondary);
    root.style.setProperty('--theme-warm', theme.accentColors.warm);
    root.style.setProperty('--theme-glow', theme.accentColors.glow);
    root.style.setProperty('--theme-sky-top', theme.skyGradient[0]);
    root.style.setProperty('--theme-sky-bottom', theme.skyGradient[1]);
  }, [theme]);
}
