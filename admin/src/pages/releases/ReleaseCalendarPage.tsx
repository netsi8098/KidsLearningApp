import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '../../hooks/useQuery';
import { useMutation } from '../../hooks/useMutation';
import { usePagination } from '../../hooks/usePagination';
import { api } from '../../lib/api';
import {
  Button,
  Modal,
  Input,
  TextArea,
  Tabs,
  DataTable,
  Pagination,
  StatusChip,
  LoadingState,
} from '../../components/ui';

interface Release {
  id: string;
  title: string;
  scheduledDate: string;
  status: 'draft' | 'in_review' | 'approved' | 'published' | 'archived';
  contentCount: number;
  creator: string;
}

interface ReleaseListResponse {
  data: Release[];
  total: number;
  page: number;
  pageSize: number;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getMonthData(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return { firstDay, daysInMonth };
}

function formatMonthYear(year: number, month: number) {
  return new Date(year, month).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

export function ReleaseCalendarPage() {
  const navigate = useNavigate();
  const now = new Date();
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [activeTab, setActiveTab] = useState('calendar');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formDescription, setFormDescription] = useState('');

  const { page, limit, setPage } = usePagination({ initialLimit: 20 });

  const queryParams = useMemo(
    () => ({ page, pageSize: limit }),
    [page, limit],
  );

  const { data, loading, error, refetch } = useQuery<ReleaseListResponse>(
    () => api.get('/releases', queryParams),
    [JSON.stringify(queryParams)],
  );

  const { mutate: createRelease, loading: creating } = useMutation<void, { title: string; scheduledDate: string; description: string }>(
    (vars) => api.post('/releases', vars),
    {
      onSuccess: () => {
        setShowScheduleModal(false);
        setFormTitle('');
        setFormDate('');
        setFormDescription('');
        refetch();
      },
    },
  );

  const items = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  // Build a set of dates that have releases for the calendar dot display
  const releaseDateSet = useMemo(() => {
    const set = new Set<string>();
    items.forEach((r) => {
      const d = new Date(r.scheduledDate);
      set.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
    });
    return set;
  }, [items]);

  const { firstDay, daysInMonth } = getMonthData(calYear, calMonth);
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  const prevMonth = useCallback(() => {
    setCalMonth((m) => {
      if (m === 0) { setCalYear((y) => y - 1); return 11; }
      return m - 1;
    });
  }, []);

  const nextMonth = useCallback(() => {
    setCalMonth((m) => {
      if (m === 11) { setCalYear((y) => y + 1); return 0; }
      return m + 1;
    });
  }, []);

  const handleScheduleSubmit = useCallback(() => {
    if (!formTitle.trim() || !formDate) return;
    createRelease({ title: formTitle.trim(), scheduledDate: formDate, description: formDescription.trim() });
  }, [formTitle, formDate, formDescription, createRelease]);

  const tabs = useMemo(
    () => [
      { key: 'calendar', label: 'Calendar' },
      { key: 'list', label: 'List' },
    ],
    [],
  );

  const columns = useMemo(
    () => [
      {
        key: 'title',
        header: 'Title',
        render: (item: Release) => (
          <span className="font-medium text-text">{item.title}</span>
        ),
      },
      {
        key: 'scheduledDate',
        header: 'Scheduled Date',
        render: (item: Release) => (
          <span className="text-sm text-text-secondary">
            {new Date(item.scheduledDate).toLocaleDateString()}
          </span>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        render: (item: Release) => <StatusChip status={item.status} />,
      },
      {
        key: 'contentCount',
        header: 'Content Items',
        render: (item: Release) => (
          <span className="text-sm text-text-secondary">{item.contentCount}</span>
        ),
      },
      {
        key: 'creator',
        header: 'Creator',
        render: (item: Release) => (
          <span className="text-sm text-text-secondary">{item.creator}</span>
        ),
      },
    ],
    [],
  );

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-danger/10 border border-danger/20 rounded-lg p-4 text-danger text-sm">
          Failed to load releases: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Release Calendar</h1>
          <p className="text-text-secondary mt-1">
            Schedule and manage content releases.
          </p>
        </div>
        <Button onClick={() => setShowScheduleModal(true)}>Schedule Release</Button>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeKey={activeTab} onChange={setActiveTab} />

      {/* Calendar view */}
      {activeTab === 'calendar' && (
        <div className="bg-surface border border-border rounded-lg p-5">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={prevMonth}
              className="p-1.5 text-text-secondary hover:text-text hover:bg-bg rounded transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-lg font-semibold text-text">
              {formatMonthYear(calYear, calMonth)}
            </h2>
            <button
              onClick={nextMonth}
              className="p-1.5 text-text-secondary hover:text-text hover:bg-bg rounded transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-xs font-medium text-text-muted py-2">
                {d}
              </div>
            ))}
          </div>

          {/* Date grid */}
          <div className="grid grid-cols-7 border-t border-l border-border">
            {Array.from({ length: totalCells }).map((_, idx) => {
              const dayNum = idx - firstDay + 1;
              const isCurrentMonth = dayNum >= 1 && dayNum <= daysInMonth;
              const dateKey = `${calYear}-${calMonth}-${dayNum}`;
              const hasRelease = isCurrentMonth && releaseDateSet.has(dateKey);
              const isToday =
                isCurrentMonth &&
                dayNum === now.getDate() &&
                calMonth === now.getMonth() &&
                calYear === now.getFullYear();

              return (
                <div
                  key={idx}
                  className={`min-h-[60px] border-r border-b border-border p-1.5 text-sm
                    ${isCurrentMonth ? 'bg-surface' : 'bg-bg/50'}`}
                >
                  {isCurrentMonth && (
                    <>
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs
                          ${isToday ? 'bg-primary text-white font-semibold' : 'text-text-secondary'}`}
                      >
                        {dayNum}
                      </span>
                      {hasRelease && (
                        <div className="flex gap-1 mt-1">
                          <span className="w-2 h-2 rounded-full bg-primary" />
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* List view */}
      {activeTab === 'list' && (
        <>
          {loading && !data ? (
            <LoadingState message="Loading releases..." />
          ) : (
            <DataTable
              columns={columns}
              data={items}
              loading={loading}
              emptyMessage="No releases scheduled yet."
              onRowClick={(item) => navigate(`/releases/${item.id}`)}
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

      {/* Schedule Release Modal */}
      <Modal
        open={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        title="Schedule Release"
      >
        <div className="space-y-4">
          <Input
            label="Release Title"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            placeholder="e.g., Week 12 Content Drop"
          />
          <Input
            label="Scheduled Date"
            type="date"
            value={formDate}
            onChange={(e) => setFormDate(e.target.value)}
          />
          <TextArea
            label="Description (optional)"
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            placeholder="Notes about this release..."
            rows={3}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowScheduleModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleScheduleSubmit}
              loading={creating}
              disabled={!formTitle.trim() || !formDate}
            >
              Schedule
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
