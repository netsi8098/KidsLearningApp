import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Navigate } from 'react-router-dom';
import { bodyPartsData } from '../data/bodyPartsData';
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

export default function BodyPartsPage() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const { currentPlayer } = useApp();
  const { recordActivity } = useProgress(currentPlayer?.id);
  const { checkAndAwardBadges } = useBadges(currentPlayer?.id);
  const { speak, playClick, playCelebration } = useAudio();

  const mounted = useRef(false);

  const item = bodyPartsData[index];

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      setTimeout(() => {
        speak(`${bodyPartsData[0].name}. ${bodyPartsData[0].funFact}`);
        recordActivity('bodyparts', bodyPartsData[0].name, true);
        checkAndAwardBadges(currentPlayer?.totalStars ?? 0);
      }, 500);
    }
  }, []);

  const swipeHandlers = useSwipe({
    onSwipeLeft: () => { if (index < bodyPartsData.length) handleNavigate(index + 1); },
    onSwipeRight: () => { if (index > 0) handleNavigate(index - 1); },
  });

  if (!currentPlayer) return <Navigate to="/" replace />;

  function handleNavigate(newIndex: number) {
    if (newIndex >= bodyPartsData.length) {
      playCelebration();
      setCompleted(true);
      return;
    }
    playClick();
    setIndex(newIndex);
    const newItem = bodyPartsData[newIndex];
    speak(`${newItem.name}. ${newItem.funFact}`);
    recordActivity('bodyparts', newItem.name, true);
    checkAndAwardBadges(currentPlayer?.totalStars ?? 0);
  }

  if (completed) {
    return (
      <SectionComplete
        title="all the Body Parts"
        emoji="🧍"
        color="#F472B6"
        onStartOver={() => { setIndex(0); setCompleted(false); }}
      />
    );
  }

  return (
    <div className="min-h-dvh px-4 pt-4 pb-8 md:px-8 md:pt-6 flex flex-col relative">
      <AnimatedBackground theme="home" />
      <div className="flex items-center justify-between mb-5 md:max-w-xl md:mx-auto md:w-full">
        <NavButton onClick={() => navigate('/menu')} direction="back" />
        <h2 className="text-xl font-extrabold tracking-tight text-[#F472B6] md:text-2xl">Body Parts</h2>
        <StarCounter />
      </div>

      <ProgressDots total={bodyPartsData.length} current={index} color="#F472B6" />

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
              className="w-44 h-44 sm:w-52 sm:h-52 md:w-56 md:h-56 rounded-[28px] mx-auto mb-5 flex items-center justify-center bg-[#FFF0F6] shadow-[0_4px_20px_rgba(244,114,182,0.2)] border border-[#F0EAE0]"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              <span className="text-[80px] sm:text-[100px] leading-none">
                {item.emoji}
              </span>
            </motion.div>
            <motion.p
              className="text-3xl font-extrabold mb-2 text-[#F472B6]"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {item.name}
            </motion.p>
            <motion.div
              className="rounded-[16px] px-5 py-3 mb-3 max-w-xs mx-auto bg-white/80 border border-[#F0EAE0] shadow-[0_2px_12px_rgba(45,45,58,0.06)]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-lg leading-relaxed text-[#2D2D3A]">
                {item.funFact}
              </p>
            </motion.div>
            <p className="text-base italic mb-5 text-[#9B9BAB]">{item.action}</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <motion.button
                className="text-white rounded-[14px] px-6 py-2.5 font-bold cursor-pointer bg-gradient-to-r from-[#F472B6] to-[#F9A8D4] shadow-[0_4px_20px_rgba(244,114,182,0.25)]"
                onClick={() => speak(`${item.name}. ${item.funFact}`)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🔊 Hear it!
              </motion.button>
              <motion.button
                className="text-white rounded-[14px] px-6 py-2.5 font-bold cursor-pointer bg-gradient-to-r from-[#FF8C42] to-[#FFA76C] shadow-[0_4px_20px_rgba(255,140,66,0.25)]"
                onClick={() => speak(item.action)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🎯 Do it!
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
