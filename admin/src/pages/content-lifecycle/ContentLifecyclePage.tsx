import { useMemo, useState } from 'react';
import { useQuery } from '../../hooks/useQuery';
import { usePagination } from '../../hooks/usePagination';
import { useMutation } from '../../hooks/useMutation';
import { useToast } from '../../hooks/useToast';
import { api } from '../../lib/api';
import {
  Button,
  StatsCard,
  DataTable,
  Pagination,
  Badge,
  Card,
  LineChart,
  LoadingState,
} from '../../components/ui';

/* ─── Types ─── */

interface LifecycleItem {
  id: string;
  title: string;
  type: string;
  freshnessScore: number;
  needsRefresh: boolean;
  lastRefreshDate: string | null;
  nextReviewDate: string;
  status: 'evergreen' | 'fresh' | 'stale' | 'critical';
}

interface LifecycleStats {
  totalPublished: number;
  needsRefresh: number;
  lowFreshness: number;
  evergreen: number;
  upcomingReviews: number;
}

interface RefreshQueueResponse {
  data: LifecycleItem[];
  total: number;
  page: number;
  pageSize: number;
}

interface LifecycleStatsResponse {
  stats: LifecycleStats;
  freshnessOverTime: { name: string; avgFreshness: number; refreshed: number }[];
}

/* ─── Constants ─── */

const STATUS_VARIANTS: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
  evergreen: 'success',
  fresh: 'info',
  stale: 'warning',
  critical: 'danger',
};

const FRESHNESS_COLORS: Record<string, string> = {
  high: 'text-success',
  medium: 'text-warning',
  low: 'text-danger',
};

function getFreshnessColorClass(score: number): string {
  if (score >= 70) return FRESHNESS_COLORS.high;
  if (score >= 40) return FRESHNESS_COLORS.medium;
  return FRESHNESS_COLORS.low;
}

function getFreshnessBgClass(score: number): string {
  if (score >= 70) return 'bg-success/10';
  if (score >= 40) return 'bg-warning/10';
  return 'bg-danger/10';
}

/* ─── Component ─── */

