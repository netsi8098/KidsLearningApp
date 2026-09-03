/**
 * TreehouseWorld — a lantern-lit village built from independent scene layers.
 * The painted plate is scenery only; mascot, title, UI and ambient motion stay
 * live and responsive.
 */
import { motion } from 'framer-motion';
import type { WorldProps } from './types';
import { useMotionPreset } from '../../../motion/useMotionPreset';
import { DEPTH, useSceneParallax } from '../useSceneParallax';

const spring = { type: 'spring' as const, stiffness: 50, damping: 22, mass: 0.95 };

function FallingLeaf({ left, delay, duration, color }: { left: string; delay: number; duration: number; color: string }) {
  const { isReducedMotion } = useMotionPreset();
  if (isReducedMotion) return null;

  return (
    <motion.span
      className="absolute -top-8 block h-3 w-5 rounded-[100%_0_100%_0]"
      style={{ left, background: color, filter: 'drop-shadow(0 3px 3px rgba(75,44,24,0.2))' }}
      aria-hidden="true"
      animate={{ y: ['0vh', '108vh'], x: [0, 30, -22, 18, 0], rotate: [0, 140, 260, 420] }}
      transition={{ duration, repeat: Infinity, ease: 'linear', delay }}
    />
  );
}

export default function TreehouseWorld({ mascot, title, children }: WorldProps) {
  const parallax = useSceneParallax();
  const { isReducedMotion } = useMotionPreset();

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#E7A26E]">
      <motion.img
        src="/assets/worlds/treehouse/backplate.webp"
        alt=""
        aria-hidden="true"
        draggable={false}
        className="absolute -inset-[2%] h-[104%] w-[104%] max-w-none select-none object-cover"
        style={{ objectPosition: '44% center' }}
        animate={{ x: parallax.x * -DEPTH.far, y: parallax.y * -DEPTH.far }}
        transition={spring}
      />

      {/* Sunset and lantern light are live layers, not brightness baked over UI. */}
      <motion.div
        className="absolute left-[47%] top-[24%] h-[34vw] max-h-[430px] w-[42vw] max-w-[540px] rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
        style={{ background: 'radial-gradient(circle, rgba(255,225,154,0.35), rgba(255,174,93,0.10) 54%, transparent 74%)' }}
        animate={isReducedMotion ? undefined : { opacity: [0.62, 0.9, 0.62], scale: [0.98, 1.04, 0.98] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        aria-hidden="true"
        animate={{ x: parallax.x * -DEPTH.mid, y: parallax.y * -DEPTH.mid }}
        transition={spring}
      >
        {/* Warm pools line up with the painted lanterns and softly flicker. */}
        {[
          { left: '5%', top: '10%', size: 90, delay: 0 },
          { left: '28%', top: '10%', size: 70, delay: 0.7 },
          { left: '38%', top: '24%', size: 62, delay: 1.3 },
          { left: '88%', top: '28%', size: 68, delay: 0.4 },
        ].map((light) => (
          <motion.span
            key={`${light.left}-${light.top}`}
            className="absolute rounded-full blur-2xl"
            style={{ left: light.left, top: light.top, width: light.size, height: light.size, background: 'rgba(255,190,78,0.30)' }}
            animate={isReducedMotion ? undefined : { opacity: [0.35, 0.72, 0.46, 0.66, 0.35], scale: [0.94, 1.06, 1] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: light.delay }}
          />
        ))}
      </motion.div>

      {/* Independent anchors match the reference: lion on the patio, sign hung
          from the overhead branch. Neither element pushes the other around. */}
      <div className="pointer-events-none absolute inset-0 z-[14]">
        <motion.div
          className="pointer-events-auto absolute bottom-[17%] left-[8%] z-[2] md:bottom-[15%] md:left-[25%]"
          animate={isReducedMotion ? undefined : { y: [0, -1.5, 0] }}
          transition={{ duration: 5.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <motion.span
            className="absolute bottom-[-4px] left-1/2 h-5 w-[72%] -translate-x-1/2 rounded-full bg-[#3C2415]/40 blur-md"
            aria-hidden="true"
            animate={isReducedMotion ? undefined : { opacity: [0.38, 0.27, 0.38], scaleX: [1, 0.96, 1] }}
            transition={{ duration: 5.8, repeat: Infinity, ease: 'easeInOut' }}
          />
          {mascot}
        </motion.div>

        <div className="pointer-events-auto absolute left-1/2 top-[6%] z-[3] w-[94vw] -translate-x-1/2 md:left-auto md:right-[7%] md:top-[5%] md:w-[min(49vw,540px)] md:translate-x-0">
          {title}
        </div>
      </div>

      <motion.div
        className="absolute inset-0 z-[8] overflow-hidden pointer-events-none"
        aria-hidden="true"
        animate={{ x: parallax.x * -DEPTH.fore, y: parallax.y * -DEPTH.fore }}
        transition={spring}
      >
        {/* Fireflies use offset timing so the scene never flashes in unison. */}
        {[
          { left: '13%', top: '42%', dx: 28, dy: -24, delay: 0 },
          { left: '32%', top: '34%', dx: -20, dy: -31, delay: 1.2 },
          { left: '58%', top: '43%', dx: 24, dy: -21, delay: 2.4 },
          { left: '76%', top: '36%', dx: -28, dy: -29, delay: 0.8 },
          { left: '90%', top: '48%', dx: -18, dy: -23, delay: 3.1 },
          { left: '44%', top: '54%', dx: 20, dy: -18, delay: 1.8 },
        ].map((firefly, index) => (
          <motion.span
            key={`${firefly.left}-${firefly.top}`}
            className="absolute h-1.5 w-1.5 rounded-full bg-[#FFF0A8] shadow-[0_0_12px_4px_rgba(255,217,102,0.72)]"
            style={{ left: firefly.left, top: firefly.top }}
            animate={isReducedMotion ? undefined : { x: [0, firefly.dx, firefly.dx * 0.35, 0], y: [0, firefly.dy, firefly.dy * 0.45, 0], opacity: [0.18, 1, 0.45, 0.18] }}
            transition={{ duration: 8 + index * 1.1, repeat: Infinity, ease: 'easeInOut', delay: firefly.delay }}
          />
        ))}

        <FallingLeaf left="12%" delay={0} duration={14} color="#E78A3B" />
        <FallingLeaf left="28%" delay={4} duration={17} color="#F0B34F" />
        <FallingLeaf left="64%" delay={7} duration={16} color="#C86839" />
        <FallingLeaf left="82%" delay={2} duration={18} color="#E9A440" />
        <FallingLeaf left="94%" delay={10} duration={15} color="#B95F35" />
      </motion.div>

      <div className="relative z-20 flex min-h-dvh flex-col">{children}</div>
    </div>
  );
}
