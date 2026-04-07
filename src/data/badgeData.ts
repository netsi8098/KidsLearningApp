import type { BadgeDefinition } from '../models/types';

export const badgeData: BadgeDefinition[] = [
  { id: 'first-star', name: 'First Star', emoji: '🌟', description: 'Earn your first star!', category: 'general', threshold: 1 },
  { id: 'star-collector', name: 'Star Collector', emoji: '✨', description: 'Earn 10 stars!', category: 'general', threshold: 10 },
  { id: 'super-star', name: 'Super Star', emoji: '💫', description: 'Earn 50 stars!', category: 'general', threshold: 50 },
  { id: 'mega-star', name: 'Mega Star', emoji: '🌠', description: 'Earn 100 stars!', category: 'general', threshold: 100 },
  { id: 'abc-starter', name: 'ABC Starter', emoji: '📖', description: 'Learn 5 letters!', category: 'abc', threshold: 5 },
  { id: 'abc-master', name: 'ABC Master', emoji: '🎓', description: 'Learn all 26 letters!', category: 'abc', threshold: 26 },
  { id: 'number-starter', name: 'Number Starter', emoji: '🔢', description: 'Learn 5 numbers!', category: 'numbers', threshold: 5 },
  { id: 'number-master', name: 'Number Master', emoji: '🧮', description: 'Learn all 20 numbers!', category: 'numbers', threshold: 20 },
  { id: 'color-starter', name: 'Color Starter', emoji: '🎨', description: 'Learn 5 colors!', category: 'colors', threshold: 5 },
  { id: 'color-master', name: 'Color Master', emoji: '🌈', description: 'Learn all 10 colors!', category: 'colors', threshold: 10 },
  { id: 'shape-master', name: 'Shape Master', emoji: '📐', description: 'Learn all 8 shapes!', category: 'shapes', threshold: 8 },
  { id: 'animal-lover', name: 'Animal Lover', emoji: '🐾', description: 'Learn 6 animals!', category: 'animals', threshold: 6 },
  { id: 'quiz-champ', name: 'Quiz Champ', emoji: '🏆', description: 'Answer 10 quiz questions correctly!', category: 'quiz', threshold: 10 },
];
