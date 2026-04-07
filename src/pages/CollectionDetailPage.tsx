import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { useApp } from '../context/AppContext';
import { db } from '../db/database';
import { getCollectionById, collections } from '../registry/collectionsConfig';
import { resolveContentIds, getContentItem } from '../registry/contentRegistry';

// Content type badge styling
const typeBadgeStyles: Record<string, { bg: string; text: string; label: string }> = {
  story: { bg: '#F3EFFE', text: '#7C3AED', label: 'Story' },
  explorer: { bg: '#EDF5FF', text: '#2563EB', label: 'Explore' },
  lesson: { bg: '#FFF3EB', text: '#C06520', label: 'Lesson' },
  coloring: { bg: '#FFF0F6', text: '#C0407A', label: 'Coloring' },
  movement: { bg: '#EDFAEF', text: '#2D7A3E', label: 'Movement' },
  game: { bg: '#FFFCE8', text: '#A67C00', label: 'Game' },
  animal: { bg: '#EDFAEF', text: '#2D7A3E', label: 'Animal' },
  emotion: { bg: '#F3EFFE', text: '#7C3AED', label: 'Emotion' },
  lifeskill: { bg: '#EDFAF8', text: '#2E8A83', label: 'Life Skill' },
  video: { bg: '#EDF5FF', text: '#2563EB', label: 'Video' },
  audio: { bg: '#FFFCE8', text: '#A67C00', label: 'Audio' },
};

function getTypeBadge(type: string) {
  return typeBadgeStyles[type] || { bg: '#F0EAE0', text: '#6B6B7B', label: type };
}

