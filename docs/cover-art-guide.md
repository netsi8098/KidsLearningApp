# Cover Art Guide -- Kids Learning Fun

> How to create, maintain, and extend cover artwork for content cards throughout the app.

---

## 1. Cover Composition Rules by Content Type

Each content type has a distinct visual personality on its cover card. The full specification lives in `src/covers/coverArtSystem.ts`.

### Story Covers

- **Layout**: Illustration-heavy, like a book cover
- **Title**: Left-aligned at bottom-left (book spine feel)
- **Accent**: 4px left border in accent color (simulates book spine)
- **Focal**: Large emoji centered, 60% of cover area
- **Background**: Storytelling palette (gold-to-sunny gradient)
- **Mascot**: Always shown (small avatar, bottom-right)

### Lesson Covers

- **Layout**: Clean, organized, signals "learning"
- **Title**: Centered at bottom
- **Accent**: Subtle dot grid overlay (notebook feel)
- **Focal**: Large emoji centered, 55% of cover area
- **Background**: Learning palette (sky-to-teal gradient)
- **Mascot**: Only for guided/tutorial lessons

### Game Covers

- **Layout**: Dynamic, energetic, action-oriented
- **Title**: Centered at bottom, bold
- **Accent**: Radial starburst glow behind emoji + decorative stars
- **Focal**: Large emoji centered, 65% of cover area (biggest focal)
- **Background**: Active palette (coral-to-tangerine gradient)
- **Mascot**: Only for character-themed games

### Video Covers

- **Layout**: Cinematic, film-like framing
- **Title**: Centered at bottom
- **Accent**: Film strip perforations top and bottom, play button hint
- **Focal**: Emoji centered, 50% of cover area (smaller to leave room for film accents)
- **Background**: Discovery palette (grape-to-pink gradient)
- **Mascot**: Never (the video thumbnail speaks for itself)

### Song / Audio Covers

- **Layout**: Rhythmic, flowing visual energy
- **Title**: Centered at bottom
- **Accent**: Musical wave shapes at bottom edge, musical note decorations
- **Focal**: Emoji centered, 55% of cover area
- **Background**: Discovery palette (grape-to-pink gradient)
- **Mascot**: Only for character sing-along songs

### Activity Covers

- **Layout**: Tactile, hands-on, craft-like
- **Title**: Centered at bottom
- **Accent**: Dashed border inset (cut-out template feel) + scissors icon
- **Focal**: Emoji centered, 55% of cover area
- **Background**: Nature palette (leaf-to-teal gradient)
- **Mascot**: Only for guided craft activities

---

## 2. Color Grouping Rationale

Cover palettes are defined in `src/covers/coverPalettes.ts`. The color choices are intentional:

| Palette | Colors | Why |
|---------|--------|-----|
| **Bedtime** | Indigo to purple | Deep, calming, signals wind-down time |
| **Active** | Coral to tangerine | Warm, energetic, signals excitement and movement |
| **Learning** | Sky to teal | Cool, focused, signals calm attention without boredom |
| **Discovery** | Grape to pink | Vibrant, creative, signals exploration and wonder |
| **Storytelling** | Gold to sunny | Warm, inviting, signals a magical narrative experience |
| **Nature** | Leaf to teal | Fresh, organic, signals outdoor and natural topics |
| **Default** | Cream to white | Neutral, clean, for content that does not fit a mood |

### Text Color Logic

- **Dark text** on light gradients (learning, storytelling, default): ensures readability
- **Light/white text** on dark gradients (bedtime, active, discovery, nature): ensures readability
- All combinations meet **WCAG AA** contrast requirements (4.5:1 minimum for normal text)

---

## 3. Character Usage Decision Tree

Use this flowchart to determine whether a mascot should appear on a cover:

```
Is the content a Story?
  YES --> Always show mascot
  NO  --> Continue

Is the content a guided Lesson or guided Activity?
  YES --> Show mascot
  NO  --> Continue

Is the content a character-themed Game?
  YES --> Show mascot
  NO  --> Continue

Is the content a character Sing-Along?
  YES --> Show mascot
  NO  --> Do NOT show mascot
```

### Which Mascot?

| Mascot | Content Affinity |
|--------|-----------------|
| **Leo Lion** (coral) | Learning, motivation, challenges |
| **Daisy Duck** (sunny) | Discovery, nature, creativity |
| **Ollie Owl** (grape) | Bedtime, reading, quiet activities |
| **Ruby Rabbit** (pink) | Movement, games, social activities |
| **Finn Fox** (tangerine) | Puzzles, exploration, stories |

If the content has no specific mascot assignment, use the child's **active character** from their profile (stored in `AppContext`).

---

## 4. Asset Pipeline Recommendations

### Current: Emoji-First Approach

The app currently uses emoji as the primary visual for cover art. This approach:
- Zero network requests
- Universal support across devices
- Instant rendering
- No asset management overhead

