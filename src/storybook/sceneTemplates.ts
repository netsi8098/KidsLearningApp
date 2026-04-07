// ─── Cinematic Story Scene Templates ───────────────────────────────────────
// Defines 7 scene types with complete layout specs, moods, transitions,
// and ambient motion for the cinematic storybook experience.

export type SceneType =
  | 'hero-illustration'
  | 'read-aloud'
  | 'interactive'
  | 'dialogue'
  | 'calm-ending'
  | 'dramatic-moment'
  | 'discovery';

export type SceneMood = 'exciting' | 'curious' | 'funny' | 'warm' | 'bedtime' | 'dramatic';

export interface SceneLayout {
  illustrationArea: { position: string; size: string };
  textArea: { position: string; maxWidth: string; alignment: string };
  narrateButton: { position: string };
  interactiveZone?: { position: string; type: string };
}

export interface SceneTextStyle {
  fontSize: string;
  lineHeight: string;
  fontWeight: string;
  color: string;
}

export interface SceneTransition {
  enter: string;   // Framer Motion variant name
  exit: string;
  duration: number; // seconds
}

export interface SceneTemplate {
  type: SceneType;
  layout: SceneLayout;
  mood: SceneMood;
  backgroundColor: string;
  textStyle: SceneTextStyle;
  transition: SceneTransition;
  ambientMotion?: string; // subtle background animation description
}

// ═══════════════════════════════════════════════════════════════════════════
// Scene Templates
// ═══════════════════════════════════════════════════════════════════════════

export const sceneTemplates: Record<SceneType, SceneTemplate> = {
  // ─── 1. Hero Illustration ──────────────────────────────────────────────
  // Large illustration dominates the top; text below.
  // Used for story openings and visually-rich moments.
  'hero-illustration': {
    type: 'hero-illustration',
    layout: {
      illustrationArea: { position: 'top-half', size: '55%' },
      textArea: { position: 'bottom-half', maxWidth: '90%', alignment: 'center' },
      narrateButton: { position: 'bottom-right' },
    },
    mood: 'exciting',
    backgroundColor: '#FFF8F0', // cream
    textStyle: {
      fontSize: '1.5rem',
      lineHeight: '2',
      fontWeight: '600',
      color: '#374151', // gray-700
    },
    transition: {
      enter: 'slideUp',
      exit: 'fadeOut',
      duration: 0.5,
    },
    ambientMotion: 'gentle-float', // illustration gently bobs
  },

  // ─── 2. Read-Aloud ────────────────────────────────────────────────────
  // Text-focused layout with small illustration accent.
  // Ideal for narration-heavy pages.
  'read-aloud': {
    type: 'read-aloud',
    layout: {
      illustrationArea: { position: 'top-right-corner', size: '30%' },
      textArea: { position: 'center', maxWidth: '85%', alignment: 'left' },
      narrateButton: { position: 'bottom-center' },
    },
    mood: 'warm',
    backgroundColor: '#FFFBEB', // warm cream
    textStyle: {
      fontSize: '1.75rem',
      lineHeight: '2.25',
      fontWeight: '500',
      color: '#1F2937', // gray-800
    },
    transition: {
      enter: 'fadeIn',
      exit: 'fadeOut',
      duration: 0.4,
    },
    ambientMotion: 'soft-pulse', // subtle text-area glow
  },

  // ─── 3. Interactive ───────────────────────────────────────────────────
  // Illustration mid-screen with interactive hotspots overlay.
  // Text prompt at bottom invites the child to tap.
  'interactive': {
    type: 'interactive',
    layout: {
      illustrationArea: { position: 'center', size: '50%' },
      textArea: { position: 'bottom', maxWidth: '90%', alignment: 'center' },
      narrateButton: { position: 'top-right' },
      interactiveZone: { position: 'center-overlay', type: 'hotspot-grid' },
    },
    mood: 'curious',
    backgroundColor: '#ECFDF5', // mint
    textStyle: {
      fontSize: '1.4rem',
      lineHeight: '1.75',
      fontWeight: '600',
      color: '#065F46', // emerald-800
    },
    transition: {
      enter: 'scaleIn',
      exit: 'scaleOut',
      duration: 0.45,
    },
    ambientMotion: 'sparkle', // small sparkle particles near hotspots
  },

  // ─── 4. Dialogue ──────────────────────────────────────────────────────
  // Two characters on sides with speech bubbles.
  // Conversational scenes.
  'dialogue': {
    type: 'dialogue',
    layout: {
      illustrationArea: { position: 'split-sides', size: '40%' },
      textArea: { position: 'center-bubble', maxWidth: '80%', alignment: 'center' },
      narrateButton: { position: 'bottom-center' },
    },
    mood: 'funny',
    backgroundColor: '#FFF1F2', // rose tint
    textStyle: {
      fontSize: '1.5rem',
      lineHeight: '1.875',
      fontWeight: '600',
      color: '#374151',
    },
    transition: {
      enter: 'slideLeft',
      exit: 'slideRight',
      duration: 0.4,
    },
    ambientMotion: 'bounce', // characters subtly bounce
  },

  // ─── 5. Calm Ending ──────────────────────────────────────────────────
  // Full-screen soft gradient. Centered text. Illustration faded behind.
  // Perfect for story endings and bedtime closings.
  'calm-ending': {
    type: 'calm-ending',
    layout: {
      illustrationArea: { position: 'background-centered', size: '60%' },
      textArea: { position: 'center', maxWidth: '80%', alignment: 'center' },
      narrateButton: { position: 'bottom-center' },
    },
    mood: 'bedtime',
    backgroundColor: '#1E1B4B', // deep indigo
    textStyle: {
      fontSize: '1.75rem',
      lineHeight: '2.25',
      fontWeight: '500',
      color: '#E0E7FF', // indigo-100
    },
    transition: {
      enter: 'slowFadeIn',
      exit: 'slowFadeOut',
      duration: 0.8,
    },
    ambientMotion: 'stars-twinkle', // faint twinkling dots
  },

  // ─── 6. Dramatic Moment ───────────────────────────────────────────────
  // Zoomed illustration with cinematic top/bottom letterbox bars.
  // Short, impactful text line.
  'dramatic-moment': {
    type: 'dramatic-moment',
    layout: {
      illustrationArea: { position: 'fullscreen-zoom', size: '100%' },
      textArea: { position: 'bottom-letterbox', maxWidth: '90%', alignment: 'center' },
      narrateButton: { position: 'top-right' },
    },
    mood: 'dramatic',
    backgroundColor: '#0C0A09', // stone-950
    textStyle: {
      fontSize: '2rem',
      lineHeight: '2.5',
      fontWeight: '800',
      color: '#FFFFFF',
    },
    transition: {
      enter: 'zoomIn',
      exit: 'zoomOut',
      duration: 0.6,
    },
    ambientMotion: 'camera-shake', // very subtle shake on enter
  },

  // ─── 7. Discovery ────────────────────────────────────────────────────
  // Illustration partially hidden behind a "curtain" that reveals on tap.
  // Builds anticipation.
  'discovery': {
    type: 'discovery',
    layout: {
      illustrationArea: { position: 'center-hidden', size: '50%' },
      textArea: { position: 'top', maxWidth: '85%', alignment: 'center' },
      narrateButton: { position: 'bottom-right' },
      interactiveZone: { position: 'center-reveal', type: 'tap-to-reveal' },
    },
    mood: 'curious',
    backgroundColor: '#FEF3C7', // amber-100
    textStyle: {
      fontSize: '1.5rem',
      lineHeight: '2',
      fontWeight: '600',
      color: '#78350F', // amber-900
    },
    transition: {
      enter: 'slideUp',
      exit: 'fadeOut',
      duration: 0.5,
    },
    ambientMotion: 'question-marks', // floating question marks
  },
};

