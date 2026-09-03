/**
 * SkyLife — shared upper-sky and midground density.
 *
 * The worlds read empty above the horizon on large screens: the reference art
 * fills that band with life at several depths rather than one cloud layer.
 * This adds bird flocks on long traversals, high-altitude wisps and depth-tinted
 * far detail that every world can tune to its own palette.
 */
import { motion } from 'framer-motion';
import { useMotionPreset } from '../../motion/useMotionPreset';

export interface SkyLifeProps {
  /** Silhouette colour for birds — dark for day skies, warm for dusk. */
  birdColor?: string;
  /** Tint for high wisp clouds. */
  wispColor?: string;
  /** Skip birds for worlds where they'd read wrong (e.g. deep space). */
  birds?: boolean;
  /** Extra opacity control so bright worlds don't get muddy. */
  opacity?: number;
}

/** A small V-formation that flaps as it crosses. */
function Flock({ color, delay, top, dur, scale }: { color: string; delay: number; top: string; dur: number; scale: number }) {
  const { isReducedMotion } = useMotionPreset();
  return (
    <motion.div
      className="absolute"
      style={{ top, left: '-10%', transform: `scale(${scale})` }}
      animate={isReducedMotion ? undefined : { x: ['0vw', '118vw'], y: [0, -14, 6, -8, 0] }}
      transition={{ duration: dur, repeat: Infinity, ease: 'linear', delay }}
    >
      <svg width="66" height="26" viewBox="0 0 66 26" fill="none" aria-hidden="true">
        {[
          { x: 0, y: 10, s: 1 },
          { x: 20, y: 3, s: 0.86 },
          { x: 38, y: 12, s: 0.72 },
          { x: 54, y: 6, s: 0.6 },
        ].map((b, i) => (
          /* Wings flap by squashing the whole bird vertically. Animating the
             `d` attribute looked equivalent but framer-motion does not
             interpolate path data, so `d` went momentarily `undefined` and the
             browser rejected the path ("Expected moveto path command"). */
          <motion.g
            key={i}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            animate={isReducedMotion ? undefined : { scaleY: [1, 0.45, 1] }}
            transition={{ duration: 0.85 + i * 0.08, repeat: Infinity, ease: 'easeInOut' }}
          >
            <path
              d={`M${b.x} ${b.y} q ${5 * b.s} ${-4 * b.s} ${10 * b.s} 0 q ${5 * b.s} ${-4 * b.s} ${10 * b.s} 0`}
              stroke={color}
              strokeWidth={1.7 * b.s}
              strokeLinecap="round"
              fill="none"
            />
          </motion.g>
        ))}
      </svg>
    </motion.div>
  );
}

export default function SkyLife({
  birdColor = 'rgba(60,80,110,0.42)',
  wispColor = 'rgba(255,255,255,0.55)',
  birds = true,
  opacity = 1,
}: SkyLifeProps) {
  const { isReducedMotion } = useMotionPreset();

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ opacity }} aria-hidden="true">
      {/* High wisp clouds — thin, fast, well above the main cloud deck */}
      {[
        { top: '4%', w: 210, o: 0.5, dur: 54, delay: 0 },
        { top: '11%', w: 150, o: 0.36, dur: 68, delay: 9 },
        { top: '18%', w: 260, o: 0.28, dur: 82, delay: 20 },
      ].map((w, i) => (
        <motion.div
          key={`wisp${i}`}
          className="absolute"
          style={{ top: w.top, left: '-24%', opacity: w.o }}
          animate={isReducedMotion ? undefined : { x: ['0vw', '132vw'] }}
          transition={{ duration: w.dur, repeat: Infinity, ease: 'linear', delay: w.delay }}
        >
          <svg width={w.w} height={w.w * 0.13} viewBox="0 0 200 26" fill="none">
            <ellipse cx="60" cy="14" rx="58" ry="7" fill={wispColor} />
            <ellipse cx="130" cy="11" rx="44" ry="5" fill={wispColor} />
          </svg>
        </motion.div>
      ))}

      {birds && (
        <>
          <Flock color={birdColor} delay={2} top="14%" dur={38} scale={1} />
          <Flock color={birdColor} delay={17} top="26%" dur={46} scale={0.72} />
          <Flock color={birdColor} delay={31} top="8%" dur={54} scale={0.52} />
        </>
      )}
    </div>
  );
}
