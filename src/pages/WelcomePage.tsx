import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useProfiles } from '../hooks/useProfile';
import AvatarPicker from '../components/AvatarPicker';
import AvatarFrame from '../components/AvatarFrame';
import FloatingShapes from '../components/FloatingShapes';
import SparkleEffect from '../components/SparkleEffect';

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
  if (age <= 3) return 'Little Learner \u{1F331}';
  if (age <= 5) return 'Explorer \u{1F50D}';
  return 'Super Student \u{1F31F}';
}

const interestOptions = [
  { key: 'letters', label: 'Letters', emoji: '\u{1F524}' },
  { key: 'numbers', label: 'Numbers', emoji: '\u{1F522}' },
  { key: 'colors', label: 'Colors', emoji: '\u{1F3A8}' },
  { key: 'shapes', label: 'Shapes', emoji: '\u{1F537}' },
  { key: 'animals', label: 'Animals', emoji: '\u{1F43E}' },
  { key: 'music', label: 'Music', emoji: '\u{1F3B5}' },
  { key: 'stories', label: 'Stories', emoji: '\u{1F4D6}' },
  { key: 'games', label: 'Games', emoji: '\u{1F3AE}' },
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

const ageColors: Record<number, string> = {
  2: 'bg-pink-400',
  3: 'bg-rose-400',
  4: 'bg-amber-400',
  5: 'bg-orange-400',
  6: 'bg-sky-400',
  7: 'bg-blue-400',
  8: 'bg-indigo-400',
};

/* Accent color per profile index for visual variety */
const profileAccentColors = [
  '#FF6B6B', // coral
  '#4ECDC4', // teal
  '#A78BFA', // grape
  '#FF8C42', // tangerine
  '#6BCB77', // leaf
  '#FFD93D', // gold
  '#74B9FF', // sky
  '#FD79A8', // pink
];

function getAccentColor(index: number): string {
  return profileAccentColors[index % profileAccentColors.length];
}

/* Determine which profile was played most recently */
function getLastPlayedId(profiles: { id?: number; lastPlayedAt: Date }[]): number | undefined {
  if (profiles.length === 0) return undefined;
  let latest = profiles[0];
  for (const p of profiles) {
    if (new Date(p.lastPlayedAt).getTime() > new Date(latest.lastPlayedAt).getTime()) {
      latest = p;
    }
  }
  return latest.id;
}

/* Profile card shimmer skeleton for loading state */
function ProfileCardSkeleton() {
  return (
    <div
      className="w-full rounded-[20px] p-5 flex items-center gap-4 border border-[#E8E0D4]/40"
      style={{ backgroundColor: '#FFFBF6' }}
    >
      <div className="relative overflow-hidden w-20 h-20 rounded-full" style={{ backgroundColor: '#F0EAE0' }}>
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)',
            animation: 'shimmer 1.8s ease-in-out infinite',
          }}
        />
      </div>
      <div className="flex-1 space-y-2.5">
        <div className="relative overflow-hidden h-4 w-2/3 rounded-lg" style={{ backgroundColor: '#F0EAE0' }}>
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)',
              animation: 'shimmer 1.8s ease-in-out infinite',
            }}
          />
        </div>
        <div className="relative overflow-hidden h-3 w-1/2 rounded-lg" style={{ backgroundColor: '#F0EAE0' }}>
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)',
              animation: 'shimmer 1.8s ease-in-out infinite',
            }}
          />
        </div>
        <div className="relative overflow-hidden h-2 w-full rounded-full" style={{ backgroundColor: '#F0EAE0' }}>
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)',
              animation: 'shimmer 1.8s ease-in-out infinite',
            }}
          />
        </div>
      </div>
    </div>
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
    // Small delay for sparkle animation before navigating
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
      if (prev.includes(key)) {
        return prev.filter((i) => i !== key);
      }
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
    <div
      className="min-h-dvh flex flex-col items-center justify-center p-6 md:p-10 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #FFF8F0 0%, #FFF0F0 50%, #EDFAF8 100%)' }}
    >
      {/* ── Background World Scene ── */}
      <FloatingShapes count={10} className="absolute inset-0 h-full" />

      {/* ── Quick Parent Access (top-right corner) ── */}
      <motion.button
        className="fixed top-4 right-4 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-full cursor-pointer"
        style={{
          background: 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 2px 8px rgba(45, 45, 58, 0.06)',
        }}
        onClick={() => navigate('/parent-dashboard')}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="2" y="6" width="10" height="7" rx="2" stroke="#9B9BAB" strokeWidth="1.5" fill="none" />
          <path d="M4.5 6V4.5a2.5 2.5 0 015 0V6" stroke="#9B9BAB" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </svg>
        <span className="text-xs font-semibold text-[#9B9BAB]">Parent</span>
      </motion.button>

      {/* ── Mascot Welcome Moment ── */}
      <motion.div
        className="relative z-10 flex flex-col items-center mb-2 md:mb-6 md:py-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <motion.div
          className="text-7xl mb-2 drop-shadow-lg select-none"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          {'\u{1F981}'}
        </motion.div>
        {/* Speech bubble */}
        <motion.div
          className="relative rounded-2xl px-5 py-2.5 mb-4"
          style={{
            background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF8F0 100%)',
            boxShadow: '0 2px 12px rgba(45,45,58,0.06)',
            border: '1px solid rgba(232,224,212,0.5)',
          }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 20 }}
        >
          {/* Bubble tail pointing up */}
          <div
            className="absolute top-[-7px] left-1/2 -translate-x-1/2 w-0 h-0"
            style={{
              borderLeft: '7px solid transparent',
              borderRight: '7px solid transparent',
              borderBottom: '7px solid #FFFFFF',
              filter: 'drop-shadow(0 -1px 1px rgba(232,224,212,0.3))',
            }}
          />
          <p className="text-[15px] font-bold text-[#2D2D3A] text-center">Who&apos;s playing today?</p>
        </motion.div>
      </motion.div>

      {/* ── App Title ── */}
      <motion.h1
        className="relative z-10 text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-coral to-[#FF8E8E] bg-clip-text text-transparent mb-1 tracking-tight text-center"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        Kids Learning Fun!
      </motion.h1>
      <motion.p
        className="relative z-10 text-[13px] font-medium text-[#9B9BAB] mb-6"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
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
            {/* Loading State */}
            {isLoading ? (
              <div className="space-y-3 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 md:space-y-0">
                <ProfileCardSkeleton />
                <ProfileCardSkeleton />
              </div>
            ) : profiles.length === 0 ? (
              /* ── Empty State (no profiles yet) ── */
              <motion.div
                className="text-center py-8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <motion.span
                  className="text-7xl block mb-4 select-none"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {'\u{1F680}'}
                </motion.span>
                <p className="font-extrabold text-xl text-[#2D2D3A] mb-1">Let&apos;s create your first player!</p>
                <p className="text-sm text-[#9B9BAB] mb-6">Set up a profile to start the adventure</p>
                <motion.button
                  className="mx-auto px-8 py-4 rounded-[16px] font-bold text-lg text-white cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8C42 100%)',
                    boxShadow: '0 4px 20px rgba(255, 107, 107, 0.3)',
                  }}
                  onClick={() => setShowCreate(true)}
                  whileHover={{ scale: 1.05, boxShadow: '0 6px 28px rgba(255,107,107,0.4)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  + Create Player
                </motion.button>
              </motion.div>
            ) : (
              /* ── Profile Cards ── */
              <div className="space-y-3 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 md:space-y-0">
                {profiles.map((profile, i) => {
                  const accent = getAccentColor(i);
                  const isLastPlayed = profile.id === lastPlayedId && profiles.length > 1;
                  const isSelected = profile.id === selectedProfileId;
                  const progressPercent = Math.min(100, (profile.totalStars / 50) * 100);

                  return (
                    <motion.button
                      key={profile.id}
                      className="relative w-full bg-white rounded-[20px] p-5 md:p-6 flex items-center gap-4 border border-[#F0EAE0] cursor-pointer transition-shadow duration-200 min-w-[140px]"
                      style={{
                        boxShadow: isLastPlayed
                          ? `0 4px 20px rgba(45,45,58,0.08), 0 0 0 1px rgba(45,45,58,0.02)`
                          : '0 2px 12px rgba(45,45,58,0.06)',
                      }}
                      onClick={() => handleSelectProfile(profile)}
                      initial={{ x: -50, opacity: 0 }}
                      animate={{
                        x: 0,
                        opacity: 1,
                        scale: isSelected ? 1.04 : isLastPlayed ? 1.02 : 1,
                      }}
                      transition={{ delay: i * 0.1, type: 'spring', stiffness: 300, damping: 25 }}
                      whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(45,45,58,0.10)' }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Spotlight glow for last-played profile */}
                      {isLastPlayed && (
                        <div
                          className="absolute inset-0 rounded-[20px] pointer-events-none"
                          style={{
                            background: `radial-gradient(ellipse at 30% 50%, ${accent}10 0%, transparent 70%)`,
                          }}
                        />
                      )}

                      {/* Sparkle effect when selected */}
                      {isSelected && (
                        <SparkleEffect active color="#FFD93D" count={10} />
                      )}

                      {/* Avatar with premium frame */}
                      <AvatarFrame
                        emoji={profile.avatarEmoji}
                        photo={profile.avatarPhoto}
                        accentColor={accent}
                        size="lg"
                        glowing={isSelected}
                        badge={profile.totalStars >= 50 ? '\u{1F451}' : profile.totalStars >= 20 ? '\u2B50' : undefined}
                      />

                      {/* Profile info */}
                      <div className="text-left flex-1 min-w-0 relative z-10">
                        <div className="flex items-center gap-2">
                          <p className="font-extrabold text-lg text-[#2D2D3A] truncate">{profile.name}</p>
                          {profile.age && (
                            <span
                              className="flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold"
                              style={{
                                backgroundColor: `${accent}15`,
                                color: accent,
                              }}
                            >
                              Age {profile.age}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm mt-0.5">
                          <span className="font-semibold text-amber-500">{'\u2B50'} {profile.totalStars} stars</span>
                          {profile.streakDays > 0 && (
                            <span className="text-orange-500 font-semibold">{'\u{1F525}'} {profile.streakDays} day{profile.streakDays !== 1 ? 's' : ''}</span>
                          )}
                        </div>
                        {/* Mini progress bar */}
                        <div className="mt-2 w-full h-1.5 bg-[#F0EAE0] rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: `linear-gradient(90deg, ${accent}, ${accent}CC)` }}
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut', delay: i * 0.1 + 0.3 }}
                          />
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          {profile.lastPlayedAt && (
                            <p className="text-[11px] text-[#9B9BAB]">Last played: {timeAgo(new Date(profile.lastPlayedAt))}</p>
                          )}
                          {isLastPlayed && (
                            <span className="text-[10px] font-bold text-[#9B9BAB] uppercase tracking-wider bg-[#F0EAE0] px-2 py-0.5 rounded-full">
                              Last played
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}

                {/* ── Add Profile CTA ── */}
                <motion.button
                  className="w-full rounded-[20px] p-5 font-bold text-lg cursor-pointer border-2 border-dashed border-coral/30 text-coral flex flex-col items-center justify-center gap-2 min-h-[120px] hover:bg-[#FFF0F0] hover:border-coral/50 transition-all duration-200"
                  style={{ backgroundColor: 'rgba(255, 240, 240, 0.3)' }}
                  onClick={() => setShowCreate(true)}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: profiles.length * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="w-12 h-12 rounded-full bg-coral/10 flex items-center justify-center text-2xl text-coral">+</span>
                  <span>Add Player</span>
                </motion.button>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="create"
            className="relative z-10 w-full max-w-sm md:max-w-md overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <AnimatePresence mode="wait" custom={direction}>
              {/* Step 1: Name & Avatar */}
              {createStep === 'name-avatar' && (
                <motion.div
                  key="step-name-avatar"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="space-y-6"
                >
                  <div>
                    <p className="font-extrabold text-lg mb-3 text-center text-[#2D2D3A]">Pick your avatar</p>
                    <AvatarPicker
                      selected={avatar}
                      onSelect={setAvatar}
                      photo={avatarPhoto}
                      onPhotoChange={setAvatarPhoto}
                    />
                  </div>
                  <div>
                    <p className="font-extrabold text-lg mb-2 text-center text-[#2D2D3A]">What&apos;s your name?</p>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter name..."
                      maxLength={20}
                      className="w-full bg-white rounded-[14px] px-4 py-3.5 text-lg text-center shadow-[0_2px_12px_rgba(45,45,58,0.06)] border border-[#F0EAE0] outline-none focus:ring-4 focus:ring-coral/20 focus:border-coral/30 transition-all"
                      autoFocus
                    />
                  </div>
                  <div className="flex gap-3">
                    <motion.button
                      className="flex-1 bg-white/80 backdrop-blur-sm rounded-[14px] py-3 font-bold cursor-pointer text-[#6B6B7B] shadow-sm border border-[#F0EAE0]"
                      onClick={resetCreateFlow}
                      whileTap={{ scale: 0.95 }}
                    >
                      Back
                    </motion.button>
                    <motion.button
                      className="flex-1 bg-gradient-to-r from-coral to-[#FF8E8E] text-white rounded-[14px] py-3 font-bold shadow-[0_4px_20px_rgba(255,107,107,0.25)] cursor-pointer disabled:opacity-40"
                      onClick={() => goToStep('age')}
                      disabled={!name.trim()}
                      whileTap={{ scale: 0.95 }}
                    >
                      Next
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Age Picker */}
              {createStep === 'age' && (
                <motion.div
                  key="step-age"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="space-y-6"
                >
                  <div>
                    <p className="font-extrabold text-xl mb-1 text-center text-[#2D2D3A]">How old are you?</p>
                    {selectedAge && (
                      <motion.p
                        className="text-center text-[#6B6B7B] text-sm font-medium"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {getAgeLabel(selectedAge)}
                      </motion.p>
                    )}
                  </div>
                  <div className="flex flex-wrap justify-center gap-3">
                    {ageOptions.map((age, i) => (
                      <motion.button
                        key={age}
                        className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white cursor-pointer shadow-lg transition-all ${
                          selectedAge === age
                            ? `${ageColors[age]} ring-4 ring-offset-2 ring-coral/50 scale-110`
                            : `${ageColors[age]} opacity-80`
                        }`}
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
                    <motion.button
                      className="flex-1 bg-white/80 backdrop-blur-sm rounded-[14px] py-3 font-bold cursor-pointer text-[#6B6B7B] shadow-sm border border-[#F0EAE0]"
                      onClick={() => goToStep('name-avatar')}
                      whileTap={{ scale: 0.95 }}
                    >
                      Back
                    </motion.button>
                    <motion.button
                      className="flex-1 bg-white/60 text-[#9B9BAB] rounded-[14px] py-3 font-bold cursor-pointer border border-[#F0EAE0]"
                      onClick={() => {
                        setSelectedAge(null);
                        goToStep('interests');
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Skip
                    </motion.button>
                    <motion.button
                      className="flex-1 bg-gradient-to-r from-coral to-[#FF8E8E] text-white rounded-[14px] py-3 font-bold shadow-[0_4px_20px_rgba(255,107,107,0.25)] cursor-pointer disabled:opacity-40"
                      onClick={() => goToStep('interests')}
                      disabled={!selectedAge}
                      whileTap={{ scale: 0.95 }}
                    >
                      Next
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Interests Picker */}
              {createStep === 'interests' && (
                <motion.div
                  key="step-interests"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="space-y-6"
                >
                  <div>
                    <p className="font-extrabold text-xl mb-1 text-center text-[#2D2D3A]">What do you like?</p>
                    <p className="text-center text-[#9B9BAB] text-sm font-medium">Pick 1-4 things you enjoy</p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3">
                    {interestOptions.map((interest, i) => {
                      const isSelected = selectedInterests.includes(interest.key);
                      return (
                        <motion.button
                          key={interest.key}
                          className={`px-4 py-2.5 rounded-full flex items-center gap-2 font-bold text-sm cursor-pointer shadow-[0_2px_12px_rgba(45,45,58,0.06)] border transition-all ${
                            isSelected
                              ? 'bg-gradient-to-r from-coral to-[#FF8E8E] text-white border-coral/30'
                              : 'bg-white text-[#2D2D3A] border-[#F0EAE0] hover:bg-[#FFF0F0]'
                          }`}
                          onClick={() => handleToggleInterest(interest.key)}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', delay: i * 0.04 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <span className="text-lg">{interest.emoji}</span>
                          {interest.label}
                        </motion.button>
                      );
                    })}
                  </div>
                  <div className="flex gap-3">
                    <motion.button
                      className="flex-1 bg-white/80 backdrop-blur-sm rounded-[14px] py-3 font-bold cursor-pointer text-[#6B6B7B] shadow-sm border border-[#F0EAE0]"
                      onClick={() => goToStep('age')}
                      whileTap={{ scale: 0.95 }}
                    >
                      Back
                    </motion.button>
                    <motion.button
                      className="flex-1 bg-white/60 text-[#9B9BAB] rounded-[14px] py-3 font-bold cursor-pointer border border-[#F0EAE0]"
                      onClick={handleFinishCreate}
                      whileTap={{ scale: 0.95 }}
                    >
                      Skip
                    </motion.button>
                    <motion.button
                      className="flex-1 bg-gradient-to-r from-coral to-[#FF8E8E] text-white rounded-[14px] py-3 font-bold shadow-[0_4px_20px_rgba(255,107,107,0.25)] cursor-pointer disabled:opacity-40"
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
