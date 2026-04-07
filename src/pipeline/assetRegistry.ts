// ── Asset Registry & Catalog ─────────────────────────────────────
// Central registry of all graphic assets in the app. Every asset must
// be registered here with complete metadata before it can be used in
// components. Provides lookup, search, preloading, and a React hook.

import { useState, useEffect } from 'react';
import type {
  AssetMeta,
  AssetCategory,
  AssetFormat,
  ColorMode,
  IllustrationStyle,
  AssetSize,
} from './assetPipeline';
import { assetFolders } from './assetPipeline';

// ── Standard Size Sets (for reference in entries) ───────────────

const ICON_SIZES: AssetSize[] = [
  { label: '20', width: 20, height: 20 },
  { label: '24', width: 24, height: 24 },
  { label: '32', width: 32, height: 32 },
];

const CONTENT_SIZES: AssetSize[] = [
  { label: 'sm', width: 64, height: 64 },
  { label: 'md', width: 128, height: 128 },
  { label: 'lg', width: 256, height: 256 },
];

const SCENE_SIZES: AssetSize[] = [
  { label: '1x', width: 375, height: 240 },
  { label: '2x', width: 750, height: 480 },
];

const STICKER_SIZES: AssetSize[] = [
  { label: 'sm', width: 48, height: 48 },
  { label: 'md', width: 80, height: 80 },
  { label: 'lg', width: 120, height: 120 },
];

// ── Helper: create AssetMeta entry ──────────────────────────────

function defineAsset(
  id: string,
  filename: string,
  category: AssetCategory,
  subject: string,
  overrides: Partial<Omit<AssetMeta, 'id' | 'filename' | 'category' | 'subject'>> = {},
): AssetMeta {
  const defaults: Omit<AssetMeta, 'id' | 'filename' | 'category' | 'subject'> = {
    sizes: category === 'icon' ? ICON_SIZES
      : category === 'scene-background' ? SCENE_SIZES
      : category === 'reward-sticker' ? STICKER_SIZES
      : CONTENT_SIZES,
    format: 'svg' as AssetFormat,
    colorMode: 'monochrome' as ColorMode,
    illustrationStyle: 'outlined' as IllustrationStyle,
    tags: [],
    usedIn: [],
    createdAt: '2026-03-20',
    approved: true,
  };

  return {
    id,
    filename,
    category,
    subject,
    ...defaults,
    ...overrides,
  };
}

// ── Registered Assets ─────────────────────────────────────────
// Each entry represents one asset the app uses or plans to use.

