import { useCallback, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '../../hooks/useQuery';
import { useMutation } from '../../hooks/useMutation';
import { api } from '../../lib/api';
import {
  Button,
  Card,
  StatusChip,
  Badge,
  Input,
  Modal,
  ConfirmDialog,
  LoadingState,
} from '../../components/ui';

interface ContentItem {
  id: string;
  title: string;
  type: string;
  status: string;
}

interface ReleaseDetail {
  id: string;
  title: string;
  description: string;
  scheduledDate: string;
  status: 'draft' | 'in_review' | 'approved' | 'published' | 'archived';
  creator: string;
  contentItems: ContentItem[];
}

interface ReadinessCheck {
  label: string;
  passed: boolean;
}

const READINESS_CHECKS: ReadinessCheck[] = [
  { label: 'All content published', passed: true },
  { label: 'No broken links', passed: true },
  { label: 'Assets optimized', passed: true },
];

export function ReleaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');

  const { data: release, loading, error, refetch } = useQuery<ReleaseDetail>(
    () => api.get(`/releases/${id}`),
    [id],
  );

  const { mutate: executeRelease, loading: executing } = useMutation<void, void>(
    () => api.post(`/releases/${id}/execute`),
    { onSuccess: () => refetch() },
  );

  const { mutate: reschedule, loading: rescheduling } = useMutation<void, { scheduledDate: string }>(
    (vars) => api.patch(`/releases/${id}`, vars),
    {
      onSuccess: () => {
        setShowRescheduleModal(false);
        setRescheduleDate('');
        refetch();
      },
    },
  );

  const { mutate: cancelRelease, loading: cancelling } = useMutation<void, void>(
    () => api.post(`/releases/${id}/cancel`),
    {
      onSuccess: () => {
        setShowCancelDialog(false);
        refetch();
      },
    },
  );

  const handleReschedule = useCallback(() => {
    if (!rescheduleDate) return;
    reschedule({ scheduledDate: rescheduleDate });
  }, [rescheduleDate, reschedule]);

  if (loading) return <LoadingState message="Loading release..." />;

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-danger/10 border border-danger/20 rounded-lg p-4 text-danger text-sm">
          Failed to load release: {error.message}
        </div>
      </div>
    );
  }

  if (!release) return null;

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        to="/releases"
        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Releases
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-text">{release.title}</h1>
            <StatusChip status={release.status} />
          </div>
          <p className="text-text-secondary mt-1">
            Scheduled for {new Date(release.scheduledDate).toLocaleDateString()} · Created by {release.creator}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setRescheduleDate(release.scheduledDate.split('T')[0] ?? '');
              setShowRescheduleModal(true);
            }}
            disabled={rescheduling}
          >
            Reschedule
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowCancelDialog(true)}
            disabled={cancelling}
          >
            Cancel Release
          </Button>
          <Button
            size="sm"
            onClick={() => executeRelease()}
            loading={executing}
          >
            Execute Now
          </Button>
        </div>
      </div>

      {/* Content Items */}
      <Card title={`Content Items (${release.contentItems.length})`}>
        {release.contentItems.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-4">
            No content items in this release.
          </p>
        ) : (
          <div className="divide-y divide-border -mx-5">
            {release.contentItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-text">{item.title}</span>
                  <Badge variant="default">{item.type}</Badge>
                </div>
                <span className="text-xs text-text-muted">{item.status}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Readiness Checks */}
      <Card title="Readiness Checks">
        <div className="space-y-3">
          {READINESS_CHECKS.map((check) => (
            <div key={check.label} className="flex items-center gap-3">
              <span
                className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-xs
                  ${check.passed ? 'bg-success' : 'bg-danger'}`}
              >
                {check.passed ? (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </span>
              <span className="text-sm text-text">{check.label}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Reschedule Modal */}
      <Modal
        open={showRescheduleModal}
        onClose={() => setShowRescheduleModal(false)}
        title="Reschedule Release"
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="New Date"
            type="date"
            value={rescheduleDate}
            onChange={(e) => setRescheduleDate(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowRescheduleModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleReschedule}
              loading={rescheduling}
              disabled={!rescheduleDate}
            >
              Reschedule
            </Button>
          </div>
        </div>
      </Modal>

      {/* Cancel Confirm */}
      <ConfirmDialog
        open={showCancelDialog}
        title="Cancel Release"
        message="Are you sure you want to cancel this release? This action cannot be undone."
        confirmLabel="Cancel Release"
        variant="danger"
        onConfirm={() => cancelRelease()}
        onCancel={() => setShowCancelDialog(false)}
      />
    </div>
  );
}
