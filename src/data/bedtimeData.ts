export interface BreathingExercise {
  id: string;
  name: string;
  emoji: string;
  instructions: string;
  inhale: number;
  hold: number;
  exhale: number;
  hold2?: number;
  rounds: number;
}

export interface CalmSound {
  id: string;
  name: string;
  emoji: string;
  type: 'noise' | 'melody' | 'pulse';
  filter?: number;
  notes?: number[];
  frequency?: number;
}

export interface GoodnightStep {
  id: string;
  label: string;
  emoji: string;
}

export const breathingExercises: BreathingExercise[] = [
  {
    id: 'balloon',
    name: 'Balloon Breathing',
    emoji: '🎈',
    instructions:
      'Breathe in slowly like you\'re blowing up a balloon. Hold it gently. Then let the air out slowly as the balloon deflates.',
    inhale: 4,
    hold: 2,
    exhale: 4,
    rounds: 4,
  },
  {
    id: 'square',
    name: 'Square Breathing',
    emoji: '⬜',
    instructions:
      'Imagine drawing a square. Breathe in on one side, hold on the next, breathe out on the third, and hold on the fourth.',
    inhale: 4,
    hold: 4,
    exhale: 4,
    hold2: 4,
    rounds: 3,
  },
  {
    id: '478',
    name: '4-7-8 Breathing',
    emoji: '🌊',
    instructions:
      'Breathe in like a wave coming in, hold like the wave is at the top, then breathe out slowly like the wave going back to the ocean.',
    inhale: 4,
    hold: 7,
    exhale: 8,
    rounds: 3,
  },
];

export const calmSounds: CalmSound[] = [
  {
    id: 'rain',
    name: 'Rain',
    emoji: '🌧️',
    type: 'noise',
    filter: 800,
  },
  {
    id: 'ocean',
    name: 'Ocean',
    emoji: '🌊',
    type: 'noise',
    filter: 400,
  },
  {
    id: 'lullaby',
    name: 'Lullaby',
    emoji: '🎵',
    type: 'melody',
    notes: [261, 294, 330, 294, 261],
  },
  {
    id: 'heartbeat',
    name: 'Heartbeat',
    emoji: '💓',
    type: 'pulse',
    frequency: 60,
  },
];

export const goodnightRoutine: GoodnightStep[] = [
  { id: 'brush', label: 'Brush teeth', emoji: '🪥' },
  { id: 'pajamas', label: 'Put on pajamas', emoji: '👕' },
  { id: 'story', label: 'Read a story', emoji: '📖' },
  { id: 'breathing', label: 'Breathing exercise', emoji: '🫧' },
  { id: 'sleep', label: 'Close eyes and dream', emoji: '😴' },
];
