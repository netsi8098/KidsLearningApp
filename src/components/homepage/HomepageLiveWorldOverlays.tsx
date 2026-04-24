import { motion } from 'framer-motion';

type OverlayProps = {
  className?: string;
};

export function RiverGardenOverlays({ className }: OverlayProps) {
  return (
    <div className={className}>
      {/* ── ATMOSPHERIC LIGHT — scene-wide breathing glow ── */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-yellow-100/0 via-yellow-100/8 to-cyan-100/0"
        animate={{ opacity: [0, 0.15, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Warm sunlight bloom — top center */}
      <motion.div
        className="absolute top-[5%] left-[45%] w-48 h-48 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(255,250,200,0.2) 0%, transparent 70%)' }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* ── WATER SHIMMER — multiple layers for depth ── */}
      {/* Wide water glow */}
      <motion.div
        className="absolute left-0 right-0 top-[65%] h-20 bg-cyan-200/10 blur-2xl"
        animate={{ opacity: [0.2, 0.4, 0.2], scaleX: [1, 1.03, 1] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Water surface light streaks */}
      {[
        { l: '5%', t: '68%', w: 28, d: 0 },
        { l: '25%', t: '72%', w: 22, d: 0.8 },
        { l: '50%', t: '66%', w: 32, d: 1.5 },
        { l: '70%', t: '74%', w: 20, d: 0.4 },
        { l: '85%', t: '70%', w: 25, d: 2.0 },
      ].map((s, i) => (
        <motion.div key={`ws${i}`}
          className="absolute h-[1.5px] rounded-full bg-white/50"
          style={{ left: s.l, top: s.t, width: s.w }}
          animate={{ x: [0, 12, 0], opacity: [0.15, 0.7, 0.15] }}
          transition={{ duration: 2.5 + i * 0.3, repeat: Infinity, ease: 'easeInOut', delay: s.d }}
        />
      ))}
      {/* Waterfall mist */}
      <motion.div
        className="absolute left-[3%] top-[55%] w-16 h-20 rounded-full bg-white/8 blur-xl"
        animate={{ opacity: [0.1, 0.3, 0.1], y: [0, 4, 0] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* ── FLOATING BUBBLES — glass-like, different depths ── */}
      {[
        { l: '16%', t: '16%', s: 42, d: 0 },
        { l: '78%', t: '19%', s: 48, d: 0.6 },
        { l: '10%', t: '35%', s: 24, d: 1.5 },
        { l: '60%', t: '12%', s: 30, d: 2.2 },
      ].map((b, i) => (
        <motion.div key={`bb${i}`}
          className="absolute rounded-full"
          style={{ left: b.l, top: b.t, width: b.s, height: b.s, border: '1.5px solid rgba(255,255,255,0.25)', background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.15), transparent 60%)' }}
          animate={{ y: [0, -14, 0], x: [0, i % 2 ? 6 : -6, 0], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 5 + i, repeat: Infinity, ease: 'easeInOut', delay: b.d }}
        />
      ))}

      {/* ── DRIFTING FISH ── */}
      <motion.div
        className="absolute left-[20%] top-[22%] text-2xl"
        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
        animate={{ x: [0, 30, 10, 40, 0], y: [0, -6, 4, -3, 0], rotate: [0, 5, -3, 4, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      >🐠</motion.div>
      <motion.div
        className="absolute right-[15%] top-[30%] text-xl"
        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
        animate={{ x: [0, -25, -5, -35, 0], y: [0, -4, 5, -2, 0], scaleX: [-1, -1, -1, -1, -1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      >🐟</motion.div>

      {/* ── SPARKLE PARTICLES — different sizes, depths, speeds ── */}
      {[
        { l: '12%', t: '12%', s: 3, d: 0, dur: 2.2 },
        { l: '58%', t: '14%', s: 2.5, d: 0.5, dur: 2.8 },
        { l: '82%', t: '18%', s: 2, d: 1.0, dur: 2.0 },
        { l: '35%', t: '8%', s: 3.5, d: 1.5, dur: 3.0 },
        { l: '45%', t: '42%', s: 2, d: 0.3, dur: 2.5 },
        { l: '72%', t: '52%', s: 2.5, d: 2.0, dur: 2.3 },
        { l: '8%', t: '45%', s: 1.5, d: 0.8, dur: 1.8 },
        { l: '90%', t: '35%', s: 2, d: 1.2, dur: 2.6 },
        { l: '28%', t: '55%', s: 3, d: 0.2, dur: 2.1 },
        { l: '65%', t: '60%', s: 1.5, d: 1.8, dur: 2.4 },
      ].map((p, i) => (
        <motion.div key={`sp${i}`}
          className="absolute rounded-full"
          style={{ left: p.l, top: p.t, width: p.s * 2, height: p.s * 2, background: 'white', boxShadow: `0 0 ${p.s * 6}px rgba(255,255,255,0.9), 0 0 ${p.s * 2}px rgba(255,255,255,0.5)` }}
          animate={{ opacity: [0.1, 0.9, 0.1], scale: [0.6, 1.2, 0.6] }}
          transition={{ duration: p.dur, repeat: Infinity, ease: 'easeInOut', delay: p.d }}
        />
      ))}

      {/* ── FLOATING POLLEN / LIGHT MOTES — drifting slowly across scene ── */}
      {[
        { x1: -5, x2: 105, t: '20%', d: 0, dur: 18 },
        { x1: 105, x2: -5, t: '35%', d: 4, dur: 22 },
        { x1: -5, x2: 105, t: '50%', d: 8, dur: 20 },
        { x1: 105, x2: -5, t: '15%', d: 2, dur: 25 },
      ].map((m, i) => (
        <motion.div key={`mote${i}`}
          className="absolute h-1 w-1 rounded-full bg-yellow-200/60"
          style={{ top: m.t, left: `${m.x1}%` }}
          animate={{ left: [`${m.x1}%`, `${m.x2}%`], y: [0, -20, 10, -15, 0], opacity: [0, 0.6, 0.4, 0.7, 0] }}
          transition={{ duration: m.dur, repeat: Infinity, ease: 'linear', delay: m.d }}
        />
      ))}

      {/* ── RAINBOW GLOW PULSE ── */}
      <motion.div
        className="absolute right-[2%] top-[8%] w-32 h-32 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.08) 0%, rgba(255,107,107,0.04) 40%, transparent 70%)' }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* ── CLOUD DRIFT — very slow, subtle ── */}
      <motion.div
        className="absolute top-[2%] left-[10%] w-40 h-12 rounded-full bg-white/6 blur-lg"
        animate={{ x: [0, 30, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-[6%] right-[15%] w-32 h-10 rounded-full bg-white/5 blur-lg"
        animate={{ x: [0, -20, 0] }}
        transition={{ duration: 35, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
      />
    </div>
  );
}

export function TreehouseVillageOverlays({ className }: OverlayProps) {
  return (
    <div className={className}>
      {[
        'left-[10%] top-[18%]',
        'left-[34%] top-[12%]',
        'right-[22%] top-[20%]',
      ].map((pos, i) => (
        <motion.div
          key={pos}
          className={`absolute ${pos} h-10 w-[2px] bg-white/20 origin-top`}
          animate={{ rotate: [-2, 2, -2] }}
          transition={{ duration: 2.4 + i * 0.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
        >
          <div className="absolute left-1/2 top-full h-4 w-4 -translate-x-1/2 rounded-full bg-amber-200 shadow-[0_0_24px_rgba(251,191,36,0.9)]" />
        </motion.div>
      ))}
      <motion.div
        className="absolute right-[26%] top-[22%] origin-top rounded-xl bg-black/0 px-3 py-1"
        animate={{ rotate: [-1.5, 1.5, -1.5] }}
        transition={{ duration: 3.1, repeat: Infinity, ease: 'easeInOut' }}
      />
      {[
        'left-[18%] top-[16%]',
        'left-[58%] top-[22%]',
        'right-[16%] top-[18%]',
        'right-[24%] top-[48%]',
        'left-[46%] top-[54%]',
      ].map((pos, i) => (
        <motion.div
          key={pos}
          className={`absolute ${pos} h-1.5 w-1.5 rounded-full bg-yellow-200 shadow-[0_0_20px_rgba(253,224,71,0.95)]`}
          animate={{ opacity: [0.2, 1, 0.2], y: [0, -5, 0] }}
          transition={{ duration: 1.8 + i * 0.25, repeat: Infinity, ease: 'easeInOut', delay: i * 0.15 }}
        />
      ))}
      {[
        'left-[24%] top-[10%]',
        'left-[72%] top-[8%]',
        'right-[10%] top-[26%]',
        'left-[52%] top-[66%]',
      ].map((pos, i) => (
        <motion.div
          key={pos}
          className={`absolute ${pos} text-lg`}
          animate={{ y: [0, 20, 34], x: [0, 6, -2], rotate: [0, 12, -8] }}
          transition={{ duration: 7 + i, repeat: Infinity, ease: 'linear', delay: i * 0.9 }}
        >
          🍃
        </motion.div>
      ))}
    </div>
  );
}

export function SkyIslandsOverlays({ className }: OverlayProps) {
  return (
    <div className={className}>
      <motion.div
        className="absolute left-[12%] top-[18%] text-7xl"
        animate={{ y: [0, -10, 0], rotate: [-2, 2, -2] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        🎈
      </motion.div>
      <motion.div
        className="absolute right-[20%] top-[34%] text-5xl"
        animate={{ x: [0, 18, 0], y: [0, -6, 0], rotate: [-6, 6, -6] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        🚀
      </motion.div>
      <motion.div
        className="absolute right-[26%] top-[42%] h-16 w-1 rounded-full bg-gradient-to-b from-pink-300/0 via-pink-300/60 to-yellow-200/0 blur-sm"
        animate={{ opacity: [0.2, 0.9, 0.2], scaleY: [0.8, 1.1, 0.8] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      />
      {[
        'left-[18%] top-[14%]',
        'left-[34%] top-[22%]',
        'left-[62%] top-[16%]',
        'right-[14%] top-[14%]',
        'right-[28%] top-[24%]',
      ].map((pos, i) => (
        <motion.div
          key={pos}
          className={`absolute ${pos} text-2xl`}
          animate={{ opacity: [0.25, 1, 0.25], scale: [0.9, 1.12, 0.9] }}
          transition={{ duration: 2 + i * 0.35, repeat: Infinity, ease: 'easeInOut', delay: i * 0.25 }}
        >
          ✨
        </motion.div>
      ))}
      <motion.div
        className="absolute right-[12%] top-[11%] text-6xl"
        animate={{ rotate: [-4, 4, -4], y: [0, -6, 0] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        🪐
      </motion.div>
    </div>
  );
}

export function SunnyMeadowOverlays({ className }: OverlayProps) {
  return (
    <div className={className}>
      {[
        'left-[20%] top-[20%]',
        'left-[28%] top-[32%]',
        'right-[20%] top-[22%]',
        'right-[30%] top-[34%]',
      ].map((pos, i) => (
        <motion.div
          key={pos}
          className={`absolute ${pos} text-2xl`}
          animate={{ x: [0, 18, 0], y: [0, -10, 0], rotate: [-6, 6, -6] }}
          transition={{ duration: 4 + i * 0.3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.35 }}
        >
          🦋
        </motion.div>
      ))}
      {[
        'left-[14%] top-[16%]',
        'left-[54%] top-[14%]',
        'right-[18%] top-[18%]',
        'left-[62%] top-[48%]',
        'right-[28%] top-[58%]',
      ].map((pos, i) => (
        <motion.div
          key={pos}
          className={`absolute ${pos} h-2 w-2 rounded-full bg-yellow-100 shadow-[0_0_18px_rgba(255,255,255,0.95)]`}
          animate={{ opacity: [0.25, 1, 0.25], scale: [0.75, 1.15, 0.75] }}
          transition={{ duration: 2.3 + i * 0.2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.1 }}
        />
      ))}
    </div>
  );
}

export function HomepageWorldOverlay({
  worldId,
  className,
}: {
  worldId: 'river-garden' | 'treehouse-village' | 'sky-islands' | 'sunny-meadow';
  className?: string;
}) {
  if (worldId === 'river-garden') return <RiverGardenOverlays className={className} />;
  if (worldId === 'treehouse-village') return <TreehouseVillageOverlays className={className} />;
  if (worldId === 'sky-islands') return <SkyIslandsOverlays className={className} />;
  return <SunnyMeadowOverlays className={className} />;
}
