import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import ErrorBoundary from './components/ErrorBoundary';
import CelebrationOverlay from './components/CelebrationOverlay';
import StarBurst from './components/StarBurst';
import BadgeToast from './components/BadgeToast';
import { startAutoSync, stopAutoSync } from './services/syncService';

// Lazy load pages for better PWA performance
const WelcomePage = lazy(() => import('./pages/WelcomePage'));
const MainMenu = lazy(() => import('./pages/MainMenu'));
const AbcPage = lazy(() => import('./pages/AbcPage'));
const NumbersPage = lazy(() => import('./pages/NumbersPage'));
const ColorsPage = lazy(() => import('./pages/ColorsPage'));
const ShapesPage = lazy(() => import('./pages/ShapesPage'));
const AnimalsPage = lazy(() => import('./pages/AnimalsPage'));
const BodyPartsPage = lazy(() => import('./pages/BodyPartsPage'));
const QuizPage = lazy(() => import('./pages/QuizPage'));
const RewardsPage = lazy(() => import('./pages/RewardsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const MatchingPage = lazy(() => import('./pages/MatchingPage'));
const VideosPage = lazy(() => import('./pages/VideosPage'));
const StoriesPage = lazy(() => import('./pages/StoriesPage'));
const LessonsPage = lazy(() => import('./pages/LessonsPage'));
const GamesPage = lazy(() => import('./pages/GamesPage'));
const PrintablesPage = lazy(() => import('./pages/PrintablesPage'));
const ParentDashboard = lazy(() => import('./pages/ParentDashboard'));

// v5 new pages
const CharacterMeetPage = lazy(() => import('./pages/CharacterMeetPage'));
// v6 new pages
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'));
const CollectionsPage = lazy(() => import('./pages/CollectionsPage'));
const CollectionDetailPage = lazy(() => import('./pages/CollectionDetailPage'));
const WeeklyRecapPage = lazy(() => import('./pages/WeeklyRecapPage'));
const PreviewPage = lazy(() => import('./pages/PreviewPage'));
const EmotionsPage = lazy(() => import('./pages/EmotionsPage'));
const BedtimePage = lazy(() => import('./pages/BedtimePage'));
const AudioPage = lazy(() => import('./pages/AudioPage'));
const ColoringPage = lazy(() => import('./pages/ColoringPage'));
const MovementPage = lazy(() => import('./pages/MovementPage'));
const CookingPage = lazy(() => import('./pages/CookingPage'));
const HomeActivitiesPage = lazy(() => import('./pages/HomeActivitiesPage'));
const DiscoveryPage = lazy(() => import('./pages/DiscoveryPage'));
const QueuePage = lazy(() => import('./pages/QueuePage'));
const AssessmentPage = lazy(() => import('./pages/AssessmentPage'));
const ExplorerPage = lazy(() => import('./pages/ExplorerPage'));
const ScrapbookPage = lazy(() => import('./pages/ScrapbookPage'));
// v7 new pages
const BillingPage = lazy(() => import('./pages/BillingPage'));
const ParentTipsPage = lazy(() => import('./pages/ParentTipsPage'));
const HelpCenterPage = lazy(() => import('./pages/HelpCenterPage'));
const PrivacySettingsPage = lazy(() => import('./pages/PrivacySettingsPage'));
const InboxPage = lazy(() => import('./pages/InboxPage'));
const RoutinePlannerPage = lazy(() => import('./pages/RoutinePlannerPage'));
const RoutinePlayerPage = lazy(() => import('./pages/RoutinePlayerPage'));
// v8 AI-powered pages (Gemma 4 via Ollama)
const WhatsThisPage = lazy(() => import('./pages/WhatsThisPage'));
const DrawingDetectivePage = lazy(() => import('./pages/DrawingDetectivePage'));
const LetterReaderPage = lazy(() => import('./pages/LetterReaderPage'));
const NatureExplorerPage = lazy(() => import('./pages/NatureExplorerPage'));
const ColorFinderPage = lazy(() => import('./pages/ColorFinderPage'));

function LoadingScreen() {
  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8C42 30%, #FFE66D 60%, #4ECDC4 100%)' }}
    >
      {/* Floating decorative circles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[15%] w-20 h-20 rounded-full bg-white/10 animate-float-gentle" />
        <div className="absolute top-[30%] right-[10%] w-14 h-14 rounded-full bg-white/10 animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-[20%] left-[20%] w-16 h-16 rounded-full bg-white/10 animate-float-gentle" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-[35%] right-[25%] w-10 h-10 rounded-full bg-white/10 animate-float" style={{ animationDelay: '1.5s' }} />
      </div>

      {/* Mascot with bounce-in */}
      <div className="animate-bounce-in mb-4">
        <svg width="120" height="120" viewBox="0 0 200 200" fill="none">
          {/* Mane */}
          <circle cx="100" cy="95" r="55" fill="#D2691E" />
          {/* Face */}
          <circle cx="100" cy="100" r="40" fill="#F4A460" />
          {/* Eyes */}
          <ellipse cx="88" cy="93" rx="6" ry="7" fill="white" />
          <ellipse cx="112" cy="93" rx="6" ry="7" fill="white" />
          <circle cx="90" cy="94" r="4" fill="#2D2D3A" />
          <circle cx="114" cy="94" r="4" fill="#2D2D3A" />
          <circle cx="91" cy="92" r="1.5" fill="white" />
          <circle cx="115" cy="92" r="1.5" fill="white" />
          {/* Nose */}
          <ellipse cx="100" cy="104" rx="4" ry="3" fill="#8B4513" />
          {/* Smile */}
          <path d="M90 110C95 116 105 116 110 110" stroke="#8B4513" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          {/* Cheeks */}
          <circle cx="78" cy="105" r="5" fill="#FFB6C1" fillOpacity="0.5" />
          <circle cx="122" cy="105" r="5" fill="#FFB6C1" fillOpacity="0.5" />
          {/* Ears */}
          <circle cx="60" cy="60" r="12" fill="#D2691E" />
          <circle cx="60" cy="60" r="7" fill="#FFB6C1" />
          <circle cx="140" cy="60" r="12" fill="#D2691E" />
          <circle cx="140" cy="60" r="7" fill="#FFB6C1" />
        </svg>
      </div>

      {/* Animated title */}
      <h1 className="text-center mb-6" style={{ fontSize: 'clamp(1.8rem, 7vw, 2.8rem)' }}>
        {'Kids Learning Fun!'.split('').map((char, i) => (
          <span
            key={i}
            className="font-display text-white animate-letter-bounce inline-block"
            style={{ animationDelay: `${i * 0.05}s`, textShadow: '0 2px 8px rgba(0,0,0,0.2)', display: char === ' ' ? 'inline' : 'inline-block' }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </h1>

      {/* Loading bar */}
      <div className="w-48 h-2 rounded-full overflow-hidden bg-white/20">
        <div
          className="h-full rounded-full bg-white"
          style={{ animation: 'shimmer 1.2s ease-in-out infinite', width: '60%' }}
        />
      </div>
    </div>
  );
}

export default function App() {
  // Start offline-first background sync with backend
  useEffect(() => {
    startAutoSync();
    return () => stopAutoSync();
  }, []);

  return (
    <ErrorBoundary>
    <BrowserRouter>
      <AppProvider>
        <AccessibilityProvider>
        <CelebrationOverlay />
        <StarBurst />
        <BadgeToast />
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/menu" element={<MainMenu />} />
            <Route path="/abc" element={<AbcPage />} />
            <Route path="/numbers" element={<NumbersPage />} />
            <Route path="/colors" element={<ColorsPage />} />
            <Route path="/shapes" element={<ShapesPage />} />
            <Route path="/animals" element={<AnimalsPage />} />
            <Route path="/bodyparts" element={<BodyPartsPage />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/rewards" element={<RewardsPage />} />
            <Route path="/matching" element={<MatchingPage />} />
            <Route path="/videos" element={<VideosPage />} />
            <Route path="/stories" element={<StoriesPage />} />
            <Route path="/lessons" element={<LessonsPage />} />
            <Route path="/games" element={<GamesPage />} />
            <Route path="/printables" element={<PrintablesPage />} />
            <Route path="/parent-dashboard" element={<ParentDashboard />} />
            <Route path="/settings" element={<SettingsPage />} />
            {/* v5 new routes */}
            <Route path="/characters" element={<CharacterMeetPage />} />
            <Route path="/emotions" element={<EmotionsPage />} />
            <Route path="/bedtime" element={<BedtimePage />} />
            <Route path="/audio" element={<AudioPage />} />
            <Route path="/coloring" element={<ColoringPage />} />
            <Route path="/movement" element={<MovementPage />} />
            <Route path="/cooking" element={<CookingPage />} />
            <Route path="/home-activities" element={<HomeActivitiesPage />} />
            <Route path="/discover" element={<DiscoveryPage />} />
            <Route path="/queue" element={<QueuePage />} />
            <Route path="/assessment" element={<AssessmentPage />} />
            <Route path="/explorer" element={<ExplorerPage />} />
            <Route path="/scrapbook" element={<ScrapbookPage />} />
            {/* v6 new routes */}
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/collections" element={<CollectionsPage />} />
            <Route path="/collections/:id" element={<CollectionDetailPage />} />
            <Route path="/weekly-recap" element={<WeeklyRecapPage />} />
            <Route path="/preview" element={<PreviewPage />} />
            {/* v7 new routes */}
            <Route path="/billing" element={<BillingPage />} />
            <Route path="/parent-tips" element={<ParentTipsPage />} />
            <Route path="/help" element={<HelpCenterPage />} />
            <Route path="/privacy" element={<PrivacySettingsPage />} />
            <Route path="/inbox" element={<InboxPage />} />
            <Route path="/routines" element={<RoutinePlannerPage />} />
            <Route path="/routines/:id/play" element={<RoutinePlayerPage />} />
            {/* v8 AI-powered routes */}
            <Route path="/ai/whats-this" element={<WhatsThisPage />} />
            <Route path="/ai/drawing-detective" element={<DrawingDetectivePage />} />
            <Route path="/ai/letter-reader" element={<LetterReaderPage />} />
            <Route path="/ai/nature-explorer" element={<NatureExplorerPage />} />
            <Route path="/ai/color-finder" element={<ColorFinderPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        </AccessibilityProvider>
      </AppProvider>
    </BrowserRouter>
    </ErrorBoundary>
  );
}
