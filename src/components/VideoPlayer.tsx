import { motion, AnimatePresence } from 'framer-motion';
import type { VideoItem } from '../data/videoConfig';
import { curatedVideos } from '../data/videoConfig';

interface VideoPlayerProps {
  video: VideoItem | null;
  onClose: () => void;
  onPlayRelated: (video: VideoItem) => void;
}

export default function VideoPlayer({ video, onClose, onPlayRelated }: VideoPlayerProps) {
  if (!video) return null;

  // Get related videos from same category (excluding current)
  const related = curatedVideos
    .filter((v) => v.category === video.category && v.id !== video.id)
    .slice(0, 4);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 bg-black/80 flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 bg-black/50">
          <motion.button
            className="text-white bg-white/20 rounded-full w-10 h-10 flex items-center justify-center cursor-pointer"
            onClick={onClose}
            whileTap={{ scale: 0.9 }}
          >
            <span className="text-lg">✕</span>
          </motion.button>
          <p className="text-white font-bold text-sm truncate flex-1 text-center mx-3">
            {video.title}
          </p>
          <div className="w-10" />
        </div>

        {/* Embedded YouTube Player */}
        <div className="w-full max-w-2xl mx-auto aspect-video bg-black">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.id}?rel=0&modestbranding=1&playsinline=1&fs=1`}
            title={video.title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            frameBorder="0"
          />
        </div>

        {/* Video info - premium styling */}
        <div className="p-4 bg-black/40">
          <p className="text-white font-extrabold text-lg leading-tight">{video.title}</p>
          <p className="text-white/60 text-sm mt-1 font-medium">{video.channel}</p>
          {video.duration && (
            <span
              className="inline-block mt-2 text-[11px] font-bold text-white/80 px-2.5 py-0.5 rounded-full"
              style={{
                background: 'rgba(78,205,196,0.3)',
                border: '1px solid rgba(78,205,196,0.4)',
              }}
            >
              {video.duration}
            </span>
          )}
        </div>

        {/* Related videos - "More like this" */}
        {related.length > 0 && (
          <div className="flex-1 overflow-y-auto p-4 bg-black/30">
            <p className="text-[13px] font-extrabold text-white/50 uppercase tracking-wider mb-3">
              More like this
            </p>
            <div className="space-y-3">
              {related.map((v) => (
                <motion.button
                  key={v.id}
                  className="w-full flex items-center gap-3 rounded-[14px] p-2.5 cursor-pointer text-left transition-colors"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                  onClick={() => onPlayRelated(v)}
                  whileTap={{ scale: 0.97 }}
                  whileHover={{
                    backgroundColor: 'rgba(255,255,255,0.14)',
                  }}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={v.thumbnail}
                      alt={v.title}
                      className="w-24 h-14 rounded-[10px] object-cover bg-gray-700"
                      loading="lazy"
                    />
                    {/* Mini play button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center"
                        style={{
                          background: 'rgba(255,255,255,0.70)',
                          backdropFilter: 'blur(4px)',
                          WebkitBackdropFilter: 'blur(4px)',
                        }}
                      >
                        <span className="text-xs ml-0.5">▶️</span>
                      </div>
                    </div>
                    {v.duration && (
                      <span
                        className="absolute bottom-1 right-1 text-white text-[9px] px-1.5 py-0.5 rounded font-semibold"
                        style={{
                          background: 'rgba(0,0,0,0.6)',
                        }}
                      >
                        {v.duration}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-bold line-clamp-2 leading-tight">
                      {v.title}
                    </p>
                    <p className="text-white/50 text-xs mt-1 font-medium">{v.channel}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
