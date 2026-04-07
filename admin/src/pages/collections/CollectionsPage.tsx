import { useState, useCallback } from 'react';
import { useQuery } from '../../hooks/useQuery';
import { useMutation } from '../../hooks/useMutation';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { SearchInput } from '../../components/ui/SearchInput';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingState } from '../../components/ui/LoadingState';

interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  contentCount: number;
  createdAt: string;
}

export function CollectionsPage() {
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);

  const { data: collections, loading, error, refetch } = useQuery<Collection[]>(
    () => api.get('/content/collections'),
    [],
  );

  const filtered = (collections ?? []).filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Collections</h1>
          <p className="text-text-secondary mt-1">
            Organize content into curated collections.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>New Collection</Button>
      </div>

      {/* Search */}
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search collections..."
      />

      {/* Content */}
      {loading ? (
        <LoadingState message="Loading collections..." />
      ) : error ? (
        <div className="bg-surface border border-border rounded-lg p-8 text-center">
          <p className="text-danger text-sm">
            Failed to load collections: {error.message}
          </p>
          <Button variant="secondary" size="sm" className="mt-3" onClick={refetch}>
            Retry
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No collections found"
          description={
            search
              ? 'Try a different search term.'
              : 'Create your first collection to organize content.'
          }
          action={
            !search
              ? { label: 'New Collection', onClick: () => setCreateOpen(true) }
              : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((collection) => (
            <div
              key={collection.id}
              className="bg-surface border border-border rounded-lg shadow-sm p-5 space-y-3 hover:border-primary hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-base font-semibold text-text">{collection.name}</h3>
                <Badge variant="primary">{collection.contentCount} items</Badge>
              </div>
              {collection.description && (
                <p className="text-sm text-text-secondary line-clamp-2">
                  {collection.description}
                </p>
              )}
              <p className="text-xs text-text-muted">
                Created{' '}
                {new Date(collection.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <CreateCollectionModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          setCreateOpen(false);
          refetch();
        }}
      />
    </div>
  );
}

/* ---------- Create Collection Modal ---------- */

function CreateCollectionModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const createMutation = useMutation<Collection, { name: string; description: string }>(
    (vars) => api.post('/content/collections', vars),
    {
      onSuccess: () => {
        setName('');
        setDescription('');
        onCreated();
      },
    },
  );

  const handleClose = useCallback(() => {
    setName('');
    setDescription('');
    onClose();
  }, [onClose]);

  const handleSubmit = useCallback(() => {
    if (!name.trim()) return;
    createMutation.mutate({ name: name.trim(), description: description.trim() });
  }, [createMutation, name, description]);

  return (
    <Modal open={open} onClose={handleClose} title="New Collection" size="sm">
      <div className="space-y-4">
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Spring 2026 Favorites"
        />
        <Input
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="A short description of this collection..."
        />
        {createMutation.error && (
          <p className="text-sm text-danger">{createMutation.error.message}</p>
        )}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={handleClose} disabled={createMutation.loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name.trim()}
            loading={createMutation.loading}
          >
            Create
          </Button>
        </div>
      </div>
    </Modal>
  );
}
