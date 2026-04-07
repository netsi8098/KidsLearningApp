// =============================================================================
// Lip-Sync Preparation System - Mouth shapes & timeline generation
// =============================================================================

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** The 6 canonical mouth shapes */
export type MouthShape = 'closed' | 'open-small' | 'open-wide' | 'smile' | 'oh' | 'ee';

/** A single keyframe in a lip-sync timeline */
export interface LipSyncKeyframe {
  /** Time in ms from start */
  time: number;
  /** Which mouth shape to show */
  mouthShape: MouthShape;
  /** How long this shape holds in ms */
  duration: number;
}

/** A complete lip-sync timeline for an utterance */
export type LipSyncTimeline = LipSyncKeyframe[];

// ---------------------------------------------------------------------------
// Phoneme-to-mouth mapping (simplified English)
// ---------------------------------------------------------------------------

/** Map of lowercase characters/phoneme hints to mouth shapes */
const charToMouth: Record<string, MouthShape> = {
  // Open vowels
  a: 'open-wide',
  // Mid vowels
  e: 'ee',
  i: 'ee',
  // Rounded vowels
  o: 'oh',
  u: 'oh',
  // Bilabials (lips together)
  b: 'closed',
  m: 'closed',
  p: 'closed',
  // Labiodentals
  f: 'ee',
  v: 'ee',
  // Dental/alveolar
  t: 'open-small',
  d: 'open-small',
  n: 'open-small',
  l: 'open-small',
  s: 'ee',
  z: 'ee',
  // Velar
  k: 'open-small',
  g: 'open-small',
  // Glottal
  h: 'open-small',
  // Affricates / others
  r: 'open-small',
  w: 'oh',
  y: 'ee',
  j: 'ee',
  // Th sounds
  x: 'open-small',
  q: 'oh',
  c: 'open-small',
};

/** Determine mouth shape for a single character */
function getMouthForChar(char: string): MouthShape {
  const lower = char.toLowerCase();
  if (lower === ' ' || lower === '.' || lower === ',' || lower === '!' || lower === '?') {
    return 'closed';
  }
  return charToMouth[lower] ?? 'open-small';
}

// ---------------------------------------------------------------------------
// Timeline generation
// ---------------------------------------------------------------------------

/**
 * Generate an approximate lip-sync timeline from text.
 *
 * This maps each character to a mouth shape and distributes them evenly
 * across the given duration. Adjacent identical shapes are merged.
 * Punctuation and spaces create natural "closed" pauses.
 *
 * @param text - The text being spoken
 * @param durationMs - Total duration of the speech in milliseconds
 * @returns A lip-sync timeline array
 */
export function generateSimpleLipSync(text: string, durationMs: number): LipSyncTimeline {
  if (!text || durationMs <= 0) {
    return [{ time: 0, mouthShape: 'closed', duration: durationMs || 100 }];
  }

  const chars = text.split('');
  const charDuration = durationMs / chars.length;

  // Map each char to a shape
  const rawShapes: { shape: MouthShape; charIndex: number }[] = chars.map((ch, i) => ({
    shape: getMouthForChar(ch),
    charIndex: i,
  }));

  // Merge consecutive identical shapes
  const timeline: LipSyncTimeline = [];
  let currentShape = rawShapes[0].shape;
  let startIndex = 0;

  for (let i = 1; i <= rawShapes.length; i++) {
    const nextShape = i < rawShapes.length ? rawShapes[i].shape : null;
    if (nextShape !== currentShape || i === rawShapes.length) {
      const time = Math.round(startIndex * charDuration);
      const duration = Math.round((i - startIndex) * charDuration);
      timeline.push({ time, mouthShape: currentShape, duration });

      if (nextShape !== null) {
        currentShape = nextShape;
        startIndex = i;
      }
    }
  }

  // Always end with closed mouth
  const lastFrame = timeline[timeline.length - 1];
  if (lastFrame && lastFrame.mouthShape !== 'closed') {
    const endTime = lastFrame.time + lastFrame.duration;
    if (endTime < durationMs) {
      timeline.push({ time: endTime, mouthShape: 'closed', duration: durationMs - endTime });
    }
  }

  return timeline;
}

// ---------------------------------------------------------------------------
// Fallback animation
// ---------------------------------------------------------------------------

/**
 * Generate a simple oscillating timeline for when no text is available.
 * Alternates between closed and open-small at a natural speaking cadence.
 *
 * @param durationMs - Total duration in milliseconds
 * @param tempo - Oscillations per second (default 4, range 2-8)
 * @returns A lip-sync timeline
 */
export function generateFallbackLipSync(durationMs: number, tempo = 4): LipSyncTimeline {
  const cycleDuration = 1000 / tempo;
  const halfCycle = cycleDuration / 2;
  const timeline: LipSyncTimeline = [];
  let time = 0;
  let isOpen = false;

  while (time < durationMs) {
    const remaining = durationMs - time;
    const duration = Math.min(halfCycle, remaining);
    timeline.push({
      time: Math.round(time),
      mouthShape: isOpen ? 'open-small' : 'closed',
      duration: Math.round(duration),
    });
    time += halfCycle;
    isOpen = !isOpen;
  }

  return timeline;
}

// ---------------------------------------------------------------------------
// Timeline utilities
// ---------------------------------------------------------------------------

/**
 * Get the mouth shape at a specific point in time.
 *
 * @param timeline - The lip-sync timeline
 * @param timeMs - Current time in ms
 * @returns The mouth shape to display
 */
export function getMouthShapeAtTime(timeline: LipSyncTimeline, timeMs: number): MouthShape {
  if (timeline.length === 0) return 'closed';

  // Find the active keyframe
  for (let i = timeline.length - 1; i >= 0; i--) {
    const frame = timeline[i];
    if (timeMs >= frame.time && timeMs < frame.time + frame.duration) {
      return frame.mouthShape;
    }
  }

  // Past the end or before the start
  return 'closed';
}

// ---------------------------------------------------------------------------
// SVG mouth shape definitions
// ---------------------------------------------------------------------------

/**
 * SVG path data for each mouth shape.
 * Origin is center of the mouth area. Designed for a ~20x12 viewBox.
 */
export const mouthShapePaths: Record<MouthShape, string> = {
  closed:
    'M -8 0 Q -4 2 0 2 Q 4 2 8 0',
  'open-small':
    'M -7 -1 Q -3 -3 0 -3 Q 3 -3 7 -1 Q 4 4 0 5 Q -4 4 -7 -1 Z',
  'open-wide':
    'M -8 -3 Q -4 -6 0 -6 Q 4 -6 8 -3 Q 5 7 0 8 Q -5 7 -8 -3 Z',
  smile:
    'M -8 -1 Q -4 0 0 0 Q 4 0 8 -1 Q 5 5 0 6 Q -5 5 -8 -1 Z',
  oh:
    'M -5 -4 Q -2 -6 0 -6 Q 2 -6 5 -4 Q 6 -1 5 3 Q 2 6 0 6 Q -2 6 -5 3 Q -6 -1 -5 -4 Z',
  ee:
    'M -8 -1 Q -4 -2 0 -2 Q 4 -2 8 -1 Q 5 2 0 3 Q -5 2 -8 -1 Z',
};

/**
 * Get SVG path for a mouth shape with optional smile curve influence.
 * For simple use, just index mouthShapePaths directly.
 */
export function getMouthPath(shape: MouthShape): string {
  return mouthShapePaths[shape];
}
