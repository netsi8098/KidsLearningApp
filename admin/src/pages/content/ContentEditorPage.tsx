import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '../../hooks/useQuery';
import { useMutation } from '../../hooks/useMutation';
import { useToast } from '../../hooks/useToast';
import { api } from '../../lib/api';
import {
  Button,
  Card,
  Input,
  Select,
  TextArea,
  Toggle,
  Toast,
  LoadingState,
} from '../../components/ui';

interface ContentPayload {
  title: string;
  slug: string;
  type: string;
  status: string;
  ageGroup: string;
  difficulty: string;
  body: string;
  language: string;
  featured: boolean;
  bedtimeFriendly: boolean;
  mood: string;
}

interface ContentDetail extends ContentPayload {
  id: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  skills: string[];
  assets: unknown[];
}

const EMPTY_FORM: ContentPayload = {
  title: '',
  slug: '',
  type: 'story',
  status: 'draft',
  ageGroup: '3-4',
  difficulty: 'easy',
  body: '',
  language: 'en',
  featured: false,
  bedtimeFriendly: false,
  mood: '',
};

const TYPE_OPTIONS = [
  { value: 'story', label: 'Story' },
  { value: 'quiz', label: 'Quiz' },
  { value: 'alphabet', label: 'Alphabet' },
  { value: 'number', label: 'Number' },
  { value: 'matching', label: 'Matching' },
  { value: 'coloring', label: 'Coloring' },
  { value: 'tracing', label: 'Tracing' },
  { value: 'song', label: 'Song' },
  { value: 'video', label: 'Video' },
  { value: 'game', label: 'Game' },
];

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'in_review', label: 'In Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
];

const AGE_GROUP_OPTIONS = [
  { value: '2-3', label: '2-3 years' },
  { value: '3-4', label: '3-4 years' },
  { value: '4-5', label: '4-5 years' },
  { value: '5-6', label: '5-6 years' },
];

const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'am', label: 'Amharic' },
  { value: 'ti', label: 'Tigrinya' },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-');
}

