import { motion, AnimatePresence } from 'framer-motion';
import type { RoutineItem } from '../db/database';

interface AvailableContent {
  contentId: string;
  title: string;
  emoji: string;
  durationMinutes: number;
}

interface RoutineBuilderProps {
  items: RoutineItem[];
  onItemsChange: (items: RoutineItem[]) => void;
  availableContent: AvailableContent[];
  showPicker?: boolean;
  onTogglePicker?: () => void;
}

export default function RoutineBuilder({
  items,
  onItemsChange,
  availableContent,
  showPicker = false,
  onTogglePicker,
}: RoutineBuilderProps) {
  const totalMinutes = items.reduce((sum, item) => sum + item.durationMinutes, 0);

  function moveUp(index: number) {
    if (index === 0) return;
    const next = [...items];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    onItemsChange(next);
  }

  function moveDown(index: number) {
    if (index === items.length - 1) return;
    const next = [...items];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    onItemsChange(next);
  }

  function removeItem(index: number) {
    const next = items.filter((_, i) => i !== index);
    onItemsChange(next);
  }

  function addItem(content: AvailableContent) {
    onItemsChange([
      ...items,
      {
        contentId: content.contentId,
        title: content.title,
        emoji: content.emoji,
        durationMinutes: content.durationMinutes,
      },
    ]);
  }

  const addedIds = new Set(items.map((i) => i.contentId));

  return (
    <div className="space-y-3">
      {/* Item list */}
      <AnimatePresence mode="popLayout">
        {items.map((item, index) => (
          <motion.div
            key={`${item.contentId}-${index}`}
            className="bg-white rounded-xl shadow-sm p-3 flex items-center gap-3"
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <span className="text-2xl">{item.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-700 truncate">{item.title}</p>
              <p className="text-xs text-gray-400">{item.durationMinutes} min</p>
            </div>
            <div className="flex items-center gap-1">
              <motion.button
                className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500 cursor-pointer disabled:opacity-30"
                onClick={() => moveUp(index)}
                disabled={index === 0}
                whileTap={{ scale: 0.9 }}
              >
                ↑
              </motion.button>
              <motion.button
                className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500 cursor-pointer disabled:opacity-30"
                onClick={() => moveDown(index)}
                disabled={index === items.length - 1}
                whileTap={{ scale: 0.9 }}
              >
                ↓
              </motion.button>
              <motion.button
                className="w-7 h-7 rounded-full bg-coral/10 flex items-center justify-center text-xs text-coral cursor-pointer"
                onClick={() => removeItem(index)}
                whileTap={{ scale: 0.9 }}
              >
                ✕
              </motion.button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {items.length === 0 && (
        <div className="text-center py-6 text-gray-400 text-sm">
          No activities added yet. Tap the button below to add some!
        </div>
      )}

      {/* Total time */}
      {items.length > 0 && (
        <div className="text-center text-sm text-gray-500 font-medium">
          Total: {totalMinutes} minutes ({items.length} activities)
        </div>
      )}

      {/* Add button */}
      <motion.button
        className="w-full bg-teal/10 text-teal font-bold py-3 rounded-xl text-sm cursor-pointer border-2 border-dashed border-teal/30"
        onClick={onTogglePicker}
        whileTap={{ scale: 0.97 }}
      >
        + Add Activity
      </motion.button>

      {/* Content picker */}
      <AnimatePresence>
        {showPicker && (
          <motion.div
            className="bg-gray-50 rounded-xl p-3 space-y-2 max-h-60 overflow-y-auto"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Available Activities</p>
            {availableContent.map((content) => {
              const alreadyAdded = addedIds.has(content.contentId);
              return (
                <motion.button
                  key={content.contentId}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg text-left cursor-pointer transition-colors ${
                    alreadyAdded
                      ? 'bg-teal/5 opacity-50'
                      : 'bg-white hover:bg-teal/5'
                  }`}
                  onClick={() => !alreadyAdded && addItem(content)}
                  disabled={alreadyAdded}
                  whileTap={{ scale: 0.97 }}
                >
                  <span className="text-xl">{content.emoji}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">{content.title}</p>
                    <p className="text-xs text-gray-400">{content.durationMinutes} min</p>
                  </div>
                  {alreadyAdded ? (
                    <span className="text-xs text-teal font-bold">Added</span>
                  ) : (
                    <span className="text-teal text-lg">+</span>
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
