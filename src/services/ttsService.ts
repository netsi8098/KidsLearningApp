/**
 * TTS Service — Enhanced speech synthesis for Kids Learning Fun
 *
 * Priority order:
 * 1. Local AI voice server (tts-server.py with Edge TTS) — best quality
 * 2. Web Speech API with natural speech engine — phrase splitting,
 *    pitch/rate variation, premium voice selection
 *
 * The natural speech engine makes browser TTS sound significantly better
 * by splitting text into phrases and adding prosody variation.
 */

const TTS_URLS = [
  'http://localhost:5555',
  'https://grip-waves-thrown-berkeley.trycloudflare.com',
];
let TTS_BASE = TTS_URLS[0];

export type VoicePreset = 'kids' | 'boy' | 'girl' | 'teacher' | 'storyteller' | 'fun';

const AI_VOICE_STORAGE_KEY = 'kids-app-ai-voice';

/** Get the user's selected AI voice from localStorage */
export function getSelectedAIVoice(): VoicePreset {
  return (localStorage.getItem(AI_VOICE_STORAGE_KEY) as VoicePreset) || 'kids';
}

/** Save the user's selected AI voice */
export function setSelectedAIVoice(voice: VoicePreset): void {
  localStorage.setItem(AI_VOICE_STORAGE_KEY, voice);
}

let _serverAvailable: boolean | null = null;
let _currentAudio: HTMLAudioElement | null = null;
let _lastCheck: number | null = null;
let _speakingPromiseReject: (() => void) | null = null;

/** Check if the TTS server is running (caches for 60s to reduce latency) */
export async function checkTTSServer(): Promise<boolean> {
  if (_serverAvailable !== null && _lastCheck && Date.now() - _lastCheck < 60000) {
    return _serverAvailable;
  }

  for (const url of TTS_URLS) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1200); // faster timeout
      const res = await fetch(`${url}/health`, { signal: controller.signal });
      clearTimeout(timeout);
      if (res.ok) {
        TTS_BASE = url;
        _serverAvailable = true;
        _lastCheck = Date.now();
        return true;
      }
    } catch {
      // Try next URL
    }
  }

  _serverAvailable = false;
  _lastCheck = Date.now();
  return false;
}

/** Reset server status (call if you start the server after app load) */
export function resetTTSStatus() {
  _serverAvailable = null;
  _lastCheck = null;
}

/** Stop any currently playing speech */
export function stopSpeaking() {
  if (_currentAudio) {
    _currentAudio.pause();
    _currentAudio = null;
  }
  if (_speakingPromiseReject) {
    _speakingPromiseReject();
    _speakingPromiseReject = null;
  }
  window.speechSynthesis?.cancel();
}

// ── Voice Preset → Speech Parameters mapping ───────────────────────────
// Maps AI voice presets to Web Speech API parameters for consistent
// personality across both server and browser modes.

interface BrowserVoiceParams {
  rate: number;
  pitch: number;
  /** Preferred voice name fragments (tried in order) */
  preferredVoices: string[];
}

const VOICE_PARAMS: Record<VoicePreset, BrowserVoiceParams> = {
  kids: {
    rate: 0.88,
    pitch: 1.2,
    preferredVoices: ['Samantha', 'Zoe', 'Karen', 'Google US English', 'Microsoft Jenny'],
  },
  girl: {
    rate: 0.9,
    pitch: 1.15,
    preferredVoices: ['Samantha', 'Ava', 'Zoe', 'Google US English', 'Microsoft Jenny'],
  },
  boy: {
    rate: 0.92,
    pitch: 1.0,
    preferredVoices: ['Daniel', 'Alex', 'Tom', 'Google US English', 'Microsoft David'],
  },
  teacher: {
    rate: 0.85,
    pitch: 1.05,
    preferredVoices: ['Karen', 'Samantha', 'Ava', 'Google UK English Female', 'Microsoft Zira'],
  },
  storyteller: {
    rate: 0.82,
    pitch: 1.1,
    preferredVoices: ['Samantha (Enhanced)', 'Samantha (Premium)', 'Karen', 'Ava', 'Google US English'],
  },
  fun: {
    rate: 0.95,
    pitch: 1.25,
    preferredVoices: ['Samantha', 'Zoe', 'Google US English', 'Microsoft Jenny'],
  },
};

// ── Premium Voice Selection ─────────────────────────────────────────────

let _cachedVoices: Map<string, SpeechSynthesisVoice> = new Map();
let _voicesLoaded = false;

function loadVoices() {
  if (!('speechSynthesis' in window)) return;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return;
  _cachedVoices.clear();
  for (const v of voices) {
    if (v.lang.startsWith('en')) {
      _cachedVoices.set(v.name, v);
    }
  }
  _voicesLoaded = true;
}

// Load voices (some browsers fire this async)
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoices();
  window.speechSynthesis.addEventListener?.('voiceschanged', loadVoices);
}

