import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '../../hooks/useQuery';
import { useMutation } from '../../hooks/useMutation';
import { api } from '../../lib/api';
import {
  Badge,
  Button,
  Card,
  Input,
  Tabs,
  Timeline,
  Modal,
  LoadingState,
  EmptyState,
} from '../../components/ui';

/* ─── Types ─── */

interface Parent {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Child {
  id: string;
  name: string;
  ageGroup: string;
  avatarEmoji: string;
  totalStars: number;
  streakDays: number;
}

interface HouseholdSettings {
  profilePreferences: Record<string, string>;
  parentalSettings: Record<string, string>;
}

interface HouseholdDetail {
  id: string;
  name: string;
  plan: string;
  timezone: string;
  locale: string;
  parents: Parent[];
  children: Child[];
  settings: HouseholdSettings;
  createdAt: string;
}

/* ─── Fallback activity data ─── */

const MOCK_ACTIVITY = [
  { id: '1', title: 'Child profile updated', description: 'Changed avatar for Luna', timestamp: '2 hours ago', user: 'parent@example.com', type: 'update' as const },
  { id: '2', title: 'New session started', description: 'Luna started "ABC Song Adventure"', timestamp: '3 hours ago', type: 'create' as const },
  { id: '3', title: 'Settings changed', description: 'Bedtime mode enabled', timestamp: '1 day ago', user: 'parent@example.com', type: 'update' as const },
  { id: '4', title: 'Achievement unlocked', description: 'Luna earned "Star Collector" badge', timestamp: '2 days ago', type: 'publish' as const },
  { id: '5', title: 'Account created', description: 'Household registered via web', timestamp: '1 week ago', type: 'create' as const },
];

/* ─── Constants ─── */

const TABS = [
  { key: 'members', label: 'Members' },
  { key: 'settings', label: 'Settings' },
  { key: 'activity', label: 'Activity' },
];

const PLAN_VARIANTS: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'info'> = {
  free: 'default',
  basic: 'info',
  premium: 'success',
  trial: 'warning',
};

/* ─── Component ─── */

export function HouseholdDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('members');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  const { data: household, loading, error } = useQuery<HouseholdDetail>(
    () => api.get(`/households/${id}`),
    [id],
    { enabled: !!id },
  );

  const { mutate: resetPassword, loading: resettingPassword } = useMutation<void, { parentId: string }>(
    (vars) => api.post(`/households/${id}/reset-password`, { parentId: vars.parentId }),
  );

  const { mutate: sendInvite, loading: sendingInvite } = useMutation<void, { email: string }>(
    (vars) => api.post(`/households/${id}/invite`, { email: vars.email }),
    {
      onSuccess: () => {
        setShowInviteModal(false);
        setInviteEmail('');
      },
    },
  );

  if (loading) return <LoadingState message="Loading household..." />;

  if (error) {
    return (
      <div className="space-y-4">
        <Link to="/households" className="text-sm text-primary hover:text-primary-hover font-medium">
          &larr; Back to Households
        </Link>
        <div className="bg-danger/10 border border-danger/20 rounded-lg p-4 text-danger text-sm">
          Failed to load household: {error.message}
        </div>
      </div>
    );
  }

