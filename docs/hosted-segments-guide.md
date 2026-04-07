# Hosted Segments Guide

## Overview

Hosted Segments are mascot-led educational "mini-shows" that guide children through learning topics with a structured sequence of segments. Each episode features one of the five mascot characters (Leo, Daisy, Ollie, Ruby, Finn) as the host who speaks via TTS, shows expressions, and reacts to the child's interactions.

## File Structure

```
src/segments/
  episodeSchema.ts     -- Data model, segment types, sample episodes
  useEpisodeFlow.ts    -- Flow control hook (state machine)
  HostedSegment.tsx    -- Full episode renderer component
```

## Episode Format

### HostedEpisode

```typescript
{
  id: string,              // Unique identifier
  title: string,           // Display name
  emoji: string,           // Cover emoji
  hostCharacterId: string, // 'leo' | 'daisy' | 'ollie' | 'ruby' | 'finn'
  topic: string,           // Topic key (colors, counting, shapes, etc.)
  ageGroup: string,        // '2-3' | '4-5' | '6-8' | 'all'
  durationMinutes: number, // Estimated duration
  segments: EpisodeSegment[]
}
```

## Segment Types

### 1. intro
The host greets the child and sets up the episode.

```typescript
{
  type: 'intro',
  hostLine: string,       // What the host says (via TTS)
  hostExpression: string, // 'excited' | 'warm' | 'curious' | etc.
  hostPose: string,       // 'waving' | 'sitting' | 'pointing' | etc.
  durationMs: number      // How long to show before auto-advancing
}
```

**Auto-advances** after `durationMs`.

### 2. topic-reveal
Dramatic reveal of the episode's topic with animation.

```typescript
{
  type: 'topic-reveal',
  title: string,           // Topic name displayed large
  emoji: string,           // Topic emoji (shown with reveal animation)
  hostLine: string,        // Host introduction of the topic
  revealAnimation: string  // 'rainbow-burst' | 'number-cascade' | etc.
}
```

**Auto-advances** after 5 seconds.

### 3. teach
The host presents educational content with a visual.

```typescript
{
  type: 'teach',
  content: string, // The fact or concept being taught
  visual: string,  // Emoji(s) or image URL for the visual aid
  hostLine: string // Host's explanation (spoken via TTS)
}
```

**Auto-advances** after 7 seconds.

### 4. interaction
The child is presented with a choice or activity. The episode pauses until the child responds correctly.

```typescript
{
  type: 'interaction',
  prompt: string,                          // Question displayed to child
  interactionType: 'tap' | 'drag' | 'voice' | 'choose',
  options?: string[],                      // Choice options (for 'choose')
  correctAnswer?: string,                  // Expected correct answer
  hostHint?: string                        // Hint shown on wrong answer
}
```

**Waits for correct answer**, then auto-advances after 1.8s celebration.

### 5. call-response
The host says a line and waits for the child to repeat it aloud, then tap a confirmation button.

```typescript
{
  type: 'call-response',
  hostLine: string,            // What the host says
  expectedResponse: string,    // What the child should say (informational)
  celebrateOnResponse: boolean // Whether to celebrate when confirmed
}
```

**Waits for child to tap "I said it!"**, then auto-advances after 2s.

### 6. recap
Summary of what was learned, with celebration.

```typescript
{
  type: 'recap',
  summary: string,        // Summary text
  hostLine: string,       // Host's congratulatory message
  hostExpression: string  // Usually 'celebrating' or 'proud'
}
```

**Auto-advances** after 6 seconds.

### 7. goodbye
Host says farewell and optionally suggests next content.

```typescript
{
  type: 'goodbye',
  hostLine: string,         // Farewell message
  nextSuggestion?: string   // "Try 'Counting to 5' next!"
}
```

**Auto-advances** after 5 seconds (leads to completion screen).

## Host Behavior

### Expression System
The host mascot displays an emoji expression badge that changes per segment:

| Expression    | Emoji | Used In            |
| ------------- | ----- | ------------------ |
| excited       | `=)`  | intro, topic-reveal |
| warm          | `=)`  | intro, goodbye      |
| curious       | `?`   | interaction (waiting)|
| singing       | `#`   | call-response       |
| celebrating   | `!`   | recap, correct answer|
| encouraging   | `+`   | wrong answer         |
| proud         | `*`   | recap               |
| explaining    | `^`   | teach               |

