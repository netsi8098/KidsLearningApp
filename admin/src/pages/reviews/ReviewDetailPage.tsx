import { useCallback, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '../../hooks/useQuery';
import { useMutation } from '../../hooks/useMutation';
import { api } from '../../lib/api';
import {
  Button,
  Card,
  StatusChip,
  Tabs,
  TextArea,
  Timeline,
  ConfirmDialog,
  LoadingState,
} from '../../components/ui';

interface Comment {
  id: string;
  user: string;
  message: string;
  createdAt: string;
  resolvedAt: string | null;
}

interface HistoryEntry {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  detail?: string;
}

interface ReviewDetail {
  id: string;
  contentTitle: string;
  contentBody: string;
  status: 'draft' | 'in_review' | 'approved' | 'published' | 'rejected';
  reviewer: string;
  author: string;
  submittedAt: string;
  comments: Comment[];
  history: HistoryEntry[];
}

type ConfirmAction = 'approve' | 'request_changes' | 'reject' | null;

const CONFIRM_CONFIG: Record<
  Exclude<ConfirmAction, null>,
  { title: string; message: string; label: string; variant: 'primary' | 'danger' }
> = {
  approve: {
    title: 'Approve Review',
    message: 'Are you sure you want to approve this content? It will be cleared for publishing.',
    label: 'Approve',
    variant: 'primary',
  },
  request_changes: {
    title: 'Request Changes',
    message: 'The author will be notified to make the requested changes before resubmitting.',
    label: 'Request Changes',
    variant: 'primary',
  },
  reject: {
    title: 'Reject Review',
    message: 'This content will be rejected. This action can be undone by creating a new review.',
    label: 'Reject',
    variant: 'danger',
  },
};

export function ReviewDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('changes');
  const [commentText, setCommentText] = useState('');
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  const { data: review, loading, error, refetch } = useQuery<ReviewDetail>(
    () => api.get(`/reviews/${id}`),
    [id],
  );

  const { mutate: updateStatus, loading: actionLoading } = useMutation<void, { action: string }>(
    (vars) => api.post(`/reviews/${id}/action`, vars),
    { onSuccess: () => { refetch(); setConfirmAction(null); } },
  );

  const { mutate: addComment, loading: commentLoading } = useMutation<void, { message: string }>(
    (vars) => api.post(`/reviews/${id}/comments`, vars),
    { onSuccess: () => { refetch(); setCommentText(''); } },
  );

  const handleConfirm = useCallback(() => {
    if (confirmAction) {
      updateStatus({ action: confirmAction });
    }
  }, [confirmAction, updateStatus]);

  const handleAddComment = useCallback(() => {
    if (!commentText.trim()) return;
    addComment({ message: commentText.trim() });
  }, [commentText, addComment]);

  const tabs = useMemo(
    () => [
      { key: 'changes', label: 'Changes' },
      { key: 'comments', label: `Comments (${review?.comments.length ?? 0})` },
      { key: 'history', label: 'History' },
    ],
    [review?.comments.length],
  );

  const timelineItems = useMemo(
    () =>
      (review?.history ?? []).map((h) => ({
        id: h.id,
        title: h.action,
        description: h.detail,
        timestamp: new Date(h.timestamp).toLocaleString(),
        user: h.user,
        type: 'review' as const,
      })),
    [review?.history],
  );

  if (loading) return <LoadingState message="Loading review..." />;

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-danger/10 border border-danger/20 rounded-lg p-4 text-danger text-sm">
          Failed to load review: {error.message}
        </div>
      </div>
    );
  }

  if (!review) return null;

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        to="/reviews"
        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Reviews
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-text">{review.contentTitle}</h1>
            <StatusChip status={review.status} />
          </div>
          <p className="text-text-secondary mt-1">
            Submitted by {review.author} · Reviewer: {review.reviewer || 'Unassigned'}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setConfirmAction('request_changes')}
            disabled={actionLoading}
          >
            Request Changes
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setConfirmAction('reject')}
            disabled={actionLoading}
          >
            Reject
          </Button>
          <Button
            size="sm"
            onClick={() => setConfirmAction('approve')}
            disabled={actionLoading}
          >
            Approve
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeKey={activeTab} onChange={setActiveTab} />

      {/* Tab content */}
      {activeTab === 'changes' && (
        <Card title="Current Content">
          <div className="prose prose-sm max-w-none text-text whitespace-pre-wrap">
            {review.contentBody || 'No content body available.'}
          </div>
        </Card>
      )}

      {activeTab === 'comments' && (
        <div className="space-y-4">
          {/* Comment list */}
          {review.comments.length === 0 ? (
            <Card>
              <p className="text-sm text-text-muted text-center py-4">
                No comments yet. Start the conversation below.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {review.comments.map((comment) => (
                <Card key={comment.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-text">{comment.user}</span>
                        <span className="text-xs text-text-muted">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-text-secondary whitespace-pre-wrap">
                        {comment.message}
                      </p>
                    </div>
                    {comment.resolvedAt && (
                      <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">
                        Resolved
                      </span>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Add comment form */}
          <Card title="Add Comment">
            <div className="space-y-3">
              <TextArea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write your comment..."
                rows={3}
              />
              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={handleAddComment}
                  loading={commentLoading}
                  disabled={!commentText.trim()}
                >
                  Post Comment
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'history' && (
        <Card title="Review History">
          {timelineItems.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-4">
              No history entries yet.
            </p>
          ) : (
            <Timeline items={timelineItems} />
          )}
        </Card>
      )}

      {/* Confirm dialog */}
      {confirmAction && (
        <ConfirmDialog
          open
          title={CONFIRM_CONFIG[confirmAction].title}
          message={CONFIRM_CONFIG[confirmAction].message}
          confirmLabel={CONFIRM_CONFIG[confirmAction].label}
          variant={CONFIRM_CONFIG[confirmAction].variant}
          onConfirm={handleConfirm}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
}
