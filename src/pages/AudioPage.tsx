import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Navigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { useApp } from '../context/AppContext';
import { db } from '../db/database';
import { audioCategories, audioEpisodes, type AudioEpisode } from '../data/audioData';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { useMediaQueue } from '../hooks/useMediaQueue';
import CategoryFilterBar from '../components/CategoryFilterBar';
import EpisodeCard from '../components/EpisodeCard';
import AudioPlayerBar from '../components/AudioPlayerBar';
import NavButton from '../components/NavButton';

type TabKey = 'browse' | 'favorites' | 'recent';

/* ── Gradient backgrounds for song cover art by category ─── */
const coverGradients: Record<string, string> = {
  'bedtime-stories': 'from-[#312E81] to-[#6366F1]',
  'sing-along': 'from-[#A78BFA] to-[#FD79A8]',
  'fun-facts': 'from-[#4ECDC4] to-[#74B9FF]',
  'careers': 'from-[#FF8C42] to-[#FFE66D]',
  'calm-audio': 'from-[#6366F1] to-[#A78BFA]',
  'daily-routines': 'from-[#6BCB77] to-[#4ECDC4]',
};

/* ── Album grouping config ─── */
const albumGroups: { category: string; title: string; emoji: string; coverEmoji: string[] }[] = [
  { category: 'bedtime-stories', title: 'Bedtime Stories', emoji: '🌙', coverEmoji: ['🌙', '🐻', '⭐', '💤'] },
  { category: 'sing-along', title: 'Sing Along Hits', emoji: '🎤', coverEmoji: ['🎵', '🎶', '🌈', '🔢'] },
  { category: 'fun-facts', title: 'Fun Facts', emoji: '🧠', coverEmoji: ['🌤️', '🐟', '✨', '🔬'] },
  { category: 'careers', title: 'Career Adventures', emoji: '👩\u200D⚕️', coverEmoji: ['👩\u200D⚕️', '🚒', '👩\u200D🏫', '🏗️'] },
  { category: 'calm-audio', title: 'Calm Sounds', emoji: '🧘', coverEmoji: ['🌧️', '🌲', '🌊', '🕊️'] },
  { category: 'daily-routines', title: 'Daily Routines', emoji: '🌅', coverEmoji: ['🌅', '🪥', '🛏️', '☀️'] },
];

