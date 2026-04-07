// ── Art Direction Bible ─────────────────────────────────────────
// Complete visual identity specification for Kids Learning Fun.
// All values are typed config objects exported as const for type safety.

import { colors } from '../tokens/designTokens';

// ── Illustration Style Rules ────────────────────────────────────

export const illustrationStyle = {
  /** All corners must be rounded -- no sharp geometry */
  minCornerRadius: 4,
  /** Preferred corner radius for primary shapes */
  preferredCornerRadius: 12,
  /** Stroke weight ranges in px */
  strokeWeight: {
    min: 1.5,
    default: 2.5,
    max: 3.5,
  },
  /** Line cap and join always rounded for friendly feel */
  lineCap: 'round' as const,
  lineJoin: 'round' as const,
  /** Maximum visual complexity per age group (1-10 scale) */
  maxComplexity: {
    toddler: 3,   // ages 2-3: simple shapes, single focal point
    preschool: 5,  // ages 4-5: moderate detail, 2-3 focal areas
    earlyReader: 7, // ages 6-8: richer scenes, supporting details OK
  },
  /** Fill style preference */
  fillStyle: 'solid-with-subtle-gradient' as const,
  /** Outline presence */
  outlineRequired: true,
  /** Outline color should be a darkened version of fill, not pure black */
  outlineColorRule: 'darkened-fill' as const,
  /** Shadow style */
  shadowStyle: 'soft-drop' as const,
  /** Maximum number of distinct colors in a single illustration */
  maxColorsPerIllustration: 6,
  /** Proportion rules for characters */
  characterProportions: {
    headToBodyRatio: 0.4, // Large heads for friendliness
    eyeScale: 'oversized' as const, // Big expressive eyes
    limbStyle: 'simplified' as const, // Rounded stubs, not detailed
  },
} as const;

// ── Color Art Rules by Content Mood ─────────────────────────────

export type ContentMood = 'learning' | 'bedtime' | 'movement' | 'storytelling' | 'parent';

export interface MoodColorScheme {
  readonly name: string;
  readonly description: string;
  readonly primary: string;
  readonly secondary: string;
  readonly accent: string;
  readonly text: string;
  readonly textSecondary: string;
  readonly background: string;
  readonly surfaceCard: string;
  /** Minimum contrast ratio for normal text (WCAG AA) */
  readonly contrastRatioText: number;
  /** Minimum contrast ratio for large text and icons (WCAG AA) */
  readonly contrastRatioLargeText: number;
}

export const moodColorSchemes: Record<ContentMood, MoodColorScheme> = {
  learning: {
    name: 'Learning',
    description: 'Focused yet friendly. Sky blue and teal dominate for calm attention.',
    primary: colors.sky,       // #74B9FF
    secondary: colors.teal,    // #4ECDC4
    accent: colors.sunny,      // #FFE66D
    text: '#1E3A5F',           // Dark navy for readability
    textSecondary: '#4A6D8C',
    background: '#F0F8FF',     // Very light sky
    surfaceCard: '#FFFFFF',
    contrastRatioText: 4.5,
    contrastRatioLargeText: 3.0,
  },
  bedtime: {
    name: 'Bedtime',
    description: 'Calm and soothing. Deep indigo and purple with low brightness.',
    primary: '#4338CA',        // Indigo-700
    secondary: '#7C3AED',     // Purple-600
    accent: '#C4B5FD',        // Soft lavender
    text: '#E0E7FF',          // Light indigo text
    textSecondary: '#A5B4FC',
    background: '#1a1a2e',    // Deep night background
    surfaceCard: '#16213e',   // Dark card surface
    contrastRatioText: 4.5,
    contrastRatioLargeText: 3.0,
  },
  movement: {
    name: 'Movement & Energy',
    description: 'Vibrant and energizing. Coral and tangerine drive action and excitement.',
    primary: colors.coral,     // #FF6B6B
    secondary: colors.tangerine, // #FF8C42
    accent: colors.sunny,      // #FFE66D
    text: '#7F1D1D',          // Dark warm red for readability
    textSecondary: '#9A3412',
    background: '#FFF5F5',    // Very light coral wash
    surfaceCard: '#FFFFFF',
    contrastRatioText: 4.5,
    contrastRatioLargeText: 3.0,
  },
  storytelling: {
    name: 'Storytelling',
    description: 'Warm and inviting. Gold and sunny hues create a storybook feeling.',
    primary: colors.gold,      // #FFD93D
    secondary: colors.sunny,   // #FFE66D
    accent: colors.tangerine,  // #FF8C42
    text: '#78350F',           // Dark amber
    textSecondary: '#92400E',
    background: '#FFFBEB',     // Warm parchment
    surfaceCard: '#FFFFFF',
    contrastRatioText: 4.5,
    contrastRatioLargeText: 3.0,
  },
  parent: {
    name: 'Parent Space',
    description: 'Clean and professional. Muted cream and gray-blue convey trust.',
    primary: '#6B7280',        // Gray-500
    secondary: '#9CA3AF',     // Gray-400
    accent: '#3B82F6',        // Blue-500
    text: '#111827',          // Gray-900
    textSecondary: '#6B7280',
    background: '#F9FAFB',    // Gray-50
    surfaceCard: '#FFFFFF',
    contrastRatioText: 4.5,
    contrastRatioLargeText: 3.0,
  },
} as const;

