import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useSubscription } from '../hooks/useSubscription';
import NavButton from '../components/NavButton';

const freeFeatures = [
  { label: 'Basic content (Letters, Numbers, Colors, Shapes)', included: true },
  { label: '1 player profile', included: true },
  { label: 'Daily learning streaks', included: true },
  { label: 'All 316+ activities', included: false },
  { label: 'Offline learning packs', included: false },
  { label: 'Up to 5 profiles', included: false },
  { label: 'Ad-free experience', included: false },
  { label: 'Advanced parent reports', included: false },
  { label: 'Custom routines', included: false },
];

const premiumFeatures = [
  { label: 'Basic content (Letters, Numbers, Colors, Shapes)', included: true },
  { label: '1 player profile', included: true },
  { label: 'Daily learning streaks', included: true },
  { label: 'All 316+ activities', included: true },
  { label: 'Offline learning packs', included: true },
  { label: 'Up to 5 profiles', included: true },
  { label: 'Ad-free experience', included: true },
  { label: 'Advanced parent reports', included: true },
  { label: 'Custom routines', included: true },
];

const familyFeatures = [
  { label: 'Everything in Premium', included: true },
  { label: 'Up to 10 profiles', included: true },
  { label: 'Family activity dashboard', included: true },
  { label: 'Shared progress tracking', included: true },
  { label: 'Priority support', included: true },
];

const faqItems = [
  {
    question: 'Can I cancel anytime?',
    answer: 'Yes! Cancel anytime and keep access until the end of your billing period. No questions asked.',
  },
  {
    question: 'Is my data safe?',
    answer: 'All learning data is stored locally on your device. We collect minimal data and never share it with third parties.',
  },
  {
    question: 'What happens to my progress if I downgrade?',
    answer: 'Your progress is never lost. You just lose access to premium content until you resubscribe.',
  },
  {
    question: 'Can I share with family members?',
    answer: 'The Family plan supports up to 10 profiles, perfect for siblings and extended family.',
  },
  {
    question: 'Is there a free trial?',
    answer: 'Yes! Every new user gets a 14-day free trial of Premium with full access to all features.',
  },
];

