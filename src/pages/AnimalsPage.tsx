import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Navigate } from 'react-router-dom';
import { animalsData } from '../data/animalsData';
import { useApp } from '../context/AppContext';
import { useProgress } from '../hooks/useProgress';
import { useAudio } from '../hooks/useAudio';
import { useBadges } from '../hooks/useBadges';
import { useSwipe } from '../hooks/useSwipe';
import NavButton from '../components/NavButton';
import ProgressDots from '../components/ProgressDots';
import StarCounter from '../components/StarCounter';
import SectionComplete from '../components/SectionComplete';

export default function AnimalsPage() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const { currentPlayer } = useApp();
  const { recordActivity } = useProgress(currentPlayer?.id);
  const { checkAndAwardBadges } = useBadges(currentPlayer?.id);
  const { speak, playClick, playCelebration } = useAudio();

  const mounted = useRef(false);

  const item = animalsData[index];

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      setTimeout(() => {
        speak(`${animalsData[0].name}. The ${animalsData[0].name} says ${animalsData[0].sound}`);
        recordActivity('animals', animalsData[0].name, true);
        checkAndAwardBadges(currentPlayer?.totalStars ?? 0);
      }, 500);
    }
  }, []);

  const swipeHandlers = useSwipe({
    onSwipeLeft: () => { if (index < animalsData.length) handleNavigate(index + 1); },
    onSwipeRight: () => { if (index > 0) handleNavigate(index - 1); },
  });

  if (!currentPlayer) return <Navigate to="/" replace />;

  function handleNavigate(newIndex: number) {
    if (newIndex >= animalsData.length) {
      playCelebration();
      setCompleted(true);
      return;
    }
    playClick();
    setIndex(newIndex);
    const newItem = animalsData[newIndex];
    speak(`${newItem.name}. The ${newItem.name} says ${newItem.sound}`);
    recordActivity('animals', newItem.name, true);
    checkAndAwardBadges(currentPlayer?.totalStars ?? 0);
  }

  if (completed) {
    return (
      <SectionComplete
        title="all the Animals"
        emoji="🐾"
        color="#6BCB77"
        onStartOver={() => { setIndex(0); setCompleted(false); }}
      />
    );
  }

  return (
    <div className="min-h-dvh bg-[#FFF8F0] px-4 pt-4 pb-8 md:px-8 md:pt-6 flex flex-col">
      <div className="flex items-center justify-between mb-5 md:max-w-xl md:mx-auto md:w-full">
        <NavButton onClick={() => navigate('/menu')} direction="back" />
        <h2 className="text-xl font-extrabold tracking-tight text-[#6BCB77] md:text-2xl">Animals</h2>
        <StarCounter />
      </div>

      <ProgressDots total={animalsData.length} current={index} color="#6BCB77" />

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
              className="w-44 h-44 sm:w-52 sm:h-52 md:w-56 md:h-56 rounded-[28px] mx-auto mb-5 flex items-center justify-center bg-[#EDFAEF] shadow-[0_4px_20px_rgba(107,203,119,0.2)] border border-[#F0EAE0]"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              <span className="text-[80px] sm:text-[100px] leading-none">
                {item.emoji}
              </span>
            </motion.div>
            <motion.p
              className="text-3xl font-extrabold mb-2 text-[#6BCB77]"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {item.name}
            </motion.p>
            <motion.div
              className="inline-block rounded-[14px] px-5 py-1.5 mb-2 bg-[#EDFAEF] border border-[#D4F0D6] shadow-[0_2px_12px_rgba(45,45,58,0.06)]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-xl italic text-[#6B6B7B]">
                &quot;{item.sound}&quot;
              </p>
            </motion.div>
            <p className="text-base mb-5 text-[#9B9BAB]">Lives in: {item.habitat}</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <motion.button
                className="text-white rounded-[14px] px-6 py-2.5 font-bold cursor-pointer bg-gradient-to-r from-[#6BCB77] to-[#8DD691] shadow-[0_4px_20px_rgba(107,203,119,0.25)]"
                onClick={() => speak(`${item.name}. The ${item.name} says ${item.sound}`)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🔊 Hear name
              </motion.button>
              <motion.button
                className="text-white rounded-[14px] px-6 py-2.5 font-bold cursor-pointer bg-gradient-to-r from-[#FF8C42] to-[#FFA76C] shadow-[0_4px_20px_rgba(255,140,66,0.25)]"
                onClick={() => speak(item.sound)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🗣️ Hear sound
              </motion.button>
            </div>
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
