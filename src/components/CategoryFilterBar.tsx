import { motion } from 'framer-motion';

interface CategoryFilterBarProps {
  categories: { key: string; label: string; emoji: string }[];
  activeCategory: string;
  onCategoryChange: (key: string) => void;
}

export default function CategoryFilterBar({
  categories,
  activeCategory,
  onCategoryChange,
}: CategoryFilterBarProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory">
      <motion.button
        className={`flex-shrink-0 snap-start rounded-full px-3 py-1.5 text-xs font-bold cursor-pointer transition-colors ${
          activeCategory === 'all'
            ? 'bg-coral text-white'
            : 'bg-white text-gray-500 shadow-sm'
        }`}
        onClick={() => onCategoryChange('all')}
        whileTap={{ scale: 0.95 }}
      >
        All
      </motion.button>
      {categories.map((cat) => (
        <motion.button
          key={cat.key}
          className={`flex-shrink-0 snap-start flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold cursor-pointer transition-colors ${
            activeCategory === cat.key
              ? 'bg-coral text-white'
              : 'bg-white text-gray-500 shadow-sm'
          }`}
          onClick={() => onCategoryChange(cat.key)}
          whileTap={{ scale: 0.95 }}
        >
          <span>{cat.emoji}</span>
          <span>{cat.label}</span>
        </motion.button>
      ))}
    </div>
  );
}
