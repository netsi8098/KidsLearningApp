import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '../../hooks/useQuery';
import { useMutation } from '../../hooks/useMutation';
import { useToast } from '../../hooks/useToast';
import { api } from '../../lib/api';
import {
  Badge,
  Button,
  Card,
  Tabs,
  DataTable,
  Timeline,
  LoadingState,
  EmptyState,
  ConfirmDialog,
  StatusChip,
} from '../../components/ui';

/* ─── Types ─── */

type SubscriptionStatus = 'active' | 'trialing' | 'cancelled' | 'past_due' | 'paused';

interface SubscriptionDetail {
  id: string;
  householdId: string;
  householdName: string;
  plan: string;
  status: SubscriptionStatus;
  periodStart: string;
  periodEnd: string;
  currentPeriodUsage: number;
  cancelAtPeriodEnd: boolean;
  trialEnd: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  paidAt: string | null;
  createdAt: string;
  description: string;
}

interface Entitlement {
  id: string;
  feature: string;
  granted: boolean;
  source: string;
  expiresAt: string | null;
}

interface HistoryEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'create' | 'update' | 'publish' | 'delete';
}

/* ─── Constants ─── */

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'invoices', label: 'Invoices' },
  { key: 'entitlements', label: 'Entitlements' },
  { key: 'history', label: 'History' },
];

const STATUS_MAP: Record<SubscriptionStatus, 'published' | 'in_review' | 'draft' | 'approved' | 'archived'> = {
  active: 'published',
  trialing: 'in_review',
  cancelled: 'archived',
  past_due: 'draft',
  paused: 'approved',
};

const PLAN_VARIANTS: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'info'> = {
  free: 'default',
  basic: 'info',
  premium: 'success',
  family: 'primary',
};

const INVOICE_STATUS_MAP: Record<string, 'published' | 'in_review' | 'draft' | 'approved'> = {
  paid: 'published',
  pending: 'in_review',
  failed: 'draft',
  refunded: 'approved',
};

type ConfirmAction = 'cancel' | 'pause' | 'resume' | null;

/* ─── Component ─── */

