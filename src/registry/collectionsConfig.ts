// ── Collections Configuration ───────────────────────────
// Themed content bundles for guided learning paths.

import type { Collection } from './types';

export const collections: Collection[] = [
  {
    id: 'col-space-week',
    title: 'Space Week',
    emoji: '🚀',
    description: 'Blast off into an adventure through the solar system! Learn about planets, stars, and what astronauts do.',
    coverColor: '#1a1a2e',
    contentIds: [
      'explorer:solar-system',
      'explorer:stars',
      'story:s-4-adv-1',
      'lesson:l-4-science-1',
      'coloring:star',
      'movement:rocket-launch',
    ],
    ageGroup: '4-5',
    estimatedMinutes: 45,
    sequential: false,
    learningGoals: ['Space vocabulary', 'Planet names', 'Scientific curiosity'],
  },
  {
    id: 'col-animal-adventure',
    title: 'Animal Adventure',
    emoji: '🦁',
    description: 'Meet amazing animals from around the world! Learn their sounds, habitats, and fun facts.',
    coverColor: '#6BCB77',
    contentIds: [
      'animal:cat', 'animal:dog', 'animal:elephant', 'animal:lion',
      'animal:monkey', 'animal:fish', 'animal:bird', 'animal:frog',
      'explorer:animals-intro',
      'story:s-2-bed-1',
      'coloring:cat', 'coloring:fish', 'coloring:butterfly',
      'movement:animal-moves',
    ],
    ageGroup: '2-3',
    estimatedMinutes: 40,
    sequential: false,
    learningGoals: ['Animal names', 'Animal sounds', 'Habitats'],
  },
  {
    id: 'col-princess-castles',
    title: 'Princess & Castles',
    emoji: '👑',
    description: 'Enter a magical kingdom of castles, princesses, and fairy tales! Read stories and create royal art.',
    coverColor: '#FD79A8',
    contentIds: [
      'story:s-4-fan-1',
      'story:s-6-fan-1',
      'story:s-6-fan-2',
      'coloring:castle',
      'coloring:crown',
      'lesson:l-4-reading-1',
    ],
    ageGroup: '4-5',
    estimatedMinutes: 35,
    sequential: false,
    learningGoals: ['Story comprehension', 'Vocabulary', 'Creativity'],
  },
  {
    id: 'col-dino-discovery',
    title: 'Dino Discovery',
    emoji: '🦕',
    description: 'Travel back in time to when dinosaurs roamed the Earth! Explore, color, and learn about these amazing creatures.',
    coverColor: '#4ECDC4',
    contentIds: [
      'explorer:dinosaurs',
      'coloring:dinosaur',
      'story:s-4-adv-2',
      'lesson:l-4-science-1',
      'game:memory-match',
    ],
    ageGroup: '4-5',
    estimatedMinutes: 30,
    sequential: false,
    learningGoals: ['Dinosaur names', 'Prehistoric world', 'Scientific thinking'],
  },
  {
    id: 'col-transportation',
    title: 'Transportation Fun',
    emoji: '🚗',
    description: 'Vroom vroom! Learn about cars, trains, planes, and boats. How do we get from place to place?',
    coverColor: '#FF8C42',
    contentIds: [
      'explorer:transportation',
      'coloring:car',
      'coloring:airplane',
      'lesson:l-2-vocab-1',
      'story:s-2-bed-2',
    ],
    ageGroup: '2-3',
    estimatedMinutes: 25,
    sequential: false,
    learningGoals: ['Vehicle names', 'Vocabulary', 'World knowledge'],
  },
  {
    id: 'col-feelings-friendship',
    title: 'Feelings & Friendship',
    emoji: '💛',
    description: 'Explore your feelings and learn about being a good friend. Understand emotions and practice kindness.',
    coverColor: '#A78BFA',
    contentIds: [
      'emotion:happy', 'emotion:sad', 'emotion:angry', 'emotion:scared',
      'emotion:calm', 'emotion:proud',
      'lifeskill:ls-sharing',
      'lifeskill:ls-manners',
      'story:s-4-feelings-1',
      'lesson:l-4-emotions-1',
    ],
    ageGroup: '4-5',
    estimatedMinutes: 35,
    sequential: false,
    learningGoals: ['Emotion recognition', 'Empathy', 'Friendship skills'],
  },
];

/** Get a collection by ID */
export function getCollectionById(id: string): Collection | undefined {
  return collections.find((c) => c.id === id);
}

/** Get collections appropriate for an age group */
export function getCollectionsByAge(ageGroup: string): Collection[] {
  return collections.filter((c) => !c.ageGroup || c.ageGroup === ageGroup);
}
