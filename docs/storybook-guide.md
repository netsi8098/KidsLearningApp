# Cinematic Storybook Guide

## Overview

The Cinematic Storybook system elevates the existing story reading experience with scene-based layouts, mood-driven transitions, interactive hotspots, and ambient visual effects. Each story page can use a different scene template to create a varied, engaging reading experience.

## File Structure

```
src/storybook/
  sceneTemplates.ts     -- 7 scene types with complete layout specs
  StoryTransition.tsx   -- Direction-aware page transition wrapper
  StoryScene.tsx        -- Main cinematic scene renderer
```

## Scene Types

### 1. hero-illustration
**Purpose**: Story openings and visually-rich moments.
**Layout**: Large illustration dominates the top 55%; text fills the bottom 45%.
**Mood**: Exciting.
**Ambient**: Gentle float animation on the illustration.
**Best for**: First page, reveal moments, character introductions.

### 2. read-aloud
**Purpose**: Narration-heavy pages.
**Layout**: Text fills most of the screen (left-aligned); small illustration accent at top-right.
**Mood**: Warm.
**Ambient**: Soft pulse glow behind text area.
**Best for**: Descriptive passages, exposition, world-building.

### 3. interactive
**Purpose**: Pages where the child taps on things.
**Layout**: Illustration at center with hotspot overlay; text prompt at bottom.
**Mood**: Curious.
**Ambient**: Sparkle particles near hotspots.
**Best for**: "Can you find...?", "Tap the...", discovery moments.

### 4. dialogue
**Purpose**: Conversational scenes between characters.
**Layout**: Characters on sides; speech bubble in center.
**Mood**: Funny.
**Ambient**: Characters subtly bounce.
**Best for**: Character dialogue, jokes, conversations.

### 5. calm-ending
**Purpose**: Story endings, bedtime closings.
**Layout**: Full-screen dark gradient; centered text; faded illustration behind.
**Mood**: Bedtime.
**Ambient**: Twinkling stars.
**Best for**: Last page, "The End", goodnight scenes.

### 6. dramatic-moment
**Purpose**: High-impact story moments.
**Layout**: Fullscreen zoomed illustration with letterbox bars; short text at bottom.
**Mood**: Dramatic.
**Ambient**: Subtle camera shake on enter.
**Best for**: Plot twists, surprises, action moments.

### 7. discovery
**Purpose**: Anticipation-building reveal pages.
**Layout**: Text at top; illustration centered below with tap-to-reveal zone.
**Mood**: Curious.
**Ambient**: Floating question marks.
**Best for**: "What could it be?", treasure reveals, mystery pages.

## Layout Patterns

Each scene template defines four layout zones:

```typescript
{
  illustrationArea: { position: string, size: string },
  textArea: { position: string, maxWidth: string, alignment: string },
  narrateButton: { position: string },
  interactiveZone?: { position: string, type: string }
}
```

### Position Values
- `top-half`, `bottom-half` -- Vertical split
- `center` -- Centered in available space
- `top-right-corner` -- Small corner placement
- `split-sides` -- Left and right sides
- `background-centered` -- Behind text at low opacity
- `fullscreen-zoom` -- Full bleed
- `center-hidden` -- Initially obscured

### Text Alignment
- `center` -- Default for most scenes
- `left` -- Used for read-aloud (easier to follow)

### Narrate Button Positions
- `bottom-right` -- Default
- `bottom-center` -- For read-aloud and dialogue
- `top-right` -- For interactive and dramatic scenes

## Text Placement Rules

