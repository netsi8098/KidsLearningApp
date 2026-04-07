import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AdminLayout } from './layouts/AdminLayout';
import { RequireAuth } from './components/guards/RequireAuth';
import { LoginPage } from './pages/LoginPage';

/* ---------- lazy page imports ---------- */

// Dashboard
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));

// Content
const ContentListPage = lazy(() => import('./pages/content/ContentListPage').then(m => ({ default: m.ContentListPage })));
const ContentDetailPage = lazy(() => import('./pages/content/ContentDetailPage').then(m => ({ default: m.ContentDetailPage })));
const ContentEditorPage = lazy(() => import('./pages/content/ContentEditorPage').then(m => ({ default: m.ContentEditorPage })));

// Assets
const AssetLibraryPage = lazy(() => import('./pages/assets/AssetLibraryPage').then(m => ({ default: m.AssetLibraryPage })));
const AssetDetailPage = lazy(() => import('./pages/assets/AssetDetailPage').then(m => ({ default: m.AssetDetailPage })));

// Collections
const CollectionsPage = lazy(() => import('./pages/collections/CollectionsPage').then(m => ({ default: m.CollectionsPage })));

// Reviews
const ReviewQueuePage = lazy(() => import('./pages/reviews/ReviewQueuePage').then(m => ({ default: m.ReviewQueuePage })));
const ReviewDetailPage = lazy(() => import('./pages/reviews/ReviewDetailPage').then(m => ({ default: m.ReviewDetailPage })));

// Releases
const ReleaseCalendarPage = lazy(() => import('./pages/releases/ReleaseCalendarPage').then(m => ({ default: m.ReleaseCalendarPage })));
const ReleaseDetailPage = lazy(() => import('./pages/releases/ReleaseDetailPage').then(m => ({ default: m.ReleaseDetailPage })));

// Localization
const LocalizationDashboardPage = lazy(() => import('./pages/localization/LocalizationDashboardPage').then(m => ({ default: m.LocalizationDashboardPage })));

// Analytics
const AnalyticsDashboardPage = lazy(() => import('./pages/analytics/AnalyticsDashboardPage').then(m => ({ default: m.AnalyticsDashboardPage })));

// Experiments
const ExperimentsListPage = lazy(() => import('./pages/experiments/ExperimentsListPage').then(m => ({ default: m.ExperimentsListPage })));
const ExperimentDetailPage = lazy(() => import('./pages/experiments/ExperimentDetailPage').then(m => ({ default: m.ExperimentDetailPage })));

// Households
const HouseholdSearchPage = lazy(() => import('./pages/households/HouseholdSearchPage').then(m => ({ default: m.HouseholdSearchPage })));
const HouseholdDetailPage = lazy(() => import('./pages/households/HouseholdDetailPage').then(m => ({ default: m.HouseholdDetailPage })));

// Permissions
const PermissionsPage = lazy(() => import('./pages/permissions/PermissionsPage').then(m => ({ default: m.PermissionsPage })));

// Audit
const AuditLogPage = lazy(() => import('./pages/audit/AuditLogPage').then(m => ({ default: m.AuditLogPage })));

// Search
const SearchIndexPage = lazy(() => import('./pages/search/SearchIndexPage').then(m => ({ default: m.SearchIndexPage })));

// System
const SystemHealthPage = lazy(() => import('./pages/system/SystemHealthPage').then(m => ({ default: m.SystemHealthPage })));

// Maintenance
const MaintenancePage = lazy(() => import('./pages/maintenance/MaintenancePage').then(m => ({ default: m.MaintenancePage })));

// Subscriptions
const SubscriptionListPage = lazy(() => import('./pages/subscriptions/SubscriptionListPage').then(m => ({ default: m.SubscriptionListPage })));
const SubscriptionDetailPage = lazy(() => import('./pages/subscriptions/SubscriptionDetailPage').then(m => ({ default: m.SubscriptionDetailPage })));

// Feature Flags
const FeatureFlagsPage = lazy(() => import('./pages/feature-flags/FeatureFlagsPage').then(m => ({ default: m.FeatureFlagsPage })));

// Recommendations
const RecommendationLabPage = lazy(() => import('./pages/recommendations/RecommendationLabPage').then(m => ({ default: m.RecommendationLabPage })));

// Content Lifecycle
const ContentLifecyclePage = lazy(() => import('./pages/content-lifecycle/ContentLifecyclePage').then(m => ({ default: m.ContentLifecyclePage })));

// Merchandising
const MerchandisingPage = lazy(() => import('./pages/merchandising/MerchandisingPage').then(m => ({ default: m.MerchandisingPage })));

// Performance
const PerformanceLabPage = lazy(() => import('./pages/performance/PerformanceLabPage').then(m => ({ default: m.PerformanceLabPage })));

// Errors
const ErrorTriagePage = lazy(() => import('./pages/errors/ErrorTriagePage').then(m => ({ default: m.ErrorTriagePage })));

// Journeys
const JourneyBuilderPage = lazy(() => import('./pages/journeys/JourneyBuilderPage').then(m => ({ default: m.JourneyBuilderPage })));

