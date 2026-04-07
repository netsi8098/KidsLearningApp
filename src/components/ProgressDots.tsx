import { motion } from 'framer-motion';

interface ProgressDotsProps {
  total: number;
  current: number;
  color?: string;
}

export default function ProgressDots({ total, current, color = '#FF6B6B' }: ProgressDotsProps) {
  // For large sets, show a compact progress bar instead of dots
  if (total > 16) {
    const pct = Math.round(((current + 1) / total) * 100);
    return (
      <div className="flex items-center gap-2.5 px-2">
        <div
          className="flex-1 h-[6px] rounded-full overflow-hidden"
          style={{ background: `${color}18` }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${color}, ${color}CC)` }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
        <span className="text-[11px] font-bold tabular-nums" style={{ color }}>{current + 1}/{total}</span>
      </div>
    );
  }

  return (
    <div className="flex gap-[6px] justify-center flex-wrap">
      {Array.from({ length: total }).map((_, i) => {
        const isActive = i === current;
        const isDone = i < current;
        return (
          <motion.div
            key={i}
            animate={{
              width: isActive ? 20 : 8,
              opacity: isDone ? 0.6 : 1,
            }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="h-2 rounded-full"
            style={{
              backgroundColor: isActive || isDone ? color : `${color}20`,
              boxShadow: isActive ? `0 0 8px ${color}40` : 'none',
            }}
          />
        );
      })}
    </div>
  );
}
