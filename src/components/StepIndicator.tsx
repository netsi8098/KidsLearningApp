import { motion } from 'framer-motion';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export default function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      {/* Dots row */}
      <div className="flex items-center gap-1.5">
        {Array.from({ length: totalSteps }).map((_, i) => {
          const isCompleted = i < currentStep;
          const isCurrent = i === currentStep;

          return (
            <motion.div
              key={i}
              className={`rounded-full ${
                isCurrent
                  ? 'w-3.5 h-3.5 bg-coral'
                  : isCompleted
                    ? 'w-2.5 h-2.5 bg-coral/50'
                    : 'w-2.5 h-2.5 bg-gray-200'
              }`}
              animate={
                isCurrent
                  ? { scale: [1, 1.2, 1] }
                  : {}
              }
              transition={
                isCurrent
                  ? { duration: 1, repeat: Infinity }
                  : {}
              }
            />
          );
        })}
      </div>

      {/* Step text */}
      <p className="text-xs text-gray-400 font-medium">
        Step {currentStep + 1} of {totalSteps}
      </p>
    </div>
  );
}
