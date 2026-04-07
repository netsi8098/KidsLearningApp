import { useMemo, useState } from 'react';
import { useQuery } from '../../hooks/useQuery';
import { usePagination } from '../../hooks/usePagination';
import { useFilters } from '../../hooks/useFilters';
import { useMutation } from '../../hooks/useMutation';
import { useToast } from '../../hooks/useToast';
import { api } from '../../lib/api';
import {
  Button,
  StatsCard,
  SearchInput,
  FilterBar,
  Select,
  DataTable,
  Pagination,
  Badge,
  StatusChip,
  Drawer,
  Input,
  Card,
  LoadingState,
  EmptyState,
} from '../../components/ui';

/* ─── Types ─── */

type ErrorStatus = 'new' | 'investigating' | 'resolved' | 'ignored';
type ErrorCategory = 'crash' | 'network' | 'render' | 'api' | 'unknown';

interface ErrorGroup {
  id: string;
  fingerprint: string;
  category: ErrorCategory;
  message: string;
  count: number;
  lastSeen: string;
  firstSeen: string;
  status: ErrorStatus;
  assignee: string | null;
}

interface ErrorGroupsResponse {
  data: ErrorGroup[];
  total: number;
  page: number;
  pageSize: number;
}

interface ErrorOccurrence {
  id: string;
  timestamp: string;
  deviceInfo: string;
  osVersion: string;
  appVersion: string;
  stackTrace: string;
}

interface ErrorGroupDetail {
  id: string;
  fingerprint: string;
  category: ErrorCategory;
  message: string;
  count: number;
  lastSeen: string;
  firstSeen: string;
  status: ErrorStatus;
  assignee: string | null;
  occurrences: ErrorOccurrence[];
  metadata: Record<string, string>;
}

interface QualityGate {
  name: string;
  metric: string;
  threshold: number;
  current: number;
  passed: boolean;
}

interface QualityGatesResponse {
  gates: QualityGate[];
  errorRate: number;
  crashFreeRate: number;
}

/* ─── Constants ─── */

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'new', label: 'New' },
  { value: 'investigating', label: 'Investigating' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'ignored', label: 'Ignored' },
];

const CATEGORY_OPTIONS = [
  { value: '', label: 'All Categories' },
  { value: 'crash', label: 'Crash' },
  { value: 'network', label: 'Network' },
  { value: 'render', label: 'Render' },
  { value: 'api', label: 'API' },
  { value: 'unknown', label: 'Unknown' },
];

const STATUS_MAP: Record<ErrorStatus, 'draft' | 'in_review' | 'published' | 'approved' | 'archived'> = {
  new: 'draft',
  investigating: 'in_review',
  resolved: 'published',
  ignored: 'archived',
};

const CATEGORY_VARIANTS: Record<ErrorCategory, 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
  crash: 'danger',
  network: 'warning',
  render: 'info',
  api: 'primary',
  unknown: 'default',
};

const STATUS_FORM_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'investigating', label: 'Investigating' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'ignored', label: 'Ignored' },
];

/* ─── Component ─── */

