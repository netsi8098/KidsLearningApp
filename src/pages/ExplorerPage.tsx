import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAudio } from '../hooks/useAudio';
import { useExplorer } from '../hooks/useExplorer';
import {
  explorerTopics,
  explorerCategories,
  type ExplorerTopic,
} from '../data/worldExplorerData';
import NavButton from '../components/NavButton';
import CategoryFilterBar from '../components/CategoryFilterBar';
import CompletionSummary from '../components/CompletionSummary';

type ViewMode = 'browse' | 'explore' | 'quiz' | 'complete';

export default function ExplorerPage() {
  const navigate = useNavigate();
  const { currentPlayer } = useApp();
  const { speak, playCorrect, playTryAgain, playCelebration } = useAudio();
  const playerId = currentPlayer?.id;
  const { readFact, completeQuiz, isTopicCompleted, getTopicProgress } =
    useExplorer(playerId);

  // Browse state
  const [activeCategory, setActiveCategory] = useState('all');

  // Explore state
  const [viewMode, setViewMode] = useState<ViewMode>('browse');
  const [activeTopic, setActiveTopic] = useState<ExplorerTopic | null>(null);
  const [factIndex, setFactIndex] = useState(0);

  // Quiz state
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [quizTotal, setQuizTotal] = useState(0);

  if (!currentPlayer) return <Navigate to="/" replace />;

  // Filtered topics
  const filteredTopics = useMemo(() => {
    if (activeCategory === 'all') return explorerTopics;
    return explorerTopics.filter((t) => t.category === activeCategory);
  }, [activeCategory]);

  // Cancel speech on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Speak the current fact when it changes
  useEffect(() => {
    if (viewMode === 'explore' && activeTopic) {
      const fact = activeTopic.facts[factIndex];
      if (fact) {
        speak(fact.text);
      }
    }
  }, [viewMode, activeTopic, factIndex, speak]);

  // Start exploring a topic
  const startExploring = useCallback((topic: ExplorerTopic) => {
    setActiveTopic(topic);
    setFactIndex(0);
    setViewMode('explore');
  }, []);

  // Advance to next fact or quiz
  const nextFact = useCallback(async () => {
    if (!activeTopic) return;

    // Record fact read
    await readFact(activeTopic.id, factIndex);

    if (factIndex < activeTopic.facts.length - 1) {
      setFactIndex(factIndex + 1);
    } else {
      // All facts read, move to quiz
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (activeTopic.quizQuestions.length > 0) {
        setQuizIndex(0);
        setQuizAnswer(null);
        setCorrectCount(0);
        setQuizTotal(activeTopic.quizQuestions.length);
        setViewMode('quiz');
      } else {
        // No quiz, just complete
        await completeQuiz(activeTopic.id, 100);
        setViewMode('complete');
      }
    }
  }, [activeTopic, factIndex, readFact, completeQuiz]);

  // Previous fact
  const prevFact = useCallback(() => {
    if (factIndex > 0) {
      setFactIndex(factIndex - 1);
    }
  }, [factIndex]);

  // Handle quiz answer
  const handleQuizAnswer = useCallback(
    (answer: string) => {
      if (!activeTopic || quizAnswer !== null) return;
      setQuizAnswer(answer);

      const question = activeTopic.quizQuestions[quizIndex];
      if (answer === question.correct) {
        setCorrectCount((prev) => prev + 1);
        playCorrect();
      } else {
        playTryAgain();
      }
    },
    [activeTopic, quizIndex, quizAnswer, playCorrect, playTryAgain]
  );

  // Next quiz question or complete
  const nextQuizQuestion = useCallback(async () => {
    if (!activeTopic) return;

    if (quizIndex < activeTopic.quizQuestions.length - 1) {
      setQuizIndex(quizIndex + 1);
      setQuizAnswer(null);
    } else {
      // Quiz done
      const score = Math.round(
        ((correctCount + (quizAnswer === activeTopic.quizQuestions[quizIndex].correct ? 1 : 0)) /
          quizTotal) *
          100
      );
      await completeQuiz(activeTopic.id, score);
      playCelebration();
      setViewMode('complete');
    }
  }, [activeTopic, quizIndex, correctCount, quizAnswer, quizTotal, completeQuiz, playCelebration]);

  // Back to browse
  const backToBrowse = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setActiveTopic(null);
    setViewMode('browse');
    setFactIndex(0);
    setQuizIndex(0);
    setQuizAnswer(null);
    setCorrectCount(0);
  }, []);

  // ── BROWSE VIEW ──
  if (viewMode === 'browse') {
    return (
      <div className="min-h-dvh bg-[#FFF8F0] px-4 pt-4 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <NavButton onClick={() => navigate('/menu')} direction="back" />
          <h2 className="text-xl font-extrabold tracking-tight" style={{ color: '#4ECDC4' }}>Discover the World 🌍</h2>
          <div className="w-14" />
        </div>

        {/* Category filter */}
        <div className="mb-5">
          <CategoryFilterBar
            categories={explorerCategories.map((c) => ({
              key: c.key,
              label: c.label,
              emoji: c.emoji,
            }))}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        </div>

        {/* Topic grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            className="grid grid-cols-2 gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {filteredTopics.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-5xl mb-3">🌍</p>
                <p className="font-medium" style={{ color: '#6B6B7B' }}>No topics found</p>
                <p className="text-sm mt-1" style={{ color: '#9B9BAB' }}>Try a different category</p>
              </div>
            ) : (
              filteredTopics.map((topic, i) => {
                const progress = getTopicProgress(topic.id);
                const completed = isTopicCompleted(topic.id);
                const factsRead = progress?.factsRead ?? 0;
                const totalFacts = topic.facts.length;
                const progressPercent = totalFacts > 0 ? (factsRead / totalFacts) * 100 : 0;

                return (
                  <motion.button
                    key={topic.id}
                    className="rounded-[20px] p-4 text-left cursor-pointer relative overflow-hidden"
                    style={{ backgroundColor: '#FFFFFF', border: '1px solid #F0EAE0', boxShadow: '0 2px 12px rgba(45,45,58,0.06)' }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => startExploring(topic)}
                  >
                    {/* Completed badge */}
                    {completed && (
                      <span className="absolute top-2 right-2 text-lg">✅</span>
                    )}

                    <span className="text-4xl block mb-2">{topic.emoji}</span>
                    <h3 className="font-bold text-sm leading-tight mb-1" style={{ color: '#2D2D3A' }}>
                      {topic.title}
                    </h3>
                    <span className="text-xs" style={{ color: '#9B9BAB' }}>
                      Ages {topic.ageGroup}
                    </span>

                    {/* Progress bar */}
                    <div className="mt-2.5 w-full rounded-full h-3" style={{ backgroundColor: '#F0EAE0' }}>
                      <div
                        className="h-3 rounded-full transition-all bg-gradient-to-r from-[#4ECDC4] to-[#6BCB77]"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <p className="text-[10px] mt-1" style={{ color: '#9B9BAB' }}>
                      {factsRead}/{totalFacts} facts
                    </p>
                  </motion.button>
                );
              })
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // ── EXPLORE VIEW (fact cards) ──
  if (viewMode === 'explore' && activeTopic) {
    const fact = activeTopic.facts[factIndex];
    const totalFacts = activeTopic.facts.length;
    const progressPercent = ((factIndex + 1) / totalFacts) * 100;

    return (
      <div className="min-h-dvh bg-[#FFF8F0] flex flex-col">
        {/* Header */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center justify-between mb-3">
            <NavButton onClick={backToBrowse} direction="back" />
            <h3 className="text-sm font-bold truncate mx-3 flex-1 text-center" style={{ color: '#2D2D3A' }}>
              {activeTopic.title}
            </h3>
            <div className="w-14" />
          </div>

          {/* Progress bar */}
          <div className="w-full rounded-full h-3" style={{ backgroundColor: '#F0EAE0' }}>
            <motion.div
              className="h-3 rounded-full bg-gradient-to-r from-[#4ECDC4] to-[#6BCB77]"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-xs text-center mt-1.5" style={{ color: '#9B9BAB' }}>
            Fact {factIndex + 1} of {totalFacts}
          </p>
        </div>

        {/* Fact card */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={factIndex}
              className="rounded-[24px] p-8 text-center max-w-sm w-full"
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #F0EAE0', boxShadow: '0 4px 24px rgba(45,45,58,0.08)' }}
              initial={{ opacity: 0, x: 80 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -80 }}
              transition={{ duration: 0.3 }}
            >
              <motion.span
                className="text-7xl block mb-6"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15, type: 'spring' }}
              >
                {fact.emoji}
              </motion.span>
              <motion.p
                className="text-xl leading-relaxed font-medium"
                style={{ color: '#2D2D3A' }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {fact.text}
              </motion.p>
            </motion.div>
          </AnimatePresence>

          {/* TTS replay button */}
          <motion.button
            className="mt-5 flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm cursor-pointer"
            style={{ backgroundColor: '#FFFFFF', color: '#2D2D3A', border: '1px solid #F0EAE0', boxShadow: '0 2px 12px rgba(45,45,58,0.06)' }}
            onClick={() => speak(fact.text)}
            whileTap={{ scale: 0.95 }}
          >
            🔊 Listen Again
          </motion.button>
        </div>

        {/* Navigation */}
        <div className="px-4 pb-4 pt-2">
          <div className="flex items-center justify-between">
            <NavButton
              onClick={prevFact}
              direction="prev"
              disabled={factIndex === 0}
            />

            {/* Fact dots */}
            <div className="flex gap-1.5 flex-wrap justify-center max-w-[200px]">
              {activeTopic.facts.map((_, idx) => (
                <div
                  key={idx}
                  className="w-2.5 h-2.5 rounded-full transition-colors"
                  style={{
                    backgroundColor: idx === factIndex
                      ? '#4ECDC4'
                      : idx < factIndex
                      ? 'rgba(78,205,196,0.4)'
                      : '#E8E0D4',
                  }}
                />
              ))}
            </div>

            <NavButton onClick={nextFact} direction="next" />
          </div>
        </div>
      </div>
    );
  }

  // ── QUIZ VIEW ──
  if (viewMode === 'quiz' && activeTopic) {
    const question = activeTopic.quizQuestions[quizIndex];

    return (
      <div className="min-h-dvh bg-[#FFF8F0] px-4 pt-4 pb-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <NavButton onClick={backToBrowse} direction="back" />
          <h2 className="text-lg font-extrabold" style={{ color: '#2D2D3A' }}>
            Quiz: {activeTopic.title}
          </h2>
        </div>

        <p className="text-sm text-center mb-3" style={{ color: '#9B9BAB' }}>
          Question {quizIndex + 1} of {activeTopic.quizQuestions.length}
        </p>

        <motion.div
          className="rounded-[24px] p-6 mb-6"
          style={{ backgroundColor: '#FFFFFF', border: '1px solid #F0EAE0', boxShadow: '0 4px 24px rgba(45,45,58,0.08)' }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="text-5xl text-center mb-4">{activeTopic.emoji}</div>
          <h3 className="font-bold text-lg text-center mb-6" style={{ color: '#2D2D3A' }}>
            {question.question}
          </h3>

          <div className="flex flex-col gap-3">
            {question.options.map((option) => {
              let btnStyle: React.CSSProperties = { backgroundColor: '#FAFAF8', color: '#2D2D3A', border: '1px solid #F0EAE0' };
              if (quizAnswer !== null) {
                if (option === question.correct) {
                  btnStyle = { backgroundColor: '#EDFAEF', color: '#6BCB77', border: '2px solid #6BCB77', boxShadow: '0 2px 12px rgba(107,203,119,0.2)' };
                } else if (option === quizAnswer && option !== question.correct) {
                  btnStyle = { backgroundColor: '#FFF0F0', color: '#FF6B6B', border: '2px solid #FF6B6B', boxShadow: '0 2px 12px rgba(255,107,107,0.2)' };
                }
              }

              return (
                <motion.button
                  key={option}
                  className="w-full p-4 rounded-[14px] font-bold text-sm cursor-pointer transition-colors"
                  style={btnStyle}
                  onClick={() => handleQuizAnswer(option)}
                  whileTap={{ scale: 0.97 }}
                  disabled={quizAnswer !== null}
                >
                  {option}
                </motion.button>
              );
            })}
          </div>

          {quizAnswer !== null && (
            <motion.div
              className="mt-5 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-sm font-bold mb-4">
                {quizAnswer === question.correct ? (
                  <span style={{ color: '#6BCB77' }}>Correct! Great job!</span>
                ) : (
                  <span style={{ color: '#FF6B6B' }}>
                    Not quite! The answer is: {question.correct}
                  </span>
                )}
              </p>
              <motion.button
                className="text-white font-bold py-2.5 px-7 rounded-[14px] cursor-pointer bg-gradient-to-r from-[#4ECDC4] to-[#6DD5CB]"
                style={{ boxShadow: '0 4px 20px rgba(78,205,196,0.25)' }}
                onClick={nextQuizQuestion}
                whileTap={{ scale: 0.95 }}
              >
                {quizIndex < activeTopic.quizQuestions.length - 1
                  ? 'Next Question'
                  : 'See Results'}
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </div>
    );
  }

  // ── COMPLETE VIEW ──
  if (viewMode === 'complete' && activeTopic) {
    const finalScore =
      quizTotal > 0
        ? Math.round((correctCount / quizTotal) * 100)
        : 100;

    return (
      <div className="min-h-dvh bg-[#FFF8F0] flex items-center justify-center px-4 pt-4 pb-8">
        <CompletionSummary
          emoji={activeTopic.emoji}
          title="Topic Complete!"
          message={`You explored "${activeTopic.title}" and learned ${activeTopic.facts.length} amazing facts!${
            quizTotal > 0 ? ` Quiz score: ${finalScore}%` : ''
          }`}
          starsEarned={1}
          onContinue={backToBrowse}
          continueLabel="Explore More"
        />
      </div>
    );
  }

  // Fallback
  return <Navigate to="/menu" replace />;
}
