// =============================================================================
// MascotCharacter - Main mascot rendering component with layered SVG
// =============================================================================

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { ExpressionId } from './expressions.ts';
import type { PoseId } from './poses.ts';
import { getPose } from './poses.ts';
import MascotFace from './MascotFace.tsx';
import {
  idleBreathing,
  bedtimeIdleBreathing,
  bounceVariants,
  swayVariants,
  bedtimeSwayVariants,
  waveVariants,
  celebrationVariants,
  clapVariants,
  danceVariants,
  entranceVariants,
  armTransition,
  headTiltTransition,
} from './animations.ts';
import { useAccessibility } from '../context/AccessibilityContext.tsx';
import { useApp } from '../context/AppContext.tsx';
import { getCharacterById } from '../data/charactersData.ts';
import type { MouthShape } from './lipSync.ts';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MascotCharacterProps {
  /** Character ID: leo, daisy, ollie, ruby, finn */
  characterId?: string;
  /** Facial expression */
  expression?: ExpressionId;
  /** Body pose */
  pose?: PoseId;
  /** Display size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Enable speaking mouth animation */
  speaking?: boolean;
  /** Current lip-sync mouth shape */
  currentMouthShape?: MouthShape;
  /** Enable idle breathing/blinking */
  idle?: boolean;
  /** Extra CSS class names */
  className?: string;
  /** Click handler */
  onClick?: () => void;
  /** Accessible label */
  ariaLabel?: string;
}

// ---------------------------------------------------------------------------
// Size configuration
// ---------------------------------------------------------------------------

const SIZES: Record<string, { px: number; faceScale: number; detail: 'low' | 'mid' | 'high' }> = {
  xs: { px: 32, faceScale: 0.35, detail: 'low' },
  sm: { px: 56, faceScale: 0.55, detail: 'low' },
  md: { px: 96, faceScale: 0.8, detail: 'mid' },
  lg: { px: 140, faceScale: 1.0, detail: 'high' },
  xl: { px: 200, faceScale: 1.2, detail: 'high' },
};

// ---------------------------------------------------------------------------
// Character body shape definitions
// ---------------------------------------------------------------------------
// Each character has a distinct SVG body that shares the same coordinate system.
// ViewBox is 100x120 with origin top-left.

interface CharacterShape {
  /** Main body color */
  bodyColor: string;
  /** Slightly lighter accent for belly/inner */
  bellyColor: string;
  /** SVG path for the body silhouette */
  bodyPath: string;
  /** SVG path for the belly/chest area */
  bellyPath: string;
  /** Ear/feature SVG elements (character-specific) */
  features: string;
  /** Position offsets for face placement */
  faceOffset: { x: number; y: number };
  /** Arm anchor points */
  armLeftAnchor: { x: number; y: number };
  armRightAnchor: { x: number; y: number };
}

