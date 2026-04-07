import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '../../hooks/useQuery';
import { useMutation } from '../../hooks/useMutation';
import { api } from '../../lib/api';
import {
  Button,
  Card,
  Badge,
  StatusChip,
  Tabs,
  Timeline,
  ConfirmDialog,
  LoadingState,
  EmptyState,
} from '../../components/ui';

interface ContentDetail {
  id: string;
  title: string;
  slug: string;
  type: string;
  status: 'draft' | 'in_review' | 'approved' | 'published' | 'archived';
  ageGroup: string;
  difficulty: string;
  body: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  featured: boolean;
  mood: string;
  bedtimeFriendly: boolean;
  language: string;
  tags: string[];
  skills: string[];
  assets: { id: string; url: string; type: string; name: string }[];
}

interface AuditEntry {
  id: string;
  action: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  userId: string;
  userName?: string;
  createdAt: string;
}

const DETAIL_TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'history', label: 'History' },
  { key: 'related', label: 'Related' },
];

export function ContentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: content, loading, error } = useQuery<ContentDetail>(
    () => api.get(`/content/${id}`),
    [id],
    { enabled: !!id },
  );

  const { data: auditData } = useQuery<AuditEntry[]>(
    () => api.get(`/audit/entity/Content/${id}`),
    [id],
    { enabled: !!id && activeTab === 'history' },
  );

  const { mutate: deleteContent, loading: deleting } = useMutation<void, void>(
    () => api.delete(`/content/${id}`),
    {
      onSuccess: () => navigate('/content'),
    },
  );

  if (loading) return <LoadingState message="Loading content details..." />;

  if (error) {
    return (
      <div className="space-y-4">
        <Link to="/content" className="text-sm text-primary hover:text-primary-hover font-medium">
          &larr; Back to Content
        </Link>
        <div className="bg-danger/10 border border-danger/20 rounded-lg p-4 text-danger text-sm">
          Failed to load content: {error.message}
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <EmptyState
        title="Content not found"
        description="The requested content item could not be found."
        action={{ label: 'Back to Content', onClick: () => navigate('/content') }}
      />
    );
  }

  const timelineItems = auditData?.map((entry) => ({
    id: entry.id,
    title: entry.action,
    description: entry.field
      ? `${entry.field}: "${entry.oldValue ?? ''}" -> "${entry.newValue ?? ''}"`
      : undefined,
    timestamp: new Date(entry.createdAt).toLocaleString(),
    user: entry.userName ?? entry.userId,
    type: mapAuditToTimelineType(entry.action),
  })) ?? [
    {
      id: 'created',
      title: 'Content created',
      description: `Created as ${content.type} for age group ${content.ageGroup}`,
      timestamp: new Date(content.createdAt).toLocaleString(),
      user: content.authorId,
      type: 'create' as const,
    },
    {
      id: 'updated',
      title: 'Last updated',
      description: `Status: ${content.status}`,
      timestamp: new Date(content.updatedAt).toLocaleString(),
      user: content.authorId,
      type: 'update' as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link to="/content" className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary-hover font-medium">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Content
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-text">{content.title}</h1>
          <StatusChip status={content.status} />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="secondary" onClick={() => navigate(`/content/${id}/edit`)}>
            Edit
          </Button>
          <Button variant="danger" onClick={() => setShowDeleteDialog(true)}>
            Delete
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={DETAIL_TABS} activeKey={activeTab} onChange={setActiveTab} />

      {/* Tab Content */}
      <div className="mt-4">
        {activeTab === 'overview' && <OverviewTab content={content} />}
        {activeTab === 'history' && <HistoryTab items={timelineItems} />}
        {activeTab === 'related' && <RelatedTab content={content} />}
      </div>

      {/* Delete Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        title="Delete Content"
        message={`Are you sure you want to delete "${content.title}"? This action cannot be undone.`}
        confirmLabel={deleting ? 'Deleting...' : 'Delete'}
        variant="danger"
        onConfirm={() => deleteContent()}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </div>
  );
}

/* ─── Sub-components ─── */

function OverviewTab({ content }: { content: ContentDetail }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Metadata */}
      <Card title="Metadata" className="lg:col-span-1">
        <dl className="space-y-3 text-sm">
          <MetaRow label="Type" value={content.type} />
          <MetaRow label="Slug" value={content.slug} />
          <MetaRow label="Age Group" value={`${content.ageGroup} years`} />
          <MetaRow label="Difficulty" value={content.difficulty} />
          <MetaRow label="Language" value={content.language?.toUpperCase() ?? 'EN'} />
          <MetaRow label="Featured" value={content.featured ? 'Yes' : 'No'} />
          <MetaRow label="Bedtime Friendly" value={content.bedtimeFriendly ? 'Yes' : 'No'} />
          <MetaRow label="Mood" value={content.mood || '--'} />
          <MetaRow label="Created" value={new Date(content.createdAt).toLocaleDateString()} />
          <MetaRow label="Updated" value={new Date(content.updatedAt).toLocaleDateString()} />
        </dl>
      </Card>

      {/* Tags & Skills */}
      <div className="lg:col-span-1 space-y-6">
        <Card title="Tags">
          {content.tags?.length ? (
            <div className="flex flex-wrap gap-2">
              {content.tags.map((tag) => (
                <Badge key={tag} variant="primary">{tag}</Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-muted">No tags assigned.</p>
          )}
        </Card>

        <Card title="Skills">
          {content.skills?.length ? (
            <ul className="space-y-1.5">
              {content.skills.map((skill) => (
                <li key={skill} className="flex items-center gap-2 text-sm text-text">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  {skill}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-text-muted">No skills linked.</p>
          )}
        </Card>
      </div>

      {/* Body Preview */}
      <Card title="Body Preview" className="lg:col-span-1">
        {content.body ? (
          <div className="prose prose-sm max-w-none text-text text-sm whitespace-pre-wrap">
            {content.body}
          </div>
        ) : (
          <p className="text-sm text-text-muted">No body content.</p>
        )}
      </Card>
    </div>
  );
}

function HistoryTab({ items }: { items: { id: string; title: string; description?: string; timestamp: string; user?: string; type?: 'create' | 'update' | 'delete' | 'publish' | 'review' }[] }) {
  if (!items.length) {
    return <EmptyState title="No history" description="No audit entries found for this content." />;
  }

  return (
    <Card title="Change History">
      <Timeline items={items} />
    </Card>
  );
}

function RelatedTab({ content }: { content: ContentDetail }) {
  return (
    <div className="space-y-6">
      {/* Assets */}
      <Card title="Linked Assets">
        {content.assets?.length ? (
          <div className="divide-y divide-border">
            {content.assets.map((asset) => (
              <div key={asset.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-text">{asset.name}</p>
                  <p className="text-xs text-text-secondary">{asset.type}</p>
                </div>
                <a
                  href={asset.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:text-primary-hover font-medium"
                >
                  View
                </a>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-muted">No assets linked to this content.</p>
        )}
      </Card>

      {/* Collections placeholder */}
      <Card title="Collections">
        <p className="text-sm text-text-muted">
          Collection associations will appear here once configured.
        </p>
      </Card>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-text-secondary">{label}</dt>
      <dd className="font-medium text-text text-right">{value}</dd>
    </div>
  );
}

function mapAuditToTimelineType(action: string): 'create' | 'update' | 'delete' | 'publish' | 'review' {
  const lower = action.toLowerCase();
  if (lower.includes('create')) return 'create';
  if (lower.includes('delete')) return 'delete';
  if (lower.includes('publish')) return 'publish';
  if (lower.includes('review') || lower.includes('approve')) return 'review';
  return 'update';
}
