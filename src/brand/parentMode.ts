// ── Parent Mode Visual Configuration ──────────────────────────────
// Defines the complete visual configuration for parent-facing screens
// (ParentDashboard, Settings, WeeklyRecap, PreviewPage) vs child-facing
// pages. Parent mode is calmer, more information-dense, and uses
// professional typography -- while staying within the brand world.

import { colors } from '../tokens/designTokens';

// ── Type Definitions ────────────────────────────────────────────

export interface ParentModeColors {
  /** Page background -- lighter, less saturated than child cream */
  readonly background: string;
  /** Card/surface background */
  readonly surface: string;
  /** Elevated surface (modals, popovers) */
  readonly surfaceElevated: string;
  /** Text color variants */
  readonly text: {
    readonly primary: string;
    readonly secondary: string;
    readonly muted: string;
  };
  /** Primary accent -- muted grape for brand continuity */
  readonly accent: string;
  /** Secondary accent -- teal for positive indicators */
  readonly accentSecondary: string;
  /** Border and divider color */
  readonly border: string;
  /** Semantic colors */
  readonly success: string;
  readonly warning: string;
  readonly error: string;
  readonly info: string;
}

export interface ParentModeTypography {
  /** Heading weight -- semibold, not extra-bold like child mode */
  readonly headingWeight: number;
  /** Body font size -- 14px for data density */
  readonly bodySize: string;
  /** Small/caption font size */
  readonly smallSize: string;
  /** Heading font size */
  readonly headingSize: string;
  /** Subheading font size */
  readonly subheadingSize: string;
  /** Line height -- 1.6 for readability in data-heavy screens */
  readonly lineHeight: number;
  /** Heading line height */
  readonly headingLineHeight: number;
  /** Font feature settings -- tabular-nums for aligned data columns */
  readonly fontFeatures: string;
  /** Letter spacing for labels and section headers */
  readonly labelLetterSpacing: string;
  /** Maximum line length in characters */
  readonly maxLineLength: number;
}

export interface ParentModeSpacing {
  /** Card internal padding */
  readonly cardPadding: string;
  /** Gap between major sections */
  readonly sectionGap: string;
  /** Gap between items within a section */
  readonly itemGap: string;
  /** Page horizontal padding */
  readonly pagePadding: string;
  /** Whether compact mode is active (denser layout) */
  readonly compactMode: boolean;
  /** Maximum content width */
  readonly maxWidth: string;
}

export interface ParentModeMotion {
  /** Whether animations are enabled (subtle, not playful) */
  readonly enabled: boolean;
  /** Default transition duration in ms -- faster than child */
  readonly transitionDuration: number;
  /** Spring config for Framer Motion -- critically damped, no bouncing */
  readonly springConfig: {
    readonly type: 'spring';
    readonly stiffness: number;
    readonly damping: number;
    readonly mass: number;
  };
  /** Tween config for simple transitions */
  readonly tweenConfig: {
    readonly type: 'tween';
    readonly duration: number;
    readonly ease: readonly number[];
  };
  /** Stagger delay between sequential items (seconds) */
  readonly staggerDelay: number;
  /** Entrance animation Y offset in px (subtle) */
  readonly entranceOffset: number;
}

export interface ParentModeIcons {
  /** Icon style -- outline for professional feel */
  readonly style: 'outline';
  /** Default icon size in px -- smaller than child mode */
  readonly size: number;
  /** Stroke width for outline icons */
  readonly strokeWidth: number;
  /** Icon color -- follows text.secondary by default */
  readonly defaultColor: string;
  /** Active/selected icon color */
  readonly activeColor: string;
}

export interface ParentModeConfig {
  readonly colors: ParentModeColors;
  readonly typography: ParentModeTypography;
  readonly spacing: ParentModeSpacing;
  readonly motion: ParentModeMotion;
  readonly icons: ParentModeIcons;
}

// ── Child Mode Config ─────────────────────────────────────────────
// For reference and contrast -- the child-facing visual system.

export interface ChildModeConfig {
  readonly colors: {
    readonly background: string;
    readonly surface: string;
    readonly text: {
      readonly primary: string;
      readonly secondary: string;
    };
    readonly accent: string;
  };
  readonly typography: {
    readonly headingWeight: number;
    readonly bodySize: string;
    readonly lineHeight: number;
    readonly fontFeatures: string;
  };
  readonly spacing: {
    readonly cardPadding: string;
    readonly sectionGap: string;
    readonly compactMode: boolean;
  };
  readonly motion: {
    readonly enabled: boolean;
    readonly transitionDuration: number;
    readonly springConfig: {
      readonly type: 'spring';
      readonly stiffness: number;
      readonly damping: number;
    };
    readonly staggerDelay: number;
    readonly entranceOffset: number;
  };
  readonly icons: {
    readonly style: 'filled' | 'emoji';
    readonly size: number;
  };
}

// ── Bedtime Mode Config (subset) ───────────────────────────────

