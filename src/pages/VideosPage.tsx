import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useVideos } from '../hooks/useVideos';
import { useMediaQueue } from '../hooks/useMediaQueue';
import {
  curatedVideos,
  videoCategories,
  getVideosByCategory,
  searchVideos,
  type VideoItem,
  type VideoCategory,
} from '../data/videoConfig';
import VideoCard from '../components/VideoCard';
import VideoPlayer from '../components/VideoPlayer';
import NavButton from '../components/NavButton';
import StarCounter from '../components/StarCounter';

type TabKey = 'browse' | 'favorites' | 'history';

export default function VideosPage() {
  const navigate = useNavigate();
  const { currentPlayer } = useApp();
  const { favoriteIds, toggleFavorite, addToHistory, getRecentHistory } = useVideos(
    currentPlayer?.id
  );

  const { addToQueue } = useMediaQueue(currentPlayer?.id);
  const [activeTab, setActiveTab] = useState<TabKey>('browse');
  const [selectedCategory, setSelectedCategory] = useState<VideoCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [playingVideo, setPlayingVideo] = useState<VideoItem | null>(null);
  const [queuedId, setQueuedId] = useState<string | null>(null);

  const filteredVideos = useMemo(() => {
    if (searchQuery.trim()) {
      return searchVideos(searchQuery);
    }
    if (selectedCategory === 'all') {
      return curatedVideos;
    }
    return getVideosByCategory(selectedCategory);
  }, [selectedCategory, searchQuery]);

  const favoriteVideos = useMemo(() => {
    return curatedVideos.filter((v) => favoriteIds.has(v.id));
  }, [favoriteIds]);

  const recentHistory = getRecentHistory();

  // Derive watched video IDs from history
  const watchedIds = useMemo(() => {
    return new Set(recentHistory.map((h) => h.videoId));
  }, [recentHistory]);

  // Featured video: first video in filtered list (or first overall)
  const featuredVideo = filteredVideos.length > 0 ? filteredVideos[0] : null;
  const remainingVideos = filteredVideos.length > 1 ? filteredVideos.slice(1) : [];

  // "Up Next" suggestions based on most recently watched category
  const upNextVideos = useMemo(() => {
    if (recentHistory.length === 0) return [];
    const lastWatched = curatedVideos.find((v) => v.id === recentHistory[0]?.videoId);
    if (!lastWatched) return [];
    return curatedVideos
      .filter((v) => v.category === lastWatched.category && v.id !== lastWatched.id && !watchedIds.has(v.id))
      .slice(0, 4);
  }, [recentHistory, watchedIds]);

  if (!currentPlayer) return <Navigate to="/" replace />;

  function handlePlay(video: VideoItem) {
    setPlayingVideo(video);
    addToHistory(video);
  }

  function handlePlayRelated(video: VideoItem) {
    setPlayingVideo(video);
    addToHistory(video);
  }

  const tabs: { key: TabKey; label: string; emoji: string }[] = [
    { key: 'browse', label: 'Browse', emoji: '🎬' },
    { key: 'favorites', label: 'Favorites', emoji: '❤️' },
    { key: 'history', label: 'Recent', emoji: '🕐' },
  ];

  // Category tabs for browse view
  const categoryTabs = [
    { key: 'all' as const, label: 'All', emoji: '📺' },
    ...videoCategories.map((cat) => ({
      key: cat.key,
      label: cat.label,
      emoji: cat.emoji,
    })),
  ];

  return (
    <div className="min-h-dvh bg-[#FFF8F0] flex flex-col">
      {/* Premium Hero Banner */}
      <div
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #EDFAF8 0%, #F5FFFE 60%, #FFF8F0 100%)',
        }}
      >
        {/* Decorative film reel motifs */}
        <div className="absolute top-2 right-4 text-[40px] opacity-[0.08] pointer-events-none select-none" aria-hidden="true">
          🎬
        </div>
        <div className="absolute top-8 left-2 text-[28px] opacity-[0.06] pointer-events-none select-none rotate-[-12deg]" aria-hidden="true">
          🎥
        </div>
        <div className="absolute bottom-1 right-16 text-[24px] opacity-[0.05] pointer-events-none select-none" aria-hidden="true">
          🎞️
        </div>

        <div className="px-4 pt-4 pb-0 relative z-10 md:px-8">
          {/* Header row */}
          <div className="flex items-center justify-between mb-3">
            <NavButton onClick={() => navigate('/menu')} direction="back" />
            <div className="text-center flex-1">
              <h2
                className="text-xl font-extrabold tracking-tight"
                style={{
                  background: 'linear-gradient(135deg, #4ECDC4 0%, #74B9FF 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Videos
              </h2>
              <p className="text-[11px] font-bold text-[#9B9BAB] mt-0.5 tracking-wide">
                Watch & learn together!
              </p>
            </div>
            <StarCounter />
          </div>

          {/* Main Tabs */}
          <div className="flex gap-2 mb-3">
            {tabs.map((tab) => (
              <motion.button
                key={tab.key}
                className={`flex-1 py-2.5 rounded-full font-bold text-sm cursor-pointer transition-all border ${
                  activeTab === tab.key
                    ? 'text-white shadow-md border-transparent'
                    : 'bg-white text-[#6B6B7B] shadow-sm border-[#F0EAE0]'
                }`}
                style={
                  activeTab === tab.key
                    ? {
                        background: 'linear-gradient(135deg, #4ECDC4 0%, #3DBEB6 100%)',
                        boxShadow: '0 4px 14px rgba(78,205,196,0.3)',
                      }
                    : undefined
                }
                onClick={() => setActiveTab(tab.key)}
                whileTap={{ scale: 0.95 }}
              >
                {tab.emoji} {tab.label}
              </motion.button>
            ))}
          </div>

          {/* Search bar (browse tab only) */}
          {activeTab === 'browse' && (
            <motion.div
              className="relative mb-3"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <input
                type="text"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white rounded-[16px] px-4 py-3 pl-10 text-sm shadow-[0_2px_12px_rgba(45,45,58,0.06)] border border-[#F0EAE0] outline-none transition-all"
                style={{
                  /* Focus ring handled via inline for teal branding */
                }}
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(78,205,196,0.25)';
                  e.currentTarget.style.borderColor = '#4ECDC4';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 12px rgba(45,45,58,0.06)';
                  e.currentTarget.style.borderColor = '#F0EAE0';
                }}
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B9BAB]">🔍</span>
              {searchQuery && (
                <motion.button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B9BAB] cursor-pointer"
                  onClick={() => setSearchQuery('')}
                  whileTap={{ scale: 0.8 }}
                >
                  ✕
                </motion.button>
              )}
            </motion.div>
          )}

          {/* Premium category pill tabs (browse tab, no search query) */}
          {activeTab === 'browse' && !searchQuery.trim() && (
            <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide md:flex-wrap md:mx-0 md:px-0 md:gap-3">
              {categoryTabs.map((cat) => {
                const isActive = selectedCategory === cat.key;
                return (
                  <motion.button
                    key={cat.key}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold cursor-pointer whitespace-nowrap border transition-all ${
                      isActive
                        ? 'text-white border-transparent'
                        : 'bg-white text-[#6B6B7B] border-[#F0EAE0]'
                    }`}
                    style={
                      isActive
                        ? {
                            background: 'linear-gradient(135deg, #4ECDC4 0%, #3DBEB6 100%)',
                            boxShadow: '0 3px 12px rgba(78,205,196,0.3)',
                          }
                        : undefined
                    }
                    onClick={() => setSelectedCategory(cat.key)}
                    whileTap={{ scale: 0.95 }}
                  >
                    {cat.emoji} {cat.label}
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-24 md:px-8 md:pb-8 md:max-w-3xl md:mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'browse' && (
            <motion.div
              key="browse"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {filteredVideos.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-5xl mb-3">🔍</p>
                  <p className="text-[#6B6B7B] font-bold">No videos found</p>
                  <p className="text-[#9B9BAB] text-sm mt-1">Try a different search</p>
                </div>
              ) : (
                <>
                  {/* Featured Video Hero Card */}
                  {featuredVideo && !searchQuery.trim() && (
                    <motion.div
                      className="mb-5"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                    >
                      <p className="text-[13px] font-extrabold text-[#6B6B7B] uppercase tracking-wider mb-2.5">
                        🎬 Featured
                      </p>
                      <motion.div
                        className="rounded-[20px] overflow-hidden cursor-pointer relative"
                        style={{
                          boxShadow: '0 8px 32px rgba(45,45,58,0.12)',
                          border: '1px solid #F0EAE0',
                        }}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => handlePlay(featuredVideo)}
                      >
                        <div className="relative">
                          <img
                            src={featuredVideo.thumbnail}
                            alt={featuredVideo.title}
                            className="w-full aspect-video object-cover bg-[#F0EAE0]"
                            loading="lazy"
                          />
                          {/* Cinematic bottom gradient */}
                          <div
                            className="absolute inset-0"
                            style={{
                              background: 'linear-gradient(to top, rgba(0,0,0,0.50) 0%, rgba(0,0,0,0.15) 35%, transparent 65%)',
                            }}
                          />
                          {/* Featured badge */}
                          <span
                            className="absolute top-3 left-3 text-[10px] font-extrabold text-white px-3 py-1 rounded-full uppercase tracking-wider"
                            style={{
                              background: 'linear-gradient(135deg, #4ECDC4 0%, #3DBEB6 100%)',
                              boxShadow: '0 2px 10px rgba(78,205,196,0.4)',
                            }}
                          >
                            Featured
                          </span>
                          {/* Large center play button */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div
                              className="w-16 h-16 rounded-full flex items-center justify-center"
                              style={{
                                background: 'rgba(255,255,255,0.85)',
                                backdropFilter: 'blur(12px)',
                                WebkitBackdropFilter: 'blur(12px)',
                                boxShadow: '0 6px 24px rgba(0,0,0,0.20)',
                              }}
                              whileHover={{ scale: 1.1 }}
                            >
                              <span className="text-3xl ml-1">▶️</span>
                            </motion.div>
                          </div>
                          {/* Title overlay at bottom */}
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <p className="text-white font-extrabold text-lg leading-tight drop-shadow-md">
                              {featuredVideo.title}
                            </p>
                            <p className="text-white/70 text-xs mt-1 font-medium">
                              {featuredVideo.channel} {featuredVideo.duration ? `· ${featuredVideo.duration}` : ''}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}

                  {/* Up Next Rail (only on browse "all" with watch history) */}
                  {!searchQuery.trim() && selectedCategory === 'all' && upNextVideos.length > 0 && (
                    <div className="mb-5">
                      <p className="text-[13px] font-extrabold text-[#6B6B7B] uppercase tracking-wider mb-2.5">
                        ▶️ Up Next
                      </p>
                      <div className="flex gap-3 overflow-x-auto -mx-4 px-4 pb-2 scrollbar-hide">
                        {upNextVideos.map((video) => (
                          <motion.div
                            key={video.id}
                            className="flex-shrink-0 w-[200px] rounded-[14px] overflow-hidden cursor-pointer"
                            style={{
                              background: '#FFFFFF',
                              boxShadow: '0 2px 12px rgba(45,45,58,0.06)',
                              border: '1px solid #F0EAE0',
                            }}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handlePlay(video)}
                          >
                            <div className="relative">
                              <img
                                src={video.thumbnail}
                                alt={video.title}
                                className="w-full aspect-video object-cover bg-[#F0EAE0]"
                                loading="lazy"
                              />
                              <div
                                className="absolute inset-0"
                                style={{
                                  background: 'linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 50%)',
                                }}
                              />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div
                                  className="w-9 h-9 rounded-full flex items-center justify-center"
                                  style={{
                                    background: 'rgba(255,255,255,0.80)',
                                    backdropFilter: 'blur(6px)',
                                    WebkitBackdropFilter: 'blur(6px)',
                                  }}
                                >
                                  <span className="text-base ml-0.5">▶️</span>
                                </div>
                              </div>
                              {video.duration && (
                                <span
                                  className="absolute bottom-1.5 right-1.5 text-white text-[10px] px-2 py-0.5 rounded-md font-semibold"
                                  style={{
                                    background: 'rgba(0,0,0,0.55)',
                                    backdropFilter: 'blur(4px)',
                                    WebkitBackdropFilter: 'blur(4px)',
                                  }}
                                >
                                  {video.duration}
                                </span>
                              )}
                            </div>
                            <div className="p-2.5">
                              <p className="text-[13px] font-bold text-[#2D2D3A] line-clamp-2 leading-tight">
                                {video.title}
                              </p>
                              <p className="text-[11px] text-[#9B9BAB] mt-1">{video.channel}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Watch Again Rail (browse all, with history) */}
                  {!searchQuery.trim() && selectedCategory === 'all' && recentHistory.length > 0 && (
                    <div className="mb-5">
                      <p className="text-[13px] font-extrabold text-[#6B6B7B] uppercase tracking-wider mb-2.5">
                        🕐 Watch Again
                      </p>
                      <div className="flex gap-3 overflow-x-auto -mx-4 px-4 pb-2 scrollbar-hide">
                        {recentHistory.slice(0, 8).map((item) => {
                          const video = curatedVideos.find((v) => v.id === item.videoId);
                          if (!video) return null;
                          return (
                            <motion.div
                              key={item.id ?? item.videoId}
                              className="flex-shrink-0 w-[160px] rounded-[14px] overflow-hidden cursor-pointer"
                              style={{
                                background: '#FFFFFF',
                                boxShadow: '0 2px 12px rgba(45,45,58,0.06)',
                                border: '1px solid #F0EAE0',
                              }}
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => handlePlay(video)}
                            >
                              <div className="relative">
                                <img
                                  src={item.videoThumbnail}
                                  alt={item.videoTitle}
                                  className="w-full aspect-video object-cover bg-[#F0EAE0]"
                                  loading="lazy"
                                />
                                <div
                                  className="absolute inset-0"
                                  style={{
                                    background: 'linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 50%)',
                                  }}
                                />
                                {/* Resume label */}
                                <span
                                  className="absolute bottom-1.5 left-1.5 text-[9px] font-bold text-white px-2 py-0.5 rounded-md uppercase tracking-wide"
                                  style={{
                                    background: 'rgba(78,205,196,0.85)',
                                    backdropFilter: 'blur(4px)',
                                    WebkitBackdropFilter: 'blur(4px)',
                                  }}
                                >
                                  Resume
                                </span>
                              </div>
                              <div className="p-2">
                                <p className="text-[12px] font-bold text-[#2D2D3A] line-clamp-1 leading-tight">
                                  {item.videoTitle}
                                </p>
                                <p className="text-[10px] text-[#9B9BAB] mt-0.5">{item.videoChannel}</p>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Section header for remaining videos */}
                  {!searchQuery.trim() && remainingVideos.length > 0 && (
                    <p className="text-[13px] font-extrabold text-[#6B6B7B] uppercase tracking-wider mb-2.5">
                      📺 {selectedCategory === 'all' ? 'All Videos' : videoCategories.find(c => c.key === selectedCategory)?.label || 'Videos'}
                    </p>
                  )}

                  {/* Video grid (remaining or all if searching) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
                    {(searchQuery.trim() ? filteredVideos : remainingVideos).map((video, i) => (
                      <div key={video.id + video.category}>
                        <VideoCard
                          video={video}
                          isFavorite={favoriteIds.has(video.id)}
                          onPlay={handlePlay}
                          onToggleFavorite={toggleFavorite}
                          delay={i * 0.05}
                          isWatched={watchedIds.has(video.id)}
                          isNew={!watchedIds.has(video.id) && i < 3}
                        />
                        <motion.button
                          className="w-full mt-1.5 text-xs font-bold text-[#6B6B7B] rounded-xl py-1.5 cursor-pointer transition-colors"
                          style={{
                            background: '#F5F0E8',
                          }}
                          onClick={() => {
                            addToQueue('video', video.id, video.title, '🎬');
                            setQueuedId(video.id);
                            setTimeout(() => setQueuedId(null), 1500);
                          }}
                          whileTap={{ scale: 0.95 }}
                          whileHover={{ backgroundColor: '#EDE7DD' }}
                        >
                          {queuedId === video.id ? '✅ Added!' : '➕ Add to Queue'}
                        </motion.button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {activeTab === 'favorites' && (
            <motion.div
              key="favorites"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {favoriteVideos.length === 0 ? (
                <div className="text-center py-12">
                  <div
                    className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, #FFF0F0, #FFE0E0)',
                    }}
                  >
                    <span className="text-4xl">❤️</span>
                  </div>
                  <p className="text-[#6B6B7B] font-bold">No favorites yet</p>
                  <p className="text-[#9B9BAB] text-sm mt-1">
                    Tap the heart on any video to save it here
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-[13px] font-extrabold text-[#6B6B7B] uppercase tracking-wider mb-2.5">
                    ❤️ Your Favorites
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
                    {favoriteVideos.map((video, i) => (
                      <VideoCard
                        key={video.id}
                        video={video}
                        isFavorite={true}
                        onPlay={handlePlay}
                        onToggleFavorite={toggleFavorite}
                        delay={i * 0.05}
                        isWatched={watchedIds.has(video.id)}
                      />
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {recentHistory.length === 0 ? (
                <div className="text-center py-12">
                  <div
                    className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, #EDFAF8, #D5F5F0)',
                    }}
                  >
                    <span className="text-4xl">🕐</span>
                  </div>
                  <p className="text-[#6B6B7B] font-bold">No watch history</p>
                  <p className="text-[#9B9BAB] text-sm mt-1">
                    Videos you watch will appear here
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-[13px] font-extrabold text-[#6B6B7B] uppercase tracking-wider mb-2.5">
                    🕐 Recently Watched
                  </p>
                  <div className="space-y-3">
                    {recentHistory.map((item, i) => (
                      <motion.button
                        key={item.id}
                        className="w-full flex items-center gap-3 bg-white rounded-[16px] p-3 border border-[#F0EAE0] cursor-pointer text-left transition-shadow duration-200"
                        style={{
                          boxShadow: '0 2px 12px rgba(45,45,58,0.06)',
                        }}
                        onClick={() => {
                          const video = curatedVideos.find((v) => v.id === item.videoId);
                          if (video) handlePlay(video);
                        }}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        whileTap={{ scale: 0.98 }}
                        whileHover={{
                          boxShadow: '0 8px 24px rgba(45,45,58,0.10)',
                        }}
                      >
                        <div className="relative flex-shrink-0">
                          <img
                            src={item.videoThumbnail}
                            alt={item.videoTitle}
                            className="w-24 h-14 rounded-[12px] object-cover bg-[#F0EAE0]"
                            loading="lazy"
                          />
                          {/* Small play overlay on thumbnail */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div
                              className="w-7 h-7 rounded-full flex items-center justify-center"
                              style={{
                                background: 'rgba(255,255,255,0.75)',
                                backdropFilter: 'blur(4px)',
                                WebkitBackdropFilter: 'blur(4px)',
                              }}
                            >
                              <span className="text-xs ml-0.5">▶️</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-[#2D2D3A] line-clamp-2 leading-tight">
                            {item.videoTitle}
                          </p>
                          <p className="text-xs text-[#6B6B7B] mt-1">{item.videoChannel}</p>
                          <p className="text-[10px] text-[#9B9BAB] mt-0.5">
                            {new Date(item.watchedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Video Player Modal */}
      {playingVideo && (
        <VideoPlayer
          video={playingVideo}
          onClose={() => setPlayingVideo(null)}
          onPlayRelated={handlePlayRelated}
        />
      )}
    </div>
  );
}
