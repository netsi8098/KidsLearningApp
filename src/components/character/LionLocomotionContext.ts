import { createContext, type MutableRefObject } from 'react';

export type LionLocomotionMode = 'idle' | 'walk' | 'anticipate' | 'airborne' | 'land';

export interface LionLocomotionFrame {
  mode: LionLocomotionMode;
  /** Continuous gait cycles; the rig uses this to alternate planted paws. */
  gait: number;
  direction: -1 | 0 | 1;
  speed: number;
  crouch: number;
  lift: number;
  landing: number;
}

export const IDLE_LOCOMOTION: LionLocomotionFrame = {
  mode: 'idle',
  gait: 0,
  direction: 0,
  speed: 0,
  crouch: 0,
  lift: 0,
  landing: 0,
};

/**
 * A stable mutable channel lets the world and Three.js rig share a 60fps
 * locomotion frame without forcing React to render on every animation tick.
 */
export const LionLocomotionContext = createContext<MutableRefObject<LionLocomotionFrame> | null>(null);
