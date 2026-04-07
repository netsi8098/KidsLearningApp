import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const featureDescriptions: Record<string, string> = {
  offline_packs: 'Download lessons for offline learning',
  all_content: 'Access 316+ learning activities',
  multiple_profiles: 'Create up to 5 player profiles',
  no_ads: 'Enjoy an ad-free experience',
  advanced_reports: 'Detailed learning analytics',
  custom_routines: 'Build custom daily routines',
  export_data: 'Export your child\'s learning data',
  priority_support: 'Priority customer support',
};

const premiumFeatureList = [
  { emoji: '📚', label: 'All 316+ activities' },
  { emoji: '📶', label: 'Offline learning packs' },
  { emoji: '👨\u200D👩\u200D👧\u200D👦', label: 'Up to 5 profiles' },
  { emoji: '🚫', label: 'No advertisements' },
  { emoji: '📊', label: 'Advanced reports' },
  { emoji: '📋', label: 'Custom routines' },
];

interface UpgradePromptProps {
  feature?: string;
  compact?: boolean;
}

export default function UpgradePrompt({ feature, compact = false }: UpgradePromptProps) {
  const navigate = useNavigate();

  if (compact) {
    return (
      <motion.div
        className="bg-gradient-to-r from-grape/8 to-indigo-400/8 rounded-[16px] p-3.5 flex items-center gap-3 border border-grape/10"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="w-10 h-10 rounded-[12px] bg-grape-soft flex items-center justify-center flex-shrink-0">
          <span className="text-lg">🔒</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-[#2D2D3A]">
            {feature ? featureDescriptions[feature] || 'Unlock this feature' : 'Upgrade to Premium'}
          </p>
          <p className="text-xs text-[#9B9BAB]">This content is part of Premium</p>
        </div>
        <motion.button
          className="bg-gradient-to-r from-grape to-indigo-400 text-white text-xs font-extrabold px-4 py-2 rounded-full cursor-pointer shadow-[0_2px_10px_rgba(167,139,250,0.25)] flex-shrink-0"
          onClick={() => navigate('/billing')}
          whileTap={{ scale: 0.95 }}
        >
          Upgrade
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-white rounded-[20px] shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-[#E2E8F0] p-6 text-center relative overflow-hidden"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-grape/4" />
        <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-teal/4" />
      </div>

      <div className="relative z-10">
        <motion.div
          className="w-16 h-16 mx-auto rounded-[18px] bg-grape-soft flex items-center justify-center mb-3"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.1 }}
        >
          <span className="text-3xl">🔒</span>
        </motion.div>

        <h3 className="text-lg font-extrabold text-[#2D2D3A] mb-1">Unlock Premium</h3>
        {feature && featureDescriptions[feature] && (
          <p className="text-sm text-[#9B9BAB] mb-4">{featureDescriptions[feature]}</p>
        )}

        <div className="text-left space-y-2.5 mb-5 bg-[#F8FAFC] rounded-[14px] p-4">
          {premiumFeatureList.map((f) => (
            <div key={f.label} className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm flex-shrink-0">
                <span className="text-base">{f.emoji}</span>
              </div>
              <span className="text-sm font-medium text-[#4B5563]">{f.label}</span>
            </div>
          ))}
        </div>

        <motion.button
          className="w-full bg-gradient-to-r from-grape to-indigo-400 text-white font-extrabold py-3.5 px-6 rounded-full shadow-[0_4px_16px_rgba(167,139,250,0.3)] cursor-pointer"
          onClick={() => navigate('/billing')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
        >
          Upgrade Now
        </motion.button>

        <p className="text-[11px] text-[#9B9BAB] mt-2.5 font-medium">14-day free trial, then $4.99/month</p>
      </div>
    </motion.div>
  );
}
