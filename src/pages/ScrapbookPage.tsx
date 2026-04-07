import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useScrapbook } from '../hooks/useScrapbook';
import { useMilestones } from '../hooks/useMilestones';
import NavButton from '../components/NavButton';
import CategoryFilterBar from '../components/CategoryFilterBar';
import ScrapbookCard from '../components/ScrapbookCard';

type FilterType = 'all' | 'milestone' | 'artwork' | 'badge' | 'mood';

const filterCategories = [
  { key: 'milestone', label: 'Milestones', emoji: '🌟' },
  { key: 'artwork', label: 'Artworks', emoji: '🎨' },
  { key: 'badge', label: 'Badges', emoji: '🏅' },
  { key: 'mood', label: 'Moods', emoji: '💭' },
];

function generateParentGateProblem(): { a: number; b: number; answer: number } {
  const a = Math.floor(Math.random() * 15) + 5;
  const b = Math.floor(Math.random() * 15) + 5;
  return { a, b, answer: a + b };
}

export default function ScrapbookPage() {
  const navigate = useNavigate();
  const { currentPlayer } = useApp();
  const playerId = currentPlayer?.id;
  const { entries } = useScrapbook(playerId);
  const { newMilestones, awardMilestone } = useMilestones(playerId);

  // Filter state
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  // Parent review toggle
  const [parentReviewMode, setParentReviewMode] = useState(false);
  const [showParentGate, setShowParentGate] = useState(false);
  const [gateProblem, setGateProblem] = useState(() => generateParentGateProblem());
  const [gateInput, setGateInput] = useState('');
  const [gateError, setGateError] = useState(false);

  if (!currentPlayer) return <Navigate to="/" replace />;

  // Award new milestones automatically
  useEffect(() => {
    if (newMilestones.length > 0) {
      newMilestones.forEach((m) => {
        awardMilestone(m.id);
      });
    }
  }, [newMilestones, awardMilestone]);

  // Filtered entries
  const filteredEntries = useMemo(() => {
    if (activeFilter === 'all') return entries;
    return entries.filter((e) => e.entryType === activeFilter);
  }, [entries, activeFilter]);

  // Parent gate handlers
  const handleParentGateToggle = useCallback(() => {
    if (parentReviewMode) {
      // Turn off without gate
      setParentReviewMode(false);
      return;
    }
    // Show gate to turn on
    setGateProblem(generateParentGateProblem());
    setGateInput('');
    setGateError(false);
    setShowParentGate(true);
  }, [parentReviewMode]);

  const handleGateSubmit = useCallback(() => {
    const inputNum = parseInt(gateInput, 10);
    if (inputNum === gateProblem.answer) {
      setShowParentGate(false);
      setParentReviewMode(true);
      setGateError(false);
    } else {
      setGateError(true);
    }
  }, [gateInput, gateProblem]);

  return (
    <div className="min-h-dvh bg-[#FFF8F0] px-4 pt-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <NavButton onClick={() => navigate('/menu')} direction="back" />
        <h2 className="text-xl font-extrabold text-[#A78BFA]">Learning Passport 📔</h2>
        <div className="w-14" />
      </div>

      {/* Parent Review Toggle */}
      <div className="flex items-center justify-between mb-4 bg-white rounded-[20px] shadow-[0_2px_12px_rgba(45,45,58,0.06)] border border-[#F0EAE0] px-4 py-3.5">
        <span className="text-sm font-bold text-[#2D2D3A]">Parent Review</span>
        <motion.button
          className={`w-12 h-7 rounded-full p-0.5 cursor-pointer flex items-center transition-colors ${
            parentReviewMode ? 'bg-grape justify-end' : 'bg-gray-300 justify-start'
          }`}
          onClick={handleParentGateToggle}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            className="w-6 h-6 bg-white rounded-full shadow-sm"
            layout
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </motion.button>
      </div>

      {/* Parent Gate Modal */}
      <AnimatePresence>
        {showParentGate && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-[20px] shadow-[0_8px_40px_rgba(45,45,58,0.12)] border border-[#F0EAE0] p-6 max-w-xs w-full"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <h3 className="font-bold text-[#2D2D3A] text-lg text-center mb-2">
                Parent Verification
              </h3>
              <p className="text-sm text-[#6B6B7B] text-center mb-4">
                Solve this to continue:
              </p>
              <p className="text-3xl font-extrabold text-center text-[#A78BFA] mb-4">
                {gateProblem.a} + {gateProblem.b} = ?
              </p>
              <input
                type="number"
                inputMode="numeric"
                className="w-full border-2 border-[#F0EAE0] rounded-[14px] px-4 py-3 text-center text-xl font-bold focus:outline-none focus:border-[#A78BFA] transition-colors"
                value={gateInput}
                onChange={(e) => {
                  setGateInput(e.target.value);
                  setGateError(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleGateSubmit();
                }}
                placeholder="?"
                autoFocus
              />
              {gateError && (
                <p className="text-coral text-sm font-bold text-center mt-2">
                  Incorrect, try again!
                </p>
              )}
              <div className="flex gap-3 mt-4">
                <motion.button
                  className="flex-1 bg-[#FFF8F0] border border-[#F0EAE0] text-[#6B6B7B] font-bold py-2.5 rounded-[12px] cursor-pointer"
                  onClick={() => setShowParentGate(false)}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  className="flex-1 bg-gradient-to-r from-[#A78BFA] to-[#C4B5FD] text-white font-bold py-2.5 rounded-[12px] cursor-pointer shadow-[0_4px_16px_rgba(167,139,250,0.25)]"
                  onClick={handleGateSubmit}
                  whileTap={{ scale: 0.95 }}
                >
                  Submit
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Parent Review Summary */}
      <AnimatePresence>
        {parentReviewMode && (
          <motion.div
            className="bg-[#F3EFFE] rounded-[20px] p-5 mb-4 border border-[#E8DFFD]"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <h3 className="font-bold text-[#A78BFA] text-sm mb-3">
              Summary for {currentPlayer.name}
            </h3>
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="bg-white rounded-[14px] p-3 text-center shadow-[0_2px_8px_rgba(45,45,58,0.04)]">
                <p className="font-extrabold text-[#2D2D3A] text-lg">
                  {entries.length}
                </p>
                <p className="text-[#9B9BAB]">Total Entries</p>
              </div>
              <div className="bg-white rounded-[14px] p-3 text-center shadow-[0_2px_8px_rgba(45,45,58,0.04)]">
                <p className="font-extrabold text-[#2D2D3A] text-lg">
                  {entries.filter((e) => e.entryType === 'milestone').length}
                </p>
                <p className="text-[#9B9BAB]">Milestones</p>
              </div>
              <div className="bg-white rounded-[14px] p-3 text-center shadow-[0_2px_8px_rgba(45,45,58,0.04)]">
                <p className="font-extrabold text-[#2D2D3A] text-lg">
                  {entries.filter((e) => e.entryType === 'artwork').length}
                </p>
                <p className="text-[#9B9BAB]">Artworks</p>
              </div>
              <div className="bg-white rounded-[14px] p-3 text-center shadow-[0_2px_8px_rgba(45,45,58,0.04)]">
                <p className="font-extrabold text-[#2D2D3A] text-lg">
                  {entries.filter((e) => e.entryType === 'badge').length}
                </p>
                <p className="text-[#9B9BAB]">Badges</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Filter */}
      <div className="mb-4">
        <CategoryFilterBar
          categories={filterCategories}
          activeCategory={activeFilter}
          onCategoryChange={(key) => setActiveFilter(key as FilterType)}
        />
      </div>

      {/* New Milestones Banner */}
      <AnimatePresence>
        {newMilestones.length > 0 && (
          <motion.div
            className="bg-[#FFFCEB] border border-[#FFE0A0] rounded-[20px] p-5 mb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <p className="font-bold text-amber-700 text-sm mb-2">
              New Milestones Earned!
            </p>
            <div className="flex flex-wrap gap-2">
              {newMilestones.map((m) => (
                <span
                  key={m.id}
                  className="bg-white rounded-full px-3.5 py-1.5 text-xs font-bold text-amber-600 shadow-[0_2px_8px_rgba(45,45,58,0.06)]"
                >
                  {m.emoji} {m.title}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timeline of entries */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeFilter}
          className="flex flex-col gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {filteredEntries.length === 0 ? (
            <motion.div
              className="text-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-6xl mb-4">📔</p>
              <p className="text-[#2D2D3A] font-extrabold text-lg mb-1">
                Your passport is empty!
              </p>
              <p className="text-[#9B9BAB] text-sm">
                Start learning to fill your passport!
              </p>
            </motion.div>
          ) : (
            filteredEntries.map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <ScrapbookCard
                  entryType={entry.entryType}
                  title={entry.title}
                  emoji={entry.emoji}
                  description={entry.description}
                  imageUrl={entry.imageUrl}
                  createdAt={entry.createdAt}
                />
              </motion.div>
            ))
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
