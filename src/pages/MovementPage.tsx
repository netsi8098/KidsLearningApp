import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAudio } from '../hooks/useAudio';
import { useMovement } from '../hooks/useMovement';
import NavButton from '../components/NavButton';
import CategoryFilterBar from '../components/CategoryFilterBar';
import EnergyFilter from '../components/EnergyFilter';
import TimerDisplay from '../components/TimerDisplay';
import CompletionSummary from '../components/CompletionSummary';
import StarCounter from '../components/StarCounter';
import FavoriteButton from '../components/FavoriteButton';
import {
  movementCategories,
  movementActivities,
  type MovementActivity,
} from '../data/movementData';

const energyColors: Record<string, string> = {
  calm: 'bg-teal/20 text-teal',
  medium: 'bg-amber-100 text-amber-600',
  high: 'bg-coral/20 text-coral',
};

const energyLabels: Record<string, string> = {
  calm: '🧘 Calm',
  medium: '⚡ Medium',
  high: '🔥 High',
};

/* Energy dot colors for the premium indicator */
const energyDotColors: Record<string, string> = {
  calm: 'bg-[#4ECDC4]',
  medium: 'bg-[#FFE66D]',
  high: 'bg-[#FF6B6B]',
};

export default function MovementPage() {
  const navigate = useNavigate();
  const { currentPlayer } = useApp();
  const { playClick, playCelebration, speak } = useAudio();
  const {
    markCompleted,
    toggleFavorite,
    isFavorite,
    isCompleted,
  } = useMovement(currentPlayer?.id);

  const [activeCategory, setActiveCategory] = useState('all');
  const [energyFilter, setEnergyFilter] = useState('all');
  const [activeActivity, setActiveActivity] = useState<MovementActivity | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);

  if (!currentPlayer) return <Navigate to="/" replace />;

  // Filter activities
  const filtered = movementActivities.filter((a) => {
    if (activeCategory !== 'all' && a.category !== activeCategory) return false;
    if (energyFilter !== 'all' && a.energyLevel !== energyFilter) return false;
    return true;
  });

  // ── Handlers ────────────────────────────────────────────────

  function handleActivityTap(activity: MovementActivity) {
    playClick();
    setActiveActivity(activity);
    setCurrentStep(0);
    setTimerRunning(true);
    setShowCompletion(false);
    speak(activity.title);
  }

  function handleNextStep() {
    if (!activeActivity) return;
    playClick();

    if (currentStep < activeActivity.instructions.length - 1) {
      setCurrentStep((s) => s + 1);
      speak(activeActivity.instructions[currentStep + 1]);
    } else {
      handleComplete();
    }
  }

  function handlePrevStep() {
    if (currentStep > 0) {
      playClick();
      setCurrentStep((s) => s - 1);
    }
  }

  async function handleComplete() {
    if (!activeActivity) return;
    setTimerRunning(false);
    playCelebration();
    await markCompleted(activeActivity.id);
    setShowCompletion(true);
  }

  function handleTimerComplete() {
    handleComplete();
  }

  function handleBackToList() {
    playClick();
    setActiveActivity(null);
    setCurrentStep(0);
    setTimerRunning(false);
    setShowCompletion(false);
  }

  // ── RENDER: Completion ──────────────────────────────────────

  if (showCompletion && activeActivity) {
    return (
      <div className="min-h-dvh bg-[#FFF8F0] px-4 pt-4 pb-8 flex flex-col items-center justify-center">
        <CompletionSummary
          emoji={activeActivity.emoji}
          title="Great Moves!"
          message={`You completed "${activeActivity.title}"! Keep moving and having fun!`}
          starsEarned={1}
          onContinue={handleBackToList}
          continueLabel="More Activities"
        />
      </div>
    );
  }

  // ── RENDER: Active Session ──────────────────────────────────

  if (activeActivity) {
    const instruction = activeActivity.instructions[currentStep];
    const isLastStep = currentStep === activeActivity.instructions.length - 1;
    const progressPct = ((currentStep + 1) / activeActivity.instructions.length) * 100;

    return (
      <div className="min-h-dvh bg-[#FFF8F0] px-4 pt-4 pb-8 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <NavButton onClick={handleBackToList} direction="back" />
          <h2 className="text-lg font-extrabold text-[#FF6B6B] truncate mx-2">
            {activeActivity.emoji} {activeActivity.title}
          </h2>
          <StarCounter />
        </div>

        {/* Premium progress bar */}
        <div className="w-full bg-[#F0EAE0] rounded-full h-3 mb-1 overflow-hidden">
          <motion.div
            className="h-3 rounded-full"
            style={{ background: 'linear-gradient(90deg, #FF6B6B, #FF8C42)' }}
            animate={{
              width: `${progressPct}%`,
            }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <p className="text-xs text-[#9B9BAB] text-right mb-4 font-semibold tracking-wide">
          Step {currentStep + 1} of {activeActivity.instructions.length}
        </p>

        {/* Timer */}
        <div className="flex justify-center mb-6">
          <TimerDisplay
            totalSeconds={activeActivity.durationMinutes * 60}
            isRunning={timerRunning}
            onComplete={handleTimerComplete}
          />
        </div>

        {/* Premium Instruction Card */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              className="bg-white rounded-[20px] shadow-[0_4px_24px_rgba(255,107,107,0.10)] border border-[#FFF0F0] p-8 text-center w-full"
              initial={{ x: 60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -60, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Step number circle */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6B6B] to-[#FF8C42] text-white font-extrabold text-sm flex items-center justify-center mx-auto mb-4 shadow-[0_2px_8px_rgba(255,107,107,0.3)]">
                {currentStep + 1}
              </div>
              <motion.span
                className="text-7xl block mb-6"
                animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {activeActivity.emoji}
              </motion.span>
              <p className="text-2xl font-bold text-[#2D2D3A] mb-4 leading-relaxed">
                {instruction}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-center gap-4 mt-4">
          <NavButton
            onClick={handlePrevStep}
            direction="prev"
            disabled={currentStep === 0}
          />
          {isLastStep ? (
            <motion.button
              className="bg-gradient-to-r from-[#FF6B6B] to-[#FF8C42] text-white rounded-[14px] px-8 py-4 text-xl font-bold shadow-[0_4px_20px_rgba(255,107,107,0.25)] cursor-pointer"
              onClick={handleComplete}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Done!
            </motion.button>
          ) : (
            <motion.button
              className="bg-gradient-to-r from-[#FF6B6B] to-[#FF8C42] text-white rounded-[14px] px-8 py-4 text-xl font-bold shadow-[0_4px_20px_rgba(255,107,107,0.25)] cursor-pointer"
              onClick={handleNextStep}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Next Move
            </motion.button>
          )}
          <NavButton
            onClick={handleNextStep}
            direction="next"
            disabled={isLastStep}
          />
        </div>
      </div>
    );
  }

  // ── RENDER: Activity List ───────────────────────────────────

  return (
    <div className="min-h-dvh bg-[#FFF8F0] px-4 pt-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <NavButton onClick={() => navigate('/menu')} direction="back" />
        <StarCounter />
      </div>

      {/* Premium Hero Banner */}
      <motion.div
        className="relative rounded-[20px] overflow-hidden mb-6 px-5 py-6"
        style={{ background: 'linear-gradient(135deg, #FFF0F0 0%, #FFFFFF 60%, #FFF3EB 100%)' }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Floating decorative emoji */}
        <motion.span
          className="absolute top-3 right-4 text-2xl opacity-40 pointer-events-none"
          animate={{ y: [0, -6, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          💃
        </motion.span>
        <motion.span
          className="absolute bottom-3 right-12 text-xl opacity-30 pointer-events-none"
          animate={{ y: [0, -4, 0], rotate: [0, -8, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
        >
          🎵
        </motion.span>
        <motion.span
          className="absolute top-5 right-20 text-lg opacity-25 pointer-events-none"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2.8, repeat: Infinity, delay: 1 }}
        >
          🕺
        </motion.span>

        <h2
          className="text-2xl font-extrabold tracking-tight mb-1"
          style={{
            background: 'linear-gradient(135deg, #FF6B6B, #FF8C42)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Move & Dance
        </h2>
        <p className="text-sm text-[#6B6B7B] font-medium">Get your body grooving!</p>
      </motion.div>

      {/* Section Header */}
      <p className="text-[11px] font-bold text-[#9B9BAB] uppercase tracking-[0.08em] mb-2 px-1">
        💃 Activity Type
      </p>

      {/* Category filter */}
      <div className="mb-3">
        <CategoryFilterBar
          categories={movementCategories}
          activeCategory={activeCategory}
          onCategoryChange={(key) => {
            playClick();
            setActiveCategory(key);
          }}
        />
      </div>

      {/* Section Header */}
      <p className="text-[11px] font-bold text-[#9B9BAB] uppercase tracking-[0.08em] mb-2 px-1">
        ⚡ Energy Level
      </p>

      {/* Energy filter */}
      <div className="mb-6">
        <EnergyFilter
          selected={energyFilter}
          onChange={(level) => {
            playClick();
            setEnergyFilter(level);
          }}
        />
      </div>

      {/* Section Header */}
      <p className="text-[11px] font-bold text-[#9B9BAB] uppercase tracking-[0.08em] mb-3 px-1">
        🏃 Activities ({filtered.length})
      </p>

      {/* Activity grid */}
      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
        {filtered.map((activity, i) => {
          const completed = isCompleted(activity.id);
          const fav = isFavorite(activity.id);

          return (
            <motion.button
              key={activity.id}
              className="bg-white rounded-[20px] shadow-[0_2px_12px_rgba(45,45,58,0.06)] border border-[#F0EAE0] p-4 text-left cursor-pointer relative overflow-hidden"
              onClick={() => handleActivityTap(activity)}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {/* Subtle coral tint at top */}
              <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#FFF0F0] to-transparent rounded-t-[20px] pointer-events-none" />

              {/* Favorite button */}
              <div className="absolute top-2 right-2 z-10">
                <FavoriteButton
                  isFavorite={fav}
                  onToggle={() => toggleFavorite(activity.id)}
                  size="sm"
                />
              </div>

              {/* Large Emoji with bounce */}
              <motion.span
                className="text-5xl block mb-2 relative z-[1]"
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
              >
                {activity.emoji}
              </motion.span>

              {/* Title */}
              <h3 className="font-bold text-[#2D2D3A] text-sm mb-2 pr-6 relative z-[1]">
                {activity.title}
                {completed && <span className="ml-1">✅</span>}
              </h3>

              {/* Badges */}
              <div className="flex flex-wrap gap-1.5 relative z-[1]">
                {/* Duration badge - prominent */}
                <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF0F0] border border-[#FFD4D4] px-2.5 py-0.5 text-xs text-[#FF6B6B] font-bold">
                  <span className="text-[10px]">🕐</span> {activity.durationMinutes}min
                </span>

                {/* Energy level indicator with colored dot */}
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    energyColors[activity.energyLevel] ?? 'bg-[#FFF8F0] text-[#6B6B7B]'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${energyDotColors[activity.energyLevel] ?? 'bg-[#9B9BAB]'}`} />
                  {energyLabels[activity.energyLevel]}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <motion.div
          className="text-center py-16 text-[#9B9BAB]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-5xl mb-3">🔍</p>
          <p className="font-bold text-[#6B6B7B]">No activities found</p>
          <p className="text-sm">Try a different category or energy level!</p>
        </motion.div>
      )}
    </div>
  );
}
