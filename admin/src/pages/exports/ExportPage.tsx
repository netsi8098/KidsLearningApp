import { useMemo, useState } from 'react';
import { useQuery } from '../../hooks/useQuery';
import { useMutation } from '../../hooks/useMutation';
import { usePagination } from '../../hooks/usePagination';
import { useToast } from '../../hooks/useToast';
import { api } from '../../lib/api';
import {
  Badge,
  Button,
  Card,
  DataTable,
  LoadingState,
  Pagination,
  SearchInput,
  Select,
  StatusChip,
  Tabs,
  TextArea,
} from '../../components/ui';

/* ─── Types ─── */

type ExportType = 'households' | 'profiles' | 'catalog' | 'events' | 'subscriptions' | 'releases' | 'experiments' | 'analytics';
type ExportFormat = 'csv' | 'json';
type ExportStatus = 'pending' | 'processing' | 'completed' | 'failed';

interface ExportJob {
  id: string;
  type: ExportType;
  format: ExportFormat;
  status: ExportStatus;
  rowCount: number | null;
  requestedBy: string;
  createdAt: string;
  downloadUrl: string | null;
}

interface ExportsResponse {
  data: ExportJob[];
  total: number;
  page: number;
  pageSize: number;
}

interface DictionaryField {
  name: string;
  type: string;
  description: string;
  exportType: string;
}

/* ─── Constants ─── */

const TYPE_OPTIONS = [
  { value: 'households', label: 'Households' },
  { value: 'profiles', label: 'Profiles' },
  { value: 'catalog', label: 'Catalog' },
  { value: 'events', label: 'Events' },
  { value: 'subscriptions', label: 'Subscriptions' },
  { value: 'releases', label: 'Releases' },
  { value: 'experiments', label: 'Experiments' },
  { value: 'analytics', label: 'Analytics' },
];

const FORMAT_OPTIONS = [
  { value: 'csv', label: 'CSV' },
  { value: 'json', label: 'JSON' },
];

const STATUS_MAP: Record<ExportStatus, 'draft' | 'published' | 'in_review' | 'approved'> = {
  pending: 'draft',
  processing: 'in_review',
  completed: 'approved',
  failed: 'draft',
};

const TAB_ITEMS = [
  { key: 'create', label: 'Create Export' },
  { key: 'history', label: 'Job History' },
  { key: 'dictionary', label: 'Data Dictionary' },
];

/* ─── Component ─── */

