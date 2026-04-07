// =============================================================================
// MascotFace - SVG face rendering sub-component
// =============================================================================

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Expression, ExpressionId } from './expressions.ts';
import { getExpression } from './expressions.ts';
import {
  EXPRESSION_SPRING,
  blinkVariants,
  getBlinkInterval,
  BLINK_DURATION_MS,
  sparklePulseVariants,
  speakingMouthVariants,
} from './animations.ts';
import { mouthShapePaths } from './lipSync.ts';
import type { MouthShape } from './lipSync.ts';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface MascotFaceProps {
  /** Current expression to display */
  expression: ExpressionId;
  /** Character theme color (used for cheek tinting) */
  themeColor: string;
  /** Whether the character is speaking */
  speaking?: boolean;
  /** Current lip-sync mouth shape (overrides expression mouth when speaking) */
  currentMouthShape?: MouthShape;
  /** Enable idle blinking */
  enableBlink?: boolean;
  /** Reduced motion mode - disable animations */
  reducedMotion?: boolean;
  /** Size multiplier (1.0 = default 80x80 viewBox) */
  sizeScale?: number;
}

// ---------------------------------------------------------------------------
// Face viewBox: 80x80, center at (40, 40)
// ---------------------------------------------------------------------------

const VB_SIZE = 80;
const CENTER_X = VB_SIZE / 2;
const CENTER_Y = VB_SIZE / 2;

// Eye positions relative to center
const LEFT_EYE_X = CENTER_X - 12;
const RIGHT_EYE_X = CENTER_X + 12;
const EYE_Y = CENTER_Y - 6;

// Mouth position
const MOUTH_Y = CENTER_Y + 10;

// Brow positions
const LEFT_BROW_X = LEFT_EYE_X;
const RIGHT_BROW_X = RIGHT_EYE_X;
const BROW_Y = EYE_Y - 10;

// Cheek positions
const LEFT_CHEEK_X = CENTER_X - 20;
const RIGHT_CHEEK_X = CENTER_X + 20;
const CHEEK_Y = CENTER_Y + 4;

// ---------------------------------------------------------------------------
// Eye shapes
// ---------------------------------------------------------------------------

