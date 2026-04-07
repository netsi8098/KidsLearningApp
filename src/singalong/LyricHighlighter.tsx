// ─── Lyric Highlighter Component ───────────────────────────────────────────
// Renders song lyrics with three highlight modes:
// 1. word-by-word: active word scales up + color change
// 2. line-by-line: current line bright and centered, others dimmed
// 3. karaoke-sweep: colored fill sweeps left-to-right across active words

import { useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { LyricLine, LyricWord } from './singAlongData';

export type HighlightMode = 'word-by-word' | 'line-by-line' | 'karaoke-sweep';

interface LyricHighlighterProps {
  lines: LyricLine[];
  currentTime: number; // ms
  mode: HighlightMode;
  size?: 'sm' | 'md' | 'lg';
  bedtime?: boolean;
}

// ─── Size tokens ───────────────────────────────────────────────────────────
const sizeTokens = {
  sm: { base: 'text-lg', active: 'text-xl', gap: 'gap-3' },
  md: { base: 'text-2xl', active: 'text-3xl', gap: 'gap-4' },
  lg: { base: 'text-3xl', active: 'text-4xl', gap: 'gap-5' },
} as const;

// ─── Color tokens ──────────────────────────────────────────────────────────
const colors = {
  normal: {
    active: '#FF6B6B',       // coral
    highlight: '#FFE66D',    // sunny
    dimmed: '#9CA3AF',       // gray-400
    text: '#374151',         // gray-700
    sweep: '#4ECDC4',        // teal
  },
  bedtime: {
    active: '#A78BFA',       // grape (softer)
    highlight: '#C4B5FD',    // lighter grape
    dimmed: '#6B7280',       // gray-500
    text: '#D1D5DB',         // gray-300
    sweep: '#818CF8',        // indigo-400
  },
};

// ─── Helpers ───────────────────────────────────────────────────────────────
function findActiveLine(lines: LyricLine[], time: number): number {
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].startTime <= time) return i;
  }
  return 0;
}

function findActiveWord(words: LyricWord[], time: number): number {
  for (let i = words.length - 1; i >= 0; i--) {
    if (words[i].startTime <= time) return i;
  }
  return -1;
}

/** Calculate sweep progress (0-1) for a word based on current time */
function wordSweepProgress(word: LyricWord, time: number): number {
  if (time < word.startTime) return 0;
  if (time >= word.endTime) return 1;
  return (time - word.startTime) / (word.endTime - word.startTime);
}

