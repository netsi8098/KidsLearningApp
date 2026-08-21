# Kids Learning Fun - Motion Bible

Complete motion language reference for the Kids Learning Fun PWA.
All values reference the token system in `src/motion/motionPrimitives.ts` and
the variant library in `src/motion/transitionVariants.ts`.

---

## 1. Motion Principles

Every animation in this app must follow these four principles:

1. **Soft** -- Rounded curves, no sharp snaps. Children respond best to gentle
   motion that feels organic rather than mechanical.
2. **Readable** -- Animation must never obscure content. Text stays still while
   decorative elements around it may move.
3. **Joyful** -- Spring physics and playful overshoots reward interaction.
   Children should feel that the app is alive and happy to see them.
4. **Not overstimulating** -- Motion is used sparingly. Ambient loops are
   subtle. Celebrations are brief. Bedtime mode removes nearly all movement.

### Learning-Safe Motion Rules

| Rule | Rationale |
|------|-----------|
| Never animate text during reading | Keeps focus on content |
| Celebrations last < 1.5 s | Brief enough to reward, not distract |
| No more than 2 concurrent primary animations | Prevents sensory overload |
| Stagger delays cap at 0.5 s total | Kids lose interest beyond half a second |
| Bedtime removes all springs | Springs feel "energetic"; bedtime must feel calm |
| Reduced motion uses opacity only | Safest for vestibular sensitivity |

---

## 2. Timing System

All timing values are in **seconds**. Import from `motionPrimitives.ts`.

| Token | Value | Usage |
|-------|-------|-------|
| `instant` | 0.1 s | Tap feedback, micro-interactions |
| `fast` | 0.2 s | Button states, toggles, hover effects |
| `normal` | 0.35 s | Standard entrances, page transitions |
| `slow` | 0.5 s | Celebrations, emphasis reveals |
| `gentle` | 0.8 s | Bedtime transitions, long crossfades |
| `glacial` | 1.2 s | Bedtime page transitions, ambient loops |

### Bedtime Multiplier

In bedtime mode, all durations are multiplied by **1.5x**:

```
instant  0.1  -> 0.15
fast     0.2  -> 0.30
normal   0.35 -> 0.525
slow     0.5  -> 0.75
gentle   0.8  -> 1.20
glacial  1.2  -> 1.80
```

---

## 3. Spring vs Ease Usage Guide

### When to Use Springs

- **Interactive feedback** (tap, hover): Springs feel responsive and alive.
- **Entrance animations** (pop, dropIn, scaleUp): Overshoot communicates energy.
- **Mascot animations**: The mascot should feel physical and bouncy.
- **Reward reveals**: Stars, badges benefit from spring physics.

### When to Use Easing (Tween)

- **Page transitions**: Predictable, non-distracting movement.
- **Opacity fades**: Springs on opacity look odd; use `decelerate`.
- **Bedtime mode**: ALL springs are replaced with `decelerate` easing.
- **Ambient loops**: Smooth, continuous motion without spring bounciness.
- **Exit animations**: Quick, smooth departures with `accelerate`.

### Spring Presets

| Preset | Stiffness | Damping | Feel |
|--------|-----------|---------|------|
| `snappy` | 400 | 30 | Quick, barely any overshoot |
| `bouncy` | 300 | 20 | Playful, noticeable bounce |
| `gentle` | 200 | 25 | Soft, slight overshoot |
| `lazy` | 100 | 20 | Slow, dreamy |
| `bedtime` | 80 | 30 | Very gentle, no bounce |

### Easing Presets

| Preset | Curve | Usage |
|--------|-------|-------|
| `smooth` | `[0.4, 0, 0.2, 1]` | General purpose |
| `decelerate` | `[0, 0, 0.2, 1]` | Enter/appear (starts fast, ends slow) |
| `accelerate` | `[0.4, 0, 1, 1]` | Exit/dismiss (starts slow, ends fast) |
| `bounce` | `[0.68, -0.55, 0.27, 1.55]` | Playful overshoot |
| `playful` | `[0.34, 1.56, 0.64, 1]` | Large overshoot for rewards |

---

## 4. Motion Hierarchy

Every animation belongs to one of three levels:

### Primary (Attention-Grabbing)

- Scale changes, position shifts, entrances/exits
- Allowed properties: `scale`, `x`, `y`, `rotate`, `opacity`, `width`, `height`
- Default spring: `bouncy`
- Scale range: 0 to 1.3
- **Max 2 primary animations at the same time**

### Secondary (Decorative)