export interface BedtimeModeConfig {
  readonly colors: {
    readonly background: string;
    readonly surface: string;
    readonly text: {
      readonly primary: string;
      readonly secondary: string;
    };
    readonly accent: string;
  };
  readonly motion: {
    readonly enabled: boolean;
    readonly transitionDuration: number;
    readonly springConfig: {
      readonly type: 'tween';
      readonly duration: number;
      readonly ease: readonly number[];
    };
  };
}

export type ThemeContext = 'child' | 'parent' | 'bedtime';

export type ThemeConfig = ParentModeConfig | ChildModeConfig | BedtimeModeConfig;

// ── Concrete Configurations ───────────────────────────────────────

export const parentModeConfig: ParentModeConfig = {
  colors: {
    background: '#F8F9FC',        // Cool gray-50 with slight blue tint
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    text: {
      primary: '#111827',         // Gray-900 -- strong but not harsh
      secondary: '#4B5563',       // Gray-600
      muted: '#9CA3AF',           // Gray-400
    },
    accent: '#7C6FAE',            // Muted grape -- brand continuity
    accentSecondary: '#3BA8A0',   // Muted teal
    border: '#E5E7EB',            // Gray-200
    success: '#059669',           // Emerald-600
    warning: '#D97706',           // Amber-600
    error: '#DC2626',             // Red-600
    info: '#2563EB',              // Blue-600
  },
  typography: {
    headingWeight: 600,           // Semibold -- professional, not playful
    bodySize: '14px',             // Denser than child mode's 16px
    smallSize: '12px',
    headingSize: '18px',
    subheadingSize: '14px',
    lineHeight: 1.6,              // More generous for data readability
    headingLineHeight: 1.3,
    fontFeatures: "'tnum' on, 'lnum' on",  // Tabular nums for data alignment
    labelLetterSpacing: '0.04em', // Wider tracking on section labels
    maxLineLength: 65,            // Characters -- adult reading width
  },
  spacing: {
    cardPadding: '20px',          // More breathing room than child 16px
    sectionGap: '24px',           // Clear section separation
    itemGap: '12px',              // Tighter items for data density
    pagePadding: '20px',
    compactMode: false,
    maxWidth: '640px',            // Narrower max-width for focused reading
  },
  motion: {
    enabled: true,
    transitionDuration: 200,      // Faster than child mode's 300-500ms
    springConfig: {
      type: 'spring',
      stiffness: 300,
      damping: 30,                // Critically damped -- no bouncing
      mass: 0.8,
    },
    tweenConfig: {
      type: 'tween',
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1] as readonly number[],    // Material standard ease
    },
    staggerDelay: 0.03,           // Faster stagger than child's 0.05
    entranceOffset: 10,           // Subtle 10px vs child's 15-20px
  },
  icons: {
    style: 'outline' as const,
    size: 20,                     // Smaller than child's 32-48px
    strokeWidth: 1.5,
    defaultColor: '#6B7280',      // Gray-500
    activeColor: '#7C6FAE',       // Muted grape
  },
} as const;

export const childModeConfig: ChildModeConfig = {
  colors: {
    background: colors.cream,     // #FFF8F0
    surface: '#FFFFFF',
    text: {
      primary: '#374151',
      secondary: '#6B7280',
    },
    accent: colors.coral,         // #FF6B6B
  },
  typography: {
    headingWeight: 800,           // Extra-bold for playful headings
    bodySize: '16px',
    lineHeight: 1.5,
    fontFeatures: 'normal',
  },
  spacing: {
    cardPadding: '16px',
    sectionGap: '16px',
    compactMode: false,
  },
  motion: {
    enabled: true,
    transitionDuration: 350,
    springConfig: {
      type: 'spring',
      stiffness: 300,
      damping: 20,                // Under-damped -- playful bouncing
    },
    staggerDelay: 0.05,
    entranceOffset: 15,
  },
  icons: {
    style: 'emoji',
    size: 40,
  },
} as const;

export const bedtimeModeConfig: BedtimeModeConfig = {
  colors: {
    background: '#1a1a2e',
    surface: '#16213e',
    text: {
      primary: '#E0E7FF',
      secondary: '#A5B4FC',
    },
    accent: '#C4B5FD',
  },
  motion: {
    enabled: true,
    transitionDuration: 800,
    springConfig: {
      type: 'tween',
      duration: 0.8,
      ease: [0.25, 0.1, 0.25, 1] as readonly number[],
    },
  },
} as const;

// ── Theme Selection ─────────────────────────────────────────────

/**
 * Returns the complete theme configuration for the given context.
 * Use this to retrieve the right visual system when rendering
 * parent-facing, child-facing, or bedtime-facing screens.
 */
export function getThemeForContext(context: ThemeContext): ThemeConfig {
  switch (context) {
    case 'parent':
      return parentModeConfig;
    case 'bedtime':
      return bedtimeModeConfig;
    case 'child':
    default:
      return childModeConfig;
  }
}

// ── CSS Custom Property Overrides ─────────────────────────────

/**
 * Returns a record of CSS custom properties for applying
 * parent mode theming via inline styles on a wrapper element.
 * Integrates with the existing getThemeCssVars pattern.
 */