export function ExportPage() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('create');
  const { page, limit, setPage } = usePagination({ initialLimit: 20 });

  // Create form state
  const [exportType, setExportType] = useState<string>('households');
  const [exportFormat, setExportFormat] = useState<string>('csv');
  const [exportFilters, setExportFilters] = useState('{}');

  // Dictionary search
  const [dictSearch, setDictSearch] = useState('');

  // Job history
  const { data: historyData, loading: historyLoading, refetch } = useQuery<ExportsResponse>(
    () => api.get('/exports', { page, pageSize: limit }),
    [page, limit],
  );

  // Data dictionary
  const { data: dictionary, loading: dictLoading } = useQuery<DictionaryField[]>(
    () => api.get('/exports/dictionary'),
    [],
  );

  // Create export
  const { mutate: createExport, loading: creating } = useMutation<
    ExportJob,
    { type: string; format: string; filters: string }
  >(
    (vars) => api.post('/exports', vars),
    {
      onSuccess: () => {
        toast.success('Export job created');
        setActiveTab('history');
        refetch();
      },
    },
  );

  const historyItems = historyData?.data ?? [];
  const total = historyData?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  const historyColumns = useMemo(
    () => [
      {
        key: 'type',
        header: 'Type',
        render: (item: ExportJob) => (
          <Badge variant="primary">{item.type}</Badge>
        ),
      },
      {
        key: 'format',
        header: 'Format',
        render: (item: ExportJob) => (
          <span className="text-sm text-text uppercase">{item.format}</span>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        render: (item: ExportJob) => (
          <StatusChip status={STATUS_MAP[item.status]} />
        ),
      },
      {
        key: 'rowCount',
        header: 'Rows',
        render: (item: ExportJob) => (
          <span className="text-sm text-text">{item.rowCount ?? '--'}</span>
        ),
      },
      {
        key: 'requestedBy',
        header: 'Requested By',
        render: (item: ExportJob) => (
          <span className="text-sm text-text-secondary">{item.requestedBy}</span>
        ),
      },
      {
        key: 'createdAt',
        header: 'Created',
        render: (item: ExportJob) => (
          <span className="text-sm text-text-secondary">
            {new Date(item.createdAt).toLocaleString()}
          </span>
        ),
      },
      {
        key: 'download',
        header: 'Download',
        render: (item: ExportJob) =>
          item.downloadUrl ? (
            <a
              href={item.downloadUrl}
              className="text-sm text-primary hover:text-primary-hover font-medium"
              target="_blank"
              rel="noopener noreferrer"
            >
              Download
            </a>
          ) : (
            <span className="text-sm text-text-muted">--</span>
          ),
      },
    ],
    [],
  );

  const filteredDictionary = useMemo(() => {
    if (!dictionary) return [];
    if (!dictSearch.trim()) return dictionary;
    const q = dictSearch.toLowerCase();
    return dictionary.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q) ||
        f.exportType.toLowerCase().includes(q),
    );
  }, [dictionary, dictSearch]);

  const dictColumns = useMemo(
    () => [
      {
        key: 'name',
        header: 'Field',
        render: (item: DictionaryField) => (
          <span className="font-mono text-sm text-text">{item.name}</span>
        ),
      },
      {
        key: 'type',
        header: 'Type',
        render: (item: DictionaryField) => (
          <Badge variant="default">{item.type}</Badge>
        ),
      },
      {
        key: 'exportType',
        header: 'Export Type',
        render: (item: DictionaryField) => (
          <Badge variant="info">{item.exportType}</Badge>
        ),
      },
      {
        key: 'description',
        header: 'Description',
        render: (item: DictionaryField) => (
          <span className="text-sm text-text-secondary">{item.description}</span>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text">Exports</h1>
        <p className="text-text-secondary mt-1">Build and download data exports.</p>
      </div>

      {/* Tabs */}
      <Tabs tabs={TAB_ITEMS} activeKey={activeTab} onChange={setActiveTab} />

      {/* Create Export Tab */}
      {activeTab === 'create' && (
        <Card>
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-text">Create Export</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Export Type"
                options={TYPE_OPTIONS}
                value={exportType}
                onChange={(e) => setExportType(e.target.value)}
              />
              <Select
                label="Format"
                options={FORMAT_OPTIONS}
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
              />
            </div>
            <TextArea
              label="Filters (JSON)"
              value={exportFilters}
              onChange={(e) => setExportFilters(e.target.value)}
              rows={4}
              hint="Optional JSON filter object to narrow down exported data."
            />
            <Button
              loading={creating}
              onClick={() =>
                createExport({ type: exportType, format: exportFormat, filters: exportFilters })
              }
            >
              Start Export
            </Button>
          </div>
        </Card>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <>
          {historyLoading && !historyData ? (
            <LoadingState message="Loading export history..." />
          ) : (
            <DataTable
              columns={historyColumns}
              data={historyItems}
              loading={historyLoading}
              emptyMessage="No export jobs found."
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
        </>
      )}

      {/* Data Dictionary Tab */}
      {activeTab === 'dictionary' && (
        <>
          <SearchInput
            value={dictSearch}
            onChange={setDictSearch}
            placeholder="Search fields..."
            className="max-w-sm"
          />
          {dictLoading ? (
            <LoadingState message="Loading data dictionary..." />
          ) : (
            <DataTable
              columns={dictColumns}
              data={filteredDictionary}
              loading={dictLoading}
              emptyMessage="No fields match your search."
            />
          )}
        </>
      )}
    </div>
  );
}