function renderEye(
  expression: Expression,
  cx: number,
  cy: number,
  reducedMotion: boolean,
): React.ReactNode {
  const { eyes } = expression;
  const adjustedCy = cy + eyes.offsetY;
  const r = 5 * eyes.scale;

  switch (eyes.shape) {
    case 'round':
      return (
        <motion.circle
          cx={cx}
          cy={adjustedCy}
          r={r}
          fill="#3D3D3D"
          initial={false}
          animate={{ r, cy: adjustedCy }}
          transition={reducedMotion ? { duration: 0 } : EXPRESSION_SPRING}
        />
      );

    case 'arc-happy':
      // Happy closed-eye arcs (upside-down U)
      return (
        <motion.path
          d={`M ${cx - r} ${adjustedCy} Q ${cx} ${adjustedCy - r * 1.5} ${cx + r} ${adjustedCy}`}
          fill="none"
          stroke="#3D3D3D"
          strokeWidth={2.2}
          strokeLinecap="round"
          initial={false}
          animate={{ d: `M ${cx - r} ${adjustedCy} Q ${cx} ${adjustedCy - r * 1.5} ${cx + r} ${adjustedCy}` }}
          transition={reducedMotion ? { duration: 0 } : EXPRESSION_SPRING}
        />
      );

    case 'wide':
      // Larger, rounder eyes for surprise/curiosity
      return (
        <motion.g
          initial={false}
          animate={{ scale: 1 }}
          transition={reducedMotion ? { duration: 0 } : EXPRESSION_SPRING}
        >
          <circle cx={cx} cy={adjustedCy} r={r * 1.1} fill="white" stroke="#3D3D3D" strokeWidth={1.5} />
          <circle cx={cx} cy={adjustedCy} r={r * 0.65} fill="#3D3D3D" />
          {/* Highlight */}
          <circle cx={cx + r * 0.25} cy={adjustedCy - r * 0.25} r={r * 0.2} fill="white" opacity={0.8} />
        </motion.g>
      );

    case 'half-closed':
      // Droopy/sleepy lids
      return (
        <motion.g
          initial={false}
          animate={{ opacity: 1 }}
          transition={reducedMotion ? { duration: 0 } : EXPRESSION_SPRING}
        >
          <circle cx={cx} cy={adjustedCy} r={r * 0.9} fill="#3D3D3D" />
          {/* Upper eyelid covering top half */}
          <motion.rect
            x={cx - r * 1.2}
            y={adjustedCy - r * 1.4}
            width={r * 2.4}
            height={r * 1.1}
            rx={r * 0.4}
            fill="currentColor"
            opacity={0.15}
            initial={false}
            animate={{ height: r * 1.1 }}
            transition={reducedMotion ? { duration: 0 } : EXPRESSION_SPRING}
          />
        </motion.g>
      );

    case 'closed':
      // Fully closed (horizontal line)
      return (
        <motion.line
          x1={cx - r}
          y1={adjustedCy}
          x2={cx + r}
          y2={adjustedCy}
          stroke="#3D3D3D"
          strokeWidth={2}
          strokeLinecap="round"
          initial={false}
          animate={{ y1: adjustedCy, y2: adjustedCy }}
          transition={reducedMotion ? { duration: 0 } : EXPRESSION_SPRING}
        />
      );

    case 'sparkle':
      // Star-shaped sparkle eyes
      return (
        <motion.g
          variants={reducedMotion ? undefined : sparklePulseVariants}
          animate={reducedMotion ? 'still' : 'sparkling'}
        >
          <circle cx={cx} cy={adjustedCy} r={r * 0.9} fill="#3D3D3D" />
          {/* 4-point star highlight */}
          <path
            d={`M ${cx} ${adjustedCy - r * 0.6} L ${cx + r * 0.15} ${adjustedCy - r * 0.15} L ${cx + r * 0.6} ${adjustedCy} L ${cx + r * 0.15} ${adjustedCy + r * 0.15} L ${cx} ${adjustedCy + r * 0.6} L ${cx - r * 0.15} ${adjustedCy + r * 0.15} L ${cx - r * 0.6} ${adjustedCy} L ${cx - r * 0.15} ${adjustedCy - r * 0.15} Z`}
            fill="white"
            opacity={0.85}
          />
        </motion.g>
      );

    default:
      return <circle cx={cx} cy={adjustedCy} r={r} fill="#3D3D3D" />;
  }
}

// ---------------------------------------------------------------------------
// Mouth rendering
// ---------------------------------------------------------------------------

