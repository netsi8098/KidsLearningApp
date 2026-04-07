// ── Graphics Production Pipeline ───────────────────────────────────
// Defines the complete asset pipeline specification for Kids Learning Fun:
// naming conventions, folder structure, export formats, optimization rules,
// illustration consistency standards, and AI art prompt templates.
//
// This file is the single source of truth for anyone creating, reviewing,
// or loading graphic assets in the app.

// ── Asset Category Taxonomy ───────────────────────────────────────

export type AssetCategory =
  | 'icon'
  | 'scene-background'
  | 'mascot-pose'
  | 'reward-sticker'
  | 'educational-object'
  | 'pattern-fill'
  | 'cover-art'
  | 'ui-element';

/** Human-readable descriptions for each category */
export const assetCategoryDescriptions: Record<AssetCategory, string> = {
  'icon': 'UI icons for navigation, actions, and status indicators. Always SVG, monochrome or duotone.',
  'scene-background': 'Full-width backgrounds for page contexts (classroom, bedroom, nature). SVG preferred for scalability.',
  'mascot-pose': 'Character illustrations in specific poses (waving, reading, thinking). SVG with named color slots.',
  'reward-sticker': 'Celebratory graphics for achievements and rewards. Vibrant, self-contained designs.',
  'educational-object': 'Individual learning items (letters, numbers, shapes, animals). Clean outlines, consistent sizing.',
  'pattern-fill': 'Repeatable tile patterns for decorative backgrounds. SVG, seamless edges required.',
  'cover-art': 'Cover images for collections, playlists, stories. Richer compositions, may include text.',
  'ui-element': 'Buttons, badges, toggles, dividers, and other interface components.',
};

// ── Naming Convention ───────────────────────────────────────────

/**
 * Asset Naming Format:
 * `{category}_{subject}_{variant}_{size}.{ext}`
 *
 * Rules:
 * - All lowercase, words separated by hyphens within segments
 * - Segments separated by underscores
 * - Category uses short form (see categoryPrefixes)
 * - Subject is the primary content descriptor
 * - Variant is optional (filled, outline, night, etc.)
 * - Size is optional when only one size exists
 *
 * Examples:
 *   icon_star_filled_24.svg
 *   icon_heart_outline_20.svg
 *   scene_bedroom_night_1x.svg
 *   mascot_leo_waving_md.svg
 *   sticker_gold-star__lg.svg        (no variant, double underscore)
 *   object_letter-a__sm.svg
 *   pattern_dots_cream_tile.svg
 *   cover_abc-collection__1x.webp
 *   ui_button-primary__md.svg
 */

export const categoryPrefixes: Record<AssetCategory, string> = {
  'icon': 'icon',
  'scene-background': 'scene',
  'mascot-pose': 'mascot',
  'reward-sticker': 'sticker',
  'educational-object': 'object',
  'pattern-fill': 'pattern',
  'cover-art': 'cover',
  'ui-element': 'ui',
};

/**
 * Validates an asset filename against the naming convention.
 * Returns null if valid, or an error message string if invalid.
 */
export function validateAssetFilename(filename: string): string | null {
  // Strip extension
  const dotIdx = filename.lastIndexOf('.');
  if (dotIdx === -1) return 'Missing file extension';

  const ext = filename.slice(dotIdx + 1).toLowerCase();
  if (!['svg', 'png', 'webp'].includes(ext)) {
    return `Invalid extension ".${ext}". Use svg, png, or webp.`;
  }

  const stem = filename.slice(0, dotIdx);
  const parts = stem.split('_');

  if (parts.length < 2) {
    return 'Filename must have at least category_subject segments separated by underscores.';
  }

  const prefix = parts[0];
  const validPrefixes = Object.values(categoryPrefixes);
  if (!validPrefixes.includes(prefix)) {
    return `Unknown category prefix "${prefix}". Valid: ${validPrefixes.join(', ')}.`;
  }

  // Subject must not be empty
  if (!parts[1] || parts[1].length === 0) {
    return 'Subject segment cannot be empty.';
  }

  // Check for uppercase letters
  if (stem !== stem.toLowerCase()) {
    return 'Filename must be all lowercase.';
  }

  // Check for spaces
  if (stem.includes(' ')) {
    return 'Filename must not contain spaces. Use hyphens within segments.';
  }

  return null;
}

