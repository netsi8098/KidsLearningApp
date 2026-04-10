import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Navigate } from 'react-router-dom';
import { generateQuiz, generateCategoryQuiz } from '../data/quizData';
import { useApp } from '../context/AppContext';
import { useProgress } from '../hooks/useProgress';
import { useAudio } from '../hooks/useAudio';
import { useBadges } from '../hooks/useBadges';
import ChoiceButton from '../components/ChoiceButton';
import NavButton from '../components/NavButton';
import StarCounter from '../components/StarCounter';
import AnimatedBackground from '../components/svg/AnimatedBackground';
import MascotLion from '../components/svg/MascotLion';
import ConfettiCelebration from '../components/ConfettiCelebration';

const categories = [
  { key: 'mixed', label: 'Mixed', emoji: '🎲', color: '#FF8C42' },
  { key: 'abc', label: 'ABCs', emoji: '🔤', color: '#FF6B6B' },
  { key: 'numbers', label: 'Numbers', emoji: '🔢', color: '#4ECDC4' },
  { key: 'colors', label: 'Colors', emoji: '🎨', color: '#FFB347' },
  { key: 'shapes', label: 'Shapes', emoji: '🔷', color: '#A78BFA' },
  { key: 'animals', label: 'Animals', emoji: '🐾', color: '#6BCB77' },
];

