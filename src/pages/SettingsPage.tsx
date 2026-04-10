import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { useProfiles } from '../hooks/useProfile';
import { useOfflinePacks, type PackStatus } from '../hooks/useOfflinePacks';
import { avatarEmojis } from '../data/avatarData';
import { languages } from '../i18n/i18nConfig';
import { timeModes } from '../registry/timeOfDayConfig';
import { db } from '../db/database';
import NavButton from '../components/NavButton';
import AnimatedBackground from '../components/svg/AnimatedBackground';
import IdentitySummaryCard from '../components/IdentitySummaryCard';
import { getAvailableVoices, setPreferredVoice, getActiveVoiceName } from '../hooks/useAudio';
import { aiSpeak, checkTTSServer, resetTTSStatus, getSelectedAIVoice, setSelectedAIVoice, type VoicePreset } from '../services/ttsService';

const statusConfig: Record<PackStatus, { label: string; color: string; bg: string; icon: string }> = {
  available: { label: 'Download', color: 'text-teal', bg: 'bg-teal-soft', icon: '\u2B07\uFE0F' },
  downloading: { label: 'Downloading...', color: 'text-teal', bg: 'bg-teal-soft', icon: '\u2B07\uFE0F' },
  ready: { label: 'Ready', color: 'text-leaf', bg: 'bg-leaf-soft', icon: '\u2705' },
  error: { label: 'Error', color: 'text-coral', bg: 'bg-coral-soft', icon: '\u274C' },
};

const packGradients: Record<string, string> = {
  'pack-road-trip': 'from-teal/20 to-sky/10',
  'pack-bedtime': 'from-grape/20 to-indigo-400/10',
  'pack-alphabet-starter': 'from-sunny/20 to-tangerine/10',
  'pack-restaurant': 'from-pink/20 to-coral/10',
  'pack-airplane': 'from-sky/20 to-teal/10',
};

const recommendedPacks = [
  {
    id: 'pack-airplane',
    tagline: 'For Travel',
    tagEmoji: '\u2708\uFE0F',
    description: 'Games, stories and lessons for long trips',
  },
  {
    id: 'pack-bedtime',
    tagline: 'Bedtime Bundle',
    tagEmoji: '\uD83C\uDF19',
    description: 'Calm stories and activities for winding down',
  },
];

function ToggleSwitch({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <motion.button
      className={`w-16 h-9 rounded-full flex items-center px-1 cursor-pointer transition-colors ${
        enabled ? 'bg-leaf justify-end' : 'bg-[#E8E0D4] justify-start'
      }`}
      onClick={onToggle}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div className="w-7 h-7 bg-white rounded-full shadow-md" layout />
    </motion.button>
  );
}

const AI_VOICES: { id: VoicePreset; label: string; emoji: string; desc: string }[] = [
  { id: 'kids', label: 'Ana (Kids)', emoji: '🧒', desc: 'Friendly young voice' },
  { id: 'girl', label: 'Ava', emoji: '👧', desc: 'Natural girl voice' },
  { id: 'boy', label: 'Andrew', emoji: '👦', desc: 'Natural boy voice' },
  { id: 'teacher', label: 'Jenny (Teacher)', emoji: '👩\u200D🏫', desc: 'Warm teacher voice' },
  { id: 'storyteller', label: 'Aria (Storyteller)', emoji: '📖', desc: 'Expressive narrator' },
  { id: 'fun', label: 'Emma (Fun)', emoji: '🎉', desc: 'Energetic and playful' },
];

