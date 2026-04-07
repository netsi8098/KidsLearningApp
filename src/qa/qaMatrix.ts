// ── QA Review Matrix ─────────────────────────────────────────────
// Defines which QA areas are required vs optional for each content type,
// along with relative weights for scoring/prioritization.
//
// This matrix drives the QA Preview Panel to show the right checks
// for the right content, and helps reviewers focus on what matters most.

import type { QAArea, ContentTypeForQA } from './qaChecklist';

// ── Types ────────────────────────────────────────────────────────

export interface MatrixCell {
  /** Whether this QA area is required for this content type */
  readonly required: boolean;
  /** Relative weight (1-10) for prioritization in the review flow */
  readonly weight: number;
  /** Optional note explaining why this area matters (or doesn't) for this type */
  readonly note?: string;
}

export interface ReviewMatrix {
  /** All content types covered by this matrix */
  readonly contentTypes: ContentTypeForQA[];
  /** All QA areas in the matrix */
  readonly qaAreas: QAArea[];
  /** Matrix data: contentType -> qaArea -> cell config */
  readonly matrix: Record<string, Record<string, MatrixCell>>;
}

// ── Helper: define a matrix row ─────────────────────────────────

type RowDef = Record<QAArea, MatrixCell>;

function row(cells: Record<QAArea, [boolean, number, string?]>): RowDef {
  const result: Partial<RowDef> = {};
  for (const [area, [required, weight, note]] of Object.entries(cells)) {
    result[area as QAArea] = { required, weight, note };
  }
  return result as RowDef;
}

// ── The Matrix ──────────────────────────────────────────────────

const ALL_AREAS: QAArea[] = [
  'visual', 'mascot', 'copy', 'voice', 'motion',
  'sound', 'bedtime', 'age-appropriate', 'accessibility', 'performance',
];

const ALL_CONTENT_TYPES: ContentTypeForQA[] = [
  'story', 'lesson', 'game', 'video', 'audio', 'quiz',
  'coloring', 'cooking', 'movement', 'explorer', 'emotion',
  'homeactivity', 'bedtime-content', 'parent-facing',
];

