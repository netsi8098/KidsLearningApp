import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useProfiles } from '../hooks/useProfile';
import AvatarPicker from '../components/AvatarPicker';
import AvatarFrame from '../components/AvatarFrame';
import AnimatedBackground from '../components/svg/AnimatedBackground';
import MascotLion from '../components/svg/MascotLion';

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  return `${Math.floor(days / 7)}w ago`;
}

type CreateStep = 'name-avatar' | 'age' | 'interests';

const ageOptions = [2, 3, 4, 5, 6, 7, 8] as const;

function getAgeGroup(age: number): '2-3' | '4-5' | '6-8' {
  if (age <= 3) return '2-3';
  if (age <= 5) return '4-5';
  return '6-8';
}

function getAgeLabel(age: number): string {
  if (age <= 3) return 'Little Learner';
  if (age <= 5) return 'Explorer';
  return 'Super Student';
}

const interestOptions = [
  { key: 'letters', label: 'Letters', color: '#FF6B6B' },
  { key: 'numbers', label: 'Numbers', color: '#4ECDC4' },
  { key: 'colors', label: 'Colors', color: '#FFE66D' },
  { key: 'shapes', label: 'Shapes', color: '#A78BFA' },
  { key: 'animals', label: 'Animals', color: '#6BCB77' },
  { key: 'music', label: 'Music', color: '#FF8FAB' },
  { key: 'stories', label: 'Stories', color: '#45B7D1' },
  { key: 'games', label: 'Games', color: '#FF8C42' },
] as const;

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

const ageColorMap: Record<number, string> = {
  2: '#FF8FAB', 3: '#FF6B6B', 4: '#FF8C42', 5: '#FFE66D',
  6: '#4ECDC4', 7: '#45B7D1', 8: '#A78BFA',
};

const profileAccentColors = [
  '#FF6B6B', '#4ECDC4', '#A78BFA', '#FF8C42',
  '#6BCB77', '#FFD93D', '#74B9FF', '#FD79A8',
];

function getAccentColor(index: number): string {
  return profileAccentColors[index % profileAccentColors.length];
}

function getLastPlayedId(profiles: { id?: number; lastPlayedAt: Date }[]): number | undefined {
  if (profiles.length === 0) return undefined;
  let latest = profiles[0];
  for (const p of profiles) {
    if (new Date(p.lastPlayedAt).getTime() > new Date(latest.lastPlayedAt).getTime()) latest = p;
  }
  return latest.id;
}

/* Small SVG icons */
function StarIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M8 1L10 6L15 6.5L11.5 10L12.5 15L8 12.5L3.5 15L4.5 10L1 6.5L6 6Z" fill="#FFD93D" stroke="#F59E0B" strokeWidth="0.8" />
    </svg>
  );
}

function FlameIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M8 1C8 1 12 5 12 9C12 11.8 10.2 14 8 14C5.8 14 4 11.8 4 9C4 7 5 5 6 4C6 6 7 7 8 6C8 4 8 1 8 1Z" fill="#FF6B6B" stroke="#EF4444" strokeWidth="0.8" />
      <path d="M8 8C8 8 10 10 10 11.5C10 12.6 9.1 13.5 8 13.5C6.9 13.5 6 12.6 6 11.5C6 10 8 8 8 8Z" fill="#FFE66D" />
    </svg>
  );
}

function ShieldLockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M9 1L15 4V8.5C15 12.5 12.5 15.5 9 17C5.5 15.5 3 12.5 3 8.5V4L9 1Z" stroke="#9B9BAB" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <rect x="6.5" y="8" width="5" height="4" rx="1" stroke="#9B9BAB" strokeWidth="1.2" fill="none" />
      <path d="M7.5 8V6.5C7.5 5.7 8.2 5 9 5C9.8 5 10.5 5.7 10.5 6.5V8" stroke="#9B9BAB" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

