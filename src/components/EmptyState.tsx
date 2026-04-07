import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';

// ── Decorative circle config ────────────────────────────────
interface DecorativeCircle {
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  size: number;
  color: string;
  opacity: number;
  delay?: number;
}

const defaultCircles: DecorativeCircle[] = [
  { top: '8%', left: '12%', size: 64, color: '#FF6B6B', opacity: 0.05 },
  { top: '18%', right: '10%', size: 48, color: '#4ECDC4', opacity: 0.04 },
  { bottom: '15%', left: '18%', size: 80, color: '#A78BFA', opacity: 0.04 },
  { bottom: '25%', right: '15%', size: 40, color: '#FFE66D', opacity: 0.06 },
  { top: '45%', left: '5%', size: 36, color: '#6BCB77', opacity: 0.04 },
];

// ── Props ───────────────────────────────────────────────────
export interface EmptyStateProps {
  /** Primary emoji displayed large at top */
  emoji: string;
  /** Bold heading text */
  title: string;
  /** Optional description text below the title */
  subtitle?: string;
  /** Label for the primary action button */
  actionLabel?: string;
  /** Route to navigate to on primary action click */
  actionRoute?: string;
  /** Callback for primary action (alternative to actionRoute) */
  onAction?: () => void;
  /** Optional secondary action text link */
  secondaryLabel?: string;
  /** Route for secondary action */
  secondaryRoute?: string;
  /** Callback for secondary action */
  onSecondaryAction?: () => void;
  /** Optional mascot emoji displayed beside the main emoji */
  mascot?: string;
  /** Custom background color for the container */
  bgColor?: string;
  /** Custom text colors for dark variants (e.g. bedtime) */
  titleColor?: string;
  subtitleColor?: string;
  /** Custom decorative circles (overrides defaults) */
  decorativeCircles?: DecorativeCircle[];
  /** Extra decorative elements rendered inside the container */
  decorations?: ReactNode;
  /** Additional className for the outer container */
  className?: string;
  /** If true, shows the component (for AnimatePresence control) */
  visible?: boolean;
  /** Custom gradient for the primary button */
  buttonGradient?: string;
  /** Custom shadow for the primary button */
  buttonShadow?: string;
}

// ── Spring configs ──────────────────────────────────────────
const springEntrance = { type: 'spring' as const, damping: 22, stiffness: 200 };

export default function EmptyState({
  emoji,
  title,
  subtitle,
  actionLabel,
  actionRoute,
  onAction,
  secondaryLabel,
  secondaryRoute,
  onSecondaryAction,
  mascot,
  bgColor,
  titleColor = '#2D2D3A',
  subtitleColor = '#6B6B7B',
  decorativeCircles,
  decorations,
  className = '',
  visible = true,
  buttonGradient = 'linear-gradient(135deg, #FF6B6B, #FF8C42)',
  buttonShadow = '0 4px 16px rgba(255,107,107,0.3)',
}: EmptyStateProps) {
  const navigate = useNavigate();
  const circles = decorativeCircles ?? defaultCircles;

  const handlePrimaryClick = () => {
    if (onAction) {
      onAction();
    } else if (actionRoute) {
      navigate(actionRoute);
    }
  };

  const handleSecondaryClick = () => {
    if (onSecondaryAction) {
      onSecondaryAction();
    } else if (secondaryRoute) {
      navigate(secondaryRoute);
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={`text-center py-20 px-6 relative overflow-hidden rounded-[20px] ${className}`}
          style={bgColor ? { backgroundColor: bgColor } : undefined}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={springEntrance}
        >
          {/* Decorative background circles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
            {circles.map((circle, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  top: circle.top,
                  bottom: circle.bottom,
                  left: circle.left,
                  right: circle.right,
                  width: circle.size,
                  height: circle.size,
                  backgroundColor: circle.color,
                  opacity: 0,
                }}
                animate={{
                  opacity: circle.opacity,
                  scale: [1, 1.15, 1],
                }}
                transition={{
                  opacity: { duration: 0.6, delay: (circle.delay ?? i) * 0.1 },
                  scale: { duration: 6 + i, repeat: Infinity, ease: 'easeInOut' },
                }}
              />
            ))}
          </div>

          {/* Custom decorative elements */}
          {decorations}

          {/* Emoji area with optional mascot */}
          <div className="relative z-10 flex items-center justify-center gap-3 mb-5">
            {mascot && (
              <motion.span
                className="text-5xl"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...springEntrance, delay: 0.2 }}
              >
                {mascot}
              </motion.span>
            )}
            <motion.span
              className="text-8xl block"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              {emoji}
            </motion.span>
          </div>

          {/* Title */}
          <motion.p
            className="font-extrabold text-xl leading-tight relative z-10"
            style={{ color: titleColor }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springEntrance, delay: 0.1 }}
          >
            {title}
          </motion.p>

          {/* Subtitle */}
          {subtitle && (
            <motion.p
              className="text-[15px] mt-2.5 leading-relaxed max-w-xs mx-auto relative z-10"
              style={{ color: subtitleColor }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springEntrance, delay: 0.15 }}
            >
              {subtitle}
            </motion.p>
          )}

          {/* Primary action button */}
          {(actionLabel && (actionRoute || onAction)) && (
            <motion.button
              className="mt-7 text-white rounded-[14px] px-7 py-3.5 font-bold cursor-pointer relative z-10"
              style={{
                background: buttonGradient,
                boxShadow: buttonShadow,
              }}
              onClick={handlePrimaryClick}
              whileHover={{ scale: 1.05, boxShadow: '0 6px 24px rgba(255,107,107,0.4)' }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springEntrance, delay: 0.2 }}
            >
              {actionLabel}
            </motion.button>
          )}

          {/* Secondary action (text link) */}
          {(secondaryLabel && (secondaryRoute || onSecondaryAction)) && (
            <motion.button
              className="mt-3 text-[14px] font-bold cursor-pointer relative z-10 bg-transparent border-none"
              style={{ color: subtitleColor }}
              onClick={handleSecondaryClick}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ ...springEntrance, delay: 0.25 }}
            >
              {secondaryLabel}
            </motion.button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
