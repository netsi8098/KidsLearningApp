// ── Cover Art Palettes ──────────────────────────────────────────
// Color groupings for content cover cards. Each palette defines
// gradient stops, text color, accent, and badge background.

export type CoverPaletteName =
  | 'bedtime'
  | 'active'
  | 'learning'
  | 'discovery'
  | 'storytelling'
  | 'nature'
  | 'default';

export interface CoverPalette {
  readonly name: string;
  readonly gradientStart: string;
  readonly gradientEnd: string;
  readonly gradientAngle: number;        // degrees
  readonly textColor: string;
  readonly textShadow: string;
  readonly accentColor: string;
  readonly badgeBg: string;
  readonly badgeText: string;
  readonly pillBg: string;
  readonly pillText: string;
}

export const coverPalettes: Record<CoverPaletteName, CoverPalette> = {
  bedtime: {
    name: 'Bedtime',
    gradientStart: '#312E81',   // indigo-900
    gradientEnd: '#5B21B6',     // purple-800
    gradientAngle: 135,
    textColor: '#E0E7FF',       // light indigo
    textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
    accentColor: '#C4B5FD',     // lavender
    badgeBg: 'rgba(196, 181, 253, 0.25)',
    badgeText: '#C4B5FD',
    pillBg: 'rgba(224, 231, 255, 0.2)',
    pillText: '#E0E7FF',
  },
  active: {
    name: 'Active',
    gradientStart: '#FF6B6B',   // coral
    gradientEnd: '#FF8C42',     // tangerine
    gradientAngle: 135,
    textColor: '#FFFFFF',
    textShadow: '0 2px 8px rgba(127, 29, 29, 0.4)',
    accentColor: '#FFE66D',     // sunny
    badgeBg: 'rgba(255, 255, 255, 0.25)',
    badgeText: '#FFFFFF',
    pillBg: 'rgba(255, 255, 255, 0.2)',
    pillText: '#FFFFFF',
  },
  learning: {
    name: 'Learning',
    gradientStart: '#74B9FF',   // sky
    gradientEnd: '#4ECDC4',     // teal
    gradientAngle: 135,
    textColor: '#1E3A5F',       // dark navy
    textShadow: '0 1px 4px rgba(255, 255, 255, 0.5)',
    accentColor: '#FFE66D',     // sunny
    badgeBg: 'rgba(30, 58, 95, 0.12)',
    badgeText: '#1E3A5F',
    pillBg: 'rgba(30, 58, 95, 0.1)',
    pillText: '#1E3A5F',
  },
  discovery: {
    name: 'Discovery',
    gradientStart: '#A78BFA',   // grape
    gradientEnd: '#FD79A8',     // pink
    gradientAngle: 135,
    textColor: '#FFFFFF',
    textShadow: '0 2px 8px rgba(88, 28, 135, 0.4)',
    accentColor: '#FFE66D',     // sunny
    badgeBg: 'rgba(255, 255, 255, 0.25)',
    badgeText: '#FFFFFF',
    pillBg: 'rgba(255, 255, 255, 0.2)',
    pillText: '#FFFFFF',
  },
  storytelling: {
    name: 'Storytelling',
    gradientStart: '#FFD93D',   // gold
    gradientEnd: '#FFE66D',     // sunny
    gradientAngle: 135,
    textColor: '#78350F',       // dark amber
    textShadow: '0 1px 4px rgba(255, 255, 255, 0.4)',
    accentColor: '#FF8C42',     // tangerine
    badgeBg: 'rgba(120, 53, 15, 0.1)',
    badgeText: '#78350F',
    pillBg: 'rgba(120, 53, 15, 0.1)',
    pillText: '#78350F',
  },
  nature: {
    name: 'Nature',
    gradientStart: '#6BCB77',   // leaf
    gradientEnd: '#4ECDC4',     // teal
    gradientAngle: 135,
    textColor: '#FFFFFF',
    textShadow: '0 2px 6px rgba(20, 83, 45, 0.4)',
    accentColor: '#FFE66D',     // sunny
    badgeBg: 'rgba(255, 255, 255, 0.25)',
    badgeText: '#FFFFFF',
    pillBg: 'rgba(255, 255, 255, 0.2)',
    pillText: '#FFFFFF',
  },
  default: {
    name: 'Default',
    gradientStart: '#FFF8F0',   // cream
    gradientEnd: '#FFFFFF',     // white
    gradientAngle: 180,
    textColor: '#374151',       // gray-700
    textShadow: 'none',
    accentColor: '#FF6B6B',     // coral
    badgeBg: 'rgba(55, 65, 81, 0.08)',
    badgeText: '#374151',
    pillBg: 'rgba(55, 65, 81, 0.06)',
    pillText: '#6B7280',
  },
} as const;

// ── Palette Helpers ─────────────────────────────────────────────

/** Get the CSS gradient string for a palette */
export function getPaletteGradient(paletteName: CoverPaletteName): string {
  const p = coverPalettes[paletteName];
  return `linear-gradient(${p.gradientAngle}deg, ${p.gradientStart}, ${p.gradientEnd})`;
}

/** Recommended palette for each content type (default mapping) */
export const defaultTypePalette: Record<string, CoverPaletteName> = {
  story: 'storytelling',
  lesson: 'learning',
  game: 'active',
  video: 'discovery',
  song: 'discovery',
  activity: 'nature',
} as const;