export function SubscriptionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  const { data: subscription, loading, error, refetch } = useQuery<SubscriptionDetail>(
    () => api.get(`/subscriptions/${id}`),
    [id],
    { enabled: !!id },
  );

  const householdId = subscription?.householdId;

  const { data: entitlements } = useQuery<Entitlement[]>(
    () => api.get(`/subscriptions/entitlements/${householdId}`),
    [householdId],
    { enabled: !!householdId && activeTab === 'entitlements' },
  );

  const { mutate: cancelSubscription, loading: cancelling } = useMutation<void, void>(
    () => api.post(`/subscriptions/${id}/cancel`),
    {
      onSuccess: () => {
        toast.success('Subscription cancelled successfully.');
        setConfirmAction(null);
        refetch();
      },
      onError: (err) => toast.error(err.message),
    },
  );

  const { mutate: pauseSubscription, loading: pausing } = useMutation<void, void>(
    () => api.post(`/subscriptions/${id}/pause`),
    {
      onSuccess: () => {
        toast.success('Subscription paused successfully.');
        setConfirmAction(null);
        refetch();
      },
      onError: (err) => toast.error(err.message),
    },
  );

  const { mutate: resumeSubscription, loading: resuming } = useMutation<void, void>(
    () => api.post(`/subscriptions/${id}/resume`),
    {
      onSuccess: () => {
        toast.success('Subscription resumed successfully.');
        setConfirmAction(null);
        refetch();
      },
      onError: (err) => toast.error(err.message),
    },
  );

  if (loading) return <LoadingState message="Loading subscription..." />;

  if (error) {
    return (
      <div className="space-y-4">
        <Link to="/subscriptions" className="text-sm text-primary hover:text-primary-hover font-medium">
          &larr; Back to Subscriptions
        </Link>
        <div className="bg-danger/10 border border-danger/20 rounded-lg p-4 text-danger text-sm">
          Failed to load subscription: {error.message}
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <EmptyState
        title="Subscription not found"
        description="The requested subscription could not be found."
      />
    );
  }

  const handleConfirm = () => {
    if (confirmAction === 'cancel') cancelSubscription();
    if (confirmAction === 'pause') pauseSubscription();
    if (confirmAction === 'resume') resumeSubscription();
  };

  const confirmMessages: Record<string, { title: string; message: string; label: string }> = {
    cancel: {
      title: 'Cancel Subscription',
      message: 'Are you sure you want to cancel this subscription? The household will lose access at the end of the current billing period.',
      label: 'Cancel Subscription',
    },
    pause: {
      title: 'Pause Subscription',
      message: 'Are you sure you want to pause this subscription? Billing will be suspended until the subscription is resumed.',
      label: 'Pause Subscription',
    },
    resume: {
      title: 'Resume Subscription',
      message: 'Are you sure you want to resume this subscription? Billing will restart immediately.',
      label: 'Resume Subscription',
    },
  };

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        to="/subscriptions"
        className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary-hover font-medium"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Subscriptions
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-text">{subscription.householdName}</h1>
            <Badge variant={PLAN_VARIANTS[subscription.plan] ?? 'default'}>
              {subscription.plan}
            </Badge>
            <StatusChip status={STATUS_MAP[subscription.status]} />
          </div>
          <div className="flex items-center gap-4 mt-2 text-sm text-text-secondary">
            <span>ID: {subscription.id}</span>
            <span>Created: {new Date(subscription.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {subscription.status === 'active' && (
            <>
              <Button variant="secondary" onClick={() => setConfirmAction('pause')}>
                Pause
              </Button>
              <Button variant="danger" onClick={() => setConfirmAction('cancel')}>
                Cancel
              </Button>
            </>
          )}
          {subscription.status === 'paused' && (
            <Button onClick={() => setConfirmAction('resume')}>
              Resume
            </Button>
          )}
          {subscription.status === 'trialing' && (
            <Button variant="danger" onClick={() => setConfirmAction('cancel')}>
              Cancel Trial
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={TABS} activeKey={activeTab} onChange={setActiveTab} />

      {/* Tab content */}
      <div className="mt-4">
        {activeTab === 'overview' && (
          <OverviewTab subscription={subscription} />
        )}
        {activeTab === 'invoices' && (
          <InvoicesTab subscriptionId={subscription.id} />
        )}
        {activeTab === 'entitlements' && (
          <EntitlementsTab entitlements={entitlements ?? []} />
        )}
        {activeTab === 'history' && (
          <HistoryTab subscriptionId={subscription.id} />
        )}
      </div>

      {/* Confirm Dialog */}
      {confirmAction && (
        <ConfirmDialog
          open={!!confirmAction}
          onConfirm={handleConfirm}
          onCancel={() => setConfirmAction(null)}
          title={confirmMessages[confirmAction].title}
          message={confirmMessages[confirmAction].message}
          confirmLabel={confirmMessages[confirmAction].label}
          variant={confirmAction === 'resume' ? 'primary' : 'danger'}
        />
      )}
    </div>
  );
}

/* ─── Sub-components ─── */

function OverviewTab({ subscription }: { subscription: SubscriptionDetail }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card title="Plan Details">
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-text-secondary">Plan</dt>
            <dd className="font-medium text-text capitalize">{subscription.plan}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-text-secondary">Status</dt>
            <dd className="font-medium text-text capitalize">{subscription.status.replace('_', ' ')}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-text-secondary">Cancel at period end</dt>
            <dd className="font-medium text-text">{subscription.cancelAtPeriodEnd ? 'Yes' : 'No'}</dd>
          </div>
        </dl>
      </Card>

      <Card title="Billing Period">
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-text-secondary">Period Start</dt>
            <dd className="font-medium text-text">{new Date(subscription.periodStart).toLocaleDateString()}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-text-secondary">Period End</dt>
            <dd className="font-medium text-text">{new Date(subscription.periodEnd).toLocaleDateString()}</dd>
          </div>
          {subscription.trialEnd && (
            <div className="flex justify-between">
              <dt className="text-text-secondary">Trial End</dt>
              <dd className="font-medium text-text">{new Date(subscription.trialEnd).toLocaleDateString()}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-text-secondary">Last Updated</dt>
            <dd className="font-medium text-text">{new Date(subscription.updatedAt).toLocaleDateString()}</dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}

function InvoicesTab({ subscriptionId }: { subscriptionId: string }) {
  const { data, loading } = useQuery<{ data: Invoice[] }>(
    () => api.get(`/subscriptions/${subscriptionId}/invoices`),
    [subscriptionId],
  );

  const invoices = data?.data ?? [];

  const columns = [
    {
      key: 'description',
      header: 'Description',
      render: (item: Invoice) => (
        <span className="font-medium text-text">{item.description}</span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (item: Invoice) => (
        <span className="text-sm text-text">
          {item.currency.toUpperCase()} {item.amount.toFixed(2)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: Invoice) => (
        <StatusChip status={INVOICE_STATUS_MAP[item.status] ?? 'draft'} />
      ),
    },
    {
      key: 'paidAt',
      header: 'Paid At',
      render: (item: Invoice) => (
        <span className="text-sm text-text-secondary">
          {item.paidAt ? new Date(item.paidAt).toLocaleDateString() : '--'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (item: Invoice) => (
        <span className="text-sm text-text-secondary">
          {new Date(item.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  if (loading) return <LoadingState message="Loading invoices..." />;

  return (
    <DataTable
      columns={columns}
      data={invoices}
      emptyMessage="No invoices found for this subscription."
    />
  );
}

function EntitlementsTab({ entitlements }: { entitlements: Entitlement[] }) {
  const columns = [
    {
      key: 'feature',
      header: 'Feature',
      render: (item: Entitlement) => (
        <span className="font-medium text-text">{item.feature}</span>
      ),
    },
    {
      key: 'granted',
      header: 'Granted',
      render: (item: Entitlement) => (
        <Badge variant={item.granted ? 'success' : 'default'}>
          {item.granted ? 'Yes' : 'No'}
        </Badge>
      ),
    },
    {
      key: 'source',
      header: 'Source',
      render: (item: Entitlement) => (
        <span className="text-sm text-text-secondary">{item.source}</span>
      ),
    },
    {
      key: 'expiresAt',
      header: 'Expires',
      render: (item: Entitlement) => (
        <span className="text-sm text-text-secondary">
          {item.expiresAt ? new Date(item.expiresAt).toLocaleDateString() : 'Never'}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={entitlements}
      emptyMessage="No entitlements found for this household."
    />
  );
}

function HistoryTab({ subscriptionId }: { subscriptionId: string }) {
  const { data, loading } = useQuery<{ data: HistoryEvent[] }>(
    () => api.get(`/subscriptions/${subscriptionId}/history`),
    [subscriptionId],
  );

  const events = data?.data ?? [];

  if (loading) return <LoadingState message="Loading history..." />;

  if (!events.length) {
    return (
      <EmptyState
        title="No history"
        description="No events have been recorded for this subscription yet."
      />
    );
  }

  return (
    <Card title="Subscription History">
      <Timeline items={events} />
    </Card>
  );
}
