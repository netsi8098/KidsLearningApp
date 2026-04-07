import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAudio } from '../hooks/useAudio';
import { useHomeActivities } from '../hooks/useHomeActivities';
import NavButton from '../components/NavButton';
import CategoryFilterBar from '../components/CategoryFilterBar';
import CompletionSummary from '../components/CompletionSummary';
import StarCounter from '../components/StarCounter';
import FavoriteButton from '../components/FavoriteButton';
import {
  homeActivityCategories,
  homeActivities,
  type HomeActivity,
} from '../data/homeActivitiesData';

export default function HomeActivitiesPage() {
  const navigate = useNavigate();
  const { currentPlayer } = useApp();
  const { playClick, playCelebration, speak } = useAudio();
  const {
    markCompleted,
    toggleFavorite,
    isCompleted,
    isFavorite,
    getRandomActivity,
  } = useHomeActivities(currentPlayer?.id);

  const [activeCategory, setActiveCategory] = useState('all');
  const [activeActivity, setActiveActivity] = useState<HomeActivity | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);

  if (!currentPlayer) return <Navigate to="/" replace />;

  // Filter activities
  const filtered = homeActivities.filter((a) => {
    if (activeCategory !== 'all' && a.category !== activeCategory) return false;
    return true;
  });

  // ── Handlers ────────────────────────────────────────────────

  function handleActivityTap(activity: HomeActivity) {
    playClick();
    setActiveActivity(activity);
    setCurrentStep(0);
    setShowCompletion(false);
    speak(activity.title);
  }

  function handleDoNow() {
    playClick();
    const activity = getRandomActivity();
    if (activity) {
      handleActivityTap(activity);
    }
  }

  function handleNextStep() {
    if (!activeActivity) return;
    playClick();

    if (currentStep < activeActivity.steps.length - 1) {
      setCurrentStep((s) => s + 1);
      speak(activeActivity.steps[currentStep + 1]);
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
    playCelebration();
    await markCompleted(activeActivity.id);
    setShowCompletion(true);
  }

  function handleBackToList() {
    playClick();
    setActiveActivity(null);
    setCurrentStep(0);
    setShowCompletion(false);
  }

  // ── RENDER: Completion ──────────────────────────────────────

  if (showCompletion && activeActivity) {
    return (
      <div className="min-h-dvh bg-[#FFF8F0] px-4 pt-4 pb-8 flex flex-col items-center justify-center">
        <CompletionSummary
          emoji={activeActivity.emoji}
          title="Activity Complete!"
          message={`You finished "${activeActivity.title}"! ${activeActivity.learningOutcome}`}
          starsEarned={1}
          onContinue={handleBackToList}
          continueLabel="More Activities"
        />
      </div>
    );
  }

  // ── RENDER: Activity Detail ─────────────────────────────────

  if (activeActivity) {
    const step = activeActivity.steps[currentStep];
    const isLastStep = currentStep === activeActivity.steps.length - 1;

    return (
      <div className="min-h-dvh bg-[#FFF8F0] px-4 pt-4 pb-8 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <NavButton onClick={handleBackToList} direction="back" />
          <h2 className="text-lg font-extrabold text-[#4ECDC4] truncate mx-2">
            {activeActivity.emoji} {activeActivity.title}
          </h2>
          <StarCounter />
        </div>

        {/* Materials list */}
        <motion.div
          className="bg-white rounded-[20px] shadow-[0_2px_12px_rgba(45,45,58,0.06)] border border-[#F0EAE0] p-4 mb-4"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <h3 className="font-bold text-[#2D2D3A] text-sm mb-2">
            📦 Materials Needed ({activeActivity.materials.length})
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {activeActivity.materials.map((material) => (
              <span
                key={material}
                className="bg-[#EDFAF8] rounded-full px-3 py-1 text-xs text-[#4ECDC4] font-bold"
              >
                {material}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Progress bar */}
        <div className="w-full bg-[#F0EAE0] rounded-full h-3 mb-1">
          <motion.div
            className="bg-gradient-to-r from-[#4ECDC4] to-[#6DD5CB] h-3 rounded-full"
            animate={{
              width: `${((currentStep + 1) / activeActivity.steps.length) * 100}%`,
            }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <p className="text-xs text-[#9B9BAB] text-right mb-4">
          Step {currentStep + 1} of {activeActivity.steps.length}
        </p>

        {/* Step content */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              className="text-center"
              initial={{ x: 60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -60, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.span
                className="text-7xl block mb-6"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {activeActivity.emoji}
              </motion.span>
              <p className="text-xl font-bold text-[#2D2D3A] mb-6 leading-relaxed">
                {step}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Parent tip callout */}
        <motion.div
          className="bg-[#F3EFFE] border border-[#E8DFFD] rounded-[16px] p-3.5 mb-4"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-xs font-bold text-[#A78BFA] mb-1">💡 Parent Tip</p>
          <p className="text-xs text-[#6B6B7B]">{activeActivity.parentTip}</p>
        </motion.div>

        {/* Learning outcome */}
        <motion.div
          className="bg-[#EDFAF8] border border-[#D5F2EE] rounded-[16px] p-3.5 mb-4"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-xs font-bold text-[#4ECDC4] mb-1">🎯 Learning Outcome</p>
          <p className="text-xs text-[#6B6B7B]">{activeActivity.learningOutcome}</p>
        </motion.div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-4">
          <NavButton
            onClick={handlePrevStep}
            direction="prev"
            disabled={currentStep === 0}
          />

          {isLastStep ? (
            <motion.button
              className="bg-gradient-to-r from-[#4ECDC4] to-[#6DD5CB] text-white rounded-[14px] px-8 py-4 text-xl font-bold shadow-[0_4px_20px_rgba(78,205,196,0.25)] cursor-pointer"
              onClick={handleComplete}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Complete!
            </motion.button>
          ) : (
            <motion.button
              className="bg-gradient-to-r from-[#4ECDC4] to-[#6DD5CB] text-white rounded-[14px] px-8 py-4 text-xl font-bold shadow-[0_4px_20px_rgba(78,205,196,0.25)] cursor-pointer"
              onClick={handleNextStep}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Next Step
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
      <div className="flex items-center justify-between mb-5">
        <NavButton onClick={() => navigate('/menu')} direction="back" />
        <h2 className="text-xl font-extrabold text-[#4ECDC4]">Home Activities 🏠</h2>
        <StarCounter />
      </div>

      {/* Category filter */}
      <div className="mb-3">
        <CategoryFilterBar
          categories={homeActivityCategories}
          activeCategory={activeCategory}
          onCategoryChange={(key) => {
            playClick();
            setActiveCategory(key);
          }}
        />
      </div>

      {/* Do Now button */}
      <motion.button
        className="w-full max-w-md mx-auto mb-5 bg-gradient-to-r from-[#4ECDC4] to-[#3DB8B0] rounded-[20px] p-5 shadow-[0_4px_20px_rgba(78,205,196,0.25)] text-white text-left flex items-center gap-3 cursor-pointer"
        onClick={handleDoNow}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <motion.span
          className="text-4xl"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          🎲
        </motion.span>
        <div className="flex-1">
          <p className="text-xs font-medium opacity-80">Feeling adventurous?</p>
          <p className="font-bold text-lg">Do Now! Pick a random activity</p>
        </div>
        <span className="text-2xl">▶️</span>
      </motion.button>

      {/* Activity grid */}
      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
        {filtered.map((activity, i) => {
          const completed = isCompleted(activity.id);
          const fav = isFavorite(activity.id);

          return (
            <motion.button
              key={activity.id}
              className="bg-white rounded-[20px] shadow-[0_2px_12px_rgba(45,45,58,0.06)] border border-[#F0EAE0] p-4 text-left cursor-pointer relative"
              onClick={() => handleActivityTap(activity)}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {/* Favorite button */}
              <div className="absolute top-2 right-2">
                <FavoriteButton
                  isFavorite={fav}
                  onToggle={() => toggleFavorite(activity.id)}
                  size="sm"
                />
              </div>

              {/* Emoji */}
              <span className="text-4xl block mb-2">{activity.emoji}</span>

              {/* Title */}
              <h3 className="font-bold text-[#2D2D3A] text-sm mb-2 pr-6">
                {activity.title}
                {completed && <span className="ml-1">✅</span>}
              </h3>

              {/* Badges */}
              <div className="flex flex-wrap gap-1.5">
                <span className="inline-block rounded-full bg-[#FFF8F0] border border-[#F0EAE0] px-2.5 py-0.5 text-xs text-[#6B6B7B] font-medium">
                  {activity.durationMinutes}min
                </span>
                <span className="inline-block rounded-full bg-[#EDFAF8] px-2.5 py-0.5 text-xs text-[#4ECDC4] font-bold">
                  📦 {activity.materials.length}
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
          <p className="text-sm">Try a different category!</p>
        </motion.div>
      )}
    </div>
  );
}