/* ── Floating Musical Notes SVG (decorative) ─── */
function FloatingNotes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Note 1 */}
      <motion.span
        className="absolute text-[#A78BFA] text-lg opacity-[0.12]"
        style={{ top: '12%', left: '8%' }}
        animate={{ y: [0, -8, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        ♪
      </motion.span>
      {/* Note 2 */}
      <motion.span
        className="absolute text-[#FD79A8] text-2xl opacity-[0.10]"
        style={{ top: '30%', right: '12%' }}
        animate={{ y: [0, -12, 0], rotate: [0, -15, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      >
        ♫
      </motion.span>
      {/* Note 3 */}
      <motion.span
        className="absolute text-[#FFE66D] text-base opacity-[0.15]"
        style={{ top: '55%', left: '5%' }}
        animate={{ y: [0, -6, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      >
        ♪
      </motion.span>
      {/* Note 4 */}
      <motion.span
        className="absolute text-[#C4B5FD] text-xl opacity-[0.10]"
        style={{ top: '75%', right: '8%' }}
        animate={{ y: [0, -10, 0], rotate: [0, 12, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
      >
        ♫
      </motion.span>
    </div>
  );
}

/* ── Sound Wave Bars (animated when playing) ─── */
function SoundWaveBars({ isActive }: { isActive: boolean }) {
  const bars = [0.6, 1, 0.4, 0.8, 0.5];
  return (
    <div className="flex items-end gap-[2px] h-4">
      {bars.map((height, i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full bg-gradient-to-t from-[#A78BFA] to-[#FD79A8]"
          animate={isActive ? {
            height: [`${height * 16}px`, `${(1 - height) * 16 + 4}px`, `${height * 16}px`],
          } : { height: `${height * 10}px` }}
          transition={isActive ? {
            duration: 0.6 + i * 0.1,
            repeat: Infinity,
            ease: 'easeInOut',
          } : { duration: 0.3 }}
        />
      ))}
    </div>
  );
}

/* ── Decorative SVG Sound Wave (hero) ─── */
function HeroSoundWave() {
  return (
    <svg
      className="absolute bottom-0 left-0 right-0 w-full opacity-[0.06]"
      height="32"
      viewBox="0 0 400 32"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M0 20 Q25 8 50 20 T100 20 T150 20 T200 20 T250 20 T300 20 T350 20 T400 20"
        fill="none"
        stroke="#A78BFA"
        strokeWidth="2"
      />
      <path
        d="M0 26 Q25 14 50 26 T100 26 T150 26 T200 26 T250 26 T300 26 T350 26 T400 26"
        fill="none"
        stroke="#FD79A8"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export default function AudioPage() {
  const navigate = useNavigate();
  const { currentPlayer } = useApp();
  const playerId = currentPlayer?.id;

  const {
    isPlaying,
    currentEpisode,
    playEpisode,
    pause,
    resume,
    playbackSpeed,
    setSpeed,
    sleepTimerMinutes,
    setSleepTimer,
  } = useAudioPlayer(playerId);

  const { addToQueue, queue, removeFromQueue } = useMediaQueue(playerId);
  const [activeTab, setActiveTab] = useState<TabKey>('browse');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [queuedId, setQueuedId] = useState<string | null>(null);

  // Live query for audio progress (favorites + recent)
  const audioProgress = useLiveQuery(
    () => (playerId ? db.audioProgress.where('playerId').equals(playerId).toArray() : []),
    [playerId],
    []
  );

  // Favorite episode IDs
  const favoriteIds = useMemo(() => {
    const set = new Set<string>();
    audioProgress.forEach((p) => {
      if (p.favorite) set.add(p.episodeId);
    });
    return set;
  }, [audioProgress]);

  // Recent episodes sorted by lastListenedAt
  const recentEpisodes = useMemo(() => {
    const sorted = [...audioProgress]
      .filter((p) => p.lastListenedAt)
      .sort((a, b) => new Date(b.lastListenedAt).getTime() - new Date(a.lastListenedAt).getTime());

    const seen = new Set<string>();
    const episodes: AudioEpisode[] = [];
    for (const p of sorted) {
      if (!seen.has(p.episodeId)) {
        seen.add(p.episodeId);
        const ep = audioEpisodes.find((e) => e.id === p.episodeId);
        if (ep) episodes.push(ep);
      }
      if (episodes.length >= 20) break;
    }
    return episodes;
  }, [audioProgress]);

  // Play count per episode
  const playCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    audioProgress.forEach((p) => {
      if (p.lastListenedAt) {
        counts[p.episodeId] = (counts[p.episodeId] || 0) + 1;
      }
    });
    return counts;
  }, [audioProgress]);

  // Filtered episodes for browse tab
  const filteredEpisodes = useMemo(() => {
    if (selectedCategory === 'all') return audioEpisodes;
    return audioEpisodes.filter((e) => e.category === selectedCategory);
  }, [selectedCategory]);

  // Favorite episodes
  const favoriteEpisodes = useMemo(() => {
    return audioEpisodes.filter((e) => favoriteIds.has(e.id));
  }, [favoriteIds]);

  // Calm/bedtime episodes
  const calmEpisodes = useMemo(() => {
    return audioEpisodes.filter(
      (e) => e.category === 'calm-audio' || e.category === 'bedtime-stories'
    );
  }, []);

  // Grouped episodes by category for album view
  const albumData = useMemo(() => {
    return albumGroups.map((album) => {
      const episodes = audioEpisodes.filter((e) => e.category === album.category);
      const totalMinutes = episodes.reduce((sum, e) => {
        const m = parseInt(e.duration) || 0;
        return sum + m;
      }, 0);
      return { ...album, episodes, totalMinutes, count: episodes.length };
    }).filter((a) => a.count > 0);
  }, []);

  // Toggle favorite
  async function toggleFavorite(episodeId: string) {
    if (!playerId) return;
    const existing = await db.audioProgress
      .where('[playerId+episodeId]')
      .equals([playerId, episodeId])
      .first();

    if (existing) {
      await db.audioProgress.update(existing.id!, {
        favorite: !existing.favorite,
      });
    } else {
      await db.audioProgress.add({
        playerId,
        episodeId,
        currentTime: 0,
        duration: 0,
        completed: false,
        favorite: true,
        lastListenedAt: new Date(),
      });
    }
  }

  // Handle play/pause toggle
  function handlePlayToggle(episode: AudioEpisode) {
    if (currentEpisode?.id === episode.id && isPlaying) {
      pause();
    } else {
      playEpisode(episode);
    }
  }

  if (!currentPlayer) return <Navigate to="/" replace />;

  const tabs: { key: TabKey; label: string; emoji: string }[] = [
    { key: 'browse', label: 'Browse', emoji: '🎧' },
    { key: 'favorites', label: 'Favorites', emoji: '❤️' },
    { key: 'recent', label: 'Recent', emoji: '🕐' },
  ];

  // Check if a category is sing-along (for badge)
  const isSingAlong = (cat: string) => cat === 'sing-along';

  return (
    <div className="min-h-dvh bg-[#FFF8F0] flex flex-col relative">
      {/* Global floating musical notes */}
      <FloatingNotes />

      {/* ── Premium Hero Banner ─── */}
      <div className="relative overflow-hidden">
        <div
          className="px-4 pt-4 pb-5 md:px-8 md:pt-6 md:pb-6"
          style={{
            background: 'linear-gradient(180deg, #F3EFFE 0%, #FFF8F0 100%)',
          }}
        >
          {/* Hero Sound Wave decoration */}
          <HeroSoundWave />

          {/* Nav row */}
          <div className="flex items-center justify-between mb-4 relative z-10">
            <NavButton onClick={() => navigate('/menu')} direction="back" />
            <div className="flex-1" />
            <SoundWaveBars isActive={isPlaying} />
          </div>

          {/* Hero title area */}
          <div className="relative z-10 mb-4">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-3xl">🎵</span>
              <h1
                className="text-[28px] font-extrabold leading-tight"
                style={{
                  background: 'linear-gradient(135deg, #A78BFA 0%, #FD79A8 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Songs & Music
              </h1>
            </div>
            <p className="text-[#6B6B7B] text-sm font-semibold ml-12">
              Sing, dance, and groove!
            </p>
          </div>

          {/* ── Premium Tabs ─── */}
          <div className="flex gap-2 mb-3 relative z-10">
            {tabs.map((tab) => (
              <motion.button
                key={tab.key}
                className={`flex-1 py-2.5 rounded-full font-bold text-sm cursor-pointer transition-all ${
                  activeTab === tab.key
                    ? 'bg-gradient-to-r from-[#A78BFA] to-[#C4B5FD] text-white shadow-[0_4px_16px_rgba(167,139,250,0.25)]'
                    : 'bg-white text-[#6B6B7B] shadow-[0_2px_12px_rgba(45,45,58,0.06)] border border-[#F0EAE0]'
                }`}
                onClick={() => setActiveTab(tab.key)}
                whileTap={{ scale: 0.95 }}
              >
                {tab.emoji} {tab.label}
              </motion.button>
            ))}
          </div>

          {/* Category filter (browse tab only) - premium pill style */}
          {activeTab === 'browse' && (
            <CategoryFilterBar
              categories={audioCategories.map((c) => ({
                key: c.key,
                label: c.label,
                emoji: c.emoji,
              }))}
              activeCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          )}
        </div>
      </div>

      {/* ── Content ─── */}
      <div className={`flex-1 overflow-y-auto px-4 md:px-8 md:max-w-3xl md:mx-auto md:w-full ${currentEpisode ? 'pb-44' : 'pb-6'}`}>
        <AnimatePresence mode="wait">
          {/* ══════════ Browse Tab ══════════ */}
          {activeTab === 'browse' && (
            <motion.div
              key="browse"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* ── Recently Listened Rail ─── */}
              {recentEpisodes.length > 0 && selectedCategory === 'all' && (
                <div className="mb-6 mt-2">
                  <h3 className="text-[13px] font-extrabold text-[#6B6B7B] uppercase tracking-wider mb-3">
                    🎵 Listen Again
                  </h3>
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
                    {recentEpisodes.slice(0, 8).map((episode, i) => (
                      <motion.button
                        key={episode.id}
                        className="flex-shrink-0 snap-start w-[120px] cursor-pointer group"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => handlePlayToggle(episode)}
                      >
                        {/* Cover art */}
                        <div
                          className={`aspect-square rounded-[16px] bg-gradient-to-br ${
                            coverGradients[episode.category] || 'from-[#A78BFA] to-[#C4B5FD]'
                          } flex items-center justify-center relative overflow-hidden shadow-[0_4px_16px_rgba(167,139,250,0.15)] group-hover:shadow-[0_8px_24px_rgba(167,139,250,0.25)] transition-shadow`}
                        >
                          {/* Musical note decoration */}
                          <span className="absolute top-1.5 right-2 text-white/10 text-lg">♪</span>
                          {/* Emoji */}
                          <motion.span
                            className="text-4xl"
                            animate={
                              currentEpisode?.id === episode.id && isPlaying
                                ? { scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }
                                : {}
                            }
                            transition={
                              currentEpisode?.id === episode.id && isPlaying
                                ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
                                : {}
                            }
                          >
                            {episode.emoji}
                          </motion.span>
                          {/* Duration pill */}
                          <span className="absolute bottom-1.5 right-1.5 bg-black/30 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                            {episode.duration}
                          </span>
                          {/* Currently playing indicator */}
                          {currentEpisode?.id === episode.id && isPlaying && (
                            <div className="absolute bottom-1.5 left-1.5">
                              <SoundWaveBars isActive={true} />
                            </div>
                          )}
                        </div>
                        {/* Title */}
                        <p className="text-xs font-bold text-[#2D2D3A] mt-1.5 truncate text-left">
                          {episode.title}
                        </p>
                        {/* Play count */}
                        {playCounts[episode.id] && (
                          <p className="text-[10px] font-semibold text-[#9B9BAB] text-left">
                            Played {playCounts[episode.id]}x
                          </p>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Album/Playlist Style Grouping (when showing all) ─── */}
              {selectedCategory === 'all' && (
                <div className="mb-6">
                  <h3 className="text-[13px] font-extrabold text-[#6B6B7B] uppercase tracking-wider mb-3">
                    🎵 Collections
                  </h3>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
                    {albumData.map((album, i) => (
                      <motion.button
                        key={album.category}
                        className="cursor-pointer text-left"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        onClick={() => setSelectedCategory(album.category)}
                        whileTap={{ scale: 0.97 }}
                      >
                        <div
                          className={`aspect-square rounded-[20px] bg-gradient-to-br ${
                            coverGradients[album.category] || 'from-[#A78BFA] to-[#C4B5FD]'
                          } relative overflow-hidden shadow-[0_4px_20px_rgba(167,139,250,0.18)] p-3 flex flex-col justify-between`}
                        >
                          {/* Musical note deco */}
                          <span className="absolute top-2 right-3 text-white/[0.08] text-3xl">♫</span>
                          {/* Emoji collage */}
                          <div className="grid grid-cols-2 gap-1 flex-1 items-center justify-items-center">
                            {album.coverEmoji.map((em, j) => (
                              <span key={j} className="text-2xl drop-shadow-sm">
                                {em}
                              </span>
                            ))}
                          </div>
                          {/* Album info at bottom */}
                          <div className="mt-1">
                            <p className="text-white font-extrabold text-sm leading-tight drop-shadow-sm">
                              {album.title}
                            </p>
                            <p className="text-white/70 text-[10px] font-bold">
                              {album.count} songs  {album.totalMinutes} min
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Calm/Bedtime Audio Section ─── */}
              {selectedCategory === 'all' && (
                <div className="mb-6 -mx-4 px-4 py-5" style={{ background: 'linear-gradient(180deg, #EDE9FE 0%, #E0E7FF 50%, #F3EFFE 100%)' }}>
                  <h3 className="text-[13px] font-extrabold text-[#4C1D95] uppercase tracking-wider mb-3">
                    🌙 Wind Down
                  </h3>
                  <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide snap-x snap-mandatory">
                    {calmEpisodes.map((episode, i) => (
                      <motion.button
                        key={episode.id}
                        className="flex-shrink-0 snap-start w-[140px] cursor-pointer group"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                        onClick={() => handlePlayToggle(episode)}
                      >
                        <div
                          className="aspect-[4/3] rounded-[16px] bg-gradient-to-br from-[#312E81] to-[#4338CA] flex items-center justify-center relative overflow-hidden shadow-[0_4px_16px_rgba(67,56,202,0.25)] group-hover:shadow-[0_8px_24px_rgba(67,56,202,0.35)] transition-shadow"
                        >
                          <span className="absolute top-1.5 left-2 text-white/[0.08] text-lg">♪</span>
                          <motion.span
                            className="text-3xl"
                            animate={
                              currentEpisode?.id === episode.id && isPlaying
                                ? { scale: [1, 1.1, 1] }
                                : {}
                            }
                            transition={
                              currentEpisode?.id === episode.id && isPlaying
                                ? { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                                : {}
                            }
                          >
                            {episode.emoji}
                          </motion.span>
                          {/* Duration badge (prominent for timers) */}
                          <span className="absolute bottom-1.5 right-1.5 bg-white/20 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-full backdrop-blur-sm">
                            {episode.duration}
                          </span>
                          {currentEpisode?.id === episode.id && isPlaying && (
                            <div className="absolute bottom-1.5 left-1.5">
                              <SoundWaveBars isActive={true} />
                            </div>
                          )}
                        </div>
                        <p className="text-xs font-bold text-[#2D2D3A] mt-1.5 truncate text-left">
                          {episode.title}
                        </p>
                        <p className="text-[10px] font-semibold text-[#6B6B7B] text-left">
                          {episode.category === 'calm-audio' ? 'Calm' : 'Lullaby'}
                        </p>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Section Header for Episodes ─── */}
              <h3 className="text-[13px] font-extrabold text-[#6B6B7B] uppercase tracking-wider mb-3 mt-2">
                🎵 {selectedCategory === 'all' ? 'All Episodes' : audioCategories.find(c => c.key === selectedCategory)?.label || 'Episodes'}
              </h3>

              {/* ── Episode Grid ─── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
                {filteredEpisodes.length === 0 ? (
                  <div className="col-span-full text-center py-16">
                    <p className="text-5xl mb-3">🎧</p>
                    <p className="text-[#6B6B7B] font-bold">No episodes found</p>
                  </div>
                ) : (
                  filteredEpisodes.map((episode, i) => (
                    <motion.div
                      key={episode.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <EpisodeCard
                        emoji={episode.emoji}
                        title={episode.title}
                        duration={episode.duration}
                        category={episode.category}
                        isPlaying={currentEpisode?.id === episode.id && isPlaying}
                        isFavorite={favoriteIds.has(episode.id)}
                        onPlay={() => handlePlayToggle(episode)}
                        onFavoriteToggle={() => toggleFavorite(episode.id)}
                        coverGradient={coverGradients[episode.category]}
                        isSingAlong={isSingAlong(episode.category)}
                      />
                      <motion.button
                        className="w-full mt-1.5 text-xs font-bold text-[#6B6B7B] bg-[#FFF8F0] border border-[#F0EAE0] rounded-[12px] py-2 cursor-pointer hover:bg-[#F0EAE0] transition-colors"
                        onClick={() => {
                          addToQueue('audio', episode.id, episode.title, episode.emoji);
                          setQueuedId(episode.id);
                          setTimeout(() => setQueuedId(null), 1500);
                        }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {queuedId === episode.id ? '✅ Added!' : '➕ Add to Queue'}
                      </motion.button>
                    </motion.div>
                  ))
                )}
              </div>

              {/* ── Up Next / Queue Section ─── */}
              {queue.length > 0 && (
                <div className="mt-6 mb-4">
                  <h3 className="text-[13px] font-extrabold text-[#6B6B7B] uppercase tracking-wider mb-3">
                    🎵 Up Next
                  </h3>
                  <div className="bg-white rounded-[20px] shadow-[0_2px_12px_rgba(45,45,58,0.06)] border border-[#F0EAE0] overflow-hidden">
                    {queue.map((item, i) => (
                      <motion.div
                        key={item.id}
                        className={`flex items-center gap-3 px-4 py-3 ${
                          i < queue.length - 1 ? 'border-b border-[#F0EAE0]' : ''
                        }`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <span className="text-[10px] font-extrabold text-[#9B9BAB] w-4 text-center">
                          {i + 1}
                        </span>
                        <span className="text-xl">{item.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-[#2D2D3A] truncate">{item.title}</p>
                        </div>
                        <motion.button
                          className="text-xs text-[#9B9BAB] cursor-pointer hover:text-[#FF6B6B] transition-colors px-2 py-1"
                          onClick={() => item.id && removeFromQueue(item.id)}
                          whileTap={{ scale: 0.9 }}
                        >
                          ✕
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ══════════ Favorites Tab ══════════ */}
          {activeTab === 'favorites' && (
            <motion.div
              key="favorites"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5 mt-3"
            >
              {favoriteEpisodes.length === 0 ? (
                <div className="col-span-full text-center py-16">
                  <p className="text-5xl mb-3">❤️</p>
                  <p className="text-[#6B6B7B] font-bold">No favorites yet</p>
                  <p className="text-[#9B9BAB] text-sm mt-1">
                    Tap the heart on any episode to save it here
                  </p>
                </div>
              ) : (
                favoriteEpisodes.map((episode, i) => (
                  <motion.div
                    key={episode.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <EpisodeCard
                      emoji={episode.emoji}
                      title={episode.title}
                      duration={episode.duration}
                      category={episode.category}
                      isPlaying={currentEpisode?.id === episode.id && isPlaying}
                      isFavorite={true}
                      onPlay={() => handlePlayToggle(episode)}
                      onFavoriteToggle={() => toggleFavorite(episode.id)}
                      coverGradient={coverGradients[episode.category]}
                      isSingAlong={isSingAlong(episode.category)}
                    />
                  </motion.div>
                ))
              )}
            </motion.div>
          )}

          {/* ══════════ Recent Tab ══════════ */}
          {activeTab === 'recent' && (
            <motion.div
              key="recent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5 mt-3"
            >
              {recentEpisodes.length === 0 ? (
                <div className="col-span-full text-center py-16">
                  <p className="text-5xl mb-3">🕐</p>
                  <p className="text-[#6B6B7B] font-bold">No recent episodes</p>
                  <p className="text-[#9B9BAB] text-sm mt-1">
                    Episodes you listen to will appear here
                  </p>
                </div>
              ) : (
                recentEpisodes.map((episode, i) => (
                  <motion.div
                    key={episode.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <EpisodeCard
                      emoji={episode.emoji}
                      title={episode.title}
                      duration={episode.duration}
                      category={episode.category}
                      isPlaying={currentEpisode?.id === episode.id && isPlaying}
                      isFavorite={favoriteIds.has(episode.id)}
                      onPlay={() => handlePlayToggle(episode)}
                      onFavoriteToggle={() => toggleFavorite(episode.id)}
                      coverGradient={coverGradients[episode.category]}
                      isSingAlong={isSingAlong(episode.category)}
                    />
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Audio Player Bar ─── */}
      <AnimatePresence>
        {currentEpisode && (
          <AudioPlayerBar
            episode={currentEpisode}
            isPlaying={isPlaying}
            playbackSpeed={playbackSpeed}
            sleepTimerMinutes={sleepTimerMinutes}
            onPause={pause}
            onResume={resume}
            onSetSpeed={setSpeed}
            onSetSleepTimer={setSleepTimer}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
