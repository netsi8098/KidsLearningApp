// ── Design Tokens ───────────────────────────────────────
// Centralized design system tokens for consistent theming.

export const colors = {
  cream: '#FFF8F0',
  coral: '#FF6B6B',
  teal: '#4ECDC4',
  sunny: '#FFE66D',
  grape: '#A78BFA',
  leaf: '#6BCB77',
  tangerine: '#FF8C42',
  gold: '#FFD93D',
  sky: '#74B9FF',
  pink: '#FD79A8',
} as const;

export const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
} as const;

export const radius = {
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  full: '9999px',
} as const;

export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
} as const;

export const animation = {
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
} as const;

// ── Theme Variations ────────────────────────────────────

export const themes = {
  child: {
    bg: colors.cream,
    cardBg: '#FFFFFF',
    textPrimary: '#374151',
    textSecondary: '#6B7280',
    accent: colors.coral,
  },
  calm: {
    bg: '#1a1a2e',
    cardBg: '#16213e',
    textPrimary: '#c7c7d4',
    textSecondary: '#8888a4',
    accent: '#6366F1',
  },
  parent: {
    bg: '#F9FAFB',
    cardBg: '#FFFFFF',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    accent: '#3B82F6',
  },
} as const;

/** Get CSS custom properties string for a theme */
export function getThemeCssVars(theme: keyof typeof themes): Record<string, string> {
  const t = themes[theme];
  return {
    '--theme-bg': t.bg,
    '--theme-card': t.cardBg,
    '--theme-text': t.textPrimary,
    '--theme-text-secondary': t.textSecondary,
    '--theme-accent': t.accent,
  };
}
