import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useMoodCheckIn } from '../hooks/useMoodCheckIn';
import { useLifeSkills } from '../hooks/useLifeSkills';
import { emotionsData, type Emotion } from '../data/emotionsData';
import { lifeSkillsData, lifeSkillTopics } from '../data/lifeSkillsData';
import NavButton from '../components/NavButton';
import EmotionPicker from '../components/EmotionPicker';
import ContentCard from '../components/ContentCard';
import CategoryFilterBar from '../components/CategoryFilterBar';
import AnimatedBackground from '../components/svg/AnimatedBackground';

type SectionView = 'checkin' | 'explorer' | 'skills';

export default function EmotionsPage() {
  const navigate = useNavigate();
  const { currentPlayer } = useApp();
  const playerId = currentPlayer?.id;
  const { checkIn, todayMood } = useMoodCheckIn(playerId);
  const { isSkillCompleted, markSkillCompleted, getCompletedCount } = useLifeSkills(playerId);

  // Check-in state
  const [selectedMood, setSelectedMood] = useState<string | undefined>(todayMood?.mood);
  const [showTip, setShowTip] = useState(false);

  // Explorer state
  const [explorerEmotion, setExplorerEmotion] = useState<Emotion | null>(null);

  // Life skills filter
  const [activeTopic, setActiveTopic] = useState('all');

  // Active skill detail
  const [activeSkill, setActiveSkill] = useState<(typeof lifeSkillsData)[number] | null>(null);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);

  // Section toggle
  const [section, setSection] = useState<SectionView>('checkin');

  if (!currentPlayer) return <Navigate to="/" replace />;

  // Filtered life skills
  const filteredSkills = useMemo(() => {
    if (activeTopic === 'all') return lifeSkillsData;
    return lifeSkillsData.filter((s) => s.topic === activeTopic);
  }, [activeTopic]);

  // Handle mood selection and check-in
  const handleMoodSelect = async (mood: string) => {
    setSelectedMood(mood);
    setShowTip(true);
    await checkIn(mood);
  };

  // Get the emotion data for the selected mood
  const selectedEmotionData = selectedMood
    ? emotionsData.find((e) => e.key === selectedMood)
    : null;

  // Handle quiz answer
  const handleQuizAnswer = async (answerIdx: number) => {
    if (!activeSkill || quizAnswer !== null) return;
    setQuizAnswer(answerIdx);
    const quiz = activeSkill.quiz?.[quizIndex];
    if (quiz && answerIdx === quiz.correct) {
      // If last quiz question or no more, mark as complete
      if (!activeSkill.quiz || quizIndex >= activeSkill.quiz.length - 1) {
        await markSkillCompleted(activeSkill.id, 100);
      }
    }
  };

  // Move to next quiz question or close
  const handleQuizNext = () => {
    if (!activeSkill?.quiz) return;
    if (quizIndex < activeSkill.quiz.length - 1) {
      setQuizIndex(quizIndex + 1);
      setQuizAnswer(null);
    } else {
      setActiveSkill(null);
      setQuizIndex(0);
      setQuizAnswer(null);
    }
  };

  // ── Skill Detail Overlay ──
  if (activeSkill) {
    const quiz = activeSkill.quiz?.[quizIndex];
    return (
      <div className="min-h-dvh px-4 pt-4 pb-8 relative page-with-bg">
      <AnimatedBackground theme="wellbeing" />
        <div className="flex items-center gap-3 mb-6">
          <NavButton
            onClick={() => {
              setActiveSkill(null);
              setQuizIndex(0);
              setQuizAnswer(null);
            }}
            direction="back"
          />
          <h2 className="text-lg font-extrabold text-[#2D2D3A] truncate">{activeSkill.title}</h2>
        </div>

        <motion.div
          className="bg-white rounded-[20px] shadow-[0_2px_12px_rgba(45,45,58,0.06)] border border-[#F0EAE0] p-6 mb-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="text-5xl text-center mb-4">{activeSkill.emoji}</div>
          <p className="text-[#6B6B7B] text-base leading-relaxed text-center">
            {activeSkill.content}
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="text-xs font-bold bg-[#F3EFFE] text-[#A78BFA] rounded-full px-3 py-1">
              {activeSkill.contentType}
            </span>
            <span className="text-xs font-bold bg-[#EDFAF8] text-[#4ECDC4] rounded-full px-3 py-1">
              {activeSkill.ageGroup === 'all' ? 'All Ages' : `Ages ${activeSkill.ageGroup}`}
            </span>
          </div>
        </motion.div>

        {/* Quiz section */}
        {quiz && (
          <motion.div
            className="bg-white rounded-[20px] shadow-[0_2px_12px_rgba(45,45,58,0.06)] border border-[#F0EAE0] p-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            <h3 className="font-bold text-[#2D2D3A] mb-4 text-center">{quiz.question}</h3>
            <div className="flex flex-col gap-3">
              {quiz.options.map((option, idx) => {
                let btnClass = 'bg-[#FFF8F0] text-[#2D2D3A] border border-[#F0EAE0]';
                if (quizAnswer !== null) {
                  if (idx === quiz.correct) {
                    btnClass = 'bg-[#EDFAEF] text-[#6BCB77] ring-2 ring-[#6BCB77]';
                  } else if (idx === quizAnswer && idx !== quiz.correct) {
                    btnClass = 'bg-[#FFF0F0] text-[#FF6B6B] ring-2 ring-[#FF6B6B]';
                  }
                }
                return (
                  <motion.button
                    key={idx}
                    className={`w-full p-4 rounded-[14px] font-bold text-sm cursor-pointer transition-colors ${btnClass}`}
                    onClick={() => handleQuizAnswer(idx)}
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
                className="mt-4 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="text-sm font-bold mb-3">
                  {quizAnswer === quiz.correct ? (
                    <span className="text-leaf">Correct! Great job!</span>
                  ) : (
                    <span className="text-coral">
                      Not quite! The answer is: {quiz.options[quiz.correct]}
                    </span>
                  )}
                </p>
                <motion.button
                  className="bg-teal text-white font-bold py-2.5 px-6 rounded-full cursor-pointer"
                  onClick={handleQuizNext}
                  whileTap={{ scale: 0.95 }}
                >
                  {activeSkill.quiz && quizIndex < activeSkill.quiz.length - 1
                    ? 'Next Question'
                    : 'Done'}
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Complete button if no quiz */}
        {!activeSkill.quiz && (
          <motion.button
            className="w-full bg-gradient-to-r from-[#4ECDC4] to-[#6DD5CB] text-white font-bold py-3.5 rounded-[14px] shadow-[0_4px_20px_rgba(78,205,196,0.25)] cursor-pointer mt-4"
            onClick={async () => {
              await markSkillCompleted(activeSkill.id, 100);
              setActiveSkill(null);
            }}
            whileTap={{ scale: 0.97 }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            Mark as Complete
          </motion.button>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-dvh px-4 pt-4 pb-8 relative page-with-bg">
      <AnimatedBackground theme="wellbeing" />
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <NavButton onClick={() => navigate('/menu')} direction="back" />
        <h2 className="text-xl font-extrabold text-[#A78BFA]">Emotions & Life Skills</h2>
        <div className="w-14" />
      </div>

      {/* Section Tabs */}
      <div className="flex gap-2 mb-5">
        {(
          [
            { key: 'checkin', label: 'How I Feel', emoji: '💭' },
            { key: 'explorer', label: 'Explore', emoji: '🔍' },
            { key: 'skills', label: 'Life Skills', emoji: '🌟' },
          ] as const
        ).map((tab) => (
          <motion.button
            key={tab.key}
            className={`flex-1 py-2.5 rounded-full font-bold text-sm cursor-pointer transition-all ${
              section === tab.key
                ? 'bg-gradient-to-r from-[#A78BFA] to-[#C4B5FD] text-white shadow-[0_4px_16px_rgba(167,139,250,0.25)]'
                : 'bg-white text-[#6B6B7B] shadow-[0_2px_12px_rgba(45,45,58,0.06)] border border-[#F0EAE0]'
            }`}
            onClick={() => setSection(tab.key)}
            whileTap={{ scale: 0.95 }}
          >
            {tab.emoji} {tab.label}
          </motion.button>
        ))}
      </div>

      {/* ── Section 1: How Are You Feeling? ── */}
      {section === 'checkin' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h3 className="text-lg font-bold text-[#2D2D3A] mb-3 text-center">
            How are you feeling?
          </h3>

          <EmotionPicker onSelect={handleMoodSelect} selectedMood={selectedMood} />

          {/* Help Tip Card */}
          <AnimatePresence>
            {showTip && selectedEmotionData && (
              <motion.div
                className="mt-5 rounded-2xl p-5 shadow-md"
                style={{ backgroundColor: `${selectedEmotionData.color}20` }}
                initial={{ y: 20, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ type: 'spring', duration: 0.5 }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-4xl">{selectedEmotionData.emoji}</span>
                  <div>
                    <h4
                      className="font-bold text-lg"
                      style={{ color: selectedEmotionData.color }}
                    >
                      {selectedEmotionData.label}
                    </h4>
                    <p className="text-sm text-gray-500">{selectedEmotionData.description}</p>
                  </div>
                </div>
                <div
                  className="mt-3 p-3 rounded-xl"
                  style={{ backgroundColor: `${selectedEmotionData.color}15` }}
                >
                  <p className="text-sm font-medium text-gray-700">
                    {selectedEmotionData.helpTip}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Today's mood badge */}
          {todayMood && !showTip && (
            <motion.div
              className="mt-4 bg-white rounded-[20px] shadow-[0_2px_12px_rgba(45,45,58,0.06)] border border-[#F0EAE0] p-5 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-sm text-[#9B9BAB] mb-1">You checked in today as</p>
              <p className="text-3xl">
                {emotionsData.find((e) => e.key === todayMood.mood)?.emoji ?? '😊'}
              </p>
              <p className="text-sm font-bold text-[#2D2D3A] mt-1">
                {emotionsData.find((e) => e.key === todayMood.mood)?.label ?? todayMood.mood}
              </p>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* ── Section 2: Emotion Explorer ── */}
      {section === 'explorer' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h3 className="text-lg font-bold text-[#2D2D3A] mb-3">Emotion Explorer</h3>
          <p className="text-sm text-[#9B9BAB] mb-4">
            Tap on any emotion to learn more about it!
          </p>

          <div className="grid grid-cols-2 gap-3">
            {emotionsData.map((emotion, i) => (
              <motion.button
                key={emotion.key}
                className="bg-white rounded-[20px] shadow-[0_2px_12px_rgba(45,45,58,0.06)] border border-[#F0EAE0] p-4 text-center cursor-pointer"
                style={
                  explorerEmotion?.key === emotion.key
                    ? { boxShadow: `0 0 0 3px ${emotion.color}` }
                    : undefined
                }
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={() =>
                  setExplorerEmotion(explorerEmotion?.key === emotion.key ? null : emotion)
                }
              >
                <span className="text-4xl block mb-2">{emotion.emoji}</span>
                <span className="font-bold text-sm text-[#2D2D3A]">{emotion.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Explorer Detail Card */}
          <AnimatePresence>
            {explorerEmotion && (
              <motion.div
                className="mt-5 rounded-2xl p-5 shadow-md"
                style={{ backgroundColor: `${explorerEmotion.color}20` }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ type: 'spring', duration: 0.5 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-5xl">{explorerEmotion.emoji}</span>
                  <div>
                    <h4
                      className="font-bold text-xl"
                      style={{ color: explorerEmotion.color }}
                    >
                      {explorerEmotion.label}
                    </h4>
                    <p className="text-sm text-gray-600">{explorerEmotion.description}</p>
                  </div>
                </div>
                <div
                  className="p-3 rounded-xl"
                  style={{ backgroundColor: `${explorerEmotion.color}15` }}
                >
                  <p className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">
                    Helpful Tip
                  </p>
                  <p className="text-sm font-medium text-gray-700">
                    {explorerEmotion.helpTip}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ── Section 3: Life Skills ── */}
      {section === 'skills' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-[#2D2D3A]">Life Skills</h3>
            <span className="text-xs font-bold text-[#4ECDC4] bg-[#EDFAF8] rounded-full px-3.5 py-1.5">
              {getCompletedCount()}/{lifeSkillsData.length} done
            </span>
          </div>

          <CategoryFilterBar
            categories={lifeSkillTopics.map((t) => ({
              key: t.key,
              label: t.label,
              emoji: t.emoji,
            }))}
            activeCategory={activeTopic}
            onCategoryChange={setActiveTopic}
          />

          <div className="flex flex-col gap-3 mt-4">
            {filteredSkills.map((skill, i) => {
              const completed = isSkillCompleted(skill.id);
              return (
                <div key={skill.id} className="relative">
                  <ContentCard
                    emoji={skill.emoji}
                    title={skill.title}
                    subtitle={skill.content.slice(0, 60) + '...'}
                    categoryBadge={
                      skill.ageGroup === 'all' ? 'All Ages' : `Ages ${skill.ageGroup}`
                    }
                    progress={completed ? 100 : 0}
                    onClick={() => {
                      setActiveSkill(skill);
                      setQuizIndex(0);
                      setQuizAnswer(null);
                    }}
                    delay={i * 0.04}
                  />
                  {completed && (
                    <div className="absolute top-3 right-3">
                      <span className="text-lg">✅</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filteredSkills.length === 0 && (
            <div className="text-center py-16">
              <p className="text-5xl mb-3">🌟</p>
              <p className="text-[#6B6B7B] font-bold">No skills in this category</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
