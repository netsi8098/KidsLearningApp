# Mascot Expression, Pose, and Animation System

Complete reference for the Kids Learning Fun mascot rendering system.

## Architecture Overview

The mascot system is composed of layered modules:

```
MascotCharacter.tsx        Main component - assembles body, face, arms, animations
  MascotFace.tsx          Face sub-component - eyes, mouth, brows, cheeks, extras
  expressions.ts           10 expression definitions (face configs)
  poses.ts                 10 pose definitions (body configs)
  animations.ts            Framer Motion variant definitions for all motion
  lipSync.ts               Mouth shape system and timeline generation
  usageRules.ts            Context-aware rules and overuse protection
```

## Expression Library

### Expressions Reference

| ID | Label | Eyes | Mouth | Cheeks | Extras | Use Case |
|----|-------|------|-------|--------|--------|----------|
| `happy` | Happy | Arc (happy closed) | Smile, curve 0.85 | Pink, visible | None | Default positive state |
| `proud` | Proud | Arc + soften | Grin, curve 0.95 | Gold, visible | Sparkles | Completion, milestones |
| `curious` | Curious | Wide + widen | Small O, curve 0.1 | Hidden | Question mark | Discovery, exploration |
| `surprised` | Surprised | Wide + widen | Small O, curve 0.0 | Pink, visible | Exclamation | Bonus events, reveals |
| `sleepy` | Sleepy | Half-closed | Gentle, curve 0.3 | Purple, visible | Zzz floating | Bedtime content |
| `calm` | Calm | Half-closed + soften | Gentle, curve 0.5 | Blue, visible | None | Reading, bedtime |
| `encouraging` | Encouraging | Sparkle + pulse | Grin, curve 0.9 | Pink, visible | Sparkles | Mistakes, empty states |
| `thinking` | Thinking | Round | Flat, curve 0.15 | Hidden | Thought bubble | Quiz waiting, loading |
| `celebrating` | Celebrating | Sparkle + pulse | Open smile, curve 1.0 | Gold, visible | Confetti + star | Wins, rewards |
| `empathetic` | Empathetic | Round + soften | Gentle, curve 0.4 | Pink, visible | Heart | Losses, sad story moments |

### Expression Structure

```typescript
interface Expression {
  id: ExpressionId;
  label: string;
  eyes: {
    shape: 'round' | 'arc-happy' | 'wide' | 'half-closed' | 'closed' | 'sparkle';
    scale: number;        // 0.8 - 1.3
    offsetY: number;      // vertical shift in SVG units
    animation?: string;   // 'none' | 'widen' | 'soften' | 'sparkle-pulse'
  };
  mouth: {
    shape: 'smile' | 'grin' | 'open-smile' | 'small-o' | 'gentle' | 'flat' | 'wavy';
    scale: number;
    curve: number;        // -1 (frown) to 1 (smile)
  };
  brows: {
    angle: number;        // degrees of rotation
    offsetY: number;      // vertical offset
  };
  cheeks: {
    visible: boolean;
    color: string;        // hex color
    opacity: number;      // 0.0 - 1.0
  };
  extras?: { type: string; emoji?: string }[];
}
```

## Pose Library

### Poses Reference

| ID | Label | Body Rot | Head Tilt | Arms | Bounce | Sway | Default Expression |
|----|-------|----------|-----------|------|--------|------|--------------------|
| `waving` | Waving | -3 | 5 | L: rest, R: raised | No | Yes | happy |
| `pointing` | Pointing | -5 | -5 | L: rest, R: extended | No | No | curious |
| `cheering` | Cheering | 0 | 0 | Both raised high | Yes | No | celebrating |
| `reading` | Reading | 2 | -8 | Both forward (holding book) | No | No | calm |
| `dancing` | Dancing | 0 | 8 | L: up, R: mid | Yes | Yes | happy |
| `listening` | Listening | 5 | 12 | Both at sides | No | No | curious |
| `explaining` | Explaining | -2 | -3 | L: mid, R: gesturing | No | Yes | encouraging |
| `clapping` | Clapping | 0 | 0 | Both mid (meeting) | Yes | No | proud |
| `tiptoeing` | Tiptoeing | 0 | -5 | Both low, close | No | No | thinking |
| `reward` | Reward | 0 | 0 | Both raised high | Yes | Yes | celebrating |

