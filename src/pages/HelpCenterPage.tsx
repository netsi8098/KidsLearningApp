import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useHelpArticles, type HelpArticle, type HelpCategory } from '../hooks/useHelpArticles';
import NavButton from '../components/NavButton';

const categoryConfig: Record<HelpCategory, { label: string; emoji: string }> = {
  getting_started: { label: 'Getting Started', emoji: '🚀' },
  troubleshooting: { label: 'Troubleshooting', emoji: '🔧' },
  billing: { label: 'Billing', emoji: '💳' },
  content: { label: 'Content', emoji: '📚' },
  accessibility: { label: 'Accessibility', emoji: '\u267F' },
  account: { label: 'Account', emoji: '👤' },
};

const categoryOrder: HelpCategory[] = [
  'getting_started',
  'troubleshooting',
  'billing',
  'content',
  'accessibility',
  'account',
];

export default function HelpCenterPage() {
  const navigate = useNavigate();
  const { currentPlayer } = useApp();
  const {
    filteredArticles,
    searchQuery,
    setSearchQuery,
    getArticlesByCategory,
    submitFeedback,
  } = useHelpArticles();

  // Article detail
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, boolean>>({});

  // Contact form (parent-gated)
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactUnlocked, setContactUnlocked] = useState(false);
  const [contactGateAnswer, setContactGateAnswer] = useState('');
  const [contactNum1] = useState(() => Math.floor(Math.random() * 10) + 5);
  const [contactNum2] = useState(() => Math.floor(Math.random() * 10) + 3);

  // Contact form fields
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactBody, setContactBody] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  if (!currentPlayer) return <Navigate to="/" replace />;

  function handleFeedback(articleId: string, helpful: boolean) {
    submitFeedback(articleId, helpful);
    setFeedbackGiven((prev) => ({ ...prev, [articleId]: true }));
  }

  function handleContactGate() {
    if (parseInt(contactGateAnswer) === contactNum1 + contactNum2) {
      setContactUnlocked(true);
    } else {
      setContactGateAnswer('');
    }
  }

  function handleContactSubmit() {
    // In a real app, this would send to an API
    setContactSubmitted(true);
    setTimeout(() => {
      setShowContactForm(false);
      setContactSubmitted(false);
      setContactEmail('');
      setContactSubject('');
      setContactBody('');
    }, 2000);
  }

  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="min-h-dvh bg-[#F8FAFC] px-4 pt-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <NavButton onClick={() => navigate(-1)} direction="back" />
        <h2 className="text-xl font-bold text-[#2D2D3A]">Help Center</h2>
        <div className="w-14" />
      </div>

      <div className="max-w-md mx-auto space-y-4">
        {/* Search bar */}
        <motion.div
          className="relative"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search help articles..."
            className="w-full bg-white rounded-[14px] px-4 py-3.5 pl-10 outline-none focus:ring-4 focus:ring-grape/15 shadow-[0_2px_12px_rgba(45,45,58,0.06)] border border-[#E2E8F0] text-sm text-[#2D2D3A] placeholder:text-[#9B9BAB]"
          />
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9B9BAB]">🔍</span>
          {searchQuery && (
            <motion.button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B9BAB] text-sm cursor-pointer"
              onClick={() => setSearchQuery('')}
              whileTap={{ scale: 0.9 }}
            >
              ✕
            </motion.button>
          )}
        </motion.div>

        {/* Search results */}
        {isSearching ? (
          <div className="space-y-2.5">
            <p className="text-xs font-bold text-[#9B9BAB] uppercase tracking-wider">
              {filteredArticles.length} result{filteredArticles.length !== 1 ? 's' : ''} for &quot;{searchQuery}&quot;
            </p>
            {filteredArticles.map((article, i) => (
              <motion.button
                key={article.id}
                className="w-full bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-[#E2E8F0] p-3.5 text-left cursor-pointer"
                initial={{ y: 5, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => setSelectedArticle(article)}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">{article.emoji}</span>
                  <div>
                    <p className="text-sm font-bold text-[#2D2D3A]">{article.title}</p>
                    <p className="text-xs text-[#9B9BAB]">{categoryConfig[article.category].label}</p>
                  </div>
                </div>
              </motion.button>
            ))}
            {filteredArticles.length === 0 && (
              <div className="text-center py-12">
                <span className="text-4xl block mb-2">🔍</span>
                <p className="text-sm text-[#6B6B7B]">No articles found. Try different keywords.</p>
              </div>
            )}
          </div>
        ) : (
          /* Category sections */
          categoryOrder.map((catKey, catIdx) => {
            const catArticles = getArticlesByCategory(catKey);
            const config = categoryConfig[catKey];
            return (
              <motion.div
                key={catKey}
                className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-[#E2E8F0] p-5"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: catIdx * 0.05 }}
              >
                <h3 className="font-bold text-[#2D2D3A] mb-3 flex items-center gap-2">
                  <span>{config.emoji}</span>
                  <span className="text-sm tracking-wide">{config.label}</span>
                </h3>
                <div className="space-y-1">
                  {catArticles.map((article) => (
                    <motion.button
                      key={article.id}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#F8FAFC] text-left cursor-pointer transition-colors"
                      onClick={() => setSelectedArticle(article)}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="text-lg">{article.emoji}</span>
                      <span className="text-sm text-[#6B6B7B] font-medium">{article.title}</span>
                      <span className="text-[#E2E8F0] ml-auto text-sm font-bold">→</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            );
          })
        )}

        {/* Contact form section */}
        <motion.div
          className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-[#E2E8F0] p-5"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          <h3 className="font-bold text-[#2D2D3A] mb-1 text-sm">Still need help?</h3>
          <p className="text-xs text-[#9B9BAB] mb-3">Contact our support team</p>
          <motion.button
            className="w-full bg-grape text-white font-bold py-3 rounded-xl text-sm cursor-pointer shadow-[0_2px_8px_rgba(167,139,250,0.3)]"
            onClick={() => setShowContactForm(true)}
            whileTap={{ scale: 0.95 }}
          >
            Contact Support
          </motion.button>
        </motion.div>
      </div>

      {/* Article detail modal */}
      <AnimatePresence>
        {selectedArticle && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-end justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedArticle(null)}
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
                <span className="text-3xl">{selectedArticle.emoji}</span>
                <div>
                  <h3 className="font-bold text-lg text-[#2D2D3A]">{selectedArticle.title}</h3>
                  <span className="text-xs text-[#9B9BAB]">{categoryConfig[selectedArticle.category].label}</span>
                </div>
              </div>

              <div className="text-sm text-[#6B6B7B] leading-relaxed whitespace-pre-line mb-6">
                {selectedArticle.body}
              </div>

              {/* Was this helpful? */}
              <div className="border-t border-[#E2E8F0] pt-4 mb-4">
                {feedbackGiven[selectedArticle.id] ? (
                  <p className="text-sm text-teal font-bold text-center">Thanks for your feedback!</p>
                ) : (
                  <div className="text-center">
                    <p className="text-sm text-[#6B6B7B] mb-2">Was this article helpful?</p>
                    <div className="flex justify-center gap-3">
                      <motion.button
                        className="bg-[#EDFAEF] text-leaf font-bold px-6 py-2 rounded-xl text-sm cursor-pointer"
                        onClick={() => handleFeedback(selectedArticle.id, true)}
                        whileTap={{ scale: 0.95 }}
                      >
                        Yes 👍
                      </motion.button>
                      <motion.button
                        className="bg-[#FFF0F0] text-coral font-bold px-6 py-2 rounded-xl text-sm cursor-pointer"
                        onClick={() => handleFeedback(selectedArticle.id, false)}
                        whileTap={{ scale: 0.95 }}
                      >
                        No 👎
                      </motion.button>
                    </div>
                  </div>
                )}
              </div>

              <motion.button
                className="w-full bg-[#F1F5F9] text-[#6B6B7B] font-bold py-3 rounded-xl text-sm cursor-pointer"
                onClick={() => setSelectedArticle(null)}
                whileTap={{ scale: 0.95 }}
              >
                Close
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contact form modal */}
      <AnimatePresence>
        {showContactForm && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-end justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowContactForm(false)}
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

              {!contactUnlocked ? (
                <div className="text-center">
                  <p className="text-4xl mb-3">🔒</p>
                  <h3 className="font-bold text-lg text-[#2D2D3A] mb-2">Parent Verification</h3>
                  <p className="text-sm text-[#6B6B7B] mb-4">Solve this to submit a support request</p>
                  <p className="text-2xl font-bold text-[#2D2D3A] mb-3">
                    {contactNum1} + {contactNum2} = ?
                  </p>
                  <input
                    type="number"
                    value={contactGateAnswer}
                    onChange={(e) => setContactGateAnswer(e.target.value)}
                    placeholder="Answer"
                    className="w-full bg-[#F8FAFC] rounded-xl px-4 py-3 text-xl text-center font-bold outline-none focus:ring-4 focus:ring-grape/20 border border-[#E2E8F0] mb-4"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleContactGate()}
                  />
                  <div className="flex gap-3">
                    <motion.button
                      className="flex-1 bg-[#F1F5F9] text-[#6B6B7B] rounded-xl py-3 font-bold text-sm cursor-pointer"
                      onClick={() => setShowContactForm(false)}
                      whileTap={{ scale: 0.95 }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      className="flex-1 bg-grape text-white rounded-xl py-3 font-bold text-sm cursor-pointer"
                      onClick={handleContactGate}
                      whileTap={{ scale: 0.95 }}
                    >
                      Check
                    </motion.button>
                  </div>
                </div>
              ) : contactSubmitted ? (
                <motion.div
                  className="text-center py-8"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  <p className="text-5xl mb-3">✅</p>
                  <h3 className="font-bold text-lg text-[#2D2D3A]">Message Sent!</h3>
                  <p className="text-sm text-[#6B6B7B] mt-1">We&apos;ll get back to you as soon as possible.</p>
                </motion.div>
              ) : (
                <div>
                  <h3 className="font-bold text-lg text-[#2D2D3A] mb-4">Contact Support</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-semibold text-[#6B6B7B] mb-1 block">Email</label>
                      <input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full bg-[#F8FAFC] rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-4 focus:ring-grape/15 border border-[#E2E8F0] text-[#2D2D3A] placeholder:text-[#9B9BAB]"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-[#6B6B7B] mb-1 block">Subject</label>
                      <input
                        type="text"
                        value={contactSubject}
                        onChange={(e) => setContactSubject(e.target.value)}
                        placeholder="What do you need help with?"
                        className="w-full bg-[#F8FAFC] rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-4 focus:ring-grape/15 border border-[#E2E8F0] text-[#2D2D3A] placeholder:text-[#9B9BAB]"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-[#6B6B7B] mb-1 block">Message</label>
                      <textarea
                        value={contactBody}
                        onChange={(e) => setContactBody(e.target.value)}
                        placeholder="Describe your issue..."
                        rows={4}
                        className="w-full bg-[#F8FAFC] rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-4 focus:ring-grape/15 border border-[#E2E8F0] resize-none text-[#2D2D3A] placeholder:text-[#9B9BAB]"
                      />
                    </div>
                    <div className="flex gap-3 pt-1">
                      <motion.button
                        className="flex-1 bg-[#F1F5F9] text-[#6B6B7B] rounded-xl py-3 font-bold text-sm cursor-pointer"
                        onClick={() => setShowContactForm(false)}
                        whileTap={{ scale: 0.95 }}
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        className="flex-1 bg-grape text-white rounded-xl py-3 font-bold text-sm cursor-pointer disabled:opacity-40"
                        onClick={handleContactSubmit}
                        disabled={!contactEmail.trim() || !contactSubject.trim() || !contactBody.trim()}
                        whileTap={{ scale: 0.95 }}
                      >
                        Send Message
                      </motion.button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
