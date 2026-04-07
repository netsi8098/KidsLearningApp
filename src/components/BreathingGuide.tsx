import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BreathingGuideProps {
  exercise: {
    inhale: number;
    hold: number;
    exhale: number;
    hold2?: number;
    rounds: number;
  };
  onComplete: () => void;
}

type Phase = 'inhale' | 'hold' | 'exhale' | 'hold2' | 'ready';

const phaseLabels: Record<Phase, string> = {
  ready: 'Get Ready...',
  inhale: 'Breathe In',
  hold: 'Hold',
  exhale: 'Breathe Out',
  hold2: 'Hold',
};

const phaseColors: Record<Phase, string> = {
  ready: '#A78BFA',
  inhale: '#4ECDC4',
  hold: '#FFD93D',
  exhale: '#FF8C42',
  hold2: '#FFD93D',
};

export default function BreathingGuide({ exercise, onComplete }: BreathingGuideProps) {
  const [phase, setPhase] = useState<Phase>('ready');
  const [round, setRound] = useState(1);
  const [countdown, setCountdown] = useState(3);
  const [isActive, setIsActive] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Get the duration for the current phase in seconds
  const getPhaseDuration = useCallback(
    (p: Phase): number => {
      switch (p) {
        case 'ready':
          return 3;
        case 'inhale':
          return exercise.inhale;
        case 'hold':
          return exercise.hold;
        case 'exhale':
          return exercise.exhale;
        case 'hold2':
          return exercise.hold2 ?? 0;
        default:
          return 0;
      }
    },
    [exercise]
  );

  // Get the next phase
  const getNextPhase = useCallback(
    (current: Phase, currentRound: number): { phase: Phase; round: number } | null => {
      switch (current) {
        case 'ready':
          return { phase: 'inhale', round: currentRound };
        case 'inhale':
          return { phase: 'hold', round: currentRound };
        case 'hold':
          return { phase: 'exhale', round: currentRound };
        case 'exhale':
          if (exercise.hold2) {
            return { phase: 'hold2', round: currentRound };
          }
          // End of cycle
          if (currentRound >= exercise.rounds) return null;
          return { phase: 'inhale', round: currentRound + 1 };
        case 'hold2':
          if (currentRound >= exercise.rounds) return null;
          return { phase: 'inhale', round: currentRound + 1 };
        default:
          return null;
      }
    },
    [exercise]
  );

  // Run the breathing cycle
  useEffect(() => {
    if (!isActive) return;

    const duration = getPhaseDuration(phase);
    setCountdown(duration);

    // Countdown ticker
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    // Phase transition
    timerRef.current = setTimeout(() => {
      clearInterval(countdownInterval);
      const next = getNextPhase(phase, round);
      if (!next) {
        setIsActive(false);
        onComplete();
      } else {
        setPhase(next.phase);
        setRound(next.round);
      }
    }, duration * 1000);

    return () => {
      clearInterval(countdownInterval);
      clearTimer();
    };
  }, [phase, round, isActive, getPhaseDuration, getNextPhase, onComplete, clearTimer]);

  // Scale value for the circle
  const getScale = (): number => {
    switch (phase) {
      case 'inhale':
        return 1.6;
      case 'hold':
      case 'hold2':
        return phase === 'hold' && phase === 'hold' ? 1.6 : 1.0;
      case 'exhale':
        return 1.0;
      default:
        return 1.0;
    }
  };

  // For hold after inhale, keep expanded
  const circleScale = phase === 'inhale' || phase === 'hold' ? 1.6 : 1.0;

  return (
    <div className="flex flex-col items-center justify-center py-8">
      {/* Round counter */}
      <p className="text-sm font-bold text-gray-400 mb-6">
        Round {round} of {exercise.rounds}
      </p>

      {/* Breathing circle */}
      <div className="relative w-48 h-48 flex items-center justify-center mb-8">
        {/* Background ring */}
        <div className="absolute inset-0 rounded-full border-4 border-gray-200" />

        {/* Animated circle */}
        <motion.div
          className="w-36 h-36 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${phaseColors[phase]}30` }}
          animate={{
            scale: circleScale,
            backgroundColor: `${phaseColors[phase]}30`,
          }}
          transition={{
            scale: {
              duration: getPhaseDuration(phase),
              ease: phase === 'inhale' ? 'easeIn' : phase === 'exhale' ? 'easeOut' : 'linear',
            },
            backgroundColor: { duration: 0.5 },
          }}
        >
          <motion.div
            className="w-24 h-24 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${phaseColors[phase]}60` }}
            animate={{
              scale: circleScale,
              backgroundColor: `${phaseColors[phase]}60`,
            }}
            transition={{
              scale: {
                duration: getPhaseDuration(phase),
                ease:
                  phase === 'inhale' ? 'easeIn' : phase === 'exhale' ? 'easeOut' : 'linear',
              },
              backgroundColor: { duration: 0.5 },
            }}
          >
            <span className="text-2xl font-bold" style={{ color: phaseColors[phase] }}>
              {countdown}
            </span>
          </motion.div>
        </motion.div>

        {/* SVG ring progress */}
        <svg
          className="absolute inset-0 w-full h-full -rotate-90"
          viewBox="0 0 192 192"
        >
          <motion.circle
            cx="96"
            cy="96"
            r="92"
            fill="none"
            stroke={phaseColors[phase]}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={578}
            initial={{ strokeDashoffset: 578 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{
              duration: getPhaseDuration(phase),
              ease: 'linear',
            }}
            key={`${phase}-${round}`}
          />
        </svg>
      </div>

      {/* Phase label */}
      <AnimatePresence mode="wait">
        <motion.p
          key={phase}
          className="text-2xl font-bold"
          style={{ color: phaseColors[phase] }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {phaseLabels[phase]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