function selectVoiceForPreset(preset: VoicePreset): SpeechSynthesisVoice | null {
  if (!_voicesLoaded) loadVoices();
  const params = VOICE_PARAMS[preset];

  // Try enhanced/premium variants first
  for (const name of params.preferredVoices) {
    for (const suffix of [' (Premium)', ' (Enhanced)', '']) {
      const match = _cachedVoices.get(name + suffix);
      if (match) return match;
    }
    // Partial match
    for (const [vName, voice] of _cachedVoices) {
      if (vName.includes(name)) return voice;
    }
  }

  // Fallback: any English voice
  const first = _cachedVoices.values().next();
  return first.done ? null : first.value;
}

// ── Natural Phrase Splitting ────────────────────────────────────────────

function splitIntoPhrases(text: string): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [text];
  const phrases: string[] = [];

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;

    if (trimmed.split(/\s+/).length < 8) {
      phrases.push(trimmed);
      continue;
    }

    const subPhrases = trimmed.split(/(?<=[,;:–—])\s+|(?:\s+(?:and|but|or|then|so|because)\s+)/i);
    for (const sp of subPhrases) {
      const t = sp.trim();
      if (t) phrases.push(t);
    }
  }

  return phrases.length > 0 ? phrases : [text];
}

// Proactive health check on module load — so first speak call is instant
if (typeof window !== 'undefined') {
  setTimeout(() => checkTTSServer(), 1000);
}

// ── Core Speaking Functions ─────────────────────────────────────────────

/** Speak text using the AI voice server, with enhanced browser fallback */
export async function aiSpeak(
  text: string,
  voice: VoicePreset = 'kids',
  rate: string = '+0%',
  pitch: string = '+0Hz'
): Promise<void> {
  stopSpeaking();
  if (!text.trim()) return;

  const serverUp = await checkTTSServer();

  if (serverUp) {
    return speakWithServer(text, voice, rate, pitch);
  } else {
    return speakNatural(text, voice);
  }
}

/** Use the local TTS server (highest quality AI voice) */
function speakWithServer(
  text: string,
  voice: VoicePreset,
  rate: string,
  pitch: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({ text, voice, rate, pitch });
    const url = `${TTS_BASE}/tts?${params}`;

    const audio = new Audio(url);
    _currentAudio = audio;

    audio.onended = () => {
      _currentAudio = null;
      resolve();
    };
    audio.onerror = () => {
      _currentAudio = null;
      // Fall back to natural browser speech
      speakNatural(text, voice).then(resolve).catch(reject);
    };
    audio.play().catch(() => {
      speakNatural(text, voice).then(resolve).catch(reject);
    });
  });
}

/**
 * Enhanced browser SpeechSynthesis with natural prosody.
 * Splits text into phrases and speaks them with pitch/rate variation,
 * question intonation, and sentence-ending pitch drops.
 */
function speakNatural(text: string, preset: VoicePreset): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      resolve();
      return;
    }

    // Allow cancellation
    _speakingPromiseReject = () => reject(new Error('cancelled'));

    const params = VOICE_PARAMS[preset];
    const voice = selectVoiceForPreset(preset);
    const phrases = splitIntoPhrases(text);

    // For single short phrase, speak directly
    if (phrases.length === 1 && phrases[0].split(/\s+/).length < 5) {
      const utter = new SpeechSynthesisUtterance(phrases[0]);
      utter.rate = params.rate;
      utter.pitch = params.pitch;
      utter.volume = 1.0;
      utter.lang = 'en-US';
      if (voice) utter.voice = voice;
      utter.onend = () => {
        _speakingPromiseReject = null;
        resolve();
      };
      utter.onerror = () => {
        _speakingPromiseReject = null;
        resolve();
      };
      window.speechSynthesis.speak(utter);
      return;
    }

    // Speak phrases sequentially with natural variation
    phrases.forEach((phrase, i) => {
      const utter = new SpeechSynthesisUtterance(phrase);

      // Natural variation: slight wobble per phrase
      const rateWobble = 1 + (Math.random() * 0.10 - 0.05);
      const pitchWobble = Math.random() * 0.06 - 0.03;

      utter.rate = Math.max(0.5, Math.min(2.0, params.rate * rateWobble));
      utter.pitch = Math.max(0, Math.min(2.0, params.pitch + pitchWobble));
      utter.volume = 1.0;
      utter.lang = 'en-US';
      if (voice) utter.voice = voice;

      // Last phrase: natural sentence-ending pitch drop
      if (i === phrases.length - 1 && phrases.length > 1) {
        utter.pitch = Math.max(0, params.pitch - 0.08);
        utter.rate = Math.max(0.5, params.rate * 0.95);
      }

      // Questions: raise pitch
      if (phrase.trim().endsWith('?')) {
        utter.pitch = Math.min(2.0, params.pitch + 0.12);
      }

      // Exclamations: slightly faster, brighter
      if (phrase.trim().endsWith('!')) {
        utter.pitch = Math.min(2.0, params.pitch + 0.06);
        utter.rate = Math.min(2.0, params.rate * 1.04);
      }

      // Resolve when last phrase finishes
      if (i === phrases.length - 1) {
        utter.onend = () => {
          _speakingPromiseReject = null;
          resolve();
        };
        utter.onerror = () => {
          _speakingPromiseReject = null;
          resolve();
        };
      }

      window.speechSynthesis.speak(utter);
    });
  });
}
