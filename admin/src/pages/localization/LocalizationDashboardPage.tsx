import { useMemo, useState } from 'react';
import { useQuery } from '../../hooks/useQuery';
import { usePagination } from '../../hooks/usePagination';
import { api } from '../../lib/api';
import {
  Button,
  StatsCard,
  Card,
  DataTable,
  Pagination,
  Modal,
  Input,
  Select,
  TextArea,
  LoadingState,
  Badge,
} from '../../components/ui';

interface CoverageCell {
  count: number;
  percentage: number;
}

interface CoverageRow {
  contentType: string;
  locales: Record<string, CoverageCell>;
}

interface TranslationItem {
  id: string;
  contentTitle: string;
  locale: string;
  field: string;
  status: string;
  translator: string;
}

interface LocalizationStatus {
  totalTranslations: number;
  coveragePercent: number;
  languagesActive: number;
  pendingReview: number;
  coverage: CoverageRow[];
  translations: {
    data: TranslationItem[];
    total: number;
  };
}

const LOCALES = ['en', 'am', 'ti'];
const LOCALE_LABELS: Record<string, string> = {
  en: 'English',
  am: 'Amharic',
  ti: 'Tigrinya',
};

const LOCALE_OPTIONS = [
  { value: '', label: 'Select Locale' },
  { value: 'am', label: 'Amharic' },
  { value: 'ti', label: 'Tigrinya' },
];

function getCoverageColor(percentage: number): string {
  if (percentage >= 80) return 'bg-success/15 text-success';
  if (percentage >= 50) return 'bg-warning/15 text-warning';
  return 'bg-danger/15 text-danger';
}

