import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface ChoiceButtonProps {
  label: string;
  isCorrect: boolean;
  onAnswer: (correct: boolean) => void;
  disabled: boolean;
  questionIndex: number;
  /** Index 0-3 for color assignment */
  colorIndex?: number;
}

const BUTTON_COLORS = [
  { bg: '#FF6B6B15', border: '#FF6B6B', text: '#2D2D3A' },  // coral
  { bg: '#4ECDC415', border: '#4ECDC4', text: '#2D2D3A' },  // teal
  { bg: '#FFE66D15', border: '#FFE66D', text: '#2D2D3A' },  // yellow
  { bg: '#A78BFA15', border: '#A78BFA', text: '#2D2D3A' },  // lavender
];

export default function ChoiceButton({ label, isCorrect, onAnswer, disabled, questionIndex, colorIndex = 0 }: ChoiceButtonProps) {
  const [state, setState] = useState<'idle' | 'correct' | 'wrong'>('idle');

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
      setTimeout(() => setState('idle'), 800);
    }
  }

  const color = BUTTON_COLORS[colorIndex % BUTTON_COLORS.length];

  const bgStyle =
    state === 'correct'
      ? { background: 'linear-gradient(135deg, #4CAF50, #66BB6A)', color: 'white', borderColor: '#4CAF50' }
      : state === 'wrong'
        ? { background: 'linear-gradient(135deg, #E74C3C, #EF5350)', color: 'white', borderColor: '#E74C3C' }
        : { background: color.bg, borderColor: color.border, color: color.text };

  return (
    <motion.button
      className="rounded-2xl px-6 py-4 font-display text-lg w-full cursor-pointer tap-bounce"
      style={{
        ...bgStyle,
        border: `2.5px solid ${bgStyle.borderColor}`,
        minHeight: '60px',
        boxShadow: state === 'correct'
          ? '0 4px 16px rgba(76,175,80,0.3)'
          : state === 'wrong'
            ? '0 4px 16px rgba(231,76,60,0.3)'
            : `0 2px 8px ${color.border}20`,
      }}
      onClick={handleClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.03 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      animate={
        state === 'wrong'
          ? { x: [0, -10, 10, -10, 10, 0] }
          : state === 'correct'
            ? { scale: [1, 1.08, 1] }
            : {}
      }
      transition={{ duration: 0.4 }}
    >
      <span className="flex items-center justify-center gap-2">
        {state === 'correct' && (
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <circle cx="11" cy="11" r="10" fill="white" fillOpacity="0.3" />
            <path d="M6 11L9.5 14.5L16 7.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        {state === 'wrong' && (
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <circle cx="11" cy="11" r="10" fill="white" fillOpacity="0.3" />
            <path d="M7 7L15 15M15 7L7 15" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        )}
        {label}
      </span>
    </motion.button>
  );
}
