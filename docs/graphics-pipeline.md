# Graphics Production Pipeline

> How to create, name, optimize, review, and load graphic assets in Kids Learning Fun.

## Asset Categories

Every graphic asset belongs to one of eight categories:

| Category | Prefix | Format | Max Size | Example |
|----------|--------|--------|----------|---------|
| **Icons** | `icon` | SVG | 2 KB | Navigation arrows, stars, hearts |
| **Scene Backgrounds** | `scene` | SVG (WebP fallback) | 30 KB | Classroom, bedroom at night, nature |
| **Mascot Poses** | `mascot` | SVG (WebP fallback) | 15 KB | Leo waving, Ollie reading |
| **Reward Stickers** | `sticker` | SVG (WebP fallback) | 8 KB | Gold star, "Great Job!" badge |
| **Educational Objects** | `object` | SVG | 5 KB | Letter A, number 5, triangle |
| **Pattern Fills** | `pattern` | SVG | 3 KB | Dots, waves, confetti tiles |
| **Cover Art** | `cover` | WebP (PNG fallback) | 50 KB | Collection covers, story covers |
| **UI Elements** | `ui` | SVG | 2 KB | Button shapes, dividers, badges |

---

## Naming Conventions

### Format

```
{category}_{subject}_{variant}_{size}.{ext}
```

### Rules

1. **All lowercase**. No camelCase, no uppercase.
2. **Underscores** separate major segments (category, subject, variant, size).
3. **Hyphens** separate words within a segment (`gold-star`, `arrow-right`).
4. **Variant** is optional. If omitted, use double underscore: `sticker_gold-star__lg.svg`
5. **Size** is optional when only one size exists.

### Examples

```
icon_star_filled_24.svg          -- filled star icon at 24px
icon_heart_outline_20.svg        -- outline heart icon at 20px
icon_arrow-right_outline_24.svg  -- right arrow outline at 24px
scene_bedroom_night_1x.svg       -- bedroom scene, night variant, 1x
scene_classroom__1x.svg          -- classroom scene, no variant, 1x
mascot_leo_waving_md.svg         -- Leo in waving pose, medium size
mascot_ollie_reading_lg.svg      -- Ollie reading, large size
sticker_gold-star__lg.svg        -- gold star sticker, large
sticker_great-job__md.svg        -- "great job" sticker, medium
object_letter-a__sm.svg          -- letter A object, small
pattern_dots_cream_tile.svg      -- cream dots pattern, tile
cover_abc-collection__1x.webp    -- ABC collection cover, 1x, WebP
ui_button-primary__md.svg        -- primary button element, medium
```

### Validation

Use `validateAssetFilename()` from `assetPipeline.ts` to programmatically verify filenames:

```typescript
import { validateAssetFilename } from '../pipeline/assetPipeline';

const error = validateAssetFilename('icon_star_filled_24.svg');
// null (valid)

const error2 = validateAssetFilename('MyIcon.jpg');
// "Unknown category prefix \"MyIcon\"..."
```

---

## Folder Structure

```
public/assets/
  icons/                    -- UI icons (SVG, 16-48px)
    icon_star_filled_24.svg
    icon_heart_outline_24.svg
    icon_lock_outline_24.svg
    icon_play_filled_24.svg
    icon_check_outline_24.svg
    icon_arrow-right_outline_24.svg
    ...
  scenes/                   -- Scene backgrounds (SVG, full-width)
    scene_classroom__1x.svg
    scene_classroom__2x.svg
    scene_bedroom_night_1x.svg
    scene_nature__1x.svg
    scene_stage__1x.svg
    scene_clouds__1x.svg
    ...
  mascots/                  -- Character poses (SVG, sm/md/lg)
    mascot_leo_waving_md.svg
    mascot_daisy_dancing_md.svg
    mascot_ollie_reading_md.svg
    mascot_ruby_cheering_md.svg
    mascot_finn_thinking_md.svg
    ...
  stickers/                 -- Reward stickers (SVG, sm/md/lg)
    sticker_gold-star__lg.svg
    sticker_great-job__lg.svg
    sticker_super__lg.svg
    sticker_wow__lg.svg
    ...
  objects/                  -- Educational objects (SVG, sm/md/lg)
    object_letter-a__sm.svg
    object_number-1__sm.svg
    object_triangle__sm.svg
    ...
  patterns/                 -- Pattern fills (SVG, tileable)
    pattern_dots_cream_tile.svg
    pattern_waves_teal_tile.svg
    ...
  covers/                   -- Cover art (WebP + PNG fallback)
    cover_abc-collection__1x.webp
    cover_abc-collection__1x.png
    ...
  ui/                       -- UI elements (SVG)
    ui_button-primary__md.svg
    ui_divider-wavy__full.svg
    ...
```

