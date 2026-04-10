// =============================================================================
// StartupSequence - Branded opening sequence component
// =============================================================================
// Renders a full-screen animated startup sequence with 4 variants:
// first-launch, regular, bedtime, and offline. Respects reduced motion,
// supports tap-to-skip, and uses real SVG/emoji elements.

import { useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccessibility } from '../context/AccessibilityContext';
import {
  useStartupSequence,
  type StartupVariant,
} from './startupConfig';
import { springs, timing, easings, BEDTIME_TIMING_MULTIPLIER } from '../motion/motionPrimitives';

// ── Props ───────────────────────────────────────────────────────────────────

interface StartupSequenceProps {
  /** Which variant to show. Auto-detected if not provided */
  variant?: StartupVariant;
  /** Called when the sequence finishes or is skipped */
  onComplete: () => void;
  /** Whether bedtime mode is active (used for auto-detection) */
  isBedtime?: boolean;
}

// ── Color Palette ───────────────────────────────────────────────────────────

const COLORS = {
  cream: '#FFF8F0',
  coral: '#FF6B6B',
  teal: '#4ECDC4',
  sunny: '#FFE66D',
  grape: '#A78BFA',
  gold: '#FFD93D',
  nightBg: '#1a1a2e',
  nightCard: '#16213e',
  nightText: '#c7c7d4',
  indigo: '#4338CA',
  lavender: '#C4B5FD',
};

// ── SVG Elements ────────────────────────────────────────────────────────────

function BookIcon({ size = 64, color = COLORS.coral }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Book body */}
      <rect x="8" y="10" width="48" height="44" rx="6" fill={color} />
      {/* Book spine */}
      <rect x="8" y="10" width="8" height="44" rx="4" fill={darken(color, 0.15)} />
      {/* Pages */}
      <rect x="20" y="16" width="30" height="32" rx="3" fill="#FFFFFF" opacity="0.9" />
      {/* Page lines */}
      <rect x="24" y="22" width="22" height="2.5" rx="1.25" fill={color} opacity="0.3" />
      <rect x="24" y="28" width="18" height="2.5" rx="1.25" fill={color} opacity="0.3" />
      <rect x="24" y="34" width="20" height="2.5" rx="1.25" fill={color} opacity="0.3" />
      {/* Star on cover */}
      <path
        d="M32 6L34.2 10.5L39 11.2L35.5 14.6L36.3 19.4L32 17.1L27.7 19.4L28.5 14.6L25 11.2L29.8 10.5L32 6Z"
        fill={COLORS.gold}
      />
    </svg>
  );
}

function MoonIcon({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M36 28C36 36.8 28.8 44 20 44C13.5 44 8 40.2 5.5 34.8C7 35.3 8.6 35.5 10.3 35.5C19.1 35.5 26.3 28.3 26.3 19.5C26.3 14.8 24.2 10.5 20.8 7.5C22 7.2 23.2 7 24.5 7C31.4 7 37 12.6 37 19.5"
        fill={COLORS.sunny}
        opacity="0.9"
      />
      <circle cx="24" cy="24" r="18" fill={COLORS.sunny} opacity="0.15" />
    </svg>
  );
}

function StarSvg({
  x,
  y,
  size = 12,
  delay = 0,
  color = COLORS.gold,
}: {
  x: number;
  y: number;
  size?: number;
  delay?: number;
  color?: string;
}) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      style={{ position: 'absolute', left: `${x}%`, top: `${y}%` }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: [0, 1, 0.6, 1], scale: [0, 1.2, 0.9, 1] }}
      transition={{
        duration: 1.2,
        delay,
        ease: 'easeOut',
      }}
      aria-hidden="true"
    >
      <path
        d="M6 0L7.4 3.8L11.4 4.2L8.4 6.9L9.3 10.8L6 8.8L2.7 10.8L3.6 6.9L0.6 4.2L4.6 3.8L6 0Z"
        fill={color}
      />
    </motion.svg>
  );
}

function OfflineIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Cloud with slash */}
      <path
        d="M16 11A4 4 0 0015.5 3.1 6 6 0 004 5.5 4 4 0 005 13H16Z"
        fill={COLORS.teal}
        opacity="0.5"
      />
      <line x1="2" y1="2" x2="18" y2="18" stroke={COLORS.coral} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// ── Utility ─────────────────────────────────────────────────────────────────

function darken(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, ((num >> 16) & 0xff) * (1 - amount));
  const g = Math.max(0, ((num >> 8) & 0xff) * (1 - amount));
  const b = Math.max(0, (num & 0xff) * (1 - amount));
  return `#${((1 << 24) + (Math.round(r) << 16) + (Math.round(g) << 8) + Math.round(b)).toString(16).slice(1)}`;
}

// ── Particle Stars (for first-launch and bedtime) ───────────────────────────

