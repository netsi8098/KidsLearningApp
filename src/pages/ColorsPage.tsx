import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Navigate } from 'react-router-dom';
import { colorsData } from '../data/colorsData';
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

export default function ColorsPage() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const { currentPlayer } = useApp();
  const { recordActivity } = useProgress(currentPlayer?.id);
  const { checkAndAwardBadges } = useBadges(currentPlayer?.id);
  const { speak, playClick, playCelebration } = useAudio();

  const mounted = useRef(false);

  const item = colorsData[index];

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      setTimeout(() => {
        speak(`${colorsData[0].name}. This is the color ${colorsData[0].name}`);
        recordActivity('colors', colorsData[0].name, true);
        checkAndAwardBadges(currentPlayer?.totalStars ?? 0);
      }, 500);
    }
  }, []);

  const swipeHandlers = useSwipe({
    onSwipeLeft: () => { if (index < colorsData.length) handleNavigate(index + 1); },
    onSwipeRight: () => { if (index > 0) handleNavigate(index - 1); },
  });

  if (!currentPlayer) return <Navigate to="/" replace />;

  function handleNavigate(newIndex: number) {
    if (newIndex >= colorsData.length) {
      playCelebration();
      setCompleted(true);
      return;
    }
    playClick();
    setIndex(newIndex);
    const newItem = colorsData[newIndex];
    speak(`${newItem.name}. This is the color ${newItem.name}`);
    recordActivity('colors', newItem.name, true);
    checkAndAwardBadges(currentPlayer?.totalStars ?? 0);
  }

  if (completed) {
    return (
      <SectionComplete
        title="all the Colors"
        emoji="🎨"
        color="#FFB347"
        onStartOver={() => { setIndex(0); setCompleted(false); }}
      />
    );
  }

  return (
    <div className="min-h-dvh px-4 pt-4 pb-8 md:px-8 md:pt-6 flex flex-col relative page-with-bg">
      <AnimatedBackground theme="colors" />
      <div className="flex items-center justify-between mb-5 md:max-w-xl md:mx-auto md:w-full">
        <NavButton onClick={() => navigate('/menu')} direction="back" />
        <h2 className="font-display text-2xl text-bubbly md:text-3xl" style={{ color: item.hex }}>Colors</h2>
        <StarCounter />
      </div>

      <ProgressDots total={colorsData.length} current={index} color={item.hex} />

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
              className="w-44 h-44 sm:w-52 sm:h-52 md:w-56 md:h-56 rounded-[28px] mx-auto mb-6 border border-[#F0EAE0]"
              style={{ backgroundColor: item.hex, boxShadow: `0 8px 24px ${item.hex}40` }}
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring' }}
            />
            <motion.p
              className="text-4xl font-extrabold mb-4"
              style={{ color: item.hex }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {item.name}
            </motion.p>
            <div
              className="flex gap-4 justify-center text-4xl mb-5 py-3 px-5 rounded-[16px] mx-auto w-fit bg-white/70 border border-[#F0EAE0] shadow-[0_2px_12px_rgba(45,45,58,0.06)]"
            >
              {item.emojis.map((emoji, i) => (
                <motion.span
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 + i * 0.1 }}
                >
                  {emoji}
                </motion.span>
              ))}
            </div>
            <motion.button
              className="mt-2 text-white rounded-[14px] px-7 py-2.5 font-bold cursor-pointer"
              style={{ backgroundColor: item.hex, boxShadow: `0 4px 20px ${item.hex}40` }}
              onClick={() => speak(`${item.name}. This is the color ${item.name}`)}
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