- Color shifts, opacity fades, subtle feedback
- Allowed properties: `opacity`, `scale`, `color`, `backgroundColor`
- Default duration: `fast` (0.2 s)
- Scale range: 0.9 to 1.1

### Ambient (Background)

- Subtle drift, breathing loops, idle animation
- Allowed properties: `opacity`, `scale`, `y`, `rotate`
- Default duration: `glacial` (1.2 s)
- Scale range: 0.98 to 1.03
- **Must use `repeat: Infinity`**

---

## 5. Stagger Patterns

Three built-in stagger patterns for list/grid animations:

| Pattern | Delay | Behavior |
|---------|-------|----------|
| `cascade` | 50 ms/item | Sequential, top to bottom or left to right |
| `center-out` | 40 ms/item | Center items animate first, edges last |
| `random` | 60 ms/item | Pseudo-random order (deterministic per index) |

Use `getStaggerDelay(index, pattern, totalItems)` from `motionPrimitives.ts`.

---

## 6. Category Reference

### Screen Transitions (`pageTransitions`)

| Name | Effect | Duration |
|------|--------|----------|
| `default` | Slide right + fade | 0.35 s |
| `modal` | Scale up from center | spring (bouncy) |
| `bedtime` | Slow crossfade, no movement | 1.2 s |
| `celebration` | Confetti burst entrance | spring (bouncy) |
| `story` | Horizontal page-turn (rotateY) | 0.5 s |

### Card Entrances (`cardEntrances`)

| Name | Effect | Stagger |
|------|--------|---------|
| `grid(i)` | Fade + slide up from position | 50 ms |
| `list(i)` | Slide in from left | 60 ms |
| `hero` | Scale up with parallax feel | spring |
| `featured` | Slide in from right | spring |

### Interactive Feedback (`feedback`)

| Name | Effect |
|------|--------|
| `tap` | Scale to 0.95, 0.1 s |
| `hover` | Scale to 1.03, spring |
| `press` | Scale to 0.92, 0.1 s |
| `success` | Scale 1 -> 1.15 -> 1, 0.4 s |
| `error` | Shake x: [-8, 8, -4, 4, 0], 0.4 s |
| `reward` | Scale + rotate wobble, 0.6 s |

### Mascot Animations (`mascotMotion`)

| State | Animation |
|-------|-----------|
| `enter` | Bounce up from below |
| `idle` | Subtle breathe + bob (via `mascotIdleLoop`) |
| `speak` | Gentle vertical bob, looping |
| `celebrate` | Jump + spin |
| `sleep` | Slow breathe, slight lean |
| `exit` | Shrink + fade down |

### Reward Animations (`rewardMotion`)

| Name | Effect |
|------|--------|
| `starEarn` | Scale up, golden glow, float to counter |
| `badgeReveal` | Flip in from back (rotateY), shimmer |
| `streakFire` | Flickering scale loop |
| `confettiBurst` | Scale burst from center |

### Loading States (`loadingMotion`)

| Name | Effect |
|------|--------|
| `skeleton` | Shimmer gradient sweep |
| `spinner` | 360 rotation, linear easing |
| `dots` | 3 bouncing dots with 150 ms stagger |
| `mascot` | Idle mascot bob + sway |

---

## 7. Reduced Motion Fallbacks

When `prefers-reduced-motion: reduce` is detected (or the user enables it in
settings), the system automatically:

1. Replaces ALL transitions with `reducedMotionTransition` (0.1 s opacity fade)
2. Removes all scale, position, and rotation changes
3. Stops all ambient loops
4. Interactive feedback becomes opacity changes only
5. Page transitions become instant crossfades

The CSS class `.reduced-motion` on `<html>` also kills all CSS animations.

**Never bypass reduced motion.** If a component needs to animate for
functionality (e.g., a progress bar), use `opacity` only.

---

## 8. Performance Guidelines

### GPU-Composited Properties Only

Only animate properties that run on the compositor thread:

- `transform` (scale, translate, rotate) -- via Framer Motion's `x`, `y`, `scale`, `rotate`
- `opacity`
- `filter` (sparingly, for glow effects)

**Never animate**: `width`, `height`, `top`, `left`, `margin`, `padding`,
`border-width`, `font-size`. These trigger layout recalculation.

### Batch Animations

- Use `staggerChildren` in Framer Motion variants rather than individual delays
- Group related animations in a single `<motion.div>` parent
- Use `AnimatePresence mode="wait"` to prevent overlapping transitions

### Will-Change Management

The `AnimateIn` component automatically sets `will-change: transform, opacity`
during animation. Remove it after animation completes for elements that won't
animate again.

### Animation Budget