function VoicePicker() {
  const [selected, setSelected] = useState<VoicePreset>(getSelectedAIVoice());
  const [serverUp, setServerUp] = useState<boolean | null>(null);

  const recheckServer = useCallback(() => {
    resetTTSStatus();
    checkTTSServer().then(setServerUp);
  }, []);

  useEffect(() => {
    recheckServer();
    // Re-check every 10s while offline
    const interval = setInterval(() => {
      if (serverUp !== true) recheckServer();
    }, 10000);
    return () => clearInterval(interval);
  }, [serverUp, recheckServer]);

  function handleSelect(voiceId: VoicePreset) {
    setSelected(voiceId);
    setSelectedAIVoice(voiceId);
    // Preview the voice
    aiSpeak("Hi there! Let's learn something fun today!", voiceId);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-[#2D2D3A]">
          AI Voice: <span className="text-teal">{AI_VOICES.find((v) => v.id === selected)?.label}</span>
        </p>
        {serverUp === true && (
          <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Connected</span>
        )}
        {serverUp === false && (
          <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">Offline</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {AI_VOICES.map((v) => {
          const isActive = v.id === selected;
          return (
            <motion.button
              key={v.id}
              className={`p-3 rounded-xl text-left cursor-pointer transition-all border ${
                isActive
                  ? 'bg-gradient-to-r from-teal to-[#38BDF8] text-white border-teal/30 shadow-md'
                  : 'bg-[#F8F5F0] text-[#2D2D3A] border-[#F0EAE0]'
              }`}
              onClick={() => handleSelect(v.id)}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{v.emoji}</span>
                <div>
                  <p className={`text-xs font-bold ${isActive ? 'text-white' : 'text-[#2D2D3A]'}`}>{v.label}</p>
                  <p className={`text-[10px] ${isActive ? 'text-white/80' : 'text-[#9B9BAB]'}`}>{v.desc}</p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {serverUp === false && (
        <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
          <p className="text-xs font-bold text-amber-800 mb-1">AI Voice Server is offline</p>
          <p className="text-xs text-amber-700 leading-relaxed">
            Ask a grown-up to run <strong>python3 tts-server.py</strong> in the KidsLearningApp folder to enable natural AI voices.
          </p>
          <button
            onClick={recheckServer}
            className="mt-2 text-xs font-bold text-amber-800 bg-amber-200 hover:bg-amber-300 rounded-lg px-3 py-1 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      )}
    </div>
  );
}

const ageOptions = [2, 3, 4, 5, 6, 7, 8] as const;

function getAgeGroup(age: number): '2-3' | '4-5' | '6-8' {
  if (age <= 3) return '2-3';
  if (age <= 5) return '4-5';
  return '6-8';
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

const ageColors: Record<number, string> = {
  2: 'bg-pink-400',
  3: 'bg-rose-400',
  4: 'bg-amber-400',
  5: 'bg-orange-400',
  6: 'bg-sky-400',
  7: 'bg-blue-400',
  8: 'bg-indigo-400',
};

export default function SettingsPage() {
  const navigate = useNavigate();
  const { currentPlayer, setCurrentPlayer, soundEnabled, setSoundEnabled, speechEnabled, setSpeechEnabled, timeMode, setTimeMode } = useApp();
  const a11y = useAccessibility();
  const { deleteProfile, updateProfile, getProfile } = useProfiles();
  const { packs, packStates, downloadPack, removePack, getPackStatus, getPackProgress } = useOfflinePacks();

  const [unlocked, setUnlocked] = useState(false);
  const [showOnlyReady, setShowOnlyReady] = useState(false);
  const [gateAnswer, setGateAnswer] = useState('');
  const [num1] = useState(() => Math.floor(Math.random() * 10) + 5);
  const [num2] = useState(() => Math.floor(Math.random() * 10) + 3);
  const correctAnswer = num1 + num2;
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Edit profile state
  const [editingProfile, setEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editAge, setEditAge] = useState<number | null>(null);
  const [editInterests, setEditInterests] = useState<string[]>([]);
  const [savingProfile, setSavingProfile] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!currentPlayer) return <Navigate to="/" replace />;

  function handleGateSubmit() {
    if (parseInt(gateAnswer) === correctAnswer) {
      setUnlocked(true);
    } else {
      setGateAnswer('');
    }
  }

  function startEditingProfile() {
    if (!currentPlayer) return;
    setEditName(currentPlayer.name);
    setEditAvatar(currentPlayer.avatarEmoji);
    setEditAge(currentPlayer.age ?? null);
    setEditInterests(currentPlayer.interests ?? []);
    setEditingProfile(true);
    setSaveSuccess(false);
  }

  function handleToggleEditInterest(key: string) {
    setEditInterests((prev) => {
      if (prev.includes(key)) {
        return prev.filter((i) => i !== key);
      }
      if (prev.length >= 4) return prev;
      return [...prev, key];
    });
  }

  async function handleSaveProfile() {
    if (!currentPlayer?.id || !editName.trim()) return;
    setSavingProfile(true);
    try {
      const updates: Record<string, unknown> = {
        name: editName.trim(),
        avatarEmoji: editAvatar,
        interests: editInterests,
      };
      if (editAge !== null) {
        updates.age = editAge;
        updates.ageGroup = getAgeGroup(editAge);
      }
      // If editAge is null, we simply don't update age fields (Dexie ignores undefined values)
      await updateProfile(currentPlayer.id, updates);
      // Refresh the current player in context
      const refreshed = await getProfile(currentPlayer.id);
      if (refreshed) {
        setCurrentPlayer(refreshed);
      }
      setSaveSuccess(true);
      setTimeout(() => {
        setEditingProfile(false);
        setSaveSuccess(false);
      }, 1000);
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleDeleteProfile() {
    if (!currentPlayer?.id) return;
    await deleteProfile(currentPlayer.id);
    setCurrentPlayer(null);
    navigate('/');
  }

  if (!unlocked) {
    return (
      <div className="min-h-dvh bg-[#FFF8F0] p-4 flex flex-col items-center justify-center md:p-8">
        <motion.div className="text-7xl mb-5 drop-shadow-md" initial={{ scale: 0 }} animate={{ scale: 1 }}>
          {'\u{1F512}'}
        </motion.div>
        <h2 className="text-2xl font-extrabold text-[#2D2D3A] mb-2">Parent Check</h2>
        <p className="text-[15px] font-medium text-[#6B6B7B] mb-6 text-center">
          Solve this to access settings
        </p>
        <motion.div
          className="bg-white rounded-[20px] p-6 shadow-[0_2px_12px_rgba(45,45,58,0.06)] border border-[#F0EAE0] text-center max-w-xs w-full md:max-w-sm md:p-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <p className="text-3xl font-extrabold text-[#2D2D3A] mb-4">
            {num1} + {num2} = ?
          </p>
          <input
            type="number"
            value={gateAnswer}
            onChange={(e) => setGateAnswer(e.target.value)}
            placeholder="Answer"
            className="w-full bg-[#FFF8F0] rounded-[14px] px-4 py-3 text-2xl text-center font-bold outline-none focus:ring-4 focus:ring-grape/20 focus:border-grape/30 border border-[#F0EAE0] mb-4 transition-all"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleGateSubmit()}
          />
          <div className="flex gap-3">
            <motion.button
              className="flex-1 bg-white/80 backdrop-blur-sm rounded-[14px] py-3 font-bold cursor-pointer text-[#6B6B7B] shadow-sm border border-[#F0EAE0]"
              onClick={() => navigate('/menu')}
              whileTap={{ scale: 0.95 }}
            >
              Back
            </motion.button>
            <motion.button
              className="flex-1 bg-gradient-to-r from-grape to-indigo-400 text-white rounded-[14px] py-3 font-bold cursor-pointer shadow-[0_4px_20px_rgba(167,139,250,0.25)]"
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
    <div className="min-h-dvh px-4 pt-4 pb-24 md:px-8 md:pt-6 md:pb-8 relative">
      <AnimatedBackground theme="home" />
      <div className="flex items-center justify-between mb-6 md:max-w-2xl md:mx-auto relative z-10">
        <NavButton onClick={() => navigate('/menu')} direction="back" />
        <h2 className="font-display text-xl text-[#2D2D3A] text-bubbly">Settings</h2>
        <div className="w-14" />
      </div>

      <div className="max-w-md mx-auto md:max-w-2xl space-y-4 md:space-y-5">
        {/* Player Identity Summary */}
        <IdentitySummaryCard
          name={currentPlayer.name}
          emoji={currentPlayer.avatarEmoji}
          color="#A78BFA"
          age={currentPlayer.age}
          totalStars={currentPlayer.totalStars}
          lastPlayedAt={currentPlayer.lastPlayedAt}
        />

        {/* Edit Profile */}
        <motion.div
          className="bg-white rounded-[20px] p-5 shadow-[0_2px_12px_rgba(45,45,58,0.06)] border border-[#F0EAE0]"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.025 }}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[13px] font-extrabold text-[#6B6B7B] uppercase tracking-wider">{'\u{270F}\u{FE0F}'} Edit Profile</h3>
            {!editingProfile && (
              <motion.button
                className="bg-grape/10 text-grape px-4 py-1.5 rounded-xl font-bold text-sm cursor-pointer"
                onClick={startEditingProfile}
                whileTap={{ scale: 0.95 }}
              >
                Edit
              </motion.button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {editingProfile ? (
              <motion.div
                key="editing"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 overflow-hidden"
              >
                {/* Edit Name */}
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-1">Name</p>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Enter name..."
                    maxLength={20}
                    className="w-full bg-gray-50 rounded-xl px-4 py-2.5 text-lg outline-none focus:ring-4 focus:ring-grape/20"
                  />
                </div>

                {/* Edit Avatar */}
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-2">Avatar</p>
                  <div className="grid grid-cols-8 gap-2">
                    {avatarEmojis.map((emoji) => (
                      <motion.button
                        key={emoji}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl cursor-pointer ${
                          editAvatar === emoji
                            ? 'bg-grape shadow-md ring-2 ring-grape/30'
                            : 'bg-gray-50'
                        }`}
                        onClick={() => setEditAvatar(emoji)}
                        whileTap={{ scale: 0.9 }}
                      >
                        {emoji}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Edit Age */}
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-2">Age</p>
                  <div className="flex flex-wrap gap-2">
                    {ageOptions.map((age) => (
                      <motion.button
                        key={age}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white cursor-pointer shadow-md transition-all ${
                          editAge === age
                            ? `${ageColors[age]} ring-2 ring-offset-1 ring-grape/50`
                            : `${ageColors[age]} opacity-60`
                        }`}
                        onClick={() => setEditAge(editAge === age ? null : age)}
                        whileTap={{ scale: 0.9 }}
                      >
                        {age}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Edit Interests */}
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-2">Interests (1-4)</p>
                  <div className="flex flex-wrap gap-2">
                    {interestOptions.map((interest) => {
                      const isSelected = editInterests.includes(interest.key);
                      return (
                        <motion.button
                          key={interest.key}
                          className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 font-bold text-xs cursor-pointer shadow-sm transition-all ${
                            isSelected
                              ? 'bg-grape text-white'
                              : 'bg-gray-50 text-gray-600'
                          }`}
                          onClick={() => handleToggleEditInterest(interest.key)}
                          whileTap={{ scale: 0.9 }}
                        >
                          <span>{interest.emoji}</span>
                          {interest.label}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Save / Cancel buttons */}
                <div className="flex gap-3 pt-1">
                  <motion.button
                    className="flex-1 bg-gray-200 rounded-xl py-2.5 font-bold text-sm cursor-pointer"
                    onClick={() => setEditingProfile(false)}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    className={`flex-1 rounded-xl py-2.5 font-bold text-sm cursor-pointer text-white shadow-md ${
                      saveSuccess ? 'bg-leaf' : 'bg-grape'
                    } disabled:opacity-40`}
                    onClick={handleSaveProfile}
                    disabled={!editName.trim() || savingProfile}
                    whileTap={{ scale: 0.95 }}
                  >
                    {savingProfile ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Changes'}
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-gray-500 space-y-1"
              >
                {currentPlayer.age && (
                  <p>Age: {currentPlayer.age} ({currentPlayer.ageGroup})</p>
                )}
                {currentPlayer.interests && currentPlayer.interests.length > 0 && (
                  <p>Interests: {currentPlayer.interests.map((key) => {
                    const found = interestOptions.find((o) => o.key === key);
                    return found ? `${found.emoji} ${found.label}` : key;
                  }).join(', ')}</p>
                )}
                {!currentPlayer.age && (!currentPlayer.interests || currentPlayer.interests.length === 0) && (
                  <p className="text-gray-400 italic">No age or interests set yet</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Sound effects toggle */}
        <motion.div
          className="bg-white rounded-[20px] p-5 shadow-[0_2px_12px_rgba(45,45,58,0.06)] border border-[#F0EAE0]"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.05 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-[#2D2D3A]">{'\u{1F50A}'} Sound Effects</h3>
              <p className="text-sm text-[#9B9BAB]">Chimes, clicks, celebrations</p>
            </div>
            <ToggleSwitch enabled={soundEnabled} onToggle={() => setSoundEnabled(!soundEnabled)} />
          </div>
        </motion.div>

        {/* Speech toggle + Voice Picker */}
        <motion.div
          className="bg-white rounded-[20px] p-5 shadow-[0_2px_12px_rgba(45,45,58,0.06)] border border-[#F0EAE0]"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-[#2D2D3A]">{'\u{1F5E3}\u{FE0F}'} Voice (Text-to-Speech)</h3>
              <p className="text-sm text-[#9B9BAB]">Read letters, numbers, words aloud</p>
            </div>
            <ToggleSwitch enabled={speechEnabled} onToggle={() => setSpeechEnabled(!speechEnabled)} />
          </div>

          {speechEnabled && (
            <motion.div
              className="mt-4 pt-4 border-t border-[#F0EAE0]"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              <VoicePicker />
            </motion.div>
          )}
        </motion.div>

        {/* Accessibility */}
        <motion.div
          className="bg-white rounded-[20px] p-5 shadow-[0_2px_12px_rgba(45,45,58,0.06)] border border-[#F0EAE0]"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.12 }}
        >
          <h3 className="text-[13px] font-extrabold text-[#6B6B7B] uppercase tracking-wider mb-3">{'\u267F'} Accessibility</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm text-[#2D2D3A]">Reduced Motion</p>
                <p className="text-xs text-[#9B9BAB]">Simplify animations</p>
              </div>
              <ToggleSwitch enabled={a11y.reducedMotion} onToggle={a11y.toggleReducedMotion} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm text-[#2D2D3A]">Larger Text</p>
                <p className="text-xs text-[#9B9BAB]">Scale text to 115%</p>
              </div>
              <ToggleSwitch enabled={a11y.largerText} onToggle={a11y.toggleLargerText} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm text-[#2D2D3A]">High Contrast</p>
                <p className="text-xs text-[#9B9BAB]">Darker borders &amp; bolder text</p>
              </div>
              <ToggleSwitch enabled={a11y.highContrast} onToggle={a11y.toggleHighContrast} />
            </div>
          </div>
        </motion.div>

        {/* Language */}
        <motion.div
          className="bg-white rounded-[20px] p-5 shadow-[0_2px_12px_rgba(45,45,58,0.06)] border border-[#F0EAE0]"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.14 }}
        >
          <h3 className="text-[13px] font-extrabold text-[#6B6B7B] uppercase tracking-wider mb-3">{'\u{1F310}'} Language</h3>
          <div className="flex flex-wrap gap-2">
            {languages.map((lang) => {
              const isSelected = (currentPlayer.preferredLocale ?? 'en') === lang.code;
              return (
                <motion.button
                  key={lang.code}
                  className={`px-3 py-2 rounded-xl flex items-center gap-2 font-bold text-sm cursor-pointer transition-all ${
                    isSelected ? 'bg-grape text-white shadow-md' : 'bg-gray-50 text-gray-600'
                  }`}
                  onClick={async () => {
                    if (currentPlayer.id) {
                      await db.profiles.update(currentPlayer.id, { preferredLocale: lang.code });
                      const refreshed = await getProfile(currentPlayer.id);
                      if (refreshed) setCurrentPlayer(refreshed);
                    }
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>{lang.emoji}</span>
                  <span>{lang.nativeLabel}</span>
                </motion.button>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 mt-2">More languages coming soon!</p>
        </motion.div>

        {/* Time-of-Day Mode */}
        <motion.div
          className="bg-white rounded-[20px] p-5 shadow-[0_2px_12px_rgba(45,45,58,0.06)] border border-[#F0EAE0]"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.16 }}
        >
          <h3 className="text-[13px] font-extrabold text-[#6B6B7B] uppercase tracking-wider mb-1">{'\u{23F0}'} Time-of-Day Mode</h3>
          <p className="text-xs text-[#9B9BAB] mb-3">Override auto-detection or use automatic</p>
          <div className="flex flex-wrap gap-2">
            <motion.button
              className={`px-3 py-2 rounded-xl font-bold text-sm cursor-pointer transition-all ${
                !currentPlayer.timeModeOverride ? 'bg-teal text-white shadow-md' : 'bg-gray-50 text-gray-600'
              }`}
              onClick={async () => {
                if (currentPlayer.id) {
                  await db.profiles.update(currentPlayer.id, { timeModeOverride: '' });
                  setTimeMode(timeMode);
                  const refreshed = await getProfile(currentPlayer.id);
                  if (refreshed) setCurrentPlayer(refreshed);
                }
              }}
              whileTap={{ scale: 0.95 }}
            >
              Auto
            </motion.button>
            {timeModes.map((mode) => {
              const isSelected = currentPlayer.timeModeOverride === mode.id;
              return (
                <motion.button
                  key={mode.id}
                  className={`px-3 py-2 rounded-xl flex items-center gap-1.5 font-bold text-sm cursor-pointer transition-all ${
                    isSelected ? 'bg-teal text-white shadow-md' : 'bg-gray-50 text-gray-600'
                  }`}
                  onClick={async () => {
                    if (currentPlayer.id) {
                      await db.profiles.update(currentPlayer.id, { timeModeOverride: mode.id });
                      setTimeMode(mode.id);
                      const refreshed = await getProfile(currentPlayer.id);
                      if (refreshed) setCurrentPlayer(refreshed);
                    }
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>{mode.emoji}</span>
                  <span>{mode.label}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* ─── Downloaded Content / Offline Packs ─── */}
        <motion.div
          className="bg-white rounded-[20px] p-5 shadow-[0_2px_12px_rgba(45,45,58,0.06)] border border-[#F0EAE0]"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.17 }}
        >
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-[13px] font-extrabold text-[#6B6B7B] uppercase tracking-wider">
              {'\u{1F4E5}'} Downloaded Content
            </h3>
          </div>
          <p className="text-xs text-[#9B9BAB] mb-4">Save content for trips and offline fun</p>

          {/* ── Storage Meter ── */}
          {(() => {
            const readyPacks = packs.filter(p => getPackStatus(p.id) === 'ready');
            const usedMB = readyPacks.reduce((s, p) => s + p.sizeEstimateMB, 0);
            const totalMB = 50;
            const pct = Math.min(100, (usedMB / totalMB) * 100);
            return (
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-[#6B6B7B]">Storage Used</span>
                  <span className="font-bold text-[#2D2D3A]">{usedMB.toFixed(1)} MB / {totalMB} MB</span>
                </div>
                <div className="w-full h-2.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-teal to-leaf"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6 }}
                  />
                </div>
              </div>
            );
          })()}

          {/* ── Available Offline Filter ── */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#9B9BAB]">Show downloaded only</span>
            <motion.button
              className={`w-12 h-7 rounded-full flex items-center px-0.5 cursor-pointer transition-colors ${
                showOnlyReady ? 'bg-leaf justify-end' : 'bg-[#E8E0D4] justify-start'
              }`}
              onClick={() => setShowOnlyReady(!showOnlyReady)}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div className="w-6 h-6 bg-white rounded-full shadow-sm" layout />
            </motion.button>
          </div>

          {/* ── Pack Cards ── */}
          {(() => {
            const filteredPacks = showOnlyReady
              ? packs.filter(p => getPackStatus(p.id) === 'ready')
              : packs;

            if (filteredPacks.length === 0) {
              return (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">{'\u2601\uFE0F'}</div>
                  <p className="text-sm font-bold text-[#2D2D3A] mb-1">No downloads yet</p>
                  <p className="text-xs text-[#9B9BAB] mb-4 max-w-[220px] mx-auto">Save content for trips and offline fun</p>
                  <motion.button
                    className="bg-teal text-white font-bold text-sm px-5 py-2.5 rounded-[14px] cursor-pointer shadow-[0_4px_16px_rgba(78,205,196,0.25)]"
                    onClick={() => setShowOnlyReady(false)}
                    whileTap={{ scale: 0.95 }}
                  >
                    Browse Packs
                  </motion.button>
                </div>
              );
            }

            return (
              <div className="space-y-2.5">
                {filteredPacks.map((pack) => {
                  const status = getPackStatus(pack.id);
                  const progress = getPackProgress(pack.id);
                  const cfg = statusConfig[status];
                  const gradient = packGradients[pack.id] || 'from-gray-100 to-gray-50';

                  return (
                    <motion.div
                      key={pack.id}
                      className="bg-[#FAFAFA] rounded-[16px] border border-[#F0EAE0] overflow-hidden"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      layout
                    >
                      <div className="flex items-center gap-3 p-3.5">
                        {/* Pack icon */}
                        <div className={`w-12 h-12 rounded-[14px] bg-gradient-to-br ${gradient} flex items-center justify-center text-2xl flex-shrink-0 shadow-sm`}>
                          {pack.emoji}
                        </div>

                        {/* Pack info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-sm font-bold text-[#2D2D3A] truncate">{pack.title}</p>
                            {pack.ageGroup && (
                              <span className="text-[9px] font-bold text-[#9B9BAB] bg-[#F1F5F9] px-1.5 py-0.5 rounded-full flex-shrink-0">
                                {pack.ageGroup}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-[#9B9BAB]">
                              {pack.sizeEstimateMB} MB
                            </span>
                            <span className="text-[11px] text-[#D1D5DB]">{'\u2022'}</span>
                            <span className="text-[11px] font-bold text-[#9B9BAB]">
                              {pack.contentIds.length} items
                            </span>
                          </div>
                        </div>

                        {/* Status / Action */}
                        <div className="flex-shrink-0">
                          {status === 'available' && (
                            <motion.button
                              className="bg-teal text-white font-bold text-xs px-3.5 py-2 rounded-[10px] cursor-pointer shadow-[0_2px_8px_rgba(78,205,196,0.2)]"
                              onClick={() => downloadPack(pack.id)}
                              whileTap={{ scale: 0.93 }}
                            >
                              {'\u2B07\uFE0F'} Get
                            </motion.button>
                          )}
                          {status === 'downloading' && (
                            <span className={`inline-flex items-center gap-1 ${cfg.bg} ${cfg.color} text-[10px] font-bold px-2.5 py-1.5 rounded-full`}>
                              {progress}%
                            </span>
                          )}
                          {status === 'ready' && (
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center gap-1 ${cfg.bg} ${cfg.color} text-[10px] font-bold px-2.5 py-1.5 rounded-full`}>
                                {cfg.icon} {cfg.label}
                              </span>
                              <motion.button
                                className="text-[#C8C8D4] hover:text-coral transition-colors cursor-pointer text-xs"
                                onClick={() => removePack(pack.id)}
                                whileTap={{ scale: 0.9 }}
                                title="Remove"
                              >
                                {'\u2715'}
                              </motion.button>
                            </div>
                          )}
                          {status === 'error' && (
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center gap-1 ${cfg.bg} ${cfg.color} text-[10px] font-bold px-2.5 py-1.5 rounded-full`}>
                                {cfg.icon} {cfg.label}
                              </span>
                              <motion.button
                                className="text-teal text-[11px] font-bold cursor-pointer underline"
                                onClick={() => downloadPack(pack.id)}
                                whileTap={{ scale: 0.95 }}
                              >
                                Retry
                              </motion.button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Download Progress Bar */}
                      {status === 'downloading' && (
                        <div className="px-3.5 pb-3">
                          <div className="w-full h-1.5 bg-[#E8E0D4] rounded-full overflow-hidden">
                            <motion.div
                              className="h-full rounded-full bg-gradient-to-r from-teal to-leaf"
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 0.2 }}
                            />
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            );
          })()}

          {/* ── Recommended Packs ── */}
          <div className="mt-5 pt-4 border-t border-[#F0EAE0]">
            <h4 className="text-[12px] font-extrabold text-[#9B9BAB] uppercase tracking-wider mb-3">Recommended Packs</h4>
            <div className="space-y-2.5">
              {recommendedPacks.map((rec) => {
                const pack = packs.find(p => p.id === rec.id);
                if (!pack) return null;
                const status = getPackStatus(rec.id);

                return (
                  <div
                    key={rec.id}
                    className="bg-gradient-to-r from-teal-soft to-white rounded-[14px] border border-teal/10 p-3.5 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-[12px] bg-white/80 flex items-center justify-center text-xl shadow-sm flex-shrink-0">
                      {rec.tagEmoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-extrabold text-teal">{rec.tagline}</p>
                      <p className="text-[11px] text-[#9B9BAB] leading-snug">{rec.description}</p>
                      <p className="text-[10px] font-bold text-[#C8C8D4] mt-0.5">{pack.sizeEstimateMB} MB</p>
                    </div>
                    {status === 'ready' ? (
                      <span className="text-[10px] font-bold text-leaf bg-leaf-soft px-2.5 py-1 rounded-full flex-shrink-0">
                        {'\u2705'} Saved
                      </span>
                    ) : status === 'downloading' ? (
                      <span className="text-[10px] font-bold text-teal bg-teal-soft px-2.5 py-1 rounded-full flex-shrink-0">
                        {getPackProgress(rec.id)}%
                      </span>
                    ) : (
                      <motion.button
                        className="bg-teal/10 text-teal font-bold text-[11px] px-3 py-1.5 rounded-[10px] cursor-pointer flex-shrink-0"
                        onClick={() => downloadPack(rec.id)}
                        whileTap={{ scale: 0.93 }}
                      >
                        {'\u2B07\uFE0F'} Save
                      </motion.button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Offline Fallback Messaging ── */}
          <div className="mt-4 pt-3 border-t border-[#F0EAE0]">
            <div className="flex items-start gap-2.5 bg-[#F8FAFC] rounded-[12px] p-3">
              <span className="text-lg flex-shrink-0">{'\u2601\uFE0F'}</span>
              <div>
                <p className="text-[11px] font-bold text-[#6B6B7B] mb-0.5">About offline access</p>
                <p className="text-[10px] text-[#9B9BAB] leading-relaxed">
                  Downloaded packs work without internet. Content not downloaded will show a
                  &quot;This needs internet&quot; message with an option to save it for offline.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* About */}
        <motion.div
          className="bg-white rounded-[20px] p-5 shadow-[0_2px_12px_rgba(45,45,58,0.06)] border border-[#F0EAE0]"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.18 }}
        >
          <h3 className="text-[13px] font-extrabold text-[#6B6B7B] uppercase tracking-wider mb-2">About</h3>
          <p className="text-sm text-[#6B6B7B]">Kids Learning Fun v6.0</p>
          <p className="text-sm text-[#6B6B7B]">A fun learning app for kids ages 2+</p>
          <p className="text-sm text-[#9B9BAB] mt-1">Works offline after install!</p>
        </motion.div>

        {/* Danger zone */}
        <motion.div
          className="bg-[#FFF0F0] rounded-[20px] p-5 shadow-[0_2px_12px_rgba(255,107,107,0.08)] border border-coral/20"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-[13px] font-extrabold text-coral uppercase tracking-wider mb-3">Danger Zone</h3>
          {!showDeleteConfirm ? (
            <motion.button
              className="w-full bg-coral/10 text-coral rounded-xl py-3 font-bold cursor-pointer"
              onClick={() => setShowDeleteConfirm(true)}
              whileTap={{ scale: 0.95 }}
            >
              Delete This Profile
            </motion.button>
          ) : (
            <div>
              <p className="text-sm text-gray-600 mb-3">
                Permanently delete {currentPlayer.name}&apos;s profile and all progress?
              </p>
              <div className="flex gap-3">
                <motion.button
                  className="flex-1 bg-gray-200 rounded-xl py-2 font-bold cursor-pointer text-sm"
                  onClick={() => setShowDeleteConfirm(false)}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  className="flex-1 bg-coral text-white rounded-xl py-2 font-bold cursor-pointer text-sm"
                  onClick={handleDeleteProfile}
                  whileTap={{ scale: 0.95 }}
                >
                  Yes, Delete
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>

        {/* New Settings Links */}
        <div className="space-y-3 mt-6">
          <h3 className="text-[13px] font-extrabold text-[#6B6B7B] uppercase tracking-wider">Account & Support</h3>
          <button
            onClick={() => navigate('/billing')}
            className="w-full bg-white rounded-[20px] shadow-[0_2px_12px_rgba(45,45,58,0.06)] border border-[#F0EAE0] p-4 flex items-center justify-between hover:shadow-[0_8px_24px_rgba(45,45,58,0.10)] transition-shadow duration-200"
          >
            <span className="flex items-center gap-3">
              <span className="text-2xl">💳</span>
              <span className="font-bold text-[#2D2D3A]">Billing & Subscription</span>
            </span>
            <span className="text-[#E8E0D4]">›</span>
          </button>
          <button
            onClick={() => navigate('/privacy')}
            className="w-full bg-white rounded-[20px] shadow-[0_2px_12px_rgba(45,45,58,0.06)] border border-[#F0EAE0] p-4 flex items-center justify-between hover:shadow-[0_8px_24px_rgba(45,45,58,0.10)] transition-shadow duration-200"
          >
            <span className="flex items-center gap-3">
              <span className="text-2xl">🔒</span>
              <span className="font-bold text-[#2D2D3A]">Privacy & Data</span>
            </span>
            <span className="text-[#E8E0D4]">›</span>
          </button>
          <button
            onClick={() => navigate('/help')}
            className="w-full bg-white rounded-[20px] shadow-[0_2px_12px_rgba(45,45,58,0.06)] border border-[#F0EAE0] p-4 flex items-center justify-between hover:shadow-[0_8px_24px_rgba(45,45,58,0.10)] transition-shadow duration-200"
          >
            <span className="flex items-center gap-3">
              <span className="text-2xl">❓</span>
              <span className="font-bold text-[#2D2D3A]">Help Center</span>
            </span>
            <span className="text-[#E8E0D4]">›</span>
          </button>
        </div>
      </div>
    </div>
  );
}
