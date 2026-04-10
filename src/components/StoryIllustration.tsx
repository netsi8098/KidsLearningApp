import { motion } from 'framer-motion';
import { getSceneForEmoji } from '../data/storyIllustrations';

interface StoryIllustrationProps {
  emoji: string;
  color?: string;
}

/**
 * Renders a storybook-style illustration for the page.
 * Uses rich SVG scene illustrations with a soft watercolor frame.
 * Falls back to emoji display if no scene is available.
 */
export default function StoryIllustration({ emoji, color = '#A78BFA' }: StoryIllustrationProps) {
  const scene = getSceneForEmoji(emoji);

  return (
    <motion.div
      className="relative mx-auto mb-5"
      style={{ width: 240, height: 170 }}
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.1, type: 'spring', damping: 16, stiffness: 120 }}
    >
      {/* Soft watercolor border frame */}
      <div
        className="absolute inset-0 rounded-[20px]"
        style={{
          background: `linear-gradient(135deg, ${color}15, ${color}08)`,
          border: `2px dashed ${color}20`,
          boxShadow: `0 4px 20px ${color}10, inset 0 0 30px ${color}06`,
        }}
      />

      {/* Scene content */}
      <div className="absolute inset-[6px] rounded-[16px] overflow-hidden">
        {scene ? (
          <motion.div
            className="w-full h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {scene}
          </motion.div>
        ) : (
          /* Fallback: emoji with decorative background */
          <div className="w-full h-full flex items-center justify-center" style={{ background: `${color}08` }}>
            <motion.span
              className="text-7xl"
              style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.08))' }}
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              {emoji}
            </motion.span>
          </div>
        )}
      </div>

      {/* Corner sparkle decorations */}
      <motion.svg
        className="absolute"
        style={{ top: -4, right: -2 }}
        width="14" height="14" viewBox="0 0 14 14"
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.5, type: 'spring' }}
      >
        <path
          d="M7 0L8.5 5L14 7L8.5 9L7 14L5.5 9L0 7L5.5 5Z"
          fill={`${color}40`}
        />
      </motion.svg>

      <motion.svg
        className="absolute"
        style={{ bottom: -2, left: -2 }}
        width="10" height="10" viewBox="0 0 14 14"
        initial={{ scale: 0, rotate: 30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.7, type: 'spring' }}
      >
        <path
          d="M7 0L8.5 5L14 7L8.5 9L7 14L5.5 9L0 7L5.5 5Z"
          fill={`${color}30`}
        />
      </motion.svg>
    </motion.div>
  );
}
