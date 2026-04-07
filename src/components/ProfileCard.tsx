import { motion } from 'framer-motion';
import AvatarFrame, { type AvatarFrameType } from './AvatarFrame';

interface ProfileCardProps {
  name: string;
  emoji: string;
  color: string;
  age?: number;
  level?: number;
  totalStars?: number;
  frameType?: AvatarFrameType;
  isLastUsed?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  className?: string;
}

function getLevelFromStars(stars: number): number {
  if (stars >= 200) return 5;
  if (stars >= 100) return 4;
  if (stars >= 50) return 3;
  if (stars >= 20) return 2;
  return 1;
}

const levelLabels: Record<number, string> = {
  1: 'Starter',
  2: 'Explorer',
  3: 'Achiever',
  4: 'Champion',
  5: 'Master',
};

export default function ProfileCard({
  name,
  emoji,
  color,
  age,
  level,
  totalStars = 0,
  frameType = 'basic',
  isLastUsed = false,
  isSelected = false,
  onSelect,
  className = '',
}: ProfileCardProps) {
  const resolvedLevel = level ?? getLevelFromStars(totalStars);

  return (
    <motion.button
      className={`relative bg-white rounded-[24px] border overflow-hidden cursor-pointer transition-shadow duration-200 w-full ${className}`}
      style={{
        boxShadow: isSelected
          ? `0 8px 32px rgba(45,45,58,0.12), 0 0 0 2px ${color}40`
          : isLastUsed
          ? '0 4px 20px rgba(45,45,58,0.08)'
          : '0 2px 12px rgba(45,45,58,0.06)',
        borderColor: isSelected ? `${color}50` : '#F0EAE0',
      }}
      onClick={onSelect}
      animate={{ scale: isSelected ? 1.03 : 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(45,45,58,0.10)' }}
      whileTap={{ scale: 0.97 }}
    >
      {/* Last-used pill badge */}
      {isLastUsed && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10">
          <span
            className="inline-flex items-center px-3 py-0.5 rounded-b-lg text-[10px] font-bold uppercase tracking-wider"
            style={{ backgroundColor: '#FFD93D', color: '#FF8C42' }}
          >
            Last played
          </span>
        </div>
      )}

      <div className="flex flex-col items-center pt-6 pb-5 px-4">
        {/* Avatar */}
        <AvatarFrame
          emoji={emoji}
          color={color}
          size="lg"
          frameType={frameType}
          spotlight={isSelected}
          animated={isSelected}
        />

        {/* Name */}
        <p className="font-extrabold text-lg text-[#2D2D3A] mt-3 truncate max-w-full">
          {name}
        </p>

        {/* Age badge */}
        {age && (
          <span
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold mt-1"
            style={{ backgroundColor: `${color}15`, color }}
          >
            Age {age}
          </span>
        )}

        {/* Level & Stars row */}
        <div className="flex items-center gap-3 mt-2">
          <span className="text-sm font-semibold text-amber-500">
            {'\u2B50'} {totalStars}
          </span>
          <span
            className="text-[11px] font-bold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: `${color}15`, color }}
          >
            Lv.{resolvedLevel} {levelLabels[resolvedLevel]}
          </span>
        </div>
      </div>
    </motion.button>
  );
}