const STAR_POSITIONS = [
  { x: 10, y: 15, size: 10, delay: 0.3 },
  { x: 25, y: 8, size: 14, delay: 0.5 },
  { x: 70, y: 12, size: 8, delay: 0.2 },
  { x: 80, y: 20, size: 12, delay: 0.6 },
  { x: 15, y: 75, size: 10, delay: 0.8 },
  { x: 85, y: 70, size: 14, delay: 0.4 },
  { x: 50, y: 5, size: 16, delay: 0.1 },
  { x: 40, y: 80, size: 10, delay: 0.7 },
  { x: 90, y: 45, size: 8, delay: 0.9 },
  { x: 5, y: 50, size: 12, delay: 0.35 },
];

// ── Typewriter Title ────────────────────────────────────────────────────────

function TypewriterTitle({
  text,
  delay,
  color,
}: {
  text: string;
  delay: number;
  color: string;
}) {
  return (
    <span aria-label={text} role="text">
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: delay + i * 0.06,
            duration: 0.15,
            ease: easings.decelerate as [number, number, number, number],
          }}
          style={{ display: 'inline-block', color, whiteSpace: 'pre' }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </span>
  );
}

// ── First Launch Variant ────────────────────────────────────────────────────

function FirstLaunchSequence({ onSkip, canSkip }: { onSkip: () => void; canSkip: boolean }) {
  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{ backgroundColor: COLORS.cream }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: timing.normal }}
      onClick={canSkip ? onSkip : undefined}
      role="presentation"
      aria-label="App loading"
    >
      {/* Background stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {STAR_POSITIONS.map((star, i) => (
          <StarSvg
            key={i}
            x={star.x}
            y={star.y}
            size={star.size}
            delay={0.6 + star.delay}
            color={i % 2 === 0 ? COLORS.gold : COLORS.sunny}
          />
        ))}
      </div>

      {/* Brand icon */}
      <motion.div
        initial={{ scale: 0, rotate: -15 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ ...springs.bouncy }}
      >
        <BookIcon size={80} color={COLORS.coral} />
      </motion.div>

      {/* Mascot */}
      <motion.div
        className="mt-4 text-6xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: timing.slow, ease: easings.decelerate as [number, number, number, number] }}
      >
        <motion.span
          style={{ display: 'inline-block' }}
          animate={{ rotate: [0, -12, 12, -8, 8, 0] }}
          transition={{ delay: 0.7, duration: 0.6, ease: 'easeInOut' }}
          aria-hidden="true"
        >
          {'\uD83E\uDD81'}
        </motion.span>
      </motion.div>

      {/* Typewriter title */}
      <div className="mt-5 text-3xl font-bold">
        <TypewriterTitle text="Kids Learning Fun!" delay={0.9} color={COLORS.coral} />
      </div>

      {/* Subtitle */}
      <motion.p
        className="mt-2 text-lg font-semibold"
        style={{ color: '#6B7280' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: timing.normal }}
      >
        Let's explore together!
      </motion.p>

      {/* Skip hint */}
      <AnimatePresence>
        {canSkip && (
          <motion.p
            className="absolute bottom-10 text-sm"
            style={{ color: '#9CA3AF' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
          >
            Tap to skip
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Regular Launch Variant ──────────────────────────────────────────────────

function RegularSequence({ onSkip, canSkip }: { onSkip: () => void; canSkip: boolean }) {
  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{ backgroundColor: COLORS.cream }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: timing.fast }}
      onClick={canSkip ? onSkip : undefined}
      role="presentation"
      aria-label="App loading"
    >
      {/* Quick brand icon flash */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: [0.6, 1.1, 1], opacity: 1 }}
        transition={{ duration: 0.4, ease: easings.bounce as [number, number, number, number] }}
      >
        <BookIcon size={72} color={COLORS.coral} />
      </motion.div>

      {/* Mascot quick wave */}
      <motion.div
        className="mt-3 text-5xl"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, ...springs.snappy }}
      >
        <motion.span
          style={{ display: 'inline-block' }}
          animate={{ rotate: [0, -10, 10, 0] }}
          transition={{ delay: 0.35, duration: 0.4 }}
          aria-hidden="true"
        >
          {'\uD83E\uDD81'}
        </motion.span>
      </motion.div>

      {/* Title */}
      <motion.h1
        className="mt-3 text-2xl font-bold"
        style={{ color: COLORS.coral }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: timing.fast }}
      >
        Kids Learning Fun!
      </motion.h1>
    </motion.div>
  );
}

// ── Bedtime Launch Variant ──────────────────────────────────────────────────