1. **Text never overlaps illustration** in normal layouts (hero, read-aloud, interactive, discovery)
2. **Exception**: calm-ending places text over a faded illustration; dramatic-moment uses letterbox bars
3. **Max width**: Always constrained (80-90%) to prevent text running edge-to-edge
4. **Font sizes**: Range from 1.4rem (interactive) to 2rem (dramatic)
5. **Highlight words**: Rendered in bold with the coral color (#FF6B6B) or grape (#C4B5FD) in bedtime mode
6. **Line height**: Generous (1.75-2.5) for readability by young children

## Transition Styles

### Direction-Aware
- `next` direction: content slides/zooms from the right
- `previous` direction: content slides/zooms from the left
- Implemented via `StoryTransition` component wrapping `AnimatePresence`

### Mood Variants

| Mood      | Transition   | Duration | Description                     |
| --------- | ------------ | -------- | ------------------------------- |
| exciting  | Quick slide  | 0.35s    | Fast lateral slide (300px)      |
| curious   | Page curl    | 0.5s     | Subtle Y-axis rotation          |
| funny     | Tilted slide | 0.4s     | Slide with slight rotation      |
| warm      | Gentle slide | 0.45s    | Medium lateral slide (200px)    |
| bedtime   | Slow crossfade | 0.8s   | Opacity-only, no movement       |
| dramatic  | Zoom         | 0.6s     | Scale in/out with custom easing |

### Page Curl Hint
On the first page, a "Swipe" hint animates in from the right side, repeating twice, then disappears.

## Interactive Storytelling

### Hotspots
Story pages can include `hotspots` -- positioned interactive elements:

```typescript
{
  id: 'bird',
  emoji: '🐦',
  position: { x: '70%', y: '40%' },
  animation: 'bounce' // bounce | wobble | pulse | spin
}
```

When tapped, hotspots trigger a sparkle effect and call `onTapHotspot(id)`.

### Hotspot Animations
- `bounce` -- Gentle vertical bounce
- `wobble` -- Left-right rotation
- `pulse` -- Scale breathing
- `spin` -- Full rotation

### Disabling in Bedtime Mode
Hotspots are automatically hidden when `bedtime={true}` to avoid stimulation.

## Bedtime Variant

When `bedtime` is true:
- Background overrides to deep indigo (#1E1B4B)
- Text color changes to indigo-100 (#E0E7FF)
- Highlight words use grape (#C4B5FD)
- Transitions slow to 0.7-0.8s crossfade
- Hotspots are removed
- Ambient motion switches to twinkling stars
- Navigation buttons use dark indigo backgrounds

## Adding New Stories with Scene Templates

### Step 1: Define page data
Use the existing `StoryPage` interface from `storiesData.ts`:
```typescript
{ text: '...', emoji: '...', highlightWords: ['word1', 'word2'] }
```

### Step 2: Assign scene types per page
Create a mapping from page index to scene type:
```typescript
const sceneMap: SceneType[] = [
  'hero-illustration',  // Page 1: Opening
  'read-aloud',         // Page 2: Description
  'interactive',        // Page 3: Find the animal
  'dialogue',           // Page 4: Characters talk
  'dramatic-moment',    // Page 5: Surprise!
  'calm-ending',        // Page 6: The End
];
```

### Step 3: Add hotspots where needed
For interactive scenes, define hotspot arrays:
```typescript
const page3Hotspots = [
  { id: 'cat', emoji: '🐱', position: { x: '30%', y: '50%' }, animation: 'wobble' },
  { id: 'dog', emoji: '🐶', position: { x: '70%', y: '45%' }, animation: 'bounce' },
];
```

### Step 4: Render with StoryScene
```tsx
<StoryScene
  scene={getSceneTemplate(sceneMap[pageIndex], isBedtime)}
  illustration={page.emoji}
  text={page.text}
  highlightWords={page.highlightWords}
  hotspots={page3Hotspots}
  pageNumber={pageIndex}
  totalPages={story.pages.length}
  onNext={goNext}
  onPrevious={goPrev}
  onNarrate={readAloud}
  bedtime={isBedtime}
/>
```

## Integration with Existing StoriesPage

The existing `StoriesPage` uses a simpler reader view. To upgrade stories to use the cinematic storybook:

1. Import `StoryScene` and `getSceneTemplate` from `src/storybook/`
2. Replace the reader view's content area with `StoryScene`
3. Map each story page to a scene type (or use a default like `hero-illustration`)
4. The narration system (`handleReadAloud`) connects via `onNarrate`
5. Page navigation connects via `onNext` and `onPrevious`
