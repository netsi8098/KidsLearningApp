import { useMemo, useState } from 'react';
import { useQuery } from '../../hooks/useQuery';
import { useMutation } from '../../hooks/useMutation';
import { usePagination } from '../../hooks/usePagination';
import { useToast } from '../../hooks/useToast';
import { api } from '../../lib/api';
import {
  Badge,
  Button,
  ConfirmDialog,
  DataTable,
  Input,
  LoadingState,
  Modal,
  Pagination,
  Select,
} from '../../components/ui';

/* ─── Types ─── */

type TargetType = 'content' | 'collection' | 'profile' | 'page' | 'external';

interface DeepLink {
  id: string;
  shortCode: string;
  targetType: TargetType;
  targetId: string | null;
  targetPath: string | null;
  campaign: string | null;
  clicks: number;
  createdAt: string;
  expiresAt: string | null;
}

interface DeepLinksResponse {
  data: DeepLink[];
  total: number;
  page: number;
  pageSize: number;
}

/* ─── Constants ─── */

const TARGET_TYPE_OPTIONS = [
  { value: 'content', label: 'Content' },
  { value: 'collection', label: 'Collection' },
  { value: 'profile', label: 'Profile' },
  { value: 'page', label: 'Page' },
  { value: 'external', label: 'External' },
];

const TARGET_VARIANTS: Record<TargetType, 'primary' | 'success' | 'warning' | 'info' | 'default'> = {
  content: 'primary',
  collection: 'success',
  profile: 'info',
  page: 'warning',
  external: 'default',
};

/* ─── Component ─── */

