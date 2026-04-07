export interface StoryPage {
  text: string;
  emoji: string;
  highlightWords?: string[];
}

export interface Story {
  id: string;
  title: string;
  emoji: string;
  category: 'adventure' | 'animals' | 'bedtime' | 'friendship' | 'nature';
  ageGroup: '2-3' | '4-5' | '6-8';
  description: string;
  pages: StoryPage[];
}

export const storyCategories = [
  { key: 'adventure', label: 'Adventure', emoji: '🏴‍☠️' },
  { key: 'animals', label: 'Animals', emoji: '🐾' },
  { key: 'bedtime', label: 'Bedtime', emoji: '🌙' },
  { key: 'friendship', label: 'Friendship', emoji: '🤝' },
  { key: 'nature', label: 'Nature', emoji: '🌿' },
] as const;

export const storiesData: Story[] = [
  // === AGE 2-3 ===
  {
    id: 's-2-bed-1', title: 'Goodnight Moon', emoji: '🌙', category: 'bedtime', ageGroup: '2-3',
    description: 'A gentle bedtime story about saying goodnight.',
    pages: [
      { text: 'The big round moon came out to play.', emoji: '🌕', highlightWords: ['moon'] },
      { text: 'Goodnight stars, goodnight sky.', emoji: '⭐', highlightWords: ['stars', 'sky'] },
      { text: 'Goodnight trees, standing so high.', emoji: '🌳', highlightWords: ['trees'] },
      { text: 'Goodnight birds, tucked in your nest.', emoji: '🐦', highlightWords: ['birds', 'nest'] },
      { text: 'Close your eyes, it is time to rest.', emoji: '😴', highlightWords: ['eyes', 'rest'] },
    ],
  },
  {
    id: 's-2-ani-1', title: 'The Little Duck', emoji: '🦆', category: 'animals', ageGroup: '2-3',
    description: 'Follow a little duck on a pond adventure.',
    pages: [
      { text: 'A little duck lived by a big blue pond.', emoji: '🦆', highlightWords: ['duck', 'pond'] },
      { text: 'Quack quack! said the duck. Let me swim!', emoji: '💦', highlightWords: ['Quack', 'swim'] },
      { text: 'The duck met a frog. Ribbit! said the frog.', emoji: '🐸', highlightWords: ['frog', 'Ribbit'] },
      { text: 'They splashed and played in the sun.', emoji: '☀️', highlightWords: ['splashed', 'played', 'sun'] },
      { text: 'What a fun day! said the little duck.', emoji: '🦆', highlightWords: ['fun', 'day'] },
    ],
  },
  {
    id: 's-2-fri-1', title: 'My Best Friend', emoji: '🧸', category: 'friendship', ageGroup: '2-3',
    description: 'A story about a teddy bear and their best friend.',
    pages: [
      { text: 'Teddy Bear had a best friend named Bunny.', emoji: '🧸', highlightWords: ['Teddy', 'Bunny'] },
      { text: 'They liked to play together every day.', emoji: '🤗', highlightWords: ['play', 'together'] },
      { text: 'Teddy shared his cookies with Bunny.', emoji: '🍪', highlightWords: ['shared', 'cookies'] },
      { text: 'Bunny gave Teddy a big hug. Thank you!', emoji: '🐰', highlightWords: ['hug', 'Thank'] },
      { text: 'Best friends share and care. The end!', emoji: '❤️', highlightWords: ['share', 'care'] },
    ],
  },

  // === AGE 4-5 ===
  {
    id: 's-4-adv-1', title: 'The Magic Garden', emoji: '🌻', category: 'adventure', ageGroup: '4-5',
    description: 'Explore a magical garden full of surprises!',
    pages: [
      { text: 'Lily found a tiny door behind the old oak tree.', emoji: '🚪', highlightWords: ['door', 'oak', 'tree'] },
      { text: 'She opened it and stepped into a magic garden!', emoji: '🌻', highlightWords: ['magic', 'garden'] },
      { text: 'Flowers of every color danced in the breeze.', emoji: '🌸', highlightWords: ['Flowers', 'color', 'danced'] },
      { text: 'A butterfly with rainbow wings said, Welcome!', emoji: '🦋', highlightWords: ['butterfly', 'rainbow', 'Welcome'] },
      { text: 'Lily picked a golden sunflower. It began to glow!', emoji: '🌻', highlightWords: ['golden', 'sunflower', 'glow'] },
      { text: 'The garden sparkled with magic wherever she walked.', emoji: '✨', highlightWords: ['sparkled', 'magic'] },
      { text: 'I will come back tomorrow! Lily said with a smile.', emoji: '😊', highlightWords: ['tomorrow', 'smile'] },
    ],
  },
  {
    id: 's-4-nat-1', title: 'Rainbow After Rain', emoji: '🌈', category: 'nature', ageGroup: '4-5',
    description: 'Learn about rainbows in this colorful story.',
    pages: [
      { text: 'The rain fell softly on the meadow all morning.', emoji: '🌧️', highlightWords: ['rain', 'meadow', 'morning'] },
      { text: 'The flowers drank the water and grew tall.', emoji: '🌷', highlightWords: ['flowers', 'water', 'grew'] },
      { text: 'Then the sun peeked out from behind the clouds.', emoji: '☀️', highlightWords: ['sun', 'clouds'] },
      { text: 'A beautiful rainbow stretched across the sky!', emoji: '🌈', highlightWords: ['rainbow', 'sky'] },
      { text: 'Red, orange, yellow, green, blue, and purple!', emoji: '🎨', highlightWords: ['Red', 'orange', 'yellow', 'green', 'blue', 'purple'] },
      { text: 'The animals all stopped to look at the colors.', emoji: '🦊', highlightWords: ['animals', 'colors'] },
      { text: 'Nature makes the most beautiful art of all.', emoji: '🌈', highlightWords: ['Nature', 'beautiful', 'art'] },
    ],
  },
  {
    id: 's-4-ani-1', title: 'The Brave Little Cat', emoji: '🐱', category: 'animals', ageGroup: '4-5',
    description: 'A little cat goes on a brave adventure.',
    pages: [
      { text: 'Whiskers the cat was very small but very brave.', emoji: '🐱', highlightWords: ['Whiskers', 'small', 'brave'] },
      { text: 'One day he heard a tiny cry. Help! Help!', emoji: '😮', highlightWords: ['cry', 'Help'] },
      { text: 'A baby bird had fallen from its nest!', emoji: '🐦', highlightWords: ['bird', 'fallen', 'nest'] },
      { text: 'Whiskers climbed up the big tree very carefully.', emoji: '🌳', highlightWords: ['climbed', 'tree', 'carefully'] },
      { text: 'He gently picked up the bird in his paws.', emoji: '🐾', highlightWords: ['gently', 'picked', 'paws'] },
      { text: 'He put the baby bird back in its warm nest.', emoji: '🪹', highlightWords: ['baby', 'warm', 'nest'] },
      { text: 'Thank you, brave cat! chirped the little bird.', emoji: '💕', highlightWords: ['Thank', 'brave'] },
    ],
  },

  // === AGE 6-8 ===
  {
    id: 's-6-adv-1', title: 'The Treasure Map', emoji: '🗺️', category: 'adventure', ageGroup: '6-8',
    description: 'Follow a treasure map to find something amazing!',
    pages: [
      { text: 'Max found an old, crinkled map in the attic. It had a big red X on it!', emoji: '🗺️', highlightWords: ['map', 'attic', 'red'] },
      { text: 'The map showed a path through the park, past the fountain, to the old bridge.', emoji: '🌳', highlightWords: ['path', 'park', 'fountain', 'bridge'] },
      { text: 'Max packed his backpack with a flashlight, snacks, and a compass.', emoji: '🎒', highlightWords: ['backpack', 'flashlight', 'compass'] },
      { text: 'He followed the trail and counted twenty steps north from the fountain.', emoji: '🧭', highlightWords: ['trail', 'twenty', 'north'] },
      { text: 'Under the old bridge, he found a wooden box covered in leaves.', emoji: '📦', highlightWords: ['bridge', 'wooden', 'box', 'leaves'] },
      { text: 'Inside was a note: The real treasure is the adventure itself! And a gold coin.', emoji: '🪙', highlightWords: ['treasure', 'adventure', 'gold'] },
      { text: 'Max smiled. He could not wait for his next adventure!', emoji: '😄', highlightWords: ['smiled', 'adventure'] },
    ],
  },
  {
    id: 's-6-fri-1', title: 'The New Kid', emoji: '👋', category: 'friendship', ageGroup: '6-8',
    description: 'Making friends with someone new at school.',
    pages: [
      { text: 'A new kid named Sam joined the class on Monday. Sam looked nervous.', emoji: '😟', highlightWords: ['Sam', 'class', 'nervous'] },
      { text: 'At lunch, Sam sat alone at a table, eating quietly.', emoji: '🍽️', highlightWords: ['lunch', 'alone', 'quietly'] },
      { text: 'Emma noticed and walked over. Hi! I am Emma. Want to sit with us?', emoji: '👋', highlightWords: ['noticed', 'Emma', 'sit'] },
      { text: 'Sam smiled for the first time that day. Really? Thanks!', emoji: '😊', highlightWords: ['smiled', 'first', 'Thanks'] },
      { text: 'At recess they discovered they both loved drawing dinosaurs!', emoji: '🦕', highlightWords: ['recess', 'drawing', 'dinosaurs'] },
      { text: 'Sam drew a T-Rex and Emma drew a Triceratops. They traded pictures.', emoji: '🎨', highlightWords: ['T-Rex', 'Triceratops', 'traded'] },
      { text: 'Being kind to someone new can turn into a wonderful friendship.', emoji: '🤝', highlightWords: ['kind', 'wonderful', 'friendship'] },
    ],
  },
  {
    id: 's-6-nat-1', title: 'The Water Cycle', emoji: '💧', category: 'nature', ageGroup: '6-8',
    description: 'Learn how water travels around the world!',
    pages: [
      { text: 'Have you ever wondered where rain comes from? Let us find out!', emoji: '🌧️', highlightWords: ['rain', 'comes'] },
      { text: 'The sun heats the water in oceans, lakes, and rivers. The water turns into vapor!', emoji: '☀️', highlightWords: ['sun', 'heats', 'water', 'vapor'] },
      { text: 'The vapor rises up, up, up into the sky. This is called evaporation.', emoji: '⬆️', highlightWords: ['vapor', 'rises', 'evaporation'] },
      { text: 'Up high, the vapor gets cold and forms tiny water drops in clouds.', emoji: '☁️', highlightWords: ['cold', 'drops', 'clouds'] },
      { text: 'This is condensation! The clouds get heavier and heavier.', emoji: '🌥️', highlightWords: ['condensation', 'heavier'] },
      { text: 'When clouds are too heavy, the water falls back down as rain or snow!', emoji: '🌧️', highlightWords: ['heavy', 'falls', 'rain', 'snow'] },
      { text: 'The rain fills rivers and oceans, and the cycle starts all over again!', emoji: '🔄', highlightWords: ['rivers', 'oceans', 'cycle'] },
    ],
  },
];

export function getStoriesByAge(ageGroup: '2-3' | '4-5' | '6-8'): Story[] {
  return storiesData.filter(s => s.ageGroup === ageGroup);
}

export function getStoriesByCategory(category: Story['category']): Story[] {
  return storiesData.filter(s => s.category === category);
}

export function getStoryById(id: string): Story | undefined {
  return storiesData.find(s => s.id === id);
}
