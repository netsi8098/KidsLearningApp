import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useProgress } from '../hooks/useProgress';
import { useDailyMissions } from '../hooks/useDailyMissions';
import { useCharacter } from '../hooks/useCharacter';
import { useSeasonalContent } from '../hooks/useSeasonalContent';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { lessonsData } from '../data/lessonsData';
import { storiesData } from '../data/storiesData';
import { type MissionCategory } from '../data/missionTemplates';
import MenuTabBar, { type MenuTab } from '../components/MenuTabBar';
import MascotBubble from '../components/MascotBubble';
import MissionCard from '../components/MissionCard';
import SeasonalBanner from '../components/SeasonalBanner';
import FeaturedRail from '../components/FeaturedRail';
import BigTileButton from '../components/BigTileButton';
import StarCounter from '../components/StarCounter';
import NudgeBanner from '../components/NudgeBanner';
import { useNudges } from '../hooks/useNudges';
import { collections } from '../registry/collectionsConfig';
import AnimatedBackground from '../components/svg/AnimatedBackground';
import MascotLion from '../components/svg/MascotLion';
import { HomeIcon, LearnIcon, PlayIcon, CreateIcon, ListenIcon, WellbeingIcon, ExploreIcon } from '../components/svg/NavIcons';
import { AbcIcon, NumbersIcon, ColorsIcon, ShapesIcon, AnimalsIcon, BodyIcon, LessonsIcon, WorldIcon, QuizIcon, MatchingIcon, GamesIcon, MovementIcon } from '../components/svg/SubjectIcons';

/* ─── Tab definitions ──────────────────────────────────── */

const menuTabs: MenuTab[] = [
  { key: 'home', label: 'Home', emoji: '🏠' },
  { key: 'learn', label: 'Learn', emoji: '📚' },
  { key: 'play', label: 'Play', emoji: '🎮' },
  { key: 'create', label: 'Create', emoji: '🎨' },
  { key: 'listen', label: 'Listen', emoji: '🎧' },
  { key: 'wellbeing', label: 'Wellbeing', emoji: '💚' },
  { key: 'explore', label: 'Explore', emoji: '🌍' },
];

/* ─── SVG icon map for activity tiles ─────────────────── */
const tileIconMap: Record<string, React.ReactNode> = {
  '/abc': <AbcIcon size={56} />,
  '/numbers': <NumbersIcon size={56} />,
  '/colors': <ColorsIcon size={56} />,
  '/shapes': <ShapesIcon size={56} />,
  '/animals': <AnimalsIcon size={56} />,
  '/bodyparts': <BodyIcon size={56} />,
  '/lessons': <LessonsIcon size={56} />,
  '/explorer': <WorldIcon size={56} />,
  '/quiz': <QuizIcon size={56} />,
  '/matching': <MatchingIcon size={56} />,
  '/games': <GamesIcon size={56} />,
  '/movement': <MovementIcon size={56} />,
};

/* ─── Tile definitions per tab ─────────────────────────── */

const tabTiles: Record<string, { emoji: string; label: string; to: string; bgColor: string }[]> = {
  learn: [
    { emoji: '🔤', label: 'ABCs', to: '/abc', bgColor: '#FF6B6B' },
    { emoji: '🔢', label: 'Numbers', to: '/numbers', bgColor: '#4ECDC4' },
    { emoji: '🎨', label: 'Colors', to: '/colors', bgColor: '#FFB347' },
    { emoji: '🔷', label: 'Shapes', to: '/shapes', bgColor: '#A78BFA' },
    { emoji: '🐾', label: 'Animals', to: '/animals', bgColor: '#6BCB77' },
    { emoji: '🧍', label: 'Body', to: '/bodyparts', bgColor: '#F472B6' },
    { emoji: '📚', label: 'Lessons', to: '/lessons', bgColor: '#EC4899' },
    { emoji: '🌍', label: 'World', to: '/explorer', bgColor: '#0EA5E9' },
  ],
  play: [
    { emoji: '❓', label: 'Quiz', to: '/quiz', bgColor: '#FF8C42' },
    { emoji: '🃏', label: 'Matching', to: '/matching', bgColor: '#38BDF8' },
    { emoji: '🎮', label: 'Games', to: '/games', bgColor: '#F59E0B' },
    { emoji: '💃', label: 'Move & Dance', to: '/movement', bgColor: '#FF6B6B' },
  ],
  create: [
    { emoji: '🎨', label: 'Coloring', to: '/coloring', bgColor: '#A78BFA' },
    { emoji: '🖨️', label: 'Printables', to: '/printables', bgColor: '#0EA5E9' },
    { emoji: '🍪', label: 'Cooking', to: '/cooking', bgColor: '#FF8C42' },
  ],
  listen: [
    { emoji: '🎬', label: 'Videos', to: '/videos', bgColor: '#E11D48' },
    { emoji: '📖', label: 'Stories', to: '/stories', bgColor: '#8B5CF6' },
    { emoji: '🎧', label: 'Audio', to: '/audio', bgColor: '#4ECDC4' },
  ],
  wellbeing: [
    { emoji: '💚', label: 'Emotions', to: '/emotions', bgColor: '#6BCB77' },
    { emoji: '🌙', label: 'Bedtime', to: '/bedtime', bgColor: '#6366F1' },
  ],
  explore: [
    { emoji: '🏠', label: 'Home Fun', to: '/home-activities', bgColor: '#FF8C42' },
    { emoji: '🔍', label: 'Discover', to: '/discover', bgColor: '#4ECDC4' },
    { emoji: '🤖', label: "What's This?", to: '/ai/whats-this', bgColor: '#4ECDC4' },
    { emoji: '🎨', label: 'Drawing Detective', to: '/ai/drawing-detective', bgColor: '#A78BFA' },
    { emoji: '📖', label: 'Letter Reader', to: '/ai/letter-reader', bgColor: '#FF6B6B' },
    { emoji: '🌿', label: 'Nature Explorer', to: '/ai/nature-explorer', bgColor: '#6BCB77' },
    { emoji: '🌈', label: 'Color Finder', to: '/ai/color-finder', bgColor: '#FFD93D' },
  ],
};

