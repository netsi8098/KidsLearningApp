// =============================================================================
// Startup Config - Timing, phases, and variant definitions
// =============================================================================
// Defines the 4 startup variants with precise phase timings. Also provides
// session storage management and the useStartupSequence state hook.

import { useState, useCallback, useEffect, useRef } from 'react';

// ── Types ───────────────────────────────────────────────────────────────────

export type StartupVariant = 'first-launch' | 'regular' | 'bedtime' | 'offline';

export interface StartupPhase {
  /** Unique identifier for this phase */
  id: string;
  /** Start time in milliseconds from sequence begin */
  startMs: number;
  /** Duration of this phase in milliseconds */
  durationMs: number;
  /** Which visual element this phase controls */
  element: 'icon' | 'mascot' | 'title' | 'subtitle' | 'particles';
  /** Name of the animation to apply */
  animation: string;
}

export interface StartupConfig {
  /** Which variant this config describes */
  variant: StartupVariant;
  /** Total duration of the entire sequence in milliseconds */
  totalDuration: number;
  /** Time in ms after which tapping will skip the rest */
  skipAfter: number;
  /** Ordered list of animation phases */
  phases: StartupPhase[];
  /** Optional audio cue identifier from the app's sound registry */
  audioId?: string;
}

// ── Variant Configs ─────────────────────────────────────────────────────────

export const startupConfigs: Record<StartupVariant, StartupConfig> = {
  'first-launch': {
    variant: 'first-launch',
    totalDuration: 2500,
    skipAfter: 500,
    audioId: 'startup-chime',
    phases: [
      {
        id: 'icon-scale',
        startMs: 0,
        durationMs: 600,
        element: 'icon',
        animation: 'springScaleIn',
      },
      {
        id: 'mascot-fade',
        startMs: 500,
        durationMs: 500,
        element: 'mascot',
        animation: 'fadeInWave',
      },
      {
        id: 'title-type',
        startMs: 900,
        durationMs: 800,
        element: 'title',
        animation: 'typewriter',
      },
      {
        id: 'subtitle-fade',
        startMs: 1500,
        durationMs: 400,
        element: 'subtitle',
        animation: 'fadeIn',
      },
      {
        id: 'particles-burst',
        startMs: 600,
        durationMs: 1200,
        element: 'particles',
        animation: 'sparkleFloat',
      },
    ],
  },

  regular: {
    variant: 'regular',
    totalDuration: 1200,
    skipAfter: 500,
    audioId: 'startup-quick',
    phases: [
      {
        id: 'icon-flash',
        startMs: 0,
        durationMs: 400,
        element: 'icon',
        animation: 'quickFlash',
      },
      {
        id: 'mascot-wave',
        startMs: 200,
        durationMs: 500,
        element: 'mascot',
        animation: 'quickWave',
      },
      {
        id: 'title-fade',
        startMs: 300,
        durationMs: 300,
        element: 'title',
        animation: 'fadeIn',
      },
    ],
  },

  bedtime: {
    variant: 'bedtime',
    totalDuration: 2000,
    skipAfter: 500,
    audioId: 'startup-lullaby',
    phases: [
      {
        id: 'particles-stars',
        startMs: 0,
        durationMs: 1200,
        element: 'particles',
        animation: 'slowStarFade',
      },
      {
        id: 'icon-moon',
        startMs: 300,
        durationMs: 800,
        element: 'icon',
        animation: 'gentleFadeIn',
      },
      {
        id: 'mascot-sleep',
        startMs: 700,
        durationMs: 600,
        element: 'mascot',
        animation: 'sleepyFadeIn',
      },
      {
        id: 'title-fade',
        startMs: 1200,
        durationMs: 500,
        element: 'title',
        animation: 'slowFadeIn',
      },
    ],
  },

  offline: {
    variant: 'offline',
    totalDuration: 1500,
    skipAfter: 500,
    phases: [
      {
        id: 'icon-scale',
        startMs: 0,
        durationMs: 500,
        element: 'icon',
        animation: 'springScaleIn',
      },
      {
        id: 'subtitle-offline',
        startMs: 400,
        durationMs: 400,
        element: 'subtitle',
        animation: 'fadeIn',
      },
      {
        id: 'mascot-wave',
        startMs: 500,
        durationMs: 500,
        element: 'mascot',
        animation: 'quickWave',
      },
    ],
  },
} as const;