function renderMouth(
  expression: Expression,
  speaking: boolean,
  currentMouthShape: MouthShape | undefined,
  reducedMotion: boolean,
): React.ReactNode {
  // If speaking with a lip-sync shape, use the SVG path
  if (speaking && currentMouthShape) {
    const path = mouthShapePaths[currentMouthShape];
    return (
      <motion.path
        d={path}
        fill={currentMouthShape === 'closed' ? 'none' : '#3D3D3D'}
        stroke="#3D3D3D"
        strokeWidth={currentMouthShape === 'closed' ? 1.8 : 0.5}
        strokeLinecap="round"
        transform={`translate(${CENTER_X}, ${MOUTH_Y}) scale(${expression.mouth.scale})`}
        initial={false}
        animate={{ d: path }}
        transition={reducedMotion ? { duration: 0 } : { duration: 0.08, ease: 'easeOut' }}
      />
    );
  }

  // Speaking without lip-sync: oscillating mouth
  if (speaking && !currentMouthShape) {
    return (
      <motion.ellipse
        cx={CENTER_X}
        cy={MOUTH_Y}
        rx={6 * expression.mouth.scale}
        ry={4 * expression.mouth.scale}
        fill="#3D3D3D"
        variants={reducedMotion ? undefined : speakingMouthVariants}
        animate={reducedMotion ? 'silent' : 'speaking'}
      />
    );
  }

  // Static mouth from expression
  const { mouth } = expression;
  const hw = 8 * mouth.scale; // half-width
  const curveAmt = mouth.curve * 6; // vertical curve offset

  switch (mouth.shape) {
    case 'smile':
      return (
        <motion.path
          d={`M ${CENTER_X - hw} ${MOUTH_Y} Q ${CENTER_X} ${MOUTH_Y + curveAmt} ${CENTER_X + hw} ${MOUTH_Y}`}
          fill="none"
          stroke="#3D3D3D"
          strokeWidth={2}
          strokeLinecap="round"
          initial={false}
          animate={{ d: `M ${CENTER_X - hw} ${MOUTH_Y} Q ${CENTER_X} ${MOUTH_Y + curveAmt} ${CENTER_X + hw} ${MOUTH_Y}` }}
          transition={reducedMotion ? { duration: 0 } : EXPRESSION_SPRING}
        />
      );

    case 'grin':
      // Wide smile with slight teeth hint
      return (
        <motion.g initial={false} animate={{ opacity: 1 }} transition={reducedMotion ? { duration: 0 } : EXPRESSION_SPRING}>
          <path
            d={`M ${CENTER_X - hw} ${MOUTH_Y - 1} Q ${CENTER_X} ${MOUTH_Y + curveAmt + 2} ${CENTER_X + hw} ${MOUTH_Y - 1}`}
            fill="#3D3D3D"
            opacity={0.9}
          />
          {/* Teeth line */}
          <line
            x1={CENTER_X - hw * 0.6}
            y1={MOUTH_Y + 1}
            x2={CENTER_X + hw * 0.6}
            y2={MOUTH_Y + 1}
            stroke="white"
            strokeWidth={1}
          />
        </motion.g>
      );

    case 'open-smile':
      // Big open mouth smile (for celebrating)
      return (
        <motion.g initial={false} animate={{ opacity: 1 }} transition={reducedMotion ? { duration: 0 } : EXPRESSION_SPRING}>
          <ellipse cx={CENTER_X} cy={MOUTH_Y + 1} rx={hw * 0.85} ry={hw * 0.6} fill="#3D3D3D" />
          {/* Tongue hint */}
          <ellipse cx={CENTER_X} cy={MOUTH_Y + 3} rx={hw * 0.45} ry={hw * 0.25} fill="#FF8A80" opacity={0.7} />
        </motion.g>
      );

    case 'small-o':
      return (
        <motion.ellipse
          cx={CENTER_X}
          cy={MOUTH_Y}
          rx={3.5 * mouth.scale}
          ry={4.5 * mouth.scale}
          fill="#3D3D3D"
          initial={false}
          animate={{ rx: 3.5 * mouth.scale, ry: 4.5 * mouth.scale }}
          transition={reducedMotion ? { duration: 0 } : EXPRESSION_SPRING}
        />
      );

    case 'gentle':
      // Soft, slight smile
      return (
        <motion.path
          d={`M ${CENTER_X - hw * 0.7} ${MOUTH_Y} Q ${CENTER_X} ${MOUTH_Y + curveAmt * 0.7} ${CENTER_X + hw * 0.7} ${MOUTH_Y}`}
          fill="none"
          stroke="#3D3D3D"
          strokeWidth={1.8}
          strokeLinecap="round"
          initial={false}
          animate={{ d: `M ${CENTER_X - hw * 0.7} ${MOUTH_Y} Q ${CENTER_X} ${MOUTH_Y + curveAmt * 0.7} ${CENTER_X + hw * 0.7} ${MOUTH_Y}` }}
          transition={reducedMotion ? { duration: 0 } : EXPRESSION_SPRING}
        />
      );

    case 'flat':
      // Neutral/thinking line
      return (
        <motion.line
          x1={CENTER_X - hw * 0.6}
          y1={MOUTH_Y}
          x2={CENTER_X + hw * 0.6}
          y2={MOUTH_Y + 0.5}
          stroke="#3D3D3D"
          strokeWidth={1.8}
          strokeLinecap="round"
          initial={false}
          animate={{
            x2: CENTER_X + hw * 0.6,
            y2: MOUTH_Y + 0.5,
          }}
          transition={reducedMotion ? { duration: 0 } : EXPRESSION_SPRING}
        />
      );

    case 'wavy':
      // Wobbly/uncertain mouth
      return (
        <motion.path
          d={`M ${CENTER_X - hw * 0.7} ${MOUTH_Y} Q ${CENTER_X - hw * 0.3} ${MOUTH_Y - 2} ${CENTER_X} ${MOUTH_Y + 1} Q ${CENTER_X + hw * 0.3} ${MOUTH_Y + 3} ${CENTER_X + hw * 0.7} ${MOUTH_Y}`}
          fill="none"
          stroke="#3D3D3D"
          strokeWidth={1.8}
          strokeLinecap="round"
          initial={false}
          animate={{ opacity: 1 }}
          transition={reducedMotion ? { duration: 0 } : EXPRESSION_SPRING}
        />
      );

    default:
      return (
        <path
          d={`M ${CENTER_X - hw} ${MOUTH_Y} Q ${CENTER_X} ${MOUTH_Y + curveAmt} ${CENTER_X + hw} ${MOUTH_Y}`}
          fill="none"
          stroke="#3D3D3D"
          strokeWidth={2}
          strokeLinecap="round"
        />
      );
  }
}

