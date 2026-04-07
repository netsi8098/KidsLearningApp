import { motion, AnimatePresence } from 'framer-motion';
import { useCelebration } from '../hooks/useCelebration';

export default function StarBurst() {
  const { starBurstVisible } = useCelebration();

  return (
    <AnimatePresence>
      {starBurstVisible && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center pointer-events-none"
          style={{ zIndex: 9000 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="text-8xl"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1.3, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 8, stiffness: 200 }}
          >
            ⭐
          </motion.div>
          <motion.div
            className="absolute text-2xl font-bold text-gold"
            initial={{ y: 0, opacity: 1 }}
            animate={{ y: -60, opacity: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            +1
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