// ═══════════════════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════════════════
export default function LyricHighlighter({
  lines,
  currentTime,
  mode,
  size = 'md',
  bedtime = false,
}: LyricHighlighterProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);
  const tokens = sizeTokens[size];
  const palette = bedtime ? colors.bedtime : colors.normal;
  const transitionSpeed = bedtime ? 0.5 : 0.25;

  const activeLineIdx = useMemo(() => findActiveLine(lines, currentTime), [lines, currentTime]);
  const activeLine = lines[activeLineIdx] ?? null;
  const activeWordIdx = useMemo(
    () => (activeLine ? findActiveWord(activeLine.words, currentTime) : -1),
    [activeLine, currentTime],
  );

  // Auto-scroll to keep current line centered
  useEffect(() => {
    if (activeLineRef.current && containerRef.current) {
      const container = containerRef.current;
      const element = activeLineRef.current;
      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      const offsetTop = elementRect.top - containerRect.top + container.scrollTop;
      const centerOffset = offsetTop - containerRect.height / 2 + elementRect.height / 2;

      container.scrollTo({
        top: Math.max(0, centerOffset),
        behavior: 'smooth',
      });
    }
  }, [activeLineIdx]);

  // ─── WORD-BY-WORD Mode ─────────────────────────────────────────────────
  if (mode === 'word-by-word') {
    return (
      <div
        ref={containerRef}
        className={`flex flex-col ${tokens.gap} items-center overflow-y-auto max-h-[50vh] scroll-smooth px-4`}
        style={{ scrollbarWidth: 'none' }}
      >
        {lines.map((line, lineIdx) => {
          const isActive = lineIdx === activeLineIdx;
          return (
            <div
              key={lineIdx}
              ref={isActive ? activeLineRef : undefined}
              className="flex flex-wrap justify-center gap-x-2 gap-y-1 transition-opacity"
              style={{
                opacity: isActive ? 1 : lineIdx < activeLineIdx ? 0.3 : 0.5,
                transitionDuration: `${transitionSpeed}s`,
              }}
            >
              {line.words.map((word, wordIdx) => {
                const isActiveWord = isActive && wordIdx === activeWordIdx;
                const isPastWord = isActive && wordIdx < activeWordIdx;
                return (
                  <motion.span
                    key={wordIdx}
                    className={`font-bold leading-tight ${isActiveWord ? tokens.active : tokens.base}`}
                    animate={{
                      scale: isActiveWord ? 1.15 : 1,
                      color: isActiveWord
                        ? palette.active
                        : isPastWord
                          ? palette.highlight
                          : isActive
                            ? palette.text
                            : palette.dimmed,
                    }}
                    transition={{ duration: transitionSpeed, type: 'spring', stiffness: 300, damping: 25 }}
                  >
                    {word.word}
                  </motion.span>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  }

  // ─── LINE-BY-LINE Mode ─────────────────────────────────────────────────
  if (mode === 'line-by-line') {
    // Show active line large + centered, next line smaller below
    const nextLineIdx = activeLineIdx + 1 < lines.length ? activeLineIdx + 1 : null;

    return (
      <div
        ref={containerRef}
        className="flex flex-col items-center justify-center min-h-[30vh] px-4"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeLineIdx}
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: transitionSpeed }}
          >
            {/* Active line */}
            <motion.p
              className={`${tokens.active} font-extrabold leading-snug mb-4`}
              style={{ color: palette.text }}
              animate={{ scale: [0.95, 1] }}
              transition={{ duration: transitionSpeed }}
            >
              {activeLine?.text ?? ''}
            </motion.p>

            {/* Next line preview */}
            {nextLineIdx !== null && lines[nextLineIdx] && (
              <motion.p
                className={`${tokens.base} font-medium leading-snug`}
                style={{ color: palette.dimmed }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ delay: 0.1 }}
              >
                {lines[nextLineIdx].text}
              </motion.p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // ─── KARAOKE-SWEEP Mode ────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      className={`flex flex-col ${tokens.gap} items-center overflow-y-auto max-h-[50vh] scroll-smooth px-4`}
      style={{ scrollbarWidth: 'none' }}
    >
      {lines.map((line, lineIdx) => {
        const isActive = lineIdx === activeLineIdx;
        return (
          <div
            key={lineIdx}
            ref={isActive ? activeLineRef : undefined}
            className="flex flex-wrap justify-center gap-x-2 gap-y-1 transition-opacity"
            style={{
              opacity: isActive ? 1 : lineIdx < activeLineIdx ? 0.3 : 0.5,
              transitionDuration: `${transitionSpeed}s`,
            }}
          >
            {line.words.map((word, wordIdx) => {
              const sweep = isActive ? wordSweepProgress(word, currentTime) : lineIdx < activeLineIdx ? 1 : 0;
              return (
                <span
                  key={wordIdx}
                  className={`font-bold leading-tight ${tokens.base} relative inline-block`}
                  style={{ color: palette.dimmed }}
                >
                  {/* Base (dimmed) text */}
                  <span style={{ position: 'relative', zIndex: 0 }}>{word.word}</span>
                  {/* Sweep overlay */}
                  <span
                    className="absolute inset-0 overflow-hidden"
                    style={{
                      width: `${sweep * 100}%`,
                      zIndex: 1,
                      color: palette.sweep,
                      whiteSpace: 'nowrap',
                    }}
                    aria-hidden
                  >
                    {word.word}
                  </span>
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
