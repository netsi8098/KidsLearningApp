export interface Milestone {
  id: string;
  title: string;
  emoji: string;
  description: string;
  checkFn: string;
}

export const milestones: Milestone[] = [
  {
    id: 'first-10',
    title: 'First 10 Activities',
    emoji: '🌟',
    description: 'Complete 10 activities of any type',
    checkFn: 'checkFirst10',
  },
  {
    id: 'first-week',
    title: 'One Week Streak',
    emoji: '🔥',
    description: 'Learn for 7 days in a row',
    checkFn: 'checkFirstWeek',
  },
  {
    id: 'alphabet-starter',
    title: 'Alphabet Explorer',
    emoji: '🔤',
    description: 'Learn 10 letters',
    checkFn: 'checkAlphabetStarter',
  },
  {
    id: 'all-colors',
    title: 'Color Master',
    emoji: '🎨',
    description: 'Learn all 10 colors',
    checkFn: 'checkAllColors',
  },
  {
    id: 'number-whiz',
    title: 'Number Whiz',
    emoji: '🔢',
    description: 'Learn 10 numbers',
    checkFn: 'checkNumberWhiz',
  },
  {
    id: 'shape-expert',
    title: 'Shape Expert',
    emoji: '🔷',
    description: 'Learn all 8 shapes',
    checkFn: 'checkShapeExpert',
  },
  {
    id: 'dance-star',
    title: 'Dance Star',
    emoji: '💃',
    description: 'Complete 5 movement activities',
    checkFn: 'checkDanceStar',
  },
  {
    id: 'first-drawing',
    title: 'First Masterpiece',
    emoji: '🖼️',
    description: 'Save your first artwork',
    checkFn: 'checkFirstDrawing',
  },
  {
    id: 'story-lover',
    title: 'Story Lover',
    emoji: '📖',
    description: 'Read 5 stories',
    checkFn: 'checkStoryLover',
  },
  {
    id: 'quiz-champion',
    title: 'Quiz Champion',
    emoji: '🏆',
    description: 'Score 100% on any quiz',
    checkFn: 'checkQuizChampion',
  },
  {
    id: 'explorer',
    title: 'World Explorer',
    emoji: '🌍',
    description: 'Complete 3 explorer topics',
    checkFn: 'checkExplorer',
  },
  {
    id: 'social-butterfly',
    title: 'Kind Heart',
    emoji: '💚',
    description: 'Complete 5 life skills lessons',
    checkFn: 'checkSocialButterfly',
  },
];
