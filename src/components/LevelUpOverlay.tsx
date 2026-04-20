/**
 * LevelUpOverlay — full-screen celebration when child advances a level.
 * Shows confetti, mascot celebrating, level badge animation.
 * Auto-dismisses after 4 seconds or on tap.
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MascotLion from './svg/MascotLion';

interface LevelUpOverlayProps {
  show: boolean;
  oldLevel: number;
  newLevel: number;
  onDismiss: () => void;
}

const CONFETTI_COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A78BFA', '#FF8C42', '#6BCB77', '#FF8FAB'];

export default function LevelUpOverlay({ show, oldLevel, newLevel, onDismiss }: LevelUpOverlayProps) {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    setVisible(show);
    if (show) {
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onDismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center"
          style={{ zIndex: 9999, background: 'rgba(0,0,0,0.6)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => { setVisible(false); onDismiss(); }}
        >
          {/* Confetti particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 60 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: `${Math.random() * 100}%`,
                  bottom: '-5%',
                  width: Math.random() * 10 + 4,
                  height: Math.random() * 10 + 4,
                  backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
                  borderRadius: i % 3 === 0 ? '50%' : '2px',
                }}
                initial={{ y: 0, rotate: 0, opacity: 1 }}
                animate={{
                  y: `${-(40 + Math.random() * 50)}vh`,
                  rotate: Math.random() * 720,
                  opacity: [1, 1, 0],
                }}
                transition={{
                  duration: 1.5 + Math.random() * 1.5,
                  delay: Math.random() * 0.8,
                  ease: 'easeOut',
                }}
              />
            ))}
          </div>

          {/* Center content */}
          <motion.div
            className="relative text-center z-10"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          >
            {/* Stars raining */}
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 pointer-events-none">
              {[0, 1, 2, 3, 4].map(i => (
                <motion.svg
                  key={i}
                  width="24" height="24" viewBox="0 0 24 24"
                  className="absolute"
                  style={{ left: (i - 2) * 40 }}
                  initial={{ y: -100, opacity: 0, rotate: 0 }}
                  animate={{ y: 0, opacity: 1, rotate: 360 }}
                  transition={{ delay: 0.5 + i * 0.15, duration: 0.8, type: 'spring' }}
                >
                  <path d="M12 2L15 9H22L16.5 13.5L18.5 21L12 17L5.5 21L7.5 13.5L2 9H9Z" fill="#FFD93D" stroke="#F59E0B" strokeWidth="1" />
                </motion.svg>
              ))}
            </div>

            {/* LEVEL UP text */}
            <motion.h1
              className="font-display text-white mb-4"
              style={{ fontSize: 'clamp(2.5rem, 10vw, 4rem)', textShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              LEVEL UP!
            </motion.h1>

            {/* Mascot */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: 'spring' }}
            >
              <MascotLion size={120} expression="celebrating" animated />
            </motion.div>

            {/* Level badge */}
            <motion.div
              className="flex items-center justify-center gap-4 mt-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center font-display text-2xl text-white/50" style={{ background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.2)' }}>
                {oldLevel}
              </div>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <motion.div
                className="w-20 h-20 rounded-full flex items-center justify-center font-display text-3xl text-white"
                style={{ background: 'linear-gradient(135deg, #FFD93D, #FF8C42)', boxShadow: '0 0 30px rgba(255,217,61,0.5)' }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              >
                {newLevel}
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