/* ─── Continue Learning Card (Premium) ────────────────── */

function ContinueCard({
  emoji,
  title,
  progress,
  total,
  onClick,
}: {
  emoji: string;
  title: string;
  progress: number;
  total: number;
  onClick: () => void;
}) {
  const pct = Math.min(100, Math.round((progress / total) * 100));

  return (
    <motion.button
      className="flex-shrink-0 w-48 md:min-w-[200px] text-left cursor-pointer snap-start overflow-hidden"
      style={{
        borderRadius: 'var(--radius-card)',
        boxShadow: 'var(--shadow-card)',
        background: 'var(--color-surface-card)',
        border: '1px solid var(--color-border-subtle)',
      }}
      onClick={onClick}
      whileHover={{ scale: 1.03, boxShadow: 'var(--shadow-card-hover)' }}
      whileTap={{ scale: 0.97 }}
    >
      {/* Gradient accent bar */}
      <div
        className="h-1.5 w-full"
        style={{
          background: `linear-gradient(90deg, #4ECDC4, #A78BFA, #FF6B6B)`,
        }}
      />
      <div className="p-3.5">
        <div className="flex items-center gap-2.5 mb-3">
          <span className="text-2xl">{emoji}</span>
          <span className="text-sm font-bold text-text-primary truncate">{title}</span>
        </div>
        {/* Premium progress bar */}
        <div className="w-full rounded-full h-2.5 mb-2" style={{ background: 'var(--color-surface-muted)' }}>
          <motion.div
            className="h-2.5 rounded-full"
            style={{
              background: 'linear-gradient(90deg, #4ECDC4, #38BDF8)',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6 }}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-micro text-text-tertiary">{pct}% complete</span>
          <span className="text-[10px] font-bold text-coral">Continue →</span>
        </div>
      </div>
    </motion.button>
  );
}

/* ─── Section Header (Premium) ────────────────────────── */

function SectionHeader({ children, action }: { children: React.ReactNode; action?: { label: string; onClick: () => void } }) {
  return (
    <div className="flex items-center justify-between mb-3 md:mb-4">
      <h2 className="text-[13px] md:text-sm font-extrabold text-text-secondary uppercase tracking-wider">
        {children}
      </h2>
      {action && (
        <motion.button
          className="text-xs text-coral font-bold cursor-pointer"
          onClick={action.onClick}
          whileTap={{ scale: 0.95 }}
        >
          {action.label} →
        </motion.button>
      )}
    </div>
  );
}

/* ─── Mini Progress Circle ────────────────────────────── */

function MiniProgressCircle({ pct, color, label, detail }: { pct: number; color: string; label: string; detail: string }) {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-12 h-12">
        <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r={radius} fill="none" stroke="var(--color-surface-muted)" strokeWidth="4" />
          <motion.circle
            cx="24"
            cy="24"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[9px] font-extrabold text-text-primary">
          {pct}%
        </span>
      </div>
      <span className="text-[10px] font-bold text-text-secondary leading-tight text-center">{label}</span>
      <span className="text-[9px] text-text-tertiary">{detail}</span>
    </div>
  );
}

/* ─── Time-of-day section helpers ─────────────────────── */

type TimeSection = {
  key: string;
  label: string;
  emoji: string;
  tintBg: string;
  tintText: string;
  categories: MissionCategory[];
};

const timeSections: TimeSection[] = [
  {
    key: 'morning',
    label: 'Morning',
    emoji: '\u2600\uFE0F',
    tintBg: 'linear-gradient(135deg, #FFF3E0, #FFFBF6)',
    tintText: '#E65100',
    categories: ['play', 'explore'],
  },
  {
    key: 'learning',
    label: 'Learning Time',
    emoji: '\uD83D\uDCDA',
    tintBg: 'linear-gradient(135deg, #E0F7FA, #F6FFFE)',
    tintText: '#006064',
    categories: ['learn', 'create', 'listen'],
  },
  {
    key: 'bedtime',
    label: 'Bedtime',
    emoji: '\uD83C\uDF19',
    tintBg: 'linear-gradient(135deg, #EDE7F6, #F8F6FF)',
    tintText: '#311B92',
    categories: ['wellbeing'],
  },
];

function getActiveTimeSection(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 19) return 'learning';
  return 'bedtime';
}

function formatTodayDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

/* ─── Quest Board Component ──────────────────────────── */

type EnrichedMission = {
  id?: number;
  playerId: number;
  date: string;
  missionId: string;
  completed: boolean;
  completedAt?: Date;
  emoji: string;
  description: string;
  route: string;
  category: string;
};

