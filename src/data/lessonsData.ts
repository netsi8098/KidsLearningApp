export type AgeGroup = '2-3' | '4-5' | '6-8';

export interface LessonStep {
  type: 'intro' | 'activity' | 'video' | 'quiz';
  title: string;
  content: string;
  emoji?: string;
  /** For quiz steps */
  question?: string;
  options?: string[];
  correctAnswer?: string;
  /** For video steps */
  videoId?: string;
}

export interface Lesson {
  id: string;
  title: string;
  emoji: string;
  topic: string;
  ageGroup: AgeGroup;
  description: string;
  steps: LessonStep[];
  prerequisiteId?: string;
  order: number;
}

export const lessonsData: Lesson[] = [
  // === AGE 2-3 ===
  {
    id: 'l-2-abc-1', title: 'Meet Letter A', emoji: '🍎', topic: 'alphabet', ageGroup: '2-3',
    description: 'Learn the letter A and words that start with A!', order: 1,
    steps: [
      { type: 'intro', title: 'Hello Letter A!', content: 'Today we learn the letter A! A is for Apple! 🍎', emoji: '🍎' },
      { type: 'activity', title: 'Find the A', content: 'Tap the letter A!', emoji: '🔤' },
      { type: 'video', title: 'A is for Apple Song', content: 'Watch and sing along!', videoId: '5XEN4mtV5x4' },
      { type: 'quiz', title: 'Quick Check', content: 'What letter does Apple start with?', question: 'What letter does Apple start with?', options: ['A', 'B', 'C', 'D'], correctAnswer: 'A' },
    ],
  },
  {
    id: 'l-2-abc-2', title: 'Meet Letter B', emoji: '🐻', topic: 'alphabet', ageGroup: '2-3',
    description: 'Learn the letter B and words that start with B!', order: 2, prerequisiteId: 'l-2-abc-1',
    steps: [
      { type: 'intro', title: 'Hello Letter B!', content: 'Today we learn the letter B! B is for Bear! 🐻', emoji: '🐻' },
      { type: 'activity', title: 'Find the B', content: 'Tap the letter B!', emoji: '🔤' },
      { type: 'video', title: 'B is for Bear Song', content: 'Watch and sing along!', videoId: 'BELlZKpi1Zs' },
      { type: 'quiz', title: 'Quick Check', content: 'What letter does Bear start with?', question: 'What letter does Bear start with?', options: ['A', 'B', 'C', 'D'], correctAnswer: 'B' },
    ],
  },
  {
    id: 'l-2-num-1', title: 'Number 1', emoji: '1️⃣', topic: 'numbers', ageGroup: '2-3',
    description: 'Learn the number 1 - one of everything!', order: 3,
    steps: [
      { type: 'intro', title: 'Number One!', content: 'One sun ☀️, one moon 🌙, one you! Today we learn number 1.', emoji: '1️⃣' },
      { type: 'activity', title: 'Count to 1', content: 'Tap one apple!', emoji: '🍎' },
      { type: 'video', title: 'Number 1 Song', content: 'Sing along!', videoId: 'Yt8GFgxlITs' },
      { type: 'quiz', title: 'Quick Check', content: 'How many suns? ☀️', question: 'How many suns? ☀️', options: ['1', '2', '3', '4'], correctAnswer: '1' },
    ],
  },
  {
    id: 'l-2-col-1', title: 'Red Color', emoji: '🔴', topic: 'colors', ageGroup: '2-3',
    description: 'Learn the color red and find red things!', order: 4,
    steps: [
      { type: 'intro', title: 'Hello Red!', content: 'Red like an apple 🍎, red like a fire truck 🚒! Let\'s learn red!', emoji: '🔴' },
      { type: 'activity', title: 'Find Red Things', content: 'Tap all the red items!', emoji: '🎯' },
      { type: 'video', title: 'Colors Song', content: 'Sing about colors!', videoId: 'zBMOCqk-M3M' },
      { type: 'quiz', title: 'Quick Check', content: 'What color is this? 🍎', question: 'What color is an apple?', options: ['Red', 'Blue', 'Green', 'Yellow'], correctAnswer: 'Red' },
    ],
  },
  {
    id: 'l-2-ani-1', title: 'Farm Animals', emoji: '🐄', topic: 'animals', ageGroup: '2-3',
    description: 'Meet the animals on the farm!', order: 5,
    steps: [
      { type: 'intro', title: 'Welcome to the Farm!', content: 'Let\'s meet the farm animals! Cow says Moo! 🐄', emoji: '🐄' },
      { type: 'activity', title: 'Animal Sounds', content: 'Match each animal to its sound!', emoji: '🔊' },
      { type: 'video', title: 'Old MacDonald', content: 'Sing along!', videoId: 'BsSz8MpUvKc' },
      { type: 'quiz', title: 'Quick Check', content: 'What does a cow say?', question: 'What does a cow say?', options: ['Moo', 'Woof', 'Meow', 'Baa'], correctAnswer: 'Moo' },
    ],
  },

  // === AGE 4-5 ===
  {
    id: 'l-4-abc-1', title: 'Phonics: Letter Sounds', emoji: '🗣️', topic: 'phonics', ageGroup: '4-5',
    description: 'Learn the sounds that letters make!', order: 1,
    steps: [
      { type: 'intro', title: 'Letter Sounds!', content: 'Letters make sounds! A says "ah", B says "buh". Let\'s practice!', emoji: '🗣️' },
      { type: 'activity', title: 'Sound Match', content: 'Match the letter to its sound!', emoji: '🔊' },
      { type: 'video', title: 'Phonics Song', content: 'Learn all the sounds!', videoId: 'BELlZKpi1Zs' },
      { type: 'quiz', title: 'Quick Check', content: 'What sound does C make?', question: 'What sound does the letter C make?', options: ['"kuh"', '"ah"', '"buh"', '"duh"'], correctAnswer: '"kuh"' },
    ],
  },
  {
    id: 'l-4-num-1', title: 'Counting to 20', emoji: '🔢', topic: 'numbers', ageGroup: '4-5',
    description: 'Practice counting all the way to 20!', order: 2,
    steps: [
      { type: 'intro', title: 'Count to 20!', content: 'Can you count to 20? Let\'s practice together!', emoji: '🔢' },
      { type: 'activity', title: 'Number Line', content: 'Tap each number in order!', emoji: '👆' },
      { type: 'video', title: 'Count to 20 Song', content: 'Sing and count!', videoId: 'Yt8GFgxlITs' },
      { type: 'quiz', title: 'Quick Check', content: 'What comes after 15?', question: 'What number comes after 15?', options: ['16', '14', '17', '13'], correctAnswer: '16' },
    ],
  },
  {
    id: 'l-4-shp-1', title: '2D Shapes', emoji: '🔷', topic: 'shapes', ageGroup: '4-5',
    description: 'Learn circles, squares, triangles and more!', order: 3,
    steps: [
      { type: 'intro', title: 'Shape World!', content: 'Shapes are everywhere! A ball is a circle ⚽, a window is a square ⬜', emoji: '🔷' },
      { type: 'activity', title: 'Shape Hunt', content: 'Match objects to their shapes!', emoji: '🔍' },
      { type: 'video', title: 'Shapes Song', content: 'Learn shapes!', videoId: 'OEbRDtCAFdU' },
      { type: 'quiz', title: 'Quick Check', content: 'How many sides does a triangle have?', question: 'How many sides does a triangle have?', options: ['3', '4', '5', '2'], correctAnswer: '3' },
    ],
  },
  {
    id: 'l-4-emo-1', title: 'Feelings & Emotions', emoji: '😊', topic: 'emotions', ageGroup: '4-5',
    description: 'Learn about different feelings!', order: 4,
    steps: [
      { type: 'intro', title: 'How Do You Feel?', content: 'Sometimes we feel happy 😊, sometimes sad 😢, and that\'s okay!', emoji: '😊' },
      { type: 'activity', title: 'Emotion Match', content: 'Match the face to the feeling!', emoji: '🎭' },
      { type: 'video', title: 'Feelings Song', content: 'Sing about feelings!', videoId: 'fe4fOiaKo5o' },
      { type: 'quiz', title: 'Quick Check', content: 'Which face is happy?', question: 'Which emoji shows happiness?', options: ['😊', '😢', '😠', '😴'], correctAnswer: '😊' },
    ],
  },

  // === AGE 6-8 ===
  {
    id: 'l-6-abc-1', title: 'Sight Words', emoji: '📖', topic: 'phonics', ageGroup: '6-8',
    description: 'Learn common sight words you see everywhere!', order: 1,
    steps: [
      { type: 'intro', title: 'Sight Words!', content: 'Some words are so common we should know them by sight: the, and, is, it, a', emoji: '📖' },
      { type: 'activity', title: 'Word Flash', content: 'Read each word as fast as you can!', emoji: '⚡' },
      { type: 'video', title: 'Sight Words Song', content: 'Practice sight words!', videoId: '2bLk6gXJNbw' },
      { type: 'quiz', title: 'Quick Check', content: 'Which is a sight word?', question: 'Which of these is a common sight word?', options: ['the', 'elephant', 'dinosaur', 'galaxy'], correctAnswer: 'the' },
    ],
  },
  {
    id: 'l-6-num-1', title: 'Addition Fun', emoji: '➕', topic: 'numbers', ageGroup: '6-8',
    description: 'Learn to add numbers together!', order: 2,
    steps: [
      { type: 'intro', title: 'Let\'s Add!', content: '2 apples + 3 apples = 5 apples! 🍎🍎 + 🍎🍎🍎 = 🍎🍎🍎🍎🍎', emoji: '➕' },
      { type: 'activity', title: 'Add It Up', content: 'Solve the addition problems!', emoji: '🧮' },
      { type: 'video', title: 'Addition Song', content: 'Sing and add!', videoId: '0TgLtF3PMOc' },
      { type: 'quiz', title: 'Quick Check', content: 'What is 3 + 4?', question: 'What is 3 + 4?', options: ['7', '6', '8', '5'], correctAnswer: '7' },
    ],
  },
  {
    id: 'l-6-rtn-1', title: 'Daily Routines', emoji: '🕐', topic: 'daily-routines', ageGroup: '6-8',
    description: 'Learn about morning, afternoon, and bedtime routines!', order: 3,
    steps: [
      { type: 'intro', title: 'My Day!', content: 'Morning: wake up 🌅, brush teeth 🪥. Afternoon: learn 📚, play 🏃. Evening: dinner 🍽️, sleep 😴', emoji: '🕐' },
      { type: 'activity', title: 'Order the Day', content: 'Put these activities in the right order!', emoji: '📋' },
      { type: 'video', title: 'Morning Routine', content: 'Watch a day!', videoId: 'ZanHgPprl-0' },
      { type: 'quiz', title: 'Quick Check', content: 'What do we do first in the morning?', question: 'What do we usually do first in the morning?', options: ['Wake up', 'Eat dinner', 'Go to bed', 'Play outside'], correctAnswer: 'Wake up' },
    ],
  },
];

export function getLessonsByAge(ageGroup: AgeGroup): Lesson[] {
  return lessonsData.filter(l => l.ageGroup === ageGroup).sort((a, b) => a.order - b.order);
}

export function getLessonById(id: string): Lesson | undefined {
  return lessonsData.find(l => l.id === id);
}

export const lessonTopics = [
  { key: 'alphabet', label: 'Alphabet', emoji: '🔤' },
  { key: 'phonics', label: 'Phonics', emoji: '🗣️' },
  { key: 'numbers', label: 'Numbers', emoji: '🔢' },
  { key: 'colors', label: 'Colors', emoji: '🎨' },
  { key: 'shapes', label: 'Shapes', emoji: '🔷' },
  { key: 'animals', label: 'Animals', emoji: '🐾' },
  { key: 'emotions', label: 'Emotions', emoji: '😊' },
  { key: 'daily-routines', label: 'Daily Routines', emoji: '🕐' },
];
