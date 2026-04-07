import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface SectionCompleteProps {
  title: string;
  emoji: string;
  color: string;
  onStartOver: () => void;
}

/** Lighten a hex color */
function lighten(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${Math.round(r + (255 - r) * amount)},${Math.round(g + (255 - g) * amount)},${Math.round(b + (255 - b) * amount)})`;
}

export default function SectionComplete({ title, emoji, color, onStartOver }: SectionCompleteProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      className="fixed inset-0 flex flex-col items-center justify-center p-6 text-center"
      style={{
        zIndex: 5000,
        background: `linear-gradient(160deg, ${lighten(color, 0.92)}, ${lighten(color, 0.85)}, #FFF8F0)`,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Decorative floating circles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 40 + i * 20,
            height: 40 + i * 20,
            background: `${color}${(8 + i * 2).toString(16).padStart(2, '0')}`,
            left: `${10 + i * 15}%`,
            top: `${15 + (i % 3) * 25}%`,
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.3,
          }}
        />
      ))}

      {/* Emoji with glowing backdrop */}
      <motion.div
        className="relative mb-6"
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', damping: 10 }}
      >
        <div
          className="absolute inset-[-20px] rounded-full"
          style={{
            background: `radial-gradient(circle, ${color}25, transparent 70%)`,
            filter: 'blur(8px)',
          }}
        />
        <div
          className="relative w-28 h-28 rounded-[28px] flex items-center justify-center"
          style={{
            background: `linear-gradient(145deg, ${lighten(color, 0.3)}, ${color})`,
            boxShadow: `0 12px 40px ${color}40, inset 0 2px 4px rgba(255,255,255,0.3)`,
          }}
        >
          <span className="text-6xl drop-shadow-lg">{emoji}</span>
        </div>
      </motion.div>

      <motion.h1
        className="text-3xl font-black mb-2 relative z-10"
        style={{ color }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        You finished {title}!
      </motion.h1>

      <motion.p
        className="text-gray-500 mb-10 text-lg relative z-10"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Amazing work! You're a superstar!
      </motion.p>

      <motion.div
        className="flex gap-3 relative z-10"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <motion.button
          className="text-white rounded-[16px] px-7 py-3.5 font-bold cursor-pointer"
          style={{
            background: `linear-gradient(135deg, ${lighten(color, 0.1)}, ${color})`,
            boxShadow: `0 6px 20px ${color}40, inset 0 1px 1px rgba(255,255,255,0.25)`,
          }}
          onClick={onStartOver}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          Start Over
        </motion.button>
        <motion.button
          className="rounded-[16px] px-7 py-3.5 font-bold cursor-pointer text-gray-600"
          style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.06), inset 0 1px 1px rgba(255,255,255,0.6)',
            border: '1px solid rgba(0,0,0,0.05)',
          }}
          onClick={() => navigate('/menu')}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          Menu
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
