import { useMemo, useState } from 'react';
import { useQuery } from '../../hooks/useQuery';
import { api } from '../../lib/api';
import {
  Badge,
  Card,
  DataTable,
  LoadingState,
  StatsCard,
  Toggle,
} from '../../components/ui';

interface HealthStatus {
  database: 'up' | 'down';
  redis: 'up' | 'down';
  storage: 'up' | 'down';
  api: 'up' | 'down';
}

interface SystemInfo {
  uptime: number;
  nodeVersion: string;
  memoryUsage: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
  };
}

interface QueueStatus {
  name: string;
  waiting: number;
  active: number;
  completed: number;
  failed: number;
}

interface QueueJob {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  finishedAt: string;
  duration: number;
}

interface DbStats {
  totalRows: number;
  tables: { name: string; rows: number; size: string }[];
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export function SystemHealthPage() {
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [expandedQueue, setExpandedQueue] = useState<string | null>(null);
  const refreshInterval = autoRefresh ? 30000 : undefined;

  // Health check
  const { data: health, loading: healthLoading } = useQuery<HealthStatus>(
    () => api.get('/system/health'),
    [],
    { refetchInterval: refreshInterval },
  );

  // System info
  const { data: sysInfo, loading: infoLoading } = useQuery<SystemInfo>(
    () => api.get('/system/info'),
    [],
    { refetchInterval: refreshInterval },
  );

  // Queue statuses
  const { data: queues, loading: queuesLoading } = useQuery<QueueStatus[]>(
    () => api.get('/system/queues'),
    [],
    { refetchInterval: refreshInterval },
  );

  // DB stats
  const { data: dbStats, loading: dbLoading } = useQuery<DbStats>(
    () => api.get('/system/db-stats'),
    [],
    { refetchInterval: refreshInterval },
  );

  // Queue jobs (for expanded queue)
  const { data: queueJobs, loading: jobsLoading } = useQuery<QueueJob[]>(
    () => api.get(`/system/queues/${expandedQueue}/jobs`),
    [expandedQueue],
    { enabled: expandedQueue !== null },
  );

  const healthCards = useMemo(() => {
    if (!health) return [];
    return [
      { label: 'Database', status: health.database },
      { label: 'Redis', status: health.redis },
      { label: 'Storage', status: health.storage },
      { label: 'API', status: 'up' as const },
    ];
  }, [health]);

  const jobColumns = useMemo(
    () => [
      {
        key: 'name',
        header: 'Job',
        render: (item: QueueJob) => (
          <span className="text-sm font-medium text-text">{item.name}</span>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        render: (item: QueueJob) => (
          <Badge
            variant={
              item.status === 'completed' ? 'success' :
              item.status === 'failed' ? 'danger' :
              item.status === 'active' ? 'info' :
              'default'
            }
          >
            {item.status}
          </Badge>
        ),
      },
      {
        key: 'createdAt',
        header: 'Created',
        render: (item: QueueJob) => (
          <span className="text-sm text-text-secondary">
            {new Date(item.createdAt).toLocaleString()}
          </span>
        ),
      },
      {
        key: 'duration',
        header: 'Duration',
        render: (item: QueueJob) => (
          <span className="text-sm text-text-secondary">{item.duration}ms</span>
        ),
      },
    ],
    [],
  );

  const dbTableColumns = useMemo(
    () => [
      { key: 'name', header: 'Table' },
      {
        key: 'rows',
        header: 'Rows',
        render: (item: { id: string; name: string; rows: number; size: string }) => (
          <span className="text-sm text-text">{item.rows.toLocaleString()}</span>
        ),
      },
      { key: 'size', header: 'Size' },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">System Health</h1>
          <p className="text-text-secondary mt-1">Monitor queues, database, and service health.</p>
        </div>
        <Toggle
          label="Auto-refresh (30s)"
          enabled={autoRefresh}
          onChange={setAutoRefresh}
        />
      </div>

      {/* Health Cards */}
      {healthLoading && !health ? (
        <LoadingState message="Checking health..." size="sm" />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {healthCards.map((card) => (
            <div
              key={card.label}
              className="bg-surface border border-border rounded-lg p-5 flex items-center gap-4"
            >
              <span
                className={`inline-block w-4 h-4 rounded-full ${
                  card.status === 'up' ? 'bg-success' : 'bg-danger'
                }`}
              />
              <div>
                <p className="text-sm font-medium text-text">{card.label}</p>
                <p className={`text-xs ${card.status === 'up' ? 'text-success' : 'text-danger'}`}>
                  {card.status === 'up' ? 'Healthy' : 'Down'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* System Info */}
      {infoLoading && !sysInfo ? (
        <LoadingState message="Loading system info..." size="sm" />
      ) : sysInfo ? (
        <Card title="System Info">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-text-secondary">Uptime</p>
              <p className="font-medium text-text mt-0.5">{formatUptime(sysInfo.uptime)}</p>
            </div>
            <div>
              <p className="text-text-secondary">Node Version</p>
              <p className="font-medium text-text mt-0.5">{sysInfo.nodeVersion}</p>
            </div>
            <div>
              <p className="text-text-secondary">Heap Used</p>
              <p className="font-medium text-text mt-0.5">
                {formatBytes(sysInfo.memoryUsage.heapUsed)} / {formatBytes(sysInfo.memoryUsage.heapTotal)}
              </p>
            </div>
            <div>
              <p className="text-text-secondary">RSS</p>
              <p className="font-medium text-text mt-0.5">{formatBytes(sysInfo.memoryUsage.rss)}</p>
            </div>
          </div>
        </Card>
      ) : null}

      {/* Queue Status */}
      <Card title="Queue Status">
        {queuesLoading && !queues ? (
          <LoadingState message="Loading queues..." size="sm" />
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {(queues ?? []).map((queue) => (
                <button
                  key={queue.name}
                  onClick={() =>
                    setExpandedQueue(expandedQueue === queue.name ? null : queue.name)
                  }
                  className={`text-left p-4 rounded-lg border transition-colors cursor-pointer ${
                    expandedQueue === queue.name
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-bg hover:border-primary/40'
                  }`}
                >
                  <p className="text-sm font-medium text-text truncate">{queue.name}</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-xs">
                    <span className="text-text-secondary">
                      Waiting: <span className="font-medium text-text">{queue.waiting}</span>
                    </span>
                    <span className="text-text-secondary">
                      Active: <span className="font-medium text-info">{queue.active}</span>
                    </span>
                    <span className="text-text-secondary">
                      Done: <span className="font-medium text-success">{queue.completed}</span>
                    </span>
                    <span className="text-text-secondary">
                      Failed: <span className="font-medium text-danger">{queue.failed}</span>
                    </span>
                  </div>
                </button>
              ))}
              {(queues ?? []).length === 0 && (
                <p className="col-span-full text-sm text-text-muted text-center py-4">
                  No queues found.
                </p>
              )}
            </div>

            {/* Expanded queue jobs */}
            {expandedQueue && (
              <div className="pt-3 border-t border-border">
                <h4 className="text-sm font-medium text-text mb-3">
                  Recent jobs in "{expandedQueue}"
                </h4>
                {jobsLoading ? (
                  <LoadingState message="Loading jobs..." size="sm" />
                ) : (
                  <DataTable
                    columns={jobColumns}
                    data={queueJobs ?? []}
                    loading={jobsLoading}
                    emptyMessage="No recent jobs in this queue."
                  />
                )}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* DB Stats */}
      <Card title="Database Statistics">
        {dbLoading && !dbStats ? (
          <LoadingState message="Loading database stats..." size="sm" />
        ) : dbStats ? (
          <div className="space-y-4">
            <StatsCard
              title="Total Rows"
              value={dbStats.totalRows.toLocaleString()}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              }
            />
            <DataTable
              columns={dbTableColumns}
              data={(dbStats.tables ?? []).map((t) => ({ id: t.name, ...t }))}
              loading={false}
              emptyMessage="No table data available."
            />
          </div>
        ) : null}
      </Card>
    </div>
  );
}
