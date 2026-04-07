import { useState } from 'react';
import { motion } from 'framer-motion';
import { stampCategories, stamps } from '../data/stampData';

interface StampPickerProps {
  onStampSelect: (emoji: string) => void;
}

export default function StampPicker({ onStampSelect }: StampPickerProps) {
  const [activeCategory, setActiveCategory] = useState(stampCategories[0].key);

  const filteredStamps = stamps.filter((s) => s.category === activeCategory);

  return (
    <div className="p-2">
      {/* Category tabs */}
      <div className="flex gap-1 overflow-x-auto pb-2 mb-2">
        {stampCategories.map((cat) => (
          <motion.button
            key={cat.key}
            className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-bold cursor-pointer ${
              activeCategory === cat.key
                ? 'bg-coral text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
            onClick={() => setActiveCategory(cat.key)}
            whileTap={{ scale: 0.95 }}
          >
            {cat.emoji} {cat.label}
          </motion.button>
        ))}
      </div>

      {/* Stamp grid */}
      <div className="grid grid-cols-4 gap-2">
        {filteredStamps.map((stamp) => (
          <motion.button
            key={stamp.emoji + stamp.label}
            className="w-11 h-11 rounded-lg bg-gray-50 flex items-center justify-center text-2xl cursor-pointer"
            onClick={() => onStampSelect(stamp.emoji)}
            whileTap={{ scale: 0.8 }}
            whileHover={{ scale: 1.15 }}
            title={stamp.label}
          >
            {stamp.emoji}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
