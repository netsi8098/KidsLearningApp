import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useProfiles } from '../hooks/useProfile';
import { db } from '../db/database';
import AvatarPicker from '../components/AvatarPicker';

type Step = 'welcome' | 'name' | 'age' | 'interests' | 'goals' | 'routine';

const ageOptions = [2, 3, 4, 5, 6, 7, 8] as const;

function getAgeGroup(age: number): '2-3' | '4-5' | '6-8' {
  if (age <= 3) return '2-3';
  if (age <= 5) return '4-5';
  return '6-8';
}

const interestOptions = [
  { key: 'letters', label: 'Letters & Reading', emoji: '📚' },
  { key: 'numbers', label: 'Numbers & Math', emoji: '🔢' },
  { key: 'animals', label: 'Animals & Nature', emoji: '🐾' },
  { key: 'art', label: 'Art & Coloring', emoji: '🎨' },
  { key: 'music', label: 'Music & Songs', emoji: '🎵' },
  { key: 'games', label: 'Games & Puzzles', emoji: '🎮' },
  { key: 'stories', label: 'Stories', emoji: '📖' },
  { key: 'science', label: 'Science & World', emoji: '🔬' },
];

const goalOptions = [
  { key: 'literacy', label: 'Learn to Read', emoji: '📖' },
  { key: 'math', label: 'Learn Numbers', emoji: '🔢' },
  { key: 'creativity', label: 'Be Creative', emoji: '🎨' },
  { key: 'social', label: 'Understand Feelings', emoji: '💛' },
  { key: 'explore', label: 'Explore the World', emoji: '🌍' },
  { key: 'physical', label: 'Stay Active', emoji: '🏃' },
];

const routineOptions = [
  { key: 'morning', label: 'Morning learner', emoji: '🌅', desc: 'Best focus in the morning' },
  { key: 'afternoon', label: 'Afternoon explorer', emoji: '☀️', desc: 'Likes to play after lunch' },
  { key: 'evening', label: 'Evening wind-down', emoji: '🌙', desc: 'Quiet activities before bed' },
  { key: 'anytime', label: 'Anytime!', emoji: '🎯', desc: 'Flexible schedule' },
];

const ageColors: Record<number, string> = {
  2: 'bg-pink-400', 3: 'bg-rose-400', 4: 'bg-amber-400', 5: 'bg-orange-400',
  6: 'bg-sky-400', 7: 'bg-blue-400', 8: 'bg-indigo-400',
};

/* ── Age card emoji + label for premium cards ─── */
const ageCardData: Record<number, { emoji: string; label: string; gradient: string; shadow: string }> = {
  2: { emoji: '🧸', label: '2 years', gradient: 'from-[#FD79A8] to-[#FF9BC0]', shadow: 'rgba(253,121,168,0.3)' },
  3: { emoji: '🌈', label: '3 years', gradient: 'from-[#FF6B6B] to-[#FF8E8E]', shadow: 'rgba(255,107,107,0.3)' },
  4: { emoji: '🦋', label: '4 years', gradient: 'from-[#FFE66D] to-[#FFED8A]', shadow: 'rgba(255,230,109,0.3)' },
  5: { emoji: '🚀', label: '5 years', gradient: 'from-[#FF8C42] to-[#FFA366]', shadow: 'rgba(255,140,66,0.3)' },
  6: { emoji: '🌟', label: '6 years', gradient: 'from-[#74B9FF] to-[#93CCFF]', shadow: 'rgba(116,185,255,0.3)' },
  7: { emoji: '🔭', label: '7 years', gradient: 'from-[#4ECDC4] to-[#6FE0D9]', shadow: 'rgba(78,205,196,0.3)' },
  8: { emoji: '🏆', label: '8 years', gradient: 'from-[#A78BFA] to-[#C4AAFF]', shadow: 'rgba(167,139,250,0.3)' },
};

