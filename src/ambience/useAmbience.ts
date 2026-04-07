// ── useAmbience Hook ──────────────────────────────────────────────────────
// Manages ambient state: current scene, intensity, and audio integration.
// Auto-detects the appropriate scene based on the current route and
// bedtime state. Provides controls for intensity and audio toggling.

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  type AmbienceScene,
  getScene,
  detectSceneForRoute,
} from './ambienceScenes';

// ── Types ─────────────────────────────────────────────────────────────────

export type AmbienceIntensity = 'subtle' | 'normal' | 'vivid';

export interface AmbienceState {
  /** The current active scene configuration. */
  currentScene: AmbienceScene;
  /** Set the scene manually by ID. Overrides auto-detection until the route changes. */
  setScene: (sceneId: string) => void;
  /** Current visual intensity level. */
  intensity: AmbienceIntensity;
  /** Set the visual intensity. */
  setIntensity: (level: AmbienceIntensity) => void;
  /** Whether ambient audio is currently enabled. */
  isAudioPlaying: boolean;
  /** Toggle ambient audio on/off. */
  toggleAudio: () => void;
  /** Auto-detect the best scene for the current context. Returns the scene ID. */
  autoDetectScene: () => string;
  /** Whether the scene is being manually overridden (not auto-detected). */
  isManualOverride: boolean;
  /** Clear manual override and revert to auto-detection. */
  clearOverride: () => void;
}

// ── Hook Implementation ───────────────────────────────────────────────────

export function useAmbience(): AmbienceState {
  const { bedtimeMode, soundEnabled } = useApp();

  // Try to get the current route. If not inside a Router, default to '/'.
  let pathname = '/';
  try {
    const location = useLocation();
    pathname = location.pathname;
  } catch {
    // Not inside a Router -- use default
  }

  // Auto-detected scene ID
  const autoSceneId = useMemo(
    () => detectSceneForRoute(pathname, bedtimeMode),
    [pathname, bedtimeMode],
  );

  // Manual override state
  const [manualSceneId, setManualSceneId] = useState<string | null>(null);
  const [intensity, setIntensityState] = useState<AmbienceIntensity>('subtle');
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Effective scene ID: manual override takes precedence, bedtime always wins
  const effectiveSceneId = bedtimeMode
    ? 'bedtime'
    : manualSceneId ?? autoSceneId;

  const currentScene = useMemo(
    () => getScene(effectiveSceneId),
    [effectiveSceneId],
  );

  // Clear manual override when route changes
  useEffect(() => {
    setManualSceneId(null);
  }, [pathname]);

  // Auto-reduce intensity in bedtime mode
  useEffect(() => {
    if (bedtimeMode) {
      setIntensityState('subtle');
    }
  }, [bedtimeMode]);

  // Stop audio when sound is globally disabled
  useEffect(() => {
    if (!soundEnabled) {
      setIsAudioPlaying(false);
    }
  }, [soundEnabled]);

  // ── Actions ─────────────────────────────────────────────────────────

  const setScene = useCallback((sceneId: string) => {
    setManualSceneId(sceneId);
  }, []);

  const setIntensity = useCallback((level: AmbienceIntensity) => {
    // Bedtime mode caps intensity at 'subtle'
    if (bedtimeMode && level !== 'subtle') {
      setIntensityState('subtle');
      return;
    }
    setIntensityState(level);
  }, [bedtimeMode]);

  const toggleAudio = useCallback(() => {
    if (!soundEnabled) return;
    setIsAudioPlaying((prev) => !prev);
  }, [soundEnabled]);

  const autoDetectScene = useCallback((): string => {
    return detectSceneForRoute(pathname, bedtimeMode);
  }, [pathname, bedtimeMode]);

  const clearOverride = useCallback(() => {
    setManualSceneId(null);
  }, []);

  return {
    currentScene,
    setScene,
    intensity,
    setIntensity,
    isAudioPlaying,
    toggleAudio,
    autoDetectScene,
    isManualOverride: manualSceneId !== null,
    clearOverride,
  };
}
