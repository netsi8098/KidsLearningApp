import { motion } from 'framer-motion';

interface StoryIllustrationProps {
  emoji: string;
  color?: string;
}

/**
 * Renders a storybook-style illustration frame around the page emoji.
 * Adds a hand-drawn look with soft watercolor-like backgrounds,
 * organic borders, and gentle animations.
 */
export default function StoryIllustration({ emoji, color = '#A78BFA' }: StoryIllustrationProps) {
  // Generate soft pastel variants
  const bgLight = `${color}12`;
  const bgMid = `${color}20`;
  const borderColor = `${color}25`;

  return (
    <motion.div
      className="relative mx-auto mb-6"
      style={{ width: 180, height: 180 }}
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.15, type: 'spring', damping: 14 }}
    >
      {/* Watercolor wash background */}
      <svg
        viewBox="0 0 180 180"
        className="absolute inset-0 w-full h-full"
        style={{ filter: 'blur(0.5px)' }}
      >
        <defs>
          <radialGradient id={`wash-${emoji}`} cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor={color} stopOpacity="0.12" />
            <stop offset="60%" stopColor={color} stopOpacity="0.06" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </radialGradient>
          <filter id={`paper-${emoji}`}>
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" />
          </filter>
        </defs>
        {/* Organic background blob */}
        <ellipse
          cx="90" cy="88" rx="78" ry="72"
          fill={`url(#wash-${emoji})`}
          filter={`url(#paper-${emoji})`}
        />
        {/* Hand-drawn border */}
        <path
          d="M 30,90 C 30,45 50,22 90,20 C 130,18 155,42 158,85 C 160,128 135,162 90,163 C 45,164 28,135 30,90 Z"
          fill="none"
          stroke={borderColor}
          strokeWidth="1.5"
          strokeDasharray="4,3"
          style={{ filter: `url(#paper-${emoji})` }}
        />
      </svg>

      {/* Decorative dots */}
      {[
        { x: 25, y: 25, size: 4, delay: 0.3 },
        { x: 150, y: 30, size: 3, delay: 0.5 },
        { x: 20, y: 140, size: 3, delay: 0.7 },
        { x: 155, y: 145, size: 4, delay: 0.4 },
        { x: 90, y: 10, size: 2, delay: 0.6 },
      ].map((dot, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: dot.x,
            top: dot.y,
            width: dot.size,
            height: dot.size,
            background: `${color}30`,
          }}
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ delay: dot.delay, duration: 0.4 }}
        />
      ))}

      {/* Small sparkle stars */}
      <motion.svg
        className="absolute"
        style={{ top: 15, right: 30 }}
        width="14" height="14" viewBox="0 0 14 14"
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.5, type: 'spring' }}
      >
        <path
          d="M7 0L8.5 5L14 7L8.5 9L7 14L5.5 9L0 7L5.5 5Z"
          fill={`${color}35`}
        />
      </motion.svg>

      <motion.svg
        className="absolute"
        style={{ bottom: 20, left: 25 }}
        width="10" height="10" viewBox="0 0 14 14"
        initial={{ scale: 0, rotate: 30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.7, type: 'spring' }}
      >
        <path
          d="M7 0L8.5 5L14 7L8.5 9L7 14L5.5 9L0 7L5.5 5Z"
          fill={`${color}25`}
        />
      </motion.svg>

      {/* Emoji centered with subtle shadow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span
          className="text-7xl"
          style={{
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.08))',
          }}
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          {emoji}
        </motion.span>
      </div>
    </motion.div>
  );
}
