/**
 * LionMascot — the reusable character system.
 *
 * PremiumLion draws the artwork and owns its own micro-motion (breathing,
 * blinking, ear/mane/tail secondary motion). This component owns the
 * character's *state* and the body-level motion that expresses it, so pages
 * never hand-roll mascot animation.
 *
 * State model (see brief §18):
 *   idle → resting, alive but calm
 *   welcome → greeting the user on arrival
 *   attention → leaning toward whatever the user is hovering
 *   thinking → considering, slight tilt
 *   happy → pleased, light bounce
 *   celebrate → big expressive reaction (reward moments)
 *   encourage → warm nudge
 *   sleep → bedtime / idle timeout
 *
 * Business logic never talks to animation directly: callers set `state` and
 * this component decides how that looks.
 */
import { useEffect, useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import PremiumLion from '../svg/PremiumLion';
import { useMotionPreset } from '../../motion/useMotionPreset';

export type MascotState =
  | 'idle'
  | 'welcome'
  | 'attention'
  | 'thinking'
  | 'happy'
  | 'celebrate'
  | 'encourage'
  | 'sleep';

export interface LionMascotProps {
  state?: MascotState;
  size?: number;
  className?: string;
  /** Nudges the character to lean toward a target: -1 (left) … 1 (right). */
  lookAt?: number;
  /** Fires once a transient state (happy/celebrate) has played out. */
  onStateComplete?: () => void;
}

/** States that play once then hand back to idle. */
const TRANSIENT: Partial<Record<MascotState, number>> = {
  happy: 900,
  celebrate: 1400,
};

/**
 * Body-level motion per state. PremiumLion already breathes and blinks, so
 * these deliberately stay in the "how is the character feeling" register
 * rather than re-animating the silhouette.
 */
const STATE_MOTION: Variants = {
  idle: {
    y: [0, -5, 0],
    rotate: [0, 0.7, 0, -0.7, 0],
    scale: 1,
    transition: {
      y: { duration: 3.6, repeat: Infinity, ease: 'easeInOut' },
      rotate: { duration: 6.5, repeat: Infinity, ease: 'easeInOut' },
    },
  },
  welcome: {
    y: [0, -8, 0],
    rotate: [-1.5, 2, -1.5],
    scale: 1,
    transition: {
      y: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' },
      rotate: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
    },
  },
  attention: {
    y: [0, -4, 0],
    scale: 1.03,
    transition: {
      y: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' },
      scale: { type: 'spring', stiffness: 260, damping: 20 },
    },
  },
  thinking: {
    y: [0, -2, 0],
    rotate: [0, 3.5, 0],
    scale: 1,
    transition: {
      y: { duration: 4.4, repeat: Infinity, ease: 'easeInOut' },
      rotate: { duration: 5.5, repeat: Infinity, ease: 'easeInOut' },
    },
  },
  happy: {
    y: [0, -18, 0, -8, 0],
    scale: [1, 1.06, 1, 1.03, 1],
    transition: { duration: 0.9, ease: 'easeOut' },
  },
  celebrate: {
    y: [0, -30, 0, -14, 0],
    rotate: [0, -7, 7, -3, 0],
    scale: [1, 1.12, 1, 1.05, 1],
    transition: { duration: 1.4, ease: 'easeOut' },
  },
  encourage: {
    y: [0, -7, 0],
    rotate: [-2, 2, -2],
    scale: 1,
    transition: {
      y: { duration: 1.9, repeat: Infinity, ease: 'easeInOut' },
      rotate: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' },
    },
  },
  sleep: {
    y: [0, -2, 0],
    rotate: 4,
    scale: [1, 1.015, 1],
    transition: {
      y: { duration: 5.5, repeat: Infinity, ease: 'easeInOut' },
      scale: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
      rotate: { duration: 0.6 },
    },
  },
  /** Reduced motion: the character still *reads* as present, it just holds still. */
  still: { y: 0, rotate: 0, scale: 1, transition: { duration: 0.2 } },
};

export default function LionMascot({
  state = 'idle',
  size = 200,
  className,
  lookAt = 0,
  onStateComplete,
}: LionMascotProps) {
  const { isReducedMotion } = useMotionPreset();
  const [activeState, setActiveState] = useState<MascotState>(state);

  // Adopt the requested state, then fall back to idle for transient reactions.
  useEffect(() => {
    setActiveState(state);
    const holdFor = TRANSIENT[state];
    if (!holdFor) return;
    const timer = setTimeout(() => {
      setActiveState('idle');
      onStateComplete?.();
    }, holdFor);
    return () => clearTimeout(timer);
  }, [state, onStateComplete]);

  // A small lean toward whatever the user is pointing at — the character
  // acknowledges the interface instead of staring straight ahead.
  const lean = isReducedMotion ? 0 : Math.max(-1, Math.min(1, lookAt)) * 6;

  return (
    <motion.div
      className={className}
      style={{ width: size, height: size, willChange: 'transform' }}
      variants={STATE_MOTION}
      animate={isReducedMotion ? 'still' : activeState}
      initial={false}
    >
      <motion.div
        animate={{ x: lean, rotate: lean * 0.35 }}
        transition={{ type: 'spring', stiffness: 180, damping: 22 }}
        style={{ width: '100%', height: '100%' }}
      >
        <PremiumLion size={size} />
      </motion.div>
    </motion.div>
  );
}
