import Dexie, { type Table } from 'dexie';

export interface PlayerProfile {
  id?: number;
  name: string;
  avatarEmoji: string;
  /** Base64 data URL for photo avatar (camera/upload). When set, shown instead of emoji. */
  avatarPhoto?: string;
  totalStars: number;
  streakDays: number;
  lastStreakDate: string;
  createdAt: Date;
  lastPlayedAt: Date;
  // v4 additions
  age?: number;
  ageGroup?: '2-3' | '4-5' | '6-8';
  interests?: string[];
  learningLevel?: 'beginner' | 'intermediate' | 'advanced';
  // v5 additions
  bedtimeMode?: boolean;
  lastAssessmentAt?: Date;
  characterPreference?: string;
  // v6 additions
  onboardingCompleted?: boolean;
  preferredLocale?: string;
  a11yReducedMotion?: boolean;
  a11yLargerText?: boolean;
  a11yHighContrast?: boolean;
  timeModeOverride?: string;
}

export interface ActivityProgress {
  id?: number;
  playerId: number;
  category: string;
  itemKey: string;
  timesCompleted: number;
  correctAnswers: number;
  totalAttempts: number;
  lastPracticedAt: Date;
}

export interface PlayerBadge {
  id?: number;
  playerId: number;
  badgeId: string;
  earnedAt: Date;
}

export interface StarRecord {
  id?: number;
  playerId: number;
  category: string;
  starsEarned: number;
  reason: string;
  earnedAt: Date;
}

export interface VideoFavorite {
  id?: number;
  playerId: number;
  videoId: string;
  addedAt: Date;
}

export interface WatchHistory {
  id?: number;
  playerId: number;
  videoId: string;
  videoTitle: string;
  videoChannel: string;
  videoThumbnail: string;
  watchedAt: Date;
}

export interface LessonProgress {
  id?: number;
  playerId: number;
  lessonId: string;
  completed: boolean;
  score: number;
  attempts: number;
  stepsCompleted: number;
  totalSteps: number;
  startedAt: Date;
  completedAt?: Date;
}

export interface StoryProgress {
  id?: number;
  playerId: number;
  storyId: string;
  currentPage: number;
  totalPages: number;
  completed: boolean;
  favorite: boolean;
  lastReadAt: Date;
}

export interface DailyGoalRecord {
  id?: number;
  playerId: number;
  date: string; // YYYY-MM-DD
  lessonsCompleted: number;
  gamesPlayed: number;
  storiesRead: number;
  videosWatched: number;
  totalMinutes: number;
}

export interface GameScore {
  id?: number;
  playerId: number;
  gameId: string;
  difficulty: string;
  score: number;
  accuracy: number;
  timeSeconds: number;
  stars: number;
  playedAt: Date;
}

// ── v5 new table interfaces ──────────────────────────────

export interface Artwork {
  id?: number;
  playerId: number;
  title: string;
  dataUrl: string;
  templateId?: string;
  createdAt: Date;
}

export interface CookingProgress {
  id?: number;
  playerId: number;
  recipeId: string;
  completed: boolean;
  stepsCompleted: number;
  totalSteps: number;
  favorite: boolean;
  lastCookedAt: Date;
}

export interface AudioProgress {
  id?: number;
  playerId: number;
  episodeId: string;
  currentTime: number;
  duration: number;
  completed: boolean;
  favorite: boolean;
  lastListenedAt: Date;
}

export interface BedtimeSession {
  id?: number;
  playerId: number;
  date: string;
  storyId?: string;
  breathingExercise?: string;
  calmSoundPlayed: boolean;
  completedAt?: Date;
  startedAt: Date;
}

export interface MovementProgress {
  id?: number;
  playerId: number;
  activityId: string;
  completed: boolean;
  favorite: boolean;
  timesCompleted: number;
  lastPlayedAt: Date;
}

export interface MoodCheckIn {
  id?: number;
  playerId: number;
  mood: string;
  note?: string;
  checkedInAt: Date;
}

export interface LifeSkillsProgress {
  id?: number;
  playerId: number;
  skillId: string;
  completed: boolean;
  score?: number;
  completedAt?: Date;
}

