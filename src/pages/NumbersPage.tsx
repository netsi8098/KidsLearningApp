import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Navigate } from 'react-router-dom';
import { numbersData } from '../data/numbersData';
import { useApp } from '../context/AppContext';
import { useProgress } from '../hooks/useProgress';
import { useAudio } from '../hooks/useAudio';
import { useBadges } from '../hooks/useBadges';
import { useSwipe } from '../hooks/useSwipe';
import NavButton from '../components/NavButton';
import ProgressDots from '../components/ProgressDots';
import StarCounter from '../components/StarCounter';
import SectionComplete from '../components/SectionComplete';
import AnimatedBackground from '../components/svg/AnimatedBackground';

export default function NumbersPage() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [tapped, setTapped] = useState(0);
  const { currentPlayer } = useApp();
  const { recordActivity } = useProgress(currentPlayer?.id);
  const { checkAndAwardBadges } = useBadges(currentPlayer?.id);
  const { speak, playClick, playCelebration } = useAudio();

  const mounted = useRef(false);

  const item = numbersData[index];

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      setTimeout(() => {
        speak(`${numbersData[0].number}. ${numbersData[0].word}`);
        recordActivity('numbers', String(numbersData[0].number), true);
        checkAndAwardBadges(currentPlayer?.totalStars ?? 0);
      }, 500);
    }
  }, []);

  const swipeHandlers = useSwipe({
    onSwipeLeft: () => { if (index < numbersData.length) handleNavigate(index + 1); },
    onSwipeRight: () => { if (index > 0) handleNavigate(index - 1); },
  });

  if (!currentPlayer) return <Navigate to="/" replace />;

  function handleNavigate(newIndex: number) {
    if (newIndex >= numbersData.length) {
      playCelebration();
      setCompleted(true);
      return;
    }
    playClick();
    setIndex(newIndex);
    setTapped(0);
    const newItem = numbersData[newIndex];
    speak(`${newItem.number}. ${newItem.word}`);
    recordActivity('numbers', String(newItem.number), true);
    checkAndAwardBadges(currentPlayer?.totalStars ?? 0);
  }

  function handleTapEmoji() {
    if (tapped < item.number) {
      playClick();
      const next = tapped + 1;
      setTapped(next);
      speak(String(next));
      if (next === item.number) {
        speak(`${item.word}! Great counting!`);
      }
    }
  }

  if (completed) {
    return (
      <SectionComplete
        title="all the Numbers"
        emoji="🔢"
        color="#4ECDC4"
        onStartOver={() => { setIndex(0); setTapped(0); setCompleted(false); }}
      />
    );
  }

  return (
    <div className="min-h-dvh px-4 pt-4 pb-8 md:px-8 md:pt-6 flex flex-col relative page-with-bg">
      <AnimatedBackground theme="numbers" />
      <div className="flex items-center justify-between mb-5 md:max-w-xl md:mx-auto md:w-full">
        <NavButton onClick={() => navigate('/menu')} direction="back" />
        <h2 className="text-xl font-extrabold tracking-tight text-[#4ECDC4] md:text-2xl">Numbers</h2>
        <StarCounter />
      </div>

      <ProgressDots total={numbersData.length} current={index} color="#4ECDC4" />

      <div className="flex-1 flex items-center justify-center" {...swipeHandlers}>
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            className="text-center"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
          >
            <motion.div
              className="w-36 h-36 sm:w-44 sm:h-44 md:w-56 md:h-56 rounded-full mx-auto mb-4 flex items-center justify-center bg-[#EDFAF8] shadow-[0_4px_20px_rgba(78,205,196,0.25)] border border-[#F0EAE0]"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-7xl sm:text-8xl font-extrabold text-[#4ECDC4]">
                {item.number}
              </span>
            </motion.div>
            <p className="text-2xl font-bold mb-4 text-[#2D2D3A]">{item.word}</p>
            <div
              className="flex flex-wrap gap-3 justify-center max-w-xs mx-auto mb-4 rounded-[20px] p-4 bg-white/70 border border-[#F0EAE0] shadow-[0_2px_12px_rgba(45,45,58,0.06)]"
            >
              {Array.from({ length: item.number }).map((_, i) => (
                <motion.button
                  key={i}
                  className="text-3xl cursor-pointer bg-transparent border-none"
                  onClick={handleTapEmoji}
                  initial={{ scale: 0 }}
                  animate={{
                    scale: i < tapped ? 1.2 : 0.85,
                    opacity: i < tapped ? 1 : 0.6,
                  }}
                  transition={{ type: 'spring', delay: i * 0.03 }}
                  whileTap={{ scale: 1.3 }}
                >
                  {item.emoji}
                </motion.button>
              ))}
            </div>
            <p className="text-lg text-[#6B6B7B]">
              {tapped === item.number ? (
                <motion.span
                  className="font-bold text-[#4ECDC4]"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  ✅ You counted to {item.number}!
                </motion.span>
              ) : (
                <>Tap to count! {tapped}/{item.number}</>
              )}
            </p>
            <motion.button
              className="mt-4 text-white rounded-[14px] px-7 py-2.5 font-bold cursor-pointer bg-gradient-to-r from-[#4ECDC4] to-[#6DD5CB] shadow-[0_4px_20px_rgba(78,205,196,0.25)]"
              onClick={() => speak(`${item.number}. ${item.word}`)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🔊 Hear it!
            </motion.button>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-between items-center mt-5 pb-2 md:max-w-xl md:mx-auto md:w-full md:gap-8">
        <NavButton onClick={() => handleNavigate(index - 1)} direction="prev" disabled={index === 0} />
        <NavButton onClick={() => handleNavigate(index + 1)} direction="next" disabled={false} />
      </div>
    </div>
  );
}
