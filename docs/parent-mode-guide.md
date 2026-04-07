# Parent Mode Visual Strategy

> How parent-facing screens differ from child-facing screens while maintaining brand continuity.

## Overview

Kids Learning Fun has three visual modes:

| Mode | Audience | Feeling | Key File |
|------|----------|---------|----------|
| **Child Mode** | Ages 2-8 | Warm, playful, zoomed-in | `tokens/designTokens.ts` |
| **Parent Mode** | Adults | Professional, calm, data-dense | `brand/parentMode.ts` |
| **Bedtime Mode** | Ages 2-8 (nighttime) | Dark, soothing, minimal | `brand/artDirection.ts` |

Parent mode activates automatically after the math gate is unlocked on ParentDashboard, Settings, or WeeklyRecap pages.

---

## Visual Differences at a Glance

### Colors

| Token | Child Mode | Parent Mode | Rationale |
|-------|-----------|-------------|-----------|
| Background | `#FFF8F0` (cream) | `#F8F9FC` (cool gray) | Less warm, more professional |
| Surface | `#FFFFFF` | `#FFFFFF` | Consistent white cards |
| Text Primary | `#374151` | `#111827` | Darker for data readability |
| Text Secondary | `#6B7280` | `#4B5563` | Slightly darker |
| Text Muted | -- | `#9CA3AF` | For labels and captions |
| Accent | `#FF6B6B` (coral) | `#7C6FAE` (muted grape) | Brand grape, toned down |
| Border | -- | `#E5E7EB` | Visible borders on cards |

### Typography

| Property | Child Mode | Parent Mode | Rationale |
|----------|-----------|-------------|-----------|
| Heading Weight | 800 (extra-bold) | 600 (semibold) | Professional, not playful |
| Body Size | 16px | 14px | Higher data density |
| Line Height | 1.5 | 1.6 | More breathing room for data |
| Font Features | normal | `'tnum' on, 'lnum' on` | Tabular nums for aligned columns |
| Label Spacing | normal | `0.04em` | Wide tracking on section headers |
| Max Line Length | 45 chars | 65 chars | Adult reading width |

### Spacing

| Property | Child Mode | Parent Mode | Rationale |
|----------|-----------|-------------|-----------|
| Card Padding | 16px | 20px | More internal breathing room |
| Section Gap | 16px | 24px | Clear visual separation |
| Item Gap | -- | 12px | Tighter data rows |
| Page Padding | 16px | 20px | Generous margins |
| Max Width | -- | 640px | Focused reading column |

### Motion

| Property | Child Mode | Parent Mode | Rationale |
|----------|-----------|-------------|-----------|
| Transition Duration | 350ms | 200ms | Snappier, more efficient |
| Spring Damping | 20 (bouncy) | 30 (critically damped) | No playful bouncing |
| Stagger Delay | 50ms | 30ms | Faster reveal sequences |
| Entrance Offset | 15px | 10px | Subtler slide-in |

### Icons

| Property | Child Mode | Parent Mode | Rationale |
|----------|-----------|-------------|-----------|
| Style | Emoji / Filled | Outline | Professional feel |
| Size | 40-48px | 20px | Information-density appropriate |
| Stroke Width | -- | 1.5px | Thin, precise lines |

### Cards

| Property | Child Mode | Parent Mode | Rationale |
|----------|-----------|-------------|-----------|
| Corner Radius | `rounded-2xl` (16px) | `rounded-xl` (12px) | Slightly tighter corners |
| Shadow | `shadow-md` | `shadow-sm` | Subtler elevation |
| Border | none | `border border-gray-100` | Defined edges |

---

## Brand Continuity Principles

Parent mode is a **calmer expression of the same brand world**, not a separate design system.

1. **Same color family, muted expression.** The accent is still grape (from the brand palette), just desaturated. Background shifts from warm cream to cool gray but stays light and airy.

2. **Same typeface, different weight.** The font family stays consistent (Nunito or system). Only the weight, size, and features change.