export interface DailyMission {
  id?: number;
  playerId: number;
  date: string;
  missionId: string;
  completed: boolean;
  completedAt?: Date;
}

export interface AssessmentResult {
  id?: number;
  playerId: number;
  area: string;
  score: number;
  totalQuestions: number;
  suggestedLevel: string;
  completedAt: Date;
}

export interface HomeActivityProgress {
  id?: number;
  playerId: number;
  activityId: string;
  completed: boolean;
  favorite: boolean;
  completedAt?: Date;
}

export interface MediaQueueItem {
  id?: number;
  playerId: number;
  contentType: 'video' | 'audio' | 'story';
  contentId: string;
  title: string;
  emoji: string;
  position: number;
  addedAt: Date;
}

export interface ScrapbookEntry {
  id?: number;
  playerId: number;
  entryType: 'milestone' | 'artwork' | 'badge' | 'mood' | 'achievement';
  title: string;
  emoji: string;
  description?: string;
  imageUrl?: string;
  createdAt: Date;
}

export interface ExplorerProgress {
  id?: number;
  playerId: number;
  topicId: string;
  factsRead: number;
  totalFacts: number;
  quizScore?: number;
  completed: boolean;
  lastExploredAt: Date;
}

// ── v7 new table interfaces ──────────────────────────────

export interface Subscription {
  id?: number;
  playerId: number;
  plan: 'free' | 'trial' | 'premium';
  status: 'active' | 'cancelled' | 'expired';
  trialStartedAt?: Date;
  trialEndsAt?: Date;
  nextBillingDate?: Date;
  updatedAt: Date;
}

export interface SavedTip {
  id?: number;
  playerId: number;
  tipId: string;
  savedAt: Date;
}

export interface HelpFeedback {
  id?: number;
  playerId: number;
  articleId: string;
  helpful: boolean;
  submittedAt: Date;
}

export interface ConsentRecord {
  id?: number;
  playerId: number;
  consentType: string;
  granted: boolean;
  version: string;
  grantedAt: Date;
}

export interface InboxMessage {
  id?: number;
  playerId: number;
  type: 'recap' | 'new_content' | 'tip' | 'system' | 'bedtime_suggestion';
  title: string;
  body: string;
  read: boolean;
  actionUrl?: string;
  createdAt: Date;
}