/* Title with letter-by-letter animation */
function AnimatedTitle() {
  const text = 'Kids Learning Fun!';
  return (
    <h1 className="text-center" style={{ fontSize: 'clamp(2.2rem, 8vw, 3.2rem)', lineHeight: 1.1 }}>
      {text.split('').map((char, i) => (
        <span
          key={i}
          className="font-display text-bubbly text-rainbow animate-letter-bounce inline-block"
          style={{ animationDelay: `${i * 0.04}s`, display: char === ' ' ? 'inline' : 'inline-block' }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </h1>
  );
}

export default function WelcomePage() {
  const navigate = useNavigate();
  const { setCurrentPlayer } = useApp();
  const { profiles, createProfile, updateLastPlayed } = useProfiles();
  const [showCreate, setShowCreate] = useState(false);
  const [createStep, setCreateStep] = useState<CreateStep>('name-avatar');
  const [direction, setDirection] = useState(1);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('\u{1F98A}');
  const [avatarPhoto, setAvatarPhoto] = useState<string | undefined>(undefined);
  const [selectedAge, setSelectedAge] = useState<number | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);

  const lastPlayedId = getLastPlayedId(profiles);
  const isLoading = profiles === undefined;

  async function handleSelectProfile(profile: typeof profiles[number]) {
    setSelectedProfileId(profile.id ?? null);
    setTimeout(async () => {
      setCurrentPlayer(profile);
      await updateLastPlayed(profile.id!);
      navigate('/menu');
    }, 400);
  }

  function goToStep(step: CreateStep) {
    const stepOrder: CreateStep[] = ['name-avatar', 'age', 'interests'];
    const currentIndex = stepOrder.indexOf(createStep);
    const nextIndex = stepOrder.indexOf(step);
    setDirection(nextIndex > currentIndex ? 1 : -1);
    setCreateStep(step);
  }

  async function handleFinishCreate() {
    if (!name.trim()) return;
    const age = selectedAge ?? undefined;
    const ageGroup = selectedAge ? getAgeGroup(selectedAge) : undefined;
    const interests = selectedInterests.length > 0 ? selectedInterests : undefined;
    const profile = await createProfile(name.trim(), avatar, age, ageGroup, interests, avatarPhoto);
    setCurrentPlayer(profile);
    navigate('/menu');
  }

  function handleToggleInterest(key: string) {
    setSelectedInterests((prev) => {
      if (prev.includes(key)) return prev.filter((i) => i !== key);
      if (prev.length >= 4) return prev;
      return [...prev, key];
    });
  }

  function resetCreateFlow() {
    setShowCreate(false);
    setCreateStep('name-avatar');
    setDirection(1);
    setName('');
    setAvatar('\u{1F98A}');
    setAvatarPhoto(undefined);
    setSelectedAge(null);
    setSelectedInterests([]);
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-6 md:p-10 relative page-with-bg overflow-hidden">
      {/* Immersive animated background */}
      <AnimatedBackground theme="home" />

      {/* Parent access — shield/lock icon */}
      <motion.button
        className="fixed top-4 right-4 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-full cursor-pointer glass"
        onClick={() => navigate('/parent-dashboard')}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <ShieldLockIcon />
        <span className="text-xs font-semibold text-[#9B9BAB]">Parent</span>
      </motion.button>

      {/* Mascot + Speech Bubble */}
      <motion.div
        className="relative z-10 flex flex-col items-center mb-2"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <MascotLion size={160} expression="waving" animated />

        {/* Speech bubble */}
        <motion.div
          className="relative rounded-2xl px-6 py-3 mt-2 mb-3 glass"
          style={{ boxShadow: '0 4px 20px rgba(45,45,58,0.08)' }}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 20 }}
        >
          <div
            className="absolute top-[-7px] left-1/2 -translate-x-1/2 w-0 h-0"
            style={{
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderBottom: '8px solid rgba(255,255,255,0.75)',
            }}
          />
          <p className="font-display text-lg text-[#2D2D3A] text-center">Who&apos;s playing today?</p>
        </motion.div>
      </motion.div>

      {/* Animated Title */}
      <motion.div
        className="relative z-10 mb-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <AnimatedTitle />
      </motion.div>
      <motion.p
        className="relative z-10 text-sm font-bold text-[#6B6B7B] mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Choose a player to start
      </motion.p>

      <AnimatePresence mode="wait">
        {!showCreate ? (
          <motion.div
            key="profiles"
            className="relative z-10 w-full max-w-sm md:max-w-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {isLoading ? (
              <div className="space-y-3">
                {[0, 1].map(i => (
                  <div key={i} className="w-full rounded-3xl p-5 bg-white/60 backdrop-blur-sm animate-shimmer h-24" />
                ))}
              </div>
            ) : profiles.length === 0 ? (
              /* Empty State */
              <motion.div className="text-center py-8" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <MascotLion size={120} expression="excited" animated className="mx-auto mb-4" />
                <p className="font-display text-2xl text-[#2D2D3A] mb-1">Let&apos;s get started!</p>
                <p className="text-sm text-[#9B9BAB] mb-6">Create your first player profile</p>
                <motion.button
                  className="mx-auto px-8 py-4 rounded-2xl font-display text-lg text-white cursor-pointer animate-glow-pulse"
                  style={{ background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8C42 100%)' }}
                  onClick={() => setShowCreate(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  + Create Player
                </motion.button>
              </motion.div>
            ) : (
              /* Profile Cards */
              <div className="space-y-3 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 md:space-y-0">
                {profiles.map((profile, i) => {
                  const accent = getAccentColor(i);
                  const isLastPlayed = profile.id === lastPlayedId && profiles.length > 1;
                  const isSelected = profile.id === selectedProfileId;

                  return (
                    <motion.button
                      key={profile.id}
                      className={`relative w-full rounded-3xl p-4 flex items-center gap-4 cursor-pointer transition-all tap-bounce ${isSelected ? 'animate-pop' : ''}`}
                      style={{
                        background: 'rgba(255,255,255,0.85)',
                        backdropFilter: 'blur(12px)',
                        borderLeft: `4px solid ${accent}`,
                        boxShadow: isLastPlayed
                          ? `0 4px 24px rgba(45,45,58,0.1), 0 0 0 2px ${accent}30`
                          : '0 2px 12px rgba(45,45,58,0.06)',
                      }}
                      onClick={() => handleSelectProfile(profile)}
                      initial={{ x: -40, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.1, type: 'spring', stiffness: 300, damping: 25 }}
                      whileHover={{ scale: 1.02, boxShadow: `0 8px 28px rgba(45,45,58,0.12)` }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {/* Avatar with colored ring */}
                      <div
                        className="flex-shrink-0 w-[72px] h-[72px] rounded-full flex items-center justify-center overflow-hidden"
                        style={{ border: `3px solid ${accent}`, background: `${accent}15` }}
                      >
                        <AvatarFrame
                          emoji={profile.avatarEmoji}
                          photo={profile.avatarPhoto}
                          size="md"
                        />
                      </div>

                      {/* Profile info */}
                      <div className="text-left flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-display text-lg text-[#2D2D3A]" style={{ wordBreak: 'break-word' }}>{profile.name}</p>
                          {profile.age && (
                            <span
                              className="flex-shrink-0 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white"
                              style={{ backgroundColor: accent }}
                            >
                              Age {profile.age}
                            </span>
                          )}
                        </div>

                        {/* Stars + Streak */}
                        <div className="flex items-center gap-3 mb-1.5">
                          <span className="flex items-center gap-1 text-sm font-bold text-amber-600">
                            <StarIcon size={14} />
                            {profile.totalStars}
                          </span>
                          {profile.streakDays > 0 && (
                            <span className="flex items-center gap-1 text-sm font-bold text-orange-500">
                              <FlameIcon size={14} />
                              {profile.streakDays}d
                            </span>
                          )}
                        </div>

                        {/* Last played */}
                        {profile.lastPlayedAt && (
                          <p className="text-[11px] text-[#9B9BAB]">{timeAgo(new Date(profile.lastPlayedAt))}</p>
                        )}
                      </div>

                      {/* Play indicator */}
                      {isLastPlayed && (
                        <div className="absolute top-2 right-3">
                          <span className="text-[10px] font-bold text-white uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ backgroundColor: accent }}>
                            Recent
                          </span>
                        </div>
                      )}
                    </motion.button>
                  );
                })}

                {/* Add Player Card */}
                <motion.button
                  className="w-full rounded-3xl p-5 font-display text-lg cursor-pointer border-2 border-dashed flex flex-col items-center justify-center gap-2 min-h-[100px] transition-all"
                  style={{
                    borderColor: '#4ECDC480',
                    color: '#4ECDC4',
                    background: 'rgba(78, 205, 196, 0.05)',
                  }}
                  onClick={() => setShowCreate(true)}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: profiles.length * 0.1 }}
                  whileHover={{ scale: 1.02, background: 'rgba(78, 205, 196, 0.1)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="w-12 h-12 rounded-full bg-teal/10 flex items-center justify-center text-2xl animate-float-gentle">+</span>
                  New Player
                </motion.button>
              </div>
            )}
          </motion.div>
        ) : (
          /* Create Flow */
          <motion.div
            key="create"
            className="relative z-10 w-full max-w-sm md:max-w-md rounded-3xl p-6 overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 16px 48px rgba(45,45,58,0.12)',
              border: '1px solid rgba(255,255,255,0.3)',
            }}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <AnimatePresence mode="wait" custom={direction}>
              {/* Step 1: Name & Avatar */}
              {createStep === 'name-avatar' && (
                <motion.div key="step-name" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="space-y-5">
                  <div>
                    <p className="font-display text-xl mb-3 text-center text-[#2D2D3A]">Pick your avatar</p>
                    <AvatarPicker selected={avatar} onSelect={setAvatar} photo={avatarPhoto} onPhotoChange={setAvatarPhoto} />
                  </div>
                  <div>
                    <p className="font-display text-xl mb-2 text-center text-[#2D2D3A]">What&apos;s your name?</p>
                    <input
                      type="text" value={name} onChange={(e) => setName(e.target.value)}
                      placeholder="Enter name..." maxLength={20} autoFocus
                      className="w-full bg-white rounded-2xl px-4 py-3.5 text-lg text-center shadow-sm border border-[#F0EAE0] outline-none focus:ring-4 focus:ring-coral/20 focus:border-coral/30 transition-all font-bold"
                    />
                  </div>
                  <div className="flex gap-3">
                    <motion.button className="flex-1 bg-white rounded-2xl py-3 font-bold cursor-pointer text-[#6B6B7B] shadow-sm border border-[#F0EAE0]" onClick={resetCreateFlow} whileTap={{ scale: 0.95 }}>Back</motion.button>
                    <motion.button className="flex-1 bg-gradient-to-r from-coral to-[#FF8E8E] text-white rounded-2xl py-3 font-bold shadow-lg cursor-pointer disabled:opacity-40" onClick={() => goToStep('age')} disabled={!name.trim()} whileTap={{ scale: 0.95 }}>Next</motion.button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Age */}
              {createStep === 'age' && (
                <motion.div key="step-age" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="space-y-5">
                  <div>
                    <p className="font-display text-xl mb-1 text-center text-[#2D2D3A]">How old are you?</p>
                    {selectedAge && (
                      <motion.p className="text-center text-[#6B6B7B] text-sm font-bold" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        {getAgeLabel(selectedAge)}
                      </motion.p>
                    )}
                  </div>
                  <div className="flex flex-wrap justify-center gap-3">
                    {ageOptions.map((age, i) => (
                      <motion.button
                        key={age}
                        className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-display text-white cursor-pointer shadow-lg transition-all tap-bounce ${
                          selectedAge === age ? 'ring-4 ring-offset-2 ring-coral/50 scale-110' : 'opacity-80'
                        }`}
                        style={{ backgroundColor: ageColorMap[age] }}
                        onClick={() => setSelectedAge(age)}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', delay: i * 0.05 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {age}
                      </motion.button>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <motion.button className="flex-1 bg-white rounded-2xl py-3 font-bold cursor-pointer text-[#6B6B7B] shadow-sm border border-[#F0EAE0]" onClick={() => goToStep('name-avatar')} whileTap={{ scale: 0.95 }}>Back</motion.button>
                    <motion.button className="flex-1 bg-white/60 text-[#9B9BAB] rounded-2xl py-3 font-bold cursor-pointer border border-[#F0EAE0]" onClick={() => { setSelectedAge(null); goToStep('interests'); }} whileTap={{ scale: 0.95 }}>Skip</motion.button>
                    <motion.button className="flex-1 bg-gradient-to-r from-coral to-[#FF8E8E] text-white rounded-2xl py-3 font-bold shadow-lg cursor-pointer disabled:opacity-40" onClick={() => goToStep('interests')} disabled={!selectedAge} whileTap={{ scale: 0.95 }}>Next</motion.button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Interests */}
              {createStep === 'interests' && (
                <motion.div key="step-interests" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="space-y-5">
                  <div>
                    <p className="font-display text-xl mb-1 text-center text-[#2D2D3A]">What do you like?</p>
                    <p className="text-center text-[#9B9BAB] text-sm font-bold">Pick 1-4 things you enjoy</p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2.5">
                    {interestOptions.map((interest, i) => {
                      const isActive = selectedInterests.includes(interest.key);
                      return (
                        <motion.button
                          key={interest.key}
                          className="px-4 py-2.5 rounded-full flex items-center gap-2 font-bold text-sm cursor-pointer shadow-sm border-2 transition-all tap-bounce"
                          style={{
                            backgroundColor: isActive ? interest.color : 'white',
                            color: isActive ? 'white' : '#2D2D3A',
                            borderColor: isActive ? interest.color : '#F0EAE0',
                          }}
                          onClick={() => handleToggleInterest(interest.key)}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', delay: i * 0.04 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {interest.label}
                        </motion.button>
                      );
                    })}
                  </div>
                  <div className="flex gap-3">
                    <motion.button className="flex-1 bg-white rounded-2xl py-3 font-bold cursor-pointer text-[#6B6B7B] shadow-sm border border-[#F0EAE0]" onClick={() => goToStep('age')} whileTap={{ scale: 0.95 }}>Back</motion.button>
                    <motion.button className="flex-1 bg-white/60 text-[#9B9BAB] rounded-2xl py-3 font-bold cursor-pointer border border-[#F0EAE0]" onClick={handleFinishCreate} whileTap={{ scale: 0.95 }}>Skip</motion.button>
                    <motion.button
                      className="flex-1 text-white rounded-2xl py-3 font-display text-base shadow-lg cursor-pointer disabled:opacity-40 animate-glow-pulse"
                      style={{ background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8C42 100%)' }}
                      onClick={handleFinishCreate}
                      disabled={selectedInterests.length === 0}
                      whileTap={{ scale: 0.95 }}
                    >
                      Let&apos;s Go!
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
