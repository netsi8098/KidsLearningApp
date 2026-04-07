import { useMemo, useState } from 'react';
import { useQuery } from '../../hooks/useQuery';
import { useMutation } from '../../hooks/useMutation';
import { useDebounce } from '../../hooks/useDebounce';
import { api } from '../../lib/api';
import {
  Badge,
  Button,
  Card,
  DataTable,
  LoadingState,
  SearchInput,
  Tabs,
} from '../../components/ui';

interface IndexStatus {
  id: string;
  contentType: string;
  indexedCount: number;
  lastIndexedAt: string;
  health: 'green' | 'yellow' | 'red';
}

interface SearchResult {
  id: string;
  title: string;
  type: string;
  score: number;
}

interface DedupCluster {
  id: string;
  clusterId: string;
  contentCount: number;
  similarityScore: number;
  status: string;
}

const HEALTH_COLORS: Record<string, string> = {
  green: 'bg-success',
  yellow: 'bg-warning',
  red: 'bg-danger',
};

const HEALTH_VARIANTS: Record<string, 'success' | 'warning' | 'danger'> = {
  green: 'success',
  yellow: 'warning',
  red: 'danger',
};

export function SearchIndexPage() {
  const [activeTab, setActiveTab] = useState('status');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 300);

  // Status tab data
  const { data: statuses, loading: statusLoading, refetch: refetchStatuses } = useQuery<IndexStatus[]>(
    () => api.get('/search/status'),
    [],
  );

  // Search test results
  const { data: searchResults, loading: searchLoading } = useQuery<SearchResult[]>(
    () => api.get('/search', { q: debouncedQuery }),
    [debouncedQuery],
    { enabled: debouncedQuery.length > 0 },
  );

  // Dedup clusters
  const { data: clusters, loading: clustersLoading } = useQuery<DedupCluster[]>(
    () => api.get('/dedup/clusters'),
    [],
  );

  // Reindex mutations
  const { mutate: reindexType, loading: reindexingType } = useMutation<void, string>(
    (contentType) => api.post(`/search/reindex/${contentType}`),
    { onSuccess: () => refetchStatuses() },
  );

  const { mutate: reindexAll, loading: reindexingAll } = useMutation<void, void>(
    () => api.post('/search/reindex'),
    { onSuccess: () => refetchStatuses() },
  );

  const tabs = [
    { key: 'status', label: 'Status' },
    { key: 'test', label: 'Test' },
    { key: 'clusters', label: 'Clusters' },
  ];

  const clusterColumns = useMemo(
    () => [
      {
        key: 'clusterId',
        header: 'Cluster ID',
        render: (item: DedupCluster) => (
          <span className="font-mono text-sm text-text">{item.clusterId}</span>
        ),
      },
      {
        key: 'contentCount',
        header: 'Content Count',
        render: (item: DedupCluster) => (
          <span className="text-sm font-medium text-text">{item.contentCount}</span>
        ),
      },
      {
        key: 'similarityScore',
        header: 'Similarity',
        render: (item: DedupCluster) => (
          <div className="flex items-center gap-2">
            <div className="w-16 h-2 bg-bg rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full"
                style={{ width: `${item.similarityScore * 100}%` }}
              />
            </div>
            <span className="text-sm text-text-secondary">
              {(item.similarityScore * 100).toFixed(0)}%
            </span>
          </div>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        render: (item: DedupCluster) => (
          <Badge variant={item.status === 'resolved' ? 'success' : item.status === 'reviewing' ? 'warning' : 'default'}>
            {item.status}
          </Badge>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Search Index</h1>
          <p className="text-text-secondary mt-1">Monitor search index health and manage reindexing.</p>
        </div>
        {activeTab === 'status' && (
          <Button loading={reindexingAll} onClick={() => reindexAll()}>
            Reindex All
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeKey={activeTab} onChange={setActiveTab} />

      {/* Status Tab */}
      {activeTab === 'status' && (
        <>
          {statusLoading && !statuses ? (
            <LoadingState message="Loading index status..." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(statuses ?? []).map((status) => (
                <Card key={status.id}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-block w-3 h-3 rounded-full ${HEALTH_COLORS[status.health]}`}
                        title={`Health: ${status.health}`}
                      />
                      <div>
                        <h3 className="text-sm font-semibold text-text">{status.contentType}</h3>
                        <p className="text-xs text-text-secondary mt-0.5">
                          {status.indexedCount.toLocaleString()} indexed
                        </p>
                      </div>
                    </div>
                    <Badge variant={HEALTH_VARIANTS[status.health]}>{status.health}</Badge>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-xs text-text-muted">
                      Last indexed: {new Date(status.lastIndexedAt).toLocaleString()}
                    </p>
                    <Button
                      size="sm"
                      variant="secondary"
                      loading={reindexingType}
                      onClick={() => reindexType(status.contentType)}
                    >
                      Reindex
                    </Button>
                  </div>
                </Card>
              ))}
              {(statuses ?? []).length === 0 && (
                <div className="col-span-full text-center py-12 text-text-muted">
                  No index data available.
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Test Tab */}
      {activeTab === 'test' && (
        <div className="space-y-4">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Type a search query to test..."
            className="max-w-lg"
          />
          {searchLoading && debouncedQuery && (
            <LoadingState message="Searching..." size="sm" />
          )}
          {!searchLoading && debouncedQuery && searchResults && (
            <Card padding={false}>
              {searchResults.length === 0 ? (
                <div className="px-4 py-8 text-center text-text-muted text-sm">
                  No results found for "{debouncedQuery}".
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {searchResults.map((result) => (
                    <div key={result.id} className="px-4 py-3 flex items-center justify-between hover:bg-bg/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Badge variant="default">{result.type}</Badge>
                        <span className="text-sm font-medium text-text">{result.title}</span>
                      </div>
                      <span className="text-xs font-mono text-text-muted">
                        score: {result.score.toFixed(3)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
          {!debouncedQuery && (
            <div className="text-center py-12 text-text-muted text-sm">
              Enter a query above to test search results.
            </div>
          )}
        </div>
      )}

      {/* Clusters Tab */}
      {activeTab === 'clusters' && (
        <>
          {clustersLoading && !clusters ? (
            <LoadingState message="Loading clusters..." />
          ) : (
            <DataTable
              columns={clusterColumns}
              data={clusters ?? []}
              loading={clustersLoading}
              emptyMessage="No duplicate clusters found."
            />
          )}
        </>
      )}
    </div>
  );
}
