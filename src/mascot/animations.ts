// =============================================================================
// Animation Behavior Configs - Framer Motion variant definitions for mascots
// =============================================================================

import type { Transition, Variants } from 'framer-motion';

// ---------------------------------------------------------------------------
// Shared timing constants
// ---------------------------------------------------------------------------

/** Standard spring physics used across mascot animations */
export const MASCOT_SPRING: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 22,
  mass: 0.8,
};

/** Softer spring for facial expression transitions */
export const EXPRESSION_SPRING: Transition = {
  type: 'spring',
  stiffness: 200,
  damping: 18,
  mass: 0.6,
};

// ---------------------------------------------------------------------------
// Idle breathing
// ---------------------------------------------------------------------------

export const idleBreathing: Variants = {
  idle: {
    scale: [1, 1.02, 1],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
  static: {
    scale: 1,
  },
};

// ---------------------------------------------------------------------------
// Blink timing helper
// ---------------------------------------------------------------------------

/** Returns a random interval in ms between blinks (2500-5000ms) */
export function getBlinkInterval(): number {
  return 2500 + Math.random() * 2500;
}

/** Duration of a single blink in ms */
export const BLINK_DURATION_MS = 150;

export const blinkVariants: Variants = {
  open: {
    scaleY: 1,
    transition: { duration: 0.08 },
  },
  closed: {
    scaleY: 0.05,
    transition: { duration: 0.08 },
  },
};

// ---------------------------------------------------------------------------
// Bounce timing
// ---------------------------------------------------------------------------

export const bounceVariants: Variants = {
  bouncing: {
    y: [0, -8, 0],
    transition: {
      duration: 0.4,
      ease: 'easeOut',
      repeat: Infinity,
      repeatDelay: 0.6,
    },
  },
  still: {
    y: 0,
  },
};

// ---------------------------------------------------------------------------
// Sway timing
// ---------------------------------------------------------------------------

export const swayVariants: Variants = {
  swaying: {
    rotate: [-2, 2, -2],
    transition: {
      duration: 2,
      ease: 'easeInOut',
      repeat: Infinity,
    },
  },
  still: {
    rotate: 0,
  },
};

// ---------------------------------------------------------------------------
// Wave timing (arm oscillation)
// ---------------------------------------------------------------------------

export const waveVariants: Variants = {
  waving: {
    rotate: [-20, 20, -20, 20, 0],
    transition: {
      duration: 0.6,
      ease: 'easeInOut',
      times: [0, 0.25, 0.5, 0.75, 1],
    },
  },
  still: {
    rotate: 0,
  },
};

// ---------------------------------------------------------------------------
// Celebration timing
// ---------------------------------------------------------------------------

export const celebrationVariants: Variants = {
  celebrating: {
    scale: [1, 1.15, 0.95, 1.08, 1],
    y: [0, -16, 0, -8, 0],
    rotate: [0, -5, 5, -3, 0],
    transition: {
      duration: 1.2,
      ease: 'easeOut',
      times: [0, 0.25, 0.5, 0.75, 1],
    },
  },
  still: {
    scale: 1,
    y: 0,
    rotate: 0,
  },
};

// ---------------------------------------------------------------------------
// Clapping timing
// ---------------------------------------------------------------------------

export const clapVariants: Variants = {
  clapping: {
    scaleX: [1, 0.85, 1, 0.85, 1],
    transition: {
      duration: 0.8,
      ease: 'easeInOut',
      times: [0, 0.2, 0.4, 0.6, 0.8],
      repeat: 2,
    },
  },
  still: {
    scaleX: 1,
  },
};

// ---------------------------------------------------------------------------
// Dancing timing
// ---------------------------------------------------------------------------

export const danceVariants: Variants = {
  dancing: {
    rotate: [-8, 8, -8],
    y: [0, -6, 0, -6, 0],
    transition: {
      duration: 0.8,
      ease: 'easeInOut',
      repeat: Infinity,
    },
  },
  still: {
    rotate: 0,
    y: 0,
  },
};

// ---------------------------------------------------------------------------
// Bedtime idle (very gentle, slow)
// ---------------------------------------------------------------------------

export const bedtimeIdleBreathing: Variants = {
  idle: {
    scale: [1, 1.012, 1],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
  static: {
    scale: 1,
  },
};

export const bedtimeSwayVariants: Variants = {
  swaying: {
    rotate: [-1, 1, -1],
    transition: {
      duration: 4,
      ease: 'easeInOut',
      repeat: Infinity,
    },
  },
  still: {
    rotate: 0,
  },
};

// ---------------------------------------------------------------------------
// Entrance / Exit animations
// ---------------------------------------------------------------------------

export const entranceVariants: Variants = {
  hidden: {
    scale: 0.8,
    opacity: 0,
  },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20,
      mass: 0.8,
    },
  },
};

export const exitVariants: Variants = {
  visible: {
    scale: 1,
    opacity: 1,
  },
  exit: {
    scale: 0.9,
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
};

// ---------------------------------------------------------------------------
// Sparkle pulse (used on sparkle eyes / celebrating extras)
// ---------------------------------------------------------------------------

export const sparklePulseVariants: Variants = {
  sparkling: {
    scale: [1, 1.3, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 0.8,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
  still: {
    scale: 1,
    opacity: 1,
  },
};

// ---------------------------------------------------------------------------
// Speaking mouth animation
// ---------------------------------------------------------------------------

export const speakingMouthVariants: Variants = {
  speaking: {
    scaleY: [1, 1.3, 0.8, 1.2, 1],
    transition: {
      duration: 0.3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
  silent: {
    scaleY: 1,
  },
};

// ---------------------------------------------------------------------------
// Head tilt transition
// ---------------------------------------------------------------------------

export const headTiltTransition: Transition = {
  type: 'spring',
  stiffness: 180,
  damping: 16,
};

// ---------------------------------------------------------------------------
// Arm pose transition
// ---------------------------------------------------------------------------

export const armTransition: Transition = {
  type: 'spring',
  stiffness: 160,
  damping: 14,
  mass: 0.7,
};

// ---------------------------------------------------------------------------
// Reduced motion fallbacks
// ---------------------------------------------------------------------------

/** Returns static variants for reduced-motion mode */
export const reducedMotionVariants: Variants = {
  idle: { scale: 1 },
  static: { scale: 1 },
  bouncing: { y: 0 },
  still: { y: 0, rotate: 0, scale: 1 },
  swaying: { rotate: 0 },
  waving: { rotate: 0 },
  celebrating: { scale: 1, y: 0, rotate: 0 },
  clapping: { scaleX: 1 },
  dancing: { rotate: 0, y: 0 },
  sparkling: { scale: 1, opacity: 1 },
  speaking: { scaleY: 1 },
  silent: { scaleY: 1 },
  hidden: { scale: 1, opacity: 1 },
  visible: { scale: 1, opacity: 1 },
  exit: { scale: 1, opacity: 0 },
};
