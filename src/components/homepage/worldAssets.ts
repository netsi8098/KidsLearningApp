/**
 * World asset contract.
 *
 * Each world is drawn in code today. This layer lets painted plates be dropped
 * into /public/assets/worlds/<theme>/ and take over a layer *individually* —
 * a world can run on a painted backplate while its midground is still code, and
 * any plate that is missing simply leaves the code layer visible.
 *
 * Nothing here bakes UI: plates are scenery only. The mascot, title, cards,
 * parent pill and world switcher are always live DOM on top.
 */

export type WorldLayerKey = 'backplate' | 'midground' | 'stage' | 'shelf' | 'foreground';

/** Painted plates use .webp; layers needing transparency use .png. */
const LAYER_EXT: Record<WorldLayerKey, 'webp' | 'png'> = {
  backplate: 'webp',
  midground: 'webp',
  stage: 'png',
  shelf: 'png',
  foreground: 'png',
};

export const WORLD_THEMES = ['sunny-meadow', 'sky-islands', 'treehouse', 'river-garden'] as const;
export type WorldThemeId = typeof WORLD_THEMES[number];

/** Resolve the expected path for a world layer. */
export function worldAssetPath(theme: string, layer: WorldLayerKey): string {
  return `/assets/worlds/${theme}/${layer}.${LAYER_EXT[layer]}`;
}

/**
 * Where each layer sits, so a painted plate lands in the same band as the code
 * layer it replaces. Values are CSS inset strings.
 */
export const LAYER_PLACEMENT: Record<WorldLayerKey, { className: string; zIndex: number }> = {
  backplate:  { className: 'absolute inset-0',                     zIndex: 0 },
  midground:  { className: 'absolute inset-0',                     zIndex: 1 },
  stage:      { className: 'absolute inset-x-0 bottom-[22%] top-[38%]', zIndex: 2 },
  shelf:      { className: 'absolute inset-x-0 bottom-0 h-[30%]',  zIndex: 3 },
  foreground: { className: 'absolute inset-0',                     zIndex: 4 },
};
