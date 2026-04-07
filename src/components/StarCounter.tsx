import { motion } from 'framer-motion';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { useApp } from '../context/AppContext';

function StarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFD93D" />
          <stop offset="100%" stopColor="#FF8C42" />
        </linearGradient>
      </defs>
      <path
        d="M12 2L14.9 8.6L22 9.3L16.8 14L18.2 21L12 17.5L5.8 21L7.2 14L2 9.3L9.1 8.6L12 2Z"
        fill="url(#starGrad)"
        stroke="#E8A000"
        strokeWidth="0.5"
      />
    </svg>
  );
}

export default function StarCounter() {
  const { currentPlayer } = useApp();

  const profile = useLiveQuery(
    () => (currentPlayer?.id ? db.profiles.get(currentPlayer.id) : undefined),
    [currentPlayer?.id]
  );

  const stars = profile?.totalStars ?? 0;

  return (
    <motion.div
      className="flex items-center gap-1.5 rounded-[12px] px-3 py-1.5"
      style={{
        background: 'linear-gradient(135deg, rgba(255,217,61,0.18), rgba(255,140,66,0.12))',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxShadow: '0 2px 10px rgba(255,217,61,0.10), inset 0 1px 1px rgba(255,255,255,0.3)',
        border: '1px solid rgba(255,217,61,0.18)',
      }}
      key={stars}
      animate={{ scale: [1, 1.12, 1] }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <motion.div
        animate={{ rotate: [0, 12, -12, 0] }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 5, ease: 'easeInOut' }}
      >
        <StarIcon />
      </motion.div>
      <span className="text-sm font-extrabold tracking-tight" style={{ color: '#B8860B' }}>{stars}</span>
    </motion.div>
  );
}