// ── Folder Structure ────────────────────────────────────────────

/**
 * Standard folder paths under public/assets/
 *
 * public/assets/
 *   icons/           -- UI icons (SVG, 20-32px)
 *   scenes/          -- Scene backgrounds (SVG, full-width)
 *   mascots/         -- Character poses (SVG, multiple sizes)
 *   stickers/        -- Reward stickers (SVG or WebP)
 *   objects/         -- Educational objects (SVG)
 *   patterns/        -- Pattern fills (SVG, tileable)
 *   covers/          -- Cover art (WebP with PNG fallback)
 *   ui/              -- UI elements (SVG)
 */

export const assetFolders: Record<AssetCategory, string> = {
  'icon': 'public/assets/icons',
  'scene-background': 'public/assets/scenes',
  'mascot-pose': 'public/assets/mascots',
  'reward-sticker': 'public/assets/stickers',
  'educational-object': 'public/assets/objects',
  'pattern-fill': 'public/assets/patterns',
  'cover-art': 'public/assets/covers',
  'ui-element': 'public/assets/ui',
};

/**
 * Returns the expected folder path for a given category.
 * Used by the asset registry and build pipeline.
 */
export function getFolderForCategory(category: AssetCategory): string {
  return assetFolders[category];
}

// ── Asset Size Definitions ──────────────────────────────────────

export interface AssetSize {
  /** Size label: 'sm', 'md', 'lg', '1x', '2x', '3x', or pixel value like '24' */
  readonly label: string;
  /** Width in pixels */
  readonly width: number;
  /** Height in pixels */
  readonly height: number;
}

/** Standard icon sizes */
export const iconSizes: AssetSize[] = [
  { label: '16', width: 16, height: 16 },
  { label: '20', width: 20, height: 20 },
  { label: '24', width: 24, height: 24 },
  { label: '32', width: 32, height: 32 },
  { label: '48', width: 48, height: 48 },
];

/** Standard mascot/object sizes */
export const contentSizes: AssetSize[] = [
  { label: 'sm', width: 64, height: 64 },
  { label: 'md', width: 128, height: 128 },
  { label: 'lg', width: 256, height: 256 },
];

/** Standard scene/cover sizes */
export const sceneSizes: AssetSize[] = [
  { label: '1x', width: 375, height: 240 },
  { label: '2x', width: 750, height: 480 },
  { label: '3x', width: 1125, height: 720 },
];

/** Standard sticker sizes */
export const stickerSizes: AssetSize[] = [
  { label: 'sm', width: 48, height: 48 },
  { label: 'md', width: 80, height: 80 },
  { label: 'lg', width: 120, height: 120 },
];

// ── Export Format Rules ───────────────────────────────────────────

export type AssetFormat = 'svg' | 'png' | 'webp';

export type ColorMode = 'full' | 'monochrome' | 'duotone';

export type IllustrationStyle = 'rounded' | 'flat' | 'outlined';

/**
 * Format decision rules per category.
 * SVG is the default for all vectors. WebP for raster with PNG fallback.
 */
