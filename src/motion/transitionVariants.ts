// =============================================================================
// Transition Variants - Screen-level and component-level motion configs
// =============================================================================
// Every export is a complete Framer Motion variant/transition object that can
// be spread directly onto <motion.div> elements. No placeholders.

import type { Variants, Transition, TargetAndTransition } from 'framer-motion';
import { timing, springs, easings } from './motionPrimitives';

// ── Page Transitions ────────────────────────────────────────────────────────
// Used with AnimatePresence around <Routes> or page-level wrappers.

export interface PageTransitionConfig {
  readonly initial: Record<string, unknown>;
  readonly animate: Record<string, unknown>;
  readonly exit: Record<string, unknown>;
  readonly transition: Transition;
}

export const pageTransitions = {
  /** Standard page slide-in from right with crossfade */
  default: {
    initial: { x: 60, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -40, opacity: 0 },
    transition: {
      type: 'tween',
      duration: timing.normal,
      ease: easings.smooth as unknown as number[],
    },
  },

  /** Modal: scale up from center */
  modal: {
    initial: { scale: 0.85, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.9, opacity: 0 },
    transition: {
      ...springs.bouncy,
    },
  },

  /** Bedtime: very slow crossfade, zero movement */
  bedtime: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: {
      type: 'tween',
      duration: timing.glacial,
      ease: easings.decelerate as unknown as number[],
    },
  },

  /** Celebration: confetti-style burst entrance */
  celebration: {
    initial: { scale: 0.3, opacity: 0, rotate: -8 },
    animate: { scale: 1, opacity: 1, rotate: 0 },
    exit: { scale: 1.05, opacity: 0 },
    transition: {
      ...springs.bouncy,
    },
  },

  /** Story: page-turn effect via horizontal flip */
  story: {
    initial: { rotateY: -90, opacity: 0, transformPerspective: 1200 },
    animate: { rotateY: 0, opacity: 1, transformPerspective: 1200 },
    exit: { rotateY: 90, opacity: 0, transformPerspective: 1200 },
    transition: {
      type: 'tween',
      duration: timing.slow,
      ease: easings.smooth as unknown as number[],
    },
  },
} as const satisfies Record<string, PageTransitionConfig>;

export type PageTransitionKey = keyof typeof pageTransitions;

// ── Card Entrances ──────────────────────────────────────────────────────────
// Functions and objects producing staggered card entrance variants.

export const cardEntrances = {
  /** Grid layout: stagger from top-left, fade + slide up */
  grid: (index: number): TargetAndTransition & { initial: Record<string, unknown> } => ({
    initial: { y: 24, opacity: 0, scale: 0.95 },
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: 'tween',
      duration: timing.normal,
      ease: easings.decelerate as unknown as number[],
      delay: index * 0.05,
    },
  }),

  /** List layout: stagger from top, slide in from left */
  list: (index: number): TargetAndTransition & { initial: Record<string, unknown> } => ({
    initial: { x: -30, opacity: 0 },
    x: 0,
    opacity: 1,
    transition: {
      type: 'tween',
      duration: timing.normal,
      ease: easings.decelerate as unknown as number[],
      delay: index * 0.06,
    },
  }),

  /** Hero card: scale up with subtle parallax feel */
  hero: {
    initial: { scale: 0.92, opacity: 0, y: 20 },
    animate: { scale: 1, opacity: 1, y: 0 },
    transition: {
      ...springs.gentle,
    },
  },

  /** Featured card: slide in from right */
  featured: {
    initial: { x: 80, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: {
      ...springs.bouncy,
    },
  },
} as const;

// ── Card Entrance Variants (Framer Motion Variants format) ──────────────────

export const gridCardVariants: Variants = {
  hidden: { y: 24, opacity: 0, scale: 0.95 },
  visible: (index: number) => ({
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: 'tween',
      duration: timing.normal,
      ease: easings.decelerate as unknown as number[],
      delay: index * 0.05,
    },
  }),
};

export const listCardVariants: Variants = {
  hidden: { x: -30, opacity: 0 },
  visible: (index: number) => ({
    x: 0,
    opacity: 1,
    transition: {
      type: 'tween',
      duration: timing.normal,
      ease: easings.decelerate as unknown as number[],
      delay: index * 0.06,
    },
  }),
};

