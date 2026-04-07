import { useMemo, useState } from 'react';
import { useQuery } from '../../hooks/useQuery';
import { useMutation } from '../../hooks/useMutation';
import { useToast } from '../../hooks/useToast';
import { api } from '../../lib/api';
import {
  Button,
  StatsCard,
  Card,
  DataTable,
  Input,
  LineChart,
  LoadingState,
  Badge,
  Select,
} from '../../components/ui';

/* ─── Types ─── */

interface MetricPoint {
  name: string;
  [key: string]: string | number;
}

interface MetricsResponse {
  trends: MetricPoint[];
  metricTypes: string[];
}

interface Baseline {
  metricType: string;
  p50: number;
  p75: number;
  p95: number;
  threshold: number;
}

interface BaselinesResponse {
  data: Baseline[];
}

interface Regression {
  id: string;
  metricType: string;
  current: number;
  baseline: number;
  regressionPercent: number;
  detectedAt: string;
  resolved: boolean;
}

interface RegressionsResponse {
  data: Regression[];
}

/* ─── Constants ─── */

const METRIC_COLORS: Record<string, string> = {
  startup: '#3B82F6',
  ttfb: '#22C55E',
  fcp: '#F59E0B',
  lcp: '#EF4444',
  fid: '#8B5CF6',
  cls: '#EC4899',
  memory: '#06B6D4',
  bundle: '#10B981',
};

const METRIC_OPTIONS = [
  { value: 'all', label: 'All Metrics' },
  { value: 'startup', label: 'Startup' },
  { value: 'ttfb', label: 'TTFB' },
  { value: 'fcp', label: 'FCP' },
  { value: 'lcp', label: 'LCP' },
  { value: 'fid', label: 'FID' },
  { value: 'cls', label: 'CLS' },
  { value: 'memory', label: 'Memory' },
  { value: 'bundle', label: 'Bundle Size' },
];

/* ─── Component ─── */