export default function BillingPage() {
  const navigate = useNavigate();
  const { currentPlayer } = useApp();
  const { plan, isPremium, isTrialing, trialDaysLeft } = useSubscription();

  // Parent gate state
  const [unlocked, setUnlocked] = useState(false);
  const [gateAnswer, setGateAnswer] = useState('');
  const [gateError, setGateError] = useState(false);
  const [num1] = useState(() => Math.floor(Math.random() * 10) + 5);
  const [num2] = useState(() => Math.floor(Math.random() * 10) + 3);
  const correctAnswer = num1 + num2;

  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Billing period toggle
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

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

  if (!unlocked) {
    return (
      <div className="min-h-dvh bg-[#F8FAFC] px-4 pt-4 pb-8 flex flex-col items-center justify-center">
        {/* Decorative background circles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-grape/5" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-teal/5" />
        </div>

        <motion.div
          className="relative z-10 flex flex-col items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-20 h-20 rounded-[24px] bg-gradient-to-br from-grape/10 to-grape/5 flex items-center justify-center mb-5 shadow-[0_4px_20px_rgba(167,139,250,0.12)]"
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', delay: 0.1 }}
          >
            <span className="text-4xl">💳</span>
          </motion.div>

          <h2 className="text-2xl font-extrabold text-[#2D2D3A] mb-2">Billing & Plans</h2>
          <p className="text-[15px] font-medium text-[#6B6B7B] mb-8 text-center max-w-[260px]">
            Solve this quick math problem to manage your subscription
          </p>

          <motion.div
            className="bg-white rounded-[20px] p-7 shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-[#E2E8F0] text-center max-w-xs w-full"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-[#F8FAFC] rounded-2xl p-4 mb-5">
              <p className="text-4xl font-extrabold text-[#2D2D3A] tracking-tight">
                {num1} + {num2} = ?
              </p>
            </div>
            <input
              type="number"
              value={gateAnswer}
              onChange={(e) => setGateAnswer(e.target.value)}
              placeholder="Your answer"
              className="w-full bg-[#F8FAFC] rounded-[14px] px-4 py-3.5 text-2xl text-center font-bold outline-none focus:ring-4 focus:ring-grape/20 focus:border-grape/30 border border-[#E2E8F0] mb-4 transition-all"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleGateSubmit()}
            />

            <AnimatePresence>
              {gateError && (
                <motion.p
                  className="text-coral font-bold text-sm mb-3"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  That&apos;s not right. Try again!
                </motion.p>
              )}
            </AnimatePresence>

            <div className="flex gap-3">
              <motion.button
                className="flex-1 bg-[#F1F5F9] text-[#6B6B7B] rounded-[14px] py-3.5 font-bold cursor-pointer border border-[#E2E8F0] hover:bg-[#E8EDF2] transition-colors"
                onClick={() => navigate(-1)}
                whileTap={{ scale: 0.95 }}
              >
                Back
              </motion.button>
              <motion.button
                className="flex-1 bg-gradient-to-r from-grape to-indigo-400 text-white rounded-[14px] py-3.5 font-bold cursor-pointer shadow-[0_4px_16px_rgba(167,139,250,0.3)]"
                onClick={handleGateSubmit}
                whileTap={{ scale: 0.95 }}
              >
                Check
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#F8FAFC] px-4 pt-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <NavButton onClick={() => navigate(-1)} direction="back" />
        <h2 className="text-xl font-bold text-[#2D2D3A]">Billing & Plans</h2>
        <div className="w-14" />
      </div>

      <div className="max-w-md mx-auto space-y-5">

        {/* ─── Current Plan Status Pill ─── */}
        <motion.div
          className="flex items-center justify-center"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${
            isPremium
              ? 'bg-grape-soft text-grape'
              : isTrialing
              ? 'bg-[#FFF8F0] text-tangerine'
              : 'bg-[#F1F5F9] text-[#6B6B7B]'
          }`}>
            <span className="text-base">{isPremium ? '👑' : isTrialing ? '⏳' : '🆓'}</span>
            {isPremium ? 'Premium Plan Active' : isTrialing ? `Trial - ${trialDaysLeft} day${trialDaysLeft !== 1 ? 's' : ''} left` : 'Free Plan'}
          </div>
        </motion.div>

        {/* ─── Trial Banner ─── */}
        {isTrialing && (
          <motion.div
            className="relative overflow-hidden bg-gradient-to-r from-sunny to-tangerine rounded-[20px] p-5 shadow-[0_4px_20px_rgba(255,140,66,0.15)]"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.05 }}
          >
            {/* Decorative ring */}
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full border-4 border-white/15" aria-hidden="true" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-xl">⏳</span>
                </div>
                <div>
                  <p className="text-white font-extrabold text-lg leading-tight">Trial Active</p>
                  <p className="text-white/75 text-sm font-medium">
                    {trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''} remaining of 14
                  </p>
                </div>
              </div>
              <div className="w-full bg-white/25 rounded-full h-2.5">
                <motion.div
                  className="h-2.5 bg-white rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(5, ((14 - trialDaysLeft) / 14) * 100)}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
              <p className="text-white/60 text-xs mt-2 font-medium">Subscribe before your trial ends to keep all features</p>
            </div>
          </motion.div>
        )}

        {/* ─── Current Plan Card ─── */}
        <motion.div
          className="bg-white rounded-[20px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#E2E8F0] p-5"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.05 }}
        >
          <h3 className="font-extrabold text-[#9B9BAB] mb-3 text-xs tracking-wider uppercase">Current Plan</h3>
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-[16px] flex items-center justify-center text-2xl shadow-sm ${
              isPremium ? 'bg-gradient-to-br from-grape/15 to-grape/5' : isTrialing ? 'bg-gradient-to-br from-tangerine/15 to-tangerine/5' : 'bg-[#F1F5F9]'
            }`}>
              {isPremium ? '👑' : isTrialing ? '⏳' : '🆓'}
            </div>
            <div className="flex-1">
              <p className="font-extrabold text-lg text-[#2D2D3A]">
                {isPremium ? 'Premium' : isTrialing ? 'Trial' : 'Free Plan'}
              </p>
              <p className="text-sm text-[#9B9BAB]">
                {isPremium
                  ? 'Full access to all content'
                  : isTrialing
                  ? 'Exploring premium features'
                  : 'Basic content access'}
              </p>
            </div>
          </div>

          {isPremium && (
            <div className="mt-4 pt-4 border-t border-[#E2E8F0]">
              <div className="flex items-center justify-between text-sm mb-3">
                <span className="text-[#9B9BAB] font-medium">Next billing date</span>
                <span className="font-bold text-[#2D2D3A]">Apr 26, 2026</span>
              </div>
              <motion.button
                className="w-full bg-[#F1F5F9] text-[#6B6B7B] font-bold py-3 rounded-[14px] text-sm cursor-pointer border border-[#E2E8F0] hover:bg-[#E8EDF2] transition-colors"
                whileTap={{ scale: 0.97 }}
              >
                Manage Subscription
              </motion.button>
            </div>
          )}
        </motion.div>

        {/* ─── Billing Period Toggle ─── */}
        <motion.div
          className="flex items-center justify-center gap-1 p-1 bg-[#F1F5F9] rounded-full max-w-[260px] mx-auto"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.08 }}
        >
          <button
            className={`flex-1 py-2 px-4 rounded-full text-sm font-bold transition-all cursor-pointer ${
              billingPeriod === 'monthly'
                ? 'bg-white text-[#2D2D3A] shadow-sm'
                : 'text-[#9B9BAB]'
            }`}
            onClick={() => setBillingPeriod('monthly')}
          >
            Monthly
          </button>
          <button
            className={`flex-1 py-2 px-4 rounded-full text-sm font-bold transition-all cursor-pointer relative ${
              billingPeriod === 'annual'
                ? 'bg-white text-[#2D2D3A] shadow-sm'
                : 'text-[#9B9BAB]'
            }`}
            onClick={() => setBillingPeriod('annual')}
          >
            Annual
            <span className="absolute -top-2.5 -right-2 bg-leaf text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">
              -20%
            </span>
          </button>
        </motion.div>

        {/* ─── Plan Comparison Cards ─── */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="font-extrabold text-[#9B9BAB] mb-3 text-xs tracking-wider uppercase">Compare Plans</h3>
          <div className="space-y-3">

            {/* Free Plan Card */}
            <div className={`bg-white rounded-[20px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] border-2 p-5 transition-all ${
              plan === 'free' && !isTrialing
                ? 'border-teal/40 ring-1 ring-teal/10'
                : 'border-[#E2E8F0]'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#F1F5F9] flex items-center justify-center text-xl">
                    🆓
                  </div>
                  <div>
                    <p className="font-extrabold text-[#2D2D3A] text-lg">Free</p>
                    <p className="text-xs text-[#9B9BAB] font-medium">Basic features</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-extrabold text-[#2D2D3A]">$0</p>
                  <p className="text-xs text-[#9B9BAB] font-medium">forever</p>
                </div>
              </div>
              <div className="space-y-2">
                {freeFeatures.map((f) => (
                  <div key={f.label} className="flex items-start gap-2.5">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      f.included ? 'bg-leaf/10' : 'bg-[#F1F5F9]'
                    }`}>
                      <span className={`text-[11px] font-bold ${f.included ? 'text-leaf' : 'text-[#D1D5DB]'}`}>
                        {f.included ? '\u2713' : '\u2715'}
                      </span>
                    </div>
                    <span className={`text-[13px] font-medium ${f.included ? 'text-[#4B5563]' : 'text-[#C8C8D4]'}`}>
                      {f.label}
                    </span>
                  </div>
                ))}
              </div>
              {plan === 'free' && !isTrialing && (
                <div className="mt-4 text-center">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-teal bg-teal-soft px-3 py-1.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal" />
                    Current Plan
                  </span>
                </div>
              )}
            </div>

            {/* Premium Plan Card */}
            <div className="relative">
              {/* Recommended Badge */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                <span className="bg-gradient-to-r from-grape to-indigo-400 text-white text-[10px] font-extrabold uppercase tracking-wider px-4 py-1.5 rounded-full shadow-[0_2px_12px_rgba(167,139,250,0.3)]">
                  Recommended
                </span>
              </div>
              <div className={`bg-white rounded-[20px] shadow-[0_4px_20px_rgba(167,139,250,0.1)] p-5 pt-7 border-[3px] transition-all ${
                isPremium
                  ? 'border-grape ring-2 ring-grape/10'
                  : 'border-grape/30'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-grape/15 to-grape/5 flex items-center justify-center text-xl shadow-sm">
                      👑
                    </div>
                    <div>
                      <p className="font-extrabold text-grape text-lg">Premium</p>
                      <p className="text-xs text-[#9B9BAB] font-medium">Full access</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-extrabold text-[#2D2D3A]">
                      {billingPeriod === 'monthly' ? '$4.99' : '$3.99'}
                    </p>
                    <p className="text-xs text-[#9B9BAB] font-medium">/month</p>
                    {billingPeriod === 'annual' && (
                      <p className="text-[10px] text-leaf font-bold">$47.88/year</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  {premiumFeatures.map((f) => (
                    <div key={f.label} className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-leaf/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[11px] font-bold text-leaf">{'\u2713'}</span>
                      </div>
                      <span className="text-[13px] font-medium text-[#4B5563]">{f.label}</span>
                    </div>
                  ))}
                </div>
                {isPremium ? (
                  <div className="mt-4 text-center">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-grape bg-grape-soft px-3 py-1.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-grape" />
                      Current Plan
                    </span>
                  </div>
                ) : (
                  <motion.button
                    className="w-full mt-4 bg-gradient-to-r from-grape to-indigo-400 text-white font-extrabold py-3.5 rounded-[14px] text-sm cursor-pointer shadow-[0_4px_16px_rgba(167,139,250,0.3)]"
                    whileTap={{ scale: 0.95 }}
                  >
                    {isTrialing ? 'Subscribe Now' : 'Start Free Trial'}
                  </motion.button>
                )}
              </div>
            </div>

            {/* Family Plan Card */}
            <div className="bg-white rounded-[20px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] border-2 border-[#E2E8F0] p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal/15 to-teal/5 flex items-center justify-center text-xl shadow-sm">
                    👨&zwj;👩&zwj;👧&zwj;👦
                  </div>
                  <div>
                    <p className="font-extrabold text-teal text-lg">Family</p>
                    <p className="text-xs text-[#9B9BAB] font-medium">For the whole family</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-extrabold text-[#2D2D3A]">
                    {billingPeriod === 'monthly' ? '$7.99' : '$6.49'}
                  </p>
                  <p className="text-xs text-[#9B9BAB] font-medium">/month</p>
                  {billingPeriod === 'annual' && (
                    <p className="text-[10px] text-leaf font-bold">$77.88/year</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                {familyFeatures.map((f) => (
                  <div key={f.label} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-leaf/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[11px] font-bold text-leaf">{'\u2713'}</span>
                    </div>
                    <span className="text-[13px] font-medium text-[#4B5563]">{f.label}</span>
                  </div>
                ))}
              </div>
              <motion.button
                className="w-full mt-4 bg-[#F1F5F9] text-[#6B6B7B] font-bold py-3 rounded-[14px] text-sm cursor-pointer border border-[#E2E8F0] hover:bg-[#E8EDF2] transition-colors"
                whileTap={{ scale: 0.95 }}
              >
                Choose Family
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* ─── Premium Feature Highlights ─── */}
        {!isPremium && (
          <motion.div
            className="relative overflow-hidden bg-gradient-to-br from-grape via-indigo-500 to-grape rounded-[20px] p-6 text-center shadow-[0_8px_32px_rgba(167,139,250,0.2)]"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none" aria-hidden="true">
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5" />
              <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/5" />
              <div className="absolute top-1/2 left-1/4 w-2 h-2 rounded-full bg-white/20" />
              <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 rounded-full bg-white/15" />
            </div>

            <div className="relative z-10">
              <motion.div
                className="text-4xl mb-3"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                🌟
              </motion.div>
              <h3 className="text-white font-extrabold text-xl mb-1">Unlock Full Learning</h3>
              <p className="text-white/65 text-sm mb-5 max-w-[280px] mx-auto leading-relaxed">
                Give your child access to 316+ activities, offline packs, and more!
              </p>

              <motion.button
                className="bg-white text-grape font-extrabold py-3.5 px-10 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.12)] cursor-pointer text-base"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
              >
                {isTrialing ? 'Subscribe Now' : 'Start Free Trial'}
              </motion.button>

              {!isTrialing && (
                <motion.div
                  className="mt-3 inline-flex items-center gap-1.5 bg-white/10 text-white/80 text-xs font-bold px-4 py-1.5 rounded-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <span>🎁</span> Try 14 days free, then $4.99/month
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* ─── Premium Badge & Lock Visuals Info ─── */}
        {!isPremium && (
          <motion.div
            className="bg-white rounded-[20px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#E2E8F0] p-5"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.22 }}
          >
            <h3 className="font-extrabold text-[#9B9BAB] mb-4 text-xs tracking-wider uppercase">How Premium Works</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-grape-soft flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">🔒</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-[#2D2D3A]">Locked Content</p>
                  <p className="text-xs text-[#9B9BAB] leading-relaxed">You'll see a lock icon on premium activities. Tap to preview before subscribing.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-grape-soft flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">⭐</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-[#2D2D3A]">Premium Badge</p>
                  <p className="text-xs text-[#9B9BAB] leading-relaxed">Content marked with a
                    <span className="inline-flex items-center gap-0.5 bg-gradient-to-r from-grape to-indigo-400 text-white text-[9px] font-bold px-2 py-0.5 rounded-full mx-1">
                      Premium
                    </span>
                    badge is part of your subscription.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-grape-soft flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">💡</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-[#2D2D3A]">Graceful Access</p>
                  <p className="text-xs text-[#9B9BAB] leading-relaxed">No aggressive paywalls. Browse freely and upgrade when you're ready.</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── FAQ Accordion ─── */}
        <motion.div
          className="bg-white rounded-[20px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#E2E8F0] p-5"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          <h3 className="font-extrabold text-[#9B9BAB] mb-3 text-xs tracking-wider uppercase">Frequently Asked Questions</h3>
          <div className="space-y-0">
            {faqItems.map((item, index) => (
              <div key={index}>
                {index > 0 && <div className="h-px bg-[#F1F5F9] my-0.5" />}
                <button
                  className="w-full text-left py-3.5 flex items-center justify-between gap-3 cursor-pointer group"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <span className="text-sm font-bold text-[#2D2D3A] group-hover:text-grape transition-colors">
                    {item.question}
                  </span>
                  <motion.span
                    className="text-[#9B9BAB] text-lg flex-shrink-0"
                    animate={{ rotate: openFaq === index ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {'\u25BE'}
                  </motion.span>
                </button>
                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="text-xs text-[#9B9BAB] pb-3 leading-relaxed pl-0">
                        {item.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
