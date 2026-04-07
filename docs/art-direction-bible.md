# Art Direction Bible -- Kids Learning Fun

> The definitive visual identity reference for all design, illustration, and UI work in the Kids Learning Fun app.

---

## 1. Brand Visual Identity Overview

Kids Learning Fun is a premium educational PWA for children ages 2-8. The visual identity is **warm, friendly, and approachable** -- never cold, clinical, or intimidating. Every visual element should feel like it was crafted by a caring teacher with an art background.

### Core Principles

| Principle | Description |
|-----------|-------------|
| **Soft & Rounded** | No sharp corners anywhere. Everything uses generous border radii. |
| **Warm & Inviting** | Colors lean warm (cream base), even cool colors are softened. |
| **Clear & Uncluttered** | Young children need visual clarity. Less is more. |
| **Joyful & Encouraging** | The app celebrates every interaction. Positive energy throughout. |
| **Age-Responsive** | Visual density and complexity adapt to the child's age group. |

### Design Files Reference

- **Design tokens**: `src/tokens/designTokens.ts`
- **Art direction config**: `src/brand/artDirection.ts`
- **Background scenes**: `src/brand/backgrounds.tsx`
- **Texture patterns**: `src/brand/textures.tsx`
- **Depth system**: `src/brand/depthSystem.ts`
- **Cover art system**: `src/covers/coverArtSystem.ts`
- **Cover palettes**: `src/covers/coverPalettes.ts`
- **Cover component**: `src/covers/ContentCover.tsx`

---

## 2. Illustration Style Rules

All illustrations and custom graphics must follow these rules:

### Geometry

- **Minimum corner radius**: 4px on any shape
- **Preferred corner radius**: 12px for primary UI shapes
- **Stroke weight**: 1.5px (thin) to 3.5px (thick), default 2.5px
- **Line cap**: Always `round`
- **Line join**: Always `round`
- **No sharp points**: Even stars and triangles should have softened vertices

### Fill & Outline

