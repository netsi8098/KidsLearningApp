// ─── Sing-Along Player ─────────────────────────────────────────────────────
// Full-screen karaoke-style experience for children. Features:
// - Stage header with song title & current section label
// - Mascot host bouncing to the beat at bottom-left
// - LyricHighlighter center-screen with large text
// - Bouncing beat marker above the current word
// - Controls: play/pause, mode toggle, replay, back
// - Thin progress bar at top
// - Musical note particles floating upward
// - Bedtime variant with darker palette & no particles

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SingAlongSong, VocalMode } from './singAlongData';
import { useSingAlong } from './useSingAlong';
import LyricHighlighter, { type HighlightMode } from './LyricHighlighter';

interface SingAlongPlayerProps {
  song: SingAlongSong;
  onComplete?: () => void;
  onExit?: () => void;
  bedtime?: boolean;
}

// ─── Musical note particles ────────────────────────────────────────────────
const NOTES = ['🎵', '🎶', '🎼', '🎹', '🎸'];

function NoteParticles({ active, bedtime }: { active: boolean; bedtime: boolean }) {
  if (bedtime || !active) return null;

  // Render 6 floating notes at random horizontal positions
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute text-2xl"
          style={{ left: `${10 + i * 15}%`, bottom: '-2rem' }}
          animate={{
            y: [0, -window.innerHeight * 0.7 - i * 40],
            x: [0, Math.sin(i * 1.5) * 40],
            opacity: [0.8, 0],
            rotate: [0, 360],
          }}
          transition={{
            duration: 4 + i * 0.5,
            repeat: Infinity,
            delay: i * 1.2,
            ease: 'easeOut',
          }}
        >
          {NOTES[i % NOTES.length]}
        </motion.span>
      ))}
    </div>
  );
}

// ─── Bouncing beat marker ──────────────────────────────────────────────────
function BeatMarker({ pulse, bedtime }: { pulse: boolean; bedtime: boolean }) {
  return (
    <motion.div
      className="text-2xl select-none"
      animate={{ y: pulse ? -8 : 0, scale: pulse ? 1.2 : 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 15 }}
    >
      {bedtime ? '🌟' : '⭐'}
    </motion.div>
  );
}

// ─── Mascot host ───────────────────────────────────────────────────────────
const MASCOTS: Record<string, { emoji: string; name: string }> = {
  nursery: { emoji: '🦆', name: 'Daisy' },
  alphabet: { emoji: '🦁', name: 'Leo' },
  counting: { emoji: '🐒', name: 'Monkey' },
  action: { emoji: '🐰', name: 'Ruby' },
  bedtime: { emoji: '🦉', name: 'Ollie' },
  seasonal: { emoji: '🦊', name: 'Finn' },
};

function MascotHost({
  category,
  pulse,
  bedtime,
  isWaiting,
}: {
  category: string;
  pulse: boolean;
  bedtime: boolean;
  isWaiting: boolean;
}) {
  const mascot = MASCOTS[category] ?? MASCOTS.nursery;
  const bounceSpeed = bedtime ? 0.8 : 0.3;

  return (
    <motion.div
      className="flex flex-col items-center"
      animate={{
        y: pulse ? -6 : 0,
        rotate: isWaiting ? [0, -5, 5, 0] : 0,
      }}
      transition={{
        y: { type: 'spring', stiffness: 300, damping: 10, duration: bounceSpeed },
        rotate: { duration: 0.6, repeat: isWaiting ? Infinity : 0 },
      }}
    >
      <span className="text-5xl select-none">{mascot.emoji}</span>
      {isWaiting && (
        <motion.span
          className="text-xs font-bold text-white bg-coral rounded-full px-2 py-0.5 mt-1"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring' }}
        >
          Your turn!
        </motion.span>
      )}
    </motion.div>
  );
}

// ─── Vocal mode label ──────────────────────────────────────────────────────
const MODE_LABELS: Record<VocalMode, { label: string; emoji: string }> = {
  full: { label: 'Sing Along', emoji: '🎤' },
  instrumental: { label: 'Music Only', emoji: '🎹' },
  'lead-repeat': { label: 'Follow Me', emoji: '🗣️' },
};

const HIGHLIGHT_LABELS: Record<string, string> = {
  'word-by-word': 'Word',
  'line-by-line': 'Line',
  'karaoke-sweep': 'Sweep',
};