| Context | Max Concurrent Animations |
|---------|--------------------------|
| Page entrance | 1 primary + stagger children |
| In-page interaction | 1 primary + 1 secondary |
| Celebration | 2 primary (brief, < 1.5 s) |
| Idle state | Ambient only |
| Bedtime | 1 ambient max |

---

## 9. How to Add New Motion Patterns

1. **Define the token** in `motionPrimitives.ts` if you need a new timing or
   spring value.
2. **Create the variant** in `transitionVariants.ts` as a Framer Motion
   `Variants` object with complete `initial`, `animate`, and optional `exit`
   states.
3. **Create a reduced-motion fallback** in the `reducedMotion*` section of
   `transitionVariants.ts`.
4. **Wire it through `useMotionPreset`** by adding a getter method if it's a
   commonly-used pattern.
5. **Test in all three modes**: normal, bedtime, and reduced-motion.
6. **Document it** in this file under the appropriate category.

---

## 10. Component API Reference

### `AnimateIn`

Reusable entrance animation wrapper.

```tsx
import AnimateIn from '../motion/AnimateIn';

<AnimateIn variant="fadeUp" delay={0.1} once>
  <Card />
</AnimateIn>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `AnimateInVariant` | `'fadeUp'` | Entrance animation type |
| `delay` | `number` | `0` | Delay in seconds |
| `duration` | `number` | varies | Override duration (tween only) |
| `spring` | `SpringKey` | auto | Force a spring preset |
| `stagger` | `number` | -- | Stagger delay between children |
| `className` | `string` | -- | CSS class |
| `style` | `CSSProperties` | -- | Inline styles |
| `once` | `boolean` | `false` | Animate only once when in viewport |
| `bedtimeVariant` | `boolean` | `false` | Force bedtime animation |
| `viewportMargin` | `string` | `'-50px'` | IntersectionObserver margin |
| `as` | tag name | `'div'` | HTML element to render |

Variants: `fadeUp`, `fadeDown`, `fadeLeft`, `fadeRight`, `scaleUp`,
`scaleDown`, `pop`, `slideUp`, `dropIn`, `flipIn`.

### `useMotionPreset()`

Hook that provides context-aware motion configuration.

```tsx
import { useMotionPreset } from '../motion/useMotionPreset';

function MyComponent() {
  const { preset, isReducedMotion, getTransition, getStagger } = useMotionPreset();

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={getTransition('primary')}
    >
      {items.map((item, i) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: getStagger(i, 'cascade') }}
        >
          {item.name}
        </motion.div>
      ))}
    </motion.div>
  );
}
```

| Method | Returns | Description |
|--------|---------|-------------|
| `preset` | `MotionPreset` | Current timing/springs/easings adapted for mode |
| `isReducedMotion` | `boolean` | Whether reduced motion is active |
| `isBedtime` | `boolean` | Whether bedtime mode is active |
| `getTransition(level)` | `Transition` | Context-aware transition for hierarchy level |
| `getStagger(i, pattern?)` | `number` | Stagger delay for item index |
| `getPageTransition(name?)` | config | Full page transition config |
| `getFeedback(type)` | config | Interactive feedback variant |
| `getMascotVariant(state)` | config | Mascot animation variant |
| `getRewardVariant(type)` | config | Reward animation variant |
| `getEntrance(variant)` | config | Entrance animation config |
| `getDuration(key)` | `number` | Duration adapted for current mode |
| `getEasing(key)` | `number[]` | Easing curve adapted for current mode |

### `StartupSequence`

Branded opening sequence component.

```tsx
import StartupSequence from '../startup/StartupSequence';

<StartupSequence
  variant="first-launch"
  onComplete={() => setReady(true)}
  isBedtime={bedtimeMode}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `StartupVariant` | auto-detected | Which sequence to show |
| `onComplete` | `() => void` | required | Called when done or skipped |
| `isBedtime` | `boolean` | `false` | Bedtime mode flag for auto-detection |

---

## Temporary 2.5D Mascot Locomotion

The current homepage lion is a subdivided plane textured with the approved PNG and
deformed as a `THREE.SkinnedMesh`. It is an interactive fallback, not a production
quadruped. Do not extend this plane rig as the final character solution. World-level
travel and fallback articulation must still run together; never replace locomotion
with image swaps, sprite frames, video playback, or a whole-character bob.

### Sunny Meadow Play Loop

1. Keep the first 5.2 seconds planted so the greeting, gaze, speech, and wave
   remain readable.
2. Walk across the hill with alternating leg IK and small terrain-following root
   travel.
