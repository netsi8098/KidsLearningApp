/**
 * SkyIslandsWorld — Code-built scene for the Sky Islands theme.
 *
 * Dreamy high-altitude palette: violet-to-blue sky, floating grass islands,
 * a rainbow band, planets, a hot-air balloon and a looping rocket.
 *
 * Layers (back to front):
 *   0. Sky gradient
 *   1. Distant elements (rainbow band, stars, planets, clouds)
 *   2. Side floating islands (castle + cottage)
 *   3. Hot-air balloon + rocket
 *   4. Central floating island + lion
 *   5. Foreground cloud bank (cards sit here)
 *   6. Animated overlays (sparkles, motes)
 *   7. Content (children prop — UI elements)
 */
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import GeneratedLion from '../../GeneratedLion';

export default function SkyIslandsWorld({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh relative overflow-hidden">
      {/* ═══ L0 — SKY GRADIENT ═══ */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg,
            #3E5CC8 0%,
            #5A78D8 14%,
            #7B93E4 28%,
            #9AA9EC 42%,
            #A99BE0 56%,
            #9B84D4 70%,
            #8670C4 85%,
            #6F5BB0 100%)`,
        }}
      />

      {/* ═══ L1 — DISTANT ELEMENTS ═══ */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Soft light bloom top-center */}
        <motion.div
          className="absolute top-[-6%] left-[46%] -translate-x-1/2 w-[46vw] h-[46vw] max-w-[330px] max-h-[330px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(255,240,255,0.35) 0%, rgba(220,200,255,0.12) 50%, transparent 74%)' }}
          animate={{ scale: [1, 1.07, 1], opacity: [0.65, 0.95, 0.65] }}
          transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Rainbow band sweeping the right side */}
        <svg className="absolute top-[6%] right-[-12%] w-[62%] h-[46%] opacity-45" viewBox="0 0 500 250" fill="none">
          <defs>
            <linearGradient id="si-rb" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FF6B6B" />
              <stop offset="20%" stopColor="#FF8C42" />
              <stop offset="40%" stopColor="#FFE66D" />
              <stop offset="60%" stopColor="#6BCB77" />
              <stop offset="80%" stopColor="#45B7D1" />
              <stop offset="100%" stopColor="#A78BFA" />
            </linearGradient>
          </defs>
          <path d="M-20 230 Q180 40 480 10" stroke="url(#si-rb)" strokeWidth="30" strokeLinecap="round" opacity="0.75" />
          <path d="M-20 250 Q180 62 480 32" stroke="url(#si-rb)" strokeWidth="14" strokeLinecap="round" opacity="0.4" />
        </svg>

        {/* Twinkling stars */}
        {[
          { l: '8%', t: '8%', s: 6 }, { l: '20%', t: '16%', s: 4 },
          { l: '38%', t: '6%', s: 7 }, { l: '52%', t: '18%', s: 4.5 },
          { l: '66%', t: '9%', s: 5 }, { l: '88%', t: '22%', s: 6 },
          { l: '14%', t: '30%', s: 4 }, { l: '78%', t: '34%', s: 5 },
        ].map((s, i) => (
          <motion.svg
            key={`star${i}`}
            className="absolute" style={{ left: s.l, top: s.t }}
            width={s.s * 2.6} height={s.s * 2.6} viewBox="0 0 24 24" fill="none"
            animate={{ opacity: [0.25, 1, 0.25], scale: [0.8, 1.15, 0.8], rotate: [0, 12, 0] }}
            transition={{ duration: 2.4 + i * 0.3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.35 }}
          >
            <path d="M12 1 L14.6 8.6 L22.5 8.9 L16.2 13.7 L18.5 21.4 L12 16.8 L5.5 21.4 L7.8 13.7 L1.5 8.9 L9.4 8.6 Z" fill="#FFE9A8" />
          </motion.svg>
        ))}

        {/* Planets */}
        <motion.div
          className="absolute left-[8%] top-[18%]"
          animate={{ y: [0, -12, 0], rotate: [-4, 4, -4] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg width="66" height="46" viewBox="0 0 66 46" fill="none">
            <ellipse cx="33" cy="23" rx="17" ry="17" fill="#FF9ECD" />
            <ellipse cx="27" cy="17" rx="5" ry="4" fill="#FFC2E0" opacity="0.7" />
            <ellipse cx="33" cy="24" rx="31" ry="8" fill="none" stroke="#FFD48A" strokeWidth="3.5" opacity="0.9" />
          </svg>
        </motion.div>

        <motion.div
          className="absolute right-[12%] top-[30%]"
          animate={{ y: [0, 10, 0], rotate: [3, -3, 3] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        >
          <svg width="54" height="38" viewBox="0 0 54 38" fill="none">
            <ellipse cx="27" cy="19" rx="14" ry="14" fill="#8FD4F5" />
            <ellipse cx="22" cy="14" rx="4" ry="3.2" fill="#C4EAFB" opacity="0.7" />
            <ellipse cx="27" cy="20" rx="25" ry="6.5" fill="none" stroke="#C3B1E1" strokeWidth="3" opacity="0.85" />
          </svg>
        </motion.div>

        {/* Drifting clouds */}
        {[
          { t: '14%', l: '-14%', w: 130, o: 0.55, dur: 74 },
          { t: '40%', l: '-24%', w: 100, o: 0.4, dur: 92 },
        ].map((c, i) => (
          <motion.div
            key={`cloud${i}`}
            className="absolute"
            style={{ top: c.t, left: c.l, opacity: c.o }}
            animate={{ x: ['0vw', '130vw'] }}
            transition={{ duration: c.dur, repeat: Infinity, ease: 'linear', delay: i * 8 }}
          >
            <svg width={c.w} height={c.w * 0.42} viewBox="0 0 140 58" fill="none">
              <ellipse cx="42" cy="38" rx="34" ry="18" fill="#E4E0FA" />
              <ellipse cx="72" cy="28" rx="27" ry="22" fill="#EDEAFD" />
              <ellipse cx="98" cy="38" rx="29" ry="16" fill="#E4E0FA" />
            </svg>
          </motion.div>
        ))}
      </div>

      {/* ═══ L2 — SIDE FLOATING ISLANDS ═══ */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Left island with castle */}
        <motion.div
          className="absolute left-[-3%] bottom-[40%] w-[30vw] max-w-[170px]"
          animate={{ y: [0, -9, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg viewBox="0 0 140 110" fill="none" className="w-full h-auto">
            {/* Castle */}
            <rect x="44" y="30" width="18" height="34" fill="#F3E3F5" />
            <rect x="76" y="24" width="20" height="40" fill="#EDD9F0" />
            <rect x="62" y="40" width="14" height="24" fill="#E5CCEA" />
            <path d="M44 30 L53 14 L62 30 Z" fill="#FF8FAB" />
            <path d="M76 24 L86 6 L96 24 Z" fill="#FF8FAB" />
            <rect x="50" y="42" width="6" height="8" rx="2" fill="#8FD4F5" />
            <rect x="82" y="36" width="7" height="9" rx="2" fill="#8FD4F5" />
            {/* Island rock */}
            <ellipse cx="70" cy="68" rx="56" ry="12" fill="#7ED87E" />
            <path d="M14 68 Q26 96 48 104 Q70 112 92 104 Q114 96 126 68 Q98 82 70 82 Q42 82 14 68 Z" fill="#9B7B5A" />
            {/* Tiny tree */}
            <ellipse cx="26" cy="58" rx="10" ry="9" fill="#5FBF5F" />
            <rect x="24" y="62" width="4" height="8" fill="#7E6044" />
          </svg>
        </motion.div>

        {/* Right island with cottage */}
        <motion.div
          className="absolute right-[-2%] bottom-[43%] w-[28vw] max-w-[158px]"
          animate={{ y: [0, 11, 0] }}
          transition={{ duration: 8.5, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
        >
          <svg viewBox="0 0 140 110" fill="none" className="w-full h-auto">
            {/* Cottage */}
            <rect x="52" y="36" width="38" height="28" rx="3" fill="#F5E6D3" />
            <path d="M46 36 L71 16 L96 36 Z" fill="#C3B1E1" />
            <rect x="66" y="48" width="12" height="16" rx="2" fill="#9A7048" />
            <rect x="56" y="44" width="8" height="8" rx="2" fill="#8FD4F5" />
            <rect x="80" y="44" width="8" height="8" rx="2" fill="#8FD4F5" />
            {/* Island rock */}
            <ellipse cx="70" cy="68" rx="54" ry="12" fill="#7ED87E" />
            <path d="M16 68 Q28 94 50 102 Q70 110 90 102 Q112 94 124 68 Q98 82 70 82 Q42 82 16 68 Z" fill="#9B7B5A" />
            {/* Tiny trees */}
            <ellipse cx="112" cy="58" rx="11" ry="10" fill="#4FAF4F" />
            <rect x="110" y="62" width="4" height="9" fill="#7E6044" />
          </svg>
        </motion.div>
      </div>

      {/* ═══ L3 — BALLOON + ROCKET ═══ */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Hot-air balloon */}
        <motion.div
          className="absolute left-[10%] top-[6%]"
          animate={{ y: [0, -18, 0], x: [0, 10, 0], rotate: [-2.5, 2.5, -2.5] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg width="58" height="82" viewBox="0 0 58 82" fill="none">
            <path d="M29 2 Q52 2 52 27 Q52 44 29 56 Q6 44 6 27 Q6 2 29 2 Z" fill="#FF9ECD" />
            <path d="M29 2 Q37 2 39 27 Q40 44 29 56 Q18 44 19 27 Q21 2 29 2 Z" fill="#FFD48A" />
            <path d="M29 2 Q33 2 34 27 Q34 44 29 56 Q24 44 24 27 Q25 2 29 2 Z" fill="#8FD4F5" />
            <path d="M22 56 L20 66 M36 56 L38 66" stroke="#B08A5E" strokeWidth="1.6" />
            <rect x="19" y="64" width="20" height="14" rx="3" fill="#B08A5E" />
          </svg>
        </motion.div>

        {/* Rocket looping across the sky */}
        <motion.div
          className="absolute"
          style={{ top: '22%', left: '-8%' }}
          animate={{ x: ['0vw', '116vw'], y: [0, -34, 12, -22, 0] }}
          transition={{ duration: 17, repeat: Infinity, ease: 'linear' }}
        >
          <svg width="52" height="26" viewBox="0 0 52 26" fill="none">
            {/* Exhaust trail */}
            <path d="M0 13 L14 10 L14 16 Z" fill="#FFD48A" opacity="0.65" />
            <ellipse cx="34" cy="13" rx="15" ry="7" fill="#F5F1FF" />
            <path d="M49 13 Q44 8 40 6 L40 20 Q44 18 49 13 Z" fill="#FF8FAB" />
            <circle cx="35" cy="13" r="3.6" fill="#8FD4F5" />
            <path d="M28 7 L22 1 L24 8 Z" fill="#FF8FAB" />
            <path d="M28 19 L22 25 L24 18 Z" fill="#FF8FAB" />
          </svg>
        </motion.div>
      </div>

      {/* ═══ L4 — CENTRAL FLOATING ISLAND + LION ═══ */}
      <motion.div
        className="absolute bottom-[27%] left-1/2 -translate-x-1/2 flex flex-col items-center"
        animate={{ y: [0, -7, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <motion.div
          className="absolute rounded-full blur-3xl pointer-events-none"
          style={{ width: '45vw', maxWidth: 240, height: '45vw', maxHeight: 240, top: '5%', background: 'radial-gradient(circle, rgba(255,235,180,0.22) 0%, rgba(200,170,255,0.1) 50%, transparent 75%)' }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.6, 0.9, 0.6] }}
          transition={{ duration: 4.6, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative z-[2]" style={{ marginBottom: '-20px' }}>
          <GeneratedLion pose="waving" size={170} />
        </div>

        {/* Floating island — grass cap over a rocky underside */}
        <svg viewBox="0 0 280 96" className="w-[52vw] max-w-[280px] relative z-[1]" fill="none">
          <defs>
            <radialGradient id="si-isle" cx="50%" cy="26%" r="70%">
              <stop offset="0%" stopColor="#9BEE8E" />
              <stop offset="60%" stopColor="#6CCB5A" />
              <stop offset="100%" stopColor="#45A038" />
            </radialGradient>
          </defs>
          <ellipse cx="140" cy="32" rx="130" ry="28" fill="url(#si-isle)" />
          <ellipse cx="140" cy="26" rx="118" ry="21" fill="#84DD74" opacity="0.5" />
          {/* Rocky underside tapering to a point */}
          <path d="M14 34 Q30 62 60 76 Q100 94 140 96 Q180 94 220 76 Q250 62 266 34 Q206 56 140 56 Q74 56 14 34 Z" fill="#9B7B5A" />
          <path d="M60 76 Q100 94 140 96 Q120 78 104 62 Q80 70 60 76 Z" fill="#836546" opacity="0.7" />
          {/* Flower dots */}
          {[[56,24,'#FF8FAB'],[94,18,'#FFE66D'],[188,20,'#C3B1E1'],[222,26,'#FF8FAB']].map(([cx, cy, f], i) => (
            <circle key={i} cx={cx as number} cy={cy as number} r="3.4" fill={f as string} />
          ))}
        </svg>
      </motion.div>

      {/* ═══ L5 — FOREGROUND CLOUD BANK ═══ */}
      <div className="absolute bottom-0 left-0 right-0 h-[28%] pointer-events-none">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 110" preserveAspectRatio="none" fill="none">
          <path d="M0 110 L0 40 Q40 14 88 30 Q140 48 196 26 Q252 4 306 26 Q356 46 400 24 L400 110 Z" fill="#8A72C4" opacity="0.85" />
          <path d="M0 110 L0 64 Q60 44 128 58 Q200 72 268 54 Q334 38 400 58 L400 110 Z" fill="#7A62B4" opacity="0.9" />
        </svg>
      </div>

      {/* ═══ L6 — ANIMATED OVERLAYS ═══ */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Sparkles */}
        {[
          { l: '16%', t: '44%', s: 2.4, d: 0, dur: 2.2 },
          { l: '60%', t: '40%', s: 2, d: 0.5, dur: 2.6 },
          { l: '86%', t: '52%', s: 1.8, d: 1.0, dur: 2.0 },
          { l: '30%', t: '54%', s: 2.6, d: 1.4, dur: 2.8 },
          { l: '46%', t: '62%', s: 1.7, d: 0.3, dur: 2.4 },
          { l: '72%', t: '60%', s: 2.1, d: 1.8, dur: 2.2 },
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

        {/* Drifting light motes */}
        {[
          { x1: -3, x2: 103, t: '36%', d: 0, dur: 23 },
          { x1: 103, x2: -3, t: '50%', d: 6, dur: 27 },
          { x1: -3, x2: 103, t: '64%', d: 11, dur: 25 },
        ].map((m, i) => (
          <motion.div
            key={`mote${i}`}
            className="absolute h-1 w-1 rounded-full bg-purple-100/60"
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
