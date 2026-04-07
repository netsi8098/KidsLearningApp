import { useMemo, useState, useCallback } from 'react';
import { useQuery } from '../../hooks/useQuery';
import { useMutation } from '../../hooks/useMutation';
import { api } from '../../lib/api';
import {
  Button,
  Card,
  Modal,
  Select,
  Input,
  Toggle,
  StatsCard,
  LoadingState,
} from '../../components/ui';

interface Permission {
  id: string;
  role: string;
  resource: string;
  action: string;
  allowed: boolean;
}

const ROLES = ['admin', 'editor', 'reviewer', 'viewer'] as const;

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  editor: 'Editor',
  reviewer: 'Reviewer',
  viewer: 'Viewer',
};

const ROLE_OPTIONS = ROLES.map((r) => ({ value: r, label: ROLE_LABELS[r] ?? r }));

export function PermissionsPage() {
  const [showModal, setShowModal] = useState(false);
  const [newRule, setNewRule] = useState({
    role: 'viewer',
    resource: '',
    action: '',
    allowed: true,
  });

  const { data: permissions, loading, error, refetch } = useQuery<Permission[]>(
    () => api.get('/permissions'),
    [],
  );

  const { mutate: togglePermission } = useMutation<Permission, { id: string; allowed: boolean }>(
    ({ id, allowed }) => api.patch(`/permissions/${id}`, { allowed }),
    { onSuccess: () => refetch() },
  );

  const { mutate: createPermission, loading: creating } = useMutation<Permission, typeof newRule>(
    (body) => api.post('/permissions', body),
    {
      onSuccess: () => {
        refetch();
        setShowModal(false);
        setNewRule({ role: 'viewer', resource: '', action: '', allowed: true });
      },
    },
  );

  const handleToggle = useCallback(
    (perm: Permission) => {
      togglePermission({ id: perm.id, allowed: !perm.allowed });
    },
    [togglePermission],
  );

  // Group permissions by resource
  const grouped = useMemo(() => {
    if (!permissions) return {};
    const map: Record<string, Permission[]> = {};
    for (const perm of permissions) {
      if (!map[perm.resource]) map[perm.resource] = [];
      map[perm.resource]!.push(perm);
    }
    return map;
  }, [permissions]);

  // Role summary counts
  const roleCounts = useMemo(() => {
    if (!permissions) return {};
    const counts: Record<string, number> = {};
    for (const role of ROLES) {
      counts[role] = permissions.filter((p) => p.role === role && p.allowed).length;
    }
    return counts;
  }, [permissions]);

  // Helper: find permission for a given resource, action, role
  const findPerm = useCallback(
    (resource: string, action: string, role: string) =>
      permissions?.find(
        (p) => p.resource === resource && p.action === action && p.role === role,
      ),
    [permissions],
  );

  // Unique actions per resource
  const resourceActions = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const resource of Object.keys(grouped)) {
      const actions = new Set<string>();
      for (const perm of grouped[resource] ?? []) {
        actions.add(perm.action);
      }
      map[resource] = Array.from(actions).sort();
    }
    return map;
  }, [grouped]);

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-danger/10 border border-danger/20 rounded-lg p-4 text-danger text-sm">
          Failed to load permissions: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Permissions</h1>
          <p className="text-text-secondary mt-1">Manage roles and access control.</p>
        </div>
        <Button onClick={() => setShowModal(true)}>Add Rule</Button>
      </div>

      {/* Role Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {ROLES.map((role) => (
          <StatsCard
            key={role}
            title={ROLE_LABELS[role] ?? role}
            value={roleCounts[role] ?? 0}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
          />
        ))}
      </div>

      {/* Permission Matrix */}
      {loading && !permissions ? (
        <LoadingState message="Loading permissions..." />
      ) : (
        <Card title="Role Matrix" padding={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-bg border-b border-border">
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Resource</th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Action</th>
                  {ROLES.map((role) => (
                    <th key={role} className="px-4 py-3 text-center font-medium text-text-secondary">
                      {ROLE_LABELS[role]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {Object.keys(grouped).sort().map((resource) =>
                  (resourceActions[resource] ?? []).map((action, actionIdx) => (
                    <tr key={`${resource}-${action}`} className="hover:bg-bg/50 transition-colors">
                      {actionIdx === 0 ? (
                        <td
                          className="px-4 py-3 font-medium text-text align-top"
                          rowSpan={(resourceActions[resource] ?? []).length}
                        >
                          {resource}
                        </td>
                      ) : null}
                      <td className="px-4 py-3 text-text-secondary">{action}</td>
                      {ROLES.map((role) => {
                        const perm = findPerm(resource, action, role);
                        return (
                          <td key={role} className="px-4 py-3 text-center">
                            {perm ? (
                              <button
                                onClick={() => handleToggle(perm)}
                                className="inline-flex items-center justify-center cursor-pointer"
                                title={perm.allowed ? 'Allowed - click to deny' : 'Denied - click to allow'}
                              >
                                {perm.allowed ? (
                                  <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                ) : (
                                  <svg className="w-5 h-5 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                )}
                              </button>
                            ) : (
                              <span className="text-text-muted">--</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  )),
                )}
                {Object.keys(grouped).length === 0 && (
                  <tr>
                    <td colSpan={2 + ROLES.length} className="px-4 py-12 text-center text-text-muted">
                      No permissions configured yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add Rule Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Permission Rule">
        <div className="space-y-4">
          <Select
            label="Role"
            options={ROLE_OPTIONS}
            value={newRule.role}
            onChange={(e) => setNewRule((prev) => ({ ...prev, role: e.target.value }))}
          />
          <Input
            label="Resource"
            placeholder="e.g. Content, Asset, Collection"
            value={newRule.resource}
            onChange={(e) => setNewRule((prev) => ({ ...prev, resource: e.target.value }))}
          />
          <Input
            label="Action"
            placeholder="e.g. read, write, delete, publish"
            value={newRule.action}
            onChange={(e) => setNewRule((prev) => ({ ...prev, action: e.target.value }))}
          />
          <Toggle
            label="Allowed"
            enabled={newRule.allowed}
            onChange={(enabled) => setNewRule((prev) => ({ ...prev, allowed: enabled }))}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button
              loading={creating}
              disabled={!newRule.resource.trim() || !newRule.action.trim()}
              onClick={() => createPermission(newRule)}
            >
              Create Rule
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
