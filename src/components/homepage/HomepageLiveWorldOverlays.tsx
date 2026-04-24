import { motion } from 'framer-motion';

type OverlayProps = {
  className?: string;
};

export function RiverGardenOverlays({ className }: OverlayProps) {
  return (
    <div className={className}>
      <motion.div
        className="absolute left-[6%] top-[58%] h-24 w-28 rounded-full bg-cyan-200/20 blur-2xl"
        animate={{ opacity: [0.35, 0.55, 0.35], scale: [1, 1.08, 1] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute left-[9%] top-[61%] h-[2px] w-24 bg-white/60"
        animate={{ x: [0, 10, 0], opacity: [0.3, 0.85, 0.3] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute right-[11%] top-[37%] h-8 w-12 rounded-full bg-cyan-300/25 blur-md"
        animate={{ x: [0, -12, 0], y: [0, 4, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute left-[18%] top-[18%] h-10 w-10 rounded-full border border-white/35 bg-white/10"
        animate={{ y: [0, -12, 0], opacity: [0.45, 0.8, 0.45] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute right-[18%] top-[21%] h-12 w-12 rounded-full border border-white/30 bg-white/10"
        animate={{ y: [0, -10, 0], x: [0, 6, 0] }}
        transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
      />
      <motion.div
        className="absolute right-[18%] top-[31%] text-2xl"
        animate={{ x: [0, 14, 0], y: [0, -4, 0], rotate: [0, 4, 0] }}
        transition={{ duration: 4.6, repeat: Infinity, ease: 'easeInOut' }}
      >
        🐟
      </motion.div>
      <motion.div
        className="absolute left-[23%] top-[23%] text-xl"
        animate={{ x: [0, 10, 0], y: [0, 6, 0] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      >
        🐠
      </motion.div>
      {[
        'left-[14%] top-[15%]',
        'left-[62%] top-[16%]',
        'right-[14%] top-[19%]',
        'left-[48%] top-[44%]',
        'right-[22%] top-[56%]',
      ].map((pos, i) => (
        <motion.div
          key={pos}
          className={`absolute ${pos} h-2 w-2 rounded-full bg-white/80 shadow-[0_0_18px_rgba(255,255,255,0.8)]`}
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.15, 0.8] }}
          transition={{ duration: 2.1 + i * 0.35, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 }}
        />
      ))}
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
