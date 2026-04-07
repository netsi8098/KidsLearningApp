import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { ActiveNudge } from '../hooks/useNudges';

interface NudgeBannerProps {
  nudge: ActiveNudge | undefined;
  onDismiss: (id: string) => void;
}

export default function NudgeBanner({ nudge, onDismiss }: NudgeBannerProps) {
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {nudge && (
        <motion.div
          className="rounded-[20px] p-4 flex items-center gap-3 border border-[#E8E0D4]/60 overflow-hidden relative"
          style={{
            background: '#FFFFFF',
            boxShadow: '0 2px 12px rgba(45,45,58,0.06)',
          }}
          initial={{ y: -20, opacity: 0, height: 0 }}
          animate={{ y: 0, opacity: 1, height: 'auto' }}
          exit={{ y: -20, opacity: 0, height: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 300 }}
        >
          {/* Left colored accent stripe */}
          <div
            className="absolute left-0 top-0 bottom-0 w-1 rounded-l-[20px]"
            style={{ background: 'linear-gradient(180deg, #FF6B6B, #FF8C42)' }}
          />

          <span className="text-2xl flex-shrink-0 ml-1">{nudge.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-700 leading-snug">{nudge.message}</p>
          </div>
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <motion.button
              className="text-white text-xs font-bold rounded-full px-4 py-2 cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #FF6B6B, #FF8C42)',
                boxShadow: '0 2px 8px rgba(255,107,107,0.25)',
              }}
              onClick={() => navigate(nudge.actionRoute)}
              whileTap={{ scale: 0.95 }}
              whileHover={{ boxShadow: '0 4px 14px rgba(255,107,107,0.35)' }}
            >
              {nudge.actionLabel}
            </motion.button>
            <motion.button
              className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm cursor-pointer"
              onClick={() => onDismiss(nudge.id)}
              whileTap={{ scale: 0.9 }}
              whileHover={{ backgroundColor: '#F0EAE0' }}
            >
              ✕
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
