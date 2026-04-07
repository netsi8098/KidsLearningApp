import { motion } from 'framer-motion';
import { getCharacterById } from '../data/charactersData';
import { useApp } from '../context/AppContext';

interface MascotBubbleProps {
  message: string;
  characterId?: string;
}

export default function MascotBubble({ message, characterId }: MascotBubbleProps) {
  const { activeCharacter } = useApp();
  const character = getCharacterById(characterId ?? activeCharacter ?? 'leo');

  return (
    <motion.div
      className="flex items-start gap-3 max-w-sm mx-auto"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      {/* Character avatar with gradient ring */}
      <div className="relative flex-shrink-0">
        <motion.div
          className="w-14 h-14 rounded-[18px] flex items-center justify-center text-[30px] relative"
          style={{
            background: `linear-gradient(145deg, ${character.color}30, ${character.color}15)`,
            boxShadow: `0 4px 16px ${character.color}20, inset 0 1px 2px rgba(255,255,255,0.4)`,
            border: `2px solid ${character.color}30`,
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.1, stiffness: 400, damping: 15 }}
        >
          {character.emoji}
        </motion.div>
        {/* Online dot */}
        <motion.div
          className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white"
          style={{ background: `linear-gradient(135deg, ${character.color}, ${character.color}CC)` }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Speech bubble */}
      <motion.div
        className="relative rounded-[16px] px-4 py-3 flex-1"
        style={{
          background: 'rgba(255,255,255,0.80)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 2px 16px rgba(0,0,0,0.04), inset 0 1px 1px rgba(255,255,255,0.5)',
          border: '1px solid rgba(255,255,255,0.6)',
        }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', delay: 0.2, stiffness: 300, damping: 20 }}
      >
        {/* Bubble tail */}
        <div
          className="absolute left-[-7px] top-4 w-0 h-0"
          style={{
            borderTop: '6px solid transparent',
            borderBottom: '6px solid transparent',
            borderRight: '7px solid rgba(255,255,255,0.80)',
          }}
        />
        <p className="text-[13px] font-semibold text-gray-700 leading-relaxed">
          {message}
        </p>
      </motion.div>
    </motion.div>
  );
}
