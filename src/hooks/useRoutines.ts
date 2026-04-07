import { useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Routine, type RoutineItem } from '../db/database';
import { useApp } from '../context/AppContext';

export interface RoutineTemplate {
  name: string;
  type: Routine['type'];
  emoji: string;
  items: RoutineItem[];
  estimatedMinutes: number;
}

const routineTemplates: RoutineTemplate[] = [
  {
    name: 'Morning Learner',
    type: 'morning',
    emoji: '\u{1F305}',
    items: [
      { contentId: 'movement-stretch', title: 'Morning Stretch', emoji: '\u{1F9D8}', durationMinutes: 5 },
      { contentId: 'abc-practice', title: 'Letter Practice', emoji: '\u{1F524}', durationMinutes: 10 },
      { contentId: 'story-time', title: 'Story Time', emoji: '\u{1F4D6}', durationMinutes: 10 },
      { contentId: 'coloring-free', title: 'Creative Coloring', emoji: '\u{1F3A8}', durationMinutes: 10 },
    ],
    estimatedMinutes: 35,
  },
  {
    name: 'After-School Fun',
    type: 'after_school',
    emoji: '\u{1F3E0}',
    items: [
      { contentId: 'movement-dance', title: 'Dance Break', emoji: '\u{1F483}', durationMinutes: 5 },
      { contentId: 'numbers-counting', title: 'Counting Practice', emoji: '\u{1F522}', durationMinutes: 10 },
      { contentId: 'game-matching', title: 'Matching Game', emoji: '\u{1F0CF}', durationMinutes: 10 },
      { contentId: 'audio-music', title: 'Sing Along', emoji: '\u{1F3B5}', durationMinutes: 10 },
    ],
    estimatedMinutes: 35,
  },
  {
    name: 'Bedtime Wind Down',
    type: 'bedtime',
    emoji: '\u{1F31C}',
    items: [
      { contentId: 'breathing-calm', title: 'Breathing Exercise', emoji: '\u{1F32C}\u{FE0F}', durationMinutes: 5 },
      { contentId: 'story-bedtime', title: 'Bedtime Story', emoji: '\u{1F4D6}', durationMinutes: 10 },
      { contentId: 'audio-lullaby', title: 'Calm Sounds', emoji: '\u{1F3B6}', durationMinutes: 5 },
    ],
    estimatedMinutes: 20,
  },
  {
    name: 'Weekend Explorer',
    type: 'weekend',
    emoji: '\u{1F389}',
    items: [
      { contentId: 'explorer-animals', title: 'Animal Explorer', emoji: '\u{1F43E}', durationMinutes: 10 },
      { contentId: 'cooking-recipe', title: 'Cooking Adventure', emoji: '\u{1F373}', durationMinutes: 15 },
      { contentId: 'coloring-art', title: 'Art Time', emoji: '\u{1F58C}\u{FE0F}', durationMinutes: 15 },
      { contentId: 'game-quiz', title: 'Fun Quiz', emoji: '\u{1F9E0}', durationMinutes: 10 },
      { contentId: 'movement-yoga', title: 'Yoga for Kids', emoji: '\u{1F9D8}', durationMinutes: 10 },
    ],
    estimatedMinutes: 60,
  },
  {
    name: 'Travel Buddy',
    type: 'travel',
    emoji: '\u{1F697}',
    items: [
      { contentId: 'audio-story', title: 'Listen to a Story', emoji: '\u{1F3A7}', durationMinutes: 10 },
      { contentId: 'game-shapes', title: 'Shape Spotter', emoji: '\u{1F537}', durationMinutes: 10 },
      { contentId: 'abc-songs', title: 'ABC Songs', emoji: '\u{1F3B5}', durationMinutes: 5 },
      { contentId: 'colors-quiz', title: 'Color Quiz', emoji: '\u{1F308}', durationMinutes: 10 },
    ],
    estimatedMinutes: 35,
  },
];

export function useRoutines() {
  const { currentPlayer } = useApp();
  const playerId = currentPlayer?.id;

  const routines = useLiveQuery(
    () => (playerId ? db.routines.where('playerId').equals(playerId).toArray() : []),
    [playerId],
    [] as Routine[]
  );

  const createRoutine = useCallback(
    async (data: {
      name: string;
      type: Routine['type'];
      days: string[];
      time: string;
      estimatedMinutes: number;
      items: RoutineItem[];
    }) => {
      if (!playerId) return;
      const now = new Date();
      await db.routines.add({
        playerId,
        name: data.name,
        type: data.type,
        days: data.days,
        time: data.time,
        estimatedMinutes: data.estimatedMinutes,
        items: data.items,
        createdAt: now,
        updatedAt: now,
      });
    },
    [playerId]
  );

  const updateRoutine = useCallback(
    async (routineId: number, updates: Partial<Routine>) => {
      await db.routines.update(routineId, { ...updates, updatedAt: new Date() });
    },
    []
  );

  const deleteRoutine = useCallback(async (routineId: number) => {
    await db.routines.delete(routineId);
  }, []);

  const createFromTemplate = useCallback(
    async (template: RoutineTemplate) => {
      if (!playerId) return;
      const now = new Date();
      await db.routines.add({
        playerId,
        name: template.name,
        type: template.type,
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        time: '09:00',
        estimatedMinutes: template.estimatedMinutes,
        items: template.items,
        createdAt: now,
        updatedAt: now,
      });
    },
    [playerId]
  );

  return {
    routines,
    createRoutine,
    updateRoutine,
    deleteRoutine,
    templates: routineTemplates,
    createFromTemplate,
  };
}
