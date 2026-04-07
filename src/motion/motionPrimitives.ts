// =============================================================================
// Motion Primitives - Complete motion token system for Kids Learning Fun
// =============================================================================
// This file defines the foundational motion language: timing, springs, easings,
// hierarchy levels, stagger patterns, and reduced-motion fallbacks. Every value
// is a concrete, directly-usable Framer Motion config object.

import type { Transition } from 'framer-motion';

// ── Timing Tokens ───────────────────────────────────────────────────────────
// Duration values in seconds, ordered from instant feedback to slow ambient.

export const timing = {
  instant: 0.1,
  fast: 0.2,
  normal: 0.35,
  slow: 0.5,
  gentle: 0.8,
  glacial: 1.2,
} as const;

export type TimingKey = keyof typeof timing;

// ── Spring Presets ──────────────────────────────────────────────────────────
// Named spring configs covering the full expressiveness range.

export const springs = {
  snappy: { type: 'spring' as const, stiffness: 400, damping: 30 },
  bouncy: { type: 'spring' as const, stiffness: 300, damping: 20 },
  gentle: { type: 'spring' as const, stiffness: 200, damping: 25 },
  lazy: { type: 'spring' as const, stiffness: 100, damping: 20 },
  bedtime: { type: 'spring' as const, stiffness: 80, damping: 30 },
} as const;

export type SpringKey = keyof typeof springs;

// ── Easing Presets ──────────────────────────────────────────────────────────
// Cubic bezier curves as tuples for Framer Motion's `ease` property.

export const easings = {
  smooth: [0.4, 0, 0.2, 1] as const,
  decelerate: [0, 0, 0.2, 1] as const,
  accelerate: [0.4, 0, 1, 1] as const,
  bounce: [0.68, -0.55, 0.27, 1.55] as const,
  playful: [0.34, 1.56, 0.64, 1] as const,
} as const;

export type EasingKey = keyof typeof easings;

// ── Motion Hierarchy Levels ─────────────────────────────────────────────────
// Three tiers of motion importance. Every animation in the app should be
// classified into one of these to maintain a clear visual hierarchy.

export type MotionLevel = 'primary' | 'secondary' | 'ambient';

export interface MotionLevelConfig {
  readonly description: string;
  readonly defaultDuration: number;
  readonly defaultSpring: SpringKey;
  readonly defaultEasing: EasingKey;
  /** Properties this level is allowed to animate */
  readonly allowedProperties: readonly string[];
  /** Scale range for this hierarchy level */
  readonly scaleRange: { min: number; max: number };
  /** Translation range in px for this hierarchy level */
  readonly translateRange: { min: number; max: number };
}

export const motionHierarchy: Record<MotionLevel, MotionLevelConfig> = {
  primary: {
    description: 'Attention-grabbing: scale changes, position shifts, entrances/exits',
    defaultDuration: timing.normal,
    defaultSpring: 'bouncy',
    defaultEasing: 'playful',
    allowedProperties: ['scale', 'x', 'y', 'rotate', 'opacity', 'width', 'height'],
    scaleRange: { min: 0, max: 1.3 },
    translateRange: { min: -60, max: 60 },
  },
  secondary: {
    description: 'Decorative: color shifts, opacity fades, subtle feedback',
    defaultDuration: timing.fast,
    defaultSpring: 'gentle',
    defaultEasing: 'smooth',
    allowedProperties: ['opacity', 'scale', 'color', 'backgroundColor', 'borderColor'],
    scaleRange: { min: 0.9, max: 1.1 },
    translateRange: { min: -10, max: 10 },
  },
  ambient: {
    description: 'Background: subtle drift, breathing, idle loops',
    defaultDuration: timing.glacial,
    defaultSpring: 'lazy',
    defaultEasing: 'decelerate',
    allowedProperties: ['opacity', 'scale', 'y', 'rotate'],
    scaleRange: { min: 0.98, max: 1.03 },
    translateRange: { min: -5, max: 5 },
  },
} as const;

// ── Stagger Patterns ────────────────────────────────────────────────────────

export type StaggerPattern = 'cascade' | 'center-out' | 'random';

/** Default inter-item delay per pattern (in seconds) */
export const staggerDefaults = {
  cascade: 0.05,
  centerOut: 0.04,
  random: 0.06,
} as const;

/**
 * Calculate a stagger delay for an item based on its index and pattern.
 * @param index - Item index in the list
 * @param pattern - Stagger pattern to use
 * @param totalItems - Total number of items (required for center-out)
 * @param baseDelay - Override default delay (seconds)
 */