// ---------------------------------------------------------------------------
// Brow rendering
// ---------------------------------------------------------------------------

function renderBrows(
  expression: Expression,
  reducedMotion: boolean,
): React.ReactNode {
  const { brows } = expression;
  const browLength = 7;

  return (
    <motion.g
      initial={false}
      animate={{ y: brows.offsetY }}
      transition={reducedMotion ? { duration: 0 } : EXPRESSION_SPRING}
    >
      {/* Left brow */}
      <motion.line
        x1={LEFT_BROW_X - browLength / 2}
        y1={BROW_Y}
        x2={LEFT_BROW_X + browLength / 2}
        y2={BROW_Y}
        stroke="#3D3D3D"
        strokeWidth={2}
        strokeLinecap="round"
        initial={false}
        animate={{ rotate: -brows.angle }}
        style={{ transformOrigin: `${LEFT_BROW_X}px ${BROW_Y}px` }}
        transition={reducedMotion ? { duration: 0 } : EXPRESSION_SPRING}
      />
      {/* Right brow */}
      <motion.line
        x1={RIGHT_BROW_X - browLength / 2}
        y1={BROW_Y}
        x2={RIGHT_BROW_X + browLength / 2}
        y2={BROW_Y}
        stroke="#3D3D3D"
        strokeWidth={2}
        strokeLinecap="round"
        initial={false}
        animate={{ rotate: brows.angle }}
        style={{ transformOrigin: `${RIGHT_BROW_X}px ${BROW_Y}px` }}
        transition={reducedMotion ? { duration: 0 } : EXPRESSION_SPRING}
      />
    </motion.g>
  );
}

// ---------------------------------------------------------------------------
// Cheek rendering
// ---------------------------------------------------------------------------

function renderCheeks(
  expression: Expression,
  themeColor: string,
  reducedMotion: boolean,
): React.ReactNode {
  const { cheeks } = expression;
  if (!cheeks.visible) return null;

  // Blend the expression cheek color with the theme color
  const cheekColor = cheeks.color || themeColor;

  return (
    <motion.g
      initial={false}
      animate={{ opacity: cheeks.opacity }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.4 }}
    >
      <circle cx={LEFT_CHEEK_X} cy={CHEEK_Y} r={4.5} fill={cheekColor} opacity={cheeks.opacity} />
      <circle cx={RIGHT_CHEEK_X} cy={CHEEK_Y} r={4.5} fill={cheekColor} opacity={cheeks.opacity} />
    </motion.g>
  );
}

// ---------------------------------------------------------------------------
// Extras rendering (sparkles, hearts, thought bubbles, etc.)
// ---------------------------------------------------------------------------

