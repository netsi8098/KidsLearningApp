import { useCallback, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { getVoiceProfile } from '../voice/voiceProfiles';
import type { VoiceProfileId } from '../voice/voiceProfiles';
import { ageGroupRules, type SpeechAgeGroup } from '../voice/speechRules';
import { aiSpeak, checkTTSServer, stopSpeaking as stopAISpeaking, getSelectedAIVoice } from '../services/ttsService';

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

// ── Premium Voice Selection ───────────────────────────────────────────────
// Prefer enhanced/premium voices that sound more natural and human-like.
// macOS offers "Enhanced" and "Premium" variants; iOS/Chrome have their own.

let _cachedVoice: SpeechSynthesisVoice | null = null;
let _voicesLoaded = false;
let _userVoiceName: string | null = null;

/** Ranked voice name fragments — earlier = higher priority. */
const VOICE_PREFERENCE = [
  // macOS/iOS premium voices (most human-like)
  'Samantha (Enhanced)',
  'Samantha (Premium)',
  'Karen (Enhanced)',
  'Karen (Premium)',
  'Zoe (Enhanced)',
  'Zoe (Premium)',
  'Ava (Enhanced)',
  'Ava (Premium)',
  'Siri',
  // Standard macOS voices (still good quality)
  'Samantha',
  'Karen',
  'Zoe',
  'Ava',
  'Allison',
  // Chrome / Android
  'Google US English',
  'Google UK English Female',
  // Windows
  'Microsoft Zira',
  'Microsoft Jenny',
];

function selectBestVoice(): SpeechSynthesisVoice | null {
  if (!('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  // If user has manually selected a voice, use that
  if (_userVoiceName) {
    const userPick = voices.find((v) => v.name === _userVoiceName);
    if (userPick) return userPick;
  }

  // Try each preferred voice name in priority order
  for (const pref of VOICE_PREFERENCE) {
    const match = voices.find((v) => v.name.includes(pref) && v.lang.startsWith('en'));
    if (match) return match;
  }

  // Fallback: any English voice
  return voices.find((v) => v.lang.startsWith('en')) ?? voices[0] ?? null;
}

function getBestVoice(): SpeechSynthesisVoice | null {
  if (_cachedVoice && _voicesLoaded) return _cachedVoice;
  _cachedVoice = selectBestVoice();
  _voicesLoaded = _cachedVoice !== null;
  return _cachedVoice;
}

/** Set a user-chosen voice by name (persists to localStorage). */
export function setPreferredVoice(name: string | null) {
  _userVoiceName = name;
  _voicesLoaded = false;
  _cachedVoice = null;
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
  const voice = getBestVoice();
  return voice?.name ?? 'Default';
}

// Load saved voice preference
if (typeof window !== 'undefined') {
  _userVoiceName = localStorage.getItem('klf-preferred-voice');
}

// Pre-load voices (some browsers load them asynchronously)
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  getBestVoice();
  window.speechSynthesis.addEventListener?.('voiceschanged', () => {
    _voicesLoaded = false;
    _cachedVoice = null;
    getBestVoice();
  });
}

// ── Natural Speech Engine ────────────────────────────────────────────────
// Splits text into natural phrases and speaks them sequentially with
// subtle pitch/rate variation and pauses — dramatically reduces the
// robotic monotone of basic TTS voices.

/**
 * Split text into natural speech phrases at sentence boundaries,
 * commas, conjunctions, and clause breaks.
 */
function splitIntoPhrases(text: string): string[] {
  // Split on sentence endings, keeping the punctuation
  const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [text];

  const phrases: string[] = [];
  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;

    // For short sentences (< 8 words), keep as one phrase
    if (trimmed.split(/\s+/).length < 8) {
      phrases.push(trimmed);
      continue;
    }

    // Split longer sentences at commas, semicolons, dashes, and conjunctions
    const subPhrases = trimmed.split(/(?<=[,;:–—])\s+|(?:\s+(?:and|but|or|then|so|because)\s+)/i);
    for (const sp of subPhrases) {
      const t = sp.trim();
      if (t) phrases.push(t);
    }
  }

  return phrases.length > 0 ? phrases : [text];
}

/**
 * Speak phrases sequentially with natural variation.
 * Each phrase gets a slight pitch/rate wobble and a pause between them.
 */
function speakNatural(
  text: string,
  voice: SpeechSynthesisVoice | null,
  baseRate: number,
  basePitch: number,
  volume: number,
  lang: string,
): void {
  const phrases = splitIntoPhrases(text);

  // For single short phrases, just speak directly with no splitting
  if (phrases.length === 1 && phrases[0].split(/\s+/).length < 5) {
    const utter = new SpeechSynthesisUtterance(phrases[0]);
    utter.rate = baseRate;
    utter.pitch = basePitch;
    utter.volume = volume;
    utter.lang = lang;
    if (voice) utter.voice = voice;
    window.speechSynthesis.speak(utter);
    return;
  }

  phrases.forEach((phrase, i) => {
    const utter = new SpeechSynthesisUtterance(phrase);

    // Natural variation: slight wobble per phrase (±5% rate, ±3% pitch)
    const rateWobble = 1 + (Math.random() * 0.10 - 0.05);
    const pitchWobble = (Math.random() * 0.06 - 0.03);

    utter.rate = Math.max(0.5, Math.min(2.0, baseRate * rateWobble));
    utter.pitch = Math.max(0, Math.min(2.0, basePitch + pitchWobble));
    utter.volume = volume;
    utter.lang = lang;
    if (voice) utter.voice = voice;

    // Last phrase: slightly lower pitch (natural sentence-ending drop)
    if (i === phrases.length - 1 && phrases.length > 1) {
      utter.pitch = Math.max(0, basePitch - 0.08);
      utter.rate = Math.max(0.5, baseRate * 0.95); // slight slowdown at end
    }

    // Questions: raise pitch on last phrase
    if (phrase.trim().endsWith('?')) {
      utter.pitch = Math.min(2.0, basePitch + 0.12);
    }

    // Exclamations: slightly faster, brighter
    if (phrase.trim().endsWith('!')) {
      utter.pitch = Math.min(2.0, basePitch + 0.06);
      utter.rate = Math.min(2.0, baseRate * 1.04);
    }

    window.speechSynthesis.speak(utter);
  });
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

  const speak = useCallback((text: string, profileOrRate: VoiceProfileId | number = 'narrator') => {
    const profileId: VoiceProfileId = typeof profileOrRate === 'number' ? 'narrator' : profileOrRate;
    if (!speechEnabled) return;

    // Stop any current speech
    stopAISpeaking();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();

    // Try AI voice server first, fall back to browser speech
    const selectedVoice = getSelectedAIVoice();
    checkTTSServer().then((serverUp) => {
      if (serverUp) {
        aiSpeak(text, selectedVoice);
      } else {
        // Fallback to browser SpeechSynthesis
        if (!('speechSynthesis' in window)) return;

        const profile = getVoiceProfile(profileId);
        let rate = profile.ttsHints.rate;
        let pitch = profile.ttsHints.pitch;
        const volume = profile.ttsHints.volume;
        const lang = profile.ttsHints.lang;

        const ageGroup = (currentPlayer?.ageGroup ?? '4-5') as SpeechAgeGroup;
        const ageRules = ageGroupRules[ageGroup];
        if (ageRules) {
          rate *= ageRules.rateMultiplier;
          pitch += ageRules.pitchOffset;
          rate = Math.max(0.5, Math.min(2.0, rate));
          pitch = Math.max(0, Math.min(2.0, pitch));
        }

        const voice = getBestVoice();
        speakNatural(text, voice, rate, pitch, volume, lang);
      }
    });
  }, [speechEnabled, currentPlayer?.ageGroup]);

  const playCorrect = useCallback(() => { if (soundEnabled) try { playCorrectSound(); } catch {} }, [soundEnabled]);
  const playTryAgain = useCallback(() => { if (soundEnabled) try { playTryAgainSound(); } catch {} }, [soundEnabled]);
  const playCelebration = useCallback(() => { if (soundEnabled) try { playCelebrationSound(); } catch {} }, [soundEnabled]);
  const playClick = useCallback(() => { if (soundEnabled) try { playClickSound(); } catch {} }, [soundEnabled]);
  const playStar = useCallback(() => { if (soundEnabled) try { playStarSound(); } catch {} }, [soundEnabled]);

  return { speak, playCorrect, playTryAgain, playCelebration, playClick, playStar };
}
