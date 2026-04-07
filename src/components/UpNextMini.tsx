import { motion } from 'framer-motion';

interface UpNextMiniProps {
  emoji: string;
  title: string;
  onPlay: () => void;
  onDismiss: () => void;
}

export default function UpNextMini({
  emoji,
  title,
  onPlay,
  onDismiss,
}: UpNextMiniProps) {
  return (
    <motion.div
      className="bg-teal rounded-xl px-4 py-3 flex items-center gap-3 shadow-md"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -20, opacity: 0 }}
    >
      {/* Label */}
      <span className="text-xs font-bold text-white/80 whitespace-nowrap">
        Up Next:
      </span>

      {/* Emoji + title */}
      <span className="text-lg flex-shrink-0">{emoji}</span>
      <span className="text-sm font-bold text-white truncate flex-1 min-w-0">
        {title}
      </span>

      {/* Play button */}
      <motion.button
        className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white cursor-pointer"
        onClick={onPlay}
        whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.35)' }}
        whileTap={{ scale: 0.9 }}
        aria-label="Play next item"
      >
        ▶
      </motion.button>

      {/* Dismiss button */}
      <motion.button
        className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center text-white/70 text-xs cursor-pointer"
        onClick={onDismiss}
        whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.3)' }}
        whileTap={{ scale: 0.9 }}
        aria-label="Dismiss"
      >
        ✕
      </motion.button>
    </motion.div>
  );
}