const matrixData: Record<string, RowDef> = {
  // ── Stories ───────────────────────────────────────────
  // Stories touch every dimension: visuals, mascot narration, text,
  // voice acting, page-turn animations, ambient sound, bedtime variants.
  story: row({
    visual:           [true,  9, 'Scene illustrations must match story mood and be age-appropriate'],
    mascot:           [true,  7, 'Narrator character should match the story personality'],
    copy:             [true,  10, 'Story text is the primary content -- tone, vocabulary, and grammar are critical'],
    voice:            [true,  9, 'TTS reading is core to the experience -- pacing and emotion matter'],
    motion:           [true,  7, 'Page transitions and interactive elements need reduced-motion fallbacks'],
    sound:            [true,  6, 'Ambient sounds enhance immersion but must not distract from narration'],
    bedtime:          [true,  8, 'Many stories are read at bedtime -- dark mode and calm variants required'],
    'age-appropriate': [true, 10, 'Vocabulary and complexity must match labeled age group precisely'],
    accessibility:    [true,  8, 'Contrast and reduced-motion are critical for reading content'],
    performance:      [true,  5, 'Scene backgrounds and illustrations must stay within size budgets'],
  }),

  // ── Lessons ───────────────────────────────────────────
  // Lessons are educational -- visual clarity, voice pronunciation, and
  // age-appropriate content are paramount.
  lesson: row({
    visual:           [true,  9, 'Educational visuals must be clear, uncluttered, with strong focal points'],
    mascot:           [true,  6, 'Mascot provides encouragement but should not distract from learning'],
    copy:             [true,  10, 'Instructions and labels must be crystal clear and age-appropriate'],
    voice:            [true,  9, 'Pronunciation of educational content (letters, numbers) is critical'],
    motion:           [true,  6, 'Entrance animations guide attention but should not overstimulate'],
    sound:            [false, 4, 'Sound effects are helpful but optional for pure learning content'],
    bedtime:          [false, 3, 'Lessons are typically daytime activities -- bedtime variant nice-to-have'],
    'age-appropriate': [true, 10, 'Difficulty and vocabulary must perfectly match the age/skill level'],
    accessibility:    [true,  8, 'Contrast is critical for reading educational text'],
    performance:      [true,  5, 'Fast loading is important for maintaining learning flow'],
  }),

  // ── Games ─────────────────────────────────────────────
  // Games are highly interactive -- motion, sound, and performance
  // are critical. Touch targets and responsiveness matter most.
  game: row({
    visual:           [true,  8, 'Game UI must be clear and intuitive with strong visual affordances'],
    mascot:           [true,  5, 'Mascot can celebrate wins but should not block gameplay'],
    copy:             [true,  7, 'Instructions must be concise and immediately understandable'],
    voice:            [false, 3, 'Voice is optional for games unless instructions are spoken'],
    motion:           [true,  9, 'Feedback animations are core to game feel -- must be responsive and GPU-composited'],
    sound:            [true,  9, 'Sound feedback is critical for game engagement -- correct/incorrect/completion sounds'],
    bedtime:          [false, 2, 'Games are typically not bedtime activities'],
    'age-appropriate': [true, 9, 'Touch target sizes and cognitive load must match age group'],
    accessibility:    [true,  7, 'Reduced-motion must not break gameplay logic'],
    performance:      [true,  9, 'Games must be smooth 60fps -- no janky animations during play'],
  }),

  // ── Videos ────────────────────────────────────────────
  // Videos are embedded content -- copy metadata and age ratings
  // are the main QA concerns.
  video: row({
    visual:           [true,  6, 'Video card thumbnails and player UI should match brand style'],
    mascot:           [false, 2, 'Mascot is not typically present during video playback'],
    copy:             [true,  9, 'Video title, description, and metadata must be age-appropriate'],
    voice:            [false, 1, 'Voice is in the video itself, not app-controlled'],
    motion:           [true,  4, 'Player controls and card animations need basic reduced-motion support'],
    sound:            [false, 3, 'Sound is part of the video content, not app-controlled UI sounds'],
    bedtime:          [true,  5, 'Video player should respect bedtime mode (dim UI, no autoplay)'],
    'age-appropriate': [true, 10, 'Video content ratings and descriptions must be verified for age group'],
    accessibility:    [true,  7, 'Video player controls need sufficient contrast and target sizes'],
    performance:      [true,  6, 'YouTube embed should not cause layout shift or slow page load'],
  }),

  // ── Audio ─────────────────────────────────────────────
  // Audio content relies on voice quality, pacing, and sound levels.
  audio: row({
    visual:           [true,  5, 'Audio player UI and cover art should be clear and on-brand'],
    mascot:           [true,  4, 'Character associated with the audio should appear on the player card'],
    copy:             [true,  7, 'Song/episode titles and descriptions need to be age-appropriate'],
    voice:            [true,  10, 'Audio quality, voice character, and pacing are the core experience'],
    motion:           [true,  4, 'Player animations (progress, waveform) should be subtle'],
    sound:            [true,  8, 'Audio levels must be consistent, not too loud, with gentle transitions'],
    bedtime:          [true,  7, 'Many audio items are lullabies/bedtime stories -- calm variants needed'],
    'age-appropriate': [true, 8, 'Content complexity and vocabulary must match age group'],
    accessibility:    [true,  5, 'Player controls need contrast and touch target compliance'],
    performance:      [true,  4, 'Audio files should be efficiently loaded/streamed'],
  }),

  // ── Quizzes ───────────────────────────────────────────
  // Quizzes need clear visuals, encouraging copy, and no shaming.
  quiz: row({
    visual:           [true,  8, 'Answer options must be visually distinct and clearly tappable'],
    mascot:           [true,  6, 'Mascot encouragement on correct/incorrect is important'],
    copy:             [true,  10, 'Questions must be unambiguous. Incorrect feedback must never shame.'],
    voice:            [true,  7, 'Reading questions aloud helps younger users'],
    motion:           [true,  7, 'Correct/incorrect animations provide essential feedback'],
    sound:            [true,  7, 'Correct/incorrect sounds must be encouraging, not punishing'],
    bedtime:          [false, 1, 'Quizzes are not bedtime activities'],
    'age-appropriate': [true, 10, 'Question difficulty must precisely match labeled age/skill level'],
    accessibility:    [true,  8, 'Answer options need sufficient contrast and touch targets'],
    performance:      [true,  4, 'Quick response to taps is essential for quiz flow'],
  }),

  // ── Coloring ──────────────────────────────────────────
  coloring: row({
    visual:           [true,  9, 'Line art quality and color palette presentation are critical'],
    mascot:           [false, 2, 'Mascot may appear briefly but coloring is a solo creative activity'],
    copy:             [true,  4, 'Minimal text needed -- tool labels should be clear'],
    voice:            [false, 1, 'Coloring is a quiet, self-directed activity'],
    motion:           [true,  5, 'Drawing response must be instant -- no animation lag on strokes'],
    sound:            [true,  4, 'Subtle drawing sounds are nice but optional'],
    bedtime:          [true,  6, 'Coloring can be calming -- bedtime palette variant is valuable'],
    'age-appropriate': [true, 7, 'Line art complexity and tool count must match age'],
    accessibility:    [true,  6, 'Color selection needs contrast, undo needs accessible controls'],
    performance:      [true,  9, 'Canvas rendering must be smooth -- critical for drawing experience'],
  }),

  // ── Cooking ───────────────────────────────────────────
  cooking: row({
    visual:           [true,  8, 'Recipe illustrations should be clear and appealing'],
    mascot:           [true,  5, 'Chef mascot guide adds personality but should not clutter steps'],
    copy:             [true,  9, 'Recipe instructions must be clear, safe, and age-appropriate'],
    voice:            [true,  6, 'Reading steps aloud helps in the kitchen with dirty hands'],
    motion:           [true,  4, 'Step transitions should be clear but not distracting'],
    sound:            [true,  3, 'Sound effects are minimal for cooking activities'],
    bedtime:          [false, 1, 'Cooking is not a bedtime activity'],
    'age-appropriate': [true, 10, 'Safety callouts required. No dangerous steps for younger ages.'],
    accessibility:    [true,  6, 'Steps need readable text and sufficient contrast for kitchen use'],
    performance:      [true,  3, 'Standard performance requirements'],
  }),

  // ── Movement ──────────────────────────────────────────
  movement: row({
    visual:           [true,  7, 'Movement poses/instructions must be visually clear at a distance'],
    mascot:           [true,  8, 'Dance leader character is central to the movement experience'],
    copy:             [true,  6, 'Instructions need to be short and actionable'],
    voice:            [true,  8, 'Voice instructions guide movement when kids cannot read screen'],
    motion:           [true,  9, 'Countdown timers and pose transitions must be smooth and visible'],
    sound:            [true,  10, 'Music and rhythm are core to movement activities'],
    bedtime:          [false, 1, 'Movement is energizing, not for bedtime'],
    'age-appropriate': [true, 8, 'Movement complexity must match physical development stage'],
    accessibility:    [true,  5, 'Visual cues should accompany audio for hearing-impaired users'],
    performance:      [true,  7, 'Timer animations must be perfectly smooth'],
  }),

  // ── Explorer ──────────────────────────────────────────
  explorer: row({
    visual:           [true,  9, 'Discovery scenes must be rich, inviting, and explorable'],
    mascot:           [true,  7, 'Explorer guide character (Finn) helps narrate discoveries'],
    copy:             [true,  8, 'Educational facts must be accurate and age-appropriate'],
    voice:            [true,  7, 'Narration of discoveries enhances the exploration experience'],
    motion:           [true,  6, 'Reveal animations should feel like genuine discovery moments'],
    sound:            [true,  5, 'Ambient environmental sounds add immersion'],
    bedtime:          [false, 3, 'Exploration is typically a daytime activity'],
    'age-appropriate': [true, 9, 'Fact complexity and vocabulary must match age group'],
    accessibility:    [true,  6, 'Interactive hotspots need visible focus indicators'],
    performance:      [true,  6, 'Scene assets may be larger -- lazy loading important'],
  }),

  // ── Emotions ──────────────────────────────────────────
  emotion: row({
    visual:           [true,  9, 'Emotion faces must be clear and universally recognizable'],
    mascot:           [true,  8, 'Characters modeling emotions helps children learn to identify them'],
    copy:             [true,  10, 'Emotion vocabulary must be precise, validating, never dismissive'],
    voice:            [true,  8, 'Spoken labels with appropriate emotional prosody help recognition'],
    motion:           [true,  5, 'Gentle animations that match the emotion being taught'],
    sound:            [true,  5, 'Tonal sounds that convey emotions subtly'],
    bedtime:          [true,  6, 'Calm emotion check-in can be part of bedtime routine'],
    'age-appropriate': [true, 10, 'Emotion complexity must match developmental stage'],
    accessibility:    [true,  7, 'Emotion colors need to be distinguishable for color-blind users'],
    performance:      [true,  3, 'Standard performance requirements'],
  }),

  // ── Home Activities ───────────────────────────────────
  homeactivity: row({
    visual:           [true,  7, 'Activity cards should look inviting and doable'],
    mascot:           [true,  4, 'Light mascot presence for encouragement'],
    copy:             [true,  9, 'Instructions need to be clear for both parent and child'],
    voice:            [true,  5, 'Voice reading helps but activities are parent-guided'],
    motion:           [true,  3, 'Minimal animation needed -- content is off-screen activity'],
    sound:            [true,  2, 'Minimal sound -- activity happens away from device'],
    bedtime:          [false, 1, 'Home activities are daytime activities'],
    'age-appropriate': [true, 10, 'Safety and developmental appropriateness are paramount'],
    accessibility:    [true,  5, 'Standard accessibility for the digital instructions'],
    performance:      [true,  2, 'Standard performance requirements'],
  }),

  // ── Bedtime Content ───────────────────────────────────
  // Bedtime content has strict requirements across bedtime, visual,
  // sound, and motion areas.
  'bedtime-content': row({
    visual:           [true,  9, 'Must use full bedtime color scheme -- no bright colors anywhere'],
    mascot:           [true,  8, 'Only Ollie (calm owl) should appear with sleepy expressions'],
    copy:             [true,  8, 'Soothing, calm language. Short sentences. Sleep-positive messaging.'],
    voice:            [true,  9, 'Slow, gentle narration. Ollie voice profile. 0.8x speed.'],
    motion:           [true,  9, 'Strictly gentle. No springs. No bouncing. 1.5x duration multiplier.'],
    sound:            [true,  9, 'Quiet, calming. No sudden sounds. Gentle chimes only. Auto-fade.'],
    bedtime:          [true,  10, 'This IS bedtime content -- all bedtime checks are critical.'],
    'age-appropriate': [true, 8, 'Content should be calming regardless of age group'],
    accessibility:    [true,  7, 'Dark backgrounds need sufficient contrast for sleepy eyes'],
    performance:      [true,  4, 'Standard performance -- avoid CPU wake-ups that drain battery'],
  }),

  // ── Parent-Facing ─────────────────────────────────────
  // Parent-facing screens have different visual requirements:
  // professional feel, data density, tabular numbers.
  'parent-facing': row({
    visual:           [true,  9, 'Must follow parentModeConfig: cool gray bg, shadow-sm, rounded-xl, semibold headings'],
    mascot:           [false, 0, 'No mascot characters in parent-facing screens'],
    copy:             [true,  9, 'Professional, informative tone. Data-focused. No baby talk.'],
    voice:            [false, 0, 'No TTS in parent-facing screens'],
    motion:           [true,  5, 'Subtle entrance animations only. 200ms transitions. No bouncing.'],
    sound:            [false, 0, 'No sound effects in parent-facing screens'],
    bedtime:          [false, 0, 'Parent screens do not have bedtime variants'],
    'age-appropriate': [false, 0, 'Parent screens are for adults'],
    accessibility:    [true,  8, 'Standard WCAG compliance for adult interfaces'],
    performance:      [true,  6, 'Dashboard data queries and charts should be efficient'],
  }),
};