// ── Interactive Feedback ────────────────────────────────────────────────────
// whileTap / whileHover / custom trigger variants for interactive elements.

export const feedback = {
  /** Standard tap shrink */
  tap: {
    scale: 0.95,
    transition: { duration: timing.instant },
  },

  /** Hover grow with spring */
  hover: {
    scale: 1.03,
    transition: { ...springs.snappy },
  },

  /** Deep press for long-press actions */
  press: {
    scale: 0.92,
    transition: { duration: timing.instant },
  },

  /** Success pop: scale up and back */
  success: {
    scale: [1, 1.15, 1],
    transition: {
      duration: timing.slow,
      times: [0, 0.5, 1],
      ease: easings.playful as unknown as number[],
    },
  },

  /** Error shake */
  error: {
    x: [0, -8, 8, -4, 4, 0],
    transition: {
      duration: timing.slow,
      ease: easings.smooth as unknown as number[],
    },
  },

  /** Reward celebration: scale + wobble */
  reward: {
    scale: [1, 1.3, 1],
    rotate: [0, -5, 5, 0],
    transition: {
      duration: 0.6,
      ease: easings.bounce as unknown as number[],
    },
  },
} as const;

// ── Mascot Motion ───────────────────────────────────────────────────────────
// Variant objects for the app mascot lifecycle.

