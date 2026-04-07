import type { ShapeItem } from '../models/types';

export const shapesData: ShapeItem[] = [
  {
    name: 'Circle',
    emoji: '⚽',
    sides: 0,
    svgPath: 'M 50 10 A 40 40 0 1 1 49.99 10 Z',
    funFact: 'Wheels are circles!',
  },
  {
    name: 'Square',
    emoji: '🧊',
    sides: 4,
    svgPath: 'M 15 15 H 85 V 85 H 15 Z',
    funFact: 'All four sides are equal!',
  },
  {
    name: 'Triangle',
    emoji: '⛺',
    sides: 3,
    svgPath: 'M 50 10 L 90 85 L 10 85 Z',
    funFact: 'Pizza slices are triangles!',
  },
  {
    name: 'Rectangle',
    emoji: '📱',
    sides: 4,
    svgPath: 'M 10 25 H 90 V 75 H 10 Z',
    funFact: 'Books are rectangles!',
  },
  {
    name: 'Star',
    emoji: '⭐',
    sides: 5,
    svgPath: 'M 50 5 L 61 35 L 95 38 L 70 58 L 79 92 L 50 73 L 21 92 L 30 58 L 5 38 L 39 35 Z',
    funFact: 'Stars twinkle in the sky!',
  },
  {
    name: 'Heart',
    emoji: '❤️',
    sides: 0,
    svgPath: 'M 50 88 C 20 65 5 45 5 30 A 20 20 0 0 1 50 25 A 20 20 0 0 1 95 30 C 95 45 80 65 50 88 Z',
    funFact: 'Hearts mean love!',
  },
  {
    name: 'Diamond',
    emoji: '💎',
    sides: 4,
    svgPath: 'M 50 5 L 90 50 L 50 95 L 10 50 Z',
    funFact: 'Diamonds sparkle and shine!',
  },
  {
    name: 'Oval',
    emoji: '🥚',
    sides: 0,
    svgPath: 'M 50 10 A 35 45 0 1 1 49.99 10 Z',
    funFact: 'Eggs are oval shaped!',
  },
];