### Pose Structure

```typescript
interface Pose {
  id: PoseId;
  label: string;
  bodyRotation: number;
  armLeft: { rotation: number; scale: number };
  armRight: { rotation: number; scale: number };
  headTilt: number;
  bounce: boolean;
  sway: boolean;
  defaultExpression: ExpressionId;
  transformHints: Record<string, string>;
}
```

## Usage Rules by Context

### Lesson Context
| Phase | Expressions | Poses |
|-------|-------------|-------|
| Intro | happy, curious, encouraging | waving, explaining |
| Progress | encouraging, proud, happy | cheering, clapping, pointing |
| Complete | celebrating, proud, happy | cheering, reward, dancing |
| Mistake | empathetic, encouraging, calm | explaining, listening |

### Game Context
| Event | Expressions | Poses |
|-------|-------------|-------|
| Win | celebrating, proud, happy | cheering, dancing, reward |
| Loss | empathetic, encouraging, calm | explaining, listening |
| Timeout | surprised, encouraging, empathetic | pointing, waving |
| Bonus | surprised, celebrating, happy | cheering, dancing, reward |

### Story Context
| Beat | Expressions | Poses |
|------|-------------|-------|
| Opening | curious, happy, encouraging | pointing, reading |
| Climax | surprised, curious, happy | cheering, pointing |
| Ending | happy, proud, calm | reading, clapping, waving |
| Sad moment | empathetic, calm, encouraging | listening, reading |

### Special Contexts
| Context | Expressions | Poses |
|---------|-------------|-------|
| Reward | celebrating, proud, happy | reward, cheering, dancing |
| Empty state | encouraging, curious, happy | waving, pointing, explaining |
| Bedtime | sleepy, calm, empathetic | reading, listening, tiptoeing |
| Greeting | happy, encouraging, curious | waving, cheering |

## Animation Timing Specs

| Animation | Duration | Properties | Notes |
|-----------|----------|------------|-------|
| Idle breathing | 3s loop | scale 1.0 - 1.02 | Reduced to 5s in bedtime |
| Blink | 150ms | scaleY 1 to 0.05 | Random 2.5-5s interval |
| Bounce | 0.4s + 0.6s delay | y: 0, -8, 0 | Spring-based |
| Sway | 2s loop | rotate: -2 to 2 | 4s in bedtime |
| Wave | 0.6s | rotate oscillation 2 cycles | Right arm only |
| Celebration | 1.2s | scale pulse + y jump + rotate | 5-keyframe sequence |
| Clap | 0.8s x 2 reps | scaleX oscillation | Arms meet in middle |
| Dance | 0.8s loop | rotate -8 to 8 + bounce | Combines with sway |
| Entrance | spring | scale 0.8 to 1, opacity 0 to 1 | stiffness: 260 |
| Exit | 200ms | scale to 0.9, opacity to 0 | ease-in |
| Sparkle pulse | 0.8s loop | scale 1 to 1.3, opacity 0.7 to 1 | On sparkle eyes/extras |
| Speaking mouth | 0.3s loop | scaleY oscillation | Fallback when no lip-sync |

### Reduced Motion Behavior

When `reducedMotion` is true (via AccessibilityContext):
- All animations resolve to static values
- No idle breathing, blinking, or sway
- Pose transitions are instant (duration: 0)
- Expression transitions are instant
- Entrance appears without spring animation

### Bedtime Mode Behavior

When `bedtimeMode` is true (via AppContext):
- Breathing slows from 3s to 5s, with reduced amplitude (1.012 vs 1.02)
- Sway slows from 2s to 4s, with reduced angle (1 deg vs 2 deg)
- No bouncing animations
- Only sleepy, calm, empathetic expressions are used