/* ── Interest pill colors ─── */
const interestColors: Record<string, { gradient: string; soft: string; shadow: string }> = {
  letters: { gradient: 'from-[#FF6B6B] to-[#FF8E8E]', soft: 'bg-[#FFF0F0]', shadow: 'rgba(255,107,107,0.25)' },
  numbers: { gradient: 'from-[#4ECDC4] to-[#6FE0D9]', soft: 'bg-[#EDFAF8]', shadow: 'rgba(78,205,196,0.25)' },
  animals: { gradient: 'from-[#6BCB77] to-[#8DD98D]', soft: 'bg-[#EDFAEF]', shadow: 'rgba(107,203,119,0.25)' },
  art: { gradient: 'from-[#A78BFA] to-[#C4AAFF]', soft: 'bg-[#F3EFFE]', shadow: 'rgba(167,139,250,0.25)' },
  music: { gradient: 'from-[#FF8C42] to-[#FFA366]', soft: 'bg-[#FFF3EB]', shadow: 'rgba(255,140,66,0.25)' },
  games: { gradient: 'from-[#FFE66D] to-[#FFED8A]', soft: 'bg-[#FFFCE8]', shadow: 'rgba(255,230,109,0.35)' },
  stories: { gradient: 'from-[#FD79A8] to-[#FF9BC0]', soft: 'bg-[#FFF0F6]', shadow: 'rgba(253,121,168,0.25)' },
  science: { gradient: 'from-[#74B9FF] to-[#93CCFF]', soft: 'bg-[#EDF5FF]', shadow: 'rgba(116,185,255,0.25)' },
};

/* ── Step metadata for progress indicator ─── */
const stepLabels: Record<Step, string> = {
  welcome: 'Welcome',
  name: 'Name',
  age: 'Age',
  interests: 'Interests',
  goals: 'Goals',
  routine: 'Routine',
};

/* ── Floating decorative elements ─── */
function FloatingDecor() {
  const items = [
    { char: '✨', x: '10%', y: '15%', delay: 0, size: 'text-lg' },
    { char: '⭐', x: '85%', y: '12%', delay: 0.5, size: 'text-sm' },
    { char: '✨', x: '90%', y: '75%', delay: 1, size: 'text-base' },
    { char: '⭐', x: '5%', y: '80%', delay: 1.5, size: 'text-xs' },
    { char: '✨', x: '75%', y: '45%', delay: 0.8, size: 'text-xs' },
    { char: '⭐', x: '15%', y: '50%', delay: 1.2, size: 'text-sm' },
  ];
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      {items.map((item, i) => (
        <motion.span
          key={i}
          className={`absolute ${item.size} opacity-[0.08]`}
          style={{ left: item.x, top: item.y }}
          animate={{
            y: [0, -8, 0],
            opacity: [0.06, 0.12, 0.06],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            delay: item.delay,
            ease: 'easeInOut',
          }}
        >
          {item.char}
        </motion.span>
      ))}
    </div>
  );
}

/* ── Confetti/Sparkle burst for finish reveal ─── */
function SparklesBurst() {
  const sparkles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    angle: (i / 12) * 360,
    distance: 60 + Math.random() * 40,
    size: 8 + Math.random() * 8,
    delay: Math.random() * 0.3,
    color: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A78BFA', '#FF8C42', '#6BCB77'][i % 6],
  }));
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
      {sparkles.map((s) => {
        const rad = (s.angle * Math.PI) / 180;
        return (
          <motion.div
            key={s.id}
            className="absolute rounded-full"
            style={{
              width: s.size,
              height: s.size,
              backgroundColor: s.color,
            }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: Math.cos(rad) * s.distance,
              y: Math.sin(rad) * s.distance,
              opacity: 0,
              scale: 0,
            }}
            transition={{
              duration: 0.8,
              delay: s.delay,
              ease: 'easeOut',
            }}
          />
        );
      })}
    </div>
  );
}

