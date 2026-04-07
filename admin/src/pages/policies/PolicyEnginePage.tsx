import { useMemo, useState } from 'react';
import { useQuery } from '../../hooks/useQuery';
import { useMutation } from '../../hooks/useMutation';
import { useToast } from '../../hooks/useToast';
import { api } from '../../lib/api';
import {
  Badge,
  Button,
  Card,
  DataTable,
  Input,
  LoadingState,
  PieChart,
  StatsCard,
  Tabs,
  Toggle,
} from '../../components/ui';

/* ─── Types ─── */

interface Policy {
  id: string;
  name: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  description: string;
}

interface PolicyCheckResult {
  policyName: string;
  status: 'pass' | 'warning' | 'block';
  message: string;
}

interface PolicyCheckResponse {
  contentId: string;
  results: PolicyCheckResult[];
  summary: { pass: number; warning: number; block: number };
}

/* ─── Constants ─── */

const SEVERITY_VARIANTS: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
  low: 'info',
  medium: 'warning',
  high: 'danger',
  critical: 'danger',
};

const CATEGORY_VARIANTS: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'default'> = {
  safety: 'danger',
  quality: 'primary',
  compliance: 'warning',
  accessibility: 'info',
  performance: 'success',
};

const STATUS_VARIANTS: Record<string, 'success' | 'warning' | 'danger'> = {
  pass: 'success',
  warning: 'warning',
  block: 'danger',
};

const TAB_ITEMS = [
  { key: 'policies', label: 'Policy List' },
  { key: 'checker', label: 'Content Checker' },
  { key: 'dashboard', label: 'Results Dashboard' },
];

/* ─── Component ─── */

export function PolicyEnginePage() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('policies');
  const [contentId, setContentId] = useState('');
  const [checkResults, setCheckResults] = useState<PolicyCheckResponse | null>(null);

  // Policy list
  const { data: policies, loading: policiesLoading, refetch } = useQuery<Policy[]>(
    () => api.get('/policies'),
    [],
  );

  // Toggle policy
  const { mutate: togglePolicy } = useMutation<Policy, { id: string; enabled: boolean }>(
    ({ id, enabled }) => api.patch(`/policies/${id}`, { enabled }),
    { onSuccess: () => refetch() },
  );

  // Run policy check
  const { mutate: runCheck, loading: checking } = useMutation<PolicyCheckResponse, string>(
    (id) => api.post(`/content/${id}/policies/check`),
    {
      onSuccess: (data) => {
        if (data) {
          setCheckResults(data);
          toast.success('Policy check completed');
        }
      },
      onError: () => toast.error('Failed to run policy check'),
    },
  );

  // Policy list columns
  const policyColumns = useMemo(
    () => [
      {
        key: 'name',
        header: 'Policy Name',
        render: (item: Policy) => (
          <div>
            <span className="font-medium text-text">{item.name}</span>
            <p className="text-xs text-text-muted mt-0.5">{item.description}</p>
          </div>
        ),
      },
      {
        key: 'category',
        header: 'Category',
        render: (item: Policy) => (
          <Badge variant={CATEGORY_VARIANTS[item.category] ?? 'default'}>
            {item.category}
          </Badge>
        ),
      },
      {
        key: 'severity',
        header: 'Severity',
        render: (item: Policy) => (
          <Badge variant={SEVERITY_VARIANTS[item.severity] ?? 'default'}>
            {item.severity}
          </Badge>
        ),
      },
      {
        key: 'enabled',
        header: 'Enabled',
        render: (item: Policy) => (
          <Toggle
            enabled={item.enabled}
            onChange={(val) => togglePolicy({ id: item.id, enabled: val })}
          />
        ),
      },
    ],
    [togglePolicy],
  );

  // Check result columns
  const resultColumns = useMemo(
    () => [
      {
        key: 'policyName',
        header: 'Policy',
        render: (item: PolicyCheckResult) => (
          <span className="font-medium text-text">{item.policyName}</span>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        render: (item: PolicyCheckResult) => (
          <Badge variant={STATUS_VARIANTS[item.status] ?? 'default'}>
            {item.status}
          </Badge>
        ),
      },
      {
        key: 'message',
        header: 'Message',
        render: (item: PolicyCheckResult) => (
          <span className="text-sm text-text-secondary">{item.message}</span>
        ),
      },
    ],
    [],
  );

  // Dashboard pie chart data
  const pieData = useMemo(() => {
    if (!checkResults) return [];
    return [
      { name: 'Pass', value: checkResults.summary.pass, fill: '#22C55E' },
      { name: 'Warning', value: checkResults.summary.warning, fill: '#F59E0B' },
      { name: 'Block', value: checkResults.summary.block, fill: '#EF4444' },
    ];
  }, [checkResults]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text">Policy Engine</h1>
        <p className="text-text-secondary mt-1">Content policies, compliance checks, and enforcement rules.</p>
      </div>

      {/* Tabs */}
      <Tabs tabs={TAB_ITEMS} activeKey={activeTab} onChange={setActiveTab} />

      {/* Policy List Tab */}
      {activeTab === 'policies' && (
        <>
          {policiesLoading ? (
            <LoadingState message="Loading policies..." />
          ) : (
            <DataTable
              columns={policyColumns}
              data={policies ?? []}
              loading={policiesLoading}
              emptyMessage="No policies configured."
            />
          )}
        </>
      )}

      {/* Content Checker Tab */}
      {activeTab === 'checker' && (
        <div className="space-y-6">
          <Card>
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-text">Content Policy Checker</h2>
              <div className="flex items-end gap-3">
                <Input
                  label="Content ID"
                  value={contentId}
                  onChange={(e) => setContentId(e.target.value)}
                  placeholder="Enter content ID"
                  className="flex-1"
                />
                <Button
                  loading={checking}
                  disabled={!contentId.trim()}
                  onClick={() => runCheck(contentId.trim())}
                >
                  Run Check
                </Button>
              </div>
            </div>
          </Card>

          {checkResults && (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard title="Total Checks" value={checkResults.results.length} />
                <StatsCard title="Passed" value={checkResults.summary.pass} />
                <StatsCard title="Warnings" value={checkResults.summary.warning} />
                <StatsCard title="Blocked" value={checkResults.summary.block} />
              </div>

              {/* Results Table */}
              <DataTable
                columns={resultColumns}
                data={checkResults.results}
                loading={false}
                emptyMessage="No check results."
              />
            </>
          )}
        </div>
      )}

      {/* Results Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {checkResults ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard title="Total Checks" value={checkResults.results.length} />
                <StatsCard title="Pass Rate" value={`${checkResults.results.length ? Math.round((checkResults.summary.pass / checkResults.results.length) * 100) : 0}%`} />
                <StatsCard title="Warnings" value={checkResults.summary.warning} />
                <StatsCard title="Blocks" value={checkResults.summary.block} />
              </div>
              <Card>
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-text">Results Distribution</h2>
                  <PieChart data={pieData} height={300} />
                </div>
              </Card>
            </>
          ) : (
            <Card>
              <div className="py-12 text-center text-text-muted">
                Run a policy check first to see the results dashboard.
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
