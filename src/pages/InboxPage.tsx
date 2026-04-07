import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useInbox } from '../hooks/useInbox';
import { useDeepLink } from '../hooks/useDeepLink';
import type { InboxMessage } from '../db/database';
import NavButton from '../components/NavButton';

const messageTypeConfig: Record<string, { emoji: string; color: string; label: string }> = {
  recap: { emoji: '📊', color: 'bg-grape/10', label: 'Weekly Recap' },
  new_content: { emoji: '🆕', color: 'bg-teal/10', label: 'New Content' },
  tip: { emoji: '💡', color: 'bg-sunny/10', label: 'Tip' },
  system: { emoji: '⚙️', color: 'bg-gray-100', label: 'System' },
  bedtime_suggestion: { emoji: '🌙', color: 'bg-indigo-100', label: 'Bedtime' },
};

export default function InboxPage() {
  const navigate = useNavigate();
  const { currentPlayer } = useApp();
  const { messages, unreadCount, markRead, markAllRead } = useInbox();
  const { resolveDeepLink } = useDeepLink();

  // Parent gate
  const [unlocked, setUnlocked] = useState(false);
  const [gateAnswer, setGateAnswer] = useState('');
  const [gateError, setGateError] = useState(false);
  const [num1] = useState(() => Math.floor(Math.random() * 10) + 5);
  const [num2] = useState(() => Math.floor(Math.random() * 10) + 3);
  const correctAnswer = num1 + num2;

  // Selected message
  const [selectedMessage, setSelectedMessage] = useState<InboxMessage | null>(null);

  if (!currentPlayer) return <Navigate to="/" replace />;

  function handleGateSubmit() {
    if (parseInt(gateAnswer) === correctAnswer) {
      setUnlocked(true);
    } else {
      setGateAnswer('');
      setGateError(true);
      setTimeout(() => setGateError(false), 2000);
    }
  }

  function handleOpenMessage(msg: InboxMessage) {
    if (!msg.read && msg.id) {
      markRead(msg.id);
    }
    setSelectedMessage(msg);
  }

  function handleActionUrl(url: string) {
    setSelectedMessage(null);
    resolveDeepLink(url);
  }

  if (!unlocked) {
    return (
      <div className="min-h-dvh bg-[#F8FAFC] px-4 pt-4 pb-8 flex flex-col items-center justify-center">
        <motion.div className="text-6xl mb-4" initial={{ scale: 0 }} animate={{ scale: 1 }}>
          📬
        </motion.div>
        <h2 className="text-2xl font-bold text-[#2D2D3A] mb-2">Inbox</h2>
        <p className="text-[#6B6B7B] mb-6 text-center">Solve this to view messages</p>
        <motion.div
          className="bg-white rounded-xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-[#E2E8F0] text-center max-w-xs w-full"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <p className="text-3xl font-bold text-[#2D2D3A] mb-4">
            {num1} + {num2} = ?
          </p>
          <input
            type="number"
            value={gateAnswer}
            onChange={(e) => setGateAnswer(e.target.value)}
            placeholder="Answer"
            className="w-full bg-[#F8FAFC] rounded-xl px-4 py-3 text-2xl text-center font-bold outline-none focus:ring-4 focus:ring-grape/20 border border-[#E2E8F0] mb-4"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleGateSubmit()}
          />
          {gateError && (
            <p className="text-coral font-bold text-sm mb-3">That&apos;s not right. Try again!</p>
          )}
          <div className="flex gap-3">
            <motion.button
              className="flex-1 bg-[#F1F5F9] text-[#6B6B7B] rounded-xl py-3 font-bold cursor-pointer"
              onClick={() => navigate(-1)}
              whileTap={{ scale: 0.95 }}
            >
              Back
            </motion.button>
            <motion.button
              className="flex-1 bg-grape text-white rounded-xl py-3 font-bold cursor-pointer"
              onClick={handleGateSubmit}
              whileTap={{ scale: 0.95 }}
            >
              Check
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#F8FAFC] px-4 pt-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <NavButton onClick={() => navigate(-1)} direction="back" />
        <h2 className="text-xl font-bold text-[#2D2D3A]">Inbox</h2>
        <div className="w-14" />
      </div>

      <div className="max-w-md mx-auto">
        {/* Mark All Read */}
        {unreadCount > 0 && (
          <motion.div
            className="flex items-center justify-between mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span className="text-sm text-[#6B6B7B]">
              {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
            </span>
            <motion.button
              className="text-sm font-bold text-teal cursor-pointer"
              onClick={markAllRead}
              whileTap={{ scale: 0.95 }}
            >
              Mark All Read
            </motion.button>
          </motion.div>
        )}

        {/* Messages list */}
        <div className="space-y-2.5">
          {messages.length === 0 && (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <span className="text-6xl block mb-4">📭</span>
              <p className="font-bold text-lg text-[#2D2D3A]">No messages yet</p>
              <p className="text-sm text-[#9B9BAB] mt-1">
                You&apos;ll get updates about your child&apos;s learning here
              </p>
            </motion.div>
          )}

          {messages.map((msg, i) => {
            const typeConfig = messageTypeConfig[msg.type] ?? messageTypeConfig.system;
            return (
              <motion.button
                key={msg.id}
                className={`w-full bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border p-3.5 text-left cursor-pointer flex items-start gap-3 ${
                  !msg.read ? 'border-l-[3px] border-l-teal border-t-[#E2E8F0] border-r-[#E2E8F0] border-b-[#E2E8F0]' : 'border-[#E2E8F0]'
                }`}
                initial={{ y: 5, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => handleOpenMessage(msg)}
                whileTap={{ scale: 0.98 }}
              >
                {/* Type icon */}
                <div className="flex-shrink-0 pt-0.5">
                  <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center text-lg ${typeConfig.color}`}>
                    {typeConfig.emoji}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${!msg.read ? 'text-[#2D2D3A]' : 'text-[#6B6B7B]'} truncate`}>
                      {msg.title}
                    </span>
                    {!msg.read && (
                      <span className="w-2 h-2 rounded-full bg-teal flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-[#9B9BAB] truncate mt-0.5">{msg.body}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`text-[10px] font-bold ${typeConfig.color} rounded-full px-1.5 py-0.5 text-[#6B6B7B]`}>
                      {typeConfig.label}
                    </span>
                    <span className="text-[10px] text-[#9B9BAB]">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Message detail modal */}
      <AnimatePresence>
        {selectedMessage && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-end justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedMessage(null)}
          >
            <motion.div
              className="bg-white rounded-t-[24px] w-full max-w-md max-h-[85vh] overflow-y-auto p-6 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-[#E2E8F0] rounded-full mx-auto mb-5" />

              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
                  messageTypeConfig[selectedMessage.type]?.color ?? 'bg-[#F8FAFC]'
                }`}>
                  {messageTypeConfig[selectedMessage.type]?.emoji ?? '📩'}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#2D2D3A]">{selectedMessage.title}</h3>
                  <span className="text-xs text-[#9B9BAB]">
                    {new Date(selectedMessage.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              <div className="text-sm text-[#6B6B7B] leading-relaxed whitespace-pre-line mb-6">
                {selectedMessage.body}
              </div>

              <div className="flex gap-3">
                {selectedMessage.actionUrl && (
                  <motion.button
                    className="flex-1 bg-teal text-white font-bold py-3 rounded-xl text-sm cursor-pointer shadow-[0_2px_8px_rgba(78,205,196,0.3)]"
                    onClick={() => handleActionUrl(selectedMessage.actionUrl!)}
                    whileTap={{ scale: 0.95 }}
                  >
                    Open
                  </motion.button>
                )}
                <motion.button
                  className="flex-1 bg-[#F1F5F9] text-[#6B6B7B] font-bold py-3 rounded-xl text-sm cursor-pointer"
                  onClick={() => setSelectedMessage(null)}
                  whileTap={{ scale: 0.95 }}
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