const registeredAssets: AssetMeta[] = [
  // ── Icons (6) ──────────────────────────────────────────────

  defineAsset('icon-star', 'icon_star_filled_24.svg', 'icon', 'star', {
    variant: 'filled',
    tags: ['reward', 'progress', 'achievement', 'rating'],
    usedIn: ['StarCounter', 'CelebrationOverlay', 'RewardsPage', 'ParentDashboard'],
    colorMode: 'monochrome',
  }),

  defineAsset('icon-heart', 'icon_heart_outline_24.svg', 'icon', 'heart', {
    variant: 'outline',
    tags: ['favorite', 'like', 'love'],
    usedIn: ['FavoriteButton', 'StoriesPage'],
    colorMode: 'monochrome',
  }),

  defineAsset('icon-lock', 'icon_lock_outline_24.svg', 'icon', 'lock', {
    variant: 'outline',
    tags: ['parent-gate', 'locked', 'premium', 'settings'],
    usedIn: ['SettingsPage', 'ParentDashboard', 'AccessConfig'],
    colorMode: 'monochrome',
  }),

  defineAsset('icon-play', 'icon_play_filled_24.svg', 'icon', 'play', {
    variant: 'filled',
    tags: ['video', 'audio', 'start', 'action'],
    usedIn: ['VideoCard', 'AudioPlayerBar', 'VideoPlayer'],
    colorMode: 'monochrome',
  }),

  defineAsset('icon-check', 'icon_check_outline_24.svg', 'icon', 'check', {
    variant: 'outline',
    tags: ['complete', 'success', 'done', 'approved'],
    usedIn: ['ProgressDots', 'QAPreviewPanel', 'CompletionSummary'],
    colorMode: 'monochrome',
  }),

  defineAsset('icon-arrow-right', 'icon_arrow-right_outline_24.svg', 'icon', 'arrow-right', {
    variant: 'outline',
    tags: ['navigation', 'next', 'forward', 'continue'],
    usedIn: ['NavButton', 'ContentCard', 'MainMenu'],
    colorMode: 'monochrome',
  }),

  // ── Scene Backgrounds (5) ──────────────────────────────────

  defineAsset('scene-classroom', 'scene_classroom__1x.svg', 'scene-background', 'classroom', {
    tags: ['learning', 'school', 'lessons', 'abc', 'numbers'],
    usedIn: ['LessonsPage', 'AbcPage', 'NumbersPage'],
    colorMode: 'full',
    illustrationStyle: 'flat',
    sizes: SCENE_SIZES,
  }),

  defineAsset('scene-bedroom', 'scene_bedroom_night_1x.svg', 'scene-background', 'bedroom', {
    variant: 'night',
    tags: ['bedtime', 'sleep', 'night', 'calm', 'stories'],
    usedIn: ['BedtimePage', 'StoriesPage'],
    colorMode: 'full',
    illustrationStyle: 'flat',
    sizes: SCENE_SIZES,
  }),

  defineAsset('scene-nature', 'scene_nature__1x.svg', 'scene-background', 'nature', {
    tags: ['outdoors', 'animals', 'exploration', 'discovery', 'garden'],
    usedIn: ['AnimalsPage', 'ExplorerPage', 'HomeActivitiesPage'],
    colorMode: 'full',
    illustrationStyle: 'flat',
    sizes: SCENE_SIZES,
  }),

  defineAsset('scene-stage', 'scene_stage__1x.svg', 'scene-background', 'stage', {
    tags: ['performance', 'movement', 'dance', 'music', 'celebration'],
    usedIn: ['MovementPage', 'AudioPage', 'RewardsPage'],
    colorMode: 'full',
    illustrationStyle: 'flat',
    sizes: SCENE_SIZES,
  }),

  defineAsset('scene-clouds', 'scene_clouds__1x.svg', 'scene-background', 'clouds', {
    tags: ['sky', 'dreamy', 'imagination', 'creative', 'coloring'],
    usedIn: ['ColoringPage', 'EmotionsPage', 'WelcomePage'],
    colorMode: 'full',
    illustrationStyle: 'flat',
    sizes: SCENE_SIZES,
  }),

  // ── Mascot Poses (5) ──────────────────────────────────────

  defineAsset('mascot-leo-waving', 'mascot_leo_waving_md.svg', 'mascot-pose', 'leo', {
    variant: 'waving',
    tags: ['lion', 'greeting', 'welcome', 'hello', 'brave', 'encouraging'],
    usedIn: ['WelcomePage', 'MainMenu', 'MascotBubble'],
    colorMode: 'full',
    illustrationStyle: 'rounded',
    sizes: CONTENT_SIZES,
  }),

  defineAsset('mascot-daisy-dancing', 'mascot_daisy_dancing_md.svg', 'mascot-pose', 'daisy', {
    variant: 'dancing',
    tags: ['duck', 'dance', 'movement', 'energy', 'playful', 'curious'],
    usedIn: ['MovementPage', 'GamesPage', 'MascotBubble'],
    colorMode: 'full',
    illustrationStyle: 'rounded',
    sizes: CONTENT_SIZES,
  }),

  defineAsset('mascot-ollie-reading', 'mascot_ollie_reading_md.svg', 'mascot-pose', 'ollie', {
    variant: 'reading',
    tags: ['owl', 'reading', 'stories', 'bedtime', 'calm', 'wise'],
    usedIn: ['StoriesPage', 'BedtimePage', 'LessonsPage', 'MascotBubble'],
    colorMode: 'full',
    illustrationStyle: 'rounded',
    sizes: CONTENT_SIZES,
  }),

  defineAsset('mascot-ruby-cheering', 'mascot_ruby_cheering_md.svg', 'mascot-pose', 'ruby', {
    variant: 'cheering',
    tags: ['rabbit', 'celebration', 'energy', 'social', 'games', 'excited'],
    usedIn: ['CelebrationOverlay', 'GamesPage', 'RewardsPage', 'MascotBubble'],
    colorMode: 'full',
    illustrationStyle: 'rounded',
    sizes: CONTENT_SIZES,
  }),

  defineAsset('mascot-finn-thinking', 'mascot_finn_thinking_md.svg', 'mascot-pose', 'finn', {
    variant: 'thinking',
    tags: ['fox', 'puzzle', 'thinking', 'exploring', 'clever', 'adventure'],
    usedIn: ['QuizPage', 'MatchingPage', 'ExplorerPage', 'MascotBubble'],
    colorMode: 'full',
    illustrationStyle: 'rounded',
    sizes: CONTENT_SIZES,
  }),

  // ── Reward Stickers (4) ────────────────────────────────────

  defineAsset('sticker-gold-star', 'sticker_gold-star__lg.svg', 'reward-sticker', 'gold-star', {
    tags: ['reward', 'star', 'gold', 'achievement', 'excellent'],
    usedIn: ['CelebrationOverlay', 'StarBurst', 'RewardsPage'],
    colorMode: 'full',
    illustrationStyle: 'rounded',
    sizes: STICKER_SIZES,
  }),

  defineAsset('sticker-great-job', 'sticker_great-job__lg.svg', 'reward-sticker', 'great-job', {
    tags: ['reward', 'praise', 'completion', 'encouragement'],
    usedIn: ['SectionComplete', 'CompletionSummary'],
    colorMode: 'full',
    illustrationStyle: 'rounded',
    sizes: STICKER_SIZES,
  }),

  defineAsset('sticker-super', 'sticker_super__lg.svg', 'reward-sticker', 'super', {
    tags: ['reward', 'praise', 'superhero', 'amazing', 'power'],
    usedIn: ['CelebrationOverlay', 'BadgeToast'],
    colorMode: 'full',
    illustrationStyle: 'rounded',
    sizes: STICKER_SIZES,
  }),

  defineAsset('sticker-wow', 'sticker_wow__lg.svg', 'reward-sticker', 'wow', {
    tags: ['reward', 'surprise', 'amazement', 'discovery'],
    usedIn: ['CelebrationOverlay', 'AssessmentPage'],
    colorMode: 'full',
    illustrationStyle: 'rounded',
    sizes: STICKER_SIZES,
  }),
];

