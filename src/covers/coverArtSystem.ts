// ── Cover Art Direction System ───────────────────────────────────
// Rules and specifications for content cover card layout,
// visual hierarchy, character usage, and aspect ratios.

// ── Content Types ───────────────────────────────────────────────

export type ContentType = 'story' | 'lesson' | 'game' | 'video' | 'song' | 'activity';

// ── Layout Composition Rules ────────────────────────────────────

export interface CompositionRule {
  readonly type: ContentType;
  readonly description: string;
  /** Where the focal illustration/emoji sits */
  readonly focalPlacement: 'center' | 'center-left' | 'center-right' | 'top-center';
  /** How much of the cover the focal element occupies (0-1) */
  readonly focalSize: number;
  /** Title alignment */
  readonly titleAlign: 'center' | 'left' | 'right';
  /** Title position */
  readonly titlePosition: 'bottom' | 'bottom-left' | 'top' | 'overlay-center';
  /** Visual accent style unique to this type */
  readonly accentStyle: string;
  /** Suggested overlay pattern */
  readonly overlayPattern: 'none' | 'dots' | 'waves' | 'stars' | 'confetti' | 'grid';
  /** Background fill style */
  readonly bgStyle: 'gradient' | 'solid-with-accent' | 'illustrated';
  /** Whether mascot should appear by default */
  readonly showMascotDefault: boolean;
}

export const compositionRules: Record<ContentType, CompositionRule> = {
  story: {
    type: 'story',
    description: 'Illustration-heavy with a warm, inviting feel. Title left-aligned at bottom like a book cover.',
    focalPlacement: 'center',
    focalSize: 0.6,
    titleAlign: 'left',
    titlePosition: 'bottom-left',
    accentStyle: 'book-spine-left-border',
    overlayPattern: 'none',
    bgStyle: 'gradient',
    showMascotDefault: true,
  },
  lesson: {
    type: 'lesson',
    description: 'Centered icon with bold title. Clean, organized layout that signals learning.',
    focalPlacement: 'center',
    focalSize: 0.55,
    titleAlign: 'center',
    titlePosition: 'bottom',
    accentStyle: 'subtle-grid-overlay',
    overlayPattern: 'grid',
    bgStyle: 'gradient',
    showMascotDefault: false,
  },
  game: {
    type: 'game',
    description: 'Dynamic angle with action feel. Slightly tilted elements, energetic color burst.',
    focalPlacement: 'center',
    focalSize: 0.65,
    titleAlign: 'center',
    titlePosition: 'bottom',
    accentStyle: 'starburst-behind-focal',
    overlayPattern: 'confetti',
    bgStyle: 'gradient',
    showMascotDefault: false,
  },
  video: {
    type: 'video',
    description: 'Film-strip frame accent. Cinematic feel with play button suggestion.',
    focalPlacement: 'center',
    focalSize: 0.5,
    titleAlign: 'center',
    titlePosition: 'bottom',
    accentStyle: 'filmstrip-top-bottom-border',
    overlayPattern: 'none',
    bgStyle: 'gradient',
    showMascotDefault: false,
  },
  song: {
    type: 'song',
    description: 'Musical wave accent lines. Rhythmic, flowing visual energy.',
    focalPlacement: 'center',
    focalSize: 0.55,
    titleAlign: 'center',
    titlePosition: 'bottom',
    accentStyle: 'musical-wave-bottom',
    overlayPattern: 'waves',
    bgStyle: 'gradient',
    showMascotDefault: false,
  },
  activity: {
    type: 'activity',
    description: 'Hands-on craft feel. Textured background, tactile visual cues.',
    focalPlacement: 'center',
    focalSize: 0.55,
    titleAlign: 'center',
    titlePosition: 'bottom',
    accentStyle: 'dashed-craft-border',
    overlayPattern: 'dots',
    bgStyle: 'gradient',
    showMascotDefault: false,
  },
} as const;

// ── Visual Hierarchy Spec ───────────────────────────────────────

export const visualHierarchy = {
  /** Focal element takes ~60% of cover visual weight */
  focalElement: {
    sizeRatio: 0.6,
    position: 'center-upper-third' as const,
  },
  /** Title rules */
  title: {
    maxLines: 2,
    minFontSize: 16,   // px
    fontWeight: 800,
    lineHeight: 1.2,
    /** Sizes per cover size */
    fontSize: {
      sm: 14,
      md: 18,
      lg: 24,
    },
  },
  /** Badges appear in top-right corner */
  badges: {
    position: 'top-right' as const,
    maxVisible: 2,
    fontSize: 10,
    fontWeight: 700,
    borderRadius: 9999, // pill
    padding: { x: 8, y: 3 },
  },
  /** Age label pill in bottom-left */
  ageLabel: {
    position: 'bottom-left' as const,
    fontSize: 10,
    fontWeight: 700,
    borderRadius: 9999,
    padding: { x: 8, y: 3 },
  },
  /** Duration pill in bottom-right */
  duration: {
    position: 'bottom-right' as const,
    fontSize: 10,
    fontWeight: 600,
    borderRadius: 9999,
    padding: { x: 8, y: 3 },
  },
} as const;

