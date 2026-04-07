import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAudio } from '../hooks/useAudio';
import { useLessons } from '../hooks/useLessons';
import NavButton from '../components/NavButton';
import StarCounter from '../components/StarCounter';
import {
  getLessonsByAge,
  lessonTopics,
  type AgeGroup,
  type Lesson,
  type LessonStep,
} from '../data/lessonsData';

// ─── Age Group Picker ────────────────────────────────────────────────
const ageGroups: { value: AgeGroup; label: string; emoji: string; color: string; secondaryColor: string }[] = [
  { value: '2-3', label: 'Ages 2-3', emoji: '👶', color: '#FF6B6B', secondaryColor: '#FF8C42' },
  { value: '4-5', label: 'Ages 4-5', emoji: '🧒', color: '#4ECDC4', secondaryColor: '#6BCB77' },
  { value: '6-8', label: 'Ages 6-8', emoji: '📚', color: '#A78BFA', secondaryColor: '#FF6B6B' },
];

// ─── Main Page Component ─────────────────────────────────────────────
export default function LessonsPage() {
  const navigate = useNavigate();
  const { currentPlayer } = useApp();
  const { speak, playCorrect, playTryAgain, playCelebration, playClick } = useAudio();
  const {
    allProgress,
    getProgressForLesson,
    isLessonUnlocked,
    startLesson,
    updateStepProgress,
    completeLesson,
    getRecommendedLesson,
  } = useLessons(currentPlayer?.id);

  // Page-level state
  const [selectedAge, setSelectedAge] = useState<AgeGroup | null>(
    currentPlayer?.ageGroup ?? null
  );
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  // Active lesson state
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const quizScoreRef = useRef(0);
  const [totalQuizQuestions, setTotalQuizQuestions] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizResult, setQuizResult] = useState<'correct' | 'wrong' | null>(null);
  const [lessonCompleted, setLessonCompleted] = useState(false);

  // Guard: no player
  if (!currentPlayer) return <Navigate to="/" replace />;

  // Derived data
  const lessons = selectedAge ? getLessonsByAge(selectedAge) : [];
  const filteredLessons = selectedTopic
    ? lessons.filter((l) => l.topic === selectedTopic)
    : lessons;

  // Available topics for the selected age group
  const availableTopicKeys = new Set(lessons.map((l) => l.topic));
  const availableTopics = lessonTopics.filter((t) => availableTopicKeys.has(t.key));

  // ─── Handlers ────────────────────────────────────────────────────────

  function handleAgeSelect(age: AgeGroup) {
    playClick();
    setSelectedAge(age);
    setSelectedTopic(null);
    speak(`Let's learn! Ages ${age}`);
  }

  function handleTopicFilter(key: string) {
    playClick();
    setSelectedTopic((prev) => (prev === key ? null : key));
  }

  async function handleLessonTap(lesson: Lesson) {
    if (!isLessonUnlocked(lesson)) return;
    playClick();

    const progress = getProgressForLesson(lesson.id);

    // Start or resume
    await startLesson(lesson);

    const resumeStep =
      progress && !progress.completed && progress.stepsCompleted > 0
        ? progress.stepsCompleted
        : 0;

    // Count quiz questions
    const quizCount = lesson.steps.filter((s) => s.type === 'quiz').length;

    setActiveLesson(lesson);
    setCurrentStep(resumeStep);
    setQuizScore(0);
    quizScoreRef.current = 0;
    setTotalQuizQuestions(quizCount);
    setQuizAnswered(false);
    setQuizResult(null);
    setLessonCompleted(false);

    speak(lesson.title);
  }

  function handleBackToList() {
    playClick();
    setActiveLesson(null);
    setCurrentStep(0);
    setLessonCompleted(false);
  }

  async function handleNextStep() {
    if (!activeLesson) return;
    playClick();

    const nextStep = currentStep + 1;

    if (nextStep >= activeLesson.steps.length) {
      // Lesson finished - use ref to get latest quiz score (avoids stale closure)
      await completeLesson(activeLesson.id, quizScoreRef.current, totalQuizQuestions);
      playCelebration();
      setLessonCompleted(true);
      speak('Amazing! You finished the lesson!');
    } else {
      setCurrentStep(nextStep);
      setQuizAnswered(false);
      setQuizResult(null);
      await updateStepProgress(activeLesson.id, nextStep);
    }
  }

  function handleQuizAnswer(option: string) {
    if (quizAnswered || !activeLesson) return;
    setQuizAnswered(true);

    const step = activeLesson.steps[currentStep];
    const isCorrect = option === step.correctAnswer;

    if (isCorrect) {
      playCorrect();
      setQuizResult('correct');
      setQuizScore((s) => s + 1);
      quizScoreRef.current += 1;
      speak('Correct! Great job!');
    } else {
      playTryAgain();
      setQuizResult('wrong');
      speak(`Not quite. The answer is ${step.correctAnswer}.`);
    }

    // Auto-advance after feedback
    setTimeout(() => {
      handleNextStep();
    }, 2000);
  }

  // ─── RENDER: Age Picker ──────────────────────────────────────────────
  if (!selectedAge) {
    return (
      <div className="min-h-dvh bg-[#FFF8F0] pb-24 md:pb-8 flex flex-col">
        <div className="px-4 pt-4 md:px-8 md:pt-6">
          <div className="flex items-center justify-between mb-4 md:max-w-3xl md:mx-auto">
            <NavButton onClick={() => navigate('/menu')} direction="back" />
            <h2 className="text-lg font-extrabold text-[#2D2D3A] md:text-xl">Learning Journey</h2>
            <StarCounter />
          </div>
        </div>

        {/* Premium Hero Banner */}
        <div
          className="relative overflow-hidden px-4 pt-2 pb-8 mb-2 md:px-8"
          style={{ background: 'linear-gradient(180deg, #FFF3EB 0%, #FFF8F0 100%)' }}
        >
          {/* Floating decorative shapes */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-4 right-8 w-14 h-14 rounded-full opacity-[0.06]" style={{ backgroundColor: '#FF8C42' }} />
            <div className="absolute top-12 left-6 w-8 h-8 rounded-xl rotate-12 opacity-[0.05]" style={{ backgroundColor: '#FF6B6B' }} />
            <div className="absolute bottom-4 right-16 w-6 h-6 rounded-lg rotate-45 opacity-[0.05]" style={{ backgroundColor: '#A78BFA' }} />
          </div>

          <div className="max-w-md mx-auto text-center relative">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <motion.p
                className="text-7xl mb-3 drop-shadow-lg inline-block"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                📖
              </motion.p>
              <h1
                className="text-[28px] font-extrabold mb-1"
                style={{
                  background: 'linear-gradient(135deg, #FF8C42, #FF6B6B)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Lessons
              </h1>
              <p className="text-[15px] font-medium text-[#6B6B7B]">Learn something new today!</p>
            </motion.div>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <motion.h2
            className="text-xl font-extrabold text-[#2D2D3A] mb-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            How old are you?
          </motion.h2>
          <p className="text-[15px] font-medium text-[#6B6B7B] mb-8">Pick your age group to get started!</p>

          <div className="flex flex-col gap-4 w-full max-w-sm md:max-w-lg md:flex-row md:flex-wrap md:justify-center md:gap-5">
            {ageGroups.map((ag, i) => (
              <motion.button
                key={ag.value}
                className="rounded-[20px] p-5 font-bold text-xl cursor-pointer flex items-center gap-4 border border-white/20 relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${ag.color}, ${ag.secondaryColor})`,
                  boxShadow: `0 6px 24px ${ag.color}30`,
                  color: 'white',
                }}
                onClick={() => handleAgeSelect(ag.value)}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', delay: i * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Decorative circle */}
                <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/10" />

                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl">{ag.emoji}</span>
                </div>
                <span className="drop-shadow-sm">{ag.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── RENDER: Lesson Completion Screen ────────────────────────────────
  if (lessonCompleted && activeLesson) {
    const perfectQuiz = totalQuizQuestions > 0 && quizScore === totalQuizQuestions;
    const starsEarned = perfectQuiz ? 2 : 1;
    const emoji = perfectQuiz ? '🏆' : '🌟';
    const message = perfectQuiz ? 'Perfect Score!' : 'Lesson Complete!';

    return (
      <div
        className="min-h-dvh p-4 flex flex-col items-center justify-center relative overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #FFF3EB 0%, #FFF8F0 30%, #EDFAF8 100%)' }}
      >
        {/* Decorative confetti-inspired shapes */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-12 left-8 w-3 h-3 rounded-full opacity-20 animate-float" style={{ backgroundColor: '#FF8C42' }} />
          <div className="absolute top-20 right-12 w-2 h-2 rounded-full opacity-15 animate-float" style={{ backgroundColor: '#FFE66D', animationDelay: '0.5s' }} />
          <div className="absolute top-32 left-20 w-2.5 h-2.5 rounded-sm rotate-45 opacity-15 animate-float" style={{ backgroundColor: '#4ECDC4', animationDelay: '1s' }} />
          <div className="absolute top-16 right-24 w-2 h-2 rounded-sm rotate-12 opacity-15 animate-float" style={{ backgroundColor: '#A78BFA', animationDelay: '1.5s' }} />
          <div className="absolute bottom-32 left-10 w-2 h-2 rounded-full opacity-10 animate-float" style={{ backgroundColor: '#FF6B6B', animationDelay: '2s' }} />
          <div className="absolute bottom-24 right-8 w-3 h-3 rounded-sm rotate-30 opacity-10 animate-float" style={{ backgroundColor: '#6BCB77', animationDelay: '0.8s' }} />
        </div>

        {/* Top accent */}
        <div className="absolute top-0 left-0 right-0 h-1" style={{ background: 'linear-gradient(90deg, #FF8C42, #FF6B6B, transparent)' }} />

        <motion.div
          className="text-[100px] mb-5 drop-shadow-lg"
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
          transition={{ type: 'spring' }}
        >
          {emoji}
        </motion.div>
        <motion.h1
          className="text-3xl font-extrabold mb-2"
          style={{
            background: 'linear-gradient(135deg, #FF8C42, #FF6B6B)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          {message}
        </motion.h1>
        <motion.p
          className="text-xl text-[#6B6B7B] font-medium mb-2"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {activeLesson.emoji} {activeLesson.title}
        </motion.p>

        {totalQuizQuestions > 0 && (
          <motion.div
            className="rounded-[20px] px-6 py-4 mb-3 relative overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, white 0%, #FFF3EB 100%)',
              boxShadow: '0 4px 24px rgba(255,140,66,0.12), 0 2px 12px rgba(45,45,58,0.06)',
              border: '1px solid rgba(255,140,66,0.15)',
            }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            <p className="text-xs text-[#9B9BAB] font-semibold uppercase tracking-wider text-center mb-1">Quiz Score</p>
            <p
              className="text-2xl font-extrabold text-center"
              style={{
                background: 'linear-gradient(135deg, #FF8C42, #FF6B6B)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {quizScore}/{totalQuizQuestions} correct
            </p>
          </motion.div>
        )}

        <motion.div
          className="flex gap-2 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {Array.from({ length: starsEarned }).map((_, i) => (
            <motion.span
              key={i}
              className="text-5xl drop-shadow-md"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.3 + i * 0.15 }}
            >
              ⭐
            </motion.span>
          ))}
        </motion.div>

        <div className="flex gap-3">
          <motion.button
            className="text-white rounded-[14px] px-7 py-3.5 font-bold cursor-pointer text-[15px]"
            style={{
              background: 'linear-gradient(135deg, #FF8C42, #FF6B6B)',
              boxShadow: '0 4px 20px rgba(255,140,66,0.25)',
            }}
            onClick={handleBackToList}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            📚 Next Lesson
          </motion.button>
          <motion.button
            className="bg-white/80 backdrop-blur-sm rounded-[14px] px-7 py-3.5 font-bold cursor-pointer shadow-sm border border-[#F0EAE0] text-[#6B6B7B] text-[15px]"
            onClick={() => navigate('/menu')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🏠 Menu
          </motion.button>
        </div>
      </div>
    );
  }

  // ─── RENDER: Lesson Viewer (active lesson) ──────────────────────────
  if (activeLesson) {
    const step = activeLesson.steps[currentStep];
    const progressPct = ((currentStep + 1) / activeLesson.steps.length) * 100;

    return (
      <div className="min-h-dvh bg-[#FFF8F0] px-4 pt-4 pb-24 md:px-8 md:pt-6 md:pb-8 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 md:max-w-3xl md:mx-auto md:w-full">
          <NavButton onClick={handleBackToList} direction="back" />
          <h2 className="text-lg font-extrabold text-[#2D2D3A] truncate mx-2 md:text-xl">
            {activeLesson.emoji} {activeLesson.title}
          </h2>
          <StarCounter />
        </div>

        {/* Premium progress bar with step indicators */}
        <div className="w-full mb-1">
          <div className="w-full bg-[#F0EAE0] rounded-full h-2.5 relative overflow-hidden">
            <motion.div
              className="h-2.5 rounded-full"
              style={{ background: 'linear-gradient(90deg, #FF8C42, #FF6B6B)' }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
        {/* Step indicators */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-1">
            {activeLesson.steps.map((s, idx) => (
              <div
                key={idx}
                className="w-2 h-2 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: idx <= currentStep ? '#FF8C42' : '#E8E0D4',
                  transform: idx === currentStep ? 'scale(1.3)' : 'scale(1)',
                }}
              />
            ))}
          </div>
          <p className="text-xs text-[#9B9BAB] font-semibold">
            Step {currentStep + 1} of {activeLesson.steps.length}
          </p>
        </div>

        {/* Step content */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeLesson.id}-${currentStep}`}
              className="w-full"
              initial={{ x: 60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -60, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {step.type === 'intro' && (
                <IntroStep step={step} onNext={handleNextStep} />
              )}
              {step.type === 'activity' && (
                <ActivityStep step={step} onDone={handleNextStep} />
              )}
              {step.type === 'video' && (
                <VideoStep step={step} onNext={handleNextStep} />
              )}
              {step.type === 'quiz' && (
                <QuizStep
                  step={step}
                  onAnswer={handleQuizAnswer}
                  answered={quizAnswered}
                  result={quizResult}
                  stepIndex={currentStep}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // ─── RENDER: Lesson List ─────────────────────────────────────────────
  const recommended = getRecommendedLesson(selectedAge);

  // Separate in-progress lessons for "Continue Learning" rail
  const inProgressLessons = filteredLessons.filter((lesson) => {
    const progress = getProgressForLesson(lesson.id);
    return !!progress && !progress.completed && progress.stepsCompleted > 0;
  });

  // Topic color map for accent bars
  const topicColorMap: Record<string, string> = {
    alphabet: '#FF6B6B',
    phonics: '#4ECDC4',
    numbers: '#A78BFA',
    colors: '#FFB347',
    shapes: '#6BCB77',
    animals: '#FF8C42',
    emotions: '#FD79A8',
    'daily-routines': '#74B9FF',
  };

  return (
    <div className="min-h-dvh bg-[#FFF8F0] pb-24 md:pb-8">
      {/* Header */}
      <div className="px-4 pt-4 md:px-8 md:pt-6">
        <div className="flex items-center justify-between mb-4 md:max-w-3xl md:mx-auto">
          <NavButton onClick={() => navigate('/menu')} direction="back" />
          <h2 className="text-lg font-extrabold text-[#2D2D3A] md:text-xl">Learning Journey</h2>
          <StarCounter />
        </div>
      </div>

      {/* Premium Hero Banner */}
      <div
        className="relative overflow-hidden px-4 pt-1 pb-5 mb-2 md:px-8"
        style={{ background: 'linear-gradient(180deg, #FFF3EB 0%, #FFF8F0 100%)' }}
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-2 right-8 w-12 h-12 rounded-full opacity-[0.06]" style={{ backgroundColor: '#FF8C42' }} />
          <div className="absolute top-8 left-6 w-7 h-7 rounded-xl rotate-12 opacity-[0.05]" style={{ backgroundColor: '#FF6B6B' }} />
          <div className="absolute bottom-2 right-16 w-5 h-5 rounded-lg rotate-45 opacity-[0.04]" style={{ backgroundColor: '#A78BFA' }} />
        </div>

        <div className="max-w-md mx-auto relative">
          <motion.div
            className="flex items-center gap-3 mb-3"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <motion.span
              className="text-4xl drop-shadow-md"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              📖
            </motion.span>
            <div>
              <h1
                className="text-[22px] font-extrabold leading-tight"
                style={{
                  background: 'linear-gradient(135deg, #FF8C42, #FF6B6B)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Lessons
              </h1>
              <p className="text-[13px] font-medium text-[#6B6B7B]">Learn something new today!</p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 md:max-w-3xl md:px-8">
        {/* Premium Age Switcher Pills */}
        <div className="flex gap-2 mb-4 justify-center">
          {ageGroups.map((ag) => (
            <motion.button
              key={ag.value}
              className={`rounded-full px-5 py-2.5 text-sm font-bold cursor-pointer transition-all border ${
                selectedAge === ag.value
                  ? 'text-white border-transparent'
                  : 'bg-white text-[#6B6B7B] shadow-sm border-[#F0EAE0]'
              }`}
              style={
                selectedAge === ag.value
                  ? { background: `linear-gradient(135deg, ${ag.color}, ${ag.secondaryColor})`, boxShadow: `0 4px 16px ${ag.color}30` }
                  : undefined
              }
              onClick={() => handleAgeSelect(ag.value)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {ag.emoji} {ag.label}
            </motion.button>
          ))}
        </div>

        {/* Premium Topic Filter Chips with emoji */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide md:flex-wrap md:gap-3">
          <motion.button
            className={`rounded-full px-4 py-2 text-xs font-bold whitespace-nowrap cursor-pointer border transition-all flex items-center gap-1.5 flex-shrink-0 ${
              !selectedTopic
                ? 'text-white shadow-md border-transparent'
                : 'bg-white text-[#6B6B7B] shadow-sm border-[#F0EAE0]'
            }`}
            style={!selectedTopic ? { background: 'linear-gradient(135deg, #FF8C42, #FF6B6B)', boxShadow: '0 2px 10px rgba(255,140,66,0.2)' } : undefined}
            onClick={() => {
              playClick();
              setSelectedTopic(null);
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            All
          </motion.button>
          {availableTopics.map((topic) => {
            const chipColor = topicColorMap[topic.key] || '#FF8C42';
            return (
              <motion.button
                key={topic.key}
                className={`rounded-full px-4 py-2 text-xs font-bold whitespace-nowrap cursor-pointer border transition-all flex items-center gap-1.5 flex-shrink-0 ${
                  selectedTopic === topic.key
                    ? 'text-white shadow-md border-transparent'
                    : 'shadow-sm'
                }`}
                style={
                  selectedTopic === topic.key
                    ? { background: `linear-gradient(135deg, ${chipColor}, ${chipColor}cc)`, boxShadow: `0 2px 10px ${chipColor}25` }
                    : { background: `${chipColor}08`, color: '#6B6B7B', border: `1px solid ${chipColor}20` }
                }
                onClick={() => handleTopicFilter(topic.key)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {topic.emoji} {topic.label}
              </motion.button>
            );
          })}
        </div>

        {/* Recommended lesson hero banner */}
        {recommended && !selectedTopic && (
          <motion.button
            className="w-full mb-5 rounded-[20px] p-5 text-white text-left flex items-center gap-3 cursor-pointer relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #FF8C42, #FF6B6B)',
              boxShadow: '0 8px 32px rgba(255,140,66,0.25)',
            }}
            onClick={() => handleLessonTap(recommended)}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Decorative circles */}
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
            <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/10" />

            <motion.span
              className="text-5xl drop-shadow-lg relative"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            >
              {recommended.emoji}
            </motion.span>
            <div className="flex-1 min-w-0 relative">
              <p className="text-[10px] font-extrabold opacity-70 uppercase tracking-wider">Up Next</p>
              <p className="font-extrabold text-lg truncate">{recommended.title}</p>
              <p className="text-sm opacity-90 truncate">{recommended.description}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 relative">
              <span className="text-white text-lg font-bold">▶</span>
            </div>
          </motion.button>
        )}

        {/* Continue Learning Rail */}
        {inProgressLessons.length > 0 && !selectedTopic && (
          <div className="mb-5">
            <p className="text-[13px] font-extrabold text-[#6B6B7B] uppercase tracking-wider mb-3">Pick Up Where You Left Off</p>
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
              {inProgressLessons.map((lesson) => {
                const progress = getProgressForLesson(lesson.id);
                const stepsPct = progress ? Math.round((progress.stepsCompleted / progress.totalSteps) * 100) : 0;
                const accentColor = topicColorMap[lesson.topic] || '#FF8C42';
                return (
                  <motion.button
                    key={`continue-${lesson.id}`}
                    className="rounded-[16px] p-3.5 flex flex-col items-center gap-1.5 cursor-pointer flex-shrink-0 w-28 relative overflow-hidden"
                    style={{
                      background: `linear-gradient(145deg, white, ${accentColor}06)`,
                      boxShadow: `0 2px 12px ${accentColor}12, 0 2px 8px rgba(45,45,58,0.04)`,
                      border: `1px solid ${accentColor}15`,
                    }}
                    onClick={() => handleLessonTap(lesson)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-3xl">{lesson.emoji}</span>
                    <span className="text-xs font-bold text-[#2D2D3A] text-center truncate w-full">{lesson.title}</span>
                    <div className="w-full bg-[#F0EAE0] rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full"
                        style={{
                          width: `${stepsPct}%`,
                          background: `linear-gradient(90deg, ${accentColor}, ${accentColor}cc)`,
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-[#9B9BAB] font-semibold">{stepsPct}%</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}

        {/* Section Header */}
        <p className="text-[13px] font-extrabold text-[#6B6B7B] uppercase tracking-wider mb-3">
          {selectedTopic ? `${availableTopics.find(t => t.key === selectedTopic)?.emoji || ''} ${availableTopics.find(t => t.key === selectedTopic)?.label || ''} Lessons` : 'All Lessons'}
        </p>

        {/* Premium Lesson Cards */}
        <div className="flex flex-col gap-3">
          {filteredLessons.map((lesson, i) => {
            const progress = getProgressForLesson(lesson.id);
            const unlocked = isLessonUnlocked(lesson);
            const completed = !!progress?.completed;
            const inProgress = !!progress && !progress.completed && progress.stepsCompleted > 0;
            const stepsPct =
              inProgress && progress
                ? Math.round((progress.stepsCompleted / progress.totalSteps) * 100)
                : 0;
            const accentColor = topicColorMap[lesson.topic] || '#FF8C42';

            return (
              <motion.button
                key={lesson.id}
                className={`bg-white rounded-[20px] p-4 flex items-center gap-3 text-left w-full cursor-pointer transition-shadow duration-200 ${
                  !unlocked ? 'opacity-60' : ''
                }`}
                style={{
                  borderLeft: unlocked ? `4px solid ${accentColor}` : '4px solid #E8E0D4',
                  boxShadow: `0 2px 12px rgba(45,45,58,0.06)`,
                  border: `1px solid #F0EAE0`,
                  borderLeftWidth: '4px',
                  borderLeftColor: unlocked ? accentColor : '#E8E0D4',
                }}
                onClick={() => handleLessonTap(lesson)}
                disabled={!unlocked}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                whileHover={unlocked ? { scale: 1.02, boxShadow: '0 8px 24px rgba(45,45,58,0.10)' } : undefined}
                whileTap={unlocked ? { scale: 0.98 } : undefined}
              >
                {/* Emoji */}
                <div
                  className="text-4xl flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: unlocked ? `${accentColor}10` : '#F0EAE0' }}
                >
                  {!unlocked ? '🔒' : lesson.emoji}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-extrabold text-[#2D2D3A] truncate">{lesson.title}</h3>
                    {completed && <span className="text-lg flex-shrink-0">✅</span>}
                  </div>
                  <p className="text-sm text-[#6B6B7B] truncate">{lesson.description}</p>

                  {/* Topic badge with colored background */}
                  <span
                    className="inline-block mt-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold"
                    style={{
                      backgroundColor: `${accentColor}10`,
                      color: accentColor,
                      border: `1px solid ${accentColor}20`,
                    }}
                  >
                    {lessonTopics.find((t) => t.key === lesson.topic)?.emoji}{' '}
                    {lessonTopics.find((t) => t.key === lesson.topic)?.label}
                  </span>

                  {/* Progress bar for in-progress lessons */}
                  {inProgress && (
                    <div className="mt-2 w-full bg-[#F0EAE0] rounded-full h-2">
                      <motion.div
                        className="h-2 rounded-full"
                        style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}cc)` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${stepsPct}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  )}

                  {/* Lesson count badge */}
                  {!inProgress && !completed && unlocked && (
                    <span className="inline-block mt-1 text-[10px] text-[#9B9BAB] font-semibold">
                      {lesson.steps.length} steps
                    </span>
                  )}

                  {/* Score for completed lessons */}
                  {completed && progress && progress.score > 0 && (
                    <p className="text-xs font-bold mt-1" style={{ color: accentColor }}>
                      Quiz score: {progress.score}
                    </p>
                  )}
                </div>

                {/* Chevron for unlocked */}
                {unlocked && !completed && (
                  <span className="text-[#E8E0D4] text-xl flex-shrink-0">›</span>
                )}
              </motion.button>
            );
          })}

          {filteredLessons.length === 0 && (
            <motion.div
              className="text-center py-12 text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-4xl mb-2">🔍</p>
              <p className="font-bold">No lessons found</p>
              <p className="text-sm">Try a different topic or age group!</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Step Components ─────────────────────────────────────────────────

function IntroStep({ step, onNext }: { step: LessonStep; onNext: () => void }) {
  return (
    <div className="text-center">
      <motion.div
        className="text-8xl mb-6 drop-shadow-md"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {step.emoji}
      </motion.div>
      <h2 className="text-2xl font-extrabold text-[#2D2D3A] mb-3">{step.title}</h2>
      <p className="text-[15px] font-medium text-[#6B6B7B] mb-8 leading-relaxed">{step.content}</p>
      <motion.button
        className="bg-gradient-to-r from-tangerine to-orange-400 text-white rounded-[14px] px-8 py-4 text-xl font-bold shadow-[0_4px_20px_rgba(255,140,66,0.25)] cursor-pointer"
        onClick={onNext}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Next ➡️
      </motion.button>
    </div>
  );
}

function ActivityStep({ step, onDone }: { step: LessonStep; onDone: () => void }) {
  const [done, setDone] = useState(false);

  function handleDone() {
    setDone(true);
    setTimeout(onDone, 400);
  }

  return (
    <div className="text-center">
      <motion.div
        className="text-8xl mb-6 drop-shadow-md"
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        {step.emoji}
      </motion.div>
      <h2 className="text-2xl font-extrabold text-[#2D2D3A] mb-3">{step.title}</h2>
      <p className="text-[15px] font-medium text-[#6B6B7B] mb-8 leading-relaxed">{step.content}</p>
      <motion.button
        className={`rounded-[14px] px-8 py-4 text-xl font-bold shadow-[0_4px_20px_rgba(45,45,58,0.12)] cursor-pointer ${
          done ? 'bg-leaf text-white' : 'bg-sky-400 text-white'
        }`}
        onClick={handleDone}
        disabled={done}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={done ? { scale: [1, 1.15, 1] } : {}}
      >
        {done ? '✅ Done!' : '👆 Done!'}
      </motion.button>
    </div>
  );
}

function VideoStep({ step, onNext }: { step: LessonStep; onNext: () => void }) {
  return (
    <div className="text-center w-full">
      <h2 className="text-xl font-bold text-gray-800 mb-3">{step.title}</h2>
      <p className="text-gray-500 mb-4">{step.content}</p>

      {/* YouTube embed using privacy-enhanced mode */}
      <div className="relative w-full rounded-2xl overflow-hidden shadow-lg mb-6" style={{ paddingTop: '56.25%' }}>
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube-nocookie.com/embed/${step.videoId}?rel=0&modestbranding=1`}
          title={step.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      <motion.button
        className="bg-tangerine text-white rounded-2xl px-8 py-4 text-xl font-bold shadow-lg cursor-pointer"
        onClick={onNext}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Next ➡️
      </motion.button>
    </div>
  );
}

function QuizStep({
  step,
  onAnswer,
  answered,
  result,
  stepIndex,
}: {
  step: LessonStep;
  onAnswer: (option: string) => void;
  answered: boolean;
  result: 'correct' | 'wrong' | null;
  stepIndex: number;
}) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Reset when step changes
  useEffect(() => {
    setSelectedOption(null);
  }, [stepIndex]);

  function handleOptionClick(option: string) {
    if (answered) return;
    setSelectedOption(option);
    onAnswer(option);
  }

  function getOptionStyle(option: string): string {
    if (!answered || selectedOption !== option) {
      if (answered && option === step.correctAnswer) {
        // Show correct answer even if not selected
        return 'bg-leaf text-white';
      }
      return 'bg-white text-gray-800';
    }
    // Selected option styling
    if (result === 'correct') return 'bg-leaf text-white';
    return 'bg-coral text-white';
  }

  return (
    <div className="text-center w-full">
      <motion.div
        className="text-6xl mb-4 drop-shadow-md"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        🧠
      </motion.div>
      <h2 className="text-xl font-extrabold text-[#2D2D3A] mb-2">{step.title}</h2>
      <p className="text-lg text-[#6B6B7B] mb-6 font-medium">{step.question ?? step.content}</p>

      <div className="grid grid-cols-2 gap-3">
        {step.options?.map((option) => (
          <motion.button
            key={`${stepIndex}-${option}`}
            className={`rounded-[16px] px-4 py-4 text-lg font-bold shadow-[0_2px_12px_rgba(45,45,58,0.06)] border border-[#F0EAE0] cursor-pointer ${getOptionStyle(option)}`}
            onClick={() => handleOptionClick(option)}
            disabled={answered}
            whileHover={!answered ? { scale: 1.03 } : undefined}
            whileTap={!answered ? { scale: 0.97 } : undefined}
            animate={
              answered && selectedOption === option && result === 'wrong'
                ? { x: [0, -8, 8, -8, 8, 0] }
                : answered && selectedOption === option && result === 'correct'
                  ? { scale: [1, 1.1, 1] }
                  : {}
            }
            transition={{ duration: 0.4 }}
          >
            {option}
          </motion.button>
        ))}
      </div>

      {/* Feedback message */}
      <AnimatePresence>
        {answered && result && (
          <motion.div
            className={`mt-5 rounded-[16px] p-4 font-bold text-lg ${
              result === 'correct' ? 'bg-[#EDFAEF] text-green-700 border border-green-200' : 'bg-[#FFF0F0] text-red-700 border border-red-200'
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {result === 'correct'
              ? '🎉 Correct! Great job!'
              : `❌ The answer is: ${step.correctAnswer}`}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