export interface Routine {
  id?: number;
  playerId: number;
  name: string;
  type: 'morning' | 'after_school' | 'travel' | 'bedtime' | 'weekend' | 'custom';
  days: string[];
  time: string;
  estimatedMinutes: number;
  items: RoutineItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RoutineItem {
  contentId: string;
  title: string;
  emoji: string;
  durationMinutes: number;
}

export interface FeatureFlag {
  id?: number;
  key: string;
  enabled: boolean;
  updatedAt: Date;
}

export interface SyncQueueEntry {
  id?: number;
  playerId: number;
  action: string;
  payload: string;
  status: 'pending' | 'syncing' | 'synced' | 'error';
  createdAt: Date;
  syncedAt?: Date;
}

export interface DataRequest {
  id?: number;
  playerId: number;
  type: 'export' | 'deletion';
  status: 'pending' | 'processing' | 'completed';
  requestedAt: Date;
  completedAt?: Date;
}

export interface PerformanceMetric {
  id?: number;
  name: string;
  value: number;
  recordedAt: Date;
}

export interface ErrorLog {
  id?: number;
  message: string;
  stack?: string;
  context?: string;
  reportedAt: Date;
}

// ── v6 new table interfaces ──────────────────────────────

export interface CollectionProgress {
  id?: number;
  playerId: number;
  collectionId: string;
  completedItems: string[];
  startedAt: Date;
  completedAt?: Date;
}

export interface PlaylistProgress {
  id?: number;
  playerId: number;
  playlistId: string;
  currentIndex: number;
  completedItems: string[];
  startedAt: Date;
  completedAt?: Date;
}

export interface ContentHistory {
  id?: number;
  playerId: number;
  contentId: string;
  interactedAt: Date;
  durationSeconds?: number;
  completed?: boolean;
}

export interface UniversalFavorite {
  id?: number;
  playerId: number;
  contentId: string;
  addedAt: Date;
}

export interface NudgeState {
  id?: number;
  playerId: number;
  nudgeId: string;
  dismissedAt: Date;
}

export interface WeeklyRecap {
  id?: number;
  playerId: number;
  weekKey: string;
  totalActivities: number;
  starsEarned: number;
  topSkills: string[];
  gamesPlayed: number;
  storiesCompleted: number;
  favoriteType: string;
  streakDays: number;
  generatedAt: Date;
}

export interface OnboardingState {
  id?: number;
  playerId: number;
  currentStep: number;
  childName?: string;
  childAge?: number;
  selectedInterests?: string[];
  learningGoals?: string[];
  dailyRoutine?: string;
  completedAt?: Date;
}

class KidsLearningDB extends Dexie {
  profiles!: Table<PlayerProfile>;
  progress!: Table<ActivityProgress>;
  badges!: Table<PlayerBadge>;
  stars!: Table<StarRecord>;
  videoFavorites!: Table<VideoFavorite>;
  watchHistory!: Table<WatchHistory>;
  lessonProgress!: Table<LessonProgress>;
  storyProgress!: Table<StoryProgress>;
  dailyGoals!: Table<DailyGoalRecord>;
  gameScores!: Table<GameScore>;
  // v5 tables
  artworks!: Table<Artwork>;
  cookingProgress!: Table<CookingProgress>;
  audioProgress!: Table<AudioProgress>;
  bedtimeSessions!: Table<BedtimeSession>;
  movementProgress!: Table<MovementProgress>;
  moodCheckIns!: Table<MoodCheckIn>;
  lifeSkillsProgress!: Table<LifeSkillsProgress>;
  dailyMissions!: Table<DailyMission>;
  assessmentResults!: Table<AssessmentResult>;
  homeActivityProgress!: Table<HomeActivityProgress>;
  mediaQueue!: Table<MediaQueueItem>;
  scrapbookEntries!: Table<ScrapbookEntry>;
  explorerProgress!: Table<ExplorerProgress>;
  // v6 tables
  collectionProgress!: Table<CollectionProgress>;
  playlistProgress!: Table<PlaylistProgress>;
  contentHistory!: Table<ContentHistory>;
  universalFavorites!: Table<UniversalFavorite>;
  nudgeState!: Table<NudgeState>;
  weeklyRecaps!: Table<WeeklyRecap>;
  onboardingState!: Table<OnboardingState>;
  // v7 tables
  subscriptions!: Table<Subscription>;
  savedTips!: Table<SavedTip>;
  helpFeedback!: Table<HelpFeedback>;
  consents!: Table<ConsentRecord>;
  inboxMessages!: Table<InboxMessage>;
  routines!: Table<Routine>;
  featureFlags!: Table<FeatureFlag>;
  syncQueue!: Table<SyncQueueEntry>;
  dataRequests!: Table<DataRequest>;
  performanceMetrics!: Table<PerformanceMetric>;
  errorLogs!: Table<ErrorLog>;

