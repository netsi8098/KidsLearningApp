// ── Ambience Scene Configurations ─────────────────────────────────────────
// Defines the visual and audio layers for each ambient scene in
// Kids Learning Fun. Scenes combine gradient backgrounds, drifting
// particles (SVG), and optional ambient drone sounds.
//
// All visuals use CSS animations for performance (GPU compositing,
// no JS-driven frame loops). Audio references sound IDs from soundRegistry.

// ── Types ─────────────────────────────────────────────────────────────────

export type ParticleType =
  | 'clouds'
  | 'stars'
  | 'notes'
  | 'leaves'
  | 'bubbles'
  | 'snowflakes';

export type AnimationType =
  | 'drift'
  | 'twinkle'
  | 'sway'
  | 'float'
  | 'none';

export interface AmbienceLayer {
  /** Layer type determines rendering approach. */
  type: 'gradient' | 'particles' | 'pattern';
  /** CSS z-index within the ambience container. */
  zIndex: number;
  /** Opacity 0-1. */
  opacity: number;
  /** CSS animation preset. */
  animation?: AnimationType;
  /** Speed multiplier: 0.5 = half speed, 2 = double speed. */
  animationSpeed: number;
}

export interface AmbienceScene {
  /** Unique identifier. */
  id: string;
  /** Human-readable name. */
  name: string;
  /** Description of the scene's mood and purpose. */
  description: string;
  /** Visual + audio layers. */
  layers: AmbienceLayer[];
  /** Type of particle to render (SVG). */
  particleType?: ParticleType;
  /** Number of particles to render (max enforced at 20 for performance). */
  particleCount: number;
  /** Drift direction and speed in px per second. */
  particleDrift: { x: number; y: number };
  /** Base opacity for particles. */
  particleOpacity: number;
  /** Minimum and maximum particle size in px. */
  particleSizeRange: { min: number; max: number };
  /** CSS gradient for the background layer. */
  backgroundGradient: string;
  /** Optional ambient drone sound ID from soundRegistry. */
  droneSoundId?: string;
  /** Optional array of ambient sound IDs that can play intermittently. */
  ambientSoundIds?: string[];
  /** Bedtime variant: if true, this scene auto-activates in bedtime mode. */
  isBedtimeScene?: boolean;
}

// ── Scene Definitions ─────────────────────────────────────────────────────

export const ambienceScenes: Record<string, AmbienceScene> = {

  daytime: {
    id: 'daytime',
    name: 'Sunny Day',
    description:
      'Floating clouds drift across a bright sky. Cheerful and open -- the default ' +
      'scene for learning activities during the day.',
    layers: [
      {
        type: 'gradient',
        zIndex: 0,
        opacity: 1.0,
        animation: 'none',
        animationSpeed: 1,
      },
      {
        type: 'particles',
        zIndex: 1,
        opacity: 0.08,
        animation: 'drift',
        animationSpeed: 0.5,
      },
    ],
    particleType: 'clouds',
    particleCount: 8,
    particleDrift: { x: 12, y: -2 },
    particleOpacity: 0.08,
    particleSizeRange: { min: 40, max: 90 },
    backgroundGradient:
      'linear-gradient(180deg, #E8F4FD 0%, #FFF8F0 40%, #FFF8F0 100%)',
    droneSoundId: 'ambient-daytime',
  },

  bedtime: {
    id: 'bedtime',
    name: 'Starry Night',
    description:
      'Twinkling stars in a deep indigo sky. Very slow movement, deeply calming. ' +
      'Auto-activated when bedtime mode is on.',
    layers: [
      {
        type: 'gradient',
        zIndex: 0,
        opacity: 1.0,
        animation: 'none',
        animationSpeed: 1,
      },
      {
        type: 'particles',
        zIndex: 1,
        opacity: 0.15,
        animation: 'twinkle',
        animationSpeed: 0.3,
      },
    ],
    particleType: 'stars',
    particleCount: 15,
    particleDrift: { x: 0, y: -1 },
    particleOpacity: 0.15,
    particleSizeRange: { min: 2, max: 6 },
    backgroundGradient:
      'linear-gradient(180deg, #0F0C29 0%, #1a1a2e 40%, #16213e 100%)',
    droneSoundId: 'ambient-bedtime',
    ambientSoundIds: ['bedtime-twinkle'],
    isBedtimeScene: true,
  },

  music: {
    id: 'music',
    name: 'Music Stage',
    description:
      'Drifting musical notes float upward against a warm stage-like gradient. ' +
      'Rhythmic and playful -- used for audio, singalong, and movement pages.',
    layers: [
      {
        type: 'gradient',
        zIndex: 0,
        opacity: 1.0,
        animation: 'none',
        animationSpeed: 1,
      },
      {
        type: 'particles',
        zIndex: 1,
        opacity: 0.1,
        animation: 'float',
        animationSpeed: 0.8,
      },
    ],
    particleType: 'notes',
    particleCount: 10,
    particleDrift: { x: 3, y: -18 },
    particleOpacity: 0.1,
    particleSizeRange: { min: 14, max: 24 },
    backgroundGradient:
      'linear-gradient(180deg, #FFF5F5 0%, #FFF0E6 30%, #FFF8F0 100%)',
  },

  story: {
    id: 'story',
    name: 'Storybook',
    description:
      'Soft cloud world with a warm parchment-like gradient. Gentle and inviting, ' +
      'setting the stage for stories and reading adventures.',
    layers: [
      {
        type: 'gradient',
        zIndex: 0,
        opacity: 1.0,
        animation: 'none',
        animationSpeed: 1,
      },
      {
        type: 'particles',
        zIndex: 1,
        opacity: 0.06,
        animation: 'drift',
        animationSpeed: 0.4,
      },
    ],
    particleType: 'clouds',
    particleCount: 6,
    particleDrift: { x: 8, y: -1 },
    particleOpacity: 0.06,
    particleSizeRange: { min: 50, max: 100 },
    backgroundGradient:
      'linear-gradient(180deg, #FFFBEB 0%, #FFF8F0 50%, #FFF8F0 100%)',
  },

  discovery: {
    id: 'discovery',
    name: 'Nature Walk',
    description:
      'Gentle leaves drift in a nature-inspired gradient. Curious and exploratory, ' +
      'perfect for discovery, animals, and explorer pages.',
    layers: [
      {
        type: 'gradient',
        zIndex: 0,
        opacity: 1.0,
        animation: 'none',
        animationSpeed: 1,
      },
      {
        type: 'particles',
        zIndex: 1,
        opacity: 0.07,
        animation: 'sway',
        animationSpeed: 0.6,
      },
    ],
    particleType: 'leaves',
    particleCount: 10,
    particleDrift: { x: 6, y: 10 },
    particleOpacity: 0.07,
    particleSizeRange: { min: 12, max: 22 },
    backgroundGradient:
      'linear-gradient(180deg, #ECFDF5 0%, #F0FFF4 40%, #FFF8F0 100%)',
  },

  classroom: {
    id: 'classroom',
    name: 'Classroom',
    description:
      'Subtle grid pattern on warm cream. Minimal motion to avoid distraction ' +
      'during focused learning activities like quizzes and assessment.',
    layers: [
      {
        type: 'gradient',
        zIndex: 0,
        opacity: 1.0,
        animation: 'none',
        animationSpeed: 1,
      },
      {
        type: 'pattern',
        zIndex: 1,
        opacity: 0.03,
        animation: 'none',
        animationSpeed: 0,
      },
    ],
    particleType: undefined,
    particleCount: 0,
    particleDrift: { x: 0, y: 0 },
    particleOpacity: 0,
    particleSizeRange: { min: 0, max: 0 },
    backgroundGradient:
      'linear-gradient(180deg, #FFF8F0 0%, #FFF8F0 100%)',
  },

} as const;

