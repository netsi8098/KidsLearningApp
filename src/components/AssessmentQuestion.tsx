import { motion, AnimatePresence } from 'framer-motion';

interface AssessmentQuestionProps {
  question: string;
  emoji: string;
  options: string[];
  onAnswer: (answer: string) => void;
  questionNumber: number;
  totalQuestions: number;
}

export default function AssessmentQuestion({
  question,
  emoji,
  options,
  onAnswer,
  questionNumber,
  totalQuestions,
}: AssessmentQuestionProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={questionNumber}
        className="w-full max-w-md mx-auto text-center"
        initial={{ x: 80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -80, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {/* Question number badge */}
        <motion.div
          className="inline-block bg-teal/15 text-teal rounded-full px-4 py-1 text-xs font-bold mb-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.1 }}
        >
          {questionNumber} of {totalQuestions}
        </motion.div>

        {/* Large emoji */}
        <motion.div
          className="text-7xl mb-5"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.15 }}
        >
          {emoji}
        </motion.div>

        {/* Question text */}
        <motion.h2
          className="text-xl font-bold text-gray-800 mb-8 leading-relaxed px-2"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {question}
        </motion.h2>

        {/* 2x2 grid of answer buttons */}
        <div className="grid grid-cols-2 gap-3">
          {options.map((option, i) => (
            <motion.button
              key={`${questionNumber}-${option}`}
              className="bg-white rounded-2xl px-4 py-5 text-lg font-bold text-gray-700 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => onAnswer(option)}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: 'spring',
                damping: 15,
                stiffness: 250,
                delay: 0.25 + i * 0.07,
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.93 }}
            >
              {option}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
