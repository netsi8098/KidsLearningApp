import { useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '../../hooks/useQuery';
import { useMutation } from '../../hooks/useMutation';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { LoadingState } from '../../components/ui/LoadingState';

interface AssetVariant {
  id: string;
  variantKey: string;
  storageKey: string;
  width: number;
  height: number;
  sizeBytes: number;
}

interface Asset {
  id: string;
  contentId: string | null;
  filename: string;
  mimeType: string;
  storageKey: string;
  altText: string | null;
  width: number | null;
  height: number | null;
  sizeBytes: number;
  createdAt: string;
  variants: AssetVariant[];
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

function isImageType(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

export function AssetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [altText, setAltText] = useState('');
  const [altDirty, setAltDirty] = useState(false);

  const { data: asset, loading, error, refetch } = useQuery<Asset>(
    () => api.get(`/media/${id}`),
    [id],
    {
      onSuccess: (a) => {
        setAltText(a.altText ?? '');
        setAltDirty(false);
      },
    },
  );

  const deleteMutation = useMutation<void, void>(
    () => api.delete(`/media/${id}`),
    { onSuccess: () => navigate('/assets') },
  );

  const updateMutation = useMutation<Asset, { altText: string }>(
    (vars) => api.patch(`/media/${id}`, vars),
    { onSuccess: () => { refetch(); setAltDirty(false); } },
  );

  const handleAltTextChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setAltText(e.target.value);
      setAltDirty(true);
    },
    [],
  );

  const handleSaveAltText = useCallback(() => {
    updateMutation.mutate({ altText });
  }, [updateMutation, altText]);

  if (loading) {
    return <LoadingState message="Loading asset details..." />;
  }

  if (error || !asset) {
    return (
      <div className="space-y-6">
        <Link
          to="/assets"
          className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Assets
        </Link>
        <div className="bg-surface border border-border rounded-lg p-8 text-center">
          <p className="text-danger text-sm">
            {error ? `Failed to load asset: ${error.message}` : 'Asset not found.'}
          </p>
          {error && (
            <Button variant="secondary" size="sm" className="mt-3" onClick={refetch}>
              Retry
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        to="/assets"
        className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Assets
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-text">{asset.filename}</h1>
          <Badge>{asset.mimeType}</Badge>
        </div>
        <Button
          variant="danger"
          onClick={() => setConfirmDelete(true)}
          loading={deleteMutation.loading}
        >
          Delete
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Preview */}
        <div className="lg:col-span-2">
          <Card title="Preview">
            <div className="flex items-center justify-center bg-bg rounded-md min-h-64 overflow-hidden">
              {isImageType(asset.mimeType) ? (
                <img
                  src={`/api/media/${asset.id}/file`}
                  alt={asset.altText ?? asset.filename}
                  className="max-w-full max-h-96 object-contain"
                />
              ) : (
                <div className="flex flex-col items-center gap-3 py-12">
                  <svg
                    className="w-16 h-16 text-text-muted"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    {asset.mimeType.startsWith('audio/') ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 19V6l12-3v13M9 19c0 1.1-1.3 2-3 2s-3-.9-3-2 1.3-2 3-2 3 .9 3 2zm12-3c0 1.1-1.3 2-3 2s-3-.9-3-2 1.3-2 3-2 3 .9 3 2z"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9A2.25 2.25 0 0013.5 5.25h-9A2.25 2.25 0 002.25 7.5v9A2.25 2.25 0 004.5 18.75z"
                      />
                    )}
                  </svg>
                  <p className="text-sm text-text-muted">
                    Preview not available for {asset.mimeType}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Metadata */}
        <div className="space-y-6">
          <Card title="Metadata">
            <dl className="space-y-3">
              <MetadataRow label="Storage Key" value={asset.storageKey} />
              {asset.width && asset.height && (
                <MetadataRow
                  label="Dimensions"
                  value={`${asset.width} x ${asset.height}`}
                />
              )}
              <MetadataRow label="File Size" value={formatSize(asset.sizeBytes)} />
              <MetadataRow
                label="Created"
                value={new Date(asset.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              />
              {asset.contentId && (
                <div>
                  <dt className="text-xs font-medium text-text-muted uppercase tracking-wide">
                    Content
                  </dt>
                  <dd className="mt-0.5">
                    <Link
                      to={`/content/${asset.contentId}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {asset.contentId}
                    </Link>
                  </dd>
                </div>
              )}
            </dl>
          </Card>

          {/* Alt Text Editor */}
          <Card title="Alt Text">
            <div className="space-y-3">
              <Input
                value={altText}
                onChange={handleAltTextChange}
                placeholder="Describe this asset for accessibility..."
              />
              <Button
                size="sm"
                onClick={handleSaveAltText}
                disabled={!altDirty}
                loading={updateMutation.loading}
              >
                Save
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Variants */}
      {asset.variants.length > 0 && (
        <Card title={`Variants (${asset.variants.length})`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {asset.variants.map((variant) => (
              <div
                key={variant.id}
                className="bg-bg rounded-lg border border-border p-4 space-y-2"
              >
                <p className="text-sm font-medium text-text">{variant.variantKey}</p>
                <dl className="space-y-1 text-xs text-text-secondary">
                  <div className="flex justify-between">
                    <span>Dimensions</span>
                    <span className="text-text">
                      {variant.width} x {variant.height}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Size</span>
                    <span className="text-text">{formatSize(variant.sizeBytes)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Key</span>
                    <span className="text-text truncate ml-4" title={variant.storageKey}>
                      {variant.storageKey}
                    </span>
                  </div>
                </dl>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={confirmDelete}
        onConfirm={() => {
          setConfirmDelete(false);
          deleteMutation.mutate();
        }}
        onCancel={() => setConfirmDelete(false)}
        title="Delete Asset"
        message={`Are you sure you want to delete "${asset.filename}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}

/* ---------- Helper component ---------- */

function MetadataRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-text-muted uppercase tracking-wide">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm text-text break-all">{value}</dd>
    </div>
  );
}