// ── Exported Matrix ─────────────────────────────────────────────

export const reviewMatrix: ReviewMatrix = {
  contentTypes: ALL_CONTENT_TYPES,
  qaAreas: ALL_AREAS,
  matrix: matrixData,
};

// ── Helper Functions ────────────────────────────────────────────

/**
 * Get all required QA areas for a content type.
 */
export function getRequiredAreas(contentType: ContentTypeForQA): QAArea[] {
  const row = matrixData[contentType];
  if (!row) return [];
  return ALL_AREAS.filter((area) => row[area]?.required);
}

/**
 * Get all optional (but recommended) QA areas for a content type.
 */
export function getOptionalAreas(contentType: ContentTypeForQA): QAArea[] {
  const row = matrixData[contentType];
  if (!row) return [];
  return ALL_AREAS.filter((area) => row[area] && !row[area].required && row[area].weight > 0);
}

/**
 * Get the weight for a specific content type + area combination.
 * Returns 0 if not applicable.
 */
export function getWeight(contentType: ContentTypeForQA, area: QAArea): number {
  return matrixData[contentType]?.[area]?.weight ?? 0;
}

/**
 * Check if a specific area is required for a content type.
 */
export function isAreaRequired(contentType: ContentTypeForQA, area: QAArea): boolean {
  return matrixData[contentType]?.[area]?.required ?? false;
}