  constructor() {
    super('KidsLearningDB');
    this.version(1).stores({
      profiles: '++id, name',
      progress: '++id, playerId, [playerId+category+itemKey]',
      badges: '++id, playerId, [playerId+badgeId]',
      stars: '++id, playerId, earnedAt',
    });
    this.version(2).stores({
      profiles: '++id, name',
      progress: '++id, playerId, [playerId+category+itemKey]',
      badges: '++id, playerId, [playerId+badgeId]',
      stars: '++id, playerId, earnedAt',
    }).upgrade(tx => {
      return tx.table('profiles').toCollection().modify(profile => {
        profile.streakDays = profile.streakDays ?? 0;
        profile.lastStreakDate = profile.lastStreakDate ?? '';
      });
    });
    this.version(3).stores({
      profiles: '++id, name',
      progress: '++id, playerId, [playerId+category+itemKey]',
      badges: '++id, playerId, [playerId+badgeId]',
      stars: '++id, playerId, earnedAt',
      videoFavorites: '++id, playerId, [playerId+videoId]',
      watchHistory: '++id, playerId, watchedAt',
    });
    // v4: lessons, stories, daily goals, game scores, profile enhancements
    this.version(4).stores({
      profiles: '++id, name',
      progress: '++id, playerId, [playerId+category+itemKey]',
      badges: '++id, playerId, [playerId+badgeId]',
      stars: '++id, playerId, earnedAt',
      videoFavorites: '++id, playerId, [playerId+videoId]',
      watchHistory: '++id, playerId, watchedAt',
      lessonProgress: '++id, playerId, [playerId+lessonId]',
      storyProgress: '++id, playerId, [playerId+storyId]',
      dailyGoals: '++id, playerId, [playerId+date]',
      gameScores: '++id, playerId, gameId, playedAt',
    }).upgrade(tx => {
      return tx.table('profiles').toCollection().modify(profile => {
        profile.age = profile.age ?? 3;
        profile.ageGroup = profile.ageGroup ?? '2-3';
        profile.interests = profile.interests ?? [];
        profile.learningLevel = profile.learningLevel ?? 'beginner';
      });
    });
    // v5: 13 new tables for all new features
    this.version(5).stores({
      profiles: '++id, name',
      progress: '++id, playerId, [playerId+category+itemKey]',
      badges: '++id, playerId, [playerId+badgeId]',
      stars: '++id, playerId, earnedAt',
      videoFavorites: '++id, playerId, [playerId+videoId]',
      watchHistory: '++id, playerId, watchedAt',
      lessonProgress: '++id, playerId, [playerId+lessonId]',
      storyProgress: '++id, playerId, [playerId+storyId]',
      dailyGoals: '++id, playerId, [playerId+date]',
      gameScores: '++id, playerId, gameId, playedAt',
      artworks: '++id, playerId, createdAt',
      cookingProgress: '++id, playerId, [playerId+recipeId]',
      audioProgress: '++id, playerId, [playerId+episodeId]',
      bedtimeSessions: '++id, playerId, [playerId+date]',
      movementProgress: '++id, playerId, [playerId+activityId]',
      moodCheckIns: '++id, playerId, checkedInAt',
      lifeSkillsProgress: '++id, playerId, [playerId+skillId]',
      dailyMissions: '++id, playerId, [playerId+date+missionId]',
      assessmentResults: '++id, playerId, area, completedAt',
      homeActivityProgress: '++id, playerId, [playerId+activityId]',
      mediaQueue: '++id, playerId, position',
      scrapbookEntries: '++id, playerId, createdAt',
      explorerProgress: '++id, playerId, [playerId+topicId]',
    }).upgrade(tx => {
      return tx.table('profiles').toCollection().modify(profile => {
        profile.bedtimeMode = profile.bedtimeMode ?? false;
        profile.characterPreference = profile.characterPreference ?? '';
      });
    });
    // v6: collections, playlists, content history, universal favorites, nudges, weekly recaps, onboarding
    this.version(6).stores({
      profiles: '++id, name',
      progress: '++id, playerId, [playerId+category+itemKey]',
      badges: '++id, playerId, [playerId+badgeId]',
      stars: '++id, playerId, earnedAt',
      videoFavorites: '++id, playerId, [playerId+videoId]',
      watchHistory: '++id, playerId, watchedAt',
      lessonProgress: '++id, playerId, [playerId+lessonId]',
      storyProgress: '++id, playerId, [playerId+storyId]',
      dailyGoals: '++id, playerId, [playerId+date]',
      gameScores: '++id, playerId, gameId, playedAt',
      artworks: '++id, playerId, createdAt',
      cookingProgress: '++id, playerId, [playerId+recipeId]',
      audioProgress: '++id, playerId, [playerId+episodeId]',
      bedtimeSessions: '++id, playerId, [playerId+date]',
      movementProgress: '++id, playerId, [playerId+activityId]',
      moodCheckIns: '++id, playerId, checkedInAt',
      lifeSkillsProgress: '++id, playerId, [playerId+skillId]',
      dailyMissions: '++id, playerId, [playerId+date+missionId]',
      assessmentResults: '++id, playerId, area, completedAt',
      homeActivityProgress: '++id, playerId, [playerId+activityId]',
      mediaQueue: '++id, playerId, position',
      scrapbookEntries: '++id, playerId, createdAt',
      explorerProgress: '++id, playerId, [playerId+topicId]',
      // v6 new tables
      collectionProgress: '++id, playerId, [playerId+collectionId]',
      playlistProgress: '++id, playerId, [playerId+playlistId]',
      contentHistory: '++id, playerId, contentId, interactedAt, [playerId+contentId]',
      universalFavorites: '++id, playerId, [playerId+contentId]',
      nudgeState: '++id, playerId, [playerId+nudgeId]',
      weeklyRecaps: '++id, playerId, [playerId+weekKey]',
      onboardingState: '++id, playerId',
    }).upgrade(tx => {
      return tx.table('profiles').toCollection().modify(profile => {
        profile.onboardingCompleted = profile.onboardingCompleted ?? false;
        profile.preferredLocale = profile.preferredLocale ?? 'en';
        profile.a11yReducedMotion = profile.a11yReducedMotion ?? false;
        profile.a11yLargerText = profile.a11yLargerText ?? false;
        profile.a11yHighContrast = profile.a11yHighContrast ?? false;
        profile.timeModeOverride = profile.timeModeOverride ?? '';
      });
    });
    // v7: subscriptions, tips, help, privacy, inbox, routines, feature flags, sync, data requests, metrics, errors
    this.version(7).stores({
      profiles: '++id, name',
      progress: '++id, playerId, [playerId+category+itemKey]',
      badges: '++id, playerId, [playerId+badgeId]',
      stars: '++id, playerId, earnedAt',
      videoFavorites: '++id, playerId, [playerId+videoId]',
      watchHistory: '++id, playerId, watchedAt',
      lessonProgress: '++id, playerId, [playerId+lessonId]',
      storyProgress: '++id, playerId, [playerId+storyId]',
      dailyGoals: '++id, playerId, [playerId+date]',
      gameScores: '++id, playerId, gameId, playedAt',
      artworks: '++id, playerId, createdAt',
      cookingProgress: '++id, playerId, [playerId+recipeId]',
      audioProgress: '++id, playerId, [playerId+episodeId]',
      bedtimeSessions: '++id, playerId, [playerId+date]',
      movementProgress: '++id, playerId, [playerId+activityId]',
      moodCheckIns: '++id, playerId, checkedInAt',
      lifeSkillsProgress: '++id, playerId, [playerId+skillId]',
      dailyMissions: '++id, playerId, [playerId+date+missionId]',
      assessmentResults: '++id, playerId, area, completedAt',
      homeActivityProgress: '++id, playerId, [playerId+activityId]',
      mediaQueue: '++id, playerId, position',
      scrapbookEntries: '++id, playerId, createdAt',
      explorerProgress: '++id, playerId, [playerId+topicId]',
      collectionProgress: '++id, playerId, [playerId+collectionId]',
      playlistProgress: '++id, playerId, [playerId+playlistId]',
      contentHistory: '++id, playerId, contentId, interactedAt, [playerId+contentId]',
      universalFavorites: '++id, playerId, [playerId+contentId]',
      nudgeState: '++id, playerId, [playerId+nudgeId]',
      weeklyRecaps: '++id, playerId, [playerId+weekKey]',
      onboardingState: '++id, playerId',
      // v7 new tables
      subscriptions: '++id, playerId',
      savedTips: '++id, playerId, [playerId+tipId]',
      helpFeedback: '++id, playerId, [playerId+articleId]',
      consents: '++id, playerId, [playerId+consentType]',
      inboxMessages: '++id, playerId, read, createdAt',
      routines: '++id, playerId, type',
      featureFlags: '++id, &key',
      syncQueue: '++id, playerId, status',
      dataRequests: '++id, playerId, status',
      performanceMetrics: '++id, name, recordedAt',
      errorLogs: '++id, reportedAt',
    });
  }
}

export const db = new KidsLearningDB();