export const formatRules: Record<AssetCategory, {
  readonly preferred: AssetFormat;
  readonly fallback: AssetFormat | null;
  readonly colorMode: ColorMode;
  readonly maxFileSizeKB: number;
  readonly illustrationStyle: IllustrationStyle;
}> = {
  'icon': {
    preferred: 'svg',
    fallback: null,
    colorMode: 'monochrome',
    maxFileSizeKB: 2,
    illustrationStyle: 'outlined',
  },
  'scene-background': {
    preferred: 'svg',
    fallback: 'webp',
    colorMode: 'full',
    maxFileSizeKB: 30,
    illustrationStyle: 'flat',
  },
  'mascot-pose': {
    preferred: 'svg',
    fallback: 'webp',
    colorMode: 'full',
    maxFileSizeKB: 15,
    illustrationStyle: 'rounded',
  },
  'reward-sticker': {
    preferred: 'svg',
    fallback: 'webp',
    colorMode: 'full',
    maxFileSizeKB: 8,
    illustrationStyle: 'rounded',
  },
  'educational-object': {
    preferred: 'svg',
    fallback: null,
    colorMode: 'full',
    maxFileSizeKB: 5,
    illustrationStyle: 'rounded',
  },
  'pattern-fill': {
    preferred: 'svg',
    fallback: null,
    colorMode: 'duotone',
    maxFileSizeKB: 3,
    illustrationStyle: 'flat',
  },
  'cover-art': {
    preferred: 'webp',
    fallback: 'png',
    colorMode: 'full',
    maxFileSizeKB: 50,
    illustrationStyle: 'rounded',
  },
  'ui-element': {
    preferred: 'svg',
    fallback: null,
    colorMode: 'monochrome',
    maxFileSizeKB: 2,
    illustrationStyle: 'outlined',
  },
};

/**
 * Determines the recommended export format for a given asset.
 * Returns preferred format and optional fallback.
 */
export function getRecommendedFormat(category: AssetCategory): {
  preferred: AssetFormat;
  fallback: AssetFormat | null;
} {
  const rule = formatRules[category];
  return {
    preferred: rule.preferred,
    fallback: rule.fallback,
  };
}

// ── SVG Optimization Rules ──────────────────────────────────────

export const svgOptimizationRules = {
  /** Remove all metadata, comments, and editor-specific attributes */
  removeMetadata: true,

  /** Remove XML declaration (<?xml ...?>) */
  removeXmlDeclaration: true,

  /** Remove DOCTYPE declarations */
  removeDoctype: true,

  /** Minify path data (remove redundant whitespace, optimize coordinates) */
  minifyPaths: true,

  /** Standardize viewBox: always include viewBox, remove width/height attributes */
  standardizeViewBox: true,

  /** Convert absolute coordinates to relative where shorter */
  useRelativeCoordinates: true,

  /** Merge overlapping paths where possible */
  mergePaths: true,

  /** Remove empty groups (<g> with no children) */
  removeEmptyGroups: true,

  /** Remove hidden elements (display:none, visibility:hidden, zero-opacity) */
  removeHiddenElements: true,

  /** Convert inline styles to attributes where shorter */
  inlineStylesToAttributes: true,

  /** Use currentColor for single-color icons to enable CSS theming */
  useCurrentColor: true,

  /** Round numeric values to 2 decimal places */
  numericPrecision: 2,

  /** Remove default/unnecessary attribute values */
  removeDefaultAttributes: true,

  /** Collapse useless group nesting */
  collapseUselessGroups: true,

  /** Convert colors to shortest representation (#RGB when possible) */
  shortenColors: true,

  /** Remove title/desc elements (accessibility handled at component level) */
  removeTitleDesc: true,
} as const;

/**
 * SVGO config object compatible with the svgo npm package.
 * Can be used directly in build scripts or vite plugins.
 */
export const svgoConfig = {
  plugins: [
    'preset-default',
    'removeMetadata',
    'removeTitle',
    'removeDesc',
    'removeXMLProcInst',
    'removeDoctype',
    'removeComments',
    {
      name: 'removeAttrs',
      params: { attrs: ['data-name', 'class'] },
    },
    {
      name: 'convertColors',
      params: { currentColor: true },
    },
  ],
  floatPrecision: 2,
};

// ── Illustration Consistency Checklist ─────────────────────────

export interface ConsistencyCheckItem {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly applies: AssetCategory[];
}

