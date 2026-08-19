/**
 * TreehouseWorld — Code-built scene for the Treehouse theme.
 *
 * Warm dusk palette: sunset sky, a big tree with a lantern-lit treehouse,
 * party balloons and drifting fireflies.
 *
 * Layers (back to front):
 *   0. Sky gradient (sunset)
 *   1. Distant elements (sun glow, clouds, far treeline)
 *   2. The great tree + treehouse
 *   3. Balloons
 *   4. Ground mound + lion
 *   5. Foreground grass bank (cards sit here)
 *   6. Animated overlays (fireflies, sparkles, falling leaves)
 *   7. Content (children prop — UI elements)
 */
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import type { WorldProps } from './types';

export default function TreehouseWorld({ mascot, title, children }: WorldProps) {
  return (
    <div className="min-h-dvh relative overflow-hidden">
      {/* ═══ L0 — SUNSET SKY ═══ */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg,
            #4A5FA8 0%,
            #6E72B8 12%,
            #9B7FC0 24%,
            #C98FB0 36%,
            #E8A88E 48%,
            #F0BE92 58%,
            #C89A6E 70%,
            #8A6A48 84%,
            #5D4A32 100%)`,
        }}
      />

      {/* ═══ L1 — DISTANT ELEMENTS ═══ */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Setting sun glow */}
        <motion.div
          className="absolute top-[26%] left-[50%] -translate-x-1/2 w-[60vw] h-[60vw] max-w-[400px] max-h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(255,214,150,0.5) 0%, rgba(255,180,120,0.2) 45%, transparent 72%)' }}
          animate={{ scale: [1, 1.07, 1], opacity: [0.7, 0.95, 0.7] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Dusk clouds — warm underlit */}
        {[
          { t: '8%', l: '-14%', w: 140, o: 0.5, dur: 78 },
          { t: '19%', l: '-24%', w: 110, o: 0.42, dur: 96 },
        ].map((c, i) => (
          <motion.div
            key={`cloud${i}`}
            className="absolute"
            style={{ top: c.t, left: c.l, opacity: c.o }}
            animate={{ x: ['0vw', '130vw'] }}
            transition={{ duration: c.dur, repeat: Infinity, ease: 'linear', delay: i * 9 }}
          >
            <svg width={c.w} height={c.w * 0.42} viewBox="0 0 140 58" fill="none">
              <ellipse cx="42" cy="38" rx="34" ry="18" fill="#F2C9A8" />
              <ellipse cx="72" cy="28" rx="27" ry="22" fill="#F6D3B4" />
              <ellipse cx="98" cy="38" rx="29" ry="16" fill="#F2C9A8" />
            </svg>
          </motion.div>
        ))}

        {/* Far treeline silhouette */}
        <svg className="absolute bottom-[36%] left-0 w-full h-[20%]" viewBox="0 0 400 80" preserveAspectRatio="none" fill="none">
          <path d="M0 80 L0 52 L18 30 L34 52 L52 24 L70 52 L88 34 L108 52 L128 22 L148 52 L170 36 L190 52 L212 26 L232 52 L254 32 L276 52 L298 20 L318 52 L340 34 L360 52 L382 28 L400 52 L400 80 Z" fill="#4A3A28" opacity="0.55" />
        </svg>
      </div>

      {/* ═══ L2 — THE GREAT TREE + TREEHOUSE ═══ */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute bottom-[26%] left-[-2%] w-[58vw] max-w-[330px]"
          style={{ transformOrigin: 'bottom center' }}
          animate={{ rotate: [-0.6, 0.6, -0.6] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg viewBox="0 0 220 260" fill="none" className="w-full h-auto">
            {/* Trunk with bark shading */}
            <path d="M86 260 L86 150 Q84 120 96 96 L124 96 Q136 120 134 150 L134 260 Z" fill="#6B4E33" />
            <path d="M96 260 L96 150 Q95 122 104 100 L114 100 Q110 124 110 150 L110 260 Z" fill="#7D5C3D" opacity="0.75" />
            {/* Roots */}
            <path d="M86 250 Q66 254 54 260 L86 260 Z" fill="#5C4229" />
            <path d="M134 250 Q154 254 168 260 L134 260 Z" fill="#5C4229" />
            {/* Branches */}
            <path d="M110 130 L64 104" stroke="#6B4E33" strokeWidth="11" strokeLinecap="round" />
            <path d="M110 118 L158 92" stroke="#6B4E33" strokeWidth="10" strokeLinecap="round" />
            {/* Canopy */}
            <ellipse cx="62" cy="72" rx="52" ry="42" fill="#3E7A38" />
            <ellipse cx="152" cy="64" rx="56" ry="45" fill="#478A3F" />
            <ellipse cx="108" cy="40" rx="60" ry="46" fill="#4F9A47" />
            <ellipse cx="86" cy="56" rx="30" ry="24" fill="#5CAD52" opacity="0.6" />
            {/* Treehouse platform */}
            <rect x="58" y="130" width="106" height="8" rx="4" fill="#8A6440" />
            {/* Treehouse body */}
            <rect x="70" y="96" width="82" height="36" rx="6" fill="#9A7048" />
            <rect x="70" y="96" width="82" height="12" rx="6" fill="#A97D52" />
            {/* Roof */}
            <path d="M62 98 L111 72 L160 98 Z" fill="#7A5436" />
            {/* Door — warm lantern light spilling out */}
            <rect x="98" y="108" width="20" height="24" rx="4" fill="#FFD98A" />
            <rect x="98" y="108" width="20" height="24" rx="4" fill="none" stroke="#6B4E33" strokeWidth="2" />
            {/* Windows */}
            <rect x="78" y="110" width="13" height="12" rx="3" fill="#FFCF7A" />
            <rect x="128" y="110" width="13" height="12" rx="3" fill="#FFCF7A" />
            {/* Ladder */}
            <path d="M104 138 L104 200 M120 138 L120 200" stroke="#7A5436" strokeWidth="4" strokeLinecap="round" />
            {[148, 162, 176, 190].map((y) => (
              <path key={y} d={`M104 ${y} L120 ${y}`} stroke="#7A5436" strokeWidth="3.5" strokeLinecap="round" />
            ))}
          </svg>
        </motion.div>

        {/* Hanging lanterns — glowing, gently swinging */}
        {[
          { l: '30%', t: '30%', d: 0 },
          { l: '46%', t: '25%', d: 0.8 },
          { l: '60%', t: '32%', d: 1.6 },
        ].map((lg, i) => (
          <motion.div
            key={`lantern${i}`}
            className="absolute"
            style={{ left: lg.l, top: lg.t, transformOrigin: 'top center' }}
            animate={{ rotate: [-6, 6, -6] }}
            transition={{ duration: 4 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: lg.d }}
          >
            <svg width="26" height="42" viewBox="0 0 26 42" fill="none">
              <path d="M13 0 L13 10" stroke="#5C4229" strokeWidth="2" />
              <rect x="5" y="10" width="16" height="20" rx="5" fill="#FFD98A" />
              <rect x="5" y="10" width="16" height="20" rx="5" fill="none" stroke="#8A6440" strokeWidth="2" />
              <rect x="8" y="30" width="10" height="4" rx="2" fill="#8A6440" />
            </svg>
            <motion.div
              className="absolute rounded-full blur-lg"
              style={{ width: 46, height: 46, top: -2, left: -10, background: 'radial-gradient(circle, rgba(255,205,120,0.45) 0%, transparent 70%)' }}
              animate={{ opacity: [0.4, 0.85, 0.4] }}
              transition={{ duration: 2.6 + i * 0.4, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
        ))}
      </div>

      {/* ═══ L3 — BALLOONS ═══ */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[
          { l: '78%', t: '8%', c: '#FF8FAB', s: 44, dur: 6.5 },
          { l: '90%', t: '20%', c: '#4ECDC4', s: 34, dur: 7.8 },
          { l: '68%', t: '3%', c: '#FFD93D', s: 30, dur: 8.6 },
        ].map((b, i) => (
          <motion.div
            key={`balloon${i}`}
            className="absolute"
            style={{ left: b.l, top: b.t }}
            animate={{ y: [0, -16, 0], x: [0, 6, 0], rotate: [-3, 3, -3] }}
            transition={{ duration: b.dur, repeat: Infinity, ease: 'easeInOut', delay: i * 1.2 }}
          >
            <svg width={b.s} height={b.s * 1.55} viewBox="0 0 40 62" fill="none">
              <ellipse cx="20" cy="22" rx="18" ry="21" fill={b.c} />
              <ellipse cx="14" cy="15" rx="5.5" ry="7" fill="white" opacity="0.35" />
              <path d="M20 43 L17 47 L23 47 Z" fill={b.c} />
              <path d="M20 47 Q23 54 19 62" stroke="#FFFFFF" strokeWidth="1.4" opacity="0.5" fill="none" />
            </svg>
          </motion.div>
        ))}
      </div>

      {/* ═══ L4 — GROUND MOUND + LION ═══ */}
      <div className="absolute bottom-[27%] left-1/2 -translate-x-1/2 flex flex-col items-center">
        <motion.div
          className="absolute rounded-full blur-3xl pointer-events-none"
          style={{ width: '45vw', maxWidth: 240, height: '45vw', maxHeight: 240, top: '5%', background: 'radial-gradient(circle, rgba(255,200,120,0.28) 0%, rgba(255,170,90,0.1) 50%, transparent 75%)' }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.65, 0.95, 0.65] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative z-[2]" style={{ marginBottom: '-20px' }}>
          {mascot}
        </div>

        <svg viewBox="0 0 280 75" className="w-[52vw] max-w-[280px] md:max-w-[344px] lg:max-w-[400px] relative z-[1]" fill="none">
          <defs>
            <radialGradient id="th-mound" cx="50%" cy="28%" r="70%">
              <stop offset="0%" stopColor="#7FBF63" />
              <stop offset="60%" stopColor="#569A45" />
              <stop offset="100%" stopColor="#37702C" />
            </radialGradient>
          </defs>
          <ellipse cx="140" cy="34" rx="132" ry="30" fill="url(#th-mound)" />
          <ellipse cx="140" cy="28" rx="120" ry="22" fill="#6FB257" opacity="0.5" />
          <path d="M12 36 Q34 68 78 72 Q140 78 202 72 Q246 68 268 36 Q210 58 140 58 Q70 58 12 36 Z" fill="#5C4229" opacity="0.9" />
          {[[54,26,'#FFD98A'],[92,20,'#FF8FAB'],[186,22,'#FFD98A'],[224,28,'#FFE66D']].map(([cx, cy, f], i) => (
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

      {/* ═══ L5 — FOREGROUND GRASS BANK ═══ */}
      <div className="absolute bottom-0 left-0 right-0 h-[28%] pointer-events-none">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 110" preserveAspectRatio="none" fill="none">
          <path d="M0 110 L0 26 Q52 6 108 20 Q168 34 228 16 Q296 -4 400 20 L400 110 Z" fill="#3F7F32" />
          <path d="M0 110 L0 50 Q80 32 156 46 Q236 60 400 42 L400 110 Z" fill="#356C2A" opacity="0.9" />
        </svg>
        {/* Glowing foreground mushrooms/flowers */}
        {[
          { l: '10%', b: '50%', c: '#FFD98A' },
          { l: '24%', b: '42%', c: '#FF8FAB' },
          { l: '72%', b: '52%', c: '#FFD98A' },
          { l: '88%', b: '44%', c: '#FFE66D' },
        ].map((f, i) => (
          <motion.div
            key={`fg${i}`}
            className="absolute rounded-full"
            style={{ left: f.l, bottom: f.b, width: 7, height: 7, background: f.c, boxShadow: `0 0 8px ${f.c}` }}
            animate={{ opacity: [0.5, 1, 0.5], y: [0, -2, 0] }}
            transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.35 }}
          />
        ))}
      </div>

      {/* ═══ L6 — ANIMATED OVERLAYS ═══ */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Fireflies — the signature dusk motif */}
        {[
          { t: '38%', l: '18%', dur: 14, dx: 40, dy: -28 },
          { t: '48%', l: '62%', dur: 17, dx: -34, dy: -22 },
          { t: '32%', l: '80%', dur: 19, dx: -28, dy: -34 },
          { t: '56%', l: '38%', dur: 16, dx: 30, dy: -26 },
          { t: '44%', l: '48%', dur: 21, dx: -22, dy: -30 },
        ].map((f, i) => (
          <motion.div
            key={`ff${i}`}
            className="absolute"
            style={{ top: f.t, left: f.l }}
            animate={{ x: [0, f.dx, f.dx * 0.4, 0], y: [0, f.dy, f.dy * 0.5, 0] }}
            transition={{ duration: f.dur, repeat: Infinity, ease: 'easeInOut', delay: i * 1.6 }}
          >
            <motion.div
              className="rounded-full"
              style={{ width: 5, height: 5, background: '#FFE9A8', boxShadow: '0 0 10px 3px rgba(255,220,130,0.75)' }}
              animate={{ opacity: [0.15, 1, 0.15], scale: [0.7, 1.25, 0.7] }}
              transition={{ duration: 1.8 + i * 0.3, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
        ))}

        {/* Falling leaves */}
        {[
          { l: '22%', dur: 15, d: 0, c: '#C87F42' },
          { l: '55%', dur: 19, d: 4, c: '#B36B38' },
          { l: '82%', dur: 17, d: 8, c: '#D9924E' },
        ].map((lf, i) => (
          <motion.div
            key={`leaf${i}`}
            className="absolute"
            style={{ left: lf.l, top: '-6%' }}
            animate={{ y: ['0vh', '108vh'], x: [0, 26, -18, 22, 0], rotate: [0, 180, 360] }}
            transition={{ duration: lf.dur, repeat: Infinity, ease: 'linear', delay: lf.d }}
          >
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <path d="M7 1 Q13 6 7 13 Q1 6 7 1 Z" fill={lf.c} />
              <path d="M7 2 L7 12" stroke="#8A5A2E" strokeWidth="0.8" />
            </svg>
          </motion.div>
        ))}

        {/* Star sparkles in the upper sky */}
        {[
          { l: '12%', t: '6%', s: 2, dur: 2.4, d: 0 },
          { l: '34%', t: '10%', s: 1.6, dur: 2.1, d: 0.6 },
          { l: '58%', t: '5%', s: 2.2, dur: 2.7, d: 1.1 },
          { l: '86%', t: '12%', s: 1.7, dur: 2.3, d: 1.7 },
        ].map((p, i) => (
          <motion.div
            key={`st${i}`}
            className="absolute rounded-full"
            style={{
              left: p.l, top: p.t, width: p.s * 2, height: p.s * 2,
              background: 'white', boxShadow: `0 0 ${p.s * 5}px rgba(255,255,255,0.8)`,
            }}
            animate={{ opacity: [0.1, 0.8, 0.1], scale: [0.6, 1.15, 0.6] }}
            transition={{ duration: p.dur, repeat: Infinity, ease: 'easeInOut', delay: p.d }}
          />
        ))}
      </div>

      {/* ═══ L7 — CONTENT ═══ */}
      <div className="relative z-10 min-h-dvh flex flex-col">{children}</div>
    </div>
  );
}
