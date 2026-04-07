import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Routine } from '../db/database';
import { useApp } from '../context/AppContext';
import RoutineTimeline from '../components/RoutineTimeline';

// Confetti particle component
function ConfettiParticle({ index }: { index: number }) {
  const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A78BFA', '#6BCB77', '#FF8C42'];
  const color = colors[index % colors.length];
  const left = Math.random() * 100;
  const delay = Math.random() * 0.5;
  const duration = 1.5 + Math.random();

  return (
    <motion.div
      className="absolute w-3 h-3 rounded-sm"
      style={{ backgroundColor: color, left: `${left}%`, top: -10 }}
      initial={{ y: -20, opacity: 1, rotate: 0 }}
      animate={{
        y: window.innerHeight + 20,
        opacity: [1, 1, 0],
        rotate: 360 + Math.random() * 720,
        x: (Math.random() - 0.5) * 200,
      }}
      transition={{ duration, delay, ease: 'easeIn' }}
    />
  );
}

export default function RoutinePlayerPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { currentPlayer } = useApp();

  const routine = useLiveQuery(
    () => (id ? db.routines.get(Number(id)) : undefined),
    [id]
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const totalItems = routine?.items.length ?? 0;
  const currentItem = routine?.items[currentIndex];
  const totalDuration = routine?.items.reduce((s, i) => s + i.durationMinutes, 0) ?? 0;
  const completedDuration = routine?.items.slice(0, currentIndex).reduce((s, i) => s + i.durationMinutes, 0) ?? 0;
  const overallProgress = totalDuration > 0 ? ((completedDuration + (currentItem ? currentItem.durationMinutes - timeLeft / 60 : 0)) / totalDuration) * 100 : 0;

  // Initialize timer when current item changes
  useEffect(() => {
    if (currentItem && !isComplete) {
      setTimeLeft(currentItem.durationMinutes * 60);
      setIsRunning(true);
    }
  }, [currentIndex, currentItem, isComplete]);

  // Countdown timer
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Auto-advance when timer hits 0
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, timeLeft]);

  const handleNext = useCallback(() => {
    if (currentIndex < totalItems - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Complete!
      setIsRunning(false);
      setIsComplete(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }
  }, [currentIndex, totalItems]);

  function handleSkip() {
    handleNext();
  }

  function handleDone() {
    handleNext();
  }

  function handleStepClick(index: number) {
    if (index <= currentIndex) return; // Can't go back
    setCurrentIndex(index);
  }

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  if (!currentPlayer) return <Navigate to="/" replace />;

  if (!routine) {
    return (
      <div className="min-h-dvh bg-[#FFF8F0] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📋</div>
          <p className="text-[#9B9BAB] font-bold">Loading routine...</p>
        </div>
      </div>
    );
  }

  // Completion screen
  if (isComplete) {
    return (
      <div className="min-h-dvh bg-[#FFF8F0] px-4 pt-4 pb-8 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Confetti */}
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50">
            {Array.from({ length: 40 }).map((_, i) => (
              <ConfettiParticle key={i} index={i} />
            ))}
          </div>
        )}

        <motion.div
          className="text-center z-10"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.3 }}
        >
          <motion.div
            className="text-8xl mb-4"
            animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            🎉
          </motion.div>
          <h2 className="text-3xl font-bold text-[#2D2D3A] mb-2">Routine Complete!</h2>
          <p className="text-[#6B6B7B] mb-2">{routine.name}</p>
          <p className="text-sm text-[#9B9BAB] mb-8">
            {totalItems} activities | {totalDuration} minutes
          </p>

          <div className="flex gap-2 flex-wrap justify-center mb-8">
            {routine.items.map((item, i) => (
              <motion.span
                key={i}
                className="bg-white rounded-xl px-3 py-1.5 shadow-[0_2px_12px_rgba(45,45,58,0.06)] border border-[#F0EAE0] flex items-center gap-1"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 + i * 0.1 }}
              >
                <span>{item.emoji}</span>
                <span className="text-xs font-bold text-leaf">Done!</span>
              </motion.span>
            ))}
          </div>

          <motion.button
            className="bg-gradient-to-r from-coral to-[#FF8E8E] text-white font-bold py-3 px-8 rounded-full shadow-[0_4px_16px_rgba(255,107,107,0.3)] cursor-pointer"
            onClick={() => navigate('/routines')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1 }}
          >
            Back to Routines
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#FFF8F0] px-4 pt-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <motion.button
          className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-[0_2px_12px_rgba(45,45,58,0.06)] flex items-center justify-center text-lg cursor-pointer"
          onClick={() => navigate('/routines')}
          whileTap={{ scale: 0.9 }}
        >
          ◀️
        </motion.button>
        <div className="text-center">
          <h2 className="text-sm font-bold text-[#2D2D3A]">{routine.name}</h2>
          <p className="text-xs text-[#9B9BAB]">
            Step {currentIndex + 1} of {totalItems}
          </p>
        </div>
        <div className="w-10" />
      </div>

      {/* Overall progress bar */}
      <motion.div className="mb-6">
        <div className="w-full bg-[#F0EAE0]/60 rounded-full h-2.5">
          <motion.div
            className="h-2.5 bg-gradient-to-r from-teal to-leaf rounded-full"
            animate={{ width: `${Math.min(100, overallProgress)}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] text-[#9B9BAB]">{completedDuration} min done</span>
          <span className="text-[10px] text-[#9B9BAB]">{totalDuration} min total</span>
        </div>
      </motion.div>

      <div className="max-w-md mx-auto">
        {/* Current activity card */}
        <AnimatePresence mode="wait">
          {currentItem && (
            <motion.div
              key={currentIndex}
              className="bg-white rounded-[20px] shadow-[0_4px_20px_rgba(45,45,58,0.08)] border border-[#F0EAE0] p-6 text-center mb-6"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ type: 'spring', damping: 20 }}
            >
              <motion.span
                className="text-6xl block mb-3"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                {currentItem.emoji}
              </motion.span>
              <h3 className="text-xl font-bold text-[#2D2D3A] mb-1">{currentItem.title}</h3>
              <p className="text-sm text-[#9B9BAB] mb-4">{currentItem.durationMinutes} minutes</p>

              {/* Timer */}
              <div className="mb-4">
                <motion.p
                  className={`text-4xl font-bold ${
                    timeLeft < 30 ? 'text-coral' : timeLeft < 60 ? 'text-tangerine' : 'text-teal'
                  }`}
                  animate={timeLeft < 10 ? { scale: [1, 1.05, 1] } : {}}
                  transition={timeLeft < 10 ? { repeat: Infinity, duration: 1 } : {}}
                >
                  {formatTime(timeLeft)}
                </motion.p>
                <p className="text-xs text-[#9B9BAB]">remaining</p>
              </div>

              {/* Timer progress */}
              <div className="w-full bg-[#F0EAE0]/40 rounded-full h-2 mb-5">
                <motion.div
                  className="h-2 bg-teal rounded-full"
                  style={{
                    width: `${currentItem.durationMinutes * 60 > 0
                      ? ((currentItem.durationMinutes * 60 - timeLeft) / (currentItem.durationMinutes * 60)) * 100
                      : 0}%`,
                  }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <motion.button
                  className="flex-1 bg-[#F0EAE0]/40 text-[#6B6B7B] font-bold py-3 rounded-[14px] text-sm cursor-pointer"
                  onClick={handleSkip}
                  whileTap={{ scale: 0.95 }}
                >
                  Skip →
                </motion.button>
                <motion.button
                  className="flex-1 bg-leaf text-white font-bold py-3 rounded-[14px] text-sm cursor-pointer shadow-[0_2px_8px_rgba(107,203,119,0.3)]"
                  onClick={handleDone}
                  whileTap={{ scale: 0.95 }}
                >
                  Done ✓
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Timeline */}
        <motion.div
          className="bg-white rounded-[20px] shadow-[0_2px_12px_rgba(45,45,58,0.06)] border border-[#F0EAE0] p-5"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="font-bold text-[#9B9BAB] mb-3 text-xs tracking-wider uppercase">Timeline</h3>
          <RoutineTimeline
            items={routine.items}
            currentIndex={currentIndex}
            onStepClick={handleStepClick}
          />
        </motion.div>
      </div>
    </div>
  );
}
