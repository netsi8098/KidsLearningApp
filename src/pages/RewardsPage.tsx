import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useBadges } from '../hooks/useBadges';
import { useProgress } from '../hooks/useProgress';
import { useRediscovery } from '../hooks/useRediscovery';
import { extendedBadges } from '../registry/rewardConfig';
import BadgeCard from '../components/BadgeCard';
import NavButton from '../components/NavButton';
import StarCounter from '../components/StarCounter';
import type { ContentItem, ContentType } from '../registry/types';

type BadgeTab = 'all' | 'earned' | 'locked';
type RewardsSection = 'badges' | 'history' | 'favorites';
type FavFilter = 'all' | 'story' | 'audio' | 'game' | 'video' | 'lesson';
type FavSort = 'recent' | 'most-played' | 'alpha';

const badgeCategories = [
  { key: 'all', label: 'All' },
  { key: 'general', label: 'Stars' },
  { key: 'abc', label: 'ABC' },
  { key: 'numbers', label: 'Numbers' },
  { key: 'colors', label: 'Colors' },
  { key: 'shapes', label: 'Shapes' },
  { key: 'animals', label: 'Animals' },
  { key: 'quiz', label: 'Quiz' },
  { key: 'collections', label: 'Collections' },
  { key: 'skills', label: 'Skills' },
  { key: 'playlists', label: 'Playlists' },
  { key: 'streak', label: 'Streaks' },
  { key: 'variety', label: 'Variety' },
  { key: 'stories', label: 'Stories' },
  { key: 'artworks', label: 'Art' },
] as const;

/* ── Color map for content type badges & gradients ─────── */
const typeColorMap: Record<string, { bg: string; text: string; gradient: string; softBg: string }> = {
  story: { bg: '#F3EFFE', text: '#A78BFA', gradient: 'linear-gradient(135deg, #A78BFA, #C4B5FD)', softBg: '#F3EFFE' },
  audio: { bg: '#FFFCE8', text: '#D4A017', gradient: 'linear-gradient(135deg, #FFE66D, #FFD93D)', softBg: '#FFFCE8' },
  game: { bg: '#FFF0F0', text: '#FF6B6B', gradient: 'linear-gradient(135deg, #FF6B6B, #FF8E8E)', softBg: '#FFF0F0' },
  video: { bg: '#EDFAF8', text: '#4ECDC4', gradient: 'linear-gradient(135deg, #4ECDC4, #6FE0D9)', softBg: '#EDFAF8' },
  lesson: { bg: '#FFF3EB', text: '#FF8C42', gradient: 'linear-gradient(135deg, #FF8C42, #FFB07A)', softBg: '#FFF3EB' },
  cooking: { bg: '#FFF3EB', text: '#FF8C42', gradient: 'linear-gradient(135deg, #FF8C42, #FFB07A)', softBg: '#FFF3EB' },
  movement: { bg: '#FFF0F0', text: '#FF6B6B', gradient: 'linear-gradient(135deg, #FF6B6B, #FF8E8E)', softBg: '#FFF0F0' },
  alphabet: { bg: '#FFF0F0', text: '#FF6B6B', gradient: 'linear-gradient(135deg, #FF6B6B, #FF8E8E)', softBg: '#FFF0F0' },
  number: { bg: '#EDFAF8', text: '#4ECDC4', gradient: 'linear-gradient(135deg, #4ECDC4, #6FE0D9)', softBg: '#EDFAF8' },
  color: { bg: '#FFFCE8', text: '#D4A017', gradient: 'linear-gradient(135deg, #FFE66D, #FFD93D)', softBg: '#FFFCE8' },
  shape: { bg: '#F3EFFE', text: '#A78BFA', gradient: 'linear-gradient(135deg, #A78BFA, #C4B5FD)', softBg: '#F3EFFE' },
  animal: { bg: '#EDFAEF', text: '#6BCB77', gradient: 'linear-gradient(135deg, #6BCB77, #8DD98F)', softBg: '#EDFAEF' },
  coloring: { bg: '#F3EFFE', text: '#A78BFA', gradient: 'linear-gradient(135deg, #A78BFA, #C4B5FD)', softBg: '#F3EFFE' },
  emotion: { bg: '#EDFAEF', text: '#6BCB77', gradient: 'linear-gradient(135deg, #6BCB77, #8DD98F)', softBg: '#EDFAEF' },
  explorer: { bg: '#EDF5FF', text: '#74B9FF', gradient: 'linear-gradient(135deg, #74B9FF, #93CCFF)', softBg: '#EDF5FF' },
  homeactivity: { bg: '#FFF3EB', text: '#FF8C42', gradient: 'linear-gradient(135deg, #FF8C42, #FFB07A)', softBg: '#FFF3EB' },
  bodypart: { bg: '#FFF0F6', text: '#F472B6', gradient: 'linear-gradient(135deg, #F472B6, #F9A8D4)', softBg: '#FFF0F6' },
  lifeskill: { bg: '#EDFAEF', text: '#6BCB77', gradient: 'linear-gradient(135deg, #6BCB77, #8DD98F)', softBg: '#EDFAEF' },
  quiz: { bg: '#FFF3EB', text: '#FF8C42', gradient: 'linear-gradient(135deg, #FF8C42, #FFB07A)', softBg: '#FFF3EB' },
};

