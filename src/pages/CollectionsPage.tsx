import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Navigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { useApp } from '../context/AppContext';
import { db } from '../db/database';
import { collections } from '../registry/collectionsConfig';
import NavButton from '../components/NavButton';

// Theme color mapping for collection categories
const themeColorMap: Record<string, { bg: string; soft: string; text: string }> = {
  '#1a1a2e': { bg: '#1a1a2e', soft: '#EDF5FF', text: '#1a1a2e' },
  '#6BCB77': { bg: '#6BCB77', soft: '#EDFAEF', text: '#2D7A3E' },
  '#FD79A8': { bg: '#FD79A8', soft: '#FFF0F6', text: '#C0407A' },
  '#4ECDC4': { bg: '#4ECDC4', soft: '#EDFAF8', text: '#2E8A83' },
  '#FF8C42': { bg: '#FF8C42', soft: '#FFF3EB', text: '#C06520' },
  '#A78BFA': { bg: '#A78BFA', soft: '#F3EFFE', text: '#7C3AED' },
};

function getTheme(coverColor: string) {
  return themeColorMap[coverColor] || { bg: coverColor, soft: '#FFF8F0', text: '#2D2D3A' };
}

export default function CollectionsPage() {
  const navigate = useNavigate();
  const { currentPlayer } = useApp();
  const [selectedTheme, setSelectedTheme] = useState<string>('all');

  const progressRecords = useLiveQuery(
    () =>
      currentPlayer?.id
        ? db.collectionProgress.where('playerId').equals(currentPlayer.id).toArray()
        : [],
    [currentPlayer?.id],
    []
  );

  if (!currentPlayer) return <Navigate to="/" replace />;

  const progressMap = new Map(
    progressRecords.map((p) => [p.collectionId, p])
  );

  const ageGroup = currentPlayer.ageGroup ?? '2-3';
  const ageCollections = collections.filter(
    (c) => !c.ageGroup || c.ageGroup === ageGroup
  );

  // Unique themes derived from learning goals
  const themes = useMemo(() => {
    const allGoals = new Set<string>();
    ageCollections.forEach((c) => c.learningGoals.forEach((g) => allGoals.add(g)));
    return Array.from(allGoals).slice(0, 6);
  }, [ageCollections]);

  // Filtered collections
  const filteredCollections = useMemo(() => {
    if (selectedTheme === 'all') return ageCollections;
    return ageCollections.filter((c) => c.learningGoals.includes(selectedTheme));
  }, [ageCollections, selectedTheme]);

  // Featured collection = first incomplete or first
  const featuredCollection = useMemo(() => {
    const inProgress = ageCollections.find((c) => {
      const prog = progressMap.get(c.id);
      return prog && !prog.completedAt && (prog.completedItems?.length ?? 0) > 0;
    });
    return inProgress || ageCollections[0];
  }, [ageCollections, progressMap]);

  return (
    <div className="min-h-dvh bg-[#FFF8F0] pb-8">
      {/* Premium Hero Banner */}
      <div
        className="relative overflow-hidden px-4 pt-4 pb-6"
        style={{
          background: 'linear-gradient(180deg, #EDFAF8 0%, #FFF8F0 100%)',
        }}
      >
        {/* Floating decorative elements */}
        <div className="absolute top-8 right-8 text-[36px] opacity-[0.07] animate-float select-none pointer-events-none">
          🎨
        </div>
        <div className="absolute bottom-2 left-6 text-[24px] opacity-[0.06] animate-bedtime-float-gentle select-none pointer-events-none">
          📦
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5 relative z-10">
          <NavButton onClick={() => navigate('/menu')} direction="back" />
        </div>

        {/* Hero content */}
        <div className="relative z-10">
          <motion.div
            className="text-[48px] mb-2 drop-shadow-md"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', duration: 0.5 }}
          >
            🗂️
          </motion.div>
          <motion.h1
            className="text-[26px] font-extrabold leading-tight mb-1"
            style={{
              background: 'linear-gradient(135deg, #4ECDC4 0%, #2EB5AD 50%, #1A9B93 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            Curated Collections
          </motion.h1>
          <motion.p
            className="text-[13px] font-semibold text-[#9B9BAB]"
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Themed learning bundles to explore together
          </motion.p>
        </div>
      </div>

      <div className="px-4">
        {/* Theme Filter Chips */}
        {themes.length > 0 && (
          <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-3 mb-4 scrollbar-hide">
            <motion.button
              className={`flex-shrink-0 px-4 py-2 rounded-full text-[12px] font-bold cursor-pointer whitespace-nowrap border transition-all ${
                selectedTheme === 'all'
                  ? 'text-white shadow-[0_2px_12px_rgba(78,205,196,0.25)] border-transparent'
                  : 'bg-white text-[#6B6B7B] border-[#F0EAE0]'
              }`}
              style={
                selectedTheme === 'all'
                  ? { background: 'linear-gradient(135deg, #4ECDC4 0%, #2EB5AD 100%)' }
                  : undefined
              }
              onClick={() => setSelectedTheme('all')}
              whileTap={{ scale: 0.95 }}
            >
              All Collections
            </motion.button>
            {themes.map((theme) => (
              <motion.button
                key={theme}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-[12px] font-bold cursor-pointer whitespace-nowrap border transition-all ${
                  selectedTheme === theme
                    ? 'text-white shadow-[0_2px_12px_rgba(78,205,196,0.25)] border-transparent'
                    : 'bg-white text-[#6B6B7B] border-[#F0EAE0] hover:bg-[#EDFAF8]/50'
                }`}
                style={
                  selectedTheme === theme
                    ? { background: 'linear-gradient(135deg, #4ECDC4 0%, #2EB5AD 100%)' }
                    : undefined
                }
                onClick={() => setSelectedTheme(theme)}
                whileTap={{ scale: 0.95 }}
              >
                {theme}
              </motion.button>
            ))}
          </div>
        )}

        {/* Featured Collection — Extra large hero card */}
        {featuredCollection && selectedTheme === 'all' && (
          <div className="mb-5">
            <h3 className="text-[13px] font-extrabold text-[#6B6B7B] uppercase tracking-wider mb-2.5">
              ✨ Spotlight
            </h3>
            <motion.button
              className="w-full rounded-[22px] overflow-hidden text-left cursor-pointer relative shadow-[0_6px_28px_rgba(45,45,58,0.12)]"
              onClick={() => navigate(`/collections/${featuredCollection.id}`)}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Gradient cover */}
              <div
                className="relative h-40 flex items-center px-6"
                style={{
                  background: `linear-gradient(135deg, ${featuredCollection.coverColor} 0%, ${featuredCollection.coverColor}CC 100%)`,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-black/20 rounded-t-[22px]" />
                <div className="relative z-10 flex items-center gap-4">
                  <span className="text-[64px] drop-shadow-lg">{featuredCollection.emoji}</span>
                  <div>
                    <h2 className="text-[22px] font-extrabold text-white leading-tight drop-shadow-sm">
                      {featuredCollection.title}
                    </h2>
                    <p className="text-white/80 text-[13px] mt-1 font-medium line-clamp-2">
                      {featuredCollection.description}
                    </p>
                  </div>
                </div>
              </div>
              {/* Bottom bar */}
              <div className="bg-white px-5 py-3.5 flex items-center gap-3">
                {(() => {
                  const prog = progressMap.get(featuredCollection.id);
                  const completed = prog?.completedItems?.length ?? 0;
                  const total = featuredCollection.contentIds.length;
                  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
                  return (
                    <>
                      <div className="flex-1 bg-[#F0EAE0]/60 rounded-full h-2.5">
                        <div
                          className="h-2.5 rounded-full transition-all"
                          style={{
                            width: `${pct}%`,
                            background: `linear-gradient(90deg, ${featuredCollection.coverColor}, ${featuredCollection.coverColor}AA)`,
                          }}
                        />
                      </div>
                      <span className="text-xs font-bold text-[#6B6B7B]">{completed}/{total}</span>
                      <span className="text-[10px] bg-[#EDFAF8] text-[#2E8A83] rounded-full px-2 py-0.5 font-bold">
                        ~{featuredCollection.estimatedMinutes} min
                      </span>
                    </>
                  );
                })()}
              </div>
            </motion.button>
          </div>
        )}

        {/* Section header */}
        <h3 className="text-[13px] font-extrabold text-[#6B6B7B] uppercase tracking-wider mb-3">
          📦 {selectedTheme === 'all' ? 'All Collections' : selectedTheme}
        </h3>

        {/* Collection Cards — Horizontal scrolling row of larger cards */}
        <div className="flex gap-4 overflow-x-auto -mx-4 px-4 pb-4 scrollbar-hide mb-2">
          {filteredCollections.map((col, i) => {
            const prog = progressMap.get(col.id);
            const completed = prog?.completedItems?.length ?? 0;
            const total = col.contentIds.length;
            const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
            const isComplete = !!prog?.completedAt;
            const theme = getTheme(col.coverColor);

            return (
              <motion.button
                key={col.id}
                className="flex-shrink-0 w-44 bg-white rounded-[20px] shadow-[0_4px_20px_rgba(45,45,58,0.08)] border border-[#F0EAE0] text-left cursor-pointer overflow-hidden relative hover:shadow-[0_8px_28px_rgba(45,45,58,0.12)] transition-shadow duration-200"
                onClick={() => navigate(`/collections/${col.id}`)}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ scale: 1.03, y: -3 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Cover area with collection color */}
                <div
                  className="h-28 flex items-center justify-center relative"
                  style={{
                    background: `linear-gradient(135deg, ${col.coverColor}20 0%, ${col.coverColor}40 100%)`,
                  }}
                >
                  <span className="text-[52px] drop-shadow-md">{col.emoji}</span>
                  {/* Color accent bar */}
                  <div
                    className="absolute top-0 left-0 w-full h-1 rounded-t-[20px]"
                    style={{ backgroundColor: col.coverColor }}
                  />
                  {/* Completion badge */}
                  {isComplete && (
                    <span className="absolute top-2 right-2 text-sm bg-white/90 rounded-full w-6 h-6 flex items-center justify-center shadow-sm">
                      ✅
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-3.5 pt-3">
                  <h3 className="font-extrabold text-[#2D2D3A] text-[14px] leading-tight line-clamp-2 mb-1">
                    {col.title}
                  </h3>
                  <p className="text-[11px] text-[#9B9BAB] line-clamp-2 mb-2.5 leading-relaxed">
                    {col.description}
                  </p>

                  {/* Progress bar */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 bg-[#F0EAE0]/60 rounded-full h-1.5">
                      <motion.div
                        className="h-1.5 rounded-full"
                        style={{ backgroundColor: col.coverColor }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, delay: i * 0.08 + 0.3 }}
                      />
                    </div>
                    <span className="text-[10px] text-[#6B6B7B] font-bold whitespace-nowrap">
                      {completed}/{total}
                    </span>
                  </div>

                  {/* Tags */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className="text-[9px] rounded-full px-2 py-0.5 font-bold"
                      style={{ background: theme.soft, color: theme.text }}
                    >
                      ~{col.estimatedMinutes} min
                    </span>
                    {col.learningGoals.slice(0, 1).map((goal) => (
                      <span
                        key={goal}
                        className="text-[9px] rounded-full px-2 py-0.5 font-bold"
                        style={{ background: theme.soft, color: theme.text }}
                      >
                        {goal}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Vertical list for easier browsing */}
        <h3 className="text-[13px] font-extrabold text-[#6B6B7B] uppercase tracking-wider mb-3 mt-2">
          🗂️ Browse All
        </h3>
        <div className="grid grid-cols-1 gap-3 max-w-md mx-auto">
          {filteredCollections.map((col, i) => {
            const prog = progressMap.get(col.id);
            const completed = prog?.completedItems?.length ?? 0;
            const total = col.contentIds.length;
            const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
            const isComplete = !!prog?.completedAt;
            const theme = getTheme(col.coverColor);

            return (
              <motion.button
                key={col.id}
                className="bg-white rounded-[20px] shadow-[0_2px_12px_rgba(45,45,58,0.06)] border border-[#F0EAE0] p-4 text-left cursor-pointer overflow-hidden relative hover:shadow-[0_8px_24px_rgba(45,45,58,0.10)] transition-shadow duration-200"
                onClick={() => navigate(`/collections/${col.id}`)}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Color accent bar */}
                <div
                  className="absolute top-0 left-0 w-full h-1 rounded-t-[20px]"
                  style={{ backgroundColor: col.coverColor }}
                />

                <div className="flex items-start gap-3.5 mt-1">
                  {/* Emoji in colored circle */}
                  <div
                    className="w-14 h-14 rounded-[16px] flex items-center justify-center flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${col.coverColor}18 0%, ${col.coverColor}30 100%)`,
                    }}
                  >
                    <span className="text-3xl">{col.emoji}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-[#2D2D3A] truncate text-[15px]">{col.title}</h3>
                      {isComplete && <span className="text-sm">✅</span>}
                    </div>
                    <p className="text-[11px] text-[#9B9BAB] mt-0.5 line-clamp-2 leading-relaxed">{col.description}</p>

                    {/* Progress bar */}
                    <div className="flex items-center gap-3 mt-2.5">
                      <div className="flex-1 bg-[#F0EAE0]/60 rounded-full h-2">
                        <motion.div
                          className="h-2 rounded-full"
                          style={{ backgroundColor: col.coverColor }}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6, delay: i * 0.05 + 0.3 }}
                        />
                      </div>
                      <span className="text-xs text-[#6B6B7B] font-bold whitespace-nowrap">
                        {completed}/{total}
                      </span>
                    </div>

                    {/* Tags */}
                    <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                      <span
                        className="text-[10px] rounded-full px-2.5 py-0.5 font-bold"
                        style={{ background: theme.soft, color: theme.text }}
                      >
                        ~{col.estimatedMinutes} min
                      </span>
                      {col.learningGoals.slice(0, 2).map((goal) => (
                        <span
                          key={goal}
                          className="text-[10px] rounded-full px-2.5 py-0.5 font-bold"
                          style={{ background: theme.soft, color: theme.text }}
                        >
                          {goal}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