function BedtimeSequence({ onSkip, canSkip }: { onSkip: () => void; canSkip: boolean }) {
  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{ backgroundColor: COLORS.nightBg }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: timing.gentle }}
      onClick={canSkip ? onSkip : undefined}
      role="presentation"
      aria-label="App loading - bedtime mode"
    >
      {/* Stars fading in slowly */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {STAR_POSITIONS.map((star, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              left: `${star.x}%`,
              top: `${star.y}%`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.7, 0.4, 0.7] }}
            transition={{
              delay: star.delay * 0.8,
              duration: 2.5,
              ease: 'easeInOut',
              repeat: Infinity,
            }}
          >
            <svg width={star.size * 0.8} height={star.size * 0.8} viewBox="0 0 12 12" aria-hidden="true">
              <circle cx="6" cy="6" r="2" fill={COLORS.lavender} opacity="0.8" />
            </svg>
          </motion.div>
        ))}
      </div>

      {/* Moon */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          delay: 0.3,
          duration: timing.gentle * BEDTIME_TIMING_MULTIPLIER,
          ease: easings.decelerate as [number, number, number, number],
        }}
      >
        <MoonIcon size={56} />
      </motion.div>

      {/* Sleeping mascot */}
      <motion.div
        className="mt-4 text-5xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, rotate: 5 }}
        transition={{
          delay: 0.7,
          duration: timing.gentle,
          ease: easings.decelerate as [number, number, number, number],
        }}
      >
        <motion.span
          style={{ display: 'inline-block' }}
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden="true"
        >
          {'\uD83E\uDD89'}
        </motion.span>
      </motion.div>

      {/* Title */}
      <motion.h1
        className="mt-4 text-xl font-bold"
        style={{ color: COLORS.lavender }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          delay: 1.2,
          duration: timing.gentle,
          ease: easings.decelerate as [number, number, number, number],
        }}
      >
        Sweet Dreams...
      </motion.h1>

      {/* Skip hint */}
      <AnimatePresence>
        {canSkip && (
          <motion.p
            className="absolute bottom-10 text-sm"
            style={{ color: COLORS.nightText }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
          >
            Tap to continue
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Offline Launch Variant ──────────────────────────────────────────────────

function OfflineSequence({ onSkip, canSkip }: { onSkip: () => void; canSkip: boolean }) {
  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{ backgroundColor: COLORS.cream }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: timing.fast }}
      onClick={canSkip ? onSkip : undefined}
      role="presentation"
      aria-label="App loading - offline mode"
    >
      {/* Brand icon with offline indicator */}
      <motion.div
        className="relative"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ ...springs.gentle }}
      >
        <BookIcon size={72} color={COLORS.teal} />
        <motion.div
          className="absolute -top-1 -right-1"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, ...springs.bouncy }}
        >
          <OfflineIcon size={24} />
        </motion.div>
      </motion.div>

      {/* "Ready to play offline!" text */}
      <motion.p
        className="mt-5 text-lg font-bold"
        style={{ color: COLORS.teal }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: timing.normal }}
      >
        Ready to play offline!
      </motion.p>

      {/* Mascot */}
      <motion.div
        className="mt-3 text-4xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: timing.normal }}
      >
        <motion.span
          style={{ display: 'inline-block' }}
          animate={{ rotate: [0, -8, 8, 0] }}
          transition={{ delay: 0.65, duration: 0.4 }}
          aria-hidden="true"
        >
          {'\uD83E\uDD81'}
        </motion.span>
      </motion.div>
    </motion.div>
  );
}

// ── Reduced Motion Variant ──────────────────────────────────────────────────

function ReducedMotionSequence({ onSkip }: { onSkip: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{ backgroundColor: COLORS.cream }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={onSkip}
      role="presentation"
      aria-label="App loading"
    >
      <BookIcon size={72} color={COLORS.coral} />
      <p
        className="mt-4 text-2xl font-bold"
        style={{ color: COLORS.coral }}
      >
        Kids Learning Fun!
      </p>
    </motion.div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────

export default function StartupSequence({
  variant: explicitVariant,
  onComplete,
  isBedtime = false,
}: StartupSequenceProps) {
  const { reducedMotion } = useAccessibility();

  const {
    state,
    variant,
    canSkip,
    skip,
    shouldShow,
  } = useStartupSequence(explicitVariant, isBedtime, onComplete);

  const handleSkip = useCallback(() => {
    if (canSkip) {
      skip();
    }
  }, [canSkip, skip]);

  // Don't render if already seen this session
  if (!shouldShow) return null;

  // Already complete or skipped
  const isVisible = state === 'playing';

  // Select the appropriate variant component
  const SequenceComponent = useMemo(() => {
    if (reducedMotion) return ReducedMotionSequence;

    switch (variant) {
      case 'first-launch':
        return FirstLaunchSequence;
      case 'bedtime':
        return BedtimeSequence;
      case 'offline':
        return OfflineSequence;
      case 'regular':
      default:
        return RegularSequence;
    }
  }, [variant, reducedMotion]);

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <SequenceComponent
          key={variant}
          onSkip={handleSkip}
          canSkip={canSkip}
        />
      )}
    </AnimatePresence>
  );
}

// ── Re-export for convenience ───────────────────────────────────────────────

export { StartupSequence };
export type { StartupSequenceProps };
