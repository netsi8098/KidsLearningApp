import { motion } from 'framer-motion';
import { emotionsData } from '../data/emotionsData';
import EmotionFace from './svg/EmotionFaces';

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
            className="flex flex-col items-center gap-1.5 p-3 rounded-3xl cursor-pointer transition-colors tap-bounce"
            style={{
              background: isSelected ? `${emotion.color}20` : 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(8px)',
              boxShadow: isSelected
                ? `0 0 0 3px ${emotion.color}, 0 4px 16px ${emotion.color}30`
                : '0 2px 8px rgba(45,45,58,0.06)',
            }}
            variants={itemVariants}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => onSelect(emotion.key)}
          >
            <EmotionFace emotion={emotion.key} size={56} />
            <span className="text-[11px] font-bold text-gray-600 leading-tight text-center font-display">
              {emotion.label}
            </span>
          </motion.button>
        );
      })}
    </motion.div>
  );
}