export function ContentEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;
  const { toasts, success, error: showError, removeToast } = useToast();

  const [form, setForm] = useState<ContentPayload>(EMPTY_FORM);
  const [slugTouched, setSlugTouched] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Partial<Record<keyof ContentPayload, string>>>({});

  // Load existing content when editing
  const { loading: loadingContent } = useQuery<ContentDetail>(
    () => api.get(`/content/${id}`),
    [id],
    {
      enabled: isEditing,
      onSuccess: (data) => {
        setForm({
          title: data.title,
          slug: data.slug,
          type: data.type,
          status: data.status,
          ageGroup: data.ageGroup,
          difficulty: data.difficulty,
          body: data.body ?? '',
          language: data.language ?? 'en',
          featured: data.featured,
          bedtimeFriendly: data.bedtimeFriendly,
          mood: data.mood ?? '',
        });
        setSlugTouched(true); // Don't auto-generate slug for existing content
      },
      onError: () => showError('Failed to load content for editing.'),
    },
  );

  // Create mutation
  const { mutate: createContent, loading: creating } = useMutation<ContentDetail, ContentPayload>(
    (payload) => api.post('/content', payload),
    {
      onSuccess: (data) => {
        success('Content created successfully.');
        navigate(`/content/${data.id}`);
      },
      onError: () => showError('Failed to create content. Please try again.'),
    },
  );

  // Update mutation
  const { mutate: updateContent, loading: updating } = useMutation<ContentDetail, ContentPayload>(
    (payload) => api.patch(`/content/${id}`, payload),
    {
      onSuccess: () => {
        success('Content updated successfully.');
        navigate(`/content/${id}`);
      },
      onError: () => showError('Failed to update content. Please try again.'),
    },
  );

  const saving = creating || updating;

  // Auto-generate slug from title (only on create, and only if user hasn't manually edited slug)
  useEffect(() => {
    if (!isEditing && !slugTouched && form.title) {
      setForm((prev) => ({ ...prev, slug: slugify(prev.title) }));
    }
  }, [form.title, isEditing, slugTouched]);

  const setField = useCallback(<K extends keyof ContentPayload>(key: K, value: ContentPayload[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setValidationErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const validate = (): boolean => {
    const errors: Partial<Record<keyof ContentPayload, string>> = {};
    if (!form.title.trim()) errors.title = 'Title is required.';
    if (!form.slug.trim()) errors.slug = 'Slug is required.';
    if (!form.type) errors.type = 'Type is required.';
    if (!form.ageGroup) errors.ageGroup = 'Age group is required.';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    if (isEditing) {
      updateContent(form);
    } else {
      createContent(form);
    }
  };

  if (isEditing && loadingContent) {
    return <LoadingState message="Loading content..." />;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Toast notifications */}
      {toasts.map((t) => (
        <Toast key={t.id} type={t.type} message={t.message} onDismiss={() => removeToast(t.id)} />
      ))}

      {/* Back link */}
      <Link to="/content" className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary-hover font-medium">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Content
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">
            {isEditing ? 'Edit Content' : 'New Content'}
          </h1>
          <p className="text-text-secondary mt-1">
            {isEditing ? 'Update content details and metadata.' : 'Create a new content item.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => navigate('/content')}>
            Cancel
          </Button>
          <Button onClick={handleSave} loading={saving}>
            {isEditing ? 'Save Changes' : 'Create Content'}
          </Button>
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main fields */}
        <Card title="Content Details" className="lg:col-span-2">
          <div className="space-y-4">
            <Input
              label="Title"
              value={form.title}
              onChange={(e) => setField('title', e.target.value)}
              placeholder="Enter content title"
              error={validationErrors.title}
            />

            <Input
              label="Slug"
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                setField('slug', e.target.value);
              }}
              placeholder="auto-generated-from-title"
              hint={!isEditing && !slugTouched ? 'Auto-generated from title' : undefined}
              error={validationErrors.slug}
            />

            <TextArea
              label="Body"
              value={form.body}
              onChange={(e) => setField('body', e.target.value)}
              placeholder="Write the content body here..."
              rows={8}
            />

            <Input
              label="Mood"
              value={form.mood}
              onChange={(e) => setField('mood', e.target.value)}
              placeholder="e.g. happy, calm, energetic"
            />
          </div>
        </Card>

        {/* Sidebar fields */}
        <div className="space-y-6">
          <Card title="Classification">
            <div className="space-y-4">
              <Select
                label="Type"
                options={TYPE_OPTIONS}
                value={form.type}
                onChange={(e) => setField('type', e.target.value)}
                error={validationErrors.type}
              />

              <Select
                label="Status"
                options={STATUS_OPTIONS}
                value={form.status}
                onChange={(e) => setField('status', e.target.value)}
              />

              <Select
                label="Age Group"
                options={AGE_GROUP_OPTIONS}
                value={form.ageGroup}
                onChange={(e) => setField('ageGroup', e.target.value)}
                error={validationErrors.ageGroup}
              />

              <Select
                label="Difficulty"
                options={DIFFICULTY_OPTIONS}
                value={form.difficulty}
                onChange={(e) => setField('difficulty', e.target.value)}
              />

              <Select
                label="Language"
                options={LANGUAGE_OPTIONS}
                value={form.language}
                onChange={(e) => setField('language', e.target.value)}
              />
            </div>
          </Card>

          <Card title="Options">
            <div className="space-y-4">
              <Toggle
                label="Featured"
                enabled={form.featured}
                onChange={(val) => setField('featured', val)}
              />
              <Toggle
                label="Bedtime Friendly"
                enabled={form.bedtimeFriendly}
                onChange={(val) => setField('bedtimeFriendly', val)}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
