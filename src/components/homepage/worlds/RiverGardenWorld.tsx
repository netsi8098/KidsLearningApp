/** RiverGardenWorld — painted garden depth plus live water and character layers. */
import { motion } from 'framer-motion';
import type { WorldProps } from './types';
import { useMotionPreset } from '../../../motion/useMotionPreset';
import { DEPTH, useSceneParallax } from '../useSceneParallax';

const spring = { type: 'spring' as const, stiffness: 52, damping: 22, mass: 0.9 };

function SwimmingFish({ color, top, delay, duration, reverse = false }: { color: string; top: string; delay: number; duration: number; reverse?: boolean }) {
  const { isReducedMotion } = useMotionPreset();
  if (isReducedMotion) return null;
  const start = reverse ? '108vw' : '-14vw';
  const end = reverse ? '-14vw' : '108vw';

  return (
    <motion.div
      className="absolute z-[6]"
      style={{ top, left: 0, scaleX: reverse ? -1 : 1, opacity: 0.74 }}
      aria-hidden="true"
      animate={{ x: [start, end], y: [0, -7, 5, -3, 0] }}
      transition={{ duration, repeat: Infinity, ease: 'linear', delay }}
    >
      <svg width="48" height="28" viewBox="0 0 48 28" fill="none">
        <path d="M38 14L47 5V23L38 14Z" fill={color} />
        <ellipse cx="24" cy="14" rx="16" ry="10" fill={color} />
        <path d="M21 7C26 9 28 11 30 14" stroke="rgba(255,255,255,.45)" strokeWidth="2" strokeLinecap="round" />
        <circle cx="15" cy="11" r="2.2" fill="#263A4A" />
        <circle cx="14.3" cy="10.3" r="0.75" fill="white" />
      </svg>
    </motion.div>
  );
}

