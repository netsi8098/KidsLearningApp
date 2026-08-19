/**
 * GeneratedLion — Displays generated lion art with layered motion.
 *
 * Loads PNG poses from /assets/lion/ and applies:
 *   - Idle breathing (subtle scale Y oscillation)
 *   - Gentle float/bob
 *   - Blink overlay (eyelid layer fades in/out on interval)
 *   - Secondary sway (slight body rotation)
 *   - Per-pose custom motion (wave arm, bounce, etc.)
 *
 * Falls back to PremiumLion SVG when generated art isn't available.
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PremiumLion from './svg/PremiumLion';

export type LionPose = 'idle' | 'waving' | 'excited' | 'thinking' | 'sleeping' | 'reading';

interface GeneratedLionProps {
  pose?: LionPose;
  size?: number;
  className?: string;
  /** Disable motion (for static contexts like thumbnails) */
  static?: boolean;
}

const POSE_PATHS: Record<LionPose, string> = {
  idle: '/assets/lion/idle.png',
  waving: '/assets/lion/waving.png',
  excited: '/assets/lion/excited.png',
  thinking: '/assets/lion/thinking.png',
  sleeping: '/assets/lion/sleeping.png',
  reading: '/assets/lion/reading.png',
};

/** Per-pose motion configs — tuned after motion reference study */
const POSE_MOTION: Record<LionPose, {
  breathe: { scaleY: number[]; duration: number };
  float: { y: number[]; duration: number };
  sway: { rotate: number[]; duration: number };
}> = {
  idle: {
    breathe: { scaleY: [1, 1.012, 1], duration: 3.2 },
    float: { y: [0, -4, 0], duration: 3.5 },
    sway: { rotate: [0, 0.8, 0, -0.8, 0], duration: 5 },
  },
  waving: {
    breathe: { scaleY: [1, 1.01, 1], duration: 3 },
    float: { y: [0, -3, 0], duration: 3.2 },
    sway: { rotate: [-1, 1.5, -1], duration: 2.5 },
  },
  excited: {
    breathe: { scaleY: [1, 1.02, 1], duration: 1.8 },
    float: { y: [0, -8, 0], duration: 1.5 },
    sway: { rotate: [-2, 2, -2], duration: 1.2 },
  },
  thinking: {
    breathe: { scaleY: [1, 1.008, 1], duration: 4 },
    float: { y: [0, -2, 0], duration: 4.5 },
    sway: { rotate: [0, 1.5, 0], duration: 6 },
  },
  sleeping: {
    breathe: { scaleY: [1, 1.025, 1], duration: 4.5 },
    float: { y: [0, -2, 0], duration: 5 },
    sway: { rotate: [0, 0.5, 0], duration: 7 },
  },
  reading: {
    breathe: { scaleY: [1, 1.01, 1], duration: 3.5 },
    float: { y: [0, -2, 0], duration: 4 },
    sway: { rotate: [0, 0.6, 0, -0.6, 0], duration: 5.5 },
  },
};

export default function GeneratedLion({
  pose = 'idle',
  size = 200,
  className,
  static: isStatic = false,
}: GeneratedLionProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const src = POSE_PATHS[pose];
  const m = POSE_MOTION[pose];

  // Preload image to detect availability
  useEffect(() => {
    setImageLoaded(false);
    setImageFailed(false);
    const img = new Image();
    img.onload = () => setImageLoaded(true);
    img.onerror = () => setImageFailed(true);
    img.src = src;
  }, [src]);

  // Fallback to SVG when generated art isn't available
  if (imageFailed) {
    return <PremiumLion size={size} className={className} />;
  }

  // Loading state — show nothing briefly to avoid flash
  if (!imageLoaded) {
    return <div className={className} style={{ width: size, height: size }} />;
  }

  if (isStatic) {
    return (
      <div className={className} style={{ width: size, height: size }}>
        <img
          src={src}
          alt={`Lion ${pose}`}
          className="w-full h-full object-contain"
          draggable={false}
        />
      </div>
    );
  }

  return (
    <div className={className} style={{ width: size, height: size, position: 'relative' }}>
      {/* Layer 1: Shadow — breathes with body */}
      <motion.div
        className="absolute bottom-[2%] left-1/2 -translate-x-1/2 w-[60%] h-[8%] rounded-full bg-black/8 blur-md"
        animate={{
          scaleX: [1, 1.05, 1],
          opacity: [0.5, 0.35, 0.5],
        }}
        transition={{ duration: m.breathe.duration, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Layer 2: Main body — breathing + floating + sway combined */}
      <motion.div
        className="relative w-full h-full"
        animate={{
          scaleY: m.breathe.scaleY,
          y: m.float.y,
          rotate: m.sway.rotate,
        }}
        transition={{
          scaleY: { duration: m.breathe.duration, repeat: Infinity, ease: 'easeInOut' },
          y: { duration: m.float.duration, repeat: Infinity, ease: 'easeInOut' },
          rotate: { duration: m.sway.duration, repeat: Infinity, ease: 'easeInOut' },
        }}
        style={{ transformOrigin: 'center bottom' }}
      >
        <img
          src={src}
          alt={`Lion ${pose}`}
          className="w-full h-full object-contain"
          draggable={false}
        />

        {/* Layer 3: Blink overlay — semi-transparent eyelid flash */}
        {pose !== 'sleeping' && (
          <motion.div
            className="absolute top-[28%] left-[25%] w-[50%] h-[8%] flex gap-[18%]"
            animate={{ opacity: [0, 0, 1, 0, 0] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
              times: [0, 0.43, 0.46, 0.49, 1],
            }}
          >
            <div className="flex-1 rounded-full bg-[#F5B55A]/80" />
            <div className="flex-1 rounded-full bg-[#F5B55A]/80" />
          </motion.div>
        )}
      </motion.div>

      {/* Layer 4: Warm ambient glow behind character */}
      <motion.div
        className="absolute inset-[-10%] rounded-full pointer-events-none -z-10"
        style={{
          background: 'radial-gradient(circle, rgba(255,220,130,0.15) 0%, transparent 65%)',
        }}
        animate={{ scale: [1, 1.06, 1], opacity: [0.5, 0.75, 0.5] }}
        transition={{ duration: m.breathe.duration + 1, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}