export default function QuizPage() {
  const navigate = useNavigate();
  const { currentPlayer } = useApp();
  const { recordActivity } = useProgress(currentPlayer?.id);
  const { checkAndAwardBadges } = useBadges(currentPlayer?.id);
  const { speak, playCorrect, playTryAgain, playClick } = useAudio();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [questions, setQuestions] = useState<ReturnType<typeof generateQuiz>>([]);
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [finished, setFinished] = useState(false);
  const [streak, setStreak] = useState(0);

  function handleCategorySelect(key: string) {
    playClick();
    setSelectedCategory(key);
    const qs = key === 'mixed' ? generateQuiz(10) : generateCategoryQuiz(key, 10);
    setQuestions(qs);
    setQIndex(0);
    setScore(0);
    setStreak(0);
    setAnswered(false);
    setFinished(false);
    speak('Let\'s go!');
  }

  const q = questions[qIndex];

  const encouragements = ['Amazing!', 'Great job!', 'Wonderful!', 'You\'re a star!', 'Fantastic!', 'Super!'];

  const handleAnswer = useCallback(
    (correct: boolean) => {
      if (answered) return;
      setAnswered(true);
      recordActivity('quiz', `q${qIndex}-${Date.now()}`, correct);

      if (correct) {
        playCorrect();
        const msg = encouragements[Math.floor(Math.random() * encouragements.length)];
        speak(msg);
        setScore((s) => s + 1);
        setStreak((s) => s + 1);
      } else {
        playTryAgain();
        speak(`The answer is ${q.correctAnswer}. Try the next one!`);
        setStreak(0);
      }

      setTimeout(() => {
        if (qIndex < questions.length - 1) {
          setQIndex((i) => i + 1);
          setAnswered(false);
        } else {
          setFinished(true);
          checkAndAwardBadges(currentPlayer?.totalStars ?? 0);
        }
      }, 1500);
    },
    [answered, qIndex, questions.length]
  );

  if (!currentPlayer) return <Navigate to="/" replace />;

  function handlePlayAgain() {
    setSelectedCategory(null);
    setQuestions([]);
    setQIndex(0);
    setScore(0);
    setStreak(0);
    setAnswered(false);
    setFinished(false);
  }

  // Category picker screen
  if (!selectedCategory) {
    return (
      <div className="min-h-dvh px-4 pt-4 pb-8 flex flex-col relative">
        <AnimatedBackground theme="quiz" />
        <div className="flex items-center justify-between mb-5">
          <NavButton onClick={() => navigate('/menu')} direction="back" />
          <h2 className="font-display text-xl text-bubbly" style={{ color: '#FF8C42' }}>Quiz Time!</h2>
          <StarCounter />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center">
          <motion.p
            className="text-5xl mb-4"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🧠
          </motion.p>
          <motion.h1
            className="text-2xl font-extrabold mb-2"
            style={{ color: '#2D2D3A' }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            Pick a Topic!
          </motion.h1>
          <p className="mb-8" style={{ color: '#6B6B7B' }}>What do you want to be quizzed on?</p>

          <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
            {categories.map((cat, i) => (
              <motion.button
                key={cat.key}
                className="rounded-[20px] p-4 text-white font-bold text-lg cursor-pointer"
                style={{ backgroundColor: cat.color, boxShadow: `0 4px 20px ${cat.color}40` }}
                onClick={() => handleCategorySelect(cat.key)}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', delay: i * 0.08 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-3xl block mb-1">{cat.emoji}</span>
                {cat.label}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Results screen
  if (finished) {
    const message =
      score >= 8 ? 'Outstanding!' : score >= 6 ? 'Great work!' : score >= 4 ? 'Good try!' : 'Keep practicing!';
    const mascotExpression = score >= 8 ? 'celebrating' as const : score >= 5 ? 'happy' as const : 'thinking' as const;

    return (
      <div className="min-h-dvh px-4 pt-4 pb-8 flex flex-col items-center justify-center relative page-with-bg">
        <AnimatedBackground theme="quiz" />

        {score >= 8 && (
          <ConfettiCelebration message={`Amazing! ${score}/${questions.length}!`} stars={score} onDismiss={() => {}} autoDismissMs={60000} />
        )}

        <motion.div className="text-center relative z-10" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring' }}>
          <MascotLion size={120} expression={mascotExpression} animated />

          <h1 className="font-display text-3xl text-white mt-4 mb-2" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
            {message}
          </h1>
          <p className="font-display text-xl text-white/80 mb-3">
            You got {score} out of {questions.length}!
          </p>

          {/* Star row */}
          <motion.div className="flex gap-1.5 justify-center mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            {Array.from({ length: questions.length }).map((_, i) => (
              <svg key={i} width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L15 9H22L16.5 13.5L18.5 21L12 17L5.5 21L7.5 13.5L2 9H9Z"
                  fill={i < score ? '#FFD93D' : 'rgba(255,255,255,0.2)'}
                  stroke={i < score ? '#F59E0B' : 'rgba(255,255,255,0.1)'}
                  strokeWidth="1"
                />
              </svg>
            ))}
          </motion.div>

          <div className="flex gap-3 justify-center">
            <motion.button className="btn-primary" onClick={handlePlayAgain} whileTap={{ scale: 0.95 }}>
              Play Again
            </motion.button>
            <motion.button className="btn-secondary" style={{ borderColor: 'white', color: 'white', background: 'rgba(255,255,255,0.15)' }} onClick={() => navigate('/menu')} whileTap={{ scale: 0.95 }}>
              Menu
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Quiz question screen
  return (
    <div className="min-h-dvh bg-[#FFF8F0] px-4 pt-4 pb-8 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <NavButton onClick={() => navigate('/menu')} direction="back" />
        <h2 className="text-xl font-extrabold tracking-tight" style={{ color: '#FF8C42' }}>
          Quiz {qIndex + 1}/{questions.length}
        </h2>
        <StarCounter />
      </div>

      <div className="w-full rounded-full h-3 mb-2" style={{ backgroundColor: '#F0EAE0' }}>
        <motion.div
          className="h-3 rounded-full bg-gradient-to-r from-[#FF8C42] to-[#FFB347]"
          animate={{ width: `${((qIndex + 1) / questions.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {streak >= 2 && (
        <motion.div
          className="text-center text-sm font-bold mb-2"
          style={{ color: '#FF8C42' }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          key={streak}
        >
          🔥 {streak} in a row!
        </motion.div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={qIndex}
            className="w-full text-center"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
          >
            <motion.div
              className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: '#FFF3EB', boxShadow: '0 4px 20px rgba(255,140,66,0.15)' }}
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <span className="text-5xl">{q.emoji}</span>
            </motion.div>
            <div
              className="rounded-[20px] px-6 py-5 mb-6"
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #F0EAE0', boxShadow: '0 2px 12px rgba(45,45,58,0.06)' }}
            >
              <p className="text-xl font-bold" style={{ color: '#2D2D3A' }}>{q.question}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {q.options.map((opt) => (
                <ChoiceButton
                  key={`${qIndex}-${opt}`}
                  label={opt}
                  isCorrect={opt === q.correctAnswer}
                  onAnswer={handleAnswer}
                  disabled={answered}
                  questionIndex={qIndex}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
