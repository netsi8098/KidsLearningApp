import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { VideoItem } from '../data/videoConfig';
import { playableVideos } from '../data/videoConfig';
import MascotLion from './svg/MascotLion';

interface VideoPlayerProps {
  video: VideoItem | null;
  onClose: () => void;
  onPlayRelated: (video: VideoItem) => void;
  onFavorite?: (videoId: string) => void;
  isFavorite?: boolean;
}

export default function VideoPlayer({ video, onClose, onPlayRelated, onFavorite, isFavorite = false }: VideoPlayerProps) {
  const [fav, setFav] = useState(isFavorite);

  if (!video) return null;

  const related = playableVideos
    .filter((v) => v.category === video.category && v.id !== video.id)
    .slice(0, 4);

  const handleFavorite = () => {
    setFav(!fav);
    onFavorite?.(video.id);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex flex-col"
        style={{ background: 'rgba(0,0,0,0.9)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Branded header bar */}
        <div className="flex items-center justify-between px-4 py-3" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <motion.button
            className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.15)' }}
            onClick={onClose}
            whileTap={{ scale: 0.9 }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3L13 13M13 3L3 13" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </motion.button>

          <div className="flex-1 text-center mx-3">
            <p className="font-display text-white text-sm truncate">{video.title}</p>
            <span className="text-[10px] text-white/50 font-bold uppercase">
              {video.category}
            </span>
          </div>

          <div className="w-8 h-8">
            <MascotLion size={32} expression="happy" animated={false} />
          </div>
        </div>

        {/* Video frame with rounded corners */}
        <div className="w-full max-w-2xl mx-auto px-4">
          <div
            className="relative overflow-hidden"
            style={{ borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
          >
            <div className="aspect-video bg-black">
              {video.source === 'local' && video.src ? (
                /* Locally forged episode: plays offline from /public/videos,
                   with captions on by default. */
                <video
                  key={video.id}
                  src={video.src}
                  poster={video.thumbnail}
                  title={video.title}
                  className="w-full h-full"
                  style={{ borderRadius: '16px' }}
                  controls
                  autoPlay
                  playsInline
                  controlsList="nodownload"
                >
                  {video.captions && (
                    <track
                      kind="captions"
                      src={video.captions}
                      srcLang="en"
                      label="English"
                      default
                    />
                  )}
                </video>
              ) : (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${video.id}?rel=0&modestbranding=1&playsinline=1&fs=0&controls=1`}
                  title={video.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  frameBorder="0"
                  style={{ borderRadius: '16px' }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Video info + Favorite button */}
        <div className="px-4 py-3 max-w-2xl mx-auto w-full">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-base leading-tight">{video.title}</p>
              <p className="text-white/50 text-sm mt-0.5">{video.channel}</p>
            </div>
            <motion.button
              className="flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-sm cursor-pointer"
              style={{
                background: fav ? 'rgba(255,107,107,0.2)' : 'rgba(255,255,255,0.1)',
                border: `1.5px solid ${fav ? '#FF6B6B' : 'rgba(255,255,255,0.2)'}`,
                color: fav ? '#FF6B6B' : 'rgba(255,255,255,0.7)',
              }}
              onClick={handleFavorite}
              whileTap={{ scale: 0.95 }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill={fav ? '#FF6B6B' : 'none'} stroke={fav ? '#FF6B6B' : 'currentColor'} strokeWidth="1.5">
                <path d="M8 14S1 9.5 1 5.5C1 3 3 1 5.5 1C6.8 1 7.5 2 8 3C8.5 2 9.2 1 10.5 1C13 1 15 3 15 5.5C15 9.5 8 14 8 14Z" />
              </svg>
              {fav ? 'Favorited' : 'Favorite'}
            </motion.button>
          </div>
          {video.duration && (
            <span className="inline-block mt-2 text-[11px] font-bold text-white/60 px-2.5 py-0.5 rounded-full bg-white/10">
              {video.duration}
            </span>
          )}
        </div>

        {/* More like this — horizontal carousel */}
        {related.length > 0 && (
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <p className="text-[11px] font-bold text-white/40 uppercase tracking-wider mb-3">
              More like this
            </p>
            <div className="flex gap-3 overflow-x-auto pb-2 snap-x scrollbar-hide">
              {related.map((v) => (
                <motion.button
                  key={v.id}
                  className="flex-shrink-0 w-40 cursor-pointer snap-start text-left"
                  onClick={() => onPlayRelated(v)}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="relative">
                    <img
                      src={v.thumbnail}
                      alt={v.title}
                      className="w-40 h-24 rounded-xl object-cover bg-gray-800"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-white/70 flex items-center justify-center">
                        <svg width="12" height="14" viewBox="0 0 12 14" fill="#2D2D3A"><path d="M0 0L12 7L0 14Z" /></svg>
                      </div>
                    </div>
                    {v.duration && (
                      <span className="absolute bottom-1 right-1 text-white text-[9px] px-1.5 py-0.5 rounded bg-black/60 font-bold">
                        {v.duration}
                      </span>
                    )}
                  </div>
                  <p className="text-white text-xs font-bold mt-1.5 line-clamp-2 leading-tight">{v.title}</p>
                  <p className="text-white/40 text-[10px] mt-0.5">{v.channel}</p>
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
