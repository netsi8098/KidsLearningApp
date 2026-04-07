import { useMemo, useState } from 'react';
import { useQuery } from '../../hooks/useQuery';
import { useMutation } from '../../hooks/useMutation';
import { useToast } from '../../hooks/useToast';
import { api } from '../../lib/api';
import {
  Button,
  SearchInput,
  DataTable,
  Toggle,
  Drawer,
  Input,
  TextArea,
  Checkbox,
  Badge,
  LoadingState,
  ConfirmDialog,
} from '../../components/ui';

/* ─── Types ─── */

interface TargetingRules {
  environments: string[];
  locales: string[];
  premiumOnly: boolean;
}

interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  defaultValue: boolean;
  targeting: TargetingRules;
  updatedAt: string;
}

interface FeatureFlagsResponse {
  data: FeatureFlag[];
}

interface FlagFormData {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  defaultValue: boolean;
  environments: string;
  locales: string;
  premiumOnly: boolean;
}

/* ─── Constants ─── */

const INITIAL_FLAG_FORM: FlagFormData = {
  key: '',
  name: '',
  description: '',
  enabled: false,
  defaultValue: false,
  environments: '',
  locales: '',
  premiumOnly: false,
};

/* ─── Component ─── */

export function FeatureFlagsPage() {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null);
  const [flagForm, setFlagForm] = useState<FlagFormData>(INITIAL_FLAG_FORM);
  const [killTarget, setKillTarget] = useState<FeatureFlag | null>(null);

  const { data, loading, error, refetch } = useQuery<FeatureFlagsResponse>(
    () => api.get('/feature-flags'),
    [],
  );

  const { mutate: toggleFlag } = useMutation<void, { key: string; enabled: boolean }>(
    (vars) => api.patch(`/feature-flags/${vars.key}`, { enabled: vars.enabled }),
    {
      onSuccess: () => {
        toast.success('Flag toggled successfully.');
        refetch();
      },
      onError: (err) => toast.error(err.message),
    },
  );

  const { mutate: createFlag, loading: creatingFlag } = useMutation<FeatureFlag, FlagFormData>(
    (vars) =>
      api.post('/feature-flags', {
        key: vars.key,
        name: vars.name,
        description: vars.description,
        enabled: vars.enabled,
        defaultValue: vars.defaultValue,
        targeting: {
          environments: vars.environments ? vars.environments.split(',').map((s) => s.trim()) : [],
          locales: vars.locales ? vars.locales.split(',').map((s) => s.trim()) : [],
          premiumOnly: vars.premiumOnly,
        },
      }),
    {
      onSuccess: () => {
        toast.success('Feature flag created successfully.');
        closeDrawer();
        refetch();
      },
      onError: (err) => toast.error(err.message),
    },
  );

  const { mutate: updateFlag, loading: updatingFlag } = useMutation<FeatureFlag, FlagFormData>(
    (vars) =>
      api.patch(`/feature-flags/${editingFlag?.key}`, {
        name: vars.name,
        description: vars.description,
        enabled: vars.enabled,
        defaultValue: vars.defaultValue,
        targeting: {
          environments: vars.environments ? vars.environments.split(',').map((s) => s.trim()) : [],
          locales: vars.locales ? vars.locales.split(',').map((s) => s.trim()) : [],
          premiumOnly: vars.premiumOnly,
        },
      }),
    {
      onSuccess: () => {
        toast.success('Feature flag updated successfully.');
        closeDrawer();
        refetch();
      },
      onError: (err) => toast.error(err.message),
    },
  );

  const { mutate: killSwitch, loading: killing } = useMutation<void, { key: string }>(
    (vars) => api.post(`/feature-flags/${vars.key}/kill`),
    {
      onSuccess: () => {
        toast.success('Kill switch activated. Flag disabled for all targets.');
        setKillTarget(null);
        refetch();
      },
      onError: (err) => toast.error(err.message),
    },
  );

  const flags = data?.data ?? [];

  const filteredFlags = useMemo(() => {
    if (!search) return flags;
    const q = search.toLowerCase();
    return flags.filter(
      (f) =>
        f.key.toLowerCase().includes(q) ||
        f.name.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q),
    );
  }, [flags, search]);

  function openCreateDrawer() {
    setEditingFlag(null);
    setFlagForm(INITIAL_FLAG_FORM);
    setDrawerOpen(true);
  }

  function openEditDrawer(flag: FeatureFlag) {
    setEditingFlag(flag);
    setFlagForm({
      key: flag.key,
      name: flag.name,
      description: flag.description,
      enabled: flag.enabled,
      defaultValue: flag.defaultValue,
      environments: flag.targeting.environments.join(', '),
      locales: flag.targeting.locales.join(', '),
      premiumOnly: flag.targeting.premiumOnly,
    });
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setEditingFlag(null);
    setFlagForm(INITIAL_FLAG_FORM);
  }

  function handleSubmit() {
    if (editingFlag) {
      updateFlag(flagForm);
    } else {
      createFlag(flagForm);
    }
  }

  function getTargetingSummary(flag: FeatureFlag): string {
    const parts: string[] = [];
    if (flag.targeting.environments.length > 0) {
      parts.push(`env: ${flag.targeting.environments.join(', ')}`);
    }
    if (flag.targeting.locales.length > 0) {
      parts.push(`locale: ${flag.targeting.locales.join(', ')}`);
    }
    if (flag.targeting.premiumOnly) {
      parts.push('premium only');
    }
    return parts.length > 0 ? parts.join(' | ') : 'All users';
  }

  const columns = useMemo(
    () => [
      {
        key: 'key',
        header: 'Key',
        render: (item: FeatureFlag) => (
          <span className="font-mono text-sm font-medium text-text">{item.key}</span>
        ),
      },
      {
        key: 'name',
        header: 'Name',
        render: (item: FeatureFlag) => (
          <span className="text-sm text-text">{item.name}</span>
        ),
      },
      {
        key: 'enabled',
        header: 'Enabled',
        render: (item: FeatureFlag) => (
          <Toggle
            enabled={item.enabled}
            onChange={(enabled) => toggleFlag({ key: item.key, enabled })}
          />
        ),
      },
      {
        key: 'targeting',
        header: 'Targeting',
        render: (item: FeatureFlag) => (
          <span className="text-xs text-text-secondary">{getTargetingSummary(item)}</span>
        ),
      },
      {
        key: 'updatedAt',
        header: 'Updated',
        render: (item: FeatureFlag) => (
          <span className="text-sm text-text-secondary">
            {new Date(item.updatedAt).toLocaleDateString()}
          </span>
        ),
      },
      {
        key: 'actions',
        header: '',
        render: (item: FeatureFlag) => (
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                openEditDrawer(item);
              }}
              className="text-sm text-primary hover:text-primary-hover font-medium"
            >
              Edit
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setKillTarget(item);
              }}
              className="text-sm text-danger hover:opacity-80 font-medium"
            >
              Kill
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-danger/10 border border-danger/20 rounded-lg p-4 text-danger text-sm">
          Failed to load feature flags: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Feature Flags</h1>
          <p className="text-text-secondary mt-1">
            Manage feature flags, targeting rules, and kill switches.
          </p>
        </div>
        <Button onClick={openCreateDrawer}>New Flag</Button>
      </div>

      {/* Search */}
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search by key, name, or description..."
        className="max-w-md"
      />

      {/* Flags summary */}
      <div className="flex items-center gap-4 text-sm text-text-secondary">
        <span>{filteredFlags.length} flag{filteredFlags.length !== 1 ? 's' : ''}</span>
        <span>{filteredFlags.filter((f) => f.enabled).length} enabled</span>
        <span>{filteredFlags.filter((f) => !f.enabled).length} disabled</span>
      </div>

      {/* Data Table */}
      {loading && !data ? (
        <LoadingState message="Loading feature flags..." />
      ) : (
        <DataTable
          columns={columns}
          data={filteredFlags}
          loading={loading}
          emptyMessage="No feature flags found."
        />
      )}

      {/* Create/Edit Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={closeDrawer}
        title={editingFlag ? `Edit: ${editingFlag.key}` : 'New Feature Flag'}
      >
        <div className="space-y-4">
          <Input
            label="Key"
            value={flagForm.key}
            onChange={(e) => setFlagForm((f) => ({ ...f, key: e.target.value }))}
            placeholder="enable_new_onboarding"
            disabled={!!editingFlag}
            hint={editingFlag ? 'Key cannot be changed after creation.' : 'Use snake_case. Must be unique.'}
          />

          <Input
            label="Name"
            value={flagForm.name}
            onChange={(e) => setFlagForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="New Onboarding Flow"
          />

          <TextArea
            label="Description"
            value={flagForm.description}
            onChange={(e) => setFlagForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Describe what this flag controls..."
            rows={3}
          />

          <div className="space-y-3 pt-2">
            <Toggle
              label="Enabled"
              enabled={flagForm.enabled}
              onChange={(enabled) => setFlagForm((f) => ({ ...f, enabled }))}
            />
            <Toggle
              label="Default Value (when no targeting matches)"
              enabled={flagForm.defaultValue}
              onChange={(defaultValue) => setFlagForm((f) => ({ ...f, defaultValue }))}
            />
          </div>

          <div className="pt-2 border-t border-border">
            <h3 className="text-sm font-semibold text-text mb-3">Targeting Rules</h3>

            <div className="space-y-4">
              <Input
                label="Environments"
                value={flagForm.environments}
                onChange={(e) => setFlagForm((f) => ({ ...f, environments: e.target.value }))}
                placeholder="production, staging, development"
                hint="Comma-separated. Leave empty for all environments."
              />

              <Input
                label="Locales"
                value={flagForm.locales}
                onChange={(e) => setFlagForm((f) => ({ ...f, locales: e.target.value }))}
                placeholder="en-US, en-GB, es"
                hint="Comma-separated. Leave empty for all locales."
              />

              <Checkbox
                label="Premium Only"
                checked={flagForm.premiumOnly}
                onChange={(checked) => setFlagForm((f) => ({ ...f, premiumOnly: checked }))}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="secondary" onClick={closeDrawer}>
              Cancel
            </Button>
            <Button
              loading={creatingFlag || updatingFlag}
              disabled={!flagForm.key.trim() || !flagForm.name.trim()}
              onClick={handleSubmit}
            >
              {editingFlag ? 'Update Flag' : 'Create Flag'}
            </Button>
          </div>
        </div>
      </Drawer>

      {/* Kill Switch Confirm */}
      <ConfirmDialog
        open={!!killTarget}
        onConfirm={() => killTarget && killSwitch({ key: killTarget.key })}
        onCancel={() => setKillTarget(null)}
        title="Activate Kill Switch"
        message={`This will immediately disable "${killTarget?.name ?? ''}" for all users and environments. This action takes effect instantly and cannot be automatically reverted.`}
        confirmLabel="Kill Switch"
        variant="danger"
      />
    </div>
  );
}
