import { motion } from 'framer-motion';
import AvatarFrame, { type AvatarFrameType } from './AvatarFrame';

interface IdentitySummaryCardProps {
  name: string;
  emoji: string;
  color: string;
  age?: number;
  totalStars?: number;
  level?: number;
  frameType?: AvatarFrameType;
  lastPlayedAt?: Date;
  className?: string;
}

function getLevelFromStars(stars: number): number {
  if (stars >= 200) return 5;
  if (stars >= 100) return 4;
  if (stars >= 50) return 3;
  if (stars >= 20) return 2;
  return 1;
}

function getNextLevelStars(currentLevel: number): number {
  if (currentLevel >= 5) return 200;
  if (currentLevel === 4) return 200;
  if (currentLevel === 3) return 100;
  if (currentLevel === 2) return 50;
  return 20;
}

const levelLabels: Record<number, string> = {
  1: 'Starter',
  2: 'Explorer',
  3: 'Achiever',
  4: 'Champion',
  5: 'Master',
};

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  return `${Math.floor(days / 7)}w ago`;
}

export default function IdentitySummaryCard({
  name,
  emoji,
  color,
  age,
  totalStars = 0,
  level,
  frameType = 'basic',
  lastPlayedAt,
  className = '',
}: IdentitySummaryCardProps) {
  const resolvedLevel = level ?? getLevelFromStars(totalStars);
  const nextLevelStars = getNextLevelStars(resolvedLevel);
  const prevLevelStars = resolvedLevel >= 5 ? 200 : resolvedLevel === 4 ? 100 : resolvedLevel === 3 ? 50 : resolvedLevel === 2 ? 20 : 0;
  const progressPercent = resolvedLevel >= 5
    ? 100
    : Math.min(100, ((totalStars - prevLevelStars) / (nextLevelStars - prevLevelStars)) * 100);

  return (
    <motion.div
      className={`bg-white rounded-[20px] p-4 shadow-[0_2px_12px_rgba(45,45,58,0.06)] border border-[#F0EAE0] ${className}`}
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <AvatarFrame
          emoji={emoji}
          color={color}
          size="md"
          frameType={frameType}
        />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-extrabold text-[#2D2D3A] truncate">{name}</p>
            {age && (
              <span
                className="flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold"
                style={{ backgroundColor: `${color}15`, color }}
              >
                Age {age}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-sm font-semibold text-amber-500">
              {'\u2B50'} {totalStars}
            </span>
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: `${color}15`, color }}
            >
              Lv.{resolvedLevel} {levelLabels[resolvedLevel]}
            </span>
          </div>

          {/* Progress to next level */}
          <div className="mt-1.5 w-full">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[10px] text-[#9B9BAB] font-medium">
                {resolvedLevel >= 5 ? 'Max Level!' : `${totalStars}/${nextLevelStars} to Lv.${resolvedLevel + 1}`}
              </span>
            </div>
            <div className="h-1.5 bg-[#F0EAE0] rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${color}, ${color}CC)`,
                }}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
              />
            </div>
          </div>

          {/* Last played */}
          {lastPlayedAt && (
            <p className="text-[10px] text-[#9B9BAB] mt-1">
              Last played {timeAgo(new Date(lastPlayedAt))}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
