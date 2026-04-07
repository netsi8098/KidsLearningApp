import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAssessment } from '../hooks/useAssessment';
import { assessmentAreas } from '../data/assessmentQuestions';
import NavButton from '../components/NavButton';
import AssessmentQuestion from '../components/AssessmentQuestion';

type Phase = 'welcome' | 'questions' | 'results' | 'parent-summary';

export default function AssessmentPage() {
  const navigate = useNavigate();
  const { currentPlayer } = useApp();
  const {
    isActive,
    currentQuestion,
    currentIndex,
    totalQuestions,
    answerQuestion,
    startAssessment,
    getResults,
    saveResults,
    isComplete,
  } = useAssessment(currentPlayer?.id);

  const [phase, setPhase] = useState<Phase>('welcome');
  const [saved, setSaved] = useState(false);

  if (!currentPlayer) return <Navigate to="/" replace />;

  // ── Progress bar percent ──
  const progressPct =
    totalQuestions > 0 ? ((currentIndex) / totalQuestions) * 100 : 0;

  // ── Handlers ──
  function handleStart() {
    startAssessment();
    setPhase('questions');
  }

  function handleAnswer(answer: string) {
    answerQuestion(answer);

    // Check if that was the last question
    // (currentIndex is still the old index; answer advances it internally)
    if (currentIndex + 1 >= totalQuestions) {
      setTimeout(() => setPhase('results'), 500);
    }
  }

  async function handleSave() {
    await saveResults();
    setSaved(true);
  }

  function handleViewParentSummary() {
    setPhase('parent-summary');
  }

  // ── Results data ──
  const results = isComplete ? getResults() : [];
  const totalScore = results.reduce((s, r) => s + r.score, 0);
  const totalPossible = results.reduce((s, r) => s + r.total, 0);
  const overallPct =
    totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;

  let overallLevel: string;
  if (overallPct >= 75) overallLevel = 'Advanced';
  else if (overallPct >= 50) overallLevel = 'Intermediate';
  else overallLevel = 'Beginner';

  const levelEmoji =
    overallLevel === 'Advanced'
      ? '🏆'
      : overallLevel === 'Intermediate'
        ? '🌟'
        : '🌱';

  // ── RENDER: Welcome ──
  if (phase === 'welcome') {
    return (
      <div className="min-h-dvh bg-[#FFF8F0] px-4 pt-4 pb-8 flex flex-col">
        <div className="flex items-center justify-between mb-5">
          <NavButton onClick={() => navigate('/menu')} direction="back" />
          <h2 className="text-xl font-extrabold text-[#2D2D3A]">Getting Started</h2>
          <div className="w-14" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center max-w-sm mx-auto text-center">
          <motion.div
            className="text-8xl mb-6"
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🧠
          </motion.div>

          <motion.h1
            className="text-2xl font-extrabold text-[#2D2D3A] mb-3"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            Let's see what you know!
          </motion.h1>

          <motion.p
            className="text-[#6B6B7B] mb-2 leading-relaxed"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            Answer some fun questions about letters, numbers, colors, shapes,
            and more!
          </motion.p>

          <motion.p
            className="text-sm text-[#9B9BAB] mb-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            {totalQuestions} questions - takes about 5 minutes
          </motion.p>

          <motion.button
            className="bg-gradient-to-r from-[#4ECDC4] to-[#6DD5CB] text-white rounded-[14px] px-10 py-4 text-xl font-bold shadow-[0_4px_20px_rgba(78,205,196,0.25)] cursor-pointer"
            onClick={handleStart}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.25 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start!
          </motion.button>
        </div>
      </div>
    );
  }

  // ── RENDER: Questions ──
  if (phase === 'questions' && currentQuestion) {
    return (
      <div className="min-h-dvh bg-[#FFF8F0] px-4 pt-4 pb-8 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <NavButton
            onClick={() => {
              setPhase('welcome');
            }}
            direction="back"
          />
          <span className="text-sm font-bold text-[#6B6B7B]">
            Question {currentIndex + 1}/{totalQuestions}
          </span>
          <div className="w-14" />
        </div>

        {/* Progress bar */}
        <div className="w-full bg-[#F0EAE0] rounded-full h-3 mb-6">
          <motion.div
            className="bg-gradient-to-r from-[#4ECDC4] to-[#6DD5CB] h-3 rounded-full"
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Question */}
        <div className="flex-1 flex items-center justify-center">
          <AssessmentQuestion
            question={currentQuestion.question}
            emoji={currentQuestion.emoji}
            options={currentQuestion.options}
            onAnswer={handleAnswer}
            questionNumber={currentIndex + 1}
            totalQuestions={totalQuestions}
          />
        </div>
      </div>
    );
  }

  // ── RENDER: Results ──
  if (phase === 'results') {
    return (
      <div className="min-h-dvh bg-[#FFF8F0] px-4 pt-4 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <NavButton onClick={() => navigate('/menu')} direction="back" />
          <h2 className="text-xl font-extrabold text-[#2D2D3A]">Your Results</h2>
          <div className="w-14" />
        </div>

        <div className="max-w-md mx-auto">
          {/* Overall score + level */}
          <motion.div
            className="text-center mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 12 }}
          >
            <span className="text-7xl block mb-2">{levelEmoji}</span>
            <h1 className="text-2xl font-extrabold text-[#2D2D3A] mb-1">
              Great Job!
            </h1>
            <p className="text-lg text-[#6B6B7B] mb-2">
              You scored{' '}
              <span className="font-bold text-[#4ECDC4]">
                {totalScore}/{totalPossible}
              </span>{' '}
              ({overallPct}%)
            </p>
            <motion.span
              className="inline-block bg-[#EDFAF8] text-[#4ECDC4] rounded-full px-5 py-2 font-bold text-sm"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
            >
              Level: {overallLevel}
            </motion.span>
          </motion.div>

          {/* Per-area bar charts */}
          <div className="bg-white rounded-[20px] shadow-[0_2px_12px_rgba(45,45,58,0.06)] border border-[#F0EAE0] p-5 mb-6">
            <h3 className="text-[13px] font-extrabold text-[#6B6B7B] uppercase tracking-wider mb-4">
              Score by Area
            </h3>
            <div className="flex flex-col gap-4">
              {results.map((r, i) => {
                const areaInfo = assessmentAreas.find(
                  (a) => a.key === r.area,
                );
                const pct =
                  r.total > 0 ? Math.round((r.score / r.total) * 100) : 0;

                return (
                  <motion.div
                    key={r.area}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 + i * 0.08 }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-[#2D2D3A]">
                        {areaInfo?.emoji} {areaInfo?.label ?? r.area}
                      </span>
                      <span className="text-xs font-bold text-[#9B9BAB]">
                        {r.score}/{r.total} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#F0EAE0] rounded-full h-3">
                      <motion.div
                        className="h-3 rounded-full"
                        style={{
                          backgroundColor: areaInfo?.color ?? '#4ECDC4',
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{
                          duration: 0.6,
                          delay: 0.3 + i * 0.1,
                          ease: 'easeOut',
                        }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3">
            <motion.button
              className="w-full bg-gradient-to-r from-[#4ECDC4] to-[#6DD5CB] text-white rounded-[14px] py-4 font-bold text-lg shadow-[0_4px_20px_rgba(78,205,196,0.25)] cursor-pointer"
              onClick={handleViewParentSummary}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              View Parent Summary
            </motion.button>
            <motion.button
              className="w-full bg-white border border-[#F0EAE0] text-[#6B6B7B] rounded-[14px] py-3 font-bold shadow-[0_2px_12px_rgba(45,45,58,0.06)] cursor-pointer"
              onClick={() => navigate('/menu')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Back to Menu
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  // ── RENDER: Parent Summary ──
  if (phase === 'parent-summary') {
    return (
      <div className="min-h-dvh bg-[#FFF8F0] px-4 pt-4 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <NavButton
            onClick={() => setPhase('results')}
            direction="back"
          />
          <h2 className="text-xl font-extrabold text-[#2D2D3A]">
            Parent Summary
          </h2>
          <div className="w-14" />
        </div>

        <div className="max-w-md mx-auto">
          {/* Summary card */}
          <motion.div
            className="bg-white rounded-[20px] shadow-[0_2px_12px_rgba(45,45,58,0.06)] border border-[#F0EAE0] p-5 mb-5"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">{currentPlayer.avatarEmoji}</span>
              <div>
                <p className="font-bold text-[#2D2D3A]">
                  {currentPlayer.name}'s Assessment
                </p>
                <p className="text-sm text-[#6B6B7B]">
                  Overall: {overallPct}% - {overallLevel}
                </p>
              </div>
            </div>

            <div className="border-t border-[#F0EAE0] pt-4">
              <h4 className="text-[13px] font-extrabold text-[#6B6B7B] uppercase tracking-wider mb-3">
                Detailed Breakdown
              </h4>

              {results.map((r) => {
                const areaInfo = assessmentAreas.find(
                  (a) => a.key === r.area,
                );
                const pct =
                  r.total > 0
                    ? Math.round((r.score / r.total) * 100)
                    : 0;

                const levelLabel =
                  r.suggestedLevel === 'advanced'
                    ? 'Advanced'
                    : r.suggestedLevel === 'intermediate'
                      ? 'Intermediate'
                      : 'Beginner';

                const levelColor =
                  r.suggestedLevel === 'advanced'
                    ? 'text-green-600 bg-green-50'
                    : r.suggestedLevel === 'intermediate'
                      ? 'text-amber-600 bg-amber-50'
                      : 'text-blue-600 bg-blue-50';

                return (
                  <div
                    key={r.area}
                    className="flex items-center justify-between py-2.5 border-b border-[#F0EAE0] last:border-b-0"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{areaInfo?.emoji}</span>
                      <div>
                        <p className="text-sm font-bold text-[#2D2D3A]">
                          {areaInfo?.label ?? r.area}
                        </p>
                        <p className="text-xs text-[#9B9BAB]">
                          {r.score}/{r.total} correct ({pct}%)
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-bold rounded-full px-3 py-1 ${levelColor}`}
                    >
                      {levelLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Recommendations */}
          <motion.div
            className="bg-white rounded-[20px] shadow-[0_2px_12px_rgba(45,45,58,0.06)] border border-[#F0EAE0] p-5 mb-5"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <h4 className="text-[13px] font-extrabold text-[#6B6B7B] uppercase tracking-wider mb-3">
              Recommendations
            </h4>
            {results
              .filter((r) => r.suggestedLevel === 'beginner')
              .map((r) => {
                const areaInfo = assessmentAreas.find(
                  (a) => a.key === r.area,
                );
                return (
                  <p key={r.area} className="text-sm text-[#6B6B7B] mb-2">
                    {areaInfo?.emoji} Practice more{' '}
                    <span className="font-bold text-[#2D2D3A]">
                      {areaInfo?.label ?? r.area}
                    </span>{' '}
                    activities to build confidence.
                  </p>
                );
              })}
            {results.filter((r) => r.suggestedLevel === 'beginner')
              .length === 0 && (
              <p className="text-sm text-[#6B6B7B]">
                Great progress across all areas! Keep it up!
              </p>
            )}
          </motion.div>

          {/* Save button */}
          <motion.button
            className={`w-full rounded-[14px] py-4 font-bold text-lg cursor-pointer transition-colors ${
              saved
                ? 'bg-[#6BCB77] text-white shadow-[0_4px_20px_rgba(107,203,119,0.25)]'
                : 'bg-gradient-to-r from-[#4ECDC4] to-[#6DD5CB] text-white shadow-[0_4px_20px_rgba(78,205,196,0.25)]'
            }`}
            onClick={handleSave}
            disabled={saved}
            whileHover={!saved ? { scale: 1.02 } : undefined}
            whileTap={!saved ? { scale: 0.98 } : undefined}
          >
            {saved ? 'Saved!' : 'Save Results'}
          </motion.button>

          <motion.button
            className="w-full bg-white border border-[#F0EAE0] text-[#6B6B7B] rounded-[14px] py-3 font-bold shadow-[0_2px_12px_rgba(45,45,58,0.06)] cursor-pointer mt-3"
            onClick={() => navigate('/menu')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Back to Menu
          </motion.button>
        </div>
      </div>
    );
  }

  // Fallback (shouldn't reach here)
  return <Navigate to="/menu" replace />;
}
