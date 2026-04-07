import { motion } from 'framer-motion';
import type { ContentBadge } from '../registry/types';

const badgeStyles: Record<ContentBadge, { bg: string; text: string; label: string }> = {
  new: { bg: 'bg-coral/10', text: 'text-coral', label: 'New' },
  popular: { bg: 'bg-sunny/15', text: 'text-amber-700', label: 'Popular' },
  'editors-pick': { bg: 'bg-grape/10', text: 'text-grape', label: "Editor's Pick" },
};

const tintPalette = [
  { bg: 'linear-gradient(135deg, #FFF5F5 0%, #FFFFFF 100%)', circle: '#FF6B6B' },
  { bg: 'linear-gradient(135deg, #F0FDFA 0%, #FFFFFF 100%)', circle: '#4ECDC4' },
  { bg: 'linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 100%)', circle: '#FF8C42' },
  { bg: 'linear-gradient(135deg, #F5F3FF 0%, #FFFFFF 100%)', circle: '#A78BFA' },
  { bg: 'linear-gradient(135deg, #FEFCE8 0%, #FFFFFF 100%)', circle: '#FFD93D' },
  { bg: 'linear-gradient(135deg, #F0FDF4 0%, #FFFFFF 100%)', circle: '#6BCB77' },
];

interface ContentCardProps {
  emoji: string;
  title: string;
  subtitle?: string;
  categoryBadge?: string;
  badges?: ContentBadge[];
  locked?: boolean;
  progress?: number;
  onClick?: () => void;
  delay?: number;
}

export default function ContentCard({
  emoji,
  title,
  subtitle,
  categoryBadge,
  badges,
  locked,
  progress,
  onClick,
  delay = 0,
}: ContentCardProps) {
  // Stable tint based on title hash
  const tintIndex = title.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % tintPalette.length;
  const tint = tintPalette[tintIndex];

  return (
    <motion.button
      className="rounded-[20px] p-4 text-left w-full cursor-pointer relative border border-[#E8E0D4]/60 overflow-hidden"
      style={{
        background: locked ? '#F5F0E8' : tint.bg,
        boxShadow: '0 2px 12px rgba(45,45,58,0.06)',
      }}
      onClick={onClick}
      initial={{ y: 15, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay, type: 'spring', damping: 20, stiffness: 300 }}
      whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(45,45,58,0.10)' }}
      whileTap={{ scale: 0.97 }}
    >
      {/* Locked overlay */}
      {locked && (
        <div className="absolute inset-0 z-10 rounded-[20px] backdrop-blur-[2px] bg-white/40 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shadow-md">
            <span className="text-lg">🔒</span>
          </div>
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Emoji in tinted circle */}
        <div
          className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
          style={{ backgroundColor: tint.circle + '18' }}
        >
          <span className="text-[28px] leading-none">{emoji}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className="font-extrabold text-[15px] text-gray-800 truncate leading-tight">{title}</span>
            {categoryBadge && (
              <span className="text-[10px] font-bold bg-[#F0EAE0]/80 text-gray-500 rounded-full px-2.5 py-0.5 flex-shrink-0 border border-[#E8E0D4]/40">
                {categoryBadge}
              </span>
            )}
          </div>

          {badges && badges.length > 0 && (
            <div className="flex gap-1.5 mb-1 flex-wrap">
              {badges.map((badge) => {
                const style = badgeStyles[badge];
                return (
                  <span
                    key={badge}
                    className={`text-[9px] font-bold ${style.bg} ${style.text} rounded-full px-2 py-0.5 tracking-wide`}
                  >
                    {style.label}
                  </span>
                );
              })}
            </div>
          )}

          {subtitle && (
            <p className="text-xs text-gray-400 truncate leading-relaxed">{subtitle}</p>
          )}

          {progress !== undefined && (
            <div className="w-full bg-[#F0EAE0] rounded-full h-2 mt-2.5 overflow-hidden">
              <motion.div
                className="h-2 rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #4ECDC4, #6BCB77)',
                }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, progress)}%` }}
                transition={{ duration: 0.6, delay: delay + 0.2, ease: 'easeOut' }}
              />
            </div>
          )}
        </div>
      </div>
    </motion.button>
  );
}
