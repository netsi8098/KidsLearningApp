import { motion, AnimatePresence } from 'framer-motion';
import { useCelebration } from '../hooks/useCelebration';

const emojis = ['🎉', '⭐', '🌟', '✨', '🎊', '💫', '🏆', '🎈', '🌈', '💖'];

function Particle({ emoji, index }: { emoji: string; index: number }) {
  const startX = Math.random() * 100;
  const delay = Math.random() * 0.5;
  const duration = 2 + Math.random() * 1.5;

  return (
    <motion.div
      key={index}
      className="fixed text-3xl pointer-events-none"
      style={{ left: `${startX}%`, top: -40, zIndex: 9999 }}
      initial={{ opacity: 1, y: 0, rotate: 0 }}
      animate={{
        y: window.innerHeight + 100,
        rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
        x: (Math.random() - 0.5) * 200,
      }}
      transition={{ duration, delay, ease: 'easeIn' }}
      exit={{ opacity: 0 }}
    >
      {emoji}
    </motion.div>
  );
}

export default function CelebrationOverlay() {
  const { celebrationVisible } = useCelebration();

  return (
    <AnimatePresence>
      {celebrationVisible && (
        <motion.div
          className="fixed inset-0 pointer-events-none"
          style={{ zIndex: 9998 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {Array.from({ length: 25 }).map((_, i) => (
            <Particle key={i} emoji={emojis[i % emojis.length]} index={i} />
          ))}
          <motion.div
            className="fixed inset-0 flex items-center justify-center pointer-events-none"
            style={{ zIndex: 9999 }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 10, stiffness: 200, delay: 0.3 }}
          >
            <div className="text-7xl">🎉</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
