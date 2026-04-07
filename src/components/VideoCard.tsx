import { motion } from 'framer-motion';
import type { VideoItem } from '../data/videoConfig';

interface VideoCardProps {
  video: VideoItem;
  isFavorite: boolean;
  onPlay: (video: VideoItem) => void;
  onToggleFavorite: (videoId: string) => void;
  delay?: number;
  isWatched?: boolean;
  isNew?: boolean;
  watchProgress?: number; // 0-100
}

export default function VideoCard({
  video,
  isFavorite,
  onPlay,
  onToggleFavorite,
  delay = 0,
  isWatched = false,
  isNew = false,
  watchProgress,
}: VideoCardProps) {
  return (
    <motion.div
      className="rounded-[16px] overflow-hidden cursor-pointer"
      style={{
        background: '#FFFFFF',
        boxShadow: '0 2px 12px rgba(45,45,58,0.06)',
        border: '1px solid #F0EAE0',
      }}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay, type: 'spring', damping: 20, stiffness: 300 }}
      whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(45,45,58,0.10)' }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onPlay(video)}
    >
      <div className="relative">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full aspect-video object-cover bg-[#F0EAE0]"
          loading="lazy"
        />
        {/* Cinematic gradient overlay at bottom */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.08) 30%, transparent 60%)',
          }}
        />
        {/* Watched dim overlay */}
        {isWatched && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.25)' }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(78,205,196,0.9)',
                boxShadow: '0 2px 8px rgba(78,205,196,0.4)',
              }}
            >
              <span className="text-white text-sm font-bold">✓</span>
            </div>
          </div>
        )}
        {/* Play button overlay */}
        {!isWatched && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              }}
              whileHover={{ scale: 1.1 }}
            >
              <span className="text-2xl ml-0.5">▶️</span>
            </motion.div>
          </div>
        )}
        {/* NEW badge */}
        {isNew && !isWatched && (
          <span
            className="absolute top-2 right-2 text-[10px] font-extrabold text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider"
            style={{
              background: 'linear-gradient(135deg, #FF6B6B, #FF8E8E)',
              boxShadow: '0 2px 8px rgba(255,107,107,0.35)',
            }}
          >
            NEW
          </span>
        )}
        {/* Duration badge */}
        {video.duration && (
          <span
            className="absolute bottom-2 right-2 text-white text-[11px] px-2.5 py-1 rounded-lg font-semibold"
            style={{
              background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
            }}
          >
            {video.duration}
          </span>
        )}
        {/* Watch progress bar */}
        {watchProgress !== undefined && watchProgress > 0 && watchProgress < 100 && (
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-black/20">
            <div
              className="h-full rounded-r-full"
              style={{
                width: `${watchProgress}%`,
                background: 'linear-gradient(90deg, #4ECDC4, #6FE0D9)',
              }}
            />
          </div>
        )}
      </div>
      <div className="p-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-extrabold text-[15px] text-[#2D2D3A] line-clamp-2 leading-tight">
              {video.title}
            </p>
            <p className="text-xs text-[#9B9BAB] mt-1.5 font-medium">{video.channel}</p>
          </div>
          <motion.button
            className="text-xl flex-shrink-0 mt-0.5 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(video.id);
            }}
            whileTap={{ scale: 1.4 }}
            animate={isFavorite ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            {isFavorite ? '❤️' : '🤍'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