function getCharacterShape(characterId: string): CharacterShape {
  switch (characterId) {
    case 'leo':
      // Leo Lion: round mane, warm gold body
      return {
        bodyColor: '#FFD93D',
        bellyColor: '#FFF3C4',
        bodyPath: 'M 50 18 C 25 18 15 35 15 58 C 15 82 28 100 50 102 C 72 100 85 82 85 58 C 85 35 75 18 50 18 Z',
        bellyPath: 'M 50 42 C 38 42 30 52 30 66 C 30 80 38 88 50 88 C 62 88 70 80 70 66 C 70 52 62 42 50 42 Z',
        features: `
          <!-- Mane: fluffy circle behind the head -->
          <circle cx="50" cy="32" r="24" fill="#E8A317" opacity="0.7" />
          <circle cx="38" cy="28" r="8" fill="#E8A317" opacity="0.6" />
          <circle cx="62" cy="28" r="8" fill="#E8A317" opacity="0.6" />
          <circle cx="32" cy="36" r="7" fill="#E8A317" opacity="0.5" />
          <circle cx="68" cy="36" r="7" fill="#E8A317" opacity="0.5" />
          <!-- Ears -->
          <ellipse cx="33" cy="22" rx="6" ry="5" fill="#FFD93D" stroke="#E8A317" stroke-width="1" />
          <ellipse cx="67" cy="22" rx="6" ry="5" fill="#FFD93D" stroke="#E8A317" stroke-width="1" />
          <!-- Nose -->
          <ellipse cx="50" cy="55" rx="3.5" ry="2.5" fill="#C98A1A" />
        `,
        faceOffset: { x: 10, y: 22 },
        armLeftAnchor: { x: 18, y: 60 },
        armRightAnchor: { x: 82, y: 60 },
      };

    case 'daisy':
      // Daisy Duck: soft pink, rounded body with small beak
      return {
        bodyColor: '#FD79A8',
        bellyColor: '#FFE0F0',
        bodyPath: 'M 50 22 C 28 22 16 40 16 60 C 16 82 30 98 50 100 C 70 98 84 82 84 60 C 84 40 72 22 50 22 Z',
        bellyPath: 'M 50 44 C 38 44 30 54 30 68 C 30 80 38 90 50 90 C 62 90 70 80 70 68 C 70 54 62 44 50 44 Z',
        features: `
          <!-- Head tuft / hair -->
          <ellipse cx="45" cy="18" rx="6" ry="4" fill="#FD79A8" />
          <ellipse cx="50" cy="16" rx="5" ry="5" fill="#E84393" opacity="0.6" />
          <ellipse cx="55" cy="18" rx="5" ry="3.5" fill="#FD79A8" />
          <!-- Beak -->
          <ellipse cx="50" cy="56" rx="5" ry="2.5" fill="#FDCB6E" />
          <!-- Bow -->
          <path d="M 60 20 Q 65 16 68 20 Q 65 24 60 20 Z" fill="#FF6B6B" />
          <path d="M 60 20 Q 65 24 68 20 Q 65 16 60 20 Z" fill="#FF4757" opacity="0.7" />
          <circle cx="60" cy="20" r="1.5" fill="#FF4757" />
        `,
        faceOffset: { x: 10, y: 24 },
        armLeftAnchor: { x: 18, y: 62 },
        armRightAnchor: { x: 82, y: 62 },
      };

    case 'ollie':
      // Ollie Owl: purple/indigo, wider top for owl head shape
      return {
        bodyColor: '#6366F1',
        bellyColor: '#E0E7FF',
        bodyPath: 'M 50 16 C 24 16 14 34 14 56 C 14 80 28 100 50 102 C 72 100 86 80 86 56 C 86 34 76 16 50 16 Z',
        bellyPath: 'M 50 40 C 36 40 28 52 28 66 C 28 80 36 90 50 90 C 64 90 72 80 72 66 C 72 52 64 40 50 40 Z',
        features: `
          <!-- Ear tufts -->
          <path d="M 28 20 L 22 8 L 34 16 Z" fill="#6366F1" />
          <path d="M 72 20 L 78 8 L 66 16 Z" fill="#6366F1" />
          <!-- Eye circles (owl rings) -->
          <circle cx="38" cy="38" r="10" fill="#E0E7FF" stroke="#4F46E5" stroke-width="1.2" />
          <circle cx="62" cy="38" r="10" fill="#E0E7FF" stroke="#4F46E5" stroke-width="1.2" />
          <!-- Beak -->
          <path d="M 47 52 L 50 58 L 53 52 Z" fill="#FDCB6E" />
        `,
        faceOffset: { x: 10, y: 20 },
        armLeftAnchor: { x: 16, y: 60 },
        armRightAnchor: { x: 84, y: 60 },
      };

    case 'ruby':
      // Ruby Rabbit: coral/red, tall ears, bouncy body
      return {
        bodyColor: '#FF6B6B',
        bellyColor: '#FFE0E0',
        bodyPath: 'M 50 24 C 28 24 18 42 18 60 C 18 82 30 98 50 100 C 70 98 82 82 82 60 C 82 42 72 24 50 24 Z',
        bellyPath: 'M 50 46 C 38 46 32 56 32 68 C 32 80 38 88 50 88 C 62 88 68 80 68 68 C 68 56 62 46 50 46 Z',
        features: `
          <!-- Tall rabbit ears -->
          <ellipse cx="38" cy="10" rx="7" ry="18" fill="#FF6B6B" />
          <ellipse cx="38" cy="10" rx="4" ry="14" fill="#FFB4B4" opacity="0.7" />
          <ellipse cx="62" cy="10" rx="7" ry="18" fill="#FF6B6B" />
          <ellipse cx="62" cy="10" rx="4" ry="14" fill="#FFB4B4" opacity="0.7" />
          <!-- Nose -->
          <ellipse cx="50" cy="55" rx="3" ry="2" fill="#E55656" />
          <!-- Whiskers -->
          <line x1="30" y1="54" x2="42" y2="55" stroke="#E55656" stroke-width="0.8" opacity="0.5" />
          <line x1="30" y1="57" x2="42" y2="57" stroke="#E55656" stroke-width="0.8" opacity="0.5" />
          <line x1="58" y1="55" x2="70" y2="54" stroke="#E55656" stroke-width="0.8" opacity="0.5" />
          <line x1="58" y1="57" x2="70" y2="57" stroke="#E55656" stroke-width="0.8" opacity="0.5" />
          <!-- Buck teeth -->
          <rect x="47" y="58" width="3" height="3" rx="0.8" fill="white" opacity="0.8" />
          <rect x="50.5" y="58" width="3" height="3" rx="0.8" fill="white" opacity="0.8" />
        `,
        faceOffset: { x: 10, y: 26 },
        armLeftAnchor: { x: 20, y: 62 },
        armRightAnchor: { x: 80, y: 62 },
      };

    case 'finn':
    default:
      // Finn Fox: teal, pointy ears, bushy tail accent
      return {
        bodyColor: '#4ECDC4',
        bellyColor: '#D4F5F0',
        bodyPath: 'M 50 20 C 26 20 16 38 16 58 C 16 80 28 98 50 100 C 72 98 84 80 84 58 C 84 38 74 20 50 20 Z',
        bellyPath: 'M 50 42 C 38 42 30 54 30 66 C 30 80 38 88 50 88 C 62 88 70 80 70 66 C 70 54 62 42 50 42 Z',
        features: `
          <!-- Pointy ears -->
          <path d="M 30 24 L 24 6 L 38 20 Z" fill="#4ECDC4" />
          <path d="M 30 24 L 27 12 L 36 22 Z" fill="#D4F5F0" opacity="0.7" />
          <path d="M 70 24 L 76 6 L 62 20 Z" fill="#4ECDC4" />
          <path d="M 70 24 L 73 12 L 64 22 Z" fill="#D4F5F0" opacity="0.7" />
          <!-- Fox nose -->
          <ellipse cx="50" cy="54" rx="3.5" ry="2.5" fill="#2D9B93" />
          <!-- Cheek markings -->
          <path d="M 22 44 Q 30 40 36 46" fill="none" stroke="#3DB8AD" stroke-width="1.2" opacity="0.5" />
          <path d="M 78 44 Q 70 40 64 46" fill="none" stroke="#3DB8AD" stroke-width="1.2" opacity="0.5" />
          <!-- Tail hint (visible behind body at bottom-right) -->
          <path d="M 78 85 Q 92 75 88 62 Q 86 55 80 58" fill="#4ECDC4" opacity="0.6" />
          <path d="M 82 78 Q 88 72 87 65" fill="none" stroke="#D4F5F0" stroke-width="2" opacity="0.5" stroke-linecap="round" />
        `,
        faceOffset: { x: 10, y: 22 },
        armLeftAnchor: { x: 18, y: 60 },
        armRightAnchor: { x: 82, y: 60 },
      };
  }
}

