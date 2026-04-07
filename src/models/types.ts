export type Category =
  | 'abc' | 'numbers' | 'colors' | 'shapes' | 'animals' | 'bodyparts'
  | 'quiz' | 'matching'
  | 'coloring' | 'cooking' | 'audio' | 'bedtime' | 'movement'
  | 'emotions' | 'lifeskills' | 'explorer' | 'homeactivities';

export interface AlphabetItem {
  letter: string;
  upper: string;
  lower: string;
  emoji: string;
  word: string;
}

export interface NumberItem {
  number: number;
  word: string;
  emoji: string;
}

export interface ColorItem {
  name: string;
  hex: string;
  emojis: string[];
}

export interface ShapeItem {
  name: string;
  emoji: string;
  sides: number | string;
  svgPath: string;
  funFact: string;
}

export interface AnimalItem {
  name: string;
  emoji: string;
  sound: string;
  habitat: string;
}

export interface BadgeDefinition {
  id: string;
  name: string;
  emoji: string;
  description: string;
  category: Category | 'general';
  threshold: number;
}

export interface QuizQuestion {
  question: string;
  correctAnswer: string;
  options: string[];
  category: Category;
  emoji: string;
}
