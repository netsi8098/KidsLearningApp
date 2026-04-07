import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';

export default function BadgeToast() {
  const { badgeToast } = useApp();

  return (
    <AnimatePresence>
      {badgeToast && (
        <motion.div
          className="fixed top-6 left-1/2 -translate-x-1/2 rounded-2xl px-7 py-4 flex items-center gap-4 pointer-events-none"
          style={{
            zIndex: 10000,
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            boxShadow: '0 8px 32px rgba(45,45,58,0.12), 0 2px 8px rgba(0,0,0,0.06)',
            border: '1px solid rgba(255,255,255,0.6)',
          }}
          initial={{ y: -80, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -80, opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', damping: 18, stiffness: 300 }}
        >
          {/* Decorative sparkles */}
          <motion.div
            className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-gold/60"
            animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
          />
          <motion.div
            className="absolute -top-2 right-4 w-1.5 h-1.5 rounded-full bg-coral/50"
            animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
          />
          <motion.div
            className="absolute bottom-0 -right-1 w-2 h-2 rounded-full bg-teal/50"
            animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0.8 }}
          />

          {/* Badge emoji with bounce */}
          <motion.span
            className="text-5xl"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.3, 1] }}
            transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
          >
            {badgeToast.emoji}
          </motion.span>

          <div>
            <p
              className="text-xs font-bold tracking-wide"
              style={{ color: '#FF8C42' }}
            >
              Badge Earned!
            </p>
            <p className="text-[15px] font-extrabold text-gray-800">{badgeToast.name}</p>
          </div>

          {/* Auto-dismiss progress bar */}
          <motion.div
            className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full overflow-hidden"
            style={{ backgroundColor: 'rgba(0,0,0,0.06)' }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #FFD93D, #FF8C42)' }}
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 3, ease: 'linear' }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
