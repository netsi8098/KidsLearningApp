import { motion } from 'framer-motion';

interface CompletionSummaryProps {
  emoji: string;
  title: string;
  message: string;
  starsEarned?: number;
  onContinue: () => void;
  continueLabel?: string;
}

export default function CompletionSummary({
  emoji,
  title,
  message,
  starsEarned,
  onContinue,
  continueLabel = 'Continue',
}: CompletionSummaryProps) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center text-center p-8"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', damping: 12 }}
    >
      <motion.span
        className="text-7xl mb-4"
        animate={{ rotate: [0, -10, 10, -10, 0] }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        {emoji}
      </motion.span>
      <h2 className="text-2xl font-extrabold text-gray-800 mb-2">{title}</h2>
      <p className="text-gray-500 mb-4 max-w-xs">{message}</p>
      {starsEarned !== undefined && starsEarned > 0 && (
        <motion.div
          className="flex items-center gap-2 bg-amber-50 rounded-full px-4 py-2 mb-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span className="text-2xl">⭐</span>
          <span className="font-bold text-amber-600">+{starsEarned} stars</span>
        </motion.div>
      )}
      <motion.button
        className="bg-coral text-white font-bold px-8 py-3 rounded-2xl shadow-lg cursor-pointer"
        onClick={onContinue}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        {continueLabel}
      </motion.button>
    </motion.div>
  );
}
