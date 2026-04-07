# Ambience Guide -- Kids Learning Fun

Visual and audio ambient system that creates living, breathing backgrounds
for every screen in the app.

---

## 1. Scene Reference

Six pre-defined scenes, each with a unique visual personality:

### Daytime (default)
- **Particles:** 8 floating clouds, soft white, drift rightward
- **Gradient:** Light sky blue fading to cream
- **Animation:** Drift at 0.5x speed (very gentle)
- **Drone:** `ambient-daytime` (C4+E4 pad, barely audible)
- **Usage:** Main menu, ABC, Numbers, Colors, Shapes, default pages

### Bedtime
- **Particles:** 15 twinkling stars, soft lavender/gold
- **Gradient:** Deep indigo to dark navy
- **Animation:** Twinkle at 0.3x speed (very slow pulse)
- **Drone:** `ambient-bedtime` (C3+G3 filtered drone)
- **Ambient sounds:** `bedtime-twinkle` (intermittent)
- **Usage:** Auto-activated when bedtime mode is on

### Music
- **Particles:** 10 floating musical notes, soft grape/purple
- **Gradient:** Light coral to warm cream
- **Animation:** Float upward at 0.8x speed
- **Usage:** Audio page, singalong, movement page

### Story
- **Particles:** 6 large soft clouds, very low opacity
- **Gradient:** Warm parchment yellow to cream
- **Animation:** Drift at 0.4x speed (slow and dreamy)
- **Usage:** Stories page, reading activities

### Discovery
- **Particles:** 10 falling leaves, soft green
- **Gradient:** Mint green to cream
- **Animation:** Sway at 0.6x speed (gentle pendulum)
- **Usage:** Discovery, Explorer, Animals, Characters, Cooking

### Classroom
- **Particles:** None
- **Gradient:** Solid warm cream
- **Pattern:** Subtle 24px grid at 3% opacity
- **Usage:** Quiz, Assessment, Matching, Lessons, Parent Dashboard

---

## 2. Visual Particle System

### Architecture

Particles are SVG elements positioned with CSS and animated purely through
CSS keyframes. No JavaScript animation loops run at runtime.

```
ambienceScenes.ts (scene configs)
  -> AmbienceLayer.tsx (React component)
    -> useMemo (generate particle data deterministically)
      -> CSS keyframes (drift | twinkle | sway | float)
        -> GPU-composited transforms
```

### Particle Types

Each particle type is an inline SVG (no external files):

| Type       | Shape                        | Default Color |
|------------|------------------------------|---------------|
| clouds     | Overlapping ellipses         | White         |
| stars      | Circle with 4-line sparkle   | Gold          |
| notes      | Musical note (oval + stem)   | Grape purple  |
| leaves     | Leaf silhouette with vein    | Leaf green    |
| bubbles    | Circle outline with highlight| Sky blue      |
| snowflakes | 4-line snowflake             | Indigo white  |

### Animation Types

Four CSS keyframe animations are injected once:

- **drift**: Particles float in their drift direction and return.
  Period: 15-40 seconds. Good for clouds and slow scenes.
- **twinkle**: Particles pulse opacity and scale. Period: 15-40s.
  Used for stars in bedtime.
- **sway**: Particles follow a pendulum path with gentle rotation.
  Period: 15-40s. Used for leaves.
- **float**: Particles rise upward in a gentle curve. Period: 15-40s.
  Used for musical notes and bubbles.

### Deterministic Positioning

Particles are positioned using a seeded pseudo-random number generator
based on the scene ID. This ensures the same layout on every render
without causing visual jumps on re-render.

### Performance Caps

- **Maximum 20 particles** (hard cap regardless of intensity).
- All animations use `transform` and `opacity` only (GPU-composited).
- `will-change: transform` is set on each particle.
- `translateZ(0)` forces GPU layer promotion.
- `pointer-events: none` on the particle container prevents hit-testing.
- No `requestAnimationFrame` loops -- pure CSS.

---

## 3. Audio Integration

### Ambient Drones

Scenes can reference a `droneSoundId` from the sound registry. The drone
is played through the sound mixer's ambience channel, which means:

- Volume is controlled by the mixing profile's `ambienceVolume`.
- Ducking applies when narration starts.
- Bedtime reduction multiplier applies.

### Intermittent Sounds

Some scenes list `ambientSoundIds` -- sounds that can play occasionally
to add life (e.g., `bedtime-twinkle` in the bedtime scene). These are
triggered by the ambient system at random intervals respecting cooldowns.

### Audio Enable/Disable

The `useAmbience` hook exposes `isAudioPlaying` and `toggleAudio()`.
Audio is independent of visuals -- users can have visual ambience without
sound, or disable it entirely.

---

## 4. Performance Strategy

### Rendering Cost

| Element          | Cost    | Mitigation                         |
|------------------|---------|------------------------------------|
| Background CSS   | Minimal | Single div, GPU gradient           |
| Grid pattern     | Minimal | CSS background-image, no DOM nodes |
| 8-15 SVG particles | Low  | Static DOM, CSS animation only     |
| Particle creation | One-time | useMemo, deterministic             |
| CSS keyframes    | One-time | Injected once, reused              |

### What We Avoid

