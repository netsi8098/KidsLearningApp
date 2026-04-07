// ── Skills Graph Configuration ──────────────────────────
// ~25 skill nodes organized hierarchically with content mappings.

import type { SkillCategory } from './types';

export const skillCategories: SkillCategory[] = [
  {
    id: 'literacy',
    label: 'Literacy',
    emoji: '📚',
    skills: [
      {
        id: 'letter-recognition',
        label: 'Letter Recognition',
        emoji: '🔤',
        parentId: 'literacy',
        contentIds: [
          ...Array.from({ length: 26 }, (_, i) =>
            `alphabet:${String.fromCharCode(65 + i)}`
          ),
          'lesson:l-2-abc-1',
          'lesson:l-4-abc-1',
          'lesson:l-6-abc-1',
        ],
      },
      {
        id: 'phonics',
        label: 'Phonics',
        emoji: '🗣',
        parentId: 'literacy',
        contentIds: [
          'lesson:l-4-phonics-1',
          'lesson:l-6-phonics-1',
        ],
      },
      {
        id: 'sight-words',
        label: 'Sight Words',
        emoji: '👀',
        parentId: 'literacy',
        contentIds: [
          'lesson:l-4-reading-1',
          'lesson:l-6-reading-1',
        ],
      },
      {
        id: 'reading',
        label: 'Reading',
        emoji: '📖',
        parentId: 'literacy',
        contentIds: [
          'story:s-2-bed-1',
          'story:s-2-bed-2',
          'story:s-4-adv-1',
          'story:s-4-adv-2',
          'story:s-6-fan-1',
          'story:s-6-fan-2',
        ],
      },
    ],
  },
  {
    id: 'math',
    label: 'Math',
    emoji: '🔢',
    skills: [
      {
        id: 'counting',
        label: 'Counting',
        emoji: '🧮',
        parentId: 'math',
        contentIds: [
          ...Array.from({ length: 20 }, (_, i) => `number:${i + 1}`),
          'lesson:l-2-num-1',
          'lesson:l-4-num-1',
        ],
      },
      {
        id: 'addition',
        label: 'Addition',
        emoji: '➕',
        parentId: 'math',
        contentIds: [
          'lesson:l-6-math-1',
          'game:number-pop',
        ],
      },
      {
        id: 'shapes-geometry',
        label: 'Shapes & Geometry',
        emoji: '📐',
        parentId: 'math',
        contentIds: [
          ...['circle', 'square', 'triangle', 'rectangle', 'star', 'heart', 'diamond', 'oval'].map(
            (s) => `shape:${s}`
          ),
          'lesson:l-2-shapes-1',
          'lesson:l-4-shapes-1',
        ],
      },
    ],
  },
  {
    id: 'science',
    label: 'Science & World',
    emoji: '🔬',
    skills: [
      {
        id: 'animals-nature',
        label: 'Animals & Nature',
        emoji: '🦁',
        parentId: 'science',
        contentIds: [
          'animal:cat', 'animal:dog', 'animal:cow', 'animal:duck',
          'animal:fish', 'animal:bird', 'animal:frog', 'animal:horse',
          'animal:elephant', 'animal:monkey', 'animal:lion', 'animal:rabbit',
          'explorer:animals-intro',
        ],
      },
      {
        id: 'weather-seasons',
        label: 'Weather & Seasons',
        emoji: '🌤',
        parentId: 'science',
        contentIds: [
          'explorer:weather',
          'explorer:seasons',
        ],
      },
      {
        id: 'space',
        label: 'Space',
        emoji: '🚀',
        parentId: 'science',
        contentIds: [
          'explorer:solar-system',
          'explorer:stars',
        ],
      },
      {
        id: 'human-body',
        label: 'Human Body',
        emoji: '🫀',
        parentId: 'science',
        contentIds: [
          'bodypart:head', 'bodypart:eyes', 'bodypart:ears', 'bodypart:nose',
          'bodypart:mouth', 'bodypart:hands', 'bodypart:feet', 'bodypart:tummy',
          'bodypart:knees', 'bodypart:shoulders',
        ],
      },
    ],
  },
  {
    id: 'social-emotional',
    label: 'Social & Emotional',
    emoji: '💛',
    skills: [
      {
        id: 'emotions',
        label: 'Understanding Emotions',
        emoji: '😊',
        parentId: 'social-emotional',
        contentIds: [
          'emotion:happy', 'emotion:sad', 'emotion:angry', 'emotion:scared',
          'emotion:surprised', 'emotion:excited', 'emotion:calm', 'emotion:frustrated',
          'emotion:proud', 'emotion:silly',
        ],
      },
      {
        id: 'kindness',
        label: 'Kindness & Sharing',
        emoji: '🤝',
        parentId: 'social-emotional',
        contentIds: [
          'lifeskill:ls-sharing',
          'lifeskill:ls-manners',
          'lifeskill:ls-helping',
        ],
      },
    ],
  },
  {
    id: 'physical',
    label: 'Physical',
    emoji: '🏃',
    skills: [
      {
        id: 'gross-motor',
        label: 'Gross Motor',
        emoji: '🤸',
        parentId: 'physical',
        contentIds: [
          'movement:dance-party',
          'movement:animal-moves',
          'movement:freeze-dance',
          'movement:obstacle-course',
        ],
      },
      {
        id: 'fine-motor',
        label: 'Fine Motor',
        emoji: '✏️',
        parentId: 'physical',
        contentIds: [
          'coloring:cat', 'coloring:fish', 'coloring:butterfly',
          'coloring:sun', 'coloring:rainbow',
        ],
      },
    ],
  },
  {
    id: 'creativity',
    label: 'Creativity',
    emoji: '🎨',
    skills: [
      {
        id: 'visual-art',
        label: 'Visual Art',
        emoji: '🖌',
        parentId: 'creativity',
        contentIds: [
          'coloring:cat', 'coloring:fish', 'coloring:butterfly',
          'coloring:house', 'coloring:flower', 'coloring:star',
          'color:red', 'color:blue', 'color:yellow', 'color:green',
        ],
      },
      {
        id: 'music',
        label: 'Music & Rhythm',
        emoji: '🎵',
        parentId: 'creativity',
        contentIds: [
          'audio:nursery-1', 'audio:nursery-2',
          'movement:dance-party', 'movement:freeze-dance',
        ],
      },
    ],
  },
];

/** Get all skill nodes flat */
export function getAllSkills() {
  return skillCategories.flatMap((cat) => cat.skills);
}

/** Find which skills a content item belongs to */
export function getSkillsForContent(contentId: string): string[] {
  const skills: string[] = [];
  for (const cat of skillCategories) {
    for (const skill of cat.skills) {
      if (skill.contentIds.includes(contentId)) {
        skills.push(skill.id);
      }
    }
  }
  return skills;
}

/** Get content IDs for a skill */
export function getContentForSkill(skillId: string): string[] {
  for (const cat of skillCategories) {
    const skill = cat.skills.find((s) => s.id === skillId);
    if (skill) return skill.contentIds;
  }
  return [];
}
