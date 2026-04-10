import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Navigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { useApp } from '../context/AppContext';
import { useAudio } from '../hooks/useAudio';
import { db } from '../db/database';
import NavButton from '../components/NavButton';
import StarCounter from '../components/StarCounter';
import AnimatedBackground from '../components/svg/AnimatedBackground';
import MascotLion from '../components/svg/MascotLion';
import ConfettiCelebration from '../components/ConfettiCelebration';
import StoryIllustration from '../components/StoryIllustration';
import { stopSpeaking as stopAIVoice } from '../services/ttsService';
import {
  storiesData,
  storyCategories,
  getStoriesByAge,
  getStoryById,
  type Story,
  type StoryPage,
} from '../data/storiesData';

type AgeGroup = '2-3' | '4-5' | '6-8';
type CategoryKey = 'adventure' | 'animals' | 'bedtime' | 'friendship' | 'nature';
type ViewMode = 'library' | 'reader' | 'complete';

const ageGroups: (AgeGroup | 'all')[] = ['all', '2-3', '4-5', '6-8'];
const ageLabels: Record<AgeGroup | 'all', string> = {
  'all': 'All Ages',
  '2-3': 'Ages 2-3',
  '4-5': 'Ages 4-5',
  '6-8': 'Ages 6-8',
};

