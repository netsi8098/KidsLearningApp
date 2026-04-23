/**
 * Homepage Theme System — selectable world environments.
 * Each theme defines: visual scene, mascot placement, ambient motion config,
 * accent colors for app-wide theming, and preview thumbnail data.
 */

export interface HomepageTheme {
  id: string;
  name: string;
  /** Short description for the theme picker */
  tagline: string;
  /** Sky gradient stops [top, bottom] */
  skyGradient: [string, string];
  /** Ground/foreground gradient stops [top, bottom] */
  groundGradient: [string, string];
  /** Accent colors used across the app when this theme is active */
  accentColors: {
    primary: string;
    secondary: string;
    warm: string;
    glow: string;
  };
  /** Scene mood — affects ambient motion intensity */
  mood: 'cheerful' | 'peaceful' | 'magical' | 'cozy';
  /** Preview background color for theme picker card */
  previewBg: string;
}

export const themes: HomepageTheme[] = [
  {
    id: 'sunny-meadow',
    name: 'Sunny Rainbow Meadow',
    tagline: 'A bright, cheerful meadow with butterflies and rainbows',
    skyGradient: ['#87CEEB', '#B8E4F0'],
    groundGradient: ['#8FE388', '#4CAF50'],
    accentColors: {
      primary: '#6BCB77',
      secondary: '#FFE66D',
      warm: '#FF8FAB',
      glow: '#87CEEB',
    },
    mood: 'cheerful',
    previewBg: '#B8E4F0',
  },
  {
    id: 'sky-islands',
    name: 'Sky Islands Adventure',
    tagline: 'Floating islands in a dreamy sky with rockets and stars',
    skyGradient: ['#1A1040', '#4A3080'],
    groundGradient: ['#6BCB77', '#3A9E4A'],
    accentColors: {
      primary: '#A78BFA',
      secondary: '#FFE66D',
      warm: '#FF8FAB',
      glow: '#C4B5FD',
    },
    mood: 'magical',
    previewBg: '#2D1B69',
  },
  {
    id: 'river-garden',
    name: 'River Garden',
    tagline: 'A peaceful garden with a sparkling stream and flowers',
    skyGradient: ['#87CEEB', '#C8E6C9'],
    groundGradient: ['#6BCB77', '#2E7D32'],
    accentColors: {
      primary: '#4ECDC4',
      secondary: '#A78BFA',
      warm: '#FFE66D',
      glow: '#A8E6CF',
    },
    mood: 'peaceful',
    previewBg: '#C8E6C9',
  },
  {
    id: 'treehouse',
    name: 'Treehouse Village',
    tagline: 'A cozy treehouse with warm lanterns and falling leaves',
    skyGradient: ['#2C3E6B', '#FF8C42'],
    groundGradient: ['#5D4037', '#3E2723'],
    accentColors: {
      primary: '#FF8C42',
      secondary: '#FFD93D',
      warm: '#E67E22',
      glow: '#FFB347',
    },
    mood: 'cozy',
    previewBg: '#FF8C42',
  },
];

export function getThemeById(id: string): HomepageTheme {
  return themes.find((t) => t.id === id) || themes[0];
}

/** Default theme for new profiles */
export const DEFAULT_THEME_ID = 'river-garden';

/** Map theme IDs to hero image filenames */
export const themeHeroImages: Record<string, string> = {
  'sunny-meadow': '/assets/themes/sunny-meadow-hero.jpg',
  'sky-islands': '/assets/themes/sky-islands-hero.jpg',
  'river-garden': '/assets/themes/river-garden-hero.jpg',
  'treehouse': '/assets/themes/treehouse-hero.jpg',
};