export function LocalizationDashboardPage() {
  const { page, limit, setPage } = usePagination({ initialLimit: 10 });
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTranslation, setSelectedTranslation] = useState<TranslationItem | null>(null);
  const [translatedText, setTranslatedText] = useState('');

  // Form state for "Add Translation" modal
  const [formContentTitle, setFormContentTitle] = useState('');
  const [formLocale, setFormLocale] = useState('');
  const [formField, setFormField] = useState('');
  const [formTranslation, setFormTranslation] = useState('');

  const queryParams = useMemo(() => ({ page, pageSize: limit }), [page, limit]);

  const { data, loading, error } = useQuery<LocalizationStatus>(
    () => api.get('/localization/status', queryParams),
    [JSON.stringify(queryParams)],
  );

  const coverage = data?.coverage ?? [];
  const translations = data?.translations?.data ?? [];
  const total = data?.translations?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  const columns = useMemo(
    () => [
      {
        key: 'contentTitle',
        header: 'Content Title',
        render: (item: TranslationItem) => (
          <span className="font-medium text-text">{item.contentTitle}</span>
        ),
      },
      {
        key: 'locale',
        header: 'Locale',
        render: (item: TranslationItem) => (
          <Badge variant="info">{LOCALE_LABELS[item.locale] ?? item.locale}</Badge>
        ),
      },
      {
        key: 'field',
        header: 'Field',
        render: (item: TranslationItem) => (
          <span className="text-sm text-text-secondary">{item.field}</span>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        render: (item: TranslationItem) => {
          const variant =
            item.status === 'completed' ? 'success' :
            item.status === 'in_progress' ? 'warning' :
            'default';
          return <Badge variant={variant}>{item.status.replace('_', ' ')}</Badge>;
        },
      },
      {
        key: 'translator',
        header: 'Translator',
        render: (item: TranslationItem) => (
          <span className="text-sm text-text-secondary">{item.translator || '--'}</span>
        ),
      },
    ],
    [],
  );

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-danger/10 border border-danger/20 rounded-lg p-4 text-danger text-sm">
          Failed to load localization data: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Localization</h1>
          <p className="text-text-secondary mt-1">
            Manage translations and language coverage.
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>Add Translation</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Translations" value={data?.totalTranslations ?? '--'} />
        <StatsCard title="Coverage" value={data ? `${data.coveragePercent}%` : '--'} />
        <StatsCard title="Languages Active" value={data?.languagesActive ?? '--'} />
        <StatsCard title="Pending Review" value={data?.pendingReview ?? '--'} />
      </div>

      {/* Coverage Matrix */}
      <Card title="Coverage Matrix" padding={false}>
        {loading && !data ? (
          <div className="p-5">
            <LoadingState message="Loading coverage..." size="sm" />
          </div>
        ) : coverage.length === 0 ? (
          <div className="p-5">
            <p className="text-sm text-text-muted text-center py-4">No coverage data available.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-bg border-b border-border">
                  <th className="px-5 py-3 text-left font-medium text-text-secondary">Content Type</th>
                  {LOCALES.map((locale) => (
                    <th key={locale} className="px-5 py-3 text-center font-medium text-text-secondary">
                      {LOCALE_LABELS[locale]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {coverage.map((row) => (
                  <tr key={row.contentType}>
                    <td className="px-5 py-3 font-medium text-text">{row.contentType}</td>
                    {LOCALES.map((locale) => {
                      const cell = row.locales[locale];
                      if (!cell) {
                        return (
                          <td key={locale} className="px-5 py-3 text-center text-text-muted">--</td>
                        );
                      }
                      return (
                        <td key={locale} className="px-5 py-3 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCoverageColor(cell.percentage)}`}
                          >
                            {cell.percentage}% ({cell.count})
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Translation Queue */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-text">Translation Queue</h2>
        {loading && !data ? (
          <LoadingState message="Loading translations..." />
        ) : (
          <DataTable
            columns={columns}
            data={translations}
            loading={loading}
            emptyMessage="No pending translations."
            onRowClick={(item) => {
              setSelectedTranslation(item);
              setTranslatedText('');
            }}
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
      </div>

      {/* Side-by-side editor */}
      {selectedTranslation && (
        <Card title={`Translate: ${selectedTranslation.contentTitle} - ${selectedTranslation.field}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Original */}
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Original (English)
              </label>
              <div className="w-full px-3 py-2 text-sm text-text bg-bg border border-border rounded-md min-h-[100px]">
                {selectedTranslation.contentTitle} -- original {selectedTranslation.field} content placeholder
              </div>
            </div>
            {/* Translation */}
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Translation ({LOCALE_LABELS[selectedTranslation.locale] ?? selectedTranslation.locale})
              </label>
              <TextArea
                value={translatedText}
                onChange={(e) => setTranslatedText(e.target.value)}
                placeholder={`Enter ${LOCALE_LABELS[selectedTranslation.locale] ?? selectedTranslation.locale} translation...`}
                rows={4}
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 mt-4">
            <Button variant="secondary" onClick={() => setSelectedTranslation(null)}>
              Cancel
            </Button>
            <Button disabled={!translatedText.trim()}>
              Save Translation
            </Button>
          </div>
        </Card>
      )}

      {/* Add Translation Modal */}
      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Translation"
      >
        <div className="space-y-4">
          <Input
            label="Content Title"
            value={formContentTitle}
            onChange={(e) => setFormContentTitle(e.target.value)}
            placeholder="e.g., Alphabet Song"
          />
          <Select
            label="Target Locale"
            options={LOCALE_OPTIONS}
            value={formLocale}
            onChange={(e) => setFormLocale(e.target.value)}
          />
          <Input
            label="Field"
            value={formField}
            onChange={(e) => setFormField(e.target.value)}
            placeholder="e.g., title, description, body"
          />
          <TextArea
            label="Translation"
            value={formTranslation}
            onChange={(e) => setFormTranslation(e.target.value)}
            placeholder="Enter the translated text..."
            rows={4}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button
              disabled={!formContentTitle.trim() || !formLocale || !formField.trim() || !formTranslation.trim()}
            >
              Add Translation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