/**
 * Get a note explaining why a QA area matters for a content type.
 */
export function getAreaNote(contentType: ContentTypeForQA, area: QAArea): string | undefined {
  return matrixData[contentType]?.[area]?.note;
}

/**
 * Get the top N most important QA areas for a content type, sorted by weight.
 */
export function getTopAreas(contentType: ContentTypeForQA, n: number = 5): QAArea[] {
  const row = matrixData[contentType];
  if (!row) return [];
  return ALL_AREAS
    .filter((area) => row[area]?.weight > 0)
    .sort((a, b) => (row[b]?.weight ?? 0) - (row[a]?.weight ?? 0))
    .slice(0, n);
}

/**
 * Calculate a maximum possible score for a content type based on weights.
 * Useful for displaying review completeness as a percentage.
 */
export function getMaxScore(contentType: ContentTypeForQA): number {
  const row = matrixData[contentType];
  if (!row) return 0;
  return ALL_AREAS.reduce((sum, area) => sum + (row[area]?.weight ?? 0), 0);
}

/**
 * Calculate the actual score for a review based on passed checks and weights.
 */
export function calculateScore(
  contentType: ContentTypeForQA,
  passedAreas: QAArea[],
): { score: number; maxScore: number; percentage: number } {
  const row = matrixData[contentType];
  if (!row) return { score: 0, maxScore: 0, percentage: 0 };

  const maxScore = getMaxScore(contentType);
  const score = passedAreas.reduce((sum, area) => sum + (row[area]?.weight ?? 0), 0);
  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

  return { score, maxScore, percentage };
}
