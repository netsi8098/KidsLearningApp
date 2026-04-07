import { motion } from 'framer-motion';

interface ScrapbookCardProps {
  entryType: 'milestone' | 'artwork' | 'badge' | 'mood' | 'achievement';
  title: string;
  emoji: string;
  description?: string;
  imageUrl?: string;
  createdAt: Date;
}

const typeStyles: Record<
  ScrapbookCardProps['entryType'],
  { border: string; accent: string; bg: string }
> = {
  milestone: {
    border: 'border-2 border-amber-400',
    accent: 'text-amber-500',
    bg: 'bg-amber-50',
  },
  artwork: {
    border: 'border-2 border-pink-300',
    accent: 'text-pink-500',
    bg: 'bg-pink-50',
  },
  badge: {
    border: 'border-2 border-purple-400',
    accent: 'text-purple-500',
    bg: 'bg-purple-50',
  },
  mood: {
    border: 'border-2 border-teal',
    accent: 'text-teal',
    bg: 'bg-teal/10',
  },
  achievement: {
    border: 'border-2 border-green-400',
    accent: 'text-green-500',
    bg: 'bg-green-50',
  },
};

const typeLabels: Record<ScrapbookCardProps['entryType'], string> = {
  milestone: 'Milestone',
  artwork: 'Artwork',
  badge: 'Badge',
  mood: 'Mood',
  achievement: 'Achievement',
};

function formatDate(date: Date): string {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function ScrapbookCard({
  entryType,
  title,
  emoji,
  description,
  imageUrl,
  createdAt,
}: ScrapbookCardProps) {
  const style = typeStyles[entryType];

  return (
    <motion.div
      className={`bg-white rounded-2xl shadow-md p-4 ${style.border} overflow-hidden`}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', damping: 15 }}
    >
      <div className="flex items-start gap-3">
        {/* Emoji / Image */}
        <div className="flex-shrink-0">
          {entryType === 'artwork' && imageUrl ? (
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100">
              <img
                src={imageUrl}
                alt={title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <motion.div
              className={`w-14 h-14 rounded-xl ${style.bg} flex items-center justify-center`}
              whileHover={{ scale: 1.1 }}
            >
              <span className="text-3xl">{emoji}</span>
            </motion.div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider ${style.accent}`}
            >
              {typeLabels[entryType]}
            </span>
            {entryType === 'milestone' && (
              <span className="text-xs">⭐</span>
            )}
          </div>
          <h4 className="font-bold text-gray-800 text-sm leading-tight truncate">
            {title}
          </h4>
          {description && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
              {description}
            </p>
          )}
          <p className="text-[10px] text-gray-400 mt-1">
            {formatDate(createdAt)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