interface QuestBoardProps {
  missions: EnrichedMission[];
  missionsCompleted: number;
  missionsTotal: number;
  allMissionsDone: boolean;
  streakDays: number;
  playerName: string;
  onMissionTap: (route: string) => void;
}

function QuestBoard({
  missions,
  missionsCompleted,
  missionsTotal,
  allMissionsDone,
  streakDays,
  playerName,
  onMissionTap,
}: QuestBoardProps) {
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const activeTimeKey = getActiveTimeSection();
  const progressCircumference = 2 * Math.PI * 22;
  const progressPct = missionsTotal > 0 ? Math.round((missionsCompleted / missionsTotal) * 100) : 0;
  const progressOffset = progressCircumference - (progressPct / 100) * progressCircumference;

  const groupedMissions: Record<string, EnrichedMission[]> = {};
  for (const section of timeSections) {
    groupedMissions[section.key] = [];
  }
  for (const mission of missions) {
    let placed = false;
    for (const section of timeSections) {
      if (section.categories.includes(mission.category as MissionCategory)) {
        groupedMissions[section.key].push(mission);
        placed = true;
        break;
      }
    }
    if (!placed) {
      groupedMissions['morning'].push(mission);
    }
  }

  const nextMission = missions.find((m) => !m.completed);

  const toggleSection = (key: string) => {
    setCollapsedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const totalStarsToday = missionsCompleted * 5;

  if (missions.length === 0) {
    return (
      <motion.div
        className="max-w-md mx-auto mb-5 md:max-w-2xl lg:max-w-4xl"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full animate-quest-shimmer" style={{ background: '#F0EAE0' }} />
            <div className="w-40 h-5 rounded-lg animate-quest-shimmer" style={{ background: '#F0EAE0' }} />
          </div>
          <div className="w-12 h-12 rounded-full animate-quest-shimmer" style={{ background: '#F0EAE0' }} />
        </div>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="mb-3 rounded-[20px] overflow-hidden"
            style={{
              background: '#FFFBF6',
              border: '1px solid rgba(232,224,212,0.4)',
              boxShadow: '0 2px 12px rgba(45,45,58,0.04)',
            }}
          >
            <div className="flex items-center gap-3.5 px-5 py-4">
              <div className="w-10 h-10 rounded-full animate-quest-shimmer" style={{ background: '#F0EAE0' }} />
              <div className="flex-1 space-y-2">
                <div className="w-3/4 h-4 rounded-lg animate-quest-shimmer" style={{ background: '#F0EAE0' }} />
                <div className="w-1/3 h-3 rounded-lg animate-quest-shimmer" style={{ background: '#F0EAE0' }} />
              </div>
              <div className="w-9 h-9 rounded-full animate-quest-shimmer" style={{ background: '#F0EAE0' }} />
            </div>
          </div>
        ))}
        <p className="text-center text-caption text-text-tertiary mt-3">
          {'\u{1F552}'} Check back tomorrow for new quests!
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="max-w-md mx-auto mb-5 md:max-w-2xl lg:max-w-4xl"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.1 }}
    >
      <div
        className="rounded-t-[20px] px-5 pt-5 pb-4"
        style={{
          background: 'linear-gradient(135deg, #FFFBF6, #FFF8F0)',
          border: '1px solid var(--color-border-subtle)',
          borderBottom: 'none',
          boxShadow: '0 -1px 12px rgba(45,45,58,0.03)',
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="font-display text-lg text-[#2D2D3A] flex items-center gap-2">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="2" y="3" width="18" height="16" rx="2" fill="#FFE66D" stroke="#F59E0B" strokeWidth="1.5"/><path d="M6 1V5M16 1V5" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round"/><path d="M2 9H20" stroke="#F59E0B" strokeWidth="1.2"/><path d="M7 13L10 16L15 11" stroke="#4CAF50" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Today&apos;s Quest Board
            </h2>
            <p className="text-caption text-text-tertiary mt-0.5">{formatTodayDate()}</p>
          </div>
          <div className="relative w-[52px] h-[52px] flex-shrink-0">
            <svg className="w-[52px] h-[52px] -rotate-90" viewBox="0 0 52 52">
              <circle cx="26" cy="26" r="22" fill="none" stroke="var(--color-surface-muted)" strokeWidth="4" />
              <motion.circle
                cx="26"
                cy="26"
                r="22"
                fill="none"
                strokeWidth="4"
                strokeLinecap="round"
                style={{ stroke: allMissionsDone ? '#6BCB77' : '#FF6B6B' }}
                strokeDasharray={progressCircumference}
                initial={{ strokeDashoffset: progressCircumference }}
                animate={{ strokeDashoffset: progressOffset }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[11px] font-extrabold text-text-primary">
              {missionsCompleted}/{missionsTotal}
            </span>
          </div>
        </div>
        {streakDays > 0 && (
          <motion.div
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5"
            style={{
              background: 'linear-gradient(135deg, #FFF3E0, #FFE0B2)',
              boxShadow: '0 2px 8px rgba(255,167,38,0.15)',
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="animate-wiggle" style={{ transformOrigin: 'center bottom' }}>
              <path d="M8 1C8 1 12 5 12 9C12 11.8 10.2 14 8 14C5.8 14 4 11.8 4 9C4 7 5 5 6 4C6 6 7 7 8 6C8 4 8 1 8 1Z" fill="#FF6B6B" stroke="#EF4444" strokeWidth="0.8"/>
              <path d="M8 8C8 8 10 10 10 11.5C10 12.6 9.1 13.5 8 13.5C6.9 13.5 6 12.6 6 11.5C6 10 8 8 8 8Z" fill="#FFE66D"/>
            </svg>
            <span className="text-[11px] font-display text-orange-700">
              {streakDays}-day streak!
            </span>
          </motion.div>
        )}
      </div>

      <div
        className="rounded-b-[20px] px-4 pb-4 pt-2"
        style={{
          background: 'var(--color-surface-card)',
          border: '1px solid var(--color-border-subtle)',
          borderTop: 'none',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        {allMissionsDone ? (
          <motion.div
            className="py-6 text-center relative overflow-hidden rounded-[16px] mb-2"
            style={{
              background: 'linear-gradient(135deg, #EDFAEF, #E0F7FA, #F3EFFE)',
            }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 12, stiffness: 200 }}
          >
            {[
              { top: '10%', left: '8%', bg: '#FF6B6B', size: 6, delay: 0 },
              { top: '15%', right: '12%', bg: '#4ECDC4', size: 8, delay: 0.2 },
              { top: '60%', left: '15%', bg: '#FFE66D', size: 5, delay: 0.4 },
              { top: '70%', right: '10%', bg: '#A78BFA', size: 7, delay: 0.6 },
              { top: '30%', left: '5%', bg: '#FF8C42', size: 4, delay: 0.8 },
              { top: '80%', right: '20%', bg: '#6BCB77', size: 6, delay: 1.0 },
              { top: '5%', left: '40%', bg: '#FFD93D', size: 5, delay: 0.3 },
              { top: '45%', right: '5%', bg: '#FF6B6B', size: 4, delay: 0.7 },
            ].map((dot, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full pointer-events-none"
                style={{
                  top: dot.top,
                  left: 'left' in dot ? dot.left : undefined,
                  right: 'right' in dot ? dot.right : undefined,
                  width: dot.size,
                  height: dot.size,
                  backgroundColor: dot.bg,
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0.7] }}
                transition={{ delay: dot.delay, duration: 0.5 }}
              />
            ))}
            <motion.div
              className="text-5xl mb-2"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
            >
              {'\uD83E\uDD81'}
            </motion.div>
            <div
              className="inline-block rounded-2xl px-4 py-2 mb-3"
              style={{
                background: 'rgba(255,255,255,0.8)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              <p
                className="text-[16px] font-extrabold"
                style={{
                  background: 'linear-gradient(135deg, #6BCB77, #4ECDC4)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                All Done! Amazing job!
              </p>
            </div>
            <div className="flex items-center justify-center gap-1.5 mb-3">
              <span className="text-2xl">{'\u2B50'}</span>
              <span className="text-[28px] font-extrabold" style={{ color: '#D4A017' }}>
                {totalStarsToday}
              </span>
              <span className="text-caption text-text-secondary font-bold">stars earned today</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <motion.button
                className="rounded-full px-5 py-2.5 text-[13px] font-bold text-white cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #FFD93D, #FF8C42)',
                  boxShadow: '0 4px 12px rgba(255,140,66,0.3)',
                }}
                onClick={() => onMissionTap('/rewards')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {'\uD83C\uDFC6'} See Rewards
              </motion.button>
              <motion.button
                className="rounded-full px-5 py-2.5 text-[13px] font-bold cursor-pointer"
                style={{
                  background: 'rgba(167,139,250,0.12)',
                  color: '#7C3AED',
                  border: '1px solid rgba(167,139,250,0.2)',
                }}
                onClick={() => onMissionTap('/quiz')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {'\u2728'} Bonus Challenge
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <>
            {nextMission && (
              <div className="mb-4 mt-2">
                <p className="text-[11px] font-extrabold text-text-tertiary uppercase tracking-wider mb-2">
                  {'\uD83C\uDFAF'} Next Up
                </p>
                <MissionCard
                  emoji={nextMission.emoji}
                  description={nextMission.description.replace('{name}', playerName)}
                  completed={false}
                  onTap={() => onMissionTap(nextMission.route)}
                  category={nextMission.category as MissionCategory}
                  rewardStars={5}
                  highlighted
                  index={0}
                />
              </div>
            )}
            {timeSections.map((section) => {
              const sectionMissions = groupedMissions[section.key];
              if (sectionMissions.length === 0) return null;
              const isActive = section.key === activeTimeKey;
              const isCollapsed = collapsedSections[section.key] ?? false;
              const sectionCompleted = sectionMissions.every((m) => m.completed);
              const sectionCompletedCount = sectionMissions.filter((m) => m.completed).length;
              const filteredMissions = sectionMissions.filter(
                (m) => !nextMission || m.missionId !== nextMission.missionId
              );
              if (filteredMissions.length === 0) return null;
              return (
                <div key={section.key} className="mb-3">
                  <motion.button
                    className="w-full flex items-center justify-between rounded-[14px] px-3.5 py-2.5 mb-2 cursor-pointer"
                    style={{
                      background: section.tintBg,
                      border: isActive ? `1.5px solid ${section.tintText}20` : '1px solid transparent',
                      boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.04)' : 'none',
                    }}
                    onClick={() => toggleSection(section.key)}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{section.emoji}</span>
                      <span className="text-[13px] font-extrabold" style={{ color: section.tintText }}>
                        {section.label}
                      </span>
                      {sectionCompleted && (
                        <span className="text-[10px] font-bold text-white rounded-full px-2 py-0.5" style={{ background: '#6BCB77' }}>
                          Done
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-text-tertiary">
                        {sectionCompletedCount}/{sectionMissions.length}
                      </span>
                      <motion.span
                        className="text-[10px] text-text-tertiary"
                        animate={{ rotate: isCollapsed ? 0 : 180 }}
                        transition={{ duration: 0.2 }}
                      >
                        {'\u25BC'}
                      </motion.span>
                    </div>
                  </motion.button>
                  <AnimatePresence initial={false}>
                    {!isCollapsed && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="relative pl-5">
                          <div className="absolute left-[9px] top-3 bottom-3 w-[2px]">
                            <div className="absolute inset-0 rounded-full" style={{ background: '#E8E0D4' }} />
                            <motion.div
                              className="absolute top-0 left-0 right-0 rounded-full"
                              style={{ background: 'linear-gradient(180deg, #6BCB77, #4ECDC4)' }}
                              initial={{ height: '0%' }}
                              animate={{
                                height: `${sectionMissions.length > 0
                                  ? (sectionCompletedCount / sectionMissions.length) * 100
                                  : 0}%`,
                              }}
                              transition={{ duration: 0.6, ease: 'easeOut' }}
                            />
                          </div>
                          {filteredMissions.map((mission, idx) => {
                            const isCurrentNext =
                              !mission.completed &&
                              filteredMissions.findIndex((m) => !m.completed) === idx;
                            return (
                              <div key={mission.missionId} className="relative mb-2.5 last:mb-0">
                                <div
                                  className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center"
                                  style={{ width: 20, height: 20 }}
                                >
                                  {mission.completed ? (
                                    <motion.div
                                      className="w-4 h-4 rounded-full flex items-center justify-center"
                                      style={{ background: 'linear-gradient(135deg, #6BCB77, #4ECDC4)' }}
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      transition={{ type: 'spring' }}
                                    >
                                      <span className="text-[8px] text-white font-bold">{'\u2713'}</span>
                                    </motion.div>
                                  ) : isCurrentNext ? (
                                    <div className="w-4 h-4 rounded-full bg-coral flex items-center justify-center animate-quest-pulse-node">
                                      <div className="w-2 h-2 rounded-full bg-white" />
                                    </div>
                                  ) : (
                                    <div
                                      className="w-3.5 h-3.5 rounded-full border-2"
                                      style={{ borderColor: '#D4D4E8', background: 'var(--color-surface-card)' }}
                                    />
                                  )}
                                </div>
                                <MissionCard
                                  emoji={mission.emoji}
                                  description={mission.description.replace('{name}', playerName)}
                                  completed={mission.completed}
                                  onTap={() => onMissionTap(mission.route)}
                                  category={mission.category as MissionCategory}
                                  rewardStars={5}
                                  index={idx + 1}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </>
        )}
      </div>
    </motion.div>
  );
}

/* ─── Main Component ────────────────────────────────────── */

export default function MainMenu() {
  const navigate = useNavigate();
  const { currentPlayer, setCurrentPlayer } = useApp();
  const { getItemsLearnedCount } = useProgress(currentPlayer?.id);
  const { missions, completeMission, allComplete: allMissionsDone } = useDailyMissions(currentPlayer?.id);
  const { character, getContextMessage } = useCharacter();
  const { activeTheme } = useSeasonalContent();
  const [activeTab, setActiveTab] = useState('home');
  const { nudges, dismissNudge } = useNudges(currentPlayer?.id);

  const liveProfile = useLiveQuery(
    () => currentPlayer?.id ? db.profiles.get(currentPlayer.id) : undefined,
    [currentPlayer?.id]
  );

  // Assessment check
  const hasAssessment = useLiveQuery(
    () => currentPlayer?.id
      ? db.assessmentResults.where('playerId').equals(currentPlayer.id).count()
      : 0,
    [currentPlayer?.id],
    0
  );

  // In-progress lessons
  const inProgressLessons = useLiveQuery(
    () =>
      currentPlayer?.id
        ? db.lessonProgress
            .where('playerId')
            .equals(currentPlayer.id)
            .filter((lp) => !lp.completed)
            .toArray()
        : [],
    [currentPlayer?.id],
    []
  );

  // In-progress stories
  const inProgressStories = useLiveQuery(
    () =>
      currentPlayer?.id
        ? db.storyProgress
            .where('playerId')
            .equals(currentPlayer.id)
            .filter((sp) => !sp.completed)
            .toArray()
        : [],
    [currentPlayer?.id],
    []
  );

  if (!currentPlayer) return <Navigate to="/" replace />;

  const streakDays = liveProfile?.streakDays ?? 0;

  function handleSwitchPlayer() {
    setCurrentPlayer(null);
    navigate('/');
  }

  // Build continue-learning items
  const continueItems: {
    emoji: string;
    title: string;
    progress: number;
    total: number;
    route: string;
  }[] = [];

  for (const lp of inProgressLessons) {
    const lesson = lessonsData.find((l) => l.id === lp.lessonId);
    if (lesson) {
      continueItems.push({
        emoji: lesson.emoji,
        title: lesson.title,
        progress: lp.stepsCompleted,
        total: lp.totalSteps,
        route: '/lessons',
      });
    }
  }

  for (const sp of inProgressStories) {
    const story = storiesData.find((s) => s.id === sp.storyId);
    if (story) {
      continueItems.push({
        emoji: story.emoji,
        title: story.title,
        progress: sp.currentPage,
        total: sp.totalPages,
        route: '/stories',
      });
    }
  }

  // Overall progress calculation
  const progressCategories = [
    { cat: 'abc' as const, total: 26 },
    { cat: 'numbers' as const, total: 20 },
    { cat: 'colors' as const, total: 10 },
    { cat: 'shapes' as const, total: 8 },
    { cat: 'animals' as const, total: 12 },
    { cat: 'bodyparts' as const, total: 10 },
    { cat: 'quiz' as const, total: 10 },
    { cat: 'matching' as const, total: 8 },
  ];

  const totalLearned = progressCategories.reduce(
    (sum, { cat }) => sum + getItemsLearnedCount(cat),
    0
  );
  const totalPossible = progressCategories.reduce((sum, { total }) => sum + total, 0);
  const overallPct = Math.min(100, Math.round((totalLearned / totalPossible) * 100));

  const activeTiles = tabTiles[activeTab] ?? [];

  // Mission completion count
  const missionsCompleted = missions.filter(m => m.completed).length;
  const missionsTotal = missions.length;

  return (
    <div className="h-dvh flex flex-col overflow-hidden relative page-with-bg">
      {/* Immersive animated background per tab */}
      <AnimatedBackground theme={activeTab === 'home' ? 'home' : activeTab as any} />

      {/* ══════════════════════════════════════════════════════
          1. COMPACT HEADER
         ══════════════════════════════════════════════════════ */}
      <div className="flex-shrink-0 px-4 pt-4 pb-2 md:px-8" style={{ position: 'relative', zIndex: 1 }}>
        <div className="flex items-center justify-between max-w-md mx-auto md:max-w-2xl lg:max-w-4xl">
          <motion.button
            className="flex items-center gap-2.5 glass rounded-full px-3 py-1.5 cursor-pointer"
            style={{ boxShadow: 'var(--shadow-card)' }}
            onClick={handleSwitchPlayer}
            whileTap={{ scale: 0.95 }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-lg ring-2 overflow-hidden"
              style={{
                backgroundColor: character.color + '25',
                boxShadow: `0 0 0 2px ${character.color}`,
              }}
            >
              {currentPlayer.avatarPhoto ? (
                <img src={currentPlayer.avatarPhoto} alt="" className="w-full h-full object-cover" />
              ) : (
                currentPlayer.avatarEmoji
              )}
            </div>
            <span className="font-bold text-sm text-text-primary">{currentPlayer.name}</span>
          </motion.button>

          <div className="flex items-center gap-2">
            {streakDays > 0 && (
              <div
                className="flex items-center gap-1 rounded-full px-2.5 py-1.5"
                style={{ background: 'linear-gradient(135deg, #FFE0B2, #FFCC80)' }}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 1C8 1 12 5 12 9C12 11.8 10.2 14 8 14C5.8 14 4 11.8 4 9C4 7 5 5 6 4C6 6 7 7 8 6C8 4 8 1 8 1Z" fill="#FF6B6B" stroke="#EF4444" strokeWidth="0.8"/><path d="M8 8C8 8 10 10 10 11.5C10 12.6 9.1 13.5 8 13.5C6.9 13.5 6 12.6 6 11.5C6 10 8 8 8 8Z" fill="#FFE66D"/></svg>
                <span className="text-xs font-extrabold text-orange-700">{streakDays}</span>
              </div>
            )}
            <StarCounter />
            <motion.button
              className="w-9 h-9 glass rounded-full flex items-center justify-center cursor-pointer"
              onClick={() => navigate('/settings')}
              whileTap={{ scale: 0.9 }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="3" stroke="#6B6B7B" strokeWidth="1.5"/><path d="M9 1.5V3M9 15V16.5M1.5 9H3M15 9H16.5M3.4 3.4L4.5 4.5M13.5 13.5L14.6 14.6M3.4 14.6L4.5 13.5M13.5 4.5L14.6 3.4" stroke="#6B6B7B" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </motion.button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          2. FULL-SCREEN CONTENT AREA
         ══════════════════════════════════════════════════════ */}
      <div className="flex-1 overflow-hidden px-4 md:px-8" style={{ position: 'relative', zIndex: 1 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="h-full max-w-md mx-auto md:max-w-2xl lg:max-w-4xl flex flex-col"
          >
            {activeTab === 'home' ? (
              /* ── HOME TAB ── */
              <div className="flex-1 overflow-y-auto pb-4 scrollbar-hide">
                {/* Hero greeting with mascot */}
                <motion.div
                  className="rounded-3xl overflow-hidden relative mb-4"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,107,107,0.15), rgba(255,200,150,0.2), rgba(255,255,255,0.8))',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    boxShadow: '0 4px 20px rgba(255,107,107,0.12)',
                  }}
                >
                  <div className="relative z-10 p-4 flex items-center gap-3">
                    <div className="animate-breathe">
                      <MascotLion
                        size={100}
                        expression={(() => {
                          const h = new Date().getHours();
                          if (h >= 20 || h < 6) return 'sleeping';
                          if (h >= 17) return 'happy';
                          return 'excited';
                        })()}
                        animated
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className="rounded-2xl rounded-bl-sm px-4 py-2.5 mb-2"
                        style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(45,45,58,0.04)' }}
                      >
                        <p className="font-display text-base text-[#2D2D3A]">
                          {(() => {
                            const h = new Date().getHours();
                            const name = currentPlayer.name;
                            if (h >= 6 && h < 12) return `Good morning, ${name}! Let's learn something new!`;
                            if (h >= 12 && h < 17) return `Good afternoon, ${name}! Ready for more fun?`;
                            if (h >= 17 && h < 20) return `Good evening, ${name}! What shall we explore?`;
                            return `Bedtime learning, ${name}? Let's do something cozy!`;
                          })()}
                        </p>
                      </div>
                      <motion.button
                        className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold cursor-pointer text-white tap-bounce"
                        style={{ background: 'linear-gradient(135deg, #FF6B6B, #FF8C42)', boxShadow: '0 4px 12px rgba(255,107,107,0.3)' }}
                        onClick={() => { const r = ['/lessons', '/stories', '/discover']; navigate(r[Math.floor(Math.random() * r.length)]); }}
                        whileTap={{ scale: 0.93 }}
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1L9 5L13 5.5L10 8.5L11 13L7 10.5L3 13L4 8.5L1 5.5L5 5Z" fill="#FFE66D"/></svg>
                        Today&apos;s Pick
                        <span>&#8594;</span>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>

                {/* Nudge */}
                {nudges.length > 0 && <div className="mb-3"><NudgeBanner nudge={nudges[0]} onDismiss={dismissNudge} /></div>}

                {/* Quest Board */}
                <QuestBoard
                  missions={missions}
                  missionsCompleted={missionsCompleted}
                  missionsTotal={missionsTotal}
                  allMissionsDone={allMissionsDone}
                  streakDays={streakDays}
                  playerName={currentPlayer.name}
                  onMissionTap={(route) => navigate(route)}
                />

                {/* Continue Learning */}
                {continueItems.length > 0 && (
                  <div className="mb-4">
                    <SectionHeader>Continue Learning</SectionHeader>
                    <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
                      {continueItems.map((item, i) => (
                        <ContinueCard key={`${item.route}-${i}`} emoji={item.emoji} title={item.title} progress={item.progress} total={item.total} onClick={() => navigate(item.route)} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Collections */}
                {collections.length > 0 && (
                  <div className="mb-4">
                    <SectionHeader action={{ label: 'See all', onClick: () => navigate('/collections') }}>Collections</SectionHeader>
                    <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
                      {collections.slice(0, 4).map((col) => (
                        <motion.button
                          key={col.id}
                          className="flex-shrink-0 w-36 text-left cursor-pointer snap-start overflow-hidden"
                          style={{ borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-card)', background: 'var(--color-surface-card)', border: '1px solid var(--color-border-subtle)' }}
                          onClick={() => navigate(`/collections/${col.id}`)}
                          whileTap={{ scale: 0.97 }}
                        >
                          <div className="p-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl mb-2" style={{ backgroundColor: col.coverColor + '18' }}>{col.emoji}</div>
                            <p className="text-xs font-bold text-text-primary truncate">{col.title}</p>
                            <p className="text-[10px] text-text-tertiary">{col.contentIds.length} activities</p>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Progress */}
                <div
                  className="rounded-2xl p-4 mb-4"
                  style={{ boxShadow: 'var(--shadow-card)', background: 'var(--color-surface-card)', border: '1px solid var(--color-border-subtle)' }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="relative w-14 h-14 flex-shrink-0">
                      <svg className="w-14 h-14 -rotate-90" viewBox="0 0 64 64">
                        <circle cx="32" cy="32" r="26" fill="none" stroke="var(--color-surface-muted)" strokeWidth="6" />
                        <motion.circle cx="32" cy="32" r="26" fill="none" strokeWidth="6" strokeLinecap="round" style={{ stroke: 'url(#progressGradient)' }} strokeDasharray={2 * Math.PI * 26} initial={{ strokeDashoffset: 2 * Math.PI * 26 }} animate={{ strokeDashoffset: 2 * Math.PI * 26 - (overallPct / 100) * 2 * Math.PI * 26 }} transition={{ duration: 1, ease: 'easeOut' }} />
                        <defs><linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#4ECDC4" /><stop offset="100%" stopColor="#6366F1" /></linearGradient></defs>
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-extrabold text-text-primary">{overallPct}%</span>
                    </div>
                    <div>
                      <p className="font-extrabold text-sm text-text-primary">Your Progress</p>
                      <p className="text-[11px] text-text-tertiary">{totalLearned} of {totalPossible} items learned</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { cat: 'abc' as const, total: 26, label: 'Letters', color: '#FF6B6B' },
                      { cat: 'numbers' as const, total: 20, label: 'Numbers', color: '#4ECDC4' },
                      { cat: 'colors' as const, total: 10, label: 'Colors', color: '#FFB347' },
                      { cat: 'shapes' as const, total: 8, label: 'Shapes', color: '#A78BFA' },
                      { cat: 'animals' as const, total: 12, label: 'Animals', color: '#6BCB77' },
                      { cat: 'bodyparts' as const, total: 10, label: 'Body', color: '#F472B6' },
                      { cat: 'quiz' as const, total: 10, label: 'Quiz', color: '#FF8C42' },
                      { cat: 'matching' as const, total: 8, label: 'Match', color: '#38BDF8' },
                    ].map(({ cat, total, label, color }) => {
                      const learned = getItemsLearnedCount(cat);
                      const pct = Math.min(100, Math.round((learned / total) * 100));
                      return <MiniProgressCircle key={cat} pct={pct} color={color} label={label} detail={`${learned}/${total}`} />;
                    })}
                  </div>
                </div>

                {/* Quick links row */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {[
                    { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2L15 9H21L16 13.5L18 21L12 17L6 21L8 13.5L3 9H9Z" fill="#FFD93D" stroke="#F59E0B" strokeWidth="1.5"/></svg>, label: 'Rewards', route: '/rewards', bg: '#FFF8E1' },
                    { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="4" y="3" width="16" height="18" rx="2" stroke="#A78BFA" strokeWidth="1.8" fill="#F3EFFE"/><path d="M8 8H16M8 12H14" stroke="#A78BFA" strokeWidth="1.5" strokeLinecap="round"/></svg>, label: 'Scrapbook', route: '/scrapbook', bg: '#F3EFFE' },
                    { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2L15 4V8L12 10L9 8V4Z" stroke="#4ECDC4" strokeWidth="1.8" fill="#EDFAF8"/><circle cx="12" cy="16" r="5" stroke="#4ECDC4" strokeWidth="1.8" fill="#EDFAF8"/></svg>, label: 'Parents', route: '/parent-dashboard', bg: '#EDFAF8' },
                    { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><ellipse cx="12" cy="12" rx="8" ry="7" fill="#FFF0F6" stroke="#FF8FAB" strokeWidth="1.8"/><path d="M9 10C9 10 12 8 15 10" stroke="#FF8FAB" strokeWidth="1.5" strokeLinecap="round"/><path d="M12 10V15" stroke="#FF8FAB" strokeWidth="1.5" strokeLinecap="round"/></svg>, label: 'Assessment', route: '/assessment', bg: '#FFF0F6' },
                  ].map((item) => (
                    <motion.button
                      key={item.route}
                      className="flex flex-col items-center gap-1.5 py-3 rounded-2xl cursor-pointer tap-bounce"
                      style={{ background: item.bg, boxShadow: '0 2px 8px rgba(45,45,58,0.06)', border: '1px solid rgba(45,45,58,0.04)' }}
                      onClick={() => navigate(item.route)}
                      whileTap={{ scale: 0.93 }}
                    >
                      {item.icon}
                      <span className="text-[10px] font-bold text-text-secondary">{item.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            ) : (
              /* ── CATEGORY TABS (tiles fill the screen) ── */
              <div className="flex-1 flex flex-col pt-2">
                {/* Tab title */}
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-display text-xl text-[#2D2D3A]">
                    {menuTabs.find((t) => t.key === activeTab)?.label}
                  </h2>
                  <span className="text-xs text-white/70 font-bold bg-[#2D2D3A]/20 px-2.5 py-1 rounded-full">
                    {activeTiles.length} activities
                  </span>
                </div>

                {/* Tiles grid — fills remaining space */}
                <div className="flex-1 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 pb-2 content-start" style={{ gridAutoRows: 'min-content' }}>
                  {activeTiles.map((tile, i) => (
                    <BigTileButton key={tile.to} {...tile} delay={i * 0.04} icon={tileIconMap[tile.to]} />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ══════════════════════════════════════════════════════
          3. BOTTOM TAB BAR — Floating pill with SVG icons
         ══════════════════════════════════════════════════════ */}
      <div className="flex-shrink-0 pb-[env(safe-area-inset-bottom)] px-4 mb-2" style={{ position: 'relative', zIndex: 2 }}>
        <div
          className="max-w-md mx-auto md:max-w-2xl flex items-center justify-around px-2 py-1.5 rounded-full"
          style={{
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            boxShadow: '0 8px 32px rgba(45,45,58,0.12), 0 0 0 1px rgba(255,255,255,0.2)',
          }}
        >
          {menuTabs.map((tab) => {
            const isActive = activeTab === tab.key;
            const NavIcon = {
              home: HomeIcon, learn: LearnIcon, play: PlayIcon,
              create: CreateIcon, listen: ListenIcon, wellbeing: WellbeingIcon, explore: ExploreIcon,
            }[tab.key] ?? HomeIcon;
            return (
              <motion.button
                key={tab.key}
                className="flex flex-col items-center gap-0.5 py-1.5 px-2.5 rounded-2xl cursor-pointer relative tap-bounce"
                onClick={() => setActiveTab(tab.key)}
                whileTap={{ scale: 0.85 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="bottomTabBg"
                    className="absolute inset-0 rounded-2xl"
                    style={{ background: 'linear-gradient(135deg, #FF6B6B18, #FF8C4218)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <div className="relative z-10">
                  <NavIcon size={isActive ? 26 : 22} active={isActive} />
                </div>
                {isActive && (
                  <motion.span
                    className="text-[9px] font-bold relative z-10 text-coral"
                    initial={{ opacity: 0, y: 2 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {tab.label}
                  </motion.span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