// ── Helpers ───────────────────────────────────────────────────────────────

/** Get a scene by ID. Falls back to daytime. */
export function getScene(id: string): AmbienceScene {
  return ambienceScenes[id] ?? ambienceScenes.daytime;
}

/** All scene IDs. */
export const allSceneIds: string[] = Object.keys(ambienceScenes);

/**
 * Auto-detect the appropriate scene based on the current route and bedtime state.
 */
export function detectSceneForRoute(pathname: string, isBedtime: boolean): string {
  if (isBedtime) return 'bedtime';

  // Story-related routes
  if (pathname.startsWith('/stories') || pathname.startsWith('/bedtime')) {
    return isBedtime ? 'bedtime' : 'story';
  }

  // Music / audio / movement routes
  if (
    pathname.startsWith('/audio') ||
    pathname.startsWith('/movement')
  ) {
    return 'music';
  }

  // Discovery / nature routes
  if (
    pathname.startsWith('/discover') ||
    pathname.startsWith('/explorer') ||
    pathname.startsWith('/animals') ||
    pathname.startsWith('/characters') ||
    pathname.startsWith('/cooking') ||
    pathname.startsWith('/home-activities')
  ) {
    return 'discovery';
  }

  // Focused learning routes
  if (
    pathname.startsWith('/quiz') ||
    pathname.startsWith('/assessment') ||
    pathname.startsWith('/matching') ||
    pathname.startsWith('/lessons')
  ) {
    return 'classroom';
  }

  // Parent-facing routes use classroom (minimal)
  if (
    pathname.startsWith('/parent') ||
    pathname.startsWith('/settings')
  ) {
    return 'classroom';
  }

  // Default
  return 'daytime';
}

/**
 * Get the intensity-adjusted particle count.
 * 'subtle' = 50% particles, 'normal' = 100%, 'vivid' = 150% (capped at 20).
 */
export function getAdjustedParticleCount(
  scene: AmbienceScene,
  intensity: 'subtle' | 'normal' | 'vivid',
): number {
  const multiplier = intensity === 'subtle' ? 0.5 : intensity === 'vivid' ? 1.5 : 1;
  return Math.min(20, Math.round(scene.particleCount * multiplier));
}

/**
 * Get the intensity-adjusted opacity for particles.
 */
export function getAdjustedOpacity(
  baseOpacity: number,
  intensity: 'subtle' | 'normal' | 'vivid',
): number {
  const multiplier = intensity === 'subtle' ? 0.6 : intensity === 'vivid' ? 1.4 : 1;
  return Math.min(1, baseOpacity * multiplier);
}