export default function CollectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentPlayer } = useApp();
  const collection = id ? getCollectionById(id) : undefined;

  const progressRecord = useLiveQuery(
    () => {
      if (!currentPlayer?.id || !id) return undefined;
      return db.collectionProgress
        .where('[playerId+collectionId]')
        .equals([currentPlayer.id, id])
        .first();
    },
    [currentPlayer?.id, id]
  );

  if (!currentPlayer) return <Navigate to="/" replace />;
  if (!collection) {
    return (
      <div className="min-h-dvh bg-[#FFF8F0] px-4 pt-4 pb-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-4">🤷</p>
          <p className="text-[#6B6B7B]">Collection not found</p>
          <button className="mt-4 text-coral font-bold" onClick={() => navigate('/collections')}>
            Back to Collections
          </button>
        </div>
      </div>
    );
  }

  const items = resolveContentIds(collection.contentIds);
  const completedItems = new Set(progressRecord?.completedItems ?? []);
  const completedCount = completedItems.size;
  const totalCount = collection.contentIds.length;
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isComplete = !!progressRecord?.completedAt;

  // Find next uncompleted item
  const nextItem = items.find((item) => !completedItems.has(item.id));

  // Related collections (same age group, different id)
  const relatedCollections = useMemo(() => {
    return collections
      .filter(
        (c) =>
          c.id !== collection.id &&
          (!c.ageGroup || !collection.ageGroup || c.ageGroup === collection.ageGroup)
      )
      .slice(0, 4);
  }, [collection]);

  async function handleItemComplete(contentId: string) {
    if (!currentPlayer?.id || !id) return;

    const existing = await db.collectionProgress
      .where('[playerId+collectionId]')
      .equals([currentPlayer.id, id])
      .first();

    if (existing) {
      const newCompleted = [...new Set([...existing.completedItems, contentId])];
      const updates: any = { completedItems: newCompleted };
      if (newCompleted.length >= totalCount) {
        updates.completedAt = new Date();
      }
      await db.collectionProgress.update(existing.id!, updates);
    } else {
      await db.collectionProgress.add({
        playerId: currentPlayer.id,
        collectionId: id,
        completedItems: [contentId],
        startedAt: new Date(),
        completedAt: totalCount <= 1 ? new Date() : undefined,
      });
    }
  }

  return (
    <div className="min-h-dvh bg-[#FFF8F0] pb-8">
      {/* Full-width Hero Banner with collection color gradient */}
      <div className="relative overflow-hidden">
        <motion.div
          className="px-4 pt-4 pb-8 relative"
          style={{
            background: `linear-gradient(180deg, ${collection.coverColor} 0%, ${collection.coverColor}DD 60%, #FFF8F0 100%)`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />

          {/* Nav */}
          <div className="flex items-center gap-3 mb-5 relative z-10">
            <motion.button
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg cursor-pointer shadow-sm"
              style={{
                background: 'rgba(255,255,255,0.25)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
              onClick={() => navigate('/collections')}
              whileTap={{ scale: 0.9 }}
            >
              <span className="text-white text-xl">←</span>
            </motion.button>
          </div>

          {/* Hero content */}
          <div className="relative z-10 text-center">
            <motion.div
              className="text-[64px] mb-3 drop-shadow-lg"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', duration: 0.5 }}
            >
              {collection.emoji}
            </motion.div>
            <motion.h1
              className="text-[26px] font-extrabold text-white leading-tight mb-1.5 drop-shadow-sm"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {collection.title}
            </motion.h1>
            <motion.p
              className="text-white/80 text-[13px] font-medium max-w-xs mx-auto mb-5"
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              {collection.description}
            </motion.p>

            {/* Progress circle + bar */}
            <motion.div
              className="flex items-center gap-3 max-w-xs mx-auto mb-4"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex-1 bg-white/25 rounded-full h-3">
                <motion.div
                  className="h-3 rounded-full bg-white"
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                />
              </div>
              <span className="text-sm font-extrabold text-white drop-shadow-sm">{pct}%</span>
            </motion.div>

            {/* Completion message */}
            {isComplete && (
              <motion.div
                className="inline-flex items-center gap-2 rounded-full px-5 py-2 mb-3"
                style={{
                  background: 'rgba(255,255,255,0.25)',
                  backdropFilter: 'blur(8px)',
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                <span className="text-lg">🎉</span>
                <span className="font-bold text-white text-sm">Collection Complete!</span>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Gradient progress strip at top */}
        <div className="absolute top-0 left-0 w-full h-1 z-20">
          <motion.div
            className="h-1"
            style={{
              background: `linear-gradient(90deg, ${collection.coverColor}, white)`,
            }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1 }}
          />
        </div>
      </div>

      <div className="px-4 -mt-2">
        {/* Play Next / Continue CTA */}
        {nextItem && !isComplete && (
          <motion.button
            className="w-full rounded-[16px] p-4 font-bold mb-5 flex items-center gap-3 cursor-pointer text-white relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${collection.coverColor} 0%, ${collection.coverColor}CC 100%)`,
              boxShadow: `0 4px 20px ${collection.coverColor}40`,
            }}
            onClick={() => {
              handleItemComplete(nextItem.id);
              navigate(nextItem.route);
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
            <span className="text-2xl relative z-10">▶️</span>
            <div className="text-left relative z-10">
              <p className="text-sm font-extrabold">{completedCount > 0 ? 'Continue' : 'Play Next'}</p>
              <p className="text-white/80 text-xs font-medium">{nextItem.emoji} {nextItem.title}</p>
            </div>
          </motion.button>
        )}

        {/* Learning Goals */}
        {collection.learningGoals.length > 0 && (
          <div className="mb-5">
            <h3 className="text-[13px] font-extrabold text-[#6B6B7B] uppercase tracking-wider mb-2.5">
              🎯 Learning Goals
            </h3>
            <div className="flex flex-wrap gap-2">
              {collection.learningGoals.map((goal) => (
                <span
                  key={goal}
                  className="bg-white rounded-full px-3.5 py-1.5 text-xs font-bold text-[#6B6B7B] shadow-[0_2px_8px_rgba(45,45,58,0.04)] border border-[#F0EAE0]"
                >
                  {goal}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Content Sequence List — Numbered track list */}
        <h3 className="text-[13px] font-extrabold text-[#6B6B7B] uppercase tracking-wider mb-3">
          📋 Activities ({completedCount}/{totalCount})
        </h3>
        <div className="space-y-2.5 max-w-md mx-auto">
          {items.map((item, i) => {
            const done = completedItems.has(item.id);
            const isNext = nextItem?.id === item.id;
            const badge = getTypeBadge(item.type);

            return (
              <motion.button
                key={item.id}
                className={`w-full bg-white rounded-[16px] p-3.5 flex items-center gap-3 shadow-[0_2px_12px_rgba(45,45,58,0.06)] border cursor-pointer transition-all ${
                  done
                    ? 'opacity-60 border-[#F0EAE0]'
                    : isNext
                    ? 'border-[2px] shadow-[0_4px_20px_rgba(45,45,58,0.08)]'
                    : 'border-[#F0EAE0]'
                }`}
                style={
                  isNext
                    ? { borderColor: collection.coverColor }
                    : undefined
                }
                onClick={() => {
                  if (!done) handleItemComplete(item.id);
                  navigate(item.route);
                }}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: done ? 0.6 : 1 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Number circle */}
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-extrabold"
                  style={
                    done
                      ? { background: '#EDFAEF', color: '#2D7A3E' }
                      : isNext
                      ? { background: collection.coverColor, color: 'white' }
                      : { background: '#F0EAE0', color: '#6B6B7B' }
                  }
                >
                  {done ? '✓' : i + 1}
                </div>

                {/* Icon */}
                <span className="text-xl flex-shrink-0">{done ? '✅' : item.emoji}</span>

                {/* Content */}
                <div className="flex-1 min-w-0 text-left">
                  <p className={`font-bold text-sm leading-tight ${done ? 'text-[#9B9BAB] line-through' : 'text-[#2D2D3A]'}`}>
                    {item.title}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    {/* Type badge */}
                    <span
                      className="text-[10px] rounded-full px-2 py-0.5 font-bold capitalize"
                      style={{ background: badge.bg, color: badge.text }}
                    >
                      {badge.label}
                    </span>
                    {isNext && (
                      <span
                        className="text-[10px] rounded-full px-2 py-0.5 font-bold"
                        style={{ background: `${collection.coverColor}18`, color: collection.coverColor }}
                      >
                        Up next
                      </span>
                    )}
                  </div>
                </div>

                {/* Chevron or check */}
                {!done && (
                  <span
                    className="text-lg font-bold flex-shrink-0"
                    style={{ color: isNext ? collection.coverColor : '#F0EAE0' }}
                  >
                    ›
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Related Collections — "You might also like" rail */}
        {relatedCollections.length > 0 && (
          <div className="mt-8 mb-4">
            <h3 className="text-[13px] font-extrabold text-[#6B6B7B] uppercase tracking-wider mb-3">
              💡 You might also like
            </h3>
            <div className="flex gap-3 overflow-x-auto -mx-4 px-4 pb-2 scrollbar-hide">
              {relatedCollections.map((col, i) => (
                <motion.button
                  key={col.id}
                  className="flex-shrink-0 w-36 bg-white rounded-[18px] shadow-[0_2px_12px_rgba(45,45,58,0.06)] border border-[#F0EAE0] text-left cursor-pointer overflow-hidden hover:shadow-[0_6px_20px_rgba(45,45,58,0.10)] transition-shadow duration-200"
                  onClick={() => navigate(`/collections/${col.id}`)}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {/* Cover */}
                  <div
                    className="h-20 flex items-center justify-center relative"
                    style={{
                      background: `linear-gradient(135deg, ${col.coverColor}20 0%, ${col.coverColor}40 100%)`,
                    }}
                  >
                    <span className="text-4xl drop-shadow-md">{col.emoji}</span>
                    <div
                      className="absolute top-0 left-0 w-full h-0.5"
                      style={{ backgroundColor: col.coverColor }}
                    />
                  </div>
                  <div className="p-2.5">
                    <h4 className="font-extrabold text-[#2D2D3A] text-[12px] leading-tight line-clamp-2 mb-1">
                      {col.title}
                    </h4>
                    <p className="text-[10px] text-[#9B9BAB] font-medium">
                      {col.contentIds.length} items · ~{col.estimatedMinutes} min
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
