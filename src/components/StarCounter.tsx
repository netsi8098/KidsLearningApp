import { useEffect, useRef, useState } from 'react';
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
  const prevStars = useRef(stars);
  const [displayStars, setDisplayStars] = useState(stars);
  const [spinning, setSpinning] = useState(false);

  // Animate count-up when stars change
  useEffect(() => {
    if (stars !== prevStars.current) {
      const from = prevStars.current;
      const to = stars;
      const diff = to - from;
      if (diff > 0) {
        setSpinning(true);
        // Count up over 600ms
        const steps = Math.min(diff, 20);
        const stepDuration = 600 / steps;
        let step = 0;
        const interval = setInterval(() => {
          step++;
          setDisplayStars(from + Math.round((step / steps) * diff));
          if (step >= steps) {
            clearInterval(interval);
            setDisplayStars(to);
            setTimeout(() => setSpinning(false), 300);
          }
        }, stepDuration);
        prevStars.current = to;
        return () => clearInterval(interval);
      }
      prevStars.current = to;
      setDisplayStars(to);
    }
  }, [stars]);

  return (
    <motion.div
      className="flex items-center gap-1.5 rounded-[12px] px-3 py-1.5"
      style={{
        background: 'linear-gradient(135deg, rgba(255,217,61,0.18), rgba(255,140,66,0.12))',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxShadow: spinning
          ? '0 0 16px rgba(255,217,61,0.4), 0 2px 10px rgba(255,217,61,0.15)'
          : '0 2px 10px rgba(255,217,61,0.10), inset 0 1px 1px rgba(255,255,255,0.3)',
        border: '1px solid rgba(255,217,61,0.18)',
        transition: 'box-shadow 0.3s',
      }}
      key={`star-${stars}`}
      animate={{ scale: spinning ? [1, 1.15, 1] : 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <motion.div
        animate={spinning ? { rotate: 360 } : { rotate: [0, 12, -12, 0] }}
        transition={spinning
          ? { duration: 0.6, ease: 'easeOut' }
          : { duration: 2, repeat: Infinity, repeatDelay: 5, ease: 'easeInOut' }
        }
      >
        <StarIcon />
      </motion.div>
      <span className="text-sm font-extrabold tracking-tight" style={{ color: '#B8860B' }}>
        {displayStars}
      </span>
    </motion.div>
  );
}