export const illustrationConsistencyChecklist: ConsistencyCheckItem[] = [
  {
    id: 'corner-radius',
    label: 'Corner Radius Consistency',
    description: 'All corners use the brand minimum corner radius (4px) or higher. No sharp 90-degree corners on organic shapes. Cards use 12-16px radius.',
    applies: ['icon', 'mascot-pose', 'reward-sticker', 'educational-object', 'ui-element'],
  },
  {
    id: 'stroke-weight',
    label: 'Stroke Weight Uniformity',
    description: 'Stroke widths fall within the 1.5-3.5px range defined in artDirection.ts. Icons use 1.5-2px. Illustrations use 2-3.5px. No hairline or heavy strokes.',
    applies: ['icon', 'mascot-pose', 'educational-object', 'ui-element'],
  },
  {
    id: 'color-palette',
    label: 'Color Palette Adherence',
    description: 'All colors are drawn from the approved palette (cream, coral, teal, sunny, grape, leaf, tangerine, gold, sky, pink) or are tints/shades of these. No off-brand colors.',
    applies: ['icon', 'scene-background', 'mascot-pose', 'reward-sticker', 'educational-object', 'pattern-fill', 'cover-art', 'ui-element'],
  },
  {
    id: 'outline-rule',
    label: 'Outline Color Rule',
    description: 'Outlines use a darkened version of the fill color, never pure black (#000). For light fills, darken by 30-40%. For dark fills, darken by 15-20%.',
    applies: ['mascot-pose', 'reward-sticker', 'educational-object', 'cover-art'],
  },
  {
    id: 'character-proportions',
    label: 'Character Proportions',
    description: 'Mascot heads are ~40% of total height. Eyes are oversized and expressive. Limbs are simplified rounded stubs. Consistent across all poses of the same character.',
    applies: ['mascot-pose'],
  },
  {
    id: 'shadow-style',
    label: 'Shadow Consistency',
    description: 'Shadows use soft drop shadows (not hard-edged). Shadow color is a semi-transparent darkened version of the background, never pure black. Max spread: 8px.',
    applies: ['mascot-pose', 'reward-sticker', 'educational-object', 'cover-art'],
  },
  {
    id: 'visual-density',
    label: 'Visual Density for Age',
    description: 'Toddler assets (2-3): max 3 colors, single focal point. Preschool (4-5): max 5 colors, 2-3 focal areas. Early reader (6-8): max 6 colors, richer detail OK.',
    applies: ['scene-background', 'educational-object', 'cover-art'],
  },
  {
    id: 'line-cap-join',
    label: 'Line Cap and Join',
    description: 'All line caps and joins are rounded (stroke-linecap="round", stroke-linejoin="round"). No butt or miter joins anywhere in the illustration system.',
    applies: ['icon', 'mascot-pose', 'educational-object', 'ui-element'],
  },
  {
    id: 'viewbox-standard',
    label: 'ViewBox Standardization',
    description: 'SVGs include a viewBox attribute. Icons use square viewBoxes (0 0 24 24 or 0 0 20 20). No fixed width/height attributes -- sizing is handled by the consuming component.',
    applies: ['icon', 'mascot-pose', 'reward-sticker', 'educational-object', 'pattern-fill', 'ui-element'],
  },
  {
    id: 'current-color',
    label: 'currentColor Usage',
    description: 'Monochrome and duotone SVGs use currentColor for primary strokes/fills. This enables CSS-based theming and dark/bedtime mode support without asset duplication.',
    applies: ['icon', 'ui-element', 'pattern-fill'],
  },
];

// ── AI Art Prompt Templates ─────────────────────────────────────
// Prompt templates for generating consistent placeholder artwork
// using AI image generation tools (Midjourney, DALL-E, etc.).

export interface ArtPromptTemplate {
  readonly id: string;
  readonly category: AssetCategory;
  readonly name: string;
  readonly template: string;
  readonly negativePrompt: string;
  readonly styleNotes: string;
}

