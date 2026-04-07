// ── Kids Learning Fun — Design System v2.0 ────────────────
// Premium children's product: magical but clean, playful but readable,
// colorful but not chaotic, soft and warm.
//
// This file is the single source of truth for all design tokens,
// component patterns, and visual guidelines. Import from here
// instead of hardcoding values.

// ── Color Palette ─────────────────────────────────────────

export const colors = {
  // Brand colors
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

  // Semantic surfaces
  surface: '#FFF8F0',
  surfaceCard: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceMuted: '#F5F0E8',

  // Text hierarchy
  textPrimary: '#2D2D3A',
  textSecondary: '#6B6B7B',
  textTertiary: '#9B9BAB',
  textAccent: '#FF6B6B',

  // Borders
  borderDefault: '#E8E0D4',
  borderSubtle: '#F0EAE0',

  // Status
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#EF4444',
  info: '#3B82F6',

  // Soft tints (for backgrounds)
  coralSoft: '#FFF0F0',
  tealSoft: '#EDFAF8',
  sunnySoft: '#FFFCE8',
  grapeSoft: '#F3EFFE',
  leafSoft: '#EDFAEF',
  tangerineSoft: '#FFF3EB',
  goldSoft: '#FFFCE8',
  skySoft: '#EDF5FF',
  pinkSoft: '#FFF0F6',

  // Bedtime mode
  bedtime: {
    surface: '#1A1A2E',
    surfaceCard: '#1E2140',
    surfaceElevated: '#252850',
    surfaceMuted: '#161630',
    textPrimary: '#D4D4E8',
    textSecondary: '#9898B0',
    textTertiary: '#686880',
    borderDefault: '#2A2A50',
    borderSubtle: '#222245',
  },

  // Parent mode
  parent: {
    surface: '#F8FAFC',
    surfaceCard: '#FFFFFF',
    surfaceMuted: '#F1F5F9',
    textPrimary: '#1E293B',
    textSecondary: '#475569',
    textTertiary: '#94A3B8',
    borderDefault: '#E2E8F0',
    borderSubtle: '#F1F5F9',
  },
} as const;

// ── Typography ────────────────────────────────────────────

export const typography = {
  fontFamily: {
    display: "'Nunito', system-ui, -apple-system, sans-serif",
    body: "'Nunito', system-ui, -apple-system, sans-serif",
  },
  scale: {
    display: { size: '2rem', lineHeight: 1.2, weight: 800, tracking: '-0.02em' },
    heading: { size: '1.5rem', lineHeight: 1.3, weight: 800, tracking: '-0.01em' },
    title: { size: '1.125rem', lineHeight: 1.4, weight: 700, tracking: '0' },
    body: { size: '0.9375rem', lineHeight: 1.5, weight: 500, tracking: '0' },
    caption: { size: '0.8125rem', lineHeight: 1.4, weight: 600, tracking: '0' },
    micro: { size: '0.6875rem', lineHeight: 1.3, weight: 700, tracking: '0.05em' },
  },
  // Tailwind class mappings
  classes: {
    display: 'text-[2rem] leading-[1.2] font-extrabold tracking-tight',
    heading: 'text-2xl leading-tight font-extrabold',
    title: 'text-lg leading-snug font-bold',
    body: 'text-[15px] leading-relaxed font-medium',
    caption: 'text-[13px] leading-snug font-semibold',
    micro: 'text-[11px] leading-tight font-bold uppercase tracking-wider',
  },
} as const;

// ── Spacing ───────────────────────────────────────────────

export const spacing = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
} as const;

// ── Radius ────────────────────────────────────────────────

export const radius = {
  xs: '6px',
  sm: '10px',
  md: '14px',
  lg: '20px',
  xl: '28px',
  '2xl': '36px',
  full: '9999px',
  // Semantic
  card: '20px',
  button: '14px',
  pill: '9999px',
  input: '12px',
} as const;

// ── Elevation (Shadows) ──────────────────────────────────

export const shadows = {
  xs: '0 1px 2px rgba(45, 45, 58, 0.04)',
  sm: '0 2px 8px rgba(45, 45, 58, 0.06)',
  md: '0 4px 16px rgba(45, 45, 58, 0.08)',
  lg: '0 8px 32px rgba(45, 45, 58, 0.10)',
  xl: '0 16px 48px rgba(45, 45, 58, 0.12)',
  // Semantic
  card: '0 2px 12px rgba(45, 45, 58, 0.06), 0 0 0 1px rgba(45, 45, 58, 0.02)',
  cardHover: '0 8px 24px rgba(45, 45, 58, 0.10), 0 0 0 1px rgba(45, 45, 58, 0.04)',
  button: '0 2px 8px rgba(45, 45, 58, 0.08)',
  float: '0 12px 40px rgba(45, 45, 58, 0.14)',
  // Color glows
  glowCoral: '0 4px 20px rgba(255, 107, 107, 0.25)',
  glowTeal: '0 4px 20px rgba(78, 205, 196, 0.25)',
  glowGrape: '0 4px 20px rgba(167, 139, 250, 0.25)',
  glowGold: '0 4px 20px rgba(255, 217, 61, 0.35)',
  // Bedtime
  bedtimeCard: '0 2px 12px rgba(0, 0, 0, 0.3)',
} as const;

