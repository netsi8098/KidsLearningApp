// ─── Sing-Along Data Model & Sample Songs ─────────────────────────────────
// Word-level timing for karaoke-style lyric highlighting.
// Timing values are in milliseconds from the start of the song.

export interface LyricWord {
  word: string;
  startTime: number; // ms from song start
  endTime: number;
}

export interface LyricLine {
  text: string;
  startTime: number; // ms from song start
  endTime: number;
  words: LyricWord[];
  isCallAndResponse?: boolean; // for lead-and-repeat mode
}

export interface SongSection {
  type: 'verse' | 'chorus' | 'bridge' | 'intro' | 'outro';
  label: string;
  lines: LyricLine[];
}

export type SongCategory = 'nursery' | 'alphabet' | 'counting' | 'action' | 'bedtime' | 'seasonal';
export type AgeGroup = '2-3' | '4-5' | '6-8' | 'all';
export type VocalMode = 'full' | 'instrumental' | 'lead-repeat';

export interface SingAlongSong {
  id: string;
  title: string;
  emoji: string;
  category: SongCategory;
  ageGroup: AgeGroup;
  bpm: number;
  key: string;
  duration: number; // seconds
  vocalModes: VocalMode[];
  sections: SongSection[];
}

// ─── Helper: build a LyricLine from text and per-word timings ──────────────
function buildLine(
  text: string,
  startTime: number,
  wordDurations: number[],
  isCallAndResponse = false,
): LyricLine {
  const rawWords = text.split(/\s+/);
  let cursor = startTime;
  const words: LyricWord[] = rawWords.map((word, i) => {
    const dur = wordDurations[i] ?? 400;
    const w: LyricWord = { word, startTime: cursor, endTime: cursor + dur };
    cursor += dur;
    return w;
  });
  return {
    text,
    startTime,
    endTime: words[words.length - 1].endTime,
    words,
    isCallAndResponse,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// SONG 1: ABC Song
// Category: alphabet | All ages | 60 BPM | Key: C | ~42 seconds
// ═══════════════════════════════════════════════════════════════════════════
const abcSong: SingAlongSong = {
  id: 'song-abc',
  title: 'ABC Song',
  emoji: '🔤',
  category: 'alphabet',
  ageGroup: 'all',
  bpm: 60,
  key: 'C',
  duration: 42,
  vocalModes: ['full', 'instrumental', 'lead-repeat'],
  sections: [
    {
      type: 'verse',
      label: 'Verse 1',
      lines: [
        buildLine('A B C D E F G', 0, [800, 800, 800, 800, 800, 800, 1200]),
        buildLine('H I J K L M N O P', 6400, [600, 600, 600, 600, 600, 600, 600, 600, 800]),
        buildLine('Q R S T U V', 12200, [800, 800, 800, 800, 800, 1200]),
        buildLine('W X Y and Z', 17400, [900, 900, 900, 500, 1200]),
      ],
    },
    {
      type: 'chorus',
      label: 'Chorus',
      lines: [
        buildLine('Now I know my ABCs', 21900, [500, 500, 700, 600, 1400]),
        buildLine('Next time won\'t you sing with me', 25600, [600, 600, 700, 600, 700, 600, 800]),
      ],
    },
    {
      type: 'verse',
      label: 'Verse 2',
      lines: [
        buildLine('A B C D E F G', 30200, [800, 800, 800, 800, 800, 800, 1200], true),
        buildLine('H I J K L M N O P', 36600, [600, 600, 600, 600, 600, 600, 600, 600, 800], true),
      ],
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// SONG 2: Five Little Monkeys
// Category: counting | Age 2-3 | 100 BPM | Key: G | ~58 seconds
// ═══════════════════════════════════════════════════════════════════════════
const fiveLittleMonkeys: SingAlongSong = {
  id: 'song-monkeys',
  title: 'Five Little Monkeys',
  emoji: '🐒',
  category: 'counting',
  ageGroup: '2-3',
  bpm: 100,
  key: 'G',
  duration: 58,
  vocalModes: ['full', 'lead-repeat'],
  sections: [
    {
      type: 'verse',
      label: 'Five Monkeys',
      lines: [
        buildLine('Five little monkeys jumping on the bed', 0, [500, 500, 600, 550, 400, 450, 600]),
        buildLine('One fell off and bumped his head', 3600, [500, 500, 500, 400, 500, 450, 600]),
        buildLine('Mama called the doctor and the doctor said', 6500, [500, 500, 400, 550, 350, 400, 550, 550]),
        buildLine('No more monkeys jumping on the bed!', 10300, [400, 500, 600, 550, 400, 450, 700], true),
      ],
    },
    {
      type: 'verse',
      label: 'Four Monkeys',
      lines: [
        buildLine('Four little monkeys jumping on the bed', 14200, [500, 500, 600, 550, 400, 450, 600]),
        buildLine('One fell off and bumped his head', 17800, [500, 500, 500, 400, 500, 450, 600]),
        buildLine('Mama called the doctor and the doctor said', 20700, [500, 500, 400, 550, 350, 400, 550, 550]),
        buildLine('No more monkeys jumping on the bed!', 24500, [400, 500, 600, 550, 400, 450, 700], true),
      ],
    },
    {
      type: 'verse',
      label: 'Three Monkeys',
      lines: [
        buildLine('Three little monkeys jumping on the bed', 28400, [500, 500, 600, 550, 400, 450, 600]),
        buildLine('One fell off and bumped his head', 32000, [500, 500, 500, 400, 500, 450, 600]),
        buildLine('Mama called the doctor and the doctor said', 34900, [500, 500, 400, 550, 350, 400, 550, 550]),
        buildLine('No more monkeys jumping on the bed!', 38700, [400, 500, 600, 550, 400, 450, 700], true),
      ],
    },
    {
      type: 'outro',
      label: 'No More Monkeys!',
      lines: [
        buildLine('No more monkeys jumping on the bed!', 42600, [500, 500, 700, 600, 450, 500, 800]),
        buildLine('They are all asleep instead!', 46350, [500, 500, 500, 600, 700, 800]),
      ],
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// SONG 3: Twinkle Twinkle Little Star
// Category: bedtime | All ages | 72 BPM | Key: C | ~50 seconds
// ═══════════════════════════════════════════════════════════════════════════
const twinkleTwinkle: SingAlongSong = {
  id: 'song-twinkle',
  title: 'Twinkle Twinkle Little Star',
  emoji: '⭐',
  category: 'bedtime',
  ageGroup: 'all',
  bpm: 72,
  key: 'C',
  duration: 50,
  vocalModes: ['full', 'instrumental', 'lead-repeat'],
  sections: [
    {
      type: 'verse',
      label: 'Verse 1',
      lines: [
        buildLine('Twinkle twinkle little star', 0, [800, 800, 700, 1000]),
        buildLine('How I wonder what you are', 3300, [600, 600, 700, 600, 600, 1000]),
        buildLine('Up above the world so high', 6400, [600, 700, 500, 700, 500, 1000]),
        buildLine('Like a diamond in the sky', 9400, [600, 500, 800, 500, 500, 1000]),
      ],
    },
    {
      type: 'chorus',
      label: 'Chorus',
      lines: [
        buildLine('Twinkle twinkle little star', 12800, [800, 800, 700, 1000]),
        buildLine('How I wonder what you are', 16100, [600, 600, 700, 600, 600, 1200]),
      ],
    },
    {
      type: 'verse',
      label: 'Verse 2',
      lines: [
        buildLine('When the blazing sun is gone', 19700, [600, 500, 700, 700, 500, 1000]),
        buildLine('When he nothing shines upon', 22700, [600, 500, 700, 700, 600, 1000]),
        buildLine('Then you show your little light', 25700, [600, 500, 700, 600, 700, 1000]),
        buildLine('Twinkle twinkle all the night', 28800, [800, 800, 500, 500, 1000]),
      ],
    },
    {
      type: 'chorus',
      label: 'Chorus',
      lines: [
        buildLine('Twinkle twinkle little star', 31400, [800, 800, 700, 1000], true),
        buildLine('How I wonder what you are', 34700, [600, 600, 700, 600, 600, 1200], true),
      ],
    },
    {
      type: 'outro',
      label: 'Goodnight',
      lines: [
        buildLine('Close your eyes and dream tonight', 38100, [700, 600, 700, 500, 700, 1200]),
        buildLine('Stars will keep you safe and bright', 41500, [700, 600, 700, 600, 600, 500, 1200]),
      ],
    },
  ],
};

// ─── Exported Collections ──────────────────────────────────────────────────

export const singAlongSongs: SingAlongSong[] = [abcSong, fiveLittleMonkeys, twinkleTwinkle];

export const songCategories = [
  { key: 'alphabet', label: 'Alphabet', emoji: '🔤' },
  { key: 'counting', label: 'Counting', emoji: '🔢' },
  { key: 'nursery', label: 'Nursery', emoji: '🎶' },
  { key: 'action', label: 'Action', emoji: '🕺' },
  { key: 'bedtime', label: 'Bedtime', emoji: '🌙' },
  { key: 'seasonal', label: 'Seasonal', emoji: '🎄' },
] as const;

export function getSongById(id: string): SingAlongSong | undefined {
  return singAlongSongs.find((s) => s.id === id);
}

export function getSongsByCategory(category: SongCategory): SingAlongSong[] {
  return singAlongSongs.filter((s) => s.category === category);
}

export function getSongsByAge(age: AgeGroup): SingAlongSong[] {
  return singAlongSongs.filter((s) => s.ageGroup === age || s.ageGroup === 'all');
}

/** Get total duration of a song from its last line endTime (ms) */
export function getSongDurationMs(song: SingAlongSong): number {
  const allLines = song.sections.flatMap((s) => s.lines);
  if (allLines.length === 0) return song.duration * 1000;
  return Math.max(...allLines.map((l) => l.endTime));
}

/** Get the section active at a given time */
export function getSectionAtTime(song: SingAlongSong, timeMs: number): SongSection | null {
  for (let i = song.sections.length - 1; i >= 0; i--) {
    const section = song.sections[i];
    if (section.lines.length > 0 && section.lines[0].startTime <= timeMs) {
      return section;
    }
  }
  return song.sections[0] ?? null;
}

/** Get the active line at a given time */
export function getLineAtTime(song: SingAlongSong, timeMs: number): LyricLine | null {
  const allLines = song.sections.flatMap((s) => s.lines);
  for (let i = allLines.length - 1; i >= 0; i--) {
    if (allLines[i].startTime <= timeMs) {
      return allLines[i];
    }
  }
  return null;
}

/** Get the active word at a given time */
export function getWordAtTime(line: LyricLine, timeMs: number): LyricWord | null {
  for (let i = line.words.length - 1; i >= 0; i--) {
    if (line.words[i].startTime <= timeMs) {
      return line.words[i];
    }
  }
  return null;
}