export function ErrorTriagePage() {
  const toast = useToast();
  const { page, limit, setPage } = usePagination({ initialLimit: 20 });
  const { filters, setFilter, clearFilters } = useFilters({
    status: '',
    category: '',
  });
  const [search, setSearch] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [drawerStatus, setDrawerStatus] = useState<ErrorStatus>('new');
  const [drawerAssignee, setDrawerAssignee] = useState('');

  const queryParams = useMemo(
    () => ({
      page,
      pageSize: limit,
      ...(filters.status && { status: filters.status }),
      ...(filters.category && { category: filters.category }),
      ...(search && { search }),
      sort: '-lastSeen',
    }),
    [page, limit, filters, search],
  );

  const { data, loading, error, refetch } = useQuery<ErrorGroupsResponse>(
    () => api.get('/errors/groups', queryParams),
    [JSON.stringify(queryParams)],
  );

  const { data: qualityGates } = useQuery<QualityGatesResponse>(
    () => api.get('/errors/quality-gates'),
    [],
  );

  const { data: groupDetail, loading: detailLoading } = useQuery<ErrorGroupDetail>(
    () => api.get(`/errors/groups/${selectedGroupId}`),
    [selectedGroupId],
    {
      enabled: !!selectedGroupId,
      onSuccess: (detail) => {
        setDrawerStatus(detail.status);
        setDrawerAssignee(detail.assignee ?? '');
      },
    },
  );

  const { mutate: updateGroup, loading: updating } = useMutation<
    void,
    { id: string; status: ErrorStatus; assignee: string }
  >(
    (vars) => api.patch(`/errors/groups/${vars.id}`, { status: vars.status, assignee: vars.assignee || null }),
    {
      onSuccess: () => {
        toast.success('Error group updated.');
        refetch();
      },
      onError: (err) => toast.error(err.message),
    },
  );

  const items = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);
  const gates = qualityGates?.gates ?? [];

  const columns = useMemo(
    () => [
      {
        key: 'fingerprint',
        header: 'Fingerprint',
        render: (item: ErrorGroup) => (
          <span className="font-mono text-xs text-text" title={item.fingerprint}>
            {item.fingerprint.length > 16 ? `${item.fingerprint.slice(0, 16)}...` : item.fingerprint}
          </span>
        ),
      },
      {
        key: 'category',
        header: 'Category',
        render: (item: ErrorGroup) => (
          <Badge variant={CATEGORY_VARIANTS[item.category]}>
            {item.category}
          </Badge>
        ),
      },
      {
        key: 'message',
        header: 'Message',
        render: (item: ErrorGroup) => (
          <span className="text-sm text-text truncate block max-w-xs" title={item.message}>
            {item.message}
          </span>
        ),
      },
      {
        key: 'count',
        header: 'Count',
        render: (item: ErrorGroup) => (
          <span className="text-sm font-semibold text-text tabular-nums">
            {item.count.toLocaleString()}
          </span>
        ),
      },
      {
        key: 'lastSeen',
        header: 'Last Seen',
        render: (item: ErrorGroup) => (
          <span className="text-sm text-text-secondary">
            {new Date(item.lastSeen).toLocaleString()}
          </span>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        render: (item: ErrorGroup) => (
          <StatusChip status={STATUS_MAP[item.status]} />
        ),
      },
      {
        key: 'assignee',
        header: 'Assignee',
        render: (item: ErrorGroup) => (
          <span className="text-sm text-text-secondary">
            {item.assignee ?? '--'}
          </span>
        ),
      },
    ],
    [],
  );

  function openDrawer(group: ErrorGroup) {
    setSelectedGroupId(group.id);
    setDrawerStatus(group.status);
    setDrawerAssignee(group.assignee ?? '');
  }

  function closeDrawer() {
    setSelectedGroupId(null);
  }

  function handleUpdateGroup() {
    if (!selectedGroupId) return;
    updateGroup({ id: selectedGroupId, status: drawerStatus, assignee: drawerAssignee });
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-danger/10 border border-danger/20 rounded-lg p-4 text-danger text-sm">
          Failed to load error groups: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text">Error Triage</h1>
        <p className="text-text-secondary mt-1">
          Monitor, triage, and resolve application errors.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Error Rate"
          value={qualityGates ? `${qualityGates.errorRate.toFixed(2)}%` : '--'}
        />
        <StatsCard
          title="Crash-Free Rate"
          value={qualityGates ? `${qualityGates.crashFreeRate.toFixed(1)}%` : '--'}
        />
        <StatsCard title="Open Errors" value={items.filter((i) => i.status === 'new').length} />
        <StatsCard title="Investigating" value={items.filter((i) => i.status === 'investigating').length} />
      </div>

      {/* Search + Filters */}
      <div className="space-y-3">
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Search by message or fingerprint..."
          className="max-w-md"
        />

        <FilterBar onReset={() => { clearFilters(); setSearch(''); setPage(1); }}>
          <Select
            options={STATUS_OPTIONS}
            value={filters.status}
            onChange={(e) => { setFilter('status', e.target.value); setPage(1); }}
            className="w-40"
          />
          <Select
            options={CATEGORY_OPTIONS}
            value={filters.category}
            onChange={(e) => { setFilter('category', e.target.value); setPage(1); }}
            className="w-40"
          />
        </FilterBar>
      </div>

      {/* Data Table */}
      {loading && !data ? (
        <LoadingState message="Loading error groups..." />
      ) : (
        <DataTable
          columns={columns}
          data={items}
          loading={loading}
          emptyMessage="No error groups found. All clear!"
          onRowClick={openDrawer}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
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

      {/* Quality Gates Section */}
      <div className="pt-4 border-t border-border">
        <h2 className="text-lg font-semibold text-text mb-3">Quality Gates</h2>
        <p className="text-sm text-text-secondary mb-4">
          Automated quality checks that must pass before releases.
        </p>

        {gates.length === 0 ? (
          <EmptyState title="No quality gates" description="Quality gates have not been configured yet." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {gates.map((gate) => (
              <Card key={gate.name}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-text">{gate.name}</p>
                    <p className="text-xs text-text-secondary mt-0.5">
                      {gate.metric}: {gate.current.toFixed(2)} / threshold: {gate.threshold}
                    </p>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-semibold ${
                      gate.passed
                        ? 'bg-success/10 text-success'
                        : 'bg-danger/10 text-danger'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${gate.passed ? 'bg-success' : 'bg-danger'}`}
                    />
                    {gate.passed ? 'Pass' : 'Fail'}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Error Detail Drawer */}
      <Drawer
        open={!!selectedGroupId}
        onClose={closeDrawer}
        title="Error Details"
      >
        {detailLoading ? (
          <LoadingState message="Loading error details..." />
        ) : groupDetail ? (
          <div className="space-y-5">
            {/* Header Info */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={CATEGORY_VARIANTS[groupDetail.category]}>
                  {groupDetail.category}
                </Badge>
                <StatusChip status={STATUS_MAP[groupDetail.status]} />
              </div>
              <p className="text-sm font-medium text-text break-words">{groupDetail.message}</p>
              <p className="text-xs font-mono text-text-muted mt-1 break-all">
                {groupDetail.fingerprint}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-bg rounded-lg p-3">
                <p className="text-xs text-text-secondary">Total Count</p>
                <p className="text-lg font-semibold text-text">{groupDetail.count.toLocaleString()}</p>
              </div>
              <div className="bg-bg rounded-lg p-3">
                <p className="text-xs text-text-secondary">First Seen</p>
                <p className="text-sm font-medium text-text">
                  {new Date(groupDetail.firstSeen).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Metadata */}
            {Object.keys(groupDetail.metadata ?? {}).length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-text mb-2">Metadata</h3>
                <dl className="space-y-1.5 text-sm">
                  {Object.entries(groupDetail.metadata).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <dt className="text-text-secondary">{key}</dt>
                      <dd className="font-mono text-text text-right">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* Update Form */}
            <div className="pt-3 border-t border-border space-y-3">
              <h3 className="text-sm font-semibold text-text">Update Status</h3>
              <Select
                label="Status"
                options={STATUS_FORM_OPTIONS}
                value={drawerStatus}
                onChange={(e) => setDrawerStatus(e.target.value as ErrorStatus)}
              />
              <Input
                label="Assignee"
                value={drawerAssignee}
                onChange={(e) => setDrawerAssignee(e.target.value)}
                placeholder="engineer@example.com"
              />
              <Button
                loading={updating}
                onClick={handleUpdateGroup}
                className="w-full"
              >
                Update
              </Button>
            </div>

            {/* Occurrences */}
            <div className="pt-3 border-t border-border">
              <h3 className="text-sm font-semibold text-text mb-3">
                Recent Occurrences ({groupDetail.occurrences?.length ?? 0})
              </h3>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {(groupDetail.occurrences ?? []).map((occ) => (
                  <div key={occ.id} className="bg-bg rounded-lg p-3 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">
                        {new Date(occ.timestamp).toLocaleString()}
                      </span>
                      <span className="text-text-secondary">{occ.appVersion}</span>
                    </div>
                    <div className="flex gap-4 text-text-secondary">
                      <span>{occ.deviceInfo}</span>
                      <span>{occ.osVersion}</span>
                    </div>
                    {occ.stackTrace && (
                      <pre className="text-[11px] font-mono text-text-muted bg-surface rounded p-2 overflow-x-auto whitespace-pre-wrap mt-1">
                        {occ.stackTrace}
                      </pre>
                    )}
                  </div>
                ))}
                {(!groupDetail.occurrences || groupDetail.occurrences.length === 0) && (
                  <p className="text-sm text-text-muted">No occurrences recorded.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <EmptyState title="Error not found" description="Could not load error details." />
        )}
      </Drawer>
    </div>
  );
}
