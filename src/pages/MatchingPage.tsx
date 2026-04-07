import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useProgress } from '../hooks/useProgress';
import { useAudio } from '../hooks/useAudio';
import { useBadges } from '../hooks/useBadges';
import NavButton from '../components/NavButton';
import StarCounter from '../components/StarCounter';

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

type Difficulty = 'easy' | 'medium' | 'hard';

const allEmojis = ['🐶', '🐱', '🐸', '🦁', '🐼', '🐨', '🐷', '🐵', '🦊', '🐮', '🐔', '🐙'];

const difficultyConfig: Record<Difficulty, { pairs: number; cols: number; rows: number }> = {
  easy: { pairs: 3, cols: 3, rows: 2 },
  medium: { pairs: 6, cols: 4, rows: 3 },
  hard: { pairs: 8, cols: 4, rows: 4 },
};

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function createCards(difficulty: Difficulty): Card[] {
  const { pairs } = difficultyConfig[difficulty];
  const selected = shuffleArray(allEmojis).slice(0, pairs);
  const doubled = [...selected, ...selected];
  const shuffled = shuffleArray(doubled);
  return shuffled.map((emoji, i) => ({
    id: i,
    emoji,
    isFlipped: false,
    isMatched: false,
  }));
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function MatchingPage() {
  const navigate = useNavigate();
  const { currentPlayer } = useApp();
  const { recordActivity } = useProgress(currentPlayer?.id);
  const { checkAndAwardBadges } = useBadges(currentPlayer?.id);
  const { playCorrect, playTryAgain, playCelebration, speak } = useAudio();

  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isChecking, setIsChecking] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer effect
  useEffect(() => {
    if (difficulty && !gameWon) {
      timerRef.current = setInterval(() => {
        setTimer((t) => t + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [difficulty, gameWon]);

  function startGame(diff: Difficulty) {
    setDifficulty(diff);
    setCards(createCards(diff));
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setGameWon(false);
    setTimer(0);
    setIsChecking(false);
  }

  const handleCardClick = useCallback(
    (cardIndex: number) => {
      if (isChecking) return;
      if (flippedCards.length >= 2) return;
      if (cards[cardIndex].isFlipped || cards[cardIndex].isMatched) return;

      const newCards = [...cards];
      newCards[cardIndex] = { ...newCards[cardIndex], isFlipped: true };
      setCards(newCards);

      const newFlipped = [...flippedCards, cardIndex];
      setFlippedCards(newFlipped);

      if (newFlipped.length === 2) {
        setMoves((m) => m + 1);
        setIsChecking(true);

        const [first, second] = newFlipped;
        if (newCards[first].emoji === newCards[second].emoji) {
          // Match found
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c, i) =>
                i === first || i === second ? { ...c, isMatched: true } : c
              )
            );
            const newMatchedPairs = matchedPairs + 1;
            setMatchedPairs(newMatchedPairs);
            setFlippedCards([]);
            setIsChecking(false);
            playCorrect();

            // Record successful match
            recordActivity('matching', `match-${Date.now()}`, true);

            // Check if game is won
            if (difficulty && newMatchedPairs === difficultyConfig[difficulty].pairs) {
              setGameWon(true);
              playCelebration();
              speak('Amazing! You found all the matches!');
              checkAndAwardBadges(currentPlayer?.totalStars ?? 0);
            }
          }, 400);
        } else {
          // No match
          playTryAgain();
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c, i) =>
                i === first || i === second ? { ...c, isFlipped: false } : c
              )
            );
            setFlippedCards([]);
            setIsChecking(false);
          }, 800);
        }
      }
    },
    [cards, flippedCards, isChecking, matchedPairs, difficulty, playCorrect, playTryAgain, playCelebration, speak, recordActivity, checkAndAwardBadges, currentPlayer?.totalStars]
  );

  if (!currentPlayer) return <Navigate to="/" replace />;

  function handlePlayAgain() {
    setDifficulty(null);
    setCards([]);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setGameWon(false);
    setTimer(0);
    setIsChecking(false);
  }

  // Difficulty picker screen
  if (!difficulty) {
    return (
      <div className="min-h-dvh bg-[#FFF8F0] px-4 pt-4 pb-8 flex flex-col">
        <div className="flex items-center justify-between mb-5">
          <NavButton onClick={() => navigate('/menu')} direction="back" />
          <h2 className="text-xl font-extrabold tracking-tight" style={{ color: '#38BDF8' }}>
            Matching Game
          </h2>
          <StarCounter />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
          <motion.div
            className="text-7xl mb-5"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🃏
          </motion.div>
          <motion.h1
            className="text-2xl font-extrabold mb-2 text-center"
            style={{ color: '#2D2D3A' }}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            Choose Difficulty
          </motion.h1>
          <motion.p
            className="text-sm mb-8 text-center"
            style={{ color: '#6B6B7B' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            Find all the matching pairs!
          </motion.p>

          <div className="flex flex-col gap-4 w-full">
            {[
              { level: 'easy' as Difficulty, label: 'Easy', sub: '3 pairs', color: '#4ECDC4', emoji: '🌱' },
              { level: 'medium' as Difficulty, label: 'Medium', sub: '6 pairs', color: '#FFB347', emoji: '🌟' },
              { level: 'hard' as Difficulty, label: 'Hard', sub: '8 pairs', color: '#FF6B6B', emoji: '🔥' },
            ].map(({ level, label, sub, color, emoji }, i) => (
              <motion.button
                key={level}
                className="rounded-[20px] p-5 flex items-center gap-4 cursor-pointer w-full"
                style={{ backgroundColor: color, boxShadow: `0 4px 20px ${color}40` }}
                onClick={() => startGame(level)}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.1, type: 'spring', damping: 15 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="text-4xl">{emoji}</span>
                <div className="text-left">
                  <span className="text-white text-xl font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)] block">{label}</span>
                  <span className="text-white/80 text-sm">{sub}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Game won screen
  if (gameWon) {
    const totalPairs = difficultyConfig[difficulty].pairs;
    const perfectMoves = totalPairs;
    const emoji = moves <= perfectMoves + 2 ? '🏆' : moves <= perfectMoves * 2 ? '🌟' : '👏';
    const message = moves <= perfectMoves + 2 ? 'Perfect Memory!' : moves <= perfectMoves * 2 ? 'Great Job!' : 'You Did It!';

    return (
      <div className="min-h-dvh bg-[#FFF8F0] px-4 pt-4 pb-8 flex flex-col items-center justify-center">
        <motion.div
          className="text-8xl mb-5"
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
          transition={{ type: 'spring' }}
        >
          {emoji}
        </motion.div>
        <motion.h1
          className="text-3xl font-extrabold mb-3"
          style={{ color: '#38BDF8' }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          {message}
        </motion.h1>
        <div
          className="rounded-[20px] px-6 py-4 mb-4 flex gap-6"
          style={{ backgroundColor: '#FFFFFF', border: '1px solid #F0EAE0', boxShadow: '0 2px 12px rgba(45,45,58,0.06)' }}
        >
          <motion.div
            className="text-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <p className="text-xs font-bold" style={{ color: '#9B9BAB' }}>Moves</p>
            <p className="text-xl font-extrabold" style={{ color: '#2D2D3A' }}>{moves}</p>
          </motion.div>
          <motion.div
            className="text-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            <p className="text-xs font-bold" style={{ color: '#9B9BAB' }}>Time</p>
            <p className="text-xl font-extrabold" style={{ color: '#2D2D3A' }}>{formatTime(timer)}</p>
          </motion.div>
        </div>
        <motion.div
          className="flex gap-1 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {Array.from({ length: totalPairs }).map((_, i) => (
            <span key={i} className="text-2xl">⭐</span>
          ))}
        </motion.div>
        <div className="flex gap-3">
          <motion.button
            className="text-white rounded-[14px] px-7 py-3 font-bold cursor-pointer bg-gradient-to-r from-[#38BDF8] to-[#60CCFA]"
            style={{ boxShadow: '0 4px 20px rgba(56,189,248,0.25)' }}
            onClick={handlePlayAgain}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🔄 Play Again
          </motion.button>
          <motion.button
            className="rounded-[14px] px-7 py-3 font-bold cursor-pointer"
            style={{ backgroundColor: '#FFF8F0', color: '#6B6B7B', border: '1px solid #F0EAE0', boxShadow: '0 2px 12px rgba(45,45,58,0.06)' }}
            onClick={() => navigate('/menu')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🏠 Menu
          </motion.button>
        </div>
      </div>
    );
  }

  // Game board
  const config = difficultyConfig[difficulty];

  return (
    <div className="min-h-dvh bg-[#FFF8F0] px-4 pt-4 pb-8 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <NavButton onClick={() => navigate('/menu')} direction="back" />
        <h2 className="text-xl font-extrabold tracking-tight" style={{ color: '#38BDF8' }}>
          Matching
        </h2>
        <StarCounter />
      </div>

      {/* Stats bar */}
      <div className="flex items-center justify-center gap-3 mb-4">
        <div
          className="flex items-center gap-1.5 rounded-full px-4 py-1.5"
          style={{ backgroundColor: '#FFFFFF', border: '1px solid #F0EAE0', boxShadow: '0 2px 8px rgba(45,45,58,0.04)' }}
        >
          <span className="text-sm">👆</span>
          <span className="text-sm font-bold" style={{ color: '#2D2D3A' }}>Moves: {moves}</span>
        </div>
        <div
          className="flex items-center gap-1.5 rounded-full px-4 py-1.5"
          style={{ backgroundColor: '#FFFFFF', border: '1px solid #F0EAE0', boxShadow: '0 2px 8px rgba(45,45,58,0.04)' }}
        >
          <span className="text-sm">⏱️</span>
          <span className="text-sm font-bold" style={{ color: '#2D2D3A' }}>{formatTime(timer)}</span>
        </div>
        <div
          className="flex items-center gap-1.5 rounded-full px-4 py-1.5"
          style={{ backgroundColor: '#FFFFFF', border: '1px solid #F0EAE0', boxShadow: '0 2px 8px rgba(45,45,58,0.04)' }}
        >
          <span className="text-sm">✅</span>
          <span className="text-sm font-bold" style={{ color: '#2D2D3A' }}>
            {matchedPairs}/{config.pairs}
          </span>
        </div>
      </div>

      {/* Card grid */}
      <div className="flex-1 flex items-center justify-center">
        <div
          className="grid gap-3 w-full max-w-md mx-auto"
          style={{
            gridTemplateColumns: `repeat(${config.cols}, 1fr)`,
          }}
        >
          <AnimatePresence>
            {cards.map((card, index) => (
              <motion.button
                key={card.id}
                className="aspect-square rounded-[16px] cursor-pointer relative"
                style={{ perspective: '600px', boxShadow: '0 2px 12px rgba(45,45,58,0.08)' }}
                onClick={() => handleCardClick(index)}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.05, type: 'spring', damping: 12 }}
                whileHover={!card.isFlipped && !card.isMatched ? { scale: 1.05 } : {}}
                whileTap={!card.isFlipped && !card.isMatched ? { scale: 0.95 } : {}}
              >
                <motion.div
                  className="w-full h-full relative"
                  style={{ transformStyle: 'preserve-3d' }}
                  animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
                  transition={{ duration: 0.4, type: 'spring', damping: 20 }}
                >
                  {/* Card back (face down) */}
                  <div
                    className="absolute inset-0 rounded-[16px] flex items-center justify-center text-4xl"
                    style={{
                      backfaceVisibility: 'hidden',
                      background: 'linear-gradient(135deg, #38BDF8, #60CCFA)',
                      boxShadow: '0 4px 16px rgba(56,189,248,0.25)',
                    }}
                  >
                    ❓
                  </div>

                  {/* Card front (face up) */}
                  <div
                    className="absolute inset-0 rounded-[16px] flex items-center justify-center text-4xl"
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                      backgroundColor: card.isMatched ? '#EDFAF8' : '#FFFFFF',
                      border: card.isMatched ? '2px solid #4ECDC4' : '1px solid #F0EAE0',
                      boxShadow: card.isMatched ? '0 4px 20px rgba(78,205,196,0.25)' : '0 2px 12px rgba(45,45,58,0.06)',
                    }}
                  >
                    <motion.span
                      className={difficulty === 'easy' ? 'text-5xl' : difficulty === 'medium' ? 'text-4xl' : 'text-3xl'}
                      animate={card.isMatched ? { scale: [1, 1.3, 1] } : {}}
                      transition={{ duration: 0.4 }}
                    >
                      {card.emoji}
                    </motion.span>
                  </div>
                </motion.div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
