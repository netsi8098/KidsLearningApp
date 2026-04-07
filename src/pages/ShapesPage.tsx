import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Navigate } from 'react-router-dom';
import { shapesData } from '../data/shapesData';
import { useApp } from '../context/AppContext';
import { useProgress } from '../hooks/useProgress';
import { useAudio } from '../hooks/useAudio';
import { useBadges } from '../hooks/useBadges';
import { useSwipe } from '../hooks/useSwipe';
import NavButton from '../components/NavButton';
import ProgressDots from '../components/ProgressDots';
import StarCounter from '../components/StarCounter';
import SectionComplete from '../components/SectionComplete';

export default function ShapesPage() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const { currentPlayer } = useApp();
  const { recordActivity } = useProgress(currentPlayer?.id);
  const { checkAndAwardBadges } = useBadges(currentPlayer?.id);
  const { speak, playClick, playCelebration } = useAudio();

  const mounted = useRef(false);

  const item = shapesData[index];

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      setTimeout(() => {
        speak(`${shapesData[0].name}. ${shapesData[0].funFact}`);
        recordActivity('shapes', shapesData[0].name, true);
        checkAndAwardBadges(currentPlayer?.totalStars ?? 0);
      }, 500);
    }
  }, []);

  const swipeHandlers = useSwipe({
    onSwipeLeft: () => { if (index < shapesData.length) handleNavigate(index + 1); },
    onSwipeRight: () => { if (index > 0) handleNavigate(index - 1); },
  });

  if (!currentPlayer) return <Navigate to="/" replace />;

  function handleNavigate(newIndex: number) {
    if (newIndex >= shapesData.length) {
      playCelebration();
      setCompleted(true);
      return;
    }
    playClick();
    setIndex(newIndex);
    const newItem = shapesData[newIndex];
    speak(`${newItem.name}. ${newItem.funFact}`);
    recordActivity('shapes', newItem.name, true);
    checkAndAwardBadges(currentPlayer?.totalStars ?? 0);
  }

  if (completed) {
    return (
      <SectionComplete
        title="all the Shapes"
        emoji="🔷"
        color="#A78BFA"
        onStartOver={() => { setIndex(0); setCompleted(false); }}
      />
    );
  }

  return (
    <div className="min-h-dvh bg-[#FFF8F0] px-4 pt-4 pb-8 md:px-8 md:pt-6 flex flex-col">
      <div className="flex items-center justify-between mb-5 md:max-w-xl md:mx-auto md:w-full">
        <NavButton onClick={() => navigate('/menu')} direction="back" />
        <h2 className="text-xl font-extrabold tracking-tight text-[#A78BFA] md:text-2xl">Shapes</h2>
        <StarCounter />
      </div>

      <ProgressDots total={shapesData.length} current={index} color="#A78BFA" />

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
              className="mx-auto mb-5 w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-[28px] flex items-center justify-center bg-[#F3EFFE] shadow-[0_4px_20px_rgba(167,139,250,0.25)] border border-[#F0EAE0]"
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring' }}
            >
              <svg viewBox="0 0 100 100" className="w-32 h-32 sm:w-40 sm:h-40">
                <motion.path
                  d={item.svgPath}
                  fill="#A78BFA"
                  stroke="#7C3AED"
                  strokeWidth="2"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.2 }}
                />
              </svg>
            </motion.div>
            <motion.p
              className="text-3xl font-extrabold mb-1 text-[#A78BFA]"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {item.emoji} {item.name}
            </motion.p>
            {typeof item.sides === 'number' && item.sides > 0 && (
              <p className="text-base font-semibold mb-2 text-[#9B9BAB]">{item.sides} sides</p>
            )}
            <p
              className="text-lg mb-5 max-w-xs mx-auto leading-relaxed text-[#6B6B7B]"
            >
              {item.funFact}
            </p>
            <motion.button
              className="text-white rounded-[14px] px-7 py-2.5 font-bold cursor-pointer bg-gradient-to-r from-[#A78BFA] to-[#C4B5FD] shadow-[0_4px_20px_rgba(167,139,250,0.25)]"
              onClick={() => speak(`${item.name}. ${item.funFact}`)}
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