// ── Shape Language ──────────────────────────────────────────────

export const shapeLanguage = {
  /** Card corner radii in px */
  cardRadius: {
    sm: 12,
    md: 16,
    lg: 24,
    full: 9999,
  },
  /** Button corner radii in px */
  buttonRadius: {
    sm: 10,
    md: 14,
    lg: 20,
    pill: 9999,
  },
  /** Badge/pill corner radii in px */
  badgeRadius: {
    sm: 6,
    md: 10,
    pill: 9999,
  },
  /** Stroke weights in px */
  strokeWeights: {
    thin: 1.5,
    medium: 2.5,
    thick: 3.5,
  },
  /** Icon corner radius as a ratio of icon size (multiply by icon width) */
  iconCornerRadiusRatio: 0.25,
  /** Spacing rhythm base unit in px (all spacing is a multiple of this) */
  spacingUnit: 4,
  /** Standard spacing scale (in multiples of 4px) */
  spacingScale: {
    '2xs': 4,   // 1x
    xs: 8,      // 2x
    sm: 12,     // 3x
    md: 16,     // 4x
    lg: 24,     // 6x
    xl: 32,     // 8x
    '2xl': 48,  // 12x
    '3xl': 64,  // 16x
  },
  /** Border widths */
  borderWidths: {
    default: 0,
    thin: 1,
    medium: 2,
    thick: 3,
  },
  /** Shadow elevations for consistent depth */
  shadowElevation: {
    none: 'none',
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.03)',
  },
} as const;

// ── Visual Density by Age ───────────────────────────────────────

export type AgeGroup = 'toddler' | 'preschool' | 'earlyReader';

export interface AgeDensitySpec {
  readonly ageRange: string;
  readonly maxVisibleItems: number;
  readonly minTouchTarget: number;  // px
  readonly recommendedTouchTarget: number;  // px
  readonly fontSize: {
    readonly heading: number;   // px
    readonly body: number;      // px
    readonly caption: number;   // px
  };
  readonly iconSize: {
    readonly primary: number;   // px
    readonly secondary: number; // px
  };
  readonly gridColumns: {
    readonly portrait: number;
    readonly landscape: number;
  };
  readonly spacingMultiplier: number;  // multiply base spacing
  readonly animationComplexity: 'simple' | 'moderate' | 'rich';
}

