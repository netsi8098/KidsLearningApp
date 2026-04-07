import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useRecommendations } from '../hooks/useRecommendations';
import NavButton from '../components/NavButton';
import SearchOverlay from '../components/SearchOverlay';
import RecommendationRail from '../components/RecommendationRail';
import { collections } from '../registry/collectionsConfig';
import { playlists } from '../registry/playlistsConfig';
import { getContentByBadge } from '../registry/releaseConfig';
import { resolveContentIds, contentRegistry } from '../registry/contentRegistry';

// ── Category shortcut configuration ──────────────────────
const categoryShortcuts = [
  { label: 'Stories', emoji: '📖', route: '/stories', color: '#A78BFA', softBg: '#F3EFFE', count: 0, type: 'story' },
  { label: 'Games', emoji: '🎮', route: '/games', color: '#FF6B6B', softBg: '#FFF0F0', count: 0, type: 'game' },
  { label: 'Videos', emoji: '🎬', route: '/videos', color: '#4ECDC4', softBg: '#EDFAF8', count: 0, type: 'video' },
  { label: 'Songs', emoji: '🎵', route: '/audio', color: '#FFE66D', softBg: '#FFFCE8', count: 0, type: 'audio' },
  { label: 'Lessons', emoji: '📝', route: '/lessons', color: '#FF8C42', softBg: '#FFF3EB', count: 0, type: 'lesson' },
  { label: 'Activities', emoji: '🎨', route: '/coloring', color: '#6BCB77', softBg: '#EDFAEF', count: 0, type: 'coloring' },
];