// ── Registry Data Structure ───────────────────────────────────

const assetMap = new Map<string, AssetMeta>(
  registeredAssets.map((a) => [a.id, a])
);

// ── Registry API ──────────────────────────────────────────────

export interface AssetRegistry {
  /** All registered assets as a map */
  readonly assets: Map<string, AssetMeta>;

  /** Get a single asset by its unique ID */
  getAsset(id: string): AssetMeta | undefined;

  /** Get all assets in a given category */
  getAssetsByCategory(category: AssetCategory): AssetMeta[];

  /** Get the public URL for an asset, optionally at a specific size */
  getAssetUrl(id: string, sizeLabel?: string): string;

  /** Preload a set of assets by their IDs (creates Image objects) */
  preloadAssets(ids: string[]): Promise<void>;

  /** Search assets by a text query across tags, subject, and ID */
  searchAssets(query: string): AssetMeta[];

  /** Get all assets used by a specific component or page */
  getAssetsForComponent(componentName: string): AssetMeta[];

  /** Get all unapproved assets (for review pipeline) */
  getUnapprovedAssets(): AssetMeta[];

  /** Validate the registry for missing files, naming issues, etc. */
  validateRegistry(): RegistryValidationResult[];
}

export interface RegistryValidationResult {
  readonly assetId: string;
  readonly issue: string;
  readonly severity: 'error' | 'warning';
}

/**
 * The singleton asset registry instance.
 */
