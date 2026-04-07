// ── Offline Packs Configuration ─────────────────────────
// Pre-defined content bundles for offline download.

import type { OfflinePack } from './types';

export const offlinePacks: OfflinePack[] = [
  {
    id: 'pack-road-trip',
    title: 'Road Trip',
    emoji: '🚗',
    contentIds: [
      'game:memory-match', 'game:color-splash',
      'story:s-2-bed-1', 'story:s-4-adv-1',
      'lesson:l-2-abc-1', 'lesson:l-4-num-1',
      'coloring:car', 'coloring:sun',
      'audio:nursery-1', 'audio:nursery-2',
    ],
    sizeEstimateMB: 2,
    ageGroup: '2-3',
  },
  {
    id: 'pack-bedtime',
    title: 'Bedtime',
    emoji: '🌙',
    contentIds: [
      'story:s-2-bed-1', 'story:s-2-bed-2',
      'audio:calm-1',
      'emotion:calm',
      'coloring:star', 'coloring:moon',
    ],
    sizeEstimateMB: 1,
  },
  {
    id: 'pack-alphabet-starter',
    title: 'Alphabet Starter',
    emoji: '🔤',
    contentIds: [
      ...Array.from({ length: 26 }, (_, i) =>
        `alphabet:${String.fromCharCode(65 + i)}`
      ),
      'lesson:l-2-abc-1',
      'game:word-builder',
    ],
    sizeEstimateMB: 1,
    ageGroup: '2-3',
  },
  {
    id: 'pack-restaurant',
    title: 'Quiet Restaurant',
    emoji: '🤫',
    contentIds: [
      'coloring:cat', 'coloring:fish', 'coloring:butterfly',
      'coloring:flower', 'coloring:house',
      'game:memory-match',
      'story:s-4-adv-1',
    ],
    sizeEstimateMB: 1.5,
    ageGroup: '4-5',
  },
  {
    id: 'pack-airplane',
    title: 'Airplane Travel',
    emoji: '✈️',
    contentIds: [
      'game:memory-match', 'game:color-splash', 'game:number-pop',
      'lesson:l-4-abc-1', 'lesson:l-4-num-1',
      'story:s-4-adv-1', 'story:s-4-adv-2',
      'coloring:airplane', 'coloring:rainbow',
      'audio:nursery-1',
    ],
    sizeEstimateMB: 2.5,
    ageGroup: '4-5',
  },
];

/** Get pack by ID */
export function getOfflinePack(id: string): OfflinePack | undefined {
  return offlinePacks.find((p) => p.id === id);
}