// ---------------------------------------------------------------------------
// Arm rendering
// ---------------------------------------------------------------------------

function renderArm(
  side: 'left' | 'right',
  anchor: { x: number; y: number },
  rotation: number,
  bodyColor: string,
  poseId: PoseId,
  reducedMotion: boolean,
): React.ReactNode {
  const isLeft = side === 'left';
  const armLength = 22;
  const armWidth = 8;

  // Calculate arm end point based on rotation
  const rad = (rotation * Math.PI) / 180;
  const dir = isLeft ? -1 : 1;
  const endX = anchor.x + dir * armLength * Math.cos(rad);
  const endY = anchor.y - armLength * Math.sin(Math.abs(rad));

  // Determine if this arm should have a wave/clap animation
  const shouldWave = poseId === 'waving' && !isLeft; // right arm waves
  const shouldClap = poseId === 'clapping';

  const armElement = (
    <motion.g
      style={{ transformOrigin: `${anchor.x}px ${anchor.y}px` }}
      initial={false}
      animate={{ rotate: rotation }}
      transition={reducedMotion ? { duration: 0 } : armTransition}
    >
      {/* Arm body */}
      <motion.line
        x1={anchor.x}
        y1={anchor.y}
        x2={endX}
        y2={endY}
        stroke={bodyColor}
        strokeWidth={armWidth}
        strokeLinecap="round"
      />
      {/* Hand (circle at the end) */}
      <circle
        cx={endX}
        cy={endY}
        r={armWidth * 0.6}
        fill={bodyColor}
      />
    </motion.g>
  );

  // Wrap with animation variant if needed
  if (shouldWave && !reducedMotion) {
    return (
      <motion.g
        key={`arm-${side}`}
        variants={waveVariants}
        animate="waving"
        style={{ transformOrigin: `${anchor.x}px ${anchor.y}px` }}
      >
        {armElement}
      </motion.g>
    );
  }

  if (shouldClap && !reducedMotion) {
    return (
      <motion.g
        key={`arm-${side}`}
        variants={clapVariants}
        animate="clapping"
        style={{ transformOrigin: `${anchor.x}px ${anchor.y}px` }}
      >
        {armElement}
      </motion.g>
    );
  }

  return <g key={`arm-${side}`}>{armElement}</g>;
}