- Use **solid fills with optional subtle gradients** (linear, 2-stop max)
- Outlines are **required** on all illustrated elements
- Outline color should be a **darkened version of the fill color**, never pure black (#000)
- Maximum 6 distinct colors per illustration

### Character Design

- **Head-to-body ratio**: 0.4 (large heads create a friendlier feel)
- **Eyes**: Oversized and expressive, the primary emotional communicator
- **Limbs**: Simplified rounded stubs, not anatomically detailed
- **Expressions**: Always positive or neutral -- never scary, angry, or sad for long

### Do / Don't

| DO | DON'T |
|----|-------|
| Use rounded corners on everything | Use sharp corners or pointed shapes |
| Use a darkened fill color for outlines | Use pure black (#000000) for outlines |
| Keep illustrations simple and readable | Add excessive detail that clutters |
| Use warm, inviting color combinations | Use cold, muted, or dull palettes |
| Make touch targets large and obvious | Make small, hard-to-tap elements |
| Test at the smallest display size | Only preview on large screens |

---

## 3. Color System by Mood

The app uses different color moods depending on content context. Each mood is defined in `src/brand/artDirection.ts` under `moodColorSchemes`.

### Primary Palette

| Name | Hex | Usage |
|------|-----|-------|
| Cream | `#FFF8F0` | Default background |
| Coral | `#FF6B6B` | Primary accent, Leo Lion |
| Teal | `#4ECDC4` | Secondary accent, progress |
| Sunny | `#FFE66D` | Highlights, stars |
| Grape | `#A78BFA` | Ollie Owl, discovery |
| Leaf | `#6BCB77` | Nature, success |
| Tangerine | `#FF8C42` | Finn Fox, energy |
| Gold | `#FFD93D` | Rewards, stories |
| Sky | `#74B9FF` | Learning, calm focus |
| Pink | `#FD79A8` | Ruby Rabbit, social |

### Mood Color Schemes

#### Learning (Sky/Teal)
- **When**: ABC, Numbers, Lessons, Quizzes
- **Feeling**: Focused yet friendly
- **Primary**: Sky `#74B9FF` / Teal `#4ECDC4`
- **Background**: Very light sky `#F0F8FF`
- **Text**: Dark navy `#1E3A5F`

#### Bedtime (Indigo/Purple)
- **When**: Bedtime stories, lullabies, wind-down activities
- **Feeling**: Calm, soothing, sleepy
- **Primary**: Indigo `#4338CA` / Purple `#7C3AED`
- **Background**: Deep night `#1a1a2e`
- **Text**: Light indigo `#E0E7FF`

#### Movement (Coral/Tangerine)
- **When**: Dance, exercise, active games
- **Feeling**: Energetic, exciting, pumped up
- **Primary**: Coral `#FF6B6B` / Tangerine `#FF8C42`
- **Background**: Light coral wash `#FFF5F5`
- **Text**: Dark warm red `#7F1D1D`

#### Storytelling (Gold/Sunny)
- **When**: Stories, read-alongs, narrative content
- **Feeling**: Warm, inviting, magical
- **Primary**: Gold `#FFD93D` / Sunny `#FFE66D`
- **Background**: Warm parchment `#FFFBEB`
- **Text**: Dark amber `#78350F`

#### Parent Space (Gray/Blue)
- **When**: Parent dashboard, settings
- **Feeling**: Professional, trustworthy, clean
- **Primary**: Gray-500 `#6B7280`
- **Background**: Gray-50 `#F9FAFB`
- **Text**: Gray-900 `#111827`

### Contrast Requirements

All mood schemes are designed to meet WCAG AA:
- **Normal text**: minimum 4.5:1 contrast ratio
- **Large text & icons**: minimum 3:1 contrast ratio

---

## 4. Shape Language

Defined in `src/brand/artDirection.ts` under `shapeLanguage`.

### Corner Radii

| Context | sm | md | lg | full |
|---------|----|----|----|----- |
| Cards | 12px | 16px | 24px | 9999px |
| Buttons | 10px | 14px | 20px | 9999px (pill) |
| Badges | 6px | 10px | 9999px (pill) | -- |

### Stroke Weights

| Name | Weight | Usage |
|------|--------|-------|
| Thin | 1.5px | Decorative lines, dividers |
| Medium | 2.5px | Default illustration outlines |
| Thick | 3.5px | Emphasis, active states |

### Icon Rules

- Icon corner radius = 0.25 x icon width
- All icons use `round` line caps and joins
- Minimum icon size: 32px (6-8 age), 48px (4-5 age), 64px (2-3 age)

### Spacing Rhythm

All spacing values are multiples of **4px**:

```
4  8  12  16  24  32  48  64
```

---

## 5. Background Usage Guide

Six scene backgrounds are available in `src/brand/backgrounds.tsx`. Each wraps content as a full-viewport container.

| Background | Use For | Mood |
|-----------|---------|------|
| `SkyGradientBg` | General learning, ABC, Numbers | Calm, focused |
| `ClassroomBg` | Lessons, quizzes | Academic, structured |
| `BedtimeStarsBg` | Bedtime stories, lullabies | Calm, sleepy |
| `NatureMeadowBg` | Animals, nature topics, outdoor activities | Fresh, natural |
| `MusicStageBg` | Songs, music, performances | Exciting, performative |
| `StorybookCloudBg` | Stories, imagination activities | Dreamy, magical |

### Usage Pattern

```tsx
import { SkyGradientBg } from '../brand/backgrounds';

function MyPage() {
  return (
    <SkyGradientBg>
      <div className="p-4 pb-8">
        {/* Page content */}
      </div>
    </SkyGradientBg>
  );
}
```

### Props

- `className?: string` -- additional CSS classes
- `children?: ReactNode` -- page content
- `reduced?: boolean` -- simplified rendering for low-power devices (fewer animations, less detail)

### Performance Notes

- All backgrounds use SVG, not images (zero network requests)
- Animations use SVG `<animateTransform>` and CSS keyframes (GPU-composited)
- The `reduced` prop strips most animations and decorative detail
- The `.reduced-motion` CSS class on `<html>` also suppresses animations via media query

---

## 6. Visual Depth & Layering

Defined in `src/brand/depthSystem.ts`.

### Layer Stack

| Layer | z-index | Purpose |
|-------|---------|---------|
| **Base** | 0 | Background gradients, scene backdrops |
| **Decorative** | 10 | Texture patterns, ambient shapes (3-15% opacity) |
| **Interaction** | 20 | Cards, buttons, inputs -- all touchable UI |
| **Floating** | 30 | Rewards, celebrations, toasts, modals |

### Shadow Progression

- **Base**: No shadow (it IS the background)
- **Decorative**: No shadow (subtle overlay only)
- **Interaction**: `0 4px 6px -1px rgba(0,0,0,0.07)` -- gentle lift
- **Floating**: `0 20px 25px -5px rgba(0,0,0,0.1)` -- prominent elevation

### Bedtime Variant

In bedtime mode, layer contrast is reduced:
- Shadows are softer and darker-based (not lighter)
- Interaction layer drops to 0.98 opacity
- Floating layer uses heavier blur for a dreamy quality

### Usage

```ts
import { getLayerStyle } from '../brand/depthSystem';

// Standard layer style
const cardStyle = getLayerStyle('interaction');

// Bedtime mode
const bedtimeCardStyle = getLayerStyle('interaction', { bedtime: true });
```

---

## 7. Texture & Pattern Rules

Defined in `src/brand/textures.tsx`. All patterns render as absolute-positioned SVG overlays with `pointer-events: none`.

### Available Patterns

| Pattern | Default Opacity | Best For |
|---------|----------------|----------|
| `DotPattern` | 0.05 | Learning sections, structured content |
| `WavePattern` | 0.04 | Music, audio, flowing content |
| `StarfieldPattern` | 0.08 | Bedtime mode, nighttime themes |
| `ConfettiPattern` | 0.06 | Celebrations, achievements |
| `GridPattern` | 0.03 | Lessons, worksheets, structured learning |

### Usage Rules

1. **Never exceed 0.15 opacity** -- patterns are ambient, not focal
2. **One pattern per page** -- combining multiple patterns creates visual noise
3. **Match pattern to content mood** -- dots for learning, stars for bedtime, etc.
4. **Bedtime mode** uses `StarfieldPattern` exclusively
5. **Parent dashboard** uses no patterns (clean, professional)

### Usage Example

```tsx
import { DotPattern } from '../brand/textures';

function LessonPage() {
  return (
    <div className="relative min-h-dvh bg-cream p-4 pb-8">
      <DotPattern color="#74B9FF" opacity={0.04} />
      {/* Content goes here */}
    </div>
  );
}
```

---

## 8. Age-Appropriate Visual Density

Defined in `src/brand/artDirection.ts` under `visualDensity`.

### Toddler (Ages 2-3)

- **Max visible items**: 4
- **Touch target**: 64px minimum, 72px recommended
- **Font sizes**: Heading 28px, Body 20px
- **Grid**: 2 columns max
- **Animation**: Simple (single transform, short duration)

### Preschool (Ages 4-5)

- **Max visible items**: 8
- **Touch target**: 48px minimum, 56px recommended
- **Font sizes**: Heading 24px, Body 16px
- **Grid**: 2-3 columns
- **Animation**: Moderate (spring physics, stagger)

### Early Reader (Ages 6-8)

- **Max visible items**: 12
- **Touch target**: 44px minimum, 48px recommended
- **Font sizes**: Heading 20px, Body 14px
- **Grid**: 3-4 columns
- **Animation**: Rich (sequenced, particle effects OK)

---

## 9. Content Card Art Direction

See `src/covers/coverArtSystem.ts` for the full specification.

### Composition by Type

| Type | Focal | Title | Accent |
|------|-------|-------|--------|
| Story | Center, 60% | Bottom-left, left-aligned | Book spine left border |
| Lesson | Center, 55% | Bottom, centered | Grid dot overlay |
| Game | Center, 65% | Bottom, centered | Starburst glow + stars |
| Video | Center, 50% | Bottom, centered | Film strip borders |
| Song | Center, 55% | Bottom, centered | Musical wave bottom |
| Activity | Center, 55% | Bottom, centered | Dashed craft border |

### Visual Hierarchy (all covers)

1. **Focal emoji/illustration** -- 60% visual weight, center of card
2. **Title** -- Bold (800 weight), max 2 lines, min 16px
3. **Badges** -- Top-right corner, pill shape, max 2 visible
4. **Age label** -- Bottom-left pill
5. **Duration** -- Bottom-right pill

---

## 10. How to Create New Graphics That Stay Consistent

### Checklist for New Illustrations

- [ ] All corners rounded (minimum 4px radius)
- [ ] Stroke weight between 1.5-3.5px, `round` caps and joins
- [ ] Outline color is a darkened fill, not black
- [ ] Maximum 6 colors from the brand palette
- [ ] Head-to-body ratio ~0.4 for characters
- [ ] Oversized, expressive eyes on characters
- [ ] No frightening, violent, or negative imagery

### Checklist for New UI Components

- [ ] Card radius matches `shapeLanguage.cardRadius` (12/16/24px)
- [ ] Touch targets meet age-group minimums
- [ ] Text contrast meets WCAG AA (4.5:1 normal, 3:1 large)
- [ ] Uses mood-appropriate color scheme
- [ ] Shadow matches depth layer (`getLayerStyle()`)
- [ ] Animations use timing curves from `animationPrinciples`
- [ ] Tested with `.reduced-motion` class active
- [ ] Tested in `.bedtime-mode`

### Checklist for New Backgrounds

- [ ] Uses SVG or CSS gradients (no image files)
- [ ] Has a `reduced` prop for low-power rendering
- [ ] Wraps children with proper z-index layering
- [ ] Colors derive from brand palette
- [ ] Animations respect `prefers-reduced-motion`
- [ ] Tested at 320px, 768px, and 1024px widths

### Adding a New Content Type

1. Add composition rule in `coverArtSystem.ts` (`compositionRules`)
2. Add palette mapping in `coverPalettes.ts` (`defaultTypePalette`)
3. Add type accent decoration in `coverArtSystem.ts` (`typeAccents`)
4. Add TypeDecoration case in `ContentCover.tsx`
5. Update this documentation

---

## Appendix: Typography

- **Font family**: Nunito (primary), system-ui (fallback)
- **Weights**: 400 (body), 500 (medium), 700 (heading), 800 (bold heading), 900 (accent)
- **Line height**: 1.2 (headings), 1.5 (body), 1.7 (reading content)
- **Max line length**: 20 chars (heading), 45 chars (child body), 65 chars (adult body)

## Appendix: Animation Principles

| Easing | Curve | Use For |
|--------|-------|---------|
| Standard | `cubic-bezier(0.4, 0, 0.2, 1)` | Most transitions |
| Playful | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Enter animations (overshoot) |
| Gentle | `cubic-bezier(0.25, 0.1, 0.25, 1)` | Bedtime/calm transitions |
| Snap | `cubic-bezier(0, 0, 0.2, 1)` | Tap feedback |

| Duration | Time | Use For |
|----------|------|---------|
| Instant | 100ms | Tap feedback |
| Fast | 200ms | Button states, toggles |
| Normal | 300ms | Page transitions, card reveals |
| Slow | 500ms | Celebration animations |
| Glacial | 1000ms | Bedtime transitions |
