import { motion } from 'framer-motion';

export interface MenuTab {
  key: string;
  label: string;
  emoji: string;
}

interface MenuTabBarProps {
  tabs: MenuTab[];
  activeTab: string;
  onTabChange: (key: string) => void;
}

export default function MenuTabBar({ tabs, activeTab, onTabChange }: MenuTabBarProps) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 snap-x snap-mandatory scrollbar-none -mx-1 px-1">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <motion.button
            key={tab.key}
            className="flex-shrink-0 snap-start flex items-center gap-1.5 rounded-[14px] px-4 py-2 text-[13px] font-bold cursor-pointer relative overflow-hidden"
            style={
              isActive
                ? {
                    background: 'linear-gradient(135deg, #FF6B6B, #FF8C42)',
                    color: 'white',
                    boxShadow: '0 4px 14px rgba(255,107,107,0.25), inset 0 1px 1px rgba(255,255,255,0.2)',
                  }
                : {
                    background: 'rgba(255,255,255,0.7)',
                    backdropFilter: 'blur(8px)',
                    color: '#888',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                    border: '1px solid rgba(0,0,0,0.04)',
                  }
            }
            onClick={() => onTabChange(tab.key)}
            whileTap={{ scale: 0.95 }}
            animate={isActive ? { scale: 1 } : { scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          >
            {isActive && (
              <motion.div
                className="absolute inset-0 rounded-[14px]"
                layoutId="activeTabPill"
                style={{ background: 'linear-gradient(135deg, #FF6B6B, #FF8C42)' }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              />
            )}
            <span className="text-base relative z-10">{tab.emoji}</span>
            <span className="relative z-10">{tab.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
