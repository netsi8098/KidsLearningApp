/**
 * SunnyMeadowWorld — the flagship homepage world.
 *
 * Built to the reference art direction rather than to "a gradient with shapes
 * on it". The techniques doing the work here are the ones that separate a
 * painted scene from clip art:
 *
 *   - atmospheric perspective: distant ridges lose saturation and contrast and
 *     shift toward the sky colour, so depth reads even though everything is flat
 *     vector
 *   - depth of field: foreground accents are blurred, which makes the midground
 *     resolve as "in focus" and pushes the hero forward
 *   - directed light: one sun, upper right. Every canopy, mound and bank carries
 *     a warm rim on its sun side and a cool shadow opposite
 *   - varied scale: elements repeat at several sizes rather than one, which is
 *     what stops a scene reading as stickers
 *
 * Layers (back to front): sky · distance · midground · hero stage · foreground
 * bank · foreground depth accents · ambient motion · content.
 */
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import type { WorldProps } from './types';
import SkyLife from '../SkyLife';
import { useSceneParallax, DEPTH } from '../useSceneParallax';
import { useMotionPreset } from '../../../motion/useMotionPreset';

/** Sun position, in %, drives every highlight and shadow in the scene. */
const SUN = { x: 78, y: 12 };

/** A dimensional tree: shadow side, lit side, rim, blossoms. */
function BlossomTree({
  scale = 1,
  hueShift = 0,
  blossom = '#FFC2DC',
}: { scale?: number; hueShift?: number; blossom?: string }) {
  // Distant trees desaturate toward the sky — atmospheric perspective.
  const dark = `hsl(${122 + hueShift}, 38%, ${30 + hueShift * 0.6}%)`;
  const mid = `hsl(${120 + hueShift}, 42%, ${40 + hueShift * 0.7}%)`;
  const lit = `hsl(${112 + hueShift}, 48%, ${52 + hueShift * 0.8}%)`;
  const rim = `hsl(${86 + hueShift}, 62%, ${68 + hueShift}%)`;

  return (
    <svg viewBox="0 0 140 190" className="w-full h-auto" style={{ transform: `scale(${scale})` }} fill="none">
      {/* Trunk with a lit edge on the sun side */}
      <path d="M62 190 L62 108 Q61 96 66 88 L76 88 Q81 96 80 108 L80 190 Z" fill="#7A5B3C" />
      <path d="M72 190 L72 108 Q72 97 75 90 L78 90 Q76 98 76 108 L76 190 Z" fill="#93704B" />
      <path d="M70 132 L48 116" stroke="#7A5B3C" strokeWidth="7" strokeLinecap="round" />
      <path d="M72 120 L96 104" stroke="#7A5B3C" strokeWidth="6" strokeLinecap="round" />

      {/* Canopy — shadow mass first, then lit mass offset toward the sun */}
      <ellipse cx="44" cy="74" rx="38" ry="33" fill={dark} />
      <ellipse cx="92" cy="66" rx="40" ry="35" fill={dark} />
      <ellipse cx="68" cy="44" rx="42" ry="36" fill={mid} />
      <ellipse cx="78" cy="38" rx="34" ry="28" fill={lit} />
      <ellipse cx="86" cy="30" rx="22" ry="17" fill={rim} opacity={0.85} />

      {/* Blossoms at three sizes so the cluster doesn't read as a stamp */}
      {[
        [40, 60, 5], [86, 44, 5.5], [64, 28, 4.5], [104, 70, 4],
        [28, 82, 4], [74, 82, 5], [52, 44, 3.4], [98, 52, 3.2],
        [34, 68, 2.6], [90, 78, 2.8], [58, 66, 2.4],
      ].map(([cx, cy, r], i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill={blossom} opacity={r > 4 ? 1 : 0.8} />
      ))}
    </svg>
  );
}