### Speaking Animation
When `hostState.speaking` is true, the mascot gently bobs up and down, and a sound-wave indicator (three bars) animates beside the character.

### TTS Integration
Host lines are spoken via the Web SpeechSynthesis API:
- Rate: 0.85 (slightly slower for clarity)
- Pitch: 1.1 (slightly higher for friendliness)
- Voice: Prefers Samantha, Karen, or any English voice
- Speech is cancelled when changing segments

## Interaction Types

### choose (implemented)
Presents 2-4 options in a grid. Child taps one. If correct, celebration. If wrong, hint shown and child can try again.

### tap (future)
Child taps on a specific area of the screen. Could be used for "find the red one" type interactions.

### drag (future)
Child drags an item to a target area. Could be used for sorting or matching activities.

### voice (future)
Uses the Web Speech Recognition API to detect if the child says the expected word. Would need browser support detection and graceful fallback.

## Scaling to Many Topics

### Adding a New Episode

1. Define the episode in `episodeSchema.ts` or a separate data file
2. Follow the segment sequence pattern:
   ```
   intro -> topic-reveal -> [teach + interaction]* -> recap -> goodbye
   ```
3. Add a topic background gradient in `HostedSegment.tsx`:
   ```typescript
   const TOPIC_BACKGROUNDS = {
     myNewTopic: 'bg-gradient-to-b from-... to-...',
   };
   ```
4. Add the episode to the `hostedEpisodes` array

### Episode Template

```typescript
const newEpisode: HostedEpisode = {
  id: 'ep-shapes-1',
  title: "Let's Learn Shapes!",
  emoji: '🔺',
  hostCharacterId: 'daisy',
  topic: 'shapes',
  ageGroup: '2-3',
  durationMinutes: 3,
  segments: [
    { type: 'intro', hostLine: '...', hostExpression: 'excited', hostPose: 'waving', durationMs: 4000 },
    { type: 'topic-reveal', title: 'Shapes!', emoji: '🔺', hostLine: '...', revealAnimation: 'shape-spin' },
    { type: 'teach', content: '...', visual: '🔺', hostLine: '...' },
    { type: 'interaction', prompt: '...', interactionType: 'choose', options: [...], correctAnswer: '...' },
    { type: 'recap', summary: '...', hostLine: '...', hostExpression: 'celebrating' },
    { type: 'goodbye', hostLine: '...', nextSuggestion: '...' },
  ],
};
```

### Recommended Episode Structure

| Duration | Segments | Ideal For |
| -------- | -------- | --------- |
| 2-3 min  | 6-8      | Ages 2-3  |
| 3-5 min  | 8-12     | Ages 4-5  |
| 5-8 min  | 12-16    | Ages 6-8  |

### Guidelines
- Keep host lines under 30 words for ages 2-3
- Include at least one interaction per episode
- End every episode with a recap + star reward
- Use the host's personality from `charactersData.ts` for line writing
- Vary interaction types within longer episodes

## Connection to Existing Lessons

The Hosted Segments system complements the existing `LessonsPage`:
- **LessonsPage**: Self-paced, card-based learning with multiple items
- **Hosted Segments**: Guided, sequential, host-led experience

### Integration Points
1. The `lessonsData.ts` topic keys (colors, numbers, shapes, animals, body-parts) can be reused as episode topics
2. The `charactersData.ts` mascots and their personalities drive host behavior
3. Progress can be tracked via the existing `db.progress` or `db.lessonProgress` tables
4. Stars earned flow through the same `db.stars.add()` + `db.profiles.update()` pattern
5. Episodes can be surfaced on the MainMenu's "Learn" tab alongside lessons

### Future: Auto-Generated Episodes
With enough data in `lessonsData.ts`, episodes could be procedurally generated:
1. Pick a topic and host character
2. Select 2-3 items from the topic's data
3. Generate teach segments from item descriptions
4. Create interaction segments from item data (choose the correct emoji)
5. Wrap with intro/recap/goodbye
