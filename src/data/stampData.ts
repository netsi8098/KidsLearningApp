export interface StampCategory {
  key: string;
  label: string;
  emoji: string;
}

export interface Stamp {
  emoji: string;
  category: string;
  label: string;
}

export const stampCategories: StampCategory[] = [
  { key: 'animals', label: 'Animals', emoji: '🐱' },
  { key: 'food', label: 'Food', emoji: '🍎' },
  { key: 'nature', label: 'Nature', emoji: '🌸' },
  { key: 'faces', label: 'Faces', emoji: '😊' },
  { key: 'objects', label: 'Objects', emoji: '🚗' },
  { key: 'shapes', label: 'Shapes', emoji: '❤️' },
];

export const stamps: Stamp[] = [
  // ── Animals ──────────────────────────────────────────────
  { emoji: '🐱', category: 'animals', label: 'Cat' },
  { emoji: '🐶', category: 'animals', label: 'Dog' },
  { emoji: '🐰', category: 'animals', label: 'Bunny' },
  { emoji: '🦊', category: 'animals', label: 'Fox' },
  { emoji: '🐻', category: 'animals', label: 'Bear' },
  { emoji: '🦁', category: 'animals', label: 'Lion' },
  { emoji: '🐸', category: 'animals', label: 'Frog' },
  { emoji: '🐝', category: 'animals', label: 'Bee' },

  // ── Food ─────────────────────────────────────────────────
  { emoji: '🍎', category: 'food', label: 'Apple' },
  { emoji: '🍌', category: 'food', label: 'Banana' },
  { emoji: '🍪', category: 'food', label: 'Cookie' },
  { emoji: '🧁', category: 'food', label: 'Cupcake' },
  { emoji: '🍕', category: 'food', label: 'Pizza' },
  { emoji: '🍦', category: 'food', label: 'Ice Cream' },
  { emoji: '🥕', category: 'food', label: 'Carrot' },
  { emoji: '🍓', category: 'food', label: 'Strawberry' },

  // ── Nature ───────────────────────────────────────────────
  { emoji: '🌸', category: 'nature', label: 'Blossom' },
  { emoji: '🌻', category: 'nature', label: 'Sunflower' },
  { emoji: '🌈', category: 'nature', label: 'Rainbow' },
  { emoji: '🌟', category: 'nature', label: 'Star' },
  { emoji: '⭐', category: 'nature', label: 'Gold Star' },
  { emoji: '🌙', category: 'nature', label: 'Moon' },
  { emoji: '☀️', category: 'nature', label: 'Sun' },
  { emoji: '🌲', category: 'nature', label: 'Tree' },

  // ── Faces ────────────────────────────────────────────────
  { emoji: '😊', category: 'faces', label: 'Happy' },
  { emoji: '😍', category: 'faces', label: 'Love' },
  { emoji: '🥰', category: 'faces', label: 'Adoring' },
  { emoji: '😎', category: 'faces', label: 'Cool' },
  { emoji: '🤩', category: 'faces', label: 'Starstruck' },
  { emoji: '😴', category: 'faces', label: 'Sleepy' },
  { emoji: '🤗', category: 'faces', label: 'Hugging' },
  { emoji: '😋', category: 'faces', label: 'Yummy' },

  // ── Objects ──────────────────────────────────────────────
  { emoji: '🚗', category: 'objects', label: 'Car' },
  { emoji: '✈️', category: 'objects', label: 'Airplane' },
  { emoji: '🏠', category: 'objects', label: 'House' },
  { emoji: '⚽', category: 'objects', label: 'Soccer Ball' },
  { emoji: '🎈', category: 'objects', label: 'Balloon' },
  { emoji: '🎁', category: 'objects', label: 'Gift' },
  { emoji: '🎵', category: 'objects', label: 'Music' },
  { emoji: '👑', category: 'objects', label: 'Crown' },

  // ── Shapes ───────────────────────────────────────────────
  { emoji: '❤️', category: 'shapes', label: 'Red Heart' },
  { emoji: '💜', category: 'shapes', label: 'Purple Heart' },
  { emoji: '💙', category: 'shapes', label: 'Blue Heart' },
  { emoji: '💚', category: 'shapes', label: 'Green Heart' },
  { emoji: '🔴', category: 'shapes', label: 'Red Circle' },
  { emoji: '🟡', category: 'shapes', label: 'Yellow Circle' },
  { emoji: '🔵', category: 'shapes', label: 'Blue Circle' },
  { emoji: '🟢', category: 'shapes', label: 'Green Circle' },
];
