import { motion } from 'framer-motion';
import type { MissionCategory } from '../data/missionTemplates';

interface MissionCardProps {
  emoji: string;
  description: string;
  completed: boolean;
  onTap: () => void;
  /** Optional category for accent-bar coloring */
  category?: MissionCategory;
  /** Optional reward stars to display */
  rewardStars?: number;
  /** Whether this is the "next best action" highlighted card */
  highlighted?: boolean;
  /** Index for staggered animation */
  index?: number;
}

const emojiTints = [
  '#FF6B6B', '#4ECDC4', '#FF8C42', '#A78BFA', '#FFD93D', '#6BCB77',
];

/** Maps mission categories to accent bar colors */
const categoryAccentColors: Record<string, string> = {
  learn: '#4ECDC4',     // teal
  play: '#FF6B6B',      // coral
  create: '#FFE66D',    // sunny
  listen: '#A78BFA',    // grape
  wellbeing: '#A78BFA', // grape (calm)
  explore: '#FF8C42',   // tangerine
};

export default function MissionCard({
  emoji,
  description,
  completed,
  onTap,
  category,
  rewardStars = 5,
  highlighted = false,
  index = 0,
}: MissionCardProps) {
  // Stable tint based on description
  const tintIndex = description.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % emojiTints.length;
  const tintColor = emojiTints[tintIndex];

  // Accent bar color: category-based or fallback to tint
  const accentColor = category ? (categoryAccentColors[category] ?? tintColor) : tintColor;

  return (
    <motion.button
      className="w-full text-left cursor-pointer overflow-hidden relative"
      style={{
        borderRadius: '20px',
        background: completed
          ? 'linear-gradient(135deg, #F0FDF4 0%, #FAFFF8 100%)'
          : highlighted
            ? '#FFF8F0'
            : '#FFF8F0',
        boxShadow: highlighted
          ? `0 4px 20px ${accentColor}25, 0 2px 12px rgba(45,45,58,0.06)`
          : '0 2px 12px rgba(45,45,58,0.05)',
        border: highlighted
          ? `1.5px solid ${accentColor}40`
          : '1px solid rgba(232,224,212,0.6)',
      }}
      onClick={onTap}
      whileHover={{ scale: 1.02, boxShadow: '0 6px 24px rgba(45,45,58,0.09)' }}
      whileTap={{ scale: 0.97 }}
      initial={{ y: 15, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        type: 'spring',
        stiffness: 280,
        damping: 22,
        delay: index * 0.06,
      }}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-3 bottom-3 w-[4px] rounded-r-full"
        style={{
          background: completed
            ? 'linear-gradient(180deg, #6BCB77, #4ECDC4)'
            : `linear-gradient(180deg, ${accentColor}, ${accentColor}99)`,
        }}
      />

      <div className="flex items-center gap-3.5 px-4 py-4 pl-5">
        {/* Mission emoji in colored soft circle */}
        <div
          className="flex-shrink-0 w-[40px] h-[40px] rounded-full flex items-center justify-center"
          style={{
            backgroundColor: completed ? '#6BCB7718' : tintColor + '18',
          }}
        >
          <span className="text-[22px] leading-none">{emoji}</span>
        </div>

        {/* Center: title + reward */}
        <div className="flex-1 min-w-0">
          <p
            className={`text-[15px] font-bold leading-snug ${
              completed
                ? 'text-[#9B9BAB] line-through decoration-[#9B9BAB]/40'
                : 'text-[#2D2D3A]'
            }`}
          >
            {description}
          </p>
          {/* Reward preview pill */}
          <div className="flex items-center gap-1.5 mt-1.5">
            <div
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5"
              style={{
                background: completed
                  ? 'linear-gradient(135deg, #6BCB7715, #4ECDC415)'
                  : 'linear-gradient(135deg, #FFD93D18, #FF8C4212)',
              }}
            >
              <span className="text-[10px]">{completed ? '\u2713' : '\u2B50'}</span>
              <span
                className="text-[10px] font-bold"
                style={{
                  color: completed ? '#6BCB77' : '#FF8C42',
                }}
              >
                {completed ? 'Done!' : `+${rewardStars} Stars`}
              </span>
            </div>
          </div>
        </div>

        {/* Right side: completion indicator or start button */}
        <div className="flex-shrink-0 flex items-center gap-2">
          {completed ? (
            <motion.div
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #6BCB77, #4ECDC4)',
                boxShadow: '0 2px 8px rgba(107,203,119,0.3)',
              }}
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 15,
                times: [0, 0.6, 1],
              }}
            >
              <span className="text-white text-lg font-bold">{'\u2713'}</span>
            </motion.div>
          ) : (
            <div className="flex items-center gap-2">
              {/* Green GO button */}
              <div
                className="btn-go text-sm"
                style={{ minWidth: '72px', textAlign: 'center' }}
              >
                GO!
              </div>
              {/* Pulsing dot indicator */}
              <div className="w-6 h-6 rounded-full border-2 border-[#F0EAE0] flex items-center justify-center relative">
                <motion.div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: '#FF6B6B' }}
                  animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Highlighted card: gradient border shimmer effect */}
      {highlighted && !completed && (
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-[20px]"
          style={{
            border: `2px solid transparent`,
            background: `linear-gradient(90deg, transparent, ${accentColor}20, transparent) border-box`,
          }}
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </motion.button>
  );
}
