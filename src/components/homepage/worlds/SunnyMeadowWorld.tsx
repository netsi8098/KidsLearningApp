/**
 * SunnyMeadowWorld — Code-built scene for the Sunny Meadow theme.
 *
 * Replaces the old hero-image approach, whose "clean" plate still had the
 * title, subtitle and a fake Parent pill baked into the JPEG.
 *
 * Layers (back to front):
 *   0. Sky gradient
 *   1. Distant elements (sun glow, rainbow, clouds, far hills)
 *   2. Mid-ground (blossom trees, bushes)
 *   3. Rolling meadow hills
 *   4. Central grass mound + lion
 *   5. Foreground meadow bank (cards sit here)
 *   6. Animated overlays (butterflies, sparkles, pollen)
 *   7. Content (children prop — UI elements)
 */
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import type { WorldProps } from './types';

export default function SunnyMeadowWorld({ mascot, title, children }: WorldProps) {
  return (
    <div className="min-h-dvh relative overflow-hidden">
      {/* ═══ L0 — SKY GRADIENT ═══ */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg,
            #5BB8E8 0%,
            #7FC9EE 14%,
            #A5DCF5 28%,
            #CDEBF0 42%,
            #C2E8A8 56%,
            #8FD275 70%,
            #6BC155 84%,
            #55B045 100%)`,
        }}
      />

      {/* ═══ L1 — DISTANT ELEMENTS ═══ */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Sun glow — warm radial light top-right */}
        <motion.div
          className="absolute top-[-8%] right-[8%] w-[40vw] h-[40vw] max-w-[300px] max-h-[300px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(255,250,200,0.5) 0%, rgba(255,240,160,0.18) 50%, transparent 75%)' }}
          animate={{ scale: [1, 1.06, 1], opacity: [0.75, 1, 0.75] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Rainbow arc — left side */}
        <svg className="absolute top-[10%] left-[-6%] w-[46%] h-[34%] opacity-40" viewBox="0 0 500 250" fill="none">
          <defs>
            <linearGradient id="sm-rb" x1="0" y1="0.5" x2="1" y2="0.5">
              <stop offset="0%" stopColor="#FF6B6B" />
              <stop offset="16%" stopColor="#FF8C42" />
              <stop offset="33%" stopColor="#FFE66D" />
              <stop offset="50%" stopColor="#6BCB77" />
              <stop offset="67%" stopColor="#4ECDC4" />
              <stop offset="83%" stopColor="#45B7D1" />
              <stop offset="100%" stopColor="#A78BFA" />
            </linearGradient>
          </defs>
          <path d="M40 250 A210 210 0 0 1 460 250" stroke="url(#sm-rb)" strokeWidth="15" strokeLinecap="round" />
          <path d="M52 250 A198 198 0 0 1 448 250" stroke="url(#sm-rb)" strokeWidth="7" strokeLinecap="round" opacity="0.4" />
        </svg>

        {/* Drifting clouds */}
        {[
          { t: '6%', l: '-12%', w: 150, o: 0.9, dur: 62 },
          { t: '17%', l: '-22%', w: 105, o: 0.75, dur: 78 },
          { t: '27%', l: '-16%', w: 125, o: 0.6, dur: 92 },
        ].map((c, i) => (
          <motion.div
            key={`cloud${i}`}
            className="absolute"
            style={{ top: c.t, left: c.l, opacity: c.o }}
            animate={{ x: ['0vw', '128vw'] }}
            transition={{ duration: c.dur, repeat: Infinity, ease: 'linear', delay: i * 7 }}
          >
            <svg width={c.w} height={c.w * 0.42} viewBox="0 0 140 58" fill="none">
              <ellipse cx="42" cy="38" rx="34" ry="19" fill="white" />
              <ellipse cx="72" cy="28" rx="27" ry="23" fill="white" />
              <ellipse cx="98" cy="38" rx="29" ry="17" fill="white" />
              <ellipse cx="68" cy="44" rx="46" ry="13" fill="white" />
            </svg>
          </motion.div>
        ))}

        {/* Far hills — hazy blue-green ridge */}
        <svg className="absolute bottom-[38%] left-0 w-full h-[22%]" viewBox="0 0 400 90" preserveAspectRatio="none" fill="none">
          <path d="M0 90 L0 46 Q42 18 88 40 Q130 60 172 34 Q214 10 258 38 Q300 62 344 32 Q374 14 400 40 L400 90 Z" fill="#9FD9B4" opacity="0.55" />
          <path d="M0 90 L0 60 Q50 38 102 56 Q152 72 200 50 Q250 30 300 54 Q350 74 400 52 L400 90 Z" fill="#7FCB92" opacity="0.7" />
        </svg>
      </div>

      {/* ═══ L2 — MID-GROUND TREES ═══ */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Left blossom tree */}
        <motion.div
          className="absolute bottom-[30%] left-[1%] w-[26vw] max-w-[150px]"
          style={{ transformOrigin: 'bottom center' }}
          animate={{ rotate: [-1, 1.4, -1] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg viewBox="0 0 120 160" fill="none" className="w-full h-auto">
            <rect x="52" y="96" width="16" height="64" rx="7" fill="#8D6E4F" />
            <path d="M60 132 L38 112" stroke="#8D6E4F" strokeWidth="7" strokeLinecap="round" />
            <path d="M60 122 L84 104" stroke="#8D6E4F" strokeWidth="7" strokeLinecap="round" />
            <ellipse cx="40" cy="72" rx="34" ry="30" fill="#5FBF5F" />
            <ellipse cx="80" cy="66" rx="36" ry="32" fill="#6FCF6F" />
            <ellipse cx="60" cy="44" rx="38" ry="33" fill="#7ADB7A" />
            <ellipse cx="46" cy="56" rx="20" ry="16" fill="#8FE88F" opacity="0.6" />
            {[[34,58],[76,48],[58,32],[92,72],[26,80],[68,80]].map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r="4.5" fill="#FFB7D5" />
            ))}
          </svg>
        </motion.div>

        {/* Right blossom tree — larger, closer */}
        <motion.div
          className="absolute bottom-[27%] right-[0%] w-[30vw] max-w-[176px]"
          style={{ transformOrigin: 'bottom center' }}
          animate={{ rotate: [1.2, -1.2, 1.2] }}
          transition={{ duration: 8.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        >
          <svg viewBox="0 0 120 160" fill="none" className="w-full h-auto">
            <rect x="52" y="98" width="18" height="62" rx="8" fill="#7E6044" />
            <path d="M61 130 L84 110" stroke="#7E6044" strokeWidth="8" strokeLinecap="round" />
            <path d="M61 120 L36 102" stroke="#7E6044" strokeWidth="8" strokeLinecap="round" />
            <ellipse cx="38" cy="70" rx="35" ry="31" fill="#4FAF4F" />
            <ellipse cx="84" cy="64" rx="37" ry="33" fill="#5FBF5F" />
            <ellipse cx="60" cy="40" rx="40" ry="34" fill="#6FCF6F" />
            <ellipse cx="48" cy="52" rx="21" ry="17" fill="#86E086" opacity="0.55" />
            {[[32,56],[80,44],[58,26],[96,68],[24,78],[70,76]].map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r="5" fill="#FFC2DC" />
            ))}
          </svg>
        </motion.div>

        {/* Small bushes along the hill line */}
        {[
          { l: '20%', b: '31%', w: 62 },
          { l: '43%', b: '33%', w: 46 },
          { l: '66%', b: '30%', w: 54 },
        ].map((b, i) => (
          <svg key={`bush${i}`} className="absolute" style={{ left: b.l, bottom: b.b, width: b.w }} viewBox="0 0 70 34" fill="none">
            <ellipse cx="20" cy="24" rx="19" ry="12" fill="#57BC57" />
            <ellipse cx="44" cy="22" rx="21" ry="14" fill="#63C863" />
            <ellipse cx="32" cy="16" rx="17" ry="12" fill="#6FD46F" />
          </svg>
        ))}
      </div>

      {/* ═══ L3 — ROLLING MEADOW ═══ */}
      <div className="absolute bottom-0 left-0 right-0 h-[40%] pointer-events-none">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 160" preserveAspectRatio="none" fill="none">
          <path d="M0 160 L0 44 Q60 18 128 38 Q196 58 264 32 Q332 8 400 34 L400 160 Z" fill="#72C95C" />
          <path d="M0 160 L0 78 Q70 54 140 72 Q210 90 280 66 Q340 46 400 70 L400 160 Z" fill="#63BC4D" opacity="0.9" />
        </svg>
      </div>

      {/* ═══ L4 — CENTRAL MOUND + LION ═══ */}
      <div className="absolute bottom-[27%] left-1/2 -translate-x-1/2 flex flex-col items-center">
        {/* Warm ambient glow behind lion */}
        <motion.div
          className="absolute rounded-full blur-3xl pointer-events-none"
          style={{ width: '45vw', maxWidth: 240, height: '45vw', maxHeight: 240, top: '5%', background: 'radial-gradient(circle, rgba(255,225,140,0.24) 0%, rgba(255,205,110,0.09) 50%, transparent 75%)' }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.6, 0.9, 0.6] }}
          transition={{ duration: 4.4, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative z-[2]" style={{ marginBottom: '-20px' }}>
          {mascot}
        </div>

        {/* Grass mound — lion's feet embed into it */}
        <svg viewBox="0 0 280 75" className="w-[52vw] max-w-[280px] md:max-w-[344px] lg:max-w-[400px] relative z-[1]" fill="none">
          <defs>
            <radialGradient id="sm-mound" cx="50%" cy="28%" r="70%">
              <stop offset="0%" stopColor="#96EA8A" />
              <stop offset="60%" stopColor="#66C355" />
              <stop offset="100%" stopColor="#3F9633" />
            </radialGradient>
          </defs>
          <ellipse cx="140" cy="34" rx="132" ry="30" fill="url(#sm-mound)" />
          <ellipse cx="140" cy="28" rx="120" ry="22" fill="#7FD86F" opacity="0.55" />
          {/* Soil underside */}
          <path d="M12 36 Q34 68 78 72 Q140 78 202 72 Q246 68 268 36 Q210 58 140 58 Q70 58 12 36 Z" fill="#8A6742" opacity="0.85" />
          {/* Flower dots */}
          {[[54,26,'#FF8FAB'],[92,20,'#FFE66D'],[186,22,'#FF8FAB'],[224,28,'#C3B1E1'],[140,18,'#FFFFFF']].map(([cx, cy, f], i) => (
            <circle key={i} cx={cx as number} cy={cy as number} r="3.4" fill={f as string} />
          ))}
        </svg>

        {/* Title straddles the stage's front edge — it belongs to the world,
            not to a text column floating above it (see reference art). */}
        <div
          className="relative z-[3] w-[92vw] max-w-[760px] flex justify-center px-2"
          style={{ marginTop: 'clamp(-42px, -4.2vw, -18px)' }}
        >
          {title}
        </div>
      </div>

      {/* ═══ L5 — FOREGROUND MEADOW BANK ═══ */}
      <div className="absolute bottom-0 left-0 right-0 h-[28%] pointer-events-none">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 110" preserveAspectRatio="none" fill="none">
          <path d="M0 110 L0 26 Q52 6 108 20 Q168 34 228 16 Q296 -4 400 20 L400 110 Z" fill="#4FA83D" />
          <path d="M0 110 L0 50 Q80 32 156 46 Q236 60 400 42 L400 110 Z" fill="#469635" opacity="0.85" />
        </svg>
        {/* Foreground flower specks */}
        {[
          { l: '8%', b: '52%', c: '#FF8FAB' },
          { l: '19%', b: '44%', c: '#FFE66D' },
          { l: '31%', b: '58%', c: '#FFFFFF' },
          { l: '69%', b: '54%', c: '#FF8FAB' },
          { l: '81%', b: '46%', c: '#C3B1E1' },
          { l: '92%', b: '56%', c: '#FFE66D' },
        ].map((f, i) => (
          <motion.div
            key={`fg${i}`}
            className="absolute rounded-full"
            style={{ left: f.l, bottom: f.b, width: 7, height: 7, background: f.c, boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }}
            animate={{ y: [0, -2.5, 0] }}
            transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
          />
        ))}
      </div>

      {/* ═══ L6 — ANIMATED OVERLAYS ═══ */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Butterflies on looping flight paths */}
        {[
          { t: '24%', l: '12%', c: '#C3B1E1', s: 20, dur: 15, dx: 46, dy: -26 },
          { t: '34%', l: '72%', c: '#FFB86B', s: 16, dur: 18, dx: -40, dy: -20 },
          { t: '46%', l: '30%', c: '#FF8FAB', s: 14, dur: 21, dx: 34, dy: -30 },
        ].map((b, i) => (
          <motion.div
            key={`bf${i}`}
            className="absolute"
            style={{ top: b.t, left: b.l }}
            animate={{ x: [0, b.dx, b.dx * 0.4, 0], y: [0, b.dy, b.dy * 0.5, 0] }}
            transition={{ duration: b.dur, repeat: Infinity, ease: 'easeInOut', delay: i * 2 }}
          >
            <motion.svg
              width={b.s} height={b.s * 0.8} viewBox="0 0 24 20" fill="none"
              animate={{ scaleX: [1, 0.55, 1] }}
              transition={{ duration: 0.42, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ellipse cx="7" cy="8" rx="6.5" ry="7" fill={b.c} opacity="0.92" />
              <ellipse cx="17" cy="8" rx="6.5" ry="7" fill={b.c} opacity="0.92" />
              <ellipse cx="7" cy="14" rx="4.5" ry="4.5" fill={b.c} opacity="0.72" />
              <ellipse cx="17" cy="14" rx="4.5" ry="4.5" fill={b.c} opacity="0.72" />
              <rect x="11.2" y="5" width="1.6" height="13" rx="0.8" fill="#6B4E2E" />
            </motion.svg>
          </motion.div>
        ))}

        {/* Sparkles */}
        {[
          { l: '14%', t: '18%', s: 2.4, d: 0, dur: 2.2 },
          { l: '58%', t: '14%', s: 2, d: 0.5, dur: 2.6 },
          { l: '84%', t: '26%', s: 1.8, d: 1.0, dur: 2.0 },
          { l: '36%', t: '12%', s: 2.8, d: 1.4, dur: 2.8 },
          { l: '48%', t: '40%', s: 1.7, d: 0.3, dur: 2.4 },
          { l: '74%', t: '48%', s: 2.1, d: 1.8, dur: 2.2 },
          { l: '9%', t: '42%', s: 1.5, d: 0.7, dur: 1.9 },
          { l: '90%', t: '38%', s: 1.8, d: 1.2, dur: 2.5 },
        ].map((p, i) => (
          <motion.div
            key={`sp${i}`}
            className="absolute rounded-full"
            style={{
              left: p.l, top: p.t, width: p.s * 2, height: p.s * 2,
              background: 'white', boxShadow: `0 0 ${p.s * 5}px rgba(255,255,255,0.85)`,
            }}
            animate={{ opacity: [0.08, 0.85, 0.08], scale: [0.6, 1.15, 0.6] }}
            transition={{ duration: p.dur, repeat: Infinity, ease: 'easeInOut', delay: p.d }}
          />
        ))}

        {/* Drifting pollen motes */}
        {[
          { x1: -3, x2: 103, t: '30%', d: 0, dur: 21 },
          { x1: 103, x2: -3, t: '44%', d: 5, dur: 25 },
          { x1: -3, x2: 103, t: '56%', d: 10, dur: 23 },
        ].map((m, i) => (
          <motion.div
            key={`mote${i}`}
            className="absolute h-1 w-1 rounded-full bg-yellow-100/60"
            style={{ top: m.t, left: `${m.x1}%` }}
            animate={{ left: [`${m.x1}%`, `${m.x2}%`], y: [0, -18, 8, -12, 0], opacity: [0, 0.55, 0.35, 0.55, 0] }}
            transition={{ duration: m.dur, repeat: Infinity, ease: 'linear', delay: m.d }}
          />
        ))}
      </div>

      {/* ═══ L7 — CONTENT ═══ */}
      <div className="relative z-10 min-h-dvh flex flex-col">{children}</div>
    </div>
  );
}
