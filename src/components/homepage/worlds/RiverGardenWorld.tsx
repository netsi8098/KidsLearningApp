/**
 * RiverGardenWorld — storybook water garden.
 *
 * Rebuilt with the flagship technique set (atmospheric perspective, depth of
 * field, directed light, varied scale, grounded stage) plus the thing this world
 * was missing entirely: **water as a material**. The previous version read as a
 * green meadow with a teal band — no river, no waterfall, no stepping stones,
 * none of the reference's defining features.
 *
 * Water is built from five stacked cues, because any one alone reads as paint:
 *   depth gradient · surface shimmer · ripple rings around obstructions ·
 *   a blurred inverted reflection of the island · drifting life beneath
 *
 * Layers: sky · distance · midground+waterfall · water · hero island ·
 * foreground stones & planting · ambient motion · content.
 */
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import type { WorldProps } from './types';
import SkyLife from '../SkyLife';
import { useSceneParallax, DEPTH } from '../useSceneParallax';
import { useMotionPreset } from '../../../motion/useMotionPreset';

/** Sun sits upper-left here, so every highlight leans the opposite way to Meadow. */
const SUN = { x: 24, y: 12 };

/** Rounded storybook tree — dimensional mass, lit crown, cool underside. */
function GardenTree({ scale = 1, haze = 0 }: { scale?: number; haze?: number }) {
  const dark = `hsl(${146 - haze}, ${44 - haze}%, ${26 + haze * 1.1}%)`;
  const mid = `hsl(${142 - haze}, ${46 - haze}%, ${36 + haze * 1.2}%)`;
  const lit = `hsl(${128 - haze}, ${52 - haze}%, ${48 + haze * 1.2}%)`;
  const rim = `hsl(${96 - haze}, ${62 - haze}%, ${64 + haze}%)`;

  return (
    <svg viewBox="0 0 150 200" className="w-full h-auto" style={{ transform: `scale(${scale})` }} fill="none">
      <path d="M66 200 L66 116 Q64 104 70 96 L82 96 Q88 104 86 116 L86 200 Z" fill="#6E5238" />
      <path d="M78 200 L78 116 Q78 105 82 98 L86 98 Q83 106 83 116 L83 200 Z" fill="#8A6A48" />
      {/* Canopy: three overlapping masses, light biased to the sun side (left) */}
      <ellipse cx="96" cy="76" rx="40" ry="35" fill={dark} />
      <ellipse cx="52" cy="68" rx="42" ry="37" fill={mid} />
      <ellipse cx="74" cy="42" rx="44" ry="37" fill={lit} />
      <ellipse cx="60" cy="34" rx="28" ry="21" fill={rim} opacity="0.9" />
      {/* Leaf clumps give the silhouette bite instead of a smooth blob */}
      {[[38, 52, 13], [102, 58, 12], [74, 20, 11], [30, 78, 10], [110, 82, 9], [88, 34, 9]].map(([cx, cy, r], i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill={i % 2 ? lit : mid} opacity={0.85} />
      ))}
    </svg>
  );
}

