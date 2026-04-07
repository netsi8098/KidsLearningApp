// ── Sound Registry ────────────────────────────────────────────────────────
// Complete catalog of every synthesized sound in Kids Learning Fun.
// All sounds are produced via Web Audio API oscillators + noise generators.
// NO external audio files -- every tone is defined by synthesis parameters.
//
// Design philosophy: warm, soft, playful, safe. Never sharp, startling,
// or casino-like. Every sound should feel like it belongs in a cozy
// nursery or a friendly kindergarten classroom.

// ── Types ─────────────────────────────────────────────────────────────────

export type SoundCategory =
  | 'navigation'
  | 'success'
  | 'error'
  | 'reward'
  | 'ambient'
  | 'transition'
  | 'interaction'
  | 'story'
  | 'movement'
  | 'bedtime'
  | 'brand';

export interface SoundSynthesis {
  type: 'tone' | 'noise' | 'chord' | 'sequence' | 'sweep';
  /** Frequencies for tone/chord types (Hz). */
  frequencies?: number[];
  /** Oscillator waveform. */
  waveform?: OscillatorType;
  /** ADSR envelope -- attack in seconds. */
  attack: number;
  /** Decay time in seconds. */
  decay: number;
  /** Sustain level 0-1. */
  sustain: number;
  /** Release time in seconds. */
  release: number;
  /** Master volume 0-1. */
  volume: number;
  /** Stereo pan -1 (left) to 1 (right). */
  pan?: number;
  /** Biquad filter cutoff frequency in Hz. */
  filterFreq?: number;
  /** Biquad filter type. */
  filterType?: BiquadFilterType;
  /** For 'sequence' type: an array of note events. */
  notes?: Array<{ freq: number; duration: number; delay: number }>;
  /** For 'sweep' type: start frequency in Hz. */
  freqStart?: number;
  /** For 'sweep' type: end frequency in Hz. */
  freqEnd?: number;
  /** For 'sweep' type: total sweep duration in seconds. */
  sweepDuration?: number;
}

export interface SoundEntry {
  /** Unique identifier, used as the key in playSound(id). */
  id: string;
  category: SoundCategory;
  /** Human-readable short label. */
  label: string;
  /** Longer description of when/why this sound plays. */
  description: string;
  /** Web Audio synthesis parameters. */
  synthesis: SoundSynthesis;
  /** 1 = critical (never skip), 2 = important, 3 = ambient/optional. */
  priority: 1 | 2 | 3;
  /** Maximum instances that can overlap at once. */
  maxConcurrent: number;
  /** Minimum ms between re-triggers to prevent machine-gun effect. */
  cooldownMs: number;
  /** Optional softer variant used in bedtime mode. */
  bedtimeVariant?: Partial<SoundSynthesis>;
}

// ── Musical Constants ─────────────────────────────────────────────────────

/** Equal-temperament note frequencies (Hz) for reference. */
export const NOTE = {
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00,
  A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99,
  A5: 880.00, B5: 987.77,
  C6: 1046.50, D6: 1174.66, E6: 1318.51,
  // Low range
  C3: 130.81, E3: 164.81, G3: 196.00, F3: 174.61,
} as const;

// ── Sound Definitions ─────────────────────────────────────────────────────