// ── Gradients ─────────────────────────────────────────────

export const gradients = {
  coral: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)',
  teal: 'linear-gradient(135deg, #4ECDC4 0%, #6FE0D9 100%)',
  grape: 'linear-gradient(135deg, #A78BFA 0%, #C4AAFF 100%)',
  sunny: 'linear-gradient(135deg, #FFE66D 0%, #FFED8A 100%)',
  sky: 'linear-gradient(135deg, #74B9FF 0%, #93CCFF 100%)',
  gold: 'linear-gradient(135deg, #FFD93D 0%, #FFE470 100%)',
  hero: 'linear-gradient(135deg, #FF6B6B 0%, #A78BFA 100%)',
  bedtime: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)',
  parent: 'linear-gradient(135deg, #F8FAFC 0%, #EEF2FF 100%)',
} as const;

// ── Motion ────────────────────────────────────────────────

export const motion = {
  // Spring presets (for Framer Motion)
  springs: {
    snappy: { type: 'spring' as const, damping: 20, stiffness: 300 },
    bouncy: { type: 'spring' as const, damping: 12, stiffness: 200 },
    gentle: { type: 'spring' as const, damping: 25, stiffness: 150 },
    lazy: { type: 'spring' as const, damping: 30, stiffness: 100 },
    bedtime: { type: 'spring' as const, damping: 35, stiffness: 80 },
  },
  // Duration presets (seconds)
  durations: {
    instant: 0.1,
    fast: 0.2,
    normal: 0.3,
    slow: 0.5,
    gentle: 0.8,
  },
  // Easing presets (cubic-bezier values)
  easings: {
    ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    easeIn: [0.4, 0, 1, 1] as [number, number, number, number],
    easeOut: [0, 0, 0.2, 1] as [number, number, number, number],
    bounce: [0.68, -0.55, 0.265, 1.55] as [number, number, number, number],
  },
  // Standard animation variants (for Framer Motion)
  variants: {
    fadeIn: { initial: { opacity: 0 }, animate: { opacity: 1 } },
    slideUp: { initial: { y: 12, opacity: 0 }, animate: { y: 0, opacity: 1 } },
    slideDown: { initial: { y: -12, opacity: 0 }, animate: { y: 0, opacity: 1 } },
    scaleIn: { initial: { scale: 0.9, opacity: 0 }, animate: { scale: 1, opacity: 1 } },
    popIn: { initial: { scale: 0 }, animate: { scale: 1 } },
  },
  // Stagger children (delay between each child, in seconds)
  stagger: {
    fast: 0.03,
    normal: 0.05,
    slow: 0.08,
  },
} as const;

// ── Component Patterns (Tailwind class strings) ──────────