export function PerformanceLabPage() {
  const toast = useToast();
  const [selectedMetric, setSelectedMetric] = useState('all');
  const [editingBaselines, setEditingBaselines] = useState<Record<string, Baseline>>({});

  const { data: metricsData, loading: metricsLoading } = useQuery<MetricsResponse>(
    () => api.get('/performance/metrics', { metric: selectedMetric }),
    [selectedMetric],
  );

  const { data: baselinesData, loading: baselinesLoading, refetch: refetchBaselines } = useQuery<BaselinesResponse>(
    () => api.get('/performance/baselines'),
    [],
    {
      onSuccess: (data) => {
        const map: Record<string, Baseline> = {};
        data.data.forEach((b) => { map[b.metricType] = { ...b }; });
        setEditingBaselines(map);
      },
    },
  );

  const { data: regressionsData, loading: regressionsLoading } = useQuery<RegressionsResponse>(
    () => api.get('/performance/regressions'),
    [],
  );

  const { mutate: saveBaseline, loading: savingBaseline } = useMutation<void, Baseline>(
    (vars) => api.put(`/performance/baselines/${vars.metricType}`, vars),
    {
      onSuccess: () => {
        toast.success('Baseline updated.');
        refetchBaselines();
      },
      onError: (err) => toast.error(err.message),
    },
  );

  const baselines = baselinesData?.data ?? [];
  const regressions = regressionsData?.data ?? [];
  const trends = metricsData?.trends ?? [];

  // Derive stats from baselines (startup metric)
  const startupBaseline = baselines.find((b) => b.metricType === 'startup');

  // Build line chart config
  const chartLines = useMemo(() => {
    if (!metricsData?.metricTypes) return [];
    const types = selectedMetric === 'all' ? metricsData.metricTypes : [selectedMetric];
    return types.map((mt) => ({
      dataKey: mt,
      color: METRIC_COLORS[mt] ?? '#6B7280',
      label: mt.toUpperCase(),
    }));
  }, [metricsData, selectedMetric]);

  // Regression table columns
  const regressionColumns = useMemo(
    () => [
      {
        key: 'metricType',
        header: 'Metric',
        render: (item: Regression) => (
          <span className="font-medium text-text uppercase text-sm">{item.metricType}</span>
        ),
      },
      {
        key: 'current',
        header: 'Current',
        render: (item: Regression) => (
          <span className="text-sm text-text tabular-nums">{item.current.toFixed(1)}ms</span>
        ),
      },
      {
        key: 'baseline',
        header: 'Baseline',
        render: (item: Regression) => (
          <span className="text-sm text-text-secondary tabular-nums">{item.baseline.toFixed(1)}ms</span>
        ),
      },
      {
        key: 'regressionPercent',
        header: 'Regression',
        render: (item: Regression) => (
          <span className="text-sm font-semibold text-danger tabular-nums">
            +{item.regressionPercent.toFixed(1)}%
          </span>
        ),
      },
      {
        key: 'detectedAt',
        header: 'Detected',
        render: (item: Regression) => (
          <span className="text-sm text-text-secondary">
            {new Date(item.detectedAt).toLocaleDateString()}
          </span>
        ),
      },
      {
        key: 'resolved',
        header: 'Status',
        render: (item: Regression) => (
          <Badge variant={item.resolved ? 'success' : 'danger'}>
            {item.resolved ? 'Resolved' : 'Active'}
          </Badge>
        ),
      },
    ],
    [],
  );

  if (metricsLoading && baselinesLoading) {
    return <LoadingState message="Loading performance data..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Performance Lab</h1>
          <p className="text-text-secondary mt-1">
            Monitor app performance metrics, manage baselines, and detect regressions.
          </p>
        </div>
        <Select
          options={METRIC_OPTIONS}
          value={selectedMetric}
          onChange={(e) => setSelectedMetric(e.target.value)}
          className="w-40"
        />
      </div>

      {/* Stats Cards - Startup baselines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Startup p50"
          value={startupBaseline ? `${startupBaseline.p50}ms` : '--'}
        />
        <StatsCard
          title="Startup p75"
          value={startupBaseline ? `${startupBaseline.p75}ms` : '--'}
        />
        <StatsCard
          title="Startup p95"
          value={startupBaseline ? `${startupBaseline.p95}ms` : '--'}
        />
        <StatsCard
          title="Active Regressions"
          value={regressions.filter((r) => !r.resolved).length}
        />
      </div>

      {/* Trend Chart */}
      {trends.length > 0 && (
        <Card title="Metric Trends">
          <LineChart data={trends} lines={chartLines} height={320} />
        </Card>
      )}

      {/* Regressions Table */}
      <div>
        <h2 className="text-lg font-semibold text-text mb-3">Regression Detection</h2>
        {regressionsLoading ? (
          <LoadingState message="Loading regressions..." />
        ) : (
          <DataTable
            columns={regressionColumns}
            data={regressions}
            emptyMessage="No regressions detected. Performance is within acceptable thresholds."
          />
        )}
      </div>

      {/* Baseline Editor */}
      <div>
        <h2 className="text-lg font-semibold text-text mb-3">Baseline Editor</h2>
        <p className="text-sm text-text-secondary mb-4">
          Set performance baselines per metric. Regressions are flagged when values exceed thresholds.
        </p>

        {baselinesLoading ? (
          <LoadingState message="Loading baselines..." />
        ) : (
          <div className="space-y-4">
            {Object.entries(editingBaselines).map(([metricType, baseline]) => (
              <Card key={metricType}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-text uppercase mb-3">
                      {metricType}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <Input
                        label="p50 (ms)"
                        type="number"
                        value={String(baseline.p50)}
                        onChange={(e) =>
                          setEditingBaselines((prev) => ({
                            ...prev,
                            [metricType]: { ...prev[metricType], p50: Number(e.target.value) },
                          }))
                        }
                      />
                      <Input
                        label="p75 (ms)"
                        type="number"
                        value={String(baseline.p75)}
                        onChange={(e) =>
                          setEditingBaselines((prev) => ({
                            ...prev,
                            [metricType]: { ...prev[metricType], p75: Number(e.target.value) },
                          }))
                        }
                      />
                      <Input
                        label="p95 (ms)"
                        type="number"
                        value={String(baseline.p95)}
                        onChange={(e) =>
                          setEditingBaselines((prev) => ({
                            ...prev,
                            [metricType]: { ...prev[metricType], p95: Number(e.target.value) },
                          }))
                        }
                      />
                      <Input
                        label="Threshold (ms)"
                        type="number"
                        value={String(baseline.threshold)}
                        onChange={(e) =>
                          setEditingBaselines((prev) => ({
                            ...prev,
                            [metricType]: { ...prev[metricType], threshold: Number(e.target.value) },
                          }))
                        }
                      />
                    </div>
                  </div>
                  <Button
                    size="sm"
                    loading={savingBaseline}
                    onClick={() => saveBaseline(editingBaselines[metricType])}
                  >
                    Save
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