3. **Same motion language, reduced intensity.** Animations still use the motion primitives system -- just with critically-damped springs (no bouncing) and faster durations.

4. **Same card shape, tighter corners.** Cards use the same rounded rectangle language, just with `rounded-xl` instead of `rounded-2xl` for a more refined feel.

5. **No mascots, but brand color touches.** Parent screens do not show mascot characters, but the grape accent and occasional teal highlight maintain brand presence.

---

## Transition Behavior

When a parent unlocks the math gate, `ParentModeTransition` provides a smooth visual shift:

```tsx
import ParentModeTransition from '../brand/ParentModeTransition';

function ParentDashboard() {
  const [unlocked, setUnlocked] = useState(false);

  return (
    <ParentModeTransition isParentMode={unlocked}>
      {unlocked ? <DashboardContent /> : <MathGate onUnlock={() => setUnlocked(true)} />}
    </ParentModeTransition>
  );
}
```

The transition applies:
- **Fade**: 0 to 1 opacity over 400ms
- **Scale**: Child content slightly "zooms out" (1.02 to 1.0 for child exit, 0.98 to 1.0 for parent enter)
- **Color shift**: Background transitions from cream to cool gray via CSS custom properties
- **Typography shift**: Font weight and size adjust through the wrapper's inline styles

The `AnimatePresence` with `mode="wait"` ensures no visual overlap between modes.

---

## Reusable Parent UI Patterns

### Page Wrapper

```tsx
import { ParentModeWrapper } from '../brand/ParentModeTransition';

function MyParentPage() {
  return (
    <ParentModeWrapper className="p-5 pb-8">
      {/* Content here inherits parent mode styling */}
    </ParentModeWrapper>
  );
}
```

### Section Headers

```tsx
import { ParentSectionHeader } from '../brand/ParentModeTransition';

<ParentSectionHeader>Weekly Activity</ParentSectionHeader>
// Renders: uppercase, wide-tracked, 12px, muted gray
```

### Data Cards

```tsx
import { ParentCard } from '../brand/ParentModeTransition';

<ParentCard delay={0.1}>
  <h3>Category Progress</h3>
  {/* Card content */}
</ParentCard>
// Renders: white bg, rounded-xl, shadow-sm, border, 20px padding, fade-in entrance
```

### Data Values (tabular numbers)

```tsx
import { parentDataValueStyle } from '../brand/parentMode';

<span style={parentDataValueStyle}>1,247</span>
// Renders: tabular nums, semibold, primary color
```

### Motion Presets

```tsx
import { parentTransition, parentEntrance } from '../brand/parentMode';

<motion.div
  initial={parentEntrance.initial}
  animate={parentEntrance.animate}
  transition={parentTransition}
>
  {/* Content */}
</motion.div>
```

---

## Implementation Guide for New Parent Screens

When creating a new parent-facing page:

### 1. Use the Parent Mode Wrapper

Wrap the page content in `<ParentModeWrapper>` or apply `parentPageStyle` and `parentPageClasses`:

```tsx
<div className={parentPageClasses} style={parentPageStyle}>
```

### 2. Use Parent Card Components

Replace `bg-white rounded-2xl shadow-md` with `<ParentCard>` or `parentCardClasses`:

```tsx
<div className={parentCardClasses} style={parentCardStyle}>
```

### 3. Apply Parent Typography

- Use `font-semibold` (600) for headings, not `font-extrabold` (800)
- Use 14px body text: `text-sm` in Tailwind
- Add tabular numbers on data: `style={{ fontFeatureSettings: "'tnum' on" }}`
- Section headers: `<ParentSectionHeader>`

### 4. Use Muted Accent Colors

- Primary accent: `#7C6FAE` (muted grape)
- Success: `#059669` (emerald-600)
- Warning: `#D97706` (amber-600)
- Error: `#DC2626` (red-600)

### 5. Apply Parent Motion

