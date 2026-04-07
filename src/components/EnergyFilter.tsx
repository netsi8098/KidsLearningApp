import { motion } from 'framer-motion';

interface EnergyFilterProps {
  selected: string;
  onChange: (level: string) => void;
}

const energyLevels = [
  { key: 'all', label: 'All', emoji: '' },
  { key: 'calm', label: 'Calm', emoji: '🧘' },
  { key: 'medium', label: 'Medium', emoji: '⚡' },
  { key: 'high', label: 'High', emoji: '🔥' },
];

export default function EnergyFilter({ selected, onChange }: EnergyFilterProps) {
  return (
    <div className="flex gap-2">
      {energyLevels.map((level) => (
        <motion.button
          key={level.key}
          className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold cursor-pointer transition-colors ${
            selected === level.key
              ? 'bg-coral text-white'
              : 'bg-white text-gray-500 shadow-sm'
          }`}
          onClick={() => onChange(level.key)}
          whileTap={{ scale: 0.95 }}
        >
          {level.emoji && <span>{level.emoji}</span>}
          <span>{level.label}</span>
        </motion.button>
      ))}
    </div>
  );
}
