import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Navigate } from 'react-router-dom';
import { alphabetData } from '../data/alphabetData';
import { useApp } from '../context/AppContext';
import { useProgress } from '../hooks/useProgress';
import { useAudio } from '../hooks/useAudio';
import { useBadges } from '../hooks/useBadges';
import { useSwipe } from '../hooks/useSwipe';
import NavButton from '../components/NavButton';
import ProgressDots from '../components/ProgressDots';
import StarCounter from '../components/StarCounter';
import SectionComplete from '../components/SectionComplete';

export default function AbcPage() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const { currentPlayer } = useApp();
  const { recordActivity } = useProgress(currentPlayer?.id);
  const { checkAndAwardBadges } = useBadges(currentPlayer?.id);
  const { speak, playClick, playCelebration } = useAudio();
  const mounted = useRef(false);

  const item = alphabetData[index];
  const isLast = index === alphabetData.length - 1;

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      setTimeout(() => {
        speak(`${alphabetData[0].letter}. ${alphabetData[0].letter} is for ${alphabetData[0].word}`);
        recordActivity('abc', alphabetData[0].letter, true);
        checkAndAwardBadges(currentPlayer?.totalStars ?? 0);
      }, 500);
    }
  }, []);

  function handleNavigate(newIndex: number) {
    if (newIndex >= alphabetData.length) {
      playCelebration();
      setCompleted(true);
      return;
    }
    playClick();
    setIndex(newIndex);
    const newItem = alphabetData[newIndex];
    speak(`${newItem.letter}. ${newItem.letter} is for ${newItem.word}`);
    recordActivity('abc', newItem.letter, true);
    checkAndAwardBadges(currentPlayer?.totalStars ?? 0);
  }

  const swipeHandlers = useSwipe({
    onSwipeLeft: () => { if (index < alphabetData.length) handleNavigate(index + 1); },
    onSwipeRight: () => { if (index > 0) handleNavigate(index - 1); },
  });

  if (!currentPlayer) return <Navigate to="/" replace />;

  if (completed) {
    return (
      <SectionComplete
        title="all the ABCs"
        emoji="🔤"
        color="#FF6B6B"
        onStartOver={() => { setIndex(0); setCompleted(false); }}
      />
    );
  }

  return (
    <div className="min-h-dvh bg-[#FFF8F0] px-4 pt-4 pb-8 md:px-8 md:pt-6 flex flex-col">
      <div className="flex items-center justify-between mb-5 md:max-w-xl md:mx-auto md:w-full">
        <NavButton onClick={() => navigate('/menu')} direction="back" />
        <h2 className="text-xl font-extrabold tracking-tight text-[#FF6B6B] md:text-2xl">ABCs</h2>
        <StarCounter />
      </div>

      <ProgressDots total={alphabetData.length} current={index} color="#FF6B6B" />

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
              className="w-44 h-44 sm:w-52 sm:h-52 md:w-56 md:h-56 rounded-[28px] mx-auto mb-5 flex items-center justify-center bg-[#FFF0F0] shadow-[0_4px_20px_rgba(255,107,107,0.2)] border border-[#F0EAE0]"
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              <span className="text-7xl sm:text-8xl font-extrabold text-[#FF6B6B]">
                {item.upper}{item.lower}
              </span>
            </motion.div>
            <motion.div
              className="text-7xl sm:text-8xl mb-5"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
            >
              {item.emoji}
            </motion.div>
            <p className="text-2xl font-bold text-[#2D2D3A]">
              {item.letter} is for {item.word}
            </p>
            <motion.button
              className="mt-5 text-white rounded-[14px] px-7 py-2.5 font-bold cursor-pointer bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] shadow-[0_4px_20px_rgba(255,107,107,0.25)]"
              onClick={() => speak(`${item.letter}. ${item.letter} is for ${item.word}`)}
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
