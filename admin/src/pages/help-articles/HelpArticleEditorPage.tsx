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
  Drawer,
  Input,
  LoadingState,
  Pagination,
  Select,
  TextArea,
  Toggle,
} from '../../components/ui';

/* ─── Types ─── */

interface HelpArticle {
  id: string;
  title: string;
  slug: string;
  body: string;
  category: string;
  searchKeywords: string[];
  published: boolean;
  helpfulYes: number;
  helpfulNo: number;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

interface ArticlesResponse {
  data: HelpArticle[];
  total: number;
  page: number;
  pageSize: number;
}

/* ─── Constants ─── */

const CATEGORY_OPTIONS = [
  { value: 'getting-started', label: 'Getting Started' },
  { value: 'account', label: 'Account' },
  { value: 'billing', label: 'Billing' },
  { value: 'content', label: 'Content' },
  { value: 'technical', label: 'Technical' },
  { value: 'safety', label: 'Safety' },
];

const CATEGORY_VARIANTS: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger' | 'default'> = {
  'getting-started': 'primary',
  account: 'info',
  billing: 'warning',
  content: 'success',
  technical: 'default',
  safety: 'danger',
};

/* ─── Component ─── */

export function HelpArticleEditorPage() {
  const toast = useToast();
  const { page, limit, setPage } = usePagination({ initialLimit: 20 });
  const [editArticle, setEditArticle] = useState<HelpArticle | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<HelpArticle | null>(null);

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editBody, setEditBody] = useState('');
  const [editCategory, setEditCategory] = useState('getting-started');
  const [editKeywords, setEditKeywords] = useState('');
  const [editPublished, setEditPublished] = useState(false);
  const [isNew, setIsNew] = useState(false);

  // Articles list
  const { data, loading, refetch } = useQuery<ArticlesResponse>(
    () => api.get('/help/articles', { page, pageSize: limit }),
    [page, limit],
  );

  // Save article
  const { mutate: saveArticle, loading: saving } = useMutation<
    HelpArticle,
    { id?: string; body: Partial<HelpArticle> }
  >(
    ({ id, body }) =>
      id
        ? api.patch(`/help/articles/${id}`, body)
        : api.post('/help/articles', body),
    {
      onSuccess: () => {
        toast.success(isNew ? 'Article created' : 'Article updated');
        setEditArticle(null);
        refetch();
      },
    },
  );

  // Delete article
  const { mutate: deleteArticle } = useMutation<void, string>(
    (id) => api.delete(`/help/articles/${id}`),
    {
      onSuccess: () => {
        toast.success('Article deleted');
        setDeleteTarget(null);
        refetch();
      },
    },
  );

  const items = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  const openEditor = (article: HelpArticle | null) => {
    if (article) {
      setIsNew(false);
      setEditTitle(article.title);
      setEditSlug(article.slug);
      setEditBody(article.body);
      setEditCategory(article.category);
      setEditKeywords(article.searchKeywords.join(', '));
      setEditPublished(article.published);
      setEditArticle(article);
    } else {
      setIsNew(true);
      setEditTitle('');
      setEditSlug('');
      setEditBody('');
      setEditCategory('getting-started');
      setEditKeywords('');
      setEditPublished(false);
      setEditArticle({} as HelpArticle);
    }
  };

  const handleSave = () => {
    const body: Partial<HelpArticle> = {
      title: editTitle,
      slug: editSlug,
      body: editBody,
      category: editCategory,
      searchKeywords: editKeywords.split(',').map((k) => k.trim()).filter(Boolean),
      published: editPublished,
    };
    saveArticle({
      id: isNew ? undefined : editArticle?.id,
      body,
    });
  };

  const columns = useMemo(
    () => [
      {
        key: 'title',
        header: 'Title',
        render: (item: HelpArticle) => (
          <span className="font-medium text-text">{item.title}</span>
        ),
      },
      {
        key: 'category',
        header: 'Category',
        render: (item: HelpArticle) => (
          <Badge variant={CATEGORY_VARIANTS[item.category] ?? 'default'}>
            {item.category}
          </Badge>
        ),
      },
      {
        key: 'published',
        header: 'Published',
        render: (item: HelpArticle) => (
          <Badge variant={item.published ? 'success' : 'default'}>
            {item.published ? 'Published' : 'Draft'}
          </Badge>
        ),
      },
      {
        key: 'helpful',
        header: 'Helpful',
        render: (item: HelpArticle) => (
          <span className="text-sm text-text-secondary">
            {item.helpfulYes} / {item.helpfulNo}
          </span>
        ),
      },
      {
        key: 'orderIndex',
        header: 'Order',
        render: (item: HelpArticle) => (
          <span className="text-sm text-text">{item.orderIndex}</span>
        ),
      },
      {
        key: 'actions',
        header: '',
        render: (item: HelpArticle) => (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget(item);
            }}
            className="text-xs text-danger hover:text-danger/80 font-medium cursor-pointer"
          >
            Delete
          </button>
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
          <h1 className="text-2xl font-bold text-text">Help Articles</h1>
          <p className="text-text-secondary mt-1">Manage parent-facing help center content.</p>
        </div>
        <Button onClick={() => openEditor(null)}>New Article</Button>
      </div>

      {/* Table */}
      {loading && !data ? (
        <LoadingState message="Loading articles..." />
      ) : (
        <DataTable
          columns={columns}
          data={items}
          loading={loading}
          emptyMessage="No help articles found."
          onRowClick={(item) => openEditor(item as HelpArticle)}
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

      {/* Edit Drawer */}
      <Drawer
        open={editArticle !== null}
        onClose={() => setEditArticle(null)}
        title={isNew ? 'New Article' : 'Edit Article'}
      >
        <div className="space-y-4">
          <Input
            label="Title"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Article title"
          />
          <Input
            label="Slug"
            value={editSlug}
            onChange={(e) => setEditSlug(e.target.value)}
            placeholder="article-slug"
          />
          <TextArea
            label="Body"
            value={editBody}
            onChange={(e) => setEditBody(e.target.value)}
            rows={10}
            placeholder="Article content (markdown supported)"
          />
          <Select
            label="Category"
            options={CATEGORY_OPTIONS}
            value={editCategory}
            onChange={(e) => setEditCategory(e.target.value)}
          />
          <Input
            label="Search Keywords"
            value={editKeywords}
            onChange={(e) => setEditKeywords(e.target.value)}
            placeholder="keyword1, keyword2, keyword3"
            hint="Comma-separated keywords for search indexing."
          />
          <Toggle
            label="Published"
            enabled={editPublished}
            onChange={setEditPublished}
          />
          <div className="flex items-center gap-3 pt-2">
            <Button loading={saving} disabled={!editTitle.trim()} onClick={handleSave}>
              {isNew ? 'Create' : 'Save Changes'}
            </Button>
            <Button variant="secondary" onClick={() => setEditArticle(null)}>
              Cancel
            </Button>
          </div>
        </div>
      </Drawer>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Article"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => {
          if (deleteTarget) deleteArticle(deleteTarget.id);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
