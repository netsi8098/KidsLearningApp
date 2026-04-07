// =============================================================================
// Pose Library - 10 natural body poses for mascot characters
// =============================================================================

import type { ExpressionId } from './expressions.ts';

/** All available pose identifiers */
export type PoseId =
  | 'waving'
  | 'pointing'
  | 'cheering'
  | 'reading'
  | 'dancing'
  | 'listening'
  | 'explaining'
  | 'clapping'
  | 'tiptoeing'
  | 'reward';

/** Configuration for a single body pose */
export interface Pose {
  id: PoseId;
  label: string;
  /** Body rotation in degrees (-15 to 15) */
  bodyRotation: number;
  /** Left arm transform */
  armLeft: { rotation: number; scale: number };
  /** Right arm transform */
  armRight: { rotation: number; scale: number };
  /** Head tilt in degrees (-20 to 20) */
  headTilt: number;
  /** Whether the body should bounce in this pose */
  bounce: boolean;
  /** Whether the body should sway side to side */
  sway: boolean;
  /** The default facial expression paired with this pose */
  defaultExpression: ExpressionId;
  /** SVG layer transform hints for rendering adjustments */
  transformHints: Record<string, string>;
}

// ---------------------------------------------------------------------------
// Pose definitions
// ---------------------------------------------------------------------------

export const poses: Record<PoseId, Pose> = {
  waving: {
    id: 'waving',
    label: 'Waving',
    bodyRotation: -3,
    armLeft: { rotation: 0, scale: 1.0 },
    armRight: { rotation: -140, scale: 1.05 },
    headTilt: 5,
    bounce: false,
    sway: true,
    defaultExpression: 'happy',
    transformHints: {
      rightArm: 'rotate(-140deg) translateY(-4px)',
      body: 'rotate(-3deg)',
    },
  },

  pointing: {
    id: 'pointing',
    label: 'Pointing',
    bodyRotation: -5,
    armLeft: { rotation: 10, scale: 1.0 },
    armRight: { rotation: -90, scale: 1.15 },
    headTilt: -5,
    bounce: false,
    sway: false,
    defaultExpression: 'curious',
    transformHints: {
      rightArm: 'rotate(-90deg) scaleX(1.15)',
      head: 'rotate(-5deg)',
    },
  },

  cheering: {
    id: 'cheering',
    label: 'Cheering',
    bodyRotation: 0,
    armLeft: { rotation: -150, scale: 1.05 },
    armRight: { rotation: -150, scale: 1.05 },
    headTilt: 0,
    bounce: true,
    sway: false,
    defaultExpression: 'celebrating',
    transformHints: {
      leftArm: 'rotate(-150deg)',
      rightArm: 'rotate(-150deg)',
      body: 'translateY(-4px)',
    },
  },

  reading: {
    id: 'reading',
    label: 'Reading',
    bodyRotation: 2,
    armLeft: { rotation: -45, scale: 0.95 },
    armRight: { rotation: -55, scale: 0.95 },
    headTilt: -8,
    bounce: false,
    sway: false,
    defaultExpression: 'calm',
    transformHints: {
      leftArm: 'rotate(-45deg) scale(0.95)',
      rightArm: 'rotate(-55deg) scale(0.95)',
      head: 'rotate(-8deg) translateY(2px)',
    },
  },

  dancing: {
    id: 'dancing',
    label: 'Dancing',
    bodyRotation: 0,
    armLeft: { rotation: -120, scale: 1.0 },
    armRight: { rotation: -60, scale: 1.0 },
    headTilt: 8,
    bounce: true,
    sway: true,
    defaultExpression: 'happy',
    transformHints: {
      leftArm: 'rotate(-120deg)',
      rightArm: 'rotate(-60deg)',
      body: 'rotate(0deg)',
    },
  },

  listening: {
    id: 'listening',
    label: 'Listening',
    bodyRotation: 5,
    armLeft: { rotation: 10, scale: 1.0 },
    armRight: { rotation: -20, scale: 1.0 },
    headTilt: 12,
    bounce: false,
    sway: false,
    defaultExpression: 'curious',
    transformHints: {
      head: 'rotate(12deg)',
      body: 'rotate(5deg)',
    },
  },

  explaining: {
    id: 'explaining',
    label: 'Explaining',
    bodyRotation: -2,
    armLeft: { rotation: -30, scale: 1.0 },
    armRight: { rotation: -80, scale: 1.08 },
    headTilt: -3,
    bounce: false,
    sway: true,
    defaultExpression: 'encouraging',
    transformHints: {
      rightArm: 'rotate(-80deg) scaleX(1.08)',
      body: 'rotate(-2deg)',
    },
  },

  clapping: {
    id: 'clapping',
    label: 'Clapping',
    bodyRotation: 0,
    armLeft: { rotation: -70, scale: 1.0 },
    armRight: { rotation: -70, scale: 1.0 },
    headTilt: 0,
    bounce: true,
    sway: false,
    defaultExpression: 'proud',
    transformHints: {
      leftArm: 'rotate(-70deg)',
      rightArm: 'rotate(-70deg)',
      body: 'translateY(-2px)',
    },
  },

  tiptoeing: {
    id: 'tiptoeing',
    label: 'Tiptoeing',
    bodyRotation: 0,
    armLeft: { rotation: -20, scale: 0.9 },
    armRight: { rotation: -20, scale: 0.9 },
    headTilt: -5,
    bounce: false,
    sway: false,
    defaultExpression: 'thinking',
    transformHints: {
      body: 'translateY(-6px) scaleY(1.03)',
      leftArm: 'rotate(-20deg) scale(0.9)',
      rightArm: 'rotate(-20deg) scale(0.9)',
    },
  },

  reward: {
    id: 'reward',
    label: 'Reward',
    bodyRotation: 0,
    armLeft: { rotation: -160, scale: 1.1 },
    armRight: { rotation: -160, scale: 1.1 },
    headTilt: 0,
    bounce: true,
    sway: true,
    defaultExpression: 'celebrating',
    transformHints: {
      leftArm: 'rotate(-160deg) scale(1.1)',
      rightArm: 'rotate(-160deg) scale(1.1)',
      body: 'translateY(-8px)',
    },
  },
};

/** Retrieve a single pose by ID, falling back to 'waving' */
export function getPose(id: PoseId): Pose {
  return poses[id] ?? poses.waving;
}

/** All pose IDs as an ordered array */
export const allPoseIds: PoseId[] = Object.keys(poses) as PoseId[];
