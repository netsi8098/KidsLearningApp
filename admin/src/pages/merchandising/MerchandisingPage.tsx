import { useMemo, useState } from 'react';
import { useQuery } from '../../hooks/useQuery';
import { usePagination } from '../../hooks/usePagination';
import { useFilters } from '../../hooks/useFilters';
import { useMutation } from '../../hooks/useMutation';
import { useToast } from '../../hooks/useToast';
import { api } from '../../lib/api';
import {
  Button,
  FilterBar,
  Select,
  Badge,
  Card,
  Modal,
  Input,
  Pagination,
  LoadingState,
  EmptyState,
} from '../../components/ui';

/* ─── Types ─── */

type AssetStatus = 'draft' | 'review' | 'approved' | 'active' | 'expired';
type AssetType = 'screenshot' | 'banner' | 'hero' | 'campaign';
type Platform = 'ios' | 'android' | 'web' | 'all';

interface MerchandisingAsset {
  id: string;
  title: string;
  type: AssetType;
  campaign: string;
  platform: Platform;
  locale: string;
  status: AssetStatus;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

interface MerchandisingResponse {
  data: MerchandisingAsset[];
  total: number;
  page: number;
  pageSize: number;
}

interface UploadFormData {
  title: string;
  type: AssetType;
  locale: string;
  platform: Platform;
  campaign: string;
}

/* ─── Constants ─── */

const CAMPAIGN_OPTIONS = [
  { value: '', label: 'All Campaigns' },
  { value: 'summer-2026', label: 'Summer 2026' },
  { value: 'back-to-school', label: 'Back to School' },
  { value: 'holiday-2026', label: 'Holiday 2026' },
  { value: 'spring-launch', label: 'Spring Launch' },
  { value: 'general', label: 'General' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'review', label: 'Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'active', label: 'Active' },
  { value: 'expired', label: 'Expired' },
];

const PLATFORM_OPTIONS = [
  { value: '', label: 'All Platforms' },
  { value: 'ios', label: 'iOS' },
  { value: 'android', label: 'Android' },
  { value: 'web', label: 'Web' },
  { value: 'all', label: 'Universal' },
];

const TYPE_OPTIONS = [
  { value: 'screenshot', label: 'Screenshot' },
  { value: 'banner', label: 'Banner' },
  { value: 'hero', label: 'Hero' },
  { value: 'campaign', label: 'Campaign' },
];

const PLATFORM_FORM_OPTIONS = [
  { value: 'ios', label: 'iOS' },
  { value: 'android', label: 'Android' },
  { value: 'web', label: 'Web' },
  { value: 'all', label: 'Universal' },
];

const STATUS_VARIANTS: Record<AssetStatus, 'default' | 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
  draft: 'default',
  review: 'warning',
  approved: 'info',
  active: 'success',
  expired: 'danger',
};

const PLATFORM_LABELS: Record<Platform, string> = {
  ios: 'iOS',
  android: 'Android',
  web: 'Web',
  all: 'Universal',
};

const INITIAL_UPLOAD_FORM: UploadFormData = {
  title: '',
  type: 'screenshot',
  locale: 'en-US',
  platform: 'all',
  campaign: '',
};

/* ─── Component ─── */

export function MerchandisingPage() {
  const toast = useToast();
  const { page, limit, setPage } = usePagination({ initialLimit: 12 });
  const { filters, setFilter, clearFilters } = useFilters({
    campaign: '',
    status: '',
    platform: '',
  });
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState<UploadFormData>(INITIAL_UPLOAD_FORM);

  const queryParams = useMemo(
    () => ({
      page,
      pageSize: limit,
      ...(filters.campaign && { campaign: filters.campaign }),
      ...(filters.status && { status: filters.status }),
      ...(filters.platform && { platform: filters.platform }),
    }),
    [page, limit, filters],
  );

  const { data, loading, error, refetch } = useQuery<MerchandisingResponse>(
    () => api.get('/merchandising', queryParams),
    [JSON.stringify(queryParams)],
  );

  const { mutate: createAsset, loading: creating } = useMutation<MerchandisingAsset, UploadFormData>(
    (vars) => api.post('/merchandising', vars),
    {
      onSuccess: () => {
        toast.success('Asset created successfully.');
        setShowUploadModal(false);
        setUploadForm(INITIAL_UPLOAD_FORM);
        refetch();
      },
      onError: (err) => toast.error(err.message),
    },
  );

  const { mutate: approveAsset } = useMutation<void, { id: string }>(
    (vars) => api.post(`/merchandising/${vars.id}/approve`),
    {
      onSuccess: () => {
        toast.success('Asset approved.');
        refetch();
      },
      onError: (err) => toast.error(err.message),
    },
  );

  const items = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-danger/10 border border-danger/20 rounded-lg p-4 text-danger text-sm">
          Failed to load merchandising assets: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Merchandising</h1>
          <p className="text-text-secondary mt-1">
            Manage app store assets, banners, and campaign creatives.
          </p>
        </div>
        <Button onClick={() => setShowUploadModal(true)}>Upload Asset</Button>
      </div>

      {/* Filters */}
      <FilterBar onReset={() => { clearFilters(); setPage(1); }}>
        <Select
          options={CAMPAIGN_OPTIONS}
          value={filters.campaign}
          onChange={(e) => { setFilter('campaign', e.target.value); setPage(1); }}
          className="w-44"
        />
        <Select
          options={STATUS_OPTIONS}
          value={filters.status}
          onChange={(e) => { setFilter('status', e.target.value); setPage(1); }}
          className="w-36"
        />
        <Select
          options={PLATFORM_OPTIONS}
          value={filters.platform}
          onChange={(e) => { setFilter('platform', e.target.value); setPage(1); }}
          className="w-36"
        />
      </FilterBar>

      {/* Asset Grid */}
      {loading && !data ? (
        <LoadingState message="Loading assets..." />
      ) : items.length === 0 ? (
        <EmptyState
          title="No assets found"
          description="Try adjusting your filters or upload a new asset."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              onApprove={() => approveAsset({ id: asset.id })}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-secondary">
            Showing {(page - 1) * limit + 1}--{Math.min(page * limit, total)} of {total}
          </p>
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Upload Modal */}
      <Modal open={showUploadModal} onClose={() => setShowUploadModal(false)} title="Upload Asset" size="lg">
        <div className="space-y-4">
          <Input
            label="Title"
            value={uploadForm.title}
            onChange={(e) => setUploadForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Summer Banner - Hero Image"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Type"
              options={TYPE_OPTIONS}
              value={uploadForm.type}
              onChange={(e) => setUploadForm((f) => ({ ...f, type: e.target.value as AssetType }))}
            />
            <Select
              label="Platform"
              options={PLATFORM_FORM_OPTIONS}
              value={uploadForm.platform}
              onChange={(e) => setUploadForm((f) => ({ ...f, platform: e.target.value as Platform }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Locale"
              value={uploadForm.locale}
              onChange={(e) => setUploadForm((f) => ({ ...f, locale: e.target.value }))}
              placeholder="en-US"
            />
            <Select
              label="Campaign"
              options={CAMPAIGN_OPTIONS.filter((o) => o.value !== '')}
              value={uploadForm.campaign}
              onChange={(e) => setUploadForm((f) => ({ ...f, campaign: e.target.value }))}
            />
          </div>

          {/* File upload placeholder */}
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Asset File</label>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-bg">
              <div className="text-text-muted">
                <svg className="mx-auto h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <p className="text-sm">Drag and drop or click to upload</p>
                <p className="text-xs text-text-muted mt-1">PNG, JPG, or WebP up to 5MB</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowUploadModal(false)}>
              Cancel
            </Button>
            <Button
              loading={creating}
              disabled={!uploadForm.title.trim() || !uploadForm.campaign}
              onClick={() => createAsset(uploadForm)}
            >
              Upload Asset
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ─── Sub-component: Asset Card ─── */

function AssetCard({
  asset,
  onApprove,
}: {
  asset: MerchandisingAsset;
  onApprove: () => void;
}) {
  return (
    <Card>
      <div className="space-y-3">
        {/* Image placeholder */}
        <div className="w-full aspect-video bg-bg rounded-lg flex items-center justify-center overflow-hidden">
          {asset.imageUrl ? (
            <img
              src={asset.imageUrl}
              alt={asset.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center text-text-muted">
              <svg className="mx-auto h-8 w-8 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 002.25-2.25V5.25a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 003.75 21z" />
              </svg>
              <p className="text-xs">{asset.type}</p>
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-sm font-medium text-text truncate">{asset.title}</p>
          <p className="text-xs text-text-secondary mt-0.5">{asset.campaign}</p>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={STATUS_VARIANTS[asset.status]}>{asset.status}</Badge>
          <Badge variant="default">{PLATFORM_LABELS[asset.platform]}</Badge>
          <span className="text-xs text-text-muted">{asset.locale}</span>
        </div>

        {/* Actions */}
        {asset.status === 'review' && (
          <div className="pt-2 border-t border-border">
            <Button size="sm" onClick={onApprove} className="w-full">
              Approve
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