export default function RiverGardenWorld({ mascot, title, children }: WorldProps) {
  const par = useSceneParallax();
  const { isReducedMotion } = useMotionPreset();
  const spring = { type: 'spring' as const, stiffness: 55, damping: 20, mass: 0.9 };

  return (
    <div className="min-h-dvh relative overflow-hidden">
      {/* ═══ L0 — SKY ═══ */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg,
            #4FA8DC 0%, #6BBCE8 10%, #8CD0F0 21%, #ADE0F5 32%,
            #CBECF6 42%, #E2F4EE 50%, #EDF7E6 56%)`,
        }}
      />

      {/* ═══ L1 — DISTANCE ═══ */}
      <motion.div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        animate={{ x: par.x * -DEPTH.far, y: par.y * -DEPTH.far }}
        transition={spring}
      >
        <div
          className="absolute rounded-full"
          style={{
            left: `${SUN.x}%`, top: `${SUN.y}%`,
            width: 'min(15vw, 130px)', height: 'min(15vw, 130px)',
            transform: 'translate(-50%,-50%)',
            background: 'radial-gradient(circle, rgba(255,253,232,0.9) 0%, rgba(255,247,196,0.5) 34%, rgba(255,240,170,0.14) 62%, transparent 78%)',
          }}
        />
        <motion.div
          className="absolute rounded-full"
          style={{
            left: `${SUN.x}%`, top: `${SUN.y}%`,
            width: 'min(52vw, 480px)', height: 'min(52vw, 480px)',
            transform: 'translate(-50%,-50%)',
            background: 'radial-gradient(circle, rgba(255,250,215,0.3) 0%, rgba(255,242,180,0.1) 46%, transparent 72%)',
          }}
          animate={isReducedMotion ? undefined : { scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />

        <SkyLife birdColor="rgba(46,82,96,0.34)" wispColor="rgba(255,255,255,0.62)" />

        {/* Rainbow arcs into the upper right, fully inside the frame */}
        <svg className="absolute right-[3%] top-[7%] w-[44%] h-[38%]" viewBox="0 0 400 210" fill="none" preserveAspectRatio="xMidYMax meet">
          <defs>
            <linearGradient id="rg-rb" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#FF8FA8" /><stop offset="20%" stopColor="#FFB870" />
              <stop offset="40%" stopColor="#FFE98A" /><stop offset="60%" stopColor="#9BE08C" />
              <stop offset="80%" stopColor="#7FD0EC" /><stop offset="100%" stopColor="#BFA8F0" />
            </linearGradient>
          </defs>
          <g opacity="0.58">
            <path d="M24 210 A176 176 0 0 1 376 210" stroke="url(#rg-rb)" strokeWidth="16" strokeLinecap="round" />
            <path d="M40 210 A160 160 0 0 1 360 210" stroke="url(#rg-rb)" strokeWidth="7" strokeLinecap="round" opacity="0.5" />
          </g>
        </svg>

        {/* Hazy ridges — distance through desaturation, not just scale */}
        <svg className="absolute bottom-[46%] left-0 w-full h-[24%]" viewBox="0 0 400 100" preserveAspectRatio="none" fill="none">
          <path d="M0 100 L0 42 Q52 14 108 36 Q164 58 218 30 Q276 0 330 30 Q366 50 400 34 L400 100 Z" fill="#C2E4DA" opacity="0.6" />
        </svg>
        <svg className="absolute bottom-[42%] left-0 w-full h-[22%]" viewBox="0 0 400 92" preserveAspectRatio="none" fill="none">
          <path d="M0 92 L0 52 Q58 26 120 46 Q184 66 244 42 Q306 18 400 46 L400 92 Z" fill="#A5D9BE" opacity="0.8" />
          <g fill="#95CFAE" opacity="0.8">
            {Array.from({ length: 26 }, (_, i) => (
              <ellipse key={i} cx={10 + i * 15.6} cy={58 + ((i * 5) % 8)} rx={8} ry={6} />
            ))}
          </g>
        </svg>
      </motion.div>

      {/* ═══ L2 — MIDGROUND: BANKS, TREES, WATERFALL ═══ */}
      <motion.div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        animate={{ x: par.x * -DEPTH.mid, y: par.y * -DEPTH.mid }}
        transition={spring}
      >
        {/* Far bank — its shoreline is a curve that overlaps the water's top
            edge, so the river meets land instead of ending at a ruled line. */}
        <svg className="absolute bottom-[36%] left-0 w-full h-[26%]" viewBox="0 0 400 110" preserveAspectRatio="none" fill="none">
          <path d="M0 110 L0 34 Q66 12 134 30 Q204 48 266 26 Q330 4 400 28 L400 110 Z" fill="#6FBF66" />
          <path d="M0 42 Q66 20 134 38 Q204 56 266 34 Q330 12 400 36" stroke="#93DA84" strokeWidth="4" fill="none" opacity="0.75" />
          {/* Shoreline: scalloped edge with a wet lip catching the light */}
          <path d="M0 110 L0 88 Q40 96 76 88 Q118 79 158 90 Q202 102 244 90 Q290 77 332 89 Q368 99 400 90 L400 110 Z" fill="#5CAF52" />
          <path d="M0 88 Q40 96 76 88 Q118 79 158 90 Q202 102 244 90 Q290 77 332 89 Q368 99 400 90" stroke="#C9F0D2" strokeWidth="3" fill="none" opacity="0.7" />
        </svg>

        {/* NOTE — waterfall removed deliberately.
           Four code attempts (bare sheet, rock walls, irregular outcrop, raised
           grassy ledge) all read as a pale slab or a brown block stuck to the
           hillside: a convincing fall needs a believable elevation change, and
           flat vector shapes at this scale could not sell one. A feature that
           does not read is worse than its absence, so the river itself carries
           the water-garden identity via shoreline, shallows, shimmer, lily pads,
           fish, bubbles and stepping stones.
           This is the one reference feature that wants real art —
           see public/assets/worlds/river-garden/ (midground.webp). */}

        {/* Trees at four depths — hazier ones sit further back */}
        <div className="absolute bottom-[38%] left-[26%] w-[11vw] max-w-[74px] opacity-70 hidden sm:block">
          <GardenTree haze={16} />
        </div>
        <div className="absolute bottom-[39%] right-[30%] w-[10vw] max-w-[66px] opacity-65 hidden sm:block">
          <GardenTree haze={20} />
        </div>
        <div className="absolute bottom-[8%] sm:bottom-[24%] left-[-3%] sm:left-[19%] md:left-[21%] w-[23vw] sm:w-[22vw] max-w-[160px]">
          <motion.div
            style={{ transformOrigin: 'bottom center' }}
            animate={isReducedMotion ? undefined : { rotate: [-1, 1, -1] }}
            transition={{ duration: 8.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <GardenTree />
          </motion.div>
        </div>
        <div className="absolute bottom-[7%] sm:bottom-[25%] right-[-3%] sm:right-[0%] w-[25vw] sm:w-[29vw] max-w-[205px]">
          <motion.div
            style={{ transformOrigin: 'bottom center' }}
            animate={isReducedMotion ? undefined : { rotate: [1.1, -1.1, 1.1] }}
            transition={{ duration: 9.5, repeat: Infinity, ease: 'easeInOut', delay: 1.4 }}
          >
            <GardenTree scale={1} haze={4} />
          </motion.div>
        </div>
      </motion.div>

      {/* ═══ L3 — WATER ═══
          Depth gradient, then surface cues layered on top. */}
      <div className="absolute bottom-0 left-0 right-0 h-[46%] pointer-events-none overflow-hidden">
        {/* Water body with a curved shoreline rather than a ruled edge */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 190" preserveAspectRatio="none" fill="none">
          <defs>
            <linearGradient id="rg-water" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7FD4D0" /><stop offset="16%" stopColor="#5FC3C6" />
              <stop offset="38%" stopColor="#45B3BE" /><stop offset="62%" stopColor="#35A2B4" />
              <stop offset="100%" stopColor="#2B90A6" />
            </linearGradient>
          </defs>
          <path d="M0 190 L0 34 Q42 20 84 30 Q128 41 172 28 Q220 14 266 27 Q314 41 356 28 Q380 21 400 30 L400 190 Z" fill="url(#rg-water)" />
          {/* Wet lip where land meets water */}
          <path d="M0 34 Q42 20 84 30 Q128 41 172 28 Q220 14 266 27 Q314 41 356 28 Q380 21 400 30"
                stroke="rgba(255,255,255,0.55)" strokeWidth="2.5" fill="none" />
          {/* Shallows: a lighter band hugging the shoreline */}
          <path d="M0 44 Q42 30 84 40 Q128 51 172 38 Q220 24 266 37 Q314 51 356 38 Q380 31 400 40 L400 30 Q380 21 356 28 Q314 41 266 27 Q220 14 172 28 Q128 41 84 30 Q42 20 0 34 Z"
                fill="#9BE2DA" opacity="0.5" />
        </svg>
        {/* Sun glitter path — brightest directly under the sun */}
        <div
          className="absolute inset-y-0"
          style={{
            left: `${SUN.x - 14}%`, width: '30%',
            background: 'linear-gradient(180deg, rgba(255,255,240,0.34) 0%, rgba(255,255,240,0.08) 60%, transparent 100%)',
            filter: 'blur(10px)',
          }}
        />
        {/* Surface shimmer — short bright dashes drifting sideways */}
        {Array.from({ length: 16 }, (_, i) => ({
          l: `${(i * 6.4) % 96}%`, t: `${8 + ((i * 17) % 74)}%`,
          w: 18 + ((i * 11) % 40), d: (i % 7) * 0.42, dur: 2.6 + (i % 5) * 0.4,
        })).map((sh, i) => (
          <motion.div
            key={`sh${i}`}
            className="absolute rounded-full"
            style={{ left: sh.l, top: sh.t, width: sh.w, height: 2, background: 'rgba(255,255,255,0.6)' }}
            animate={isReducedMotion ? undefined : { x: [0, 16, 0], opacity: [0.08, 0.7, 0.08], scaleX: [0.8, 1.15, 0.8] }}
            transition={{ duration: sh.dur, repeat: Infinity, ease: 'easeInOut', delay: sh.d }}
          />
        ))}
        {/* Lily pads at varied scale, some with a bloom */}
        {[
          { l: '12%', t: '46%', s: 1, f: true }, { l: '30%', t: '66%', s: 0.7, f: false },
          { l: '68%', t: '52%', s: 0.85, f: true }, { l: '84%', t: '72%', s: 0.6, f: false },
          { l: '48%', t: '78%', s: 0.75, f: false },
        ].map((lp, i) => (
          <motion.svg
            key={`lp${i}`}
            className="absolute" style={{ left: lp.l, top: lp.t, width: 46 * lp.s }}
            viewBox="0 0 46 34" fill="none"
            animate={isReducedMotion ? undefined : { y: [0, -2.5, 0], rotate: [-2, 2, -2] }}
            transition={{ duration: 5 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.7 }}
          >
            <path d="M23 4 A17 13 0 1 1 22 4 L23 17 Z" fill="#4CA85C" />
            <path d="M23 6 A15 11 0 0 1 36 15" stroke="#6FC97C" strokeWidth="2.4" fill="none" opacity="0.8" />
            {lp.f && <><circle cx="30" cy="10" r="5" fill="#FFB7D5" /><circle cx="30" cy="10" r="2" fill="#FFE66D" /></>}
          </motion.svg>
        ))}
      </div>

      {/* ═══ L4 — HERO ISLAND ═══ */}
      <div className="absolute bottom-[27%] left-1/2 -translate-x-1/2 flex flex-col items-center">
        <motion.div
          className="absolute rounded-full blur-3xl pointer-events-none"
          style={{
            width: '48vw', maxWidth: 280, height: '48vw', maxHeight: 280, top: '2%',
            background: 'radial-gradient(circle, rgba(255,240,190,0.3) 0%, rgba(190,240,230,0.12) 48%, transparent 74%)',
          }}
          animate={isReducedMotion ? undefined : { scale: [1, 1.06, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative z-[2]" style={{ marginBottom: '-18px' }}>
          {mascot}
        </div>

        <svg viewBox="0 0 300 108" className="w-[54vw] max-w-[300px] md:max-w-[360px] lg:max-w-[416px] relative z-[1]" fill="none">
          <defs>
            <radialGradient id="rg-grass" cx="38%" cy="24%" r="76%">
              <stop offset="0%" stopColor="#A6EE96" /><stop offset="48%" stopColor="#6FCE58" />
              <stop offset="100%" stopColor="#3C9331" />
            </radialGradient>
            <linearGradient id="rg-rock" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#9E8B76" /><stop offset="100%" stopColor="#6B5B4A" />
            </linearGradient>
          </defs>
          {/* Reflection: the island mirrored, blurred and faint, sitting in the
              water. This is the cue that most sells "it is floating in a river". */}
          <ellipse cx="150" cy="98" rx="126" ry="12" fill="#1F7F8E" opacity="0.34" />
          <ellipse cx="150" cy="94" rx="104" ry="7" fill="#7FE0C8" opacity="0.16" />
          {/* Rocky underside */}
          <path d="M18 40 Q38 74 88 82 Q150 90 212 82 Q262 74 282 40 Q220 62 150 62 Q80 62 18 40 Z" fill="url(#rg-rock)" />
          <path d="M26 44 Q50 66 98 74 Q150 80 202 74 Q250 66 274 44 Q212 60 150 60 Q88 60 26 44 Z" fill="#B29C84" opacity="0.4" />
          {/* Grass cap */}
          <ellipse cx="150" cy="36" rx="140" ry="30" fill="url(#rg-grass)" />
          <path d="M150 6 Q58 6 14 32" stroke="#CFF7B8" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.65" />
          <path d="M286 34 Q244 58 184 63" stroke="#2E7A26" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.32" />
          <g stroke="#5CBF48" strokeWidth="2.2" strokeLinecap="round">
            {Array.from({ length: 22 }, (_, i) => {
              const x = 18 + i * 12.2; const h = 5 + ((i * 5) % 7);
              return <path key={i} d={`M${x} 60 q2 -${h} 4 0`} />;
            })}
          </g>
          {[[62, 30, '#FF8FAB'], [104, 22, '#FFE66D'], [190, 24, '#FFFFFF'], [236, 32, '#C3B1E1'], [150, 18, '#FFFFFF']].map(([cx, cy, f], i) => (
            <g key={i}>
              <circle cx={cx as number} cy={cy as number} r="3.6" fill={f as string} />
              <circle cx={cx as number} cy={cy as number} r="1.4" fill="#FFC531" />
            </g>
          ))}
        </svg>

        {/* Ripple rings where the island meets the water */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={`rip${i}`}
            className="absolute rounded-full pointer-events-none"
            style={{
              bottom: -6, left: '50%', translateX: '-50%',
              width: '46vw', maxWidth: 250, height: 16,
              border: '1.5px solid rgba(255,255,255,0.3)',
            }}
            animate={isReducedMotion ? undefined : { scale: [0.9, 1.45], opacity: [0.35, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeOut', delay: i * 1.5 }}
          />
        ))}

        <div
          className="relative z-[3] w-[92vw] max-w-[760px] flex justify-center px-2"
          style={{ marginTop: 'clamp(-42px, -4.2vw, -18px)' }}
        >
          {title}
        </div>
      </div>

      {/* ═══ L5 — FOREGROUND: STEPPING STONES + PLANTING ═══ */}
      <motion.div
        className="absolute inset-0 overflow-hidden pointer-events-none hidden sm:block"
        style={{ zIndex: 30 }}
        animate={{ x: par.x * -DEPTH.fore, y: par.y * -DEPTH.fore }}
        transition={spring}
      >
        {/* Stepping stones crossing the near water, receding in size */}
        {[
          { l: '64%', b: '20%', w: 40, o: 0.9 }, { l: '72%', b: '15%', w: 52, o: 0.95 },
          { l: '82%', b: '10%', w: 66, o: 1 }, { l: '93%', b: '5%', w: 80, o: 1 },
        ].map((st, i) => (
          <svg key={`st${i}`} className="absolute" style={{ left: st.l, bottom: st.b, width: st.w, opacity: st.o }} viewBox="0 0 80 46" fill="none">
            <ellipse cx="40" cy="34" rx="36" ry="11" fill="rgba(20,90,100,0.3)" />
            <ellipse cx="40" cy="26" rx="36" ry="16" fill="#A99781" />
            <ellipse cx="38" cy="22" rx="29" ry="11" fill="#C4B49D" />
            <ellipse cx="34" cy="19" rx="15" ry="5" fill="#D8CBB6" opacity="0.8" />
          </svg>
        ))}

        {/* Blurred reeds + blooms — depth of field */}
        <div className="absolute bottom-[1%] -left-[3%] w-[20vw] max-w-[230px]" style={{ filter: 'blur(3.5px)', opacity: 0.92 }}>
          <svg viewBox="0 0 200 170" fill="none">
            {[30, 52, 74, 96].map((x, i) => (
              <path key={x} d={`M${x} 170 Q${x - 6} ${110 - i * 10} ${x + 2} ${76 - i * 12}`} stroke="#3E9152" strokeWidth="7" strokeLinecap="round" fill="none" />
            ))}
            {[0, 72, 144, 216, 288].map((a) => (
              <ellipse key={a} cx={62 + Math.cos((a * Math.PI) / 180) * 22} cy={92 + Math.sin((a * Math.PI) / 180) * 22} rx="16" ry="16" fill="#FF9EC4" />
            ))}
            <circle cx="62" cy="92" r="11" fill="#FFD24A" />
          </svg>
        </div>
        <div className="absolute bottom-[0%] -right-[2%] w-[19vw] max-w-[215px]" style={{ filter: 'blur(4px)', opacity: 0.9 }}>
          <svg viewBox="0 0 200 170" fill="none">
            <ellipse cx="150" cy="150" rx="52" ry="28" fill="#3E9152" />
            {[0, 72, 144, 216, 288].map((a) => (
              <ellipse key={a} cx={118 + Math.cos((a * Math.PI) / 180) * 21} cy={104 + Math.sin((a * Math.PI) / 180) * 21} rx="15" ry="15" fill="#C9B2F0" />
            ))}
            <circle cx="118" cy="104" r="10" fill="#FFE58A" />
          </svg>
        </div>
      </motion.div>

      {/* ═══ L6 — AMBIENT LIFE ═══ */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Fish cruising under the surface */}
        {[
          { t: '72%', c: '#FF9A5C', s: 24, dur: 26, dir: 1 },
          { t: '80%', c: '#5CC8E8', s: 19, dur: 33, dir: -1 },
          { t: '88%', c: '#FFC94D', s: 15, dur: 29, dir: 1 },
        ].map((f, i) => (
          <motion.div
            key={`fish${i}`}
            className="absolute"
            style={{ top: f.t, left: f.dir > 0 ? '-8%' : '104%' }}
            animate={isReducedMotion ? undefined : { x: f.dir > 0 ? ['0vw', '116vw'] : ['0vw', '-116vw'], y: [0, -8, 6, -4, 0] }}
            transition={{ duration: f.dur, repeat: Infinity, ease: 'linear', delay: i * 5 }}
          >
            <svg width={f.s} height={f.s * 0.6} viewBox="0 0 30 18" fill="none" style={{ transform: f.dir > 0 ? 'none' : 'scaleX(-1)', opacity: 0.62 }}>
              <ellipse cx="13" cy="9" rx="11" ry="6.5" fill={f.c} />
              <path d="M24 9 L30 4 L30 14 Z" fill={f.c} />
              <circle cx="8" cy="7.5" r="1.5" fill="#2D3A44" />
            </svg>
          </motion.div>
        ))}

        {/* Bubbles rising from the riverbed */}
        {Array.from({ length: 9 }, (_, i) => ({
          l: `${10 + i * 9.5}%`, s: 4 + (i % 4) * 2, dur: 6 + (i % 5), d: i * 0.9,
        })).map((b, i) => (
          <motion.div
            key={`bub${i}`}
            className="absolute rounded-full"
            style={{
              left: b.l, bottom: '2%', width: b.s, height: b.s,
              border: '1.5px solid rgba(255,255,255,0.65)',
              background: 'rgba(255,255,255,0.16)',
            }}
            animate={isReducedMotion ? undefined : { y: [0, -190], opacity: [0, 0.75, 0], x: [0, 8, -6, 0] }}
            transition={{ duration: b.dur, repeat: Infinity, ease: 'easeOut', delay: b.d }}
          />
        ))}

        {/* Dragonflies skimming above the water */}
        {[
          { t: '54%', l: '22%', dur: 19, dx: 46, dy: -18 },
          { t: '60%', l: '70%', dur: 23, dx: -40, dy: -22 },
        ].map((d, i) => (
          <motion.div
            key={`df${i}`}
            className="absolute"
            style={{ top: d.t, left: d.l }}
            animate={isReducedMotion ? undefined : { x: [0, d.dx, d.dx * 0.4, 0], y: [0, d.dy, d.dy * 0.5, 0] }}
            transition={{ duration: d.dur, repeat: Infinity, ease: 'easeInOut', delay: i * 3 }}
          >
            <motion.svg
              width="22" height="14" viewBox="0 0 22 14" fill="none"
              animate={isReducedMotion ? undefined : { scaleY: [1, 0.6, 1] }}
              transition={{ duration: 0.22, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ellipse cx="7" cy="5" rx="6" ry="2.6" fill="#9FE0F0" opacity="0.75" />
              <ellipse cx="7" cy="9" rx="5" ry="2.2" fill="#9FE0F0" opacity="0.6" />
              <rect x="4" y="6" width="15" height="2.2" rx="1.1" fill="#5AA8C4" />
            </motion.svg>
          </motion.div>
        ))}

        {/* Light motes over the garden */}
        {Array.from({ length: 10 }, (_, i) => ({
          l: `${8 + i * 9}%`, t: `${20 + ((i * 15) % 34)}%`,
          s: 2 + (i % 3), d: i * 0.6, dur: 3 + (i % 4),
        })).map((p, i) => (
          <motion.div
            key={`mo${i}`}
            className="absolute rounded-full"
            style={{
              left: p.l, top: p.t, width: p.s * 2, height: p.s * 2,
              background: 'rgba(255,252,220,0.95)',
              boxShadow: `0 0 ${p.s * 5}px rgba(255,246,190,0.8)`,
            }}
            animate={isReducedMotion ? undefined : { opacity: [0.1, 0.8, 0.1], y: [0, -18, 0], scale: [0.7, 1.1, 0.7] }}
            transition={{ duration: p.dur + 2, repeat: Infinity, ease: 'easeInOut', delay: p.d }}
          />
        ))}
      </div>

      {/* ═══ L7 — CONTENT ═══ */}
      <div className="relative z-10 min-h-dvh flex flex-col">{children}</div>
    </div>
  );
}
