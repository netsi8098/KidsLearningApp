import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAudio } from '../hooks/useAudio';
import { useBedtimeMode } from '../hooks/useBedtimeMode';
import { useBedtimeSession } from '../hooks/useBedtimeSession';
import {
  breathingExercises,
  calmSounds,
  goodnightRoutine,
  type CalmSound,
} from '../data/bedtimeData';
import { storiesData } from '../data/storiesData';
import NavButton from '../components/NavButton';
import BreathingGuide from '../components/BreathingGuide';

// ── Web Audio helpers for calm sounds ──────────────────────

let audioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/** Generate filtered white noise (rain / ocean) */
function playNoise(filterFreq: number): { stop: () => void } {
  const ctx = getAudioCtx();
  const bufferSize = 2 * ctx.sampleRate;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(filterFreq, ctx.currentTime);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 1);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  source.start();

  return {
    stop: () => {
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
      setTimeout(() => {
        try { source.stop(); } catch {}
      }, 600);
    },
  };
}

/** Play a simple repeating melody */
function playMelody(notes: number[]): { stop: () => void } {
  const ctx = getAudioCtx();
  let stopped = false;
  let timeoutId: ReturnType<typeof setTimeout>;

  function playOnce(startTime: number) {
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime + i * 0.6);
      gain.gain.setValueAtTime(0.15, startTime + i * 0.6);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + i * 0.6 + 0.55);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime + i * 0.6);
      osc.stop(startTime + i * 0.6 + 0.55);
    });
  }

  function loop() {
    if (stopped) return;
    playOnce(ctx.currentTime);
    timeoutId = setTimeout(loop, notes.length * 600 + 400);
  }

  loop();

  return {
    stop: () => {
      stopped = true;
      clearTimeout(timeoutId);
    },
  };
}

/** Play heartbeat-style pulse */
function playPulse(bpm: number): { stop: () => void } {
  const ctx = getAudioCtx();
  let stopped = false;
  let timeoutId: ReturnType<typeof setTimeout>;
  const intervalMs = (60 / bpm) * 1000;

  function beat() {
    if (stopped) return;
    const now = ctx.currentTime;

    // Double thump
    [0, 0.12].forEach((offset) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(55, now + offset);
      gain.gain.setValueAtTime(0.25, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 0.15);
    });

    timeoutId = setTimeout(beat, intervalMs);
  }

  beat();

  return {
    stop: () => {
      stopped = true;
      clearTimeout(timeoutId);
    },
  };
}

function playCalmSound(sound: CalmSound): { stop: () => void } {
  switch (sound.type) {
    case 'noise':
      return playNoise(sound.filter ?? 600);
    case 'melody':
      return playMelody(sound.notes ?? [261, 294, 330, 294, 261]);
    case 'pulse':
      return playPulse(sound.frequency ?? 60);
    default:
      return { stop: () => {} };
  }
}

// ── Starfield Component ─────────────────────────────────

