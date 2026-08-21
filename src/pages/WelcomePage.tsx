import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useProfiles } from '../hooks/useProfile';
import AvatarPicker from '../components/AvatarPicker';
import LionMascot, { type MascotState } from '../components/character/LionMascot';
import { PlayerCard, NewPlayerCard } from '../components/homepage/PlayerCard';
import WorldTitle, { SpeechBubble } from '../components/homepage/WorldTitle';
import ShelfSurface from '../components/homepage/ShelfSurface';
import AuthModal from '../components/AuthModal';
import ThemePicker from '../components/homepage/ThemePicker';
import { getThemeById, DEFAULT_THEME_ID } from '../data/homepageThemes';
import RiverGardenWorld from '../components/homepage/worlds/RiverGardenWorld';
import RiverGarden3DWorld from '../components/homepage/worlds/RiverGarden3DWorld';
import type { LionBrain } from '../components/homepage/world3d/lionBrain';
import SunnyMeadowWorld from '../components/homepage/worlds/SunnyMeadowWorld';
import TreehouseWorld from '../components/homepage/worlds/TreehouseWorld';
import SkyIslandsWorld from '../components/homepage/worlds/SkyIslandsWorld';

/* ── Utility helpers ── */


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
  enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? -300 : 300, opacity: 0 }),
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

/* ── Small SVG icons ── */



function ShieldLockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M9 1L15 4V8.5C15 12.5 12.5 15.5 9 17C5.5 15.5 3 12.5 3 8.5V4L9 1Z" stroke="#6B5BA8" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <rect x="6.5" y="8" width="5" height="4" rx="1" stroke="#6B5BA8" strokeWidth="1.2" fill="none" />
      <path d="M7.5 8V6.5C7.5 5.7 8.2 5 9 5C9.8 5 10.5 5.7 10.5 6.5V8" stroke="#6B5BA8" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

/* ── Animated title ── */

/* ═══════════════════════════════════════════════
   WELCOME PAGE
   ═══════════════════════════════════════════════ */

/** Theme id → code-built world component */
const WORLD_BY_THEME: Record<string, (p: { children: ReactNode }) => JSX.Element> = {
  'river-garden': RiverGardenWorld,
  'river-garden-3d': RiverGarden3DWorld,
  'sunny-meadow': SunnyMeadowWorld,
  'treehouse': TreehouseWorld,
  'sky-islands': SkyIslandsWorld,
};

