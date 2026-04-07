// =============================================================================
// useMotionPreset - Context-aware motion hook
// =============================================================================
// Reads accessibility and bedtime state from context and adapts all motion
// tokens accordingly. Every component should use this hook instead of
// importing raw primitives, so motion is always context-appropriate.

import { useMemo, useCallback } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useApp } from '../context/AppContext';
import {
  timing,
  springs,
  easings,
  getStaggerDelay,
  getTransitionForLevel,
  adaptForBedtime,
  reducedMotionTransition,
  reducedMotionEntrance,
  reducedMotionFeedback,
  reducedMotionAmbient,
  BEDTIME_TIMING_MULTIPLIER,
  type MotionLevel,
  type SpringKey,
  type StaggerPattern,
  type TimingKey,
  type EasingKey,
} from './motionPrimitives';
import {
  pageTransitions,
  feedback,
  mascotMotion,
  rewardMotion,
  reducedMotionPageTransitions,
  reducedMotionFeedback as reducedFeedbackVariants,
  bedtimePageTransitions,
  type PageTransitionKey,
} from './transitionVariants';
import type { Transition, Variants } from 'framer-motion';

// ── Types ───────────────────────────────────────────────────────────────────

export interface MotionPreset {
  /** Active timing tokens (adapted for mode) */
  timing: typeof timing;
  /** Active spring presets (adapted for mode) */
  springs: typeof springs;
  /** Active easing presets */
  easings: typeof easings;
  /** Current motion mode label */
  mode: 'full' | 'bedtime' | 'reduced';
}

export interface MotionPresetReturn {
  /** Current motion settings adapted for context */
  preset: MotionPreset;
  /** Whether reduced motion is active */
  isReducedMotion: boolean;
  /** Whether bedtime mode is active */
  isBedtime: boolean;
  /** Get an appropriate transition for a hierarchy level */
  getTransition: (level: MotionLevel, overrides?: { duration?: number; spring?: SpringKey; delay?: number }) => Transition;
  /** Get stagger delay for an item index */
  getStagger: (index: number, pattern?: StaggerPattern, totalItems?: number) => number;
  /** Get a named page transition config */
  getPageTransition: (name?: PageTransitionKey) => {
    initial: Record<string, unknown>;
    animate: Record<string, unknown>;
    exit: Record<string, unknown>;
    transition: Transition;
  };
  /** Get feedback variants for interactive elements */
  getFeedback: (type: 'tap' | 'hover' | 'press' | 'success' | 'error' | 'reward') => Record<string, unknown>;
  /** Get mascot variant */
  getMascotVariant: (state: string) => Record<string, unknown>;
  /** Get reward variant */
  getRewardVariant: (type: string) => Record<string, unknown>;
  /** Get an entrance animation config */
  getEntrance: (variant: string) => {
    initial: Record<string, unknown>;
    animate: Record<string, unknown>;
    transition: Transition;
  };
  /** Get a duration value in seconds, adapted for current mode */
  getDuration: (key: TimingKey) => number;
  /** Get an easing curve, adapted for current mode */
  getEasing: (key: EasingKey) => readonly number[];
}

// ── Bedtime-adapted timing ──────────────────────────────────────────────────

function makeBedtimeTiming(): typeof timing {
  return {
    instant: timing.instant * BEDTIME_TIMING_MULTIPLIER,
    fast: timing.fast * BEDTIME_TIMING_MULTIPLIER,
    normal: timing.normal * BEDTIME_TIMING_MULTIPLIER,
    slow: timing.slow * BEDTIME_TIMING_MULTIPLIER,
    gentle: timing.gentle * BEDTIME_TIMING_MULTIPLIER,
    glacial: timing.glacial * BEDTIME_TIMING_MULTIPLIER,
  };
}

// ── Entrance Configs ────────────────────────────────────────────────────────

const entranceConfigs: Record<string, {
  initial: Record<string, unknown>;
  animate: Record<string, unknown>;
  transition: Transition;
}> = {
  fadeUp: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { type: 'tween', duration: timing.normal, ease: [...easings.decelerate] },
  },
  fadeDown: {
    initial: { y: -20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { type: 'tween', duration: timing.normal, ease: [...easings.decelerate] },
  },
  scaleUp: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { ...springs.gentle },
  },
  pop: {
    initial: { scale: 0 },
    animate: { scale: 1 },
    transition: { ...springs.bouncy },
  },
  slideUp: {
    initial: { y: 40 },
    animate: { y: 0 },
    transition: { ...springs.gentle },
  },
  dropIn: {
    initial: { y: -60, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { ...springs.bouncy },
  },
};

// ── Hook Implementation ─────────────────────────────────────────────────────