  if (!household) {
    return (
      <EmptyState
        title="Household not found"
        description="The requested household could not be found."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        to="/households"
        className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary-hover font-medium"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Households
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-text">{household.name}</h1>
            <Badge variant={PLAN_VARIANTS[household.plan] ?? 'default'}>
              {household.plan}
            </Badge>
          </div>
          <div className="flex items-center gap-4 mt-2 text-sm text-text-secondary">
            <span>Timezone: {household.timezone}</span>
            <span>Locale: {household.locale}</span>
          </div>
        </div>
        <Button variant="secondary" onClick={() => setShowInviteModal(true)}>
          Send Invite
        </Button>
      </div>

      {/* Tabs */}
      <Tabs tabs={TABS} activeKey={activeTab} onChange={setActiveTab} />

      {/* Tab content */}
      <div className="mt-4">
        {activeTab === 'members' && (
          <MembersTab
            parents={household.parents}
            children={household.children}
            onResetPassword={(parentId) => resetPassword({ parentId })}
            resettingPassword={resettingPassword}
          />
        )}
        {activeTab === 'settings' && (
          <SettingsTab settings={household.settings} />
        )}
        {activeTab === 'activity' && (
          <ActivityTab />
        )}
      </div>

      {/* Invite Modal */}
      <Modal open={showInviteModal} onClose={() => setShowInviteModal(false)} title="Send Invite">
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Enter the email address of the person you want to invite to this household.
          </p>
          <Input
            label="Email address"
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="parent@example.com"
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowInviteModal(false)}>
              Cancel
            </Button>
            <Button
              loading={sendingInvite}
              disabled={!inviteEmail.trim()}
              onClick={() => sendInvite({ email: inviteEmail.trim() })}
            >
              Send Invite
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ─── Sub-components ─── */

function MembersTab({
  parents,
  children,
  onResetPassword,
  resettingPassword,
}: {
  parents: Parent[];
  children: Child[];
  onResetPassword: (parentId: string) => void;
  resettingPassword: boolean;
}) {
  return (
    <div className="space-y-6">
      {/* Parents */}
      <div>
        <h3 className="text-sm font-semibold text-text mb-3">Parents</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {parents.map((parent) => (
            <Card key={parent.id}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-text">{parent.name}</p>
                  <p className="text-sm text-text-secondary mt-0.5">{parent.email}</p>
                  <Badge variant="info" className="mt-2">{parent.role}</Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  loading={resettingPassword}
                  onClick={() => onResetPassword(parent.id)}
                >
                  Reset Password
                </Button>
              </div>
            </Card>
          ))}
          {parents.length === 0 && (
            <p className="text-sm text-text-muted col-span-2">No parents found.</p>
          )}
        </div>
      </div>

      {/* Children */}
      <div>
        <h3 className="text-sm font-semibold text-text mb-3">Children</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {children.map((child) => (
            <Card key={child.id}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{child.avatarEmoji}</span>
                <div>
                  <p className="font-medium text-text">{child.name}</p>
                  <p className="text-sm text-text-secondary">{child.ageGroup} years</p>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border text-sm">
                <div className="flex items-center gap-1.5">
                  <span className="text-warning">&#9733;</span>
                  <span className="text-text">{child.totalStars} stars</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-success">&#9889;</span>
                  <span className="text-text">{child.streakDays} day streak</span>
                </div>
              </div>
            </Card>
          ))}
          {children.length === 0 && (
            <p className="text-sm text-text-muted col-span-3">No children found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function SettingsTab({ settings }: { settings: HouseholdSettings }) {
  const profileEntries = Object.entries(settings.profilePreferences ?? {});
  const parentalEntries = Object.entries(settings.parentalSettings ?? {});

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card title="Profile Preferences">
        {profileEntries.length > 0 ? (
          <dl className="space-y-3 text-sm">
            {profileEntries.map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <dt className="text-text-secondary">{key}</dt>
                <dd className="font-medium text-text text-right">{String(value)}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="text-sm text-text-muted">No profile preferences configured.</p>
        )}
      </Card>

      <Card title="Parental Settings">
        {parentalEntries.length > 0 ? (
          <dl className="space-y-3 text-sm">
            {parentalEntries.map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <dt className="text-text-secondary">{key}</dt>
                <dd className="font-medium text-text text-right">{String(value)}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="text-sm text-text-muted">No parental settings configured.</p>
        )}
      </Card>
    </div>
  );
}

function ActivityTab() {
  return (
    <Card title="Recent Activity">
      <Timeline items={MOCK_ACTIVITY} />
    </Card>
  );
}