## Component API Reference

### MascotCharacter

```tsx
<MascotCharacter
  characterId="leo"          // 'leo' | 'daisy' | 'ollie' | 'ruby' | 'finn'
  expression="happy"         // ExpressionId
  pose="waving"             // PoseId
  size="md"                 // 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  speaking={false}           // Enable mouth animation
  currentMouthShape="smile"  // Lip-sync mouth shape override
  idle={true}               // Enable idle breathing/blinking
  className=""              // Extra CSS classes
  onClick={() => {}}        // Click handler (adds button role)
  ariaLabel="Leo waving"    // Accessible label
/>
```

**Sizes:**
| Size | Pixels | Face Scale | Detail Level |
|------|--------|------------|--------------|
| xs | 32px | 0.35 | Low (no feet) |
| sm | 56px | 0.55 | Low (no feet) |
| md | 96px | 0.8 | Mid (feet visible) |
| lg | 140px | 1.0 | High (all details) |
| xl | 200px | 1.2 | High (all details) |

### MascotFace

```tsx
<MascotFace
  expression="happy"         // ExpressionId
  themeColor="#FFD93D"       // Character's primary color
  speaking={false}           // Enable speaking animation
  currentMouthShape="smile"  // Lip-sync override
  enableBlink={true}         // Enable blink animation
  reducedMotion={false}      // Disable all animations
  sizeScale={1.0}           // Size multiplier
/>
```

### getMascotReaction

```typescript
import { getMascotReaction } from './mascot/usageRules';

const reaction = getMascotReaction({
  type: 'lesson-complete',
  characterId: 'leo',
  isBedtime: false,
  recentExpressions: ['happy', 'proud'],
});
// Returns: { expression: 'celebrating', pose: 'reward', line: 'ROAR! That was amazing!' }
// Or null if overuse limit reached
```

## How to Add New Expressions

1. Add the ID to `ExpressionId` type in `expressions.ts`
2. Add the entry to `expressions` record with all face part configs
3. Add the ID to `allExpressionIds` (automatic via Object.keys)
4. Add the expression to relevant context pools in `usageRules.ts`
5. Test with `<MascotCharacter expression="new-id" />`

## How to Add New Poses

1. Add the ID to `PoseId` type in `poses.ts`
2. Add the entry to `poses` record with body configuration
3. If the pose needs a custom animation, add variants in `animations.ts`
4. Wire the animation in `MascotCharacter.tsx` `getBodyAnimation()`
5. Add the pose to relevant context pools in `usageRules.ts`

## How to Add New Characters

1. Add character data to `charactersData.ts` (id, name, emoji, color, etc.)
2. Add a `case` in `getCharacterShape()` in `MascotCharacter.tsx`
3. Define: bodyColor, bellyColor, bodyPath, bellyPath, features SVG, faceOffset, armAnchors
4. The character automatically inherits all expressions, poses, and animations

### Character Design Guidelines
- Body path should fill roughly the 15-85 x-range and 18-100 y-range in the 100x120 viewBox
- Belly should be a lighter shade, inset within the body
- Features (ears, tails, etc.) are raw SVG rendered behind the body
- Face offset positions the 80x80 face viewBox within the body
- Arm anchors sit at the sides of the body, typically around y=60

## Overuse Prevention Strategy

The system prevents mascot fatigue through three mechanisms:

1. **Session cap**: Maximum 50 reactions per session. After this, `getMascotReaction()` returns null.
2. **Cooldown**: Minimum 2000ms between consecutive reactions. Rapid triggers are suppressed.
3. **Variety enforcement**: Tracks last 3 expressions shown. Avoids repeating the same expression within this window by filtering the pool.

Reset session tracking with `resetSessionTracking()` when the user session changes (profile switch, app restart).

Use `getMascotReactionForced()` to bypass overuse checks for system-critical displays (e.g., welcome screen, tutorial).
