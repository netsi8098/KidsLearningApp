import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../hooks/useSearch';
import ContentCard from '../components/ContentCard';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

// ── Extended filter chips (type, age group, duration) ────
const typeFilters = [
  { key: '', label: 'All', emoji: '🌈' },
  { key: 'lesson', label: 'Lessons', emoji: '📝' },
  { key: 'story', label: 'Stories', emoji: '📖' },
  { key: 'video', label: 'Videos', emoji: '🎬' },
  { key: 'game', label: 'Games', emoji: '🎮' },
  { key: 'audio', label: 'Songs', emoji: '🎵' },
  { key: 'cooking', label: 'Cooking', emoji: '🍳' },
  { key: 'coloring', label: 'Coloring', emoji: '🎨' },
];

// ── Suggested search terms ───────────────────────────────
const suggestedSearches = [
  { label: 'Animals', emoji: '🐾' },
  { label: 'Alphabet', emoji: '🔤' },
  { label: 'Colors', emoji: '🎨' },
  { label: 'Numbers', emoji: '🔢' },
  { label: 'Space', emoji: '🚀' },
  { label: 'Dinosaurs', emoji: '🦕' },
  { label: 'Music', emoji: '🎵' },
  { label: 'Cooking', emoji: '🍳' },
];

// ── Popular fallback items for zero-state ────────────────
const popularFallbacks = [
  { label: 'Animal Adventure', emoji: '🦁', route: '/animals' },
  { label: 'ABC Songs', emoji: '🔤', route: '/abc' },
  { label: 'Color Games', emoji: '🎨', route: '/colors' },
  { label: 'Bedtime Stories', emoji: '🌙', route: '/stories' },
];

// ── Simple "did you mean" suggestions ────────────────────
const commonTerms = [
  'animals', 'alphabet', 'numbers', 'colors', 'shapes', 'stories',
  'songs', 'games', 'space', 'dinosaurs', 'cooking', 'emotions',
  'yoga', 'dance', 'coloring', 'letters', 'video', 'music',
];

function getSuggestions(query: string): string[] {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase().trim();
  return commonTerms
    .filter((term) => {
      if (term === q) return false;
      // Simple edit distance check: starts similarly or shares 60%+ characters
      if (term.startsWith(q.slice(0, 2))) return true;
      const shared = [...q].filter((c) => term.includes(c)).length;
      return shared / q.length > 0.6;
    })
    .slice(0, 3);
}

// ── Filter chip color mapping ────────────────────────────
const filterChipColors: Record<string, { activeBg: string; activeShadow: string }> = {
  '': { activeBg: 'linear-gradient(135deg, #4ECDC4 0%, #6FE0D9 100%)', activeShadow: '0 4px 16px rgba(78,205,196,0.30)' },
  lesson: { activeBg: 'linear-gradient(135deg, #FF8C42 0%, #FFA366 100%)', activeShadow: '0 4px 16px rgba(255,140,66,0.30)' },
  story: { activeBg: 'linear-gradient(135deg, #A78BFA 0%, #C4AAFF 100%)', activeShadow: '0 4px 16px rgba(167,139,250,0.30)' },
  video: { activeBg: 'linear-gradient(135deg, #4ECDC4 0%, #6FE0D9 100%)', activeShadow: '0 4px 16px rgba(78,205,196,0.30)' },
  game: { activeBg: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)', activeShadow: '0 4px 16px rgba(255,107,107,0.30)' },
  audio: { activeBg: 'linear-gradient(135deg, #FFE66D 0%, #FFED8A 100%)', activeShadow: '0 4px 16px rgba(255,230,109,0.30)' },
  cooking: { activeBg: 'linear-gradient(135deg, #FF8C42 0%, #FFA366 100%)', activeShadow: '0 4px 16px rgba(255,140,66,0.30)' },
  coloring: { activeBg: 'linear-gradient(135deg, #6BCB77 0%, #8DD98D 100%)', activeShadow: '0 4px 16px rgba(107,203,119,0.30)' },
};

