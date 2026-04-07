// ── Sound Mood Boards ─────────────────────────────────────────────────────
// Musical mood profiles that define the tonal character, tempo, key,
// and energy of different activity contexts in Kids Learning Fun.
//
// Each mood board specifies a musical key (with scale as frequency ratios
// from the root), preferred waveforms, tempo, and the sound IDs that
// belong in that context. The mood boards are used by the mixer and
// ambience system to ensure sonic consistency within each mode.

import { NOTE } from './soundRegistry';

// ── Types ─────────────────────────────────────────────────────────────────

export interface MoodBoard {
  /** Unique identifier for the mood. */
  id: string;
  /** Human-readable name. */
  name: string;
  /** Description of the mood's character and feel. */
  description: string;
  /** Musical key root note name (e.g. "C major"). */
  key: string;
  /** Root frequency in Hz. */
  rootFrequency: number;
  /** Frequency ratios from the root for the scale degrees. */
  scale: number[];
  /** Beats per minute. */
  tempo: number;
  /** Energy level 1 (sleepy) to 10 (bursting). */
  energy: number;
  /** Warmth 1 (cool/clinical) to 10 (deeply warm/cozy). */
  warmth: number;
  /** Brightness 1 (dark/muted) to 10 (sparkling/bright). */
  brightness: number;
  /** Preferred oscillator waveforms for this mood. */
  preferredWaveforms: OscillatorType[];
  /** Biquad filter frequency range for this mood. */
  filterRange: { min: number; max: number };
  /** Sound registry IDs that naturally belong to this mood. */
  soundIds: string[];
}

// ── Scale Ratios ──────────────────────────────────────────────────────────
// Major scale intervals as frequency ratios (just intonation approximation):
// 1, 9/8, 5/4, 4/3, 3/2, 5/3, 15/8, 2

const MAJOR_SCALE = [1, 9 / 8, 5 / 4, 4 / 3, 3 / 2, 5 / 3, 15 / 8, 2];
const MINOR_SCALE = [1, 9 / 8, 6 / 5, 4 / 3, 3 / 2, 8 / 5, 9 / 5, 2];

// ── Mood Board Definitions ────────────────────────────────────────────────

