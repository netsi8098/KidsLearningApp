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
 * Missing emotional pose art reuses the approved idle lion while the live rig
 * supplies the state-specific motion, so the character identity never changes.
 */
import { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import ArticulatedLion from './character/ArticulatedLion';
import RiggedLionBoundary from './character/rigged/RiggedLionBoundary';
import { RIGGED_LION_ENABLED } from './character/rigged/lionRigContract';

const RiggedLionCanvas = lazy(() => import('./character/rigged/RiggedLionCanvas'));

export type LionPose =
  // Required pose set — see public/assets/lion/README.md for the art spec.
  | 'idle'
  | 'waving'
  | 'excited'
  | 'thinking'
  | 'celebrating'
  | 'encouraging'
  | 'surprised'
  | 'success'
  | 'gentle-error'
  | 'loading'
  | 'reading'
  | 'pointing'
  // Optional expansions — fall back to the SVG until the art lands.
  | 'sleepy'
  | 'listening'
  | 'sad-soft'
  | 'clapping'
  | 'jumping';

interface GeneratedLionProps {
  pose?: LionPose;
  size?: number;
  className?: string;
  /** Disable motion (for static contexts like thumbnails) */
  static?: boolean;
  /** Horizontal gaze target from -1 (left) to 1 (right). */
  lookAt?: number;
  /** Text used to drive the articulated mouth timeline. */
  speechText?: string;
  /** Increment to start a new speaking performance. */
  speechKey?: number;
  /** Increment when audible speech actually begins. */
  mouthKey?: number;
  onSpeechComplete?: () => void;
}

/**
 * Filenames are the contract with the art folder: one lowercase PNG per pose,
 * resolved by key. Nothing else in the app hard-codes a lion filename.
 */
const POSE_PATHS: Record<LionPose, string> = {
  idle: '/assets/lion/idle.webp',
  waving: '/assets/lion/waving.webp',
  excited: '/assets/lion/excited.webp',
  thinking: '/assets/lion/thinking.webp',
  celebrating: '/assets/lion/celebrating.webp',
  encouraging: '/assets/lion/encouraging.webp',
  surprised: '/assets/lion/surprised.webp',
  success: '/assets/lion/success.webp',
  'gentle-error': '/assets/lion/gentle-error.webp',
  loading: '/assets/lion/loading.webp',
  reading: '/assets/lion/reading.webp',
  pointing: '/assets/lion/pointing.webp',
  sleepy: '/assets/lion/sleepy.webp',
  listening: '/assets/lion/listening.webp',
  'sad-soft': '/assets/lion/sad-soft.webp',
  clapping: '/assets/lion/clapping.webp',
  jumping: '/assets/lion/jumping.webp',
};

/**
 * Authored art actually present on disk. Poses outside this set reuse the idle
 * render and stay differentiated by the live rig and body motion.
 *
 * Only ONE render exists today. `idle/waving/thinking/celebrating.png` were four
 * byte-identical copies of the same waving image (verified by md5), so listing
 * them as four poses overstated what shipped and cost 5.2MB of duplicate bytes.
 * Add a pose here the moment a genuinely distinct render lands beside it.
 */
const AVAILABLE_ART_POSES = new Set<LionPose>(['idle']);

interface PoseMotion {
  breathe: { scaleY: number[]; duration: number };
  float: { y: number[]; duration: number };
  sway: { rotate: number[]; duration: number };
}

/** Calm baseline every pose starts from — the images are stills, code adds life. */
const BASE_MOTION: PoseMotion = {
  breathe: { scaleY: [1, 1.012, 1], duration: 3.2 },
  float: { y: [0, -4, 0], duration: 3.5 },
  sway: { rotate: [0, 0.8, 0, -0.8, 0], duration: 5 },
};

/** Per-pose deviations from the baseline, tuned to each pose's energy. */
const POSE_MOTION: Record<LionPose, PoseMotion> = {
  idle: BASE_MOTION,
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
  celebrating: {
    breathe: { scaleY: [1, 1.025, 1], duration: 1.5 },
    float: { y: [0, -12, 0], duration: 1.1 },
    sway: { rotate: [-3, 3, -3], duration: 1 },
  },
  encouraging: {
    breathe: { scaleY: [1, 1.014, 1], duration: 2.6 },
    float: { y: [0, -5, 0], duration: 2.4 },
    sway: { rotate: [-1.4, 1.4, -1.4], duration: 2.8 },
  },
  surprised: {
    breathe: { scaleY: [1, 1.03, 1], duration: 1.4 },
    float: { y: [0, -6, 0], duration: 1.3 },
    sway: { rotate: [-1, 1, -1], duration: 1.6 },
  },
  success: {
    breathe: { scaleY: [1, 1.016, 1], duration: 2.2 },
    float: { y: [0, -6, 0], duration: 2 },
    sway: { rotate: [-1.2, 1.2, -1.2], duration: 2.4 },
  },
  'gentle-error': {
    breathe: { scaleY: [1, 1.01, 1], duration: 3.8 },
    float: { y: [0, -2, 0], duration: 4 },
    sway: { rotate: [-0.6, 0.6, -0.6], duration: 5.5 },
  },
  loading: {
    // Deliberately busier than thinking — reads as "working on it".
    breathe: { scaleY: [1, 1.012, 1], duration: 2 },
    float: { y: [0, -5, 0, -3, 0], duration: 2.2 },
    sway: { rotate: [-2.5, 2.5, -2.5], duration: 1.8 },
  },
  reading: {
    breathe: { scaleY: [1, 1.01, 1], duration: 3.5 },
    float: { y: [0, -2, 0], duration: 4 },
    sway: { rotate: [0, 0.6, 0, -0.6, 0], duration: 5.5 },
  },
  pointing: {
    breathe: { scaleY: [1, 1.012, 1], duration: 2.8 },
    float: { y: [0, -3, 0], duration: 3 },
    sway: { rotate: [0.5, -0.8, 0.5], duration: 3.4 },
  },
  sleepy: {
    breathe: { scaleY: [1, 1.025, 1], duration: 4.5 },
    float: { y: [0, -2, 0], duration: 5 },
    sway: { rotate: [0, 0.5, 0], duration: 7 },
  },
  listening: BASE_MOTION,
  'sad-soft': {
    breathe: { scaleY: [1, 1.008, 1], duration: 4.2 },
    float: { y: [0, -1.5, 0], duration: 4.6 },
    sway: { rotate: [-0.5, 0.5, -0.5], duration: 6 },
  },
  clapping: {
    breathe: { scaleY: [1, 1.02, 1], duration: 1.6 },
    float: { y: [0, -7, 0], duration: 1.4 },
    sway: { rotate: [-2, 2, -2], duration: 1.1 },
  },
  jumping: {
    breathe: { scaleY: [1, 1.03, 1], duration: 1.2 },
    float: { y: [0, -16, 0], duration: 0.9 },
    sway: { rotate: [-3, 3, -3], duration: 1 },
  },
};

export default function GeneratedLion({
  pose = 'idle',
  size = 200,
  className,
  static: isStatic = false,
  lookAt = 0,
  speechText,
  speechKey = 0,
  mouthKey,
  onSpeechComplete,
}: GeneratedLionProps) {
  const src = AVAILABLE_ART_POSES.has(pose) ? POSE_PATHS[pose] : POSE_PATHS.idle;
  const m = POSE_MOTION[pose] ?? BASE_MOTION;

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

  const articulatedFallback = (
    <ArticulatedLion
      src={src}
      pose={pose}
      size={size}
      lookAt={lookAt}
      speechText={speechText}
      speechKey={speechKey}
      mouthKey={mouthKey}
      onSpeechComplete={onSpeechComplete}
    />
  );

  return (
    <div className={className} style={{ width: size, height: size, position: 'relative' }}>
      {RIGGED_LION_ENABLED ? (
        <RiggedLionBoundary fallback={articulatedFallback}>
          <Suspense fallback={articulatedFallback}>
            <RiggedLionCanvas
              pose={pose}
              size={size}
              lookAt={lookAt}
              speechText={speechText}
              speechKey={speechKey}
              mouthKey={mouthKey}
              onSpeechComplete={onSpeechComplete}
            />
          </Suspense>
        </RiggedLionBoundary>
      ) : articulatedFallback}

      {/* Warm ambient glow remains outside the anatomical rig. */}
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
