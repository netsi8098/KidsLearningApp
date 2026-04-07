import { motion } from 'framer-motion';

interface SeasonalBannerProps {
  theme: {
    name: string;
    emoji: string;
    color: string;
    bannerMessage: string;
  };
}

export default function SeasonalBanner({ theme }: SeasonalBannerProps) {
  return (
    <motion.div
      className="rounded-[20px] p-5 text-white overflow-hidden relative"
      style={{
        background: `linear-gradient(135deg, ${theme.color} 0%, ${theme.color}DD 50%, ${theme.color}BB 100%)`,
        boxShadow: `0 4px 20px ${theme.color}30, 0 2px 8px rgba(0,0,0,0.06)`,
      }}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Glass decorative overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 60%)',
          borderRadius: '20px',
        }}
      />

      {/* Background decorative emoji - floating */}
      <motion.span
        className="absolute -top-2 -right-2 text-7xl opacity-15 pointer-events-none select-none"
        aria-hidden="true"
        animate={{ y: [0, -4, 0], x: [0, 2, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        {theme.emoji}
      </motion.span>

      {/* Secondary floating emoji */}
      <motion.span
        className="absolute bottom-1 right-12 text-3xl opacity-10 pointer-events-none select-none"
        aria-hidden="true"
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      >
        {theme.emoji}
      </motion.span>

      <div className="relative z-10 flex items-start gap-3">
        <motion.span
          className="text-4xl flex-shrink-0 drop-shadow-sm"
          animate={{ rotate: [0, -8, 8, -8, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        >
          {theme.emoji}
        </motion.span>
        <div className="min-w-0">
          <h3
            className="font-extrabold text-lg leading-tight mb-1"
            style={{ textShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
          >
            {theme.name}
          </h3>
          <p className="text-sm font-medium opacity-85 leading-snug">
            {theme.bannerMessage}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