export default function StoriesPage() {
  const navigate = useNavigate();
  const { currentPlayer, showCelebration, showStarBurst } = useApp();
  const { speak, playCorrect, playCelebration } = useAudio();

  // Library state
  const [selectedAge, setSelectedAge] = useState<AgeGroup | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | 'all'>('all');

  // Reader state
  const [viewMode, setViewMode] = useState<ViewMode>('library');
  const [activeStoryId, setActiveStoryId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [autoRead, setAutoRead] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [spokenWordIndex, setSpokenWordIndex] = useState(-1);
  const [turnDirection, setTurnDirection] = useState<'next' | 'prev'>('next');
  const [showingCover, setShowingCover] = useState(true);

  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  const playerId = currentPlayer?.id;

  // Live query for all story progress for this player
  const allProgress = useLiveQuery(
    () => (playerId ? db.storyProgress.where('playerId').equals(playerId).toArray() : []),
    [playerId]
  );

  const progressMap = useMemo(() => {
    const map = new Map<string, typeof allProgress extends (infer T)[] | undefined ? T : never>();
    allProgress?.forEach((p) => map.set(p.storyId, p));
    return map;
  }, [allProgress]);

  if (!currentPlayer) return <Navigate to="/" replace />;

  const confirmedPlayerId = playerId!;

  // Active story data
  const activeStory = activeStoryId ? getStoryById(activeStoryId) : null;
  const activeProgress = activeStoryId ? progressMap.get(activeStoryId) : null;

  // Filtered stories for library
  const filteredStories = useMemo(() => {
    let stories = selectedAge === 'all' ? storiesData : getStoriesByAge(selectedAge as AgeGroup);
    if (selectedCategory !== 'all') {
      stories = stories.filter((s) => s.category === selectedCategory);
    }
    return stories;
  }, [selectedAge, selectedCategory]);

  // Stories with reading progress (continue reading rail)
  const continueReadingStories = useMemo(() => {
    return filteredStories.filter((s) => {
      const p = progressMap.get(s.id);
      return p && !p.completed && p.currentPage > 0;
    });
  }, [filteredStories, progressMap]);

  // Featured stories (first 6 for the horizontal rail)
  const featuredStories = useMemo(() => {
    return filteredStories.slice(0, 6);
  }, [filteredStories]);

  // Font size based on age group
  const readerTextClass = useMemo(() => {
    if (!activeStory) return 'text-xl';
    return activeStory.ageGroup === '2-3' ? 'text-2xl' : 'text-xl';
  }, [activeStory]);

  // Cancel speech on unmount or view change
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      stopAIVoice();
    };
  }, []);

  // Stop speech when leaving reader
  useEffect(() => {
    if (viewMode !== 'reader' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setSpokenWordIndex(-1);
    }
  }, [viewMode]);

  // Auto-read: read aloud and auto-advance to next page when done
  const autoAdvanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (autoAdvanceRef.current) {
      clearTimeout(autoAdvanceRef.current);
      autoAdvanceRef.current = null;
    }
    if (autoRead && viewMode === 'reader' && activeStory) {
      const pageData = activeStory.pages[currentPage];
      if (!pageData) return;
      const wordCount = pageData.text.split(/\s+/).length;
      const avgWordDuration = activeStory.ageGroup === '2-3' ? 420 : 350;

      // Start reading after a short delay
      const readTimer = setTimeout(() => {
        handleReadAloud();
      }, 500);

      // Auto-advance to next page after speech finishes + pause
      const totalReadTime = wordCount * avgWordDuration + 1500; // extra pause before turning
      autoAdvanceRef.current = setTimeout(() => {
        if (activeStory && currentPage < activeStory.pages.length - 1) {
          goToPage(currentPage + 1);
        } else if (activeStory && currentPage >= activeStory.pages.length - 1) {
          completeStory();
        }
      }, totalReadTime);

      return () => {
        clearTimeout(readTimer);
        if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
      };
    }
  }, [currentPage, autoRead, viewMode, activeStoryId]);

  // Open a story
  const openStory = useCallback(
    async (storyId: string) => {
      const story = getStoryById(storyId);
      if (!story) return;

      // Create or update progress record
      const existing = await db.storyProgress
        .where('[playerId+storyId]')
        .equals([confirmedPlayerId, storyId])
        .first();

      if (existing) {
        await db.storyProgress.update(existing.id!, {
          lastReadAt: new Date(),
        });
        setCurrentPage(existing.completed ? 0 : existing.currentPage);
      } else {
        await db.storyProgress.add({
          playerId: confirmedPlayerId,
          storyId,
          currentPage: 0,
          totalPages: story.pages.length,
          completed: false,
          favorite: false,
          lastReadAt: new Date(),
        });
        setCurrentPage(0);
      }

      setActiveStoryId(storyId);
      setViewMode('reader');
      setShowingCover(true);
      setSpokenWordIndex(-1);
      setIsSpeaking(false);
    },
    [confirmedPlayerId]
  );

  // Save current page progress
  const savePageProgress = useCallback(
    async (page: number) => {
      if (!activeStoryId) return;
      const existing = await db.storyProgress
        .where('[playerId+storyId]')
        .equals([confirmedPlayerId, activeStoryId])
        .first();
      if (existing) {
        await db.storyProgress.update(existing.id!, {
          currentPage: page,
          lastReadAt: new Date(),
        });
      }
    },
    [confirmedPlayerId, activeStoryId]
  );

  // Complete a story
  const completeStory = useCallback(async () => {
    if (!activeStoryId) return;
    const existing = await db.storyProgress
      .where('[playerId+storyId]')
      .equals([confirmedPlayerId, activeStoryId])
      .first();

    const wasAlreadyCompleted = existing?.completed;

    if (existing) {
      await db.storyProgress.update(existing.id!, {
        completed: true,
        lastReadAt: new Date(),
      });
    }

    // Award star only on first completion
    if (!wasAlreadyCompleted) {
      await db.stars.add({
        playerId: confirmedPlayerId,
        category: 'stories',
        starsEarned: 1,
        reason: `Completed story: ${activeStory?.title}`,
        earnedAt: new Date(),
      });
      const profile = await db.profiles.get(confirmedPlayerId);
      if (profile) {
        await db.profiles.update(confirmedPlayerId, {
          totalStars: (profile.totalStars ?? 0) + 1,
        });
      }
      showStarBurst();
    }

    showCelebration();
    playCelebration();
    setViewMode('complete');
  }, [confirmedPlayerId, activeStoryId, activeStory, showCelebration, showStarBurst, playCelebration]);

  // Word highlight timer ref
  const wordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Stop reading — defined first so goToPage and handleReadAloud can use it
  const stopReading = useCallback(() => {
    stopAIVoice();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (wordTimerRef.current) {
      clearInterval(wordTimerRef.current);
      wordTimerRef.current = null;
    }
    setIsSpeaking(false);
    setSpokenWordIndex(-1);
  }, []);

  // Navigate pages
  const goToPage = useCallback(
    (page: number) => {
      if (!activeStory) return;
      stopReading();

      if (page >= activeStory.pages.length) {
        completeStory();
        return;
      }

      setTurnDirection(page > currentPage ? 'next' : 'prev');
      setCurrentPage(page);
      savePageProgress(page);
    },
    [activeStory, completeStory, savePageProgress, currentPage, stopReading]
  );

  // Read aloud using AI TTS voice with timed word highlighting
  const handleReadAloud = useCallback(() => {
    if (!activeStory) return;

    const pageData = activeStory.pages[currentPage];
    if (!pageData) return;

    // Stop any current speech
    stopReading();

    const words = pageData.text.split(/\s+/);
    const avgWordDuration = activeStory.ageGroup === '2-3' ? 420 : 350; // ms per word

    setIsSpeaking(true);
    setSpokenWordIndex(0);

    // Speak using the app's audio system (which uses AI voice if available)
    speak(pageData.text);

    // Animate word highlighting in sync
    let wordIdx = 0;
    wordTimerRef.current = setInterval(() => {
      wordIdx++;
      if (wordIdx >= words.length) {
        if (wordTimerRef.current) clearInterval(wordTimerRef.current);
        wordTimerRef.current = null;
        setIsSpeaking(false);
        setSpokenWordIndex(-1);
        return;
      }
      setSpokenWordIndex(wordIdx);
    }, avgWordDuration);
  }, [activeStory, currentPage, speak, stopReading]);

  // Toggle favorite
  const toggleFavorite = useCallback(
    async (storyId: string) => {
      const existing = await db.storyProgress
        .where('[playerId+storyId]')
        .equals([confirmedPlayerId, storyId])
        .first();

      if (existing) {
        await db.storyProgress.update(existing.id!, {
          favorite: !existing.favorite,
        });
      } else {
        const story = getStoryById(storyId);
        if (!story) return;
        await db.storyProgress.add({
          playerId: confirmedPlayerId,
          storyId,
          currentPage: 0,
          totalPages: story.pages.length,
          completed: false,
          favorite: true,
          lastReadAt: new Date(),
        });
      }
    },
    [confirmedPlayerId]
  );

  // Back to library
  const backToLibrary = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setSpokenWordIndex(-1);
    setActiveStoryId(null);
    setViewMode('library');
    setCurrentPage(0);
    setAutoRead(false);
  }, []);

  // Render highlighted text for a page
  const renderPageText = (page: StoryPage, wordIndex: number) => {
    const words = page.text.split(/(\s+)/);
    const highlightSet = new Set(page.highlightWords?.map((w) => w.toLowerCase()) ?? []);
    let realWordIdx = 0;

    return words.map((word, i) => {
      // Whitespace tokens
      if (/^\s+$/.test(word)) {
        return <span key={i}>{word}</span>;
      }

      const cleanWord = word.replace(/[^a-zA-Z'-]/g, '').toLowerCase();
      const isHighlight = highlightSet.has(cleanWord);
      const isCurrentSpoken = isSpeaking && realWordIdx === wordIndex;
      const idx = realWordIdx;
      realWordIdx++;

      return (
        <span
          key={i}
          className={`
            transition-all duration-150 inline
            ${isHighlight ? 'text-coral font-bold' : ''}
            ${isCurrentSpoken ? 'bg-sunny/40 rounded-md px-0.5 scale-105' : ''}
          `}
          style={isCurrentSpoken ? { display: 'inline', transform: 'scale(1.05)' } : undefined}
        >
          {word}
        </span>
      );
    });
  };

  // ===== LIBRARY VIEW =====
  if (viewMode === 'library') {
    return (
      <div className="min-h-dvh pb-24 md:pb-8 relative page-with-bg">
        <AnimatedBackground theme="stories" />
        {/* Premium Hero Banner */}
        <div
          className="relative overflow-hidden px-4 pt-4 pb-6 md:px-8 md:pb-8"
          style={{
            background: 'linear-gradient(180deg, #F3EFFE 0%, #FFF8F0 100%)',
          }}
        >
          {/* Floating decorative elements */}
          <div className="absolute top-6 right-6 text-[40px] opacity-[0.08] animate-float select-none pointer-events-none">
            📖
          </div>
          <div className="absolute bottom-4 left-8 text-[28px] opacity-[0.06] animate-bedtime-float-gentle select-none pointer-events-none">
            📄
          </div>
          <div className="absolute top-12 left-[40%] text-[20px] opacity-[0.05] animate-bedtime-float-slow select-none pointer-events-none">
            ✨
          </div>

          {/* Header */}
          <div className="flex items-center justify-between mb-5 relative z-10">
            <NavButton onClick={() => navigate('/menu')} direction="back" />
            <StarCounter />
          </div>

          {/* Hero content */}
          <div className="relative z-10 text-center">
            <motion.div
              className="text-[52px] mb-2 drop-shadow-md"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', duration: 0.5 }}
            >
              📚
            </motion.div>
            <motion.h1
              className="text-[28px] font-extrabold leading-tight mb-1"
              style={{
                background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 50%, #7C3AED 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              Story Time
            </motion.h1>
            <motion.p
              className="text-[13px] font-semibold text-[#9B9BAB]"
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Magical tales await
            </motion.p>
          </div>
        </div>

        <div className="px-4 md:px-8 md:max-w-3xl md:mx-auto">
          {/* Age Group Tabs — Premium grape pills */}
          <div className="flex gap-2 mb-3 mt-1 md:gap-3">
            {ageGroups.map((age) => (
              <motion.button
                key={age}
                className={`flex-1 py-2.5 rounded-full font-bold text-sm cursor-pointer transition-all border ${
                  selectedAge === age
                    ? 'text-white shadow-[0_4px_16px_rgba(167,139,250,0.3)] border-transparent'
                    : 'bg-white text-[#6B6B7B] shadow-sm border-[#F0EAE0]'
                }`}
                style={
                  selectedAge === age
                    ? { background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' }
                    : undefined
                }
                onClick={() => setSelectedAge(age)}
                whileTap={{ scale: 0.95 }}
              >
                {ageLabels[age]}
              </motion.button>
            ))}
          </div>

          {/* Category Filter Chips with emoji + soft tints */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide mb-4 md:flex-wrap md:mx-0 md:px-0 md:gap-3">
            <motion.button
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold cursor-pointer whitespace-nowrap border transition-all ${
                selectedCategory === 'all'
                  ? 'text-white shadow-[0_2px_12px_rgba(167,139,250,0.25)] border-transparent'
                  : 'bg-white text-[#6B6B7B] border-[#F0EAE0]'
              }`}
              style={
                selectedCategory === 'all'
                  ? { background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' }
                  : undefined
              }
              onClick={() => setSelectedCategory('all')}
              whileTap={{ scale: 0.95 }}
            >
              All Stories
            </motion.button>
            {storyCategories.map((cat) => (
              <motion.button
                key={cat.key}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold cursor-pointer whitespace-nowrap border transition-all ${
                  selectedCategory === cat.key
                    ? 'text-white shadow-[0_2px_12px_rgba(167,139,250,0.25)] border-transparent'
                    : 'bg-white text-[#6B6B7B] border-[#F0EAE0] hover:bg-[#F3EFFE]/50'
                }`}
                style={
                  selectedCategory === cat.key
                    ? { background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' }
                    : undefined
                }
                onClick={() => setSelectedCategory(cat.key as CategoryKey)}
                whileTap={{ scale: 0.95 }}
              >
                {cat.emoji} {cat.label}
              </motion.button>
            ))}
          </div>

          {/* Continue Reading Rail */}
          {continueReadingStories.length > 0 && (
            <div className="mb-5">
              <h3 className="text-[13px] font-extrabold text-[#6B6B7B] uppercase tracking-wider mb-2.5">
                📖 Pick up where you left off
              </h3>
              <div className="flex gap-3 overflow-x-auto -mx-4 px-4 pb-2 scrollbar-hide">
                {continueReadingStories.map((story, i) => {
                  const progress = progressMap.get(story.id);
                  const pctRead = progress
                    ? Math.round((progress.currentPage / progress.totalPages) * 100)
                    : 0;
                  return (
                    <motion.button
                      key={story.id}
                      className="flex-shrink-0 w-44 bg-white rounded-[18px] shadow-[0_2px_12px_rgba(45,45,58,0.06)] border border-[#F0EAE0] p-4 text-left cursor-pointer relative overflow-hidden"
                      style={{
                        borderLeft: '4px solid #A78BFA',
                      }}
                      onClick={() => openStory(story.id)}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <div className="text-3xl mb-2">{story.emoji}</div>
                      <p className="font-bold text-[#2D2D3A] text-sm leading-tight line-clamp-2 mb-2">
                        {story.title}
                      </p>
                      {/* Gradient progress bar */}
                      <div className="w-full bg-[#F0EAE0]/60 rounded-full h-1.5 mb-1">
                        <div
                          className="h-1.5 rounded-full transition-all"
                          style={{
                            width: `${pctRead}%`,
                            background: 'linear-gradient(90deg, #A78BFA, #8B5CF6)',
                          }}
                        />
                      </div>
                      <p className="text-[10px] font-semibold text-[#9B9BAB]">{pctRead}% read</p>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Featured Stories Rail */}
          {featuredStories.length > 0 && selectedCategory === 'all' && (
            <div className="mb-5">
              <h3 className="text-[13px] font-extrabold text-[#6B6B7B] uppercase tracking-wider mb-2.5">
                ✨ Featured Stories
              </h3>
              <div className="flex gap-3 overflow-x-auto -mx-4 px-4 pb-2 scrollbar-hide">
                {featuredStories.map((story, i) => {
                  const progress = progressMap.get(story.id);
                  const isCompleted = progress?.completed ?? false;
                  const catData = storyCategories.find((c) => c.key === story.category);
                  return (
                    <motion.button
                      key={story.id}
                      className="flex-shrink-0 w-52 bg-white rounded-[20px] shadow-[0_4px_20px_rgba(45,45,58,0.08)] border border-[#F0EAE0] text-left cursor-pointer relative overflow-hidden hover:shadow-[0_8px_28px_rgba(45,45,58,0.12)] transition-shadow duration-200"
                      style={{
                        borderLeft: '4px solid #A78BFA',
                        background: 'linear-gradient(180deg, #FFFFFF 0%, #FDFBFF 100%)',
                      }}
                      onClick={() => openStory(story.id)}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      whileHover={{ scale: 1.03, y: -3 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {/* Top color accent */}
                      <div
                        className="h-20 flex items-center justify-center relative"
                        style={{
                          background: 'linear-gradient(135deg, #F3EFFE 0%, #EDE5FF 100%)',
                        }}
                      >
                        <span className="text-5xl drop-shadow-md">{story.emoji}</span>
                        {isCompleted && (
                          <span className="absolute top-2 right-2 text-sm bg-white/80 rounded-full w-6 h-6 flex items-center justify-center shadow-sm">
                            ✅
                          </span>
                        )}
                      </div>
                      <div className="p-3.5 pt-3">
                        <h4 className="font-extrabold text-[#2D2D3A] text-[15px] leading-tight mb-1.5 line-clamp-2">
                          {story.title}
                        </h4>
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize"
                          style={{
                            background: '#F3EFFE',
                            color: '#7C3AED',
                          }}
                        >
                          {catData?.emoji} {story.category}
                        </span>
                        <p className="text-[11px] text-[#9B9BAB] mt-1.5 font-medium">
                          {story.pages.length} pages
                        </p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section Header for All Stories */}
          <h3 className="text-[13px] font-extrabold text-[#6B6B7B] uppercase tracking-wider mb-3">
            📚 All Stories
          </h3>

          {/* Story Cards Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${selectedAge}-${selectedCategory}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5"
            >
              {filteredStories.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-5xl mb-3">📚</p>
                  <p className="text-[#6B6B7B] font-medium">No stories found</p>
                  <p className="text-[#9B9BAB] text-sm mt-1">Try a different category</p>
                </div>
              ) : (
                filteredStories.map((story, i) => {
                  const progress = progressMap.get(story.id);
                  const isCompleted = progress?.completed ?? false;
                  const isFavorite = progress?.favorite ?? false;
                  const catData = storyCategories.find((c) => c.key === story.category);

                  return (
                    <motion.button
                      key={story.id}
                      className="bg-white rounded-[20px] shadow-[0_2px_12px_rgba(45,45,58,0.06)] border border-[#F0EAE0] p-5 text-left cursor-pointer relative overflow-hidden hover:shadow-[0_8px_24px_rgba(45,45,58,0.10)] transition-shadow duration-200"
                      style={{
                        background: 'linear-gradient(180deg, #FFFFFF 0%, #FDFBFF 100%)',
                        borderLeft: '4px solid #A78BFA',
                      }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => openStory(story.id)}
                    >
                      {/* Status badges */}
                      <div className="absolute top-3 right-3 flex gap-1">
                        {isCompleted && (
                          <span className="text-sm bg-[#EDFAEF] rounded-full w-7 h-7 flex items-center justify-center shadow-sm border border-[#6BCB77]/20" title="Completed">
                            ✅
                          </span>
                        )}
                        {isFavorite && (
                          <span className="text-sm bg-[#FFF0F0] rounded-full w-7 h-7 flex items-center justify-center shadow-sm border border-[#FF6B6B]/20" title="Favorite">
                            ❤️
                          </span>
                        )}
                      </div>

                      {/* Emoji */}
                      <div className="text-5xl mb-3 drop-shadow-md">{story.emoji}</div>

                      {/* Title */}
                      <h3 className="font-extrabold text-[#2D2D3A] text-base leading-tight mb-1.5">
                        {story.title}
                      </h3>

                      {/* Category badge */}
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize"
                        style={{
                          background: '#F3EFFE',
                          color: '#7C3AED',
                        }}
                      >
                        {catData?.emoji} {story.category}
                      </span>

                      {/* Page count */}
                      <p className="text-xs text-[#9B9BAB] mt-1.5 font-medium">
                        {story.pages.length} pages
                      </p>

                      {/* Reading progress bar if partially read */}
                      {progress && !progress.completed && progress.currentPage > 0 && (
                        <div className="mt-2.5 w-full bg-[#F0EAE0]/60 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all"
                            style={{
                              width: `${Math.round(
                                (progress.currentPage / progress.totalPages) * 100
                              )}%`,
                              background: 'linear-gradient(90deg, #A78BFA, #8B5CF6)',
                            }}
                          />
                        </div>
                      )}
                    </motion.button>
                  );
                })
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // ===== STORY COMPLETE VIEW =====
  if (viewMode === 'complete' && activeStory) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center p-6 relative page-with-bg">
        <AnimatedBackground theme="stories" />
        <ConfettiCelebration
          message={`You finished ${activeStory.title}!`}
          stars={1}
          onDismiss={() => {}}
          autoDismissMs={60000}
        />

        <motion.div
          className="text-center max-w-sm relative z-10"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
        >
          <MascotLion size={120} expression="celebrating" animated />

          <h2 className="font-display text-3xl text-[#2D2D3A] mt-4 mb-2">Great Reading!</h2>

          <p className="text-[15px] font-bold text-[#6B6B7B] mb-6">
            You finished <span style={{ color: '#A78BFA' }}>{activeStory.title}</span>!
          </p>

          <div className="flex flex-col gap-3">
            <motion.button
              className="w-full btn-primary text-lg"
              onClick={() => {
                setCurrentPage(0);
                setShowingCover(true);
                setViewMode('reader');
                savePageProgress(0);
              }}
              whileTap={{ scale: 0.97 }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Read Again
            </motion.button>

            <motion.button
              className="w-full btn-secondary text-lg"
              onClick={backToLibrary}
              whileTap={{ scale: 0.97 }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Choose New Story
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ===== READER VIEW — Book Style =====
  if (viewMode === 'reader' && activeStory) {
    const pageData = activeStory.pages[currentPage];
    const totalPages = activeStory.pages.length;
    const progressPercent = ((currentPage + 1) / totalPages) * 100;
    const isFavorite = activeProgress?.favorite ?? false;

    // Map story category to background theme
    const storyTheme = activeStory.category === 'bedtime' ? 'bedtime'
      : activeStory.category === 'nature' ? 'explore'
      : activeStory.category === 'adventure' ? 'animals'
      : 'stories';

    /* ── COVER PAGE ── */
    if (showingCover) {
      return (
        <div className="h-dvh flex flex-col items-center justify-center relative page-with-bg overflow-hidden">
          <AnimatedBackground theme={storyTheme as any} />

          <motion.div
            className="text-center max-w-sm px-6 relative z-10"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            {/* Story cover illustration */}
            <motion.div
              className="w-48 h-48 mx-auto mb-6 rounded-3xl flex items-center justify-center text-8xl"
              style={{
                background: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
              }}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {activeStory.emoji}
            </motion.div>

            {/* Title */}
            <h1
              className="font-display text-white mb-2"
              style={{ fontSize: 'clamp(2rem, 8vw, 3rem)', textShadow: '0 3px 12px rgba(0,0,0,0.3)' }}
            >
              {activeStory.title}
            </h1>

            {/* Category badge */}
            <motion.span
              className="inline-block px-4 py-1.5 rounded-full font-display text-sm text-white mb-8"
              style={{ background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)' }}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {activeStory.category}
            </motion.span>

            {/* Sparkle decorations */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[
                { top: '10%', left: '15%', delay: 0 },
                { top: '20%', right: '10%', delay: 0.5 },
                { top: '70%', left: '20%', delay: 1 },
                { top: '80%', right: '15%', delay: 1.5 },
              ].map((s, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-full bg-white animate-sparkle"
                  style={{ top: s.top, left: 'left' in s ? s.left : undefined, right: 'right' in s ? s.right : undefined, animationDelay: `${s.delay}s` }}
                />
              ))}
            </div>

            {/* Start Reading button */}
            <motion.button
              className="btn-primary text-xl px-10 py-4 animate-glow-pulse"
              onClick={() => setShowingCover(false)}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Reading
              <motion.span
                className="inline-block ml-2"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                &#8594;
              </motion.span>
            </motion.button>

            {/* Back to library */}
            <motion.button
              className="block mt-4 text-white/70 font-bold text-sm cursor-pointer mx-auto"
              onClick={backToLibrary}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              Back to Library
            </motion.button>
          </motion.div>
        </div>
      );
    }

    /* ── READER VIEW ── */
    return (
      <div className="h-dvh flex flex-col overflow-hidden relative page-with-bg">
        {/* Immersive animated background */}
        <AnimatedBackground theme={storyTheme as any} />

        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 pt-3 pb-2 relative z-10">
          <motion.button
            className="w-11 h-11 rounded-full flex items-center justify-center cursor-pointer text-white"
            style={{ background: 'rgba(78,205,196,0.9)', boxShadow: '0 2px 10px rgba(78,205,196,0.3)' }}
            onClick={backToLibrary}
            whileTap={{ scale: 0.9 }}
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.button>

          <div className="flex-1 mx-3 text-center">
            <p className="font-display text-sm text-white truncate" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>{activeStory.title}</p>
            <p className="text-[10px] text-white/70">Page {currentPage + 1} of {totalPages}</p>
          </div>

          <motion.button
            className="w-11 h-11 rounded-full flex items-center justify-center cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}
            onClick={() => toggleFavorite(activeStory.id)}
            whileTap={{ scale: 0.8 }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill={isFavorite ? '#FF6B6B' : 'none'} stroke={isFavorite ? '#FF6B6B' : 'white'} strokeWidth="1.5">
              <path d="M10 17S2 12 2 7.5C2 4.5 4.5 2.5 7 2.5C8.5 2.5 9.5 3.5 10 4.5C10.5 3.5 11.5 2.5 13 2.5C15.5 2.5 18 4.5 18 7.5C18 12 10 17 10 17Z" />
            </svg>
          </motion.button>
        </div>

        {/* Book container */}
        <div className="flex-1 flex items-center justify-center px-4 pb-2 overflow-hidden relative z-10">
          <div className="relative w-full max-w-lg" style={{ perspective: '1200px' }}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={currentPage}
                className="relative rounded-3xl overflow-hidden"
                style={{
                  background: '#FDF6E3',
                  boxShadow: '0 8px 40px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.08)',
                  minHeight: '480px',
                }}
                initial={{ x: turnDirection === 'next' ? 120 : -120, opacity: 0, rotateY: turnDirection === 'next' ? 8 : -8 }}
                animate={{ x: 0, opacity: 1, rotateY: 0 }}
                exit={{ x: turnDirection === 'next' ? -120 : 120, opacity: 0, rotateY: turnDirection === 'next' ? -8 : 8 }}
                transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                {/* Warm parchment texture overlay */}
                <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 30% 20%, rgba(255,230,180,0.4), transparent 70%)' }} />

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center justify-center text-center px-8 py-10" style={{ minHeight: '480px' }}>
                  {/* Storybook illustration */}
                  <StoryIllustration emoji={pageData.emoji} color="#A78BFA" />

                  {/* Story text */}
                  <motion.div
                    className="max-w-md mt-4"
                    initial={{ y: 15, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                  >
                    <p className={`${readerTextClass} leading-[1.9] text-[#3D3425] font-medium`} style={{ fontFamily: "'Nunito', Georgia, serif" }}>
                      {renderPageText(pageData, spokenWordIndex)}
                    </p>
                  </motion.div>

                  {/* Page number */}
                  <p className="absolute bottom-5 font-display text-sm text-[#BBA88A]">
                    {currentPage + 1}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom controls */}
        <div className="flex-shrink-0 px-4 pb-4 pt-1 relative z-10">
          {/* Smooth progress bar */}
          <div className="flex items-center gap-2 mb-3 px-1">
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.2)' }}>
              <div
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #FFE66D, #FF8C42, #FF6B6B)',
                  width: `${progressPercent}%`,
                  transition: 'width 0.5s ease',
                }}
              />
            </div>
          </div>

          {/* Controls row */}
          <div className="flex items-center justify-between gap-3">
            {/* Prev — large round blue button */}
            <motion.button
              className="w-[60px] h-[60px] rounded-full flex items-center justify-center cursor-pointer disabled:opacity-25 text-white"
              style={{ background: 'linear-gradient(135deg, #45B7D1, #38A3C0)', boxShadow: '0 4px 16px rgba(69,183,209,0.3)' }}
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 0}
              whileTap={{ scale: 0.9 }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.button>

            {/* Center controls */}
            <div className="flex items-center gap-2">
              {/* Read aloud */}
              <motion.button
                className={`flex items-center gap-1.5 px-5 py-3 rounded-full font-display text-sm cursor-pointer ${isSpeaking ? 'text-white' : 'text-white/80'}`}
                style={
                  isSpeaking
                    ? { background: 'linear-gradient(135deg, #A78BFA, #8B5CF6)', boxShadow: '0 4px 14px rgba(167,139,250,0.4)' }
                    : { background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }
                }
                onClick={isSpeaking ? stopReading : handleReadAloud}
                whileTap={{ scale: 0.95 }}
              >
                {isSpeaking ? (
                  <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
                  </motion.span>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 22 22" fill="none"><path d="M3 8V14H6L10 17V5L6 8H3Z" fill="white"/><path d="M13 8C14 9.5 14 12.5 13 14" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
                )}
                <span>{isSpeaking ? 'Pause' : 'Read'}</span>
              </motion.button>

              {/* Auto toggle */}
              <motion.button
                className={`px-4 py-3 rounded-full font-display text-xs cursor-pointer ${autoRead ? 'text-white' : 'text-white/60'}`}
                style={
                  autoRead
                    ? { background: 'linear-gradient(135deg, #4ECDC4, #3DBDB4)', boxShadow: '0 2px 10px rgba(78,205,196,0.3)' }
                    : { background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }
                }
                onClick={() => setAutoRead(!autoRead)}
                whileTap={{ scale: 0.95 }}
              >
                Auto
              </motion.button>
            </div>

            {/* Next — large round coral button */}
            <motion.button
              className="w-[60px] h-[60px] rounded-full flex items-center justify-center cursor-pointer text-white"
              style={{ background: 'linear-gradient(135deg, #FF6B6B, #FF8E8E)', boxShadow: '0 4px 16px rgba(255,107,107,0.3)' }}
              onClick={() => goToPage(currentPage + 1)}
              whileTap={{ scale: 0.9 }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 6L15 12L9 18" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  // Fallback - should not reach here
  return <Navigate to="/menu" replace />;
}
