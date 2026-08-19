/**
 * WorldTitle + SpeechBubble — title treatment that belongs to the scene.
 *
 * In the reference art the title is never a text block floating in empty sky.
 * It either straddles the front edge of the hero mound (meadow / river garden /
 * sky islands) or hangs as a carved wooden sign (treehouse). Both variants live
 * here so worlds can pick the one that fits their material language.
 */
import { motion } from 'framer-motion';
import { useMotionPreset } from '../../motion/useMotionPreset';

const TITLE_WORDS = [
  { text: 'Kids', colors: ['#FF5C7A', '#FF8A4C', '#FFC531', '#7BD16B'] },
  { text: 'Learning', colors: ['#4FC3E8', '#5B8DEF', '#A78BFA', '#E86FC0', '#FF5C7A', '#FF8A4C', '#FFC531', '#7BD16B'] },
  { text: 'Fun!', colors: ['#4FC3E8', '#A78BFA', '#FF5C7A', '#FFC531'] },
];

/** Chunky candy lettering with a white keyline so it reads on any sky. */
function CandyLetters({ scale = 1 }: { scale?: number }) {
  const { isReducedMotion } = useMotionPreset();
  let letterIndex = 0;

  return (
    <span className="inline-flex flex-wrap justify-center items-baseline gap-x-[0.28em] gap-y-1">
      {TITLE_WORDS.map((word) => (
        <span key={word.text} className="inline-flex">
          {word.text.split('').map((char, i) => {
            const idx = letterIndex++;
            return (
              <motion.span
                key={`${word.text}-${i}`}
                className="font-display inline-block"
                style={{
                  color: word.colors[i % word.colors.length],
                  fontSize: `${scale}em`,
                  lineHeight: 1,
                  WebkitTextStroke: `${0.055 * scale}em #FFFFFF`,
                  paintOrder: 'stroke fill',
                  textShadow: `0 ${0.05 * scale}em 0 rgba(0,0,0,0.16), 0 ${0.1 * scale}em ${0.14 * scale}em rgba(0,0,0,0.24)`,
                }}
                initial={isReducedMotion ? { opacity: 0 } : { opacity: 0, y: -22, scale: 0.6 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={
                  isReducedMotion
                    ? { duration: 0.25 }
                    : { type: 'spring', stiffness: 320, damping: 16, delay: 0.15 + idx * 0.035 }
                }
              >
                {char}
              </motion.span>
            );
          })}
        </span>
      ))}
    </span>
  );
}

export interface WorldTitleProps {
  subtitle?: string;
  /** 'mound' straddles the hero stage; 'sign' hangs a carved board. */
  variant?: 'mound' | 'sign';
}

export default function WorldTitle({
  subtitle = 'Choose a player to start your adventure',
  variant = 'mound',
}: WorldTitleProps) {
  const { isReducedMotion } = useMotionPreset();

  if (variant === 'sign') {
    return (
      <motion.div
        className="relative flex flex-col items-center"
        style={{ transformOrigin: 'top center' }}
        initial={isReducedMotion ? { opacity: 0 } : { opacity: 0, y: -30, rotate: -3 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 140, damping: 12, delay: 0.2 }}
      >
        {/* Ropes */}
        <div className="flex justify-between w-[62%] mb-[-4px]" aria-hidden="true">
          {[0, 1].map((i) => (
            <span key={i} className="block w-[3px] h-5 rounded-full" style={{ background: 'linear-gradient(180deg,#8A6440,#6B4E33)' }} />
          ))}
        </div>
        {/* Carved board */}
        <motion.div
          className="relative rounded-[18px] px-6 sm:px-8 py-3"
          style={{
            width: 'min(88vw, 480px)',
            background: 'repeating-linear-gradient(180deg, #A9773D 0px, #A9773D 15px, #9C6C36 15px, #9C6C36 16px, #A37039 16px, #A37039 31px, #96682F 31px, #96682F 32px)',
            border: '4px solid #6B4E33',
            boxShadow: '0 12px 28px rgba(0,0,0,0.4), inset 0 2px 0 rgba(255,255,255,0.16), inset 0 -3px 8px rgba(0,0,0,0.28)',
            transformOrigin: 'top center',
          }}
          animate={isReducedMotion ? undefined : { rotate: [-0.8, 0.8, -0.8] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* Iron bolts at the corners — reads as fixed timber, not a panel */}
          {[
            { top: 6, left: 8 }, { top: 6, right: 8 },
            { bottom: 6, left: 8 }, { bottom: 6, right: 8 },
          ].map((pos, i) => (
            <span
              key={i}
              className="absolute rounded-full"
              style={{ ...pos, width: 6, height: 6, background: '#5A4128', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35)' }}
              aria-hidden="true"
            />
          ))}
          <h1 className="text-center m-0" style={{ fontSize: 'clamp(1.5rem, 3.6vw, 2.5rem)' }}>
            <CandyLetters />
          </h1>
        </motion.div>
        {subtitle && (
          <motion.div
            className="mt-2 px-4 py-1 rounded-lg"
            style={{ background: 'linear-gradient(160deg,#B98A57,#966E43)', border: '2px solid #6B4E33', boxShadow: '0 4px 12px rgba(0,0,0,0.28)' }}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
          >
            <p className="m-0 font-bold text-[13px]" style={{ color: '#FFF3DF' }}>{subtitle}</p>
          </motion.div>
        )}
      </motion.div>
    );
  }

  // 'mound' — the title sits against the stage, subtitle on a soft pill
  return (
    <div className="flex flex-col items-center">
      <h1 className="text-center m-0" style={{ fontSize: 'clamp(2rem, 6.4vw, 4.6rem)' }}>
        <CandyLetters />
      </h1>
      {subtitle && (
        <motion.div
          className="mt-1.5 px-4 py-1.5 rounded-full inline-flex items-center gap-1.5"
          style={{
            background: 'rgba(255,255,255,0.92)',
            boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
          }}
          initial={isReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.7 }}
        >
          <span aria-hidden="true" style={{ fontSize: 13 }}>⭐</span>
          <p className="m-0 font-extrabold text-[clamp(11px,1.5vw,14px)]" style={{ color: '#5A5A6E' }}>{subtitle}</p>
          <span aria-hidden="true" style={{ fontSize: 13 }}>⭐</span>
        </motion.div>
      )}
    </div>
  );
}

/** The mascot's greeting bubble, anchored beside the character. */
export function SpeechBubble({ text = "Who's playing today?" }: { text?: string }) {
  const { isReducedMotion } = useMotionPreset();
  return (
    <motion.div
      className="relative px-4 py-2.5 rounded-[20px] pointer-events-none"
      style={{ background: '#FFFFFF', boxShadow: '0 8px 22px rgba(0,0,0,0.2)', width: 'max-content', maxWidth: 230 }}
      initial={isReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.6, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 1 }}
    >
      <motion.p
        className="m-0 font-display text-center leading-tight"
        style={{ color: '#7B3FD4', fontSize: 'clamp(12px, 1.5vw, 16px)' }}
        animate={isReducedMotion ? undefined : { scale: [1, 1.03, 1] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        {text}
      </motion.p>
      {/* Tail pointing back toward the mascot */}
      <span
        className="absolute block"
        aria-hidden="true"
        style={{
          left: -8, bottom: 12, width: 0, height: 0,
          borderTop: '9px solid transparent',
          borderBottom: '9px solid transparent',
          borderRight: '14px solid #FFFFFF',
          filter: 'drop-shadow(-3px 2px 3px rgba(0,0,0,0.1))',
        }}
      />
    </motion.div>
  );
}
