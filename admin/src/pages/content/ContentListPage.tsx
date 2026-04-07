import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '../../hooks/useQuery';
import { usePagination } from '../../hooks/usePagination';
import { useFilters } from '../../hooks/useFilters';
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
  LoadingState,
} from '../../components/ui';

interface ContentItem {
  id: string;
  title: string;
  slug: string;
  type: string;
  status: 'draft' | 'in_review' | 'approved' | 'published' | 'archived';
  ageGroup: string;
  difficulty: string;
  updatedAt: string;
  featured: boolean;
}

interface ContentListResponse {
  data: ContentItem[];
  total: number;
  page: number;
  pageSize: number;
}

const TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'story', label: 'Story' },
  { value: 'quiz', label: 'Quiz' },
  { value: 'alphabet', label: 'Alphabet' },
  { value: 'number', label: 'Number' },
  { value: 'matching', label: 'Matching' },
  { value: 'coloring', label: 'Coloring' },
  { value: 'tracing', label: 'Tracing' },
  { value: 'song', label: 'Song' },
  { value: 'video', label: 'Video' },
  { value: 'game', label: 'Game' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'in_review', label: 'In Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
];

const AGE_GROUP_OPTIONS = [
  { value: '', label: 'All Ages' },
  { value: '2-3', label: '2-3 years' },
  { value: '3-4', label: '3-4 years' },
  { value: '4-5', label: '4-5 years' },
  { value: '5-6', label: '5-6 years' },
];

const TYPE_VARIANTS: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
  story: 'primary',
  quiz: 'warning',
  alphabet: 'info',
  number: 'info',
  matching: 'success',
  coloring: 'success',
  tracing: 'success',
  song: 'primary',
  video: 'danger',
  game: 'warning',
};

export function ContentListPage() {
  const navigate = useNavigate();
  const { page, limit, setPage } = usePagination({ initialLimit: 20 });
  const { filters, setFilter, clearFilters } = useFilters({
    type: '',
    status: '',
    ageGroup: '',
  });
  const [search, setSearch] = useState('');

  const queryParams = useMemo(
    () => ({
      page,
      pageSize: limit,
      ...(filters.type && { type: filters.type }),
      ...(filters.status && { status: filters.status }),
      ...(filters.ageGroup && { ageGroup: filters.ageGroup }),
      ...(search && { search }),
      sort: '-updatedAt',
    }),
    [page, limit, filters, search],
  );

  const { data, loading, error } = useQuery<ContentListResponse>(
    () => api.get('/content', queryParams),
    [JSON.stringify(queryParams)],
  );

  const items = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  // Derive stats from current dataset
  const stats = useMemo(() => {
    if (!items.length) return { total: 0, published: 0, draft: 0, inReview: 0 };
    return {
      total,
      published: items.filter((i) => i.status === 'published').length,
      draft: items.filter((i) => i.status === 'draft').length,
      inReview: items.filter((i) => i.status === 'in_review').length,
    };
  }, [items, total]);

  const columns = useMemo(
    () => [
      {
        key: 'title',
        header: 'Title',
        render: (item: ContentItem) => (
          <div>
            <span className="font-medium text-text">{item.title}</span>
            {item.featured && (
              <span className="ml-2 text-xs text-warning font-medium">Featured</span>
            )}
          </div>
        ),
      },
      {
        key: 'type',
        header: 'Type',
        render: (item: ContentItem) => (
          <Badge variant={TYPE_VARIANTS[item.type] ?? 'default'}>
            {item.type}
          </Badge>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        render: (item: ContentItem) => <StatusChip status={item.status} />,
      },
      {
        key: 'ageGroup',
        header: 'Age Group',
        render: (item: ContentItem) => (
          <span className="text-sm text-text-secondary">{item.ageGroup} yrs</span>
        ),
      },
      {
        key: 'updatedAt',
        header: 'Updated',
        render: (item: ContentItem) => (
          <span className="text-sm text-text-secondary">
            {new Date(item.updatedAt).toLocaleDateString()}
          </span>
        ),
      },
      {
        key: 'actions',
        header: '',
        render: (item: ContentItem) => (
          <Link
            to={`/content/${item.id}/edit`}
            onClick={(e) => e.stopPropagation()}
            className="text-sm text-primary hover:text-primary-hover font-medium"
          >
            Edit
          </Link>
        ),
      },
    ],
    [],
  );

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-danger/10 border border-danger/20 rounded-lg p-4 text-danger text-sm">
          Failed to load content: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Content Library</h1>
          <p className="text-text-secondary mt-1">
            Browse, filter, and manage all content items.
          </p>
        </div>
        <Button onClick={() => navigate('/content/new')}>New Content</Button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Content" value={stats.total} />
        <StatsCard title="Published" value={stats.published} />
        <StatsCard title="Drafts" value={stats.draft} />
        <StatsCard title="In Review" value={stats.inReview} />
      </div>

      {/* Search + Filters */}
      <div className="space-y-3">
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Search by title or slug..."
          className="max-w-md"
        />

        <FilterBar onReset={() => { clearFilters(); setSearch(''); setPage(1); }}>
          <Select
            options={TYPE_OPTIONS}
            value={filters.type}
            onChange={(e) => { setFilter('type', e.target.value); setPage(1); }}
            className="w-40"
          />
          <Select
            options={STATUS_OPTIONS}
            value={filters.status}
            onChange={(e) => { setFilter('status', e.target.value); setPage(1); }}
            className="w-40"
          />
          <Select
            options={AGE_GROUP_OPTIONS}
            value={filters.ageGroup}
            onChange={(e) => { setFilter('ageGroup', e.target.value); setPage(1); }}
            className="w-40"
          />
        </FilterBar>
      </div>

      {/* Data Table */}
      {loading && !data ? (
        <LoadingState message="Loading content..." />
      ) : (
        <DataTable
          columns={columns}
          data={items}
          loading={loading}
          emptyMessage="No content found. Try adjusting your filters."
          onRowClick={(item) => navigate(`/content/${item.id}`)}
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