function getTypeColor(type: string) {
  return typeColorMap[type] ?? { bg: '#F5F0E8', text: '#6B6B7B', gradient: 'linear-gradient(135deg, #9B9BAB, #B0B0C0)', softBg: '#F5F0E8' };
}

/* ── Favorite filter/sort config ──────────────────────────── */
const favFilterChips: { key: FavFilter; label: string; emoji: string }[] = [
  { key: 'all', label: 'All', emoji: '' },
  { key: 'story', label: 'Stories', emoji: '📚' },
  { key: 'audio', label: 'Songs', emoji: '🎵' },
  { key: 'video', label: 'Videos', emoji: '🎬' },
  { key: 'game', label: 'Games', emoji: '🎮' },
  { key: 'lesson', label: 'Lessons', emoji: '📝' },
];

const favSortOptions: { key: FavSort; label: string }[] = [
  { key: 'recent', label: 'Recently Saved' },
  { key: 'alpha', label: 'Alphabetical' },
];

/* ── Section tab config ───────────────────────────────────── */
const sectionTabs: { key: RewardsSection; label: string; emoji: string }[] = [
  { key: 'badges', label: 'Badges', emoji: '🏅' },
  { key: 'history', label: 'History', emoji: '📜' },
  { key: 'favorites', label: 'Favorites', emoji: '❤️' },
];

/* ── Favorite category group config ───────────────────────── */
const favCategoryGroups: { type: ContentType; label: string; emoji: string }[] = [
  { type: 'story', label: 'Favorite Stories', emoji: '📚' },
  { type: 'audio', label: 'Favorite Songs', emoji: '🎵' },
  { type: 'game', label: 'Favorite Games', emoji: '🎮' },
  { type: 'video', label: 'Favorite Videos', emoji: '🎬' },
  { type: 'lesson', label: 'Favorite Lessons', emoji: '📝' },
];