// ═══════════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════════
export default function SingAlongPlayer({
  song,
  onComplete,
  onExit,
  bedtime = false,
}: SingAlongPlayerProps) {
  const {
    isPlaying,
    currentTime,
    currentSection,
    currentLine,
    vocalMode,
    play,
    pause,
    setVocalMode,
    restart,
    progress,
    beatPulse,
    isWaitingForResponse,
    confirmResponse,
  } = useSingAlong(song);

  const [highlightMode, setHighlightMode] = useState<HighlightMode>('word-by-word');

  // All lines flattened for the highlighter
  const allLines = useMemo(() => song.sections.flatMap((s) => s.lines), [song]);

  // Cycle through vocal modes
  const cycleVocalMode = useCallback(() => {
    const modes = song.vocalModes;
    const idx = modes.indexOf(vocalMode);
    const next = modes[(idx + 1) % modes.length];
    setVocalMode(next);
  }, [song.vocalModes, vocalMode, setVocalMode]);

  // Cycle highlight modes
  const cycleHighlightMode = useCallback(() => {
    const modes: HighlightMode[] = ['word-by-word', 'line-by-line', 'karaoke-sweep'];
    const idx = modes.indexOf(highlightMode);
    setHighlightMode(modes[(idx + 1) % modes.length]);
  }, [highlightMode]);

  // Handle completion
  const handlePlayPause = useCallback(() => {
    if (progress >= 1) {
      onComplete?.();
      return;
    }
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause, progress, onComplete]);

  // Background gradient based on mood
  const bgGradient = bedtime
    ? 'bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950'
    : 'bg-gradient-to-b from-violet-500 via-pink-400 to-orange-300';

  const textColor = bedtime ? 'text-gray-200' : 'text-white';

  return (
    <div className={`min-h-dvh ${bgGradient} relative flex flex-col overflow-hidden`}>
      {/* Musical note particles */}
      <NoteParticles active={isPlaying} bedtime={bedtime} />

      {/* ─── Progress bar (top) ──────────────────────────────────── */}
      <div className="w-full h-1.5 bg-white/20">
        <motion.div
          className="h-full rounded-r-full"
          style={{ backgroundColor: bedtime ? '#A78BFA' : '#FFE66D' }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.15, ease: 'linear' }}
        />
      </div>

      {/* ─── Stage header ────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        {/* Back button */}
        <motion.button
          className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-lg cursor-pointer"
          onClick={onExit}
          whileTap={{ scale: 0.9 }}
          aria-label="Exit"
        >
          <span className={textColor}>✕</span>
        </motion.button>

        {/* Title + section */}
        <div className="text-center flex-1 mx-3">
          <h2 className={`text-lg font-extrabold ${textColor} truncate`}>
            {song.emoji} {song.title}
          </h2>
          <AnimatePresence mode="wait">
            {currentSection && (
              <motion.p
                key={currentSection.label}
                className="text-xs font-bold text-white/70"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
              >
                {currentSection.label}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Highlight mode toggle */}
        <motion.button
          className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur text-xs font-bold cursor-pointer"
          style={{ color: bedtime ? '#C4B5FD' : '#FFF' }}
          onClick={cycleHighlightMode}
          whileTap={{ scale: 0.9 }}
          aria-label="Toggle highlight mode"
        >
          {HIGHLIGHT_LABELS[highlightMode]}
        </motion.button>
      </div>

      {/* ─── Lyric area (main content) ───────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-4 relative z-10">
        {/* Beat marker */}
        <div className="mb-3">
          <BeatMarker pulse={beatPulse} bedtime={bedtime} />
        </div>

        {/* Lyrics */}
        <LyricHighlighter
          lines={allLines}
          currentTime={currentTime}
          mode={highlightMode}
          size="md"
          bedtime={bedtime}
        />

        {/* Lead-repeat "I sang it!" prompt */}
        <AnimatePresence>
          {isWaitingForResponse && (
            <motion.button
              className="mt-6 px-8 py-4 rounded-2xl bg-coral text-white font-extrabold text-xl shadow-lg cursor-pointer"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300 }}
              onClick={confirmResponse}
              whileTap={{ scale: 0.9 }}
            >
              🎤 I sang it!
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Bottom controls ─────────────────────────────────────── */}
      <div className="relative z-10 px-4 pb-6">
        {/* Mascot + controls row */}
        <div className="flex items-end justify-between mb-4">
          {/* Mascot host (bottom-left) */}
          <MascotHost
            category={song.category}
            pulse={beatPulse && isPlaying}
            bedtime={bedtime}
            isWaiting={isWaitingForResponse}
          />

          {/* Center: Play/Pause */}
          <motion.button
            className="w-20 h-20 rounded-full shadow-xl flex items-center justify-center text-4xl cursor-pointer"
            style={{
              backgroundColor: bedtime ? '#6366F1' : '#FF6B6B',
            }}
            onClick={handlePlayPause}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            <span className="text-white">
              {progress >= 1 ? '🎉' : isPlaying ? '⏸️' : '▶️'}
            </span>
          </motion.button>

          {/* Right: Replay + mode toggle */}
          <div className="flex flex-col items-center gap-2">
            {/* Replay */}
            <motion.button
              className="w-11 h-11 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-xl cursor-pointer"
              onClick={restart}
              whileTap={{ scale: 0.85 }}
              aria-label="Restart song"
            >
              🔄
            </motion.button>

            {/* Vocal mode */}
            <motion.button
              className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur flex items-center gap-1 cursor-pointer"
              onClick={cycleVocalMode}
              whileTap={{ scale: 0.9 }}
              aria-label="Toggle vocal mode"
            >
              <span className="text-sm">{MODE_LABELS[vocalMode].emoji}</span>
              <span className="text-xs font-bold text-white/90">{MODE_LABELS[vocalMode].label}</span>
            </motion.button>
          </div>
        </div>

        {/* Time display */}
        <div className="flex items-center justify-center gap-2 text-xs font-mono text-white/60">
          <span>{formatTime(currentTime)}</span>
          <span>/</span>
          <span>{formatTime(song.duration * 1000)}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Utility ───────────────────────────────────────────────────────────────
function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}
