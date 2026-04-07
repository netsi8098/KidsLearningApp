import { motion, AnimatePresence } from 'framer-motion';

type CelebrationType = 'level_up' | 'new_frame' | 'star_milestone' | 'badge_earned' | 'streak';

interface ProfileCelebrationProps {
  type: CelebrationType;
  title: string;
  subtitle: string;
  emoji: string;
  onDismiss: () => void;
}

const typeGradients: Record<CelebrationType, string> = {
  level_up: 'linear-gradient(135deg, #A78BFA 0%, #7C3AED 100%)',
  new_frame: 'linear-gradient(135deg, #4ECDC4 0%, #0ABAB5 100%)',
  star_milestone: 'linear-gradient(135deg, #FFD93D 0%, #FFB800 100%)',
  badge_earned: 'linear-gradient(135deg, #FF6B6B 0%, #FF4757 100%)',
  streak: 'linear-gradient(135deg, #FF8C42 0%, #FF6B2B 100%)',
};

const typeButtonColors: Record<CelebrationType, string> = {
  level_up: '#A78BFA',
  new_frame: '#4ECDC4',
  star_milestone: '#FFD93D',
  badge_earned: '#FF6B6B',
  streak: '#FF8C42',
};

/* Decorative sparkle dots positions (relative to emoji center) */
const sparklePositions = [
  { x: -50, y: -40, delay: 0, size: 6 },
  { x: 45, y: -35, delay: 0.15, size: 8 },
  { x: -40, y: 30, delay: 0.3, size: 5 },
  { x: 50, y: 25, delay: 0.45, size: 7 },
  { x: -20, y: -55, delay: 0.2, size: 4 },
  { x: 25, y: 50, delay: 0.35, size: 6 },
];

/* Confetti circles decorative elements */
const confettiItems = [
  { x: '10%', y: '15%', color: '#FF6B6B', size: 8, delay: 0 },
  { x: '85%', y: '20%', color: '#4ECDC4', size: 6, delay: 0.1 },
  { x: '15%', y: '80%', color: '#FFE66D', size: 10, delay: 0.2 },
  { x: '80%', y: '75%', color: '#A78BFA', size: 7, delay: 0.15 },
  { x: '50%', y: '10%', color: '#6BCB77', size: 5, delay: 0.25 },
  { x: '90%', y: '50%', color: '#FFD93D', size: 9, delay: 0.05 },
  { x: '5%', y: '50%', color: '#FF8C42', size: 6, delay: 0.3 },
  { x: '40%', y: '85%', color: '#74B9FF', size: 8, delay: 0.18 },
];

export default function ProfileCelebration({
  type,
  title,
  subtitle,
  emoji,
  onDismiss,
}: ProfileCelebrationProps) {
  const gradient = typeGradients[type];
  const buttonColor = typeButtonColors[type];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundColor: 'rgba(45, 45, 58, 0.4)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
          onClick={onDismiss}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />

        {/* Confetti circles floating at edges */}
        {confettiItems.map((item, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: item.x,
              top: item.y,
              width: item.size,
              height: item.size,
              backgroundColor: item.color,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 0.8, 0.3, 0.7, 0.4],
              scale: [0, 1.2, 0.8, 1, 0.9],
              y: [0, -15, 5, -10, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: item.delay + 0.3,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Celebration card */}
        <motion.div
          className="relative z-10 bg-white rounded-[28px] p-8 max-w-sm w-full text-center overflow-hidden"
          style={{
            boxShadow: '0 16px 48px rgba(45, 45, 58, 0.15), 0 0 0 1px rgba(45, 45, 58, 0.02)',
          }}
          initial={{ scale: 0.5, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.5, opacity: 0, y: 30 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22, delay: 0.1 }}
        >
          {/* Top gradient accent bar */}
          <div
            className="absolute top-0 left-0 right-0 h-1.5"
            style={{ background: gradient }}
          />

          {/* Emoji with bounce-in and sparkles */}
          <div className="relative inline-block mt-4 mb-4">
            {/* Sparkle dots */}
            {sparklePositions.map((sp, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  left: '50%',
                  top: '50%',
                  width: sp.size,
                  height: sp.size,
                  backgroundColor: '#FFD93D',
                }}
                initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0.5, 1, 0],
                  x: sp.x,
                  y: sp.y,
                  scale: [0, 1.3, 0.8, 1.1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: sp.delay + 0.3,
                  ease: 'easeInOut',
                }}
              />
            ))}

            {/* Main emoji with bounce */}
            <motion.span
              className="text-7xl block select-none"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.25, 0.95, 1] }}
              transition={{
                times: [0, 0.5, 0.75, 1],
                duration: 0.7,
                delay: 0.2,
                ease: 'easeOut',
              }}
            >
              {emoji}
            </motion.span>
          </div>

          {/* Title with gradient text */}
          <motion.h2
            className="text-2xl font-extrabold mb-2"
            style={{
              background: gradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            {title}
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            className="text-[15px] text-[#6B6B7B] font-medium mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            {subtitle}
          </motion.p>

          {/* Dismiss button */}
          <motion.button
            className="w-full py-3.5 rounded-[16px] text-white font-bold text-lg cursor-pointer"
            style={{
              background: gradient,
              boxShadow: `0 4px 20px ${buttonColor}40`,
            }}
            onClick={onDismiss}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            Awesome!
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
