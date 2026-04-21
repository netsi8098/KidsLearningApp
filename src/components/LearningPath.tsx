/**
 * LearningPath — visual trail map of the child's learning journey.
 * Shows a winding path with nodes for each subject.
 * Completed = colored + check, Current = pulsing, Future = locked.
 */
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface PathNode {
  id: string;
  label: string;
  route: string;
  color: string;
  progress: number; // 0-100
}

interface LearningPathProps {
  nodes: PathNode[];
}

export default function LearningPath({ nodes }: LearningPathProps) {
  const navigate = useNavigate();

  return (
    <div className="relative py-4">
      {/* Winding path line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2" style={{ background: 'linear-gradient(180deg, #4ECDC4, #A78BFA, #FF6B6B, #FFE66D)' }} />

      <div className="space-y-6">
        {nodes.map((node, i) => {
          const isComplete = node.progress >= 100;
          const isCurrent = node.progress > 0 && node.progress < 100;
          const isLocked = node.progress === 0 && i > 0 && nodes[i - 1].progress < 50;
          const isLeft = i % 2 === 0;

          return (
            <motion.div
              key={node.id}
              className={`flex items-center gap-4 ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}
              initial={{ opacity: 0, x: isLeft ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              {/* Info card */}
              <div className={`flex-1 ${isLeft ? 'text-right' : 'text-left'}`}>
                <p className="font-display text-sm text-[#2D2D3A]">{node.label}</p>
                <p className="text-[10px] text-[#9B9BAB] font-bold">{node.progress}% complete</p>
              </div>

              {/* Node circle */}
              <motion.button
                className={`relative w-14 h-14 rounded-full flex items-center justify-center cursor-pointer z-10 ${isCurrent ? 'animate-glow-pulse' : ''}`}
                style={{
                  background: isComplete
                    ? `linear-gradient(135deg, ${node.color}, ${node.color}CC)`
                    : isLocked
                      ? '#E0E0E0'
                      : `${node.color}30`,
                  border: `3px solid ${isComplete ? node.color : isLocked ? '#BDBDBD' : node.color}`,
                  boxShadow: isComplete ? `0 4px 16px ${node.color}40` : 'none',
                }}
                onClick={() => !isLocked && navigate(node.route)}
                whileTap={!isLocked ? { scale: 0.9 } : undefined}
              >
                {isComplete ? (
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <path d="M5 11L9 15L17 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : isLocked ? (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <rect x="4" y="8" width="10" height="8" rx="2" stroke="#9E9E9E" strokeWidth="1.5" fill="none" />
                    <path d="M6 8V6C6 4.3 7.3 3 9 3C10.7 3 12 4.3 12 6V8" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                ) : (
                  <span className="font-display text-sm" style={{ color: node.color }}>{node.progress}%</span>
                )}
              </motion.button>

              {/* Spacer */}
              <div className="flex-1" />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
