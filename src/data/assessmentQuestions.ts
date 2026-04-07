export interface AssessmentQuestion {
  id: string;
  area: AssessmentArea;
  question: string;
  emoji: string;
  options: string[];
  correctAnswer: string;
  difficulty: 1 | 2 | 3;
}

export type AssessmentArea =
  | 'letters'
  | 'numbers'
  | 'colors'
  | 'shapes'
  | 'vocabulary'
  | 'listening';

export const assessmentAreas: { key: AssessmentArea; label: string; emoji: string; color: string }[] = [
  { key: 'letters', label: 'Letters', emoji: '🔤', color: '#FF6B6B' },
  { key: 'numbers', label: 'Numbers', emoji: '🔢', color: '#4ECDC4' },
  { key: 'colors', label: 'Colors', emoji: '🎨', color: '#FFB347' },
  { key: 'shapes', label: 'Shapes', emoji: '🔷', color: '#A78BFA' },
  { key: 'vocabulary', label: 'Vocabulary', emoji: '📖', color: '#6BCB77' },
  { key: 'listening', label: 'Listening', emoji: '👂', color: '#F472B6' },
];

export const assessmentQuestions: AssessmentQuestion[] = [
  // ── Letters ────────────────────────────────────────────────
  {
    id: 'a-let-1',
    area: 'letters',
    question: 'Which letter is this? A',
    emoji: '🔤',
    options: ['A', 'B', 'C', 'D'],
    correctAnswer: 'A',
    difficulty: 1,
  },
  {
    id: 'a-let-2',
    area: 'letters',
    question: 'What letter does Apple start with?',
    emoji: '🍎',
    options: ['A', 'B', 'C', 'D'],
    correctAnswer: 'A',
    difficulty: 1,
  },
  {
    id: 'a-let-3',
    area: 'letters',
    question: 'Which is a vowel?',
    emoji: '📝',
    options: ['A', 'B', 'C', 'D'],
    correctAnswer: 'A',
    difficulty: 2,
  },
  {
    id: 'a-let-4',
    area: 'letters',
    question: 'What comes after M?',
    emoji: '🔡',
    options: ['N', 'O', 'L', 'K'],
    correctAnswer: 'N',
    difficulty: 3,
  },

  // ── Numbers ────────────────────────────────────────────────
  {
    id: 'a-num-1',
    area: 'numbers',
    question: 'How many apples? 🍎🍎🍎',
    emoji: '🍎',
    options: ['2', '3', '4', '5'],
    correctAnswer: '3',
    difficulty: 1,
  },
  {
    id: 'a-num-2',
    area: 'numbers',
    question: 'What comes after 5?',
    emoji: '🔢',
    options: ['4', '6', '7', '3'],
    correctAnswer: '6',
    difficulty: 1,
  },
  {
    id: 'a-num-3',
    area: 'numbers',
    question: 'Which is bigger, 7 or 4?',
    emoji: '🔢',
    options: ['7', '4'],
    correctAnswer: '7',
    difficulty: 2,
  },
  {
    id: 'a-num-4',
    area: 'numbers',
    question: '2 + 1 = ?',
    emoji: '➕',
    options: ['2', '3', '4', '1'],
    correctAnswer: '3',
    difficulty: 3,
  },

  // ── Colors ─────────────────────────────────────────────────
  {
    id: 'a-col-1',
    area: 'colors',
    question: 'What color is this? 🔴',
    emoji: '🔴',
    options: ['Red', 'Blue', 'Green', 'Yellow'],
    correctAnswer: 'Red',
    difficulty: 1,
  },
  {
    id: 'a-col-2',
    area: 'colors',
    question: 'What color is a banana?',
    emoji: '🍌',
    options: ['Yellow', 'Red', 'Blue', 'Green'],
    correctAnswer: 'Yellow',
    difficulty: 1,
  },
  {
    id: 'a-col-3',
    area: 'colors',
    question: 'Mix red + blue = ?',
    emoji: '🎨',
    options: ['Purple', 'Green', 'Orange', 'Pink'],
    correctAnswer: 'Purple',
    difficulty: 2,
  },
  {
    id: 'a-col-4',
    area: 'colors',
    question: 'What color is the sky?',
    emoji: '🌤️',
    options: ['Blue', 'Green', 'Red', 'Yellow'],
    correctAnswer: 'Blue',
    difficulty: 2,
  },

  // ── Shapes ─────────────────────────────────────────────────
  {
    id: 'a-shp-1',
    area: 'shapes',
    question: 'What shape is this? ⭐',
    emoji: '⭐',
    options: ['Star', 'Circle', 'Square', 'Triangle'],
    correctAnswer: 'Star',
    difficulty: 1,
  },
  {
    id: 'a-shp-2',
    area: 'shapes',
    question: 'How many sides does a triangle have?',
    emoji: '🔺',
    options: ['3', '4', '5', '2'],
    correctAnswer: '3',
    difficulty: 2,
  },
  {
    id: 'a-shp-3',
    area: 'shapes',
    question: 'Which shape is round?',
    emoji: '🔵',
    options: ['Circle', 'Square', 'Triangle', 'Rectangle'],
    correctAnswer: 'Circle',
    difficulty: 1,
  },
  {
    id: 'a-shp-4',
    area: 'shapes',
    question: 'A box is what shape?',
    emoji: '📦',
    options: ['Square', 'Circle', 'Triangle', 'Star'],
    correctAnswer: 'Square',
    difficulty: 2,
  },

  // ── Vocabulary ─────────────────────────────────────────────
  {
    id: 'a-voc-1',
    area: 'vocabulary',
    question: "What animal says 'Moo'?",
    emoji: '🐮',
    options: ['Cow', 'Dog', 'Cat', 'Bird'],
    correctAnswer: 'Cow',
    difficulty: 1,
  },
  {
    id: 'a-voc-2',
    area: 'vocabulary',
    question: 'What do you use to eat soup?',
    emoji: '🥣',
    options: ['Spoon', 'Fork', 'Knife', 'Cup'],
    correctAnswer: 'Spoon',
    difficulty: 1,
  },
  {
    id: 'a-voc-3',
    area: 'vocabulary',
    question: 'Where do fish live?',
    emoji: '🐟',
    options: ['Water', 'Sky', 'Trees', 'Mountains'],
    correctAnswer: 'Water',
    difficulty: 2,
  },
  {
    id: 'a-voc-4',
    area: 'vocabulary',
    question: 'What season has snow?',
    emoji: '❄️',
    options: ['Winter', 'Summer', 'Spring', 'Fall'],
    correctAnswer: 'Winter',
    difficulty: 2,
  },

  // ── Listening (read aloud via TTS) ─────────────────────────
  {
    id: 'a-lis-1',
    area: 'listening',
    question: 'Tap the animal that flies',
    emoji: '👂',
    options: ['🦅', '🐟', '🐱', '🐶'],
    correctAnswer: '🦅',
    difficulty: 1,
  },
  {
    id: 'a-lis-2',
    area: 'listening',
    question: 'Tap the fruit',
    emoji: '👂',
    options: ['🍎', '🚗', '🏠', '⚽'],
    correctAnswer: '🍎',
    difficulty: 1,
  },
  {
    id: 'a-lis-3',
    area: 'listening',
    question: "Tap the one that's NOT a color",
    emoji: '👂',
    options: ['Dog', 'Red', 'Blue', 'Green'],
    correctAnswer: 'Dog',
    difficulty: 2,
  },
  {
    id: 'a-lis-4',
    area: 'listening',
    question: 'Tap the biggest number',
    emoji: '👂',
    options: ['9', '3', '5', '1'],
    correctAnswer: '9',
    difficulty: 2,
  },
];
