export type MissionCategory =
  | 'learn'
  | 'play'
  | 'create'
  | 'listen'
  | 'wellbeing'
  | 'explore';

export type AgeGroup = '2-3' | '4-5' | '6-8';

export interface MissionTemplate {
  id: string;
  type: string;
  emoji: string;
  descriptionTemplate: string;
  route: string;
  category: MissionCategory;
  ageGroups: AgeGroup[];
}

export const missionTemplates: MissionTemplate[] = [
  {
    id: 'watch-video',
    type: 'watch-video',
    emoji: '\u{1F3AC}',
    descriptionTemplate: '{name}, watch a fun video!',
    route: '/videos',
    category: 'listen',
    ageGroups: ['2-3', '4-5', '6-8'],
  },
  {
    id: 'do-alphabet',
    type: 'do-alphabet',
    emoji: '\u{1F524}',
    descriptionTemplate: '{name}, practice 3 letters!',
    route: '/abc',
    category: 'learn',
    ageGroups: ['2-3', '4-5', '6-8'],
  },
  {
    id: 'dance-2min',
    type: 'dance-2min',
    emoji: '\u{1F483}',
    descriptionTemplate: '{name}, dance for 2 minutes!',
    route: '/movement',
    category: 'play',
    ageGroups: ['2-3', '4-5', '6-8'],
  },
  {
    id: 'listen-story',
    type: 'listen-story',
    emoji: '\u{1F4D6}',
    descriptionTemplate: '{name}, listen to a story!',
    route: '/stories',
    category: 'listen',
    ageGroups: ['2-3', '4-5', '6-8'],
  },
  {
    id: 'emotion-checkin',
    type: 'emotion-checkin',
    emoji: '\u{1F49A}',
    descriptionTemplate: '{name}, how are you feeling?',
    route: '/emotions',
    category: 'wellbeing',
    ageGroups: ['2-3', '4-5', '6-8'],
  },
  {
    id: 'draw-picture',
    type: 'draw-picture',
    emoji: '\u{1F3A8}',
    descriptionTemplate: '{name}, draw a picture!',
    route: '/coloring',
    category: 'create',
    ageGroups: ['2-3', '4-5', '6-8'],
  },
  {
    id: 'do-quiz',
    type: 'do-quiz',
    emoji: '\u{2753}',
    descriptionTemplate: '{name}, answer 5 quiz questions!',
    route: '/quiz',
    category: 'play',
    ageGroups: ['4-5', '6-8'],
  },
  {
    id: 'learn-numbers',
    type: 'learn-numbers',
    emoji: '\u{1F522}',
    descriptionTemplate: '{name}, count to 10!',
    route: '/numbers',
    category: 'learn',
    ageGroups: ['2-3', '4-5', '6-8'],
  },
  {
    id: 'explore-animals',
    type: 'explore-animals',
    emoji: '\u{1F43E}',
    descriptionTemplate: '{name}, learn about an animal!',
    route: '/animals',
    category: 'learn',
    ageGroups: ['2-3', '4-5', '6-8'],
  },
  {
    id: 'try-recipe',
    type: 'try-recipe',
    emoji: '\u{1F36A}',
    descriptionTemplate: '{name}, try a fun recipe!',
    route: '/cooking',
    category: 'create',
    ageGroups: ['4-5', '6-8'],
  },
  {
    id: 'bedtime-breathing',
    type: 'bedtime-breathing',
    emoji: '\u{1F319}',
    descriptionTemplate: '{name}, do a breathing exercise!',
    route: '/bedtime',
    category: 'wellbeing',
    ageGroups: ['2-3', '4-5', '6-8'],
  },
  {
    id: 'world-explorer',
    type: 'world-explorer',
    emoji: '\u{1F30D}',
    descriptionTemplate: '{name}, discover something new!',
    route: '/explorer',
    category: 'explore',
    ageGroups: ['4-5', '6-8'],
  },
];