export default function RewardsPage() {
  const navigate = useNavigate();
  const { currentPlayer } = useApp();
  const {
    earnedBadgeIds,
    badgeData,
    getBadgeProgressList,
    getNextBadge,
    getDaysOfLearning,
    totalStars,
  } = useBadges(currentPlayer?.id);
  const { starRecords } = useProgress(currentPlayer?.id);
  const {
    recentlyPlayed,
    continueWhereLeftOff,
    playAgain,
    favorites,
    favoriteIds,
    toggleUniversalFavorite,
  } = useRediscovery(currentPlayer?.id);
  const [activeTab, setActiveTab] = useState<BadgeTab>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [activeSection, setActiveSection] = useState<RewardsSection>('badges');
  const [favFilter, setFavFilter] = useState<FavFilter>('all');
  const [favSort, setFavSort] = useState<FavSort>('recent');

  if (!currentPlayer) return <Navigate to="/" replace />;

  // Use extended badges (25) — combine with original badge system
  const allBadges = extendedBadges.map((eb) => ({
    badge: { id: eb.id, name: eb.name, emoji: eb.emoji, description: eb.description, category: eb.category, threshold: eb.threshold },
    earned: earnedBadgeIds.has(eb.id),
  }));

  const progressList = getBadgeProgressList();
  const nextBadge = getNextBadge();

  // Merge extended badge data with progress data
  const extendedProgressList = allBadges.map((ab) => {
    const existing = progressList.find((p) => p.badge.id === ab.badge.id);
    return existing ?? {
      badge: ab.badge,
      earned: ab.earned,
      current: 0,
      total: ab.badge.threshold,
      ratio: 0,
      hint: `0/${ab.badge.threshold}`,
    };
  });

  const filteredBadges = extendedProgressList.filter((bp) => {
    if (activeTab === 'earned' && !bp.earned) return false;
    if (activeTab === 'locked' && bp.earned) return false;
    if (categoryFilter !== 'all' && bp.badge.category !== categoryFilter) return false;
    return true;
  });

  const earnedCount = extendedProgressList.filter((bp) => bp.earned).length;
  const lockedCount = extendedProgressList.filter((bp) => !bp.earned).length;
  const daysOfLearning = getDaysOfLearning();
  const recentStars = [...starRecords].reverse().slice(0, 20);

  // ── History: time-based grouping ────────────────────────
  const groupedHistory = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);
    const weekStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);

    const groups: { label: string; items: typeof recentStars }[] = [
      { label: 'Today', items: [] },
      { label: 'Yesterday', items: [] },
      { label: 'This Week', items: [] },
      { label: 'Earlier', items: [] },
    ];

    for (const record of recentStars) {
      const date = new Date(record.earnedAt);
      if (date >= todayStart) {
        groups[0].items.push(record);
      } else if (date >= yesterdayStart) {
        groups[1].items.push(record);
      } else if (date >= weekStart) {
        groups[2].items.push(record);
      } else {
        groups[3].items.push(record);
      }
    }

    return groups.filter((g) => g.items.length > 0);
  }, [recentStars]);

  // ── Favorites: filtered & sorted ────────────────────────
  const filteredFavorites = useMemo(() => {
    let items = [...favorites];

    // Filter by type
    if (favFilter !== 'all') {
      items = items.filter((item) => item.type === favFilter);
    }

    // Sort
    if (favSort === 'alpha') {
      items.sort((a, b) => a.title.localeCompare(b.title));
    }
    // 'recent' is default order from DB (most recent first)

    return items;
  }, [favorites, favFilter, favSort]);

  // ── Favorites: grouped by type for shelf view ───────────
  const favoritesByType = useMemo(() => {
    const map = new Map<ContentType, ContentItem[]>();
    for (const item of favorites) {
      const existing = map.get(item.type) ?? [];
      existing.push(item);
      map.set(item.type, existing);
    }
    return map;
  }, [favorites]);

  return (
    <div className="min-h-dvh bg-[#FFF8F0] px-4 pt-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <NavButton onClick={() => navigate('/menu')} direction="back" />
        <h2 className="text-lg font-extrabold text-[#2D2D3A]">My Rewards</h2>
        <StarCounter />
      </div>

      {/* Stats Summary */}
      <motion.div
        className="max-w-md mx-auto mb-6"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            emoji="⭐"
            value={totalStars}
            label="Total Stars"
            delay={0}
          />
          <StatCard
            emoji="🏅"
            value={earnedCount}
            label={`of ${extendedBadges.length} Badges`}
            delay={0.05}
          />
          <StatCard
            emoji="📅"
            value={daysOfLearning}
            label={daysOfLearning === 1 ? 'Day Learning' : 'Days Learning'}
            delay={0.1}
          />
        </div>
      </motion.div>

      {/* Next Achievement Section */}
      {nextBadge && (
        <motion.div
          className="max-w-md mx-auto mb-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <h3 className="text-[13px] font-extrabold text-[#6B6B7B] uppercase tracking-wider mb-3 flex items-center gap-2">
            <span>🎯</span> Next Achievement
          </h3>
          <div className="bg-gradient-to-r from-gold/20 to-gold/5 rounded-[20px] p-5 border border-gold/30 shadow-[0_2px_12px_rgba(255,217,61,0.1)]">
            <div className="flex items-center gap-4">
              <div className="text-5xl animate-float">{nextBadge.badge.emoji}</div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-base text-gray-800">{nextBadge.badge.name}</p>
                <p className="text-sm text-gray-600 mb-2">{nextBadge.badge.description}</p>
                <div className="w-full bg-white/60 rounded-full h-3 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: '#FFD93D' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.round(nextBadge.ratio * 100)}%` }}
                    transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
                  />
                </div>
                <p className="text-xs text-amber-700 font-semibold mt-1.5">{nextBadge.hint}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ══════════════════════════════════════════════════════════
          SECTION TABS: Badges / History / Favorites
         ══════════════════════════════════════════════════════════ */}
      <motion.div
        className="max-w-md mx-auto mb-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.18 }}
      >
        <div className="flex gap-2 p-1 bg-white rounded-[16px] shadow-[0_2px_12px_rgba(45,45,58,0.06)] border border-[#F0EAE0]">
          {sectionTabs.map((tab) => (
            <motion.button
              key={tab.key}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[12px] font-bold text-sm cursor-pointer transition-all ${
                activeSection === tab.key
                  ? 'bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] text-white shadow-[0_4px_16px_rgba(255,107,107,0.25)]'
                  : 'text-[#6B6B7B] hover:bg-[#FFF8F0]'
              }`}
              onClick={() => setActiveSection(tab.key)}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-sm">{tab.emoji}</span>
              <span>{tab.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════
          SECTION CONTENT — AnimatePresence for transitions
         ══════════════════════════════════════════════════════════ */}
      <AnimatePresence mode="wait">
        {/* ═══════════════════════════════════════════════
            BADGES SECTION (original, preserved)
           ═══════════════════════════════════════════════ */}
        {activeSection === 'badges' && (
          <motion.div
            key="badges"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            {/* Badge Tabs: All / Earned / Locked */}
            <motion.div
              className="max-w-md mx-auto mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex gap-2 mb-3">
                {([
                  { key: 'all' as BadgeTab, label: `All (${extendedBadges.length})` },
                  { key: 'earned' as BadgeTab, label: `Earned (${earnedCount})` },
                  { key: 'locked' as BadgeTab, label: `Locked (${lockedCount})` },
                ]).map((tab) => (
                  <motion.button
                    key={tab.key}
                    className={`px-4 py-2.5 rounded-[12px] font-bold text-sm cursor-pointer transition-all border ${
                      activeTab === tab.key
                        ? 'bg-amber-100 text-amber-700 border-amber-200 shadow-sm'
                        : 'bg-white text-[#6B6B7B] border-[#F0EAE0]'
                    }`}
                    onClick={() => setActiveTab(tab.key)}
                    whileTap={{ scale: 0.95 }}
                  >
                    {tab.label}
                  </motion.button>
                ))}
              </div>

              {/* Category filter chips */}
              <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-1 px-1">
                {badgeCategories.map((cat) => (
                  <button
                    key={cat.key}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-all border ${
                      categoryFilter === cat.key
                        ? 'bg-grape text-white border-grape/30 shadow-sm'
                        : 'bg-white text-[#6B6B7B] border-[#F0EAE0]'
                    }`}
                    onClick={() => setCategoryFilter(cat.key)}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Filtered Badges Grid */}
            <motion.div
              className="max-w-md mx-auto mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
            >
              {filteredBadges.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {filteredBadges.map((bp, i) => (
                    <BadgeCard
                      key={bp.badge.id}
                      badge={bp.badge}
                      earned={bp.earned}
                      delay={i * 0.03}
                      progress={bp.earned ? undefined : bp.current}
                      total={bp.earned ? undefined : bp.total}
                      hint={bp.earned ? undefined : bp.hint}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <span className="text-4xl block mb-2">🔍</span>
                  <p className="text-sm text-gray-400 font-medium">No badges in this category yet</p>
                </div>
              )}
            </motion.div>

            {/* All badges earned celebration */}
            {lockedCount === 0 && extendedBadges.length > 0 && (
              <motion.div
                className="max-w-md mx-auto mb-6 text-center bg-gradient-to-r from-gold/20 to-gold/10 rounded-2xl p-6 border border-gold/30"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
              >
                <div className="text-5xl mb-2">🎉</div>
                <p className="text-lg font-bold text-amber-700">All Badges Earned!</p>
                <p className="text-sm text-gray-600 mt-1">
                  You collected all {extendedBadges.length} badges. Amazing work!
                </p>
              </motion.div>
            )}

            {/* Star History Section */}
            {recentStars.length > 0 && (
              <motion.div
                className="max-w-md mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <h3 className="text-[13px] font-extrabold text-[#6B6B7B] uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span>📜</span> Star History
                </h3>
                <div className="space-y-2">
                  {recentStars.map((record, i) => (
                    <motion.div
                      key={record.id}
                      className="bg-white rounded-[14px] px-4 py-3 flex items-center gap-3 shadow-[0_2px_12px_rgba(45,45,58,0.06)] border border-[#F0EAE0]"
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.4 + i * 0.03 }}
                    >
                      <span className="text-xl">⭐</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#2D2D3A] truncate">{record.reason}</p>
                        <p className="text-xs text-[#9B9BAB]">
                          {new Date(record.earnedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-amber-600">+{record.starsEarned}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════
            HISTORY SECTION (New Premium)
           ═══════════════════════════════════════════════ */}
        {activeSection === 'history' && (
          <motion.div
            key="history"
            className="max-w-md mx-auto"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            {/* ── Continue Where You Left Off ──────────── */}
            {continueWhereLeftOff.length > 0 && (
              <motion.div
                className="mb-6"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.05 }}
              >
                <h3 className="text-[13px] font-extrabold text-[#6B6B7B] uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span>💫</span> Continue Where You Left Off
                </h3>
                <div
                  className="rounded-[20px] p-4 border"
                  style={{
                    background: 'linear-gradient(135deg, #FFF3EB 0%, #FFFCE8 50%, #EDFAF8 100%)',
                    borderColor: '#FFE0A040',
                    boxShadow: '0 4px 20px rgba(255,140,66,0.08)',
                  }}
                >
                  <div className="space-y-3">
                    {continueWhereLeftOff.map((item, i) => {
                      const tc = getTypeColor(item.type);
                      return (
                        <motion.button
                          key={item.id}
                          className="w-full flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-[16px] p-3.5 cursor-pointer border border-white/60 text-left"
                          style={{ boxShadow: '0 2px 12px rgba(45,45,58,0.06)' }}
                          onClick={() => navigate(item.route)}
                          initial={{ x: -15, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.1 + i * 0.06 }}
                          whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(45,45,58,0.10)' }}
                          whileTap={{ scale: 0.97 }}
                        >
                          {/* Emoji in tinted circle */}
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-2xl"
                            style={{ backgroundColor: tc.bg }}
                          >
                            {item.emoji}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-[#2D2D3A] truncate">{item.title}</p>
                            {/* Type badge */}
                            <span
                              className="inline-block mt-1 text-[9px] font-bold rounded-full px-2 py-0.5 uppercase tracking-wide"
                              style={{ backgroundColor: tc.bg, color: tc.text }}
                            >
                              {item.type}
                            </span>
                          </div>
                          {/* Continue CTA */}
                          <motion.div
                            className="flex-shrink-0 rounded-full px-3.5 py-2 text-xs font-bold text-white"
                            style={{
                              background: 'linear-gradient(135deg, #FF6B6B, #FF8E8E)',
                              boxShadow: '0 4px 12px rgba(255,107,107,0.25)',
                            }}
                            whileHover={{ scale: 1.05 }}
                          >
                            Resume
                          </motion.div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Recently Played Rail (horizontal scroll) ── */}
            {recentlyPlayed.length > 0 && (
              <motion.div
                className="mb-6"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <h3 className="text-[13px] font-extrabold text-[#6B6B7B] uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span>🕐</span> Recently Played
                </h3>
                <div className="flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
                  {recentlyPlayed.map((item, i) => {
                    const tc = getTypeColor(item.type);
                    return (
                      <motion.button
                        key={item.id}
                        className="flex-shrink-0 w-32 snap-start cursor-pointer text-left"
                        onClick={() => navigate(item.route)}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 + i * 0.05 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {/* Card with emoji on gradient */}
                        <div
                          className="w-32 aspect-square rounded-[20px] flex items-center justify-center mb-2 relative overflow-hidden border"
                          style={{
                            background: tc.gradient,
                            borderColor: 'rgba(255,255,255,0.3)',
                            boxShadow: '0 4px 16px rgba(45,45,58,0.10)',
                          }}
                        >
                          <span className="text-5xl drop-shadow-md">{item.emoji}</span>
                          {/* Play overlay */}
                          <div className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center shadow-sm">
                            <span className="text-[10px] ml-0.5" style={{ color: tc.text }}>▶</span>
                          </div>
                        </div>
                        <p className="text-xs font-bold text-[#2D2D3A] leading-tight line-clamp-2 px-0.5">{item.title}</p>
                        <span
                          className="inline-block mt-1 text-[8px] font-bold rounded-full px-1.5 py-0.5 uppercase tracking-wide"
                          style={{ backgroundColor: tc.bg, color: tc.text }}
                        >
                          {item.type}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ── Premium Timeline Grouped Star History ──── */}
            {groupedHistory.length > 0 && (
              <motion.div
                className="mb-6"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15 }}
              >
                <h3 className="text-[13px] font-extrabold text-[#6B6B7B] uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span>📜</span> Activity Timeline
                </h3>

                {/* Timeline container with left vertical line */}
                <div className="relative pl-6">
                  {/* Vertical timeline line */}
                  <div
                    className="absolute left-[9px] top-2 bottom-2 w-[2px] rounded-full"
                    style={{ background: 'linear-gradient(180deg, #4ECDC4, #A78BFA, #FF6B6B)' }}
                  />

                  {groupedHistory.map((group, gi) => (
                    <div key={group.label} className="mb-5 last:mb-0">
                      {/* Group header with timeline dot */}
                      <div className="flex items-center gap-3 mb-3 relative">
                        {/* Timeline dot */}
                        <div
                          className="absolute -left-6 w-[18px] h-[18px] rounded-full border-[3px] border-white flex items-center justify-center"
                          style={{
                            backgroundColor: gi === 0 ? '#4ECDC4' : gi === 1 ? '#A78BFA' : gi === 2 ? '#FF8C42' : '#9B9BAB',
                            boxShadow: `0 2px 8px ${gi === 0 ? 'rgba(78,205,196,0.3)' : gi === 1 ? 'rgba(167,139,250,0.3)' : gi === 2 ? 'rgba(255,140,66,0.3)' : 'rgba(155,155,171,0.2)'}`,
                          }}
                        />
                        {/* Date label with line */}
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-xs font-extrabold text-[#2D2D3A] whitespace-nowrap">{group.label}</span>
                          <div className="flex-1 h-[1px] bg-[#F0EAE0]" />
                          <span className="text-[10px] text-[#9B9BAB] font-bold">{group.items.length} {group.items.length === 1 ? 'activity' : 'activities'}</span>
                        </div>
                      </div>

                      {/* Group items */}
                      <div className="space-y-2">
                        {group.items.map((record, i) => (
                          <motion.div
                            key={record.id}
                            className="bg-white rounded-[16px] px-4 py-3 flex items-center gap-3 border border-[#F0EAE0]"
                            style={{ boxShadow: '0 2px 12px rgba(45,45,58,0.06)' }}
                            initial={{ x: -15, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.2 + gi * 0.08 + i * 0.03 }}
                            whileHover={{ boxShadow: '0 8px 24px rgba(45,45,58,0.10)', scale: 1.01 }}
                          >
                            {/* Star icon in tinted circle */}
                            <div className="w-10 h-10 rounded-full bg-[#FFFCE8] flex items-center justify-center flex-shrink-0">
                              <span className="text-lg">⭐</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-[#2D2D3A] truncate">{record.reason}</p>
                              <p className="text-[10px] text-[#9B9BAB] font-semibold mt-0.5">
                                {new Date(record.earnedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 bg-[#FFFCE8] rounded-full px-2.5 py-1 flex-shrink-0">
                              <span className="text-xs">⭐</span>
                              <span className="text-xs font-extrabold text-amber-600">+{record.starsEarned}</span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── Play Again Section ────────────────────── */}
            {playAgain.length > 0 && (
              <motion.div
                className="mb-6"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-[13px] font-extrabold text-[#6B6B7B] uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span>🔄</span> Play Again
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {playAgain.map((item, i) => {
                    const tc = getTypeColor(item.type);
                    return (
                      <motion.button
                        key={item.id}
                        className="bg-white rounded-[16px] p-3.5 text-left cursor-pointer border border-[#F0EAE0] relative overflow-hidden"
                        style={{ boxShadow: '0 2px 12px rgba(45,45,58,0.06)' }}
                        onClick={() => navigate(item.route)}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.25 + i * 0.05 }}
                        whileHover={{ scale: 1.03, boxShadow: '0 8px 24px rgba(45,45,58,0.10)' }}
                        whileTap={{ scale: 0.96 }}
                      >
                        {/* Decorative background circle */}
                        <div
                          className="absolute -right-3 -bottom-3 w-16 h-16 rounded-full opacity-[0.08]"
                          style={{ backgroundColor: tc.text }}
                        />
                        <div className="flex items-center gap-2.5 mb-2">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                            style={{ backgroundColor: tc.bg }}
                          >
                            {item.emoji}
                          </div>
                          {/* Play icon */}
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center ml-auto"
                            style={{ background: tc.gradient, boxShadow: `0 2px 8px ${tc.text}30` }}
                          >
                            <span className="text-white text-[8px] ml-0.5">▶</span>
                          </div>
                        </div>
                        <p className="text-xs font-bold text-[#2D2D3A] line-clamp-2 leading-tight relative z-10">{item.title}</p>
                        <span
                          className="inline-block mt-1.5 text-[8px] font-bold rounded-full px-2 py-0.5 uppercase tracking-wide relative z-10"
                          style={{ backgroundColor: tc.bg, color: tc.text }}
                        >
                          {item.type}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ── Empty History State ───────────────────── */}
            {recentlyPlayed.length === 0 && recentStars.length === 0 && (
              <motion.div
                className="text-center py-16 rounded-[24px] relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #F3EFFE 0%, #E8DFFD 100%)',
                  boxShadow: '0 4px 20px rgba(167,139,250,0.10)',
                }}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 20 }}
              >
                {/* Decorative circles */}
                <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-[#A78BFA]/5" />
                <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full bg-[#A78BFA]/5" />
                <motion.span
                  className="text-7xl block mb-4 relative z-10"
                  animate={{ y: [0, -6, 0], rotate: [0, -3, 3, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  🦊
                </motion.span>
                <p className="text-lg font-extrabold text-[#2D2D3A] mb-1 relative z-10">Your adventure awaits!</p>
                <p className="text-sm text-[#6B6B7B] mb-5 relative z-10 px-8">
                  Start exploring lessons, stories, and games to fill your history.
                </p>
                <motion.button
                  className="relative z-10 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, #A78BFA, #C4B5FD)',
                    boxShadow: '0 4px 20px rgba(167,139,250,0.30)',
                  }}
                  onClick={() => navigate('/discover')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>✨</span>
                  <span>Start Exploring</span>
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════
            FAVORITES SECTION (New Premium)
           ═══════════════════════════════════════════════ */}
        {activeSection === 'favorites' && (
          <motion.div
            key="favorites"
            className="max-w-md mx-auto"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            {/* ── Section header ───────────────────────── */}
            <div className="flex items-center gap-2 mb-4">
              <motion.span
                className="text-xl"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                ❤️
              </motion.span>
              <h3 className="text-base font-extrabold text-[#2D2D3A]">My Favorites</h3>
              {favorites.length > 0 && (
                <span className="text-[10px] font-bold text-[#9B9BAB] bg-[#F5F0E8] rounded-full px-2 py-0.5">
                  {favorites.length} saved
                </span>
              )}
            </div>

            {favorites.length > 0 && (
              <>
                {/* ── Filter Chips ────────────────────── */}
                <motion.div
                  className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide -mx-1 px-1 mb-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.08 }}
                >
                  {favFilterChips.map((chip) => {
                    const isActive = favFilter === chip.key;
                    return (
                      <motion.button
                        key={chip.key}
                        className={`flex items-center gap-1 px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-all border ${
                          isActive
                            ? 'text-white border-transparent'
                            : 'bg-white text-[#6B6B7B] border-[#F0EAE0]'
                        }`}
                        style={isActive ? {
                          background: 'linear-gradient(135deg, #FF6B6B, #FF8E8E)',
                          boxShadow: '0 4px 12px rgba(255,107,107,0.20)',
                        } : {}}
                        onClick={() => setFavFilter(chip.key)}
                        whileTap={{ scale: 0.95 }}
                      >
                        {chip.emoji && <span className="text-xs">{chip.emoji}</span>}
                        <span>{chip.label}</span>
                      </motion.button>
                    );
                  })}
                </motion.div>

                {/* ── Sort Row ───────────────────────── */}
                <motion.div
                  className="flex items-center gap-2 mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <span className="text-[10px] font-bold text-[#9B9BAB] uppercase tracking-wider">Sort:</span>
                  {favSortOptions.map((opt) => (
                    <button
                      key={opt.key}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full cursor-pointer transition-all border ${
                        favSort === opt.key
                          ? 'bg-[#2D2D3A] text-white border-[#2D2D3A]'
                          : 'bg-white text-[#6B6B7B] border-[#F0EAE0]'
                      }`}
                      onClick={() => setFavSort(opt.key)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </motion.div>
              </>
            )}

            {/* ── Shelf View: Grouped by Type ──────── */}
            {favorites.length > 0 && favFilter === 'all' && (
              <div className="space-y-6">
                {favCategoryGroups.map((group) => {
                  const items = favoritesByType.get(group.type);
                  if (!items || items.length === 0) return null;

                  const sortedItems = favSort === 'alpha'
                    ? [...items].sort((a, b) => a.title.localeCompare(b.title))
                    : items;

                  return (
                    <motion.div
                      key={group.type}
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.05 }}
                    >
                      {/* Shelf header */}
                      <div className="flex items-center gap-2 mb-2.5">
                        <span className="text-sm">{group.emoji}</span>
                        <h4 className="text-[12px] font-extrabold text-[#2D2D3A] uppercase tracking-wider">{group.label}</h4>
                        <span className="text-[10px] text-[#9B9BAB] font-bold">{items.length}</span>
                        <div className="flex-1" />
                      </div>

                      {/* Shelf divider (subtle warm line) */}
                      <div className="h-[1px] mb-3" style={{ background: 'linear-gradient(90deg, #F0EAE0, transparent)' }} />

                      {/* Horizontal scroll rail */}
                      <div className="flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
                        {sortedItems.map((item, i) => (
                          <FavoriteCard
                            key={item.id}
                            item={item}
                            index={i}
                            onPlay={() => navigate(item.route)}
                            onToggleFavorite={() => toggleUniversalFavorite(item.id)}
                            isFavorite={true}
                          />
                        ))}
                      </div>
                    </motion.div>
                  );
                })}

                {/* Items of other types not in groups */}
                {(() => {
                  const groupedTypes = new Set(favCategoryGroups.map((g) => g.type));
                  const ungroupedItems = favorites.filter((f) => !groupedTypes.has(f.type));
                  if (ungroupedItems.length === 0) return null;

                  const sortedUngrouped = favSort === 'alpha'
                    ? [...ungroupedItems].sort((a, b) => a.title.localeCompare(b.title))
                    : ungroupedItems;

                  return (
                    <motion.div
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.05 }}
                    >
                      <div className="flex items-center gap-2 mb-2.5">
                        <span className="text-sm">🌟</span>
                        <h4 className="text-[12px] font-extrabold text-[#2D2D3A] uppercase tracking-wider">Other Favorites</h4>
                        <span className="text-[10px] text-[#9B9BAB] font-bold">{ungroupedItems.length}</span>
                      </div>
                      <div className="h-[1px] mb-3" style={{ background: 'linear-gradient(90deg, #F0EAE0, transparent)' }} />
                      <div className="flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
                        {sortedUngrouped.map((item, i) => (
                          <FavoriteCard
                            key={item.id}
                            item={item}
                            index={i}
                            onPlay={() => navigate(item.route)}
                            onToggleFavorite={() => toggleUniversalFavorite(item.id)}
                            isFavorite={true}
                          />
                        ))}
                      </div>
                    </motion.div>
                  );
                })()}
              </div>
            )}

            {/* ── Filtered View (not "all") ────────── */}
            {favorites.length > 0 && favFilter !== 'all' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {filteredFavorites.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {filteredFavorites.map((item, i) => {
                      const tc = getTypeColor(item.type);
                      return (
                        <motion.button
                          key={item.id}
                          className="bg-white rounded-[16px] p-3.5 text-left cursor-pointer border border-[#F0EAE0] relative overflow-hidden"
                          style={{ boxShadow: '0 2px 12px rgba(45,45,58,0.06)' }}
                          onClick={() => navigate(item.route)}
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.05 + i * 0.04 }}
                          whileHover={{ scale: 1.03, boxShadow: '0 8px 24px rgba(45,45,58,0.10)' }}
                          whileTap={{ scale: 0.96 }}
                        >
                          {/* Heart badge */}
                          <motion.div
                            className="absolute top-2 right-2 z-10"
                            animate={{ scale: [1, 1.15, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                          >
                            <span className="text-sm" style={{ color: '#FF6B6B' }}>❤️</span>
                          </motion.div>

                          <div
                            className="w-full aspect-square rounded-[12px] flex items-center justify-center mb-2 relative"
                            style={{ background: tc.gradient }}
                          >
                            <span className="text-4xl drop-shadow-md">{item.emoji}</span>
                            {/* Play overlay */}
                            <div className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center shadow-sm">
                              <span className="text-[10px] ml-0.5" style={{ color: tc.text }}>▶</span>
                            </div>
                          </div>
                          <p className="text-xs font-bold text-[#2D2D3A] line-clamp-2 leading-tight">{item.title}</p>
                          <span
                            className="inline-block mt-1 text-[8px] font-bold rounded-full px-2 py-0.5 uppercase tracking-wide"
                            style={{ backgroundColor: tc.bg, color: tc.text }}
                          >
                            {item.type}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <span className="text-4xl block mb-2">🔍</span>
                    <p className="text-sm text-[#9B9BAB] font-medium">No favorites in this category</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── Empty Favorites State ─────────────── */}
            {favorites.length === 0 && (
              <motion.div
                className="text-center py-16 rounded-[24px] relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #FFFCE8 0%, #FFF8E0 100%)',
                  boxShadow: '0 4px 20px rgba(255,230,109,0.10)',
                }}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 20 }}
              >
                {/* Decorative floating hearts */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
                  <motion.span
                    className="absolute top-6 left-8 text-2xl opacity-[0.12]"
                    animate={{ y: [0, -8, 0], x: [0, 3, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    ❤️
                  </motion.span>
                  <motion.span
                    className="absolute top-12 right-10 text-lg opacity-[0.10]"
                    animate={{ y: [0, -6, 0], x: [0, -2, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  >
                    ❤️
                  </motion.span>
                  <motion.span
                    className="absolute bottom-8 left-12 text-xl opacity-[0.08]"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                  >
                    ❤️
                  </motion.span>
                  <motion.span
                    className="absolute bottom-12 right-8 text-sm opacity-[0.10]"
                    animate={{ y: [0, -5, 0], rotate: [0, 15, 0] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  >
                    ❤️
                  </motion.span>
                  <motion.span
                    className="absolute top-1/2 left-1/4 text-base opacity-[0.06]"
                    animate={{ y: [0, -12, 0] }}
                    transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
                  >
                    ❤️
                  </motion.span>
                </div>

                <motion.span
                  className="text-7xl block mb-4 relative z-10"
                  animate={{ y: [0, -5, 0], rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  🐰
                </motion.span>
                <p className="text-lg font-extrabold text-[#2D2D3A] mb-1 relative z-10">Start your collection!</p>
                <p className="text-sm text-[#6B6B7B] mb-5 relative z-10 px-6">
                  Tap ❤️ on anything you love to save it here
                </p>
                <motion.button
                  className="relative z-10 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, #FF6B6B, #FF8E8E)',
                    boxShadow: '0 4px 20px rgba(255,107,107,0.30)',
                  }}
                  onClick={() => navigate('/discover')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>❤️</span>
                  <span>Discover Content</span>
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   HELPER COMPONENTS
   ══════════════════════════════════════════════════════════ */

/** Small stat card used in the summary row */
function StatCard({
  emoji,
  value,
  label,
  delay,
}: {
  emoji: string;
  value: number;
  label: string;
  delay: number;
}) {
  return (
    <motion.div
      className="bg-white rounded-[20px] p-4 text-center shadow-[0_2px_12px_rgba(45,45,58,0.06)] border border-[#F0EAE0]"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', delay }}
    >
      <div className="text-3xl mb-1.5 drop-shadow-sm">{emoji}</div>
      <motion.p
        className="text-2xl font-extrabold text-amber-700"
        key={value}
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 0.3 }}
      >
        {value}
      </motion.p>
      <p className="text-[11px] text-[#6B6B7B] font-medium leading-tight">{label}</p>
    </motion.div>
  );
}

/** Premium Favorite Card for horizontal scroll rails */
function FavoriteCard({
  item,
  index,
  onPlay,
  onToggleFavorite,
  isFavorite,
}: {
  item: ContentItem;
  index: number;
  onPlay: () => void;
  onToggleFavorite: () => void;
  isFavorite: boolean;
}) {
  const tc = getTypeColor(item.type);

  return (
    <motion.div
      className="flex-shrink-0 w-36 snap-start relative"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.05 }}
    >
      <motion.button
        className="w-full text-left cursor-pointer"
        onClick={onPlay}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
      >
        {/* Card image area with gradient */}
        <div
          className="w-full aspect-square rounded-[20px] flex items-center justify-center mb-2 relative overflow-hidden"
          style={{
            background: tc.gradient,
            boxShadow: `0 4px 16px ${tc.text}20`,
          }}
        >
          <span className="text-5xl drop-shadow-md">{item.emoji}</span>

          {/* Pulsing heart badge (top-right) */}
          <motion.div
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center shadow-md cursor-pointer z-10"
            animate={{ scale: [1, 1.12, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
          >
            <span className="text-sm" style={{ color: '#FF6B6B' }}>❤️</span>
          </motion.div>

          {/* Play overlay */}
          <div className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center shadow-sm">
            <span className="text-[10px] ml-0.5" style={{ color: tc.text }}>▶</span>
          </div>
        </div>

        {/* Title & type badge */}
        <p className="text-xs font-bold text-[#2D2D3A] leading-tight line-clamp-2 px-0.5">{item.title}</p>
        <span
          className="inline-block mt-1 text-[8px] font-bold rounded-full px-2 py-0.5 uppercase tracking-wide"
          style={{ backgroundColor: tc.bg, color: tc.text }}
        >
          {item.type}
        </span>
      </motion.button>
    </motion.div>
  );
}
