// ─── Sing-Along Playback & Sync Hook ───────────────────────────────────────
// Manages simulated playback timing, beat pulse, and vocal mode for the
// sing-along player. Uses requestAnimationFrame for frame-accurate sync.

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  type SingAlongSong,
  type SongSection,
  type LyricLine,
  type LyricWord,
  type VocalMode,
  getSongDurationMs,
  getSectionAtTime,
  getLineAtTime,
  getWordAtTime,
} from './singAlongData';

export interface SingAlongState {
  isPlaying: boolean;
  currentTime: number; // ms
  currentSection: SongSection | null;
  currentLine: LyricLine | null;
  currentWord: LyricWord | null;
  vocalMode: VocalMode;
  play: () => void;
  pause: () => void;
  seek: (timeMs: number) => void;
  setVocalMode: (mode: VocalMode) => void;
  restart: () => void;
  progress: number; // 0-1
  beatPulse: boolean; // toggles on each beat for visual sync
  isWaitingForResponse: boolean; // lead-repeat pause state
  confirmResponse: () => void; // "I sang it!" handler
}

export function useSingAlong(song: SingAlongSong): SingAlongState {
  const totalDurationMs = getSongDurationMs(song);
  const beatIntervalMs = (60 / song.bpm) * 1000;

  // Core state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [vocalMode, setVocalMode] = useState<VocalMode>(song.vocalModes[0] ?? 'full');
  const [beatPulse, setBeatPulse] = useState(false);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);

  // Refs for rAF loop
  const rafRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);
  const accumulatedTimeRef = useRef<number>(0);
  const lastBeatRef = useRef<number>(0);
  const isPlayingRef = useRef(false);
  const waitingRef = useRef(false);

  // Keep refs in sync
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    waitingRef.current = isWaitingForResponse;
  }, [isWaitingForResponse]);

  // Derived state
  const currentSection = getSectionAtTime(song, currentTime);
  const currentLine = getLineAtTime(song, currentTime);
  const currentWord = currentLine ? getWordAtTime(currentLine, currentTime) : null;
  const progress = totalDurationMs > 0 ? Math.min(currentTime / totalDurationMs, 1) : 0;

  // ─── rAF loop ────────────────────────────────────────────────────────────
  const tick = useCallback(
    (timestamp: number) => {
      if (!isPlayingRef.current || waitingRef.current) {
        rafRef.current = requestAnimationFrame(tick);
        lastFrameTimeRef.current = timestamp;
        return;
      }

      const delta = lastFrameTimeRef.current > 0 ? timestamp - lastFrameTimeRef.current : 0;
      lastFrameTimeRef.current = timestamp;

      // Clamp delta to prevent jumps on tab re-focus
      const clampedDelta = Math.min(delta, 100);
      accumulatedTimeRef.current += clampedDelta;
      const newTime = accumulatedTimeRef.current;

      // Beat pulse
      const currentBeat = Math.floor(newTime / beatIntervalMs);
      if (currentBeat !== lastBeatRef.current) {
        lastBeatRef.current = currentBeat;
        setBeatPulse((prev) => !prev);
      }

      // Check if we need to pause for lead-repeat mode
      if (vocalMode === 'lead-repeat') {
        const allLines = song.sections.flatMap((s) => s.lines);
        for (const line of allLines) {
          if (
            line.isCallAndResponse &&
            newTime >= line.endTime &&
            newTime < line.endTime + clampedDelta + 50 // just crossed the boundary
          ) {
            setIsWaitingForResponse(true);
            accumulatedTimeRef.current = line.endTime;
            setCurrentTime(line.endTime);
            rafRef.current = requestAnimationFrame(tick);
            return;
          }
        }
      }

      // Check completion
      if (newTime >= totalDurationMs) {
        accumulatedTimeRef.current = totalDurationMs;
        setCurrentTime(totalDurationMs);
        setIsPlaying(false);
        isPlayingRef.current = false;
        return;
      }

      setCurrentTime(newTime);
      rafRef.current = requestAnimationFrame(tick);
    },
    [song, beatIntervalMs, totalDurationMs, vocalMode],
  );

  // ─── Start / stop the loop ──────────────────────────────────────────────
  useEffect(() => {
    if (isPlaying) {
      lastFrameTimeRef.current = 0;
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isPlaying, tick]);

  // ─── Controls ────────────────────────────────────────────────────────────
  const play = useCallback(() => {
    if (accumulatedTimeRef.current >= totalDurationMs) {
      // If at end, restart
      accumulatedTimeRef.current = 0;
      setCurrentTime(0);
      lastBeatRef.current = 0;
    }
    lastFrameTimeRef.current = 0;
    setIsPlaying(true);
    isPlayingRef.current = true;
  }, [totalDurationMs]);

  const pause = useCallback(() => {
    setIsPlaying(false);
    isPlayingRef.current = false;
  }, []);

  const seek = useCallback(
    (timeMs: number) => {
      const clamped = Math.max(0, Math.min(timeMs, totalDurationMs));
      accumulatedTimeRef.current = clamped;
      setCurrentTime(clamped);
      lastBeatRef.current = Math.floor(clamped / beatIntervalMs);
      setIsWaitingForResponse(false);
    },
    [totalDurationMs, beatIntervalMs],
  );

  const restart = useCallback(() => {
    accumulatedTimeRef.current = 0;
    lastBeatRef.current = 0;
    lastFrameTimeRef.current = 0;
    setCurrentTime(0);
    setIsWaitingForResponse(false);
    setIsPlaying(true);
    isPlayingRef.current = true;
  }, []);

  const confirmResponse = useCallback(() => {
    setIsWaitingForResponse(false);
    waitingRef.current = false;
  }, []);

  const handleSetVocalMode = useCallback(
    (mode: VocalMode) => {
      if (song.vocalModes.includes(mode)) {
        setVocalMode(mode);
      }
    },
    [song.vocalModes],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return {
    isPlaying,
    currentTime,
    currentSection,
    currentLine,
    currentWord,
    vocalMode,
    play,
    pause,
    seek,
    setVocalMode: handleSetVocalMode,
    restart,
    progress,
    beatPulse,
    isWaitingForResponse,
    confirmResponse,
  };
}