export const visualDensity: Record<AgeGroup, AgeDensitySpec> = {
  toddler: {
    ageRange: '2-3',
    maxVisibleItems: 4,
    minTouchTarget: 64,
    recommendedTouchTarget: 72,
    fontSize: {
      heading: 28,
      body: 20,
      caption: 16,
    },
    iconSize: {
      primary: 64,
      secondary: 48,
    },
    gridColumns: {
      portrait: 2,
      landscape: 2,
    },
    spacingMultiplier: 1.5,
    animationComplexity: 'simple',
  },
  preschool: {
    ageRange: '4-5',
    maxVisibleItems: 8,
    minTouchTarget: 48,
    recommendedTouchTarget: 56,
    fontSize: {
      heading: 24,
      body: 16,
      caption: 13,
    },
    iconSize: {
      primary: 48,
      secondary: 36,
    },
    gridColumns: {
      portrait: 2,
      landscape: 3,
    },
    spacingMultiplier: 1.25,
    animationComplexity: 'moderate',
  },
  earlyReader: {
    ageRange: '6-8',
    maxVisibleItems: 12,
    minTouchTarget: 44,
    recommendedTouchTarget: 48,
    fontSize: {
      heading: 20,
      body: 14,
      caption: 12,
    },
    iconSize: {
      primary: 40,
      secondary: 32,
    },
    gridColumns: {
      portrait: 3,
      landscape: 4,
    },
    spacingMultiplier: 1.0,
    animationComplexity: 'rich',
  },
} as const;

// ── Mascot Visual Specs ─────────────────────────────────────────

export const mascotSpecs = {
  leo: {
    id: 'leo',
    name: 'Leo Lion',
    color: colors.coral,
    personality: 'brave-encouraging',
    usageContext: ['learning', 'motivation', 'challenges'],
  },
  daisy: {
    id: 'daisy',
    name: 'Daisy Duck',
    color: colors.sunny,
    personality: 'curious-playful',
    usageContext: ['discovery', 'nature', 'creativity'],
  },
  ollie: {
    id: 'ollie',
    name: 'Ollie Owl',
    color: colors.grape,
    personality: 'wise-calm',
    usageContext: ['bedtime', 'reading', 'quiet-activities'],
  },
  ruby: {
    id: 'ruby',
    name: 'Ruby Rabbit',
    color: colors.pink,
    personality: 'energetic-social',
    usageContext: ['movement', 'games', 'social-activities'],
  },
  finn: {
    id: 'finn',
    name: 'Finn Fox',
    color: colors.tangerine,
    personality: 'clever-adventurous',
    usageContext: ['puzzles', 'exploration', 'stories'],
  },
} as const;

// ── Typography Rules ────────────────────────────────────────────

export const typography = {
  fontFamily: "'Nunito', system-ui, -apple-system, sans-serif",
  /** Font weight usage */
  weights: {
    body: 400,
    bodyMedium: 500,
    heading: 700,
    headingBold: 800,
    accent: 900,
  },
  /** Letter spacing adjustments */
  letterSpacing: {
    tight: '-0.02em',
    normal: '0',
    relaxed: '0.02em',
    wide: '0.05em', // For small caps / labels
  },
  /** Line height by context */
  lineHeight: {
    tight: 1.2,     // Headings
    normal: 1.5,    // Body text
    relaxed: 1.7,   // Reading content
  },
  /** Maximum line length for readability */
  maxLineLength: {
    heading: 20,    // characters
    body: 45,       // characters (children read shorter lines)
    adult: 65,      // characters (parent dashboard)
  },
} as const;

// ── Animation Principles ────────────────────────────────────────

export const animationPrinciples = {
  /** Timing curves */
  easing: {
    /** Standard ease for most transitions */
    standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
    /** Overshoot for playful enter animations */
    playful: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    /** Gentle ease for calm/bedtime */
    gentle: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    /** Quick snap for tap feedback */
    snap: 'cubic-bezier(0, 0, 0.2, 1)',
  },
  /** Duration guidelines in ms */
  durations: {
    instant: 100,   // Tap feedback
    fast: 200,      // Button states, toggles
    normal: 300,    // Page transitions, card reveals
    slow: 500,      // Celebration animations
    glacial: 1000,  // Bedtime transitions
  },
  /** Stagger delay between sequential items in ms */
  staggerDelay: {
    fast: 30,
    normal: 50,
    slow: 80,
  },
  /** Scale factors for interactive feedback */
  scale: {
    tapShrink: 0.97,   // Button pressed
    hoverGrow: 1.03,   // Card hover
    celebrate: 1.15,   // Reward pop
  },
} as const;
