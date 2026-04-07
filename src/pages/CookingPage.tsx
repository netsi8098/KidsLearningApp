import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAudio } from '../hooks/useAudio';
import { useCooking } from '../hooks/useCooking';
import NavButton from '../components/NavButton';
import CategoryFilterBar from '../components/CategoryFilterBar';
import RecipeCard from '../components/RecipeCard';
import StepIndicator from '../components/StepIndicator';
import CompletionSummary from '../components/CompletionSummary';
import StarCounter from '../components/StarCounter';
import {
  cookingCategories,
  cookingRecipes,
  type CookingRecipe,
  type RecipeQuiz,
} from '../data/cookingData';

export default function CookingPage() {
  const navigate = useNavigate();
  const { currentPlayer } = useApp();
  const { playClick, playCelebration, playCorrect, playTryAgain, speak } = useAudio();
  const {
    startRecipe,
    advanceStep,
    completeRecipe,
    toggleFavorite,
    isFavorite,
  } = useCooking(currentPlayer?.id);

  const [activeCategory, setActiveCategory] = useState('all');
  const [activeRecipe, setActiveRecipe] = useState<CookingRecipe | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizResult, setQuizResult] = useState<'correct' | 'wrong' | null>(null);

  if (!currentPlayer) return <Navigate to="/" replace />;

  // Filter recipes
  const filtered = cookingRecipes.filter((r) => {
    if (activeCategory !== 'all' && r.category !== activeCategory) return false;
    return true;
  });

  // ── Handlers ────────────────────────────────────────────────

  async function handleRecipeTap(recipe: CookingRecipe) {
    playClick();
    await startRecipe(recipe.id, recipe.steps.length);
    setActiveRecipe(recipe);
    setCurrentStep(0);
    setShowCompletion(false);
    setShowQuiz(false);
    setQuizIndex(0);
    setQuizScore(0);
    speak(recipe.title);
  }

  async function handleNextStep() {
    if (!activeRecipe) return;
    playClick();

    await advanceStep(activeRecipe.id);

    if (currentStep < activeRecipe.steps.length - 1) {
      setCurrentStep((s) => s + 1);
      speak(activeRecipe.steps[currentStep + 1].text);
    } else {
      // Recipe steps finished
      await completeRecipe(activeRecipe.id);
      playCelebration();

      // If there's a quiz, show it
      if (activeRecipe.quiz && activeRecipe.quiz.length > 0) {
        setShowQuiz(true);
        setQuizIndex(0);
        setQuizScore(0);
        setQuizAnswered(false);
        setQuizResult(null);
      } else {
        setShowCompletion(true);
      }
    }
  }

  function handlePrevStep() {
    if (currentStep > 0) {
      playClick();
      setCurrentStep((s) => s - 1);
    }
  }

  function handleQuizAnswer(optionIndex: number) {
    if (quizAnswered || !activeRecipe?.quiz) return;
    setQuizAnswered(true);

    const currentQuiz = activeRecipe.quiz[quizIndex];
    const isCorrect = optionIndex === currentQuiz.correct;

    if (isCorrect) {
      playCorrect();
      setQuizResult('correct');
      setQuizScore((s) => s + 1);
      speak('Correct! Great job!');
    } else {
      playTryAgain();
      setQuizResult('wrong');
      speak(`Not quite. The answer is ${currentQuiz.options[currentQuiz.correct]}.`);
    }

    // Auto-advance after feedback
    setTimeout(() => {
      if (quizIndex < (activeRecipe?.quiz?.length ?? 1) - 1) {
        setQuizIndex((i) => i + 1);
        setQuizAnswered(false);
        setQuizResult(null);
      } else {
        setShowQuiz(false);
        setShowCompletion(true);
      }
    }, 2000);
  }

  function handleBackToList() {
    playClick();
    setActiveRecipe(null);
    setCurrentStep(0);
    setShowCompletion(false);
    setShowQuiz(false);
  }

  // ── RENDER: Completion ──────────────────────────────────────

  if (showCompletion && activeRecipe) {
    return (
      <div className="min-h-dvh bg-[#FFF8F0] px-4 pt-4 pb-8 flex flex-col items-center justify-center">
        <CompletionSummary
          emoji={activeRecipe.emoji}
          title="Chef Superstar!"
          message={`You made "${activeRecipe.title}"! You earned cooking stars!`}
          starsEarned={2}
          onContinue={handleBackToList}
          continueLabel="More Recipes"
        />
      </div>
    );
  }

  // ── RENDER: Quiz ────────────────────────────────────────────

  if (showQuiz && activeRecipe?.quiz) {
    const currentQuiz: RecipeQuiz = activeRecipe.quiz[quizIndex];

    return (
      <div className="min-h-dvh bg-[#FFF8F0] px-4 pt-4 pb-8 flex flex-col">
        <div className="flex items-center justify-between mb-5">
          <NavButton onClick={handleBackToList} direction="back" />
          <h2 className="text-lg font-extrabold text-[#FF8C42]">Quiz Time!</h2>
          <StarCounter />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
          <motion.span
            className="text-5xl mb-4"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            🧠
          </motion.span>
          <h3 className="text-xl font-bold text-[#2D2D3A] mb-6 text-center">
            {currentQuiz.question}
          </h3>

          <div className="flex flex-col gap-3 w-full">
            {currentQuiz.options.map((option, idx) => {
              let btnStyle = 'bg-white text-[#2D2D3A] border border-[#F0EAE0] shadow-[0_2px_12px_rgba(45,45,58,0.06)]';
              if (quizAnswered) {
                if (idx === currentQuiz.correct) btnStyle = 'bg-[#6BCB77] text-white shadow-[0_4px_16px_rgba(107,203,119,0.3)]';
                else if (quizResult === 'wrong' && idx !== currentQuiz.correct) btnStyle = 'bg-white text-[#9B9BAB] border border-[#F0EAE0]';
              }

              return (
                <motion.button
                  key={idx}
                  className={`rounded-[16px] px-4 py-4 text-lg font-bold cursor-pointer ${btnStyle}`}
                  onClick={() => handleQuizAnswer(idx)}
                  disabled={quizAnswered}
                  whileHover={!quizAnswered ? { scale: 1.02 } : undefined}
                  whileTap={!quizAnswered ? { scale: 0.98 } : undefined}
                >
                  {option}
                </motion.button>
              );
            })}
          </div>

          {/* Feedback */}
          <AnimatePresence>
            {quizAnswered && quizResult && (
              <motion.div
                className={`mt-4 rounded-[16px] p-4 font-bold text-lg text-center ${
                  quizResult === 'correct' ? 'bg-[#EDFAEF] text-green-700' : 'bg-[#FFF0F0] text-red-700'
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                {quizResult === 'correct'
                  ? '🎉 Correct!'
                  : `❌ The answer is: ${currentQuiz.options[currentQuiz.correct]}`}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // ── RENDER: Cook-Along Mode ─────────────────────────────────

  if (activeRecipe) {
    const step = activeRecipe.steps[currentStep];
    const isLastStep = currentStep === activeRecipe.steps.length - 1;

    return (
      <div className="min-h-dvh bg-[#FFF8F0] px-4 pt-4 pb-8 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <NavButton onClick={handleBackToList} direction="back" />
          <h2 className="text-lg font-extrabold text-[#FF8C42] truncate mx-2">
            {activeRecipe.emoji} {activeRecipe.title}
          </h2>
          <StarCounter />
        </div>

        {/* Premium Safety note banner */}
        {activeRecipe.safetyNote && (
          <motion.div
            className="rounded-[16px] p-4 mb-4 flex items-start gap-3"
            style={{ background: 'linear-gradient(135deg, #FFF8ED, #FFFCF5)', border: '1px solid #FFE0A0' }}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <span className="text-xl flex-shrink-0 mt-0.5">⚠️</span>
            <div>
              <p className="text-xs font-bold text-amber-700 uppercase tracking-[0.06em] mb-0.5">Parent Assistance Needed</p>
              <p className="text-sm text-amber-700 font-medium">{activeRecipe.safetyNote}</p>
            </div>
          </motion.div>
        )}

        {/* Step indicator */}
        <div className="mb-4">
          <StepIndicator currentStep={currentStep} totalSteps={activeRecipe.steps.length} />
        </div>

        {/* Step content */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              className="bg-white rounded-[20px] shadow-[0_4px_24px_rgba(255,140,66,0.10)] border border-[#FFF3EB] p-8 text-center w-full"
              initial={{ x: 60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -60, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Step number badge - tangerine */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF8C42] to-[#FFB380] text-white font-extrabold text-base flex items-center justify-center mx-auto mb-4 shadow-[0_2px_8px_rgba(255,140,66,0.3)]">
                {currentStep + 1}
              </div>
              <motion.span
                className="text-7xl block mb-6"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {step.emoji}
              </motion.span>
              <p className="text-2xl font-bold text-[#2D2D3A] mb-4 leading-relaxed">
                {step.text}
              </p>

              {/* Ingredient highlights for current step */}
              {activeRecipe.ingredients.length > 0 && currentStep === 0 && (
                <div className="mt-3 pt-3 border-t border-[#F0EAE0]">
                  <p className="text-[11px] font-bold text-[#9B9BAB] uppercase tracking-[0.06em] mb-2">Ingredients needed</p>
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {activeRecipe.ingredients.map((ing) => (
                      <span key={ing} className="inline-block rounded-full bg-[#FFF3EB] border border-[#FFE0C4] px-2.5 py-0.5 text-xs text-[#FF8C42] font-medium">
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Vocabulary words */}
        {activeRecipe.vocabularyWords.length > 0 && (
          <div className="mb-4">
            <p className="text-[11px] font-bold text-[#9B9BAB] uppercase tracking-[0.06em] mb-2 text-center">
              New Words
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {activeRecipe.vocabularyWords.map((word) => (
                <span
                  key={word}
                  className="bg-[#F3EFFE] text-[#A78BFA] rounded-full px-3.5 py-1 text-xs font-bold border border-[#E5DAFB]"
                >
                  {word}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-center gap-4 mt-4">
          <NavButton
            onClick={handlePrevStep}
            direction="prev"
            disabled={currentStep === 0}
          />
          <motion.button
            className="bg-gradient-to-r from-[#FF8C42] to-[#FFB380] text-white rounded-[14px] px-8 py-4 text-xl font-bold shadow-[0_4px_20px_rgba(255,140,66,0.25)] cursor-pointer"
            onClick={handleNextStep}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isLastStep ? 'Done!' : 'Next Step'}
          </motion.button>
          <NavButton
            onClick={handleNextStep}
            direction="next"
            disabled={isLastStep}
          />
        </div>
      </div>
    );
  }

  // ── RENDER: Recipe List ─────────────────────────────────────

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
        style={{ background: 'linear-gradient(135deg, #FFF3EB 0%, #FFFFFF 60%, #FFFCE8 100%)' }}
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
          👨‍🍳
        </motion.span>
        <motion.span
          className="absolute bottom-3 right-12 text-xl opacity-30 pointer-events-none"
          animate={{ y: [0, -4, 0], rotate: [0, -8, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
        >
          🍳
        </motion.span>
        <motion.span
          className="absolute top-5 right-20 text-lg opacity-25 pointer-events-none"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2.8, repeat: Infinity, delay: 1 }}
        >
          🥄
        </motion.span>

        <h2
          className="text-2xl font-extrabold tracking-tight mb-1"
          style={{
            background: 'linear-gradient(135deg, #FF8C42, #FFE66D)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Cooking Fun
        </h2>
        <p className="text-sm text-[#6B6B7B] font-medium">Yummy recipes to make together!</p>
      </motion.div>

      {/* Section Header */}
      <p className="text-[11px] font-bold text-[#9B9BAB] uppercase tracking-[0.08em] mb-2 px-1">
        🍳 Category
      </p>

      {/* Category filter */}
      <div className="mb-6">
        <CategoryFilterBar
          categories={cookingCategories}
          activeCategory={activeCategory}
          onCategoryChange={(key) => {
            playClick();
            setActiveCategory(key);
          }}
        />
      </div>

      {/* Section Header */}
      <p className="text-[11px] font-bold text-[#9B9BAB] uppercase tracking-[0.08em] mb-3 px-1">
        👨‍🍳 Recipes ({filtered.length})
      </p>

      {/* Recipe grid */}
      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
        {filtered.map((recipe, i) => (
          <motion.div
            key={recipe.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.04 }}
          >
            <RecipeCard
              emoji={recipe.emoji}
              title={recipe.title}
              prepTime={recipe.prepTime}
              difficulty={recipe.difficulty}
              ageGroup={recipe.ageGroup}
              isFavorite={isFavorite(recipe.id)}
              onClick={() => handleRecipeTap(recipe)}
              onFavoriteToggle={() => toggleFavorite(recipe.id)}
            />
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <motion.div
          className="text-center py-16 text-[#9B9BAB]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-5xl mb-3">🔍</p>
          <p className="font-bold text-[#6B6B7B]">No recipes found</p>
          <p className="text-sm">Try a different category!</p>
        </motion.div>
      )}
    </div>
  );
}