export function DeepLinksPage() {
  const toast = useToast();
  const { page, limit, setPage } = usePagination({ initialLimit: 20 });
  const [showModal, setShowModal] = useState(false);
  const [editLink, setEditLink] = useState<DeepLink | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeepLink | null>(null);

  // Form state
  const [formShortCode, setFormShortCode] = useState('');
  const [formTargetType, setFormTargetType] = useState<string>('content');
  const [formTargetId, setFormTargetId] = useState('');
  const [formTargetPath, setFormTargetPath] = useState('');
  const [formCampaign, setFormCampaign] = useState('');
  const [formExpiresAt, setFormExpiresAt] = useState('');

  // Deep links list
  const { data, loading, refetch } = useQuery<DeepLinksResponse>(
    () => api.get('/deep-links', { page, pageSize: limit }),
    [page, limit],
  );

  // Create / Update
  const { mutate: saveLink, loading: saving } = useMutation<
    DeepLink,
    { id?: string; body: Partial<DeepLink> }
  >(
    ({ id, body }) =>
      id ? api.patch(`/deep-links/${id}`, body) : api.post('/deep-links', body),
    {
      onSuccess: () => {
        toast.success(editLink ? 'Deep link updated' : 'Deep link created');
        closeModal();
        refetch();
      },
    },
  );

  // Delete
  const { mutate: deleteLink } = useMutation<void, string>(
    (id) => api.delete(`/deep-links/${id}`),
    {
      onSuccess: () => {
        toast.success('Deep link deleted');
        setDeleteTarget(null);
        refetch();
      },
    },
  );

  const items = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  const openCreate = () => {
    setEditLink(null);
    setFormShortCode('');
    setFormTargetType('content');
    setFormTargetId('');
    setFormTargetPath('');
    setFormCampaign('');
    setFormExpiresAt('');
    setShowModal(true);
  };

  const openEdit = (link: DeepLink) => {
    setEditLink(link);
    setFormShortCode(link.shortCode);
    setFormTargetType(link.targetType);
    setFormTargetId(link.targetId ?? '');
    setFormTargetPath(link.targetPath ?? '');
    setFormCampaign(link.campaign ?? '');
    setFormExpiresAt(link.expiresAt ? link.expiresAt.slice(0, 10) : '');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditLink(null);
  };

  const handleSave = () => {
    const body: Partial<DeepLink> = {
      shortCode: formShortCode.trim(),
      targetType: formTargetType as TargetType,
      targetId: formTargetId.trim() || null,
      targetPath: formTargetPath.trim() || null,
      campaign: formCampaign.trim() || null,
      expiresAt: formExpiresAt || null,
    };
    saveLink({ id: editLink?.id, body });
  };

  const columns = useMemo(
    () => [
      {
        key: 'shortCode',
        header: 'Short Code',
        render: (item: DeepLink) => (
          <span className="font-mono font-medium text-text">{item.shortCode}</span>
        ),
      },
      {
        key: 'targetType',
        header: 'Target Type',
        render: (item: DeepLink) => (
          <Badge variant={TARGET_VARIANTS[item.targetType] ?? 'default'}>
            {item.targetType}
          </Badge>
        ),
      },
      {
        key: 'campaign',
        header: 'Campaign',
        render: (item: DeepLink) => (
          <span className="text-sm text-text-secondary">{item.campaign ?? '--'}</span>
        ),
      },
      {
        key: 'clicks',
        header: 'Clicks',
        render: (item: DeepLink) => (
          <span className="text-sm font-semibold text-primary">{item.clicks}</span>
        ),
      },
      {
        key: 'createdAt',
        header: 'Created',
        render: (item: DeepLink) => (
          <span className="text-sm text-text-secondary">
            {new Date(item.createdAt).toLocaleDateString()}
          </span>
        ),
      },
      {
        key: 'expiresAt',
        header: 'Expires',
        render: (item: DeepLink) => (
          <span className="text-sm text-text-secondary">
            {item.expiresAt ? new Date(item.expiresAt).toLocaleDateString() : 'Never'}
          </span>
        ),
      },
      {
        key: 'actions',
        header: '',
        render: (item: DeepLink) => (
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); openEdit(item); }}
              className="text-xs text-primary hover:text-primary-hover font-medium cursor-pointer"
            >
              Edit
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setDeleteTarget(item); }}
              className="text-xs text-danger hover:text-danger/80 font-medium cursor-pointer"
            >
              Delete
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Deep Links</h1>
          <p className="text-text-secondary mt-1">Manage short links for campaigns and content sharing.</p>
        </div>
        <Button onClick={openCreate}>New Deep Link</Button>
      </div>

      {/* Table */}
      {loading && !data ? (
        <LoadingState message="Loading deep links..." />
      ) : (
        <DataTable
          columns={columns}
          data={items}
          loading={loading}
          emptyMessage="No deep links found."
        />
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-secondary">
            Showing {(page - 1) * limit + 1}--{Math.min(page * limit, total)} of {total}
          </p>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        open={showModal}
        onClose={closeModal}
        title={editLink ? 'Edit Deep Link' : 'New Deep Link'}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Short Code"
            value={formShortCode}
            onChange={(e) => setFormShortCode(e.target.value)}
            placeholder="e.g. summer-promo"
          />
          <Select
            label="Target Type"
            options={TARGET_TYPE_OPTIONS}
            value={formTargetType}
            onChange={(e) => setFormTargetType(e.target.value)}
          />
          <Input
            label="Target ID"
            value={formTargetId}
            onChange={(e) => setFormTargetId(e.target.value)}
            placeholder="Content or collection ID"
          />
          <Input
            label="Target Path"
            value={formTargetPath}
            onChange={(e) => setFormTargetPath(e.target.value)}
            placeholder="/learn/abc-song"
          />
          <Input
            label="Campaign"
            value={formCampaign}
            onChange={(e) => setFormCampaign(e.target.value)}
            placeholder="Campaign name"
          />
          <Input
            label="Expires At"
            type="date"
            value={formExpiresAt}
            onChange={(e) => setFormExpiresAt(e.target.value)}
          />
          <div className="flex items-center gap-3 pt-2">
            <Button
              loading={saving}
              disabled={!formShortCode.trim()}
              onClick={handleSave}
            >
              {editLink ? 'Save Changes' : 'Create'}
            </Button>
            <Button variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Deep Link"
        message={`Are you sure you want to delete the deep link "${deleteTarget?.shortCode}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => {
          if (deleteTarget) deleteLink(deleteTarget.id);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
