import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface BigTileButtonProps {
  emoji: string;
  label: string;
  to: string;
  bgColor: string;
  delay?: number;
}

/** Lighten a hex color by mixing with white */
function lighten(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const lr = Math.round(r + (255 - r) * amount);
  const lg = Math.round(g + (255 - g) * amount);
  const lb = Math.round(b + (255 - b) * amount);
  return `rgb(${lr},${lg},${lb})`;
}

export default function BigTileButton({ emoji, label, to, bgColor, delay = 0 }: BigTileButtonProps) {
  const navigate = useNavigate();

  return (
    <motion.button
      className="rounded-[22px] flex flex-col items-center justify-center gap-2.5 w-full cursor-pointer relative overflow-hidden"
      style={{
        background: `linear-gradient(160deg, ${lighten(bgColor, 0.15)}, ${bgColor}, ${bgColor}DD)`,
        boxShadow: `0 8px 24px ${bgColor}35, 0 2px 6px rgba(0,0,0,0.04), inset 0 1px 1px rgba(255,255,255,0.25)`,
        aspectRatio: '1 / 1',
      }}
      onClick={() => navigate(to)}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', damping: 18, stiffness: 280, delay }}
      whileHover={{ scale: 1.06, y: -4, boxShadow: `0 14px 36px ${bgColor}45, 0 4px 12px rgba(0,0,0,0.08)` }}
      whileTap={{ scale: 0.94 }}
    >
      {/* Glass shine overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.05) 40%, transparent 60%)',
          borderRadius: 'inherit',
        }}
      />

      {/* Soft blob shapes */}
      <div
        className="absolute -top-8 -right-8 w-28 h-28 rounded-full pointer-events-none"
        style={{ background: 'rgba(255,255,255,0.12)', filter: 'blur(2px)' }}
      />
      <div
        className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full pointer-events-none"
        style={{ background: 'rgba(255,255,255,0.08)', filter: 'blur(2px)' }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, rgba(255,255,255,0.06), transparent 70%)` }}
      />

      {/* Emoji with 3D feel */}
      <motion.div
        className="relative z-10 flex items-center justify-center"
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.18)',
          backdropFilter: 'blur(4px)',
          boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.2), 0 4px 12px rgba(0,0,0,0.08)',
        }}
      >
        <span className="text-[40px] drop-shadow-md">{emoji}</span>
      </motion.div>

      {/* Label */}
      <span
        className="text-white text-[15px] font-extrabold relative z-10 tracking-tight"
        style={{ textShadow: '0 1px 4px rgba(0,0,0,0.15)' }}
      >
        {label}
      </span>

      {/* Bottom edge highlight */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[1px] pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)' }}
      />
    </motion.button>
  );
}