---

## Export Format Decision Tree

```
Is it a vector graphic?
  YES -> SVG
    Is it an icon or UI element?
      YES -> SVG with currentColor (monochrome/duotone)
      NO  -> SVG with brand palette colors (full color)
    File size > 30KB after optimization?
      YES -> Consider simplifying paths or splitting into layers
      NO  -> Ship as SVG
  NO -> Is it photographic or has complex gradients?
    YES -> WebP (quality 80)
      Provide PNG fallback for Safari < 14?
        YES -> Also export PNG
        NO  -> WebP only
    NO -> SVG (try converting to vector)
```

### Format Rules by Category

| Category | Preferred | Fallback | Color Mode | Style |
|----------|-----------|----------|------------|-------|
| Icons | SVG | -- | Monochrome | Outlined |
| Scenes | SVG | WebP | Full color | Flat |
| Mascots | SVG | WebP | Full color | Rounded |
| Stickers | SVG | WebP | Full color | Rounded |
| Objects | SVG | -- | Full color | Rounded |
| Patterns | SVG | -- | Duotone | Flat |
| Covers | WebP | PNG | Full color | Rounded |
| UI Elements | SVG | -- | Monochrome | Outlined |

---

## SVG Optimization Steps

Every SVG must go through these optimization steps before committing:

### 1. Remove Metadata
- Strip XML declarations (`<?xml ...?>`)
- Remove DOCTYPE
- Remove editor-specific comments and attributes (`data-name`, `class`)
- Remove `<title>` and `<desc>` (accessibility handled at component level)

### 2. Optimize Paths
- Minify path data (remove redundant whitespace)
- Round coordinates to 2 decimal places
- Convert absolute coordinates to relative where shorter
- Merge overlapping paths where safe

### 3. Standardize ViewBox
- Always include `viewBox` attribute
- Remove fixed `width` and `height` attributes
- Icons: square viewBox (`0 0 24 24` or `0 0 20 20`)
- Scenes: aspect-ratio-preserving viewBox

### 4. Clean Structure
- Collapse useless `<g>` nesting
- Remove empty groups
- Remove hidden elements (`display:none`, zero-opacity)
- Convert inline styles to attributes where shorter

### 5. Enable Theming
- Icons and UI elements: use `currentColor` for fill/stroke
- This enables automatic color adaptation via CSS `color` property
- Full-color illustrations: use exact hex values from brand palette

### 6. Minify
- Remove default/unnecessary attribute values
- Shorten color codes (`#FFFFFF` to `#FFF`)
- Remove trailing semicolons in inline styles

### SVGO Configuration

Use this config in build scripts:

```javascript
// svgo.config.js (from assetPipeline.ts)
{
  plugins: [
    'preset-default',
    'removeMetadata',
    'removeTitle',
    'removeDesc',
    'removeXMLProcInst',
    'removeDoctype',
    'removeComments',
    { name: 'removeAttrs', params: { attrs: ['data-name', 'class'] } },
    { name: 'convertColors', params: { currentColor: true } },
  ],
  floatPrecision: 2,
}
```

---

## Illustration Consistency Checklist

Every illustration must pass these 10 checks:

| # | Check | Details |
|---|-------|---------|
| 1 | **Corner Radius** | All corners >= 4px. No sharp 90-degree corners on organic shapes. Cards: 12-16px. |
| 2 | **Stroke Weight** | Within 1.5-3.5px range. Icons: 1.5-2px. Illustrations: 2-3.5px. |
| 3 | **Color Palette** | Only brand colors (cream, coral, teal, sunny, grape, leaf, tangerine, gold, sky, pink) or tints/shades. |
| 4 | **Outline Color** | Darkened fill color, never pure black. Light fills: darken 30-40%. Dark fills: darken 15-20%. |
| 5 | **Character Proportions** | Head ~40% of total height. Oversized eyes. Simplified rounded limbs. |
| 6 | **Shadow Style** | Soft drop shadows only. No hard edges. Semi-transparent darkened background color, not black. Max 8px spread. |
| 7 | **Visual Density** | Toddler: max 3 colors, single focal point. Preschool: max 5 colors. Early reader: max 6 colors. |
| 8 | **Line Cap/Join** | Always rounded (`stroke-linecap="round"`, `stroke-linejoin="round"`). No butt or miter. |
| 9 | **ViewBox** | Always present. No fixed width/height. Icons: square. Scenes: correct aspect ratio. |
| 10 | **currentColor** | Monochrome/duotone SVGs use `currentColor` for CSS theming support. |

---

## AI Placeholder Art Prompt Templates

Use these prompts to generate consistent placeholder artwork with AI tools.

### 1. UI Icons

```
Simple outline icon of {subject}, single stroke weight 2px, rounded corners,
rounded line caps, minimal detail, centered in a 24x24 grid, white background,
clean vector style, no fill, no shadow, no gradient, no perspective

Negative: realistic, 3d, gradient, filled, complex, detailed, shadow,
perspective, photographic, textured
```

### 2. Scene Backgrounds

```
Children's book illustration of {subject}, flat vector style, soft pastel
colors using cream (#FFF8F0), coral (#FF6B6B), teal (#4ECDC4), sunny yellow
(#FFE66D), gentle rounded shapes, no text, simple composition with clear
foreground/background separation, warm and inviting mood, suitable for ages 2-8

Negative: realistic, photographic, dark, scary, complex, detailed texture,
harsh shadows, adult themes, text, typography, sharp edges
```

### 3. Mascot Character Poses

```
Cute cartoon {character} in a {pose} pose, children's book illustration
style, large head (40% of body), oversized expressive eyes, simplified
rounded limbs, primary color {color}, soft outlined with darker shade of
primary color (not black), white background, friendly and approachable
expression, flat vector style with minimal shading

Negative: realistic, scary, aggressive, complex anatomy, thin limbs,
small eyes, black outlines, 3d rendering, photographic, dark background
```

### 4. Reward Stickers

```
Cheerful reward sticker design with "{text}" theme, children's app style,
vibrant colors using gold (#FFD93D), coral (#FF6B6B), teal (#4ECDC4),
round or star-shaped badge, simple celebration elements (sparkles, confetti),
thick rounded outlines, white background, joyful and celebratory, suitable
for children ages 2-8

Negative: realistic, photographic, dark, subtle, muted colors, complex,
text-heavy, adult design, thin lines
```

### 5. Educational Objects

```
Simple children's illustration of {subject}, flat vector style, clean
rounded outline (2.5px stroke), solid fill with subtle gradient, primary
color from palette ({color}), outline color is a 30% darker shade of fill
(not black), centered on white background, friendly and approachable,
suitable for early learning app, single object with no background elements

Negative: realistic, photographic, complex detail, multiple objects,
background scene, dark colors, sharp edges, 3d perspective, texture, shadow
```

---

## Review / Approval Workflow

```
 [Create]          [Optimize]         [Review]           [Approve]
    |                  |                  |                  |
 Artist creates    Run SVGO or        Check against       Add to asset
 asset following   image optimizer.   consistency         registry with
 naming + style    Verify file size   checklist + review  approved: true
 guidelines        budget met         checklist (8 items)
    |                  |                  |                  |
    v                  v                  v                  v
 Draft asset       Optimized asset    Review notes        Production asset
 in working dir    in public/assets/  in QA panel         in registry
```

