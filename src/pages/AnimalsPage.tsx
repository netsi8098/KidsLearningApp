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
import AnimatedBackground from '../components/svg/AnimatedBackground';

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
    <div className="min-h-dvh px-4 pt-4 pb-8 md:px-8 md:pt-6 flex flex-col relative">
      <AnimatedBackground theme="animals" />

      <div className="flex items-center justify-between mb-5 md:max-w-xl md:mx-auto md:w-full relative z-10">
        <NavButton onClick={() => navigate('/menu')} direction="back" />
        <h2 className="font-display text-2xl text-[#6BCB77] md:text-3xl text-bubbly">Animals</h2>
        <StarCounter />
      </div>

      <div className="relative z-10">
        <ProgressDots total={animalsData.length} current={index} color="#6BCB77" />
      </div>

      <div className="flex-1 flex items-center justify-center relative z-10" {...swipeHandlers}>
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            className="text-center"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
          >
            {/* Animal display card */}
            <motion.div
              className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-3xl mx-auto mb-5 flex items-center justify-center"
              style={{
                background: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 8px 32px rgba(107,203,119,0.2), 0 0 0 2px rgba(107,203,119,0.1)',
              }}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              <span className="text-[80px] sm:text-[100px] leading-none">
                {item.emoji}
              </span>
            </motion.div>

            <motion.p
              className="font-display text-3xl mb-2 text-[#2D2D3A]"
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {item.name}
            </motion.p>

            {/* Sound quote */}
            <motion.div
              className="inline-block rounded-2xl px-5 py-2 mb-2"
              style={{ background: 'rgba(255,255,255,0.8)', boxShadow: '0 2px 12px rgba(45,45,58,0.06)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <p className="font-display text-xl text-[#6BCB77]">&quot;{item.sound}&quot;</p>
            </motion.div>

            <p className="text-base mb-5 font-bold text-[#6B6B7B]">Lives in: {item.habitat}</p>

            {/* Action buttons with SVG icons */}
            <div className="flex gap-3 justify-center flex-wrap">
              <motion.button
                className="text-white rounded-2xl px-6 py-3 font-display cursor-pointer bg-gradient-to-r from-[#6BCB77] to-[#8DD691] shadow-lg flex items-center gap-2 tap-bounce"
                onClick={() => speak(`${item.name}. The ${item.name} says ${item.sound}`)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.93 }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M2 7V13H5L9 16V4L5 7H2Z" fill="white"/><path d="M12 7C13 8.5 13 11.5 12 13" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
                Hear name
              </motion.button>
              <motion.button
                className="text-white rounded-2xl px-6 py-3 font-display cursor-pointer bg-gradient-to-r from-[#FF8C42] to-[#FFA76C] shadow-lg flex items-center gap-2 tap-bounce"
                onClick={() => speak(item.sound)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.93 }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="8" r="4" fill="white" fillOpacity="0.3"/><path d="M7 11C7 11 8 13 10 13C12 13 13 11 13 11" stroke="white" strokeWidth="1.5" strokeLinecap="round"/><path d="M6 8H7M13 8H14" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
                Hear sound
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-between items-center mt-5 pb-2 md:max-w-xl md:mx-auto md:w-full md:gap-8 relative z-10">
        <NavButton onClick={() => handleNavigate(index - 1)} direction="prev" disabled={index === 0} />
        <NavButton onClick={() => handleNavigate(index + 1)} direction="next" disabled={false} />
      </div>
    </div>
  );
}
