import { motion } from 'framer-motion';

interface RailItem {
  emoji: string;
  title: string;
  route: string;
}

interface RecommendationRailProps {
  title: string;
  items: RailItem[];
  onItemClick: (route: string) => void;
}

export default function RecommendationRail({
  title,
  items,
  onItemClick,
}: RecommendationRailProps) {
  if (items.length === 0) return null;

  return (
    <div className="mb-5">
      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">
        {title}
      </h3>
      <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
        {items.map((item, i) => (
          <motion.button
            key={`${item.route}-${item.title}-${i}`}
            className="flex-shrink-0 bg-white rounded-xl shadow-sm p-3 w-32 text-center cursor-pointer snap-start"
            onClick={() => onItemClick(item.route)}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-3xl block mb-1">{item.emoji}</span>
            <span className="text-xs font-bold text-gray-700 line-clamp-2 leading-tight">
              {item.title}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
