import { motion } from 'framer-motion';

interface QueueCardProps {
  emoji: string;
  title: string;
  contentType: string;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

const typeBadgeColors: Record<string, string> = {
  video: 'bg-red-100 text-red-600',
  audio: 'bg-purple-100 text-purple-600',
  story: 'bg-blue-100 text-blue-600',
};

export default function QueueCard({
  emoji,
  title,
  contentType,
  onRemove,
  onMoveUp,
  onMoveDown,
  isFirst = false,
  isLast = false,
}: QueueCardProps) {
  return (
    <motion.div
      className="bg-white rounded-xl shadow-sm p-3 flex items-center gap-3"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      layout
    >
      {/* Emoji */}
      <span className="text-2xl flex-shrink-0">{emoji}</span>

      {/* Title + badge */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-gray-700 truncate">{title}</p>
        <span
          className={`inline-block mt-0.5 text-[10px] font-bold rounded-full px-2 py-0.5 ${
            typeBadgeColors[contentType] ?? 'bg-gray-100 text-gray-500'
          }`}
        >
          {contentType}
        </span>
      </div>

      {/* Reorder arrows */}
      <div className="flex flex-col gap-0.5">
        {onMoveUp && (
          <motion.button
            className={`w-7 h-7 rounded-md flex items-center justify-center text-xs cursor-pointer ${
              isFirst
                ? 'bg-gray-50 text-gray-300'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={onMoveUp}
            disabled={isFirst}
            whileTap={!isFirst ? { scale: 0.9 } : undefined}
            aria-label="Move up"
          >
            ▲
          </motion.button>
        )}
        {onMoveDown && (
          <motion.button
            className={`w-7 h-7 rounded-md flex items-center justify-center text-xs cursor-pointer ${
              isLast
                ? 'bg-gray-50 text-gray-300'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={onMoveDown}
            disabled={isLast}
            whileTap={!isLast ? { scale: 0.9 } : undefined}
            aria-label="Move down"
          >
            ▼
          </motion.button>
        )}
      </div>

      {/* Remove button */}
      <motion.button
        className="w-8 h-8 rounded-full bg-red-50 text-red-400 flex items-center justify-center text-sm font-bold cursor-pointer hover:bg-red-100"
        onClick={onRemove}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Remove from queue"
      >
        ✕
      </motion.button>
    </motion.div>
  );
}
