// ── Playlists Configuration ─────────────────────────────
// Editorial content playlists for guided experiences.

import type { Playlist } from './types';

export const playlists: Playlist[] = [
  {
    id: 'pl-morning-kickstart',
    title: 'Morning Kickstart',
    emoji: '🌅',
    description: 'Start your day with energy! A mix of movement, a quick lesson, and a fun game.',
    contentIds: [
      'movement:morning-stretch',
      'lesson:l-4-abc-1',
      'game:memory-match',
      'movement:dance-party',
    ],
    curatedBy: 'Kids Learning Fun Team',
    estimatedMinutes: 15,
  },
  {
    id: 'pl-learn-alphabet',
    title: 'Learn the Alphabet',
    emoji: '🔤',
    description: 'A guided journey through all 26 letters with songs, lessons, and practice.',
    contentIds: [
      'lesson:l-2-abc-1',
      'alphabet:A', 'alphabet:B', 'alphabet:C', 'alphabet:D', 'alphabet:E',
      'video:v-abc-song',
      'alphabet:F', 'alphabet:G', 'alphabet:H', 'alphabet:I', 'alphabet:J',
      'game:word-builder',
      'alphabet:K', 'alphabet:L', 'alphabet:M', 'alphabet:N', 'alphabet:O',
      'alphabet:P', 'alphabet:Q', 'alphabet:R', 'alphabet:S', 'alphabet:T',
      'alphabet:U', 'alphabet:V', 'alphabet:W', 'alphabet:X', 'alphabet:Y', 'alphabet:Z',
    ],
    curatedBy: 'Kids Learning Fun Team',
    estimatedMinutes: 20,
  },
  {
    id: 'pl-calm-down',
    title: 'Calm Down After Play',
    emoji: '🧘',
    description: 'Wind down with gentle activities. Breathing, calm stories, and quiet coloring.',
    contentIds: [
      'movement:yoga-fun',
      'story:s-2-bed-1',
      'coloring:butterfly',
      'audio:calm-1',
      'emotion:calm',
    ],
    curatedBy: 'Kids Learning Fun Team',
    estimatedMinutes: 10,
  },
  {
    id: 'pl-rainy-day',
    title: 'Rainy Day Indoor Fun',
    emoji: '🌧',
    description: 'Stuck inside? No problem! Games, stories, cooking, and crafts to fill the day.',
    contentIds: [
      'game:color-splash',
      'story:s-4-adv-1',
      'cooking:ck-1',
      'coloring:rainbow',
      'game:memory-match',
      'lesson:l-4-science-1',
      'homeactivity:ha-1',
    ],
    curatedBy: 'Kids Learning Fun Team',
    estimatedMinutes: 30,
  },
  {
    id: 'pl-animal-week',
    title: 'Animal Week Playlist',
    emoji: '🐾',
    description: 'A week of animal fun! Meet new animals every day with stories, facts, and games.',
    contentIds: [
      'animal:cat', 'animal:dog', 'animal:elephant',
      'explorer:animals-intro',
      'story:s-2-bed-1',
      'coloring:cat', 'coloring:fish',
      'movement:animal-moves',
      'game:memory-match',
    ],
    curatedBy: 'Kids Learning Fun Team',
    estimatedMinutes: 25,
  },
];

/** Get a playlist by ID */
export function getPlaylistById(id: string): Playlist | undefined {
  return playlists.find((p) => p.id === id);
}
