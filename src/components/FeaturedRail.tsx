import { motion } from 'framer-motion';

interface FeaturedItem {
  emoji: string;
  title: string;
  route: string;
}

interface FeaturedRailProps {
  items: FeaturedItem[];
  onItemClick: (route: string) => void;
}

const warmTints = [
  { bg: 'linear-gradient(145deg, #FFF5F5 0%, #FFFFFF 100%)', circle: '#FF6B6B20' },
  { bg: 'linear-gradient(145deg, #F0FDFA 0%, #FFFFFF 100%)', circle: '#4ECDC420' },
  { bg: 'linear-gradient(145deg, #FFF7ED 0%, #FFFFFF 100%)', circle: '#FF8C4220' },
  { bg: 'linear-gradient(145deg, #F5F3FF 0%, #FFFFFF 100%)', circle: '#A78BFA20' },
  { bg: 'linear-gradient(145deg, #FEFCE8 0%, #FFFFFF 100%)', circle: '#FFD93D20' },
  { bg: 'linear-gradient(145deg, #F0FDF4 0%, #FFFFFF 100%)', circle: '#6BCB7720' },
];

export default function FeaturedRail({ items, onItemClick }: FeaturedRailProps) {
  if (items.length === 0) return null;

  return (
    <div className="mb-4">
      <h3 className="text-base font-extrabold text-gray-700 mb-3 flex items-center gap-1.5">
        Featured This Week{' '}
        <motion.span
          className="inline-block"
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          ⭐
        </motion.span>
      </h3>
      <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory -mx-4 px-4 scrollbar-hide">
        {items.map((item, i) => {
          const tint = warmTints[i % warmTints.length];
          return (
            <motion.button
              key={item.route}
              className="flex-shrink-0 snap-start rounded-2xl p-4 flex flex-col items-center gap-2 min-w-[120px] cursor-pointer border border-[#E8E0D4]/50 relative overflow-hidden"
              style={{
                background: tint.bg,
                boxShadow: '0 2px 10px rgba(45,45,58,0.05)',
              }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08, type: 'spring', damping: 20, stiffness: 300 }}
              whileHover={{ scale: 1.05, y: -2, boxShadow: '0 6px 20px rgba(45,45,58,0.09)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onItemClick(item.route)}
            >
              {/* Decorative sparkle dot */}
              <div
                className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full opacity-40"
                style={{ backgroundColor: tint.circle.replace('20', '') }}
              />
              {/* Emoji in tinted circle */}
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: tint.circle }}
              >
                <span className="text-[28px] leading-none">{item.emoji}</span>
              </div>
              <span className="text-[13px] font-bold text-gray-600 text-center leading-tight line-clamp-2">
                {item.title}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
