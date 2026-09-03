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
function CandyLetters({ scale = 1, stacked = false }: { scale?: number; stacked?: boolean }) {
  const { isReducedMotion } = useMotionPreset();
  let letterIndex = 0;

  return (
    <span className={`inline-flex justify-center ${stacked ? 'flex-col items-center gap-y-0.5' : 'flex-wrap items-baseline gap-x-[0.28em] gap-y-1'}`}>
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
                <motion.span
                  className="inline-block"
                  animate={isReducedMotion ? undefined : {
                    y: [0, -2.5 - (idx % 3) * 0.45, 0],
                    rotate: [0, idx % 2 === 0 ? 1.1 : -1.1, 0],
                    filter: [
                      'brightness(1) saturate(1)',
                      'brightness(1.12) saturate(1.06)',
                      'brightness(1) saturate(1)',
                    ],
                  }}
                  transition={isReducedMotion ? undefined : {
                    duration: 2.7 + (idx % 4) * 0.18,
                    repeat: Infinity,
                    repeatDelay: 1.2,
                    ease: 'easeInOut',
                    delay: 1.2 + idx * 0.055,
                  }}
                >
                  {char}
                </motion.span>
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
        {/* Long ropes connect the sign to the overhead tree branch. */}
        <div className="mt-[-6vh] flex h-[clamp(115px,20vh,210px)] w-[64%] justify-between mb-[-4px]" aria-hidden="true">
          {[0, 1].map((i) => (
            <span
              key={i}
              className="relative block h-full w-[5px] rounded-full"
              style={{
                background: 'repeating-linear-gradient(90deg,#6A4327 0 2px,#A47342 2px 4px,#5A391F 4px 5px)',
                boxShadow: '2px 0 3px rgba(46,26,13,0.28)',
              }}
            >
              <span
                className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full border-[4px] border-[#5A391F] bg-[#8D6038] shadow-[0_2px_3px_rgba(35,18,9,0.45)]"
              />
            </span>
          ))}
        </div>
        {/* Irregular carved plaque — shaped and colored from the approved
            Treehouse reference rather than a generic rounded rectangle. */}
        <motion.div
          className="relative aspect-[1.5/1]"
          style={{
            width: 'min(88vw, 540px)',
            filter: 'drop-shadow(0 16px 18px rgba(38,18,9,0.42))',
            transformOrigin: 'top center',
          }}
          animate={isReducedMotion ? undefined : { rotate: [-0.8, 0.8, -0.8] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 560 372" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="tree-sign-wood" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#8C4A2D" />
                <stop offset="0.46" stopColor="#71371F" />
                <stop offset="1" stopColor="#5B2B1B" />
              </linearGradient>
              <linearGradient id="tree-sign-rim" x1="0" y1="0" x2="0" y2="1">
                <stop stopColor="#6A3B24" />
                <stop offset="1" stopColor="#321C13" />
              </linearGradient>
              <clipPath id="tree-sign-clip">
                <path d="M53 26 Q102 10 151 22 Q279 5 408 20 Q474 8 516 40 Q540 79 527 129 Q542 193 516 256 Q477 286 418 272 Q280 296 143 274 Q79 287 42 249 Q18 205 33 155 Q18 89 53 26Z" />
              </clipPath>
              <filter id="tree-sign-inner-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="5" result="blur" />
                <feOffset dy="6" result="offset" />
                <feComposite in="offset" in2="SourceAlpha" operator="out" result="inner" />
                <feColorMatrix in="inner" type="matrix" values="0 0 0 0 0.10 0 0 0 0 0.04 0 0 0 0 0.02 0 0 0 .75 0" />
                <feComposite in2="SourceGraphic" operator="over" />
              </filter>
            </defs>

            <path d="M53 26 Q102 10 151 22 Q279 5 408 20 Q474 8 516 40 Q540 79 527 129 Q542 193 516 256 Q477 286 418 272 Q280 296 143 274 Q79 287 42 249 Q18 205 33 155 Q18 89 53 26Z" fill="url(#tree-sign-rim)" stroke="#2C1A12" strokeWidth="10" strokeLinejoin="round" />
            <path d="M65 42 Q109 29 155 39 Q280 22 404 37 Q464 26 500 53 Q518 85 508 130 Q522 190 499 242 Q466 265 413 253 Q280 276 149 255 Q91 267 59 237 Q39 201 51 155 Q37 96 65 42Z" fill="url(#tree-sign-wood)" stroke="#A66A3D" strokeWidth="5" filter="url(#tree-sign-inner-shadow)" />

            <g clipPath="url(#tree-sign-clip)" fill="none" strokeLinecap="round">
              {[72, 103, 136, 169, 204, 237].map((y, index) => (
                <path key={y} d={`M45 ${y} Q142 ${y - 10 + index * 2} 236 ${y + 2} T520 ${y - 4}`} stroke={index % 2 ? '#4A2418' : '#B0683B'} strokeWidth={index % 2 ? 3 : 2} opacity={index % 2 ? 0.38 : 0.24} />
              ))}
              <path d="M86 63 Q126 90 99 119 T121 181" stroke="#D0834D" strokeWidth="3" opacity="0.22" />
              <path d="M449 67 Q420 99 449 129 T432 206" stroke="#3B1D14" strokeWidth="4" opacity="0.26" />
            </g>

            {/* Raised vine and leaves follow the organic plaque contour. */}
            <path d="M50 51 Q139 12 229 32 Q327 9 420 31 Q476 17 515 55" fill="none" stroke="#34551F" strokeWidth="10" strokeLinecap="round" />
            <path d="M51 238 Q132 286 229 258 Q331 293 431 255 Q486 276 511 234" fill="none" stroke="#34551F" strokeWidth="9" strokeLinecap="round" />
            {[
              [76, 37, -26], [126, 26, 24], [190, 31, -18], [365, 27, 24], [427, 31, -24], [488, 42, 20],
              [79, 252, 24], [141, 266, -20], [202, 263, 19], [386, 265, -20], [449, 261, 24], [493, 246, -28],
            ].map(([cx, cy, rotate], index) => (
              <g key={index} transform={`rotate(${rotate} ${cx} ${cy})`}>
                <ellipse cx={cx} cy={cy} rx="16" ry="8.5" fill={index % 2 ? '#6E9F38' : '#83B84A'} stroke="#365B22" strokeWidth="2" />
                <path d={`M${cx - 10} ${cy} Q${cx} ${cy - 2} ${cx + 11} ${cy}`} stroke="#B1D66C" strokeWidth="1.5" opacity="0.7" />
              </g>
            ))}
            <circle cx="55" cy="57" r="5" fill="#2A1912" /><circle cx="507" cy="59" r="5" fill="#2A1912" />
            <circle cx="56" cy="233" r="5" fill="#2A1912" /><circle cx="505" cy="230" r="5" fill="#2A1912" />
          </svg>

          <h1
            className="absolute left-[8%] right-[8%] top-[8%] bottom-[24%] z-[1] m-0 flex items-center justify-center text-center"
            style={{ fontSize: 'clamp(3.1rem, 6.6vw, 5.1rem)' }}
          >
            <CandyLetters stacked scale={1.05} />
          </h1>
          {subtitle && (
            <motion.div
              className="absolute left-1/2 top-[77%] z-[2] w-[68%] -translate-x-1/2 pt-5"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75 }}
            >
              <span
                className="absolute left-[17%] top-0 h-7 w-[4px] rounded-full"
                style={{ background: 'linear-gradient(90deg,#59341F,#A47242,#4A2B1B)', boxShadow: '1px 0 2px rgba(33,18,10,0.35)' }}
                aria-hidden="true"
              />
              <span
                className="absolute right-[17%] top-0 h-7 w-[4px] rounded-full"
                style={{ background: 'linear-gradient(90deg,#59341F,#A47242,#4A2B1B)', boxShadow: '1px 0 2px rgba(33,18,10,0.35)' }}
                aria-hidden="true"
              />
              <motion.div
                className="relative flex min-h-12 items-center justify-center px-5 py-2 text-center"
                style={{
                  background: 'linear-gradient(180deg,#8B4B2E 0%,#6B341F 100%)',
                  border: '4px solid #3B2117',
                  borderRadius: '9px 13px 10px 12px',
                  boxShadow: 'inset 0 2px 0 rgba(255,196,126,0.22), 0 7px 12px rgba(31,15,8,0.35)',
                }}
                animate={isReducedMotion ? undefined : { rotate: [0.45, -0.45, 0.45] }}
                transition={{ duration: 5.4, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
              >
                <span className="absolute left-2 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[#2A1912]" aria-hidden="true" />
                <p className="m-0 font-display text-[clamp(14px,2.1vw,18px)] leading-tight" style={{ color: '#FFF0D2', textShadow: '0 2px 2px rgba(40,18,8,0.6)' }}>{subtitle}</p>
                <span className="absolute right-2 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[#2A1912]" aria-hidden="true" />
              </motion.div>
            </motion.div>
          )}
        </motion.div>
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