export function getParentModeCssVars(): Record<string, string> {
  const c = parentModeConfig.colors;
  const t = parentModeConfig.typography;
  const s = parentModeConfig.spacing;

  return {
    // Color tokens
    '--theme-bg': c.background,
    '--theme-card': c.surface,
    '--theme-card-elevated': c.surfaceElevated,
    '--theme-text': c.text.primary,
    '--theme-text-secondary': c.text.secondary,
    '--theme-text-muted': c.text.muted,
    '--theme-accent': c.accent,
    '--theme-accent-secondary': c.accentSecondary,
    '--theme-border': c.border,
    '--theme-success': c.success,
    '--theme-warning': c.warning,
    '--theme-error': c.error,
    '--theme-info': c.info,

    // Typography tokens
    '--parent-heading-weight': String(t.headingWeight),
    '--parent-body-size': t.bodySize,
    '--parent-small-size': t.smallSize,
    '--parent-heading-size': t.headingSize,
    '--parent-line-height': String(t.lineHeight),
    '--parent-font-features': t.fontFeatures,
    '--parent-label-spacing': t.labelLetterSpacing,

    // Spacing tokens
    '--parent-card-padding': s.cardPadding,
    '--parent-section-gap': s.sectionGap,
    '--parent-item-gap': s.itemGap,
    '--parent-page-padding': s.pagePadding,
    '--parent-max-width': s.maxWidth,
  };
}

// ── Parent Surface Helpers ───────────────────────────────────────

/**
 * Tailwind-compatible class string for parent mode page wrapper.
 * Replaces the child mode's `min-h-dvh bg-cream p-4 pb-8` pattern.
 */
export const parentPageClasses =
  'min-h-dvh p-5 pb-8' as const;

/**
 * Style object for parent page wrapper -- apply alongside parentPageClasses
 * for colors that aren't in Tailwind by default.
 */
export const parentPageStyle = {
  backgroundColor: parentModeConfig.colors.background,
  color: parentModeConfig.colors.text.primary,
  fontSize: parentModeConfig.typography.bodySize,
  lineHeight: parentModeConfig.typography.lineHeight,
  fontFeatureSettings: parentModeConfig.typography.fontFeatures,
} as const;

/**
 * Tailwind-compatible class string for parent mode cards.
 * Replaces the child mode's `bg-white rounded-2xl shadow-md` pattern.
 */
export const parentCardClasses =
  'bg-white rounded-xl shadow-sm border border-gray-100' as const;

/**
 * Style object for parent mode card interiors.
 */
export const parentCardStyle = {
  padding: parentModeConfig.spacing.cardPadding,
} as const;

/**
 * Framer Motion transition for parent mode animations.
 * Can be spread directly into `<motion.div transition={parentTransition} />`.
 */
export const parentTransition = {
  type: 'tween' as const,
  duration: parentModeConfig.motion.transitionDuration / 1000,
  ease: [0.4, 0, 0.2, 1],
};

/**
 * Framer Motion entrance animation for parent mode.
 * Subtle Y-offset fade-in.
 */
export const parentEntrance = {
  initial: {
    opacity: 0,
    y: parentModeConfig.motion.entranceOffset,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
  transition: parentTransition,
};

/**
 * Section header style for parent mode.
 * Uppercase, wide tracking, small text, muted color.
 */
export const parentSectionHeaderStyle = {
  fontSize: parentModeConfig.typography.smallSize,
  fontWeight: parentModeConfig.typography.headingWeight,
  letterSpacing: parentModeConfig.typography.labelLetterSpacing,
  textTransform: 'uppercase' as const,
  color: parentModeConfig.colors.text.muted,
} as const;

/**
 * Data value style -- tabular nums for aligned columns.
 */
export const parentDataValueStyle = {
  fontFeatureSettings: parentModeConfig.typography.fontFeatures,
  fontWeight: 600,
  color: parentModeConfig.colors.text.primary,
} as const;

// ── Comparison Table ────────────────────────────────────────────
// Quick reference for developers understanding the visual differences.
//
// | Property          | Child Mode        | Parent Mode        | Bedtime Mode       |
// | ----------------- | ----------------- | ------------------ | ------------------ |
// | Background        | #FFF8F0 (cream)   | #F8F9FC (cool gray)| #1a1a2e (navy)     |
// | Heading weight    | 800 (extra-bold)  | 600 (semibold)     | 600 (semibold)     |
// | Body font size    | 16px              | 14px               | 16px               |
// | Card corners      | rounded-2xl (16px)| rounded-xl (12px)  | rounded-2xl (16px) |
// | Card shadow       | shadow-md         | shadow-sm          | soft glow          |
// | Icon style        | Emoji / filled    | Outline / 20px     | Emoji / dimmed     |
// | Spring bounce     | Yes (damping 20)  | No (damping 30)    | No (tween only)    |
// | Transition speed  | 350ms             | 200ms              | 800ms              |
// | Entrance offset   | 15px              | 10px               | 10px               |
// | Stagger delay     | 50ms              | 30ms               | 80ms               |
// | Color palette     | Vibrant           | Muted professional | Deep calming       |
