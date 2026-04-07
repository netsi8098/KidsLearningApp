import { useState, useMemo, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { useApp } from '../context/AppContext';

export type TipCategory = 'expert' | 'routines' | 'play' | 'bedtime' | 'education';
export type TipFormat = 'article' | 'checklist' | 'quick_tip';

export interface ParentTip {
  id: string;
  title: string;
  category: TipCategory;
  format: TipFormat;
  body: string;
  preview: string;
  emoji: string;
}

const tipsData: ParentTip[] = [
  {
    id: 'tip-001',
    title: 'Screen Time Balance',
    category: 'expert',
    format: 'article',
    body: 'The American Academy of Pediatrics recommends limiting screen time for children under 5 to 1 hour per day of high-quality content. Use co-viewing when possible to make it an interactive experience. Discuss what your child sees and help them understand how it applies to the world around them.',
    preview: 'Learn how to balance digital learning with other activities...',
    emoji: '\u{1F4F1}',
  },
  {
    id: 'tip-002',
    title: 'Morning Learning Routine',
    category: 'routines',
    format: 'checklist',
    body: '1. Start with a movement activity (5 min)\n2. Practice letters or numbers (10 min)\n3. Read a story together (10 min)\n4. Creative coloring or drawing (10 min)\n5. Free play time (15 min)\n\nKeep the routine consistent but flexible. If your child is deeply engaged, let them explore longer.',
    preview: 'A structured morning routine that builds learning habits...',
    emoji: '\u{1F305}',
  },
  {
    id: 'tip-003',
    title: 'Sensory Play Ideas',
    category: 'play',
    format: 'article',
    body: 'Sensory play helps children explore the world through touch, sight, sound, smell, and taste. Try these activities:\n\n- Water play with cups and funnels\n- Playdough shapes matching the app lessons\n- Sand tray letter writing\n- Sorting objects by color or size\n- Nature walks collecting leaves and rocks',
    preview: 'Hands-on activities that complement digital learning...',
    emoji: '\u{1F9F8}',
  },
  {
    id: 'tip-004',
    title: 'Calm Bedtime Transitions',
    category: 'bedtime',
    format: 'quick_tip',
    body: 'Use the app\'s bedtime mode 30 minutes before sleep. The dimmed colors and gentle sounds help signal to your child that it\'s time to wind down. Follow the bedtime story with a breathing exercise, then turn off screens for the final 15 minutes before sleep.',
    preview: 'Make the transition from play to sleep smoother...',
    emoji: '\u{1F31C}',
  },
  {
    id: 'tip-005',
    title: 'Learning Through Play',
    category: 'education',
    format: 'article',
    body: 'Children learn best through play-based activities. When your child completes a lesson about animals, extend the learning by:\n\n- Visiting a local zoo or farm\n- Reading books about the animals they learned\n- Acting out animal movements and sounds\n- Drawing their favorite animals\n- Counting animal toys at home',
    preview: 'Extend digital lessons into real-world experiences...',
    emoji: '\u{1F3AD}',
  },
  {
    id: 'tip-006',
    title: 'Encouraging Persistence',
    category: 'expert',
    format: 'quick_tip',
    body: 'When your child struggles with a challenge in the app, resist the urge to help immediately. Instead, say encouraging things like "You can try again!" or "What if you tried it a different way?" This builds resilience and problem-solving skills. Celebrate the effort, not just the outcome.',
    preview: 'Help your child develop a growth mindset...',
    emoji: '\u{1F4AA}',
  },
  {
    id: 'tip-007',
    title: 'After-School Wind Down',
    category: 'routines',
    format: 'checklist',
    body: '1. Snack time and chat about the day (10 min)\n2. Free play or outdoor time (20 min)\n3. One app lesson of their choice (10 min)\n4. Creative activity: coloring, cooking, or music (15 min)\n5. Quiet reading time (10 min)',
    preview: 'A balanced after-school routine mixing learning and rest...',
    emoji: '\u{1F3E0}',
  },
  {
    id: 'tip-008',
    title: 'Outdoor Learning Adventures',
    category: 'play',
    format: 'article',
    body: 'Take the learning outside! After your child practices colors in the app, go on a color scavenger hunt in the park. Practice counting with rocks, sticks, and flowers. Identify shapes in buildings and signs. Nature is the best classroom for reinforcing early learning concepts.',
    preview: 'Connect app lessons to outdoor exploration...',
    emoji: '\u{1F333}',
  },
  {
    id: 'tip-009',
    title: 'Reading Before Bed',
    category: 'bedtime',
    format: 'article',
    body: 'Reading before bed strengthens vocabulary, imagination, and the parent-child bond. After using the app\'s bedtime stories, transition to a physical book. Let your child choose the book. Ask open-ended questions: "What do you think happens next?" This builds comprehension and critical thinking.',
    preview: 'Combine digital and physical reading for bedtime...',
    emoji: '\u{1F4DA}',
  },
  {
    id: 'tip-010',
    title: 'Making Math Fun',
    category: 'education',
    format: 'quick_tip',
    body: 'Numbers are everywhere! Count steps as you climb stairs. Sort laundry by color. Share snacks equally. Measure ingredients while cooking. When your child practices numbers in the app, connect it to these real-world moments. Say "You learned about 5 in the app today - can you find 5 things in the room?"',
    preview: 'Real-world math connections for young learners...',
    emoji: '\u{1F522}',
  },
];

export function useParentTips() {
  const { currentPlayer } = useApp();
  const playerId = currentPlayer?.id;
  const [category, setCategory] = useState<TipCategory | 'all'>('all');

  const savedTipRecords = useLiveQuery(
    () => (playerId ? db.savedTips.where('playerId').equals(playerId).toArray() : []),
    [playerId],
    []
  );

  const savedTipIds = useMemo(
    () => new Set(savedTipRecords.map((r) => r.tipId)),
    [savedTipRecords]
  );

  const tips = useMemo(() => {
    if (category === 'all') return tipsData;
    return tipsData.filter((t) => t.category === category);
  }, [category]);

  const savedTips = useMemo(
    () => tipsData.filter((t) => savedTipIds.has(t.id)),
    [savedTipIds]
  );

  const saveTip = useCallback(
    async (tipId: string) => {
      if (!playerId) return;
      const exists = await db.savedTips
        .where('[playerId+tipId]')
        .equals([playerId, tipId])
        .first();
      if (!exists) {
        await db.savedTips.add({ playerId, tipId, savedAt: new Date() });
      }
    },
    [playerId]
  );

  const unsaveTip = useCallback(
    async (tipId: string) => {
      if (!playerId) return;
      await db.savedTips.where('[playerId+tipId]').equals([playerId, tipId]).delete();
    },
    [playerId]
  );

  const filterByCategory = useCallback((cat: TipCategory | 'all') => {
    setCategory(cat);
  }, []);

  const isSaved = useCallback(
    (tipId: string) => savedTipIds.has(tipId),
    [savedTipIds]
  );

  return { tips, savedTips, saveTip, unsaveTip, filterByCategory, category, isSaved };
}