export const artPromptTemplates: ArtPromptTemplate[] = [
  {
    id: 'prompt-icon',
    category: 'icon',
    name: 'UI Icon',
    template: 'Simple outline icon of {subject}, single stroke weight 2px, rounded corners, rounded line caps, minimal detail, centered in a 24x24 grid, white background, clean vector style, no fill, no shadow, no gradient, no perspective',
    negativePrompt: 'realistic, 3d, gradient, filled, complex, detailed, shadow, perspective, photographic, textured',
    styleNotes: 'Generate as SVG or clean PNG on white background. Should be immediately recognizable at 20px display size. Use only straight lines and simple curves.',
  },
  {
    id: 'prompt-scene',
    category: 'scene-background',
    name: 'Scene Background',
    template: 'Children\'s book illustration of {subject}, flat vector style, soft pastel colors using cream (#FFF8F0), coral (#FF6B6B), teal (#4ECDC4), sunny yellow (#FFE66D), gentle rounded shapes, no text, simple composition with clear foreground/background separation, warm and inviting mood, suitable for ages 2-8',
    negativePrompt: 'realistic, photographic, dark, scary, complex, detailed texture, harsh shadows, adult themes, text, typography, sharp edges',
    styleNotes: 'Scene should work as a background with UI overlaid. Keep the bottom third relatively uncluttered for content placement. Use max 5-6 distinct colors from the brand palette.',
  },
  {
    id: 'prompt-mascot',
    category: 'mascot-pose',
    name: 'Mascot Character Pose',
    template: 'Cute cartoon {character} in a {pose} pose, children\'s book illustration style, large head (40% of body), oversized expressive eyes, simplified rounded limbs, primary color {color}, soft outlined with darker shade of primary color (not black), white background, friendly and approachable expression, flat vector style with minimal shading',
    negativePrompt: 'realistic, scary, aggressive, complex anatomy, thin limbs, small eyes, black outlines, 3d rendering, photographic, dark background',
    styleNotes: 'Character should be identifiable at 64px and detailed enough at 256px. Maintain consistent proportions across all poses for the same character. Expression should match the context (learning=focused, play=excited, bedtime=sleepy).',
  },
  {
    id: 'prompt-sticker',
    category: 'reward-sticker',
    name: 'Reward Sticker',
    template: 'Cheerful reward sticker design with "{text}" theme, children\'s app style, vibrant colors using gold (#FFD93D), coral (#FF6B6B), teal (#4ECDC4), round or star-shaped badge, simple celebration elements (sparkles, confetti), thick rounded outlines, white background, joyful and celebratory, suitable for children ages 2-8',
    negativePrompt: 'realistic, photographic, dark, subtle, muted colors, complex, text-heavy, adult design, thin lines',
    styleNotes: 'Stickers should feel like a tangible reward. They need to read clearly at 48px (thumbnail in collection) and look detailed at 120px (celebration screen). Limit to 4-5 colors max.',
  },
  {
    id: 'prompt-object',
    category: 'educational-object',
    name: 'Educational Object',
    template: 'Simple children\'s illustration of {subject}, flat vector style, clean rounded outline (2.5px stroke), solid fill with subtle gradient, primary color from palette ({color}), outline color is a 30% darker shade of fill (not black), centered on white background, friendly and approachable, suitable for early learning app, single object with no background elements',
    negativePrompt: 'realistic, photographic, complex detail, multiple objects, background scene, dark colors, sharp edges, 3d perspective, texture, shadow',
    styleNotes: 'Each object must be immediately recognizable by a 2-year-old. Silhouette should be distinctive even without color. Maintain consistent sizing and weight across all objects in a set (all letters same size, all animals similar visual weight).',
  },
];

// ── Review Checklist for Approving New Graphics ──────────────────

export interface ReviewCheckItem {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly severity: 'blocker' | 'major' | 'minor';
}

