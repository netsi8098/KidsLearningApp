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
import AnimatedBackground from '../components/svg/AnimatedBackground';
import AlphabetIllustration from '../components/svg/AlphabetIllustrations';

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
    <div className="min-h-dvh px-4 pt-4 pb-8 md:px-8 md:pt-6 flex flex-col relative page-with-bg">
      <AnimatedBackground theme="abc" />
      <div className="flex items-center justify-between mb-5 md:max-w-xl md:mx-auto md:w-full relative z-10">
        <NavButton onClick={() => navigate('/menu')} direction="back" />
        <h2 className="font-display text-2xl text-[#FF6B6B] md:text-3xl text-bubbly">ABCs</h2>
        <StarCounter />
      </div>

      <div className="relative z-10">
        <ProgressDots total={alphabetData.length} current={index} color="#FF6B6B" />
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
            {/* Letter card — chunky 3D block letter */}
            <motion.div
              className="w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 rounded-3xl mx-auto mb-5 flex items-center justify-center"
              style={{
                background: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 8px 32px rgba(255,107,107,0.2), 0 0 0 2px rgba(255,107,107,0.1)',
              }}
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <span
                className="font-display"
                style={{
                  fontSize: 'clamp(5.5rem, 18vw, 8rem)',
                  color: '#FF6B6B',
                  textShadow: '3px 3px 0 rgba(255,107,107,0.2), 6px 6px 0 rgba(255,107,107,0.1)',
                }}
              >
                {item.upper}{item.lower}
              </span>
            </motion.div>

            {/* Word illustration */}
            <motion.div
              className="text-7xl sm:text-8xl mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
            >
              <AlphabetIllustration letter={item.letter} size={120} className="animate-float-gentle" />
            </motion.div>

            <p className="font-display text-2xl text-[#2D2D3A] mb-4">
              {item.letter} is for {item.word}
            </p>

            {/* Hear it button with speaker SVG */}
            <motion.button
              className="text-white rounded-2xl px-8 py-4 font-display text-lg cursor-pointer flex items-center gap-3 justify-center mx-auto w-full max-w-[300px]"
              style={{ background: 'linear-gradient(135deg, #FF6B6B, #FF8C42)', boxShadow: '0 4px 0 rgba(0,0,0,0.15), 0 8px 20px rgba(255,107,107,0.3)' }}
              onClick={() => speak(`${item.letter}. ${item.letter} is for ${item.word}`)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.93 }}
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M3 8.5V13.5H6.5L11 17.5V4.5L6.5 8.5H3Z" fill="white"/>
                <path d="M14 8C15 9 15 13 14 14" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M16.5 6C18.5 8 18.5 14 16.5 16" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Hear it!
            </motion.button>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-between items-center mt-5 pb-2 md:max-w-xl md:mx-auto md:w-full md:gap-8 relative z-10">
        <div style={{ transform: 'scale(1.3)' }}><NavButton onClick={() => handleNavigate(index - 1)} direction="prev" disabled={index === 0} /></div>
        <div style={{ transform: 'scale(1.3)' }}><NavButton onClick={() => handleNavigate(index + 1)} direction="next" disabled={false} /></div>
      </div>
    </div>
  );
}
