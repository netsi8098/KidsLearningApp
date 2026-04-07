import { motion } from 'framer-motion';
import FavoriteButton from './FavoriteButton';

interface RecipeCardProps {
  emoji: string;
  title: string;
  prepTime: string;
  difficulty: 'easy' | 'medium' | 'hard';
  ageGroup: string;
  isFavorite?: boolean;
  onClick: () => void;
  onFavoriteToggle?: () => void;
}

const difficultyStars: Record<string, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
};

const difficultyColors: Record<string, string> = {
  easy: 'text-leaf',
  medium: 'text-amber-500',
  hard: 'text-coral',
};

const difficultyBadge: Record<string, { label: string; bg: string; text: string; border: string }> = {
  easy: { label: 'Easy', bg: '#EDFAEF', text: '#6BCB77', border: '#C5EECA' },
  medium: { label: 'Medium', bg: '#FFFCE8', text: '#D4A017', border: '#FFE680' },
  hard: { label: 'Hard', bg: '#FFF0F0', text: '#FF6B6B', border: '#FFD4D4' },
};

export default function RecipeCard({
  emoji,
  title,
  prepTime,
  difficulty,
  ageGroup,
  isFavorite: isFav = false,
  onClick,
  onFavoriteToggle,
}: RecipeCardProps) {
  const starCount = difficultyStars[difficulty] ?? 1;
  const badge = difficultyBadge[difficulty] ?? difficultyBadge.easy;

  return (
    <motion.button
      className="bg-white rounded-[20px] shadow-[0_2px_12px_rgba(45,45,58,0.06)] border border-[#F0EAE0] p-4 text-left cursor-pointer relative w-full overflow-hidden"
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
    >
      {/* Warm tinted background at top */}
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#FFF3EB] to-transparent rounded-t-[20px] pointer-events-none" />

      {/* Favorite button */}
      {onFavoriteToggle && (
        <div className="absolute top-2 right-2 z-10">
          <FavoriteButton
            isFavorite={isFav}
            onToggle={onFavoriteToggle}
            size="sm"
          />
        </div>
      )}

      {/* Emoji */}
      <motion.span
        className="text-5xl block mb-2 relative z-[1]"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 10 }}
      >
        {emoji}
      </motion.span>

      {/* Title */}
      <h3 className="font-bold text-[#2D2D3A] text-sm mb-2 pr-6 relative z-[1]">{title}</h3>

      {/* Badges row */}
      <div className="flex flex-wrap gap-1.5 relative z-[1]">
        {/* Prep time pill - prominent */}
        <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF3EB] border border-[#FFE0C4] px-2.5 py-0.5 text-xs text-[#FF8C42] font-bold">
          <span className="text-[10px]">🕐</span> {prepTime}
        </span>

        {/* Difficulty badge */}
        <span
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold"
          style={{ backgroundColor: badge.bg, color: badge.text, border: `1px solid ${badge.border}` }}
        >
          {badge.label}
        </span>

        {/* Difficulty stars */}
        <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium ${difficultyColors[difficulty]}`}>
          {Array.from({ length: starCount }).map((_, i) => (
            <span key={i} className="text-[10px]">⭐</span>
          ))}
        </span>
      </div>

      {/* Age badge */}
      <div className="mt-1.5 relative z-[1]">
        <span className="inline-block rounded-full bg-grape/15 px-2 py-0.5 text-xs text-grape font-medium">
          {ageGroup === 'all' ? 'All ages' : `Ages ${ageGroup}`}
        </span>
      </div>
    </motion.button>
  );
}