- No canvas rendering (too heavy for a background decoration).
- No requestAnimationFrame loops (CPU drain on mobile).
- No WebGL (overkill for decorative particles).
- No image downloads (all SVG is inline).
- No paint-triggering properties (only transform + opacity).

### Reduced Motion

When `prefers-reduced-motion: reduce` is active (via media query) or the
app's `reduced-motion` class is on the root element:

- All particle animations are disabled via `animation: none !important`.
- Particles remain visible in their initial positions (static).
- Background gradients still render (they have no motion).

---

## 5. Context-Aware Usage

### Auto-Detection

The `useAmbience` hook auto-detects the appropriate scene based on:

1. **Bedtime mode** (always wins -- forces bedtime scene).
2. **Route path** (mapped in `detectSceneForRoute()`).

Route mapping:

| Route Pattern               | Scene      |
|-----------------------------|------------|
| `/bedtime`                  | bedtime    |
| `/stories`                  | story      |
| `/audio`, `/movement`       | music      |
| `/discover`, `/explorer`    | discovery  |
| `/animals`, `/characters`   | discovery  |
| `/cooking`, `/home-activities` | discovery |
| `/quiz`, `/assessment`      | classroom  |
| `/matching`, `/lessons`     | classroom  |
| `/parent*`, `/settings`     | classroom  |
| Everything else             | daytime    |

### Manual Override

Developers can call `setScene(sceneId)` to override auto-detection.
The override clears automatically when the route changes.

---

## 6. Intensity Rules

Three intensity levels affect particle count and opacity:

| Intensity | Particle Multiplier | Opacity Multiplier | When to Use           |
|-----------|--------------------|--------------------|------------------------|
| subtle    | 0.5x               | 0.6x               | Reading, concentration |
| normal    | 1.0x               | 1.0x               | General browsing       |
| vivid     | 1.5x               | 1.4x               | Celebrations, rewards  |

### Bedtime Override

Bedtime mode forces intensity to `subtle` regardless of the setting.
Attempts to set a higher intensity in bedtime mode are silently capped.

### Recommendations

- Use `subtle` on pages where reading is the primary activity (Stories,
  Lessons, Assessment).
- Use `normal` for general navigation and menu screens.
- Use `vivid` sparingly -- only for reward screens or celebration moments.
- Never use `vivid` in bedtime mode (the hook prevents this).

---

## 7. Adding New Scenes

To create a new ambience scene:

### Step 1: Define the Scene

Add a new entry to `ambienceScenes` in `src/ambience/ambienceScenes.ts`:

```typescript
myScene: {
  id: 'myScene',
  name: 'My Scene',
  description: 'What this scene feels like and when to use it.',
  layers: [
    { type: 'gradient', zIndex: 0, opacity: 1.0, animation: 'none', animationSpeed: 1 },
    { type: 'particles', zIndex: 1, opacity: 0.08, animation: 'drift', animationSpeed: 0.5 },
  ],
  particleType: 'clouds',  // or 'stars', 'notes', 'leaves', 'bubbles', 'snowflakes'
  particleCount: 8,         // max 20
  particleDrift: { x: 10, y: -2 },
  particleOpacity: 0.08,    // keep low for subtlety
  particleSizeRange: { min: 30, max: 70 },
  backgroundGradient: 'linear-gradient(180deg, #color1 0%, #color2 100%)',
  droneSoundId: 'ambient-daytime',  // optional
},
```

### Step 2: Add Route Mapping

Update `detectSceneForRoute()` in `ambienceScenes.ts` to map relevant
routes to your new scene.

### Step 3: Add a New Particle Type (if needed)

If you need a new particle shape, add a case to `getParticleSvg()` in
`AmbienceLayer.tsx`. Keep the SVG simple -- max 5-6 elements, no complex
paths.

### Step 4: Test

- Verify the gradient looks good in both light and dark environments.
- Check that particle count stays under 20 at `vivid` intensity.
- Test with `prefers-reduced-motion` enabled.
- Verify the scene auto-detects correctly for its target routes.
- If audio is included, test with all mixing profiles.

---

## 8. Component Usage

### Basic Usage

```tsx
import AmbienceLayer from '../ambience/AmbienceLayer';

function MyPage() {
  return (
    <AmbienceLayer sceneId="daytime" intensity="subtle">
      <div className="p-4">
        {/* Your page content goes here */}
      </div>
    </AmbienceLayer>
  );
}
```

### With useAmbience Hook

```tsx
import AmbienceLayer from '../ambience/AmbienceLayer';
import { useAmbience } from '../ambience/useAmbience';

function MyPage() {
  const { currentScene, intensity } = useAmbience();

  return (
    <AmbienceLayer sceneId={currentScene.id} intensity={intensity}>
      <div className="p-4">
        {/* Content */}
      </div>
    </AmbienceLayer>
  );
}
```

### Props

| Prop          | Type                              | Default    | Description                  |
|---------------|-----------------------------------|------------|------------------------------|
| sceneId       | string                            | (required) | Scene ID from registry       |
| intensity     | 'subtle' \| 'normal' \| 'vivid'  | 'subtle'   | Visual intensity             |
| audioEnabled  | boolean                           | undefined  | Reserved for future use      |
| className     | string                            | ''         | Additional CSS class         |
| children      | ReactNode                         | undefined  | Content rendered above scene |
