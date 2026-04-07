/**
 * TTS Service — connects to the local AI voice server (tts-server.py)
 * Falls back to browser SpeechSynthesis if server is unavailable.
 */

const TTS_BASE = 'http://localhost:5555';

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

/** Check if the TTS server is running (re-checks every 30s) */
export async function checkTTSServer(): Promise<boolean> {
  if (_serverAvailable !== null && _lastCheck && Date.now() - _lastCheck < 30000) {
    return _serverAvailable;
  }
  try {
    const res = await fetch(`${TTS_BASE}/health`);
    _serverAvailable = res.ok;
  } catch {
    _serverAvailable = false;
  }
  _lastCheck = Date.now();
  return _serverAvailable;
}

let _lastCheck: number | null = null;

/** Reset server status (call if you start the server after app load) */
export function resetTTSStatus() {
  _serverAvailable = null;
}

/** Stop any currently playing speech */
export function stopSpeaking() {
  if (_currentAudio) {
    _currentAudio.pause();
    _currentAudio = null;
  }
  window.speechSynthesis?.cancel();
}

/** Speak text using the AI voice server, with browser fallback */
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
    return speakWithBrowser(text);
  }
}

/** Use the local TTS server (high quality AI voice) */
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
      // Fall back to browser TTS
      speakWithBrowser(text).then(resolve).catch(reject);
    };
    audio.play().catch(() => {
      // Autoplay blocked — fall back
      speakWithBrowser(text).then(resolve).catch(reject);
    });
  });
}

/** Fallback: browser SpeechSynthesis */
function speakWithBrowser(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) {
      resolve();
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
}
