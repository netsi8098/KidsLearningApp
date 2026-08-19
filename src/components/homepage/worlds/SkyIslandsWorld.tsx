/**
 * SkyIslandsWorld — painted scenery with live, independently moving layers.
 *
 * The backplate contains environment only. The hero island, mascot, title,
 * balloon, rocket, cloud wisps and particles remain separate runtime layers so
 * the page keeps its depth and responds to pointer parallax without baking UI
 * into a wallpaper.
 */
import { motion } from 'framer-motion';
import type { WorldProps } from './types';
import { useMotionPreset } from '../../../motion/useMotionPreset';
import { DEPTH, useSceneParallax } from '../useSceneParallax';

const spring = { type: 'spring' as const, stiffness: 52, damping: 22, mass: 0.9 };

function Star({ left, top, size, delay }: { left: string; top: string; size: number; delay: number }) {
  const { isReducedMotion } = useMotionPreset();
  return (
    <motion.svg
      className="absolute"
      style={{ left, top, filter: 'drop-shadow(0 0 7px rgba(255,236,145,0.72))' }}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      animate={isReducedMotion ? undefined : { opacity: [0.35, 1, 0.35], scale: [0.82, 1.14, 0.82], rotate: [0, 9, 0] }}
      transition={{ duration: 2.8 + delay * 0.25, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      <path d="M12 1.5L14.5 8.7L22 12L14.5 15.3L12 22.5L9.5 15.3L2 12L9.5 8.7Z" fill="#FFF1A8" />
    </motion.svg>
  );
}

function HotAirBalloon() {
  const { isReducedMotion } = useMotionPreset();
  return (
    <motion.div
      className="absolute left-[7%] top-[8%] z-[6] hidden sm:block"
      aria-hidden="true"
      animate={isReducedMotion ? undefined : { y: [0, -13, 0], x: [0, 7, 0], rotate: [-1.8, 1.8, -1.8] }}
      transition={{ duration: 8.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      <svg width="72" height="104" viewBox="0 0 72 104" fill="none" style={{ filter: 'drop-shadow(0 10px 12px rgba(57,66,130,0.24))' }}>
        <defs>
          <linearGradient id="balloon-pink" x1="8" y1="4" x2="58" y2="62" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFC8EB" />
            <stop offset="1" stopColor="#E56DC4" />
          </linearGradient>
          <linearGradient id="balloon-gold" x1="20" y1="2" x2="50" y2="64" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFF2A8" />
            <stop offset="1" stopColor="#F4A943" />
          </linearGradient>
        </defs>
        <path d="M36 3C55 3 66 16 64 34C62 51 51 61 36 71C21 61 10 51 8 34C6 16 17 3 36 3Z" fill="url(#balloon-pink)" stroke="rgba(255,255,255,.7)" strokeWidth="2" />
        <path d="M36 3C45 5 49 18 48 35C47 51 42 62 36 71C30 62 25 51 24 35C23 18 27 5 36 3Z" fill="url(#balloon-gold)" opacity="0.95" />
        <path d="M36 3C40 7 41 20 40 36C40 51 38 63 36 71C34 63 32 51 32 36C31 20 32 7 36 3Z" fill="#8ADAF5" opacity="0.92" />
        <path d="M27 70L25 82M45 70L47 82" stroke="#856347" strokeWidth="2" />
        <path d="M22 81H50L46 99H26L22 81Z" fill="#B9864F" />
        <path d="M27 84H45" stroke="#E7BC7B" strokeWidth="2" />
      </svg>
    </motion.div>
  );
}

function Rocket() {
  const { isReducedMotion } = useMotionPreset();
  if (isReducedMotion) return null;

  return (
    <motion.div
      className="absolute z-[7] pointer-events-none"
      style={{ left: '-16%', top: '19%' }}
      aria-hidden="true"
      animate={{ x: ['0vw', '126vw'], y: [28, -8, 18, -24, 4], rotate: [-9, -3, 6, -5] }}
      transition={{ duration: 18, repeat: Infinity, ease: 'linear', repeatDelay: 3 }}
    >
      <svg width="86" height="50" viewBox="0 0 86 50" fill="none" style={{ filter: 'drop-shadow(0 7px 9px rgba(68,79,151,0.28))' }}>
        <motion.path
          d="M4 25L25 17V33L4 25Z"
          fill="#FFD56F"
          animate={{ scaleX: [0.8, 1.15, 0.9] }}
          transition={{ duration: 0.42, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '25px 25px' }}
        />
        <path d="M24 25C35 10 56 7 76 21C79 23 79 27 76 29C56 43 35 40 24 25Z" fill="#FFF8F0" stroke="rgba(255,255,255,.85)" strokeWidth="2" />
        <path d="M76 21C82 23 84 25 76 29L67 34V16L76 21Z" fill="#FF79A8" />
        <circle cx="54" cy="25" r="8" fill="#78CEF1" stroke="#9B7BE8" strokeWidth="3" />
        <path d="M43 15L34 5L38 18Z" fill="#FF79A8" />
        <path d="M43 35L34 45L38 32Z" fill="#FF79A8" />
      </svg>
    </motion.div>
  );
}

export default function SkyIslandsWorld({ mascot, title, children }: WorldProps) {
  const parallax = useSceneParallax();
  const { isReducedMotion } = useMotionPreset();

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#79B8F4]">
      {/* Painted environment only: no mascot, title, cards or controls. */}
      <motion.img
        src="/assets/worlds/sky-islands/backplate.webp"
        alt=""
        aria-hidden="true"
        draggable={false}
        className="absolute -inset-[2%] h-[104%] w-[104%] max-w-none select-none object-cover"
        style={{ objectPosition: 'center 50%' }}
        animate={{ x: parallax.x * -DEPTH.far, y: parallax.y * -DEPTH.far }}
        transition={spring}
      />

      {/* Atmospheric veil keeps the central live character legible over every crop. */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(circle at 50% 37%, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0.08) 24%, transparent 48%), linear-gradient(180deg, transparent 58%, rgba(105,90,185,0.12) 100%)',
        }}
      />

      {/* Far cloud layers move at different rates, creating depth around the plate. */}
      <motion.div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        aria-hidden="true"
        animate={{ x: parallax.x * -DEPTH.mid, y: parallax.y * -DEPTH.mid }}
        transition={spring}
      >
        {[{ top: '22%', size: 118, duration: 62, opacity: 0.34 }, { top: '47%', size: 88, duration: 78, opacity: 0.26 }].map((cloud, index) => (
          <motion.div
            key={cloud.top}
            className="absolute -left-32"
            style={{ top: cloud.top, opacity: cloud.opacity, filter: 'blur(1px)' }}
            animate={isReducedMotion ? undefined : { x: ['-5vw', '135vw'] }}
            transition={{ duration: cloud.duration, repeat: Infinity, ease: 'linear', delay: index * 14 }}
          >
            <svg width={cloud.size} height={cloud.size * 0.46} viewBox="0 0 140 64" fill="none">
              <ellipse cx="38" cy="42" rx="34" ry="18" fill="white" />
              <ellipse cx="73" cy="29" rx="31" ry="25" fill="white" />
              <ellipse cx="106" cy="43" rx="30" ry="17" fill="white" />
            </svg>
          </motion.div>
        ))}
      </motion.div>

      <HotAirBalloon />
      <Rocket />

      {/* The island, mascot and title travel as one unit. The lion never floats
          independently from its contact surface. */}
      <motion.div
        className="absolute z-[14] bottom-[25%] sm:bottom-[28%] md:bottom-[25%] left-1/2 w-[92vw] max-w-[640px] -translate-x-1/2"
        animate={isReducedMotion ? undefined : { y: [0, -3, 0] }}
        transition={{ duration: 7.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <motion.div
          className="absolute left-1/2 top-[31%] h-[42%] w-[70%] -translate-x-1/2 rounded-full blur-2xl"
          aria-hidden="true"
          style={{ background: 'radial-gradient(ellipse, rgba(255,239,164,0.42), rgba(181,154,255,0.12) 55%, transparent 76%)' }}
          animate={isReducedMotion ? undefined : { opacity: [0.62, 0.92, 0.62], scale: [0.97, 1.04, 0.97] }}
          transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative aspect-[3/2] w-full">
          <img
            src="/assets/worlds/sky-islands/stage.webp"
            alt=""
            aria-hidden="true"
            draggable={false}
            className="absolute inset-0 h-full w-full select-none object-contain drop-shadow-[0_22px_20px_rgba(74,71,142,0.30)]"
          />

          <div className="absolute left-1/2 top-[29%] z-[2] -translate-x-1/2 -translate-y-[79%]">
            {mascot}
          </div>

          <div className="absolute left-1/2 top-[45%] z-[3] flex w-[96vw] max-w-[760px] -translate-x-1/2 justify-center px-2">
            {title}
          </div>
        </div>
      </motion.div>

      {/* Foreground stars and drifting dust sit in front of the hero. */}
      <motion.div
        className="absolute inset-0 z-[8] overflow-hidden pointer-events-none"
        aria-hidden="true"
        animate={{ x: parallax.x * -DEPTH.fore, y: parallax.y * -DEPTH.fore }}
        transition={spring}
      >
        <Star left="9%" top="18%" size={18} delay={0.2} />
        <Star left="26%" top="11%" size={12} delay={1.1} />
        <Star left="72%" top="16%" size={15} delay={1.8} />
        <Star left="88%" top="34%" size={19} delay={0.7} />
        <Star left="18%" top="48%" size={10} delay={2.3} />
        <Star left="78%" top="53%" size={11} delay={1.4} />

        {[
          { left: '12%', top: '38%', duration: 16, delay: 0 },
          { left: '42%', top: '20%', duration: 19, delay: 4 },
          { left: '66%', top: '42%', duration: 21, delay: 7 },
          { left: '84%', top: '26%', duration: 18, delay: 2 },
        ].map((mote) => (
          <motion.span
            key={`${mote.left}-${mote.top}`}
            className="absolute h-1.5 w-1.5 rounded-full bg-white/80 shadow-[0_0_9px_rgba(255,255,255,0.92)]"
            style={{ left: mote.left, top: mote.top }}
            animate={isReducedMotion ? undefined : { y: [0, -24, 8, 0], x: [0, 12, -8, 0], opacity: [0.12, 0.86, 0.4, 0.12] }}
            transition={{ duration: mote.duration, repeat: Infinity, ease: 'easeInOut', delay: mote.delay }}
          />
        ))}
      </motion.div>

      <div className="relative z-20 flex min-h-dvh flex-col">{children}</div>
    </div>
  );
}