export const moodBoards: Record<string, MoodBoard> = {

  'daytime-learning': {
    id: 'daytime-learning',
    name: 'Daytime Learning',
    description:
      'Bright, curious, and moderately paced. C major creates an open, optimistic ' +
      'foundation. Sounds are clear and encouraging without being overstimulating. ' +
      'Think of sunlight streaming through a classroom window on a spring morning.',
    key: 'C major',
    rootFrequency: NOTE.C4,
    scale: MAJOR_SCALE,
    tempo: 100,
    energy: 5,
    warmth: 7,
    brightness: 7,
    preferredWaveforms: ['sine', 'triangle'],
    filterRange: { min: 800, max: 4000 },
    soundIds: [
      'nav-tap',
      'nav-back',
      'success-small',
      'success-medium',
      'success-big',
      'error-gentle',
      'error-subtle',
      'reward-star',
      'reward-badge',
      'ambient-daytime',
      'interaction-select',
      'interaction-drag',
      'interaction-drop',
      'transition-page',
      'brand-startup',
    ],
  },

  'bedtime': {
    id: 'bedtime',
    name: 'Bedtime',
    description:
      'Very calm, deeply warm, and deliberately slow. F major with its gentle ' +
      'fourth-degree character feels like a lullaby. All sounds are filtered heavily ' +
      'to remove brightness. Volume is naturally lower. Imagine a dimly lit room ' +
      'with soft blankets and a single nightlight.',
    key: 'F major',
    rootFrequency: NOTE.F3,
    scale: MAJOR_SCALE,
    tempo: 60,
    energy: 2,
    warmth: 10,
    brightness: 2,
    preferredWaveforms: ['sine'],
    filterRange: { min: 200, max: 1200 },
    soundIds: [
      'ambient-bedtime',
      'bedtime-wind-down',
      'bedtime-twinkle',
      'story-page-turn',
      'brand-complete',
      'nav-tap',
      'nav-back',
    ],
  },

  'movement-dance': {
    id: 'movement-dance',
    name: 'Movement & Dance',
    description:
      'Energetic, rhythmic, and upbeat. G major adds brightness and drive. ' +
      'Sounds are punchier with quicker attacks and a steady rhythmic feel. ' +
      'The filter range is wider to allow more excitement. Think of a dance party ' +
      'in a colorful playground.',
    key: 'G major',
    rootFrequency: NOTE.G4,
    scale: MAJOR_SCALE,
    tempo: 120,
    energy: 8,
    warmth: 6,
    brightness: 8,
    preferredWaveforms: ['sine', 'triangle', 'sawtooth'],
    filterRange: { min: 400, max: 5000 },
    soundIds: [
      'movement-beat',
      'movement-start',
      'success-small',
      'success-medium',
      'reward-star',
      'interaction-select',
      'transition-whoosh',
    ],
  },

  'curiosity-discovery': {
    id: 'curiosity-discovery',
    name: 'Curiosity & Discovery',
    description:
      'Wonder-filled, slightly mysterious, and gently exploratory. D major ' +
      'has a noble, open quality that sparks imagination. Tempo is moderate-slow ' +
      'to give the child space to explore. Sounds have longer releases that ' +
      'ring out like questions waiting to be answered.',
    key: 'D major',
    rootFrequency: NOTE.D4,
    scale: MAJOR_SCALE,
    tempo: 90,
    energy: 4,
    warmth: 7,
    brightness: 6,
    preferredWaveforms: ['sine', 'triangle'],
    filterRange: { min: 600, max: 3500 },
    soundIds: [
      'nav-tap',
      'success-small',
      'success-medium',
      'reward-star',
      'reward-badge',
      'story-dramatic',
      'story-page-turn',
      'interaction-select',
      'interaction-drag',
      'interaction-drop',
      'transition-page',
      'ambient-daytime',
    ],
  },

  'parent-mode': {
    id: 'parent-mode',
    name: 'Parent Mode',
    description:
      'Neutral, professional, and minimal. A minor provides a mature, understated ' +
      'tonal base. Sounds are few and subtle -- parents need information feedback, ' +
      'not playful jingles. Energy is low to convey calm competence.',
    key: 'A minor',
    rootFrequency: NOTE.A4,
    scale: MINOR_SCALE,
    tempo: 80,
    energy: 3,
    warmth: 4,
    brightness: 4,
    preferredWaveforms: ['sine'],
    filterRange: { min: 500, max: 2500 },
    soundIds: [
      'nav-tap',
      'nav-back',
      'interaction-select',
      'error-subtle',
      'success-small',
    ],
  },

} as const;

// ── Helpers ───────────────────────────────────────────────────────────────

/** Get a mood board by ID. Falls back to daytime-learning. */
export function getMoodBoard(id: string): MoodBoard {
  return moodBoards[id] ?? moodBoards['daytime-learning'];
}

/** All mood board IDs. */
export const allMoodIds: string[] = Object.keys(moodBoards);

/**
 * Get the scale frequencies for a mood board (actual Hz values).
 * Returns an array of frequencies for one octave of the scale.
 */
export function getScaleFrequencies(moodId: string): number[] {
  const mood = getMoodBoard(moodId);
  return mood.scale.map((ratio) => mood.rootFrequency * ratio);
}

/**
 * Check if a specific sound ID belongs to a mood.
 * If a sound is not explicitly assigned to any mood, it defaults to
 * daytime-learning.
 */
export function soundBelongsToMood(soundId: string, moodId: string): boolean {
  const mood = moodBoards[moodId];
  if (!mood) return false;
  return mood.soundIds.includes(soundId);
}

/**
 * Auto-detect the best mood for a given route path and bedtime state.
 */
export function detectMoodForRoute(pathname: string, isBedtime: boolean): string {
  if (isBedtime) return 'bedtime';

  // Parent-facing routes
  if (pathname.startsWith('/parent') || pathname.startsWith('/settings')) {
    return 'parent-mode';
  }

  // Movement / dance routes
  if (pathname.startsWith('/movement')) {
    return 'movement-dance';
  }

  // Discovery / exploration routes
  if (
    pathname.startsWith('/discover') ||
    pathname.startsWith('/explorer') ||
    pathname.startsWith('/animals') ||
    pathname.startsWith('/characters')
  ) {
    return 'curiosity-discovery';
  }

  // Bedtime routes (even if global bedtime mode is off)
  if (pathname.startsWith('/bedtime')) {
    return 'bedtime';
  }

  // Story routes
  if (pathname.startsWith('/stories') || pathname.startsWith('/audio')) {
    return 'curiosity-discovery';
  }

  // Default for learning activities
  return 'daytime-learning';
}