### Review Checklist (8 items)

1. **Naming Convention** -- Filename matches `{category}_{subject}_{variant}_{size}.{ext}` pattern
2. **Correct Folder** -- Asset placed in the right `public/assets/{category}/` subdirectory
3. **Export Format** -- Preferred format for category (SVG for vectors, WebP for raster)
4. **File Size** -- Within budget for category
5. **Illustration Consistency** -- Passes all 10 items in the consistency checklist
6. **Color Contrast** -- Key elements meet WCAG AA (4.5:1 text, 3:1 graphics)
7. **Bedtime Compatibility** -- Works on dark backgrounds (if applicable)
8. **Registry Entry** -- Added to `assetRegistry.ts` with complete metadata

---

## Metadata Schema

Every registered asset has this metadata structure:

```typescript
interface AssetMeta {
  id: string;              // Unique identifier: 'icon-star-filled'
  filename: string;        // Full filename: 'icon_star_filled_24.svg'
  category: AssetCategory; // 'icon' | 'scene-background' | etc.
  subject: string;         // 'star'
  variant?: string;        // 'filled' | 'outline' | 'night' | etc.
  sizes: AssetSize[];      // [{ label: '24', width: 24, height: 24 }]
  format: 'svg' | 'png' | 'webp';
  colorMode: 'full' | 'monochrome' | 'duotone';
  illustrationStyle: 'rounded' | 'flat' | 'outlined';
  tags: string[];          // ['reward', 'progress', 'achievement']
  usedIn: string[];        // ['StarCounter', 'RewardsPage']
  createdAt: string;       // '2026-03-20'
  approved: boolean;
}
```

---

## Loading Assets in React Components

### Basic Usage: `useAsset` Hook

```tsx
import { useAsset } from '../pipeline/assetRegistry';

function StarIcon() {
  const { url, loading, error } = useAsset('icon-star');

  if (loading) return <span className="w-6 h-6 bg-gray-100 rounded animate-pulse" />;
  if (error) return <span>*</span>;

  return <img src={url} alt="Star" width={24} height={24} />;
}
```

### Sized Variant

```tsx
const { url } = useAsset('mascot-leo-waving', 'lg');
// Returns URL for the large (256px) variant
```

### Preloading Critical Assets

```tsx
import { preloadCriticalAssets } from '../pipeline/assetRegistry';

// Call during app initialization
useEffect(() => {
  preloadCriticalAssets();
}, []);
```

### Preloading Page Assets

```tsx
import { preloadPageAssets } from '../pipeline/assetRegistry';

// Call when navigating to a page
function usePrefetch(pageName: string) {
  useEffect(() => {
    preloadPageAssets(pageName);
  }, [pageName]);
}
```

### Searching the Registry

```tsx
import { assetRegistry } from '../pipeline/assetRegistry';

// Search by text
const results = assetRegistry.searchAssets('star');
// Returns all assets with 'star' in id, subject, tags, etc.

// Get by category
const icons = assetRegistry.getAssetsByCategory('icon');

// Get for a component
const pageAssets = assetRegistry.getAssetsForComponent('RewardsPage');
```

### Validation

```tsx
const issues = assetRegistry.validateRegistry();
for (const issue of issues) {
  console.warn(`[${issue.severity}] ${issue.assetId}: ${issue.issue}`);
}
```

---

## File Reference

| File | Purpose |
|------|---------|
| `src/pipeline/assetPipeline.ts` | Categories, naming rules, folder structure, format rules, SVG optimization, consistency checklist, AI prompts, review checklist |
| `src/pipeline/assetRegistry.ts` | Asset catalog, lookup/search API, `useAsset` hook, preloading, validation |
| `src/brand/artDirection.ts` | Illustration style rules, color mood schemes, character specs |
