import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface ChoiceButtonProps {
  label: string;
  isCorrect: boolean;
  onAnswer: (correct: boolean) => void;
  disabled: boolean;
  questionIndex: number;
}

export default function ChoiceButton({ label, isCorrect, onAnswer, disabled, questionIndex }: ChoiceButtonProps) {
  const [state, setState] = useState<'idle' | 'correct' | 'wrong'>('idle');

  // Reset state when question changes
  useEffect(() => {
    setState('idle');
  }, [questionIndex]);

  function handleClick() {
    if (disabled || state !== 'idle') return;
    if (isCorrect) {
      setState('correct');
      onAnswer(true);
    } else {
      setState('wrong');
      onAnswer(false);
      setTimeout(() => setState('idle'), 600);
    }
  }

  const bg =
    state === 'correct'
      ? 'bg-leaf text-white'
      : state === 'wrong'
        ? 'bg-coral text-white'
        : 'bg-white text-gray-800';

  return (
    <motion.button
      className={`rounded-2xl px-6 py-4 text-xl font-bold shadow-md w-full ${bg} cursor-pointer`}
      onClick={handleClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.03 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      animate={
        state === 'wrong'
          ? { x: [0, -10, 10, -10, 10, 0] }
          : state === 'correct'
            ? { scale: [1, 1.1, 1] }
            : {}
      }
      transition={{ duration: 0.4 }}
    >
      {label}
    </motion.button>
  );
}