// ── Content type color for grouping headers ──────────────
const typeGroupColors: Record<string, { bg: string; text: string; label: string }> = {
  lesson: { bg: '#FFF3EB', text: '#FF8C42', label: 'Lessons' },
  story: { bg: '#F3EFFE', text: '#A78BFA', label: 'Stories' },
  video: { bg: '#EDFAF8', text: '#4ECDC4', label: 'Videos' },
  game: { bg: '#FFF0F0', text: '#FF6B6B', label: 'Games' },
  audio: { bg: '#FFFCE8', text: '#FF8C42', label: 'Songs' },
  cooking: { bg: '#FFF3EB', text: '#FF8C42', label: 'Cooking' },
  coloring: { bg: '#EDFAEF', text: '#6BCB77', label: 'Coloring' },
  alphabet: { bg: '#EDF5FF', text: '#74B9FF', label: 'Alphabet' },
  number: { bg: '#FFFCE8', text: '#FF8C42', label: 'Numbers' },
  color: { bg: '#EDFAEF', text: '#6BCB77', label: 'Colors' },
  shape: { bg: '#F3EFFE', text: '#A78BFA', label: 'Shapes' },
  animal: { bg: '#FFF3EB', text: '#FF8C42', label: 'Animals' },
  bodypart: { bg: '#FFF0F6', text: '#FD79A8', label: 'Body Parts' },
  movement: { bg: '#EDFAF8', text: '#4ECDC4', label: 'Movement' },
  homeactivity: { bg: '#FFF3EB', text: '#FF8C42', label: 'Home Activities' },
  explorer: { bg: '#EDF5FF', text: '#74B9FF', label: 'Explorer' },
  lifeskill: { bg: '#F3EFFE', text: '#A78BFA', label: 'Life Skills' },
  emotion: { bg: '#FFF0F6', text: '#FD79A8', label: 'Emotions' },
};

// ── Suggested search pill tint colors ────────────────────
const pillTints = [
  { bg: '#FFF0F0', text: '#FF6B6B' },
  { bg: '#EDFAF8', text: '#4ECDC4' },
  { bg: '#FFFCE8', text: '#FF8C42' },
  { bg: '#F3EFFE', text: '#A78BFA' },
  { bg: '#EDFAEF', text: '#6BCB77' },
  { bg: '#FFF3EB', text: '#FF8C42' },
  { bg: '#EDF5FF', text: '#74B9FF' },
  { bg: '#FFF0F6', text: '#FD79A8' },
];

// ── Max items for recent searches stored ─────────────────
const MAX_RECENT_SEARCHES = 6;
const STORAGE_KEY = 'klf-recent-searches';

function getRecentSearches(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(term: string) {
  try {
    const recent = getRecentSearches().filter((s) => s !== term);
    recent.unshift(term);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recent.slice(0, MAX_RECENT_SEARCHES)));
  } catch {
    // ignore storage errors
  }
}

