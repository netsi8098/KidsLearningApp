# Kids Learning Fun -- Design System v2.0

Developer reference. **Source of truth:** `src/design-system.ts`

## 1. Importing Tokens

```ts
import { colors, typography, spacing, radius, shadows, gradients,
  motion, patterns, contentTypeColors, badgeStyles, a11y } from '@/design-system';
import type { ColorKey, TypographyScale, SpringPreset, ShadowLevel,
  ContentType, BadgeType, PatternKey } from '@/design-system';
```

## 2. Common Component Patterns

```tsx
// Page shell (use pageWithBottomNav when tab bar is visible)
<div className={patterns.page}><div className={patterns.maxWidth}>...</div></div>

// Cards
<div className={patterns.cardPadded}>...</div>
<motion.div className={patterns.cardInteractive} whileTap={{ scale: 0.98 }}>...</motion.div>

// Buttons
<button className={patterns.buttonPrimary}>Start Lesson</button>
<button className={patterns.buttonSecondary}>Maybe Later</button>
<button className={patterns.buttonGhost}>Skip</button>
<button className={patterns.buttonBack}><ChevronLeft /></button>

// Pills / filter chips
<span className={`${patterns.pill} ${active ? patterns.pillActive : patterns.pillInactive}`}>Games</span>

// Section headers
<p className={patterns.sectionHeader}>TODAY'S PICKS</p>
<h2 className={patterns.sectionTitle}>Keep Learning</h2>

// Horizontal scroll rail
<div className={patterns.rail}>
  {items.map(i => <div key={i.id} className={patterns.railItem} style={{ width: 160 }}>...</div>)}
</div>

// Progress bar
<div className={`${patterns.progressTrack} h-2`}>
  <div className={patterns.progressFill} style={{ width: `${percent}%` }} />
</div>
```

## 3. Three Visual Modes

**Child mode (default):** Cream background, white cards, warm shadows. Use standard `patterns.*`.

**Bedtime mode:** Dark indigo palette. Activated via `bedtime` CSS class on `documentElement`.

```tsx
<div className={patterns.bedtimePage}>
  <div className={patterns.bedtimeCard}>
    <p className={patterns.bedtimeText}>Goodnight story</p>
  </div>
</div>
// Colors: colors.bedtime.*  |  Shadow: shadows.bedtimeCard  |  Spring: motion.springs.bedtime
```

**Parent mode:** Clean slate palette. Entered via parent gate. Sharper corners (`rounded-xl`).

```tsx
<div className={patterns.parentPage}>
  <div className={patterns.parentCard}><p className={patterns.parentText}>Weekly report</p></div>
</div>
// Colors: colors.parent.*
```

## 4. Color Usage Guidelines

| Purpose | Token | When |
|---------|-------|------|
| Page bg | `colors.surface` (#FFF8F0) | All child-mode pages |
| Card bg | `colors.surfaceCard` (#FFFFFF) | Cards, modals, sheets |
| Muted area | `colors.surfaceMuted` (#F5F0E8) | Inactive sections, empty states |
| Primary text | `colors.textPrimary` (#2D2D3A) | Headings, body text |
| Secondary text | `colors.textSecondary` (#6B6B7B) | Descriptions, labels |
| Tertiary text | `colors.textTertiary` (#9B9BAB) | Hints, placeholders |
| Accent text | `colors.textAccent` (#FF6B6B) | Links, highlights, streaks |
| Soft tints | `colors.coralSoft`, etc. | Tag backgrounds, badges |
| Status | `colors.success/warning/error/info` | Feedback, alerts |

Use `contentTypeColors[type]` for per-type `bg`, `text`, `soft`, and `gradient` values.

**Rule:** Never use brand colors at full opacity on large surfaces. Use `*Soft` tints.

## 5. Typography Hierarchy

```tsx
<h1 className={typography.classes.display}>Welcome Back!</h1>   // 32px / 800
<h2 className={typography.classes.heading}>Today's Lessons</h2> // 24px / 800
<h3 className={typography.classes.title}>Counting Animals</h3>  // 18px / 700
<p className={typography.classes.body}>Tap the card...</p>       // 15px / 500
<span className={typography.classes.caption}>3 min read</span>  // 13px / 600
<span className={typography.classes.micro}>NEW</span>            // 11px / 700 uppercase
```

Font: Nunito everywhere. No secondary font.

## 6. Shadow / Elevation Guidelines

| Level | Token | Use case |
|-------|-------|----------|
| xs | `shadows.xs` | Dividers, subtle depth |
| sm | `shadows.sm` | Resting buttons, chips |
| md | `shadows.md` | Dropdowns, tooltips |
| lg | `shadows.lg` | Modals, bottom sheets |
| xl | `shadows.xl` | Full-screen overlays |

Semantic: `shadows.card` (resting), `shadows.cardHover` (hover), `shadows.button`, `shadows.float` (FABs).

Color glows: `shadows.glowCoral/glowTeal/glowGrape/glowGold` for colored halos on CTAs.

Bedtime: Always use `shadows.bedtimeCard`. Standard shadows are invisible on dark backgrounds.

## 7. Motion Guidelines

```tsx
import { motion as m } from 'framer-motion';
import { motion as ds } from '@/design-system';
<m.div initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={ds.springs.snappy} />
```

| Spring | Feel | Use case |
|--------|------|----------|
| `snappy` | Quick, precise | Buttons, toggles, tabs |
| `bouncy` | Playful overshoot | Rewards, celebrations |
| `gentle` | Soft ease-in | Cards entering, page transitions |
| `lazy` | Slow drift | Background parallax, decorations |
| `bedtime` | Very slow, calm | All bedtime animations |

**Stagger:** `fast` (0.03s, 10+ items), `normal` (0.05s, 4-8 items), `slow` (0.08s, 2-4 items).

**Variants:** `fadeIn` (overlays), `slideUp` (cards/lists), `slideDown` (dropdowns), `scaleIn` (modals), `popIn` (rewards).

**Reduced motion:** Always check `useAccessibility().reducedMotion` and use `{ duration: 0 }` when true.

## 8. Accessibility Checklist

- [ ] Interactive elements >= 48x48px (`a11y.minTapTarget`)
- [ ] Focus: `outline: 3px solid #FF6B6B`, `outline-offset: 2px`
- [ ] Text on surface meets 4.5:1 contrast (WCAG AA)
- [ ] Large text (heading/display) meets 3:1 contrast
- [ ] Colored backgrounds use `contentTypeColors[type].text` (pre-validated)
- [ ] All images/icons have `alt` or `aria-label`
- [ ] Clickable cards use `role="button"` and `tabIndex={0}`
- [ ] Dynamic content has screen reader announcements
- [ ] `reducedMotion` disables all animations
- [ ] `largerText` scales body text by 1.2x
- [ ] `highContrast` increases border opacity and text weight
- [ ] Bedtime text (#D4D4E8 on #1A1A2E) passes WCAG AA
- [ ] No info conveyed by color alone (always pair with icon/label)
