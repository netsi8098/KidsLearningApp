/**
 * RiverGardenWorld — Code-built scene matching the River Garden reference composition.
 *
 * Layers (back to front):
 *   0. Sky gradient
 *   1. Distant elements (rainbow, far hills, sun glow, clouds)
 *   2. Mid-ground (trees, bushes)
 *   3. Water surface with shimmer
 *   4. Central island
 *   5. Foreground grassy bank (cards sit here)
 *   6. Animated overlays (fish, bubbles, sparkles, pollen)
 *   7. Content (children prop — UI elements)
 */
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import type { WorldProps } from './types';

export default function RiverGardenWorld({ mascot, title, children }: WorldProps) {
  return (
    <div className="min-h-dvh relative overflow-hidden">
      {/* ═══ L0 — SKY GRADIENT ═══ */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg,
            #7EC8E3 0%,
            #93D4F0 12%,
            #B0E0F0 25%,
            #C8EDD8 42%,
            #A0D8A0 58%,
            #6CC06C 72%,
            #48B8B0 85%,
            #3AA8A0 100%)`,
        }}
      />

      {/* ═══ L1 — DISTANT ELEMENTS ═══ */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Sun glow — warm radial light top-center */}
        <div
          className="absolute top-[-5%] left-[42%] w-[35vw] h-[35vw] max-w-[280px] max-h-[280px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(255,250,205,0.45) 0%, rgba(255,240,170,0.15) 50%, transparent 75%)' }}
        />

        {/* Rainbow arc */}
        <svg className="absolute top-[1%] right-[2%] w-[55%] h-[38%] opacity-35" viewBox="0 0 500 250" fill="none">
          <defs>
            <linearGradient id="rg-rb" x1="0" y1="0.5" x2="1" y2="0.5">
              <stop offset="0%" stopColor="#FF6B6B" />
              <stop offset="16%" stopColor="#FF8C42" />
              <stop offset="33%" stopColor="#FFE66D" />
              <stop offset="50%" stopColor="#6BCB77" />
              <stop offset="67%" stopColor="#4ECDC4" />
              <stop offset="83%" stopColor="#45B7D1" />
              <stop offset="100%" stopColor="#A78BFA" />
            </linearGradient>
          </defs>
          <path d="M40 250 A210 210 0 0 1 460 250" stroke="url(#rg-rb)" strokeWidth="14" strokeLinecap="round" />
          <path d="M50 250 A200 200 0 0 1 450 250" stroke="url(#rg-rb)" strokeWidth="7" strokeLinecap="round" opacity="0.45" />
        </svg>

        {/* Distant hills — layered for depth */}
        <svg className="absolute top-[28%] left-0 w-full h-[28%]" viewBox="0 0 1000 200" preserveAspectRatio="none">
          <path d="M0 200 Q80 70 200 120 Q350 40 500 95 Q620 30 750 85 Q880 50 1000 110 L1000 200Z" fill="#7BC77B" opacity="0.3" />
          <path d="M0 200 Q150 90 300 135 Q480 65 650 115 Q800 80 1000 145 L1000 200Z" fill="#5CB85C" opacity="0.4" />
        </svg>

        {/* Clouds — gentle drift */}
        <motion.div
          className="absolute top-[4%] left-[5%] w-[22vw] max-w-[140px] h-[5vw] max-h-[48px] rounded-full bg-white/30 blur-lg"
          animate={{ x: [0, 22, 0] }}
          transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-[8%] right-[12%] w-[18vw] max-w-[120px] h-[4vw] max-h-[40px] rounded-full bg-white/25 blur-lg"
          animate={{ x: [0, -16, 0] }}
          transition={{ duration: 34, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
        />
        <motion.div
          className="absolute top-[5%] left-[38%] w-[14vw] max-w-[90px] h-[3.5vw] max-h-[32px] rounded-full bg-white/20 blur-md"
          animate={{ x: [0, 12, 0] }}
          transition={{ duration: 38, repeat: Infinity, ease: 'easeInOut', delay: 14 }}
        />
      </div>

      {/* ═══ L2 — MID-GROUND: TREES + BUSHES ═══ */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Left tree cluster */}
        <svg className="absolute bottom-[32%] left-[-4%] w-[30%] h-[38%]" viewBox="0 0 260 340">
          <defs>
            <radialGradient id="rg-t1" cx="45%" cy="38%" r="60%">
              <stop offset="0%" stopColor="#5CB85C" />
              <stop offset="100%" stopColor="#1B5E20" />
            </radialGradient>
            <radialGradient id="rg-t2" cx="50%" cy="35%" r="55%">
              <stop offset="0%" stopColor="#72C472" />
              <stop offset="100%" stopColor="#2E7D32" />
            </radialGradient>
          </defs>
          {/* Trunk */}
          <rect x="108" y="195" width="44" height="145" rx="12" fill="#6D4C41" />
          <rect x="118" y="198" width="14" height="130" rx="5" fill="#8D6E63" opacity="0.45" />
          {/* Canopy — overlapping ellipses for dimension */}
          <ellipse cx="130" cy="175" rx="115" ry="95" fill="url(#rg-t1)" />
          <ellipse cx="80" cy="135" rx="78" ry="68" fill="url(#rg-t2)" />
          <ellipse cx="180" cy="148" rx="68" ry="58" fill="#388E3C" />
          {/* Light patches */}
          <ellipse cx="100" cy="128" rx="35" ry="24" fill="#81C784" opacity="0.35" />
          <ellipse cx="160" cy="160" rx="25" ry="18" fill="#A5D6A7" opacity="0.25" />
        </svg>

        {/* Right tree cluster */}
        <svg className="absolute bottom-[32%] right-[-4%] w-[28%] h-[36%]" viewBox="0 0 240 320">
          <rect x="100" y="195" width="40" height="125" rx="10" fill="#6D4C41" />
          <rect x="108" y="198" width="12" height="115" rx="4" fill="#8D6E63" opacity="0.4" />
          <ellipse cx="120" cy="175" rx="108" ry="90" fill="#388E3C" />
          <ellipse cx="70" cy="140" rx="70" ry="60" fill="#43A047" />
          <ellipse cx="170" cy="152" rx="62" ry="52" fill="#2E7D32" />
          <ellipse cx="90" cy="132" rx="30" ry="22" fill="#66BB6A" opacity="0.35" />
        </svg>

        {/* Small bushes */}
        <svg className="absolute bottom-[29%] left-[20%] w-[12%] h-[7%]" viewBox="0 0 100 55">
          <ellipse cx="50" cy="32" rx="48" ry="26" fill="#43A047" />
          <ellipse cx="35" cy="25" rx="25" ry="18" fill="#66BB6A" opacity="0.55" />
        </svg>
        <svg className="absolute bottom-[30%] right-[18%] w-[10%] h-[6%]" viewBox="0 0 80 48">
          <ellipse cx="40" cy="26" rx="38" ry="24" fill="#388E3C" />
          <ellipse cx="52" cy="20" rx="22" ry="16" fill="#4CAF50" opacity="0.45" />
        </svg>
      </div>

      {/* ═══ L3 — WATER SURFACE ═══ */}
      <div
        className="absolute bottom-[18%] left-0 right-0 h-[20%]"
        style={{
          background: `linear-gradient(180deg,
            rgba(77,184,172,0.25) 0%,
            rgba(56,166,154,0.4) 30%,
            rgba(38,150,136,0.55) 60%,
            rgba(26,136,124,0.65) 100%)`,
        }}
      >
        {/* Wide shimmer glow */}
        <motion.div
          className="absolute inset-0 bg-cyan-200/8 blur-2xl"
          animate={{ opacity: [0.15, 0.35, 0.15] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Water surface light streaks */}
        {[
          { l: '4%', t: '25%', w: '7%', d: 0 },
          { l: '22%', t: '45%', w: '5.5%', d: 0.7 },
          { l: '45%', t: '30%', w: '8%', d: 1.4 },
          { l: '65%', t: '55%', w: '5%', d: 0.3 },
          { l: '80%', t: '35%', w: '6%', d: 1.8 },
          { l: '35%', t: '65%', w: '4.5%', d: 2.2 },
          { l: '90%', t: '50%', w: '4%', d: 0.9 },
        ].map((s, i) => (
          <motion.div
            key={`ws${i}`}
            className="absolute h-[1.5px] rounded-full bg-white/45"
            style={{ left: s.l, top: s.t, width: s.w }}
            animate={{ x: [0, 14, 0], opacity: [0.1, 0.6, 0.1] }}
            transition={{ duration: 2.6 + i * 0.25, repeat: Infinity, ease: 'easeInOut', delay: s.d }}
          />
        ))}

        {/* Waterfall mist — left side */}
        <motion.div
          className="absolute left-[2%] top-[-15%] w-[8%] h-[60%] rounded-full bg-white/6 blur-xl"
          animate={{ opacity: [0.08, 0.25, 0.08], y: [0, 5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* ═══ L4 — CENTRAL ISLAND + LION ═══ */}
      <div className="absolute bottom-[27%] left-1/2 -translate-x-1/2 flex flex-col items-center">
        {/* Warm ambient glow behind lion — makes the character pop */}
        <motion.div
          className="absolute rounded-full blur-3xl pointer-events-none"
          style={{ width: '45vw', maxWidth: 240, height: '45vw', maxHeight: 240, top: '5%', background: 'radial-gradient(circle, rgba(255,220,130,0.2) 0%, rgba(255,200,100,0.08) 50%, transparent 75%)' }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.6, 0.85, 0.6] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Lion — grounded on island center, sized as hero focal point */}
        {/* Uses GeneratedLion: loads PNG from /assets/lion/ with motion layers, */}
        {/* falls back to PremiumLion SVG when generated art isn't available yet */}
        <div className="relative z-[2]" style={{ marginBottom: '-22px' }}>
          {mascot}
        </div>

        {/* Island mound — lion's feet embed into the grass */}
        <svg viewBox="0 0 280 75" className="w-[52vw] max-w-[280px] md:max-w-[344px] lg:max-w-[400px] relative z-[1]" fill="none">
          <defs>
            <radialGradient id="rg-isle" cx="50%" cy="28%" r="70%">
              <stop offset="0%" stopColor="#8FE388" />
              <stop offset="60%" stopColor="#5CB85C" />
              <stop offset="100%" stopColor="#388E3C" />
            </radialGradient>
          </defs>
          {/* Island shadow */}
          <ellipse cx="140" cy="55" rx="132" ry="24" fill="rgba(27,94,32,0.18)" />
          {/* Island body */}
          <ellipse cx="140" cy="42" rx="135" ry="35" fill="url(#rg-isle)" />
          {/* Grass tufts */}
          <ellipse cx="50" cy="28" rx="4" ry="10" fill="#A5D6A7" opacity="0.55" />
          <ellipse cx="230" cy="32" rx="3" ry="9" fill="#A5D6A7" opacity="0.55" />
          <ellipse cx="95" cy="34" rx="3" ry="7" fill="#C8E6C9" opacity="0.4" />
          <ellipse cx="185" cy="30" rx="3.5" ry="8" fill="#C8E6C9" opacity="0.4" />
          {/* Flowers */}
          <circle cx="38" cy="30" r="5" fill="#FF8FAB" opacity="0.75" />
          <circle cx="38" cy="30" r="2" fill="#FFE4E8" opacity="0.9" />
          <circle cx="72" cy="36" r="4" fill="#FFE66D" opacity="0.85" />
          <circle cx="72" cy="36" r="1.5" fill="#FFF8DC" opacity="0.9" />
          <circle cx="208" cy="33" r="4.5" fill="#FF8FAB" opacity="0.75" />
          <circle cx="208" cy="33" r="1.8" fill="#FFE4E8" opacity="0.9" />
          <circle cx="242" cy="28" r="3.5" fill="#FFE66D" opacity="0.8" />
          <circle cx="242" cy="28" r="1.5" fill="#FFF8DC" opacity="0.9" />
          {/* Stepping stones — right side */}
          <ellipse cx="260" cy="52" rx="14" ry="6" fill="#9E9E9E" opacity="0.35" />
          <ellipse cx="275" cy="60" rx="10" ry="4.5" fill="#BDBDBD" opacity="0.3" />
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

      {/* ═══ L5 — FOREGROUND GRASSY BANK ═══ */}
      <svg
        className="absolute bottom-0 left-0 w-full h-[26%]"
        viewBox="0 0 800 180"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="rg-bank" x1="400" y1="0" x2="400" y2="180" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#5CB85C" />
            <stop offset="35%" stopColor="#4CAF50" />
            <stop offset="100%" stopColor="#388E3C" />
          </linearGradient>
        </defs>
        {/* Bank shape — organic wavy top edge */}
        <path
          d="M0 180 L0 35 Q45 18 90 38 Q135 10 180 30 Q225 6 270 24 Q315 14 360 20 Q405 8 450 26 Q495 12 540 32 Q585 16 630 28 Q675 10 720 22 Q760 16 800 30 L800 180Z"
          fill="url(#rg-bank)"
        />
        {/* Grass detail — lighter strokes on top edge */}
        <path
          d="M0 38 Q35 20 70 40 Q105 14 140 34 Q175 8 210 28 Q245 12 280 26 Q315 6 350 22 Q385 10 420 28 Q455 14 490 34 Q525 18 560 30 Q595 8 630 26 Q665 14 700 24 Q735 10 770 28 Q790 18 800 32"
          fill="none"
          stroke="#81C784"
          strokeWidth="2.5"
          opacity="0.45"
        />
        {/* Second grass detail row */}
        <path
          d="M0 42 Q50 28 100 44 Q150 22 200 38 Q250 16 300 32 Q350 20 400 28 Q450 14 500 34 Q550 20 600 36 Q650 22 700 30 Q750 18 800 36"
          fill="none"
          stroke="#66BB6A"
          strokeWidth="1.5"
          opacity="0.3"
        />
        {/* Flowers scattered on bank */}
        <circle cx="55" cy="45" r="6" fill="#FF8FAB" opacity="0.7" />
        <circle cx="55" cy="45" r="2.5" fill="#FFE4E8" opacity="0.9" />
        <circle cx="165" cy="28" r="5" fill="#FFE66D" opacity="0.8" />
        <circle cx="165" cy="28" r="2" fill="#FFF8DC" opacity="0.9" />
        <circle cx="310" cy="34" r="6.5" fill="#FF8FAB" opacity="0.7" />
        <circle cx="310" cy="34" r="2.5" fill="#FFE4E8" opacity="0.9" />
        <circle cx="440" cy="24" r="5" fill="#FFE66D" opacity="0.8" />
        <circle cx="440" cy="24" r="2" fill="#FFF8DC" opacity="0.9" />
        <circle cx="570" cy="38" r="6" fill="#FF8FAB" opacity="0.65" />
        <circle cx="570" cy="38" r="2.5" fill="#FFE4E8" opacity="0.85" />
        <circle cx="690" cy="20" r="5" fill="#FFE66D" opacity="0.85" />
        <circle cx="690" cy="20" r="2" fill="#FFF8DC" opacity="0.9" />
        <circle cx="760" cy="36" r="4.5" fill="#C8E6C9" opacity="0.5" />
        <circle cx="120" cy="60" r="4" fill="#C8E6C9" opacity="0.5" />
        <circle cx="380" cy="52" r="4.5" fill="#C8E6C9" opacity="0.45" />
        <circle cx="620" cy="56" r="4" fill="#C8E6C9" opacity="0.45" />
      </svg>

      {/* ═══ L6 — ANIMATED OVERLAYS ═══ */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Atmospheric light breathing */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-yellow-100/0 via-yellow-100/5 to-cyan-100/0"
          animate={{ opacity: [0, 0.12, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Floating glass bubbles — different depths */}
        {[
          { l: '14%', t: '20%', s: 38, d: 0 },
          { l: '76%', t: '22%', s: 44, d: 0.8 },
          { l: '8%', t: '38%', s: 22, d: 1.6 },
          { l: '58%', t: '15%', s: 28, d: 2.4 },
        ].map((b, i) => (
          <motion.div
            key={`bb${i}`}
            className="absolute rounded-full"
            style={{
              left: b.l,
              top: b.t,
              width: b.s,
              height: b.s,
              border: '1.5px solid rgba(255,255,255,0.2)',
              background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.12), transparent 60%)',
            }}
            animate={{ y: [0, -12, 0], x: [0, i % 2 ? 5 : -5, 0], opacity: [0.25, 0.6, 0.25] }}
            transition={{ duration: 5.5 + i, repeat: Infinity, ease: 'easeInOut', delay: b.d }}
          />
        ))}

        {/* Drifting fish */}
        <motion.div
          className="absolute left-[18%] top-[52%] text-xl"
          style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.1))' }}
          animate={{ x: [0, 28, 8, 36, 0], y: [0, -5, 3, -2, 0], rotate: [0, 4, -2, 3, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        >
          🐠
        </motion.div>
        <motion.div
          className="absolute right-[14%] top-[48%] text-lg"
          style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.1))' }}
          animate={{ x: [0, -22, -4, -30, 0], y: [0, -3, 4, -1, 0], scaleX: [-1, -1, -1, -1, -1] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        >
          🐟
        </motion.div>

        {/* Sparkle particles — varied sizes/speeds */}
        {[
          { l: '10%', t: '14%', s: 2.5, d: 0, dur: 2.2 },
          { l: '55%', t: '16%', s: 2, d: 0.5, dur: 2.6 },
          { l: '80%', t: '20%', s: 1.8, d: 1.0, dur: 2.0 },
          { l: '32%', t: '10%', s: 3, d: 1.4, dur: 2.8 },
          { l: '42%', t: '44%', s: 1.8, d: 0.3, dur: 2.4 },
          { l: '70%', t: '52%', s: 2.2, d: 1.8, dur: 2.2 },
          { l: '6%', t: '46%', s: 1.5, d: 0.7, dur: 1.9 },
          { l: '88%', t: '36%', s: 1.8, d: 1.2, dur: 2.5 },
          { l: '26%', t: '56%', s: 2.5, d: 0.2, dur: 2.1 },
          { l: '62%', t: '60%', s: 1.5, d: 1.6, dur: 2.3 },
        ].map((p, i) => (
          <motion.div
            key={`sp${i}`}
            className="absolute rounded-full"
            style={{
              left: p.l,
              top: p.t,
              width: p.s * 2,
              height: p.s * 2,
              background: 'white',
              boxShadow: `0 0 ${p.s * 5}px rgba(255,255,255,0.85)`,
            }}
            animate={{ opacity: [0.08, 0.85, 0.08], scale: [0.6, 1.15, 0.6] }}
            transition={{ duration: p.dur, repeat: Infinity, ease: 'easeInOut', delay: p.d }}
          />
        ))}

        {/* Floating pollen / light motes — drift across scene */}
        {[
          { x1: -3, x2: 103, t: '22%', d: 0, dur: 20 },
          { x1: 103, x2: -3, t: '38%', d: 5, dur: 24 },
          { x1: -3, x2: 103, t: '50%', d: 10, dur: 22 },
          { x1: 103, x2: -3, t: '16%', d: 3, dur: 26 },
        ].map((m, i) => (
          <motion.div
            key={`mote${i}`}
            className="absolute h-1 w-1 rounded-full bg-yellow-200/55"
            style={{ top: m.t, left: `${m.x1}%` }}
            animate={{ left: [`${m.x1}%`, `${m.x2}%`], y: [0, -18, 8, -12, 0], opacity: [0, 0.5, 0.35, 0.55, 0] }}
            transition={{ duration: m.dur, repeat: Infinity, ease: 'linear', delay: m.d }}
          />
        ))}

        {/* Rainbow glow pulse */}
        <motion.div
          className="absolute right-[3%] top-[8%] w-[18vw] max-w-[130px] h-[18vw] max-h-[130px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.06) 0%, rgba(255,107,107,0.03) 45%, transparent 70%)' }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.25, 0.5, 0.25] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* ═══ L7 — CONTENT ═══ */}
      <div className="relative z-10 min-h-dvh flex flex-col">{children}</div>
    </div>
  );
}
