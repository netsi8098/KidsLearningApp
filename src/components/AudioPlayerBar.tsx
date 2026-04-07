import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AudioEpisode } from '../data/audioData';

interface AudioPlayerBarProps {
  episode: AudioEpisode;
  isPlaying: boolean;
  playbackSpeed: number;
  sleepTimerMinutes: number | null;
  onPause: () => void;
  onResume: () => void;
  onSetSpeed: (speed: number) => void;
  onSetSleepTimer: (minutes: number | null) => void;
}

const speeds = [0.75, 1, 1.25, 1.5];
const sleepOptions = [null, 5, 10, 15, 30];

/* ── Sound Wave Bars (mini, for player bar) ─── */
function MiniSoundWave({ isActive }: { isActive: boolean }) {
  const bars = [0.5, 1, 0.3, 0.7, 0.5];
  return (
    <div className="flex items-end gap-[1.5px] h-3">
      {bars.map((height, i) => (
        <motion.div
          key={i}
          className="w-[2px] rounded-full bg-white/70"
          animate={isActive ? {
            height: [`${height * 12}px`, `${(1 - height) * 12 + 2}px`, `${height * 12}px`],
          } : { height: `${height * 8}px` }}
          transition={isActive ? {
            duration: 0.5 + i * 0.08,
            repeat: Infinity,
            ease: 'easeInOut',
          } : { duration: 0.3 }}
        />
      ))}
    </div>
  );
}

export default function AudioPlayerBar({
  episode,
  isPlaying,
  playbackSpeed,
  sleepTimerMinutes,
  onPause,
  onResume,
  onSetSpeed,
  onSetSleepTimer,
}: AudioPlayerBarProps) {
  const [showControls, setShowControls] = useState(false);

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-50"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      exit={{ y: 100 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
    >
      {/* ── Expanded controls panel ─── */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            className="bg-white/95 backdrop-blur-md border-t border-[#F0EAE0] px-4 py-3 flex flex-wrap items-center gap-3 justify-center"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            {/* Speed controls */}
            <div className="flex items-center gap-1">
              <span className="text-xs text-[#6B6B7B] font-bold mr-1">Speed:</span>
              {speeds.map((s) => (
                <motion.button
                  key={s}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                    playbackSpeed === s
                      ? 'bg-gradient-to-r from-[#A78BFA] to-[#C4B5FD] text-white shadow-[0_2px_8px_rgba(167,139,250,0.25)]'
                      : 'bg-[#F3EFFE] text-[#6B6B7B]'
                  }`}
                  onClick={() => onSetSpeed(s)}
                  whileTap={{ scale: 0.9 }}
                >
                  {s}x
                </motion.button>
              ))}
            </div>

            {/* Sleep timer */}
            <div className="flex items-center gap-1">
              <span className="text-xs text-[#6B6B7B] font-bold mr-1">🌙 Sleep:</span>
              {sleepOptions.map((m) => (
                <motion.button
                  key={m ?? 'off'}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                    sleepTimerMinutes === m
                      ? 'bg-gradient-to-r from-[#6366F1] to-[#A78BFA] text-white shadow-[0_2px_8px_rgba(99,102,241,0.25)]'
                      : 'bg-[#F3EFFE] text-[#6B6B7B]'
                  }`}
                  onClick={() => onSetSleepTimer(m)}
                  whileTap={{ scale: 0.9 }}
                >
                  {m === null ? 'Off' : `${m}m`}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Progress bar indicator ─── */}
      <div className="h-[3px] bg-[#F0EAE0]">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: 'linear-gradient(90deg, #A78BFA, #FD79A8)',
          }}
          animate={isPlaying ? {
            width: ['0%', '100%'],
          } : {}}
          transition={isPlaying ? {
            duration: 30,
            repeat: Infinity,
            ease: 'linear',
          } : {}}
        />
      </div>

      {/* ── Main bar ─── */}
      <div
        className="px-4 py-3 flex items-center gap-3"
        style={{
          background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 50%, #7C3AED 100%)',
        }}
      >
        {/* Episode emoji + sound wave */}
        <div className="relative flex-shrink-0">
          <motion.span
            className="text-3xl block"
            animate={isPlaying ? {
              scale: [1, 1.1, 1],
              rotate: [0, 3, -3, 0],
            } : {}}
            transition={isPlaying ? {
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            } : {}}
          >
            {episode.emoji}
          </motion.span>
          {isPlaying && (
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
              <MiniSoundWave isActive={true} />
            </div>
          )}
        </div>

        {/* Title & duration */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white text-sm truncate drop-shadow-sm">{episode.title}</p>
          <p className="text-xs text-white/60 font-semibold">{episode.duration}</p>
        </div>

        {/* Controls toggle */}
        <motion.button
          className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center text-sm cursor-pointer border border-white/10"
          onClick={() => setShowControls(!showControls)}
          whileTap={{ scale: 0.9 }}
        >
          <span className="text-white">{showControls ? '✕' : '⚙️'}</span>
        </motion.button>

        {/* Play / Pause - large child-friendly button (64px) */}
        <motion.button
          className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl cursor-pointer ${
            isPlaying
              ? 'bg-white text-[#A78BFA] shadow-[0_4px_20px_rgba(255,255,255,0.3)]'
              : 'bg-white text-[#A78BFA] shadow-[0_4px_20px_rgba(255,255,255,0.3)]'
          }`}
          onClick={isPlaying ? onPause : onResume}
          whileTap={{ scale: 0.85 }}
        >
          {isPlaying ? '⏸️' : '▶️'}
        </motion.button>
      </div>
    </motion.div>
  );
}
