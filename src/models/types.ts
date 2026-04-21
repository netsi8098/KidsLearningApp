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
  /** Path to generated illustrated asset (e.g. /assets/generated/objects/alphabet/apple_v1.webp) */
  assetSrc?: string;
}

export interface NumberItem {
  number: number;
  word: string;
  emoji: string;
  assetSrc?: string;
}

export interface ColorItem {
  name: string;
  hex: string;
  emojis: string[];
  assetSrc?: string;
}

export interface ShapeItem {
  name: string;
  emoji: string;
  sides: number | string;
  svgPath: string;
  funFact: string;
  assetSrc?: string;
}

export interface AnimalItem {
  name: string;
  emoji: string;
  sound: string;
  habitat: string;
  assetSrc?: string;
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