// ── Session Storage ─────────────────────────────────────────────────────────
// On subsequent visits within the same session, skip the startup entirely.

const SESSION_KEY = 'klf-startup-seen';

export function hasSeenStartupThisSession(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

export function markStartupSeen(): void {
  try {
    sessionStorage.setItem(SESSION_KEY, '1');
  } catch {
    // SessionStorage unavailable -- not critical
  }
}

// ── First Launch Detection ──────────────────────────────────────────────────

const FIRST_LAUNCH_KEY = 'klf-has-launched';

export function isFirstLaunch(): boolean {
  try {
    return localStorage.getItem(FIRST_LAUNCH_KEY) !== '1';
  } catch {
    return true;
  }
}

export function markFirstLaunchComplete(): void {
  try {
    localStorage.setItem(FIRST_LAUNCH_KEY, '1');
  } catch {
    // Not critical
  }
}

// ── Variant Auto-Detection ──────────────────────────────────────────────────

/**
 * Determine which startup variant to show based on app state.
 * @param isBedtime - Whether bedtime mode is active
 * @param isOnline - Whether the device has network connectivity
 */
export function detectStartupVariant(isBedtime: boolean, isOnline: boolean): StartupVariant {
  if (!isOnline) return 'offline';
  if (isBedtime) return 'bedtime';
  if (isFirstLaunch()) return 'first-launch';
  return 'regular';
}

// ── useStartupSequence Hook ─────────────────────────────────────────────────

export type StartupState = 'playing' | 'complete' | 'skipped';

export interface StartupSequenceHook {
  /** Current state of the startup sequence */
  state: StartupState;
  /** The active config for the determined variant */
  config: StartupConfig;
  /** The determined variant */
  variant: StartupVariant;
  /** Current elapsed time in ms (updates during playback) */
  elapsedMs: number;
  /** Whether the skip button should be shown */
  canSkip: boolean;
  /** Call this to skip the rest of the sequence */
  skip: () => void;
  /** Whether the sequence should be shown at all */
  shouldShow: boolean;
}

export function useStartupSequence(
  explicitVariant?: StartupVariant,
  isBedtime: boolean = false,
  onComplete?: () => void,
): StartupSequenceHook {
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  const variant = explicitVariant ?? detectStartupVariant(isBedtime, isOnline);
  const config = startupConfigs[variant];

  const shouldShow = !hasSeenStartupThisSession();

  const [state, setState] = useState<StartupState>(shouldShow ? 'playing' : 'complete');
  const [elapsedMs, setElapsedMs] = useState(0);
  const [canSkip, setCanSkip] = useState(false);

  const startTimeRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const completedRef = useRef(false);

  const finish = useCallback((reason: StartupState) => {
    if (completedRef.current) return;
    completedRef.current = true;
    cancelAnimationFrame(rafRef.current);
    setState(reason);
    markStartupSeen();
    if (variant === 'first-launch') {
      markFirstLaunchComplete();
    }
    onComplete?.();
  }, [variant, onComplete]);

  const skip = useCallback(() => {
    finish('skipped');
  }, [finish]);

  // Animation frame loop for elapsed time tracking
  useEffect(() => {
    if (!shouldShow || state !== 'playing') return;

    startTimeRef.current = performance.now();

    function tick() {
      const elapsed = performance.now() - startTimeRef.current;
      setElapsedMs(elapsed);

      // Enable skip after skipAfter threshold
      if (elapsed >= config.skipAfter) {
        setCanSkip(true);
      }

      // Auto-complete when total duration reached
      if (elapsed >= config.totalDuration) {
        finish('complete');
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [shouldShow, state, config.skipAfter, config.totalDuration, finish]);

  return {
    state,
    config,
    variant,
    elapsedMs,
    canSkip,
    skip,
    shouldShow,
  };
}