function clearRecentSearches() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const navigate = useNavigate();
  const { results, search, isSearching } = useSearch();
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus when opening
  useEffect(() => {
    if (isOpen) {
      setRecentSearches(getRecentSearches());
      setTimeout(() => inputRef.current?.focus(), 300);
    } else {
      setQuery('');
      setActiveFilter('');
      setIsFocused(false);
    }
  }, [isOpen]);

  // Run search when query or filter changes
  useEffect(() => {
    search(query, activeFilter ? { type: activeFilter } : undefined);
  }, [query, activeFilter, search]);

  function handleResultTap(route: string) {
    // Save the search term before navigating
    if (query.trim()) {
      saveRecentSearch(query.trim());
    }
    onClose();
    navigate(route);
  }

  function handleClear() {
    setQuery('');
    inputRef.current?.focus();
  }

  const handleClearRecent = useCallback(() => {
    clearRecentSearches();
    setRecentSearches([]);
  }, []);

  function handleSuggestedTap(term: string) {
    setQuery(term);
    inputRef.current?.focus();
  }

  function handleRecentTap(term: string) {
    setQuery(term);
    inputRef.current?.focus();
  }

  // Group results by content type
  const groupedResults = useMemo(() => {
    if (results.length === 0) return [];
    const groups: Record<string, typeof results> = {};
    for (const item of results) {
      if (!groups[item.type]) groups[item.type] = [];
      groups[item.type].push(item);
    }
    return Object.entries(groups).sort(([, a], [, b]) => b.length - a.length);
  }, [results]);

  // Did you mean suggestions
  const didYouMean = useMemo(() => {
    if (!query || results.length > 3) return [];
    return getSuggestions(query);
  }, [query, results.length]);

  const showEmptySearchState = !query && !isSearching;
  const showNoResults = query.length > 0 && results.length === 0 && !isSearching;
  const showResults = results.length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-[#FFF8F0] flex flex-col"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          {/* ── Header ── */}
          <div className="p-4 pb-2">
            <div className="flex items-center gap-3 mb-4">
              <motion.button
                className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-lg cursor-pointer border border-[#F0EAE0]"
                style={{ boxShadow: '0 2px 8px rgba(45,45,58,0.06)' }}
                onClick={onClose}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                ✕
              </motion.button>
              <h2 className="text-xl font-extrabold text-[#2D2D3A]">Search</h2>
              <div className="flex-1" />
              {/* Result count when showing results */}
              {showResults && (
                <motion.span
                  className="text-[11px] font-bold text-[#9B9BAB] bg-white rounded-full px-3 py-1 border border-[#F0EAE0]"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  {results.length} result{results.length !== 1 ? 's' : ''}
                </motion.span>
              )}
            </div>

            {/* ── Premium Search input ── */}
            <div className="relative">
              <motion.span
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg"
                style={{ color: isFocused ? '#4ECDC4' : '#9B9BAB' }}
                animate={isFocused ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                transition={isFocused ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } : {}}
              >
                🔍
              </motion.span>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="What do you want to learn today?"
                className="w-full pl-11 pr-11 py-3.5 rounded-[20px] bg-white outline-none text-[#2D2D3A] font-semibold text-sm border border-[#F0EAE0] transition-shadow duration-200"
                style={{
                  boxShadow: isFocused
                    ? '0 4px 20px rgba(78,205,196,0.15), 0 0 0 2px rgba(78,205,196,0.25)'
                    : '0 2px 8px rgba(45,45,58,0.04)',
                }}
              />
              {/* Clear button with smooth appearance */}
              <AnimatePresence>
                {query && (
                  <motion.button
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[#F0EAE0] flex items-center justify-center cursor-pointer"
                    onClick={handleClear}
                    initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                    whileTap={{ scale: 0.85 }}
                  >
                    <span className="text-[#6B6B7B] text-xs font-bold">✕</span>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* ── Filter chips (shown when query is entered or results exist) ── */}
            {(query || showResults) && (
              <motion.div
                className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
              >
                {typeFilters.map((filter) => {
                  const isActive = activeFilter === filter.key;
                  const chipColor = filterChipColors[filter.key] ?? filterChipColors[''];
                  return (
                    <motion.button
                      key={filter.key}
                      className="rounded-full px-3.5 py-1.5 text-xs font-bold whitespace-nowrap cursor-pointer flex items-center gap-1.5 border"
                      style={
                        isActive
                          ? {
                              background: chipColor.activeBg,
                              color: '#FFFFFF',
                              borderColor: 'transparent',
                              boxShadow: chipColor.activeShadow,
                            }
                          : {
                              background: '#FFFFFF',
                              color: '#6B6B7B',
                              borderColor: '#F0EAE0',
                              boxShadow: '0 1px 3px rgba(45,45,58,0.04)',
                            }
                      }
                      onClick={() => setActiveFilter(filter.key)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="text-[11px]">{filter.emoji}</span>
                      {filter.label}
                    </motion.button>
                  );
                })}
              </motion.div>
            )}
          </div>

          {/* ── Results / States ── */}
          <div className="flex-1 overflow-y-auto px-4 pb-8">

            {/* ── Empty search state: Recent + Suggestions ── */}
            {showEmptySearchState && (
              <motion.div
                className="mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
              >
                {/* Recent searches */}
                {recentSearches.length > 0 && (
                  <div className="mb-5">
                    <div className="flex items-center justify-between mb-2.5">
                      <h3 className="text-[12px] font-extrabold text-[#6B6B7B] uppercase tracking-wider">Recent</h3>
                      <motion.button
                        className="text-[11px] font-bold text-[#FF6B6B] cursor-pointer"
                        onClick={handleClearRecent}
                        whileTap={{ scale: 0.95 }}
                      >
                        Clear all
                      </motion.button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((term, i) => (
                        <motion.button
                          key={term}
                          className="rounded-full px-3.5 py-2 text-[13px] font-bold cursor-pointer flex items-center gap-1.5 bg-white border border-[#F0EAE0]"
                          style={{ boxShadow: '0 1px 3px rgba(45,45,58,0.04)', color: '#2D2D3A' }}
                          onClick={() => handleRecentTap(term)}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.04 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <span className="text-[#9B9BAB] text-xs">🕐</span>
                          {term}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested searches */}
                <div className="mb-5">
                  <h3 className="text-[12px] font-extrabold text-[#6B6B7B] uppercase tracking-wider mb-2.5">
                    Try searching for...
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {suggestedSearches.map((s, i) => {
                      const tint = pillTints[i % pillTints.length];
                      return (
                        <motion.button
                          key={s.label}
                          className="rounded-full px-3.5 py-2 text-[13px] font-bold cursor-pointer flex items-center gap-1.5 border"
                          style={{
                            backgroundColor: tint.bg,
                            color: tint.text,
                            borderColor: tint.text + '15',
                          }}
                          onClick={() => handleSuggestedTap(s.label)}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 + i * 0.04 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <span>{s.emoji}</span>
                          {s.label}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Mascot prompt */}
                <motion.div
                  className="flex flex-col items-center mt-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.span
                    className="text-5xl mb-3 block"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    🔍
                  </motion.span>
                  <p className="font-extrabold text-[#2D2D3A] text-base">Start typing to search</p>
                  <p className="text-sm text-[#6B6B7B] mt-0.5">Find lessons, stories, games, and more!</p>
                </motion.div>
              </motion.div>
            )}

            {/* ── Did you mean? (typo-friendly) ── */}
            {query && didYouMean.length > 0 && results.length <= 3 && (
              <motion.div
                className="mb-4 bg-[#FFFCE8] rounded-[16px] p-3.5 border border-[#FFE66D]/20"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="text-[12px] font-bold text-[#6B6B7B] mb-2">Did you mean...?</p>
                <div className="flex flex-wrap gap-2">
                  {didYouMean.map((term) => (
                    <motion.button
                      key={term}
                      className="rounded-full bg-white px-3 py-1.5 text-[13px] font-bold text-[#2D2D3A] border border-[#F0EAE0] cursor-pointer"
                      style={{ boxShadow: '0 1px 3px rgba(45,45,58,0.04)' }}
                      onClick={() => handleSuggestedTap(term)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {term}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── No results (zero-state) ── */}
            {showNoResults && (
              <motion.div
                className="flex flex-col items-center justify-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {/* Mascot with speech bubble */}
                <div className="relative mb-4">
                  <motion.span
                    className="text-6xl block"
                    animate={{ rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    🦊
                  </motion.span>
                  {/* Speech bubble */}
                  <motion.div
                    className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white rounded-2xl px-4 py-2 border border-[#F0EAE0] whitespace-nowrap"
                    style={{ boxShadow: '0 4px 16px rgba(45,45,58,0.08)' }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <span className="text-xs font-bold text-[#6B6B7B]">Hmm, I couldn't find that!</span>
                    <div className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r border-b border-[#F0EAE0] rotate-45" />
                  </motion.div>
                </div>

                <p className="font-extrabold text-lg text-[#2D2D3A] mt-2">No results found</p>
                <p className="text-sm text-[#6B6B7B] mt-1 text-center px-4">
                  We couldn't find anything for "{query}". Try something else!
                </p>

                {/* Suggested popular items */}
                <div className="mt-5 w-full">
                  <p className="text-[12px] font-extrabold text-[#6B6B7B] uppercase tracking-wider mb-2.5 text-center">
                    Try these instead
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {popularFallbacks.map((item, i) => (
                      <motion.button
                        key={item.label}
                        className="rounded-full bg-white px-3.5 py-2 text-[13px] font-bold cursor-pointer flex items-center gap-1.5 border border-[#F0EAE0]"
                        style={{
                          boxShadow: '0 2px 8px rgba(45,45,58,0.04)',
                          color: '#2D2D3A',
                        }}
                        onClick={() => handleResultTap(item.route)}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + i * 0.06 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span>{item.emoji}</span>
                        {item.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Browse All button */}
                <motion.button
                  className="mt-5 text-white rounded-[14px] px-6 py-3 font-bold cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, #4ECDC4 0%, #6FE0D9 100%)',
                    boxShadow: '0 4px 20px rgba(78,205,196,0.25)',
                  }}
                  onClick={() => {
                    onClose();
                    navigate('/menu');
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Browse All Content
                </motion.button>
              </motion.div>
            )}

            {/* ── Results grouped by content type ── */}
            {showResults && (
              <div className="mt-2">
                {groupedResults.map(([type, items], groupIdx) => {
                  const groupStyle = typeGroupColors[type] ?? { bg: '#F0EAE0', text: '#6B6B7B', label: type };
                  return (
                    <motion.div
                      key={type}
                      className="mb-5"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: groupIdx * 0.06 }}
                    >
                      {/* Section header with type badge */}
                      {groupedResults.length > 1 && (
                        <div className="flex items-center gap-2 mb-2.5">
                          <span
                            className="text-[10px] font-bold rounded-full px-2.5 py-0.5 uppercase tracking-wide"
                            style={{ backgroundColor: groupStyle.bg, color: groupStyle.text }}
                          >
                            {groupStyle.label}
                          </span>
                          <div className="flex-1 h-[1px] bg-[#F0EAE0]" />
                          <span className="text-[10px] font-bold text-[#9B9BAB]">{items.length}</span>
                        </div>
                      )}

                      <div className="flex flex-col gap-2.5">
                        {items.map((item, i) => (
                          <ContentCard
                            key={`${item.type}-${item.id}`}
                            emoji={item.emoji}
                            title={item.title}
                            subtitle={item.category}
                            categoryBadge={item.type}
                            onClick={() => handleResultTap(item.route)}
                            delay={groupIdx * 0.04 + i * 0.03}
                          />
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
