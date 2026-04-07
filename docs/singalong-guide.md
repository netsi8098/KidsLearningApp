# Sing-Along Mode Guide

## Overview

The Sing-Along Mode provides a karaoke-style experience for children ages 2-8. Songs display lyrics with real-time word-level highlighting synchronized to playback timing. Three vocal modes and three highlight styles give flexibility for different learning scenarios.

## File Structure

```
src/singalong/
  singAlongData.ts    -- Song data model, sample songs, helper functions
  useSingAlong.ts     -- Playback/sync hook with rAF timing loop
  LyricHighlighter.tsx -- Lyric display with 3 highlight modes
  SingAlongPlayer.tsx  -- Full-screen sing-along experience
```

## Song Data Format

### SingAlongSong

Each song has these fields:

| Field       | Type                                    | Description                                |
| ----------- | --------------------------------------- | ------------------------------------------ |
| id          | string                                  | Unique identifier (e.g. `song-abc`)        |
| title       | string                                  | Display name                               |
| emoji       | string                                  | Cover emoji                                |
| category    | nursery/alphabet/counting/action/bedtime/seasonal | Song category                    |
| ageGroup    | 2-3/4-5/6-8/all                         | Target age                                 |
| bpm         | number                                  | Beats per minute (drives beat pulse)       |
| key         | string                                  | Musical key (informational)                |
| duration    | number                                  | Total duration in seconds                  |
| vocalModes  | VocalMode[]                             | Available vocal modes                      |
| sections    | SongSection[]                           | Ordered sections of the song               |

### SongSection

```typescript
{
  type: 'verse' | 'chorus' | 'bridge' | 'intro' | 'outro',
  label: string,     // "Verse 1", "Chorus", etc.
  lines: LyricLine[]
}
```

### LyricLine

```typescript
{
  text: string,              // Full line text
  startTime: number,         // ms from song start
  endTime: number,           // ms when line ends
  words: LyricWord[],        // Individual word timings
  isCallAndResponse?: boolean // Pauses in lead-repeat mode
}
```

### LyricWord

```typescript
{
  word: string,
  startTime: number,  // ms from song start
  endTime: number
}
```

## Lyric Timing

Timing values are in milliseconds from the absolute start of the song. The `buildLine()` helper in `singAlongData.ts` constructs lines from text and an array of per-word durations:

```typescript
buildLine('A B C D', 0, [800, 800, 800, 1000])
// Word A: 0-800ms, Word B: 800-1600ms, Word C: 1600-2400ms, Word D: 2400-3400ms
```

### Timing Tips

- Start with the target BPM to calculate beat duration: `beatMs = 60000 / bpm`
- Align word boundaries to beat subdivisions when possible
- Leave small gaps between lines (100-300ms) for breathing room
- For songs under 120 BPM, each syllable usually spans one beat
- Test timing by playing the song and watching the highlight sweep

## Vocal Modes

| Mode          | Description                                                        |
| ------------- | ------------------------------------------------------------------ |
| full          | Full vocal playback. Child sings along with guidance.              |
| instrumental  | Music only, no vocals. Child sings independently.                  |
| lead-repeat   | Host sings a line, then pauses for the child to repeat. Lines marked `isCallAndResponse: true` trigger a pause with an "I sang it!" button. |

## Highlight Modes

### word-by-word
- Active word scales up (1.15x) and changes to coral color
- Past words turn sunny yellow
- Future words remain in default text color
- Inactive lines fade to 30-50% opacity

### line-by-line
- Current line displays large and bright at center
- Next line previews dimmed below
- Uses AnimatePresence for smooth transitions between lines

### karaoke-sweep
- Each word has a colored overlay that sweeps from left to right
- Sweep progress is calculated per-word based on `(currentTime - startTime) / (endTime - startTime)`
- Teal color sweep in normal mode, indigo in bedtime mode

## UI Design

### Stage Layout
- **Top**: Thin progress bar (1.5px height)
- **Header**: Back button, song title + section label, highlight mode toggle
- **Center**: Beat marker (bouncing star) + lyric display area
- **Bottom**: Mascot host (left), Play/Pause button (center), Replay + vocal mode (right)
- **Background**: Musical note particles floating upward (disabled in bedtime mode)

### Mascot Assignment
Each song category maps to a mascot:
- alphabet: Leo Lion
- counting: Monkey
- nursery: Daisy Duck
- action: Ruby Rabbit
- bedtime: Ollie Owl
- seasonal: Finn Fox

### Bedtime Variant
- Dark gradient background (indigo-950 to slate-950)
- Grape/indigo color palette instead of coral/sunny
- No musical note particles
- Slower transitions (0.5s vs 0.25s)
- Star marker instead of regular star

## Adding New Songs

1. Define the song object in `singAlongData.ts` following the `SingAlongSong` interface
2. Use `buildLine()` for each line with accurate word durations
3. Mark call-and-response lines with `isCallAndResponse: true`
4. Add the song to the `singAlongSongs` array
5. Test all three highlight modes and all available vocal modes

### Template

```typescript
const newSong: SingAlongSong = {
  id: 'song-new',
  title: 'My New Song',
  emoji: '🎵',
  category: 'nursery',
  ageGroup: 'all',
  bpm: 100,
  key: 'C',
  duration: 30,
  vocalModes: ['full', 'instrumental'],
  sections: [
    {
      type: 'verse',
      label: 'Verse 1',
      lines: [
        buildLine('First line of the song', 0, [500, 500, 400, 400, 600]),
        // ... more lines
      ],
    },
  ],
};
```

## Future: Real Audio Integration

The current implementation uses simulated playback timing via `requestAnimationFrame`. When real audio files are added:

1. Replace the rAF timer in `useSingAlong.ts` with `HTMLAudioElement` or Web Audio API `AudioBufferSourceNode`
2. Sync `currentTime` from the audio element's `timeupdate` event or audio context's `currentTime`
3. The `LyricHighlighter` component requires no changes -- it only reads `currentTime`
4. Audio files should be placed in `public/audio/songs/` and referenced by song ID
5. Consider using `AudioWorklet` for precise beat detection from actual audio

## Caption / Accessibility Support

- All lyric text is in the DOM as readable text (not canvas-rendered)
- Screen readers can access the full song text
- The `aria-label` attributes on controls describe their function
- `reducedMotion` from the AccessibilityContext can be checked to disable animations
- Large text sizes (2rem+ base, 3rem active) ensure readability for young children