// Exports
const ExportPage = lazy(() => import('./pages/exports/ExportPage').then(m => ({ default: m.ExportPage })));

// SLA
const SLADashboardPage = lazy(() => import('./pages/sla/SLADashboardPage').then(m => ({ default: m.SLADashboardPage })));

// Policies
const PolicyEnginePage = lazy(() => import('./pages/policies/PolicyEnginePage').then(m => ({ default: m.PolicyEnginePage })));

// Help Articles
const HelpArticleEditorPage = lazy(() => import('./pages/help-articles/HelpArticleEditorPage').then(m => ({ default: m.HelpArticleEditorPage })));

// Support Tickets
const SupportTicketsPage = lazy(() => import('./pages/support-tickets/SupportTicketsPage').then(m => ({ default: m.SupportTicketsPage })));

// Messages
const MessageComposerPage = lazy(() => import('./pages/messages/MessageComposerPage').then(m => ({ default: m.MessageComposerPage })));

// Deep Links
const DeepLinksPage = lazy(() => import('./pages/deep-links/DeepLinksPage').then(m => ({ default: m.DeepLinksPage })));

/* ---------- loading fallback ---------- */

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-6 w-6 animate-spin rounded-full border-3 border-primary border-t-transparent" />
        <p className="text-sm text-text-muted">Loading page...</p>
      </div>
    </div>
  );
}

function lazy$(Component: React.LazyExoticComponent<React.ComponentType>) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  );
}

/* ---------- route definitions ---------- */

const authenticatedRoutes: RouteObject[] = [
  // Dashboard
  { index: true, element: lazy$(DashboardPage) },

  // Content
  { path: 'content', element: lazy$(ContentListPage) },
  { path: 'content/new', element: lazy$(ContentEditorPage) },
  { path: 'content/:id', element: lazy$(ContentDetailPage) },
  { path: 'content/:id/edit', element: lazy$(ContentEditorPage) },

  // Assets
  { path: 'assets', element: lazy$(AssetLibraryPage) },
  { path: 'assets/:id', element: lazy$(AssetDetailPage) },

  // Collections
  { path: 'collections', element: lazy$(CollectionsPage) },

  // Reviews
  { path: 'reviews', element: lazy$(ReviewQueuePage) },
  { path: 'reviews/:id', element: lazy$(ReviewDetailPage) },

  // Releases
  { path: 'releases', element: lazy$(ReleaseCalendarPage) },
  { path: 'releases/:id', element: lazy$(ReleaseDetailPage) },

  // Localization
  { path: 'localization', element: lazy$(LocalizationDashboardPage) },

  // Analytics
  { path: 'analytics', element: lazy$(AnalyticsDashboardPage) },

  // Experiments
  { path: 'experiments', element: lazy$(ExperimentsListPage) },
  { path: 'experiments/:id', element: lazy$(ExperimentDetailPage) },

  // Households
  { path: 'households', element: lazy$(HouseholdSearchPage) },
  { path: 'households/:id', element: lazy$(HouseholdDetailPage) },

  // Permissions
  { path: 'permissions', element: lazy$(PermissionsPage) },

  // Audit
  { path: 'audit', element: lazy$(AuditLogPage) },

  // Search
  { path: 'search', element: lazy$(SearchIndexPage) },

  // System
  { path: 'system', element: lazy$(SystemHealthPage) },

  // Maintenance
  { path: 'maintenance', element: lazy$(MaintenancePage) },

  // Subscriptions
  { path: 'subscriptions', element: lazy$(SubscriptionListPage) },
  { path: 'subscriptions/:id', element: lazy$(SubscriptionDetailPage) },

  // Feature Flags
  { path: 'feature-flags', element: lazy$(FeatureFlagsPage) },

  // Recommendations
  { path: 'recommendations', element: lazy$(RecommendationLabPage) },

  // Content Lifecycle
  { path: 'content-lifecycle', element: lazy$(ContentLifecyclePage) },

  // Merchandising
  { path: 'merchandising', element: lazy$(MerchandisingPage) },

  // Performance
  { path: 'performance', element: lazy$(PerformanceLabPage) },

  // Errors
  { path: 'errors', element: lazy$(ErrorTriagePage) },

  // Journeys
  { path: 'journeys', element: lazy$(JourneyBuilderPage) },

  // Exports
  { path: 'exports', element: lazy$(ExportPage) },

  // SLA
  { path: 'sla', element: lazy$(SLADashboardPage) },

  // Policies
  { path: 'policies', element: lazy$(PolicyEnginePage) },

  // Help Articles
  { path: 'help-articles', element: lazy$(HelpArticleEditorPage) },

  // Support Tickets
  { path: 'support-tickets', element: lazy$(SupportTicketsPage) },

  // Messages
  { path: 'messages', element: lazy$(MessageComposerPage) },

  // Deep Links
  { path: 'deep-links', element: lazy$(DeepLinksPage) },
];

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <RequireAuth>
        <AdminLayout />
      </RequireAuth>
    ),
    children: authenticatedRoutes,
  },
]);