- Use `parentTransition` for all animations
- Use `parentEntrance` for card/section entrance
- Stagger at 30ms intervals: `transition={{ ...parentTransition, delay: index * 0.03 }}`
- No `type: 'spring'` with damping < 25

### 6. No Mascots

- Do not render MascotBubble or character illustrations
- Use outline icons (20px, 1.5px stroke) instead of emoji

### 7. Behind the Gate

- Every parent page must include a math gate or verify `unlocked` state
- The gate itself uses child mode styling (it is the child-to-parent transition point)

---

## Example: How Existing Pages Apply These Rules

### ParentDashboard (`src/pages/ParentDashboard.tsx`)

Currently uses child mode patterns (`bg-cream`, `rounded-2xl`, `shadow-md`, `font-bold`). To migrate:

- Replace `bg-cream` with `parentPageClasses + parentPageStyle`
- Replace `bg-white rounded-2xl shadow-md p-4` with `<ParentCard>`
- Replace `text-sm tracking-wide uppercase` headers with `<ParentSectionHeader>`
- Replace emoji stat icons with outline icons
- Add `fontFeatureSettings` to numeric values

### SettingsPage (`src/pages/SettingsPage.tsx`)

Currently uses child mode patterns. To migrate:

- Wrap unlocked content in `<ParentModeWrapper>`
- Use parent card styling for each settings section
- Keep toggle components (they are universal UI)
- Replace emoji section icons with outline equivalents
- Use `parentTransition` for section entrance animations

#### Voice Picker

When the Speech toggle is enabled in Settings, a voice picker section expands below the toggle. This lets parents choose which system voice the app uses for text-to-speech throughout the experience.

- **Voice list**: Shows all available English voices detected on the device. Novelty voices (Albert, Bells, Boing, etc.) are hidden by default to keep the list focused on natural-sounding options.
- **Preview**: Tapping any voice plays a sample sentence so parents can hear the difference before committing.
- **Selection**: The selected voice is highlighted and the choice is persisted to IndexedDB so it carries across sessions.
- **Enhanced/Premium badges**: Voices marked as enhanced or premium by the OS are highlighted with a star icon, making higher-quality options easy to spot.
- **Download prompt**: If no Enhanced voices are detected on the device, the picker displays instructions guiding the parent to download them from **macOS System Settings > Accessibility > Spoken Content > System Voice > Manage Voices**.
- **Show all toggle**: A "Show all" toggle at the bottom of the list reveals novelty and fun voices (Albert, Bells, Boing, etc.) for families who want a more playful TTS experience.

### WeeklyRecapPage (`src/pages/WeeklyRecapPage.tsx`)

As a data-heavy parent page, it benefits most from parent mode:

- Tabular numbers for all statistics
- Parent section headers for report categories
- Muted accent colors for charts (grape, teal at 60% opacity)
- Higher data density with 14px text and tighter item gaps

---

## CSS Custom Properties

Parent mode sets custom properties on the wrapper element for downstream components:

```css
--theme-bg: #F8F9FC
--theme-card: #FFFFFF
--theme-text: #111827
--theme-text-secondary: #4B5563
--theme-text-muted: #9CA3AF
--theme-accent: #7C6FAE
--theme-border: #E5E7EB
--theme-success: #059669
--theme-warning: #D97706
--theme-error: #DC2626
--parent-body-size: 14px
--parent-card-padding: 20px
--parent-section-gap: 24px
```

These can be consumed by any child component using `var(--theme-accent)` etc., enabling automatic theme switching without prop drilling.

---

## File Reference

| File | Purpose |
|------|---------|
| `src/brand/parentMode.ts` | Parent mode config, child mode config, CSS variable generator, helper classes and styles |
| `src/brand/ParentModeTransition.tsx` | Animated transition wrapper, ParentModeWrapper, ParentCard, ParentSectionHeader components |
| `src/tokens/designTokens.ts` | Base design tokens and theme variants (child, calm, parent) |
| `src/brand/artDirection.ts` | Art direction bible including parent mood color scheme |
