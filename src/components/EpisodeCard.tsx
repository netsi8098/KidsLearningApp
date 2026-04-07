import { motion } from 'framer-motion';

interface EpisodeCardProps {
  emoji: string;
  title: string;
  duration: string;
  category: string;
  isPlaying?: boolean;
  isFavorite?: boolean;
  onPlay: () => void;
  onFavoriteToggle?: () => void;
  coverGradient?: string;
  isSingAlong?: boolean;
}

export default function EpisodeCard({
  emoji,
  title,
  duration,
  category,
  isPlaying = false,
  isFavorite = false,
  onPlay,
  onFavoriteToggle,
  coverGradient,
  isSingAlong = false,
}: EpisodeCardProps) {
  return (
    <motion.div
      className="bg-white rounded-[20px] shadow-[0_2px_12px_rgba(45,45,58,0.06)] border border-[#F0EAE0] p-3 flex items-center gap-3 relative overflow-hidden"
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* ── Cover Art Area ─── */}
      <div
        className={`w-16 h-16 rounded-[14px] bg-gradient-to-br ${
          coverGradient || 'from-[#A78BFA] to-[#C4B5FD]'
        } flex items-center justify-center relative flex-shrink-0 overflow-hidden shadow-[0_2px_8px_rgba(167,139,250,0.2)]`}
      >
        {/* Musical note decoration at low opacity */}
        <span className="absolute top-0.5 right-1 text-white/[0.10] text-xs">♪</span>
        {/* Centered emoji */}
        <motion.span
          className="text-3xl relative z-10 drop-shadow-sm"
          animate={
            isPlaying
              ? { scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }
              : {}
          }
          transition={
            isPlaying
              ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
              : {}
          }
        >
          {emoji}
        </motion.span>
        {/* Duration pill in corner */}
        <span className="absolute bottom-0.5 right-0.5 bg-black/25 text-white text-[9px] font-bold px-1 py-[1px] rounded-full backdrop-blur-sm leading-tight">
          {duration}
        </span>
        {/* Sing-along karaoke overlay */}
        {isSingAlong && (
          <span className="absolute top-0.5 left-0.5 bg-[#FFE66D]/90 text-[8px] font-extrabold px-1 py-[1px] rounded-full text-[#FF8C42] leading-tight">
            🎤
          </span>
        )}
        {/* Playing indicator */}
        {isPlaying && (
          <div className="absolute bottom-0.5 left-1 flex items-end gap-[1.5px] h-3">
            {[0.5, 1, 0.3, 0.7, 0.4].map((h, i) => (
              <motion.div
                key={i}
                className="w-[2px] rounded-full bg-white/80"
                animate={{
                  height: [`${h * 12}px`, `${(1 - h) * 12 + 2}px`, `${h * 12}px`],
                }}
                transition={{
                  duration: 0.5 + i * 0.08,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Info ─── */}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-[#2D2D3A] text-sm leading-tight truncate">{title}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-[#9B9BAB] capitalize truncate">
            {category.replace(/-/g, ' ')}
          </span>
        </div>
        {/* Sing Along badge */}
        {isSingAlong && (
          <span className="inline-flex items-center gap-0.5 mt-1 bg-[#FFFCE8] text-[#FF8C42] text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-[#FFE66D]/40">
            🎤 Sing Along
          </span>
        )}
      </div>

      {/* ── Action buttons ─── */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {/* Favorite button */}
        {onFavoriteToggle && (
          <motion.button
            className="w-9 h-9 rounded-full flex items-center justify-center text-lg cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onFavoriteToggle();
            }}
            whileTap={{ scale: 0.8 }}
            animate={isFavorite ? { scale: [1, 1.3, 1] } : {}}
          >
            {isFavorite ? '❤️' : '🤍'}
          </motion.button>
        )}

        {/* Play / Pause button */}
        <motion.button
          className={`w-11 h-11 rounded-full flex items-center justify-center text-lg cursor-pointer ${
            isPlaying
              ? 'bg-gradient-to-br from-[#A78BFA] to-[#FD79A8] text-white shadow-[0_4px_16px_rgba(167,139,250,0.3)]'
              : 'bg-gradient-to-br from-[#A78BFA] to-[#C4B5FD] text-white shadow-[0_2px_8px_rgba(167,139,250,0.2)]'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onPlay();
          }}
          whileTap={{ scale: 0.85 }}
        >
          {isPlaying ? '⏸️' : '▶️'}
        </motion.button>
      </div>
    </motion.div>
  );
}