export const graphicsReviewChecklist: ReviewCheckItem[] = [
  {
    id: 'review-naming',
    label: 'Naming Convention',
    description: 'Filename follows the {category}_{subject}_{variant}_{size}.{ext} convention. All lowercase, hyphens within segments, underscores between segments.',
    severity: 'blocker',
  },
  {
    id: 'review-folder',
    label: 'Correct Folder Placement',
    description: 'Asset is placed in the correct subdirectory under public/assets/ matching its category.',
    severity: 'blocker',
  },
  {
    id: 'review-format',
    label: 'Export Format',
    description: 'File is exported in the preferred format for its category (SVG for vectors, WebP for raster). Fallback format provided if required.',
    severity: 'major',
  },
  {
    id: 'review-file-size',
    label: 'File Size Budget',
    description: 'File size is within the maximum allowed for its category. Icons <2KB, scenes <30KB, mascots <15KB, stickers <8KB, objects <5KB, patterns <3KB, covers <50KB, UI <2KB.',
    severity: 'major',
  },
  {
    id: 'review-consistency',
    label: 'Illustration Consistency',
    description: 'Asset passes all applicable items in the illustration consistency checklist (corner radius, stroke weight, palette, proportions, etc.).',
    severity: 'major',
  },
  {
    id: 'review-accessibility',
    label: 'Color Contrast',
    description: 'Key elements meet WCAG AA contrast ratios (4.5:1 for text, 3:1 for large text and essential graphics). Tested against both light and dark backgrounds if applicable.',
    severity: 'major',
  },
  {
    id: 'review-bedtime',
    label: 'Bedtime Mode Compatibility',
    description: 'If the asset will appear in bedtime contexts, verify it works on dark backgrounds. SVGs using currentColor adapt automatically. Raster assets may need a dark variant.',
    severity: 'minor',
  },
  {
    id: 'review-registry',
    label: 'Registry Entry',
    description: 'Asset has been registered in assetRegistry.ts with complete metadata (id, filename, category, sizes, tags, usedIn references).',
    severity: 'blocker',
  },
];

// ── Asset Metadata Interface ────────────────────────────────────

export interface AssetMeta {
  /** Unique identifier (e.g., 'icon-star-filled') */
  readonly id: string;
  /** Full filename with extension (e.g., 'icon_star_filled_24.svg') */
  readonly filename: string;
  /** Asset category */
  readonly category: AssetCategory;
  /** Primary subject descriptor */
  readonly subject: string;
  /** Optional variant (e.g., 'filled', 'outline', 'night') */
  readonly variant?: string;
  /** Available sizes for this asset */
  readonly sizes: AssetSize[];
  /** Primary file format */
  readonly format: AssetFormat;
  /** Color mode */
  readonly colorMode: ColorMode;
  /** Illustration style */
  readonly illustrationStyle: IllustrationStyle;
  /** Searchable tags */
  readonly tags: string[];
  /** Page/component references where this asset is used */
  readonly usedIn: string[];
  /** ISO date string of creation */
  readonly createdAt: string;
  /** Whether this asset has been reviewed and approved */
  readonly approved: boolean;
  /** Optional notes from the reviewer */
  readonly reviewNotes?: string;
}

/**
 * Generates the expected file path for an asset based on its metadata.
 */
export function getAssetPath(meta: AssetMeta, sizeLabel?: string): string {
  const folder = assetFolders[meta.category];
  if (sizeLabel) {
    const baseName = meta.filename.replace(/\.[^.]+$/, '');
    const ext = meta.filename.split('.').pop();
    return `${folder}/${baseName}_${sizeLabel}.${ext}`;
  }
  return `${folder}/${meta.filename}`;
}

/**
 * Generates the public URL path for an asset (relative to app root).
 * Strips the leading 'public/' since Vite serves public/ at root.
 */
export function getAssetUrl(meta: AssetMeta, sizeLabel?: string): string {
  const fullPath = getAssetPath(meta, sizeLabel);
  return fullPath.replace(/^public\//, '/');
}