export default function SunnyMeadowWorld({ mascot, title, children }: WorldProps) {
  const par = useSceneParallax();
  const { isReducedMotion } = useMotionPreset();
  const spring = { type: 'spring' as const, stiffness: 55, damping: 20, mass: 0.9 };

  return (
    <div className="min-h-dvh relative overflow-hidden">
      {/* ═══ L0 — SKY ═══
          Warmer toward the horizon, cooler at zenith: the single cheapest way to
          make a flat gradient read as air rather than paint. */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg,
            #3E9BD8 0%, #58AEE4 10%, #79C4EE 22%, #9CD8F4 34%,
            #C3E9F7 46%, #DFF3F0 56%, #EDF6E4 64%, #F3F2D8 70%)`,
        }}
      />

      {/* ═══ L1 — DISTANCE ═══ */}
      <motion.div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        animate={{ x: par.x * -DEPTH.far, y: par.y * -DEPTH.far }}
        transition={spring}
      >
        {/* Sun disc + bloom */}
        <div
          className="absolute rounded-full"
          style={{
            left: `${SUN.x}%`, top: `${SUN.y}%`,
            width: 'min(18vw, 150px)', height: 'min(18vw, 150px)',
            transform: 'translate(-50%,-50%)',
            background: 'radial-gradient(circle, rgba(255,252,224,0.95) 0%, rgba(255,245,180,0.55) 32%, rgba(255,236,150,0.16) 62%, transparent 78%)',
          }}
        />
        <motion.div
          className="absolute rounded-full"
          style={{
            left: `${SUN.x}%`, top: `${SUN.y}%`,
            width: 'min(56vw, 520px)', height: 'min(56vw, 520px)',
            transform: 'translate(-50%,-50%)',
            background: 'radial-gradient(circle, rgba(255,248,205,0.34) 0%, rgba(255,240,170,0.12) 45%, transparent 72%)',
          }}
          animate={isReducedMotion ? undefined : { scale: [1, 1.06, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* God rays — long, very low opacity, rotating imperceptibly */}
        <motion.div
          className="absolute"
          style={{
            left: `${SUN.x}%`, top: `${SUN.y}%`, width: '160vw', height: '160vw',
            transform: 'translate(-50%,-50%)', transformOrigin: 'center',
            background: `repeating-conic-gradient(from 0deg,
              rgba(255,250,210,0.13) 0deg 4deg, transparent 4deg 17deg)`,
            maskImage: 'radial-gradient(circle, black 0%, transparent 62%)',
            WebkitMaskImage: 'radial-gradient(circle, black 0%, transparent 62%)',
          }}
          animate={isReducedMotion ? undefined : { rotate: [0, 360] }}
          transition={{ duration: 260, repeat: Infinity, ease: 'linear' }}
        />

        <SkyLife birdColor="rgba(52,74,104,0.38)" wispColor="rgba(255,255,255,0.66)" />

        {/* Rainbow — arcs fully inside the frame instead of clipping at the edge */}
        <svg className="absolute left-[3%] top-[6%] w-[46%] h-[38%]" viewBox="0 0 400 210" fill="none" preserveAspectRatio="xMidYMax meet">
          <defs>
            <linearGradient id="sm-rb" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#FF8FA8" /><stop offset="20%" stopColor="#FFB870" />
              <stop offset="40%" stopColor="#FFE98A" /><stop offset="60%" stopColor="#9BE08C" />
              <stop offset="80%" stopColor="#7FD0EC" /><stop offset="100%" stopColor="#BFA8F0" />
            </linearGradient>
          </defs>
          <g opacity="0.62">
            <path d="M24 210 A176 176 0 0 1 376 210" stroke="url(#sm-rb)" strokeWidth="17" strokeLinecap="round" />
            <path d="M40 210 A160 160 0 0 1 360 210" stroke="url(#sm-rb)" strokeWidth="8" strokeLinecap="round" opacity="0.5" />
          </g>
        </svg>

        {/* Three ridges, each hazier and bluer than the one in front —
            this is what actually creates distance. */}
        <svg className="absolute bottom-[41%] left-0 w-full h-[26%]" viewBox="0 0 400 110" preserveAspectRatio="none" fill="none">
          <path d="M0 110 L0 44 Q46 16 96 38 Q142 58 190 30 Q240 2 292 32 Q344 62 400 30 L400 110 Z" fill="#BFE0D6" opacity="0.62" />
        </svg>
        <svg className="absolute bottom-[37%] left-0 w-full h-[24%]" viewBox="0 0 400 100" preserveAspectRatio="none" fill="none">
          <path d="M0 100 L0 52 Q54 24 112 46 Q170 68 226 40 Q286 10 340 40 Q372 58 400 44 L400 100 Z" fill="#A6D8B8" opacity="0.78" />
        </svg>
        <svg className="absolute bottom-[33%] left-0 w-full h-[22%]" viewBox="0 0 400 92" preserveAspectRatio="none" fill="none">
          <path d="M0 92 L0 58 Q62 32 128 52 Q196 72 258 48 Q318 24 400 52 L400 92 Z" fill="#8CCB94" />
          {/* Distant treeline reads as texture, not individual trees */}
          <g fill="#78BC80" opacity="0.85">
            {Array.from({ length: 30 }, (_, i) => (
              <ellipse key={i} cx={8 + i * 13.6} cy={60 + ((i * 7) % 9)} rx={7} ry={5.5} />
            ))}
          </g>
        </svg>
      </motion.div>

      {/* ═══ L2 — MIDGROUND ═══ */}
      <motion.div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        animate={{ x: par.x * -DEPTH.mid, y: par.y * -DEPTH.mid }}
        transition={spring}
      >
        {/* Rolling meadow the hero sits on */}
        <svg className="absolute bottom-0 left-0 w-full h-[44%]" viewBox="0 0 400 180" preserveAspectRatio="none" fill="none">
          <path d="M0 180 L0 40 Q58 14 124 34 Q192 54 254 28 Q320 2 400 30 L400 180 Z" fill="#7FCB63" />
          <path d="M0 180 L0 40 Q58 14 124 34 Q192 54 254 28 Q320 2 400 30 L400 46 Q320 18 254 44 Q192 70 124 50 Q58 30 0 56 Z" fill="#93D977" opacity="0.75" />
          <path d="M0 180 L0 92 Q76 62 156 84 Q238 106 400 74 L400 180 Z" fill="#6FBE52" />
        </svg>

        {/* Mid-distance trees, smaller and hazier, placed off the hero axis */}
        <div className="absolute bottom-[34%] left-[16%] w-[13vw] max-w-[92px] opacity-80 hidden sm:block">
          <BlossomTree scale={1} hueShift={6} blossom="#FFD3E4" />
        </div>
        <div className="absolute bottom-[35%] right-[22%] w-[11vw] max-w-[78px] opacity-75 hidden sm:block">
          <BlossomTree scale={1} hueShift={9} blossom="#FFDCEA" />
        </div>

        {/* Framing trees. Anchored inward so canopies are never sliced by the
            viewport edge — the previous version cut both in half on desktop. */}
        <div className="absolute bottom-[7%] sm:bottom-[24%] left-[-2%] sm:left-[1%] md:left-[3%] w-[22vw] sm:w-[27vw] max-w-[188px]">
          <motion.div
            style={{ transformOrigin: 'bottom center' }}
            animate={isReducedMotion ? undefined : { rotate: [-1.1, 1.1, -1.1] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <BlossomTree />
          </motion.div>
        </div>
        <div className="absolute bottom-[6%] sm:bottom-[22%] right-[-2%] sm:right-[1%] md:right-[3%] w-[24vw] sm:w-[30vw] max-w-[208px]">
          <motion.div
            style={{ transformOrigin: 'bottom center' }}
            animate={isReducedMotion ? undefined : { rotate: [1.2, -1.2, 1.2] }}
            transition={{ duration: 9.5, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
          >
            <BlossomTree scale={1} blossom="#FFB7D5" />
          </motion.div>
        </div>

        {/* Bushes and flower clusters break up the flat green bands */}
        {[
          { l: '30%', b: '30%', w: 70, o: 1 },
          { l: '54%', b: '32%', w: 52, o: 0.9 },
          { l: '72%', b: '29%', w: 62, o: 1 },
          { l: '8%', b: '31%', w: 46, o: 0.85 },
        ].map((b, i) => (
          <svg key={`bush${i}`} className="absolute" style={{ left: b.l, bottom: b.b, width: b.w, opacity: b.o }} viewBox="0 0 80 38" fill="none">
            <ellipse cx="22" cy="27" rx="21" ry="13" fill="#4FA83D" />
            <ellipse cx="50" cy="25" rx="24" ry="15" fill="#5CBA47" />
            <ellipse cx="36" cy="17" rx="19" ry="13" fill="#6CCB55" />
            <ellipse cx="44" cy="13" rx="11" ry="7" fill="#84DC6A" opacity="0.8" />
          </svg>
        ))}

        {/* Scattered meadow flowers at varied scale */}
        {[
          { l: '12%', b: '26%', s: 1, c: '#FFFFFF' }, { l: '25%', b: '23%', s: 0.8, c: '#FFE66D' },
          { l: '41%', b: '27%', s: 0.9, c: '#FF8FAB' }, { l: '63%', b: '24%', s: 0.75, c: '#FFFFFF' },
          { l: '80%', b: '27%', s: 1, c: '#C3B1E1' }, { l: '90%', b: '23%', s: 0.7, c: '#FFE66D' },
        ].map((f, i) => (
          <svg key={`fl${i}`} className="absolute" style={{ left: f.l, bottom: f.b, width: 16 * f.s }} viewBox="0 0 16 16" fill="none">
            {[0, 72, 144, 216, 288].map((a) => (
              <ellipse key={a} cx={8 + Math.cos((a * Math.PI) / 180) * 4} cy={8 + Math.sin((a * Math.PI) / 180) * 4} rx="3" ry="3" fill={f.c} />
            ))}
            <circle cx="8" cy="8" r="2.4" fill="#FFC531" />
          </svg>
        ))}
      </motion.div>

      {/* ═══ L3 — HERO STAGE ═══
          The mound is lit from the sun side and drops a contact shadow, so the
          mascot reads as standing on ground rather than pasted over it. */}
      <div className="absolute bottom-[27%] left-1/2 -translate-x-1/2 flex flex-col items-center">
        <motion.div
          className="absolute rounded-full blur-3xl pointer-events-none"
          style={{
            width: '48vw', maxWidth: 280, height: '48vw', maxHeight: 280, top: '2%',
            background: 'radial-gradient(circle, rgba(255,236,170,0.34) 0%, rgba(255,214,120,0.12) 48%, transparent 74%)',
          }}
          animate={isReducedMotion ? undefined : { scale: [1, 1.07, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative z-[2]" style={{ marginBottom: '-18px' }}>
          {mascot}
        </div>

        <svg viewBox="0 0 300 96" className="w-[54vw] max-w-[300px] md:max-w-[360px] lg:max-w-[416px] relative z-[1]" fill="none">
          <defs>
            <radialGradient id="sm-grass" cx="62%" cy="24%" r="76%">
              <stop offset="0%" stopColor="#A8F09A" /><stop offset="46%" stopColor="#74D45C" />
              <stop offset="100%" stopColor="#3F9633" />
            </radialGradient>
            <linearGradient id="sm-soil" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#9A7350" /><stop offset="100%" stopColor="#6B4E33" />
            </linearGradient>
          </defs>
          {/* Contact shadow on the ground */}
          <ellipse cx="150" cy="86" rx="128" ry="10" fill="rgba(40,70,30,0.22)" />
          {/* Soil underside with a lit lip */}
          <path d="M14 40 Q34 74 84 80 Q150 88 216 80 Q266 74 286 40 Q222 62 150 62 Q78 62 14 40 Z" fill="url(#sm-soil)" />
          <path d="M22 44 Q46 66 96 72 Q150 78 204 72 Q254 66 278 44 Q214 60 150 60 Q86 60 22 44 Z" fill="#8A6742" opacity="0.55" />
          {/* Grass cap */}
          <ellipse cx="150" cy="36" rx="142" ry="30" fill="url(#sm-grass)" />
          {/* Warm rim on the sun side, cool shade opposite */}
          <path d="M150 6 Q244 6 290 32" stroke="#CDF7B4" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.7" />
          <path d="M14 34 Q56 58 118 63" stroke="#2F7A28" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.35" />
          {/* Grass tufts along the front edge */}
          <g stroke="#5FBF4A" strokeWidth="2.2" strokeLinecap="round">
            {Array.from({ length: 22 }, (_, i) => {
              const x = 18 + i * 12.4;
              const h = 5 + ((i * 5) % 7);
              return <path key={i} d={`M${x} 60 q2 -${h} 4 0`} />;
            })}
          </g>
          {/* Rocks and flowers give the cap scale */}
          <ellipse cx="66" cy="40" rx="9" ry="5" fill="#B9BCB2" />
          <ellipse cx="64" cy="38" rx="6" ry="3" fill="#D3D6CC" />
          <ellipse cx="238" cy="44" rx="7" ry="4" fill="#B9BCB2" />
          {[
            [48, 30, '#FF8FAB'], [96, 22, '#FFE66D'], [196, 24, '#FFFFFF'],
            [244, 32, '#C3B1E1'], [150, 18, '#FFFFFF'], [126, 34, '#FF8FAB'],
          ].map(([cx, cy, f], i) => (
            <g key={i}>
              <circle cx={cx as number} cy={cy as number} r="3.6" fill={f as string} />
              <circle cx={cx as number} cy={cy as number} r="1.4" fill="#FFC531" />
            </g>
          ))}
        </svg>

        {/* Title straddles the stage's front edge — part of the world, not a
            text column floating above it. */}
        <div
          className="relative z-[3] w-[92vw] max-w-[760px] flex justify-center px-2"
          style={{ marginTop: 'clamp(-42px, -4.2vw, -18px)' }}
        >
          {title}
        </div>
      </div>

      {/* ═══ L4 — FOREGROUND DEPTH ═══
          Blurred and oversized: this is the depth-of-field cue that makes the
          midground snap into focus. Hidden on phones, where it would only eat
          space the child needs. */}
      <motion.div
        className="absolute inset-0 overflow-hidden pointer-events-none hidden sm:block"
        style={{ zIndex: 30 }}
        animate={{ x: par.x * -DEPTH.fore, y: par.y * -DEPTH.fore }}
        transition={spring}
      >
        <div className="absolute bottom-[2%] -left-[4%] w-[22vw] max-w-[250px]" style={{ filter: 'blur(3.5px)', opacity: 0.92 }}>
          <svg viewBox="0 0 200 160" fill="none">
            <path d="M52 160 L52 96" stroke="#3E8F32" strokeWidth="7" strokeLinecap="round" />
            {[0, 72, 144, 216, 288].map((a) => (
              <ellipse key={a} cx={52 + Math.cos((a * Math.PI) / 180) * 26} cy={90 + Math.sin((a * Math.PI) / 180) * 26} rx="19" ry="19" fill="#FF9EC4" />
            ))}
            <circle cx="52" cy="90" r="13" fill="#FFD24A" />
            <path d="M128 160 L128 116" stroke="#3E8F32" strokeWidth="6" strokeLinecap="round" />
            {[0, 72, 144, 216, 288].map((a) => (
              <ellipse key={`b${a}`} cx={128 + Math.cos((a * Math.PI) / 180) * 19} cy={112 + Math.sin((a * Math.PI) / 180) * 19} rx="14" ry="14" fill="#FFFFFF" />
            ))}
            <circle cx="128" cy="112" r="9" fill="#FFC531" />
          </svg>
        </div>

        <div className="absolute bottom-[1%] -right-[3%] w-[21vw] max-w-[235px]" style={{ filter: 'blur(4px)', opacity: 0.9 }}>
          <svg viewBox="0 0 200 160" fill="none">
            <path d="M140 160 L140 100" stroke="#3E8F32" strokeWidth="7" strokeLinecap="round" />
            {[0, 72, 144, 216, 288].map((a) => (
              <ellipse key={a} cx={140 + Math.cos((a * Math.PI) / 180) * 25} cy={96 + Math.sin((a * Math.PI) / 180) * 25} rx="18" ry="18" fill="#FFD86B" />
            ))}
            <circle cx="140" cy="96" r="12" fill="#FF9E3D" />
            <ellipse cx="52" cy="146" rx="46" ry="26" fill="#4FA83D" />
            <ellipse cx="86" cy="152" rx="34" ry="20" fill="#5CBA47" />
          </svg>
        </div>

        {/* Blurred grass fringe along the very bottom */}
        <svg className="absolute bottom-0 left-0 w-full h-[7%]" viewBox="0 0 400 30" preserveAspectRatio="none" fill="none" style={{ filter: 'blur(2.5px)', opacity: 0.75 }}>
          <path d="M0 30 L0 18 Q14 4 26 18 Q40 2 54 18 Q68 6 82 18 Q96 2 110 18 Q124 6 138 18 Q152 2 166 18 Q180 6 194 18 Q208 2 222 18 Q236 6 250 18 Q264 2 278 18 Q292 6 306 18 Q320 2 334 18 Q348 6 362 18 Q376 2 390 18 L400 14 L400 30 Z" fill="#3E8F32" />
        </svg>
      </motion.div>

      {/* ═══ L5 — AMBIENT MOTION ═══ */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[
          { t: '26%', l: '14%', c: '#C3B1E1', s: 22, dur: 17, dx: 52, dy: -30 },
          { t: '36%', l: '68%', c: '#FFB86B', s: 18, dur: 20, dx: -44, dy: -22 },
          { t: '48%', l: '34%', c: '#FF8FAB', s: 16, dur: 23, dx: 38, dy: -34 },
          { t: '30%', l: '52%', c: '#FFFFFF', s: 14, dur: 26, dx: -30, dy: -26 },
        ].map((b, i) => (
          <motion.div
            key={`bf${i}`}
            className="absolute"
            style={{ top: b.t, left: b.l }}
            animate={isReducedMotion ? undefined : { x: [0, b.dx, b.dx * 0.4, 0], y: [0, b.dy, b.dy * 0.5, 0] }}
            transition={{ duration: b.dur, repeat: Infinity, ease: 'easeInOut', delay: i * 2.2 }}
          >
            <motion.svg
              width={b.s} height={b.s * 0.8} viewBox="0 0 24 20" fill="none"
              animate={isReducedMotion ? undefined : { scaleX: [1, 0.5, 1] }}
              transition={{ duration: 0.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ellipse cx="7" cy="8" rx="6.5" ry="7" fill={b.c} opacity="0.94" />
              <ellipse cx="17" cy="8" rx="6.5" ry="7" fill={b.c} opacity="0.94" />
              <ellipse cx="7" cy="14" rx="4.5" ry="4.5" fill={b.c} opacity="0.74" />
              <ellipse cx="17" cy="14" rx="4.5" ry="4.5" fill={b.c} opacity="0.74" />
              <rect x="11.2" y="5" width="1.6" height="13" rx="0.8" fill="#6B4E2E" />
            </motion.svg>
          </motion.div>
        ))}

        {/* Pollen catching the light */}
        {Array.from({ length: 12 }, (_, i) => ({
          l: `${6 + i * 8}%`, t: `${22 + ((i * 13) % 44)}%`,
          s: 2 + (i % 3), d: i * 0.55, dur: 3 + (i % 4),
        })).map((p, i) => (
          <motion.div
            key={`po${i}`}
            className="absolute rounded-full"
            style={{
              left: p.l, top: p.t, width: p.s * 2, height: p.s * 2,
              background: 'rgba(255,252,214,0.95)',
              boxShadow: `0 0 ${p.s * 5}px rgba(255,246,180,0.85)`,
            }}
            animate={isReducedMotion ? undefined : { opacity: [0.1, 0.85, 0.1], y: [0, -16, 0], scale: [0.7, 1.1, 0.7] }}
            transition={{ duration: p.dur + 2, repeat: Infinity, ease: 'easeInOut', delay: p.d }}
          />
        ))}
      </div>

      {/* ═══ L6 — CONTENT ═══ */}
      <div className="relative z-10 min-h-dvh flex flex-col">{children}</div>
    </div>
  );
}
