import { motion } from 'framer-motion';
import { emotionsData } from '../data/emotionsData';

interface EmotionPickerProps {
  onSelect: (mood: string) => void;
  selectedMood?: string;
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.8 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

export default function EmotionPicker({ onSelect, selectedMood }: EmotionPickerProps) {
  return (
    <motion.div
      className="grid grid-cols-4 gap-3"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {emotionsData.map((emotion) => {
        const isSelected = selectedMood === emotion.key;
        return (
          <motion.button
            key={emotion.key}
            className="flex flex-col items-center gap-1 p-3 rounded-2xl cursor-pointer transition-colors bg-white shadow-sm"
            style={
              isSelected
                ? { boxShadow: `0 0 0 3px ${emotion.color}`, background: `${emotion.color}18` }
                : undefined
            }
            variants={itemVariants}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => onSelect(emotion.key)}
          >
            <span className="text-4xl leading-none">{emotion.emoji}</span>
            <span className="text-[11px] font-bold text-gray-600 leading-tight text-center">
              {emotion.label}
            </span>
          </motion.button>
        );
      })}
    </motion.div>
  );
}