// ─── Helpers ───────────────────────────────────────────────────────────────

/** Get a scene template by type, with optional bedtime override */
export function getSceneTemplate(type: SceneType, bedtime = false): SceneTemplate {
  const template = sceneTemplates[type];
  if (!bedtime) return template;

  // Override for bedtime mode
  return {
    ...template,
    mood: 'bedtime',
    backgroundColor: '#1E1B4B',
    textStyle: {
      ...template.textStyle,
      color: '#E0E7FF',
    },
    transition: {
      enter: 'slowFadeIn',
      exit: 'slowFadeOut',
      duration: Math.max(template.transition.duration, 0.7),
    },
    ambientMotion: 'stars-twinkle',
  };
}

/** Get the Framer Motion variants for a given transition name */
export function getTransitionVariants(transitionName: string) {
  const variants: Record<string, Record<string, object>> = {
    slideUp: {
      initial: { opacity: 0, y: 60 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -40 },
    },
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    fadeOut: {
      initial: { opacity: 1 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    slowFadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    slowFadeOut: {
      initial: { opacity: 1 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    scaleIn: {
      initial: { opacity: 0, scale: 0.8 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.8 },
    },
    scaleOut: {
      initial: { opacity: 1, scale: 1 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 1.1 },
    },
    slideLeft: {
      initial: { opacity: 0, x: 80 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -80 },
    },
    slideRight: {
      initial: { opacity: 0, x: -80 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 80 },
    },
    zoomIn: {
      initial: { opacity: 0, scale: 1.3 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.9 },
    },
    zoomOut: {
      initial: { opacity: 1, scale: 1 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 1.2 },
    },
  };
  return variants[transitionName] ?? variants.fadeIn;
}

/** Map scene types to suitable emoji accents */
export const sceneAccents: Record<SceneType, string[]> = {
  'hero-illustration': ['🌟', '✨'],
  'read-aloud': ['📖', '🔊'],
  'interactive': ['👆', '🎯'],
  'dialogue': ['💬', '🗨️'],
  'calm-ending': ['🌙', '💤'],
  'dramatic-moment': ['⚡', '😲'],
  'discovery': ['🔍', '❓'],
};
