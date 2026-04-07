import { motion } from 'framer-motion';
import type { RoutineItem } from '../db/database';

interface RoutineTimelineProps {
  items: RoutineItem[];
  currentIndex: number;
  onStepClick?: (index: number) => void;
}

export default function RoutineTimeline({ items, currentIndex, onStepClick }: RoutineTimelineProps) {
  return (
    <div className="relative pl-8">
      {/* Vertical line */}
      <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200" />

      {items.map((item, index) => {
        const isActive = index === currentIndex;
        const isDone = index < currentIndex;
        const isFuture = index > currentIndex;

        return (
          <motion.button
            key={`${item.contentId}-${index}`}
            className={`relative flex items-center gap-3 py-3 w-full text-left cursor-pointer ${
              isFuture ? 'opacity-50' : ''
            }`}
            onClick={() => onStepClick?.(index)}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: isFuture ? 0.5 : 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Timeline dot */}
            <motion.div
              className={`absolute left-[-20px] w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                isDone
                  ? 'bg-leaf border-leaf text-white'
                  : isActive
                  ? 'bg-coral border-coral text-white'
                  : 'bg-white border-gray-300 text-gray-400'
              }`}
              animate={isActive ? { scale: [1, 1.2, 1] } : {}}
              transition={isActive ? { repeat: Infinity, duration: 2 } : {}}
            >
              {isDone ? '✓' : index + 1}
            </motion.div>

            {/* Content */}
            <div
              className={`flex-1 rounded-xl p-3 ${
                isActive
                  ? 'bg-coral/10 border border-coral/20'
                  : isDone
                  ? 'bg-leaf/5 border border-leaf/10'
                  : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{item.emoji}</span>
                <div className="flex-1">
                  <p
                    className={`text-sm font-bold ${
                      isActive ? 'text-coral' : isDone ? 'text-leaf' : 'text-gray-600'
                    }`}
                  >
                    {item.title}
                  </p>
                  <p className="text-xs text-gray-400">{item.durationMinutes} min</p>
                </div>
                {isDone && <span className="text-leaf text-sm font-bold">Done</span>}
                {isActive && (
                  <motion.span
                    className="text-coral text-xs font-bold"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    Now
                  </motion.span>
                )}
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
