import { useMemo, useState } from 'react';
import { useQuery } from '../../hooks/useQuery';
import { usePagination } from '../../hooks/usePagination';
import { useFilters } from '../../hooks/useFilters';
import { api } from '../../lib/api';
import {
  DataTable,
  Drawer,
  FilterBar,
  Input,
  Pagination,
  Select,
  Badge,
  LoadingState,
} from '../../components/ui';

interface AuditEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  changes: Record<string, unknown>;
  summary: string;
}

interface AuditResponse {
  data: AuditEntry[];
  total: number;
  page: number;
  pageSize: number;
}

const ENTITY_OPTIONS = [
  { value: '', label: 'All Entities' },
  { value: 'Content', label: 'Content' },
  { value: 'Asset', label: 'Asset' },
  { value: 'Collection', label: 'Collection' },
  { value: 'Review', label: 'Review' },
  { value: 'Release', label: 'Release' },
  { value: 'User', label: 'User' },
  { value: 'Household', label: 'Household' },
];

const ACTION_VARIANTS: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
  create: 'success',
  update: 'info',
  delete: 'danger',
  publish: 'primary',
  archive: 'warning',
};

export function AuditLogPage() {
  const { page, limit, setPage } = usePagination({ initialLimit: 20 });
  const { filters, setFilter, clearFilters } = useFilters({
    entity: '',
    action: '',
    userId: '',
    from: '',
    to: '',
  });
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null);

  const queryParams = useMemo(
    () => ({
      page,
      pageSize: limit,
      ...(filters.entity && { entity: filters.entity }),
      ...(filters.action && { action: filters.action }),
      ...(filters.userId && { userId: filters.userId }),
      ...(filters.from && { from: filters.from }),
      ...(filters.to && { to: filters.to }),
    }),
    [page, limit, filters],
  );

  const { data, loading, error } = useQuery<AuditResponse>(
    () => api.get('/audit', queryParams),
    [JSON.stringify(queryParams)],
  );

  const entries = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  const columns = useMemo(
    () => [
      {
        key: 'timestamp',
        header: 'Timestamp',
        render: (item: AuditEntry) => (
          <span className="text-sm text-text-secondary whitespace-nowrap">
            {new Date(item.timestamp).toLocaleString()}
          </span>
        ),
      },
      {
        key: 'userName',
        header: 'User',
        render: (item: AuditEntry) => (
          <span className="text-sm font-medium text-text">{item.userName}</span>
        ),
      },
      {
        key: 'action',
        header: 'Action',
        render: (item: AuditEntry) => (
          <Badge variant={ACTION_VARIANTS[item.action] ?? 'default'}>
            {item.action}
          </Badge>
        ),
      },
      {
        key: 'entityType',
        header: 'Entity Type',
        render: (item: AuditEntry) => (
          <span className="text-sm text-text-secondary">{item.entityType}</span>
        ),
      },
      {
        key: 'entityId',
        header: 'Entity ID',
        render: (item: AuditEntry) => (
          <span className="text-sm font-mono text-primary">{item.entityId}</span>
        ),
      },
      {
        key: 'summary',
        header: 'Summary',
        render: (item: AuditEntry) => (
          <span className="text-sm text-text-secondary truncate max-w-xs block">
            {item.summary}
          </span>
        ),
      },
    ],
    [],
  );

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-danger/10 border border-danger/20 rounded-lg p-4 text-danger text-sm">
          Failed to load audit log: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Audit Log</h1>
          <p className="text-text-secondary mt-1">Track all system changes and user actions.</p>
        </div>
      </div>

      {/* Filters */}
      <FilterBar onReset={() => { clearFilters(); setPage(1); }}>
        <Select
          options={ENTITY_OPTIONS}
          value={filters.entity}
          onChange={(e) => { setFilter('entity', e.target.value); setPage(1); }}
          className="w-40"
        />
        <Input
          placeholder="Action..."
          value={filters.action}
          onChange={(e) => { setFilter('action', e.target.value); setPage(1); }}
          className="w-36"
        />
        <Input
          placeholder="User ID..."
          value={filters.userId}
          onChange={(e) => { setFilter('userId', e.target.value); setPage(1); }}
          className="w-36"
        />
        <Input
          type="date"
          value={filters.from}
          onChange={(e) => { setFilter('from', e.target.value); setPage(1); }}
          className="w-40"
        />
        <Input
          type="date"
          value={filters.to}
          onChange={(e) => { setFilter('to', e.target.value); setPage(1); }}
          className="w-40"
        />
      </FilterBar>

      {/* Table */}
      {loading && !data ? (
        <LoadingState message="Loading audit log..." />
      ) : (
        <DataTable
          columns={columns}
          data={entries}
          loading={loading}
          emptyMessage="No audit entries found. Try adjusting your filters."
          onRowClick={(entry) => setSelectedEntry(entry)}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-secondary">
            Showing {(page - 1) * limit + 1}--{Math.min(page * limit, total)} of {total}
          </p>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      {/* Detail Drawer */}
      <Drawer
        open={selectedEntry !== null}
        onClose={() => setSelectedEntry(null)}
        title="Audit Entry Details"
      >
        {selectedEntry && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-text-secondary">Timestamp</p>
                <p className="font-medium text-text">
                  {new Date(selectedEntry.timestamp).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-text-secondary">User</p>
                <p className="font-medium text-text">{selectedEntry.userName}</p>
              </div>
              <div>
                <p className="text-text-secondary">Action</p>
                <p className="font-medium text-text">{selectedEntry.action}</p>
              </div>
              <div>
                <p className="text-text-secondary">Entity Type</p>
                <p className="font-medium text-text">{selectedEntry.entityType}</p>
              </div>
              <div className="col-span-2">
                <p className="text-text-secondary">Entity ID</p>
                <p className="font-mono text-primary">{selectedEntry.entityId}</p>
              </div>
              <div className="col-span-2">
                <p className="text-text-secondary">Summary</p>
                <p className="font-medium text-text">{selectedEntry.summary}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-text-secondary mb-2">Changes</p>
              <pre className="bg-bg border border-border rounded-lg p-4 text-xs text-text overflow-x-auto max-h-96">
                <code>{JSON.stringify(selectedEntry.changes, null, 2)}</code>
              </pre>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