// ── Character Usage Rules ───────────────────────────────────────

export const characterUsageRules = {
  /** When to show a mascot on the cover */
  showMascot: {
    /** Stories always feature the assigned mascot */
    story: 'always' as const,
    /** Lessons show mascot only if it is a guided/tutorial lesson */
    lesson: 'guided-only' as const,
    /** Games show mascot only if it is a character-themed game */
    game: 'themed-only' as const,
    /** Videos never show mascot on cover (the video thumbnail is enough) */
    video: 'never' as const,
    /** Songs show mascot if it is a character sing-along */
    song: 'singalong-only' as const,
    /** Activities show mascot for guided craft activities */
    activity: 'guided-only' as const,
  },
  /** When mascot is shown, it appears as a small avatar in the corner */
  mascotPlacement: 'bottom-right-avatar' as const,
  mascotSize: {
    sm: 28,   // px
    md: 36,
    lg: 48,
  },
  /** Prefer topic emoji as focal, mascot as secondary */
  focalPriority: 'topic-emoji-first' as const,
} as const;

// ── Aspect Ratios ───────────────────────────────────────────────

export type AspectRatioName = '4:3' | '16:9' | '1:1';

export interface AspectRatioSpec {
  readonly name: string;
  readonly ratio: number;      // width / height
  readonly usage: string;
  readonly cssAspect: string;  // CSS aspect-ratio value
}

export const aspectRatios: Record<AspectRatioName, AspectRatioSpec> = {
  '4:3': {
    name: 'Thumbnail',
    ratio: 4 / 3,
    usage: 'Grid cards, browse views, small content tiles',
    cssAspect: '4 / 3',
  },
  '16:9': {
    name: 'Hero',
    ratio: 16 / 9,
    usage: 'Featured banners, hero sections, video covers',
    cssAspect: '16 / 9',
  },
  '1:1': {
    name: 'Square',
    ratio: 1,
    usage: 'Profile avatars, album art, icon tiles',
    cssAspect: '1 / 1',
  },
} as const;

// ── Cover Size Presets ──────────────────────────────────────────

export type CoverSize = 'sm' | 'md' | 'lg';

export interface CoverSizeSpec {
  readonly emojiSize: string;       // Tailwind-compatible font size
  readonly emojiFontSize: number;   // px
  readonly titleSize: number;       // px
  readonly badgeSize: number;       // px
  readonly pillPadding: string;     // CSS padding
  readonly borderRadius: number;    // px
  readonly innerPadding: number;    // px
}

export const coverSizes: Record<CoverSize, CoverSizeSpec> = {
  sm: {
    emojiSize: 'text-4xl',
    emojiFontSize: 36,
    titleSize: 14,
    badgeSize: 9,
    pillPadding: '2px 6px',
    borderRadius: 12,
    innerPadding: 12,
  },
  md: {
    emojiSize: 'text-6xl',
    emojiFontSize: 60,
    titleSize: 18,
    badgeSize: 10,
    pillPadding: '3px 8px',
    borderRadius: 16,
    innerPadding: 16,
  },
  lg: {
    emojiSize: 'text-8xl',
    emojiFontSize: 96,
    titleSize: 24,
    badgeSize: 11,
    pillPadding: '4px 10px',
    borderRadius: 24,
    innerPadding: 24,
  },
} as const;

// ── Type Accent Decorations ─────────────────────────────────────
// Visual descriptors for the unique accent each content type gets.

export const typeAccents = {
  story: {
    name: 'Book Spine',
    description: 'A 4px left border in the accent color, simulating a book spine.',
    css: (accentColor: string) => ({
      borderLeft: `4px solid ${accentColor}`,
    }),
  },
  lesson: {
    name: 'Grid Overlay',
    description: 'A subtle grid pattern overlay at very low opacity.',
    css: () => ({}), // Handled via overlay component
  },
  game: {
    name: 'Starburst',
    description: 'Radial gradient burst behind the focal emoji.',
    css: (accentColor: string) => ({
      backgroundImage: `radial-gradient(circle at 50% 40%, ${accentColor}30 0%, transparent 60%)`,
    }),
  },
  video: {
    name: 'Filmstrip',
    description: 'Top and bottom dashed borders simulating film perforations.',
    css: (accentColor: string) => ({
      borderTop: `3px dashed ${accentColor}40`,
      borderBottom: `3px dashed ${accentColor}40`,
    }),
  },
  song: {
    name: 'Musical Wave',
    description: 'Wavy bottom border using a CSS mask or SVG wave.',
    css: () => ({}), // Handled via SVG in the component
  },
  activity: {
    name: 'Craft Border',
    description: 'Dashed border all around, like a cut-out craft template.',
    css: (accentColor: string) => ({
      border: `2px dashed ${accentColor}50`,
    }),
  },
} as const;