export default function RiverGardenWorld({ mascot, title, children }: WorldProps) {
  const parallax = useSceneParallax();
  const { isReducedMotion } = useMotionPreset();

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#76D4E7]">
      <motion.img
        src="/assets/worlds/river-garden/backplate.webp"
        alt=""
        aria-hidden="true"
        draggable={false}
        className="absolute -inset-[2%] h-[104%] w-[104%] max-w-none select-none object-cover"
        style={{ objectPosition: 'center 52%' }}
        animate={{ x: parallax.x * -DEPTH.far, y: parallax.y * -DEPTH.far }}
        transition={spring}
      />

      {/* Moving caustics make the river read as liquid, not a blue band. */}
      <motion.div
        className="absolute inset-x-[-12%] top-[46%] h-[31%] rotate-[-2deg] pointer-events-none mix-blend-screen"
        aria-hidden="true"
        style={{
          opacity: 0.28,
          background: 'repeating-linear-gradient(174deg, transparent 0 18px, rgba(255,255,255,0.42) 20px 22px, transparent 24px 42px)',
          filter: 'blur(1px)',
        }}
        animate={isReducedMotion ? undefined : { x: ['-4%', '5%', '-4%'], opacity: [0.18, 0.34, 0.18] }}
        transition={{ duration: 7.2, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="absolute inset-0 z-[5] overflow-hidden pointer-events-none"
        aria-hidden="true"
        animate={{ x: parallax.x * -DEPTH.mid, y: parallax.y * -DEPTH.mid }}
        transition={spring}
      >
        {/* Expanding ripple rings around the middle waterline. */}
        {[
          { left: '18%', top: '59%', delay: 0 },
          { left: '73%', top: '62%', delay: 1.9 },
          { left: '47%', top: '69%', delay: 3.5 },
        ].map((ripple) => (
          <motion.span
            key={`${ripple.left}-${ripple.top}`}
            className="absolute h-5 w-12 rounded-[50%] border border-white/60"
            style={{ left: ripple.left, top: ripple.top }}
            animate={isReducedMotion ? undefined : { scale: [0.45, 1.9], opacity: [0.72, 0] }}
            transition={{ duration: 3.8, repeat: Infinity, ease: 'easeOut', delay: ripple.delay }}
          />
        ))}
        <SwimmingFish color="#FF8A4C" top="57%" delay={0} duration={19} />
        <SwimmingFish color="#6B8EF5" top="66%" delay={6} duration={23} reverse />
      </motion.div>

      {/* Island, lion and title share a single coordinate system. */}
      <div className="absolute z-[14] bottom-[24%] sm:bottom-[27%] md:bottom-[24%] left-1/2 w-[94vw] max-w-[650px] -translate-x-1/2">
        <motion.div
          className="absolute left-1/2 top-[31%] h-[38%] w-[64%] -translate-x-1/2 rounded-full blur-2xl"
          aria-hidden="true"
          style={{ background: 'radial-gradient(ellipse, rgba(255,243,177,0.38), rgba(99,221,207,0.12) 58%, transparent 76%)' }}
          animate={isReducedMotion ? undefined : { opacity: [0.62, 0.92, 0.62], scale: [0.98, 1.04, 0.98] }}
          transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative aspect-[3/2] w-full">
          <img
            src="/assets/worlds/river-garden/stage.webp"
            alt=""
            aria-hidden="true"
            draggable={false}
            className="absolute inset-0 h-full w-full select-none object-contain drop-shadow-[0_18px_17px_rgba(27,113,112,0.24)]"
            /* stage.webp was never produced for this world. Without a handler
               the browser paints a broken-image box with a border exactly where
               the island should be — visible on the live homepage. Hide it
               until the plate exists; the backplate still carries the scene. */
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
          <div className="absolute left-1/2 top-[30%] z-[2] -translate-x-1/2 -translate-y-[77%]">
            {mascot}
          </div>
          <div className="absolute left-1/2 top-[47%] z-[3] flex w-[96vw] max-w-[760px] -translate-x-1/2 justify-center px-2">
            {title}
          </div>
        </div>
      </div>

      <motion.div
        className="absolute inset-0 z-[9] overflow-hidden pointer-events-none"
        aria-hidden="true"
        animate={{ x: parallax.x * -DEPTH.fore, y: parallax.y * -DEPTH.fore }}
        transition={spring}
      >
        {/* Glass bubbles keep their highlights fixed while their paths drift. */}
        {[
          { left: '10%', top: '38%', size: 30, delay: 0, duration: 13 },
          { left: '28%', top: '54%', size: 18, delay: 3, duration: 15 },
          { left: '67%', top: '40%', size: 24, delay: 6, duration: 14 },
          { left: '87%', top: '56%', size: 34, delay: 1.5, duration: 17 },
        ].map((bubble) => (
          <motion.span
            key={`${bubble.left}-${bubble.top}`}
            className="absolute rounded-full border border-white/65"
            style={{
              left: bubble.left,
              top: bubble.top,
              width: bubble.size,
              height: bubble.size,
              background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.9) 0 6%, rgba(255,255,255,0.22) 12%, rgba(120,220,242,0.08) 58%, rgba(255,255,255,0.24) 100%)',
              boxShadow: 'inset -3px -4px 8px rgba(96,173,215,0.16), 0 5px 12px rgba(44,144,157,0.13)',
            }}
            animate={isReducedMotion ? undefined : { y: [0, -45, -74], x: [0, 12, -6], opacity: [0, 0.82, 0] }}
            transition={{ duration: bubble.duration, repeat: Infinity, ease: 'easeInOut', delay: bubble.delay }}
          />
        ))}

        {[
          { left: '16%', top: '24%', delay: 0 },
          { left: '39%', top: '17%', delay: 1.1 },
          { left: '76%', top: '28%', delay: 2.2 },
          { left: '91%', top: '18%', delay: 0.7 },
        ].map((sparkle) => (
          <motion.span
            key={`${sparkle.left}-${sparkle.top}`}
            className="absolute h-2 w-2 rotate-45 rounded-[2px] bg-white shadow-[0_0_10px_rgba(255,255,255,0.95)]"
            style={{ left: sparkle.left, top: sparkle.top }}
            animate={isReducedMotion ? undefined : { scale: [0.35, 1, 0.35], opacity: [0.15, 0.9, 0.15], rotate: [35, 55, 35] }}
            transition={{ duration: 2.8 + sparkle.delay, repeat: Infinity, ease: 'easeInOut', delay: sparkle.delay }}
          />
        ))}
      </motion.div>

      <div className="relative z-20 flex min-h-dvh flex-col">{children}</div>
    </div>
  );
}