// ── Floating decorative shapes ───────────────────────────
function FloatingShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <motion.div
        className="absolute -top-4 -right-6 w-20 h-20 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.08) 0%, transparent 70%)' }}
        animate={{ y: [0, -8, 0], x: [0, 4, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-12 -left-8 w-16 h-16 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(78,205,196,0.08) 0%, transparent 70%)' }}
        animate={{ y: [0, 6, 0], x: [0, -3, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
      <motion.div
        className="absolute top-6 right-8 w-10 h-10 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(255,230,109,0.10) 0%, transparent 70%)' }}
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
      <motion.div
        className="absolute -top-2 left-1/3 w-6 h-6"
        style={{ background: 'rgba(255,107,107,0.06)', borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%' }}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

export default function DiscoveryPage() {
  const navigate = useNavigate();
  const { currentPlayer } = useApp();
  const { recommendations } = useRecommendations(currentPlayer?.id);
  const [searchOpen, setSearchOpen] = useState(false);

  if (!currentPlayer) return <Navigate to="/" replace />;

  // Sections derived from recommendations
  const recommendedForYou = recommendations.slice(0, 6);

  // "Quick 5-min Picks" - videos and short stories (considered short content)
  const quickPicks = recommendations
    .filter((r) => r.type === 'video' || r.type === 'story')
    .slice(0, 6);

  // "Try Something New" - items the player hasn't completed (novelty-based)
  // These would have high novelty scores - just grab from the bottom of
  // the recs (lower affinity = truly new territory)
  const trySomethingNew = [...recommendations]
    .reverse()
    .slice(0, 6);

  // Compute category counts from the registry
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of contentRegistry) {
      counts[item.type] = (counts[item.type] ?? 0) + 1;
    }
    return counts;
  }, []);

  // Trending items (popular badge)
  const trendingItems = useMemo(() => {
    const ids = getContentByBadge('popular');
    return resolveContentIds(ids).slice(0, 8);
  }, []);

  // New this week items
  const newThisWeekItems = useMemo(() => {
    const ids = getContentByBadge('new');
    return resolveContentIds(ids).slice(0, 8);
  }, []);

  function handleItemClick(route: string) {
    navigate(route);
  }

  // Greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const greetingEmoji = hour < 12 ? '🌅' : hour < 17 ? '☀️' : '🌙';

  return (
    <div className="min-h-dvh bg-[#FFF8F0] px-4 pt-4 pb-8">
      {/* ── Discovery Header with decorative elements ── */}
      <div className="relative mb-5">
        <FloatingShapes />
        <div className="flex items-center justify-between relative z-10">
          <NavButton onClick={() => navigate('/menu')} direction="back" />
          <motion.div
            className="text-center flex-1"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <h1 className="text-xl font-extrabold text-[#2D2D3A]">
              Discover
            </h1>
          </motion.div>
          <div className="w-14" /> {/* Spacer for alignment */}
        </div>

        {/* Greeting line */}
        <motion.p
          className="text-center text-[13px] font-semibold text-[#6B6B7B] mt-2"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          {greetingEmoji} {greeting}, {currentPlayer.name}! What shall we explore?
        </motion.p>
      </div>

      {/* ── Premium Search Bar with mascot helper ── */}
      <motion.button
        className="w-full bg-white rounded-[20px] px-4 py-3.5 flex items-center gap-3 mb-6 cursor-pointer border border-[#F0EAE0] relative overflow-visible"
        style={{ boxShadow: '0 2px 12px rgba(45,45,58,0.06), 0 0 0 1px rgba(45,45,58,0.02)' }}
        onClick={() => setSearchOpen(true)}
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        whileHover={{ scale: 1.01, boxShadow: '0 8px 24px rgba(45,45,58,0.10)' }}
        whileTap={{ scale: 0.99 }}
      >
        {/* Animated search icon */}
        <motion.span
          className="text-[#9B9BAB] text-lg flex-shrink-0"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          🔍
        </motion.span>
        <span className="text-[#9B9BAB] text-sm font-medium flex-1 text-left">
          Search lessons, stories, videos...
        </span>

        {/* Mascot helper peeking from the right */}
        <motion.div
          className="absolute -right-1 -top-3 flex items-end"
          initial={{ x: 10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.6, type: 'spring', damping: 15, stiffness: 200 }}
        >
          <div className="relative">
            <motion.span
              className="text-2xl block"
              animate={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              🦊
            </motion.span>
            {/* Speech bubble tip */}
            <motion.div
              className="absolute -left-[90px] -top-7 bg-white rounded-xl px-2.5 py-1 shadow-sm border border-[#F0EAE0] whitespace-nowrap"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2 }}
            >
              <span className="text-[10px] font-bold text-[#6B6B7B]">What do you want to learn?</span>
              <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-white border-r border-b border-[#F0EAE0] rotate-[-45deg]" />
            </motion.div>
          </div>
        </motion.div>
      </motion.button>

      {/* ── Visual Category Shortcuts Grid ── */}
      <motion.div
        className="mb-7"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-[13px] font-extrabold text-[#6B6B7B] uppercase tracking-wider mb-3">Browse Categories</h2>
        <div className="grid grid-cols-2 gap-3">
          {categoryShortcuts.map((cat, i) => {
            const count = categoryCounts[cat.type] ?? 0;
            return (
              <motion.button
                key={cat.type}
                className="rounded-[20px] p-4 text-left cursor-pointer border relative overflow-hidden"
                style={{
                  backgroundColor: cat.softBg,
                  borderColor: cat.color + '20',
                  boxShadow: '0 2px 12px rgba(45,45,58,0.04)',
                }}
                onClick={() => navigate(cat.route)}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + i * 0.05, type: 'spring', damping: 20, stiffness: 300 }}
                whileHover={{ scale: 1.03, boxShadow: '0 8px 24px rgba(45,45,58,0.08)' }}
                whileTap={{ scale: 0.97 }}
              >
                {/* Decorative circle */}
                <div
                  className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full opacity-[0.07]"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-2xl block mb-1.5">{cat.emoji}</span>
                <p className="text-[13px] font-extrabold text-[#2D2D3A] leading-tight">{cat.label}</p>
                {count > 0 && (
                  <p className="text-[10px] font-bold text-[#9B9BAB] mt-0.5">{count} items</p>
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* ── Trending / New / Favorites Rails ── */}
      <div className="max-w-md mx-auto">

        {/* Trending Now Rail */}
        {trendingItems.length > 0 && (
          <motion.div
            className="mb-5"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-sm">🔥</span>
              <h3 className="text-[13px] font-extrabold text-[#6B6B7B] uppercase tracking-wider">Trending Now</h3>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
              {trendingItems.map((item, i) => (
                <motion.button
                  key={item.id}
                  className="flex-shrink-0 bg-white rounded-[20px] p-3 w-36 text-left cursor-pointer snap-start border border-[#F0EAE0] relative overflow-hidden"
                  style={{ boxShadow: '0 2px 12px rgba(45,45,58,0.06)' }}
                  onClick={() => handleItemClick(item.route)}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                  whileHover={{ scale: 1.04, boxShadow: '0 8px 24px rgba(45,45,58,0.10)' }}
                  whileTap={{ scale: 0.96 }}
                >
                  <span className="text-2xl block mb-1">{item.emoji}</span>
                  <p className="text-xs font-extrabold text-[#2D2D3A] line-clamp-2 leading-tight">{item.title}</p>
                  <span
                    className="inline-block mt-1.5 text-[9px] font-bold rounded-full px-2 py-0.5 uppercase tracking-wide"
                    style={{
                      backgroundColor: item.type === 'story' ? '#F3EFFE' : item.type === 'game' ? '#FFF0F0' : item.type === 'video' ? '#EDFAF8' : '#FFF3EB',
                      color: item.type === 'story' ? '#A78BFA' : item.type === 'game' ? '#FF6B6B' : item.type === 'video' ? '#4ECDC4' : '#FF8C42',
                    }}
                  >
                    {item.type}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* New This Week Rail */}
        {newThisWeekItems.length > 0 && (
          <motion.div
            className="mb-5"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-sm">✨</span>
              <h3 className="text-[13px] font-extrabold text-[#6B6B7B] uppercase tracking-wider">New This Week</h3>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
              {newThisWeekItems.map((item, i) => (
                <motion.button
                  key={item.id}
                  className="flex-shrink-0 rounded-[20px] p-3 w-36 text-left cursor-pointer snap-start border relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF8F0 100%)',
                    borderColor: '#F0EAE0',
                    boxShadow: '0 2px 12px rgba(45,45,58,0.06)',
                  }}
                  onClick={() => handleItemClick(item.route)}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 + i * 0.05 }}
                  whileHover={{ scale: 1.04, boxShadow: '0 8px 24px rgba(45,45,58,0.10)' }}
                  whileTap={{ scale: 0.96 }}
                >
                  {/* New badge */}
                  <div className="absolute top-2 right-2">
                    <span className="text-[8px] font-bold bg-[#FFF0F0] text-[#FF6B6B] rounded-full px-1.5 py-0.5 uppercase tracking-wide">New</span>
                  </div>
                  <span className="text-2xl block mb-1">{item.emoji}</span>
                  <p className="text-xs font-extrabold text-[#2D2D3A] line-clamp-2 leading-tight">{item.title}</p>
                  <span
                    className="inline-block mt-1.5 text-[9px] font-bold rounded-full px-2 py-0.5 uppercase tracking-wide"
                    style={{
                      backgroundColor: item.type === 'story' ? '#F3EFFE' : item.type === 'game' ? '#FFF0F0' : item.type === 'video' ? '#EDFAF8' : '#FFF3EB',
                      color: item.type === 'story' ? '#A78BFA' : item.type === 'game' ? '#FF6B6B' : item.type === 'video' ? '#4ECDC4' : '#FF8C42',
                    }}
                  >
                    {item.type}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recommended For You Rail (original, preserved) */}
        <RecommendationRail
          title="Recommended for You"
          items={recommendedForYou}
          onItemClick={handleItemClick}
        />

        <RecommendationRail
          title="Quick 5-min Picks"
          items={quickPicks}
          onItemClick={handleItemClick}
        />

        <RecommendationRail
          title="Try Something New"
          items={trySomethingNew}
          onItemClick={handleItemClick}
        />

        {/* Collections Section */}
        {collections.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-[13px] font-extrabold text-[#6B6B7B] uppercase tracking-wider">Collections</h2>
              <motion.button
                className="text-xs text-[#FF6B6B] font-bold cursor-pointer"
                onClick={() => navigate('/collections')}
                whileTap={{ scale: 0.95 }}
              >
                See all →
              </motion.button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
              {collections.slice(0, 4).map((col) => (
                <motion.button
                  key={col.id}
                  className="flex-shrink-0 w-40 rounded-[20px] p-3 text-left cursor-pointer snap-start text-white shadow-[0_2px_12px_rgba(45,45,58,0.06)]"
                  style={{ backgroundColor: col.coverColor }}
                  onClick={() => navigate(`/collections/${col.id}`)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <span className="text-2xl">{col.emoji}</span>
                  <p className="text-xs font-bold mt-1">{col.title}</p>
                  <p className="text-[10px] text-white/70">~{col.estimatedMinutes} min</p>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Playlists Section */}
        {playlists.length > 0 && (
          <div className="mb-6">
            <h2 className="text-[13px] font-extrabold text-[#6B6B7B] uppercase tracking-wider mb-2">Playlists</h2>
            <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
              {playlists.map((pl) => (
                <motion.button
                  key={pl.id}
                  className="flex-shrink-0 w-44 bg-white rounded-[20px] p-3 text-left cursor-pointer snap-start border border-[#F0EAE0] shadow-[0_2px_12px_rgba(45,45,58,0.06)]"
                  onClick={() => navigate('/menu')}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <span className="text-2xl">{pl.emoji}</span>
                  <p className="text-xs font-bold text-[#2D2D3A] mt-1">{pl.title}</p>
                  <p className="text-[10px] text-[#9B9BAB]">~{pl.estimatedMinutes} min</p>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* New & Popular (legacy rail - kept for compatibility) */}
        {(() => {
          const newIds = getContentByBadge('new');
          const newItems = resolveContentIds(newIds);
          if (newItems.length === 0) return null;
          return (
            <RecommendationRail
              title="New This Week ✨"
              items={newItems.map((item) => ({
                type: item.type,
                id: item.sourceId,
                title: item.title,
                emoji: item.emoji,
                route: item.route,
                score: 0,
              }))}
              onItemClick={handleItemClick}
            />
          );
        })()}

        {/* Empty state */}
        {recommendations.length === 0 && (
          <motion.div
            className="text-center py-16 text-[#9B9BAB]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span className="text-6xl block mb-3">🌟</span>
            <p className="font-bold text-lg text-[#2D2D3A]">Start Learning!</p>
            <p className="text-sm mt-1 text-[#6B6B7B]">
              Try a lesson or story and we'll recommend more for you.
            </p>
            <motion.button
              className="mt-4 text-white rounded-[14px] px-6 py-3 font-bold cursor-pointer bg-gradient-to-r from-[#4ECDC4] to-[#6DD5CB]"
              style={{ boxShadow: '0 4px 20px rgba(78,205,196,0.25)' }}
              onClick={() => navigate('/lessons')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Browse Lessons
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* ── Search Overlay ── */}
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
