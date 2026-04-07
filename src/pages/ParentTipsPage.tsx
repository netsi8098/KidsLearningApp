import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useParentTips, type ParentTip, type TipCategory } from '../hooks/useParentTips';
import NavButton from '../components/NavButton';

const categories: { key: TipCategory | 'all' | 'saved'; label: string; emoji: string }[] = [
  { key: 'all', label: 'All', emoji: '📋' },
  { key: 'expert', label: 'Expert Tips', emoji: '🎓' },
  { key: 'routines', label: 'Routines', emoji: '📅' },
  { key: 'play', label: 'Play Ideas', emoji: '🧸' },
  { key: 'bedtime', label: 'Bedtime', emoji: '🌙' },
  { key: 'education', label: 'Education', emoji: '📚' },
  { key: 'saved', label: 'Saved', emoji: '💾' },
];

const formatBadgeStyles: Record<string, { bg: string; text: string }> = {
  article: { bg: 'bg-teal/15', text: 'text-teal' },
  checklist: { bg: 'bg-grape/15', text: 'text-grape' },
  quick_tip: { bg: 'bg-sunny/20', text: 'text-amber-700' },
};

const categoryBadgeStyles: Record<string, { bg: string; text: string }> = {
  expert: { bg: 'bg-coral/15', text: 'text-coral' },
  routines: { bg: 'bg-teal/15', text: 'text-teal' },
  play: { bg: 'bg-leaf/15', text: 'text-green-700' },
  bedtime: { bg: 'bg-grape/15', text: 'text-grape' },
  education: { bg: 'bg-sunny/20', text: 'text-amber-700' },
};