function Starfield() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* CSS starfield base layer */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(1px 1px at 10% 12%, rgba(255,255,255,0.5) 0%, transparent 100%),
            radial-gradient(1px 1px at 25% 8%, rgba(255,255,255,0.35) 0%, transparent 100%),
            radial-gradient(1.2px 1.2px at 45% 18%, rgba(255,255,255,0.45) 0%, transparent 100%),
            radial-gradient(0.8px 0.8px at 60% 5%, rgba(255,255,255,0.3) 0%, transparent 100%),
            radial-gradient(1px 1px at 75% 22%, rgba(255,255,255,0.4) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 88% 10%, rgba(255,255,255,0.25) 0%, transparent 100%),
            radial-gradient(0.8px 0.8px at 15% 30%, rgba(255,255,255,0.2) 0%, transparent 100%),
            radial-gradient(1px 1px at 35% 38%, rgba(255,255,255,0.3) 0%, transparent 100%),
            radial-gradient(1px 1px at 55% 32%, rgba(255,255,255,0.35) 0%, transparent 100%),
            radial-gradient(0.8px 0.8px at 70% 40%, rgba(255,255,255,0.2) 0%, transparent 100%),
            radial-gradient(1.2px 1.2px at 92% 35%, rgba(255,255,255,0.3) 0%, transparent 100%),
            radial-gradient(1px 1px at 8% 48%, rgba(255,255,255,0.25) 0%, transparent 100%),
            radial-gradient(0.8px 0.8px at 48% 52%, rgba(255,255,255,0.2) 0%, transparent 100%),
            radial-gradient(1px 1px at 82% 55%, rgba(255,255,255,0.3) 0%, transparent 100%)
          `,
        }}
      />

      {/* SVG twinkling stars with different animation speeds */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice">
        {/* Slow twinkle stars */}
        <circle cx="52" cy="45" r="1.2" fill="rgba(255,255,255,0.6)" className="animate-bedtime-twinkle-1" />
        <circle cx="180" cy="28" r="1.5" fill="rgba(255,255,255,0.7)" className="animate-bedtime-twinkle-2" />
        <circle cx="310" cy="62" r="1" fill="rgba(255,255,255,0.5)" className="animate-bedtime-twinkle-3" />
        <circle cx="95" cy="95" r="1.3" fill="rgba(255,255,255,0.6)" className="animate-bedtime-twinkle-2" />
        <circle cx="240" cy="110" r="0.8" fill="rgba(255,255,255,0.4)" className="animate-bedtime-twinkle-1" />
        <circle cx="365" cy="88" r="1.1" fill="rgba(255,255,255,0.5)" className="animate-bedtime-twinkle-3" />
        <circle cx="30" cy="160" r="1" fill="rgba(255,255,255,0.5)" className="animate-bedtime-twinkle-2" />
        <circle cx="155" cy="145" r="1.4" fill="rgba(255,255,255,0.6)" className="animate-bedtime-twinkle-1" />
        <circle cx="280" cy="170" r="0.9" fill="rgba(255,255,255,0.4)" className="animate-bedtime-twinkle-3" />
        <circle cx="390" cy="155" r="1.2" fill="rgba(255,255,255,0.5)" className="animate-bedtime-twinkle-2" />
        {/* Brighter accent stars */}
        <circle cx="120" cy="60" r="1.8" fill="rgba(167,139,250,0.5)" className="animate-bedtime-twinkle-1" />
        <circle cx="340" cy="130" r="1.6" fill="rgba(78,205,196,0.4)" className="animate-bedtime-twinkle-3" />
      </svg>

      {/* Gradient overlay: deep navy to slightly lighter at bottom */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, transparent 0%, transparent 60%, rgba(15,15,35,0.4) 100%)',
        }}
      />
    </div>
  );
}

// ── Crescent Moon SVG ───────────────────────────────────

function CrescentMoon() {
  return (
    <div className="absolute top-4 right-6 pointer-events-none animate-bedtime-moon-glow" style={{ zIndex: 1 }}>
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <defs>
          <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255,235,150,0.3)" />
            <stop offset="100%" stopColor="rgba(255,235,150,0)" />
          </radialGradient>
        </defs>
        {/* Soft glow behind moon */}
        <circle cx="24" cy="24" r="24" fill="url(#moonGlow)" />
        {/* Crescent moon shape */}
        <path
          d="M28 6C18.06 6 10 14.06 10 24s8.06 18 18 18c4.05 0 7.77-1.34 10.78-3.6A18 18 0 0 1 22 24 18 18 0 0 1 38.78 9.6 17.88 17.88 0 0 0 28 6Z"
          fill="#FFE9A0"
          opacity="0.9"
        />
        {/* Moon surface detail */}
        <circle cx="18" cy="20" r="1.5" fill="#FFD966" opacity="0.3" />
        <circle cx="22" cy="28" r="1" fill="#FFD966" opacity="0.2" />
      </svg>
    </div>
  );
}

// ── Sleepy Mascot Welcome ──────────────────────────────

function SleepyMascot() {
  return (
    <motion.div
      className="flex flex-col items-center mb-6 relative z-10"
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* Glow behind mascot */}
      <div
        className="absolute top-2 w-24 h-24 rounded-full animate-bedtime-pulse-ring"
        style={{ background: 'radial-gradient(circle, rgba(108,92,231,0.15) 0%, transparent 70%)' }}
      />
      {/* Owl mascot with float animation */}
      <motion.div
        className="text-6xl mb-2 animate-bedtime-float-gentle"
        style={{ filter: 'drop-shadow(0 4px 12px rgba(108,92,231,0.2))' }}
      >
        🦉
      </motion.div>
      {/* Speech bubble */}
      <motion.div
        className="relative bg-[#1E2140]/80 border border-[#2A2D52] rounded-2xl px-5 py-2.5 mt-1"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        {/* Speech bubble tail */}
        <div
          className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#1E2140]/80 border-l border-t border-[#2A2D52] rotate-45"
        />
        <p className="text-sm font-medium text-[#C4B5FD] relative z-10">
          Time to wind down...
        </p>
      </motion.div>
    </motion.div>
  );
}

// ── Sound Wave Decoration ──────────────────────────────

function SoundWaveDecoration({ isActive }: { isActive: boolean }) {
  return (
    <svg width="60" height="16" viewBox="0 0 60 16" className="mx-auto mb-2" fill="none">
      <motion.path
        d="M0 8 Q5 2, 10 8 T20 8 T30 8 T40 8 T50 8 T60 8"
        stroke={isActive ? '#6C5CE7' : '#3A3D5C'}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        animate={isActive ? { d: [
          'M0 8 Q5 2, 10 8 T20 8 T30 8 T40 8 T50 8 T60 8',
          'M0 8 Q5 12, 10 8 T20 8 T30 8 T40 8 T50 8 T60 8',
          'M0 8 Q5 2, 10 8 T20 8 T30 8 T40 8 T50 8 T60 8',
        ] } : {}}
        transition={isActive ? { repeat: Infinity, duration: 1.5, ease: 'easeInOut' } : {}}
      />
      <motion.path
        d="M0 10 Q7.5 4, 15 10 T30 10 T45 10 T60 10"
        stroke={isActive ? '#A78BFA' : '#2A2D52'}
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
        animate={isActive ? { d: [
          'M0 10 Q7.5 4, 15 10 T30 10 T45 10 T60 10',
          'M0 10 Q7.5 14, 15 10 T30 10 T45 10 T60 10',
          'M0 10 Q7.5 4, 15 10 T30 10 T45 10 T60 10',
        ] } : {}}
        transition={isActive ? { repeat: Infinity, duration: 2, ease: 'easeInOut' } : {}}
      />
    </svg>
  );
}

// ── Bedtime Completion State ────────────────────────────

function BedtimeCompletionState({ onGoHome }: { onGoHome: () => void }) {
  return (
    <motion.div
      className="min-h-dvh bg-[#0F0F23] flex flex-col items-center justify-center px-6 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <Starfield />

      {/* Decorative stars and moon */}
      <motion.div
        className="absolute top-16 right-8 text-3xl animate-bedtime-moon-glow"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        🌙
      </motion.div>
      <motion.div
        className="absolute top-24 left-12 text-lg animate-bedtime-twinkle-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 0.8 }}
      >
        ✨
      </motion.div>
      <motion.div
        className="absolute top-32 right-20 text-sm animate-bedtime-twinkle-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 1 }}
      >
        ✨
      </motion.div>

      {/* Sleeping mascot */}
      <motion.div
        className="text-7xl mb-6"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
        style={{ filter: 'drop-shadow(0 4px 20px rgba(108,92,231,0.25))' }}
      >
        😴
      </motion.div>

      <motion.h2
        className="text-2xl font-extrabold text-[#D4D4E8] mb-2 text-center"
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Sweet dreams!
      </motion.h2>

      <motion.p
        className="text-sm text-[#7B7BA0] mb-10 text-center"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        You did a wonderful job winding down tonight.
      </motion.p>

      <motion.button
        className="bg-gradient-to-r from-[#6C5CE7]/80 to-[#8B7CF7]/80 text-white/90 font-bold text-sm py-3 px-8 rounded-full cursor-pointer shadow-[0_4px_20px_rgba(108,92,231,0.25)]"
        onClick={onGoHome}
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.9 }}
        whileTap={{ scale: 0.95 }}
      >
        Back to Home
      </motion.button>
    </motion.div>
  );
}

// ── Bedtime story cards from storiesData ────────────────

const bedtimeStories = storiesData.filter(s => s.category === 'bedtime');

// ── BedtimePage Component ──────────────────────────────────

export default function BedtimePage() {
  const navigate = useNavigate();
  const { currentPlayer } = useApp();
  const { playClick } = useAudio();
  const { isBedtime, toggleBedtime } = useBedtimeMode();
  const playerId = currentPlayer?.id;
  const { tonightSession, startSession, recordBreathing, completeSession } =
    useBedtimeSession(playerId);

  // Routine checklist
  const [checkedSteps, setCheckedSteps] = useState<Set<string>>(new Set());

  // Breathing guide
  const [activeExercise, setActiveExercise] = useState<(typeof breathingExercises)[number] | null>(
    null
  );

  // Calm sounds
  const [playingSound, setPlayingSound] = useState<string | null>(null);
  const soundRef = useRef<{ stop: () => void } | null>(null);

  // Completion state
  const [showCompletion, setShowCompletion] = useState(false);

  if (!currentPlayer) return <Navigate to="/" replace />;

  // Start session on mount if bedtime mode is on
  useEffect(() => {
    if (isBedtime && playerId && !tonightSession) {
      startSession();
    }
  }, [isBedtime, playerId, tonightSession, startSession]);

  // Cleanup sound on unmount
  useEffect(() => {
    return () => {
      soundRef.current?.stop();
    };
  }, []);

  // Toggle a routine step
  const toggleStep = (stepId: string) => {
    playClick();
    setCheckedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      return next;
    });
  };

  // Check if all steps done
  const allStepsDone = goodnightRoutine.every((s) => checkedSteps.has(s.id));

  // Handle sound play/stop
  const handleSound = useCallback(
    (sound: CalmSound) => {
      // If same sound playing, stop it
      if (playingSound === sound.id) {
        soundRef.current?.stop();
        soundRef.current = null;
        setPlayingSound(null);
        return;
      }

      // Stop previous sound
      soundRef.current?.stop();

      // Play new sound
      const player = playCalmSound(sound);
      soundRef.current = player;
      setPlayingSound(sound.id);
    },
    [playingSound]
  );

  // Handle breathing exercise completion
  const handleBreathingComplete = async () => {
    if (activeExercise) {
      await recordBreathing(activeExercise.id);
    }
    setActiveExercise(null);
  };

  // Complete the session
  const handleCompleteSession = async () => {
    soundRef.current?.stop();
    soundRef.current = null;
    setPlayingSound(null);
    await completeSession();
    setShowCompletion(true);
  };

  // ── Completion State ──
  if (showCompletion) {
    return <BedtimeCompletionState onGoHome={() => navigate('/menu')} />;
  }

  // ── Breathing Guide Overlay ──
  if (activeExercise) {
    return (
      <div className="min-h-dvh bg-[#0F0F23] px-4 pt-4 pb-8 relative overflow-hidden">
        <Starfield />

        <div className="flex items-center gap-3 mb-4 relative z-10">
          <NavButton onClick={() => setActiveExercise(null)} direction="back" />
          <h2 className="text-lg font-bold text-[#D4D4E8]">
            {activeExercise.emoji} {activeExercise.name}
          </h2>
        </div>

        <motion.div
          className="bg-[#1E2140]/90 rounded-[20px] shadow-[0_4px_24px_rgba(0,0,0,0.4)] border border-[#2A2D52] p-5 mb-4 relative z-10 backdrop-blur-sm"
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <p className="text-sm text-[#9B9BC0] text-center">{activeExercise.instructions}</p>
        </motion.div>

        <div className="relative z-10">
          <BreathingGuide exercise={activeExercise} onComplete={handleBreathingComplete} />
        </div>

        {/* Decorative concentric rings behind breathing area */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ zIndex: 0 }}>
          <div className="w-72 h-72 rounded-full border border-[#6C5CE7]/10 animate-bedtime-breathe-ring" />
          <div className="absolute inset-4 rounded-full border border-[#A78BFA]/8 animate-bedtime-breathe-ring" style={{ animationDelay: '1s' }} />
          <div className="absolute inset-8 rounded-full border border-[#6C5CE7]/6 animate-bedtime-breathe-ring" style={{ animationDelay: '2s' }} />
        </div>
      </div>
    );
  }

  // Routine progress calculation
  const routineProgress = goodnightRoutine.length > 0
    ? (checkedSteps.size / goodnightRoutine.length) * 100
    : 0;

  return (
    <div
      className="min-h-dvh px-4 pt-4 pb-8 relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #1A1A2E 0%, #141428 50%, #0F0F23 100%)',
      }}
    >
      {/* Immersive starfield background */}
      <Starfield />

      {/* Crescent moon decoration */}
      <CrescentMoon />

      {/* ── Sleepy Mascot Welcome ── */}
      <div className="relative z-10 mt-8">
        <SleepyMascot />
      </div>

      {/* ── Dimmed Header ── */}
      <div className="flex items-center justify-between mb-5 relative z-10">
        <div className="bg-[#2A2D52]/60 rounded-full border border-[#3A3D5C]/40">
          <NavButton onClick={() => navigate('/menu')} direction="back" />
        </div>
        <h2 className="text-xl font-extrabold text-[#D4D4E8]">Bedtime & Calm</h2>
        <div className="w-14" /> {/* Spacer for alignment */}
      </div>

      {/* ── Bedtime Mode Toggle ── */}
      <motion.div
        className="bg-[#1E2140]/90 rounded-[20px] shadow-[0_4px_24px_rgba(0,0,0,0.4)] border border-[#2A2D52] p-4 mb-6 flex items-center justify-between relative z-10 backdrop-blur-sm"
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#6C5CE7]/15 flex items-center justify-center">
            <span className="text-2xl">{isBedtime ? '🌙' : '☀️'}</span>
          </div>
          <div>
            <p className="font-bold text-[#D4D4E8]">Bedtime Mode</p>
            <p className="text-xs text-[#7B7BA0]">
              {isBedtime ? 'Calm colors and sounds active' : 'Turn on for a peaceful experience'}
            </p>
          </div>
        </div>
        <motion.button
          className={`w-14 h-8 rounded-full relative cursor-pointer transition-colors ${
            isBedtime ? 'bg-[#6C5CE7]' : 'bg-[#3A3D5C]'
          }`}
          onClick={toggleBedtime}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            className="w-6 h-6 bg-white rounded-full absolute top-1 shadow-md"
            animate={{ left: isBedtime ? 30 : 4 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </motion.button>
      </motion.div>

      {/* ── Tonight's Wind Down Routine ── */}
      <motion.div
        className="mb-6 relative z-10"
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.05 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base">🌙</span>
          <h3 className="text-[13px] font-extrabold text-[#7B7BA0] uppercase tracking-wider">
            Tonight&apos;s Wind-Down
          </h3>
        </div>

        <div
          className="bg-[#1E2140]/90 rounded-[20px] shadow-[0_4px_24px_rgba(0,0,0,0.4)] border border-[#2A2D52] p-4 backdrop-blur-sm relative overflow-hidden"
          style={{
            boxShadow: '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(108,92,231,0.08)',
          }}
        >
          {/* Indigo glow border accent */}
          <div
            className="absolute inset-0 rounded-[20px] pointer-events-none"
            style={{
              boxShadow: 'inset 0 0 0 1px rgba(108,92,231,0.12)',
            }}
          />

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-[#5A5A7A] uppercase tracking-wider">Progress</span>
              <span className="text-[11px] font-bold text-[#6C5CE7]">{checkedSteps.size}/{goodnightRoutine.length}</span>
            </div>
            <div className="h-1.5 bg-[#2A2D52] rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #6C5CE7, #A78BFA)',
                }}
                initial={{ width: '0%' }}
                animate={{ width: `${routineProgress}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Routine items as mini cards */}
          <div className="space-y-2">
            {goodnightRoutine.map((step, i) => {
              const isChecked = checkedSteps.has(step.id);
              return (
                <motion.button
                  key={step.id}
                  className={`flex items-center gap-3 w-full text-left py-3 px-3 rounded-xl cursor-pointer transition-colors ${
                    isChecked
                      ? 'bg-[#6C5CE7]/10'
                      : 'bg-[#252850]/50 hover:bg-[#252850]/80'
                  }`}
                  onClick={() => toggleStep(step.id)}
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <div
                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      isChecked ? 'bg-[#6C5CE7] border-[#6C5CE7]' : 'border-[#3A3D5C]'
                    }`}
                  >
                    {isChecked && <span className="text-white text-sm font-bold">✓</span>}
                  </div>
                  <span className="text-xl flex-shrink-0">{step.emoji}</span>
                  <span
                    className={`font-medium text-sm flex-1 transition-colors ${
                      isChecked ? 'text-[#5A5A7A] line-through' : 'text-[#D4D4E8]'
                    }`}
                  >
                    {step.label}
                  </span>
                  {/* Duration pill */}
                  <span className="text-[10px] font-bold text-[#5A5A7A] bg-[#2A2D52] px-2 py-0.5 rounded-full">
                    {step.id === 'story' ? '5 min' : step.id === 'breathing' ? '3 min' : '1 min'}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* All done state */}
          {allStepsDone && (
            <motion.div
              className="mt-4 pt-4 border-t border-[#2A2D52] text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <p className="text-sm font-bold text-[#A78BFA] mb-3">All done! Sweet dreams!</p>
              <motion.button
                className="bg-gradient-to-r from-[#6C5CE7] to-[#8B7CF7] text-white font-bold text-sm py-2.5 px-6 rounded-full cursor-pointer shadow-[0_4px_16px_rgba(108,92,231,0.3)]"
                onClick={handleCompleteSession}
                whileTap={{ scale: 0.95 }}
              >
                Complete Bedtime
              </motion.button>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* ── Bedtime Story Cards (horizontal scroll) ── */}
      <motion.div
        className="mb-6 relative z-10"
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.08 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base">📖</span>
          <h3 className="text-[13px] font-extrabold text-[#7B7BA0] uppercase tracking-wider">Bedtime Stories</h3>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
          {bedtimeStories.length > 0 ? (
            bedtimeStories.map((story, i) => (
              <motion.button
                key={story.id}
                className="flex-shrink-0 w-[160px] bg-[#1E2140]/90 rounded-[20px] shadow-[0_4px_24px_rgba(0,0,0,0.4)] border border-[#2A2D52] p-4 text-left cursor-pointer backdrop-blur-sm relative overflow-hidden"
                onClick={() => navigate('/stories')}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.08 + i * 0.08 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {/* Soft glow behind emoji */}
                <div
                  className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full pointer-events-none"
                  style={{ background: 'radial-gradient(circle, rgba(108,92,231,0.12) 0%, transparent 70%)' }}
                />
                <div className="text-4xl text-center mb-3 relative">{story.emoji}</div>
                <p className="font-bold text-sm text-[#D4D4E8] mb-1 leading-tight">{story.title}</p>
                <p className="text-[11px] text-[#7B7BA0] mb-3 line-clamp-2">{story.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#5A5A7A] bg-[#2A2D52] px-2 py-0.5 rounded-full">
                    {story.pages.length} pages
                  </span>
                  <span className="text-[11px] font-bold text-[#6C5CE7]">Read</span>
                </div>
              </motion.button>
            ))
          ) : (
            /* Empty state for no bedtime stories */
            <motion.div
              className="w-full bg-[#1E2140]/60 rounded-[20px] border border-[#2A2D52] p-6 text-center backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="text-4xl mb-2 animate-bedtime-float-gentle">🦉</div>
              <p className="text-sm text-[#7B7BA0]">No bedtime stories yet</p>
            </motion.div>
          )}

          {/* "More stories" card */}
          <motion.button
            className="flex-shrink-0 w-[140px] bg-[#252850]/50 rounded-[20px] border border-[#2A2D52]/50 p-4 flex flex-col items-center justify-center cursor-pointer"
            onClick={() => navigate('/stories')}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="text-2xl mb-2 text-[#5A5A7A]">+</span>
            <span className="text-xs font-bold text-[#5A5A7A]">More Stories</span>
          </motion.button>
        </div>
      </motion.div>

      {/* ── Breathing Exercises ── */}
      <motion.div
        className="mb-6 relative z-10"
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base">🫧</span>
          <h3 className="text-[13px] font-extrabold text-[#7B7BA0] uppercase tracking-wider">Breathing Exercises</h3>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {breathingExercises.map((exercise, i) => (
            <motion.button
              key={exercise.id}
              className="bg-[#1E2140]/90 rounded-[20px] shadow-[0_4px_24px_rgba(0,0,0,0.4)] border border-[#2A2D52] p-4 text-left cursor-pointer flex items-center gap-4 backdrop-blur-sm relative overflow-hidden"
              onClick={() => setActiveExercise(exercise)}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 + i * 0.06 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              {/* Subtle glow behind emoji */}
              <div
                className="absolute left-3 w-14 h-14 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(78,205,196,0.1) 0%, transparent 70%)' }}
              />
              <span className="text-4xl flex-shrink-0 relative">{exercise.emoji}</span>
              <div className="flex-1">
                <p className="font-bold text-sm text-[#D4D4E8]">{exercise.name}</p>
                <p className="text-xs text-[#7B7BA0] mt-0.5">
                  {exercise.rounds} rounds &middot; Breathe in {exercise.inhale}s, hold{' '}
                  {exercise.hold}s, out {exercise.exhale}s
                </p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold text-[#5A5A7A] bg-[#2A2D52] px-2 py-0.5 rounded-full">
                  {exercise.inhale + exercise.hold + exercise.exhale + (exercise.hold2 ?? 0)}s/cycle
                </span>
                <div className="w-8 h-8 rounded-full bg-[#6C5CE7]/15 flex items-center justify-center">
                  <span className="text-[#6C5CE7] text-sm">▶</span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* ── Calm Sounds ── */}
      <motion.div
        className="mb-6 relative z-10"
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base">🎵</span>
          <h3 className="text-[13px] font-extrabold text-[#7B7BA0] uppercase tracking-wider">Calm Sounds</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {calmSounds.map((sound) => {
            const isActive = playingSound === sound.id;
            return (
              <motion.button
                key={sound.id}
                className={`flex flex-col items-center gap-2 p-4 rounded-[20px] cursor-pointer transition-all relative overflow-hidden backdrop-blur-sm ${
                  isActive
                    ? 'bg-[#6C5CE7]/15 ring-2 ring-[#6C5CE7] shadow-[0_4px_20px_rgba(108,92,231,0.25)]'
                    : 'bg-[#1E2140]/90 border border-[#2A2D52] shadow-[0_4px_24px_rgba(0,0,0,0.4)]'
                }`}
                onClick={() => handleSound(sound)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Sound wave decoration at top */}
                <SoundWaveDecoration isActive={isActive} />

                {/* Pulsing border glow for active */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-[20px] pointer-events-none"
                    style={{ boxShadow: '0 0 20px rgba(108,92,231,0.2)' }}
                    animate={{
                      boxShadow: [
                        '0 0 12px rgba(108,92,231,0.15)',
                        '0 0 24px rgba(108,92,231,0.25)',
                        '0 0 12px rgba(108,92,231,0.15)',
                      ],
                    }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                  />
                )}

                <motion.span
                  className="text-3xl relative"
                  animate={isActive ? { scale: [1, 1.15, 1] } : {}}
                  transition={isActive ? { repeat: Infinity, duration: 1.5 } : {}}
                  style={isActive ? { filter: 'drop-shadow(0 2px 8px rgba(108,92,231,0.3))' } : {}}
                >
                  {sound.emoji}
                </motion.span>
                <span className={`text-xs font-bold ${isActive ? 'text-[#C4B5FD]' : 'text-[#9B9BC0]'}`}>
                  {sound.name}
                </span>
                {isActive ? (
                  <motion.div
                    className="flex gap-0.5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {[0, 1, 2, 3, 4].map((bar) => (
                      <motion.div
                        key={bar}
                        className="w-1 bg-[#6C5CE7] rounded-full"
                        animate={{ height: [3, 14, 3] }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.7,
                          delay: bar * 0.1,
                        }}
                      />
                    ))}
                  </motion.div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#6C5CE7]/10 flex items-center justify-center">
                    <span className="text-[#6C5CE7] text-xs">▶</span>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* ── Bedtime Stories Link (legacy, kept for navigation) ── */}
      <motion.div
        className="relative z-10 mb-6"
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <motion.button
          className="w-full bg-[#1E2140]/90 rounded-[20px] shadow-[0_4px_24px_rgba(0,0,0,0.4)] border border-[#2A2D52] p-4 flex items-center gap-4 cursor-pointer backdrop-blur-sm relative overflow-hidden"
          onClick={() => navigate('/stories')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          {/* Soft glow accent */}
          <div
            className="absolute -left-4 top-1/2 -translate-y-1/2 w-24 h-24 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(108,92,231,0.08) 0%, transparent 70%)' }}
          />
          <span className="text-4xl relative">📖</span>
          <div className="flex-1 text-left">
            <p className="font-bold text-[#D4D4E8]">All Bedtime Stories</p>
            <p className="text-xs text-[#7B7BA0]">Browse the full collection of cozy stories</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#6C5CE7]/15 flex items-center justify-center">
            <span className="text-[#6C5CE7] text-sm">▶</span>
          </div>
        </motion.button>
      </motion.div>

      {/* Floating sound player bar when a sound is playing */}
      <AnimatePresence>
        {playingSound && (
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 12px)' }}
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Dark glass morphism bar */}
            <div
              className="bg-[#1E2140]/95 backdrop-blur-xl rounded-t-[20px] shadow-[0_-4px_24px_rgba(0,0,0,0.5)] border-t border-[#2A2D52]"
            >
              <div className="flex items-center gap-3 px-4 py-3">
                <motion.span
                  className="text-2xl flex-shrink-0"
                  animate={{ scale: [1, 1.12, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  style={{ filter: 'drop-shadow(0 2px 6px rgba(108,92,231,0.25))' }}
                >
                  {calmSounds.find((s) => s.id === playingSound)?.emoji ?? '🎵'}
                </motion.span>
                <div className="flex-1 min-w-0">
                  <span className="font-bold text-sm text-[#D4D4E8] truncate block">
                    {calmSounds.find((s) => s.id === playingSound)?.name ?? 'Sound'}
                  </span>
                  <span className="text-[10px] text-[#6C5CE7] font-bold">Now playing</span>
                </div>
                {/* Equalizer bars in the player */}
                <div className="flex gap-0.5 items-end h-5 mr-2">
                  {[0, 1, 2, 3].map((bar) => (
                    <motion.div
                      key={bar}
                      className="w-0.5 bg-[#6C5CE7] rounded-full"
                      animate={{ height: [4, 16, 4] }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.6,
                        delay: bar * 0.12,
                      }}
                    />
                  ))}
                </div>
                <motion.button
                  className="w-10 h-10 rounded-full bg-[#6C5CE7]/20 flex items-center justify-center text-lg cursor-pointer flex-shrink-0 border border-[#6C5CE7]/20"
                  onClick={() => {
                    soundRef.current?.stop();
                    soundRef.current = null;
                    setPlayingSound(null);
                  }}
                  whileTap={{ scale: 0.9 }}
                >
                  ⏹️
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