3. Pause and compress into a visible anticipation crouch.
4. Hop along a bounded arc. Legs tuck while airborne; the tail and mane react to
   lift and direction.
5. Land with brief squash, mane follow-through, and tail counterbalance.
6. Rest, walk home, and blend back to the living idle.

`LionLocomotionContext` carries a mutable per-frame locomotion sample from the
Framer Motion world loop into the Three.js render loop without a React render on
every frame. Root motion is limited to scene travel. The existing bones still
control torso weight, head follow, eyes, legs, paws, tail, and mane concurrently.

### Contact Rules

- The Sunny Meadow paw baseline and live grass baseline are both the painted hill
  crest at `54%` of the viewport height.
- Flowers are anchored by their SVG root to measured hill-contour baselines. Do
  not position flower centers with arbitrary `top` values.
- The ground shadow follows horizontal travel but stays on the terrain. During a
  hop it shrinks and fades rather than rising with the character.
- Mobile travel is narrower than desktop travel. The hop remains clearly visible
  at both widths while staying inside the title composition.
- `prefers-reduced-motion` disables travel, hopping, and procedural scenery sway.

### Technical References

- Rive IK constraints for planted feet: https://rive.app/docs/editor/constraints/ik-constraint
- Rive concurrent state blending: https://rive.app/docs/editor/state-machine/states
- Three.js `SkinnedMesh` and skeleton architecture: https://archive.threejs.org/docs/api/en/objects/SkinnedMesh.html
- Motion frame callbacks and motion values: https://motion.dev/docs/react-use-animation-frame and https://motion.dev/docs/react-motion-value

### Production Replacement

The production path is Blender armature and shape-key authoring, GLB export, then
R3F/Drei loading and Three.js animation mixing. The exact bone, clip, morph, export,
validation, feature flag, and acceptance contract is in
`docs/rigged-lion-production.md`. Keep the fallback enabled until the approved GLB
passes `npm run lion:validate` and responsive visual QA.

---

## Quick Reference Card

```
TIMING:     instant(0.1) < fast(0.2) < normal(0.35) < slow(0.5) < gentle(0.8) < glacial(1.2)
SPRINGS:    snappy(400/30) > bouncy(300/20) > gentle(200/25) > lazy(100/20) > bedtime(80/30)
EASINGS:    smooth | decelerate | accelerate | bounce | playful
HIERARCHY:  primary(attention) > secondary(decorative) > ambient(background)
STAGGER:    cascade(50ms) | center-out(40ms) | random(60ms)
MODES:      full | bedtime(1.5x slower, no springs) | reduced(opacity only)
```

---

## Quadruped gait — 2026-08-21

### The walk was a trot, and the code said otherwise

The original Walk clip moved **diagonal pairs** and carried a comment asserting
that was correct quadruped motion. It is not. Diagonal pairs are a **trot**.

A quadruped **walk** is a four-beat **lateral** sequence:

    back-left → front-left → back-right → front-right

each a quarter of the cycle apart, with **two to three feet planted at all
times**. The body rocks gently toward whichever side is supporting.

### As authored

| | |
|---|---|
| Cycle | 48 frames @ 24 fps = 2.0 s |
| Phase offsets | BL 0.00 · FL 0.25 · BR 0.50 · FR 0.75 |
| Duty factor | 75% stance / 25% swing per limb |
| Knee / hock | flexes **only during swing** — a joint that bends while the paw is planted is the classic skating tell |
| Body | one left-right rock per cycle, two vertical dips |
| Head | counter-rotates to stay level |

### Speed must come from the clip

Stride ÷ cycle is the only speed at which a planted paw does not slide. It is
measured off the authored action by the rig script and written to
`locomotion.json`; the runtime scales it and divides.

`WALK_SPEED = 0.52` was derived on paper from an earlier 32-frame two-stride
cycle and never updated when the clip was rewritten — roughly 4× too fast. The
constant is now `WALK_SPEED_FALLBACK` and is only used before the measurement
arrives.

**If a brisker walk is wanted, change the CLIP** — bigger swing or shorter
cycle. Raising the runtime speed only reintroduces skating.

### Priority for a mascot

Readability, softness and weight over zoological accuracy. What must hold:
four distinct contacts, a high duty factor, overlapping support, believable
lateral weight shift, planted-foot phases, a stable head, and coherent
spine/pelvis motion.

### Owed

Per-paw `CONTACT / STANCE / LIFT / SWING / PLACEMENT` visualisation in debug
mode, inspected at 0.25×. `WalkStart` / `WalkStop` / `TurnLeft` / `TurnRight`
with head lead, shoulder turn and paw reposition.
