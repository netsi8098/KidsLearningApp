import { useMemo, useState } from 'react';
import { useQuery } from '../../hooks/useQuery';
import { useMutation } from '../../hooks/useMutation';
import { api } from '../../lib/api';
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  DataTable,
  Drawer,
  LoadingState,
} from '../../components/ui';

interface MaintenanceJob {
  id: string;
  name: string;
  description: string;
  lastRunAt: string | null;
  lastResultStatus: 'success' | 'failed' | 'pending' | null;
}

interface RunHistoryEntry {
  id: string;
  timestamp: string;
  duration: number;
  dryRun: boolean;
  affectedCount: number;
  status: 'success' | 'failed';
}

interface RunResponse {
  status: string;
  affectedCount: number;
}

const STATUS_VARIANTS: Record<string, 'success' | 'danger' | 'warning' | 'default'> = {
  success: 'success',
  failed: 'danger',
  pending: 'warning',
};

export function MaintenancePage() {
  const [confirmRun, setConfirmRun] = useState<{ jobId: string; dryRun: boolean } | null>(null);
  const [selectedJob, setSelectedJob] = useState<MaintenanceJob | null>(null);

  // Job list
  const { data: jobs, loading: jobsLoading, refetch: refetchJobs } = useQuery<MaintenanceJob[]>(
    () => api.get('/maintenance'),
    [],
  );

  // Job history (for drawer)
  const { data: history, loading: historyLoading } = useQuery<RunHistoryEntry[]>(
    () => api.get(`/maintenance/${selectedJob?.id}/history`),
    [selectedJob?.id],
    { enabled: selectedJob !== null },
  );

  // Run mutation
  const { mutate: runJob, loading: running } = useMutation<
    RunResponse,
    { jobId: string; dryRun: boolean }
  >(
    ({ jobId, dryRun }) => api.post(`/maintenance/${jobId}/run`, { dryRun }),
    {
      onSuccess: () => {
        refetchJobs();
        setConfirmRun(null);
      },
    },
  );

  const handleRun = (jobId: string, dryRun: boolean) => {
    if (dryRun) {
      runJob({ jobId, dryRun: true });
    } else {
      setConfirmRun({ jobId, dryRun: false });
    }
  };

  const historyColumns = useMemo(
    () => [
      {
        key: 'timestamp',
        header: 'Timestamp',
        render: (item: RunHistoryEntry) => (
          <span className="text-sm text-text-secondary whitespace-nowrap">
            {new Date(item.timestamp).toLocaleString()}
          </span>
        ),
      },
      {
        key: 'duration',
        header: 'Duration',
        render: (item: RunHistoryEntry) => (
          <span className="text-sm text-text">{(item.duration / 1000).toFixed(1)}s</span>
        ),
      },
      {
        key: 'dryRun',
        header: 'Mode',
        render: (item: RunHistoryEntry) => (
          <Badge variant={item.dryRun ? 'warning' : 'primary'}>
            {item.dryRun ? 'Dry Run' : 'Live'}
          </Badge>
        ),
      },
      {
        key: 'affectedCount',
        header: 'Affected',
        render: (item: RunHistoryEntry) => (
          <span className="text-sm font-medium text-text">{item.affectedCount}</span>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        render: (item: RunHistoryEntry) => (
          <Badge variant={item.status === 'success' ? 'success' : 'danger'}>
            {item.status}
          </Badge>
        ),
      },
    ],
    [],
  );

  const confirmJobName = useMemo(() => {
    if (!confirmRun || !jobs) return '';
    return jobs.find((j) => j.id === confirmRun.jobId)?.name ?? confirmRun.jobId;
  }, [confirmRun, jobs]);

  if (jobsLoading && !jobs) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text">Maintenance</h1>
          <p className="text-text-secondary mt-1">Run and monitor maintenance jobs.</p>
        </div>
        <LoadingState message="Loading maintenance jobs..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Maintenance</h1>
          <p className="text-text-secondary mt-1">Run and monitor maintenance jobs.</p>
        </div>
      </div>

      {/* Job Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(jobs ?? []).map((job) => (
          <Card key={job.id}>
            <div className="space-y-3">
              {/* Title + Status */}
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-text truncate">{job.name}</h3>
                  <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                    {job.description}
                  </p>
                </div>
                {job.lastResultStatus && (
                  <Badge
                    variant={STATUS_VARIANTS[job.lastResultStatus] ?? 'default'}
                    className="ml-2 shrink-0"
                  >
                    {job.lastResultStatus}
                  </Badge>
                )}
              </div>

              {/* Last run */}
              <p className="text-xs text-text-muted">
                {job.lastRunAt
                  ? `Last run: ${new Date(job.lastRunAt).toLocaleString()}`
                  : 'Never run'}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1">
                <Button
                  size="sm"
                  loading={running && confirmRun?.jobId === job.id}
                  onClick={() => handleRun(job.id, false)}
                >
                  Run
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleRun(job.id, true)}
                >
                  Dry Run
                </Button>
                <button
                  onClick={() => setSelectedJob(job)}
                  className="ml-auto text-xs text-primary hover:text-primary-hover font-medium cursor-pointer"
                >
                  History
                </button>
              </div>
            </div>
          </Card>
        ))}
        {(jobs ?? []).length === 0 && (
          <div className="col-span-full text-center py-12 text-text-muted">
            No maintenance jobs configured.
          </div>
        )}
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmRun !== null}
        title="Run Maintenance Job"
        message={`Are you sure you want to run "${confirmJobName}"? This will execute the job in live mode.`}
        confirmLabel="Run Job"
        variant="primary"
        onConfirm={() => {
          if (confirmRun) runJob(confirmRun);
        }}
        onCancel={() => setConfirmRun(null)}
      />

      {/* History Drawer */}
      <Drawer
        open={selectedJob !== null}
        onClose={() => setSelectedJob(null)}
        title={selectedJob ? `History: ${selectedJob.name}` : 'Job History'}
      >
        {selectedJob && (
          <div className="space-y-4">
            <div className="text-sm">
              <p className="text-text-secondary">{selectedJob.description}</p>
            </div>
            {historyLoading ? (
              <LoadingState message="Loading history..." size="sm" />
            ) : (
              <DataTable
                columns={historyColumns}
                data={history ?? []}
                loading={historyLoading}
                emptyMessage="No run history available."
              />
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