export function ContentLifecyclePage() {
  const toast = useToast();
  const { page, limit, setPage } = usePagination({ initialLimit: 20 });

  const queryParams = useMemo(
    () => ({ page, pageSize: limit, sort: 'freshnessScore' }),
    [page, limit],
  );

  const { data: queueData, loading: queueLoading, error: queueError, refetch } = useQuery<RefreshQueueResponse>(
    () => api.get('/content/lifecycle/refresh-queue', queryParams),
    [JSON.stringify(queryParams)],
  );

  const { data: statsData, loading: statsLoading } = useQuery<LifecycleStatsResponse>(
    () => api.get('/content/lifecycle/stats'),
    [],
  );

  const { mutate: markRefreshed, loading: refreshing } = useMutation<void, { id: string }>(
    (vars) => api.post(`/content/${vars.id}/lifecycle/refresh`),
    {
      onSuccess: () => {
        toast.success('Content marked as refreshed.');
        refetch();
      },
      onError: (err) => toast.error(err.message),
    },
  );

  const items = queueData?.data ?? [];
  const total = queueData?.total ?? 0;
  const totalPages = Math.ceil(total / limit);
  const stats = statsData?.stats;
  const freshnessChart = statsData?.freshnessOverTime ?? [];

  const columns = useMemo(
    () => [
      {
        key: 'title',
        header: 'Title',
        render: (item: LifecycleItem) => (
          <span className="font-medium text-text">{item.title}</span>
        ),
      },
      {
        key: 'type',
        header: 'Type',
        render: (item: LifecycleItem) => (
          <span className="text-sm text-text-secondary capitalize">{item.type}</span>
        ),
      },
      {
        key: 'freshnessScore',
        header: 'Freshness',
        render: (item: LifecycleItem) => (
          <div className="flex items-center gap-2">
            <div className={`px-2 py-0.5 rounded text-xs font-semibold ${getFreshnessColorClass(item.freshnessScore)} ${getFreshnessBgClass(item.freshnessScore)}`}>
              {item.freshnessScore}
            </div>
            <div className="w-16 h-1.5 bg-border rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${item.freshnessScore >= 70 ? 'bg-success' : item.freshnessScore >= 40 ? 'bg-warning' : 'bg-danger'}`}
                style={{ width: `${item.freshnessScore}%` }}
              />
            </div>
          </div>
        ),
      },
      {
        key: 'needsRefresh',
        header: 'Refresh',
        render: (item: LifecycleItem) =>
          item.needsRefresh ? (
            <Badge variant="danger">Needs Refresh</Badge>
          ) : (
            <Badge variant="success">OK</Badge>
          ),
      },
      {
        key: 'status',
        header: 'Status',
        render: (item: LifecycleItem) => (
          <Badge variant={STATUS_VARIANTS[item.status] ?? 'default'}>
            {item.status}
          </Badge>
        ),
      },
      {
        key: 'lastRefreshDate',
        header: 'Last Refreshed',
        render: (item: LifecycleItem) => (
          <span className="text-sm text-text-secondary">
            {item.lastRefreshDate ? new Date(item.lastRefreshDate).toLocaleDateString() : 'Never'}
          </span>
        ),
      },
      {
        key: 'nextReviewDate',
        header: 'Next Review',
        render: (item: LifecycleItem) => (
          <span className="text-sm text-text-secondary">
            {new Date(item.nextReviewDate).toLocaleDateString()}
          </span>
        ),
      },
      {
        key: 'actions',
        header: '',
        render: (item: LifecycleItem) => (
          <Button
            size="sm"
            variant="secondary"
            loading={refreshing}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              markRefreshed({ id: item.id });
            }}
          >
            Mark Refreshed
          </Button>
        ),
      },
    ],
    [refreshing],
  );

  if (queueError) {
    return (
      <div className="space-y-6">
        <div className="bg-danger/10 border border-danger/20 rounded-lg p-4 text-danger text-sm">
          Failed to load lifecycle data: {queueError.message}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text">Content Lifecycle</h1>
        <p className="text-text-secondary mt-1">
          Track content freshness, manage review schedules, and keep content up to date.
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard title="Total Published" value={stats?.totalPublished ?? 0} />
        <StatsCard title="Needs Refresh" value={stats?.needsRefresh ?? 0} />
        <StatsCard title="Low Freshness" value={stats?.lowFreshness ?? 0} />
        <StatsCard title="Evergreen" value={stats?.evergreen ?? 0} />
        <StatsCard title="Upcoming Reviews" value={stats?.upcomingReviews ?? 0} />
      </div>

      {/* Freshness Chart */}
      {freshnessChart.length > 0 && (
        <Card title="Freshness Over Time">
          <LineChart
            data={freshnessChart}
            lines={[
              { dataKey: 'avgFreshness', color: '#3B82F6', label: 'Avg Freshness' },
              { dataKey: 'refreshed', color: '#22C55E', label: 'Items Refreshed' },
            ]}
            height={280}
          />
        </Card>
      )}

      {/* Refresh Queue Table */}
      <div>
        <h2 className="text-lg font-semibold text-text mb-3">Refresh Queue</h2>

        {queueLoading && !queueData ? (
          <LoadingState message="Loading refresh queue..." />
        ) : (
          <DataTable
            columns={columns}
            data={items}
            loading={queueLoading}
            emptyMessage="All content is fresh. Nothing in the refresh queue."
          />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-text-secondary">
              Showing {(page - 1) * limit + 1}--{Math.min(page * limit, total)} of {total}
            </p>
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* Seasonal Calendar Preview */}
      <Card title="Seasonal Calendar">
        <p className="text-sm text-text-secondary mb-4">
          Upcoming seasonal content milestones and refresh opportunities.
        </p>
        <SeasonalCalendar />
      </Card>
    </div>
  );
}

/* ─── Sub-component: Seasonal Calendar ─── */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const SEASONAL_EVENTS = [
  { month: 0, label: 'New Year', color: 'bg-primary' },
  { month: 1, label: 'Valentine\'s Day', color: 'bg-danger' },
  { month: 2, label: 'Spring Equinox', color: 'bg-success' },
  { month: 3, label: 'Easter', color: 'bg-warning' },
  { month: 5, label: 'Summer Start', color: 'bg-info' },
  { month: 8, label: 'Back to School', color: 'bg-primary' },
  { month: 9, label: 'Halloween', color: 'bg-warning' },
  { month: 10, label: 'Thanksgiving', color: 'bg-success' },
  { month: 11, label: 'Holidays', color: 'bg-danger' },
];

function SeasonalCalendar() {
  const currentMonth = new Date().getMonth();

  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2">
      {MONTHS.map((month, idx) => {
        const event = SEASONAL_EVENTS.find((e) => e.month === idx);
        const isCurrent = idx === currentMonth;

        return (
          <div
            key={month}
            className={`p-2 rounded-lg text-center border ${
              isCurrent
                ? 'border-primary bg-primary/5'
                : 'border-border bg-bg'
            }`}
          >
            <p className={`text-xs font-semibold ${isCurrent ? 'text-primary' : 'text-text-secondary'}`}>
              {month}
            </p>
            {event && (
              <div className={`mt-1 w-2 h-2 rounded-full mx-auto ${event.color}`} title={event.label} />
            )}
            {event && (
              <p className="text-[10px] text-text-muted mt-0.5 truncate">{event.label}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
