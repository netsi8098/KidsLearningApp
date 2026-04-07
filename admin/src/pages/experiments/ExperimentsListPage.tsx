import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '../../hooks/useQuery';
import { usePagination } from '../../hooks/usePagination';
import { useFilters } from '../../hooks/useFilters';
import { api } from '../../lib/api';
import {
  Button,
  Select,
  FilterBar,
  DataTable,
  Pagination,
  StatusChip,
  LoadingState,
} from '../../components/ui';

/* ─── Types ─── */

type ExperimentStatus = 'draft' | 'running' | 'paused' | 'completed';

interface ExperimentItem {
  id: string;
  name: string;
  status: ExperimentStatus;
  variantsCount: number;
  startDate: string | null;
  endDate: string | null;
}

interface ExperimentsResponse {
  data: ExperimentItem[];
  total: number;
  page: number;
  pageSize: number;
}

/* ─── Constants ─── */

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'running', label: 'Running' },
  { value: 'paused', label: 'Paused' },
  { value: 'completed', label: 'Completed' },
];

const STATUS_MAP: Record<ExperimentStatus, 'draft' | 'published' | 'in_review' | 'approved'> = {
  draft: 'draft',
  running: 'published',
  paused: 'in_review',
  completed: 'approved',
};

/* ─── Component ─── */

export function ExperimentsListPage() {
  const navigate = useNavigate();
  const { page, limit, setPage } = usePagination({ initialLimit: 20 });
  const { filters, setFilter, clearFilters } = useFilters({ status: '' });

  const queryParams = useMemo(
    () => ({
      page,
      pageSize: limit,
      ...(filters.status && { status: filters.status }),
    }),
    [page, limit, filters],
  );

  const { data, loading, error } = useQuery<ExperimentsResponse>(
    () => api.get('/experiments', queryParams),
    [JSON.stringify(queryParams)],
  );

  const items = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  const columns = useMemo(
    () => [
      {
        key: 'name',
        header: 'Name',
        render: (item: ExperimentItem) => (
          <span className="font-medium text-text">{item.name}</span>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        render: (item: ExperimentItem) => (
          <StatusChip status={STATUS_MAP[item.status]} />
        ),
      },
      {
        key: 'variantsCount',
        header: 'Variants',
        render: (item: ExperimentItem) => (
          <span className="text-sm text-text">{item.variantsCount}</span>
        ),
      },
      {
        key: 'startDate',
        header: 'Start Date',
        render: (item: ExperimentItem) => (
          <span className="text-sm text-text-secondary">
            {item.startDate ? new Date(item.startDate).toLocaleDateString() : '--'}
          </span>
        ),
      },
      {
        key: 'endDate',
        header: 'End Date',
        render: (item: ExperimentItem) => (
          <span className="text-sm text-text-secondary">
            {item.endDate ? new Date(item.endDate).toLocaleDateString() : '--'}
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
          Failed to load experiments: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Experiments</h1>
          <p className="text-text-secondary mt-1">A/B tests and feature experiments.</p>
        </div>
        <Button onClick={() => navigate('/experiments/new')}>New Experiment</Button>
      </div>

      {/* Filters */}
      <FilterBar onReset={() => { clearFilters(); setPage(1); }}>
        <Select
          options={STATUS_OPTIONS}
          value={filters.status}
          onChange={(e) => { setFilter('status', e.target.value); setPage(1); }}
          className="w-44"
        />
      </FilterBar>

      {/* Data Table */}
      {loading && !data ? (
        <LoadingState message="Loading experiments..." />
      ) : (
        <DataTable
          columns={columns}
          data={items}
          loading={loading}
          emptyMessage="No experiments found. Try adjusting your filters."
          onRowClick={(item) => navigate(`/experiments/${item.id}`)}
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
    </div>
  );
}