// ---------------------------------------------------------------------------
// Feet rendering
// ---------------------------------------------------------------------------

function renderFeet(
  bodyColor: string,
  detail: 'low' | 'mid' | 'high',
): React.ReactNode {
  if (detail === 'low') return null;

  return (
    <g>
      <ellipse cx={40} cy={100} rx={8} ry={3.5} fill={bodyColor} />
      <ellipse cx={60} cy={100} rx={8} ry={3.5} fill={bodyColor} />
    </g>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function MascotCharacter({
  characterId,
  expression = 'happy',
  pose = 'waving',
  size = 'md',
  speaking = false,
  currentMouthShape,
  idle = true,
  className = '',
  onClick,
  ariaLabel,
}: MascotCharacterProps) {
  const { reducedMotion } = useAccessibility();
  const { bedtimeMode, activeCharacter } = useApp();
  const charId = characterId ?? activeCharacter ?? 'leo';

  const sizeConfig = SIZES[size] ?? SIZES.md;
  const characterData = getCharacterById(charId);
  const shape = useMemo(() => getCharacterShape(charId), [charId]);
  const poseConfig = getPose(pose);

  // Resolve final expression: pose has a default, but explicit prop overrides
  const finalExpression = expression;

  // Choose animation variants based on bedtime mode
  const breathingVariants = bedtimeMode ? bedtimeIdleBreathing : idleBreathing;
  const swayVars = bedtimeMode ? bedtimeSwayVariants : swayVariants;

  // Determine body animation state
  const getBodyAnimation = (): string => {
    if (reducedMotion) return 'static';
    if (pose === 'cheering' || pose === 'reward') return 'celebrating';
    if (pose === 'dancing') return 'dancing';
    if (poseConfig.bounce) return 'bouncing';
    if (idle) return 'idle';
    return 'static';
  };

  // Determine sway state
  const getSwayAnimation = (): string => {
    if (reducedMotion) return 'still';
    if (poseConfig.sway) return 'swaying';
    return 'still';
  };

  // Determine special body variants
  const getBodyVariants = () => {
    if (reducedMotion) return idleBreathing; // will use 'static' key
    if (pose === 'cheering' || pose === 'reward') return celebrationVariants;
    if (pose === 'dancing') return danceVariants;
    if (poseConfig.bounce) return bounceVariants;
    return breathingVariants;
  };

  const label = ariaLabel ?? `${characterData.name} character, ${finalExpression} expression, ${pose} pose`;

  return (
    <motion.div
      className={`inline-flex items-center justify-center ${className}`}
      style={{ width: sizeConfig.px, height: sizeConfig.px * 1.2 }}
      variants={entranceVariants}
      initial="hidden"
      animate="visible"
      role={onClick ? 'button' : 'img'}
      aria-label={label}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
      whileHover={onClick && !reducedMotion ? { scale: 1.05 } : undefined}
      whileTap={onClick && !reducedMotion ? { scale: 0.95 } : undefined}
    >
      <motion.svg
        viewBox="0 0 100 120"
        width={sizeConfig.px}
        height={sizeConfig.px * 1.2}
        style={{ overflow: 'visible' }}
      >
        {/* === Sway wrapper === */}
        <motion.g
          variants={swayVars}
          animate={getSwayAnimation()}
          style={{ transformOrigin: '50px 100px' }}
        >
          {/* === Body animation wrapper (breathing/bouncing/celebrating) === */}
          <motion.g
            variants={getBodyVariants()}
            animate={getBodyAnimation()}
            style={{ transformOrigin: '50px 60px' }}
          >
            {/* === Body rotation from pose === */}
            <motion.g
              initial={false}
              animate={{ rotate: poseConfig.bodyRotation }}
              transition={reducedMotion ? { duration: 0 } : headTiltTransition}
              style={{ transformOrigin: '50px 60px' }}
            >
              {/* Character-specific features behind body (mane, ears, tail, etc.) */}
              <g dangerouslySetInnerHTML={{ __html: shape.features }} />

              {/* Main body */}
              <path d={shape.bodyPath} fill={shape.bodyColor} />

              {/* Belly/chest lighter area */}
              <path d={shape.bellyPath} fill={shape.bellyColor} opacity={0.8} />

              {/* Arms */}
              {renderArm(
                'left',
                shape.armLeftAnchor,
                poseConfig.armLeft.rotation,
                shape.bodyColor,
                pose,
                reducedMotion,
              )}
              {renderArm(
                'right',
                shape.armRightAnchor,
                poseConfig.armRight.rotation,
                shape.bodyColor,
                pose,
                reducedMotion,
              )}

              {/* Head tilt wrapper */}
              <motion.g
                initial={false}
                animate={{ rotate: poseConfig.headTilt }}
                transition={reducedMotion ? { duration: 0 } : headTiltTransition}
                style={{ transformOrigin: '50px 40px' }}
              >
                {/* Face */}
                <foreignObject
                  x={shape.faceOffset.x}
                  y={shape.faceOffset.y}
                  width={80}
                  height={80}
                >
                  <MascotFace
                    expression={finalExpression}
                    themeColor={shape.bodyColor}
                    speaking={speaking}
                    currentMouthShape={currentMouthShape}
                    enableBlink={idle && !reducedMotion}
                    reducedMotion={reducedMotion}
                    sizeScale={sizeConfig.faceScale}
                  />
                </foreignObject>
              </motion.g>

              {/* Feet */}
              {renderFeet(shape.bodyColor, sizeConfig.detail)}
            </motion.g>
          </motion.g>
        </motion.g>
      </motion.svg>
    </motion.div>
  );
}
