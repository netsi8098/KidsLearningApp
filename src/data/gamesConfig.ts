export type GameDifficulty = 'easy' | 'medium' | 'hard';

export interface GameConfig {
  id: string;
  title: string;
  emoji: string;
  description: string;
  color: string;
  difficulties: {
    level: GameDifficulty;
    label: string;
    description: string;
    timeLimit?: number; // seconds, 0 = no limit
    itemCount: number;
  }[];
}

export const gamesConfig: GameConfig[] = [
  {
    id: 'word-builder',
    title: 'Word Builder',
    emoji: '🔤',
    description: 'Build words by tapping letters in the right order!',
    color: '#FF6B6B',
    difficulties: [
      { level: 'easy', label: 'Easy', description: '3-letter words', itemCount: 5, timeLimit: 0 },
      { level: 'medium', label: 'Medium', description: '4-letter words', itemCount: 8, timeLimit: 60 },
      { level: 'hard', label: 'Hard', description: '5-letter words', itemCount: 10, timeLimit: 45 },
    ],
  },
  {
    id: 'number-pop',
    title: 'Number Pop',
    emoji: '🎈',
    description: 'Pop the balloons in counting order!',
    color: '#4ECDC4',
    difficulties: [
      { level: 'easy', label: 'Easy', description: 'Count 1-5', itemCount: 5, timeLimit: 0 },
      { level: 'medium', label: 'Medium', description: 'Count 1-10', itemCount: 10, timeLimit: 30 },
      { level: 'hard', label: 'Hard', description: 'Count 1-20', itemCount: 20, timeLimit: 30 },
    ],
  },
  {
    id: 'color-splash',
    title: 'Color Splash',
    emoji: '🎨',
    description: 'Tap items that match the color shown!',
    color: '#FFB347',
    difficulties: [
      { level: 'easy', label: 'Easy', description: '3 colors', itemCount: 6, timeLimit: 0 },
      { level: 'medium', label: 'Medium', description: '5 colors', itemCount: 10, timeLimit: 30 },
      { level: 'hard', label: 'Hard', description: '8 colors', itemCount: 15, timeLimit: 25 },
    ],
  },
  {
    id: 'animal-sounds',
    title: 'Animal Sounds',
    emoji: '🐾',
    description: 'Listen to the sound and pick the right animal!',
    color: '#6BCB77',
    difficulties: [
      { level: 'easy', label: 'Easy', description: '4 animals', itemCount: 4, timeLimit: 0 },
      { level: 'medium', label: 'Medium', description: '8 animals', itemCount: 8, timeLimit: 45 },
      { level: 'hard', label: 'Hard', description: '12 animals', itemCount: 12, timeLimit: 30 },
    ],
  },
  {
    id: 'shape-sort',
    title: 'Shape Sort',
    emoji: '🔷',
    description: 'Sort the shapes into the correct boxes!',
    color: '#A78BFA',
    difficulties: [
      { level: 'easy', label: 'Easy', description: '3 shapes', itemCount: 6, timeLimit: 0 },
      { level: 'medium', label: 'Medium', description: '5 shapes', itemCount: 10, timeLimit: 40 },
      { level: 'hard', label: 'Hard', description: '8 shapes', itemCount: 16, timeLimit: 30 },
    ],
  },
];

export const wordBuilderWords = {
  easy: ['cat', 'dog', 'sun', 'hat', 'cup', 'red', 'big', 'run', 'hop', 'sit'],
  medium: ['bear', 'fish', 'duck', 'tree', 'star', 'blue', 'jump', 'play', 'home', 'book'],
  hard: ['apple', 'happy', 'house', 'water', 'green', 'plant', 'smile', 'cloud', 'music', 'dance'],
};

export const numberPopEmojis = ['🎈', '🟡', '🔵', '🟢', '🟣', '🟠', '⭐', '💎', '🌟', '🫧'];

export function getGameById(id: string): GameConfig | undefined {
  return gamesConfig.find(g => g.id === id);
}