export function useMotionPreset(): MotionPresetReturn {
  const { reducedMotion } = useAccessibility();
  const { bedtimeMode } = useApp();

  const isReducedMotion = reducedMotion;
  const isBedtime = bedtimeMode;

  // Build the current preset based on mode
  const preset = useMemo<MotionPreset>(() => {
    if (isReducedMotion) {
      return {
        timing,
        springs,
        easings,
        mode: 'reduced',
      };
    }
    if (isBedtime) {
      return {
        timing: makeBedtimeTiming(),
        springs,
        easings,
        mode: 'bedtime',
      };
    }
    return {
      timing,
      springs,
      easings,
      mode: 'full',
    };
  }, [isReducedMotion, isBedtime]);

  // Get a transition adapted for the current context
  const getTransition = useCallback(
    (level: MotionLevel, overrides?: { duration?: number; spring?: SpringKey; delay?: number }): Transition => {
      if (isReducedMotion) {
        return { ...reducedMotionTransition, delay: overrides?.delay ?? 0 };
      }

      const base = getTransitionForLevel(level, overrides);

      if (isBedtime) {
        return adaptForBedtime(base);
      }

      return base;
    },
    [isReducedMotion, isBedtime],
  );

  // Get stagger delay
  const getStagger = useCallback(
    (index: number, pattern: StaggerPattern = 'cascade', totalItems: number = 10): number => {
      if (isReducedMotion) return 0;

      const delay = getStaggerDelay(index, pattern, totalItems);
      return isBedtime ? delay * BEDTIME_TIMING_MULTIPLIER : delay;
    },
    [isReducedMotion, isBedtime],
  );

  // Get page transition
  const getPageTransition = useCallback(
    (name: PageTransitionKey = 'default') => {
      if (isReducedMotion) {
        return reducedMotionPageTransitions[name] ?? reducedMotionPageTransitions.default;
      }
      if (isBedtime) {
        return bedtimePageTransitions[name] ?? bedtimePageTransitions.default;
      }
      return pageTransitions[name] ?? pageTransitions.default;
    },
    [isReducedMotion, isBedtime],
  );

  // Get feedback variants
  const getFeedback = useCallback(
    (type: 'tap' | 'hover' | 'press' | 'success' | 'error' | 'reward'): Record<string, unknown> => {
      if (isReducedMotion) {
        return reducedFeedbackVariants[type] ?? reducedFeedbackVariants.tap;
      }
      if (isBedtime) {
        // Bedtime: softer feedback, less movement
        const base = feedback[type];
        return {
          ...base,
          transition: {
            ...(base.transition as Record<string, unknown>),
            duration: ((base.transition as Record<string, unknown>).duration as number ?? timing.fast) * BEDTIME_TIMING_MULTIPLIER,
          },
        };
      }
      return feedback[type] ?? feedback.tap;
    },
    [isReducedMotion, isBedtime],
  );

  // Get mascot variant
  const getMascotVariant = useCallback(
    (state: string): Record<string, unknown> => {
      if (isReducedMotion) {
        return { opacity: 1, scale: 1, y: 0, rotate: 0 };
      }
      const variant = (mascotMotion as Variants)[state];
      return (variant ?? mascotMotion.idle) as Record<string, unknown>;
    },
    [isReducedMotion],
  );

  // Get reward variant
  const getRewardVariant = useCallback(
    (type: string): Record<string, unknown> => {
      if (isReducedMotion) {
        return { opacity: [0, 1], transition: reducedMotionTransition };
      }
      const variant = (rewardMotion as Variants)[type];
      return (variant ?? rewardMotion.starEarn) as Record<string, unknown>;
    },
    [isReducedMotion],
  );

  // Get entrance animation config
  const getEntrance = useCallback(
    (variant: string) => {
      if (isReducedMotion) {
        return {
          initial: reducedMotionEntrance.initial,
          animate: reducedMotionEntrance.animate,
          transition: reducedMotionEntrance.transition,
        };
      }

      const config = entranceConfigs[variant] ?? entranceConfigs.fadeUp;

      if (isBedtime) {
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: {
            type: 'tween' as const,
            duration: timing.gentle * BEDTIME_TIMING_MULTIPLIER,
            ease: [...easings.decelerate],
          },
        };
      }

      return config;
    },
    [isReducedMotion, isBedtime],
  );

  // Get a duration value adapted for context
  const getDuration = useCallback(
    (key: TimingKey): number => {
      if (isReducedMotion) return timing.instant;
      const base = timing[key];
      return isBedtime ? base * BEDTIME_TIMING_MULTIPLIER : base;
    },
    [isReducedMotion, isBedtime],
  );

  // Get an easing adapted for context
  const getEasing = useCallback(
    (key: EasingKey): readonly number[] => {
      if (isReducedMotion || isBedtime) return easings.decelerate;
      return easings[key];
    },
    [isReducedMotion, isBedtime],
  );

  return {
    preset,
    isReducedMotion,
    isBedtime,
    getTransition,
    getStagger,
    getPageTransition,
    getFeedback,
    getMascotVariant,
    getRewardVariant,
    getEntrance,
    getDuration,
    getEasing,
  };
}