export const assetRegistry: AssetRegistry = {
  assets: assetMap,

  getAsset(id: string): AssetMeta | undefined {
    return assetMap.get(id);
  },

  getAssetsByCategory(category: AssetCategory): AssetMeta[] {
    return registeredAssets.filter((a) => a.category === category);
  },

  getAssetUrl(id: string, sizeLabel?: string): string {
    const meta = assetMap.get(id);
    if (!meta) {
      console.warn(`[AssetRegistry] Unknown asset ID: "${id}"`);
      return '';
    }

    const folder = assetFolders[meta.category].replace(/^public\//, '/');

    if (sizeLabel) {
      // For sized variants, construct the filename with size suffix
      const ext = meta.filename.split('.').pop() ?? 'svg';
      const baseName = meta.filename.replace(/\.[^.]+$/, '');
      return `${folder}/${baseName}_${sizeLabel}.${ext}`;
    }

    return `${folder}/${meta.filename}`;
  },

  async preloadAssets(ids: string[]): Promise<void> {
    const promises = ids.map((id) => {
      const url = assetRegistry.getAssetUrl(id);
      if (!url) return Promise.resolve();

      return new Promise<void>((resolve) => {
        if (url.endsWith('.svg')) {
          // For SVGs, use fetch to warm the cache
          fetch(url)
            .then(() => resolve())
            .catch(() => resolve());
        } else {
          // For raster images, use Image object
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = url;
        }
      });
    });

    await Promise.all(promises);
  },

  searchAssets(query: string): AssetMeta[] {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    return registeredAssets.filter((a) => {
      // Search across multiple fields
      if (a.id.toLowerCase().includes(q)) return true;
      if (a.subject.toLowerCase().includes(q)) return true;
      if (a.variant?.toLowerCase().includes(q)) return true;
      if (a.tags.some((t) => t.toLowerCase().includes(q))) return true;
      if (a.usedIn.some((u) => u.toLowerCase().includes(q))) return true;
      return false;
    });
  },

  getAssetsForComponent(componentName: string): AssetMeta[] {
    const name = componentName.toLowerCase();
    return registeredAssets.filter((a) =>
      a.usedIn.some((u) => u.toLowerCase() === name)
    );
  },

  getUnapprovedAssets(): AssetMeta[] {
    return registeredAssets.filter((a) => !a.approved);
  },

  validateRegistry(): RegistryValidationResult[] {
    const results: RegistryValidationResult[] = [];

    for (const asset of registeredAssets) {
      // Check for duplicate IDs
      const count = registeredAssets.filter((a) => a.id === asset.id).length;
      if (count > 1) {
        results.push({
          assetId: asset.id,
          issue: `Duplicate asset ID "${asset.id}" found ${count} times`,
          severity: 'error',
        });
      }

      // Check filename follows naming convention
      const prefix = asset.filename.split('_')[0];
      const expectedPrefixes: Record<AssetCategory, string> = {
        'icon': 'icon',
        'scene-background': 'scene',
        'mascot-pose': 'mascot',
        'reward-sticker': 'sticker',
        'educational-object': 'object',
        'pattern-fill': 'pattern',
        'cover-art': 'cover',
        'ui-element': 'ui',
      };
      if (prefix !== expectedPrefixes[asset.category]) {
        results.push({
          assetId: asset.id,
          issue: `Filename prefix "${prefix}" does not match category "${asset.category}" (expected "${expectedPrefixes[asset.category]}")`,
          severity: 'error',
        });
      }

      // Check for empty tags
      if (asset.tags.length === 0) {
        results.push({
          assetId: asset.id,
          issue: 'Asset has no tags, making it unsearchable',
          severity: 'warning',
        });
      }

      // Check for empty usedIn
      if (asset.usedIn.length === 0) {
        results.push({
          assetId: asset.id,
          issue: 'Asset has no usedIn references -- may be orphaned',
          severity: 'warning',
        });
      }

      // Check sizes array is not empty
      if (asset.sizes.length === 0) {
        results.push({
          assetId: asset.id,
          issue: 'Asset has no defined sizes',
          severity: 'error',
        });
      }
    }

    return results;
  },
};

// ── React Hook: useAsset ────────────────────────────────────────

export interface UseAssetResult {
  /** The asset metadata, or undefined if not found */
  meta: AssetMeta | undefined;
  /** The resolved URL for the asset */
  url: string;
  /** Whether the asset is currently loading (preloading) */
  loading: boolean;
  /** Whether loading encountered an error */
  error: boolean;
}

/**
 * React hook for loading and using an asset in a component.
 *
 * @param id - The asset ID from the registry
 * @param sizeLabel - Optional size label (e.g., 'md', '2x')
 * @returns Asset metadata, resolved URL, and loading state
 *
 * @example
 * ```tsx
 * function StarIcon() {
 *   const { url, loading } = useAsset('icon-star');
 *   if (loading) return <span>...</span>;
 *   return <img src={url} alt="Star" width={24} height={24} />;
 * }
 * ```
 */
export function useAsset(id: string, sizeLabel?: string): UseAssetResult {
  const meta = assetRegistry.getAsset(id);
  const url = meta ? assetRegistry.getAssetUrl(id, sizeLabel) : '';

  const [loading, setLoading] = useState(!!url);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!url) {
      setLoading(false);
      setError(!meta);
      return;
    }

    setLoading(true);
    setError(false);

    if (url.endsWith('.svg')) {
      fetch(url)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
          setError(true);
        });
    } else {
      const img = new Image();
      img.onload = () => setLoading(false);
      img.onerror = () => {
        setLoading(false);
        setError(true);
      };
      img.src = url;
    }
  }, [url, meta]);

  return { meta, url, loading, error };
}

// ── React Hook: useAssetsByCategory ─────────────────────────────

/**
 * Returns all registered assets for a given category.
 * Useful for admin/preview panels.
 */
export function useAssetsByCategory(category: AssetCategory): AssetMeta[] {
  return assetRegistry.getAssetsByCategory(category);
}

// ── Preload Helpers ─────────────────────────────────────────────

/**
 * Preloads the "critical" assets that appear on the main menu
 * and welcome screen. Call this during app initialization.
 */
export async function preloadCriticalAssets(): Promise<void> {
  const criticalIds = [
    'icon-star',
    'icon-play',
    'icon-arrow-right',
    'mascot-leo-waving',
  ];
  await assetRegistry.preloadAssets(criticalIds);
}

/**
 * Preloads assets associated with a specific page.
 * Call when navigating to a page or in route-level prefetch.
 */
export async function preloadPageAssets(pageName: string): Promise<void> {
  const assets = assetRegistry.getAssetsForComponent(pageName);
  const ids = assets.map((a) => a.id);
  if (ids.length > 0) {
    await assetRegistry.preloadAssets(ids);
  }
}

// ── Re-exports ──────────────────────────────────────────────────

export type { AssetMeta, AssetCategory, AssetFormat, ColorMode, IllustrationStyle, AssetSize };
