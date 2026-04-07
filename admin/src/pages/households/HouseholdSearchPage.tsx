import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '../../hooks/useQuery';
import { useDebounce } from '../../hooks/useDebounce';
import { api } from '../../lib/api';
import {
  SearchInput,
  DataTable,
  Badge,
  EmptyState,
  LoadingState,
} from '../../components/ui';

/* ─── Types ─── */

interface HouseholdResult {
  id: string;
  name: string;
  parentEmail: string;
  parentName: string;
  childrenCount: number;
  plan: string;
  createdAt: string;
}

interface SearchResponse {
  data: HouseholdResult[];
  total: number;
}

/* ─── Constants ─── */

const PLAN_VARIANTS: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'info'> = {
  free: 'default',
  basic: 'info',
  premium: 'success',
  trial: 'warning',
};

/* ─── Component ─── */

export function HouseholdSearchPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  const hasQuery = debouncedSearch.trim().length > 0;

  const { data, loading } = useQuery<SearchResponse>(
    () => api.get('/households/search', { q: debouncedSearch.trim() }),
    [debouncedSearch],
    { enabled: hasQuery },
  );

  const results = data?.data ?? [];

  const columns = useMemo(
    () => [
      {
        key: 'name',
        header: 'Household',
        render: (item: HouseholdResult) => (
          <span className="font-medium text-text">{item.name}</span>
        ),
      },
      {
        key: 'parentEmail',
        header: 'Email',
        render: (item: HouseholdResult) => (
          <span className="text-sm text-text-secondary">{item.parentEmail}</span>
        ),
      },
      {
        key: 'parentName',
        header: 'Parent',
        render: (item: HouseholdResult) => (
          <span className="text-sm text-text">{item.parentName}</span>
        ),
      },
      {
        key: 'childrenCount',
        header: 'Children',
        render: (item: HouseholdResult) => (
          <span className="text-sm text-text">{item.childrenCount}</span>
        ),
      },
      {
        key: 'plan',
        header: 'Plan',
        render: (item: HouseholdResult) => (
          <Badge variant={PLAN_VARIANTS[item.plan] ?? 'default'}>
            {item.plan}
          </Badge>
        ),
      },
      {
        key: 'createdAt',
        header: 'Created',
        render: (item: HouseholdResult) => (
          <span className="text-sm text-text-secondary">
            {new Date(item.createdAt).toLocaleDateString()}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text">Household Support</h1>
        <p className="text-text-secondary mt-1">Search and manage household accounts.</p>
      </div>

      {/* Search */}
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search by email, name, or household ID..."
        debounceMs={0}
        className="max-w-2xl"
      />

      {/* Results */}
      {!hasQuery ? (
        <EmptyState
          title="Search for a household"
          description="Enter a search term to find households by email, name, or ID."
          icon={
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
        />
      ) : loading ? (
        <LoadingState message="Searching households..." />
      ) : (
        <DataTable
          columns={columns}
          data={results}
          emptyMessage="No households found matching your search."
          onRowClick={(item) => navigate(`/households/${item.id}`)}
        />
      )}
    </div>
  );
}