export default function WelcomePage() {
  const navigate = useNavigate();
  const { setCurrentPlayer, speechEnabled } = useApp();
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
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [mascotState, setMascotState] = useState<MascotState>('waving');
  const [mascotReactionKey, setMascotReactionKey] = useState(0);
  const [mascotSpeechKey, setMascotSpeechKey] = useState(0);
  const [mascotMouthKey, setMascotMouthKey] = useState(0);
  const mascotVoiceTimerRef = useRef<number | null>(null);
  const [themeId, setThemeId] = useState(() => {
    try { return localStorage.getItem('klf-homepage-theme') || DEFAULT_THEME_ID; } catch { return DEFAULT_THEME_ID; }
  });
  const activeTheme = getThemeById(themeId);
  const handleThemeSelect = (id: string) => {
    setThemeId(id);
    try { localStorage.setItem('klf-homepage-theme', id); } catch { /* Storage can be disabled in private mode. */ }
  };

  const lastPlayedId = getLastPlayedId(profiles);
  const isLoading = profiles === undefined;

  async function handleSelectProfile(profile: typeof profiles[number]) {
    try {
      setSelectedProfileId(profile.id ?? null);
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
          console.error('[WelcomePage] Error navigating:', err);
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

  const lionBrain = useRef<LionBrain | null>(null);

  function greetFromMascot(playVoice = true) {
    /* In the 3D world the lion IS the mascot, so the same greeting drives the
       rigged character: it turns to the camera and plays the authored Wave. */
    lionBrain.current?.greet(0, 0.9);
    setMascotState('waving');
    setMascotReactionKey((value) => value + 1);
    setMascotSpeechKey((value) => value + 1);

    if (mascotVoiceTimerRef.current != null) window.clearTimeout(mascotVoiceTimerRef.current);
    if (!playVoice || !speechEnabled || !('speechSynthesis' in window)) {
      mascotVoiceTimerRef.current = window.setTimeout(() => {
        setMascotMouthKey((value) => value + 1);
        mascotVoiceTimerRef.current = null;
      }, 900);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance("Who's playing today?");
    utterance.rate = 0.86;
    utterance.pitch = 1.08;
    utterance.volume = 0.92;
    const friendlyVoice = window.speechSynthesis.getVoices().find((voice) =>
      voice.lang.startsWith('en') && /Samantha|Ava|Google|Natural/i.test(voice.name),
    );
    if (friendlyVoice) utterance.voice = friendlyVoice;
    let mouthStarted = false;
    const startMouth = () => {
      if (mouthStarted) return;
      mouthStarted = true;
      setMascotMouthKey((value) => value + 1);
    };
    utterance.onstart = startMouth;
    utterance.onerror = startMouth;
    mascotVoiceTimerRef.current = window.setTimeout(() => {
      window.speechSynthesis.speak(utterance);
      mascotVoiceTimerRef.current = null;
    }, 720);
  }

  // The visual performance introduces the character without forcing audio.
  // A tap/click replays it with voice after the browser has a user gesture.
  useEffect(() => {
    const timer = window.setTimeout(() => greetFromMascot(false), 850);
    return () => {
      window.clearTimeout(timer);
      if (mascotVoiceTimerRef.current != null) window.clearTimeout(mascotVoiceTimerRef.current);
      window.speechSynthesis?.cancel();
    };
    // The intro intentionally runs once for this mounted welcome experience.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Shared UI sections ── */

  const topControls = (
    <div className="relative flex-shrink-0 px-4 pt-4 z-30">
      {/* Parent gate sits top-centre in every reference frame */}
      <motion.button
        className="absolute left-1/2 -translate-x-1/2 top-4 flex items-center gap-1.5 px-4 py-2 rounded-full cursor-pointer"
        style={{
          background: 'rgba(255,255,255,0.92)',
          boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
        }}
        onClick={() => setShowAuthModal(true)}
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 260, damping: 22 }}
        whileHover={{ scale: 1.06, y: 1 }}
        whileTap={{ scale: 0.95 }}
      >
        <ShieldLockIcon />
        <span className="text-[13px] font-extrabold" style={{ color: '#6B5BA8' }}>Parent</span>
      </motion.button>

      <motion.button
        className="flex items-center gap-1.5 px-3 py-2 rounded-full cursor-pointer"
        style={{ background: 'rgba(0,0,0,0.24)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
        onClick={() => setShowThemePicker(true)}
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65, type: 'spring', stiffness: 260, damping: 22 }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M12 2a7 7 0 0 0 0 20 10 10 0 0 0 0-20" /><circle cx="12" cy="12" r="3" /></svg>
        <span className="text-xs font-semibold text-white/90">World</span>
      </motion.button>
    </div>
  );

  const cardContent = (
    <AnimatePresence mode="wait">
      {!showCreate ? (
        <motion.div key="profiles" className="w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          {isLoading ? (
            <div className="space-y-3">
              {[0, 1].map(i => (
                <div key={i} className="w-full rounded-3xl p-5 bg-white/20 animate-shimmer h-24" />
              ))}
            </div>
          ) : profiles.length === 0 ? (
            /* The first-player action is a real shelf card, not a large modal
               panel that hides the world the child just arrived in. */
            <motion.div
              className={`flex flex-col items-center gap-2 ${activeTheme.id === 'treehouse' ? 'relative left-[18vw] sm:left-0' : ''}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-[144px] sm:w-[156px]">
                <NewPlayerCard onClick={startLocalPlayerSetup} />
              </div>
              <motion.button
                className="px-4 py-2 rounded-full text-xs font-extrabold cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.82)', color: '#6553A8', boxShadow: '0 5px 16px rgba(38,45,70,0.16)' }}
                onClick={() => setShowAuthModal(true)}
                whileTap={{ scale: 0.95 }}
              >
                Parent Sign In
              </motion.button>
            </motion.div>
          ) : (
            /* ── Player shelf: a row of cards resting on the world's
                  foreground surface, matching the reference composition.
                  Mobile keeps it a row too, scrolled horizontally, so the
                  scene behind stays visible instead of being buried. ── */
            <div
              className="flex gap-3 md:gap-4 overflow-x-auto md:overflow-visible md:justify-center pb-2 -mx-1 px-1 snap-x snap-mandatory md:snap-none"
              style={{ scrollbarWidth: 'none' }}
            >
              {profiles.map((profile, i) => (
                <div
                  key={profile.id}
                  className="snap-center flex-shrink-0 w-[132px] sm:w-[146px] md:w-auto md:flex-1 md:max-w-[178px]"
                >
                  <PlayerCard
                    name={profile.name}
                    age={profile.age}
                    stars={profile.totalStars}
                    streakDays={profile.streakDays}
                    avatarEmoji={profile.avatarEmoji}
                    avatarPhoto={profile.avatarPhoto}
                    accent={getAccentColor(i)}
                    isRecent={profile.id === lastPlayedId && profiles.length > 1}
                    isSelected={profile.id === selectedProfileId}
                    progress={Math.min(1, (profile.totalStars ?? 0) / 100)}
                    index={i}
                    onSelect={() => handleSelectProfile(profile)}
                    onFocusChange={(focused) => setHoveredCard(focused ? i : null)}
                  />
                </div>
              ))}
              <div className="snap-center flex-shrink-0 w-[132px] sm:w-[146px] md:w-auto md:flex-1 md:max-w-[178px]">
                <NewPlayerCard
                  disabled={profiles.length >= 6}
                  index={profiles.length}
                  onClick={() => setShowCreate(true)}
                />
              </div>
            </div>
          )}
        </motion.div>
      ) : (
        /* ═══ CREATE FLOW ═══ */
        <motion.div
          key="create"
          className="relative w-full max-w-sm md:max-w-md mx-auto rounded-3xl p-6 overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(16px)', boxShadow: '0 16px 48px rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.3)' }}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
        >
          <AnimatePresence mode="wait" custom={direction}>
            {createStep === 'name-avatar' && (
              <motion.div key="step-name" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="space-y-5">
                <div>
                  <p className="font-display text-xl mb-3 text-center text-[#2D2D3A]">Pick your avatar</p>
                  <AvatarPicker selected={avatar} onSelect={setAvatar} photo={avatarPhoto} onPhotoChange={setAvatarPhoto} />
                </div>
                <div>
                  <p className="font-display text-xl mb-2 text-center text-[#2D2D3A]">What&apos;s your name?</p>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter name..." maxLength={20} className="w-full bg-white rounded-2xl px-4 py-3.5 text-lg text-center shadow-sm border border-[#F0EAE0] outline-none focus:ring-4 focus:ring-coral/20 focus:border-coral/30 transition-all font-bold" />
                </div>
                <div className="flex gap-3">
                  <motion.button className="flex-1 bg-white rounded-2xl py-3 font-bold cursor-pointer text-[#6B6B7B] shadow-sm border border-[#F0EAE0]" onClick={resetCreateFlow} whileTap={{ scale: 0.95 }}>Back</motion.button>
                  <motion.button className="flex-1 bg-gradient-to-r from-coral to-[#FF8E8E] text-white rounded-2xl py-3 font-bold shadow-lg cursor-pointer disabled:opacity-40" onClick={() => goToStep('age')} disabled={!name.trim()} whileTap={{ scale: 0.95 }}>Next</motion.button>
                </div>
              </motion.div>
            )}
            {createStep === 'age' && (
              <motion.div key="step-age" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="space-y-5">
                <div>
                  <p className="font-display text-xl mb-1 text-center text-[#2D2D3A]">How old are you?</p>
                  {selectedAge && <motion.p className="text-center text-[#6B6B7B] text-sm font-bold" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{getAgeLabel(selectedAge)}</motion.p>}
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  {ageOptions.map((age, i) => (
                    <motion.button key={age} className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-display text-white cursor-pointer shadow-lg transition-all tap-bounce ${selectedAge === age ? 'ring-4 ring-offset-2 ring-coral/50 scale-110' : 'opacity-80'}`} style={{ backgroundColor: ageColorMap[age] }} onClick={() => setSelectedAge(age)} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: i * 0.05 }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>{age}</motion.button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <motion.button className="flex-1 bg-white rounded-2xl py-3 font-bold cursor-pointer text-[#6B6B7B] shadow-sm border border-[#F0EAE0]" onClick={() => goToStep('name-avatar')} whileTap={{ scale: 0.95 }}>Back</motion.button>
                  <motion.button className="flex-1 bg-white/60 text-[#9B9BAB] rounded-2xl py-3 font-bold cursor-pointer border border-[#F0EAE0]" onClick={() => { setSelectedAge(null); goToStep('interests'); }} whileTap={{ scale: 0.95 }}>Skip</motion.button>
                  <motion.button className="flex-1 bg-gradient-to-r from-coral to-[#FF8E8E] text-white rounded-2xl py-3 font-bold shadow-lg cursor-pointer disabled:opacity-40" onClick={() => goToStep('interests')} disabled={!selectedAge} whileTap={{ scale: 0.95 }}>Next</motion.button>
                </div>
              </motion.div>
            )}
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
                      <motion.button key={interest.key} className="px-4 py-2.5 rounded-full flex items-center gap-2 font-bold text-sm cursor-pointer shadow-sm border-2 transition-all tap-bounce" style={{ backgroundColor: isActive ? interest.color : 'white', color: isActive ? 'white' : '#2D2D3A', borderColor: isActive ? interest.color : '#F0EAE0' }} onClick={() => handleToggleInterest(interest.key)} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: i * 0.04 }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}>{interest.label}</motion.button>
                    );
                  })}
                </div>
                <div className="flex gap-3">
                  <motion.button className="flex-1 bg-white rounded-2xl py-3 font-bold cursor-pointer text-[#6B6B7B] shadow-sm border border-[#F0EAE0]" onClick={() => goToStep('age')} whileTap={{ scale: 0.95 }}>Back</motion.button>
                  <motion.button className="flex-1 bg-white/60 text-[#9B9BAB] rounded-2xl py-3 font-bold cursor-pointer border border-[#F0EAE0]" onClick={handleFinishCreate} whileTap={{ scale: 0.95 }}>Skip</motion.button>
                  <motion.button className="flex-1 text-white rounded-2xl py-3 font-display text-base shadow-lg cursor-pointer disabled:opacity-40 animate-glow-pulse" style={{ background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8C42 100%)' }} onClick={handleFinishCreate} disabled={selectedInterests.length === 0} whileTap={{ scale: 0.95 }}>Let&apos;s Go!</motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );

  /* ═══ RENDER ═══ */

  /* Every theme is a code-built world. The old hero-image path was removed:
     the "-hero-clean.jpg" plates were never actually cleaned — they still had
     the title, subtitle and a fake Parent pill painted into the JPEG, which
     double-rendered against the real UI. */
  const World = WORLD_BY_THEME[activeTheme.id] ?? RiverGardenWorld;
  /* In the 3D world the character is real geometry in the scene, so the DOM
     mascot must NOT also be drawn — two lions is the "UI pasted on scenery"
     failure the brief rules out. The slot carries only the speech bubble. */
  const is3D = activeTheme.id === 'river-garden-3d';

  /* The character acknowledges the interface: it leans toward whichever card
     the user is pointing at and settles back to its welcome loop otherwise. */
  const cardCount = profiles.length + 1;
  const lookAt =
    hoveredCard == null || cardCount <= 1
      ? 0
      : (hoveredCard / (cardCount - 1)) * 2 - 1;

  const mascot = (
    <motion.div
      className="relative flex items-end justify-center"
      animate={showCreate ? { opacity: 0, y: -3, scale: 0.92 } : { opacity: 1, y: 9, scale: 1 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      style={{ pointerEvents: showCreate ? 'none' : 'auto' }}
      aria-hidden={showCreate}
    >
      {/* The hero scales up with the viewport instead of staying phone-sized
          on desktop — the scene grows, it doesn't just get wider margins. */}
      <div
        className="[--m:1] md:[--m:1.22] lg:[--m:1.45]"
        style={{ transform: 'scale(var(--m))', transformOrigin: 'bottom center' }}
      >
        <motion.button
          type="button"
          aria-label="Hear the lion ask who's playing today"
          className="block border-0 bg-transparent p-0 cursor-pointer"
          onPointerDown={() => greetFromMascot(true)}
          onClick={(event) => { if (event.detail === 0) greetFromMascot(true); }}
          whileHover={{ scale: 1.035 }}
          whileTap={{ scale: 0.95 }}
        >
          <LionMascot
            key={`${showCreate ? 'thinking' : hoveredCard != null ? 'attention' : mascotState}-${mascotReactionKey}`}
            state={showCreate ? 'thinking' : hoveredCard != null ? 'attention' : mascotState}
            size={210}
            lookAt={lookAt}
            speechText="Who's playing today?"
            speechKey={mascotSpeechKey}
            mouthKey={mascotMouthKey}
            grounded
            onSpeechComplete={() => setMascotState('idle')}
            onStateComplete={() => setMascotState('idle')}
          />
        </motion.button>
      </div>
      {/* Greeting bubble, anchored beside the mascot's shoulder */}
      <div className="absolute left-[76%] bottom-[62%] scale-[0.76] sm:left-[82%] sm:bottom-[58%] sm:scale-100 origin-left">
        <SpeechBubble />
      </div>
    </motion.div>
  );

  const title = (
    <WorldTitle
      variant={activeTheme.id === 'treehouse' ? 'sign' : 'mound'}
      subtitle={profiles.length === 0 ? 'Create a player to begin' : 'Choose a player to start your adventure'}
    />
  );

  /* The 3D world swaps in this slot ITSELF once it knows it really rendered in
     3D. Deciding here by theme id broke the no-WebGL fallback: the painted
     world came up with no character at all. */
  const mascotInScene = is3D ? (
    <div className="relative flex items-end justify-center">
      <SpeechBubble />
    </div>
  ) : undefined;

  return (
    <>
      <World mascot={mascot} mascotInScene={mascotInScene} title={title} brainRef={lionBrain}>
        {topControls}
        <div className="flex-1 min-h-[8px]" />
        {/* Card shelf: cards rest ON a world-native ledge, with the surface
            drawn behind them so they read as objects in the scene. */}
        {!showCreate && (
          <div className="relative z-20 pt-2">
            <ShelfSurface themeId={activeTheme.id} />
            <div className={`relative z-10 px-3 md:px-6 ${activeTheme.id === 'treehouse' ? 'pb-2 md:pb-4' : 'pb-6 md:pb-8'}`}>
              <div className="mx-auto w-full max-w-[1180px]">{cardContent}</div>
            </div>
          </div>
        )}
      </World>

      {/* ═══ MODALS (outside scene — always accessible) ═══ */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            className="fixed inset-0 z-[60] overflow-y-auto"
            style={{ background: 'rgba(18,45,70,0.34)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="min-h-full flex items-center justify-center px-4 py-20">
              <div className="w-full max-w-md">{cardContent}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={(user) => {
          console.log('[Auth] Logged in as:', user.email);
          setShowAuthModal(false);
          if (profiles.length > 0) {
            const lastPlayed = profiles[0];
            if (lastPlayed) {
              setCurrentPlayer({
                ...lastPlayed,
                avatarEmoji: lastPlayed.avatarEmoji || '\u{1F981}',
                totalStars: lastPlayed.totalStars ?? 0,
                streakDays: lastPlayed.streakDays ?? 0,
                name: lastPlayed.name || 'Player',
              });
            }
            navigate('/parent-dashboard');
          }
        }}
        onContinueLocal={startLocalPlayerSetup}
        onCreateChildProfile={() => setShowCreate(true)}
      />
      <ThemePicker
        open={showThemePicker}
        onClose={() => setShowThemePicker(false)}
        activeThemeId={themeId}
        onSelect={handleThemeSelect}
      />
    </>
  );
}
