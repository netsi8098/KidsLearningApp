import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useProfiles } from '../hooks/useProfile';
import AvatarPicker from '../components/AvatarPicker';
import AvatarFrame from '../components/AvatarFrame';
import AnimatedBackground from '../components/svg/AnimatedBackground';
import MascotLion from '../components/svg/MascotLion';
import AuthModal from '../components/AuthModal';
import { WelcomeMeadowScene } from '../components/svg/MotionAssetPack';

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

/* Title with per-letter rainbow colors + bounce animation */
const TITLE_COLORS = ['#FF6B6B', '#FF8C42', '#FFE66D', '#6BCB77', '#4ECDC4', '#45B7D1', '#A78BFA', '#FF8FAB'];

function AnimatedTitle() {
  const text = 'Kids Learning Fun!';
  return (
    <h1 className="text-center" style={{ fontSize: 'clamp(2.5rem, 9vw, 3.5rem)', lineHeight: 1.1 }}>
      {text.split('').map((char, i) => (
        <span
          key={i}
          className="font-display animate-letter-bounce inline-block"
          style={{
            animationDelay: `${i * 0.04}s`,
            display: char === ' ' ? 'inline' : 'inline-block',
            color: TITLE_COLORS[i % TITLE_COLORS.length],
            textShadow: '0 2px 0 rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.06)',
          }}
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
  const [showAuthModal, setShowAuthModal] = useState(false);

  const lastPlayedId = getLastPlayedId(profiles);
  const isLoading = profiles === undefined;

  async function handleSelectProfile(profile: typeof profiles[number]) {
    try {
      setSelectedProfileId(profile.id ?? null);
      // Ensure safe defaults
      const safeProfile = {
        ...profile,
        avatarEmoji: profile.avatarEmoji || '\u{1F981}',
        totalStars: profile.totalStars ?? 0,
        streakDays: profile.streakDays ?? 0,
        name: profile.name || 'Player',
      };
      setTimeout(async () => {
        try {
          setCurrentPlayer(safeProfile);
          if (safeProfile.id) await updateLastPlayed(safeProfile.id);
          navigate('/menu');
        } catch (err) {
          console.error('[WelcomePage] Error navigating to menu:', err);
          navigate('/menu');
        }
      }, 400);
    } catch (err) {
      console.error('[WelcomePage] Error selecting profile:', err);
    }
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

  function startLocalPlayerSetup() {
    setShowAuthModal(false);
    setShowCreate(true);
  }

  return (
    <div className="min-h-dvh flex flex-col items-center relative page-with-bg overflow-hidden">
      {/* ═══ LAYER 0: Sky + animated background ═══ */}
      <AnimatedBackground theme="home" />

      {/* ═══ LAYER 1: Ambient sparkles floating in the sky ═══ */}
      <motion.div className="fixed pointer-events-none" style={{ top: '8%', left: '10%', zIndex: 2 }} animate={{ y: [0, -10, 0], opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 4, repeat: Infinity }}>
        <svg width="12" height="12" viewBox="0 0 12 12"><path d="M6 0L7.2 4.8L12 6L7.2 7.2L6 12L4.8 7.2L0 6L4.8 4.8Z" fill="#FFE66D" opacity="0.7" /></svg>
      </motion.div>
      <motion.div className="fixed pointer-events-none" style={{ top: '14%', right: '12%', zIndex: 2 }} animate={{ y: [0, -8, 0], opacity: [0.4, 0.9, 0.4] }} transition={{ duration: 5, repeat: Infinity, delay: 1.2 }}>
        <svg width="10" height="10" viewBox="0 0 12 12"><path d="M6 0L7.2 4.8L12 6L7.2 7.2L6 12L4.8 7.2L0 6L4.8 4.8Z" fill="#A78BFA" opacity="0.6" /></svg>
      </motion.div>
      <motion.div className="fixed pointer-events-none" style={{ top: '6%', left: '45%', zIndex: 2 }} animate={{ y: [0, -6, 0], opacity: [0.5, 1, 0.5] }} transition={{ duration: 3.5, repeat: Infinity, delay: 0.6 }}>
        <svg width="7" height="7" viewBox="0 0 12 12"><circle cx="6" cy="6" r="5" fill="#FF8FAB" opacity="0.5" /></svg>
      </motion.div>
      <motion.div className="fixed pointer-events-none" style={{ top: '20%', left: '25%', zIndex: 2 }} animate={{ y: [0, -7, 0], opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 4.5, repeat: Infinity, delay: 2 }}>
        <svg width="8" height="8" viewBox="0 0 12 12"><path d="M6 0L7.2 4.8L12 6L7.2 7.2L6 12L4.8 7.2L0 6L4.8 4.8Z" fill="#4ECDC4" opacity="0.5" /></svg>
      </motion.div>

      {/* ═══ LAYER 2: Parent access — top-right ═══ */}
      <motion.button
        className="fixed top-4 right-4 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-full cursor-pointer glass"
        onClick={() => setShowAuthModal(true)}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <ShieldLockIcon />
        <span className="text-xs font-semibold text-[#9B9BAB]">Parent</span>
      </motion.button>

      {/* ═══ LAYER 3: HERO SCENE — mascot on grounded stage ═══ */}
      <div className="relative z-10 w-full flex flex-col items-center pt-16 md:pt-20">
        {/* ── Mascot with stage ground ── */}
        <motion.div
          className="relative flex flex-col items-center"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          {/* Flanking flowers — left */}
          <motion.div className="absolute left-[-40px] bottom-[30px] md:left-[-60px]" animate={{ y: [0, -4, 0], rotate: [-3, 3, -3] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
            <svg width="28" height="40" viewBox="0 0 28 40"><rect x="12" y="22" width="4" height="18" rx="2" fill="#59A84B" /><circle cx="14" cy="16" r="10" fill="#FF8FAB" opacity="0.85" /><circle cx="14" cy="16" r="5" fill="#FFE66D" /></svg>
          </motion.div>
          {/* Flanking flowers — right */}
          <motion.div className="absolute right-[-35px] bottom-[35px] md:right-[-55px]" animate={{ y: [0, -3, 0], rotate: [2, -2, 2] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}>
            <svg width="24" height="36" viewBox="0 0 24 36"><rect x="10" y="20" width="4" height="16" rx="2" fill="#59A84B" /><circle cx="12" cy="14" r="9" fill="#A78BFA" opacity="0.8" /><circle cx="12" cy="14" r="4" fill="#FFE66D" /></svg>
          </motion.div>

          {/* Speech bubble — attached above mascot */}
          <motion.div
            className="relative rounded-2xl px-6 py-2.5 mb-1 glass"
            style={{ boxShadow: '0 4px 20px rgba(45,45,58,0.08)' }}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 20 }}
          >
            <p className="font-display text-lg text-[#2D2D3A] text-center">Who&apos;s playing today?</p>
            <div
              className="absolute bottom-[-7px] left-1/2 -translate-x-1/2 w-0 h-0"
              style={{ borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: '8px solid rgba(255,255,255,0.75)' }}
            />
          </motion.div>

          {/* The mascot */}
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <MascotLion size={200} expression="waving" animated />
          </motion.div>

          {/* Mascot ground shadow — gives depth */}
          <motion.div
            className="rounded-full"
            style={{ width: 120, height: 16, background: 'rgba(0,0,0,0.06)', filter: 'blur(4px)', marginTop: -8 }}
            animate={{ scaleX: [1, 1.05, 1] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Stage ground — grounded meadow strip under mascot */}
          <svg viewBox="0 0 320 36" className="w-64 md:w-80 -mt-2" preserveAspectRatio="xMidYMid meet">
            <ellipse cx="160" cy="18" rx="158" ry="16" fill="#78D38A" />
            <ellipse cx="160" cy="20" rx="130" ry="12" fill="#6BCB77" opacity="0.6" />
            <motion.circle cx="40" cy="12" r="4" fill="#FF6B6B" animate={{ y: [0, -2, 0] }} transition={{ duration: 2, repeat: Infinity }} />
            <circle cx="40" cy="12" r="1.5" fill="#FFE66D" />
            <motion.circle cx="280" cy="14" r="3.5" fill="#4ECDC4" animate={{ y: [0, -2, 0] }} transition={{ duration: 2.5, repeat: Infinity, delay: 0.4 }} />
            <circle cx="280" cy="14" r="1.5" fill="#FFE66D" />
            <rect x="110" y="10" width="3" height="6" rx="1.5" fill="#DEB887" />
            <ellipse cx="111.5" cy="10" rx="5" ry="3.5" fill="#FF6B6B" opacity="0.8" />
            <rect x="200" y="12" width="2.5" height="5" rx="1.2" fill="#DEB887" />
            <ellipse cx="201" cy="12" rx="4" ry="3" fill="#A78BFA" opacity="0.7" />
          </svg>
        </motion.div>

        {/* ── Title — flows from the scene ── */}
        <motion.div
          className="mt-3 mb-0.5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <AnimatedTitle />
        </motion.div>
        <motion.p
          className="text-sm font-bold text-[#6B6B7B] mb-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Choose a player to start
        </motion.p>
      </div>

      {/* ═══ LAYER 4: Bottom world ground — wraps around to the content ═══ */}
      <div className="fixed bottom-0 left-0 right-0 pointer-events-none" style={{ zIndex: 1 }}>
        <svg viewBox="0 0 400 80" preserveAspectRatio="xMidYMax slice" className="w-full h-20 md:h-28">
          <path d="M0 30C60 20 100 35 160 25C220 15 280 30 340 22C370 18 400 25 400 25V80H0Z" fill="#6BCB77" opacity="0.5" />
          <path d="M0 40C50 33 110 45 170 38C230 30 290 42 350 35C380 32 400 38 400 38V80H0Z" fill="#5FBA6C" opacity="0.65" />
          <motion.g animate={{ rotate: [-2, 2, -2] }} transition={{ duration: 4, repeat: Infinity }} style={{ transformOrigin: '50px 35px' }}>
            <path d="M50 35L48 22L52 35" stroke="#4CAF50" strokeWidth="1.5" fill="none" />
            <path d="M53 35L55 20L57 35" stroke="#6BCB77" strokeWidth="1.5" fill="none" />
          </motion.g>
          <motion.g animate={{ rotate: [1, -2, 1] }} transition={{ duration: 3.5, repeat: Infinity, delay: 0.7 }} style={{ transformOrigin: '250px 30px' }}>
            <path d="M250 30L248 18L252 30" stroke="#4CAF50" strokeWidth="1.5" fill="none" />
          </motion.g>
          <motion.g animate={{ rotate: [-1, 3, -1] }} transition={{ duration: 4.2, repeat: Infinity, delay: 1.2 }} style={{ transformOrigin: '350px 28px' }}>
            <path d="M350 28L348 16L352 28" stroke="#6BCB77" strokeWidth="1.5" fill="none" />
          </motion.g>
        </svg>
      </div>

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
              /* Empty State — prompt to sign up first */
              <motion.div className="text-center py-8" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <MascotLion size={120} expression="excited" animated className="mx-auto mb-4" />
                <p className="font-display text-2xl text-[#2D2D3A] mb-1">Welcome!</p>
                <p className="text-sm text-[#6B6B7B] mb-6 max-w-xs mx-auto">
                  Create a player profile to start learning. Parent sign-in can be added later.
                </p>
                <div className="flex flex-col gap-3 max-w-xs mx-auto">
                  <motion.button
                    className="w-full px-8 py-4 rounded-2xl font-display text-lg text-white cursor-pointer animate-glow-pulse"
                    style={{ background: 'linear-gradient(135deg, #4ECDC4 0%, #3DBDB4 100%)', boxShadow: '0 4px 0 rgba(0,0,0,0.1), 0 8px 20px rgba(78,205,196,0.3)' }}
                    onClick={startLocalPlayerSetup}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Get Started — Free
                  </motion.button>
                  <motion.button
                    className="w-full px-6 py-3 rounded-2xl font-display text-sm cursor-pointer"
                    style={{ background: 'rgba(255,255,255,0.7)', color: '#6B6B7B', border: '2px solid #E8E0D4' }}
                    onClick={() => setShowAuthModal(true)}
                    whileTap={{ scale: 0.95 }}
                  >
                    Parent Sign In
                  </motion.button>
                  <p className="text-[10px] text-[#9B9BAB] mt-2">
                    Free forever. No credit card needed. COPPA compliant.
                  </p>
                </div>
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
                        className="flex-shrink-0 w-[76px] h-[76px] rounded-full flex items-center justify-center overflow-hidden"
                        style={{ border: `4px solid ${accent}`, background: `${accent}15` }}
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
                          <p className="font-display text-[#2D2D3A]" style={{ whiteSpace: 'nowrap', fontSize: '16px' }}>{profile.name}</p>
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
                          <span className="text-[10px] font-bold text-white uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ backgroundColor: '#4CAF7D' }}>
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
                  style={profiles.length >= 6
                    ? { opacity: 0.4, cursor: 'not-allowed', borderColor: '#9B9BAB80', color: '#9B9BAB', background: 'rgba(155,155,171,0.05)' }
                    : { borderColor: '#4ECDC480', color: '#4ECDC4', background: 'rgba(78, 205, 196, 0.05)' }
                  }
                  onClick={() => { if (profiles.length < 6) setShowCreate(true); }}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: profiles.length * 0.1 }}
                  whileHover={{ scale: profiles.length < 6 ? 1.02 : 1 }}
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

      {/* Parent Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={(user) => {
          console.log('[Auth] Logged in as:', user.email);
          setShowAuthModal(false);
          // If a player is already selected, go to parent dashboard
          // Otherwise stay on welcome page — parent needs to select/create a player first
          if (profiles.length > 0) {
            // Auto-select last played profile and go to dashboard
            const lastPlayed = profiles[0];
            if (lastPlayed) {
              setCurrentPlayer({
                ...lastPlayed,
                avatarEmoji: lastPlayed.avatarEmoji || '🦁',
                totalStars: lastPlayed.totalStars ?? 0,
                streakDays: lastPlayed.streakDays ?? 0,
                name: lastPlayed.name || 'Player',
              });
            }
            navigate('/parent-dashboard');
          }
          // If no profiles exist, parent stays on welcome to create one
        }}
        onContinueLocal={startLocalPlayerSetup}
        onCreateChildProfile={() => setShowCreate(true)}
      />
    </div>
  );
}
