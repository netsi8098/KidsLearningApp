import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '../../hooks/useQuery';
import { useMutation } from '../../hooks/useMutation';
import { api } from '../../lib/api';
import {
  Button,
  Card,
  StatusChip,
  BarChart,
  ConfirmDialog,
  LoadingState,
  EmptyState,
} from '../../components/ui';

/* ─── Types ─── */

type ExperimentStatus = 'draft' | 'running' | 'paused' | 'completed';

interface Variant {
  id: string;
  name: string;
  weight: number;
  description: string;
}

interface ExperimentDetail {
  id: string;
  name: string;
  status: ExperimentStatus;
  startDate: string | null;
  endDate: string | null;
  trafficSplit: number;
  targetMetric: string;
  minSampleSize: number;
  variants: Variant[];
}

/* ─── Constants ─── */

const STATUS_MAP: Record<ExperimentStatus, 'draft' | 'published' | 'in_review' | 'approved'> = {
  draft: 'draft',
  running: 'published',
  paused: 'in_review',
  completed: 'approved',
};

const MOCK_RESULTS = [
  { name: 'Control', value: 42 },
  { name: 'Variant A', value: 51 },
  { name: 'Variant B', value: 47 },
];

/* ─── Component ─── */

export function ExperimentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [showStopDialog, setShowStopDialog] = useState(false);
  const [showKillDialog, setShowKillDialog] = useState(false);

  const { data: experiment, loading, error, refetch } = useQuery<ExperimentDetail>(
    () => api.get(`/experiments/${id}`),
    [id],
    { enabled: !!id },
  );

  const { mutate: updateStatus, loading: updatingStatus } = useMutation<void, { action: string }>(
    (vars) => api.post(`/experiments/${id}/${vars.action}`),
    { onSuccess: () => refetch() },
  );

  const { mutate: killSwitch, loading: killing } = useMutation<void, void>(
    () => api.post(`/experiments/${id}/kill`),
    {
      onSuccess: () => {
        setShowKillDialog(false);
        refetch();
      },
    },
  );

  if (loading) return <LoadingState message="Loading experiment..." />;

  if (error) {
    return (
      <div className="space-y-4">
        <Link to="/experiments" className="text-sm text-primary hover:text-primary-hover font-medium">
          &larr; Back to Experiments
        </Link>
        <div className="bg-danger/10 border border-danger/20 rounded-lg p-4 text-danger text-sm">
          Failed to load experiment: {error.message}
        </div>
      </div>
    );
  }

  if (!experiment) {
    return (
      <EmptyState
        title="Experiment not found"
        description="The requested experiment could not be found."
      />
    );
  }

  const status = experiment.status;
  const hasStarted = status === 'running' || status === 'paused' || status === 'completed';

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        to="/experiments"
        className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary-hover font-medium"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Experiments
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-text">{experiment.name}</h1>
            <StatusChip status={STATUS_MAP[status]} />
          </div>
          <div className="flex items-center gap-4 mt-2 text-sm text-text-secondary">
            <span>Start: {experiment.startDate ? new Date(experiment.startDate).toLocaleDateString() : 'Not started'}</span>
            <span>End: {experiment.endDate ? new Date(experiment.endDate).toLocaleDateString() : '--'}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {status === 'draft' && (
            <Button
              loading={updatingStatus}
              onClick={() => updateStatus({ action: 'start' })}
            >
              Start
            </Button>
          )}
          {status === 'running' && (
            <Button
              variant="secondary"
              loading={updatingStatus}
              onClick={() => updateStatus({ action: 'pause' })}
            >
              Pause
            </Button>
          )}
          {status === 'paused' && (
            <Button
              loading={updatingStatus}
              onClick={() => updateStatus({ action: 'resume' })}
            >
              Resume
            </Button>
          )}
          {(status === 'running' || status === 'paused') && (
            <Button
              variant="secondary"
              onClick={() => setShowStopDialog(true)}
            >
              Stop
            </Button>
          )}
          {status !== 'completed' && (
            <Button variant="danger" onClick={() => setShowKillDialog(true)}>
              Kill Switch
            </Button>
          )}
        </div>
      </div>

      {/* Variants */}
      <div>
        <h2 className="text-sm font-semibold text-text mb-3">Variants</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {experiment.variants.map((variant) => (
            <Card key={variant.id}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-text">{variant.name}</p>
                  <p className="text-sm text-text-secondary mt-1">{variant.description}</p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary shrink-0 ml-3">
                  {variant.weight}%
                </span>
              </div>
            </Card>
          ))}
          {experiment.variants.length === 0 && (
            <p className="text-sm text-text-muted col-span-3">No variants configured.</p>
          )}
        </div>
      </div>

      {/* Results */}
      <Card title="Results">
        {hasStarted ? (
          <BarChart data={MOCK_RESULTS} height={280} color="#8B5CF6" />
        ) : (
          <EmptyState
            title="No results yet"
            description="Start the experiment to begin collecting data."
          />
        )}
      </Card>

      {/* Settings */}
      <Card title="Settings">
        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <dt className="text-text-secondary">Traffic Split</dt>
            <dd className="font-medium text-text mt-1">{experiment.trafficSplit}%</dd>
          </div>
          <div>
            <dt className="text-text-secondary">Target Metric</dt>
            <dd className="font-medium text-text mt-1">{experiment.targetMetric}</dd>
          </div>
          <div>
            <dt className="text-text-secondary">Min Sample Size</dt>
            <dd className="font-medium text-text mt-1">{experiment.minSampleSize.toLocaleString()}</dd>
          </div>
        </dl>
      </Card>

      {/* Stop Confirm Dialog */}
      <ConfirmDialog
        open={showStopDialog}
        title="Stop Experiment"
        message={`Are you sure you want to stop "${experiment.name}"? This will end data collection and finalize results.`}
        confirmLabel="Stop Experiment"
        variant="danger"
        onConfirm={() => {
          updateStatus({ action: 'stop' });
          setShowStopDialog(false);
        }}
        onCancel={() => setShowStopDialog(false)}
      />

      {/* Kill Switch Dialog */}
      <ConfirmDialog
        open={showKillDialog}
        title="Kill Switch"
        message={`This will immediately terminate "${experiment.name}" and revert all users to the control group. This action cannot be undone.`}
        confirmLabel={killing ? 'Killing...' : 'Kill Experiment'}
        variant="danger"
        onConfirm={() => killSwitch()}
        onCancel={() => setShowKillDialog(false)}
      />
    </div>
  );
}
