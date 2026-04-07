import { motion } from 'framer-motion';
import type { BadgeDefinition } from '../models/types';

interface BadgeCardProps {
  badge: BadgeDefinition;
  earned: boolean;
  delay?: number;
  /** Current progress count (e.g. 7 out of 10) */
  progress?: number;
  /** Total needed to earn the badge (e.g. 10) */
  total?: number;
  /** Human-readable progress hint (e.g. "7/10 letters learned") */
  hint?: string;
  /** Whether this card is featured as "next badge" */
  featured?: boolean;
}

export default function BadgeCard({
  badge,
  earned,
  delay = 0,
  progress,
  total,
  hint,
  featured = false,
}: BadgeCardProps) {
  const showProgress = !earned && progress != null && total != null && total > 0;
  const ratio = showProgress ? Math.min(progress! / total!, 1) : 0;
  const percent = Math.round(ratio * 100);

  return (
    <motion.div
      className={`rounded-2xl p-4 flex flex-col items-center text-center shadow-md relative overflow-hidden ${
        earned
          ? 'bg-white border-2 border-gold/40'
          : featured
            ? 'bg-gold/10 border-2 border-gold/50'
            : 'bg-[#F5F0E8]'
      }`}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', delay }}
    >
      {/* Earned shimmer accent */}
      {earned && (
        <div className="absolute top-0 right-0 bg-gold text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">
          Earned
        </div>
      )}

      <span className={`text-4xl ${earned ? '' : 'grayscale opacity-60'}`}>
        {badge.emoji}
      </span>
      <p className="font-bold text-sm mt-2">{badge.name}</p>
      <p className="text-xs text-gray-500 mt-1">{badge.description}</p>

      {earned && (
        <span className="text-xs text-leaf font-bold mt-1">Unlocked!</span>
      )}

      {/* Progress bar for locked badges */}
      {showProgress && (
        <div className="w-full mt-2">
          <div className="w-full bg-[#F0EAE0] rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #FFD93D, #FF8C42)' }}
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 0.6, delay: delay + 0.2, ease: 'easeOut' }}
            />
          </div>
          {hint && (
            <p className="text-[11px] text-gray-500 mt-1 font-medium">{hint}</p>
          )}
        </div>
      )}
    </motion.div>
  );
}