### Future: Illustrated Assets

When budget allows for custom illustrations:

1. **Format**: SVG preferred (scalable, small file size, themeable via CSS)
2. **Fallback**: Emoji remains the fallback if SVG fails to load
3. **Size budget**: Max 10KB per SVG illustration (gzipped)
4. **Color**: Use CSS custom properties so illustrations can adapt to palettes
5. **Style**: Must follow illustration style rules (rounded, soft, friendly)

### Asset Creation Workflow

```
1. Design in vector tool (Figma, Illustrator)
2. Export as optimized SVG (SVGO)
3. Replace hardcoded colors with CSS custom properties
4. Create React component wrapper
5. Add to asset registry
6. Set emoji as fallback
```

### File Organization

```
src/
  assets/
    illustrations/
      covers/        <-- Cover art SVGs (future)
      characters/    <-- Mascot SVGs (future)
      scenes/        <-- Background illustrations (future)
```

---

## 5. Responsive Image Strategy

### Current State (Emoji)

Emoji scale naturally with `font-size`. The `ContentCover` component uses three size tiers:

| Size | Emoji Font Size | Title Font Size | Border Radius | Padding |
|------|----------------|-----------------|---------------|---------|
| `sm` | 36px | 14px | 12px | 12px |
| `md` | 60px | 18px | 16px | 16px |
| `lg` | 96px | 24px | 24px | 24px |

### Aspect Ratios

| Ratio | Name | Usage |
|-------|------|-------|
| `4:3` | Thumbnail | Grid cards, browse views |
| `16:9` | Hero | Featured banners, video covers |
| `1:1` | Square | Profile avatars, album art |

### Future: SVG/Image Responsive Strategy

When transitioning to illustrated covers:

1. Use CSS `aspect-ratio` (already in place) to maintain proportions
2. Serve SVG at all sizes (vector scales perfectly)
3. For raster fallbacks, provide 1x, 2x, 3x via `srcset`
4. Use `loading="lazy"` for off-screen covers
5. Generate dominant-color placeholder from the palette gradient

---

## 6. Placeholder Art Generation

### How the Current System Works

The `ContentCover` component generates complete cover cards purely from props:

```tsx
<ContentCover
  type="story"
  title="The Brave Little Star"
  emoji="..."     // use actual star emoji
  palette="storytelling"
  ageLabel="Ages 3-5"
  duration="5 min"
  badges={[{ label: 'New', color: '#FF6B6B' }]}
  mascotId="leo"
/>
```

This produces a fully-styled card with:
- Gradient background from the storytelling palette
- Large star emoji as the focal point
- "The Brave Little Star" title with text shadow
- Age and duration pills
- "New" badge in top-right
- Leo Lion avatar in bottom corner
- Book-spine left border accent
- Framer Motion hover/tap animations

### Adding New Content

No design work is needed to add new content. Simply provide:

1. A descriptive `title`
2. An appropriate `emoji`
3. The correct `type` (determines accent style)
4. Optionally override the `palette` (otherwise auto-selected by type)

The system handles all visual composition automatically.

### Customizing Palettes

To create a new palette, add an entry to `coverPalettes` in `src/covers/coverPalettes.ts`:

```ts
myNewPalette: {
  name: 'My Palette',
  gradientStart: '#HEX1',
  gradientEnd: '#HEX2',
  gradientAngle: 135,
  textColor: '#TEXTCOLOR',
  textShadow: '0 2px 8px rgba(0,0,0,0.4)',
  accentColor: '#ACCENT',
  badgeBg: 'rgba(R,G,B,0.25)',
  badgeText: '#BADGETEXT',
  pillBg: 'rgba(R,G,B,0.2)',
  pillText: '#PILLTEXT',
}
```

Ensure text-on-gradient contrast meets WCAG AA (4.5:1 for normal text).

---

## 7. Quick Reference: ContentCover Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `type` | `'story' \| 'lesson' \| 'game' \| 'video' \| 'song' \| 'activity'` | Yes | Content type (determines accent decoration) |
| `title` | `string` | Yes | Display title (max 2 lines) |
| `emoji` | `string` | Yes | Focal emoji character |
| `palette` | `CoverPaletteName` | No | Color palette override (auto-selected by type if omitted) |
| `ageLabel` | `string` | No | Age range pill (e.g. "Ages 3-5") |
| `duration` | `string` | No | Duration pill (e.g. "5 min") |
| `badges` | `Array<{label, color}>` | No | Top-right badge pills (max 2) |
| `aspectRatio` | `'4:3' \| '16:9' \| '1:1'` | No | Aspect ratio (default: 4:3) |
| `size` | `'sm' \| 'md' \| 'lg'` | No | Size tier (default: md) |
| `mascotId` | `string` | No | Mascot to show (leo, daisy, ollie, ruby, finn) |
| `className` | `string` | No | Additional CSS classes |