/* ── Slide animation variants ─── */
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -100 : 100,
    opacity: 0,
  }),
};

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { setCurrentPlayer } = useApp();
  const { createProfile, updateProfile } = useProfiles();
  const [step, setStep] = useState<Step>('welcome');
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('🦁');
  const [avatarPhoto, setAvatarPhoto] = useState<string | undefined>();
  const [age, setAge] = useState<number | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [routine, setRoutine] = useState('');
  const [direction, setDirection] = useState(1);
  const [showFinishReveal, setShowFinishReveal] = useState(false);
  const [isReturning, setIsReturning] = useState(false);

  const steps: Step[] = ['welcome', 'name', 'age', 'interests', 'goals', 'routine'];
  const stepIndex = steps.indexOf(step);
  const progress = ((stepIndex) / (steps.length - 1)) * 100;

  /* ── Interrupted onboarding check ─── */
  useEffect(() => {
    async function checkIncomplete() {
      try {
        const allStates = await db.onboardingState.toArray();
        const incomplete = allStates.find((s) => !s.completedAt && s.currentStep > 0);
        if (incomplete) {
          setIsReturning(true);
          if (incomplete.childName) setName(incomplete.childName);
          if (incomplete.childAge) setAge(incomplete.childAge);
          if (incomplete.selectedInterests) setInterests(incomplete.selectedInterests);
          if (incomplete.learningGoals) setGoals(incomplete.learningGoals);
          if (incomplete.dailyRoutine) setRoutine(incomplete.dailyRoutine);
          const resumeStep = Math.min(incomplete.currentStep, steps.length - 1);
          if (resumeStep > 0 && resumeStep < steps.length) {
            setStep(steps[resumeStep]);
          }
        }
      } catch {
        // db not ready or no state - proceed normally
      }
    }
    checkIncomplete();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function next() {
    const idx = steps.indexOf(step);
    if (idx < steps.length - 1) {
      setDirection(1);
      setStep(steps[idx + 1]);
      setIsReturning(false);
    }
  }

  function back() {
    const idx = steps.indexOf(step);
    if (idx > 0) {
      setDirection(-1);
      setStep(steps[idx - 1]);
    }
  }

  function toggleItem(key: string, list: string[], setList: (v: string[]) => void, max = 4) {
    if (list.includes(key)) {
      setList(list.filter((i) => i !== key));
    } else if (list.length < max) {
      setList([...list, key]);
    }
  }

  async function finish() {
    if (!name.trim()) return;
    setShowFinishReveal(true);

    // Small delay so the user sees the reveal
    await new Promise((r) => setTimeout(r, 1800));

    const ageGroup = age ? getAgeGroup(age) : undefined;
    const profile = await createProfile(name.trim(), avatar, age ?? undefined, ageGroup, interests.length > 0 ? interests : undefined, avatarPhoto);

    // Save onboarding state
    if (profile.id) {
      await updateProfile(profile.id, { onboardingCompleted: true });
      await db.onboardingState.add({
        playerId: profile.id,
        currentStep: steps.length,
        childName: name.trim(),
        childAge: age ?? undefined,
        selectedInterests: interests,
        learningGoals: goals,
        dailyRoutine: routine,
        completedAt: new Date(),
      });
    }

    setCurrentPlayer(profile);
    navigate('/menu');
  }

  /* ── Premium Progress Indicator ─── */
  function ProgressIndicator() {
    const activeSteps = steps.slice(1); // exclude welcome
    return (
      <motion.div
        className="w-full max-w-sm mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex gap-2 items-center">
          {activeSteps.map((s, i) => {
            const actualIndex = i + 1; // offset since we skip welcome
            const isCompleted = actualIndex < stepIndex;
            const isCurrent = actualIndex === stepIndex;
            return (
              <div key={s} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full relative">
                  <div
                    className={`w-full rounded-full transition-all duration-500 ${
                      isCurrent ? 'h-[6px]' : 'h-[5px]'
                    }`}
                    style={{
                      background: isCompleted
                        ? 'linear-gradient(90deg, #FF6B6B, #FF8E8E)'
                        : isCurrent
                        ? '#FF6B6B'
                        : '#F0EAE0',
                      boxShadow: isCurrent ? '0 0 8px rgba(255,107,107,0.4)' : 'none',
                    }}
                  />
                </div>
                <span
                  className={`text-[10px] font-bold transition-colors duration-300 ${
                    isCurrent
                      ? 'text-[#FF6B6B]'
                      : isCompleted
                      ? 'text-[#6B6B7B]'
                      : 'text-[#9B9BAB]'
                  }`}
                >
                  {stepLabels[s]}
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-[11px] text-[#9B9BAB] mt-3 text-center font-semibold">
          Step {stepIndex} of {steps.length - 1}
        </p>
      </motion.div>
    );
  }

  /* ── Back button component ─── */
  function BackButton({ onClick }: { onClick: () => void }) {
    return (
      <motion.button
        className="flex-1 bg-white border border-[#F0EAE0] text-[#6B6B7B] rounded-[16px] py-3.5 font-bold cursor-pointer shadow-[0_2px_8px_rgba(45,45,58,0.04)] hover:bg-[#FFF8F0] transition-colors"
        onClick={onClick}
        whileTap={{ scale: 0.95 }}
      >
        Back
      </motion.button>
    );
  }

  /* ── Next/CTA button component ─── */
  function NextButton({
    onClick,
    disabled,
    children,
  }: {
    onClick: () => void;
    disabled?: boolean;
    children: React.ReactNode;
  }) {
    return (
      <motion.button
        className="flex-1 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] text-white rounded-[16px] py-3.5 font-bold text-[15px] shadow-[0_4px_20px_rgba(255,107,107,0.25)] cursor-pointer disabled:opacity-40 disabled:shadow-none transition-shadow hover:shadow-[0_6px_28px_rgba(255,107,107,0.35)]"
        onClick={onClick}
        disabled={disabled}
        whileTap={{ scale: 0.95 }}
      >
        {children}
      </motion.button>
    );
  }

  /* ── Finish reveal screen ─── */
  if (showFinishReveal) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #FFF8F0 0%, #FFF0F0 40%, #EDFAF8 100%)' }}
      >
        <SparklesBurst />
        <motion.div
          className="text-center space-y-6 z-10 relative"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 15, stiffness: 200 }}
        >
          <motion.div
            className="text-7xl"
            animate={{ rotate: [0, -5, 5, -3, 3, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            🎉
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h1 className="text-[28px] font-extrabold text-[#2D2D3A] leading-tight">
              Your First Adventure!
            </h1>
            <p className="text-[#6B6B7B] mt-2 text-[15px]">
              Get ready, {name}!
            </p>
          </motion.div>
          <motion.div
            className="bg-white rounded-[24px] p-6 shadow-[0_8px_32px_rgba(45,45,58,0.10)] border border-[#F0EAE0] max-w-xs mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="text-5xl mb-3">{avatar}</div>
            <p className="font-extrabold text-[#2D2D3A] text-lg">{name}'s Learning World</p>
            <p className="text-[#9B9BAB] text-sm mt-1">A magical journey is about to begin</p>
            <div className="flex justify-center gap-2 mt-3">
              {interests.slice(0, 3).map((key) => {
                const opt = interestOptions.find((o) => o.key === key);
                return opt ? (
                  <span key={key} className="text-lg">{opt.emoji}</span>
                ) : null;
              })}
            </div>
          </motion.div>
          <motion.div
            className="flex items-center justify-center gap-2 text-[#FF6B6B] font-bold text-[15px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.5, 1] }}
            transition={{ delay: 1, duration: 1.5 }}
          >
            <span>Starting your adventure</span>
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              ...
            </motion.span>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #FFF8F0 0%, #FFF0F0 40%, #EDFAF8 100%)' }}
    >
      {/* Floating decorative elements */}
      <FloatingDecor />

      {/* Progress indicator */}
      {step !== 'welcome' && <ProgressIndicator />}

      {/* Welcome back toast for interrupted onboarding */}
      <AnimatePresence>
        {isReturning && step !== 'welcome' && (
          <motion.div
            className="absolute top-6 left-1/2 z-20 bg-white rounded-full px-5 py-2.5 shadow-[0_4px_20px_rgba(45,45,58,0.10)] border border-[#F0EAE0] flex items-center gap-2"
            style={{ x: '-50%' }}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          >
            <span className="text-base">👋</span>
            <span className="text-sm font-bold text-[#2D2D3A]">Welcome back!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait" custom={direction}>
        {/* ══════ WELCOME SCREEN ══════ */}
        {step === 'welcome' && (
          <motion.div
            key="welcome"
            className="text-center space-y-8 z-10 relative max-w-sm w-full"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            {/* Large mascot with gentle bounce */}
            <motion.div
              className="relative mx-auto w-32 h-32 flex items-center justify-center"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div
                className="absolute inset-0 rounded-full opacity-20"
                style={{
                  background: 'radial-gradient(circle, #FF6B6B 0%, transparent 70%)',
                }}
              />
              <span className="text-8xl relative z-10 drop-shadow-sm">🦁</span>
            </motion.div>

            {/* App name with gradient text */}
            <div className="space-y-3">
              <h1
                className="text-[32px] font-extrabold leading-tight"
                style={{
                  background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8C42 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Kids Learning Fun
              </h1>
              <p className="text-[#6B6B7B] max-w-[280px] mx-auto leading-relaxed text-[15px]">
                A magical world of learning awaits!
              </p>
            </div>

            {/* Subtitle for parents */}
            <p className="text-[#9B9BAB] text-[13px] max-w-[260px] mx-auto">
              Let's set up a personalized learning experience for your child in just a few steps.
            </p>

            {/* CTA button with glow */}
            <motion.button
              className="bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] text-white rounded-[16px] px-12 py-4 font-bold text-lg shadow-[0_4px_20px_rgba(255,107,107,0.3)] cursor-pointer animate-pulse-glow"
              onClick={next}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Let's Begin!
            </motion.button>
          </motion.div>
        )}

        {/* ══════ NAME ENTRY ══════ */}
        {step === 'name' && (
          <motion.div
            key="name"
            className="w-full max-w-sm z-10 relative"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            {/* Premium card container */}
            <div className="bg-white rounded-[24px] shadow-[0_4px_24px_rgba(45,45,58,0.08)] border border-[#F0EAE0] p-6 space-y-5">
              {/* Mascot speech bubble */}
              <div className="flex items-start gap-3 mb-2">
                <motion.div
                  className="text-4xl flex-shrink-0"
                  animate={{ rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  🦁
                </motion.div>
                <div className="bg-[#FFF8F0] rounded-[16px] rounded-tl-[4px] px-4 py-2.5 border border-[#F0EAE0]">
                  <p className="text-[14px] font-bold text-[#2D2D3A]">What's your name?</p>
                </div>
              </div>

              <h2 className="text-2xl font-extrabold text-center text-[#2D2D3A]">Who's playing?</h2>

              <AvatarPicker selected={avatar} onSelect={setAvatar} photo={avatarPhoto} onPhotoChange={setAvatarPhoto} />

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Child's name..."
                maxLength={20}
                className="w-full bg-[#FAFAF8] rounded-[16px] px-5 py-4 text-lg text-center shadow-[0_2px_8px_rgba(45,45,58,0.04)] border border-[#F0EAE0] outline-none focus:ring-4 focus:ring-[#FF6B6B]/20 focus:border-[#FF6B6B] focus:bg-white transition-all font-bold text-[#2D2D3A] placeholder:text-[#C4C4D0] placeholder:font-medium"
                autoFocus
              />
            </div>

            <div className="flex gap-3 mt-5">
              <BackButton onClick={back} />
              <NextButton onClick={next} disabled={!name.trim()}>Next</NextButton>
            </div>
          </motion.div>
        )}

        {/* ══════ AGE SELECTION ══════ */}
        {step === 'age' && (
          <motion.div
            key="age"
            className="w-full max-w-sm space-y-6 z-10 relative"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-extrabold text-[#2D2D3A]">
                How old is {name}?
              </h2>
              <p className="text-[#9B9BAB] text-sm">Tap to select age</p>
            </div>

            {/* 2-column grid of premium age cards */}
            <div className="grid grid-cols-2 gap-3">
              {ageOptions.map((a, i) => {
                const card = ageCardData[a];
                const isSelected = age === a;
                return (
                  <motion.button
                    key={a}
                    className={`relative min-h-[80px] rounded-[20px] flex flex-col items-center justify-center gap-1 cursor-pointer transition-all border-2 ${
                      isSelected
                        ? 'border-transparent text-white'
                        : 'bg-white border-[#F0EAE0] text-[#2D2D3A]'
                    }`}
                    style={{
                      ...(isSelected
                        ? {
                            background: `linear-gradient(135deg, ${card.gradient.replace('from-[', '').replace('] to-[', ', ').replace(']', '')})`.replace('linear-gradient(135deg, ', ''),
                            boxShadow: `0 4px 20px ${card.shadow}`,
                            transform: 'scale(1.02)',
                          }
                        : {}),
                      ...(isSelected
                        ? { backgroundImage: `linear-gradient(135deg, var(--tw-gradient-from), var(--tw-gradient-to))` }
                        : {}),
                    }}
                    onClick={() => setAge(a)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, type: 'spring', damping: 20, stiffness: 300 }}
                    whileHover={{ scale: isSelected ? 1.02 : 1.04 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {/* Use gradient background class for selected state */}
                    {isSelected && (
                      <div
                        className={`absolute inset-0 rounded-[20px] bg-gradient-to-br ${card.gradient}`}
                        style={{ boxShadow: `0 4px 20px ${card.shadow}` }}
                      />
                    )}
                    <span className="text-2xl relative z-10">{card.emoji}</span>
                    <span className="text-[15px] font-extrabold relative z-10">{card.label}</span>
                    {isSelected && (
                      <motion.div
                        className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md z-10"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', damping: 12, stiffness: 300 }}
                      >
                        <span className="text-xs">✓</span>
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            <div className="flex gap-3">
              <BackButton onClick={back} />
              <NextButton onClick={next}>
                {age ? 'Next' : 'Skip'}
              </NextButton>
            </div>
          </motion.div>
        )}

        {/* ══════ INTERESTS ══════ */}
        {step === 'interests' && (
          <motion.div
            key="interests"
            className="w-full max-w-sm space-y-5 z-10 relative"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-extrabold text-[#2D2D3A]">
                What does {name} love? ✨
              </h2>
              <p className="text-[#9B9BAB] text-sm font-semibold">Pick up to 4 favorites</p>
            </div>

            <div className="flex flex-wrap justify-center gap-2.5">
              {interestOptions.map((opt, i) => {
                const isSelected = interests.includes(opt.key);
                const colors = interestColors[opt.key];
                return (
                  <motion.button
                    key={opt.key}
                    className={`px-4 py-3 rounded-[14px] flex items-center gap-2.5 font-bold text-[14px] cursor-pointer transition-all border-2 ${
                      isSelected
                        ? `bg-gradient-to-r ${colors.gradient} text-white border-transparent`
                        : `${colors.soft} text-[#2D2D3A] border-[#F0EAE0] hover:border-[#E8E0D4]`
                    }`}
                    style={isSelected ? { boxShadow: `0 4px 16px ${colors.shadow}` } : {}}
                    onClick={() => toggleItem(opt.key, interests, setInterests)}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04, type: 'spring', damping: 20, stiffness: 300 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.92 }}
                  >
                    <span className="text-lg">{opt.emoji}</span>
                    {opt.label}
                    {isSelected && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-white/80 text-xs ml-0.5"
                      >
                        ✓
                      </motion.span>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {interests.length > 0 && (
              <motion.p
                className="text-center text-[#FF6B6B] text-[13px] font-bold"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {interests.length} of 4 selected
              </motion.p>
            )}

            <div className="flex gap-3">
              <BackButton onClick={back} />
              <NextButton onClick={next}>
                {interests.length > 0 ? 'Next' : 'Skip'}
              </NextButton>
            </div>
          </motion.div>
        )}

        {/* ══════ GOALS ══════ */}
        {step === 'goals' && (
          <motion.div
            key="goals"
            className="w-full max-w-sm space-y-5 z-10 relative"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-extrabold text-[#2D2D3A]">Learning Goals</h2>
              <p className="text-[#9B9BAB] text-sm font-semibold">What would you like {name} to focus on?</p>
            </div>

            <div className="flex flex-wrap justify-center gap-2.5">
              {goalOptions.map((opt, i) => {
                const isSelected = goals.includes(opt.key);
                return (
                  <motion.button
                    key={opt.key}
                    className={`px-4 py-3 rounded-[14px] flex items-center gap-2.5 font-bold text-[14px] cursor-pointer transition-all border-2 ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#4ECDC4] to-[#6FE0D9] text-white border-transparent shadow-[0_4px_16px_rgba(78,205,196,0.25)]'
                        : 'bg-[#EDFAF8] text-[#2D2D3A] border-[#F0EAE0] hover:border-[#4ECDC4]/30'
                    }`}
                    onClick={() => toggleItem(opt.key, goals, setGoals, 3)}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04, type: 'spring', damping: 20, stiffness: 300 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.92 }}
                  >
                    <span className="text-lg">{opt.emoji}</span>
                    {opt.label}
                    {isSelected && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-white/80 text-xs ml-0.5"
                      >
                        ✓
                      </motion.span>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {goals.length > 0 && (
              <motion.p
                className="text-center text-[#4ECDC4] text-[13px] font-bold"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {goals.length} of 3 selected
              </motion.p>
            )}

            <div className="flex gap-3">
              <BackButton onClick={back} />
              <NextButton onClick={next}>
                {goals.length > 0 ? 'Next' : 'Skip'}
              </NextButton>
            </div>
          </motion.div>
        )}

        {/* ══════ ROUTINE ══════ */}
        {step === 'routine' && (
          <motion.div
            key="routine"
            className="w-full max-w-sm space-y-5 z-10 relative"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-extrabold text-[#2D2D3A]">Daily Routine</h2>
              <p className="text-[#9B9BAB] text-sm font-semibold">When does {name} usually play?</p>
            </div>

            <div className="space-y-3">
              {routineOptions.map((opt, i) => {
                const isSelected = routine === opt.key;
                return (
                  <motion.button
                    key={opt.key}
                    className={`w-full p-4 rounded-[20px] flex items-center gap-4 cursor-pointer text-left transition-all border-2 ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] text-white border-transparent shadow-[0_4px_20px_rgba(255,107,107,0.25)]'
                        : 'bg-white text-[#2D2D3A] border-[#F0EAE0] shadow-[0_2px_8px_rgba(45,45,58,0.04)] hover:border-[#FF6B6B]/20 hover:shadow-[0_4px_16px_rgba(45,45,58,0.08)]'
                    }`}
                    onClick={() => setRoutine(opt.key)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06, type: 'spring', damping: 20, stiffness: 300 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div
                      className={`w-12 h-12 rounded-[14px] flex items-center justify-center text-2xl flex-shrink-0 ${
                        isSelected ? 'bg-white/20' : 'bg-[#FFF8F0]'
                      }`}
                    >
                      {opt.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[15px]">{opt.label}</p>
                      <p className={`text-[13px] ${isSelected ? 'text-white/70' : 'text-[#9B9BAB]'}`}>
                        {opt.desc}
                      </p>
                    </div>
                    {isSelected && (
                      <motion.div
                        className="w-6 h-6 bg-white/25 rounded-full flex items-center justify-center flex-shrink-0"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', damping: 12, stiffness: 300 }}
                      >
                        <span className="text-xs text-white font-bold">✓</span>
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            <div className="flex gap-3">
              <BackButton onClick={back} />
              <motion.button
                className="flex-1 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] text-white rounded-[16px] py-3.5 font-bold text-[15px] shadow-[0_4px_20px_rgba(255,107,107,0.25)] cursor-pointer transition-shadow hover:shadow-[0_6px_28px_rgba(255,107,107,0.35)]"
                onClick={finish}
                whileTap={{ scale: 0.95 }}
              >
                Start Learning! ✨
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