export const mascotMotion: Variants = {
  /** Bounce in from off-screen bottom */
  enter: {
    y: 100,
    scale: 0.6,
    opacity: 0,
  },
  /** Resting state with subtle idle breathe */
  idle: {
    y: 0,
    scale: 1,
    opacity: 1,
    transition: {
      ...springs.bouncy,
    },
  },
  /** Gentle speaking bob */
  speak: {
    y: [0, -4, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
  /** Celebration: jump and subtle spin */
  celebrate: {
    y: [0, -20, 0],
    rotate: [0, -8, 8, 0],
    scale: [1, 1.15, 1],
    transition: {
      duration: 0.8,
      ease: easings.bounce as unknown as number[],
      times: [0, 0.3, 0.6, 1],
    },
  },
  /** Sleeping: very slow breathe with slight lean */
  sleep: {
    rotate: 5,
    scale: [1, 1.01, 1],
    transition: {
      rotate: {
        type: 'tween',
        duration: timing.slow,
        ease: easings.decelerate as unknown as number[],
      },
      scale: {
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  },
  /** Exit: shrink and fade away */
  exit: {
    scale: 0.5,
    opacity: 0,
    y: 20,
    transition: {
      type: 'tween',
      duration: timing.fast,
      ease: easings.accelerate as unknown as number[],
    },
  },
};

/** Mascot idle breathing loop -- separate from mascotMotion for composition */
export const mascotIdleLoop: Variants = {
  breathing: {
    scale: [1, 1.02, 1],
    y: [0, -3, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
  still: {
    scale: 1,
    y: 0,
  },
};

// ── Reward Animations ───────────────────────────────────────────────────────

export const rewardMotion: Variants = {
  /** Star earned: scale up, glow, then float upward */
  starEarn: {
    scale: [0, 1.4, 1],
    opacity: [0, 1, 1],
    y: [0, 0, -30],
    filter: [
      'brightness(1) drop-shadow(0 0 0px #FFD93D)',
      'brightness(1.3) drop-shadow(0 0 12px #FFD93D)',
      'brightness(1) drop-shadow(0 0 4px #FFD93D)',
    ],
    transition: {
      duration: 0.8,
      times: [0, 0.4, 1],
      ease: easings.playful as unknown as number[],
    },
  },

  /** Badge reveal: rotate in from "back", shimmer effect */
  badgeReveal: {
    rotateY: [180, 0],
    scale: [0.6, 1.1, 1],
    opacity: [0, 1, 1],
    filter: [
      'brightness(1)',
      'brightness(1.5)',
      'brightness(1)',
    ],
    transition: {
      duration: 0.8,
      times: [0, 0.6, 1],
      ease: easings.bounce as unknown as number[],
    },
  },

  /** Streak fire: flickering scale animation */
  streakFire: {
    scale: [1, 1.08, 0.97, 1.05, 1],
    y: [0, -2, 1, -1, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },

  /** Confetti burst trigger state (scale the container) */
  confettiBurst: {
    scale: [0, 1.2, 1],
    opacity: [0, 1, 1],
    transition: {
      duration: 0.5,
      times: [0, 0.6, 1],
      ease: easings.bounce as unknown as number[],
    },
  },
};

// ── Loading State Animations ────────────────────────────────────────────────

export const loadingMotion = {
  /** Skeleton shimmer: sweeping gradient effect via x position */
  skeleton: {
    initial: { backgroundPosition: '-200% 0' },
    animate: { backgroundPosition: '200% 0' },
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'linear',
    } satisfies Transition,
    /** Apply this background style on the skeleton element */
    style: {
      background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
      backgroundSize: '200% 100%',
    },
  },

  /** Rotating spinner */
  spinner: {
    animate: { rotate: 360 },
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    } satisfies Transition,
  },

  /** Bouncing dots stagger */
  dots: {
    containerVariants: {
      animate: {
        transition: {
          staggerChildren: 0.15,
        },
      },
    } satisfies Variants,
    dotVariants: {
      animate: {
        y: [0, -8, 0],
        transition: {
          duration: 0.5,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      },
    } satisfies Variants,
  },

  /** Mascot idle waiting animation */
  mascot: {
    animate: {
      y: [0, -6, 0],
      rotate: [-2, 2, -2],
    },
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    } satisfies Transition,
  },
} as const;

// ── Reduced Motion Fallbacks ────────────────────────────────────────────────
// Mirror of every category above but with opacity-only transitions.

export const reducedMotionPageTransitions: Record<string, PageTransitionConfig> = {
  default: {
    initial: { x: 0, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 0, opacity: 0 },
    transition: { type: 'tween', duration: 0.15, ease: easings.smooth as unknown as number[] },
  },
  modal: {
    initial: { scale: 1, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 1, opacity: 0 },
    transition: { type: 'tween', duration: 0.15, ease: easings.smooth as unknown as number[] },
  },
  bedtime: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { type: 'tween', duration: 0.15, ease: easings.smooth as unknown as number[] },
  },
  celebration: {
    initial: { scale: 1, opacity: 0, rotate: 0 },
    animate: { scale: 1, opacity: 1, rotate: 0 },
    exit: { scale: 1, opacity: 0 },
    transition: { type: 'tween', duration: 0.15, ease: easings.smooth as unknown as number[] },
  },
  story: {
    initial: { rotateY: 0, opacity: 0 },
    animate: { rotateY: 0, opacity: 1 },
    exit: { rotateY: 0, opacity: 0 },
    transition: { type: 'tween', duration: 0.15, ease: easings.smooth as unknown as number[] },
  },
};

export const reducedMotionFeedback = {
  tap: { opacity: 0.85, transition: { duration: 0.1 } },
  hover: { opacity: 0.9, transition: { duration: 0.1 } },
  press: { opacity: 0.75, transition: { duration: 0.1 } },
  success: { opacity: [1, 0.7, 1], transition: { duration: 0.3 } },
  error: { opacity: [1, 0.5, 1], transition: { duration: 0.3 } },
  reward: { opacity: [1, 0.7, 1], transition: { duration: 0.4 } },
} as const;

// ── Convenience: Bedtime Variants ───────────────────────────────────────────
// Slower, calmer versions of all page transitions for bedtime mode.

export const bedtimePageTransitions: Record<string, PageTransitionConfig> = {
  default: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: {
      type: 'tween',
      duration: timing.glacial,
      ease: easings.decelerate as unknown as number[],
    },
  },
  modal: {
    initial: { opacity: 0, scale: 0.96 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.98 },
    transition: {
      type: 'tween',
      duration: timing.gentle,
      ease: easings.decelerate as unknown as number[],
    },
  },
};

// ── Export All ───────────────────────────────────────────────────────────────

export const transitionVariants = {
  pageTransitions,
  cardEntrances,
  gridCardVariants,
  listCardVariants,
  feedback,
  mascotMotion,
  mascotIdleLoop,
  rewardMotion,
  loadingMotion,
  reducedMotionPageTransitions,
  reducedMotionFeedback,
  bedtimePageTransitions,
} as const;