function renderExtras(
  expression: Expression,
  reducedMotion: boolean,
): React.ReactNode {
  if (!expression.extras || expression.extras.length === 0) return null;

  return (
    <g>
      {expression.extras.map((extra, i) => {
        switch (extra.type) {
          case 'sparkle':
            return (
              <motion.g
                key={`extra-${i}`}
                variants={reducedMotion ? undefined : sparklePulseVariants}
                animate={reducedMotion ? 'still' : 'sparkling'}
              >
                {/* Top-right sparkle */}
                <circle cx={CENTER_X + 22} cy={CENTER_Y - 18} r={1.5} fill="#FFD700" />
                <circle cx={CENTER_X + 18} cy={CENTER_Y - 22} r={1} fill="#FFD700" />
                <circle cx={CENTER_X - 20} cy={CENTER_Y - 16} r={1.2} fill="#FFD700" />
              </motion.g>
            );

          case 'heart':
            return (
              <motion.text
                key={`extra-${i}`}
                x={CENTER_X + 24}
                y={CENTER_Y - 14}
                fontSize={8}
                initial={false}
                animate={reducedMotion ? {} : { y: [CENTER_Y - 14, CENTER_Y - 18, CENTER_Y - 14], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                {'\u2764'}
              </motion.text>
            );

          case 'zzz':
            return (
              <motion.g key={`extra-${i}`}>
                <motion.text
                  x={CENTER_X + 18}
                  y={CENTER_Y - 18}
                  fontSize={7}
                  fill="#A78BFA"
                  fontWeight="bold"
                  initial={false}
                  animate={reducedMotion ? {} : { y: [CENTER_Y - 18, CENTER_Y - 24], opacity: [1, 0.3] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
                >
                  z
                </motion.text>
                <motion.text
                  x={CENTER_X + 24}
                  y={CENTER_Y - 24}
                  fontSize={5.5}
                  fill="#A78BFA"
                  fontWeight="bold"
                  initial={false}
                  animate={reducedMotion ? {} : { y: [CENTER_Y - 24, CENTER_Y - 30], opacity: [0.8, 0.1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeOut', delay: 0.5 }}
                >
                  z
                </motion.text>
              </motion.g>
            );

          case 'question-mark':
            return (
              <motion.text
                key={`extra-${i}`}
                x={CENTER_X + 22}
                y={CENTER_Y - 16}
                fontSize={10}
                fill="#A78BFA"
                fontWeight="bold"
                initial={false}
                animate={reducedMotion ? {} : { rotate: [-5, 5, -5] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                style={{ transformOrigin: `${CENTER_X + 22}px ${CENTER_Y - 16}px` }}
              >
                ?
              </motion.text>
            );

          case 'exclamation':
            return (
              <motion.text
                key={`extra-${i}`}
                x={CENTER_X + 22}
                y={CENTER_Y - 16}
                fontSize={10}
                fill="#FF6B6B"
                fontWeight="bold"
                initial={false}
                animate={reducedMotion ? {} : { scale: [1, 1.3, 1] }}
                transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
                style={{ transformOrigin: `${CENTER_X + 22}px ${CENTER_Y - 16}px` }}
              >
                !
              </motion.text>
            );

          case 'thought-bubble':
            return (
              <motion.g
                key={`extra-${i}`}
                initial={false}
                animate={reducedMotion ? {} : { opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <circle cx={CENTER_X + 20} cy={CENTER_Y - 14} r={2} fill="#D1D5DB" />
                <circle cx={CENTER_X + 24} cy={CENTER_Y - 20} r={3} fill="#D1D5DB" />
                <circle cx={CENTER_X + 22} cy={CENTER_Y - 27} r={5} fill="#E5E7EB" stroke="#D1D5DB" strokeWidth={0.8} />
                <text x={CENTER_X + 19} y={CENTER_Y - 25} fontSize={5} fill="#9CA3AF">...</text>
              </motion.g>
            );

          case 'confetti':
            return (
              <motion.g
                key={`extra-${i}`}
                initial={false}
                animate={reducedMotion ? {} : { opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <circle cx={CENTER_X - 22} cy={CENTER_Y - 20} r={1.5} fill="#FF6B6B" />
                <circle cx={CENTER_X + 22} cy={CENTER_Y - 22} r={1.5} fill="#4ECDC4" />
                <circle cx={CENTER_X - 18} cy={CENTER_Y - 26} r={1.2} fill="#FFE66D" />
                <circle cx={CENTER_X + 16} cy={CENTER_Y - 28} r={1.2} fill="#A78BFA" />
                <rect x={CENTER_X - 24} y={CENTER_Y - 24} width={2.5} height={1.2} rx={0.5} fill="#FFE66D" transform="rotate(30)" />
                <rect x={CENTER_X + 20} y={CENTER_Y - 26} width={2.5} height={1.2} rx={0.5} fill="#FF6B6B" transform="rotate(-20)" />
              </motion.g>
            );

          case 'star':
            return (
              <motion.text
                key={`extra-${i}`}
                x={CENTER_X - 24}
                y={CENTER_Y - 18}
                fontSize={8}
                fill="#FFD93D"
                initial={false}
                animate={reducedMotion ? {} : { scale: [0.8, 1.2, 0.8], rotate: [0, 15, 0] }}
                transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
                style={{ transformOrigin: `${CENTER_X - 24}px ${CENTER_Y - 18}px` }}
              >
                {'\u2605'}
              </motion.text>
            );

          default:
            return null;
        }
      })}
    </g>
  );
}

// ---------------------------------------------------------------------------
// Blink overlay
// ---------------------------------------------------------------------------

function BlinkOverlay({
  expression,
  enabled,
  reducedMotion,
}: {
  expression: Expression;
  enabled: boolean;
  reducedMotion: boolean;
}) {
  const [isBlinking, setIsBlinking] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleBlink = useCallback(() => {
    if (!enabled || reducedMotion) return;
    timerRef.current = setTimeout(() => {
      setIsBlinking(true);
      setTimeout(() => {
        setIsBlinking(false);
        scheduleBlink();
      }, BLINK_DURATION_MS);
    }, getBlinkInterval());
  }, [enabled, reducedMotion]);

  useEffect(() => {
    if (enabled && !reducedMotion) {
      scheduleBlink();
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [enabled, reducedMotion, scheduleBlink]);

  // Don't blink over already-closed eyes
  if (expression.eyes.shape === 'arc-happy' || expression.eyes.shape === 'closed') {
    return null;
  }

  if (!isBlinking || reducedMotion) return null;

  const r = 5 * expression.eyes.scale;
  const adjustedEyeY = EYE_Y + expression.eyes.offsetY;

  return (
    <AnimatePresence>
      {isBlinking && (
        <motion.g
          variants={blinkVariants}
          initial="open"
          animate="closed"
          exit="open"
        >
          {/* Left eyelid */}
          <rect
            x={LEFT_EYE_X - r * 1.3}
            y={adjustedEyeY - r * 1.3}
            width={r * 2.6}
            height={r * 2.6}
            rx={r * 0.5}
            fill="currentColor"
            opacity={0.2}
          />
          {/* Right eyelid */}
          <rect
            x={RIGHT_EYE_X - r * 1.3}
            y={adjustedEyeY - r * 1.3}
            width={r * 2.6}
            height={r * 2.6}
            rx={r * 0.5}
            fill="currentColor"
            opacity={0.2}
          />
        </motion.g>
      )}
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function MascotFace({
  expression: expressionId,
  themeColor,
  speaking = false,
  currentMouthShape,
  enableBlink = true,
  reducedMotion = false,
  sizeScale = 1,
}: MascotFaceProps) {
  const expression = getExpression(expressionId);

  return (
    <svg
      viewBox={`0 0 ${VB_SIZE} ${VB_SIZE}`}
      width={VB_SIZE * sizeScale}
      height={VB_SIZE * sizeScale}
      style={{ overflow: 'visible' }}
      aria-hidden="true"
    >
      {/* Cheeks (behind everything) */}
      {renderCheeks(expression, themeColor, reducedMotion)}

      {/* Brows */}
      {renderBrows(expression, reducedMotion)}

      {/* Eyes */}
      <g>
        {renderEye(expression, LEFT_EYE_X, EYE_Y, reducedMotion)}
        {renderEye(expression, RIGHT_EYE_X, EYE_Y, reducedMotion)}
      </g>

      {/* Blink overlay */}
      <BlinkOverlay
        expression={expression}
        enabled={enableBlink}
        reducedMotion={reducedMotion}
      />

      {/* Mouth */}
      {renderMouth(expression, speaking, currentMouthShape, reducedMotion)}

      {/* Extras (sparkles, hearts, zzz, etc.) */}
      {renderExtras(expression, reducedMotion)}
    </svg>
  );
}
