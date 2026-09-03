/**
 * video-forge configuration.
 *
 * Single source of truth for the generation pipeline. Every stage reads from
 * here rather than hardcoding paths or tuning values, so a change to frame
 * rate or output size ripples through render + mux consistently.
 */
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));

/** Repo root (two levels up from tools/video-forge). */
export const REPO_ROOT = path.resolve(here, '../..');

export const paths = {
  root: REPO_ROOT,
  forge: here,
  /** Intermediate artifacts — scripts, audio, frames. Git-ignored. */
  work: path.join(here, '.work'),
  /** The HTML scene renderer loaded by Playwright. */
  scene: path.join(here, 'scene', 'scene.html'),
  /** Finished videos served by the app. */
  publicVideos: path.join(REPO_ROOT, 'public', 'videos'),
  /** Generated manifest the app imports. */
  manifest: path.join(REPO_ROOT, 'src', 'data', 'generatedVideos.ts'),
};

export const video = {
  width: 1280,
  height: 720,
  /** 24fps keeps frame count (and render time) sane while staying smooth. */
  fps: 24,
  /** Silence inserted between spoken lines so kids can process each beat. */
  beatPaddingMs: 600,
  /** Extra hold after an interaction prompt, giving a child time to answer. */
  answerWaitMs: 3500,
};

/**
 * Mascot host → edge-tts voice. Character IDs match src/mascot definitions
 * ('leo', 'daisy', 'ollie', 'ruby', 'finn'); the voice ids are the presets
 * already used by tts-server.py so narration matches the in-app voice.
 */
export const hostVoices = {
  leo: 'en-US-AndrewMultilingualNeural',
  daisy: 'en-US-AvaMultilingualNeural',
  ollie: 'en-US-JennyNeural',
  ruby: 'en-US-EmmaMultilingualNeural',
  finn: 'en-US-AriaNeural',
};

export const DEFAULT_VOICE = 'en-US-AnaNeural';

/** Per-host palette so a generated episode looks like its character. */
export const hostThemes = {
  leo:   { primary: '#FFB347', accent: '#FF6B6B', sky: '#FFF4E0', name: 'Leo Lion',    animal: '🦁' },
  daisy: { primary: '#F472B6', accent: '#A78BFA', sky: '#FDF2F8', name: 'Daisy Deer',  animal: '🦌' },
  ollie: { primary: '#6366F1', accent: '#4ECDC4', sky: '#EEF2FF', name: 'Ollie Owl',   animal: '🦉' },
  ruby:  { primary: '#FF6B6B', accent: '#FFB347', sky: '#FFF1F1', name: 'Ruby Rabbit', animal: '🐰' },
  finn:  { primary: '#4ECDC4', accent: '#6BCB77', sky: '#ECFEFF', name: 'Finn Fox',    animal: '🦊' },
};

/** Age band → pacing and vocabulary rules handed to the script generator. */
export const agePresets = {
  '2-3': { maxWordsPerLine: 12, targetSegments: 7,  speechRate: '-18%', teachCount: 2 },
  '4-5': { maxWordsPerLine: 18, targetSegments: 9,  speechRate: '-10%', teachCount: 3 },
  '6-8': { maxWordsPerLine: 26, targetSegments: 11, speechRate: '-4%',  teachCount: 4 },
};
