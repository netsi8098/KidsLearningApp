import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useMediaQueue } from '../hooks/useMediaQueue';
import NavButton from '../components/NavButton';
import QueueCard from '../components/QueueCard';

export default function QueuePage() {
  const navigate = useNavigate();
  const { currentPlayer } = useApp();
  const { queue, removeFromQueue, clearQueue, moveUp, moveDown } =
    useMediaQueue(currentPlayer?.id);

  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [autoplay, setAutoplay] = useState(() => {
    try {
      return localStorage.getItem('kidlearn-autoplay') !== 'false';
    } catch {
      return true;
    }
  });

  if (!currentPlayer) return <Navigate to="/" replace />;

  function handleToggleAutoplay() {
    const next = !autoplay;
    setAutoplay(next);
    try {
      localStorage.setItem('kidlearn-autoplay', String(next));
    } catch {}
  }

  function handleClearAll() {
    clearQueue();
    setShowClearConfirm(false);
  }

  return (
    <div className="min-h-dvh bg-cream p-4 pb-8">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-5">
        <NavButton onClick={() => navigate('/menu')} direction="back" />
        <motion.h1
          className="text-xl font-bold text-gray-800"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          My Queue
        </motion.h1>
        <div className="w-14" />
      </div>

      <div className="max-w-md mx-auto">
        {/* ── Empty state ── */}
        {queue.length === 0 && (
          <motion.div
            className="text-center py-20 text-gray-400"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <span className="text-6xl block mb-4">📋</span>
            <p className="font-bold text-lg text-gray-500 mb-1">Queue is empty</p>
            <p className="text-sm">
              Add videos or stories to your queue!
            </p>
            <motion.button
              className="mt-5 bg-teal text-white rounded-2xl px-6 py-3 font-bold shadow-lg cursor-pointer"
              onClick={() => navigate('/videos')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Browse Videos
            </motion.button>
          </motion.div>
        )}

        {/* ── Queue items ── */}
        {queue.length > 0 && (
          <>
            {/* Autoplay toggle */}
            <motion.div
              className="flex items-center justify-between bg-white rounded-xl shadow-sm p-3 mb-4"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">🔄</span>
                <span className="text-sm font-bold text-gray-700">Autoplay</span>
              </div>
              <button
                className={`relative w-12 h-7 rounded-full transition-colors cursor-pointer ${
                  autoplay ? 'bg-teal' : 'bg-gray-300'
                }`}
                onClick={handleToggleAutoplay}
                aria-label={`Autoplay ${autoplay ? 'on' : 'off'}`}
              >
                <motion.div
                  className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm"
                  animate={{ left: autoplay ? '22px' : '2px' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
            </motion.div>

            {/* Queue list */}
            <div className="flex flex-col gap-2 mb-6">
              <AnimatePresence>
                {queue.map((item, i) => (
                  <QueueCard
                    key={item.id}
                    emoji={item.emoji}
                    title={item.title}
                    contentType={item.contentType}
                    onRemove={() => item.id && removeFromQueue(item.id)}
                    onMoveUp={() => item.id && moveUp(item.id)}
                    onMoveDown={() => item.id && moveDown(item.id)}
                    isFirst={i === 0}
                    isLast={i === queue.length - 1}
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* Clear All button */}
            {!showClearConfirm ? (
              <motion.button
                className="w-full bg-red-50 text-red-500 rounded-xl py-3 font-bold text-sm cursor-pointer hover:bg-red-100 transition-colors"
                onClick={() => setShowClearConfirm(true)}
                whileTap={{ scale: 0.98 }}
              >
                Clear All
              </motion.button>
            ) : (
              <motion.div
                className="bg-red-50 rounded-xl p-4 text-center"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <p className="text-sm font-bold text-red-600 mb-3">
                  Remove all items from your queue?
                </p>
                <div className="flex gap-2 justify-center">
                  <motion.button
                    className="bg-red-500 text-white rounded-lg px-5 py-2 font-bold text-sm cursor-pointer"
                    onClick={handleClearAll}
                    whileTap={{ scale: 0.95 }}
                  >
                    Yes, Clear
                  </motion.button>
                  <motion.button
                    className="bg-white text-gray-600 rounded-lg px-5 py-2 font-bold text-sm cursor-pointer shadow-sm"
                    onClick={() => setShowClearConfirm(false)}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
