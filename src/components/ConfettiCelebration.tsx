import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MascotLion from './svg/MascotLion';

interface ConfettiCelebrationProps {
  message: string;
  stars?: number;
  onDismiss: () => void;
  autoDismissMs?: number;
}

const COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A78BFA', '#FF8C42', '#6BCB77', '#FF8FAB', '#45B7D1'];

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

const confettiPieces = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  x: randomBetween(5, 95),
  color: COLORS[i % COLORS.length],
  delay: randomBetween(0, 0.8),
  duration: randomBetween(1.2, 2.2),
  rotation: randomBetween(0, 720),
  height: randomBetween(40, 85),
  size: randomBetween(6, 12),
  shape: i % 3 === 0 ? 'circle' : 'rect',
}));

export default function ConfettiCelebration({
  message,
  stars = 5,
  onDismiss,
  autoDismissMs = 3000,
}: ConfettiCelebrationProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, autoDismissMs);
    return () => clearTimeout(timer);
  }, [autoDismissMs, onDismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center"
          style={{ zIndex: 9999 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/30" onClick={() => { setVisible(false); setTimeout(onDismiss, 300); }} />

          {/* Confetti particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {confettiPieces.map((p) => (
              <motion.div
                key={p.id}
                className="absolute"
                style={{
                  left: `${p.x}%`,
                  bottom: '-5%',
                  width: p.size,
                  height: p.shape === 'circle' ? p.size : p.size * 1.5,
                  backgroundColor: p.color,
                  borderRadius: p.shape === 'circle' ? '50%' : '2px',
                }}
                initial={{ y: 0, rotate: 0, opacity: 1 }}
                animate={{
                  y: `-${p.height}vh`,
                  rotate: p.rotation,
                  opacity: [1, 1, 0],
                }}
                transition={{
                  duration: p.duration,
                  delay: p.delay,
                  ease: 'easeOut',
                }}
              />
            ))}
          </div>

          {/* Center card */}
          <motion.div
            className="relative rounded-3xl p-8 text-center max-w-xs mx-4"
            style={{
              background: 'white',
              boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
            }}
            initial={{ scale: 0, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {/* Mascot jumping */}
            <motion.div
              initial={{ y: 20, scale: 0 }}
              animate={{ y: 0, scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 400 }}
            >
              <MascotLion size={100} expression="celebrating" animated />
            </motion.div>

            {/* Message */}
            <motion.h2
              className="font-display text-2xl text-[#2D2D3A] mt-3 mb-2"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {message}
            </motion.h2>

            {/* Stars earned */}
            {stars > 0 && (
              <motion.div
                className="flex items-center justify-center gap-1 mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
              >
                <span className="font-display text-xl text-[#FFD93D]">+{stars}</span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L15 9H22L16.5 13.5L18.5 21L12 17L5.5 21L7.5 13.5L2 9H9Z" fill="#FFD93D" stroke="#F59E0B" strokeWidth="1" />
                </svg>
              </motion.div>
            )}

            {/* Dismiss button */}
            <motion.button
              className="font-display text-white px-8 py-3 rounded-2xl cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #FF6B6B, #FF8C42)',
                boxShadow: '0 4px 0 rgba(0,0,0,0.15), 0 8px 20px rgba(255,107,107,0.3)',
              }}
              onClick={() => { setVisible(false); setTimeout(onDismiss, 300); }}
              whileTap={{ scale: 0.95, y: 2 }}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Awesome!
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
