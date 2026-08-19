/**
 * StepPose — draws the figure in the pose the current instruction describes.
 *
 * One parametric character posed by limb angles, rather than 22 bespoke
 * drawings: every pose stays on-style automatically, and new instruction copy
 * gets a matching visual without new art.
 *
 * If real art exists it wins: per-activity art is checked first, then shared
 * per-action art, then this figure. Code always supplies the motion — the art
 * supplies pose quality.
 */
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  POSE_GEOMETRY, POSE_LABEL, stepArtPath, sharedStepArtPath,
  type PoseAction, type PoseGeometry,
} from '../../data/movementPoses';
import { useMotionPreset } from '../../motion/useMotionPreset';

export interface StepPoseProps {
  action: PoseAction;
  activityId: string;
  size?: number;
  className?: string;
}

/** Motion character applied on top of whichever visual renders. */
const MOTION_LOOP = {
  bounce:  { y: [0, -10, 0], rotate: [0, 0, 0], duration: 0.85 },
  fast:    { y: [0, -5, 0], rotate: [-3, 3, -3], duration: 0.55 },
  sway:    { y: [0, -3, 0], rotate: [-2.5, 2.5, -2.5], duration: 2.2 },
  breathe: { y: [0, -3, 0], rotate: [0, 0, 0], duration: 3 },
  still:   { y: [0, 0, 0], rotate: [0, 0, 0], duration: 4 },
} as const;

/** Probe an image, resolving false fast when it isn't there. */
function useImage(src: string): boolean | null {
  const [ok, setOk] = useState<boolean | null>(null);
  useEffect(() => {
    if (!src) { setOk(false); return; }
    let cancelled = false;
    const img = new Image();
    img.onload = () => !cancelled && setOk(true);
    img.onerror = () => !cancelled && setOk(false);
    img.src = src;
    return () => { cancelled = true; };
  }, [src]);
  return ok;
}

export default function StepPose({ action, activityId, size = 220, className }: StepPoseProps) {
  const { isReducedMotion } = useMotionPreset();
  const g = POSE_GEOMETRY[action] ?? POSE_GEOMETRY['stand-tall'];
  const loop = MOTION_LOOP[g.motion ?? 'breathe'];

  const bespoke = useImage(stepArtPath(activityId, action));
  const shared = useImage(bespoke === false ? sharedStepArtPath(action) : '');
  const artSrc = bespoke ? stepArtPath(activityId, action)
    : shared ? sharedStepArtPath(action)
    : null;

  const label = `Figure ${POSE_LABEL[action] ?? 'standing'}`;

  return (
    <motion.div
      className={className}
      style={{ width: size, height: size, willChange: 'transform' }}
      animate={isReducedMotion ? undefined : { y: loop.y, rotate: loop.rotate }}
      transition={{ duration: loop.duration, repeat: Infinity, ease: 'easeInOut' }}
      role="img"
      aria-label={label}
    >
      {artSrc ? (
        <img src={artSrc} alt="" className="w-full h-full object-contain" draggable={false} />
      ) : (
        <PoseFigure geometry={g} size={size} reduced={isReducedMotion} />
      )}
    </motion.div>
  );
}

/**
 * The parametric character.
 *
 * Limbs are positioned with trigonometry rather than CSS rotation: SVG
 * transform-origin proved unreliable across the nested groups (limbs pivoted
 * about the wrong point and swung off-canvas), and explicit endpoints make each
 * pose exactly reproducible.
 *
 * Angle convention: 0deg hangs straight down, positive is clockwise on screen,
 * so a positive left-arm angle swings out and up to the figure's left.
 */
function PoseFigure({ geometry: g, size, reduced }: { geometry: PoseGeometry; size: number; reduced: boolean }) {
  const skin = '#F7C9A0';
  const shirt = '#4ECDC4';
  const shorts = '#A78BFA';

  const rad = (deg: number) => (deg * Math.PI) / 180;
  /** Endpoint of a limb of length `len` leaving `(x, y)` at `deg`. */
  const tip = (x: number, y: number, deg: number, len: number) => ({
    x: x - Math.sin(rad(deg)) * len,
    y: y + Math.cos(rad(deg)) * len,
  });

  const SHOULDER_Y = 92;
  const HIP_Y = 132;
  const ARM_LEN = 40;
  const LEG_LEN = 44;

  const lShoulder = { x: 82, y: SHOULDER_Y };
  const rShoulder = { x: 118, y: SHOULDER_Y };
  const lHip = { x: 91, y: HIP_Y };
  const rHip = { x: 109, y: HIP_Y };

  const lHand = tip(lShoulder.x, lShoulder.y, g.leftArm, ARM_LEN);
  const rHand = tip(rShoulder.x, rShoulder.y, g.rightArm, ARM_LEN);
  const lFoot = tip(lHip.x, lHip.y, g.leftLeg, LEG_LEN);
  const rFoot = tip(rHip.x, rHip.y, g.rightLeg, LEG_LEN);

  const headY = 62 - (g.lift ?? 0) * 0.2;

  return (
    <svg viewBox="0 0 200 210" width={size} height={size} fill="none" aria-hidden="true">
      <ellipse cx="100" cy="196" rx="34" ry="7" fill="rgba(0,0,0,0.15)" />

      <motion.g
        animate={{ rotate: g.lean, y: g.lift ?? 0 }}
        transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 170, damping: 18 }}
        style={{ transformOrigin: '100px 150px' }}
      >
        {/* Legs */}
        {[[lHip, lFoot], [rHip, rFoot]].map(([hip, foot], i) => (
          <g key={`leg${i}`}>
            <line x1={hip.x} y1={hip.y} x2={foot.x} y2={foot.y} stroke={shorts} strokeWidth={15} strokeLinecap="round" />
            <ellipse cx={foot.x} cy={foot.y + 4} rx={10} ry={6} fill="#FF6B6B" />
          </g>
        ))}

        {/* Torso */}
        <rect x={80} y={84} width={40} height={54} rx={19} fill={shirt} />

        {/* Arms */}
        {[[lShoulder, lHand], [rShoulder, rHand]].map(([sh, hand], i) => (
          <g key={`arm${i}`}>
            <line x1={sh.x} y1={sh.y} x2={hand.x} y2={hand.y} stroke={shirt} strokeWidth={13} strokeLinecap="round" />
            <circle cx={hand.x} cy={hand.y} r={8} fill={skin} />
          </g>
        ))}

        {/* Head */}
        <g transform={`rotate(${g.headTilt} 100 ${headY + 22})`}>
          <circle cx={100} cy={headY} r={25} fill={skin} />
          <path d={`M75 ${headY - 4}a25 25 0 0 1 50 0q-25-14-50 0z`} fill="#6B4E33" />
          <circle cx={91} cy={headY} r={3.3} fill="#3A3A48" />
          <circle cx={109} cy={headY} r={3.3} fill="#3A3A48" />
          <path d={`M92 ${headY + 10}q8 7 16 0`} stroke="#3A3A48" strokeWidth={2.6} strokeLinecap="round" fill="none" />
          <circle cx={82} cy={headY + 7} r={4.3} fill="#FF8FAB" opacity={0.45} />
          <circle cx={118} cy={headY + 7} r={4.3} fill="#FF8FAB" opacity={0.45} />
        </g>
      </motion.g>
    </svg>
  );
}