export const soundRegistry: Record<string, SoundEntry> = {

  // ─── Navigation ────────────────────────────────────────────────────────

  'nav-tap': {
    id: 'nav-tap',
    category: 'navigation',
    label: 'Tap',
    description: 'Soft pop for tapping any interactive element. Short, round, and unobtrusive.',
    synthesis: {
      type: 'tone',
      frequencies: [800],
      waveform: 'sine',
      attack: 0.005,
      decay: 0.04,
      sustain: 0,
      release: 0.03,
      volume: 0.18,
      filterFreq: 2000,
      filterType: 'lowpass',
    },
    priority: 3,
    maxConcurrent: 1,
    cooldownMs: 60,
    bedtimeVariant: { volume: 0.08, filterFreq: 1200 },
  },

  'nav-back': {
    id: 'nav-back',
    category: 'navigation',
    label: 'Back',
    description: 'Softer, lower reverse pop for navigating backward.',
    synthesis: {
      type: 'tone',
      frequencies: [600],
      waveform: 'sine',
      attack: 0.005,
      decay: 0.05,
      sustain: 0,
      release: 0.04,
      volume: 0.14,
      pan: -0.2,
      filterFreq: 1500,
      filterType: 'lowpass',
    },
    priority: 3,
    maxConcurrent: 1,
    cooldownMs: 100,
    bedtimeVariant: { volume: 0.06, filterFreq: 900 },
  },

  // ─── Success ───────────────────────────────────────────────────────────

  'success-small': {
    id: 'success-small',
    category: 'success',
    label: 'Small win',
    description: 'Gentle two-note ascending chime (C5 -> E5) for correct answers.',
    synthesis: {
      type: 'sequence',
      waveform: 'sine',
      attack: 0.01,
      decay: 0.15,
      sustain: 0.2,
      release: 0.15,
      volume: 0.25,
      notes: [
        { freq: NOTE.C5, duration: 0.18, delay: 0 },
        { freq: NOTE.E5, duration: 0.22, delay: 0.12 },
      ],
    },
    priority: 2,
    maxConcurrent: 1,
    cooldownMs: 200,
    bedtimeVariant: { volume: 0.12, waveform: 'sine' },
  },

  'success-medium': {
    id: 'success-medium',
    category: 'success',
    label: 'Medium win',
    description: 'Three-note ascending chime (C5 -> E5 -> G5) for completing a section.',
    synthesis: {
      type: 'sequence',
      waveform: 'sine',
      attack: 0.01,
      decay: 0.18,
      sustain: 0.25,
      release: 0.2,
      volume: 0.28,
      notes: [
        { freq: NOTE.C5, duration: 0.2, delay: 0 },
        { freq: NOTE.E5, duration: 0.2, delay: 0.13 },
        { freq: NOTE.G5, duration: 0.28, delay: 0.26 },
      ],
    },
    priority: 2,
    maxConcurrent: 1,
    cooldownMs: 400,
    bedtimeVariant: { volume: 0.14 },
  },

  'success-big': {
    id: 'success-big',
    category: 'success',
    label: 'Big celebration',
    description: 'Full C-major arpeggio celebration for level completion and milestones.',
    synthesis: {
      type: 'sequence',
      waveform: 'sine',
      attack: 0.01,
      decay: 0.2,
      sustain: 0.3,
      release: 0.35,
      volume: 0.3,
      notes: [
        { freq: NOTE.C5, duration: 0.25, delay: 0 },
        { freq: NOTE.E5, duration: 0.25, delay: 0.1 },
        { freq: NOTE.G5, duration: 0.25, delay: 0.2 },
        { freq: NOTE.C6, duration: 0.4, delay: 0.3 },
        { freq: NOTE.G5, duration: 0.2, delay: 0.45 },
        { freq: NOTE.C6, duration: 0.5, delay: 0.55 },
      ],
    },
    priority: 1,
    maxConcurrent: 1,
    cooldownMs: 1000,
    bedtimeVariant: { volume: 0.15, release: 0.5 },
  },

  // ─── Error ─────────────────────────────────────────────────────────────

  'error-gentle': {
    id: 'error-gentle',
    category: 'error',
    label: 'Gentle oops',
    description: 'Soft descending minor second (E4 -> Eb4) -- encourages without scolding.',
    synthesis: {
      type: 'sequence',
      waveform: 'triangle',
      attack: 0.02,
      decay: 0.15,
      sustain: 0.1,
      release: 0.15,
      volume: 0.18,
      notes: [
        { freq: 329.63, duration: 0.2, delay: 0 },      // E4
        { freq: 311.13, duration: 0.25, delay: 0.15 },   // Eb4 (D#4)
      ],
      filterFreq: 1800,
      filterType: 'lowpass',
    },
    priority: 2,
    maxConcurrent: 1,
    cooldownMs: 300,
    bedtimeVariant: { volume: 0.09, filterFreq: 1200 },
  },

  'error-subtle': {
    id: 'error-subtle',
    category: 'error',
    label: 'Subtle miss',
    description: 'Very gentle low buzz -- almost imperceptible wrong-answer indicator.',
    synthesis: {
      type: 'tone',
      frequencies: [200],
      waveform: 'triangle',
      attack: 0.02,
      decay: 0.08,
      sustain: 0.05,
      release: 0.1,
      volume: 0.1,
      filterFreq: 800,
      filterType: 'lowpass',
    },
    priority: 3,
    maxConcurrent: 1,
    cooldownMs: 200,
    bedtimeVariant: { volume: 0.04 },
  },

  // ─── Reward ────────────────────────────────────────────────────────────

  'reward-star': {
    id: 'reward-star',
    category: 'reward',
    label: 'Star earned',
    description: 'Sparkly ascending sweep with shimmer -- plays when a star is awarded.',
    synthesis: {
      type: 'sweep',
      waveform: 'sine',
      freqStart: 800,
      freqEnd: 2400,
      sweepDuration: 0.25,
      attack: 0.005,
      decay: 0.1,
      sustain: 0.15,
      release: 0.25,
      volume: 0.22,
      filterFreq: 4000,
      filterType: 'highpass',
    },
    priority: 1,
    maxConcurrent: 2,
    cooldownMs: 150,
    bedtimeVariant: { volume: 0.1, freqEnd: 1800, filterFreq: 2500 },
  },

  'reward-badge': {
    id: 'reward-badge',
    category: 'reward',
    label: 'Badge unlocked',
    description: 'Fanfare sequence -- 5 ascending notes with sustain for badge achievements.',
    synthesis: {
      type: 'sequence',
      waveform: 'sine',
      attack: 0.01,
      decay: 0.2,
      sustain: 0.35,
      release: 0.4,
      volume: 0.3,
      notes: [
        { freq: NOTE.C5, duration: 0.2, delay: 0 },
        { freq: NOTE.E5, duration: 0.2, delay: 0.12 },
        { freq: NOTE.G5, duration: 0.2, delay: 0.24 },
        { freq: NOTE.C6, duration: 0.3, delay: 0.36 },
        { freq: NOTE.E6, duration: 0.5, delay: 0.52 },
      ],
    },
    priority: 1,
    maxConcurrent: 1,
    cooldownMs: 2000,
    bedtimeVariant: { volume: 0.15 },
  },

  'reward-streak': {
    id: 'reward-streak',
    category: 'reward',
    label: 'Streak achieved',
    description: 'Rich major chord with warmth for streak milestones.',
    synthesis: {
      type: 'chord',
      frequencies: [NOTE.C4, NOTE.E4, NOTE.G4, NOTE.C5],
      waveform: 'sine',
      attack: 0.02,
      decay: 0.3,
      sustain: 0.4,
      release: 0.5,
      volume: 0.25,
      filterFreq: 3000,
      filterType: 'lowpass',
    },
    priority: 1,
    maxConcurrent: 1,
    cooldownMs: 3000,
    bedtimeVariant: { volume: 0.12, filterFreq: 1800 },
  },

  // ─── Ambient ───────────────────────────────────────────────────────────

  'ambient-daytime': {
    id: 'ambient-daytime',
    category: 'ambient',
    label: 'Daytime pad',
    description: 'Gentle sustained C-E drone pad, very quiet, providing warmth to daytime screens.',
    synthesis: {
      type: 'chord',
      frequencies: [NOTE.C4, NOTE.E4],
      waveform: 'sine',
      attack: 1.5,
      decay: 2.0,
      sustain: 0.6,
      release: 2.0,
      volume: 0.04,
      filterFreq: 1200,
      filterType: 'lowpass',
    },
    priority: 3,
    maxConcurrent: 1,
    cooldownMs: 5000,
  },

  'ambient-bedtime': {
    id: 'ambient-bedtime',
    category: 'ambient',
    label: 'Bedtime drone',
    description: 'Deep warm low-C drone with heavy lowpass filtering. Barely audible, deeply calming.',
    synthesis: {
      type: 'chord',
      frequencies: [NOTE.C3, NOTE.G3],
      waveform: 'sine',
      attack: 2.0,
      decay: 3.0,
      sustain: 0.5,
      release: 3.0,
      volume: 0.03,
      filterFreq: 600,
      filterType: 'lowpass',
    },
    priority: 3,
    maxConcurrent: 1,
    cooldownMs: 8000,
  },

  // ─── Transition ────────────────────────────────────────────────────────

  'transition-whoosh': {
    id: 'transition-whoosh',
    category: 'transition',
    label: 'Whoosh',
    description: 'Quick noise sweep for page/section transitions.',
    synthesis: {
      type: 'noise',
      attack: 0.01,
      decay: 0.08,
      sustain: 0.05,
      release: 0.1,
      volume: 0.1,
      filterFreq: 3000,
      filterType: 'bandpass',
    },
    priority: 3,
    maxConcurrent: 1,
    cooldownMs: 150,
    bedtimeVariant: { volume: 0.04, filterFreq: 1500 },
  },

  'transition-page': {
    id: 'transition-page',
    category: 'transition',
    label: 'Page turn',
    description: 'Soft page-turn noise -- gentle filtered white noise burst.',
    synthesis: {
      type: 'noise',
      attack: 0.02,
      decay: 0.12,
      sustain: 0.02,
      release: 0.15,
      volume: 0.08,
      filterFreq: 2500,
      filterType: 'highpass',
    },
    priority: 3,
    maxConcurrent: 1,
    cooldownMs: 200,
    bedtimeVariant: { volume: 0.03, filterFreq: 1800 },
  },

  // ─── Interaction ───────────────────────────────────────────────────────

  'interaction-select': {
    id: 'interaction-select',
    category: 'interaction',
    label: 'Select',
    description: 'Light tap confirmation for selecting items, options, or answers.',
    synthesis: {
      type: 'tone',
      frequencies: [1000],
      waveform: 'sine',
      attack: 0.003,
      decay: 0.05,
      sustain: 0,
      release: 0.04,
      volume: 0.15,
      filterFreq: 2500,
      filterType: 'lowpass',
    },
    priority: 3,
    maxConcurrent: 1,
    cooldownMs: 80,
    bedtimeVariant: { volume: 0.07 },
  },

  'interaction-drag': {
    id: 'interaction-drag',
    category: 'interaction',
    label: 'Drag',
    description: 'Subtle sliding tone while dragging items -- gentle pitch rise.',
    synthesis: {
      type: 'sweep',
      waveform: 'sine',
      freqStart: 400,
      freqEnd: 600,
      sweepDuration: 0.15,
      attack: 0.01,
      decay: 0.06,
      sustain: 0.1,
      release: 0.08,
      volume: 0.1,
      filterFreq: 1500,
      filterType: 'lowpass',
    },
    priority: 3,
    maxConcurrent: 1,
    cooldownMs: 100,
    bedtimeVariant: { volume: 0.04 },
  },

  'interaction-drop': {
    id: 'interaction-drop',
    category: 'interaction',
    label: 'Drop',
    description: 'Soft landing thud when dropping/placing an item.',
    synthesis: {
      type: 'tone',
      frequencies: [180],
      waveform: 'sine',
      attack: 0.005,
      decay: 0.1,
      sustain: 0,
      release: 0.08,
      volume: 0.2,
      filterFreq: 800,
      filterType: 'lowpass',
    },
    priority: 3,
    maxConcurrent: 1,
    cooldownMs: 100,
    bedtimeVariant: { volume: 0.08 },
  },

  // ─── Story ─────────────────────────────────────────────────────────────

  'story-page-turn': {
    id: 'story-page-turn',
    category: 'story',
    label: 'Story page turn',
    description: 'Papery swoosh -- filtered noise with a soft tonal undertone.',
    synthesis: {
      type: 'noise',
      attack: 0.01,
      decay: 0.15,
      sustain: 0.03,
      release: 0.18,
      volume: 0.09,
      filterFreq: 4000,
      filterType: 'bandpass',
    },
    priority: 3,
    maxConcurrent: 1,
    cooldownMs: 300,
    bedtimeVariant: { volume: 0.04, filterFreq: 2000 },
  },

  'story-dramatic': {
    id: 'story-dramatic',
    category: 'story',
    label: 'Dramatic moment',
    description: 'Tension chord (C minor) for suspenseful story moments.',
    synthesis: {
      type: 'chord',
      frequencies: [NOTE.C4, 311.13, NOTE.G4],  // C4, Eb4, G4 = Cm
      waveform: 'triangle',
      attack: 0.1,
      decay: 0.5,
      sustain: 0.3,
      release: 0.6,
      volume: 0.15,
      filterFreq: 2000,
      filterType: 'lowpass',
    },
    priority: 2,
    maxConcurrent: 1,
    cooldownMs: 2000,
    bedtimeVariant: { volume: 0.07, filterFreq: 1200 },
  },

  // ─── Movement ──────────────────────────────────────────────────────────

  'movement-beat': {
    id: 'movement-beat',
    category: 'movement',
    label: 'Rhythmic beat',
    description: 'Rhythmic pulse for dance/movement activities -- punchy but warm.',
    synthesis: {
      type: 'tone',
      frequencies: [150],
      waveform: 'sine',
      attack: 0.005,
      decay: 0.08,
      sustain: 0.05,
      release: 0.06,
      volume: 0.3,
      filterFreq: 600,
      filterType: 'lowpass',
    },
    priority: 2,
    maxConcurrent: 2,
    cooldownMs: 80,
  },

  'movement-start': {
    id: 'movement-start',
    category: 'movement',
    label: 'Movement start',
    description: 'Energetic ascending sweep to kick off a movement activity.',
    synthesis: {
      type: 'sweep',
      waveform: 'sawtooth',
      freqStart: 200,
      freqEnd: 1200,
      sweepDuration: 0.35,
      attack: 0.01,
      decay: 0.15,
      sustain: 0.2,
      release: 0.2,
      volume: 0.22,
      filterFreq: 3000,
      filterType: 'lowpass',
    },
    priority: 2,
    maxConcurrent: 1,
    cooldownMs: 1000,
  },

  // ─── Bedtime ───────────────────────────────────────────────────────────

  'bedtime-wind-down': {
    id: 'bedtime-wind-down',
    category: 'bedtime',
    label: 'Wind down',
    description: 'Descending calming sweep -- signals transition to quiet time.',
    synthesis: {
      type: 'sweep',
      waveform: 'sine',
      freqStart: 800,
      freqEnd: 200,
      sweepDuration: 1.2,
      attack: 0.2,
      decay: 0.6,
      sustain: 0.2,
      release: 0.8,
      volume: 0.1,
      filterFreq: 1000,
      filterType: 'lowpass',
    },
    priority: 2,
    maxConcurrent: 1,
    cooldownMs: 3000,
  },

  'bedtime-twinkle': {
    id: 'bedtime-twinkle',
    category: 'bedtime',
    label: 'Twinkle',
    description: 'Very soft high sparkle -- like a distant star twinkling.',
    synthesis: {
      type: 'sequence',
      waveform: 'sine',
      attack: 0.02,
      decay: 0.2,
      sustain: 0.05,
      release: 0.3,
      volume: 0.06,
      notes: [
        { freq: NOTE.C6, duration: 0.15, delay: 0 },
        { freq: NOTE.E6, duration: 0.2, delay: 0.2 },
        { freq: NOTE.C6, duration: 0.15, delay: 0.45 },
      ],
      filterFreq: 5000,
      filterType: 'lowpass',
    },
    priority: 3,
    maxConcurrent: 1,
    cooldownMs: 4000,
  },

  // ─── Brand ─────────────────────────────────────────────────────────────

  'brand-startup': {
    id: 'brand-startup',
    category: 'brand',
    label: 'App startup',
    description: 'Short memorable 3-note mnemonic (C5-G5-C6) -- the app sonic logo.',
    synthesis: {
      type: 'sequence',
      waveform: 'sine',
      attack: 0.01,
      decay: 0.15,
      sustain: 0.3,
      release: 0.3,
      volume: 0.28,
      notes: [
        { freq: NOTE.C5, duration: 0.2, delay: 0 },
        { freq: NOTE.G5, duration: 0.2, delay: 0.18 },
        { freq: NOTE.C6, duration: 0.4, delay: 0.36 },
      ],
    },
    priority: 1,
    maxConcurrent: 1,
    cooldownMs: 5000,
    bedtimeVariant: { volume: 0.12 },
  },

  'brand-complete': {
    id: 'brand-complete',
    category: 'brand',
    label: 'Session end',
    description: 'Warm resolution chord (F major) to close a session with satisfaction.',
    synthesis: {
      type: 'chord',
      frequencies: [NOTE.F3, NOTE.A4, NOTE.C5, NOTE.F5],
      waveform: 'sine',
      attack: 0.05,
      decay: 0.4,
      sustain: 0.35,
      release: 0.8,
      volume: 0.22,
      filterFreq: 2500,
      filterType: 'lowpass',
    },
    priority: 1,
    maxConcurrent: 1,
    cooldownMs: 5000,
    bedtimeVariant: { volume: 0.1, filterFreq: 1500 },
  },

} as const;

// ── Helpers ───────────────────────────────────────────────────────────────

/** Get a sound entry by ID. Returns undefined if not found. */
export function getSound(id: string): SoundEntry | undefined {
  return soundRegistry[id];
}

/** All sound IDs as an array. */
export const allSoundIds: string[] = Object.keys(soundRegistry);

/** Get all sounds in a specific category. */
export function getSoundsByCategory(category: SoundCategory): SoundEntry[] {
  return Object.values(soundRegistry).filter((s) => s.category === category);
}

/** Get the synthesis parameters, applying bedtime variant if requested. */
export function getSynthesis(id: string, bedtime = false): SoundSynthesis | undefined {
  const entry = soundRegistry[id];
  if (!entry) return undefined;
  if (bedtime && entry.bedtimeVariant) {
    return { ...entry.synthesis, ...entry.bedtimeVariant };
  }
  return entry.synthesis;
}

/** All registered categories (deduplicated). */
export const allCategories: SoundCategory[] = [
  'navigation', 'success', 'error', 'reward', 'ambient',
  'transition', 'interaction', 'story', 'movement', 'bedtime', 'brand',
];
