import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '../../hooks/useQuery';
import { usePagination } from '../../hooks/usePagination';
import { useFilters } from '../../hooks/useFilters';
import { api } from '../../lib/api';
import {
  Button,
  StatsCard,
  FilterBar,
  Select,
  DataTable,
  Pagination,
  StatusChip,
  LoadingState,
} from '../../components/ui';

interface Review {
  id: string;
  contentTitle: string;
  author: string;
  status: 'draft' | 'in_review' | 'approved' | 'published' | 'rejected';
  reviewer: string;
  submittedAt: string;
}

interface ReviewListResponse {
  data: Review[];
  total: number;
  page: number;
  pageSize: number;
}

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'changes_requested', label: 'Changes Requested' },
  { value: 'rejected', label: 'Rejected' },
];

const REVIEWER_OPTIONS = [
  { value: '', label: 'All Reviewers' },
  { value: 'reviewer-1', label: 'Sarah K.' },
  { value: 'reviewer-2', label: 'James M.' },
  { value: 'reviewer-3', label: 'Aisha B.' },
];

export function ReviewQueuePage() {
  const navigate = useNavigate();
  const { page, limit, setPage } = usePagination({ initialLimit: 20 });
  const { filters, setFilter, clearFilters } = useFilters({
    status: '',
    reviewerId: '',
  });

  const queryParams = useMemo(
    () => ({
      page,
      pageSize: limit,
      ...(filters.status && { status: filters.status }),
      ...(filters.reviewerId && { reviewerId: filters.reviewerId }),
    }),
    [page, limit, filters],
  );

  const { data, loading, error } = useQuery<ReviewListResponse>(
    () => api.get('/reviews', queryParams),
    [JSON.stringify(queryParams)],
  );

  const items = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  // Mock stats -- derived or from a dedicated endpoint in production
  const [stats] = useState({
    pending: 12,
    approved: 34,
    rejected: 3,
  });

  const columns = useMemo(
    () => [
      {
        key: 'contentTitle',
        header: 'Content Title',
        render: (item: Review) => (
          <span className="font-medium text-text">{item.contentTitle}</span>
        ),
      },
      {
        key: 'author',
        header: 'Author',
        render: (item: Review) => (
          <span className="text-sm text-text-secondary">{item.author}</span>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        render: (item: Review) => <StatusChip status={item.status} />,
      },
      {
        key: 'reviewer',
        header: 'Reviewer',
        render: (item: Review) => (
          <span className="text-sm text-text-secondary">{item.reviewer || '--'}</span>
        ),
      },
      {
        key: 'submittedAt',
        header: 'Submitted',
        render: (item: Review) => (
          <span className="text-sm text-text-secondary">
            {new Date(item.submittedAt).toLocaleDateString()}
          </span>
        ),
      },
      {
        key: 'actions',
        header: '',
        render: (item: Review) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/reviews/${item.id}`);
            }}
          >
            View
          </Button>
        ),
      },
    ],
    [navigate],
  );

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-danger/10 border border-danger/20 rounded-lg p-4 text-danger text-sm">
          Failed to load reviews: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Review Queue</h1>
          <p className="text-text-secondary mt-1">
            Review and approve content submissions.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard title="Pending" value={stats.pending} />
        <StatsCard title="Approved This Week" value={stats.approved} />
        <StatsCard title="Rejected This Week" value={stats.rejected} />
      </div>

      {/* Filters */}
      <FilterBar onReset={() => { clearFilters(); setPage(1); }}>
        <Select
          options={STATUS_OPTIONS}
          value={filters.status}
          onChange={(e) => { setFilter('status', e.target.value); setPage(1); }}
          className="w-44"
        />
        <Select
          options={REVIEWER_OPTIONS}
          value={filters.reviewerId}
          onChange={(e) => { setFilter('reviewerId', e.target.value); setPage(1); }}
          className="w-44"
        />
      </FilterBar>

      {/* Table */}
      {loading && !data ? (
        <LoadingState message="Loading reviews..." />
      ) : (
        <DataTable
          columns={columns}
          data={items}
          loading={loading}
          emptyMessage="No reviews found. Try adjusting your filters."
          onRowClick={(item) => navigate(`/reviews/${item.id}`)}
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
    </div>
  );
}
