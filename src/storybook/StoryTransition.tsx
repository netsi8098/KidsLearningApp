// ─── Story Transition Component ────────────────────────────────────────────
// Wraps AnimatePresence for smooth cinematic page changes.
// Direction-aware sliding with mood-specific transition variants.

import { type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StoryTransitionProps {
  /** Transition direction: next slides left, previous slides right */
  direction: 'next' | 'previous';
  /** Unique key for the current page (triggers transition) */
  pageKey: string | number;
  /** The page content to render */
  children: ReactNode;
  /** Mood affects transition style and speed */
  mood?: 'exciting' | 'curious' | 'funny' | 'warm' | 'bedtime' | 'dramatic';
  /** Override duration in seconds */
  duration?: number;
}

// ─── Transition variant factories ──────────────────────────────────────────

function getSlideVariants(direction: 'next' | 'previous', distance: number) {
  const xEnter = direction === 'next' ? distance : -distance;
  const xExit = direction === 'next' ? -distance : distance;
  return {
    initial: { x: xEnter, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: xExit, opacity: 0 },
  };
}

function getCrossfadeVariants() {
  return {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };
}

function getZoomVariants(direction: 'next' | 'previous') {
  return {
    initial: {
      scale: direction === 'next' ? 0.85 : 1.15,
      opacity: 0,
    },
    animate: { scale: 1, opacity: 1 },
    exit: {
      scale: direction === 'next' ? 1.15 : 0.85,
      opacity: 0,
    },
  };
}

function getPageCurlVariants(direction: 'next' | 'previous') {
  const rotateEnter = direction === 'next' ? 5 : -5;
  return {
    initial: {
      rotateY: rotateEnter,
      opacity: 0,
      transformPerspective: 1200,
    },
    animate: {
      rotateY: 0,
      opacity: 1,
      transformPerspective: 1200,
    },
    exit: {
      rotateY: -rotateEnter,
      opacity: 0,
      transformPerspective: 1200,
    },
  };
}

// ─── Mood-to-variant mapping ───────────────────────────────────────────────
interface MoodConfig {
  getVariants: (direction: 'next' | 'previous') => Record<string, object>;
  duration: number;
  ease: string | number[];
}

const moodConfigs: Record<string, MoodConfig> = {
  exciting: {
    getVariants: (dir) => getSlideVariants(dir, 300),
    duration: 0.35,
    ease: 'easeOut',
  },
  curious: {
    getVariants: (dir) => getPageCurlVariants(dir),
    duration: 0.5,
    ease: 'easeInOut',
  },
  funny: {
    getVariants: (dir) => ({
      initial: { ...getSlideVariants(dir, 200).initial, rotate: dir === 'next' ? 3 : -3 },
      animate: { x: 0, opacity: 1, rotate: 0 },
      exit: { ...getSlideVariants(dir, 200).exit, rotate: dir === 'next' ? -3 : 3 },
    }),
    duration: 0.4,
    ease: 'easeOut',
  },
  warm: {
    getVariants: (dir) => getSlideVariants(dir, 200),
    duration: 0.45,
    ease: 'easeInOut',
  },
  bedtime: {
    getVariants: () => getCrossfadeVariants(),
    duration: 0.8,
    ease: 'easeInOut',
  },
  dramatic: {
    getVariants: (dir) => getZoomVariants(dir),
    duration: 0.6,
    ease: [0.23, 1, 0.32, 1], // custom cubic bezier
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════════════════

export default function StoryTransition({
  direction,
  pageKey,
  children,
  mood = 'warm',
  duration: durationOverride,
}: StoryTransitionProps) {
  const config = moodConfigs[mood] ?? moodConfigs.warm;
  const variants = config.getVariants(direction);
  const transitionDuration = durationOverride ?? config.duration;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pageKey}
        className="w-full h-full"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
        transition={{
          duration: transitionDuration,
          ease: config.ease as string | number[],
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Swipe hint for page curl ──────────────────────────────────────────────
// Optional: shows a gentle page-curl hint on first interaction

export function PageCurlHint({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <motion.div
      className="absolute bottom-20 right-4 pointer-events-none z-50"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: [0, 0.7, 0], x: [20, 0, 20] }}
      transition={{ duration: 2, repeat: 2, ease: 'easeInOut' }}
    >
      <div className="flex items-center gap-2 bg-white/80 backdrop-blur rounded-full px-4 py-2 shadow-lg">
        <span className="text-sm font-bold text-gray-600">Swipe</span>
        <span className="text-lg">👆</span>
      </div>
    </motion.div>
  );
}
