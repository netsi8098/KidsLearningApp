import { motion, AnimatePresence } from 'framer-motion';

interface FavoriteButtonProps {
  isFavorite: boolean;
  onToggle: () => void;
  size?: 'sm' | 'md';
}

export default function FavoriteButton({ isFavorite, onToggle, size = 'md' }: FavoriteButtonProps) {
  const sizeClass = size === 'sm' ? 'text-lg w-8 h-8' : 'text-2xl w-10 h-10';

  return (
    <motion.button
      className={`${sizeClass} flex items-center justify-center rounded-full cursor-pointer`}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      whileTap={{ scale: 0.8 }}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={isFavorite ? 'filled' : 'empty'}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          transition={{ type: 'spring', damping: 10, stiffness: 300 }}
        >
          {isFavorite ? '❤️' : '🤍'}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