export const patterns = {
  // Page layouts
  page: 'min-h-dvh bg-[#FFF8F0] px-4 pt-4 pb-8',
  pageWithBottomNav: 'min-h-dvh bg-[#FFF8F0] px-4 pt-4 pb-24',
  maxWidth: 'max-w-md mx-auto',

  // Cards
  card: 'bg-white rounded-[20px] shadow-[0_2px_12px_rgba(45,45,58,0.06)] border border-[#F0EAE0]',
  cardPadded: 'bg-white rounded-[20px] shadow-[0_2px_12px_rgba(45,45,58,0.06)] border border-[#F0EAE0] p-5',
  cardInteractive: 'bg-white rounded-[20px] shadow-[0_2px_12px_rgba(45,45,58,0.06)] border border-[#F0EAE0] hover:shadow-[0_8px_24px_rgba(45,45,58,0.10)] transition-shadow cursor-pointer',

  // Buttons
  buttonPrimary: 'bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] text-white font-bold rounded-[14px] px-6 py-3 shadow-[0_4px_20px_rgba(255,107,107,0.25)]',
  buttonSecondary: 'bg-white text-[#2D2D3A] font-bold rounded-[14px] px-6 py-3 shadow-[0_2px_8px_rgba(45,45,58,0.06)] border border-[#F0EAE0]',
  buttonGhost: 'text-[#6B6B7B] font-bold rounded-[14px] px-4 py-2',
  buttonBack: 'w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-[0_2px_8px_rgba(45,45,58,0.06)] flex items-center justify-center',
  buttonFab: 'w-14 h-14 rounded-full shadow-[0_8px_32px_rgba(45,45,58,0.14)] flex items-center justify-center',

  // Pills / chips
  pill: 'inline-flex items-center gap-1 px-3 py-1 rounded-full text-[13px] font-bold',
  pillActive: 'bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] text-white shadow-[0_4px_20px_rgba(255,107,107,0.25)]',
  pillInactive: 'bg-white text-[#6B6B7B] border border-[#F0EAE0]',

  // Section headers
  sectionHeader: 'text-[13px] font-extrabold text-[#6B6B7B] uppercase tracking-wider',
  sectionTitle: 'text-lg font-extrabold text-[#2D2D3A]',

  // Navigation
  backButton: 'w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-sm flex items-center justify-center cursor-pointer',
  navBar: 'fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-[#F0EAE0] px-6 py-3 flex justify-around items-center z-50',

  // Glass morphism
  glass: 'bg-white/75 backdrop-blur-xl border border-white/20',
  glassDark: 'bg-[#1A1A2E]/75 backdrop-blur-xl border border-white/8',

  // Progress bars
  progressTrack: 'w-full bg-[#F0EAE0] rounded-full',
  progressFill: 'h-full rounded-full bg-gradient-to-r from-[#4ECDC4] to-[#6FE0D9]',

  // Horizontal scroll rails
  rail: 'flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide -mx-4 px-4',
  railItem: 'flex-shrink-0 snap-start',

  // Bedtime variants
  bedtimePage: 'min-h-dvh bg-[#1A1A2E] px-4 pt-4 pb-8',
  bedtimeCard: 'bg-[#1E2140] rounded-[20px] shadow-[0_2px_12px_rgba(0,0,0,0.3)] border border-[#2A2A50] p-5',
  bedtimeText: 'text-[#D4D4E8]',

  // Parent mode variants
  parentPage: 'min-h-dvh bg-[#F8FAFC] px-4 pt-4 pb-8',
  parentCard: 'bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-[#E2E8F0] p-5',
  parentText: 'text-[#1E293B]',
} as const;

// ── Content Type Colors ──────────────────────────────────

export const contentTypeColors: Record<string, { bg: string; text: string; soft: string; gradient: string }> = {
  lesson: { bg: '#FF6B6B', text: '#FFFFFF', soft: '#FFF0F0', gradient: 'from-[#FF6B6B] to-[#FF8E8E]' },
  story: { bg: '#A78BFA', text: '#FFFFFF', soft: '#F3EFFE', gradient: 'from-[#A78BFA] to-[#C4AAFF]' },
  game: { bg: '#FFE66D', text: '#7C6500', soft: '#FFFCE8', gradient: 'from-[#FFE66D] to-[#FFED8A]' },
  video: { bg: '#74B9FF', text: '#FFFFFF', soft: '#EDF5FF', gradient: 'from-[#74B9FF] to-[#93CCFF]' },
  song: { bg: '#4ECDC4', text: '#FFFFFF', soft: '#EDFAF8', gradient: 'from-[#4ECDC4] to-[#6FE0D9]' },
  activity: { bg: '#FF8C42', text: '#FFFFFF', soft: '#FFF3EB', gradient: 'from-[#FF8C42] to-[#FFA366]' },
  quiz: { bg: '#FD79A8', text: '#FFFFFF', soft: '#FFF0F6', gradient: 'from-[#FD79A8] to-[#FF9BC0]' },
  collection: { bg: '#6BCB77', text: '#FFFFFF', soft: '#EDFAEF', gradient: 'from-[#6BCB77] to-[#8DD98D]' },
};

// ── Badge Styles ─────────────────────────────────────────

export const badgeStyles = {
  new: { bg: 'bg-[#FFF0F0]', text: 'text-[#FF6B6B]', label: 'New' },
  popular: { bg: 'bg-[#FFFCE8]', text: 'text-[#B8860B]', label: 'Popular' },
  'editors-pick': { bg: 'bg-[#F3EFFE]', text: 'text-[#A78BFA]', label: "Editor's Pick" },
  premium: { bg: 'bg-[#FFFCE8]', text: 'text-[#B8860B]', label: 'Premium' },
  seasonal: { bg: 'bg-[#EDFAF8]', text: 'text-[#4ECDC4]', label: 'Seasonal' },
} as const;

// ── Accessibility ────────────────────────────────────────

export const a11y = {
  minTapTarget: '48px',
  focusRing: '3px solid #FF6B6B',
  focusOffset: '2px',
  // Minimum contrast ratios (WCAG AA)
  contrastNormal: 4.5,
  contrastLarge: 3,
} as const;

// ── Convenience type exports ─────────────────────────────

export type ColorKey = keyof typeof colors;
export type TypographyScale = keyof typeof typography.scale;
export type SpringPreset = keyof typeof motion.springs;
export type ShadowLevel = keyof typeof shadows;
export type RadiusSize = keyof typeof radius;
export type ContentType = keyof typeof contentTypeColors;
export type BadgeType = keyof typeof badgeStyles;
export type PatternKey = keyof typeof patterns;