export function getStaggerDelay(
  index: number,
  pattern: StaggerPattern = 'cascade',
  totalItems: number = 10,
  baseDelay?: number,
): number {
  switch (pattern) {
    case 'cascade': {
      const delay = baseDelay ?? staggerDefaults.cascade;
      return index * delay;
    }
    case 'center-out': {
      const delay = baseDelay ?? staggerDefaults.centerOut;
      const center = (totalItems - 1) / 2;
      return Math.abs(index - center) * delay;
    }
    case 'random': {
      const delay = baseDelay ?? staggerDefaults.random;
      // Deterministic pseudo-random based on index (no Math.random for consistency)
      const hash = ((index * 2654435761) >>> 0) / 4294967296;
      return hash * delay * totalItems * 0.5;
    }
  }
}

// ── Transition Builders ─────────────────────────────────────────────────────
// Helper functions that produce Framer Motion Transition objects.

/**
 * Build a tween transition from timing and easing tokens.
 */
export function buildTween(
  duration: TimingKey | number = 'normal',
  easing: EasingKey = 'smooth',
  delay: number = 0,
): Transition {
  return {
    type: 'tween',
    duration: typeof duration === 'number' ? duration : timing[duration],
    ease: [...easings[easing]],
    delay,
  };
}

/**
 * Build a spring transition from a spring preset.
 */
export function buildSpring(
  preset: SpringKey = 'bouncy',
  delay: number = 0,
): Transition {
  return {
    ...springs[preset],
    delay,
  };
}

/**
 * Get the recommended transition for a given motion hierarchy level.
 */
export function getTransitionForLevel(
  level: MotionLevel,
  overrides?: Partial<{ duration: number; spring: SpringKey; delay: number }>,
): Transition {
  const config = motionHierarchy[level];

  if (level === 'primary') {
    // Primary animations use springs for liveliness
    return buildSpring(overrides?.spring ?? config.defaultSpring, overrides?.delay ?? 0);
  }

  // Secondary and ambient use tween/easing for smoothness
  return buildTween(
    overrides?.duration ?? config.defaultDuration,
    config.defaultEasing,
    overrides?.delay ?? 0,
  );
}

// ── Bedtime Adaptations ─────────────────────────────────────────────────────

/** Multiplier applied to all durations in bedtime mode */
export const BEDTIME_TIMING_MULTIPLIER = 1.5;

/** Bedtime replaces all springs with this gentle easing */
export const BEDTIME_EASING: Transition = {
  type: 'tween',
  ease: [...easings.decelerate],
};

/**
 * Adapt a transition for bedtime mode: slow it down, remove springs.
 */
export function adaptForBedtime(transition: Transition): Transition {
  const adapted: Transition = { ...transition };

  // Replace spring with gentle tween
  if (adapted.type === 'spring') {
    return {
      type: 'tween',
      duration: timing.gentle * BEDTIME_TIMING_MULTIPLIER,
      ease: [...easings.decelerate],
      delay: (adapted as { delay?: number }).delay ?? 0,
    };
  }

  // Slow down tween durations
  if (typeof adapted.duration === 'number') {
    adapted.duration = adapted.duration * BEDTIME_TIMING_MULTIPLIER;
  }

  return adapted;
}

// ── Reduced Motion Variants ─────────────────────────────────────────────────
// For every motion type, a reduced-motion version that only uses opacity.

export const reducedMotionTransition: Transition = {
  type: 'tween',
  duration: timing.instant,
  ease: [...easings.smooth],
};

/**
 * Reduced motion variant for entrance animations: instant opacity fade.
 */
export const reducedMotionEntrance = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: reducedMotionTransition,
} as const;

/**
 * Reduced motion variant for interactive feedback: no movement.
 */
export const reducedMotionFeedback = {
  tap: { opacity: 0.8 },
  hover: { opacity: 0.9 },
  press: { opacity: 0.7 },
} as const;

/**
 * Reduced motion variant for ambient loops: no animation at all.
 */
export const reducedMotionAmbient = {
  animate: {},
  transition: { duration: 0 },
} as const;

// ── Composite Preset Object ─────────────────────────────────────────────────
// Single default export gathering all tokens for convenient destructuring.

export const motionPrimitives = {
  timing,
  springs,
  easings,
  motionHierarchy,
  staggerDefaults,
  getStaggerDelay,
  buildTween,
  buildSpring,
  getTransitionForLevel,
  adaptForBedtime,
  reducedMotionTransition,
  reducedMotionEntrance,
  reducedMotionFeedback,
  reducedMotionAmbient,
  BEDTIME_TIMING_MULTIPLIER,
  BEDTIME_EASING,
} as const;
