// =============================================================================
// Expression Library - 10 warm, age-appropriate facial expressions for mascots
// =============================================================================

/** All available expression identifiers */
export type ExpressionId =
  | 'happy'
  | 'proud'
  | 'curious'
  | 'surprised'
  | 'sleepy'
  | 'calm'
  | 'encouraging'
  | 'thinking'
  | 'celebrating'
  | 'empathetic';

/** Configuration for a single facial expression */
export interface Expression {
  id: ExpressionId;
  label: string;
  /** Eye rendering configuration */
  eyes: {
    shape: 'round' | 'arc-happy' | 'wide' | 'half-closed' | 'closed' | 'sparkle';
    scale: number;
    offsetY: number;
    animation?: 'none' | 'widen' | 'soften' | 'sparkle-pulse';
  };
  /** Mouth rendering configuration */
  mouth: {
    shape: 'smile' | 'grin' | 'open-smile' | 'small-o' | 'gentle' | 'flat' | 'wavy';
    scale: number;
    /** -1 (full frown) to 1 (full smile) */
    curve: number;
  };
  /** Eyebrow configuration */
  brows: {
    /** Degrees of rotation (-30 to 30) */
    angle: number;
    /** Vertical offset in SVG units */
    offsetY: number;
  };
  /** Blush cheek configuration */
  cheeks: {
    visible: boolean;
    color: string;
    opacity: number;
  };
  /** Optional decorative extras around the face */
  extras?: { type: string; emoji?: string }[];
}

// ---------------------------------------------------------------------------
// Expression definitions
// ---------------------------------------------------------------------------

export const expressions: Record<ExpressionId, Expression> = {
  happy: {
    id: 'happy',
    label: 'Happy',
    eyes: { shape: 'arc-happy', scale: 1.0, offsetY: 0 },
    mouth: { shape: 'smile', scale: 1.0, curve: 0.85 },
    brows: { angle: 0, offsetY: 0 },
    cheeks: { visible: true, color: '#FFB6C1', opacity: 0.5 },
  },

  proud: {
    id: 'proud',
    label: 'Proud',
    eyes: { shape: 'arc-happy', scale: 1.05, offsetY: -1, animation: 'soften' },
    mouth: { shape: 'grin', scale: 1.1, curve: 0.95 },
    brows: { angle: -3, offsetY: -2 },
    cheeks: { visible: true, color: '#FFD700', opacity: 0.45 },
    extras: [{ type: 'sparkle' }],
  },

  curious: {
    id: 'curious',
    label: 'Curious',
    eyes: { shape: 'wide', scale: 1.15, offsetY: -1, animation: 'widen' },
    mouth: { shape: 'small-o', scale: 0.85, curve: 0.1 },
    brows: { angle: 8, offsetY: -3 },
    cheeks: { visible: false, color: '#FFB6C1', opacity: 0 },
    extras: [{ type: 'question-mark', emoji: '?' }],
  },

  surprised: {
    id: 'surprised',
    label: 'Surprised',
    eyes: { shape: 'wide', scale: 1.3, offsetY: -2, animation: 'widen' },
    mouth: { shape: 'small-o', scale: 1.2, curve: 0.0 },
    brows: { angle: 12, offsetY: -5 },
    cheeks: { visible: true, color: '#FFB6C1', opacity: 0.6 },
    extras: [{ type: 'exclamation', emoji: '!' }],
  },

  sleepy: {
    id: 'sleepy',
    label: 'Sleepy',
    eyes: { shape: 'half-closed', scale: 0.9, offsetY: 2 },
    mouth: { shape: 'gentle', scale: 0.85, curve: 0.3 },
    brows: { angle: -5, offsetY: 2 },
    cheeks: { visible: true, color: '#DDA0DD', opacity: 0.35 },
    extras: [{ type: 'zzz', emoji: 'z' }],
  },

  calm: {
    id: 'calm',
    label: 'Calm',
    eyes: { shape: 'half-closed', scale: 0.95, offsetY: 1, animation: 'soften' },
    mouth: { shape: 'gentle', scale: 0.9, curve: 0.5 },
    brows: { angle: -2, offsetY: 1 },
    cheeks: { visible: true, color: '#B0E0E6', opacity: 0.3 },
  },

  encouraging: {
    id: 'encouraging',
    label: 'Encouraging',
    eyes: { shape: 'sparkle', scale: 1.1, offsetY: -1, animation: 'sparkle-pulse' },
    mouth: { shape: 'grin', scale: 1.05, curve: 0.9 },
    brows: { angle: -5, offsetY: -2 },
    cheeks: { visible: true, color: '#FFB6C1', opacity: 0.45 },
    extras: [{ type: 'sparkle' }],
  },

  thinking: {
    id: 'thinking',
    label: 'Thinking',
    eyes: { shape: 'round', scale: 1.0, offsetY: -2 },
    mouth: { shape: 'flat', scale: 0.8, curve: 0.15 },
    brows: { angle: 10, offsetY: -3 },
    cheeks: { visible: false, color: '#FFB6C1', opacity: 0 },
    extras: [{ type: 'thought-bubble', emoji: '...' }],
  },

  celebrating: {
    id: 'celebrating',
    label: 'Celebrating',
    eyes: { shape: 'sparkle', scale: 1.2, offsetY: -2, animation: 'sparkle-pulse' },
    mouth: { shape: 'open-smile', scale: 1.2, curve: 1.0 },
    brows: { angle: -8, offsetY: -4 },
    cheeks: { visible: true, color: '#FFD700', opacity: 0.6 },
    extras: [
      { type: 'confetti' },
      { type: 'star', emoji: '*' },
    ],
  },

  empathetic: {
    id: 'empathetic',
    label: 'Empathetic',
    eyes: { shape: 'round', scale: 1.05, offsetY: 0, animation: 'soften' },
    mouth: { shape: 'gentle', scale: 0.95, curve: 0.4 },
    brows: { angle: -8, offsetY: -1 },
    cheeks: { visible: true, color: '#FFB6C1', opacity: 0.35 },
    extras: [{ type: 'heart', emoji: '\u2764' }],
  },
};

/** Retrieve a single expression by ID, falling back to 'happy' */
export function getExpression(id: ExpressionId): Expression {
  return expressions[id] ?? expressions.happy;
}

/** All expression IDs as an ordered array */
export const allExpressionIds: ExpressionId[] = Object.keys(expressions) as ExpressionId[];
