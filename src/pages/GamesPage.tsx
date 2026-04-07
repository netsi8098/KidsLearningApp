import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAudio } from '../hooks/useAudio';
import { db } from '../db/database';
import NavButton from '../components/NavButton';
import { gamesConfig, wordBuilderWords, numberPopEmojis, type GameDifficulty, type GameConfig } from '../data/gamesConfig';
import { animalsData } from '../data/animalsData';
import { shapesData } from '../data/shapesData';
import { colorsData } from '../data/colorsData';

// ─── Utility helpers ────────────────────────────────────────────────

function shuffleArray<T>(arr: T[]): T[] {
  const s = [...arr];
  for (let i = s.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [s[i], s[j]] = [s[j], s[i]];
  }
  return s;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function starsFromAccuracy(accuracy: number): number {
  if (accuracy >= 90) return 3;
  if (accuracy >= 70) return 2;
  if (accuracy >= 40) return 1;
  return 0;
}

// ─── Types ──────────────────────────────────────────────────────────

type Screen = 'hub' | 'difficulty' | 'playing' | 'gameover';

interface GameResult {
  score: number;
  total: number;
  accuracy: number;
  stars: number;
  timeSeconds: number;
}

// ─── Bubble item for Number Pop ─────────────────────────────────────

interface BubbleItem {
  num: number;
  emoji: string;
  x: number;
  y: number;
  popped: boolean;
  shaking: boolean;
}

// ─── Word Builder Game ──────────────────────────────────────────────

function WordBuilderGame({
  difficulty,
  itemCount,
  onFinish,
}: {
  difficulty: GameDifficulty;
  itemCount: number;
  onFinish: (result: GameResult) => void;
}) {
  const { playCorrect, playTryAgain, speak } = useAudio();
  const words = useMemo(() => shuffleArray(wordBuilderWords[difficulty]).slice(0, itemCount), [difficulty, itemCount]);
  const [wordIndex, setWordIndex] = useState(0);
  const [selected, setSelected] = useState<number[]>([]);
  const [scrambled, setScrambled] = useState<string[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [shakeWrong, setShakeWrong] = useState(false);
  const [startTime] = useState(Date.now());

  const currentWord = words[wordIndex] || '';

  // Scramble letters when word changes
  useEffect(() => {
    if (!currentWord) return;
    let s = shuffleArray(currentWord.split(''));
    // Ensure it's actually scrambled for words > 1 letter
    let tries = 0;
    while (s.join('') === currentWord && tries < 10) {
      s = shuffleArray(currentWord.split(''));
      tries++;
    }
    setScrambled(s);
    setSelected([]);
  }, [currentWord]);

  const builtWord = selected.map((i) => scrambled[i]).join('');
  const isComplete = builtWord.length === currentWord.length;

  useEffect(() => {
    if (!isComplete) return;
    setTotalAttempts((a) => a + 1);
    if (builtWord === currentWord) {
      playCorrect();
      setCorrectCount((c) => c + 1);
      const encouragements = ['Great!', 'Awesome!', 'Nice job!', 'Super!'];
      speak(encouragements[Math.floor(Math.random() * encouragements.length)]);
      setTimeout(() => {
        if (wordIndex < words.length - 1) {
          setWordIndex((i) => i + 1);
        } else {
          const correct = correctCount + 1;
          const total = totalAttempts + 1;
          const accuracy = Math.round((correct / total) * 100);
          onFinish({
            score: correct,
            total: words.length,
            accuracy,
            stars: starsFromAccuracy(accuracy),
            timeSeconds: Math.round((Date.now() - startTime) / 1000),
          });
        }
      }, 800);
    } else {
      playTryAgain();
      setShakeWrong(true);
      setTimeout(() => {
        setShakeWrong(false);
        setSelected([]);
      }, 500);
    }
  }, [isComplete]);

  function handleLetterTap(index: number) {
    if (selected.includes(index) || isComplete) return;
    setSelected((prev) => [...prev, index]);
  }

  function handleUndo() {
    setSelected((prev) => prev.slice(0, -1));
  }

  const wordEmojis: Record<string, string> = {
    cat: '🐱', dog: '🐶', sun: '☀️', hat: '🎩', cup: '☕', red: '🔴', big: '🐘', run: '🏃', hop: '🐰', sit: '🪑',
    bear: '🐻', fish: '🐟', duck: '🦆', tree: '🌳', star: '⭐', blue: '🔵', jump: '🤸', play: '🎮', home: '🏠', book: '📖',
    apple: '🍎', happy: '😊', house: '🏡', water: '💧', green: '🟢', plant: '🌱', smile: '😄', cloud: '☁️', music: '🎵', dance: '💃',
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full md:max-w-xl">
      {/* Progress */}
      <div className="w-full mb-4">
        <div className="flex justify-between text-sm text-gray-500 mb-1">
          <span>Word {wordIndex + 1} of {words.length}</span>
          <span>{correctCount} correct</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="h-2 rounded-full"
            style={{ backgroundColor: '#FF6B6B' }}
            animate={{ width: `${((wordIndex + 1) / words.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Emoji hint */}
      <motion.div
        className="text-6xl mb-2"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {wordEmojis[currentWord] || '🔤'}
      </motion.div>
      <p className="text-gray-500 text-sm mb-4">Spell this word!</p>

      {/* Built word display */}
      <motion.div
        className="flex gap-2 mb-6 min-h-[56px]"
        animate={shakeWrong ? { x: [-8, 8, -8, 8, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        {currentWord.split('').map((_, i) => (
          <div
            key={i}
            className="w-12 h-12 rounded-xl border-2 flex items-center justify-center text-2xl font-extrabold uppercase"
            style={{
              borderColor: selected[i] !== undefined ? '#FF6B6B' : '#E5E7EB',
              backgroundColor: selected[i] !== undefined ? '#FFF0F0' : '#FFFFFF',
              color: '#FF6B6B',
            }}
          >
            {selected[i] !== undefined ? scrambled[selected[i]] : ''}
          </div>
        ))}
      </motion.div>

      {/* Scrambled letters */}
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        {scrambled.map((letter, i) => {
          const used = selected.includes(i);
          return (
            <motion.button
              key={`${wordIndex}-${i}`}
              className="w-12 h-12 rounded-xl font-extrabold text-xl uppercase shadow-md cursor-pointer"
              style={{
                backgroundColor: used ? '#E5E7EB' : '#FF6B6B',
                color: used ? '#ccc' : 'white',
              }}
              onClick={() => handleLetterTap(i)}
              disabled={used || isComplete}
              whileHover={!used ? { scale: 1.1 } : {}}
              whileTap={!used ? { scale: 0.9 } : {}}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.05, type: 'spring' }}
            >
              {letter}
            </motion.button>
          );
        })}
      </div>

      {/* Undo button */}
      {selected.length > 0 && !isComplete && (
        <motion.button
          className="text-gray-500 text-sm font-bold underline cursor-pointer"
          onClick={handleUndo}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Undo last letter
        </motion.button>
      )}
    </div>
  );
}

// ─── Number Pop Game ────────────────────────────────────────────────

function NumberPopGame({
  itemCount,
  onFinish,
}: {
  itemCount: number;
  onFinish: (result: GameResult) => void;
}) {
  const { playCorrect, playTryAgain, speak } = useAudio();
  const [startTime] = useState(Date.now());
  const [correctCount, setCorrectCount] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [nextNumber, setNextNumber] = useState(1);
  const [bubbles, setBubbles] = useState<BubbleItem[]>([]);

  // Initialize bubbles
  useEffect(() => {
    const b: BubbleItem[] = [];
    for (let i = 1; i <= itemCount; i++) {
      b.push({
        num: i,
        emoji: numberPopEmojis[(i - 1) % numberPopEmojis.length],
        x: Math.random() * 70 + 5,
        y: Math.random() * 60 + 10,
        popped: false,
        shaking: false,
      });
    }
    setBubbles(shuffleArray(b));
  }, [itemCount]);

  function handleBubbleTap(num: number) {
    setTotalAttempts((a) => a + 1);
    if (num === nextNumber) {
      playCorrect();
      setCorrectCount((c) => c + 1);
      setBubbles((prev) => prev.map((b) => (b.num === num ? { ...b, popped: true } : b)));
      const next = nextNumber + 1;
      setNextNumber(next);
      if (next > itemCount) {
        const correct = correctCount + 1;
        const total = totalAttempts + 1;
        const accuracy = Math.round((correct / total) * 100);
        setTimeout(() => {
          speak('You did it!');
          onFinish({
            score: correct,
            total: itemCount,
            accuracy,
            stars: starsFromAccuracy(accuracy),
            timeSeconds: Math.round((Date.now() - startTime) / 1000),
          });
        }, 400);
      }
    } else {
      playTryAgain();
      setBubbles((prev) =>
        prev.map((b) => (b.num === num ? { ...b, shaking: true } : b))
      );
      setTimeout(() => {
        setBubbles((prev) =>
          prev.map((b) => (b.num === num ? { ...b, shaking: false } : b))
        );
      }, 500);
    }
  }

  const poppedCount = bubbles.filter((b) => b.popped).length;

  return (
    <div className="flex-1 flex flex-col items-center max-w-md mx-auto w-full md:max-w-xl">
      {/* Progress */}
      <div className="w-full mb-3">
        <div className="flex justify-between text-sm text-gray-500 mb-1">
          <span>Pop #{nextNumber} next!</span>
          <span>{poppedCount}/{itemCount} popped</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="h-2 rounded-full"
            style={{ backgroundColor: '#4ECDC4' }}
            animate={{ width: `${(poppedCount / itemCount) * 100}%` }}
          />
        </div>
      </div>

      {/* Bubble field */}
      <div className="relative w-full flex-1 min-h-[400px] bg-gradient-to-b from-sky-100 to-sky-50 rounded-3xl overflow-hidden">
        <AnimatePresence>
          {bubbles.map((bubble) =>
            !bubble.popped ? (
              <motion.button
                key={bubble.num}
                className="absolute flex flex-col items-center justify-center cursor-pointer"
                style={{
                  left: `${bubble.x}%`,
                  top: `${bubble.y}%`,
                  width: itemCount <= 10 ? 56 : 46,
                  height: itemCount <= 10 ? 56 : 46,
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  y: [0, -8, 0, 8, 0],
                  x: bubble.shaking ? [-5, 5, -5, 5, 0] : 0,
                }}
                exit={{ scale: 2, opacity: 0 }}
                transition={{
                  y: { duration: 2 + Math.random() * 2, repeat: Infinity, ease: 'easeInOut' },
                  x: bubble.shaking ? { duration: 0.4 } : {},
                  scale: { type: 'spring' },
                }}
                whileTap={{ scale: 0.85 }}
                onClick={() => handleBubbleTap(bubble.num)}
              >
                <div
                  className="rounded-full flex items-center justify-center shadow-lg border-2 border-white/50"
                  style={{
                    width: itemCount <= 10 ? 52 : 42,
                    height: itemCount <= 10 ? 52 : 42,
                    background: `linear-gradient(135deg, ${
                      ['#FF6B6B', '#4ECDC4', '#FFB347', '#A78BFA', '#6BCB77', '#FF69B4', '#38BDF8', '#F59E0B'][
                        (bubble.num - 1) % 8
                      ]
                    }, ${
                      ['#FF8A8A', '#6EE7DB', '#FFD077', '#C4A6FF', '#8FDD99', '#FF8CC8', '#60CCFF', '#FBC02D'][
                        (bubble.num - 1) % 8
                      ]
                    })`,
                  }}
                >
                  <span className="font-extrabold text-white text-lg drop-shadow">{bubble.num}</span>
                </div>
              </motion.button>
            ) : null
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Color Splash Game ──────────────────────────────────────────────

function ColorSplashGame({
  difficulty,
  itemCount,
  onFinish,
}: {
  difficulty: GameDifficulty;
  itemCount: number;
  onFinish: (result: GameResult) => void;
}) {
  const { playCorrect, playTryAgain, speak } = useAudio();
  const colorCount = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 5 : 8;
  const usedColors = useMemo(() => shuffleArray(colorsData).slice(0, colorCount), [colorCount]);
  const [round, setRound] = useState(0);
  const totalRounds = Math.min(itemCount, 5);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [tappedIndices, setTappedIndices] = useState<Set<number>>(new Set());
  const [shakeIndex, setShakeIndex] = useState<number | null>(null);
  const [startTime] = useState(Date.now());

  // Generate grid items for current round
  const targetColor = usedColors[round % usedColors.length];
  const gridItems = useMemo(() => {
    const items: { color: typeof colorsData[0]; emoji: string; isTarget: boolean }[] = [];
    // Add 3-4 target items
    const targetCount = 3 + Math.floor(Math.random() * 2);
    for (let i = 0; i < targetCount; i++) {
      const emojiIdx = i % targetColor.emojis.length;
      items.push({ color: targetColor, emoji: targetColor.emojis[emojiIdx], isTarget: true });
    }
    // Fill rest with distractors
    const distractors = usedColors.filter((c) => c.name !== targetColor.name);
    const remaining = itemCount - targetCount;
    for (let i = 0; i < remaining; i++) {
      const dc = distractors[i % distractors.length];
      const emojiIdx = i % dc.emojis.length;
      items.push({ color: dc, emoji: dc.emojis[emojiIdx], isTarget: false });
    }
    return shuffleArray(items);
  }, [round, targetColor, usedColors, itemCount]);

  const targetCountInGrid = gridItems.filter((it) => it.isTarget).length;
  const tappedTargets = [...tappedIndices].filter((i) => gridItems[i]?.isTarget).length;
  const roundComplete = tappedTargets >= targetCountInGrid;

  useEffect(() => {
    if (!roundComplete || tappedTargets === 0) return;
    setTimeout(() => {
      if (round < totalRounds - 1) {
        setRound((r) => r + 1);
        setTappedIndices(new Set());
      } else {
        const accuracy = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 100;
        onFinish({
          score: correctCount,
          total: totalAttempts,
          accuracy,
          stars: starsFromAccuracy(accuracy),
          timeSeconds: Math.round((Date.now() - startTime) / 1000),
        });
      }
    }, 600);
  }, [roundComplete, tappedTargets]);

  function handleItemTap(index: number) {
    if (tappedIndices.has(index) || roundComplete) return;
    setTotalAttempts((a) => a + 1);
    setTappedIndices((prev) => new Set(prev).add(index));
    if (gridItems[index].isTarget) {
      playCorrect();
      setCorrectCount((c) => c + 1);
    } else {
      playTryAgain();
      setShakeIndex(index);
      setTimeout(() => setShakeIndex(null), 500);
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center max-w-md mx-auto w-full md:max-w-xl">
      {/* Progress */}
      <div className="w-full mb-3">
        <div className="flex justify-between text-sm text-gray-500 mb-1">
          <span>Round {round + 1}/{totalRounds}</span>
          <span>{tappedTargets}/{targetCountInGrid} found</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div className="h-2 rounded-full" style={{ backgroundColor: '#FFB347' }} animate={{ width: `${((round + (tappedTargets / targetCountInGrid)) / totalRounds) * 100}%` }} />
        </div>
      </div>

      {/* Target color */}
      <motion.div
        className="bg-white rounded-2xl px-6 py-3 shadow-md mb-4 text-center"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        key={round}
      >
        <p className="text-sm text-gray-500">Tap all the</p>
        <p className="text-2xl font-extrabold" style={{ color: targetColor.hex }}>
          {targetColor.name}
        </p>
        <p className="text-sm text-gray-500">items!</p>
      </motion.div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-3 w-full">
        {gridItems.map((item, i) => {
          const tapped = tappedIndices.has(i);
          const isShaking = shakeIndex === i;
          return (
            <motion.button
              key={`${round}-${i}`}
              className="aspect-square rounded-2xl flex items-center justify-center text-4xl shadow-md cursor-pointer border-2"
              style={{
                backgroundColor: tapped
                  ? item.isTarget
                    ? '#D1FAE5'
                    : '#FEE2E2'
                  : 'white',
                borderColor: tapped
                  ? item.isTarget
                    ? '#34D399'
                    : '#F87171'
                  : '#E5E7EB',
              }}
              onClick={() => handleItemTap(i)}
              disabled={tapped}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: 1,
                x: isShaking ? [-4, 4, -4, 4, 0] : 0,
              }}
              transition={{
                delay: i * 0.03,
                type: 'spring',
                x: isShaking ? { duration: 0.4 } : {},
              }}
              whileHover={!tapped ? { scale: 1.08 } : {}}
              whileTap={!tapped ? { scale: 0.92 } : {}}
            >
              {item.emoji}
              {tapped && (
                <motion.span
                  className="absolute text-lg"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  {item.isTarget ? '✅' : '❌'}
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Animal Sounds Game ─────────────────────────────────────────────

function AnimalSoundsGame({
  itemCount,
  onFinish,
}: {
  itemCount: number;
  onFinish: (result: GameResult) => void;
}) {
  const { playCorrect, playTryAgain, speak } = useAudio();
  const allAnimals = useMemo(() => shuffleArray(animalsData).slice(0, Math.min(itemCount, animalsData.length)), [itemCount]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [startTime] = useState(Date.now());

  const totalQuestions = allAnimals.length;
  const currentAnimal = allAnimals[questionIndex];

  // Generate 4 options
  const options = useMemo(() => {
    if (!currentAnimal) return [];
    const others = animalsData.filter((a) => a.name !== currentAnimal.name);
    const distractors = shuffleArray(others).slice(0, 3);
    return shuffleArray([currentAnimal, ...distractors]);
  }, [questionIndex, currentAnimal]);

  // Speak the sound when question changes
  useEffect(() => {
    if (currentAnimal) {
      setTimeout(() => speak(currentAnimal.sound, 0.8), 300);
    }
  }, [questionIndex, currentAnimal]);

  function handleReplay() {
    if (currentAnimal) {
      speak(currentAnimal.sound, 0.8);
    }
  }

  function handleAnswer(animalName: string) {
    if (answered) return;
    setAnswered(true);
    setSelectedAnswer(animalName);
    setTotalAttempts((a) => a + 1);

    const isCorrect = animalName === currentAnimal.name;
    if (isCorrect) {
      playCorrect();
      setCorrectCount((c) => c + 1);
      speak('Correct!');
    } else {
      playTryAgain();
      speak(`That was the ${currentAnimal.name}!`);
    }

    setTimeout(() => {
      if (questionIndex < totalQuestions - 1) {
        setQuestionIndex((i) => i + 1);
        setAnswered(false);
        setSelectedAnswer(null);
      } else {
        const correct = isCorrect ? correctCount + 1 : correctCount;
        const total = totalAttempts + 1;
        const accuracy = Math.round((correct / total) * 100);
        onFinish({
          score: correct,
          total: totalQuestions,
          accuracy,
          stars: starsFromAccuracy(accuracy),
          timeSeconds: Math.round((Date.now() - startTime) / 1000),
        });
      }
    }, 1200);
  }

  if (!currentAnimal) return null;

  return (
    <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full md:max-w-xl">
      {/* Progress */}
      <div className="w-full mb-4">
        <div className="flex justify-between text-sm text-gray-500 mb-1">
          <span>Question {questionIndex + 1}/{totalQuestions}</span>
          <span>{correctCount} correct</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div className="h-2 rounded-full" style={{ backgroundColor: '#6BCB77' }} animate={{ width: `${((questionIndex + 1) / totalQuestions) * 100}%` }} />
        </div>
      </div>

      {/* Sound prompt */}
      <motion.div
        className="bg-white rounded-2xl p-6 shadow-md text-center mb-6 w-full"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        key={questionIndex}
      >
        <motion.div
          className="text-5xl mb-3"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          🔊
        </motion.div>
        <p className="text-lg font-bold text-gray-700 mb-3">
          Which animal says...
        </p>
        <p className="text-2xl font-extrabold text-green-600 mb-3">
          &ldquo;{currentAnimal.sound}&rdquo;
        </p>
        <motion.button
          className="bg-green-100 text-green-700 rounded-full px-4 py-2 text-sm font-bold cursor-pointer"
          onClick={handleReplay}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🔁 Hear Again
        </motion.button>
      </motion.div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3 w-full">
        {options.map((animal, i) => {
          const isSelected = selectedAnswer === animal.name;
          const isCorrectAnswer = animal.name === currentAnimal.name;
          let bg = 'white';
          let border = '#E5E7EB';
          if (answered && isSelected && isCorrectAnswer) {
            bg = '#D1FAE5';
            border = '#34D399';
          } else if (answered && isSelected && !isCorrectAnswer) {
            bg = '#FEE2E2';
            border = '#F87171';
          } else if (answered && isCorrectAnswer) {
            bg = '#D1FAE5';
            border = '#34D399';
          }

          return (
            <motion.button
              key={`${questionIndex}-${animal.name}`}
              className="rounded-2xl p-4 flex flex-col items-center gap-1 shadow-md cursor-pointer border-2"
              style={{ backgroundColor: bg, borderColor: border }}
              onClick={() => handleAnswer(animal.name)}
              disabled={answered}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.08, type: 'spring' }}
              whileHover={!answered ? { scale: 1.05 } : {}}
              whileTap={!answered ? { scale: 0.95 } : {}}
            >
              <span className="text-4xl">{animal.emoji}</span>
              <span className="text-sm font-bold text-gray-700">{animal.name}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Shape Sort Game ────────────────────────────────────────────────

function ShapeSortGame({
  difficulty,
  itemCount,
  onFinish,
}: {
  difficulty: GameDifficulty;
  itemCount: number;
  onFinish: (result: GameResult) => void;
}) {
  const { playCorrect, playTryAgain, speak } = useAudio();
  const shapeCount = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 5 : 8;
  const targetShapes = useMemo(() => shuffleArray(shapesData).slice(0, Math.min(shapeCount, shapesData.length)), [shapeCount]);

  // Generate items to sort: assign each item a random target shape
  const sortItems = useMemo(() => {
    const items: { id: number; shape: typeof shapesData[0]; sorted: boolean }[] = [];
    for (let i = 0; i < itemCount; i++) {
      items.push({
        id: i,
        shape: targetShapes[i % targetShapes.length],
        sorted: false,
      });
    }
    return shuffleArray(items);
  }, [itemCount, targetShapes]);

  const [items, setItems] = useState(sortItems);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [shakeBox, setShakeBox] = useState<string | null>(null);
  const [startTime] = useState(Date.now());
  const [bounceBox, setBounceBox] = useState<string | null>(null);

  const unsortedItems = items.filter((it) => !it.sorted);
  const allSorted = unsortedItems.length === 0;

  useEffect(() => {
    if (allSorted && items.length > 0) {
      const accuracy = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 100;
      setTimeout(() => {
        speak('All sorted!');
        onFinish({
          score: correctCount,
          total: itemCount,
          accuracy,
          stars: starsFromAccuracy(accuracy),
          timeSeconds: Math.round((Date.now() - startTime) / 1000),
        });
      }, 400);
    }
  }, [allSorted]);

  function handleItemTap(id: number) {
    setSelectedItemId(id === selectedItemId ? null : id);
  }

  function handleBoxTap(shapeName: string) {
    if (selectedItemId === null) return;
    const item = items.find((it) => it.id === selectedItemId);
    if (!item) return;

    setTotalAttempts((a) => a + 1);

    if (item.shape.name === shapeName) {
      playCorrect();
      setCorrectCount((c) => c + 1);
      setBounceBox(shapeName);
      setTimeout(() => setBounceBox(null), 400);
      setItems((prev) => prev.map((it) => (it.id === selectedItemId ? { ...it, sorted: true } : it)));
      setSelectedItemId(null);
    } else {
      playTryAgain();
      setShakeBox(shapeName);
      setTimeout(() => setShakeBox(null), 500);
    }
  }

  const sortedCountByShape = (name: string) => items.filter((it) => it.sorted && it.shape.name === name).length;

  return (
    <div className="flex-1 flex flex-col items-center max-w-md mx-auto w-full md:max-w-xl">
      {/* Progress */}
      <div className="w-full mb-3">
        <div className="flex justify-between text-sm text-gray-500 mb-1">
          <span>{items.filter((it) => it.sorted).length}/{itemCount} sorted</span>
          <span>{correctCount} correct</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div className="h-2 rounded-full" style={{ backgroundColor: '#A78BFA' }} animate={{ width: `${(items.filter((it) => it.sorted).length / itemCount) * 100}%` }} />
        </div>
      </div>

      <p className="text-sm text-gray-500 mb-3">Tap a shape, then tap its matching box!</p>

      {/* Unsorted shapes at top */}
      <div className="flex flex-wrap gap-2 justify-center mb-6 min-h-[60px]">
        {unsortedItems.map((item) => (
          <motion.button
            key={item.id}
            className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl shadow-md cursor-pointer border-3"
            style={{
              backgroundColor: selectedItemId === item.id ? '#EDE9FE' : 'white',
              borderColor: selectedItemId === item.id ? '#A78BFA' : '#E5E7EB',
              borderWidth: selectedItemId === item.id ? 3 : 2,
            }}
            onClick={() => handleItemTap(item.id)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            layout
          >
            {item.shape.emoji}
          </motion.button>
        ))}
      </div>

      {/* Target boxes at bottom */}
      <div className="grid grid-cols-2 gap-3 w-full">
        {targetShapes.map((shape) => {
          const isShaking = shakeBox === shape.name;
          const isBouncing = bounceBox === shape.name;
          const count = sortedCountByShape(shape.name);
          return (
            <motion.button
              key={shape.name}
              className="rounded-2xl p-4 flex flex-col items-center gap-1 shadow-md cursor-pointer border-2 border-dashed min-h-[100px]"
              style={{ borderColor: '#A78BFA', backgroundColor: '#F5F3FF' }}
              onClick={() => handleBoxTap(shape.name)}
              animate={{
                x: isShaking ? [-4, 4, -4, 4, 0] : 0,
                scale: isBouncing ? [1, 1.1, 1] : 1,
              }}
              transition={{
                x: isShaking ? { duration: 0.4 } : {},
                scale: isBouncing ? { duration: 0.3 } : {},
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="text-3xl">{shape.emoji}</span>
              <span className="text-sm font-bold text-purple-700">{shape.name}</span>
              {count > 0 && (
                <span className="text-xs text-purple-500 font-bold">{count} sorted</span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Game Over Screen ───────────────────────────────────────────────

function GameOverScreen({
  game,
  difficulty,
  result,
  onPlayAgain,
  onBackToHub,
}: {
  game: GameConfig;
  difficulty: GameDifficulty;
  result: GameResult;
  onPlayAgain: () => void;
  onBackToHub: () => void;
}) {
  const emoji = result.stars >= 3 ? '🏆' : result.stars >= 2 ? '🌟' : result.stars >= 1 ? '👏' : '💪';
  const message =
    result.stars >= 3 ? 'Outstanding!' : result.stars >= 2 ? 'Great work!' : result.stars >= 1 ? 'Good try!' : 'Keep practicing!';

  const isHighScore = result.stars >= 3;

  return (
    <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full relative">
      {/* Decorative confetti-inspired shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-8 left-6 w-3 h-3 rounded-full opacity-20 animate-float" style={{ backgroundColor: game.color }} />
        <div className="absolute top-16 right-10 w-2 h-2 rounded-full opacity-15 animate-float" style={{ backgroundColor: '#FFE66D', animationDelay: '0.5s' }} />
        <div className="absolute top-24 left-16 w-2.5 h-2.5 rounded-sm rotate-45 opacity-15 animate-float" style={{ backgroundColor: '#4ECDC4', animationDelay: '1s' }} />
        <div className="absolute top-12 right-20 w-2 h-2 rounded-sm rotate-12 opacity-15 animate-float" style={{ backgroundColor: '#A78BFA', animationDelay: '1.5s' }} />
      </div>

      <motion.div
        className="text-[100px] mb-5 drop-shadow-lg"
        initial={{ scale: 0 }}
        animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
        transition={{ type: 'spring' }}
      >
        {emoji}
      </motion.div>

      <motion.h1
        className="text-3xl font-extrabold mb-3"
        style={{
          background: `linear-gradient(135deg, ${game.color}, #FF8C42)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        {message}
      </motion.h1>

      {/* Premium score card */}
      <motion.div
        className="rounded-[20px] p-6 mb-4 w-full max-w-xs relative overflow-hidden"
        style={{
          background: `linear-gradient(145deg, white 0%, ${game.color}08 100%)`,
          boxShadow: `0 4px 24px ${game.color}15, 0 2px 12px rgba(45,45,58,0.06)`,
          border: `1px solid ${game.color}20`,
        }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {/* High score badge */}
        {isHighScore && (
          <div
            className="absolute -top-1 -right-1 rounded-bl-2xl rounded-tr-[18px] px-3 py-1 text-[10px] font-extrabold text-white uppercase tracking-wider"
            style={{ background: `linear-gradient(135deg, #FFD93D, #FF8C42)` }}
          >
            High Score!
          </div>
        )}
        <div className="text-center space-y-2">
          <p
            className="text-4xl font-extrabold"
            style={{
              background: `linear-gradient(135deg, ${game.color}, ${game.color}cc)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {result.score} / {result.total}
          </p>
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <p className="text-xs text-[#9B9BAB] font-semibold uppercase tracking-wide">Accuracy</p>
              <p className="text-lg font-extrabold text-[#2D2D3A]">{result.accuracy}%</p>
            </div>
            <div className="w-px h-8 bg-[#F0EAE0]" />
            <div className="text-center">
              <p className="text-xs text-[#9B9BAB] font-semibold uppercase tracking-wide">Time</p>
              <p className="text-lg font-extrabold text-[#2D2D3A]">{formatTime(result.timeSeconds)}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stars */}
      <motion.div
        className="flex gap-3 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
      >
        {[1, 2, 3].map((s) => (
          <motion.span
            key={s}
            className="text-5xl drop-shadow-md"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 + s * 0.15, type: 'spring' }}
          >
            {s <= result.stars ? '⭐' : '☆'}
          </motion.span>
        ))}
      </motion.div>

      {/* Difficulty badge */}
      <motion.div
        className="mb-6 text-sm text-[#9B9BAB] bg-white/60 rounded-full px-4 py-1.5 border border-[#F0EAE0]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {game.emoji} {game.title} - {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
      </motion.div>

      <div className="flex gap-3">
        <motion.button
          className="text-white rounded-[14px] px-7 py-3.5 font-bold cursor-pointer border border-white/20 text-[15px]"
          style={{ background: `linear-gradient(135deg, ${game.color}, ${game.color}cc)`, boxShadow: `0 4px 20px ${game.color}30` }}
          onClick={onPlayAgain}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🔄 Play Again
        </motion.button>
        <motion.button
          className="bg-white/80 backdrop-blur-sm rounded-[14px] px-7 py-3.5 font-bold cursor-pointer shadow-sm border border-[#F0EAE0] text-[#6B6B7B] text-[15px]"
          onClick={onBackToHub}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🎮 Games
        </motion.button>
      </div>
    </div>
  );
}

// ─── Main GamesPage Component ───────────────────────────────────────

export default function GamesPage() {
  const navigate = useNavigate();
  const { currentPlayer, showCelebration, showStarBurst } = useApp();
  const { playClick, playCelebration, speak } = useAudio();

  const [screen, setScreen] = useState<Screen>('hub');
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<GameDifficulty | null>(null);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  if (!currentPlayer) return <Navigate to="/" replace />;

  const selectedGame = selectedGameId ? gamesConfig.find((g) => g.id === selectedGameId) : null;
  const difficultyConfig = selectedGame?.difficulties.find((d) => d.level === selectedDifficulty);

  // Timer for timed games
  useEffect(() => {
    if (screen === 'playing' && difficultyConfig?.timeLimit && difficultyConfig.timeLimit > 0) {
      setTimer(difficultyConfig.timeLimit);
      timerRef.current = setInterval(() => {
        setTimer((t) => {
          if (t <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [screen, difficultyConfig]);

  // Trigger game-over when timer hits zero
  useEffect(() => {
    if (timer === 0 && screen === 'playing' && difficultyConfig?.timeLimit && difficultyConfig.timeLimit > 0) {
      handleGameFinish({
        score: 0,
        total: difficultyConfig.itemCount,
        accuracy: 0,
        timeSeconds: difficultyConfig.timeLimit,
        stars: 0,
      });
    }
  }, [timer]);

  function handleGameSelect(gameId: string) {
    playClick();
    setSelectedGameId(gameId);
    setScreen('difficulty');
  }

  function handleDifficultySelect(level: GameDifficulty) {
    playClick();
    setSelectedDifficulty(level);
    setScreen('playing');
    speak('Let\'s go!');
  }

  async function handleGameFinish(result: GameResult) {
    setGameResult(result);
    setScreen('gameover');
    if (timerRef.current) clearInterval(timerRef.current);

    if (result.stars >= 2) {
      playCelebration();
      showCelebration();
    }
    if (result.stars >= 1) {
      showStarBurst();
    }

    // Save to database
    if (currentPlayer?.id && selectedGameId && selectedDifficulty) {
      try {
        await db.gameScores.add({
          playerId: currentPlayer.id,
          gameId: selectedGameId,
          difficulty: selectedDifficulty,
          score: result.score,
          accuracy: result.accuracy,
          timeSeconds: result.timeSeconds,
          stars: result.stars,
          playedAt: new Date(),
        });

        if (result.stars > 0) {
          await db.stars.add({
            playerId: currentPlayer.id,
            category: 'games',
            starsEarned: result.stars,
            reason: `${selectedGame?.title} - ${selectedDifficulty}`,
            earnedAt: new Date(),
          });

          await db.profiles.update(currentPlayer.id, {
            totalStars: (currentPlayer.totalStars || 0) + result.stars,
            lastPlayedAt: new Date(),
          });
        }
      } catch {
        // Silently handle DB errors
      }
    }
  }

  function handlePlayAgain() {
    setGameResult(null);
    setScreen('playing');
  }

  function handleBackToHub() {
    setGameResult(null);
    setSelectedGameId(null);
    setSelectedDifficulty(null);
    setScreen('hub');
  }

  function handleBackFromDifficulty() {
    setSelectedGameId(null);
    setScreen('hub');
  }

  // ─── Game category chips ────────────────────────────────────────
  const gameCategories = [
    { label: 'All', emoji: '🎮', color: '#FF6B6B' },
    { label: 'Puzzle', emoji: '🧩', color: '#A78BFA' },
    { label: 'Word', emoji: '📝', color: '#4ECDC4' },
    { label: 'Memory', emoji: '🧠', color: '#FFE66D' },
    { label: 'Matching', emoji: '🃏', color: '#FF8C42' },
    { label: 'Quiz', emoji: '❓', color: '#6BCB77' },
  ];

  // Featured game (first game or could be based on recently played)
  const featuredGame = gamesConfig[0];

  // ─── Hub Screen ─────────────────────────────────────────────────

  if (screen === 'hub') {
    return (
      <div className="min-h-dvh bg-[#FFF8F0] pb-24 md:pb-8">
        {/* Header */}
        <div className="px-4 pt-4 md:px-8 md:pt-6">
          <div className="flex items-center justify-between mb-4">
            <NavButton onClick={() => navigate('/menu')} direction="back" />
            <h2 className="text-lg font-extrabold text-[#2D2D3A]">Mini Games</h2>
            <div className="w-14" />
          </div>
        </div>

        {/* Premium Hero Banner */}
        <div
          className="relative overflow-hidden px-4 pt-2 pb-6 mb-2"
          style={{ background: 'linear-gradient(180deg, #FFF0F0 0%, #FFF8F0 100%)' }}
        >
          {/* Floating decorative shapes */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-4 right-8 w-16 h-16 rounded-full opacity-[0.06]" style={{ backgroundColor: '#FF6B6B' }} />
            <div className="absolute top-10 left-6 w-10 h-10 rounded-xl rotate-12 opacity-[0.05]" style={{ backgroundColor: '#FF8C42' }} />
            <div className="absolute bottom-4 right-16 w-8 h-8 rounded-lg rotate-45 opacity-[0.05]" style={{ backgroundColor: '#A78BFA' }} />
            <div className="absolute bottom-8 left-12 w-6 h-6 rounded-full opacity-[0.06]" style={{ backgroundColor: '#4ECDC4' }} />
          </div>

          <div className="max-w-md mx-auto text-center relative">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <motion.div
                className="text-6xl mb-2 drop-shadow-lg inline-block"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🎮
              </motion.div>
              <h1
                className="text-[28px] font-extrabold mb-1"
                style={{
                  background: 'linear-gradient(135deg, #FF6B6B, #FF8C42)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Games
              </h1>
              <p className="text-[15px] font-medium text-[#6B6B7B]">Play, learn, have fun!</p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 md:max-w-3xl md:px-8">
          {/* Game Category Chips Rail */}
          <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide md:flex-wrap md:gap-3">
            {gameCategories.map((cat, i) => (
              <motion.button
                key={cat.label}
                className="rounded-full px-4 py-2 text-xs font-bold whitespace-nowrap cursor-pointer border transition-all flex items-center gap-1.5 flex-shrink-0"
                style={
                  i === 0
                    ? { background: `linear-gradient(135deg, #FF6B6B, #FF6B6Bdd)`, color: 'white', border: '1px solid transparent', boxShadow: '0 2px 10px rgba(255,107,107,0.2)' }
                    : { background: `${cat.color}10`, color: '#6B6B7B', border: `1px solid ${cat.color}25` }
                }
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Featured Game Hero Card */}
          <motion.button
            className="w-full rounded-[20px] p-5 mb-5 text-left cursor-pointer relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${featuredGame.color}, ${featuredGame.color}cc)`,
              boxShadow: `0 8px 32px ${featuredGame.color}30`,
            }}
            onClick={() => handleGameSelect(featuredGame.id)}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Decorative circles */}
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
            <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/10" />

            <div className="relative flex items-center gap-4">
              <motion.span
                className="text-6xl drop-shadow-lg"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 1.8, repeat: Infinity }}
              >
                {featuredGame.emoji}
              </motion.span>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-extrabold text-white/70 uppercase tracking-wider">Featured Game</span>
                <h3 className="text-xl font-extrabold text-white drop-shadow-sm">{featuredGame.title}</h3>
                <p className="text-sm text-white/80 truncate">{featuredGame.description}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-lg font-bold">▶</span>
              </div>
            </div>
          </motion.button>

          {/* Section Header */}
          <p className="text-[13px] font-extrabold text-[#6B6B7B] uppercase tracking-wider mb-3">All Games</p>

          {/* Premium Game Hub Cards */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-5">
            {gamesConfig.map((game, i) => {
              // Category-tinted backgrounds
              const tintMap: Record<string, string> = {
                'word-builder': '#FF6B6B',
                'number-pop': '#4ECDC4',
                'color-splash': '#FFB347',
                'animal-sounds': '#6BCB77',
                'shape-sort': '#A78BFA',
              };
              const tint = tintMap[game.id] || game.color;

              return (
                <motion.button
                  key={game.id}
                  className="rounded-[20px] p-5 cursor-pointer text-center relative overflow-hidden hover:shadow-[0_8px_24px_rgba(45,45,58,0.10)] transition-shadow duration-200"
                  style={{
                    background: `linear-gradient(145deg, ${tint}12, ${tint}06, white)`,
                    boxShadow: `0 2px 16px ${tint}18, 0 2px 8px rgba(45,45,58,0.04)`,
                    border: `1px solid ${tint}15`,
                  }}
                  onClick={() => handleGameSelect(game.id)}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', delay: i * 0.08 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Subtle corner accent */}
                  <div
                    className="absolute -top-3 -right-3 w-10 h-10 rounded-full opacity-[0.08]"
                    style={{ backgroundColor: tint }}
                  />

                  <motion.div
                    className="text-5xl mb-3 drop-shadow-md"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 1.5 + i * 0.2, repeat: Infinity }}
                  >
                    {game.emoji}
                  </motion.div>
                  <h3 className="font-extrabold text-[#2D2D3A] text-sm">{game.title}</h3>
                  <p className="text-xs text-[#6B6B7B] mt-1 leading-tight">{game.description}</p>
                  <div
                    className="mt-3 h-1.5 rounded-full mx-auto w-12"
                    style={{
                      background: `linear-gradient(90deg, ${tint}, ${tint}88)`,
                    }}
                  />
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ─── Difficulty Picker ──────────────────────────────────────────

  if (screen === 'difficulty' && selectedGame) {
    const diffEmojis: Record<GameDifficulty, string> = { easy: '🌱', medium: '🌟', hard: '🔥' };
    const diffColors: Record<GameDifficulty, string> = { easy: '#6BCB77', medium: '#FFE66D', hard: '#FF6B6B' };
    const diffSecondary: Record<GameDifficulty, string> = { easy: '#4ECDC4', medium: '#FF8C42', hard: '#FF8C42' };
    const diffTextColor: Record<GameDifficulty, string> = { easy: 'white', medium: '#2D2D3A', hard: 'white' };

    return (
      <div className="min-h-dvh bg-[#FFF8F0] px-4 pt-4 pb-24 md:px-8 md:pt-6 md:pb-8 flex flex-col">
        <div className="flex items-center justify-between mb-4 md:max-w-2xl md:mx-auto md:w-full">
          <NavButton onClick={handleBackFromDifficulty} direction="back" />
          <h2 className="text-lg font-extrabold text-[#2D2D3A]">
            {selectedGame.title}
          </h2>
          <div className="w-14" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full md:max-w-xl">
          <motion.div
            className="text-8xl mb-5 drop-shadow-lg"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {selectedGame.emoji}
          </motion.div>
          <motion.h1
            className="text-2xl font-extrabold text-[#2D2D3A] mb-2 text-center"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            Choose Difficulty
          </motion.h1>
          <motion.p
            className="text-[15px] font-medium text-[#6B6B7B] mb-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {selectedGame.description}
          </motion.p>

          <div className="flex flex-col gap-4 w-full">
            {selectedGame.difficulties.map((diff, i) => (
              <motion.button
                key={diff.level}
                className="rounded-[20px] p-5 flex items-center gap-4 cursor-pointer w-full border border-white/20 relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${diffColors[diff.level]}, ${diffSecondary[diff.level]})`,
                  boxShadow: `0 6px 24px ${diffColors[diff.level]}30`,
                }}
                onClick={() => handleDifficultySelect(diff.level)}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.1, type: 'spring', damping: 15 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {/* Decorative circle */}
                <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/10" />

                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl">{diffEmojis[diff.level]}</span>
                </div>
                <div className="text-left flex-1">
                  <span className="text-xl font-extrabold drop-shadow-md block" style={{ color: diffTextColor[diff.level] }}>{diff.label}</span>
                  <span className="text-sm opacity-80" style={{ color: diffTextColor[diff.level] }}>
                    {diff.description}
                    {diff.timeLimit ? ` (${diff.timeLimit}s)` : ' (no timer)'}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <span style={{ color: diffTextColor[diff.level] }} className="text-lg font-bold">▶</span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── Game Over ──────────────────────────────────────────────────

  if (screen === 'gameover' && selectedGame && selectedDifficulty && gameResult) {
    return (
      <div
        className="min-h-dvh px-4 pt-4 pb-24 flex flex-col relative overflow-hidden"
        style={{ background: `linear-gradient(180deg, ${selectedGame.color}08 0%, #FFF8F0 30%, #EDFAF8 100%)` }}
      >
        {/* Subtle top accent */}
        <div className="absolute top-0 left-0 right-0 h-1" style={{ background: `linear-gradient(90deg, ${selectedGame.color}40, ${selectedGame.color}10, transparent)` }} />

        <div className="flex items-center justify-between mb-4 relative">
          <NavButton onClick={handleBackToHub} direction="back" />
          <h2 className="text-lg font-extrabold text-[#2D2D3A]">
            Game Over!
          </h2>
          <div className="w-14" />
        </div>

        <GameOverScreen
          game={selectedGame}
          difficulty={selectedDifficulty}
          result={gameResult}
          onPlayAgain={handlePlayAgain}
          onBackToHub={handleBackToHub}
        />
      </div>
    );
  }

  // ─── Playing Screen ─────────────────────────────────────────────

  if (screen === 'playing' && selectedGame && selectedDifficulty && difficultyConfig) {
    const hasTimer = (difficultyConfig.timeLimit ?? 0) > 0;

    return (
      <div className="min-h-dvh bg-[#FFF8F0] px-4 pt-4 pb-24 md:px-8 md:pt-6 md:pb-8 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 md:max-w-2xl md:mx-auto md:w-full">
          <NavButton onClick={handleBackToHub} direction="back" />
          <h2 className="text-lg font-extrabold text-[#2D2D3A]">
            {selectedGame.title}
          </h2>
          <div className="flex items-center gap-2">
            {hasTimer && (
              <div
                className="flex items-center gap-1 bg-white rounded-full px-3 py-1 shadow-sm"
                style={{ color: timer <= 10 ? '#EF4444' : '#6B7280' }}
              >
                <span className="text-sm">⏱️</span>
                <span className="text-sm font-bold">{formatTime(timer)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Game content */}
        <AnimatePresence mode="wait">
          {selectedGame.id === 'word-builder' && (
            <WordBuilderGame
              key={`wb-${selectedDifficulty}`}
              difficulty={selectedDifficulty}
              itemCount={difficultyConfig.itemCount}
              onFinish={handleGameFinish}
            />
          )}
          {selectedGame.id === 'number-pop' && (
            <NumberPopGame
              key={`np-${selectedDifficulty}`}
              itemCount={difficultyConfig.itemCount}
              onFinish={handleGameFinish}
            />
          )}
          {selectedGame.id === 'color-splash' && (
            <ColorSplashGame
              key={`cs-${selectedDifficulty}`}
              difficulty={selectedDifficulty}
              itemCount={difficultyConfig.itemCount}
              onFinish={handleGameFinish}
            />
          )}
          {selectedGame.id === 'animal-sounds' && (
            <AnimalSoundsGame
              key={`as-${selectedDifficulty}`}
              itemCount={difficultyConfig.itemCount}
              onFinish={handleGameFinish}
            />
          )}
          {selectedGame.id === 'shape-sort' && (
            <ShapeSortGame
              key={`ss-${selectedDifficulty}`}
              difficulty={selectedDifficulty}
              itemCount={difficultyConfig.itemCount}
              onFinish={handleGameFinish}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Fallback
  return (
    <div className="min-h-dvh bg-cream p-4 flex items-center justify-center">
      <p className="text-gray-500">Loading...</p>
    </div>
  );
}
