import { useMemo, useState } from 'react';
import { useQuery } from '../../hooks/useQuery';
import { useFilters } from '../../hooks/useFilters';
import { api } from '../../lib/api';
import {
  Badge,
  BarChart,
  Card,
  DataTable,
  FilterBar,
  Input,
  LoadingState,
  Select,
  StatsCard,
} from '../../components/ui';

/* ─── Types ─── */

interface SLAOverview {
  totalInPipeline: number;
  avgTimeToPublishHours: number;
  overdueCount: number;
  onTrackPercent: number;
}

interface FunnelStage {
  name: string;
  value: number;
}

interface Bottleneck {
  id: string;
  contentTitle: string;
  stage: string;
  stuckHours: number;
  author: string;
}

interface AgingItem {
  id: string;
  contentTitle: string;
  stage: string;
  ageDays: number;
  assignee: string;
}

/* ─── Constants ─── */

const STAGE_OPTIONS = [
  { value: '', label: 'All Stages' },
  { value: 'draft', label: 'Draft' },
  { value: 'review', label: 'Review' },
  { value: 'approval', label: 'Approval' },
  { value: 'publish', label: 'Publish' },
  { value: 'translation', label: 'Translation' },
  { value: 'asset', label: 'Asset' },
  { value: 'voice', label: 'Voice' },
];

function severityColor(hours: number): string {
  if (hours < 24) return 'text-success';
  if (hours < 72) return 'text-warning';
  return 'text-danger';
}

function severityVariant(hours: number): 'success' | 'warning' | 'danger' {
  if (hours < 24) return 'success';
  if (hours < 72) return 'warning';
  return 'danger';
}

/* ─── Component ─── */

export function SLADashboardPage() {
  const { filters, setFilter, clearFilters } = useFilters({ stage: '' });
  const [daysThreshold, setDaysThreshold] = useState('3');

  // SLA overview
  const { data: overview, loading: overviewLoading } = useQuery<SLAOverview>(
    () => api.get('/analytics/sla'),
    [],
  );

  // Pipeline funnel
  const { data: funnel, loading: funnelLoading } = useQuery<FunnelStage[]>(
    () => api.get('/analytics/sla/funnel'),
    [],
  );

  // Bottlenecks
  const { data: bottlenecks, loading: bottlenecksLoading } = useQuery<Bottleneck[]>(
    () => api.get('/analytics/sla/bottlenecks'),
    [],
  );

  // Aging queue
  const agingParams = useMemo(
    () => ({
      ...(filters.stage && { stage: filters.stage }),
      daysThreshold: Number(daysThreshold) || 3,
    }),
    [filters.stage, daysThreshold],
  );

  const { data: aging, loading: agingLoading } = useQuery<AgingItem[]>(
    () => api.get('/analytics/sla/aging', agingParams),
    [JSON.stringify(agingParams)],
  );

  // Chart data
  const funnelChartData = useMemo(
    () => (funnel ?? []).map((s) => ({ name: s.name, value: s.value })),
    [funnel],
  );

  // Bottleneck columns
  const bottleneckColumns = useMemo(
    () => [
      {
        key: 'contentTitle',
        header: 'Content',
        render: (item: Bottleneck) => (
          <span className="font-medium text-text">{item.contentTitle}</span>
        ),
      },
      {
        key: 'stage',
        header: 'Stage',
        render: (item: Bottleneck) => (
          <Badge variant="default">{item.stage}</Badge>
        ),
      },
      {
        key: 'stuckHours',
        header: 'Stuck Hours',
        render: (item: Bottleneck) => (
          <span className={`text-sm font-semibold ${severityColor(item.stuckHours)}`}>
            {item.stuckHours}h
          </span>
        ),
      },
      {
        key: 'severity',
        header: 'Severity',
        render: (item: Bottleneck) => (
          <Badge variant={severityVariant(item.stuckHours)}>
            {item.stuckHours < 24 ? 'OK' : item.stuckHours < 72 ? 'Warning' : 'Critical'}
          </Badge>
        ),
      },
      {
        key: 'author',
        header: 'Author',
        render: (item: Bottleneck) => (
          <span className="text-sm text-text-secondary">{item.author}</span>
        ),
      },
    ],
    [],
  );

  // Aging columns
  const agingColumns = useMemo(
    () => [
      {
        key: 'contentTitle',
        header: 'Content',
        render: (item: AgingItem) => (
          <span className="font-medium text-text">{item.contentTitle}</span>
        ),
      },
      {
        key: 'stage',
        header: 'Stage',
        render: (item: AgingItem) => (
          <Badge variant="default">{item.stage}</Badge>
        ),
      },
      {
        key: 'ageDays',
        header: 'Age (Days)',
        render: (item: AgingItem) => (
          <span className={`text-sm font-semibold ${severityColor(item.ageDays * 24)}`}>
            {item.ageDays}d
          </span>
        ),
      },
      {
        key: 'assignee',
        header: 'Assignee',
        render: (item: AgingItem) => (
          <span className="text-sm text-text-secondary">{item.assignee}</span>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text">SLA Dashboard</h1>
        <p className="text-text-secondary mt-1">Pipeline health, bottlenecks, and aging content.</p>
      </div>

      {/* Stats */}
      {overviewLoading ? (
        <LoadingState message="Loading SLA overview..." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="In Pipeline" value={overview?.totalInPipeline ?? 0} />
          <StatsCard title="Avg Time to Publish" value={`${overview?.avgTimeToPublishHours ?? 0}h`} />
          <StatsCard title="Overdue" value={overview?.overdueCount ?? 0} />
          <StatsCard title="On Track" value={`${overview?.onTrackPercent ?? 0}%`} />
        </div>
      )}

      {/* Pipeline Funnel */}
      <Card>
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-text">Pipeline Funnel</h2>
          {funnelLoading ? (
            <LoadingState message="Loading funnel data..." size="sm" />
          ) : (
            <BarChart data={funnelChartData} height={280} color="#3B82F6" />
          )}
        </div>
      </Card>

      {/* Bottleneck Table */}
      <Card>
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-text">Bottlenecks</h2>
          {bottlenecksLoading ? (
            <LoadingState message="Loading bottlenecks..." size="sm" />
          ) : (
            <DataTable
              columns={bottleneckColumns}
              data={bottlenecks ?? []}
              loading={bottlenecksLoading}
              emptyMessage="No bottlenecks detected."
            />
          )}
        </div>
      </Card>

      {/* Aging Queue */}
      <Card>
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-text">Aging Queue</h2>
          <FilterBar onReset={() => { clearFilters(); setDaysThreshold('3'); }}>
            <Select
              options={STAGE_OPTIONS}
              value={filters.stage as string}
              onChange={(e) => setFilter('stage', e.target.value)}
              className="w-44"
            />
            <Input
              type="number"
              value={daysThreshold}
              onChange={(e) => setDaysThreshold(e.target.value)}
              placeholder="Days threshold"
              className="w-36"
            />
          </FilterBar>
          {agingLoading ? (
            <LoadingState message="Loading aging queue..." size="sm" />
          ) : (
            <DataTable
              columns={agingColumns}
              data={aging ?? []}
              loading={agingLoading}
              emptyMessage="No aging content found above threshold."
            />
          )}
        </div>
      </Card>
    </div>
  );
}
