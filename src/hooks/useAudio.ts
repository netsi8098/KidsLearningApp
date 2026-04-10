import { useCallback, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import type { VoiceProfileId } from '../voice/voiceProfiles';
import { aiSpeak, stopSpeaking as stopAISpeaking, getSelectedAIVoice } from '../services/ttsService';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.3) {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, ctx.currentTime);
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

function playCorrectSound() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  [523.25, 659.25, 783.99].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + i * 0.12);
    gain.gain.setValueAtTime(0.3, now + i * 0.12);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + i * 0.12);
    osc.stop(now + i * 0.12 + 0.3);
  });
}

function playTryAgainSound() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  [400, 340].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + i * 0.15);
    gain.gain.setValueAtTime(0.2, now + i * 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + i * 0.15);
    osc.stop(now + i * 0.15 + 0.25);
  });
}

function playCelebrationSound() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5];
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = i < 4 ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(freq, now + i * 0.1);
    gain.gain.setValueAtTime(0.25, now + i * 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + i * 0.1);
    osc.stop(now + i * 0.1 + 0.4);
  });
}

function playClickSound() {
  playTone(800, 0.05, 'square', 0.15);
}

function playStarSound() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  [1200, 1500, 1800].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + i * 0.06);
    gain.gain.setValueAtTime(0.2, now + i * 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + i * 0.06);
    osc.stop(now + i * 0.06 + 0.15);
  });
}

// ── Voice helpers (used by SettingsPage voice picker) ─────────────────────

/** Set a user-chosen browser voice by name (for Settings UI). */
export function setPreferredVoice(name: string | null) {
  if (name) {
    localStorage.setItem('klf-preferred-voice', name);
  } else {
    localStorage.removeItem('klf-preferred-voice');
  }
}

/** Get all available English voices for a picker UI. */
export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (!('speechSynthesis' in window)) return [];
  return window.speechSynthesis.getVoices().filter((v) => v.lang.startsWith('en'));
}

/** Get the currently active voice name. */
export function getActiveVoiceName(): string {
  const saved = localStorage.getItem('klf-preferred-voice');
  if (saved) return saved;
  if (!('speechSynthesis' in window)) return 'Default';
  const voices = window.speechSynthesis.getVoices().filter((v) => v.lang.startsWith('en'));
  return voices[0]?.name ?? 'Default';
}

export function useAudio() {
  const { soundEnabled, speechEnabled, currentPlayer } = useApp();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = useCallback((text: string, _profileOrRate: VoiceProfileId | number = 'narrator') => {
    if (!speechEnabled) return;

    // Stop any current speech
    stopAISpeaking();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();

    // Use the TTS service — it handles Edge TTS server → browser fallback automatically
    // Both paths use the selected AI voice preset (kids/girl/boy/teacher/storyteller/fun)
    const selectedVoice = getSelectedAIVoice();
    aiSpeak(text, selectedVoice);
  }, [speechEnabled]);

  const playCorrect = useCallback(() => { if (soundEnabled) try { playCorrectSound(); } catch {} }, [soundEnabled]);
  const playTryAgain = useCallback(() => { if (soundEnabled) try { playTryAgainSound(); } catch {} }, [soundEnabled]);
  const playCelebration = useCallback(() => { if (soundEnabled) try { playCelebrationSound(); } catch {} }, [soundEnabled]);
  const playClick = useCallback(() => { if (soundEnabled) try { playClickSound(); } catch {} }, [soundEnabled]);
  const playStar = useCallback(() => { if (soundEnabled) try { playStarSound(); } catch {} }, [soundEnabled]);

  return { speak, playCorrect, playTryAgain, playCelebration, playClick, playStar };
}
