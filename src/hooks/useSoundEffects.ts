/**
 * useSoundEffects — global sound effects system using Web Audio API.
 * Respects the sound toggle in Settings (localStorage).
 * All sounds are generated programmatically — no external audio files.
 */
import { useCallback, useRef } from 'react';

const SOUND_KEY = 'klf-sound-enabled';

function isSoundEnabled(): boolean {
  return localStorage.getItem(SOUND_KEY) !== 'false';
}

let _audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!_audioCtx) _audioCtx = new AudioContext();
  if (_audioCtx.state === 'suspended') _audioCtx.resume();
  return _audioCtx;
}

function playTone(freq: number, duration: number, type: OscillatorType = 'sine', vol = 0.2) {
  if (!isSoundEnabled()) return;
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch { /* ignore audio errors */ }
}

/** Soft click/pop sound */
function playClick() {
  playTone(600, 0.06, 'sine', 0.15);
}

/** Cheerful correct answer chime (C-E-G ascending) */
function playCorrect() {
  if (!isSoundEnabled()) return;
  const ctx = getCtx();
  const now = ctx.currentTime;
  [523.25, 659.25, 783.99].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + i * 0.12);
    gain.gain.setValueAtTime(0.25, now + i * 0.12);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + i * 0.12);
    osc.stop(now + i * 0.12 + 0.3);
  });
}

/** Gentle wrong answer sound (descending B-Bb) */
function playWrong() {
  if (!isSoundEnabled()) return;
  const ctx = getCtx();
  const now = ctx.currentTime;
  [400, 340].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + i * 0.15);
    gain.gain.setValueAtTime(0.15, now + i * 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + i * 0.15);
    osc.stop(now + i * 0.15 + 0.25);
  });
}

/** Star collected sparkle */
function playStar() {
  if (!isSoundEnabled()) return;
  const ctx = getCtx();
  const now = ctx.currentTime;
  [1200, 1500, 1800].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + i * 0.06);
    gain.gain.setValueAtTime(0.18, now + i * 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + i * 0.06);
    osc.stop(now + i * 0.06 + 0.15);
  });
}

/** Badge earned fanfare (C-E-G-C ascending) */
function playFanfare() {
  if (!isSoundEnabled()) return;
  const ctx = getCtx();
  const now = ctx.currentTime;
  [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = i < 3 ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(freq, now + i * 0.15);
    gain.gain.setValueAtTime(0.2, now + i * 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + i * 0.15);
    osc.stop(now + i * 0.15 + 0.5);
  });
}

/** Level up celebration (ascending scale with harmony) */
function playLevelUp() {
  if (!isSoundEnabled()) return;
  const ctx = getCtx();
  const now = ctx.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5];
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = i < 4 ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(freq, now + i * 0.1);
    gain.gain.setValueAtTime(0.22, now + i * 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + i * 0.1);
    osc.stop(now + i * 0.1 + 0.4);
  });
}

/** Quest completed upbeat sound */
function playQuestComplete() {
  if (!isSoundEnabled()) return;
  playCorrect();
  setTimeout(() => playStar(), 300);
}

export function useSoundEffects() {
  return {
    playClick: useCallback(playClick, []),
    playCorrect: useCallback(playCorrect, []),
    playWrong: useCallback(playWrong, []),
    playStar: useCallback(playStar, []),
    playFanfare: useCallback(playFanfare, []),
    playLevelUp: useCallback(playLevelUp, []),
    playQuestComplete: useCallback(playQuestComplete, []),
    isSoundEnabled,
    toggleSound: useCallback(() => {
      const current = isSoundEnabled();
      localStorage.setItem(SOUND_KEY, current ? 'false' : 'true');
      return !current;
    }, []),
  };
}
