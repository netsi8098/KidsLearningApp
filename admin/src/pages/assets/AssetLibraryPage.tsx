import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '../../hooks/useQuery';
import { usePagination } from '../../hooks/usePagination';
import { useFilters } from '../../hooks/useFilters';
import { useDebounce } from '../../hooks/useDebounce';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { SearchInput } from '../../components/ui/SearchInput';
import { Select } from '../../components/ui/Select';
import { FilterBar } from '../../components/ui/FilterBar';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Pagination } from '../../components/ui/Pagination';
import { EmptyState } from '../../components/ui/EmptyState';
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

interface AssetListResponse {
  data: Asset[];
  total: number;
  page: number;
  pageSize: number;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

function isImageType(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

const mimeTypeOptions = [
  { value: '', label: 'All types' },
  { value: 'image/png', label: 'PNG' },
  { value: 'image/svg+xml', label: 'SVG' },
  { value: 'image/jpeg', label: 'JPEG' },
  { value: 'audio/mpeg', label: 'MP3' },
  { value: 'video/mp4', label: 'MP4' },
];

export function AssetLibraryPage() {
  const navigate = useNavigate();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const { page, limit, setPage } = usePagination({ initialLimit: 24 });
  const { filters, setFilter, clearFilters } = useFilters({ mimeType: '' });

  const { data, loading, error, refetch } = useQuery<AssetListResponse>(
    () =>
      api.get('/media', {
        page,
        pageSize: limit,
        ...(filters.mimeType ? { mimeType: filters.mimeType } : {}),
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
      }),
    [page, limit, filters.mimeType, debouncedSearch],
  );

  const assets = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Asset Library</h1>
          <p className="text-text-secondary mt-1">
            Upload and manage images, audio, and media files.
          </p>
        </div>
        <Button onClick={() => setUploadOpen(true)}>Upload</Button>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search assets by filename..."
        />
        <FilterBar onReset={() => { clearFilters(); setSearch(''); }}>
          <Select
            options={mimeTypeOptions}
            value={filters.mimeType}
            onChange={(e) => { setFilter('mimeType', e.target.value); setPage(1); }}
            placeholder="Filter by type"
          />
        </FilterBar>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingState message="Loading assets..." />
      ) : error ? (
        <div className="bg-surface border border-border rounded-lg p-8 text-center">
          <p className="text-danger text-sm">Failed to load assets: {error.message}</p>
          <Button variant="secondary" size="sm" className="mt-3" onClick={refetch}>
            Retry
          </Button>
        </div>
      ) : assets.length === 0 ? (
        <EmptyState
          title="No assets found"
          description={
            debouncedSearch || filters.mimeType
              ? 'Try adjusting your search or filters.'
              : 'Upload your first asset to get started.'
          }
          action={
            !debouncedSearch && !filters.mimeType
              ? { label: 'Upload Asset', onClick: () => setUploadOpen(true) }
              : undefined
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {assets.map((asset) => (
              <button
                key={asset.id}
                type="button"
                onClick={() => navigate(`/assets/${asset.id}`)}
                className="bg-surface border border-border rounded-lg shadow-sm overflow-hidden text-left hover:border-primary hover:shadow-md transition-all cursor-pointer group"
              >
                {/* Thumbnail */}
                <div className="aspect-square bg-bg flex items-center justify-center overflow-hidden">
                  {isImageType(asset.mimeType) ? (
                    <img
                      src={`/api/media/${asset.id}/file`}
                      alt={asset.altText ?? asset.filename}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      loading="lazy"
                    />
                  ) : (
                    <svg
                      className="w-10 h-10 text-text-muted"
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
                  )}
                </div>
                {/* Info */}
                <div className="p-3 space-y-1.5">
                  <p className="text-sm font-medium text-text truncate" title={asset.filename}>
                    {asset.filename}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge>{asset.mimeType.split('/')[1]?.toUpperCase() ?? asset.mimeType}</Badge>
                  </div>
                  <p className="text-xs text-text-muted">{formatSize(asset.sizeBytes)}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center pt-2">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </>
      )}

      {/* Upload Modal */}
      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploaded={() => {
          setUploadOpen(false);
          refetch();
        }}
      />
    </div>
  );
}

/* ---------- Upload Modal ---------- */

function UploadModal({
  open,
  onClose,
  onUploaded,
}: {
  open: boolean;
  onClose: () => void;
  onUploaded: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setFile(null);
    setPreview(null);
    setUploading(false);
    setDragOver(false);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const handleFile = useCallback((f: File) => {
    setFile(f);
    if (f.type.startsWith('image/')) {
      const url = URL.createObjectURL(f);
      setPreview(url);
    } else {
      setPreview(null);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) handleFile(dropped);
    },
    [handleFile],
  );

  const handleUpload = useCallback(async () => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const token = localStorage.getItem('admin_token');
      await fetch('/api/media/upload', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      onUploaded();
      reset();
    } catch {
      setUploading(false);
    }
  }, [file, onUploaded, reset]);

  return (
    <Modal open={open} onClose={handleClose} title="Upload Asset" size="md">
      <div className="space-y-4">
        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${dragOver ? 'border-primary bg-primary-light/10' : 'border-border hover:border-primary/50'}`}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept="image/*,audio/*,video/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
          <svg
            className="mx-auto h-10 w-10 text-text-muted mb-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
          <p className="text-sm text-text-secondary">
            Drag and drop a file here, or click to browse
          </p>
          <p className="text-xs text-text-muted mt-1">PNG, JPG, SVG, MP3, MP4</p>
        </div>

        {/* Preview */}
        {file && (
          <div className="bg-bg rounded-lg p-4 flex items-center gap-4">
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="w-16 h-16 object-cover rounded-md"
              />
            ) : (
              <div className="w-16 h-16 bg-surface border border-border rounded-md flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-text-muted"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  />
                </svg>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text truncate">{file.name}</p>
              <p className="text-xs text-text-muted">
                {file.type || 'Unknown type'} &middot; {formatSize(file.size)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => { setFile(null); setPreview(null); }}
              className="text-text-muted hover:text-text p-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={handleClose} disabled={uploading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!file} loading={uploading}>
            Upload
          </Button>
        </div>
      </div>
    </Modal>
  );
}
