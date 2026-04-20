/**
 * Design Tokens — centralized design system constants.
 * Single source of truth for colors, fonts, spacing, shadows, radii.
 * Import these anywhere instead of hardcoding values.
 */

export const colors = {
  // Brand Primary
  coral: '#FF6B6B',
  teal: '#4ECDC4',
  sunny: '#FFE66D',
  grape: '#A78BFA',
  leaf: '#6BCB77',
  tangerine: '#FF8C42',
  gold: '#FFD93D',

  // Extended
  skyBlue: '#5CE1E6',
  warmOrange: '#FF8C42',
  sunshine: '#FFD166',
  grassGreen: '#4CAF7D',
  lavender: '#C3B1E1',
  mint: '#A8E6CF',
  warmPink: '#FF8FAB',
  ocean: '#45B7D1',

  // Neutrals
  cream: '#FFF8F0',
  white: '#FFFFFF',
  textPrimary: '#2D2D3A',
  textSecondary: '#6B6B7B',
  textTertiary: '#9B9BAB',
  border: '#E8E0D4',
  borderSubtle: '#F0EAE0',
  surfaceMuted: '#F5F0E8',

  // Status
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#EF4444',
  info: '#3B82F6',
} as const;

export const fonts = {
  display: "'Fredoka One', 'Nunito', system-ui, sans-serif",
  body: "'Nunito', system-ui, -apple-system, sans-serif",
} as const;

export const fontSizes = {
  micro: '0.6875rem',   // 11px
  caption: '0.8125rem', // 13px
  body: '0.9375rem',    // 15px
  title: '1.125rem',    // 18px
  heading: '1.5rem',    // 24px
  display: '2rem',      // 32px
  hero: '2.5rem',       // 40px
} as const;

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '32px',
  '3xl': '48px',
} as const;

export const radii = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '32px',
  full: '9999px',
} as const;

export const shadows = {
  sm: '0 2px 8px rgba(45,45,58,0.06)',
  md: '0 4px 16px rgba(45,45,58,0.08)',
  lg: '0 8px 32px rgba(45,45,58,0.10)',
  xl: '0 16px 48px rgba(45,45,58,0.12)',
  card: '0 2px 12px rgba(45,45,58,0.06), 0 0 0 1px rgba(45,45,58,0.02)',
  cardHover: '0 8px 24px rgba(45,45,58,0.10), 0 0 0 1px rgba(45,45,58,0.04)',
  glow: (color: string) => `0 4px 20px ${color}40`,
  button3d: '0 4px 0 rgba(0,0,0,0.15)',
} as const;

export const transitions = {
  fast: '150ms ease',
  normal: '250ms ease',
  slow: '400ms ease',
  spring: { type: 'spring' as const, stiffness: 300, damping: 20 },
} as const;

/** Min touch target for accessibility (44x44px) */
export const MIN_TOUCH_TARGET = 44;

/** Loading skeleton shimmer gradient */
export const SKELETON_GRADIENT = 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)';