export default function ParentTipsPage() {
  const navigate = useNavigate();
  const { currentPlayer } = useApp();
  const { tips, savedTips, saveTip, unsaveTip, filterByCategory, category, isSaved } = useParentTips();

  // Parent gate
  const [unlocked, setUnlocked] = useState(false);
  const [gateAnswer, setGateAnswer] = useState('');
  const [gateError, setGateError] = useState(false);
  const [num1] = useState(() => Math.floor(Math.random() * 10) + 5);
  const [num2] = useState(() => Math.floor(Math.random() * 10) + 3);
  const correctAnswer = num1 + num2;

  // Detail modal
  const [selectedTip, setSelectedTip] = useState<ParentTip | null>(null);

  // Active tab (separate from filter category for "saved" tab)
  const [activeTab, setActiveTab] = useState<string>('all');

  if (!currentPlayer) return <Navigate to="/" replace />;

  function handleGateSubmit() {
    if (parseInt(gateAnswer) === correctAnswer) {
      setUnlocked(true);
    } else {
      setGateAnswer('');
      setGateError(true);
      setTimeout(() => setGateError(false), 2000);
    }
  }

  function handleTabChange(key: string) {
    setActiveTab(key);
    if (key !== 'saved') {
      filterByCategory(key as TipCategory | 'all');
    }
  }

  const displayTips = activeTab === 'saved' ? savedTips : tips;

  if (!unlocked) {
    return (
      <div className="min-h-dvh bg-[#F8FAFC] px-4 pt-4 pb-8 flex flex-col items-center justify-center">
        <motion.div className="text-6xl mb-4" initial={{ scale: 0 }} animate={{ scale: 1 }}>
          💡
        </motion.div>
        <h2 className="text-2xl font-bold text-[#2D2D3A] mb-2">Parent Tips</h2>
        <p className="text-[#6B6B7B] mb-6 text-center">Solve this to access parenting tips</p>
        <motion.div
          className="bg-white rounded-xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-[#E2E8F0] text-center max-w-xs w-full"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <p className="text-3xl font-bold text-[#2D2D3A] mb-4">
            {num1} + {num2} = ?
          </p>
          <input
            type="number"
            value={gateAnswer}
            onChange={(e) => setGateAnswer(e.target.value)}
            placeholder="Answer"
            className="w-full bg-[#F8FAFC] rounded-xl px-4 py-3 text-2xl text-center font-bold outline-none focus:ring-4 focus:ring-grape/20 border border-[#E2E8F0] mb-4"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleGateSubmit()}
          />
          {gateError && (
            <p className="text-coral font-bold text-sm mb-3">That&apos;s not right. Try again!</p>
          )}
          <div className="flex gap-3">
            <motion.button
              className="flex-1 bg-[#F1F5F9] text-[#6B6B7B] rounded-xl py-3 font-bold cursor-pointer"
              onClick={() => navigate(-1)}
              whileTap={{ scale: 0.95 }}
            >
              Back
            </motion.button>
            <motion.button
              className="flex-1 bg-grape text-white rounded-xl py-3 font-bold cursor-pointer"
              onClick={handleGateSubmit}
              whileTap={{ scale: 0.95 }}
            >
              Check
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#F8FAFC] px-4 pt-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <NavButton onClick={() => navigate(-1)} direction="back" />
        <h2 className="text-xl font-bold text-[#2D2D3A]">Parent Tips</h2>
        <div className="w-14" />
      </div>

      <div className="max-w-md mx-auto">
        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-3 snap-x snap-mandatory mb-4">
          {categories.map((cat) => (
            <motion.button
              key={cat.key}
              className={`flex-shrink-0 snap-start flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold cursor-pointer transition-colors ${
                activeTab === cat.key
                  ? 'bg-gradient-to-r from-coral to-[#FF8E8E] text-white shadow-[0_2px_8px_rgba(255,107,107,0.3)]'
                  : 'bg-white text-[#6B6B7B] border border-[#E2E8F0]'
              }`}
              onClick={() => handleTabChange(cat.key)}
              whileTap={{ scale: 0.95 }}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
              {cat.key === 'saved' && savedTips.length > 0 && (
                <span className="bg-white/30 text-white text-[10px] rounded-full px-1.5">
                  {savedTips.length}
                </span>
              )}
            </motion.button>
          ))}
        </div>

        {/* Tips list */}
        <div className="space-y-3">
          {displayTips.length === 0 && (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <span className="text-5xl block mb-3">{activeTab === 'saved' ? '💾' : '📋'}</span>
              <p className="font-bold text-[#2D2D3A]">
                {activeTab === 'saved' ? 'No saved tips yet' : 'No tips in this category'}
              </p>
              <p className="text-sm text-[#9B9BAB] mt-1">
                {activeTab === 'saved' ? 'Tap the bookmark icon to save tips' : 'Try a different category'}
              </p>
            </motion.div>
          )}

          {displayTips.map((tip, i) => {
            const catStyle = categoryBadgeStyles[tip.category] ?? { bg: 'bg-gray-100', text: 'text-gray-500' };
            const fmtStyle = formatBadgeStyles[tip.format] ?? { bg: 'bg-gray-100', text: 'text-gray-500' };
            const saved = isSaved(tip.id);

            return (
              <motion.div
                key={tip.id}
                className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-[#E2E8F0] p-4 cursor-pointer"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedTip(tip)}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl mt-0.5">{tip.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-bold text-sm text-[#2D2D3A]">{tip.title}</span>
                    </div>
                    <div className="flex gap-1.5 mb-2 flex-wrap">
                      <span className={`text-[10px] font-bold ${catStyle.bg} ${catStyle.text} rounded-full px-2 py-0.5`}>
                        {tip.category}
                      </span>
                      <span className={`text-[10px] font-bold ${fmtStyle.bg} ${fmtStyle.text} rounded-full px-2 py-0.5`}>
                        {tip.format.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-[#9B9BAB] line-clamp-2 leading-relaxed">{tip.preview}</p>
                  </div>
                  <motion.button
                    className="text-xl flex-shrink-0 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      saved ? unsaveTip(tip.id) : saveTip(tip.id);
                    }}
                    whileTap={{ scale: 0.8 }}
                  >
                    {saved ? '🔖' : '📄'}
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Tip detail modal */}
      <AnimatePresence>
        {selectedTip && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-end justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedTip(null)}
          >
            <motion.div
              className="bg-white rounded-t-[24px] w-full max-w-md max-h-[85vh] overflow-y-auto p-6 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Handle bar */}
              <div className="w-10 h-1 bg-[#E2E8F0] rounded-full mx-auto mb-5" />

              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{selectedTip.emoji}</span>
                <div>
                  <h3 className="font-bold text-lg text-[#2D2D3A]">{selectedTip.title}</h3>
                  <div className="flex gap-1.5 mt-1">
                    <span className={`text-[10px] font-bold ${categoryBadgeStyles[selectedTip.category]?.bg ?? 'bg-gray-100'} ${categoryBadgeStyles[selectedTip.category]?.text ?? 'text-gray-500'} rounded-full px-2 py-0.5`}>
                      {selectedTip.category}
                    </span>
                    <span className={`text-[10px] font-bold ${formatBadgeStyles[selectedTip.format]?.bg ?? 'bg-gray-100'} ${formatBadgeStyles[selectedTip.format]?.text ?? 'text-gray-500'} rounded-full px-2 py-0.5`}>
                      {selectedTip.format.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-sm text-[#6B6B7B] leading-relaxed whitespace-pre-line mb-6">
                {selectedTip.body}
              </div>

              <div className="flex gap-3">
                <motion.button
                  className={`flex-1 font-bold py-3 rounded-xl text-sm cursor-pointer ${
                    isSaved(selectedTip.id)
                      ? 'bg-[#FFF0F0] text-coral'
                      : 'bg-[#EDFAF8] text-teal'
                  }`}
                  onClick={() => {
                    isSaved(selectedTip.id)
                      ? unsaveTip(selectedTip.id)
                      : saveTip(selectedTip.id);
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isSaved(selectedTip.id) ? 'Unsave Tip' : 'Save Tip'}
                </motion.button>
                <motion.button
                  className="flex-1 bg-[#F1F5F9] text-[#6B6B7B] font-bold py-3 rounded-xl text-sm cursor-pointer"
                  onClick={() => setSelectedTip(null)}
                  whileTap={{ scale: 0.95 }}
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
